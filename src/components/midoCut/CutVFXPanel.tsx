import React from 'react';
import { Sparkles, Zap, Flame, Eye, Check, RefreshCw } from 'lucide-react';
import { VFX_PRESETS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutVFXPanelProps {
  selectedVFX: string;
  onSelectVFX: (vfxId: string) => void;
  vfxOpacity: number;
  onChangeOpacity: (val: number) => void;
}

export const CutVFXPanel: React.FC<CutVFXPanelProps> = ({
  selectedVFX,
  onSelectVFX,
  vfxOpacity,
  onChangeOpacity,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* VFX Header & Intensity */}
      <div className="flex items-center justify-between gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>VFX Layer Opacity:</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <input
            type="range"
            min={10}
            max={100}
            value={vfxOpacity}
            onChange={(e) => onChangeOpacity(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
          <span className="text-xs font-mono text-purple-400 font-bold w-9 text-right">{vfxOpacity}%</span>
        </div>
      </div>

      {/* VFX Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {VFX_PRESETS.map((vfx) => {
          const isSelected = selectedVFX === vfx.id;
          return (
            <button
              key={vfx.id}
              onClick={() => {
                soundFx.playPop();
                onSelectVFX(vfx.id);
              }}
              className={`flex flex-col items-start p-3 rounded-2xl border transition-all relative overflow-hidden group text-left ${
                isSelected
                  ? 'bg-gradient-to-b from-purple-600/25 to-pink-600/25 border-purple-500 shadow-lg shadow-purple-600/20 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${vfx.color}25`, color: vfx.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-slate-100 group-hover:text-white line-clamp-1">
                {vfx.name}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {vfx.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
