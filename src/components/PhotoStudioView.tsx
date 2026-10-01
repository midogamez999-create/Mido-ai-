import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { PHOTO_PRESETS } from '../data/presets';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Upload,
  Wand2,
  Sliders,
  Check,
  RefreshCw,
  Loader2,
  Layers,
  ArrowRight,
  Eye,
  Copy,
  Filter,
  Sun,
  Camera,
  Zap,
  Share2,
  Maximize2,
  Palette,
  Grid,
  Type,
  RotateCcw,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface PhotoStudioViewProps {
  onGenerateImage: (prompt: string, aspectRatio: string, style: string) => Promise<string>;
  onEditImage: (imageBase64: string, prompt: string) => Promise<string>;
  generatedImages: GeneratedImage[];
}

export const PhotoStudioView: React.FC<PhotoStudioViewProps> = ({
  onGenerateImage,
  onEditImage,
  generatedImages,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit' | 'fx' | 'gallery'>('create');
  
  // Creation States
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('extra hands, deformed fingers, extra fingers, fused fingers, mutated hands, bad anatomy, bad hands, cloned limbs, duplicate person, malformed limbs, distorted face, blur');
  const [perfectAnatomyShield, setPerfectAnatomyShield] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic 8K');
  const [selectedLighting, setSelectedLighting] = useState('Cinematic Volumetric');
  const [selectedCamera, setSelectedCamera] = useState('Eye-Level');
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Editing States
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editedResult, setEditedResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FX & Filter Studio States
  const [fxTargetImage, setFxTargetImage] = useState<string | null>(null);
  const [presetFilter, setPresetFilter] = useState<'none' | 'cyberpunk' | 'vintage' | 'bw' | 'hdr' | 'warm' | 'cool' | 'glitch'>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [overlayText, setOverlayText] = useState('');
  const [overlayPos, setOverlayPos] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [overlayColor, setOverlayColor] = useState('#ffffff');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Starter Default Showcase Images if session images is empty
  const defaultShowcaseImages: GeneratedImage[] = [
    {
      id: 'demo-botates-0',
      prompt: '🥔 Crispy Golden Potatoes (Botates) & French Fries in a rustic bowl with herbs and garlic dip, 8K food photography',
      url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1024&h=1024&fit=crop',
      aspectRatio: '1:1',
      style: 'Photorealistic 8K',
      createdAt: 'Just now',
    },
    {
      id: 'demo-football-1',
      prompt: '⚽ 3D Football AI Match: Epic Goal Shootout in Packed Stadium with Floodlights',
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1024&h=1024&fit=crop',
      aspectRatio: '1:1',
      style: '3D Football Stadium',
      createdAt: 'Just now',
    },
    {
      id: 'demo-cyber-2',
      prompt: '🏎️ Cyberpunk Sports Car drifting through rainy neon Tokyo street, 4K raytracing',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=720&fit=crop',
      aspectRatio: '16:9',
      style: 'Cyberpunk',
      createdAt: 'Just now',
    },
    {
      id: 'demo-nature-3',
      prompt: 'A serene Japanese zen garden with sakura petals floating over crystal water at sunrise',
      url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1024&h=768&fit=crop',
      aspectRatio: '4:3',
      style: 'Photorealistic 8K',
      createdAt: 'Just now',
    },
  ];

  const allImages = generatedImages.length > 0 ? generatedImages : defaultShowcaseImages;
  const currentSelectedImage = allImages[0];

  // Set default FX target image when available
  useEffect(() => {
    if (currentSelectedImage && !fxTargetImage) {
      setFxTargetImage(currentSelectedImage.url);
    }
  }, [currentSelectedImage, fxTargetImage]);

  const styles = [
    'Photorealistic 8K',
    '3D Football Stadium',
    'Cyberpunk Synthwave',
    'Cinematic Movie',
    'Pixar Animation',
    'Anime / Manga',
    '3D Octane Render',
    'Dark Fantasy',
    '35mm Vintage Film',
    'Oil Canvas Art',
    'Watercolor',
    'Isometric 3D',
    'Minimalist Vector',
  ];

  const lightings = [
    { label: 'Cinematic Volumetric', icon: Sun },
    { label: 'Studio Floodlights', icon: Zap },
    { label: 'Golden Hour Sunset', icon: Sun },
    { label: 'Cyberpunk Neon Glow', icon: Sparkles },
    { label: 'Dramatic Chiaroscuro', icon: Camera },
    { label: 'Soft Ambient Light', icon: Palette },
  ];

  const cameraAngles = [
    'Eye-Level',
    'Macro Close-Up',
    'Wide Aerial Drone',
    'Low-Angle Hero Shot',
    'Dutch Tilt Perspective',
    '85mm Portrait Bokeh',
  ];

  const aspectRatios = [
    { label: '1:1 Square', value: '1:1', desc: 'Social & Profile' },
    { label: '16:9 Banner', value: '16:9', desc: 'HD Display & Video' },
    { label: '4:3 Card', value: '4:3', desc: 'Standard Photo' },
    { label: '9:16 Portrait', value: '9:16', desc: 'Mobile & Story' },
  ];

  const handleMagicEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt('⚽ 3D Football AI Match: Epic penalty shootout in packed stadium under bright floodlights');
      return;
    }
    const qualityAdditions = 'highly detailed 8K resolution, Unreal Engine 5 render, cinematic volumetric lighting, raytracing reflections, masterpiece quality';
    if (!prompt.includes('8K')) {
      setPrompt((prev) => `${prev}, ${qualityAdditions}`);
    }
    showToast('✨ Magic Prompt Enhanced!');
  };

  const handleQuickTagAdd = (tag: string) => {
    if (prompt.includes(tag)) return;
    setPrompt((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setGenerationProgress(15);
    setStatusMessage('🧠 AI Neural Engine: Structuring prompt architecture...');

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const next = prev + 15;
        if (next > 30 && next < 60) {
          setStatusMessage('🎨 Synthesizing 8K diffusion latent grid & textures...');
        } else if (next >= 60 && next < 85) {
          setStatusMessage('⚡ Applying volumetric lighting & raytracing reflections...');
        } else if (next >= 85) {
          setStatusMessage('✨ Finalizing ultra high-res image render...');
        }
        return next;
      });
    }, 400);

    try {
      const fullPrompt = `${prompt}${negativePrompt ? ` [avoiding: ${negativePrompt}]` : ''} (${selectedLighting}, ${selectedCamera} angle)`;
      await onGenerateImage(fullPrompt, aspectRatio, selectedStyle);
      setGenerationProgress(100);
      setStatusMessage('🎉 Photo Rendered Successfully!');
      showToast('✨ High-Res Photo Generated!');
    } catch (err: any) {
      console.error(err);
      showToast('⚠️ Photo generation error');
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setSourceImage(dataUrl);
      setEditedResult(null);
      showToast('📷 Photo loaded for AI editing');
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImage || !editPrompt.trim() || isLoading) return;

    setIsLoading(true);
    setGenerationProgress(20);
    setStatusMessage('🪄 AI Photo Editor: Processing image & prompt mask...');

    const interval = setInterval(() => {
      setGenerationProgress((prev) => (prev >= 90 ? 90 : prev + 20));
    }, 350);

    try {
      const resUrl = await onEditImage(sourceImage, editPrompt);
      setEditedResult(resUrl);
      setGenerationProgress(100);
      showToast('🪄 AI Photo Edit Applied!');
    } catch (err: any) {
      console.error(err);
      showToast('⚠️ AI photo edit failed');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // Preset Filter Application for FX Studio
  const applyPresetFilter = (filterKey: typeof presetFilter) => {
    setPresetFilter(filterKey);
    switch (filterKey) {
      case 'cyberpunk':
        setBrightness(110);
        setContrast(135);
        setSaturate(160);
        setHueRotate(280);
        setSepia(0);
        setBlur(0);
        break;
      case 'vintage':
        setBrightness(95);
        setContrast(110);
        setSaturate(80);
        setSepia(45);
        setHueRotate(0);
        setBlur(0);
        break;
      case 'bw':
        setBrightness(105);
        setContrast(140);
        setSaturate(0);
        setSepia(0);
        setHueRotate(0);
        setBlur(0);
        break;
      case 'hdr':
        setBrightness(105);
        setContrast(150);
        setSaturate(180);
        setSepia(0);
        setHueRotate(0);
        setBlur(0);
        break;
      case 'warm':
        setBrightness(105);
        setContrast(110);
        setSaturate(130);
        setSepia(25);
        setHueRotate(15);
        setBlur(0);
        break;
      case 'cool':
        setBrightness(100);
        setContrast(115);
        setSaturate(120);
        setHueRotate(190);
        setSepia(0);
        setBlur(0);
        break;
      case 'glitch':
        setBrightness(120);
        setContrast(160);
        setSaturate(200);
        setHueRotate(140);
        setSepia(10);
        setBlur(1);
        break;
      default:
        setBrightness(100);
        setContrast(100);
        setSaturate(100);
        setBlur(0);
        setSepia(0);
        setHueRotate(0);
        break;
    }
  };

  const getFilterCSS = () => {
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) blur(${blur}px) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`📋 ${label} copied to clipboard!`);
  };

  return (
    <div className="flex-1 flex flex-col h-full text-slate-100 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-indigo-400/50 flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          {toastMessage}
        </div>
      )}

      {/* Header & Main Navigation Tabs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" /> Ultra AI Image &amp; Photo Master Studio
          </div>
          <h1 className="text-3xl font-extralight text-white tracking-tight">Image &amp; Photo Studio</h1>
        </div>

        {/* Studio Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Imagine &amp; Create
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'edit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-300" /> AI Photo Editor
          </button>

          <button
            onClick={() => setActiveTab('fx')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'fx'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-cyan-300" /> Live FX &amp; Filters
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-emerald-300" /> Gallery ({allImages.length})
          </button>
        </div>
      </div>

      {/* Progress Bar Header during loading */}
      {isLoading && (
        <div className="mb-6 bg-slate-900/90 border border-indigo-500/40 p-4 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-indigo-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              {statusMessage || 'AI Processing...'}
            </span>
            <span className="text-amber-300 font-mono">{generationProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* TAB 1: IMAGINE & CREATE */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5 bg-slate-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Prompt Description
                  </label>
                  <button
                    type="button"
                    onClick={handleMagicEnhancePrompt}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1 transition-all"
                  >
                    <Wand2 className="w-3 h-3 text-amber-400" /> Magic Enhance
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., ⚽ 3D Football AI Match: Epic penalty goal shootout under bright stadium floodlights..."
                  className="w-full h-28 p-3.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none transition-all"
                />

                {/* Quick Quality Chips */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Inspirations:</span>
                  {[
                    { label: '🥔 Botates / Fries', prompt: '🥔 Crispy golden potatoes (botates) and French fries with herbs and garlic dip in a wooden bowl, 8K food photo' },
                    { label: '⚽ Football Shootout', prompt: '⚽ 3D Football AI Match: Epic goal shootout in packed stadium with floodlights' },
                    { label: '🏎️ Cyber Tokyo', prompt: '🏎️ Cyberpunk sports car drifting on rainy neon Tokyo street, 4K raytracing' },
                    { label: '👤 Perfect Portrait', prompt: 'A cinematic high fashion 8K portrait of a person with natural skin texture, perfect hands, sharp focus' },
                    { label: '🐾 Cute Puppy & Cat', prompt: 'Cute fluffy golden retriever puppy and kitten playing in sunny flower meadow, 8K' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => setPrompt(item.prompt)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anatomy & Hand Correction Shield Toggle */}
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Perfect Hands & Anatomy Shield</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Guarantees 5 fingers, natural limbs & eliminates hand/facial errors</div>
                </div>
                <input
                  type="checkbox"
                  checked={perfectAnatomyShield}
                  onChange={(e) => setPerfectAnatomyShield(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Negative Prompt (Filter out artifacts & unwanted features)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="E.g., blur, noise, extra hands, deformed fingers, lowres"
                  className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Visual Style Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Visual Style ({selectedStyle})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {styles.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedStyle(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedStyle === s
                          ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-600/30'
                          : 'bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {aspectRatios.map((ar) => (
                    <button
                      type="button"
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        aspectRatio === ar.value
                          ? 'bg-indigo-600/30 text-indigo-200 border-indigo-400 font-bold shadow-sm'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-white">{ar.label}</div>
                      <div className="text-[10px] text-slate-400">{ar.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting & Camera Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Lighting Style
                  </label>
                  <select
                    value={selectedLighting}
                    onChange={(e) => setSelectedLighting(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                  >
                    {lightings.map((l) => (
                      <option key={l.label} value={l.label} className="bg-slate-900 text-white">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Camera Perspective
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full p-2 bg-black/40 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                  >
                    {cameraAngles.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> Synthesizing 8K Photo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Generate High-Res Photo
                  </>
                )}
              </button>
            </form>

            {/* Presets Grid */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Preset Ideas
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {PHOTO_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(preset)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-[11px] text-slate-300 border border-white/10 transition-colors line-clamp-2"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Preview Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 min-h-[460px] relative shadow-2xl overflow-hidden">
            {isLoading ? (
              <div className="w-full flex flex-col items-center justify-center py-6 px-4 space-y-6 animate-fadeIn">
                {/* Holographic Glowing Rings & Reactor Center */}
                <div className="relative flex items-center justify-center w-36 h-36">
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 rounded-full border-4 border-dotted border-purple-500/60 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-4 rounded-full border-2 border-indigo-400/80 animate-pulse" />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/50 relative overflow-hidden">
                    <Sparkles className="w-8 h-8 text-amber-300 animate-bounce mb-0.5" />
                    <span className="font-mono text-xs font-black text-white tracking-tighter">{generationProgress}%</span>
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  </div>
                </div>

                {/* Status & Title */}
                <div className="text-center space-y-1.5 max-w-md">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                      Gemini 8K Neural Diffusion Engine
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-indigo-300 min-h-[20px] transition-all">
                    {statusMessage || 'Synthesizing ultra high-res pixels...'}
                  </p>
                </div>

                {/* 4-Stage Diffusion Pipeline Tracker */}
                <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span>Rendering Pipeline</span>
                    <span className="text-indigo-400 font-mono">{generationProgress}% Complete</span>
                  </div>

                  {/* Glowing Multi-Color Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 relative">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 relative shadow-[0_0_12px_rgba(129,140,248,0.8)]"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>

                  {/* 4 Discrete Stage Badges */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                    {[
                      { step: 1, label: 'Geometry', threshold: 25 },
                      { step: 2, label: 'Latent Grid', threshold: 55 },
                      { step: 3, label: 'Raytracing', threshold: 80 },
                      { step: 4, label: '8K Render', threshold: 100 },
                    ].map((st) => {
                      const isDone = generationProgress >= st.threshold;
                      const isCurrent = generationProgress < st.threshold && (generationProgress >= st.threshold - 30 || st.step === 1);
                      return (
                        <div
                          key={st.step}
                          className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : isCurrent
                              ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 animate-pulse'
                              : 'bg-white/5 border-white/5 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            {isDone ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <span>#{st.step}</span>}
                            <span>{st.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Metadata Chip */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <span>Aspect: <strong className="text-slate-200">{aspectRatio}</strong></span>
                  <span>•</span>
                  <span>Style: <strong className="text-slate-200">{selectedStyle}</strong></span>
                  <span>•</span>
                  <span>Angle: <strong className="text-slate-200">{selectedCamera}</strong></span>
                </div>
              </div>
            ) : currentSelectedImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                {/* Image Frame */}
                <div className="relative group max-h-[480px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <img
                    src={currentSelectedImage.url}
                    alt={currentSelectedImage.prompt}
                    className="max-h-[440px] w-auto object-contain rounded-2xl"
                  />
                  {/* Hover Actions Bar */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 backdrop-blur-sm">
                    <a
                      href={currentSelectedImage.url}
                      download="mido-ai-photo.png"
                      className="px-3.5 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-4 h-4 text-indigo-600" /> Download High-Res
                    </a>

                    <button
                      onClick={() => {
                        setFxTargetImage(currentSelectedImage.url);
                        setActiveTab('fx');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-indigo-500 transition-colors"
                    >
                      <Filter className="w-4 h-4 text-cyan-300" /> Apply FX Filters
                    </button>

                    <button
                      onClick={() => {
                        setSourceImage(currentSelectedImage.url);
                        setActiveTab('edit');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-purple-500 transition-colors"
                    >
                      <Wand2 className="w-4 h-4 text-amber-300" /> AI Edit
                    </button>
                  </div>
                </div>

                {/* Prompt Details & Actions */}
                <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex-1 text-left">
                    <p className="text-slate-200 font-medium line-clamp-2">"{currentSelectedImage.prompt}"</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Aspect: {currentSelectedImage.aspectRatio}</span>
                      <span>Style: {currentSelectedImage.style || selectedStyle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(currentSelectedImage.prompt, 'Prompt')}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1"
                      title="Copy Prompt"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>

                    <button
                      onClick={() => {
                        setPrompt(currentSelectedImage.prompt);
                        showToast('Reusing prompt in creator');
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1"
                      title="Reuse Prompt"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reuse
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-500" />
                <p className="text-xs">Describe your image on the left to start generating</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI PHOTO EDITOR */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Upload or Select Source Photo to Edit
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-2xl bg-black/40 border border-white/15 hover:border-indigo-400/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4 text-indigo-400" /> Upload Photo
                </button>

                {currentSelectedImage && (
                  <button
                    onClick={() => {
                      setSourceImage(currentSelectedImage.url);
                      showToast('Using recent photo');
                    }}
                    className="px-3.5 py-3 rounded-2xl bg-black/40 border border-white/15 hover:border-white/30 text-xs font-semibold text-slate-300"
                  >
                    Use Recent
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Describe the AI Photo Modification
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="E.g., Change background to a futuristic cyberpunk city with neon rain, add futuristic helmet..."
                  className="w-full h-28 p-3.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none transition-all"
                />
              </div>

              {/* Quick Preset Edit Ideas */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Preset Edit Ideas:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Add futuristic neon aura',
                    'Turn into 3D Pixar character',
                    'Change weather to snowy night',
                    'Add packed football stadium crowd',
                    'Convert background to cyberpunk Tokyo',
                  ].map((presetText) => (
                    <button
                      type="button"
                      key={presetText}
                      onClick={() => setEditPrompt(presetText)}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10"
                    >
                      {presetText}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !sourceImage || !editPrompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> Applying AI Photo Edit...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-purple-300" /> Apply AI Edit
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 min-h-[460px] flex flex-col items-center justify-center shadow-2xl">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-300 text-center">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                <p className="text-xs font-semibold">{statusMessage || 'Gemini AI is applying edit mask...'}</p>
              </div>
            ) : editedResult ? (
              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center bg-black/40 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Original Photo</span>
                    <img src={sourceImage!} alt="Original" className="w-full h-52 object-contain rounded-xl" />
                  </div>
                  <div className="text-center bg-black/40 p-3 rounded-2xl border border-purple-500/50 shadow-xl">
                    <span className="text-[10px] font-bold text-purple-300 uppercase mb-1 block">AI Edited Result</span>
                    <img src={editedResult} alt="Edited" className="w-full h-52 object-contain rounded-xl" />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={editedResult}
                    download="mido-edited-photo.png"
                    className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4 text-purple-600" /> Save Edited Photo
                  </a>
                </div>
              </div>
            ) : sourceImage ? (
              <div className="text-center space-y-3">
                <img src={sourceImage} alt="Source" className="max-h-64 rounded-2xl border border-white/20 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Ready to edit! Type your edit instruction on the left.</p>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-3">
                <Wand2 className="w-12 h-12 mx-auto text-slate-500" />
                <p className="text-xs">Upload or select a photo to start AI Editing</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE FX & FILTERS */}
      {activeTab === 'fx' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-slate-900/70 backdrop-blur-2xl p-5 md:p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select One-Click Preset FX
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'none', name: 'Normal' },
                  { id: 'cyberpunk', name: 'Cyberpunk' },
                  { id: 'vintage', name: 'Vintage' },
                  { id: 'bw', name: 'B&W' },
                  { id: 'hdr', name: 'HDR' },
                  { id: 'warm', name: 'Warm' },
                  { id: 'cool', name: 'Cool' },
                  { id: 'glitch', name: 'Glitch' },
                ].map((pf) => (
                  <button
                    key={pf.id}
                    onClick={() => applyPresetFilter(pf.id as any)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                      presetFilter === pf.id
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {pf.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Adjustments */}
            <div className="space-y-3.5 bg-black/40 p-4 rounded-2xl border border-white/10">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Manual Adjustments</span>
                <button
                  onClick={() => applyPresetFilter('none')}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-white">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-white">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-white">{saturate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturate}
                  onChange={(e) => setSaturate(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Hue Shift</span>
                  <span className="font-mono text-white">{hueRotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hueRotate}
                  onChange={(e) => setHueRotate(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Text Overlay Tool */}
            <div className="space-y-2.5 bg-black/40 p-4 rounded-2xl border border-white/10">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" /> Add Watermark / Title Text Overlay
              </label>
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="E.g., Mido AI Studio ⚽ 8K"
                className="w-full p-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] text-slate-400">Position:</span>
                {(['top', 'center', 'bottom'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setOverlayPos(pos)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${
                      overlayPos === pos ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas Display Column */}
          <div className="lg:col-span-7 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 min-h-[460px] flex flex-col items-center justify-center relative shadow-2xl">
            {fxTargetImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative group max-h-[440px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                  <img
                    src={fxTargetImage}
                    alt="Target FX"
                    style={{ filter: getFilterCSS() }}
                    className="max-h-[420px] w-auto object-contain rounded-2xl transition-all duration-150"
                  />

                  {/* Watermark Overlay */}
                  {overlayText && (
                    <div
                      className={`absolute left-0 right-0 px-4 text-center pointer-events-none ${
                        overlayPos === 'top' ? 'top-4' : overlayPos === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-4'
                      }`}
                    >
                      <span className="bg-black/60 backdrop-blur-md text-white font-extrabold text-sm md:text-base px-4 py-1.5 rounded-xl border border-white/20 shadow-2xl tracking-wide">
                        {overlayText}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={fxTargetImage}
                    download="mido-fx-photo.png"
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Save Filtered Photo
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-3">
                <Filter className="w-12 h-12 mx-auto text-slate-500" />
                <p className="text-xs">Select or generate a photo to apply live FX filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: GALLERY & VAULT */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/70 p-4 rounded-2xl border border-white/10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-400" /> Session Photo History ({allImages.length} Photos)
            </h2>
            <p className="text-xs text-slate-400">Click any photo to load in Creator or FX Studio</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allImages.map((img, idx) => (
              <div
                key={img.id || idx}
                className="group relative bg-slate-900/80 rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:border-indigo-400/50 transition-all"
              >
                <img src={img.url} alt={img.prompt} className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between backdrop-blur-sm">
                  <p className="text-xs text-slate-200 line-clamp-3 font-medium">"{img.prompt}"</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <a
                      href={img.url}
                      download={`mido-photo-${idx + 1}.png`}
                      className="px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3 text-indigo-600" /> Save
                    </a>

                    <button
                      onClick={() => {
                        setFxTargetImage(img.url);
                        setActiveTab('fx');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 text-white text-[10px] font-bold flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" /> FX
                    </button>

                    <button
                      onClick={() => {
                        setSourceImage(img.url);
                        setActiveTab('edit');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
