"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage } from "src/lib/types";

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  font_size: number; // Base font size
  font_family: string;
  color: string;
  stroke_color?: string;
  stroke_width: number;
  opacity: number;
  // Percentage-based positioning for consistent placement across image sizes
  x_percent?: number;
  y_percent?: number;
  font_size_percent?: number;
}

interface FontOption {
  value: string;
  label: string;
}

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: GeneratedImage;
  campaignId: number;
  onSave: (image: GeneratedImage) => void;
}

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
  "#000080",
  "#008000",
];

// Text Editor Modal - Simple coordinate positioning
export function TextEditorModal({
  isOpen,
  onClose,
  sourceImage,
  campaignId,
  onSave,
}: TextEditorModalProps) {
  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    {
      id: "1",
      text: "Your Text Here",
      x: 50,
      y: 50,
      font_size: 48,
      font_family: "Arial", // Will be updated after fonts load
      color: "#FFFFFF",
      stroke_color: "#000000",
      stroke_width: 2,
      opacity: 1.0,
    },
  ]);

  const [activeLayerId, setActiveLayerId] = useState<string>("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeLayer = textLayers.find((layer) => layer.id === activeLayerId);

  // Fetch available fonts when modal opens
  useEffect(() => {
    if (isOpen) {
      setFontsLoading(true);
      api
        .get("/api/content/images/fonts")
        .then(({ data }) => {
          console.log("📝 Loaded fonts:", data);
          setFonts(data);

          // Update default font if not set or not in available fonts
          if (data && data.length > 0) {
            setTextLayers((prev) =>
              prev.map((layer) => ({
                ...layer,
                font_family: data[0].value, // Use first available font
              }))
            );
          }
        })
        .catch((err) => {
          console.error("Failed to load fonts:", err);
          // Fallback to default fonts
          setFonts([
            { value: "Arial", label: "Arial" },
            { value: "Helvetica", label: "Helvetica" },
            { value: "Times New Roman", label: "Times New Roman" },
          ]);
          toast.error("Failed to load fonts");
        })
        .finally(() => {
          setFontsLoading(false);
        });
    }
  }, [isOpen]);

  // Reset layers when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      const defaultFont = fonts.length > 0 ? fonts[0].value : "Arial";
      setTextLayers([
        {
          id: "1",
          text: "Your Text Here",
          x: 50,
          y: 50,
          font_size: 48, // Keep as base size
          font_family: defaultFont,
          color: "#FFFFFF",
          stroke_color: "#000000",
          stroke_width: 2,
          opacity: 1.0,
        },
      ]);
      setActiveLayerId("1");
      setImageWidth(0); // Reset for new image
      setImageHeight(0); // Reset for new image
    }
  }, [isOpen, sourceImage.id, fonts]);

  const handleAddTextLayer = () => {
    const newId = (textLayers.length + 1).toString();
    const defaultFont = fonts.length > 0 ? fonts[0].value : "Arial";
    setTextLayers([
      ...textLayers,
      {
        id: newId,
        text: "New Text",
        x: 100,
        y: 100,
        font_size: 36, // Keep as base size
        font_family: defaultFont,
        color: "#FFFFFF",
        stroke_width: 0,
        opacity: 1.0,
      },
    ]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (textLayers.length === 1) return; // Keep at least one layer
    const updatedLayers = textLayers.filter((layer) => layer.id !== id);
    setTextLayers(updatedLayers);
    if (activeLayerId === id && updatedLayers.length > 0) {
      setActiveLayerId(updatedLayers[0].id);
    }
  };

  const handleLayerChange = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(
      textLayers.map((layer) => {
        if (layer.id === id) {
          const updated = { ...layer, ...updates };
          console.log(
            `[STATE] Layer updated - x: ${updated.x}, y: ${updated.y}`
          );
          return updated;
        }
        return layer;
      })
    );
  };

  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canvasRef.current || !imageRef.current) return;

    const layer = textLayers.find((l) => l.id === layerId);
    if (!layer) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the CANVAS (where text layers are positioned)
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    // Store the initial mouse position and layer position
    const initialMouseX = mouseX;
    const initialMouseY = mouseY;
    const initialLayerX = layer.x;
    const initialLayerY = layer.y;

    console.log(`[MOUSE] Started drag - layerId=${layerId}`);
    console.log(`[MOUSE] Canvas rect:`, canvasRect);
    console.log(`[MOUSE] Image rect:`, imageRect);
    console.log(
      `[MOUSE] Initial mouse (relative to canvas): (${initialMouseX}, ${initialMouseY})`
    );
    console.log(
      `[MOUSE] Initial layer position: (${initialLayerX}, ${initialLayerY})`
    );

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Calculate current mouse position relative to the CANVAS
      const currentMouseX = e.clientX - canvasRect.left;
      const currentMouseY = e.clientY - canvasRect.top;

      // Calculate movement delta
      const deltaX = currentMouseX - initialMouseX;
      const deltaY = currentMouseY - initialMouseY;

      // Apply delta to initial layer position
      const newX = initialLayerX + deltaX;
      const newY = initialLayerY + deltaY;

      console.log(
        `[DRAG] Current mouse (relative to image): (${currentMouseX}, ${currentMouseY})`
      );
      console.log(
        `[DRAG] deltaX=${deltaX}, deltaY=${deltaY}, newX=${newX}, newY=${newY}`
      );

      // Update both x and y in a single state update to avoid batching issues
      handleLayerChange(layerId, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleSave = async () => {
    if (!activeLayer) return;

    setIsProcessing(true);

    try {
      // Full-size image: coordinates map 1:1 (no scaling needed!)
      if (!canvasRef.current || !imageRef.current) {
        throw new Error("Canvas or image reference not available");
      }

      const imageElement = imageRef.current;

      console.log(
        "[SAVE] Full size image dimensions:",
        imageElement.naturalWidth,
        "x",
        imageElement.naturalHeight
      );

      // Send coordinates DIRECTLY - no scaling calculation needed!
      // Use floats for sub-pixel precision!
      const textLayersToSend = textLayers.map(({ id, ...layer }) => {
        console.log(
          `[SAVE] Layer ${id}: (${layer.x}, ${layer.y}), font=${layer.font_size}px`
        );

        return {
          id,
          ...layer,
          x: layer.x, // Float - supports sub-pixel precision!
          y: layer.y, // Float - supports sub-pixel precision!
          font_size: Math.round(layer.font_size),
        };
      });

      console.log(
        "[SAVE] Sending text layers (direct coords, no scaling):",
        JSON.stringify(
          textLayersToSend.map(({ id, x, y, font_size }) => ({
            id,
            x,
            y,
            font_size,
          })),
          null,
          2
        )
      );

      // Log the payload before sending
      const payload = {
        image_url: sourceImage.image_url,
        text_layers: textLayersToSend,
        campaign_id: campaignId,
        image_type: sourceImage.image_type,
        style: sourceImage.style,
        aspect_ratio: sourceImage.aspect_ratio,
      };

      console.log("[SAVE] Payload prepared, sending to backend...");

      const { data } = await api.post(
        "/api/content/images/text-overlay",
        payload
      );

      toast.success("Text overlay added successfully!");
      onSave(data);
      onClose();
    } catch (err: any) {
      console.error("[SAVE] Error:", err);
      toast.error(err.response?.data?.detail || "Failed to add text overlay");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Calculate optimal modal width based on image width
  // Sidebar is 320px (w-80), plus gaps and padding
  const sidebarWidth = 320;
  const paddingAndGaps = 64; // header/footer padding + gaps between sections
  const optimalWidth = imageWidth > 0 ? imageWidth + sidebarWidth + paddingAndGaps : 800;
  const maxViewportWidth = typeof window !== "undefined" ? window.innerWidth * 0.95 : optimalWidth;
  const modalWidth = Math.min(optimalWidth, maxViewportWidth);

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
              ✨ Text Editor - Premium Feature
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
              <div className="text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                📐 Image Dimensions
              </div>
              <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {imageWidth > 0 && imageHeight > 0
                  ? `${imageWidth} × ${imageHeight}px`
                  : "Loading..."}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3
                  className="font-normal mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Text Layers
                </h3>
                <div className="space-y-2">
                  {textLayers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-2 rounded border cursor-pointer transition ${
                        activeLayerId === layer.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => setActiveLayerId(layer.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Layer {layer.id}
                        </span>
                        {textLayers.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLayer(layer.id);
                            }}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {layer.text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddTextLayer}
                  className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
                >
                  + Add Text Layer
                </button>
              </div>

              {activeLayer && (
                <>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Text
                    </label>
                    <textarea
                      value={activeLayer.text}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          text: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                      rows={2}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Font Size: {activeLayer.font_size}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={activeLayer.font_size}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          font_size: parseInt(e.target.value),
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
                      Font Family {fontsLoading && "(Loading...)"}
                    </label>
                    <select
                      value={activeLayer.font_family}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          font_family: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                      disabled={fontsLoading}
                    >
                      {fontsLoading ? (
                        <option value="">Loading fonts...</option>
                      ) : fonts.length > 0 ? (
                        fonts.map((font) => (
                          <option
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </option>
                        ))
                      ) : (
                        <option value="Arial">Arial (default)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Text Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            handleLayerChange(activeLayer.id, { color })
                          }
                          className={`w-full aspect-square rounded border-2 ${
                            activeLayer.color === color
                              ? "border-gray-800 dark:border-white"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={activeLayer.color}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-full mt-2 h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Stroke Width: {activeLayer.stroke_width}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={activeLayer.stroke_width}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          stroke_width: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  {activeLayer.stroke_width > 0 && (
                    <div>
                      <label
                        className="block text-sm font-medium mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Stroke Color
                      </label>
                      <input
                        type="color"
                        value={activeLayer.stroke_color || "#000000"}
                        onChange={(e) =>
                          handleLayerChange(activeLayer.id, {
                            stroke_color: e.target.value,
                          })
                        }
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Opacity: {Math.round(activeLayer.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={activeLayer.opacity}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, {
                          opacity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Image Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div
              ref={canvasRef}
              className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto"
              style={{
                minHeight: "calc(90vh - 220px)",
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
                  // Store natural dimensions for reference
                  const img = e.currentTarget;
                  console.log("[LOAD] Full size image:", img.naturalWidth, "x", img.naturalHeight);
                  console.log("[LOAD] Display size:", img.width, "x", img.height);
                  setImageWidth(img.naturalWidth);
                  setImageHeight(img.naturalHeight);
                }}
              />

              {/* Text Layers - Full Size Coordinates */}
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  className={`absolute cursor-move ${
                    activeLayerId === layer.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{
                    left: layer.x,
                    top: layer.y,
                    fontSize: layer.font_size,
                    fontFamily: layer.font_family,
                    color: layer.color,
                    opacity: layer.opacity,
                    whiteSpace: "nowrap",
                    position: "absolute",
                    display: "inline-block",
                    WebkitTextStroke:
                      layer.stroke_width > 0
                        ? `${layer.stroke_width}px ${
                            layer.stroke_color || "#000"
                          }`
                        : "none",
                    textShadow:
                      layer.stroke_width > 0
                        ? `0 0 ${layer.stroke_width}px ${
                            layer.stroke_color || "#000"
                          }`
                        : "none",
                  }}
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <span
                    style={{ display: "inline-block", pointerEvents: "none" }}
                  >
                    {layer.text}
                  </span>
                  {/* Debug indicator - shows position */}
                  {activeLayerId === layer.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        left: 0,
                        fontSize: 20,
                        color: "black",
                        background: "white",
                        padding: "3px 6px",
                        borderRadius: 2,
                        pointerEvents: "none",
                        fontWeight: "normal",
                      }}
                    >
                      x: {Math.round(layer.x)}, y: {Math.round(layer.y)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p
              className="text-xs mt-2 text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              💡 Click and drag text to position it. Select a layer on the left to
              edit its properties.
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
            disabled={isProcessing}
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
                <span>Save with Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getAspectRatio(aspectRatio: string): string {
  switch (aspectRatio) {
    case "1:1":
      return "1";
    case "16:9":
      return "16/9";
    case "9:16":
      return "9/16";
    case "4:3":
      return "4/3";
    case "21:9":
      return "21/9";
    default:
      return "1";
  }
}
