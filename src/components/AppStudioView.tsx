import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { AppProject } from '../types';
import { STARTER_APPS } from '../data/presets';
import { AD_UNITS_200, AdUnitPreset } from '../data/adsData';
import { soundFx } from '../lib/soundFx';
import {
  Code2,
  Play,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Download,
  Copy,
  Check,
  Sparkles,
  Globe,
  Smartphone as AndroidIcon,
  Wand2,
  Loader2,
  Terminal,
  Send,
  X,
  QrCode,
  Share2,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Layers,
  Zap,
  FileArchive,
  DollarSign,
  Megaphone,
  Target,
} from 'lucide-react';

interface AppStudioViewProps {
  currentApp: AppProject | null;
  onUpdateApp: (updated: AppProject) => void;
  onGenerateNewApp: (prompt: string) => void;
  isGenerating: boolean;
}

interface StudioChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export const AppStudioView: React.FC<AppStudioViewProps> = ({
  currentApp,
  onUpdateApp,
  onGenerateNewApp,
  isGenerating,
}) => {
  const activeApp = currentApp || STARTER_APPS[0];

  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'css' | 'js'>('preview');
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [htmlCode, setHtmlCode] = useState(activeApp.html);
  const [cssCode, setCssCode] = useState(activeApp.css);
  const [jsCode, setJsCode] = useState(activeApp.js);
  const [promptInput, setPromptInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Modals state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // In-App Ads Monetization State (200 Ad Networks & Formats Engine)
  const [isAdsEnabled, setIsAdsEnabled] = useState(true);
  const [adPosition, setAdPosition] = useState<'top' | 'bottom' | 'card' | 'interstitial'>('top');
  const [adNetwork, setAdNetwork] = useState('Google AdSense AI');
  const [adSearchQuery, setAdSearchQuery] = useState('');
  const [selectedAdCategory, setSelectedAdCategory] = useState('All');
  const [selectedAdUnit, setSelectedAdUnit] = useState<AdUnitPreset>(AD_UNITS_200[0]);
  const [adEarnings, setAdEarnings] = useState(48.50);
  const [adImpressions, setAdImpressions] = useState(6420);
  const [adNotice, setAdNotice] = useState<string | null>(null);

  const handleInjectSpecificAdUnit = (adUnit: AdUnitPreset) => {
    setSelectedAdUnit(adUnit);
    setAdNetwork(adUnit.network);

    const adHtmlUnit = `\n<!-- ${adUnit.network} - ${adUnit.type} Ad Unit -->\n<div class="mido-ai-ad-banner" id="mido-ai-ad-${adUnit.id}">\n  <div class="ad-label">AD · Sponsored by ${adUnit.network}</div>\n  <div class="ad-content">\n    <span>${adUnit.title}</span>\n    <a href="https://mido3dch1.ai" target="_blank" class="ad-btn">${adUnit.callToAction}</a>\n  </div>\n</div>\n`;

    const adCssUnit = `\n/* ${adUnit.network} Sponsored Ad Banner Styling */\n.mido-ai-ad-banner {\n  background: linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95));\n  border: 1px solid ${adUnit.badgeColor};\n  border-radius: 12px;\n  padding: 10px 16px;\n  margin: 12px 0;\n  color: #fff;\n  font-size: 11px;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.4);\n}\n.mido-ai-ad-banner .ad-label {\n  font-size: 9px;\n  font-weight: 800;\n  color: ${adUnit.badgeColor};\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  margin-bottom: 2px;\n}\n.mido-ai-ad-banner .ad-content {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.mido-ai-ad-banner .ad-btn {\n  background: ${adUnit.badgeColor};\n  color: #0f172a;\n  padding: 4px 12px;\n  border-radius: 6px;\n  text-decoration: none;\n  font-weight: 800;\n}\n`;

    if (!htmlCode.includes(`mido-ai-ad-${adUnit.id}`)) {
      setHtmlCode((prev) => prev + adHtmlUnit);
    }
    if (!cssCode.includes(`.mido-ai-ad-banner`)) {
      setCssCode((prev) => prev + adCssUnit);
    }

    setIsAdsEnabled(true);
    setAdEarnings((prev) => parseFloat((prev + adUnit.cpm * 0.8).toFixed(2)));
    setAdImpressions((prev) => prev + 150);
    setAdNotice(`🎉 ${adUnit.network} (${adUnit.type}) injected! eCPM $${adUnit.cpm}`);
    setIframeKey((k) => k + 1);
  };

  const handleInjectAdsIntoAppCode = () => {
    handleInjectSpecificAdUnit(selectedAdUnit);
  };

  // Agent Thinking Simulation
  const [thinkingStep, setThinkingStep] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);

  // Studio Chat History
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Hello! Welcome to **Mido Builder 🚀 (V4.0 Insane Edition)**. Type any prompt or click a 1-click magic action to build websites and interactive apps!`,
      time: 'Just now',
    },
  ]);

  const handleInjectCyberpunkNeon = () => {
    soundFx.playSuccess();
    const neonCss = `\n/* 🚀 Mido Builder Cyberpunk Neon Overhaul */
:root {
  --neon-cyan: #06b6d4;
  --neon-purple: #a855f7;
  --neon-pink: #ec4899;
}
body {
  background: radial-gradient(circle at 50% 10%, #1e1035, #0a0612, #020108) !important;
  color: #f8fafc !important;
  font-family: system-ui, -apple-system, sans-serif !important;
}
button, .btn, .card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.25) !important;
  border: 1px solid rgba(168, 85, 247, 0.4) !important;
  backdrop-filter: blur(12px) !important;
}
button:hover, .btn:hover {
  transform: translateY(-2px) scale(1.02) !important;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.6) !important;
  border-color: #06b6d4 !important;
}
h1, h2, h3 {
  background: linear-gradient(135deg, #06b6d4, #a855f7, #ec4899) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.4));
}\n`;
    setCssCode((prev) => prev + neonCss);
    setIframeKey((k) => k + 1);
  };

  const handleInjectParticlesCanvas = () => {
    soundFx.playSuccess();
    const particleHtml = `\n<!-- 🌌 Mido Builder 3D Particle Constellation Canvas -->\n<canvas id="mido-particles-bg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;"></canvas>\n`;
    const particleJs = `\n// 🌌 Mido Builder Particle Engine
(function() {
  const canvas = document.getElementById('mido-particles-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    radius: Math.random() * 2 + 1,
    color: Math.random() > 0.5 ? '#06b6d4' : '#a855f7'
  }));
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(168, 85, 247, ' + (1 - dist / 110) * 0.3 + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();\n`;
    if (!htmlCode.includes('mido-particles-bg')) {
      setHtmlCode((prev) => particleHtml + prev);
    }
    setJsCode((prev) => prev + particleJs);
    setIframeKey((k) => k + 1);
  };

  const handleInjectAudioSFX = () => {
    soundFx.playSuccess();
    const audioJs = `\n// 🔊 Mido Builder Haptic Audio Engine
(function() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const actx = new AudioCtx();
  function playBeep(freq = 520, type = 'sine', duration = 0.08) {
    if (actx.state === 'suspended') actx.resume();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    gain.gain.setValueAtTime(0.08, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input[type="submit"], .btn')) {
      playBeep(640, 'triangle', 0.07);
    }
  });
})();\n`;
    setJsCode((prev) => prev + audioJs);
    setIframeKey((k) => k + 1);
  };

  useEffect(() => {
    setHtmlCode(activeApp.html);
    setCssCode(activeApp.css);
    setJsCode(activeApp.js);
    setIframeKey((prev) => prev + 1);
  }, [activeApp.id, activeApp.html, activeApp.css, activeApp.js]);

  // Handle live AI building simulation logs
  useEffect(() => {
    if (isGenerating) {
      setThinkingStep(1);
      setBuildLogs(['[1/5] 🔍 Reading workspace files & analyzing prompt...']);

      const t1 = setTimeout(() => {
        setThinkingStep(2);
        setBuildLogs((prev) => [...prev, '[2/5] 📄 Reading file templates & tokens...']);
      }, 900);

      const t2 = setTimeout(() => {
        setThinkingStep(3);
        setBuildLogs((prev) => [...prev, '[3/5] ✍️ Creating file index.html & style.css...']);
      }, 1900);

      const t3 = setTimeout(() => {
        setThinkingStep(4);
        setBuildLogs((prev) => [...prev, '[4/5] ⚙️ Editing file script.js & wiring listeners...']);
      }, 2900);

      const t4 = setTimeout(() => {
        setThinkingStep(5);
        setBuildLogs((prev) => [...prev, '[5/5] 🚀 Compiling applet in Mido AI Studio & launching preview!']);
      }, 3800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setThinkingStep(0);
    }
  }, [isGenerating]);

  const handleApplyChanges = () => {
    onUpdateApp({
      ...activeApp,
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      updatedAt: 'Just now',
    });
    setIframeKey((prev) => prev + 1);
  };

  const fullAppDocument = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeApp.title}</title>
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch (err) {
      console.error(err);
    }
  </script>
</body>
</html>`;

  const handleDownloadSource = () => {
    const blob = new Blob([fullAppDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeApp.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();

    const cleanIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeApp.title}</title>
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${htmlCode}
  <script src="script.js"></script>
</body>
</html>`;

    const manifest = {
      name: activeApp.title,
      short_name: activeApp.title,
      start_url: './index.html',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#a855f7',
      description: activeApp.description || 'Created with mido3dch1 App Creator',
      icons: [
        {
          src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&fit=crop',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    };

    const readme = `# ${activeApp.title}
Created with **mido3dch1's App Creator**

## Project Structure:
- \`index.html\`: Core app markup
- \`style.css\`: Custom styling & glassmorphic themes
- \`script.js\`: Interactive JavaScript engine
- \`manifest.json\`: Progressive Web App (PWA) & Android manifest

## How to Run Locally:
1. Extract all files from this ZIP.
2. Double-click \`index.html\` to launch in Google Chrome, Edge, or Firefox.

## Convert to Android APK:
1. Open terminal in this folder.
2. Run \`npx @bubblewrap/cli init --manifest=manifest.json\`
3. Run \`bubblewrap build\` to generate your signed \`.apk\`!
`;

    zip.file('index.html', cleanIndexHtml);
    zip.file('style.css', cssCode);
    zip.file('script.js', jsCode);
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeApp.title.toLowerCase().replace(/\s+/g, '-')}-project.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullAppDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    const userText = promptInput.trim();
    setPromptInput('');

    // Add to chat history
    const userMsg: StudioChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Send to parent generator
    onGenerateNewApp(userText);

    // Add AI Agent acknowledgment message
    setTimeout(() => {
      const agentMsg: StudioChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: `mido3dch1 AI is synthesizing your web app for: **"${userText}"**...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    }, 500);
  };

  const shareUrl = `https://mido3dch1.ai/app/${activeApp.id}`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    shareUrl
  )}&color=a855f7&bgcolor=0f172a`;

  const handleDownloadApkBundle = async () => {
    const zip = new JSZip();

    const apkManifest = {
      name: activeApp.title,
      short_name: activeApp.title,
      start_url: './index.html',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#10b981',
      orientation: 'portrait',
      icons: [
        {
          src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&fit=crop',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };

    const standaloneHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${activeApp.title}</title>
  <link rel="manifest" href="manifest.json">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch (err) {
      console.error(err);
    }
  </script>
</body>
</html>`;

    // Add files to APK package container
    zip.file('index.html', standaloneHtml);
    zip.file('manifest.json', JSON.stringify(apkManifest, null, 2));
    zip.file(
      `${activeApp.title.toLowerCase().replace(/\s+/g, '-')}.apk.html`,
      standaloneHtml
    );
    zip.file(
      'APK_INSTALL_GUIDE.txt',
      `==================================================
mido3dch1 Android APK & PWA Package
App Title: ${activeApp.title}
==================================================

How to install on Android:
1. Transfer index.html or ${activeApp.title.toLowerCase().replace(/\s+/g, '-')}.apk.html to your Android phone.
2. Open the file in Chrome on Android.
3. Tap Chrome's menu (top right) -> "Add to Home screen" or "Install App".
4. The app will launch full screen as a native Android app!
`
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeApp.title.toLowerCase().replace(/\s+/g, '-')}-android-apk.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020617] text-slate-100 overflow-hidden relative">
      {/* Top Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/5 backdrop-blur-2xl border-b border-white/10 text-xs z-10">
        {/* Title & App Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Mido Builder 🚀
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-500/40">
                  V4.0 INSANE EDITION
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[180px] sm:max-w-[260px]">
                {activeApp.title}
              </div>
            </div>
          </div>

          {/* Preset Apps selector */}
          <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-white/10">
            {STARTER_APPS.map((starter, index) => (
              <button
                key={`${starter.id}-${index}`}
                onClick={() => onUpdateApp(starter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  starter.id === activeApp.id
                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {starter.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Tabs (Preview / HTML / CSS / JS) */}
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-white/10 text-white font-bold border border-white/20 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'html'
                ? 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'css'
                ? 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === 'js'
                ? 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            JS
          </button>
        </div>

        {/* Right Actions: Frame view, Publish, Export APK */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
              <button
                onClick={() => setDeviceFrame('desktop')}
                className={`p-1 rounded-lg ${
                  deviceFrame === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceFrame('tablet')}
                className={`p-1 rounded-lg ${
                  deviceFrame === 'tablet' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceFrame('phone')}
                className={`p-1 rounded-lg ${
                  deviceFrame === 'phone' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIframeKey((p) => p + 1)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="Refresh Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Export APK Button */}
          <button
            onClick={() => setShowApkModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold hover:bg-emerald-500/30 transition-all shadow-sm"
          >
            <AndroidIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export APK</span>
          </button>

          {/* Monetize / In-App Ads Button */}
          <button
            onClick={() => setShowAdsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/30 transition-all shadow-sm"
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Monetize Ads</span>
          </button>

          {/* Publish App Button */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* 🚀 Mido Builder Insane Superpowers Action Bar */}
      <div className="px-4 py-1.5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-10 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            1-Click Magic:
          </span>
          <button
            onClick={handleInjectCyberpunkNeon}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            title="Inject Cyberpunk Neon Styling"
          >
            <span>⚡ Cyberpunk Neon</span>
          </button>
          <button
            onClick={handleInjectParticlesCanvas}
            className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            title="Inject 3D Interactive Particles Canvas"
          >
            <span>🌌 3D Particles</span>
          </button>
          <button
            onClick={handleInjectAudioSFX}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            title="Inject Interactive Haptic Sound Effects"
          >
            <span>🔊 Haptic Audio SFX</span>
          </button>
          <button
            onClick={() => {
              soundFx.playSuccess();
              setHtmlCode((prev) => prev.includes('meta name="viewport"') ? prev : `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n` + prev);
              setCssCode((prev) => prev + `\n@media (max-width: 768px) { body { padding: 12px !important; } .container, .card, main { max-width: 100% !important; flex-direction: column !important; } }\n`);
              setIframeKey((k) => k + 1);
            }}
            className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            title="100% Mobile & iPhone 16 Pro Auto-Layout"
          >
            <span>📱 Mobile 100% Flex</span>
          </button>
          <button
            onClick={() => setShowAdsModal(true)}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            title="Inject Ads Monetization"
          >
            <DollarSign className="w-3 h-3 text-amber-400" />
            <span>Monetize (200 Ads)</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
          <span>Engine: <strong className="text-emerald-400 font-bold">Mido Builder V4.0 Insane</strong></span>
        </div>
      </div>

      {/* Main Studio Display & AI Thinking Screen */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Live AI Agent Working Floating Status Widget (Not Full Screen) */}
        {isGenerating && (
          <div className="absolute top-4 right-4 z-40 max-w-sm w-full bg-slate-900/95 backdrop-blur-2xl border border-purple-500/40 rounded-2xl p-3.5 shadow-2xl shadow-purple-950/60 transition-all animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/30 shrink-0">
                <Cpu className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">Mido AI Agent Active</h4>
                  <span className="text-[10px] font-mono font-bold text-purple-400">
                    {thinkingStep === 1
                      ? '20%'
                      : thinkingStep === 2
                      ? '40%'
                      : thinkingStep === 3
                      ? '65%'
                      : thinkingStep === 4
                      ? '85%'
                      : '100%'}
                  </span>
                </div>
                <p className="text-[10px] text-purple-300/80 truncate">
                  {buildLogs[buildLogs.length - 1] || 'Agent executing workflow...'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10 mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                style={{
                  width:
                    thinkingStep === 1
                      ? '20%'
                      : thinkingStep === 2
                      ? '40%'
                      : thinkingStep === 3
                      ? '65%'
                      : thinkingStep === 4
                      ? '85%'
                      : '100%',
                }}
              />
            </div>

            {/* Compact Terminal Logs */}
            <div className="bg-black/70 rounded-xl p-2 font-mono text-[10px] text-emerald-400 space-y-0.5 max-h-24 overflow-y-auto border border-white/10">
              {buildLogs.slice(-3).map((log, i) => (
                <div key={i} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-purple-400 select-none">&gt;</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' ? (
          <div
            className={`transition-all duration-300 h-full bg-slate-950/40 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm relative shadow-2xl flex flex-col ${
              deviceFrame === 'phone'
                ? 'w-[360px] max-h-[640px]'
                : deviceFrame === 'tablet'
                ? 'w-[720px] max-h-[85%]'
                : 'w-full h-full'
            }`}
          >
            {/* Top Frame Bar */}
            <div className="h-9 bg-black/40 flex items-center px-4 gap-2 border-b border-white/10 justify-between text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-3 font-mono text-[11px] text-slate-500 italic">
                  mido3dch1.ai/app/{activeApp.id}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isAdsEnabled && (
                  <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> ADS MONETIZED
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE CONTAINER
                </span>
              </div>
            </div>

            {/* In-App Google AdSense / AI Ads Top Banner */}
            {isAdsEnabled && adPosition === 'top' && (
              <div className="bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-200 z-10 shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                    AD
                  </span>
                  <span className="font-semibold truncate">
                    Sponsored by Google AdSense AI · Earn $14.85/day on this app!
                  </span>
                </div>
                <button
                  onClick={() => setShowAdsModal(true)}
                  className="text-[10px] font-bold underline hover:text-white"
                >
                  Manage Ads
                </button>
              </div>
            )}

            <iframe
              key={iframeKey}
              title={activeApp.title}
              srcDoc={fullAppDocument}
              className="w-full flex-1 border-none bg-slate-950"
              sandbox="allow-scripts allow-modals allow-forms"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-950/40 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs text-slate-400">
              <span className="font-bold text-white uppercase tracking-wider">
                {activeTab} Source Code
              </span>
              <button
                onClick={handleApplyChanges}
                className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md shadow-indigo-500/30"
              >
                Apply &amp; Test
              </button>
            </div>
            <textarea
              value={activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode}
              onChange={(e) => {
                if (activeTab === 'html') setHtmlCode(e.target.value);
                else if (activeTab === 'css') setCssCode(e.target.value);
                else setJsCode(e.target.value);
              }}
              className="w-full flex-1 bg-black/40 text-purple-200 font-mono text-xs p-4 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* In-Studio Chat & AI Builder Prompt Bar ("Chat Under Prompt") */}
      <div className="p-3 bg-white/5 backdrop-blur-2xl border-t border-white/10 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            <span className="text-slate-400 font-semibold text-[10px] uppercase shrink-0 mr-1">
              Refine App:
            </span>
            {[
              'Add dark mode toggle',
              'Add sound effects & score',
              'Build a finance manager app',
              'Create a retro arcade game',
              'Add export CSV button',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(chip);
                }}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white shrink-0 transition-colors"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handlePromptSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Wand2 className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Type a prompt for mido3dch1 AI to create or update this app..."
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 shrink-0 font-semibold text-xs transition-colors"
              title="Download Full Project ZIP (HTML, CSS, JS, Manifest)"
            >
              <FileArchive className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Export ZIP</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSource}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 shrink-0"
              title="Download Single HTML Document"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shrink-0 shadow-md shadow-purple-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Web / App</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 🚀 PUBLISH APP MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Publish &amp; Share App</h3>
                <p className="text-xs text-slate-400">mido3dch1 Cloud Hosting</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-white/10">
                <img
                  src={qrCodeImgUrl}
                  alt="App QR Code"
                  className="w-36 h-36 rounded-xl border border-white/10 mb-2 shadow-lg"
                />
                <span className="text-[11px] text-slate-400 font-medium">
                  Scan with Mobile Phone Camera to Open
                </span>
              </div>

              {/* Share URL Link */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Live Share URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-purple-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    className="px-3 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-600 transition-colors flex items-center gap-1"
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Embed iFrame Code</label>
                <textarea
                  readOnly
                  rows={2}
                  value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono text-slate-400 resize-none focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your web app is published and accessible globally!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📱 EXPORT APK MODAL */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowApkModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <AndroidIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Export Android APK / PWA Package</h3>
                <p className="text-xs text-slate-400">mido3dch1 Mobile App Exporter</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Option 1: Download Webview Bundle */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-xs text-white mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" /> 1. Download Android App Bundle
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Downloads the standalone mobile web application with manifest.json and offline Service Worker ready for Android Studio.
                </p>
                <button
                  onClick={handleDownloadApkBundle}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <AndroidIcon className="w-4 h-4" /> Download Android APK Bundle
                </button>
              </div>

              {/* Option 2: 1-Click Mobile Install */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-xs text-white mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" /> 2. Direct Mobile Phone Installation
                </h4>
                <ol className="text-[11px] text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Scan the Publish QR Code on your Android phone.</li>
                  <li>In Chrome, tap the 3-dots menu icon top right.</li>
                  <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                  <li>Enjoy your native full-screen app on Android!</li>
                </ol>
              </div>

              {/* Option 3: Command Line APK Build */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                <h4 className="font-bold text-xs text-slate-300 mb-1">3. CLI Command to Generate Signed .APK</h4>
                <code className="text-[10px] font-mono text-emerald-300 block p-2 bg-slate-950 rounded-lg border border-white/10">
                  npx @bubblewrap/cli init --manifest=manifest.json &amp;&amp; bubblewrap build
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💰 IN-APP ADS & MONETIZATION MODAL (200 AD UNITS CATALOG) */}
      {showAdsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowAdsModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">In-App Ads &amp; Monetization Suite</h3>
                <p className="text-xs text-amber-300 font-semibold">200 Ad Networks &amp; Formats Catalog</p>
              </div>
            </div>

            {adNotice && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adNotice}</span>
              </div>
            )}

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {/* Earnings & Stats Box */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border border-white/10 rounded-2xl text-center shrink-0">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Daily</div>
                  <div className="text-lg font-black text-amber-400">${adEarnings.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Impressions</div>
                  <div className="text-lg font-black text-purple-300">{adImpressions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Active eCPM</div>
                  <div className="text-lg font-black text-emerald-400">${selectedAdUnit.cpm.toFixed(2)}</div>
                </div>
              </div>

              {/* Toggle Enable Ads & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Enable In-App Ads</div>
                    <div className="text-[10px] text-slate-400">Live ad banners</div>
                  </div>
                  <button
                    onClick={() => setIsAdsEnabled(!isAdsEnabled)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                      isAdsEnabled
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isAdsEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Ad Placement</span>
                  <select
                    value={adPosition}
                    onChange={(e: any) => setAdPosition(e.target.value)}
                    className="bg-black/60 border border-white/15 rounded-xl px-2 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="top">Top Banner</option>
                    <option value="bottom">Bottom Sticky</option>
                    <option value="card">Content Card</option>
                    <option value="interstitial">Video Interstitial</option>
                  </select>
                </div>
              </div>

              {/* Search & Category Filter for 200 Ad Units */}
              <div className="space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Browse 200 Ad Formats &amp; Networks</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">200 Ad Units Available</span>
                </div>

                <input
                  type="text"
                  value={adSearchQuery}
                  onChange={(e) => setAdSearchQuery(e.target.value)}
                  placeholder="Search 200 Ad networks (AdSense, Unity, Meta, 3D Football, Cyberpunk, Crypto...)..."
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 200 Ad Units Catalog List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border border-white/10 rounded-2xl p-2 bg-black/40">
                {AD_UNITS_200.filter(
                  (unit) =>
                    unit.network.toLowerCase().includes(adSearchQuery.toLowerCase()) ||
                    unit.title.toLowerCase().includes(adSearchQuery.toLowerCase()) ||
                    unit.category.toLowerCase().includes(adSearchQuery.toLowerCase())
                )
                  .slice(0, 30)
                  .map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        selectedAdUnit.id === unit.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-extrabold text-slate-950 uppercase"
                            style={{ backgroundColor: unit.badgeColor }}
                          >
                            {unit.network}
                          </span>
                          <span className="text-[10px] text-slate-400">{unit.category}</span>
                        </div>
                        <div className="text-xs font-bold text-white truncate">{unit.title}</div>
                        <div className="text-[10px] text-amber-300 font-semibold">
                          Format: {unit.type} • Estimated eCPM: ${unit.cpm.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleInjectSpecificAdUnit(unit)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-slate-950" />
                        <span>Inject Ad</span>
                      </button>
                    </div>
                  ))}
              </div>

              {/* Auto Inject Selected Ad Unit */}
              <button
                onClick={handleInjectAdsIntoAppCode}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                <span>Inject Selected Ad Unit ({selectedAdUnit.network}) Into App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
