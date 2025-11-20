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
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor?: string;
  strokeWidth: number;
  opacity: number;
}

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: GeneratedImage;
  campaignId: number;
  onSave: (image: GeneratedImage) => void;
}

const FONT_FAMILIES = [
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Impact", label: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
];

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#FFC0CB", "#A52A2A", "#808080", "#000080", "#008000"
];

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
      fontSize: 48,
      fontFamily: "Arial",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 2,
      opacity: 1.0,
    },
  ]);

  const [activeLayerId, setActiveLayerId] = useState<string>("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeLayer = textLayers.find((layer) => layer.id === activeLayerId);

  // Reset layers when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setTextLayers([
        {
          id: "1",
          text: "Your Text Here",
          x: 50,
          y: 50,
          fontSize: 48,
          fontFamily: "Arial",
          color: "#FFFFFF",
          strokeColor: "#000000",
          strokeWidth: 2,
          opacity: 1.0,
        },
      ]);
      setActiveLayerId("1");
    }
  }, [isOpen, sourceImage.id]);

  const handleAddTextLayer = () => {
    const newId = (textLayers.length + 1).toString();
    setTextLayers([
      ...textLayers,
      {
        id: newId,
        text: "New Text",
        x: 100,
        y: 100,
        fontSize: 36,
        fontFamily: "Arial",
        color: "#FFFFFF",
        strokeWidth: 0,
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

  const handleLayerChange = (id: string, field: keyof TextLayer, value: any) => {
    setTextLayers(
      textLayers.map((layer) =>
        layer.id === id ? { ...layer, [field]: value } : layer
      )
    );
  };

  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const layer = textLayers.find((l) => l.id === layerId);
    if (!layer) return;

    const offsetX = startX - layer.x;
    const offsetY = startY - layer.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - rect.left - offsetX;
      const newY = e.clientY - rect.top - offsetY;

      handleLayerChange(layerId, "x", Math.max(0, newX));
      handleLayerChange(layerId, "y", Math.max(0, newY));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSave = async () => {
    if (!activeLayer) return;

    setIsProcessing(true);

    try {
      const { data } = await api.post("/api/content/images/text-overlay", {
        image_url: sourceImage.image_url,
        text_layers: textLayers.map(({ id, ...layer }) => layer),
        campaign_id: campaignId,
        image_type: sourceImage.image_type,
        style: sourceImage.style,
        aspect_ratio: sourceImage.aspect_ratio,
      });

      toast.success("Text overlay added successfully!");
      onSave(data);
      onClose();
    } catch (err: any) {
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
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              ✨ Text Editor - Premium Feature
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                style={{ aspectRatio: getAspectRatio(sourceImage.aspect_ratio) }}
              >
                <img
                  ref={imageRef}
                  src={sourceImage.image_url}
                  alt="Source"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />

                {/* Text Layers */}
                {textLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`absolute cursor-move ${activeLayerId === layer.id ? "ring-2 ring-blue-500" : ""}`}
                    style={{
                      left: layer.x,
                      top: layer.y,
                      fontSize: layer.fontSize,
                      fontFamily: layer.fontFamily,
                      color: layer.color,
                      opacity: layer.opacity,
                      WebkitTextStroke: layer.strokeWidth > 0 ? `${layer.strokeWidth}px ${layer.strokeColor || "#000"}` : "none",
                      textShadow: layer.strokeWidth > 0 ? `0 0 ${layer.strokeWidth}px ${layer.strokeColor || "#000"}` : "none",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, layer.id)}
                    onClick={() => setActiveLayerId(layer.id)}
                  >
                    {layer.text}
                  </div>
                ))}
              </div>

              <p className="text-xs mt-2 text-center" style={{ color: "var(--text-secondary)" }}>
                💡 Click and drag text to position it. Select a layer below to edit its properties.
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
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
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
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
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
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
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Text
                    </label>
                    <textarea
                      value={activeLayer.text}
                      onChange={(e) => handleLayerChange(activeLayer.id, "text", e.target.value)}
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
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Font Size: {activeLayer.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={activeLayer.fontSize}
                      onChange={(e) => handleLayerChange(activeLayer.id, "fontSize", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Font Family
                    </label>
                    <select
                      value={activeLayer.fontFamily}
                      onChange={(e) => handleLayerChange(activeLayer.id, "fontFamily", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {FONT_FAMILIES.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Text Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleLayerChange(activeLayer.id, "color", color)}
                          className={`w-full aspect-square rounded border-2 ${
                            activeLayer.color === color ? "border-gray-800 dark:border-white" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={activeLayer.color}
                      onChange={(e) => handleLayerChange(activeLayer.id, "color", e.target.value)}
                      className="w-full mt-2 h-10 rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Stroke Width: {activeLayer.strokeWidth}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={activeLayer.strokeWidth}
                      onChange={(e) => handleLayerChange(activeLayer.id, "strokeWidth", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {activeLayer.strokeWidth > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                        Stroke Color
                      </label>
                      <input
                        type="color"
                        value={activeLayer.strokeColor || "#000000"}
                        onChange={(e) => handleLayerChange(activeLayer.id, "strokeColor", e.target.value)}
                        className="w-full h-10 rounded cursor-pointer"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Opacity: {Math.round(activeLayer.opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={activeLayer.opacity}
                      onChange={(e) => handleLayerChange(activeLayer.id, "opacity", parseFloat(e.target.value))}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
