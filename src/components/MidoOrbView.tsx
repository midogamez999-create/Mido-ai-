import React, { useState, useEffect } from 'react';
import {
  Upload, Play, Pause, Volume2, VolumeX, Maximize, Maximize2, SkipForward,
  RotateCcw, Repeat, Sparkles, MessageSquare, ThumbsUp, ThumbsDown, Share2,
  Bookmark, Edit, Trash2, Search, SlidersHorizontal, Bell, Home, Flame,
  TrendingUp, UserCheck, Clock, ListVideo, Tv, BarChart2, Settings,
  Zap, Globe, Eye, Lock as LockIcon, Plus, ChevronUp, ChevronDown,
  Heart, Send, Copy, Video as VideoIcon, Check, X, Film, Radio,
  AlertCircle, Shield, Download, Loader2, Music
} from 'lucide-react';
import { UserAccount, UserSecrets, OrbVideo, OrbComment, OrbChannel, OrbPlaylist, OrbNotification, OrbAnalytics } from '../types';
import { storeVideoBlob, getVideoBlobUrl, cacheInMemoryBlob, linkServerUrlToBlob, getSyncVideoBlobUrl } from '../lib/videoStorage';
import { OrbDownloadModal } from './midoOrb/OrbDownloadModal';
import { downloadMediaFile } from '../lib/downloadEngine';

// High-Definition Sample Videos for Instant 1-Click Testing & Publishing
export const SAMPLE_VIDEOS = [
  {
    title: 'Cosmic Cyber Nebula & Starflight Journey',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1280&q=80',
    duration: '00:15',
    category: 'Film & Animation',
    desc: 'Breathtaking 4K deep space exploration showcasing cosmic nebulae and high-speed flight.',
  },
  {
    title: 'Next-Gen Celebration & Motion Clip',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1280&q=80',
    duration: '00:15',
    category: 'AI & Tech',
    desc: 'Exploring cyber motion, holographic interfaces, and digital celebratory visual effects.',
  },
  {
    title: 'Action-Packed 3D High-Speed Feature',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1280&q=80',
    duration: '01:00',
    category: 'Gaming',
    desc: 'Action-packed highlights, cinematic animation, and high-speed motion showcase.',
  },
  {
    title: 'Creative Motion & Visual Arts Showcase',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80',
    duration: '00:15',
    category: 'Creative Arts',
    desc: 'Visual effects breakdown, kinetic typography, and motion design showcase.',
  },
  {
    title: 'High-Speed Track Lap & Action Symphony',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumb: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1280&q=80',
    duration: '00:15',
    category: 'Auto & Vehicles',
    desc: 'High-speed track session pushing performance supercars to the limit.',
  },
  {
    title: 'Sci-Fi Short Feature: Sintel Open Movie',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1280&q=80',
    duration: '00:52',
    category: 'Film & Animation',
    desc: 'Full cinematic open-movie sci-fi 3D animated trailer with dynamic visual effects.',
  },
];

// Check if a URL or data string is strictly a static image (and never a video)
function isMediaAnImage(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:video/')) return false;
  if (url.startsWith('data:image/')) return true;
  if (url.includes('/uploads/vid_') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.mkv') || url.includes('.ogv')) return false;
  if (url.includes('/uploads/thumb_') || url.includes('/uploads/avatar_') || url.includes('/uploads/image_')) return true;
  return /\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i.test(url);
}

// Zero-lag, authentic HTML5 Video Player supporting MP4, WebM, Range HTTP streams, IndexedDB blobs, Image Motion Animation, and YouTube embeds

export const VideoPlayer: React.FC<{
  src: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  className?: string;
  playbackRate?: number;
  onClick?: (e: React.MouseEvent) => void;
  onError?: () => void;
  refCallback?: (el: HTMLVideoElement | null) => void;
}> = ({ src, poster, autoPlay = true, controls = true, loop, muted = false, playsInline = true, className, playbackRate = 1.0, onClick, onError, refCallback }) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    return getSyncVideoBlobUrl(src) || src || '';
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isImageMotion, setIsImageMotion] = useState<boolean>(() => isMediaAnImage(src));
  const [motionProgress, setMotionProgress] = useState<number>(0);
  const [hasPlaybackError, setHasPlaybackError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const pendingPlayRef = React.useRef<Promise<void> | null>(null);

  useEffect(() => {
    let isMounted = true;
    setHasPlaybackError(false);

    if (!src) {
      setResolvedSrc('');
      setIsImageMotion(false);
      return;
    }

    if (isMediaAnImage(src)) {
      setResolvedSrc(src);
      setIsImageMotion(true);
      return;
    }

    // Check fast synchronous cache first
    const syncUrl = getSyncVideoBlobUrl(src);
    if (syncUrl) {
      setResolvedSrc(syncUrl);
      setIsImageMotion(isMediaAnImage(syncUrl));
      return;
    }

    setIsImageMotion(false);
    getVideoBlobUrl(src).then((url) => {
      if (isMounted) {
        if (url) {
          setResolvedSrc(url);
          setIsImageMotion(isMediaAnImage(url));
        } else if (src && src.startsWith('idb://')) {
          setResolvedSrc('/uploads/vid_1790435435312_xxxuof.webm');
        } else {
          setResolvedSrc(src);
        }
      }
    }).catch(() => {
      if (isMounted) {
        if (src && src.startsWith('idb://')) {
          setResolvedSrc('/uploads/vid_1790435435312_xxxuof.webm');
        } else {
          setResolvedSrc(src);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src, retryCount]);

  const rawSrc = (resolvedSrc && !resolvedSrc.startsWith('idb://'))
    ? resolvedSrc
    : (src && !src.startsWith('idb://') ? src : (src ? '/uploads/vid_1790435435312_xxxuof.webm' : ''));

  // Safe play helper to eliminate "The play() request was interrupted by a call to pause()" errors
  const safePlay = () => {
    if (isImageMotion) {
      setIsPlaying(true);
      return;
    }
    if (!videoRef.current) return;
    try {
      const p = videoRef.current.play();
      if (p !== undefined) {
        pendingPlayRef.current = p;
        p.then(() => {
          setIsPlaying(true);
          setHasPlaybackError(false);
          pendingPlayRef.current = null;
        }).catch((err: any) => {
          pendingPlayRef.current = null;
          if (err?.name === 'AbortError' || err?.name === 'NotAllowedError') {
            // Autoplay policy prevented playback: user interaction required
            setIsPlaying(false);
            return;
          }
        });
      }
    } catch {
      // Ignore unhandled synchronous exceptions
    }
  };

  // Safe pause helper
  const safePause = () => {
    if (isImageMotion) {
      setIsPlaying(false);
      return;
    }
    if (!videoRef.current) return;
    if (pendingPlayRef.current) {
      pendingPlayRef.current.then(() => {
        if (videoRef.current && !videoRef.current.paused) {
          try { videoRef.current.pause(); } catch {}
        }
      }).catch(() => {});
    } else {
      try { videoRef.current.pause(); } catch {}
    }
    setIsPlaying(false);
  };

  // Apply playback rate when ref or playbackRate changes
  useEffect(() => {
    if (videoRef.current && playbackRate) {
      try {
        videoRef.current.playbackRate = playbackRate;
      } catch {}
    }
  }, [playbackRate, rawSrc]);

  // Handle autoplay smoothly
  useEffect(() => {
    if (autoPlay && rawSrc) {
      safePlay();
    }
    return () => {
      safePause();
    };
  }, [autoPlay, rawSrc, isImageMotion]);

  // Image motion ticker for animated photos / clips
  useEffect(() => {
    if (!isImageMotion || !isPlaying) return;
    const interval = setInterval(() => {
      setMotionProgress((prev) => (prev >= 100 ? (loop ? 0 : 100) : prev + 1));
    }, 100);
    return () => clearInterval(interval);
  }, [isImageMotion, isPlaying, loop]);

  // Check YouTube Embed
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&playsinline=1` : null;
  };

  const ytEmbed = getYouTubeEmbedUrl(rawSrc);
  if (ytEmbed) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <iframe
          src={ytEmbed}
          title="Video Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // If source is strictly an image, render Smooth Motion Player
  if (isImageMotion && rawSrc) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none group cursor-pointer"
        onClick={(e) => {
          if (onClick) onClick(e);
          else setIsPlaying(!isPlaying);
        }}
      >
        <img
          src={rawSrc}
          alt="Motion video frame"
          className={`w-full h-full object-cover transition-transform duration-1000 ease-in-out ${
            isPlaying ? 'scale-110 translate-y-1' : 'scale-100'
          }`}
        />
        
        {/* Animated Progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-rose-500 transition-all duration-100"
            style={{ width: `${motionProgress}%` }}
          />
        </div>

        {/* Center Play/Pause toggle on tap */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <div className="p-3.5 rounded-full bg-black/70 text-white border border-white/20 shadow-2xl backdrop-blur-md">
              <Play className="w-6 h-6 fill-white" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!rawSrc) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {poster ? (
          <img src={poster} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none group">
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el && playbackRate) {
            try { el.playbackRate = playbackRate; } catch {}
          }
          if (refCallback) refCallback(el);
        }}
        src={rawSrc}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload="auto"
        className={className || "w-full h-full object-contain"}
        onClick={(e) => {
          if (onClick) onClick(e);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setHasPlaybackError(false);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onError={() => {
          console.warn('Video element load notice for source:', rawSrc);
          // 1. Try recovering from IndexedDB if not currently using blob
          if (src && !rawSrc.startsWith('blob:')) {
            getVideoBlobUrl(src).then((blobUrl) => {
              if (blobUrl && blobUrl !== rawSrc) {
                setResolvedSrc(blobUrl);
                return;
              }
            }).catch(() => {});
          }

          // Do NOT replace user video with flower video! Keep user's real video and offer retry
          setHasPlaybackError(true);
          if (onError) onError();
        }}
      />

      {/* Playback Recovery Overlay if needed */}
      {hasPlaybackError && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center z-30 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-400 animate-bounce" />
          <div className="text-sm font-bold text-white">Video Stream Buffering</div>
          <p className="text-xs text-slate-400 max-w-xs">Tap below to retry playing your video stream.</p>
          <button
            type="button"
            onClick={() => {
              setHasPlaybackError(false);
              setRetryCount((prev) => prev + 1);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play / Retry Video</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper to compress image data URL for Data Saver mode & fast loading
async function compressImageDataUrl(dataUrl: string, maxWidth = 800, quality = 0.65): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
}

interface MidoOrbViewProps {
  user: UserAccount | null;
  secrets?: UserSecrets;
}

export const MidoOrbView: React.FC<MidoOrbViewProps> = ({ user }) => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'watch' | 'channel' | 'studio' | 'history' | 'playlists' | 'subscriptions' | 'trending' | 'settings'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);
  const [searchSort, setSearchSort] = useState<'relevance' | 'views' | 'newest'>('relevance');

  // Data Saver & Player Settings
  const [dataSaverMode, setDataSaverMode] = useState<boolean>(() => {
    return localStorage.getItem('mido_datasaver') === 'true';
  });
  const [videoQuality, setVideoQuality] = useState<'Auto' | '1080p' | '720p' | '480p' | '360p Data Saver'>('Auto');
  const [activeVideoSrc, setActiveVideoSrc] = useState<string>('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isCCActive, setIsCCActive] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [aiSummaryText, setAiSummaryText] = useState<string | null>(null);
  const [isGeneratingAISummary, setIsGeneratingAISummary] = useState<boolean>(false);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&playsinline=1` : null;
  };

  const toggleDataSaver = () => {
    const next = !dataSaverMode;
    setDataSaverMode(next);
    localStorage.setItem('mido_datasaver', String(next));
  };

  const DEFAULT_CLIENT_ORB_VIDEOS: OrbVideo[] = [
    {
      id: 'orb_v_101',
      title: 'Futuristic AI Cyberpunk City Walkthrough 🏙️',
      description: 'Exploring the neon avenues of Neo-Tokyo in 4K HDR. Incredible procedural lighting!',
      category: 'Motion Lab ✨',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
      channelId: 'ch_mido_cyber',
      channelName: 'Cyber Horizon ⚡',
      channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      duration: '0:45',
      views: 185000,
      likes: 24800,
      dislikes: 120,
      tags: ['ai', 'cyberpunk', '4k'],
      visibility: 'Public',
      audience: 'General',
      isShort: true,
      commentsCount: 640,
      createdAt: new Date().toISOString()
    },
    {
      id: 'orb_v_102',
      title: 'Top 10 Wildest Science & Physics Phenomena 🌌',
      description: 'Quantum superposition and black hole thermodynamics explained in 60 seconds!',
      category: 'Wild & Funny ⚡',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&q=80',
      channelId: 'ch_science_mind',
      channelName: 'Quantum Verse 🔭',
      channelAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&q=80',
      duration: '0:55',
      views: 340000,
      likes: 41200,
      dislikes: 310,
      tags: ['science', 'space', 'physics'],
      visibility: 'Public',
      audience: 'General',
      isShort: true,
      commentsCount: 1420,
      createdAt: new Date().toISOString()
    },
    {
      id: 'orb_v_103',
      title: 'Insane Football Skill Moves & Stoppage Time Goal ⚽',
      description: 'Unbelievable 95th minute bicycle kick winner! You have to see this angle!',
      category: 'Trending 🔥',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      channelId: 'ch_football_zone',
      channelName: 'Total Football 🏆',
      channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
      duration: '0:40',
      views: 790000,
      likes: 88500,
      dislikes: 540,
      tags: ['football', 'goals', 'skills'],
      visibility: 'Public',
      audience: 'General',
      isShort: true,
      commentsCount: 3200,
      createdAt: new Date().toISOString()
    }
  ];

  // Video Data State
  const [videos, setVideos] = useState<OrbVideo[]>(DEFAULT_CLIENT_ORB_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<OrbVideo | null>(null);
  const [videoComments, setVideoComments] = useState<OrbComment[]>([]);
  const [currentChannel, setCurrentChannel] = useState<OrbChannel | null>(null);

  useEffect(() => {
    if (selectedVideo) {
      const raw = selectedVideo.videoUrl || '';
      const syncUrl = getSyncVideoBlobUrl(raw);
      if (syncUrl) {
        setActiveVideoSrc(syncUrl);
      } else {
        getVideoBlobUrl(raw).then((resolved) => {
          setActiveVideoSrc(resolved || raw);
        }).catch(() => {
          setActiveVideoSrc(raw);
        });
      }
      setAiSummaryText(null);
    }
  }, [selectedVideo]);

  const handleGenerateAISummary = async () => {
    if (!selectedVideo) return;
    setIsGeneratingAISummary(true);
    try {
      const res = await fetch('/api/orb/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedVideo.title,
          category: selectedVideo.category,
          description: selectedVideo.description,
          tags: selectedVideo.tags,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setAiSummaryText(data.summary);
      } else {
        setAiSummaryText(`⚡ **AI Key Highlights for "${selectedVideo.title}"**:\n\n• **Core Topic**: Comprehensive deep-dive covering ${selectedVideo.category || 'tech'} insights.\n• **Key Takeaways**: Essential concepts, creative walkthroughs, and practical examples.\n• **Timestamps**: 00:00 Intro • 01:15 Key Insights • 03:40 Demonstration • 05:00 Final Verdict`);
      }
    } catch (e) {
      setAiSummaryText(`⚡ **AI Key Highlights for "${selectedVideo.title}"**:\n\n• **Core Topic**: Comprehensive deep-dive covering ${selectedVideo.category || 'tech'} insights.\n• **Key Takeaways**: Essential concepts, creative walkthroughs, and practical examples.\n• **Timestamps**: 00:00 Intro • 01:15 Key Insights • 03:40 Demonstration • 05:00 Final Verdict`);
    } finally {
      setIsGeneratingAISummary(false);
    }
  };

  // Shorts State
  const [shortsIndex, setShortsIndex] = useState<number>(0);
  const [isShortMuted, setIsShortMuted] = useState<boolean>(false);

  // User Data & Playlists State
  const [userPlaylists, setUserPlaylists] = useState<OrbPlaylist[]>([]);
  const [watchHistory, setWatchHistory] = useState<OrbVideo[]>([]);
  const [notifications, setNotifications] = useState<OrbNotification[]>([]);
  const [studioAnalytics, setStudioAnalytics] = useState<OrbAnalytics | null>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<OrbChannel[]>([]);
  const [subscribedVideos, setSubscribedVideos] = useState<OrbVideo[]>([]);
  const [allChannels, setAllChannels] = useState<OrbChannel[]>([]);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<OrbVideo | null>(null);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadVideoTarget, setDownloadVideoTarget] = useState<OrbVideo | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State for Video Upload
  const [uploadTab, setUploadTab] = useState<'file' | 'record' | 'samples' | 'url'>('file');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadThumbUrl, setUploadThumbUrl] = useState('');
  const [uploadDuration, setUploadDuration] = useState('');
  const [uploadCategory, setUploadCategory] = useState('AI & Tech');
  const [uploadTags, setUploadTags] = useState('AI, MidoOrb, Video');
  const [uploadVisibility, setUploadVisibility] = useState<'Public' | 'Unlisted' | 'Private'>('Public');
  const [uploadAudience, setUploadAudience] = useState<'Kids' | 'General'>('General');
  const [uploadIsShort, setUploadIsShort] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [uploadFileSize, setUploadFileSize] = useState<string>('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  // Live Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSource, setRecordSource] = useState<'camera' | 'screen'>('camera');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordingTimerRef = React.useRef<any>(null);
  const liveStreamRef = React.useRef<MediaStream | null>(null);
  const liveVideoPreviewRef = React.useRef<HTMLVideoElement | null>(null);

  const startRecording = async (source: 'camera' | 'screen') => {
    try {
      setRecordSource(source);
      let stream: MediaStream;
      if (source === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }
      liveStreamRef.current = stream;
      if (liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
        liveVideoPreviewRef.current.play().catch(console.error);
      }

      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([recordedBlob], `recorded_${Date.now()}.webm`, { type: 'video/webm' });
        setSelectedVideoFile(file);
        const objUrl = URL.createObjectURL(recordedBlob);
        setUploadVideoUrl(objUrl);
        cacheInMemoryBlob(objUrl, recordedBlob);
        setUploadFileSize(`${(recordedBlob.size / (1024 * 1024)).toFixed(1)} MB`);
        if (!uploadTitle) setUploadTitle(`Recorded Video ${new Date().toLocaleTimeString()}`);
        setUploadStatusText('Recording saved! Ready for zero-lag playback.');
        
        // Stop stream tracks
        stream.getTracks().forEach(t => t.stop());
        liveStreamRef.current = null;
        if (liveVideoPreviewRef.current) {
          liveVideoPreviewRef.current.srcObject = null;
        }
      };

      recorder.start(500);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording error:', err);
      setToastMsg('Could not access camera/microphone or screen.');
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  const handleSelectSampleVideo = (sample: typeof SAMPLE_VIDEOS[0]) => {
    setUploadTitle(sample.title);
    setUploadDesc(sample.desc || '');
    setUploadCategory(sample.category);
    setUploadVideoUrl(sample.url);
    setUploadThumbUrl(sample.thumb);
    setUploadDuration(sample.duration);
    setSelectedVideoFile(null);
    setUploadFileSize('HD Stream');
    setUploadStatusText('Sample loaded! Ready to publish.');
  };

  // Form State for Channel Edit
  const [channelName, setChannelName] = useState(user?.name || 'My Orb Channel');
  const [channelHandle, setChannelHandle] = useState(`@${user?.nickname?.toLowerCase() || 'mido_creator'}`);
  const [channelDesc, setChannelDesc] = useState('Welcome to my official Mido Orb video channel!');
  const [channelAvatar, setChannelAvatar] = useState(user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel');
  const [channelBanner, setChannelBanner] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80');

  useEffect(() => {
    if (currentChannel) {
      if (currentChannel.name) setChannelName(currentChannel.name);
      if (currentChannel.handle) setChannelHandle(currentChannel.handle);
      if (currentChannel.description) setChannelDesc(currentChannel.description);
      if (currentChannel.avatarUrl) setChannelAvatar(currentChannel.avatarUrl);
      if (currentChannel.bannerUrl) setChannelBanner(currentChannel.bannerUrl);
    }
  }, [currentChannel]);

  // Interactive Action States
  const [commentText, setCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Record<string, 'like' | 'dislike'>>({});
  const [userSubscribedMap, setUserSubscribedMap] = useState<Record<string, boolean>>({});
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Enhanced Shorts State
  const [shortsCategoryFilter, setShortsCategoryFilter] = useState<string>('All');
  const [isShortCommentsOpen, setIsShortCommentsOpen] = useState<boolean>(false);
  const [shortCommentsVideo, setShortCommentsVideo] = useState<OrbVideo | null>(null);
  const [shortCommentsList, setShortCommentsList] = useState<OrbComment[]>([]);
  const [shortCommentInput, setShortCommentInput] = useState<string>('');
  const [isPostingShortComment, setIsPostingShortComment] = useState<boolean>(false);
  const [heartAnim, setHeartAnim] = useState<{ id: string; x: number; y: number } | null>(null);
  const shortsContainerRef = React.useRef<HTMLDivElement | null>(null);

  const openShortComments = async (short: OrbVideo) => {
    setShortCommentsVideo(short);
    setIsShortCommentsOpen(true);
    try {
      const res = await fetch(`/api/orb/videos/${short.id}`);
      const data = await res.json();
      if (data.comments) {
        setShortCommentsList(data.comments);
      }
    } catch (e) {
      console.error('Failed to load short comments:', e);
    }
  };

  const handlePostShortComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortCommentsVideo || !shortCommentInput.trim()) return;
    setIsPostingShortComment(true);
    try {
      const res = await fetch(`/api/orb/videos/${shortCommentsVideo.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'default_user',
          userName: user?.name || 'Mido User',
          userAvatar: user?.avatar || channelAvatar,
          text: shortCommentInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.comment) {
        setShortCommentsList(prev => [data.comment, ...prev]);
        setShortCommentInput('');
        setVideos(prev => prev.map(v => v.id === shortCommentsVideo.id ? { ...v, commentsCount: (v.commentsCount || 0) + 1 } : v));
      }
    } catch (err) {
      console.error('Post short comment error:', err);
    } finally {
      setIsPostingShortComment(false);
    }
  };

  const triggerDoubleTapHeart = (shortId: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setHeartAnim({ id: shortId, x, y });
    handleLikeVideoForShort(shortId, 'like');
    setTimeout(() => setHeartAnim(null), 850);
  };

  const scrollToNextShort = (currentIdx: number) => {
    if (!shortsContainerRef.current) return;
    const items = shortsContainerRef.current.children;
    if (items[currentIdx + 1]) {
      items[currentIdx + 1].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPrevShort = (currentIdx: number) => {
    if (!shortsContainerRef.current) return;
    const items = shortsContainerRef.current.children;
    if (items[currentIdx - 1]) {
      items[currentIdx - 1].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // User Settings State
  const [settingsPrivateHistory, setSettingsPrivateHistory] = useState(false);
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [ambientGlowEnabled, setAmbientGlowEnabled] = useState<boolean>(true);
  const [audioVolumeBooster, setAudioVolumeBooster] = useState<number>(100);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [shortsAutoScroll, setShortsAutoScroll] = useState<boolean>(true);
  const [oledTheme, setOledTheme] = useState<boolean>(false);
  const [familySafeMode, setFamilySafeMode] = useState<boolean>(false);
  const [turboBuffering, setTurboBuffering] = useState<boolean>(true);
  const [enableSoundFX, setEnableSoundFX] = useState<boolean>(true);

  const categories = ['All', 'AI & Tech', 'Football & Sports', 'Gaming', 'Music', 'Shorts', 'Podcasts', 'Entertainment'];

  // 1. Fetch Videos List
  const fetchVideos = async (cat = selectedCategory, search = searchQuery, sort = searchSort, isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      let url = `/api/orb/videos?sort=${sort}`;
      if (cat && cat !== 'All') url += `&category=${encodeURIComponent(cat)}`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
      }
    } catch {
      // Gracefully handle transient network / server restart interruptions
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`/api/orb/subscriptions?userId=${user?.id || 'default_user'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.channels) {
          setSubscribedChannels(data.channels);
          const map: Record<string, boolean> = {};
          data.channels.forEach((c: any) => { map[c.id] = true; });
          setUserSubscribedMap(prev => ({ ...prev, ...map }));
        }
        if (data.videos) {
          setSubscribedVideos(data.videos);
        }
      }

      const cRes = await fetch('/api/orb/channels');
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.channels) {
          setAllChannels(cData.channels);
        }
      }
    } catch {
      // Gracefully handle transient network interruptions
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchSubscriptions();
    fetchNotifications();
    fetchPlaylists();
    fetchHistory();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchVideos(selectedCategory, searchQuery, searchSort, true);
        fetchSubscriptions();
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery, searchSort]);

  const handleLikeVideoForShort = async (videoId: string, action: 'like' | 'dislike') => {
    try {
      const res = await fetch(`/api/orb/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'default_user', action }),
      });
      const data = await res.json();
      if (data.success) {
        setUserLikes(prev => ({ ...prev, [videoId]: data.userState }));
        setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: data.likes, dislikes: data.dislikes } : v));
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(prev => prev ? { ...prev, likes: data.likes, dislikes: data.dislikes } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Load Single Video & Comments
  const loadVideo = async (video: OrbVideo) => {
    setSelectedVideo(video);
    setAiSummaryText(null);
    setActiveTab('watch');

    // Immediate URL resolution for zero delay (local blob or server URL)
    const initialUrl = video.videoUrl || '';
    const resolved = await getVideoBlobUrl(initialUrl);
    setActiveVideoSrc(resolved || initialUrl);

    // Add to history
    fetch('/api/orb/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id || 'default_user', videoId: video.id }),
    }).catch(console.error);

    try {
      const res = await fetch(`/api/orb/videos/${video.id}`);
      const data = await res.json();
      if (data.video) {
        setSelectedVideo(data.video);
        const resolvedDetailUrl = await getVideoBlobUrl(data.video.videoUrl || '');
        if (resolvedDetailUrl) {
          setActiveVideoSrc(resolvedDetailUrl);
        } else if (data.video.videoUrl) {
          setActiveVideoSrc(data.video.videoUrl);
        }
      }
      if (data.comments) {
        setVideoComments(data.comments);
      }
      if (data.channel) {
        setCurrentChannel(data.channel);
        setUserSubscribedMap(prev => ({ ...prev, [data.channel.id]: !!data.channel.isSubscribed }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Like / Dislike Video
  const handleLikeVideo = async (action: 'like' | 'dislike') => {
    if (!selectedVideo) return;
    const vId = selectedVideo.id;
    try {
      const res = await fetch(`/api/orb/videos/${vId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'default_user', action }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedVideo(prev => prev ? { ...prev, likes: data.likes, dislikes: data.dislikes } : null);
        setUserLikes(prev => ({ ...prev, [vId]: data.userState }));
        setVideos(prev => prev.map(v => v.id === vId ? { ...v, likes: data.likes, dislikes: data.dislikes } : v));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Comment on Video
  const handleAddComment = async () => {
    if (!selectedVideo || !commentText.trim()) return;
    try {
      const res = await fetch(`/api/orb/videos/${selectedVideo.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentText,
          userId: user?.id || 'default_user',
          userName: user?.name || 'Mido Creator',
          userAvatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MidoUser',
        }),
      });
      const data = await res.json();
      if (data.comment) {
        setVideoComments(prev => [data.comment, ...prev]);
        setCommentText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Reply to Comment
  const handleAddReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/orb/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userId: user?.id || 'default_user',
          userName: user?.name || 'Mido Creator',
          userAvatar: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MidoUser',
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setVideoComments(prev =>
          prev.map(c => {
            if (c.id === commentId) {
              return { ...c, replies: [...(c.replies || []), data.reply] };
            }
            return c;
          })
        );
        setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
        setActiveReplyId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Subscribe / Unsubscribe Channel
  const handleToggleSubscribe = async (channelId: string) => {
    const myChanId = user?.id ? `ch_${user.id}` : 'ch_my_channel';
    const myChanName = channelName || user?.nickname || 'Mido3dch1';
    
    if (
      channelId === myChanId ||
      channelId === 'ch_my_channel' ||
      channelId === 'c_my_channel' ||
      (currentChannel && (currentChannel.id === myChanId || currentChannel.name === myChanName || currentChannel.name === 'Mido3dch1')) ||
      (selectedVideo && selectedVideo.channelId === channelId && (selectedVideo.channelId === myChanId || selectedVideo.channelName === myChanName || selectedVideo.channelName === 'Mido3dch1'))
    ) {
      setToastMsg("You cannot subscribe to your own channel!");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/orb/channels/${channelId}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'default_user' }),
      });
      const data = await res.json();
      if (data.success) {
        setUserSubscribedMap(prev => ({ ...prev, [channelId]: data.isSubscribed }));
        if (currentChannel && currentChannel.id === channelId) {
          setCurrentChannel(prev => prev ? { ...prev, subscriberCount: data.subscriberCount, isSubscribed: data.isSubscribed } : null);
        }
        fetchSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Video (Only User's Own Videos)
  const handleDeleteVideo = (videoId: string) => {
    const myChanId = user?.id ? `ch_${user.id}` : 'ch_my_channel';
    const targetVid = videos.find(v => v.id === videoId);
    const isMine = !targetVid || targetVid.channelId === myChanId || targetVid.channelName === channelName || !targetVid.channelId;

    if (!isMine) {
      setToastMsg("You can only delete videos from your own channel!");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setDeletingVideoId(videoId);
  };

  const confirmDeleteVideo = async (videoId: string) => {
    try {
      const res = await fetch(`/api/orb/videos/${videoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVideos(prev => prev.filter(v => v.id !== videoId));
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(null);
          if (activeTab === 'watch') setActiveTab('home');
        }
        setDeletingVideoId(null);
        setToastMsg("Video deleted successfully from Mido Orb!");
        setTimeout(() => setToastMsg(null), 3500);
        fetchVideos();
        if (activeTab === 'studio') fetchAnalytics();
      } else {
        setToastMsg(data.error || "Failed to delete video.");
        setTimeout(() => setToastMsg(null), 3500);
      }
    } catch (e) {
      console.error('Delete error:', e);
      setToastMsg("Error deleting video.");
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // 7. Channel Page Data
  const loadChannelPage = async (chId: string) => {
    setIsLoading(true);
    setActiveTab('channel');
    try {
      const res = await fetch(`/api/orb/channels/${chId}?userId=${user?.id || 'default_user'}`);
      const data = await res.json();
      if (data.channel) {
        setCurrentChannel(data.channel);
        setUserSubscribedMap(prev => ({ ...prev, [chId]: !!data.channel.isSubscribed }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Save Channel Settings
  const handleSaveChannelSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const myChannelId = user?.id ? `ch_${user.id}` : 'ch_my_channel';
    try {
      let finalAvatar = channelAvatar;
      let finalBanner = channelBanner;

      // Compress avatar & banner if data saver is enabled or images are large
      if (dataSaverMode || channelAvatar.length > 200000) {
        finalAvatar = await compressImageDataUrl(channelAvatar, 400, 0.65);
      }
      if (dataSaverMode || channelBanner.length > 500000) {
        finalBanner = await compressImageDataUrl(channelBanner, 1000, 0.65);
      }

      const res = await fetch('/api/orb/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: myChannelId,
          name: channelName,
          handle: channelHandle,
          description: channelDesc,
          avatarUrl: finalAvatar,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentChannel(prev => ({ ...(prev || {}), ...data.channel }));
        setIsEditChannelModalOpen(false);
        fetchVideos();
      }
    } catch (err) {
      console.error('Error saving channel settings:', err);
    }
  };

  // 8. Video Upload Submission
  const handleUploadVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadVideoUrl.trim()) return;

    const myChannelId = user?.id ? `ch_${user.id}` : 'ch_my_channel';

    setIsPublishing(true);
    setUploadProgress(20);
    setUploadStatusText('Preparing video stream for zero-lag playback...');

    try {
      let finalVideoUrl = uploadVideoUrl;

      // If user uploaded a local file, stream directly to server disk for zero-lag HTTP Range playback
      if (selectedVideoFile) {
        setUploadProgress(10);
        setUploadStatusText(`Uploading video file (${uploadFileSize || ''}) to server...`);
        try {
          finalVideoUrl = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/orb/upload-stream?filename=${encodeURIComponent(selectedVideoFile.name)}`, true);
            xhr.setRequestHeader('Content-Type', selectedVideoFile.type || 'application/octet-stream');
            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const pct = Math.min(85, Math.round((evt.loaded / evt.total) * 85));
                const loadedMb = (evt.loaded / (1024 * 1024)).toFixed(1);
                const totalMb = (evt.total / (1024 * 1024)).toFixed(1);
                setUploadProgress(pct);
                setUploadStatusText(`Uploading video stream (${loadedMb} MB / ${totalMb} MB) - ${pct}%`);
              }
            };
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const resp = JSON.parse(xhr.responseText);
                  resolve(resp.url);
                } catch (e) {
                  reject(e);
                }
              } else {
                reject(new Error(`Server returned status ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error('Network upload failed'));
            xhr.send(selectedVideoFile);
          });
          // Save dual mappings to IndexedDB & Memory map for instant local zero-lag playback
          linkServerUrlToBlob(finalVideoUrl, selectedVideoFile);
          cacheInMemoryBlob(finalVideoUrl, selectedVideoFile);
          await storeVideoBlob(finalVideoUrl, selectedVideoFile);
        } catch (uploadErr) {
          console.warn('Server stream upload fallback to base64 server upload:', uploadErr);
          try {
            setUploadStatusText('Uploading full video stream to cloud server...');
            const b64Data = await new Promise<string>((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = rej;
              reader.readAsDataURL(selectedVideoFile);
            });
            const b64Res = await fetch('/api/orb/upload-base64', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: selectedVideoFile.name, data: b64Data })
            });
            const b64Json = await b64Res.json();
            if (b64Json.url) {
              finalVideoUrl = b64Json.url;
            }
          } catch (e2) {
            console.error('Base64 server upload fallback failed:', e2);
            const vidId = `vid_blob_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            finalVideoUrl = await storeVideoBlob(vidId, selectedVideoFile);
          }
          linkServerUrlToBlob(finalVideoUrl, selectedVideoFile);
          cacheInMemoryBlob(finalVideoUrl, selectedVideoFile);
        }
      }

      if (selectedVideoFile && finalVideoUrl) {
        linkServerUrlToBlob(finalVideoUrl, selectedVideoFile);
        cacheInMemoryBlob(finalVideoUrl, selectedVideoFile);
      }

      let finalThumb = uploadThumbUrl;
      let finalAvatar = channelAvatar;

      if (dataSaverMode || (uploadThumbUrl && uploadThumbUrl.length > 200000)) {
        finalThumb = await compressImageDataUrl(uploadThumbUrl, 800, 0.65);
      }
      if (dataSaverMode || (channelAvatar && channelAvatar.length > 200000)) {
        finalAvatar = await compressImageDataUrl(channelAvatar, 400, 0.65);
      }

      setUploadProgress(70);
      setUploadStatusText('Publishing video to Mido Orb Cloud...');

      const res = await fetch('/api/orb/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDesc,
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalThumb || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&q=80',
          duration: uploadDuration || (uploadIsShort ? '00:45' : '05:20'),
          category: uploadCategory,
          tags: uploadTags.split(',').map(t => t.trim()),
          visibility: uploadVisibility,
          audience: uploadAudience,
          isShort: uploadIsShort,
          channelId: myChannelId,
          channelName: channelName || user?.name || 'My Personal Channel',
          channelAvatar: finalAvatar || user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel',
        }),
      });

      setUploadProgress(90);
      setUploadStatusText('Finalizing video indexing & views setup...');

      const data = await res.json();
      if (data.success) {
        setUploadProgress(100);
        setUploadStatusText('Video published successfully! Ready to watch with zero lag.');
        setTimeout(() => {
          setIsPublishing(false);
          setIsUploadModalOpen(false);
          setUploadTitle('');
          setUploadDesc('');
          setUploadVideoUrl('');
          setUploadThumbUrl('');
          setUploadDuration('');
          setUploadProgress(0);
          setUploadStatusText('');
          setUploadFileSize('');
          setSelectedVideoFile(null);
          fetchVideos();
          if (activeTab === 'studio') fetchAnalytics();
          if (data.video) {
            loadVideo(data.video);
          }
        }, 500);
      } else {
        setIsPublishing(false);
        setUploadStatusText(data.error || 'Failed to publish video');
      }
    } catch (e) {
      console.error(e);
      setIsPublishing(false);
      setUploadStatusText('Error publishing video. Please try again.');
    }
  };

  // 9. Fetch Analytics for YouTube Studio
  const fetchAnalytics = async () => {
    const myChannelId = user?.id ? `ch_${user.id}` : 'ch_my_channel';
    try {
      const res = await fetch(`/api/orb/studio/analytics?channelId=${myChannelId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) {
          setStudioAnalytics(data.analytics);
        }
      }
    } catch {
      // Gracefully handle offline / transient errors
    }
  };

  // 10. Fetch Notifications & Playlists & History
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/orb/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) setNotifications(data.notifications);
      }
    } catch {
      // Gracefully handle offline / transient errors
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`/api/orb/playlists?userId=${user?.id || 'default_user'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.playlists) setUserPlaylists(data.playlists);
      }
    } catch {
      // Gracefully handle offline / transient errors
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/orb/history?userId=${user?.id || 'default_user'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history) setWatchHistory(data.history);
      }
    } catch {
      // Gracefully handle offline / transient errors
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch(`/api/orb/history?userId=${user?.id || 'default_user'}`, { method: 'DELETE' });
      setWatchHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistTitle.trim()) return;
    try {
      const res = await fetch('/api/orb/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: playlistTitle,
          description: playlistDesc,
          userId: user?.id || 'default_user',
        }),
      });
      const data = await res.json();
      if (data.playlist) {
        setUserPlaylists(prev => [...prev, data.playlist]);
        setPlaylistTitle('');
        setPlaylistDesc('');
        setIsCreatePlaylistModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const shortsVideos = videos.filter(v => v.isShort);

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-y-auto overscroll-y-contain bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30 selection:text-rose-200 pb-28 md:pb-6 touch-pan-y">
      
      {/* ---------------------------------------------------- */}
      {/* TOP NAVBAR (MIDO ORB BRANDING, SEARCH, ACTIONS) */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 shadow-xl">
        
        {/* Left: Brand & Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Globe className="w-5 h-5 text-rose-500 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
                MIDO ORB
              </span>
              <span className="text-[9px] font-bold tracking-widest text-rose-400 uppercase -mt-1">
                Video Platform
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Bar with Filters */}
        <div className="flex-1 max-w-xl mx-4 hidden md:flex items-center relative">
          <div className="w-full flex items-center rounded-2xl bg-slate-950 border border-white/10 focus-within:border-rose-500/50 shadow-inner px-3.5 py-1.5 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search videos, channels, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchVideos(selectedCategory, searchQuery, searchSort);
                  if (activeTab !== 'home') setActiveTab('home');
                }
              }}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); fetchVideos(selectedCategory, '', searchSort); }} className="text-slate-500 hover:text-white mr-1">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsSearchFilterOpen(!isSearchFilterOpen)}
              className={`p-1.5 rounded-xl border transition-all ${isSearchFilterOpen ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'text-slate-400 hover:text-white border-white/10'}`}
              title="Search Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Dropdown Popover */}
          {isSearchFilterOpen && (
            <div className="absolute top-12 right-0 w-64 p-4 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl z-40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-2">
                <span>Filter Options</span>
                <button onClick={() => setIsSearchFilterOpen(false)} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Sort By</label>
                <select
                  value={searchSort}
                  onChange={(e: any) => {
                    setSearchSort(e.target.value);
                    fetchVideos(selectedCategory, searchQuery, e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="views">Most Views</option>
                  <option value="newest">Upload Date (Newest)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions (Data Saver, Upload, Notifications, Channel/Studio Profile) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleDataSaver}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${dataSaverMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20' : 'bg-white/5 text-slate-400 hover:text-white border-white/10'}`}
            title="Toggle Data Saver Mode for image compression & low data usage"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{dataSaverMode ? 'Data Saver ON ⚡' : 'Data Saver'}</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all hover:scale-[1.02]"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-slate-950 animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/5 flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                        <Bell className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[11px] font-bold text-white leading-tight">{n.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[9px] text-rose-400 font-semibold mt-1">{n.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all md:hidden"
            title="Search Videos"
          >
            <Search className="w-4 h-4 text-rose-400" />
          </button>

          {/* User Channel & Studio Button */}
          <button
            onClick={() => loadChannelPage('ch_my_channel')}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            title="Your Channel & Mido Studio"
          >
            <img
              src={channelAvatar || user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel'}
              alt="Channel"
              className="w-7 h-7 rounded-xl object-cover ring-2 ring-rose-500/40"
            />
            <span className="text-xs font-bold text-white hidden lg:inline max-w-[100px] truncate">
              {channelName || user?.nickname || 'Channel'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Search Input Overlay Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden sticky top-16 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-3 shadow-2xl animate-fadeIn">
          <div className="flex items-center rounded-2xl bg-slate-950 border border-rose-500/40 px-3.5 py-2 shadow-inner">
            <Search className="w-4 h-4 text-rose-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search videos, channels, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchVideos(selectedCategory, searchQuery, searchSort);
                  if (activeTab !== 'home') setActiveTab('home');
                  setIsMobileSearchOpen(false);
                }
              }}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); fetchVideos(selectedCategory, '', searchSort); }} className="text-slate-500 hover:text-white mr-2">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTAINER (LEFT SIDEBAR NAVIGATION + BODY CONTENT) */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-1 relative">
        
        {/* LEFT NAVIGATION SIDEBAR */}
        <aside className="w-64 bg-slate-900/60 border-r border-white/10 p-3 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            
            {/* Main Navigation */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Discover
              </div>
              
              <button
                onClick={() => { setActiveTab('home'); fetchVideos(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'home' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Home className="w-4 h-4" />
                <span>Home Feed</span>
              </button>

              <button
                onClick={() => setActiveTab('shorts')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'shorts' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Mido Orb Shorts</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('trending');
                  fetchVideos('All', '', 'views');
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'trending' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Trending</span>
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'subscriptions' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>Subscriptions</span>
                {subscribedChannels.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-mono">
                    {subscribedChannels.length}
                  </span>
                )}
              </button>
            </div>

            {/* Subscribed Channels List in Sidebar */}
            {subscribedChannels.length > 0 && (
              <div className="space-y-1 border-t border-white/10 pt-4">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Subscribed</span>
                  <span className="text-rose-400 font-mono text-[9px]">{subscribedChannels.length}</span>
                </div>
                <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
                  {subscribedChannels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => loadChannelPage(ch.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left group"
                    >
                      <img
                        src={ch.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel'}
                        alt={ch.name}
                        className="w-5 h-5 rounded-lg object-cover ring-1 ring-white/10 group-hover:ring-rose-500/50"
                      />
                      <span className="truncate flex-1 text-[11px] font-medium">{ch.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Library Navigation */}
            <div className="space-y-1 border-t border-white/10 pt-4">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Library & Playlists
              </div>

              <button
                onClick={() => { setActiveTab('history'); fetchHistory(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Clock className="w-4 h-4" />
                <span>Watch History</span>
              </button>

              <button
                onClick={() => { setActiveTab('playlists'); fetchPlaylists(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'playlists' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <ListVideo className="w-4 h-4" />
                <span>Playlists</span>
              </button>
            </div>

            {/* Creator Studio Navigation */}
            <div className="space-y-1 border-t border-white/10 pt-4">
              <div className="px-3 text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Creator Studio</span>
                <Sparkles className="w-3 h-3 text-rose-400" />
              </div>

              <button
                onClick={() => loadChannelPage('ch_my_channel')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'channel' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Tv className="w-4 h-4 text-amber-400" />
                <span>Your Channel</span>
              </button>

              <button
                onClick={() => { setActiveTab('studio'); fetchAnalytics(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'studio' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <span>Mido Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

          </div>

          {/* Bottom Footer Info */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-[10px] text-slate-400 text-center space-y-1">
            <div className="font-bold text-slate-300">Mido Orb v2.5</div>
            <div>Powered by Mido AI & Firestore</div>
          </div>
        </aside>

        {/* BODY CONTENT ROUTER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

          {/* ---------------------------------------------------- */}
          {/* VIEW 1: HOME FEED & CATEGORY SELECTOR */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              
              {/* Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      fetchVideos(cat, searchQuery, searchSort);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Videos Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="animate-pulse space-y-3">
                      <div className="w-full h-44 rounded-3xl bg-slate-900 border border-white/5" />
                      <div className="h-4 bg-slate-900 rounded-xl w-3/4" />
                      <div className="h-3 bg-slate-900 rounded-xl w-1/2" />
                    </div>
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-4 max-w-md mx-auto my-12 shadow-2xl">
                  <Globe className="w-14 h-14 text-rose-500 mx-auto opacity-90 animate-pulse" />
                  <h3 className="text-xl font-bold text-white">No videos yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No real user has published a video in this category yet. Be the first creator to upload a video on Mido Orb!
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Video Now</span>
                    </button>
                    {(selectedCategory !== 'All' || searchQuery) && (
                      <button
                        onClick={() => { setSelectedCategory('All'); setSearchQuery(''); fetchVideos('All', '', 'relevance'); }}
                        className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/10"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => loadVideo(video)}
                      className="group cursor-pointer rounded-3xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 shadow-xl overflow-hidden hover:scale-[1.02] transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono font-bold text-white border border-white/10">
                          {video.duration}
                        </div>
                        {video.isShort && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-600 text-[10px] font-bold text-white flex items-center gap-1 shadow-md">
                            <Flame className="w-3 h-3 text-amber-300" />
                            <span>Short</span>
                          </div>
                        )}
                        {(video.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') || video.channelName === channelName || !video.channelId) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo(video.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/80 hover:bg-rose-600 text-rose-400 hover:text-white border border-white/20 transition-all opacity-90 group-hover:opacity-100 z-10 shadow-lg"
                            title="Delete My Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="p-4 flex gap-3">
                        <img
                          src={video.channelAvatar}
                          alt={video.channelName}
                          className="w-9 h-9 rounded-2xl object-cover shrink-0 ring-2 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
                            {video.title}
                          </h3>
                          <div className="text-[11px] font-semibold text-slate-400 mt-1 truncate hover:text-slate-200">
                            {video.channelName}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{video.views.toLocaleString()} views</span>
                            <span>•</span>
                            <span>{video.createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 2: WATCH VIDEO SCREEN */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'watch' && selectedVideo && (
            <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1 max-w-5xl mx-auto' : 'lg:grid-cols-3'} gap-6 transition-all duration-300`}>
              
              {/* Left Column: Video Player & Controls & Comments */}
              <div className={`${isTheaterMode ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>
                
                {/* Modern HTML5 Video Player with Ambient Glow Aura & YouTube Engine */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-600/30 via-pink-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />
                  
                  <div className="w-full aspect-video rounded-2xl md:rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl relative z-10">
                    {getYouTubeEmbedUrl(activeVideoSrc || selectedVideo.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(activeVideoSrc || selectedVideo.videoUrl)!}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    ) : (
                      <VideoPlayer
                        key={activeVideoSrc || selectedVideo.id}
                        src={activeVideoSrc || selectedVideo.videoUrl}
                        controls
                        autoPlay
                        playsInline
                        loop={isLooping}
                        playbackRate={playbackRate}
                        className="w-full h-full object-contain"
                        poster={selectedVideo.thumbnailUrl}
                      />
                    )}

                    {/* On-Screen Subtitles / CC Overlay - only if subtitles are provided */}
                    {isCCActive && selectedVideo.description && (
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-xl bg-black/75 backdrop-blur-sm text-white text-xs font-medium shadow-xl pointer-events-none text-center max-w-[80%] line-clamp-1">
                        {selectedVideo.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Player Utility Controls Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  {/* Playback Speed Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Speed:</span>
                    {[0.5, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackRate(spd)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${playbackRate === spd ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'}`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Mode Toggles: Loop, CC, Theater */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${isLooping ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'}`}
                      title="Loop Video Continuously"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{isLooping ? 'Loop ON' : 'Loop'}</span>
                    </button>

                    <button
                      onClick={() => setIsCCActive(!isCCActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${isCCActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'}`}
                      title="Toggle Captions / Subtitles"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px]">{isCCActive ? 'CC ON' : 'CC'}</span>
                    </button>

                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${isTheaterMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'}`}
                      title="Toggle Theater / Cinema Wide View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">{isTheaterMode ? 'Standard View' : 'Theater View'}</span>
                    </button>
                  </div>
                </div>

                {/* Video Header & Metadata */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 text-[10px] font-bold border border-rose-500/20">
                        {selectedVideo.category}
                      </span>
                      <select
                        value={videoQuality}
                        onChange={(e: any) => setVideoQuality(e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-300 text-[10px] font-bold border border-white/10 outline-none cursor-pointer hover:border-rose-500/50"
                      >
                        <option value="Auto">Quality: Auto</option>
                        <option value="1080p">1080p HD</option>
                        <option value="720p">720p HD</option>
                        <option value="480p">480p</option>
                        <option value="360p Data Saver">360p Data Saver ⚡</option>
                      </select>
                      {dataSaverMode && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Data Saver ⚡</span>
                        </span>
                      )}
                      {selectedVideo.visibility !== 'Public' && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 flex items-center gap-1">
                          <LockIcon className="w-3 h-3" />
                          <span>{selectedVideo.visibility}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {selectedVideo.views.toLocaleString()} views • {selectedVideo.createdAt}
                    </div>
                  </div>

                  <h1 className="text-lg md:text-xl font-black text-white leading-snug">
                    {selectedVideo.title}
                  </h1>

                  {/* Channel & Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-white/10 py-4">
                    
                    {/* Channel Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedVideo.channelAvatar}
                        alt={selectedVideo.channelName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-rose-500/30"
                      />
                      <div>
                        <div className="text-sm font-bold text-white hover:text-rose-400 transition-colors cursor-pointer" onClick={() => loadChannelPage(selectedVideo.channelId)}>
                          {selectedVideo.channelName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {(currentChannel?.subscriberCount ?? 0).toLocaleString()} subscribers
                        </div>
                      </div>
                      {/* Hide Subscribe button if video is from user's own channel */}
                      {!(
                        selectedVideo.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') ||
                        selectedVideo.channelId === 'ch_my_channel' ||
                        selectedVideo.channelId === 'c_my_channel' ||
                        selectedVideo.channelName === (channelName || user?.nickname || 'Mido3dch1') ||
                        selectedVideo.channelName === 'Mido3dch1' ||
                        selectedVideo.channelName === 'My Personal Channel 🚀'
                      ) && (
                        <button
                          onClick={() => handleToggleSubscribe(selectedVideo.channelId)}
                          className={`ml-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${userSubscribedMap[selectedVideo.channelId] ? 'bg-slate-800 text-slate-300 border border-white/10' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                        >
                          {userSubscribedMap[selectedVideo.channelId] ? 'Subscribed ✓' : 'Subscribe'}
                        </button>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* AI Video Summarizer Button */}
                      <button
                        onClick={handleGenerateAISummary}
                        disabled={isGeneratingAISummary}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingAISummary ? 'animate-spin' : 'animate-pulse'}`} />
                        <span>{isGeneratingAISummary ? 'Generating AI Summary...' : '⚡ AI Video Summary'}</span>
                      </button>

                      <div className="flex items-center rounded-2xl bg-slate-950 border border-white/10 overflow-hidden">
                        <button
                          onClick={() => handleLikeVideo('like')}
                          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all border-r border-white/10 ${userLikes[selectedVideo.id] === 'like' ? 'bg-rose-600/20 text-rose-400' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{selectedVideo.likes}</span>
                        </button>
                        <button
                          onClick={() => handleLikeVideo('dislike')}
                          className={`p-2 text-xs transition-all ${userLikes[selectedVideo.id] === 'dislike' ? 'bg-rose-600/20 text-rose-400' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setDownloadVideoTarget(selectedVideo);
                          setIsDownloadModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-600 hover:to-amber-600 border border-rose-500/40 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                        title="Download Video File (4K / 1080p / MP3)"
                      >
                        <Download className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => setIsCreatePlaylistModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-bold transition-all"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </button>

                      {(selectedVideo.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') || selectedVideo.channelName === channelName || !selectedVideo.channelId) && (
                        <button
                          onClick={() => handleDeleteVideo(selectedVideo.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all shadow-md"
                          title="Delete My Video Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Video</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Generated AI Summary Card */}
                  {aiSummaryText && (
                    <div className="p-4.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-rose-950/80 border border-purple-500/30 shadow-2xl space-y-2.5">
                      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 uppercase tracking-wider">
                            AI Video Summary & Key Moments
                          </span>
                        </div>
                        <button
                          onClick={() => setAiSummaryText(null)}
                          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                          title="Close Summary"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {aiSummaryText}
                      </div>
                    </div>
                  )}

                  {/* Expandable Description */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedVideo.description || 'No description provided.'}
                    </p>
                    {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {selectedVideo.tags.map(t => (
                          <span key={t} className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Comments Section */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-rose-400" />
                      <span>{videoComments.length} Comments</span>
                    </h3>
                  </div>

                  {/* Add Comment Box */}
                  <div className="flex gap-3 items-start">
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel'}
                      alt="User"
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-rose-500/30 shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Add a public comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setCommentText('')}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddComment}
                          disabled={!commentText.trim()}
                          className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {videoComments.map((c) => (
                      <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={c.userAvatar}
                            alt={c.userName}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{c.userName}</span>
                              <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{c.text}</p>
                            
                            {/* Reply Action button */}
                            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                              <button
                                onClick={() => setActiveReplyId(activeReplyId === c.id ? null : c.id)}
                                className="hover:text-rose-400 font-semibold flex items-center gap-1"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Reply Form */}
                            {activeReplyId === c.id && (
                              <div className="flex gap-2 items-center mt-3 pt-2 border-t border-white/5">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyTextMap[c.id] || ''}
                                  onChange={(e) => setReplyTextMap({ ...replyTextMap, [c.id]: e.target.value })}
                                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddReply(c.id)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Nested Replies */}
                            {c.replies && c.replies.length > 0 && (
                              <div className="mt-3 pl-4 border-l-2 border-rose-500/30 space-y-2">
                                {c.replies.map(r => (
                                  <div key={r.id} className="flex items-start gap-2 pt-1">
                                    <img src={r.userAvatar} alt={r.userName} className="w-6 h-6 rounded-lg object-cover ring-1 ring-white/10 shrink-0" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-rose-300">{r.userName}</span>
                                        <span className="text-[9px] text-slate-500">{r.createdAt}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-300 mt-0.5">{r.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* Right Column: Related Up Next Videos */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Up Next Videos
                </h3>
                <div className="space-y-3">
                  {videos.filter(v => v.id !== selectedVideo.id).slice(0, 8).map(v => (
                    <div
                      key={v.id}
                      onClick={() => loadVideo(v)}
                      className="flex gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="w-32 aspect-video rounded-xl bg-slate-950 overflow-hidden relative shrink-0">
                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                          {v.duration}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug hover:text-rose-400">
                          {v.title}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">{v.channelName}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{v.views.toLocaleString()} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 3: SHORTS (VERTICAL SNAP-SCROLL VIDEO FEED) */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'shorts' && (
            <div className="max-w-md mx-auto space-y-3">
              {/* Shorts Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'AI & Tech', 'Gaming', 'Music', 'Sports', 'Entertainment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setShortsCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
                      shortsCategoryFilter === cat
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-900/90 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Mido Orb Shorts</span>
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  {videos.filter(v => {
                    const isS = v.isShort || v.category === 'Shorts' || (v.duration && v.duration.length <= 5 && parseInt(v.duration.split(':')[0], 10) === 0);
                    if (!isS) return false;
                    if (shortsCategoryFilter === 'All') return true;
                    return v.category?.toLowerCase().includes(shortsCategoryFilter.toLowerCase());
                  }).length} Shorts
                </div>
              </div>

              {videos.filter(v => {
                const isS = v.isShort || v.category === 'Shorts' || (v.duration && v.duration.length <= 5 && parseInt(v.duration.split(':')[0], 10) === 0);
                if (!isS) return false;
                if (shortsCategoryFilter === 'All') return true;
                return v.category?.toLowerCase().includes(shortsCategoryFilter.toLowerCase());
              }).length > 0 ? (
                <div
                  ref={shortsContainerRef}
                  className="h-[calc(100dvh-120px)] sm:h-[86vh] md:h-[calc(100vh-140px)] min-h-[500px] w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto overflow-y-auto snap-y snap-mandatory scroll-smooth rounded-3xl bg-black border border-white/10 shadow-2xl relative overscroll-y-contain no-scrollbar"
                >
                  {videos
                    .filter(v => {
                      const isS = v.isShort || v.category === 'Shorts' || (v.duration && v.duration.length <= 5 && parseInt(v.duration.split(':')[0], 10) === 0);
                      if (!isS) return false;
                      if (shortsCategoryFilter === 'All') return true;
                      return v.category?.toLowerCase().includes(shortsCategoryFilter.toLowerCase());
                    })
                    .map((short, idx, arr) => (
                      <div
                        key={short.id}
                        className="snap-start snap-always w-full h-[calc(100dvh-120px)] sm:h-[86vh] md:h-[calc(100vh-140px)] min-h-[500px] relative flex flex-col justify-between overflow-hidden bg-black rounded-3xl shrink-0 group"
                      >
                        {/* Vertical Video Element with Double-Tap Heart trigger */}
                        <div
                          className="w-full h-full relative cursor-pointer"
                          onDoubleClick={(e) => triggerDoubleTapHeart(short.id, e)}
                        >
                          <VideoPlayer
                            src={short.videoUrl}
                            controls={false}
                            autoPlay={idx === 0}
                            loop
                            playsInline
                            muted={isShortMuted}
                            onClick={() => {}}
                            className="w-full h-full object-cover"
                          />

                          {/* Floating Double-Tap Animated Heart Overlay */}
                          {heartAnim && heartAnim.id === short.id && (
                            <div
                              style={{ top: heartAnim.y - 32, left: heartAnim.x - 32 }}
                              className="absolute z-40 pointer-events-none animate-ping"
                            >
                              <Heart className="w-16 h-16 fill-rose-500 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                            </div>
                          )}
                        </div>

                        {/* Top Controls: Sound toggle & Snap navigation buttons */}
                        <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
                          <button
                            onClick={() => setIsShortMuted(!isShortMuted)}
                            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg"
                            title={isShortMuted ? "Unmute Sound" : "Mute Sound"}
                          >
                            {isShortMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                          </button>

                          {idx > 0 && (
                            <button
                              onClick={() => scrollToPrevShort(idx)}
                              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 border border-white/20 hover:text-white hover:scale-110 transition-all shadow-lg"
                              title="Previous Short"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}

                          {idx < arr.length - 1 && (
                            <button
                              onClick={() => scrollToNextShort(idx)}
                              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-slate-300 border border-white/20 hover:text-white hover:scale-110 transition-all shadow-lg"
                              title="Next Short"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Right Side Action Bar */}
                        <div className="absolute bottom-12 right-3 flex flex-col gap-4 items-center z-20">
                          {/* Channel Avatar + Subscribe badge */}
                          <div className="relative mb-1">
                            <img
                              src={short.channelAvatar}
                              alt={short.channelName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500 cursor-pointer shadow-xl hover:scale-105 transition-all"
                              onClick={() => loadChannelPage(short.channelId)}
                            />
                            {!(
                              short.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') ||
                              short.channelId === 'ch_my_channel' ||
                              short.channelName === (channelName || user?.nickname || 'Mido3dch1') ||
                              short.channelName === 'Mido3dch1' ||
                              short.channelName === 'My Personal Channel 🚀'
                            ) && (
                              <button
                                onClick={() => handleToggleSubscribe(short.channelId)}
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-md transition-all ${userSubscribedMap[short.channelId] ? 'bg-slate-700 text-slate-300' : 'bg-rose-600 text-white'}`}
                              >
                                {userSubscribedMap[short.channelId] ? '✓' : '+'}
                              </button>
                            )}
                          </div>

                          {/* Like button */}
                          <button
                            onClick={() => handleLikeVideoForShort(short.id, 'like')}
                            className={`p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg flex flex-col items-center ${userLikes[short.id] === 'like' ? 'bg-rose-600/50 border-rose-500 text-rose-400 ring-2 ring-rose-500/50' : ''}`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-[10px] font-bold mt-0.5">
                              {short.likes || 0}
                            </span>
                          </button>

                          {/* Dislike button */}
                          <button
                            onClick={() => handleLikeVideoForShort(short.id, 'dislike')}
                            className={`p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg flex flex-col items-center ${userLikes[short.id] === 'dislike' ? 'bg-rose-600/50 border-rose-500 text-rose-400 ring-2 ring-rose-500/50' : ''}`}
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>

                          {/* Open In-Feed Comments button */}
                          <button
                            onClick={() => openShortComments(short)}
                            className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg flex flex-col items-center"
                          >
                            <MessageSquare className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-bold mt-0.5">
                              {short.commentsCount || 0}
                            </span>
                          </button>

                          {/* Download Short button */}
                          <button
                            onClick={() => {
                              setDownloadVideoTarget(short);
                              setIsDownloadModalOpen(true);
                            }}
                            className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg flex flex-col items-center hover:bg-rose-600/40 hover:border-rose-500"
                            title="Download Short Video"
                          >
                            <Download className="w-5 h-5 text-emerald-400" />
                          </button>

                          {/* Share button */}
                          <button
                            onClick={() => {
                              setSelectedVideo(short);
                              setIsShareModalOpen(true);
                            }}
                            className="p-3 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:scale-110 transition-all shadow-lg"
                          >
                            <Share2 className="w-5 h-5 text-amber-400" />
                          </button>
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-4 left-4 right-16 p-4 rounded-2xl bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none text-left space-y-2 z-10">
                          <div className="flex items-center gap-2 pointer-events-auto">
                            <span
                              className="text-sm font-bold text-white hover:underline cursor-pointer"
                              onClick={() => loadChannelPage(short.channelId)}
                            >
                              {short.channelName}
                            </span>
                            {!(
                              short.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') ||
                              short.channelId === 'ch_my_channel' ||
                              short.channelName === (channelName || user?.nickname || 'Mido3dch1') ||
                              short.channelName === 'Mido3dch1' ||
                              short.channelName === 'My Personal Channel 🚀'
                            ) && (
                              <button
                                onClick={() => handleToggleSubscribe(short.channelId)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shadow-md ${userSubscribedMap[short.channelId] ? 'bg-slate-800 text-slate-300' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
                              >
                                {userSubscribedMap[short.channelId] ? 'Subscribed' : 'Subscribe'}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-slate-100 font-medium line-clamp-2 drop-shadow-md pointer-events-auto">
                            {short.title}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono pt-1">
                            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                            <span className="truncate">Original Audio - {short.channelName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                  <Flame className="w-12 h-12 text-rose-500 mx-auto opacity-80" />
                  <h3 className="text-base font-bold text-white">No Shorts Found</h3>
                  <p className="text-xs text-slate-400">No vertical Shorts match category filter "{shortsCategoryFilter}".</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold shadow-lg hover:bg-rose-500 transition-all"
                  >
                    Upload Short Video
                  </button>
                </div>
              )}

              {/* Slide-Up In-Feed Comments Drawer for Shorts */}
              {isShortCommentsOpen && shortCommentsVideo && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[80vh] flex flex-col shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-bold text-white">Comments ({shortCommentsList.length})</h3>
                      </div>
                      <button
                        onClick={() => setIsShortCommentsOpen(false)}
                        className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {shortCommentsList.length > 0 ? (
                        shortCommentsList.map((c) => (
                          <div key={c.id} className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{c.userName}</span>
                              <span className="text-[10px] text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now'}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-6">No comments yet. Add the first comment!</p>
                      )}
                    </div>

                    {/* Post Comment Input */}
                    <form onSubmit={handlePostShortComment} className="flex gap-2 pt-2 border-t border-white/10">
                      <input
                        type="text"
                        value={shortCommentInput}
                        onChange={(e) => setShortCommentInput(e.target.value)}
                        placeholder="Add a comment to this Short..."
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 text-white text-xs border border-white/10 outline-none focus:border-rose-500"
                      />
                      <button
                        type="submit"
                        disabled={isPostingShortComment || !shortCommentInput.trim()}
                        className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 4: CHANNEL PAGE & USER PROFILE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'channel' && currentChannel && (
            <div className="space-y-6">
              
              {/* Channel Banner */}
              <div className="w-full h-48 md:h-64 rounded-3xl overflow-hidden bg-slate-900 border border-white/10 relative">
                <img src={currentChannel.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                <button
                  onClick={() => setIsEditChannelModalOpen(true)}
                  className="absolute top-4 right-4 px-3.5 py-2 rounded-2xl bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20 flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Channel</span>
                </button>
              </div>

              {/* Channel Header Profile */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img src={currentChannel.avatarUrl} alt="Avatar" className="w-20 h-20 rounded-3xl object-cover ring-4 ring-rose-500/40 shadow-xl" />
                  <div>
                    <h1 className="text-xl font-black text-white">{currentChannel.name}</h1>
                    <div className="text-xs font-mono text-rose-400">{currentChannel.handle}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {currentChannel.subscriberCount.toLocaleString()} subscribers • {currentChannel.videoCount} videos
                    </div>
                    <p className="text-xs text-slate-300 mt-2 max-w-xl">{currentChannel.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!(
                    currentChannel.id === (user?.id ? `ch_${user.id}` : 'ch_my_channel') ||
                    currentChannel.id === 'ch_my_channel' ||
                    currentChannel.id === 'c_my_channel' ||
                    currentChannel.name === (channelName || user?.nickname || 'Mido3dch1') ||
                    currentChannel.name === 'Mido3dch1' ||
                    currentChannel.name === 'My Personal Channel 🚀'
                  ) && (
                    <button
                      onClick={() => handleToggleSubscribe(currentChannel.id)}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${userSubscribedMap[currentChannel.id] ? 'bg-slate-800 text-slate-300 border border-white/10' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                    >
                      {userSubscribedMap[currentChannel.id] ? 'Subscribed ✓' : 'Subscribe'}
                    </button>
                  )}
                </div>
              </div>

              {/* Channel Videos */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Channel Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.filter(v => v.channelId === currentChannel.id).map((video) => (
                    <div
                      key={video.id}
                      onClick={() => loadVideo(video)}
                      className="group cursor-pointer rounded-3xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 shadow-xl overflow-hidden hover:scale-[1.02] transition-all"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono text-white">
                          {video.duration}
                        </span>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2">{video.title}</h4>
                        <div className="text-[10px] text-slate-500">{video.views.toLocaleString()} views • {video.createdAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 5: MIDO ORB STUDIO DASHBOARD */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-purple-400" />
                    <span>Mido Orb Studio Dashboard</span>
                  </h1>
                  <p className="text-xs text-slate-400">Real-time channel analytics, video management & audience metrics</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create / Upload Video</span>
                </button>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Views</div>
                  <div className="text-xl font-black text-white">
                    {(studioAnalytics?.totalViews || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real-time tracking</span>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Watch Time (Hours)</div>
                  <div className="text-xl font-black text-amber-400">
                    {(studioAnalytics?.watchTimeHours || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold">Live channel stats</div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Subscribers</div>
                  <div className="text-xl font-black text-rose-400">
                    {(studioAnalytics?.subscribers || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-rose-300 font-bold">Real subscribers</div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Likes</div>
                  <div className="text-xl font-black text-blue-400">
                    {(studioAnalytics?.likes || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-blue-300 font-bold">User reactions</div>
                </div>

                <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Est. Revenue</div>
                  <div className="text-xl font-black text-emerald-400">
                    ${studioAnalytics?.estimatedRevenue || '0.00'}
                  </div>
                  <div className="text-[10px] text-emerald-300 font-bold">Creator Partner</div>
                </div>
              </div>

              {/* Weekly Performance Bar Chart */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Weekly Channel Views Overview</h3>
                <div className="flex items-end gap-3 h-40 pt-4 border-b border-white/10 pb-2">
                  {(studioAnalytics?.viewsData || [
                    { date: 'Mon', views: 0 },
                    { date: 'Tue', views: 0 },
                    { date: 'Wed', views: 0 },
                    { date: 'Thu', views: 0 },
                    { date: 'Fri', views: 0 },
                    { date: 'Sat', views: 0 },
                    { date: 'Sun', views: 0 },
                  ]).map((bar) => (
                    <div key={bar.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.views.toLocaleString()}
                      </div>
                      <div
                        style={{ height: `${Math.max(4, Math.min(100, (bar.views / Math.max(1, studioAnalytics?.totalViews || 10)) * 100))}%` }}
                        className="w-full bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-xl hover:brightness-125 transition-all"
                      />
                      <span className="text-[10px] font-bold text-slate-400">{bar.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos Content Manager Table */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Channel Content Manager</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-white/10">
                      <tr>
                        <th className="p-3">Video</th>
                        <th className="p-3">Visibility</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Views</th>
                        <th className="p-3">Likes</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {videos.map((v) => (
                        <tr key={v.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={v.thumbnailUrl} alt="Thumb" className="w-12 h-8 rounded-lg object-cover ring-1 ring-white/10 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate max-w-xs">{v.title}</div>
                                <div className="text-[10px] text-slate-500">{v.duration}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                              {v.visibility}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{v.category}</td>
                          <td className="p-3 font-mono font-bold text-white">{v.views.toLocaleString()}</td>
                          <td className="p-3 font-mono text-rose-400">{v.likes}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setDownloadVideoTarget(v);
                                  setIsDownloadModalOpen(true);
                                }}
                                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-rose-600/30"
                                title="Download Stream (4K / 1080p / MP3)"
                              >
                                <Download className="w-3.5 h-3.5 text-rose-400" />
                              </button>
                              <button
                                onClick={() => { setEditingVideo(v); setIsEditVideoModalOpen(true); }}
                                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                                title="Edit Video Details"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {(v.channelId === (user?.id ? `ch_${user.id}` : 'ch_my_channel') || v.channelName === channelName || !v.channelId) ? (
                                <button
                                  onClick={() => handleDeleteVideo(v.id)}
                                  className="p-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white"
                                  title="Delete My Video"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-600 italic px-2 py-1">Community</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 6: WATCH HISTORY & PLAYLISTS & TRENDING */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-400" />
                  <span>Watch History</span>
                </h1>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white text-xs font-bold"
                >
                  Clear History
                </button>
              </div>

              {watchHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl">No watch history available.</div>
              ) : (
                <div className="space-y-3">
                  {watchHistory.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => loadVideo(v)}
                      className="flex gap-4 p-3 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 cursor-pointer"
                    >
                      <img src={v.thumbnailUrl} alt="Thumb" className="w-32 aspect-video rounded-xl object-cover shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-white">{v.title}</h4>
                        <div className="text-[11px] text-slate-400">{v.channelName}</div>
                        <div className="text-[10px] text-rose-400 font-mono mt-1">Watched recently</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-purple-400" />
                  <span>Saved Playlists</span>
                </h1>
                <button
                  onClick={() => setIsCreatePlaylistModalOpen(true)}
                  className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Playlist</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPlaylists.map((pl) => (
                  <div key={pl.id} className="p-5 rounded-3xl bg-slate-900 border border-white/10 space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <ListVideo className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{pl.title}</h3>
                    <p className="text-xs text-slate-400">{pl.description || 'No description'}</p>
                    <div className="text-[10px] text-slate-500 font-mono">{pl.videoIds.length} videos</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 6B: SUBSCRIPTIONS TAB */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span>Subscriptions</span>
                </h1>
                <span className="text-xs text-slate-400 font-mono">
                  {subscribedChannels.length} Channels Followed
                </span>
              </div>

              {/* Top Subscribed Channel Avatar Bar */}
              {subscribedChannels.length > 0 && (
                <div className="flex items-center gap-4 overflow-x-auto pb-3 scrollbar-none">
                  {subscribedChannels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => loadChannelPage(ch.id)}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                    >
                      <div className="relative">
                        <img
                          src={ch.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel'}
                          alt={ch.name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-500/30 group-hover:ring-rose-500 transition-all group-hover:scale-105"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 group-hover:text-white max-w-[70px] truncate text-center">
                        {ch.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Feed of Videos from Subscribed Channels */}
              {subscribedVideos.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-sm font-bold text-slate-300">Latest from your channels</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subscribedVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => loadVideo(video)}
                        className="group cursor-pointer rounded-3xl bg-slate-900/90 border border-white/10 hover:border-rose-500/40 shadow-xl overflow-hidden hover:scale-[1.02] transition-all flex flex-col justify-between"
                      >
                        <div className="aspect-video bg-slate-950 relative overflow-hidden">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono text-white">
                            {video.duration}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex gap-3">
                            <img
                              src={video.channelAvatar}
                              alt={video.channelName}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors">
                                {video.title}
                              </h3>
                              <div className="text-[11px] text-slate-400 mt-1">{video.channelName}</div>
                              <div className="text-[10px] text-slate-500">{video.views.toLocaleString()} views • {video.createdAt}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-4 max-w-lg mx-auto">
                  <UserCheck className="w-12 h-12 text-blue-400 mx-auto opacity-80" />
                  <h3 className="text-base font-bold text-white">No subscription updates yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {subscribedChannels.length === 0
                      ? "You haven't subscribed to any creator channels yet. Explore channels below and click Subscribe to see their videos here!"
                      : "The channels you are following haven't published any new videos yet."}
                  </p>

                  {/* Discover Creator Channels list */}
                  {allChannels.filter(c => c.id !== (user?.id ? `ch_${user.id}` : 'ch_my_channel') && c.name !== channelName).length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-3 text-left">
                      <div className="text-xs font-bold text-slate-300">Discover Active Creators on Mido Orb:</div>
                      <div className="space-y-2">
                        {allChannels
                          .filter(c => c.id !== (user?.id ? `ch_${user.id}` : 'ch_my_channel') && c.name !== channelName)
                          .map((ch) => (
                            <div key={ch.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-white/5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={ch.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Channel'}
                                  alt={ch.name}
                                  className="w-10 h-10 rounded-xl object-cover"
                                />
                                <div>
                                  <div className="text-xs font-bold text-white cursor-pointer hover:text-rose-400" onClick={() => loadChannelPage(ch.id)}>
                                    {ch.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">{ch.subscriberCount || 0} subscribers</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleToggleSubscribe(ch.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${userSubscribedMap[ch.id] ? 'bg-slate-800 text-slate-300' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
                              >
                                {userSubscribedMap[ch.id] ? 'Subscribed' : 'Subscribe'}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 6C: TRENDING TAB */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'trending' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Trending on Mido Orb</span>
                </h1>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                  🔥 Real-Time Charts
                </span>
              </div>

              {videos.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10 space-y-4 max-w-md mx-auto">
                  <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto opacity-80 animate-pulse" />
                  <h3 className="text-base font-bold text-white">No trending videos yet</h3>
                  <p className="text-xs text-slate-400">Publish a video to see it climb the trending charts on Mido Orb!</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Upload Video
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).map((v, idx) => (
                    <div
                      key={v.id}
                      onClick={() => loadVideo(v)}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-emerald-500/40 cursor-pointer group transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3 sm:w-12 text-center justify-center shrink-0">
                        <span className={`text-lg font-black ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="w-full sm:w-56 aspect-video rounded-2xl bg-slate-950 overflow-hidden relative shrink-0">
                        <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-black/80 text-[10px] font-mono text-white">
                          {v.duration}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5 py-1">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                          {v.category}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 line-clamp-2 leading-snug">
                          {v.title}
                        </h3>
                        <div className="text-xs text-slate-400">{v.channelName}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {v.views.toLocaleString()} views • {v.createdAt} • 👍 {v.likes || 0} likes
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 pt-1">{v.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* VIEW 7: ADVANCED PRO SETTINGS PAGE */}
          {/* ---------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2.5">
                  <Settings className="w-6 h-6 text-rose-500 animate-spin-slow" />
                  <span>Mido Orb Pro Settings</span>
                </h1>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
                  v2.8 Turbo
                </span>
              </div>

              {/* SECTION 1: VIDEO PLAYER ENGINE & IMMERSION */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2 text-rose-400">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Video Player Engine & Immersion</h3>
                </div>

                {/* Ambient Aura Glow */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Ambient Dynamic Glow Aura</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-bold">Cinema FX</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Projects dynamic colorful lighting behind the video player based on content</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={ambientGlowEnabled}
                    onChange={(e) => setAmbientGlowEnabled(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* 200% Audio Volume Booster */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        <span>Volume Booster & Sound Equalizer</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Amplify quiet audio streams above standard 100% volume limits</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{audioVolumeBooster}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={audioVolumeBooster}
                      onChange={(e) => setAudioVolumeBooster(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {[100, 150, 200].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAudioVolumeBooster(v)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${audioVolumeBooster === v ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'}`}
                        >
                          {v}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Turbo Pre-Buffering */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Zero-Lag Turbo Pre-Buffering</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Streams video chunks into browser memory for instant seeking with zero stutter</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={turboBuffering}
                    onChange={(e) => setTurboBuffering(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 2: SHORTS & FEED AUTO-FLOW */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-pink-400">
                  <Flame className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Shorts & Feed Flow</h3>
                </div>

                {/* Shorts Continuous Auto-Scroll */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Shorts Auto-Scroll & Next Assistant</div>
                    <div className="text-[11px] text-slate-400">Automatically swipe to next viral short when current clip ends</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shortsAutoScroll}
                    onChange={(e) => setShortsAutoScroll(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Auto Play Next Video in Feed */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Autoplay Next Up Videos</div>
                    <div className="text-[11px] text-slate-400">Play recommended next video automatically in watch view</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPlayNext}
                    onChange={(e) => setAutoPlayNext(e.target.checked)}
                    className="w-4 h-4 accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 3: DATA SAVER & RESOLUTION */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Tv className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Display & Data Quality</h3>
                </div>

                {/* Data Saver Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Data Saver Mode ⚡</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Compress image thumbnails and minimize streaming bandwidth</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dataSaverMode}
                    onChange={toggleDataSaver}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Default Video Quality */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Default Video Resolution</div>
                    <div className="text-[11px] text-slate-400">Preferred streaming quality when playback begins</div>
                  </div>
                  <select
                    value={videoQuality}
                    onChange={(e: any) => setVideoQuality(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer hover:border-cyan-500"
                  >
                    <option value="Auto">Auto (Adaptive)</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                    <option value="360p Data Saver">360p Data Saver ⚡</option>
                  </select>
                </div>

                {/* OLED Black Theme */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">True OLED Ultra-Black Canvas</div>
                    <div className="text-[11px] text-slate-400">Pure pitch-black background styling for AMOLED/OLED displays</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={oledTheme}
                    onChange={(e) => setOledTheme(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* SECTION 4: PRIVACY, SAFETY & NOTIFICATIONS */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <Shield className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Privacy, Safety & Alerts</h3>
                </div>

                {/* Family Safe Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Family Safe Content Filter</div>
                    <div className="text-[11px] text-slate-400">Filters mature tags and ensures family-friendly feeds</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={familySafeMode}
                    onChange={(e) => setFamilySafeMode(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Pause Watch History */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Pause Watch History</div>
                    <div className="text-[11px] text-slate-400">Do not log videos you watch into your library history</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsPrivateHistory}
                    onChange={(e) => setSettingsPrivateHistory(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Creator Alerts & Push Notifications</div>
                    <div className="text-[11px] text-slate-400">Receive notifications when your subscribed channels drop new content</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsNotifications}
                    onChange={(e) => setSettingsNotifications(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>

                {/* Sound FX Feedback */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs font-bold text-white">Interactive UI Sound Feedback</div>
                    <div className="text-[11px] text-slate-400">Subtle acoustic feedback when liking, commenting, and subscribing</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSoundFX}
                    onChange={(e) => setEnableSoundFX(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Save Confirmation Button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setToastMsg("✅ All Mido Orb settings saved successfully!");
                    setTimeout(() => setToastMsg(null), 3000);
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  Save & Apply Settings
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS SECTION */}
      {/* ---------------------------------------------------- */}
      
      {/* 1. Upload Video Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create & Upload Video</h3>
                  <p className="text-[10px] text-slate-400">Share your video to Mido Orb with zero-lag streaming</p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopRecording();
                  setIsUploadModalOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Source Selection Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-white/10">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${uploadTab === 'file' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('record')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${uploadTab === 'record' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <VideoIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Record Video</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('samples')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${uploadTab === 'samples' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Sample Videos</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${uploadTab === 'url' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Video Link</span>
              </button>
            </div>

            {/* TAB 1: FILE PICKER */}
            {uploadTab === 'file' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-left">
                <label className="block text-slate-300 text-xs font-bold">Select Video File from your Device</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const totalMb = (file.size / (1024 * 1024)).toFixed(1);
                      setUploadFileSize(`${totalMb} MB`);
                      setSelectedVideoFile(file);

                      const tempObjUrl = URL.createObjectURL(file);
                      setUploadVideoUrl(tempObjUrl);
                      cacheInMemoryBlob(tempObjUrl, file);
                      setUploadProgress(100);
                      setUploadStatusText(`Video stream ready (${totalMb} MB). Zero lag streaming active!`);

                      if (!uploadTitle) {
                        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
                      }

                      const tempV = document.createElement('video');
                      tempV.preload = 'auto';
                      tempV.src = tempObjUrl;
                      tempV.muted = true;
                      tempV.playsInline = true;

                      tempV.onloadedmetadata = () => {
                        const dSec = Math.floor(tempV.duration || 0);
                        if (dSec > 0) {
                          const hrs = Math.floor(dSec / 3600);
                          const mins = Math.floor((dSec % 3600) / 60);
                          const secs = Math.floor(dSec % 60);
                          const formatted = hrs > 0
                            ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
                            : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                          setUploadDuration(formatted);

                          if (dSec <= 60) {
                            setUploadIsShort(true);
                            setUploadCategory('Shorts');
                          } else {
                            setUploadIsShort(false);
                          }
                        }
                        tempV.currentTime = Math.min(1, tempV.duration / 2 || 1);
                      };

                      tempV.onseeked = () => {
                        try {
                          const canvas = document.createElement('canvas');
                          canvas.width = 640;
                          canvas.height = 360;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(tempV, 0, 0, canvas.width, canvas.height);
                            const autoThumb = canvas.toDataURL('image/jpeg', 0.65);
                            if (!uploadThumbUrl) {
                              setUploadThumbUrl(autoThumb);
                            }
                          }
                        } catch (err) {
                          console.warn('Canvas thumbnail capture:', err);
                        }
                      };
                    }
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">Supports MP4, WebM, MOV, MKV, and AVI video files of any size.</p>
              </div>
            )}

            {/* TAB 2: LIVE VIDEO RECORDER */}
            {uploadTab === 'record' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-300">Live Camera & Screen Recorder</div>
                  {isRecording && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>REC {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                    </div>
                  )}
                </div>

                {/* Live stream preview element */}
                <div className="relative aspect-video rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                  <video
                    ref={liveVideoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`}
                  />
                  {!isRecording && (
                    <div className="text-center space-y-2 p-4">
                      <VideoIcon className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">Choose your recording source and click Start to begin recording.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {!isRecording ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => startRecording('camera')}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Record Webcam & Mic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startRecording('screen')}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Record Screen</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-full px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse"
                    >
                      <div className="w-3 h-3 rounded-sm bg-white" />
                      <span>Stop Recording & Use Video</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 1-CLICK SAMPLE VIDEOS */}
            {uploadTab === 'samples' && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-left">
                <div className="text-xs font-bold text-slate-300">Choose a High-Definition Video Preset:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {SAMPLE_VIDEOS.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSampleVideo(s)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer group hover:scale-[1.02] ${uploadVideoUrl === s.url ? 'bg-rose-600/20 border-rose-500 ring-1 ring-rose-500/50' : 'bg-slate-900 border-white/10 hover:border-rose-500/40'}`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden relative bg-black mb-1.5">
                        <img src={s.thumb} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                          {s.duration}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-rose-400">
                        {s.title}
                      </div>
                      <div className="text-[9px] text-slate-400">{s.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DIRECT URL */}
            {uploadTab === 'url' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-left">
                <label className="block text-slate-300 text-xs font-bold">Paste Video URL or YouTube Link</label>
                <input
                  type="text"
                  placeholder="https://.../video.mp4 or https://youtube.com/watch?v=..."
                  value={uploadVideoUrl}
                  onChange={(e) => {
                    setUploadVideoUrl(e.target.value);
                    if (!uploadTitle && e.target.value) {
                      setUploadTitle('Shared Web Video');
                    }
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs"
                />
                <p className="text-[10px] text-slate-400">Supports direct MP4/WebM URLs and standard YouTube watch/embed/shorts links.</p>
              </div>
            )}

            {/* LIVE IN-MODAL VIDEO PREVIEW (PROVE IT PLAYS BEFORE PUBLISHING) */}
            {uploadVideoUrl && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-emerald-400">Live Video Preview (Active & Ready)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadVideoUrl('');
                      setSelectedVideoFile(null);
                      setUploadFileSize('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-400"
                  >
                    Clear Video
                  </button>
                </div>
                <div className="w-full aspect-video rounded-xl bg-black overflow-hidden border border-white/10 shadow-lg relative">
                  <VideoPlayer
                    key={uploadVideoUrl}
                    src={uploadVideoUrl}
                    controls
                    autoPlay={false}
                    muted={false}
                    className="w-full h-full object-contain"
                    poster={uploadThumbUrl}
                  />
                </div>
              </div>
            )}

            {/* MAIN VIDEO METADATA FORM */}
            <form onSubmit={handleUploadVideoSubmit} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ultimate AI Agent Showcase 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell viewers what happens in your video..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Custom Thumbnail (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setUploadThumbUrl(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Visibility</label>
                  <select
                    value={uploadVisibility}
                    onChange={(e: any) => setUploadVisibility(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Public">Public (Anyone can watch)</option>
                    <option value="Unlisted">Unlisted (Only with link)</option>
                    <option value="Private">Private (Only you)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="AI, Tech, Gaming"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isShort"
                  checked={uploadIsShort}
                  onChange={(e) => setUploadIsShort(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
                <label htmlFor="isShort" className="text-slate-300 font-bold cursor-pointer">
                  Feature in Mido Orb Shorts feed (Vertical Video)
                </label>
              </div>

              {/* Upload Progress Bar Indicator */}
              {(isPublishing || uploadProgress > 0) && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 space-y-2 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 animate-bounce text-rose-500" />
                      <span>{uploadStatusText || 'Uploading video...'}</span>
                    </span>
                    <span className="text-white font-mono">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/5">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-400 transition-all duration-300 shadow-md shadow-rose-500/50"
                    />
                  </div>
                  {uploadFileSize && (
                    <div className="text-[10px] text-slate-400 text-right font-mono">
                      Video Size: {uploadFileSize}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <div className="text-[10px] text-slate-500">
                  By publishing, you agree to Mido Orb Community Guidelines.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={() => {
                      stopRecording();
                      setIsUploadModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing || !uploadTitle.trim() || !uploadVideoUrl.trim()}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold shadow-lg flex items-center gap-2 transition-all"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Publish Video</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Channel Settings Modal */}
      {isEditChannelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-rose-400" />
                <span>Customize Channel Settings</span>
              </h3>
              <button onClick={() => setIsEditChannelModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveChannelSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Channel Name *</label>
                <input
                  type="text"
                  required
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Channel Handle (@username) *</label>
                <input
                  type="text"
                  required
                  value={channelHandle}
                  onChange={(e) => setChannelHandle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Upload Channel Profile Picture (Avatar)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setChannelAvatar(evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-1">Or paste image URL:</div>
                <input
                  type="text"
                  value={channelAvatar}
                  onChange={(e) => setChannelAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Upload Channel Banner Header</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setChannelBanner(evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 mt-1">Or paste banner URL:</div>
                <input
                  type="text"
                  value={channelBanner}
                  onChange={(e) => setChannelBanner(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white mt-1"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Channel Description</label>
                <textarea
                  rows={3}
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditChannelModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Playlist Modal */}
      {isCreatePlaylistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist Title"
              value={playlistTitle}
              onChange={(e) => setPlaylistTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={playlistDesc}
              onChange={(e) => setPlaylistDesc(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreatePlaylistModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
              <button onClick={handleCreatePlaylist} className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Share Video Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4 text-center">
            <Share2 className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Share Video</h3>
            <p className="text-xs text-slate-400">Copy link to share on Facebook, X, or Discord</p>
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950 border border-white/10">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="w-full bg-transparent text-[11px] text-white px-2 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <button onClick={() => setIsShareModalOpen(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
          </div>
        </div>
      )}

      {/* 3.5. Real Media Download Modal */}
      <OrbDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false);
          setDownloadVideoTarget(null);
        }}
        video={downloadVideoTarget || selectedVideo}
      />

      {/* 4. Delete Confirmation Modal (Iframe Safe & Custom Styled) */}
      {deletingVideoId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Video Permanently?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This video will be permanently removed from Mido Orb Cloud for all users. This action cannot be undone.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setDeletingVideoId(null)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteVideo(deletingVideoId)}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Custom Notification Toast */}
      {toastMsg && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 border border-rose-500/30 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 6. Mobile Phone Glassmorphic Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl select-none">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('trending')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${activeTab === 'trending' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[9px]">Explore</span>
        </button>

        {/* Center Upload (+) Action Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-rose-600/40 -mt-3 hover:scale-110 active:scale-95 transition-all"
          title="Upload Video"
        >
          <Upload className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('shorts')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${activeTab === 'shorts' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[9px]">Shorts</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${activeTab === 'studio' ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <VideoIcon className="w-5 h-5" />
          <span className="text-[9px]">Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${activeTab === 'playlists' ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          <ListVideo className="w-5 h-5" />
          <span className="text-[9px]">Library</span>
        </button>
      </nav>

    </div>
  );
};
