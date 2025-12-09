"use client";

import { useState } from "react";
import { ContentCard } from "src/components/ContentCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { GeneratedContent, ContentType, MarketingAngle } from "src/lib/types";

const CONTENT_TYPES = [
  { value: "article", label: "Article / Blog Post", icon: "📝" },
  { value: "email", label: "Single Email", icon: "📧" },
  { value: "email_sequence", label: "Email Sequence", icon: "📬" },
  { value: "video_script", label: "Video Script", icon: "🎬" },
  { value: "social_post", label: "Social Media Post", icon: "📱" },
  { value: "landing_page", label: "Landing Page", icon: "🌐" },
  { value: "ad_copy", label: "Ad Copy", icon: "📢" },
];

const MARKETING_ANGLES = [
  { value: "problem_solution", label: "Problem/Solution" },
  { value: "transformation", label: "Transformation" },
  { value: "scarcity", label: "Scarcity" },
  { value: "authority", label: "Authority" },
  { value: "social_proof", label: "Social Proof" },
  { value: "comparison", label: "Comparison" },
  { value: "story", label: "Story" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

interface ContentStudioTextTabProps {
  campaignId: number;
}

export function ContentStudioTextTab({ campaignId }: ContentStudioTextTabProps) {
  const [contentType, setContentType] = useState<ContentType>("article");
  const [marketingAngle, setMarketingAngle] = useState<MarketingAngle>("problem_solution");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  // Fetch content for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["content", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/content/campaign/${campaignId}`);
      return response.data;
    },
  });

  const contents = data?.contents || [];

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const response = await api.post("/api/content/generate", {
        campaign_id: campaignId,
        content_type: contentType,
        marketing_angle: marketingAngle,
        length,
      });

      setGeneratedContent(response.data);
      toast.success("Content generated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to generate content");
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
            Text Content Settings
          </h3>

          {/* Content Type */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {CONTENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marketing Angle */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Marketing Angle
            </label>
            <select
              value={marketingAngle}
              onChange={(e) => setMarketingAngle(e.target.value as MarketingAngle)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {MARKETING_ANGLES.map((angle) => (
                <option key={angle.value} value={angle.value}>
                  {angle.label}
                </option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              {LENGTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
          >
            {isGenerating ? "Generating..." : "Generate Text Content"}
          </button>
        </div>
      </div>

      {/* Generated Content / Library */}
      <div className="lg:col-span-2">
        {generatedContent ? (
          <div className="card rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Generated Content
              </h3>
              <button
                onClick={() => setGeneratedContent(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                Generate New
              </button>
            </div>
            <ContentCard content={generatedContent} />
          </div>
        ) : (
          <div>
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Content ({contents.length})
            </h3>
            {contents.length === 0 ? (
              <div className="card rounded-lg p-8 text-center">
                <p style={{ color: "var(--text-secondary)" }}>
                  No content generated yet. Configure settings and click "Generate".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contents.slice(0, 10).map((content: GeneratedContent) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
