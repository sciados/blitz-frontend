"use client";

import { useRef, useEffect, useState } from "react";

interface SmartResizeProps {
  originalImage: string | null;
  onSave: (resizedImageDataUrl: string, preset: string) => void;
  isProcessing: boolean;
}

interface ResizePreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  description: string;
  icon: string;
}

type CropMode = "cover" | "contain" | "fill";
type FocusPoint = "center" | "top" | "bottom" | "left" | "right";

const PRESETS: ResizePreset[] = [
  // Instagram
  {
    id: "ig-square",
    name: "Square Post",
    platform: "Instagram",
    width: 1080,
    height: 1080,
    description: "1:1 ratio",
    icon: "📷",
  },
  {
    id: "ig-portrait",
    name: "Portrait Post",
    platform: "Instagram",
    width: 1080,
    height: 1350,
    description: "4:5 ratio",
    icon: "📱",
  },
  {
    id: "ig-landscape",
    name: "Landscape Post",
    platform: "Instagram",
    width: 1080,
    height: 566,
    description: "1.91:1 ratio",
    icon: "🖼️",
  },
  {
    id: "ig-story",
    name: "Story/Reels",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    description: "9:16 ratio",
    icon: "📲",
  },

  // Facebook
  {
    id: "fb-post",
    name: "Post Image",
    platform: "Facebook",
    width: 1200,
    height: 630,
    description: "Link preview",
    icon: "👍",
  },
  {
    id: "fb-cover",
    name: "Cover Photo",
    platform: "Facebook",
    width: 820,
    height: 312,
    description: "Profile cover",
    icon: "🎨",
  },
  {
    id: "fb-story",
    name: "Story",
    platform: "Facebook",
    width: 1080,
    height: 1920,
    description: "9:16 ratio",
    icon: "📖",
  },

  // Twitter/X
  {
    id: "tw-post",
    name: "Post Image",
    platform: "Twitter",
    width: 1200,
    height: 675,
    description: "16:9 ratio",
    icon: "🐦",
  },
  {
    id: "tw-header",
    name: "Header Photo",
    platform: "Twitter",
    width: 1500,
    height: 500,
    description: "3:1 ratio",
    icon: "🎭",
  },

  // Pinterest
  {
    id: "pin-standard",
    name: "Standard Pin",
    platform: "Pinterest",
    width: 1000,
    height: 1500,
    description: "2:3 ratio",
    icon: "📌",
  },
  {
    id: "pin-long",
    name: "Long Pin",
    platform: "Pinterest",
    width: 1000,
    height: 2100,
    description: "Tall format",
    icon: "📍",
  },

  // LinkedIn
  {
    id: "li-post",
    name: "Post Image",
    platform: "LinkedIn",
    width: 1200,
    height: 627,
    description: "Link preview",
    icon: "💼",
  },
  {
    id: "li-banner",
    name: "Banner",
    platform: "LinkedIn",
    width: 1584,
    height: 396,
    description: "Profile banner",
    icon: "🏢",
  },

  // YouTube
  {
    id: "yt-thumbnail",
    name: "Thumbnail",
    platform: "YouTube",
    width: 1280,
    height: 720,
    description: "16:9 HD",
    icon: "▶️",
  },
  {
    id: "yt-banner",
    name: "Channel Banner",
    platform: "YouTube",
    width: 2560,
    height: 1440,
    description: "Wide banner",
    icon: "🎬",
  },

  // TikTok
  {
    id: "tt-video",
    name: "Video Cover",
    platform: "TikTok",
    width: 1080,
    height: 1920,
    description: "9:16 ratio",
    icon: "🎵",
  },

  // E-commerce
  {
    id: "ecom-square",
    name: "Product Square",
    platform: "E-commerce",
    width: 2000,
    height: 2000,
    description: "High-res square",
    icon: "🛍️",
  },
  {
    id: "ecom-zoom",
    name: "Product Detail",
    platform: "E-commerce",
    width: 2500,
    height: 2500,
    description: "Zoom detail",
    icon: "🔍",
  },
];

export function SmartResize({
  originalImage,
  onSave,
  isProcessing,
}: SmartResizeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<ResizePreset | null>(
    null
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropMode, setCropMode] = useState<CropMode>("cover");
  const [focusPoint, setFocusPoint] = useState<FocusPoint>("center");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">(
    "png"
  );
  const [jpegQuality, setJpegQuality] = useState(90);
  const [filterPlatform, setFilterPlatform] = useState<string>("All");
  const [originalImageData, setOriginalImageData] =
    useState<HTMLImageElement | null>(null);

  // Get unique platforms for filter
  const platforms = [
    "All",
    ...Array.from(new Set(PRESETS.map((p) => p.platform))),
  ];

  // Filter presets by platform
  const filteredPresets =
    filterPlatform === "All"
      ? PRESETS
      : PRESETS.filter((p) => p.platform === filterPlatform);

  // Load original image
  useEffect(() => {
    if (!originalImage) return;

    const img = new Image();
    // Use proxy endpoint to bypass CORS - need to use full URL with API base
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://blitzed.up.railway.app";
    const proxyUrl = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(
      originalImage
    )}`;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      setOriginalImageData(img);
      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load image");
      setImageLoaded(false);
    };

    img.src = proxyUrl;
  }, [originalImage]);

  // Redraw when settings change
  useEffect(() => {
    if (selectedPreset && originalImageData && imageLoaded) {
      drawResizedImage();
    }
  }, [selectedPreset, cropMode, focusPoint, originalImageData, imageLoaded]);

  const drawResizedImage = () => {
    if (!canvasRef.current || !originalImageData || !selectedPreset) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to preset dimensions
    canvas.width = selectedPreset.width;
    canvas.height = selectedPreset.height;

    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgWidth = originalImageData.width;
    const imgHeight = originalImageData.height;
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = imgWidth / imgHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (cropMode === "cover") {
      // Cover - fill entire canvas, crop if needed
      if (imgRatio > canvasRatio) {
        // Image is wider
        drawHeight = canvas.height;
        drawWidth = imgWidth * (canvas.height / imgHeight);
      } else {
        // Image is taller
        drawWidth = canvas.width;
        drawHeight = imgHeight * (canvas.width / imgWidth);
      }

      // Calculate offset based on focus point
      switch (focusPoint) {
        case "center":
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = (canvas.height - drawHeight) / 2;
          break;
        case "top":
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
          break;
        case "bottom":
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = canvas.height - drawHeight;
          break;
        case "left":
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
          break;
        case "right":
          offsetX = canvas.width - drawWidth;
          offsetY = (canvas.height - drawHeight) / 2;
          break;
      }
    } else if (cropMode === "contain") {
      // Contain - fit entire image, add padding if needed
      if (imgRatio > canvasRatio) {
        drawWidth = canvas.width;
        drawHeight = imgHeight * (canvas.width / imgWidth);
      } else {
        drawHeight = canvas.height;
        drawWidth = imgWidth * (canvas.height / imgHeight);
      }

      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      // Fill - stretch to exact dimensions
      drawWidth = canvas.width;
      drawHeight = canvas.height;
      offsetX = 0;
      offsetY = 0;
    }

    // Draw image
    ctx.drawImage(originalImageData, offsetX, offsetY, drawWidth, drawHeight);
  };

  const handlePresetSelect = (preset: ResizePreset) => {
    setSelectedPreset(preset);
  };

  const handleSave = () => {
    if (!canvasRef.current || !selectedPreset) return;

    let dataUrl: string;

    if (outputFormat === "jpeg") {
      dataUrl = canvasRef.current.toDataURL("image/jpeg", jpegQuality / 100);
    } else if (outputFormat === "webp") {
      dataUrl = canvasRef.current.toDataURL("image/webp", jpegQuality / 100);
    } else {
      dataUrl = canvasRef.current.toDataURL("image/png");
    }

    onSave(dataUrl, `${selectedPreset.platform}-${selectedPreset.name}`);
  };

  const handleDownload = () => {
    if (!canvasRef.current || !selectedPreset) return;

    let dataUrl: string;
    let extension: string;

    if (outputFormat === "jpeg") {
      dataUrl = canvasRef.current.toDataURL("image/jpeg", jpegQuality / 100);
      extension = "jpg";
    } else if (outputFormat === "webp") {
      dataUrl = canvasRef.current.toDataURL("image/webp", jpegQuality / 100);
      extension = "webp";
    } else {
      dataUrl = canvasRef.current.toDataURL("image/png");
      extension = "png";
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${selectedPreset.id}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!originalImage) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">No image loaded</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 w-full">
      {/* Preset Selection Panel */}
      <div className="w-80 bg-white rounded-lg shadow-lg p-4 overflow-auto max-h-[700px]">
        <h3 className="font-semibold text-gray-900 mb-4">Platform Presets</h3>

        {/* Platform Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Filter by Platform
          </label>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Presets List */}
        <div className="space-y-2">
          {filteredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`w-full text-left px-3 py-3 rounded border-2 transition-all ${
                selectedPreset?.id === preset.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="font-semibold text-sm">{preset.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">{preset.platform}</div>
                  <div className="text-xs text-gray-500">
                    {preset.width} × {preset.height}
                  </div>
                  <div className="text-xs text-gray-400">
                    {preset.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas and Controls */}
      <div className="flex-1 bg-white rounded-lg shadow-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {selectedPreset
              ? `${selectedPreset.platform} - ${selectedPreset.name}`
              : "Select a preset"}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!selectedPreset || isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              💾 Download
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedPreset || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ✓ Save This Size
            </button>
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="mb-4 flex justify-center border border-gray-300 rounded p-4 bg-gray-50">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[500px] shadow-lg"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Controls */}
        {selectedPreset && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Crop Mode */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Crop Mode
              </label>
              <select
                value={cropMode}
                onChange={(e) => setCropMode(e.target.value as CropMode)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="cover">Cover (Fill, Crop Excess)</option>
                <option value="contain">Contain (Fit, Show All)</option>
                <option value="fill">Fill (Stretch)</option>
              </select>
            </div>

            {/* Focus Point */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Focus Point
              </label>
              <select
                value={focusPoint}
                onChange={(e) => setFocusPoint(e.target.value as FocusPoint)}
                disabled={cropMode !== "cover"}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="png">PNG (Best Quality)</option>
                <option value="jpeg">JPEG (Smaller Size)</option>
                <option value="webp">WebP (Modern)</option>
              </select>
            </div>

            {/* Quality (for JPEG/WebP) */}
            {(outputFormat === "jpeg" || outputFormat === "webp") && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quality: {jpegQuality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={jpegQuality}
                  onChange={(e) => setJpegQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded text-sm">
          <p className="font-semibold text-blue-900 mb-2">💡 Quick Guide:</p>
          <ul className="text-blue-800 space-y-1 text-xs">
            <li>
              • <strong>Cover:</strong> Fills entire canvas, may crop image
            </li>
            <li>
              • <strong>Contain:</strong> Fits entire image, may add padding
            </li>
            <li>
              • <strong>Fill:</strong> Stretches to exact size (may distort)
            </li>
            <li>
              • <strong>Focus Point:</strong> Choose where to center when
              cropping
            </li>
            <li>
              • <strong>PNG:</strong> Best for graphics with transparency
            </li>
            <li>
              • <strong>JPEG:</strong> Best for photos, smaller file size
            </li>
            <li>
              • <strong>WebP:</strong> Modern format, smaller than JPEG
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
