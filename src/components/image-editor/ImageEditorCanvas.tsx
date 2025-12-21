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
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showMask, setShowMask] = useState(true);

  const needsMask = ["inpaint", "erase"].includes(selectedEditTool);

  // Load image onto canvas
  useEffect(() => {
    if (!originalImage || !canvasRef.current || !maskCanvasRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");

    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      maskCtx.fillStyle = "black";
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      setImageLoaded(true);
    };

    img.src = originalImage;
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

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
    <div className="bg-white rounded-lg shadow-lg p-4">
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

      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded"
          style={{ maxWidth: "100%", height: "auto" }}
        />

        {needsMask && (
          <canvas
            ref={maskCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="absolute top-0 left-0 border border-gray-300 rounded cursor-crosshair"
            style={{
              maxWidth: "100%",
              height: "auto",
              opacity: showMask ? 0.5 : 0,
              pointerEvents: isProcessing ? "none" : "auto",
            }}
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
            <div className="bg-white p-4 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-700">
                Processing with AI...
              </p>
            </div>
          </div>
        )}
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
