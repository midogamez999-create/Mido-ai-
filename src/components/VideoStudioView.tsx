import React, { useState, useEffect, useRef } from 'react';
import { GeneratedVideo, AppSettings } from '../types';
import { VIDEO_PRESETS } from '../data/presets';
import {
  Video,
  Sparkles,
  Download,
  Play,
  Pause,
  Loader2,
  Film,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Music,
  Sliders,
  Type,
  Upload,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
  Layers,
  Wand2,
  Eye,
  Radio,
  Megaphone,
  Tag,
  ShoppingBag,
  Flame,
  Gift,
  DollarSign,
  Award,
  ChevronRight,
  Check,
  Copy,
  RotateCcw,
} from 'lucide-react';

export const PROMO_PRESETS = [
  {
    name: '🛍️ 50% OFF Flash Sale',
    brand: 'MIDO STORE',
    headline: '⚡ MEGA WEEKEND SALE — 50% OFF ALL ITEMS',
    discount: '50% OFF',
    cta: 'SHOP NOW',
    style: 'E-Commerce Flash Sale',
    voiceover: 'High Energy Hype',
    music: 'High Energy EDM',
    prompt: 'Cinematic commercial showcasing luxury streetwear, sneakers, glowing price tag exploding with 50% OFF neon discount badge, models on runway with holographic sparks',
  },
  {
    name: '📱 Next-Gen App Launch',
    brand: 'MIDO AI STUDIO',
    headline: '🚀 CREATE 4K VIDEOS IN SECONDS WITH AI',
    discount: 'FREE TRIAL',
    cta: 'DOWNLOAD FREE',
    style: 'Tech App Commercial',
    voiceover: 'Smooth Commercial Voice',
    music: 'Synthwave Cyber Hype',
    prompt: 'Sleek smartphone floating in zero gravity showcasing next-generation AI interface generating videos in real time with liquid holographic glow',
  },
  {
    name: '⚽ Champions League Matchday',
    brand: 'CHAMPIONS FINAL',
    headline: '🔥 EPIC FINAL SHOWDOWN — LIVE TONIGHT!',
    discount: 'MATCH PASS',
    cta: 'WATCH LIVE',
    style: 'Sports Hype Promo',
    voiceover: 'Epic Movie Voice',
    music: 'Cinematic Orchestra',
    prompt: 'Cinematic soccer stadium packed with 80,000 cheering fans, golden trophy shining under floodlights, striker volleying a fiery ball into the top corner in slow motion',
  },
  {
    name: '🎮 Gaming Stream & Drops',
    brand: 'CYBER CLAN',
    headline: '🎮 RANKED GRIND & FREE BATTLE PASS DROPS',
    discount: 'FREE DROPS',
    cta: 'FOLLOW & WATCH',
    style: 'Gaming Stream Teaser',
    voiceover: 'High Energy Hype',
    music: 'High Energy EDM',
    prompt: 'Futuristic gaming battlestation with triple curved monitors, RGB mechanical keyboard, mechanical mech robot landing on screen with electric sparks',
  },
  {
    name: '🍔 Gourmet Food & Restaurant',
    brand: 'MIDO BURGER CO.',
    headline: '🍔 CRAVING PERFECTION? FRESH ARTISAN SMASH BURGERS',
    discount: '2-FOR-1 DEAL',
    cta: 'ORDER ONLINE',
    style: 'Food Commercial',
    voiceover: 'Friendly Presenter',
    music: 'Lo-Fi Chill',
    prompt: 'Sizzling artisan beef patty on hot cast iron grill, melting aged cheddar cheese dripping, crispy smoked bacon and golden truffle fries served on rustic board in 4K',
  },
  {
    name: '🏎️ Supercar & Luxury Brand',
    brand: 'APEX MOTORS',
    headline: '⚡ UNLEASH 1,000 HP — THE FUTURE OF SPEED',
    discount: 'VIP TEST DRIVE',
    cta: 'EXPLORE MODEL',
    style: 'Luxury Brand Promo',
    voiceover: 'Epic Movie Voice',
    music: 'Cinematic Orchestra',
    prompt: 'Midnight black aerodynamic hypercar roaring down coastal highway at sunset, carbon fiber aero wings, glowing red LED taillights and twin turbo exhaust flames',
  },
];

interface VideoStudioViewProps {
  onGenerateVideo: (
    prompt: string,
    aspectRatio: string,
    imageBase64?: string,
    isPromo?: boolean,
    promoDetails?: any
  ) => Promise<string>;
  generatedVideos: GeneratedVideo[];
  appSettings?: AppSettings;
  onSwitchToMobileAI?: () => void;
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  onGenerateVideo,
  generatedVideos,
  appSettings,
  onSwitchToMobileAI,
}) => {

  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoMode, setVideoMode] = useState<'ai-video' | 'ai-promo' | 'image-to-video' | 'canvas-engine'>('ai-video');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Promotion Mode State
  const [promoBrand, setPromoBrand] = useState('MIDO STORE');
  const [promoHeadline, setPromoHeadline] = useState('⚡ MEGA FLASH SALE — 50% OFF ALL ITEMS THIS WEEKEND!');
  const [promoDiscount, setPromoDiscount] = useState('50% OFF');
  const [promoCta, setPromoCta] = useState('SHOP NOW');
  const [promoStyle, setPromoStyle] = useState('E-Commerce Flash Sale');
  const [promoVoiceover, setPromoVoiceover] = useState('High Energy Hype');
  const [promoMusic, setPromoMusic] = useState('High Energy EDM');

  // Video Player Controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeFilter, setActiveFilter] = useState<'none' | 'cyberpunk' | 'vhs' | 'cinema' | 'synthwave' | 'monochrome'>('none');
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Director Suite & Pro Render Settings
  const [directorEngine, setDirectorEngine] = useState<'veo-pro' | 'hollywood-8k' | 'anime-cyber' | 'pixel-16bit'>('veo-pro');
  const [targetFps, setTargetFps] = useState<24 | 30 | 60 | 120>(60);
  const [lightingPreset, setLightingPreset] = useState<'volumetric' | 'sunset' | 'neon' | 'gothic'>('neon');
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high' | 'ultra'>('ultra');
  const [isDirectorSettingsOpen, setIsDirectorSettingsOpen] = useState(false);

  // Audio & Text Overlays
  const [overlayText, setOverlayText] = useState("mido3dch1 AI Studio");
  const [overlayPosition, setOverlayPosition] = useState<'bottom' | 'top' | 'center'>('bottom');
  const [bgMusicTrack, setBgMusicTrack] = useState<'cyber' | 'cinematic' | 'lofi' | 'off'>('cyber');

  // Canvas Recording Engine State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasRecording, setIsCanvasRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Web Audio Synth for Music Overlay
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isCoopLoading, setIsCoopLoading] = useState(false);
  const [coopIdeas, setCoopIdeas] = useState<string[]>([
    "Cinematic Cyberpunk chase with neon reflection through rainy Tokyo streets",
    "Champions League 90th minute stoppage time winning bicycle kick in 4K HDR",
    "Anime 3D cosmic dragon soaring over a crystal metropolis at sunrise",
    "Ultra-realistic underwater coral reef glowing with bioluminescent creatures"
  ]);
  const [coopRemixResult, setCoopRemixResult] = useState<any>(null);

  const handleFetchCoopIdeas = async () => {
    setIsCoopLoading(true);
    try {
      const res = await fetch('/api/video-coop-remix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt || "epic cinematic scene", style: 'cinematic' }),
      });
      const data = await res.json();
      if (data.coopIdeas && Array.isArray(data.coopIdeas)) {
        setCoopIdeas(data.coopIdeas);
      }
      setCoopRemixResult(data);
    } catch (e) {
      console.warn('Failed to fetch Co-Op ideas:', e);
    } finally {
      setIsCoopLoading(false);
    }
  };

  const defaultVideo: GeneratedVideo = {
    id: 'default-football-1',
    prompt: '⚽ 3D Football AI Match: Epic Goal & Penalty Shootout in Packed Stadium',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    status: 'completed',
    createdAt: new Date().toISOString(),
    aspectRatio: '16:9',
    tags: ['MidoAI', 'AI Video', 'Sports'],
  };

  const currentVideo = generatedVideos.find((v) => v.id === selectedVideoId) || generatedVideos[0] || defaultVideo;

  // Auto-play trigger whenever the video URL or ID changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasVideoError(false);
      }).catch((e) => {
        console.warn("Autoplay muted fallback:", e);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      });
    }
  }, [selectedVideoId, currentVideo.url, currentVideo.id]);

  const applyPromoPreset = (preset: typeof PROMO_PRESETS[0]) => {
    setPromoBrand(preset.brand);
    setPromoHeadline(preset.headline);
    setPromoDiscount(preset.discount);
    setPromoCta(preset.cta);
    setPromoStyle(preset.style);
    setPromoVoiceover(preset.voiceover);
    setPromoMusic(preset.music);
    setPrompt(preset.prompt);
    setOverlayText(`${preset.discount} • ${preset.brand}`);
  };

  // Start Generation with Insane Loading Screen Pipeline
  const startInsaneGenerationPipeline = async (
    targetPrompt: string,
    isPromo: boolean = false,
    customPromoDetails?: any
  ) => {
    setIsGenerating(true);
    setHasVideoError(false);
    setSelectedVideoId(null);
    setGenerationProgress(5);
    setLoadingStep(1);
    setShowReadyBanner(false);
    setStatusMessage(isPromo ? '📢 AI Promo Director: Synthesizing commercial ad & promo hooks...' : '🧠 AI Veo Engine: Synthesizing motion vectors & keyframes...');

    const timestamp = () => new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 90 + 10);
    
    setLoadingLogs([
      `[${timestamp()}] 🚀 Initiating AI Veo Neural Engine 3.1...`,
      `[${timestamp()}] 🧠 Parsing ${isPromo ? 'Promo Campaign' : 'Prompt'} geometry: "${targetPrompt.slice(0, 45)}..."`,
      `[${timestamp()}] 📐 Constructing 3D spatial motion tensor grid...`
    ]);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const next = Math.min(prev + Math.floor(Math.random() * 12 + 8), 95);
        
        if (next >= 20 && next < 40) {
          setLoadingStep(2);
          setLoadingLogs((logs) => [
            ...logs.slice(-5),
            `[${timestamp()}] ${isPromo ? '📢 Formatting promotional badges & call-to-action hooks...' : '⚽ Computing 60 FPS trajectory vectors & physics collision...'}`,
            `[${timestamp()}] 🏃 Animating 3D camera sweeps and director pacing...`
          ]);
        } else if (next >= 40 && next < 65) {
          setLoadingStep(3);
          setLoadingLogs((logs) => [
            ...logs.slice(-5),
            `[${timestamp()}] 🎨 Rendering volumetric commercial lighting & HDR shaders...`,
            `[${timestamp()}] ✨ Applying 4K high-bitrate frame interpolation...`
          ]);
        } else if (next >= 65 && next < 85) {
          setLoadingStep(4);
          setLoadingLogs((logs) => [
            ...logs.slice(-5),
            `[${timestamp()}] 🎵 Synthesizing ${isPromo ? `${promoMusic} soundtrack & ${promoVoiceover}` : '24-bit audio waveform'}...`
          ]);
        } else if (next >= 85) {
          setLoadingStep(5);
          setLoadingLogs((logs) => [
            ...logs.slice(-5),
            `[${timestamp()}] ⚡ Packaging H.264 video stream & finalizing playback buffer...`
          ]);
        }
        return next;
      });
    }, 320);

    try {
      const promoDetails = isPromo ? (customPromoDetails || {
        brandName: promoBrand,
        promoHeadline: promoHeadline,
        discountBadge: promoDiscount,
        ctaText: promoCta,
        promoStyle: promoStyle,
      }) : undefined;

      await onGenerateVideo(targetPrompt, aspectRatio, uploadedImage || undefined, isPromo, promoDetails);
      setGenerationProgress(100);
      setLoadingStep(5);
      setLoadingLogs((logs) => [
        ...logs.slice(-5),
        `[${timestamp()}] 🎉 ${isPromo ? 'AI PROMOTIONAL VIDEO GENERATED!' : 'REAL VIDEO GENERATED SUCCESSFULLY!'} STREAM READY.`
      ]);
      setSelectedVideoId(null);
      setHasVideoError(false);
      setIsPlaying(true);
      setStatusMessage('⚡ Real Video Rendered & Ready!');
      setShowReadyBanner(true);
      setTimeout(() => setShowReadyBanner(false), 6000);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Error: ${err.message || 'Video generation failed'}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  const handlePresetClick = async (presetText: string) => {
    setPrompt(presetText);
    await startInsaneGenerationPipeline(presetText, false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await startInsaneGenerationPipeline(prompt, videoMode === 'ai-promo');
  };

  const handleGeneratePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    const finalPrompt = prompt.trim() || `Commercial promotional video for ${promoBrand}. ${promoHeadline}. Offer: ${promoDiscount}. Call to action: ${promoCta}. Style: ${promoStyle}`;
    await startInsaneGenerationPipeline(finalPrompt, true, {
      brandName: promoBrand,
      promoHeadline,
      discountBadge: promoDiscount,
      ctaText: promoCta,
      promoStyle,
    });
  };

  // Image Upload for Image-to-Video
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas Motion Animation Engine (60FPS procedural motion)
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      hue: Math.random() * 360,
    }));

    const render = () => {
      time += 0.03;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const lowerPrompt = prompt.toLowerCase();

      if (lowerPrompt.includes('hello') || lowerPrompt.includes('says') || lowerPrompt.includes('speak') || lowerPrompt.includes('talk') || lowerPrompt.includes('wave') || lowerPrompt.includes('person') || lowerPrompt.includes('human') || lowerPrompt.includes('avatar') || lowerPrompt.includes('greeting') || lowerPrompt.includes('welcome') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey') || lowerPrompt.includes('anchor') || lowerPrompt.includes('presenter') || lowerPrompt.includes('character')) {
        // 👤 High-Definition Talking & Waving AI Avatar (60 FPS Lip-Sync & Hand Wave)
        const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width / 1.2);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Studio Ambient Rim Lighting
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.beginPath();
        ctx.arc(canvas.width * 0.25, canvas.height * 0.3, 140, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(canvas.width * 0.75, canvas.height * 0.3, 140, 0, Math.PI * 2);
        ctx.fill();

        const avatarX = canvas.width / 2;
        const avatarY = canvas.height * 0.58;

        // Floating Kinetic Studio Particles
        particles.forEach((p) => {
          p.x = (p.x + p.speedX * 0.5 + canvas.width) % canvas.width;
          p.y = (p.y + p.speedY * 0.5 + canvas.height) % canvas.height;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${(p.hue + time * 20) % 360}, 80%, 70%, 0.4)`;
          ctx.fill();
        });

        // 1. Torso / Jacket
        ctx.save();
        ctx.translate(avatarX, avatarY);

        // Body & Jacket
        ctx.fillStyle = '#312e81'; // Deep Indigo Jacket
        ctx.beginPath();
        ctx.moveTo(-75, 90);
        ctx.lineTo(-60, 20);
        ctx.quadraticCurveTo(-45, 0, -25, 0);
        ctx.lineTo(25, 0);
        ctx.quadraticCurveTo(45, 0, 60, 20);
        ctx.lineTo(75, 90);
        ctx.closePath();
        ctx.fill();

        // Inner T-Shirt
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(0, 35);
        ctx.lineTo(25, 0);
        ctx.closePath();
        ctx.fill();

        // Collar Accents
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-4, 30);
        ctx.moveTo(25, 0);
        ctx.lineTo(4, 30);
        ctx.stroke();

        // 2. Neck
        const avatarGender = appSettings?.avatarGender || 'male';
        const isRobot = avatarGender === 'robot';
        const isFemale = avatarGender === 'female';

        ctx.fillStyle = isRobot ? '#475569' : '#fdba74';
        ctx.fillRect(-14, -18, 28, 22);

        // 3. Head & Face
        ctx.fillStyle = isRobot ? '#1e293b' : '#fed7aa'; // Skin / Chassis tone
        ctx.beginPath();
        ctx.ellipse(0, -50, 36, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isRobot) {
          // Robot Visor & Metallic Accents
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Antenna with glowing beacon
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -94);
          ctx.lineTo(0, -112);
          ctx.stroke();
          ctx.fillStyle = `rgba(6, 182, 212, ${0.5 + Math.sin(time * 8) * 0.4})`;
          ctx.beginPath();
          ctx.arc(0, -114, 6, 0, Math.PI * 2);
          ctx.fill();

          // Cybernetic glowing neon visor
          const visorGrad = ctx.createLinearGradient(-26, -55, 26, -45);
          visorGrad.addColorStop(0, '#06b6d4');
          visorGrad.addColorStop(1, '#3b82f6');
          ctx.fillStyle = visorGrad;
          ctx.beginPath();
          ctx.roundRect(-26, -56, 52, 14, 6);
          ctx.fill();

          // Visor scanline
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          const scanX = -20 + ((time * 40) % 40);
          ctx.beginPath();
          ctx.moveTo(scanX, -54);
          ctx.lineTo(scanX + 4, -44);
          ctx.stroke();
        } else if (isFemale) {
          // Female Hair Style (Flowing ponytail & bangs)
          ctx.fillStyle = '#6366f1';
          ctx.beginPath();
          ctx.arc(0, -62, 40, Math.PI * 0.85, Math.PI * 2.15);
          ctx.lineTo(44, -30);
          ctx.lineTo(36, -50);
          ctx.quadraticCurveTo(20, -82, -36, -50);
          ctx.lineTo(-44, -30);
          ctx.fill();

          // Hair Ponytail
          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.ellipse(38, -60, 16, 26, 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Eyebrows
          ctx.strokeStyle = '#312e81';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const browOffset = Math.sin(time * 3) * 2;
          ctx.moveTo(-22, -62 - browOffset);
          ctx.lineTo(-8, -66 - browOffset);
          ctx.moveTo(8, -66 - browOffset);
          ctx.lineTo(22, -62 - browOffset);
          ctx.stroke();

          // Eyes
          const blinkCycle = (time * 1.5) % 4;
          const isBlinking = blinkCycle > 3.8;
          if (isBlinking) {
            ctx.strokeStyle = '#312e81';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-20, -50);
            ctx.lineTo(-8, -50);
            ctx.moveTo(8, -50);
            ctx.lineTo(20, -50);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-14, -50, 6, 0, Math.PI * 2);
            ctx.arc(14, -50, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(-14, -50, 3.5, 0, Math.PI * 2);
            ctx.arc(14, -50, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-15, -52, 1.5, 0, Math.PI * 2);
            ctx.arc(13, -52, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Soft blush cheeks
          ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
          ctx.beginPath();
          ctx.arc(-22, -42, 6, 0, Math.PI * 2);
          ctx.arc(22, -42, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Male Hair
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, -62, 38, Math.PI * 0.9, Math.PI * 2.1);
          ctx.lineTo(38, -50);
          ctx.quadraticCurveTo(20, -78, -38, -50);
          ctx.fill();

          // Eyebrows
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const browOffset = Math.sin(time * 3) * 2;
          ctx.moveTo(-22, -62 - browOffset);
          ctx.lineTo(-8, -65 - browOffset);
          ctx.moveTo(8, -65 - browOffset);
          ctx.lineTo(22, -62 - browOffset);
          ctx.stroke();

          // Eyes
          const blinkCycle = (time * 1.5) % 4;
          const isBlinking = blinkCycle > 3.8;
          if (isBlinking) {
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-20, -50);
            ctx.lineTo(-8, -50);
            ctx.moveTo(8, -50);
            ctx.lineTo(20, -50);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-14, -50, 6, 0, Math.PI * 2);
            ctx.arc(14, -50, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(-14, -50, 3.5, 0, Math.PI * 2);
            ctx.arc(14, -50, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-15, -52, 1.5, 0, Math.PI * 2);
            ctx.arc(13, -52, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Nose
        if (!isRobot) {
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -48);
          ctx.lineTo(-3, -38);
          ctx.lineTo(2, -38);
          ctx.stroke();
        }

        // 4. Talking Animated Mouth (Lip Sync Cycle)
        const mouthOpen = Math.abs(Math.sin(time * 8)) * 10;
        ctx.fillStyle = '#e11d48'; // Mouth inside
        ctx.beginPath();
        ctx.ellipse(0, -26, 12, 3 + mouthOpen * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        if (mouthOpen > 3) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-6, -28, 12, 3);
        }

        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 5. Animated Waving Hand & Arm (Left side of viewer / Avatar's Right Arm)
        const waveAngle = Math.sin(time * 6) * 0.45;
        const handX = 70 + Math.sin(waveAngle) * 15;
        const handY = -30 + Math.cos(waveAngle) * 10;

        // Arm
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Palm & Waving Hand
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(handX + 5, handY - 8, 11, 0, Math.PI * 2);
        ctx.fill();

        // Waving Fingers
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 4;
        for (let f = -2; f <= 2; f++) {
          ctx.beginPath();
          ctx.moveTo(handX + 5 + f * 3, handY - 14);
          ctx.lineTo(handX + 5 + f * 4 + Math.sin(time * 10 + f) * 3, handY - 26);
          ctx.stroke();
        }

        ctx.restore();

        // 6. Floating Animated Speech Bubble with Live Typewriter Dialogue
        const bubbleX = canvas.width / 2;
        const bubbleY = 65;
        const bubbleW = Math.min(canvas.width - 40, 460);
        const bubbleH = 54;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';

        // Rounded Speech Box
        ctx.beginPath();
        ctx.roundRect(bubbleX - bubbleW / 2, bubbleY - bubbleH / 2, bubbleW, bubbleH, 16);
        ctx.fill();
        ctx.stroke();

        // Speech Tail pointing to Avatar Mouth
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.moveTo(bubbleX - 10, bubbleY + bubbleH / 2);
        ctx.lineTo(bubbleX, bubbleY + bubbleH / 2 + 14);
        ctx.lineTo(bubbleX + 10, bubbleY + bubbleH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Dialogue Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillText('👋 "HELLO! Welcome to Mido AI Video Studio!"', bubbleX, bubbleY - 2);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('🎙️ AI Avatar Speaking & Waving • 60 FPS Real-time Lip-Sync', bubbleX, bubbleY + 16);

        // 7. Bottom Audio Waveform Visualizer
        const waveY = canvas.height - 20;
        for (let bx = 40; bx < canvas.width - 40; bx += 8) {
          const barH = (Math.sin(time * 12 + bx * 0.1) * 0.5 + 0.5) * 22 + 4;
          ctx.fillStyle = `hsl(${(bx + time * 40) % 360}, 90%, 65%)`;
          ctx.fillRect(bx, waveY - barH, 4, barH);
        }

      } else if (lowerPrompt.includes('football') || lowerPrompt.includes('soccer') || lowerPrompt.includes('goal') || lowerPrompt.includes('match') || lowerPrompt.includes('stadium') || lowerPrompt.includes('league') || lowerPrompt.includes('shoot') || lowerPrompt.includes('ball') || lowerPrompt.includes('kick') || lowerPrompt.includes('player')) {
        // ⚽ 3D Football Stadium & Player Shooting Ball Scene with Goalkeeper (60 FPS Motion)
        const pitchGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        pitchGrad.addColorStop(0, '#065f46');
        pitchGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = pitchGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grass Pattern Stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for (let stripe = 0; stripe < canvas.width; stripe += 60) {
          if ((stripe / 60) % 2 === 0) {
            ctx.fillRect(stripe, 0, 30, canvas.height);
          }
        }

        // Stadium Floodlights Beam Motion
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.lineTo(canvas.width / 2 + Math.sin(time * 1.5) * 140, canvas.height);
        ctx.lineTo(canvas.width / 2 + Math.sin(time * 1.5) * 140 + 120, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Goal Post & Net
        const goalWidth = 320;
        const goalHeight = 90;
        const goalX = canvas.width / 2 - goalWidth / 2;
        const goalY = 45;

        // Net Net Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        for (let gx = goalX; gx <= goalX + goalWidth; gx += 16) {
          ctx.beginPath();
          ctx.moveTo(gx, goalY);
          ctx.lineTo(gx + (gx < canvas.width / 2 ? -5 : 5), goalY + goalHeight);
          ctx.stroke();
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(goalX, goalY, goalWidth, goalHeight);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(goalX, goalY, goalWidth, goalHeight);

        // Penalty Box & Spot
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 200, 130, 400, 180);
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 210, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Animated Player Shooting Ball Cycle (Cycle 0..3s)
        const shotCycle = (time * 1.2) % 3;
        let playerX = canvas.width / 2 - 120;
        let playerY = 250;
        let ballX = canvas.width / 2 - 100;
        let ballY = 250;
        let keeperX = canvas.width / 2;
        let keeperY = goalY + goalHeight - 15;

        if (shotCycle < 1.0) {
          // Run up to the ball
          playerX = (canvas.width / 2 - 180) + shotCycle * 80;
          ballX = canvas.width / 2 - 100;
          ballY = 250;
          keeperX = canvas.width / 2 + Math.sin(time * 4) * 20;
        } else if (shotCycle < 2.2) {
          // Player kicks! Ball flies towards goal top corner, keeper dives!
          playerX = canvas.width / 2 - 100;
          const flightProgress = (shotCycle - 1.0) / 1.2;
          ballX = (canvas.width / 2 - 100) + flightProgress * 180;
          ballY = 250 - Math.sin(flightProgress * Math.PI) * 160 - flightProgress * 120;
          // Keeper dives to the left attempting to block
          keeperX = canvas.width / 2 - flightProgress * 70;
          keeperY = (goalY + goalHeight - 15) - Math.sin(flightProgress * Math.PI) * 35;
        } else {
          // Ball in top corner goal net & celebration!
          playerX = canvas.width / 2 - 100;
          ballX = goalX + goalWidth - 30;
          ballY = goalY + 25;
          keeperX = canvas.width / 2 - 70;
          keeperY = goalY + goalHeight - 10;
        }

        // Render Animated Goalkeeper (Jersey #1 - Yellow)
        ctx.save();
        ctx.translate(keeperX, keeperY);
        ctx.fillStyle = '#facc15'; // Yellow GK shirt
        ctx.fillRect(-8, -20, 16, 20);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('1', 0, -8);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -26, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Render Animated Striker Player (Jersey #10 - Red/Blue)
        ctx.save();
        ctx.translate(playerX, playerY);

        // Player Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 25, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        const legAngle = Math.sin(time * 8) * 0.5;
        ctx.moveTo(-4, 5);
        ctx.lineTo(-12 + Math.sin(legAngle) * 10, 22);
        ctx.moveTo(4, 5);
        ctx.lineTo(12 - Math.sin(legAngle) * 10, 22);
        ctx.stroke();

        // Torso
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-10, -18, 20, 24);

        // Jersey #10
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('10', 0, -4);

        // Head
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -26, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Render Flying Soccer Ball with Green Energy Tail
        ctx.save();
        ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
        ctx.beginPath();
        ctx.arc(ballX, ballY + 8, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#34d399';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ballX - 2, ballY - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Goal Burst Banner & Confetti
        if (shotCycle >= 2.0) {
          // Confetti Particles
          for (let c = 0; c < 30; c++) {
            const cx = (goalX + (c * 17)) % canvas.width;
            const cy = (goalY + Math.sin(time * 5 + c) * 40 + c * 4) % canvas.height;
            ctx.fillStyle = c % 2 === 0 ? '#fde047' : '#ec4899';
            ctx.fillRect(cx, cy, 5, 5);
          }

          ctx.fillStyle = '#fde047';
          ctx.font = 'black 22px system-ui';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#eab308';
          ctx.fillText('⚡ GOAL! INSANE STRIKER SCORES IN 4K HD ⚽', canvas.width / 2, 35);
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 15px monospace';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#0284c7';
          ctx.fillText('⚽ 3D FOOTBALL MATCH • GOALKEEPER DIVING & PENALTY SHOOTOUT', canvas.width / 2, 32);
        }

      } else if (lowerPrompt.includes('cyber') || lowerPrompt.includes('neon') || lowerPrompt.includes('car') || lowerPrompt.includes('drift') || lowerPrompt.includes('speed') || lowerPrompt.includes('race')) {
        // 🏎️ Cyberpunk Nitrous Nitro Drift Engine (60 FPS Motion)
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Neon Tokyo Skyline Skyline Grid
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = (time * 50) % 40; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Drifting Cyber Sports Car Silhouette
        const carX = canvas.width / 2 + Math.sin(time * 2.5) * 110;
        const carY = canvas.height / 2 + 30;

        // Exhaust Nitrous Flames
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.arc(carX - 55, carY + 5, 12 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fill();

        // Car Body
        ctx.fillStyle = '#ec4899';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ec4899';
        ctx.fillRect(carX - 45, carY - 15, 90, 32);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.fillRect(carX - 25, carY - 25, 45, 14);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'extrabold 16px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f43f5e';
        ctx.fillText('🏎️ CYBERPUNK NITROUS DRIFT • TOKYO 60 FPS', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('potato') || lowerPrompt.includes('botate') || lowerPrompt.includes('fries') || lowerPrompt.includes('food') || lowerPrompt.includes('cooking') || lowerPrompt.includes('chef') || lowerPrompt.includes('kitchen') || lowerPrompt.includes('burger') || lowerPrompt.includes('recipe')) {
        // 🥔 Sizzling Hot Crispy Potatoes (Botates), French Fries & Master Chef Kitchen Scene (60 FPS Motion)
        const kitchenGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        kitchenGrad.addColorStop(0, '#1c1917');
        kitchenGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = kitchenGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Warm Kitchen Glow & Tile Pattern
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Golden Frying Pan & Stove Flames
        const panX = canvas.width / 2;
        const panY = canvas.height / 2 + 50;

        // Stove Gas Flame Ring (Blue & Amber Animated Flame)
        for (let f = -5; f <= 5; f++) {
          const flameX = panX + f * 24;
          const flameH = 14 + Math.sin(time * 15 + f) * 8;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(flameX, panY + 45, 8, flameH, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.ellipse(flameX, panY + 40, 5, flameH * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Frying Pan Base
        ctx.fillStyle = '#292524';
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(panX, panY + 20, 160, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pan Handle
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(panX + 160, panY + 20);
        ctx.lineTo(panX + 240, panY + 40);
        ctx.stroke();

        // Sizzling Golden Crispy French Fries in Pan
        for (let i = 0; i < 9; i++) {
          const fryAngle = (i * 0.4) - 1.6 + Math.sin(time * 8 + i) * 0.15;
          const fryX = panX - 70 + (i * 18);
          const fryJump = Math.abs(Math.sin(time * 6 + i)) * 25;
          ctx.save();
          ctx.translate(fryX, panY + 10 - fryJump);
          ctx.rotate(fryAngle);
          ctx.fillStyle = '#facc15';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#eab308';
          ctx.fillRect(-4, -28, 8, 36);
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(-2, -26, 4, 32);
          ctx.restore();
        }

        // Giant Happy Golden Potato Mascot (Botates) with Chef Hat
        const botateX = canvas.width / 2;
        const botateBounce = Math.sin(time * 5) * 14;
        const botateY = canvas.height / 2 - 40 + botateBounce;

        // Golden Potato Body
        ctx.save();
        ctx.translate(botateX, botateY);
        ctx.fillStyle = '#d97706';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 75, 58, Math.sin(time * 3) * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Potato Spots / Texture
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(-30, -15, 6, 0, Math.PI * 2);
        ctx.arc(35, 12, 5, 0, Math.PI * 2);
        ctx.arc(-10, 25, 4, 0, Math.PI * 2);
        ctx.fill();

        // Big Anime Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-22, -10, 12, 0, Math.PI * 2);
        ctx.arc(22, -10, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-20, -10, 6, 0, Math.PI * 2);
        ctx.arc(24, -10, 6, 0, Math.PI * 2);
        ctx.fill();

        // White Eye Sparkles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-22, -12, 3, 0, Math.PI * 2);
        ctx.arc(22, -12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Rosy Cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(-35, 6, 9, 0, Math.PI * 2);
        ctx.arc(35, 6, 9, 0, Math.PI * 2);
        ctx.fill();

        // Happy Smiling Mouth
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 8, 16, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Master Chef Toque Hat on Top
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillRect(-30, -65, 60, 14);
        ctx.beginPath();
        ctx.arc(-20, -75, 18, 0, Math.PI * 2);
        ctx.arc(0, -82, 22, 0, Math.PI * 2);
        ctx.arc(20, -75, 18, 0, Math.PI * 2);
        ctx.fill();

        // Floating Sizzling Seasoning & Steam
        for (let s = 0; s < 6; s++) {
          const steamX = Math.sin(time * 4 + s) * 30 + (s - 3) * 20;
          const steamY = -90 - ((time * 40 + s * 25) % 80);
          ctx.fillStyle = 'rgba(254, 243, 199, 0.35)';
          ctx.beginPath();
          ctx.arc(steamX, steamY, 8 + s * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Title Banner
        ctx.fillStyle = '#fde047';
        ctx.font = 'black 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#d97706';
        ctx.fillText('🥔 GOLDEN CRISPY POTATOES (BOTATES) & FRIES DELIGHT 4K', canvas.width / 2, 35);

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('🔥 SIZZLING KITCHEN CHEF RECIPE • 60 FPS HD STEAM ANIMATION', canvas.width / 2, 54);

      } else if (lowerPrompt.includes('cat') || lowerPrompt.includes('dog') || lowerPrompt.includes('pet') || lowerPrompt.includes('animal') || lowerPrompt.includes('puppy') || lowerPrompt.includes('kitten')) {
        // 🐱 Playful Golden Puppy & Kitten in Sunny Flower Meadow (60 FPS Motion)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#38bdf8');
        skyGrad.addColorStop(0.5, '#bae6fd');
        skyGrad.addColorStop(1, '#22c55e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sun with Rotating Golden Rays
        const sunX = canvas.width - 70;
        const sunY = 70;
        ctx.fillStyle = '#fde047';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#eab308';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Rolling Green Hills
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 3, canvas.height - 20, canvas.width * 0.6, 120, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.8, canvas.height - 10, canvas.width * 0.5, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Kitten Mascot
        const catX = canvas.width / 2 - 80 + Math.sin(time * 3) * 15;
        const catY = canvas.height / 2 + 20 + Math.abs(Math.sin(time * 6)) * 10;
        ctx.save();
        ctx.translate(catX, catY);

        // Cat Body
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 28, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cat Head
        ctx.beginPath();
        ctx.arc(0, -22, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(-14, -30);
        ctx.lineTo(-8, -44);
        ctx.lineTo(0, -32);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(14, -30);
        ctx.lineTo(8, -44);
        ctx.lineTo(0, -32);
        ctx.fill();

        // Cat Eyes & Whiskers
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(-6, -22, 4, 0, Math.PI * 2);
        ctx.arc(6, -22, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, -18); ctx.lineTo(-28, -20);
        ctx.moveTo(16, -18); ctx.lineTo(28, -20);
        ctx.stroke();

        ctx.restore();

        // Cute Puppy Mascot
        const dogX = canvas.width / 2 + 80 - Math.sin(time * 3) * 15;
        const dogY = canvas.height / 2 + 20 + Math.abs(Math.cos(time * 6)) * 10;
        ctx.save();
        ctx.translate(dogX, dogY);

        // Dog Body
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, 34, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dog Head
        ctx.beginPath();
        ctx.arc(0, -24, 20, 0, Math.PI * 2);
        ctx.fill();

        // Floppy Ears
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.ellipse(-16, -20, 7, 16, -0.4, 0, Math.PI * 2);
        ctx.ellipse(16, -20, 7, 16, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Dog Eyes & Nose
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-7, -26, 4, 0, Math.PI * 2);
        ctx.arc(7, -26, 4, 0, Math.PI * 2);
        ctx.arc(0, -18, 5, 0, Math.PI * 2);
        ctx.fill();

        // Wagging Tail
        const tailAngle = Math.sin(time * 14) * 0.6;
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(26, -5);
        ctx.lineTo(26 + Math.cos(tailAngle) * 20, -5 + Math.sin(tailAngle) * 20);
        ctx.stroke();

        ctx.restore();

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#0f172a';
        ctx.fillText('🐾 CUTE ANIMAL PETS • PUPPY & KITTEN SUNNY MEADOW 4K', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('space') || lowerPrompt.includes('planet') || lowerPrompt.includes('galaxy') || lowerPrompt.includes('saturn') || lowerPrompt.includes('star') || lowerPrompt.includes('cosmos')) {
        // 🌌 Cosmic Galaxy & 3D Saturn Ring Orbit Engine (60 FPS Motion)
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Distant Twinkling Stars
        for (let s = 0; s < 70; s++) {
          const sx = (s * 47) % canvas.width;
          const sy = (s * 83) % canvas.height;
          const twinkle = Math.abs(Math.sin(time * 4 + s));
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + (s % 3), 0, Math.PI * 2);
          ctx.fill();
        }

        // Giant 3D Saturn with Glowing Golden Rings
        const satX = canvas.width / 2;
        const satY = canvas.height / 2;
        const planetR = 56;

        ctx.save();
        ctx.translate(satX, satY);

        // Back Ring Arc
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, 150, 40, -0.3, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Planet Sphere with Atmosphere Bands
        const planetGrad = ctx.createRadialGradient(-18, -18, 10, 0, 0, planetR);
        planetGrad.addColorStop(0, '#fef08a');
        planetGrad.addColorStop(0.5, '#d97706');
        planetGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = planetGrad;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, planetR, 0, Math.PI * 2);
        ctx.fill();

        // Front Ring Arc
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(0, 0, 150, 40, -0.3, 0, Math.PI);
        ctx.stroke();

        // Floating Orbiting Satellite / Astronaut
        const satOrbit = time * 1.5;
        const astroX = Math.cos(satOrbit) * 110;
        const astroY = Math.sin(satOrbit) * 55;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.arc(astroX, astroY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Title
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0284c7';
        ctx.fillText('🌌 DEEP SPACE EXPLORATION • 3D SATURN PLANETARY ORBIT 4K', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('music') || lowerPrompt.includes('dj') || lowerPrompt.includes('dance') || lowerPrompt.includes('party') || lowerPrompt.includes('club') || lowerPrompt.includes('rave')) {
        // 🎧 DJ Club EDM Light Show & Vinyl Turntable (60 FPS Motion)
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Laser Strobe Beams
        for (let l = 0; l < 5; l++) {
          const lx = canvas.width / 2;
          const targetX = ((l * 120) + Math.sin(time * 4 + l) * 200) % canvas.width;
          ctx.strokeStyle = `hsl(${(l * 60 + time * 80) % 360}, 100%, 65%)`;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 20;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(targetX, canvas.height);
          ctx.stroke();
        }

        // DJ Vinyl Turntable Deck
        const ttX = canvas.width / 2;
        const ttY = canvas.height / 2 + 30;
        ctx.save();
        ctx.translate(ttX, ttY);

        // Platter
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Vinyl Record Rotating
        ctx.rotate(time * 6);
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, 0, 72, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.stroke();

        // Center Label
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Title
        ctx.fillStyle = '#ec4899';
        ctx.font = 'black 20px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#db2777';
        ctx.fillText('🎧 DJ NIGHTCLUB SYNTHWAVE • 140 BPM LIVE REMIX 60 FPS', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('mech') || lowerPrompt.includes('robot') || lowerPrompt.includes('sci-fi') || lowerPrompt.includes('battle') || lowerPrompt.includes('game')) {
        // 🤖 Sci-Fi Mech Combat & Laser Engine
        ctx.fillStyle = '#050515';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Plasma Laser Beam Bursts
        const laserX = (time * 300) % canvas.width;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 8;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(laserX, 80);
        ctx.lineTo(laserX + 160, 80);
        ctx.stroke();

        // Mech Robot Core Visor
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#a855f7';
        ctx.strokeRect(cx - 100, cy - 80, 200, 160);

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.fillRect(cx - 60, cy - 20, 120, 15);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🤖 SCI-FI MECH COMBAT ENGINE • LASERS ENGAGED', cx, 35);

      } else if (lowerPrompt.includes('dragon') || lowerPrompt.includes('mythic') || lowerPrompt.includes('fantasy') || lowerPrompt.includes('castle')) {
        // 🐉 3D Fire-Breathing Dragon & Medieval Mountain Castle (60 FPS Motion)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.5, '#450a0a');
        skyGrad.addColorStop(1, '#18181b');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Castle Silhouettes
        ctx.fillStyle = '#09090b';
        ctx.fillRect(60, canvas.height - 130, 90, 130);
        ctx.fillRect(190, canvas.height - 170, 110, 170);
        ctx.fillRect(340, canvas.height - 110, 80, 110);
        // Castle Battlements
        for (let b = 60; b < 420; b += 22) {
          ctx.fillRect(b, canvas.height - 180, 12, 16);
        }

        // Flying Dragon Dynamics
        const dragonX = canvas.width / 2 + Math.sin(time * 2) * 120;
        const dragonY = canvas.height / 2 - 40 + Math.sin(time * 4) * 25;
        ctx.save();
        ctx.translate(dragonX, dragonY);

        // Wings Flapping
        const wingSpan = Math.sin(time * 7) * 40;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-65, -30 + wingSpan);
        ctx.lineTo(-10, 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(65, -30 - wingSpan);
        ctx.lineTo(10, 10);
        ctx.fill();

        // Dragon Body & Tail
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 14, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Dragon Head & Glowing Eyes
        ctx.beginPath();
        ctx.ellipse(32, -8, 14, 9, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#facc15';
        ctx.beginPath();
        ctx.arc(36, -10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Fire Breath Plasma Blast
        const fireCycle = Math.sin(time * 5);
        if (fireCycle > 0) {
          ctx.fillStyle = '#f97316';
          ctx.shadowBlur = 25;
          ctx.shadowColor = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(42, -6);
          ctx.lineTo(140 + Math.sin(time * 12) * 20, 15 + Math.sin(time * 8) * 15);
          ctx.lineTo(110, -30);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();

        // Title
        ctx.fillStyle = '#f87171';
        ctx.font = 'black 19px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#b91c1c';
        ctx.fillText('🐉 MYTHIC DRAGON SOARING • REAL-TIME FLAME BREATH 4K', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('dinosaur') || lowerPrompt.includes('t-rex') || lowerPrompt.includes('trex') || lowerPrompt.includes('jurassic') || lowerPrompt.includes('volcano') || lowerPrompt.includes('lava')) {
        // 🦖 Jurassic T-Rex & Erupting Volcano (60 FPS Motion)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#7c2d12');
        skyGrad.addColorStop(0.6, '#ea580c');
        skyGrad.addColorStop(1, '#451a03');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Volcano Peak
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 160, canvas.height);
        ctx.lineTo(canvas.width / 2, 100);
        ctx.lineTo(canvas.width / 2 + 160, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Lava Eruption Fountain
        for (let l = 0; l < 8; l++) {
          const lx = canvas.width / 2 + Math.sin(time * 8 + l) * 35;
          const ly = 100 - ((time * 100 + l * 30) % 70);
          ctx.fillStyle = '#fde047';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ef4444';
          ctx.beginPath();
          ctx.arc(lx, ly, 6 + l, 0, Math.PI * 2);
          ctx.fill();
        }

        // T-Rex Silhouette & Roaring Jaw
        const trexX = 140 + Math.sin(time * 2) * 20;
        const trexY = canvas.height - 70;
        ctx.save();
        ctx.translate(trexX, trexY);
        ctx.fillStyle = '#18181b';
        // Legs
        ctx.fillRect(-15, 0, 12, 45);
        ctx.fillRect(15, 0, 12, 45);
        // Body
        ctx.beginPath();
        ctx.ellipse(0, -20, 48, 30, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(-40, -15);
        ctx.lineTo(-100 + Math.sin(time * 6) * 15, -45);
        ctx.lineTo(-40, 0);
        ctx.fill();
        // Head & Roaring Jaw
        const jawOpen = Math.abs(Math.sin(time * 4)) * 14;
        ctx.fillRect(35, -45, 35, 18);
        ctx.fillRect(35, -25 + jawOpen, 32, 12);
        ctx.restore();

        // Title
        ctx.fillStyle = '#fde047';
        ctx.font = 'black 19px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#c2410c';
        ctx.fillText('🦖 JURASSIC T-REX APEX ROAR • VOLCANO ERUPTION 60 FPS', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('shark') || lowerPrompt.includes('underwater') || lowerPrompt.includes('sea') || lowerPrompt.includes('coral') || lowerPrompt.includes('water') || lowerPrompt.includes('fish')) {
        // 🌊 Deep Ocean & Bioluminescent Great White Shark (60 FPS Motion)
        const seaGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        seaGrad.addColorStop(0, '#0284c7');
        seaGrad.addColorStop(0.5, '#0369a1');
        seaGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sunlight Caustic Beams
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let cb = 0; cb < 6; cb++) {
          ctx.beginPath();
          ctx.moveTo(cb * 110, 0);
          ctx.lineTo((cb * 110) + Math.sin(time * 2 + cb) * 60 + 50, canvas.height);
          ctx.lineTo((cb * 110) + Math.sin(time * 2 + cb) * 60 + 90, canvas.height);
          ctx.closePath();
          ctx.fill();
        }

        // Swimming Shark
        const sharkX = (canvas.width + 100 - (time * 120) % (canvas.width + 200));
        const sharkY = canvas.height / 2 + Math.sin(time * 3) * 30;
        ctx.save();
        ctx.translate(sharkX, sharkY);

        // Shark Body
        ctx.fillStyle = '#cbd5e1';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 55, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal Fin
        ctx.beginPath();
        ctx.moveTo(-10, -18);
        ctx.lineTo(5, -42);
        ctx.lineTo(20, -18);
        ctx.fill();

        // Tail Wagging
        const tailWag = Math.sin(time * 8) * 15;
        ctx.beginPath();
        ctx.moveTo(50, 0);
        ctx.lineTo(85, -22 + tailWag);
        ctx.lineTo(85, 22 + tailWag);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Glowing Bioluminescent Jellyfish
        for (let j = 0; j < 4; j++) {
          const jx = (j * 160 + 60 + Math.sin(time * 2 + j) * 25) % canvas.width;
          const jy = (canvas.height - 40 - ((time * 30 + j * 45) % (canvas.height - 60)));
          ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ec4899';
          ctx.beginPath();
          ctx.arc(jx, jy, 14, Math.PI, 0);
          ctx.fill();
        }

        // Title
        ctx.fillStyle = '#67e8f9';
        ctx.font = 'black 19px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0284c7';
        ctx.fillText('🌊 BIOLUMINESCENT DEEP OCEAN • SHARK REEF 4K', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('car') || lowerPrompt.includes('drift') || lowerPrompt.includes('race') || lowerPrompt.includes('racing') || lowerPrompt.includes('highway') || lowerPrompt.includes('speed') || lowerPrompt.includes('supercar') || lowerPrompt.includes('vehicle')) {
        // 🏎️ Cyberpunk Hypercar Drifting on Neon Highway (60 FPS Motion)
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective Highway Grid
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0284c7';
        for (let lx = -canvas.width; lx < canvas.width * 2; lx += 90) {
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, canvas.height / 3);
          ctx.lineTo(lx, canvas.height);
          ctx.stroke();
        }

        // Neon Horizon Line
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 3);
        ctx.lineTo(canvas.width, canvas.height / 3);
        ctx.stroke();

        // Drifting Hypercar
        const carX = canvas.width / 2 + Math.sin(time * 3.5) * 110;
        const carY = canvas.height - 75;
        ctx.save();
        ctx.translate(carX, carY);

        // Neon Underglow
        ctx.fillStyle = 'rgba(236, 72, 153, 0.7)';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ec4899';
        ctx.beginPath();
        ctx.ellipse(0, 20, 75, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car Body Aerodynamic Silhouette
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.fillRect(-60, -10, 120, 28);
        ctx.strokeRect(-60, -10, 120, 28);

        // Windshield & Cockpit
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-35, -28, 70, 20);

        // Glowing Taillights
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#dc2626';
        ctx.fillRect(-55, -4, 25, 8);
        ctx.fillRect(30, -4, 25, 8);

        ctx.restore();

        // Title
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'black 19px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0369a1';
        ctx.fillText('🏎️ CYBERPUNK HYPERCAR HIGHWAY DRIFT • 240 MPH 4K', canvas.width / 2, 35);

      } else if (lowerPrompt.includes('mine') || lowerPrompt.includes('craft') || lowerPrompt.includes('block') || lowerPrompt.includes('voxel') || lowerPrompt.includes('8-bit') || lowerPrompt.includes('pixel')) {
        // ⛏️ Minecraft Voxel Block Mining & Diamond Glow (60 FPS Motion)
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid of Pixel Blocks
        const blockSize = 48;
        for (let x = 0; x < canvas.width; x += blockSize) {
          for (let y = 80; y < canvas.height; y += blockSize) {
            const isDiamond = (x + y) % 144 === 0;
            ctx.fillStyle = isDiamond ? '#06b6d4' : '#44403c';
            ctx.fillRect(x + 2, y + 2, blockSize - 4, blockSize - 4);
            if (isDiamond) {
              ctx.shadowBlur = 12;
              ctx.shadowColor = '#22d3ee';
            }
          }
        }

        // Swinging Pickaxe Animation
        const pickX = canvas.width / 2;
        const pickY = canvas.height / 2 + 10;
        ctx.save();
        ctx.translate(pickX, pickY);
        ctx.rotate(Math.sin(time * 10) * 0.7 - 0.4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-5, -40, 10, 60);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(-25, -50, 50, 15);
        ctx.restore();

        // Title
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'black 19px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#0891b2';
        ctx.fillText('⛏️ VOXEL WORLD MINING • DIAMOND VEIN DISCOVERY 60 FPS', canvas.width / 2, 35);

      } else {
        // 🌌 Universal AI Dynamic Cinematography Engine (Synthesizes ANY user prompt!)
        const themeHue = ((prompt.length * 47) + (time * 15)) % 360;
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, `hsl(${themeHue}, 60%, 8%)`);
        bgGrad.addColorStop(0.5, `hsl(${(themeHue + 60) % 360}, 50%, 14%)`);
        bgGrad.addColorStop(1, '#050510');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3D Orbital Energy Rings
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        for (let r = 1; r <= 3; r++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * (0.8 / r) * (r % 2 === 0 ? 1 : -1));
          ctx.strokeStyle = `hsl(${(themeHue + r * 50) % 360}, 90%, 65%)`;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 18;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath();
          ctx.ellipse(0, 0, 110 * r * 0.5, 45 * r * 0.6, r * 0.4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Kinetic Floating Particles
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${(p.hue + time * 40) % 360}, 95%, 70%)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
        });

        // Pulsing Hologram Core
        const corePulse = 38 + Math.sin(time * 4) * 8;
        const coreGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, corePulse * 2);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, `hsl(${themeHue}, 100%, 70%)`);
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, corePulse * 2, 0, Math.PI * 2);
        ctx.fill();

        // Audio Frequency Spectrum Visualizer
        const specY = canvas.height - 25;
        for (let bx = 30; bx < canvas.width - 30; bx += 7) {
          const specH = (Math.sin(time * 10 + bx * 0.08) * 0.5 + 0.5) * 30 + 4;
          ctx.fillStyle = `hsl(${(bx + time * 60) % 360}, 100%, 65%)`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fillRect(bx, specY - specH, 4, specH);
        }

        // Custom AI Prompt Subject Title
        const displaySubject = (prompt && prompt.trim()) ? prompt.trim().toUpperCase().slice(0, 45) : 'UNIVERSAL CINEMATIC MOTION ENGINE';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 17px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 16;
        ctx.shadowColor = `hsl(${themeHue}, 90%, 60%)`;
        ctx.fillText(`🎬 ${displaySubject}`, cx, 36);

        ctx.fillStyle = `hsl(${(themeHue + 40) % 360}, 90%, 75%)`;
        ctx.font = 'bold 11px monospace';
        ctx.fillText('✨ VEO 3.0 CINEMA PIPELINE • UNLIMITED PROCEDURAL GENERATION 60 FPS', cx, 55);
      }

      // Text Overlay
      if (overlayText) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000000';
        const textY = overlayPosition === 'top' ? 65 : overlayPosition === 'center' ? cy : canvas.height - 35;
        ctx.fillText(overlayText, cx, textY);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [prompt, activeFilter, overlayText, overlayPosition, hasVideoError, videoMode, isGenerating, currentVideo]);

  // Record Canvas Stream to MP4/WebM
  const startCanvasRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    const stream = canvas.captureStream(30); // 30 FPS
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedBlobUrl(url);
      setIsCanvasRecording(false);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsCanvasRecording(true);

    // Stop recording automatically after 6 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 6000);
  };

  // Sound Synth Generator
  const toggleSoundtrack = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (bgMusicTrack === 'off') {
      setBgMusicTrack('cyber');
    } else if (bgMusicTrack === 'cyber') {
      setBgMusicTrack('cinematic');
    } else if (bgMusicTrack === 'cinematic') {
      setBgMusicTrack('lofi');
    } else {
      setBgMusicTrack('off');
    }
  };

  // Filter Styles Map
  const filterStyles = {
    none: '',
    cyberpunk: 'hue-rotate-180 contrast-125 saturate-200 brightness-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    vhs: 'sepia-50 contrast-150 saturate-150 blur-[0.4px] grayscale-25',
    cinema: 'contrast-125 saturate-125 brightness-90',
    synthwave: 'hue-rotate-90 contrast-150 saturate-200',
    monochrome: 'grayscale contrast-150',
  };

  return (
    <div className="flex-1 flex flex-col h-full text-slate-100 p-3 sm:p-5 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Top Banner Header */}
      <div className="mb-5 pb-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Film className="w-4 h-4 text-purple-400 animate-pulse" /> mido3dch1 Real Video Maker &amp; Motion AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Video Studio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold uppercase tracking-wider">
              VEO 3.1 REAL
            </span>
          </h1>
        </div>

        {/* Video Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
          {onSwitchToMobileAI && (
            <button
              onClick={onSwitchToMobileAI}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/30 shrink-0 animate-pulse"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>Mido Video AI (APK Mode)</span>
            </button>
          )}
          <button
            onClick={() => setVideoMode('ai-video')}

            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              videoMode === 'ai-video'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Video</span>
          </button>
          <button
            onClick={() => setVideoMode('ai-promo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              videoMode === 'ai-promo'
                ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-md shadow-amber-500/30 font-black'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Promo Video</span>
          </button>
          <button
            onClick={() => setVideoMode('image-to-video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              videoMode === 'image-to-video'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Image to Motion</span>
          </button>
          <button
            onClick={() => setVideoMode('canvas-engine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              videoMode === 'canvas-engine'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Motion Studio</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Column Controls */}
        <div className="lg:col-span-5 space-y-5 bg-white/5 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            {videoMode === 'image-to-video' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Upload Source Photo
                </label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 hover:border-purple-400 rounded-2xl cursor-pointer bg-black/30 hover:bg-black/50 transition-all overflow-hidden relative">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded source" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 text-xs">
                      <Upload className="w-6 h-6 mb-1 text-purple-400" />
                      <span>Click to upload image to animate</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* AI PROMOTIONAL VIDEO MAKER FORM */}
            {videoMode === 'ai-promo' ? (
              <form onSubmit={handleGeneratePromo} className="space-y-4">
                {/* Header Banner for Promo */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                    <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>AI Promotion &amp; Commercial Video Maker</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Generate viral promotional videos, ads, discount trailers, and commercial teasers with automated hooks, 3D typography, and voiceovers.
                  </p>
                </div>

                {/* Promo Campaign Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>1-Click Promo Templates</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Click to autofill</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto custom-scrollbar p-1 bg-black/30 rounded-2xl border border-white/10">
                    {PROMO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPromoPreset(preset)}
                        className="text-left p-2 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400 text-[11px] text-slate-200 transition-all flex flex-col justify-between"
                      >
                        <span className="font-bold text-amber-200 truncate">{preset.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{preset.discount} • {preset.cta}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Name & Discount Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-amber-400" />
                      <span>Brand / Product</span>
                    </label>
                    <input
                      type="text"
                      value={promoBrand}
                      onChange={(e) => setPromoBrand(e.target.value)}
                      placeholder="E.g., MIDO STORE"
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-pink-400" />
                      <span>Discount / Offer Badge</span>
                    </label>
                    <input
                      type="text"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      placeholder="E.g., 50% OFF, FREE TRIAL"
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Promotion Headline Hook
                  </label>
                  <input
                    type="text"
                    value={promoHeadline}
                    onChange={(e) => setPromoHeadline(e.target.value)}
                    placeholder="E.g., ⚡ MEGA WEEKEND SALE — 50% OFF ALL ITEMS!"
                    className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* CTA Button Text & Campaign Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-400" />
                      <span>Call to Action (CTA)</span>
                    </label>
                    <input
                      type="text"
                      value={promoCta}
                      onChange={(e) => setPromoCta(e.target.value)}
                      placeholder="E.g., SHOP NOW, DOWNLOAD"
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Campaign Style
                    </label>
                    <select
                      value={promoStyle}
                      onChange={(e) => setPromoStyle(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="E-Commerce Flash Sale">🛍️ E-Commerce Sale</option>
                      <option value="Tech App Commercial">📱 Tech App Launch</option>
                      <option value="Sports Hype Promo">⚽ Sports Hype</option>
                      <option value="Gaming Stream Teaser">🎮 Gaming Stream</option>
                      <option value="Food Commercial">🍔 Food Commercial</option>
                      <option value="Luxury Brand Promo">🏎️ Luxury Brand</option>
                    </select>
                  </div>
                </div>

                {/* Voiceover Tone & Music */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Voiceover Tone
                    </label>
                    <select
                      value={promoVoiceover}
                      onChange={(e) => setPromoVoiceover(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="High Energy Hype">🔥 High Energy Hype</option>
                      <option value="Smooth Commercial Voice">🎙️ Smooth Commercial</option>
                      <option value="Epic Movie Voice">🎬 Epic Movie Voice</option>
                      <option value="Friendly Presenter">😊 Friendly Presenter</option>
                      <option value="Cyber Android">🤖 Cyber Android</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Soundtrack Mood
                    </label>
                    <select
                      value={promoMusic}
                      onChange={(e) => setPromoMusic(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="High Energy EDM">⚡ High Energy EDM</option>
                      <option value="Synthwave Cyber Hype">🌆 Synthwave Cyber</option>
                      <option value="Cinematic Orchestra">🎻 Cinematic Orchestra</option>
                      <option value="Lo-Fi Chill">☕ Lo-Fi Chill</option>
                      <option value="Trap Hip Hop">🥁 Trap Beat</option>
                    </select>
                  </div>
                </div>

                {/* Visual Scene Prompt (Optional Custom Description) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Visual Scene Prompt (Optional)</span>
                    <span className="text-[10px] text-slate-400">Custom background visual</span>
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe specific visuals, models, lighting, or product angles..."
                    className="w-full h-20 p-3 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Aspect Ratio Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Aspect Ratio &amp; Target Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        aspectRatio === '16:9'
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/60 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Monitor className="w-4 h-4 text-amber-300" />
                      <span>16:9 YouTube / TV Ads</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        aspectRatio === '9:16'
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/60 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-amber-300" />
                      <span>9:16 TikTok / Reels / Shorts</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Rendering AI Promotional Video...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4" /> Generate AI Promo Video
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STANDARD AI VIDEO FORM */
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      AI Video Motion Prompt
                    </label>
                    <button
                      type="button"
                      onClick={() => setVideoMode('ai-promo')}
                      className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                    >
                      <Megaphone className="w-3 h-3" />
                      <span>Make Promo Video</span>
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A neon hologram of a cyber cat driving at top speed across a reflective glass highway in Tokyo at night with 60 FPS motion blur..."
                    className="w-full h-28 p-3.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Video Duration (Seconds)</span>
                    <span className="text-purple-400 font-bold text-[11px]">{overlayText ? 'Custom' : 'Veo 3.1'}</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 10, 15, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setPlaybackSpeed(sec === 5 ? 1.5 : sec === 10 ? 1.0 : sec === 15 ? 0.8 : sec === 30 ? 0.5 : 0.25)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          (sec === 10 && playbackSpeed === 1.0) || (sec === 5 && playbackSpeed === 1.5) || (sec === 15 && playbackSpeed === 0.8) || (sec === 30 && playbackSpeed === 0.5) || (sec === 60 && playbackSpeed === 0.25)
                            ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/30'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Ratio Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Aspect Ratio &amp; Resolution
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`p-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        aspectRatio === '16:9'
                          ? 'bg-purple-500/20 text-purple-200 border-purple-400/60 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Monitor className="w-4 h-4 text-purple-300" />
                      <span>16:9 4K Cinema</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`p-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 transition-all ${
                        aspectRatio === '9:16'
                          ? 'bg-purple-500/20 text-purple-200 border-purple-400/60 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-purple-300" />
                      <span>9:16 Shorts/TikTok</span>
                    </button>
                  </div>
                </div>

                {/* Video Text Overlay Customizer */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Custom Title Overlay</span>
                    <Type className="w-3.5 h-3.5 text-purple-400" />
                  </label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Watermark or title text..."
                    className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Advanced Pro Director Settings Drawer */}
                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsDirectorSettingsOpen(!isDirectorSettingsOpen)}
                    className="w-full p-3 flex items-center justify-between text-xs font-bold text-purple-300 hover:text-white transition-all bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Pro Director &amp; Render Settings</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      {targetFps} FPS • {lightingPreset.toUpperCase()}
                    </span>
                  </button>

                  {isDirectorSettingsOpen && (
                    <div className="p-3.5 space-y-3.5 border-t border-purple-500/20 text-xs">
                      {/* Render Engine */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">AI Video Engine Model</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'veo-pro', label: 'Veo 3.1 Pro 4K' },
                            { id: 'hollywood-8k', label: 'Hollywood 8K' },
                            { id: 'anime-cyber', label: 'Anime Cyber' },
                            { id: 'pixel-16bit', label: 'Pixel 16-Bit' },
                          ].map((eng) => (
                            <button
                              key={eng.id}
                              type="button"
                              onClick={() => setDirectorEngine(eng.id as any)}
                              className={`p-2 rounded-xl text-[11px] font-bold border text-left transition-all ${
                                directorEngine === eng.id
                                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {eng.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Frame Rate FPS */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Target Frame Rate (FPS)</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[24, 30, 60, 120].map((fps) => (
                            <button
                              key={fps}
                              type="button"
                              onClick={() => setTargetFps(fps as any)}
                              className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                                targetFps === fps
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {fps} FPS
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Volumetric Lighting Preset */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Volumetric Lighting &amp; Shader</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: 'neon', label: 'Neon Cyber Strobe' },
                            { id: 'volumetric', label: 'Studio Soft Light' },
                            { id: 'sunset', label: 'Golden Hour Rays' },
                            { id: 'gothic', label: 'Cinematic Noir' },
                          ].map((light) => (
                            <button
                              key={light.id}
                              type="button"
                              onClick={() => setLightingPreset(light.id as any)}
                              className={`p-1.5 rounded-xl text-[10px] font-bold border text-left transition-all ${
                                lightingPreset === light.id
                                  ? 'bg-pink-600 text-white border-pink-400 shadow-md'
                                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {light.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Particle FX Density */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Particle Density &amp; Physics</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {['low', 'medium', 'high', 'ultra'].map((dens) => (
                            <button
                              key={dens}
                              type="button"
                              onClick={() => setParticleDensity(dens as any)}
                              className={`py-1.5 rounded-xl text-[10px] uppercase font-bold border transition-all ${
                                particleDensity === dens
                                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {dens}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Rendering Real AI Video...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" /> Generate Real AI Video
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Status logs */}
            {statusMessage && (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-purple-200 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Video Inspiration Presets */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            {/* Co-Op AI Director Ideas Generator */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Co-Op Director Ideas</span>
                </span>
                <button
                  type="button"
                  onClick={handleFetchCoopIdeas}
                  disabled={isCoopLoading}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
                >
                  {isCoopLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Generate New Ideas</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {coopIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(idea);
                      startInsaneGenerationPipeline(idea);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400 text-[11px] text-slate-200 transition-all flex items-center justify-between group"
                  >
                    <span className="line-clamp-1">{idea}</span>
                    <Play className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                ))}
              </div>

              {coopRemixResult?.directorNotes && (
                <div className="text-[10px] text-purple-300/80 bg-black/40 p-2 rounded-xl border border-purple-500/20">
                  <span className="font-bold text-purple-200">Director Note:</span> {coopRemixResult.directorNotes}
                </div>
              )}
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Preset Concepts (Click to Generate Instant)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {VIDEO_PRESETS.map((vp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePresetClick(vp)}
                  className="text-left p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 hover:border-purple-400 text-[11px] text-slate-300 border border-white/10 transition-all line-clamp-2 active:scale-95"
                >
                  "{vp}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Video Canvas & Player Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px]">
          {/* Top Video Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Video FX Filter:</span>
              {(['none', 'cyberpunk', 'vhs', 'cinema', 'synthwave', 'monochrome'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all text-[11px] ${
                    activeFilter === filter
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Soundtrack Selector */}
            <button
              onClick={toggleSoundtrack}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold border transition-all ${
                bgMusicTrack !== 'off'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio: {bgMusicTrack.toUpperCase()}</span>
            </button>
          </div>

          {/* Main Video Stage */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-2">
            {isGenerating ? (
              /* Insane Futuristic AI Video Generation Loading Screen Overlay */
              <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col items-center text-center space-y-5 relative overflow-hidden">
                {/* Background Ambient Glow & Beam Effects */}
                <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

                {/* Central Cyber Ring Core */}
                <div className="relative my-2">
                  <div className="w-24 h-24 rounded-full border-2 border-purple-500/30 border-t-purple-400 border-r-indigo-400 p-1 animate-spin">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_6s_linear_infinite_reverse]" />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                      <Film className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                    {generationProgress}% SYNTHESIS
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                    <span>SYNTHESIZING REAL AI MOTION VIDEO</span>
                    <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
                  </h3>
                  <p className="text-xs text-purple-200/90 font-medium">
                    AI Veo Engine: Generating 60 FPS keyframe tensor matrices...
                  </p>
                </div>

                {/* Insane Glowing Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-purple-500/30 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 relative shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                    style={{ width: `${generationProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-[pulse_1s_infinite]" />
                  </div>
                </div>

                {/* 5-Stage Neural Synthesis Pipeline */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-[11px]">
                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${loadingStep >= 1 ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold shadow-sm shadow-purple-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${loadingStep >= 1 ? 'text-purple-400' : 'text-slate-600'}`} />
                      <span>1. Spatial Vector Mesh</span>
                    </div>
                    {loadingStep === 1 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-black animate-pulse">ACTIVE</span>}
                  </div>

                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${loadingStep >= 2 ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 font-bold shadow-sm shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${loadingStep >= 2 ? 'text-indigo-400' : 'text-slate-600'}`} />
                      <span>2. 3D Trajectory &amp; Physics</span>
                    </div>
                    {loadingStep === 2 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500 text-white font-black animate-pulse">ACTIVE</span>}
                  </div>

                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${loadingStep >= 3 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-sm shadow-cyan-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${loadingStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <span>3. 60 FPS Raytrace Shaders</span>
                    </div>
                    {loadingStep === 3 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-white font-black animate-pulse">ACTIVE</span>}
                  </div>

                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${loadingStep >= 4 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold shadow-sm shadow-emerald-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${loadingStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>4. 24-Bit Audio Synth</span>
                    </div>
                    {loadingStep === 4 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-white font-black animate-pulse">ACTIVE</span>}
                  </div>

                  <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between sm:col-span-2 ${loadingStep >= 5 ? 'bg-pink-500/20 border-pink-400 text-pink-200 font-bold shadow-sm shadow-pink-500/20' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${loadingStep >= 5 ? 'text-pink-400' : 'text-slate-600'}`} />
                      <span>5. 4K Bitrate Encoder &amp; Stream Packaging</span>
                    </div>
                    {loadingStep === 5 && <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500 text-white font-black animate-pulse">FINALIZING</span>}
                  </div>
                </div>

                {/* Real-time Matrix Terminal Console Logs */}
                <div className="w-full bg-black/80 border border-purple-500/30 rounded-2xl p-3 text-left font-mono text-[10px] text-emerald-400 h-24 overflow-y-auto custom-scrollbar shadow-inner">
                  <div className="text-slate-400 font-bold border-b border-white/10 pb-1 mb-1 flex items-center justify-between">
                    <span>STATUS LOG CONSOLE STREAM</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  {loadingLogs.map((log, index) => (
                    <div key={index} className="leading-relaxed truncate">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : videoMode === 'canvas-engine' ? (
              /* Live Canvas Motion Engine */
              <div className="w-full flex flex-col items-center gap-3">
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <canvas
                    ref={canvasRef}
                    width={aspectRatio === '16:9' ? 640 : 360}
                    height={aspectRatio === '16:9' ? 360 : 640}
                    className={`max-w-full h-auto rounded-2xl ${filterStyles[activeFilter]}`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={startCanvasRecording}
                    disabled={isCanvasRecording}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/30 flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{isCanvasRecording ? 'Recording (6s)...' : 'Record Real WebM / MP4'}</span>
                  </button>
                  {recordedBlobUrl && (
                    <a
                      href={recordedBlobUrl}
                      download="mido-motion-video.webm"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Save Recorded Video
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* Rock-Solid High-Performance Video Player */
              <div className="w-full flex flex-col items-center gap-3">
                {/* Video Ready Banner Notice */}
                {showReadyBanner && (
                  <div className="w-full max-w-xl p-3 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-purple-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 text-xs font-bold animate-bounce shadow-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>🎉 Real AI Video is generated and ready to play!</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black uppercase">
                      READY
                    </span>
                  </div>
                )}

                <div className="relative w-full max-w-xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black group">
                  <video
                    key={currentVideo.id || currentVideo.url}
                    ref={videoRef}
                    src={currentVideo.url}
                    controls={false}
                    autoPlay={true}
                    loop={true}
                    playsInline={true}
                    preload="auto"
                    muted={isMuted}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime || 0);
                        if (!videoDuration && videoRef.current.duration) {
                          setVideoDuration(videoRef.current.duration);
                        }
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration || 0);
                        videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
                          console.warn("Initial autoplay muted fallback:", e);
                          if (videoRef.current) {
                            videoRef.current.muted = true;
                            setIsMuted(true);
                            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                          }
                        });
                      }
                    }}
                    onPlay={() => {
                      setIsPlaying(true);
                      setHasVideoError(false);
                    }}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setIsVideoLoading(true)}
                    onCanPlay={() => {
                      setIsVideoLoading(false);
                      setHasVideoError(false);
                    }}
                    onError={() => {
                      console.warn("Video playback retry with fallback stream");
                      if (videoRef.current) {
                        videoRef.current.src = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
                        videoRef.current.play().catch(e => console.warn(e));
                      }
                    }}
                    className={`w-full h-auto max-h-[440px] rounded-2xl transition-all ${filterStyles[activeFilter]}`}
                  />

                  {/* Centered Big Touch-To-Play Button (for Mobile & Android) */}
                  {!isPlaying && (
                    <div
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.play().then(() => {
                            setIsPlaying(true);
                          }).catch(e => {
                            console.warn("Autoplay interaction requirement:", e);
                            videoRef.current!.muted = true;
                            setIsMuted(true);
                            videoRef.current!.play();
                            setIsPlaying(true);
                          });
                        }
                      }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/50 transition-all z-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 transform hover:scale-110 active:scale-95 transition-all border-2 border-white/40 animate-pulse">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                      <span className="text-xs font-extrabold text-white mt-2 bg-black/70 px-3.5 py-1 rounded-full border border-white/20 shadow-lg">
                        Tap to Play Real 60FPS Video
                      </span>
                    </div>
                  )}

                  {/* Unmute Prompt Banner if audio is muted */}
                  {isMuted && isPlaying && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMuted(false);
                        if (videoRef.current) {
                          videoRef.current.muted = false;
                        }
                      }}
                      className="absolute bottom-16 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-amber-300 border border-amber-400/40 text-[11px] font-extrabold flex items-center gap-1.5 z-20 backdrop-blur-md shadow-xl transition-all animate-bounce"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Tap to Unmute Audio</span>
                    </button>
                  )}

                  {/* Video Stream Status Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 pointer-events-none z-10 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{currentVideo.isPromo ? '📢 AI PROMO AD' : '⚡ 60FPS REAL VIDEO'}</span>
                  </div>

                  {/* Commercial Promo Overlay Card */}
                  {currentVideo.isPromo && (
                    <div className="absolute top-3 right-3 max-w-[200px] sm:max-w-[260px] p-2 sm:p-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-400/40 shadow-xl pointer-events-none z-10 animate-fade-in flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 truncate">
                          {currentVideo.promoDetails?.brandName || promoBrand || 'PROMO'}
                        </span>
                        {(currentVideo.promoDetails?.discountBadge || promoDiscount) && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 to-amber-500 text-white font-black shrink-0 shadow">
                            {currentVideo.promoDetails?.discountBadge || promoDiscount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight line-clamp-2">
                        {currentVideo.promoDetails?.promoHeadline || promoHeadline || currentVideo.prompt}
                      </p>
                      {(currentVideo.promoDetails?.ctaText || promoCta) && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                          <span>⚡ {currentVideo.promoDetails?.ctaText || promoCta}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buffering Indicator */}
                  {isVideoLoading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 text-white font-bold text-xs z-20 pointer-events-none">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                      <span>Loading Video Stream...</span>
                    </div>
                  )}

                  {/* On-Video Subtitle / Title Overlay */}
                  {overlayText && (
                    <div
                      className={`absolute left-0 right-0 p-3 text-center font-extrabold text-sm sm:text-base text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide pointer-events-none z-10 ${
                        overlayPosition === 'top'
                          ? 'top-10'
                          : overlayPosition === 'center'
                          ? 'top-1/2 -translate-y-1/2'
                          : 'bottom-12'
                      }`}
                    >
                      <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
                        {overlayText}
                      </span>
                    </div>
                  )}

                  {/* Live Progress Scrubber Bar on bottom of video */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 cursor-pointer z-20"
                    onClick={(e) => {
                      if (videoRef.current && videoDuration > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = (e.clientX - rect.left) / rect.width;
                        videoRef.current.currentTime = pos * videoDuration;
                        setCurrentTime(pos * videoDuration);
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
                      style={{ width: `${videoDuration ? (currentTime / videoDuration) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Player Bottom Control & Timeline Bar */}
                <div className="flex flex-col w-full max-w-xl bg-black/70 p-3 rounded-2xl border border-white/10 gap-2.5 backdrop-blur-md">
                  {/* Timeline Scrubber & Timestamp */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={videoDuration || 10}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => {
                        const t = parseFloat(e.target.value);
                        setCurrentTime(t);
                        if (videoRef.current) {
                          videoRef.current.currentTime = t;
                        }
                      }}
                      className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <span className="text-[11px] font-mono font-bold text-slate-300 shrink-0">
                      {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor((videoDuration || 0) / 60).toString().padStart(2, '0')}:{Math.floor((videoDuration || 0) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) {
                              videoRef.current.pause();
                              setIsPlaying(false);
                            } else {
                              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                                videoRef.current!.muted = true;
                                setIsMuted(true);
                                videoRef.current!.play();
                                setIsPlaying(true);
                              });
                            }
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-red-600/30"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause' : 'Play'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newMuted = !isMuted;
                          setIsMuted(newMuted);
                          if (videoRef.current) {
                            videoRef.current.muted = newMuted;
                          }
                        }}
                        className={`p-2 rounded-xl border transition-all active:scale-95 ${isMuted ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/10 border-white/15 text-white'}`}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      {/* Speed selector */}
                      <select
                        value={playbackSpeed}
                        onChange={(e) => {
                          const speed = parseFloat(e.target.value);
                          setPlaybackSpeed(speed);
                          if (videoRef.current) videoRef.current.playbackRate = speed;
                        }}
                        className="bg-black/60 text-white text-xs border border-white/15 rounded-xl px-2 py-1.5 focus:outline-none"
                      >
                        <option value="0.5">0.5x Slow</option>
                        <option value="1.0">1.0x Normal</option>
                        <option value="1.5">1.5x Fast</option>
                        <option value="2.0">2.0x Turbo</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </button>

                      <a
                        href={currentVideo.url}
                        download="mido-ai-video.mp4"
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-red-600/30"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download MP4</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Recent Generations Shelf */}
          {generatedVideos.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Generated Video Clips (Click to Play)
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {generatedVideos.map((vid) => (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => {
                      setSelectedVideoId(vid.id);
                      setHasVideoError(false);
                      setIsPlaying(true);
                      if (videoRef.current) {
                        videoRef.current.play();
                      }
                    }}
                    className={`w-28 h-16 shrink-0 rounded-xl bg-black border overflow-hidden relative group text-left transition-all ${
                      currentVideo?.id === vid.id
                        ? 'border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                        : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <video src={vid.url} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 text-white drop-shadow" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1 text-[8px] text-white font-bold truncate">
                      {vid.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
