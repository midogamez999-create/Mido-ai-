import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Users,
  Trophy,
  Globe,
  Gamepad2,
  Music,
  Check,
  Plus,
  X,
  Edit3,
  ExternalLink,
  Flame,
  Zap,
  Save,
  Lock,
  Heart
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onSwitchAccount?: () => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onSwitchAccount
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'community' | 'stats'>('profile');
  const [nameInput, setNameInput] = useState<string>(user?.name || 'Mido Gamez');
  const [handleInput, setHandleInput] = useState<string>(user?.nickname || 'mido');
  const [bioInput, setBioInput] = useState<string>(user?.bio || 'Creator on Mido Orb, Nemis & Ear! Building games and music 🚀');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MidoUser');
  const [bannerUrl, setBannerUrl] = useState<string>(user?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80');

  const [followersCount, setFollowersCount] = useState<number>(user?.followersCount || 0);
  const [followingCount, setFollowingCount] = useState<number>(user?.followingCount || 0);
  const [isVerified, setIsVerified] = useState<boolean>(user?.isVerified || false);

  const [communityCreators, setCommunityCreators] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Avatar presets
  const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=MidoCyber',
    'https://api.dicebear.com/7.x/bottts/svg?seed=NexusArcade',
    'https://api.dicebear.com/7.x/bottts/svg?seed=SynthQueen',
    'https://api.dicebear.com/7.x/bottts/svg?seed=PixelChampion',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80'
  ];

  const BANNER_PRESETS = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80'
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync profile from server
  const fetchProfile = async () => {
    const myId = user?.id || 'ch_my_channel';
    try {
      const res = await fetch(`/api/social/profile/${myId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setNameInput(data.profile.name || user?.name || 'Mido Gamez');
          setHandleInput(data.profile.handle?.replace('@', '') || user?.nickname || 'mido');
          setBioInput(data.profile.bio || '');
          setAvatarUrl(data.profile.avatar || user?.avatar || '');
          setBannerUrl(data.profile.banner || '');
          setFollowersCount(data.profile.followersCount || 0);
          setFollowingCount(data.profile.followingCount || 0);
          setIsVerified(data.profile.isVerified || (data.profile.followersCount || 0) >= 1000);
        }
      }
    } catch {}
  };

  const fetchCommunityCreators = async () => {
    const myId = user?.id || 'ch_my_channel';
    try {
      const res = await fetch(`/api/social/community-creators?currentUserId=${myId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.creators) {
          setCommunityCreators(data.creators);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      fetchCommunityCreators();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playClick();
    setIsSaving(true);

    const myId = user?.id || 'ch_my_channel';
    const cleanHandle = handleInput.trim().replace(/^@/, '');

    try {
      const res = await fetch('/api/social/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: myId,
          name: nameInput.trim(),
          handle: cleanHandle,
          bio: bioInput.trim(),
          avatar: avatarUrl,
          banner: bannerUrl
        })
      });

      const data = await res.json();
      if (data.success && data.profile) {
        onUpdateUser({
          name: data.profile.name,
          nickname: data.profile.handle?.replace('@', ''),
          avatar: data.profile.avatar,
          banner: data.profile.banner,
          bio: data.profile.bio,
          followersCount: data.profile.followersCount,
          isVerified: data.profile.isVerified
        });
        showToast("✓ Profile & photo updated across Mido Orb, Nemis & Ear!");
      }
    } catch {
      showToast("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Follow / Unfollow Community Creator
  const handleToggleFollow = async (targetCreatorId: string) => {
    soundFx.playClick();
    const myId = user?.id || 'ch_my_channel';

    if (
      myId === targetCreatorId ||
      targetCreatorId === 'ch_my_channel' ||
      targetCreatorId === 'c_my_channel' ||
      myId === `ch_${targetCreatorId}` ||
      targetCreatorId === `ch_${myId}`
    ) {
      showToast("❌ You cannot follow yourself!");
      return;
    }

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUserId: myId, targetUserId: targetCreatorId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.isFollowing ? "✓ Followed creator!" : "Unfollowed creator");
        fetchCommunityCreators();
        setFollowingCount(data.currentProfile?.followingCount || 0);
      } else {
        showToast(data.error || "Failed to update follow");
      }
    } catch {
      showToast("Error updating follow state");
    }
  };

  // Gain Community Followers & Unlock Verified Badge at 1,000+
  const handleBoostFollowers = async () => {
    soundFx.playClick();
    setIsBoosting(true);
    const myId = user?.id || 'ch_my_channel';

    try {
      const res = await fetch('/api/social/gain-followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, count: 350 })
      });
      const data = await res.json();
      if (data.success) {
        const newCount = data.newFollowersCount;
        const verified = data.isVerified;
        setFollowersCount(newCount);
        setIsVerified(verified);
        onUpdateUser({ followersCount: newCount, isVerified: verified });
        showToast(data.message);
      }
    } catch {
      showToast("Error connecting with community followers");
    } finally {
      setIsBoosting(false);
    }
  };

  const progressToVerified = Math.min(100, Math.round((followersCount / 1000) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900 border border-purple-500/40 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* PROFILE BANNER */}
        <div className="relative h-36 sm:h-44 w-full bg-slate-950 overflow-hidden shrink-0">
          <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner picker trigger */}
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {BANNER_PRESETS.map((bp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBannerUrl(bp)}
                className={`w-5 h-5 rounded-md border overflow-hidden transition-all ${
                  bannerUrl === bp ? 'ring-2 ring-purple-400 border-white' : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={bp} alt="Banner preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* PROFILE HEADER & AVATAR */}
        <div className="px-6 relative -mt-14 pb-2 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-900 shadow-2xl bg-black shrink-0 group">
              <img src={avatarUrl} alt={nameInput} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all">
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-1">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setAvatarUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-white">{nameInput}</h2>
                {/* OFFICIAL VERIFIED BADGE (Glows blue checkmark if >= 1000 followers) */}
                {isVerified && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black"
                    title="Verified Creator Badge"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-slate-950" />
                    <span>VERIFIED CREATOR</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-purple-300 font-semibold mt-0.5">
                @{handleInput}
              </div>
            </div>
          </div>

          {/* Quick Stats: Followers & Following */}
          <div className="flex items-center gap-4 pb-1">
            <div className="text-center">
              <div className="text-base font-black text-white font-mono">{followersCount.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Followers</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-base font-black text-white font-mono">{followingCount.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Following</div>
            </div>
          </div>
        </div>

        {/* VERIFICATION PROGRESS & MILESTONE BAR */}
        <div className="px-6 py-3 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex-1 w-full space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Verification Goal: 1,000 Followers</span>
              </span>
              <span className="font-mono text-purple-300">{followersCount} / 1,000 ({progressToVerified}%)</span>
            </div>
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressToVerified}%` }}
              />
            </div>
          </div>

          {/* Gain Community Followers Button */}
          <button
            onClick={handleBoostFollowers}
            disabled={isBoosting}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-1.5 shrink-0 transition-all transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isBoosting ? 'Gaining...' : 'Grow Followers (+350)'}</span>
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/10">
          {[
            { id: 'profile', label: 'Edit Profile & Photos', icon: <Edit3 className="w-3.5 h-3.5" /> },
            { id: 'community', label: 'Discover Creators', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'stats', label: 'Cross-Platform Stats', icon: <Globe className="w-3.5 h-3.5" /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { soundFx.playClick(); setActiveTab(t.id as any); }}
              className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === t.id
                  ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-4 text-left flex-1">
            {/* Avatar presets gallery */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Choose Profile Avatar Style:</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_PRESETS.map((ap, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(ap)}
                    className={`w-10 h-10 rounded-2xl overflow-hidden border-2 transition-all ${
                      avatarUrl === ap ? 'border-purple-400 ring-2 ring-purple-400/50 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={ap} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-3 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">@Nickname / Handle</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={handleInput}
                    onChange={(e) => setHandleInput(e.target.value)}
                    className="w-full p-3 pl-8 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Bio &amp; About Me</label>
              <textarea
                rows={2}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="What are you building or creating across Mido AI?"
                className="w-full p-3 bg-black/40 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-purple-400 resize-none font-sans"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onSwitchAccount && (
                <button
                  type="button"
                  onClick={onSwitchAccount}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10"
                >
                  Switch / Link Google Account
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DISCOVER CREATORS & FOLLOW COMMUNITY */}
        {activeTab === 'community' && (
          <div className="p-6 overflow-y-auto space-y-3 text-left flex-1">
            <div className="text-xs font-bold text-slate-400 pb-1">
              Connect with fellow game makers, video creators, and music producers:
            </div>

            {communityCreators.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">
                Loading community members...
              </div>
            ) : (
              communityCreators.map(c => {
                const isSelf = user?.id && (c.userId === user.id || c.userId === `ch_${user.id}`);

                return (
                  <div
                    key={c.userId}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-2xl object-cover shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{c.name}</span>
                          {c.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-slate-950" />
                          )}
                        </div>
                        <div className="text-[11px] text-purple-300 font-semibold">{c.handle}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{c.bio}</p>
                      </div>
                    </div>

                    {/* FOLLOW BUTTON (Cannot follow yourself!) */}
                    {isSelf ? (
                      <span className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-400 text-xs font-bold">
                        You
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleFollow(c.userId)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          c.isFollowing
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {c.isFollowing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{c.isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: CROSS-PLATFORM UNIFIED STATS */}
        {activeTab === 'stats' && (
          <div className="p-6 overflow-y-auto space-y-4 text-left flex-1">
            <div className="text-xs font-bold text-slate-300">
              Unified activity across all 3 integrated platforms with one single account:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mido Orb Stats */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-rose-400" /> Mido Orb
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 font-bold">Video</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{followersCount}</div>
                <div className="text-[11px] text-slate-400">Total Channel Subscribers</div>
              </div>

              {/* Mido Nemis Stats */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-purple-400" /> Mido Nemis
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-bold">Games</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{followersCount}</div>
                <div className="text-[11px] text-slate-400">Game Followers &amp; Fans</div>
              </div>

              {/* Mido Ear Stats */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-emerald-400" /> Mido Ear
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-bold">Music</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">{followersCount}</div>
                <div className="text-[11px] text-slate-400">Monthly Song Listeners</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Single Identity Verification Guarantee</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you gain 1,000 followers on any platform, your verified status, photo, nickname, and community reach are automatically unified across Mido Orb, Mido Nemis, and Mido Ear.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
