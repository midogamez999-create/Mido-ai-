import React, { useState } from 'react';
import { Music, Volume2, VolumeX, Mic, Play, Pause, Zap, Check } from 'lucide-react';
import { AUDIO_SFX_PRESETS, VOICE_CHANGER_PRESETS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutAudioPanelProps {
  bgMusicTrack: 'none' | 'cyber' | 'lofi' | 'cinematic' | 'upbeat';
  onSelectBgMusic: (track: 'none' | 'cyber' | 'lofi' | 'cinematic' | 'upbeat') => void;
  selectedVoiceChanger: string;
  onSelectVoiceChanger: (vcId: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  masterVolume: number;
  onChangeVolume: (vol: number) => void;
  bassBoost: boolean;
  onToggleBassBoost: () => void;
  noiseCancellation: boolean;
  onToggleNoiseCancellation: () => void;
}

export const CutAudioPanel: React.FC<CutAudioPanelProps> = ({
  bgMusicTrack,
  onSelectBgMusic,
  selectedVoiceChanger,
  onSelectVoiceChanger,
  isMuted,
  onToggleMute,
  masterVolume,
  onChangeVolume,
  bassBoost,
  onToggleBassBoost,
  noiseCancellation,
  onToggleNoiseCancellation,
}) => {
  const [playingSfx, setPlayingSfx] = useState<string | null>(null);

  const triggerSfxSound = (sfx: typeof AUDIO_SFX_PRESETS[0]) => {
    soundFx.playPop();
    setPlayingSfx(sfx.id);

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = sfx.type === 'whoosh' ? 'sine' : sfx.type === 'boom' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(sfx.freq, ctx.currentTime);

        if (sfx.type === 'whoosh') {
          osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
        } else if (sfx.type === 'boom') {
          osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
        } else if (sfx.type === 'ding') {
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
        }

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (sfx.type === 'boom' ? 0.8 : 0.4));

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch {
      // Audio fallback
    }

    setTimeout(() => {
      setPlayingSfx(null);
    }, 500);
  };

  const bgMusicOptions = [
    { id: 'none', name: 'No Background Music', desc: 'Original clip audio only' },
    { id: 'cyber', name: '⚡ Cyberpunk Synthwave', desc: 'Energetic electro synth beats' },
    { id: 'lofi', name: '☕ Lo-Fi Chill Study Beat', desc: 'Relaxing ambient vinyl melody' },
    { id: 'cinematic', name: '🎬 Epic Cinematic Orchestral', desc: 'Hans Zimmer style dramatic strings' },
    { id: 'upbeat', name: '🔥 Viral Phonk & Upbeat Trap', desc: 'High energy 808 bass drops' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Master Volume & Audio Enhancers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-black/40 rounded-2xl border border-white/10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Master Video Volume:</span>
            </div>
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                isMuted ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'bg-white/10 text-slate-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Muted' : 'Unmuted'}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={200}
              value={masterVolume * 100}
              onChange={(e) => onChangeVolume(parseInt(e.target.value) / 100)}
              className="w-full accent-emerald-500"
              disabled={isMuted}
            />
            <span className="text-xs font-mono text-emerald-400 font-bold w-12 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleBassBoost();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              bassBoost
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Bass Boost EQ</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onToggleNoiseCancellation();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              noiseCancellation
                ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50 shadow-md'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
            }`}
          >
            <VolumeX className="w-4 h-4 text-cyan-400" />
            <span>AI Noise Cancel</span>
          </button>
        </div>
      </div>

      {/* SFX Library Section */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          25+ Instant SFX Sound Effects:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {AUDIO_SFX_PRESETS.map((sfx) => {
            const isPlayingThis = playingSfx === sfx.id;
            return (
              <button
                key={sfx.id}
                onClick={() => triggerSfxSound(sfx)}
                className={`p-2.5 rounded-xl border text-left transition-all group flex flex-col justify-between h-20 relative overflow-hidden ${
                  isPlayingThis
                    ? 'bg-emerald-600/30 border-emerald-500 shadow-md scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 line-clamp-1">
                    {sfx.name}
                  </span>
                  <Play className={`w-3.5 h-3.5 ${isPlayingThis ? 'text-emerald-400 fill-emerald-400 animate-pulse' : 'text-slate-500 group-hover:text-white'}`} />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">{sfx.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Changers & AI Vocal Modulators */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          AI Voice Changers & Microphones:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
          {VOICE_CHANGER_PRESETS.map((vc) => {
            const isSelected = selectedVoiceChanger === vc.id;
            return (
              <button
                key={vc.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectVoiceChanger(vc.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500 shadow-md text-white'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold line-clamp-1">{vc.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{vc.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Music Selector */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          Royalty-Free Background Music Tracks:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {bgMusicOptions.map((opt) => {
            const isSelected = bgMusicTrack === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectBgMusic(opt.id as 'none' | 'cyber' | 'lofi' | 'cinematic' | 'upbeat');
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border-emerald-500 shadow-lg text-white'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
