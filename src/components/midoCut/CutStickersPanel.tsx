import React from 'react';
import { Sparkles, Check, Plus, Trash2 } from 'lucide-react';
import { PRO_STICKERS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutStickersPanelProps {
  activeStickers: string[];
  onToggleSticker: (stickerId: string) => void;
  onClearAllStickers: () => void;
}

export const CutStickersPanel: React.FC<CutStickersPanelProps> = ({
  activeStickers,
  onToggleSticker,
  onClearAllStickers,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          30+ Social Badges, Emojis & Animations:
        </span>
        {activeStickers.length > 0 && (
          <button
            onClick={onClearAllStickers}
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            Clear Selected ({activeStickers.length})
          </button>
        )}
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto pr-1 no-scrollbar">
        {PRO_STICKERS.map((st) => {
          const isSelected = activeStickers.includes(st.id);
          return (
            <button
              key={st.id}
              onClick={() => {
                soundFx.playPop();
                onToggleSticker(st.id);
              }}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-r ' + st.color + ' text-white border-white/40 shadow-lg scale-[1.02]'
                  : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide">{st.label}</span>
              </div>
              {isSelected ? (
                <Check className="w-4 h-4 text-white stroke-[3] shrink-0" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
