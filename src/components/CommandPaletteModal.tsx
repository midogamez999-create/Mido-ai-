import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  PhoneCall,
  Code2,
  Mic,
  Scan,
  Scissors,
  CalendarCheck,
  Zap,
  Settings,
  Key,
  Trophy,
  Moon,
  Sparkles,
  Download,
  PlusCircle,
  FileText,
  Volume2,
  X,
  ArrowRight,
  Command,
  Brain,
  Globe,
  Gamepad2,
  Music,
} from 'lucide-react';
import { Mode } from '../types';
import { soundFx } from '../lib/soundFx';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: Mode) => void;
  onNewSession: () => void;
  onOpenSettingsModal: () => void;
  onOpenSecretsModal: () => void;
  onOpenFootballModal: () => void;
  onOpenToolsModal?: (tab?: 'calculator' | 'calendar' | 'ideas') => void;
  onOpenHelpModal?: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
  onOpenHistoryModal?: () => void;
  onOpenApkModal?: () => void;
  onOpenSerModal?: () => void;
  onLaunchTestPlace?: () => void;
  onLaunchUnderTheSphere?: () => void;
  onToggleScratchpad: () => void;
  onExportChat?: () => void;
  onToggleTurbo?: () => void;
  isTurbo?: boolean;
  onOpenMemoryVault?: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Tools';
  icon: React.ReactNode;
  hint?: string;
  run: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  onNewSession,
  onOpenSettingsModal,
  onOpenSecretsModal,
  onOpenFootballModal,
  onOpenToolsModal,
  onOpenHelpModal,
  onOpenHistoryModal,
  onOpenApkModal,
  onOpenSerModal,
  onLaunchTestPlace,
  onLaunchUnderTheSphere,
  onToggleScratchpad,
  onExportChat,
  onToggleTurbo,
  isTurbo,
  onOpenMemoryVault,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: PaletteAction[] = [
    {
      id: 'mode-chat',
      title: 'Go to AI Chat',
      category: 'Navigation',
      icon: <MessageSquare className="w-4 h-4 text-blue-400" />,
      hint: 'Chat mode',
      run: () => onSelectMode('chat'),
    },
    {
      id: 'mode-calls',
      title: 'Go to Hello Mido Calls',
      category: 'Navigation',
      icon: <PhoneCall className="w-4 h-4 text-green-400" />,
      hint: 'Voice & Video Calls',
      run: () => onSelectMode('hello-mido-calls'),
    },
    {
      id: 'mode-studio',
      title: 'Go to Mido AI Studio (App Creator)',
      category: 'Navigation',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      hint: 'Build web & mobile apps',
      run: () => onSelectMode('app-studio'),
    },
    {
      id: 'mode-voice',
      title: 'Go to Voice Responding',
      category: 'Navigation',
      icon: <Mic className="w-4 h-4 text-cyan-400" />,
      hint: 'Hands-free voice assistant',
      run: () => onSelectMode('voice-responding'),
    },
    {
      id: 'mode-shortcuts',
      title: 'Go to Mido Shortcuts ⚡',
      category: 'Navigation',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      hint: 'Quick prompt launchpad',
      run: () => onSelectMode('mido-shortcuts'),
    },
    {
      id: 'mode-orb',
      title: 'Go to Mido Orb 🌐',
      category: 'Navigation',
      icon: <Globe className="w-4 h-4 text-rose-500" />,
      hint: 'Video sharing platform & studio',
      run: () => onSelectMode('mido-orb'),
    },
    {
      id: 'mode-nemis',
      title: 'Go to Mido Nemis 🎮',
      category: 'Navigation',
      icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
      hint: 'Playable games feed & AI game maker',
      run: () => onSelectMode('mido-nemis'),
    },
    {
      id: 'mode-ear',
      title: 'Go to Mido Ear 🎧',
      category: 'Navigation',
      icon: <Music className="w-4 h-4 text-emerald-400" />,
      hint: 'Music streaming & Suno AI studio',
      run: () => onSelectMode('mido-ear'),
    },
    {
      id: 'mode-face',
      title: 'Go to Face Detect 🔍',
      category: 'Navigation',
      icon: <Scan className="w-4 h-4 text-indigo-400" />,
      hint: 'Facial & emotion analysis',
      run: () => onSelectMode('face-detect'),
    },
    {
      id: 'mode-cut',
      title: 'Go to Mido Cut 🎬',
      category: 'Navigation',
      icon: <Scissors className="w-4 h-4 text-pink-400" />,
      hint: 'Video & media editor studio',
      run: () => onSelectMode('editor-studio'),
    },
    {
      id: 'mode-org',
      title: 'Go to Organisation 📅',
      category: 'Navigation',
      icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
      hint: 'Planner & tasks',
      run: () => onSelectMode('organisation'),
    },
    {
      id: 'action-scratchpad',
      title: 'Toggle Quick Sticky Scratchpad',
      category: 'Tools',
      icon: <FileText className="w-4 h-4 text-amber-400" />,
      hint: 'Floating notes & ideas',
      run: onToggleScratchpad,
    },
    {
      id: 'action-memory-vault',
      title: 'Open Permanent Memory Brain Vault 🧠',
      category: 'Tools',
      icon: <Brain className="w-4 h-4 text-purple-400" />,
      hint: '100% Photographic recall of facts & secrets',
      run: () => {
        if (onOpenMemoryVault) onOpenMemoryVault();
      },
    },
    {
      id: 'action-football',
      title: 'Open Football Hub & Tactical Pitch',
      category: 'Tools',
      icon: <Trophy className="w-4 h-4 text-emerald-400" />,
      hint: 'Live matches & tactical boards',
      run: onOpenFootballModal,
    },
    {
      id: 'action-new-chat',
      title: 'Start New Chat Conversation',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-cyan-400" />,
      hint: 'Clear conversation state',
      run: onNewSession,
    },
    {
      id: 'action-export-chat',
      title: 'Export Chat Conversation as Markdown',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-teal-400" />,
      hint: 'Download transcript file',
      run: () => {
        if (onExportChat) onExportChat();
      },
    },
    {
      id: 'action-toggle-turbo',
      title: isTurbo ? 'Disable Turbo Mode' : 'Enable Hyper-Fast Turbo Mode ⚡',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
      hint: isTurbo ? 'Normal latency' : 'Sub-second speed',
      run: () => {
        if (onToggleTurbo) onToggleTurbo();
      },
    },
    {
      id: 'action-settings',
      title: 'Open Settings & AI Preferences',
      category: 'Actions',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      hint: 'Tones, models, themes',
      run: onOpenSettingsModal,
    },
    {
      id: 'action-secrets',
      title: 'Open API Secrets & Keys Vault',
      category: 'Actions',
      icon: <Key className="w-4 h-4 text-orange-400" />,
      hint: 'Manage custom tokens',
      run: onOpenSecretsModal,
    },
    {
      id: 'action-tools',
      title: 'Open Tools (Calculator, Calendar, Ideas)',
      category: 'Tools',
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      hint: 'Built-in utility suite',
      run: () => {
        if (onOpenToolsModal) onOpenToolsModal();
      },
    },
    {
      id: 'action-history',
      title: 'Open History & Media Vault',
      category: 'Actions',
      icon: <FileText className="w-4 h-4 text-purple-400" />,
      hint: 'Conversations & generated media',
      run: () => {
        if (onOpenHistoryModal) onOpenHistoryModal();
      },
    },
    {
      id: 'action-help',
      title: 'Open Help & Documentation Guide',
      category: 'Actions',
      icon: <ArrowRight className="w-4 h-4 text-blue-400" />,
      hint: 'Discord, YouTube & Gemini tips',
      run: () => {
        if (onOpenHelpModal) onOpenHelpModal();
      },
    },
    {
      id: 'action-ser',
      title: 'Open SER Feedback & Memory Vault',
      category: 'Tools',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      hint: 'Owner feedback & memories',
      run: () => {
        if (onOpenSerModal) onOpenSerModal();
      },
    },
    {
      id: 'action-apk',
      title: 'Download MIDO AI Android APK',
      category: 'Actions',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      hint: 'Install mobile app on phone',
      run: () => {
        if (onOpenApkModal) onOpenApkModal();
      },
    },
  ];

  const filtered = actions.filter((act) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return act.title.toLowerCase().includes(q) || (act.hint && act.hint.toLowerCase().includes(q)) || act.category.toLowerCase().includes(q);
  });

  // Secret Easter Egg Codes (Only visible when user explicitly types the secret code)
  if (query.trim() === '2026' && onLaunchTestPlace) {
    filtered.unshift({
      id: 'secret-test-place',
      title: 'Secret Test Place',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      hint: 'Short answers & lively stickers',
      run: onLaunchTestPlace,
    });
  } else if ((query.trim() === '0008' || query.trim() === '008') && onLaunchUnderTheSphere) {
    filtered.unshift({
      id: 'secret-under-sphere',
      title: 'Launch Under The Sphere',
      category: 'Actions',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      hint: 'Classified protocol game',
      run: onLaunchUnderTheSphere,
    });
  }

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        soundFx.playClick();
        filtered[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/40">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool name, or navigation target..."
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm md:text-base focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Command className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No commands matching "{query}"
            </div>
          ) : (
            filtered.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    soundFx.playClick();
                    action.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{action.title}</div>
                      {action.hint && (
                        <div className="text-[11px] text-slate-400 truncate">{action.hint}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                      {action.category}
                    </span>
                    {isSelected && <ArrowRight className="w-4 h-4 text-blue-400 animate-pulse" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Execute
            </span>
          </div>
          <div className="text-slate-400">Mido AI Universal Palette</div>
        </div>
      </div>
    </div>
  );
};
