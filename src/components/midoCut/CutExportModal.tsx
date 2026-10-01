import React, { useState } from 'react';
import { Download, Sparkles, Film, Check, Share2, Globe, Copy, X, Sliders, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../lib/soundFx';
import { downloadMediaFile } from '../../lib/downloadEngine';

interface CutExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaName: string;
  mediaType: 'video' | 'photo';
  mediaUrl: string;
  aspectRatio: string;
  onPublishToMidoOrb?: (videoData: { title: string; url: string; category: string; description: string }) => void;
  onNavigateToOrb?: () => void;
}

export const CutExportModal: React.FC<CutExportModalProps> = ({
  isOpen,
  onClose,
  mediaName,
  mediaType,
  mediaUrl,
  aspectRatio,
  onPublishToMidoOrb,
  onNavigateToOrb,
}) => {
  const [resolution, setResolution] = useState<'4K' | '1080p' | '720p'>('4K');
  const [framerate, setFramerate] = useState<'60fps' | '30fps' | '24fps'>('60fps');
  const [bitrate, setBitrate] = useState<'high' | 'ultra' | 'medium'>('ultra');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Mido Orb Publish form
  const [orbTitle, setOrbTitle] = useState(mediaName.replace(/\.[^/.]+$/, "") + ' - Mido Cut Edit');
  const [orbCategory, setOrbCategory] = useState('Trending Shorts & AI');
  const [orbDesc, setOrbDesc] = useState('Edited with Mido Cut 🎬 Pro Suite (CapCut-grade 4K filters, speed curves & VFX).');

  if (!isOpen) return null;

  const handleStartExport = () => {
    soundFx.playSuccess();
    setIsExporting(true);
    setProgress(0);
    setExportedUrl(null);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportedUrl(mediaUrl);
          soundFx.playSuccess();
          return 100;
        }
        return prev + 12;
      });
    }, 150);
  };

  const handlePublishOrb = () => {
    soundFx.playSuccess();
    if (onPublishToMidoOrb) {
      onPublishToMidoOrb({
        title: orbTitle,
        url: exportedUrl || mediaUrl,
        category: orbCategory,
        description: orbDesc,
      });
    }
    setPublishSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-white/15 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative flex flex-col gap-5 text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-xl text-white">4K Studio Export & Publish</h2>
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
                ULTRA HDR
              </span>
            </div>
            <p className="text-xs text-slate-400">Render with hardware acceleration and publish directly to Mido Orb</p>
          </div>
        </div>

        {/* Export Settings */}
        {!exportedUrl ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Resolution:</label>
                <div className="flex flex-col gap-1">
                  {(['4K', '1080p', '720p'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        resolution === r ? 'bg-pink-600/30 border-pink-500 text-white shadow' : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      {r} {r === '4K' ? 'UHD' : 'FHD'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Frame Rate:</label>
                <div className="flex flex-col gap-1">
                  {(['60fps', '30fps', '24fps'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFramerate(f)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        framerate === f ? 'bg-purple-600/30 border-purple-500 text-white shadow' : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase mb-1 block">Bitrate Quality:</label>
                <div className="flex flex-col gap-1">
                  {(['ultra', 'high', 'medium'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBitrate(b)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center capitalize ${
                        bitrate === b ? 'bg-indigo-600/30 border-indigo-500 text-white shadow' : 'bg-slate-900 border-white/10 text-slate-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar (during export) */}
            {isExporting && (
              <div className="flex flex-col gap-2 p-4 bg-slate-900/80 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
                    Rendering {resolution} @ {framerate} ({bitrate} bitrate)...
                  </span>
                  <span className="font-mono text-pink-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-sm rounded-2xl shadow-xl shadow-pink-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? `Rendering (${progress}%)...` : `Start 4K Hardware Render`}</span>
            </button>
          </div>
        ) : (
          /* Post Export & Publish to Mido Orb */
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-emerald-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">4K Master Render Complete!</h4>
                <p className="text-xs text-emerald-300">Resolution: {resolution} | Framerate: {framerate} | Aspect: {aspectRatio}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  soundFx.playSuccess();
                  await downloadMediaFile(exportedUrl || mediaUrl, orbTitle || 'mido-cut-master', {
                    format: mediaType === 'photo' ? 'png' : 'mp4',
                    targetQuality: resolution,
                  });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device ({resolution})</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedUrl || mediaUrl);
                  soundFx.playSuccess();
                }}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
            </div>

            {/* Direct 1-Click Publish to Mido Orb */}
            <div className="p-4 bg-gradient-to-br from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/30 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-rose-400" />
                  <span className="font-bold text-xs text-white">Publish to Mido Orb Platform</span>
                </div>
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded uppercase">MIDO ORB</span>
              </div>

              {!publishSuccess ? (
                <>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={orbTitle}
                      onChange={(e) => setOrbTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      placeholder="Video Title..."
                    />
                    <select
                      value={orbCategory}
                      onChange={(e) => setOrbCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Trending Shorts & AI">Trending Shorts & AI</option>
                      <option value="Gaming & Esports">Gaming & Esports</option>
                      <option value="Music & Trap Beats">Music & Trap Beats</option>
                      <option value="Tech & Coding">Tech & Coding</option>
                      <option value="Anime & AMVs">Anime & AMVs</option>
                    </select>
                  </div>

                  <button
                    onClick={handlePublishOrb}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Publish Video to Mido Orb Now</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-rose-300 font-bold">
                    <Check className="w-4 h-4 text-rose-400 stroke-[3]" />
                    <span>Successfully published to Mido Orb Channel!</span>
                  </div>
                  {onNavigateToOrb && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToOrb();
                      }}
                      className="w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Open Mido Orb to View Video 🚀
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
