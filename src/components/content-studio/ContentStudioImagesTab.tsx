"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { GeneratedImage, ImageType, ImageStyle, AspectRatio } from "src/lib/types";

const IMAGE_TYPES = [
  { value: "hero", label: "Hero Image", icon: "🖼️", description: "Large banner/header image" },
  { value: "product", label: "Product Image", icon: "📦", description: "Product showcase" },
  { value: "social", label: "Social Media", icon: "📱", description: "Instagram, Facebook, etc." },
  { value: "ad", label: "Ad Creative", icon: "📢", description: "Paid advertising" },
  { value: "email", label: "Email Header", icon: "✉️", description: "Email campaign header" },
  { value: "blog", label: "Blog Feature", icon: "📝", description: "Blog post featured image" },
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
}

export function ContentStudioImagesTab({ campaignId }: ContentStudioImagesTabProps) {
  const [imageType, setImageType] = useState<ImageType>("hero");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch images for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["images", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/content/campaign/${campaignId}/images`);
      return response.data;
    },
  });

  const images = data?.images || [];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const response = await api.post("/api/content/images/generate", {
        campaign_id: campaignId,
        image_type: imageType,
        style: imageStyle,
        aspect_ratio: aspectRatio,
      });

      toast.success("Image generated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to generate image");
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

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>
        </div>
      </div>

      {/* Generated Images */}
      <div className="lg:col-span-2">
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Generated Images ({images.length})
        </h3>
        {images.length === 0 ? (
          <div className="card rounded-lg p-8 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              No images generated yet. Configure settings and click "Generate".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.slice(0, 10).map((image: GeneratedImage) => (
              <div
                key={image.id}
                className="card rounded-lg overflow-hidden hover:shadow-lg transition"
              >
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
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Full Size
                      </a>
                    )}
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
