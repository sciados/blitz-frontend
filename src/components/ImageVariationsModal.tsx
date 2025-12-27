"use client";

import { useState } from "react";
import { LibraryImage, GeneratedImage } from "src/lib/types";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface ImageVariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: LibraryImage | null;
  onVariationCreated: (variations: GeneratedImage[]) => void;
}

export function ImageVariationsModal({
  isOpen,
  onClose,
  image,
  onVariationCreated,
}: ImageVariationsModalProps) {
  const [numVariations, setNumVariations] = useState(3);
  const [variationStrength, setVariationStrength] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<GeneratedImage[]>([]);

  if (!isOpen || !image) return null;

  const handleCreateVariations = async () => {
    setIsGenerating(true);
    setVariations([]);

    try {
      const { data } = await api.post(
        `/api/content/images/${image.id}/variations`,
        {
          base_image_id: image.id,
          num_variations: numVariations,
          variation_strength: variationStrength,
        }
      );

      setVariations(data);
      onVariationCreated(data);
      toast.success(`Created ${data.length} variations successfully!`);
    } catch (err: any) {
      console.error("Failed to create variations:", err);
      toast.error(err.response?.data?.detail || "Failed to create variations");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `variation-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Generate Image Variations
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Base Image Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Base Image
            </h3>
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden max-w-md">
              <img
                src={getProxiedImageUrl(image.image_url)}
                alt={image.prompt}
                className="w-full h-auto object-contain"
              />
            </div>
            {image.prompt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {image.prompt}
              </p>
            )}
          </div>

          {/* Variation Settings */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Variation Settings
            </h3>
            <div className="space-y-4">
              {/* Number of Variations */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Variations: {numVariations}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numVariations}
                  onChange={(e) => setNumVariations(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Variation Strength */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Variation Strength: {variationStrength.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={variationStrength}
                  onChange={(e) => setVariationStrength(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Subtle (0.1)</span>
                  <span>Dramatic (1.0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleCreateVariations}
            disabled={isGenerating}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-medium flex items-center justify-center space-x-2 mb-6"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Generating Variations...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Generate Variations</span>
              </>
            )}
          </button>

          {/* Generated Variations */}
          {variations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Generated Variations ({variations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                      <img
                        src={getProxiedImageUrl(variation.image_url)}
                        alt={variation.prompt || "Variation"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {variation.provider}
                        </span>
                        <button
                          onClick={() => handleDownload(variation.image_url)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
