import React, { useState } from 'react';
import { PluginActionResult } from '../lib/pluginsSystem';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Play,
  Pause,
  Copy,
  Check,
  Navigation,
  Clock,
  Sparkles,
  Shield,
  ShoppingBag,
  Music,
  MapPin,
  Send,
  Flame,
  Award,
  Terminal,
  Code2,
  CheckCircle2,
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  RotateCcw
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import { speechManager } from '../lib/speechManager';

interface PluginActionCardProps {
  result: PluginActionResult;
}

export const PluginActionCard: React.FC<PluginActionCardProps> = ({ result }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const { cardType, cardData, pluginName, icon, operationName, requestPayload, responsePayload, summary } = result;

  const handleCopy = (text: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const toggleAudio = () => {
    soundFx.playClick();
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="mt-3 space-y-3 font-sans not-prose">
      {/* 1. AUTHENTIC CHATGPT PLUGIN EXECUTION PILL */}
      <div className="rounded-xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-md">
        <button
          onClick={() => {
            soundFx.playClick();
            setIsDetailsOpen(!isDetailsOpen);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-semibold text-slate-200">
              Used <span className="font-bold text-white">{pluginName}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>{operationName}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              {isDetailsOpen ? 'Hide API Payload' : 'View API Payload'}
            </span>
            {isDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Collapsible Request & Response JSON Inspection */}
        {isDetailsOpen && (
          <div className="border-t border-white/10 p-3 bg-slate-950/90 text-xs font-mono space-y-2.5 animate-fadeIn">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Request Parameters:
              </span>
              <pre className="p-2 rounded-lg bg-black/50 border border-white/5 text-cyan-300 text-[11px] overflow-x-auto">
                {JSON.stringify(requestPayload || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Plugin Response Data:
              </span>
              <pre className="p-2 rounded-lg bg-black/50 border border-white/5 text-emerald-300 text-[11px] overflow-x-auto">
                {JSON.stringify(responsePayload || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 2. RICH INTERACTIVE RESULT WIDGET */}
      {/* A. MUSIC / SPOTIFY CARD */}
      {cardType === 'music' && cardData && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <img
              src={cardData.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80'}
              alt={cardData.title}
              className="w-16 h-16 rounded-xl object-cover border border-emerald-500/40 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                Spotify Track Preview
              </span>
              <h4 className="text-sm font-black text-white truncate">{cardData.title}</h4>
              <p className="text-xs text-slate-300 font-medium truncate">{cardData.artist}</p>
              <p className="text-[11px] text-slate-500">{cardData.album} · {cardData.duration}</p>
            </div>

            {cardData.spotifyUrl && (
              <a
                href={cardData.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <span>Open Spotify</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Lyrics snippet */}
          {cardData.lyrics && (
            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs text-slate-300 italic">
              <span className="not-italic text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Lyrics Snippet:
              </span>
              {cardData.lyrics.map((line: string, i: number) => (
                <p key={i} className="leading-snug">"{line}"</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* B. MATH / WOLFRAM ALPHA CARD */}
      {cardType === 'math' && cardData && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧮</span>
              <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                Wolfram Alpha Computed Solution
              </h4>
            </div>

            {cardData.wolframUrl && (
              <a
                href={cardData.wolframUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Full Computational Notebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-sm text-white">
            <span className="text-slate-500 text-xs block mb-1">Target Formula:</span>
            <span className="text-amber-300 font-bold">{cardData.equation}</span>
          </div>

          {cardData.steps && (
            <div className="space-y-1 text-xs text-slate-300 font-mono bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Step-by-Step Derivation:
              </span>
              {cardData.steps.map((st: string, idx: number) => (
                <div key={idx} className="leading-relaxed">{st}</div>
              ))}
            </div>
          )}

          {cardData.roots && (
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <span className="text-slate-400 py-1">Roots / Solutions:</span>
              {cardData.roots.map((r: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* C. SHOPPING / PRODUCT CARD */}
      {cardType === 'product' && cardData && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <img
              src={cardData.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'}
              alt={cardData.title}
              className="w-16 h-16 rounded-xl object-cover border border-amber-500/40 shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                Amazon Verified Prime Deal
              </span>
              <h4 className="text-sm font-black text-white truncate">{cardData.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-black text-amber-400">{cardData.price}</span>
                {cardData.originalPrice && (
                  <span className="text-xs text-slate-500 line-through">{cardData.originalPrice}</span>
                )}
                {cardData.discount && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                    {cardData.discount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{cardData.rating}</p>
            </div>

            {cardData.amazonUrl && (
              <a
                href={cardData.amazonUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 shrink-0"
              >
                <span>View on Amazon</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* D. WEB SEARCH CITATIONS */}
      {cardType === 'search' && cardData && cardData.citations && (
        <div className="rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 p-3.5 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Browser Verified Sources:</span>
          </div>

          <div className="space-y-1.5">
            {cardData.citations.map((c: any, idx: number) => (
              <a
                key={idx}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white group-hover:text-cyan-300">
                  <span className="truncate">{c.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 shrink-0 ml-2" />
                </div>
                {c.snippet && (
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                    {c.snippet}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* E. LOCATION & NAVIGATION */}
      {cardType === 'location' && cardData && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-bold block">
                  Google Maps Route
                </span>
                <h4 className="text-sm font-black text-white">{cardData.destination}</h4>
              </div>
            </div>

            {cardData.mapsUrl && (
              <a
                href={cardData.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20"
              >
                <span>Navigate</span>
                <Navigation className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>ETA: <strong className="text-white">{cardData.duration}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Distance: <strong className="text-white">{cardData.distance}</strong></span>
            </div>
            <div className="text-emerald-400 font-bold ml-auto">
              {cardData.trafficStatus}
            </div>
          </div>
        </div>
      )}

      {/* F. TALKING TOOL / NEURAL VOICE OUTPUT */}
      {cardType === 'voice' && cardData && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 p-4 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-bold block">
                  Mido Talking Tool Neural Audio
                </span>
                <h4 className="text-sm font-black text-white">Voice Synthesizer (Active)</h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFx.playClick();
                  speechManager.speak(cardData.text, 'plugin_voice_' + (result.pluginId || 'card'));
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
                title="Play Neural Voice"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Voice</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  speechManager.stop();
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs transition-colors"
                title="Stop Speech"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between gap-1 h-12 px-4">
            {[40, 75, 55, 90, 65, 30, 85, 100, 70, 45, 95, 60, 80, 50, 90, 65, 85, 40, 70, 55].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 via-pink-400 to-indigo-400 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                }}
              />
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 flex items-start justify-between gap-3">
            <p className="italic text-slate-300 line-clamp-2">"{cardData.text}"</p>
            <button
              onClick={() => handleCopy(cardData.text)}
              className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0 pt-0.5"
            >
              {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedText ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
