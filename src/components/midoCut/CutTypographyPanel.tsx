import React, { useState } from 'react';
import { Type, Sparkles, Plus, Trash2, Sliders, AlignCenter, AlignLeft, AlignRight, Check } from 'lucide-react';
import { TYPOGRAPHY_TEMPLATES } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

export interface TextOverlayItem {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  bgColor: string;
  isGlow: boolean;
  position: 'top' | 'center' | 'bottom';
  yPercent: number;
  templateStyle?: string;
}

interface CutTypographyPanelProps {
  overlays: TextOverlayItem[];
  onAddText: (template?: typeof TYPOGRAPHY_TEMPLATES[0]) => void;
  onUpdateText: (id: string, updates: Partial<TextOverlayItem>) => void;
  onDeleteText: (id: string) => void;
  onAutoTranscribeAI: () => void;
  isTranscribing: boolean;
}

export const CutTypographyPanel: React.FC<CutTypographyPanelProps> = ({
  overlays,
  onAddText,
  onUpdateText,
  onDeleteText,
  onAutoTranscribeAI,
  isTranscribing,
}) => {
  const [selectedOverlayId, setSelectedOverlayId] = useState<string>(overlays[0]?.id || '');

  const activeOverlay = overlays.find(o => o.id === selectedOverlayId) || overlays[0];

  const fonts = ['Montserrat', 'Bebas Neue', 'Impact', 'Orbitron', 'Playfair Display', 'Pacifico', 'Outfit', 'JetBrains Mono'];

  return (
    <div className="flex flex-col gap-4">
      {/* AI Auto Captions Banner */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-slate-900/80 border border-pink-500/30 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Auto AI Captions & Subtitles</span>
              <span className="px-1.5 py-0.5 bg-pink-500 text-white text-[9px] font-black rounded-md uppercase">PRO AI</span>
            </div>
            <p className="text-xs text-slate-300">Transcribe voice into synchronized word-by-word karaoke subtitles</p>
          </div>
        </div>
        <button
          onClick={() => {
            soundFx.playSuccess();
            onAutoTranscribeAI();
          }}
          disabled={isTranscribing}
          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-600/30 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
        >
          {isTranscribing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Transcribing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Captions</span>
            </>
          )}
        </button>
      </div>

      {/* Typography Presets Grid */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
          24+ Pro Title & Subtitle Templates:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {TYPOGRAPHY_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                soundFx.playPop();
                onAddText(tmpl);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-pink-600/20 border border-white/10 hover:border-pink-500/50 text-left transition-all group flex flex-col justify-between h-20"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white group-hover:text-pink-300 line-clamp-1">
                  {tmpl.name}
                </span>
                {tmpl.badge && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-pink-500/30 text-pink-300 border border-pink-500/40">
                    {tmpl.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">{tmpl.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Layers Editor */}
      <div className="flex flex-col gap-3 p-3 bg-black/40 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Active Text Layers ({overlays.length}):</span>
            <div className="flex items-center gap-1 overflow-x-auto max-w-xs no-scrollbar">
              {overlays.map((ov, idx) => (
                <button
                  key={ov.id}
                  onClick={() => setSelectedOverlayId(ov.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedOverlayId === ov.id || (!selectedOverlayId && idx === 0)
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Layer #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onAddText()}
            className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Text</span>
          </button>
        </div>

        {activeOverlay && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-medium text-slate-400">Content:</label>
              <input
                type="text"
                value={activeOverlay.text}
                onChange={(e) => onUpdateText(activeOverlay.id, { text: e.target.value })}
                className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                placeholder="Enter headline..."
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Font:</label>
                  <select
                    value={activeOverlay.font}
                    onChange={(e) => onUpdateText(activeOverlay.id, { font: e.target.value })}
                    className="w-full bg-slate-900 border border-white/15 rounded-xl px-2 py-1 text-xs text-white"
                  >
                    {fonts.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Size ({activeOverlay.size}px):</label>
                  <input
                    type="range"
                    min={14}
                    max={64}
                    value={activeOverlay.size}
                    onChange={(e) => onUpdateText(activeOverlay.id, { size: parseInt(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Text Color:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeOverlay.color}
                      onChange={(e) => onUpdateText(activeOverlay.id, { color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-300">{activeOverlay.color}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-400">Vertical Y Position ({activeOverlay.yPercent}%):</label>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={activeOverlay.yPercent}
                    onChange={(e) => onUpdateText(activeOverlay.id, { yPercent: parseInt(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeOverlay.isGlow}
                    onChange={(e) => onUpdateText(activeOverlay.id, { isGlow: e.target.checked })}
                    className="rounded accent-pink-500"
                  />
                  <span>Neon Outer Glow</span>
                </label>

                {overlays.length > 1 && (
                  <button
                    onClick={() => onDeleteText(activeOverlay.id)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Layer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
