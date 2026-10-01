import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Terminal,
  Zap,
  Globe,
  Store,
  Gamepad2,
  Package,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface ApkInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallerModal: React.FC<ApkInstallerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'itch' | 'playstore' | 'instant' | 'apk' | 'developer'>('itch');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPackageId, setCopiedPackageId] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = window.location.origin;
  const packageId = "com.mido.ai";

  const handleCopyUrl = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(currentAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyPackageId = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(packageId);
    setCopiedPackageId(true);
    setTimeout(() => setCopiedPackageId(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 p-1 flex items-center justify-center shadow-lg shadow-red-600/30 overflow-hidden">
              <img src="/icon.svg" alt="MIDO AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">MIDO AI • APK & Publishing Hub</h2>
                <span className="px-2 py-0.5 rounded-md bg-red-600/30 border border-red-500/50 text-[10px] font-black text-red-400 uppercase tracking-wider">
                  ITCH.IO & GOOGLE PLAY
                </span>
              </div>
              <p className="text-xs text-slate-400">Generate APK, install on phone, and publish to Itch.io & Google Play Store</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice about ZIP file vs APK */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 flex items-start gap-2.5 text-xs text-amber-200">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-bold">Why the downloaded ZIP from AI Studio is not an APK directly:</strong>
            <p className="text-amber-200/90 mt-0.5">
              The ZIP contains the <strong>complete source code</strong> (Vite, React, TypeScript, Capacitor configs). To get an installable <strong>.apk</strong> or publish to <strong>Itch.io</strong> and <strong>Google Play</strong>, use the 1-click cloud builder or CLI below!
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('itch');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'itch'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-red-300" />
            <span>1. Publish on Itch.io</span>
            <span className="text-[9px] bg-red-400/30 text-white px-1.5 py-0.2 rounded font-black">APK READY</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('playstore');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'playstore'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Google Play Store</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('apk');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. 1-Click .APK Generator</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('instant');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'instant'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>4. Install on Phone</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('developer');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'developer'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>5. CLI / Android Studio</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ITCH.IO PUBLISHING GUIDE */}
          {activeTab === 'itch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 via-slate-800 to-black border border-red-500/40">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Gamepad2 className="w-5 h-5 text-red-400" />
                  <span>How to Publish MIDO AI on Itch.io as an Android APK</span>
                </div>
                <p className="text-xs text-slate-300">
                  Itch.io allows you to distribute your Android APK to thousands of users worldwide for free or with donations!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Generate your `.apk` file</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Go to the <strong className="text-white">"3. 1-Click .APK Generator"</strong> tab, paste your link into PWABuilder, and click <strong>Generate APK</strong>. You'll get <code className="text-red-400">mido-ai.apk</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Create a New Project on Itch.io</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Log in to <strong className="text-white">itch.io</strong> and click <strong>"Create new project"</strong>.
                    </p>
                    <ul className="text-[11px] text-slate-300 mt-2 space-y-1 bg-black/60 p-2.5 rounded-xl border border-white/5">
                      <li>• <strong>Title:</strong> MIDO AI - Next-Gen AI Video Studio & Multi-Agent App</li>
                      <li>• <strong>Classification:</strong> App / Tool or Game</li>
                      <li>• <strong>Kind of project:</strong> Select <strong className="text-red-400">Downloadable</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Upload your `mido-ai.apk` &amp; Check Android</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Under <strong>Uploads</strong>, click <strong>"Upload files"</strong> and select your <code className="text-emerald-400">.apk</code> file.
                    </p>
                    <div className="mt-2 p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[11px] text-red-200">
                      ⚠️ <strong>IMPORTANT:</strong> Check the box next to your file that says <span className="font-bold underline">"This file will be played on Android"</span> (with the Android robot icon).
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Publish!</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Set Visibility to <strong>Public</strong> and click <strong>Save &amp; View Page</strong>. Users can now download and install your APK directly on their Android devices from itch.io!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://itch.io/game/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Open Itch.io New Project Page</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE PLAY STORE PUBLISHING GUIDE */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/20 via-slate-800 to-black border border-emerald-500/40">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Store className="w-5 h-5 text-emerald-400" />
                  <span>Publishing on Google Play Console (.AAB &amp; .APK)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Google Play requires an Android App Bundle (<code className="text-emerald-400">.aab</code>) signed with a release key and target SDK 34+.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center justify-between">
                    <span>App Metadata &amp; Package ID</span>
                    <button
                      onClick={handleCopyPackageId}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-[10px] text-emerald-300 font-bold hover:bg-emerald-600/50 flex items-center gap-1"
                    >
                      {copiedPackageId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPackageId ? 'Copied' : 'Copy Package ID'}</span>
                    </button>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-black/60 p-2 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[9px]">PACKAGE ID</span>
                      <span className="text-emerald-400 font-bold">{packageId}</span>
                    </div>
                    <div className="bg-black/60 p-2 rounded-xl border border-white/5">
                      <span className="text-slate-500 block text-[9px]">APP NAME</span>
                      <span className="text-white font-bold">MIDO AI</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-white">Generate Google Play Android App Bundle (.aab):</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        In PWABuilder (or Android Studio), choose <strong>"Android App Bundle (.aab)"</strong> which is required by Google Play Store.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-white">Open Google Play Console:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Go to <strong className="text-white">play.google.com/console</strong> &gt; <strong>Create app</strong> &gt; Set name to <strong>MIDO AI</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-white">Upload .aab to Production Track:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Go to <strong>Production &gt; Create new release</strong> &gt; Upload your generated <code className="text-emerald-400">.aab</code> file &gt; Submit for review!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://play.google.com/console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Store className="w-4 h-4" />
                  <span>Open Google Play Console</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK .APK GENERATOR */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Download className="w-4 h-4 text-red-400" />
                  <span>Instant 1-Click .APK / .AAB Cloud Compiler</span>
                </div>
                <p className="text-xs text-slate-300">
                  PWABuilder (by Microsoft) automatically converts your live app URL into a signed Android <code className="text-red-400 font-mono">.apk</code> for Itch.io &amp; <code className="text-emerald-400 font-mono">.aab</code> for Google Play.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>How to generate your files:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1">
                    <li>Copy your live App URL below.</li>
                    <li>Open <strong className="text-white">PWABuilder.com</strong> in a new tab.</li>
                    <li>Paste your URL and click <strong>Start</strong>.</li>
                    <li>Click <strong>Package for Stores &gt; Android</strong>.</li>
                    <li>
                      For <strong>Itch.io</strong>: Select <strong>APK</strong>.<br />
                      For <strong>Google Play</strong>: Select <strong>Android App Bundle (AAB)</strong>.
                    </li>
                    <li>Download your package ready to upload!</li>
                  </ol>
                </div>

                <div className="p-3 bg-black/60 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Live Web App URL:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentAppUrl}
                      className="bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono flex-1 select-all"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                  >
                    <span>Open PWABuilder.com</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INSTANT PHONE INSTALL */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 via-slate-800 to-black border border-red-500/40">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Zap className="w-4 h-4 text-red-400" />
                  <span>Instant 1-Tap Phone Install (Takes 5 seconds!)</span>
                </div>
                <p className="text-xs text-slate-300">
                  You do not need a computer or APK installer! MIDO AI installs directly on your Android home screen with the custom logo and runs in full-screen standalone mode.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Open this URL on your Android Phone</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Open Google Chrome or Samsung Internet on your phone and browse to this URL:
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={currentAppUrl}
                        className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono flex-1 select-all"
                      />
                      <button
                        onClick={handleCopyUrl}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tap the 3 dots menu (⋮) in Chrome</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      In the top-right corner of your browser, tap the three vertical dots.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Tap "Install App" or "Add to Home Screen"</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tap <strong>Install</strong>. The <strong>MIDO AI</strong> app with your custom logo will appear on your phone screen, app drawer, and work in full-screen standalone mode!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLI / ANDROID STUDIO */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                  <Terminal className="w-4 h-4 text-red-400" />
                  <span>Build APK from Source Code (Android Studio / Gradle)</span>
                </div>
                <p className="text-xs text-slate-300">
                  The downloaded ZIP contains <code className="text-red-400 font-mono">capacitor.config.json</code> ready for Gradle / Android Studio build.
                </p>
              </div>

              <div className="bg-black/90 p-3.5 rounded-2xl border border-white/10 font-mono text-[11px] text-emerald-400 space-y-2 overflow-x-auto">
                <div className="text-slate-400"># 1. Extract the downloaded ZIP file</div>
                <div>cd mido-ai-app</div>
                <div className="text-slate-400"># 2. Install dependencies &amp; build web assets</div>
                <div>npm install</div>
                <div>npm run build</div>
                <div className="text-slate-400"># 3. Add Android platform &amp; compile APK</div>
                <div>npx cap add android</div>
                <div>npx cap sync android</div>
                <div>npx cap open android</div>
                <div className="text-slate-400"># In Android Studio: Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</div>
                <div className="text-slate-400"># For Itch.io: output is at android/app/build/outputs/apk/release/app-release-unsigned.apk</div>
                <div className="text-slate-400"># For Google Play: Build &gt; Generate Signed Bundle / APK &gt; Android App Bundle</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>MIDO AI v3.5 • Itch.io &amp; Google Play Store Ready</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
