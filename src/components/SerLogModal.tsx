import React, { useState } from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Database,
  Trash2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface SerFeedback {
  id: string;
  messageId: string;
  type: 'like' | 'dislike';
  prompt: string;
  assistantResponse: string;
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  content: string;
  createdAt: string;
}

interface SerLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackList: SerFeedback[];
  onClearFeedback: () => void;
  memories: MemoryEntry[];
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
}

export const SerLogModal: React.FC<SerLogModalProps> = ({
  isOpen,
  onClose,
  feedbackList,
  onClearFeedback,
  memories,
  onDeleteMemory,
  onClearMemories,
}) => {
  const [activeTab, setActiveTab] = useState<'ser' | 'memory'>('ser');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const totalLikes = feedbackList.filter((f) => f.type === 'like').length;
  const totalDislikes = feedbackList.filter((f) => f.type === 'dislike').length;

  const filteredFeedback = feedbackList.filter(
    (f) =>
      f.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.assistantResponse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">SER Feedback Vault &amp; Memory Bank</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Owner Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-300">
                System Evaluation &amp; Response (SER) • All Likes &amp; Dislikes Log • Instant Neural Memory Recall
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ser')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'ser'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
              <span>SER Feedback Logs ({feedbackList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'memory'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Brain className="w-4 h-4 text-amber-400" />
              <span>Instant AI Memory ({memories.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 w-44 sm:w-56"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 text-slate-100">
          {/* TAB 1: SER LOGS */}
          {activeTab === 'ser' && (
            <div className="space-y-4">
              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Messages Evaluated</div>
                  <div className="text-2xl font-black text-white font-mono">{feedbackList.length}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-300 uppercase flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Likes
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{totalLikes}</div>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-red-300 uppercase flex items-center gap-1">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    Dislikes
                  </div>
                  <div className="text-2xl font-black text-red-400 font-mono">{totalDislikes}</div>
                </div>
              </div>

              {/* Feedback Clear Button */}
              {feedbackList.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={onClearFeedback}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All SER Logs</span>
                  </button>
                </div>
              )}

              {/* Feedback Items List */}
              {filteredFeedback.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-xs font-bold">No SER feedback logs found yet.</p>
                  <p className="text-[11px] text-slate-500">
                    When you or app users click 👍 Like or 👎 Dislike on chat messages, they will instantly appear here!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFeedback.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-2xl bg-slate-950 border ${
                        f.type === 'like' ? 'border-emerald-500/40' : 'border-red-500/40'
                      } space-y-2`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            f.type === 'like'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {f.type === 'like' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                          {f.type.toUpperCase()}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {f.timestamp}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <span className="text-purple-300 font-extrabold">User Prompt: </span>
                        {f.prompt}
                      </div>

                      <div className="text-xs text-slate-300 bg-black/60 p-2.5 rounded-xl border border-white/10 max-h-28 overflow-y-auto font-sans">
                        <span className="text-indigo-300 font-extrabold">AI Answer: </span>
                        {f.assistantResponse}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI MEMORY BANK */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span>Instant Speed Memory Bank</span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Say <code className="text-amber-300 bg-black/50 px-1 rounded">save to memory: [key or text]</code> in normal chat to store custom memory items for ultra-fast instant answers!
                  </p>
                </div>

                {memories.length > 0 && (
                  <button
                    onClick={onClearMemories}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Memories</span>
                  </button>
                )}
              </div>

              {filteredMemories.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 space-y-2">
                  <Brain className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold">No saved memories in memory bank yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Try typing: <span className="text-amber-300">"save to memory: My favorite club is Real Madrid"</span> in the normal chat!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMemories.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col justify-between space-y-2 shadow-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {m.key}
                          </span>
                          <span className="text-[10px] text-slate-500">{m.createdAt}</span>
                        </div>
                        <div className="text-xs text-white pt-1">{m.content}</div>
                      </div>

                      <button
                        onClick={() => onDeleteMemory(m.id)}
                        className="self-end p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
