import * as THREE from 'three';

/**
 * Hyper-Realistic Survival Horror Procedural Textures & 3D Biological Models
 * True Photorealistic Atmosphere: Visceral Gore, Decomposed Biomass, Wet Specular Blood,
 * Autopsy Tables, Hanging Body Bags, and Real Deformed Monstrosities.
 */

// ----------------------------------------------------
// 1. HIGH-DETAIL VISCERAL BLOOD & GORE TEXTURES
// ----------------------------------------------------

export function createBloodTexture(
  type: 'pool' | 'splatter' | 'handprint' | 'graffiti' | 'trail' | 'arterial',
  customText?: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 1024);

  if (type === 'pool') {
    // Deep oxygenated dark center with coagulated clots
    const grad = ctx.createRadialGradient(512, 512, 40, 512, 512, 440);
    grad.addColorStop(0, '#1a0102');
    grad.addColorStop(0.25, '#3b0206');
    grad.addColorStop(0.55, '#5c050b');
    grad.addColorStop(0.8, '#820811');
    grad.addColorStop(0.94, '#4a0307');
    grad.addColorStop(1, 'rgba(26, 1, 2, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    const points = 28;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const noise = Math.sin(i * 4.3) * 75 + Math.cos(i * 2.7) * 60 + Math.sin(i * 7.1) * 35;
      const radius = 330 + noise;
      const x = 512 + Math.cos(angle) * radius;
      const y = 512 + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Dark coagulated blood clots inside the pool
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 260;
      const cx = 512 + Math.cos(angle) * dist;
      const cy = 512 + Math.sin(angle) * dist;
      const sizeX = 8 + Math.random() * 32;
      const sizeY = 6 + Math.random() * 22;

      ctx.fillStyle = '#180102';
      ctx.beginPath();
      ctx.ellipse(cx, cy, sizeX, sizeY, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // High-specular glistening droplets and micro-spatters around edge
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 310 + Math.random() * 170;
      const dropX = 512 + Math.cos(angle) * dist;
      const dropY = 512 + Math.sin(angle) * dist;
      const size = 2 + Math.random() * 12;

      ctx.fillStyle = Math.random() > 0.35 ? '#73060e' : '#2b0205';
      ctx.beginPath();
      ctx.arc(dropX, dropY, size, 0, Math.PI * 2);
      ctx.fill();

      // Micro white specular sheen
      if (size > 5) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(dropX - size * 0.3, dropY - size * 0.3, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'splatter' || type === 'arterial') {
    // Violent arterial high-pressure spray
    ctx.fillStyle = '#660309';
    for (let i = 0; i < 32; i++) {
      const angle = Math.random() * Math.PI * 2;
      const length = 80 + Math.random() * 380;
      const width = 3 + Math.random() * 16;

      ctx.save();
      ctx.translate(512, 512);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(width * 2.5, length * 0.4, (Math.random() - 0.5) * 10, length);
      ctx.quadraticCurveTo(-width * 2.5, length * 0.4, 0, 0);
      ctx.fillStyle = '#78050e';
      ctx.fill();
      ctx.restore();
    }

    // Heavy central impact core
    ctx.fillStyle = '#300104';
    ctx.beginPath();
    ctx.arc(512, 512, 85, 0, Math.PI * 2);
    ctx.fill();

    // 150 fine airborne droplet particulates
    for (let i = 0; i < 180; i++) {
      const x = 512 + (Math.random() - 0.5) * 850;
      const y = 512 + (Math.random() - 0.5) * 850;
      ctx.fillStyle = Math.random() > 0.5 ? '#800812' : '#450207';
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'handprint') {
    // Realistic bloody palm with sliding bloody fingertips down wall
    ctx.fillStyle = '#630308';
    ctx.beginPath();
    ctx.ellipse(512, 580, 95, 115, 0, 0, Math.PI * 2);
    ctx.fill();

    const fingerAngles = [-0.45, -0.22, 0, 0.22, 0.48];
    const fingerLengths = [180, 250, 280, 240, 160];
    fingerAngles.forEach((ang, idx) => {
      ctx.save();
      ctx.translate(512, 540);
      ctx.rotate(ang);

      // Main Finger Print
      ctx.beginPath();
      ctx.roundRect(-22, -fingerLengths[idx], 44, fingerLengths[idx], 22);
      ctx.fillStyle = '#540206';
      ctx.fill();

      // Drag streaks dragging down vertically
      ctx.beginPath();
      ctx.moveTo(-16, -fingerLengths[idx]);
      ctx.lineTo(-8, -fingerLengths[idx] - 150 - Math.random() * 80);
      ctx.lineTo(8, -fingerLengths[idx] - 150 - Math.random() * 80);
      ctx.lineTo(16, -fingerLengths[idx]);
      ctx.fillStyle = 'rgba(84, 2, 6, 0.45)';
      ctx.fill();

      ctx.restore();
    });
  } else if (type === 'graffiti') {
    const text = customText || 'NO ESCAPE FROM B3';
    ctx.save();
    ctx.font = '900 68px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#8f050f';
    ctx.shadowColor = '#240103';
    ctx.shadowBlur = 24;
    ctx.fillText(text, 512, 460);

    // Dripping blood streams running down from letters
    for (let i = 120; i < 920; i += 55) {
      if (Math.random() > 0.25) {
        ctx.strokeStyle = '#610309';
        ctx.lineWidth = 4 + Math.random() * 6;
        ctx.beginPath();
        ctx.moveTo(i, 490);
        const dripLen = 90 + Math.random() * 220;
        ctx.lineTo(i + (Math.random() - 0.5) * 12, 490 + dripLen);
        ctx.stroke();

        ctx.fillStyle = '#8f050f';
        ctx.beginPath();
        ctx.arc(i + (Math.random() - 0.5) * 12, 490 + dripLen, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (type === 'trail') {
    // Realistic dragged bloody corpse trail
    ctx.fillStyle = '#330205';
    ctx.beginPath();
    ctx.ellipse(512, 512, 140, 480, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#6e050d';
    ctx.lineWidth = 26;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(420 + i * 40, 60);
      ctx.bezierCurveTo(
        440 + i * 35 + (Math.random() - 0.5) * 30,
        320,
        410 + i * 40 + (Math.random() - 0.5) * 30,
        680,
        430 + i * 38,
        960
      );
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ----------------------------------------------------
// 2. CONCRETE / METAL / HOSPITAL WALL TEXTURES
// ----------------------------------------------------

export function createHospitalWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Grimy, moldy hospital green-grey tile
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Upper dirty off-white plaster
  ctx.fillStyle = '#283548';
  ctx.fillRect(0, 0, 512, 340);

  // Lower dirty green wainscoting
  ctx.fillStyle = '#0f2922';
  ctx.fillRect(0, 340, 512, 172);

  // Dark grime divider line
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 336, 512, 8);

  // Mold, rust stains, peeling patches
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = 1 + Math.random() * 4;
    ctx.fillStyle = Math.random() > 0.6 ? 'rgba(0, 0, 0, 0.4)' : 'rgba(56, 30, 15, 0.3)';
    ctx.fillRect(x, y, s, s);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createColdFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark mottled concrete hospital tiles
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 128;
  for (let x = 0; x < 512; x += tileSize) {
    for (let y = 0; y < 512; y += tileSize) {
      const shade = 18 + Math.floor(Math.random() * 12);
      ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 10})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Tile grout dark lines
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

// ----------------------------------------------------
// 3. REAL-LIFE MONSTER 1: THE BIO-FLAYED STALKER (XVI-XVIPER)
// Photorealistic mutated monstrosity with exposed muscle sinew,
// elongated multi-jointed limbs, razor bone-scythes & split jaw skull.
// ----------------------------------------------------

export function createRealBioStalkerMonsterModel(): THREE.Group {
  const group = new THREE.Group();

  // Visceral flesh & bone materials
  const muscleFleshMat = new THREE.MeshStandardMaterial({
    color: 0x5c050b,
    roughness: 0.3,
    metalness: 0.2,
  });

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xd6cbb8,
    roughness: 0.5,
    metalness: 0.1,
  });

  const blackBileMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.1,
    metalness: 0.8,
  });

  // 1. Twisted Torso with Exposed Ribcage & Pulsating Necrotic Core
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 1.1, 10), muscleFleshMat);
  torso.position.set(0, 1.25, 0);
  torso.rotation.x = 0.25;
  group.add(torso);

  // Exposed Yellowed Ribs protruding around torso
  for (let r = -3; r <= 3; r++) {
    const ribLeft = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.028, 6, 12, Math.PI * 0.65), boneMat);
    ribLeft.position.set(-0.02, 1.25 + r * 0.12, 0.05);
    ribLeft.rotation.z = Math.PI * 0.7;
    ribLeft.rotation.x = 0.2;

    const ribRight = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.028, 6, 12, Math.PI * 0.65), boneMat);
    ribRight.position.set(0.02, 1.25 + r * 0.12, 0.05);
    ribRight.rotation.z = -Math.PI * 0.7;
    ribRight.rotation.y = Math.PI;
    ribRight.rotation.x = 0.2;

    group.add(ribLeft, ribRight);
  }

  // Exposed Pulsating Heart / Organ Core
  const heartMat = new THREE.MeshStandardMaterial({
    color: 0x880811,
    emissive: 0x660408,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const heart = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16), heartMat);
  heart.position.set(0, 1.35, 0.08);
  group.add(heart);

  // 2. Grotesque Split-Jaw Skull Head
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), boneMat);
  skull.scale.set(0.9, 1.2, 1.1);
  skull.position.set(0, 1.95, 0.15);
  group.add(skull);

  // Milky Cataract Eyes with Blind White Glow
  const blindEyeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdddddd,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  [-0.1, 0.1].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), blindEyeMat);
    eye.position.set(ex, 2.02, 0.38);
    group.add(eye);
  });

  // Split Lower Jaws (Two hinged mandible halves lined with jagged teeth)
  [-1, 1].forEach((side) => {
    const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.35, 6), boneMat);
    jaw.position.set(side * 0.12, 1.76, 0.3);
    jaw.rotation.z = side * 0.35;
    jaw.rotation.x = 0.4;

    // Needle-sharp human-like teeth
    for (let t = 0; t < 5; t++) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.06, 5), boneMat);
      tooth.position.set(side * (0.08 + t * 0.02), 1.82, 0.32 + t * 0.02);
      tooth.rotation.x = Math.PI;
      group.add(tooth);
    }
    group.add(jaw);
  });

  // 3. Quadruped / Multi-Jointed Elongated Limbs with Bone Blade Scythes
  [-1, 1].forEach((side) => {
    // Upper Arm
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.85, 6), muscleFleshMat);
    upperArm.position.set(side * 0.42, 1.45, 0);
    upperArm.rotation.z = side * 0.4;
    upperArm.rotation.x = -0.2;

    // Forearm
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 0.95, 6), muscleFleshMat);
    forearm.position.set(side * 0.65, 0.85, 0.2);
    forearm.rotation.z = side * -0.3;
    forearm.rotation.x = 0.5;

    // Curved Bone Blade Scythe Talon
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.6, 6), blackBileMat);
    blade.position.set(side * 0.72, 0.3, 0.45);
    blade.rotation.x = Math.PI * 0.75;
    blade.rotation.z = side * 0.15;

    group.add(upperArm, forearm, blade);

    // Contorted Hind Legs
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.8, 6), muscleFleshMat);
    thigh.position.set(side * 0.25, 0.7, -0.15);
    thigh.rotation.x = -0.5;
    thigh.rotation.z = side * 0.2;

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.035, 0.85, 6), boneMat);
    shin.position.set(side * 0.3, 0.25, 0.05);
    shin.rotation.x = 0.6;

    group.add(thigh, shin);
  });

  group.scale.set(1.15, 1.15, 1.15);
  return group;
}

// ----------------------------------------------------
// 4. REAL-LIFE MONSTER 2: THE DECOMPOSED PATIENT ZERO (THE CORPSE ABOMINATION)
// Mottled grey-purple decaying human cadaver with surgical clamps,
// torn open rib cavity, and dangling vertebrae.
// ----------------------------------------------------

export function createRealCorpseAbominationModel(): THREE.Group {
  const group = new THREE.Group();

  const necroticSkinMat = new THREE.MeshStandardMaterial({
    color: 0x3d4348,
    roughness: 0.7,
    metalness: 0.1,
  });

  const coagulatedGoreMat = new THREE.MeshStandardMaterial({
    color: 0x4a0307,
    roughness: 0.4,
  });

  const surgicalSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });

  // 1. Contorted Necrotic Cadaver Torso with Surgical Incision & Clamps
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.85, 0.28), necroticSkinMat);
  torso.position.set(0, 1.15, 0);
  torso.rotation.z = 0.12; // Unnatural spine tilt
  group.add(torso);

  // Deep chest cavity y-incision with exposed viscera
  const chestGore = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.12), coagulatedGoreMat);
  chestGore.position.set(0, 1.15, 0.12);
  group.add(chestGore);

  // Metal Surgical Clamps / Retractors holding chest open
  for (let c = -2; c <= 2; c++) {
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.03), surgicalSteelMat);
    clamp.position.set(0, 1.15 + c * 0.12, 0.16);
    group.add(clamp);
  }

  // 2. Convulsing Asymmetrical Cadaver Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), necroticSkinMat);
  head.scale.set(0.85, 1.1, 0.95);
  head.position.set(0.06, 1.82, 0.04);
  head.rotation.z = -0.28; // Snapped neck posture
  group.add(head);

  // Torn Lower Jaw dangling open with blood strings
  const tornJaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.2), necroticSkinMat);
  tornJaw.position.set(0.08, 1.58, 0.18);
  tornJaw.rotation.x = 0.5;
  group.add(tornJaw);

  // Hollow Eye Sockets with Sunken Black Voids
  const socketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [-0.07, 0.09].forEach((sx) => {
    const socket = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), socketMat);
    socket.position.set(0.06 + sx, 1.86, 0.22);
    group.add(socket);
  });

  // 3. Shriveled Asymmetric Cadaver Arms (One elongated, one severed stump)
  // Left Long Twisted Arm
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.03, 1.3, 6), necroticSkinMat);
  leftArm.position.set(-0.42, 0.9, 0.05);
  leftArm.rotation.z = 0.25;
  leftArm.rotation.x = 0.3;

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.06), necroticSkinMat);
  leftHand.position.set(-0.58, 0.2, 0.2);
  group.add(leftArm, leftHand);

  // Right Severed Surgical Stump with blood drip
  const rightStump = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.45, 6), necroticSkinMat);
  rightStump.position.set(0.35, 1.3, 0);
  rightStump.rotation.z = -0.4;
  const stumpGore = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), coagulatedGoreMat);
  stumpGore.position.set(0.48, 1.12, 0);
  group.add(rightStump, stumpGore);

  // 4. Decayed Cadaver Legs with Exposed Fractured Shin Bone
  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.85, 6), necroticSkinMat);
  leftLeg.position.set(-0.16, 0.42, 0);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.85, 6), necroticSkinMat);
  rightLeg.position.set(0.16, 0.42, 0);

  group.add(leftLeg, rightLeg);
  group.scale.set(1.1, 1.1, 1.1);
  return group;
}

// ----------------------------------------------------
// 5. REAL-LIFE MONSTER 3: THE VOID SPECTRE (NOX / QUANTUM HORROR)
// Swirling necrotic black-purple vortex with shrieking skull & energy arcs.
// ----------------------------------------------------

export function createRealVoidSpectreModel(): THREE.Group {
  const group = new THREE.Group();

  const voidCoreMat = new THREE.MeshStandardMaterial({
    color: 0x05010a,
    emissive: 0x3b0764,
    emissiveIntensity: 2.4,
    roughness: 0.1,
    metalness: 0.9,
    wireframe: false,
  });

  const voidAuraMat = new THREE.MeshBasicMaterial({
    color: 0x9333ea,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });

  // Central Shrieking Ghostly Energy Skull
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), voidCoreMat);
  skull.scale.set(0.9, 1.3, 1.0);
  skull.position.set(0, 1.6, 0);

  const outerShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 2), voidAuraMat);
  outerShell.position.set(0, 1.6, 0);

  group.add(skull, outerShell);

  // Hollow Screaming Mouth of the Void
  const voidMouth = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.25, 8), voidCoreMat);
  voidMouth.rotation.x = Math.PI / 2;
  voidMouth.position.set(0, 1.42, 0.28);
  group.add(voidMouth);

  // Tendrils of pure darkness twisting down
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tendril = new THREE.Mesh(new THREE.ConeGeometry(0.04, 1.2, 5), voidCoreMat);
    tendril.position.set(Math.cos(angle) * 0.25, 0.8, Math.sin(angle) * 0.25);
    tendril.rotation.z = Math.cos(angle) * 0.4;
    tendril.rotation.x = Math.sin(angle) * 0.4;
    group.add(tendril);
  }

  return group;
}

// ----------------------------------------------------
// 6. REALISTIC HORROR PROPS: HANGING BODY BAGS, AUTOPSY SLABS & SURGICAL TOOLS
// ----------------------------------------------------

export function createHangingBodyBagModel(): THREE.Group {
  const group = new THREE.Group();

  // Meat Hook & Chain
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), chainMat);
  chain.position.y = 2.4;
  group.add(chain);

  // Black Polyvinyl Morgue Body Bag with human silhouette bulge
  const bagMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    roughness: 0.2, // Wet glossy sheen
    metalness: 0.3,
  });

  const bag = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.4, 8, 16), bagMat);
  bag.position.y = 1.3;
  group.add(bag);

  // Zipper seam down the center
  const zipMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.5, 0.02), zipMat);
  zipper.position.set(0, 1.3, 0.32);
  group.add(zipper);

  // Dripping blood from the bottom tip
  const bloodDripMat = new THREE.MeshStandardMaterial({
    color: 0x70050d,
    emissive: 0x500308,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });
  const dripTip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.25, 6), bloodDripMat);
  dripTip.position.set(0, 0.45, 0);
  group.add(dripTip);

  return group;
}

export function createAutopsySlabModel(): THREE.Group {
  const group = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.25,
  });

  const goreMat = new THREE.MeshStandardMaterial({
    color: 0x4a0307,
    roughness: 0.3,
  });

  // Stainless Steel Dissection Table with drainage border gutter
  const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 2.4), steelMat);
  slab.position.y = 0.85;
  group.add(slab);

  // Blood drainage basin in center of slab
  const gorePool = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.6), goreMat);
  gorePool.position.set(0, 0.91, 0);
  group.add(gorePool);

  // 4 Heavy Industrial Steel Table Legs
  for (let x = -0.5; x <= 0.5; x += 1.0) {
    for (let z = -1.0; z <= 1.0; z += 2.0) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.85, 8), steelMat);
      leg.position.set(x, 0.425, z);
      group.add(leg);
    }
  }

  // Scattered Surgical Bone Saw & Scalpels on edge
  const saw = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.35), steelMat);
  saw.position.set(0.45, 0.92, 0.6);
  saw.rotation.y = 0.4;
  group.add(saw);

  return group;
}

export function createVirethiumCluster(): THREE.Group {
  const group = new THREE.Group();
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 2.5,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
  });

  for (let i = 0; i < 8; i++) {
    const height = 0.7 + Math.random() * 0.9;
    const radius = 0.09 + Math.random() * 0.07;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 5), crystalMat);
    spike.position.set((Math.random() - 0.5) * 0.45, height * 0.45, (Math.random() - 0.5) * 0.45);
    spike.rotation.x = (Math.random() - 0.5) * 0.4;
    spike.rotation.z = (Math.random() - 0.5) * 0.4;
    group.add(spike);
  }

  return group;
}

export function createHangingWireModel(): THREE.Group {
  const group = new THREE.Group();
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.8, 6), wireMat);
  wire.position.y = 0.9;
  group.add(wire);

  // Exposed live sparking copper tip
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 3.5,
  });
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), tipMat);
  tip.position.y = 0.02;
  group.add(tip);

  return group;
}

// ----------------------------------------------------
// 7. 3D TACTICAL INVENTORY ITEM INSPECTION MODELS
// ----------------------------------------------------

export function createItemInspectionModel(type: string): THREE.Group {
  const group = new THREE.Group();

  if (type === 'syringe') {
    // Medical Adrenaline Auto-Injector Syringe
    const glassMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16), glassMat);
    group.add(barrel);

    // Glowing Amber / Crimson Adrenaline Liquid
    const fluidMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
    });
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16), fluidMat);
    fluid.position.y = -0.1;
    group.add(fluid);

    // Steel Plunger & Needle
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.005, 0.45, 8), steelMat);
    needle.position.y = -0.65;
    const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), steelMat);
    plunger.position.y = 0.55;
    const thumbRest = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), steelMat);
    thumbRest.position.y = 0.8;
    group.add(needle, plunger, thumbRest);
  } else if (type === 'bone_saw') {
    // Surgical Bone Saw
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.2 });
    const bloodMat = new THREE.MeshStandardMaterial({ color: 0x5c050b, roughness: 0.3 });

    // Serrated Spine Blade
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.85, 0.18), steelMat);
    blade.position.y = 0.3;
    const goreEdge = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.85, 0.04), bloodMat);
    goreEdge.position.set(0, 0.3, 0.08);

    // Grip Handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12), handleMat);
    handle.position.y = -0.4;
    group.add(blade, goreEdge, handle);
  } else if (type === 'keycard') {
    // Security Keycard
    const cardMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.4, roughness: 0.3 });
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.95), cardMat);
    
    // Magnetic Stripe & Gold Chip
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.2), chipMat);
    chip.position.set(-0.15, 0.005, -0.2);

    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.035, 0.15), stripeMat);
    stripe.position.set(0, -0.005, 0.3);
    group.add(card, chip, stripe);
  } else if (type === 'tape') {
    // Cassette Audio Tape
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, 0.55), tapeMat);

    const spoolMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.4 });
    const spool1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.11, 16), spoolMat);
    spool1.position.set(-0.2, 0, 0);
    const spool2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.11, 16), spoolMat);
    spool2.position.set(0.2, 0, 0);

    const labelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.8 });
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.105, 0.3), labelMat);
    group.add(body, spool1, spool2, label);
  } else if (type === 'chemical_vial') {
    // Sealed Xenobiology Isotope Vial (Pardodene / Virethium / Catalyst)
    const glassMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.1,
      transmission: 0.92,
      thickness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const vialBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16), glassMat);
    group.add(vialBody);

    // Glowing Bioluminescent Chemical Core
    const chemMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 2.2,
    });
    const chemCore = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 16), chemMat);
    chemCore.position.y = -0.05;

    // Hazmat Cryo-Cap & Magnetic Lock Ring
    const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 16), capMat);
    cap.position.y = 0.45;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), capMat);
    base.position.y = -0.42;

    group.add(chemCore, cap, base);
  } else {
    // Tactical Flashlight
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 16), metalMat);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.3, 16), metalMat);
    head.position.y = 0.45;
    
    // Glowing Lens
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xfff5e6, emissive: 0xffedd5, emissiveIntensity: 2.0 });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), lensMat);
    lens.position.y = 0.59;

    group.add(barrel, head, lens);
  }

  return group;
}

// ----------------------------------------------------
// 8. PARDODENE BIOLUMINESCENT SLIME TEXTURE
// ----------------------------------------------------
export function createPardodeneSlimeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Toxic glowing puddle gradient
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 220);
  grad.addColorStop(0, '#34d399');
  grad.addColorStop(0.3, '#059669');
  grad.addColorStop(0.6, '#064e3b');
  grad.addColorStop(0.85, '#022c22');
  grad.addColorStop(1, 'rgba(2, 44, 34, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  const points = 24;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const noise = Math.sin(i * 3.7) * 35 + Math.cos(i * 2.1) * 25;
    const radius = 170 + noise;
    const x = 256 + Math.cos(angle) * radius;
    const y = 256 + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Glowing micro bubbles
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 140;
    const bx = 256 + Math.cos(angle) * dist;
    const by = 256 + Math.sin(angle) * dist;
    const size = 2 + Math.random() * 8;

    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(bx, by, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}


