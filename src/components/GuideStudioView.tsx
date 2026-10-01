import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle, MessageSquare, Bot, Sparkles, Send, BookOpen, Scissors,
  Globe, Video, Image as ImageIcon, Music, Camera, Settings, Bell,
  ShieldCheck, Smartphone, Check, ChevronRight, Search, Play, ArrowRight,
  Flame, Zap, Volume2, Download, AlertCircle, RefreshCw, Terminal, Layers, Scan
} from 'lucide-react';
import { UserAccount, UserSecrets, Mode } from '../types';
import { soundFx } from '../lib/soundFx';

// Complete categorized documentation of every studio and feature
const GUIDE_SECTIONS = [
  {
    id: 'mido-cut',
    title: 'Mido Cut (CapCut-Style Editor)',
    icon: <Scissors className="w-5 h-5 text-pink-400" />,
    badge: 'Pro Editor',
    color: 'from-pink-600/30 to-rose-600/20',
    borderColor: 'border-pink-500/40',
    summary: 'Full-featured photo & video editor with trimming, 16+ filters, speed ramping, neon text layers, badges, and 4K download.',
    steps: [
      { title: '1. Import or Choose Sample Media', desc: 'Click "Import Media" to upload any MP4, MOV, WebM, JPG, PNG from your device or select from 4K sample presets.' },
      { title: '2. Trim & Set Duration', desc: 'Use the Trim tab to drag Start and End handles, fine-tuning your clip to the exact second.' },
      { title: '3. Speed Ramping (0.25x to 4.0x)', desc: 'Choose 0.25x for cinematic slow motion or 2x/4x for high-speed action hyperlapse.' },
      { title: '4. Apply 16+ Cinematic Filters', desc: 'Transform looks with Cyberpunk Neon, Vintage VHS, Cinema Noir, 80s Synthwave, or Golden Hour.' },
      { title: '5. Add Neon Text & Badges', desc: 'Add glowing titles, customize size, font, background pills, and slap on trending stickers (🔥 Trending, ⚡ VIP).' },
      { title: '6. Export 4K or Publish to Mido Orb', desc: 'Download your high-res media instantly or hit "1-Click Publish to Mido Orb" to share with creators globally.' },
    ],
    shortcutMode: 'editor-studio' as Mode,
  },
  {
    id: 'face-detect',
    title: 'Face Detect & OSINT Reverse Search',
    icon: <Scan className="w-5 h-5 text-cyan-400" />,
    badge: '100% Free & Local',
    color: 'from-cyan-600/30 to-blue-600/20',
    borderColor: 'border-cyan-500/40',
    summary: 'In-browser local face detection, multi-face selector, precision high-res cropping, and free multi-engine reverse image search.',
    steps: [
      { title: '1. Upload Photo or Snap with Camera', desc: 'Import any photo from your device or use the live camera with timer & flip camera toggle.' },
      { title: '2. Local Face Geometry & Bounding Boxes', desc: 'Faces are detected 100% locally in the browser with bounding box coordinates, sharpness, and brightness scores.' },
      { title: '3. Select & Crop Desired Face', desc: 'Tap any detected face box to inspect it. Adjust crop margin (Tight, Standard 1:1, or Portrait).' },
      { title: '4. Multi-Engine Reverse Search', desc: 'Copy or save the cropped face, then launch Google Lens, Yandex Images, Bing Visual Search, or TinEye in 1-click.' },
      { title: '5. Public Web & OSINT Dorks', desc: 'Generate targeted Google, DuckDuckGo, and Bing OSINT search queries for LinkedIn, X/Twitter, and open web directories.' },
    ],
    shortcutMode: 'face-detect' as Mode,
  },
  {
    id: 'mido-orb',
    title: 'Mido Orb & Vertical Shorts',
    icon: <Globe className="w-5 h-5 text-rose-500" />,
    badge: 'Video Sharing',
    color: 'from-rose-600/30 to-amber-600/20',
    borderColor: 'border-rose-500/40',
    summary: 'Next-Gen video sharing platform. Watch 60FPS videos, scroll vertical 9:16 Shorts on phones, subscribe, like, comment, and track Creator Studio analytics.',
    steps: [
      { title: '1. Browsing & Category Filtering', desc: 'Switch between categories (Gaming, AI & Tech, Creative Arts, Film) or search videos by keyword and relevance.' },
      { title: '2. Vertical Shorts on Phones', desc: 'Open the Shorts tab! On touchscreens or mobile phones, swipe up/down or tap arrows to flip smoothly between 9:16 shorts.' },
      { title: '3. Double-Tap Heart Like', desc: 'Double-tap any video or short to trigger an animated glowing heart reaction.' },
      { title: '4. Uploading & Publishing', desc: 'Tap "Upload Video" or the "+" button, enter title, description, category, and paste or select your video URL.' },
      { title: '5. Creator Studio Analytics', desc: 'Check total views, watch time, subscribers, and revenue in the Mido Studio analytics dashboard.' },
    ],
    shortcutMode: 'mido-orb' as Mode,
  },
  {
    id: 'video-ai',
    title: 'Mido Video AI & Veo Studio',
    icon: <Video className="w-5 h-5 text-amber-400" />,
    badge: '60FPS Video',
    color: 'from-amber-600/30 to-orange-600/20',
    borderColor: 'border-amber-500/40',
    summary: 'Generate high-res 60FPS cinematic AI videos from text or photo prompts powered by Google Veo & JSON2Video.',
    steps: [
      { title: '1. Prompting Director Engine', desc: 'Describe the scene, action, subject, lighting, and mood (e.g. "Hypercar speeding through neon Tokyo at night, 8K").' },
      { title: '2. Cinematic Camera Motion', desc: 'Pick camera moves: Cinematic Dolly In, High-Speed Pan, Drone Orbit, Tilt Up, or Dynamic Roll.' },
      { title: '3. Image-to-Video Mode', desc: 'Upload any photo to animate it into a breathing, moving high-frame-rate video clip.' },
      { title: '4. Download & Send to Editor', desc: 'Download your generated video or send it directly to Mido Cut for custom editing.' },
    ],
    shortcutMode: 'mido-video-ai' as Mode,
  },
  {
    id: 'photo-ai',
    title: 'Photo Studio & Ultra Imagine',
    icon: <ImageIcon className="w-5 h-5 text-pink-400" />,
    badge: '8K Photoreal',
    color: 'from-pink-600/30 to-purple-600/20',
    borderColor: 'border-pink-500/40',
    summary: 'Generate 8K photorealistic images, anime art, 3D renders, and cyberpunk visuals with prompt enhancements.',
    steps: [
      { title: '1. Choose Style Preset', desc: 'Select from Photorealistic, Cyberpunk, 3D Render, Anime, Digital Art, or Fantasy Oil Painting.' },
      { title: '2. AI Prompt Enhancer', desc: 'Click "Enhance Prompt" to automatically expand your idea with professional lighting and lens parameters.' },
      { title: '3. Aspect Ratios & Variations', desc: 'Pick 1:1, 16:9, or 9:16 portrait ratios and generate multiple variations.' },
    ],
    shortcutMode: 'photo-studio' as Mode,
  },
  {
    id: 'music-ai',
    title: 'Music Studio & Synthwave Engine',
    icon: <Music className="w-5 h-5 text-emerald-400" />,
    badge: 'AI Soundtracks',
    color: 'from-emerald-600/30 to-teal-600/20',
    borderColor: 'border-emerald-500/40',
    summary: 'Compose royalty-free AI background tracks, cyberpunk trap beats, and ambient meditation soundscapes.',
    steps: [
      { title: '1. Choose Genre & Mood', desc: 'Pick Cyberpunk, Lo-Fi Chill, Cinematic Orchestral, EDM Club, or Synthwave.' },
      { title: '2. Adjust Tempo & Stems', desc: 'Customize BPM, synth lead, bassline, and drum intensity.' },
      { title: '3. Export & Use in Videos', desc: 'Download audio or attach it as soundtrack in Mido Cut Editor.' },
    ],
    shortcutMode: 'music-studio' as Mode,
  },
  {
    id: 'talking-avatar',
    title: 'Talking Avatar Studio',
    icon: <Camera className="w-5 h-5 text-purple-400" />,
    badge: '60FPS Lip-Sync',
    color: 'from-purple-600/30 to-indigo-600/20',
    borderColor: 'border-purple-500/40',
    summary: 'Turn any portrait photo into a talking AI character with realistic lip-syncing, facial motion, and voiceover.',
    steps: [
      { title: '1. Upload Portrait Photo', desc: 'Upload a clear face photo of yourself, an avatar, or an AI character.' },
      { title: '2. Type Script & Voice', desc: 'Type your message and select from natural male, female, or cyber robotic voices.' },
      { title: '3. Render 60FPS Video', desc: 'Generate your talking avatar video ready for TikTok, Shorts, or YouTube.' },
    ],
    shortcutMode: 'talking-avatar' as Mode,
  },
  {
    id: 'notifications-feedback',
    title: 'Notifications & Feedback System',
    icon: <Bell className="w-5 h-5 text-amber-400" />,
    badge: 'Real Alerts',
    color: 'from-amber-600/30 to-rose-600/20',
    borderColor: 'border-amber-500/40',
    summary: 'Real browser push notifications, persistent Device ID, proactive 10-hour problem-solving AI prompts, and error dispatch to Mido.gamez999@gmail.com.',
    steps: [
      { title: '1. Enable Real Notifications', desc: 'Open Settings → App Notifications and grant browser permission to receive live alerts.' },
      { title: '2. Device Notification ID', desc: 'Your unique Device ID (e.g. MIDO-NOTIF-XXXX) is displayed for tracking.' },
      { title: '3. 10-Hour AI Proactive Prompt', desc: 'Every 10 hours, Mido AI automatically sends you a notification: "Wanna talk to AI to solve problems?"' },
      { title: '4. Send Feedback & Bug Reports', desc: 'Report errors in Settings → Feedback. All reports are immediately emailed to Mido.gamez999@gmail.com with diagnostic logs.' },
    ],
    shortcutMode: 'chat' as Mode,
  },
];

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'guide';
  text: string;
  timestamp: string;
  actions?: { label: string; mode: Mode }[];
}

interface GuideStudioViewProps {
  user: UserAccount | null;
  secrets?: UserSecrets;
  onSelectMode: (mode: Mode) => void;
  onOpenSettings: () => void;
}

export const GuideStudioView: React.FC<GuideStudioViewProps> = ({
  user,
  onSelectMode,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('mido-cut');
  
  // Mido Guide Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-welcome',
      sender: 'guide',
      text: `👋 **Hi ${user?.nickname || 'Creator'}! I am Mido Guide**, your 24/7 AI Assistant.\n\nAsk me anything about how to use **Mido Cut (Editor)**, **Mido Orb (Shorts)**, **AI Video Studio**, **Notifications**, or **reporting errors** to Mido.gamez999@gmail.com!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: '🎬 How to use Mido Cut', mode: 'editor-studio' },
        { label: '🌐 How to browse Shorts', mode: 'mido-orb' },
        { label: '🎥 Generate 60FPS Video', mode: 'mido-video-ai' },
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend) return;

    soundFx.playClick();
    const userMsg: ChatMessageItem = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/mido-guide-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();
      const guideText = data.answer || "I'm here to help! What feature would you like to explore?";

      // Determine matching quick actions
      const actions: { label: string; mode: Mode }[] = [];
      const lower = textToSend.toLowerCase();
      if (lower.includes('editor') || lower.includes('capcut') || lower.includes('cut') || lower.includes('trim')) {
        actions.push({ label: 'Open Mido Cut Editor 🎬', mode: 'editor-studio' });
      }
      if (lower.includes('orb') || lower.includes('short') || lower.includes('watch')) {
        actions.push({ label: 'Open Mido Orb 🌐', mode: 'mido-orb' });
      }
      if (lower.includes('video') || lower.includes('veo')) {
        actions.push({ label: 'Open Video AI Studio 🎥', mode: 'mido-video-ai' });
      }

      const guideMsg: ChatMessageItem = {
        id: 'msg_guide_' + Date.now(),
        sender: 'guide',
        text: guideText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: actions.length > 0 ? actions : undefined,
      };

      setChatMessages(prev => [...prev, guideMsg]);
      soundFx.playReceived();
    } catch (e) {
      console.warn("Guide chat error:", e);
      const fallbackMsg: ChatMessageItem = {
        id: 'msg_guide_err_' + Date.now(),
        sender: 'guide',
        text: `Here is a quick overview: You can use **Mido Cut** to edit photos & videos like CapCut, **Mido Orb** to share and watch mobile vertical Shorts, and **Video Studio** to generate 60FPS AI clips.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const filteredSections = GUIDE_SECTIONS.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSectionData = GUIDE_SECTIONS.find(s => s.id === selectedSection) || GUIDE_SECTIONS[0];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* TOP HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wide">MIDO GUIDE PLACE</h1>
              <span className="px-2 py-0.5 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                DOCS & AI HELPER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Everything in Mido AI Studio explained simply & step-by-step</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-48 sm:w-72 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guides (Editor, Shorts, Video)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* TWO-COLUMN LAYOUT: GUIDE TOPICS (LEFT) + MIDO GUIDE CHATBOT (RIGHT) */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT COLUMN: INTERACTIVE GUIDE TOPICS & STEP-BY-STEP DETAILS */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">

          {/* Sub Sidebar: Topic Selector */}
          <div className="w-full md:w-72 bg-slate-950/80 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-2 overflow-y-auto shrink-0 max-h-48 md:max-h-full">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
              Features & Studios
            </div>

            {filteredSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  setSelectedSection(sec.id);
                  soundFx.playClick();
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                  selectedSection === sec.id
                    ? `bg-gradient-to-r ${sec.color} ${sec.borderColor} shadow-lg shadow-rose-600/10`
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                    {sec.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white truncate">{sec.title}</div>
                    <span className="text-[10px] text-slate-400">{sec.badge}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>

          {/* Active Guide Topic Details Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-900/40">
            
            {/* Topic Header Card */}
            <div className={`p-5 rounded-3xl bg-gradient-to-br ${activeSectionData.color} border ${activeSectionData.borderColor} shadow-2xl relative overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-black/50 border border-white/20">
                    {activeSectionData.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{activeSectionData.title}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-black/50 text-[10px] font-bold text-slate-300 border border-white/20">
                      {activeSectionData.badge}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectMode(activeSectionData.shortcutMode)}
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
                {activeSectionData.summary}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>Step-by-Step Easy Guide</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeSectionData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-white/20 transition-all space-y-1.5 shadow-lg"
                  >
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-600/30 text-rose-300 text-[10px] font-black flex items-center justify-center border border-rose-500/40">
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-7">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips & Shortcuts */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
              <div className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Pro Creator Tips</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Double tap any video in Mido Orb to trigger an instant glowing heart like.</li>
                <li>In Mido Cut, you can add multiple neon text layers and stickers simultaneously.</li>
                <li>Browser push notifications trigger every 10 hours asking: <em>"Wanna talk to AI to solve problems?"</em>.</li>
                <li>Found an error? Open Settings → Feedback and it automatically dispatches to <strong>Mido.gamez999@gmail.com</strong>.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* RIGHT COLUMN: "MIDO GUIDE" INTERACTIVE CHATBOT */}
        {/* ---------------------------------------------------- */}
        <aside className="w-full lg:w-96 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0 h-[420px] lg:h-full">
          
          {/* Chatbot Header */}
          <div className="p-4 bg-slate-950/90 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Mido Guide AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[10px] text-slate-400">Ask anything about the app</span>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    id: 'msg-reset',
                    sender: 'guide',
                    text: 'Chat history cleared! What can I explain for you?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  }
                ]);
              }}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              Clear
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40 text-xs">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Optional Action Shortcuts */}
                  {msg.actions && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => onSelectMode(act.mode)}
                          className="px-2.5 py-1 rounded-xl bg-black/60 hover:bg-black text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 text-xs max-w-[70%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>Mido Guide is thinking...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Question Prompts */}
          <div className="px-3 py-2 bg-slate-950/80 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => handleSendMessage('How do I edit video in Mido Cut?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold whitespace-nowrap border border-white/10"
            >
              ✂️ How to edit video
            </button>
            <button
              onClick={() => handleSendMessage('How do Shorts work on phones?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold whitespace-nowrap border border-white/10"
            >
              📱 Shorts on phones
            </button>
            <button
              onClick={() => handleSendMessage('How to report an error?')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold whitespace-nowrap border border-white/10"
            >
              🚨 Report error
            </button>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask Mido Guide a question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isAiThinking}
              className="p-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </aside>

      </div>
    </div>
  );
};
