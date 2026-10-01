import React from 'react';
import { RefreshCw, Check, Sparkles } from 'lucide-react';
import { PRO_TRANSITIONS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutTransitionsPanelProps {
  selectedTransition: string;
  onSelectTransition: (trId: string) => void;
  transitionDuration: number;
  onChangeDuration: (val: number) => void;
}

export const CutTransitionsPanel: React.FC<CutTransitionsPanelProps> = ({
  selectedTransition,
  onSelectTransition,
  transitionDuration,
  onChangeDuration,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Duration Slider */}
      <div className="flex items-center justify-between gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <RefreshCw className="w-4 h-4 text-pink-400" />
          <span>Transition Crossfade Duration:</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <input
            type="range"
            min={0.2}
            max={2.5}
            step={0.1}
            value={transitionDuration}
            onChange={(e) => onChangeDuration(parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
          <span className="text-xs font-mono text-pink-400 font-bold w-12 text-right">{transitionDuration.toFixed(1)}s</span>
        </div>
      </div>

      {/* Grid of 25 Transitions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {PRO_TRANSITIONS.map((tr) => {
          const isSelected = selectedTransition === tr.id;
          return (
            <button
              key={tr.id}
              onClick={() => {
                soundFx.playPop();
                onSelectTransition(tr.id);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-br from-pink-600/30 via-rose-600/30 to-purple-600/30 border-pink-500 shadow-lg shadow-pink-600/20 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-black text-slate-100 group-hover:text-pink-300 line-clamp-1">
                  {tr.name}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{tr.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
