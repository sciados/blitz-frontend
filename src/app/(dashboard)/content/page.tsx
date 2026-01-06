"use client";

import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { ContentStudioTextTab } from "src/components/content-studio/ContentStudioTextTab";
import { ContentStudioImagesTab } from "src/components/content-studio/ContentStudioImagesTab";
import { ContentStudioVideoTab } from "src/components/content-studio/ContentStudioVideoTab";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export type ContentType = "text" | "images" | "video";

interface CampaignSelectorBarProps {
  campaignId: number | null;
  onSelectCampaign: (id: number | null) => void;
}

function CampaignSelectorBar({ campaignId, onSelectCampaign }: CampaignSelectorBarProps) {
  return (
    <div className="card rounded-lg p-6 mb-6">
      <h2
        className="text-xl font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Campaign Selection
      </h2>
      <CampaignSelector
        selectedCampaignId={campaignId}
        onSelect={(id) => {
          onSelectCampaign(id);
          if (id) {
            toast.success("Campaign selected!");
          }
        }}
        label="Campaign *"
        placeholder="Select a campaign..."
        showAllOption={false}
      />
      {campaignId && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <span className="font-semibold">✓ Campaign selected!</span>{" "}
            Your content will be generated using this campaign's intelligence data.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ContentStudio() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse URL parameters
  const urlCampaignId = searchParams.get("campaign");
  const urlType = (searchParams.get("type") as ContentType) || "text";
  const urlContentType = searchParams.get("contentType");
  const urlMarketingAngle = searchParams.get("marketingAngle");
  const urlDay = searchParams.get("day");
  const urlContext = searchParams.get("context");
  const urlQueue = searchParams.get("queue");
  const urlCustomPrompt = searchParams.get("custom_prompt");

  // State
  const [campaignId, setCampaignId] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  const [activeContentType, setActiveContentType] = useState<ContentType>(urlType);

  // Queue system for batch content generation
  const [contentQueue, setContentQueue] = useState<Array<{
    type: string;
    details: string;
  }>>(urlQueue ? JSON.parse(urlQueue) : []);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [generatedItems, setGeneratedItems] = useState<Set<number>>(new Set());

  // Pre-population data from calendar
  const [prePopulatedData, setPrePopulatedData] = useState<{
    contentType?: string;
    marketingAngle?: string;
    day?: number;
    context?: string;
    customPrompt?: string;
  } | null>(
    urlContentType || urlMarketingAngle || urlDay || urlContext || urlCustomPrompt
      ? {
          contentType: urlContentType || undefined,
          marketingAngle: urlMarketingAngle || undefined,
          day: urlDay ? Number(urlDay) : undefined,
          context: urlContext || undefined,
          customPrompt: urlCustomPrompt || undefined,
        }
      : null
  );

  // Get current queue item
  const currentQueueItem = contentQueue[currentQueueIndex];

  // Handle content generation completion
  const handleQueueItemGenerated = (index: number) => {
    setGeneratedItems(prev => new Set([...prev, index]));
  };

  // Move to next item in queue
  const handleNextInQueue = () => {
    if (currentQueueIndex < contentQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);

      // Update prePopulatedData with next item
      const nextItem = contentQueue[nextIndex];
      setPrePopulatedData({
        contentType: nextItem.type,
        marketingAngle: urlMarketingAngle || undefined,
        day: urlDay ? Number(urlDay) : undefined,
        context: urlContext || undefined,
      });

      // Update active content type based on next item
      if (nextItem.type === "Image") {
        setActiveContentType("images");
      } else if (nextItem.type === "Video") {
        setActiveContentType("video");
      } else {
        setActiveContentType("text");
      }

      toast.success(`Moved to item ${nextIndex + 1} of ${contentQueue.length}`);
    }
  };

  // Check if queue is complete
  const isQueueComplete = generatedItems.size === contentQueue.length && contentQueue.length > 0;

  // Handle return to calendar with completion status
  const handleReturnToCalendar = () => {
    const params = new URLSearchParams();
    if (campaignId) params.set("campaign", campaignId.toString());
    if (urlDay) params.set("completedDay", urlDay);
    router.push(`/marketing-calendar?${params.toString()}`);
  };

  // Restore last campaign from localStorage on mount
  useEffect(() => {
    const lastCampaignId = localStorage.getItem("lastSelectedCampaign");
    if (!campaignId && lastCampaignId) {
      setCampaignId(Number(lastCampaignId));
      // Update URL with restored campaign
      const params = new URLSearchParams(searchParams.toString());
      params.set("campaign", lastCampaignId);
      router.replace(`/content?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Update localStorage when campaign changes
  useEffect(() => {
    if (campaignId) {
      localStorage.setItem("lastSelectedCampaign", campaignId.toString());
    }
  }, [campaignId]);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (campaignId) params.set("campaign", campaignId.toString());
    params.set("type", activeContentType);
    router.replace(`/content?${params.toString()}`, { scroll: false });
  }, [campaignId, activeContentType]);

  const handleContentTypeChange = (type: ContentType) => {
    setActiveContentType(type);
  };

  const handleSelectCampaign = (id: number | null) => {
    setCampaignId(id);
  };

  return (
    <AuthGate requiredRole="user">
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Content Studio
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Generate and manage all your campaign content in one place
              </p>
            </div>
            {campaignId && (
              <div className="text-right">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Active Campaign
                </p>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  ID: {campaignId}
                </p>
              </div>
            )}
          </div>

          {/* Campaign Selector */}
          <CampaignSelectorBar
            campaignId={campaignId}
            onSelectCampaign={handleSelectCampaign}
          />

          {/* Calendar Context Banner */}
          {prePopulatedData && (
            <div className="card p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📅</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                    Generating Content from Marketing Calendar
                  </h3>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    {prePopulatedData.day && (
                      <p>
                        <span className="font-medium">Day {prePopulatedData.day}</span>
                        {prePopulatedData.marketingAngle && (
                          <span> • {prePopulatedData.marketingAngle.replace(/_/g, " ")} Marketing Angle</span>
                        )}
                      </p>
                    )}
                    {prePopulatedData.contentType && (
                      <p>
                        <span className="font-medium">Content Type:</span>{" "}
                        {prePopulatedData.contentType.replace(/_/g, " ")}
                      </p>
                    )}
                    {prePopulatedData.context && (
                      <p>
                        <span className="font-medium">Context:</span> {prePopulatedData.context}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setPrePopulatedData(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Queue Progress Indicator */}
          {contentQueue.length > 0 && (
            <div className="card p-4 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        Batch Content Generation
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Item {currentQueueIndex + 1} of {contentQueue.length} • {generatedItems.size} completed
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: "var(--text-secondary)" }}>Progress</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {Math.round((generatedItems.size / contentQueue.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(generatedItems.size / contentQueue.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Current Item Details */}
                  {currentQueueItem && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            Current: {currentQueueItem.type}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {currentQueueItem.details}
                          </p>
                        </div>
                        {generatedItems.has(currentQueueIndex) && (
                          <div className="text-green-600 dark:text-green-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Completion Message */}
                  {isQueueComplete && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="text-green-600 dark:text-green-400 text-xl">✅</div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Day completed! All {contentQueue.length} content pieces generated.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Queue Navigation */}
                <div className="ml-4 flex flex-col space-y-2">
                  {currentQueueIndex < contentQueue.length - 1 && (
                    <button
                      onClick={handleNextInQueue}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center space-x-2"
                    >
                      <span>Next Item</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  {isQueueComplete && (
                    <button
                      onClick={handleReturnToCalendar}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center space-x-2"
                    >
                      <span>Back to Calendar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="card rounded-lg overflow-hidden">
            {/* Header with Library Link */}
            <div className="border-b flex items-center justify-between px-6 py-4" style={{ borderColor: "var(--card-border)" }}>
              <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Generate Content
              </h2>
              <a
                href="/library"
                className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Content Library
              </a>
            </div>

            {/* Content Type Tabs */}
            <div className="border-b" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex space-x-1 p-2">
                <button
                  onClick={() => handleContentTypeChange("text")}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    activeContentType === "text"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  style={{
                    color: activeContentType === "text" ? "white" : "var(--text-primary)",
                  }}
                >
                  <span>✍️</span>
                  <span>Text</span>
                </button>
                <button
                  onClick={() => handleContentTypeChange("images")}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    activeContentType === "images"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  style={{
                    color: activeContentType === "images" ? "white" : "var(--text-primary)",
                  }}
                >
                  <span>🖼️</span>
                  <span>Images</span>
                </button>
                <button
                  onClick={() => handleContentTypeChange("video")}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-2 ${
                    activeContentType === "video"
                      ? "bg-red-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  style={{
                    color: activeContentType === "video" ? "white" : "var(--text-primary)",
                  }}
                >
                  <span>🎬</span>
                  <span>Video</span>
                </button>
              </div>
            </div>

            {/* Content Type Panels */}
            <div className="p-6">
              {!campaignId ? (
                <div className="text-center py-12">
                  <p style={{ color: "var(--text-secondary)" }}>
                    Please select a campaign above to generate content
                  </p>
                </div>
              ) : activeContentType === "text" ? (
                <ContentStudioTextTab
                  campaignId={campaignId}
                  prePopulatedData={prePopulatedData}
                  onContentGenerated={() => handleQueueItemGenerated(currentQueueIndex)}
                />
              ) : activeContentType === "images" ? (
                <ContentStudioImagesTab
                  campaignId={campaignId}
                  prePopulatedData={prePopulatedData}
                  onContentGenerated={() => handleQueueItemGenerated(currentQueueIndex)}
                />
              ) : (
                <ContentStudioVideoTab
                  campaignId={campaignId}
                  prePopulatedData={prePopulatedData}
                  onContentGenerated={() => handleQueueItemGenerated(currentQueueIndex)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
