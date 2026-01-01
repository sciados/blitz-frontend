// app/library/page.tsx
// taken from Vercel rollback 4vifmpAax

"use client";

import { AuthGate } from "src/components/AuthGate";
import { CampaignSelector } from "src/components/CampaignSelector";
import { ContentList } from "src/components/ContentList";
import { ContentRefinementModal } from "src/components/ContentRefinementModal";
import { ContentVariationsModal } from "src/components/ContentVariationsModal";
import { ContentViewModal } from "src/components/ContentViewModal";
import { ImageVariationsModal } from "src/components/ImageVariationsModal";
import { FolderSelectorModal } from "src/components/FolderSelectorModal";
import { UnifiedEditorModal } from "src/components/UnifiedEditorModal";
import { ConfirmationModal } from "src/components/ConfirmationModal";
import { VideoEditorModal } from "src/components/VideoEditorModal";
import { BatchProcessingModal } from "src/components/image-editor/BatchProcessingModal";
import { ImageOptimizer } from "src/components/image-editor/ImageOptimizer";
import { BatchImageOptimizer } from "src/components/image-editor/BatchImageOptimizer";
import { ImageFilters } from "src/components/image-editor/ImageFilters";
import { BatchFilters } from "src/components/image-editor/BatchFilters";
import { BatchBackgroundRemoval } from "src/components/image-editor/BatchBackgroundRemoval";
import { LandingPageBuilder } from "src/components/image-editor/LandingPageBuilder";
import { getProxiedImageUrl } from "src/utils/imageProxy";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "src/lib/appClient";
import { getRoleFromToken } from "src/lib/auth";
import { toast } from "sonner";
import {
  GeneratedContent,
  Campaign,
  GeneratedImage,
  LibraryImage,
} from "src/lib/types";

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

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      return "";
    }

    // If already a proxy URL or API route, return as-is
    if (
      imageUrl.startsWith("/api/") ||
      imageUrl.includes("/api/images/proxy")
    ) {
      return imageUrl;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    let finalApiUrl = apiBaseUrl;

    // If no API base URL configured, try to infer from current domain
    if (!finalApiUrl && typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "blitz.ws") {
        finalApiUrl = "https://api.blitz.ws";
      } else if (
        hostname.includes("localhost") ||
        hostname.includes("127.0.0.1")
      ) {
        finalApiUrl = "http://localhost:8000";
      }
    }

    // If still no API base URL, log warning and return original
    if (!finalApiUrl) {
      console.warn(
        "❌ NEXT_PUBLIC_API_BASE_URL not configured and cannot infer API URL, images may have CORS issues"
      );
      console.warn(
        "Current hostname:",
        typeof window !== "undefined" ? window.location.hostname : "server"
      );
      console.warn("Returning original URL:", imageUrl);
      return imageUrl;
    }

    const proxyUrl = `${finalApiUrl}/api/images/proxy?url=${encodeURIComponent(
      imageUrl
    )}`;

    return proxyUrl;
  };

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

  // Image Variations State
  const [showImageVariationsModal, setShowImageVariationsModal] =
    useState(false);
  const [selectedImageForVariations, setSelectedImageForVariations] =
    useState<LibraryImage | null>(null);

  // Image Management State
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [imageToShare, setImageToShare] = useState<LibraryImage | null>(null);

  // Video Viewer State
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoToShare, setVideoToShare] = useState<any | null>(null);

  // Content Library Tab State
  const [activeLibraryTab, setActiveLibraryTab] = useState<
    "text" | "images" | "shared-images" | "videos" | "landing-pages"
  >("text");
  const [imageFilter, setImageFilter] = useState<
    | "all"
    | "original"
    | "filters"
    | "resize"
    | "overlays"
    | "inpaint"
    | "erase"
    | "transparent"
    | "lineage"
    | "collage"
    | "template"
    | "frame"
    | "background"
    | "landing_page"
  >("all");
  const [videoFilter, setVideoFilter] = useState<
    "all" | "generated" | "overlays"
  >("all");
  const [allImages, setAllImages] = useState<GeneratedImage[]>([]);
  const [allEditedImages, setAllEditedImages] = useState<LibraryImage[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [stockImages, setStockImages] = useState<any[]>([]);

  // Shared images folder filter
  const [sharedImageFolderFilter, setSharedImageFolderFilter] = useState<
    "all" | "backgrounds" | "stock-images" | "overlays" | "frames" | "icons" | "templates"
  >("all");

  // Campaign selector modal for shared images
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);
  const [selectedSharedImage, setSelectedSharedImage] = useState<any>(null);
  const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<string>("");

  // Admin batch selection state for shared images
  const [selectedSharedImages, setSelectedSharedImages] = useState<Set<string>>(new Set());
  const [showAddSharedImageModal, setShowAddSharedImageModal] = useState(false);

  // Campaign media upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCampaignId, setUploadCampaignId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Read tab from URL params (e.g., /library?tab=images)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "images" ||
      tabParam === "shared-images" ||
      tabParam === "videos" ||
      tabParam === "text" ||
      tabParam === "landing-pages"
    ) {
      setActiveLibraryTab(tabParam);
    }
  }, [searchParams]);

  // Modal state for library image viewer
  const [selectedLibraryImage, setSelectedLibraryImage] =
    useState<LibraryImage | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Unified editor state for library images
  const [showUnifiedEditor, setShowUnifiedEditor] = useState(false);

  // Video Editor Modal state
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const [videoEditorUrl, setVideoEditorUrl] = useState<string>("");
  const [videoEditorScript, setVideoEditorScript] = useState<string>("");
  const [videoEditorCampaignId, setVideoEditorCampaignId] = useState<number>(0);

  // Thumbnail Selection Modal state
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [thumbnailOptions, setThumbnailOptions] = useState<string[]>([]);
  const [selectedVideoForThumbnail, setSelectedVideoForThumbnail] =
    useState<any>(null);
  const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
  const [videoDurationForThumbnail, setVideoDurationForThumbnail] =
    useState<number>(0);

  // Confirmation modal state
  const [showDeleteContentConfirm, setShowDeleteContentConfirm] =
    useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const [showDeleteVideoConfirm, setShowDeleteVideoConfirm] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [showBatchDeleteSharedImagesConfirm, setShowBatchDeleteSharedImagesConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [batchDeleteCount, setBatchDeleteCount] = useState(0);

  // Batch Processing state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  const [batchCampaignId, setBatchCampaignId] = useState<number | null>(null);

  // Image Optimizer state
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizerImageUrl, setOptimizerImageUrl] = useState<string>("");
  const [optimizerImageName, setOptimizerImageName] = useState<string>("");

  // Batch Optimizer state
  const [showBatchOptimizer, setShowBatchOptimizer] = useState(false);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filtersImageUrl, setFiltersImageUrl] = useState<string>("");
  const [filtersImageName, setFiltersImageName] = useState<string>("");

  // Batch Filters state
  const [showBatchFilters, setShowBatchFilters] = useState(false);

  // Batch Background Removal state
  const [showBatchBgRemoval, setShowBatchBgRemoval] = useState(false);

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

  // Query to fetch edited images from image editor
  const { refetch: refetchEditedImages, isLoading: isLoadingEdited } = useQuery(
    {
      queryKey: ["all-edited-images"],
      queryFn: async () => {
        try {
          // Fetch from all campaigns
          const { data: campaigns } = await api.get("/api/campaigns");

          const allEditedPromises = campaigns.map(
            async (campaign: Campaign) => {
              try {
                const res = await api.get(
                  `/api/image-editor/history/${campaign.id}`
                );

                // Transform the data to match the expected format
                const edits = res.data.edits || [];

                const mappedEdits = edits
                  .filter((edit: any) => edit.success && edit.edited_image_path)
                  .map((edit: any) => {
                    // Use the proxy endpoint for edited images since /edited/ folder requires authentication
                    // The proxy endpoint has R2 credentials and can fetch private files
                    // Need to use full URL with domain to avoid browser encoding issues
                    const r2PublicUrl =
                      "https://pub-c0ddba9f039845bda33be436955187cb.r2.dev";
                    const fullR2Url = `${r2PublicUrl}/${edit.edited_image_path}`;
                    const apiBaseUrl =
                      process.env.NEXT_PUBLIC_API_BASE_URL ||
                      "https://blitzed.up.railway.app";
                    const imageUrl = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(
                      fullR2Url
                    )}`;

                    // Map operation_type to the correct edit_tool value
                    // This must match what the badge display shows
                    const operationTypeMap: Record<string, string> = {
                      edited_text_overlay: "overlay",
                      edited_image_overlay: "overlay",
                      edited_layers: "overlay",
                      edited_filters: "filters",
                      edited_resize: "resize",
                      edited_inpaint: "inpaint",
                      inpainting: "inpaint", // Backend uses "inpainting"
                      edited_erase: "erase",
                      erase: "erase", // Backend uses "erase"
                      background_removal: "transparent",
                      background_add: "background", // Background add tool saves as "background_add"
                      landing_page: "landing_page", // Landing page builder saves as "landing_page"
                      collage: "collage", // Backend uses "collage"
                      template: "template", // Template tool saves as "template"
                      frame: "frame", // Frame tool saves as "frame"
                    };

                    const editTool =
                      operationTypeMap[edit.operation_type] ||
                      edit.operation_type.replace("edited_", "");

                    // Determine if this is an overlay operation
                    const isOverlayOperation =
                      edit.operation_type === "edited_text_overlay" ||
                      edit.operation_type === "edited_image_overlay" ||
                      edit.operation_type === "edited_layers";

                    return {
                      id: edit.id,
                      campaign_id: edit.campaign_id,
                      image_url: imageUrl,
                      image_type:
                        edit.operation_type === "background_removal"
                          ? "transparent"
                          : `edited_${edit.operation_type}`,
                      prompt:
                        edit.operation_params?.prompt ||
                        edit.operation_params?.search_prompt ||
                        "Edited Image",
                      provider: "Stability AI",
                      aspect_ratio: "original",
                      // Include transparency and lineage tracking
                      has_transparency: edit.has_transparency || false,
                      parent_image_id: edit.parent_image_id || null,
                      metadata: {
                        is_edited: true,
                        edit_tool: editTool,
                        operation_type: edit.operation_type,
                        original_image_path: edit.original_image_path,
                        r2_url: fullR2Url, // Store the actual R2 URL for editing
                        text_overlay:
                          edit.operation_type === "edited_text_overlay",
                        image_overlay:
                          isOverlayOperation &&
                          edit.operation_type !== "edited_text_overlay",
                      },
                      created_at: edit.created_at,
                    };
                  });

                return mappedEdits;
              } catch (error: any) {
                console.error(
                  `Error fetching edits for campaign ${campaign.id}:`,
                  error
                );
                return [];
              }
            }
          );

          const allEditedArrays = await Promise.all(allEditedPromises);
          const flatEdited = allEditedArrays.flat();

          // Deduplicate by image_url, keeping only the most recent for each unique image
          const uniqueEdits = flatEdited.reduce((acc: any[], current) => {
            const existingIndex = acc.findIndex(
              (item) => item.image_url === current.image_url
            );
            if (existingIndex === -1) {
              acc.push(current);
            } else {
              // Keep the more recent one
              if (
                new Date(current.created_at) >
                new Date(acc[existingIndex].created_at)
              ) {
                acc[existingIndex] = current;
              }
            }
            return acc;
          }, []);

          setAllEditedImages(uniqueEdits);
          return uniqueEdits;
        } catch (error) {
          console.error("Error in refetchEditedImages:", error);
          return [];
        }
      },
    }
  );

  // Query to fetch videos for the library - ONLY poll when videos tab is active
  const { refetch: refetchVideos } = useQuery({
    queryKey: ["all-videos"],
    queryFn: async () => {
      const { data } = await api.get("/api/video/library");
      setAllVideos(data.videos || []);
      return data.videos || [];
    },
    // Only poll when videos tab is active
    refetchInterval: activeLibraryTab === "videos" ? 5000 : false,
  });

  // Query to fetch stock images for the library
  const { refetch: refetchStockImages } = useQuery({
    queryKey: ["stock-images"],
    queryFn: async () => {
      console.log("Fetching stock images - active tab:", activeLibraryTab);
      const { data } = await api.get("/api/images/stock");
      setStockImages(data.images || []);
      return data.images || [];
    },
  });

  // Query campaigns for campaign selector modal
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await api.get("/api/campaigns");
      return data || [];
    },
  });

  // Debug log for tab changes
  useEffect(() => {}, [activeLibraryTab]);

  // Refetch images when tab changes to images (for manual refresh if needed)
  useEffect(() => {
    if (activeLibraryTab === "images") {
      refetchImages();
      refetchEditedImages();
    }
  }, [activeLibraryTab, refetchImages, refetchEditedImages]);

  // Refetch videos when tab changes to videos (for manual refresh if needed)
  useEffect(() => {
    if (activeLibraryTab === "videos") {
      refetchVideos();
    }
  }, [activeLibraryTab, refetchVideos]);

  // Refetch stock images when tab changes to shared-images (for manual refresh if needed)
  useEffect(() => {
    if (activeLibraryTab === "shared-images") {
      refetchStockImages();
    }
  }, [activeLibraryTab, refetchStockImages]);

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

  // Use allImages directly - it already includes both generated_images and image_edits from the backend
  // The backend /api/images/campaign/{id} endpoint now returns both tables combined
  // No need to add allEditedImages separately as that causes duplicates
  const combinedImages: LibraryImage[] = allImages.map((img) => ({
    ...img,
    // Determine source based on prompt - image_edits have "Edited:" prefix in prompt
    source: (img.prompt?.startsWith("Edited:") || img.has_transparency) ? "edited" as const : "original" as const
  }));

  // Filter images based on campaign and filter type
  const filteredImages = combinedImages.filter((image) => {
    // Campaign filter check
    if (filterCampaignId && image.campaign_id !== filterCampaignId)
      return false;
    // Apply image type filter
    if (imageFilter === "original" && image.metadata?.text_overlay === true)
      return false;
    if (imageFilter === "original" && image.metadata?.image_overlay === true)
      return false;
    if (imageFilter === "original" && image.metadata?.edit_tool) return false;
    if (imageFilter === "filters" && image.metadata?.edit_tool !== "filters")
      return false;
    if (imageFilter === "resize" && image.metadata?.edit_tool !== "resize")
      return false;
    if (imageFilter === "overlays") {
      const hasTextOverlay = image.metadata?.text_overlay === true;
      const hasImageOverlay = image.metadata?.image_overlay === true;
      const hasEditToolOverlay = image.metadata?.edit_tool === "overlay";
      if (!hasTextOverlay && !hasImageOverlay && !hasEditToolOverlay)
        return false;
    }
    if (imageFilter === "inpaint" && image.metadata?.edit_tool !== "inpaint")
      return false;
    if (imageFilter === "erase" && image.metadata?.edit_tool !== "erase")
      return false;
    if (imageFilter === "transparent" && image.has_transparency !== true) {
      return false;
    }
    if (
      imageFilter === "lineage" &&
      (image.parent_image_id === null || image.parent_image_id === undefined)
    )
      return false;
    if (imageFilter === "collage" && image.metadata?.edit_tool !== "collage")
      return false;
    if (imageFilter === "template" && image.metadata?.edit_tool !== "template")
      return false;
    if (
      imageFilter === "background" &&
      image.metadata?.edit_tool !== "background"
    ) {
      return false;
    }
    if (imageFilter === "frame" && image.metadata?.edit_tool !== "frame")
      return false;
    return true;
  });

  // Sort images: Premium (is_enhanced) first, then by newest
  const sortedImages = filteredImages.sort((a, b) => {
    // Premium images first
    const aIsPremium = a.metadata?.is_enhanced === true;
    const bIsPremium = b.metadata?.is_enhanced === true;

    if (aIsPremium && !bIsPremium) return -1;
    if (!aIsPremium && bIsPremium) return 1;

    // Then sort by newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter videos based on campaign
  const filteredVideos = allVideos.filter((video) => {
    if (filterCampaignId && video.campaign_id !== filterCampaignId)
      return false;
    // Apply video type filter
    if (videoFilter === "generated" && video.generation_mode === "text_overlay")
      return false;
    if (videoFilter === "overlays" && video.generation_mode !== "text_overlay")
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

  const handleCreateImageVariations = (image: LibraryImage) => {
    setSelectedImageForVariations(image);
    setShowImageVariationsModal(true);
  };

  const handleImageVariationCreated = (variations: GeneratedImage[]) => {
    // Refresh the images list to show new variations
    refetchImages();
    refetchEditedImages();
    toast.success(`Created ${variations.length} variations successfully!`);
  };

  // Image Management Functions
  const handleMoveToStock = () => {
    setShowFolderSelector(true);
  };

  const handleShareImage = (image: LibraryImage) => {
    setImageToShare(image);
    setShowFolderSelector(true);
  };

  // Video Management Functions
  const handleOpenVideoViewer = (video: any) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleShareVideo = (video: any) => {
    setVideoToShare(video);
    setShowFolderSelector(true);
  };

  const handleMoveVideos = async (destinationPath: string) => {
    try {
      // For now, show a message that video sharing is coming soon
      // TODO: Implement video sharing backend endpoint
      toast.info(
        "Video sharing to Stock folders is coming soon! Please check back later."
      );
      setShowFolderSelector(false);
      setVideoToShare(null);
    } catch (error) {
      console.error("Failed to move videos:", error);
      toast.error("Failed to move videos");
    }
  };

  const handleMoveImages = async (destinationPath: string) => {
    try {
      let imageIds: number[] = [];

      // If sharing a single image from viewer
      if (imageToShare) {
        imageIds = [imageToShare.id];
      } else {
        // Moving multiple selected images

        for (const imageUrl of selectedImageUrls) {
          const image = sortedImages.find((img) => img.image_url === imageUrl);
          if (image && image.id) {
            imageIds.push(image.id);
          }
        }
      }

      const { data } = await api.post("/api/images/move", {
        image_ids: imageIds,
        destination_path: destinationPath,
      });

      toast.success(`Moved ${imageIds.length} image(s) to ${destinationPath}`);
      setSelectedImageUrls([]);
      setImageToShare(null);
      setShowFolderSelector(false);
      refetchImages();
      refetchEditedImages();
    } catch (error: any) {
      console.error("LibraryPage: handleMoveImages error:", error);
      toast.error(error.response?.data?.detail || "Failed to move images");
    }
  };

  const handleGenerateVideo = (content: GeneratedContent) => {
    if (content.content_type !== "video_script") {
      toast.error("Video generation is only available for video scripts");
      return;
    }
    // Navigate to video generation page with campaign and script
    const campaignId = content.campaign_id;
    router.push(
      `/content/video?campaign=${campaignId}&script=${encodeURIComponent(
        content.content_data.text
      )}`
    );
  };

  // Handle keyboard navigation for images
  const currentImageIndexInSortedList = selectedLibraryImage
    ? sortedImages.findIndex((img) => img.id === selectedLibraryImage.id)
    : -1;

  const handlePreviousImage = () => {
    if (currentImageIndexInSortedList > 0) {
      const newIndex = currentImageIndexInSortedList - 1;
      setSelectedLibraryImage(sortedImages[newIndex]);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndexInSortedList < sortedImages.length - 1) {
      const newIndex = currentImageIndexInSortedList + 1;
      setSelectedLibraryImage(sortedImages[newIndex]);
    }
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
  const handleImageClick = (image: LibraryImage, index: number) => {
    // Navigate directly to Image Editor instead of opening modal
    // For edited images, use the actual R2 URL (not the proxy URL)
    let imageUrlToUse = image.image_url;
    if (image.metadata?.is_edited && image.metadata?.r2_url) {
      imageUrlToUse = image.metadata.r2_url;
    }

    const params = new URLSearchParams({
      imageUrl: imageUrlToUse,
      campaignId: image.campaign_id.toString(),
      imageId: image.id.toString(),
    });
    // For edited images, also pass the original image path
    if (image.metadata?.is_edited && image.metadata?.original_image_path) {
      params.set("originalImagePath", image.metadata.original_image_path);
    }
    router.push(`/image-editor?${params.toString()}`);
  };

  async function handleDownloadImage(image: GeneratedImage) {
    try {
      const response = await fetch(getProxiedImageUrl(image.image_url));
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
  }

  async function confirmDeleteImage() {
    if (!imageToDelete) return;

    try {
      await api.delete(`/api/images/${imageToDelete}`);
      toast.success("Image deleted successfully");
      refetchImages();
      refetchEditedImages();
      setIsLibraryModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete image");
    }
  }

  async function handleDeleteEditedImage(editId: number) {
    setImageToDelete(editId);
    setShowDeleteImageConfirm(true);
  }

  async function confirmDeleteEditedImage() {
    if (!imageToDelete) return;

    try {
      await api.delete(`/api/image-editor/${imageToDelete}`);
      toast.success("Edited image deleted successfully");
      refetchEditedImages();
      setIsLibraryModalOpen(false);
      setImageToDelete(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to delete edited image"
      );
    }
  }

  const handleDeleteVideo = (videoId: number) => {
    setVideoToDelete(videoId);
    setShowDeleteVideoConfirm(true);
  };

  async function confirmDeleteVideo() {
    if (!videoToDelete) return;

    try {
      await api.delete(`/api/video/${videoToDelete}`);
      toast.success("Video deleted successfully");
      refetchVideos();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete video");
    }
  }

  // Batch Delete Handler
  const handleBatchDelete = () => {
    setBatchDeleteCount(selectedImageUrls.length);
    setShowBatchDeleteConfirm(true);
  };

  // Make Collage Handler
  const handleMakeCollage = () => {
    if (selectedImageUrls.length < 2) {
      toast.error("Please select at least 2 images to create a collage");
      return;
    }

    // Store selected images for collage in sessionStorage
    const selectedImagesData = combinedImages
      .filter((img) => selectedImageUrls.includes(img.image_url))
      .map((img) => ({
        url: getProxiedImageUrl(img.image_url),
        prompt: img.prompt || "Campaign Image",
      }));

    sessionStorage.setItem(
      "collageSelectedImages",
      JSON.stringify(selectedImagesData)
    );

    // Navigate to image editor with collage tool - use proxied URL
    const firstImage = combinedImages.find((img) =>
      selectedImageUrls.includes(img.image_url)
    );
    if (firstImage) {
      const campaignId = firstImage.campaign_id || "";
      const proxiedUrl = getProxiedImageUrl(firstImage.image_url);
      router.push(
        `/image-editor?imageUrl=${encodeURIComponent(
          proxiedUrl
        )}&campaignId=${campaignId}&tool=collage`
      );
    }
  };

  const confirmBatchDelete = async () => {
    try {
      // Get the image IDs from the selected URLs
      const imageIds: number[] = [];

      for (const imageUrl of selectedImageUrls) {
        const image = combinedImages.find((img) => img.image_url === imageUrl);
        if (image && image.id) {
          imageIds.push(image.id);
        }
      }

      // Delete each image
      for (const imageId of imageIds) {
        await api.delete(`/api/images/${imageId}`);
      }

      toast.success(`Successfully deleted ${imageIds.length} image(s)`);
      setSelectedImageUrls([]);
      setShowBatchDeleteConfirm(false);
      refetchImages();
      refetchEditedImages();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete images");
    }
  };

  const confirmBatchDeleteSharedImages = async () => {
    try {
      // Get the selected shared image URLs
      const imageUrls: string[] = [];

      for (const imageId of selectedSharedImages) {
        const image = stockImages.find((img) => img.id === imageId);
        if (image && image.url) {
          imageUrls.push(image.url);
        }
      }

      // Delete each image from R2 storage
      for (const imageUrl of imageUrls) {
        await api.delete(`/api/images/stock`, {
          data: { url: imageUrl }
        });
      }

      toast.success(`Successfully deleted ${selectedSharedImages.size} shared image(s)`);
      setSelectedSharedImages(new Set());
      setShowBatchDeleteSharedImagesConfirm(false);
      refetchStockImages();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete shared images");
    }
  };

  // Video Editor handlers
  const handleOpenVideoEditor = (
    videoUrl: string,
    campaignId: number,
    videoScript?: string
  ) => {
    setVideoEditorUrl(videoUrl);
    setVideoEditorCampaignId(campaignId);
    setVideoEditorScript(videoScript || "");
    setIsVideoEditorOpen(true);
  };

  const handleSaveEditedVideo = (video: { video_url: string }) => {
    toast.success("Video with text overlays saved successfully!");
    refetchVideos();
    setIsVideoEditorOpen(false);
  };

  // Thumbnail Selection handlers
  const handleSelectThumbnail = async (video: any) => {
    setSelectedVideoForThumbnail(video);
    setIsGeneratingThumbnails(true);
    setShowThumbnailModal(true);
    setThumbnailOptions([]); // Clear previous options

    try {
      // Use backend to get video duration (avoids CORS issues with R2)

      const durationResponse = await api.post("/api/videos/get-duration", {
        video_url: video.video_url,
      });

      const videoDuration = durationResponse.data.duration;
      setVideoDurationForThumbnail(videoDuration);

      // Call the API to generate thumbnails

      const response = await api.post("/api/videos/thumbnail-options", {
        video_url: video.video_url,
        video_duration: videoDuration,
        campaign_id: video.campaign_id,
      });

      setThumbnailOptions(response.data.thumbnail_options || []);

      if (
        !response.data.thumbnail_options ||
        response.data.thumbnail_options.length === 0
      ) {
        console.warn("⚠️ No thumbnail options returned");
        toast.warning("No thumbnail options available for this video");
      }
    } catch (error: any) {
      console.error("❌ Error in thumbnail generation:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        video: video?.id,
      });

      // Show specific error message
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "Failed to generate thumbnail options";
      toast.error(`Error: ${errorMsg}`);

      // Don't close modal immediately, let user try again
      // setShowThumbnailModal(false);
    } finally {
      setIsGeneratingThumbnails(false);
    }
  };

  const handleSelectThumbnailOption = async (
    thumbnailDataUrl: string,
    index: number
  ) => {
    if (!selectedVideoForThumbnail) return;

    try {
      // Calculate the timestamp based on the option index
      // The thumbnail options are generated at specific timestamps
      const videoDuration = videoDurationForThumbnail || 5.0; // Use real duration, fallback to 5.0
      const thumbnailTimestamps = [
        videoDuration * 0.1, // 10% through video
        videoDuration * 0.3, // 30% through video
        videoDuration * 0.5, // 50% through video
        videoDuration * 0.7, // 70% through video
        videoDuration * 0.9, // 90% through video
      ];
      const selectedTimestamp = thumbnailTimestamps[index] || 1.0;

      // Call backend to save the thumbnail
      await api.post("/api/videos/save-thumbnail", {
        video_id: selectedVideoForThumbnail.id,
        thumbnail_timestamp: selectedTimestamp,
      });

      toast.success("Thumbnail saved successfully!");
      setShowThumbnailModal(false);
      setThumbnailOptions([]);
      setSelectedVideoForThumbnail(null);
      refetchVideos();
    } catch (error: any) {
      toast.error("Failed to save thumbnail selection");
    }
  };

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

  // Toggle image selection for batch processing
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImageUrls((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  // Select all visible images
  const selectAllImages = () => {
    const allUrls = sortedImages.map((img) => img.image_url);
    setSelectedImageUrls(allUrls);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedImageUrls([]);
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
            <button
              onClick={() => setActiveLibraryTab("shared-images")}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeLibraryTab === "shared-images"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🗂️ Shared Images ({stockImages.length})
            </button>
            <button
              onClick={() => setActiveLibraryTab("videos")}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeLibraryTab === "videos"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎬 Videos ({allVideos.length})
            </button>
            <button
              onClick={() => setActiveLibraryTab("landing-pages")}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeLibraryTab === "landing-pages"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              🎨 Landing Pages
            </button>
          </div>

          {/* Image Sub-Tabs */}
          {activeLibraryTab === "images" && (
            <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setImageFilter("all")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>All</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {allImages.length}
                </span>
              </button>
              <button
                onClick={() => setImageFilter("original")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "original"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🖼️ Original</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) =>
                        img.metadata?.text_overlay !== true &&
                        !img.metadata?.edit_tool &&
                        img.source === "original"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("filters")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "filters"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🎨 Filters</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "filters"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("resize")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "resize"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>📐 Resize</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "resize"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("overlays")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "overlays"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>✨ Overlays</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) =>
                        img.metadata?.text_overlay === true ||
                        img.metadata?.image_overlay === true ||
                        img.metadata?.edit_tool === "overlay"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("inpaint")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "inpaint"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🖌️ Inpaint</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "inpaint"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("erase")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "erase"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🧹 Erase</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "erase"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("transparent")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "transparent"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🔍 Transparent</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.has_transparency === true
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("lineage")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "lineage"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🌳 Lineage</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) =>
                        img.parent_image_id !== null &&
                        img.parent_image_id !== undefined
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("collage")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "collage"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🧩 Collage</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "collage"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("template")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "template"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>📋 Templates</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "template"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("background")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "background"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🎨 Backgrounds</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "background"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setImageFilter("frame")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  imageFilter === "frame"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>🖼️ Frames</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    combinedImages.filter(
                      (img) => img.metadata?.edit_tool === "frame"
                    ).length
                  }
                </span>
              </button>
            </div>
          )}

          {/* Video Sub-Tabs */}
          {activeLibraryTab === "videos" && (
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
              <button
                onClick={() => setVideoFilter("all")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  videoFilter === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>All Videos</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {allVideos.length}
                </span>
              </button>
              <button
                onClick={() => setVideoFilter("generated")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  videoFilter === "generated"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>📹 Generated</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    allVideos.filter(
                      (vid) => vid.generation_mode !== "text_overlay"
                    ).length
                  }
                </span>
              </button>
              <button
                onClick={() => setVideoFilter("overlays")}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  videoFilter === "overlays"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>✨ Text Overlays</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                  {
                    allVideos.filter(
                      (vid) => vid.generation_mode === "text_overlay"
                    ).length
                  }
                </span>
              </button>
            </div>
          )}

          {/* Shared Images Tab */}
          {activeLibraryTab === "shared-images" && (
            <div className="space-y-6">
              {/* Folder Filter Bar */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Filter by Folder
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSharedImageFolderFilter("all")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "all"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    All Images
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("backgrounds")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "backgrounds"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    🎨 Backgrounds
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("stock-images")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "stock-images"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    🖼️ Stock Images
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("overlays")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "overlays"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ✨ Overlays
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("icons")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "icons"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    🔲 Icons
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("frames")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "frames"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    🖼️ Frames
                  </button>
                  <button
                    onClick={() => setSharedImageFolderFilter("templates")}
                    className={`px-4 py-2 rounded-lg transition ${
                      sharedImageFolderFilter === "templates"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    📄 Templates
                  </button>
                </div>
              </div>

              {/* Admin Controls Bar */}
              {getRoleFromToken() === "admin" && (
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Admin Controls
                    </h3>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {selectedSharedImages.size} selected
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const filteredImages = stockImages.filter((image) => {
                          if (sharedImageFolderFilter === "all") return true;
                          const filterToFolderMap: Record<string, string> = {
                            "backgrounds": "Backgrounds",
                            "stock-images": "Stock Images",
                            "overlays": "Overlays",
                            "frames": "Frames",
                            "icons": "Icons",
                            "templates": "Templates",
                          };
                          const targetFolder = filterToFolderMap[sharedImageFolderFilter];
                          if (!targetFolder) return true;
                          return image.folder === targetFolder;
                        });
                        setSelectedSharedImages(new Set(filteredImages.map(img => img.id)));
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Select All ({stockImages.filter((image) => {
                        if (sharedImageFolderFilter === "all") return true;
                        const filterToFolderMap: Record<string, string> = {
                          "backgrounds": "Backgrounds",
                          "stock-images": "Stock Images",
                          "overlays": "Overlays",
                          "frames": "Frames",
                          "icons": "Icons",
                          "templates": "Templates",
                        };
                        const targetFolder = filterToFolderMap[sharedImageFolderFilter];
                        if (!targetFolder) return true;
                        return image.folder === targetFolder;
                      }).length})
                    </button>
                    <button
                      onClick={() => setSelectedSharedImages(new Set())}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={() => setShowAddSharedImageModal(true)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      ➕ Add Images
                    </button>
                    <button
                      onClick={() => {
                        setUploadType("image");
                        setUploadFile(null);
                        setUploadCampaignId(filterCampaignId);
                        setShowUploadModal(true);
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      📤 Upload Image
                    </button>
                    <button
                      onClick={() => {
                        setUploadType("video");
                        setUploadFile(null);
                        setUploadCampaignId(filterCampaignId);
                        setShowUploadModal(true);
                      }}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      🎥 Upload Video
                    </button>

                    {/* Action buttons - only show when images are selected */}
                    {selectedSharedImages.size > 0 && (
                      <>
                        <button
                          onClick={() => {
                            // Download each selected image
                            for (const imageId of selectedSharedImages) {
                              const image = stockImages.find((img) => img.id === imageId);
                              if (image && image.url) {
                                const link = document.createElement('a');
                                link.href = getProxiedImageUrl(image.url);
                                link.download = image.name || 'image';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }
                            toast.success(`Downloaded ${selectedSharedImages.size} image(s)`);
                          }}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition"
                        >
                          ⬇️ Download Selected ({selectedSharedImages.size})
                        </button>
                        <button
                          onClick={() => {
                            setBatchDeleteCount(selectedSharedImages.size);
                            setShowBatchDeleteSharedImagesConfirm(true);
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          🗑️ Delete Selected ({selectedSharedImages.size})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Filtered Shared Images Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(() => {
                  // Filter stock images based on selected folder
                  const filteredImages = stockImages.filter((image) => {
                    if (sharedImageFolderFilter === "all") return true;
                    // Map filter values to folder names returned by backend
                    const filterToFolderMap: Record<string, string> = {
                      "backgrounds": "Backgrounds",
                      "stock-images": "Stock Images",
                      "overlays": "Overlays",
                      "frames": "Frames",
                      "icons": "Icons",
                      "templates": "Templates",
                    };
                    const targetFolder = filterToFolderMap[sharedImageFolderFilter];
                    if (!targetFolder) return true;
                    return image.folder === targetFolder;
                  });

                  return filteredImages.map((image, index) => (
                    <div
                      key={index}
                      className="group relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={getProxiedImageUrl(image.url)}
                          alt={image.name || "Shared image"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.png";
                          }}
                        />

                        {/* Admin Checkbox */}
                        {getRoleFromToken() === "admin" && (
                          <div className="absolute top-2 left-2 z-10">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSharedImages.has(image.id)}
                                onChange={(e) => {
                                  const newSelection = new Set(selectedSharedImages);
                                  if (e.target.checked) {
                                    newSelection.add(image.id);
                                  } else {
                                    newSelection.delete(image.id);
                                  }
                                  setSelectedSharedImages(newSelection);
                                }}
                                className="w-5 h-5 rounded border-2 border-white text-blue-600 focus:ring-blue-500 focus:ring-2 bg-black/20"
                              />
                            </label>
                          </div>
                        )}

                        {/* Selection Overlay */}
                        {getRoleFromToken() === "admin" && selectedSharedImages.has(image.id) && (
                          <div className="absolute inset-0 bg-blue-600/20 border-4 border-blue-600 rounded-lg flex items-center justify-center">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              Selected
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setSelectedSharedImage(image);
                              setShowCampaignSelector(true);
                            }}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            Use in Campaign
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {image.name || "Untitled"}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                          {image.folder || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {stockImages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">🖼️</div>
                  <p style={{ color: "var(--text-secondary)" }}>No shared images available</p>
                </div>
              )}
            </div>
          )}

          {/* Landing Pages Tab */}
          {activeLibraryTab === "landing-pages" && (
            <LandingPageBuilder
              textContent={allContent}
              images={combinedImages}
              videos={allVideos}
            />
          )}

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
          ) : activeLibraryTab === "images" ? (
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
          ) : (
            /* Video Filters */
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
          ) : activeLibraryTab === "images" ? (
            /* Image Grid */
            <>
              {sortedImages.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedImageUrls.length === 0 ? (
                        <button
                          onClick={selectAllImages}
                          className="text-sm px-3 py-1.5 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                        >
                          Select All
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={clearSelection}
                            className="text-sm px-3 py-1.5 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                          >
                            Clear ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={handleBatchDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium"
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
                            Delete ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={() => setShowBatchOptimizer(true)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition flex items-center gap-2 font-medium"
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Optimize ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={() => setShowBatchFilters(true)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition flex items-center gap-2 font-medium"
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
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                              />
                            </svg>
                            Apply Filter ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={handleMakeCollage}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium"
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
                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                              />
                            </svg>
                            Make Collage ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={() => setShowBatchBgRemoval(true)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition flex items-center gap-2 font-medium shadow-md"
                          >
                            <span className="text-lg">🪄</span>
                            Remove Backgrounds ({selectedImageUrls.length})
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                              FREE
                            </span>
                          </button>

                          <button
                            onClick={handleMoveToStock}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 font-medium"
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
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            Move to Stock ({selectedImageUrls.length})
                          </button>

                          <button
                            onClick={() => {
                              setBatchCampaignId(filterCampaignId);
                              setShowBatchModal(true);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-medium"
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
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Batch Process ({selectedImageUrls.length})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedImages.map((image, index) => (
                      <div
                        key={`${image.source}-${image.id}`}
                        className="card rounded-lg overflow-hidden group hover:shadow-lg transition-shadow relative"
                      >
                        {/* Selection Checkbox */}
                        <div
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedImageUrls.includes(
                              image.image_url
                            )}
                            onChange={() =>
                              toggleImageSelection(image.image_url)
                            }
                            className="w-5 h-5 cursor-pointer accent-blue-600"
                          />
                        </div>

                        {/* Image - Make clickable only if not selecting */}
                        <div
                          className={`relative aspect-square cursor-pointer ${
                            image.has_transparency
                              ? "bg-[length:20px_20px] bg-[linear-gradient(45deg,#d1d5db_25%,transparent_25%),linear-gradient(-45deg,#d1d5db_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d1d5db_75%),linear-gradient(-45deg,transparent_75%,#d1d5db_75%)] dark:bg-[length:20px_20px] dark:bg-[linear-gradient(45deg,#4b5563_25%,transparent_25%),linear-gradient(-45deg,#4b5563_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#4b5563_75%),linear-gradient(-45deg,transparent_75%,#4b5563_75%)]"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          onClick={() => {
                            if (selectedImageUrls.length === 0) {
                              handleImageClick(image, index);
                            }
                          }}
                        >
                          <img
                            src={getProxiedImageUrl(image.image_url)}
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                          />
                          {/* Badge - Different types */}
                          {(() => {
                            // Debug: Log metadata to console
                            if (
                              typeof window !== "undefined" &&
                              image.metadata
                            ) {
                            }

                            {/* Check has_transparency first for transparent images */}
                            if (image.has_transparency) {
                              return (
                                <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  TRANSPARENT
                                </div>
                              );
                            } else if (image.metadata?.edit_tool) {
                              // Map edit_tool to display name - show the last tool used
                              const toolNames: Record<string, string> = {
                                filters: "Filters",
                                resize: "Resize",
                                inpaint: "Inpaint",
                                erase: "Erase",
                                overlay: "Overlays",
                                background_removal: "TRANSPARENT",
                                transparent: "TRANSPARENT",
                                background: "Background",
                                collage: "Collage",
                                template: "Template",
                                frame: "Frame",
                              };
                              const toolName =
                                toolNames[image.metadata.edit_tool] ||
                                image.metadata.edit_tool.toUpperCase();
                              return (
                                <div className="absolute top-3 right-3 bg-blue-600 to-blue-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {toolName}
                                </div>
                              );
                            } else {
                              return (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  GENERATED
                                </div>
                              );
                            }
                          })()}
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
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadImage(image);
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Download"
                            >
                              <svg
                                className="w-3 h-3"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/image-editor?imageUrl=${encodeURIComponent(
                                    image.image_url
                                  )}&campaignId=${image.campaign_id}`
                                );
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Edit Image"
                            >
                              <svg
                                className="w-3 h-3"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Generate similar image
                                toast.info(
                                  "Generate Similar feature coming soon!"
                                );
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Generate Similar"
                            >
                              <svg
                                className="w-3 h-3"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Navigate to video generation with this image
                                router.push(
                                  `/content/video?campaign=${
                                    image.campaign_id
                                  }&image=${encodeURIComponent(
                                    image.image_url
                                  )}`
                                );
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Generate Video"
                            >
                              <svg
                                className="w-3 h-3"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (image.source === "edited") {
                                  handleDeleteEditedImage(image.id);
                                } else {
                                  handleDeleteImage(image.id);
                                }
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-gray-600 hover:bg-red-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Delete"
                            >
                              <svg
                                className="w-3 h-3"
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
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
          ) : (
            /* Video Grid */
            <>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className="card rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative bg-gray-100 dark:bg-gray-800 aspect-video">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.prompt}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-16 h-16"
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
                        )}
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
                          {video.status}
                        </div>
                        {/* Play Button Overlay */}
                        {video.status === "completed" && video.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <svg
                                className="w-8 h-8 ml-1"
                                style={{ color: "var(--text-primary)" }}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {video.generation_mode
                              ?.replace("_", " ")
                              .toUpperCase()}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {video.aspect_ratio}
                          </span>
                        </div>
                        <p
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {video.prompt}
                        </p>
                        <div
                          className="flex items-center justify-between text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <span>{video.provider}</span>
                          <span>
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenVideoViewer(video);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center justify-center gap-1"
                            title="View Video"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectThumbnail(video);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition flex items-center justify-center gap-1"
                            title="Select Thumbnail"
                          >
                            <svg
                              className="w-3 h-3"
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
                          </button>
                          {video.generation_mode !== "text_overlay" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenVideoEditor(
                                  video.video_url,
                                  video.campaign_id,
                                  video.prompt
                                );
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition flex items-center justify-center gap-1"
                              title="Add Text Overlays"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Generate similar video
                              toast.info(
                                "Generate Similar feature coming soon!"
                              );
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center justify-center gap-1"
                            title="Generate Similar"
                          >
                            <svg
                              className="w-3 h-3"
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
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo(video.id);
                            }}
                            className="flex-1 text-xs px-2 py-1 bg-gray-600 hover:bg-red-700 text-white rounded transition flex items-center justify-center gap-1"
                            title="Delete"
                          >
                            <svg
                              className="w-3 h-3"
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
                          </button>
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
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3
                    className="text-xl font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Videos Yet
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Generate videos to see them here
                  </p>
                  <button
                    onClick={() => router.push("/content/video")}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Generate Videos
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

      {/* Image Variations Modal */}
      <ImageVariationsModal
        isOpen={showImageVariationsModal}
        onClose={() => setShowImageVariationsModal(false)}
        image={selectedImageForVariations}
        onVariationCreated={handleImageVariationCreated}
      />

      {/* Folder Selector Modal */}
      <FolderSelectorModal
        isOpen={showFolderSelector}
        onClose={() => {
          setShowFolderSelector(false);
          setImageToShare(null);
          setVideoToShare(null);
        }}
        onSelectFolder={(path) => {
          if (imageToShare) {
            handleMoveImages(path);
          } else if (videoToShare) {
            handleMoveVideos(path);
          } else {
            handleMoveImages(path);
          }
        }}
        selectedCount={
          imageToShare ? 1 : videoToShare ? 1 : selectedImageUrls.length
        }
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
                  {sortedImages.length > 1 && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {currentImageIndexInSortedList + 1} of{" "}
                      {sortedImages.length}
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
                    src={getProxiedImageUrl(selectedLibraryImage.image_url)}
                    alt={selectedLibraryImage.prompt}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Badge - Different types */}
                {(() => {
                  // Debug: Log metadata to console
                  if (
                    typeof window !== "undefined" &&
                    selectedLibraryImage.metadata
                  ) {
                  }

                  if (selectedLibraryImage.metadata?.edit_tool) {
                    // Map edit_tool to display name
                    const toolNames: Record<string, string> = {
                      filters: "Filters",
                      resize: "Resize",
                      inpaint: "Inpaint",
                      erase: "Erase",
                      overlay: "Overlays",
                      background_removal: "TRANSPARENT",
                      transparent: "TRANSPARENT",
                      background: "Background",
                      collage: "Collage",
                      template: "Template",
                      frame: "Frame",
                    };
                    const toolName =
                      toolNames[selectedLibraryImage.metadata.edit_tool] ||
                      selectedLibraryImage.metadata.edit_tool.toUpperCase();
                    return (
                      <div className="absolute top-4 right-4 bg-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {toolName}
                      </div>
                    );
                  } else if (selectedLibraryImage.metadata?.text_overlay) {
                    return (
                      <div className="absolute top-4 right-4 bg-orange-600 to-orange-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Overlays
                      </div>
                    );
                  } else if (selectedLibraryImage.metadata?.image_overlay) {
                    return (
                      <div className="absolute top-4 right-4 bg-green-600 to-green-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Overlays
                      </div>
                    );
                  } else {
                    return (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        PREMIUM
                      </div>
                    );
                  }
                })()}

                {/* Navigation Arrows */}
                {sortedImages.length > 1 && (
                  <>
                    {/* Previous Button */}
                    {currentImageIndexInSortedList > 0 && (
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
                    {currentImageIndexInSortedList <
                      sortedImages.length - 1 && (
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
                    onClick={() => {
                      // Don't encode here - let URLSearchParams handle it properly
                      // For edited images, use the actual R2 URL (not the proxy URL)
                      let imageUrlToUse = selectedLibraryImage.image_url;
                      if (
                        selectedLibraryImage.metadata?.is_edited &&
                        selectedLibraryImage.metadata?.r2_url
                      ) {
                        imageUrlToUse = selectedLibraryImage.metadata.r2_url;
                      }

                      const params = new URLSearchParams({
                        imageUrl: imageUrlToUse,
                        campaignId: selectedLibraryImage.campaign_id.toString(),
                        imageId: selectedLibraryImage.id.toString(),
                      });
                      // For edited images, also pass the original image path
                      if (
                        selectedLibraryImage.metadata?.is_edited &&
                        selectedLibraryImage.metadata?.original_image_path
                      ) {
                        params.set(
                          "originalImagePath",
                          selectedLibraryImage.metadata.original_image_path
                        );
                      }
                      router.push(`/image-editor?${params.toString()}`);
                    }}
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
                    <span>AI Image Editor</span>
                  </button>

                  <button
                    onClick={() =>
                      handleCreateImageVariations(selectedLibraryImage)
                    }
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Generate Variations</span>
                  </button>

                  <button
                    onClick={() => handleShareImage(selectedLibraryImage)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Share to Stock</span>
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
                      onClick={() => {
                        if (selectedLibraryImage.source === "edited") {
                          handleDeleteEditedImage(selectedLibraryImage.id);
                        } else {
                          handleDeleteImage(selectedLibraryImage.id);
                        }
                      }}
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
          onSave={async (image) => {
            try {
              // Create a NEW image record instead of updating the original
              // This preserves the original enhanced image
              await api.post(`/api/images/create-from-existing`, {
                original_image_id: image.id,
                new_image_url: image.image_url,
                campaign_id: image.campaign_id,
              });
              toast.success(
                "New edited version saved! Original image preserved."
              );
              setShowUnifiedEditor(false);
              setIsLibraryModalOpen(false);
              refetchImages();
            } catch (error) {
              console.error("Failed to save edited image:", error);
              toast.error("Failed to save edited image");
            }
          }}
        />
      )}

      {/* Library Video Viewer Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsVideoModalOpen(false)}
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
                    Video Details
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedVideo.generation_mode
                      ?.replace("_", " ")
                      .toUpperCase()}{" "}
                    • {selectedVideo.aspect_ratio}
                  </p>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
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

              {/* Video Display */}
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                <div className="aspect-video flex items-center justify-center">
                  {selectedVideo.status === "completed" &&
                  selectedVideo.video_url ? (
                    <video
                      src={selectedVideo.video_url}
                      controls
                      className="w-full h-full"
                      poster={selectedVideo.thumbnail_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-16 h-16"
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
                  )}
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-black/50 text-white">
                  {selectedVideo.status}
                </div>
              </div>

              {/* Video Details */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (selectedVideo.video_url) {
                        window.open(selectedVideo.video_url, "_blank");
                      }
                    }}
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

                  {selectedVideo.generation_mode !== "text_overlay" && (
                    <button
                      onClick={() => {
                        handleOpenVideoEditor(
                          selectedVideo.video_url,
                          selectedVideo.campaign_id,
                          selectedVideo.prompt
                        );
                      }}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <span>Add Text Overlays</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleShareVideo(selectedVideo)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center space-x-2"
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Share to Stock</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDeleteVideo(selectedVideo.id);
                      setIsVideoModalOpen(false);
                    }}
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
                  {selectedVideo.prompt}
                </p>
              </div>
            </div>
          </div>
        </div>
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
        onConfirm={() => {
          // Check if we're deleting an edited image by checking if imageToDelete exists in edited images
          const isEditedImage = allEditedImages.some(
            (img) => img.id === imageToDelete
          );
          if (isEditedImage) {
            confirmDeleteEditedImage();
          } else {
            confirmDeleteImage();
          }
        }}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />

      {/* Delete Video Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteVideoConfirm}
        onClose={() => {
          setShowDeleteVideoConfirm(false);
          setVideoToDelete(null);
        }}
        onConfirm={confirmDeleteVideo}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />

      {/* Batch Delete Confirmation */}
      <ConfirmationModal
        isOpen={showBatchDeleteConfirm}
        onClose={() => {
          setShowBatchDeleteConfirm(false);
          setBatchDeleteCount(0);
        }}
        onConfirm={confirmBatchDelete}
        title="Delete Multiple Images"
        message={`Are you sure you want to delete ${batchDeleteCount} image(s)? This action cannot be undone.`}
        type="danger"
        confirmText="Delete All"
      />

      {/* Batch Delete Shared Images Confirmation */}
      <ConfirmationModal
        isOpen={showBatchDeleteSharedImagesConfirm}
        onClose={() => {
          setShowBatchDeleteSharedImagesConfirm(false);
          setBatchDeleteCount(0);
        }}
        onConfirm={confirmBatchDeleteSharedImages}
        title="Delete Multiple Shared Images"
        message={`Are you sure you want to delete ${batchDeleteCount} shared image(s)? This action cannot be undone.`}
        type="danger"
        confirmText="Delete All"
      />

      {/* Campaign Selector Modal for Shared Images */}
      {showCampaignSelector && selectedSharedImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Select Campaign
                  </h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    Choose a campaign to edit this image for
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCampaignSelector(false);
                    setSelectedSharedImage(null);
                    setSelectedCampaignForEdit("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
            </div>

            {/* Image Preview */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <img
                src={getProxiedImageUrl(selectedSharedImage.url)}
                alt={selectedSharedImage.name || 'Shared image'}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {selectedSharedImage.name || 'Shared Image'}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Folder: {selectedSharedImage.folder || 'Stock'}
                </p>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-medium mb-4" style={{ color: "var(--text-primary)" }}>
                Select a Campaign
              </h3>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p style={{ color: "var(--text-secondary)" }}>Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: "var(--text-secondary)" }}>No campaigns available</p>
                  <button
                    onClick={() => router.push("/campaigns")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {campaigns.map((campaign: Campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => setSelectedCampaignForEdit(String(campaign.id))}
                      className={`w-full flex items-center gap-4 p-3 rounded-lg border transition ${
                        selectedCampaignForEdit === String(campaign.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {campaign.thumbnail_image_url ? (
                          <img
                            src={getProxiedImageUrl(campaign.thumbnail_image_url)}
                            alt={campaign.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-gray-400"
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
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {campaign.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            campaign.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }`}>
                            {campaign.status}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {campaign.affiliate_network}
                          </span>
                        </div>
                      </div>
                      {selectedCampaignForEdit === String(campaign.id) && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCampaignSelector(false);
                  setSelectedSharedImage(null);
                  setSelectedCampaignForEdit("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                style={{ color: "var(--text-primary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedCampaignForEdit) {
                    toast.error("Please select a campaign");
                    return;
                  }
                  // Navigate to Image Editor with both image URL and campaign ID
                  const encodedUrl = encodeURIComponent(selectedSharedImage.url);
                  router.push(
                    `/image-editor?imageUrl=${encodedUrl}&campaignId=${selectedCampaignForEdit}`
                  );
                  setShowCampaignSelector(false);
                }}
                disabled={!selectedCampaignForEdit}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Edit Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Editor Modal */}
      <VideoEditorModal
        isOpen={isVideoEditorOpen}
        onClose={() => setIsVideoEditorOpen(false)}
        videoUrl={videoEditorUrl}
        videoScript={videoEditorScript}
        campaignId={videoEditorCampaignId}
        onSave={handleSaveEditedVideo}
      />

      {/* Thumbnail Selection Modal */}
      {showThumbnailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Select Thumbnail
                </h2>
                {videoDurationForThumbnail > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Video duration: {videoDurationForThumbnail.toFixed(1)}s
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowThumbnailModal(false);
                  setThumbnailOptions([]);
                  setSelectedVideoForThumbnail(null);
                  setVideoDurationForThumbnail(0);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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

            {isGeneratingThumbnails ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Generating thumbnail options...
                </p>
              </div>
            ) : thumbnailOptions.length > 0 ? (
              <>
                <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                  Choose a thumbnail for your video:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {thumbnailOptions.map(
                    (thumbnailDataUrl: string, index: number) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleSelectThumbnailOption(thumbnailDataUrl, index)
                        }
                        className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all transform hover:scale-105"
                      >
                        <img
                          src={thumbnailDataUrl}
                          alt={`Thumbnail option ${index + 1}`}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 text-center">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Option {index + 1}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-30"
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
                <p style={{ color: "var(--text-secondary)" }}>
                  No thumbnail options available
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Processing Modal */}
      <BatchProcessingModal
        isOpen={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          setSelectedImageUrls([]);
          refetchImages();
        }}
        selectedImages={selectedImageUrls}
        campaignId={batchCampaignId || filterCampaignId || 1}
      />

      {/* Single Image Optimizer */}
      <ImageOptimizer
        isOpen={showOptimizer}
        onClose={() => setShowOptimizer(false)}
        imageUrl={optimizerImageUrl}
        imageName={optimizerImageName}
      />

      {/* Batch Image Optimizer */}
      <BatchImageOptimizer
        isOpen={showBatchOptimizer}
        onClose={() => {
          setShowBatchOptimizer(false);
          setSelectedImageUrls([]);
        }}
        imageUrls={selectedImageUrls}
      />

      {/* Single Image Filters */}
      <ImageFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        imageUrl={filtersImageUrl}
        imageName={filtersImageName}
      />

      {/* Batch Filters */}
      <BatchFilters
        isOpen={showBatchFilters}
        onClose={() => {
          setShowBatchFilters(false);
          setSelectedImageUrls([]);
        }}
        imageUrls={selectedImageUrls}
      />

      {/* Batch Background Removal */}
      <BatchBackgroundRemoval
        isOpen={showBatchBgRemoval}
        onClose={() => {
          setShowBatchBgRemoval(false);
          setSelectedImageUrls([]);
        }}
        imageUrls={selectedImageUrls}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Upload {uploadType === "image" ? "Image" : "Video"}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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

            <div className="space-y-4">
              {/* Campaign Selector */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Campaign
                </label>
                <select
                  value={uploadCampaignId || ""}
                  onChange={(e) =>
                    setUploadCampaignId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  style={{ color: "var(--text-primary)" }}
                >
                  <option value="">Select a campaign</option>
                  {campaigns
                    .filter((c) => c.id === filterCampaignId || !filterCampaignId)
                    .map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* File Input */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {uploadType === "image" ? "Image" : "Video"} File
                </label>
                <input
                  type="file"
                  accept={uploadType === "image" ? "image/*" : "video/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setUploadFile(file);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  style={{ color: "var(--text-primary)" }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadType === "image"
                    ? "Supported: JPG, PNG, GIF, WebP (max 50MB)"
                    : "Supported: MP4, WebM, OGG (max 50MB)"}
                </p>
              </div>

              {/* Upload Button */}
              <button
                onClick={async () => {
                  if (!uploadFile) {
                    toast.error("Please select a file");
                    return;
                  }
                  if (!uploadCampaignId) {
                    toast.error("Please select a campaign");
                    return;
                  }

                  setIsUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append("file", uploadFile);
                    formData.append("campaign_id", uploadCampaignId.toString());
                    formData.append("media_type", uploadType);

                    const response = await api.post("/upload/campaign-media", formData, {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    });

                    toast.success(
                      `${uploadType === "image" ? "Image" : "Video"} uploaded successfully!`
                    );

                    // Refresh data
                    if (uploadType === "image") {
                      refetchImages();
                    } else {
                      refetchVideos();
                    }

                    setShowUploadModal(false);
                    setUploadFile(null);
                  } catch (error: any) {
                    console.error("Upload error:", error);
                    toast.error(
                      error.response?.data?.detail ||
                        `Failed to upload ${uploadType}`
                    );
                  } finally {
                    setIsUploading(false);
                  }
                }}
                disabled={isUploading || !uploadFile || !uploadCampaignId}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isUploading ? "Uploading..." : `Upload ${uploadType === "image" ? "Image" : "Video"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
