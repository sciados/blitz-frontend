"use client";

import { EditTool } from "src/app/image-editor/page";
import { useState, useEffect } from "react";
import { FilterToolControls } from "src/components/image-editor/FilterToolControls";
import { CollageToolControls } from "src/components/image-editor/CollageToolControls";

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
}

function OverlayToolControls({ isProcessing }: OverlayToolControlsProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);

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

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      const updated = textOverlays.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      );
      canvasAPI.setTextOverlays(updated);
    }
  };

  const updateImageOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      const updated = imageOverlays.map(overlay =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      );
      canvasAPI.setImageOverlays(updated);
    }
  };

  const deleteOverlay = (id: string) => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI) {
      canvasAPI.setTextOverlays(textOverlays.filter(o => o.id !== id));
      canvasAPI.setImageOverlays(imageOverlays.filter(o => o.id !== id));
      canvasAPI.setSelectedOverlay(null);
    }
  };

  const selectedText = textOverlays.find(o => o.id === selectedOverlay);
  const selectedImage = imageOverlays.find(o => o.id === selectedOverlay);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📝 Overlay Editor</h3>

      {/* Add Overlay Buttons */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h5 className="font-semibold text-sm text-blue-900 mb-2">
          Text & Image Overlays
        </h5>
        <p className="text-xs text-blue-800 mb-3">
          Add text and image overlays to your image. No AI cost!
        </p>

        <button
          onClick={addTextOverlay}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium mb-2"
        >
          ➕ Add Text
        </button>

        <label className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium cursor-pointer flex items-center justify-center gap-2">
          🖼️ Add Image
          <input
            type="file"
            accept="image/*"
            onChange={addImageOverlay}
            disabled={isProcessing}
            className="hidden"
          />
        </label>
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
                onChange={(e) => updateTextOverlay(selectedText.id, { text: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size: {selectedText.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="200"
                value={selectedText.fontSize}
                onChange={(e) => updateTextOverlay(selectedText.id, { fontSize: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateTextOverlay(selectedText.id, { fontFamily: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => updateTextOverlay(selectedText.id, { color: e.target.value })}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background</label>
                <input
                  type="color"
                  value={selectedText.backgroundColor === 'transparent' ? '#000000' : selectedText.backgroundColor}
                  onChange={(e) => updateTextOverlay(selectedText.id, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateTextOverlay(selectedText.id, { backgroundColor: 'transparent' })}
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
                  onChange={(e) => updateTextOverlay(selectedText.id, { bold: e.target.checked })}
                  className="mr-2"
                />
                Bold
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedText.italic}
                  onChange={(e) => updateTextOverlay(selectedText.id, { italic: e.target.checked })}
                  className="mr-2"
                />
                Italic
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rotation: {selectedText.rotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedText.rotation}
                onChange={(e) => updateTextOverlay(selectedText.id, { rotation: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opacity: {Math.round(selectedText.opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedText.opacity}
                onChange={(e) => updateTextOverlay(selectedText.id, { opacity: Number(e.target.value) })}
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
              <label className="block text-sm font-medium mb-1">Width: {selectedImage.width}px</label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.width}
                onChange={(e) => updateImageOverlay(selectedImage.id, { width: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Height: {selectedImage.height}px</label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.height}
                onChange={(e) => updateImageOverlay(selectedImage.id, { height: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rotation: {selectedImage.rotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedImage.rotation}
                onChange={(e) => updateImageOverlay(selectedImage.id, { rotation: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opacity: {Math.round(selectedImage.opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedImage.opacity}
                onChange={(e) => updateImageOverlay(selectedImage.id, { opacity: Number(e.target.value) })}
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
            {textOverlays.map(overlay => (
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
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                📝 {overlay.text.substring(0, 20)}...
              </button>
            ))}
            {imageOverlays.map(overlay => (
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
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
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
  negativePrompt: string;
  searchPrompt: string;
  onPromptChange: (value: string) => void;
  onNegativePromptChange: (value: string) => void;
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
  currentImageUrl?: string | null;
}

export function ImageEditorSidebar({
  selectedEditTool,
  onEditToolChange,
  prompt,
  negativePrompt,
  searchPrompt,
  onPromptChange,
  onNegativePromptChange,
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
  currentImageUrl,
}: ImageEditorSidebarProps) {
  const tools: {
    id: EditTool;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      id: "inpaint",
      label: "Inpaint",
      icon: "🎨",
      description: "Fill masked areas with AI",
    },
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
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-auto">
      {/* Tool Selector Grid - Hide for overlay and filters tools */}
      {selectedEditTool !== "overlay" && selectedEditTool !== "filters" && (
        <>
          <h3 className="text-lg font-semibold mb-4">Edit Tools</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onEditToolChange(tool.id)}
                disabled={isProcessing}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedEditTool === tool.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } disabled:opacity-50`}
              >
                <div className="text-2xl mb-1">{tool.icon}</div>
                <div className="text-sm font-semibold">{tool.label}</div>
                <div className="text-xs text-gray-600">{tool.description}</div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Settings</h4>
          </div>
        </>
      )}

      {/* Overlay Tool - Full Width Layout */}
      {selectedEditTool === "overlay" && (
        <OverlayToolControls isProcessing={isProcessing} />
      )}

      {/* Filters Tool - Full Width Layout */}
      {selectedEditTool === "filters" && (
        <FilterToolControls isProcessing={isProcessing} onApplyFilter={onFilterSave || (() => {})} />
      )}

      {/* Collage Tool - Full Width Layout */}
      {selectedEditTool === "collage" && onApplyCollage && (
        <CollageToolControls 
          isProcessing={isProcessing} 
          currentImageUrl={currentImageUrl || ""}
          onApplyCollage={onApplyCollage}
        />
      )}

      {/* Settings Panel - Hide for overlay, filters, and collage tools */}
      {selectedEditTool !== "overlay" && selectedEditTool !== "filters" && selectedEditTool !== "collage" && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Settings</h4>

        {/* Inpainting Settings */}
        {selectedEditTool === "inpaint" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to paint in masked area..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Erase Settings */}
        {selectedEditTool === "erase" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Paint over objects you want to remove. AI will intelligently fill
              the area.
            </p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
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
                  onChange={(e) => onOutpaintLeftChange(Number(e.target.value))}
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
                  onChange={(e) => onOutpaintUpChange(Number(e.target.value))}
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
                  onChange={(e) => onOutpaintDownChange(Number(e.target.value))}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negative Prompt
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                disabled={isProcessing}
                placeholder="What to avoid..."
                rows={2}
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
