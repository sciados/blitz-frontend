"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { ContentCard } from "src/components/ContentCard";
import { GeneratedContent, GeneratedImage } from "src/lib/types";

interface ContentStudioLibraryTabProps {
  campaignId: number | null;
  onGenerateFromContent: (type: "text" | "images" | "video") => void;
}

type FilterType = "all" | "text" | "images" | "videos";

export function ContentStudioLibraryTab({ campaignId, onGenerateFromContent }: ContentStudioLibraryTabProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  // Fetch all content for the campaign
  const { data: contentData, refetch: refetchContent } = useQuery({
    queryKey: ["content-all", campaignId],
    queryFn: async () => {
      if (!campaignId) return { contents: [] };
      const response = await api.get(`/api/content/campaign/${campaignId}`);
      return response.data;
    },
    enabled: !!campaignId,
  });

  // Fetch images
  const { data: imagesData, refetch: refetchImages } = useQuery({
    queryKey: ["images", campaignId],
    queryFn: async () => {
      if (!campaignId) return { images: [] };
      const response = await api.get(`/api/images/campaign/${campaignId}`);
      return response.data;
    },
    enabled: !!campaignId,
  });

  // Fetch videos - note: backend doesn't filter by campaign, so we fetch all and filter client-side
  const { data: videosData, refetch: refetchVideos } = useQuery({
    queryKey: ["videos", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/video/library`);
      return response.data;
    },
    enabled: true, // Always enabled, we'll filter client-side
  });

  const allContent = contentData || [];
  const allImages = imagesData?.images || [];
  const allVideos = videosData?.videos || [];

  // Filter videos by campaign_id (client-side since backend doesn't support it)
  const filteredVideos = campaignId
    ? allVideos.filter((item: any) => item.campaign_id === campaignId)
    : allVideos;

  // Filter content based on selected filter
  const getFilteredContent = () => {
    const items: Array<{ type: string; data: any }> = [];

    if (filter === "all" || filter === "text") {
      allContent.forEach((item: GeneratedContent) => {
        items.push({ type: "text", data: item });
      });
    }

    if (filter === "all" || filter === "images") {
      allImages.forEach((item: GeneratedImage) => {
        items.push({ type: "image", data: item });
      });
    }

    if (filter === "all" || filter === "videos") {
      filteredVideos.forEach((item: any) => {
        items.push({ type: "video", data: item });
      });
    }

    return items;
  };

  const filteredItems = getFilteredContent();

  if (!campaignId) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--text-secondary)" }}>
          Please select a campaign to view content library
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{
            color: filter === "all" ? "white" : "var(--text-primary)",
          }}
        >
          All ({allContent.length + allImages.length + filteredVideos.length})
        </button>
        <button
          onClick={() => setFilter("text")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "text"
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{
            color: filter === "text" ? "white" : "var(--text-primary)",
          }}
        >
          📝 Text ({allContent.length})
        </button>
        <button
          onClick={() => setFilter("images")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "images"
              ? "bg-purple-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{
            color: filter === "images" ? "white" : "var(--text-primary)",
          }}
        >
          🖼️ Images ({allImages.length})
        </button>
        <button
          onClick={() => setFilter("videos")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === "videos"
              ? "bg-red-600 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          style={{
            color: filter === "videos" ? "white" : "var(--text-primary)",
          }}
        >
          🎬 Videos ({filteredVideos.length})
        </button>
      </div>

      {/* Quick Actions */}
      {filteredItems.length === 0 ? (
        <div className="card rounded-lg p-12 text-center">
          <p className="text-lg mb-4" style={{ color: "var(--text-secondary)" }}>
            No content found
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Generate your first piece of content to get started
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => onGenerateFromContent("text")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Generate Text
            </button>
            <button
              onClick={() => onGenerateFromContent("images")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              Generate Images
            </button>
            <button
              onClick={() => onGenerateFromContent("video")}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Generate Video
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <div key={`${item.type}-${item.data.id}`}>
              {item.type === "text" ? (
                <ContentCard content={item.data} />
              ) : item.type === "image" ? (
                <div className="card rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.data.image_url ? (
                        <img
                          src={item.data.image_url}
                          alt={item.data.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span style={{ color: "var(--text-secondary)" }}>...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.data.image_type?.replace("_", " ").toUpperCase()}
                        </h4>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.data.provider}
                        </span>
                      </div>
                      <p
                        className="text-sm line-clamp-2 mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.data.prompt}
                      </p>
                      {item.data.image_url && (
                        <a
                          href={item.data.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Full Size →
                        </a>
                      )}
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = item.data.image_url;
                            link.download = `blitz-${item.data.image_type}-${item.data.id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => {
                            // Generate similar image using the same prompt
                            onGenerateFromContent("images");
                          }}
                          className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Similar
                        </button>
                        <button
                          onClick={() => {
                            // Generate video from this image
                            onGenerateFromContent("video");
                          }}
                          className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Video
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this image?")) {
                              // TODO: Implement delete functionality
                              console.log("Delete image:", item.data.id);
                            }
                          }}
                          className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-1 ml-auto"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-start space-x-4">
                    <div className="w-48 h-28 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.data.thumbnail_url ? (
                        <img
                          src={item.data.thumbnail_url}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span style={{ color: "var(--text-secondary)" }}>...</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.data.generation_mode?.replace("_", " ").toUpperCase()}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {item.data.saved_to_r2 ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                              ✓ Saved
                            </span>
                          ) : null}
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: "var(--bg-secondary)",
                              color: "var(--text-primary)",
                            }}
                          >
                            {item.data.status}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-sm line-clamp-2 mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.data.prompt}
                      </p>
                      {item.data.status === "completed" && item.data.video_url && (
                        <a
                          href={item.data.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Video →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
