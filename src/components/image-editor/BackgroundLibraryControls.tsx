"use client";

import { useState } from "react";
import { getProxiedImageUrl } from "src/utils/imageProxy";

interface Background {
  id: string;
  name: string;
  category: string;
  type: "gradient" | "solid" | "texture" | "pattern" | "image";
  preview: string;
  data: any;
}

interface BackgroundLibraryControlsProps {
  isProcessing: boolean;
  currentImageUrl?: string;
  onApplyBackground: (backgroundData: any) => void;
  // NEW: Accept images from Content Library
  libraryImages?: Array<{ id: string; url: string; prompt?: string }>;
}

// Stock scenic backgrounds
const STOCK_SCENES: Background[] = [
  {
    id: "scene-city-skyline",
    name: "City Skyline",
    category: "scenes",
    type: "image",
    preview: "🏙️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-mountains",
    name: "Mountains",
    category: "scenes",
    type: "image",
    preview: "🏔️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-ocean-beach",
    name: "Ocean Beach",
    category: "scenes",
    type: "image",
    preview: "🏖️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-forest",
    name: "Forest",
    category: "scenes",
    type: "image",
    preview: "🌲",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-countryside",
    name: "Countryside",
    category: "scenes",
    type: "image",
    preview: "🌾",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-lake",
    name: "Lake",
    category: "scenes",
    type: "image",
    preview: "🏞️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-desert",
    name: "Desert",
    category: "scenes",
    type: "image",
    preview: "🏜️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-sunset-sky",
    name: "Sunset Sky",
    category: "scenes",
    type: "image",
    preview: "🌅",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-stars-night",
    name: "Starry Night",
    category: "scenes",
    type: "image",
    preview: "🌌",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80",
      blur: 3,
    },
  },
  {
    id: "scene-autumn-park",
    name: "Autumn Park",
    category: "scenes",
    type: "image",
    preview: "🍁",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-tropical-beach",
    name: "Tropical Beach",
    category: "scenes",
    type: "image",
    preview: "🏝️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-cityscape-night",
    name: "City Night",
    category: "scenes",
    type: "image",
    preview: "🌃",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-waterfall",
    name: "Waterfall",
    category: "scenes",
    type: "image",
    preview: "💧",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-garden",
    name: "Garden",
    category: "scenes",
    type: "image",
    preview: "🌺",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=1920&q=80",
      blur: 5,
    },
  },
  {
    id: "scene-snow-mountains",
    name: "Snow Mountains",
    category: "scenes",
    type: "image",
    preview: "⛰️",
    data: {
      imageUrl:
        "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80",
      blur: 5,
    },
  },
];

const BACKGROUNDS: Background[] = [
  // ========================================
  // GRADIENTS (15)
  // ========================================
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
  {
    id: "gradient-purple-pink",
    name: "Purple Dream",
    category: "gradients",
    type: "gradient",
    preview: "💜",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#6B73FF", "#FF6EC4"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-mint",
    name: "Mint Fresh",
    category: "gradients",
    type: "gradient",
    preview: "🍃",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#56ab2f", "#a8e063"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-rose-gold",
    name: "Rose Gold",
    category: "gradients",
    type: "gradient",
    preview: "🌹",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#ED4264", "#FFEDBC"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-cosmic",
    name: "Cosmic",
    category: "gradients",
    type: "gradient",
    preview: "🌌",
    data: {
      type: "linear",
      angle: 225,
      colors: ["#2E3192", "#1BFFFF"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-peach",
    name: "Peach",
    category: "gradients",
    type: "gradient",
    preview: "🍑",
    data: {
      type: "linear",
      angle: 135,
      colors: ["#FFA17F", "#00223E"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-aurora",
    name: "Aurora",
    category: "gradients",
    type: "gradient",
    preview: "🌈",
    data: {
      type: "linear",
      angle: 90,
      colors: ["#00C9FF", "#92FE9D"],
      stops: [0, 1],
    },
  },
  {
    id: "gradient-lava",
    name: "Lava",
    category: "gradients",
    type: "gradient",
    preview: "🌋",
    data: {
      type: "linear",
      angle: 45,
      colors: ["#FF0000", "#FF7F00", "#FFFF00"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "gradient-ice",
    name: "Ice",
    category: "gradients",
    type: "gradient",
    preview: "❄️",
    data: {
      type: "radial",
      colors: ["#E0F7FA", "#B2EBF2", "#80DEEA"],
      stops: [0, 0.5, 1],
    },
  },
  {
    id: "gradient-golden",
    name: "Golden Hour",
    category: "gradients",
    type: "gradient",
    preview: "✨",
    data: {
      type: "linear",
      angle: 180,
      colors: ["#F09819", "#EDDE5D"],
      stops: [0, 1],
    },
  },

  // ========================================
  // SOLID COLORS (12)
  // ========================================
  {
    id: "solid-white",
    name: "Pure White",
    category: "solids",
    type: "solid",
    preview: "⚪",
    data: { color: "#FFFFFF" },
  },
  {
    id: "solid-offwhite",
    name: "Off White",
    category: "solids",
    type: "solid",
    preview: "🤍",
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
    preview: "⚫",
    data: { color: "#ADB5BD" },
  },
  {
    id: "solid-darkgray",
    name: "Dark Gray",
    category: "solids",
    type: "solid",
    preview: "⬛",
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
    id: "solid-navy",
    name: "Navy",
    category: "solids",
    type: "solid",
    preview: "🔷",
    data: { color: "#0F172A" },
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
  {
    id: "solid-beige",
    name: "Beige",
    category: "solids",
    type: "solid",
    preview: "🟤",
    data: { color: "#F5F5DC" },
  },

  // ========================================
  // TEXTURES - PAPER (10)
  // ========================================
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
    id: "texture-kraft",
    name: "Kraft Paper",
    category: "textures",
    type: "texture",
    preview: "📦",
    data: {
      type: "noise",
      baseColor: "#D2B48C",
      intensity: 0.25,
    },
  },
  {
    id: "texture-parchment",
    name: "Parchment",
    category: "textures",
    type: "texture",
    preview: "📜",
    data: {
      type: "noise",
      baseColor: "#F0E68C",
      intensity: 0.2,
    },
  },
  {
    id: "texture-newsprint",
    name: "Newsprint",
    category: "textures",
    type: "texture",
    preview: "📰",
    data: {
      type: "noise",
      baseColor: "#E8E8E8",
      intensity: 0.3,
    },
  },
  {
    id: "texture-vintage-paper",
    name: "Vintage Paper",
    category: "textures",
    type: "texture",
    preview: "📃",
    data: {
      type: "noise",
      baseColor: "#F4E4C1",
      intensity: 0.35,
    },
  },
  {
    id: "texture-cardboard",
    name: "Cardboard",
    category: "textures",
    type: "texture",
    preview: "📋",
    data: {
      type: "noise",
      baseColor: "#B8956A",
      intensity: 0.4,
    },
  },
  {
    id: "texture-watercolor",
    name: "Watercolor",
    category: "textures",
    type: "texture",
    preview: "🎨",
    data: {
      type: "noise",
      baseColor: "#FFFFF0",
      intensity: 0.18,
    },
  },
  {
    id: "texture-recycled",
    name: "Recycled",
    category: "textures",
    type: "texture",
    preview: "♻️",
    data: {
      type: "noise",
      baseColor: "#D3D3D3",
      intensity: 0.28,
    },
  },
  {
    id: "texture-notebook",
    name: "Notebook",
    category: "textures",
    type: "texture",
    preview: "📓",
    data: {
      type: "noise",
      baseColor: "#FFFAF0",
      intensity: 0.12,
    },
  },
  {
    id: "texture-graph",
    name: "Graph Paper",
    category: "textures",
    type: "texture",
    preview: "📈",
    data: {
      type: "noise",
      baseColor: "#F0F8FF",
      intensity: 0.1,
    },
  },

  // ========================================
  // TEXTURES - FABRIC (10)
  // ========================================
  {
    id: "texture-canvas",
    name: "Canvas",
    category: "textures",
    type: "texture",
    preview: "🖼️",
    data: {
      type: "noise",
      baseColor: "#FAF0E6",
      intensity: 0.25,
    },
  },
  {
    id: "texture-linen",
    name: "Linen",
    category: "textures",
    type: "texture",
    preview: "🧵",
    data: {
      type: "noise",
      baseColor: "#FAF0E6",
      intensity: 0.22,
    },
  },
  {
    id: "texture-burlap",
    name: "Burlap",
    category: "textures",
    type: "texture",
    preview: "🎒",
    data: {
      type: "noise",
      baseColor: "#DEB887",
      intensity: 0.45,
    },
  },
  {
    id: "texture-denim",
    name: "Denim",
    category: "textures",
    type: "texture",
    preview: "👖",
    data: {
      type: "noise",
      baseColor: "#4682B4",
      intensity: 0.35,
    },
  },
  {
    id: "texture-cotton",
    name: "Cotton",
    category: "textures",
    type: "texture",
    preview: "☁️",
    data: {
      type: "noise",
      baseColor: "#FFFFF0",
      intensity: 0.15,
    },
  },
  {
    id: "texture-felt",
    name: "Felt",
    category: "textures",
    type: "texture",
    preview: "🧸",
    data: {
      type: "noise",
      baseColor: "#8B4513",
      intensity: 0.3,
    },
  },
  {
    id: "texture-velvet",
    name: "Velvet",
    category: "textures",
    type: "texture",
    preview: "💎",
    data: {
      type: "noise",
      baseColor: "#6A0DAD",
      intensity: 0.2,
    },
  },
  {
    id: "texture-leather",
    name: "Leather",
    category: "textures",
    type: "texture",
    preview: "👜",
    data: {
      type: "noise",
      baseColor: "#8B4513",
      intensity: 0.4,
    },
  },
  {
    id: "texture-silk",
    name: "Silk",
    category: "textures",
    type: "texture",
    preview: "✨",
    data: {
      type: "noise",
      baseColor: "#FFF8DC",
      intensity: 0.12,
    },
  },
  {
    id: "texture-satin",
    name: "Satin",
    category: "textures",
    type: "texture",
    preview: "💫",
    data: {
      type: "noise",
      baseColor: "#FFE4E1",
      intensity: 0.15,
    },
  },

  // ========================================
  // TEXTURES - STONE (10)
  // ========================================
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
    id: "texture-marble-white",
    name: "White Marble",
    category: "textures",
    type: "texture",
    preview: "⚪",
    data: {
      type: "noise",
      baseColor: "#F8F8FF",
      intensity: 0.25,
    },
  },
  {
    id: "texture-marble-black",
    name: "Black Marble",
    category: "textures",
    type: "texture",
    preview: "⬛",
    data: {
      type: "noise",
      baseColor: "#2F4F4F",
      intensity: 0.3,
    },
  },
  {
    id: "texture-granite",
    name: "Granite",
    category: "textures",
    type: "texture",
    preview: "🗿",
    data: {
      type: "noise",
      baseColor: "#696969",
      intensity: 0.45,
    },
  },
  {
    id: "texture-sandstone",
    name: "Sandstone",
    category: "textures",
    type: "texture",
    preview: "🏜️",
    data: {
      type: "noise",
      baseColor: "#F4A460",
      intensity: 0.35,
    },
  },
  {
    id: "texture-slate",
    name: "Slate",
    category: "textures",
    type: "texture",
    preview: "🪨",
    data: {
      type: "noise",
      baseColor: "#708090",
      intensity: 0.4,
    },
  },
  {
    id: "texture-wood-light",
    name: "Light Wood",
    category: "textures",
    type: "texture",
    preview: "🪵",
    data: {
      type: "noise",
      baseColor: "#DEB887",
      intensity: 0.3,
    },
  },
  {
    id: "texture-wood-dark",
    name: "Dark Wood",
    category: "textures",
    type: "texture",
    preview: "🌳",
    data: {
      type: "noise",
      baseColor: "#654321",
      intensity: 0.35,
    },
  },
  {
    id: "texture-cork",
    name: "Cork",
    category: "textures",
    type: "texture",
    preview: "🍾",
    data: {
      type: "noise",
      baseColor: "#C19A6B",
      intensity: 0.5,
    },
  },
  {
    id: "texture-bamboo",
    name: "Bamboo",
    category: "textures",
    type: "texture",
    preview: "🎋",
    data: {
      type: "noise",
      baseColor: "#E3DAC9",
      intensity: 0.25,
    },
  },

  // ========================================
  // TEXTURES - MODERN (8)
  // ========================================
  {
    id: "texture-brushed-metal",
    name: "Brushed Metal",
    category: "textures",
    type: "texture",
    preview: "⚙️",
    data: {
      type: "noise",
      baseColor: "#C0C0C0",
      intensity: 0.2,
    },
  },
  {
    id: "texture-carbon-fiber",
    name: "Carbon Fiber",
    category: "textures",
    type: "texture",
    preview: "🏎️",
    data: {
      type: "noise",
      baseColor: "#1C1C1C",
      intensity: 0.35,
    },
  },
  {
    id: "texture-frosted-glass",
    name: "Frosted Glass",
    category: "textures",
    type: "texture",
    preview: "🔲",
    data: {
      type: "noise",
      baseColor: "#F0F8FF",
      intensity: 0.1,
    },
  },
  {
    id: "texture-chrome",
    name: "Chrome",
    category: "textures",
    type: "texture",
    preview: "🔘",
    data: {
      type: "noise",
      baseColor: "#E8E8E8",
      intensity: 0.15,
    },
  },
  {
    id: "texture-copper",
    name: "Copper",
    category: "textures",
    type: "texture",
    preview: "🟠",
    data: {
      type: "noise",
      baseColor: "#B87333",
      intensity: 0.25,
    },
  },
  {
    id: "texture-gold",
    name: "Gold Leaf",
    category: "textures",
    type: "texture",
    preview: "🥇",
    data: {
      type: "noise",
      baseColor: "#FFD700",
      intensity: 0.2,
    },
  },
  {
    id: "texture-silver",
    name: "Silver",
    category: "textures",
    type: "texture",
    preview: "🥈",
    data: {
      type: "noise",
      baseColor: "#C0C0C0",
      intensity: 0.18,
    },
  },
  {
    id: "texture-bronze",
    name: "Bronze",
    category: "textures",
    type: "texture",
    preview: "🥉",
    data: {
      type: "noise",
      baseColor: "#CD7F32",
      intensity: 0.22,
    },
  },

  // ========================================
  // SEASONAL (5)
  // ========================================
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
  { id: "solids", name: "Solids", icon: "⬜" },
  { id: "textures", name: "Textures", icon: "📐" },
  { id: "scenes", name: "Scenes", icon: "🏞️" },
  { id: "library", name: "My Images", icon: "📁" },
  { id: "seasonal", name: "Seasonal", icon: "🍂" },
];

export function BackgroundLibraryControls({
  isProcessing,
  currentImageUrl,
  onApplyBackground,
  libraryImages = [],
}: BackgroundLibraryControlsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    null
  );
  const [customColor, setCustomColor] = useState("#FFFFFF");
  const [textureIntensity, setTextureIntensity] = useState(0.2);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [imageBlur, setImageBlur] = useState(5);
  const [useCustomColor, setUseCustomColor] = useState(false);

  // Combine all backgrounds
  const allBackgrounds = [...BACKGROUNDS, ...STOCK_SCENES];

  const filteredBackgrounds =
    selectedCategory === "all"
      ? allBackgrounds
      : selectedCategory === "library"
      ? []
      : allBackgrounds.filter((bg) => bg.category === selectedCategory);

  const selectedBg = allBackgrounds.find((bg) => bg.id === selectedBackground);

  const handleApply = () => {
    if (!selectedBg && !useCustomColor) {
      return;
    }

    let backgroundData;

    if (useCustomColor) {
      backgroundData = {
        type: "solid",
        data: { color: customColor },
        currentImageUrl: currentImageUrl
          ? getProxiedImageUrl(currentImageUrl)
          : null,
      };
    } else if (selectedBg) {
      backgroundData = {
        type: selectedBg.type,
        data: {
          ...selectedBg.data,
          // Apply customizations
          ...(selectedBg.type === "texture" && { intensity: textureIntensity }),
          ...(selectedBg.type === "gradient" &&
            selectedBg.data.type === "linear" && { angle: gradientAngle }),
          ...(selectedBg.type === "image" && { blur: imageBlur }),
        },
        currentImageUrl: currentImageUrl
          ? getProxiedImageUrl(currentImageUrl)
          : null,
      };
    }

    if (backgroundData) {
      onApplyBackground(backgroundData);
    }
  };

  const handleLibraryImageSelect = (imageUrl: string) => {
    onApplyBackground({
      type: "image",
      data: {
        imageUrl: getProxiedImageUrl(imageUrl),
        blur: imageBlur,
      },
      currentImageUrl: currentImageUrl
        ? getProxiedImageUrl(currentImageUrl)
        : null,
    });
  };

  // Get category counts
  const getCategoryCount = (catId: string) => {
    if (catId === "all") return allBackgrounds.length + libraryImages.length;
    if (catId === "library") return libraryImages.length;
    return allBackgrounds.filter((bg) => bg.category === catId).length;
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="font-semibold text-sm text-blue-900 mb-1">
          🎨 100+ Professional Backgrounds!
        </h5>
        <p className="text-xs text-blue-800">
          Gradients, textures, scenic images + your Content Library!
        </p>
      </div>

      {/* Category Tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Background Type
        </h3>
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
              {cat.icon} {cat.name} ({getCategoryCount(cat.id)})
            </button>
          ))}
        </div>
      </div>

      {/* Background Library Grid or My Images */}
      {selectedCategory === "library" ? (
        // Show Library Images
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Your Images
          </h3>
          <div className="max-h-80 overflow-y-auto">
            {libraryImages.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                <p className="mb-2">No images in your library yet</p>
                <p className="text-sm">Generate some images first!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {libraryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleLibraryImageSelect(img.url)}
                    className="aspect-video rounded overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition"
                    title={img.prompt || "Library Image"}
                  >
                    <img
                      src={getProxiedImageUrl(img.url)}
                      alt={img.prompt || "Background"}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blur control for library images */}
          {libraryImages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Background Blur: {imageBlur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={imageBlur}
                onChange={(e) => setImageBlur(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Add blur to keep focus on your product
              </p>
            </div>
          )}
        </div>
      ) : (
        // Show Background Grid
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Choose Background
          </h3>
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
                        background: `linear-gradient(${
                          bg.data.angle
                        }deg, ${bg.data.colors.join(", ")})`,
                      }
                    : bg.type === "gradient" && bg.data.type === "radial"
                    ? {
                        background: `radial-gradient(circle, ${bg.data.colors.join(
                          ", "
                        )})`,
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
      )}

      {/* Custom Color Option */}
      {selectedCategory !== "library" && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Custom Color
          </h3>
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
      )}

      {/* Customization Options */}
      {selectedBg && !useCustomColor && selectedCategory !== "library" && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Customize
          </h3>

          {/* Gradient Angle */}
          {selectedBg.type === "gradient" &&
            selectedBg.data.type === "linear" && (
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

          {/* Image Blur */}
          {selectedBg.type === "image" && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Background Blur: {imageBlur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={imageBlur}
                onChange={(e) => setImageBlur(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Blur keeps focus on your product
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview Info */}
      {(selectedBg || useCustomColor) && selectedCategory !== "library" && (
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
              : selectedBg?.type === "image"
              ? "Scenic background image - adjustable blur"
              : "Textured background with subtle detail"}
          </p>
        </div>
      )}

      {/* Apply Button */}
      {selectedCategory !== "library" && (
        <div className="flex gap-2 pt-2 sticky bottom-0 bg-white border-t border-gray-200 py-3">
          <button
            onClick={handleApply}
            disabled={
              isProcessing ||
              (!selectedBackground && !useCustomColor) ||
              !currentImageUrl
            }
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {isProcessing ? "Applying..." : "Apply Background"}
          </button>
        </div>
      )}

      {/* Usage Tips */}
      <div className="p-3 bg-gray-50 rounded text-xs text-gray-700">
        <p className="font-semibold mb-1">💡 Background Tips:</p>
        <ul className="space-y-1">
          <li>• Works best with transparent PNG images</li>
          <li>
            • <strong>Scenes:</strong> Perfect for adding context (5-10px blur
            recommended)
          </li>
          <li>
            • <strong>Library:</strong> Reuse your own generated images as
            backgrounds
          </li>
          <li>
            • <strong>Textures:</strong> Great for product photography
          </li>
          <li>
            • <strong>Gradients:</strong> Modern, eye-catching designs
          </li>
        </ul>
      </div>
    </div>
  );
}
