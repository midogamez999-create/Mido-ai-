export interface AdUnitPreset {
  id: string;
  network: string;
  type: string;
  category: string;
  cpm: number;
  title: string;
  description: string;
  callToAction: string;
  badgeColor: string;
  bannerGradient: string;
}

export const AD_UNITS_200: AdUnitPreset[] = Array.from({ length: 200 }, (_, i) => {
  const networks = [
    'Google AdSense AI',
    'Google AdMob',
    'Unity Ads 3D',
    'Meta Audience Network',
    'AppLovin MAX',
    'IronSource AI',
    'ByteDance Pangle',
    'TikTok Audience Network',
    'Amazon Publisher Services',
    'InMobi Exchange',
    'Mintegral AI',
    'Tapjoy Reward',
    'Moloco Cloud DSP',
    'Liftoff Monetization',
    'Vungle Video',
    'Smaato Exchange',
    'SmartyAds Programmatic',
    'Criteo Dynamic',
    'Taboola Feed',
    'Outbrain Native'
  ];

  const types = [
    'Top Leaderboard Banner',
    'Bottom Sticky Banner',
    'Native In-Feed Card',
    '3D Interstitial Video',
    'Rewarded Video Ad',
    'Interactive Playable Mini-Game',
    'AI Floating Pill Ad',
    'Sponsored Recommendation Widget',
    'Audio In-Stream Ad',
    'Full-Screen Splash Offer'
  ];

  const categories = [
    '⚽ 3D Football & Sports',
    '🏎️ Cyberpunk & Racing Games',
    '🚀 AI Coding & Developer Tools',
    '🎮 Sci-Fi & RPG Gaming',
    '💻 SaaS & Cloud Productivity',
    '📱 Mobile Gadgets & Tech',
    '🎵 Music & Audio Streaming',
    '🎬 Movies & OTT Streaming',
    '💎 Crypto & Fintech Trading',
    '⚡ E-Commerce & Flash Deals'
  ];

  const titles = [
    '🚀 mido3dch1 AI Studio - Build 60FPS Web Apps Instantly',
    '⚽ 3D Football AI Championship 2026 - Play Live Match',
    '🏎️ Cyberpunk Neon Drift 3D - Download Free Game',
    '🎮 Sci-Fi Mech Warfare 4K - Claim Free Starter Pack',
    '💎 Trade Bitcoin & Crypto with 0% Fees on AI Exchange',
    '🎧 AI Lyria Sound Synthesizer - Generate Music Tracks',
    '📸 8K AI Photo Studio - Enhance & Upscale Images',
    '🎬 Stream Unlimited Movies & Live Sports in Ultra HD',
    '⚡ Cloud Hosting Special: 99.9% Uptime with Free SSL',
    '🛍️ Flash Deal 70% Off Premium AI Tools & Plugins'
  ];

  const ctas = ['Try Free', 'Play Now', 'Claim $100', 'Watch Video', 'Download', 'Get Deal', 'Install', 'Learn More'];
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16'];
  const gradients = [
    'from-amber-950/90 via-slate-900/90 to-amber-950/90 border-amber-500/40',
    'from-emerald-950/90 via-slate-900/90 to-emerald-950/90 border-emerald-500/40',
    'from-blue-950/90 via-slate-900/90 to-blue-950/90 border-blue-500/40',
    'from-purple-950/90 via-slate-900/90 to-purple-950/90 border-purple-500/40',
    'from-rose-950/90 via-slate-900/90 to-rose-950/90 border-rose-500/40'
  ];

  const net = networks[i % networks.length];
  const type = types[i % types.length];
  const cat = categories[i % categories.length];
  const title = titles[i % titles.length];
  const cta = ctas[i % ctas.length];
  const color = colors[i % colors.length];
  const grad = gradients[i % gradients.length];
  const cpm = parseFloat((3.5 + (i * 0.17) % 18).toFixed(2));

  return {
    id: `ad-unit-${i + 1}`,
    network: `${net} #${i + 1}`,
    type,
    category: cat,
    cpm,
    title,
    description: `Sponsored Ad Unit #${i + 1} targeted for ${cat}. High conversion eCPM $${cpm}.`,
    callToAction: cta,
    badgeColor: color,
    bannerGradient: grad
  };
});
