import React, { useMemo } from 'react';
import { Square, Globe, Brain, Sparkles, Volume2, Search, Cpu } from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface MidoAILoadingProps {
  elapsedSeconds?: number;
  onStopGenerating?: () => void;
  promptTopic?: string;
  activePluginName?: string;
  isTalking?: boolean;
}

/**
 * Clean, authentic loading indicator inspired by modern AI generation:
 * - Turns to "Searching the web..." with an animated globe when a query asks to search
 * - Displays "Thinking..." with shimmering text gradient during cognitive reasoning
 * - Displays "Using [Plugin]..." when running external tools
 * - Displays "Speaking with Talking Tool..." during voice output
 * - 100% native Mido AI branding with zero outside logos or brand names
 */
export const MidoAILoading: React.FC<MidoAILoadingProps> = ({
  elapsedSeconds = 0,
  onStopGenerating,
  promptTopic = '',
  activePluginName,
  isTalking = false,
}) => {
  // Determine if the prompt is asking to search or look up information
  const isSearchQuery = useMemo(() => {
    if (!promptTopic) return false;
    const p = promptTopic.toLowerCase().trim();
    return (
      p.startsWith('search') ||
      p.startsWith('find') ||
      p.startsWith('look up') ||
      p.startsWith('google') ||
      p.startsWith('who is') ||
      p.startsWith('what is') ||
      p.startsWith('where is') ||
      p.startsWith('when did') ||
      p.startsWith('why is') ||
      p.startsWith('how much') ||
      p.startsWith('latest') ||
      p.includes('weather') ||
      p.includes('news') ||
      p.includes('match') ||
      p.includes('score') ||
      p.includes('price') ||
      p.includes('stats') ||
      p.includes('review') ||
      p.includes('released')
    );
  }, [promptTopic]);

  // Clean search topic display
  const searchSubject = useMemo(() => {
    if (!promptTopic) return 'the web';
    const cleaned = promptTopic
      .replace(/^(search\s+for|search|find|look\s+up|google|who\s+is|what\s+is|where\s+is)\s+/i, '')
      .trim();
    if (cleaned.length > 28) return `${cleaned.slice(0, 26)}...`;
    return cleaned || 'the web';
  }, [promptTopic]);

  // Formatted timer (e.g., "1.4s" or "3s")
  const secondsDisplay = elapsedSeconds < 10 
    ? elapsedSeconds.toFixed(1) 
    : Math.floor(elapsedSeconds).toString();

  return (
    <div className="flex flex-col gap-2 my-1.5 select-none not-prose animate-fadeIn">
      <div className="inline-flex flex-wrap items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-2xl bg-[#1e1e24]/90 hover:bg-[#25252d] border border-white/[0.08] shadow-xl backdrop-blur-xl transition-all">
        {/* CASE 1: SEARCHING MODE */}
        {isSearchQuery && !activePluginName && !isTalking && (
          <div className="flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center text-cyan-400">
              <Globe className="w-4 h-4 animate-spin text-cyan-400" style={{ animationDuration: '4s' }} />
              <span className="absolute -inset-1 rounded-full bg-cyan-400/20 animate-ping" />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide">
              <span className="bg-gradient-to-r from-cyan-200 via-white to-cyan-300 bg-clip-text text-transparent animate-pulse">
                Searching
              </span>
              <span className="text-slate-300 font-mono text-[11px] max-w-[160px] sm:max-w-[220px] truncate">
                "{searchSubject}"
              </span>
            </div>

            <span className="text-[11px] font-mono text-cyan-400/80 pl-2 border-l border-white/10">
              {secondsDisplay}s
            </span>
          </div>
        )}

        {/* CASE 2: TALKING TOOL MODE */}
        {isTalking && (
          <div className="flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center text-purple-400">
              <Volume2 className="w-4 h-4 animate-bounce text-purple-400" />
              <span className="absolute -inset-1 rounded-full bg-purple-400/25 animate-ping" />
            </div>

            <span className="text-xs font-medium tracking-wide bg-gradient-to-r from-purple-200 via-white to-pink-300 bg-clip-text text-transparent animate-pulse">
              Speaking with Talking Tool...
            </span>

            <span className="text-[11px] font-mono text-purple-400/80 pl-2 border-l border-white/10">
              {secondsDisplay}s
            </span>
          </div>
        )}

        {/* CASE 3: PLUGIN INVOCATION MODE */}
        {activePluginName && !isTalking && (
          <div className="flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4 animate-pulse text-emerald-400" />
              <span className="absolute -inset-1 rounded-full bg-emerald-400/25 animate-ping" />
            </div>

            <span className="text-xs font-medium tracking-wide text-slate-200">
              Using <span className="font-bold text-white text-emerald-300">{activePluginName}</span>...
            </span>

            <span className="text-[11px] font-mono text-emerald-400/80 pl-2 border-l border-white/10">
              {secondsDisplay}s
            </span>
          </div>
        )}

        {/* CASE 4: REASONING & THINKING MODE (DEFAULT) */}
        {!isSearchQuery && !activePluginName && !isTalking && (
          <div className="flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-slate-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="absolute -inset-1 rounded-full bg-white/10 animate-pulse" />
            </div>

            <span className="text-xs font-medium tracking-wide bg-gradient-to-r from-slate-200 via-white to-slate-400 bg-clip-text text-transparent animate-pulse">
              Thinking...
            </span>

            <span className="text-[11px] font-mono text-slate-400 pl-2 border-l border-white/10">
              {secondsDisplay}s
            </span>
          </div>
        )}

        {/* Functional Stop Generating Button */}
        {onStopGenerating && (
          <button
            onClick={() => {
              soundFx.playClick();
              onStopGenerating();
            }}
            type="button"
            className="group flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-white/[0.08] hover:border-red-500/30 text-xs font-medium transition-all shadow-sm active:scale-95 ml-1"
            title="Stop generation"
          >
            <Square className="w-2.5 h-2.5 fill-current text-slate-400 group-hover:text-red-400" />
            <span className="text-[11px]">Stop</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Backwards compatibility export
export const ChatGPTLoading = MidoAILoading;
