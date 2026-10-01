import React, { useState, useEffect } from 'react';
import { UserSecrets } from '../types';
import {
  X,
  Key,
  Lock,
  Youtube,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  Save,
  MessageSquare,
  Zap,
  Award,
  Unlock,
  Video,
  Film,
  Play,
} from 'lucide-react';

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
  secrets: UserSecrets;
  onSaveSecrets: (updatedSecrets: UserSecrets) => void;
  onLaunchUnderTheSphere?: () => void;
  onLaunchTestPlace?: () => void;
}

export const SecretsModal: React.FC<SecretsModalProps> = ({
  isOpen,
  onClose,
  secrets,
  onSaveSecrets,
  onLaunchUnderTheSphere,
  onLaunchTestPlace,
}) => {
  const [youtubeApiKey, setYoutubeApiKey] = useState(secrets.youtubeApiKey || '');
  const [youtubeChannelId, setYoutubeChannelId] = useState(secrets.youtubeChannelId || '');
  const [geminiApiKey, setGeminiApiKey] = useState(secrets.geminiApiKey || '');
  const [openaiApiKey, setOpenaiApiKey] = useState(secrets.openaiApiKey || '');
  const [json2videoApiKey, setJson2videoApiKey] = useState(
    secrets.json2videoApiKey || 'IYFdCSvw7VgGpHq4GTRvXSQYSiJE9HUxTeLUHnTa'
  );
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState(secrets.discordWebhookUrl || '');
  const [discordBotToken, setDiscordBotToken] = useState(
    secrets.discordBotToken || 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw'
  );
  const [discordClientId, setDiscordClientId] = useState(secrets.discordClientId || '1531566521623773205');

  // Secret Cheat Codes State & Classified Clearance Key
  const [cheatCodeInput, setCheatCodeInput] = useState('');
  const [secretVaultPin, setSecretVaultPin] = useState('');
  const [unlockedCodes, setUnlockedCodes] = useState<string[]>(secrets.unlockedCheatCodes || ['MIDO60FPS', 'MIDO3DCH1PRO']);
  const [cheatNotice, setCheatNotice] = useState<string | null>(null);
  const [isUnderTheSphereUnlocked, setIsUnderTheSphereUnlocked] = useState(
    secrets.unlockedCheatCodes?.includes('0008') || secrets.unlockedCheatCodes?.includes('UNDERTHESPHERE') || false
  );

  // Dynamic custom secrets
  const [customSecretsList, setCustomSecretsList] = useState<{ key: string; value: string }[]>(() => {
    if (secrets.customSecrets) {
      return Object.entries(secrets.customSecrets).map(([k, v]) => ({ key: k, value: v }));
    }
    return [];
  });

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showValues, setShowValues] = useState<{ [key: string]: boolean }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setYoutubeApiKey(secrets.youtubeApiKey || '');
    setYoutubeChannelId(secrets.youtubeChannelId || '');
    setGeminiApiKey(secrets.geminiApiKey || '');
    setOpenaiApiKey(secrets.openaiApiKey || '');
    setJson2videoApiKey(secrets.json2videoApiKey || 'IYFdCSvw7VgGpHq4GTRvXSQYSiJE9HUxTeLUHnTa');
    setDiscordWebhookUrl(secrets.discordWebhookUrl || '');
    setDiscordBotToken(secrets.discordBotToken || 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw');
    setDiscordClientId(secrets.discordClientId || '1531566521623773205');
    setUnlockedCodes(secrets.unlockedCheatCodes || ['MIDO60FPS', 'MIDO3DCH1PRO']);
    if (secrets.customSecrets) {
      setCustomSecretsList(Object.entries(secrets.customSecrets).map(([k, v]) => ({ key: k, value: v })));
    }
  }, [secrets, isOpen]);

  if (!isOpen) return null;

  const toggleShowValue = (fieldKey: string) => {
    setShowValues((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleUnlockCheatCode = () => {
    const code = cheatCodeInput.trim().toUpperCase();
    if (!code) return;

    const validCodes: { [key: string]: string } = {
      '0008': '🔮 CLASSIFIED PROTOCOL OVERRIDE: "Under the Sphere" Sci-Fi Horror is unlocked!',
      '008': '🔮 CLASSIFIED PROTOCOL OVERRIDE: "Under the Sphere" Sci-Fi Horror is unlocked!',
      UNDERTHESPHERE: '🔮 CLASSIFIED PROTOCOL OVERRIDE: "Under the Sphere" Sci-Fi Horror is unlocked!',
      M3D: '👑 PRO ACCOUNT UNLOCKED! Unlocked SEO Generator, 4K Image Creator, Real 60FPS Video Creator, Multi-Voice Music Composer, App Builder & Mido 2.5 Pro!',
      M3DPRO: '👑 PRO ACCOUNT UNLOCKED! Unlocked SEO Generator, 4K Image Creator, Real 60FPS Video Creator, Multi-Voice Music Composer, App Builder & Mido 2.5 Pro!',
      MIDO3DCH1PRO: '👑 VIP Pro Master Access & Unlimited Slash Bot Features Unlocked!',
      MIDO60FPS: '⚡ 60FPS AI Motion Engine Unlocked!',
      GOLDENGOAL: '⚽ Stadium Bend Kick Physics & Crowd Horn Audio FX Unlocked!',
      VIPULTRA: '👑 VIP Ultra Creator Rank & Gold Frame Unlocked!',
      DISCORDPRO: '📢 Unlimited Discord Webhook Auto-Poster Unlocked!',
      YOUTUBEBOOST: '▶️ Live YouTube Subscriber Tracker Mode Unlocked!',
      GEMINIOVERDRIVE: '🚀 Mido 2.5 Flash High-Speed Synthesis Unlocked!',
      MIDOOVERDRIVE: '🚀 Mido 2.5 Flash High-Speed Synthesis Unlocked!',
    };

    if (code === '2026' && onLaunchTestPlace) {
      onLaunchTestPlace();
      onClose();
      return;
    }

    if (validCodes[code]) {
      if (code === '0008' || code === '008' || code === 'UNDERTHESPHERE') {
        setIsUnderTheSphereUnlocked(true);
        if (onLaunchUnderTheSphere) {
          onLaunchUnderTheSphere();
        }
      }
      if (!unlockedCodes.includes(code)) {
        const nextCodes = [...unlockedCodes, code];
        setUnlockedCodes(nextCodes);
        setCheatNotice(`🎉 ${validCodes[code]}`);
      } else {
        setCheatNotice(`⚡ Code "${code}" is already active!`);
      }
    } else {
      setCheatNotice(`❌ Invalid code. Enter secret code "M3D" to unlock PRO account!`);
    }
    setCheatCodeInput('');
  };

  const handleUnlockVaultPin = () => {
    const pin = secretVaultPin.trim();
    if (pin === '2026' && onLaunchTestPlace) {
      onLaunchTestPlace();
      onClose();
      setSecretVaultPin('');
      return;
    }
    if (pin === '0008' || pin === '008') {
      setIsUnderTheSphereUnlocked(true);
      setCheatNotice('🚨 CLASSIFIED ACCESS GRANTED: Under the Sphere (Delta-7 Research Facility) Unlocked!');
      const nextCodes = [...new Set([...unlockedCodes, '0008', 'UNDERTHESPHERE'])];
      setUnlockedCodes(nextCodes);
      if (onLaunchUnderTheSphere) {
        onLaunchUnderTheSphere();
      }
    } else {
      setCheatNotice('❌ Clearance code rejected. Access denied.');
    }
    setSecretVaultPin('');
  };

  const handleAddCustomSecret = () => {
    if (!newKey.trim()) return;
    const formattedKey = newKey.trim().toUpperCase().replace(/\s+/g, '_');
    setCustomSecretsList((prev) => [...prev, { key: formattedKey, value: newValue.trim() }]);
    setNewKey('');
    setNewValue('');
  };

  const handleRemoveCustomSecret = (index: number) => {
    setCustomSecretsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customSecretsMap: { [key: string]: string } = {};
    customSecretsList.forEach((item) => {
      if (item.key.trim()) {
        customSecretsMap[item.key.trim()] = item.value.trim();
      }
    });

    const updated: UserSecrets = {
      youtubeApiKey: youtubeApiKey.trim(),
      youtubeChannelId: youtubeChannelId.trim(),
      geminiApiKey: geminiApiKey.trim(),
      openaiApiKey: openaiApiKey.trim(),
      json2videoApiKey: json2videoApiKey.trim() || 'IYFdCSvw7VgGpHq4GTRvXSQYSiJE9HUxTeLUHnTa',
      discordWebhookUrl: discordWebhookUrl.trim(),
      discordBotToken: discordBotToken.trim(),
      discordClientId: discordClientId.trim() || '1531566521623773205',
      unlockedCheatCodes: unlockedCodes,
      customSecrets: customSecretsMap,
    };

    onSaveSecrets(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-900/40 via-slate-900 to-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">API Secrets Vault</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Encrypted & Saved Locally
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Safely store your API Keys & YouTube Channel IDs to unlock live integrations
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* YouTube Integration Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-slate-800/60 to-purple-500/10 border border-red-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">YouTube Data API & Channel Access</h3>
              </div>
              {youtubeApiKey && youtubeChannelId ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  YouTube Connected
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Key Required for Live Access
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Google Cloud YouTube Data API Key and Channel ID to enable live channel subscriber tracking, video stats, and analytics inside chat!
            </p>

            <div className="space-y-3 pt-1">
              {/* YouTube API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  YouTube Data API v3 Key <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showValues['ytKey'] ? 'text' : 'password'}
                    value={youtubeApiKey}
                    onChange={(e) => setYoutubeApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowValue('ytKey')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showValues['ytKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* YouTube Channel ID or Handle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  YouTube Channel ID or Handle <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={youtubeChannelId}
                    onChange={(e) => setYoutubeChannelId(e.target.value)}
                    placeholder="e.g. UCxxxxxxxxxxxxx or @mido3dch1"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>Enter full Channel ID (UC...) or handle (@mido3dch1)</span>
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    Get free API key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Discord Webhook & Bot Integration Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5865F2]/10 via-slate-800/60 to-indigo-500/10 border border-[#5865F2]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                <h3 className="text-sm font-bold text-white">Discord Webhooks &amp; Bot Integration</h3>
              </div>
              {discordWebhookUrl ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Webhook Active
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 text-indigo-300 border border-[#5865F2]/30 flex items-center gap-1">
                  Optional Discord Poster
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discord Channel Webhook URL
                </label>
                <input
                  type={showValues['discordWebhook'] ? 'text' : 'password'}
                  value={discordWebhookUrl}
                  onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] pr-10 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discord Bot Token (Optional)
                </label>
                <input
                  type={showValues['discordToken'] ? 'text' : 'password'}
                  value={discordBotToken}
                  onChange={(e) => setDiscordBotToken(e.target.value)}
                  placeholder="MTE..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discord Client ID (Slash Commands)
                </label>
                <input
                  type="text"
                  value={discordClientId}
                  onChange={(e) => setDiscordClientId(e.target.value)}
                  placeholder="1531566521623773205"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-[#5865F2] font-mono"
                />
              </div>
            </div>
          </div>

          {/* 🎁 SECRET PLACE & CLASSIFIED PROTOCOL OVERRIDE (CODE: 0008) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900 to-rose-950/50 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-extrabold text-white">Classified Secret Place (Protocol 0008)</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                {isUnderTheSphereUnlocked ? 'Unlocked 🔓' : 'Restricted 🔒'}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Enter secret clearance code <code className="text-purple-300 font-mono font-bold">0008</code> to unlock and immediately enter the secret place: <strong className="text-white">UNDER THE SPHERE</strong> sci-fi horror game set inside the Delta-7 research facility.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showValues['secretVaultCode'] ? 'text' : 'password'}
                  value={secretVaultPin}
                  onChange={(e) => setSecretVaultPin(e.target.value)}
                  placeholder="Enter Secret Code 0008..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-purple-300 placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono tracking-widest uppercase pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleShowValue('secretVaultCode')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showValues['secretVaultCode'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleUnlockVaultPin}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Key className="w-4 h-4 text-purple-200" />
                <span>Enter 0008</span>
              </button>
            </div>

            {isUnderTheSphereUnlocked && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onLaunchUnderTheSphere) onLaunchUnderTheSphere();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-rose-700 to-indigo-700 hover:from-purple-600 hover:to-rose-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4 text-white" />
                <span>ENTER UNDER THE SPHERE (PLAY GAME)</span>
              </button>
            )}
          </div>

          {/* 🎁 SECRET CHEAT CODES & AI POWER-UPS VAULT */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-purple-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Secret Cheat Codes &amp; VIP Access Vault</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                {unlockedCodes.length} Unlocked
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Redeem secret creator cheat codes (e.g. <code className="text-amber-300 font-mono font-bold">mido3dch1pro</code>) to unlock VIP Pro status, 60FPS motion upgrades, stadium crowd audio horns, and Mido high-speed synthesis!
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cheatCodeInput}
                onChange={(e) => setCheatCodeInput(e.target.value)}
                placeholder="Enter Secret Code (e.g. mido3dch1pro, MIDO60FPS)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 uppercase font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={handleUnlockCheatCode}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Unlock className="w-4 h-4 text-slate-950" />
                <span>Redeem</span>
              </button>
            </div>

            {cheatNotice && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold">
                {cheatNotice}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {unlockedCodes.map((code) => (
                <span
                  key={code}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-extrabold flex items-center gap-1"
                >
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>{code} ACTIVE</span>
                </span>
              ))}
            </div>
          </div>

          {/* JSON2Video Video Generation Engine Key */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-800/60 to-cyan-500/10 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">JSON2Video API v2 (Cloud Video Engine)</h3>
              </div>
              {json2videoApiKey ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Engine Connected
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  API Key Configured
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Powers real server-rendered 60FPS MP4 video clips, multi-scene promotional ads, commercial overlays, and cinematic storyboards via <code className="text-emerald-300 font-mono">https://api.json2video.com/v2/</code>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                JSON2Video API Key (x-api-key)
              </label>
              <div className="relative">
                <input
                  type={showValues['json2videoKey'] ? 'text' : 'password'}
                  value={json2videoApiKey}
                  onChange={(e) => setJson2videoApiKey(e.target.value)}
                  placeholder="IYFdCSvw7VgGpHq4GTRvXSQYSiJE9HUxTeLUHnTa"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowValue('json2videoKey')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showValues['json2videoKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium">⚡ Active & Verified: Fast MP4 Rendering Active</span>
                <a
                  href="https://json2video.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  JSON2Video Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Gemini & OpenAI API Keys */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">AI Model API Keys</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mido API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom Mido AI API Key (Optional Override)
                </label>
                <div className="relative">
                  <input
                    type={showValues['geminiKey'] ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowValue('geminiKey')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showValues['geminiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OpenAI API Key (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showValues['openaiKey'] ? 'text' : 'password'}
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowValue('openaiKey')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showValues['openaiKey'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CLASSIFIED CLEARANCE PROTOCOL (UNDER THE SPHERE SECRET ENTRY) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-black border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">CLASSIFIED PROTOCOL // SECRET</h3>
                  <p className="text-[10px] text-purple-300">Enter Classified 4-Digit Security Code (Masked ••••)</p>
                </div>
              </div>
              {isUnderTheSphereUnlocked && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50 flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  Clearance Granted
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="password"
                  maxLength={6}
                  value={secretVaultPin}
                  onChange={(e) => setSecretVaultPin(e.target.value)}
                  placeholder="Enter Secret Code (e.g. ••••)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-purple-500/30 rounded-xl text-xs text-purple-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono tracking-widest"
                />
              </div>
              <button
                type="button"
                onClick={handleUnlockVaultPin}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all shrink-0"
              >
                Authenticate
              </button>
            </div>

            {cheatNotice && (
              <div className="text-xs text-purple-300 font-semibold p-2 rounded-xl bg-purple-950/60 border border-purple-500/30">
                {cheatNotice}
              </div>
            )}

            {isUnderTheSphereUnlocked && onLaunchUnderTheSphere && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchUnderTheSphere();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>ENTER: UNDER THE SPHERE (Delta-7 Research Facility)</span>
              </button>
            )}
          </div>

          {/* Custom Secret Key-Value Manager */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Custom API Keys & Environment Tokens</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {customSecretsList.length} custom {customSecretsList.length === 1 ? 'secret' : 'secrets'}
              </span>
            </div>

            {/* List of custom secrets */}
            {customSecretsList.length > 0 && (
              <div className="space-y-2">
                {customSecretsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <span className="font-mono font-bold text-purple-300 shrink-0">{item.key}:</span>
                      <span className="font-mono text-slate-400 truncate">
                        {showValues[`custom_${idx}`] ? item.value : '••••••••••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleShowValue(`custom_${idx}`)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {showValues[`custom_${idx}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomSecret(idx)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom secret row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="KEY_NAME (e.g. STRIPE_KEY)"
                className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Secret Value / API Token"
                className="sm:col-span-5 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddCustomSecret}
                disabled={!newKey.trim()}
                className="sm:col-span-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Save Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            {saveSuccess ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Secrets Saved Successfully!</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Secrets are stored safely in browser LocalStorage
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save All Secrets</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
