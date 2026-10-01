import React, { useState } from 'react';
import { Palette, Crop, Sun, Contrast, Droplet, Layers, Sliders, Thermometer, Maximize2, Sparkles, Check } from 'lucide-react';
import { PRO_PHOTO_TOOLS } from '../midoCutData';
import { soundFx } from '../../lib/soundFx';

interface CutPhotoPanelProps {
  brightness: number;
  setBrightness: (v: number) => void;
  contrast: number;
  setContrast: (v: number) => void;
  saturate: number;
  setSaturate: (v: number) => void;
  hueRotate: number;
  setHueRotate: (v: number) => void;
  blurVal: number;
  setBlurVal: (v: number) => void;
  sepiaVal: number;
  setSepiaVal: (v: number) => void;
  vignetteVal: number;
  setVignetteVal: (v: number) => void;
  filmGrainVal: number;
  setFilmGrainVal: (v: number) => void;
  kelvinTemp: number;
  setKelvinTemp: (v: number) => void;
  onResetAdjustments: () => void;
}

export const CutPhotoPanel: React.FC<CutPhotoPanelProps> = ({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturate,
  setSaturate,
  hueRotate,
  setHueRotate,
  blurVal,
  setBlurVal,
  sepiaVal,
  setSepiaVal,
  vignetteVal,
  setVignetteVal,
  filmGrainVal,
  setFilmGrainVal,
  kelvinTemp,
  setKelvinTemp,
  onResetAdjustments,
}) => {
  const [selectedPhotoTool, setSelectedPhotoTool] = useState<string>('photo-hsl-wheels');

  const colorChannels = [
    { name: 'Red', color: '#ef4444' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Yellow', color: '#eab308' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Cyan', color: '#06b6d4' },
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Magenta', color: '#ec4899' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Reset Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Pro Photo Color Grading & Optical Adjustments:
        </span>
        <button
          onClick={() => {
            soundFx.playClick();
            onResetAdjustments();
          }}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors"
        >
          Reset All Sliders
        </button>
      </div>

      {/* Primary Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-black/40 rounded-2xl border border-white/10">
        {/* Brightness */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness:</span>
            <span className="font-mono text-amber-400 font-bold">{brightness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5 text-blue-400" /> Contrast:</span>
            <span className="font-mono text-blue-400 font-bold">{contrast}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* Saturation */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-pink-400" /> Saturation:</span>
            <span className="font-mono text-pink-400 font-bold">{saturate}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={300}
            value={saturate}
            onChange={(e) => setSaturate(parseInt(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Hue Rotate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-purple-400" /> Hue Angle:</span>
            <span className="font-mono text-purple-400 font-bold">{hueRotate}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={hueRotate}
            onChange={(e) => setHueRotate(parseInt(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        {/* Kelvin White Balance */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-orange-400" /> Kelvin Temp:</span>
            <span className="font-mono text-orange-400 font-bold">{kelvinTemp}K</span>
          </div>
          <input
            type="range"
            min={2500}
            max={9000}
            step={100}
            value={kelvinTemp}
            onChange={(e) => {
              const k = parseInt(e.target.value);
              setKelvinTemp(k);
              if (k > 5500) {
                setHueRotate(Math.min(45, Math.floor((k - 5500) / 100)));
              } else {
                setSepiaVal(Math.min(60, Math.floor((5500 - k) / 60)));
              }
            }}
            className="w-full accent-orange-500"
          />
        </div>

        {/* Film Grain */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-emerald-400" /> Film Grain:</span>
            <span className="font-mono text-emerald-400 font-bold">{filmGrainVal}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={filmGrainVal}
            onChange={(e) => setFilmGrainVal(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        {/* Vignette */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-slate-400" /> Vignette Falloff:</span>
            <span className="font-mono text-slate-300 font-bold">{vignetteVal}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={vignetteVal}
            onChange={(e) => setVignetteVal(parseInt(e.target.value))}
            className="w-full accent-slate-400"
          />
        </div>

        {/* Blur Defocus */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Droplet className="w-3.5 h-3.5 text-cyan-400" /> Gaussian Blur:</span>
            <span className="font-mono text-cyan-400 font-bold">{blurVal}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={blurVal}
            onChange={(e) => setBlurVal(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

        {/* Vintage Sepia */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5 text-yellow-500" /> Vintage Sepia:</span>
            <span className="font-mono text-yellow-500 font-bold">{sepiaVal}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sepiaVal}
            onChange={(e) => setSepiaVal(parseInt(e.target.value))}
            className="w-full accent-yellow-500"
          />
        </div>
      </div>

      {/* 8-Way HSL Channel Selector */}
      <div className="flex flex-col gap-2.5 p-3.5 bg-black/40 rounded-2xl border border-white/10">
        <span className="text-xs font-bold text-slate-200">8-Way Selective Color Channels (HSL):</span>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {colorChannels.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                soundFx.playClick();
                setSaturate(160);
              }}
              className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/30 transition-all group"
            >
              <div className="w-6 h-6 rounded-full mb-1 shadow" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 20 Pro Photo Tools Grid */}
      <div>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 block">
          20+ Advanced Studio Photo Tools:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {PRO_PHOTO_TOOLS.map((pt) => {
            const isSelected = selectedPhotoTool === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => {
                  soundFx.playPop();
                  setSelectedPhotoTool(pt.id);
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-pink-500 shadow text-white'
                    : 'bg-slate-900/80 hover:bg-white/5 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold line-clamp-1">{pt.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 stroke-[3]" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{pt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
