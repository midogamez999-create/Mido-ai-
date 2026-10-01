// Real Web Audio API Multi-Track Polyphonic Synthesizer Engine
// Generates full playable songs, instruments, basslines, drums, and harmonic chords

export interface SynthTrackConfig {
  title: string;
  genre: string;
  bpm: number;
  durationSeconds: number;
  scale: string[];
  bassNotes: string[];
  chords: string[][];
  leadPattern: number[];
  drumPattern: { kick: number[]; snare: number[]; hihat: number[] };
  lyrics?: string;
}

const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C#3': 138.59, 'D#3': 155.56, 'F#3': 185.00, 'G#3': 207.65, 'A#3': 233.08,
  'C#4': 277.18, 'D#4': 311.13, 'F#4': 369.99, 'G#4': 415.30, 'A#4': 466.16,
  'C#5': 554.37, 'D#5': 622.25, 'F#5': 739.99, 'G#5': 830.61, 'A#5': 932.33,
};

export const GENRE_PRESETS: Record<string, SynthTrackConfig> = {
  Synthwave: {
    title: 'Cyber Highway Neon Drive',
    genre: 'Synthwave',
    bpm: 120,
    durationSeconds: 30,
    scale: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'E5'],
    bassNotes: ['A2', 'F2', 'C2', 'G2'],
    chords: [
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
      ['C3', 'E3', 'G3'],
      ['G3', 'B3', 'D4'],
    ],
    leadPattern: [0, 2, 4, 7, 5, 4, 2, 1, 0, 3, 5, 7, 6, 5, 3, 2],
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    },
    lyrics: 'Cruising under holographic lights / Neon reflections cutting through the night / Speed up the engine, electric dream / Running on midnight energy stream.',
  },
  EDM: {
    title: 'Electropulse Stadium Hype',
    genre: 'EDM',
    bpm: 128,
    durationSeconds: 30,
    scale: ['C4', 'D#4', 'F4', 'G4', 'A#4', 'C5', 'D#5', 'G5'],
    bassNotes: ['C2', 'G#2', 'D#2', 'A#2'],
    chords: [
      ['C4', 'D#4', 'G4'],
      ['G#3', 'C4', 'D#4'],
      ['D#3', 'G3', 'A#3'],
      ['A#3', 'D4', 'F4'],
    ],
    leadPattern: [0, 3, 5, 7, 0, 3, 5, 7, 1, 4, 6, 7, 5, 3, 2, 0],
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    },
    lyrics: 'Feel the rhythm jump inside your soul / The bass is dropping out of control / Hands up in the arena air / Maximum volume everywhere!',
  },
  'Lo-Fi': {
    title: 'Late Night Study Glow',
    genre: 'Lo-Fi',
    bpm: 82,
    durationSeconds: 30,
    scale: ['D3', 'F3', 'A3', 'C4', 'E4', 'G4', 'A4'],
    bassNotes: ['D2', 'G2', 'C2', 'F2'],
    chords: [
      ['D3', 'F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4', 'F4'],
      ['C3', 'E3', 'G3', 'B3'],
      ['F3', 'A3', 'C4', 'E4'],
    ],
    leadPattern: [0, 2, 3, 4, 2, 0, 1, 3, 0, 2, 4, 5, 3, 2, 1, 0],
    drumPattern: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    lyrics: 'Raindrops falling against the window glass / Warm cup of coffee as the hours pass / Peaceful melodies softly play / Drifting my weary thoughts away.',
  },
  Cinematic: {
    title: 'Rise of the Stellar Empire',
    genre: 'Cinematic',
    bpm: 95,
    durationSeconds: 30,
    scale: ['C3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'C5'],
    bassNotes: ['C2', 'A2', 'F2', 'G2'],
    chords: [
      ['C3', 'G3', 'E4'],
      ['A2', 'E3', 'C4'],
      ['F2', 'C3', 'A3'],
      ['G2', 'D3', 'B3'],
    ],
    leadPattern: [0, 1, 2, 4, 5, 6, 7, 8, 7, 6, 4, 2, 1, 2, 0, 0],
    drumPattern: {
      kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    },
    lyrics: 'Across the boundless galaxy of stars / Rising above the scars of ancient wars / Destiny awakens the chosen one / As a new hero greets the dawn.',
  },
  Chiptune: {
    title: 'Pixel Quest 8-Bit Champion',
    genre: 'Chiptune',
    bpm: 140,
    durationSeconds: 30,
    scale: ['C4', 'E4', 'G4', 'B4', 'C5', 'D5', 'E5', 'G5'],
    bassNotes: ['C3', 'A2', 'F2', 'G2'],
    chords: [
      ['C4', 'E4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4'],
    ],
    leadPattern: [0, 2, 4, 7, 6, 4, 2, 0, 1, 3, 5, 7, 5, 3, 1, 0],
    drumPattern: {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    lyrics: 'Insert your coin and press start now / Level 99 we will conquer somehow / Jumping over pixel traps and fire / Reaching the high score ever higher!',
  },
  Trap: {
    title: 'Midnight 808 Sub Voltage',
    genre: 'Trap',
    bpm: 140,
    durationSeconds: 30,
    scale: ['C4', 'C#4', 'D#4', 'F4', 'F#4', 'G#4', 'A#4', 'C5'],
    bassNotes: ['C2', 'G#1', 'F1', 'G1'],
    chords: [
      ['C4', 'D#4', 'G4'],
      ['G#3', 'C4', 'D#4'],
      ['F3', 'G#3', 'C4'],
      ['G3', 'B3', 'D4'],
    ],
    leadPattern: [0, 1, 3, 4, 3, 1, 0, 0, 5, 4, 3, 1, 0, 1, 3, 0],
    drumPattern: {
      kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    },
    lyrics: 'Rumble of the heavy eight-o-eight / Rolling in the dark we never wait / Ice on the wrist and sparks in the room / Bass vibrating straight through the room.',
  },
};

// Polyphonic Web Audio Multi-Track Player & WAV Exporter
class MusicSynthesizerEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timerId: any = null;
  private currentStep = 0;
  private activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  public getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Generate and return a synthetic WAV Data URL for offline playback / download
  public generateWavAudioUrl(genreName: string, promptText = ''): string {
    try {
      const config = GENRE_PRESETS[genreName] || GENRE_PRESETS['Synthwave'];
      const sampleRate = 22050;
      const numChannels = 2;
      const duration = 12; // 12-second rich seamless loop
      const numFrames = sampleRate * duration;
      const bytesPerSample = 2;
      const blockAlign = numChannels * bytesPerSample;
      const byteRate = sampleRate * blockAlign;
      const dataSize = numFrames * blockAlign;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      // WAV Header
      const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true); // 16-bit
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);

      // Synthesis waveform math
      const stepDuration = 60 / config.bpm / 4; // 16th note
      let offset = 44;

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;
        const currentStep = Math.floor(t / stepDuration) % 16;
        const barStep = Math.floor(t / (stepDuration * 16)) % 4;
        const stepTime = t % stepDuration;

        // 1. Bassline
        const bassNote = config.bassNotes[barStep % config.bassNotes.length] || 'A2';
        const bassFreq = NOTE_FREQS[bassNote] || 110;
        const bassEnv = Math.exp(-stepTime * 8);
        const bassSample = Math.sin(2 * Math.PI * bassFreq * t) * 0.35 * bassEnv;

        // 2. Chords Pad
        const chord = config.chords[barStep % config.chords.length] || ['A3', 'C4', 'E4'];
        let chordSample = 0;
        for (const note of chord) {
          const freq = NOTE_FREQS[note] || 220;
          chordSample += Math.sin(2 * Math.PI * freq * t + Math.sin(t * 3) * 0.5);
        }
        chordSample = (chordSample / chord.length) * 0.2;

        // 3. Melody Lead
        const scaleIdx = config.leadPattern[currentStep] % config.scale.length;
        const leadNote = config.scale[scaleIdx] || 'C4';
        const leadFreq = NOTE_FREQS[leadNote] || 440;
        const leadEnv = Math.exp(-stepTime * 12);
        const leadSample = (Math.sin(2 * Math.PI * leadFreq * t) + 0.3 * Math.sin(4 * Math.PI * leadFreq * t)) * 0.3 * leadEnv;

        // 4. Drum Section (Kick, Snare, Hihat)
        let drumSample = 0;
        if (config.drumPattern.kick[currentStep]) {
          const kickPitch = 120 * Math.exp(-stepTime * 30) + 40;
          drumSample += Math.sin(2 * Math.PI * kickPitch * stepTime) * Math.exp(-stepTime * 14) * 0.45;
        }
        if (config.drumPattern.snare[currentStep]) {
          const noise = Math.random() * 2 - 1;
          drumSample += noise * Math.exp(-stepTime * 20) * 0.25;
        }
        if (config.drumPattern.hihat[currentStep]) {
          const noise = Math.random() * 2 - 1;
          drumSample += noise * Math.exp(-stepTime * 45) * 0.15;
        }

        // Master mix
        let sample = (bassSample + chordSample + leadSample + drumSample);
        sample = Math.max(-1, Math.min(1, sample)); // Clamp
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;

        view.setInt16(offset, intSample, true);
        view.setInt16(offset + 2, intSample, true);
        offset += 4;
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('WAV synthesis fallback:', e);
      return '';
    }
  }

  // Live Real-Time Web Audio Synthesizer Playback
  public startLivePlayback(genreName: string, onStep?: (step: number) => void): void {
    this.stopLivePlayback();
    const ctx = this.getAudioContext();
    this.isPlaying = true;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, ctx.currentTime);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    const config = GENRE_PRESETS[genreName] || GENRE_PRESETS['Synthwave'];
    const stepDuration = 60 / config.bpm / 4; // 16th note in seconds

    this.currentStep = 0;

    const scheduleStep = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const step = this.currentStep % 16;
      const bar = Math.floor(this.currentStep / 16) % 4;

      if (onStep) onStep(step);

      // Bass note
      const bassNote = config.bassNotes[bar % config.bassNotes.length];
      if (bassNote && (step % 2 === 0)) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = genreName === 'Chiptune' ? 'square' : genreName === 'EDM' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(NOTE_FREQS[bassNote] || 110, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + stepDuration * 1.8);
      }

      // Melody note
      const scaleIdx = config.leadPattern[step] % config.scale.length;
      const leadNote = config.scale[scaleIdx];
      if (leadNote) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = genreName === 'Chiptune' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(NOTE_FREQS[leadNote] || 440, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + stepDuration * 0.9);
      }

      // Drums
      if (config.drumPattern.kick[step]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.15);
      }

      if (config.drumPattern.snare[step]) {
        // Noise buffer for snare
        const bufferSize = ctx.sampleRate * 0.1;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        whiteNoise.connect(gain);
        gain.connect(this.masterGain!);
        whiteNoise.start(now);
      }

      this.currentStep++;
      this.timerId = setTimeout(scheduleStep, stepDuration * 1000);
    };

    scheduleStep();
  }

  public stopLivePlayback(): void {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.activeNodes) {
      this.activeNodes.forEach((n) => {
        try { n.stop(); } catch {}
      });
      this.activeNodes = [];
    }
  }

  public setVolume(vol: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }
}

export const musicSynthesizer = new MusicSynthesizerEngine();
