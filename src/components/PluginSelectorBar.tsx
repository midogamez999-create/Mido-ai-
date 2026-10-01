import React, { useState } from 'react';
import {
  ChatGPTPlugin,
  getActivePlugins,
  togglePluginActive
} from '../lib/pluginsSystem';
import {
  Store,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Radio,
  Plus
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface PluginSelectorBarProps {
  onOpenStore: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const PluginSelectorBar: React.FC<PluginSelectorBarProps> = ({
  onOpenStore,
  onSelectPrompt
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activePlugins = getActivePlugins();

  return (
    <div className="relative inline-block text-left select-none not-prose z-20">
      {/* Pill Toggle Button (ChatGPT Style) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs text-slate-200 hover:text-white transition-all shadow-md group"
          title="Configure active Mido plugins"
        >
          <div className="flex items-center -space-x-1">
            {activePlugins.length === 0 ? (
              <span className="text-sm">🔌</span>
            ) : (
              activePlugins.map(p => (
                <span
                  key={p.id}
                  className="w-5 h-5 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center text-xs shadow-sm"
                  title={p.name}
                >
                  {p.icon}
                </span>
              ))
            )}
          </div>

          <span className="font-bold tracking-tight">
            {activePlugins.length === 0
              ? 'No Plugins Active'
              : `Plugins (${activePlugins.length} active)`}
          </span>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick Add / Open Store button */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onOpenStore();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm"
          title="Open Mido Plugin Store"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Plugin Store</span>
        </button>
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-72 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-3 space-y-2 z-40 backdrop-blur-xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active in this Chat (Max 3)
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenStore();
                }}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Store 🛍️
              </button>
            </div>

            {/* Active plugin toggles */}
            <div className="space-y-1">
              {activePlugins.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{p.icon}</span>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">@{p.id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      togglePluginActive(p.id);
                    }}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30"
                  >
                    Active
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Mention Hints */}
            <div className="pt-2 border-t border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">
                Tip: Type <strong className="text-emerald-400">@Spotify</strong>, <strong className="text-amber-400">@Wolfram</strong>, or <strong className="text-cyan-400">@WebSearch</strong> in chat to direct queries to specific plugins!
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
