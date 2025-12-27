"use client";

import { useState } from "react";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface FrameStyle {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  category: string;
}

interface FrameToolControlsProps {
  isProcessing: boolean;
  currentImageUrl?: string;
  onApplyFrame: (frameData: any) => void;
}

const FRAME_STYLES: FrameStyle[] = [
  // Modern Frames
  {
    id: "modern-thin",
    name: "Thin Line",
    thumbnail: "▭",
    description: "Simple thin border",
    category: "modern",
  },
  {
    id: "modern-thick",
    name: "Bold Border",
    thumbnail: "▬",
    description: "Thick modern border",
    category: "modern",
  },
  {
    id: "modern-double",
    name: "Double Line",
    thumbnail: "▭▭",
    description: "Two line border",
    category: "modern",
  },
  {
    id: "modern-shadow",
    name: "Drop Shadow",
    thumbnail: "⬜",
    description: "Border with shadow",
    category: "modern",
  },

  // Classic Frames
  {
    id: "classic-rounded",
    name: "Rounded",
    thumbnail: "⬭",
    description: "Rounded corner frame",
    category: "classic",
  },
  {
    id: "classic-beveled",
    name: "Beveled",
    thumbnail: "◫",
    description: "3D beveled edge",
    category: "classic",
  },
  {
    id: "classic-ornate",
    name: "Ornate",
    thumbnail: "❖",
    description: "Decorative pattern",
    category: "classic",
  },

  // Photo Frames
  {
    id: "photo-polaroid",
    name: "Polaroid",
    thumbnail: "📷",
    description: "Instant photo style",
    category: "photo",
  },
  {
    id: "photo-matted",
    name: "Matted",
    thumbnail: "🖼️",
    description: "Gallery mat frame",
    category: "photo",
  },

  // Special Effects
  {
    id: "special-neon",
    name: "Neon Glow",
    thumbnail: "✨",
    description: "Glowing border effect",
    category: "special",
  },
  {
    id: "special-gradient",
    name: "Gradient",
    thumbnail: "🌈",
    description: "Color gradient border",
    category: "special",
  },
  {
    id: "special-dashed",
    name: "Dashed Line",
    thumbnail: "- - -",
    description: "Dashed border",
    category: "special",
  },
];

const FRAME_CATEGORIES = [
  { id: "all", name: "All Frames", icon: "🎨" },
  { id: "modern", name: "Modern", icon: "▭" },
  { id: "classic", name: "Classic", icon: "❖" },
  { id: "photo", name: "Photo", icon: "📷" },
  { id: "special", name: "Special", icon: "✨" },
];

export function FrameToolControls({
  isProcessing,
  currentImageUrl,
  onApplyFrame,
}: FrameToolControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("modern-thin");
  
  // Frame settings
  const [frameWidth, setFrameWidth] = useState(20);
  const [frameColor, setFrameColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowColor, setShadowColor] = useState("#00000080");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [innerPadding, setInnerPadding] = useState(10);

  const filteredStyles =
    selectedCategory === "all"
      ? FRAME_STYLES
      : FRAME_STYLES.filter((s) => s.category === selectedCategory);

  const selectedStyleInfo = FRAME_STYLES.find((s) => s.id === selectedStyle);

  const handleApply = () => {
    const frameData = {
      style: selectedStyle,
      width: frameWidth,
      color: frameColor,
      backgroundColor: backgroundColor,
      shadow: shadowEnabled
        ? {
            blur: shadowBlur,
            color: shadowColor,
          }
        : null,
      cornerRadius: cornerRadius,
      innerPadding: innerPadding,
      currentImageUrl: currentImageUrl ? getProxiedImageUrl(currentImageUrl) : null,
    };

    onApplyFrame(frameData);
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Category Selector */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Frame Style</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {FRAME_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Frame Style Grid */}
        <div className="grid grid-cols-3 gap-2">
          {filteredStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              title={style.description}
              className={`p-3 border-2 rounded-lg text-center transition ${
                selectedStyle === style.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400"
              }`}
            >
              <div className="text-2xl mb-1">{style.thumbnail}</div>
              <div className="text-xs font-medium truncate">{style.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Settings */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Frame Settings</h3>

        {/* Frame Width */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Frame Width: {frameWidth}px
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={frameWidth}
            onChange={(e) => setFrameWidth(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Frame Color */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Frame Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <input
              type="text"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Background Color (for matted frames) */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Mat/Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        {/* Inner Padding */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Inner Padding: {innerPadding}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={innerPadding}
            onChange={(e) => setInnerPadding(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Space between image and frame
          </p>
        </div>

        {/* Corner Radius */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Corner Radius: {cornerRadius}px
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={cornerRadius}
            onChange={(e) => setCornerRadius(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Shadow Settings */}
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={shadowEnabled}
              onChange={(e) => setShadowEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs font-medium text-gray-700">Drop Shadow</span>
          </label>

          {shadowEnabled && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Shadow Blur: {shadowBlur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Shadow Color
                </label>
                <input
                  type="color"
                  value={shadowColor.slice(0, 7)}
                  onChange={(e) => setShadowColor(e.target.value + "80")}
                  className="h-8 w-full rounded border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Info */}
      {selectedStyleInfo && (
        <div className="p-3 bg-blue-50 rounded-lg text-xs">
          <p className="font-semibold text-blue-900 mb-1">
            {selectedStyleInfo.name}
          </p>
          <p className="text-blue-800">{selectedStyleInfo.description}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t border-gray-200 py-3">
        <button
          onClick={handleApply}
          disabled={isProcessing || !currentImageUrl}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isProcessing ? "Applying..." : "Apply Frame"}
        </button>
      </div>

      {/* Usage Tips */}
      <div className="p-3 bg-gray-50 rounded text-xs text-gray-700">
        <p className="font-semibold mb-1">💡 Frame Tips:</p>
        <ul className="space-y-1">
          <li>• Thin frames work best for modern, minimal looks</li>
          <li>• Add inner padding for a matted photo effect</li>
          <li>• Enable shadow for depth and elevation</li>
          <li>• Use corner radius for softer edges</li>
        </ul>
      </div>
    </div>
  );
}
