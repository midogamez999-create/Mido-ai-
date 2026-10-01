import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, HelpCircle, ArrowRight, RefreshCw, MessageSquare, Scissors, Globe
} from 'lucide-react';
import { Mode } from '../types';
import { soundFx } from '../lib/soundFx';

interface MidoGuideFloatingWidgetProps {
  onSelectMode: (mode: Mode) => void;
  onOpenFeedback: () => void;
}

export const MidoGuideFloatingWidget: React.FC<MidoGuideFloatingWidgetProps> = ({
  onSelectMode,
  onOpenFeedback,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'guide'; text: string; actions?: { label: string; mode: Mode }[] }[]>([
    {
      sender: 'guide',
      text: '👋 Need help? Ask Mido Guide anything about Mido Cut (Editor), Mido Orb, or reporting bugs!',
      actions: [
        { label: '🎬 Open Editor', mode: 'editor-studio' },
        { label: '🌐 Open Mido Orb', mode: 'mido-orb' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isThinking]);

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query) return;

    soundFx.playClick();
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!customPrompt) setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/mido-guide-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const answer = data.answer || "I'm Mido Guide! Check out Mido Cut Editor and Mido Orb Shorts.";

      const actions: { label: string; mode: Mode }[] = [];
      const lower = query.toLowerCase();
      if (lower.includes('editor') || lower.includes('capcut') || lower.includes('cut')) {
        actions.push({ label: 'Open Mido Cut Editor 🎬', mode: 'editor-studio' });
      }
      if (lower.includes('orb') || lower.includes('short')) {
        actions.push({ label: 'Open Mido Orb 🌐', mode: 'mido-orb' });
      }

      setMessages(prev => [...prev, { sender: 'guide', text: answer, actions: actions.length > 0 ? actions : undefined }]);
      soundFx.playReceived();
    } catch {
      setMessages(prev => [...prev, {
        sender: 'guide',
        text: 'You can edit photos/videos in Mido Cut, scroll shorts in Mido Orb, or send error reports to Mido.gamez999@gmail.com in Settings!',
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] h-[440px] bg-slate-950/95 backdrop-blur-2xl border border-rose-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-fadeIn">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-rose-950/80 to-slate-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xs font-black text-white">Mido Guide Helper</span>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online & Ready</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-950/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs">{m.text}</div>
                  {m.actions && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            onSelectMode(act.mode);
                            setIsOpen(false);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-black/60 hover:bg-black text-rose-300 text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 text-[11px]">
                <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Shortcuts */}
          <div className="px-2 py-1.5 bg-slate-900 border-t border-white/10 flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSend('How to use Mido Cut editor?')}
              className="px-2 py-0.5 rounded bg-black/50 text-[10px] text-slate-300 whitespace-nowrap border border-white/5"
            >
              🎬 Editor
            </button>
            <button
              onClick={() => handleSend('How to use Shorts?')}
              className="px-2 py-0.5 rounded bg-black/50 text-[10px] text-slate-300 whitespace-nowrap border border-white/5"
            >
              📱 Shorts
            </button>
            <button
              onClick={() => {
                onOpenFeedback();
                setIsOpen(false);
              }}
              className="px-2 py-0.5 rounded bg-rose-950/60 text-[10px] text-rose-300 whitespace-nowrap border border-rose-500/30 font-bold"
            >
              🚨 Report Bug
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-slate-950 border-t border-white/10 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Ask anything about the app..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button with Glowing Ring */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          soundFx.playPop();
        }}
        className="px-4 py-3 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-2xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all ring-2 ring-white/30"
        title="Ask Mido Guide"
      >
        <Bot className="w-5 h-5 text-white animate-bounce" />
        <span className="hidden sm:inline">Mido Guide</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </button>

    </div>
  );
};
