"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, RotateCcw, Sliders } from "lucide-react";

interface ImageFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

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
    description: "No filter applied",
  },
  {
    name: "Vibrant",
    icon: "🌈",
    settings: { saturation: 30, contrast: 10, brightness: 5 },
    description: "Boost colors and energy",
  },
  {
    name: "B&W Classic",
    icon: "⬛",
    settings: { saturation: -100, contrast: 20 },
    description: "Timeless black and white",
  },
  {
    name: "Vintage",
    icon: "📷",
    settings: { temperature: 20, saturation: -20, contrast: -10, vignette: 30 },
    description: "Nostalgic film look",
  },
  {
    name: "Cool Tone",
    icon: "❄️",
    settings: { temperature: -30, tint: 10, saturation: 10 },
    description: "Blue, crisp aesthetic",
  },
  {
    name: "Warm Tone",
    icon: "🔥",
    settings: { temperature: 30, brightness: 5, saturation: 15 },
    description: "Golden, cozy feel",
  },
  {
    name: "High Contrast",
    icon: "⚡",
    settings: { contrast: 40, brightness: 5, saturation: 20 },
    description: "Bold and dramatic",
  },
  {
    name: "Soft Dream",
    icon: "☁️",
    settings: { brightness: 15, contrast: -15, saturation: -10, highlights: 20 },
    description: "Gentle and ethereal",
  },
  {
    name: "Faded",
    icon: "🌫️",
    settings: { contrast: -20, saturation: -30, brightness: 10 },
    description: "Washed out retro",
  },
  {
    name: "Dramatic",
    icon: "🎭",
    settings: { contrast: 50, shadows: -30, highlights: 30, vignette: 40 },
    description: "Cinematic intensity",
  },
  {
    name: "Bright & Airy",
    icon: "☀️",
    settings: { brightness: 20, exposure: 15, highlights: 20, contrast: -5 },
    description: "Light and fresh",
  },
  {
    name: "Moody",
    icon: "🌙",
    settings: { brightness: -15, contrast: 30, saturation: -10, shadows: 30 },
    description: "Dark and mysterious",
  },
];

export function ImageFilters({
  isOpen,
  onClose,
  imageUrl,
  imageName = "image",
}: ImageFiltersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<FilterSettings>(defaultSettings);
  const [selectedPreset, setSelectedPreset] = useState<string>("Original");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load original image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setOriginalImage(img);
      applyFilters(img, defaultSettings);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Apply filters to canvas
  const applyFilters = (img: HTMLImageElement, filterSettings: FilterSettings) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.filter = "none";
    ctx.drawImage(img, 0, 0);

    // Get image data for pixel manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply filters pixel by pixel
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (filterSettings.brightness !== 0) {
        const brightnessFactor = filterSettings.brightness * 2.55;
        r += brightnessFactor;
        g += brightnessFactor;
        b += brightnessFactor;
      }

      // Contrast
      if (filterSettings.contrast !== 0) {
        const contrastFactor = (259 * (filterSettings.contrast + 255)) / (255 * (259 - filterSettings.contrast));
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
      }

      // Exposure
      if (filterSettings.exposure !== 0) {
        const exposureFactor = Math.pow(2, filterSettings.exposure / 100);
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;
      }

      // Saturation
      if (filterSettings.saturation !== 0) {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        const saturationFactor = 1 + filterSettings.saturation / 100;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;
      }

      // Temperature (warm/cool)
      if (filterSettings.temperature !== 0) {
        const tempFactor = filterSettings.temperature / 100;
        r += tempFactor * 50;
        b -= tempFactor * 50;
      }

      // Tint (green/magenta)
      if (filterSettings.tint !== 0) {
        const tintFactor = filterSettings.tint / 100;
        g += tintFactor * 50;
      }

      // Highlights
      if (filterSettings.highlights !== 0) {
        const luminance = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        if (luminance > 128) {
          const highlightFactor = filterSettings.highlights / 100;
          r += highlightFactor * 50;
          g += highlightFactor * 50;
          b += highlightFactor * 50;
        }
      }

      // Shadows
      if (filterSettings.shadows !== 0) {
        const luminance = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        if (luminance < 128) {
          const shadowFactor = filterSettings.shadows / 100;
          r += shadowFactor * 50;
          g += shadowFactor * 50;
          b += shadowFactor * 50;
        }
      }

      // Clamp values to 0-255
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Apply vignette if needed
    if (filterSettings.vignette > 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.sqrt(centerX * centerX + centerY * centerY);
      const vignetteStrength = filterSettings.vignette / 100;

      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.3,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
      gradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteStrength})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Update filters when settings change
  useEffect(() => {
    if (originalImage) {
      applyFilters(originalImage, settings);
    }
  }, [settings, originalImage]);

  const handlePresetClick = (preset: FilterPreset) => {
    setSelectedPreset(preset.name);
    const newSettings = { ...defaultSettings, ...preset.settings };
    setSettings(newSettings);
  };

  const handleSettingChange = (key: keyof FilterSettings, value: number) => {
    setSelectedPreset("Custom");
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSelectedPreset("Original");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${imageName}_filtered.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Filters & Color</h2>
            <p className="text-sm text-gray-600 mt-1">
              Apply preset filters or fine-tune with manual controls
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Preset Filters</h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Sliders size={16} />
                  {showAdvanced ? "Hide" : "Show"} Advanced
                </button>
              </div>

              {/* Preset Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {filterPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedPreset === preset.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{preset.icon}</div>
                    <div className="font-medium text-sm text-gray-900">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Advanced Controls */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg max-h-[500px] overflow-y-auto">
                  <h4 className="font-semibold text-sm text-gray-900">
                    Manual Adjustments
                  </h4>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Brightness</span>
                      <span className="text-gray-600">{settings.brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.brightness}
                      onChange={(e) =>
                        handleSettingChange("brightness", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Contrast</span>
                      <span className="text-gray-600">{settings.contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.contrast}
                      onChange={(e) =>
                        handleSettingChange("contrast", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Saturation</span>
                      <span className="text-gray-600">{settings.saturation}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.saturation}
                      onChange={(e) =>
                        handleSettingChange("saturation", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Exposure */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Exposure</span>
                      <span className="text-gray-600">{settings.exposure}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.exposure}
                      onChange={(e) =>
                        handleSettingChange("exposure", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Temperature</span>
                      <span className="text-gray-600">{settings.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.temperature}
                      onChange={(e) =>
                        handleSettingChange("temperature", Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Cool</span>
                      <span>Warm</span>
                    </div>
                  </div>

                  {/* Tint */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Tint</span>
                      <span className="text-gray-600">{settings.tint}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.tint}
                      onChange={(e) =>
                        handleSettingChange("tint", Number(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Green</span>
                      <span>Magenta</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Highlights</span>
                      <span className="text-gray-600">{settings.highlights}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.highlights}
                      onChange={(e) =>
                        handleSettingChange("highlights", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Shadows */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Shadows</span>
                      <span className="text-gray-600">{settings.shadows}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.shadows}
                      onChange={(e) =>
                        handleSettingChange("shadows", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Vignette */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Vignette</span>
                      <span className="text-gray-600">{settings.vignette}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.vignette}
                      onChange={(e) =>
                        handleSettingChange("vignette", Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>

              {selectedPreset !== "Original" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Active Filter:</span> {selectedPreset}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
            >
              <Download size={20} />
              Download Filtered Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
