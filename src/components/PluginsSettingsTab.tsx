import React, { useState } from 'react';
import {
  ChatGPTPlugin,
  PluginActionResult,
  getInstalledPlugins,
  savePlugins,
  togglePluginActive,
  installPlugin,
  uninstallPlugin,
  searchPlugins,
  executeChatGPTPlugin,
  PRESET_CHATGPT_PLUGINS
} from '../lib/pluginsSystem';
import {
  Search,
  Plus,
  Play,
  CheckCircle2,
  ExternalLink,
  Trash2,
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Shield,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
  Check,
  Store,
  Radio,
  Code2
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface PluginsSettingsTabProps {
  onTestPromptInChat?: (prompt: string) => void;
}

export const PluginsSettingsTab: React.FC<PluginsSettingsTabProps> = ({
  onTestPromptInChat
}) => {
  const [plugins, setPlugins] = useState<ChatGPTPlugin[]>(() => getInstalledPlugins());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Live in-settings test runner
  const [testInput, setTestInput] = useState('@Spotify search Bohemian Rhapsody');
  const [testResult, setTestResult] = useState<PluginActionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

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
    setTestResult(null);
  };

  const handleRunTest = async () => {
    if (!testInput.trim()) return;
    soundFx.playClick();
    setIsTesting(true);

    const active = plugins.filter(p => p.installed && p.enabled);
    const target = active.find(p => testInput.toLowerCase().includes(p.id) || testInput.toLowerCase().includes(p.name.toLowerCase())) || active[0] || plugins[0];

    try {
      const res = await executeChatGPTPlugin(target, testInput);
      setTestResult(res);
      soundFx.playSuccess();
    } finally {
      setIsTesting(false);
    }
  };

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

  const filteredPlugins = searchPlugins(searchQuery, selectedCategory);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-lg shrink-0">
            🔌
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Mido Plugins &amp; External Tools</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {activeCount}/3 Active in Chat
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Connect real tools like Spotify, Wolfram Alpha, Web Browser, and Maps without interrupting normal chat.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Live In-Settings Interactive Tool Tester */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Interactive Plugin Runner (Test in Settings)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Type <strong className="text-emerald-400">@Spotify</strong>, <strong className="text-amber-400">@Wolfram</strong>, etc.
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            placeholder="@Spotify search Bohemian Rhapsody, @Wolfram solve 2x+5=15..."
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={handleRunTest}
            disabled={isTesting || !testInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTesting ? 'Running...' : 'Run Tool'}</span>
          </button>
        </div>

        {/* Live Test Result Output */}
        {testResult && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-white/5 pb-1.5">
              <span>{testResult.icon} {testResult.pluginName} · {testResult.operationName}</span>
              <span className="text-[10px] text-slate-400">Status 200 OK</span>
            </div>
            <p className="text-slate-300 font-sans">{testResult.summary}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500 uppercase block mb-0.5">Request Payload:</span>
                <pre className="p-2 rounded bg-black/60 text-cyan-300 overflow-x-auto">
                  {JSON.stringify(testResult.requestPayload, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-slate-500 uppercase block mb-0.5">Response Payload:</span>
                <pre className="p-2 rounded bg-black/60 text-emerald-300 overflow-x-auto">
                  {JSON.stringify(testResult.responsePayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Categories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plugins by name, developer, or capabilities..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plugins List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPlugins.map(plugin => {
          const isInstalled = plugin.installed;
          const isEnabled = plugin.enabled && isInstalled;

          return (
            <div
              key={plugin.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg'
                  : isInstalled
                  ? 'bg-slate-900/80 border-white/15'
                  : 'bg-white/5 border-white/5 hover:border-white/15'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {plugin.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{plugin.name}</h4>
                      <p className="text-[11px] text-slate-400">by {plugin.developer}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isInstalled ? (
                      <>
                        <button
                          onClick={() => handleToggleActive(plugin.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isEnabled
                              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                              : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/15'
                          }`}
                        >
                          {isEnabled ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Radio className="w-3 h-3" />}
                          <span>{isEnabled ? 'Active' : 'Activate'}</span>
                        </button>

                        <button
                          onClick={() => handleUninstall(plugin.id)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5"
                          title="Uninstall"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleInstall(plugin.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow-md flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {plugin.description}
                </p>
              </div>

              {plugin.sampleQueries && (
                <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1">
                  {plugin.sampleQueries.slice(0, 1).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        soundFx.playClick();
                        if (onTestPromptInChat) onTestPromptInChat(q);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-400 hover:text-white truncate max-w-full"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
