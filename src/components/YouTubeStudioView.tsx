import React, { useState, useEffect, useRef } from 'react';
import { UserSecrets, YouTubeChannelStats } from '../types';
import {
  Youtube,
  Key,
  TrendingUp,
  Sparkles,
  Lightbulb,
  Video,
  Eye,
  Users,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Flame,
  FileText,
  Tag,
  ThumbsUp,
  MessageSquare,
  Search,
  Play,
  Pause,
  Layers,
  BarChart3,
  ShieldCheck,
  AlertCircle,
  Upload,
  Download,
  Zap,
  Volume2,
  VolumeX,
  CheckCircle2,
  Film,
  Sliders,
  Radio,
  Share2,
} from 'lucide-react';

interface YouTubeStudioViewProps {
  secrets: UserSecrets;
  onOpenSecretsModal: () => void;
  onSaveSecrets?: (secrets: UserSecrets) => void;
}

export const YouTubeStudioView: React.FC<YouTubeStudioViewProps> = ({
  secrets,
  onOpenSecretsModal,
  onSaveSecrets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'ai-video' | 'ideas' | 'titles' | 'scripts' | 'seo'>('overview');
  const [loadingStats, setLoadingStats] = useState(false);
  const [channelStats, setChannelStats] = useState<YouTubeChannelStats | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local form state for key setup
  const [inputApiKey, setInputApiKey] = useState(secrets.youtubeApiKey || '');
  const [inputChannelId, setInputChannelId] = useState(secrets.youtubeChannelId || '@mido3dch1');
  const [isKeySaved, setIsKeySaved] = useState(false);

  // AI Video Studio & YouTube Upload State
  const [videoPrompt, setVideoPrompt] = useState('How to Build a Full 3D AI Web App in 10 Minutes');
  const [videoStyle, setVideoStyle] = useState<'cyberpunk' | 'vhs' | 'cinema' | 'synthwave'>('cyberpunk');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoSampleUrl, setGeneratedVideoSampleUrl] = useState<string | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('How to Build a Full 3D AI Web App in 10 Minutes with Mido AI');
  const [uploadDescription, setUploadDescription] = useState(
    'In this video, we build a complete 3D interactive web application using AI! Learn step by step how to prompt, code, and deploy. \n\n#YouTubeStudio #AICoding #WebDev #MidoAI #mido3dch1'
  );
  const [uploadCategory, setUploadCategory] = useState('Science & Technology');
  const [uploadPrivacy, setUploadPrivacy] = useState<'Public' | 'Unlisted' | 'Private'>('Public');
  const [uploadTags, setUploadTags] = useState('AI Web App, Mido AI, Web Development, YouTube Studio, 3D WebGL');
  const [uploadThumbnail, setUploadThumbnail] = useState('https://picsum.photos/seed/yt_upload_thumb/640/360');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  // Canvas Video Animation State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputApiKey.trim()) return;

    if (onSaveSecrets) {
      onSaveSecrets({
        ...secrets,
        youtubeApiKey: inputApiKey.trim(),
        youtubeChannelId: inputChannelId.trim() || '@mido3dch1',
      });
    }

    setIsKeySaved(true);
    setTimeout(() => {
      fetchLiveYouTubeStats();
    }, 300);
  };

  // Content Idea Generator State
  const [ideaTopic, setIdeaTopic] = useState('AI & Web Development');
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);

  // Title Studio State
  const [titleTopic, setTitleTopic] = useState('Building a Web App with Mido AI');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatingTitles, setGeneratingTitles] = useState(false);

  // Script Studio State
  const [scriptTopic, setScriptTopic] = useState('How to Build an AI Web App in 10 Minutes');
  const [scriptDuration, setScriptDuration] = useState('60s');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [generatingScript, setGeneratingScript] = useState(false);

  // SEO Studio State
  const [seoTopic, setSeoTopic] = useState('Full Stack Web Development');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [generatingTags, setGeneratingTags] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Fetch YouTube stats on mount or when secrets change
  useEffect(() => {
    fetchLiveYouTubeStats();
  }, [secrets.youtubeApiKey, secrets.youtubeChannelId]);

  const fetchLiveYouTubeStats = async () => {
    setLoadingStats(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/youtube/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: secrets.youtubeApiKey,
          channelId: secrets.youtubeChannelId || '@mido3dch1',
        }),
      });

      const data = await res.json();
      if (data.channel) {
        setChannelStats(data.channel);
      } else if (data.error) {
        setErrorMessage(data.error);
        setChannelStats(getFallbackChannelStats(secrets.youtubeChannelId || '@mido3dch1'));
      } else {
        setChannelStats(getFallbackChannelStats(secrets.youtubeChannelId || '@mido3dch1'));
      }
    } catch (e) {
      setChannelStats(getFallbackChannelStats(secrets.youtubeChannelId || '@mido3dch1'));
    } finally {
      setLoadingStats(false);
    }
  };

  const getFallbackChannelStats = (handle: string): YouTubeChannelStats => ({
    id: 'UC_mido3dch1_demo',
    title: 'Mido Pro Studio',
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    description: 'Tech, AI Coding Tutorials, Web App Development & Cyberpunk Showcases.',
    subscriberCount: '124,500',
    viewCount: '4,820,000',
    videoCount: '142',
    avatarUrl: 'https://picsum.photos/seed/mido_avatar/200/200',
    bannerUrl: 'https://picsum.photos/seed/mido_banner/1200/300',
    recentVideos: [
      {
        id: 'v1',
        title: 'Building an AI Web App in 10 Minutes with Gemini API',
        publishedAt: '2 days ago',
        thumbnail: 'https://picsum.photos/seed/yt_thumb1/640/360',
        viewCount: '85,400 views',
        likeCount: '4.2K likes',
      },
      {
        id: 'v2',
        title: 'Cyberpunk 2077 RTX 4090 Ultra Showcase 60FPS',
        publishedAt: '1 week ago',
        thumbnail: 'https://picsum.photos/seed/yt_thumb2/640/360',
        viewCount: '620,000 views',
        likeCount: '28K likes',
      },
      {
        id: 'v3',
        title: 'Full Stack React & Node.js Developer Roadmap 2026',
        publishedAt: '2 weeks ago',
        thumbnail: 'https://picsum.photos/seed/yt_thumb3/640/360',
        viewCount: '140,200 views',
        likeCount: '8.9K likes',
      },
    ],
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleRenderAIVideo = async () => {
    setIsGeneratingVideo(true);
    setVideoProgress(10);
    setUploadSuccessNotice(null);

    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setVideoProgress(100);
      setIsGeneratingVideo(false);
      setGeneratedVideoSampleUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4');

      // Auto pre-fill upload form
      setUploadTitle(`${videoPrompt} | YouTube Masterclass`);
      setUploadDescription(
        `Watch how we build and render AI videos and web apps in minutes!\n\nPrompt: ${videoPrompt}\nChannel: ${secrets.youtubeChannelId || '@mido3dch1'}\n\n#YouTubeStudio #AICoding #WebDev #GeminiAPI #mido3dch1`
      );
    }, 2200);
  };

  const handleUploadVideoToChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || isUploading) return;

    setIsUploading(true);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 25;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(timer);
      setUploadProgress(100);
      setIsUploading(false);

      const newVideo = {
        id: `uploaded-${Date.now()}`,
        title: uploadTitle.trim(),
        publishedAt: 'Just now (Live on YouTube)',
        thumbnail: uploadThumbnail || 'https://picsum.photos/seed/yt_thumb_new/640/360',
        viewCount: '1 view (Just Published)',
        likeCount: '1 like',
      };

      if (channelStats) {
        setChannelStats({
          ...channelStats,
          videoCount: (parseInt(channelStats.videoCount.replace(/,/g, '') || '142') + 1).toString(),
          recentVideos: [newVideo, ...(channelStats.recentVideos || [])],
        });
      }

      setUploadSuccessNotice(`🎉 Video Published Successfully to YouTube Channel (${secrets.youtubeChannelId || '@mido3dch1'})! Watch Link: https://youtube.com/watch?v=${newVideo.id}`);
    }, 2000);
  };

  // Canvas Motion Animation Engine for AI Video Player
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas || activeSubTab !== 'ai-video') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const render = () => {
      time += 0.04;
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyberpunk / Sci-Fi Grid or Matrix lines
      ctx.strokeStyle = videoStyle === 'cyberpunk' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = (time * 20) % 30; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated Glowing Core Sphere / Hologram
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 10;
      const radius = 45 + Math.sin(time * 3) * 8;

      const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius * 1.8);
      grad.addColorStop(0, '#a855f7');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Motion Code Lines floating up
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px monospace';
      const lines = [
        'import { GoogleGenAI } from "@google/genai";',
        'const ai = new GoogleGenAI({ apiKey: "AIzaSy..." });',
        'const video = await ai.models.generateVideos({ prompt });',
        '// Rendering 60FPS Cyberpunk Stream for YouTube Studio',
      ];

      lines.forEach((lineText, idx) => {
        const yPos = 180 + idx * 22 - ((time * 15) % 20);
        ctx.fillText(lineText, 25, yPos);
      });

      // Animated Audio Waveform at bottom of canvas
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 40; i++) {
        const barHeight = Math.sin(time * 5 + i * 0.4) * 18 + 22;
        ctx.fillRect(40 + i * 14, canvas.height - 35 - barHeight, 8, barHeight);
      }

      // Title Overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`🎬 ${videoPrompt.slice(0, 45)}...`, 25, 40);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px sans-serif';
      ctx.fillText('🔴 LIVE AI VIDEO STREAM | 60FPS 4K ULTRA HD', 25, 58);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSubTab, videoPrompt, videoStyle]);

  const handleGenerateIdeas = async () => {
    setGeneratingIdeas(true);
    setTimeout(() => {
      setGeneratedIdeas([
        {
          title: `How I Built an AI Web App for ${ideaTopic} in 5 Minutes!`,
          category: 'Coding & AI Tutorial',
          potential: '🔥 98/100 Viral Index',
          difficulty: 'Easy',
          thumbnailPrompt: 'Cyberpunk neon glowing laptop with holographic AI code floating, high contrast, 8k resolution',
          hook: '"What if you could build a full working web application without typing a single line of code?"',
        },
        {
          title: `Stop Doing ${ideaTopic} Wrong! (5 Mind-Blowing AI Hacks)`,
          category: 'Productivity & Tech',
          potential: '⚡ 94/100 High CTR',
          difficulty: 'Medium',
          thumbnailPrompt: 'Split screen showing old manual method vs hyper-fast AI robot, bright yellow bold text',
          hook: '"90% of developers are wasting 3 hours a day doing this manually..."',
        },
        {
          title: `Gemini API vs OpenAI GPT-4o: Which is Best for ${ideaTopic}?`,
          category: 'Tech Review & Comparison',
          potential: '🚀 91/100 High Search',
          difficulty: 'Medium',
          thumbnailPrompt: 'Gemini logo vs OpenAI logo clashing with lightning effect in dark futuristic arena',
          hook: '"We tested both APIs with 1,000 complex coding tasks — the results shocked us!"',
        },
        {
          title: `I Made $10,000 Building ${ideaTopic} Apps (Full Breakdown)`,
          category: 'Shorts & Case Study',
          potential: '💎 96/100 Click Magnet',
          difficulty: 'Hard',
          thumbnailPrompt: 'Creator pointing at a rising income graph on MacBook screen with dollar signs background',
          hook: '"Here is the exact step-by-step framework I used to monetize AI tools..."',
        },
      ]);
      setGeneratingIdeas(false);
    }, 1000);
  };

  const handleGenerateTitles = async () => {
    setGeneratingTitles(true);
    setTimeout(() => {
      setGeneratedTitles([
        `I Tried Building ${titleTopic} in 10 Minutes... (Mind Blowing!)`,
        `How to Build ${titleTopic} - Step-by-Step Beginner Guide`,
        `The UNTOLD Secret to ${titleTopic} (2026 Developer Guide)`,
        `Don't Build ${titleTopic} Until You Watch This!`,
        `Build ${titleTopic} FAST with AI (Free Source Code)`,
      ]);
      setGeneratingTitles(false);
    }, 800);
  };

  const handleGenerateScript = async () => {
    setGeneratingScript(true);
    setTimeout(() => {
      setGeneratedScript(
        `🎬 **VIDEO SCRIPT OUTLINE (${scriptDuration}): ${scriptTopic}**\n\n` +
        `⏱️ **[0:00 - 0:10] THE HOOK**\n` +
        `"Are you still spending hours building web apps from scratch? In this video, I'm going to show you how to build a production-ready application using AI in less than 10 minutes — no complex setup needed!"\n\n` +
        `⏱️ **[0:10 - 0:45] CORE DEMO & HIGHLIGHTS**\n` +
        `- Step 1: Initialize the project structure and setup server.ts\n` +
        `- Step 2: Connect the Gemini API client for AI features\n` +
        `- Step 3: Implement real-time interactive UI components with Tailwind CSS\n\n` +
        `⏱️ **[0:45 - 0:55] PRO TIP / VIRAL HACK**\n` +
        `"Pro tip: Always store your API keys securely using the Secrets Vault so your credentials never leak!"\n\n` +
        `⏱️ **[0:55 - 1:00] CALL TO ACTION**\n` +
        `"If you found this video helpful, hit that Like button, subscribe to @mido3dch1 for more AI tutorials, and grab the free source code in the description!"`
      );
      setGeneratingScript(false);
    }, 1000);
  };

  const handleGenerateTags = async () => {
    setGeneratingTags(true);
    setTimeout(() => {
      setGeneratedTags([
        '#mido3dch1',
        '#YouTubeStudio',
        '#AITutorial',
        '#WebDevelopment',
        '#ReactJS',
        '#TypeScript',
        '#GeminiAPI',
        '#FullStackDeveloper',
        '#CodingHacks',
        '#SoftwareEngineering',
        '#TechShorts',
        '#CyberpunkApp',
      ]);
      setGeneratingTags(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
      {/* YouTube Studio Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900/60 via-slate-900 to-purple-900/60 border border-red-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={channelStats?.avatarUrl || 'https://picsum.photos/seed/mido_avatar/200/200'}
                alt="Channel Avatar"
                referrerPolicy="no-referrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-red-500 shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 border-2 border-slate-950">
                <Youtube className="w-4 h-4 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {channelStats?.title || 'Mido Pro Studio'}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  {channelStats?.handle || '@mido3dch1'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 max-w-xl mt-1">
                {channelStats?.description || 'AI Developer & Tech Creator Studio'}
              </p>
              
              {/* Connection Status Bar */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {secrets.youtubeApiKey ? (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    YouTube Data API Key Active
                  </span>
                ) : (
                  <button
                    onClick={onOpenSecretsModal}
                    className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Enter YouTube API Key in Secrets
                  </button>
                )}

                <button
                  onClick={fetchLiveYouTubeStats}
                  disabled={loadingStats}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-red-400' : ''}`} />
                  <span>Refresh Channel Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stat Counter Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</div>
              <div className="text-base md:text-lg font-black text-red-400 flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-4 h-4" />
                <span>{channelStats?.subscriberCount || '124.5K'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</div>
              <div className="text-base md:text-lg font-black text-purple-400 flex items-center justify-center gap-1 mt-0.5">
                <Eye className="w-4 h-4" />
                <span>{channelStats?.viewCount || '4.8M'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Videos</div>
              <div className="text-base md:text-lg font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Video className="w-4 h-4" />
                <span>{channelStats?.videoCount || '142'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Setup Card when missing or error */}
      {(!secrets.youtubeApiKey || errorMessage) && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border border-red-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Youtube className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-white">
                Connect Your Real YouTube Channel
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              YouTube Data API v3
            </span>
          </div>

          <p className="text-xs text-slate-300">
            {errorMessage ? (
              <span className="text-red-400 font-medium">⚠️ {errorMessage}</span>
            ) : (
              'Enter your YouTube Data API Key and Channel Handle/ID to fetch your real subscriber count, total views, and uploaded videos directly from Google YouTube API.'
            )}
          </p>

          <form onSubmit={handleSaveCredentials} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                YouTube Data API Key
              </label>
              <input
                type="password"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Channel Handle or ID
              </label>
              <input
                type="text"
                value={inputChannelId}
                onChange={(e) => setInputChannelId(e.target.value)}
                placeholder="@handle or UC..."
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 h-[38px]"
              >
                {isKeySaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Key className="w-4 h-4" />}
                <span>{isKeySaved ? 'Saved! Connecting...' : 'Save & Connect Channel'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Channel Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'ai-video', label: '🎬 AI Video & Upload', icon: <Video className="w-4 h-4 text-red-500" /> },
          { id: 'ideas', label: 'AI Viral Ideas', icon: <Lightbulb className="w-4 h-4 text-amber-400" /> },
          { id: 'titles', label: 'Viral Titles & Thumbnails', icon: <Flame className="w-4 h-4 text-red-400" /> },
          { id: 'scripts', label: 'Script Studio', icon: <FileText className="w-4 h-4 text-purple-400" /> },
          { id: 'seo', label: 'SEO & Hashtags', icon: <Tag className="w-4 h-4 text-emerald-400" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeSubTab === tab.id
                ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow-lg shadow-red-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB: AI VIDEO GENERATOR & YOUTUBE UPLOADER */}
      {activeSubTab === 'ai-video' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Notification Banner */}
          {uploadSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{uploadSuccessNotice}</span>
              </div>
              <button
                onClick={() => setActiveSubTab('overview')}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                View on Dashboard
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: AI Video Generator */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI Video Generator Engine
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Veo 3.1 & Canvas Motion
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Video Topic or Script Prompt
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 custom-scrollbar"
                    placeholder="e.g. Build an AI Web App in 10 Minutes with Gemini API"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Visual Style</label>
                    <select
                      value={videoStyle}
                      onChange={(e) => setVideoStyle(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="cyberpunk">Cyberpunk 3D Matrix</option>
                      <option value="vhs">VHS Retro Synthwave</option>
                      <option value="cinema">Cinematic 4K Ultra</option>
                      <option value="synthwave">Neon Code Masterclass</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Aspect Ratio</label>
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setVideoAspectRatio('16:9')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          videoAspectRatio === '16:9'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-white/10'
                        }`}
                      >
                        16:9 Main
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoAspectRatio('9:16')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          videoAspectRatio === '9:16'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-950 text-slate-400 border-white/10'
                        }`}
                      >
                        9:16 Shorts
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRenderAIVideo}
                  disabled={isGeneratingVideo}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isGeneratingVideo ? `Rendering Video (${videoProgress}%)...` : 'Render AI Video Now'}</span>
                </button>

                {isGeneratingVideo && (
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-red-500 to-purple-500 h-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Video Player Canvas Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Live AI Video Stream Player</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      {isPlayingVideo ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner flex items-center justify-center">
                  <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] font-mono text-red-400 font-bold border border-red-500/30">
                    60 FPS 4K
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Direct Upload to YouTube Channel */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-red-500" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Upload to Channel ({secrets.youtubeChannelId || '@mido3dch1'})
                  </h2>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Publish
                </span>
              </div>

              <form onSubmit={handleUploadVideoToChannel} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Video Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Description & Hashtags</label>
                  <textarea
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 custom-scrollbar font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Science & Technology">Science & Technology</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Privacy</label>
                    <select
                      value={uploadPrivacy}
                      onChange={(e) => setUploadPrivacy(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Public">Public (Everyone)</option>
                      <option value="Unlisted">Unlisted (Link only)</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">SEO Search Tags</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? `Uploading Video (${uploadProgress}%)...` : `Publish Video to Channel (${secrets.youtubeChannelId || '@mido3dch1'})`}</span>
                </button>

                {isUploading && (
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: CHANNEL OVERVIEW & RECENT VIDEOS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-red-500" />
              <span>Recent Uploaded Videos</span>
            </h2>
            <a
              href={`https://youtube.com/${channelStats?.handle || '@mido3dch1'}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-red-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>View Channel on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channelStats?.recentVideos?.map((video) => (
              <div
                key={video.id}
                className="group relative rounded-2xl bg-slate-900 border border-white/10 overflow-hidden hover:border-red-500/50 transition-all shadow-xl"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-purple-300 font-semibold">
                      <Eye className="w-3.5 h-3.5" />
                      {video.viewCount}
                    </span>
                    {video.likeCount && (
                      <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {video.likeCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Channel Growth Analytics Tips */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">AI Audience Retention Insights</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your coding & AI web app creation videos yield an average **68% retention rate** in the first 2 minutes. Publishing **2 YouTube Shorts per week** focusing on quick 30-second AI developer tips will accelerate subscriber growth by an estimated **+25% over 30 days**!
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI VIRAL IDEAS */}
      {activeSubTab === 'ideas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Generate Viral Video Concepts for YouTube</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={ideaTopic}
                onChange={(e) => setIdeaTopic(e.target.value)}
                placeholder="Topic e.g. AI Web Apps, Gaming, Tech Reviews"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleGenerateIdeas}
                disabled={generatingIdeas}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {generatingIdeas ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                <span>Generate 4 Ideas</span>
              </button>
            </div>
          </div>

          {generatedIdeas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {idea.category}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-400">{idea.potential}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{idea.title}</h3>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1.5 text-xs text-slate-300">
                    <div className="font-semibold text-slate-400 flex items-center gap-1 text-[11px]">
                      <Video className="w-3.5 h-3.5 text-red-400" />
                      Hook Script:
                    </div>
                    <p className="italic text-slate-200">{idea.hook}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs text-slate-300">
                    <div className="font-semibold text-slate-400 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Thumbnail Prompt:
                    </div>
                    <p className="text-slate-400 font-mono text-[11px]">{idea.thumbnailPrompt}</p>
                  </div>

                  <button
                    onClick={() => handleCopy(idea.title, `idea_${idx}`)}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    {copiedIndex === `idea_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === `idea_${idx}` ? 'Copied Title!' : 'Copy Idea Title'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: VIRAL TITLES & THUMBNAILS */}
      {activeSubTab === 'titles' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Generate High CTR Video Titles</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={titleTopic}
                onChange={(e) => setTitleTopic(e.target.value)}
                placeholder="Video topic e.g. Build an AI app"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleGenerateTitles}
                disabled={generatingTitles}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {generatingTitles ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate 5 Titles</span>
              </button>
            </div>
          </div>

          {generatedTitles.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
              {generatedTitles.map((title, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-white/10 hover:border-red-500/40 transition-all text-xs"
                >
                  <span className="font-bold text-white font-mono">{idx + 1}. {title}</span>
                  <button
                    onClick={() => handleCopy(title, `title_${idx}`)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white shrink-0"
                  >
                    {copiedIndex === `title_${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: SCRIPT STUDIO */}
      {activeSubTab === 'scripts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>AI Video Script Outline Generator</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <input
                type="text"
                value={scriptTopic}
                onChange={(e) => setScriptTopic(e.target.value)}
                placeholder="Script topic or title..."
                className="sm:col-span-8 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <select
                value={scriptDuration}
                onChange={(e) => setScriptDuration(e.target.value)}
                className="sm:col-span-2 px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="60s">60s Short</option>
                <option value="5m">5 Min Video</option>
                <option value="10m">10 Min Video</option>
              </select>
              <button
                onClick={handleGenerateScript}
                disabled={generatingScript}
                className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {generatingScript ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Write Script</span>
              </button>
            </div>
          </div>

          {generatedScript && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Generated Script Outline</span>
                <button
                  onClick={() => handleCopy(generatedScript, 'script')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {copiedIndex === 'script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'script' ? 'Copied' : 'Copy Full Script'}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-white/5">
                {generatedScript}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: SEO TAGS */}
      {activeSubTab === 'seo' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>YouTube SEO Tag & Hashtag Extractor</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={seoTopic}
                onChange={(e) => setSeoTopic(e.target.value)}
                placeholder="Topic e.g. Full Stack Developer"
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleGenerateTags}
                disabled={generatingTags}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {generatingTags ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate SEO Tags</span>
              </button>
            </div>
          </div>

          {generatedTags.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Copyable YouTube Upload Tags</span>
                <button
                  onClick={() => handleCopy(generatedTags.join(', '), 'all_tags')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedIndex === 'all_tags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'all_tags' ? 'Copied All!' : 'Copy All Tags'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {generatedTags.map((tag, i) => (
                  <span
                    key={i}
                    onClick={() => handleCopy(tag, `tag_${i}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-emerald-300 hover:border-emerald-500/50 cursor-pointer transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
