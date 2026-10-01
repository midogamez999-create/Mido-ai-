import React, { useRef } from 'react';
import { Mode, UserAccount } from '../types';
import {
  Sparkles,
  Zap,
  MessageSquare,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  PlusCircle,
  LayoutDashboard,
  Settings,
  LogIn,
  Key,
  Youtube,
  Rocket,
  Bot,
  HelpCircle,
  Calculator,
  Trophy,
  ShieldCheck,
  History,
  Facebook,
  Globe,
  Camera,
  Film,
  Smartphone,
  Scissors,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Scan,
  Mic,
  CalendarCheck,
  PhoneCall,
  Search,
  FileText,
  Gamepad2,
  CheckCircle2,
  Smile,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';


interface HeaderProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  onNewSession: () => void;
  onOpenHistoryModal?: () => void;
  onOpenApkModal?: () => void;
  sessionCount?: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  user: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAccountManager?: () => void;
  onOpenSecretsModal: () => void;
  onOpenDiscordModal?: () => void;
  onOpenHelpModal?: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
  onOpenToolsModal?: (tab?: 'calculator' | 'calendar' | 'ideas') => void;
  onOpenFootballModal?: () => void;
  onOpenSerModal?: () => void;
  onOpenCommandPalette?: () => void;
  onToggleScratchpad?: () => void;
  hasSecretsConfigured?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onNewSession,
  onOpenHistoryModal,
  onOpenApkModal,
  sessionCount = 0,
  isSidebarOpen,
  onToggleSidebar,
  user,
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenAccountManager,
  onOpenSecretsModal,
  onOpenDiscordModal,
  onOpenHelpModal,
  onOpenToolsModal,
  onOpenFootballModal,
  onOpenSerModal,
  onOpenCommandPalette,
  onToggleScratchpad,
  hasSecretsConfigured = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollModes = (direction: 'left' | 'right') => {
    soundFx.playClick();
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const modes: { id: Mode; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'mido-shortcuts', label: 'Shortcuts ⚡', icon: <Zap className="w-4 h-4 text-amber-400" />, color: 'from-amber-500 via-pink-600 to-purple-600' },
    { id: 'organisation', label: 'Organisation 📅', icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />, color: 'from-emerald-500 via-teal-600 to-indigo-600' },
    { id: 'hello-mido-calls', label: 'Hello Mido Calls 📞', icon: <PhoneCall className="w-4 h-4 text-green-400" />, color: 'from-green-500 via-emerald-600 to-cyan-600' },
    { id: 'voice-responding', label: 'Voice Responding 🎙️', icon: <Mic className="w-4 h-4 text-cyan-400" />, color: 'from-cyan-500 via-blue-600 to-indigo-600' },
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-4 h-4 text-blue-400" />, color: 'from-blue-500 to-indigo-600' },
    { id: 'humoris', label: 'Humoris 🎭', icon: <Smile className="w-4 h-4 text-amber-400" />, color: 'from-amber-500 via-orange-500 to-yellow-500' },
    { id: 'face-detect', label: 'Face Detect 🔍', icon: <Scan className="w-4 h-4 text-cyan-400" />, color: 'from-cyan-500 via-blue-600 to-indigo-600' },
    { id: 'editor-studio', label: 'Mido Cut 🎬', icon: <Scissors className="w-4 h-4 text-pink-400" />, color: 'from-pink-600 to-rose-600' },
    { id: 'mido-guide', label: 'Mido Guide 📖', icon: <BookOpen className="w-4 h-4 text-rose-400" />, color: 'from-rose-600 to-amber-600' },
    { id: 'mido-orb', label: 'Mido Orb 🌐', icon: <Globe className="w-4 h-4 text-rose-500" />, color: 'from-rose-600 to-red-600' },
    { id: 'mido-nemis', label: 'Mido Nemis 🎮', icon: <Gamepad2 className="w-4 h-4 text-purple-400" />, color: 'from-purple-600 to-pink-600' },
    { id: 'mido-ear', label: 'Mido Ear 🎧', icon: <Music className="w-4 h-4 text-emerald-400" />, color: 'from-emerald-500 to-teal-600' },
    { id: 'mido-video-ai', label: 'Mido Video AI 📱', icon: <Film className="w-4 h-4 text-purple-400" />, color: 'from-purple-600 via-pink-600 to-indigo-600' },
    { id: 'champions-studio', label: 'Champions Studio 🏆', icon: <Trophy className="w-4 h-4 text-amber-400" />, color: 'from-amber-500 to-emerald-600' },
    { id: 'facebook-studio', label: 'Facebook Bot 📘', icon: <Facebook className="w-4 h-4 text-blue-400" />, color: 'from-blue-600 to-indigo-600' },
    { id: 'discord-studio', label: 'Discord Studio', icon: <Bot className="w-4 h-4 text-[#5865F2]" />, color: 'from-[#5865F2] to-indigo-600' },
    { id: 'youtube-studio', label: 'YouTube Studio', icon: <Youtube className="w-4 h-4 text-red-500" />, color: 'from-red-600 to-purple-600' },
    { id: 'app-studio', label: 'Mido Builder 🚀', icon: <Code2 className="w-4 h-4 text-violet-400" />, color: 'from-violet-500 to-purple-600' },
    { id: 'photo-studio', label: 'Photo Studio', icon: <ImageIcon className="w-4 h-4 text-pink-400" />, color: 'from-pink-500 to-rose-600' },
    { id: 'video-studio', label: 'Video Studio', icon: <Video className="w-4 h-4 text-amber-400" />, color: 'from-amber-500 to-orange-600' },
    { id: 'talking-avatar', label: 'Talking Avatar 🎙️', icon: <Camera className="w-4 h-4 text-purple-400" />, color: 'from-purple-600 to-pink-600' },
    { id: 'music-studio', label: 'Music Studio', icon: <Music className="w-4 h-4 text-emerald-400" />, color: 'from-emerald-500 to-teal-600' },
    { id: 'promo-studio', label: 'Viral Promo Studio', icon: <Rocket className="w-4 h-4 text-amber-400" />, color: 'from-amber-500 to-purple-600' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-3 md:px-5 bg-slate-950/90 backdrop-blur-2xl border-b border-white/10 text-slate-100 gap-2 overflow-x-auto select-none">
      {/* Left branding & menu button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          title="Toggle Navigation Drawer"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectMode('chat')}>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-black border border-white/20 p-0.5 flex items-center justify-center shadow-lg shadow-red-600/20 overflow-hidden shrink-0">
            <img src="/icon.svg" alt="MIDO AI" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base md:text-lg tracking-tight text-white flex items-center">
                MIDO<span className="text-red-500 ml-0.5">AI</span>
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider hidden sm:inline">
                PRO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Studio Mode Selector (Horizontally Scrollable on ALL screens) */}
      <div className="flex items-center gap-1 relative min-w-0 max-w-[45vw] sm:max-w-[55vw] md:max-w-[50vw] lg:max-w-2xl xl:max-w-4xl">
        <button
          onClick={() => scrollModes('left')}
          className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 p-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto scroll-smooth no-scrollbar"
        >
          {modes.map((m) => {
            const isActive = currentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectMode(m.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600/80 to-purple-600/80 text-white border border-white/30 shadow-md scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollModes('right')}
          className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right actions: History, New Session, Sign In / Profile, Settings */}
      <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
        {onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 shadow-sm transition-all animate-pulse"
            title="Install APK on your Android Phone"
          >
            <Smartphone className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Install APK</span>
          </button>
        )}

        {onOpenHistoryModal && (
          <button
            onClick={onOpenHistoryModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 shadow-sm transition-all"
            title="Open Chat History & Stored Media Vault"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {sessionCount > 0 && (
              <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded-full font-black">
                {sessionCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-200 text-slate-900 shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Session</span>
        </button>

        {/* User Account / Sign In */}
        {user?.isLoggedIn ? (
          <button
            onClick={onOpenAccountManager || onOpenSettingsModal}
            className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-left group"
            title="Unified Account Management (Mido Orb, Nemis & Ear)"
          >
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-bold text-white leading-tight flex items-center justify-end gap-1">
                <span>{user.name}</span>
                {user.isVerified && (
                  <span title="Verified Creator"><CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-slate-950 shrink-0" /></span>
                )}
              </span>
              <span className="text-[10px] text-purple-300 font-medium">@{user.nickname}</span>
            </div>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-purple-500/40 group-hover:scale-105 transition-all"
            />
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}

        {/* Command Palette Button (Ctrl+K) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 text-xs font-semibold transition-all shadow-sm"
            title="Search commands, tools, and shortcuts (Ctrl+K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Command</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Scratchpad Button */}
        {onToggleScratchpad && (
          <button
            onClick={onToggleScratchpad}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all"
            title="Toggle Quick Sticky Scratchpad (Notes & Code)"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}

        {/* Discord Server & Community Button */}
        {onOpenDiscordModal && (
          <button
            onClick={onOpenDiscordModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-indigo-200 text-xs font-bold transition-all"
            title="Join Discord Server & Webhooks"
          >
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
            <span className="hidden sm:inline">Discord</span>
          </button>
        )}

        {/* Secrets Button */}
        <button
          onClick={onOpenSecretsModal}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            hasSecretsConfigured
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 hover:bg-amber-500/25'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Manage API Keys & Secrets (YouTube API Key, Channel ID, Gemini Key)"
        >
          <Key className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Secrets</span>
          {hasSecretsConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* Live Football Scores Button */}
        {onOpenFootballModal && (
          <button
            onClick={onOpenFootballModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
            title="Live Football Match Scores, Standings & High-Res News Photos"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Football</span>
          </button>
        )}

        {/* SER Feedback & Memory Vault Button */}
        {onOpenSerModal && (
          <button
            onClick={onOpenSerModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
            title="SER Owner Feedback Log (Message Likes, Dislikes & Instant Memory)"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">SER Vault</span>
          </button>
        )}

        {/* Tools (Calculator, Calendar, Ideas) Button */}
        {onOpenToolsModal && (
          <button
            onClick={() => onOpenToolsModal('calculator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all"
            title="Calculator, Creator ROI, Content Calendar & 50+ Project Ideas"
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Tools</span>
          </button>
        )}

        {/* Help & Guides Button */}
        {onOpenHelpModal && (
          <button
            onClick={() => onOpenHelpModal('discord')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
            title="Help: How to get Discord, YouTube, Gemini API Keys & how to use mido AI"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Help</span>
          </button>
        )}

        {/* Top Right Settings Button */}
        <button
          onClick={onOpenSettingsModal}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          title="Top Right Dashboard Settings (Nickname, Dark/Light Mode, Account)"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
