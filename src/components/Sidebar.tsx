import React from 'react';
import { Mode, AppProject, GeneratedImage, GeneratedTrack, UserAccount } from '../types';
import { STARTER_APPS } from '../data/presets';
import {
  MessageSquare,
  Code2,
  Image as ImageIcon,
  Video,
  Music,
  ChevronLeft,
  Bot,
  Sparkles,
  Zap,
  CheckCircle2,
  Settings,
  LogIn,
  Key,
  Youtube,
  Rocket,
  Calculator,
  Calendar,
  Lightbulb,
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
  Scan,
  Mic,
  CalendarCheck,
  PhoneCall,
  Gamepad2,
  Headphones,
  Smile,
} from 'lucide-react';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
  savedApps: AppProject[];
  onSelectApp: (app: AppProject) => void;
  generatedImages: GeneratedImage[];
  generatedTracks: GeneratedTrack[];
  user: UserAccount | null;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAccountManager?: () => void;
  onOpenSecretsModal?: () => void;
  onOpenDiscordModal?: () => void;
  onOpenHelpModal?: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
  onOpenToolsModal?: (tab?: 'calculator' | 'calendar' | 'ideas') => void;
  onOpenFootballModal?: () => void;
  onOpenSerModal?: () => void;
  onOpenHistoryModal?: () => void;
  onOpenApkModal?: () => void;
  sessionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  savedApps,
  onSelectApp,
  generatedImages,
  generatedTracks,
  user,
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenSecretsModal,
  onOpenDiscordModal,
  onOpenHelpModal,
  onOpenToolsModal,
  onOpenFootballModal,
  onOpenSerModal,
  onOpenHistoryModal,
  onOpenApkModal,
  sessionCount = 0,
}) => {
  if (!isOpen) return null;

  const modes: { id: Mode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'mido-shortcuts', label: 'Mido Shortcuts ⚡', icon: <Zap className="w-4 h-4 text-amber-400" />, desc: 'Instant 1-Click Access to 9 Advanced AI Engines' },
    { id: 'organisation', label: 'Organisation & Life Planner 📅', icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />, desc: 'Calendar, custom named days, birthdays, weekly spendings & budget' },
    { id: 'hello-mido-calls', label: 'Hello Mido Calls 📞', icon: <PhoneCall className="w-4 h-4 text-green-400" />, desc: 'Real phone sign-in, real saved contacts, direct messaging, HD video & voice calls' },
    { id: 'voice-responding', label: 'Voice Responding 🎙️', icon: <Mic className="w-4 h-4 text-cyan-400" />, desc: 'Real-time 2-way AI voice conversation & spoken answers' },
    { id: 'chat', label: 'AI Chat & Reasoning', icon: <MessageSquare className="w-4 h-4 text-blue-400" />, desc: 'GPT-style conversational AI' },
    { id: 'humoris', label: 'Humoris (Real Human Friend) 🎭', icon: <Smile className="w-4 h-4 text-amber-400" />, desc: 'Real human friend, initiates talks & sends spontaneous texts' },
    { id: 'face-detect', label: 'Face Detect (OSINT) 🔍', icon: <Scan className="w-4 h-4 text-cyan-400" />, desc: 'Local facial geometry, multi-face crop & free reverse image search' },
    { id: 'editor-studio', label: 'Mido Cut Editor 🎬', icon: <Scissors className="w-4 h-4 text-pink-400" />, desc: 'CapCut-style video & photo editor with filters, trimming & 4K export' },
    { id: 'mido-guide', label: 'Mido Guide Hub 📖', icon: <BookOpen className="w-4 h-4 text-rose-400" />, desc: 'Step-by-step documentation, error reporter & 24/7 AI helper' },
    { id: 'mido-video-ai', label: 'Mido Video AI (Mobile APK) 📱', icon: <Film className="w-4 h-4 text-purple-400" />, desc: 'Mobile-first text-to-video generator & download' },
    { id: 'mido-orb', label: 'Mido Orb 🌐', icon: <Globe className="w-4 h-4 text-rose-500" />, desc: 'Next-Gen Video Sharing Platform & YouTube Studio' },
    { id: 'mido-nemis', label: 'Mido Nemis 🎮', icon: <Gamepad2 className="w-4 h-4 text-purple-400" />, desc: 'Scrollable Games Feed Platform & AI Game Maker' },
    { id: 'mido-ear', label: 'Mido Ear 🎧', icon: <Music className="w-4 h-4 text-emerald-400" />, desc: 'Music Streaming & Suno-Style AI Music Studio' },
    { id: 'champions-studio', label: 'Champions Studio 🏆', icon: <Trophy className="w-4 h-4 text-amber-400" />, desc: 'Tournament creator, leagues & match simulator' },
    { id: 'facebook-studio', label: 'Facebook Page & Bot Maker 📘', icon: <Facebook className="w-4 h-4 text-blue-500" />, desc: 'Real Facebook OAuth / Token login, page management & auto-football bot' },
    { id: 'discord-studio', label: 'Discord Studio & Bots', icon: <Bot className="w-4 h-4 text-[#5865F2]" />, desc: 'Create Discord bots, auto-responders & webhooks' },
    { id: 'youtube-studio', label: 'YouTube Studio Ideas', icon: <Youtube className="w-4 h-4 text-red-500" />, desc: 'Live stats, viral ideas & title studio' },
    { id: 'app-studio', label: 'Mido Builder 🚀', icon: <Code2 className="w-4 h-4 text-purple-400" />, desc: 'AI live website & app studio' },
    { id: 'photo-studio', label: 'Photo Generation & Edit', icon: <ImageIcon className="w-4 h-4 text-pink-400" />, desc: 'Ultra Imagine & AI photo edits' },
    { id: 'video-studio', label: 'Video Studio (Veo)', icon: <Video className="w-4 h-4 text-amber-400" />, desc: 'Text & Photo to High-res Video' },
    { id: 'talking-avatar', label: 'Talking Avatar Studio 🎙️', icon: <Camera className="w-4 h-4 text-purple-400" />, desc: 'Photo upload, script input & 60FPS lip-sync avatar' },
    { id: 'music-studio', label: 'Music Studio (Lyria)', icon: <Music className="w-4 h-4 text-emerald-400" />, desc: 'AI Soundtracks & Synth composition' },
    { id: 'promo-studio', label: 'Viral Promo Studio', icon: <Rocket className="w-4 h-4 text-amber-400" />, desc: 'TikTok, X, Discord & SEO Campaign Suite' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 text-slate-200 flex flex-col shadow-2xl transition-all">
      {/* Top Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black border border-white/20 p-0.5 flex items-center justify-center shadow-lg shadow-red-600/20 overflow-hidden">
            <img src="/icon.svg" alt="MIDO AI" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-sm tracking-wide text-white">MIDO AI WORKSPACE</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Android APK Phone Install Button */}
        {onOpenApkModal && (
          <button
            onClick={onOpenApkModal}
            className="w-full p-3 rounded-2xl bg-gradient-to-r from-red-600/30 via-slate-800 to-black border border-red-500/40 hover:border-red-400 text-left transition-all group shadow-lg shadow-red-600/10 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all">
              <Smartphone className="w-5 h-5 text-red-400 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Install Android APK</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black">FAST</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">1-Tap install with MIDO AI icon</p>
            </div>
          </button>
        )}

        {/* Navigation Modes */}
        <div>
          <div className="px-2 mb-3 text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
            Studio Engines
          </div>
          <div className="space-y-1">
            {modes.map((m) => {
              const isActive = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMode(m.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    {m.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-none mb-1 text-white">
                      {m.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
                  </div>
                </button>
              );
            })}

            {/* Live Football, History & SER Owner Vault */}
            <div className="pt-2 space-y-1">
              <div className="px-2 my-2 text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
                Hubs &amp; Stored Vault
              </div>

              {onOpenHistoryModal && (
                <button
                  onClick={() => {
                    onOpenHistoryModal();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <History className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>📜 History &amp; Media Vault</span>
                      {sessionCount > 0 && (
                        <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.2 rounded font-black">
                          {sessionCount}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-purple-300 truncate">Resume chats, stored videos &amp; photos</div>
                  </div>
                </button>
              )}

              {onOpenFootballModal && (
                <button
                  onClick={() => {
                    onOpenFootballModal();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <Trophy className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">⚽ Football Live Hub</div>
                    <div className="text-[10px] text-slate-400">Match scores, news &amp; photos</div>
                  </div>
                </button>
              )}

              {onOpenSerModal && (
                <button
                  onClick={() => {
                    onOpenSerModal();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">🛡️ SER Owner Vault</div>
                    <div className="text-[10px] text-slate-400">Likes/dislikes &amp; memory bank</div>
                  </div>
                </button>
              )}
            </div>
            {onOpenToolsModal && (
              <div className="pt-2 space-y-1">
                <div className="px-2 my-2 text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
                  Creator Tools &amp; Utilities
                </div>

                <button
                  onClick={() => {
                    onOpenToolsModal('calculator');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-indigo-500/20">
                    <Calculator className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">Math &amp; Revenue ROI Calc</div>
                    <div className="text-[10px] text-slate-400">AdSense &amp; math simulator</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenToolsModal('calendar');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">Content Calendar</div>
                    <div className="text-[10px] text-slate-400">Release dates &amp; events</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenToolsModal('ideas');
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-amber-500/20">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">50+ Project Ideas Matrix</div>
                    <div className="text-[10px] text-slate-400">WebGL games, apps &amp; bots</div>
                  </div>
                </button>
              </div>
            )}

            {/* Discord Server Promotion Item */}
            {onOpenDiscordModal && (
              <button
                onClick={() => {
                  onOpenDiscordModal();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 text-indigo-200 transition-all"
              >
                <div className="p-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30">
                  <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold leading-none mb-1 text-white flex items-center justify-between">
                    <span>Discord Server Hub</span>
                    <span className="text-[9px] bg-[#5865F2] text-white px-1.5 py-0.2 rounded font-black">14.8K LIVE</span>
                  </div>
                  <div className="text-[10px] text-indigo-300 truncate">Join 42K creators &amp; auto-post webhooks</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Saved Apps / Replit Projects */}
        <div>
          <div className="px-2 mb-2 flex items-center justify-between text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
            <span>Web Apps &amp; Websites</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30 font-bold">
              {savedApps.length}
            </span>
          </div>
          <div className="space-y-1">
            {savedApps.map((app, index) => (
              <button
                key={`${app.id}-${index}`}
                onClick={() => {
                  onSelectApp(app);
                  onSelectMode('app-studio');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs hover:bg-white/5 text-slate-300 transition-colors group"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
                <span className="truncate flex-1">{app.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gallery highlights */}
        {generatedImages.length > 0 && (
          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
              Recent AI Photos
            </div>
            <div className="grid grid-cols-3 gap-1.5 px-1">
              {generatedImages.slice(0, 6).map((img) => (
                <div
                  key={img.id}
                  onClick={() => onSelectMode('photo-studio')}
                  className="aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img src={img.url} alt="Generated" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music highlights */}
        {generatedTracks.length > 0 && (
          <div>
            <div className="px-2 mb-2 text-[10px] font-semibold tracking-[2px] text-slate-400 uppercase">
              Recent Soundtracks
            </div>
            <div className="space-y-1">
              {generatedTracks.slice(0, 3).map((track) => (
                <button
                  key={track.id}
                  onClick={() => onSelectMode('music-studio')}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs hover:bg-white/5 text-slate-300"
                >
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate flex-1">{track.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer User Account & Settings */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl text-xs space-y-3">
        {user?.isLoggedIn ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover border border-purple-500/40"
              />
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">{user.name}</div>
                <div className="text-[10px] text-purple-300 truncate">@{user.nickname}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenSecretsModal && (
                <button
                  onClick={onOpenSecretsModal}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                  title="Manage API Keys & Secrets"
                >
                  <Key className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onOpenSettingsModal}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                title="Open Dashboard Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Google</span>
          </button>
        )}
      </div>
    </aside>
  );
};
