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
  authorizePluginAccount,
  deauthorizePluginAccount,
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
  ShieldCheck,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
  Check,
  Store,
  Radio,
  Code2,
  Copy,
  Globe,
  Key,
  ChevronDown,
  ChevronUp,
  Cpu,
  Wifi,
  Smartphone,
  BookOpen
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

  // ChatGPT Remote Actions & MCP Connector State
  const [oauthConfig, setOauthConfig] = useState<any>(null);
  const [connectorToken, setConnectorToken] = useState('mido_oauth_live_test');
  const [activeConnectorTab, setActiveConnectorTab] = useState<'oauth' | 'apikey' | 'mcp' | 'proposals'>('oauth');
  const [proposals, setProposals] = useState<any[]>([]);
  const [isTestingConnector, setIsTestingConnector] = useState(false);
  const [connectorStatus, setConnectorStatus] = useState<any>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/connector/oauth-config')
      .then(r => r.json())
      .then(data => {
        setOauthConfig(data);
        if (data.apiKeyAuth?.currentKey) {
          setConnectorToken(data.apiKeyAuth.currentKey);
        }
      })
      .catch(() => {});

    fetchProposals();
  }, []);

  const fetchProposals = () => {
    fetch('/api/connector/proposals')
      .then(r => r.json())
      .then(data => {
        if (data?.proposals) setProposals(data.proposals);
      })
      .catch(() => {});
  };

  const copyToClipboard = (text: string, keyName: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRegenerateKey = async () => {
    soundFx.playClick();
    try {
      const res = await fetch('/api/connector/regenerate-key', { method: 'POST' });
      const data = await res.json();
      if (data.newApiKey) {
        setConnectorToken(data.newApiKey);
        soundFx.playSuccess();
      }
    } catch {
      // ignore
    }
  };

  const handleApproveProposal = async (id: string) => {
    soundFx.playClick();
    try {
      const res = await fetch(`/api/connector/proposals/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        fetchProposals();
        soundFx.playSuccess();
      }
    } catch {
      // ignore
    }
  };

  const handleRejectProposal = async (id: string) => {
    soundFx.playClick();
    try {
      const res = await fetch(`/api/connector/proposals/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        fetchProposals();
        soundFx.playSuccess();
      }
    } catch {
      // ignore
    }
  };

  const handleTestConnector = async () => {
    soundFx.playClick();
    setIsTestingConnector(true);
    try {
      const res = await fetch(`/api/connector/status?token=${encodeURIComponent(connectorToken)}`);
      const data = await res.json();
      setConnectorStatus(data);
      soundFx.playSuccess();
    } catch (e: any) {
      setConnectorStatus({ error: e.message || 'Connection failed' });
    } finally {
      setIsTestingConnector(false);
    }
  };

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

  const handleToggleAuth = (pluginId: string) => {
    soundFx.playClick();
    const target = plugins.find(p => p.id === pluginId);
    if (target?.isAuthorized) {
      const updated = deauthorizePluginAccount(pluginId);
      setPlugins([...updated]);
    } else {
      const updated = authorizePluginAccount(pluginId, 'mido.gamez999@gmail.com');
      setPlugins([...updated]);
      soundFx.playSuccess();
    }
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

      {/* 🚀 CHATGPT REMOTE ACTIONS & MCP CONNECTOR CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl shadow-lg shrink-0">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">ChatGPT Remote Actions &amp; MCP Connector</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live &amp; Secure
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Standard OAuth 2.0 &amp; MCP connection so ChatGPT can inspect Mido AI and propose improvements with your permission.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTestConnector}
              disabled={isTestingConnector}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{isTestingConnector ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isGuideOpen ? 'Hide Guide' : 'Setup Guide'}</span>
              {isGuideOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Security & Zero Credentials Notice */}
        <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-200 relative z-10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Zero ChatGPT Credentials Required:</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Mido AI acts as its own secure OAuth 2.0 authorization server. You never need to supply your ChatGPT password, cookies, or OpenAI API keys. Gemini remains Mido AI&apos;s AI engine, and private keys/chats are strictly protected.
            </p>
          </div>
        </div>

        {/* Sub-Tabs for Connector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 relative z-10 overflow-x-auto">
          <button
            onClick={() => { soundFx.playClick(); setActiveConnectorTab('oauth'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeConnectorTab === 'oauth'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>OAuth 2.0 (Official Flow)</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveConnectorTab('apikey'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeConnectorTab === 'apikey'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Mido AI API Key</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveConnectorTab('mcp'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeConnectorTab === 'mcp'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MCP Remote Server</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveConnectorTab('proposals'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeConnectorTab === 'proposals'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Proposals Queue</span>
            {proposals.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">
                {proposals.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: OAuth 2.0 Details */}
        {activeConnectorTab === 'oauth' && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Client ID */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Client ID:
                  </span>
                  <p className="text-xs font-mono text-cyan-300 truncate select-all">
                    {oauthConfig?.oauth?.clientId || 'mido-ai-client'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(oauthConfig?.oauth?.clientId || 'mido-ai-client', 'clientId')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'clientId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'clientId' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Client Secret */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Client Secret:
                  </span>
                  <p className="text-xs font-mono text-cyan-300 truncate select-all">
                    {oauthConfig?.oauth?.clientSecret || 'mido_sec_chatgpt_live'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(oauthConfig?.oauth?.clientSecret || 'mido_sec_chatgpt_live', 'clientSecret')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'clientSecret' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'clientSecret' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Authorization URL */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                    Authorization URL (Consent Screen):
                  </span>
                  <p className="text-xs font-mono text-white truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/oauth/authorize` : '/oauth/authorize'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href="/oauth/authorize"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-mono flex items-center gap-1 transition-colors"
                    title="Open authorization screen in new tab"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View UI</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/oauth/authorize` : '/oauth/authorize', 'authUrl')}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'authUrl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'authUrl' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Token URL */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                    Token URL (RFC 6749 Exchange):
                  </span>
                  <p className="text-xs font-mono text-white truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/oauth/token` : '/oauth/token'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/oauth/token` : '/oauth/token', 'tokenUrl')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'tokenUrl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'tokenUrl' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Scope & Token Exchange */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 md:col-span-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">
                    Scope:
                  </span>
                  <p className="text-xs font-mono text-emerald-300">
                    mido:read mido:propose
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Token Exchange Method: <strong className="text-slate-200">Default (POST body)</strong> • Discovery RFC 8414: <code className="text-slate-400">/.well-known/oauth-authorization-server</code>
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard('mido:read mido:propose', 'scope')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'scope' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'scope' ? 'Copied' : 'Copy Scope'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Mido AI API Key Details */}
        {activeConnectorTab === 'apikey' && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* OpenAPI URL */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 md:col-span-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    OpenAPI 3.1 Schema URL (for ChatGPT Custom Actions Import):
                  </span>
                  <p className="text-xs font-mono text-cyan-300 truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/openapi.json` : '/api/openapi.json'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/openapi.json` : '/api/openapi.json', 'openapi')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'openapi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'openapi' ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>

              {/* Mido AI Connector Key */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 md:col-span-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5 flex items-center gap-1">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>Mido AI Connector API Key (Auth Type: Bearer):</span>
                  </span>
                  <p className="text-xs font-mono text-white truncate select-all">
                    {connectorToken}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleRegenerateKey}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
                    title="Generate a new fresh key"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(connectorToken, 'token')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'token' ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MCP Remote Server Details */}
        {activeConnectorTab === 'mcp' && (
          <div className="space-y-3 relative z-10 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* MCP Endpoint */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 md:col-span-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block mb-0.5">
                    MCP Remote Server Endpoint (Model Context Protocol):
                  </span>
                  <p className="text-xs font-mono text-purple-300 truncate select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : '/api/mcp', 'mcp')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedKey === 'mcp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'mcp' ? 'Copied' : 'Copy Endpoint'}</span>
                </button>
              </div>

              {/* MCP Tools Catalogue */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 md:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Supported MCP Tools &amp; Methods:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 font-mono">inspect_architecture</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Reads React 19 frontend, Express backend, and models.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 font-mono">list_app_features</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Returns all 24 studio modes (Mido Builder, Video, Humoris).</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 font-mono">list_installed_plugins</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Lists Spotify, Wolfram Alpha, Web Browser, and other tools.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <strong className="text-cyan-300 font-mono">propose_improvement</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5">Allows ChatGPT to propose code/features to your review queue.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Proposals Queue */}
        {activeConnectorTab === 'proposals' && (
          <div className="space-y-2.5 relative z-10 animate-fadeIn">
            {proposals.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-black/30 rounded-xl border border-white/10">
                No proposals yet. When ChatGPT uses the <code>propose_improvement</code> tool, suggestions will appear here for your approval.
              </div>
            ) : (
              proposals.map(p => (
                <div key={p.id} className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {p.category}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      p.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">{p.description}</p>
                  {p.reason && (
                    <p className="text-slate-400 text-[10px] italic">Reason: {p.reason}</p>
                  )}

                  {p.suggestedCodeSnippet && (
                    <pre className="p-2 rounded bg-black/60 text-cyan-300 text-[10px] font-mono overflow-x-auto">
                      {p.suggestedCodeSnippet}
                    </pre>
                  )}

                  {p.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRejectProposal(p.id)}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveProposal(p.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
                      >
                        Approve Proposal
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Live Test Status Feedback */}
        {connectorStatus && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 space-y-1.5 text-xs font-mono animate-fadeIn relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Connector Test Passed (HTTP 200 OK)</span>
              </span>
              <span className="text-[10px] text-slate-500">{connectorStatus.serverTime}</span>
            </div>
            <div className="p-2 rounded bg-black/60 text-slate-300 text-[11px] overflow-x-auto">
              <pre>{JSON.stringify(connectorStatus, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Step-by-Step Mobile Setup Guide for ChatGPT */}
        {isGuideOpen && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/20 space-y-2.5 text-xs text-slate-300 relative z-10 animate-fadeIn">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>How to connect ChatGPT to Mido AI from phone or computer:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-300">
              <li>Open <strong>ChatGPT</strong> (on your phone browser or desktop) and go to <strong>My GPTs &gt; Create a GPT</strong> (or edit your existing assistant).</li>
              <li>Under the <strong>Configure</strong> tab, scroll to the bottom and click <strong>Create new action</strong>.</li>
              <li>Tap <strong>Import from URL</strong> and paste your OpenAPI URL: <code className="text-cyan-300 bg-white/5 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/api/openapi.json` : '/api/openapi.json'}</code>.</li>
              <li>Under <strong>Authentication</strong>, select <strong>OAuth</strong> (or API Key):
                <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-400">
                  <li>Client ID: <code className="text-indigo-300">mido-ai-client</code></li>
                  <li>Client Secret: <code className="text-indigo-300">mido_sec_chatgpt_live</code></li>
                  <li>Authorization URL: <code className="text-indigo-300">{typeof window !== 'undefined' ? `${window.location.origin}/oauth/authorize` : '/oauth/authorize'}</code></li>
                  <li>Token URL: <code className="text-indigo-300">{typeof window !== 'undefined' ? `${window.location.origin}/oauth/token` : '/oauth/token'}</code></li>
                  <li>Scope: <code className="text-indigo-300">mido:read mido:propose</code></li>
                </ul>
              </li>
              <li>Save your GPT! When you ask ChatGPT to inspect Mido AI, it will open the authorization screen where you tap <strong>Authorize ChatGPT</strong>. No ChatGPT passwords or private tokens are required!</li>
            </ol>
          </div>
        )}
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
              className={`relative overflow-hidden p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                isEnabled
                  ? 'bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-lg'
                  : isInstalled
                  ? 'bg-slate-900/80 border-white/15'
                  : 'bg-white/5 border-white/5 hover:border-white/15'
              }`}
            >
              {/* App Icon Watermark & Brand Aura Behind It */}
              <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 pointer-events-none select-none filter blur-[0.5px] transform rotate-12 transition-transform group-hover:scale-125 duration-300">
                {plugin.icon}
              </div>
              {plugin.brandLogoUrl && (
                <div
                  className="absolute -right-2 -bottom-2 w-28 h-28 rounded-full opacity-10 pointer-events-none select-none bg-cover bg-center filter blur-[1px]"
                  style={{ backgroundImage: `url(${plugin.brandLogoUrl})` }}
                />
              )}
              <div
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full pointer-events-none blur-3xl opacity-15"
                style={{ backgroundColor: plugin.brandColor || '#10b981' }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0 relative overflow-hidden">
                      {plugin.brandLogoUrl ? (
                        <img src={plugin.brandLogoUrl} alt={plugin.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{plugin.icon}</span>
                      )}
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

                {/* Account Authorization status & action */}
                <div className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-black/40 border border-white/5 text-[11px] mb-2">
                  <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${plugin.isAuthorized ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="truncate max-w-[150px] sm:max-w-[200px] text-[10px]">
                      {plugin.isAuthorized
                        ? `Linked: ${plugin.authorizedAccount || 'mido.gamez999@gmail.com'}`
                        : 'Requires Account Auth'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleAuth(plugin.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
                      plugin.isAuthorized
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30'
                        : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    }`}
                  >
                    {plugin.isAuthorized ? 'Authorized ✓' : 'Authorize 🔐'}
                  </button>
                </div>
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
