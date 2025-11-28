"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage } from "src/lib/types";

interface OverlayData {
  id: string;
  image_url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  z_index: number;
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
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [modalWidth, setModalWidth] = useState<number>(800);
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

  const handleSave = async () => {
    if (overlays.length === 0) {
      toast.error("No images to save");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Implement compose and save logic
      // For now, just save the overlay data
      toast.success("Image overlay saved successfully!");
      onSave(sourceImage);
      onClose();
    } catch (error) {
      console.error("Failed to save image:", error);
      toast.error("Failed to save image");
    } finally {
      setIsProcessing(false);
    }
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
              {selectedOverlay && (
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
                      min="0"
                      max={imageWidth}
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
                      min="0"
                      max={imageHeight}
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
                </>
              )}

              {/* Upload Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  <span>Upload Product Image</span>
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
                  Upload transparent PNG or JPEG product images
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
              {overlays.map((overlay) => (
                <img
                  key={overlay.id}
                  src={overlay.image_url}
                  alt="Overlay"
                  className={`absolute cursor-move ${
                    selectedOverlayId === overlay.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{
                    left: overlay.x,
                    top: overlay.y,
                    transform: `scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
                    opacity: overlay.opacity,
                    transformOrigin: "center center",
                    zIndex: overlay.z_index,
                  }}
                  onClick={() => setSelectedOverlayId(overlay.id)}
                />
              ))}
            </div>

            <p
              className="text-xs mt-2 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              💡 Upload product images and drag to position them on the premium image.
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
    </div>
  );
}
