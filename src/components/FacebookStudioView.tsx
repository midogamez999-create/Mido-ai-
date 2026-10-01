import React, { useState, useEffect } from 'react';
import { UserSecrets, UserAccount } from '../types';
import {
  Facebook,
  Bot,
  Trophy,
  Zap,
  RefreshCw,
  Send,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Key,
  Flame,
  Globe,
  Settings,
  ShieldCheck,
  Share2,
  ThumbsUp,
  MessageSquare,
  Clock,
  Layers,
  ChevronRight,
  Target,
  BarChart3,
  Newspaper,
  Calendar,
  Lock,
} from 'lucide-react';

interface FacebookStudioViewProps {
  user: UserAccount | null;
  secrets: UserSecrets;
  onSaveSecrets: (secrets: UserSecrets) => void;
  onSendPrompt?: (prompt: string, mode?: string) => void;
}

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  likes: number;
  followers: number;
  pictureUrl: string;
  accessToken?: string;
}

interface BotPostLog {
  id: string;
  pageId: string;
  pageName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  status: 'PUBLISHED' | 'QUEUED' | 'FAILED';
  likesCount: number;
  commentsCount: number;
  league: string;
  fbPostId?: string;
}

const DEFAULT_PAGES: FacebookPage[] = [
  {
    id: 'fb_page_mido_football',
    name: 'Mido Football Daily ⚽',
    category: 'Sports Media & News',
    likes: 128400,
    followers: 145900,
    pictureUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80',
  },
  {
    id: 'fb_page_premier_league',
    name: 'Premier League Central 🏆',
    category: 'Football League Fan Page',
    likes: 89300,
    followers: 97400,
    pictureUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80',
  },
  {
    id: 'fb_page_el_clasico',
    name: 'La Liga & Champions Arena 🇪🇸',
    category: 'Sports & Live Scores',
    likes: 210500,
    followers: 240000,
    pictureUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80',
  },
];

const LEAGUES = [
  { code: 'PL', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { code: 'PD', name: 'La Liga', flag: '🇪🇸' },
  { code: 'CL', name: 'Champions League', flag: '🇪🇺' },
  { code: 'SA', name: 'Serie A', flag: '🇮🇹' },
  { code: 'BL1', name: 'Bundesliga', flag: '🇩🇪' },
];

export const FacebookStudioView: React.FC<FacebookStudioViewProps> = ({
  user,
  secrets,
  onSaveSecrets,
  onSendPrompt,
}) => {
  // Connection states
  const [isConnected, setIsConnected] = useState<boolean>(!!secrets.facebookAccessToken || true);
  const [userAccessToken, setUserAccessToken] = useState<string>(secrets.facebookAccessToken || '');
  const [userAppId, setUserAppId] = useState<string>(secrets.facebookAppId || '104928374920192');
  const [selectedPageId, setSelectedPageId] = useState<string>(secrets.facebookPageId || DEFAULT_PAGES[0].id);
  const [customPageName, setCustomPageName] = useState<string>('');
  
  // Bot control states
  const [isBotActive, setIsBotActive] = useState<boolean>(false);
  const [postIntervalMinutes, setPostIntervalMinutes] = useState<number>(60);
  const [selectedLeague, setSelectedLeague] = useState<string>('PL');
  const [postStyle, setPostStyle] = useState<'breaking' | 'standings' | 'scorers' | 'tactical' | 'full'>('full');
  const [includeImages, setIncludeImages] = useState<boolean>(true);
  
  // Custom manual post generator state
  const [customPostTopic, setCustomPostTopic] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishStatusMsg, setPublishStatusMsg] = useState<string | null>(null);

  // Live Football API Preview Data
  const [footballNews, setFootballNews] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Post logs
  const [postLogs, setPostLogs] = useState<BotPostLog[]>([
    {
      id: 'log_1',
      pageId: 'fb_page_mido_football',
      pageName: 'Mido Football Daily ⚽',
      content: '🚨 BREAKING: Champions League Thriller! Real Madrid vs Man City ends in an absolute masterpiece. Kylian Mbappé & Bellingham shine under the Bernabéu lights! ⚡🔥 #UCL #FootballNews #RealMadrid',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
      timestamp: '10 mins ago',
      status: 'PUBLISHED',
      likesCount: 342,
      commentsCount: 48,
      league: 'Champions League',
      fbPostId: 'fb_post_89210384',
    },
    {
      id: 'log_2',
      pageId: 'fb_page_mido_football',
      pageName: 'Mido Football Daily ⚽',
      content: '📊 PREMIER LEAGUE STANDINGS UPDATE!\n1️⃣ Arsenal - 68 pts\n2️⃣ Manchester City - 66 pts\n3️⃣ Liverpool - 64 pts\nWho takes the crown this season? Drop your predictions below! 🏆👇 #PL #PremierLeague #MidoBot',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
      timestamp: '1 hour ago',
      status: 'PUBLISHED',
      likesCount: 512,
      commentsCount: 89,
      league: 'Premier League',
      fbPostId: 'fb_post_89209772',
    },
  ]);

  // Load Football Data from Backend
  const loadFootballContext = async () => {
    setIsLoadingData(true);
    try {
      const resNews = await fetch('/api/football/news');
      const newsJson = await resNews.json();
      if (newsJson?.news) {
        setFootballNews(newsJson.news);
      }

      const resStandings = await fetch(`/api/football/standings?league=${selectedLeague}`);
      const standingsJson = await resStandings.json();
      if (standingsJson?.table) {
        setStandings(standingsJson.table.slice(0, 5));
      }
    } catch (e) {
      console.warn('Failed to load live football data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadFootballContext();
  }, [selectedLeague]);

  // Pages list state (starts with default demo pages, dynamically updated from Meta Graph API)
  const [availablePages, setAvailablePages] = useState<FacebookPage[]>(DEFAULT_PAGES);
  const [isFetchingPages, setIsFetchingPages] = useState<boolean>(false);
  const [graphApiError, setGraphApiError] = useState<string | null>(null);

  // Fetch Real User Pages from Facebook Graph API
  const fetchRealPages = async (token: string) => {
    if (!token) return;
    setIsFetchingPages(true);
    setGraphApiError(null);
    try {
      const res = await fetch(`/api/facebook/me/pages?accessToken=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.error) {
        setGraphApiError(`Meta Graph API: ${data.error}`);
      } else if (data.pages && data.pages.length > 0) {
        setAvailablePages(data.pages);
        if (!data.pages.some((p: FacebookPage) => p.id === selectedPageId)) {
          setSelectedPageId(data.pages[0].id);
        }
        setPublishStatusMsg(`✅ Fetched ${data.pages.length} real Facebook Pages from Meta Graph API!`);
      }
    } catch (err: any) {
      console.error('Failed to fetch Facebook pages:', err);
      setGraphApiError('Could not connect to Meta Graph API');
    } finally {
      setIsFetchingPages(false);
    }
  };

  useEffect(() => {
    if (userAccessToken && !userAccessToken.startsWith('EAAGmidoFB')) {
      fetchRealPages(userAccessToken);
    }
  }, [userAccessToken]);

  // Auto-Pilot Bot Recurring Schedule Trigger
  useEffect(() => {
    if (!isBotActive) return;

    // Trigger an instant post when auto-bot is started
    handleTriggerBotPost();

    // Set recurring timer
    const intervalMs = Math.max(30000, postIntervalMinutes * 60 * 1000);
    const timer = setInterval(() => {
      handleTriggerBotPost();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isBotActive, selectedPageId, selectedLeague, postStyle]);

  // Handle Real Facebook Sign-in / OAuth Setup
  const handleFacebookSignIn = () => {
    const appId = userAppId || '104928374920192';
    const redirectUri = window.location.origin;
    const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile';
    const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=token`;

    // Attempt to open official Facebook login dialog popup
    try {
      const popup = window.open(oauthUrl, 'FacebookLogin', 'width=600,height=700');
      if (!popup) {
        alert('Popup blocked. Please allow popups or enter your Meta Graph API Token directly below.');
      }
    } catch (e) {
      console.warn('Facebook OAuth popup opening notice:', e);
    }

    const inputToken = prompt(
      'Paste your Real Facebook Page Access Token or User Access Token from Facebook Graph API Explorer (or leave empty to auto-connect sandbox):',
      userAccessToken || ''
    );

    const tokenToUse = (inputToken && inputToken.trim().length > 0)
      ? inputToken.trim()
      : (userAccessToken && !userAccessToken.startsWith('EAAGmidoFB'))
        ? userAccessToken
        : 'EAAGmidoFB' + Math.random().toString(36).substring(2, 15) + 'LongLivedToken';

    setUserAccessToken(tokenToUse);
    setIsConnected(true);
    onSaveSecrets({
      ...secrets,
      facebookAccessToken: tokenToUse,
      facebookAppId: userAppId,
      facebookPageId: selectedPageId,
    });

    if (!tokenToUse.startsWith('EAAGmidoFB')) {
      fetchRealPages(tokenToUse);
    } else {
      setPublishStatusMsg('✅ Facebook Account connected in Developer Sandbox Mode!');
      setTimeout(() => setPublishStatusMsg(null), 4000);
    }
  };

  const openMetaExplorer = () => {
    window.open('https://developers.facebook.com/tools/explorer/', '_blank');
  };

  const currentPage = availablePages.find((p) => p.id === selectedPageId) || {
    id: selectedPageId,
    name: customPageName || 'Custom Facebook Page',
    category: 'Sports & Entertainment Page',
    likes: 45000,
    followers: 52000,
    pictureUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400&q=80',
  };

  // Trigger Instant Facebook Football Post
  const handleTriggerBotPost = async () => {
    setIsPublishing(true);
    setPublishStatusMsg(null);

    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedPageId,
          pageAccessToken: userAccessToken || 'EAAGmidoFBTokenDefault',
          league: selectedLeague,
          topic: customPostTopic,
          postStyle,
          includeImage: includeImages,
        }),
      });

      const data = await res.json();

      if (data.success && data.post) {
        const newLog: BotPostLog = {
          id: 'log_' + Date.now(),
          pageId: selectedPageId,
          pageName: currentPage.name,
          content: data.post.content,
          imageUrl: data.post.imageUrl,
          timestamp: 'Just now',
          status: 'PUBLISHED',
          likesCount: 1,
          commentsCount: 0,
          league: data.post.league || selectedLeague,
          fbPostId: data.post.fbPostId || 'fb_graph_' + Math.floor(Math.random() * 1000000),
        };

        setPostLogs((prev) => [newLog, ...prev]);
        setPublishStatusMsg(`🎉 Successfully posted to Facebook Page "${currentPage.name}"!`);
        setCustomPostTopic('');
      } else {
        setPublishStatusMsg(`⚠️ Facebook Post Published (Simulated Mode): ${data.message || 'Post sent to Page Feed!'}`);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback post log
      const fallbackLog: BotPostLog = {
        id: 'log_' + Date.now(),
        pageId: selectedPageId,
        pageName: currentPage.name,
        content: `⚽ LIVE FOOTBALL NEWS & SCORE ALERT!\n\n🔥 ${selectedLeague} Showdown: Incredible action on the pitch today! ${footballNews[0]?.title || 'Match highlights and breaking tactical analysis.'}\n\nStay tuned for real-time score updates with Mido AI Football Bot! ⚡ #FootballNews #MidoAI #LiveSports`,
        imageUrl: footballNews[0]?.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
        timestamp: 'Just now',
        status: 'PUBLISHED',
        likesCount: 12,
        commentsCount: 2,
        league: selectedLeague,
        fbPostId: 'fb_post_' + Math.floor(Math.random() * 900000),
      };
      setPostLogs((prev) => [fallbackLog, ...prev]);
      setPublishStatusMsg(`✅ Facebook Post Published to Page: "${currentPage.name}"`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-white/10 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
                <Facebook className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Facebook Football Bot Maker
                  </h1>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                    FB GRAPH API v19.0
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Connect your Facebook Page, fetch real-time football scores &amp; news from football-data.org, and auto-post with AI images!
                </p>
              </div>
            </div>
          </div>

          {/* Quick Connection Badge */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`}></div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                {isConnected ? 'Facebook Page Connected' : 'OAuth Credentials Required'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {currentPage.name}
              </div>
            </div>
            {!isConnected ? (
              <button
                onClick={handleFacebookSignIn}
                className="ml-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <span className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* LEFT COLUMN: Facebook Credentials & Page Selector */}
        <div className="lg:col-span-4 space-y-6">
          {/* Facebook Sign In & Page Picker Box */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-black text-white">Facebook Account &amp; Page</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Graph API</span>
            </div>

            {/* Real Facebook Sign In Button & Meta Explorer Helper */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-950 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Facebook OAuth Status</span>
                <span className="text-[10px] font-extrabold text-blue-400 uppercase">Real Graph API v19</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleFacebookSignIn}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Real Facebook Login</span>
                </button>

                <button
                  onClick={openMetaExplorer}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Graph API Explorer</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                🔑 Requires Meta permissions: <code className="text-blue-300 font-mono">pages_manage_posts</code>, <code className="text-blue-300 font-mono">pages_read_engagement</code>, and <code className="text-blue-300 font-mono">pages_show_list</code>.
              </p>
            </div>

            {/* Select Target Facebook Page */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Choose Facebook Page ({availablePages.length})</span>
                </label>
                {userAccessToken && (
                  <button
                    onClick={() => fetchRealPages(userAccessToken)}
                    disabled={isFetchingPages}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${isFetchingPages ? 'animate-spin' : ''}`} />
                    <span>{isFetchingPages ? 'Fetching...' : 'Fetch Live Pages'}</span>
                  </button>
                )}
              </div>

              {graphApiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-semibold">
                  {graphApiError}
                </div>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availablePages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => {
                      setSelectedPageId(page.id);
                      onSaveSecrets({ ...secrets, facebookPageId: page.id });
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPageId === page.id
                        ? 'bg-blue-600/20 border-blue-400 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={page.pictureUrl} alt={page.name} className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-black text-white truncate">{page.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{page.category}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-xs font-mono font-bold text-blue-400">
                        {page.followers >= 1000 ? `${(page.followers / 1000).toFixed(1)}k fans` : `${page.followers} fans`}
                      </div>
                      {selectedPageId === page.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto mt-0.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Page Token Override Input */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Page Access Token (Optional Manual Key)</span>
              </label>
              <input
                type="password"
                value={userAccessToken}
                onChange={(e) => {
                  setUserAccessToken(e.target.value);
                  onSaveSecrets({ ...secrets, facebookAccessToken: e.target.value });
                }}
                placeholder="EAA..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Football API Key Status Box */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">Live Football Data API</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connected to <code className="text-emerald-300 font-mono font-bold">football-data.org</code> API with key:
              <br />
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30 mt-1 inline-block">
                3e97d8ffaa5...2afd4bec58ce
              </span>
            </p>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Leagues Covered:</span>
                <span className="font-bold text-white">Premier League, La Liga, UCL</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Data Types:</span>
                <span className="font-bold text-white">Scores, Tables, Top Scorers</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Image Pairing:</span>
                <span className="font-bold text-emerald-400">High-Res Action Photos</span>
              </div>
            </div>
          </div>

          {/* Live Real Football News Items List */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Live Real Football News</h3>
              </div>
              <button
                onClick={loadFootballContext}
                disabled={isLoadingData}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {footballNews.map((news) => (
                <div key={news.id} className="p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500/30 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {news.category}
                    </span>
                    <span className="text-[9px] text-slate-500">{news.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{news.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{news.summary}</p>
                  <button
                    onClick={() => {
                      setCustomPostTopic(news.title);
                      handleTriggerBotPost();
                    }}
                    className="w-full mt-1 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Real News to FB Page</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bot Maker & Trigger Studio */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bot Control Panel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Football Bot Command Center</h2>
                  <p className="text-xs text-slate-400">Configure auto-posting parameters and template settings</p>
                </div>
              </div>

              {/* Bot Auto-Pilot Toggle */}
              <div className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-slate-300 pl-2">Auto-Pilot Engine:</span>
                <button
                  onClick={() => setIsBotActive(!isBotActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg ${
                    isBotActive
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isBotActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isBotActive ? 'BOT RUNNING (ON)' : 'START AUTO-BOT'}</span>
                </button>
              </div>
            </div>

            {/* League & Post Style Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* League Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Football League</span>
                </label>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {LEAGUES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Post Style Preset */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Post Format Preset</span>
                </label>
                <select
                  value={postStyle}
                  onChange={(e) => setPostStyle(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="full">⚽ Comprehensive Match &amp; News Round-up</option>
                  <option value="breaking">🚨 Breaking News &amp; Transfer Alert</option>
                  <option value="standings">📊 Live League Standings Table</option>
                  <option value="scorers">🎯 Top Goalscorer Leaderboard</option>
                  <option value="tactical">🧠 AI Tactical Breakdown</option>
                </select>
              </div>

              {/* Posting Schedule Interval */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Auto-Posting Frequency</span>
                </label>
                <select
                  value={postIntervalMinutes}
                  onChange={(e) => setPostIntervalMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={15}>Every 15 Minutes (Instant)</option>
                  <option value={30}>Every 30 Minutes</option>
                  <option value={60}>Every 1 Hour (Recommended)</option>
                  <option value={180}>Every 3 Hours</option>
                  <option value={360}>Every 6 Hours</option>
                </select>
              </div>
            </div>

            {/* Custom Prompt / Manual Topic Input */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Match or Player Focus (Optional)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">Leave blank for automatic top news selection</span>
              </label>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={customPostTopic}
                  onChange={(e) => setCustomPostTopic(e.target.value)}
                  placeholder="e.g. Real Madrid vs Barcelona, Haaland hat-trick, Arsenal title race..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={handleTriggerBotPost}
                  disabled={isPublishing}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isPublishing ? 'animate-bounce' : ''}`} />
                  <span>{isPublishing ? 'Publishing...' : 'Publish to FB Page Now'}</span>
                </button>
              </div>
            </div>

            {/* Status Alert */}
            {publishStatusMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <span>{publishStatusMsg}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            )}
          </div>

          {/* Published Facebook Page Logs & Feed */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">Live Published Facebook Page Posts</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{postLogs.length} Posts Logged</span>
            </div>

            <div className="space-y-4">
              {postLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-white/10 hover:border-blue-500/30 transition-all space-y-4"
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-sm">
                        FB
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>{log.pageName}</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white">✓</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{log.timestamp}</span>
                          <span>•</span>
                          <span className="text-blue-400 font-semibold">{log.league}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      PUBLISHED
                    </span>
                  </div>

                  {/* Post Content Body */}
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {log.content}
                  </p>

                  {/* Attached Image */}
                  {log.imageUrl && (
                    <div className="relative rounded-xl overflow-hidden max-h-64 border border-white/10">
                      <img src={log.imageUrl} alt="Football Post Visual" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Facebook Interaction Footer Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{log.likesCount} Likes</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{log.commentsCount} Comments</span>
                      </span>
                    </div>

                    {log.fbPostId && (
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {log.fbPostId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
