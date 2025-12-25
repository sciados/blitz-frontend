// BatchProcessingModal - Updated (Background Remove moved to free client-side version)

"use client";

import { useState } from "react";
import {
  X,
  Upload,
  Loader2,
  Download,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

interface BatchProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: string[];
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
  const [selectedTool, setSelectedTool] = useState<string>("upscale");
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
    { value: "upscale", label: "Upscale (2x)", icon: "🔍", cost: "$0.10" },
    {
      value: "search-replace",
      label: "Search & Replace",
      icon: "🔄",
      cost: "$0.04",
    },
  ];

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (imageUrl: string) => {
    if (!imageUrl || imageUrl.startsWith('/api/')) return imageUrl;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) return imageUrl;
    return `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error("API base URL not configured");
      }

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

    for (const image of results.processed) {
      try {
        const response = await fetch(getProxiedImageUrl(image.edited_url));
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = image.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to download ${image.filename}:`, error);
      }
    }
  };

  const estimatedCost =
    selectedTool === "upscale"
      ? selectedImages.length * 0.1
      : selectedImages.length * 0.04;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Batch AI Processing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Process {selectedImages.length} image
              {selectedImages.length !== 1 ? "s" : ""} with AI
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

        <div className="flex-1 overflow-auto p-6">
          {!results ? (
            <>
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      💡 Looking for Background Removal?
                    </p>
                    <p className="text-sm text-gray-700">
                      We now have a <strong>FREE client-side</strong> batch
                      background removal tool! Use the "Batch Background Removal
                      (FREE)" option instead to save{" "}
                      <strong>
                        ${(selectedImages.length * 0.04).toFixed(2)}
                      </strong>{" "}
                      on these {selectedImages.length} images.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select AI Tool
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tools.map((tool) => (
                    <button
                      key={tool.value}
                      onClick={() => setSelectedTool(tool.value)}
                      disabled={isProcessing}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedTool === tool.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-500"
                      } disabled:opacity-50`}
                    >
                      <div className="text-3xl mb-2">{tool.icon}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {tool.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {tool.cost} per image
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {selectedTool === "upscale" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prompt *
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isProcessing}
                        placeholder="Describe what you want to enhance (e.g., 'professional product photo, high detail')"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Negative Prompt (Optional)
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        disabled={isProcessing}
                        placeholder="What to avoid (e.g., 'blurry, low quality')"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Creativity: {creativity}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={creativity}
                        onChange={(e) => setCreativity(Number(e.target.value))}
                        disabled={isProcessing}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>More faithful (0)</span>
                        <span>More creative (1)</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedTool === "search-replace" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Prompt *
                      </label>
                      <input
                        type="text"
                        value={searchPrompt}
                        onChange={(e) => setSearchPrompt(e.target.value)}
                        disabled={isProcessing}
                        placeholder="What to find (e.g., 'red car')"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                        placeholder="What to replace it with (e.g., 'blue car')"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Negative Prompt (Optional)
                      </label>
                      <input
                        type="text"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        disabled={isProcessing}
                        placeholder="What to avoid"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  💰 Estimated Cost
                </p>
                <p className="text-2xl font-bold text-yellow-700">
                  ${estimatedCost.toFixed(2)}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {selectedImages.length} images × $
                  {selectedTool === "upscale" ? "0.10" : "0.04"} per image
                </p>
              </div>

              {isProcessing && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">
                        Processing images with AI...
                      </p>
                      <p className="text-sm text-blue-700">
                        This may take several minutes
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
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-sm text-green-900">Successful</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {results.processed.length}
                  </p>
                </div>

                {results.failed.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="text-red-600" size={20} />
                      <span className="text-sm text-red-900">Failed</span>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                      {results.failed.length}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-900 mb-1">Cost</p>
                  <p className="text-3xl font-bold text-yellow-700">
                    ${estimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {results.processed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Processed Images ({results.processed.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-auto">
                    {results.processed.map((img, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={getProxiedImageUrl(img.edited_url)}
                          alt={`Processed ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-green-50">
                          <CheckCircle size={14} className="text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.failed.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-900 mb-3">
                    Failed Images ({results.failed.length})
                  </h3>
                  <div className="space-y-2">
                    {results.failed.map((img, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-50 rounded border border-red-200"
                      >
                        <p className="text-sm text-red-900 font-medium">
                          Image {idx + 1}
                        </p>
                        <p className="text-xs text-red-700 mt-1">{img.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          {!results ? (
            <>
              <p className="text-sm text-gray-500">
                {selectedImages.length} images selected
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
                      Process All (${estimatedCost.toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-green-600 font-medium">
                ✓ Processing complete!
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
