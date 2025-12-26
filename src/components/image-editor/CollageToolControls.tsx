"use client";

import { useState, useEffect } from "react";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface CollageLayout {
  id: string;
  name: string;
  icon: string;
  description: string;
  slots: number;
  pattern: string;
}

const collageLayouts: CollageLayout[] = [
  {
    id: "grid-2",
    name: "2 Grid",
    icon: "▦",
    description: "2 images side by side",
    slots: 2,
    pattern: "2-col"
  },
  {
    id: "grid-3",
    name: "3 Grid",
    icon: "▦",
    description: "3 images in a row",
    slots: 3,
    pattern: "3-col"
  },
  {
    id: "grid-4",
    name: "2×2 Grid",
    icon: "▦",
    description: "4 images in 2×2 grid",
    slots: 4,
    pattern: "2x2"
  },
  {
    id: "grid-6",
    name: "3×2 Grid",
    icon: "▦",
    description: "6 images in 3×2 grid",
    slots: 6,
    pattern: "3x2"
  },
  {
    id: "grid-9",
    name: "3×3 Grid",
    icon: "▦",
    description: "9 images in 3×3 grid",
    slots: 9,
    pattern: "3x3"
  },
  {
    id: "hero-left",
    name: "Hero Left",
    icon: "◧",
    description: "Large left + 2 right",
    slots: 3,
    pattern: "hero-left"
  },
  {
    id: "hero-right",
    name: "Hero Right",
    icon: "◨",
    description: "Large right + 2 left",
    slots: 3,
    pattern: "hero-right"
  },
  {
    id: "vertical-split",
    name: "Vertical",
    icon: "▯",
    description: "2 images stacked",
    slots: 2,
    pattern: "vertical"
  }
];

interface CollageToolControlsProps {
  isProcessing: boolean;
  currentImageUrl: string;
  onApplyCollage: (dataUrl: string) => void;
  selectedImages?: { id: string; url: string; prompt: string }[];
}

export function CollageToolControls({
  isProcessing,
  currentImageUrl,
  onApplyCollage,
  selectedImages = []
}: CollageToolControlsProps) {
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
  const [spacing, setSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  // Initialize with current image if available
  useEffect(() => {
    if (currentImageUrl && uploadedImages.length === 0) {
      const proxiedUrl = getProxiedImageUrl(currentImageUrl);
      setUploadedImages([proxiedUrl]);
    }
  }, [currentImageUrl]);

  // Load selected images from Content Library
  useEffect(() => {
    if (selectedImages && selectedImages.length > 0) {
      // Convert selected images to proxy URLs and add to uploadedImages
      const proxiedUrls = selectedImages.map(img => getProxiedImageUrl(img.url));
      setUploadedImages(prev => {
        // Don't duplicate if current image is already in the list
        const hasCurrentImage = prev.some(url => url === getProxiedImageUrl(currentImageUrl));
        return hasCurrentImage ? [...prev, ...proxiedUrls] : proxiedUrls;
      });
      console.log("📦 CollageTool: Loaded", selectedImages.length, "selected images");
    }
  }, [selectedImages, currentImageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLayoutSelect = (layout: CollageLayout) => {
    setSelectedLayout(layout);
    
    // Auto-generate collage preview on canvas
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.applyCollage) {
      canvasAPI.applyCollage({
        layout: layout.pattern,
        images: uploadedImages.slice(0, layout.slots),
        spacing,
        backgroundColor,
        canvasSize
      });
    }
  };

  const handleApply = () => {
    if (!selectedLayout || uploadedImages.length < selectedLayout.slots) {
      alert(`Please upload at least ${selectedLayout?.slots || 2} images`);
      return;
    }

    // Get collage from canvas
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.getCollageCanvas) {
      const collageDataUrl = canvasAPI.getCollageCanvas();
      if (collageDataUrl) {
        onApplyCollage(collageDataUrl);
      }
    }
  };

  const canApply = selectedLayout && uploadedImages.length >= selectedLayout.slots;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Images</h3>

        {/* Info about image selection */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Select images first</strong> from the Content Library using the checkboxes,
            then open the Collage tool to create your layout.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Or upload images directly:
          </p>
        </div>

        {/* Upload Button */}
        <label className="block w-full">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition mb-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isProcessing}
            />
            <div className="text-gray-600">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm">Click to upload images</div>
              <div className="text-xs text-gray-500 mt-1">
                {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
              </div>
            </div>
          </div>
        </label>

        {/* Selected Images Count */}
        {uploadedImages.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-green-800">
              ✓ {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} ready for collage
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout</h3>
        
        {/* Layout Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {collageLayouts.map((layout) => {
            const hasEnoughImages = uploadedImages.length >= layout.slots;
            const isSelected = selectedLayout?.id === layout.id;

            return (
              <button
                key={layout.id}
                onClick={() => handleLayoutSelect(layout)}
                disabled={!hasEnoughImages || isProcessing}
                className={`p-2 border-2 rounded-lg transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : hasEnoughImages
                    ? "border-gray-200 hover:border-blue-500"
                    : "border-gray-200 opacity-50 cursor-not-allowed"
                }`}
                title={`${layout.description} (needs ${layout.slots} images)`}
              >
                <div className="text-2xl mb-1">{layout.icon}</div>
                <div className={`text-xs font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {layout.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
        
        {/* Canvas Size */}
        <div>
          <label className="block text-xs text-gray-700 mb-1">Canvas Size</label>
          <select
            value={`${canvasSize.width}x${canvasSize.height}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split('x').map(Number);
              setCanvasSize({ width: w, height: h });
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            disabled={isProcessing}
          >
            <option value="1080x1080">Square (1080×1080)</option>
            <option value="1080x1350">Portrait (1080×1350)</option>
            <option value="1080x608">Landscape (1080×608)</option>
            <option value="1920x1080">Full HD (1920×1080)</option>
          </select>
        </div>

        {/* Spacing */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-700">Spacing</span>
            <span className="text-gray-600">{spacing}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={spacing}
            onChange={(e) => setSpacing(Number(e.target.value))}
            disabled={isProcessing}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-xs text-gray-700 mb-1">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              disabled={isProcessing}
              className="w-12 h-8 rounded border border-gray-300"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              disabled={isProcessing}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => {
            setSelectedLayout(null);
            // Convert R2 URL to proxy URL for CORS compliance
            const proxiedUrl = getProxiedImageUrl(currentImageUrl);
            setUploadedImages([proxiedUrl]);
          }}
          disabled={isProcessing}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          disabled={!canApply || isProcessing}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isProcessing ? "Creating..." : "Apply & Save"}
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Tips:</p>
        <ul className="space-y-1">
          <li>• Select {selectedLayout ? selectedLayout.slots : 2}+ images from library</li>
          <li>• Choose a layout below</li>
          <li>• Preview updates in real-time</li>
          <li>• Click Apply to save collage</li>
        </ul>
      </div>
    </div>
  );
}
