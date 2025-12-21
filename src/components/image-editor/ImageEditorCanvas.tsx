"use client";

import { useRef, useEffect, useState } from "react";
import { EditTool } from "src/app/image-editor/page";

interface ImageEditorCanvasProps {
  originalImage: string | null;
  editedImage: string | null;
  selectedEditTool: EditTool;
  selectedDrawTool: "brush" | "eraser";
  brushSize: number;
  onEdit: (maskDataUrl?: string) => void;
  isProcessing: boolean;
}

export function ImageEditorCanvas({
  originalImage,
  editedImage,
  selectedEditTool,
  selectedDrawTool,
  brushSize,
  onEdit,
  isProcessing,
}: ImageEditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMask, setShowMask] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displayScale, setDisplayScale] = useState(1);

  console.log("🎨 ImageEditorCanvas RENDERED - originalImage:", originalImage);

  const needsMask = ["inpaint", "erase"].includes(selectedEditTool);

  // Load image onto canvas
  useEffect(() => {
    console.log("🎨 useEffect TRIGGERED! originalImage:", originalImage);
    if (!originalImage || !canvasRef.current || !maskCanvasRef.current) {
      console.log("🎨 useEffect ABORTED - missing requirements:", {
        hasImage: !!originalImage,
        hasCanvas: !!canvasRef.current,
        hasMaskCanvas: !!maskCanvasRef.current
      });
      return;
    }

    console.log("🎨 Starting to load image into canvas:", originalImage);

    const img = new Image();
    // Use proxy endpoint to bypass CORS - need to use full URL with API base
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    const proxyUrl = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(originalImage)}`;
    console.log("Using proxy URL:", proxyUrl);
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log("Image loaded successfully! Dimensions:", img.width, "x", img.height);

      // Get canvas references
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      if (!canvas || !maskCanvas) {
        console.error("Canvas refs not available!");
        return;
      }

      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      if (!ctx || !maskCtx) {
        console.error("Failed to get canvas contexts!");
        return;
      }

      // Use a default size if container isn't measured yet
      let containerWidth = 800;
      let containerHeight = 600;

      if (containerRef.current) {
        containerWidth = containerRef.current.clientWidth - 32; // Account for padding
        containerHeight = containerRef.current.clientHeight - 100; // Account for header space
      }

      console.log("Container dimensions:", containerWidth, "x", containerHeight);

      // Calculate scale to fit image in container while maintaining aspect ratio
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;

      console.log("Display dimensions:", displayWidth, "x", displayHeight, "Scale:", scale);

      // Set canvas size to display size (not original size)
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      maskCanvas.width = displayWidth;
      maskCanvas.height = displayHeight;

      setDisplayScale(scale);
      setImageSize({ width: img.width, height: img.height });

      // Draw image scaled to fit canvas
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // Initialize mask as all black (no mask)
      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      console.log("Canvas setup complete! Canvas size:", canvas.width, "x", canvas.height);
      setImageLoaded(true);
    };

    img.onerror = (error) => {
      console.error("Failed to load image via proxy:", originalImage, error);
      setImageLoaded(false);
    };

    img.src = proxyUrl;
  }, [originalImage]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!maskCanvasRef.current || isProcessing || !needsMask) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== "mousedown") return;
    if (!maskCanvasRef.current || isProcessing || !needsMask) return;

    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Brush size is in display pixels, so use directly
    ctx.globalCompositeOperation =
      selectedDrawTool === "brush" ? "source-over" : "destination-out";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(
      0,
      0,
      maskCanvasRef.current.width,
      maskCanvasRef.current.height
    );
  };

  const handleGenerate = () => {
    if (needsMask && maskCanvasRef.current) {
      const maskDataUrl = maskCanvasRef.current.toDataURL("image/png");
      onEdit(maskDataUrl);
    } else {
      onEdit();
    }
  };

  const handleToggleMask = () => {
    setShowMask(!showMask);
  };

  if (!originalImage) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">No image loaded</p>
      </div>
    );
  }

  const getToolDescription = () => {
    switch (selectedEditTool) {
      case "inpaint":
        return "Paint over areas you want to modify, then enter a prompt";
      case "erase":
        return "Paint over objects you want to remove";
      case "background-remove":
        return "Click Generate to automatically remove the background";
      case "search-replace":
        return "Enter what to search for and what to replace it with";
      case "outpaint":
        return "Set the extension amounts and describe what to generate";
      case "upscale":
        return "Describe the image to enhance it during upscaling";
      case "sketch-to-image":
        return "Describe what your sketch represents";
      default:
        return "";
    }
  };

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">
            {selectedEditTool.replace("-", " ").toUpperCase()}
          </h3>
          <div className="flex gap-2">
            {needsMask && (
              <>
                <button
                  onClick={clearMask}
                  disabled={isProcessing}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Clear Mask
                </button>
                <button
                  onClick={handleToggleMask}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  {showMask ? "Hide Mask" : "Show Mask"}
                </button>
              </>
            )}
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !imageLoaded}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isProcessing ? "Processing..." : "Generate"}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">{getToolDescription()}</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="shadow-lg rounded"
          />

          {needsMask && (
            <canvas
              ref={maskCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="absolute top-0 left-0 cursor-crosshair"
              style={{
                opacity: showMask ? 0.5 : 0,
                pointerEvents: isProcessing ? "none" : "auto",
              }}
            />
          )}

          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading image...</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-700 font-medium">
                  Processing with AI...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  This may take 10-30 seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {editedImage && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-800 font-semibold">
            ✓ Image edited successfully!
          </p>
          <p className="text-sm text-green-700 mt-1">
            Operation: <span className="font-mono">{selectedEditTool}</span> -
            Check the preview panel to see the result.
          </p>
        </div>
      )}
    </div>
  );
}
