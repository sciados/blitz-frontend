// app/library/page.tsx
// taken from Vercel rollback 4vifmpAax

"use client";

import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { ContentList } from "src/components/ContentList";
import { ContentRefinementModal } from "src/components/ContentRefinementModal";
import { ContentVariationsModal } from "src/components/ContentVariationsModal";
import { ContentViewModal } from "src/components/ContentViewModal";
import { UnifiedEditorModal } from "src/components/UnifiedEditorModal";
import { ConfirmationModal } from "src/components/ConfirmationModal";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { GeneratedContent, Campaign, GeneratedImage } from "src/lib/types";

const CONTENT_TYPES = [
  { value: "all", label: "All Types", icon: "📚" },
  { value: "article", label: "Articles", icon: "📝" },
  { value: "email", label: "Emails", icon: "📧" },
  { value: "email_sequence", label: "Email Sequences", icon: "📬" },
  { value: "video_script", label: "Video Scripts", icon: "🎬" },
  { value: "social_post", label: "Social Posts", icon: "📱" },
  { value: "landing_page", label: "Landing Pages", icon: "🌐" },
  { value: "ad_copy", label: "Ad Copy", icon: "📢" },
];

const COMPLIANCE_FILTERS = [
  { value: "all", label: "All Content", color: "" },
  { value: "compliant", label: "Compliant Only", color: "text-green-600" },
  { value: "warning", label: "Warnings", color: "text-yellow-600" },
  { value: "violation", label: "Violations", color: "text-red-600" },
];

export default function ContentLibraryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCampaignId = searchParams.get("campaign");

  const [filterCampaignId, setFilterCampaignId] = useState<number | null>(
    urlCampaignId ? Number(urlCampaignId) : null
  );
  const [filterContentType, setFilterContentType] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");

  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [showVariationsModal, setShowVariationsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContent, setSelectedContent] =
    useState<GeneratedContent | null>(null);
  const [allContent, setAllContent] = useState<GeneratedContent[]>([]);

  // Content Library Tab State
  const [activeLibraryTab, setActiveLibraryTab] = useState<"text" | "images">(
    "text"
  );
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);

  // Modal state for library image viewer
  const [selectedLibraryImage, setSelectedLibraryImage] =
    useState<GeneratedImage | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Unified editor state for library images
  const [showUnifiedEditor, setShowUnifiedEditor] = useState(false);

  // Confirmation modal state
  const [showDeleteContentConfirm, setShowDeleteContentConfirm] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // Fetch all content for the user
  const { refetch: refetchContent, isLoading } = useQuery({
    queryKey: ["all-content"],
    queryFn: async () => {
      // Fetch from all campaigns
      const { data: campaigns } = await api.get("/api/campaigns");
      const allContentPromises = campaigns.map((campaign: Campaign) =>
        api
          .get(`/api/content/campaign/${campaign.id}`)
          .then((res) => res.data)
          .catch(() => [])
      );
      const allContentArrays = await Promise.all(allContentPromises);
      const flatContent = allContentArrays.flat();
      setAllContent(flatContent);
      return flatContent;
    },
  });

  // Query to fetch images for the library
  const { refetch: refetchImages } = useQuery({
    queryKey: ["all-images"],
    queryFn: async () => {
      // Fetch from all campaigns
      const { data: campaigns } = await api.get("/api/campaigns");
      const allImagePromises = campaigns.map((campaign: Campaign) =>
        api
          .get(`/api/images/campaign/${campaign.id}`)
          .then((res) => res.data.images || [])
          .catch(() => [])
      );
      const allImageArrays = await Promise.all(allImagePromises);
      const flatImages = allImageArrays.flat();
      setAllImages(flatImages);
      return flatImages;
    },
    // Remove enabled condition so images load immediately with text content
  });

  // Refetch images when tab changes to images (for manual refresh if needed)
  useEffect(() => {
    if (activeLibraryTab === "images") {
      refetchImages();
    }
  }, [activeLibraryTab, refetchImages]);

  // Filter content based on selected filters
  const filteredContent = allContent.filter((content) => {
    if (filterCampaignId && content.campaign_id !== filterCampaignId)
      return false;
    if (
      filterContentType !== "all" &&
      content.content_type !== filterContentType
    )
      return false;
    if (
      filterCompliance === "compliant" &&
      content.compliance_status !== "compliant"
    )
      return false;
    if (
      filterCompliance === "warning" &&
      content.compliance_status !== "warning"
    )
      return false;
    if (
      filterCompliance === "violation" &&
      content.compliance_status !== "violation"
    )
      return false;
    return true;
  });

  // Filter images based on campaign
  const filteredImages = allImages.filter((image) => {
    if (filterCampaignId && image.campaign_id !== filterCampaignId)
      return false;
    return true;
  });

  // Group content by campaign and content type
  const groupedContent = filteredContent.reduce((acc, content) => {
    const key = `${content.campaign_id}-${content.content_type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(content);
    return acc;
  }, {} as Record<string, GeneratedContent[]>);

  const handleViewContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    setShowViewModal(true);
  };

  const handleEditContent = (content: GeneratedContent) => {
    setSelectedContent(content);
    setShowRefinementModal(true);
  };

  const handleCreateVariations = (content: GeneratedContent) => {
    setSelectedContent(content);
    setShowVariationsModal(true);
  };
  const handleGenerateVideo = (content: GeneratedContent) => {
    if (content.content_type !== "video_script") {
      toast.error("Video generation is only available for video scripts");
      return;
    }
    // Navigate to video generation page with campaign and script
    const campaignId = content.campaign_id;
    router.push(`/content/video?campaign=${campaignId}&script=${encodeURIComponent(content.content_data.text)}`);
  };

  const handleDeleteContent = async (contentId: number) => {
    setContentToDelete(contentId);
    setShowDeleteContentConfirm(true);
  };

  const confirmDeleteContent = async () => {
    if (!contentToDelete) return;

    try {
      await api.delete(`/api/content/${contentToDelete}`);
      toast.success("Content deleted successfully");
      refetchContent();
      setContentToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete content");
      setContentToDelete(null);
    }
  };

  // Image handlers
  const handleImageClick = (image: GeneratedImage, index: number) => {
    setSelectedLibraryImage(image);
    setCurrentImageIndex(index);
    setIsLibraryModalOpen(true);
  };

  function handlePreviousImage() {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedLibraryImage(filteredImages[newIndex]);
    }
  }

  function handleNextImage() {
    if (currentImageIndex < filteredImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedLibraryImage(filteredImages[newIndex]);
    }
  }

  async function handleDownloadImage(image: GeneratedImage) {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blitz-${image.image_type}-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (err) {
      toast.error("Failed to download image");
    }
  }

  // Check if an image is a seed/premium image (protected from deletion)
  // Seed images are premium/enhanced images that should not be accidentally deleted
  // They show a "Protected" or "Close" button instead of "Delete"
  const isSeedImage = (image: GeneratedImage) => {
    if (!image.metadata) {
      return false;
    }
    const isEnhanced = image.metadata.is_enhanced;
    return isEnhanced === true;
  };

  async function handleDeleteImage(imageId: number) {
    setImageToDelete(imageId);
    setShowDeleteImageConfirm(true);
  };

  async function confirmDeleteImage() {
    if (!imageToDelete) return;

    try {
      await api.delete(`/api/images/${imageToDelete}`);
      toast.success("Image deleted successfully");
      refetchImages();
      setIsLibraryModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete image");
    }
  }

  const handleContentRefined = (content: GeneratedContent) => {
    setShowRefinementModal(false);
    setSelectedContent(null);
    refetchContent();
  };

  const handleVariationCreated = (variations: GeneratedContent[]) => {
    setShowVariationsModal(false);
    setSelectedContent(null);
    refetchContent();
  };

  const complianceStats = {
    total: allContent.length,
    compliant: allContent.filter((c) => c.compliance_status === "compliant")
      .length,
    warning: allContent.filter((c) => c.compliance_status === "warning").length,
    violation: allContent.filter((c) => c.compliance_status === "violation")
      .length,
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
                Content Library
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Browse, manage, and refine all your generated content
              </p>
            </div>
            <button
              onClick={() => router.push("/content")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Generate New Content</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveLibraryTab("text")}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeLibraryTab === "text"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              📝 Text Content ({allContent.length})
            </button>
            <button
              onClick={() => setActiveLibraryTab("images")}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeLibraryTab === "images"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🖼️ Images ({allImages.length})
            </button>
          </div>

          {/* Tab-Specific Filters and Stats */}
          {activeLibraryTab === "text" ? (
            /* Text Content Filters */
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card rounded-lg p-4">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total Content
                  </div>
                  <div
                    className="text-2xl font-bold mt-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {complianceStats.total}
                  </div>
                </div>
                <div className="card rounded-lg p-4">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Compliant
                  </div>
                  <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                    {complianceStats.compliant}
                  </div>
                </div>
                <div className="card rounded-lg p-4">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Warnings
                  </div>
                  <div className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">
                    {complianceStats.warning}
                  </div>
                </div>
                <div className="card rounded-lg p-4">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Violations
                  </div>
                  <div className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                    {complianceStats.violation}
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="card rounded-lg p-6 mb-6">
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Campaign Filter */}
                  <div>
                    <CampaignSelector
                      selectedCampaignId={filterCampaignId}
                      onSelect={setFilterCampaignId}
                      label="Campaign"
                      placeholder="All Campaigns"
                      showAllOption={true}
                    />
                  </div>

                  {/* Content Type Filter */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Content Type
                    </label>
                    <select
                      value={filterContentType}
                      onChange={(e) => setFilterContentType(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
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

                  {/* Compliance Filter */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Compliance Status
                    </label>
                    <select
                      value={filterCompliance}
                      onChange={(e) => setFilterCompliance(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {COMPLIANCE_FILTERS.map((filter) => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Image Filters */
            <div className="card rounded-lg p-6 mb-6">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Filters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campaign Filter */}
                <div>
                  <CampaignSelector
                    selectedCampaignId={filterCampaignId}
                    onSelect={setFilterCampaignId}
                    label="Campaign"
                    placeholder="All Campaigns"
                    showAllOption={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeLibraryTab === "text" ? (
            /* Text Content */
            <>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Loading your content library...
                  </p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="card rounded-lg p-12 text-center">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 opacity-30"
                    style={{ color: "var(--text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {allContent.length === 0
                      ? "No Content Yet"
                      : "No Matching Content"}
                  </h3>
                  <p
                    className="text-sm max-w-md mx-auto mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {allContent.length === 0
                      ? "Start generating content from your campaigns to build your library."
                      : "Try adjusting your filters to see more content."}
                  </p>
                  {allContent.length === 0 && (
                    <button
                      onClick={() => router.push("/content")}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Generate Your First Content
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Showing {filteredContent.length} of {allContent.length}{" "}
                      total content pieces
                    </p>
                  </div>
                  <ContentList
                    contents={filteredContent}
                    onView={handleViewContent}
                    onEdit={handleEditContent}
                    onDelete={handleDeleteContent}
                  />
                </>
              )}
            </>
          ) : (
            /* Image Grid */
            <>
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="card rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleImageClick(image, index)}
                    >
                      {/* Image */}
                      <div className="relative bg-gray-100 dark:bg-gray-800 aspect-square">
                        <img
                          src={image.image_url}
                          alt={image.prompt}
                          className="w-full h-full object-cover"
                        />
                        {/* Premium Badge */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          PREMIUM
                        </div>
                        {/* Thumbnail Notice */}
                        <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          ⬇ THUMB
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {image.image_type}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {image.aspect_ratio}
                          </span>
                        </div>
                        <p
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {image.prompt}
                        </p>
                        <div
                          className="flex items-center justify-between text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span>{image.provider}</span>
                          <span>
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card rounded-lg p-12 text-center">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 opacity-30"
                    style={{ color: "var(--text-secondary)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Images Yet
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Generate images to see them here
                  </p>
                  <button
                    onClick={() => router.push("/content/images")}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                  >
                    Generate Images
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content View Modal */}
      <ContentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        content={selectedContent}
        onRefine={handleEditContent}
        onCreateVariations={handleCreateVariations}
        onGenerateVideo={handleGenerateVideo}
      />

      {/* Content Refinement Modal */}
      <ContentRefinementModal
        isOpen={showRefinementModal}
        onClose={() => setShowRefinementModal(false)}
        content={selectedContent}
        onRefined={handleContentRefined}
      />

      {/* Content Variations Modal */}
      <ContentVariationsModal
        isOpen={showVariationsModal}
        onClose={() => setShowVariationsModal(false)}
        content={selectedContent}
        onVariationCreated={handleVariationCreated}
      />

      {/* Library Image Viewer Modal */}
      {isLibraryModalOpen && selectedLibraryImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsLibraryModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Premium Image
                  </h2>
                  {filteredImages.length > 1 && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {currentImageIndex + 1} of {filteredImages.length}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsLibraryModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Image Display */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                <div
                  className={`max-h-[60vh] max-w-full mx-auto ${
                    selectedLibraryImage.aspect_ratio === "1:1"
                      ? "aspect-square"
                      : selectedLibraryImage.aspect_ratio === "16:9"
                      ? "aspect-video"
                      : selectedLibraryImage.aspect_ratio === "9:16"
                      ? "aspect-[9/16]"
                      : selectedLibraryImage.aspect_ratio === "4:3"
                      ? "aspect-[4/3]"
                      : selectedLibraryImage.aspect_ratio === "21:9"
                      ? "aspect-[21/9]"
                      : "aspect-square"
                  } flex items-center justify-center`}
                >
                  <img
                    src={selectedLibraryImage.image_url}
                    alt={selectedLibraryImage.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  PREMIUM
                </div>

                {/* Navigation Arrows */}
                {filteredImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    {currentImageIndex > 0 && (
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Previous image"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Next Button */}
                    {currentImageIndex < filteredImages.length - 1 && (
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Next image"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Image Details */}
              <div className="flex items-center justify-between mb-4">
                {/* <div
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p className="font-medium">
                    Provider: {selectedLibraryImage.provider} | Cost: ${(selectedLibraryImage.ai_generation_cost || 0).toFixed(4)}
                  </p>
                  <p className="text-xs mt-1">
                    Created: {new Date(selectedLibraryImage.created_at).toLocaleString()}
                  </p>
                </div> */}

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownloadImage(selectedLibraryImage)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => setShowUnifiedEditor(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Image</span>
                  </button>

                  {isSeedImage(selectedLibraryImage) ? (
                    <button
                      disabled
                      className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed flex items-center space-x-2"
                      title="Premium seed images are protected from deletion"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>Protected</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeleteImage(selectedLibraryImage.id)}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Prompt Display */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Prompt:
                </p>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {selectedLibraryImage.prompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Editor Modal for Library Images */}
      {selectedLibraryImage && (
        <UnifiedEditorModal
          isOpen={showUnifiedEditor}
          onClose={() => setShowUnifiedEditor(false)}
          sourceImage={selectedLibraryImage}
          campaignId={selectedLibraryImage.campaign_id}
          onSave={(image) => {
            toast.success("Image saved to library!");
            setShowUnifiedEditor(false);
            setIsLibraryModalOpen(false);
            refetchImages();
          }}
        />
      )}

      {/* Delete Content Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteContentConfirm}
        onClose={() => {
          setShowDeleteContentConfirm(false);
          setContentToDelete(null);
        }}
        onConfirm={confirmDeleteContent}
        title="Delete Content"
        message="Are you sure you want to delete this content? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />

      {/* Delete Image Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteImageConfirm}
        onClose={() => {
          setShowDeleteImageConfirm(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmDeleteImage}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />
    </AuthGate>
  );
}
