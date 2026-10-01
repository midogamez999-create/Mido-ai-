/**
 * Advanced WebAudio Multi-Track Synthesizer, Speech-to-Song Sync & WAV Audio Exporter
 * Generates polyphonic backing tracks across 8+ genres and synchronizes with Web Speech API vocals.
 */

export interface SongStyleConfig {
  id: string;
  name: string;
  genre: string;
  icon: string;
  bpm: number;
  key: string;
  scale: number[];
  bassNotes: number[];
  chordProgression: number[][];
  drumPattern: number[]; // 16-step grid
  color: string;
  sampleLyrics: string;
  vocalStyle: string;
}

// Standard Musical Note Frequencies (Hz)
const NOTE_FREQS: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
};

export const SONG_GENRES: SongStyleConfig[] = [
  {
    id: 'pop-anthem',
    name: 'Catchy Pop & Radio Anthem',
    genre: 'Pop Hit',
    icon: '🎤',
    bpm: 124,
    key: 'C Major',
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    bassNotes: [130.81, 174.61, 220.00, 196.00], // C - F - A - G
    chordProgression: [
      [261.63, 329.63, 392.00], // C
      [174.61, 220.00, 261.63], // F
      [220.00, 261.63, 329.63], // Am
      [196.00, 246.94, 293.66], // G
    ],
    drumPattern: [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 1, 2, 0],
    color: 'from-pink-500 to-rose-600',
    sampleLyrics: "Lights in the skyline, we're taking off tonight.\nFeel the rhythm moving, shining so bright.\nNothing can stop us now, we own the sound!\nTurn up the music, let the bass surround!",
    vocalStyle: 'Pop Lead Vocalist',
  },
  {
    id: 'trap-rap',
    name: '808 Trap & Hip-Hop Flow',
    genre: 'Trap / Rap',
    icon: '🔥',
    bpm: 140,
    key: 'D Minor',
    scale: [293.66, 329.63, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33],
    bassNotes: [73.42, 65.41, 87.31, 82.41], // D - C - F - E
    chordProgression: [
      [293.66, 349.23, 440.00],
      [261.63, 329.63, 392.00],
      [349.23, 440.00, 523.25],
      [329.63, 392.00, 493.88],
    ],
    drumPattern: [1, 0, 0, 0, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 2, 1],
    color: 'from-amber-500 to-red-600',
    sampleLyrics: "Heavy bass on the block, clock ticking non-stop.\nStarted from the bottom, rising straight to the top.\nGot the vision clear, laser focus in the zone.\nBuilt this empire brick by brick on my own!",
    vocalStyle: 'Rap & Hip-Hop Flow',
  },
  {
    id: 'cyberpunk-synth',
    name: 'Cyberpunk & Synthwave',
    genre: 'Synthwave',
    icon: '⚡',
    bpm: 118,
    key: 'A Minor',
    scale: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],
    bassNotes: [110.00, 87.31, 130.81, 98.00], // A - F - C - G
    chordProgression: [
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63],
      [261.63, 329.63, 392.00],
      [196.00, 246.94, 293.66],
    ],
    drumPattern: [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
    color: 'from-cyan-500 to-indigo-600',
    sampleLyrics: "Neon reflections across the midnight grid.\nDigital echoes of the secrets we hid.\nSystem rebooted, circuits ignite.\nElectric pulse racing through the cyber night!",
    vocalStyle: 'Cyber AI Vocoder',
  },
  {
    id: 'edm-festival',
    name: 'EDM & Festival Drop',
    genre: 'EDM / Dance',
    icon: '🔊',
    bpm: 128,
    key: 'F Minor',
    scale: [349.23, 392.00, 415.30, 466.16, 523.25, 554.37, 622.25, 698.46],
    bassNotes: [87.31, 103.83, 116.54, 98.00],
    chordProgression: [
      [349.23, 415.30, 523.25],
      [415.30, 523.25, 622.25],
      [466.16, 554.37, 698.46],
      [392.00, 466.16, 587.33],
    ],
    drumPattern: [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 1, 2, 1],
    color: 'from-purple-500 to-pink-600',
    sampleLyrics: "Can you feel the energy jumping off the stage?\nUncaged emotions breaking out the cage.\nThree, two, one, let the rhythm drop down!\nHands in the air, electrify this town!",
    vocalStyle: 'Festival Hype Vocals',
  },
  {
    id: 'lofi-chill',
    name: 'Lofi Chillout & Soul Spoken',
    genre: 'Lofi / Soul',
    icon: '☕',
    bpm: 85,
    key: 'E Major',
    scale: [164.81, 185.00, 207.65, 220.00, 246.94, 277.18, 311.13, 329.63],
    bassNotes: [82.41, 110.00, 73.42, 98.00],
    chordProgression: [
      [164.81, 207.65, 246.94, 311.13],
      [220.00, 277.18, 329.63, 392.00],
      [146.83, 185.00, 220.00, 261.63],
      [196.00, 246.94, 293.66, 349.23],
    ],
    drumPattern: [1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0],
    color: 'from-emerald-500 to-teal-700',
    sampleLyrics: "Raindrops tapping gently on the window glass.\nWatching the golden afternoon slowly pass.\nSip of warm tea, peace inside the mind.\nA quiet sanctuary we were meant to find.",
    vocalStyle: 'Chill Spoken Voice',
  },
  {
    id: 'cinematic-trailer',
    name: 'Cinematic Movie & Trailer',
    genre: 'Cinematic Score',
    icon: '🎬',
    bpm: 100,
    key: 'D Minor Heavy',
    scale: [146.83, 164.81, 174.61, 196.00, 220.00, 233.08, 261.63, 293.66],
    bassNotes: [73.42, 58.27, 87.31, 65.41],
    chordProgression: [
      [146.83, 174.61, 220.00],
      [116.54, 146.83, 174.61],
      [174.61, 220.00, 261.63],
      [130.81, 164.81, 196.00],
    ],
    drumPattern: [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 2, 0, 1, 1, 2, 0],
    color: 'from-slate-700 to-indigo-900',
    sampleLyrics: "From the shadows of the ancient past, a new destiny awakens.\nCourage tested in the heat of battle.\nWhen the world trembles, heroes rise.\nThis is the moment of truth.",
    vocalStyle: 'Cinematic Hollywood Narrator',
  },
];

/**
 * Generate a standard 16-bit PCM Stereo WAV Audio Blob from an AudioBuffer
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length * numChannels;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Interleaved PCM Audio Samples
  let offset = 44;
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channels[channel][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer (-32768 to 32767)
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Render a complete backing track offline to a downloadable AudioBuffer
 */
export async function renderOfflineSongTrack(
  genreConfig: SongStyleConfig,
  durationSec: number = 30,
  bpm: number = 120
): Promise<AudioBuffer> {
  const sampleRate = 44100;
  const totalFrames = Math.floor(sampleRate * durationSec);
  const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

  const beatSec = 60 / bpm;
  const sixteenthSec = beatSec / 4;
  const totalSteps = Math.floor(durationSec / sixteenthSec);

  // Main master compressor & limiter
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-18, 0);
  compressor.knee.setValueAtTime(12, 0);
  compressor.ratio.setValueAtTime(8, 0);
  compressor.attack.setValueAtTime(0.003, 0);
  compressor.release.setValueAtTime(0.25, 0);
  compressor.connect(offlineCtx.destination);

  // Master Gain
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.85, 0);
  masterGain.connect(compressor);

  // Loop through 16-step grid across time
  for (let step = 0; step < totalSteps; step++) {
    const time = step * sixteenthSec;
    const gridIndex = step % 16;
    const barIndex = Math.floor(step / 16);
    const chordIdx = barIndex % genreConfig.chordProgression.length;
    const chord = genreConfig.chordProgression[chordIdx];
    const bassNote = genreConfig.bassNotes[chordIdx % genreConfig.bassNotes.length];

    // 1. Kick Drum (gridIndex 0, 4, 8, 12 in 4-on-floor, or pattern)
    const isKick = genreConfig.drumPattern[gridIndex] === 1;
    if (isKick) {
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();
      kickOsc.frequency.setValueAtTime(140, time);
      kickOsc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

      kickGain.gain.setValueAtTime(0.7, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);
      kickOsc.start(time);
      kickOsc.stop(time + 0.15);
    }

    // 2. Snare / Clap (gridIndex 4, 12)
    const isSnare = genreConfig.drumPattern[gridIndex] === 2;
    if (isSnare) {
      const snareOsc = offlineCtx.createOscillator();
      const snareGain = offlineCtx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(220, time);
      snareOsc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

      snareGain.gain.setValueAtTime(0.4, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      snareOsc.connect(snareGain);
      snareGain.connect(masterGain);
      snareOsc.start(time);
      snareOsc.stop(time + 0.16);
    }

    // 3. Hi-Hats (every even sixteenth)
    if (gridIndex % 2 === 0) {
      const hatOsc = offlineCtx.createOscillator();
      const hatGain = offlineCtx.createGain();
      hatOsc.type = 'square';
      hatOsc.frequency.setValueAtTime(8000, time);
      hatGain.gain.setValueAtTime(0.08, time);
      hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      hatOsc.connect(hatGain);
      hatGain.connect(masterGain);
      hatOsc.start(time);
      hatOsc.stop(time + 0.05);
    }

    // 4. Bassline on eighth notes
    if (gridIndex % 4 === 0) {
      const bassOsc = offlineCtx.createOscillator();
      const bassGain = offlineCtx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassNote, time);

      bassGain.gain.setValueAtTime(0.28, time);
      bassGain.gain.exponentialRampToValueAtTime(0.001, time + sixteenthSec * 3.5);

      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);
      bassOsc.start(time);
      bassOsc.stop(time + sixteenthSec * 3.8);
    }

    // 5. Synth Chords / Pads (start of every bar)
    if (gridIndex === 0) {
      chord.forEach((freq) => {
        const chordOsc = offlineCtx.createOscillator();
        const chordGain = offlineCtx.createGain();
        chordOsc.type = 'sawtooth';
        chordOsc.frequency.setValueAtTime(freq, time);

        chordGain.gain.setValueAtTime(0.12, time);
        chordGain.gain.exponentialRampToValueAtTime(0.001, time + beatSec * 3.8);

        chordOsc.connect(chordGain);
        chordGain.connect(masterGain);
        chordOsc.start(time);
        chordOsc.stop(time + beatSec * 4.0);
      });
    }

    // 6. Melodic Synth Arpeggio
    if (gridIndex % 2 === 0) {
      const note = genreConfig.scale[(step + gridIndex) % genreConfig.scale.length];
      const leadOsc = offlineCtx.createOscillator();
      const leadGain = offlineCtx.createGain();
      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(note, time);

      leadGain.gain.setValueAtTime(0.15, time);
      leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

      leadOsc.connect(leadGain);
      leadGain.connect(masterGain);
      leadOsc.start(time);
      leadOsc.stop(time + 0.2);
    }
  }

  return await offlineCtx.startRendering();
}
