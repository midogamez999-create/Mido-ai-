import { AppProject } from '../types';

export const STARTER_APPS: AppProject[] = [
  {
    id: 'ai-paint-studio',
    title: 'AI Canvas & Paint Studio',
    description: 'Interactive HTML5 drawing canvas with brushes, shapes, color pickers, and image export',
    updatedAt: 'Just now',
    html: `<div class="paint-container">
  <div class="toolbar">
    <div class="brand">🎨 Canvas Studio</div>
    <div class="tools-group">
      <button class="tool-btn active" id="btn-brush" onclick="setTool('brush')">🖌️ Brush</button>
      <button class="tool-btn" id="btn-eraser" onclick="setTool('eraser')">🧹 Eraser</button>
      <button class="tool-btn" id="btn-line" onclick="setTool('line')">📏 Line</button>
      <button class="tool-btn" id="btn-rect" onclick="setTool('rect')">🔲 Box</button>
    </div>
    <div class="color-group">
      <input type="color" id="colorPicker" value="#a855f7" onchange="updateColor(this.value)">
      <div class="preset-color" style="background:#a855f7" onclick="updateColor('#a855f7')"></div>
      <div class="preset-color" style="background:#3b82f6" onclick="updateColor('#3b82f6')"></div>
      <div class="preset-color" style="background:#10b981" onclick="updateColor('#10b981')"></div>
      <div class="preset-color" style="background:#ef4444" onclick="updateColor('#ef4444')"></div>
      <div class="preset-color" style="background:#f59e0b" onclick="updateColor('#f59e0b')"></div>
    </div>
    <div class="size-group">
      <label>Size:</label>
      <input type="range" id="sizeRange" min="2" max="40" value="8" oninput="updateSize(this.value)">
      <span id="sizeValue">8px</span>
    </div>
    <div class="actions">
      <button class="action-btn" onclick="clearCanvas()">🗑️ Clear</button>
      <button class="action-btn primary" onclick="downloadImage()">💾 Save PNG</button>
    </div>
  </div>
  <div class="canvas-wrapper">
    <canvas id="paintCanvas" width="800" height="500"></canvas>
  </div>
</div>`,
    css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #090d16;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}
.paint-container {
  width: 100%;
  max-width: 900px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-b: 1px solid rgba(255, 255, 255, 0.1);
}
.brand { font-weight: 800; font-size: 1.1rem; color: #c084fc; }
.tools-group, .color-group, .size-group, .actions { display: flex; align-items: center; gap: 8px; }
.tool-btn, .action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tool-btn.active, .tool-btn:hover { background: rgba(168, 85, 247, 0.2); border-color: #a855f7; color: #fff; }
.action-btn.primary { background: #a855f7; color: #fff; border: none; }
.action-btn.primary:hover { background: #9333ea; }
.preset-color { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); }
#colorPicker { border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; background: none; }
.size-group label { font-size: 0.75rem; color: #94a3b8; }
.size-group input { width: 80px; accent-color: #a855f7; }
#sizeValue { font-size: 0.75rem; color: #a855f7; font-weight: bold; width: 32px; }
.canvas-wrapper {
  background: #030712;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
}
canvas { cursor: crosshair; display: block; width: 100%; height: auto; max-height: 500px; background: #ffffff; }`,
    js: `const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#a855f7';
let currentSize = 8;
let startX = 0, startY = 0;
let snapshot;

function initCanvas() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
initCanvas();

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('btn-' + tool).classList.add('active');
}

function updateColor(color) {
  currentColor = color;
  document.getElementById('colorPicker').value = color;
}

function updateSize(size) {
  currentSize = size;
  document.getElementById('sizeValue').textContent = size + 'px';
}

function clearCanvas() {
  if (confirm('Clear canvas?')) initCanvas();
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'mido-canvas-art.png';
  link.href = canvas.toDataURL();
  link.click();
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  startX = (e.clientX - rect.left) * (canvas.width / rect.width);
  startY = (e.clientY - rect.top) * (canvas.height / rect.height);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (currentTool === 'brush') {
    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === 'eraser') {
    ctx.strokeStyle = '#ffffff';
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === 'line') {
    ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = currentColor;
    ctx.stroke();
  } else if (currentTool === 'rect') {
    ctx.putImageData(snapshot, 0, 0);
    ctx.strokeStyle = currentColor;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  }
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);`
  },
  {
    id: 'weather-pulse',
    title: 'Weather Pulse Dashboard',
    description: 'Dynamic glassmorphic weather widget with forecast animations',
    updatedAt: 'Just now',
    html: `<div class="app-container">
  <div class="weather-card">
    <div class="header">
      <h2>Tokyo, Japan</h2>
      <span class="badge">Live Weather</span>
    </div>
    <div class="temp-display">
      <div class="temp">24°C</div>
      <div class="condition">Partly Cloudy</div>
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="label">Humidity</span>
        <span class="value">68%</span>
      </div>
      <div class="stat-item">
        <span class="label">Wind</span>
        <span class="value">14 km/h</span>
      </div>
      <div class="stat-item">
        <span class="label">UV Index</span>
        <span class="value">4 (Moderate)</span>
      </div>
    </div>
    <button class="refresh-btn" onclick="refreshTemp()">Refresh Live Stats</button>
  </div>
</div>`,
    css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.app-container {
  padding: 20px;
  width: 100%;
  max-width: 420px;
}
.weather-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h2 { margin: 0; font-size: 1.5rem; }
.badge {
  background: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}
.temp-display {
  margin: 24px 0;
  text-align: center;
}
.temp {
  font-size: 3.8rem;
  font-weight: 800;
  background: linear-gradient(to right, #ffffff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.condition {
  color: #cbd5e1;
  font-size: 1.1rem;
  margin-top: 4px;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 24px;
}
.stat-item {
  background: rgba(255,255,255,0.05);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}
.label { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 4px; }
.value { font-weight: 600; font-size: 0.95rem; }
.refresh-btn {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #6366f1;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.refresh-btn:hover { background: #4f46e5; transform: translateY(-1px); }`,
    js: `function refreshTemp() {
  const newTemp = Math.floor(Math.random() * 8) + 20;
  document.querySelector('.temp').textContent = newTemp + '°C';
  const btn = document.querySelector('.refresh-btn');
  btn.textContent = 'Updated!';
  setTimeout(() => btn.textContent = 'Refresh Live Stats', 1500);
}`
  },
  {
    id: 'cyber-snake',
    title: 'Neon Cyberpunk Snake',
    description: 'Retro arcade game with neon glow and sound effects',
    updatedAt: '2 hours ago',
    html: `<div class="game-wrapper">
  <h1>NEON SNAKE</h1>
  <div id="score-board">SCORE: <span id="score">0</span></div>
  <canvas id="gameCanvas" width="360" height="360"></canvas>
  <button id="start-btn" onclick="resetGame()">Start New Game</button>
</div>`,
    css: `body {
  margin: 0;
  background: #090d16;
  color: #00ffcc;
  font-family: 'Courier New', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.game-wrapper {
  text-align: center;
}
h1 { margin-bottom: 8px; text-shadow: 0 0 10px #00ffcc; letter-spacing: 2px; }
#score-board { font-size: 1.2rem; margin-bottom: 12px; font-weight: bold; }
canvas {
  border: 2px solid #00ffcc;
  box-shadow: 0 0 20px rgba(0, 255, 204, 0.4);
  border-radius: 8px;
  background: #030712;
}
#start-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: transparent;
  color: #00ffcc;
  border: 2px solid #00ffcc;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
}
#start-btn:hover { background: #00ffcc; color: #000; }`,
    js: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 18;
let count = 0;
let score = 0;
let snake = { x: 160, y: 160, dx: grid, dy: 0, cells: [], maxCells: 4 };
let apple = { x: 320, y: 320 };

function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

function resetGame() {
  score = 0;
  document.getElementById('score').textContent = score;
  snake.x = 160; snake.y = 160;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid; snake.dy = 0;
  apple.x = getRandomInt(0, 20) * grid;
  apple.y = getRandomInt(0, 20) * grid;
}

function loop() {
  requestAnimationFrame(loop);
  if (++count < 6) return;
  count = 0;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  snake.x += snake.dx;
  snake.y += snake.dy;

  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  snake.cells.unshift({x: snake.x, y: snake.y});
  if (snake.cells.length > snake.maxCells) snake.cells.pop();

  ctx.fillStyle = '#ff0055';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ff0055';
  ctx.fillRect(apple.x, apple.y, grid-1, grid-1);

  ctx.fillStyle = '#00ffcc';
  ctx.shadowColor = '#00ffcc';
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid-1, grid-1);
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score += 10;
      document.getElementById('score').textContent = score;
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }
  });
}
requestAnimationFrame(loop);
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
  else if (e.key === 'ArrowUp' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
  else if (e.key === 'ArrowRight' && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
  else if (e.key === 'ArrowDown' && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
});`
  }
];

export const PHOTO_PRESETS = [
  '⚽ 3D Football AI Match: Epic Goal Shootout in Packed Stadium with Floodlights, 8K',
  'Futuristic cybernetic city with floating neon vehicles, cinematic lighting, 8K resolution',
  'A cute golden retriever wearing astronaut gear on Mars, hyperrealistic, detailed fur',
  'Minimalist 3D isometric laboratory with AI robots crafting glowing crystals',
  'A serene Japanese zen garden with sakura petals floating over crystal water at sunrise',
  '🏎️ Cyberpunk Sports Car drifting through rainy neon Tokyo street, 4K raytracing',
  '🦁 Regal lion wearing a golden crown in a dark fantasy throne room, dramatic light',
  '🎨 Pixar 3D animated character playing acoustic guitar on a cozy balcony'
];

export const VIDEO_PRESETS = [
  '👋 Realistic Person Smiling, Waving & Saying Hello in 4K Studio',
  '⚽ 3D Football AI Match: Epic Goal & Penalty Shootout in Packed Stadium',
  '🎙️ AI News Anchor Presenting Breaking Tech Update with Lip-Sync',
  '🏎️ Cyberpunk 3D Speed Race: Neon sports car drifting through Tokyo',
  '🐉 Legendary Cosmic Dragon soaring through neon clouds breathing fire',
  '🤖 Sci-Fi Android Robot greeting the user and demonstrating quantum AI',
  '🌊 Serene Tropical Ocean sunset with bioluminescent waves & dolphins',
  '✨ Anime Hero powering up with glowing lightning aura in 60 FPS'
];

export const MUSIC_PRESETS = [
  { title: 'Synthwave Night Ride', prompt: '80s retro synthwave beat with pulsing bass, arpeggios, and driving drums', genre: 'Synthwave' },
  { title: 'Lofi Study Chill', prompt: 'Relaxing lofi hip-hop beat with warm vinyl crackle, gentle piano chord, and soft snare', genre: 'Lofi' },
  { title: 'Cinematic Trailer Epic', prompt: 'Epic cinematic orchestral composition with swelling strings, brass hits, and powerful drums', genre: 'Orchestral' },
  { title: 'Futuristic Cyber Ambient', prompt: 'Deep ethereal ambient synth pad with delicate shimmer textures and slow atmospheric rhythm', genre: 'Ambient' }
];
