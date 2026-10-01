import React, { useState } from 'react';
import { Palette, Sparkles, Sliders, Check } from 'lucide-react';
import { CINEMATIC_LUTS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutFiltersPanelProps {
  selectedFilter: string;
  onSelectFilter: (filterId: string) => void;
  filterIntensity: number;
  onChangeIntensity: (val: number) => void;
}

export const CutFiltersPanel: React.FC<CutFiltersPanelProps> = ({
  selectedFilter,
  onSelectFilter,
  filterIntensity,
  onChangeIntensity,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('All');
  const groups = ['All', 'Cinematic', 'Vintage Film', 'Retro', 'Warm', 'Cool', 'Black & White', 'Stylized', 'Modern', 'Aesthetic'];

  const filteredLuts = activeGroup === 'All'
    ? CINEMATIC_LUTS
    : CINEMATIC_LUTS.filter(l => l.group === activeGroup);

  return (
    <div className="flex flex-col gap-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {groups.map((grp) => (
          <button
            key={grp}
            onClick={() => {
              soundFx.playClick();
              setActiveGroup(grp);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeGroup === grp
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      {/* Intensity Slider */}
      <div className="flex items-center justify-between gap-4 p-3 bg-black/40 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sliders className="w-4 h-4 text-pink-400" />
          <span>LUT Intensity:</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <input
            type="range"
            min={0}
            max={100}
            value={filterIntensity}
            onChange={(e) => onChangeIntensity(parseInt(e.target.value))}
            className="w-full accent-pink-500"
          />
          <span className="text-xs font-mono text-pink-400 font-bold w-9 text-right">{filterIntensity}%</span>
        </div>
      </div>

      {/* LUT Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {filteredLuts.map((lut) => {
          const isSelected = selectedFilter === lut.id;
          return (
            <button
              key={lut.id}
              onClick={() => {
                soundFx.playClick();
                onSelectFilter(lut.id);
              }}
              className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-pink-600/20 to-purple-600/20 border-pink-500 shadow-lg shadow-pink-600/20 scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-white/5 border-white/10'
              }`}
            >
              {/* Preview Thumbnail Box with applied CSS filter */}
              <div
                className="w-full h-16 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 mb-2 relative overflow-hidden shadow-inner flex items-center justify-center"
                style={{ filter: lut.css !== 'none' ? lut.css : undefined }}
              >
                <span className="text-[10px] font-bold text-white/90 drop-shadow-md">LUT PREVIEW</span>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <span className="text-xs font-bold text-slate-200 text-center line-clamp-1 group-hover:text-white">
                {lut.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{lut.group}</span>

              {lut.badge && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-pink-500/80 text-white text-[8px] font-black rounded-md uppercase tracking-wider shadow">
                  {lut.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
