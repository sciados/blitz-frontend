"use client";

import { useState, useRef, useEffect } from "react";
import {
  LANDING_PAGE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type LandingPageTemplate,
  type TemplateElement,
} from "./LandingPageTemplateData";
import { getProxiedImageUrl } from "src/utils/imageProxy";
import type {
  GeneratedContent,
  GeneratedImage,
  LibraryImage,
} from "src/lib/types";

interface VideoType {
  id: string;
  url: string;
  thumbnail_url?: string;
}

interface LandingPageBuilderProps {
  // Content from existing library
  textContent: GeneratedContent[];
  images: (GeneratedImage | LibraryImage)[];
  videos: VideoType[];
  campaignId?: number;
  onSave?: (templateData: any) => void;
  isProcessing?: boolean;
}

export function LandingPageBuilder({
  textContent,
  images,
  videos,
  campaignId,
  onSave,
  isProcessing,
}: LandingPageBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<LandingPageTemplate | null>(null);
  const [templateElements, setTemplateElements] = useState<TemplateElement[]>(
    []
  );
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showContentSelector, setShowContentSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<"text" | "media" | null>(
    null
  );

  // Load template when selected
  useEffect(() => {
    if (selectedTemplate) {
      setTemplateElements(
        JSON.parse(JSON.stringify(selectedTemplate.elements))
      );
      // Render after state update
      setTimeout(() => renderCanvas(), 100);
    }
  }, [selectedTemplate]);

  // Re-render when elements change
  useEffect(() => {
    if (templateElements.length > 0) {
      renderCanvas();
    }
  }, [templateElements]);

  const renderCanvas = async () => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    canvas.width = selectedTemplate.size.width;
    canvas.height = selectedTemplate.size.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render each element
    for (const element of templateElements) {
      await renderElement(ctx, element);
    }
  };

  const renderElement = async (
    ctx: CanvasRenderingContext2D,
    element: TemplateElement
  ) => {
    ctx.save();

    switch (element.type) {
      case "background":
        if (element.gradient) {
          const { type, angle, colors } = element.gradient;
          let gradient;

          if (type === "linear") {
            const radians = ((angle || 0) * Math.PI) / 180;
            const x1 =
              ctx.canvas.width / 2 - (Math.cos(radians) * ctx.canvas.width) / 2;
            const y1 =
              ctx.canvas.height / 2 -
              (Math.sin(radians) * ctx.canvas.height) / 2;
            const x2 =
              ctx.canvas.width / 2 + (Math.cos(radians) * ctx.canvas.width) / 2;
            const y2 =
              ctx.canvas.height / 2 +
              (Math.sin(radians) * ctx.canvas.height) / 2;
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          } else {
            const centerX = ctx.canvas.width / 2;
            const centerY = ctx.canvas.height / 2;
            const radius = Math.max(ctx.canvas.width, ctx.canvas.height) / 2;
            gradient = ctx.createRadialGradient(
              centerX,
              centerY,
              0,
              centerX,
              centerY,
              radius
            );
          }

          colors.forEach((color, i) => {
            gradient!.addColorStop(i / (colors.length - 1), color);
          });

          ctx.fillStyle = gradient;
        } else if (element.color) {
          ctx.fillStyle = element.color;
        }
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;

      case "shape":
        if (element.shadow) {
          ctx.shadowBlur = element.shadow.blur;
          ctx.shadowColor = element.shadow.color;
          ctx.shadowOffsetX = element.shadow.offsetX || 0;
          ctx.shadowOffsetY = element.shadow.offsetY || 0;
        }

        ctx.fillStyle = element.color || "#000000";

        if (element.shape === "roundedRect" && element.cornerRadius) {
          const {
            x = 0,
            y = 0,
            width = 100,
            height = 100,
            cornerRadius = 0,
          } = element;
          ctx.beginPath();
          ctx.moveTo(x + cornerRadius, y);
          ctx.lineTo(x + width - cornerRadius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
          ctx.lineTo(x + width, y + height - cornerRadius);
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - cornerRadius,
            y + height
          );
          ctx.lineTo(x + cornerRadius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
          ctx.lineTo(x, y + cornerRadius);
          ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
          ctx.closePath();
          ctx.fill();
        } else if (element.shape === "circle") {
          const { x = 0, y = 0, width = 100 } = element;
          const radius = width / 2;
          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(
            element.x || 0,
            element.y || 0,
            element.width || 100,
            element.height || 100
          );
        }
        break;

      case "text":
        const fontSize = element.fontSize || 16;
        const fontWeight = element.fontWeight || "normal";
        const fontFamily = element.fontFamily || "Arial";
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = element.color || "#000000";
        ctx.textAlign = (element.textAlign as CanvasTextAlign) || "left";
        ctx.textBaseline = "top";

        const x = element.x || 0;
        const y = element.y || 0;
        const content = element.content || "";

        if (element.maxWidth) {
          // Word wrap
          const words = content.split(" ");
          let line = "";
          let lineY = y;
          const lineHeight = fontSize * (element.lineHeight || 1.2);

          for (const word of words) {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > element.maxWidth && line.length > 0) {
              ctx.fillText(line, x, lineY);
              line = word + " ";
              lineY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, x, lineY);
        } else {
          ctx.fillText(content, x, y);
        }
        break;

      case "media":
        if (element.url && element.mediaType === "image") {
          try {
            const img = await loadImage(element.url);
            const {
              x = 0,
              y = 0,
              width = 100,
              height = 100,
              cornerRadius,
            } = element;

            if (cornerRadius) {
              ctx.beginPath();
              ctx.moveTo(x + cornerRadius, y);
              ctx.lineTo(x + width - cornerRadius, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
              ctx.lineTo(x + width, y + height - cornerRadius);
              ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - cornerRadius,
                y + height
              );
              ctx.lineTo(x + cornerRadius, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
              ctx.lineTo(x, y + cornerRadius);
              ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
              ctx.closePath();
              ctx.clip();
            }

            ctx.drawImage(img, x, y, width, height);
          } catch (err) {
            // Show placeholder
            drawPlaceholder(ctx, element);
          }
        } else if (
          element.url &&
          element.mediaType === "video" &&
          element.posterFrame
        ) {
          try {
            const img = await loadImage(element.posterFrame);
            const { x = 0, y = 0, width = 100, height = 100 } = element;
            ctx.drawImage(img, x, y, width, height);

            // Draw play button overlay
            drawPlayButton(ctx, x, y, width, height);
          } catch (err) {
            drawPlaceholder(ctx, element);
          }
        } else {
          // Show placeholder
          drawPlaceholder(ctx, element);
        }
        break;
    }

    ctx.restore();
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      // Use proxy URL to avoid CORS issues
      const proxiedUrl = getProxiedImageUrl(url);
      img.src = proxiedUrl;
    });
  };

  const drawPlaceholder = (
    ctx: CanvasRenderingContext2D,
    element: TemplateElement
  ) => {
    const { x = 0, y = 0, width = 100, height = 100 } = element;

    // Gray background
    ctx.fillStyle = "#E5E7EB";
    ctx.fillRect(x, y, width, height);

    // Placeholder text
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      element.placeholder || "Click to add",
      x + width / 2,
      y + height / 2
    );
  };

  const drawPlayButton = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 8;

    // Semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(x, y, width, height);

    // White circle
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Play triangle
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(centerX - radius / 3, centerY - radius / 2);
    ctx.lineTo(centerX - radius / 3, centerY + radius / 2);
    ctx.lineTo(centerX + radius / 2, centerY);
    ctx.closePath();
    ctx.fill();
  };

  const handleTemplateSelect = (template: LandingPageTemplate) => {
    setSelectedTemplate(template);
    setActiveElement(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedTemplate) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = selectedTemplate.size.width / rect.width;
    const scaleY = selectedTemplate.size.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find clicked element (reverse order to get topmost)
    for (let i = templateElements.length - 1; i >= 0; i--) {
      const element = templateElements[i];
      if (!element.editable) continue;

      const { x = 0, y = 0, width = 100, height = 100 } = element;
      if (
        clickX >= x &&
        clickX <= x + width &&
        clickY >= y &&
        clickY <= y + height
      ) {
        setActiveElement(element.id);
        if (element.type === "text") {
          setSelectorType("text");
          setShowContentSelector(true);
        } else if (element.type === "media") {
          setSelectorType("media");
          setShowContentSelector(true);
        }
        return;
      }
    }

    setActiveElement(null);
  };

  const updateElement = (
    elementId: string,
    updates: Partial<TemplateElement>
  ) => {
    setTemplateElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    );
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");

    // If onSave prop is provided (for Content Library integration), call it
    if (onSave && campaignId) {
      try {
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Create FormData for Save & Retrieve pattern
        const formData = new FormData();
        formData.append("image", blob, "landing_page.png");
        formData.append("campaign_id", campaignId.toString());
        formData.append("operation", "landing_page");

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
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

        if (uploadResponse.ok) {
          const result = await uploadResponse.json();
          onSave({
            success: true,
            imageUrl: result.image_url,
            message: "Landing page saved to Content Library",
          });
        } else {
          throw new Error("Failed to save");
        }
      } catch (error) {
        console.error("Error saving landing page:", error);
        if (onSave) {
          onSave({
            success: false,
            error: "Failed to save to Content Library",
          });
        }
      }
    } else {
      // Fallback to local download if no onSave provided
      const link = document.createElement("a");
      link.download = `${selectedTemplate?.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const filteredTemplates = selectedCategory
    ? LANDING_PAGE_TEMPLATES.filter((t) => t.category === selectedCategory)
    : LANDING_PAGE_TEMPLATES;

  const activeElementData = templateElements.find(
    (el) => el.id === activeElement
  );

  return (
    <div className="h-full flex bg-white">
      {/* Center - Full Width with Template Viewer at Top */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {/* Template Selection - Top Section */}
        <div className="border-b border-gray-200 p-4 bg-white">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-3">Landing Page Templates</h3>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  !selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Templates ({LANDING_PAGE_TEMPLATES.length})
              </button>

              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.icon} {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`flex-shrink-0 w-48 p-3 rounded-lg border-2 transition text-left ${
                  selectedTemplate?.id === template.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="text-2xl mb-2">{template.thumbnail}</div>
                <div className="font-semibold text-sm">{template.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.description}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {template.size.width}×{template.size.height}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Preview - Below */}
        <div className="flex-1 p-8 overflow-auto flex flex-col">
          {selectedTemplate ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedTemplate.description}
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                >
                  {isProcessing ? "💾 Saving..." : "💾 Save to Library"}
                </button>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-2xl inline-block">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="cursor-pointer max-w-full max-h-[calc(100vh-400px)]"
                    style={{
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                      maxHeight: "calc(100vh - 400px)",
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                💡 Click on any editable element to customize it
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <div className="text-xl font-semibold">
                  Select a template to get started
                </div>
                <div className="text-sm mt-2">
                  Choose from 25 professional templates ↑
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Content Selector (shown when element is active) */}
      {showContentSelector && activeElementData && selectorType && (
        <ContentSelectorPanel
          type={selectorType}
          element={activeElementData}
          textContent={textContent}
          images={images}
          videos={videos}
          onSelect={(updates) => {
            updateElement(activeElementData.id, updates);
            setShowContentSelector(false);
            setActiveElement(null);
          }}
          onClose={() => {
            setShowContentSelector(false);
            setActiveElement(null);
          }}
        />
      )}
    </div>
  );
}

// Content Selector Panel Component (to be defined in Part 2)
interface ContentSelectorPanelProps {
  type: "text" | "media";
  element: TemplateElement;
  textContent: GeneratedContent[];
  images: (GeneratedImage | LibraryImage)[];
  videos: VideoType[];
  onSelect: (updates: Partial<TemplateElement>) => void;
  onClose: () => void;
}

function ContentSelectorPanel({
  type,
  element,
  textContent,
  images,
  videos,
  onSelect,
  onClose,
}: ContentSelectorPanelProps) {
  const [mode, setMode] = useState<"library" | "custom">("library");
  const [customText, setCustomText] = useState("");
  const [mediaTab, setMediaTab] = useState<"images" | "videos">("images");

  if (type === "text") {
    return (
      <div className="w-96 border-l border-gray-200 overflow-y-auto p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Text</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">{element.editLabel}</p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("library")}
            className={`flex-1 py-2 px-3 rounded ${
              mode === "library" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            📚 Library
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`flex-1 py-2 px-3 rounded ${
              mode === "custom" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            ✏️ Custom
          </button>
        </div>

        {/* Library Mode */}
        {mode === "library" && (
          <div className="space-y-2">
            {textContent.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="mb-2">No text content yet</p>
                <p className="text-sm">Generate some content first!</p>
              </div>
            ) : (
              textContent.map((item) => {
                // GeneratedContent may have different field names for the actual text
                // Try common field names: content, generated_text, text
                const displayText =
                  (item as any).content ||
                  (item as any).generated_text ||
                  (item as any).text ||
                  "";
                const displayType =
                  (item as any).content_type || (item as any).type || "";

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect({ content: displayText })}
                    className="w-full p-3 text-left border border-gray-200 rounded hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    {displayType && (
                      <div className="text-xs text-gray-500 mb-1">
                        {displayType}
                      </div>
                    )}
                    <div className="text-sm font-medium line-clamp-3">
                      {displayText}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Custom Mode */}
        {mode === "custom" && (
          <div className="space-y-3">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none"
              rows={6}
            />
            <button
              onClick={() => onSelect({ content: customText })}
              disabled={!customText}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Use This Text
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === "media") {
    return (
      <div className="w-96 border-l border-gray-200 overflow-y-auto p-4 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Select Media</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-3">{element.editLabel}</p>

        {/* Media Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMediaTab("images")}
            className={`flex-1 py-2 px-3 rounded ${
              mediaTab === "images" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            🖼️ Images ({images.length})
          </button>
          <button
            onClick={() => setMediaTab("videos")}
            className={`flex-1 py-2 px-3 rounded ${
              mediaTab === "videos" ? "bg-red-600 text-white" : "bg-gray-100"
            }`}
          >
            🎬 Videos ({videos.length})
          </button>
        </div>

        {/* Images Grid */}
        {mediaTab === "images" && (
          <div className="space-y-2">
            {images.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="mb-2">No images yet</p>
                <p className="text-sm">Generate some images first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img) => {
                  // Handle both GeneratedImage and LibraryImage types
                  const imageUrl =
                    (img as any).url || (img as any).image_url || "";
                  const imagePrompt =
                    (img as any).prompt || (img as any).description || "";

                  return (
                    <button
                      key={img.id}
                      onClick={() =>
                        onSelect({ mediaType: "image", url: imageUrl })
                      }
                      className="aspect-square rounded overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition"
                    >
                      <img
                        src={imageUrl}
                        alt={imagePrompt || "Image"}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {mediaTab === "videos" && (
          <div className="space-y-2">
            {videos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="mb-2">No videos yet</p>
                <p className="text-sm">Generate some videos first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {videos.map((vid) => {
                  // Handle different possible field names
                  const videoUrl =
                    (vid as any).url || (vid as any).video_url || "";
                  const thumbnailUrl =
                    (vid as any).thumbnail_url ||
                    (vid as any).thumbnail ||
                    videoUrl;

                  return (
                    <button
                      key={vid.id}
                      onClick={() =>
                        onSelect({
                          mediaType: "video",
                          url: videoUrl,
                          posterFrame: thumbnailUrl,
                        })
                      }
                      className="aspect-video rounded overflow-hidden border-2 border-gray-200 hover:border-red-400 transition relative"
                    >
                      <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-8 border-l-black border-y-6 border-y-transparent ml-1" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
