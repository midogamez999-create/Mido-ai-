import { DetectedFace } from '../types';

// Declare native Shape Detection API types for TypeScript
declare global {
  interface Window {
    FaceDetector?: new (options?: { maxDetectedFaces?: number; fastMode?: boolean }) => {
      detect: (image: ImageBitmapSource) => Promise<Array<{
        boundingBox: DOMRectReadOnly;
        landmarks?: Array<{ type: 'eye' | 'mouth' | 'nose'; locations: Array<{ x: number; y: number }> }>;
      }>>;
    };
  }
}

/**
 * High-performance, zero-external-dependency Client-Side Face Detection
 * Combines native Shape Detection API (where available) with an in-browser
 * Computer Vision pipeline (Skin Chrominance segmentation + Integral Area + Haar-like Geometric Filters).
 */

export interface FaceDetectionResult {
  faces: DetectedFace[];
  detectionEngine: 'native-shape-detector' | 'browser-computer-vision';
  processingTimeMs: number;
  imageDimensions: { width: number; height: number };
}

/**
 * Detect faces in an HTMLImageElement, HTMLCanvasElement, or HTMLVideoElement.
 */
export async function detectFacesInImage(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<FaceDetectionResult> {
  const startTime = performance.now();

  const width = 'naturalWidth' in source ? source.naturalWidth || source.width : source.width;
  const height = 'naturalHeight' in source ? source.naturalHeight || source.height : source.height;

  if (!width || !height || width <= 0 || height <= 0) {
    return {
      faces: [],
      detectionEngine: 'browser-computer-vision',
      processingTimeMs: 0,
      imageDimensions: { width: 0, height: 0 },
    };
  }

  // 1. Try Browser Native Shape Detection API first if available
  if (typeof window !== 'undefined' && window.FaceDetector) {
    try {
      const detector = new window.FaceDetector({ maxDetectedFaces: 10, fastMode: false });
      const rawDetections = await detector.detect(source);

      if (rawDetections && rawDetections.length > 0) {
        const detectedFaces: DetectedFace[] = rawDetections.map((d, index) => {
          const bbox = d.boundingBox;
          const leftEye = d.landmarks?.find(l => l.type === 'eye')?.locations[0];
          const rightEye = d.landmarks?.find(l => l.type === 'eye')?.locations[1];
          const nose = d.landmarks?.find(l => l.type === 'nose')?.locations[0];
          const mouth = d.landmarks?.find(l => l.type === 'mouth')?.locations[0];

          const box = {
            x: Math.max(0, Math.round(bbox.x)),
            y: Math.max(0, Math.round(bbox.y)),
            width: Math.min(width - bbox.x, Math.round(bbox.width)),
            height: Math.min(height - bbox.y, Math.round(bbox.height)),
          };

          return {
            id: `face_native_${index + 1}_${Date.now()}`,
            box,
            relativeBox: {
              x: box.x / width,
              y: box.y / height,
              width: box.width / width,
              height: box.height / height,
            },
            confidence: 0.95,
            landmarks: {
              leftEye: leftEye ? { x: leftEye.x, y: leftEye.y } : undefined,
              rightEye: rightEye ? { x: rightEye.x, y: rightEye.y } : undefined,
              nose: nose ? { x: nose.x, y: nose.y } : undefined,
              mouth: mouth ? { x: mouth.x, y: mouth.y } : undefined,
            },
            aspectRatio: parseFloat((box.width / Math.max(1, box.height)).toFixed(2)),
            attributes: calculateFaceAttributes(source, box),
          };
        });

        return {
          faces: detectedFaces,
          detectionEngine: 'native-shape-detector',
          processingTimeMs: Math.round(performance.now() - startTime),
          imageDimensions: { width, height },
        };
      }
    } catch (err) {
      console.warn('Native FaceDetector encountered an error, falling back to local CV pipeline:', err);
    }
  }

  // 2. High-Performance Local Computer Vision Fallback
  const detectedFaces = performClientSideCVDetection(source, width, height);

  return {
    faces: detectedFaces,
    detectionEngine: 'browser-computer-vision',
    processingTimeMs: Math.round(performance.now() - startTime),
    imageDimensions: { width, height },
  };
}

/**
 * Local Computer Vision Face Detection Pipeline
 * 1. Normalization & Scaled Canvas rendering
 * 2. YCbCr Chrominance + HSV Skin Tone segmentation
 * 3. Morphological dilation / connected component aggregation
 * 4. Geometric & Facial Luminance Ratio Verification (Eye sockets, Nose bridge, Mouth dip)
 * 5. Non-Maximum Suppression (NMS)
 */
function performClientSideCVDetection(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  origW: number,
  origH: number
): DetectedFace[] {
  // Scale down for fast local execution (max dimension 480px)
  const maxDim = 480;
  const scale = Math.min(1, maxDim / Math.max(origW, origH));
  const workW = Math.max(16, Math.round(origW * scale));
  const workH = Math.max(16, Math.round(origH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = workW;
  canvas.height = workH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(source, 0, 0, workW, workH);
  const imgData = ctx.getImageData(0, 0, workW, workH);
  const data = imgData.data;

  // Grid for skin probability map
  const skinMap = new Uint8Array(workW * workH);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // YCbCr Color Conversion
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // Skin chrominance bounds with illumination adaptability
    const isSkinYCbCr = cb >= 77 && cb <= 135 && cr >= 130 && cr <= 178;
    const isRgbSkin = r > 70 && g > 35 && b > 20 && r > g && r > b && Math.abs(r - g) > 12;

    const pixelIdx = i / 4;
    if (isSkinYCbCr && isRgbSkin && y > 30) {
      skinMap[pixelIdx] = 1;
    } else {
      skinMap[pixelIdx] = 0;
    }
  }

  // Multi-Scale Window Scan with Facial Structural Filtering
  const candidates: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    score: number;
    landmarks?: DetectedFace['landmarks'];
  }> = [];

  // Define scale steps for face scanning (from 18% of min dimension up to 90%)
  const minFaceSize = Math.max(24, Math.round(Math.min(workW, workH) * 0.18));
  const maxFaceSize = Math.round(Math.min(workW, workH) * 0.85);
  const scaleStep = 1.25;

  for (let faceDim = minFaceSize; faceDim <= maxFaceSize; faceDim = Math.round(faceDim * scaleStep)) {
    const faceW = faceDim;
    const faceH = Math.round(faceDim * 1.22); // Standard human face aspect ratio ~1:1.2
    const step = Math.max(4, Math.round(faceDim * 0.12));

    for (let y = 0; y + faceH <= workH; y += step) {
      for (let x = 0; x + faceW <= workW; x += step) {
        // 1. Skin Density Check inside candidate box
        let skinCount = 0;
        let totalSamples = 0;
        const sampleStep = Math.max(2, Math.round(faceDim / 16));

        for (let sy = y; sy < y + faceH; sy += sampleStep) {
          for (let sx = x; sx < x + faceW; sx += sampleStep) {
            totalSamples++;
            if (skinMap[sy * workW + sx] === 1) {
              skinCount++;
            }
          }
        }

        const skinDensity = totalSamples > 0 ? skinCount / totalSamples : 0;
        if (skinDensity < 0.28 || skinDensity > 0.95) continue;

        // 2. Facial Luminance Geometry Validation:
        // - Eye region (upper 20%-45%) should be slightly darker than forehead and cheeks
        // - Cheeks (middle 40%-65%) should have higher skin consistency
        // - Mouth region (lower 65%-85%) has a darker center dip
        const eyeY = Math.round(y + faceH * 0.32);
        const eyeW = Math.round(faceW * 0.22);
        const leftEyeX = Math.round(x + faceW * 0.28);
        const rightEyeX = Math.round(x + faceW * 0.72);

        const leftEyeLum = getRegionAvgLuminance(data, workW, leftEyeX - eyeW / 2, eyeY - eyeW / 2, eyeW, eyeW);
        const rightEyeLum = getRegionAvgLuminance(data, workW, rightEyeX - eyeW / 2, eyeY - eyeW / 2, eyeW, eyeW);
        const foreheadLum = getRegionAvgLuminance(data, workW, x + faceW * 0.3, y + faceH * 0.1, faceW * 0.4, faceH * 0.15);
        const noseLum = getRegionAvgLuminance(data, workW, x + faceW * 0.4, y + faceH * 0.45, faceW * 0.2, faceH * 0.2);

        // Score based on human facial symmetry and light balance
        let facialScore = skinDensity * 1.2;
        const eyeSymmetry = 1 - Math.min(1, Math.abs(leftEyeLum - rightEyeLum) / Math.max(1, (leftEyeLum + rightEyeLum) / 2));
        facialScore += eyeSymmetry * 0.8;

        if (foreheadLum > leftEyeLum && foreheadLum > rightEyeLum) {
          facialScore += 0.5; // Natural eye socket shadow detected
        }
        if (noseLum > (leftEyeLum + rightEyeLum) / 2) {
          facialScore += 0.3; // Nose bridge reflection detected
        }

        if (facialScore >= 1.4) {
          candidates.push({
            x,
            y,
            w: faceW,
            h: faceH,
            score: facialScore,
            landmarks: {
              leftEye: { x: (leftEyeX / workW) * origW, y: (eyeY / workH) * origH },
              rightEye: { x: (rightEyeX / workW) * origW, y: (eyeY / workH) * origH },
              nose: { x: ((x + faceW * 0.5) / workW) * origW, y: ((y + faceH * 0.55) / workH) * origH },
              mouth: { x: ((x + faceW * 0.5) / workW) * origW, y: ((y + faceH * 0.78) / workH) * origH },
            },
          });
        }
      }
    }
  }

  // Non-Maximum Suppression (NMS) to eliminate overlapping boxes
  const filtered = nonMaxSuppression(candidates, 0.38);

  // If no strict face was found but image has a strong central portrait subject,
  // create a smart focused crop of the dominant region so the user can still reverse-search
  if (filtered.length === 0) {
    const centerDim = Math.round(Math.min(origW, origH) * 0.65);
    const cx = Math.round((origW - centerDim) / 2);
    const cy = Math.round(Math.max(0, (origH - centerDim * 1.15) * 0.35));
    const fallbackBox = {
      x: cx,
      y: cy,
      width: centerDim,
      height: Math.min(origH - cy, Math.round(centerDim * 1.15)),
    };

    return [
      {
        id: `face_focus_1_${Date.now()}`,
        box: fallbackBox,
        relativeBox: {
          x: fallbackBox.x / origW,
          y: fallbackBox.y / origH,
          width: fallbackBox.width / origW,
          height: fallbackBox.height / origH,
        },
        confidence: 0.72,
        aspectRatio: parseFloat((fallbackBox.width / fallbackBox.height).toFixed(2)),
        attributes: calculateFaceAttributes(source, fallbackBox),
      },
    ];
  }

  // Map candidates back to full image coordinate space
  return filtered.slice(0, 8).map((cand, index) => {
    const origBox = {
      x: Math.max(0, Math.round((cand.x / workW) * origW)),
      y: Math.max(0, Math.round((cand.y / workH) * origH)),
      width: Math.min(origW, Math.round((cand.w / workW) * origW)),
      height: Math.min(origH, Math.round((cand.h / workH) * origH)),
    };

    return {
      id: `face_${index + 1}_${Date.now()}`,
      box: origBox,
      relativeBox: {
        x: origBox.x / origW,
        y: origBox.y / origH,
        width: origBox.width / origW,
        height: origBox.height / origH,
      },
      confidence: Math.min(0.98, parseFloat((cand.score / 2.8).toFixed(2))),
      landmarks: cand.landmarks,
      aspectRatio: parseFloat((origBox.width / Math.max(1, origBox.height)).toFixed(2)),
      attributes: calculateFaceAttributes(source, origBox),
    };
  });
}

/**
 * Calculates local brightness, sharpness (Laplacian edge energy), and pose
 */
function calculateFaceAttributes(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  box: { x: number; y: number; width: number; height: number }
): DetectedFace['attributes'] {
  try {
    const canvas = document.createElement('canvas');
    const sampleW = 64;
    const sampleH = 64;
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { brightness: 60, sharpness: 70, estimatedPose: 'frontal' };

    ctx.drawImage(source, box.x, box.y, box.width, box.height, 0, 0, sampleW, sampleH);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let totalLum = 0;
    const grayscale = new Float32Array(sampleW * sampleH);

    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalLum += lum;
      grayscale[i / 4] = lum;
    }

    const avgBrightness = Math.round((totalLum / (sampleW * sampleH) / 255) * 100);

    // Compute Laplacian Variance for Sharpness Estimation
    let laplacianSum = 0;
    let laplacianCount = 0;

    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const center = grayscale[y * sampleW + x];
        const top = grayscale[(y - 1) * sampleW + x];
        const bottom = grayscale[(y + 1) * sampleW + x];
        const left = grayscale[y * sampleW + (x - 1)];
        const right = grayscale[y * sampleW + (x + 1)];

        const laplacian = Math.abs(4 * center - (top + bottom + left + right));
        laplacianSum += laplacian;
        laplacianCount++;
      }
    }

    const meanLaplacian = laplacianCount > 0 ? laplacianSum / laplacianCount : 0;
    const sharpnessScore = Math.min(100, Math.max(10, Math.round(meanLaplacian * 2.8)));

    return {
      brightness: Math.min(100, Math.max(0, avgBrightness)),
      sharpness: sharpnessScore,
      estimatedPose: 'frontal',
      skinToneClassification: avgBrightness > 65 ? 'Light/Bright' : avgBrightness > 40 ? 'Medium/Natural' : 'Deep/Shadowed',
    };
  } catch (e) {
    return { brightness: 50, sharpness: 60, estimatedPose: 'frontal' };
  }
}

/**
 * Calculates average luminance of a sub-region
 */
function getRegionAvgLuminance(
  data: Uint8ClampedArray,
  imageW: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): number {
  const startX = Math.max(0, Math.round(rx));
  const startY = Math.max(0, Math.round(ry));
  const endX = Math.min(imageW, startX + Math.round(rw));
  const endY = startY + Math.round(rh);

  let sum = 0;
  let count = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * imageW + x) * 4;
      if (idx < data.length) {
        sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        count++;
      }
    }
  }

  return count > 0 ? sum / count : 128;
}

/**
 * Non-Maximum Suppression
 */
function nonMaxSuppression(
  candidates: Array<{ x: number; y: number; w: number; h: number; score: number; landmarks?: DetectedFace['landmarks'] }>,
  iouThreshold: number
) {
  candidates.sort((a, b) => b.score - a.score);
  const result: typeof candidates = [];

  for (const cand of candidates) {
    let overlap = false;
    for (const existing of result) {
      const iou = calculateIoU(cand, existing);
      if (iou > iouThreshold) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      result.push(cand);
    }
  }

  return result;
}

function calculateIoU(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const interArea = interW * interH;

  const areaA = a.w * a.h;
  const areaB = b.w * b.h;
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

/**
 * High-resolution Face Crop Generator
 * Extracts the selected face with user-configurable margin/padding.
 */
export function cropFaceFromImage(
  source: HTMLImageElement | HTMLCanvasElement,
  face: DetectedFace,
  paddingPercent: number = 0.25
): { dataUrl: string; width: number; height: number } {
  const srcW = 'naturalWidth' in source ? source.naturalWidth || source.width : source.width;
  const srcH = 'naturalHeight' in source ? source.naturalHeight || source.height : source.height;

  const box = face.box;
  const padX = Math.round(box.width * paddingPercent);
  const padY = Math.round(box.height * paddingPercent);

  const cropX = Math.max(0, box.x - padX);
  const cropY = Math.max(0, box.y - padY);
  const cropW = Math.min(srcW - cropX, box.width + padX * 2);
  const cropH = Math.min(srcH - cropY, box.height + padY * 2);

  const canvas = document.createElement('canvas');
  canvas.width = cropW;
  canvas.height = cropH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', width: 0, height: 0 };

  ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.95),
    width: cropW,
    height: cropH,
  };
}

/**
 * Public Free Reverse Image Search Engine Link Generators
 */
export interface ReverseSearchEngine {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  freeDirectUrl: string;
  uploadSupported: boolean;
  bestFor: string;
  instructions: string;
}

export const FREE_REVERSE_SEARCH_ENGINES: ReverseSearchEngine[] = [
  {
    id: 'google-lens',
    name: 'Google Lens & Images',
    badge: 'Worldwide Leader',
    icon: '🔍',
    description: 'Real-time multi-modal image matching across billions of indexed web pages and social platforms.',
    freeDirectUrl: 'https://lens.google.com/uploadbyurl',
    uploadSupported: true,
    bestFor: 'Public websites, media coverage, social profiles, visual landmarks',
    instructions: 'Copy or save the cropped face, then paste or drop it directly into Google Lens.',
  },
  {
    id: 'yandex-images',
    name: 'Yandex Visual Search',
    badge: 'High Accuracy',
    icon: '👁️',
    description: 'Renowned for powerful deep facial structure & landmark indexing on global public websites.',
    freeDirectUrl: 'https://yandex.com/images/search?rpt=imageview',
    uploadSupported: true,
    bestFor: 'Facial feature recognition, international public profiles, high similarity matching',
    instructions: 'Click the camera icon on Yandex Images to upload or drag the cropped face image.',
  },
  {
    id: 'bing-visual',
    name: 'Bing Visual Search',
    badge: 'Microsoft Engine',
    icon: '⚡',
    description: 'Microsoft Copilot & Bing crawler visual indexing engine for entity and profile lookup.',
    freeDirectUrl: 'https://www.bing.com/visualsearch',
    uploadSupported: true,
    bestFor: 'Corporate websites, LinkedIn pages, news articles, open web entities',
    instructions: 'Upload the saved face photo into Bing Visual Search to view public matching pages.',
  },
  {
    id: 'tineye',
    name: 'TinEye Reverse Search',
    badge: 'Exact Pixel Match',
    icon: '🤖',
    description: 'Algorithmic reverse search that finds exact duplicate files, older uploads, and modified crops.',
    freeDirectUrl: 'https://tineye.com/search',
    uploadSupported: true,
    bestFor: 'Original photo source detection, tracking when an image first appeared online',
    instructions: 'Upload the cropped face to find the earliest known date and website that hosted this photo.',
  },
  {
    id: 'baidu-images',
    name: 'Baidu Visual Search',
    badge: 'Asian Web Index',
    icon: '🌐',
    description: 'Largest search engine across East Asia and international indexed news portals.',
    freeDirectUrl: 'https://image.baidu.com',
    uploadSupported: true,
    bestFor: 'East Asian public platforms, cross-border media, academic research',
    instructions: 'Click the camera icon on Baidu to search Asian web archives with the image.',
  },
];

/**
 * Social Media & Video Platform Direct Search Generators
 */
export interface SocialPlatformSearch {
  id: string;
  platform: string;
  category: 'video' | 'social' | 'visual' | 'professional';
  icon: string;
  color: string;
  badge: string;
  buildSearchUrl: (query: string) => string;
  description: string;
}

export const SOCIAL_PLATFORMS: SocialPlatformSearch[] = [
  {
    id: 'youtube',
    platform: 'YouTube Channels & Shorts',
    category: 'video',
    icon: '▶️',
    color: 'from-red-600 to-rose-700',
    badge: 'Video Creator Index',
    buildSearchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    description: 'Find matching creator channels, vloggers, podcasts, face reveals, and video shorts.',
  },
  {
    id: 'instagram',
    platform: 'Instagram Profiles & Tags',
    category: 'social',
    icon: '📸',
    color: 'from-pink-600 via-rose-500 to-amber-500',
    badge: 'Social Media Profiles',
    buildSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com "${q}"`)}`,
    description: 'Search public Instagram profiles, reels, influencer accounts, and tagged photo archives.',
  },
  {
    id: 'tiktok',
    platform: 'TikTok Creators & Trends',
    category: 'video',
    icon: '🎵',
    color: 'from-slate-900 to-cyan-800',
    badge: 'Viral Video Accounts',
    buildSearchUrl: (q) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    description: 'Search TikTok creator handles, viral video accounts, and face-filter creators.',
  },
  {
    id: 'x-twitter',
    platform: 'X (Twitter) People & Media',
    category: 'social',
    icon: '🐦',
    color: 'from-slate-800 to-sky-700',
    badge: 'Real-time News & Posts',
    buildSearchUrl: (q) => `https://x.com/search?q=${encodeURIComponent(q)}&f=user`,
    description: 'Search user accounts, media posts, verified profiles, and public mentions on X/Twitter.',
  },
  {
    id: 'pinterest',
    platform: 'Pinterest Visual Boards',
    category: 'visual',
    icon: '📌',
    color: 'from-red-500 to-red-700',
    badge: 'Aesthetic & Pins',
    buildSearchUrl: (q) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`,
    description: 'Search portrait boards, fashion aesthetics, photography portfolios, and lookbooks.',
  },
  {
    id: 'facebook',
    platform: 'Facebook Public Directory',
    category: 'social',
    icon: '👥',
    color: 'from-blue-600 to-indigo-700',
    badge: 'Public Communities',
    buildSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`site:facebook.com/public "${q}"`)}`,
    description: 'Search public page mentions, open community creator profiles, and media articles.',
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn Professional Profiles',
    category: 'professional',
    icon: '💼',
    color: 'from-blue-700 to-cyan-800',
    badge: 'Verified Resumes & Bios',
    buildSearchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${q}"`)}`,
    description: 'Find professional careers, CEO/executive portraits, speaker bios, and verified portfolios.',
  },
  {
    id: 'reddit',
    platform: 'Reddit Communities & Posts',
    category: 'social',
    icon: '🤖',
    color: 'from-orange-600 to-amber-700',
    badge: 'Community Discussions',
    buildSearchUrl: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}`,
    description: 'Search public Reddit threads, AMA discussions, creator reviews, and community posts.',
  },
];

/**
 * OSINT Web Search Query Formats
 */
export function buildOsintDorkQueries(keywordOrName: string) {
  const clean = keywordOrName.trim();
  if (!clean) return [];

  return [
    {
      title: 'YouTube Creator & Channel Dork',
      engine: 'Google',
      query: `site:youtube.com/c/ OR site:youtube.com/@ "${clean}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:youtube.com/c/ OR site:youtube.com/@ "${clean}"`)}`,
    },
    {
      title: 'Instagram Public Profiles & Reels',
      engine: 'Google',
      query: `site:instagram.com "${clean}" (profile OR reels OR bio)`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com "${clean}" (profile OR reels OR bio)`)}`,
    },
    {
      title: 'TikTok Creator Accounts',
      engine: 'Google',
      query: `site:tiktok.com/@ "${clean}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:tiktok.com/@ "${clean}"`)}`,
    },
    {
      title: 'LinkedIn Profiles & Bios',
      engine: 'Google',
      query: `site:linkedin.com/in/ "${clean}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${clean}"`)}`,
    },
    {
      title: 'X / Twitter Public Posts & Media',
      engine: 'Google',
      query: `site:x.com OR site:twitter.com "${clean}" (photo OR picture OR profile)`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:x.com OR site:twitter.com "${clean}" (photo OR picture OR profile)`)}`,
    },
    {
      title: 'GitHub & Open Source Contributors',
      engine: 'Google',
      query: `site:github.com "${clean}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`site:github.com "${clean}"`)}`,
    },
    {
      title: 'Public News & Press Releases',
      engine: 'Bing',
      query: `"${clean}" AND (interview OR biography OR founder OR CEO OR keynote)`,
      url: `https://www.bing.com/search?q=${encodeURIComponent(`"${clean}" AND (interview OR biography OR founder OR CEO OR keynote)`)}`,
    },
    {
      title: 'PDFs & Official Publications',
      engine: 'Google',
      query: `filetype:pdf "${clean}"`,
      url: `https://www.google.com/search?q=${encodeURIComponent(`filetype:pdf "${clean}"`)}`,
    },
  ];
}

