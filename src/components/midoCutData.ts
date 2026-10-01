// Mido Cut Pro: Complete 200+ Tools & Preset Catalog (CapCut-Style Suite)

export interface CutToolItem {
  id: string;
  name: string;
  category: 'timeline' | 'filters' | 'vfx' | 'typography' | 'stickers' | 'audio' | 'transitions' | 'ai' | 'photo' | 'export';
  icon: string;
  desc: string;
  badge?: string;
  pro?: boolean;
}

// 1. TIMELINE & CUT TOOLS (22 Pro Tools)
export const TIMELINE_TOOLS: CutToolItem[] = [
  { id: 'split', name: 'Split Playhead', category: 'timeline', icon: 'Scissors', desc: 'Cut clip cleanly at current playhead position', badge: 'Essential' },
  { id: 'trim-start', name: 'Trim Start', category: 'timeline', icon: 'ArrowLeftToLine', desc: 'Delete footage before current playhead' },
  { id: 'trim-end', name: 'Trim End', category: 'timeline', icon: 'ArrowRightToLine', desc: 'Delete footage after current playhead' },
  { id: 'ripple-delete', name: 'Ripple Delete', category: 'timeline', icon: 'Trash2', desc: 'Delete selected section and close timeline gap automatically' },
  { id: 'freeze-frame', name: 'Freeze Frame', category: 'timeline', icon: 'Snowflake', desc: 'Generate 3-second frozen still frame at moment', badge: 'HOT' },
  { id: 'reverse-video', name: 'Reverse Playback', category: 'timeline', icon: 'RotateCcw', desc: 'Reverse video frames backwards seamlessly' },
  { id: 'speed-curve', name: 'Speed Curve Ramp', category: 'timeline', icon: 'Zap', desc: 'Smooth cinematic curve speed ramping (0.1x to 100x)', badge: 'Pro' },
  { id: 'keyframe-pos', name: 'Keyframe Position', category: 'timeline', icon: 'Move', desc: 'Animate X/Y position over time' },
  { id: 'keyframe-scale', name: 'Keyframe Zoom & Scale', category: 'timeline', icon: 'Maximize2', desc: 'Smooth punch-in and zoom effects' },
  { id: 'keyframe-opacity', name: 'Keyframe Opacity', category: 'timeline', icon: 'Eye', desc: 'Fade in / fade out video transparency' },
  { id: 'keyframe-rot', name: 'Keyframe Rotation', category: 'timeline', icon: 'RotateCw', desc: 'Smooth dynamic barrel rolls and angled tilts' },
  { id: 'safe-guides', name: 'Safe Area Guides', category: 'timeline', icon: 'Grid', desc: 'Overlay TikTok, Reels, & Shorts safe margins', badge: 'Creator' },
  { id: 'beat-detect', name: 'Auto Beat Sync Marker', category: 'timeline', icon: 'Activity', desc: 'Detect musical drop beats and mark cut points automatically' },
  { id: 'magnetic-snap', name: 'Magnetic Timeline Snap', category: 'timeline', icon: 'Magnet', desc: 'Snap clips to grid, markers, and playhead' },
  { id: 'slip-tool', name: 'Slip & Slide Tool', category: 'timeline', icon: 'Sliders', desc: 'Shift clip in/out points without altering length' },
  { id: 'razor-cut', name: 'Multi-Track Razor', category: 'timeline', icon: 'Slice', desc: 'Slice across all audio and video tracks simultaneously' },
  { id: 'duplicate-clip', name: 'Duplicate Clip', category: 'timeline', icon: 'Copy', desc: 'Clone selected clip with all applied filters' },
  { id: 'replace-media', name: 'Replace Media', category: 'timeline', icon: 'RefreshCw', desc: 'Swap file while preserving timing and keyframes' },
  { id: 'blank-canvas', name: 'Insert Color Solid', category: 'timeline', icon: 'Square', desc: 'Add solid black, white, or neon backdrop' },
  { id: 'duration-stretch', name: 'Duration Time Stretch', category: 'timeline', icon: 'Timer', desc: 'Fit clip precisely to background audio duration' },
  { id: 'loop-region', name: 'Loop Region Playback', category: 'timeline', icon: 'Repeat', desc: 'Continuously loop trimmed active section' },
  { id: 'multitrack-overlay', name: 'Picture-in-Picture (PiP)', category: 'timeline', icon: 'Layers', desc: 'Overlay secondary reaction cam or gameplay' },
];

// 2. CINEMATIC LUTS & FILTERS (35 Filters)
export const CINEMATIC_LUTS = [
  { id: 'none', name: 'Original', css: 'none', group: 'Basic' },
  { id: 'teal-orange', name: 'Teal & Orange Hollywood', css: 'contrast(135%) saturate(160%) hue-rotate(340deg) brightness(105%)', group: 'Cinematic', badge: 'Trending' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon 2077', css: 'contrast(140%) saturate(190%) hue-rotate(285deg) brightness(110%)', group: 'Cinematic' },
  { id: 'portra-400', name: 'Kodak Portra 400', css: 'sepia(25%) saturate(140%) contrast(110%) brightness(104%)', group: 'Vintage Film', badge: 'Favorite' },
  { id: 'fuji-chrome', name: 'Fuji Velvia 50 Chrome', css: 'saturate(170%) contrast(125%) hue-rotate(350deg)', group: 'Vintage Film' },
  { id: 'cinema-noir', name: 'Cinema Noir B&W', css: 'grayscale(100%) contrast(160%) brightness(92%)', group: 'Black & White' },
  { id: 'vhs-1995', name: 'Retro VHS 1995', css: 'contrast(120%) saturate(145%) sepia(30%) brightness(96%)', group: 'Retro' },
  { id: 'golden-hour', name: 'Golden Hour Sunset', css: 'sepia(45%) saturate(165%) contrast(112%) brightness(106%)', group: 'Warm' },
  { id: 'matrix-code', name: 'Matrix Emerald Code', css: 'hue-rotate(90deg) contrast(145%) saturate(165%)', group: 'Stylized' },
  { id: 'hdr-vivid', name: 'Ultra Vivid HDR 4K', css: 'contrast(130%) saturate(180%) brightness(104%)', group: 'Modern' },
  { id: 'synthwave-80s', name: '80s Synthwave Sunset', css: 'contrast(145%) saturate(210%) hue-rotate(325deg)', group: 'Retro' },
  { id: 'bleach-bypass', name: 'Bleach Bypass Action', css: 'contrast(150%) saturate(60%) brightness(108%)', group: 'Cinematic' },
  { id: 'technicolor', name: 'Technicolor 3-Strip', css: 'contrast(135%) saturate(175%) brightness(102%)', group: 'Vintage Film' },
  { id: 'arctic-frost', name: 'Arctic Ice Frost', css: 'hue-rotate(185deg) saturate(135%) contrast(118%)', group: 'Cool' },
  { id: 'pastel-dream', name: 'Pastel Dream Glow', css: 'brightness(118%) saturate(125%) contrast(88%)', group: 'Aesthetic' },
  { id: 'glitch-cyber', name: 'Glitch Cyber Hacker', css: 'contrast(185%) hue-rotate(180deg) saturate(210%)', group: 'Stylized' },
  { id: 'moody-teal', name: 'Moody Dark Teal', css: 'contrast(130%) hue-rotate(160deg) saturate(120%) brightness(90%)', group: 'Cinematic' },
  { id: 'crimson-duotone', name: 'Crimson Duotone', css: 'contrast(165%) saturate(230%) hue-rotate(310deg)', group: 'Stylized' },
  { id: 'lowkey-charcoal', name: 'Low-Key Charcoal', css: 'grayscale(100%) contrast(180%) brightness(80%)', group: 'Black & White' },
  { id: 'infrared-bloom', name: 'Infrared Foliage Bloom', css: 'hue-rotate(240deg) saturate(220%) contrast(130%)', group: 'Stylized' },
  { id: 'sunset-flare', name: 'Sunset Warm Flare', css: 'sepia(35%) contrast(120%) saturate(155%) brightness(108%)', group: 'Warm' },
  { id: 'tokyo-drift', name: 'Tokyo Drift Neon Purple', css: 'contrast(140%) saturate(185%) hue-rotate(260deg)', group: 'Stylized' },
  { id: 'acid-wash', name: '90s Acid Wash', css: 'contrast(110%) saturate(140%) brightness(115%) sepia(15%)', group: 'Retro' },
  { id: 'anime-cel', name: 'Anime Vibrant Cel', css: 'contrast(145%) saturate(200%) brightness(105%)', group: 'Stylized', badge: 'Anime' },
  { id: 'sharp-4k-master', name: '4K Ultra Master Sharp', css: 'contrast(118%) saturate(138%) brightness(103%)', group: 'Modern' },
  { id: 'red-accent-pop', name: 'Selective Red Pop', css: 'contrast(140%) saturate(190%) hue-rotate(350deg)', group: 'Stylized' },
  { id: 'sapphire-night', name: 'Sapphire Deep Night', css: 'hue-rotate(210deg) saturate(150%) contrast(130%) brightness(88%)', group: 'Cool' },
  { id: 'vintage-polaroid', name: 'Vintage Polaroid 600', css: 'sepia(28%) saturate(130%) contrast(105%) brightness(110%)', group: 'Retro' },
  { id: 'forest-emerald', name: 'Nordic Forest Emerald', css: 'hue-rotate(120deg) saturate(140%) contrast(125%) brightness(95%)', group: 'Cinematic' },
  { id: 'warm-amber', name: 'Warm Amber Candle', css: 'sepia(50%) saturate(150%) contrast(115%) brightness(104%)', group: 'Warm' },
  { id: 'highkey-pastel', name: 'High-Key Studio Soft', css: 'brightness(122%) contrast(92%) saturate(115%)', group: 'Aesthetic' },
  { id: 'cinematic-235', name: 'Anamorphic Cinema 2.35:1', css: 'contrast(128%) saturate(142%) brightness(100%)', group: 'Cinematic' },
  { id: 'grain-16mm', name: '16mm Indie Film Grain', css: 'contrast(122%) saturate(125%) sepia(18%) brightness(98%)', group: 'Vintage Film' },
  { id: 'cyber-violet', name: 'Deep Cyber Violet', css: 'hue-rotate(270deg) saturate(190%) contrast(135%)', group: 'Stylized' },
  { id: 'diamond-clarity', name: 'Diamond Clarity Pop', css: 'contrast(125%) brightness(105%) saturate(145%)', group: 'Modern' },
];

// 3. VISUAL EFFECTS (VFX OVERLAYS) (30 VFX)
export const VFX_PRESETS = [
  { id: 'vfx-none', name: 'No Effect', type: 'none' },
  { id: 'vfx-neon-body', name: 'Neon Body Outline', type: 'glow', color: '#ff0055', desc: 'Glowing electric neon cyber aura' },
  { id: 'vfx-clone-trail', name: 'Motion Clone Trail', type: 'trail', color: '#00ffff', desc: 'Ghost echo trail on rapid movement' },
  { id: 'vfx-rgb-glitch', name: 'RGB Split Glitch', type: 'glitch', color: '#ff00ff', desc: 'Chromatic aberration cyber glitch' },
  { id: 'vfx-anamorphic-flare', name: 'Anamorphic Lens Flare', type: 'flare', color: '#38bdf8', desc: 'Cinematic horizontal blue laser flare' },
  { id: 'vfx-film-dust', name: '35mm Film Dust & Scratches', type: 'film', color: '#ffffff', desc: 'Authentic analog cinema dust & hair' },
  { id: 'vfx-light-leak', name: 'Golden Light Leak Bloom', type: 'leak', color: '#f59e0b', desc: 'Warm vintage organic sun flare leak' },
  { id: 'vfx-flash-strobe', name: 'White Flash Beat Strobe', type: 'flash', color: '#ffffff', desc: 'Intense strobe pulses for beat drops' },
  { id: 'vfx-particles-snow', name: 'Particle Floating Snow', type: 'snow', color: '#ffffff', desc: 'Gentle winter blizzard particles' },
  { id: 'vfx-rain-glass', name: 'Cyberpunk Rain On Glass', type: 'rain', color: '#06b6d4', desc: 'Cinematic raindrops dripping on lens' },
  { id: 'vfx-fire-sparks', name: 'Fire Sparks & Embers', type: 'fire', color: '#ef4444', desc: 'Blazing embers floating upwards' },
  { id: 'vfx-laser-eyes', name: 'Laser Eyes Glow', type: 'laser', color: '#ef4444', desc: 'Supercharged red neon laser rays' },
  { id: 'vfx-heart-bokeh', name: 'Heart Bokeh Glow', type: 'heart', color: '#ec4899', desc: 'Dreamy floating romantic light hearts' },
  { id: 'vfx-shockwave-zoom', name: 'Shockwave Zoom Pulse', type: 'shockwave', color: '#8b5cf6', desc: 'Radial distortion impact blast' },
  { id: 'vfx-radial-spin', name: 'Radial Blur Warp', type: 'spin', color: '#3b82f6', desc: 'High-speed tunnel hyperspace warp' },
  { id: 'vfx-crt-scanlines', name: 'Retro CRT TV Scanlines', type: 'crt', color: '#10b981', desc: 'Vintage 1980s arcade monitor grid' },
  { id: 'vfx-pixelate-8bit', name: '8-Bit Pixel Game Shader', type: 'pixel', color: '#facc15', desc: 'Retro pixelated gaming aesthetic' },
  { id: 'vfx-heatwave', name: 'Desert Heatwave Mirage', type: 'heat', color: '#f97316', desc: 'Shimmering thermal air distortion' },
  { id: 'vfx-kaleidoscope', name: 'Prism Kaleidoscope', type: 'mirror', color: '#a855f7', desc: 'Trippy multi-angle geometric mirrors' },
  { id: 'vfx-halftone-comic', name: 'Pop-Art Comic Halftone', type: 'comic', color: '#e11d48', desc: 'Vintage Marvel/DC comic book print dots' },
  { id: 'vfx-thermal-vision', name: 'Thermal Predator Vision', type: 'thermal', color: '#eab308', desc: 'Infrared predator heat-signature scan' },
  { id: 'vfx-sparkle-bling', name: 'Diamond Sparkle Bling', type: 'sparkle', color: '#ffffff', desc: 'Glittering crystal star glints' },
  { id: 'vfx-edge-glow', name: 'Cyber Edge Highlight', type: 'edge', color: '#22c55e', desc: 'Glowing boundary lines detection' },
  { id: 'vfx-vignette-pulse', name: 'Dark Vignette Pulse', type: 'vignette', color: '#000000', desc: 'Pumping cinematic dark vignette' },
  { id: 'vfx-water-ripple', name: 'Fluid Water Ripple', type: 'ripple', color: '#0284c7', desc: 'Concentric drop ripples across video' },
  { id: 'vfx-matrix-rain', name: 'Matrix Digital Rain Code', type: 'matrix', color: '#22c55e', desc: 'Falling green cryptographic glyphs' },
  { id: 'vfx-disco-strobe', name: 'Disco Multi-Color Strobe', type: 'disco', color: '#d946ef', desc: 'Rapid cycling rainbow party flashes' },
  { id: 'vfx-fog-smoke', name: 'Atmospheric Fog & Smoke', type: 'fog', color: '#94a3b8', desc: 'Rolling cinematic smoke haze' },
  { id: 'vfx-letterbox-cinematic', name: '2.35:1 Anamorphic Letterbox', type: 'letterbox', color: '#000000', desc: 'Clean black cinematic top/bottom film bars' },
  { id: 'vfx-time-warp', name: 'Time Warp Freeze Line', type: 'timewarp', color: '#38bdf8', desc: 'TikTok viral vertical scan freeze line' },
];

// 4. TYPOGRAPHY & AI CAPTIONS (24 Styles & Templates)
export const TYPOGRAPHY_TEMPLATES = [
  { id: 'tt-auto-captions', name: 'Auto AI Subtitles', style: 'karaoke', font: 'Montserrat', desc: 'Auto-transcribe & highlight spoken words in real time', badge: 'AI Pro' },
  { id: 'tt-3d-extrude', name: '3D Gold Extrusion', style: '3d', font: 'Impact', desc: 'Deep extruded metallic 3D block typography' },
  { id: 'tt-cyber-neon', name: 'Cyberpunk Neon Glow', style: 'neon', font: 'Orbitron', desc: 'Pulsing cyan/magenta high-voltage neon glow' },
  { id: 'tt-typewriter', name: 'Retro Typewriter Cursor', style: 'typewriter', font: 'JetBrains Mono', desc: 'Character-by-character typing with blinking bar' },
  { id: 'tt-kinetic-glitch', name: 'Kinetic Glitch Pop', style: 'glitch', font: 'Impact', desc: 'Aggressive jumping glitch typography with color offsets' },
  { id: 'tt-lower-third-pro', name: 'Cinematic Lower Third', style: 'lower-third', font: 'Montserrat', desc: 'Broadcast news nameplate & title strap' },
  { id: 'tt-modern-title', name: 'Minimalist Title Card', style: 'minimal', font: 'Bebas Neue', desc: 'Spacious high-fashion display typography' },
  { id: 'tt-breaking-news', name: 'Breaking News Ticker', style: 'ticker', font: 'Outfit', desc: 'Red emergency scroll banner with live icon' },
  { id: 'tt-comic-bubble', name: 'Comic Boom Bubble', style: 'comic', font: 'Pacifico', desc: 'Pop-art speech bubble with bold black stroke' },
  { id: 'tt-social-handle', name: 'Social Creator Tag @', style: 'social', font: 'Montserrat', desc: 'TikTok / YouTube / Instagram handle badge' },
  { id: 'tt-gradient-fire', name: 'Fire Gradient Flame', style: 'gradient', font: 'Impact', desc: 'Yellow to blazing red gradient fill with shadow' },
  { id: 'tt-speech-subtitles', name: 'Netflix Style Subtitles', style: 'subtitles', font: 'Montserrat', desc: 'Clean yellow text with black semi-transparent box' },
  { id: 'tt-karaoke-bounce', name: 'Karaoke Bouncing Ball', style: 'karaoke-bounce', font: 'Outfit', desc: 'Animated bouncing dot over active lyric words' },
  { id: 'tt-handwritten-script', name: 'Organic Signature Script', style: 'script', font: 'Pacifico', desc: 'Elegant smooth handwritten cursive calligraphy' },
  { id: 'tt-headline-bold', name: 'YouTube Thumbnail Hook', style: 'hook', font: 'Bebas Neue', desc: 'Massive angled headline with yellow stroke' },
  { id: 'tt-pixel-retro', name: 'Arcade 8-Bit Pixel Text', style: 'pixel', font: 'Orbitron', desc: 'Chunky arcade font with 2-color drop shadow' },
  { id: 'tt-vaporwave-chrome', name: 'Vaporwave Chrome Text', style: 'chrome', font: 'Playfair Display', desc: 'Mirrored metallic chrome reflection gradient' },
  { id: 'tt-quote-card', name: 'Inspirational Quote Card', style: 'quote', font: 'Playfair Display', desc: 'Centered quote with author footnote and quotation marks' },
  { id: 'tt-curved-badge', name: 'Curved Arc Stamp', style: 'arc', font: 'Bebas Neue', desc: 'Circular warped text badge for logos and crests' },
  { id: 'tt-hologram-hud', name: 'Sci-Fi HUD Data Text', style: 'hud', font: 'Orbitron', desc: 'Targeting reticle metrics and coordinate counters' },
];

// 5. STICKERS, BADGES & ANIMATIONS (30 Items)
export const PRO_STICKERS = [
  { id: 'st-verified', label: 'VERIFIED CREATOR', icon: 'CheckCircle', color: 'from-blue-500 to-cyan-500', border: 'border-cyan-300' },
  { id: 'st-subscribe', label: 'SUBSCRIBE', icon: 'Bell', color: 'from-red-600 to-rose-700', border: 'border-red-400' },
  { id: 'st-like-bell', label: 'LIKE & SHARE', icon: 'ThumbsUp', color: 'from-purple-600 to-pink-600', border: 'border-pink-300' },
  { id: 'st-trending', label: '🔥 #1 TRENDING', icon: 'Flame', color: 'from-amber-500 to-rose-600', border: 'border-amber-400' },
  { id: 'st-vip-crown', label: '⚡ VIP EXCLUSIVE', icon: 'Crown', color: 'from-yellow-400 to-amber-600', border: 'border-yellow-300' },
  { id: 'st-viral-hit', label: '💥 VIRAL 10M+', icon: 'Zap', color: 'from-fuchsia-600 to-rose-500', border: 'border-fuchsia-300' },
  { id: 'st-sale-50', label: '📢 50% OFF TODAY', icon: 'Tag', color: 'from-emerald-500 to-teal-600', border: 'border-emerald-300' },
  { id: 'st-hdr-4k', label: '🎬 4K UHD HDR', icon: 'Film', color: 'from-blue-600 to-indigo-700', border: 'border-blue-400' },
  { id: 'st-ai-magic', label: '✨ AI MAGIC PRO', icon: 'Sparkles', color: 'from-fuchsia-600 to-purple-700', border: 'border-fuchsia-300' },
  { id: 'st-champion', label: '🏆 CHAMPION #1', icon: 'Trophy', color: 'from-amber-400 to-orange-500', border: 'border-amber-300' },
  { id: 'st-heart-love', label: '❤️ 1M LIKES', icon: 'Heart', color: 'from-rose-500 to-pink-600', border: 'border-rose-400' },
  { id: 'st-live-rec', label: '🔴 LIVE BROADCAST', icon: 'Radio', color: 'from-red-600 to-red-800', border: 'border-red-500' },
  { id: 'st-soundwave', label: '🎵 BASS BOOSTED', icon: 'Music', color: 'from-emerald-400 to-cyan-500', border: 'border-emerald-300' },
  { id: 'st-target', label: '🎯 HEADSHOT', icon: 'Crosshair', color: 'from-red-500 to-orange-600', border: 'border-red-400' },
  { id: 'st-gaming', label: '🎮 GG EASY WIN', icon: 'Gamepad2', color: 'from-violet-600 to-indigo-600', border: 'border-violet-400' },
  { id: 'st-rocket', label: '🚀 TO THE MOON', icon: 'Rocket', color: 'from-amber-500 to-indigo-600', border: 'border-amber-300' },
  { id: 'st-diamond', label: '💎 100% QUALITY', icon: 'Gem', color: 'from-cyan-400 to-blue-500', border: 'border-cyan-200' },
  { id: 'st-skull', label: '💀 DEAD / SAVAGE', icon: 'Skull', color: 'from-slate-700 to-slate-900', border: 'border-slate-500' },
  { id: 'st-warning', label: '⚠️ CAUTION / EXTREME', icon: 'AlertTriangle', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400' },
  { id: 'st-clock', label: '⏱️ COUNTDOWN', icon: 'Clock', color: 'from-blue-500 to-indigo-600', border: 'border-blue-300' },
];

// 6. AUDIO SFX & VOICE MODULATORS (25 Sound Tools)
export const AUDIO_SFX_PRESETS = [
  { id: 'sfx-whoosh', name: 'Cinematic Fast Whoosh', freq: 440, type: 'whoosh', desc: 'Fast transition whip sound effect' },
  { id: 'sfx-ding', name: 'Notification Chime / Ding', freq: 880, type: 'ding', desc: 'Pleasant pop-up and success chime' },
  { id: 'sfx-boom', name: 'Cinematic Bass Sub Boom', freq: 65, type: 'boom', desc: 'Heavy earthquake bass impact' },
  { id: 'sfx-pop', name: 'Bubble Pop', freq: 600, type: 'pop', desc: 'Crisp item spawn pop' },
  { id: 'sfx-glitch', name: 'Cyber Digital Glitch', freq: 320, type: 'glitch', desc: 'Corrupted signal buzz & stutter' },
  { id: 'sfx-shutter', name: 'Camera Shutter Click', freq: 1200, type: 'shutter', desc: 'DSLR mechanical photo snap' },
  { id: 'sfx-applause', name: 'Crowd Cheers & Applause', freq: 500, type: 'applause', desc: 'Stadium celebration cheering' },
  { id: 'sfx-typing', name: 'Mechanical Keyboard Click', freq: 700, type: 'typing', desc: 'Tactile typing feedback' },
  { id: 'sfx-laser', name: 'Sci-Fi Laser Blast', freq: 1100, type: 'laser', desc: 'High energy ray gun blast' },
  { id: 'sfx-airhorn', name: 'Viral DJ Airhorn', freq: 400, type: 'airhorn', desc: 'Hyped meme MLG airhorn triple burst' },
  { id: 'sfx-vinyl', name: 'Vinyl Record Scratch', freq: 250, type: 'vinyl', desc: 'DJ turntable sudden pause scratch' },
  { id: 'sfx-levelup', name: '8-Bit Level Up Melody', freq: 659, type: 'levelup', desc: 'Retro gaming power-up arpeggio' },
  { id: 'sfx-gameover', name: 'Game Over Sad Trombone', freq: 220, type: 'gameover', desc: 'Funny failure sound effect' },
  { id: 'sfx-heartbeat', name: 'Tense Cinematic Heartbeat', freq: 80, type: 'heartbeat', desc: 'Suspense pulse thumping' },
];

export const VOICE_CHANGER_PRESETS = [
  { id: 'vc-normal', name: 'Original Natural Voice', pitch: 1.0, reverb: 0, desc: 'Clean unmodified recording' },
  { id: 'vc-studio', name: 'Studio Podcast Mic', pitch: 0.95, reverb: 0.1, desc: 'Warm broadcasting presence with compression' },
  { id: 'vc-deep', name: 'Deep Movie Trailer Narrator', pitch: 0.75, reverb: 0.3, desc: 'Deep cinematic baritone voice' },
  { id: 'vc-chipmunk', name: 'Helium Chipmunk', pitch: 1.5, reverb: 0, desc: 'High-pitch squeaky comedic character' },
  { id: 'vc-robot', name: 'Cyber Android Robot', pitch: 1.0, reverb: 0.5, desc: 'Vocoder synthesized metallic voice' },
  { id: 'vc-demon', name: 'Dark Demon Monster', pitch: 0.6, reverb: 0.6, desc: 'Terrifying underworld pitched reverb' },
  { id: 'vc-radio', name: 'Police Radio Walkie-Talkie', pitch: 1.1, reverb: 0.2, desc: 'Bandpass filtered static radio comms' },
  { id: 'vc-cathedral', name: 'Cathedral Choir Reverb', pitch: 1.0, reverb: 0.8, desc: 'Massive atmospheric acoustic space' },
  { id: 'vc-telephone', name: 'Vintage 1950s Telephone', pitch: 1.2, reverb: 0.05, desc: 'Narrow frequency band vintage dial' },
];

// 7. PRO TRANSITIONS (25 Transitions)
export const PRO_TRANSITIONS = [
  { id: 'tr-cut', name: 'Hard Cut', type: 'cut', desc: 'Instant clean transition between clips' },
  { id: 'tr-whip-right', name: 'Whip Pan Right', type: 'whip', desc: 'Ultra-fast blurred horizontal camera whip' },
  { id: 'tr-whip-left', name: 'Whip Pan Left', type: 'whip', desc: 'Fast blurred leftward pan' },
  { id: 'tr-zoom-in', name: 'Zoom In Rush', type: 'zoom', desc: 'High-speed punch-in through the center' },
  { id: 'tr-zoom-out', name: 'Zoom Out Snap', type: 'zoom', desc: 'Rapid pull-back transition' },
  { id: 'tr-glitch-dissolve', name: 'Glitch Chromatic Split', type: 'glitch', desc: 'Digital pixel corruption cross-dissolve' },
  { id: 'tr-ink-splash', name: 'Ink Splash Matte', type: 'matte', desc: 'Organic watercolor blooming reveal' },
  { id: 'tr-slide-left', name: 'Smooth Slide Left', type: 'slide', desc: 'Horizontal motion push' },
  { id: 'tr-slide-up', name: 'Vertical Slide Up', type: 'slide', desc: 'Shorts/TikTok style upward swipe' },
  { id: 'tr-light-flash', name: 'Light Leak White Flash', type: 'flash', desc: 'Intense cinematic sunburst transition' },
  { id: 'tr-3d-cube', name: '3D Rotating Cube', type: '3d', desc: '3D perspective spatial box rotation' },
  { id: 'tr-page-curl', name: 'Magazine Page Curl', type: 'curl', desc: 'Realistic glossy paper page turn' },
  { id: 'tr-split-door', name: 'Split Door Center Wipe', type: 'split', desc: 'Vertical bi-parting elevator doors' },
  { id: 'tr-film-roll', name: '35mm Film Roll Flutter', type: 'film', desc: 'Analog film projector frame jump' },
  { id: 'tr-star-wipe', name: 'Retro Star Wipe', type: 'shape', desc: 'Vintage 1970s star expansion' },
  { id: 'tr-heart-bloom', name: 'Heart Valentine Bloom', type: 'shape', desc: 'Romantic heart shaped aperture reveal' },
  { id: 'tr-blur-dissolve', name: 'Gaussian Blur Dissolve', type: 'blur', desc: 'Dreamy soft focus crossfade' },
  { id: 'tr-circle-iris', name: 'Cartoon Circle Iris Wipe', type: 'iris', desc: 'Looney Tunes style circle opening' },
  { id: 'tr-burn-through', name: 'Film Negative Burn', type: 'burn', desc: 'Hot melted celluloid film burn' },
  { id: 'tr-checkerboard', name: 'Cyber Checkerboard Reveal', type: 'cyber', desc: 'Matrix square grid tile animation' },
];

// 8. AI MAGIC TOOLS (18 AI Capabilities)
export const AI_MAGIC_TOOLS = [
  { id: 'ai-bg-remover', name: 'AI Green Screen & Cutout', icon: 'Scissors', desc: 'Remove video or photo background without green screen', badge: '1-Click' },
  { id: 'ai-auto-reframe', name: 'AI Auto-Reframe 9:16', icon: 'Maximize2', desc: 'Smart subject tracking for TikTok, Shorts & YouTube 16:9', badge: 'Smart' },
  { id: 'ai-face-retouch', name: 'AI Face Retouch & Smooth', icon: 'Sparkles', desc: 'Flawless skin smoothing, teeth whitening & eye pop', badge: 'Beauty' },
  { id: 'ai-voiceover-tts', name: 'AI Voiceover Studio (TTS)', icon: 'Mic', desc: 'Generate hyper-realistic multilingual voice narration', badge: 'TTS' },
  { id: 'ai-smart-cut', name: 'AI Silence & Breath Remover', icon: 'Zap', desc: 'Instantly cut dead pauses and filler words (um/uh)', badge: 'Fast' },
  { id: 'ai-anime-cel', name: 'AI Anime / Cartoonizer', icon: 'Palette', desc: 'Transform realistic clips into Studio Ghibli anime style', badge: 'Art' },
  { id: 'ai-color-match', name: 'AI Color Match Reference', icon: 'Pipette', desc: 'Match color grades from any Hollywood blockbuster photo' },
  { id: 'ai-4k-upscale', name: 'AI 4K Super Resolution', icon: 'Maximize', desc: 'Enhance blurry low-res videos to crisp 4K UHD' },
  { id: 'ai-object-eraser', name: 'AI Object & Watermark Eraser', icon: 'Eraser', desc: 'Inpaint and erase unwanted people, logos & wires' },
  { id: 'ai-speed-beat', name: 'AI Speed Curve Beat Matcher', icon: 'Activity', desc: 'Auto-sync slow motion ramps to the musical drops' },
  { id: 'ai-thumbnail-gen', name: 'AI YouTube Thumbnail Generator', icon: 'Image', desc: 'Generate high-CTR click-worthy thumbnails with expressions' },
  { id: 'ai-subtitles-translate', name: 'AI Multi-Language Translator', icon: 'Globe', desc: 'Translate video audio and subtitles into 15+ world languages' },
  { id: 'ai-denoise-audio', name: 'AI Studio Noise Cancellation', icon: 'VolumeX', desc: 'Eliminate air conditioner, wind, and background hum' },
  { id: 'ai-stabilizer', name: 'AI Gyroflow Video Stabilizer', icon: 'Move', desc: 'Smooth out bumpy handheld action camera footage' },
];

// 9. PRO PHOTO EDITING TOOLS (20 Tools)
export const PRO_PHOTO_TOOLS = [
  { id: 'photo-crop-straighten', name: 'Crop & Angle Straighten', icon: 'Crop', desc: 'Precision angle rotation and aspect ratio cropping' },
  { id: 'photo-perspective-warp', name: 'Perspective Keystone Warp', icon: 'Maximize2', desc: 'Correct architectural lines and tilted lens angles' },
  { id: 'photo-hsl-wheels', name: 'HSL Color Channels (8-Way)', icon: 'Palette', desc: 'Adjust Hue, Saturation & Luminance per individual color' },
  { id: 'photo-tone-curves', name: 'RGB Tone Curves (Master/R/G/B)', icon: 'Activity', desc: 'Pro S-Curve contrast and matte shadow clipping' },
  { id: 'photo-selective-color', name: 'Selective Color Isolation', icon: 'Droplet', desc: 'Keep single color red/blue while turning background B&W' },
  { id: 'photo-vignette-feather', name: 'Radial Vignette & Feather', icon: 'Sun', desc: 'Adjustable darkness, roundness, and softness falloff' },
  { id: 'photo-grain-texture', name: 'Organic Film Grain', icon: 'Layers', desc: 'Add 35mm / 120 medium format analog film texture' },
  { id: 'photo-clarity-structure', name: 'Clarity & Micro-Contrast', icon: 'Contrast', desc: 'Punch up midtone definition and structural details' },
  { id: 'photo-shadow-recovery', name: 'Shadow & Highlight Recovery', icon: 'SunMedium', desc: 'Rescue blown out skies and dark shadows with HDR range' },
  { id: 'photo-white-balance', name: 'Kelvin White Balance & Tint', icon: 'Thermometer', desc: 'Accurate color temperature correction (2000K to 10000K)' },
  { id: 'photo-double-exposure', name: 'Double Exposure Blender', icon: 'Layers', desc: 'Blend portrait with cityscape or starry galaxy' },
  { id: 'photo-frames-borders', name: 'Polaroid & Film Strip Borders', icon: 'Square', desc: 'Classic vintage Polaroid 600, Kodak 35mm film borders' },
  { id: 'photo-blemish-fix', name: 'Skin Blemish & Spot Healer', icon: 'Sparkles', desc: 'Touch up acne, blemishes, and lens dust spots' },
  { id: 'photo-bokeh-depth', name: 'F/1.4 Portrait Bokeh Blur', icon: 'Eye', desc: 'Simulate creamy optical depth of field background blur' },
  { id: 'photo-posterize', name: 'Posterize Art Levels', icon: 'Layers', desc: 'Graphic vector silk-screen print posterization' },
  { id: 'photo-tilt-shift', name: 'Tilt-Shift Miniature Diorama', icon: 'Sliders', desc: 'Linear blur band making cities look like miniature toys' },
];
