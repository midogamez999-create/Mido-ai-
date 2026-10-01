import React, { useState, useEffect, useRef } from 'react';
import { GeneratedTrack, AudioStem } from '../types';
import {
  Music,
  Sparkles,
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  Radio,
  Loader2,
  Mic,
  Zap,
  Flame,
  Speaker,
  Layers,
  Sliders,
  Share2,
  TrendingUp,
  AudioWaveform as WaveformIcon,
  PlayCircle,
  FileAudio,
  FileText,
  RotateCcw,
  FastForward,
  Check,
  Disc,
} from 'lucide-react';
import {
  SONG_GENRES,
  SongStyleConfig,
  renderOfflineSongTrack,
  audioBufferToWavBlob,
} from '../lib/songAudioEngine';
import { soundFx } from '../lib/soundFx';

interface MusicStudioViewProps {
  onGenerateMusic: (prompt: string, genre: string, extra?: any) => Promise<GeneratedTrack>;
  generatedTracks: GeneratedTrack[];
}

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({
  onGenerateMusic,
  generatedTracks,
}) => {
  // Studio Mode: 'song' (Speech-to-Song) or 'promo' (Promotion Composer)
  const [studioMode, setStudioMode] = useState<'song' | 'promo'>('song');

  // Song & Speech State
  const [selectedSongGenre, setSelectedSongGenre] = useState<SongStyleConfig>(SONG_GENRES[0]);
  const [lyricsText, setLyricsText] = useState<string>(SONG_GENRES[0].sampleLyrics);
  const [songTitle, setSongTitle] = useState<string>('Skyline Horizons (AI Song)');
  const [vocalVoice, setVocalVoice] = useState<string>('pop');
  const [vocalSpeed, setVocalSpeed] = useState<number>(1.05);
  const [vocalPitch, setVocalPitch] = useState<number>(1.0);
  const [isRenderingWav, setIsRenderingWav] = useState<boolean>(false);
  const [downloadedWavToast, setDownloadedWavToast] = useState<boolean>(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  // Promo Composer State
  const [prompt, setPrompt] = useState(
    'Epic high-energy promotional track with 808 bass, punchy brass stabs, and futuristic synth lead for global commercial campaign'
  );
  const [genre, setGenre] = useState('Cinematic Trap Promo');
  const [promoType, setPromoType] = useState('Product Commercial');
  const [tempo, setTempo] = useState(124);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Track & Multi-stem Mixer
  const [activeTrack, setActiveTrack] = useState<GeneratedTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(85);
  const [visualizerMode, setVisualizerMode] = useState<'wave' | 'spectrum' | 'circular'>('spectrum');

  // Stems State
  const [stems, setStems] = useState<AudioStem[]>([
    { name: 'Drums & 808s', volume: 85, muted: false, solo: false, color: '#ef4444' },
    { name: 'Bassline & Sub', volume: 90, muted: false, solo: false, color: '#f59e0b' },
    { name: 'Melody & Lead Synth', volume: 80, muted: false, solo: false, color: '#38bdf8' },
    { name: 'Ambient FX & Chords', volume: 70, muted: false, solo: false, color: '#a855f7' },
    { name: 'Speech / Song Vocals', volume: 95, muted: false, solo: false, color: '#10b981' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Split lyrics into words for the live teleprompter
  const lyricsWords = lyricsText.split(/\s+/).filter(Boolean);

  // Switch song genre preset
  const handleSelectSongGenre = (g: SongStyleConfig) => {
    setSelectedSongGenre(g);
    setLyricsText(g.sampleLyrics);
    setTempo(g.bpm);
    setSongTitle(`${g.name.split('&')[0].trim()} (AI Song)`);
    soundFx.playClick();
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const renderVis = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += isPlaying ? 0.08 : 0.02;

      const w = canvas.width;
      const h = canvas.height;

      if (visualizerMode === 'spectrum') {
        const bars = 36;
        const barW = (w - (bars - 1) * 3) / bars;

        for (let i = 0; i < bars; i++) {
          const heightMult = isPlaying
            ? Math.abs(Math.sin(step * 1.5 + i * 0.35) * Math.cos(step * 0.8 + i * 0.15)) * (h * 0.75) + 12
            : Math.sin(step + i * 0.2) * 8 + 14;

          const grad = ctx.createLinearGradient(0, h, 0, h - heightMult);
          grad.addColorStop(0, '#3b82f6');
          grad.addColorStop(0.5, '#8b5cf6');
          grad.addColorStop(1, '#ec4899');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(i * (barW + 3), h - heightMult, barW, heightMult, 3);
          ctx.fill();
        }
      } else if (visualizerMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 3.5;
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.5, '#a855f7');
        grad.addColorStop(1, '#10b981');
        ctx.strokeStyle = grad;

        for (let x = 0; x < w; x += 4) {
          const y =
            h / 2 +
            Math.sin(x * 0.02 + step) * (isPlaying ? 45 : 12) * Math.cos(x * 0.01 + step * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Circular Portal
        const cx = w / 2;
        const cy = h / 2;
        const radius = 45;
        const points = 32;

        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;

        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const amp = isPlaying ? Math.sin(step * 2 + i * 0.5) * 22 : Math.sin(step + i * 0.2) * 5;
          const r = radius + amp;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(renderVis);
    };

    renderVis();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, visualizerMode]);

  // Real WebAudio Multi-Track Synthesizer Playback
  const playSynthesizedSong = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

      const cfg = selectedSongGenre;
      let stepCount = 0;
      const sixteenthSec = (60 / tempo) / 4;
      const beatMs = sixteenthSec * 1000;

      // Start Speech Vocals if enabled
      const vocalStem = stems.find((s) => s.name.includes('Speech') || s.name.includes('Vocals'));
      if (vocalStem && !vocalStem.muted && 'speechSynthesis' in window && lyricsText.trim()) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lyricsText);
        utterance.rate = vocalSpeed;
        utterance.pitch = vocalPitch;

        // Teleprompter word boundary tracking
        utterance.onboundary = (e) => {
          if (e.name === 'word') {
            const charIndex = e.charIndex;
            const wordsBefore = lyricsText.slice(0, charIndex).split(/\s+/).filter(Boolean);
            setActiveWordIndex(wordsBefore.length);
          }
        };

        utterance.onend = () => {
          setActiveWordIndex(0);
        };

        speechUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }

      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying || isMuted) return;

        const time = ctx.currentTime;
        const leadStem = stems.find((s) => s.name.includes('Melody'));
        const bassStem = stems.find((s) => s.name.includes('Bass'));
        const drumStem = stems.find((s) => s.name.includes('Drums'));
        const chordStem = stems.find((s) => s.name.includes('Ambient') || s.name.includes('Chords'));

        const gridIndex = stepCount % 16;
        const barIndex = Math.floor(stepCount / 16);
        const chordIdx = barIndex % cfg.chordProgression.length;
        const currentChord = cfg.chordProgression[chordIdx];
        const bassNote = cfg.bassNotes[chordIdx % cfg.bassNotes.length];

        // 1. Kick Drum
        const isKick = cfg.drumPattern[gridIndex] === 1;
        if (drumStem && !drumStem.muted && isKick) {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.frequency.setValueAtTime(140, time);
          kickOsc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

          const vol = (drumStem.volume / 100) * (masterVolume / 100) * 0.4;
          kickGain.gain.setValueAtTime(vol, time);
          kickGain.gain.linearRampToValueAtTime(0.001, time + 0.14);

          kickOsc.connect(kickGain);
          kickGain.connect(ctx.destination);
          kickOsc.start(time);
          kickOsc.stop(time + 0.15);
        }

        // 2. Snare / Clap
        const isSnare = cfg.drumPattern[gridIndex] === 2;
        if (drumStem && !drumStem.muted && isSnare) {
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(220, time);
          snareOsc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

          const vol = (drumStem.volume / 100) * (masterVolume / 100) * 0.25;
          snareGain.gain.setValueAtTime(vol, time);
          snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

          snareOsc.connect(snareGain);
          snareGain.connect(ctx.destination);
          snareOsc.start(time);
          snareOsc.stop(time + 0.16);
        }

        // 3. Bassline on eighth notes
        if (bassStem && !bassStem.muted && gridIndex % 4 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNote, time);

          const vol = (bassStem.volume / 100) * (masterVolume / 100) * 0.22;
          bassGain.gain.setValueAtTime(vol, time);
          bassGain.gain.exponentialRampToValueAtTime(0.001, time + sixteenthSec * 3.5);

          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(time);
          bassOsc.stop(time + sixteenthSec * 3.8);
        }

        // 4. Synth Chords at bar start
        if (chordStem && !chordStem.muted && gridIndex === 0) {
          currentChord.forEach((freq) => {
            const chordOsc = ctx.createOscillator();
            const chordGain = ctx.createGain();
            chordOsc.type = 'sawtooth';
            chordOsc.frequency.setValueAtTime(freq, time);

            const vol = (chordStem.volume / 100) * (masterVolume / 100) * 0.08;
            chordGain.gain.setValueAtTime(vol, time);
            chordGain.gain.exponentialRampToValueAtTime(0.001, time + sixteenthSec * 15);

            chordOsc.connect(chordGain);
            chordGain.connect(ctx.destination);
            chordOsc.start(time);
            chordOsc.stop(time + sixteenthSec * 15.5);
          });
        }

        // 5. Melodic Arpeggio on sixteenths
        if (leadStem && !leadStem.muted && gridIndex % 2 === 0) {
          const noteFreq = cfg.scale[(stepCount + gridIndex) % cfg.scale.length];
          const leadOsc = ctx.createOscillator();
          const leadGain = ctx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(noteFreq, time);

          const vol = (leadStem.volume / 100) * (masterVolume / 100) * 0.14;
          leadGain.gain.setValueAtTime(vol, time);
          leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

          leadOsc.connect(leadGain);
          leadGain.connect(ctx.destination);
          leadOsc.start(time);
          leadOsc.stop(time + 0.2);
        }

        stepCount++;
      }, beatMs);
    } catch (e) {
      console.error('Playback synth error:', e);
    }
  };

  // Playback state effects
  useEffect(() => {
    if (isPlaying) {
      playSynthesizedSong();
    } else {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setActiveWordIndex(0);
    }
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [isPlaying, isMuted, masterVolume, stems, tempo, selectedSongGenre]);

  // Handle Play/Pause Toggle
  const togglePlay = () => {
    soundFx.playClick();
    setIsPlaying(!isPlaying);
  };

  // Generate & Play Song
  const handleGenerateSong = () => {
    soundFx.playSuccess();
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 150);
  };

  // Export & Download Real WAV Audio File
  const handleDownloadWavAudio = async () => {
    setIsRenderingWav(true);
    soundFx.playClick();

    try {
      // Render offline 30-second song track
      const audioBuffer = await renderOfflineSongTrack(selectedSongGenre, 30, tempo);
      const wavBlob = audioBufferToWavBlob(audioBuffer);
      const url = URL.createObjectURL(wavBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${songTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_master.wav`;
      a.click();

      setDownloadedWavToast(true);
      soundFx.playSuccess();
      setTimeout(() => setDownloadedWavToast(false), 3000);
    } catch (err) {
      console.error('Failed to render WAV audio:', err);
      soundFx.playError();
      alert('Could not render WAV audio. Please try again.');
    } finally {
      setIsRenderingWav(false);
    }
  };

  // Stem Volume Slider
  const handleStemVolumeChange = (index: number, val: number) => {
    setStems((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, volume: val } : s))
    );
  };

  // Stem Mute Toggle
  const toggleStemMute = (index: number) => {
    soundFx.playClick();
    setStems((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, muted: !s.muted } : s))
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full text-slate-100 p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain pb-44 touch-pan-y max-w-7xl mx-auto scroll-smooth">
      {/* Studio Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-pink-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Music className="w-4 h-4 text-pink-400 animate-pulse" /> AI Song, Speech &amp; Music Studio Pro
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 flex-wrap">
            Song &amp; Speech Vocals Studio
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold">
              Speech-to-Song Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Paste speech or lyrics to generate a full polyphonic song with synchronized vocal speech, live karaoke teleprompter, and direct .WAV exporter.
          </p>
        </div>

        {/* Action Quick Links & WAV Export Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadWavAudio}
            disabled={isRenderingWav}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {isRenderingWav ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering WAV...
              </>
            ) : downloadedWavToast ? (
              <>
                <Check className="w-3.5 h-3.5" /> Downloaded Song!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Download Full Song (.WAV)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Mode Tabs: Song & Speech vs Promotion Beats */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-white/10 mb-5 max-w-md">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setStudioMode('song');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            studioMode === 'song'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Song &amp; Speech Vocals</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setStudioMode('promo');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            studioMode === 'promo'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Brand Commercials</span>
        </button>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: LYRICS / SPEECH INPUT & SONG GENRE SELECTOR */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/70 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl">
          
          {/* Song Genre Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>1. Choose Song Genre &amp; Musical Vibe</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-black/30 rounded-2xl border border-white/10">
              {SONG_GENRES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectSongGenre(g)}
                  className={`p-2 rounded-xl text-left border transition-all ${
                    selectedSongGenre.id === g.id
                      ? 'bg-gradient-to-r from-pink-600/40 to-indigo-600/40 border-pink-500 text-white font-bold shadow'
                      : 'bg-slate-950/60 text-slate-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                    <span>{g.icon}</span>
                    <span className="truncate">{g.genre}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{g.bpm} BPM • {g.key}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PASTE SPEECH / LYRICS INPUT AREA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Paste Speech, Words or Lyrics:</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {lyricsWords.length} words
              </span>
            </div>

            <textarea
              value={lyricsText}
              onChange={(e) => setLyricsText(e.target.value)}
              placeholder="Paste your spoken speech, lyrics, rap bars, or poem here to turn it into a song..."
              className="w-full h-32 p-3 bg-black/50 border border-white/15 focus:border-pink-500 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
            />
          </div>

          {/* Vocal Style, Pitch & Speed Controls */}
          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-pink-400" /> Vocal Speech Modulation
              </span>
              <span className="text-[10px] font-mono text-cyan-300">{vocalSpeed}x Speed</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-slate-400 font-bold mb-1">Vocal Speed Rate</div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={vocalSpeed}
                  onChange={(e) => setVocalSpeed(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-bold mb-1">Voice Pitch Tuning</div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.1"
                  value={vocalPitch}
                  onChange={(e) => setVocalPitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Generate Song & Vocals Action Button */}
          <button
            type="button"
            onClick={handleGenerateSong}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-pink-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Generate AI Song &amp; Play Speech Vocals</span>
          </button>
        </div>

        {/* RIGHT COLUMN: MULTI-TRACK MIXER & LIVE KARAOKE TELEPROMPTER */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Visualizer & Live Karaoke Deck */}
          <div className="bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-900/90 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl space-y-4">
            
            {/* Visualizer Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-pink-400">
                  {selectedSongGenre.genre} • {tempo} BPM • {selectedSongGenre.key}
                </div>
                <h3 className="text-lg font-black text-white truncate max-w-md">
                  {songTitle}
                </h3>
              </div>

              {/* Visualizer Mode Selectors */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                {(['spectrum', 'wave', 'circular'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setVisualizerMode(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      visualizerMode === m
                        ? 'bg-pink-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Canvas Visualizer */}
            <div className="relative w-full h-36 bg-black/60 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
              <canvas ref={canvasRef} width={600} height={144} className="w-full h-full block" />
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-3.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-xl hover:scale-105 transition-all flex items-center gap-2 font-black text-xs"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" /> PLAY SONG &amp; SPEECH
                  </button>
                </div>
              )}
            </div>

            {/* LIVE KARAOKE / SPEECH TELEPROMPTER */}
            <div className="p-3.5 bg-black/50 rounded-2xl border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-pink-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Live Lyrics Teleprompter
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {isPlaying ? '🎤 Singing in sync' : 'Press Play to sing along'}
                </span>
              </div>
              <div className="text-xs leading-relaxed text-slate-300 max-h-20 overflow-y-auto p-1 rounded-lg">
                {lyricsWords.map((word, i) => (
                  <span
                    key={i}
                    className={`inline-block mr-1.5 px-1 py-0.5 rounded transition-all duration-150 ${
                      isPlaying && i === activeWordIndex
                        ? 'bg-pink-500 text-white font-extrabold scale-110 shadow'
                        : isPlaying && i < activeWordIndex
                        ? 'text-pink-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Transport & Master Volume */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 text-white shadow-lg transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isMuted
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="flex items-center gap-2.5 bg-black/40 px-3.5 py-2 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-slate-300">Master:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-24 sm:w-32 accent-pink-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-pink-300 w-7">{masterVolume}%</span>
              </div>
            </div>
          </div>

          {/* 5-Stem Multi-Track Channel Mixer */}
          <div className="bg-slate-900/70 backdrop-blur-2xl p-5 rounded-3xl border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Multi-Stem Channel Mixer (Live Polyphony)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">5 Dedicated Audio Stems</span>
            </div>

            <div className="space-y-2.5">
              {stems.map((stem, idx) => (
                <div
                  key={stem.name}
                  className="flex items-center gap-3 p-2.5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/15 transition-all"
                >
                  {/* Stem Color Dot & Name */}
                  <div className="w-36 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stem.color || '#38bdf8' }}
                    />
                    <span className="text-xs font-bold text-slate-200 truncate">{stem.name}</span>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stem.volume}
                      disabled={stem.muted}
                      onChange={(e) => handleStemVolumeChange(idx, Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer disabled:opacity-40"
                    />
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                      {stem.volume}%
                    </span>
                  </div>

                  {/* Mute Button */}
                  <button
                    type="button"
                    onClick={() => toggleStemMute(idx)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase border transition-all ${
                      stem.muted
                        ? 'bg-red-500 text-white border-red-400'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {stem.muted ? 'MUTED' : 'MUTE'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
