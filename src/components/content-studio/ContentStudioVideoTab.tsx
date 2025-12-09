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

  // Fetch videos for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["videos", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/video/library?campaign_id=${campaignId}`);
      return response.data;
    },
  });

  const videos = data?.videos || [];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const response = await api.post("/api/video/generate", {
        campaign_id: campaignId,
        generation_mode: generationMode,
        style,
        aspect_ratio: aspectRatio,
        duration,
        script,
      });

      toast.success("Video generation started!");
      setScript("");
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
              onChange={(e) => setGenerationMode(e.target.value as "text_to_video" | "image_to_video")}
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
              onChange={(e) => setScript(e.target.value)}
              placeholder="Describe the video you want to create..."
              className="w-full px-3 py-2 rounded-lg border h-32 resize-none"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !script.trim()}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isGenerating ? "Generating..." : "Generate Video"}
          </button>
        </div>
      </div>

      {/* Generated Videos */}
      <div className="lg:col-span-2">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Generated Videos ({videos.length})
        </h3>
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
                  <div className="w-48 h-28 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
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

                    <div className="flex items-center space-x-3">
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
                      {video.status === "completed" && !video.saved_to_r2 && (
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
                          Save to Library
                        </button>
                      )}
                      {video.saved_to_r2 && (
                        <span className="text-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                          ✓ Saved
                        </span>
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
