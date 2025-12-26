"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { AuthGate } from "src/components/AuthGate";
import { ImageEditorCanvas } from "src/components/image-editor/ImageEditorCanvas";
import { ImageEditorToolbar } from "src/components/image-editor/ImageEditorToolbar";
import { ImageEditorSidebar } from "src/components/image-editor/ImageEditorSidebar";
import { ToolSelector } from "src/components/image-editor/ToolSelector";
import { OverlayEditor } from "src/components/image-editor/OverlayEditor";
import { SmartResize } from "src/components/image-editor/SmartResize";

export type EditTool =
  | "inpaint"
  | "erase"
  | "background-remove"
  | "search-replace"
  | "outpaint"
  | "upscale"
  | "sketch-to-image"
  | "overlay"
  | "resize"
  | "filters"
  | "collage"
  | "template";

export default function ImageEditorPage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const campaignId = searchParams.get("campaignId");
  const initialTool = searchParams.get("tool") as EditTool | null;

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTransparency, setHasTransparency] = useState(false);

  // Filter preview state - shows filtered image before saving to R2
  const [filterPreviewImage, setFilterPreviewImage] = useState<string | null>(
    null
  );

  // Tool states
  const [selectedEditTool, setSelectedEditTool] = useState<EditTool>(
    initialTool === "collage" ? "collage" : "inpaint"
  );
  const [selectedDrawTool, setSelectedDrawTool] = useState<"brush" | "eraser">(
    "brush"
  );
  const [brushSize, setBrushSize] = useState(20);

  // Common parameters
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState(0);

  // Search & Replace specific
  const [searchPrompt, setSearchPrompt] = useState("");

  // Outpainting specific
  const [outpaintLeft, setOutpaintLeft] = useState(200);
  const [outpaintRight, setOutpaintRight] = useState(200);
  const [outpaintUp, setOutpaintUp] = useState(0);
  const [outpaintDown, setOutpaintDown] = useState(0);
  const [creativity, setCreativity] = useState(0.5);

  // Selection interface state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

  // Collage selected images from Content Library
  const [collageSelectedImages, setCollageSelectedImages] = useState<{ id: string; url: string; prompt: string }[]>([]);

  // Load selected images from sessionStorage when collage tool is used
  useEffect(() => {
    if (selectedEditTool === "collage") {
      const stored = sessionStorage.getItem('collageSelectedImages');
      if (stored) {
        try {
          const images = JSON.parse(stored);
          setCollageSelectedImages(images);
          // Clear from sessionStorage after reading
          sessionStorage.removeItem('collageSelectedImages');
        } catch (e) {
          console.error("Failed to parse collage selected images:", e);
        }
      }
    }
  }, [selectedEditTool]);

  // React Query: Fetch campaigns
  const { data: availableCampaigns = [], isLoading: isLoadingCampaigns } =
    useQuery({
      queryKey: ["campaigns"],
      queryFn: async () => {
        const res = await api.get("/api/campaigns");
        return res.data || [];
      },
      enabled: !imageUrl || !campaignId, // Only fetch when showing selection interface
    });

  // React Query: Fetch images for selected campaign
  const { data: availableImages = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ["campaign-images", selectedCampaignId],
    queryFn: async () => {
      const res = await api.get(
        `/api/content/campaign/${selectedCampaignId}/images`
      );
      return res.data.images || [];
    },
    enabled: !!selectedCampaignId && (!imageUrl || !campaignId),
  });

  // React Query: Fetch images for current campaign (when editing a specific image)
  const { data: currentCampaignImages = [] } = useQuery({
    queryKey: ["current-campaign-images", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const res = await api.get(`/api/content/campaign/${campaignId}/images`);
      return res.data.images || [];
    },
    enabled: !!campaignId && !!imageUrl,
  });

  // Format images for collage tool
  const collageImages = currentCampaignImages.map((img: any) => ({
    id: img.id || img.image_url,
    url: img.image_url,
    prompt: img.prompt || "Campaign Image",
  }));

  // Load image from URL params
  useEffect(() => {
    if (imageUrl && campaignId) {
      if (imageUrl === "uploaded") {
        const storedImage = sessionStorage.getItem("uploadedImageData");
        if (storedImage) {
          setOriginalImage(storedImage);
          setActiveImage(storedImage);
        }
      } else {
        setOriginalImage(imageUrl);
        setActiveImage(imageUrl);
      }
    }
  }, [imageUrl, campaignId]);

  // Detect transparency in active image
  const checkImageTransparency = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve(false);
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Check for any transparent pixels (alpha < 255)
        let hasTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparency = true;
            break;
          }
        }

        resolve(hasTransparency);
      };

      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };

  // Check transparency when active image changes
  useEffect(() => {
    if (activeImage) {
      checkImageTransparency(activeImage).then((hasTrans) => {
        setHasTransparency(hasTrans);
      });
    } else {
      setHasTransparency(false);
    }
  }, [activeImage]);

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setOriginalImage(dataUrl);
        setActiveImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image selection from campaign
  const handleImageSelect = (imageUrl: string) => {
    setOriginalImage(imageUrl);
    setActiveImage(imageUrl);
  };

  // Start editing with selected campaign and image
  const startEditing = () => {
    if (!selectedCampaignId) {
      toast.error("Please select a campaign");
      return;
    }

    if (!originalImage) {
      toast.error("Please select or upload an image");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("campaignId", selectedCampaignId);

    if (originalImage.startsWith("data:")) {
      sessionStorage.setItem("uploadedImageData", originalImage);
      params.set("imageUrl", "uploaded");
    } else {
      params.set("imageUrl", originalImage);
    }

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
    window.location.reload();
  };

  const handleEdit = async (maskDataUrl?: string) => {
    if (!campaignId || !imageUrl) {
      toast.error("Missing campaign ID or image URL");
      return;
    }

    if (
      ["inpaint", "search-replace", "upscale"].includes(selectedEditTool) &&
      !prompt
    ) {
      toast.error("Please enter a prompt");
      return;
    }

    if (selectedEditTool === "search-replace" && !searchPrompt) {
      toast.error("Please enter a search prompt");
      return;
    }

    if (["inpaint", "erase"].includes(selectedEditTool) && !maskDataUrl) {
      toast.error("Please paint a mask first");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image_url", imageUrl);
      formData.append("campaign_id", campaignId);
      formData.append("output_format", "png");

      let endpoint = "";

      switch (selectedEditTool) {
        case "inpaint":
          endpoint = "/api/image-editor/inpaint";
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          if (maskDataUrl) formData.append("mask_image_data", maskDataUrl);
          formData.append("seed", seed.toString());
          break;

        case "erase":
          endpoint = "/api/image-editor/erase";
          if (maskDataUrl) formData.append("mask_image_data", maskDataUrl);
          formData.append("seed", seed.toString());
          break;

        case "background-remove":
          endpoint = "/api/image-editor/remove-background";
          break;

        case "search-replace":
          endpoint = "/api/image-editor/search-replace";
          formData.append("search_prompt", searchPrompt);
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("seed", seed.toString());
          break;

        case "outpaint":
          endpoint = "/api/image-editor/outpaint";
          formData.append("prompt", prompt);
          formData.append("left", outpaintLeft.toString());
          formData.append("right", outpaintRight.toString());
          formData.append("up", outpaintUp.toString());
          formData.append("down", outpaintDown.toString());
          formData.append("creativity", creativity.toString());
          formData.append("seed", seed.toString());
          break;

        case "upscale":
          endpoint = "/api/image-editor/upscale";
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("creativity", "0.35");
          formData.append("seed", seed.toString());
          break;

        case "sketch-to-image":
          endpoint = "/api/image-editor/sketch-to-image";
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("control_strength", "0.7");
          formData.append("seed", seed.toString());
          break;
      }

      const response = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;

      if (result.success && result.edited_image_url) {
        setEditedImage(result.edited_image_url);
        setActiveImage(result.edited_image_url);
        toast.success("Image edited successfully!");
      } else {
        throw new Error("Failed to generate edited image");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to edit image"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverlaySave = async (overlayImageDataUrl: string) => {
    if (!campaignId || !imageUrl) {
      toast.error("Missing campaign ID or image URL");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await api.post("/api/images/save-draft", {
        campaign_id: parseInt(campaignId),
        image_url: overlayImageDataUrl,
        image_type: "variation",
        style: "modern",
        aspect_ratio: "1:1",
        provider: "canvas",
        model: "overlay-editor",
        prompt: "Overlay edited image",
        custom_prompt: "User-added text and image overlays",
        metadata: {
          is_edited: true,
          edit_type: "overlay",
          edit_tool: "overlay",
        },
      });

      const result = response.data;

      if (result.id || result.image_url) {
        setEditedImage(result.image_url);
        setActiveImage(result.image_url);
        toast.success("Overlay image saved successfully!");
      } else {
        throw new Error("Failed to save overlay image");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error saving overlay");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResizeSave = async (
    resizedImageDataUrl: string,
    preset: string
  ) => {
    console.log("📸 handleResizeSave called with:", {
      campaignId,
      imageUrl,
      preset,
      dataUrlLength: resizedImageDataUrl?.length,
      isDataUrl: resizedImageDataUrl?.startsWith("data:")
    });

    if (!campaignId || !imageUrl) {
      console.error("❌ Missing campaign ID or image URL:", { campaignId, imageUrl });
      toast.error("Missing campaign ID or image URL");
      return;
    }

    setEditedImage(resizedImageDataUrl);
    setActiveImage(resizedImageDataUrl);
    setIsProcessing(true);

    try {
      const payload = {
        campaign_id: parseInt(campaignId),
        image_url: resizedImageDataUrl,
        image_type: "variation",
        style: "modern",
        aspect_ratio: "1:1",
        provider: "canvas",
        model: "resize-editor",
        prompt: `Resized image (${preset})`,
        custom_prompt: `User-resized image to ${preset}`,
        metadata: {
          is_edited: true,
          edit_type: "resize",
          edit_tool: "resize",
          preset: preset,
        },
      };

      console.log("📤 Sending payload to /api/images/save-draft:", payload);

      const response = await api.post("/api/images/save-draft", payload);

      console.log("📥 Response received:", response.data);

      if (!response.data.id && !response.data.image_url) {
        console.error("❌ Response missing id and image_url:", response.data);
        throw new Error("Failed to save resized image");
      }

      console.log("✅ Resized image saved successfully!");
      toast.success("Resized image saved!");
    } catch (err: any) {
      console.error("❌ Error saving resized image:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(err.response?.data?.detail || err.message || "Failed to save resized image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilterSave = async (filteredImageDataUrl: string) => {
    if (!campaignId || !imageUrl) {
      toast.error("Missing campaign ID or image URL");
      return;
    }

    setFilterPreviewImage(filteredImageDataUrl);
    setEditedImage(filteredImageDataUrl);
    setActiveImage(filteredImageDataUrl);
    setIsProcessing(true);

    try {
      const response = await api.post("/api/images/save-draft", {
        campaign_id: parseInt(campaignId),
        image_url: filteredImageDataUrl,
        image_type: "variation",
        style: "modern",
        aspect_ratio: "1:1",
        provider: "canvas",
        model: "filter-editor",
        prompt: "Filter applied",
        custom_prompt: "User-applied color filters",
        metadata: {
          is_edited: true,
          edit_type: "filter",
          edit_tool: "filters",
        },
      });

      if (response.data.id || response.data.image_url) {
        toast.success("Filter saved successfully!");
      }
    } catch (err: any) {
      console.error("Error saving filtered image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCollage = async (collageDataUrl: string) => {
    if (!campaignId || !imageUrl) {
      toast.error("Missing campaign ID or image URL");
      return;
    }

    setIsProcessing(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error("API base URL not configured");
      }

      // Convert data URL to blob
      const response = await fetch(collageDataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("image", blob, "collage_image.png");
      formData.append("campaign_id", campaignId);
      formData.append("operation", "collage");

      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(
        `${apiBaseUrl}/api/image-editor/save-filtered-image`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await uploadResponse.json();

      if (result.success && result.image_url) {
        setEditedImage(result.image_url);
        setActiveImage(result.image_url);
        toast.success("Collage created and saved successfully!");
      } else {
        throw new Error("Failed to save collage image");
      }
    } catch (err) {
      console.error("Collage save error:", err);
      toast.error(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyTemplate = async (templateData: any) => {
    if (!campaignId || !imageUrl) {
      toast.error("Missing campaign ID or image URL");
      return;
    }

    setIsProcessing(true);

    try {
      // Generate template canvas on client side
      const canvasAPI = (window as any).imageEditorCanvas;
      if (canvasAPI && canvasAPI.getTemplateCanvas) {
        const templateDataUrl = canvasAPI.getTemplateCanvas(templateData);

        if (!templateDataUrl) {
          throw new Error("Failed to generate template");
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        if (!apiBaseUrl) {
          throw new Error("API base URL not configured");
        }

        // Convert data URL to blob
        const response = await fetch(templateDataUrl);
        const blob = await response.blob();

        // Create form data
        const formData = new FormData();
        formData.append("image", blob, "template_image.png");
        formData.append("campaign_id", campaignId);
        formData.append("operation", "template");

        const token = localStorage.getItem("token");
        const uploadResponse = await fetch(
          `${apiBaseUrl}/api/image-editor/save-filtered-image`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await uploadResponse.json();

        if (result.success && result.image_url) {
          setEditedImage(result.image_url);
          setActiveImage(result.image_url);
          toast.success("Template created and saved successfully!");
        } else {
          throw new Error("Failed to save template image");
        }
      } else {
        throw new Error("Template renderer not available");
      }
    } catch (err) {
      console.error("Template save error:", err);
      toast.error(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const switchToOriginal = () => {
    if (originalImage) setActiveImage(originalImage);
  };

  const switchToEdited = () => {
    if (editedImage) setActiveImage(editedImage);
  };

  const handleReset = () => {
    setEditedImage(null);
    setActiveImage(originalImage);
    setPrompt("");
    setNegativePrompt("");
    setSearchPrompt("");
  };

  const handleDownload = async () => {
    const imageToDownload = editedImage || originalImage;
    if (!imageToDownload) return;

    try {
      const response = await fetch(imageToDownload);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${selectedEditTool}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // Loading skeleton
  if (isLoadingCampaigns && (!imageUrl || !campaignId)) {
    return (
      <AuthGate requiredRole="user">
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  // Show selection interface if no campaign or image is selected
  if (!imageUrl || !campaignId) {
    return (
      <AuthGate requiredRole="user">
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">
                AI Image Editor
              </h1>
              <p className="text-[var(--text-secondary)]">
                Select a campaign and image to start editing, or upload your own
                image
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Selection */}
              <div className="card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                  Select Campaign
                </h2>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => handleCampaignSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  <option value="">Choose a campaign...</option>
                  {availableCampaigns.map((campaign: any) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} (ID: {campaign.id})
                    </option>
                  ))}
                </select>

                {selectedCampaignId && isLoadingImages && (
                  <div className="mt-4 animate-pulse">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCampaignId &&
                  !isLoadingImages &&
                  availableImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2 text-[var(--text-primary)]">
                        Or select an existing image:
                      </h3>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {availableImages.map((img: any) => (
                          <div
                            key={img.id}
                            className={`cursor-pointer border-2 rounded overflow-hidden transition-all ${
                              originalImage === img.image_url
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-transparent hover:border-blue-300"
                            }`}
                            onClick={() => handleImageSelect(img.image_url)}
                          >
                            <img
                              src={img.image_url}
                              alt="Campaign image"
                              className="w-full h-24 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* File Upload */}
              <div className="card rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                  Upload Image
                </h2>
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg
                      className="w-12 h-12 mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span className="text-sm text-[var(--text-secondary)]">
                      Click to upload an image from your computer
                    </span>
                  </label>
                </div>

                {uploadedImageFile && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ✓ Selected: {uploadedImageFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview and Start Button */}
            {originalImage && (
              <div className="card rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                  Preview
                </h2>
                <div className="flex items-center gap-6">
                  <img
                    src={originalImage}
                    alt="Selected"
                    className="max-w-xs max-h-64 rounded-lg shadow-lg"
                  />
                  <div className="flex-1">
                    <button
                      onClick={startEditing}
                      disabled={!selectedCampaignId}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      Start Editing →
                    </button>
                    {!selectedCampaignId && (
                      <p className="text-sm text-red-600 mt-2">
                        Please select a campaign to continue
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AuthGate>
    );
  }

  const isFullWidthTool = selectedEditTool === "resize";

  return (
    <AuthGate requiredRole="user">
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
        {/* Top Toolbar */}
        <ImageEditorToolbar
          selectedDrawTool={selectedDrawTool}
          onDrawToolChange={setSelectedDrawTool}
          selectedEditTool={selectedEditTool}
          onEditToolChange={setSelectedEditTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onReset={handleReset}
          onDownload={handleDownload}
          isProcessing={isProcessing}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          {!isFullWidthTool && (
            <ImageEditorSidebar
              selectedEditTool={selectedEditTool}
              onEditToolChange={setSelectedEditTool}
              prompt={prompt}
              negativePrompt={negativePrompt}
              searchPrompt={searchPrompt}
              onPromptChange={setPrompt}
              onNegativePromptChange={setNegativePrompt}
              onSearchPromptChange={setSearchPrompt}
              outpaintLeft={outpaintLeft}
              outpaintRight={outpaintRight}
              outpaintUp={outpaintUp}
              outpaintDown={outpaintDown}
              creativity={creativity}
              onOutpaintLeftChange={setOutpaintLeft}
              onOutpaintRightChange={setOutpaintRight}
              onOutpaintUpChange={setOutpaintUp}
              onOutpaintDownChange={setOutpaintDown}
              onCreativityChange={setCreativity}
              onFilterSave={handleFilterSave}
              onApplyCollage={handleApplyCollage}
              onApplyTemplate={handleApplyTemplate}
              currentImageUrl={activeImage}
              isProcessing={isProcessing}
              hasTransparency={hasTransparency}
              selectedImages={collageSelectedImages}
            />
          )}

          {/* Main Canvas/Editor Area */}
          <div className="flex-1 overflow-auto">
            {selectedEditTool === "resize" ? (
              <SmartResize
                originalImage={activeImage}
                onSave={handleResizeSave}
                isProcessing={isProcessing}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageEditorCanvas
                  originalImage={activeImage}
                  editedImage={editedImage}
                  selectedEditTool={selectedEditTool}
                  selectedDrawTool={selectedDrawTool}
                  brushSize={brushSize}
                  onEdit={handleEdit}
                  onSaveOverlays={handleOverlaySave}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Image Preview */}
          {!isFullWidthTool && (
            <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-auto">
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
                Preview
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Original
                  </p>
                  <div
                    className={`border-2 rounded overflow-hidden cursor-pointer transition-all ${
                      activeImage === originalImage
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                    onClick={switchToOriginal}
                  >
                    {originalImage && (
                      <img
                        src={originalImage}
                        alt="Original"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                  {activeImage === originalImage && (
                    <p className="text-xs text-blue-600 mt-1 text-center font-medium">
                      ✓ Active
                    </p>
                  )}
                </div>

                {(editedImage || filterPreviewImage) && (
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
                      {selectedEditTool === "filters"
                        ? "Filtered Preview"
                        : `Edited (${selectedEditTool})`}
                    </p>
                    <div
                      className={`border-2 rounded overflow-hidden cursor-pointer transition-all ${
                        activeImage === (filterPreviewImage || editedImage)
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                      }`}
                      onClick={switchToEdited}
                    >
                      <img
                        src={filterPreviewImage || editedImage || ""}
                        alt="Edited"
                        className="w-full h-auto"
                      />
                    </div>
                    {activeImage === (filterPreviewImage || editedImage) && (
                      <p className="text-xs text-blue-600 mt-1 text-center font-medium">
                        ✓ Active
                      </p>
                    )}
                  </div>
                )}
              </div>

              <ToolSelector selectedTool={selectedEditTool} />
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
