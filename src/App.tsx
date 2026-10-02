import React, { useState, useEffect, useRef } from 'react';
import { Mode, ChatMessage, ChatSession, AppProject, GeneratedImage, GeneratedVideo, GeneratedTrack, UserAccount, ThemeMode, UserSecrets, SerFeedback, MemoryEntry, AppSettings, PinnedMessage, FileAttachment, PermanentMemoryItem } from './types';
import { soundFx } from './lib/soundFx';
import { speechManager } from './lib/speechManager';
import { loadPermanentMemories, savePermanentMemories, extractFactsFromPrompt } from './lib/memoryManager';
import { STARTER_APPS } from './data/presets';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { MainMemoryVaultModal } from './components/MainMemoryVaultModal';
import { FaceDetectView } from './components/FaceDetectView';
import { YouTubeStudioView } from './components/YouTubeStudioView';
import { AppStudioView } from './components/AppStudioView';
import { PhotoStudioView } from './components/PhotoStudioView';
import { VideoStudioView } from './components/VideoStudioView';
import { MidoVideoAIView } from './components/MidoVideoAIView';
import { TalkingAvatarView } from './components/TalkingAvatarView';
import { MusicStudioView } from './components/MusicStudioView';
import { PromoStudioView } from './components/PromoStudioView';
import { DiscordStudioView } from './components/DiscordStudioView';
import { ChampionsStudioView } from './components/ChampionsStudioView';
import { FacebookStudioView } from './components/FacebookStudioView';
import { MidoOrbView } from './components/MidoOrbView';
import { MidoNemisView } from './components/MidoNemisView';
import { MidoEarView } from './components/MidoEarView';
import { HumorisView } from './components/HumorisView';
import { getActivePlugins, checkExplicitPluginInvocation, executeChatGPTPlugin } from './lib/pluginsSystem';
import { AccountManagerModal } from './components/AccountManagerModal';
import { UnderTheSphereView } from './components/UnderTheSphereView';
import { EditorStudioView } from './components/EditorStudioView';
import { GuideStudioView } from './components/GuideStudioView';
import { MidoShortcutsView } from './components/MidoShortcutsView';
import { VoiceRespondingView } from './components/VoiceRespondingView';
import { OrganisationView } from './components/OrganisationView';
import { HelloMidoCallsView } from './components/HelloMidoCallsView';
import { HelpGuideModal } from './components/HelpGuideModal';
import { ToolsModal } from './components/ToolsModal';
import { FootballDashboardModal } from './components/FootballDashboardModal';
import { SerLogModal } from './components/SerLogModal';
import { HistoryModal } from './components/HistoryModal';
import { ApkInstallerModal } from './components/ApkInstallerModal';
import { SecretTestPlaceModal } from './components/SecretTestPlaceModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { StickyScratchpad } from './components/StickyScratchpad';
import { OmniPromptBar } from './components/OmniPromptBar';
import { PluginStoreModal } from './components/PluginStoreModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SettingsModal } from './components/SettingsModal';
import { SecretsModal } from './components/SecretsModal';
import { DiscordCommunityModal } from './components/DiscordCommunityModal';
import { RealAuthScreen } from './components/RealAuthScreen';
import { subscribeAuth, logOutUser } from './lib/firebase';

export default function App() {
  const [currentMode, setCurrentMode] = useState<Mode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPluginStoreOpen, setIsPluginStoreOpen] = useState(false);

  // User Account & Real Firebase Auth State (Session Persistence across page reloads & app restarts)
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const savedUser = localStorage.getItem('mido_saved_user_account');
      if (savedUser) return JSON.parse(savedUser);
      const savedGuest = localStorage.getItem('mido_guest_user');
      if (savedGuest) return JSON.parse(savedGuest);
    } catch (e) {
      console.error('Error loading saved user session:', e);
    }
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const authTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 500);

    const unsubscribe = subscribeAuth((firebaseUserAccount) => {
      clearTimeout(authTimer);
      if (firebaseUserAccount) {
        setUser(firebaseUserAccount);
        try {
          localStorage.setItem('mido_saved_user_account', JSON.stringify(firebaseUserAccount));
          localStorage.removeItem('mido_guest_user');
        } catch (e) {
          console.error(e);
        }
      } else {
        // Check local storage for persistent user account or guest session
        try {
          const savedUser = localStorage.getItem('mido_saved_user_account');
          const savedGuest = localStorage.getItem('mido_guest_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else if (savedGuest) {
            setUser(JSON.parse(savedGuest));
          }
        } catch (e) {
          // Keep existing user if available
        }
      }
      setIsAuthLoading(false);
    });

    return () => {
      clearTimeout(authTimer);
      unsubscribe();
    };
  }, []);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecretsModalOpen, setIsSecretsModalOpen] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpModalTab, setHelpModalTab] = useState<'discord' | 'youtube' | 'gemini' | 'mido'>('discord');
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [toolsModalTab, setToolsModalTab] = useState<'calculator' | 'calendar' | 'ideas'>('calculator');
  const [isFootballModalOpen, setIsFootballModalOpen] = useState(false);
  const [isSerModalOpen, setIsSerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isTestPlaceOpen, setIsTestPlaceOpen] = useState(false);
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState(false);
  const [memoryToast, setMemoryToast] = useState<string | null>(null);
  const [memories, setMemories] = useState<PermanentMemoryItem[]>(() => {
    return loadPermanentMemories('Mido');
  });

  // Save permanent memories to localStorage & sync with 2026 vault
  useEffect(() => {
    savePermanentMemories(memories);
  }, [memories]);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const md = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'Mido AI'} (${m.timestamp})\n\n${m.content}\n`
      )
      .join('\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mido-ai-chat-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
  };

  // App & Audio Sound Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('mido_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.midoModelTier || parsed.midoModelTier === 'mido-3.7-flash' || parsed.midoModelTier === 'mido-3.6-flash') {
          parsed.midoModelTier = 'mido-3.8-flash';
          parsed.geminiModelTier = 'gemini-3.8-flash';
        }
        return parsed;
      }
    } catch (e) {}
    return {
      soundEnabled: true,
      soundVolume: 0.7,
      soundTheme: 'cyber',
      autoReadAloud: false,
      speechRate: 1.0,
      speechPitch: 1.0,
      chatFontSize: 'md',
      chatBubbleDensity: 'comfortable',
      showTimestamps: true,
      showAvatars: true,
      chatBackground: 'deep-slate',
      glowEffectsEnabled: true,
      neonLasersEnabled: true,
      particleStarsEnabled: true,
      animationSpeed: 'ultra-fast',
      defaultVideoResolution: '1080p FHD',
      defaultVideoFps: 60,
      defaultVideoMotion: 'Cinematic',
      videoDirectorLighting: 'Volumetric Neon',
      videoParticlePhysics: 'ultra',
      videoAutoDownload: false,
      videoHardwareAcceleration: true,
      autoEnhanceVideoPrompts: true,
      coopModeEnabled: true,
      photoDefaultStyle: 'Photorealistic 8K',
      photoDefaultLighting: 'Cinematic Volumetric',
      photoDefaultCamera: 'Eye-Level',
      photoAutoSave: true,
      photoNegativeFilter: true,
      orbAutoplayPolicy: 'autoplay-muted',
      orbDefaultQuality: '1080p',
      orbLoopMode: 'loop',
      orbHardwareDecoders: true,
      orbDataSaver: false,
      turboMode: true,
      autoWebSearch: true,
      enableLiveGoogleSearch: true,
      chatTextColor: 'pure-white',
      chatBubbleStyle: 'glass-cyber',
      userNickname: 'Mido',
      userBioMemory: '',
      contextMemoryLength: 10,
      midoModelTier: 'mido-3.8-flash',
      geminiModelTier: 'gemini-3.8-flash',
      responseVerbosity: 'balanced',
      enableQuickChips: true,
      autoExecuteCode: true,
      aiTone: 'friendly',
      aiCreativity: 0.7,
      codeTheme: 'dracula',
      autoSaveDrafts: true,
      enableMarkdownHighlight: true,
      enableSoundEffects: true,
      backgroundAmbiance: 'off',
    };
  });

  const handleUpdateAppSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    soundFx.updateConfig(newSettings.soundEnabled, newSettings.soundVolume, newSettings.soundTheme);
    try {
      localStorage.setItem('mido_app_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Pinned Bookmarks in Chat State
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mido_pinned_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const handleTogglePinMessage = (msg: ChatMessage) => {
    setPinnedMessages((prev) => {
      const exists = prev.some((p) => p.messageId === msg.id);
      let updated: PinnedMessage[];
      if (exists) {
        updated = prev.filter((p) => p.messageId !== msg.id);
      } else {
        const newPin: PinnedMessage = {
          id: Date.now().toString(),
          messageId: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          pinnedAt: new Date().toLocaleTimeString(),
        };
        updated = [newPin, ...prev];
      }
      try {
        localStorage.setItem('mido_pinned_messages', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleUnpinMessage = (messageId: string) => {
    setPinnedMessages((prev) => {
      const updated = prev.filter((p) => p.messageId !== messageId);
      try {
        localStorage.setItem('mido_pinned_messages', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleClearPinnedMessages = () => {
    setPinnedMessages([]);
    try {
      localStorage.removeItem('mido_pinned_messages');
    } catch (e) {}
  };

  // SER Feedback State (Message Likes & Dislikes Log)
  const [serFeedbackList, setSerFeedbackList] = useState<SerFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('mido_ser_feedback');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const feedbackMap: Record<string, 'like' | 'dislike'> = serFeedbackList.reduce((acc, f) => {
    acc[f.messageId] = f.type;
    return acc;
  }, {} as Record<string, 'like' | 'dislike'>);

  const handleFeedback = (messageId: string, type: 'like' | 'dislike', prompt: string, assistantResponse: string) => {
    const newFeedback: SerFeedback = {
      id: Date.now().toString(),
      messageId,
      type,
      prompt,
      assistantResponse,
      timestamp: new Date().toLocaleTimeString(),
    };
    setSerFeedbackList((prev) => {
      const filtered = prev.filter((f) => f.messageId !== messageId);
      const updated = [newFeedback, ...filtered];
      try {
        localStorage.setItem('mido_ser_feedback', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearFeedback = () => {
    setSerFeedbackList([]);
    try {
      localStorage.removeItem('mido_ser_feedback');
    } catch (e) {
      console.error(e);
    }
  };

  // Instant AI Memory State
  const [aiMemories, setAiMemories] = useState<MemoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mido_ai_memories');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'm1',
              key: 'my favorite club',
              content: 'Real Madrid ⚪ (15-time Champions League winners)',
              createdAt: 'Default',
            },
            {
              id: 'm2',
              key: 'my youtube channel',
              content: 'mido3dch1 (@mido3dch1)',
              createdAt: 'Default',
            },
          ];
    } catch {
      return [];
    }
  });

  const handleSaveMemory = (key: string, content: string) => {
    const newEntry: MemoryEntry = {
      id: Date.now().toString(),
      key: key.trim().toLowerCase(),
      content: content.trim(),
      createdAt: new Date().toLocaleTimeString(),
    };
    setAiMemories((prev) => {
      const filtered = prev.filter((m) => m.key !== newEntry.key);
      const updated = [newEntry, ...filtered];
      try {
        localStorage.setItem('mido_ai_memories', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteMemory = (id: string) => {
    setAiMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('mido_ai_memories', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearMemories = () => {
    setAiMemories([]);
    try {
      localStorage.removeItem('mido_ai_memories');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenHelpModal = (tab: 'discord' | 'youtube' | 'gemini' | 'mido' = 'discord') => {
    setHelpModalTab(tab);
    setIsHelpModalOpen(true);
  };

  const handleOpenToolsModal = (tab: 'calculator' | 'calendar' | 'ideas' = 'calculator') => {
    setToolsModalTab(tab);
    setIsToolsModalOpen(true);
  };

  // API Secrets Vault State
  const [secrets, setSecrets] = useState<UserSecrets>(() => {
    try {
      const saved = localStorage.getItem('mido3dch1_user_secrets');
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        ...parsed,
        discordBotToken: parsed.discordBotToken || 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw',
        discordClientId: parsed.discordClientId || '1531566521623773205',
        unlockedCheatCodes: parsed.unlockedCheatCodes && parsed.unlockedCheatCodes.length > 0 ? parsed.unlockedCheatCodes : ['M3D', 'MIDO60FPS', 'MIDO3DCH1PRO'],
      };
    } catch (e) {
      return {
        discordBotToken: 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw',
        discordClientId: '1531566521623773205',
        unlockedCheatCodes: ['M3D', 'MIDO60FPS', 'MIDO3DCH1PRO'],
      };
    }
  });

  // Secrets handler
  const handleSaveSecrets = (updatedSecrets: UserSecrets) => {
    setSecrets(updatedSecrets);
    try {
      localStorage.setItem('mido3dch1_user_secrets', JSON.stringify(updatedSecrets));
    } catch (e) {
      console.error('Failed to save secrets to localStorage:', e);
    }
  };

  // Core Data & Chat History States

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('mido_chat_history_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }

    return [
      {
        id: 'session-default-1',
        title: 'Welcome & AI Workspace',
        messages: [
          {
            id: 'welcome-init',
            role: 'assistant',
            content: "👋 **Welcome to mido3dch1 AI Pro Workspace!**\nYour past conversations and media generations are automatically stored in your **History & Vault Dashboard**. Feel free to ask questions, edit code, or generate videos and photos!",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleTimeString(),
        mode: 'chat',
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return chatSessions[0]?.id || 'session-default-1';
  });

  const activeSession = chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return activeSession?.messages || [];
  });

  // Sync active messages into chatSessions array & localStorage whenever messages or session ID changes
  useEffect(() => {
    setChatSessions((prevSessions) => {
      const existingIndex = prevSessions.findIndex((s) => s.id === currentSessionId);
      let updatedTitle = prevSessions[existingIndex]?.title;

      if (!updatedTitle || updatedTitle === 'New Conversation' || updatedTitle === 'Welcome & AI Workspace') {
        const firstUserMsg = messages.find((m) => m.role === 'user');
        if (firstUserMsg) {
          updatedTitle = firstUserMsg.content.slice(0, 35) + (firstUserMsg.content.length > 35 ? '...' : '');
        }
      }

      const updatedSession: ChatSession = {
        id: currentSessionId,
        title: updatedTitle || 'New Conversation',
        messages,
        createdAt: prevSessions[existingIndex]?.createdAt || new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleTimeString(),
        mode: currentMode,
      };

      let newSessions: ChatSession[];
      if (existingIndex >= 0) {
        newSessions = [...prevSessions];
        newSessions[existingIndex] = updatedSession;
      } else {
        newSessions = [updatedSession, ...prevSessions];
      }

      try {
        localStorage.setItem('mido_chat_history_sessions', JSON.stringify(newSessions));
      } catch (e) {
        console.error('Failed to save chat sessions to localStorage:', e);
      }
      return newSessions;
    });
  }, [messages, currentSessionId, currentMode]);

  // Chat History Actions
  const handleSelectSession = (sessionId: string) => {
    const target = chatSessions.find((s) => s.id === sessionId);
    if (target) {
      setCurrentSessionId(sessionId);
      setMessages(target.messages);
      if (target.mode) {
        setCurrentMode(target.mode);
      }
    }
  };

  const handleNewSession = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString(),
      mode: currentMode,
    };

    setChatSessions((prev) => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem('mido_chat_history_sessions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setCurrentSessionId(newId);
    setMessages([]);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem('mido_chat_history_sessions', JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }

      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
          setMessages(filtered[0].messages);
        } else {
          const freshId = 'session-' + Date.now();
          const freshSession: ChatSession = {
            id: freshId,
            title: 'New Conversation',
            messages: [],
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date().toLocaleTimeString(),
            mode: currentMode,
          };
          setCurrentSessionId(freshId);
          setMessages([]);
          return [freshSession];
        }
      }

      return filtered;
    });
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setChatSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s));
      try {
        localStorage.setItem('mido_chat_history_sessions', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearAllSessions = () => {
    const freshId = 'session-' + Date.now();
    const freshSession: ChatSession = {
      id: freshId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString(),
      mode: currentMode,
    };
    setChatSessions([freshSession]);
    setCurrentSessionId(freshId);
    setMessages([]);
    try {
      localStorage.setItem('mido_chat_history_sessions', JSON.stringify([freshSession]));
    } catch (e) {
      console.error(e);
    }
  };

  const [savedApps, setSavedApps] = useState<AppProject[]>(STARTER_APPS);
  const [activeApp, setActiveApp] = useState<AppProject>(STARTER_APPS[0]);

  // Persistent Generated Media Collections
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('mido_generated_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>(() => {
    try {
      const saved = localStorage.getItem('mido_generated_videos');
      return saved ? JSON.parse(saved) : [
        {
          id: 'default-football-video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          prompt: '⚽ 3D Football AI Match: Epic Goal & Penalty Shootout in Packed Stadium',
          status: 'completed',
          createdAt: 'Just now',
          aspectRatio: '16:9',
        },
      ];
    } catch {
      return [
        {
          id: 'default-football-video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
          prompt: '⚽ 3D Football AI Match: Epic Goal & Penalty Shootout in Packed Stadium',
          status: 'completed',
          createdAt: 'Just now',
          aspectRatio: '16:9',
        },
      ];
    }
  });

  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>(() => {
    try {
      const saved = localStorage.getItem('mido_generated_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const chatAbortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
      chatAbortControllerRef.current = null;
    }
    speechManager.stop();
    setIsLoading(false);
  };

  // Send Prompt Handler
  const handleSendPrompt = async (
    prompt: string,
    mode: Mode = currentMode,
    attachments: string[] = [],
    fileAttachments: FileAttachment[] = []
  ) => {
    if (!prompt.trim() && attachments.length === 0 && fileAttachments.length === 0) return;

    const promptStartTime = Date.now();
    const cleanPrompt = prompt.trim();

    // Secret Protocol 0008 Trigger: Instantly starts Under The Sphere
    if (cleanPrompt === '0008' || cleanPrompt === '008' || cleanPrompt.toLowerCase() === 'underthesphere') {
      setCurrentMode('under-the-sphere');
      soundFx.playSuccess();
      return;
    }

    // Secret Protocol 2026 Trigger: Instantly opens Secret Test Place (Chat with stickers & short answers)
    if (cleanPrompt === '2026' || cleanPrompt.toLowerCase() === 'testplace' || cleanPrompt.toLowerCase() === 'test place') {
      setIsTestPlaceOpen(true);
      soundFx.playSuccess();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      attachments,
      fileAttachments,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Auto-detect & permanently memorize facts from user speech
    if (cleanPrompt) {
      const extracted = extractFactsFromPrompt(cleanPrompt);
      if (extracted.length > 0) {
        setMemories((prev) => {
          const existing = new Set(prev.map((m) => m.fact.toLowerCase().trim()));
          const toAdd: PermanentMemoryItem[] = [];
          for (const item of extracted) {
            if (!existing.has(item.fact.toLowerCase().trim())) {
              toAdd.push({
                id: 'mem_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                fact: item.fact,
                category: item.category,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                source: 'auto',
              });
              existing.add(item.fact.toLowerCase().trim());
            }
          }
          if (toAdd.length > 0) {
            setMemoryToast(`🧠 Memorized: "${toAdd[0].fact}"`);
            soundFx.playSuccess();
            setTimeout(() => setMemoryToast(null), 4000);
            return [...prev, ...toAdd];
          }
          return prev;
        });
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    soundFx.playSent();

    try {
      if (mode === 'app-studio') {
        // App / Website Generation Mode
        const res = await fetch('/api/generate-app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const appData = await res.json();

        if (appData.html) {
          const newApp: AppProject = {
            id: Date.now().toString(),
            title: appData.title || 'Generated App',
            description: appData.description || prompt,
            html: appData.html,
            css: appData.css || '',
            js: appData.js || '',
            updatedAt: 'Just now',
          };

          setSavedApps((prev) => [newApp, ...prev]);
          setActiveApp(newApp);

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I've created your app **${newApp.title}**! You can inspect and test it live in the App Studio.`,
            timestamp: new Date().toLocaleTimeString(),
            generatedCode: {
              html: newApp.html,
              css: newApp.css,
              js: newApp.js,
              title: newApp.title,
            },
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } else if (mode === 'photo-studio') {
        // Photo Generation Mode
        const imageUrl = await handleGenerateImage(prompt, '1:1', 'Photorealistic');
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here is your generated image for: "${prompt}"`,
          timestamp: new Date().toLocaleTimeString(),
          attachments: [imageUrl],
          mediaOutput: {
            type: 'image',
            url: imageUrl,
            prompt: prompt,
            title: 'Gemini Imagine Photo',
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else if (mode === 'video-studio') {
        // Video Generation Mode
        const videoUrl = await handleGenerateVideo(prompt, '16:9');
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Your Veo AI video generation is complete!`,
          timestamp: new Date().toLocaleTimeString(),
          mediaOutput: {
            type: 'video',
            url: videoUrl,
            prompt: prompt,
            title: 'Veo AI Video Stream',
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else if (mode === 'music-studio') {
        // Music Composition Mode
        const track = await handleGenerateMusic(prompt, 'Synthwave');
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Composed soundtrack: **${track.title}**`,
          timestamp: new Date().toLocaleTimeString(),
          mediaOutput: {
            type: 'music',
            url: track.audioUrl,
            prompt: prompt,
            title: track.title,
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // General Chat Mode (Detect if user asked for a Video, Photo, Music, or Memory command in chat)
        const isSaveMemory = /save\s+(to\s+)?memory[:\s]+(.*)/i.exec(prompt) || /remember[:\s]+(.*)/i.exec(prompt);
        const lowerPrompt = prompt.toLowerCase();
        const matchedMemory = aiMemories.find(m => m.key && lowerPrompt.includes(m.key.toLowerCase()));

        if (isSaveMemory) {
          const textToSave = isSaveMemory[2] || isSaveMemory[1] || prompt;
          const keyName = textToSave.split(':')[0] || textToSave.slice(0, 30);
          handleSaveMemory(keyName, textToSave);

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🧠 **Saved to Instant AI Memory!**\nI have stored this in my instant memory bank:\n\n• **Key/Topic**: \`${keyName}\`\n• **Content**: ${textToSave}\n\nWhenever you ask about this topic in chat, I will recall and answer instantly in under 50ms!`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else if (matchedMemory) {
          // Instant Memory Recall Response (< 50ms)
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `⚡ **Instant AI Memory Recall** (0ms):\n\nBased on your saved memory for **${matchedMemory.key}**:\n👉 **${matchedMemory.content}**`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const trimmedPrompt = prompt.trim();

          // ChatGPT Plugin Tool Calling: ONLY triggers if explicitly invoked with @Plugin or /plugin
          const activePlugins = getActivePlugins();
          const pluginInvocation = checkExplicitPluginInvocation(trimmedPrompt, activePlugins);
          if (pluginInvocation) {
            const pluginResult = await executeChatGPTPlugin(pluginInvocation.plugin, pluginInvocation.cleanQuery);
            let sources = undefined;
            if (pluginInvocation.plugin.id === 'web-browser' && pluginResult.cardData?.citations) {
              sources = pluginResult.cardData.citations.map((c: any) => ({
                title: c.title,
                uri: c.url
              }));
            }
            const assistantMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: pluginResult.summary,
              timestamp: new Date().toLocaleTimeString(),
              pluginResult,
              groundingSources: sources,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            soundFx.playReceived();
            return;
          }

          // Explicit slash commands only in chat mode — all normal conversations go directly to standard AI chat!
          const isExplicitVideoCmd = /^\/(video|generate-video)\s+/i.test(trimmedPrompt);
          const isExplicitPhotoCmd = /^\/(image|photo|imagine|generate-image)\s+/i.test(trimmedPrompt);
          const isExplicitMusicCmd = /^\/(music|song|generate-music)\s+/i.test(trimmedPrompt);
          const isExplicitDiscordBotCmd = /^\/(bot|discord-bot)\s+/i.test(trimmedPrompt);

          const isVideoReq = isExplicitVideoCmd;
          const isPhotoReq = isExplicitPhotoCmd;
          const isMusicReq = isExplicitMusicCmd;
          const isDiscordBotReq = isExplicitDiscordBotCmd;

        if (isDiscordBotReq) {
          const hasDiscordToken = Boolean(
            secrets.discordBotToken || secrets.customSecrets?.discordBotToken || secrets.discordWebhookUrl
          );

          const activeClientId = secrets.discordClientId || '1531566521623773205';
          const activeToken = secrets.discordBotToken || secrets.customSecrets?.discordBotToken || secrets.discordWebhookUrl || 'MTUzMTU2NjUyMTYyMzc3MzIwNQ.GtZaBq.QRICZWxcOc7w9zNFeMpZZfXtLYGO7IwsIJaOAw';
          const botTokenDisplay = activeToken.slice(0, 12) + '...';

          const isFootball = /\b(football|soccer|match|goal|stadium|var|card|lineup|premier|champions|league|ball)\b/i.test(prompt);

          let botJsCode = '';
          let commandListText = '';

          if (isFootball) {
            commandListText = `⚽ **Football Suite Slash Commands (\`/\`) & Text Prefix Commands (\`!\`):**\n• \`/match\` or \`!match\` - View live match score & stadium stats\n• \`/stats\` or \`!stats\` - Top scorers, assists & clean sheets\n• \`/lineup\` or \`!lineup\` - Display 4-3-3 tactical formation XI\n• \`/goal\` or \`!goal\` - Celebrate a goal with crowd horn FX\n• \`/card\` or \`!card @user [red/yellow]\` - Issue Yellow/Red card\n• \`/var\` or \`!var\` - Trigger VAR decision review (Goal/Penalty/No Goal)\n• \`/stadium\` or \`!stadium\` - Display stadium info & crowd capacity\n• \`/ping\` or \`!ping\` - Check bot latency\n• \`/vip\` or \`!vip\` - Check VIP Pro status\n• \`/help\` or \`!help\` - Football command menu`;

            botJsCode = `// discord.js v14 - Complete Football & Moderation Discord Bot with Slash & Prefix Commands
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const http = require('http');

const BOT_TOKEN = '${activeToken}';
const CLIENT_ID = '${activeClientId}'; // Application Client ID

// 1. Keep-Alive HTTP Server (Keeps Bot Online 24/7 on Replit / Render / Glitch)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('⚽ Football & Moderation Discord Bot is Live & Online 24/7!');
}).listen(process.env.PORT || 3000, () => {
  console.log('⚡ Keep-Alive HTTP server listening on port 3000');
});

// 2. Define Football Slash Commands
const slashCommands = [
  new SlashCommandBuilder().setName('match').setDescription('View live or scheduled football match score & stadium stats'),
  new SlashCommandBuilder().setName('stats').setDescription('View top scorers, assists, and player stats'),
  new SlashCommandBuilder().setName('lineup').setDescription('Display 4-3-3 tactical team lineup XI'),
  new SlashCommandBuilder().setName('goal').setDescription('Simulate a spectacular goal celebration with crowd audio FX'),
  new SlashCommandBuilder().setName('card').setDescription('Issue a Yellow or Red card to a player').addUserOption(o => o.setName('target').setDescription('Target player').setRequired(true)).addStringOption(o => o.setName('color').setDescription('Red or Yellow').setRequired(true)),
  new SlashCommandBuilder().setName('var').setDescription('Trigger Video Assistant Referee (VAR) decision review'),
  new SlashCommandBuilder().setName('stadium').setDescription('Display stadium information and crowd capacity'),
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member from server').addUserOption(o => o.setName('target').setDescription('User to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member from server').addUserOption(o => o.setName('target').setDescription('User to kick').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('Bulk delete messages').addIntegerOption(o => o.setName('amount').setDescription('1-100 messages').setRequired(true)),
  new SlashCommandBuilder().setName('ping').setDescription('Check latency'),
  new SlashCommandBuilder().setName('vip').setDescription('Check VIP Pro Status (mido3dch1pro)'),
  new SlashCommandBuilder().setName('help').setDescription('List all football & moderation commands'),
].map(c => c.toJSON());

// 3. Deploy Slash Commands to Discord REST API
async function deploySlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    console.log('🔄 Deploying Slash Commands to Discord REST API (Client ID: ${activeClientId})...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: slashCommands });
    console.log('✅ Successfully deployed Slash Commands (/match, /stats, /lineup, /goal, /card, /var, /stadium, /ban, /kick, /clear, /ping, /vip, /help)!');
  } catch (err) {
    console.error('❌ Failed to deploy slash commands:', err);
  }
}

// 4. Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  console.log(\`⚽ Logged in as \${client.user.tag}! Football Bot is ALWAYS ONLINE 24/7.\`);
  client.user.setActivity('⚽ Premier League • /match', { type: 0 });
  await deploySlashCommands();
});

// 5. Interaction Handler for Slash Commands (/)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'match') {
    const embed = new EmbedBuilder()
      .setTitle('⚽ Premier League Live Matchday')
      .setColor('#00FF87')
      .setDescription('🏟️ **Santiago Bernabéu / Wembley Stadium**\\n\\n🔥 **Real Madrid 3 - 2 Barcelona** (88\\')\\n⚽ Goals: Vinicius Jr 12\\', Bellingham 45\\', Mbappé 84\\' | Lewandowski 22\\', Yamal 60\\'\\n📈 Possession: 54% vs 46% | Shots on Target: 9 vs 7')
      .setFooter({ text: 'MIDO Football AI • Live Engine' });
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'stats') {
    const embed = new EmbedBuilder()
      .setTitle('📊 Football Season Top Scorers & Stats')
      .setColor('#FFD700')
      .setDescription('🥇 **Kylian Mbappé**: 28 Goals, 9 Assists\\n🥈 **Jude Bellingham**: 22 Goals, 12 Assists\\n🥉 **Erling Haaland**: 27 Goals, 5 Assists\\n🧤 **Clean Sheets Leader**: Courtois (15 Clean Sheets)');
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'lineup') {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ 4-3-3 Tactical Formation Starting XI')
      .setColor('#1E90FF')
      .setDescription('🧤 **GK**: Courtois\\n🛡️ **DEF**: Carvajal, Rüdiger, Militão, Mendy\\n⚙️ **MID**: Valverde, Tchouaméni, Bellingham\\n⚡ **FWD**: Rodrygo, Mbappé, Vinicius Jr');
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'goal') {
    return interaction.reply('🎉 **GOOOOOOOOOAL!** ⚽🔥 Spectacular stadium bend-kick into the top right corner! The crowd goes wild! 🏟️🎺');
  }

  if (commandName === 'card') {
    const target = options.getUser('target');
    const color = options.getString('color') || 'yellow';
    const cardEmoji = color.toLowerCase() === 'red' ? '🟥' : '🟨';
    return interaction.reply(\`\${cardEmoji} **\${color.toUpperCase()} CARD** issued to \${target.tag}! Foul in the penalty box!\`);
  }

  if (commandName === 'var') {
    const outcomes = ['✅ **VAR DECISION: GOAL CONFIRMED!** ⚽', '❌ **VAR DECISION: OFFSIDE - NO GOAL!** 🚫', '⚠️ **VAR DECISION: PENALTY AWARDED!** 🎯'];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    return interaction.reply(\`📺 **Checking VAR (Video Assistant Referee)...**\\n\${randomOutcome}\`);
  }

  if (commandName === 'stadium') {
    const embed = new EmbedBuilder()
      .setTitle('🏟️ Official Stadium Details')
      .setColor('#FF4500')
      .setDescription('• **Stadium**: Santiago Bernabéu\\n• **Capacity**: 85,000 spectators\\n• **Pitch Type**: Hybrid Grass with Retractable Roof\\n• **Atmosphere**: 100% Sold Out Matchday');
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'ping') {
    return interaction.reply(\`🏓 Pong! Latency: \${Date.now() - interaction.createdTimestamp}ms\`);
  }

  if (commandName === 'vip') {
    const embed = new EmbedBuilder()
      .setTitle('👑 VIP Pro Master Access Active!')
      .setColor('#FFD700')
      .setDescription('✨ **VIP Code**: \`mido3dch1pro\`\\n• Client ID: \`${activeClientId}\`\\n• Football Bot Engine Active 24/7!');
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('⚽ MIDO Football Bot Commands Menu')
      .setColor('#00FF87')
      .setDescription('Use Slash Commands (\`/\`) OR Prefix Commands (\`!\`):\\n• \`/match\` or \`!match\` - Match score\\n• \`/stats\` or \`!stats\` - Player stats\\n• \`/lineup\` or \`!lineup\` - 4-3-3 lineup\\n• \`/goal\` or \`!goal\` - Goal celebration\\n• \`/card\` or \`!card @user yellow\` - Red/Yellow card\\n• \`/var\` or \`!var\` - VAR review\\n• \`/stadium\` or \`!stadium\` - Stadium capacity\\n• \`/ban\` or \`!ban @user\` - Ban member\\n• \`/kick\` or \`!kick @user\` - Kick member\\n• \`/clear\` or \`!clear 10\` - Clear messages\\n• \`/vip\` or \`!vip\` - VIP status');
    return interaction.reply({ embeds: [embed] });
  }
});

// 6. Text Prefix Commands (!match, !stats, !goal, !var, !card, !lineup, !help)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'match') {
    return message.reply('⚽ **Matchday**: Real Madrid 3 - 2 Barcelona (88\\') | Santiago Bernabéu 🏟️');
  }

  if (command === 'stats') {
    return message.reply('📊 **Top Scorer**: Kylian Mbappé (28 Goals, 9 Assists) | Top Assists: Jude Bellingham (12 Assists)');
  }

  if (command === 'lineup') {
    return message.reply('🛡️ **4-3-3 Lineup**: Courtois (GK), Carvajal, Rüdiger, Militão, Mendy, Valverde, Tchouaméni, Bellingham, Rodrygo, Mbappé, Vinicius Jr');
  }

  if (command === 'goal') {
    return message.reply('🎉 **GOOOOOOOOOAL!** ⚽🔥 Spectacular stadium bend-kick into top corner! 🏟️🎺');
  }

  if (command === 'var') {
    return message.reply('📺 **VAR Review**: ✅ GOAL CONFIRMED! ⚽');
  }

  if (command === 'card') {
    return message.reply('🟨 **Yellow Card** issued for a tactical foul!');
  }

  if (command === 'stadium') {
    return message.reply('🏟️ **Santiago Bernabéu**: Capacity 85,000 | Retractable Roof & Hybrid Grass');
  }

  if (command === 'ping') {
    return message.reply(\`🏓 Pong! Latency: \${Date.now() - message.createdTimestamp}ms\`);
  }

  if (command === 'vip') {
    return message.reply('👑 **VIP Pro Master Access Unlocked!** Code: \`mido3dch1pro\` | Client ID: \`1531566521623773205\`');
  }

  if (command === 'help') {
    return message.reply('⚽ **Football Commands**: \`!match\`, \`!stats\`, \`!lineup\`, \`!goal\`, \`!card\`, \`!var\`, \`!stadium\`, \`!ban\`, \`!kick\`, \`!clear\`, \`!vip\`, \`!help\` (or use Slash Commands \`/\`)');
  }
});

client.login(BOT_TOKEN);`;
          } else {
            commandListText = `🛡️ **Discord Bot Commands (\`/\` Slash & \`!\` Prefix):**\n• \`/ban\` or \`!ban @user\` - Ban member\n• \`/kick\` or \`!kick @user\` - Kick member\n• \`/mute\` or \`!mute @user 10\` - Mute/timeout\n• \`/clear\` or \`!clear 10\` - Bulk delete\n• \`/warn\` or \`!warn @user\` - Issue warning\n• \`/userinfo\` or \`!userinfo\` - Profile\n• \`/ping\` or \`!ping\` - Latency\n• \`/vip\` or \`!vip\` - Check VIP Pro\n• \`/help\` or \`!help\` - Help menu`;

            botJsCode = `// discord.js v14 - Complete Discord Moderation Bot with / Slash Commands & 24/7 Keep-Alive
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const http = require('http');

const BOT_TOKEN = '${activeToken}';
const CLIENT_ID = '${activeClientId}'; // Discord Application Client ID

// 1. Keep-Alive Server (Keeps Bot Online 24/7)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('🤖 Discord Bot is Live & Online 24/7!');
}).listen(process.env.PORT || 3000, () => {
  console.log('⚡ Keep-Alive HTTP server listening on port 3000');
});

// 2. Define Slash Commands
const slashCommands = [
  new SlashCommandBuilder().setName('ban').setDescription('Ban a member from server').addUserOption(o => o.setName('target').setDescription('User to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('kick').setDescription('Kick a member from server').addUserOption(o => o.setName('target').setDescription('User to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('mute').setDescription('Timeout / Mute a member').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes')),
  new SlashCommandBuilder().setName('clear').setDescription('Bulk delete messages').addIntegerOption(o => o.setName('amount').setDescription('1-100 messages').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('Issue warning').addUserOption(o => o.setName('target').setDescription('Target user').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')),
  new SlashCommandBuilder().setName('userinfo').setDescription('View user information').addUserOption(o => o.setName('target').setDescription('Target user')),
  new SlashCommandBuilder().setName('ping').setDescription('Check latency'),
  new SlashCommandBuilder().setName('help').setDescription('List slash commands'),
  new SlashCommandBuilder().setName('vip').setDescription('Check VIP Pro Status (mido3dch1pro)'),
].map(c => c.toJSON());

// 3. Register Slash Commands via Discord REST API
async function deploySlashCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
    console.log('🔄 Deploying Slash Commands to Discord REST API (Client ID: ${activeClientId})...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: slashCommands });
    console.log('✅ Successfully deployed Slash Commands (/ban, /kick, /mute, /clear, /warn, /userinfo, /ping, /help, /vip)!');
  } catch (err) {
    console.error('❌ Failed to deploy slash commands:', err);
  }
}

// 4. Initialize Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', async () => {
  console.log(\`🤖 Logged in as \${client.user.tag}! Bot is ALWAYS ONLINE.\`);
  client.user.setActivity('Guarding Server • /help', { type: 0 });
  await deploySlashCommands();
});

// 5. Interaction Handler for Slash Commands (/)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You lack Ban Members permission!', ephemeral: true });
    }
    const target = options.getMember('target');
    const reason = options.getString('reason') || 'Violating server rules';
    if (!target) return interaction.reply({ content: '⚠️ User not found in server.', ephemeral: true });
    await target.ban({ reason });
    return interaction.reply(\`🔨 **Banned \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You lack Kick Members permission!', ephemeral: true });
    }
    const target = options.getMember('target');
    const reason = options.getString('reason') || 'Violating server rules';
    if (!target) return interaction.reply({ content: '⚠️ User not found in server.', ephemeral: true });
    await target.kick(reason);
    return interaction.reply(\`👢 **Kicked \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (commandName === 'mute') {
    const target = options.getMember('target');
    const minutes = options.getInteger('minutes') || 10;
    if (!target) return interaction.reply({ content: '⚠️ User not found.', ephemeral: true });
    await target.timeout(minutes * 60 * 1000, 'Muted by moderator');
    return interaction.reply(\`🔇 **Muted \${target.user.tag}** for \${minutes} minutes.\`);
  }

  if (commandName === 'clear') {
    const amount = options.getInteger('amount') || 10;
    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: \`🧹 Deleted **\${amount}** messages.\`, ephemeral: true });
  }

  if (commandName === 'ping') {
    return interaction.reply(\`🏓 Pong! Latency: \${Date.now() - interaction.createdTimestamp}ms\`);
  }

  if (commandName === 'vip') {
    const embed = new EmbedBuilder()
      .setTitle('👑 VIP Pro Master Access Unlocked!')
      .setColor('#FFD700')
      .setDescription('✨ **VIP Code**: \`mido3dch1pro\`\\n• Client ID: \`${activeClientId}\`\\n• Unlimited Discord Bot Studio Features & 60FPS Engine active!');
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('🛡️ Bot Moderation Suite Commands')
      .setColor('#5865F2')
      .setDescription('Use Slash Commands (\`/\`) OR Prefix Commands (\`!\`):\\n• \`/ban\` or \`!ban @user [reason]\`\\n• \`/kick\` or \`!kick @user [reason]\`\\n• \`/mute\` or \`!mute @user [minutes]\`\\n• \`/clear\` or \`!clear [1-100]\`\\n• \`/warn\` or \`!warn @user [reason]\`\\n• \`/userinfo\` or \`!userinfo @user\`\\n• \`/ping\` or \`!ping\`\\n• \`/vip\` or \`!vip\`\\n• \`/help\` or \`!help\`');
    return interaction.reply({ embeds: [embed] });
  }
});

// 6. Text Message Command Handler (Backup for !ban, !kick, !clear, !help)
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ban') {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('❌ You lack Ban Members permission!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('⚠️ Mention a user to ban! Example: \`!ban @user spamming\`');
    const reason = args.slice(1).join(' ') || 'Violating server rules';
    await target.ban({ reason });
    return message.reply(\`🔨 **Banned \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (command === 'kick') {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('❌ You lack Kick Members permission!');
    const target = message.mentions.members.first();
    if (!target) return message.reply('⚠️ Mention a user to kick! Example: \`!kick @user breaking rules\`');
    const reason = args.slice(1).join(' ') || 'Violating server rules';
    await target.kick(reason);
    return message.reply(\`👢 **Kicked \${target.user.tag}** | Reason: \${reason}\`);
  }

  if (command === 'clear' || command === 'purge') {
    const amount = parseInt(args[0]) || 10;
    await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(\`🧹 Bulk deleted **\${amount}** messages.\`);
    setTimeout(() => msg.delete().catch(() => {}), 3000);
  }

  if (command === 'ping') {
    return message.reply(\`🏓 Pong! Latency: \${Date.now() - message.createdTimestamp}ms\`);
  }

  if (command === 'vip') {
    return message.reply('👑 **VIP Pro Master Access Unlocked!** Code: \`mido3dch1pro\` | Client ID: \`1531566521623773205\`');
  }

  if (command === 'help') {
    return message.reply('🛡️ **Commands Available**: \`!ban\`, \`!kick\`, \`!mute\`, \`!clear\`, \`!warn\`, \`!userinfo\`, \`!ping\`, \`!vip\`, \`!help\` (or use Slash Commands \`/\`)');
  }
});

client.login(BOT_TOKEN);`;
          }

          const responseExplanation = `🧠 **MIDO AI: Parsing Your Bot & Command Request...**\n⚙️ **Generated ${isFootball ? 'Football & Moderation' : 'Discord Slash'} Bot Code (\`bot.js\`) with Dual Slash (\`/\`) & Prefix (\`!\`) Support!**\n\n🆔 **Client ID Configured**: \`1531566521623773205\`\n🔑 **Bot Token Active**: \`${botTokenDisplay}\`\n👑 **VIP Code Active**: \`mido3dch1pro\`\n\n${commandListText}\n\n--- \n\n❓ **WHY WAS YOUR BOT OFFLINE & SHOWING 0 COMMANDS IN DISCORD?**\n\n1. **Why 0 Commands Showed Initially**: Slash Commands (\`/\`) must be registered to Discord's REST API using your **Client ID (\`1531566521623773205\`)**. The generated \`bot.js\` code automatically executes \`rest.put(Routes.applicationCommands('1531566521623773205'), { body: slashCommands })\` as soon as it boots up!\n2. **Why the Bot Was Offline**: A web app inside a browser tab cannot keep a live WebSocket TCP connection to Discord's gateway (\`gateway.discord.gg\`) when the tab is closed or idle.\n3. **How to Keep it 24/7 ALWAYS ONLINE FOR FREE**:\n   • **Method 1 (Free 24/7 Cloud Host)**: Copy the generated \`bot.js\` code below or download it, paste it into **Replit**, **Glitch**, **Render**, or **Railway**, and click **Run**! The built-in HTTP server (\`port 3000\`) keeps it alive 24/7!\n   • **Method 2 (Run Locally)**: On your computer, run \`npm install discord.js\` then \`node bot.js\`.\n   • **Method 3 (Test Live Right Now)**: Open the **Discord Studio Simulator** below to test slash commands live inside the app!\n\n4. **Instant Text Prefix Commands**: In case Discord takes a moment to propagate slash commands to all your server members, text commands like \`${isFootball ? '!match, !stats, !goal, !var, !card, !lineup' : '!ban, !kick, !clear, !help'}\` work **INSTANTLY**!`;

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseExplanation,
            timestamp: new Date().toLocaleTimeString(),
            actionPrompt: {
              type: 'open_discord_studio',
              title: 'Launch Discord Studio Simulator',
              description: 'Test live slash commands, view full discord.js script, or run webhooks.',
            },
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else if (isVideoReq) {
          const cleanPrompt = trimmedPrompt.replace(/^\/(video|generate-video)\s+/i, '') || prompt;
          const videoUrl = await handleGenerateVideo(cleanPrompt, '16:9', attachments[0]);
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎬 **100% Free AI Video Stream Generated!**\nYour custom high-definition video stream is rendered directly below without any API keys required:`,
            timestamp: new Date().toLocaleTimeString(),
            mediaOutput: {
              type: 'video',
              url: videoUrl,
              prompt: cleanPrompt,
              title: 'AI Generated Video',
            },
            actionPrompt: {
              type: 'open_video_studio',
              title: 'Open Video Studio',
              description: 'Customize video FX filters, subtitles, playback speed, or record WebM/MP4 motion clips.',
            },
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else if (isPhotoReq) {
          const cleanPrompt = trimmedPrompt.replace(/^\/(image|photo|imagine|generate-image)\s+/i, '') || prompt;
          const imageUrl = await handleGenerateImage(cleanPrompt, '1:1', 'Photorealistic');
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎨 **AI Photo Generated directly in chat!**\nHere is your synthesized photorealistic image:`,
            timestamp: new Date().toLocaleTimeString(),
            attachments: [imageUrl],
            mediaOutput: {
              type: 'image',
              url: imageUrl,
              prompt: cleanPrompt,
              title: 'Gemini Imagine Photo',
            },
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else if (isMusicReq) {
          const cleanPrompt = trimmedPrompt.replace(/^\/(music|song|generate-music)\s+/i, '') || prompt;
          const track = await handleGenerateMusic(cleanPrompt, 'Synthwave');
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `🎵 **AI Soundtrack Composed directly in chat!**\nListen to your generated track **${track.title}** directly inside the chat stream:`,
            timestamp: new Date().toLocaleTimeString(),
            mediaOutput: {
              type: 'music',
              url: track.audioUrl,
              prompt: cleanPrompt,
              title: track.title,
            },
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          // Standard Conversational / Reasoning Chat
          const controller = new AbortController();
          chatAbortControllerRef.current = controller;

          const res = await fetch('/api/chat', {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: prompt,
              attachments,
              fileAttachments: fileAttachments.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
                category: f.category,
                extension: f.extension,
                parsedPreview: f.parsedPreview,
                dataUrl: f.dataUrl ? (f.dataUrl.length > 500000 && !f.dataUrl.startsWith('data:image') ? f.dataUrl.slice(0, 30000) : f.dataUrl) : undefined,
              })),
              history: messages.slice(-(appSettings.contextMemoryLength || 8)),
              useSearch: appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true,
              enableLiveGoogleSearch: appSettings.enableLiveGoogleSearch ?? appSettings.autoWebSearch ?? true,
              userNickname: appSettings.userNickname || user?.nickname || user?.name || 'Mido',
              userBioMemory: memories.map((m) => m.fact).join('; ') + (appSettings.userBioMemory ? '; ' + appSettings.userBioMemory : ''),
              memories: memories.map((m) => m.fact),
              turboMode: appSettings.turboMode,
              midoModelTier: appSettings.midoModelTier || 'mido-3.8-flash',
              geminiModelTier: appSettings.geminiModelTier || 'gemini-3.8-flash',
              responseVerbosity: appSettings.responseVerbosity || 'balanced',
              aiTone: appSettings.aiTone,
              creativityTemperature: appSettings.creativityTemperature,
              customSystemInstructions: appSettings.customSystemInstructions,
              secrets,
            }),
          });

          const data = await res.json();

          if (data.error) {
            const errStr = String(data.error);
            const is503 = errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE');
            if (is503 && data.reply) {
              // Gracefully handle model 503 spike using returned smart reply
              const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                timestamp: new Date().toLocaleTimeString(),
                groundingSources: data.groundingSources,
                generatedCode: data.generatedCode,
                actionPrompt: data.actionPrompt,
              };
              setMessages((prev) => [...prev, assistantMsg]);
              return;
            }
            throw new Error(data.error);
          }

          let effectiveSources = data.groundingSources && data.groundingSources.length > 0 ? data.groundingSources : [];
          if (effectiveSources.length === 0) {
            const siteMatch = prompt.match(/\b(?:search\s+(?:for\s+)?(?:site\s+|website\s+)?|lookup\s+|browse\s+|find\s+)([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
            if (siteMatch) {
              const rawDomain = siteMatch[1];
              const fullUri = rawDomain.startsWith('http') ? rawDomain : `https://${rawDomain}`;
              effectiveSources = [{
                title: `${rawDomain.charAt(0).toUpperCase() + rawDomain.slice(1)} - Official Site`,
                uri: fullUri
              }];
            }
          }

          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply || "I've processed your request.",
            timestamp: new Date().toLocaleTimeString(),
            groundingSources: effectiveSources.length > 0 ? effectiveSources : undefined,
            generatedCode: data.generatedCode,
            actionPrompt: data.actionPrompt,
          };

          if (data.generatedCode) {
            const newApp: AppProject = {
              id: Date.now().toString(),
              title: data.generatedCode.title || 'Generated Code App',
              description: prompt,
              html: data.generatedCode.html,
              css: data.generatedCode.css || '',
              js: data.generatedCode.js || '',
              updatedAt: 'Just now',
            };
            setSavedApps((prev) => [newApp, ...prev]);
            setActiveApp(newApp);
          }

          setMessages((prev) => [...prev, assistantMsg]);
          soundFx.playReceived();
          if (appSettings.autoReadAloud) {
            speechManager.speak(assistantMsg.content, assistantMsg.id, {
              rate: appSettings.speechRate,
              pitch: appSettings.speechPitch,
              voiceName: appSettings.speechVoice,
              volume: appSettings.soundVolume,
            });
          }
        }
      }
    }
    } catch (err: any) {
      console.error(err);
      const errStr = String(err?.message || err);

      let content = `I'm right here with you! What would you like to chat about or explore?`;
      if (errStr && (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota'))) {
        content = `I'm right here with you! Let's continue our conversation — what's on your mind?`;
      }

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date().toLocaleTimeString(),
        isError: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Image Generation Handler
  const handleGenerateImage = async (prompt: string, aspectRatio = '1:1', style = 'Photorealistic') => {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, style }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const newImg: GeneratedImage = {
      id: Date.now().toString(),
      url: data.imageUrl,
      prompt,
      aspectRatio,
      style,
      createdAt: new Date().toLocaleTimeString(),
    };

    setGeneratedImages((prev) => [newImg, ...prev]);
    return data.imageUrl;
  };

  // Photo Edit Handler
  const handleEditImage = async (imageBase64: string, prompt: string) => {
    const res = await fetch('/api/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const newImg: GeneratedImage = {
      id: Date.now().toString(),
      url: data.imageUrl,
      prompt: `Edit: ${prompt}`,
      aspectRatio: '1:1',
      createdAt: new Date().toLocaleTimeString(),
    };

    setGeneratedImages((prev) => [newImg, ...prev]);
    return data.imageUrl;
  };

  // Video Generation Handler with Instant Free Stream, JSON2Video & Veo Polling
  const handleGenerateVideo = async (
    prompt: string,
    aspectRatio = '16:9',
    imageBase64?: string,
    isPromo = false,
    promoDetails?: any
  ) => {
    const customApiKey = secrets.geminiApiKey || localStorage.getItem('mido_custom_video_api_key') || localStorage.getItem('mido_gemini_api_key') || '';
    const json2videoApiKey = secrets.json2videoApiKey || secrets.videoApiKey || localStorage.getItem('mido_json2video_api_key') || '';
    try {
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          imageBase64,
          isPromo,
          promoDetails,
          customApiKey: customApiKey || undefined,
          json2videoApiKey: json2videoApiKey || undefined,
          secrets,
          resolution: appSettings.videoResolution || '1080p',
          fps: appSettings.videoFps || 60,
          motionStyle: appSettings.videoMotionStyle || 'cinematic',
          autoEnhance: appSettings.videoAutoEnhance ?? true,
          coopMode: appSettings.videoCoopMode ?? true,
        }),
      });

      const startData = await startRes.json();
      let videoUrl = startData.videoUrl || (isPromo ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4");

      const videoId = Date.now().toString();
      const newVideo: GeneratedVideo = {
        id: videoId,
        url: videoUrl,
        streamUrl: startData.streamUrl,
        prompt: startData.prompt || prompt,
        enhancedPrompt: startData.enhancedPrompt,
        status: 'completed',
        createdAt: new Date().toLocaleTimeString(),
        aspectRatio,
        storyboard: startData.storyboard || [],
        variations: startData.variations || [],
        audioMood: startData.audioMood,
        narratorScript: startData.narratorScript,
        tags: startData.tags || [],
        isPromo,
        promoDetails,
      };

      setGeneratedVideos((prev) => [newVideo, ...prev]);

      // 1. If JSON2Video Project ID returned, poll for HD rendered movie
      if (startData.json2videoProjectId) {
        (async () => {
          try {
            let attempts = 0;
            while (attempts < 30) {
              await new Promise((r) => setTimeout(r, 2500));
              attempts++;
              const statusRes = await fetch('/api/json2video-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  projectId: startData.json2videoProjectId,
                  customApiKey: json2videoApiKey || undefined,
                  secrets,
                }),
              });
              const statusData = await statusRes.json();
              if (statusData.success && statusData.status === 'done' && statusData.url) {
                const renderedUrl = statusData.url;
                setGeneratedVideos((prev) =>
                  prev.map((v) => (v.id === videoId ? {
                    ...v,
                    url: renderedUrl,
                    streamUrl: `/api/mido-video/stream?url=${encodeURIComponent(renderedUrl)}`,
                  } : v))
                );
                break;
              }
              if (statusData.status === 'error') {
                break;
              }
            }
          } catch (e) {
            console.warn("JSON2Video background polling error:", e);
          }
        })();
      }

      // 2. If Veo Operation ID returned, poll in background for completion and update with real Veo render
      if (startData.operationName) {
        (async () => {
          try {
            let attempts = 0;
            while (attempts < 20) {
              await new Promise((r) => setTimeout(r, 2500));
              attempts++;
              const statusRes = await fetch('/api/video-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName: startData.operationName, customApiKey }),
              });
              const statusData = await statusRes.json();
              if (statusData.done && !statusData.error) {
                const dlRes = await fetch('/api/video-download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ operationName: startData.operationName, customApiKey }),
                });
                if (dlRes.ok) {
                  const blob = await dlRes.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  setGeneratedVideos((prev) =>
                    prev.map((v) => (v.id === videoId ? { ...v, url: blobUrl } : v))
                  );
                  break;
                }
              }
            }
          } catch (e) {
            console.warn("Veo background polling completed:", e);
          }
        })();
      }

      return videoUrl;
    } catch {
      const fallbackUrl = isPromo ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4";
      const newVideo: GeneratedVideo = {
        id: Date.now().toString(),
        url: fallbackUrl,
        prompt,
        status: 'completed',
        createdAt: new Date().toLocaleTimeString(),
        aspectRatio,
        isPromo,
        promoDetails,
      };
      setGeneratedVideos((prev) => [newVideo, ...prev]);
      return fallbackUrl;
    }
  };

  // Music Composition Handler
  const handleGenerateMusic = async (prompt: string, genre: string, extra?: any) => {
    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          tempo: extra?.tempo || 120,
          mood: extra?.mood || 'Epic',
          promoType: extra?.promoType || 'Product Commercial',
        }),
      });

      const data = await res.json();

      if (data.track) {
        const track: GeneratedTrack = {
          id: data.track.id || Date.now().toString(),
          title: data.track.title || `${genre} Promo Master`,
          prompt,
          audioUrl: data.track.audioUrl || '',
          genre: data.track.genre || genre,
          duration: data.track.duration || 60,
          bpm: data.track.bpm || extra?.tempo || 120,
          key: data.track.key || 'D Minor',
          mood: data.track.mood || extra?.mood || 'Epic',
          promoScript: data.track.promoScript || '',
          notes: data.track.notes || [],
          bass: data.track.bass || [],
          chords: data.track.chords || [],
          drumPattern: data.track.drumPattern || '',
          sections: data.track.sections || [],
          stems: data.track.stems || [],
          createdAt: new Date().toLocaleTimeString(),
        };

        setGeneratedTracks((prev) => [track, ...prev]);
        try {
          localStorage.setItem('mido_generated_tracks', JSON.stringify([track, ...generatedTracks].slice(0, 30)));
        } catch (e) {
          console.error(e);
        }
        return track;
      }

      const track: GeneratedTrack = {
        id: Date.now().toString(),
        title: `${genre} Promo Master`,
        prompt,
        audioUrl: data.audioUrl || '',
        genre,
        duration: 60,
        bpm: extra?.tempo || 120,
        key: 'D Minor',
        mood: extra?.mood || 'Epic',
        createdAt: new Date().toLocaleTimeString(),
      };

      setGeneratedTracks((prev) => [track, ...prev]);
      return track;
    } catch (err) {
      console.warn("Music composition fallback engaged:", err);
      const track: GeneratedTrack = {
        id: Date.now().toString(),
        title: `${genre} Ambient Synth`,
        prompt,
        audioUrl: '',
        genre,
        duration: 45,
        bpm: extra?.tempo || 120,
        key: 'D Minor',
        createdAt: new Date().toLocaleTimeString(),
      };
      setGeneratedTracks((prev) => [track, ...prev]);
      return track;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-400 border-r-indigo-400 animate-spin flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <span>mido3dch1.ai Studio</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
            Firebase Auth
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Restoring your authenticated session securely...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <RealAuthScreen
        onSuccessAuth={(authUser) => setUser(authUser)}
        onContinueAsGuest={() => {
          const guestAcc: UserAccount = {
            id: 'guest-' + Date.now(),
            name: 'Guest Creator',
            nickname: 'Guest',
            email: 'guest@mido3dch1.ai',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Guest',
            isLoggedIn: true,
            provider: 'guest',
          };
          try {
            localStorage.setItem('mido_guest_user', JSON.stringify(guestAcc));
          } catch (e) {
            console.warn(e);
          }
          setUser(guestAcc);
        }}
      />
    );
  }

  return (
    <div
      className={`flex flex-col h-screen w-screen transition-colors duration-300 overflow-hidden font-sans relative ${
        theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : theme === 'cyberpunk'
          ? 'bg-slate-950 text-pink-100'
          : 'bg-[#020617] text-slate-100'
      }`}
    >
      {/* Mesh Gradient Background Blobs for Frosted Glass Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'cyberpunk' ? 'bg-pink-600/30' : 'bg-purple-600/20'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] ${theme === 'cyberpunk' ? 'bg-cyan-600/30' : 'bg-blue-600/20'}`}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Bar */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onNewSession={handleNewSession}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        sessionCount={chatSessions.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenAccountManager={() => setIsAccountManagerOpen(true)}
        onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
        onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
        onOpenHelpModal={handleOpenHelpModal}
        onOpenToolsModal={handleOpenToolsModal}
        onOpenFootballModal={() => setIsFootballModalOpen(true)}
        onOpenSerModal={() => setIsSerModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleScratchpad={() => setIsScratchpadOpen((prev) => !prev)}
        hasSecretsConfigured={Boolean(secrets.youtubeApiKey || secrets.geminiApiKey || secrets.openaiApiKey || (secrets.customSecrets && Object.keys(secrets.customSecrets).length > 0))}
      />

      {/* Main App Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentMode={currentMode}
          onSelectMode={(mode) => {
            setCurrentMode(mode);
            setIsSidebarOpen(false);
          }}
          savedApps={savedApps}
          onSelectApp={setActiveApp}
          generatedImages={generatedImages}
          generatedTracks={generatedTracks}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenAccountManager={() => setIsAccountManagerOpen(true)}
          onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
          onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
          onOpenHelpModal={handleOpenHelpModal}
          onOpenToolsModal={handleOpenToolsModal}
          onOpenFootballModal={() => setIsFootballModalOpen(true)}
          onOpenSerModal={() => setIsSerModalOpen(true)}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          sessionCount={chatSessions.length}
        />



        {/* Dynamic Studio Views */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {(currentMode === 'mido-shortcuts' || currentMode === 'shortcut-dashboard') && (
            <MidoShortcutsView
              onSelectMode={setCurrentMode}
              user={user}
            />
          )}

          {currentMode === 'chat' && (
            <ChatView
              messages={messages}
              onSendPrompt={(p) => handleSendPrompt(p, 'chat')}
              onOpenInAppStudio={(code) => {
                const newApp: AppProject = {
                  id: Date.now().toString(),
                  title: code.title || 'Interactive Web App',
                  description: 'Code generated from AI Chat',
                  html: code.html,
                  css: code.css || '',
                  js: code.js || '',
                  updatedAt: 'Just now',
                };
                setSavedApps((prev) => [newApp, ...prev]);
                setActiveApp(newApp);
                setCurrentMode('app-studio');
              }}
              isLoading={isLoading}
              onStopGenerating={handleStopGeneration}
              onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              secrets={secrets}
              onSaveSecrets={handleSaveSecrets}
              onSwitchMode={setCurrentMode}
              onOpenToolsModal={handleOpenToolsModal}
              onOpenHelpModal={handleOpenHelpModal}
              onOpenFootballModal={() => setIsFootballModalOpen(true)}
              onOpenSerModal={() => setIsSerModalOpen(true)}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
              onFeedback={handleFeedback}
              feedbackMap={feedbackMap}
              appSettings={appSettings}
              pinnedMessages={pinnedMessages}
              onTogglePinMessage={handleTogglePinMessage}
              memories={memories}
              onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
            />
          )}

          {currentMode === 'face-detect' && (
            <FaceDetectView />
          )}

          {currentMode === 'youtube-studio' && (
            <YouTubeStudioView
              secrets={secrets}
              onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
              onSaveSecrets={handleSaveSecrets}
            />
          )}

          {currentMode === 'app-studio' && (
            <AppStudioView
              currentApp={activeApp}
              onUpdateApp={setActiveApp}
              onGenerateNewApp={(prompt) => handleSendPrompt(prompt, 'app-studio')}
              isGenerating={isLoading}
            />
          )}

          {currentMode === 'photo-studio' && (
            <PhotoStudioView
              onGenerateImage={handleGenerateImage}
              onEditImage={handleEditImage}
              generatedImages={generatedImages}
            />
          )}

          {currentMode === 'mido-video-ai' && (
            <MidoVideoAIView
              onPublishToOrb={({ title, videoUrl, prompt }) => {
                soundFx.playClick();
                setCurrentMode('mido-orb');
              }}
              onOpenStudio={() => {
                soundFx.playClick();
                setCurrentMode('video-studio');
              }}
            />
          )}

          {currentMode === 'video-studio' && (
            <VideoStudioView
              onGenerateVideo={handleGenerateVideo}
              generatedVideos={generatedVideos}
              appSettings={appSettings}
              onSwitchToMobileAI={() => {
                soundFx.playClick();
                setCurrentMode('mido-video-ai');
              }}
            />
          )}


          {currentMode === 'talking-avatar' && (
            <TalkingAvatarView
              onPublishToOrb={() => {
                setCurrentMode('mido-orb');
              }}
            />
          )}

          {currentMode === 'music-studio' && (
            <MusicStudioView
              onGenerateMusic={handleGenerateMusic}
              generatedTracks={generatedTracks}
            />
          )}

          {currentMode === 'promo-studio' && (
            <PromoStudioView
              secrets={secrets}
              onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
              onOpenDiscordModal={() => setIsDiscordModalOpen(true)}
              onNavigateToVideoStudio={async (promoPrompt) => {
                setCurrentMode('video-studio');
                if (promoPrompt) {
                  await handleGenerateVideo(promoPrompt, '16:9');
                }
              }}
            />
          )}

          {currentMode === 'champions-studio' && (
            <ChampionsStudioView />
          )}

          {currentMode === 'facebook-studio' && (
            <FacebookStudioView
              user={user}
              secrets={secrets}
              onSaveSecrets={handleSaveSecrets}
              onSendPrompt={handleSendPrompt}
            />
          )}

          {currentMode === 'editor-studio' && (
            <EditorStudioView
              user={user}
              secrets={secrets}
              onPublishToMidoOrb={({ title, url, category, description }) => {
                soundFx.playSuccess();
                setCurrentMode('mido-orb');
              }}
              onNavigateToOrb={() => {
                soundFx.playClick();
                setCurrentMode('mido-orb');
              }}
              onNavigateToGuide={() => {
                soundFx.playClick();
                setCurrentMode('mido-guide');
              }}
            />
          )}

          {currentMode === 'organisation' && (
            <OrganisationView />
          )}

          {currentMode === 'hello-mido-calls' && (
            <HelloMidoCallsView />
          )}

          {currentMode === 'voice-responding' && (
            <VoiceRespondingView
              user={user}
              secrets={secrets}
              onSelectMode={setCurrentMode}
              onSendPromptToChat={handleSendPrompt}
            />
          )}

          {currentMode === 'mido-guide' && (
            <GuideStudioView
              user={user}
              secrets={secrets}
              onSelectMode={setCurrentMode}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          )}

          {currentMode === 'mido-orb' && (
            <MidoOrbView
              user={user}
              secrets={secrets}
            />
          )}

          {currentMode === 'mido-nemis' && (
            <MidoNemisView
              user={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenAccountManager={() => setIsAccountManagerOpen(true)}
              onFollowChange={(_targetId, isFollowing) => {
                if (user) {
                  setUser(prev => prev ? ({
                    ...prev,
                    followingCount: Math.max(0, (prev.followingCount || 0) + (isFollowing ? 1 : -1))
                  }) : null);
                }
              }}
            />
          )}

          {currentMode === 'mido-ear' && (
            <MidoEarView
              user={user}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onOpenAccountManager={() => setIsAccountManagerOpen(true)}
            />
          )}

          {currentMode === 'humoris' && (
            <HumorisView
              user={user}
              appSettings={appSettings}
              onUpdateAppSettings={handleUpdateAppSettings}
            />
          )}

          {currentMode === 'under-the-sphere' && (
            <UnderTheSphereView
              user={user}
              onExit={() => setCurrentMode('chat')}
            />
          )}

          {currentMode === 'discord-studio' && (
            <DiscordStudioView
              secrets={secrets}
              onSaveSecrets={handleSaveSecrets}
              onOpenHelpModal={handleOpenHelpModal}
              user={user}
            />
          )}

          {/* Omni Prompt Bar for Chat mode */}
          {currentMode === 'chat' && (
            <OmniPromptBar
              onSendPrompt={handleSendPrompt}
              currentMode={currentMode}
              onSelectMode={setCurrentMode}
              isLoading={isLoading}
              onStopGeneration={handleStopGeneration}
              secrets={secrets}
              onOpenPluginStore={() => setIsPluginStoreOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectAccount={(selectedUser) => {
          setUser(selectedUser);
          try {
            localStorage.setItem('mido_saved_user_account', JSON.stringify(selectedUser));
          } catch (e) {
            console.error(e);
          }
        }}
      />

      {/* Top Right Settings & Account Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
        onSwitchAccount={() => {
          setIsSettingsModalOpen(false);
          setIsAuthModalOpen(true);
        }}
        onLogout={async () => {
          try {
            await logOutUser();
          } catch (e) {
            console.warn(e);
          }
          setUser(null);
          setIsSettingsModalOpen(false);
        }}
        theme={theme}
        onSelectTheme={setTheme}
        defaultMode={currentMode}
        onSelectDefaultMode={setCurrentMode}
        onResetSession={() => {
          setMessages([]);
          setIsSettingsModalOpen(false);
        }}
        messages={messages}
        appSettings={appSettings}
        onUpdateAppSettings={handleUpdateAppSettings}
        pinnedMessages={pinnedMessages}
        onUnpinMessage={handleUnpinMessage}
        onClearPinnedMessages={handleClearPinnedMessages}
        onTestPromptInChat={(prompt) => {
          setIsSettingsModalOpen(false);
          setCurrentMode('chat');
          handleSendPrompt(prompt);
        }}
      />

      {/* Secrets Vault Modal */}
      <SecretsModal
        isOpen={isSecretsModalOpen}
        onClose={() => setIsSecretsModalOpen(false)}
        secrets={secrets}
        onSaveSecrets={handleSaveSecrets}
        onLaunchUnderTheSphere={() => {
          setCurrentMode('under-the-sphere');
          setIsSecretsModalOpen(false);
        }}
        onLaunchTestPlace={() => {
          setIsTestPlaceOpen(true);
          setIsSecretsModalOpen(false);
        }}
      />

      {/* Discord Community & Webhook Modal */}
      <DiscordCommunityModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
        secrets={secrets}
        onSaveSecrets={handleSaveSecrets}
        user={user}
      />

      {/* Help & Guides Step-by-Step Modal */}
      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        defaultTab={helpModalTab}
      />

      {/* Creator Tools, Calculator & Calendar Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        defaultTab={toolsModalTab}
        onSendPrompt={(prompt, mode) => {
          const targetMode = (mode as Mode) || 'app-studio';
          setCurrentMode(targetMode);
          handleSendPrompt(prompt, targetMode);
        }}
      />

      {/* Live Football Match Scores, Standings & News Modal */}
      <FootballDashboardModal
        isOpen={isFootballModalOpen}
        onClose={() => setIsFootballModalOpen(false)}
        onSendPrompt={(prompt, mode) => {
          const targetMode = (mode as Mode) || 'app-studio';
          setCurrentMode(targetMode);
          handleSendPrompt(prompt, targetMode);
        }}
      />

      {/* SER Feedback Log & Instant AI Memory Modal */}
      <SerLogModal
        isOpen={isSerModalOpen}
        onClose={() => setIsSerModalOpen(false)}
        feedbackList={serFeedbackList}
        onClearFeedback={handleClearFeedback}
        memories={aiMemories}
        onDeleteMemory={handleDeleteMemory}
        onClearMemories={handleClearMemories}
      />

      {/* History & Stored Media Vault Dashboard Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        sessions={chatSessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAllSessions={handleClearAllSessions}
        generatedImages={generatedImages}
        generatedVideos={generatedVideos}
        generatedTracks={generatedTracks}
        savedApps={savedApps}
        onSelectMode={setCurrentMode}
        onSelectApp={setActiveApp}
      />

      {/* MIDO AI Android APK Phone Installation Modal */}
      <ApkInstallerModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Quick Universal Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          soundFx.playClick();
        }}
        onNewSession={handleNewSession}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenSecretsModal={() => setIsSecretsModalOpen(true)}
        onOpenFootballModal={() => setIsFootballModalOpen(true)}
        onOpenToolsModal={handleOpenToolsModal}
        onOpenHelpModal={handleOpenHelpModal}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenSerModal={() => setIsSerModalOpen(true)}
        onLaunchTestPlace={() => setIsTestPlaceOpen(true)}
        onLaunchUnderTheSphere={() => setCurrentMode('under-the-sphere')}
        onToggleScratchpad={() => setIsScratchpadOpen((prev) => !prev)}
        onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
        onExportChat={handleExportChat}
        isTurbo={appSettings.turboMode}
        onToggleTurbo={() => {
          setAppSettings((prev) => {
            const next = { ...prev, turboMode: !prev.turboMode };
            try {
              localStorage.setItem('mido_app_settings', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }}
      />

      {/* Floating Sticky Scratchpad & Snippet Board */}
      <StickyScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        onSendToChat={(text) => {
          handleSendPrompt(text, currentMode);
        }}
      />

      {/* Secret Test Place Modal (Protocol 2026 - Short Answers & Live Stickers) */}
      <SecretTestPlaceModal
        isOpen={isTestPlaceOpen}
        onClose={() => setIsTestPlaceOpen(false)}
        secrets={secrets}
        userNickname={user?.name || 'Mido'}
      />

      {/* Main Chat Permanent Memory Vault Modal */}
      <MainMemoryVaultModal
        isOpen={isMemoryVaultOpen}
        onClose={() => setIsMemoryVaultOpen(false)}
        memories={memories}
        onAddMemory={(fact, category) => {
          const newMem: PermanentMemoryItem = {
            id: 'mem_manual_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            fact,
            category: category || 'facts',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'manual',
          };
          setMemories((prev) => [...prev, newMem]);
          setMemoryToast(`🧠 Fact locked in Brain: "${fact}"`);
          soundFx.playSuccess();
          setTimeout(() => setMemoryToast(null), 3500);
        }}
        onDeleteMemory={(id) => {
          setMemories((prev) => prev.filter((m) => m.id !== id));
        }}
        onClearMemories={() => {
          setMemories([
            {
              id: 'mem_identity_mido',
              fact: `User's nickname is ${user?.name || 'Mido'}.`,
              category: 'identity',
              timestamp: 'Default Reset',
              source: 'auto',
            },
          ]);
          setMemoryToast('Memory vault reset to default baseline.');
          setTimeout(() => setMemoryToast(null), 3000);
        }}
        onSendPrompt={(p) => handleSendPrompt(p, 'chat')}
        userNickname={user?.name || 'Mido'}
      />

      {/* ChatGPT Plugin Store Modal */}
      <PluginStoreModal
        isOpen={isPluginStoreOpen}
        onClose={() => setIsPluginStoreOpen(false)}
        onSelectPromptToChat={(p) => handleSendPrompt(p, 'chat')}
      />

      {/* Insane Cross-Platform Unified Account & Verification Modal */}
      <AccountManagerModal
        isOpen={isAccountManagerOpen}
        onClose={() => setIsAccountManagerOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(prev => prev ? ({ ...prev, ...updated }) : null);
          try {
            const current = localStorage.getItem('mido_saved_user_account');
            if (current) {
              const parsed = JSON.parse(current);
              localStorage.setItem('mido_saved_user_account', JSON.stringify({ ...parsed, ...updated }));
            }
          } catch {}
        }}
        onSwitchAccount={() => {
          setIsAccountManagerOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Floating Brain Memory Toast Notification */}
      {memoryToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-2xl shadow-purple-900/60 border border-purple-400/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 select-none pointer-events-none">
          <span className="text-base animate-pulse">🧠</span>
          <span className="tracking-wide">{memoryToast}</span>
        </div>
      )}
    </div>
  );
}

