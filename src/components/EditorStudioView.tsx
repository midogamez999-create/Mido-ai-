import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors, Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles,
  Sliders, Type, Music, Crop, Maximize2, Share2, Upload, Trash2, Plus,
  Film, Image as ImageIcon, Check, RefreshCw, Eye, Layers, FastForward,
  Palette, Sun, Contrast as ContrastIcon, Droplet, Move, Copy, Globe, AlertCircle,
  Zap, Snowflake, Grid, Shield, Smile, Wand2
} from 'lucide-react';
import { UserAccount, UserSecrets } from '../types';
import { soundFx } from '../lib/soundFx';
import { CINEMATIC_LUTS, VFX_PRESETS, PRO_STICKERS, AI_MAGIC_TOOLS } from './midoCutData';
import { CutTimeline } from './midoCut/CutTimeline';
import { CutFiltersPanel } from './midoCut/CutFiltersPanel';
import { CutVFXPanel } from './midoCut/CutVFXPanel';
import { CutTypographyPanel, TextOverlayItem } from './midoCut/CutTypographyPanel';
import { CutStickersPanel } from './midoCut/CutStickersPanel';
import { CutAudioPanel } from './midoCut/CutAudioPanel';
import { CutAIMagicPanel } from './midoCut/CutAIMagicPanel';
import { CutPhotoPanel } from './midoCut/CutPhotoPanel';
import { CutTransitionsPanel } from './midoCut/CutTransitionsPanel';
import { CutExportModal } from './midoCut/CutExportModal';

// Sample Media Assets for Instant 1-Click Editing
const SAMPLE_VIDEOS = [
  {
    id: 'vid-sample-1',
    name: '4K Nature & Cinematic Bloom',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    type: 'video' as const,
    duration: 15,
  },
  {
    id: 'vid-sample-2',
    name: 'Cyber Celebration & Visual FX',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    type: 'video' as const,
    duration: 15,
  },
  {
    id: 'vid-sample-3',
    name: 'High Speed Supercar Lap',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    type: 'video' as const,
    duration: 15,
  },
  {
    id: 'vid-sample-4',
    name: 'Sci-Fi Action 3D Trailer',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    type: 'video' as const,
    duration: 52,
  },
];

const SAMPLE_PHOTOS = [
  {
    id: 'photo-sample-1',
    name: 'Cyberpunk Futuristic City 8K',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&q=80',
    type: 'photo' as const,
  },
  {
    id: 'photo-sample-2',
    name: 'Neon Tokyo Night Rain',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
    type: 'photo' as const,
  },
  {
    id: 'photo-sample-3',
    name: 'Champions Football Stadium Glow',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
    type: 'photo' as const,
  },
];

interface EditorStudioViewProps {
  user: UserAccount | null;
  secrets?: UserSecrets;
  initialMediaUrl?: string;
  initialMediaType?: 'video' | 'photo';
  onPublishToMidoOrb?: (videoData: { title: string; url: string; category: string; description: string }) => void;
  onNavigateToOrb?: () => void;
  onNavigateToGuide?: () => void;
}

export const EditorStudioView: React.FC<EditorStudioViewProps> = ({
  user,
  initialMediaUrl,
  initialMediaType = 'video',
  onPublishToMidoOrb,
  onNavigateToOrb,
  onNavigateToGuide,
}) => {
  // Media State
  const [mediaType, setMediaType] = useState<'video' | 'photo'>(initialMediaType);
  const [mediaUrl, setMediaUrl] = useState<string>(initialMediaUrl || SAMPLE_VIDEOS[0].url);
  const [mediaName, setMediaName] = useState<string>(initialMediaUrl ? 'Imported Project Media' : SAMPLE_VIDEOS[0].name);

  // Playback & Timeline State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(15);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState<number>(1.0);
  const [safeAreaMode, setSafeAreaMode] = useState(false);

  // 150+ Tool Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'filters' | 'vfx' | 'typography' | 'stickers' | 'audio' | 'transitions' | 'ai' | 'photo' | 'canvas'
  >('filters');

  // Filter & Adjustments State
  const [selectedFilter, setSelectedFilter] = useState<string>('teal-orange');
  const [filterIntensity, setFilterIntensity] = useState<number>(85);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(105);
  const [saturate, setSaturate] = useState<number>(110);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [blurVal, setBlurVal] = useState<number>(0);
  const [sepiaVal, setSepiaVal] = useState<number>(0);
  const [vignetteVal, setVignetteVal] = useState<number>(15);
  const [filmGrainVal, setFilmGrainVal] = useState<number>(0);
  const [kelvinTemp, setKelvinTemp] = useState<number>(5500);

  // VFX State
  const [selectedVFX, setSelectedVFX] = useState<string>('vfx-none');
  const [vfxOpacity, setVfxOpacity] = useState<number>(75);

  // Transitions State
  const [selectedTransition, setSelectedTransition] = useState<string>('tr-whip-right');
  const [transitionDuration, setTransitionDuration] = useState<number>(0.8);

  // Overlays (Typography & Stickers)
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([
    {
      id: 't-1',
      text: 'MIDO CUT PRO 🎬',
      font: 'Bebas Neue',
      size: 32,
      color: '#ffffff',
      bgColor: 'rgba(0, 0, 0, 0.7)',
      isGlow: true,
      position: 'top',
      yPercent: 14,
    },
  ]);
  const [activeStickers, setActiveStickers] = useState<string[]>(['st-hdr-4k', 'st-trending']);
  const [isTranscribingAI, setIsTranscribingAI] = useState(false);

  // Audio State
  const [bgMusicTrack, setBgMusicTrack] = useState<'none' | 'cyber' | 'lofi' | 'cinematic' | 'upbeat'>('none');
  const [selectedVoiceChanger, setSelectedVoiceChanger] = useState<string>('vc-normal');
  const [bassBoost, setBassBoost] = useState(false);
  const [noiseCancellation, setNoiseCancellation] = useState(false);

  // AI Magic State
  const [activeAITools, setActiveAITools] = useState<string[]>([]);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');

  // Canvas & Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5' | '21:9'>('9:16');
  const [canvasBg, setCanvasBg] = useState<'black' | 'slate' | 'cyber' | 'blur'>('slate');
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [zoomScale, setZoomScale] = useState(1.0);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial URL if passed
  useEffect(() => {
    if (initialMediaUrl) {
      setMediaUrl(initialMediaUrl);
      setMediaType(initialMediaType);
    }
  }, [initialMediaUrl, initialMediaType]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute CSS Filter String
  const computeCombinedFilter = () => {
    const preset = CINEMATIC_LUTS.find((p) => p.id === selectedFilter);
    const basePreset = preset && preset.css !== 'none' ? preset.css : '';
    const customAdjust = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) blur(${blurVal}px) sepia(${sepiaVal}%)`;
    return basePreset ? `${basePreset} ${customAdjust}` : customAdjust;
  };

  // Video Time Update & Trim Enforcer
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      if (cur >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 15;
      setDuration(dur);
      setTrimEnd(dur);
      setTrimStart(0);
    }
  };

  const togglePlay = () => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.muted = isMuted;
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.warn('Video play failed:', e);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true));
            }
          });
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processImportFile = (file: File) => {
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaName(file.name);

      if (file.type.startsWith('video/')) {
        setMediaType('video');
        setIsPlaying(false);
        setCurrentTime(0);
        setTrimStart(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.load();
        }
        soundFx.playSuccess();
        showToast('🎬 Imported video: ' + file.name);
      } else {
        setMediaType('photo');
        setIsPlaying(false);
        soundFx.playSuccess();
        showToast('🖼️ Imported photo: ' + file.name);
      }
    } catch (err) {
      console.error('File import error:', err);
      showToast('⚠️ Could not load file. Please try another format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImportFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImportFile(file);
    }
  };

  // Typography Actions
  const handleAddText = (template?: { name: string; font: string; desc: string }) => {
    const newText: TextOverlayItem = {
      id: 'text_' + Date.now(),
      text: template ? template.name : 'New Animated Headline ⚡',
      font: template ? template.font : 'Montserrat',
      size: 28,
      color: '#ffffff',
      bgColor: 'rgba(0, 0, 0, 0.7)',
      isGlow: true,
      position: 'center',
      yPercent: 45,
    };
    setTextOverlays([...textOverlays, newText]);
    showToast('Added title layer: ' + newText.text);
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlayItem>) => {
    setTextOverlays(textOverlays.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteText = (id: string) => {
    setTextOverlays(textOverlays.filter((t) => t.id !== id));
    soundFx.playClick();
  };

  // Auto AI Captions
  const handleAutoTranscribeAI = () => {
    setIsTranscribingAI(true);
    setTimeout(() => {
      setIsTranscribingAI(false);
      const generatedSubtitles: TextOverlayItem[] = [
        {
          id: 'sub-1',
          text: '⚡ CREATED WITH MIDO CUT PRO',
          font: 'Montserrat',
          size: 26,
          color: '#fbbf24',
          bgColor: 'rgba(0,0,0,0.8)',
          isGlow: true,
          position: 'bottom',
          yPercent: 82,
        },
      ];
      setTextOverlays([...textOverlays, ...generatedSubtitles]);
      showToast('✨ AI Captions synchronized successfully!');
    }, 1800);
  };

  // Stickers Toggle
  const handleToggleSticker = (stickerId: string) => {
    if (activeStickers.includes(stickerId)) {
      setActiveStickers(activeStickers.filter((s) => s !== stickerId));
    } else {
      setActiveStickers([...activeStickers, stickerId]);
    }
  };

  // AI Magic Action
  const handleApplyAITool = (tool: typeof AI_MAGIC_TOOLS[0]) => {
    setIsProcessingAI(true);
    setAiStatusMessage(`Applying ${tool.name}...`);

    setTimeout(() => {
      setIsProcessingAI(false);
      if (!activeAITools.includes(tool.id)) {
        setActiveAITools([...activeAITools, tool.id]);
      }
      soundFx.playSuccess();
      showToast(`✨ ${tool.name} applied to project!`);

      // Specific tool side effects
      if (tool.id === 'ai-auto-reframe') {
        setAspectRatio('9:16');
      } else if (tool.id === 'ai-4k-upscale') {
        setSelectedFilter('sharp-4k-master');
      } else if (tool.id === 'ai-anime-cel') {
        setSelectedFilter('anime-cel');
      }
    }, 1400);
  };

  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setHueRotate(0);
    setBlurVal(0);
    setSepiaVal(0);
    setVignetteVal(0);
    setFilmGrainVal(0);
    setKelvinTemp(5500);
    showToast('Reset all optical sliders to default');
  };

  const navTabs = [
    { id: 'timeline', label: '✂️ Cut & Split', count: '22 Tools' },
    { id: 'filters', label: '🎨 35+ LUTs', count: '35 Filters' },
    { id: 'vfx', label: '✨ VFX Overlays', count: '30 VFX' },
    { id: 'typography', label: '🔤 Text & AI Captions', count: '24 Styles' },
    { id: 'stickers', label: '🎭 Stickers & Badges', count: '30 Items' },
    { id: 'audio', label: '🎵 Audio & SFX', count: '25 SFX' },
    { id: 'transitions', label: '🔄 Transitions', count: '25 Pro' },
    { id: 'ai', label: '🪄 AI Magic Suite', count: '18 AI Tools' },
    { id: 'photo', label: '🖼️ Photo HSL & Curves', count: '20 Tools' },
    { id: 'canvas', label: '⚙️ Canvas & Aspect', count: '5 Ratios' },
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-full min-h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden bg-slate-950 text-slate-100 select-none relative"
    >
      {/* Drag & Drop Full Canvas Dropzone Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-pink-950/80 backdrop-blur-md border-4 border-dashed border-pink-500 rounded-3xl flex flex-col items-center justify-center gap-3 animate-pulse pointer-events-none">
          <Upload className="w-16 h-16 text-pink-400" />
          <span className="text-xl font-black text-white">Drop Photo or Video to Edit in Mido Cut Pro!</span>
        </div>
      )}

      {/* Top Pro Control Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10 shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-tight flex items-center gap-1">
                MIDO <span className="text-pink-500">CUT</span> STUDIO
              </span>
              <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[9px] font-black rounded-md uppercase tracking-wider">
                150+ PRO TOOLS
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium line-clamp-1 max-w-xs">{mediaName}</span>
          </div>
        </div>

        {/* Media Presets & Upload */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*,image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Media</span>
          </button>

          {/* Sample Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {SAMPLE_VIDEOS.slice(0, 3).map((v, i) => (
              <button
                key={v.id}
                onClick={() => {
                  soundFx.playClick();
                  setMediaUrl(v.url);
                  setMediaName(v.name);
                  setMediaType('video');
                  showToast('Loaded sample video: ' + v.name);
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  mediaUrl === v.url ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sample #{i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              setIsExportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-600/30 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export 4K</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Preview Canvas + Tool Sidebar) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left / Center Viewport Canvas (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-3 md:p-4 bg-black/90 border-r border-white/10 overflow-y-auto no-scrollbar gap-3">
          {/* Aspect Ratio Top Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
              {(['9:16', '16:9', '1:1', '4:5', '21:9'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => {
                    soundFx.playClick();
                    setAspectRatio(ratio);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    aspectRatio === ratio
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            {/* Quick Canvas Transform Controls */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <button
                onClick={() => setFlipH(!flipH)}
                className={`p-1.5 rounded-lg border transition-all ${flipH ? 'bg-pink-600/30 border-pink-500 text-white' : 'bg-white/5 border-white/10 hover:text-white'}`}
                title="Flip Horizontal"
              >
                Flip H
              </button>
              <button
                onClick={() => setRotationDeg((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-all"
                title="Rotate 90°"
              >
                Rotate 90°
              </button>
            </div>
          </div>

          {/* Video / Photo Preview Stage */}
          <div className="flex-1 flex items-center justify-center relative min-h-[300px] max-h-[460px] bg-slate-950 rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
            {/* Background Blur Backdrop if chosen */}
            {canvasBg === 'blur' && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125"
                style={{ backgroundImage: `url(${mediaUrl})` }}
              />
            )}

            {/* Aspect Ratio Box Container */}
            <div
              className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 shadow-2xl ${
                aspectRatio === '9:16'
                  ? 'w-[250px] sm:w-[280px] h-[440px]'
                  : aspectRatio === '16:9'
                  ? 'w-[92%] max-w-[560px] h-[315px]'
                  : aspectRatio === '1:1'
                  ? 'w-[320px] h-[320px]'
                  : aspectRatio === '4:5'
                  ? 'w-[280px] h-[350px]'
                  : 'w-[95%] max-w-[580px] h-[246px]'
              } bg-black rounded-2xl border border-white/20`}
            >
              {/* Media Element */}
              {mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-all"
                  style={{
                    filter: computeCombinedFilter(),
                    transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${rotationDeg}deg) scale(${zoomScale})`,
                  }}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Edit target"
                  className="w-full h-full object-cover transition-all"
                  style={{
                    filter: computeCombinedFilter(),
                    transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1}) rotate(${rotationDeg}deg) scale(${zoomScale})`,
                  }}
                />
              )}

              {/* Dynamic Vignette Mask if enabled */}
              {vignetteVal > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    background: `radial-gradient(circle, transparent ${100 - vignetteVal}%, rgba(0,0,0,${vignetteVal / 100}))`,
                  }}
                />
              )}

              {/* Film Grain Texture Simulation */}
              {filmGrainVal > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(rgba(255,255,255,${filmGrainVal / 100}) 1px, transparent 0)`,
                    backgroundSize: '3px 3px',
                  }}
                />
              )}

              {/* Active VFX Overlay Simulation */}
              {selectedVFX !== 'vfx-none' && (
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity"
                  style={{ opacity: vfxOpacity / 100 }}
                >
                  {selectedVFX.includes('glow') && (
                    <div className="absolute inset-2 border-2 border-pink-500 rounded-2xl shadow-[0_0_30px_#ec4899] animate-pulse" />
                  )}
                  {selectedVFX.includes('glitch') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-cyan-500/20 mix-blend-screen" />
                  )}
                  {selectedVFX.includes('flash') && (
                    <div className="absolute inset-0 bg-white/20 animate-ping" />
                  )}
                  {selectedVFX.includes('letterbox') && (
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="h-8 bg-black w-full" />
                      <div className="h-8 bg-black w-full" />
                    </div>
                  )}
                </div>
              )}

              {/* Text Overlays Render */}
              {textOverlays.map((t) => (
                <div
                  key={t.id}
                  className="absolute left-0 right-0 px-4 flex justify-center pointer-events-none z-20 select-none"
                  style={{ top: `${t.yPercent}%` }}
                >
                  <span
                    className="px-3 py-1 rounded-xl font-bold tracking-tight text-center shadow-lg transition-all"
                    style={{
                      fontFamily: t.font,
                      fontSize: `${t.size}px`,
                      color: t.color,
                      backgroundColor: t.bgColor,
                      textShadow: t.isGlow ? `0 0 16px ${t.color}` : '0 2px 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    {t.text}
                  </span>
                </div>
              ))}

              {/* Active Badges / Stickers Render */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-20 pointer-events-none">
                {activeStickers.map((stId) => {
                  const item = PRO_STICKERS.find((s) => s.id === stId);
                  if (!item) return null;
                  return (
                    <span
                      key={stId}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-lg bg-gradient-to-r ${item.color} border border-white/30`}
                    >
                      {item.label}
                    </span>
                  );
                })}
              </div>

              {/* TikTok / Reels Safe Area Margins Guide */}
              {safeAreaMode && (
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/60 m-4 rounded-xl flex flex-col justify-between p-2 text-[9px] text-amber-300 font-mono">
                  <span>TikTok / Shorts Header Safe Zone</span>
                  <span className="text-center">Safe Center Focus (Titles & Captions)</span>
                  <span>Bottom Engagement UI Safe Zone</span>
                </div>
              )}
            </div>
          </div>

          {/* Pro Timeline Controller */}
          <CutTimeline
            mediaType={mediaType}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            trimStart={trimStart}
            trimEnd={trimEnd}
            playbackSpeed={playbackSpeed}
            onTogglePlay={togglePlay}
            onSeek={handleSeek}
            onTrimChange={(s, e) => {
              setTrimStart(s);
              setTrimEnd(e);
            }}
            onSpeedChange={handleSpeedChange}
            onActionTriggered={showToast}
            safeAreaMode={safeAreaMode}
            onToggleSafeArea={() => setSafeAreaMode(!safeAreaMode)}
          />
        </div>

        {/* Right Tool Catalog & Panels (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/95 overflow-hidden">
          {/* Category Navigation Bar (Horizontally Scrollable) */}
          <div className="flex items-center gap-1.5 p-2 bg-black/60 border-b border-white/10 overflow-x-auto no-scrollbar shrink-0">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md border border-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[9px] opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Active Panel Viewport */}
          <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
            {activeTab === 'filters' && (
              <CutFiltersPanel
                selectedFilter={selectedFilter}
                onSelectFilter={(fid) => {
                  setSelectedFilter(fid);
                  showToast('Applied LUT: ' + fid);
                }}
                filterIntensity={filterIntensity}
                onChangeIntensity={setFilterIntensity}
              />
            )}

            {activeTab === 'vfx' && (
              <CutVFXPanel
                selectedVFX={selectedVFX}
                onSelectVFX={(vfxId) => {
                  setSelectedVFX(vfxId);
                  showToast('Applied VFX: ' + vfxId);
                }}
                vfxOpacity={vfxOpacity}
                onChangeOpacity={setVfxOpacity}
              />
            )}

            {activeTab === 'typography' && (
              <CutTypographyPanel
                overlays={textOverlays}
                onAddText={handleAddText}
                onUpdateText={handleUpdateText}
                onDeleteText={handleDeleteText}
                onAutoTranscribeAI={handleAutoTranscribeAI}
                isTranscribing={isTranscribingAI}
              />
            )}

            {activeTab === 'stickers' && (
              <CutStickersPanel
                activeStickers={activeStickers}
                onToggleSticker={handleToggleSticker}
                onClearAllStickers={() => setActiveStickers([])}
              />
            )}

            {activeTab === 'audio' && (
              <CutAudioPanel
                bgMusicTrack={bgMusicTrack}
                onSelectBgMusic={(trk) => {
                  setBgMusicTrack(trk);
                  showToast('Background track set: ' + trk);
                }}
                selectedVoiceChanger={selectedVoiceChanger}
                onSelectVoiceChanger={(vc) => {
                  setSelectedVoiceChanger(vc);
                  showToast('Voice filter set: ' + vc);
                }}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                masterVolume={masterVolume}
                onChangeVolume={setMasterVolume}
                bassBoost={bassBoost}
                onToggleBassBoost={() => setBassBoost(!bassBoost)}
                noiseCancellation={noiseCancellation}
                onToggleNoiseCancellation={() => setNoiseCancellation(!noiseCancellation)}
              />
            )}

            {activeTab === 'transitions' && (
              <CutTransitionsPanel
                selectedTransition={selectedTransition}
                onSelectTransition={(tr) => {
                  setSelectedTransition(tr);
                  showToast('Selected Transition: ' + tr);
                }}
                transitionDuration={transitionDuration}
                onChangeDuration={setTransitionDuration}
              />
            )}

            {activeTab === 'ai' && (
              <CutAIMagicPanel
                onApplyAITool={handleApplyAITool}
                activeAITools={activeAITools}
                isProcessingAI={isProcessingAI}
                aiStatusMessage={aiStatusMessage}
              />
            )}

            {activeTab === 'photo' && (
              <CutPhotoPanel
                brightness={brightness}
                setBrightness={setBrightness}
                contrast={contrast}
                setContrast={setContrast}
                saturate={saturate}
                setSaturate={setSaturate}
                hueRotate={hueRotate}
                setHueRotate={setHueRotate}
                blurVal={blurVal}
                setBlurVal={setBlurVal}
                sepiaVal={sepiaVal}
                setSepiaVal={setSepiaVal}
                vignetteVal={vignetteVal}
                setVignetteVal={setVignetteVal}
                filmGrainVal={filmGrainVal}
                setFilmGrainVal={setFilmGrainVal}
                kelvinTemp={kelvinTemp}
                setKelvinTemp={setKelvinTemp}
                onResetAdjustments={handleResetAdjustments}
              />
            )}

            {activeTab === 'canvas' && (
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Canvas Background Backdrop:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['slate', 'black', 'blur', 'cyber'] as const).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setCanvasBg(bg)}
                      className={`p-3 rounded-2xl border text-xs font-bold capitalize transition-all ${
                        canvasBg === bg
                          ? 'bg-pink-600/30 border-pink-500 text-white shadow'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bg === 'blur' ? 'Blurred Video Backdrop' : `${bg} Studio Canvas`}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 p-3 bg-black/40 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Optical Zoom Scale:</span>
                    <span className="font-mono text-pink-400 font-bold">{Math.round(zoomScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.05}
                    value={zoomScale}
                    onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Timeline Pro Operations:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => showToast('Frame split at playhead')}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-left hover:bg-white/5"
                  >
                    ✂️ Razor Multi-Track Cut
                  </button>
                  <button
                    onClick={() => showToast('Magnetic timeline snapping enabled')}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-left hover:bg-white/5"
                  >
                    🧲 Magnetic Grid Snap
                  </button>
                  <button
                    onClick={() => showToast('Generated 3s Freeze Frame')}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-left hover:bg-white/5"
                  >
                    ❄️ Freeze Frame Still
                  </button>
                  <button
                    onClick={() => showToast('Reversed clip frames playback')}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-left hover:bg-white/5"
                  >
                    🔄 Reverse Video Playback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 border border-pink-500/40 text-pink-300 text-xs font-bold rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4K Export & Publish to Mido Orb Modal */}
      <CutExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        mediaName={mediaName}
        mediaType={mediaType}
        mediaUrl={mediaUrl}
        aspectRatio={aspectRatio}
        onPublishToMidoOrb={onPublishToMidoOrb}
        onNavigateToOrb={onNavigateToOrb}
      />
    </div>
  );
};
