import React, { useState } from 'react';
import { ThinkingProcessData } from '../types';
import {
  Brain,
  Search,
  Database,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Copy,
  Clock,
  Radio,
  Zap,
  Activity,
  Terminal,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface ThinkingIndicatorProps {
  data: ThinkingProcessData;
  isLive?: boolean;
  liveElapsedSeconds?: number;
  onCopyTrace?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  data,
  isLive = false,
  liveElapsedSeconds = 0,
  onCopyTrace
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playClick();
    const traceText = `Thinking Process: ${data.headline}\nPhase: ${data.phase.toUpperCase()}\nStatus: ${isLive ? 'RUNNING' : 'COMPLETED'}\nDuration: ${data.durationSeconds || liveElapsedSeconds}s\n\nTasks:\n${data.tasks
      .map(t => `[${t.status.toUpperCase()}] ${t.title}${t.detail ? ` (${t.detail})` : ''}`)
      .join('\n')}\n\nInternal Monologue:\n${data.complaint || ''}`;

    navigator.clipboard.writeText(traceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyTrace) onCopyTrace();
  };

  const completedCount = data.tasks.filter(t => t.status === 'completed').length;
  const runningTask = data.tasks.find(t => t.status === 'running') || data.tasks.find(t => t.status === 'pending');
  const totalTasks = Math.max(data.tasks.length, 1);
  const progressPercent = Math.min(
    Math.round((completedCount / totalTasks) * 100) + (isLive ? 20 : 0),
    100
  );

  const durationDisplay = isLive
    ? `${liveElapsedSeconds.toFixed(1)}s`
    : `${(data.durationSeconds || 1.2).toFixed(1)}s`;

  const isSearching = data.phase === 'searching';
  const phaseLabel = isSearching ? 'Searching for...' : 'Analyzing data...';

  return (
    <div className="w-full my-2.5 not-prose select-none animate-fadeIn">
      {/* 1. FUTURISTIC SLEEK COMPACT CAPSULE */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all border backdrop-blur-xl ${
          isLive
            ? isSearching
              ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-blue-950/40 border-cyan-500/40 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/20'
              : 'bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-indigo-950/40 border-violet-500/40 shadow-lg shadow-violet-950/30 ring-1 ring-violet-500/20'
            : 'bg-slate-900/60 hover:bg-slate-900/90 border-white/10 hover:border-white/20 shadow-sm'
        }`}
      >
        {/* Shimmering Top Accent Line */}
        <div
          className={`h-0.5 w-full bg-gradient-to-r transition-all duration-300 ${
            isLive
              ? isSearching
                ? 'from-cyan-400 via-blue-400 to-indigo-500 animate-pulse'
                : 'from-violet-400 via-purple-400 to-pink-500 animate-pulse'
              : 'from-emerald-400 via-teal-400 to-cyan-500'
          }`}
        />

        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Left: Glowing Badge, Animated Radar/Neural Icon, Topic */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Pulsing Animated Icon */}
            <div
              className={`relative w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                isLive
                  ? isSearching
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md shadow-cyan-500/20'
                    : 'bg-violet-500/20 text-violet-300 border border-violet-400/40 shadow-md shadow-violet-500/20'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {isSearching ? (
                <Search className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-cyan-300' : ''}`} />
              ) : (
                <Database className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-violet-300' : ''}`} />
              )}

              {isLive && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    isSearching ? 'bg-cyan-400' : 'bg-violet-400'
                  } animate-ping`}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {/* PROMINENT PHASE BADGE: 'Searching for...' or 'Analyzing data...' */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    isLive
                      ? isSearching
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-sm shadow-cyan-500/30'
                        : 'bg-violet-500/25 text-violet-200 border border-violet-400/50 shadow-sm shadow-violet-500/30'
                      : 'bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {isLive ? (
                    <Radio className="w-2.5 h-2.5 animate-pulse text-current" />
                  ) : (
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  )}
                  <span>{phaseLabel}</span>
                </span>

                {/* Query Topic */}
                <span className="text-xs font-bold text-white tracking-tight truncate max-w-[240px] sm:max-w-md">
                  {data.queryTopic ? `"${data.queryTopic}"` : data.headline}
                </span>
              </div>

              {/* Running Subtask or Telemetry */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="font-mono text-slate-300 font-semibold">{durationDisplay}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                {isLive && runningTask ? (
                  <span className="text-indigo-300 truncate max-w-[200px] sm:max-w-xs animate-pulse font-medium">
                    {runningTask.title}
                  </span>
                ) : (
                  <span>{completedCount}/{data.tasks.length} steps verified</span>
                )}
                {isLive && (
                  <span className="text-[10px] text-cyan-400 font-mono hidden sm:inline">
                    ⚡ 52 tok/s
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Copy Trace & Dropdown Toggle */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Thought Trace"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <div className="p-1 rounded-lg text-slate-400 group-hover:text-white transition-colors">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Live Slim Progress Track */}
        {isLive && (
          <div className="h-1 w-full bg-slate-950/60 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className={`h-full transition-all duration-300 ${
                isSearching
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 animate-pulse'
                  : 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 animate-pulse'
              }`}
            />
          </div>
        )}
      </div>

      {/* 2. EXPANDED CLEAN REASONING LOGS */}
      {isExpanded && (
        <div className="mt-2 p-3.5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2.5 backdrop-blur-xl shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-2">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step-by-Step Task Breakdown</span>
            </span>
            <span className="font-mono text-slate-300 font-bold">{progressPercent}% Completed</span>
          </div>

          {/* Task Steps List */}
          <div className="space-y-1.5">
            {data.tasks.map((task, idx) => {
              const isCompleted = task.status === 'completed';
              const isRunning = task.status === 'running';

              return (
                <div
                  key={task.id || idx}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                    isRunning
                      ? 'bg-indigo-950/60 border border-indigo-500/40 text-white'
                      : isCompleted
                      ? 'bg-white/5 border border-white/5 text-slate-300'
                      : 'text-slate-500 opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    ) : isRunning ? (
                      <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold ${isRunning ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                        {task.title}
                      </span>
                      {task.durationMs && (
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {(task.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    {task.detail && (
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {task.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Sources Footnote */}
          {data.dataSources && data.dataSources.length > 0 && (
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span className="text-slate-500">Connected:</span>
              {data.dataSources.map((ds, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">
                  {ds}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
