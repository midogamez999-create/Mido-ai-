import React, { useState } from 'react';
import {
  ChatGPTPlugin,
  getInstalledPlugins,
  savePlugins,
  togglePluginActive,
  installPlugin,
  uninstallPlugin,
  searchPlugins,
  PRESET_CHATGPT_PLUGINS
} from '../lib/pluginsSystem';
import {
  Search,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  X,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  CheckCircle2,
  Code2,
  Radio,
  Store,
  Tag
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface PluginStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPromptToChat?: (promptText: string) => void;
}

export const PluginStoreModal: React.FC<PluginStoreModalProps> = ({
  isOpen,
  onClose,
  onSelectPromptToChat
}) => {
  const [plugins, setPlugins] = useState<ChatGPTPlugin[]>(() => getInstalledPlugins());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customManifestUrl, setCustomManifestUrl] = useState('');
  const [customManifestStatus, setCustomManifestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCount = plugins.filter(p => p.installed && p.enabled).length;

  const handleToggleActive = (pluginId: string) => {
    soundFx.playClick();
    const updated = togglePluginActive(pluginId);
    setPlugins([...updated]);
  };

  const handleInstall = (pluginId: string) => {
    soundFx.playClick();
    const updated = installPlugin(pluginId);
    setPlugins([...updated]);
  };

  const handleUninstall = (pluginId: string) => {
    soundFx.playClick();
    const updated = uninstallPlugin(pluginId);
    setPlugins([...updated]);
  };

  const handleReset = () => {
    soundFx.playClick();
    savePlugins(PRESET_CHATGPT_PLUGINS);
    setPlugins([...PRESET_CHATGPT_PLUGINS]);
  };

  const filteredPlugins = searchPlugins(searchQuery, selectedCategory);

  const categories = [
    { id: 'all', label: 'All Plugins' },
    { id: 'installed', label: 'Installed' },
    { id: 'popular', label: 'Popular' },
    { id: 'media', label: 'Music & Media' },
    { id: 'math', label: 'Math & Data' },
    { id: 'developer', label: 'Developer Tools' },
    { id: 'travel', label: 'Travel & Maps' },
    { id: 'shopping', label: 'Shopping' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shadow-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Mido Plugins & Extensions Store</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {activeCount}/3 Active in Chat
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect external services, computational engines, and real APIs to your AI chat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-400 hover:text-white transition-all hidden sm:block"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-white/5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search plugins (e.g. Spotify, Wolfram, Web Browser, YouTube, Maps)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories Pill Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredPlugins.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-bold text-white">No plugins match your query</p>
              <p className="text-xs text-slate-500">Try searching for "Spotify", "Wolfram", or "Search"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredPlugins.map(plugin => {
                const isInstalled = plugin.installed;
                const isEnabled = plugin.enabled && isInstalled;

                return (
                  <div
                    key={plugin.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEnabled
                        ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/20'
                        : isInstalled
                        ? 'bg-slate-900/80 border-white/15'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      {/* Plugin Header: Icon, Name, Developer, Status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            {plugin.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-black text-white truncate">{plugin.name}</h4>
                              {plugin.verified && (
                                <span title="Verified Plugin">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">by {plugin.developer}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isInstalled ? (
                            <>
                              <button
                                onClick={() => handleToggleActive(plugin.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  isEnabled
                                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                                    : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                                }`}
                                title={isEnabled ? 'Active in Chat' : 'Enable for Chat'}
                              >
                                {isEnabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Radio className="w-3 h-3" />}
                                <span>{isEnabled ? 'Enabled' : 'Enable'}</span>
                              </button>

                              <button
                                onClick={() => handleUninstall(plugin.id)}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 transition-colors"
                                title="Uninstall Plugin"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleInstall(plugin.id)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Install</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {plugin.description}
                      </p>
                    </div>

                    {/* Sample Queries Chips */}
                    {plugin.sampleQueries && plugin.sampleQueries.length > 0 && (
                      <div className="pt-2.5 border-t border-white/5 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          Try asking:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {plugin.sampleQueries.slice(0, 2).map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                soundFx.playClick();
                                if (onSelectPromptToChat) {
                                  onSelectPromptToChat(q);
                                  onClose();
                                }
                              }}
                              className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 text-[10px] text-slate-400 hover:text-emerald-300 transition-colors text-left truncate max-w-full"
                              title="Send query to chat"
                            >
                              "{q}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Plugins provide real API tools without interrupting normal conversation.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
          >
            Close Store
          </button>
        </div>
      </div>
    </div>
  );
};
