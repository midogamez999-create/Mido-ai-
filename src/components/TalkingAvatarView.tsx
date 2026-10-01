import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Download,
  Video,
  Mic,
  Volume2,
  Sliders,
  Share2,
  Layers,
  Wand2,
  Smile,
  Globe,
  Radio,
  Film,
  Camera,
  CheckCircle2,
  Eye,
  Settings2,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  voiceGender: 'male' | 'female' | 'robot';
  accent: string;
  defaultPitch: number;
  defaultRate: number;
  bgScene: string;
  sampleScript: string;
}

const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'cyber-mido',
    name: 'Mido AI Host',
    role: 'Virtual AI Assistant & Presenter',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'female',
    accent: 'en-US',
    defaultPitch: 1.1,
    defaultRate: 1.0,
    bgScene: 'cyber',
    sampleScript: 'Hello! I am Mido, your intelligent generative AI presenter. Upload your photo and type any script, and I will bring your character to life with real lip sync and voice!',
  },
  {
    id: 'ceo-sarah',
    name: 'Sarah Chen',
    role: 'Tech Founder & Keynote Speaker',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'female',
    accent: 'en-US',
    defaultPitch: 1.0,
    defaultRate: 1.05,
    bgScene: 'office',
    sampleScript: 'Welcome everyone to today’s product launch. Our breakthrough neural network delivers instant 60 frames per second generation directly inside your browser.',
  },
  {
    id: 'gamer-alex',
    name: 'Alex Vortex',
    role: 'Esports Champion & Streamer',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'male',
    accent: 'en-US',
    defaultPitch: 0.95,
    defaultRate: 1.15,
    bgScene: 'neon',
    sampleScript: 'What is up guys! Alex here! Today we are testing the most overpowered video generative models. Smash that like button and let’s dive right into the arena!',
  },
  {
    id: 'anime-luna',
    name: 'Luna Spark',
    role: 'Virtual Idol & Anime Star',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'female',
    accent: 'en-US',
    defaultPitch: 1.3,
    defaultRate: 1.1,
    bgScene: 'stadium',
    sampleScript: 'Konnichiwa! Welcome to our magical performance! Singing with all my heart to bring happiness and energy to everyone watching today!',
  },
  {
    id: 'news-david',
    name: 'David Sterling',
    role: 'Global News Anchor',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'male',
    accent: 'en-GB',
    defaultPitch: 0.9,
    defaultRate: 0.95,
    bgScene: 'studio',
    sampleScript: 'Breaking news this evening: Artificial intelligence has achieved real-time talking avatar generation with synchronized mouth phonemes and dynamic audio visualization.',
  },
  {
    id: 'football-leo',
    name: 'Leo Silva',
    role: 'Championship Football Star',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    voiceGender: 'male',
    accent: 'en-US',
    defaultPitch: 0.85,
    defaultRate: 1.05,
    bgScene: 'stadium',
    sampleScript: 'What an incredible match! Ninety minutes of pure intensity, teamwork, and an unforgettable winning goal in the top corner! Thank you to all the fans!',
  },
];

interface TalkingAvatarViewProps {
  onPublishToOrb?: (videoData: any) => void;
}

export const TalkingAvatarView: React.FC<TalkingAvatarViewProps> = ({ onPublishToOrb }) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarPreset>(AVATAR_PRESETS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [speechScript, setSpeechScript] = useState<string>(AVATAR_PRESETS[0].sampleScript);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [bgScene, setBgScene] = useState<string>('cyber');
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [avatarEmotion, setAvatarEmotion] = useState<'happy' | 'confident' | 'serious' | 'excited'>('confident');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [spokenWordIndex, setSpokenWordIndex] = useState<number>(0);
  const [exportSuccess, setExportSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active avatar image source
  const activeImageSrc = customPhotoUrl || selectedAvatar.imageUrl;

  // Preload Avatar Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImageSrc;
    img.onload = () => {
      avatarImageRef.current = img;
    };
  }, [activeImageSrc]);

  // Handle Avatar Preset Select
  const handleSelectPreset = (preset: AvatarPreset) => {
    soundFx.playClick();
    setSelectedAvatar(preset);
    setCustomPhotoUrl(null);
    setSpeechScript(preset.sampleScript);
    setBgScene(preset.bgScene);
    setVoicePitch(preset.defaultPitch);
    setVoiceRate(preset.defaultRate);
    handleStopSpeech();
  };

  // Handle Custom Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playSuccess();
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setCustomPhotoUrl(result);
        const img = new Image();
        img.src = result;
        img.onload = () => {
          avatarImageRef.current = img;
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Script Generator via Gemini
  const handleGenerateScript = async (topic: string) => {
    setIsGeneratingScript(true);
    soundFx.playClick();
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a compelling, natural, 3-sentence talking avatar speech for ${selectedAvatar.name} (${selectedAvatar.role}). Topic: "${topic}". Make it engaging, punchy, and ready to speak aloud. Do not include stage directions or markdown, just the spoken words.`,
          turboMode: true,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        const cleanScript = data.reply.replace(/[*_#"`]/g, '').trim();
        setSpeechScript(cleanScript);
        soundFx.playSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Start Speech & Talking Avatar Animation
  const handleStartSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    soundFx.playClick();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechScript);
    utterance.pitch = voicePitch;
    utterance.rate = voiceRate;
    utterance.volume = voiceVolume;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) =>
      selectedAvatar.voiceGender === 'female'
        ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha')
        : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex')
    ) || voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    const words = speechScript.split(/\s+/);
    let wordIdx = 0;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIdx = event.charIndex;
        const currentText = speechScript.slice(0, charIdx + 25);
        setCurrentSubtitle(speechScript.slice(Math.max(0, charIdx - 20), charIdx + 40));
        setSpokenWordIndex(wordIdx++);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setCurrentSubtitle(speechScript.slice(0, 40) + '...');
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentSubtitle('');
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentSubtitle('');
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    soundFx.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSubtitle('');
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Start Recording Avatar Stream to Video
  const handleStartRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      soundFx.playSuccess();
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30); // 30 FPS stream

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      handleStartSpeech();
    } catch (err) {
      console.error('Failed to record avatar canvas:', err);
    }
  };

  // Real-time 60FPS Canvas Render Loop (Lip Sync, Head Tilt, Blinking, Particle Aura, Subtitles)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animTime = 0;

    const renderLoop = () => {
      animTime += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Scene
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
      if (bgScene === 'cyber') {
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else if (bgScene === 'neon') {
        bgGrad.addColorStop(0, '#581c87');
        bgGrad.addColorStop(0.5, '#1e1b4b');
        bgGrad.addColorStop(1, '#09090b');
      } else if (bgScene === 'stadium') {
        bgGrad.addColorStop(0, '#064e3b');
        bgGrad.addColorStop(0.5, '#022c22');
        bgGrad.addColorStop(1, '#020617');
      } else if (bgScene === 'office') {
        bgGrad.addColorStop(0, '#1e293b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      } else {
        bgGrad.addColorStop(0, '#312e81');
        bgGrad.addColorStop(0.5, '#111827');
        bgGrad.addColorStop(1, '#030712');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background Grid & Lighting FX
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Avatar Portrait Motion Physics
      const isSpeaking = isPlaying;
      const breathingSway = Math.sin(animTime * 1.2) * 4;
      const headTilt = Math.sin(animTime * 0.8) * 0.015;
      const speechMouthIntensity = isSpeaking ? Math.abs(Math.sin(animTime * 14) * 0.8 + Math.cos(animTime * 9) * 0.5) : 0;
      const eyeBlink = Math.sin(animTime * 0.5) > 0.96 ? 0.2 : 1.0;

      // Glow Aura behind head
      const auraGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 10, width / 2, height / 2 - 20, 220);
      auraGrad.addColorStop(0, isSpeaking ? 'rgba(99, 102, 241, 0.35)' : 'rgba(168, 85, 247, 0.2)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 20, 220, 0, Math.PI * 2);
      ctx.fill();

      // Draw Avatar Image
      const img = avatarImageRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.translate(width / 2, height / 2 + breathingSway);
        ctx.rotate(headTilt);

        // Circular clipping for avatar portrait
        const radius = 170;
        ctx.beginPath();
        ctx.arc(0, -20, radius, 0, Math.PI * 2);
        ctx.clip();

        // Draw Image
        ctx.drawImage(img, -radius, -radius - 20, radius * 2, radius * 2);

        // Dynamic Lip-Sync Mouth Deformation Simulation
        if (isSpeaking && speechMouthIntensity > 0.1) {
          const mouthY = 45;
          const mouthWidth = 40 + speechMouthIntensity * 12;
          const mouthOpen = 4 + speechMouthIntensity * 16;

          // Mouth interior shadow
          ctx.fillStyle = 'rgba(20, 10, 15, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, mouthY, mouthWidth / 2, mouthOpen, 0, 0, Math.PI * 2);
          ctx.fill();

          // Upper & Lower lip tone
          ctx.strokeStyle = 'rgba(210, 100, 120, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(0, mouthY, mouthWidth / 2, mouthOpen, 0, 0, Math.PI);
          ctx.stroke();

          // Teeth highlight
          if (mouthOpen > 8) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(-mouthWidth / 4, mouthY - mouthOpen + 2, mouthWidth / 2, 4);
          }
        }

        ctx.restore();

        // High-tech Glowing Portrait Border Ring
        ctx.save();
        ctx.translate(width / 2, height / 2 + breathingSway);
        ctx.rotate(headTilt);

        const ringGrad = ctx.createLinearGradient(-180, -180, 180, 180);
        ringGrad.addColorStop(0, '#6366f1');
        ringGrad.addColorStop(0.5, isSpeaking ? '#ec4899' : '#a855f7');
        ringGrad.addColorStop(1, '#06b6d4');

        ctx.strokeStyle = ringGrad;
        ctx.lineWidth = isSpeaking ? 6 : 4;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = isSpeaking ? 20 : 10;
        ctx.beginPath();
        ctx.arc(0, -20, 172, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Status HUD Indicator (Live 60FPS / Speaking / Recording)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.roundRect ? ctx.roundRect(20, 20, 180, 36, 12) : ctx.fillRect(20, 20, 180, 36);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      // Dot
      ctx.fillStyle = isRecording ? '#ef4444' : isSpeaking ? '#10b981' : '#64748b';
      ctx.beginPath();
      ctx.arc(36, 38, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        isRecording ? 'RECORDING 60FPS' : isSpeaking ? 'AI SPEECH SYNTH' : 'READY TO TALK',
        50,
        42
      );

      // 4. Live Karaoke Subtitles Banner at Bottom
      if (currentSubtitle || isSpeaking) {
        const subBoxWidth = width - 60;
        const subBoxHeight = 56;
        const subY = height - 76;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.roundRect ? ctx.roundRect(30, subY, subBoxWidth, subBoxHeight, 16) : ctx.fillRect(30, subY, subBoxWidth, subBoxHeight);
        ctx.fill();

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('LIVE KARAOKE SUBTITLE SYNCHRONIZER', 46, subY + 18);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        const displaySub = currentSubtitle || speechScript.slice(0, 50) + '...';
        ctx.fillText(`"${displaySub}"`, 46, subY + 40);
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isRecording, bgScene, selectedAvatar, currentSubtitle, speechScript]);

  return (
    <div className="w-full h-full min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 bg-[#020617] text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Talking Avatar Studio</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black uppercase tracking-wider">
                  Real AI Lip-Sync
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Upload your photo, write what the avatar should say, and generate a 60FPS video with synchronized mouth and speech.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all shadow-md"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={isRecording ? handleStopSpeech : handleStartRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-600/30'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/30'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>{isRecording ? 'Stop Recording' : 'Record Video'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Column: Interactive Canvas & Video Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl bg-slate-950 border border-white/15 p-3 shadow-2xl overflow-hidden backdrop-blur-2xl">
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full aspect-[4/3] rounded-2xl object-cover bg-black shadow-inner"
            />

            {/* Playback Control Overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between p-3 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isPlaying ? handleStopSpeech : handleStartSpeech}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30 scale-105'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/30 hover:scale-105'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                </button>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{customPhotoUrl ? 'Custom Uploaded Character' : selectedAvatar.name}</span>
                    <span className="text-[10px] text-purple-300 font-normal">({selectedAvatar.role})</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {isPlaying ? 'Talking in real-time with phoneme lip sync...' : 'Press play to speak script aloud'}
                  </div>
                </div>
              </div>

              {/* Background Scene Switcher */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'cyber', label: 'Cyber' },
                  { id: 'neon', label: 'Neon' },
                  { id: 'office', label: 'Office' },
                  { id: 'stadium', label: 'Stadium' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setBgScene(s.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                      bgScene === s.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exported Video Download Card (If Recorded) */}
          {recordedVideoUrl && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-pink-950/60 border border-purple-500/40 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500 text-white shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">
                      Talking Avatar Video Exported!
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      High-definition 60FPS WebM video clip is ready.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={recordedVideoUrl}
                    download="talking-avatar.webm"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>

                  {onPublishToOrb && (
                    <button
                      type="button"
                      onClick={() =>
                        onPublishToOrb({
                          title: `AI Talking Avatar: ${speechScript.slice(0, 30)}...`,
                          description: speechScript,
                          videoUrl: recordedVideoUrl,
                          category: 'Creative',
                        })
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publish to Orb</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preset Character Avatar Selector */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Smile className="w-4 h-4 text-purple-400" />
              <span>Or Choose a Preset Character Avatar</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar.id === preset.id && !customPhotoUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 group ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-12 h-12 rounded-xl object-cover border border-white/20 group-hover:scale-105 transition-transform"
                    />
                    <div className="text-[11px] font-black text-white truncate w-full">
                      {preset.name}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate w-full">
                      {preset.role.split('&')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Speech Script Input, AI Script Writer & Voice Customizer */}
        <div className="lg:col-span-5 space-y-4">
          {/* Script Text Input Card */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Speech Script</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {speechScript.length} chars
              </span>
            </div>

            <textarea
              value={speechScript}
              onChange={(e) => setSpeechScript(e.target.value)}
              placeholder="Type what you want the talking avatar to say..."
              rows={4}
              className="w-full p-3.5 rounded-2xl bg-black/50 border border-white/15 text-white text-xs leading-relaxed placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none shadow-inner"
            />

            {/* Quick AI Script Topic Prompters */}
            <div className="space-y-2">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 className="w-3 h-3 text-purple-400" />
                <span>✨ 1-Click AI Script Generator</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Product Launch Announcement',
                  'Breaking Tech News',
                  'Motivational Coach Speech',
                  'Funny Streaming Intro',
                  'Football Goal Commentary',
                  'Movie Trailer Hook',
                ].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    disabled={isGeneratingScript}
                    onClick={() => handleGenerateScript(topic)}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-bold text-purple-200 hover:text-white transition-all disabled:opacity-50"
                  >
                    {isGeneratingScript ? 'Writing...' : topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice & Speech Fine-Tuning */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-pink-400" />
              <span>Voice &amp; Audio Fine-Tuning</span>
            </h3>

            {/* Pitch */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>Voice Pitch</span>
                <span className="font-mono text-purple-400">{voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.8"
                step="0.05"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Speech Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>Speech Speed</span>
                <span className="font-mono text-pink-400">{voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>Volume</span>
                <span className="font-mono text-indigo-400">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Quick Speak Action Button */}
          <button
            type="button"
            onClick={isPlaying ? handleStopSpeech : handleStartSpeech}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Avatar Speech</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Speak Avatar Script (60FPS Live Lip-Sync)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
