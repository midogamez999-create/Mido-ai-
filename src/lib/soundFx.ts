// Web Audio API Procedural Sound Synthesizer
// Clean, high-fidelity, zero-external-asset audio engine

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.6;
  private theme: 'cyber' | 'soft' | 'arcade' | 'minimal' = 'cyber';

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateConfig(enabled: boolean, volume: number, theme: 'cyber' | 'soft' | 'arcade' | 'minimal' = 'cyber') {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
    this.theme = theme;
  }

  // Play a soft message sent chime
  public playSent() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = this.theme === 'arcade' ? 'square' : this.theme === 'soft' ? 'sine' : 'triangle';

      if (this.theme === 'soft') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      } else if (this.theme === 'arcade') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(480, now + 0.05);
        osc.frequency.setValueAtTime(640, now + 0.1);
      } else if (this.theme === 'minimal') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);
      } else {
        // Cyber (default)
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.09); // G5
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      // Audio autoplay guard
    }
  }

  // Play response received chord
  public playReceived() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Two-tone harmonic chime
      const freqs = this.theme === 'cyber' 
        ? [587.33, 880, 1174.66] // D5, A5, D6
        : this.theme === 'soft'
        ? [440, 554.37, 659.25] // A4, C#5, E5 (warm major)
        : this.theme === 'arcade'
        ? [600, 750, 900]
        : [700, 850];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = this.theme === 'soft' ? 'sine' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch (e) {
      // Autoplay safe
    }
  }

  // Play success harmonic fanfare
  public playSuccess() {
    this.playReceived();
  }

  // Play notification soft ping
  public playNotification() {
    this.playSent();
  }

  // Play error feedback tone
  public playError() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

      gain.gain.setValueAtTime(0.1 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  // Play pleasant UI button/chip click
  public playClick() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  // Play toggle switch sound
  public playToggle(active: boolean) {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startF = active ? 400 : 700;
      const endF = active ? 800 : 350;

      osc.frequency.setValueAtTime(startF, now);
      osc.frequency.exponentialRampToValueAtTime(endF, now + 0.06);

      gain.gain.setValueAtTime(0.09 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {}
  }

  // Voice recording start sound
  public playVoiceStart() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);

      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  // Voice recording stop sound
  public playVoiceEnd() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.09);

      gain.gain.setValueAtTime(0.1 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  // Like feedback chime
  public playLike() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [659.25, 987.77].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.12 * this.volume, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.2);
      });
    } catch (e) {}
  }

  // Pin message sound
  public playPin() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      gain.gain.setValueAtTime(0.14 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  // Play a soft tactile pop sound
  public playPop() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);

      gain.gain.setValueAtTime(0.1 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  // Play celebration major chord fanfare
  public playCelebration() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.14 * this.volume, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.38);
      });
    } catch (e) {}
  }

  // ----------------------------------------------------------------
  // Procedural Background Ambiance Audio Loops
  // ----------------------------------------------------------------
  private ambientNodes: { source?: any; gain?: GainNode; filter?: BiquadFilterNode; timer?: any } | null = null;
  private currentAmbiance: 'off' | 'cyber-synth' | 'lofi-beats' | 'rain-thunder' | 'stadium-crowd' = 'off';

  public stopAmbiance() {
    if (this.ambientNodes) {
      try {
        if (this.ambientNodes.gain && this.ctx) {
          this.ambientNodes.gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        }
        if (this.ambientNodes.timer) clearInterval(this.ambientNodes.timer);
        setTimeout(() => {
          try {
            if (this.ambientNodes?.source?.stop) this.ambientNodes.source.stop();
          } catch (e) {}
          this.ambientNodes = null;
        }, 500);
      } catch (e) {
        this.ambientNodes = null;
      }
    }
    this.currentAmbiance = 'off';
  }

  public setAmbiance(type: 'off' | 'cyber-synth' | 'lofi-beats' | 'rain-thunder' | 'stadium-crowd') {
    if (this.currentAmbiance === type) return;
    this.stopAmbiance();
    if (type === 'off' || !this.enabled) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.currentAmbiance = type;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.08 * this.volume, now + 1.2);
      masterGain.connect(ctx.destination);

      if (type === 'cyber-synth') {
        // Deep warm dual drone (D2 + A2)
        [73.42, 110, 220].forEach((freq) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, now);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(filter);
          filter.connect(masterGain);
          osc.start(now);
        });
        this.ambientNodes = { gain: masterGain };
      } else if (type === 'rain-thunder') {
        // Pink noise buffer for rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start(now);
        this.ambientNodes = { source: whiteNoise, gain: masterGain, filter };
      } else if (type === 'lofi-beats') {
        // Soft electric piano pad chord
        [261.63, 329.63, 392.00, 493.88].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, now);
          osc.connect(filter);
          filter.connect(masterGain);
          osc.start(now);
        });
        this.ambientNodes = { gain: masterGain };
      } else if (type === 'stadium-crowd') {
        // Low rumble stadium atmosphere
        [55, 65.4, 82.4].forEach((freq) => {
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(180, now);
          osc.connect(filter);
          filter.connect(masterGain);
          osc.start(now);
        });
        this.ambientNodes = { gain: masterGain };
      }
    } catch (e) {
      console.warn('Ambiance audio failed to start:', e);
    }
  }
}

export const soundFx = new SoundEffectsEngine();
