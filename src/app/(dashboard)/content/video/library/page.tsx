"use client";

import { AuthGate } from "src/components/AuthGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import Link from "next/link";
import { toast } from "sonner";

interface GeneratedVideo {
  id: number;
  task_id: string;
  provider: string;
  model_name: string;
  generation_mode: string;
  prompt: string;
  script?: string;
  style?: string;
  aspect_ratio?: string;
  requested_duration: number;
  actual_duration?: number;
  video_url?: string;
  video_raw_url?: string;
  thumbnail_url?: string;
  last_frame_url?: string;
  video_width?: number;
  video_height?: number;
  status: string;
  progress?: number;
  cost?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  saved_to_r2?: boolean;
  r2_key?: string;
}

export default function VideoLibraryPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{
    videos: GeneratedVideo[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
  }>({
    queryKey: ["video-library"],
    queryFn: async () => (await api.get("/api/video/library")).data,
  });

  const saveVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await api.post("/api/video/save-to-library", {
        video_id: videoId,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Video saved to library!");
      queryClient.invalidateQueries({ queryKey: ["video-library"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to save video to library"
      );
    },
  });

  const handleSaveToLibrary = (videoId: number) => {
    saveVideoMutation.mutate(videoId);
  };

  const videos = data?.videos || [];
  const total = data?.total || 0;

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video Library</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              View and manage your generated videos
            </p>
          </div>
          <Link
            href="/content/video"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            + Generate New Video
          </Link>
        </div>

        {isLoading ? (
          <div className="card rounded-lg p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading videos...</p>
          </div>
        ) : error ? (
          <div className="card rounded-lg p-8 text-center">
            <p style={{ color: "var(--text-danger)" }}>
              Failed to load videos. Please try again.
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div className="card rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8"
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
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No videos yet
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Generate your first video to get started
            </p>
            <Link
              href="/content/video"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Generate Video
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="card rounded-lg p-6 hover:border-blue-500 transition"
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
                      <svg
                        className="w-12 h-12"
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
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {video.generation_mode?.replace("_", " ").toUpperCase() || "VIDEO"} GENERATION
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : video.status === "processing"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : video.status === "failed"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {video.status}
                        {video.progress !== undefined && video.status === "processing" ? ` (${video.progress}%)` : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Duration:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>
                          {video.actual_duration || video.requested_duration}s
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Aspect Ratio:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>{video.aspect_ratio || "N/A"}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Provider:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>{video.provider}</span>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-secondary)" }}>Model:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>{video.model_name}</span>
                      </div>
                    </div>

                    {video.cost !== undefined && (
                      <div className="text-sm mb-3">
                        <span style={{ color: "var(--text-secondary)" }}>Cost:</span>{" "}
                        <span style={{ color: "var(--text-primary)" }}>${video.cost.toFixed(4)}</span>
                      </div>
                    )}

                    {video.error_message && (
                      <div className="text-sm mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <span style={{ color: "var(--text-danger)" }}>{video.error_message}</span>
                      </div>
                    )}

                    <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--text-secondary)" }}>
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
                      {video.status === "completed" && video.video_raw_url && (
                        <a
                          href={video.video_raw_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                        >
                          Download
                        </a>
                      )}
                      {video.status === "completed" && !video.saved_to_r2 && (
                        <button
                          onClick={() => handleSaveToLibrary(video.id)}
                          disabled={saveVideoMutation.isPending}
                          className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded transition"
                        >
                          {saveVideoMutation.isPending ? "Saving..." : "Save to Library"}
                        </button>
                      )}
                      {video.saved_to_r2 && (
                        <span className="text-sm px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded flex items-center">
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
                          Saved to Library
                        </span>
                      )}
                      {video.status === "processing" && (
                        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                          Processing...
                        </span>
                      )}
                      {video.status === "failed" && (
                        <span className="text-sm px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded">
                          Failed
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Created: {new Date(video.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {data && data.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  disabled={data.page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Page {data.page} of {data.pages}
                </span>
                <button
                  disabled={data.page >= data.pages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGate>
  );
}
