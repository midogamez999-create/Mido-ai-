import React, { useState } from 'react';
import { Sparkles, Scissors, Maximize2, Mic, Zap, Palette, Pipette, Maximize, Eraser, Activity, VolumeX, Move, Globe, Check } from 'lucide-react';
import { AI_MAGIC_TOOLS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutAIMagicPanelProps {
  onApplyAITool: (tool: typeof AI_MAGIC_TOOLS[0]) => void;
  activeAITools: string[];
  isProcessingAI: boolean;
  aiStatusMessage: string;
}

export const CutAIMagicPanel: React.FC<CutAIMagicPanelProps> = ({
  onApplyAITool,
  activeAITools,
  isProcessingAI,
  aiStatusMessage,
}) => {
  const [selectedVoiceAccent, setSelectedVoiceAccent] = useState('en-US');
  const [ttsText, setTtsText] = useState('Welcome to the next generation of creative video editing with Mido Cut!');

  return (
    <div className="flex flex-col gap-5">
      {/* Active AI Processing Banner */}
      {isProcessingAI && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-900/60 via-pink-900/60 to-slate-900 border border-pink-500/50 rounded-2xl animate-pulse shadow-xl">
          <div className="w-6 h-6 border-3 border-pink-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">AI Neural Engine Active</span>
            <span className="text-xs text-pink-200">{aiStatusMessage || 'Processing frame-by-frame enhancement...'}</span>
          </div>
        </div>
      )}

      {/* AI Voiceover TTS Studio Mini Box */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">AI Voiceover & Multilingual TTS</span>
            <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded uppercase">AI VO</span>
          </div>

          <select
            value={selectedVoiceAccent}
            onChange={(e) => setSelectedVoiceAccent(e.target.value)}
            className="bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white"
          >
            <option value="en-US">English (US Studio Pro)</option>
            <option value="en-GB">English (UK BBC Anchor)</option>
            <option value="es-ES">Spanish (Castilian)</option>
            <option value="fr-FR">French (Parisian)</option>
            <option value="de-DE">German (Berlin)</option>
            <option value="ar-SA">Arabic (Modern Standard)</option>
            <option value="ja-JP">Japanese (Anime)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            placeholder="Type voiceover script to narrate..."
          />
          <button
            onClick={() => {
              soundFx.playSuccess();
              if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(ttsText);
                u.lang = selectedVoiceAccent;
                window.speechSynthesis.speak(u);
              }
            }}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow active:scale-95 transition-all shrink-0 flex items-center gap-1"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Generate VO</span>
          </button>
        </div>
      </div>

      {/* Grid of 18 AI Tools */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          18+ Neural AI Magic Tools:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1 no-scrollbar">
          {AI_MAGIC_TOOLS.map((tool) => {
            const isActive = activeAITools.includes(tool.id);
            return (
              <button
                key={tool.id}
                onClick={() => {
                  soundFx.playPop();
                  onApplyAITool(tool);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-br from-fuchsia-600/30 via-purple-600/30 to-pink-600/30 border-fuchsia-500 shadow-lg shadow-fuchsia-600/20 scale-[1.02]'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-pink-400 group-hover:text-white transition-colors">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {tool.badge && (
                    <span className="px-1.5 py-0.5 bg-pink-500/80 text-white text-[8px] font-black rounded uppercase shadow">
                      {tool.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-5 h-5 bg-fuchsia-500 text-white rounded-full flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-white line-clamp-1">
                    {tool.name}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
