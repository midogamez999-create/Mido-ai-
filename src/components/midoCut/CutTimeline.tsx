import React from 'react';
import {
  Scissors, Play, Pause, RotateCcw, Zap, Trash2, Snowflake,
  Move, Maximize2, Eye, Grid, Activity, Magnet, Sliders, Slice,
  Copy, RefreshCw, Repeat, Layers
} from 'lucide-react';
import { soundFx } from '../../lib/soundFx';
import { TIMELINE_TOOLS } from '../midoCutData';

interface CutTimelineProps {
  mediaType: 'video' | 'photo';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
  onSpeedChange: (speed: number) => void;
  onActionTriggered: (actionName: string) => void;
  safeAreaMode: boolean;
  onToggleSafeArea: () => void;
}

export const CutTimeline: React.FC<CutTimelineProps> = ({
  mediaType,
  isPlaying,
  currentTime,
  duration,
  trimStart,
  trimEnd,
  playbackSpeed,
  onTogglePlay,
  onSeek,
  onTrimChange,
  onSpeedChange,
  onActionTriggered,
  safeAreaMode,
  onToggleSafeArea,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const trimStartPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimEndPercent = duration > 0 ? (trimEnd / duration) * 100 : 100;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    onSeek(targetTime);
  };

  return (
    <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-3 md:p-4 shadow-xl flex flex-col gap-3">
      {/* Top Quick Actions Bar (CapCut Style) */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              soundFx.playClick();
              onActionTriggered('Split Clip at ' + formatTime(currentTime));
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            title="Split Clip at Playhead"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onTrimChange(currentTime, trimEnd);
              onActionTriggered('Trimmed Start to ' + formatTime(currentTime));
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-all"
            title="Trim from Start"
          >
            <span>[ Trim Start</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onTrimChange(trimStart, currentTime);
              onActionTriggered('Trimmed End to ' + formatTime(currentTime));
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 rounded-lg text-xs font-medium transition-all"
            title="Trim to End"
          >
            <span>Trim End ]</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              onActionTriggered('Generated 3s Freeze Frame');
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-medium transition-all"
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Freeze Frame</span>
          </button>

          <button
            onClick={onToggleSafeArea}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              safeAreaMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
            }`}
            title="Toggle TikTok / Reels Safe Margins"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Safe Guides</span>
          </button>
        </div>

        {/* Speed Ramp Chips */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Speed:
          </span>
          {[0.5, 1.0, 1.5, 2.0, 4.0].map((s) => (
            <button
              key={s}
              onClick={() => {
                soundFx.playClick();
                onSpeedChange(s);
                onActionTriggered(`Speed ramped to ${s}x`);
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                playbackSpeed === s
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Track & Audio Waveform View */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Selected: {(trimEnd - trimStart).toFixed(1)}s (from {formatTime(trimStart)} to {formatTime(trimEnd)})
          </span>
        </div>

        {/* Interactive Scrubbing Track */}
        <div
          onClick={handleTimelineClick}
          className="relative h-14 bg-black/80 rounded-xl border border-white/15 overflow-hidden cursor-pointer select-none group shadow-inner"
        >
          {/* Simulated Waveform & Frame Stripes */}
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-35 pointer-events-none">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 20 + Math.sin(i * 0.7) * 15 + ((i % 5) * 4);
              return (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-red-500 via-pink-400 to-indigo-400 rounded-full"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>

          {/* Active Trimmed Region Highlight */}
          <div
            className="absolute top-0 bottom-0 bg-red-600/20 border-x-2 border-red-500 pointer-events-none"
            style={{
              left: `${trimStartPercent}%`,
              width: `${Math.max(2, trimEndPercent - trimStartPercent)}%`,
            }}
          />

          {/* Draggable Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-red-500/50 z-20 pointer-events-none flex flex-col items-center"
            style={{ left: `${currentPercent}%` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -mt-1 shadow-md border border-white" />
          </div>

          {/* Playhead Hover indicator */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 pointer-events-none" />
        </div>
      </div>

      {/* Primary Transport Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onSeek(0);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Jump to Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {mediaType === 'video' && (
            <button
              onClick={() => {
                soundFx.playClick();
                onTogglePlay();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play Preview'}</span>
            </button>
          )}
        </div>

        {/* Fast Trimming Slider Controls */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">In:</span>
            <input
              type="range"
              min={0}
              max={Math.max(0, trimEnd - 0.5)}
              step={0.1}
              value={trimStart}
              onChange={(e) => onTrimChange(parseFloat(e.target.value), trimEnd)}
              className="w-20 accent-red-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Out:</span>
            <input
              type="range"
              min={Math.min(duration, trimStart + 0.5)}
              max={duration || 15}
              step={0.1}
              value={trimEnd}
              onChange={(e) => onTrimChange(trimStart, parseFloat(e.target.value))}
              className="w-20 accent-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
