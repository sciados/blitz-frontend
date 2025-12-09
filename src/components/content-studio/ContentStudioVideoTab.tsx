"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

const VIDEO_STYLES = [
  { value: "marketing", label: "Marketing", description: "Professional, engaging" },
  { value: "educational", label: "Educational", description: "Clear, informative" },
  { value: "social", label: "Social Media", description: "Dynamic, eye-catching" },
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
}

export function ContentStudioVideoTab({ campaignId }: ContentStudioVideoTabProps) {
  const [generationMode, setGenerationMode] = useState<"text_to_video" | "image_to_video">("text_to_video");
  const [style, setStyle] = useState("marketing");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  // Fetch videos for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["videos", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/video/library?campaign_id=${campaignId}`);
      return response.data;
    },
    // Auto-refresh every 5 seconds to check video generation progress
    refetchInterval: (data: any) => {
      // Only poll if there are videos and at least one is processing
      const videos = data?.videos || [];
      const hasProcessingVideos = videos.some((v: any) => v.status === "processing");
      return hasProcessingVideos ? 5000 : false;
    },
    refetchIntervalInBackground: true,
  });

  // Fetch video scripts for this campaign
  const { data: scriptData } = useQuery({
    queryKey: ["video-scripts", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/content/campaign/${campaignId}`);
      // Filter for video scripts only
      const scripts = response.data.filter((content: any) => content.content_type === "video_script");
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

  const videos = data?.videos || [];
  const videoScripts = scriptData || [];
  const campaignImages = imagesData?.images || [];

  // Filter video scripts by the selected duration (show all scripts, but highlight matching ones)
  const filteredVideoScripts = videoScripts.filter((script: any) => {
    // Always include all scripts - no filtering
    // The user can choose any script or write custom
    return true;
  });

  // Handle script selection
  const handleScriptSelect = (scriptId: number, scriptText: string) => {
    setSelectedScriptId(scriptId);
    setScript(scriptText);
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

  // Reset form when generation mode changes
  const handleGenerationModeChange = (mode: "text_to_video" | "image_to_video") => {
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
      };

      // Add image URL for image-to-video generation
      if (generationMode === "image_to_video" && selectedImageUrl) {
        requestBody.image_url = selectedImageUrl;
      }

      const response = await api.post("/api/video/generate", requestBody);

      toast.success("Video generation started!");
      setScript("");
      handleClearScript();
      handleClearImage();
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to generate video");
    } finally {
      setIsGenerating(false);
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
            Video Settings
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
              onChange={(e) => handleGenerationModeChange(e.target.value as "text_to_video" | "image_to_video")}
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
                      onClick={() => handleImageSelect(image.id, image.image_url)}
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
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
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
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    Click to upload an image
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    PNG, JPG, or GIF
                  </p>
                </label>
              </div>

              {/* Selected Image Preview */}
              {selectedImageUrl && (
                <div className="mt-3">
                  <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
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
              {VIDEO_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
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
              {ASPECT_RATIOS.map((ratio) => (
                <option key={ratio.value} value={ratio.value}>
                  {ratio.label}
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
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Video Script Selection */}
          {filteredVideoScripts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Or Select an Existing Video Script
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
                  if (scriptId) {
                    const selectedScript = filteredVideoScripts.find((s: any) => s.id === scriptId);
                    if (selectedScript) {
                      handleScriptSelect(scriptId, selectedScript.content_data.text);
                    }
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm"
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
              placeholder="Describe the video you want to create..."
              className="w-full px-3 py-2 rounded-lg border h-32 resize-none"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
            {selectedScriptId && (
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                ✓ Using selected video script. You can edit above or select a different one.
              </p>
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

      {/* Generated Videos */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Generated Videos ({videos.length})
          </h3>
          {videos.some((v: any) => v.status === "processing") && (
            <div className="flex items-center space-x-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <svg
                className="w-4 h-4 animate-spin"
                style={{ color: "var(--text-secondary)" }}
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
              <span>Auto-refreshing...</span>
            </div>
          )}
        </div>
        {videos.length === 0 ? (
          <div className="card rounded-lg p-8 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              No videos generated yet. Configure settings and click "Generate".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.slice(0, 10).map((video: any) => (
              <div
                key={video.id}
                className="card rounded-lg p-6 hover:border-red-500 transition"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-48 h-28 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : video.video_url ? (
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 mb-2"
                          style={{ color: "var(--text-secondary)" }}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          Video Ready
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: "var(--text-secondary)" }}>
                        No preview
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4
                        className="text-lg font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {video.generation_mode?.replace("_", " ").toUpperCase() || "VIDEO"}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : video.status === "processing"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {video.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Duration:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>
                          {video.actual_duration || video.requested_duration}s
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Provider:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>{video.provider}</span>
                      </div>
                    </div>

                    <p
                      className="text-sm line-clamp-2 mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {video.prompt}
                    </p>

                    <div className="flex items-center space-x-3 flex-wrap">
                      {video.status === "completed" && video.video_url && (
                        <a
                          href={video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          View Video
                        </a>
                      )}
                      {video.saved_to_r2 && (
                        <a
                          href={video.video_url}
                          download
                          className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                        >
                          Download
                        </a>
                      )}
                      {!video.saved_to_r2 && (
                        <button
                          onClick={() => {
                            api.post("/api/video/save-to-library", { video_id: video.id })
                              .then(() => {
                                toast.success("Video saved to library!");
                                refetch();
                              })
                              .catch(() => toast.error("Failed to save video"));
                          }}
                          className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                        >
                          {video.status === "completed" ? "Save to Library" : "Refresh & Save"}
                        </button>
                      )}
                      {video.saved_to_r2 && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
                              api.delete(`/api/video/${video.id}`)
                                .then(() => {
                                  toast.success("Video deleted successfully!");
                                  refetch();
                                })
                                .catch(() => toast.error("Failed to delete video"));
                            }
                          }}
                          className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
