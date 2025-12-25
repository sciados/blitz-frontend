"use client";

import { useState } from "react";
import { X, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import removeBackground from "@imgly/background-removal";

interface BatchBackgroundRemovalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
}

interface ProcessedImage {
  originalUrl: string;
  dataUrl: string;
  filename: string;
  success: boolean;
  error?: string;
}

export function BatchBackgroundRemoval({
  isOpen,
  onClose,
  imageUrls,
}: BatchBackgroundRemovalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [results, setResults] = useState<ProcessedImage[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);

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

  const processImage = async (
    url: string,
    index: number
  ): Promise<ProcessedImage> => {
    try {
      setCurrentImage(index + 1);

      // Fetch image as blob via proxy to avoid CORS
      const response = await fetch(getProxiedImageUrl(url));
      const imageBlob = await response.blob();

      // Remove background using client-side AI
      const resultBlob = await removeBackground(imageBlob, {
        progress: (key, current, total) => {
          const percent = Math.round((current / total) * 100);

          // Track model loading
          if (key === "fetch:model" && current === total) {
            setModelLoaded(true);
          }

          // Update progress (overall progress + current image progress)
          const baseProgress = (index / imageUrls.length) * 100;
          const imageProgress = (percent / 100) * (100 / imageUrls.length);
          setProgress(Math.round(baseProgress + imageProgress));
        },
        model: "medium", // Options: 'small', 'medium', 'large'
        output: {
          format: "image/png",
          quality: 1.0,
        },
      });

      // Convert to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            originalUrl: url,
            dataUrl: reader.result as string,
            filename: `bg_removed_${index + 1}.png`,
            success: true,
          });
        };
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.readAsDataURL(resultBlob);
      });
    } catch (err) {
      console.error(`Failed to process image ${index + 1}:`, err);
      return {
        originalUrl: url,
        dataUrl: "",
        filename: `failed_${index + 1}.png`,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentImage(0);
    setResults([]);

    const processed: ProcessedImage[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const result = await processImage(imageUrls[i], i);
      processed.push(result);
      setResults([...processed]); // Update results incrementally
    }

    setIsProcessing(false);
    setProgress(100);
  };

  const handleDownloadAll = async () => {
    const successfulResults = results.filter((r) => r.success);

    for (const result of successfulResults) {
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

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🪄</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Batch Background Removal
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Remove backgrounds from {imageUrls.length} images • FREE &
                Client-Side AI
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
              {/* Info Section */}
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💰</span>
                      <span className="font-semibold text-green-900">
                        100% Free
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      No API costs - processes in your browser
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🔒</span>
                      <span className="font-semibold text-blue-900">
                        Private
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Images never leave your device
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⚡</span>
                      <span className="font-semibold text-purple-900">
                        Fast
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">
                      3-8 seconds per image
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">✨</span>
                      <span className="font-semibold text-orange-900">
                        Quality
                      </span>
                    </div>
                    <p className="text-sm text-orange-700">
                      Professional AI (RMBG v1.4)
                    </p>
                  </div>
                </div>

                {/* How it works */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    How it works:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">1.</span>
                      <span>
                        AI model downloads to your browser (first time only,
                        ~5MB)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">2.</span>
                      <span>Each image is processed locally using AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">3.</span>
                      <span>Background removed with professional quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">4.</span>
                      <span>Download all processed images at once</span>
                    </li>
                  </ul>
                </div>

                {/* Processing Status */}
                {isProcessing && (
                  <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-4 mb-4">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={32}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 text-lg">
                          Processing images...
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {!modelLoaded && progress < 20
                            ? "Loading AI model (~5MB)..."
                            : `Processing image ${currentImage} of ${imageUrls.length}`}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* First time notice */}
                    {!modelLoaded && progress < 20 && (
                      <p className="text-xs text-blue-600 mt-3">
                        💡 First time may take longer while the AI model
                        downloads. Subsequent uses will be much faster!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Results */
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-green-900">Successful</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {successCount}
                  </p>
                </div>

                {failureCount > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="text-red-600" size={20} />
                      <span className="text-sm text-red-900">Failed</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                      {failureCount}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600">💰</span>
                    <span className="text-sm text-blue-900">Saved</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    ${(imageUrls.length * 0.04).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Images Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Processed Images</span>
                  <span className="text-sm text-gray-500">
                    ({results.length})
                  </span>
                </h3>
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-auto">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg overflow-hidden ${
                        result.success ? "border-green-200" : "border-red-200"
                      }`}
                    >
                      {result.success ? (
                        <>
                          <img
                            src={result.dataUrl}
                            alt={`Processed ${idx + 1}`}
                            className="w-full h-32 object-contain bg-gray-50"
                          />
                          <div className="p-2 bg-green-50">
                            <div className="flex items-center gap-1">
                              <CheckCircle
                                size={14}
                                className="text-green-600"
                              />
                              <span className="text-xs font-medium text-green-700">
                                Success
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-red-50">
                          <div className="text-center p-2">
                            <XCircle
                              size={24}
                              className="text-red-500 mx-auto mb-1"
                            />
                            <p className="text-xs text-red-700">Failed</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Savings Notice */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <p className="font-semibold text-gray-900 mb-1">
                  💰 Cost Savings: ${(imageUrls.length * 0.04).toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  Processing these {imageUrls.length} images with AI APIs would
                  have cost ${(imageUrls.length * 0.04).toFixed(2)}. With
                  client-side processing, it's completely free!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          {results.length === 0 ? (
            <>
              <p className="text-sm text-gray-600">
                {imageUrls.length} image{imageUrls.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessAll}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>🪄 Remove Backgrounds (FREE)</>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-green-700">
                ✓ Processing complete! {successCount} successful, {failureCount}{" "}
                failed
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadAll}
                  disabled={successCount === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  <Download size={20} />
                  Download All ({successCount})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
