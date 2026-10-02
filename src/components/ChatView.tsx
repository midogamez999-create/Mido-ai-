import React, { useState, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { ChatMessage, AppProject, UserSecrets, Mode, AppSettings, PinnedMessage, FileAttachment, PermanentMemoryItem } from '../types';
import { InlineDiscordBotMaker } from './InlineDiscordBotMaker';
import { ChatMusicPlayer } from './ChatMusicPlayer';
import { ChatIdeasModal } from './ChatIdeasModal';
import { ChatSandboxRunner } from './ChatSandboxRunner';
import { PluginActionCard } from './PluginActionCard';
import { MidoAILoading } from './MidoAILoading';
import { ChatGptSearchResultCard } from './ChatGptSearchResultCard';
import { soundFx } from '../lib/soundFx';
import { speechManager } from '../lib/speechManager';
import {
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Play,
  Copy,
  Check,
  Globe,
  ExternalLink,
  Volume2,
  VolumeX,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  ArrowRight,
  Loader2,
  Download,
  CheckCircle2,
  Film,
  Key,
  Youtube,
  Calculator,
  Calendar,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  ShieldCheck,
  Brain,
  HelpCircle,
  Search,
  Bookmark,
  BookmarkCheck,
  Languages,
  RotateCcw,
  Square,
  ChevronDown,
  Sliders,
  Share2,
  X,
  FileCode,
  FileArchive,
  Scissors,
  BookOpen,
  FileText,
  File,
  Smartphone,
  Zap,
  Flame,
  Cpu,
  Layers,
  Wand2,
  RefreshCw,
  Terminal,
} from 'lucide-react';

const InlineYouTubeKeySetup: React.FC<{
  secrets?: UserSecrets;
  onSaveSecrets?: (secrets: UserSecrets) => void;
  onSendPrompt: (prompt: string) => void;
  onOpenSecretsModal?: () => void;
}> = ({ secrets, onSaveSecrets, onSendPrompt, onOpenSecretsModal }) => {
  const [apiKey, setApiKey] = useState(secrets?.youtubeApiKey || '');
  const [channelId, setChannelId] = useState(secrets?.youtubeChannelId || '@mido3dch1');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAndAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    if (onSaveSecrets) {
      onSaveSecrets({
        ...secrets,
        youtubeApiKey: apiKey.trim(),
        youtubeChannelId: channelId.trim() || '@mido3dch1',
      });
    }

    setIsSaved(true);
    setTimeout(() => {
      onSendPrompt(`Access my YouTube channel ${channelId.trim() || '@mido3dch1'} with my saved API key now`);
    }, 400);
  };

  return (
    <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-red-500/40 shadow-2xl space-y-3">
      <div className="flex items-center gap-2 text-red-400">
        <Youtube className="w-5 h-5 shrink-0" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Connect YouTube Data API Key
        </h4>
      </div>

      <form onSubmit={handleSaveAndAccess} className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            YouTube Data API Key v3
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="e.g. AIzaSy..."
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
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="e.g. @mido3dch1 or UC..."
            className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Key className="w-4 h-4" />}
            <span>{isSaved ? 'Saving Credentials...' : 'Save & Access Channel Now'}</span>
          </button>

          {onOpenSecretsModal && (
            <button
              type="button"
              onClick={onOpenSecretsModal}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
            >
              Vault
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

interface ChatViewProps {
  messages: ChatMessage[];
  onSendPrompt: (prompt: string, mode?: string) => void;
  onOpenInAppStudio: (code: { html: string; css?: string; js?: string; title: string }) => void;
  isLoading: boolean;
  onOpenSecretsModal?: () => void;
  onOpenAuthModal?: () => void;
  secrets?: UserSecrets;
  onSaveSecrets?: (updatedSecrets: UserSecrets) => void;
  onSwitchMode?: (mode: Mode) => void;
  onOpenToolsModal?: (tab?: 'calculator' | 'calendar' | 'ideas') => void;
  onOpenHelpModal?: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
  onOpenFootballModal?: () => void;
  onOpenSerModal?: () => void;
  onOpenSettingsModal?: () => void;
  onFeedback?: (msgId: string, type: 'like' | 'dislike', prompt: string, response: string) => void;
  feedbackMap?: Record<string, 'like' | 'dislike'>;
  appSettings?: AppSettings;
  pinnedMessages?: PinnedMessage[];
  onTogglePinMessage?: (message: ChatMessage) => void;
  memories?: PermanentMemoryItem[];
  onOpenMemoryVault?: () => void;
  onStopGenerating?: () => void;
}

function extractHtmlSnippet(content: string): string | null {
  if (!content) return null;
  const match = content.match(/```(?:html|xml)\s*([\s\S]*?)```/i);
  if (match && (match[1].includes('<html') || match[1].includes('<div') || match[1].includes('<button') || match[1].includes('<canvas') || match[1].includes('<!DOCTYPE') || match[1].includes('<style') || match[1].includes('<script'))) {
    return match[1].trim();
  }
  return null;
}

function formatMarkdownAutoLinks(content: string): string {
  if (!content) return '';
  return content.replace(/(^|[^(\]"])(https?:\/\/[^\s<)]+)/g, '$1[$2]($2)');
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendPrompt,
  onOpenInAppStudio,
  isLoading,
  onStopGenerating,
  onOpenSecretsModal,
  onOpenAuthModal,
  secrets,
  onSaveSecrets,
  onSwitchMode,
  onOpenToolsModal,
  onOpenHelpModal,
  onOpenFootballModal,
  onOpenSerModal,
  onOpenSettingsModal,
  onFeedback,
  feedbackMap = {},
  appSettings = {
    soundEnabled: true,
    soundVolume: 0.7,
    soundTheme: 'cyber',
    autoReadAloud: false,
    speechRate: 1.0,
    speechPitch: 1.0,
    chatFontSize: 'md',
    chatBubbleDensity: 'comfortable',
    showTimestamps: true,
    showAvatars: true,
    chatBackground: 'deep-slate',
    turboMode: true,
    autoWebSearch: true,
    contextMemoryLength: 8,
    aiTone: 'friendly',
    enableMarkdownHighlight: true,
  },
  pinnedMessages = [],
  onTogglePinMessage,
  memories = [],
  onOpenMemoryVault,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>(appSettings.aiTone || 'friendly');
  const [speechSpeedRate, setSpeechSpeedRate] = useState(appSettings.speechRate || 1.0);
  const [activeTranslateMenuMsgId, setActiveTranslateMenuMsgId] = useState<string | null>(null);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!isLoading) {
      setLiveElapsedSeconds(0);
      setLoadingStepIndex(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      setLiveElapsedSeconds((Date.now() - start) / 1000);
    }, 100);
    const stepTimer = setInterval(() => {
      setLoadingStepIndex((prev) => prev + 1);
    }, 700);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [isLoading]);

  const lastUserPrompt = useMemo(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return lastUser?.content || '';
  }, [messages]);

  const chatStyles = [
    { id: 'friendly', label: '💬 Normal Chatting (Casual)', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />, desc: 'Real, normal human chatting with your AI buddy' },
    { id: 'fast', label: '⚡ Ultra Fast Turbo', icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, desc: 'Super fast, high-throughput short answers' },
    { id: 'deep-thinker', label: '🧠 Deep Thinker (CoT)', icon: <Brain className="w-3.5 h-3.5 text-purple-400" />, desc: 'Rigorous chain-of-thought & logic breakdown' },
    { id: 'coder-architect', label: '💻 Code Architect', icon: <Code2 className="w-3.5 h-3.5 text-cyan-400" />, desc: 'Clean, runnable, production code & apps' },
    { id: 'creative-viral', label: '🎨 Creative & Viral', icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />, desc: 'Viral hooks, cinematic storytelling & high CTR' },
    { id: 'football-tactician', label: '⚽ Football Tactician', icon: <Trophy className="w-3.5 h-3.5 text-emerald-400" />, desc: 'Real Madrid, Champions League & 2026 World Cup' },
    { id: 'idea-machine', label: '💡 Idea Machine', icon: <Lightbulb className="w-3.5 h-3.5 text-amber-300" />, desc: 'Disruptive, wild, out-of-the-box brainstorms' },
    { id: 'cyber-osint', label: '🛡️ Cyber & OSINT', icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />, desc: 'Security analysis, threat intelligence & recon' },
    { id: 'concise', label: '🎯 Ultra Concise', icon: <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />, desc: 'Direct, bulleted answers, zero fluff' },
  ];

  const currentStyleObj = chatStyles.find((s) => s.id === selectedStyle) || chatStyles[0];

  useEffect(() => {
    const unsub = speechManager.subscribe((id) => {
      setSpeakingId(id);
    });
    return unsub;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!searchQuery) {
      scrollToBottom();
    }
  }, [messages, isLoading, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    soundFx.playClick();
    if (speakingId === id) {
      speechManager.stop();
      setSpeakingId(null);
    } else {
      speechManager.speak(text, id, {
        rate: speechSpeedRate,
        pitch: appSettings.speechPitch,
        voiceName: appSettings.speechVoice,
        volume: appSettings.soundVolume,
      });
      setSpeakingId(id);
    }
  };

  const handleCycleSpeed = () => {
    soundFx.playClick();
    const speeds = [1.0, 1.25, 1.5, 2.0, 0.8];
    const currentIndex = speeds.indexOf(speechSpeedRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeechSpeedRate(nextSpeed);
  };

  const handleTranslate = (targetLang: string, originalText: string) => {
    soundFx.playClick();
    setActiveTranslateMenuMsgId(null);
    onSendPrompt(`Translate this exact text accurately into ${targetLang}:\n\n"${originalText.slice(0, 500)}"`);
  };

  const handleExplainSimply = (originalText: string) => {
    soundFx.playClick();
    onSendPrompt(`Explain the following response in simple, easy-to-understand terms with clear examples:\n\n"${originalText.slice(0, 400)}"`);
  };

  const handleSummarize = (originalText: string) => {
    soundFx.playClick();
    onSendPrompt(`Summarize this in 3 concise, high-impact bullet points:\n\n"${originalText.slice(0, 500)}"`);
  };

  const handleRegenerate = (originalPrompt?: string) => {
    soundFx.playClick();
    if (originalPrompt) {
      onSendPrompt(originalPrompt);
    } else {
      // Find last user prompt
      const lastUser = [...messages].reverse().find(m => m.role === 'user');
      if (lastUser) {
        onSendPrompt(lastUser.content);
      }
    }
  };

  const handleJumpToMessage = (messageId: string) => {
    soundFx.playClick();
    const el = messageRefs.current[messageId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-400');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-400');
      }, 2000);
    }
  };

  const isMessagePinned = (msgId: string) => {
    return pinnedMessages.some((p) => p.messageId === msgId);
  };

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // Typography & Bubble Sizing
  const fontSizeClass = appSettings.chatFontSize === 'sm' ? 'text-xs' : appSettings.chatFontSize === 'lg' ? 'text-base' : 'text-sm';
  const bubblePaddingClass = appSettings.chatBubbleDensity === 'compact' ? 'p-3' : appSettings.chatBubbleDensity === 'spacious' ? 'p-5' : 'p-4';

  // Custom Chat Text Color
  const textColorClass = {
    'pure-white': 'text-slate-100',
    'cyan-glow': 'text-cyan-200 drop-shadow-[0_0_6px_rgba(6,182,212,0.25)]',
    'emerald-matrix': 'text-emerald-200 drop-shadow-[0_0_6px_rgba(16,185,129,0.25)]',
    'amber-gold': 'text-amber-200 drop-shadow-[0_0_6px_rgba(245,158,11,0.25)]',
    'violet-neon': 'text-purple-200 drop-shadow-[0_0_6px_rgba(168,85,247,0.25)]',
    'rose-sunset': 'text-rose-200 drop-shadow-[0_0_6px_rgba(244,63,94,0.25)]',
    'slate-soft': 'text-slate-300',
  }[appSettings.chatTextColor || 'pure-white'] || 'text-slate-100';

  // Custom Chat Bubble Style
  const bubbleStyleClass = {
    'glass-cyber': 'bg-slate-900/80 backdrop-blur-xl border border-white/15 text-slate-100 shadow-2xl',
    'minimal-solid': 'bg-slate-950 border border-slate-800 text-slate-100 shadow-xl',
    'neon-border': 'bg-slate-900/90 border border-purple-500/50 text-slate-100 shadow-[0_0_18px_rgba(168,85,247,0.15)]',
    'gradient-glow': 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-slate-100 shadow-2xl',
  }[appSettings.chatBubbleStyle || 'glass-cyber'] || 'bg-slate-900/80 backdrop-blur-xl border border-white/15 text-slate-100 shadow-2xl';

  const quickPrompts = [
    {
      title: '🎙️ Live Voice Responding Studio',
      prompt: 'Open the 2-way Voice Responding Studio to speak directly with Mido AI and hear spoken answers.',
      icon: <Volume2 className="w-4 h-4 text-cyan-400" />,
      tag: '2-Way Voice AI',
      action: () => onSwitchMode && onSwitchMode('voice-responding'),
    },
    {
      title: '🚀 Build Full Interactive Web App',
      prompt: 'Build a full interactive modern web app with clean HTML, CSS, JavaScript, and live playable sandbox.',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      tag: 'App Creator Pro',
    },
    {
      title: '🌐 FIFA World Cup 2026 Live Updates',
      prompt: 'Search the live web for the latest 2026 FIFA World Cup news, dates, host cities, and updates.',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      tag: 'Live Web Search',
    },
    {
      title: '📰 Today\'s Breaking News & Tech',
      prompt: 'Search today\'s breaking world news, headlines, and major developments in AI and technology.',
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      tag: 'Live News',
    },
    {
      title: '⚽ Live Football Scores & Real Madrid',
      prompt: 'Search live sports scores, Premier League standings, Champions League, and Real Madrid tactical analysis.',
      icon: <Trophy className="w-4 h-4 text-emerald-400" />,
      tag: 'Live Scores',
    },
    {
      title: '📱 Download Trending Apps & Tools',
      prompt: 'Search for top trending software apps, tools, and direct download links.',
      icon: <Download className="w-4 h-4 text-purple-400" />,
      tag: 'Apps & Links',
    },
    {
      title: '🧠 100% Photographic Brain Vault',
      prompt: 'Recall everything you know about me from your permanent brain vault, or tell me what facts you have locked in memory!',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      tag: 'Permanent Memory',
      action: () => onOpenMemoryVault && onOpenMemoryVault(),
    },
    {
      title: '🛡️ SER Feedback & Memory Vault',
      prompt: 'Open SER feedback log to see message likes, dislikes, and instant AI memory bank.',
      icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
      tag: 'SER Log & Memory',
      action: () => onOpenSerModal && onOpenSerModal(),
    },
    {
      title: '🤖 Create Discord Bot',
      prompt: 'Build a custom Discord bot with slash commands, leveling system, and live chat simulator.',
      icon: <Bot className="w-4 h-4 text-[#5865F2]" />,
      tag: 'Discord Bot Maker',
    },
    {
      title: '🧮 Calculator & Revenue ROI',
      prompt: 'Open Creator Revenue ROI & Scientific Calculator tool.',
      icon: <Calculator className="w-4 h-4 text-indigo-400" />,
      tag: 'Tools & Calc',
      action: () => onOpenToolsModal && onOpenToolsModal('calculator'),
    },
    {
      title: '💡 50+ Project Ideas Matrix',
      prompt: 'Show me viral 3D WebGL game ideas and SaaS app concepts.',
      icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
      tag: 'Ideas Matrix',
      action: () => onOpenToolsModal && onOpenToolsModal('ideas'),
    },
  ];

  return (
    <div id="mido-chat-container" className="flex-1 flex flex-col h-full overflow-hidden max-w-4xl mx-auto w-full relative">
      {/* Top Chat Toolbar (Search, Styles, Pins, Sound & Settings Indicator) */}
      <div className="px-4 py-2.5 border-b border-white/10 bg-slate-950/40 backdrop-blur-md flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* AI Reasoning Style Dropdown */}
          <div className="relative shrink-0">
            <button
              id="btn-chat-style-selector"
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsStyleDropdownOpen(!isStyleDropdownOpen);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Change AI Chat Persona & Style"
            >
              {currentStyleObj.icon}
              <span className="hidden sm:inline">{currentStyleObj.label}</span>
              <span className="sm:hidden">{currentStyleObj.label.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>

            {isStyleDropdownOpen && (
              <div
                className="absolute left-0 top-full mt-1.5 w-64 p-2 bg-slate-900/95 border border-indigo-500/40 rounded-2xl shadow-2xl backdrop-blur-xl z-50 animate-scaleUp space-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                  Select AI Reasoning Mode
                </div>
                {chatStyles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedStyle(style.id);
                      setIsStyleDropdownOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-start gap-2.5 ${
                      selectedStyle === style.id
                        ? 'bg-indigo-600 text-white shadow-md font-bold'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{style.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold line-clamp-1">{style.label}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{style.desc}</div>
                    </div>
                    {selectedStyle === style.id && <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mido Model Active Badge */}
          {onOpenSettingsModal && (
            <button
              id="btn-chat-model-badge"
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenSettingsModal();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
              title="Configure Mido AI Model & Speed in Settings"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {appSettings.midoModelTier === 'mido-3.7-flash'
                  ? 'Mido 3.7 Flash'
                  : appSettings.midoModelTier === 'mido-flash-latest'
                  ? 'Mido Flash'
                  : appSettings.midoModelTier === 'mido-3.5-flash-lite'
                  ? 'Mido 3.5 Lite'
                  : appSettings.midoModelTier === 'mido-3.6-flash'
                  ? 'Mido 3.6 Turbo'
                  : appSettings.midoModelTier === 'mido-3.1-flash-lite'
                  ? 'Mido 3.1 Lite'
                  : appSettings.midoModelTier === 'mido-3.1-pro-preview'
                  ? 'Mido 3.1 Pro'
                  : 'Mido 3.7 Flash'}
              </span>
              <span className="text-[10px] text-emerald-400/70 font-mono">⚡</span>
            </button>
          )}

          {/* Insane Ideas Hub Modal Button */}
          <button
            id="btn-insane-ideas-hub"
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsIdeasModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-indigo-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md transition-all hover:scale-105"
            title="Open Insane Ideas & Creative Spark Deck"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Insane Ideas Deck</span>
            <span className="sm:hidden">Ideas 💡</span>
          </button>

          {/* 2-Way Voice Responding Direct Mode Shortcut */}
          {onSwitchMode && (
            <button
              id="btn-switch-voice-responding"
              type="button"
              onClick={() => {
                soundFx.playClick();
                onSwitchMode('voice-responding');
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md transition-all hover:scale-105"
              title="Launch 2-Way Live Voice Responding Studio"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Voice Responding 🎙️</span>
            </button>
          )}

          {/* Permanent Memory Brain Vault Button */}
          <button
            id="btn-open-memory-vault"
            type="button"
            onClick={() => {
              soundFx.playClick();
              onOpenMemoryVault && onOpenMemoryVault();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-cyan-500/25 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md transition-all hover:scale-105"
            title="Open Permanent AI Brain Memory Vault (100% Photographic Recall)"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Memory ({memories?.length || 0})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </button>

          {/* Search Toggle */}
          <button
            id="btn-toggle-chat-search"
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsSearchOpen(!isSearchOpen);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              isSearchOpen || searchQuery
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
            title="Search conversation"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Pinned Bookmarks Drawer Toggle */}
          {pinnedMessages.length > 0 && (
            <button
              id="btn-pinned-drawer"
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowPinnedDrawer(!showPinnedDrawer);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                showPinnedDrawer
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-white/5 text-amber-400 hover:bg-amber-500/10 border border-white/10'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-400/40" />
              <span>{pinnedMessages.length} Pinned</span>
            </button>
          )}

          {/* Active Speaking Indicator */}
          {speakingId && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs animate-pulse shrink-0">
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-1 h-4 bg-purple-300 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
              <span className="font-bold hidden sm:inline">Speaking AI Voice</span>
              <button
                type="button"
                onClick={() => speechManager.stop()}
                className="hover:text-red-300 transition-colors ml-1"
                title="Stop Audio"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Settings & Sound Status */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-[11px] font-mono font-bold transition-all"
            title="Speech Playback Rate"
          >
            {speechSpeedRate}x Voice
          </button>

          {onOpenSettingsModal && (
            <button
              id="btn-quick-settings"
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenSettingsModal();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
              title="Open Chat & Sound Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="p-3 bg-slate-900/90 border-b border-white/10 backdrop-blur-md flex items-center gap-2 animate-fadeIn z-10">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords in current chat..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
              {filteredMessages.length} matches
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pinned Messages Collapsible Drawer */}
      {showPinnedDrawer && pinnedMessages.length > 0 && (
        <div className="p-3 bg-slate-900/95 border-b border-amber-500/30 backdrop-blur-xl space-y-2 animate-fadeIn z-10 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
              Pinned Bookmarks
            </span>
            <button
              type="button"
              onClick={() => setShowPinnedDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pinnedMessages.map((pin) => (
              <button
                key={pin.id}
                type="button"
                onClick={() => handleJumpToMessage(pin.messageId)}
                className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-amber-500/50 text-left text-xs transition-all flex items-start justify-between gap-2"
              >
                <div className="line-clamp-2 text-slate-300">
                  <strong className="text-amber-300 mr-1">[{pin.role === 'assistant' ? 'mido.ai' : 'You'}]:</strong>
                  {pin.content}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-xl mx-auto my-auto animate-fadeIn">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-2xl">
                <Bot className="w-10 h-10 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>mido.ai Assistant Pro</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wider uppercase shadow-md">
                  V3.5
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Supercharged with ultra-fast AI reasoning, live sound effects, audio voice narration, interactive web apps &amp; real-time search.
              </p>
            </div>

            {/* Quick Prompts Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-2">
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundFx.playClick();
                    if (item.action) {
                      item.action();
                    } else {
                      onSendPrompt(item.prompt);
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 text-left transition-all duration-200 group flex items-start gap-3 shadow-lg"
                >
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                      {item.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMessages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isPinned = isMessagePinned(msg.id);
              const isCurrentlySpeaking = speakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    messageRefs.current[msg.id] = el;
                  }}
                  className={`flex gap-3.5 transition-all duration-300 ${
                    isUser ? 'justify-end' : 'justify-start'
                  } group`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && appSettings.showAvatars && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-indigo-500/20 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-3xl ${bubblePaddingClass} ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/15 rounded-br-md border border-indigo-400/30'
                        : `${bubbleStyleClass} rounded-tl-md`
                    } ${isCurrentlySpeaking ? 'ring-2 ring-purple-400 shadow-purple-500/20' : ''}`}
                  >
                    {/* Role Header & Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10 text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">
                          {isUser ? 'You' : 'mido.ai'}
                        </span>
                        {!isUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                            AI
                          </span>
                        )}
                        {isPinned && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                            <Bookmark className="w-3 h-3 fill-amber-400" /> Pinned
                          </span>
                        )}
                      </div>

                      {appSettings.showTimestamps && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>

                    {/* Multi-Format File Attachments (APK, ZIP, Code, Documents, Binaries) */}
                    {msg.fileAttachments && msg.fileAttachments.length > 0 && (
                      <div className="flex flex-col gap-2 mb-3">
                        {msg.fileAttachments.map((file) => {
                          const isApk = file.category === 'apk';
                          const isZip = file.category === 'zip';
                          const isCode = file.category === 'code';
                          const isDoc = file.category === 'document';
                          const isImg = file.category === 'image';
                          const isVid = file.category === 'video';
                          const isAudio = file.category === 'audio';

                          return (
                            <div
                              key={file.id}
                              className={`p-3 rounded-2xl border transition-all ${
                                isApk
                                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                  : isZip
                                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                                  : isCode
                                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                                  : isDoc
                                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                                  : 'bg-white/5 border-white/15 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0">
                                    {isApk ? (
                                      <Smartphone className="w-5 h-5 text-emerald-400" />
                                    ) : isZip ? (
                                      <FileArchive className="w-5 h-5 text-amber-400" />
                                    ) : isCode ? (
                                      <FileCode className="w-5 h-5 text-cyan-400" />
                                    ) : isDoc ? (
                                      <FileText className="w-5 h-5 text-blue-400" />
                                    ) : (
                                      <File className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                                        {file.name}
                                      </p>
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/10">
                                        {file.extension?.toUpperCase() || file.category}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Attached'}
                                      {isApk && ' • Android App Package'}
                                      {isZip && ' • Compressed Archive'}
                                      {isCode && ' • Source Code'}
                                    </p>
                                  </div>
                                </div>

                                {file.dataUrl && (
                                  <a
                                    href={file.dataUrl}
                                    download={file.name}
                                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Download</span>
                                  </a>
                                )}
                              </div>

                              {file.parsedPreview && (
                                <div className="mt-2.5 pt-2 border-t border-white/10">
                                  <div className="p-2 rounded-xl bg-black/60 font-mono text-[10px] text-slate-300 max-h-28 overflow-y-auto whitespace-pre-wrap">
                                    {file.parsedPreview.slice(0, 500)}
                                    {file.parsedPreview.length > 500 && '...'}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Image Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, attIdx) => (
                          <img
                            key={attIdx}
                            src={att}
                            alt="Attachment"
                            className="w-32 h-32 object-cover rounded-xl border border-white/20 shadow-md"
                          />
                        ))}
                      </div>
                    )}

                    {/* ChatGPT Search Result Card with Favicon and Open Site */}
                    {!isUser && msg.groundingSources && msg.groundingSources.length > 0 && (
                      <ChatGptSearchResultCard sources={msg.groundingSources} />
                    )}

                    {/* Message Text Rendered with Markdown */}
                    <div className={`prose prose-invert max-w-none break-words ${fontSizeClass} ${!isUser ? textColorClass : 'text-white'} leading-relaxed`}>
                      <Markdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => soundFx.playClick()}
                              className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 border-b border-indigo-400/50 hover:border-indigo-300 transition-colors pb-0.5 group not-italic cursor-pointer"
                              title={`Open link: ${href}`}
                            >
                              <span>{children}</span>
                              <ExternalLink className="w-3 h-3 text-indigo-400/70 group-hover:text-indigo-300 inline shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                          ),
                        }}
                      >
                        {formatMarkdownAutoLinks(msg.content)}
                      </Markdown>
                    </div>

                    {/* Play Store Plugin Action Result Widget */}
                    {msg.pluginResult && (
                      <PluginActionCard result={msg.pluginResult} />
                    )}

                    {/* Inline Discord Bot Maker Widget */}
                    {msg.content.includes('bot.js') && msg.content.includes('Discord') && (
                      <div className="mt-4">
                        <InlineDiscordBotMaker
                          secrets={secrets}
                          onSaveSecrets={onSaveSecrets}
                          onSendPrompt={onSendPrompt}
                          onOpenHelpModal={onOpenHelpModal}
                        />
                      </div>
                    )}

                    {/* Inline YouTube Setup Widget */}
                    {msg.actionPrompt?.type === 'youtube_key_input' && (
                      <InlineYouTubeKeySetup
                        secrets={secrets}
                        onSaveSecrets={onSaveSecrets}
                        onSendPrompt={onSendPrompt}
                        onOpenSecretsModal={onOpenSecretsModal}
                      />
                    )}

                    {/* Action Prompt Launcher Card */}
                    {msg.actionPrompt && msg.actionPrompt.type !== 'youtube_key_input' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">
                              {msg.actionPrompt.title}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              {msg.actionPrompt.description}
                            </div>
                          </div>
                        </div>

                        {onSwitchMode && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              if (msg.actionPrompt?.type === 'open_avatar_studio') {
                                onSwitchMode('talking-avatar');
                              } else if (msg.actionPrompt?.type === 'open_video_studio') {
                                onSwitchMode('video-studio');
                              } else if (msg.actionPrompt?.type === 'open_discord_studio') {
                                onSwitchMode('discord-studio');
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shrink-0 shadow-md"
                          >
                            <span>Launch Studio</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Embedded Media Output (Video, Image, Music) */}
                    {msg.mediaOutput && (
                      <div className="mt-3">
                        {msg.mediaOutput.type === 'video' && (
                          <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-950 shadow-2xl">
                            <div className="p-2.5 bg-black/80 backdrop-blur-md flex items-center justify-between border-b border-white/10 text-xs">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-white text-xs">{msg.mediaOutput.title || 'AI Video'}</span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                VIDEO STREAM
                              </span>
                            </div>
                            <div className="relative group bg-black">
                              <video
                                src={msg.mediaOutput.url}
                                controls
                                autoPlay
                                loop
                                muted
                                className="w-full max-h-80 object-contain rounded-b-2xl"
                              />
                            </div>
                          </div>
                        )}

                        {msg.mediaOutput.type === 'image' && (
                          <div className="overflow-hidden rounded-2xl border border-pink-500/30 bg-slate-950 shadow-2xl">
                            <div className="p-2.5 bg-black/80 backdrop-blur-md flex items-center justify-between border-b border-white/10 text-xs">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-pink-400" />
                                <span className="font-bold text-white text-xs">{msg.mediaOutput.title || 'Generated Photo'}</span>
                              </div>
                              <a
                                href={msg.mediaOutput.url}
                                download="mido-ai-photo.png"
                                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-all"
                              >
                                <Download className="w-3.5 h-3.5" /> Download
                              </a>
                            </div>
                            <img
                              src={msg.mediaOutput.url}
                              alt="Generated Photo"
                              className="w-full max-h-80 object-cover rounded-b-2xl"
                            />
                          </div>
                        )}

                        {msg.mediaOutput.type === 'music' && (
                          <ChatMusicPlayer
                            title={msg.mediaOutput.title || 'AI Masterpiece Track'}
                            prompt={msg.mediaOutput.prompt || 'Synthesized polyphonic soundtrack'}
                            audioUrl={msg.mediaOutput.url}
                          />
                        )}
                      </div>
                    )}

                    {/* Generated Web App Interactive Sandbox Runner */}
                    {msg.generatedCode ? (
                      <ChatSandboxRunner
                        html={msg.generatedCode.html}
                        css={msg.generatedCode.css}
                        js={msg.generatedCode.js}
                        title={msg.generatedCode.title || 'Interactive Web App'}
                        onOpenInAppStudio={() => onOpenInAppStudio(msg.generatedCode!)}
                      />
                    ) : (
                      (() => {
                        const inlineHtml = extractHtmlSnippet(msg.content);
                        if (inlineHtml) {
                          return (
                            <ChatSandboxRunner
                              html={inlineHtml}
                              title="Interactive Web App Preview"
                              onOpenInAppStudio={() => {
                                if (onOpenInAppStudio) {
                                  onOpenInAppStudio({
                                    title: 'Live Chat App',
                                    html: inlineHtml,
                                    css: '',
                                    js: '',
                                  });
                                }
                              }}
                            />
                          );
                        }
                        return null;
                      })()
                    )}

                    {/* Quick Smart Follow-up Action Chips (Only for Assistant Messages) */}
                    {!isUser && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                        {/* 1. Speech Read / Stop Button */}
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.content, msg.id)}
                          className={`px-2.5 py-1 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                            isCurrentlySpeaking
                              ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                              : 'bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/30'
                          }`}
                          title="Read message aloud with AI voice"
                        >
                          {isCurrentlySpeaking ? (
                            <>
                              <Square className="w-3 h-3 fill-white" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>

                        {/* 2. Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {/* 3. Pin / Bookmark Button */}
                        {onTogglePinMessage && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playPin();
                              onTogglePinMessage(msg);
                            }}
                            className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                              isPinned
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                            title={isPinned ? 'Unpin message' : 'Pin message'}
                          >
                            <Bookmark className={`w-3 h-3 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                            <span>{isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>
                        )}

                        {/* 4. Explain Simply Chip */}
                        <button
                          type="button"
                          onClick={() => handleExplainSimply(msg.content)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                          title="Explain in simple terms"
                        >
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Explain Simply</span>
                        </button>

                        {/* 5. Summarize Chip */}
                        <button
                          type="button"
                          onClick={() => handleSummarize(msg.content)}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                          title="Summarize in 3 bullet points"
                        >
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span className="hidden sm:inline">Summarize</span>
                        </button>

                        {/* 6. Translate Menu Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setActiveTranslateMenuMsgId(
                                activeTranslateMenuMsgId === msg.id ? null : msg.id
                              );
                            }}
                            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center gap-1.5 transition-all"
                            title="Translate message"
                          >
                            <Languages className="w-3 h-3 text-cyan-400" />
                            <span className="hidden sm:inline">Translate</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {activeTranslateMenuMsgId === msg.id && (
                            <div className="absolute left-0 bottom-full mb-1.5 z-30 w-36 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-1 animate-fadeIn">
                              {[
                                { label: 'Arabic 🇪🇬', code: 'Arabic' },
                                { label: 'Spanish 🇪🇸', code: 'Spanish' },
                                { label: 'French 🇫🇷', code: 'French' },
                                { label: 'German 🇩🇪', code: 'German' },
                                { label: 'Turkish 🇹🇷', code: 'Turkish' },
                                { label: 'Japanese 🇯🇵', code: 'Japanese' },
                                { label: 'English 🇬🇧', code: 'English' },
                              ].map((l) => (
                                <button
                                  key={l.code}
                                  type="button"
                                  onClick={() => handleTranslate(l.code, msg.content)}
                                  className="w-full text-left px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  {l.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 7. SER Like & Dislike Feedback */}
                        {onFeedback && (
                          <div className="flex items-center gap-1 ml-auto border-l border-white/10 pl-2">
                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playLike();
                                const msgIndex = messages.findIndex((m) => m.id === msg.id);
                                const userPrompt = msgIndex > 0 ? messages[msgIndex - 1].content : 'Chat prompt';
                                onFeedback(msg.id, 'like', userPrompt, msg.content);
                              }}
                              className={`p-1 rounded-lg transition-all ${
                                feedbackMap[msg.id] === 'like'
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'text-slate-500 hover:text-emerald-300'
                              }`}
                              title="Like response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                soundFx.playClick();
                                const msgIndex = messages.findIndex((m) => m.id === msg.id);
                                const userPrompt = msgIndex > 0 ? messages[msgIndex - 1].content : 'Chat prompt';
                                onFeedback(msg.id, 'dislike', userPrompt, msg.content);
                              }}
                              className={`p-1 rounded-lg transition-all ${
                                feedbackMap[msg.id] === 'dislike'
                                  ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                  : 'text-slate-500 hover:text-red-300'
                              }`}
                              title="Dislike response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && appSettings.showAvatars && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mido AI Smart Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 my-2 animate-fadeIn">
                {appSettings.showAvatars && (
                  <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-indigo-500/20 ring-1 ring-purple-400/30">
                    <Bot className="w-4 h-4" />
                    <span className="absolute -inset-0.5 rounded-xl bg-purple-400/25 animate-ping opacity-75" />
                  </div>
                )}
                <div className="flex-1 max-w-2xl">
                  <MidoAILoading
                    elapsedSeconds={liveElapsedSeconds}
                    onStopGenerating={onStopGenerating}
                    promptTopic={lastUserPrompt}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Insane Ideas Hub Modal */}
      <ChatIdeasModal
        isOpen={isIdeasModalOpen}
        onClose={() => setIsIdeasModalOpen(false)}
        onSelectPrompt={(prompt, sendImmediately) => {
          if (sendImmediately) {
            onSendPrompt(prompt);
          } else {
            onSendPrompt(prompt);
          }
        }}
        secrets={secrets}
      />
    </div>
  );
};
