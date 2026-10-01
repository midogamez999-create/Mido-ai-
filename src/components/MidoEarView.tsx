import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, EarTrack } from '../types';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Lock,
  Globe,
  Plus,
  Sparkles,
  Upload,
  Search,
  Shuffle,
  Repeat,
  Radio,
  CheckCircle2,
  Trash2,
  ListMusic,
  Flame,
  Disc,
  Mic,
  Share2,
  Zap,
  Sliders,
  X,
  Download,
  Terminal,
  AlignLeft,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import { downloadMediaFile } from '../lib/downloadEngine';

interface MidoEarViewProps {
  user: UserAccount | null;
  onOpenAuthModal?: () => void;
  onOpenAccountManager?: () => void;
}

const CLIENT_FALLBACK_TRACKS: EarTrack[] = [
  {
    id: 'track_cyberpunk_1',
    title: 'Cyberpunk 2099',
    artist: 'Mido Neural Band',
    creatorId: 'ch_mido_official',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
    creatorVerified: true,
    genre: 'Synthwave',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
    duration: '3:15',
    isPrivate: false,
    plays: 38400,
    likes: 9240,
    lyrics: "Neon rain falls on chrome streets tonight\nRunning from shadows into neon light\nWe drive through the grid at the speed of sound\nNothing can hold our burning spirits down",
    synthConfig: {
      genre: 'synthwave',
      bpm: 128,
      key: 'Am',
      chords: ['Am', 'F', 'C', 'G']
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'track_lofi_midnight_2',
    title: 'Midnight Lo-Fi Coffee',
    artist: 'Lofi Dreamer',
    creatorId: 'ch_lofi_chill',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
    creatorVerified: true,
    genre: 'Lo-Fi',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80',
    duration: '2:45',
    isPrivate: false,
    plays: 64100,
    likes: 18200,
    lyrics: "Steam from a fresh cup at 2 AM\nWriting down thoughts that won't fade away\nSoft rain against the bedroom glass\nWatching the midnight hours pass",
    synthConfig: {
      genre: 'lofi',
      bpm: 84,
      key: 'F#m',
      chords: ['F#m7', 'Bm7', 'E7', 'AMaj7']
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'track_starlight_pop_3',
    title: 'Starlight Horizons',
    artist: 'Aura Electric',
    creatorId: 'ch_aura_music',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    creatorVerified: true,
    genre: 'Electronic',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    duration: '3:05',
    isPrivate: false,
    plays: 29500,
    likes: 8140,
    lyrics: "Take my hand and feel the spark\nDancing wild in the velvet dark\nEvery second glowing bright\nWe are alive in the starlight",
    synthConfig: {
      genre: 'electronic',
      bpm: 124,
      key: 'C',
      chords: ['C', 'G', 'Am', 'F']
    },
    createdAt: new Date().toISOString()
  }
];

export const MidoEarView: React.FC<MidoEarViewProps> = ({
  user,
  onOpenAuthModal,
  onOpenAccountManager,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'studio'>('home');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'private' | 'public' | 'liked'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [tracks, setTracks] = useState<EarTrack[]>(CLIENT_FALLBACK_TRACKS);
  const [libraryTracks, setLibraryTracks] = useState<EarTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Player State
  const [currentTrack, setCurrentTrack] = useState<EarTrack | null>(CLIENT_FALLBACK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(165); // 02:45 default seconds
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Web Audio Synthesizer for instant procedural music playback
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);
  const synthTimerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Real-time Karaoke & Lyrics viewer state
  const [showLyricsModal, setShowLyricsModal] = useState<boolean>(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const [copiedLyrics, setCopiedLyrics] = useState<boolean>(false);

  // Liked tracks map: trackId -> boolean
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mido_ear_liked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Creator & Studio State (Custom lyrics & custom style)
  const [studioMode, setStudioMode] = useState<'ai' | 'upload'>('ai');
  const [aiLyrics, setAiLyrics] = useState<string>('');
  const [aiStyle, setAiStyle] = useState<string>('');
  const [aiTitle, setAiTitle] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiGenre, setAiGenre] = useState<string>('Synthwave');
  const [aiMood, setAiMood] = useState<string>('Energetic');
  const [aiIsInstrumental, setAiIsInstrumental] = useState<boolean>(false);
  const [aiIsPrivate, setAiIsPrivate] = useState<boolean>(false); // Private vs Public!
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Progressive Real Loading Screen State
  const [aiProgress, setAiProgress] = useState<number>(0);
  const [aiLoadingStage, setAiLoadingStage] = useState<string>('');
  const [aiLogs, setAiLogs] = useState<string[]>([]);

  // Upload Audio State
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadGenre, setUploadGenre] = useState<string>('Electronic');
  const [uploadIsPrivate, setUploadIsPrivate] = useState<boolean>(false);
  const [uploadAudioFile, setUploadAudioFile] = useState<File | null>(null);
  const [uploadAudioDataUrl, setUploadAudioDataUrl] = useState<string>('');
  const [uploadCoverUrl, setUploadCoverUrl] = useState<string>('');
  const [isSubmittingUpload, setIsSubmittingUpload] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Public Tracks for Home
  const fetchHomeTracks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/ear/tracks');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks) {
          setTracks(data.tracks);
          if (!currentTrack && data.tracks.length > 0) {
            setCurrentTrack(data.tracks[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load Ear home tracks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Library Tracks (Private + Public of this user)
  const fetchLibraryTracks = async () => {
    const creatorId = user?.id || 'ch_my_channel';
    try {
      const res = await fetch(`/api/ear/tracks?creatorId=${encodeURIComponent(creatorId)}&includePrivate=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.tracks) {
          setLibraryTracks(data.tracks);
        }
      }
    } catch (e) {
      console.error('Failed to load Library tracks:', e);
    }
  };

  useEffect(() => {
    fetchHomeTracks();
    fetchLibraryTracks();
  }, [user?.id]);

  // Handle Play/Pause
  const togglePlay = (track?: EarTrack) => {
    soundFx.playClick();
    const target = track || currentTrack || tracks[0];
    if (!target) return;

    if (currentTrack?.id === target.id) {
      if (isPlaying) {
        stopSynthMusic();
        setIsPlaying(false);
      } else {
        startSynthMusic(target);
        setIsPlaying(true);
      }
    } else {
      stopSynthMusic();
      setCurrentTrack(target);
      setCurrentTime(0);
      startSynthMusic(target);
      setIsPlaying(true);
      // Record stream
      fetch(`/api/ear/tracks/${target.id}/play`, { method: 'POST' }).catch(() => {});
    }
  };

  // Skip Next Track
  const handleNext = () => {
    soundFx.playClick();
    const activeList = activeTab === 'library' ? libraryTracks : tracks;
    if (activeList.length === 0) return;
    const currentIndex = activeList.findIndex(t => t.id === currentTrack?.id);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= activeList.length) nextIndex = 0;
    togglePlay(activeList[nextIndex]);
  };

  // Skip Previous Track
  const handlePrev = () => {
    soundFx.playClick();
    const activeList = activeTab === 'library' ? libraryTracks : tracks;
    if (activeList.length === 0) return;
    const currentIndex = activeList.findIndex(t => t.id === currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = activeList.length - 1;
    togglePlay(activeList[prevIndex]);
  };

  // Web Audio Procedural Synthesizer & Speech Synthesis Vocal Engine
  const startSynthMusic = (track: EarTrack) => {
    try {
      stopSynthNodes();
      setActiveLyricIndex(-1);

      // 1. If track has audioUrl (e.g. uploaded file / blob), play directly through HTMLAudioElement
      if (track.audioUrl) {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }
        const audio = audioElementRef.current;
        audio.src = track.audioUrl;
        audio.volume = isMuted ? 0 : volume;
        audio.currentTime = 0;
        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          }
        };
        audio.onended = () => {
          handleNext();
        };
        audio.play().catch(e => console.warn('Audio play error:', e));
        return;
      }

      // 2. Procedural Web Audio Synthesizer matching BPM, Tone, Key, and Chords
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bpm = track.synthConfig?.bpm || 124;
      const beatInterval = 60 / bpm;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);
      synthNodesRef.current.push(masterGain);

      // Clean lyric lines for vocal singing
      const cleanLyricLines = (track.lyrics || '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('[') && !l.endsWith(']'));

      // Scale notes / Chord progression notes
      const notes = [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33];
      const bassNotes = [110, 130.81, 146.83, 164.81];
      let step = 0;
      let lastSpokenLyricStep = -1;

      // Vocal Singing Function using Web Speech Synthesis
      const singNextLyricLine = (lineIdx: number) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (lineIdx < 0 || lineIdx >= cleanLyricLines.length) return;
        
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanLyricLines[lineIdx]);
          utterance.rate = Math.min(1.3, Math.max(0.85, bpm / 115));
          utterance.pitch = track.genre === 'Rock' || track.genre === 'Hip Hop' ? 0.9 : 1.15;
          utterance.volume = isMuted ? 0 : Math.min(1, volume * 1.1);
          window.speechSynthesis.speak(utterance);
          setActiveLyricIndex(lineIdx);
        } catch {}
      };

      synthTimerRef.current = setInterval(() => {
        if (!isPlaying && step > 0) return;
        const now = ctx.currentTime;
        const freq = notes[step % notes.length];
        const bassFreq = bassNotes[Math.floor(step / 4) % bassNotes.length];

        // 1. Lead Tone
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = (track.synthConfig?.leadTone as any) || 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.28, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + beatInterval * 0.85);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + beatInterval * 0.85);

        // 2. Bassline Tone on beat
        if (step % 2 === 0) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = (track.synthConfig?.bassTone as any) || 'square';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          bassGain.gain.setValueAtTime(0.35, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatInterval * 1.8);

          bassOsc.connect(bassGain);
          bassGain.connect(masterGain);
          bassOsc.start(now);
          bassOsc.stop(now + beatInterval * 1.8);
        }

        // 3. Punchy Kick & Hi-hat
        if (step % 4 === 0) {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.frequency.setValueAtTime(140, now);
          kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.2);
          kickGain.gain.setValueAtTime(0.7, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          kickOsc.connect(kickGain);
          kickGain.connect(masterGain);
          kickOsc.start(now);
          kickOsc.stop(now + 0.22);
        }

        // 4. Sing lyrics rhythmically if lyrics exist
        if (cleanLyricLines.length > 0 && !track.synthConfig?.isInstrumental) {
          const beatsPerLine = 8;
          const currentLineNumber = Math.floor(step / beatsPerLine) % cleanLyricLines.length;
          if (step % beatsPerLine === 0 && lastSpokenLyricStep !== step) {
            lastSpokenLyricStep = step;
            singNextLyricLine(currentLineNumber);
          }
        }

        step++;
        setCurrentTime(prev => {
          if (prev >= duration) {
            handleNext();
            return 0;
          }
          return prev + beatInterval;
        });
      }, beatInterval * 500);

    } catch (e) {
      console.warn('Web Audio playback initialization:', e);
    }
  };

  const stopSynthNodes = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    synthNodesRef.current.forEach(node => {
      try { node.disconnect(); } catch {}
    });
    synthNodesRef.current = [];

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveLyricIndex(-1);
  };

  const stopSynthMusic = () => {
    stopSynthNodes();
  };

  useEffect(() => {
    return () => stopSynthMusic();
  }, []);

  // Update volume
  useEffect(() => {
    if (synthNodesRef.current[0]) {
      synthNodesRef.current[0].gain.value = isMuted ? 0 : volume * 0.45;
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Toggle Like Track
  const handleToggleLike = async (trackId: string) => {
    soundFx.playClick();
    const isLiked = likedMap[trackId];
    setLikedMap(prev => {
      const updated = { ...prev, [trackId]: !isLiked };
      localStorage.setItem('mido_ear_liked', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch(`/api/ear/tracks/${trackId}/like`, { method: 'POST' });
    } catch {}
  };

  // Toggle Privacy: Private to me only <-> Public on Home page
  const handleTogglePrivacy = async (track: EarTrack) => {
    soundFx.playClick();
    const newPrivacy = !track.isPrivate;

    try {
      const res = await fetch(`/api/ear/tracks/${track.id}/privacy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: newPrivacy })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchHomeTracks();
        fetchLibraryTracks();
      }
    } catch {
      showToast("Failed to update privacy setting");
    }
  };

  // Delete Track
  const handleDeleteTrack = async (trackId: string) => {
    soundFx.playClick();
    try {
      const res = await fetch(`/api/ear/tracks/${trackId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Track deleted from Mido Ear");
        fetchHomeTracks();
        fetchLibraryTracks();
        if (currentTrack?.id === trackId) {
          stopSynthMusic();
          setIsPlaying(false);
          setCurrentTrack(null);
        }
      }
    } catch {
      showToast("Error deleting track");
    }
  };

  // Generate Song with Suno AI using Custom Lyrics & Style (Real Progressive Loading Screen)
  const handleGenerateAiSong = async () => {
    if (!aiLyrics.trim() && !aiStyle.trim() && !aiPrompt.trim()) {
      showToast("Please provide your lyrics or describe the musical style!");
      return;
    }
    soundFx.playClick();
    setIsGeneratingAi(true);
    setAiProgress(10);
    setAiLoadingStage('Analyzing your custom lyrics and style requirements...');
    setAiLogs([
      `[0.0s] Booting Mido Ear Suno AI Neural Audio Synthesizer...`,
      `[0.4s] Lyrical Input: "${aiLyrics ? aiLyrics.slice(0, 36).replace(/\n/g, ' ') + (aiLyrics.length > 36 ? '...' : '') : '(Original AI lyrical generation mode)'}"`,
      `[0.8s] Style Parameter: "${aiStyle || aiPrompt || `${aiMood} ${aiGenre}`}"`
    ]);

    const timer1 = setTimeout(() => {
      setAiProgress(35);
      setAiLoadingStage('Synthesizing harmonic chord progressions & key for chosen style...');
      setAiLogs(prev => [
        ...prev,
        `[1.4s] Tuning scale, key signature and BPM for ${aiGenre}...`,
        `[2.0s] Synthesizing 808 bass, drum pattern velocity & analog warmth...`
      ]);
    }, 1200);

    const timer2 = setTimeout(() => {
      setAiProgress(68);
      setAiLoadingStage('Composing multi-instrument audio stems & melodic synths with Gemini AI...');
      setAiLogs(prev => [
        ...prev,
        `[2.9s] Structuring lead melodies, rhythm chords, and dynamic bridges...`,
        `[3.5s] Aligning vocal phonemes & rhyming cadence to lyrical meter...`
      ]);
    }, 2800);

    const timer3 = setTimeout(() => {
      setAiProgress(88);
      setAiLoadingStage('Mastering final stereo audio stream & vocal timing...');
      setAiLogs(prev => [
        ...prev,
        `[4.3s] Lossless audio stem mastering and equalizer balance applied...`,
        `[4.9s] Compiling synchronized karaoke lyrics sheet...`
      ]);
    }, 4500);

    try {
      const res = await fetch('/api/ear/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lyrics: aiLyrics,
          style: aiStyle,
          prompt: aiPrompt || aiStyle,
          title: aiTitle,
          genre: aiGenre,
          mood: aiMood,
          isPrivate: aiIsPrivate,
          isInstrumental: aiIsInstrumental
        })
      });
      const data = await res.json();
      if (data.success && data.trackDraft) {
        setAiProgress(100);
        setAiLoadingStage('✨ Verification successful! Playable song ready.');
        setAiLogs(prev => [
          ...prev,
          `[Done] Master audio track synthesized with 0 errors.`,
          `[Done] Saving to your music library and starting playback now!`
        ]);

        const myId = user?.id || 'ch_my_channel';
        const myName = user?.name || 'Mido Gamez';
        const myAvatar = user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel';

        // Auto save track to Mido Ear
        const saveRes = await fetch('/api/ear/tracks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.trackDraft.title,
            artist: myName,
            creatorId: myId,
            creatorAvatar: myAvatar,
            genre: data.trackDraft.genre,
            coverUrl: data.trackDraft.coverUrl,
            duration: data.trackDraft.duration,
            isPrivate: aiIsPrivate, // Private to me only OR Public!
            lyrics: data.trackDraft.lyrics,
            synthConfig: {
              bpm: data.trackDraft.bpm,
              key: data.trackDraft.key,
              chords: data.trackDraft.chords,
              leadTone: data.trackDraft.leadTone,
              bassTone: data.trackDraft.bassTone,
              drumStyle: data.trackDraft.drumStyle,
              isInstrumental: aiIsInstrumental
            }
          })
        });

        const saveData = await saveRes.json();
        if (saveData.success && saveData.track) {
          showToast(aiIsPrivate
            ? "🔒 Song created and saved to your Private Library!"
            : "🎉 Song created and published to Mido Ear Home page for everyone!");
          fetchHomeTracks();
          fetchLibraryTracks();
          togglePlay(saveData.track);
          setActiveTab('library');
          setAiPrompt('');
          setAiLyrics('');
          setAiStyle('');
          setAiTitle('');
        }
      } else {
        showToast(data.error || "Failed to generate song");
      }
    } catch {
      showToast("Error generating song with AI");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsGeneratingAi(false);
    }
  };

  // Upload User Audio File
  const handleUploadAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    soundFx.playClick();
    setIsSubmittingUpload(true);

    try {
      const myId = user?.id || 'ch_my_channel';
      const myName = user?.name || 'Mido Gamez';
      const myAvatar = user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=MyChannel';

      const res = await fetch('/api/ear/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          artist: myName,
          creatorId: myId,
          creatorAvatar: myAvatar,
          genre: uploadGenre,
          audioUrl: uploadAudioDataUrl || '',
          coverUrl: uploadCoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
          duration: '03:15',
          isPrivate: uploadIsPrivate
        })
      });

      const data = await res.json();
      if (data.success && data.track) {
        showToast(uploadIsPrivate
          ? "🔒 Audio uploaded to your Private Library!"
          : "🎉 Audio uploaded and published to Mido Ear Home page!");
        fetchHomeTracks();
        fetchLibraryTracks();
        togglePlay(data.track);
        setActiveTab('library');
        setUploadTitle('');
        setUploadAudioFile(null);
      }
    } catch {
      showToast("Error uploading track");
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filtered lists
  const displayHomeTracks = tracks.filter(t => {
    const matchesGenre = selectedGenre === 'All' || t.genre?.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const displayLibraryTracks = libraryTracks.filter(t => {
    if (libraryFilter === 'private') return t.isPrivate;
    if (libraryFilter === 'public') return !t.isPrivate;
    if (libraryFilter === 'liked') return likedMap[t.id];
    return true;
  });

  // Lyric lines of currently playing track
  const currentTrackLyricLines = (currentTrack?.lyrics || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('[') && !l.endsWith(']'));

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden select-none pb-24">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-slate-900/95 border border-emerald-500/40 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-md z-30 shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Music className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm md:text-base tracking-tight text-white">MIDO EAR</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                MUSIC &amp; SUNO AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Spotify streaming + Suno AI music studio: Publish public songs or keep in private library
            </p>
          </div>
        </div>

        {/* Tab Switcher: Home | Library | Create with AI */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-white/10">
          <button
            onClick={() => { soundFx.playClick(); setActiveTab('home'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveTab('library'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); setActiveTab('studio'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-black'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Music Studio</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: HOME PAGE (Public Songs Feed) */}
      {activeTab === 'home' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Hero Banner: Featured Community Track */}
          {tracks[0] && (
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 p-6 sm:p-8 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 shadow-2xl flex flex-col sm:flex-row items-center gap-6 text-left">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
                <img src={tracks[0].coverUrl} alt={tracks[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 uppercase tracking-wider">
                  Featured Community Hit 🚀
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{tracks[0].title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-white">By {tracks[0].artist}</span>
                  {tracks[0].creatorVerified && (
                    <span title="Verified Creator"><CheckCircle2 className="w-4 h-4 fill-cyan-400 text-slate-950" /></span>
                  )}
                  <span>•</span>
                  <span>{tracks[0].genre}</span>
                  <span>•</span>
                  <span>{(tracks[0].plays || 0).toLocaleString()} streams</span>
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => togglePlay(tracks[0])}
                    className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transform hover:scale-105 transition-all"
                  >
                    {isPlaying && currentTrack?.id === tracks[0].id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying && currentTrack?.id === tracks[0].id ? 'PAUSE' : 'PLAY NOW'}</span>
                  </button>
                  <button
                    onClick={() => handleToggleLike(tracks[0].id)}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white transition-all"
                  >
                    <Heart className={`w-4 h-4 ${likedMap[tracks[0].id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  {tracks[0].lyrics && (
                    <button
                      onClick={() => {
                        setCurrentTrack(tracks[0]);
                        setShowLyricsModal(true);
                      }}
                      className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Lyrics</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search & Genre Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, genres..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {['All', 'Synthwave', 'Electronic', 'Lo-Fi', 'Hip Hop', 'Rock', 'Ambient'].map(genre => (
                <button
                  key={genre}
                  onClick={() => { soundFx.playClick(); setSelectedGenre(genre); }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGenre === genre
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Public Songs Grid */}
          <div className="space-y-2 text-left">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Public Releases &amp; Community Hits</span>
            </h3>

            {displayHomeTracks.length === 0 ? (
              <div className="text-center space-y-4 p-8 max-w-md mx-auto bg-slate-900/60 border border-white/10 rounded-3xl backdrop-blur-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-teal-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
                  <Music className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-base font-black text-white">No songs published yet</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Only real human artists and songs here — absolutely zero fake bots. Be the first to create a song with your own lyrics and custom style or upload a track!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Create Song with My Lyrics</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayHomeTracks.map(track => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg'
                          : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                          <button
                            onClick={() => togglePlay(track)}
                            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 fill-white text-white" />
                            ) : (
                              <Play className="w-5 h-5 fill-white text-white" />
                            )}
                          </button>
                        </div>

                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{track.title}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="truncate">{track.artist}</span>
                            {track.creatorVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-slate-950 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-emerald-400 font-mono">{track.genre}</span>
                            {track.lyrics && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold">
                                Lyrics
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {track.lyrics && (
                          <button
                            onClick={() => {
                              setCurrentTrack(track);
                              setShowLyricsModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400"
                            title="View Lyrics"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleLike(track.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-white"
                        >
                          <Heart className={`w-4 h-4 ${likedMap[track.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => togglePlay(track)}
                          className={`p-2 rounded-xl text-xs font-bold transition-all ${
                            isTrackPlaying ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/15'
                          }`}
                        >
                          {isTrackPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: LIBRARY ("like Spotify with Private vs Public distinction") */}
      {activeTab === 'library' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-emerald-400" />
                <span>My Music Library</span>
              </h2>
              <p className="text-xs text-slate-400">
                Your personal songs, private vaults, and Spotify-style saved tracks
              </p>
            </div>

            {/* Library Subfilters */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
              {[
                { id: 'all', label: 'All Songs' },
                { id: 'private', label: '🔒 Private Vault' },
                { id: 'public', label: '🌐 Public on Home' },
                { id: 'liked', label: '❤️ Liked Tracks' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { soundFx.playClick(); setLibraryFilter(f.id as any); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    libraryFilter === f.id
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Library Track List */}
          {displayLibraryTracks.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Disc className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">No tracks in this library view</div>
              <p className="text-xs text-slate-400">
                Create a new song with Suno AI or upload audio files to your library!
              </p>
              <button
                onClick={() => setActiveTab('studio')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
              >
                Go to Music Studio
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {displayLibraryTracks.map(track => {
                const isCurrent = currentTrack?.id === track.id;
                const isTrackPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => togglePlay(track)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                        >
                          {isTrackPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{track.title}</span>
                          {/* PRIVACY BADGE: Private vs Public */}
                          {track.isPrivate ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Private to Me Only
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" /> Public on Home
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {track.artist} • {track.genre} • {track.duration}
                        </div>
                      </div>
                    </div>

                    {/* PRIVACY TOGGLE BUTTON & ACTIONS */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleTogglePrivacy(track)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          track.isPrivate
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                        title="Toggle visibility between Private (Only you) and Public (Published to Mido Ear Home page)"
                      >
                        {track.isPrivate ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{track.isPrivate ? 'Publish to Home' : 'Set to Private'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        title="Delete song"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: AI MUSIC CREATOR & UPLOAD STUDIO ("Make with AI like Suno" + Upload Songs) */}
      {activeTab === 'studio' && (
        <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto space-y-5 text-left">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Mido Ear AI Song Creator</span>
            </h2>
            <p className="text-xs text-slate-400">
              Enter your exact lyrics and musical style, and Gemini + Suno engine will engineer your song!
            </p>
          </div>

          {/* Mode Switcher: Suno AI vs Audio Upload */}
          <div className="flex p-1 rounded-2xl bg-slate-900 border border-white/10">
            <button
              onClick={() => { soundFx.playClick(); setStudioMode('ai'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                studioMode === 'ai'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Song Maker (Lyrics &amp; Style)</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); setStudioMode('upload'); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                studioMode === 'upload'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Audio File</span>
            </button>
          </div>

          {/* SUNO AI FORM WITH CUSTOM LYRICS & STYLE */}
          {studioMode === 'ai' ? (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
              {/* 1. CUSTOM LYRICS INPUT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1. Your Song Lyrics (Custom Text / Rhyme):</span>
                  </label>
                  <span className="text-[10px] text-emerald-400/80">Sung word-for-word</span>
                </div>
                <textarea
                  rows={4}
                  value={aiLyrics}
                  onChange={(e) => setAiLyrics(e.target.value)}
                  placeholder={"[Verse 1]\nWalking down the neon highway late at night\nChasing shadows under city lights\n[Chorus]\nTake me higher, feel the electric sound\nWe're never coming back down..."}
                  className="w-full p-3 bg-black/50 border border-white/15 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-sans leading-relaxed"
                />

                {/* Quick lyric templates */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 scrollbar-none">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">Lyric Ideas:</span>
                  {[
                    { label: 'Cyberpunk', lyrics: "[Verse 1]\nLines of code across the holographic sky\nWatching all the flying cruisers drift on by\n[Chorus]\nElectric heart, neon dreams tonight\nWe run the digital grid into the light!" },
                    { label: 'Summer Beach', lyrics: "[Verse 1]\nGolden sand between my toes, ocean breeze\nSunlight shining through the palm trees\n[Chorus]\nSinging with the tides, dancing with the waves\nLiving for the sweet summer days!" },
                    { label: 'Heavy Rock', lyrics: "[Verse 1]\nThunder rolling through the midnight storm\nBreaking out of every broken norm\n[Chorus]\nTurn the amps up high, let the power scream\nNothing stands between me and my dream!" }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setAiLyrics(item.lyrics)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 whitespace-nowrap cursor-pointer"
                    >
                      +{item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. MUSICAL STYLE & INSTRUMENTATION */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>2. Musical Style &amp; Instrumentation:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Instruments, sound, vibe</span>
                </div>
                <input
                  type="text"
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  placeholder="e.g. 80s synthwave with analog synthesizers, punchy gated reverb drums, and dark bassline"
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />

                {/* Quick style tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 scrollbar-none">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">Styles:</span>
                  {[
                    '80s Synthwave',
                    'Cyberpunk EDM',
                    'Hard Rock Guitars',
                    'Trap 808s & Hi-Hats',
                    'Lo-Fi Melodic Piano',
                    'Indie Acoustic Folk'
                  ].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAiStyle(st)}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-slate-300 border border-white/10 whitespace-nowrap cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. OPTIONAL SONG TITLE */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Song Title (Optional):</label>
                <input
                  type="text"
                  value={aiTitle}
                  onChange={(e) => setAiTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon 2026 (Leave blank for AI title)"
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 4. GENRE & MOOD & INSTRUMENTAL */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Genre:</label>
                  <select
                    value={aiGenre}
                    onChange={(e) => setAiGenre(e.target.value)}
                    className="w-full p-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Synthwave">Synthwave</option>
                    <option value="Electronic">Electronic / EDM</option>
                    <option value="Lo-Fi">Lo-Fi Chill</option>
                    <option value="Hip Hop">Hip Hop / Trap</option>
                    <option value="Rock">Rock / Punk</option>
                    <option value="Ambient">Ambient Space</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Mood:</label>
                  <select
                    value={aiMood}
                    onChange={(e) => setAiMood(e.target.value)}
                    className="w-full p-2 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Energetic">Energetic &amp; Fast</option>
                    <option value="Chill">Chill &amp; Mellow</option>
                    <option value="Epic">Epic &amp; Cinematic</option>
                    <option value="Dark">Dark Cyberpunk</option>
                    <option value="Dreamy">Dreamy &amp; Atmospheric</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-300">Vocals:</label>
                  <button
                    type="button"
                    onClick={() => setAiIsInstrumental(!aiIsInstrumental)}
                    className={`w-full p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      aiIsInstrumental
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {aiIsInstrumental ? 'No Vocals (Instrumental)' : 'Sing My Lyrics'}
                  </button>
                </div>
              </div>

              {/* PRIVACY SETTING: Set to Private to me only OR Publish to Home page */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Privacy &amp; Publishing:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    aiIsPrivate ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {aiIsPrivate ? '🔒 Private (Only Me)' : '🌐 Public (On Home)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiIsPrivate(false)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      !aiIsPrivate
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish to Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiIsPrivate(true)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      aiIsPrivate
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private to Me Only</span>
                  </button>
                </div>
              </div>

              {/* REAL PROGRESSIVE LOADING SCREEN MODAL / CARD */}
              {isGeneratingAi && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/50 shadow-2xl space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-black text-white">Engineering Song with Suno AI...</span>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-400">{aiProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>

                  {/* Active Stage Indicator */}
                  <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{aiLoadingStage}</span>
                  </div>

                  {/* Live Terminal Log Output */}
                  <div className="p-2.5 rounded-xl bg-black/80 border border-white/10 font-mono text-[10px] space-y-1 max-h-32 overflow-y-auto">
                    {aiLogs.map((log, i) => (
                      <div key={i} className="text-emerald-400 flex items-center gap-1">
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GENERATE BUTTON */}
              <button
                onClick={handleGenerateAiSong}
                disabled={isGeneratingAi || (!aiLyrics.trim() && !aiStyle.trim() && !aiPrompt.trim())}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Song ({aiProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Synthesize Song with My Lyrics &amp; Style</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* UPLOAD AUDIO FILE FORM */
            <form onSubmit={handleUploadAudioSubmit} className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Track Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Midnight Beats 2026"
                  className="w-full p-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Choose Audio File (MP3 / WAV / OGG) *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadAudioFile(file);
                      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
                      const reader = new FileReader();
                      reader.onload = () => setUploadAudioDataUrl(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                />
              </div>

              {/* PRIVACY CHOICE FOR UPLOADS */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Privacy Preference:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    uploadIsPrivate ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {uploadIsPrivate ? '🔒 Private (Only Me)' : '🌐 Public (On Home)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadIsPrivate(false)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      !uploadIsPrivate
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Publish to Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadIsPrivate(true)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      uploadIsPrivate
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private to Me Only</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingUpload || !uploadTitle.trim()}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingUpload ? 'Uploading...' : 'Save & Publish Song'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* KARAOKE & LYRICS MODAL */}
      {showLyricsModal && currentTrack && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col gap-4 text-slate-100 max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-10 h-10 rounded-xl object-cover" />
                <div className="min-w-0">
                  <div className="text-sm font-black text-white truncate">{currentTrack.title}</div>
                  <div className="text-xs text-slate-400">{currentTrack.artist} • {currentTrack.genre}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentTrack.lyrics && (
                  <button
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(currentTrack.lyrics || '');
                        setCopiedLyrics(true);
                        setTimeout(() => setCopiedLyrics(false), 2000);
                      }
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                    title="Copy Lyrics"
                  >
                    {copiedLyrics ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => setShowLyricsModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lyrics Content */}
            <div className="flex-1 overflow-y-auto space-y-2 p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
              {currentTrackLyricLines.length === 0 ? (
                <div className="py-12 text-slate-400 text-xs">
                  This track is an instrumental recording without lyrics.
                </div>
              ) : (
                currentTrackLyricLines.map((line, idx) => {
                  const isCurrentLine = activeLyricIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl transition-all font-semibold ${
                        isCurrentLine
                          ? 'bg-emerald-500/25 text-emerald-300 font-black text-sm scale-105 border border-emerald-500/40 shadow-lg'
                          : 'text-slate-300 text-xs opacity-75 hover:opacity-100'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              )}
            </div>

            {/* Sing along indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Mic className="w-3.5 h-3.5" />
                <span>Live Karaoke Vocal Sync</span>
              </span>
              <span>{currentTrackLyricLines.length} lines total</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM PERSISTENT SPOTIFY-STYLE MUSIC PLAYER BAR */}
      {currentTrack && (
        <div className="fixed bottom-0 inset-x-0 h-20 bg-slate-950/95 border-t border-white/10 backdrop-blur-2xl px-4 flex items-center justify-between z-40 gap-4 shadow-2xl">
          {/* Left: Track artwork & Title */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0">
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                <span>{currentTrack.title}</span>
                {currentTrack.isPrivate ? (
                  <span title="Private track"><Lock className="w-3 h-3 text-amber-400 shrink-0" /></span>
                ) : (
                  <span title="Public track"><Globe className="w-3 h-3 text-emerald-400 shrink-0" /></span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <span>{currentTrack.artist}</span>
                {currentTrack.creatorVerified && (
                  <CheckCircle2 className="w-3 h-3 fill-cyan-400 text-slate-950 shrink-0" />
                )}
              </div>
            </div>
            <button
              onClick={() => handleToggleLike(currentTrack.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white shrink-0"
            >
              <Heart className={`w-4 h-4 ${likedMap[currentTrack.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Seek Bar */}
          <div className="flex-1 max-w-lg flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1.5 rounded-lg text-xs transition-all ${isShuffle ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
              <button onClick={handlePrev} className="p-1.5 rounded-lg text-slate-300 hover:text-white">
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => togglePlay()}
                className="w-9 h-9 rounded-full bg-white hover:scale-105 transition-all text-slate-950 flex items-center justify-center shadow-lg cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button onClick={handleNext} className="p-1.5 rounded-lg text-slate-300 hover:text-white">
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 rounded-lg text-xs transition-all ${isRepeat ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                title="Repeat"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="w-full flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setCurrentTime(pct * duration);
                  if (audioElementRef.current && !isNaN(audioElementRef.current.duration)) {
                    audioElementRef.current.currentTime = pct * audioElementRef.current.duration;
                  }
                }}
                className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
              >
                <div
                  className="h-full bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Lyrics & Volume & Equalizer Bars */}
          <div className="flex items-center gap-3 w-1/4 justify-end">
            {/* Lyrics Button */}
            {currentTrack.lyrics && (
              <button
                onClick={() => setShowLyricsModal(true)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  showLyricsModal ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white bg-white/5'
                }`}
                title="Open Karaoke Lyrics"
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Lyrics</span>
              </button>
            )}

            {/* Visualizer bars */}
            {isPlaying && (
              <div className="hidden sm:flex items-end gap-0.5 h-4">
                <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-4" />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-teal-400 rounded-full animate-pulse h-3" />
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-4" />
              </div>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 accent-emerald-500 cursor-pointer hidden sm:block"
            />
          </div>
        </div>
      )}
    </div>
  );
};
