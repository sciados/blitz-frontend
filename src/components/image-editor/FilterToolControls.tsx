"use client";

import { useState, useEffect } from "react";

interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  exposure: number;
  highlights: number;
  shadows: number;
  vignette: number;
}

const defaultSettings: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
};

interface FilterPreset {
  name: string;
  icon: string;
  settings: Partial<FilterSettings>;
  description: string;
}

const filterPresets: FilterPreset[] = [
  {
    name: "Original",
    icon: "🔲",
    settings: {},
    description: "No filter",
  },
  {
    name: "Vibrant",
    icon: "🌈",
    settings: { saturation: 30, contrast: 10, brightness: 5 },
    description: "Boost colors",
  },
  {
    name: "B&W Classic",
    icon: "⬛",
    settings: { saturation: -100, contrast: 20 },
    description: "Black & white",
  },
  {
    name: "Vintage",
    icon: "📷",
    settings: { temperature: 20, saturation: -20, contrast: -10, vignette: 30 },
    description: "Film look",
  },
  {
    name: "Cool Tone",
    icon: "❄️",
    settings: { temperature: -30, tint: 10, saturation: 10 },
    description: "Blue aesthetic",
  },
  {
    name: "Warm Tone",
    icon: "🔥",
    settings: { temperature: 30, brightness: 5, saturation: 15 },
    description: "Golden feel",
  },
  {
    name: "High Contrast",
    icon: "⚡",
    settings: { contrast: 40, brightness: 5, saturation: 20 },
    description: "Bold",
  },
  {
    name: "Soft Dream",
    icon: "☁️",
    settings: { brightness: 15, contrast: -15, saturation: -10, highlights: 20 },
    description: "Ethereal",
  },
  {
    name: "Faded",
    icon: "🌫️",
    settings: { contrast: -20, saturation: -30, brightness: 10 },
    description: "Washed out",
  },
  {
    name: "Dramatic",
    icon: "🎭",
    settings: { contrast: 35, shadows: -30, highlights: 30, saturation: 15 },
    description: "Intense",
  },
  {
    name: "Bright & Airy",
    icon: "✨",
    settings: { brightness: 20, exposure: 15, contrast: -10, highlights: 25 },
    description: "Light & fresh",
  },
  {
    name: "Moody",
    icon: "🌙",
    settings: { brightness: -15, contrast: 25, saturation: -10, shadows: -20 },
    description: "Dark & moody",
  },
];

interface FilterToolControlsProps {
  isProcessing: boolean;
  onApplyFilter: (settings: FilterSettings) => void;
}

export function FilterToolControls({ isProcessing, onApplyFilter }: FilterToolControlsProps) {
  const [settings, setSettings] = useState<FilterSettings>(defaultSettings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Apply filter to canvas when settings change
  useEffect(() => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.applyFilter) {
      console.log("FilterToolControls: Applying filter settings:", settings);
      canvasAPI.applyFilter(settings);
    } else {
      console.warn("FilterToolControls: Canvas API not available or applyFilter method missing");
    }
  }, [settings]);

  const applyPreset = (preset: FilterPreset) => {
    const newSettings = { ...defaultSettings, ...preset.settings };
    setSettings(newSettings);
  };

  const resetFilters = () => {
    setSettings(defaultSettings);
  };

  const handleSliderChange = (key: keyof FilterSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleApply = () => {
    onApplyFilter(settings);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Presets</h3>

        {/* Preset Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {filterPresets.map((preset) => {
            // Check if current settings match this preset
            const isSelected = JSON.stringify({ ...defaultSettings, ...preset.settings }) === JSON.stringify(settings);

            return (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                disabled={isProcessing}
                className={`p-2 border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-500"
                }`}
                title={preset.description}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className={`text-xs font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Controls Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <span className="text-sm font-medium text-gray-700">Advanced Controls</span>
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Sliders */}
      {showAdvanced && (
        <div className="space-y-3 pt-2">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Brightness</span>
              <span className="text-gray-600">{settings.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.brightness}
              onChange={(e) => handleSliderChange("brightness", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Contrast</span>
              <span className="text-gray-600">{settings.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.contrast}
              onChange={(e) => handleSliderChange("contrast", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Saturation</span>
              <span className="text-gray-600">{settings.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.saturation}
              onChange={(e) => handleSliderChange("saturation", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Exposure */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Exposure</span>
              <span className="text-gray-600">{settings.exposure}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.exposure}
              onChange={(e) => handleSliderChange("exposure", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Temperature */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Temperature</span>
              <span className="text-gray-600">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.temperature}
              onChange={(e) => handleSliderChange("temperature", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Tint */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Tint</span>
              <span className="text-gray-600">{settings.tint}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.tint}
              onChange={(e) => handleSliderChange("tint", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Highlights */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Highlights</span>
              <span className="text-gray-600">{settings.highlights}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.highlights}
              onChange={(e) => handleSliderChange("highlights", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Shadows */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Shadows</span>
              <span className="text-gray-600">{settings.shadows}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={settings.shadows}
              onChange={(e) => handleSliderChange("shadows", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Vignette */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-700">Vignette</span>
              <span className="text-gray-600">{settings.vignette}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.vignette}
              onChange={(e) => handleSliderChange("vignette", Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={resetFilters}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isProcessing ? "Applying..." : "Apply Filter"}
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="space-y-1">
          <li>• Click presets for instant looks</li>
          <li>• Use Advanced for fine control</li>
          <li>• Preview updates in real-time</li>
          <li>• Click Apply to save changes</li>
        </ul>
      </div>
    </div>
  );
}
