import React, { useState } from 'react';
import { UserSecrets } from '../types';
import {
  Bot,
  Plus,
  Trash2,
  Terminal,
  Send,
  Code2,
  Check,
  Copy,
  Save,
  Zap,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Server,
  Play,
} from 'lucide-react';

interface InlineDiscordBotMakerProps {
  secrets?: UserSecrets;
  onSaveSecrets?: (secrets: UserSecrets) => void;
  onSendPrompt?: (prompt: string) => void;
  onOpenHelpModal?: (tab?: 'discord' | 'youtube' | 'gemini' | 'mido') => void;
}

export const InlineDiscordBotMaker: React.FC<InlineDiscordBotMakerProps> = ({
  secrets,
  onSaveSecrets,
  onSendPrompt,
  onOpenHelpModal,
}) => {
  const [botName, setBotName] = useState('mido-moderation-bot');
  const [prefix, setPrefix] = useState('!');
  const [botToken, setBotToken] = useState(secrets?.discordBotToken || 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw');
  const [clientId, setClientId] = useState(secrets?.discordClientId || '1531566521623773205');
  const [webhookUrl, setWebhookUrl] = useState(secrets?.discordWebhookUrl || '');
  const [isSaved, setIsSaved] = useState(false);
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);

  const [commands, setCommands] = useState<{ trigger: string; response: string; isSlash: boolean }[]>([
    { trigger: 'ban', response: '🔨 Banned target user from server.', isSlash: true },
    { trigger: 'kick', response: '👢 Kicked target user from server.', isSlash: true },
    { trigger: 'mute', response: '🔇 Muted target user for specified duration.', isSlash: true },
    { trigger: 'clear', response: '🧹 Bulk deleted messages in channel.', isSlash: true },
    { trigger: 'warn', response: '⚠️ Issued formal warning to target user.', isSlash: true },
    { trigger: 'userinfo', response: '👤 Displayed user roles and joined date.', isSlash: true },
    { trigger: 'ping', response: '🏓 Pong! Latency: 24ms.', isSlash: true },
    { trigger: 'help', response: '🛡️ Available slash commands: /ban, /kick, /mute, /clear, /warn, /userinfo, /ping, /help', isSlash: true },
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');

  // Simulator
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: '🤖 Discord Slash Bot ready! Type /ban @user, /kick @user, /clear 10, or /help to test!' },
  ]);
  const [testInput, setTestInput] = useState('/help');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleAddCommand = () => {
    if (!newTrigger.trim() || !newResponse.trim()) return;
    const cleanTrigger = newTrigger.trim().toLowerCase().replace(/^[\/!]/, '');
    setCommands((prev) => [
      ...prev,
      { trigger: cleanTrigger, response: newResponse.trim(), isSlash: true },
    ]);
    setNewTrigger('');
    setNewResponse('');
  };

  const handleRemoveCommand = (idx: number) => {
    setCommands((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTestChat = () => {
    if (!testInput.trim()) return;
    const input = testInput.trim();
    setChatLog((prev) => [...prev, { sender: 'user', text: input }]);

    const cmdName = input.replace(/^[\/!]/, '').split(' ')[0].toLowerCase();
    const matched = commands.find((c) => c.trigger === cmdName);

    setTimeout(() => {
      if (matched) {
        setChatLog((prev) => [...prev, { sender: 'bot', text: matched.response }]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { sender: 'bot', text: `❓ Command "${input}" not recognized. Available slash commands: ${commands.map((c) => '/' + c.trigger).join(', ')}` },
        ]);
      }
    }, 250);

    setTestInput('');
  };

  const handleSaveBotKeys = () => {
    if (onSaveSecrets && secrets) {
      onSaveSecrets({
        ...secrets,
        discordBotToken: botToken.trim(),
        discordClientId: clientId.trim() || '1531566521623773205',
        discordWebhookUrl: webhookUrl.trim(),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const activeToken = secrets?.discordBotToken || botToken || 'YOUR_DISCORD_BOT_TOKEN_HERE';

  const fullDiscordJsCode = `// discord.js v14 - Complete Discord Bot with Slash Commands & 24/7 Keep-Alive
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const http = require('http');

const BOT_TOKEN = '${activeToken}';
const CLIENT_ID = '${clientId || 'YOUR_DISCORD_CLIENT_ID_HERE'}';

// 1. Keep-Alive Server (Keeps Bot Online 24/7)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('🤖 Discord Bot is Live & Online 24/7!');
}).listen(process.env.PORT || 3000, () => {
  console.log('⚡ Keep-Alive server listening on port 3000');
});

// 2. Define Slash Commands
const slashCommands = [
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member').addUserOption(o => o.setName('target').setDescription('Member to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member').addUserOption(o => o.setName('target').setDescription('Member to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('mute').setDescription('Mute/timeout member').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes')),
  new SlashCommandBuilder().setName('clear').setDescription('Delete messages').addIntegerOption(o => o.setName('amount').setDescription('1-100 messages').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Warn member').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('userinfo').setDescription('User details').addUserOption(o => o.setName('target').setDescription('Target user')),
  new SlashCommandBuilder().setName('ping').setDescription('Check latency'),
  new SlashCommandBuilder().setName('help').setDescription('Show slash commands'),
].map(c => c.toJSON());

// 3. Register Slash Commands via Discord REST API
async function deploySlashCommands() {
  if (!CLIENT_ID || CLIENT_ID.includes('YOUR_DISCORD_CLIENT_ID')) {
    console.log('⚠️ Please insert your Client ID to auto-deploy Slash Commands to Discord REST API!');
    return;
  }
  try {
    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    console.log('🔄 Deploying Slash Commands to Discord...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: slashCommands });
    console.log('✅ Successfully deployed / commands to Discord!');
  } catch (err) {
    console.error('❌ Failed to deploy slash commands:', err);
  }
}

// 4. Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  console.log(\`🤖 Logged in as \${client.user.tag}! Bot is ALWAYS ONLINE.\`);
  client.user.setActivity('Guarding Server • /help', { type: 0 });
  await deploySlashCommands();
});

// 5. Interaction Handler (Slash Commands)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to ban members!', ephemeral: true });
    }
    const target = options.getMember('target');
    const reason = options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ content: '⚠️ User not found in server.', ephemeral: true });
    await target.ban({ reason });
    return interaction.reply(\`🔨 **Banned \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to kick members!', ephemeral: true });
    }
    const target = options.getMember('target');
    const reason = options.getString('reason') || 'No reason provided';
    if (!target) return interaction.reply({ content: '⚠️ User not found in server.', ephemeral: true });
    await target.kick(reason);
    return interaction.reply(\`👢 **Kicked \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (commandName === 'mute') {
    const target = options.getMember('target');
    const minutes = options.getInteger('minutes') || 10;
    if (!target) return interaction.reply({ content: '⚠️ User not found.', ephemeral: true });
    await target.timeout(minutes * 60 * 1000, 'Muted by mod');
    return interaction.reply(\`🔇 **Muted \${target.user.tag}** for \${minutes} minutes.\`);
  }

  if (commandName === 'clear') {
    const amount = options.getInteger('amount') || 10;
    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: \`🧹 Deleted **\${amount}** messages.\`, ephemeral: true });
  }

  if (commandName === 'ping') {
    return interaction.reply(\`🏓 Pong! Latency: \${Date.now() - interaction.createdTimestamp}ms\`);
  }

  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Bot Moderation Suite Slash Commands')
      .setColor('#5865F2')
      .setDescription('Use typing \`/\` in Discord server to access:\\n• \`/ban\`\\n• \`/kick\`\\n• \`/mute\`\\n• \`/clear\`\\n• \`/warn\`\\n• \`/userinfo\`\\n• \`/ping\`\\n• \`/help\`');
    return interaction.reply({ embeds: [embed] });
  }
});

client.login(BOT_TOKEN);`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullDiscordJsCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-[#5865F2]/50 shadow-2xl space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#5865F2] text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>Discord Slash Command Bot Maker</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                / Slash Ready
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Auto-deploys /ban, /kick, /mute, /clear slash commands to Discord!
            </p>
          </div>
        </div>

        {onOpenHelpModal && (
          <button
            onClick={() => onOpenHelpModal('discord')}
            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bot Token &amp; OAuth2 Guide</span>
          </button>
        )}
      </div>

      {/* Critical Explanation Banner for Slash Commands */}
      <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-xs space-y-1.5">
        <div className="font-extrabold text-indigo-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Why slash commands (/) didn't show up in your Discord server:</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          1. **`applications.commands` Scope**: When creating your Discord bot invite link, you MUST check both **`bot`** AND **`applications.commands`** scope!<br />
          2. **REST Deployer**: Discord requires Slash Commands to be deployed to Discord's REST API using your Bot Token &amp; Application ID (Client ID).
        </p>
      </div>

      {/* Inputs for Token & Client ID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">Discord Bot Token</label>
          <input
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="Paste MTE... token here"
            className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">Application / Client ID (For / Slash Commands)</label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 123456789012345678"
            className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white font-mono"
          />
        </div>
      </div>

      {/* Active Commands Badge Grid */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-emerald-300 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Configured / Slash Commands ({commands.length})</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {commands.map((cmd, i) => (
            <div key={i} className="p-2 rounded-xl bg-black/50 border border-white/10 text-xs flex items-center justify-between">
              <span className="font-mono font-extrabold text-indigo-300">
                /{cmd.trigger}
              </span>
              <button
                onClick={() => handleRemoveCommand(i)}
                className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Live Slash Simulator */}
      <div className="p-3 rounded-2xl bg-black/80 border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-white/10 pb-1">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Slash Command Simulator
          </span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            24/7 Always Online
          </span>
        </div>

        <div className="space-y-1.5 max-h-24 overflow-y-auto text-xs font-sans">
          {chatLog.map((m, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-xl text-xs ${
                m.sender === 'user' ? 'bg-[#5865F2]/20 text-white font-mono' : 'bg-white/10 text-slate-200'
              }`}
            >
              <strong className="text-indigo-300">{m.sender === 'user' ? 'You' : `🤖 ${botName}`}: </strong>
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
            placeholder="Type /ban @user or /help..."
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
          />
          <button
            onClick={handleTestChat}
            className="p-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible discord.js Code Drawer (As Requested: Don't blurt out scripts, only show discord.js clickable drawer!) */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60">
        <button
          type="button"
          onClick={() => setShowCodeDrawer(!showCodeDrawer)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>📄 discord.js Code File (Click to Expand / Collapse)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-normal">
            <span>{showCodeDrawer ? 'Hide Code' : 'View Script'}</span>
            {showCodeDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showCodeDrawer && (
          <div className="p-3 border-t border-white/10 bg-slate-950">
            <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400 font-mono">
              <span>filename: bot.js / discord.js</span>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-xs flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-black rounded-xl text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-60 leading-relaxed border border-white/10">
              {fullDiscordJsCode}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
        <button
          onClick={handleSaveBotKeys}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Token Saved!' : 'Save Token'}</span>
        </button>

        <button
          onClick={handleCopyCode}
          className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copiedCode ? 'Copied' : 'Copy discord.js Script'}</span>
        </button>
      </div>
    </div>
  );
};

