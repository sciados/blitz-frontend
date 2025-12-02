// src/components/UnifiedEditorModal.tsx
// Unified editor for both text and image layers on a single background

"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";
import { GeneratedImage } from "src/lib/types";

type LayerType = "text" | "image";

interface TextLayerData {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  font_size: number;
  font_family: string;
  color: string;
  stroke_color: string;
  stroke_width: number;
  opacity: number;
  z_index: number;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
}

interface ImageLayerData {
  id: string;
  type: "image";
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

type UnifiedLayer = TextLayerData | ImageLayerData;

interface FontOption {
  value: string;
  label: string;
}

interface UnifiedEditorModalProps {
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
];

export function UnifiedEditorModal({
  isOpen,
  onClose,
  sourceImage,
  campaignId,
  onSave,
}: UnifiedEditorModalProps) {
  const [layers, setLayers] = useState<UnifiedLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [modalWidth, setModalWidth] = useState<number>(800);
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [showCampaignImages, setShowCampaignImages] = useState(false);
  const [campaignImages, setCampaignImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const nextZIndex =
    layers.length > 0 ? Math.max(...layers.map((l) => l.z_index)) + 1 : 1;

  // Initialize image dimensions from metadata
  useEffect(() => {
    if (isOpen && sourceImage.metadata?.width && sourceImage.metadata?.height) {
      setImageWidth(sourceImage.metadata.width);
      setImageHeight(sourceImage.metadata.height);
    }
  }, [isOpen, sourceImage.metadata?.width, sourceImage.metadata?.height]);

  // Calculate modal width
  useEffect(() => {
    if (imageWidth > 0 && imageHeight > 0) {
      const sidebarWidth = 320;
      const paddingAndGaps = 64;
      const optimalWidth = imageWidth + sidebarWidth + paddingAndGaps;
      const maxViewportWidth =
        typeof window !== "undefined" ? window.innerWidth * 0.95 : optimalWidth;
      setModalWidth(Math.min(optimalWidth, maxViewportWidth));
    }
  }, [imageWidth, imageHeight]);

  // Load fonts when modal opens
  useEffect(() => {
    if (isOpen) {
      setFontsLoading(true);
      api
        .get("/api/content/images/fonts")
        .then(({ data }) => {
          setFonts(data);
        })
        .catch(() => {
          setFonts([
            { value: "Arial", label: "Arial" },
            { value: "Helvetica", label: "Helvetica" },
            { value: "Times New Roman", label: "Times New Roman" },
          ]);
        })
        .finally(() => setFontsLoading(false));
    }
  }, [isOpen]);

  // Reset layers when modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setLayers([]);
      setSelectedLayerId(null);
    }
  }, [isOpen, sourceImage.id]);

  const addTextLayer = () => {
    const defaultFont = fonts.length > 0 ? fonts[0].value : "Arial";
    const newLayer: TextLayerData = {
      id: `text-${Date.now()}`,
      type: "text",
      text: "Your Text Here",
      x: 50,
      y: 50,
      font_size: 48,
      font_family: defaultFont,
      color: "#FFFFFF",
      stroke_color: "#000000",
      stroke_width: 2,
      opacity: 1.0,
      z_index: nextZIndex,
      bold: false,
      italic: false,
      strikethrough: false,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    toast.success("Text layer added");
  };

  const addImageLayer = async (imageUrl: string) => {
    const newLayer: ImageLayerData = {
      id: `image-${Date.now()}`,
      type: "image",
      image_url: imageUrl,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
      z_index: nextZIndex,
      naturalWidth: 200,
      naturalHeight: 200,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    toast.success("Image layer added");
  };

  const updateLayer = (id: string, updates: Partial<UnifiedLayer>) => {
    setLayers(
      layers.map((l) =>
        l.id === id ? ({ ...l, ...updates } as UnifiedLayer) : l
      )
    );
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
    toast.success("Layer deleted");
  };

  const moveLayerUp = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const higherLayers = layers.filter((l) => l.z_index > layer.z_index);
    if (higherLayers.length === 0) return;
    const nextHigher = higherLayers.reduce((min, l) =>
      l.z_index < min.z_index ? l : min
    );
    setLayers(
      layers.map((l) => {
        if (l.id === id)
          return { ...l, z_index: nextHigher.z_index } as UnifiedLayer;
        if (l.id === nextHigher.id)
          return { ...l, z_index: layer.z_index } as UnifiedLayer;
        return l;
      })
    );
  };

  const moveLayerDown = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const lowerLayers = layers.filter((l) => l.z_index < layer.z_index);
    if (lowerLayers.length === 0) return;
    const nextLower = lowerLayers.reduce((max, l) =>
      l.z_index > max.z_index ? l : max
    );
    setLayers(
      layers.map((l) => {
        if (l.id === id)
          return { ...l, z_index: nextLower.z_index } as UnifiedLayer;
        if (l.id === nextLower.id)
          return { ...l, z_index: layer.z_index } as UnifiedLayer;
        return l;
      })
    );
  };

  // Drag handling for layers
  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageContainerRef.current) return;

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    setSelectedLayerId(layerId);
    setIsDragging(true);

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - containerRect.left - layer.x,
      y: e.clientY - containerRect.top - layer.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId || !imageContainerRef.current) return;

    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer) return;

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    let newX = e.clientX - containerRect.left - dragStart.x;
    let newY = e.clientY - containerRect.top - dragStart.y;

    // Calculate bounds based on layer type
    let layerWidth = 0,
      layerHeight = 0;
    if (layer.type === "image") {
      const imgLayer = layer as ImageLayerData;
      layerWidth = (imgLayer.naturalWidth || 200) * imgLayer.scale;
      layerHeight = (imgLayer.naturalHeight || 200) * imgLayer.scale;
    } else {
      // Text layers - estimate size
      layerWidth = 200;
      layerHeight = 50;
    }

    // Clamp to bounds
    const minX = 0;
    const maxX = Math.max(0, imageWidth - layerWidth);
    const minY = 0;
    const maxY = Math.max(0, imageHeight - layerHeight);

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    updateLayer(selectedLayerId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Trim transparency for image layers
  const handleTrimTransparency = async () => {
    if (!selectedLayer || selectedLayer.type !== "image") return;

    setIsTrimming(true);
    try {
      const { data } = await api.post("/api/content/images/trim-transparency", {
        image_url: (selectedLayer as ImageLayerData).image_url,
        padding: 2,
        campaign_id: campaignId,
      });

      updateLayer(selectedLayer.id, {
        image_url: data.image_url,
        naturalWidth: data.trimmed_width,
        naturalHeight: data.trimmed_height,
      });

      toast.success(
        `Trimmed from ${data.original_width}x${data.original_height} to ${data.trimmed_width}x${data.trimmed_height}`
      );
    } catch (error) {
      console.error("Trim failed:", error);
      toast.error("Failed to trim image");
    } finally {
      setIsTrimming(false);
    }
  };

  // Fetch campaign images
  const fetchCampaignImages = async () => {
    try {
      setLoadingImages(true);
      const { data: campaign } = await api.get(`/api/campaigns/${campaignId}`);
      if (campaign.intelligence_data?.images) {
        setCampaignImages(campaign.intelligence_data.images);
      } else {
        setCampaignImages([]);
      }
    } catch (error) {
      toast.error("Failed to load campaign images");
    } finally {
      setLoadingImages(false);
    }
  };

  // Save composite image
  const handleSave = async () => {
    if (layers.length === 0) {
      toast.error("No layers to save");
      return;
    }

    setIsProcessing(true);
    try {
      const textLayers = layers
        .filter((l): l is TextLayerData => l.type === "text")
        .map((l) => ({
          text: l.text,
          x: l.x,
          y: l.y,
          font_size: l.font_size,
          font_family: l.font_family,
          color: l.color,
          stroke_color: l.stroke_color,
          stroke_width: l.stroke_width,
          opacity: l.opacity,
          z_index: l.z_index,
          bold: l.bold,
          italic: l.italic,
          strikethrough: l.strikethrough,
        }));

      // Debug: Log text styles being sent
      console.log("🎨 Sending text layers with styles:", textLayers);

      const imageLayers = layers
        .filter((l): l is ImageLayerData => l.type === "image")
        .map((l) => ({
          image_url: l.image_url,
          x: l.x,
          y: l.y,
          scale: l.scale,
          rotation: l.rotation,
          opacity: l.opacity,
          z_index: l.z_index,
        }));

      const { data } = await api.post("/api/content/images/composite", {
        image_url: sourceImage.image_url,
        text_layers: textLayers,
        image_layers: imageLayers,
        campaign_id: campaignId,
        image_type: sourceImage.image_type,
        style: sourceImage.style,
        aspect_ratio: sourceImage.aspect_ratio,
        provider: sourceImage.provider,
        model: sourceImage.model,
        prompt: sourceImage.prompt,
      });

      toast.success("Image saved successfully!");
      onSave(data);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save image");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaign_id", campaignId.toString());

    try {
      const { data } = await api.post("/api/content/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addImageLayer(data.image_url);
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  if (!isOpen) return null;

  const sortedLayers = [...layers].sort((a, b) => a.z_index - b.z_index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="flex flex-col rounded-lg shadow-xl overflow-hidden"
        style={{
          width: `${modalWidth}px`,
          maxWidth: "95vw",
          maxHeight: "95vh",
          background: "var(--card-bg)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Image Editor
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={isProcessing || layers.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
            >
              {isProcessing ? "Saving..." : "Save Image"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar */}
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

            {/* Add Layer Buttons */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={addTextLayer}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
              >
                + Add Text
              </button>
              <label className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium cursor-pointer text-center">
                + Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Browse Campaign Images */}
            <button
              onClick={() => {
                setShowCampaignImages(!showCampaignImages);
                if (!showCampaignImages && campaignImages.length === 0) {
                  fetchCampaignImages();
                }
              }}
              className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              style={{ color: "var(--text-primary)" }}
            >
              {showCampaignImages ? "Hide" : "Browse"} Campaign Images
            </button>

            {showCampaignImages && (
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {loadingImages ? (
                  <p className="text-sm text-gray-500">Loading...</p>
                ) : campaignImages.length === 0 ? (
                  <p className="text-sm text-gray-500">No images found</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {campaignImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.r2_url || img.url || img}
                        alt=""
                        className="w-full h-16 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                        onClick={() => {
                          addImageLayer(img.r2_url || img.url || img);
                          setShowCampaignImages(false);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Layers List */}
            <div className="mb-4">
              <h3
                className="font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Layers ({layers.length})
              </h3>
              <div className="space-y-2">
                {sortedLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`p-2 rounded border cursor-pointer transition ${
                      selectedLayerId === layer.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {layer.type === "text" ? "📝" : "🖼️"} Layer {index + 1}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerUp(layer.id);
                          }}
                          className="text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerDown(layer.id);
                          }}
                          className="text-xs px-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {layer.type === "text"
                        ? (layer as TextLayerData).text
                        : ((layer as ImageLayerData).image_url || "Image")
                            .split("/")
                            .pop()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Layer Controls */}
            {selectedLayer && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedLayer.type === "text" ? "Text" : "Image"} Properties
                </h3>

                {/* Common: Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      X Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.x)}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border rounded"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Y Position
                    </label>
                    <input
                      type="number"
                      value={Math.round(selectedLayer.y)}
                      onChange={(e) =>
                        updateLayer(selectedLayer.id, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2 py-1 text-sm border rounded"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--card-bg)",
                      }}
                    />
                  </div>
                </div>

                {/* Common: Opacity */}
                <div>
                  <label
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Opacity: {Math.round(selectedLayer.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedLayer.opacity * 100}
                    onChange={(e) =>
                      updateLayer(selectedLayer.id, {
                        opacity: parseInt(e.target.value) / 100,
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Text-specific controls */}
                {selectedLayer.type === "text" && (
                  <>
                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Text
                      </label>
                      <textarea
                        value={(selectedLayer as TextLayerData).text}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            text: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border rounded"
                        style={{
                          borderColor: "var(--card-border)",
                          background: "var(--card-bg)",
                        }}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Font
                      </label>
                      <select
                        value={(selectedLayer as TextLayerData).font_family}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            font_family: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1 text-sm border rounded"
                        style={{
                          borderColor: "var(--card-border)",
                          background: "var(--card-bg)",
                        }}
                      >
                        {fonts.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Font Size: {(selectedLayer as TextLayerData).font_size}
                        px
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="12"
                          max="200"
                          value={(selectedLayer as TextLayerData).font_size}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              font_size: parseInt(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="12"
                          max="200"
                          value={(selectedLayer as TextLayerData).font_size}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              font_size: parseInt(e.target.value) || 48,
                            })
                          }
                          className="w-16 px-2 py-1 text-sm border rounded"
                          style={{
                            borderColor: "var(--card-border)",
                            background: "var(--card-bg)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Text Style Buttons */}
                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Text Style
                      </label>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              bold: !(selectedLayer as TextLayerData).bold,
                            })
                          }
                          className={`flex-1 px-3 py-2 text-sm font-bold border rounded transition ${
                            (selectedLayer as TextLayerData).bold
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          }`}
                          style={{
                            color: (selectedLayer as TextLayerData).bold
                              ? "white"
                              : "var(--text-primary)",
                          }}
                        >
                          B
                        </button>
                        <button
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              italic: !(selectedLayer as TextLayerData).italic,
                            })
                          }
                          className={`flex-1 px-3 py-2 text-sm italic border rounded transition ${
                            (selectedLayer as TextLayerData).italic
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          }`}
                          style={{
                            color: (selectedLayer as TextLayerData).italic
                              ? "white"
                              : "var(--text-primary)",
                          }}
                        >
                          I
                        </button>
                        <button
                          onClick={() =>
                            updateLayer(selectedLayer.id, {
                              strikethrough: !(selectedLayer as TextLayerData)
                                .strikethrough,
                            })
                          }
                          className={`flex-1 px-3 py-2 text-sm line-through border rounded transition ${
                            (selectedLayer as TextLayerData).strikethrough
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                          }`}
                          style={{
                            color: (selectedLayer as TextLayerData)
                              .strikethrough
                              ? "white"
                              : "var(--text-primary)",
                          }}
                        >
                          S
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Text Color
                      </label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              updateLayer(selectedLayer.id, { color })
                            }
                            className={`w-6 h-6 rounded border-2 ${
                              (selectedLayer as TextLayerData).color === color
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={(selectedLayer as TextLayerData).color}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            color: e.target.value,
                          })
                        }
                        className="w-full h-8"
                      />
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Stroke Width:{" "}
                        {(selectedLayer as TextLayerData).stroke_width}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={(selectedLayer as TextLayerData).stroke_width}
                        onChange={(e) =>
                          updateLayer(selectedLayer.id, {
                            stroke_width: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {(selectedLayer as TextLayerData).stroke_width > 0 && (
                      <div>
                        <label
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Stroke Color
                        </label>
                        <input
                          type="color"
                          value={(selectedLayer as TextLayerData).stroke_color}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              stroke_color: e.target.value,
                            })
                          }
                          className="w-full h-8"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Image-specific controls */}
                {selectedLayer.type === "image" && (
                  <>
                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Scale:{" "}
                        {Math.round(
                          (selectedLayer as ImageLayerData).scale * 100
                        )}
                        %
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={(selectedLayer as ImageLayerData).scale * 100}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              scale: parseInt(e.target.value) / 100,
                            })
                          }
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="10"
                          max="200"
                          value={Math.round(
                            (selectedLayer as ImageLayerData).scale * 100
                          )}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              scale: (parseInt(e.target.value) || 100) / 100,
                            })
                          }
                          className="w-16 px-2 py-1 text-sm border rounded"
                          style={{
                            borderColor: "var(--card-border)",
                            background: "var(--card-bg)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Rotation: {(selectedLayer as ImageLayerData).rotation}°
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={(selectedLayer as ImageLayerData).rotation}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              rotation: parseInt(e.target.value),
                            })
                          }
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="-180"
                          max="180"
                          value={(selectedLayer as ImageLayerData).rotation}
                          onChange={(e) =>
                            updateLayer(selectedLayer.id, {
                              rotation: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-16 px-2 py-1 text-sm border rounded"
                          style={{
                            borderColor: "var(--card-border)",
                            background: "var(--card-bg)",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleTrimTransparency}
                      disabled={isTrimming}
                      className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
                    >
                      {isTrimming ? "Trimming..." : "✂️ Trim Transparency"}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div
            ref={canvasRef}
            className="flex-1 overflow-auto p-4 flex items-start justify-center"
            style={{ background: "var(--card-bg)" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              ref={imageContainerRef}
              className="relative inline-block"
              style={{
                width: imageWidth > 0 ? imageWidth : "auto",
                height: imageHeight > 0 ? imageHeight : "auto",
              }}
            >
              {/* Base Image */}
              <img
                ref={imageRef}
                src={sourceImage.image_url}
                alt="Base"
                className="select-none pointer-events-none"
                draggable={false}
                style={{
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

              {/* Layers */}
              {sortedLayers.map((layer) => {
                if (layer.type === "text") {
                  const textLayer = layer as TextLayerData;
                  return (
                    <div
                      key={layer.id}
                      className={`absolute cursor-move ${
                        selectedLayerId === layer.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: textLayer.x,
                        top: textLayer.y,
                        fontSize: textLayer.font_size,
                        fontFamily: textLayer.font_family,
                        color: textLayer.color,
                        opacity: textLayer.opacity,
                        whiteSpace: "nowrap",
                        fontWeight: textLayer.bold ? "bold" : "normal",
                        fontStyle: textLayer.italic ? "italic" : "normal",
                        textDecoration: "none", // Remove default strikethrough, using custom diagonal
                        textShadow:
                          textLayer.stroke_width > 0
                            ? `${textLayer.stroke_color} 0 0 ${textLayer.stroke_width}px, ${textLayer.stroke_color} 0 0 ${textLayer.stroke_width}px`
                            : "none",
                        zIndex: layer.z_index,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, layer.id)}
                    >
                      {textLayer.text}
                      {textLayer.strikethrough && (
                        <div
                          className="absolute"
                          style={{
                            left: "-5px",
                            bottom: "-2px",
                            width: "110%",
                            height: Math.max(1, textLayer.font_size / 15),
                            pointerEvents: "none",
                            transformOrigin: "left bottom+10",
                            transform: "rotate(-10deg)",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: textLayer.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const imgLayer = layer as ImageLayerData;
                  const scaledWidth =
                    (imgLayer.naturalWidth || 200) * imgLayer.scale;
                  const scaledHeight =
                    (imgLayer.naturalHeight || 200) * imgLayer.scale;
                  return (
                    <div
                      key={layer.id}
                      className={`absolute cursor-move ${
                        selectedLayerId === layer.id
                          ? "ring-2 ring-blue-500"
                          : ""
                      }`}
                      style={{
                        left: imgLayer.x,
                        top: imgLayer.y,
                        width: scaledWidth,
                        height: scaledHeight,
                        transformOrigin: "0 0",
                        transform: `rotate(${imgLayer.rotation}deg)`,
                        opacity: imgLayer.opacity,
                        zIndex: layer.z_index,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, layer.id)}
                    >
                      <img
                        src={imgLayer.image_url}
                        alt=""
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (
                            !imgLayer.naturalWidth ||
                            imgLayer.naturalWidth === 200
                          ) {
                            updateLayer(layer.id, {
                              naturalWidth: img.naturalWidth,
                              naturalHeight: img.naturalHeight,
                            });
                          }
                        }}
                      />
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
