import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  Camera,
  Upload,
  Image as ImageIcon,
  Search,
  ExternalLink,
  Copy,
  Download,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Crosshair,
  Sparkles,
  Zap,
  Check,
  Sliders,
  Globe,
  SwitchCamera,
  ArrowDown,
  Tv,
  Tag,
  Share2,
  Layers,
} from 'lucide-react';
import { DetectedFace } from '../types';
import {
  detectFacesInImage,
  cropFaceFromImage,
  FREE_REVERSE_SEARCH_ENGINES,
  SOCIAL_PLATFORMS,
  buildOsintDorkQueries,
  FaceDetectionResult,
} from '../lib/localFaceDetector';
import { soundFx } from '../lib/soundFx';

// Sample demonstration faces for instant one-click testing
const SAMPLE_PORTRAITS = [
  {
    name: 'Sample Portrait 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    type: 'Single Studio Portrait',
  },
  {
    name: 'Sample Portrait 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    type: 'Natural Lighting Headshot',
  },
  {
    name: 'Sample Group 3',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    type: 'Multi-Face Group Photo',
  },
];

// Popular Creator / Account Categories for Social Search Matching
const CREATOR_CATEGORIES = [
  { label: '🎬 YouTuber / Vlogger', query: 'YouTuber vlogger creator channel' },
  { label: '📸 Instagram Influencer', query: 'Instagram influencer model fashion' },
  { label: '🎵 TikTok Creator', query: 'TikTok creator viral video dance' },
  { label: '🎮 Gamer / Streamer', query: 'Twitch streamer gaming creator' },
  { label: '💪 Fitness Coach', query: 'Fitness coach athlete workout trainer' },
  { label: '🎧 Musician / Artist', query: 'Musician singer artist official music' },
  { label: '⚡ Tech Reviewer', query: 'Tech reviewer gadget unboxing creator' },
  { label: '🎙️ Podcaster / Host', query: 'Podcast host interview show' },
];

export const FaceDetectView: React.FC = () => {
  // State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [cropPadding, setCropPadding] = useState<number>(0.28); // 0.08 = tight core, 0.28 = whole head, 0.55 = torso, 0.90 = wide
  const [framingMode, setFramingMode] = useState<'head' | 'tight' | 'torso' | 'full'>('head');
  const [copiedFaceToast, setCopiedFaceToast] = useState(false);
  const [copiedQueryToast, setCopiedQueryToast] = useState<string | null>(null);
  const [copiedAllLinksToast, setCopiedAllLinksToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'platforms' | 'reverse' | 'osint' | 'metrics'>('platforms');
  const [dragOver, setDragOver] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraCountdown, setCameraCountdown] = useState<number | null>(null);

  // Refs
  const imageElementRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected face object
  const selectedFace: DetectedFace | undefined =
    detectionResult?.faces.find((f) => f.id === selectedFaceId) || detectionResult?.faces[0];

  // Cropped Face Data URL
  const [croppedFaceUrl, setCroppedFaceUrl] = useState<string | null>(null);
  const [cropDimensions, setCropDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Update crop padding based on framing mode
  const handleFramingChange = (mode: 'head' | 'tight' | 'torso' | 'full') => {
    setFramingMode(mode);
    soundFx.playClick();
    if (mode === 'tight') setCropPadding(0.08);
    else if (mode === 'head') setCropPadding(0.28);
    else if (mode === 'torso') setCropPadding(0.55);
    else setCropPadding(0.9);
  };

  // Update cropped face preview whenever selected face, image, or padding changes
  useEffect(() => {
    if (!imageElementRef.current || !selectedFace || !imageSrc) {
      setCroppedFaceUrl(null);
      return;
    }

    const img = imageElementRef.current;
    if (img.complete && img.naturalWidth > 0) {
      const cropped = cropFaceFromImage(img, selectedFace, cropPadding);
      setCroppedFaceUrl(cropped.dataUrl);
      setCropDimensions({ width: cropped.width, height: cropped.height });
    } else {
      img.onload = () => {
        const cropped = cropFaceFromImage(img, selectedFace, cropPadding);
        setCroppedFaceUrl(cropped.dataUrl);
        setCropDimensions({ width: cropped.width, height: cropped.height });
      };
    }
  }, [selectedFace, imageSrc, cropPadding]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Process and detect faces from image
  const processImage = async (src: string) => {
    setIsProcessing(true);
    setDetectionResult(null);
    setSelectedFaceId(null);
    setImageSrc(src);

    soundFx.playClick();

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = async () => {
      try {
        const result = await detectFacesInImage(img);
        setDetectionResult(result);
        if (result.faces.length > 0) {
          setSelectedFaceId(result.faces[0].id);
          soundFx.playSuccess();
        } else {
          soundFx.playNotification();
        }
      } catch (err) {
        console.error('Face detection error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
      soundFx.playError();
      alert('Failed to load image. Please try uploading a different photo.');
    };
  };

  // Handle File Upload from Device
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (url) {
        stopCameraStream();
        setIsCameraActive(false);
        processImage(url);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start Live Camera
  const startCamera = async (facing: 'user' | 'environment' = cameraFacingMode) => {
    setCameraError(null);
    stopCameraStream();
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      soundFx.playNotification();
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Camera access denied or unavailable. You can upload a photo from your files.');
      soundFx.playError();
    }
  };

  // Toggle Camera Front / Back
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture Snapshot from Camera
  const capturePhoto = (withCountdown: boolean = false) => {
    if (!videoRef.current || !streamRef.current) return;

    if (withCountdown) {
      setCameraCountdown(3);
      soundFx.playClick();
      const interval = setInterval(() => {
        setCameraCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            performSnapshot();
            return null;
          }
          soundFx.playClick();
          return prev - 1;
        });
      }, 1000);
    } else {
      performSnapshot();
    }
  };

  const performSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    stopCameraStream();
    setIsCameraActive(false);
    processImage(dataUrl);
  };

  // Copy Cropped Face to Clipboard
  const handleCopyCroppedFace = async () => {
    if (!croppedFaceUrl) return;

    try {
      const res = await fetch(croppedFaceUrl);
      const blob = await res.blob();

      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopiedFaceToast(true);
        soundFx.playSuccess();
        setTimeout(() => setCopiedFaceToast(false), 2500);
      } else {
        const link = document.createElement('a');
        link.download = `mido_face_crop_${Date.now()}.jpg`;
        link.href = croppedFaceUrl;
        link.click();
        setCopiedFaceToast(true);
        setTimeout(() => setCopiedFaceToast(false), 2500);
      }
    } catch (e) {
      handleDownloadCrop();
    }
  };

  // Download Cropped Face as JPG file
  const handleDownloadCrop = () => {
    if (!croppedFaceUrl) return;
    const a = document.createElement('a');
    a.href = croppedFaceUrl;
    a.download = `mido_face_crop_${Date.now()}.jpg`;
    a.click();
    soundFx.playSuccess();
  };

  // Copy Search Query or Link
  const handleCopyQuery = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQueryToast(text);
    soundFx.playClick();
    setTimeout(() => setCopiedQueryToast(null), 2000);
  };

  // Open Direct Reverse Search Portal
  const handleOpenReverseSearch = (engine: (typeof FREE_REVERSE_SEARCH_ENGINES)[0]) => {
    soundFx.playClick();
    window.open(engine.freeDirectUrl, '_blank', 'noopener,noreferrer');
  };

  // Open Social Search Link
  const handleOpenSocialSearch = (url: string) => {
    soundFx.playClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy All Platform Links at Once
  const handleCopyAllPlatformLinks = () => {
    const term = effectiveSearchTerm;
    const allLinks = SOCIAL_PLATFORMS.map(
      (p) => `${p.platform}: ${p.buildSearchUrl(term)}`
    ).join('\n');

    navigator.clipboard.writeText(allLinks);
    setCopiedAllLinksToast(true);
    soundFx.playSuccess();
    setTimeout(() => setCopiedAllLinksToast(false), 2500);
  };

  // Scroll to search section on mobile
  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    soundFx.playClick();
  };

  // Effective Search Term: custom query OR category query OR generic person search
  const effectiveSearchTerm = searchQuery.trim() || selectedCategory || 'creator account';

  // OSINT queries computed for current query
  const osintQueries = buildOsintDorkQueries(effectiveSearchTerm);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col h-full w-full text-slate-100 p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain pb-44 touch-pan-y scroll-smooth max-w-7xl mx-auto"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Scan className="w-4 h-4 text-cyan-400 animate-pulse" /> 100% Free &amp; Local Computer Vision
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
            Face Detect &amp; Social Search
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              OSINT &amp; Social Search Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Detect full face geometry, crop with custom framing, and search matching accounts on YouTube, Instagram, TikTok, X, and global reverse search engines.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-2 flex-wrap">
          {imageSrc && (
            <button
              type="button"
              onClick={scrollToSearch}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 shadow"
            >
              <ArrowDown className="w-3.5 h-3.5" /> Jump to Search
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Local Device Processing</span>
          </div>
        </div>
      </div>

      {/* Camera Error Banner if any */}
      {cameraError && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            type="button"
            onClick={() => setCameraError(null)}
            className="text-rose-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: IMAGE UPLOAD, CAMERA & INTERACTIVE RETICLES */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`relative w-full min-h-[340px] sm:min-h-[420px] rounded-3xl bg-slate-950/80 border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${
              dragOver
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Live Camera Stream */}
            {isCameraActive ? (
              <div className="relative w-full h-full min-h-[340px] sm:min-h-[420px] flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full max-h-[460px] object-cover ${
                    cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />

                {/* Camera Overlay Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-64 border-2 border-cyan-400/60 rounded-3xl relative animate-pulse">
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] text-cyan-300 font-mono tracking-widest uppercase">
                      Align Face Here
                    </div>
                  </div>
                </div>

                {/* Countdown Overlay */}
                {cameraCountdown !== null && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="text-7xl font-black text-white animate-ping font-mono">
                      {cameraCountdown}
                    </div>
                  </div>
                )}

                {/* Camera Bottom Controls */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3 z-10 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="hidden sm:inline">Flip</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => capturePhoto(false)}
                      className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => capturePhoto(true)}
                      className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                      title="3s Timer Countdown"
                    >
                      <span>⏱️ 3s</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setIsCameraActive(false);
                    }}
                    className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imageSrc ? (
              /* Image Preview with Interactive Bounding Boxes */
              <div className="relative w-full h-full max-h-[480px] flex items-center justify-center p-2">
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Analyzed Subject"
                  crossOrigin="anonymous"
                  className="max-h-[440px] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
                />

                {/* Bounding Box SVG Layer */}
                {detectionResult && detectionResult.faces.length > 0 && imageElementRef.current && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div
                      className="relative"
                      style={{
                        width: imageElementRef.current.clientWidth,
                        height: imageElementRef.current.clientHeight,
                      }}
                    >
                      {detectionResult.faces.map((face, index) => {
                        const isSelected = face.id === selectedFace?.id;
                        const left = `${face.relativeBox.x * 100}%`;
                        const top = `${face.relativeBox.y * 100}%`;
                        const width = `${face.relativeBox.width * 100}%`;
                        const height = `${face.relativeBox.height * 100}%`;

                        return (
                          <div
                            key={face.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              soundFx.playClick();
                              setSelectedFaceId(face.id);
                            }}
                            style={{ left, top, width, height }}
                            className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 rounded-xl ${
                              isSelected
                                ? 'border-2 border-cyan-400 bg-cyan-400/15 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
                                : 'border-2 border-purple-500/70 bg-purple-500/10 hover:border-cyan-300'
                            }`}
                          >
                            {/* Face Reticle Header Tag */}
                            <div
                              className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-md whitespace-nowrap ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'bg-slate-900/90 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              <span>#{index + 1}</span>
                              {isSelected ? <span>[WHOLE FACE]</span> : <span>Face</span>}
                            </div>

                            {/* Corner Target Marks */}
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                            {/* Estimated Center Landmark */}
                            {face.landmarks?.nose && isSelected && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30">
                    <div className="relative">
                      <Scan className="w-12 h-12 text-cyan-400 animate-bounce" />
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-white">Scanning Whole Face &amp; Landmarks...</p>
                      <p className="text-xs text-cyan-300 font-mono">Running In-Browser Local Geometry</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State / Upload Prompt */
              <div className="p-8 text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Upload or Snap Photo</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload an image or take a snapshot. Detect the whole face and search matching accounts on YouTube, Instagram, TikTok, and reverse search portals.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => startCamera('user')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all"
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Use Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {/* Controls Bar Under Image */}
          {imageSrc && !isCameraActive && (
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera('user')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Camera</span>
                </button>
              </div>

              {/* Detected Faces Selector Pills */}
              {detectionResult && detectionResult.faces.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs py-1">
                  <span className="text-[11px] font-bold text-slate-400 pr-1">Faces:</span>
                  {detectionResult.faces.map((f, i) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedFaceId(f.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                        f.id === selectedFace?.id
                          ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      #{i + 1}
                    </button>
                  ))}
                </div>
              )}

              {detectionResult && (
                <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{detectionResult.faces.length} face{detectionResult.faces.length === 1 ? '' : 's'} ({detectionResult.processingTimeMs}ms)</span>
                </div>
              )}
            </div>
          )}

          {/* Sample Photo Pickers */}
          {!imageSrc && !isCameraActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Try Sample Photos:</span>
                <span>Click to test detection</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {SAMPLE_PORTRAITS.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => processImage(sample.url)}
                    className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-400/60 cursor-pointer bg-slate-900 transition-all aspect-square"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate">{sample.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT / BOTTOM COLUMN: CROP INSPECTOR & SOCIAL PLATFORM SEARCH */}
        <div ref={searchSectionRef} className="lg:col-span-5 space-y-4">
          
          {/* Selected Face Crop Preview Card with Framing Switcher */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/20 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">Face &amp; Head Crop</h3>
              </div>
              {selectedFace && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {cropDimensions.width}x{cropDimensions.height} px
                </span>
              )}
            </div>

            {/* Cropped Image Display */}
            {croppedFaceUrl ? (
              <div className="space-y-3">
                <div className="relative w-full h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                  <img
                    src={croppedFaceUrl}
                    alt="Cropped Face"
                    className="max-h-full max-w-full rounded-xl object-contain shadow-md"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-300">
                    Confidence: {Math.round((selectedFace?.confidence || 0.9) * 100)}%
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 text-[9px] font-bold text-cyan-300 uppercase">
                    Framing: {framingMode}
                  </div>
                </div>

                {/* Framing Presets (Whole Face vs Tight vs Torso vs Wide) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Framing &amp; Crop Area:</span>
                    <span className="font-mono text-cyan-300">{Math.round(cropPadding * 100)}% margin</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'tight' as const, label: '🎯 Tight' },
                      { id: 'head' as const, label: '👤 Whole Head' },
                      { id: 'torso' as const, label: '👔 Torso' },
                      { id: 'full' as const, label: '🖼️ Wide' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleFramingChange(preset.id)}
                        className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          framingMode === preset.id
                            ? 'bg-cyan-500 text-slate-950 font-extrabold shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions: Copy & Download */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyCroppedFace}
                    className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                  >
                    {copiedFaceToast ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied Image!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Face</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCrop}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Save JPG</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Upload or capture an image to isolate and crop detected faces.
              </div>
            )}
          </div>

          {/* TAB NAVIGATION: PLATFORMS / REVERSE SEARCH / OSINT / METRICS */}
          <div className="grid grid-cols-4 rounded-2xl bg-slate-900/80 p-1 border border-white/10 text-center gap-1">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('platforms');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'platforms'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Socials</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('reverse');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'reverse'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Reverse</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('osint');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'osint'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Dorks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('metrics');
              }}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'metrics'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* TAB 1: SOCIAL PLATFORMS & SIMILAR ACCOUNTS (YouTube, IG, TikTok, etc.) */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'platforms' && (
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/20 space-y-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Search Platforms for Accounts</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyAllPlatformLinks}
                    className="text-[10px] text-cyan-300 hover:text-cyan-200 font-semibold underline flex items-center gap-1"
                  >
                    {copiedAllLinksToast ? '✓ Copied All Links!' : 'Copy All Links'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Search creator profiles and matching content across YouTube, Instagram, TikTok, X, Pinterest, and Facebook.
                </p>
              </div>

              {/* Creator Niche / Visual Profiler Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-pink-400" />
                  <span>Preset Search Archetype / Vibe:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CREATOR_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        if (selectedCategory === cat.query) {
                          setSelectedCategory('');
                        } else {
                          setSelectedCategory(cat.query);
                        }
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                        selectedCategory === cat.query
                          ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-white/10 hover:border-cyan-500/40'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Search Query Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  Creator Name, Keyword, or Handle:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter name, handle, or style keywords (e.g. gamer streamer)..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none pr-8"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Platform Deep-Search Cards */}
              <div className="space-y-2 pt-1">
                {SOCIAL_PLATFORMS.map((platform) => {
                  const targetUrl = platform.buildSearchUrl(effectiveSearchTerm);

                  return (
                    <div
                      key={platform.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{platform.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-white truncate">{platform.platform}</h5>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 shrink-0">
                              {platform.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{platform.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyQuery(targetUrl)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-white/10"
                          title="Copy search link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSocialSearch(targetUrl)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95"
                        >
                          <span>Search</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 2: LEGITIMATE REVERSE IMAGE SEARCH ENGINES */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'reverse' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>How to Reverse Search with Cropped Face:</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-0.5">
                  <li>Click <strong>Copy Face</strong> or <strong>Save JPG</strong> above</li>
                  <li>Choose a free reverse engine below to open its search portal</li>
                  <li>Paste or upload the cropped photo to discover public matches</li>
                </ol>
              </div>

              <div className="space-y-2.5">
                {FREE_REVERSE_SEARCH_ENGINES.map((engine) => (
                  <div
                    key={engine.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{engine.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{engine.name}</h4>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-white/10 text-cyan-300">
                              {engine.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{engine.bestFor}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenReverseSearch(engine)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shrink-0 shadow transition-all active:scale-95"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {engine.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 3: WEB SEARCH & OSINT DORKS */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'osint' && (
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/20 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Public Information Search (OSINT Dorks)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Search indexed public directories, articles, and open profile databases by name or handle.
                </p>
              </div>

              {/* Search Term Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Name, Username, or Organization..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Launch Search Engines */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Web Engines:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery || 'photo identity search')}` },
                    { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery || 'public records lookup')}` },
                    { name: 'Bing', url: `https://www.bing.com/search?q=${encodeURIComponent(searchQuery || 'news article lookup')}` },
                    { name: 'Yandex', url: `https://yandex.com/search/?text=${encodeURIComponent(searchQuery || 'person search')}` },
                  ].map((engine) => (
                    <button
                      key={engine.name}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        window.open(engine.url, '_blank', 'noopener,noreferrer');
                      }}
                      className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-white/10"
                    >
                      <span>{engine.name}</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* OSINT Query Dorks */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  Targeted Public Dorks for "{effectiveSearchTerm}":
                </span>
                <div className="space-y-2">
                  {osintQueries.map((dork, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="text-[11px] font-bold text-white truncate">{dork.title}</h5>
                        <code className="text-[10px] text-cyan-400 font-mono block truncate">{dork.query}</code>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyQuery(dork.query)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                          title="Copy query"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            window.open(dork.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px]"
                          title="Search online"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* TAB 4: LOCAL ATTRIBUTES & FACIAL GEOMETRY METRICS */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'metrics' && (
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white">Local Computer Vision Metrics</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">100% Client-Side</span>
              </div>

              {selectedFace ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">Cropped Box Dimension</span>
                      <p className="font-mono font-bold text-white">
                        {selectedFace.box.width} × {selectedFace.box.height} px
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">Aspect Ratio</span>
                      <p className="font-mono font-bold text-cyan-300">
                        {selectedFace.aspectRatio} (Standard)
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">Sharpness / Focus Score</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${selectedFace.attributes?.sharpness || 75}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white">
                          {selectedFace.attributes?.sharpness || 75}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400">Lighting / Luminance</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${selectedFace.attributes?.brightness || 60}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-white">
                          {selectedFace.attributes?.brightness || 60}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estimated Head Pose</span>
                      <span className="font-bold text-white capitalize">
                        {selectedFace.attributes?.estimatedPose || 'Frontal Face'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Detection Engine</span>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        {detectionResult?.detectionEngine === 'native-shape-detector'
                          ? 'Browser Native ShapeDetector'
                          : 'In-Browser Skin & Haar Integral CV'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  Select or upload an image to inspect local geometry attributes.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
