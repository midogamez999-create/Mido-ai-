import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, AppSettings } from '../types';
import {
  Smile,
  Send,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Bell,
  RotateCcw,
  Dice5,
  Image as ImageIcon,
  MessageCircle,
  Clock,
  CheckCheck,
  ChevronDown,
  User,
  Coffee,
  Heart,
  Bot,
  Sliders,
  Pause,
  Play,
  RefreshCw,
  Zap,
  Settings,
  X,
  Check,
  Radio,
  Timer,
  Activity,
  Award,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Headphones,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import { speechManager } from '../lib/speechManager';

export interface HumorisVoiceNote {
  durationSeconds: number;
  audioUrl?: string;
  transcript: string;
}

export interface HumorisMessage {
  id: string;
  sender: 'friend' | 'user';
  text: string;
  timestamp: string;
  reactionEmoji?: string;
  memeUrl?: string;
  voiceNote?: HumorisVoiceNote;
  userReactions?: string[];
}

export interface HumorisPersona {
  id: 'alex' | 'maya' | 'sam' | 'leo';
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  color: string;
  currentActivity: string;
  level: number;
  xp: number;
  voicePitch: number;
  voiceRate: number;
  description: string;
  initialGreetings: string[];
  followUpNudges: string[];
  topics: string[];
  roasts: string[];
}

export type ChatFrequencyMode = 'rapid' | 'fast' | 'normal' | 'chill' | 'gentle' | 'hourly' | 'custom' | 'off';
export type CheckInStyle = 'all' | 'checkin' | 'debate' | 'food' | 'spontaneous' | 'nudge';

const PERSONAS: Record<string, HumorisPersona> = {
  alex: {
    id: 'alex',
    name: 'Alex',
    title: 'Your Chill Best Bro 🤙',
    tagline: 'Loyal gamer, roasts you with love, shares daily stories',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    color: 'from-amber-500 to-orange-600',
    currentActivity: 'Playing Valorant on Discord 🎮',
    level: 9,
    xp: 85,
    voicePitch: 1.0,
    voiceRate: 1.05,
    description: 'Loyal buddy, laughs at everything, shares daily stories, talks with zero filter.',
    initialGreetings: [
      `Yo! What's good? How was your day today?`,
      `Bro you won't believe what just happened to me today 😂`,
      `Quick debate bro: Messi or Ronaldo right now? No thinking just answer.`,
      `Hey! Finally you're here. I was getting bored over here.`,
      `Yo, if you had to eat only ONE meal for the rest of your life, what are you picking?`
    ],
    followUpNudges: [
      `Bro? You really left me on read?? 😭`,
      `Helloooo? Did you drop your phone in the toilet or something? 😂`,
      `Wait did you actually fall asleep already?!`,
      `Bro the disrespect of leaving me on delivered is unmatched 💀`,
      `Alright fine, ignore me! I was gonna tell you some crazy news though 👀`
    ],
    topics: [
      'Who is the greatest superhero of all time?',
      'Is cereal technically a cold soup or a breakfast stew?',
      'If aliens landed right now, who do we send to greet them?'
    ],
    roasts: [
      `Bro your screen time is probably 14 hours today, go touch some grass! 😂`,
      `You type like someone using one index finger on an iPad 💀`,
      `Bro woke up and chose to ghost their best friend, tragic.`
    ]
  },
  maya: {
    id: 'maya',
    name: 'Maya',
    title: 'Hype Bestie & Tea Spiller ✨',
    tagline: '10/10 banter, meme queen, gossip narrator, always in your corner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    color: 'from-pink-500 to-purple-600',
    currentActivity: 'Listening to SZA on Spotify 🎧',
    level: 11,
    xp: 92,
    voicePitch: 1.15,
    voiceRate: 1.1,
    description: 'High energy, meme enthusiast, drama narrator, always in your corner.',
    initialGreetings: [
      `BESTIE!! OMG I have so much tea to spill you have no idea 💅`,
      `Heeey! Tell me something exciting that happened today, I need details!`,
      `Wait before you say anything, please tell me you saw that viral meme today?! 😭`,
      `Yo queen/king! How are you holding up today?`
    ],
    followUpNudges: [
      `Umm hello?? Don't leave me hanging like this! 💀`,
      `Excuse me?! Left on read?! In this economy?! 💅`,
      `Bestie are you alive or did you get abducted by aliens?! 😂`
    ],
    topics: [
      'What is your ultimate guilty pleasure song?',
      'Pineapple on pizza: crime against humanity or delicious art?',
      'What is the cringiest thing you did in middle school?'
    ],
    roasts: [
      `Bestie I know you saw this notification, stop fronting! 💅`,
      `You have the attention span of a goldfish with WiFi issues 😭`
    ]
  },
  sam: {
    id: 'sam',
    name: 'Sam',
    title: 'Sarcastic Roommate ☕',
    tagline: 'Dry wit, playful roaster, complains about life, secretly cares deeply',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    color: 'from-blue-500 to-indigo-600',
    currentActivity: 'Drinking 4th iced coffee ☕',
    level: 8,
    xp: 70,
    voicePitch: 0.95,
    voiceRate: 0.98,
    description: 'Dry wit, playful roaster, complains about everything, secretly cares deeply.',
    initialGreetings: [
      `Oh look who decided to show up. What's up?`,
      `I've been staring at the ceiling for 40 minutes. Entertain me.`,
      `Question: why is waking up before noon a crime against nature?`,
      `Sup. What minor inconvenience annoyed you the most today?`
    ],
    followUpNudges: [
      `Wow. The silence is deafening. Truly profound.`,
      `Did your hands stop working or are you just ghosting me for fun?`,
      `I see how it is. Adding this to my list of grievances 📝`
    ],
    topics: [
      'Why do meetings exist when an email could do the job?',
      'What is the most overrated food on planet earth?',
      'If you could ban one annoying sound forever, what is it?'
    ],
    roasts: [
      `I would roast you, but life seems to be doing that already.`,
      `Your reply speed is slower than Windows Vista updating on dial-up.`
    ]
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    title: '3AM Galaxy Brain 🌌',
    tagline: 'Late night philosopher, hypothetical dilemma creator, deep conversationalist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    color: 'from-violet-600 to-cyan-600',
    currentActivity: 'Watching cosmos documentaries 🔭',
    level: 10,
    xp: 88,
    voicePitch: 0.92,
    voiceRate: 1.0,
    description: 'Late night philosopher, hypothetical dilemma creator, deep conversationalist.',
    initialGreetings: [
      `Yo... have you ever stopped to think about how insane the universe really is?`,
      `Late night thought: do you think animals have accents when they talk? 🐕`,
      `Sup. If you could see 50 years into the future for 10 seconds, what would you look at?`,
      `Hey! What's one thing you want to achieve before the year ends?`
    ],
    followUpNudges: [
      `Lost in the simulation already? Wake up! 👁️`,
      `Don't tell me you fell down a YouTube rabbit hole bro 😂`,
      `The universe is waiting for your reply, no pressure.`
    ],
    topics: [
      'Are we living in a cosmic computer simulation?',
      'Would you rather know when you die or how you die?',
      'If time travel were invented, where is your first destination?'
    ],
    roasts: [
      `You're overthinking so hard I can hear the gears grinding through the screen.`,
      `Bro fell asleep in the middle of our simulation debate.`
    ]
  }
};

const MEME_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=600&q=80', caption: 'Literally us trying to understand life on a Monday morning 😂' },
  { url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80', caption: 'Bro look at this cat judging everyone in the room 💀' },
  { url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600&q=80', caption: 'Me after doing one productive thing all week 🐶' },
  { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80', caption: 'When someone tells me to calm down during a FIFA match 🎮' }
];

const EMOJI_REACTIONS = ['🔥', '💀', '😭', '💯', '❤️', '👏', '👀'];

interface HumorisViewProps {
  user: UserAccount | null;
  appSettings: AppSettings;
  onUpdateAppSettings?: (settings: AppSettings) => void;
}

export const HumorisView: React.FC<HumorisViewProps> = ({
  user,
  appSettings,
  onUpdateAppSettings
}) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<'alex' | 'maya' | 'sam' | 'leo'>(
    appSettings.humorisPersona || 'alex'
  );
  const persona = PERSONAS[selectedPersonaId] || PERSONAS.alex;

  const [messages, setMessages] = useState<HumorisMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`mido_humoris_msgs_v2_${selectedPersonaId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState<string>('Active now 🟢');
  const [streakDays, setStreakDays] = useState(5);
  const [playingVoiceNoteId, setPlayingVoiceNoteId] = useState<string | null>(null);

  // Simulated Voice Call State
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Background Scheduler & Frequency
  const [chatFrequency, setChatFrequency] = useState<ChatFrequencyMode>(
    (appSettings.humorisChatFrequency as ChatFrequencyMode) || 'fast'
  );
  const [isSchedulerPaused, setIsSchedulerPaused] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [autoVoice, setAutoVoice] = useState(appSettings.humorisAutoVoice ?? false);
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMsgTimeRef = useRef<number>(Date.now());
  const schedulerTimerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    try {
      localStorage.setItem(`mido_humoris_msgs_v2_${selectedPersonaId}`, JSON.stringify(messages));
    } catch {}
  }, [messages, selectedPersonaId]);

  // Handle Switch Persona
  const handleSwitchPersona = (id: 'alex' | 'maya' | 'sam' | 'leo') => {
    soundFx.playClick();
    setSelectedPersonaId(id);
    try {
      const saved = localStorage.getItem(`mido_humoris_msgs_v2_${id}`);
      setMessages(saved ? JSON.parse(saved) : []);
    } catch {
      setMessages([]);
    }
  };

  // 1. Initial Greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      const initTimer = setTimeout(() => {
        setIsTyping(true);
        setTypingStatus(`${persona.name} is typing... ✍️`);
        setTimeout(() => {
          const greetings = persona.initialGreetings;
          const greetingText = greetings[Math.floor(Math.random() * greetings.length)];
          const newMsg: HumorisMessage = {
            id: `msg_${Date.now()}`,
            sender: 'friend',
            text: greetingText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([newMsg]);
          setIsTyping(false);
          setTypingStatus('Active now 🟢');
          soundFx.playReceived();
          if (autoVoice) {
            speechManager.speak(greetingText, newMsg.id);
          }
        }, 1100);
      }, 600);

      return () => clearTimeout(initTimer);
    }
  }, [selectedPersonaId, messages.length]);

  // 2. Background Scheduler Countdown
  useEffect(() => {
    if (chatFrequency === 'off' || isSchedulerPaused) return;

    const intervalSec = chatFrequency === 'rapid' ? 15 : chatFrequency === 'fast' ? 30 : chatFrequency === 'normal' ? 60 : 180;
    setCountdownSeconds(intervalSec);

    schedulerTimerRef.current = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          triggerFriendCheckIn();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(schedulerTimerRef.current);
  }, [chatFrequency, isSchedulerPaused, selectedPersonaId]);

  // Voice Call Timer
  useEffect(() => {
    if (isInCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(callTimerRef.current);
  }, [isInCall]);

  const triggerFriendCheckIn = async (type?: string) => {
    if (isTyping) return;
    const categories = ['banter', 'hot_take', 'gaming', 'roast', 'start'];
    const chosenType = type || categories[Math.floor(Math.random() * categories.length)];
    setIsTyping(true);
    setTypingStatus(`${persona.name} is texting you... 💬`);

    try {
      const res = await fetch('/api/humoris/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona.id,
          userName: user?.nickname || user?.name || 'bro',
          type: chosenType
        })
      });
      const data = await res.json();
      const text = data.message || persona.followUpNudges[Math.floor(Math.random() * persona.followUpNudges.length)];

      setTimeout(() => {
        const newMsg: HumorisMessage = {
          id: `checkin_${Date.now()}`,
          sender: 'friend',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactionEmoji: '👀'
        };
        setMessages(prev => [...prev, newMsg]);
        setIsTyping(false);
        setTypingStatus('Active now 🟢');
        soundFx.playNotification();
        if (autoVoice) {
          speechManager.speak(text, newMsg.id);
        }
      }, 900);
    } catch {
      setIsTyping(false);
      setTypingStatus('Active now 🟢');
    }
  };

  // Send Message from User
  const handleSendMessage = async (e?: React.FormEvent, customUserText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customUserText || inputText).trim();
    if (!textToSend) return;

    setInputText('');
    lastUserMsgTimeRef.current = Date.now();

    const userMsg: HumorisMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    soundFx.playSent();

    setIsTyping(true);
    setTypingStatus(`${persona.name} is typing... ✍️`);

    try {
      const historyPayload = messages.slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/humoris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          persona: persona.id,
          userName: user?.nickname || user?.name || 'bro'
        })
      });

      const data = await res.json();
      const reply = data.reply || "bro no way 😂 wait what did you just say?";
      const delay = Math.min(Math.max(reply.length * 16, 700), 1800);

      setTimeout(() => {
        const friendMsg: HumorisMessage = {
          id: `friend_${Date.now()}`,
          sender: 'friend',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, friendMsg]);
        setIsTyping(false);
        setTypingStatus('Active now 🟢');
        soundFx.playReceived();

        if (autoVoice) {
          speechManager.speak(reply, friendMsg.id);
        }
      }, delay);
    } catch {
      setIsTyping(false);
      setTypingStatus('Active now 🟢');
    }
  };

  // Send Voice Note from Friend
  const handleSendVoiceNote = () => {
    soundFx.playClick();
    setIsTyping(true);
    setTypingStatus(`${persona.name} is recording a voice note... 🎙️`);

    const voiceNoteTexts = [
      `Yo bro, I'm literally driving right now so I can't type, but you gotta hear this... basically everything happened just like I predicted haha!`,
      `Listen to this: I just tasted the best burger in my entire life. I need you to drop whatever you're doing and meet me here right now bro!`,
      `Wait wait wait, did you see what just happened in the game?? Bro I lost my voice screaming at the TV 💀`,
      `Hey! Just sending a quick voice note to make sure you're alive. Call me when you wake up!`
    ];
    const text = voiceNoteTexts[Math.floor(Math.random() * voiceNoteTexts.length)];

    setTimeout(() => {
      const msg: HumorisMessage = {
        id: `vn_${Date.now()}`,
        sender: 'friend',
        text: `🎙️ Voice Note (${Math.floor(text.length / 10)}s)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voiceNote: {
          durationSeconds: Math.floor(text.length / 10),
          transcript: text
        }
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      setTypingStatus('Active now 🟢');
      soundFx.playNotification();

      // Automatically play voice
      playVoiceNote(msg.id, text);
    }, 1200);
  };

  const playVoiceNote = (id: string, transcript: string) => {
    if (playingVoiceNoteId === id) {
      speechManager.stop();
      setPlayingVoiceNoteId(null);
    } else {
      speechManager.stop();
      setPlayingVoiceNoteId(id);
      speechManager.speak(transcript, id, {
        onEnd: () => setPlayingVoiceNoteId(null)
      });
    }
  };

  // Add Emoji Reaction to a message
  const handleAddReaction = (msgId: string, emoji: string) => {
    soundFx.playClick();
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId) {
          const reactions = m.userReactions || [];
          const exists = reactions.includes(emoji);
          return {
            ...m,
            userReactions: exists
              ? reactions.filter(r => r !== emoji)
              : [...reactions, emoji]
          };
        }
        return m;
      })
    );
  };

  // Roast Me Button
  const handleRoastMe = () => {
    soundFx.playClick();
    const roast = persona.roasts[Math.floor(Math.random() * persona.roasts.length)];
    setIsTyping(true);
    setTypingStatus(`${persona.name} is cooking up a roast... 🔥`);

    setTimeout(() => {
      const msg: HumorisMessage = {
        id: `roast_${Date.now()}`,
        sender: 'friend',
        text: `🔥 Roast incoming: ${roast}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactionEmoji: '💀'
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      setTypingStatus('Active now 🟢');
      soundFx.playReceived();
      if (autoVoice) {
        speechManager.speak(roast, msg.id);
      }
    }, 900);
  };

  // Send Meme
  const handleSendMeme = () => {
    soundFx.playClick();
    setIsTyping(true);
    setTypingStatus(`${persona.name} is sending a meme... 🖼️`);
    const meme = MEME_PHOTOS[Math.floor(Math.random() * MEME_PHOTOS.length)];

    setTimeout(() => {
      const msg: HumorisMessage = {
        id: `meme_${Date.now()}`,
        sender: 'friend',
        text: meme.caption,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memeUrl: meme.url,
        reactionEmoji: '😭'
      };
      setMessages(prev => [...prev, msg]);
      setIsTyping(false);
      setTypingStatus('Active now 🟢');
      soundFx.playReceived();
      if (autoVoice) {
        speechManager.speak(meme.caption, msg.id);
      }
    }, 900);
  };

  // Toggle Simulated Phone Call
  const toggleVoiceCall = () => {
    soundFx.playClick();
    if (!isInCall) {
      setIsInCall(true);
      soundFx.playSuccess();
      speechManager.speak(`Yo ${user?.name || 'bro'}! I'm on the phone right now, what's up?`, 'call_greeting');
    } else {
      setIsInCall(false);
      speechManager.stop();
      soundFx.playClick();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative overflow-hidden select-none font-sans">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP HEADER: LUXURY MESSENGER BAR */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-slate-900/90 backdrop-blur-2xl border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar with glowing ring */}
          <div className="relative">
            <img
              src={persona.avatar}
              alt={persona.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/60 shadow-xl shadow-amber-500/20"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wide">{persona.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold">
                Level {persona.level} ⭐
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span>{persona.currentActivity}</span>
            </p>
          </div>
        </div>

        {/* Action Controls: Voice Call, Streak, Voice Aloud, Frequency Settings */}
        <div className="flex items-center gap-2">
          {/* Simulated Voice Call Button */}
          <button
            onClick={toggleVoiceCall}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isInCall
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
            }`}
            title={isInCall ? 'End Call' : 'Call Friend (Voice Simulation)'}
          >
            {isInCall ? <PhoneOff className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            <span>{isInCall ? formatTime(callDuration) : 'Call'}</span>
          </button>

          {/* Friendship Streak */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            <span>{streakDays} Days</span>
          </div>

          {/* Voice Aloud Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setAutoVoice(!autoVoice);
            }}
            className={`p-2 rounded-xl border transition-all ${
              autoVoice
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={autoVoice ? 'Voice Aloud Enabled' : 'Voice Aloud Muted'}
          >
            {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Chat Frequency Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsFrequencyModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
            title="Chat Frequency & Scheduler Settings"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-mono">{countdownSeconds}s</span>
          </button>

          {/* Clear chat */}
          <button
            onClick={() => {
              if (confirm(`Reset chat with ${persona.name}?`)) {
                setMessages([]);
                localStorage.removeItem(`mido_humoris_msgs_v2_${selectedPersonaId}`);
              }
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="Clear Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER: PERSONA SWITCHER */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2 bg-slate-950/80 backdrop-blur-md border-b border-white/5 text-xs overflow-x-auto gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Friends:</span>
          {(Object.keys(PERSONAS) as Array<'alex' | 'maya' | 'sam' | 'leo'>).map(pId => {
            const p = PERSONAS[pId];
            const isSelected = selectedPersonaId === pId;
            return (
              <button
                key={pId}
                onClick={() => handleSwitchPersona(pId)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-500/25 border border-amber-500/50 text-white shadow-md'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Voice Note & Roast Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            onClick={handleSendVoiceNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all"
            title="Ask friend to send a voice note"
          >
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>Voice Note 🎙️</span>
          </button>

          <button
            onClick={handleRoastMe}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold transition-all"
            title="Ask friend to roast you"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Roast Me 🔥</span>
          </button>
        </div>
      </div>

      {/* 3. MESSAGES STREAM */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Welcome card */}
        <div className="max-w-md mx-auto p-4 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-2 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl shadow-lg">
            🎭
          </div>
          <h3 className="text-sm font-black text-white">{persona.name} · {persona.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{persona.tagline}</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => handleSendMessage(undefined, 'Tell me the craziest news today')}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              Spill The Tea ☕
            </button>
            <button
              onClick={handleSendMeme}
              className="px-3 py-1 rounded-xl bg-pink-500/20 border border-pink-500/30 text-xs font-semibold text-pink-300 hover:text-white transition-all"
            >
              Send Meme 🖼️
            </button>
          </div>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isFriend = msg.sender === 'friend';
          return (
            <div
              key={msg.id || index}
              className={`flex items-end gap-2.5 ${isFriend ? 'justify-start' : 'justify-end'} animate-fadeIn group`}
            >
              {isFriend && (
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 shrink-0 shadow-md mb-1"
                />
              )}

              <div className="max-w-[85%] sm:max-w-md space-y-1">
                {/* Meme image */}
                {msg.memeUrl && (
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-1.5">
                    <img src={msg.memeUrl} alt="Meme" className="w-full max-h-64 object-cover" />
                  </div>
                )}

                {/* Voice Note Player Widget */}
                {msg.voiceNote ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playVoiceNote(msg.id, msg.voiceNote!.transcript)}
                          className="w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
                        >
                          {playingVoiceNoteId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <div>
                          <span className="text-xs font-bold text-white block">Voice Memo</span>
                          <span className="text-[10px] text-purple-300 font-mono">
                            {formatTime(msg.voiceNote.durationSeconds)} · Tap to play
                          </span>
                        </div>
                      </div>

                      {/* Animated Waveform Bars */}
                      <div className="flex items-center gap-0.5 h-6 px-2">
                        {[12, 24, 16, 28, 20, 14, 26, 18, 10, 22].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${h}px` }}
                            className={`w-1 rounded-full transition-all ${
                              playingVoiceNoteId === msg.id
                                ? 'bg-purple-400 animate-pulse'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 italic pt-1 border-t border-white/5">
                      "{msg.voiceNote.transcript}"
                    </p>
                  </div>
                ) : (
                  /* Standard text bubble */
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isFriend
                        ? 'bg-slate-900 border border-white/10 text-slate-100 rounded-bl-sm'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-semibold rounded-br-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                )}

                {/* Timestamp & Reactions drawer */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    isFriend ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {/* Active user reactions */}
                  {msg.userReactions && msg.userReactions.map((emoji, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => handleAddReaction(msg.id, emoji)}
                    >
                      {emoji}
                    </span>
                  ))}

                  {/* Reaction trigger popover on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-900 border border-white/10 rounded-full px-1 py-0.5 ml-1">
                    {EMOJI_REACTIONS.slice(0, 4).map(e => (
                      <button
                        key={e}
                        onClick={() => handleAddReaction(msg.id, e)}
                        className="hover:scale-125 transition-transform px-0.5"
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  {!isFriend && <CheckCheck className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2.5 animate-fadeIn">
            <img
              src={persona.avatar}
              alt={persona.name}
              className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 shrink-0 shadow-md"
            />
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK CONVERSATION CHIPS */}
      <div className="relative z-10 px-4 py-2 bg-slate-950/80 backdrop-blur-md flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
        <button
          onClick={() => handleSendMessage(undefined, "Sue me but I have a controversial opinion: pineapple belongs on pizza and gaming is way better than movies. What's your honest take? 😂")}
          className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold text-amber-300 shrink-0 transition-all hover:text-white"
        >
          Sue Me / Debate Me ⚖️
        </button>
        <button
          onClick={() => handleSendMessage(undefined, "Real question for you bro: explain how human eyes see different colors and why the sky is blue like an intelligent friend.")}
          className="px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-[11px] font-bold text-cyan-300 shrink-0 transition-all hover:text-white"
        >
          Answer Real Question 🧠
        </button>
        <button
          onClick={() => handleSendMessage(undefined, 'Messi or Ronaldo? Give me your honest unfiltered take.')}
          className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 shrink-0 transition-all hover:text-white"
        >
          Messi vs Ronaldo? ⚽
        </button>
        <button
          onClick={handleRoastMe}
          className="px-3 py-1 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-[11px] font-bold text-red-300 shrink-0 transition-all"
        >
          Roast Me 🔥
        </button>
        <button
          onClick={handleSendVoiceNote}
          className="px-3 py-1 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] text-purple-300 shrink-0 transition-all"
        >
          Send Voice Note 🎙️
        </button>
        <button
          onClick={handleSendMeme}
          className="px-3 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-[11px] text-pink-300 shrink-0 transition-all"
        >
          Drop A Meme 🖼️
        </button>
      </div>

      {/* 5. BOTTOM INPUT BAR */}
      <div className="relative z-10 p-3 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Message ${persona.name} (he talks like your real human friend)...`}
            className="flex-1 px-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3 rounded-2xl transition-all shadow-lg ${
              inputText.trim()
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/30 font-bold'
                : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* CHAT FREQUENCY SETTINGS MODAL */}
      {isFrequencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/15 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Chat Frequency Settings</h3>
              </div>
              <button
                onClick={() => setIsFrequencyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Configure how often {persona.name} spontaneously checks in on you with friendly messages:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rapid', label: 'Rapid (15s)', desc: 'Fast banter' },
                { id: 'fast', label: 'Fast (30s)', desc: 'Active buddy' },
                { id: 'normal', label: 'Normal (1m)', desc: 'Balanced pace' },
                { id: 'chill', label: 'Chill (3m)', desc: 'Relaxed companion' },
                { id: 'hourly', label: 'Hourly (1h)', desc: 'Daily check-in' },
                { id: 'off', label: 'Off / Paused', desc: 'Manual only' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundFx.playClick();
                    setChatFrequency(f.id as ChatFrequencyMode);
                    setIsFrequencyModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    chatFrequency === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold text-white">{f.label}</p>
                  <p className="text-[10px] text-slate-400">{f.desc}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsFrequencyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
