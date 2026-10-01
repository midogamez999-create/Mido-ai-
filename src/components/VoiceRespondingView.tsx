import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserSecrets, Mode, UserAccount } from '../types';
import { soundFx } from '../lib/soundFx';
import { speechManager } from '../lib/speechManager';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Globe,
  Radio,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Sliders,
  Play,
  Square,
  MessageSquare,
  ArrowRight,
  Headphones,
  RotateCcw,
  Compass,
  Flame,
  Search,
} from 'lucide-react';

interface VoiceTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audioUrl?: string | null;
  voiceName?: string;
  timestamp: string;
}

interface VoiceRespondingViewProps {
  user: UserAccount | null;
  secrets?: UserSecrets;
  onSelectMode?: (mode: Mode) => void;
  onSendPromptToChat?: (prompt: string) => void;
}

export const VoiceRespondingView: React.FC<VoiceRespondingViewProps> = ({
  user,
  secrets,
  onSelectMode,
  onSendPromptToChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversation, setConversation] = useState<VoiceTurn[]>([
    {
      id: 'init_welcome',
      role: 'assistant',
      text: "Hey there! I am Mido AI in Voice Responding Mode. Tap the microphone or speak anytime, and I'll answer you with my voice!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Voice Settings
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir'>('Zephyr');
  const [voiceTone, setVoiceTone] = useState<'conversational' | 'concise' | 'deep' | 'storyteller'>('conversational');
  const [useSearch, setUseSearch] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Context & Canvas Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const voicePersonas = [
    { id: 'Zephyr', name: 'Zephyr', desc: 'Warm & Friendly (Default)', tag: 'Balanced', color: 'from-cyan-500 to-blue-500' },
    { id: 'Puck', name: 'Puck', desc: 'Energetic & Fun', tag: 'Fast', color: 'from-amber-500 to-orange-500' },
    { id: 'Charon', name: 'Charon', desc: 'Deep & Cinematic', tag: 'Authoritative', color: 'from-purple-500 to-indigo-500' },
    { id: 'Kore', name: 'Kore', desc: 'Gentle & Soothing', tag: 'Calm', color: 'from-pink-500 to-rose-500' },
    { id: 'Fenrir', name: 'Fenrir', desc: 'Bold & Confident', tag: 'Punchy', color: 'from-emerald-500 to-teal-500' },
  ];

  const suggestedStarters = [
    { text: "What's the latest tech and world news today?", icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> },
    { text: "Explain quantum computers in simple terms", icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { text: "Give me 3 insane viral ideas for an AI app", icon: <Flame className="w-3.5 h-3.5 text-rose-400" /> },
    { text: "Who is leading the Champions League and what are the top scores?", icon: <Compass className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  // Visualizer Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      phase += 0.04;

      // Base circle radius
      let radius = 65;
      let glowColor = 'rgba(99, 102, 241, 0.4)';
      let coreColor = '#6366f1';
      let ringColor = 'rgba(168, 85, 247, 0.6)';

      if (isListening) {
        radius = 75 + Math.sin(phase * 3) * 8;
        glowColor = 'rgba(239, 68, 68, 0.6)';
        coreColor = '#ef4444';
        ringColor = 'rgba(249, 115, 22, 0.8)';
      } else if (isThinking) {
        radius = 65 + Math.sin(phase * 5) * 6;
        glowColor = 'rgba(234, 179, 8, 0.6)';
        coreColor = '#eab308';
        ringColor = 'rgba(168, 85, 247, 0.8)';
      } else if (isSpeaking) {
        radius = 70 + Math.sin(phase * 4) * 10;
        glowColor = 'rgba(6, 182, 212, 0.7)';
        coreColor = '#06b6d4';
        ringColor = 'rgba(59, 130, 246, 0.8)';
      }

      // 1. Ambient Background Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius * 2.2);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(0.6, glowColor.replace('0.7', '0.2').replace('0.6', '0.15').replace('0.4', '0.1'));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Multi-Layer Concentric Orbit Waves
      const wavesCount = 3;
      for (let w = 0; w < wavesCount; w++) {
        ctx.beginPath();
        const waveRadius = radius + (w + 1) * 16 + Math.sin(phase + w * 1.5) * 6;
        ctx.arc(centerX, centerY, Math.max(10, waveRadius), 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1.5 - w * 0.3;
        ctx.setLineDash([8 + w * 4, 6 + w * 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Audio Equalizer Waveform Ripples
      const bars = 28;
      const angleStep = (Math.PI * 2) / bars;
      for (let i = 0; i < bars; i++) {
        const angle = i * angleStep + (isThinking ? phase : 0);
        let barLen = 10;
        if (isSpeaking) {
          barLen = 14 + Math.sin(phase * 5 + i * 0.6) * 22;
        } else if (isListening) {
          barLen = 12 + Math.cos(phase * 4 + i * 0.8) * 18;
        } else if (isThinking) {
          barLen = 8 + Math.sin(phase * 6 + i) * 10;
        } else {
          barLen = 4 + Math.sin(phase * 1.5 + i * 0.4) * 4;
        }

        const startX = centerX + Math.cos(angle) * (radius + 2);
        const startY = centerY + Math.sin(angle) * (radius + 2);
        const endX = centerX + Math.cos(angle) * (radius + 2 + barLen);
        const endY = centerY + Math.sin(angle) * (radius + 2 + barLen);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = isSpeaking ? '#38bdf8' : isListening ? '#f87171' : isThinking ? '#fde047' : '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 4. Central Solid Glowing Core Orb
      const coreGrad = ctx.createRadialGradient(centerX - 15, centerY - 15, 5, centerX, centerY, radius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, coreColor);
      coreGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Core Highlight border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, isThinking, isSpeaking]);

  // Handle playing spoken voice audio
  const playVoiceAudio = useCallback((audioUrl: string | null | undefined, textFallback: string) => {
    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.playbackRate = speechRate;
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        if (handsFreeMode) {
          // Auto restart listening for hands-free continuous conversation
          setTimeout(() => {
            startListening();
          }, 600);
        }
      };

      audio.onerror = () => {
        console.warn('Audio playback error, falling back to browser speech');
        playBrowserSpeechFallback(textFallback);
      };

      audio.play().catch(() => {
        playBrowserSpeechFallback(textFallback);
      });
    } else {
      playBrowserSpeechFallback(textFallback);
    }
  }, [speechRate, handsFreeMode]);

  const playBrowserSpeechFallback = (text: string) => {
    setIsSpeaking(true);
    speechManager.speak(text, 'voice_response', {
      rate: speechRate,
      pitch: 1.0,
      volume: 1.0,
      onEnd: () => {
        setIsSpeaking(false);
        if (handsFreeMode) {
          setTimeout(() => {
            startListening();
          }, 600);
        }
      },
    });
  };

  const stopAllSpeech = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    speechManager.stop();
    setIsSpeaking(false);
  };

  // Submit voice prompt to Mido AI
  const submitVoicePrompt = async (promptText: string) => {
    const cleanPrompt = promptText.trim();
    if (!cleanPrompt) return;

    soundFx.playSent();
    stopAllSpeech();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userTurn: VoiceTurn = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: cleanPrompt,
      timestamp,
    };

    setConversation((prev) => [...prev, userTurn]);
    setTranscript('');
    setInterimTranscript('');
    setIsThinking(true);

    try {
      const historyPayload = conversation.map((c) => ({
        role: c.role === 'user' ? 'user' : 'assistant',
        content: c.text,
      }));

      const res = await fetch('/api/voice-responding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          history: historyPayload,
          voiceName: selectedVoice,
          useSearch,
          tone: voiceTone,
          secrets,
        }),
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.reply) {
        const assistantTurn: VoiceTurn = {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          audioUrl: data.audioUrl,
          voiceName: selectedVoice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setConversation((prev) => [...prev, assistantTurn]);
        playVoiceAudio(data.audioUrl, data.cleanSpeechText || data.reply);
      } else {
        throw new Error(data.error || 'No voice response received');
      }
    } catch (err: any) {
      setIsThinking(false);
      console.error('Voice responding error:', err);
      const errorTurn: VoiceTurn = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: `I'm having a little trouble connecting right now, but I heard you say: "${cleanPrompt}". Please try speaking again!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversation((prev) => [...prev, errorTurn]);
      playBrowserSpeechFallback(errorTurn.text);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    stopAllSpeech();
    soundFx.playVoiceStart();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }

        if (interimTrans) {
          setInterimTranscript(interimTrans);
        }
        if (finalTrans) {
          setTranscript(finalTrans);
          setIsListening(false);
          submitVoicePrompt(finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    soundFx.playVoiceEnd();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (interimTranscript.trim()) {
      submitVoicePrompt(interimTranscript);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleCopy = (text: string, id: string) => {
    soundFx.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Voice Responding Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black tracking-wider uppercase">
                  2-Way Live Voice AI
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Talk directly to Mido AI with your voice — instant answers, live Google search facts, and natural spoken speech.
              </p>
            </div>
          </div>

          {/* Quick Voice Settings Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setUseSearch(!useSearch);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                useSearch
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{useSearch ? 'Search Grounding ON' : 'Search Grounding OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setHandsFreeMode(!handsFreeMode);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                handsFreeMode
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>{handsFreeMode ? 'Hands-Free Loop ON' : 'Hands-Free Loop OFF'}</span>
            </button>

            {onSelectMode && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectMode('chat');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Text Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Side: Animated Orb & Microphone Controls */}
        <div className="w-full lg:w-5/12 flex flex-col items-center justify-between p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              {isListening
                ? '🔴 Listening to your voice...'
                : isThinking
                ? '⚡ Mido AI is reasoning...'
                : isSpeaking
                ? '🔊 Mido AI is answering aloud...'
                : '🎙️ Tap mic & ask anything'}
            </span>
          </div>

          {/* Interactive Canvas Visualizer */}
          <div className="relative flex items-center justify-center py-4">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="w-[240px] h-[240px] sm:w-[260px] sm:h-[260px] cursor-pointer transition-transform hover:scale-105"
              onClick={toggleListening}
            />

            {/* Central Floating Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-600/50 scale-110'
                  : isThinking
                  ? 'bg-amber-500 text-slate-950 animate-bounce shadow-amber-500/50'
                  : isSpeaking
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/50 scale-105'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/50 hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-9 h-9" />
              ) : isThinking ? (
                <RefreshCw className="w-9 h-9 animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-9 h-9 animate-pulse" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Interim transcript text box */}
          {(isListening || interimTranscript) && (
            <div className="w-full p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-center animate-fadeIn">
              <p className="text-xs font-semibold text-red-200">
                "{interimTranscript || 'Listening... speak clearly into microphone'}"
              </p>
            </div>
          )}

          {/* Persona & Tone Switcher */}
          <div className="w-full space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voice Persona:</span>
              </label>
              <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase">
                {selectedVoice}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {voicePersonas.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedVoice(v.id as any);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedVoice === v.id
                      ? 'bg-white/15 border-cyan-400 shadow-md text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                  title={v.desc}
                >
                  <div className="text-[11px] font-bold truncate">{v.name}</div>
                  <div className="text-[9px] opacity-75">{v.tag}</div>
                </button>
              ))}
            </div>

            {/* Speaking Rate & Tone */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Speed: {speechRate}x
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  Tone Style
                </label>
                <select
                  value={voiceTone}
                  onChange={(e) => setVoiceTone(e.target.value as any)}
                  className="w-full py-1 px-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white"
                >
                  <option value="conversational">Conversational</option>
                  <option value="concise">Concise &amp; Fast</option>
                  <option value="deep">In-Depth &amp; Clear</option>
                  <option value="storyteller">Storyteller</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Transcript & Quick Starters */}
        <div className="w-full lg:w-7/12 flex flex-col rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Transcript Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Spoken Transcript
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking && (
                <button
                  type="button"
                  onClick={stopAllSpeech}
                  className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5"
                >
                  <Square className="w-3 h-3 fill-red-300" />
                  <span>Stop Voice</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setConversation([
                    {
                      id: 'init_welcome',
                      role: 'assistant',
                      text: "Session cleared! Tap the mic anytime to start talking.",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Clear transcript"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Voice Starters */}
          <div className="p-3 bg-white/5 border-b border-white/10 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Try Asking:</span>
            </span>
            {suggestedStarters.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => submitVoicePrompt(s.text)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white shrink-0 flex items-center gap-1.5 transition-all"
              >
                {s.icon}
                <span>"{s.text}"</span>
              </button>
            ))}
          </div>

          {/* Conversation Transcript Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[500px]">
            {conversation.map((turn) => {
              const isUser = turn.role === 'user';
              return (
                <div
                  key={turn.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
                    }`}
                  >
                    {isUser ? <Mic className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl text-xs space-y-2 shadow-lg ${
                      isUser
                        ? 'bg-indigo-600/40 border border-indigo-500/40 text-indigo-50'
                        : 'bg-white/5 border border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 border-b border-white/10 pb-1.5">
                      <span className="font-bold text-slate-300">
                        {isUser ? 'You (Voice)' : `Mido AI (${turn.voiceName || 'Voice'})`}
                      </span>
                      <span>{turn.timestamp}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{turn.text}</p>

                    {/* Action buttons for assistant turns */}
                    {!isUser && (
                      <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => playVoiceAudio(turn.audioUrl, turn.text)}
                          className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition-all"
                        >
                          <Play className="w-2.5 h-2.5 fill-cyan-300" />
                          <span>Replay Voice</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(turn.text, turn.id)}
                          className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                        >
                          {copiedId === turn.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          <span>{copiedId === turn.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-3 text-xs text-amber-300 py-2 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                </div>
                <span>Mido AI is searching facts and synthesizing voice answer...</span>
              </div>
            )}
          </div>

          {/* Quick text input fallback at bottom */}
          <div className="p-3 bg-slate-950 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('textInput') as HTMLInputElement;
                if (input && input.value.trim()) {
                  submitVoicePrompt(input.value);
                  input.value = '';
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                name="textInput"
                placeholder="Or type a question for Mido to answer aloud..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Speak Answer</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
