import React, { useState, useRef } from 'react';
import {
  Zap,
  Music,
  Image as ImageIcon,
  Search,
  MapPin,
  Video,
  Film,
  Mic,
  MessageSquare,
  FileAudio,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Sliders,
  Compass,
  ArrowRight,
  Upload,
  Radio,
  Eye,
  Headphones,
  Maximize2
} from 'lucide-react';
import { Mode, UserAccount } from '../types';
import { soundFx } from '../lib/soundFx';

interface MidoShortcutsViewProps {
  onSelectMode?: (mode: Mode) => void;
  user?: UserAccount | null;
}

type CategoryFilter = 'all' | 'chat' | 'search' | 'maps' | 'image' | 'video' | 'music' | 'voice' | 'transcribe';

export const MidoShortcutsView: React.FC<MidoShortcutsViewProps> = ({
  onSelectMode,
  user,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Music State
  const [musicPrompt, setMusicPrompt] = useState('Cyberpunk Synthwave with energetic drum beats and futuristic synth lead');
  const [musicGenre, setMusicGenre] = useState('Synthwave');
  const [musicDuration, setMusicDuration] = useState<'clip' | 'pro'>('clip');
  const [musicSpeech, setMusicSpeech] = useState('Through the neon shadows, the digital rain falls. We run forever through the cyber night.');
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicResult, setMusicResult] = useState<{ audioUrl: string | null; lyrics: string; genre: string; title: string } | null>(null);

  // 2. Image State
  const [imagePrompt, setImagePrompt] = useState('Futuristic neon cybernetic skyline overlooking crystal ocean at twilight');
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageStyle, setImageStyle] = useState('Photorealistic 8K');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<{ imageUrl: string; prompt: string; style: string } | null>(null);

  // 3. Search Grounding State
  const [searchQuery, setSearchQuery] = useState('Latest major breakthrough developments in generative AI and quantum computing');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ answer: string; sources: { title: string; uri: string }[]; searchQueries: string[] } | null>(null);

  // 4. Maps Grounding State
  const [mapsQuery, setMapsQuery] = useState('Best specialty espresso coffee shops with outdoor garden seating');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<{ answer: string; places: { title: string; uri: string; snippet?: string }[] } | null>(null);

  // 5. Veo 3 Video Text State
  const [videoPrompt, setVideoPrompt] = useState('Futuristic hypercar drifting at high speed across neon rain drenched bridge in Tokyo at night');
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<{ videoUrl: string; prompt: string } | null>(null);

  // 6. Veo 3 Animate Image State
  const [animImageBase64, setAnimImageBase64] = useState<string | null>(null);
  const [animPrompt, setAnimPrompt] = useState('Smooth 3D camera push-in with glowing particles and ambient gentle motion');
  const [animLoading, setAnimLoading] = useState(false);
  const [animResult, setAnimResult] = useState<{ videoUrl: string } | null>(null);

  // 7. Voice & TTS State
  const [voiceText, setVoiceText] = useState('Welcome to Mido Shortcuts! All 9 next-generation Mido and Lyria AI engines are ready to accelerate your workflow.');
  const [voiceName, setVoiceName] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ audioUrl: string | null; text: string } | null>(null);

  // 8. Multi-Tier Chat State
  const [chatMessage, setChatMessage] = useState('Explain the difference between quantum supremacy and quantum advantage in 2 concise paragraphs with bullet points.');
  const [chatTier, setChatTier] = useState<'pro' | 'flash' | 'lite'>('flash');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResult, setChatResult] = useState<{ reply: string; modelUsed: string } | null>(null);

  // 9. Audio Transcription State
  const [transcribeAudioBase64, setTranscribeAudioBase64] = useState<string | null>(null);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [transcribeResult, setTranscribeResult] = useState<string | null>(null);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleCopy = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Run Music Shortcut
  const handleRunMusic = async () => {
    soundFx.playClick();
    setMusicLoading(true);
    try {
      const res = await fetch('/api/shortcuts/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt,
          genre: musicGenre,
          duration: musicDuration,
          speech: musicSpeech,
        }),
      });
      const data = await res.json();
      setMusicResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setMusicLoading(false);
    }
  };

  // 2. Run Image Shortcut
  const handleRunImage = async () => {
    soundFx.playClick();
    setImageLoading(true);
    try {
      const res = await fetch('/api/shortcuts/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageRatio,
          style: imageStyle,
        }),
      });
      const data = await res.json();
      setImageResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setImageLoading(false);
    }
  };

  // 3. Run Search Grounding Shortcut
  const handleRunSearch = async () => {
    soundFx.playClick();
    setSearchLoading(true);
    try {
      const res = await fetch('/api/shortcuts/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setSearchLoading(false);
    }
  };

  // 4. Run Maps Grounding Shortcut
  const handleRunMaps = async () => {
    soundFx.playClick();
    setMapsLoading(true);
    try {
      const res = await fetch('/api/shortcuts/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mapsQuery }),
      });
      const data = await res.json();
      setMapsResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setMapsLoading(false);
    }
  };

  // 5. Run Video Text Shortcut
  const handleRunVideo = async () => {
    soundFx.playClick();
    setVideoLoading(true);
    try {
      const res = await fetch('/api/shortcuts/video-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoRatio,
        }),
      });
      const data = await res.json();
      setVideoResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setVideoLoading(false);
    }
  };

  // 6. Run Video Animate Shortcut
  const handleRunAnim = async () => {
    if (!animImageBase64) return;
    soundFx.playClick();
    setAnimLoading(true);
    try {
      const res = await fetch('/api/shortcuts/video-animate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: animPrompt,
          imageBase64: animImageBase64,
        }),
      });
      const data = await res.json();
      setAnimResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setAnimLoading(false);
    }
  };

  // 7. Run Voice Shortcut
  const handleRunVoice = async () => {
    soundFx.playClick();
    setVoiceLoading(true);
    try {
      const res = await fetch('/api/shortcuts/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voiceText,
          voiceName: voiceName,
        }),
      });
      const data = await res.json();
      setVoiceResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setVoiceLoading(false);
    }
  };

  // 8. Run Chat Shortcut
  const handleRunChat = async () => {
    soundFx.playClick();
    setChatLoading(true);
    try {
      const res = await fetch('/api/shortcuts/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatMessage,
          modelTier: chatTier,
        }),
      });
      const data = await res.json();
      setChatResult(data);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setChatLoading(false);
    }
  };

  // 9. Run Transcribe Shortcut
  const handleRunTranscribe = async (audioData?: string) => {
    const dataToSend = audioData || transcribeAudioBase64;
    if (!dataToSend) return;
    soundFx.playClick();
    setTranscribeLoading(true);
    try {
      const res = await fetch('/api/shortcuts/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: dataToSend,
        }),
      });
      const data = await res.json();
      setTranscribeResult(data.transcript);
      soundFx.playSuccess();
    } catch (e) {
      console.error(e);
      soundFx.playError();
    } finally {
      setTranscribeLoading(false);
    }
  };

  // Toggle Mic Recording for Transcription
  const handleToggleMic = async () => {
    if (isRecordingMic) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecordingMic(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setTranscribeAudioBase64(base64);
            handleRunTranscribe(base64);
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start();
        setIsRecordingMic(true);
        soundFx.playClick();
      } catch (err) {
        console.error('Microphone error:', err);
        alert('Microphone permission required for voice recording.');
      }
    }
  };

  // Category Filter Pills
  const categories: { id: CategoryFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'all', label: 'All Engines', icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, count: 9 },
    { id: 'music', label: 'Lyria Music', icon: <Music className="w-3.5 h-3.5 text-emerald-400" />, count: 1 },
    { id: 'image', label: 'Vision & Image', icon: <ImageIcon className="w-3.5 h-3.5 text-pink-400" />, count: 1 },
    { id: 'search', label: 'Search Grounding', icon: <Search className="w-3.5 h-3.5 text-blue-400" />, count: 1 },
    { id: 'maps', label: 'Maps Grounding', icon: <MapPin className="w-3.5 h-3.5 text-red-400" />, count: 1 },
    { id: 'video', label: 'Veo 3 Video', icon: <Video className="w-3.5 h-3.5 text-purple-400" />, count: 2 },
    { id: 'voice', label: 'Voice & TTS', icon: <Mic className="w-3.5 h-3.5 text-cyan-400" />, count: 1 },
    { id: 'chat', label: 'Chatbot', icon: <MessageSquare className="w-3.5 h-3.5 text-violet-400" />, count: 1 },
    { id: 'transcribe', label: 'Transcription', icon: <FileAudio className="w-3.5 h-3.5 text-amber-400" />, count: 1 },
  ];

  const matchesFilter = (cat: CategoryFilter, text: string) => {
    if (selectedCategory !== 'all' && selectedCategory !== cat) return false;
    if (!searchFilter.trim()) return true;
    return text.toLowerCase().includes(searchFilter.toLowerCase());
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#020617] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-purple-500/30 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>AI Command Center</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Mido Shortcuts</span>
              <span className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">
                ⚡ 9 AI Engines
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl">
              One-click instant access to all advanced Mido, Lyria, and Veo AI capabilities. Run any model directly below or jump seamlessly into dedicated studios.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter shortcuts..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/60 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/50 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-purple-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 9 Working AI Shortcut Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ============================================================ */}
        {/* SHORTCUT 1: Lyria Music & Song Synthesizer */}
        {/* ============================================================ */}
        {matchesFilter('music', 'music song lyria audio speech synth beat') && (
          <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-emerald-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Lyria Music & Song</h3>
                    <p className="text-[11px] text-emerald-400/80 font-mono">lyria-3-clip-preview / pro</p>
                  </div>
                </div>
                {onSelectMode && (
                  <button
                    onClick={() => onSelectMode('music-studio')}
                    title="Open Full Music Studio"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Track Prompt & Style</label>
                  <input
                    type="text"
                    value={musicPrompt}
                    onChange={(e) => setMusicPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Cyberpunk Synthwave with hard bass"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Lyrics or Speech to Sing (Song)</label>
                  <textarea
                    rows={2}
                    value={musicSpeech}
                    onChange={(e) => setMusicSpeech(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Paste speech or lyrics to sing..."
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={musicGenre}
                    onChange={(e) => setMusicGenre(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Synthwave">Synthwave</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Rock">Rock</option>
                    <option value="Arabic EDM">Arabic EDM</option>
                    <option value="Lo-Fi">Lo-Fi Beat</option>
                  </select>

                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setMusicDuration('clip')}
                      className={`px-2 py-1 rounded ${musicDuration === 'clip' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      30s Clip
                    </button>
                    <button
                      onClick={() => setMusicDuration('pro')}
                      className={`px-2 py-1 rounded ${musicDuration === 'pro' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Pro Track
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunMusic}
                disabled={musicLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
              >
                {musicLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{musicLoading ? 'Synthesizing with Lyria...' : 'Run Lyria Music Engine ⚡'}</span>
              </button>

              {musicResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{musicResult.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Lyria AI</span>
                  </div>
                  {musicResult.audioUrl && (
                    <audio controls className="w-full h-8 mt-1" src={musicResult.audioUrl} />
                  )}
                  {musicResult.lyrics && (
                    <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] max-h-20 overflow-y-auto whitespace-pre-line font-mono">
                      {musicResult.lyrics}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 2: Vision & Image Generator / Remixer */}
        {/* ============================================================ */}
        {matchesFilter('image', 'image photo picture vision mido flash art paint') && (
          <div className="rounded-2xl bg-slate-900/90 border border-pink-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-pink-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Vision & Image Studio</h3>
                    <p className="text-[11px] text-pink-400/80 font-mono">mido-vision-pro-3.1</p>
                  </div>
                </div>
                {onSelectMode && (
                  <button
                    onClick={() => onSelectMode('photo-studio')}
                    title="Open Full Photo Studio"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Image Prompt</label>
                  <textarea
                    rows={2}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Describe your visual concept..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</label>
                    <select
                      value={imageRatio}
                      onChange={(e) => setImageRatio(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      <option value="1:1">1:1 Square</option>
                      <option value="16:9">16:9 Landscape</option>
                      <option value="9:16">9:16 Story/Mobile</option>
                      <option value="4:3">4:3 Standard</option>
                      <option value="3:4">3:4 Portrait</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Style Preset</label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                    >
                      <option value="Photorealistic 8K">Photorealistic 8K</option>
                      <option value="Cyberpunk Anime">Cyberpunk Anime</option>
                      <option value="3D Unreal Render">3D Unreal Render</option>
                      <option value="Cinematic Movie">Cinematic Movie</option>
                      <option value="Vibrant Illustration">Vibrant Illustration</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunImage}
                disabled={imageLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30 transition-all disabled:opacity-50"
              >
                {imageLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{imageLoading ? 'Rendering with Flash Image...' : 'Generate Image ⚡'}</span>
              </button>

              {imageResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/40 space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center">
                    <img src={imageResult.imageUrl} alt="Generated" className="w-full h-full object-cover" />
                    <a
                      href={imageResult.imageUrl}
                      download="mido-shortcut-image.png"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 3: Google Search Grounding with Live Citations */}
        {/* ============================================================ */}
        {matchesFilter('search', 'search web google grounding sources news live') && (
          <div className="rounded-2xl bg-slate-900/90 border border-blue-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-blue-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Google Search Grounding</h3>
                    <p className="text-[11px] text-blue-400/80 font-mono">mido-search-3.5 + Live Web</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Search & Fact Query</label>
                  <textarea
                    rows={2}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter any live question or trending query..."
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Latest AI Breakthroughs',
                    'Champions League Scores',
                    'SpaceX Launch News',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSearchQuery(preset)}
                      className="text-[10px] px-2 py-1 rounded-md bg-slate-950 text-slate-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunSearch}
                disabled={searchLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50"
              >
                {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{searchLoading ? 'Searching Live Google Web...' : 'Run Search Grounding ⚡'}</span>
              </button>

              {searchResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/40 space-y-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 text-slate-200 text-xs max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                    {searchResult.answer}
                  </div>
                  {searchResult.sources && searchResult.sources.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Citations:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                        {searchResult.sources.slice(0, 4).map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-[10px] text-blue-300 hover:text-white"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 4: Google Maps Grounding & Place Finder */}
        {/* ============================================================ */}
        {matchesFilter('maps', 'maps google places locations routing cafe restaurant geo') && (
          <div className="rounded-2xl bg-slate-900/90 border border-red-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-red-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Google Maps Grounding</h3>
                    <p className="text-[11px] text-red-400/80 font-mono">mido-maps-3.5 + Google Maps</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Place or Location Query</label>
                  <input
                    type="text"
                    value={mapsQuery}
                    onChange={(e) => setMapsQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. Best cafes with wifi in Tokyo"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Top Cafes with outdoor seating',
                    'Best Italian Restaurants',
                    'Scenic viewpoints',
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMapsQuery(preset)}
                      className="text-[10px] px-2 py-1 rounded-md bg-slate-950 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/40"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunMaps}
                disabled={mapsLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition-all disabled:opacity-50"
              >
                {mapsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{mapsLoading ? 'Querying Maps Engine...' : 'Search Places with Maps ⚡'}</span>
              </button>

              {mapsResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-red-500/40 space-y-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 text-slate-200 text-xs max-h-24 overflow-y-auto whitespace-pre-wrap">
                    {mapsResult.answer}
                  </div>
                  {mapsResult.places && mapsResult.places.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discovered Places:</p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {mapsResult.places.slice(0, 3).map((pl, idx) => (
                          <a
                            key={idx}
                            href={pl.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px]"
                          >
                            <span className="font-semibold text-red-300 truncate">{pl.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 5: Veo 3 Video AI — Text to Video */}
        {/* ============================================================ */}
        {matchesFilter('video', 'video veo movie text animation render') && (
          <div className="rounded-2xl bg-slate-900/90 border border-purple-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-purple-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Veo 3 Text-to-Video</h3>
                    <p className="text-[11px] text-purple-400/80 font-mono">veo-3.1-fast-generate-preview</p>
                  </div>
                </div>
                {onSelectMode && (
                  <button
                    onClick={() => onSelectMode('video-studio')}
                    title="Open Full Video Studio"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cinematic Video Prompt</label>
                  <textarea
                    rows={2}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Describe scene motion and camera direction..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400">Ratio:</label>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setVideoRatio('16:9')}
                      className={`px-2.5 py-1 rounded ${videoRatio === '16:9' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      onClick={() => setVideoRatio('9:16')}
                      className={`px-2.5 py-1 rounded ${videoRatio === '9:16' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      9:16 Shorts
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunVideo}
                disabled={videoLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
              >
                {videoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{videoLoading ? 'Rendering with Veo 3...' : 'Generate Video with Veo ⚡'}</span>
              </button>

              {videoResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                    <video
                      controls
                      autoPlay
                      loop
                      playsInline
                      src={videoResult.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 6: Veo 3 Video AI — Animate Image */}
        {/* ============================================================ */}
        {matchesFilter('video', 'animate image photo motion veo picture to video') && (
          <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-indigo-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Veo 3 Image Animation</h3>
                    <p className="text-[11px] text-indigo-400/80 font-mono">veo-3.1-fast-generate-preview</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Source Image to Animate</label>
                  <label className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-slate-700 bg-slate-950 hover:bg-slate-900/80 cursor-pointer transition-colors">
                    {animImageBase64 ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-300">
                        <img src={animImageBase64} alt="Source" className="w-8 h-8 rounded object-cover" />
                        <span>Image loaded. Click to replace.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Upload className="w-4 h-4 text-indigo-400" />
                        <span>Upload photo to bring to life</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setAnimImageBase64(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Motion Guidance</label>
                  <input
                    type="text"
                    value={animPrompt}
                    onChange={(e) => setAnimPrompt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Glowing neon rain and slow zoom"
                  />
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunAnim}
                disabled={animLoading || !animImageBase64}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50"
              >
                {animLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{animLoading ? 'Animating Image...' : 'Animate Image with Veo ⚡'}</span>
              </button>

              {animResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-black">
                    <video
                      controls
                      autoPlay
                      loop
                      playsInline
                      src={animResult.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 7: Voice & TTS Speech Generator */}
        {/* ============================================================ */}
        {matchesFilter('voice', 'voice tts speech audio say mido zephyr puck') && (
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-cyan-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Mido Voice & Speech</h3>
                    <p className="text-[11px] text-cyan-400/80 font-mono">mido-voice-tts-3.1</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Text to Speak</label>
                  <textarea
                    rows={2}
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                    placeholder="Enter message for realistic voice output..."
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Voice Character</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setVoiceName(v)}
                        className={`py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          voiceName === v
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/40'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

              {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleRunVoice}
                  disabled={voiceLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
                >
                  {voiceLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                  <span>{voiceLoading ? 'Generating Voice...' : 'Speak Line ⚡'}</span>
                </button>

                {onSelectMode && (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectMode('voice-responding');
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
                  >
                    <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>2-Way Voice Studio 🎙️</span>
                  </button>
                )}
              </div>

              {voiceResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">Voice: {voiceName}</span>
                  </div>
                  {voiceResult.audioUrl && (
                    <audio controls autoPlay className="w-full h-8 mt-1" src={voiceResult.audioUrl} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 8: Multi-Tier Intelligence Chatbot */}
        {/* ============================================================ */}
        {matchesFilter('chat', 'chat reasoning pro flash lite ask chatbot assistant') && (
          <div className="rounded-2xl bg-slate-900/90 border border-violet-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-violet-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Multi-Tier AI Chatbot</h3>
                    <p className="text-[11px] text-violet-400/80 font-mono">pro / flash / lite</p>
                  </div>
                </div>
                {onSelectMode && (
                  <button
                    onClick={() => onSelectMode('chat')}
                    title="Open Full AI Chat"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Message Prompt</label>
                  <textarea
                    rows={2}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500 resize-none"
                    placeholder="Ask anything..."
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] text-slate-400">Model Tier:</label>
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setChatTier('pro')}
                      className={`px-2 py-1 rounded ${chatTier === 'pro' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Pro (Reasoning)
                    </button>
                    <button
                      onClick={() => setChatTier('flash')}
                      className={`px-2 py-1 rounded ${chatTier === 'flash' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Flash (Balanced)
                    </button>
                    <button
                      onClick={() => setChatTier('lite')}
                      className={`px-2 py-1 rounded ${chatTier === 'lite' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Lite (Fast)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleRunChat}
                disabled={chatLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all disabled:opacity-50"
              >
                {chatLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{chatLoading ? 'Thinking with Mido AI...' : 'Send to Mido Chat ⚡'}</span>
              </button>

              {chatResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-violet-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-violet-400 font-mono">{chatResult.modelUsed}</span>
                    <button
                      onClick={() => handleCopy(chatResult.reply, 'chat-reply')}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {copiedId === 'chat-reply' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-slate-200 text-xs max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {chatResult.reply}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SHORTCUT 9: Audio Verbatim Transcription */}
        {/* ============================================================ */}
        {matchesFilter('transcribe', 'transcribe audio speech mic transcribe text recording') && (
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-5 flex flex-col justify-between space-y-4 shadow-xl hover:border-amber-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Audio Transcription</h3>
                    <p className="text-[11px] text-amber-400/80 font-mono">mido-transcribe-3.5</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMic}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      isRecordingMic
                        ? 'bg-red-600 text-white border-red-400 animate-pulse'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span>{isRecordingMic ? 'Stop Recording' : 'Record Mic'}</span>
                  </button>

                  <label className="flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 bg-slate-950 text-slate-300 border border-slate-800 hover:border-amber-500 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setTranscribeAudioBase64(base64);
                            handleRunTranscribe(base64);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Instant verbatim speech transcription with punctuation & speaker detection.
                </p>
              </div>
            </div>

            {/* Run Button & Result */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleRunTranscribe()}
                disabled={transcribeLoading || !transcribeAudioBase64}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
              >
                {transcribeLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-300" />}
                <span>{transcribeLoading ? 'Transcribing...' : 'Transcribe Audio with AI ⚡'}</span>
              </button>

              {transcribeResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Transcript Result</span>
                    <button
                      onClick={() => handleCopy(transcribeResult, 'transcribe-copy')}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {copiedId === 'transcribe-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-slate-200 text-xs max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono">
                    {transcribeResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
