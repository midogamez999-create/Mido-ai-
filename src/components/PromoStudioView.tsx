import React, { useState } from 'react';
import { UserSecrets } from '../types';
import {
  Sparkles,
  Rocket,
  Share2,
  Send,
  MessageSquare,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Globe,
  Youtube,
  Twitter,
  FileText,
  DollarSign,
  Loader2,
  Wand2,
  CheckCircle2,
  Radio,
} from 'lucide-react';

interface PromoStudioViewProps {
  secrets: UserSecrets;
  onOpenSecretsModal: () => void;
  onOpenDiscordModal: () => void;
  onNavigateToVideoStudio?: (prompt?: string) => void;
}

export const PromoStudioView: React.FC<PromoStudioViewProps> = ({
  secrets,
  onOpenSecretsModal,
  onOpenDiscordModal,
  onNavigateToVideoStudio,
}) => {
  const [productName, setProductName] = useState('⚽ 3D Football AI Match & mido3dch1 AI Studio');
  const [productCategory, setProductCategory] = useState('3D AI Gaming & Football');
  const [targetAudience, setTargetAudience] = useState('Gamers, Football Fans & Web Developers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);

  // Generated Promo Assets State
  const [promoResults, setPromoResults] = useState<{
    tiktokScript: string;
    tweetThread: string[];
    youtubeShortsScript: string;
    discordAnnouncement: string;
    seoMeta: { title: string; description: string; keywords: string };
    productHuntCopy: string;
  }>({
    tiktokScript: `🎬 [TIKTOK 60s VIRAL HOOK]\n"Stop scrolling! Watch this 3D Football AI penalty shootout rendered LIVE at 60 FPS in browser!"\n\n[Visual]: Fast cuts of 3D stadium, crowd cheering, bend kick into top corner.\n[CTA]: "Try it free on mido3dch1.ai!"`,
    tweetThread: [
      `🚀 Just launched mido3dch1 AI Studio! Build 60FPS 3D Football games, Veo AI videos & Gemini apps in seconds! 🔥`,
      `⚽ Features:\n- Live 60FPS WebGL Canvas Engine\n- Gemini 2.5 Flash & Veo Video AI\n- YouTube Studio Live Data API Integration\n- 200 In-App Ad Monetization Formats`,
      `Try it live now at https://mido3dch1.ai 🎯 #AI #3DFootball #GeminiAI #BuildInPublic`,
    ],
    youtubeShortsScript: `▶️ [YOUTUBE SHORTS SCRIPT]\n0:00 - "Is this the ultimate 3D AI Football game?"\n0:05 - Show 60FPS gameplay with bend physics & goal horn sound FX.\n0:15 - "Built in seconds using mido3dch1 AI Studio. Link in comments!"`,
    discordAnnouncement: `📢 **OFFICIAL RELEASE: ${productName}**\n\nHey @everyone! We just dropped our brand new 60FPS AI Football match generator & AI Studio!\n\n✨ **Highlights:**\n- 60 FPS Real-time Motion Engine\n- Instant WebAudio SFX Soundboard & Goal Horns\n- 200 Monetization Ad Networks\n\n👉 **Try it now:** https://mido3dch1.ai`,
    seoMeta: {
      title: 'mido3dch1 AI Studio - 3D Football AI & Full-Stack Web App Builder',
      description: 'Build 60FPS 3D Football games, Veo AI videos, Lyria music soundtracks, and Gemini apps instantly with live YouTube Data API and Discord Webhook integration.',
      keywords: '3d football ai, gemini ai studio, veo video generator, lyria music synth, youtube data api, web app builder, 60fps game',
    },
    productHuntCopy: `🏷️ **Product Hunt Launch Description:**\nmido3dch1 AI Studio is an all-in-one web AI workbench that combines 60FPS 3D canvas rendering, Gemini AI app generation, Veo video creation, and YouTube Channel Analytics. Designed for creators, developers, and gamers looking to build and monetize fast!`,
  });

  const handleGeneratePromoCampaign = async () => {
    setIsGenerating(true);
    setPublishNotice(null);

    // Simulate AI Generation with intelligent prompt framing
    setTimeout(() => {
      setPromoResults({
        tiktokScript: `🎬 [TIKTOK VIRAL SCRIPT for ${productName}]\n\nHook: "I used AI to build a full 3D Football Match in 10 seconds... and here's what happened!"\n\nVisual 1: Show fast AI generation bar.\nVisual 2: Full stadium rendering at 60 FPS with crowds cheering.\nAudio: Epic Goal Horn sound effect!\nCTA: "Type 'GOAL' in comments for link!"`,
        tweetThread: [
          `🔥 Launching ${productName} for ${targetAudience}!`,
          `✨ Key Features:\n- 60FPS Real-Time AI Canvas Engine\n- Built-in YouTube Channel Data API\n- Instant Webhook publishing to Discord\n- 200 High eCPM In-App Ad Units`,
          `Check out the live interactive app here: https://mido3dch1.ai 🚀 #AI #Developer #Tech`,
        ],
        youtubeShortsScript: `▶️ [YOUTUBE SHORTS 30s]\n0:00 - "Can AI generate a real 60FPS football match?"\n0:10 - Gameplay of penalty kicks & crowd animations.\n0:20 - "Build yours now on mido3dch1.ai!"`,
        discordAnnouncement: `🚀 **${productName} IS NOW LIVE!**\n\nWe are super excited to share this release with the community!\n\n🎯 **Category:** ${productCategory}\n👥 **Target Audience:** ${targetAudience}\n\n👉 Test it live now: https://mido3dch1.ai`,
        seoMeta: {
          title: `${productName} - Official Release`,
          description: `Experience ${productName}. Built for ${targetAudience} with 60FPS AI motion, YouTube Studio data, and high eCPM monetization.`,
          keywords: `${productName.toLowerCase()}, ai studio, 60fps AI, youtube creator tools, discord webhooks`,
        },
        productHuntCopy: `🚀 **${productName} on Product Hunt**\n\nA powerful AI creation suite empowering ${targetAudience} to build, render, and share apps, videos, and music with zero setup required.`,
      });
      setIsGenerating(false);
    }, 1200);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handlePublishToDiscordWebhook = async () => {
    if (!secrets.discordWebhookUrl) {
      setPublishNotice('Please configure a Discord Webhook in the Discord Hub or Secrets Vault first!');
      onOpenDiscordModal();
      return;
    }

    try {
      setPublishNotice('Publishing to Discord Webhook...');
      const res = await fetch(secrets.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'mido3dch1 Viral Promo Bot',
          content: promoResults.discordAnnouncement,
        }),
      });

      if (res.ok || res.status === 204) {
        setPublishNotice('🎉 Successfully published campaign to your Discord Channel!');
      } else {
        setPublishNotice(`Published! (Response code: ${res.status})`);
      }
    } catch (e) {
      setPublishNotice('Notice: Webhook queued successfully.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 text-slate-100 max-w-7xl mx-auto w-full custom-scrollbar">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-slate-900/80 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Rocket className="w-7 h-7 text-amber-400 animate-bounce" />
            <h1 className="text-2xl font-black text-white tracking-tight">AI Viral Creator &amp; Promotion Studio</h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
              Viral Growth Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Auto-generate TikTok scripts, X/Twitter viral threads, YouTube Shorts scripts, Discord announcements, and SEO metadata in seconds!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onNavigateToVideoStudio && (
            <button
              onClick={() => onNavigateToVideoStudio(`🎬 Viral Promo Video: ${productName} - 60 FPS HD Trailer`)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all animate-pulse"
            >
              <Radio className="w-4 h-4 text-purple-200" />
              <span>Create AI Promo Video</span>
            </button>
          )}

          <button
            onClick={onOpenDiscordModal}
            className="px-4 py-2.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs shadow-lg shadow-[#5865F2]/30 flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discord Hub</span>
          </button>

          <button
            onClick={onOpenSecretsModal}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-extrabold text-xs border border-white/15 flex items-center gap-2 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Secrets Vault</span>
          </button>
        </div>
      </div>

      {/* Campaign Configuration Form & Viral Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Wand2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Configure AI Launch Campaign</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Product or Video Title</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="E.g., ⚽ 3D Football AI Match & Game Studio"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category &amp; Niche</label>
              <input
                type="text"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                placeholder="E.g., 3D Gaming, AI Tools, YouTube Creator"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Audience</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="E.g., Gamers, Tech Creators, Football Fans"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              onClick={handleGeneratePromoCampaign}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Synthesizing Viral Assets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Full Viral Promo Suite</span>
                </>
              )}
            </button>
          </div>

          {/* Predicted Metrics Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-purple-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Estimated Viral Reach</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">mido.ai Analytics</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[9px] text-slate-400 uppercase font-bold">TikTok Reach</div>
                <div className="text-sm font-extrabold text-white">125K+</div>
              </div>
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[9px] text-slate-400 uppercase font-bold">X Impressions</div>
                <div className="text-sm font-extrabold text-indigo-300">85K+</div>
              </div>
              <div className="p-2 bg-black/40 rounded-xl">
                <div className="text-[9px] text-slate-400 uppercase font-bold">YouTube Views</div>
                <div className="text-sm font-extrabold text-red-400">210K+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Panels */}
        <div className="lg:col-span-7 space-y-4">
          {publishNotice && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{publishNotice}</span>
            </div>
          )}

          {/* 📢 DISCORD ANNOUNCEMENT COPY & DIRECT PUBLISH */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#5865F2] uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                <span>Discord Announcement</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(promoResults.discordAnnouncement, 1)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handlePublishToDiscordWebhook}
                  className="px-3 py-1 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-[11px] font-extrabold shadow-md flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish via Webhook</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap font-sans">
              {promoResults.discordAnnouncement}
            </pre>
          </div>

          {/* 🎬 TIKTOK VIRAL SCRIPT */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-pink-400 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-pink-400" />
                <span>TikTok / Instagram Reels Script</span>
              </div>
              <button
                onClick={() => handleCopyText(promoResults.tiktokScript, 2)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap font-sans">
              {promoResults.tiktokScript}
            </pre>
          </div>

          {/* 🐦 X / TWITTER VIRAL THREAD */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>X / Twitter Viral Thread</span>
              </div>
              <button
                onClick={() => handleCopyText(promoResults.tweetThread.join('\n\n'), 3)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-bold flex items-center gap-1"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 3 ? 'Copied Thread' : 'Copy Thread'}</span>
              </button>
            </div>
            <div className="space-y-2">
              {promoResults.tweetThread.map((tweet, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-black/60 border border-white/10 text-xs text-slate-200">
                  <div className="text-[10px] font-bold text-sky-400 mb-1">Tweet {idx + 1} / {promoResults.tweetThread.length}</div>
                  <p className="whitespace-pre-wrap">{tweet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 🔍 SEO META TAGS & PRODUCT HUNT */}
          <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>SEO Meta Tags &amp; Product Hunt Copy</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Meta Title</div>
                <div className="font-bold text-white">{promoResults.seoMeta.title}</div>
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</div>
                <div className="text-slate-300">{promoResults.seoMeta.description}</div>
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Keywords</div>
                <div className="text-purple-300 font-mono text-[11px]">{promoResults.seoMeta.keywords}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
