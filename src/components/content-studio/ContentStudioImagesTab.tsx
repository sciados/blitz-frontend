"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import {
  GeneratedImage,
  ImageType,
  ImageStyle,
  AspectRatio,
} from "src/lib/types";

const IMAGE_TYPES = [
  {
    value: "hero",
    label: "Hero Image",
    icon: "🖼️",
    description: "Large banner/header image",
  },
  {
    value: "product",
    label: "Product Image",
    icon: "📦",
    description: "Product showcase",
  },
  {
    value: "social",
    label: "Social Media",
    icon: "📱",
    description: "Instagram, Facebook, etc.",
  },
  {
    value: "ad",
    label: "Ad Creative",
    icon: "📢",
    description: "Paid advertising",
  },
  {
    value: "email",
    label: "Email Header",
    icon: "✉️",
    description: "Email campaign header",
  },
  {
    value: "blog",
    label: "Blog Feature",
    icon: "📝",
    description: "Blog post featured image",
  },
];

const IMAGE_STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "artistic", label: "Artistic" },
  { value: "minimalist", label: "Minimalist" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "product", label: "Product Focus" },
  { value: "illustration", label: "Illustration" },
  { value: "modern", label: "Modern" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:2", label: "3:2 (Photo)" },
];

interface ContentStudioImagesTabProps {
  campaignId: number;
  prePopulatedData?: {
    contentType?: string;
    marketingAngle?: string;
    day?: number;
    context?: string;
    customPrompt?: string;
  } | null;
  onContentGenerated?: () => void;
}

export function ContentStudioImagesTab({
  campaignId,
  prePopulatedData,
  onContentGenerated,
}: ContentStudioImagesTabProps) {
  const [imageType, setImageType] = useState<ImageType>("hero");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<{
    ingredients: string[];
    features: string[];
    benefits: string[];
    pain_points: string[];
  }>({
    ingredients: [],
    features: [],
    benefits: [],
    pain_points: [],
  });
  const [draftImages, setDraftImages] = useState<GeneratedImage[]>([]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number | null>(
    null
  );
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>(
    prePopulatedData?.customPrompt || ""
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [selectedDraftsForDownload, setSelectedDraftsForDownload] = useState<Set<number>>(new Set());

  // Fetch images for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["images", campaignId],
    queryFn: async () => {
      const response = await api.get(
        `/api/content/campaign/${campaignId}/images`
      );
      return response.data;
    },
  });

  const images = data?.images || [];

  // Fetch available keywords from campaign intelligence
  const { data: keywordsData, isLoading: keywordsLoading } = useQuery({
    queryKey: ["campaign-keywords", campaignId],
    queryFn: async () => {
      const response = await api.post("/api/prompt/keywords", {
        campaign_id: campaignId,
      });
      return response.data;
    },
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setDraftImages([]);
      setSelectedDraftIndex(null);

      // Generate 4 draft images (free, not saved to database)
      const response = await api.post("/api/images/previews", {
        campaign_id: campaignId,
        image_type: imageType,
        style: imageStyle,
        aspect_ratio: aspectRatio,
        highlight_features: selectedKeywords,
        custom_prompt: customPrompt || null,
        // Include calendar context if available
        context: prePopulatedData?.context,
        day: prePopulatedData?.day,
      });

      setDraftImages(response.data || []);
      toast.success(
        `Generated ${
          response.data?.length || 0
        } draft images! Select one to enhance.`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to generate draft images"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceImage = async () => {
    if (selectedDraftIndex === null) {
      toast.error("Please select a draft image first");
      return;
    }

    try {
      setIsEnhancing(true);
      const selectedDraft = draftImages[selectedDraftIndex];

      if (!selectedDraft) {
        toast.error("Selected draft not found");
        return;
      }

      // Enhance the selected draft to premium quality
      const response = await api.post("/api/images/upgrade", {
        campaign_id: campaignId,
        image_type: imageType,
        style: imageStyle,
        aspect_ratio: aspectRatio,
        draft_image_url: selectedDraft.image_url,
        provider: selectedDraft.provider,
        model: selectedDraft.model,
        prompt: selectedDraft.prompt,
      });

      toast.success("Image enhanced successfully!");

      // Clear drafts and refresh saved images
      setDraftImages([]);
      setSelectedDraftIndex(null);
      refetch();

      // Notify parent component that content was generated (for queue tracking)
      if (onContentGenerated) {
        onContentGenerated();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to enhance image");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (selectedImageIndex === null) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setIsGeneratingVariations(true);
      const selectedImage = images[selectedImageIndex];

      if (!selectedImage) {
        toast.error("Selected image not found");
        return;
      }

      // Generate 4 variations of the selected image
      const response = await api.post("/api/images/variations", {
        campaign_id: campaignId,
        base_image_url: selectedImage.image_url,
        image_type: selectedImage.image_type,
        style: selectedImage.style,
        aspect_ratio: selectedImage.aspect_ratio,
      });

      toast.success(
        `Generated ${
          response.data?.length || 0
        } variations! They have been added to your library.`
      );

      // Refresh the images list
      refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to generate variations"
      );
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings Panel */}
      <div className="lg:col-span-1">
        <div className="card rounded-lg p-6 sticky top-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Image Settings
          </h3>

          {/* Image Type */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Image Type
            </label>
            <select
              value={imageType}
              onChange={(e) => setImageType(e.target.value as ImageType)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {IMAGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Style
            </label>
            <select
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {IMAGE_STYLES.map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Prompt */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Custom Prompt (Optional)
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="w-full px-3 py-2 rounded-lg border resize-none"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
              rows={4}
            />
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Leave empty to use keywords below, or add your own description
            </p>
          </div>

          {/* Keywords Selection */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Keywords (Optional)
            </label>
            {keywordsLoading ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Loading keywords...
              </p>
            ) : keywordsData ? (
              <div className="space-y-4">
                {/* Ingredients */}
                {keywordsData.ingredients &&
                  keywordsData.ingredients.length > 0 && (
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Ingredients
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {keywordsData.ingredients.map((ingredient: string) => (
                          <button
                            key={ingredient}
                            onClick={() => {
                              setSelectedKeywords((prev) => ({
                                ...prev,
                                ingredients: prev.ingredients.includes(
                                  ingredient
                                )
                                  ? prev.ingredients.filter(
                                      (i) => i !== ingredient
                                    )
                                  : [...prev.ingredients, ingredient],
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              selectedKeywords.ingredients.includes(ingredient)
                                ? "bg-purple-500 text-white border-purple-500"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-purple-500"
                            }`}
                          >
                            {ingredient}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features */}
                {keywordsData.features && keywordsData.features.length > 0 && (
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Features
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {keywordsData.features.map((feature: string) => (
                        <button
                          key={feature}
                          onClick={() => {
                            setSelectedKeywords((prev) => ({
                              ...prev,
                              features: prev.features.includes(feature)
                                ? prev.features.filter((f) => f !== feature)
                                : [...prev.features, feature],
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            selectedKeywords.features.includes(feature)
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-purple-500"
                          }`}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {keywordsData.benefits && keywordsData.benefits.length > 0 && (
                  <div>
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Benefits
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {keywordsData.benefits.map((benefit: string) => (
                        <button
                          key={benefit}
                          onClick={() => {
                            setSelectedKeywords((prev) => ({
                              ...prev,
                              benefits: prev.benefits.includes(benefit)
                                ? prev.benefits.filter((b) => b !== benefit)
                                : [...prev.benefits, benefit],
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            selectedKeywords.benefits.includes(benefit)
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-purple-500"
                          }`}
                        >
                          {benefit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pain Points */}
                {keywordsData.pain_points &&
                  keywordsData.pain_points.length > 0 && (
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Pain Points
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {keywordsData.pain_points.map((pain: string) => (
                          <button
                            key={pain}
                            onClick={() => {
                              setSelectedKeywords((prev) => ({
                                ...prev,
                                pain_points: prev.pain_points.includes(pain)
                                  ? prev.pain_points.filter((p) => p !== pain)
                                  : [...prev.pain_points, pain],
                              }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm border ${
                              selectedKeywords.pain_points.includes(pain)
                                ? "bg-purple-500 text-white border-purple-500"
                                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-purple-500"
                            }`}
                          >
                            {pain}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {!keywordsData.ingredients?.length &&
                  !keywordsData.features?.length &&
                  !keywordsData.benefits?.length &&
                  !keywordsData.pain_points?.length && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      No keywords available. Compile campaign intelligence to
                      get keyword suggestions.
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Compile campaign intelligence to enable keyword selection.
              </p>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isGenerating ? "Generating Drafts..." : "Generate 4 Draft Images"}
          </button>

          {/* Enhance Button - shown when draft is selected */}
          {draftImages.length > 0 && (
            <button
              onClick={handleEnhanceImage}
              disabled={isEnhancing || selectedDraftIndex === null}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition mt-3"
            >
              {isEnhancing
                ? "Enhancing..."
                : selectedDraftIndex !== null
                ? "Enhance Selected Image"
                : "Select a Draft to Enhance"}
            </button>
          )}
        </div>
      </div>

      {/* Generated Images */}
      <div className="lg:col-span-2">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          {draftImages.length > 0
            ? `Draft Images - Select One to Enhance (${draftImages.length})`
            : `Generated Images (${images.length})`}
        </h3>

        {/* Draft Images Section - shown when drafts exist */}
        {draftImages.length > 0 ? (
          <div className="card rounded-lg p-6 mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 mr-2 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Draft Images (Free Preview)
              </h4>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              Select one draft image below to enhance it to premium quality and
              save it to your library.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {draftImages.map((image, index) => {
                // Calculate card height based on aspect ratio
                // Default to 1:1 if aspect_ratio is missing
                const aspectRatio = image.aspect_ratio || "1:1";
                const [width, height] = aspectRatio.split(":").map(Number);
                const ratio = height / width;

                // Set a max width for the cards and calculate height
                const maxCardWidth = 400; // pixels
                let cardHeight = maxCardWidth * ratio;

                // Constrain height to reasonable bounds
                if (cardHeight > 500) {
                  cardHeight = 500;
                } else if (cardHeight < 200) {
                  cardHeight = 200;
                }

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDraftIndex(index)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      selectedDraftIndex === index
                        ? "border-green-500 ring-2 ring-green-300"
                        : "border-transparent hover:border-yellow-400"
                    }`}
                    style={{ height: `${cardHeight}px` }}
                  >
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.prompt}
                        className="max-w-full max-h-full object-contain"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      />
                    </div>
                    {selectedDraftIndex === index && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        ✓
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-medium truncate">
                        Click to select
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Generated Images Section - shown when no drafts */
          <>
            {/* Latest Generated Preview */}
            {images.length > 0 && (
              <div className="card rounded-lg p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                    Latest Generated
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {images[0].image_url ? (
                      <img
                        src={images[0].image_url}
                        alt="Latest generated"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span style={{ color: "var(--text-secondary)" }}>
                          Processing...
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="mb-2">
                      <span
                        className="inline-block text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {images[0].image_type}
                      </span>
                    </div>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {images[0].prompt || "No prompt available"}
                    </p>
                    <div className="flex gap-2">
                      {images[0].image_url && (
                        <a
                          href={images[0].image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                        >
                          View Full Size
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {images.length === 0 ? (
              <div className="card rounded-lg p-8 text-center">
                <p style={{ color: "var(--text-secondary)" }}>
                  No images generated yet. Configure settings and click
                  "Generate 4 Draft Images".
                </p>
              </div>
            ) : (
              <>
                {/* Generate Variations Button - shown when image is selected */}
                {selectedImageIndex !== null && (
                  <div className="card rounded-lg p-4 mb-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-green-600"
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
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100">
                            Image Selected
                          </h4>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            Generate variations of this image
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateVariations}
                        disabled={isGeneratingVariations}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                      >
                        {isGeneratingVariations
                          ? "Generating..."
                          : "Generate Variations"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Images Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.slice(0, 10).map((image: GeneratedImage, index: number) => {
                    const imageIndex = index;
                    const isSelected = selectedImageIndex === imageIndex;
                    return (
                      <div
                        key={image.id}
                        onClick={() =>
                          setSelectedImageIndex(isSelected ? null : imageIndex)
                        }
                        className={`card rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer ${
                          isSelected
                            ? "ring-2 ring-green-500 ring-offset-2"
                            : ""
                        }`}
                      >
                        <div className="relative">
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                            {image.image_url ? (
                              <img
                                src={image.image_url}
                                alt={image.prompt}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span style={{ color: "var(--text-secondary)" }}>
                                  Processing...
                                </span>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p
                            className="text-sm line-clamp-2 mb-2"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {image.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                              }}
                            >
                              {image.image_type}
                            </span>
                            {image.image_url && (
                              <a
                                href={image.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View Full Size
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
