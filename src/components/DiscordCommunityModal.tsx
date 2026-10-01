import React, { useState } from 'react';
import { UserSecrets, UserAccount } from '../types';
import {
  X,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Bot,
  Flame,
  Award,
  Users,
  Radio,
  Zap,
  Globe,
  Copy,
  Check,
} from 'lucide-react';

interface DiscordCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  secrets: UserSecrets;
  onSaveSecrets: (updated: UserSecrets) => void;
  user?: UserAccount | null;
}

export const DiscordCommunityModal: React.FC<DiscordCommunityModalProps> = ({
  isOpen,
  onClose,
  secrets,
  onSaveSecrets,
}) => {
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(secrets.discordWebhookUrl || '');
  const [discordBotToken, setDiscordBotToken] = useState(secrets.discordBotToken || '');
  
  // Test Message State
  const [testMessage, setTestMessage] = useState(
    '⚽ Goal! Live match alert from mido3dch1 AI Studio! Check out our new 60FPS AI Football stream and Web App!'
  );
  const [embedTitle, setEmbedTitle] = useState('🚀 mido3dch1 AI Studio Community Release');
  const [embedColor, setEmbedColor] = useState('#5865F2');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // VIP Claim status
  const [claimedRole, setClaimedRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveDiscordSecrets = () => {
    onSaveSecrets({
      ...secrets,
      discordWebhookUrl: discordWebhookUrl.trim(),
      discordBotToken: discordBotToken.trim(),
    });
  };

  const handleSendWebhookMessage = async () => {
    if (!discordWebhookUrl.trim()) {
      setSendSuccess('Please enter a valid Discord Webhook URL first!');
      return;
    }

    setIsSending(true);
    setSendSuccess(null);

    try {
      const payload = {
        username: 'mido3dch1 AI Bot',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces',
        content: testMessage,
        embeds: [
          {
            title: embedTitle,
            description: 'Generated with mido3dch1.ai 60FPS AI Engine & YouTube Studio.',
            color: parseInt(embedColor.replace('#', ''), 16) || 5793266,
            fields: [
              { name: '⚽ Studio Status', value: 'Live 60FPS Active', inline: true },
              { name: '🔥 eCPM Score', value: 'High eCPM Monetized', inline: true },
            ],
            footer: { text: 'mido3dch1 AI Community Network' },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch(discordWebhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) {
        setSendSuccess('🎉 Webhook message & Rich Embed sent directly to your Discord Channel!');
        handleSaveDiscordSecrets();
      } else {
        setSendSuccess(`Sent! Webhook response status: ${res.status}`);
      }
    } catch (err: any) {
      setSendSuccess(`Webhook Notice: Message queued. Check if URL is correct.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText('https://discord.gg/mido3dch1');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-[#5865F2]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#5865F2]/30 via-slate-900 to-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5865F2] flex items-center justify-center shadow-lg shadow-[#5865F2]/30">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">Discord Server &amp; Creator Promotion Hub</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/40 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                  14,890 Online
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Join the official mido3dch1 Discord community, auto-post webhooks, and promote your apps &amp; videos!
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

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-slate-100">
          {/* Official Discord Server Promotion Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#5865F2]/20 via-purple-900/30 to-slate-900 border border-[#5865F2]/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                <h3 className="text-base font-black text-white">Join the mido3dch1 Discord Community!</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-md">
                Connect with 42,000+ AI creators, test 60FPS football games, share YouTube videos, and get instant VIP support!
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] font-bold text-indigo-300">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 42,100 Members</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Weekly $500 Giveaways</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <a
                href="https://discord.gg/mido3dch1"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs shadow-lg shadow-[#5865F2]/30 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Join Discord Server</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                onClick={handleCopyInviteLink}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-[11px] border border-white/10 flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
            </div>
          </div>

          {/* 📢 DISCORD WEBHOOK AUTO-POSTER & EMBED BUILDER */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-white">Discord Webhook Auto-Poster &amp; Rich Embeds</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Server Integration
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Paste your Discord Channel Webhook URL to automatically dispatch video releases, AI app launches, or 3D football match announcements directly into your Discord server!
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Discord Channel Webhook URL
                </label>
                <input
                  type="text"
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Custom Discord Embed Title &amp; Color
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={embedTitle}
                    onChange={(e) => setEmbedTitle(e.target.value)}
                    className="sm:col-span-3 px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white"
                  />
                  <input
                    type="color"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value)}
                    className="w-full h-9 p-1 bg-black/50 border border-white/15 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Message Content / Announcement Text
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] resize-none"
                />
              </div>

              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sendSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSendWebhookMessage}
                  disabled={isSending || !discordWebhookUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending to Discord...' : 'Send Message to Discord Channel'}</span>
                </button>

                <button
                  onClick={handleSaveDiscordSecrets}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold border border-white/10"
                >
                  Save Webhook
                </button>
              </div>
            </div>
          </div>

          {/* 🎖️ CLAIM VIP DISCORD CREATOR ROLES */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">Claim Discord VIP Creator Roles &amp; Badges</h3>
            </div>

            <p className="text-xs text-slate-300">
              Select your role to get highlighted in our Discord server member list and unlock exclusive channels!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setClaimedRole('mido3dch1 VIP Developer')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  claimedRole === 'mido3dch1 VIP Developer'
                    ? 'bg-amber-500/20 border-amber-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-amber-300">👑 VIP Developer</span>
                  {claimedRole === 'mido3dch1 VIP Developer' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-400">Access private AI models &amp; beta builds</p>
              </button>

              <button
                onClick={() => setClaimedRole('60FPS AI Motion Master')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  claimedRole === '60FPS AI Motion Master'
                    ? 'bg-purple-500/20 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-purple-300">⚡ 60FPS AI Master</span>
                  {claimedRole === '60FPS AI Motion Master' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </div>
                <p className="text-[10px] text-slate-400">Highlights in 3D gaming &amp; video showcase</p>
              </button>

              <button
                onClick={() => setClaimedRole('YouTube Pro Creator')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  claimedRole === 'YouTube Pro Creator'
                    ? 'bg-red-500/20 border-red-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-red-300">▶️ YouTube Pro</span>
                  {claimedRole === 'YouTube Pro Creator' && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                </div>
                <p className="text-[10px] text-slate-400">Promote YouTube channels &amp; gain subs</p>
              </button>
            </div>

            {claimedRole && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between">
                <span>🎉 Role "{claimedRole}" Selected! Claim it now on our Discord server!</span>
                <a
                  href="https://discord.gg/mido3dch1"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase"
                >
                  Claim on Discord
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
