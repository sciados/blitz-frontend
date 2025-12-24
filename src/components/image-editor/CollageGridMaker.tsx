"use client";

import { useState, useRef, useEffect } from "react";
import { X, Download, Grid3x3, LayoutGrid, Square, Rows, Columns } from "lucide-react";

interface CollageGridMakerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
}

interface LayoutTemplate {
  id: string;
  name: string;
  icon: any;
  description: string;
  minImages: number;
  maxImages: number;
  layout: (count: number) => GridLayout;
}

interface GridLayout {
  rows: number;
  cols: number;
  cells: CellConfig[];
}

interface CellConfig {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

const layoutTemplates: LayoutTemplate[] = [
  {
    id: "grid-2x2",
    name: "Grid 2×2",
    icon: Grid3x3,
    description: "Classic 2×2 grid",
    minImages: 4,
    maxImages: 4,
    layout: () => ({
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      ],
    }),
  },
  {
    id: "grid-3x3",
    name: "Grid 3×3",
    icon: LayoutGrid,
    description: "Instagram grid layout",
    minImages: 9,
    maxImages: 9,
    layout: () => ({
      rows: 3,
      cols: 3,
      cells: Array.from({ length: 9 }, (_, i) => ({
        row: Math.floor(i / 3),
        col: i % 3,
        rowSpan: 1,
        colSpan: 1,
      })),
    }),
  },
  {
    id: "featured-left",
    name: "Featured Left",
    icon: Columns,
    description: "Large image on left, 2 on right",
    minImages: 3,
    maxImages: 3,
    layout: () => ({
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, rowSpan: 2, colSpan: 1 }, // Large left
        { row: 0, col: 1, rowSpan: 1, colSpan: 1 }, // Top right
        { row: 1, col: 1, rowSpan: 1, colSpan: 1 }, // Bottom right
      ],
    }),
  },
  {
    id: "featured-top",
    name: "Featured Top",
    icon: Rows,
    description: "Large image on top, 2 below",
    minImages: 3,
    maxImages: 3,
    layout: () => ({
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, rowSpan: 1, colSpan: 2 }, // Large top
        { row: 1, col: 0, rowSpan: 1, colSpan: 1 }, // Bottom left
        { row: 1, col: 1, rowSpan: 1, colSpan: 1 }, // Bottom right
      ],
    }),
  },
  {
    id: "horizontal-2",
    name: "Horizontal 2",
    icon: Rows,
    description: "2 images side by side",
    minImages: 2,
    maxImages: 2,
    layout: () => ({
      rows: 1,
      cols: 2,
      cells: [
        { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      ],
    }),
  },
  {
    id: "vertical-2",
    name: "Vertical 2",
    icon: Columns,
    description: "2 images stacked",
    minImages: 2,
    maxImages: 2,
    layout: () => ({
      rows: 2,
      cols: 1,
      cells: [
        { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
        { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      ],
    }),
  },
  {
    id: "grid-4x4",
    name: "Grid 4×4",
    icon: LayoutGrid,
    description: "16 image grid",
    minImages: 16,
    maxImages: 16,
    layout: () => ({
      rows: 4,
      cols: 4,
      cells: Array.from({ length: 16 }, (_, i) => ({
        row: Math.floor(i / 4),
        col: i % 4,
        rowSpan: 1,
        colSpan: 1,
      })),
    }),
  },
  {
    id: "pinterest",
    name: "Pinterest Style",
    icon: LayoutGrid,
    description: "Mixed sizes, 5 images",
    minImages: 5,
    maxImages: 5,
    layout: () => ({
      rows: 3,
      cols: 3,
      cells: [
        { row: 0, col: 0, rowSpan: 2, colSpan: 2 }, // Large top-left
        { row: 0, col: 2, rowSpan: 1, colSpan: 1 }, // Small top-right
        { row: 1, col: 2, rowSpan: 1, colSpan: 1 }, // Small mid-right
        { row: 2, col: 0, rowSpan: 1, colSpan: 1 }, // Small bottom-left
        { row: 2, col: 1, rowSpan: 1, colSpan: 2 }, // Wide bottom-right
      ],
    }),
  },
];

export function CollageGridMaker({
  isOpen,
  onClose,
  imageUrls,
}: CollageGridMakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutTemplate | null>(null);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 1200 });
  const [spacing, setSpacing] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [cornerRadius, setCornerRadius] = useState(0);

  // Filter layouts based on number of images
  const availableLayouts = layoutTemplates.filter(
    (layout) =>
      imageUrls.length >= layout.minImages && imageUrls.length <= layout.maxImages
  );

  // Load images
  useEffect(() => {
    if (!imageUrls.length) return;

    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    imageUrls.forEach((url, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        images[index] = img;
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setLoadedImages(images);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setLoadedImages(images.filter((i) => i));
        }
      };
      img.src = url;
    });
  }, [imageUrls]);

  // Auto-select first available layout
  useEffect(() => {
    if (availableLayouts.length > 0 && !selectedLayout) {
      setSelectedLayout(availableLayouts[0]);
    }
  }, [availableLayouts, selectedLayout]);

  // Draw collage
  useEffect(() => {
    if (!selectedLayout || !loadedImages.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const layout = selectedLayout.layout(imageUrls.length);
    const cellWidth = (canvas.width - spacing * (layout.cols + 1)) / layout.cols;
    const cellHeight = (canvas.height - spacing * (layout.rows + 1)) / layout.rows;

    layout.cells.forEach((cell, index) => {
      if (!loadedImages[index]) return;

      const x = spacing + cell.col * (cellWidth + spacing);
      const y = spacing + cell.row * (cellHeight + spacing);
      const width = cellWidth * cell.colSpan + spacing * (cell.colSpan - 1);
      const height = cellHeight * cell.rowSpan + spacing * (cell.rowSpan - 1);

      // Save context for clipping
      ctx.save();

      // Create rounded rectangle clip path if needed
      if (cornerRadius > 0) {
        const radius = Math.min(cornerRadius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
      }

      // Draw image (cover mode - fill the space)
      const img = loadedImages[index];
      const imgAspect = img.width / img.height;
      const cellAspect = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > cellAspect) {
        // Image is wider - fit to height
        drawHeight = height;
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit to width
        drawWidth = width;
        drawHeight = width / imgAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);

      ctx.restore();
    });
  }, [selectedLayout, loadedImages, canvasSize, spacing, backgroundColor, cornerRadius, imageUrls.length]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `collage_${selectedLayout?.id}_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Collage & Grid Maker
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Combine {imageUrls.length} images into a beautiful layout
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Layout Selection & Settings */}
            <div className="lg:col-span-1 space-y-6">
              {/* Layouts */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Choose Layout
                </h3>
                {availableLayouts.length > 0 ? (
                  <div className="space-y-2">
                    {availableLayouts.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setSelectedLayout(layout)}
                        className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                          selectedLayout?.id === layout.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <layout.icon size={20} className="text-gray-600" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {layout.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {layout.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No layouts available for {imageUrls.length} images. Try selecting
                      2, 3, 4, 5, 9, or 16 images.
                    </p>
                  </div>
                )}
              </div>

              {/* Settings */}
              {selectedLayout && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-900">Settings</h4>

                  {/* Canvas Size */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Canvas Size
                    </label>
                    <select
                      value={`${canvasSize.width}x${canvasSize.height}`}
                      onChange={(e) => {
                        const [w, h] = e.target.value.split("x").map(Number);
                        setCanvasSize({ width: w, height: h });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="800x800">Square 800×800</option>
                      <option value="1200x1200">Square 1200×1200</option>
                      <option value="1080x1080">Instagram 1080×1080</option>
                      <option value="1200x630">Facebook 1200×630</option>
                      <option value="1024x512">Twitter 1024×512</option>
                      <option value="1920x1080">HD 1920×1080</option>
                    </select>
                  </div>

                  {/* Spacing */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Spacing</span>
                      <span className="text-gray-600">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={spacing}
                      onChange={(e) => setSpacing(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Corner Radius</span>
                      <span className="text-gray-600">{cornerRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
              {selectedLayout ? (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <LayoutGrid size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">
                    Select a layout to see your collage preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedLayout ? (
              <>
                <span className="font-semibold text-gray-900">
                  {selectedLayout.name}
                </span>{" "}
                • {canvasSize.width}×{canvasSize.height}px
              </>
            ) : (
              "Select a layout to continue"
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={!selectedLayout}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 font-medium"
            >
              <Download size={20} />
              Download Collage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
