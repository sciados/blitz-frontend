"use client";

import { useState, useEffect } from "react";
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

// Settings that change based on content type
const CONTENT_SETTINGS: Record<ContentType, {
  marketingAngles: { value: MarketingAngle; label: string }[];
  lengthOptions: { value: string; label: string }[];
}> = {
  article: {
    marketingAngles: [
      { value: "problem_solution", label: "Problem/Solution" },
      { value: "transformation", label: "Transformation" },
      { value: "authority", label: "Authority" },
      { value: "social_proof", label: "Social Proof" },
      { value: "story", label: "Story" },
    ],
    lengthOptions: [
      { value: "short", label: "500-800 words" },
      { value: "medium", label: "800-1500 words" },
      { value: "long", label: "1500-2500 words" },
    ],
  },
  email: {
    marketingAngles: [
      { value: "problem_solution", label: "Problem/Solution" },
      { value: "scarcity", label: "Scarcity" },
      { value: "story", label: "Story" },
    ],
    lengthOptions: [
      { value: "short", label: "Short (50-150 words)" },
      { value: "medium", label: "Medium (150-300 words)" },
    ],
  },
  email_sequence: {
    marketingAngles: [
      { value: "problem_solution", label: "Problem/Solution" },
      { value: "transformation", label: "Transformation" },
      { value: "social_proof", label: "Social Proof" },
    ],
    lengthOptions: [
      { value: "short", label: "3-5 emails" },
      { value: "medium", label: "5-7 emails" },
      { value: "long", label: "7-10 emails" },
    ],
  },
  video_script: {
    marketingAngles: [
      { value: "problem_solution", label: "Problem/Solution" },
      { value: "transformation", label: "Transformation" },
      { value: "story", label: "Story" },
    ],
    lengthOptions: [
      { value: "5", label: "5 seconds" },
      { value: "10", label: "10 seconds" },
    ],
  },
  social_post: {
    marketingAngles: [
      { value: "scarcity", label: "Scarcity" },
      { value: "social_proof", label: "Social Proof" },
    ],
    lengthOptions: [
      { value: "short", label: "Short (1-2 sentences)" },
      { value: "medium", label: "Medium (2-3 sentences)" },
    ],
  },
  landing_page: {
    marketingAngles: [
      { value: "problem_solution", label: "Problem/Solution" },
      { value: "transformation", label: "Transformation" },
      { value: "authority", label: "Authority" },
      { value: "social_proof", label: "Social Proof" },
      { value: "comparison", label: "Comparison" },
    ],
    lengthOptions: [
      { value: "short", label: "Short (5-7 sections)" },
      { value: "medium", label: "Medium (7-10 sections)" },
      { value: "long", label: "Long (10-15 sections)" },
    ],
  },
  ad_copy: {
    marketingAngles: [
      { value: "scarcity", label: "Scarcity" },
      { value: "social_proof", label: "Social Proof" },
      { value: "comparison", label: "Comparison" },
    ],
    lengthOptions: [
      { value: "short", label: "Short (25-50 words)" },
      { value: "medium", label: "Medium (50-100 words)" },
    ],
  },
};

interface ContentStudioTextTabProps {
  campaignId: number;
  prePopulatedData?: {
    contentType?: string;
    marketingAngle?: string;
    day?: number;
    context?: string;
  } | null;
  onContentGenerated?: () => void;
}

export function ContentStudioTextTab({ campaignId, prePopulatedData, onContentGenerated }: ContentStudioTextTabProps) {
  const [contentType, setContentType] = useState<ContentType>("article");
  const [marketingAngle, setMarketingAngle] = useState<MarketingAngle>("problem_solution");
  const [length, setLength] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
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

  // Get current settings based on content type
  const currentSettings = CONTENT_SETTINGS[contentType];

  // Reset settings when content type changes
  useEffect(() => {
    const settings = CONTENT_SETTINGS[contentType];
    // Reset to first available option for each setting
    setMarketingAngle(settings.marketingAngles[0]?.value || "problem_solution");
    setLength(settings.lengthOptions[0]?.value || "medium");
  }, [contentType]);

  // Apply pre-populated data from calendar
  useEffect(() => {
    if (!prePopulatedData) return;

    // Map content type
    if (prePopulatedData.contentType) {
      const contentTypeMap: Record<string, ContentType> = {
        article: "article",
        email: "email",
        email_sequence: "email_sequence",
        video_script: "video_script",
        social_post: "social_post",
        landing_page: "landing_page",
        ad_copy: "ad_copy",
      };
      const mappedType = contentTypeMap[prePopulatedData.contentType];
      if (mappedType && mappedType !== contentType) {
        setContentType(mappedType);
      }
    }

    // Map marketing angle
    if (prePopulatedData.marketingAngle) {
      const angleMap: Record<string, MarketingAngle> = {
        problem_solution: "problem_solution",
        transformation: "transformation",
        scarcity: "scarcity",
        authority: "authority",
        social_proof: "social_proof",
        comparison: "comparison",
        story: "story",
      };
      const mappedAngle = angleMap[prePopulatedData.marketingAngle];
      if (mappedAngle && mappedAngle !== marketingAngle) {
        setMarketingAngle(mappedAngle);
      }
    }
  }, [prePopulatedData]);

  // Fetch content for this campaign
  const { data, refetch } = useQuery({
    queryKey: ["content", campaignId],
    queryFn: async () => {
      const response = await api.get(`/api/content/campaign/${campaignId}`);
      return response.data;
    },
  });

  const contents = data?.contents || [];

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
      const response = await api.post("/api/content/generate", {
        campaign_id: campaignId,
        content_type: contentType,
        marketing_angle: marketingAngle,
        length,
        keywords: selectedKeywords,
        // Include calendar context if available
        context: prePopulatedData?.context,
        day: prePopulatedData?.day,
      });

      setGeneratedContent(response.data);
      toast.success("Content generated successfully!");
      refetch();

      // Notify parent component that content was generated (for queue tracking)
      if (onContentGenerated) {
        onContentGenerated();
      }
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
              {currentSettings.marketingAngles.map((angle) => (
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
              {currentSettings.lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                {keywordsData.ingredients && keywordsData.ingredients.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Ingredients
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {keywordsData.ingredients.map((ingredient: string) => (
                        <button
                          key={ingredient}
                          onClick={() => {
                            setSelectedKeywords((prev) => ({
                              ...prev,
                              ingredients: prev.ingredients.includes(ingredient)
                                ? prev.ingredients.filter((i) => i !== ingredient)
                                : [...prev.ingredients, ingredient],
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            selectedKeywords.ingredients.includes(ingredient)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                          }`}
                        >
                          {ingredient}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features - Disabled for Video Scripts */}
                {keywordsData.features && keywordsData.features.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-1 flex items-center" style={{ color: contentType === "video_script" ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      Features
                      {contentType === "video_script" && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700" style={{ color: "var(--text-secondary)" }}>
                          Disabled for Video Scripts
                        </span>
                      )}
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
                          disabled={contentType === "video_script"}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            contentType === "video_script"
                              ? "cursor-not-allowed opacity-50"
                              : selectedKeywords.features.includes(feature)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                          }`}
                          title={contentType === "video_script" ? "Features are disabled for video scripts" : ""}
                        >
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits - Disabled for Video Scripts */}
                {keywordsData.benefits && keywordsData.benefits.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-1 flex items-center" style={{ color: contentType === "video_script" ? "var(--text-secondary)" : "var(--text-primary)" }}>
                      Benefits
                      {contentType === "video_script" && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700" style={{ color: "var(--text-secondary)" }}>
                          Disabled for Video Scripts
                        </span>
                      )}
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
                          disabled={contentType === "video_script"}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            contentType === "video_script"
                              ? "cursor-not-allowed opacity-50"
                              : selectedKeywords.benefits.includes(benefit)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
                          }`}
                          title={contentType === "video_script" ? "Benefits are disabled for video scripts" : ""}
                        >
                          {benefit}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pain Points */}
                {keywordsData.pain_points && keywordsData.pain_points.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
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
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500"
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
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    No keywords available. Compile campaign intelligence to get keyword suggestions.
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
