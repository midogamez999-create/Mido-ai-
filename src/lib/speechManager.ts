// Speech Manager with Web Speech Synthesis and Waveform dispatch

export interface SpeechVoiceOption {
  id?: string;
  name: string;
  lang: string;
  voiceURI: string;
}

class SpeechManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private currentSpeakingId: string | null = null;
  private listeners: ((speakingId: string | null) => void)[] = [];
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getVoices(): SpeechVoiceOption[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    const seen = new Set<string>();
    const list: SpeechVoiceOption[] = [];

    this.voices.forEach((v, idx) => {
      const uniqueKey = `${v.name}_${v.lang}_${v.voiceURI || idx}`;
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        list.push({
          id: uniqueKey,
          name: v.name,
          lang: v.lang,
          voiceURI: v.voiceURI || `${v.name}-${idx}`,
        });
      }
    });

    return list;
  }

  public subscribe(listener: (speakingId: string | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(speakingId: string | null) {
    this.currentSpeakingId = speakingId;
    this.listeners.forEach(l => l(speakingId));
  }

  public getCurrentSpeakingId(): string | null {
    return this.currentSpeakingId;
  }

  public speak(
    text: string,
    id: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.currentSpeakingId === id) {
      this.stop();
      return;
    }

    this.stop();

    // Clean text of markdown artifacts for natural speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/•/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.utterance = utterance;

    if (options?.rate) utterance.rate = Math.max(0.5, Math.min(2.5, options.rate));
    if (options?.pitch) utterance.pitch = Math.max(0.5, Math.min(2, options.pitch));
    if (options?.volume !== undefined) utterance.volume = Math.max(0, Math.min(1, options.volume));

    if (options?.voiceName) {
      const match = this.voices.find(v => v.name === options.voiceName || v.voiceURI === options.voiceName);
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => {
      this.notify(id);
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.notify(null);
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.notify(null);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.notify(null);
    }
  }
}

export const speechManager = new SpeechManager();
