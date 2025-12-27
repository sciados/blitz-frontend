"use client";

import { useState } from "react";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface Background {
  id: string;
  name: string;
  category: string;
  type: "gradient" | "solid" | "texture" | "pattern";
  preview: string;
  data: any;
}

interface BackgroundLibraryControlsProps {
  isProcessing: boolean;
  currentImageUrl?: string;
  onApplyBackground: (backgroundData: any) => void;
}

const BACKGROUNDS: Background[] = [
  // Gradients - Linear
  {
    id: "gradient-sunset",
    name: "Sunset",
    category: "gradients",
    type: "gradient",
    preview: "🌅",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#FF6B6B", "#FFE66D", "#4ECDC4"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "gradient-ocean",
    name: "Ocean",
    category: "gradients",
    type: "gradient",
    preview: "🌊",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#667eea", "#764ba2"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-forest",
    name: "Forest",
    category: "gradients",
    type: "gradient",
    preview: "🌲",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#134E5E", "#71B280"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-royal",
    name: "Royal",
    category: "gradients",
    type: "gradient",
    preview: "👑",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#7F7FD5", "#86A8E7", "#91EAE4"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "gradient-fire",
    name: "Fire",
    category: "gradients",
    type: "gradient",
    preview: "🔥",
    data: {
      type: "linear",
      angle: 45,
      colors: ["#F2994A", "#F2C94C"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-radial-light",
    name: "Spotlight",
    category: "gradients",
    type: "gradient",
    preview: "💡",
    data: {
      type: "radial",
      colors: ["#FFFFFF", "#E0E0E0"],
      stops: [0, 1],
    },
  },

  // Solid Colors - Professional
  {
    id: "solid-white",
    name: "Pure White",
    category: "solids",
    type: "solid",
    preview: "⬜",
    data: { color: "#FFFFFF" },
  },
  {
    id: "solid-offwhite",
    name: "Off White",
    category: "solids",
    type: "solid",
    preview: "⬜",
    data: { color: "#F8F9FA" },
  },
  {
    id: "solid-lightgray",
    name: "Light Gray",
    category: "solids",
    type: "solid",
    preview: "⬜",
    data: { color: "#E9ECEF" },
  },
  {
    id: "solid-gray",
    name: "Gray",
    category: "solids",
    type: "solid",
    preview: "⬜",
    data: { color: "#ADB5BD" },
  },
  {
    id: "solid-darkgray",
    name: "Dark Gray",
    category: "solids",
    type: "solid",
    preview: "⬜",
    data: { color: "#495057" },
  },
  {
    id: "solid-black",
    name: "Black",
    category: "solids",
    type: "solid",
    preview: "⬛",
    data: { color: "#000000" },
  },
  {
    id: "solid-blue",
    name: "Sky Blue",
    category: "solids",
    type: "solid",
    preview: "🔵",
    data: { color: "#3498DB" },
  },
  {
    id: "solid-red",
    name: "Red",
    category: "solids",
    type: "solid",
    preview: "🔴",
    data: { color: "#E74C3C" },
  },
  {
    id: "solid-green",
    name: "Green",
    category: "solids",
    type: "solid",
    preview: "🟢",
    data: { color: "#2ECC71" },
  },
  {
    id: "solid-yellow",
    name: "Yellow",
    category: "solids",
    type: "solid",
    preview: "🟡",
    data: { color: "#F1C40F" },
  },

  // Textures
  {
    id: "texture-paper",
    name: "Paper",
    category: "textures",
    type: "texture",
    preview: "📄",
    data: {
      type: "noise",
      baseColor: "#F5F5DC",
      intensity: 0.15,
    },
  },
  {
    id: "texture-canvas",
    name: "Canvas",
    category: "textures",
    type: "texture",
    preview: "🎨",
    data: {
      type: "noise",
      baseColor: "#FAF0E6",
      intensity: 0.25,
    },
  },
  {
    id: "texture-concrete",
    name: "Concrete",
    category: "textures",
    type: "texture",
    preview: "🏗️",
    data: {
      type: "noise",
      baseColor: "#C0C0C0",
      intensity: 0.3,
    },
  },
  {
    id: "texture-fabric",
    name: "Fabric",
    category: "textures",
    type: "texture",
    preview: "🧵",
    data: {
      type: "noise",
      baseColor: "#E8E8E8",
      intensity: 0.2,
    },
  },

  // Seasonal - Spring
  {
    id: "seasonal-spring",
    name: "Spring Bloom",
    category: "seasonal",
    type: "gradient",
    preview: "🌸",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#FFE5E5", "#FFF0F5", "#E8F5E9"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "seasonal-summer",
    name: "Summer Sky",
    category: "seasonal",
    type: "gradient",
    preview: "☀️",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#56CCF2", "#2F80ED"],
      stops: [0, 1],
    },
  },
  {
    id: "seasonal-autumn",
    name: "Autumn Leaves",
    category: "seasonal",
    type: "gradient",
    preview: "🍂",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#D4A574", "#C77E4D", "#8B4513"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "seasonal-winter",
    name: "Winter Frost",
    category: "seasonal",
    type: "gradient",
    preview: "❄️",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#E3F2FD", "#BBDEFB", "#90CAF9"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "seasonal-holiday",
    name: "Holiday",
    category: "seasonal",
    type: "gradient",
    preview: "🎄",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#C41E3A", "#165B33"],
      stops: [0, 1],
    },
  },
];

const CATEGORIES = [
  { id: "all", name: "All", icon: "🎨" },
  { id: "gradients", name: "Gradients", icon: "🌈" },
  { id: "solids", name: "Solid Colors", icon: "⬜" },
  { id: "textures", name: "Textures", icon: "📄" },
  { id: "seasonal", name: "Seasonal", icon: "🍂" },
];

export function BackgroundLibraryControls({
  isProcessing,
  currentImageUrl,
  onApplyBackground,
}: BackgroundLibraryControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [textureIntensity, setTextureIntensity] = useState(0.2);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [useCustomColor, setUseCustomColor] = useState(false);

  const filteredBackgrounds =
    selectedCategory === "all"
      ? BACKGROUNDS
      : BACKGROUNDS.filter((bg) => bg.category === selectedCategory);

  const selectedBg = BACKGROUNDS.find((bg) => bg.id === selectedBackground);

  const handleApply = () => {
    if (!selectedBg && !useCustomColor) {
      return;
    }

    let backgroundData;

    if (useCustomColor) {
      backgroundData = {
        type: "solid",
        data: { color: customColor },
        currentImageUrl: currentImageUrl ? getProxiedImageUrl(currentImageUrl) : null,
      };
    } else if (selectedBg) {
      backgroundData = {
        type: selectedBg.type,
        data: {
          ...selectedBg.data,
          // Apply customizations
          ...(selectedBg.type === "texture" && { intensity: textureIntensity }),
          ...(selectedBg.type === "gradient" &&
              selectedBg.data.type === "linear" &&
              { angle: gradientAngle }),
        },
        currentImageUrl: currentImageUrl ? getProxiedImageUrl(currentImageUrl) : null,
      };
    }

    if (backgroundData) {
      onApplyBackground(backgroundData);
    }
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Category Tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Background Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
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
      </div>

      {/* Background Library Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Choose Background</h3>
        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
          {filteredBackgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                setSelectedBackground(bg.id);
                setUseCustomColor(false);
              }}
              title={bg.name}
              className={`p-3 border-2 rounded-lg text-center transition ${
                selectedBackground === bg.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400"
              }`}
              style={
                bg.type === "solid"
                  ? { backgroundColor: bg.data.color }
                  : bg.type === "gradient" && bg.data.type === "linear"
                  ? {
                      background: `linear-gradient(${bg.data.angle}deg, ${bg.data.colors.join(", ")})`,
                    }
                  : bg.type === "gradient" && bg.data.type === "radial"
                  ? {
                      background: `radial-gradient(circle, ${bg.data.colors.join(", ")})`,
                    }
                  : {}
              }
            >
              <div className="text-2xl mb-1">{bg.preview}</div>
              <div className="text-xs font-medium text-gray-700 bg-white/80 px-1 rounded">
                {bg.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Option */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Custom Color</h3>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            id="use-custom"
            checked={useCustomColor}
            onChange={(e) => {
              setUseCustomColor(e.target.checked);
              if (e.target.checked) {
                setSelectedBackground(null);
              }
            }}
            className="rounded"
          />
          <label htmlFor="use-custom" className="text-sm text-gray-700">
            Use custom color instead
          </label>
        </div>
        {useCustomColor && (
          <div className="flex gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="#FFFFFF"
            />
          </div>
        )}
      </div>

      {/* Customization Options */}
      {selectedBg && !useCustomColor && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Customize</h3>

          {/* Gradient Angle */}
          {selectedBg.type === "gradient" && selectedBg.data.type === "linear" && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Gradient Angle: {gradientAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradientAngle}
                onChange={(e) => setGradientAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* Texture Intensity */}
          {selectedBg.type === "texture" && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Texture Intensity: {Math.round(textureIntensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={textureIntensity}
                onChange={(e) => setTextureIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Preview Info */}
      {(selectedBg || useCustomColor) && (
        <div className="p-3 bg-blue-50 rounded-lg text-xs">
          <p className="font-semibold text-blue-900 mb-1">
            {useCustomColor ? "Custom Color" : selectedBg?.name}
          </p>
          <p className="text-blue-800">
            {useCustomColor
              ? "Your custom background color"
              : selectedBg?.type === "gradient"
              ? "Gradient background with smooth color transitions"
              : selectedBg?.type === "solid"
              ? "Solid color background"
              : "Textured background with subtle detail"}
          </p>
        </div>
      )}

      {/* Apply Button */}
      <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t border-gray-200 py-3">
        <button
          onClick={handleApply}
          disabled={isProcessing || (!selectedBackground && !useCustomColor) || !currentImageUrl}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {isProcessing ? "Applying..." : "Apply Background"}
        </button>
      </div>

      {/* Usage Tips */}
      <div className="p-3 bg-gray-50 rounded text-xs text-gray-700">
        <p className="font-semibold mb-1">💡 Background Tips:</p>
        <ul className="space-y-1">
          <li>• Works best with transparent PNG images</li>
          <li>• Use Background Remove tool first for best results</li>
          <li>• Gradients great for modern, professional looks</li>
          <li>• Solid colors perfect for product photography</li>
          <li>• Textures add depth and interest</li>
        </ul>
      </div>
    </div>
  );
}
