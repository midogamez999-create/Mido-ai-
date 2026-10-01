import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, ThemeMode, Mode, ChatMessage, AppSettings, PinnedMessage } from '../types';
import {
  X,
  User,
  Edit3,
  Check,
  Sun,
  Moon,
  Zap,
  LogOut,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  FileCode,
  Mic,
  Bookmark,
  Trash2,
  Gauge,
  Type,
  LayoutGrid,
  Radio,
  Music,
  Globe,
  SlidersHorizontal,
  Bot,
  Play,
  Square,
  Video,
  Film,
  Layers,
  Palette,
  Eye,
  FastForward,
  Upload,
  Code,
  Image as ImageIcon,
  RotateCcw,
  Users,
  Bell,
  Send,
  Mail,
  AlertTriangle,
  Copy,
  Brain,
  MessageSquare,
  Flame,
  Trophy,
  Lightbulb,
  CheckCheck,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import { speechManager, SpeechVoiceOption } from '../lib/speechManager';
import { notificationService, AppNotification } from '../lib/notifications';
import { PluginsSettingsTab } from './PluginsSettingsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdateUser: (updated: UserAccount) => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  defaultMode: Mode;
  onSelectDefaultMode: (mode: Mode) => void;
  onResetSession: () => void;
  messages?: ChatMessage[];
  appSettings: AppSettings;
  onUpdateAppSettings: (settings: AppSettings) => void;
  pinnedMessages?: PinnedMessage[];
  onUnpinMessage?: (messageId: string) => void;
  onClearPinnedMessages?: () => void;
  onTestPromptInChat?: (prompt: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSwitchAccount,
  onLogout,
  theme,
  onSelectTheme,
  defaultMode,
  onSelectDefaultMode,
  onResetSession,
  messages = [],
  appSettings,
  onUpdateAppSettings,
  pinnedMessages = [],
  onUnpinMessage,
  onClearPinnedMessages,
  onTestPromptInChat,
}) => {
  const [activeTab, setActiveTab] = useState<'plugins' | 'chatting' | 'sound' | 'video-studio' | 'photo-studio' | 'mido-orb' | 'chat-ui' | 'ai-engine' | 'profile' | 'data-backup' | 'notifications' | 'feedback'>('plugins');
  const [nicknameInput, setNicknameInput] = useState(appSettings.userNickname || user?.nickname || '');
  const [fullNameInput, setFullNameInput] = useState(user?.name || '');
  const [userBioMemoryInput, setUserBioMemoryInput] = useState(appSettings.userBioMemory || '');
  const [isSaved, setIsSaved] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechVoiceOption[]>([]);
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback State (Sends to Mido.gamez999@gmail.com)
  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'video-error' | 'feature' | 'general'>('bug');
  const [feedbackSeverity, setFeedbackSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackUserEmail, setFeedbackUserEmail] = useState(user?.email || '');
  const [feedbackUserName, setFeedbackUserName] = useState(user?.name || user?.nickname || '');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSuccessTicket, setFeedbackSuccessTicket] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Notification State & 10-Hour Proactive AI
  const [deviceId, setDeviceId] = useState<string>('');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [proactiveCountdown, setProactiveCountdown] = useState<{ hoursLeft: number; minutesLeft: number }>({ hoursLeft: 10, minutesLeft: 0 });
  const [testNotifMessage, setTestNotifMessage] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAvailableVoices(speechManager.getVoices());
      const unsub = speechManager.subscribe((speakingId) => {
        setIsPlayingTestVoice(Boolean(speakingId));
      });

      // Notification setup
      setDeviceId(notificationService.getDeviceId());
      setNotifPermission(notificationService.getPermission());
      setProactiveCountdown(notificationService.getNextProactivePromptTime());
      setNotificationHistory(notificationService.getHistory());

      const unsubNotif = notificationService.subscribe((list) => {
        setNotificationHistory(list);
      });

      return () => {
        unsub();
        unsubNotif();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<AppSettings>) => {
    const updated = { ...appSettings, ...partial };
    onUpdateAppSettings(updated);
    soundFx.updateConfig(updated.soundEnabled, updated.soundVolume, updated.soundTheme);
  };

  const handleTestSound = () => {
    soundFx.playReceived();
  };

  const handleTestVoice = () => {
    if (isPlayingTestVoice) {
      speechManager.stop();
    } else {
      speechManager.speak(
        "Hello! I am mido ai, your personal AI assistant. All systems are running fast and smooth.",
        "test-voice-id",
        {
          rate: appSettings.speechRate,
          pitch: appSettings.speechPitch,
          voiceName: appSettings.speechVoice,
          volume: appSettings.soundVolume,
        }
      );
    }
  };

  const handleExportJSON = () => {
    soundFx.playClick();
    if (!messages || messages.length === 0) return;
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mido-ai-chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFullBackup = () => {
    soundFx.playClick();
    const fullBackup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      user,
      appSettings,
      messages,
      pinnedMessages,
      theme,
      defaultMode,
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mido-ai-full-workspace-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const backup = JSON.parse(text);
        if (backup.appSettings) {
          onUpdateAppSettings(backup.appSettings);
        }
        if (backup.user && user) {
          onUpdateUser({ ...user, ...backup.user });
        }
        soundFx.playSent();
        setRestoreStatus('Workspace settings & data successfully restored!');
        setTimeout(() => setRestoreStatus(null), 4000);
      } catch (err) {
        setRestoreStatus('Failed to parse backup file. Please ensure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportMarkdown = () => {
    soundFx.playClick();
    if (!messages || messages.length === 0) return;
    let md = `# mido.ai Chat Session Export (${new Date().toLocaleString()})\n\n`;
    messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? (user?.name || 'User') : 'mido.ai';
      md += `### ${roleName} (${msg.timestamp})\n\n${msg.content}\n\n`;
      if (msg.mediaOutput) {
        md += `**[Media Output - ${msg.mediaOutput.type.toUpperCase()}]**: ${msg.mediaOutput.title || 'Media'} (${msg.mediaOutput.url})\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mido-ai-chat-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPlainText = () => {
    soundFx.playClick();
    if (!messages || messages.length === 0) return;
    let text = `=== mido.ai Chat History (${new Date().toLocaleString()}) ===\n\n`;
    messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? (user?.name || 'User') : 'mido.ai';
      text += `[${msg.timestamp}] ${roleName}:\n${msg.content}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mido-ai-chat-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    
    handleUpdate({
      userNickname: nicknameInput.trim() || 'Mido',
      userBioMemory: userBioMemoryInput.trim(),
    });

    if (user) {
      const updatedUser: UserAccount = {
        ...user,
        name: fullNameInput || user.name,
        nickname: nicknameInput || user.nickname,
      };
      onUpdateUser(updatedUser);
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      setFeedbackError('Please enter both a title and description.');
      return;
    }

    setIsSendingFeedback(true);
    setFeedbackError(null);
    soundFx.playSent();

    try {
      const res = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: feedbackCategory,
          severity: feedbackSeverity,
          title: feedbackTitle,
          description: feedbackDescription,
          userEmail: feedbackUserEmail || user?.email || 'Mido.gamez999@gmail.com',
          userName: feedbackUserName || user?.name || user?.nickname || 'Mido Studio Creator',
          clientInfo: {
            notificationId: deviceId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
            screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackSuccessTicket(data.ticketId);
        soundFx.playCelebration();
        notificationService.sendRealNotification(
          "Feedback Dispatched! 📩",
          `Ticket ID: ${data.ticketId} — Sent directly to Mido.gamez999@gmail.com. Thank you!`,
          'feedback'
        );
      } else {
        setFeedbackError(data.error || 'Failed to submit feedback.');
      }
    } catch (err: any) {
      setFeedbackError('Network error while dispatching report: ' + err.message);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleRequestPushPermission = async () => {
    soundFx.playClick();
    const perm = await notificationService.requestPermission();
    setNotifPermission(perm);
  };

  const handleSendTestRealNotif = () => {
    soundFx.playPop();
    const ok = notificationService.sendRealNotification(
      "Real Notification Active! 🚀",
      `Device ID: ${deviceId} — All systems operational. 10-hour problem-solving reminder scheduled.`,
      'system'
    );
    if (ok) {
      setTestNotifMessage("Real browser notification triggered successfully!");
    } else {
      setTestNotifMessage("Stored in-app notification (Grant browser push permission above for native desktop/mobile alerts).");
    }
    setTimeout(() => setTestNotifMessage(null), 4000);
  };

  const handleTest10HourPrompt = () => {
    soundFx.playPop();
    notificationService.triggerTest10HourPrompt();
    setTestNotifMessage("Triggered: 'Wanna talk to AI to solve problems?' 🤖");
    setTimeout(() => setTestNotifMessage(null), 4000);
  };

  return (
    <div id="settings-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>mido.ai Settings &amp; Preferences</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                  Pro
                </span>
              </h2>
              <p className="text-xs text-slate-400">Audio feedback, voice narration, AI speed, themes &amp; chat layout</p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-white/10 px-3 sm:px-5 bg-black/30 gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-plugins"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('plugins');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'plugins'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>🔌 Play Store Plugins</span>
          </button>

          <button
            id="tab-chatting"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('chatting');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'chatting'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Chatting &amp; Mido Models</span>
          </button>

          <button
            id="tab-sound"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('sound');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'sound'
                ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Sound &amp; Voice</span>
          </button>

          <button
            id="tab-video-studio"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('video-studio');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'video-studio'
                ? 'border-pink-400 text-pink-300 bg-pink-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4 text-pink-400" />
            <span>Video Studio AI</span>
          </button>

          <button
            id="tab-photo-studio"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('photo-studio');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'photo-studio'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Photo Studio 8K</span>
          </button>

          <button
            id="tab-mido-orb"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('mido-orb');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'mido-orb'
                ? 'border-violet-400 text-violet-300 bg-violet-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-violet-400 fill-violet-400" />
            <span>Mido Orb Player</span>
          </button>

          <button
            id="tab-chat-ui"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('chat-ui');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'chat-ui'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-purple-400" />
            <span>Theme &amp; Chat UI</span>
          </button>

          <button
            id="tab-ai-engine"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('ai-engine');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'ai-engine'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>AI Speed &amp; Tone</span>
          </button>

          <button
            id="tab-profile"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('profile');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 text-cyan-400" />
            <span>Account</span>
          </button>

          <button
            id="tab-data-backup"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('data-backup');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'data-backup'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export &amp; Backup</span>
          </button>

          <button
            id="tab-notifications"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('notifications');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'notifications'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Notifications &amp; 10h AI</span>
          </button>

          <button
            id="tab-feedback"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('feedback');
            }}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'feedback'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-400" />
            <span>Feedback &amp; Errors</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB: PLAY STORE PLUGINS & APP AUTOMATION */}
          {activeTab === 'plugins' && (
            <PluginsSettingsTab onTestPromptInChat={onTestPromptInChat} />
          )}

          {/* TAB: CHATTING & MIDO MODELS (FEATURED) */}
          {activeTab === 'chatting' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/10">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">Mido AI Intelligence Engine</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Choose your primary Mido AI model and tune response speed for ultra-fast answers
                      </p>
                    </div>
                  </div>

                  {/* Turbo Speed Pill Status */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !appSettings.turboMode;
                      handleUpdate({ turboMode: next });
                      soundFx.playToggle(next);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      appSettings.turboMode
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md font-black'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${appSettings.turboMode ? 'text-black fill-current' : 'text-emerald-400'}`} />
                    <span>{appSettings.turboMode ? '⚡ Turbo Speed ON' : 'Turbo Speed OFF'}</span>
                  </button>
                </div>
              </div>

              {/* 1. Mido Model Tier Chooser */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>Choose Mido Model</span>
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    Selected: {
                      appSettings.midoModelTier === 'mido-3.8-flash' ? 'Mido 3.8 Flash (Hyper-Fast)' :
                      appSettings.midoModelTier === 'mido-flash-latest' ? 'Mido Flash Hyper-Speed' :
                      appSettings.midoModelTier === 'mido-3.1-flash-lite' ? 'Mido 3.1 Flash Lite' :
                      appSettings.midoModelTier === 'mido-3.7-flash' ? 'Mido 3.7 Flash' :
                      appSettings.midoModelTier === 'mido-3.1-pro-preview' ? 'Mido 3.1 Pro Master' : 'Mido 3.8 Flash (Hyper-Fast)'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'mido-3.8-flash',
                      name: 'Mido 3.8 Flash',
                      badge: 'HYPER-FAST ⚡',
                      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                      desc: 'Next-gen hyper-fast flagship engine optimized for instant sub-second answers.',
                      speed: '⚡⚡⚡⚡⚡ 1-Sec Speed',
                      tag: 'Best Overall',
                    },
                    {
                      id: 'mido-flash-latest',
                      name: 'Mido Flash Hyper-Speed',
                      badge: 'FASTEST',
                      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      desc: 'Ultra-low latency real-time engine built for instant messaging and chat.',
                      speed: '⚡⚡⚡⚡⚡ Instant',
                      tag: 'Top Latency',
                    },
                    {
                      id: 'mido-3.1-flash-lite',
                      name: 'Mido 3.1 Flash Lite',
                      badge: 'LIGHTWEIGHT',
                      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                      desc: 'Minimal-thinking zero-overhead token processor tuned for code and quick chat.',
                      speed: '⚡⚡⚡⚡⚡ Sub-Second',
                      tag: 'Zero Lag',
                    },
                    {
                      id: 'mido-3.7-flash',
                      name: 'Mido 3.7 Flash',
                      badge: 'HYBRID',
                      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                      desc: 'Hybrid reasoning model with balanced intelligence and smart answers.',
                      speed: '⚡⚡⚡⚡ Ultra Fast',
                      tag: 'Hybrid Logic',
                    },
                    {
                      id: 'mido-3.1-pro-preview',
                      name: 'Mido 3.1 Pro Master',
                      badge: 'DEEP LOGIC',
                      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                      desc: 'Heavy architectural reasoning for complex math, science, and planning.',
                      speed: '⚡⚡⚡ Deep Thinker',
                      tag: 'Deep Thinker',
                    },
                  ].map((m) => {
                    const isSelected = (appSettings.midoModelTier || 'mido-3.8-flash') === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          handleUpdate({ midoModelTier: m.id as any, geminiModelTier: m.id as any });
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-44 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/50'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                              <span>{m.name}</span>
                            </div>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black ${m.badgeColor}`}>
                              {m.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-emerald-400 font-semibold">{m.speed}</span>
                          <span className="px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10 font-medium">
                            {m.tag}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Response Speed & Verbosity Pacing */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FastForward className="w-4 h-4 text-emerald-400" />
                    <span>Response Speed &amp; Output Pacing</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Controls answer density &amp; response speed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'ultra-quick',
                      title: '⚡ Ultra Quick (Fastest)',
                      desc: 'Punchy answers, instant core bullet points, zero fluff.',
                    },
                    {
                      id: 'balanced',
                      title: '⚖️ Balanced Natural',
                      desc: 'Warm, conversational, and comprehensive responses.',
                    },
                    {
                      id: 'deep-dive',
                      title: '📚 Deep Dive Master',
                      desc: 'Thorough explanations, code architecture & rich detail.',
                    },
                  ].map((v) => {
                    const isSelected = (appSettings.responseVerbosity || 'balanced') === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          handleUpdate({ responseVerbosity: v.id as any });
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                            : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{v.title}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{v.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. AI Answering Style & Personality */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>AI Answering Tone &amp; Style</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">How Mido AI talks to you</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { id: 'friendly', name: '⚡ Ultra Fast & Smart', desc: 'Warm, natural conversation & quick helpful answers' },
                    { id: 'coder-architect', name: '💻 Senior Code Architect', desc: 'Full production code, clean scripts & HTML widgets' },
                    { id: 'football-tactician', name: '⚽ Football Tactical Master', desc: 'Real Madrid, Champions League & live stats' },
                    { id: 'idea-machine', name: '💡 Exponential Idea Machine', desc: 'Disruptive concepts & viral startup ideas' },
                    { id: 'creative-viral', name: '🎨 Visionary Creative & Viral', desc: 'Electrifying hooks & dynamic storytelling' },
                    { id: 'deep-thinker', name: '🧠 Deep Thinker & Logic', desc: 'Structured chain-of-thought analysis' },
                    { id: 'cyber-osint', name: '🛡️ Cyber & OSINT Specialist', desc: 'Security, privacy & threat modeling' },
                    { id: 'concise', name: '🎯 Ultra Concise & Speedy', desc: 'Direct answers with clean bullet points' },
                  ].map((p) => {
                    const isSelected = appSettings.aiTone === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          handleUpdate({ aiTone: p.id as any });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{p.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-snug">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Toggles Row: Web Search, Quick Chips, Code Auto-Run */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Live Search */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        Live Web Search
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">2026</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Search live Google data for current scores &amp; facts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !(appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true);
                      handleUpdate({ enableLiveGoogleSearch: next, autoWebSearch: next });
                      soundFx.playToggle(next);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      (appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true)
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    <span>{(appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true) ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                {/* Quick Chips */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        1-Tap Quick Replies
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">Smart</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Shows suggested follow-up chips below responses</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !(appSettings.enableQuickChips ?? true);
                      handleUpdate({ enableQuickChips: next });
                      soundFx.playToggle(next);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      (appSettings.enableQuickChips ?? true)
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    <span>{(appSettings.enableQuickChips ?? true) ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                {/* Auto Sandbox */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5 text-emerald-400" />
                        Code Live Sandbox
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">HTML</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Instantly preview and run generated web widgets</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !(appSettings.autoExecuteCode ?? true);
                      handleUpdate({ autoExecuteCode: next });
                      soundFx.playToggle(next);
                    }}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      (appSettings.autoExecuteCode ?? true)
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    <span>{(appSettings.autoExecuteCode ?? true) ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              {/* 5. Custom Rules & Instructions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Custom System Rules for Mido AI</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Injected into all your chat conversations</span>
                </div>
                <textarea
                  rows={2}
                  value={appSettings.customSystemInstructions || ''}
                  onChange={(e) => handleUpdate({ customSystemInstructions: e.target.value })}
                  placeholder="e.g. Always answer fast and directly, call me Mido, give code examples in modern TypeScript..."
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 resize-none font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB: SOUND & VOICE */}
          {activeTab === 'sound' && (
            <div className="space-y-6">
              {/* Sound Master Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/50 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      {appSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Audio &amp; Sound Feedback</h4>
                      <p className="text-xs text-slate-400">Play responsive sounds when messages send, responses arrive, and buttons click</p>
                    </div>
                  </div>

                  <button
                    id="toggle-sound-master"
                    type="button"
                    onClick={() => {
                      const next = !appSettings.soundEnabled;
                      handleUpdate({ soundEnabled: next });
                      soundFx.playToggle(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {appSettings.soundEnabled && (
                  <div className="space-y-4 pt-3 border-t border-white/10">
                    {/* Volume Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Volume1 className="w-3.5 h-3.5 text-indigo-400" />
                          Master Sound Volume
                        </span>
                        <span className="font-mono text-indigo-300">{Math.round(appSettings.soundVolume * 100)}%</span>
                      </div>
                      <input
                        id="slider-sound-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={appSettings.soundVolume}
                        onChange={(e) => handleUpdate({ soundVolume: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>

                    {/* Sound Theme Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Sound Effects Theme
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            { id: 'cyber', label: 'Futuristic Cyber', icon: '⚡' },
                            { id: 'soft', label: 'Soft & Warm', icon: '🌸' },
                            { id: 'arcade', label: 'Arcade Pop', icon: '🎮' },
                            { id: 'minimal', label: 'Subtle Minimal', icon: '✨' },
                          ] as const
                        ).map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              handleUpdate({ soundTheme: t.id });
                              setTimeout(() => soundFx.playReceived(), 50);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 text-center transition-all ${
                              appSettings.soundTheme === t.id
                                ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-md'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <span className="text-base">{t.icon}</span>
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Sound Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleTestSound}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                        <span>Test Sound Chime</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Narration & TTS Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">AI Voice Speech Narration (TTS)</h4>
                      <p className="text-xs text-slate-400">Read responses aloud using realistic browser speech synthesis</p>
                    </div>
                  </div>

                  <button
                    id="toggle-auto-read"
                    type="button"
                    onClick={() => {
                      const next = !appSettings.autoReadAloud;
                      handleUpdate({ autoReadAloud: next });
                      soundFx.playToggle(next);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appSettings.autoReadAloud ? 'bg-purple-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        appSettings.autoReadAloud ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 flex items-center justify-between">
                  <span>Auto-read new AI responses: <strong>{appSettings.autoReadAloud ? 'Enabled' : 'Disabled'}</strong></span>
                  <span className="text-[11px] text-slate-400">(You can also click 🔊 Read on any message anytime)</span>
                </div>

                {/* Voice Selection & Sliders */}
                <div className="space-y-3.5 pt-1">
                  {availableVoices.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Selected AI Voice Accent
                      </label>
                      <select
                        value={appSettings.speechVoice || ''}
                        onChange={(e) => handleUpdate({ speechVoice: e.target.value })}
                        className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="">Default System Voice</option>
                        {availableVoices.map((v, idx) => (
                          <option key={`${v.voiceURI || v.name}-${v.lang}-${idx}`} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Speech Speed (Rate)</span>
                        <span className="font-mono text-purple-300">{appSettings.speechRate.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.75"
                        max="1.75"
                        step="0.05"
                        value={appSettings.speechRate}
                        onChange={(e) => handleUpdate({ speechRate: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Voice Pitch</span>
                        <span className="font-mono text-purple-300">{appSettings.speechPitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.4"
                        step="0.05"
                        value={appSettings.speechPitch}
                        onChange={(e) => handleUpdate({ speechPitch: parseFloat(e.target.value) })}
                        className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleTestVoice}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isPlayingTestVoice
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                          : 'bg-purple-500/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/30'
                      }`}
                    >
                      {isPlayingTestVoice ? (
                        <>
                          <Square className="w-3 h-3 text-red-400 fill-red-400" />
                          <span>Stop Preview</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
                          <span>Preview AI Voice</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Background Focus Ambiance Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Focus &amp; Ambient Background Loop</h4>
                      <p className="text-xs text-slate-400">Atmospheric procedural soundscapes generated live via Web Audio</p>
                    </div>
                  </div>

                  {appSettings.backgroundAmbiance && appSettings.backgroundAmbiance !== 'off' && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.stopAmbiance();
                        handleUpdate({ backgroundAmbiance: 'off' });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
                    >
                      <VolumeX className="w-3 h-3" /> Stop
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: 'off', label: 'Off', desc: 'Silence', icon: '🔇' },
                    { id: 'cyber-synth', label: 'Cyber Synth', desc: 'Warm dual drone', icon: '🌌' },
                    { id: 'lofi-beats', label: 'Lo-Fi Chill', desc: 'Rhodes chords', icon: '☕' },
                    { id: 'rain-thunder', label: 'Rain & Thunder', desc: 'Pink noise storm', icon: '🌧️' },
                    { id: 'stadium-crowd', label: 'Stadium Arena', desc: 'Football crowd', icon: '🏟️' },
                  ].map((amb) => {
                    const isSelected = (appSettings.backgroundAmbiance || 'off') === amb.id;
                    return (
                      <button
                        key={amb.id}
                        type="button"
                        onClick={() => {
                          const next = amb.id as any;
                          handleUpdate({ backgroundAmbiance: next });
                          soundFx.setAmbiance(next);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1 ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{amb.icon}</span>
                        <div className="text-xs font-bold text-white">{amb.label}</div>
                        <div className="text-[10px] text-slate-400">{amb.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: VIDEO STUDIO AI */}
          {activeTab === 'video-studio' && (
            <div className="space-y-6">
              {/* Resolution & FPS Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/50 via-slate-900 to-purple-950/50 border border-pink-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Default Video Render Quality</h4>
                    <p className="text-xs text-slate-400">Configure default video output resolution, FPS, and motion dynamics</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-pink-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Default Resolution
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['4K UHD', '1080p FHD', '720p HD'].map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            handleUpdate({ defaultVideoResolution: res as any });
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            appSettings.defaultVideoResolution === res
                              ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Frame Rate (FPS)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { fps: 60, label: '60 Ultra' },
                        { fps: 30, label: '30 Standard' },
                        { fps: 24, label: '24 Cinema' },
                      ].map((f) => (
                        <button
                          key={f.fps}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            handleUpdate({ defaultVideoFps: f.fps as any });
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            appSettings.defaultVideoFps === f.fps
                              ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Motion Dynamics Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Default Camera Motion Dynamics
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'Cinematic', label: 'Cinematic Master', desc: 'Smooth pans & anamorphic lens' },
                    { id: 'Anime 3D', label: 'Anime 3D Shonen', desc: 'Dynamic speedlines & zooms' },
                    { id: 'Hyper-Realism', label: 'Hyper-Realism 8K', desc: 'Ultra-crisp lighting & shadows' },
                    { id: 'Cyberpunk Neon', label: 'Cyberpunk Neon', desc: 'Volumetric glow & rain reflections' },
                    { id: 'Nature Doc', label: 'Nature Docu', desc: 'Macro focus & drone flyovers' },
                    { id: 'Sports Hype', label: 'Sports Hype 60FPS', desc: 'High-speed track & impacts' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ defaultMotionStyle: style.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appSettings.defaultMotionStyle === style.id
                          ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{style.label}</span>
                        {appSettings.defaultMotionStyle === style.id && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Studio Feature Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Auto-Enhance Video Prompts (Mido AI Director)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
                        AI
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Expand simple ideas into rich multi-scene cinematic prompts automatically</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.autoEnhanceVideoPrompts}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ autoEnhanceVideoPrompts: e.target.checked });
                    }}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Co-Op AI Video Studio Mode</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Enable multi-scene storyboarding &amp; AI co-directors on every video project</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.coopVideoMode}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ coopVideoMode: e.target.checked });
                    }}
                    className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* AI Avatar & Talking Character Settings */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">AI Talking Avatar &amp; Presenter Style</h4>
                    <p className="text-xs text-slate-400">Used for greeting videos, speech prompts, and interactive avatars</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Avatar Persona Character</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'male', label: 'Male Hero', icon: '👦' },
                        { id: 'female', label: 'Female Host', icon: '👩' },
                        { id: 'robot', label: 'AI Android', icon: '🤖' },
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            handleUpdate({ avatarGender: g.id as any });
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            (appSettings.avatarGender || 'male') === g.id
                              ? 'bg-pink-500/20 border-pink-400 text-white shadow-md'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-base">{g.icon}</div>
                          <div className="text-[11px]">{g.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Presenter Voice Tone</label>
                    <select
                      value={appSettings.avatarVoiceStyle || 'warm-friendly'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ avatarVoiceStyle: e.target.value as any });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-pink-400"
                    >
                      <option value="warm-friendly">Warm &amp; Friendly (Natural)</option>
                      <option value="robot-cyber">Cybernetic Android (Sci-Fi)</option>
                      <option value="deep-epic">Deep Movie Trailer Voice</option>
                      <option value="energetic-anime">Energetic Anime Voice</option>
                      <option value="news-anchor">Professional News Anchor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Director Suite Physics & Lighting */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Director Suite Lighting &amp; Particle Physics</h4>
                    <p className="text-xs text-slate-400">Fine-tune volumetric illumination, kinetic particle dynamics, and rendering acceleration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Volumetric Lighting Rig</label>
                    <select
                      value={appSettings.videoDirectorLighting || 'Volumetric Neon'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ videoDirectorLighting: e.target.value as any });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Volumetric Neon">Volumetric Cyber Neon (Dual Hues)</option>
                      <option value="Studio Softbox">Hollywood Studio Softbox (Ultra-Clean)</option>
                      <option value="Golden Hour">Golden Hour Sunset Radiance</option>
                      <option value="Cyber Horizon">Cyber Horizon &amp; Raytrace Reflections</option>
                      <option value="Noir Dark Cinema">Noir Dark Cinema Dramatic High-Contrast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Particle Physics Density</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'ultra', label: 'Ultra (60 FPS)' },
                        { id: 'high', label: 'High' },
                        { id: 'medium', label: 'Balanced' },
                        { id: 'low', label: 'Lite' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            handleUpdate({ videoParticlePhysics: p.id as any });
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            (appSettings.videoParticlePhysics || 'ultra') === p.id
                              ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between p-2.5 bg-black/20 rounded-xl">
                    <div className="text-xs text-slate-200">
                      <span className="font-bold">Hardware Video Acceleration (WebGL 2.0 / WebCodecs)</span>
                      <p className="text-[10px] text-slate-400">Leverage GPU hardware decoders for lag-free 60 FPS recording</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appSettings.videoHardwareAcceleration ?? true}
                      onChange={(e) => {
                        soundFx.playToggle(e.target.checked);
                        handleUpdate({ videoHardwareAcceleration: e.target.checked });
                      }}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-black/20 rounded-xl">
                    <div className="text-xs text-slate-200">
                      <span className="font-bold">Auto-Download MP4 Video on Render Completion</span>
                      <p className="text-[10px] text-slate-400">Save generated video files directly to your device downloads automatically</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(appSettings.videoAutoDownload)}
                      onChange={(e) => {
                        soundFx.playToggle(e.target.checked);
                        handleUpdate({ videoAutoDownload: e.target.checked });
                      }}
                      className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PHOTO STUDIO 8K */}
          {activeTab === 'photo-studio' && (
            <div className="space-y-6">
              {/* Default Photo Style Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Mido 8K Photo Studio Default Presets</h4>
                    <p className="text-xs text-slate-400">Preset default styles, lighting engines, and camera perspectives for rapid generation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-cyan-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Art Style</label>
                    <select
                      value={appSettings.photoDefaultStyle || 'Photorealistic 8K'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ photoDefaultStyle: e.target.value });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Photorealistic 8K">Photorealistic 8K Masterpiece</option>
                      <option value="Cyberpunk">Cyberpunk Neon Raytracing</option>
                      <option value="Cinematic Movie">Cinematic Anamorphic Film</option>
                      <option value="Anime & Manga">Anime &amp; Manga High Detail</option>
                      <option value="3D Football Stadium">3D Football Stadium Action</option>
                      <option value="Fantasy Concept">Fantasy Concept Digital Painting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Lighting Engine</label>
                    <select
                      value={appSettings.photoDefaultLighting || 'Cinematic Volumetric'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ photoDefaultLighting: e.target.value });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Cinematic Volumetric">Cinematic Volumetric Glow</option>
                      <option value="Studio Softbox">Studio Softbox Clean Light</option>
                      <option value="Golden Hour">Golden Hour Sunburst</option>
                      <option value="Neon Cyberpunk">Neon Cyberpunk Vivid</option>
                      <option value="Moody Dramatic">Moody Dramatic Shadows</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Camera Angle</label>
                    <select
                      value={appSettings.photoDefaultCamera || 'Eye-Level'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ photoDefaultCamera: e.target.value });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Eye-Level">Eye-Level Standard Perspective</option>
                      <option value="Low-Angle Epic">Low-Angle Epic Hero View</option>
                      <option value="Drone Aerial">Drone Aerial Bird's Eye</option>
                      <option value="Close-Up Portrait">Macro Close-Up Portrait</option>
                      <option value="Dutch Angle">Dutch Angle Action Tilt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Photo Generation Safeguards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Anatomy Correction &amp; Negative Filter Shield</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Automatically filter deformed hands, duplicate limbs, and distorted artifacts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.photoNegativeFilter ?? true}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ photoNegativeFilter: e.target.checked });
                    }}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Auto-Save Generated Photos to Gallery</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Persist every generated image in local session history for instant recall</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.photoAutoSave ?? true}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ photoAutoSave: e.target.checked });
                    }}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: MIDO ORB VIDEO PLAYER */}
          {activeTab === 'mido-orb' && (
            <div className="space-y-6">
              {/* Playback Policy Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900 to-purple-950/50 border border-violet-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-md">
                    <Play className="w-5 h-5 fill-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Mido Orb Video Stream &amp; Playback Engine</h4>
                    <p className="text-xs text-slate-400">Zero-lag streaming, hardware video buffer decoders, and playback policies</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-violet-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Autoplay Policy</label>
                    <select
                      value={appSettings.orbAutoplayPolicy || 'autoplay-muted'}
                      onChange={(e) => {
                        soundFx.playClick();
                        handleUpdate({ orbAutoplayPolicy: e.target.value as any });
                      }}
                      className="w-full p-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                    >
                      <option value="autoplay-muted">Autoplay Muted (Fast &amp; Seamless)</option>
                      <option value="autoplay-sound">Autoplay with Audio (Full Immersion)</option>
                      <option value="click-to-play">Click to Play (Manual Start)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Default Stream Quality</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: '4k', label: '4K Ultra' },
                        { id: '1080p', label: '1080p' },
                        { id: '720p', label: '720p' },
                        { id: 'auto', label: 'Auto' },
                      ].map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            handleUpdate({ orbDefaultQuality: q.id as any });
                          }}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                            (appSettings.orbDefaultQuality || '1080p') === q.id
                              ? 'bg-violet-500/20 border-violet-400 text-white shadow-md'
                              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Loop & Decoder Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                      <span>Loop Mode Behavior</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Seamlessly loop video on finish or advance to next queued video</div>
                  </div>
                  <select
                    value={appSettings.orbLoopMode || 'loop'}
                    onChange={(e) => {
                      soundFx.playClick();
                      handleUpdate({ orbLoopMode: e.target.value as any });
                    }}
                    className="p-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="loop">Continuous Loop</option>
                    <option value="play-once">Play Once &amp; Pause</option>
                    <option value="next-video">Auto-Play Next in Feed</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hardware Video Buffer &amp; Fast Seek</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Preload video keyframes into memory cache for zero-lag scrub &amp; playback</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.orbHardwareDecoders ?? true}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ orbHardwareDecoders: e.target.checked });
                    }}
                    className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Data Saver Mode</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Optimize bandwidth consumption on cellular connections</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(appSettings.orbDataSaver)}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ orbDataSaver: e.target.checked });
                    }}
                    className="w-4 h-4 accent-violet-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHAT UI & THEME */}
          {activeTab === 'chat-ui' && (
            <div className="space-y-6">
              {/* Theme Mode */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Interface Visual Theme
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTheme('dark');
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                      theme === 'dark'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="w-5 h-5 text-purple-400" />
                      {theme === 'dark' && <Check className="w-4 h-4 text-purple-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Midnight Dark</div>
                      <div className="text-[11px] text-slate-400">Deep slate glass canvas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTheme('light');
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                      theme === 'light'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun className="w-5 h-5 text-amber-400" />
                      {theme === 'light' && <Check className="w-4 h-4 text-purple-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Clean Light</div>
                      <div className="text-[11px] text-slate-400">High contrast daylight</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTheme('cyberpunk');
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all ${
                      theme === 'cyberpunk'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Zap className="w-5 h-5 text-pink-400" />
                      {theme === 'cyberpunk' && <Check className="w-4 h-4 text-purple-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Cyberpunk Synth</div>
                      <div className="text-[11px] text-slate-400">Neon ambient glow</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Chat Bubble Font Size */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Type className="w-4 h-4 text-indigo-400" />
                  <span>Message Text Size</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sm', label: 'Compact (13px)', desc: 'Higher density' },
                    { id: 'md', label: 'Standard (15px)', desc: 'Balanced reading' },
                    { id: 'lg', label: 'Large (17px)', desc: 'Spacious & clear' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ chatFontSize: s.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appSettings.chatFontSize === s.id
                          ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Text Color */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Message Text Color &amp; Glow</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Customizes response font color</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'pure-white', label: 'Pure Crisp White', colorClass: 'text-slate-100 bg-white/10' },
                    { id: 'cyan-glow', label: 'Cyan Cyber Glow', colorClass: 'text-cyan-300 bg-cyan-500/10' },
                    { id: 'emerald-matrix', label: 'Emerald Matrix', colorClass: 'text-emerald-300 bg-emerald-500/10' },
                    { id: 'amber-gold', label: 'Amber Warm Gold', colorClass: 'text-amber-300 bg-amber-500/10' },
                    { id: 'violet-neon', label: 'Violet Neon Pulse', colorClass: 'text-purple-300 bg-purple-500/10' },
                    { id: 'rose-sunset', label: 'Rose Sunset Glow', colorClass: 'text-rose-300 bg-rose-500/10' },
                    { id: 'slate-soft', label: 'Slate Soft Gray', colorClass: 'text-slate-300 bg-slate-500/10' },
                  ].map((tc) => (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ chatTextColor: tc.id as any });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        (appSettings.chatTextColor || 'pure-white') === tc.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`text-xs font-bold ${tc.colorClass.split(' ')[0]} flex items-center justify-between`}>
                        <span>{tc.label}</span>
                        {(appSettings.chatTextColor || 'pure-white') === tc.id && (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Sample Text Aa</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Bubble Style */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Chat Bubble Appearance &amp; Style</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'glass-cyber', label: 'Glass Cyber', desc: 'Translucent blur & edge glow' },
                    { id: 'minimal-solid', label: 'Minimal Solid', desc: 'Deep matte with high contrast' },
                    { id: 'neon-border', label: 'Neon Border', desc: 'Glowing stroke accents' },
                    { id: 'gradient-glow', label: 'Gradient Glow', desc: 'Sleek subtle sheen' },
                  ].map((bs) => (
                    <button
                      key={bs.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ chatBubbleStyle: bs.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        (appSettings.chatBubbleStyle || 'glass-cyber') === bs.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{bs.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{bs.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Bubble Density */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <LayoutGrid className="w-4 h-4 text-purple-400" />
                  <span>Chat Bubble Spacing &amp; Density</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact', desc: 'Tight margins' },
                    { id: 'comfortable', label: 'Comfortable', desc: 'Default layout' },
                    { id: 'spacious', label: 'Spacious', desc: 'Generous padding' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ chatBubbleDensity: d.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appSettings.chatBubbleDensity === d.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{d.label}</div>
                      <div className="text-[10px] text-slate-400">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* UI Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white">Show Message Timestamps</div>
                    <div className="text-[11px] text-slate-400">Display exact time badges below each chat bubble</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.showTimestamps}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ showTimestamps: e.target.checked });
                    }}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white">Show User &amp; AI Avatars</div>
                    <div className="text-[11px] text-slate-400">Display profile icons next to each message</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.showAvatars}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ showAvatars: e.target.checked });
                    }}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Chat Canvas Atmosphere Wallpaper */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Chat Canvas Atmosphere &amp; Background</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'deep-slate', label: 'Deep Slate', desc: 'Neutral modern dark' },
                    { id: 'cyber-glow', label: 'Cyber Glow', desc: 'Violet gradient aura' },
                    { id: 'starfield', label: 'Starfield Space', desc: 'Deep cosmic particles' },
                    { id: 'midnight-blue', label: 'Midnight Blue', desc: 'Sleek sapphire glow' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ chatBackground: bg.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appSettings.chatBackground === bg.id
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{bg.label}</div>
                      <div className="text-[10px] text-slate-400">{bg.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI SPEED & TONE */}
          {activeTab === 'ai-engine' && (
            <div className="space-y-6">
              {/* Turbo Response Mode */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Turbo Fast Response Mode</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black">
                        FAST
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">Prioritize ultra low-latency Flash models for near-instant responses</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !appSettings.turboMode;
                    handleUpdate({ turboMode: next });
                    soundFx.playToggle(next);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.turboMode ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.turboMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Live Google Search Engine Grounding Toggle */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-slate-900 to-cyan-950/50 border border-cyan-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Live Google Search Grounding</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        LIVE 2026
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">Enables real-time web search for fresh {new Date().getFullYear()} news, football scores &amp; download links</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !(appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true);
                    handleUpdate({ enableLiveGoogleSearch: next, autoWebSearch: next });
                    soundFx.playToggle(next);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    (appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true) ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      (appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true) ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* AI Creativity / Temperature Slider */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>AI Model Creativity &amp; Temperature</span>
                  </div>
                  <span className="font-mono text-xs text-emerald-300 font-bold">
                    {(appSettings.creativityTemperature ?? 0.7).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={appSettings.creativityTemperature ?? 0.7}
                  onChange={(e) => handleUpdate({ creativityTemperature: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>0.1 (Precise &amp; Factual)</span>
                  <span>0.7 (Balanced &amp; Smart)</span>
                  <span>1.0 (Wildly Creative)</span>
                </div>
              </div>

              {/* AI Personality & Tone / Answering Style */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    AI Answering Style &amp; Personality
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">Select style Mido AI uses to answer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'friendly', name: '⚡ Ultra Fast & Smart', desc: 'Warm, natural conversation & quick helpful answers (Default)' },
                    { id: 'deep-thinker', name: '🧠 Deep Thinker & Reasoning', desc: 'Structured chain-of-thought analysis & deep logic' },
                    { id: 'coder-architect', name: '💻 Senior Code Architect', desc: 'Full production-ready code, complete scripts & modern HTML/JS' },
                    { id: 'creative-viral', name: '🎨 Visionary Creative & Viral', desc: 'Electrifying hooks, viral script outlines & dynamic storytelling' },
                    { id: 'football-tactician', name: '⚽ Football Tactical Master', desc: 'Passionate about Real Madrid, Champions League & live match dynamics' },
                    { id: 'idea-machine', name: '💡 Exponential Idea Machine', desc: 'Disruptive concepts, innovative solutions & viral product ideas' },
                    { id: 'cyber-osint', name: '🛡️ Cyber & OSINT Specialist', desc: 'Threat modeling, digital footprint insights & security defense' },
                    { id: 'concise', name: '🎯 Ultra Concise & Speedy', desc: 'Direct answers with clean bullet points and zero fluff' },
                    { id: 'professional', name: '👔 Executive Strategic Advisor', desc: 'High-level business, technical & strategic clarity' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ aiTone: p.id as any });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        appSettings.aiTone === p.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{p.name}</span>
                        {appSettings.aiTone === p.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Syntax Highlight Theme */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Code Syntax Theme</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'dracula', label: 'Dracula Dark' },
                    { id: 'monokai', label: 'Monokai Pro' },
                    { id: 'github-dark', label: 'GitHub Dark' },
                    { id: 'synthwave', label: 'Synthwave Neon' },
                    { id: 'solarized', label: 'Solarized Dark' },
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ codeSyntaxTheme: ct.id as any });
                      }}
                      className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                        (appSettings.codeSyntaxTheme || 'dracula') === ct.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context History Memory Length */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white">Conversation Memory Context Depth</div>
                  <span className="font-mono text-xs text-emerald-300 font-bold">{appSettings.contextMemoryLength} messages</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 4, label: 'Fast (4 msgs)', desc: 'Lowest latency' },
                    { val: 8, label: 'Standard (8 msgs)', desc: 'Balanced context' },
                    { val: 16, label: 'Deep (16 msgs)', desc: 'Long memory depth' },
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        handleUpdate({ contextMemoryLength: m.val });
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        appSettings.contextMemoryLength === m.val
                          ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom AI System Persona & Instructions */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Custom AI Persona &amp; System Rules</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Injected into all AI prompts</span>
                </div>
                <textarea
                  rows={3}
                  value={appSettings.customSystemInstructions || ''}
                  onChange={(e) => handleUpdate({ customSystemInstructions: e.target.value })}
                  placeholder="e.g. Always respond like an energetic tech mentor, call me Boss, write clean TypeScript, prioritize concise explanations..."
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 resize-none font-mono"
                />
              </div>

              {/* Additional AI Productivity Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Code className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Auto-Copy Generated Code Snippets</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Instantly copy generated code blocks to clipboard when requested</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(appSettings.autoCopyCode)}
                    onChange={(e) => {
                      soundFx.playToggle(e.target.checked);
                      handleUpdate({ autoCopyCode: e.target.checked });
                    }}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Default Studio Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Default Startup Mode
                </label>
                <select
                  value={defaultMode}
                  onChange={(e) => {
                    soundFx.playClick();
                    onSelectDefaultMode(e.target.value as Mode);
                  }}
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="chat">AI Chat &amp; Reasoning</option>
                  <option value="app-studio">App Creator Studio</option>
                  <option value="photo-studio">Photo Studio (Mido Imagine)</option>
                  <option value="video-studio">Video Studio (Veo 3.1)</option>
                  <option value="music-studio">Music Studio (Lyria Synth)</option>
                  <option value="discord-studio">Discord Bot Studio</option>
                  <option value="champions-studio">Champions Football Studio</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNT & NICKNAME */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {user ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white flex items-center gap-1">
                          <span>{user.name}</span>
                          {user.isVerified && (
                            <span title="Verified Creator"><CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-slate-950 shrink-0" /></span>
                          )}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Connected
                        </span>
                        {user.followersCount !== undefined && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            {user.followersCount.toLocaleString()} Followers
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSwitchAccount();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
                    >
                      Switch Account
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onLogout();
                      }}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4">
                  <div className="text-xs text-purple-200 font-medium">
                    You are currently using guest mode. Sign in with Google to sync your AI Studio creations across devices!
                  </div>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSwitchAccount();
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/30 shrink-0"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Custom Nickname &amp; Display Name
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="E.g., Mido Gamez"
                    className="w-full p-3 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nickname (@Handle / What Mido AI calls you)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      @
                    </span>
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="e.g. Mido, Boss, Alex, Captain..."
                      className="w-full p-3 pl-8 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400 font-semibold"
                    />
                  </div>
                </div>

                {/* AI Permanent Memory & Bio Setting */}
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>AI Memory &amp; Permanent Facts</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      PERMANENT MEMORY
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Mido AI will remember these facts across all chat sessions, apps, voice calls, and coding tasks.
                  </p>
                  <textarea
                    rows={3}
                    value={userBioMemoryInput}
                    onChange={(e) => setUserBioMemoryInput(e.target.value)}
                    placeholder="e.g. I am a frontend developer learning AI, I love Real Madrid and football, prefer TypeScript over Python, speak English & Arabic..."
                    className="w-full p-3 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none font-sans"
                  />
                  {/* Quick Memory Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      '💻 Loves React & TypeScript',
                      '⚽ Real Madrid Supporter',
                      '⚡ Prefer Direct Bullet Points',
                      '🎮 Gamer & Tech Enthusiast',
                      '🚀 Building Startup Apps',
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          const current = userBioMemoryInput.trim();
                          if (!current.includes(chip)) {
                            setUserBioMemoryInput(current ? `${current}, ${chip}` : chip);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/40 text-[10px] text-slate-300 hover:text-purple-200 transition-all"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved Preferences!
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" /> Save Profile &amp; Memory
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Your nickname &amp; memory are stored in your settings.
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* TAB: DATA & BACKUP */}
          {activeTab === 'data-backup' && (
            <div className="space-y-6">
              {/* Full Workspace Backup & Restore */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Full Workspace Backup &amp; Restore</div>
                      <div className="text-[11px] text-slate-400">Export or restore all your settings, themes &amp; chat records</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportFullBackup}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Restore Backup</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportBackupFile}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>

                {restoreStatus && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium">
                    {restoreStatus}
                  </div>
                )}
              </div>

              {/* Export Chat Session Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Download Chat Session ({messages.length} Messages)</div>
                    <div className="text-[11px] text-slate-400">Export your conversation in your preferred format</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    disabled={messages.length === 0}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      messages.length > 0
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 hover:bg-purple-500/30'
                        : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <FileJson className="w-4 h-4" />
                    <span>JSON File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    disabled={messages.length === 0}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      messages.length > 0
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30'
                        : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Markdown</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPlainText}
                    disabled={messages.length === 0}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      messages.length > 0
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30'
                        : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Plain Text</span>
                  </button>
                </div>
              </div>

              {/* Pinned Bookmarks Manager */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Pinned Bookmarks ({pinnedMessages.length})</span>
                  </div>

                  {pinnedMessages.length > 0 && onClearPinnedMessages && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        onClearPinnedMessages();
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-bold"
                    >
                      Clear All Pins
                    </button>
                  )}
                </div>

                {pinnedMessages.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">
                    No messages pinned yet. Click the 📌 Pin button under any message in chat to bookmark it!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pinnedMessages.map((pin) => (
                      <div
                        key={pin.id}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="line-clamp-2 text-slate-300 flex-1">
                          <strong className="text-amber-300 mr-1.5">[{pin.role === 'assistant' ? 'mido.ai' : 'User'}]</strong>
                          {pin.content}
                        </div>
                        {onUnpinMessage && (
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              onUnpinMessage(pin.messageId);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Unpin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset Session */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onResetSession();
                  }}
                  className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Workspace Data &amp; Clear Chat History</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS & 10-HOUR PROACTIVE AI */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Master Push Notification Status Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-black border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <span>Real App Push Notifications</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                          notifPermission === 'granted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : notifPermission === 'denied'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {notifPermission === 'granted' ? 'Active & Granted' : notifPermission === 'denied' ? 'Blocked by Browser' : 'Action Required'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Desktop &amp; Mobile push alerts for AI jobs &amp; proactive reminders</p>
                    </div>
                  </div>
                </div>

                {/* Persistent Device Notification ID */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      Your Persistent Notification ID:
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 select-all">
                      {deviceId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(deviceId);
                      soundFx.playClick();
                      setTestNotifMessage("Notification ID copied to clipboard!");
                      setTimeout(() => setTestNotifMessage(null), 3000);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </button>
                </div>

                {/* Notification Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {notifPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Enable Browser Push Notifications</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSendTestRealNotif}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>Send Test Real Notification</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTest10HourPrompt}
                    className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Test 10h Problem Solver Prompt</span>
                  </button>
                </div>

                {testNotifMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{testNotifMessage}</span>
                  </div>
                )}
              </div>

              {/* 10-Hour Proactive AI Interval Info */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-white">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>10-Hour AI Proactive Assistant Loop</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Next in: {proactiveCountdown.hoursLeft}h {proactiveCountdown.minutesLeft}m
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every 10 hours, Mido AI automatically sends you a proactive notification asking:
                  <strong className="text-amber-300 block mt-1">"Wanna talk to AI to solve problems? 🤖💡"</strong>
                  This keeps your creative workflow moving and helps you tackle coding bugs, video ideas, and design challenges.
                </p>
              </div>

              {/* In-App Notification History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Notification Activity Log ({notificationHistory.length})
                  </span>
                  {notificationHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        notificationService.clearAll();
                        soundFx.playClick();
                      }}
                      className="text-[11px] text-rose-400 hover:underline"
                    >
                      Clear Log
                    </button>
                  )}
                </div>

                {notificationHistory.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-white/5 text-center text-xs text-slate-500">
                    No recent notifications logged.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {notificationHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-start gap-3 text-xs"
                      >
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{item.title}</div>
                          <div className="text-slate-400 text-[11px] leading-relaxed">{item.body}</div>
                          <div className="text-[9px] text-slate-600 mt-1 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: FEEDBACK & ERROR REPORTING (Sends to Mido.gamez999@gmail.com) */}
          {activeTab === 'feedback' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Info */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/50 via-slate-900 to-black border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Report an Error &amp; Send Feedback</h3>
                    <p className="text-xs text-slate-400">
                      Dispatches error logs directly to <strong className="text-rose-300">Mido.gamez999@gmail.com</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Success Ticket Card */}
              {feedbackSuccessTicket ? (
                <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-white">Report Successfully Sent!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Your error report and system diagnostics were sent to <strong>Mido.gamez999@gmail.com</strong>.
                  </p>
                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-emerald-300 font-bold max-w-xs mx-auto">
                    Tracking Ticket: {feedbackSuccessTicket}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackSuccessTicket(null);
                      setFeedbackTitle('');
                      setFeedbackDescription('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs hover:scale-105 transition-all shadow-lg mt-2"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  
                  {/* Category & Severity Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Issue Category</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="bug">🐛 App Bug / Code Error</option>
                        <option value="video-error">🎥 Video Generation / Playback Error</option>
                        <option value="feature">✨ Feature Request &amp; Idea</option>
                        <option value="general">💬 General Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Severity Level</label>
                      <select
                        value={feedbackSeverity}
                        onChange={(e) => setFeedbackSeverity(e.target.value as any)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="low">🟢 Low - Minor cosmetic</option>
                        <option value="medium">🟡 Medium - Annoyance</option>
                        <option value="high">🟠 High - Major feature broken</option>
                        <option value="critical">🔴 Critical - App Blocker</option>
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Error / Feedback Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Mido Orb shorts video did not scroll smoothly on my phone"
                      value={feedbackTitle}
                      onChange={(e) => setFeedbackTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Description / Logs */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Detailed Description &amp; What Happened</label>
                    <textarea
                      rows={4}
                      placeholder="Describe what you were doing, what went wrong, or what feature you'd like improved..."
                      value={feedbackDescription}
                      onChange={(e) => setFeedbackDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* User Contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Creator Name"
                        value={feedbackUserName}
                        onChange={(e) => setFeedbackUserName(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Your Email for Reply (Optional)</label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        value={feedbackUserEmail}
                        onChange={(e) => setFeedbackUserEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {feedbackError && (
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  {/* Submit Button & Direct Mailto fallback */}
                  <div className="space-y-2">
                    <button
                      type="submit"
                      disabled={isSendingFeedback || !feedbackTitle.trim() || !feedbackDescription.trim()}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSendingFeedback ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Error Report to mido.gamez999@gmail.com...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Report to mido.gamez999@gmail.com</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`mailto:mido.gamez999@gmail.com?subject=${encodeURIComponent(`[Mido App Report] ${feedbackTitle || 'Feedback'}`)}&body=${encodeURIComponent(`Category: ${feedbackCategory}\nSeverity: ${feedbackSeverity}\nFrom: ${feedbackUserName || user?.name || 'User'}\n\nDetails:\n${feedbackDescription || 'N/A'}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>Open in Gmail / Email</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const text = `[Mido App Report]\nTitle: ${feedbackTitle}\nCategory: ${feedbackCategory}\nSeverity: ${feedbackSeverity}\nDescription: ${feedbackDescription}\nDevice ID: ${deviceId}`;
                          navigator.clipboard.writeText(text);
                          soundFx.playClick();
                          alert('Report copied to clipboard! You can paste it into any email.');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Copy Report Text</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 text-center">
                    All reports include diagnostic client metadata and persistent Notification ID: <code className="text-slate-400">{deviceId}</code>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
