import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Zap,
  Smile,
  Trash2,
  Copy,
  Check,
  Flame,
  Bot,
  Rocket,
  Trophy,
  Crown,
  Heart,
  Volume2,
  VolumeX,
  Clock,
  RefreshCw,
  Brain,
  Plus,
  BookmarkCheck,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';

export interface SecretTestPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  secrets?: any;
  userNickname?: string;
}

export interface TestMemoryItem {
  id: string;
  fact: string;
  category: 'identity' | 'preference' | 'fact' | 'secret' | 'custom';
  timestamp: string;
  source: 'auto' | 'manual';
}

interface TestMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sticker?: string;
  isStickerOnly?: boolean;
  latencyMs?: number;
  timestamp: string;
}

// Available Normal Sticker Catalog
export interface NormalStickerDef {
  id: string;
  name: string;
  emoji: string;
  category: 'hype' | 'bot' | 'sports' | 'reactions' | 'fun';
}

export const NORMAL_STICKER_CATALOG: NormalStickerDef[] = [
  { id: 'fire', name: 'Fire', emoji: '🔥', category: 'hype' },
  { id: 'robot', name: 'Smart Bot', emoji: '🤖', category: 'bot' },
  { id: 'brain', name: 'Big Brain', emoji: '🧠', category: 'bot' },
  { id: 'zap', name: 'Zap', emoji: '⚡', category: 'hype' },
  { id: 'goat', name: 'The GOAT', emoji: '🐐', category: 'sports' },
  { id: 'crown', name: 'Crown', emoji: '👑', category: 'hype' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', category: 'hype' },
  { id: 'soccer', name: 'Soccer Ball', emoji: '⚽', category: 'sports' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', category: 'sports' },
  { id: 'cool', name: 'Sunglasses', emoji: '😎', category: 'hype' },
  { id: 'party', name: 'Party Popper', emoji: '🎉', category: 'fun' },
  { id: 'heart', name: 'Red Heart', emoji: '❤️', category: 'reactions' },
  { id: 'laugh', name: 'Laughing', emoji: '🤣', category: 'reactions' },
  { id: 'shock', name: 'Mind Blown', emoji: '😱', category: 'reactions' },
  { id: 'thumbsup', name: 'Thumbs Up', emoji: '👍', category: 'reactions' },
  { id: 'hundred', name: '100 Score', emoji: '💯', category: 'hype' },
  { id: 'gaming', name: 'Gamepad', emoji: '🎮', category: 'fun' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', category: 'fun' },
  { id: 'cat', name: 'Cat', emoji: '🐱', category: 'fun' },
  { id: 'alien', name: 'Alien', emoji: '👽', category: 'bot' },
  { id: 'target', name: 'Target', emoji: '🎯', category: 'bot' },
  { id: 'bulb', name: 'Idea Bulb', emoji: '💡', category: 'bot' },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿', category: 'fun' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', category: 'hype' },
];

export const SecretTestPlaceModal: React.FC<SecretTestPlaceModalProps> = ({
  isOpen,
  onClose,
  secrets,
  userNickname = 'Mido',
}) => {
  // 1. Persistent Memory Vault
  const [memories, setMemories] = useState<TestMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('mido_2026_memory_vault_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'mem_name',
        fact: `User's nickname is ${userNickname}`,
        category: 'identity',
        timestamp: 'Permanent Seed',
        source: 'auto',
      },
      {
        id: 'mem_code',
        fact: 'Protocol 2026 Test Place is active with permanent memory retention',
        category: 'fact',
        timestamp: 'Permanent Seed',
        source: 'auto',
      },
    ];
  });

  // 2. Chat Messages
  const [messages, setMessages] = useState<TestMessage[]>(() => {
    try {
      const saved = localStorage.getItem('mido_test_place_messages_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Secret Test Place ready! 🤖⚡ I have 200 IQ and permanent memory of everything you tell me. Test my memory or shoot a prompt! 🔥`,
        timestamp: 'Just now',
        latencyMs: 85,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStickerTrayOpen, setIsStickerTrayOpen] = useState(false);
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState(false);
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'hype' | 'bot' | 'sports' | 'reactions' | 'fun'>('all');
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [memoryToast, setMemoryToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMemoryVaultOpen]);

  // Save messages
  useEffect(() => {
    try {
      localStorage.setItem('mido_test_place_messages_v2', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // Save memories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mido_2026_memory_vault_v1', JSON.stringify(memories));
      localStorage.setItem('mido_permanent_memory_vault_v1', JSON.stringify(memories));
    } catch (e) {}
  }, [memories]);

  // Helper: Extract personal facts from user speech to never forget them
  const autoDetectAndStoreFacts = (text: string) => {
    const trimmed = text.trim();
    const newFacts: string[] = [];

    // Check patterns
    const nameMatch = /(?:my name is|call me|i am called)\s+([a-zA-Z0-9\s]+?)(?:[.!,]|$)/i.exec(trimmed);
    if (nameMatch && nameMatch[1]) {
      newFacts.push(`User's name is ${nameMatch[1].trim()}`);
    }

    const favMatch = /(?:my favorite|my fav)\s+([a-zA-Z0-9\s]+?)\s+is\s+([^.!,]+)/i.exec(trimmed);
    if (favMatch && favMatch[1] && favMatch[2]) {
      newFacts.push(`User's favorite ${favMatch[1].trim()} is ${favMatch[2].trim()}`);
    }

    const loveMatch = /(?:i love|i really like|i adore|i prefer)\s+([^.!,]+)/i.exec(trimmed);
    if (loveMatch && loveMatch[1] && !trimmed.toLowerCase().includes('favorite')) {
      newFacts.push(`User loves/prefers ${loveMatch[1].trim()}`);
    }

    const haveMatch = /(?:i have a|i have an|i own a)\s+([^.!,]+)/i.exec(trimmed);
    if (haveMatch && haveMatch[1]) {
      newFacts.push(`User has: ${haveMatch[1].trim()}`);
    }

    const liveMatch = /(?:i live in|i'm from|i am from)\s+([^.!,]+)/i.exec(trimmed);
    if (liveMatch && liveMatch[1]) {
      newFacts.push(`User lives in / is from: ${liveMatch[1].trim()}`);
    }

    const rememberMatch = /(?:remember that|remember:|don't forget that|keep in mind that)\s+([^.!?]+)/i.exec(trimmed);
    if (rememberMatch && rememberMatch[1]) {
      newFacts.push(`User note: ${rememberMatch[1].trim()}`);
    }

    const secretMatch = /(?:my secret is|secret code is|the secret is)\s+([^.!?]+)/i.exec(trimmed);
    if (secretMatch && secretMatch[1]) {
      newFacts.push(`Secret: ${secretMatch[1].trim()}`);
    }

    if (newFacts.length > 0) {
      setMemories((prev) => {
        const existingTexts = new Set(prev.map((m) => m.fact.toLowerCase()));
        const toAdd: TestMemoryItem[] = [];

        for (const fact of newFacts) {
          if (!existingTexts.has(fact.toLowerCase())) {
            toAdd.push({
              id: 'mem_' + Date.now() + Math.random().toString(36).slice(2, 6),
              fact,
              category: fact.startsWith('Secret:') ? 'secret' : 'fact',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              source: 'auto',
            });
            existingTexts.add(fact.toLowerCase());
          }
        }

        if (toAdd.length > 0) {
          setMemoryToast(`🧠 Mido permanently memorized: "${toAdd[0].fact}"`);
          setTimeout(() => setMemoryToast(null), 4000);
          return [...prev, ...toAdd];
        }
        return prev;
      });
    }
  };

  const handleAddManualMemory = () => {
    if (!newMemoryInput.trim()) return;
    const factText = newMemoryInput.trim();
    const newMem: TestMemoryItem = {
      id: 'mem_manual_' + Date.now(),
      fact: factText,
      category: 'custom',
      timestamp: 'Just now',
      source: 'manual',
    };
    setMemories((prev) => [...prev, newMem]);
    setNewMemoryInput('');
    setMemoryToast(`🧠 Added to vault: "${factText}"`);
    setTimeout(() => setMemoryToast(null), 3000);
    if (!isMuted) soundFx.playSuccess();
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (!isMuted) soundFx.playClick();
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Wipe memory vault for testing? Mido will reset to default facts.')) {
      setMemories([
        {
          id: 'mem_name',
          fact: `User's nickname is ${userNickname}`,
          category: 'identity',
          timestamp: 'Default Reset',
          source: 'auto',
        },
      ]);
      setMemoryToast('Memory vault reset to default.');
      setTimeout(() => setMemoryToast(null), 2500);
      if (!isMuted) soundFx.playClick();
    }
  };

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string, stickerEmojiToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : input;
    if (!rawText.trim() && !stickerEmojiToSend) return;

    const isStickerOnly = Boolean(stickerEmojiToSend && !rawText.trim());
    const userDisplayContent = isStickerOnly ? (stickerEmojiToSend || '🔥') : (stickerEmojiToSend ? `${rawText} ${stickerEmojiToSend}` : rawText);

    // Auto-detect facts from user's message
    if (rawText.trim()) {
      autoDetectAndStoreFacts(rawText);
    }

    const userMsg: TestMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userDisplayContent,
      sticker: stickerEmojiToSend,
      isStickerOnly,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStickerTrayOpen(false);
    setIsLoading(true);
    if (!isMuted) soundFx.playSent();

    const startTime = performance.now();

    try {
      // Build memory facts context for Mido AI
      const memoryFactsList = memories.map((m, idx) => `${idx + 1}. ${m.fact}`).join('\n');

      const systemInstruction = `You are Mido AI inside the SECRET TEST PLACE (Protocol 2026).
CRITICAL DIRECTIVES:
1. 200-IQ SUPER-INTELLIGENCE: You are razor-sharp, brilliant, and deeply knowledgeable. You instantly understand nuances, code, sports, philosophy, and questions without any confusion.
2. UNBREAKABLE PERMANENT MEMORY: You have 100% photographic, permanent memory of this user. You NEVER forget any of the following facts:
[ACTIVE PERMANENT MEMORY VAULT]:
${memoryFactsList || `1. User's nickname is ${userNickname}`}
- If the user asks what you remember, what their name is, what their favorite things are, or tests your memory on any detail, recall it instantly and accurately with 200 IQ precision!
- If the user tells you a new fact about themselves or says "remember ...", acknowledge that it's permanently locked in your brain.
3. ULTRA-SHORT & SMALL ANSWERS: Keep every answer SMALL and punchy! Maximum 1 to 2 sentences (or max 3 very brief bullet points). Never write long essays or boring filler. Get straight to the point.
4. NORMAL STICKERS: Always include 1 or 2 normal stickers (like 🔥, 🤖, ⚡, 🐐, 👑, 🚀, ⚽, 🧠, 🏆, 😎, 🎉, ❤️) naturally in your response.
5. User's name is ${userNickname}. Keep it high-energy, witty, and razor-smart.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userDisplayContent,
          memories: memories.map((m) => m.fact),
          history: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          responseVerbosity: 'ultra-quick',
          turboMode: true,
          creativityTemperature: 0.5,
          customSystemInstructions: systemInstruction,
          secrets,
        }),
      });

      const data = await res.json();
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      let replyText = data.reply || "Test ping acknowledged! ⚡ All memory systems active. 🤖";

      // If reply is purely an emoji sticker, flag it
      const isSingleSticker = /^[\p{Emoji}\s]+$/u.test(replyText.trim()) && replyText.trim().length <= 4;

      const assistantMsg: TestMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        isStickerOnly: isSingleSticker,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (!isMuted) soundFx.playReceived();
    } catch (err) {
      const assistantMsg: TestMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Network glitch in lab! ⚡ Check connection. 🤖",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: 120,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNormalSticker = (emoji: string) => {
    handleSendMessage('', emoji);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Test lab reset! ⚡ Ready for memory and prompt testing. 🤖`,
        timestamp: 'Just now',
        latencyMs: 70,
      },
    ]);
    if (!isMuted) soundFx.playClick();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    if (!isMuted) soundFx.playClick();
  };

  // Helper to render message content with normal stickers formatted cleanly
  const renderMessageContent = (msg: TestMessage) => {
    if (msg.isStickerOnly) {
      return (
        <div className="flex items-center justify-center p-2 transform hover:scale-110 transition-transform">
          <span className="text-5xl drop-shadow-md select-none animate-bounce">{msg.content}</span>
        </div>
      );
    }

    // Clean legacy [STICKER:xxx] tags into real normal stickers if present
    let cleanText = msg.content;
    cleanText = cleanText.replace(/\[STICKER:([a-z0-9_-]+)\]/gi, (_match, id) => {
      const found = NORMAL_STICKER_CATALOG.find((s) => s.id === id.toLowerCase());
      return found ? found.emoji : '✨';
    });

    return (
      <div className="leading-relaxed whitespace-pre-wrap text-sm font-medium">
        {cleanText}
      </div>
    );
  };

  const filteredStickers = activeCategory === 'all'
    ? NORMAL_STICKER_CATALOG
    : NORMAL_STICKER_CATALOG.filter((s) => s.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[780px] rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        
        {/* Memory Toast Alert */}
        {memoryToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-emerald-500/90 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <BookmarkCheck className="w-4 h-4" />
            <span>{memoryToast}</span>
          </div>
        )}

        {/* Glow Header */}
        <div className="relative px-5 py-3.5 bg-slate-900/95 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <span className="text-xl">🧪</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Secret Test Place
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest">
                  Lab 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Permanent Memory Active • Normal Stickers • Small Smart Answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Memory Vault Toggle Button */}
            <button
              onClick={() => setIsMemoryVaultOpen(!isMemoryVaultOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isMemoryVaultOpen
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/90 text-emerald-400 border-emerald-500/30 hover:bg-slate-800'
              }`}
              title="Open Memory Vault"
            >
              <Brain className="w-4 h-4" />
              <span>Memory ({memories.length})</span>
              {isMemoryVaultOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title="Reset Test Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Test Place"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide-Down Memory Vault Panel */}
        {isMemoryVaultOpen && (
          <div className="shrink-0 bg-slate-900 border-b border-emerald-500/30 p-4 max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Permanent Memory Vault (Never Forgets)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {memories.length} Facts Saved
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendMessage('What do you remember about me? Test your memory!')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  Test Recall Now
                </button>
                <button
                  onClick={handleClearAllMemories}
                  className="p-1 text-slate-400 hover:text-rose-400 text-xs"
                  title="Wipe Memory Vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Mido automatically memorizes facts you mention (name, favorites, details, secrets) and stores them permanently across reloads.
            </p>

            {/* List of active memories */}
            <div className="space-y-1.5 mb-3">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs group"
                >
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className="text-emerald-400">🧠</span>
                    <span className="font-semibold">{mem.fact}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Forget Fact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Manual Fact Input */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <input
                type="text"
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManualMemory()}
                placeholder="Teach Mido a new fact (e.g. My favorite team is Real Madrid)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={handleAddManualMemory}
                disabled={!newMemoryInput.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Fact</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Test Chips Bar */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Quick Tests:
          </span>
          <button
            onClick={() => handleSendMessage('What do you remember about me? List everything you know!')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all whitespace-nowrap flex items-center gap-1"
          >
            🧠 Test Memory
          </button>
          <button
            onClick={() => handleSendMessage('Remember this: My secret project code is CyberSphere 2026.')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-cyan-500/40 transition-all whitespace-nowrap"
          >
            🔒 Teach Secret
          </button>
          <button
            onClick={() => handleSendMessage('Give me a 200 IQ quick philosophical paradox in 1 sentence!')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-purple-500/40 transition-all whitespace-nowrap"
          >
            💡 200 IQ Paradox
          </button>
          <button
            onClick={() => handleSendMessage('Messi or Ronaldo in 5 words?')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-emerald-500/40 transition-all whitespace-nowrap"
          >
            ⚽ GOAT Take
          </button>
          <button
            onClick={() => handleSendMessage('Give me 3 normal stickers for how you feel right now!')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-pink-500/40 transition-all whitespace-nowrap"
          >
            🔥 Sticker Mood
          </button>
        </div>

        {/* Chat Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 select-text">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-500">
                  {msg.role === 'user' ? userNickname : 'Mido AI (2026 Test)'}
                </span>
                <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                {msg.latencyMs !== undefined && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-md">
                    ⚡ {msg.latencyMs}ms
                  </span>
                )}
              </div>

              <div
                className={`relative max-w-[85%] sm:max-w-[78%] px-4 py-3 rounded-2xl shadow-lg transition-all ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-none'
                }`}
              >
                {renderMessageContent(msg)}

                {/* Floating Copy Button */}
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
                  title="Copy Message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Mido AI 200-IQ is recalling memory and crafting small answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Normal Sticker Tray Drawer */}
        {isStickerTrayOpen && (
          <div className="shrink-0 p-3 bg-slate-900/98 border-t border-cyan-500/30 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-400" /> Tap Any Normal Sticker to Send
              </span>
              <div className="flex items-center gap-1">
                {(['all', 'hype', 'bot', 'sports', 'reactions', 'fun'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                      activeCategory === cat
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
              {filteredStickers.map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => handleSendNormalSticker(stk.emoji)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-white/10 hover:border-cyan-400/50 hover:scale-110 active:scale-95 transition-all group"
                  title={stk.name}
                >
                  <span className="text-3xl drop-shadow-md select-none group-hover:animate-bounce">
                    {stk.emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setIsStickerTrayOpen(!isStickerTrayOpen)}
              className={`p-2.5 rounded-xl border transition-all ${
                isStickerTrayOpen
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Open Normal Stickers"
            >
              <Smile className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me a fact to remember or test my 200 IQ memory..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 transition-all"
              title="Send to Test Place"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
