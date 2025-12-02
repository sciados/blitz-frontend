"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage } from "src/lib/types";
import { UnifiedEditorModal } from "./UnifiedEditorModal";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  premiumImage: GeneratedImage;
  campaignId: number;
  onSavePremium: (image: GeneratedImage) => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  premiumImage,
  campaignId,
  onSavePremium,
}: ImagePreviewModalProps) {
  const [showEditor, setShowEditor] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blitz-${image.image_type}-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  const handleSavePremium = (image: GeneratedImage) => {
    onSavePremium(image);
    toast.success("Premium image saved to library!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Premium Image
              </h2>
            </div>
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

          {premiumImage && (
            <div className="space-y-6">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {/* Image with proper aspect ratio - constrained to fit on screen */}
                <div
                  className={`max-h-[60vh] max-w-full mx-auto ${
                    premiumImage.aspect_ratio === "1:1"
                      ? "aspect-square"
                      : premiumImage.aspect_ratio === "16:9"
                      ? "aspect-video"
                      : premiumImage.aspect_ratio === "9:16"
                      ? "aspect-[9/16]"
                      : premiumImage.aspect_ratio === "4:3"
                      ? "aspect-[4/3]"
                      : premiumImage.aspect_ratio === "21:9"
                      ? "aspect-[21/9]"
                      : "aspect-square"
                  } flex items-center justify-center`}
                >
                  <img
                    src={premiumImage.image_url}
                    alt={premiumImage.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  PREMIUM
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p className="font-medium">
                    Cost: ${(premiumImage.ai_generation_cost || 0).toFixed(4)} |
                    Provider: {premiumImage.provider}
                  </p>
                  <p className="text-xs mt-1">
                    Premium images include 8K quality enhancement and are saved
                    to your library
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownload(premiumImage)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center space-x-2"
                    style={{ color: "var(--text-primary)" }}
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

                  <button
                    onClick={() => {
                      // Check if image has layers/overlays
                      const hasLayers = premiumImage.metadata?.has_layers || false;

                      if (hasLayers) {
                        // Delete layered copies
                        if (confirm("Delete all layers from this image?")) {
                          // TODO: Call API to remove layers
                          toast.success("Layers deleted!");
                        }
                      } else {
                        // Protect original seed
                        if (confirm("Protect this original seed image? It cannot be modified.")) {
                          // TODO: Call API to protect the seed
                          toast.success("Seed image protected!");
                        }
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition font-medium flex items-center space-x-2 ${
                      (premiumImage.metadata?.has_layers || false)
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {(premiumImage.metadata?.has_layers || false) ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete Layers</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Protect Seed</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowEditor(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Image</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center space-x-2"
                    style={{ color: "var(--text-primary)" }}
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unified Editor Modal */}
      <UnifiedEditorModal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        sourceImage={premiumImage}
        campaignId={campaignId}
        onSave={(image) => {
          toast.success("Image saved to library!");
          setShowEditor(false);
          onSavePremium(image);
        }}
      />
    </div>
  );
}
