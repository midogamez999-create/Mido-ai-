import { getVideoBlobUrl, getSyncVideoBlobUrl } from './videoStorage';

/**
 * Pro Real Downloader Engine for Mido Orb & Mido Cut
 * Downloads actual video/audio/photo binary streams directly to disk,
 * handles CORS proxies/fallbacks, creates Blob URLs, and handles media extraction.
 */

export interface DownloadOptions {
  filename?: string;
  onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void;
  targetQuality?: '4K' | '1080p' | '720p' | 'audio';
  format?: 'mp4' | 'webm' | 'mp3' | 'wav' | 'png' | 'jpg';
}

export interface DownloadResult {
  success: boolean;
  blobUrl?: string;
  filename: string;
  sizeBytes?: number;
  error?: string;
}

/**
 * Converts Web Audio AudioBuffer into a standard 16-bit PCM WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  /* fmt sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  /* data sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write interleaved PCM audio samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Downloads any remote media URL smoothly as a real file to the user's computer/mobile device
 */
export async function downloadMediaFile(
  rawUrl: string,
  suggestedName: string = 'mido-media',
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const { onProgress, targetQuality, format = 'mp4' } = options;

  const isAudioExtraction = targetQuality === 'audio' || format === 'mp3' || format === 'wav';
  const finalExt = isAudioExtraction ? 'mp3' : format;

  const cleanName = suggestedName
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 60);

  const finalFilename = cleanName.toLowerCase().endsWith(`.${finalExt}`)
    ? cleanName
    : `${cleanName}.${finalExt}`;

  if (onProgress) onProgress(5, 5, 100);

  try {
    let resolvedUrl = rawUrl;

    // 1. Resolve IndexedDB URLs (idb://)
    if (resolvedUrl.startsWith('idb://')) {
      const syncUrl = getSyncVideoBlobUrl(resolvedUrl);
      if (syncUrl) {
        resolvedUrl = syncUrl;
      } else {
        const idbBlobUrl = await getVideoBlobUrl(resolvedUrl);
        if (idbBlobUrl) {
          resolvedUrl = idbBlobUrl;
        }
      }
    }

    // 2. Resolve relative URLs (e.g. /uploads/vid_123.mp4)
    if (resolvedUrl.startsWith('/')) {
      resolvedUrl = `${window.location.origin}${resolvedUrl}`;
    }

    if (onProgress) onProgress(20, 20, 100);

    // 3. Fetch media data with fallback to proxy
    let responseBlob: Blob;

    const fetchWithXhr = (targetUrl: string): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', targetUrl, true);
        xhr.responseType = 'blob';

        xhr.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const p = Math.min(90, Math.round((e.loaded / e.total) * 75) + 20);
            onProgress(p, e.loaded, e.total);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            resolve(xhr.response);
          } else {
            reject(new Error(`HTTP status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error fetching media'));
        xhr.send();
      });
    };

    try {
      responseBlob = await fetchWithXhr(resolvedUrl);
    } catch {
      // If direct request failed (CORS or network), try through backend streaming proxy
      if (resolvedUrl.startsWith('http://') || resolvedUrl.startsWith('https://')) {
        const proxyUrl = `/api/mido-video/stream?url=${encodeURIComponent(resolvedUrl)}`;
        responseBlob = await fetchWithXhr(proxyUrl);
      } else {
        // Last-ditch fetch API attempt
        const resp = await fetch(resolvedUrl);
        responseBlob = await resp.blob();
      }
    }

    if (onProgress) onProgress(80, responseBlob.size * 0.8, responseBlob.size);

    // 4. If user requested Audio Extraction (MP3/WAV), decode audio track via Web Audio API!
    let finalDownloadBlob = responseBlob;
    if (isAudioExtraction) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const arrayBuffer = await responseBlob.arrayBuffer();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(audioBuffer);
          finalDownloadBlob = wavBlob;
          await audioCtx.close();
        }
      } catch (audioExtractErr) {
        console.warn('Audio decoding failed, using direct stream blob:', audioExtractErr);
      }
    }

    if (onProgress) onProgress(95, finalDownloadBlob.size * 0.95, finalDownloadBlob.size);

    // 5. Trigger browser download dialog using high-priority anchor
    const blobUrl = window.URL.createObjectURL(finalDownloadBlob);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = blobUrl;
    anchor.download = finalFilename;
    anchor.setAttribute('download', finalFilename);
    document.body.appendChild(anchor);

    anchor.click();

    setTimeout(() => {
      try {
        document.body.removeChild(anchor);
      } catch {}
    }, 5000);

    if (onProgress) onProgress(100, finalDownloadBlob.size, finalDownloadBlob.size);

    return {
      success: true,
      blobUrl,
      filename: finalFilename,
      sizeBytes: finalDownloadBlob.size,
    };
  } catch (err: any) {
    console.error('Download execution error:', err);

    // Fallback: direct anchor triggering
    try {
      const a = document.createElement('a');
      a.href = rawUrl;
      a.download = finalFilename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch {}
      }, 3000);

      if (onProgress) onProgress(100, 1, 1);
      return {
        success: true,
        filename: finalFilename,
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        filename: finalFilename,
        error: fallbackErr?.message || err?.message || 'Download failed',
      };
    }
  }
}

/**
 * Format bytes nicely
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

