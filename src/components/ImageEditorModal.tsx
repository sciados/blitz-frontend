// src/components/ImageEditorModal.tsx
// copied from Vercel - 8vHptHjZJ

"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage, Campaign } from "src/lib/types";

interface OverlayData {
  id: string;
  image_url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  z_index: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: GeneratedImage;
  campaignId: number;
  onSave: (image: GeneratedImage) => void;
}

export function ImageEditorModal({
  isOpen,
  onClose,
  sourceImage,
  campaignId,
  onSave,
}: ImageEditorModalProps) {
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [modalWidth, setModalWidth] = useState<number>(800);
  const [showCampaignImages, setShowCampaignImages] = useState(false);
  const [campaignImages, setCampaignImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, scale: 1 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId);

  // Calculate modal width when image dimensions change
  useEffect(() => {
    if (imageWidth > 0 && imageHeight > 0) {
      const sidebarWidth = 320;
      const paddingAndGaps = 64;
      const optimalWidth = imageWidth + sidebarWidth + paddingAndGaps;
      const maxViewportWidth =
        typeof window !== "undefined" ? window.innerWidth * 0.95 : optimalWidth;
      const newModalWidth = Math.min(optimalWidth, maxViewportWidth);
      setModalWidth(newModalWidth);
    }
  }, [imageWidth, imageHeight]);

  const fetchCampaignImages = async () => {
    try {
      setLoadingImages(true);
      const { data: campaign } = await api.get(`/api/campaigns/${campaignId}`);

      if (
        campaign.intelligence_data?.images &&
        Array.isArray(campaign.intelligence_data.images)
      ) {
        setCampaignImages(campaign.intelligence_data.images);
      } else {
        setCampaignImages([]);
      }
    } catch (error) {
      console.error("Failed to fetch campaign images:", error);
      toast.error("Failed to load campaign images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleBrowseCampaignImages = () => {
    setShowCampaignImages(true);
    if (campaignImages.length === 0) {
      fetchCampaignImages();
    }
  };

  const handleSelectCampaignImage = (imageUrl: string) => {
    handleImageUpload(imageUrl);
    setShowCampaignImages(false);
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const { data } = await api.post(`/api/campaigns/${campaignId}/overlays`, {
        image_url: imageUrl,
        image_source: "uploaded",
        position_x: 50,
        position_y: 50,
        scale: 1,
        rotation: 0,
        opacity: 1,
        z_index: overlays.length + 1,
      });

      const newOverlay: OverlayData = {
        id: data.id.toString(),
        image_url: data.image_url,
        x: data.position_x,
        y: data.position_y,
        scale: data.scale,
        rotation: data.rotation,
        opacity: data.opacity,
        z_index: data.z_index,
        naturalWidth: 200,
        naturalHeight: 200,
      };

      setOverlays([...overlays, newOverlay]);
      setSelectedOverlayId(newOverlay.id);
      toast.success("Image added successfully!");
    } catch (error) {
      console.error("Failed to add image:", error);
      toast.error("Failed to add image");
    }
  };

  const handleOverlayUpdate = (updatedOverlay: OverlayData) => {
    setOverlays(
      overlays.map((o) => (o.id === updatedOverlay.id ? updatedOverlay : o))
    );
  };

  const handleDeleteOverlay = (id: string) => {
    const updatedOverlays = overlays.filter((o) => o.id !== id);
    setOverlays(updatedOverlays);
    if (selectedOverlayId === id && updatedOverlays.length > 0) {
      setSelectedOverlayId(updatedOverlays[0].id);
    } else if (updatedOverlays.length === 0) {
      setSelectedOverlayId(null);
    }
  };

  // Trim transparent pixels from selected overlay
  const handleTrimTransparency = async () => {
    if (!selectedOverlay) return;

    setIsTrimming(true);
    try {
      const { data } = await api.post("/api/content/images/trim-transparency", {
        image_url: selectedOverlay.image_url,
        padding: 5,
        campaign_id: campaignId,
      });

      // Update the overlay with the new trimmed image URL and dimensions
      handleOverlayUpdate({
        ...selectedOverlay,
        image_url: data.image_url,
        naturalWidth: data.trimmed_width,
        naturalHeight: data.trimmed_height,
      });

      toast.success(
        `Trimmed from ${data.original_width}x${data.original_height} to ${data.trimmed_width}x${data.trimmed_height}`
      );
    } catch (error) {
      console.error("Failed to trim image:", error);
      toast.error("Failed to trim transparent pixels");
    } finally {
      setIsTrimming(false);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.stopPropagation();
    setSelectedOverlayId(overlayId);
    const overlay = overlays.find((o) => o.id === overlayId);
    if (!overlay || !imageRef.current || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate mouse position relative to IMAGE
    const imageOffsetX = imageRect.left - canvasRect.left;
    const imageOffsetY = imageRect.top - canvasRect.top;
    const mouseX = e.clientX - canvasRect.left - imageOffsetX;
    const mouseY = e.clientY - canvasRect.top - imageOffsetY;

    setIsDragging(true);
    // Store offset from mouse to overlay TOP-LEFT
    setDragStart({
      x: mouseX - overlay.x,
      y: mouseY - overlay.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && selectedOverlayId) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (!overlay || !imageRef.current || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();

      // Calculate mouse position relative to IMAGE
      const imageOffsetX = imageRect.left - canvasRect.left;
      const imageOffsetY = imageRect.top - canvasRect.top;
      const mouseX = e.clientX - canvasRect.left - imageOffsetX;
      const mouseY = e.clientY - canvasRect.top - imageOffsetY;

      // overlay.x/y stores TOP-LEFT position
      const overlayWidth = (overlay.naturalWidth && overlay.naturalWidth > 0) ? overlay.naturalWidth : 200;
      const overlayHeight = (overlay.naturalHeight && overlay.naturalHeight > 0) ? overlay.naturalHeight : 200;
      const scaledWidth = overlayWidth * overlay.scale;
      const scaledHeight = overlayHeight * overlay.scale;

      // Calculate new TOP-LEFT position
      const newTopLeftX = mouseX - dragStart.x;
      const newTopLeftY = mouseY - dragStart.y;

      // Constrain TOP-LEFT to keep overlay within image bounds
      const constrainedX = Math.max(0, Math.min(newTopLeftX, imageWidth - scaledWidth));
      const constrainedY = Math.max(0, Math.min(newTopLeftY, imageHeight - scaledHeight));

      handleOverlayUpdate({
        ...overlay,
        x: constrainedX,
        y: constrainedY,
      });
    } else if (isResizing && selectedOverlayId && resizeHandle) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (!overlay || !imageRef.current) return;

      const imageRect = imageRef.current.getBoundingClientRect();
      const mouseX = e.clientX - imageRect.left;
      const mouseY = e.clientY - imageRect.top;

      // Calculate overlay center (same as in handleResizeMouseDown)
      const overlayCenterX = overlay.x;
      const overlayCenterY = overlay.y;

      // Calculate current distance from center
      const currentDistanceX = mouseX - overlayCenterX;
      const currentDistanceY = mouseY - overlayCenterY;

      // Calculate how much the distance from center has changed
      const deltaDistanceX = currentDistanceX - resizeStart.x;
      const deltaDistanceY = currentDistanceY - resizeStart.y;

      // Calculate new scale based on change in distance from center
      // This is more stable than using absolute mouse position
      let newScale = resizeStart.scale;
      if (resizeHandle.includes("se") || resizeHandle.includes("ne")) {
        // Moving away from center increases scale
        newScale = Math.max(
          0.1,
          Math.min(resizeStart.scale + deltaDistanceX / 50, 3)
        );
      }
      if (resizeHandle.includes("sw") || resizeHandle.includes("nw")) {
        // Moving away from center in opposite direction decreases scale
        newScale = Math.max(
          0.1,
          Math.min(resizeStart.scale - deltaDistanceX / 50, 3)
        );
      }

      handleOverlayUpdate({
        ...overlay,
        scale: newScale,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Attach global mouse events when dragging/resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    selectedOverlayId,
    overlays,
    imageWidth,
    imageHeight,
  ]);

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (!selectedOverlayId) return;

    const overlay = overlays.find((o) => o.id === selectedOverlayId);
    if (!overlay || !imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the BACKGROUND IMAGE (not canvas)
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;

    // Calculate overlay center position (accounting for transformOrigin: center)
    const overlayWidth = (overlay.naturalWidth && overlay.naturalWidth > 0) ? overlay.naturalWidth : 200;
    const overlayHeight = (overlay.naturalHeight && overlay.naturalHeight > 0) ? overlay.naturalHeight : 200;
    const scaledWidth = overlayWidth * overlay.scale;
    const scaledHeight = overlayHeight * overlay.scale;

    // The overlay is positioned at overlay.x/y with transformOrigin: center
    // So the actual center is at overlay.x, overlay.y
    const overlayCenterX = overlay.x;
    const overlayCenterY = overlay.y;

    // Calculate distance from center when resize starts
    const distanceFromCenterX = mouseX - overlayCenterX;
    const distanceFromCenterY = mouseY - overlayCenterY;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: distanceFromCenterX,
      y: distanceFromCenterY,
      scale: overlay.scale,
    });
  };

  const handleSave = async () => {
    if (overlays.length === 0) {
      toast.error("No images to save");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare overlay data for backend
      // overlay.x/y stores TOP-LEFT position - send directly to backend
      const imageOverlays = overlays.map((overlay) => {
        console.log("DEBUG SAVE:", {
          topLeftX: overlay.x,
          topLeftY: overlay.y,
          scale: overlay.scale,
        });

        return {
          image_url: overlay.image_url,
          x: overlay.x,
          y: overlay.y,
          scale: overlay.scale,
          rotation: overlay.rotation,
          opacity: overlay.opacity,
          z_index: overlay.z_index,
        };
      });

      // Send to backend for composition
      const { data } = await api.post("/api/content/images/image-overlay", {
        image_url: sourceImage.image_url,
        image_overlays: imageOverlays,
        campaign_id: campaignId,
        image_type: sourceImage.image_type,
        style: sourceImage.style,
        aspect_ratio: sourceImage.aspect_ratio,
        provider: sourceImage.provider,
        model: sourceImage.model,
        prompt: sourceImage.prompt,
      });

      toast.success("Image with overlay saved successfully!");
      onSave(data);
      onClose();
    } catch (error) {
      console.error("Failed to save image:", error);
      toast.error("Failed to save image");
    } finally {
      setIsProcessing(false);
    }
  };

  // Client-side canvas composition for immediate preview
  const composeImageClientSide = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Load base image
      const baseImg = new Image();
      baseImg.crossOrigin = "anonymous";
      baseImg.onload = async () => {
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;

        // Draw base image
        ctx.drawImage(baseImg, 0, 0);

        // Draw overlays in order
        for (const overlay of overlays.sort((a, b) => a.z_index - b.z_index)) {
          const overlayImg = new Image();
          overlayImg.crossOrigin = "anonymous";

          await new Promise((imgResolve) => {
            overlayImg.onload = () => {
              ctx.save();

              // Apply transformations
              ctx.translate(overlay.x, overlay.y);
              ctx.rotate((overlay.rotation * Math.PI) / 180);
              ctx.scale(overlay.scale, overlay.scale);
              ctx.globalAlpha = overlay.opacity;

              // Draw centered
              ctx.drawImage(
                overlayImg,
                -overlayImg.width / 2,
                -overlayImg.height / 2
              );

              ctx.restore();
              imgResolve(null);
            };
            overlayImg.src = overlay.image_url;
          });
        }

        resolve(canvas.toDataURL("image/png"));
      };
      baseImg.src = sourceImage.image_url;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          width: `${modalWidth}px`,
          maxWidth: "95vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              🖼️ Image Editor - Premium Feature
            </h2>
            <button
              onClick={onClose}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Controls */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            {/* Image Dimensions */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <div
                className="text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                📐 Image Dimensions
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {imageWidth > 0 && imageHeight > 0
                  ? `${imageWidth} × ${imageHeight}px`
                  : "Loading..."}
              </div>
            </div>

            <div className="space-y-4">
              {/* Layers List */}
              {overlays.length > 0 && (
                <div>
                  <h3
                    className="font-normal mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Image Layers
                  </h3>
                  <div className="space-y-2">
                    {overlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className={`p-2 rounded border cursor-pointer transition ${
                          selectedOverlayId === overlay.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedOverlayId(overlay.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Layer {overlay.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOverlay(overlay.id);
                            }}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {overlay.image_url.split("/").pop()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transform Controls */}
              {selectedOverlay && (() => {
                // Calculate bounds - overlay.x/y is TOP-LEFT position
                const overlayWidth = (selectedOverlay.naturalWidth && selectedOverlay.naturalWidth > 0) ? selectedOverlay.naturalWidth : 200;
                const overlayHeight = (selectedOverlay.naturalHeight && selectedOverlay.naturalHeight > 0) ? selectedOverlay.naturalHeight : 200;
                const scaledWidth = overlayWidth * selectedOverlay.scale;
                const scaledHeight = overlayHeight * selectedOverlay.scale;

                // TOP-LEFT position bounds
                const minX = 0;
                const maxX = Math.max(0, imageWidth - scaledWidth);
                const minY = 0;
                const maxY = Math.max(0, imageHeight - scaledHeight);

                return (
                  <>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Position X: {Math.round(selectedOverlay.x)}px
                      </label>
                      <input
                        type="range"
                        min={minX}
                        max={maxX}
                        value={selectedOverlay.x}
                        onChange={(e) =>
                          handleOverlayUpdate({
                            ...selectedOverlay,
                            x: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Position Y: {Math.round(selectedOverlay.y)}px
                      </label>
                      <input
                        type="range"
                        min={minY}
                        max={maxY}
                        value={selectedOverlay.y}
                        onChange={(e) =>
                          handleOverlayUpdate({
                            ...selectedOverlay,
                            y: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Scale: {selectedOverlay.scale.toFixed(2)}x
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={selectedOverlay.scale}
                        onChange={(e) =>
                          handleOverlayUpdate({
                            ...selectedOverlay,
                            scale: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Rotation: {selectedOverlay.rotation}°
                      </label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedOverlay.rotation}
                        onChange={(e) =>
                          handleOverlayUpdate({
                            ...selectedOverlay,
                            rotation: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Opacity: {Math.round(selectedOverlay.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedOverlay.opacity}
                        onChange={(e) =>
                        handleOverlayUpdate({
                          ...selectedOverlay,
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                    </div>

                    {/* Trim Transparency Button */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleTrimTransparency}
                        disabled={isTrimming}
                        className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition flex items-center justify-center space-x-2"
                      >
                        {isTrimming ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Trimming...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                              />
                            </svg>
                            <span>Trim Transparency</span>
                          </>
                        )}
                      </button>
                      <p
                        className="text-xs mt-1 text-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Remove excess transparent pixels
                      </p>
                    </div>
                  </>
                );
              })()}

              {/* Browse Campaign Images Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleBrowseCampaignImages}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center justify-center space-x-2 mb-2"
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Browse Campaign Images</span>
                </button>

                {/* Upload Button */}
                <label className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer flex items-center justify-center space-x-2">
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload New Image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // TODO: Implement file upload to server/R2
                        toast.info("File upload not yet implemented");
                      }
                    }}
                  />
                </label>
                <p
                  className="text-xs mt-2 text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Use scraped images from campaign intelligence or upload your
                  own
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Image Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div
              ref={canvasRef}
              className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto"
              style={{
                minHeight: "calc(90vh - 220px)",
                paddingLeft: "2px",
              }}
            >
              <img
                ref={imageRef}
                src={sourceImage.image_url}
                alt="Source"
                className="select-none pointer-events-none"
                draggable={false}
                style={{
                  userSelect: "none",
                  pointerEvents: "none",
                  display: "block",
                  width: "auto",
                  height: "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setImageWidth(img.naturalWidth);
                  setImageHeight(img.naturalHeight);
                }}
              />

              {/* Overlay Images */}
              {overlays.map((overlay) => {
                // overlay.x/y stores TOP-LEFT position
                // CSS transform with transformOrigin: "0 0" scales from top-left
                // This makes positioning straightforward: overlay appears at (x, y)

                return (
                <div
                  key={overlay.id}
                  className="absolute"
                  style={{
                    // Position at TOP-LEFT coordinates
                    left: overlay.x,
                    top: overlay.y,
                    transform: `scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
                    transformOrigin: "0 0",  // Scale from top-left corner
                    zIndex: overlay.z_index,
                    cursor:
                      isDragging && selectedOverlayId === overlay.id
                        ? "grabbing"
                        : "grab",
                  }}
                  onMouseDown={(e) => handleMouseDown(e, overlay.id)}
                >
                  <img
                    src={overlay.image_url}
                    alt="Overlay"
                    className={`block ${
                      selectedOverlayId === overlay.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    style={{
                      opacity: overlay.opacity,
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                    draggable={false}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      handleOverlayUpdate({
                        ...overlay,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                      });
                    }}
                  />

                  {/* Resize handles - only show for selected overlay */}
                  {selectedOverlayId === overlay.id && (
                    <>
                      {/* Top-left handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-nw-resize"
                        style={{
                          left: -8,
                          top: -8,
                        }}
                        onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
                      />
                      {/* Top-right handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-ne-resize"
                        style={{
                          right: -8,
                          top: -8,
                        }}
                        onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
                      />
                      {/* Bottom-left handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-sw-resize"
                        style={{
                          left: -8,
                          bottom: -8,
                        }}
                        onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
                      />
                      {/* Bottom-right handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-sm cursor-se-resize"
                        style={{
                          right: -8,
                          bottom: -8,
                        }}
                        onMouseDown={(e) => handleResizeMouseDown(e, "se")}
                      />
                    </>
                  )}
                </div>
                );
              })}
            </div>

            <p
              className="text-xs mt-2 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              💡 Drag images to move them. Use the blue corner handles to
              resize. Use sliders for precise control.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            style={{ color: "var(--text-primary)" }}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing || overlays.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition font-medium flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Save with Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign Images Browser Modal */}
      {showCampaignImages && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  📸 Campaign Intelligence Images
                </h3>
                <button
                  onClick={() => setShowCampaignImages(false)}
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
            </div>

            <div className="flex-1 overflow-auto p-6">
              {loadingImages ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Loading campaign images...
                  </p>
                </div>
              ) : campaignImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {campaignImages.map((image, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 cursor-pointer transition"
                      onClick={() => handleSelectCampaignImage(image.r2_url)}
                    >
                      <div className="mb-2">
                        <img
                          src={image.r2_url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-32 object-contain rounded"
                        />
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {image.type || "Unknown"}
                      </div>
                      {image.quality_score && (
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Quality: {(image.quality_score * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Images Available
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    This campaign doesn't have any scraped images in its
                    intelligence data yet.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowCampaignImages(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                style={{ color: "var(--text-primary)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
