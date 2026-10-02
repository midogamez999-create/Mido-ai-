import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { GroundingSource } from '../types';
import { soundFx } from '../lib/soundFx';

interface ChatGptSearchResultCardProps {
  sources: GroundingSource[];
  queryTopic?: string;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function extractSiteName(url: string, title?: string): string {
  const domain = extractDomain(url);
  const parts = domain.split('.');
  if (parts.length > 1) {
    const main = parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return title || domain;
}

export const ChatGptSearchResultCard: React.FC<ChatGptSearchResultCardProps> = ({
  sources,
  queryTopic
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const primary = sources[0];
  const domain = extractDomain(primary.uri);
  const siteName = extractSiteName(primary.uri, primary.title);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

  return (
    <div className="my-2.5 not-prose font-sans select-none animate-fadeIn">
      {/* 1. COMPACT CHATGPT SEARCH PILL */}
      <div className="inline-flex flex-wrap items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-white/10 hover:border-cyan-500/40 shadow-lg backdrop-blur-md transition-all group">
        {/* Favicon / Globe badge */}
        <div className="w-7 h-7 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
          <img
            src={faviconUrl}
            alt={siteName}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              // Fallback to globe icon
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<span class="text-cyan-400 text-xs">🌐</span>';
              }
            }}
          />
        </div>

        {/* Site searched details */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Search className="w-2.5 h-2.5" />
            Searched
          </span>
          <span className="text-white font-bold truncate max-w-[140px] sm:max-w-[200px]">
            {siteName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            ({domain})
          </span>
        </div>

        {/* Open Direct Site Button */}
        <a
          href={primary.uri}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => soundFx.playClick()}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 text-[11px] font-bold transition-all shadow-sm group-hover:border-cyan-500/60"
          title={`Open ${primary.title || domain}`}
        >
          <span>Open Site</span>
          <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Toggle Multiple Sources if more than 1 */}
        {sources.length > 1 && (
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
            title={`${sources.length} sources found`}
          >
            <span>+{sources.length - 1}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* 2. EXPANDED MULTI-SOURCE CARDS DRAWER */}
      {isExpanded && sources.length > 1 && (
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/90 border border-white/10 shadow-xl animate-fadeIn">
          {sources.map((src, i) => {
            const sDomain = extractDomain(src.uri);
            const sName = extractSiteName(src.uri, src.title);
            const sFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(sDomain)}&sz=64`;

            return (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundFx.playClick()}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                  <img
                    src={sFavicon}
                    alt={sName}
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-cyan-400 text-[10px]">🌐</span>';
                      }
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                      {sName}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {src.title || sDomain}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
