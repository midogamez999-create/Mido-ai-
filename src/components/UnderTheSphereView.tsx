import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { UserAccount } from '../types';
import {
  Radio,
  FileText,
  Key,
  Shield,
  Play,
  Pause,
  AlertTriangle,
  Flame,
  Activity,
  Sparkles,
  X,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  Sliders,
  Terminal,
  Settings,
  BookOpen,
  Maximize,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  HelpCircle,
  Smartphone,
  ChevronRight,
  Compass,
  ArrowRight,
  RefreshCw,
  Zap,
  Skull
} from 'lucide-react';
import { soundFx } from '../lib/soundFx';
import {
  createBloodTexture,
  createHospitalWallTexture,
  createColdFloorTileTexture,
  createPardodeneSlimeTexture,
  createRealBioStalkerMonsterModel,
  createRealCorpseAbominationModel,
  createRealVoidSpectreModel,
  createHangingBodyBagModel,
  createAutopsySlabModel,
  createVirethiumCluster,
  createHangingWireModel,
  createItemInspectionModel,
} from '../lib/horrorAssets';

// ============================================================================
// UNDER THE SPHERE: 100% MOBILE-FIRST 3D SCI-FI HORROR GAME (CHAPTER 1)
// ============================================================================

interface UnderTheSphereViewProps {
  onExit: () => void;
  user: UserAccount | null;
}

// Lore Documents
interface LoreDocument {
  id: string;
  title: string;
  author: string;
  date: string;
  category: 'audio' | 'journal' | 'terminal' | 'security';
  preview: string;
  fullText: string;
  unlocked: boolean;
}

// All 8 Core Characters & Facility Lore Documents
const INITIAL_DOCUMENTS: LoreDocument[] = [
  {
    id: 'doc_solis_1',
    title: 'Dr. Kiera Solis — Patient 104 Quarantine Notice',
    author: 'Dr. Kiera Solis (Chief Medical Officer)',
    date: 'Facility Lockdown Day 1',
    category: 'journal',
    preview: 'Patients in Ward 4 are coughing up bioluminescent green phlegm...',
    fullText: `[CLASSIFIED MEDICAL REPORT - ST. JUDE MEMORIAL HOSPITAL]\nDate: 03:42 AM - Quarantine Protocol Alpha\nAuthor: Dr. Kiera Solis\n\nThe hospital received eight workers from Sub-level 3 suffering from severe respiratory necrosis. They were exposed to Pardodene vapors following the primary resonance spike in the Sphere chamber.\n\nTheir tissue is mutating at an exponential rate. Dr. Koined insisted on taking them to the Xenobiology Wing, but something broke out of Containment Unit B. If anyone reads this: The keypad code for Room 104 & the Medical Locker is 1-0-4-8. Take the emergency keycard and flashlight. Do NOT enter the contaminated corridors without the Pardodene Bio-Filter Mask!`,
    unlocked: true,
  },
  {
    id: 'doc_m7_audio',
    title: 'Technician M-7 — Generator Fuse Sequence',
    author: 'Technician M-7 (Sub-Level Maintenance)',
    date: 'Lockdown Day 2',
    category: 'audio',
    preview: 'The backup generator fuses blew when the power surge hit...',
    fullText: `[AUDIO TRANSCRIPTION - CASSETTE #04]\nTechnician M-7: "Can anyone hear me on the intercom?! The blast doors are sealed shut! If you need to restore power to the Hospital Main Corridors, the auxiliary breaker needs three high-capacity fuses inserted into the main panel in strict sequence:\n\n1. RED (Primary Thermal)\n2. BLUE (Cryo Coolant)\n3. GREEN (Pardodene Regulator)\n\nAny other sequence will trigger an emergency blackout! I can hear scratching in the ceiling vents... something is crawling up there..." [Static and screeching sound FX]`,
    unlocked: false,
  },
  {
    id: 'doc_koined_xviper',
    title: 'Dr. Aldon Koined — The Bio-Stalker Mutation',
    author: 'Dr. Aldon Koined (Head of Xenobiology)',
    date: 'Lockdown Day 3',
    category: 'journal',
    preview: 'Pardodene and biological tissue have achieved symbiosis...',
    fullText: `[XENOBIOLOGY RESEARCH LOG #44]\nAuthor: Dr. Aldon Koined\n\nMagnus was right! Pardodene is not a toxin; it is an evolutionary catalyst. Specimen XVI—the Bio-Stalker—has developed multi-jointed quadrupedal bone scythes capable of scaling sheer concrete walls. It hunts purely by acoustic vibrations and rapid movement. If you walk or crouch, it cannot perceive your location. But if you sprint or make sudden noise, it will drop from the ceiling within seconds!`,
    unlocked: false,
  },
  {
    id: 'doc_venn_nox',
    title: 'Dr. Sethra Venn — Sub-Level B3 Shadow Entities',
    author: 'Dr. Sethra Venn (Dark Energy Specialist)',
    date: 'Lockdown Day 4',
    category: 'journal',
    preview: 'Virethium resonance has pulled shadows out of the void...',
    fullText: `[DARK ENERGY LAB LOG #88]\nAuthor: Dr. Sethra Venn\n\nWhen the Virethium crystals reached 400 Terahertz, the darkness in Sub-level B3 became sentient. We designated the primary shadow entity as "Nox". It thrives in pitch-black corridors and drains body heat instantly. However, its molecular structure cannot withstand concentrated photon beams. A direct flashlight beam will burn its essence and force it to retreat into the vents. Keep your flashlight batteries charged!`,
    unlocked: false,
  },
  {
    id: 'doc_varn_glitchy',
    title: 'Dr. Elias Varn — Fragmented Consciousness',
    author: 'Dr. Elias Varn (Quantum Telemetry Lead)',
    date: 'Lockdown Day 5',
    category: 'terminal',
    preview: 'My physical body is gone. I exist across the network now...',
    fullText: `[TERMINAL BROADCAST - QUANTUM TELEMETRY]\nAuthor: Dr. Elias Varn (Entity "Glitchy")\n\nThe Sphere shattered my physical body into quantum telemetry packets. I am inside the facility systems now. When I approach, your optical feed and radar will suffer severe chromatic distortion and electromagnetic static. Do not fear the noise—it is merely the frequency of the Sphere calling you to Sub-level B4!`,
    unlocked: false,
  },
  {
    id: 'doc_hale_materials',
    title: 'Dr. Rowan Hale — Pardodene & Virethium Synthesis',
    author: 'Dr. Rowan Hale (Materials Science Chair)',
    date: 'Lockdown Day 5',
    category: 'journal',
    preview: 'The dual reaction between biological catalyst and crystalline isotope...',
    fullText: `[MATERIALS COMPENDIUM]\nAuthor: Dr. Rowan Hale\n\nPardodene is an organic hyper-mutagen capable of cellular reconfiguration. Virethium is an anisotropic crystal that bends spacetime curvature. When fused under magnetic containment, they stabilize the gravitational vortex around the Sphere. If the harmonic resonance falls outside the 50-30-70 ratio, the containment fails completely!`,
    unlocked: false,
  },
  {
    id: 'doc_rellin_sphere',
    title: 'Dr. Magnus Rellin — The Sphere Initiative Singularity',
    author: 'Dr. Magnus Rellin (Director of Sphere Initiative)',
    date: 'Lockdown Day 6',
    category: 'journal',
    preview: 'The Sphere is not a machine. It is a gateway to the next plane...',
    fullText: `[DIRECTOR CLASSIFIED EYES-ONLY DIARY]\nAuthor: Dr. Magnus Rellin\n\nThey called me mad for fusing Pardodene catalyst with Virethium crystalline isotopes. But look at the Sphere! It pulses with infinite dimensional energy. The breach was not a failure—it was the Awakening. To stabilize or seal the core, one must calibrate the three harmonic resonance dials (Alpha, Gamma, Delta) and insert the dual stabilizer rods into the primary reactor console. Will you shut the gate, or step through into the unknown?`,
    unlocked: false,
  },
  {
    id: 'doc_darius_security',
    title: 'Chief Guard Darius Klen — Final Stand of Squad Delta',
    author: 'Chief Guard Darius Klen (Security Commander)',
    date: 'Lockdown Day 6',
    category: 'security',
    preview: 'UV floodlights failed. We are retreating to the Sphere Core...',
    fullText: `[SECURITY LOG #109]\nAuthor: Chief Guard Darius Klen\n\nThe corpse abomination breached Ward 4 and slaughtered Bravo team in seconds. We secured the Level 2 Security Clearance Keycard in the Sub-Level B3 Security Office. If anyone is alive: The Sphere is critical! Seal the containment before the entire facility is swallowed into the rift!`,
    unlocked: false,
  }
];

// Tactical Survival Horror Inventory Item Model
interface InventoryItem {
  id: string;
  name: string;
  category: 'Key Item' | 'Medical' | 'Tool' | 'Document' | 'Ammo' | 'Chemical';
  icon: string;
  description: string;
  count?: number;
  usable?: boolean;
  combinableWith?: string[];
  examineDetail?: {
    lore: string;
    clueSecret?: string;
    modelType?: 'syringe' | 'bone_saw' | 'keycard' | 'tape' | 'flashlight' | 'chemical_vial';
    audioLog?: string;
  };
}

const SAVE_STORAGE_KEY = 'underthesphere_save_v1';

export const UnderTheSphereView: React.FC<UnderTheSphereViewProps> = ({ onExit, user }) => {
  // Screen Lifecycle
  const [screenState, setScreenState] = useState<'loading' | 'menu' | 'intro' | 'playing' | 'paused' | 'victory'>('loading');
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'secrets' | 'credits' | 'documents' | 'inventory'>('none');
  
  // Save Game State Detection
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Chapter 1 Progress State
  const [chapterStep, setChapterStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>('OBJECTIVE: FIND A WAY OUT');
  
  // Player Stats
  const [health, setHealth] = useState<number>(100);
  const [sanity, setSanity] = useState<number>(100);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(true);
  const [flashlightBattery, setFlashlightBattery] = useState<number>(100);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [isCrouching, setIsCrouching] = useState<boolean>(false);
  
  // Sensory & Monster Danger Meters
  const [geigerLevel, setGeigerLevel] = useState<number>(15);
  const [heartbeatBpm, setHeartbeatBpm] = useState<number>(74);
  const [activeThreat, setActiveThreat] = useState<'none' | 'xviper' | 'nox' | 'lemme_demme' | 'glitchy'>('none');
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [ambientGlow, setAmbientGlow] = useState<string>('#4f46e5');

  // Tactical Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'flashlight',
      name: 'Tactical Flashlight',
      category: 'Tool',
      icon: '🔦',
      description: 'Heavy military-grade photon emitter. Pierces heavy shadows and burns shadow entities like Nox.',
      usable: true,
      examineDetail: {
        lore: 'Standard issue St. Jude security torch. Requires 12V Lithium cells.',
        clueSecret: 'SN #0008-TACTICAL',
        modelType: 'flashlight'
      }
    },
    {
      id: 'adrenaline_syringe',
      name: 'Adrenaline Auto-Injector',
      category: 'Medical',
      icon: '💉',
      description: 'Restores +45% Health instantly and temporarily lowers heart rate tremors.',
      count: 2,
      usable: true,
      examineDetail: {
        lore: 'Synthesized with 2% Pardodene stabilizer. Stimulates cardiovascular recovery.',
        clueSecret: 'ST. JUDE EMERGENCY TRIAGE PROTOCOL',
        modelType: 'syringe'
      }
    },
    {
      id: 'bone_saw',
      name: 'Stainless Steel Bone Saw',
      category: 'Tool',
      icon: '🪚',
      description: 'Heavy serrated surgical tool. Useful for cutting through rusted containment chains and emergency defense.',
      usable: false,
      examineDetail: {
        lore: 'Found beside the dissection slab in Mortuary Ward B. Stained with coagulated tissue.',
        clueSecret: 'PATIENT #104 AUTOPSY INCISION 10-48',
        modelType: 'bone_saw'
      }
    },
    {
      id: 'battery',
      name: 'Lithium Battery Pack',
      category: 'Ammo',
      icon: '🔋',
      description: 'Restores tactical flashlight battery by +50%.',
      count: 2,
      usable: true,
      combinableWith: ['flashlight'],
      examineDetail: {
        lore: 'High-density lithium ion cell stamped with the Sphere Initiative insignia.',
        modelType: 'flashlight'
      }
    },
    {
      id: 'cassette_04',
      name: 'Audio Cassette #04',
      category: 'Document',
      icon: '📼',
      description: 'Technician M-7 maintenance log regarding auxiliary breaker fuse sequence.',
      usable: true,
      examineDetail: {
        lore: 'Tape recorded 2 hours before the facility power breach. Screeches in the background.',
        clueSecret: 'FUSE SEQUENCE: 1-RED, 2-BLUE, 3-GREEN',
        modelType: 'tape',
        audioLog: 'Technician M-7: The auxiliary power breaker requires RED, BLUE, then GREEN in exact sequence!'
      }
    },
    {
      id: 'pda',
      name: 'Sphere Initiative Data PAD',
      category: 'Key Item',
      icon: '📱',
      description: 'Classified terminal logger containing decrypted scientist reports, maps, and audio logs.',
      usable: false,
      examineDetail: {
        lore: 'Encrypted with Level 2 Security Protocol. Stamped by Dr. Kiera Solis.',
        clueSecret: 'OVERRIDE CODE: 0008'
      }
    }
  ]);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [combineSourceItem, setCombineSourceItem] = useState<InventoryItem | null>(null);
  const [quickSlots, setQuickSlots] = useState<{ [slot: number]: string }>({ 1: 'flashlight', 2: 'adrenaline_syringe', 3: 'battery' });
  const [audioCassettePlaying, setAudioCassettePlaying] = useState<boolean>(false);

  const [documents, setDocuments] = useState<LoreDocument[]>(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<LoreDocument | null>(INITIAL_DOCUMENTS[0]);

  // Working Puzzles State
  const [activePuzzle, setActivePuzzle] = useState<'none' | 'room104_pin' | 'breaker_fuses' | 'resonance_mixer' | 'sphere_console'>('none');
  const [roomPinInput, setRoomPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [doorRoom104Unlocked, setDoorRoom104Unlocked] = useState<boolean>(false);
  
  const [breakerFusesInserted, setBreakerFusesInserted] = useState<('red' | 'blue' | 'green')[]>([]);
  const [breakerError, setBreakerError] = useState<string | null>(null);
  const [powerRestored, setPowerRestored] = useState<boolean>(false);

  const [alphaDial, setAlphaDial] = useState<number>(50);
  const [gammaDial, setGammaDial] = useState<number>(30);
  const [deltaDial, setDeltaDial] = useState<number>(70);
  const [mixerSolved, setMixerSolved] = useState<boolean>(false);

  // Secret Codes State
  const [secretCodeInput, setSecretCodeInput] = useState<string>('');
  const [secretCodeNotice, setSecretCodeNotice] = useState<string | null>(null);
  const [unlockedSecrets, setUnlockedSecrets] = useState<string[]>(['0008']);

  // Mobile Settings
  const [masterVolume, setMasterVolume] = useState<number>(85);
  const [musicVolume, setMusicVolume] = useState<number>(75);
  const [sfxVolume, setSfxVolume] = useState<number>(90);
  const [touchSensitivity, setTouchSensitivity] = useState<number>(1.2);
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 3D Canvas & WebGL Engine Refs
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flashlightLightRef = useRef<THREE.SpotLight | null>(null);
  const volumetricBeamRef = useRef<THREE.Mesh | null>(null);
  const bioStalkerMonsterRef = useRef<THREE.Group | null>(null);
  const corpseAbominationRef = useRef<THREE.Group | null>(null);
  const voidSpectreRef = useRef<THREE.Group | null>(null);
  const glitchyHologramRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const sphereRingsRef = useRef<THREE.Group | null>(null);
  const doorMeshRef = useRef<THREE.Mesh | null>(null);
  const corridorDoorRef = useRef<THREE.Mesh | null>(null);
  const interactiveObjectsRef = useRef<{ id: string; mesh: THREE.Object3D; name: string; action: () => void }[]>([]);

  // 3D Item Inspection Viewer Refs
  const itemViewerMountRef = useRef<HTMLDivElement | null>(null);
  const itemViewerSceneRef = useRef<THREE.Scene | null>(null);
  const itemViewerRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const itemViewerMeshGroupRef = useRef<THREE.Group | null>(null);
  const itemViewerTouchLastRef = useRef<{ x: number; y: number } | null>(null);


  // Jumpscare & Horror FX State
  const [jumpscareFlash, setJumpscareFlash] = useState<boolean>(false);
  const [jumpscareEntity, setJumpscareEntity] = useState<string | null>(null);
  const [screenGlitch, setScreenGlitch] = useState<boolean>(false);
  const [bloodSplatterScreen, setBloodSplatterScreen] = useState<boolean>(false);

  // Player Physics & Movement State
  const playerPos = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 1.6, z: 2 });
  const playerRot = useRef<{ pitch: number; yaw: number }>({ pitch: 0, yaw: 0 });
  const moveVector = useRef<{ forward: number; strafe: number }>({ forward: 0, strafe: 0 });
  const animFrameId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Touch Virtual Joystick State
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const [joystickKnobPos, setJoystickKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);

  // Touch Camera Look Drag State
  const lookTouchIdRef = useRef<number | null>(null);
  const lookLastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Subtitle Dispatcher
  const showToast = useCallback((msg: string, durationMs: number = 3800) => {
    setSubtitles(msg);
    setTimeout(() => setSubtitles(null), durationMs);
  }, []);

  // Web Audio Mobile Horror Synthesizer
  const playSfx = useCallback((type: 'alarm' | 'heartbeat' | 'geiger' | 'spark' | 'unlock' | 'screech' | 'creak' | 'hum' | 'whisper' | 'footstep') => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      const vol = (masterVolume / 100) * (sfxVolume / 100) * 0.35;
      gainNode.gain.setValueAtTime(vol, now);
      gainNode.connect(ctx.destination);

      if (type === 'alarm') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.linearRampToValueAtTime(290, now + 0.3);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'heartbeat') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);
        gainNode.gain.setValueAtTime(vol * 1.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'geiger') {
        const bufferSize = ctx.sampleRate * 0.015;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2800, now);
        noise.connect(filter);
        filter.connect(gainNode);
        noise.start(now);
      } else if (type === 'unlock') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        gainNode.gain.setValueAtTime(vol * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'spark') {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(750, now + 0.04);
        gainNode.gain.setValueAtTime(vol * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'screech') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.55);
        gainNode.gain.setValueAtTime(vol * 0.85, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'whisper') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.7);
        gainNode.gain.setValueAtTime(vol * 0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (type === 'footstep') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        gainNode.gain.setValueAtTime(vol * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    } catch {
      // audio fallback
    }
  }, [isMuted, masterVolume, sfxVolume]);

  // Check LocalStorage Save on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_STORAGE_KEY);
      if (saved) {
        setHasSavedGame(true);
      }
    } catch {
      // storage unavailable
    }
  }, []);

  // Save Game Functionality
  const handleSaveGame = () => {
    try {
      const saveData = {
        chapterStep,
        objective,
        health,
        sanity,
        flashlightBattery,
        doorRoom104Unlocked,
        powerRestored,
        mixerSolved,
        playerPos: playerPos.current,
        playerRot: playerRot.current,
        inventory,
        documents,
        unlockedSecrets,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
      setHasSavedGame(true);
      setSaveMessage('💾 Game Saved Successfully to Phone Storage!');
      soundFx.playCelebration();
      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage('❌ Save Failed: Storage Full or Blocked.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Load Game Functionality
  const handleLoadGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.chapterStep) setChapterStep(data.chapterStep);
      if (data.objective) setObjective(data.objective);
      if (data.health) setHealth(data.health);
      if (data.sanity) setSanity(data.sanity);
      if (data.flashlightBattery) setFlashlightBattery(data.flashlightBattery);
      if (data.doorRoom104Unlocked !== undefined) setDoorRoom104Unlocked(data.doorRoom104Unlocked);
      if (data.powerRestored !== undefined) setPowerRestored(data.powerRestored);
      if (data.mixerSolved !== undefined) setMixerSolved(data.mixerSolved);
      if (data.playerPos) playerPos.current = data.playerPos;
      if (data.playerRot) playerRot.current = data.playerRot;
      if (data.inventory) setInventory(data.inventory);
      if (data.documents) setDocuments(data.documents);
      if (data.unlockedSecrets) setUnlockedSecrets(data.unlockedSecrets);

      setScreenState('playing');
      showToast('📂 Saved Session Restored! Welcome back to Delta-7.', 4000);
      playSfx('unlock');
    } catch {
      showToast('❌ Failed to load save data.', 3000);
    }
  };

  // Loading Screen Timer
  useEffect(() => {
    if (screenState === 'loading') {
      const timer = setTimeout(() => {
        playSfx('hum');
        setScreenState('menu');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [screenState, playSfx]);

  // ----------------------------------------------------
  // THREE.JS MOBILE-OPTIMIZED 3D HORROR SCENE
  // ----------------------------------------------------
  useEffect(() => {
    if (screenState !== 'playing' && screenState !== 'intro') return;
    const container = mountRef.current;
    if (!container) return;

    // ----------------------------------------------------
    // THREE.JS HIGH-FIDELITY MOBILE HORROR SCENE ENGINE
    // ----------------------------------------------------
    // 1. Scene & Fog Setup (Atmospheric Dark Indigo Void)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050c);
    scene.fog = new THREE.FogExp2(0x050914, 0.075);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 90);
    camera.position.set(playerPos.current.x, playerPos.current.y, playerPos.current.z);
    cameraRef.current = camera;

    // 2. WebGL Renderer with High-Performance Mobile Settings
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(graphicsQuality === 'high' ? Math.min(window.devicePixelRatio, 1.8) : 1.0);
    renderer.shadowMap.enabled = graphicsQuality === 'high';
    if (renderer.shadowMap.enabled) {
      renderer.shadowMap.type = THREE.BasicShadowMap;
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Dynamic Lighting (Volumetric, Hazard Strobes, Glowing Bioluminescence)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 0.5);
    scene.add(ambientLight);

    // Player Tactical Flashlight with Volumetric Photon Cone
    const flashlight = new THREE.SpotLight(0xfff5e6, 12, 28, Math.PI / 5.2, 0.45, 1.2);
    flashlight.position.set(0, 1.5, 2);
    scene.add(flashlight);
    flashlightLightRef.current = flashlight;

    // Volumetric Flashlight Beam Cone Mesh
    const beamGeo = new THREE.ConeGeometry(1.8, 12, 16, 1, true);
    beamGeo.translate(0, -6, 0);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const volumetricBeam = new THREE.Mesh(beamGeo, beamMat);
    scene.add(volumetricBeam);
    volumetricBeamRef.current = volumetricBeam;

    // Hospital Room 104 Lamp (Flickering Cyan Surgical Light)
    const hospitalLamp = new THREE.PointLight(0x38bdf8, 3.5, 12, 1.6);
    hospitalLamp.position.set(0, 3.2, 0);
    scene.add(hospitalLamp);

    // Corridor Crimson Hazard Alarm Strobe
    const corridorLight = new THREE.PointLight(0xef4444, powerRestored ? 5.5 : 2.0, 16, 1.8);
    corridorLight.position.set(0, 2.9, -12);
    scene.add(corridorLight);

    // Xenobiology Lab Slime Emerald Light
    const biohazardLight = new THREE.PointLight(0x10b981, 6.0, 18, 1.4);
    biohazardLight.position.set(-3, 2.2, -24);
    scene.add(biohazardLight);

    // Virethium Crystal Cluster Violet Light
    const crystalLight = new THREE.PointLight(0xc084fc, 5.0, 14, 1.6);
    crystalLight.position.set(3, 1.5, -28);
    scene.add(crystalLight);

    // Clear and Register Interactive 3D Objects
    interactiveObjectsRef.current = [];

    // 4. High-Detail Photorealistic Procedural Textures
    const floorTex = createColdFloorTileTexture();
    const wallTex = createHospitalWallTexture();

    // 5. Architectural Geometry
    // Floor with Grungy Hospital Tiles
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 70),
      new THREE.MeshStandardMaterial({
        map: floorTex,
        roughness: 0.45,
        metalness: 0.25,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -20);
    scene.add(floor);

    // Ceiling with Dark Steel Plates
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 70),
      new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.95 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.6, -20);
    scene.add(ceiling);

    // Wall Construction Helper
    const makeWall = (w: number, h: number, x: number, y: number, z: number, rotY: number = 0) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.25),
        new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.65, metalness: 0.3 })
      );
      wall.position.set(x, y, z);
      wall.rotation.y = rotY;
      scene.add(wall);
      return wall;
    };

    // Helper: Add Floor Decal (Blood Pools, Trails, Slime)
    const addFloorDecal = (tex: THREE.CanvasTexture, w: number, h: number, x: number, z: number, rotZ: number = 0) => {
      const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.15, // Wet slick glossy look
          metalness: 0.1,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        })
      );
      decal.rotation.x = -Math.PI / 2;
      decal.rotation.z = rotZ;
      decal.position.set(x, 0.02, z);
      scene.add(decal);
      return decal;
    };

    // Helper: Add Wall Decal (Bloody Handprints, Graffiti, Arterial Splatter)
    const addWallDecal = (tex: THREE.CanvasTexture, w: number, h: number, x: number, y: number, z: number, rotY: number = 0) => {
      const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.5,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        })
      );
      decal.position.set(x, y, z);
      decal.rotation.y = rotY;
      scene.add(decal);
      return decal;
    };

    // ----------------------------------------------------
    // ROOM 104: STARTING QUARANTINE WARD
    // ----------------------------------------------------
    makeWall(8, 3.6, -4.0, 1.8, 0, Math.PI / 2);
    makeWall(8, 3.6, 4.0, 1.8, 0, Math.PI / 2);
    makeWall(8, 3.6, 0, 1.8, 4.0);
    makeWall(3.2, 3.6, -2.4, 1.8, -4.0);
    makeWall(3.2, 3.6, 2.4, 1.8, -4.0);

    // Visceral Arterial Blood Pools & Splatters on Room 104 Floor
    addFloorDecal(createBloodTexture('pool'), 3.6, 3.6, -1.8, 1.5, 0.4);
    addFloorDecal(createBloodTexture('trail'), 2.2, 5.5, 0, -1.2, 0);
    addFloorDecal(createBloodTexture('arterial'), 2.8, 2.8, 2.0, 1.0, 1.2);

    // Wall Blood Graffiti in Room 104
    addWallDecal(createBloodTexture('graffiti', "DON'T LOOK UP"), 2.2, 1.2, 0, 2.3, 3.85, Math.PI);
    addWallDecal(createBloodTexture('handprint'), 0.8, 0.8, -3.85, 1.8, 0.5, Math.PI / 2);
    addWallDecal(createBloodTexture('handprint'), 0.8, 0.8, -3.85, 1.3, 0.2, Math.PI / 2);
    addWallDecal(createBloodTexture('splatter'), 2.0, 2.0, 3.85, 1.9, 1.8, -Math.PI / 2);

    // Room 104 Blast Door (Puzzle 1)
    const door104 = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 })
    );
    door104.position.set(0, 1.6, -4.0);
    if (doorRoom104Unlocked) {
      door104.position.x = 2.0; // Open
    }
    doorMeshRef.current = door104;
    scene.add(door104);

    // Bloody handprint on Blast Door
    addWallDecal(createBloodTexture('handprint'), 0.7, 0.7, 0.2, 1.6, -3.88, 0);

    interactiveObjectsRef.current.push({
      id: 'door_room104',
      mesh: door104,
      name: 'Room 104 Blast Door Keypad',
      action: () => {
        if (!doorRoom104Unlocked) {
          playSfx('spark');
          setActivePuzzle('room104_pin');
        } else {
          showToast('🚪 Blast door unlocked. Hallway clear to proceed.', 2500);
        }
      }
    });

    // Medical Desk with Dr. Solis's Clipboard
    const deskGroup = new THREE.Group();
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    deskTop.position.set(0, 0.8, 0);

    const clipboardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.05, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    clipboardMesh.position.set(0.35, 0.88, 0);

    // Hospital Monitor with Glowing EKG Line
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 1.2 })
    );
    monitor.position.set(-0.35, 1.1, 0.1);

    deskGroup.add(deskTop, clipboardMesh, monitor);
    deskGroup.position.set(2.4, 0, 1.2);
    scene.add(deskGroup);

    interactiveObjectsRef.current.push({
      id: 'clipboard_solis',
      mesh: clipboardMesh,
      name: 'Dr. Solis Medical Clipboard',
      action: () => {
        playSfx('unlock');
        setSelectedDoc(INITIAL_DOCUMENTS[0]);
        setActiveModal('documents');
        setChapterStep(prev => Math.max(2, prev));
        showToast('📄 Found Document: Dr. Solis Patient Notice (PIN: 1-0-4-8)', 4500);
      }
    });

    // Realistic Autopsy Dissection Slab in Quarantine Ward
    const autopsySlab1 = createAutopsySlabModel();
    autopsySlab1.position.set(-2.2, 0, 1.5);
    scene.add(autopsySlab1);

    // Hanging Morgue Body Bag dripping blood in corner
    const bodyBag1 = createHangingBodyBagModel();
    bodyBag1.position.set(-2.8, 0.5, -2.5);
    scene.add(bodyBag1);

    // Overturned IV Drip Stand
    const ivPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    ivPole.rotation.z = Math.PI / 2.2;
    ivPole.position.set(-1.0, 0.1, 2.8);
    scene.add(ivPole);

    // ----------------------------------------------------
    // CORRIDOR & DETAILED SURVIVAL HORROR PROPS
    // ----------------------------------------------------
    makeWall(20, 3.6, -4.0, 1.8, -14, Math.PI / 2);
    makeWall(20, 3.6, 4.0, 1.8, -14, Math.PI / 2);

    // Deep Blood Graffiti and Arterial Spray on Corridor Walls
    addWallDecal(createBloodTexture('graffiti', 'THE FLESH IS MUTATING'), 2.6, 1.2, -3.85, 2.1, -8.0, Math.PI / 2);
    addWallDecal(createBloodTexture('graffiti', 'FEED IT TO THE SPHERE'), 2.6, 1.2, 3.85, 2.2, -10.5, -Math.PI / 2);
    addWallDecal(createBloodTexture('graffiti', 'NO ESCAPE'), 1.8, 1.0, -3.85, 1.8, -16.0, Math.PI / 2);
    addWallDecal(createBloodTexture('arterial'), 2.5, 2.5, 3.85, 1.9, -13.5, -Math.PI / 2);

    // Corridor Floor Visceral Blood Decals
    addFloorDecal(createBloodTexture('trail'), 2.2, 7.0, 0, -8.0, 0);
    addFloorDecal(createBloodTexture('pool'), 3.2, 3.2, 1.2, -13.0, 0.8);
    addFloorDecal(createBloodTexture('arterial'), 2.8, 2.8, -1.5, -16.5, 0.2);

    // Stainless Steel Autopsy Dissection Table in Corridor
    const autopsySlab2 = createAutopsySlabModel();
    autopsySlab2.position.set(-1.8, 0, -11.0);
    autopsySlab2.rotation.y = 0.3;
    scene.add(autopsySlab2);

    // Hanging Morgue Body Bags from Ceiling Chains
    const bodyBag2 = createHangingBodyBagModel();
    bodyBag2.position.set(2.2, 0.4, -9.0);
    const bodyBag3 = createHangingBodyBagModel();
    bodyBag3.position.set(-2.0, 0.4, -14.5);
    scene.add(bodyBag2, bodyBag3);

    // Dangling Ceiling Electrical Wires with Sparking Live Tips
    const wire1 = createHangingWireModel();
    wire1.position.set(0.5, 2.0, -7.5);
    const wire2 = createHangingWireModel();
    wire2.position.set(-0.8, 2.0, -14.0);
    scene.add(wire1, wire2);

    // Power Substation Breaker Box (Puzzle 2)
    const breakerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.25 })
    );
    breakerBox.position.set(3.85, 1.8, -11.5);
    scene.add(breakerBox);

    interactiveObjectsRef.current.push({
      id: 'breaker_box',
      mesh: breakerBox,
      name: 'Auxiliary Power Breaker',
      action: () => {
        if (!powerRestored) {
          playSfx('spark');
          setActivePuzzle('breaker_fuses');
        } else {
          showToast('⚡ Auxiliary substation power is active. Corridor illuminated.', 3000);
        }
      }
    });

    // Medical Storage Cart with Power Fuse
    const cartMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
    );
    cartMesh.position.set(-2.8, 0.45, -8.5);
    scene.add(cartMesh);

    const fuseProp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.2 })
    );
    fuseProp.position.set(-2.8, 0.98, -8.5);
    scene.add(fuseProp);

    interactiveObjectsRef.current.push({
      id: 'fuse_pickup',
      mesh: fuseProp,
      name: 'Auxiliary Power Fuse (Component)',
      action: () => {
        playSfx('unlock');
        fuseProp.visible = false;
        setInventory(prev => [
          ...prev.filter(i => i.id !== 'fuse_component'),
          {
            id: 'fuse_component',
            name: 'Auxiliary Power Fuse',
            category: 'Tool',
            icon: '⚡',
            description: 'Thermal fuse required to restore power at the substation breaker.',
            usable: false,
            examineDetail: {
              lore: 'High-voltage breaker component. Marked with sequence indicator RED-1.',
              clueSecret: 'BREAKER SEQUENCE: 1-RED, 2-BLUE, 3-GREEN'
            }
          }
        ]);
        showToast('⚡ Picked up: Auxiliary Power Fuse! Insert into breaker.', 4500);
      }
    });

    // Security Terminal & Level 2 Keycard (Puzzle 3)
    const secDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.85, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    secDesk.position.set(-2.6, 0.42, -15.5);
    scene.add(secDesk);

    const keycardProp = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.04, 0.35),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 1.4 })
    );
    keycardProp.position.set(-2.6, 0.88, -15.5);
    scene.add(keycardProp);

    interactiveObjectsRef.current.push({
      id: 'keycard_pickup',
      mesh: keycardProp,
      name: 'Level 2 Security Keycard',
      action: () => {
        playSfx('unlock');
        keycardProp.visible = false;
        setInventory(prev => [
          ...prev.filter(i => i.id !== 'keycard_lvl2'),
          {
            id: 'keycard_lvl2',
            name: 'Level 2 Security Keycard',
            category: 'Key Item',
            icon: '💳',
            description: 'Security clearance for Xenobiology Research & Sub-Level B3.',
            usable: false,
            examineDetail: {
              lore: 'Authorizes entry to Containment Lab and Sub-Level B4 Sphere Singularity.',
              clueSecret: 'ENCRYPTED PASSCODE: 0008',
              modelType: 'keycard'
            }
          }
        ]);
        setChapterStep(prev => Math.max(6, prev));
        setObjective('OBJECTIVE: ENTER RESEARCH LAB & CALIBRATE BIO-FILTER');
        showToast('💳 Acquired Level 2 Security Keycard! Unlocked Research Laboratory.', 4500);
        setDocuments(prev => prev.map(d => d.id === 'doc_darius_security' ? { ...d, unlocked: true } : d));
      }
    });

    // ----------------------------------------------------
    // 3D PHOTOREALISTIC ANIMATED HORROR MONSTERS
    // ----------------------------------------------------
    // 1. BIO-FLAYED APEX STALKER (MUTATED HUMAN EXPERIMENT)
    const bioStalker = createRealBioStalkerMonsterModel();
    bioStalker.position.set(2.4, 0, -16.5);
    bioStalker.rotation.y = -Math.PI / 4;
    scene.add(bioStalker);
    bioStalkerMonsterRef.current = bioStalker;

    // 2. DISSECTED CORPSE ABOMINATION (VENT CEILING STALKER)
    const corpseAbom = createRealCorpseAbominationModel();
    corpseAbom.position.set(0, 0.1, -12.5);
    scene.add(corpseAbom);
    corpseAbominationRef.current = corpseAbom;

    // 3. SENTIENT VOID SPECTRE (DARK ENERGY ENTITY NOX)
    const voidSpectre = createRealVoidSpectreModel();
    voidSpectre.position.set(-2.5, 0.4, -26.0);
    scene.add(voidSpectre);
    voidSpectreRef.current = voidSpectre;

    // Security Corridor Blast Door
    const corridorDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 3.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.8, roughness: 0.2 })
    );
    corridorDoor.position.set(0, 1.6, -18);
    corridorDoorRef.current = corridorDoor;
    scene.add(corridorDoor);

    interactiveObjectsRef.current.push({
      id: 'corridor_security_door',
      mesh: corridorDoor,
      name: 'Research Laboratory Security Door',
      action: () => {
        const hasKey = inventory.some(i => i.id === 'keycard_lvl2');
        if (hasKey) {
          playSfx('unlock');
          corridorDoor.position.x = 2.2; // Open
          setChapterStep(prev => Math.max(8, prev));
          showToast('🔓 Security Clearance Accepted: Entering Xenobiology Research Wing.', 4000);
        } else {
          playSfx('screech');
          showToast('🔒 SECURITY ACCESS REQUIRED: Retrieve Level 2 Keycard from Security Desk.', 4000);
        }
      }
    });

    // ----------------------------------------------------
    // XENOBIOLOGY WING: PARDODENE SLIME & VIRETHIUM CRYSTALS
    // ----------------------------------------------------
    // Glowing Toxic Pardodene Pool
    const slimeTex = createPardodeneSlimeTexture();
    const pardodenePoolMesh = addFloorDecal(slimeTex, 4.5, 4.5, -2.5, -24, 0);

    // Glowing Purple Virethium Crystal Clusters
    const crystalCluster1 = createVirethiumCluster();
    crystalCluster1.position.set(2.8, 0, -25);
    const crystalCluster2 = createVirethiumCluster();
    crystalCluster2.position.set(-2.8, 0, -28);
    crystalCluster2.scale.set(1.3, 1.3, 1.3);
    scene.add(crystalCluster1, crystalCluster2);

    // Harmonic Resonance Mixer Console
    const mixerConsole = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.95, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, emissive: 0x3730a3, emissiveIntensity: 0.8 })
    );
    mixerConsole.position.set(0, 0.85, -27);
    scene.add(mixerConsole);

    interactiveObjectsRef.current.push({
      id: 'mixer_console',
      mesh: mixerConsole,
      name: 'Harmonic Calibration Console',
      action: () => {
        if (!mixerSolved) {
          playSfx('hum');
          setActivePuzzle('resonance_mixer');
        } else {
          showToast('🧪 Resonance filter calibrated. Sub-Level B4 Sphere chamber unlocked!', 3000);
        }
      }
    });

    // ----------------------------------------------------
    // SUB-LEVEL B4: THE SPHERE SINGULARITY (CLIMAX)
    // ----------------------------------------------------
    const sphereGroup = new THREE.Group();
    const sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 36, 36),
      new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4338ca,
        emissiveIntensity: 1.8,
        roughness: 0.15,
        metalness: 0.85,
      })
    );
    sphereMeshRef.current = sphereMesh;

    // Glowing Planetary Dimensional Rings
    const ringsGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.6 + i * 0.9, 0.08, 12, 64),
        new THREE.MeshBasicMaterial({
          color: i === 0 ? 0xa855f7 : i === 1 ? 0x06b6d4 : i === 2 ? 0xec4899 : 0x10b981,
        })
      );
      ring.rotation.x = Math.PI / 3 + i * 0.4;
      ring.rotation.y = i * 0.5;
      ringsGroup.add(ring);
    }
    sphereRingsRef.current = ringsGroup;

    sphereGroup.add(sphereMesh, ringsGroup);
    sphereGroup.position.set(0, 3.6, -42);
    scene.add(sphereGroup);

    // Sphere Chamber Wireframe Glitch Phantom (Dr. Varn)
    const glitchGeo = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8);
    const glitchMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const glitchPhantom = new THREE.Mesh(glitchGeo, glitchMat);
    glitchPhantom.position.set(2.2, 1.4, -36);
    scene.add(glitchPhantom);
    glitchyHologramRef.current = glitchPhantom;

    // Final Sphere Reactor Console
    const finalConsole = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.1, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x7e22ce, emissiveIntensity: 0.9 })
    );
    finalConsole.position.set(0, 0.55, -35);
    scene.add(finalConsole);

    interactiveObjectsRef.current.push({
      id: 'final_sphere_console',
      mesh: finalConsole,
      name: 'Sphere Singularity Containment Terminal',
      action: () => {
        playSfx('screech');
        setActivePuzzle('sphere_console');
      }
    });

    // ----------------------------------------------------
    // FLOATING BIOLUMINESCENT SPORE / DUST PARTICLES
    // ----------------------------------------------------
    const particleCount = graphicsQuality === 'high' ? 350 : 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12; // X
      particlePositions[i + 1] = Math.random() * 3.5;    // Y
      particlePositions[i + 2] = -Math.random() * 46;    // Z
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // ----------------------------------------------------
    // REAL-TIME RENDER & HORROR ANIMATION LOOP
    // ----------------------------------------------------
    let lastTime = performance.now();
    let jumpscareCooldown = false;

    const animate = () => {
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Update Player Movement & Camera
      const cam = cameraRef.current;
      if (cam) {
        const speed = (isSprinting ? 5.4 : isCrouching ? 1.7 : 3.2) * delta;
        const sinYaw = Math.sin(playerRot.current.yaw);
        const cosYaw = Math.cos(playerRot.current.yaw);

        const dx = (moveVector.current.strafe * cosYaw + moveVector.current.forward * -sinYaw) * speed;
        const dz = (moveVector.current.strafe * sinYaw + moveVector.current.forward * -cosYaw) * speed;

        playerPos.current.x = Math.max(-10, Math.min(10, playerPos.current.x + dx));
        playerPos.current.z = Math.max(-46, Math.min(3.2, playerPos.current.z + dz));

        cam.position.x = playerPos.current.x;
        cam.position.y = isCrouching ? 0.9 : 1.6;
        cam.position.z = playerPos.current.z;

        cam.rotation.order = 'YXZ';
        cam.rotation.y = playerRot.current.yaw;
        cam.rotation.x = playerRot.current.pitch;

        // Tactical Flashlight & Volumetric Beam Tracking
        if (flashlightLightRef.current) {
          flashlightLightRef.current.position.copy(cam.position);
          const targetPos = new THREE.Vector3();
          cam.getWorldDirection(targetPos);
          flashlightLightRef.current.target.position.copy(cam.position).add(targetPos.clone().multiplyScalar(5));
          flashlightLightRef.current.target.updateMatrixWorld();
          
          const isLightActive = flashlightOn && flashlightBattery > 0;
          flashlightLightRef.current.intensity = isLightActive ? (graphicsQuality === 'high' ? 14 : 9) : 0;

          // Volumetric Cone Mesh
          if (volumetricBeamRef.current) {
            volumetricBeamRef.current.position.copy(cam.position);
            volumetricBeamRef.current.quaternion.copy(cam.quaternion);
            volumetricBeamRef.current.visible = isLightActive;
          }
        }

        // Automatic Proximity Story & Horror Triggers
        const pz = playerPos.current.z;
        if (pz < -6 && chapterStep < 4 && doorRoom104Unlocked) {
          setChapterStep(4);
          setObjective('OBJECTIVE: EXPLORE CORRIDORS & RESTORE POWER');
        } else if (pz < -12 && pz > -16 && !jumpscareCooldown && chapterStep < 7) {
          // Jumpscare 1: Lemme Demme Head Twitch & Light Flicker
          jumpscareCooldown = true;
          setChapterStep(7);
          setActiveThreat('lemme_demme');
          playSfx('screech');
          setJumpscareFlash(true);
          setJumpscareEntity('LEMME DEMME');
          setScreenGlitch(true);
          setBloodSplatterScreen(true);
          setTimeout(() => {
            setJumpscareFlash(false);
            setScreenGlitch(false);
          }, 600);
          setTimeout(() => setBloodSplatterScreen(false), 3500);
          showToast('🚨 [CONTAINMENT FAILURE]: Lemme Demme is watching you from the shadows!', 4500);
          setDocuments(prev => prev.map(d => d.id === 'doc_koined_xviper' ? { ...d, unlocked: true } : d));
        } else if (pz < -20 && chapterStep < 8) {
          setChapterStep(8);
          setActiveThreat('xviper');
          playSfx('screech');
          showToast('⚠️ [CEILING SCRATCHING]: XVI-Xviper stalking in vents! Do not sprint!', 4500);
        } else if (pz < -26 && chapterStep < 9) {
          setChapterStep(9);
          setActiveThreat('nox');
          playSfx('whisper');
          showToast('🌑 [COLD AIR]: Nox is looming! Flashlight photon beam repels shadow!', 4500);
          setDocuments(prev => prev.map(d => d.id === 'doc_venn_nox' ? { ...d, unlocked: true } : d));
        } else if (pz < -33 && chapterStep < 11) {
          setChapterStep(11);
          setObjective('OBJECTIVE: STABILIZE THE SPHERE SINGULARITY');
          showToast('🌀 SUB-LEVEL B4: THE GRAND SPHERE CHAMBER', 5000);
          setDocuments(prev => prev.map(d => d.id === 'doc_rellin_sphere' || d.id === 'doc_varn_glitchy' ? { ...d, unlocked: true } : d));
        }
      }

      // Animate Bio-Flayed Apex Stalker (Sinister Spasm, Twitching Bone Blades)
      if (bioStalkerMonsterRef.current) {
        const twitch = Math.sin(now * 0.007) * 0.08 + Math.cos(now * 0.013) * 0.04;
        bioStalkerMonsterRef.current.rotation.y = -Math.PI / 4 + twitch;
        const chestBreathing = 1.0 + Math.sin(now * 0.004) * 0.05;
        bioStalkerMonsterRef.current.scale.set(1.0, chestBreathing, 1.0);
      }

      // Animate Dissected Corpse Abomination (Spasmic Crawl & Claw Contortion)
      if (corpseAbominationRef.current) {
        corpseAbominationRef.current.rotation.z = Math.sin(now * 0.008) * 0.08;
        corpseAbominationRef.current.position.y = 0.1 + Math.sin(now * 0.005) * 0.04;
      }

      // Animate Sentient Void Spectre (Hovering & Eerie Dark Energy Pulse)
      if (voidSpectreRef.current) {
        voidSpectreRef.current.position.y = 0.4 + Math.sin(now * 0.003) * 0.15;
        voidSpectreRef.current.rotation.y += 0.8 * delta;
      }

      // Animate Glitchy Wireframe Hologram
      if (glitchyHologramRef.current) {
        glitchyHologramRef.current.rotation.y += 1.2 * delta;
        glitchyHologramRef.current.position.x = 2.2 + (Math.random() - 0.5) * 0.08;
      }

      // Animate Bioluminescent Spores Drift
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.18 * delta; // Drift downwards
          if (positions[i] < 0) positions[i] = 3.5;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Sphere Singularity & Dimensional Rings
      if (sphereMeshRef.current) {
        sphereMeshRef.current.rotation.y += 0.8 * delta;
        const s = 1.0 + Math.sin(now * 0.003) * 0.06;
        sphereMeshRef.current.scale.set(s, s, s);
      }
      if (sphereRingsRef.current) {
        sphereRingsRef.current.rotation.x += 0.35 * delta;
        sphereRingsRef.current.rotation.y += 0.55 * delta;
      }

      // Dynamic Flickering Surgical & Hazard Strobes
      if (Math.random() < 0.04) {
        hospitalLamp.intensity = Math.random() * 4.0;
        corridorLight.intensity = Math.random() < 0.5 ? 0 : 5.0;
      }

      renderer.render(scene, camera);
      animFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
    };
  }, [screenState, flashlightOn, flashlightBattery, isSprinting, isCrouching, chapterStep, doorRoom104Unlocked, powerRestored, mixerSolved, graphicsQuality, playSfx, showToast, inventory]);

  // ----------------------------------------------------
  // 3D REAL-TIME ITEM INSPECTION VIEWER (360° ROTATION)
  // ----------------------------------------------------
  useEffect(() => {
    if (activeModal !== 'inventory' || !selectedInventoryItem) return;
    const container = itemViewerMountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    itemViewerSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    itemViewerRendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // Dynamic Lighting for Item Viewer
    const amb = new THREE.AmbientLight(0xffffff, 1.4);
    const dir = new THREE.DirectionalLight(0xa855f7, 2.5);
    dir.position.set(2, 4, 3);
    const rim = new THREE.PointLight(0x38bdf8, 3.0, 10);
    rim.position.set(-2, -2, -2);
    scene.add(amb, dir, rim);

    // 3D Model Construction
    const modelType = selectedInventoryItem.examineDetail?.modelType || (
      selectedInventoryItem.id.includes('keycard') ? 'keycard' :
      selectedInventoryItem.id.includes('vial') || selectedInventoryItem.id.includes('pardodene') || selectedInventoryItem.id.includes('virethium') ? 'chemical_vial' :
      selectedInventoryItem.id.includes('syringe') || selectedInventoryItem.id.includes('antidote') ? 'syringe' :
      selectedInventoryItem.id.includes('saw') ? 'bone_saw' :
      selectedInventoryItem.id.includes('tape') || selectedInventoryItem.id.includes('cassette') ? 'tape' :
      selectedInventoryItem.id.includes('battery') || selectedInventoryItem.id.includes('flashlight') ? 'flashlight' : 'keycard'
    );
    const modelGroup = createItemInspectionModel(modelType);
    scene.add(modelGroup);
    itemViewerMeshGroupRef.current = modelGroup;

    let animId: number;
    let autoRotate = true;

    const animate = () => {
      if (modelGroup && autoRotate) {
        modelGroup.rotation.y += 0.012;
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // Touch / Pointer Rotation Drag
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !modelGroup) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      modelGroup.rotation.y += dx * 0.015;
      modelGroup.rotation.x += dy * 0.015;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeModal, selectedInventoryItem]);

  // ----------------------------------------------------
  // MOBILE TOUCH VIRTUAL JOYSTICK (BOTTOM-LEFT)
  // ----------------------------------------------------
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickKnobPos({ x: 0, y: 0 });
        moveVector.current = { forward: 0, strafe: 0 };
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2.2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickKnobPos({ x: knobX, y: knobY });

    // Normalized Movement Vector
    const normX = knobX / maxRadius;
    const normY = knobY / maxRadius;

    moveVector.current = {
      forward: -normY, // Up is negative Y on screen
      strafe: normX,
    };
  };

  // ----------------------------------------------------
  // MOBILE TOUCH LOOK DRAG (RIGHT-SIDE SCREEN)
  // ----------------------------------------------------
  const handleLookTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    lookTouchIdRef.current = touch.identifier;
    lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLookTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current && lookLastPosRef.current) {
        const dx = touch.clientX - lookLastPosRef.current.x;
        const dy = touch.clientY - lookLastPosRef.current.y;
        lookLastPosRef.current = { x: touch.clientX, y: touch.clientY };

        const sens = 0.0035 * touchSensitivity;
        playerRot.current.yaw -= dx * sens;
        playerRot.current.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, playerRot.current.pitch - dy * sens));
        break;
      }
    }
  };

  const handleLookTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        lookLastPosRef.current = null;
        break;
      }
    }
  };

  // Mobile Interact Trigger Button
  const handleMobileInteract = () => {
    soundFx.playClick();
    const px = playerPos.current.x;
    const pz = playerPos.current.z;

    let closest: typeof interactiveObjectsRef.current[0] | null = null;
    let minDist = 3.8;

    for (const obj of interactiveObjectsRef.current) {
      const dist = Math.hypot(px - obj.mesh.position.x, pz - obj.mesh.position.z);
      if (dist < minDist) {
        minDist = dist;
        closest = obj;
      }
    }

    if (closest) {
      closest.action();
    } else {
      showToast('🔍 Nothing to interact with. Approach a desk, door, or terminal.', 2500);
    }
  };

  // Battery Drain & Monster Ticking Interval
  useEffect(() => {
    if (screenState !== 'playing') return;

    const interval = setInterval(() => {
      if (flashlightOn) {
        setFlashlightBattery(prev => {
          const next = Math.max(0, +(prev - 0.4).toFixed(1));
          if (next <= 0 && prev > 0) {
            setFlashlightOn(false);
            showToast('⚠️ Flashlight battery died! Open Inventory to use spare battery cells.', 4000);
          }
          return next;
        });
      }

      if (!flashlightOn && playerPos.current.z < -10) {
        setSanity(prev => Math.max(10, prev - 2));
      } else if (flashlightOn) {
        setSanity(prev => Math.min(100, prev + 1));
      }

      const distToSphere = Math.hypot(playerPos.current.x, playerPos.current.z - (-40));
      const rad = Math.min(99, Math.max(10, Math.round(100 - distToSphere * 2.2)));
      setGeigerLevel(rad);
      if (Math.random() < rad / 100) playSfx('geiger');

    }, 1000);

    return () => clearInterval(interval);
  }, [screenState, flashlightOn, playSfx, showToast]);

  // ----------------------------------------------------
  // PUZZLE SOLVERS
  // ----------------------------------------------------
  const handleVerifyRoomPin = () => {
    if (roomPinInput.trim() === '1048') {
      playSfx('unlock');
      setPinError(null);
      setDoorRoom104Unlocked(true);
      if (doorMeshRef.current) {
        doorMeshRef.current.position.x = 1.8; // Slide open
      }
      setActivePuzzle('none');
      setChapterStep(3);
      setObjective('OBJECTIVE: EXPLORE FACILITY CORRIDORS');
      showToast('🎉 ROOM 104 BLAST DOOR OPENED! Entering Hospital Corridors.', 4500);
    } else {
      playSfx('screech');
      setPinError('❌ Access Denied. Check Dr. Solis Medical Clipboard #104 (PIN: 1-0-4-8)');
    }
  };

  const handleAddBreakerFuse = (color: 'red' | 'blue' | 'green') => {
    soundFx.playClick();
    const next = [...breakerFusesInserted, color];
    setBreakerFusesInserted(next);

    if (next.length === 3) {
      if (next[0] === 'red' && next[1] === 'blue' && next[2] === 'green') {
        playSfx('unlock');
        setPowerRestored(true);
        setBreakerError(null);
        setActivePuzzle('none');
        setChapterStep(5);
        setObjective('OBJECTIVE: FIND LEVEL 2 KEYCARD IN SECURITY OFFICE');
        showToast('⚡ FACILITY POWER RESTORED! Corridor lights online.', 4500);
        setDocuments(prev => prev.map(d => d.id === 'doc_m7_audio' ? { ...d, unlocked: true } : d));
      } else {
        playSfx('screech');
        setBreakerError('⚡ BREAKER BLOWN! Incorrect sequence. Check M-7 Audio Log: Red -> Blue -> Green.');
        setBreakerFusesInserted([]);
      }
    }
  };

  const handleCalibrateMixer = () => {
    if (alphaDial >= 45 && alphaDial <= 55 && gammaDial >= 25 && gammaDial <= 35 && deltaDial >= 65 && deltaDial <= 75) {
      playSfx('unlock');
      setMixerSolved(true);
      setActivePuzzle('none');
      setChapterStep(10);
      setInventory(prev => [
        ...prev.filter(i => i.id !== 'mask_pardodene'),
        { id: 'mask_pardodene', name: 'Pardodene Bio-Filter Mask', category: 'Tool', icon: '😷', description: 'Protects against toxic airborne Pardodene spore necrosis in Sub-Level B4.' }
      ]);
      setObjective('OBJECTIVE: ENTER SUB-LEVEL B4 & STABILIZE THE SPHERE');
      showToast('🧪 Bio-filter calibrated! Sub-Level B4 Sphere chamber unlocked.', 4500);
      setDocuments(prev => prev.map(d => d.id === 'doc_hale_materials' ? { ...d, unlocked: true } : d));
    } else {
      playSfx('screech');
      showToast('⚠️ Target Resonance: Alpha (50%), Gamma (30%), Delta (70%).', 3500);
    }
  };

  const handleRedeemSecret = () => {
    const code = secretCodeInput.trim().toUpperCase();
    if (code === '0008' || code === '008' || code === 'UNDERTHESPHERE') {
      soundFx.playCelebration();
      setSecretCodeNotice('🚨 CLASSIFIED OVERRIDE: Delta-7 Clearance Granted! All Lore Logs Decrypted.');
      setDocuments(prev => prev.map(d => ({ ...d, unlocked: true })));
      setUnlockedSecrets(prev => [...new Set([...prev, '0008'])]);
    } else {
      setSecretCodeNotice('❌ Code invalid. Access denied.');
    }
    setSecretCodeInput('');
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-64px)] bg-black text-slate-100 font-sans select-none overflow-hidden flex flex-col touch-none">
      
      {/* ---------------------------------------------------- */}
      {/* STEP 1: START / LOADING SCREEN */}
      {/* ---------------------------------------------------- */}
      {screenState === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 space-y-6 text-center">
          <div className="relative w-24 h-24 rounded-full border border-purple-500/30 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-emerald-400 blur-xl animate-pulse" />
            <Radio className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-[0.25em] text-white uppercase drop-shadow-2xl">
              UNDER THE SPHERE
            </h1>
            <p className="text-xs font-mono text-purple-400/80 tracking-widest uppercase">
              Loading Mobile Facility Telemetry...
            </p>
          </div>
          <div className="w-48 h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-emerald-400 animate-pulse" style={{ width: '80%' }} />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: MAIN MENU */}
      {/* ---------------------------------------------------- */}
      {screenState === 'menu' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/40 via-slate-950 to-black overflow-y-auto">
          
          {/* Pulsing Atmosphere */}
          <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-purple-600/20 via-pink-600/15 to-emerald-500/20 blur-3xl animate-pulse pointer-events-none" />

          <div className="relative z-10 max-w-sm w-full text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[10px] font-mono tracking-widest uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              Chapter 1 // Mobile Edition
            </div>

            <div className="space-y-1.5">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter bg-gradient-to-b from-white via-slate-200 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                UNDER THE SPHERE
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed px-2">
                An abandoned hospital facility. Dangerous Pardodene mutations. Crystalline Virethium entities. Uncover the secret of the Sphere.
              </p>
            </div>

            {/* Mobile Touch-Optimized Menu Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playCelebration();
                  playSfx('alarm');
                  setScreenState('intro');
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>PLAY CHAPTER 1</span>
              </button>

              {hasSavedGame && (
                <button
                  onClick={handleLoadGame}
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 border border-emerald-500/50 hover:bg-slate-800 active:scale-[0.98] text-emerald-300 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>CONTINUE SAVED GAME</span>
                </button>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveModal('settings')}
                  className="py-3 px-2 rounded-xl bg-slate-900/90 border border-white/10 active:scale-[0.96] text-xs font-bold text-slate-300 flex flex-col items-center gap-1"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => setActiveModal('secrets')}
                  className="py-3 px-2 rounded-xl bg-slate-900/90 border border-white/10 active:scale-[0.96] text-xs font-bold text-slate-300 flex flex-col items-center gap-1"
                >
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Secrets (0008)</span>
                </button>

                <button
                  onClick={() => setActiveModal('credits')}
                  className="py-3 px-2 rounded-xl bg-slate-900/90 border border-white/10 active:scale-[0.96] text-xs font-bold text-slate-300 flex flex-col items-center gap-1"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Credits</span>
                </button>
              </div>

              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: CHAPTER 1 AWAKENING INTRO SCREEN */}
      {/* ---------------------------------------------------- */}
      {screenState === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 space-y-6 text-center animate-fadeIn">
          <div className="space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                CHAPTER 1: THE AWAKENING
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                You slowly open your eyes. Electrical hums and flickering lights echo through a damaged hospital room. You don't know who you are or what happened.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-300 font-mono">
              {objective}
            </div>

            <button
              onClick={() => setScreenState('playing')}
              className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-purple-600/30"
            >
              WAKE UP & TAKE CONTROL
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 5-18: MAIN 3D GAMEPLAY VIEWPORT & HORROR HUD */}
      {/* ---------------------------------------------------- */}
      {(screenState === 'playing' || screenState === 'paused') && (
        <div className="relative flex-1 w-full h-full flex flex-col overflow-hidden">
          
          {/* 3D Canvas Mounting Point */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-crosshair" />

          {/* HORROR EFFECT 1: DYNAMIC BLOOD VIGNETTE OVERLAY */}
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              boxShadow: `inset 0 0 ${sanity < 40 ? '120px' : '70px'} ${
                sanity < 30
                  ? 'rgba(220, 38, 38, 0.8)'
                  : sanity < 60
                  ? 'rgba(185, 28, 28, 0.5)'
                  : 'rgba(0, 0, 0, 0.65)'
              }`,
            }}
          />

          {/* HORROR EFFECT 2: BODY-CAM VHS SCANLINES & NOISE */}
          <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40 mix-blend-overlay" />

          {/* HORROR EFFECT 3: JUMPSCARE FLASH OVERLAY */}
          {jumpscareFlash && (
            <div className="absolute inset-0 pointer-events-none z-50 bg-red-950/90 flex flex-col items-center justify-center animate-ping">
              <div className="text-4xl sm:text-6xl font-black text-red-500 tracking-widest drop-shadow-[0_0_25px_rgba(239,68,68,1)]">
                ⚠️ {jumpscareEntity || 'THREAT DETECTED'} ⚠️
              </div>
              <div className="text-sm font-mono text-red-200 mt-2 tracking-widest uppercase animate-pulse">
                BIOLOGICAL HAZARD ENGAGED
              </div>
            </div>
          )}

          {/* HORROR EFFECT 4: SCREEN BLOOD SPLATTERS */}
          {bloodSplatterScreen && (
            <div className="absolute inset-0 pointer-events-none z-20 opacity-80 animate-pulse flex items-center justify-center">
              <div className="w-full h-full border-8 border-red-700/60 rounded-3xl bg-radial from-transparent via-red-950/20 to-red-900/60" />
            </div>
          )}

          {/* BODY-CAM TELEMETRY (TOP-LEFT & TOP-RIGHT) */}
          <div className="absolute top-1.5 left-4 z-20 flex items-center gap-2 pointer-events-none font-mono text-[9px] text-red-400">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold tracking-widest">REC [●] B3-HOSPITAL</span>
            <span className="text-slate-400 hidden sm:inline">ISO 6400 • 30FPS</span>
          </div>

          {/* TOP HUD BAR */}
          <div className="relative z-20 w-full px-4 pt-6 pb-2 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto">
            
            {/* Objective Banner */}
            <div className="flex items-center gap-2 bg-slate-950/90 border border-purple-500/40 px-3 py-1.5 rounded-full shadow-lg max-w-[70%] backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-purple-200 tracking-wider truncate">
                {objective}
              </span>
            </div>

            {/* Top Right Actions: Flashlight Battery & Pause */}
            <div className="flex items-center gap-2">
              {/* Battery Meter */}
              <div className="flex items-center gap-1 bg-slate-950/90 border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-mono text-amber-300 shadow-md">
                <span>🔋 {Math.round(flashlightBattery)}%</span>
              </div>

              {/* Pause Button */}
              <button
                onClick={() => setScreenState('paused')}
                className="w-8 h-8 rounded-full bg-slate-900/90 border border-white/20 flex items-center justify-center text-slate-200 active:scale-90"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SENSORY DANGER METER (GEIGER & SANITY) */}
          <div className="relative z-10 px-4 py-1 flex items-center justify-between text-[10px] font-mono pointer-events-none">
            <span className={`px-2 py-0.5 rounded-full bg-black/60 border ${geigerLevel > 60 ? 'text-red-400 border-red-500/50 animate-pulse' : 'text-slate-400 border-white/10'}`}>
              ☢ RAD: {geigerLevel} cpm
            </span>
            <span className={`px-2 py-0.5 rounded-full bg-black/60 border ${sanity < 40 ? 'text-red-400 border-red-500/50 animate-pulse' : 'text-slate-400 border-white/10'}`}>
              🧠 SANITY: {sanity}%
            </span>
          </div>

          {/* SUBTITLES / TOAST NOTIFICATION OVERLAY */}
          {subtitles && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-sm w-[90%] p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/50 text-center text-xs text-purple-200 font-semibold shadow-2xl backdrop-blur-sm pointer-events-none animate-fadeIn">
              {subtitles}
            </div>
          )}

          {/* TOUCH LOOK DRAG ZONE (RIGHT 60% OF SCREEN) */}
          <div
            onTouchStart={handleLookTouchStart}
            onTouchMove={handleLookTouchMove}
            onTouchEnd={handleLookTouchEnd}
            className="absolute top-16 right-0 bottom-32 w-3/5 z-10 touch-none"
          />

          {/* BOTTOM MOBILE CONTROLS HUD */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex items-end justify-between pointer-events-none">
            
            {/* VIRTUAL MOVEMENT JOYSTICK (BOTTOM-LEFT) */}
            <div
              ref={joystickBaseRef}
              onTouchStart={handleJoystickTouchStart}
              onTouchMove={handleJoystickTouchMove}
              onTouchEnd={handleJoystickTouchEnd}
              className="relative w-28 h-28 rounded-full bg-white/5 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none shadow-xl"
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border border-white/40 shadow-md transition-transform ${isJoystickActive ? 'scale-110' : ''}`}
                style={{
                  transform: `translate(${joystickKnobPos.x}px, ${joystickKnobPos.y}px)`,
                }}
              />
            </div>

            {/* ACTION BUTTONS (BOTTOM-RIGHT) */}
            <div className="flex flex-col gap-2.5 items-end pointer-events-auto">
              
              {/* Top Row Action Buttons: Flashlight & Inventory */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFlashlightOn(prev => !prev);
                    soundFx.playClick();
                  }}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center active:scale-95 shadow-lg ${flashlightOn ? 'bg-amber-500/30 border-amber-500 text-amber-300' : 'bg-slate-900/80 border-white/20 text-slate-400'}`}
                >
                  <span className="text-xs font-bold">🔦</span>
                </button>

                <button
                  onClick={() => setActiveModal('inventory')}
                  className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-purple-500/40 text-purple-300 flex items-center justify-center active:scale-95 shadow-lg"
                >
                  <span className="text-xs font-bold">🎒</span>
                </button>

                <button
                  onClick={() => setIsCrouching(prev => !prev)}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center active:scale-95 shadow-lg ${isCrouching ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-900/80 border-white/20 text-slate-400'}`}
                >
                  <span className="text-[10px] font-bold">CROUCH</span>
                </button>
              </div>

              {/* Primary Large INTERACT & RUN Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSprinting(prev => !prev)}
                  className={`py-3.5 px-4 rounded-2xl border font-black text-xs active:scale-95 shadow-lg ${isSprinting ? 'bg-red-600/40 border-red-500 text-red-300 animate-pulse' : 'bg-slate-900/80 border-white/20 text-slate-300'}`}
                >
                  RUN
                </button>

                <button
                  onClick={handleMobileInteract}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 active:scale-95 text-white font-black text-sm shadow-xl shadow-purple-600/40 flex items-center gap-2"
                >
                  <span className="tracking-wider">INTERACT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 23: MOBILE PAUSE MENU */}
      {/* ---------------------------------------------------- */}
      {screenState === 'paused' && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4">
          <div className="max-w-xs w-full space-y-4 text-center">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              GAME PAUSED
            </h2>

            {saveMessage && (
              <div className="text-xs text-emerald-400 font-bold p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl">
                {saveMessage}
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={() => setScreenState('playing')}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                RESUME
              </button>

              <button
                onClick={() => setActiveModal('inventory')}
                className="w-full py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 font-bold text-xs"
              >
                INVENTORY
              </button>

              <button
                onClick={handleSaveGame}
                className="w-full py-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE GAME</span>
              </button>

              <button
                onClick={() => setActiveModal('settings')}
                className="w-full py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 font-bold text-xs"
              >
                SETTINGS
              </button>

              <button
                onClick={() => setScreenState('menu')}
                className="w-full py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-bold text-xs"
              >
                MAIN MENU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <span>Mobile Settings</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              
              {/* Master Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Master Volume</span>
                  <span className="font-mono text-purple-400">{masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* SFX Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>SFX Volume</span>
                  <span className="font-mono text-purple-400">{sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Touch Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Touch Look Sensitivity</span>
                  <span className="font-mono text-purple-400">{touchSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={touchSensitivity}
                  onChange={(e) => setTouchSensitivity(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Graphics Quality */}
              <div className="space-y-1.5">
                <label className="text-slate-300">Graphics Quality (Mobile Frame Rate)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setGraphicsQuality(q)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border ${graphicsQuality === q ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.().catch(() => {});
                  } else {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-semibold flex items-center justify-center gap-1.5"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Toggle Phone Fullscreen</span>
              </button>
            </div>

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              SAVE & CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: SECRETS (CODE 0008) */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'secrets' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>Classified Secrets Code</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter secret 4-digit facility clearance code (e.g. <span className="font-mono text-purple-300">0008</span>) to unlock classified files and director overrides.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={secretCodeInput}
                onChange={(e) => setSecretCodeInput(e.target.value)}
                placeholder="Enter 0008"
                className="flex-1 px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-xl text-xs text-white font-mono tracking-widest uppercase focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRedeemSecret}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl"
              >
                Unlock
              </button>
            </div>

            {secretCodeNotice && (
              <div className="text-xs text-purple-300 p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40">
                {secretCodeNotice}
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-slate-300"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: INVENTORY WITH 3D ITEM INSPECTION & COMBINE */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'inventory' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎒</span>
                <div>
                  <h3 className="text-base font-bold text-white">Tactical Survival Inventory</h3>
                  <p className="text-[10px] text-purple-400">Delta-7 Containment Kit • Tap item to examine in 3D</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedInventoryItem(null);
                  setCombineSourceItem(null);
                  setActiveModal('none');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If an item is selected for 3D examination */}
            {selectedInventoryItem ? (
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* 3D Item Inspection Viewport */}
                <div className="relative w-full h-44 rounded-2xl bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/30 overflow-hidden flex items-center justify-center">
                  <div
                    ref={itemViewerMountRef}
                    className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] text-purple-300 font-mono">
                    360° Touch Rotate
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-900/60 border border-purple-400/30 text-[9px] text-white font-bold uppercase">
                    {selectedInventoryItem.category || 'Item'}
                  </div>
                </div>

                {/* Item Details & Lore */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedInventoryItem.icon}</span>
                      <span>{selectedInventoryItem.name}</span>
                    </h4>
                    {selectedInventoryItem.count && (
                      <span className="text-xs font-mono text-purple-400 font-bold">
                        x{selectedInventoryItem.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedInventoryItem.description}
                  </p>

                  {/* Lore Detail */}
                  {selectedInventoryItem.examineDetail?.lore && (
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                      <strong className="text-purple-300">Observation: </strong>
                      {selectedInventoryItem.examineDetail.lore}
                    </div>
                  )}

                  {/* Secret Inscription / Clue found on item */}
                  {selectedInventoryItem.examineDetail?.clueSecret && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 font-mono">
                      <strong className="text-amber-400">🔍 Inscription Found: </strong>
                      {selectedInventoryItem.examineDetail.clueSecret}
                    </div>
                  )}

                  {/* Audio Log transcript if tape */}
                  {selectedInventoryItem.examineDetail?.audioLog && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-[11px] text-cyan-200">
                      <strong className="text-cyan-400">🎙️ Tape Playback: </strong>
                      "{selectedInventoryItem.examineDetail.audioLog}"
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedInventoryItem.usable && (
                    <button
                      onClick={() => {
                        if (selectedInventoryItem.id === 'battery') {
                          setFlashlightBattery(prev => Math.min(100, prev + 50));
                          setInventory(prev => prev.map(i => i.id === 'battery' ? { ...i, count: (i.count || 1) - 1 } : i).filter(i => (i.count ?? 1) > 0));
                          showToast('🔋 Flashlight Recharged (+50%)!', 2500);
                          soundFx.playCelebration();
                          setSelectedInventoryItem(null);
                        } else if (selectedInventoryItem.id === 'adrenaline_syringe') {
                          setHealth(prev => Math.min(100, prev + 40));
                          setSanity(prev => Math.min(100, prev + 35));
                          setInventory(prev => prev.filter(i => i.id !== 'adrenaline_syringe'));
                          showToast('💉 Injected Adrenaline: Health +40%, Sanity +35%!', 3000);
                          soundFx.playSuccess();
                          setSelectedInventoryItem(null);
                        } else if (selectedInventoryItem.id === 'cassette_04') {
                          setAudioCassettePlaying(true);
                          playSfx('screech');
                          showToast('📼 Audio Log: "Auxiliary power breaker requires 1-RED, 2-BLUE, 3-GREEN!"', 4500);
                        }
                      }}
                      className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                    >
                      <span>⚡ Use Item</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (combineSourceItem) {
                        // Attempt combination
                        if (
                          (combineSourceItem.id === 'vial_pardodene' && selectedInventoryItem.id === 'vial_virethium') ||
                          (combineSourceItem.id === 'vial_virethium' && selectedInventoryItem.id === 'vial_pardodene')
                        ) {
                          setInventory(prev => [
                            ...prev.filter(i => i.id !== 'vial_pardodene' && i.id !== 'vial_virethium'),
                            {
                              id: 'neutralizer_catalyst',
                              name: 'Sphere Neutralizer Catalyst',
                              category: 'Chemical',
                              icon: '🧪',
                              description: 'Synthesized compound capable of dampening the Sphere Singularity resonance field.',
                              usable: false,
                              examineDetail: {
                                lore: 'A glowing purple-emerald hybrid isotope. Ready for insertion into Sub-Level B4 Sphere Core.',
                                clueSecret: 'INSERTION FREQUENCY: 432 Hz',
                                modelType: 'chemical_vial'
                              }
                            }
                          ]);
                          showToast('🧪 Synthesized: Sphere Neutralizer Catalyst!', 4000);
                          soundFx.playCelebration();
                          setCombineSourceItem(null);
                          setSelectedInventoryItem(null);
                        } else {
                          showToast('❌ These items cannot be combined together.', 2500);
                          setCombineSourceItem(null);
                        }
                      } else {
                        setCombineSourceItem(selectedInventoryItem);
                        showToast(`Selected "${selectedInventoryItem.name}" for combination. Select 2nd item!`, 3000);
                        setSelectedInventoryItem(null);
                      }
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      combineSourceItem ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>🔗 {combineSourceItem ? 'Combine with Selected' : 'Combine'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedInventoryItem(null)}
                    className="col-span-2 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                  >
                    Back to Item Grid
                  </button>
                </div>
              </div>
            ) : (
              /* Item Grid View */
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {combineSourceItem && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between">
                    <span>Combining: {combineSourceItem.name}</span>
                    <button
                      onClick={() => setCombineSourceItem(null)}
                      className="text-amber-400 hover:text-white text-xs underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        soundFx.playClick();
                        if (combineSourceItem && combineSourceItem.id !== item.id) {
                          setSelectedInventoryItem(item);
                        } else {
                          setSelectedInventoryItem(item);
                        }
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            {item.count && (
                              <span className="text-[10px] font-mono text-purple-400 font-bold">x{item.count}</span>
                            )}
                          </div>
                          <span className="text-[9px] uppercase font-bold text-purple-300 tracking-wider">
                            {item.category || 'Item'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedInventoryItem(null);
                setCombineSourceItem(null);
                setActiveModal('none');
              }}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
            >
              CLOSE INVENTORY
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: DOCUMENTS / PDA LOGS */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'documents' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Classified PDA Logs</span>
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDoc && (
              <div className="flex-1 overflow-y-auto space-y-2 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs">
                <h4 className="font-bold text-purple-200">{selectedDoc.title}</h4>
                <p className="text-[10px] font-mono text-purple-400">{selectedDoc.author} // {selectedDoc.date}</p>
                <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line pt-2">
                  {selectedDoc.fullText}
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: CREDITS */}
      {/* ---------------------------------------------------- */}
      {activeModal === 'credits' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4 text-center">
            <h3 className="text-base font-bold text-white">UNDER THE SPHERE</h3>
            <p className="text-xs text-slate-400">
              Chapter 1: The Descent (Mobile Edition)
            </p>
            <div className="text-[11px] text-slate-300 space-y-1 py-2">
              <p>Created by: Mido AI Studio</p>
              <p>Engine: Three.js WebGL Mobile Optimization</p>
              <p>Audio: Synthetic Web Audio Sound FX</p>
            </div>
            <button
              onClick={() => setActiveModal('none')}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PUZZLE 1: ROOM 104 KEYPAD PIN (1048) */}
      {/* ---------------------------------------------------- */}
      {activePuzzle === 'room104_pin' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4 text-center">
            <h3 className="text-sm font-bold text-white">Room 104 Electronic Lock</h3>
            <p className="text-[11px] text-slate-400">Enter Dr. Solis's Emergency PIN (Check Medical Clipboard)</p>
            
            <div className="text-2xl font-mono tracking-widest text-purple-300 py-2 bg-slate-900 rounded-xl border border-purple-500/30">
              {roomPinInput || '••••'}
            </div>

            {pinError && <div className="text-[10px] text-red-400">{pinError}</div>}

            {/* Mobile Touch Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'OK'].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    soundFx.playClick();
                    if (k === 'CLR') setRoomPinInput('');
                    else if (k === 'OK') handleVerifyRoomPin();
                    else if (roomPinInput.length < 4) setRoomPinInput(prev => prev + k);
                  }}
                  className={`py-3 rounded-xl font-mono text-sm font-bold border ${k === 'OK' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-200 border-white/10 active:bg-slate-800'}`}
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActivePuzzle('none')}
              className="w-full py-2 text-xs text-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PUZZLE 2: POWER BREAKER FUSES */}
      {/* ---------------------------------------------------- */}
      {activePuzzle === 'breaker_fuses' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-950 border border-yellow-500/40 rounded-3xl p-5 space-y-4 text-center">
            <h3 className="text-sm font-bold text-yellow-300">Auxiliary Power Breaker</h3>
            <p className="text-[11px] text-slate-400">Insert 3 Fuses in Technician M-7 Sequence: (Red → Blue → Green)</p>

            <div className="flex justify-center gap-3 py-2">
              {breakerFusesInserted.map((f, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 ${f === 'red' ? 'bg-red-500 border-red-300' : f === 'blue' ? 'bg-blue-500 border-blue-300' : 'bg-emerald-500 border-emerald-300'}`}
                />
              ))}
            </div>

            {breakerError && <div className="text-[10px] text-red-400">{breakerError}</div>}

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAddBreakerFuse('red')}
                className="py-3 rounded-xl bg-red-950 border border-red-500 text-red-300 font-bold text-xs"
              >
                🔴 RED
              </button>
              <button
                onClick={() => handleAddBreakerFuse('blue')}
                className="py-3 rounded-xl bg-blue-950 border border-blue-500 text-blue-300 font-bold text-xs"
              >
                🔵 BLUE
              </button>
              <button
                onClick={() => handleAddBreakerFuse('green')}
                className="py-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs"
              >
                🟢 GREEN
              </button>
            </div>

            <button
              onClick={() => setActivePuzzle('none')}
              className="w-full py-2 text-xs text-slate-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PUZZLE 3: HARMONIC RESONANCE MIXER (50 / 30 / 70) */}
      {/* ---------------------------------------------------- */}
      {activePuzzle === 'resonance_mixer' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-950 border border-purple-500/40 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white text-center">Harmonic Calibration Console</h3>
            <p className="text-[10px] text-slate-400 text-center">Target Ratios: Alpha (50%), Gamma (30%), Delta (70%)</p>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Alpha Resonance:</span>
                  <span className="font-mono text-purple-400">{alphaDial}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={alphaDial}
                  onChange={(e) => setAlphaDial(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Gamma Coolant:</span>
                  <span className="font-mono text-blue-400">{gammaDial}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={gammaDial}
                  onChange={(e) => setGammaDial(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Delta Virethium:</span>
                  <span className="font-mono text-pink-400">{deltaDial}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={deltaDial}
                  onChange={(e) => setDeltaDial(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            <button
              onClick={handleCalibrateMixer}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              CALIBRATE & STABILIZE
            </button>

            <button
              onClick={() => setActivePuzzle('none')}
              className="w-full py-1 text-xs text-slate-400 text-center block"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PUZZLE 4 / CLIMAX: SPHERE CORE TERMINAL */}
      {/* ---------------------------------------------------- */}
      {activePuzzle === 'sphere_console' && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-950 border border-purple-500/60 rounded-3xl p-5 space-y-4 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500 flex items-center justify-center mx-auto text-purple-300 animate-pulse">
              <Radio className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-white tracking-wider uppercase">
              THE SPHERE SINGULARITY
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Dr. Magnus Rellin's containment protocol is ready. The gateway pulses with raw dimensional energy. Will you seal the containment field, or step through into the unknown?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  playSfx('unlock');
                  setActivePuzzle('none');
                  setScreenState('victory');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-600/40"
              >
                SEAL CONTAINMENT & ESCAPE
              </button>

              <button
                onClick={() => {
                  playSfx('unlock');
                  setActivePuzzle('none');
                  setScreenState('victory');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/40"
              >
                TRANSCEND INTO THE SPHERE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 29: CHAPTER 1 VICTORY SCREEN */}
      {/* ---------------------------------------------------- */}
      {screenState === 'victory' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 space-y-6 text-center animate-fadeIn">
          <div className="space-y-3 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400 animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-3xl font-black tracking-widest text-white uppercase">
              CHAPTER 1 COMPLETE
            </h1>

            <p className="text-sm font-mono text-purple-400 tracking-widest">
              TO BE CONTINUED IN CHAPTER 2...
            </p>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              You survived the hospital facility and breached Sub-Level B4. But the Sphere has awakened, and XVI-Xviper stalks the deeper tunnels...
            </p>

            <button
              onClick={() => setScreenState('menu')}
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 mt-4"
            >
              RETURN TO MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
