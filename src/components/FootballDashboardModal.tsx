import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Flame,
  Newspaper,
  Sparkles,
  Share2,
  ThumbsUp,
  Activity,
  Search,
  Calendar,
  Zap,
  RefreshCw,
  Users,
  Target,
  BarChart3,
  Award,
} from 'lucide-react';

interface FootballDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPrompt?: (prompt: string, mode?: string) => void;
}

const LEAGUES = [
  { code: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸' },
  { code: 'SA', name: 'Serie A', flag: '🇮🇹' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' },
  { code: 'FL1', name: 'Ligue 1', flag: '🇫🇷' },
  { code: 'CL', name: 'Champions League', flag: '🇪🇺' },
];

export const FootballDashboardModal: React.FC<FootballDashboardModalProps> = ({
  isOpen,
  onClose,
  onSendPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'standings' | 'scorers' | 'fixtures' | 'news' | 'tactics'>('live');
  const [selectedLeague, setSelectedLeague] = useState<string>('PL');
  const [selectedFormation, setSelectedFormation] = useState<'4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2'>('4-3-3');
  const [tacticsTeam, setTacticsTeam] = useState<'Real Madrid' | 'Barcelona' | 'Manchester City' | 'Arsenal' | 'Liverpool'>('Real Madrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsLikes, setNewsLikes] = useState<Record<string, number>>({});

  // Data states
  const [liveData, setLiveData] = useState<any[]>([]);
  const [standingsData, setStandingsData] = useState<any>(null);
  const [scorersData, setScorersData] = useState<any[]>([]);
  const [fixturesData, setFixturesData] = useState<any[]>([]);
  const [newsData, setNewsData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch data depending on active tab & selected league
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'live') {
        const res = await fetch('/api/football/live');
        const data = await res.json();
        if (data?.matches) {
          setLiveData(data.matches);
        } else {
          setLiveData([]);
        }
      } else if (activeTab === 'standings') {
        const res = await fetch(`/api/football/standings?league=${selectedLeague}`);
        const data = await res.json();
        setStandingsData(data);
      } else if (activeTab === 'scorers') {
        const res = await fetch(`/api/football/scorers?league=${selectedLeague}&limit=15`);
        const data = await res.json();
        setScorersData(data?.scorers || []);
      } else if (activeTab === 'fixtures') {
        const res = await fetch(`/api/football/fixtures?league=${selectedLeague}&limit=12`);
        const data = await res.json();
        setFixturesData(data?.fixtures || []);
      } else if (activeTab === 'news') {
        const res = await fetch('/api/football/news');
        const data = await res.json();
        setNewsData(data?.news || []);
      }
    } catch (err: any) {
      console.error('Failed to load football data:', err);
      setErrorMsg('Could not fetch live football metrics. Showing cached fallback data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab, selectedLeague]);

  if (!isOpen) return null;

  const handleLikeNews = (id: string) => {
    setNewsLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Mido AI Football Hub</h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  FOOTBALL-DATA.ORG API
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live Scores • League Tables • Top Goalscorers • Fixtures &amp; News
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Matches</span>
            </button>

            <button
              onClick={() => setActiveTab('standings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'standings'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Standings</span>
            </button>

            <button
              onClick={() => setActiveTab('scorers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'scorers'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Top Scorers</span>
            </button>

            <button
              onClick={() => setActiveTab('fixtures')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'fixtures'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Fixtures</span>
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'news'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Football News</span>
            </button>

            <button
              onClick={() => setActiveTab('tactics')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'tactics'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Tactical Pitch ⚽</span>
            </button>
          </div>

          {/* League & Tactics Selector */}
          {activeTab === 'tactics' && (
            <div className="flex items-center gap-2">
              <select
                value={tacticsTeam}
                onChange={(e: any) => setTacticsTeam(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-bold text-white outline-none"
              >
                <option value="Real Madrid">🇪🇸 Real Madrid</option>
                <option value="Barcelona">🇪🇸 FC Barcelona</option>
                <option value="Manchester City">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Manchester City</option>
                <option value="Arsenal">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Arsenal</option>
                <option value="Liverpool">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Liverpool</option>
              </select>
              <select
                value={selectedFormation}
                onChange={(e: any) => setSelectedFormation(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-bold text-white outline-none"
              >
                <option value="4-3-3">Formation 4-3-3</option>
                <option value="4-2-3-1">Formation 4-2-3-1</option>
                <option value="3-5-2">Formation 3-5-2</option>
                <option value="4-4-2">Formation 4-4-2</option>
              </select>
            </div>
          )}

          {/* League Selector */}
          {(activeTab === 'standings' || activeTab === 'scorers' || activeTab === 'fixtures') && (
            <div className="flex items-center gap-2">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {LEAGUES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 text-slate-100 min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs font-bold">Fetching Live Football Data from football-data.org...</p>
            </div>
          )}

          {!isLoading && errorMsg && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: LIVE MATCHES */}
          {!isLoading && activeTab === 'live' && (
            <div className="space-y-4">
              {liveData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Activity className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No active live matches right now.</p>
                  <p className="text-xs text-slate-400">Check upcoming fixtures or league standings!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveData.map((m: any, idx: number) => {
                    const homeTeam = m.homeTeam?.name || m.homeTeam || 'Home Team';
                    const awayTeam = m.awayTeam?.name || m.awayTeam || 'Away Team';
                    const homeScore = m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? 0;
                    const awayScore = m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? 0;
                    const compName = m.competition?.name || 'Football Match';

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl space-y-4 transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
                          <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                            {compName}
                          </span>
                          <span className="font-mono font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                            🔴 {m.status || 'LIVE'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-2">
                          <div className="flex items-center gap-2 w-5/12">
                            {m.homeTeam?.crest && (
                              <img src={m.homeTeam.crest} alt={homeTeam} className="w-6 h-6 object-contain" />
                            )}
                            <span className="text-sm font-extrabold text-white truncate">{homeTeam}</span>
                          </div>

                          <div className="px-4 py-2 rounded-2xl bg-black border border-white/20 font-mono font-black text-2xl text-emerald-400 tracking-widest shadow-inner">
                            {homeScore} - {awayScore}
                          </div>

                          <div className="flex items-center justify-end gap-2 w-5/12 text-right">
                            <span className="text-sm font-extrabold text-white truncate">{awayTeam}</span>
                            {m.awayTeam?.crest && (
                              <img src={m.awayTeam.crest} alt={awayTeam} className="w-6 h-6 object-contain" />
                            )}
                          </div>
                        </div>

                        {onSendPrompt && (
                          <button
                            onClick={() => {
                              onSendPrompt(
                                `Give me a tactical breakdown and analysis for ${homeTeam} vs ${awayTeam} in ${compName}`,
                                'chat'
                              );
                              onClose();
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ask Mido AI for Tactical Analysis</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STANDINGS TABLE */}
          {!isLoading && activeTab === 'standings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>{standingsData?.competition?.name || 'League Table'}</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">Season {standingsData?.season?.startDate || '2025/2026'}</span>
              </div>

              {standingsData?.standings?.[0]?.table ? (
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 uppercase text-[10px] font-bold text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-3 py-3 text-center">P</th>
                        <th className="px-3 py-3 text-center">W</th>
                        <th className="px-3 py-3 text-center">D</th>
                        <th className="px-3 py-3 text-center">L</th>
                        <th className="px-3 py-3 text-center">GD</th>
                        <th className="px-4 py-3 text-center text-emerald-400 font-black">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {standingsData.standings[0].table.map((row: any) => (
                        <tr key={row.position} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-400">{row.position}</td>
                          <td className="px-4 py-3 font-sans font-bold text-white flex items-center gap-2.5">
                            {row.team?.crest && (
                              <img src={row.team.crest} alt={row.team.name} className="w-5 h-5 object-contain" />
                            )}
                            <span>{row.team?.name}</span>
                          </td>
                          <td className="px-3 py-3 text-center">{row.playedGames}</td>
                          <td className="px-3 py-3 text-center text-emerald-400">{row.won}</td>
                          <td className="px-3 py-3 text-center text-amber-400">{row.draw}</td>
                          <td className="px-3 py-3 text-center text-red-400">{row.lost}</td>
                          <td className="px-3 py-3 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                          <td className="px-4 py-3 text-center text-emerald-400 font-black text-sm">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">No standings table available.</div>
              )}
            </div>
          )}

          {/* TAB 3: TOP SCORERS */}
          {!isLoading && activeTab === 'scorers' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Top Goalscorers</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {scorersData.map((item: any, idx: number) => {
                  const player = item.player || {};
                  const team = item.team || {};
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center border border-amber-500/30">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white truncate max-w-[140px]">{player.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {team.crest && <img src={team.crest} alt={team.name} className="w-3.5 h-3.5 object-contain" />}
                            <span className="truncate max-w-[120px]">{team.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-amber-400 font-mono">{item.goals}</div>
                        <div className="text-[9px] uppercase font-bold text-slate-500">Goals</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FIXTURES */}
          {!isLoading && activeTab === 'fixtures' && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Upcoming Scheduled Fixtures</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fixturesData.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 w-5/12">
                      {m.homeTeamCrest && <img src={m.homeTeamCrest} alt="" className="w-5 h-5 object-contain" />}
                      <span className="font-bold text-white truncate">{m.homeTeam}</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-white/5 text-[10px] font-mono text-slate-400 font-bold text-center">
                      {m.utcDate ? new Date(m.utcDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                    </div>

                    <div className="flex items-center justify-end gap-2 w-5/12 text-right">
                      <span className="font-bold text-white truncate">{m.awayTeam}</span>
                      {m.awayTeamCrest && <img src={m.awayTeamCrest} alt="" className="w-5 h-5 object-contain" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NEWS */}
          {!isLoading && activeTab === 'news' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsData.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-slate-950 border border-white/10 hover:border-emerald-500/40 overflow-hidden transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-black text-emerald-300 border border-emerald-500/40 uppercase">
                      {item.category}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-slate-300">
                      {item.time}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white leading-snug">{item.title}</h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <button
                        onClick={() => handleLikeNews(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.likes + (newsLikes[item.id] || 0)} Likes</span>
                      </button>

                      {onSendPrompt && (
                        <button
                          onClick={() => {
                            onSendPrompt(`Write a viral football video script for: ${item.title}`, 'chat');
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Generate Script</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: TACTICAL PITCH (Interactive Visualizer) */}
          {!isLoading && activeTab === 'tactics' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{tacticsTeam}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                      {selectedFormation} Formation
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Visual match lineup layout, tactical roles, and spatial positioning engine.
                  </p>
                </div>

                {onSendPrompt && (
                  <button
                    onClick={() => {
                      onSendPrompt(
                        `Analyze the ${selectedFormation} tactical system of ${tacticsTeam}. Explain their pressing triggers, defensive transitions, and how to counter this setup.`,
                        'chat'
                      );
                      onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Tactics with Mido AI
                  </button>
                )}
              </div>

              {/* 2D Realistic Soccer Pitch */}
              <div className="relative w-full max-w-2xl mx-auto h-[480px] rounded-3xl bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-800 border-4 border-white/40 shadow-2xl overflow-hidden p-6 select-none">
                {/* Grass Stripes Pattern */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(0,0,0,0.25)_40px,rgba(0,0,0,0.25)_80px)]" />

                {/* Pitch Markings */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2" />

                {/* Top Penalty Box */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-t-0 border-white/40 rounded-b-xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-t-0 border-white/40" />

                {/* Bottom Penalty Box */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-2 border-b-0 border-white/40 rounded-t-xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-2 border-b-0 border-white/40" />

                {/* Player Nodes */}
                {selectedFormation === '4-3-3' && (
                  <>
                    <div className="absolute top-[14%] left-[18%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">7</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Vinícius (LW)</span>
                    </div>
                    <div className="absolute top-[10%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">9</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Mbappé (ST)</span>
                    </div>
                    <div className="absolute top-[14%] left-[82%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">11</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Rodrygo (RW)</span>
                    </div>

                    <div className="absolute top-[38%] left-[28%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">5</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Bellingham (CM)</span>
                    </div>
                    <div className="absolute top-[46%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">14</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Tchouaméni (CDM)</span>
                    </div>
                    <div className="absolute top-[38%] left-[72%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">8</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Valverde (CM)</span>
                    </div>

                    <div className="absolute top-[68%] left-[16%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">23</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Mendy (LB)</span>
                    </div>
                    <div className="absolute top-[72%] left-[38%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">22</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Rüdiger (CB)</span>
                    </div>
                    <div className="absolute top-[72%] left-[62%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">3</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Militao (CB)</span>
                    </div>
                    <div className="absolute top-[68%] left-[84%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">2</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Carvajal (RB)</span>
                    </div>

                    <div className="absolute bottom-[4%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">1</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Courtois (GK)</span>
                    </div>
                  </>
                )}

                {selectedFormation === '4-2-3-1' && (
                  <>
                    <div className="absolute top-[8%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">9</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Target Striker</span>
                    </div>
                    <div className="absolute top-[26%] left-[24%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">10</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Inside Forward</span>
                    </div>
                    <div className="absolute top-[23%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">8</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Playmaker (CAM)</span>
                    </div>
                    <div className="absolute top-[26%] left-[76%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">7</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Winger</span>
                    </div>
                    <div className="absolute top-[48%] left-[36%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">6</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Ball Winner (CDM)</span>
                    </div>
                    <div className="absolute top-[48%] left-[64%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">4</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Deep Pivot (CDM)</span>
                    </div>
                    <div className="absolute top-[70%] left-[16%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">3</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Left Back</span>
                    </div>
                    <div className="absolute top-[72%] left-[38%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">5</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Center Back</span>
                    </div>
                    <div className="absolute top-[72%] left-[62%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">12</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Center Back</span>
                    </div>
                    <div className="absolute top-[70%] left-[84%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">2</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Right Back</span>
                    </div>
                    <div className="absolute bottom-[4%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">1</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Goalkeeper</span>
                    </div>
                  </>
                )}

                {(selectedFormation === '3-5-2' || selectedFormation === '4-4-2') && (
                  <>
                    <div className="absolute top-[10%] left-[38%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">9</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Striker 1</span>
                    </div>
                    <div className="absolute top-[10%] left-[62%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">11</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Striker 2</span>
                    </div>
                    <div className="absolute top-[38%] left-[16%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">7</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Left Wingback</span>
                    </div>
                    <div className="absolute top-[42%] left-[38%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">8</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Central Mid</span>
                    </div>
                    <div className="absolute top-[42%] left-[62%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">10</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Central Mid</span>
                    </div>
                    <div className="absolute top-[38%] left-[84%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">2</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Right Wingback</span>
                    </div>
                    <div className="absolute top-[72%] left-[28%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">3</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Center Back</span>
                    </div>
                    <div className="absolute top-[72%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">4</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Central Sweeper</span>
                    </div>
                    <div className="absolute top-[72%] left-[72%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">5</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Center Back</span>
                    </div>
                    <div className="absolute bottom-[4%] left-[50%] -translate-x-1/2 flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white">1</div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded mt-0.5">Goalkeeper</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
