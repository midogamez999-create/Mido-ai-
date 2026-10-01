import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  MessageSquare,
  Youtube,
  Sparkles,
  Bot,
  Key,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Zap,
  ShieldCheck,
  Code2,
  Video,
  Music,
  DollarSign,
  Rocket,
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'discord' | 'youtube' | 'gemini' | 'mido';
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'discord',
}) => {
  const [activeTab, setActiveTab] = useState<'discord' | 'youtube' | 'gemini' | 'mido'>(defaultTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Help Center &amp; Setup Guides</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  Step-by-Step
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Learn how to get free API keys for Discord, YouTube &amp; Mido AI, and master mido.ai Studio features!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-black/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('discord')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'discord'
                ? 'border-[#5865F2] text-white bg-[#5865F2]/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
            <span>Discord Bot &amp; Webhooks</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'youtube'
                ? 'border-red-500 text-white bg-red-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube Data API</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'gemini'
                ? 'border-amber-400 text-white bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mido AI API Key</span>
          </button>

          <button
            onClick={() => setActiveTab('mido')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'mido'
                ? 'border-purple-400 text-white bg-purple-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-4 h-4 text-purple-400" />
            <span>How to Use mido.ai Studio</span>
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-100">
          {/* TAB 1: DISCORD BOT & WEBHOOK GUIDE */}
          {activeTab === 'discord' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                    <span>How to Get Discord Bot Token &amp; Webhook URL (100% Free)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Follow these 4 quick steps to create your custom Discord Bot or Webhook auto-poster!
                  </p>
                </div>
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>Discord Dev Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5865F2] text-white font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="text-xs font-extrabold text-white">Create Discord Application</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open <strong className="text-indigo-300">Discord Developer Portal</strong>, log in with your Discord account, and click <span className="text-amber-300 font-bold">"New Application"</span>. Give your bot a cool name (e.g., <code className="text-indigo-200">mido-ai-bot</code>).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5865F2] text-white font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="text-xs font-extrabold text-white">Copy Bot Token</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Go to the <strong className="text-indigo-300">"Bot"</strong> tab on the left menu. Click <span className="text-amber-300 font-bold">"Reset Token"</span> or <span className="text-amber-300 font-bold">"Copy Token"</span>. Copy the token string (starts with <code className="text-slate-400">MTE...</code>) and paste it into mido.ai!
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5865F2] text-white font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="text-xs font-extrabold text-white">Enable Privileged Intents</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Under the <strong className="text-indigo-300">Bot</strong> page, scroll down to <strong className="text-amber-300">"Privileged Gateway Intents"</strong> and toggle ON: <br />
                    • <code className="text-indigo-300 font-bold">MESSAGE CONTENT INTENT</code> <br />
                    • <code className="text-indigo-300 font-bold">SERVER MEMBERS INTENT</code>
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5865F2] text-white font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="text-xs font-extrabold text-white">Get Discord Webhook URL (Easy)</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In your Discord app server: Right-click any Channel → <strong className="text-indigo-300">Edit Channel</strong> → <strong className="text-amber-300">Integrations</strong> → <strong className="text-amber-300">Webhooks</strong> → <strong className="text-indigo-300">New Webhook</strong> → Copy Webhook URL!
                  </p>
                </div>
              </div>

              {/* 🚨 TROUBLESHOOTING BOX FOR MISSING COMMANDS */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950 border-2 border-amber-500/60 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>⚠️ Don't See Commands in Your Discord Server? Follow This 1-Minute Fix:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-200">
                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
                    <span className="font-bold text-amber-300 block">1. Re-Invite with BOTH Scopes</span>
                    <p className="text-[11px] text-slate-300">
                      Go to Developer Portal → <strong>OAuth2</strong> → <strong>URL Generator</strong>. Select <strong><code className="text-indigo-300">bot</code></strong> AND <strong><code className="text-indigo-300">applications.commands</code></strong>! Under Bot Permissions check <strong>Administrator</strong>. Re-invite the bot!
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
                    <span className="font-bold text-amber-300 block">2. Turn ON Privileged Intents</span>
                    <p className="text-[11px] text-slate-300">
                      Go to Developer Portal → <strong>Bot</strong> tab. Scroll down to <strong>Privileged Gateway Intents</strong> and toggle ON <strong>MESSAGE CONTENT INTENT</strong> &amp; <strong>SERVER MEMBERS INTENT</strong>!
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
                    <span className="font-bold text-amber-300 block">3. Try Text Chat Prefix Commands</span>
                    <p className="text-[11px] text-slate-300">
                      Type <code className="text-indigo-300 font-bold">!help</code>, <code className="text-indigo-300 font-bold">!ban</code>, <code className="text-indigo-300 font-bold">!kick</code>, <code className="text-indigo-300 font-bold">!clear 10</code>, or <code className="text-indigo-300 font-bold">!vip</code> in any text channel! The bot responds to both <code className="text-amber-300">!</code> and <code className="text-amber-300">/</code>!
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
                    <span className="font-bold text-amber-300 block">4. Pre-configured Credentials</span>
                    <p className="text-[11px] text-slate-300">
                      Client ID: <code className="text-amber-300 font-mono font-bold">1531566521623773205</code> <br />
                      VIP Master Code: <code className="text-amber-300 font-mono font-bold">mido3dch1pro</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: YOUTUBE DATA API V3 GUIDE */}
          {activeTab === 'youtube' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>How to Get Free YouTube Data API v3 Key &amp; Channel ID</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Access real-time subscriber counts, view counts, recent video lists &amp; video analytics!
                  </p>
                </div>
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="text-xs font-extrabold text-white">Open Google Cloud Console</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Log in at <strong className="text-red-300">console.cloud.google.com</strong> with your Google account and create a new project named <code className="text-amber-300 font-bold">mido-youtube-studio</code>.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="text-xs font-extrabold text-white">Enable YouTube Data API v3</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Search <strong className="text-amber-300">"YouTube Data API v3"</strong> in the API Library search bar and click <strong className="text-emerald-400">ENABLE</strong>.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="text-xs font-extrabold text-white">Create API Credentials</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Go to <strong className="text-red-300">Credentials</strong> → Click <strong className="text-amber-300">+ Create Credentials</strong> → Select <strong className="text-amber-300">API Key</strong>. Copy the key (starts with <code className="text-slate-400">AIzaSy...</code>).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="text-xs font-extrabold text-white">Find Your YouTube Channel ID</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Open your YouTube Channel homepage → Click <strong className="text-red-300">Share</strong> → Copy Channel handle or URL (e.g., <code className="text-indigo-300">UC123456789...</code> or handle <code className="text-amber-300">@MrBeast</code>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MIDO AI API KEY GUIDE */}
          {activeTab === 'gemini' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>How to Get Free Mido AI API Key</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Unlock Mido 2.5 Flash, ultra-fast code generation, Veo AI videos, and Lyria music tracks!
                  </p>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>Mido AI Studio Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>3 Easy Steps for Free Mido AI API Access:</span>
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                  <li>Visit <strong className="text-amber-300">aistudio.google.com/app/apikey</strong> and sign in with your Google account.</li>
                  <li>Click <strong className="text-emerald-400">"Create API Key"</strong> in a new or existing Cloud project.</li>
                  <li>Copy your new API key string and paste it into the mido.ai Secrets Vault or inline key banner!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: HOW TO USE MIDO AI STUDIO */}
          {activeTab === 'mido' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/40 space-y-1">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-purple-400" />
                  <span>mido.ai Studio Complete Feature Guide</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Welcome to the ultimate web creator workbench! Here is what you can build:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span>1. 3D Football 60FPS &amp; App Studio</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Generate full 60FPS HTML5 WebGL games, 3D stadium matches, goal horn audio FX, and custom web applications with live code previews and 1-click ZIP export!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#5865F2]">
                    <Bot className="w-4 h-4 text-[#5865F2]" />
                    <span>2. Discord Bot Creator &amp; Hub</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Configure custom Discord bots, auto-responders, slash commands, test messages in a live bot console, and auto-post updates to your Discord server channel via webhooks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-red-400">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>3. YouTube Studio Live Tracker</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Connect your YouTube Channel ID or API Key to track live subscriber counts, view statistics, subscriber goals, and generate viral thumbnail titles.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>4. 200 Ad Monetization Catalog</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Browse 200 high-eCPM sponsored ad formats (Google AdSense AI, Unity Ads, Meta, AppLovin) and auto-inject sponsored banners directly into your app code.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
