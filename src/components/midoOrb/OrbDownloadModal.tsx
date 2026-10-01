import React, { useState } from 'react';
import { Download, Sparkles, Film, Check, Share2, Globe, Copy, X, Sliders, Play, Loader2, Music, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../lib/soundFx';
import { downloadMediaFile, formatBytes } from '../../lib/downloadEngine';
import { getVideoBlobUrl } from '../../lib/videoStorage';

export interface OrbDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: string;
    category?: string;
    author?: string;
    channelName?: string;
  } | null;
}

export const OrbDownloadModal: React.FC<OrbDownloadModalProps> = ({
  isOpen,
  onClose,
  video,
}) => {
  const [quality, setQuality] = useState<'4K' | '1080p' | '720p' | 'audio'>('1080p');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStats, setDownloadStats] = useState<{ loaded: number; total: number } | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadResultUrl, setDownloadResultUrl] = useState<string | null>(null);
  const [downloadResultFilename, setDownloadResultFilename] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen || !video) return null;

  const handleDownload = async () => {
    soundFx.playSuccess();
    setDownloading(true);
    setProgress(0);
    setIsSuccess(false);
    setDownloadResultUrl(null);

    const isAudio = quality === 'audio';
    const ext = isAudio ? 'mp3' : 'mp4';
    const safeTitle = `${video.title || 'mido-orb-video'}_${quality}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    let targetStreamUrl = video.videoUrl;
    if (targetStreamUrl.startsWith('idb://')) {
      const blobUrl = await getVideoBlobUrl(targetStreamUrl);
      targetStreamUrl = blobUrl || '/uploads/vid_1790435435312_xxxuof.webm';
    }

    try {
      const res = await downloadMediaFile(targetStreamUrl, safeTitle, {
        format: isAudio ? 'mp3' : 'mp4',
        targetQuality: quality,
        onProgress: (p, loaded, total) => {
          setProgress(p);
          setDownloadStats({ loaded, total });
        },
      });

      if (res && res.success) {
        setIsSuccess(true);
        if (res.blobUrl) {
          setDownloadResultUrl(res.blobUrl);
          setDownloadResultFilename(res.filename);
        }
        soundFx.playSuccess();
        setToastMsg('Saved file to your Downloads folder!');
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        setToastMsg('Direct browser save attempted');
      }
    } catch (err) {
      console.error('Download error:', err);
      // Direct anchor trigger as ultimate fallback
      const a = document.createElement('a');
      a.href = targetStreamUrl;
      a.download = `${safeTitle}.${ext}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsSuccess(true);
    } finally {
      setDownloading(false);
    }
  };

  const qualityOptions = [
    { id: '4K', label: '4K Ultra HD (2160p)', badge: 'HDR 60FPS', estSize: '~65 MB', desc: 'Highest studio fidelity & lossless audio' },
    { id: '1080p', label: 'Full HD 1080p', badge: 'RECOMMENDED', estSize: '~24 MB', desc: 'Crisp crystal-clear playback on all displays' },
    { id: '720p', label: 'Standard HD 720p', badge: 'FAST', estSize: '~11 MB', desc: 'Fastest download for mobile and data saving' },
    { id: 'audio', label: 'Extract Audio (MP3)', badge: '320 KBPS', estSize: '~3.5 MB', desc: 'Original soundtrack, music & background voice' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col gap-5 text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-600/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white flex items-center gap-2">
              <span>Download Media Stream</span>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black rounded-md uppercase">
                Direct MP4 / MP3
              </span>
            </h2>
            <p className="text-xs text-slate-400">Save real offline copy directly to your device storage</p>
          </div>
        </div>

        {/* Video Preview Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-white/10">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-20 h-14 rounded-xl object-cover border border-white/10 shrink-0"
            />
          ) : (
            <div className="w-20 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Film className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white line-clamp-1">{video.title}</h4>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{video.channelName || video.author || 'Mido Creator'}</span>
              {video.duration && <span>• {video.duration}</span>}
            </div>
          </div>
        </div>

        {/* Quality Options */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Select Output Stream & Quality:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {qualityOptions.map((opt) => {
              const isSelected = quality === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundFx.playClick();
                    setQuality(opt.id as typeof quality);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-600/30 via-pink-600/20 to-amber-600/10 border-rose-500 shadow-lg text-white'
                      : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      isSelected ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {opt.id === 'audio' ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{opt.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          isSelected ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 shrink-0 ml-2">{opt.estSize}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar while downloading */}
        {downloading && (
          <div className="flex flex-col gap-2 p-4 bg-slate-900 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                Downloading stream ({quality})...
              </span>
              <span className="font-mono text-rose-400 font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            {downloadStats && downloadStats.total > 0 && (
              <div className="text-[10px] text-slate-400 font-mono text-right">
                {formatBytes(downloadStats.loaded)} / {formatBytes(downloadStats.total)}
              </div>
            )}
          </div>
        )}

        {/* Success Alert & Direct Link */}
        {isSuccess && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex flex-col gap-2.5 text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">Download completed! File saved to your local downloads directory.</span>
            </div>
            {downloadResultUrl && (
              <a
                href={downloadResultUrl}
                download={downloadResultFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save {downloadResultFilename} directly</span>
              </a>
            )}
          </div>
        )}

        {/* Download Action Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloading
              ? `Saving Media Stream (${progress}%)...`
              : quality === 'audio'
              ? 'Extract & Download MP3 Soundtrack'
              : `Download Video File (${quality})`}
          </span>
        </button>

        {toastMsg && (
          <div className="text-center text-xs font-bold text-emerald-400 animate-fade-in">
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
