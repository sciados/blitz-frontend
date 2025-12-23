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
  | "resize";

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

  useEffect(() => {
    if (!imageUrl || !campaignId) {
      setError("Missing required parameters: imageUrl and campaignId");
      setLoading(false);
      return;
    }

    setOriginalImage(imageUrl);
    setActiveImage(imageUrl); // Set the original as the initial active image
    setLoading(false);
  }, [imageUrl, campaignId]);

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
      console.error("Edit error:", err);
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

      // Convert data URL to blob
      const response = await fetch(overlayImageDataUrl);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("image", blob, `overlay-${Date.now()}.png`);
      formData.append("campaign_id", campaignId);
      formData.append("metadata", JSON.stringify({
        tool: "overlay",
        original_image: imageUrl,
        overlays: "text_and_image"
      }));

      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(`${apiBaseUrl}/api/content/images`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await uploadResponse.json();

      if (result.success && result.image_url) {
        setEditedImage(result.image_url);
        setActiveImage(result.image_url); // Automatically switch to the edited image
        alert("Overlay image saved successfully!");
      } else {
        throw new Error("Failed to save overlay image");
      }
    } catch (err) {
      console.error("Overlay save error:", err);
      alert(`Error saving overlay: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResizeSave = (resizedImageDataUrl: string, preset: string) => {
    setEditedImage(resizedImageDataUrl);
    setActiveImage(resizedImageDataUrl); // Automatically switch to the resized image
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
      console.error("Download failed:", error);
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

              {editedImage && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Edited ({selectedEditTool})
                  </p>
                  <div
                    className={`border-2 rounded overflow-hidden cursor-pointer transition-all ${
                      activeImage === editedImage
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={switchToEdited}
                  >
                    <img
                      src={editedImage}
                      alt="Edited"
                      className="w-full h-auto"
                    />
                  </div>
                  {activeImage === editedImage && (
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
