import React, { useState, useMemo } from 'react';
import {
  X,
  Brain,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  BookmarkCheck,
  RefreshCw,
  Sliders,
  Download,
  Upload,
  User,
  Heart,
  Code2,
  Lock,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { PermanentMemoryItem } from '../types';
import { soundFx } from '../lib/soundFx';

interface MainMemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: PermanentMemoryItem[];
  onAddMemory: (fact: string, category?: PermanentMemoryItem['category']) => void;
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
  onSendPrompt: (prompt: string) => void;
  userNickname?: string;
}

export const MainMemoryVaultModal: React.FC<MainMemoryVaultModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
  onSendPrompt,
  userNickname = 'Mido',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newFactInput, setNewFactInput] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<PermanentMemoryItem['category']>('facts');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Facts', icon: <Brain className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'identity', label: 'Identity', icon: <User className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'preference', label: 'Preferences', icon: <Heart className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'projects', label: 'Projects & Code', icon: <Code2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'secret', label: 'Secrets & Lore', icon: <Lock className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'custom', label: 'Custom Notes', icon: <FileText className="w-3.5 h-3.5 text-indigo-400" /> },
  ];

  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || m.fact.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [memories, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactInput.trim()) return;
    onAddMemory(newFactInput.trim(), newFactCategory);
    setNewFactInput('');
    soundFx.playSuccess();
    setToastMessage('Fact locked permanently in Mido AI Brain!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyAll = () => {
    const text = memories.map((m, i) => `${i + 1}. [${m.category.toUpperCase()}] ${m.fact}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestRecall = () => {
    onClose();
    soundFx.playSent();
    onSendPrompt(
      "Test your permanent memory: Recall everything you know about me from your Brain Vault in high detail!"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[760px] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-purple-500/40 shadow-2xl shadow-purple-950/60 overflow-hidden">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-purple-500/90 text-white text-xs font-bold shadow-lg shadow-purple-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <BookmarkCheck className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="relative px-5 py-4 bg-slate-900/95 border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Permanent Brain Memory Vault
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-widest">
                  100% Recall
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Photographic, unbreakable memory across all chat sessions & reloads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestRecall}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all hover:scale-105"
              title="Send a prompt to test Mido's recall of all stored facts"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Test Recall</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Memory Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-purple-950/30 border border-purple-500/20">
            <span className="text-lg font-black text-purple-300 leading-tight">{memories.length}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Memories</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
            <span className="text-lg font-black text-emerald-400 leading-tight">100%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Photographic Rate</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
            <span className="text-lg font-black text-cyan-300 leading-tight">Instant</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Auto-Extraction</span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search through memories..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              onClick={handleCopyAll}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700"
              title="Copy All Memories to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Copy All</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all memories? Mido will return to baseline facts.')) {
                  onClearMemories();
                  soundFx.playClick();
                }
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all"
              title="Reset Memory Vault"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  soundFx.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memory Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text">
          {filteredMemories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <Brain className="w-10 h-10 text-purple-500/50" />
              <p className="text-sm font-semibold text-slate-300">No memories match your search</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Teach Mido something new below, or chat naturally in the main chat—Mido automatically extracts your preferences!
              </p>
            </div>
          ) : (
            filteredMemories.map((mem, idx) => (
              <div
                key={mem.id}
                className="group relative flex items-start justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 hover:border-purple-500/40 transition-all shadow-sm"
              >
                <div className="flex items-start gap-3 flex-1 pr-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    {mem.category === 'identity' ? (
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                    ) : mem.category === 'preference' ? (
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                    ) : mem.category === 'projects' ? (
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : mem.category === 'secret' ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Brain className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {mem.timestamp || 'Permanent'}
                      </span>
                      {mem.source === 'auto' && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-500/20">
                          auto-learned
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug">
                      {mem.fact}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mem.fact);
                      soundFx.playClick();
                      setToastMessage('Copied fact to clipboard!');
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy fact"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onDeleteMemory(mem.id);
                      soundFx.playClick();
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Forget this fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Memory Fact Drawer Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-purple-500/20 shrink-0">
          <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-2">
            <select
              value={newFactCategory}
              onChange={(e) => setNewFactCategory(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-purple-300 font-bold focus:outline-none focus:border-purple-400 shrink-0"
            >
              <option value="facts">Fact</option>
              <option value="identity">Identity</option>
              <option value="preference">Preference</option>
              <option value="projects">Project / Code</option>
              <option value="secret">Secret / Code</option>
              <option value="custom">Custom Note</option>
            </select>

            <input
              type="text"
              value={newFactInput}
              onChange={(e) => setNewFactInput(e.target.value)}
              placeholder="Teach Mido AI a permanent fact (e.g. Favorite club is Real Madrid, building AI Studio)..."
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
            />

            <button
              type="submit"
              disabled={!newFactInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Lock Memory</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
