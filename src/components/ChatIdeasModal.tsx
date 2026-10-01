import React, { useState } from 'react';
import { soundFx } from '../lib/soundFx';
import { UserSecrets } from '../types';
import {
  Lightbulb,
  Sparkles,
  Zap,
  Code2,
  Video,
  Trophy,
  Brain,
  X,
  Play,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Dice5,
  Layers,
  Search,
} from 'lucide-react';

export interface IdeaItem {
  id: string;
  title: string;
  tag: string;
  prompt: string;
  highlight: string;
  category: 'apps' | 'youtube' | 'football' | 'science' | 'code';
}

const CURATED_IDEAS: IdeaItem[] = [
  // Web & AI Apps
  {
    id: 'app_1',
    category: 'apps',
    title: '3D Galaxy Synthwave Visualizer',
    tag: 'Web & AI App',
    highlight: 'Interactive 3D particle universe reacting to synth polyphonic beats',
    prompt: 'Build a full-screen interactive 3D WebGL Galaxy & Synthwave Audio Visualizer in clean HTML, CSS, and JavaScript with particle orbit physics, neon glow shaders, and sound synthesizer.',
  },
  {
    id: 'app_2',
    category: 'apps',
    title: 'Autonomous AI Persona Debate Arena',
    tag: 'Web & AI App',
    highlight: 'Two AI personas debating any topic in real-time with visual scorecards',
    prompt: 'Create a fully interactive web app where two AI debaters (e.g. Elon Musk vs Albert Einstein) debate user-chosen topics with animated avatars, live round scoring, and sound effects.',
  },
  {
    id: 'app_3',
    category: 'apps',
    title: 'Retro Cyberpunk Rogue Hacker Terminal',
    tag: 'Web & AI App',
    highlight: 'Gamified OSINT terminal with decryption minigames and matrix canvas',
    prompt: 'Build an interactive Cyberpunk OSINT & Hacker Terminal Simulator with green CRT scanlines, decryptable node missions, sound FX, inventory, and animated matrix rain canvas.',
  },
  {
    id: 'app_4',
    category: 'apps',
    title: 'Real-Time Voice AI Workspace with Dynamic Notes',
    tag: 'Web & AI App',
    highlight: 'Smart voice-transcribed Kanban with instant AI task expansion',
    prompt: 'Build a sleek dark-mode Productivity Dashboard with voice note dictation, automatic AI task categorization, drag-and-drop Kanban columns, and local persistence.',
  },

  // Viral YouTube & TikTok
  {
    id: 'yt_1',
    category: 'youtube',
    title: 'I Let AI Control My Life for 24 Hours in 2026',
    tag: 'Viral Video',
    highlight: 'High retention challenge script with tension arc and dramatic hooks',
    prompt: 'Write a viral YouTube video script outline and 3 high-CTR thumbnail titles for: "I Let Mido AI Make All My Decisions for 24 Hours (And It Won $10,000)". Include hook, pacing, and B-roll cues.',
  },
  {
    id: 'yt_2',
    category: 'youtube',
    title: '7 Hidden Developer Secrets Big Tech Hides From You',
    tag: 'Viral Video',
    highlight: 'Fast-paced tech exposé style with curiosity gaps and code demos',
    prompt: 'Create an engaging, viral TikTok / Shorts script with dynamic text overlays, sound cue markers, and punchy hook for: "7 Insane Browser APIs you did not know existed in 2026".',
  },
  {
    id: 'yt_3',
    category: 'youtube',
    title: 'AI Simulator: What Happens if Earth Stops Rotating?',
    tag: 'Viral Video',
    highlight: 'Cinematic documentary storytelling with scientific simulations',
    prompt: 'Write a cinematic documentary script for a YouTube video exploring "What Happens to the World if Earth Stops Rotating for Just 5 Seconds", complete with voiceover timestamps and dramatic visual prompts.',
  },

  // Football & 2026 World Cup
  {
    id: 'ft_1',
    category: 'football',
    title: 'Real Madrid 2026: Ancelotti & Alonso Masterclass',
    tag: 'Football Tactical',
    highlight: 'Deep tactical breakdown of midfield diamond and inverted fullbacks',
    prompt: 'Provide a masterclass tactical breakdown of Real Madrid’s 2026 formation, analyzing Jude Bellingham’s box crashing, Mbappé & Vinícius transitional speed, and defensive counter-pressing.',
  },
  {
    id: 'ft_2',
    category: 'football',
    title: 'FIFA World Cup 2026: Tournament Winner Simulation',
    tag: 'World Cup 2026',
    highlight: 'Data-driven match simulation from group stages to the final in USA/Mexico/Canada',
    prompt: 'Simulate the entire knockout stage of the FIFA 2026 World Cup, analyzing match predictions, key player matchups, tactical setups, and projecting the champion with scorelines.',
  },
  {
    id: 'ft_3',
    category: 'football',
    title: 'Champions League Super Final Tactical Duel',
    tag: 'Champions League',
    highlight: 'High-intensity tactical battle between elite European heavyweights',
    prompt: 'Analyze a hypothetical UEFA Champions League Final between Real Madrid and Manchester City: tactical pressing traps, set-piece strategies, substitution game plans, and key player battles.',
  },

  // Mind-Bending Science & Philosophy
  {
    id: 'sci_1',
    category: 'science',
    title: 'Quantum Entanglement & Non-Locality Demystified',
    tag: 'Mind-Bending Science',
    highlight: 'Visual thought experiments explaining spooky action at a distance',
    prompt: 'Explain Quantum Entanglement and Bell’s Inequality using intuitive analogies, visual thought experiments, and why Einstein called it "spooky action at a distance", without mathematical jargon.',
  },
  {
    id: 'sci_2',
    category: 'science',
    title: 'The Fermi Paradox: The Great Filter Explained',
    tag: 'Mind-Bending Science',
    highlight: 'Evaluating the 5 most terrifying solutions to why aliens have not contacted us',
    prompt: 'Break down the Fermi Paradox and the 5 most compelling hypotheses (The Great Filter, Dark Forest, Zoo Hypothesis, Simulation Theory) with philosophical and scientific rigor.',
  },
  {
    id: 'sci_3',
    category: 'science',
    title: 'Are We Living in a Computed Simulation?',
    tag: 'Philosophy & AI',
    highlight: 'Nick Bostrom’s simulation argument analyzed with modern computing laws',
    prompt: 'Explore the Simulation Hypothesis from an engineering perspective: computational limits of universe simulation, quantum pixelation at Planck scale, and evidence for and against.',
  },

  // Code & Bot Automation
  {
    id: 'code_1',
    category: 'code',
    title: 'Full-Stack Discord Bot with Slash Commands & Music',
    tag: 'Coding Architecture',
    highlight: 'Production-ready Node.js Discord.js v14 bot with interactive buttons',
    prompt: 'Write complete, production-grade code for a Discord.js v14 bot with slash command handlers, XP leveling system, queue-based music player, and moderation logging with zero placeholders.',
  },
  {
    id: 'code_2',
    category: 'code',
    title: '2D Retro Space Shooter Canvas Game',
    tag: 'Coding Architecture',
    highlight: 'Pure JavaScript canvas game with sound synth, power-ups, and boss battles',
    prompt: 'Build a complete, playable 2D Neon Space Shooter game in a single HTML file with particle explosions, Web Audio API sound synthesizers, enemy waves, power-ups, and high scores.',
  },
  {
    id: 'code_3',
    category: 'code',
    title: 'Automated Web OSINT & Digital Footprint Scanner',
    tag: 'Cybersecurity & Code',
    highlight: 'Automated script for public DNS, SSL, and subdomain security audits',
    prompt: 'Create a Python and Node.js security script for ethical OSINT recon, demonstrating automated DNS resolution, SSL cert expiration audits, security header checks, and threat scoring.',
  },
];

interface ChatIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string, sendImmediately?: boolean) => void;
  secrets?: UserSecrets;
}

export const ChatIdeasModal: React.FC<ChatIdeasModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  secrets,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'apps' | 'youtube' | 'football' | 'science' | 'code'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicIdeas, setDynamicIdeas] = useState<IdeaItem[]>([]);

  if (!isOpen) return null;

  const filteredIdeas = [
    ...dynamicIdeas,
    ...(activeTab === 'all' ? CURATED_IDEAS : CURATED_IDEAS.filter((i) => i.category === activeTab)),
  ];

  const handleCopy = (e: React.MouseEvent, idea: IdeaItem) => {
    e.stopPropagation();
    soundFx.playClick();
    navigator.clipboard.writeText(idea.prompt);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSurpriseMe = () => {
    soundFx.playSuccess();
    const random = CURATED_IDEAS[Math.floor(Math.random() * CURATED_IDEAS.length)];
    onSelectPrompt(random.prompt, true);
    onClose();
  };

  const handleGenerateCustomIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    soundFx.playClick();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeTab === 'all' ? 'apps' : activeTab,
          topic: customTopic.trim() || 'Futuristic & Trending 2026',
          count: 4,
          secrets,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.ideas) && data.ideas.length > 0) {
        soundFx.playSuccess();
        const mapped: IdeaItem[] = data.ideas.map((d: any, idx: number) => ({
          id: `dyn_${Date.now()}_${idx}`,
          title: d.title || 'Innovative AI Concept',
          tag: d.tag || 'AI Generated Idea',
          highlight: d.highlight || 'Dynamic creative concept generated by Mido AI',
          prompt: d.prompt || d.title,
          category: (activeTab === 'all' ? 'apps' : activeTab) as any,
        }));
        setDynamicIdeas(mapped);
      }
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Mido AI Insane Ideas Deck
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Spark Hub
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore crazy innovative prompts, viral concepts, interactive web apps &amp; science
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Dice5 className="w-4 h-4" />
              <span>Surprise Me 🎲</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Idea Generator Sub-Bar */}
        <form
          onSubmit={handleGenerateCustomIdeas}
          className="p-3 bg-slate-900/90 border-b border-white/10 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type any custom topic to generate 4 wild ideas (e.g. AI drone racing, Mars colony, Real Madrid)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-indigo-600/30"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isGenerating ? 'Synthesizing Ideas...' : 'Generate New Ideas'}</span>
          </button>
        </form>

        {/* Category Filter Pills */}
        <div className="px-5 py-2.5 border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-950/60">
          {[
            { id: 'all', label: 'All Sparks', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'apps', label: 'Web & AI Apps', icon: <Code2 className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'youtube', label: 'Viral YouTube & TikTok', icon: <Video className="w-3.5 h-3.5 text-red-400" /> },
            { id: 'football', label: 'Football & 2026 Cup', icon: <Trophy className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'science', label: 'Science & Philosophy', icon: <Brain className="w-3.5 h-3.5 text-purple-400" /> },
            { id: 'code', label: 'Coding & Bot Projects', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Ideas Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => {
                soundFx.playClick();
                onSelectPrompt(idea.prompt, true);
                onClose();
              }}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-left transition-all duration-200 group flex flex-col justify-between gap-3 shadow-lg cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                    {idea.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, idea)}
                      className="p-1.5 rounded-lg bg-black/40 hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
                      title="Copy prompt text"
                    >
                      {copiedId === idea.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {idea.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {idea.highlight}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 group-hover:text-indigo-300">
                  <Sparkles className="w-3 h-3 text-amber-400" /> One-click execution
                </span>

                <div className="flex items-center gap-1 text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Run in Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
