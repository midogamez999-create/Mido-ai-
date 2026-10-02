export type Mode = 'mido-shortcuts' | 'shortcut-dashboard' | 'chat' | 'humoris' | 'organisation' | 'hello-mido-calls' | 'voice-responding' | 'face-detect' | 'mido-video-ai' | 'editor-studio' | 'mido-guide' | 'youtube-studio' | 'app-studio' | 'photo-studio' | 'video-studio' | 'music-studio' | 'talking-avatar' | 'promo-studio' | 'discord-studio' | 'champions-studio' | 'facebook-studio' | 'mido-orb' | 'mido-nemis' | 'mido-ear' | 'under-the-sphere';

export interface DetectedFace {
  id: string;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relativeBox: {
    x: number; // 0 to 1
    y: number; // 0 to 1
    width: number; // 0 to 1
    height: number; // 0 to 1
  };
  confidence: number;
  landmarks?: {
    leftEye?: { x: number; y: number };
    rightEye?: { x: number; y: number };
    nose?: { x: number; y: number };
    mouth?: { x: number; y: number };
  };
  aspectRatio: number;
  croppedDataUrl?: string;
  attributes?: {
    brightness: number; // 0-100
    sharpness: number; // 0-100
    estimatedPose?: 'frontal' | 'profile-left' | 'profile-right' | 'angled';
    skinToneClassification?: string;
  };
}


export interface GroundingSource {
  title: string;
  uri: string;
}

export interface YouTubeChannelStats {
  id: string;
  title: string;
  handle: string;
  description: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  avatarUrl: string;
  bannerUrl?: string;
  publishedAt?: string;
  recentVideos?: {
    id: string;
    title: string;
    publishedAt: string;
    thumbnail: string;
    viewCount?: string;
    likeCount?: string;
  }[];
}

export interface UserSecrets {
  youtubeApiKey?: string;
  youtubeChannelId?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  json2videoApiKey?: string;
  videoApiKey?: string;
  discordWebhookUrl?: string;
  discordBotToken?: string;
  discordClientId?: string;
  facebookPageId?: string;
  facebookAccessToken?: string;
  facebookAppId?: string;
  unlockedCheatCodes?: string[];
  customSecrets?: { [key: string]: string };
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  category: 'apk' | 'zip' | 'code' | 'document' | 'image' | 'video' | 'audio' | 'data' | 'binary';
  extension: string;
  parsedPreview?: string;
}

export interface ThinkingTask {
  id: string;
  title: string;
  status: 'completed' | 'running' | 'pending';
  detail?: string;
  durationMs?: number;
}

export interface ThinkingProcessData {
  phase: 'searching' | 'analyzing' | 'synthesizing' | 'executing';
  queryTopic: string;
  headline: string;
  tasks: ThinkingTask[];
  complaint?: string;
  durationSeconds?: number;
  dataSources?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[]; // base64 images / media
  fileAttachments?: FileAttachment[]; // rich multi-format files (APK, ZIP, code, docs, binaries)
  groundingSources?: GroundingSource[];
  generatedCode?: {
    html: string;
    css?: string;
    js?: string;
    title: string;
  };
  mediaOutput?: {
    type: 'image' | 'video' | 'music';
    url: string;
    prompt?: string;
    title?: string;
  };
  actionPrompt?: {
    type: 'open_secrets' | 'open_auth' | 'configure_youtube' | 'youtube_key_input' | 'open_youtube_studio' | 'open_discord_help' | 'open_discord_studio' | 'open_video_studio' | 'open_avatar_studio';
    title: string;
    description?: string;
  };
  pluginResult?: any;
  thinkingProcess?: ThinkingProcessData;
  callSession?: {
    callerName: string;
    status: 'ringing' | 'connected' | 'ended';
    spokenAnswer?: string;
  };
  isError?: boolean;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  mode?: Mode;
}

export interface AppProject {
  id: string;
  title: string;
  description: string;
  html: string;
  css: string;
  js: string;
  updatedAt: string;
}

export interface GeneratedImage {
  id: string;
  url: string; // base64 data url
  prompt: string;
  aspectRatio: string;
  style?: string;
  createdAt: string;
}

export interface VideoStoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  visualPrompt: string;
  cameraMovement: 'Dolly In' | 'Pan Left' | 'Pan Right' | 'Tilt Up' | 'Drone Aerial' | 'Orbit 360' | 'FPV Action' | 'Slow Motion Climax';
  durationSeconds: number;
  keyframeUrl: string;
  dialogue?: string;
  soundEffect?: string;
}

export interface VideoVariation {
  id: string;
  title: string;
  url: string;
  streamUrl?: string;
  thumbnailUrl: string;
  style: string;
  cameraMotion?: string;
  duration?: number;
}

export interface GeneratedVideo {
  id: string;
  url?: string;
  streamUrl?: string;
  prompt: string;
  enhancedPrompt?: string;
  operationName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  aspectRatio?: string;
  durationSeconds?: number;
  resolution?: '4K UHD' | '1080p FHD' | '720p HD';
  fps?: 60 | 30 | 24;
  motionStyle?: 'Cinematic' | 'Anime 3D' | 'Hyper-Realism' | 'Cyberpunk Neon' | 'Nature Doc' | 'Sports Hype';
  storyboard?: VideoStoryboardScene[];
  variations?: VideoVariation[];
  audioMood?: string;
  narratorScript?: string;
  coopDirector?: string;
  coopRemixCount?: number;
  tags?: string[];
  isPromo?: boolean;
  promoDetails?: {
    brandName?: string;
    promoHeadline?: string;
    discountBadge?: string;
    ctaText?: string;
    promoStyle?: string;
    targetAudience?: string;
  };
}

export interface AppSettings {
  // Sound & Audio
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundTheme: 'cyber' | 'soft' | 'arcade' | 'minimal';
  autoReadAloud: boolean;
  speechRate: number; // 0.75 to 2.0
  speechPitch: number; // 0.5 to 1.5
  speechVoice?: string;
  
  // UI & Chat Layout
  chatFontSize: 'sm' | 'md' | 'lg' | 'xl';
  chatBubbleDensity: 'compact' | 'comfortable' | 'spacious';
  chatTextColor?: 'pure-white' | 'cyan-glow' | 'emerald-matrix' | 'amber-gold' | 'violet-neon' | 'rose-sunset' | 'slate-soft';
  chatBubbleStyle?: 'glass-cyber' | 'minimal-solid' | 'neon-border' | 'gradient-glow';
  showTimestamps: boolean;
  showAvatars: boolean;
  chatBackground: 'deep-slate' | 'cyber-glow' | 'starfield' | 'midnight-blue' | 'matrix-terminal' | 'pure-dark';
  glowEffectsEnabled?: boolean;
  neonLasersEnabled?: boolean;
  particleStarsEnabled?: boolean;
  animationSpeed?: 'ultra-fast' | 'smooth-fluid' | 'reduced';
  
  // AI Memory & Personalization
  userNickname?: string;
  userBioMemory?: string;
  enableLiveGoogleSearch?: boolean;
  
  // Video Studio & Director Suite Settings
  defaultVideoResolution?: '4K UHD' | '1080p FHD' | '720p HD';
  videoResolution?: '4K UHD' | '1080p FHD' | '720p HD' | string;
  defaultVideoFps?: 60 | 30 | 24;
  videoFps?: 60 | 30 | 24 | number;
  defaultVideoMotion?: 'Cinematic' | 'Anime 3D' | 'Hyper-Realism' | 'Cyberpunk Neon' | 'Nature Doc' | 'Sports Hype';
  defaultMotionStyle?: 'Cinematic' | 'Anime 3D' | 'Hyper-Realism' | 'Cyberpunk Neon' | 'Nature Doc' | 'Sports Hype';
  videoMotionStyle?: string;
  videoDirectorLighting?: 'Volumetric Neon' | 'Studio Softbox' | 'Golden Hour' | 'Cyber Horizon' | 'Noir Dark Cinema';
  videoParticlePhysics?: 'ultra' | 'high' | 'medium' | 'low';
  videoAutoDownload?: boolean;
  videoCustomWatermark?: string;
  videoHardwareAcceleration?: boolean;
  autoEnhanceVideoPrompts?: boolean;
  videoAutoEnhance?: boolean;
  coopModeEnabled?: boolean;
  coopVideoMode?: boolean;
  videoCoopMode?: boolean;
  avatarVoiceStyle?: 'warm-friendly' | 'robot-cyber' | 'deep-epic' | 'energetic-anime' | 'news-anchor';
  avatarGender?: 'male' | 'female' | 'robot';

  // Photo Studio & Visual Settings
  photoDefaultStyle?: string;
  photoDefaultLighting?: string;
  photoDefaultCamera?: string;
  photoAutoSave?: boolean;
  photoNegativeFilter?: boolean;

  // Mido Orb Video Player & Stream Engine
  orbAutoplayPolicy?: 'autoplay-muted' | 'autoplay-sound' | 'click-to-play';
  orbDefaultQuality?: '4k' | '1080p' | '720p' | 'auto';
  orbLoopMode?: 'loop' | 'play-once' | 'next-video';
  orbHardwareDecoders?: boolean;
  orbDataSaver?: boolean;

  // Speed & AI Performance
  turboMode: boolean;
  autoWebSearch: boolean;
  contextMemoryLength: number;
  geminiModelTier?: 'gemini-3.6-flash' | 'gemini-3.5-flash-lite' | 'gemini-3.7-flash' | 'gemini-flash-latest' | 'gemini-3.1-flash-lite' | string;
  midoModelTier?: 'mido-3.7-flash' | 'mido-3.6-flash' | 'mido-3.5-flash-lite' | 'mido-flash-latest' | 'mido-3.1-flash-lite' | 'mido-3.1-pro-preview' | string;
  responseVerbosity?: 'ultra-quick' | 'balanced' | 'deep-dive';
  enableQuickChips?: boolean;
  autoExecuteCode?: boolean;
  aiTone: 'friendly' | 'professional' | 'creative' | 'concise' | 'football' | 'deep-thinker' | 'coder-architect' | 'creative-viral' | 'football-tactician' | 'idea-machine' | 'cyber-osint';
  aiCreativity?: number; // 0.1 to 1.0
  creativityTemperature?: number; // 0.1 to 1.0
  codeTheme?: 'dracula' | 'monokai' | 'github-dark' | 'synthwave' | 'solarized';
  codeSyntaxTheme?: 'dracula' | 'monokai' | 'github-dark' | 'synthwave' | 'solarized';
  autoSaveDrafts: boolean;
  enableMarkdownHighlight: boolean;
  enableSoundEffects: boolean;
  autoCopyCode?: boolean;
  customSystemInstructions?: string;
  backgroundAmbiance?: 'off' | 'cyber-synth' | 'lofi-beats' | 'rain-thunder' | 'stadium-crowd';

  // Play Store Plugins & App Automation
  pluginsEnabled?: boolean;
  pluginsAutoDispatch?: boolean;
  pluginsShowThinkingLogs?: boolean;
  pluginsHumorComplaining?: boolean;

  // Humoris AI Friend Companion Settings
  humorisFriendName?: string;
  humorisPersona?: 'alex' | 'maya' | 'sam' | 'leo';
  humorisProactiveIntervalSeconds?: number;
  humorisAutoVoice?: boolean;
  humorisChatFrequency?: 'rapid' | 'fast' | 'normal' | 'chill' | 'gentle' | 'hourly' | 'custom' | 'off';
  humorisCustomFrequencySeconds?: number;
  humorisCheckInStyle?: 'all' | 'checkin' | 'debate' | 'food' | 'spontaneous' | 'nudge';
  humorisSoundAlert?: boolean;
  humorisOnlyWhenIdle?: boolean;
}

export interface PinnedMessage {
  id: string;
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pinnedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  banner?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  followers?: string[];
  following?: string[];
  isVerified?: boolean;
  isLoggedIn: boolean;
  provider: 'google' | 'email' | 'phone' | 'guest';
}

export interface NemisGame {
  id: string;
  title: string;
  description: string;
  genre: string;
  code: string;
  thumbnailUrl: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorVerified?: boolean;
  plays: number;
  likes: number;
  highScore: number;
  createdAt: string;
  comments?: { id: string; userId: string; userName: string; userAvatar: string; text: string; createdAt: string }[];
}

export interface EarTrack {
  id: string;
  title: string;
  artist: string;
  creatorId: string;
  creatorAvatar: string;
  creatorVerified?: boolean;
  genre: string;
  audioUrl: string;
  coverUrl: string;
  duration: string;
  isPrivate: boolean;
  plays: number;
  likes: number;
  lyrics?: string;
  synthConfig?: any;
  createdAt: string;
}

export interface PermanentMemoryItem {
  id: string;
  fact: string;
  category: 'identity' | 'preference' | 'projects' | 'facts' | 'secret' | 'custom';
  timestamp: string;
  source: 'auto' | 'manual';
  confidence?: number;
}

export type ThemeMode = 'dark' | 'light' | 'cyberpunk';

export interface AudioStem {
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  color?: string;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  audioUrl?: string;
  coverUrl?: string;
  genre: string;
  duration: number | string; // in seconds or formatted
  bpm?: number;
  key?: string;
  mood?: string;
  promoScript?: string;
  notes?: string[];
  bass?: string[];
  chords?: string[];
  drumPattern?: string;
  sections?: { name: string; bars: number; instruments: string[] }[];
  stems?: AudioStem[];
  createdAt: string;
}

export interface HorrorInventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'Key Item' | 'Medical' | 'Tool' | 'Document' | 'Ammo' | 'Chemical';
  icon: string;
  quantity?: number;
  combinableWith?: string[];
  examineDetail?: {
    lore: string;
    clueSecret?: string;
    modelType?: 'keycard' | 'scalpel' | 'syringe' | 'tape' | 'vial' | 'flashlight' | 'bone_saw' | 'note';
    audioLog?: string;
  };
  slotIndex?: number;
}


export interface SerFeedback {
  id: string;
  messageId: string;
  type: 'like' | 'dislike';
  prompt: string;
  assistantResponse: string;
  timestamp: string;
}

export interface MemoryEntry {
  id: string;
  key: string;
  content: string;
  createdAt: string;
}

export interface OrbCommentReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  createdAt: string;
}

export interface OrbComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  createdAt: string;
  replies?: OrbCommentReply[];
}

export interface OrbVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  category: string;
  tags: string[];
  visibility: 'Public' | 'Unlisted' | 'Private';
  audience: 'Kids' | 'General';
  isShort?: boolean;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  createdAt: string;
  updatedAt?: string;
  commentsCount?: number;
}

export interface OrbChannel {
  id: string;
  userId?: string;
  name: string;
  handle: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  videoCount: number;
  isSubscribed?: boolean;
  joinedDate: string;
}

export interface OrbPlaylist {
  id: string;
  title: string;
  description: string;
  userId: string;
  visibility: 'Public' | 'Private';
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrbNotification {
  id: string;
  title: string;
  message: string;
  type: 'sub' | 'like' | 'comment' | 'video';
  thumbnailUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface OrbAnalytics {
  totalViews: number;
  watchTimeHours: number;
  subscribers: number;
  likes: number;
  comments: number;
  estimatedRevenue: number;
  viewsData: { date: string; views: number; watchTime: number }[];
  topVideos: { id: string; title: string; views: number; likes: number; thumbnail: string }[];
}


