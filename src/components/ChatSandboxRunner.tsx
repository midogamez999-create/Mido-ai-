import React, { useState, useMemo } from 'react';
import { soundFx } from '../lib/soundFx';
import {
  Play,
  RotateCcw,
  ExternalLink,
  Code2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

interface ChatSandboxRunnerProps {
  html: string;
  css?: string;
  js?: string;
  title?: string;
  onOpenInAppStudio?: () => void;
}

export const ChatSandboxRunner: React.FC<ChatSandboxRunnerProps> = ({
  html,
  css = '',
  js = '',
  title = 'Interactive Web Application',
  onOpenInAppStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  const fullDocument = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    ${css}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  ${html}
  <script>
    try {
      ${js}
    } catch(err) {
      console.error("Sandbox Runtime Error:", err);
    }
  </script>
</body>
</html>`;
  }, [html, css, js, title]);

  const handleCopyCode = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(fullDocument);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    soundFx.playClick();
    setKey((prev) => prev + 1);
  };

  return (
    <div
      className={`my-3.5 rounded-2xl border border-indigo-500/30 bg-slate-950 overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 flex flex-col bg-slate-950 border-indigo-500 shadow-indigo-500/20'
          : 'relative w-full'
      }`}
    >
      {/* Sandbox Header Bar */}
      <div className="px-3.5 py-2.5 bg-slate-900 border-b border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white line-clamp-1">{title}</h4>
            <span className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Interactive Sandbox
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('preview');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ▶️ Run App
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('code');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💻 Code
            </button>
          </div>

          {/* Reload Preview */}
          {activeTab === 'preview' && (
            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reload sandbox"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy Full Document HTML/CSS/JS"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Sandbox'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Open in Full App Studio */}
          {onOpenInAppStudio && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenInAppStudio();
              }}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <span>App Studio</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className={`w-full ${isFullscreen ? 'flex-1 min-h-0' : 'h-80 sm:h-96'}`}>
        {activeTab === 'preview' ? (
          <iframe
            key={key}
            srcDoc={fullDocument}
            title={title}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none bg-slate-950"
          />
        ) : (
          <div className="w-full h-full p-3 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto whitespace-pre">
            {fullDocument}
          </div>
        )}
      </div>
    </div>
  );
};
