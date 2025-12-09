"use client";

import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { ContentStudioTextTab } from "src/components/content-studio/ContentStudioTextTab";
import { ContentStudioImagesTab } from "src/components/content-studio/ContentStudioImagesTab";
import { ContentStudioVideoTab } from "src/components/content-studio/ContentStudioVideoTab";
import { ContentStudioLibraryTab } from "src/components/content-studio/ContentStudioLibraryTab";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export type TabType = "generate" | "library";
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
  const urlTab = (searchParams.get("tab") as TabType) || "generate";
  const urlType = (searchParams.get("type") as ContentType) || "text";

  // State
  const [campaignId, setCampaignId] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  const [activeTab, setActiveTab] = useState<TabType>(urlTab);
  const [activeContentType, setActiveContentType] = useState<ContentType>(urlType);

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
    params.set("tab", activeTab);
    params.set("type", activeContentType);
    router.replace(`/content?${params.toString()}`, { scroll: false });
  }, [campaignId, activeTab, activeContentType]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleContentTypeChange = (type: ContentType) => {
    setActiveContentType(type);
  };

  const handleSelectCampaign = (id: number | null) => {
    setCampaignId(id);
  };

  const handleGenerateFromLibrary = (type: ContentType) => {
    setActiveTab("generate");
    setActiveContentType(type);
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

          {/* Main Content */}
          <div className="card rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex">
                <button
                  onClick={() => handleTabChange("generate")}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === "generate"
                      ? "border-b-2 border-blue-600"
                      : ""
                  }`}
                  style={{
                    color: activeTab === "generate"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  Generate Content
                </button>
                <button
                  onClick={() => handleTabChange("library")}
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === "library"
                      ? "border-b-2 border-blue-600"
                      : ""
                  }`}
                  style={{
                    color: activeTab === "library"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  Content Library
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "generate" ? (
              <div>
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
                    <ContentStudioTextTab campaignId={campaignId} />
                  ) : activeContentType === "images" ? (
                    <ContentStudioImagesTab campaignId={campaignId} />
                  ) : (
                    <ContentStudioVideoTab campaignId={campaignId} />
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <ContentStudioLibraryTab
                  campaignId={campaignId}
                  onGenerateFromContent={handleGenerateFromLibrary}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
