import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, Music, Sparkles, Disc, ListMusic } from 'lucide-react';
import { musicSynthesizer, GENRE_PRESETS } from '../lib/musicSynthesizer';
import { soundFx } from '../lib/soundFx';

interface ChatMusicPlayerProps {
  title: string;
  prompt: string;
  genre?: string;
  audioUrl?: string;
  lyrics?: string;
}

export const ChatMusicPlayer: React.FC<ChatMusicPlayerProps> = ({
  title,
  prompt,
  genre = 'Synthwave',
  audioUrl,
  lyrics,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [activeStep, setActiveStep] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [generatedWavUrl, setGeneratedWavUrl] = useState<string>(audioUrl || '');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  // Generate WAV if no audioUrl provided
  useEffect(() => {
    if (!generatedWavUrl) {
      const url = musicSynthesizer.generateWavAudioUrl(genre, prompt);
      setGeneratedWavUrl(url);
    }
  }, [genre, prompt, generatedWavUrl]);

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw dynamic frequency bars
      const numBars = 32;
      const barWidth = width / numBars - 2;

      for (let i = 0; i < numBars; i++) {
        const barHeight = isPlaying
          ? Math.abs(Math.sin(phase + i * 0.3) * (height * 0.45) + Math.cos(phase * 1.5 + i * 0.2) * (height * 0.3))
          : 4 + Math.sin(phase + i * 0.2) * 3;

        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#6366f1');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, Math.max(3, barHeight));
      }

      phase += isPlaying ? 0.12 : 0.03;
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    soundFx.playClick();
    if (isPlaying) {
      musicSynthesizer.stopLivePlayback();
      setIsPlaying(false);
    } else {
      musicSynthesizer.startLivePlayback(genre, (step) => {
        setActiveStep(step);
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    musicSynthesizer.setVolume(val);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      musicSynthesizer.setVolume(volume);
    } else {
      setIsMuted(true);
      musicSynthesizer.setVolume(0);
    }
  };

  const preset = GENRE_PRESETS[genre] || GENRE_PRESETS['Synthwave'];
  const displayLyrics = lyrics || preset.lyrics;

  return (
    <div className="p-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/80 via-slate-950 to-teal-950/80 shadow-2xl space-y-3.5 backdrop-blur-xl">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }}>
            <Disc className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                {title || `${genre} Master Track`}
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider shrink-0">
                {genre} • {preset.bpm} BPM
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate mt-0.5">
              {prompt || preset.title}
            </p>
          </div>
        </div>

        {/* Play / Pause Primary Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all shrink-0 ${
            isPlaying
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/30 scale-105'
              : 'bg-gradient-to-tr from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30 hover:scale-105'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>
      </div>

      {/* Visualizer Canvas */}
      <div className="relative rounded-2xl bg-black/60 border border-white/10 p-2 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className="w-full h-14 object-contain"
        />
        {isPlaying && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>PLAYING STEP {activeStep + 1}/16</span>
          </div>
        )}
      </div>

      {/* Action Controls & Volume */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <button
            type="button"
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 sm:w-28 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {displayLyrics && (
            <button
              type="button"
              onClick={() => setShowLyrics(!showLyrics)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                showLyrics
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
          )}

          {generatedWavUrl && (
            <a
              href={generatedWavUrl}
              download={`${title || 'mido-ai-track'}.wav`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Expandable Lyrics Drawer */}
      {showLyrics && displayLyrics && (
        <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/20 space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>AI Generated Lyrics &amp; Flow</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic font-serif">
            "{displayLyrics}"
          </p>
        </div>
      )}
    </div>
  );
};
