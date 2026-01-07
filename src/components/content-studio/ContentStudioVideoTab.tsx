"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { VideoEditorModal } from "src/components/VideoEditorModal";

const VIDEO_STYLES = [
  {
    value: "marketing",
    label: "Marketing",
    description: "Professional, engaging",
  },
  {
    value: "educational",
    label: "Educational",
    description: "Clear, informative",
  },
  {
    value: "social",
    label: "Social Media",
    description: "Dynamic, eye-catching",
  },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
];

const DURATIONS = [
  { value: 5, label: "5 seconds" },
  { value: 10, label: "10 seconds" },
];

interface ContentStudioVideoTabProps {
  campaignId: number;
  prePopulatedData?: {
    contentType?: string;
    marketingAngle?: string;
    day?: number;
    context?: string;
  } | null;
  onContentGenerated?: () => void;
}

export function ContentStudioVideoTab({
  campaignId,
  prePopulatedData,
  onContentGenerated,
}: ContentStudioVideoTabProps) {
  const [generationMode, setGenerationMode] = useState<
    "text_to_video" | "image_to_video"
  >("text_to_video");
  const [style, setStyle] = useState("marketing");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  // Selected keywords state
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

  // Video Editor Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorVideoUrl, setEditorVideoUrl] = useState<string>("");
  const [editorVideoScript, setEditorVideoScript] = useState<string>("");

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

  // Fetch video scripts for this campaign
  const { data: scriptData } = useQuery({
    queryKey: ["video-scripts", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/content/campaign/${campaignId}`);
      // Filter for video scripts only
      const scripts = response.data.filter(
        (content: any) => content.content_type === "video_script"
      );
      return scripts;
    },
  });

  // Fetch images for this campaign
  const { data: imagesData } = useQuery({
    queryKey: ["campaign-images", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/images/campaign/${campaignId}`);
      return response.data;
    },
  });

  const videoScripts = scriptData || [];
  const campaignImages = imagesData?.images || [];

  // Filter video scripts by the selected duration (show all scripts, but highlight matching ones)
  const filteredVideoScripts = videoScripts.filter((script: any) => {
    // Always include all scripts - no filtering
    // The user can choose any script or write custom
    return true;
  });

  // Helper function to extract clean narrative from script (remove overlay guide)
  const extractCleanNarrative = (fullScript: string): string => {
    // Find the overlay guide separator
    const overlayGuideIndex = fullScript.indexOf(
      "============================================================"
    );

    if (overlayGuideIndex !== -1) {
      // Return only the narrative part (before the overlay guide)
      return fullScript.substring(0, overlayGuideIndex).trim();
    }

    // If no overlay guide found, return the full script
    return fullScript;
  };

  // Auto-generate script when coming from calendar queue
  useEffect(() => {
    if (prePopulatedData && !script && !selectedScriptId) {
      // Auto-generate script for calendar-based video generation
      handleGenerateScriptFromCalendar();
    }
  }, [prePopulatedData]);

  const handleGenerateScriptFromCalendar = async () => {
    if (!prePopulatedData?.context || !prePopulatedData?.marketingAngle) return;

    try {
      setIsGenerating(true);
      const response = await api.post("/api/content/generate", {
        campaign_id: campaignId,
        content_type: "video_script",
        marketing_angle: prePopulatedData.marketingAngle,
        length: duration.toString(),
        keywords: selectedKeywords,
        context: prePopulatedData.context,
        day: prePopulatedData.day,
      });

      const generatedScript = response.data;
      if (generatedScript?.content_data?.text) {
        const cleanScript = extractCleanNarrative(
          generatedScript.content_data.text
        );
        setScript(cleanScript);
        toast.success("Video script generated automatically! ✓");
      }
    } catch (error: any) {
      console.error("Failed to auto-generate script:", error);
      // Don't block video generation if script generation fails
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle script selection
  const handleScriptSelect = (scriptId: number, scriptText: string) => {
    setSelectedScriptId(scriptId);
    // Store the clean narrative (without overlay guide) for video generation
    const cleanNarrative = extractCleanNarrative(scriptText);
    setScript(cleanNarrative);
  };

  // Clear script selection
  const handleClearScript = () => {
    setSelectedScriptId(null);
    setScript("");
  };

  // Handle image selection
  const handleImageSelect = (imageId: number, imageUrl: string) => {
    setSelectedImageId(imageId);
    setSelectedImageUrl(imageUrl);
  };

  // Clear image selection
  const handleClearImage = () => {
    setSelectedImageId(null);
    setSelectedImageUrl("");
  };

  // Video Editor handlers
  const handleOpenEditor = (videoUrl: string, videoScript?: string) => {
    setEditorVideoUrl(videoUrl);
    setEditorVideoScript(videoScript || "");
    setIsEditorOpen(true);
  };

  const handleSaveEditedVideo = (video: { video_url: string }) => {
    toast.success("Video with text overlays saved successfully!");
  };

  // Reset form when generation mode changes
  const handleGenerationModeChange = (
    mode: "text_to_video" | "image_to_video"
  ) => {
    setGenerationMode(mode);
    handleClearScript();
    handleClearImage();
    setScript("");
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const requestBody: any = {
        campaign_id: campaignId,
        generation_mode: generationMode,
        style,
        aspect_ratio: aspectRatio,
        duration,
        script,
        keywords: selectedKeywords,
        // Include calendar context if available
        context: prePopulatedData?.context,
        day: prePopulatedData?.day,
      };

      // Add image URL for image-to-video generation
      if (generationMode === "image_to_video" && selectedImageUrl) {
        requestBody.image_url = selectedImageUrl;
      }

      const response = await api.post("/api/video/generate", requestBody);
      toast.success(
        "Video generation started! Check the Content Library to view progress."
      );
      // Clear form after generation
      handleClearScript();
      handleClearImage();
      setScript("");

      // Notify parent component that content was generated (for queue tracking)
      if (onContentGenerated) {
        onContentGenerated();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to start video generation"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Get provider info based on duration and generation mode
  const getProviderInfo = () => {
    if (duration === 10 && generationMode === "text_to_video") {
      return {
        name: "Luma AI",
        model: "Ray-v1",
        description: "High-quality 10s videos",
        estimatedTime: "~60-90 seconds",
        color: "text-purple-600",
      };
    } else if (duration === 5) {
      return {
        name: "Hunyuan",
        model: "Fast Generation",
        description: "Quick 5s videos",
        estimatedTime: "~30-45 seconds",
        color: "text-blue-600",
      };
    } else {
      return {
        name: "Hunyuan + Extend",
        model: "5s + FFmpeg Loop",
        description: "Extended duration video",
        estimatedTime: "~45-60 seconds",
        color: "text-green-600",
      };
    }
  };

  const providerInfo = getProviderInfo();

  // Get resolution info based on aspect ratio
  const getResolution = () => {
    switch (aspectRatio) {
      case "16:9":
        return "1280×720 (HD)";
      case "9:16":
        return "720×1280 (Vertical)";
      case "1:1":
        return "1024×1024 (Square)";
      default:
        return "1280×720";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Generation Form */}
      <div className="lg:col-span-1">
        <div className="card rounded-lg p-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Video Configuration
          </h3>

          {/* Generation Mode */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Generation Mode
            </label>
            <select
              value={generationMode}
              onChange={(e) =>
                handleGenerationModeChange(
                  e.target.value as "text_to_video" | "image_to_video"
                )
              }
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              <option value="text_to_video">Text to Video</option>
              <option value="image_to_video">Image to Video</option>
            </select>
          </div>

          {/* Image Selection - Only show for Image to Video mode */}
          {generationMode === "image_to_video" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Select Source Image
                </label>
                {selectedImageId && (
                  <button
                    onClick={handleClearImage}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              {/* Campaign Images Grid */}
              {campaignImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-3 max-h-48 overflow-y-auto">
                  {campaignImages.map((image: any) => (
                    <div
                      key={image.id}
                      onClick={() =>
                        handleImageSelect(image.id, image.image_url)
                      }
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition ${
                        selectedImageId === image.id
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      {selectedImageId === image.id && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No campaign images found
                  </p>
                </div>
              )}

              {/* Upload Image Option */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create a temporary URL for preview
                      const imageUrl = URL.createObjectURL(file);
                      setSelectedImageId(-1); // Use -1 to indicate uploaded image
                      setSelectedImageUrl(imageUrl);
                      toast.success("Image selected for upload!");
                    }
                  }}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <svg
                    className="w-6 h-6 mx-auto mb-2"
                    style={{ color: "var(--text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Click to upload an image
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    PNG, JPG, or GIF
                  </p>
                </label>
              </div>

              {/* Selected Image Preview */}
              {selectedImageUrl && (
                <div className="mt-3">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Selected Image:
                  </p>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={selectedImageUrl}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                    {selectedImageId === -1 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        Uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Style */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {VIDEO_STYLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Aspect Ratio
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {ASPECT_RATIOS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {DURATIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Note: 10s videos use Luma AI (txt2video only) or extend 5s videos
              with ffmpeg
            </p>
          </div>

          {/* Keywords Section */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Focus Keywords (Optional)
            </label>
            <p
              className="text-xs mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Select specific ingredients, features, or benefits to include in
              your video
            </p>

            {keywordsLoading ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : keywordsData &&
              (keywordsData.ingredients?.length > 0 ||
                keywordsData.features?.length > 0 ||
                keywordsData.benefits?.length > 0 ||
                keywordsData.pain_points?.length > 0) ? (
              <div className="space-y-3">
                {/* Ingredients */}
                {keywordsData.ingredients &&
                  keywordsData.ingredients.length > 0 && (
                    <div>
                      <label
                        className="block text-xs font-medium mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Ingredients/Tech
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {keywordsData.ingredients.map((ingredient: string) => (
                          <button
                            key={ingredient}
                            onClick={() => {
                              const newIngredients =
                                selectedKeywords.ingredients.includes(
                                  ingredient
                                )
                                  ? selectedKeywords.ingredients.filter(
                                      (i) => i !== ingredient
                                    )
                                  : [
                                      ...selectedKeywords.ingredients,
                                      ingredient,
                                    ];
                              setSelectedKeywords({
                                ...selectedKeywords,
                                ingredients: newIngredients,
                              });
                            }}
                            className={`px-2 py-1 rounded-full text-xs border transition ${
                              selectedKeywords.ingredients.includes(ingredient)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-transparent hover:bg-blue-50 border-gray-300"
                            }`}
                            style={{
                              borderColor:
                                selectedKeywords.ingredients.includes(
                                  ingredient
                                )
                                  ? "var(--primary-color)"
                                  : "var(--card-border)",
                              color: selectedKeywords.ingredients.includes(
                                ingredient
                              )
                                ? "white"
                                : "var(--text-primary)",
                            }}
                          >
                            {ingredient}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Features - Disabled for Videos */}
                {keywordsData.features && keywordsData.features.length > 0 && (
                  <div>
                    <label
                      className="flex text-xs font-medium mb-1 items-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Features
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Disabled for Videos
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {keywordsData.features.map((feature: string) => (
                        <button
                          key={feature}
                          disabled
                          className="px-2 py-1 rounded-full text-xs border cursor-not-allowed opacity-50"
                          style={{
                            borderColor: "var(--card-border)",
                            color: "var(--text-secondary)",
                            backgroundColor: "var(--bg-primary)",
                          }}
                          title="Features are disabled for video generation"
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits - Disabled for Videos */}
                {keywordsData.benefits && keywordsData.benefits.length > 0 && (
                  <div>
                    <label
                      className="flex text-xs font-medium mb-1 items-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Benefits
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Disabled for Videos
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {keywordsData.benefits.map((benefit: string) => (
                        <button
                          key={benefit}
                          disabled
                          className="px-2 py-1 rounded-full text-xs border cursor-not-allowed opacity-50"
                          style={{
                            borderColor: "var(--card-border)",
                            color: "var(--text-secondary)",
                            backgroundColor: "var(--bg-primary)",
                          }}
                          title="Benefits are disabled for video generation"
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
                        style={{ color: "var(--text-primary)" }}
                      >
                        Pain Points
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {keywordsData.pain_points.map((pain: string) => (
                          <button
                            key={pain}
                            onClick={() => {
                              const newPainPoints =
                                selectedKeywords.pain_points.includes(pain)
                                  ? selectedKeywords.pain_points.filter(
                                      (p) => p !== pain
                                    )
                                  : [...selectedKeywords.pain_points, pain];
                              setSelectedKeywords({
                                ...selectedKeywords,
                                pain_points: newPainPoints,
                              });
                            }}
                            className={`px-2 py-1 rounded-full text-xs border transition ${
                              selectedKeywords.pain_points.includes(pain)
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-transparent hover:bg-blue-50 border-gray-300"
                            }`}
                            style={{
                              borderColor:
                                selectedKeywords.pain_points.includes(pain)
                                  ? "var(--primary-color)"
                                  : "var(--card-border)",
                              color: selectedKeywords.pain_points.includes(pain)
                                ? "white"
                                : "var(--text-primary)",
                            }}
                          >
                            {pain}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <p
                className="text-xs text-center py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                No keywords available
              </p>
            )}
          </div>

          {/* Video Script Selection - Only for Text to Video */}
          {generationMode === "text_to_video" && videoScripts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Or Select Existing Script
                </label>
                {selectedScriptId && (
                  <button
                    onClick={handleClearScript}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
              <select
                value={selectedScriptId || ""}
                onChange={(e) => {
                  const scriptId = Number(e.target.value);
                  const script = videoScripts.find(
                    (s: any) => s.id === scriptId
                  );
                  if (script) {
                    handleScriptSelect(scriptId, script.content_data.text);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border mb-2"
                style={{
                  borderColor: "var(--card-border)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Choose a video script...</option>
                {filteredVideoScripts.map((script: any) => (
                  <option key={script.id} value={script.id}>
                    {script.content_data.text.substring(0, 60)}
                    {script.content_data.text.length > 60 ? "..." : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Script */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Script / Description
            </label>
            <textarea
              value={script}
              onChange={(e) => {
                setScript(e.target.value);
                // Clear selection if user manually edits
                if (selectedScriptId) {
                  setSelectedScriptId(null);
                }
              }}
              placeholder="Example: A sleek product showcase opens with a close-up of the Mitolyn bottle on a clean white background. Smooth camera pull-back reveals the bottle prominently centered with soft, professional lighting. Gentle rotation shows the product from multiple angles as text appears: 'Feel the Difference.' End with a confident close-up of the bottle logo."
              className="w-full px-3 py-2 rounded-lg border h-32 resize-none"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
            {/* Manual Script Tips */}
            {!prePopulatedData && !selectedScriptId && script && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div
                  className="text-xs flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-2 text-green-600 dark:text-green-400"
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
                  <span className="font-semibold">Custom Script</span>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  💡 Tip: Include visual details (camera angles, lighting,
                  transitions) for better AI-generated videos
                </p>
              </div>
            )}

            {/* Auto-generated Script Indicator */}
            {prePopulatedData && script && !selectedScriptId && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div
                  className="text-xs flex items-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  <svg
                    className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400"
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
                  <span className="font-semibold">
                    Auto-generated from Marketing Calendar
                  </span>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Script generated automatically for Day {prePopulatedData.day}{" "}
                  • {prePopulatedData.marketingAngle?.replace(/_/g, " ")} angle
                </p>
              </div>
            )}
            {selectedScriptId && (
              <div
                className="text-xs mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <p className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  ✓ Using selected video script (overlay guide stripped for
                  clean generation)
                </p>
                <p className="mt-1 text-xs">
                  💡 Note: Only the narrative is sent to AI. Overlay guide is
                  for your reference only.
                </p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={
              isGenerating ||
              (generationMode === "text_to_video" && !script.trim()) ||
              (generationMode === "image_to_video" && !selectedImageUrl)
            }
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isGenerating ? "Generating..." : "Generate Video"}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <div className="card rounded-lg p-6">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Video Preview
          </h3>

          {/* Provider Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                AI Provider
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded ${providerInfo.color} bg-opacity-20`}
              >
                {providerInfo.name}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  style={{ color: "var(--text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <span style={{ color: "var(--text-secondary)" }}>Model:</span>
                <span
                  className="ml-2 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {providerInfo.model}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  style={{ color: "var(--text-secondary)" }}
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
                <span style={{ color: "var(--text-secondary)" }}>
                  Est. Time:
                </span>
                <span
                  className="ml-2 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {providerInfo.estimatedTime}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <svg
                  className="w-4 h-4 mr-2"
                  style={{ color: "var(--text-secondary)" }}
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
                <span style={{ color: "var(--text-secondary)" }}>Quality:</span>
                <span
                  className="ml-2 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {providerInfo.description}
                </span>
              </div>
            </div>
          </div>

          {/* Video Specs */}
          <div className="mb-6">
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Video Specifications
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Duration
                </div>
                <div
                  className="text-lg font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {duration} seconds
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Resolution
                </div>
                <div
                  className="text-lg font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {getResolution()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Aspect Ratio
                </div>
                <div
                  className="text-lg font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {aspectRatio}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Style
                </div>
                <div
                  className="text-lg font-semibold mt-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {VIDEO_STYLES.find((s) => s.value === style)?.label || style}
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  What to Expect
                </h5>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>
                    • Video generation will start immediately after clicking
                    "Generate Video"
                  </li>
                  <li>
                    • Check the Content Library for real-time progress updates
                  </li>
                  <li>
                    • Generation time varies based on provider and server load
                  </li>
                  <li>
                    • You'll receive a notification when your video is ready
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visual Preview Mockup */}
          <div className="mt-6">
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Visual Preview
            </h4>
            <div
              className="relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center"
              style={{
                aspectRatio:
                  aspectRatio === "16:9"
                    ? "16/9"
                    : aspectRatio === "9:16"
                    ? "9/16"
                    : "1/1",
                maxHeight: "300px",
              }}
            >
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-3 opacity-30"
                  style={{ color: "var(--text-secondary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {generationMode === "text_to_video"
                    ? "Text-to-Video"
                    : "Image-to-Video"}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {duration}s • {aspectRatio}
                </div>
              </div>

              {/* Duration indicator */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {duration}s
              </div>

              {/* Provider badge */}
              <div
                className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${providerInfo.color.replace(
                  "text-",
                  "bg-"
                )} bg-opacity-20`}
              >
                {providerInfo.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Editor Modal */}
      <VideoEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        videoUrl={editorVideoUrl}
        videoScript={editorVideoScript}
        campaignId={campaignId}
        onSave={handleSaveEditedVideo}
      />
    </div>
  );
}
