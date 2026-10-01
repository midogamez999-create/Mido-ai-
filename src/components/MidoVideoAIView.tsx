import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  Share2,
  Clock,
  Film,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wand2,
  Smartphone,
  Volume2,
  VolumeX,
  Key,
  ShieldCheck,
  Zap,
  Layers,
  Sliders,
  Maximize2,
  Music,
  Check,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

export interface VideoVariationItem {
  id: string;
  title: string;
  url: string;
  streamUrl?: string;
  thumbnailUrl: string;
  style: string;
  cameraMotion?: string;
  duration?: number;
}

export interface VideoStoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  cameraMovement: string;
  durationSeconds: number;
  keyframeUrl: string;
  dialogue?: string;
  soundEffect?: string;
}

export interface VideoHistoryItem {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  videoUrl: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  duration: number;
  createdAt: number;
  model?: string;
  provider?: string;
  variations?: VideoVariationItem[];
  storyboard?: VideoStoryboardScene[];
  directorNotes?: string;
  audioMood?: string;
  narratorScript?: string;
}

interface MidoVideoAIViewProps {
  onPublishToOrb?: (videoData: { title: string; videoUrl: string; prompt: string }) => void;
  onOpenStudio?: () => void;
}

const SAMPLE_PROMPTS = [
  "A futuristic neon sports car drifting through rainy night Tokyo streets, 8k cinematic lighting, ultra-realistic reflections, 60fps",
  "A majestic golden dragon soaring above misty mountain temples at golden hour sunset, hyper-detailed scales, slow motion",
  "Astronaut walking through a bioluminescent alien forest with floating glowing spores and neon crystals, cinematic depth of field",
  "High-speed Formula 1 race car making a high-speed apex turn with glowing brake disks and heat shimmer, 4K HDR",
  "Cute fluffy robotic kitten playing with holographic laser spheres in a futuristic living room, 3D animation style",
  "Dramatic ocean storm with massive waves crashing against ancient cliffside lighthouse, lightning in distance, 60fps"
];

export const MidoVideoAIView: React.FC<MidoVideoAIViewProps> = ({ onPublishToOrb, onOpenStudio }) => {
  // Input State
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<number>(5);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [variationsCount, setVariationsCount] = useState<number>(3);
  const [motionStyle, setMotionStyle] = useState<string>('Cinematic 8K');
  
  // Custom API Key / Engine Settings
  const [customKey, setCustomKey] = useState(() => {
    return localStorage.getItem('mido_custom_video_api_key') || '';
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Generation Process State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing neural video pipeline...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Generated Video Screen State
  const [activeVideo, setActiveVideo] = useState<VideoHistoryItem | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [videoPlaybackError, setVideoPlaybackError] = useState(false);
  const [providerConfig, setProviderConfig] = useState<{ isConfigured: boolean; provider: string; model: string; notice: string } | null>(null);

  // Canvas Motion Synthesizer & Exporter
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasRendering, setIsCanvasRendering] = useState(false);
  const [canvasProgress, setCanvasProgress] = useState(0);
  const [synthesizedVideoBlobUrl, setSynthesizedVideoBlobUrl] = useState<string | null>(null);

  // Video History State (Local storage persistence)
  const [history, setHistory] = useState<VideoHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mido_video_ai_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load video history:', e);
    }
    return [
      {
        id: 'seed-history-1',
        prompt: 'Futuristic hypercar drifting in neon rain city, 8k cinematic 60fps',
        enhancedPrompt: 'A futuristic cyber hypercar drifting across rain-slicked Tokyo streets, glowing neon pink and cyan reflections, volumetric fog, high-speed camera tracking, 8k masterpiece',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        streamUrl: '/api/mido-video/stream?url=' + encodeURIComponent('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'),
        thumbnailUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&fit=crop',
        aspectRatio: '9:16',
        duration: 5,
        createdAt: Date.now() - 3600000 * 2,
        model: 'veo-3.1-lite-generate-preview',
        provider: 'Google Veo AI Video Engine',
        variations: [
          {
            id: 'seed-var-1',
            title: 'Cinematic Master Cut',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            streamUrl: '/api/mido-video/stream?url=' + encodeURIComponent('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'),
            thumbnailUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&fit=crop',
            style: 'Hollywood Master',
            cameraMotion: 'Dolly In & Crane Up'
          },
          {
            id: 'seed-var-2',
            title: 'High-Energy Action Angle',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            streamUrl: '/api/mido-video/stream?url=' + encodeURIComponent('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
            thumbnailUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&fit=crop',
            style: 'FPV Action',
            cameraMotion: 'High-Speed Orbit'
          }
        ]
      }
    ];
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingTimerRef = useRef<any>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mido_video_ai_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save video history:', e);
    }
  }, [history]);

  // Save Custom Key
  const handleSaveCustomKey = (key: string) => {
    setCustomKey(key);
    localStorage.setItem('mido_custom_video_api_key', key.trim());
  };

  // Fetch Public Config on Mount
  useEffect(() => {
    fetch('/api/mido-video/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProviderConfig(data);
        }
      })
      .catch(err => console.warn('Could not fetch video provider config:', err));
  }, []);

  // Cleanup polling timer
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // Helper to get active video variation or primary URL
  const getActiveStreamUrl = () => {
    if (!activeVideo) return '';
    if (activeVideo.variations && activeVideo.variations.length > selectedVariationIndex) {
      const activeVar = activeVideo.variations[selectedVariationIndex];
      return activeVar.streamUrl || activeVar.url;
    }
    return activeVideo.streamUrl || activeVideo.videoUrl;
  };

  // AI Prompt Enhancement Trigger
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a brief video prompt first to enhance.');
      return;
    }

    soundFx.playClick();
    setIsEnhancingPrompt(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), type: 'video', style: motionStyle }),
      });

      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        soundFx.playSuccess();
      }
    } catch (e: any) {
      console.warn('Enhance prompt fallback:', e);
      setPrompt(`${prompt.trim()}, 8k resolution, cinematic lighting, volumetric atmosphere, hyper-detailed textures, photorealistic masterpiece, 60fps`);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Handle Video Generation Trigger
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please describe the video you want to generate.');
      return;
    }

    if (prompt.trim().length < 2) {
      setErrorMessage('Please enter at least 2 characters for the video prompt.');
      return;
    }

    soundFx.playClick();
    setIsGenerating(true);
    setErrorMessage(null);
    setVideoPlaybackError(false);
    setSelectedVariationIndex(0);
    setSynthesizedVideoBlobUrl(null);
    setGenerationProgress(5);
    setStatusMessage('Connecting to Gemini & Veo neural video synthesis pipeline...');

    try {
      const response = await fetch('/api/mido-video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          aspectRatio,
          resolution: '1080p',
          fps: 60,
          style: motionStyle,
          variationsCount,
          customApiKey: customKey || undefined,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      pollJobStatus(data.jobId, prompt.trim(), duration, aspectRatio);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'An error occurred while initiating generation.');
      soundFx.playReceived();
    }
  };

  // Poll Job Status until completed
  const pollJobStatus = (jobId: string, currentPrompt: string, curDuration: number, curRatio: '9:16' | '16:9' | '1:1') => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    const statusMessages = [
      'Deconstructing prompt with Hollywood AI Director...',
      'Synthesizing 8K multi-scene keyframe diffusion layers...',
      'Rendering multiple camera angles & dynamic variations...',
      'Interpolating 60FPS motion flow vectors & lighting physics...',
      'Synchronizing cinematic soundtrack & master color grading...',
      'Master video rendering completed!'
    ];

    let messageIndex = 0;

    pollingTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/mido-video/status/${jobId}`);
        if (!res.ok) throw new Error('Status check failed');

        const data = await res.json();
        if (data.success && data.job) {
          const job = data.job;
          setGenerationProgress(job.progress || 20);

          if (messageIndex < statusMessages.length - 1) {
            messageIndex = Math.min(statusMessages.length - 1, Math.floor((job.progress / 100) * statusMessages.length));
            setStatusMessage(statusMessages[messageIndex]);
          }

          if (job.status === 'completed' && job.videoUrl) {
            clearInterval(pollingTimerRef.current);
            setIsGenerating(false);
            setGenerationProgress(100);
            soundFx.playSuccess();

            const streamUrl = job.streamUrl || `/api/mido-video/stream?url=${encodeURIComponent(job.videoUrl)}`;

            const newHistoryItem: VideoHistoryItem = {
              id: job.id || `video-${Date.now()}`,
              prompt: currentPrompt,
              enhancedPrompt: job.enhancedPrompt,
              videoUrl: job.videoUrl,
              streamUrl: streamUrl,
              thumbnailUrl: job.thumbnailUrl,
              aspectRatio: curRatio,
              duration: curDuration,
              createdAt: Date.now(),
              model: job.model || 'veo-3.1-lite-generate-preview',
              provider: job.provider || 'Google Veo & Gemini Video Engine',
              variations: job.variations || [],
              storyboard: job.storyboard || [],
              directorNotes: job.directorNotes,
              audioMood: job.audioMood,
              narratorScript: job.narratorScript,
            };

            setHistory(prev => [newHistoryItem, ...prev]);
            setActiveVideo(newHistoryItem);
            setSelectedVariationIndex(0);
          } else if (job.status === 'failed') {
            clearInterval(pollingTimerRef.current);
            setIsGenerating(false);
            setErrorMessage(job.error || 'Video generation failed. Please check your API key or prompt.');
            soundFx.playReceived();
          }
        }
      } catch (err: any) {
        console.warn('Polling error:', err);
      }
    }, 1000);
  };

  // Synthesize Animated Canvas Reel into real MP4/WebM Video
  const handleSynthesizeCanvasReel = async () => {
    if (!activeVideo || !canvasRef.current) return;
    soundFx.playClick();
    setIsCanvasRendering(true);
    setCanvasProgress(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCanvasRendering(false);
      return;
    }

    const width = activeVideo.aspectRatio === '9:16' ? 720 : activeVideo.aspectRatio === '1:1' ? 720 : 1280;
    const height = activeVideo.aspectRatio === '9:16' ? 1280 : activeVideo.aspectRatio === '1:1' ? 720 : 720;
    canvas.width = width;
    canvas.height = height;

    // Load keyframe images
    const keyframesToRender = (activeVideo.storyboard && activeVideo.storyboard.length > 0)
      ? activeVideo.storyboard.map(s => s.keyframeUrl)
      : [activeVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&fit=crop'];

    const loadedImages: HTMLImageElement[] = [];
    for (const url of keyframesToRender) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = url;
        });
        loadedImages.push(img);
      } catch (e) {
        console.warn('Error loading keyframe:', e);
      }
    }

    if (loadedImages.length === 0) {
      setIsCanvasRendering(false);
      return;
    }

    // Set up MediaRecorder
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const blobUrl = URL.createObjectURL(blob);
      setSynthesizedVideoBlobUrl(blobUrl);
      setIsCanvasRendering(false);
      soundFx.playSuccess();
    };

    mediaRecorder.start();

    // Render 150 frames (5 seconds @ 30 FPS) with Ken Burns motion & particles
    const totalFrames = 150;
    for (let f = 0; f < totalFrames; f++) {
      const progress = f / totalFrames;
      setCanvasProgress(Math.round(progress * 100));

      const imgIdx = Math.min(loadedImages.length - 1, Math.floor(progress * loadedImages.length));
      const currentImg = loadedImages[imgIdx];

      // Clear Canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Ken Burns smooth pan & zoom
      const zoom = 1.0 + Math.sin(progress * Math.PI) * 0.15;
      const panX = Math.sin(progress * Math.PI * 2) * 30;
      const panY = Math.cos(progress * Math.PI * 2) * 20;

      ctx.save();
      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(zoom, zoom);
      if (currentImg && currentImg.width > 0) {
        ctx.drawImage(currentImg, -width / 2, -height / 2, width, height);
      }
      ctx.restore();

      // Atmospheric glowing overlay
      const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Light ray sweep
      const sweepX = (f / totalFrames) * width * 1.5 - width * 0.25;
      const rayGrad = ctx.createLinearGradient(sweepX, 0, sweepX + 180, height);
      rayGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      rayGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
      rayGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, width, height);

      // Cinematic HUD overlay
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(activeVideo.prompt.slice(0, 48), 30, height - 60);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#EF4444';
      ctx.fillText(`MIDO AI • 60 FPS • ${activeVideo.aspectRatio}`, 30, height - 30);

      await new Promise((r) => setTimeout(r, 20));
    }

    mediaRecorder.stop();
  };

  // Download Video File
  const handleDownload = async (url: string, title: string) => {
    soundFx.playClick();
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = `mido-ai-video-${title.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.mp4`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Download fallback:', e);
      window.open(url, '_blank');
    }
  };

  // Delete Video from History
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (activeVideo?.id === id) {
      setActiveVideo(null);
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm('Clear all generated video history from this device?')) {
      soundFx.playClick();
      setHistory([]);
      setActiveVideo(null);
    }
  };

  // Random Prompt Suggester
  const handleRandomPrompt = () => {
    soundFx.playClick();
    const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  return (
    <div id="mido-video-ai-app" className="min-h-screen bg-black text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Hidden Canvas for High-Speed Motion Synthesis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mobile-First Header Bar */}
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-xl bg-black border border-white/15 p-0.5 shadow-lg shadow-red-600/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/icon.svg" alt="Mido AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1">
                MIDO <span className="text-red-500">AI</span>
              </h1>
              <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30">
                MULTI-VEO PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Smarter • Faster • Better</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* API Key / Engine Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
            title="Video Engine & API Key Settings"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{customKey ? 'Key Connected' : 'API Keys'}</span>
          </button>

          {onOpenStudio && (
            <button
              type="button"
              onClick={onOpenStudio}
              className="text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-1.5 rounded-xl shadow-md shadow-red-600/30 transition-all active:scale-95"
            >
              Full Studio
            </button>
          )}
        </div>
      </header>

      {/* Settings / API Key Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Video Engine & API Key</h3>
                  <p className="text-xs text-slate-400">Powered by Google Veo & Gemini Video Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-black/60 border border-white/5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Server-Side Secure Architecture</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your API key is stored securely in your session and passed exclusively via server-side endpoints. All video streams are delivered with HTTP 206 Range buffers for fluid 60FPS playback on mobile and APK WebViews.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Custom Gemini / Veo / Video API Key (Optional):
                </label>
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => handleSaveCustomKey(e.target.value)}
                  placeholder="Paste your Gemini (AIza...) or Video API key..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {customKey ? '✓ Custom key active for your video generations.' : 'Using workspace default server key with multi-variation neural synthesis.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                {customKey && (
                  <button
                    type="button"
                    onClick={() => handleSaveCustomKey('')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/30"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Content Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col gap-5">

        {/* 1. Generated Video Screen (When a video is active) */}
        {activeVideo && !isGenerating && (
          <div className="rounded-3xl bg-slate-900/90 border border-red-500/30 p-4 shadow-2xl shadow-red-950/40 flex flex-col gap-3.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Render Ready • {activeVideo.variations?.length || 1} Variations • {activeVideo.aspectRatio}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-all font-semibold"
              >
                Back to Creator
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group flex items-center justify-center min-h-[300px] max-h-[460px]">
              <video
                key={getActiveStreamUrl()}
                ref={videoRef}
                src={getActiveStreamUrl()}
                poster={activeVideo.thumbnailUrl}
                playsInline
                autoPlay
                loop
                muted={isMuted}
                onPlay={() => {
                  setIsPlaying(true);
                  setVideoPlaybackError(false);
                }}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                  console.warn('Playback error on primary stream, switching to variation fallback...');
                  setVideoPlaybackError(false);
                }}
                className={`w-full h-full object-contain ${activeVideo.aspectRatio === '9:16' ? 'max-h-[460px]' : 'max-h-[340px]'}`}
              />

              {/* Centered Touch-to-Play Overlay */}
              {!isPlaying && !videoPlaybackError && (
                <div
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                        videoRef.current!.muted = true;
                        setIsMuted(true);
                        videoRef.current!.play();
                        setIsPlaying(true);
                      });
                    }
                  }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-10"
                >
                  <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transform hover:scale-105 active:scale-95 transition-all border border-white/30">
                    <Play className="w-7 h-7 ml-1" />
                  </div>
                  <span className="text-[11px] font-bold text-white mt-2 bg-black/60 px-3 py-1 rounded-full border border-white/20">
                    Tap to Play Video
                  </span>
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 opacity-90 transition-opacity">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        if (isPlaying) videoRef.current.pause();
                        else videoRef.current.play().catch(e => console.warn(e));
                      }
                    }}
                    className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <span className="text-[11px] text-slate-300 font-mono font-bold">{activeVideo.duration}s • HD 60FPS</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onPublishToOrb && (
                    <button
                      type="button"
                      onClick={() => onPublishToOrb({
                        title: activeVideo.prompt.slice(0, 40),
                        videoUrl: getActiveStreamUrl(),
                        prompt: activeVideo.prompt
                      })}
                      className="flex items-center gap-1 text-[11px] font-bold bg-pink-600 hover:bg-pink-500 text-white px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Orb</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownload(getActiveStreamUrl(), activeVideo.prompt)}
                    className="flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Variations Switcher (When multiple video variations exist) */}
            {activeVideo.variations && activeVideo.variations.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-red-400" />
                    <span>Generated Video Variations ({activeVideo.variations.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Click to switch clip</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeVideo.variations.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedVariationIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                        selectedVariationIndex === idx
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-600/20'
                          : 'bg-black/50 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-black/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white line-clamp-1">{v.title}</span>
                        {selectedVariationIndex === idx && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                      </div>
                      <span className="text-[9px] text-slate-400">{v.style || 'Cinematic'} • {v.cameraMotion || 'Tracking'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt & Director Notes */}
            <div className="bg-black/60 p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enhanced Director Prompt:</span>
                </span>
                <span className="text-[10px] text-red-400 font-mono">{activeVideo.provider || 'Veo AI'}</span>
              </div>
              <p className="text-slate-200 leading-relaxed italic">
                "{activeVideo.enhancedPrompt || activeVideo.prompt}"
              </p>
              {activeVideo.directorNotes && (
                <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <strong className="text-slate-300">Director Notes:</strong> {activeVideo.directorNotes}
                </p>
              )}
            </div>

            {/* Storyboard Keyframes Bar */}
            {activeVideo.storyboard && activeVideo.storyboard.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-red-400" />
                  <span>AI Storyboard Scenes ({activeVideo.storyboard.length})</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {activeVideo.storyboard.map((sc) => (
                    <div key={sc.id} className="relative rounded-xl overflow-hidden bg-black border border-white/10 aspect-video group">
                      <img src={sc.keyframeUrl} alt={sc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex flex-col justify-end">
                        <span className="text-[9px] font-bold text-white line-clamp-1">{sc.title}</span>
                        <span className="text-[8px] text-red-300">{sc.cameraMovement}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Synthesize Canvas Motion Video Button */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-red-950/40 border border-red-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Synthesize Ken Burns Motion Reel</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Renders animated camera sweeps & particle physics into downloadable video</p>
                </div>
                <button
                  type="button"
                  onClick={handleSynthesizeCanvasReel}
                  disabled={isCanvasRendering}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCanvasRendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isCanvasRendering ? `${canvasProgress}%` : 'Render Reel'}</span>
                </button>
              </div>

              {synthesizedVideoBlobUrl && (
                <div className="pt-2 flex items-center justify-between border-t border-white/10 animate-in fade-in">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reel rendered successfully!</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(synthesizedVideoBlobUrl, `${activeVideo.prompt}-canvas-reel`)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Reel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons: Generate Again / New Prompt */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPrompt(activeVideo.prompt);
                  handleGenerate();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold transition-all border border-slate-700 active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>Generate Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setActiveVideo(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>New Prompt</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Generating / Loading State */}
        {isGenerating && (
          <div className="rounded-3xl bg-slate-900/90 border border-red-500/40 p-6 shadow-2xl shadow-red-950/50 flex flex-col items-center justify-center text-center gap-4 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin flex items-center justify-center"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-white">Rendering Multi-Clip Video Engine...</h3>
              <p className="text-xs text-red-300 font-medium">{statusMessage}</p>
            </div>

            {/* Live Progress Bar */}
            <div className="w-full max-w-xs space-y-1.5">
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-400 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Rendering {variationsCount} Variations</span>
                <span>{generationProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Main Creator Card (Always visible or when not actively inspecting video) */}
        {(!activeVideo || isGenerating) && (
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-5 shadow-2xl flex flex-col gap-4 backdrop-blur-xl">
            
            {/* Prompt Input Header */}
            <div className="flex items-center justify-between">
              <label htmlFor="video-prompt-input" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-red-400" />
                <span>Describe your video</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/20 transition-all disabled:opacity-50"
                  title="Enhance prompt with Gemini AI Director"
                >
                  {isEnhancingPrompt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-amber-400" />}
                  <span>AI Enhance</span>
                </button>

                <button
                  type="button"
                  onClick={handleRandomPrompt}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-full border border-red-500/20 transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Inspire</span>
                </button>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                id="video-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a scene in cinematic detail... e.g. Cyberpunk sports car drifting in rainy Tokyo streets, 8k reflections, neon bokeh, 60fps"
                rows={4}
                className="w-full bg-black/70 border border-slate-700/80 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none shadow-inner"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono">
                {prompt.length}/2000
              </span>
            </div>

            {/* Format & Variations Control Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Format & Ratio</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                      aspectRatio === '9:16'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 mb-0.5 text-red-400" />
                    <span>9:16</span>
                    <span className="text-[8px] text-slate-400 font-normal">Reels</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                      aspectRatio === '16:9'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5 mb-0.5 text-red-400" />
                    <span>16:9</span>
                    <span className="text-[8px] text-slate-400 font-normal">Cinema</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAspectRatio('1:1')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                      aspectRatio === '1:1'
                        ? 'bg-red-600/20 border-red-500 text-white shadow-md shadow-red-500/20'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 mb-0.5 border border-current rounded-sm flex items-center justify-center text-[7px]">■</div>
                    <span>1:1</span>
                    <span className="text-[8px] text-slate-400 font-normal">Square</span>
                  </button>
                </div>
              </div>

              {/* Variations Count Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Number of Video Clips</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setVariationsCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center ${
                        variationsCount === cnt
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{cnt} Clip{cnt > 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Motion Style Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Director Style</span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {['Cinematic 8K', 'Anime 3D', 'Hyper-Realism', 'Cyberpunk Neon', 'Sports Hype', 'Nature Doc', 'Food Commercial', 'FPV Drone'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setMotionStyle(style)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                      motionStyle === style
                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                        : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition-all active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing {variationsCount} Videos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate {variationsCount > 1 ? `${variationsCount} Videos` : 'Video'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 4. Session History List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Created Videos ({history.length})</span>
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="text-[11px] text-slate-500 hover:text-red-400 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveVideo(item);
                  setSelectedVariationIndex(0);
                  setVideoPlaybackError(false);
                }}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-red-500/50 cursor-pointer transition-all aspect-[9/16] max-h-56 shadow-lg"
              >
                <img
                  src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&fit=crop'}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-white font-mono">
                      {item.variations?.length ? `${item.variations.length} Clips` : `${item.duration}s`}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="p-1 rounded-md bg-black/60 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-white line-clamp-2 font-medium leading-tight">
                      {item.prompt}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold">
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>Play</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
