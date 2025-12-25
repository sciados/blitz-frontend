"use client";

import { useState } from "react";
import { X, Download, Loader2, Zap, CheckCircle } from "lucide-react";

interface BatchImageOptimizerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
}

interface OptimizedImage {
  originalUrl: string;
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
  filename: string;
}

export function BatchImageOptimizer({
  isOpen,
  onClose,
  imageUrls,
}: BatchImageOptimizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OptimizedImage[]>([]);

  // Settings
  const [targetFormat, setTargetFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [quality, setQuality] = useState(85);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const optimizeImage = async (url: string, index: number): Promise<OptimizedImage> => {
    return new Promise(async (resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async () => {
          // Get original size via proxy to avoid CORS
          const response = await fetch(getProxiedImageUrl(url));
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

          // Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to target format
          const mimeType = `image/${targetFormat}`;
          const qualityValue = quality / 100;
          const dataUrl = canvas.toDataURL(mimeType, qualityValue);

          // Calculate size
          const base64Length = dataUrl.split(",")[1].length;
          const optimizedSize = Math.round((base64Length * 3) / 4);
          const savings = originalSize - optimizedSize;
          const savingsPercent = Math.round((savings / originalSize) * 100);

          resolve({
            originalUrl: url,
            dataUrl,
            originalSize,
            optimizedSize,
            savings,
            savingsPercent,
            filename: `optimized_${index + 1}.${targetFormat}`,
          });
        };

        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = getProxiedImageUrl(url);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleOptimizeAll = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const optimized: OptimizedImage[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const result = await optimizeImage(imageUrls[i], i);
        optimized.push(result);
        setProgress(Math.round(((i + 1) / imageUrls.length) * 100));
      } catch (err) {
        console.error(`Failed to optimize image ${i + 1}:`, err);
      }
    }

    setResults(optimized);
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

  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0);
  const avgSavingsPercent = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.savingsPercent, 0) / results.length)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Batch Image Optimizer
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Optimize {imageUrls.length} images at once • FREE & Instant
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
          {results.length === 0 ? (
            <>
              {/* Settings */}
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["jpeg", "png", "webp"] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setTargetFormat(format)}
                        disabled={isProcessing}
                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                          targetFormat === format
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {(targetFormat === "jpeg" || targetFormat === "webp") && (
                  <div>
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
                      <span>Smaller file (50%)</span>
                      <span>Best quality (100%)</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Dimensions
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(Number(e.target.value))}
                      disabled={isProcessing}
                      placeholder="Max Width"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(Number(e.target.value))}
                      disabled={isProcessing}
                      placeholder="Max Height"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Standard web: 1920×1080 • Mobile: 1280×720
                  </p>
                </div>

                {isProcessing && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">
                          Optimizing images...
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
              </div>
            </>
          ) : (
            /* Results */
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900 mb-1">Images Optimized</p>
                  <p className="text-2xl font-bold text-green-700">{results.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 mb-1">Total Savings</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatBytes(totalSavings)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900 mb-1">Avg Reduction</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {avgSavingsPercent}%
                  </p>
                </div>
              </div>

              {/* Images Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Optimized Images
                </h3>
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-auto">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={result.dataUrl}
                        alt={`Optimized ${idx + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-2 bg-gray-50">
                        <div className="flex items-center gap-1 mb-1">
                          <CheckCircle size={12} className="text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            {result.savingsPercent}% smaller
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatBytes(result.optimizedSize)}
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
                {imageUrls.length} images selected
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
                  onClick={handleOptimizeAll}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Optimize All
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-green-600 font-medium">
                ✓ Optimization complete!
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
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
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
