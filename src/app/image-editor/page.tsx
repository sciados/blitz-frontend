"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  | "filters";

export default function ImageEditorPage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const campaignId = searchParams.get("campaignId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter preview state - shows filtered image before saving to R2
  const [filterPreviewImage, setFilterPreviewImage] = useState<string | null>(null);

  // Tool states
  const [selectedEditTool, setSelectedEditTool] = useState<EditTool>("inpaint");
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
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);

  useEffect(() => {
    // If both parameters are provided, load the image directly
    if (imageUrl && campaignId) {
      setOriginalImage(imageUrl);
      setActiveImage(imageUrl);
      setLoading(false);
    } else {
      // No parameters - show selection interface and fetch campaigns
      setLoading(false);
      fetchCampaigns();
    }
  }, [imageUrl, campaignId]);

  // Fetch campaigns for selection
  const fetchCampaigns = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiBaseUrl}/api/campaigns`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      setAvailableCampaigns(data || []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  // Handle campaign selection
  const handleCampaignSelect = async (campaignId: string) => {
    setSelectedCampaignId(campaignId);

    if (campaignId) {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
        const token = localStorage.getItem("token");

        // Fetch images for this campaign
        const response = await fetch(`${apiBaseUrl}/api/content/campaign/${campaignId}/images`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        const data = await response.json();
        setAvailableImages(data.images || []);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImageFile(file);

      // Convert to data URL (base64) for persistence across page reloads
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
      alert("Please select a campaign");
      return;
    }

    if (!originalImage) {
      alert("Please select or upload an image");
      return;
    }

    // Update URL with selected parameters
    const params = new URLSearchParams(window.location.search);
    params.set("campaignId", selectedCampaignId);
    params.set("imageUrl", originalImage);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    // Update state
    window.location.reload();
  };

  const handleEdit = async (maskDataUrl?: string) => {
    if (!campaignId || !imageUrl) {
      alert("Missing campaign ID or image URL");
      return;
    }

    // Validation based on tool
    if (
      ["inpaint", "search-replace", "upscale"].includes(selectedEditTool) &&
      !prompt
    ) {
      alert("Please enter a prompt");
      return;
    }

    if (selectedEditTool === "search-replace" && !searchPrompt) {
      alert("Please enter a search prompt");
      return;
    }

    if (["inpaint", "erase"].includes(selectedEditTool) && !maskDataUrl) {
      alert("Please paint a mask first");
      return;
    }

    setIsProcessing(true);

    try {
      // Use environment variable for backend API URL
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("image_url", imageUrl);
      formData.append("campaign_id", campaignId);
      formData.append("output_format", "png");

      let endpoint = "";

      switch (selectedEditTool) {
        case "inpaint":
          endpoint = `${apiBaseUrl}/api/image-editor/inpaint`;
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          if (maskDataUrl) formData.append("mask_image_data", maskDataUrl);
          formData.append("seed", seed.toString());
          break;

        case "erase":
          endpoint = `${apiBaseUrl}/api/image-editor/erase`;
          if (maskDataUrl) formData.append("mask_image_data", maskDataUrl);
          formData.append("seed", seed.toString());
          break;

        case "background-remove":
          endpoint = `${apiBaseUrl}/api/image-editor/remove-background`;
          break;

        case "search-replace":
          endpoint = `${apiBaseUrl}/api/image-editor/search-replace`;
          formData.append("search_prompt", searchPrompt);
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("seed", seed.toString());
          break;

        case "outpaint":
          endpoint = `${apiBaseUrl}/api/image-editor/outpaint`;
          formData.append("prompt", prompt);
          formData.append("left", outpaintLeft.toString());
          formData.append("right", outpaintRight.toString());
          formData.append("up", outpaintUp.toString());
          formData.append("down", outpaintDown.toString());
          formData.append("creativity", creativity.toString());
          formData.append("seed", seed.toString());
          break;

        case "upscale":
          endpoint = `${apiBaseUrl}/api/image-editor/upscale`;
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("creativity", "0.35");
          formData.append("seed", seed.toString());
          break;

        case "sketch-to-image":
          endpoint = `${apiBaseUrl}/api/image-editor/sketch-to-image`;
          formData.append("prompt", prompt);
          if (negativePrompt)
            formData.append("negative_prompt", negativePrompt);
          formData.append("control_strength", "0.7");
          formData.append("seed", seed.toString());
          break;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success && result.edited_image_url) {
        setEditedImage(result.edited_image_url);
        setActiveImage(result.edited_image_url); // Automatically switch to the edited image
      } else {
        throw new Error("Failed to generate edited image");
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverlaySave = async (overlayImageDataUrl: string) => {
    if (!campaignId || !imageUrl) {
      alert("Missing campaign ID or image URL");
      return;
    }

    setIsProcessing(true);

    try {
      // Use environment variable for backend API URL
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const token = localStorage.getItem("token");

      // Upload the overlay image (data URL) to R2 storage first
      const uploadResponse = await fetch(`${apiBaseUrl}/api/images/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
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
            edit_tool: "overlay"
          }
        }),
      });

      const result = await uploadResponse.json();

      if (result.id || result.image_url) {
        setEditedImage(result.image_url);
        setActiveImage(result.image_url); // Automatically switch to the edited image
        alert("Overlay image saved successfully!");
      } else {
        throw new Error("Failed to save overlay image");
      }
    } catch (err) {
      alert(`Error saving overlay: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResizeSave = async (resizedImageDataUrl: string, preset: string) => {
    if (!campaignId || !imageUrl) {
      alert("Missing campaign ID or image URL");
      return;
    }

    setEditedImage(resizedImageDataUrl);
    setActiveImage(resizedImageDataUrl); // Automatically switch to the resized image

    setIsProcessing(true);

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const token = localStorage.getItem("token");

      // Save resized image with metadata marking it as edited
      const uploadResponse = await fetch(`${apiBaseUrl}/api/images/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
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
            preset: preset
          }
        }),
      });

      const result = await uploadResponse.json();

      if (!result.id && !result.image_url) {
        throw new Error("Failed to save resized image");
      }
    } catch (err) {
      console.error(`Error saving resized image: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleFilterSave = async (filteredImageDataUrl: string) => {
    if (!campaignId || !imageUrl) {
      alert("Missing campaign ID or image URL");
      return;
    }

    // Update preview immediately (user can see it right away)
    setFilterPreviewImage(filteredImageDataUrl);
    setEditedImage(filteredImageDataUrl);
    setActiveImage(filteredImageDataUrl);

    setIsProcessing(true);

    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

      const token = localStorage.getItem("token");

      // Save with metadata marking it as edited
      const uploadResponse = await fetch(`${apiBaseUrl}/api/images/save-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
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
            edit_tool: "filters"
          }
        }),
      });

      const result = await uploadResponse.json();

      if (result.id || result.image_url) {
        console.log("Filtered image saved successfully!");
      } else {
        throw new Error("Failed to save filtered image");
      }
    } catch (err) {
      console.error(`Error saving filtered image: ${err instanceof Error ? err.message : "Unknown error"}`);
      // Don't alert user since we already showed the preview
    } finally {
      setIsProcessing(false);
    }
  };


  // Switch active image for editing
  const switchToOriginal = () => {
    if (originalImage) {
      setActiveImage(originalImage);
    }
  };

  const switchToEdited = () => {
    if (editedImage) {
      setActiveImage(editedImage);
    }
  };

  const handleReset = () => {
    setEditedImage(null);
    setActiveImage(originalImage); // Reset to original image
    setPrompt("");
    setNegativePrompt("");
    setSearchPrompt("");
  };

  const handleDownload = async () => {
    const imageToDownload = editedImage || originalImage;
    if (!imageToDownload) return;

    try {
      // Fetch the image as a blob (same approach as Content Library)
      const response = await fetch(imageToDownload);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-${selectedEditTool}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download image");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading image editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show selection interface if no campaign or image is selected
  if (!imageUrl || !campaignId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              AI Image Editor
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Select a campaign and image to start editing, or upload your own image
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Selection */}
            <div className="card rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Select Campaign
              </h2>
              <select
                value={selectedCampaignId}
                onChange={(e) => handleCampaignSelect(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                <option value="">Choose a campaign...</option>
                {availableCampaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name} (ID: {campaign.id})
                  </option>
                ))}
              </select>

              {selectedCampaignId && availableImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Or select an existing image:
                  </h3>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {availableImages.map((img) => (
                      <div
                        key={img.id}
                        className="cursor-pointer border-2 border-transparent hover:border-blue-500 rounded overflow-hidden"
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
              <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Upload Image
              </h2>
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-8 text-center">
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
                  <span className="text-sm text-gray-600">
                    Click to upload an image from your computer
                  </span>
                </label>
              </div>

              {uploadedImageFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Selected: {uploadedImageFile.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview and Start Button */}
          {originalImage && (
            <div className="card rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Preview
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={originalImage}
                  alt="Selected"
                  className="max-w-xs max-h-64 rounded-lg shadow"
                />
                <div className="flex-1">
                  <button
                    onClick={startEditing}
                    disabled={!selectedCampaignId}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  >
                    Start Editing
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
    );
  }

  const isFullWidthTool = selectedEditTool === "resize";

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Toolbar */}
      <ImageEditorToolbar
        selectedTool={selectedDrawTool}
        onToolChange={setSelectedDrawTool}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onReset={handleReset}
        onDownload={handleDownload}
            isProcessing={isProcessing}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tool Selector & Settings (hide for full-width tools) */}
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
            isProcessing={isProcessing}
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

        {/* Right Panel - Image Preview (hide for full-width tools) */}
        {!isFullWidthTool && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-auto">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Original
                </p>
                <div
                  className={`border-2 rounded overflow-hidden cursor-pointer transition-all ${
                    activeImage === originalImage
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-300 hover:border-gray-400"
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
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {selectedEditTool === "filters" ? "Filtered Preview" : `Edited (${selectedEditTool})`}
                  </p>
                  <div
                    className={`border-2 rounded overflow-hidden cursor-pointer transition-all ${
                      activeImage === (filterPreviewImage || editedImage)
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={switchToEdited}
                  >
                    <img
                      src={filterPreviewImage || editedImage || ""}
                      alt="Edited"
                      className="w-full h-auto"
                    />
                  </div>
                  {(filterPreviewImage || editedImage) && activeImage === (filterPreviewImage || editedImage) && (
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
  );
}
