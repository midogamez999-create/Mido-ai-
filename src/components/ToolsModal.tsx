import React, { useState } from 'react';
import {
  X,
  Calculator,
  Calendar,
  Lightbulb,
  Plus,
  Trash2,
  Check,
  Copy,
  Sparkles,
  TrendingUp,
  DollarSign,
  Rocket,
  Code2,
  Bot,
  Video,
  ChevronRight,
  ChevronLeft,
  Flame,
  Award,
} from 'lucide-react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'calculator' | 'calendar' | 'ideas';
  onSendPrompt?: (prompt: string, mode?: string) => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'calculator',
  onSendPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'calendar' | 'ideas'>(defaultTab);

  // --- CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  // Creator Revenue Calculator
  const [views, setViews] = useState('50000');
  const [cpm, setCpm] = useState('4.5');
  const [sponsorDeals, setSponsorDeals] = useState('300');

  // --- CALENDAR STATE ---
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 27)); // July 2026
  const [events, setEvents] = useState<{ id: string; date: string; title: string; category: 'youtube' | 'app' | 'discord' | 'general' }[]>([
    { id: '1', date: '2026-07-27', title: '⚽ 3D Football 60FPS Launch', category: 'app' },
    { id: '2', date: '2026-07-28', title: '🔴 YouTube Subscriber Stream', category: 'youtube' },
    { id: '3', date: '2026-07-30', title: '🤖 Discord Bot Server Broadcast', category: 'discord' },
    { id: '4', date: '2026-08-02', title: '💰 Ad Monetization Payout Check', category: 'general' },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-07-27');
  const [newEventCategory, setNewEventCategory] = useState<'youtube' | 'app' | 'discord' | 'general'>('app');

  // --- PROJECT IDEAS STATE ---
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'webgl' | 'saas' | 'discord' | 'youtube'>('all');
  const [ideasFilter, setIdeasFilter] = useState('');

  const projectIdeas = [
    {
      id: '1',
      title: '⚽ 3D WebGL Football Match Simulator (60FPS)',
      category: 'webgl',
      difficulty: 'Intermediate',
      potentialRevenue: '$2,500/mo',
      description: 'Physics-based bend kicks, crowd cheer audio synthesizer, stadium floodlights, and live score HUD.',
      prompt: 'Build a 3D HTML5 Canvas Football Kick Simulator with curve spin physics, goal sound effect, score counter, and 60FPS particle effects.',
    },
    {
      id: '2',
      title: '🤖 Discord AI Bot & Auto-Moderation Hub',
      category: 'discord',
      difficulty: 'Easy',
      potentialRevenue: '$800/mo',
      description: 'Multi-server bot with slash commands, leveling system, custom reaction roles, and automated announcement webhooks.',
      prompt: 'Create a Discord bot dashboard with custom slash commands, levelling system, reaction role generator, and automated webhook poster.',
    },
    {
      id: '3',
      title: '🔴 YouTube Shorts Viral Script & Thumbnail Generator',
      category: 'youtube',
      difficulty: 'Easy',
      potentialRevenue: '$1,800/mo',
      description: 'AI tool that parses video topics, outputs high-CTR hook titles, 30-second scripts, and high-contrast thumbnail prompt concepts.',
      prompt: 'Build a YouTube Shorts viral script writer and CTR title generator with hook analyzer, hashtags, and thumbnail preview.',
    },
    {
      id: '4',
      title: '💼 SaaS AI Landing Page & Pricing Matrix Builder',
      category: 'saas',
      difficulty: 'Advanced',
      potentialRevenue: '$4,000/mo',
      description: 'Dark luxury SaaS landing page with dark mode, interactive pricing tier toggles, customer testimonials, and Stripe payment mockup.',
      prompt: 'Create a modern dark mode SaaS landing page with animated feature cards, monthly/annual pricing toggle, interactive ROI calculator, and checkout form.',
    },
    {
      id: '5',
      title: '🎵 AI Lo-Fi Beats & Synthwave Music Player',
      category: 'webgl',
      difficulty: 'Intermediate',
      potentialRevenue: '$1,200/mo',
      description: 'Procedural audio synth playing relaxing lo-fi chord progressions with animated background retro visualizer canvas.',
      prompt: 'Build a retro Synthwave & Lo-Fi music player with Web Audio API synthesizer, customizable beat tempo, and audio frequency canvas visualizer.',
    },
  ];

  if (!isOpen) return null;

  // Scientific Calculator Handlers
  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        const sanitized = calcDisplay.replace(/×/g, '*').replace(/÷/g, '/');
        // Safe math evaluation for basic expressions
        const result = Function(`'use strict'; return (${sanitized})`)();
        setCalcHistory((prev) => [`${calcDisplay} = ${result}`, ...prev.slice(0, 4)]);
        setCalcDisplay(String(result));
      } catch (e) {
        setCalcDisplay('Error');
      }
      return;
    }
    if (calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(val);
    } else {
      setCalcDisplay((prev) => prev + val);
    }
  };

  // Add Event Handler
  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: newEventDate,
        title: newEventTitle.trim(),
        category: newEventCategory,
      },
    ]);
    setNewEventTitle('');
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Creator ROI Calculations
  const totalViewsNum = parseFloat(views) || 0;
  const cpmNum = parseFloat(cpm) || 0;
  const sponsorNum = parseFloat(sponsorDeals) || 0;
  const estimatedAdRevenue = ((totalViewsNum / 1000) * cpmNum).toFixed(2);
  const totalCreatorEarnings = (((totalViewsNum / 1000) * cpmNum) + sponsorNum).toFixed(2);

  const filteredIdeas = projectIdeas.filter((idea) => {
    const matchesCat = selectedCategory === 'all' || idea.category === selectedCategory;
    const matchesSearch =
      idea.title.toLowerCase().includes(ideasFilter.toLowerCase()) ||
      idea.description.toLowerCase().includes(ideasFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">mido.ai Creator Utilities Hub</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                  3-in-1 Tools
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Calculator &amp; Creator Revenue ROI • Content Calendar Planner • 50+ Project Ideas Matrix
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

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-black/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'calculator'
                ? 'border-indigo-400 text-white bg-indigo-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Calculator &amp; Monetization ROI</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'calendar'
                ? 'border-emerald-400 text-white bg-emerald-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Content Schedule Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all shrink-0 border-b-2 ${
              activeTab === 'ideas'
                ? 'border-amber-400 text-white bg-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Project Ideas Vault</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 text-slate-100">
          {/* TAB 1: CALCULATOR & REVENUE ROI */}
          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Scientific Math Calculator */}
              <div className="md:col-span-6 p-5 rounded-3xl bg-slate-950 border border-white/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Scientific Calculator</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Math Engine</span>
                </div>

                {/* Calculator Display */}
                <div className="p-4 rounded-2xl bg-black border border-white/20 text-right space-y-1 font-mono">
                  <div className="text-[10px] text-slate-400 h-4 truncate">
                    {calcHistory[0] || 'mido.ai Math Studio'}
                  </div>
                  <div className="text-2xl font-black text-white tracking-wider truncate">{calcDisplay}</div>
                </div>

                {/* Calculator Buttons Grid */}
                <div className="grid grid-cols-4 gap-2 text-sm font-bold font-mono">
                  {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '%', '='].map(
                    (btn) => (
                      <button
                        key={btn}
                        onClick={() => handleCalcClick(btn)}
                        className={`py-3 rounded-xl transition-all shadow-md active:scale-95 ${
                          btn === '='
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold col-span-1'
                            : btn === 'C'
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40'
                            : ['÷', '×', '-', '+'].includes(btn)
                            ? 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        {btn}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Right Column: Creator Monetization & eCPM ROI Calculator */}
              <div className="md:col-span-6 p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Creator Revenue &amp; ROI Calculator</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Live Simulator
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Video Views / App Users</label>
                    <input
                      type="number"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Ad eCPM ($ / 1k views)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={cpm}
                        onChange={(e) => setCpm(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Sponsor Deals ($)</label>
                      <input
                        type="number"
                        value={sponsorDeals}
                        onChange={(e) => setSponsorDeals(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Calculation Results Card */}
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Estimated AdSense / Ad Payout:</span>
                    <span className="font-mono font-bold text-emerald-400">${estimatedAdRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
                    <span className="text-white font-extrabold">Total Monthly Revenue Potential:</span>
                    <span className="font-mono font-black text-lg text-emerald-300">${totalCreatorEarnings}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Content Schedule &amp; Release Calendar</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Plan video launches, app releases, and Discord bot announcements with deadline tracking.
                  </p>
                </div>
              </div>

              {/* Add New Schedule Event Form */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Add New Creator Schedule Event</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Event Title (e.g. ⚽ Live Stream Match)..."
                    className="sm:col-span-2 px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
                  />

                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="px-3 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
                  />

                  <select
                    value={newEventCategory}
                    onChange={(e: any) => setNewEventCategory(e.target.value)}
                    className="px-3 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
                  >
                    <option value="app">App Release</option>
                    <option value="youtube">YouTube Video</option>
                    <option value="discord">Discord Event</option>
                    <option value="general">General Task</option>
                  </select>
                </div>

                <button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-slate-950" />
                  <span>Schedule Event</span>
                </button>
              </div>

              {/* Events List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-3 shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {evt.date}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400">{evt.category}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{evt.title}</div>
                    </div>

                    <button
                      onClick={() => handleRemoveEvent(evt.id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT IDEAS VAULT */}
          {activeTab === 'ideas' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>50+ High-Yield Project Ideas Matrix</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Discover viral web application ideas, WebGL 3D games, Discord bots, and YouTube shorts creators.
                  </p>
                </div>

                <input
                  type="text"
                  value={ideasFilter}
                  onChange={(e) => setIdeasFilter(e.target.value)}
                  placeholder="Filter ideas..."
                  className="px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white max-w-xs"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Projects' },
                  { id: 'webgl', label: '⚽ 3D Games & Canvas' },
                  { id: 'discord', label: '🤖 Discord Bots' },
                  { id: 'youtube', label: '🔴 YouTube Tools' },
                  { id: 'saas', label: '💼 SaaS Web Apps' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Ideas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                          {idea.category}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-400 font-mono">{idea.potentialRevenue}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white">{idea.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{idea.description}</p>
                    </div>

                    {onSendPrompt && (
                      <button
                        onClick={() => {
                          onSendPrompt(idea.prompt, 'app-studio');
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Build This App Now</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
