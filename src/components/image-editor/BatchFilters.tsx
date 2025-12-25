"use client";

import { useState, useRef } from "react";
import { X, Download, Loader2, CheckCircle } from "lucide-react";

interface BatchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
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

interface ProcessedImage {
  originalUrl: string;
  dataUrl: string;
  filename: string;
}

export function BatchFilters({ isOpen, onClose, imageUrls }: BatchFiltersProps) {
  const [selectedPreset, setSelectedPreset] = useState<FilterPreset>(filterPresets[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('/api/') || imageUrl.includes('/api/images/proxy')) return imageUrl;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let finalApiUrl = apiBaseUrl;

    if (!finalApiUrl && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'blitz.ws') {
        finalApiUrl = 'https://api.blitz.ws';
      } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
        finalApiUrl = 'http://localhost:8000';
      }
    }

    if (!finalApiUrl) {
      console.warn('NEXT_PUBLIC_API_BASE_URL not configured, using direct URL');
      return imageUrl;
    }

    return `${finalApiUrl}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  };

  const applyFiltersToImage = async (
    imageUrl: string,
    filterSettings: FilterSettings,
    index: number
  ): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw original image
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
            const contrastFactor =
              (259 * (filterSettings.contrast + 255)) /
              (255 * (259 - filterSettings.contrast));
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
            const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
            const saturationFactor = 1 + filterSettings.saturation / 100;
            r = gray + (r - gray) * saturationFactor;
            g = gray + (g - gray) * saturationFactor;
            b = gray + (b - gray) * saturationFactor;
          }

          // Temperature
          if (filterSettings.temperature !== 0) {
            const tempFactor = filterSettings.temperature / 100;
            r += tempFactor * 50;
            b -= tempFactor * 50;
          }

          // Tint
          if (filterSettings.tint !== 0) {
            const tintFactor = filterSettings.tint / 100;
            g += tintFactor * 50;
          }

          // Highlights
          if (filterSettings.highlights !== 0) {
            const luminance = 0.2989 * r + 0.587 * g + 0.114 * b;
            if (luminance > 128) {
              const highlightFactor = filterSettings.highlights / 100;
              r += highlightFactor * 50;
              g += highlightFactor * 50;
              b += highlightFactor * 50;
            }
          }

          // Shadows
          if (filterSettings.shadows !== 0) {
            const luminance = 0.2989 * r + 0.587 * g + 0.114 * b;
            if (luminance < 128) {
              const shadowFactor = filterSettings.shadows / 100;
              r += shadowFactor * 50;
              g += shadowFactor * 50;
              b += shadowFactor * 50;
            }
          }

          // Clamp values
          data[i] = Math.max(0, Math.min(255, r));
          data[i + 1] = Math.max(0, Math.min(255, g));
          data[i + 2] = Math.max(0, Math.min(255, b));
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Apply vignette
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

        const dataUrl = canvas.toDataURL("image/png");

        resolve({
          originalUrl: imageUrl,
          dataUrl,
          filename: `filtered_${index + 1}.png`,
        });
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = getProxiedImageUrl(imageUrl);
    });
  };

  const handleApplyFilter = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const filterSettings = { ...defaultSettings, ...selectedPreset.settings };
    const processed: ProcessedImage[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const result = await applyFiltersToImage(imageUrls[i], filterSettings, i);
        processed.push(result);
        setProgress(Math.round(((i + 1) / imageUrls.length) * 100));
      } catch (err) {
        console.error(`Failed to process image ${i + 1}:`, err);
      }
    }

    setResults(processed);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    for (const result of results) {
      const a = document.createElement("a");
      a.href = result.dataUrl;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Batch Apply Filter
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Apply {selectedPreset.name} to {imageUrls.length} images
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {results.length === 0 ? (
            <>
              {/* Filter Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Choose Filter
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filterPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedPreset(preset)}
                      disabled={isProcessing}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedPreset.name === preset.name
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } disabled:opacity-50`}
                    >
                      <div className="text-3xl mb-2">{preset.icon}</div>
                      <div className="font-medium text-sm text-gray-900">
                        {preset.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Selected Filter: {selectedPreset.name}
                </h4>
                <p className="text-sm text-gray-600">{selectedPreset.description}</p>
              </div>

              {/* Processing */}
              {isProcessing && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">
                        Applying {selectedPreset.name} filter...
                      </p>
                      <p className="text-sm text-blue-700">
                        Processing image {Math.round((progress / 100) * imageUrls.length)}/
                        {imageUrls.length}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-900">
                      Filter Applied Successfully!
                    </p>
                    <p className="text-sm text-green-700">
                      {results.length} images processed with {selectedPreset.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Filtered Images
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-auto">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={result.dataUrl}
                        alt={`Filtered ${idx + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate">
                          {selectedPreset.icon} {selectedPreset.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {results.length === 0 ? (
            <>
              <p className="text-sm text-gray-500">
                {imageUrls.length} images ready to process
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilter}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>Apply {selectedPreset.name}</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-green-600 font-medium">
                ✓ All images filtered!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  <Download size={20} />
                  Download All ({results.length})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
