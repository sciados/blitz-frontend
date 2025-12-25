// BatchProcessingModal

"use client";

import { useState } from "react";
import {
  X,
  Upload,
  Loader2,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: string[]; // Array of image URLs
  campaignId: number;
}

interface ProcessedImage {
  original_url: string;
  edited_url: string;
  edited_path: string;
  filename: string;
}

interface FailedImage {
  original_url: string;
  error: string;
}

export function BatchProcessingModal({
  isOpen,
  onClose,
  selectedImages,
  campaignId,
}: BatchProcessingModalProps) {
  const [selectedTool, setSelectedTool] = useState<string>("background-remove");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    processed: ProcessedImage[];
    failed: FailedImage[];
  } | null>(null);

  // Tool-specific parameters
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [searchPrompt, setSearchPrompt] = useState("");
  const [creativity, setCreativity] = useState(0.35);

  const tools = [
    { value: "background-remove", label: "Remove Background", icon: "🎭" },
    { value: "upscale", label: "Upscale (2x)", icon: "🔍" },
    { value: "search-replace", label: "Search & Replace", icon: "🔄" },
  ];

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      // Build operation params based on selected tool
      const operationParams: any = {
        output_format: "png",
      };

      if (selectedTool === "upscale") {
        if (!prompt) {
          alert("Please enter a prompt for upscaling");
          setIsProcessing(false);
          return;
        }
        operationParams.prompt = prompt;
        operationParams.negative_prompt = negativePrompt;
        operationParams.creativity = creativity;
        operationParams.seed = 0;
      }

      if (selectedTool === "search-replace") {
        if (!searchPrompt || !prompt) {
          alert("Please enter both search and replace prompts");
          setIsProcessing(false);
          return;
        }
        operationParams.search_prompt = searchPrompt;
        operationParams.prompt = prompt;
        operationParams.negative_prompt = negativePrompt;
        operationParams.seed = 0;
      }

      const formData = new FormData();
      formData.append("campaign_id", campaignId.toString());
      formData.append("operation_type", selectedTool);
      formData.append("operation_params", JSON.stringify(operationParams));
      formData.append("image_urls", JSON.stringify(selectedImages));

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/image-editor/batch-process`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setResults({
          processed: result.processed_images || [],
          failed: result.failed_images || [],
        });
      } else {
        throw new Error("Batch processing failed");
      }
    } catch (err) {
      console.error("Batch processing error:", err);
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleDownloadAll = async () => {
    if (!results || results.processed.length === 0) return;

    // Download each image individually
    for (const image of results.processed) {
      try {
        const response = await fetch(image.edited_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = image.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to download ${image.filename}:`, error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Batch Processing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Process {selectedImages.length} image
              {selectedImages.length !== 1 ? "s" : ""} at once
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
          {!results ? (
            <>
              {/* Tool Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Tool
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.value}
                      onClick={() => setSelectedTool(tool.value)}
                      disabled={isProcessing}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedTool === tool.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      } disabled:opacity-50`}
                    >
                      <div className="text-3xl mb-2">{tool.icon}</div>
                      <div className="text-sm font-medium">{tool.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool-Specific Parameters */}
              {selectedTool === "upscale" && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt *
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isProcessing}
                      placeholder="Describe the image to enhance upscaling quality..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Prompt
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      disabled={isProcessing}
                      placeholder="What to avoid..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creativity: {creativity.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      value={creativity}
                      onChange={(e) => setCreativity(Number(e.target.value))}
                      disabled={isProcessing}
                      min="0"
                      max="0.35"
                      step="0.05"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTool === "search-replace" && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search For *
                    </label>
                    <input
                      type="text"
                      value={searchPrompt}
                      onChange={(e) => setSearchPrompt(e.target.value)}
                      disabled={isProcessing}
                      placeholder="e.g., 'the car'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replace With *
                    </label>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={isProcessing}
                      placeholder="e.g., 'a bicycle'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Negative Prompt
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      disabled={isProcessing}
                      placeholder="What to avoid..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">
                        Processing images...
                      </p>
                      <p className="text-sm text-blue-700">
                        This may take several minutes depending on the number of
                        images
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-900">
                      Successful
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {results.processed.length}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="text-red-600" size={20} />
                    <span className="font-semibold text-red-900">Failed</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {results.failed.length}
                  </p>
                </div>
              </div>

              {/* Processed Images */}
              {results.processed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Processed Images
                  </h3>
                  <div className="grid grid-cols-3 gap-3 max-h-96 overflow-auto">
                    {results.processed.map((image, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.edited_url}
                          alt={`Processed ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-gray-50">
                          <p className="text-xs text-gray-600 truncate">
                            {image.filename}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Images */}
              {results.failed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-900 mb-3">
                    Failed Images
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {results.failed.map((image, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 rounded border border-red-200"
                      >
                        <p className="text-sm text-red-900 font-medium truncate">
                          {image.original_url}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          {image.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {!results ? (
            <>
              <p className="text-sm text-gray-500">
                {selectedImages.length} image
                {selectedImages.length !== 1 ? "s" : ""} selected
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
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Process All
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-green-600 font-medium">
                ✓ Batch processing complete!
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
                  disabled={results.processed.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download All ({results.processed.length})
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
