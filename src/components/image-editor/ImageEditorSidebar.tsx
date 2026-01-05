"use client";

import { EditTool } from "src/app/image-editor/page";
import { useState, useEffect } from "react";
import { FilterToolControls } from "src/components/image-editor/FilterToolControls";
import { CollageToolControls } from "src/components/image-editor/CollageToolControls";
import { TemplateToolControls } from "src/components/image-editor/TemplateToolControls";
import { FrameToolControls } from "src/components/image-editor/FrameToolControls";
import { BackgroundLibraryControls } from "src/components/image-editor/BackgroundLibraryControls";
import { LandingPageBuilder } from "src/components/image-editor/LandingPageBuilder";
import { CropToolControls } from "src/components/image-editor/CropToolControls";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  rotation: number;
  opacity: number;
}

interface ImageOverlay {
  id: string;
  imageData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

interface OverlayToolControlsProps {
  isProcessing: boolean;
  onFilterSave?: (dataUrl: string) => void;
  libraryImages?: { id: string; url: string; prompt?: string }[];
}

function OverlayToolControls({
  isProcessing,
  libraryImages = [],
}: OverlayToolControlsProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "text" | "upload" | "library" | "stickers"
  >("text");
  const [selectedStickerCategory, setSelectedStickerCategory] =
    useState("badges");

  // Sticker Library Data
  const STICKER_LIBRARY = {
    badges: [
      { id: "new", emoji: "🆕", name: "NEW" },
      { id: "sale", emoji: "💰", name: "SALE" },
      { id: "hot", emoji: "🔥", name: "HOT" },
      { id: "off", emoji: "💸", name: "50% OFF" },
      { id: "limited", emoji: "⏰", name: "LIMITED" },
      { id: "bestseller", emoji: "⭐", name: "BESTSELLER" },
      { id: "exclusive", emoji: "👑", name: "EXCLUSIVE" },
      { id: "trending", emoji: "📈", name: "TRENDING" },
    ],
    arrows: [
      { id: "up", emoji: "⬆️", name: "Up" },
      { id: "down", emoji: "⬇️", name: "Down" },
      { id: "left", emoji: "⬅️", name: "Left" },
      { id: "right", emoji: "➡️", name: "Right" },
      { id: "up-right", emoji: "↗️", name: "Up Right" },
      { id: "down-right", emoji: "↘️", name: "Down Right" },
      { id: "curved-right", emoji: "↪️", name: "Curved Right" },
      { id: "curved-left", emoji: "↩️", name: "Curved Left" },
    ],
    emojis: [
      { id: "star", emoji: "⭐", name: "Star" },
      { id: "fire", emoji: "🔥", name: "Fire" },
      { id: "100", emoji: "💯", name: "100" },
      { id: "check", emoji: "✅", name: "Check" },
      { id: "heart", emoji: "❤️", name: "Heart" },
      { id: "thumbs-up", emoji: "👍", name: "Thumbs Up" },
      { id: "party", emoji: "🎉", name: "Party" },
      { id: "money", emoji: "💰", name: "Money" },
      { id: "rocket", emoji: "🚀", name: "Rocket" },
      { id: "sparkles", emoji: "✨", name: "Sparkles" },
      { id: "trophy", emoji: "🏆", name: "Trophy" },
      { id: "gift", emoji: "🎁", name: "Gift" },
    ],
    shapes: [
      { id: "circle-red", emoji: "🔴", name: "Red Circle" },
      { id: "circle-blue", emoji: "🔵", name: "Blue Circle" },
      { id: "circle-green", emoji: "🟢", name: "Green Circle" },
      { id: "circle-yellow", emoji: "🟡", name: "Yellow Circle" },
      { id: "square-red", emoji: "🟥", name: "Red Square" },
      { id: "square-blue", emoji: "🟦", name: "Blue Square" },
      { id: "square-green", emoji: "🟩", name: "Green Square" },
      { id: "square-yellow", emoji: "🟨", name: "Yellow Square" },
      { id: "star-shape", emoji: "⭐", name: "Star" },
      { id: "heart-shape", emoji: "❤️", name: "Heart" },
    ],
    social: [
      { id: "facebook", emoji: "📘", name: "Facebook" },
      { id: "instagram", emoji: "📸", name: "Instagram" },
      { id: "twitter", emoji: "🐦", name: "Twitter" },
      { id: "youtube", emoji: "📺", name: "YouTube" },
      { id: "tiktok", emoji: "🎵", name: "TikTok" },
      { id: "linkedin", emoji: "💼", name: "LinkedIn" },
      { id: "pinterest", emoji: "📌", name: "Pinterest" },
      { id: "snapchat", emoji: "👻", name: "Snapchat" },
    ],
  };

  const STICKER_CATEGORIES = [
    { id: "badges", name: "Badges", icon: "🏷️" },
    { id: "arrows", name: "Arrows", icon: "➡️" },
    { id: "emojis", name: "Emojis", icon: "😀" },
    { id: "shapes", name: "Shapes", icon: "⬛" },
    { id: "social", name: "Social", icon: "📱" },
  ];

  useEffect(() => {
    const updateOverlayState = () => {
      const canvasAPI = (window as any).imageEditorCanvas;
      if (canvasAPI) {
        setTextOverlays(canvasAPI.textOverlays || []);
        setImageOverlays(canvasAPI.imageOverlays || []);
        setSelectedOverlay(canvasAPI.selectedOverlay || null);
      }
    };

    // Update immediately
    updateOverlayState();

    // Set up polling to check for state changes
    const interval = setInterval(updateOverlayState, 100);

    return () => clearInterval(interval);
  }, []);

  const addTextOverlay = () => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      canvasAPI.addTextOverlay("Sample Text");
    }
  };

  const addImageOverlay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      canvasAPI.addImageOverlay(file);
    }
  };

  const addImageOverlayFromUrl = (imageUrl: string) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.addImageOverlayFromUrl) {
      canvasAPI.addImageOverlayFromUrl(imageUrl);
    }
  };

  const addSticker = (emoji: string, name: string) => {
    // Create a canvas to render the emoji as an image
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Set font size and draw emoji
      ctx.font = "160px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, 100, 100);

      // Convert to blob and add as image overlay
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${name}.png`, { type: "image/png" });
          const canvasAPI = (window as any).imageEditorCanvas;
          if (canvasAPI) {
            canvasAPI.addImageOverlay(file);
          }
        }
      });
    }
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      const updated = textOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      );
      canvasAPI.setTextOverlays(updated);
    }
  };

  const updateImageOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      const updated = imageOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      );
      canvasAPI.setImageOverlays(updated);
    }
  };

  const deleteOverlay = (id: string) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      canvasAPI.setTextOverlays(textOverlays.filter((o) => o.id !== id));
      canvasAPI.setImageOverlays(imageOverlays.filter((o) => o.id !== id));
      canvasAPI.setSelectedOverlay(null);
    }
  };

  const selectedText = textOverlays.find((o) => o.id === selectedOverlay);
  const selectedImage = imageOverlays.find((o) => o.id === selectedOverlay);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📝 Overlay Editor</h3>

      {/* Tab Selector */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-sm text-blue-900 mb-2">
          Add to Image
        </h5>
        <p className="text-xs text-blue-800 mb-3">
          Add text, images, or stickers to your image. No AI cost!
        </p>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "text"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "upload"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            🖼️ Upload
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "library"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            📚 Library
          </button>
          <button
            onClick={() => setActiveTab("stickers")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "stickers"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            😀 Stickers
          </button>
        </div>

        {/* Text Tab */}
        {activeTab === "text" && (
          <button
            onClick={addTextOverlay}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            ➕ Add Text
          </button>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <label className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
            🖼️ Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={addImageOverlay}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-3">
            {libraryImages && libraryImages.length > 0 ? (
              <>
                <div className="bg-white rounded-lg p-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {libraryImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          if (img.url) {
                            addImageOverlayFromUrl(getProxiedImageUrl(img.url));
                          }
                        }}
                        disabled={isProcessing}
                        title={img.prompt || "Library image"}
                        className="aspect-square border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-400 transition disabled:opacity-50 overflow-hidden"
                      >
                        <img
                          src={getProxiedImageUrl(img.url)}
                          alt={img.prompt || "Library image"}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  💡 Click any image to add it as an overlay
                </p>
              </>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg">
                <p className="text-gray-500 text-sm">No images in library</p>
                <p className="text-xs text-gray-400 mt-1">
                  Generate or upload images to use them here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stickers Tab */}
        {activeTab === "stickers" && (
          <div className="space-y-3">
            {/* Category Selector */}
            <div className="grid grid-cols-2 gap-2">
              {STICKER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedStickerCategory(cat.id)}
                  className={`px-2 py-2 rounded text-xs font-medium transition ${
                    selectedStickerCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Sticker Grid */}
            <div className="bg-white rounded-lg p-2 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {STICKER_LIBRARY[
                  selectedStickerCategory as keyof typeof STICKER_LIBRARY
                ]?.map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => addSticker(sticker.emoji, sticker.name)}
                    disabled={isProcessing}
                    title={sticker.name}
                    className="p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-400 transition disabled:opacity-50 text-center"
                  >
                    <div className="text-3xl">{sticker.emoji}</div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {sticker.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-600 text-center">
              💡 Click any sticker to add it to your image
            </p>
          </div>
        )}
      </div>

      {/* Selected Text Overlay Controls */}
      {selectedText && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-sm">📝 Text Settings</h5>
            <button
              onClick={() => deleteOverlay(selectedText.id)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea
                value={selectedText.text}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, { text: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Font Size: {selectedText.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="200"
                value={selectedText.fontSize}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, {
                    fontSize: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Font Family
              </label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, {
                    fontFamily: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      color: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={
                    selectedText.backgroundColor === "transparent"
                      ? "#000000"
                      : selectedText.backgroundColor
                  }
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      backgroundColor: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateTextOverlay(selectedText.id, {
                    backgroundColor: "transparent",
                  })
                }
                className="flex-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                No Background
              </button>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedText.bold}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      bold: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Bold
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedText.italic}
                  onChange={(e) =>
                    updateTextOverlay(selectedText.id, {
                      italic: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Italic
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Rotation: {selectedText.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedText.rotation}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, {
                    rotation: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Opacity: {Math.round(selectedText.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedText.opacity}
                onChange={(e) =>
                  updateTextOverlay(selectedText.id, {
                    opacity: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Image Overlay Controls */}
      {selectedImage && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-sm">🖼️ Image Settings</h5>
            <button
              onClick={() => deleteOverlay(selectedImage.id)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Width: {selectedImage.width}px
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.width}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, {
                    width: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Height: {selectedImage.height}px
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.height}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, {
                    height: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Rotation: {selectedImage.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedImage.rotation}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, {
                    rotation: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Opacity: {Math.round(selectedImage.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedImage.opacity}
                onChange={(e) =>
                  updateImageOverlay(selectedImage.id, {
                    opacity: Number(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* All Overlays List */}
      {(textOverlays.length > 0 || imageOverlays.length > 0) && (
        <div className="mb-4">
          <h5 className="font-semibold text-sm mb-2">All Overlays</h5>
          <div className="space-y-2">
            {textOverlays.map((overlay) => (
              <button
                key={overlay.id}
                onClick={() => {
                  const canvasAPI = (window as any).imageEditorCanvas;
                  if (canvasAPI) {
                    canvasAPI.setSelectedOverlay(overlay.id);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedOverlay === overlay.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                📝 {overlay.text.substring(0, 20)}...
              </button>
            ))}
            {imageOverlays.map((overlay) => (
              <button
                key={overlay.id}
                onClick={() => {
                  const canvasAPI = (window as any).imageEditorCanvas;
                  if (canvasAPI) {
                    canvasAPI.setSelectedOverlay(overlay.id);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  selectedOverlay === overlay.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                🖼️ Image Overlay
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 space-y-1">
        <p>• Click and drag overlays to move them</p>
        <p>• Select an overlay to edit its properties</p>
        <p>• Perfect for watermarks & branding</p>
      </div>
    </div>
  );
}

interface ImageEditorSidebarProps {
  selectedEditTool: EditTool;
  onEditToolChange: (tool: EditTool) => void;
  prompt: string;
  // negativePrompt: string; // Removed - LaMa doesn't support negative prompts
  searchPrompt: string;
  onPromptChange: (value: string) => void;
  // onNegativePromptChange: (value: string) => void; // Removed
  onSearchPromptChange: (value: string) => void;
  outpaintLeft: number;
  outpaintRight: number;
  outpaintUp: number;
  outpaintDown: number;
  creativity: number;
  onOutpaintLeftChange: (value: number) => void;
  onOutpaintRightChange: (value: number) => void;
  onOutpaintUpChange: (value: number) => void;
  onOutpaintDownChange: (value: number) => void;
  onCreativityChange: (value: number) => void;
  isProcessing: boolean;
  onFilterSave?: (dataUrl: string) => void;
  onApplyCollage?: (dataUrl: string) => void;
  onApplyTemplate?: (templateData: any) => void;
  onApplyFrame?: (frameData: any) => void;
  onApplyBackground?: (backgroundData: any) => void;
  onApplyLandingPage?: (templateData: any) => void;
  currentImageUrl?: string | null;
  campaignId?: string | null;
  hasTransparency?: boolean;
  selectedImages?: { id: string; url: string; prompt: string }[];
  libraryImages?: { id: string; url: string; prompt?: string }[];
}

export function ImageEditorSidebar({
  selectedEditTool,
  onEditToolChange,
  prompt,
  // negativePrompt, // Removed
  searchPrompt,
  onPromptChange,
  // onNegativePromptChange, // Removed
  onSearchPromptChange,
  outpaintLeft,
  outpaintRight,
  outpaintUp,
  outpaintDown,
  creativity,
  onOutpaintLeftChange,
  onOutpaintRightChange,
  onOutpaintUpChange,
  onOutpaintDownChange,
  onCreativityChange,
  isProcessing,
  onFilterSave,
  onApplyCollage,
  onApplyTemplate,
  onApplyFrame,
  onApplyBackground,
  onApplyLandingPage,
  currentImageUrl,
  campaignId,
  hasTransparency = false,
  selectedImages = [],
  libraryImages = [],
}: ImageEditorSidebarProps) {
  const allTools: {
    id: EditTool;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "erase",
      label: "Erase",
      icon: "🧹",
      description: "Remove objects cleanly",
    },
    {
      id: "background-remove",
      label: "Remove BG",
      icon: "🖼️",
      description: "Remove background",
    },
    {
      id: "search-replace",
      label: "Replace",
      icon: "🔄",
      description: "Replace specific objects",
    },
    {
      id: "outpaint",
      label: "Extend",
      icon: "↔️",
      description: "Extend image borders",
    },
    {
      id: "upscale",
      label: "Upscale",
      icon: "⬆️",
      description: "AI enhance & upscale",
    },
    {
      id: "sketch-to-image",
      label: "Sketch",
      icon: "✏️",
      description: "Sketch to photo",
    },
    {
      id: "overlay",
      label: "Overlay",
      icon: "📝",
      description: "Add text/images",
    },
    {
      id: "resize",
      label: "Resize",
      icon: "📐",
      description: "Smart resize & format",
    },
    {
      id: "crop",
      label: "Crop",
      icon: "✂️",
      description: "Crop & trim images",
    },
    {
      id: "filters",
      label: "Filters",
      icon: "🎭",
      description: "Apply color filters",
    },
    {
      id: "collage",
      label: "Collage",
      icon: "🖼️",
      description: "Combine multiple images",
    },
    {
      id: "template",
      label: "Templates",
      icon: "📋",
      description: "Use pre-made social templates",
    },
    {
      id: "frame",
      label: "Frame",
      icon: "🖼️",
      description: "Add decorative frames/borders",
    },
    {
      id: "background-add",
      label: "Background",
      icon: "🎨",
      description: "Add background from library",
    },
    {
      id: "landing-page",
      label: "Landing Page",
      icon: "📄",
      description: "Create landing page templates",
    },
  ];

  // Filter out erase tools if image has transparency
  const tools = hasTransparency
    ? allTools.filter((tool) => tool.id !== "erase")
    : allTools;

  // If transparency is detected and current tool is erase, switch to background-remove
  useEffect(() => {
    if (hasTransparency && selectedEditTool === "erase") {
      onEditToolChange("background-remove");
    }
  }, [hasTransparency, selectedEditTool, onEditToolChange]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-auto">
      {/* Tool Selector Grid - Always hidden when a tool is selected */}
      {/* Tool selection is now done via the toolbar at the top */}

      {/* Transparency Warning - Show when needed */}
      {hasTransparency && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-amber-600 text-lg">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Transparent Background Detected
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Erase tools are disabled on images with transparency. Please use
                a non-transparent image for these features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Tool - Full Width Layout */}
      {selectedEditTool === "overlay" && (
        <OverlayToolControls
          isProcessing={isProcessing}
          libraryImages={libraryImages}
        />
      )}

      {/* Filters Tool - Full Width Layout */}
      {selectedEditTool === "filters" && (
        <FilterToolControls
          isProcessing={isProcessing}
          onApplyFilter={onFilterSave || (() => {})}
        />
      )}

      {/* Collage Tool - Full Width Layout */}
      {selectedEditTool === "collage" && onApplyCollage && (
        <CollageToolControls
          isProcessing={isProcessing}
          currentImageUrl={currentImageUrl || ""}
          onApplyCollage={onApplyCollage}
          selectedImages={selectedImages}
        />
      )}

      {/* Template Tool - Full Width Layout */}
      {selectedEditTool === "template" && onApplyTemplate && (
        <TemplateToolControls
          isProcessing={isProcessing}
          currentImageUrl={currentImageUrl || ""}
          onApplyTemplate={onApplyTemplate}
        />
      )}

      {/* Frame Tool - Full Width Layout */}
      {selectedEditTool === "frame" && onApplyFrame && (
        <FrameToolControls
          isProcessing={isProcessing}
          currentImageUrl={currentImageUrl || ""}
          onApplyFrame={onApplyFrame}
        />
      )}

      {/* Crop Tool - Full Width Layout */}
      {selectedEditTool === "crop" && (
        <CropToolControls
          isProcessing={isProcessing}
          onApplyCrop={onFilterSave || (() => {})}
        />
      )}

      {/* Background Library - Full Width Layout */}
      {selectedEditTool === "background-add" && onApplyBackground && (
        <BackgroundLibraryControls
          isProcessing={isProcessing}
          currentImageUrl={currentImageUrl || ""}
          onApplyBackground={onApplyBackground}
        />
      )}

      {/* Landing Page Builder - Full Width Layout */}
      {selectedEditTool === "landing-page" && onApplyLandingPage && (
        <LandingPageBuilder
          textContent={[]}
          images={[]}
          videos={[]}
          campaignId={campaignId ? parseInt(campaignId) : undefined}
          onSave={onApplyLandingPage}
          isProcessing={isProcessing}
        />
      )}

      {/* Settings Panel - Hide for overlay, filters, collage, template, frame, background, crop, and landing-page tools */}
      {selectedEditTool !== "overlay" &&
        selectedEditTool !== "filters" &&
        selectedEditTool !== "collage" &&
        selectedEditTool !== "template" &&
        selectedEditTool !== "frame" &&
        selectedEditTool !== "background-add" &&
        selectedEditTool !== "crop" &&
        selectedEditTool !== "landing-page" && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Settings
            </h4>

            {/* Erase Settings */}
            {selectedEditTool === "erase" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Paint over objects you want to remove. AI will intelligently
                  fill the area.
                </p>
                {/* NEW: Helpful tip */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">💡</span>
                    <div className="text-sm text-blue-900">
                      <div className="font-medium mb-1">Replace Objects:</div>
                      <div>
                        1. Use <strong>Erase</strong> to remove unwanted objects
                        <br />
                        2. Use <strong>Overlay</strong> to add product images
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Background Removal Settings */}
            {selectedEditTool === "background-remove" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Automatically removes the background from your image. No mask
                  needed!
                </p>
              </div>
            )}

            {/* Search & Replace Settings */}
            {selectedEditTool === "search-replace" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search For *
                  </label>
                  <input
                    type="text"
                    value={searchPrompt}
                    onChange={(e) => onSearchPromptChange(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g., 'the car'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Replace With *
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g., 'a bicycle'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>
            )}

            {/* Outpainting Settings */}
            {selectedEditTool === "outpaint" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Describe how to extend..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Left (px)
                    </label>
                    <input
                      type="number"
                      value={outpaintLeft}
                      onChange={(e) =>
                        onOutpaintLeftChange(Number(e.target.value))
                      }
                      disabled={isProcessing}
                      min="0"
                      max="2000"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Right (px)
                    </label>
                    <input
                      type="number"
                      value={outpaintRight}
                      onChange={(e) =>
                        onOutpaintRightChange(Number(e.target.value))
                      }
                      disabled={isProcessing}
                      min="0"
                      max="2000"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Up (px)
                    </label>
                    <input
                      type="number"
                      value={outpaintUp}
                      onChange={(e) =>
                        onOutpaintUpChange(Number(e.target.value))
                      }
                      disabled={isProcessing}
                      min="0"
                      max="2000"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Down (px)
                    </label>
                    <input
                      type="number"
                      value={outpaintDown}
                      onChange={(e) =>
                        onOutpaintDownChange(Number(e.target.value))
                      }
                      disabled={isProcessing}
                      min="0"
                      max="2000"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creativity: {creativity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    value={creativity}
                    onChange={(e) => onCreativityChange(Number(e.target.value))}
                    disabled={isProcessing}
                    min="0"
                    max="1"
                    step="0.05"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            )}

            {/* Upscale Settings */}
            {selectedEditTool === "upscale" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Describe the image for better upscaling..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Upscales to higher resolution while enhancing quality
                </p>
              </div>
            )}

            {/* Sketch to Image Settings */}
            {selectedEditTool === "sketch-to-image" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isProcessing}
                    placeholder="Describe what the sketch represents..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
