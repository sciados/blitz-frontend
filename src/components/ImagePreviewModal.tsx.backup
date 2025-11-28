"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage } from "src/lib/types";
import { TextEditorModal } from "./TextEditorModal";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftImage: GeneratedImage | null;
  campaignId: number;
  imageSettings: {
    imageType: string;
    style: string;
    aspectRatio: string;
    customPrompt: string;
  };
  onSavePremium: (image: GeneratedImage) => void;
  onRegenerate?: () => void;
  currentIndex: number;
  totalDrafts: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  draftImage,
  campaignId,
  imageSettings,
  onSavePremium,
  onRegenerate,
  currentIndex,
  totalDrafts,
  onPrevious,
  onNext,
}: ImagePreviewModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [premiumImage, setPremiumImage] = useState<GeneratedImage | null>(null);
  const [showTextEditor, setShowTextEditor] = useState(false);

  // Reset premium image when draft image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPremiumImage(null);
    }
  }, [draftImage?.image_url, isOpen]);

  if (!isOpen) return null;

  const handleUpgradeToPremium = async () => {
    if (!draftImage?.image_url) {
      toast.error("No draft image to upgrade");
      return;
    }

    setIsUpgrading(true);
    setPremiumImage(null);

    try {
      const payload = {
        campaign_id: campaignId,
        draft_image_url: draftImage.image_url,
        custom_prompt: imageSettings.customPrompt || undefined,
        style: imageSettings.style,
        aspect_ratio: imageSettings.aspectRatio,
        quality_boost: true,
      };

      // Call /upgrade endpoint to enhance the draft image
      const { data } = await api.post("/api/content/images/upgrade", payload);
      setPremiumImage(data);
      toast.success(`Premium image enhanced using ${data.provider}!`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to enhance premium image"
      );
    } finally {
      setIsUpgrading(false);
    }
  };

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

  const handleSaveDraft = async (image: GeneratedImage) => {
    try {
      const { data } = await api.post("/api/content/images/save-draft", {
        campaign_id: campaignId,
        image_url: image.image_url,
        image_type: image.image_type,
        style: imageSettings.style,
        aspect_ratio: imageSettings.aspectRatio,
        custom_prompt: imageSettings.customPrompt,
        provider: image.provider,
        model: image.model,
        prompt: image.prompt,
      });
      toast.success("Draft image saved to library!");
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to save draft image"
      );
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
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {premiumImage ? "Premium Image" : "Draft Preview"}
              </h2>
              {totalDrafts > 1 && !premiumImage && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0 || !onPrevious}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    style={{ color: "var(--text-primary)" }}
                    title="Previous draft"
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {currentIndex + 1} of {totalDrafts}
                  </span>
                  <button
                    onClick={onNext}
                    disabled={currentIndex === totalDrafts - 1 || !onNext}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    style={{ color: "var(--text-primary)" }}
                    title="Next draft"
                  >
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              )}
              {totalDrafts > 1 && !premiumImage && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Use ← → keys to navigate
                </p>
              )}
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

          {!premiumImage && draftImage && (
            <div className="space-y-6">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {/* Image with proper aspect ratio - constrained to fit on screen */}
                <div
                  className={`max-h-[60vh] max-w-full mx-auto ${
                    draftImage.aspect_ratio === "1:1"
                      ? "aspect-square"
                      : draftImage.aspect_ratio === "16:9"
                      ? "aspect-video"
                      : draftImage.aspect_ratio === "9:16"
                      ? "aspect-[9/16]"
                      : draftImage.aspect_ratio === "4:3"
                      ? "aspect-[4/3]"
                      : draftImage.aspect_ratio === "21:9"
                      ? "aspect-[21/9]"
                      : "aspect-square"
                  } flex items-center justify-center`}
                >
                  <img
                    src={draftImage.image_url}
                    alt={draftImage.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  DRAFT (Free)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p className="font-medium">
                    Generated with {draftImage.provider}
                  </p>
                  <p className="text-xs mt-1">
                    Draft images are free and not automatically saved.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {onRegenerate && (
                    <button
                      onClick={onRegenerate}
                      disabled={isUpgrading}
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Regenerate Draft</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDownload(draftImage)}
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
                    <span>Download Draft</span>
                  </button>

                  <button
                    onClick={() => handleSaveDraft(draftImage)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={() => setShowTextEditor(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>✨ Add Text</span>
                  </button>

                  <button
                    onClick={handleUpgradeToPremium}
                    disabled={isUpgrading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition font-medium flex items-center space-x-2"
                  >
                    {isUpgrading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Upgrading...</span>
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
                            d="M5 3l14 9-14 9V3z"
                          />
                        </svg>
                        <span>Upgrade to Premium</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    onClick={() => handleSavePremium(premiumImage)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                  >
                    Save to Library
                  </button>

                  <button
                    onClick={() => setShowTextEditor(true)}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>✨ Add Text</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {draftImage && (
        <TextEditorModal
          isOpen={showTextEditor}
          onClose={() => setShowTextEditor(false)}
          sourceImage={premiumImage || draftImage}
          campaignId={campaignId}
          onSave={(image) => {
            // Handle the saved image with text overlay
            toast.success("Image with text saved to library!");
            setShowTextEditor(false);
          }}
        />
      )}
    </div>
  );
}
