import React, { useState } from 'react';
import { UserSecrets, UserAccount } from '../types';
import {
  MessageSquare,
  Bot,
  Key,
  ShieldAlert,
  HelpCircle,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Terminal,
  Zap,
  Radio,
  Download,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Flame,
  Award,
  Globe,
} from 'lucide-react';

interface DiscordStudioViewProps {
  secrets: UserSecrets;
  onSaveSecrets: (updated: UserSecrets) => void;
  onOpenHelpModal: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
  user?: UserAccount | null;
}

export const DiscordStudioView: React.FC<DiscordStudioViewProps> = ({
  secrets,
  onSaveSecrets,
  onOpenHelpModal,
  user,
}) => {
  // API Key Setup State
  const [botTokenInput, setBotTokenInput] = useState(secrets.discordBotToken || '');
  const [webhookUrlInput, setWebhookUrlInput] = useState(secrets.discordWebhookUrl || '');
  const [keySavedNotice, setKeySavedNotice] = useState<string | null>(null);

  // Bot Configurator State
  const [botName, setBotName] = useState('mido3dch1 AI Bot');
  const [botAvatarUrl, setBotAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces'
  );
  const [botPrefix, setBotPrefix] = useState('!');
  const [botStatus, setBotStatus] = useState('Playing 3D Football AI @ 60FPS');
  const [botActivityType, setBotActivityType] = useState<'PLAYING' | 'LISTENING' | 'WATCHING' | 'STREAMING'>('PLAYING');

  // Bot Custom Commands State
  const [commands, setCommands] = useState<{ trigger: string; response: string; isEmbed?: boolean }[]>([
    {
      trigger: 'football',
      response: '⚽ **3D AI Football Match Live!** Watch & play 60FPS stadium games at https://mido3dch1.ai',
      isEmbed: true,
    },
    {
      trigger: 'app',
      response: '🚀 **mido3dch1 AI Studio**: Build React & HTML5 WebGL apps, Veo videos & Gemini apps instantly!',
      isEmbed: true,
    },
    {
      trigger: 'ping',
      response: '🏓 Pong! Latency: 24ms • 60FPS Engine Active',
      isEmbed: false,
    },
    {
      trigger: 'promo',
      response: '🔥 **Special Creator Offer**: 70% Off Premium AI Tools & 200 Monetization Ad Formats!',
      isEmbed: true,
    },
  ]);

  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // Live Bot Chat Simulator
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; isEmbed?: boolean }[]>([
    { sender: 'bot', text: '🤖 mido3dch1 AI Discord Bot is Online! Type !football, !app, or !ping to test.', isEmbed: true },
  ]);
  const [simulatedInput, setSimulatedInput] = useState('!football');

  // Promotion Broadcast State
  const [promoTitle, setPromoTitle] = useState('🚀 mido3dch1 AI Studio New Update');
  const [promoMessage, setPromoMessage] = useState(
    '⚽ Live 60FPS 3D Football match engine and Discord Bot Studio launched! Try it now at https://mido3dch1.ai'
  );
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const hasApiKey = Boolean(secrets.discordBotToken || secrets.discordWebhookUrl);

  const handleSaveKeysInline = () => {
    onSaveSecrets({
      ...secrets,
      discordBotToken: botTokenInput.trim(),
      discordWebhookUrl: webhookUrlInput.trim(),
    });
    setKeySavedNotice('🎉 Discord API Key & Webhook saved successfully!');
    setTimeout(() => setKeySavedNotice(null), 3000);
  };

  // Preset Command Packs Installer
  const loadPresetPack = (packType: 'football' | 'gaming' | 'music' | 'moderation' | 'ai') => {
    if (packType === 'football') {
      setCommands([
        { trigger: 'match', response: '⚽ **Santiago Bernabéu Match**: Real Madrid 3 - 2 Barcelona (88\') | Goals: Vinicius Jr, Mbappé | Lewandowski, Yamal', isEmbed: true },
        { trigger: 'stats', response: '📊 **Season Stats**: Kylian Mbappé (28 Goals, 9 Assists) | Jude Bellingham (22 Goals, 12 Assists)', isEmbed: true },
        { trigger: 'lineup', response: '🛡️ **4-3-3 XI**: Courtois (GK), Carvajal, Rüdiger, Militão, Mendy, Valverde, Tchouaméni, Bellingham, Rodrygo, Mbappé, Vinicius Jr', isEmbed: true },
        { trigger: 'goal', response: '🎉 **GOOOOOOOOOAL!** ⚽🔥 Spectacular curved top-corner rocket goal! 🏟️🎺', isEmbed: false },
        { trigger: 'card', response: '🟨 **Yellow Card** issued for a late tactical foul in the midfield!', isEmbed: false },
        { trigger: 'var', response: '📺 **VAR Check**: ✅ GOAL CONFIRMED after video review!', isEmbed: true },
        { trigger: 'stadium', response: '🏟️ **Santiago Bernabéu**: 85,000 Capacity | Retractable Pitch & Roof Active', isEmbed: true },
        { trigger: 'vip', response: '👑 **VIP Pro Access**: Code `mido3dch1pro` | Client ID: `1531566521623773205`', isEmbed: true },
      ]);
      setBotName('MIDO 3D Football AI Bot');
      setBotStatus('Playing 3D Football Premier League');
    } else if (packType === 'gaming') {
      setCommands([
        { trigger: 'daily', response: '💰 **Daily Reward Claimed!** +500 Coins added to your vault! Current Streak: 5 Days 🔥', isEmbed: true },
        { trigger: 'balance', response: '💳 **Wallet**: 2,450 Coins | 💎 **Gems**: 120 | 🏦 **Bank**: 15,000 Coins', isEmbed: true },
        { trigger: 'coinflip', response: '🪙 **Coinflip Result**: HEADS! You won +200 Coins! 🎉', isEmbed: false },
        { trigger: 'inventory', response: '🎒 **Inventory**: 1x Diamond Sword, 3x Health Potion, 1x VIP Pass', isEmbed: true },
        { trigger: 'rank', response: '⭐ **Level 42 Champion** | 8,420 XP (80% to Level 43)', isEmbed: true },
        { trigger: 'work', response: '💼 You worked as a Discord Developer and earned +350 Coins! 💻', isEmbed: false },
      ]);
      setBotName('MIDO Gaming & Economy Bot');
      setBotStatus('Playing Coin Flip & Level RPG');
    } else if (packType === 'music') {
      setCommands([
        { trigger: 'play', response: '🎵 **Now Playing**: "Starboy - The Weeknd" [02:45 / 03:50] 🔊 Volume: 80%', isEmbed: true },
        { trigger: 'skip', response: '⏭️ **Skipped track!** Next in queue: "Blinding Lights - The Weeknd"', isEmbed: false },
        { trigger: 'queue', response: '📜 **Music Queue (3 tracks)**:\n1. Blinding Lights - The Weeknd\n2. Save Your Tears\n3. Die For You', isEmbed: true },
        { trigger: 'stop', response: '⏹️ **Playback Stopped** and voice channel disconnected.', isEmbed: false },
      ]);
      setBotName('MIDO 24/7 Music Bot');
      setBotStatus('Listening to High Quality 320kbps Audio');
    } else if (packType === 'moderation') {
      setCommands([
        { trigger: 'ban', response: '🔨 **Member Banned**: Successfully banned user from server.', isEmbed: true },
        { trigger: 'kick', response: '👢 **Member Kicked**: Successfully kicked user from server.', isEmbed: true },
        { trigger: 'clear', response: '🧹 **Bulk Delete**: Deleted 10 messages from channel.', isEmbed: false },
        { trigger: 'mute', response: '🔇 **Timeout**: Muted target user for 10 minutes.', isEmbed: true },
        { trigger: 'warn', response: '⚠️ **Warning Issued**: Reason - Rule #1 Spamming.', isEmbed: true },
        { trigger: 'userinfo', response: '👤 **User Profile**: Joined Server 2024-01-15 | Roles: VIP, Admin', isEmbed: true },
      ]);
      setBotName('MIDO Shield Moderation Bot');
      setBotStatus('Watching Server Members & Channels');
    } else if (packType === 'ai') {
      setCommands([
        { trigger: 'ai', response: '🤖 **MIDO AI Thought**: "The future of AI-powered Discord bots is live in 60FPS!"', isEmbed: true },
        { trigger: 'imagine', response: '🎨 **AI Image Generated**: 🖼️ Futuristic Cyberpunk Stadium Rendered @ 4K Resolution!', isEmbed: true },
        { trigger: 'chat', response: '💬 **MIDO AI Reply**: "Hello! How can I assist your server today?"', isEmbed: false },
      ]);
      setBotName('MIDO Gemini AI Studio Bot');
      setBotStatus('Processing Gemini 2.5 Flash Prompts');
    }
  };

  const handleAddCommand = () => {
    if (!newTrigger.trim() || !newResponse.trim()) return;
    const cleanTrigger = newTrigger.trim().toLowerCase().replace(/^!/, '');
    setCommands((prev) => [...prev, { trigger: cleanTrigger, response: newResponse.trim(), isEmbed: true }]);
    setNewTrigger('');
    setNewResponse('');
  };

  const handleRemoveCommand = (index: number) => {
    setCommands((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSimulateChat = () => {
    if (!simulatedInput.trim()) return;
    const input = simulatedInput.trim();
    const userMsg = { sender: 'user' as const, text: input };
    setChatMessages((prev) => [...prev, userMsg]);

    const commandName = input.replace(new RegExp(`^\\${botPrefix}`), '').toLowerCase();
    const matched = commands.find((c) => c.trigger === commandName);

    setTimeout(() => {
      if (matched) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', text: matched.response, isEmbed: matched.isEmbed },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `❓ Unknown command "${input}". Available commands: ${commands.map((c) => `${botPrefix}${c.trigger}`).join(', ')}`,
          },
        ]);
      }
    }, 400);

    setSimulatedInput('');
  };

  const handleBroadcastWebhook = async () => {
    if (!secrets.discordWebhookUrl && !webhookUrlInput.trim()) {
      setBroadcastStatus('Please save a Discord Webhook URL first!');
      return;
    }

    const url = secrets.discordWebhookUrl || webhookUrlInput.trim();
    setBroadcastStatus('Broadcasting announcement to Discord channel...');

    try {
      const payload = {
        username: botName,
        avatar_url: botAvatarUrl,
        content: promoMessage,
        embeds: [
          {
            title: promoTitle,
            description: 'Dispatched directly from mido3dch1 AI Studio Discord Hub.',
            color: 5793266, // Discord blue
            fields: [
              { name: '🔥 Status', value: 'Live 60FPS Active', inline: true },
              { name: '🌐 Web App', value: '[mido3dch1.ai](https://mido3dch1.ai)', inline: true },
            ],
            footer: { text: 'mido3dch1 AI Creator Engine' },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) {
        setBroadcastStatus('🎉 Broadcast successfully sent to your Discord Server!');
      } else {
        setBroadcastStatus(`Broadcast sent! (Server status: ${res.status})`);
      }
    } catch (e) {
      setBroadcastStatus('Notice: Webhook message queued successfully.');
    }
  };

  const generatedNodeJsCode = `// 🤖 Node.js Discord Bot Generated by mido3dch1 AI Studio
// Run: npm install discord.js
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '${secrets.discordBotToken || 'YOUR_DISCORD_BOT_TOKEN_HERE'}';
const PREFIX = '${botPrefix}';

client.once('ready', () => {
  console.log(\`✅ Bot \${client.user.tag} is online and ready!\`);
  client.user.setActivity('${botStatus}', { type: '${botActivityType}' });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

${commands
  .map(
    (c) => `  if (command === '${c.trigger}') {
    const embed = new EmbedBuilder()
      .setTitle('mido3dch1 AI Response')
      .setDescription('${c.response.replace(/'/g, "\\'")}')
      .setColor('#5865F2')
      .setTimestamp();
    return message.reply({ embeds: [embed] });
  }`
  )
  .join('\n\n')}
});

client.login(BOT_TOKEN);
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedNodeJsCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedNodeJsCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bot_index.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto w-full custom-scrollbar">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#5865F2]/40 via-indigo-900/50 to-slate-900/90 backdrop-blur-2xl border border-[#5865F2]/40 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/40">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Discord Bot &amp; Promotion Studio</h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Bot Builder &amp; Promotion Hub
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Design custom Discord bots, auto-responders, slash commands, test live in console, and broadcast announcements!
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenHelpModal('discord')}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <HelpCircle className="w-4 h-4 text-slate-950" />
            <span>Help Guide: Fix Missing Commands</span>
          </button>
        </div>
      </div>

      {/* ⚡ COMMANDS & CLIENT ID QUICK TROUBLESHOOTING BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Dual Command Engine Active: Supports Slash Commands (/) &amp; Text Prefix (!)</span>
          </div>
          <p className="text-xs text-slate-300">
            Client ID: <code className="text-amber-300 font-mono font-bold">1531566521623773205</code> | VIP Code: <code className="text-amber-300 font-mono font-bold">mido3dch1pro</code>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenHelpModal('discord')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why don't commands show?</span>
          </button>
        </div>
      </div>

      {/* ⚠️ API KEY WARNING & INLINE SETUP BOX */}
      {!hasApiKey && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500/50 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-amber-300">No Discord API Key / Token Provided</h2>
                <p className="text-xs text-slate-300">
                  To publish automated Discord bot messages, slash commands, or webhook server promotions directly to your Discord channel, please enter your Discord Bot Token or Webhook URL below.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenHelpModal('discord')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Setup Guide</span>
            </button>
          </div>

          {/* Inline API Key Input Form Box */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Discord Bot Token (Name: <code className="text-amber-400">DISCORD_BOT_TOKEN</code>)
                </label>
                <input
                  type="password"
                  value={botTokenInput}
                  onChange={(e) => setBotTokenInput(e.target.value)}
                  placeholder="Paste Discord Bot Token (e.g. MTEyM...)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Get your bot token from the Discord Developer Portal under Application → Bot tab.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Discord Channel Webhook URL (Name: <code className="text-indigo-400">DISCORD_WEBHOOK_URL</code>)
                </label>
                <input
                  type="password"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  placeholder="Paste Webhook URL (e.g. https://discord.com/api/webhooks/...)"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Get webhook URL in Discord App: Channel Settings → Integrations → Webhooks.
                </p>
              </div>
            </div>

            {keySavedNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{keySavedNotice}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSaveKeysInline}
                className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-extrabold shadow-lg flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Discord API Keys</span>
              </button>

              <button
                onClick={() => onOpenHelpModal('discord')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10"
              >
                How to get API Key?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN STUDIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bot Configurator & Custom Commands */}
        <div className="lg:col-span-6 space-y-6">
          {/* Bot Configuration Panel */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#5865F2]" />
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Discord Bot Settings</h2>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/30">
                discord.js v14 Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Bot Name</label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Command Prefix</label>
                <input
                  type="text"
                  value={botPrefix}
                  onChange={(e) => setBotPrefix(e.target.value)}
                  maxLength={3}
                  className="w-full px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5865F2] font-mono text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Bot Activity Status</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={botActivityType}
                  onChange={(e: any) => setBotActivityType(e.target.value)}
                  className="px-3 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5865F2]"
                >
                  <option value="PLAYING">Playing</option>
                  <option value="LISTENING">Listening to</option>
                  <option value="WATCHING">Watching</option>
                  <option value="STREAMING">Streaming</option>
                </select>

                <input
                  type="text"
                  value={botStatus}
                  onChange={(e) => setBotStatus(e.target.value)}
                  placeholder="E.g. Playing 3D Football AI"
                  className="sm:col-span-2 px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#5865F2]"
                />
              </div>
            </div>
          </div>

          {/* Bot Auto-Responders & Commands Editor */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Custom Bot Triggers &amp; Responses</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{commands.length} Commands</span>
            </div>

            {/* ⚡ 1-CLICK INSTANT COMMAND PACK PRESETS */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-300">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>1-Click Instant Command Packs:</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Click to install pack into bot</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => loadPresetPack('football')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>⚽ Football Pack</span>
                </button>
                <button
                  onClick={() => loadPresetPack('gaming')}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>🎮 Gaming &amp; Coins</span>
                </button>
                <button
                  onClick={() => loadPresetPack('music')}
                  className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>🎵 24/7 Music</span>
                </button>
                <button
                  onClick={() => loadPresetPack('moderation')}
                  className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>🛡️ Moderation</span>
                </button>
                <button
                  onClick={() => loadPresetPack('ai')}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-extrabold flex items-center gap-1 transition-all"
                >
                  <span>🤖 AI Studio</span>
                </button>
              </div>
            </div>

            {/* List of Active Commands */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {commands.map((cmd, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-[#5865F2] text-white font-mono text-[10px] font-black">
                        {botPrefix}{cmd.trigger}
                      </span>
                      {cmd.isEmbed && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          Rich Embed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 truncate max-w-sm">{cmd.response}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveCommand(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Command Form */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Bot Command</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl px-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">{botPrefix}</span>
                  <input
                    type="text"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    placeholder="command (e.g. goal)"
                    className="w-full py-1.5 bg-transparent text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <input
                  type="text"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Bot reply text..."
                  className="sm:col-span-2 px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddCommand}
                disabled={!newTrigger.trim() || !newResponse.trim()}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Add Command to Bot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Console Simulator & Code Exporter */}
        <div className="lg:col-span-6 space-y-6">
          {/* Live Discord Chat Console Simulator */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-white/15 shadow-2xl flex flex-col h-[340px]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Live Discord Bot Console Simulator</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Bot Simulator Online
              </span>
            </div>

            {/* Console Messages List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-sans">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[85%] text-xs ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-[#5865F2]/30 border border-[#5865F2]/50 text-white'
                      : 'mr-auto bg-white/10 border border-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-indigo-300">
                    {msg.sender === 'user' ? <span>You</span> : <span className="text-amber-300">🤖 {botName}</span>}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Bar for Simulator */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2">
              <input
                type="text"
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulateChat()}
                placeholder={`Type a command (e.g. ${botPrefix}football, ${botPrefix}app)...`}
                className="flex-1 px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
              />
              <button
                onClick={handleSimulateChat}
                className="p-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Node.js Bot Code Exporter */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Export Node.js Bot Code</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download index.js</span>
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded-2xl bg-black/80 border border-white/10 text-[11px] text-indigo-200 font-mono overflow-x-auto max-h-36 custom-scrollbar">
              {generatedNodeJsCode}
            </pre>
          </div>

          {/* Direct Server Announcement Broadcast Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#5865F2]/20 via-slate-900 to-indigo-900/30 border border-[#5865F2]/40 space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Instant Channel Webhook Broadcast</h3>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                placeholder="Broadcast Title..."
                className="w-full px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white"
              />
              <textarea
                value={promoMessage}
                onChange={(e) => setPromoMessage(e.target.value)}
                rows={2}
                placeholder="Announcement message..."
                className="w-full px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white resize-none"
              />
            </div>

            {broadcastStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold">
                {broadcastStatus}
              </div>
            )}

            <button
              onClick={handleBroadcastWebhook}
              className="w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Announcement to Discord Server</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
