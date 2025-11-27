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

    // Calculate mouse position relative to the IMAGE (not canvas or viewport)
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;

    // Store the initial mouse position and layer position
    const initialMouseX = mouseX;
    const initialMouseY = mouseY;
    const initialLayerX = layer.x;
    const initialLayerY = layer.y;

    console.log(`[MOUSE] Started drag - layerId=${layerId}`);
    console.log(`[MOUSE] Canvas rect:`, canvasRect);
    console.log(`[MOUSE] Image rect:`, imageRect);
    console.log(
      `[MOUSE] Initial mouse (relative to image): (${initialMouseX}, ${initialMouseY})`
    );
    console.log(
      `[MOUSE] Initial layer position: (${initialLayerX}, ${initialLayerY})`
    );

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Calculate current mouse position relative to the IMAGE
      const currentMouseX = e.clientX - imageRect.left;
      const currentMouseY = e.clientY - imageRect.top;

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
      // Calculate scale factor between displayed image and actual image
      if (!canvasRef.current || !imageRef.current) {
        throw new Error("Canvas or image reference not available");
      }

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const imageElement = imageRef.current;

      // Get the actual image position within the canvas
      const imageRect = imageElement.getBoundingClientRect();

      console.log(
        "[SAVE] Canvas size:",
        canvasRect.width,
        "x",
        canvasRect.height
      );
      console.log(
        "[SAVE] Image natural size:",
        imageElement.naturalWidth,
        "x",
        imageElement.naturalHeight
      );
      console.log(
        "[SAVE] Image displayed size:",
        imageRect.width,
        "x",
        imageRect.height
      );
      console.log(
        "[SAVE] Modal display size:",
        window.innerWidth,
        "x",
        window.innerHeight
      );

      // Calculate UNIFORM scale factors from display to ORIGINAL size
      // Use the same scale for X, Y, and font size to maintain consistency
      const scaleX = imageElement.naturalWidth / imageRect.width;
      const scaleY = imageElement.naturalHeight / imageRect.height;

      // Use the MINIMUM scale to ensure everything fits proportionally at original resolution
      const uniformScale = Math.min(scaleX, scaleY);

      // Calculate the IMAGE OFFSET within the canvas (since image is centered with object-contain)
      // The imageRect gives us the image's position within the canvas
      const imageOffsetX = imageRect.left - canvasRect.left;
      const imageOffsetY = imageRect.top - canvasRect.top;

      console.log("[SAVE] Scale X:", scaleX, "Scale Y:", scaleY);
      console.log("[SAVE] Using uniform scale:", uniformScale);
      console.log("[SAVE] Canvas rect:", canvasRect);
      console.log("[SAVE] Image rect:", imageRect);
      console.log("[SAVE] Image offset in canvas:", { x: imageOffsetX, y: imageOffsetY });
      console.log("[SAVE] Active layer display coords:", {
        x: activeLayer.x,
        y: activeLayer.y,
        font_size: activeLayer.font_size,
      });

      // DEBUG: Show what happens with and without offset
      const xWithoutOffset = activeLayer.x * uniformScale;
      const yWithoutOffset = activeLayer.y * uniformScale;
      const xWithOffset = (activeLayer.x - imageOffsetX) * uniformScale;
      const yWithOffset = (activeLayer.y - imageOffsetY) * uniformScale;
      console.log("[SAVE] Without offset:", { x: xWithoutOffset, y: yWithoutOffset });
      console.log("[SAVE] With offset:", { x: xWithOffset, y: yWithOffset });

      // Calculate the DISPLAY SCALE (inverse of uniformScale)
      // The image is scaled down in the UI by uniformScale, so we need to scale coords back up
      const displayScale = uniformScale;
      console.log("[SAVE] Display scale:", displayScale);

      // Calculate font size based on ORIGINAL image size using uniform scale
      const finalFontSize = Math.round(activeLayer.font_size * uniformScale);

      // Calculate ascender compensation for Arial font
      // Arial ascender is ~80% of font size (105px at 131px size)
      const ascenderPercent = 0.8; // For Arial
      const ascenderPixels = Math.round(finalFontSize * ascenderPercent);
      console.log(
        "[SAVE] Calculated ascender compensation:",
        ascenderPixels,
        "px (",
        Math.round(ascenderPercent * 100),
        "% of font size)"
      );

      console.log(
        "[SAVE] Selected font size (display):",
        activeLayer.font_size,
        "px"
      );
      console.log(
        "[SAVE] Final font size (scaled to original):",
        finalFontSize,
        "px"
      );

      // Send ABSOLUTE pixel coordinates (not percentages) based on ORIGINAL image size
      // This ensures precise positioning at full resolution
      const scaledTextLayers = textLayers.map(({ id, ...layer }) => {
        // Convert display coordinates to ORIGINAL image coordinates
        // The image is scaled down in the UI, so multiply by uniformScale
        // Use Math.floor to avoid rounding up (which could place text too far)
        const originalX = Math.floor(layer.x * uniformScale);
        const originalY = Math.floor(layer.y * uniformScale);

        console.log(
          `[SAVE] Layer ${id}: display (${layer.x}, ${layer.y}) → original (${originalX}, ${originalY})`
        );
        console.log(`[SAVE] Layer ${id}: font ${finalFontSize}px`);

        return {
          id,
          ...layer,
          x: originalX, // Absolute pixel coordinate on ORIGINAL image
          y: originalY, // Absolute pixel coordinate on ORIGINAL image (backend handles positioning)
          font_size: finalFontSize, // Absolute font size for ORIGINAL image
        };
      });

      console.log(
        "[SAVE] Final scaled text layers:",
        JSON.stringify(
          scaledTextLayers.map(({ id, x, y, font_size }) => ({
            id,
            x,
            y,
            font_size,
          })),
          null,
          2
        )
      );

      console.log("[SAVE] Original layer:", textLayers[0]);
      console.log("[SAVE] Scaled layer:", scaledTextLayers[0]);

      // Log the payload before sending
      const payload = {
        image_url: sourceImage.image_url,
        text_layers: scaledTextLayers,
        campaign_id: campaignId,
        image_type: sourceImage.image_type,
        style: sourceImage.style,
        aspect_ratio: sourceImage.aspect_ratio,
        // DON'T send display dimensions - keep full resolution for marketing
        // display_width: undefined,
        // display_height: undefined,
      };

      console.log(
        "[SAVE] Sending scaled text layers to backend:",
        JSON.stringify(scaledTextLayers, null, 2)
      );

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
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
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas */}
            <div className="lg:col-span-2">
              <div
                ref={canvasRef}
                className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                style={{
                  aspectRatio: getAspectRatio(sourceImage.aspect_ratio),
                }}
              >
                <img
                  ref={imageRef}
                  src={sourceImage.image_url}
                  alt="Source"
                  className="w-full h-full object-contain select-none pointer-events-none"
                  draggable={false}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                />

                {/* Text Layers */}
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
                💡 Click and drag text to position it. Select a layer below to
                edit its properties.
              </p>
            </div>

            {/* Controls */}
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
