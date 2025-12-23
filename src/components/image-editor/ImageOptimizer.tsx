"use client";

import { useState } from "react";
import { X, Download, Loader2, FileImage, Zap } from "lucide-react";

interface ImageOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  dataUrl: string;
  format: string;
}

export function ImageOptimizer({
  isOpen,
  onClose,
  imageUrl,
  imageName = "image",
}: ImageOptimizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  
  // Optimization settings
  const [targetFormat, setTargetFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState(85);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleOptimize = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Calculate original size (approximate from data URL)
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const originalSize = blob.size;

      // Calculate dimensions
      let width = img.width;
      let height = img.height;

      if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Create canvas and draw image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Draw with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to target format
      const mimeType = `image/${targetFormat}`;
      const qualityValue = quality / 100;

      // Get optimized data URL
      const dataUrl = canvas.toDataURL(mimeType, qualityValue);

      // Calculate optimized size
      const base64Length = dataUrl.split(",")[1].length;
      const optimizedSize = Math.round((base64Length * 3) / 4);

      // Calculate savings
      const savings = originalSize - optimizedSize;
      const savingsPercent = Math.round((savings / originalSize) * 100);

      setResult({
        originalSize,
        optimizedSize,
        savings,
        savingsPercent,
        dataUrl,
        format: targetFormat,
      });
    } catch (err) {
      console.error("Optimization error:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = `${imageName.replace(/\.[^/.]+$/, "")}_optimized.${result.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const presetOptions = [
    {
      name: "Web Standard",
      format: "jpeg" as const,
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      description: "Best for websites - good quality, small size",
    },
    {
      name: "High Quality",
      format: "jpeg" as const,
      quality: 95,
      maxWidth: null,
      maxHeight: null,
      description: "Minimal compression - best quality",
    },
    {
      name: "Maximum Compression",
      format: "jpeg" as const,
      quality: 70,
      maxWidth: 1280,
      maxHeight: 720,
      description: "Smallest file size - good for mobile",
    },
    {
      name: "Modern WebP",
      format: "webp" as const,
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      description: "Best compression with quality",
    },
  ];

  const applyPreset = (preset: typeof presetOptions[0]) => {
    setTargetFormat(preset.format);
    setQuality(preset.quality);
    setMaxWidth(preset.maxWidth);
    setMaxHeight(preset.maxHeight);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Image Optimizer</h2>
              <p className="text-sm text-gray-600 mt-1">
                Reduce file size without losing quality • FREE & Instant
              </p>
            </div>
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
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Optimization Settings
              </h3>

              {/* Presets */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetOptions.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      disabled={isProcessing}
                      className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all disabled:opacity-50"
                    >
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

              {/* Format */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["jpeg", "png", "webp"] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setTargetFormat(format)}
                      disabled={isProcessing}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        targetFormat === format
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {targetFormat === "jpeg" && "Best for photos - no transparency"}
                  {targetFormat === "png" && "Supports transparency - larger files"}
                  {targetFormat === "webp" && "Modern format - best compression"}
                </p>
              </div>

              {/* Quality */}
              {(targetFormat === "jpeg" || targetFormat === "webp") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={isProcessing}
                    min="50"
                    max="100"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>
              )}

              {/* Dimensions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Dimensions (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      value={maxWidth || ""}
                      onChange={(e) =>
                        setMaxWidth(e.target.value ? Number(e.target.value) : null)
                      }
                      disabled={isProcessing}
                      placeholder="Max Width (px)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={maxHeight || ""}
                      onChange={(e) =>
                        setMaxHeight(e.target.value ? Number(e.target.value) : null)
                      }
                      disabled={isProcessing}
                      placeholder="Max Height (px)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave blank to keep original dimensions
                </p>
              </div>

              {/* Optimize Button */}
              <button
                onClick={handleOptimize}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Optimize Image
                  </>
                )}
              </button>
            </div>

            {/* Right Column - Preview & Results */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview & Results
              </h3>

              {/* Original Image */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Original</p>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                </div>
              </div>

              {/* Results */}
              {result && (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Optimized
                    </p>
                    <div className="border-2 border-green-500 rounded-lg overflow-hidden">
                      <img
                        src={result.dataUrl}
                        alt="Optimized"
                        className="w-full h-48 object-contain bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Original Size:</span>
                      <span className="font-semibold text-gray-900">
                        {formatBytes(result.originalSize)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Optimized Size:</span>
                      <span className="font-semibold text-green-700">
                        {formatBytes(result.optimizedSize)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Savings:
                        </span>
                        <span className="font-bold text-green-700 text-lg">
                          {formatBytes(result.savings)} ({result.savingsPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Optimized Image
                  </button>
                </>
              )}

              {!result && !isProcessing && (
                <div className="p-8 text-center text-gray-500">
                  <FileImage size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">
                    Adjust settings and click "Optimize Image" to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">✓ FREE</span> - No API costs
            • Instant processing
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
