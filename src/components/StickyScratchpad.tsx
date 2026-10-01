import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  Trash2,
  Download,
  Send,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface StickyScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

export const StickyScratchpad: React.FC<StickyScratchpadProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [note, setNote] = useState<string>(() => {
    try {
      return localStorage.getItem('mido_sticky_scratchpad') || '';
    } catch {
      return '';
    }
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mido_sticky_scratchpad', note);
    } catch (e) {
      console.error(e);
    }
  }, [note]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!note) return;
    navigator.clipboard.writeText(note);
    soundFx.playClick();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!note) return;
    const blob = new Blob([note], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mido-scratchpad-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    soundFx.playClick();
  };

  const handleClear = () => {
    if (window.confirm('Clear all notes in the scratchpad?')) {
      setNote('');
      soundFx.playClick();
    }
  };

  const handleInsert = () => {
    if (!note.trim()) return;
    if (onSendToChat) {
      onSendToChat(note);
      soundFx.playClick();
    }
  };

  const words = note.trim() ? note.trim().split(/\s+/).length : 0;
  const chars = note.length;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 shadow-2xl rounded-2xl bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-200 tracking-wide">
            Mido Scratchpad 📝
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jot down quick prompts, code snippets, brainstorms, or ideas here..."
            className="w-full h-48 p-3 text-xs sm:text-sm bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none font-mono"
          />

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400">
            <div>
              {words} words • {chars} chars
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                disabled={!note}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
                title="Copy text"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownload}
                disabled={!note}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
                title="Download as .txt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                disabled={!note}
                className="p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 disabled:opacity-30 transition"
                title="Clear notes"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {onSendToChat && (
                <button
                  onClick={handleInsert}
                  disabled={!note.trim()}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-semibold disabled:opacity-30 transition"
                  title="Send to AI Chat prompt"
                >
                  <Send className="w-3 h-3" />
                  Insert
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
