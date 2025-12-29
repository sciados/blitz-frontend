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
  onSaveOverlays?: (canvasDataUrl: string) => void;
  isProcessing: boolean;
}

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

export function ImageEditorCanvas({
  originalImage,
  editedImage,
  selectedEditTool,
  selectedDrawTool,
  brushSize,
  onEdit,
  onSaveOverlays,
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

  // Overlay state
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState("");

  const needsMask = ["inpaint", "erase"].includes(selectedEditTool);

  // Filter state
  const [filterSettings, setFilterSettings] = useState<{
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    tint: number;
    exposure: number;
    highlights: number;
    shadows: number;
    vignette: number;
  } | null>(null);

  // Apply filter to canvas
  const applyFilter = (settings: typeof filterSettings) => {
    setFilterSettings(settings);
  };

  // Crop methods
  const handleSetCropAspectRatio = (ratio: number | null) => {
    setCropAspectRatio(ratio);
    if (ratio && cropArea) {
      // Adjust crop area to maintain aspect ratio
      const centerX = cropArea.x + cropArea.width / 2;
      const centerY = cropArea.y + cropArea.height / 2;
      let newWidth = cropArea.width;
      let newHeight = cropArea.width / ratio;

      if (newHeight > cropArea.height) {
        newHeight = cropArea.height;
        newWidth = cropArea.height * ratio;
      }

      setCropArea({
        x: centerX - newWidth / 2,
        y: centerY - newHeight / 2,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const applyCrop = () => {
    if (!cropArea || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Create a new canvas with the cropped image
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return null;

    // Draw the cropped portion
    croppedCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to data URL
    return croppedCanvas.toDataURL("image/png");
  };

  const resetCrop = () => {
    setCropArea(null);
    setCropAspectRatio(null);
    setIsDraggingCrop(false);
    setIsResizingCrop(false);
    setCropHandle(null);
  };

  // Collage state
  const [collageSettings, setCollageSettings] = useState<any>(null);

  // Crop state
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizingCrop, setIsResizingCrop] = useState(false);
  const [cropHandle, setCropHandle] = useState<string | null>(null);

  // Helper to load image with CORS
  const loadImageWithCORS = (imgSrc: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = imgSrc;
    });
  };

  // Apply collage to canvas - renders preview immediately
  const applyCollage = async (settings: any) => {
    console.log("🎨 applyCollage called");
    setCollageSettings(settings);

    // Wait for canvas ref to be available (with retry)
    let attempts = 0;
    const maxAttempts = 50;
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    while (attempts < maxAttempts) {
      const canvas = canvasRef.current;
      if (canvas) {
        console.log("✅ Canvas found");
        break;
      }
      attempts++;
      if (attempts <= 3) {
        console.log(
          `⏳ Waiting for canvas... attempt ${attempts}/${maxAttempts}`
        );
      }
      await delay(50);
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("❌ Canvas ref not available");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("❌ Could not get 2D context");
      return;
    }

    const { layout, images, spacing, backgroundColor, canvasSize } = settings;

    // Calculate display scale to fit collage in container
    let containerWidth = 800;
    let containerHeight = 600;

    if (containerRef.current) {
      containerWidth = containerRef.current.clientWidth - 32; // Account for padding
      containerHeight = containerRef.current.clientHeight - 100; // Account for header space
    }

    // Calculate scale to fit collage in container while maintaining aspect ratio
    const scaleX = containerWidth / canvasSize.width;
    const scaleY = containerHeight / canvasSize.height;
    const displayScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

    const displayWidth = canvasSize.width * displayScale;
    const displayHeight = canvasSize.height * displayScale;

    // Set canvas to display size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setImageSize({ width: canvasSize.width, height: canvasSize.height });
    setDisplayScale(displayScale);

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate grid (use display dimensions for cells)
    const cols = layout.includes("3x3")
      ? 3
      : layout.includes("3x2")
      ? 3
      : layout.includes("2x2")
      ? 2
      : 2;
    const rows = layout.includes("3x3")
      ? 3
      : layout.includes("3x2")
      ? 2
      : layout.includes("2x2")
      ? 2
      : 1;

    const cellWidth = (displayWidth - (cols + 1) * spacing) / cols;
    const cellHeight = (displayHeight - (rows + 1) * spacing) / rows;

    // Load and draw images
    try {
      const loadedImages = await Promise.all(
        images
          .slice(0, cols * rows)
          .map((imgSrc: string) => loadImageWithCORS(imgSrc))
      );

      loadedImages.forEach((img: HTMLImageElement, index: number) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = spacing + col * (cellWidth + spacing);
        const y = spacing + row * (cellHeight + spacing);
        ctx.drawImage(img, x, y, cellWidth, cellHeight);
      });

      setImageLoaded(true);
      console.log("✅ Collage preview rendered");
    } catch (err) {
      console.error("❌ Failed to load collage images:", err);
    }
  };

  // Get collage canvas - creates the final collage (async to properly load images)
  const getCollageCanvas = async () => {
    if (!collageSettings) return null;

    const { layout, images, spacing, backgroundColor, canvasSize } =
      collageSettings;

    // Create temp canvas for collage
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasSize.width;
    tempCanvas.height = canvasSize.height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return null;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Simple layout rendering (basic grid)
    const cols = layout.includes("3x3")
      ? 3
      : layout.includes("3x2")
      ? 3
      : layout.includes("2x2")
      ? 2
      : 2;
    const rows = layout.includes("3x3")
      ? 3
      : layout.includes("3x2")
      ? 2
      : layout.includes("2x2")
      ? 2
      : 1;

    const cellWidth = (tempCanvas.width - (cols + 1) * spacing) / cols;
    const cellHeight = (tempCanvas.height - (rows + 1) * spacing) / rows;

    // Load all images in parallel using shared helper
    const loadedImages = await Promise.all(
      images
        .slice(0, cols * rows)
        .map((imgSrc: string) => loadImageWithCORS(imgSrc))
    );

    // Draw images in grid
    loadedImages.forEach((img: HTMLImageElement, index: number) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = spacing + col * (cellWidth + spacing);
      const y = spacing + row * (cellHeight + spacing);

      // Draw image to fit cell
      ctx.drawImage(img, x, y, cellWidth, cellHeight);
    });

    return tempCanvas.toDataURL("image/png");
  };

  // Get template canvas - renders template design
  const getTemplateCanvas = async (templateData: any) => {
    if (!templateData) return null;

    const { width, height, elements, currentImage } = templateData;

    // Create temp canvas for template
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return null;

    // Load the current image if available
    let loadedImage: HTMLImageElement | null = null;
    if (currentImage) {
      try {
        loadedImage = await loadImageWithCORS(currentImage);
      } catch (error) {
        console.error("Failed to load template image:", error);
      }
    }

    // Render each element
    for (const element of elements) {
      ctx.save();

      if (element.opacity !== undefined) {
        ctx.globalAlpha = element.opacity;
      }

      switch (element.type) {
        case "background":
          if (element.backgroundColor) {
            ctx.fillStyle = element.backgroundColor;
            ctx.fillRect(element.x, element.y, element.width, element.height);
          }
          break;

        case "shape":
          if (element.backgroundColor) {
            ctx.fillStyle = element.backgroundColor;
            if (element.borderRadius) {
              // Rounded rectangle
              const radius = element.borderRadius;
              ctx.beginPath();
              ctx.moveTo(element.x + radius, element.y);
              ctx.lineTo(element.x + element.width - radius, element.y);
              ctx.quadraticCurveTo(
                element.x + element.width,
                element.y,
                element.x + element.width,
                element.y + radius
              );
              ctx.lineTo(
                element.x + element.width,
                element.y + element.height - radius
              );
              ctx.quadraticCurveTo(
                element.x + element.width,
                element.y + element.height,
                element.x + element.width - radius,
                element.y + element.height
              );
              ctx.lineTo(element.x + radius, element.y + element.height);
              ctx.quadraticCurveTo(
                element.x,
                element.y + element.height,
                element.x,
                element.y + element.height - radius
              );
              ctx.lineTo(element.x, element.y + radius);
              ctx.quadraticCurveTo(
                element.x,
                element.y,
                element.x + radius,
                element.y
              );
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.fillRect(element.x, element.y, element.width, element.height);
            }
          }
          break;

        case "text":
          if (element.content) {
            // Set font
            const fontWeight = element.fontWeight || "normal";
            const fontSize = element.fontSize || 24;
            const fontFamily = element.fontFamily || "Arial";
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

            // Set color
            ctx.fillStyle = element.color || "#000000";

            // Set text alignment
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            // Word wrap for multi-line text
            const words = element.content.split(" ");
            const lines: string[] = [];
            let currentLine = "";
            const maxWidth = element.width - 20; // Add some padding

            words.forEach((word: string) => {
              const testLine = currentLine + word + " ";
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && currentLine !== "") {
                lines.push(currentLine);
                currentLine = word + " ";
              } else {
                currentLine = testLine;
              }
            });
            lines.push(currentLine);

            // Draw each line
            const lineHeight = fontSize * 1.2;
            lines.forEach((line, index) => {
              ctx.fillText(
                line.trim(),
                element.x + 10,
                element.y + index * lineHeight + 10
              );
            });
          }
          break;

        case "image":
          if (loadedImage) {
            // Draw the actual loaded image
            // Calculate aspect ratio to fit image in element bounds
            const imgAspect = loadedImage.width / loadedImage.height;
            const elemAspect = element.width / element.height;

            let drawWidth = element.width;
            let drawHeight = element.height;
            let offsetX = element.x;
            let offsetY = element.y;

            if (imgAspect > elemAspect) {
              // Image is wider - fit to width
              drawHeight = element.width / imgAspect;
              offsetY = element.y + (element.height - drawHeight) / 2;
            } else {
              // Image is taller - fit to height
              drawWidth = element.height * imgAspect;
              offsetX = element.x + (element.width - drawWidth) / 2;
            }

            // Apply rounded corners if specified
            if (element.borderRadius) {
              ctx.beginPath();
              const radius = element.borderRadius;
              ctx.moveTo(offsetX + radius, offsetY);
              ctx.lineTo(offsetX + drawWidth - radius, offsetY);
              ctx.quadraticCurveTo(
                offsetX + drawWidth,
                offsetY,
                offsetX + drawWidth,
                offsetY + radius
              );
              ctx.lineTo(offsetX + drawWidth, offsetY + drawHeight - radius);
              ctx.quadraticCurveTo(
                offsetX + drawWidth,
                offsetY + drawHeight,
                offsetX + drawWidth - radius,
                offsetY + drawHeight
              );
              ctx.lineTo(offsetX + radius, offsetY + drawHeight);
              ctx.quadraticCurveTo(
                offsetX,
                offsetY + drawHeight,
                offsetX,
                offsetY + drawHeight - radius
              );
              ctx.lineTo(offsetX, offsetY + radius);
              ctx.quadraticCurveTo(offsetX, offsetY, offsetX + radius, offsetY);
              ctx.closePath();
              ctx.clip();
            }

            ctx.drawImage(loadedImage, offsetX, offsetY, drawWidth, drawHeight);
          } else {
            // Fallback to placeholder if no image loaded
            if (element.backgroundColor) {
              ctx.fillStyle = element.backgroundColor;
              if (element.borderRadius) {
                // Draw rounded rect for image placeholder
                const radius = element.borderRadius;
                ctx.beginPath();
                ctx.moveTo(element.x + radius, element.y);
                ctx.lineTo(element.x + element.width - radius, element.y);
                ctx.quadraticCurveTo(
                  element.x + element.width,
                  element.y,
                  element.x + element.width,
                  element.y + radius
                );
                ctx.lineTo(
                  element.x + element.width,
                  element.y + element.height - radius
                );
                ctx.quadraticCurveTo(
                  element.x + element.width,
                  element.y + element.height,
                  element.x + element.width - radius,
                  element.y + element.height
                );
                ctx.lineTo(element.x + radius, element.y + element.height);
                ctx.quadraticCurveTo(
                  element.x,
                  element.y + element.height,
                  element.x,
                  element.y + element.height - radius
                );
                ctx.lineTo(element.x, element.y + radius);
                ctx.quadraticCurveTo(
                  element.x,
                  element.y,
                  element.x + radius,
                  element.y
                );
                ctx.closePath();
                ctx.fill();
              } else {
                ctx.fillRect(
                  element.x,
                  element.y,
                  element.width,
                  element.height
                );
              }
            } else {
              // Draw placeholder with light gray background
              ctx.fillStyle = "#E5E7EB";
              ctx.fillRect(element.x, element.y, element.width, element.height);

              // Draw placeholder icon/text
              ctx.fillStyle = "#9CA3AF";
              ctx.font = "20px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                element.placeholder || "Image",
                element.x + element.width / 2,
                element.y + element.height / 2
              );
            }
          }
          break;
      }

      ctx.restore();
    }

    return tempCanvas.toDataURL("image/png");
  };

  // Frame rendering method
  const getFrameCanvas = (frameData: any) => {
    if (!frameData || !frameData.currentImageUrl) return null;

    const {
      style,
      width,
      color,
      backgroundColor,
      shadow,
      cornerRadius,
      innerPadding,
    } = frameData;

    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Calculate canvas size (image + padding + frame)
        const totalPadding = innerPadding * 2;
        const totalFrame = width * 2;
        const canvasWidth = img.width + totalPadding + totalFrame;
        const canvasHeight = img.height + totalPadding + totalFrame;

        // Create canvas
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Enable shadow if specified
        if (shadow) {
          ctx.shadowBlur = shadow.blur;
          ctx.shadowColor = shadow.color;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
        }

        // Draw mat/background (inner padding area)
        if (innerPadding > 0) {
          ctx.fillStyle = backgroundColor;
          const matX = width;
          const matY = width;
          const matWidth = canvasWidth - width * 2;
          const matHeight = canvasHeight - width * 2;

          if (cornerRadius > 0) {
            drawRoundedRect(ctx, matX, matY, matWidth, matHeight, cornerRadius);
            ctx.fill();
          } else {
            ctx.fillRect(matX, matY, matWidth, matHeight);
          }
        }

        // Reset shadow for frame drawing
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw frame based on style
        const frameX = 0;
        const frameY = 0;
        const frameWidth = canvasWidth;
        const frameHeight = canvasHeight;
        const imageX = width + innerPadding;
        const imageY = width + innerPadding;

        switch (style) {
          case "modern-thin":
          case "modern-thick":
            // Simple solid border
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            if (cornerRadius > 0) {
              drawRoundedRect(
                ctx,
                frameX + width / 2,
                frameY + width / 2,
                frameWidth - width,
                frameHeight - width,
                cornerRadius
              );
              ctx.stroke();
            } else {
              ctx.strokeRect(
                frameX + width / 2,
                frameY + width / 2,
                frameWidth - width,
                frameHeight - width
              );
            }
            break;

          case "modern-double":
            // Double line border
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(2, width / 5);

            // Outer line
            ctx.strokeRect(
              frameX + ctx.lineWidth / 2,
              frameY + ctx.lineWidth / 2,
              frameWidth - ctx.lineWidth,
              frameHeight - ctx.lineWidth
            );

            // Inner line
            const innerOffset = width - ctx.lineWidth;
            ctx.strokeRect(
              frameX + innerOffset,
              frameY + innerOffset,
              frameWidth - innerOffset * 2,
              frameHeight - innerOffset * 2
            );
            break;

          case "modern-shadow":
            // Already handled by shadow above
            ctx.fillStyle = color;
            ctx.fillRect(frameX, frameY, frameWidth, width); // Top
            ctx.fillRect(frameX, frameY, width, frameHeight); // Left
            ctx.fillRect(frameX, frameHeight - width, frameWidth, width); // Bottom
            ctx.fillRect(frameWidth - width, frameY, width, frameHeight); // Right
            break;

          case "classic-rounded":
            // Rounded corner frame
            ctx.fillStyle = color;
            const radius = Math.min(50, cornerRadius || 20);
            drawRoundedRect(
              ctx,
              frameX,
              frameY,
              frameWidth,
              frameHeight,
              radius
            );
            ctx.fill();
            // Cut out center
            ctx.globalCompositeOperation = "destination-out";
            drawRoundedRect(
              ctx,
              imageX,
              imageY,
              img.width,
              img.height,
              radius - width
            );
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            break;

          case "classic-beveled":
            // 3D beveled effect
            drawBeveledFrame(
              ctx,
              frameX,
              frameY,
              frameWidth,
              frameHeight,
              width,
              color
            );
            break;

          case "classic-ornate":
            // Ornate pattern (simplified)
            ctx.fillStyle = color;
            ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
            // Cut out center
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillRect(imageX, imageY, img.width, img.height);
            ctx.globalCompositeOperation = "source-over";
            // Add decorative dots
            drawOrnatePattern(
              ctx,
              frameX,
              frameY,
              frameWidth,
              frameHeight,
              width
            );
            break;

          case "photo-polaroid":
            // Polaroid style
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
            ctx.strokeStyle = "#E5E5E5";
            ctx.lineWidth = 1;
            ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
            break;

          case "photo-matted":
            // Already handled by mat background above
            ctx.fillStyle = color;
            ctx.fillRect(frameX, frameY, frameWidth, width); // Top
            ctx.fillRect(frameX, frameY, width, frameHeight); // Left
            ctx.fillRect(frameX, frameHeight - width, frameWidth, width); // Bottom
            ctx.fillRect(frameWidth - width, frameY, width, frameHeight); // Right
            break;

          case "special-neon":
            // Neon glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.strokeRect(
              frameX + width / 2,
              frameY + width / 2,
              frameWidth - width,
              frameHeight - width
            );
            ctx.shadowBlur = 0;
            break;

          case "special-gradient":
            // Gradient border
            const gradient = ctx.createLinearGradient(
              0,
              0,
              frameWidth,
              frameHeight
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, backgroundColor);
            gradient.addColorStop(1, color);
            ctx.fillStyle = gradient;
            ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
            // Cut out center
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillRect(imageX, imageY, img.width, img.height);
            ctx.globalCompositeOperation = "source-over";
            break;

          case "special-dashed":
            // Dashed border
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.setLineDash([width * 2, width]);
            ctx.strokeRect(
              frameX + width / 2,
              frameY + width / 2,
              frameWidth - width,
              frameHeight - width
            );
            ctx.setLineDash([]);
            break;

          default:
            // Default to simple border
            ctx.fillStyle = color;
            ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
            // Cut out center
            ctx.globalCompositeOperation = "destination-out";
            ctx.fillRect(imageX, imageY, img.width, img.height);
            ctx.globalCompositeOperation = "source-over";
        }

        // Draw the image
        ctx.drawImage(img, imageX, imageY, img.width, img.height);

        resolve(tempCanvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = frameData.currentImageUrl;
    });
  };

  // Helper function to draw rounded rectangles
  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
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
  }

  // Helper function to draw beveled frame
  function drawBeveledFrame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    frameWidth: number,
    baseColor: string
  ) {
    // Parse base color and create lighter/darker variants
    const lighter = lightenColor(baseColor, 30);
    const darker = darkenColor(baseColor, 30);

    // Top highlight
    ctx.fillStyle = lighter;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - frameWidth, y + frameWidth);
    ctx.lineTo(x + frameWidth, y + frameWidth);
    ctx.closePath();
    ctx.fill();

    // Left highlight
    ctx.fillStyle = lighter;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + frameWidth, y + frameWidth);
    ctx.lineTo(x + frameWidth, y + height - frameWidth);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();

    // Bottom shadow
    ctx.fillStyle = darker;
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + frameWidth, y + height - frameWidth);
    ctx.lineTo(x + width - frameWidth, y + height - frameWidth);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();

    // Right shadow
    ctx.fillStyle = darker;
    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - frameWidth, y + height - frameWidth);
    ctx.lineTo(x + width - frameWidth, y + frameWidth);
    ctx.closePath();
    ctx.fill();
  }

  // Helper function to draw ornate pattern
  function drawOrnatePattern(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    frameWidth: number
  ) {
    const dotSize = Math.max(3, frameWidth / 8);
    const spacing = frameWidth / 4;

    ctx.fillStyle = "#FFD700"; // Gold accent

    // Top border dots
    for (let i = spacing; i < width - spacing; i += spacing * 2) {
      ctx.beginPath();
      ctx.arc(x + i, y + frameWidth / 2, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom border dots
    for (let i = spacing; i < width - spacing; i += spacing * 2) {
      ctx.beginPath();
      ctx.arc(x + i, y + height - frameWidth / 2, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left border dots
    for (let i = spacing; i < height - spacing; i += spacing * 2) {
      ctx.beginPath();
      ctx.arc(x + frameWidth / 2, y + i, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right border dots
    for (let i = spacing; i < height - spacing; i += spacing * 2) {
      ctx.beginPath();
      ctx.arc(x + width - frameWidth / 2, y + i, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Color manipulation helpers
  function lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B)
      .toString(16)
      .slice(1)}`;
  }

  function darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B)
      .toString(16)
      .slice(1)}`;
  }

  // Background Library rendering method
  const getBackgroundCanvas = (backgroundData: any) => {
    if (!backgroundData || !backgroundData.currentImageUrl) return null;

    const { type, data } = backgroundData;

    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Create canvas with image dimensions
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Render background based on type
        switch (type) {
          case "solid":
            // Solid color background
            ctx.fillStyle = data.color;
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            break;

          case "gradient":
            if (data.type === "linear") {
              // Linear gradient
              const angle = data.angle || 135;
              const radians = (angle * Math.PI) / 180;

              // Calculate gradient endpoints based on angle
              const x1 =
                tempCanvas.width / 2 -
                (Math.cos(radians) * tempCanvas.width) / 2;
              const y1 =
                tempCanvas.height / 2 -
                (Math.sin(radians) * tempCanvas.height) / 2;
              const x2 =
                tempCanvas.width / 2 +
                (Math.cos(radians) * tempCanvas.width) / 2;
              const y2 =
                tempCanvas.height / 2 +
                (Math.sin(radians) * tempCanvas.height) / 2;

              const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

              // Add color stops
              data.colors.forEach((color: string, index: number) => {
                const stop =
                  data.stops?.[index] ?? index / (data.colors.length - 1);
                gradient.addColorStop(stop, color);
              });

              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            } else if (data.type === "radial") {
              // Radial gradient
              const centerX = tempCanvas.width / 2;
              const centerY = tempCanvas.height / 2;
              const radius = Math.max(tempCanvas.width, tempCanvas.height) / 2;

              const gradient = ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                radius
              );

              // Add color stops
              data.colors.forEach((color: string, index: number) => {
                const stop =
                  data.stops?.[index] ?? index / (data.colors.length - 1);
                gradient.addColorStop(stop, color);
              });

              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            }
            break;

          case "texture":
            // Textured background with noise
            ctx.fillStyle = data.baseColor || "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Add noise texture
            const intensity = data.intensity || 0.2;
            const imageData = ctx.getImageData(
              0,
              0,
              tempCanvas.width,
              tempCanvas.height
            );
            const pixels = imageData.data;

            for (let i = 0; i < pixels.length; i += 4) {
              const noise = (Math.random() - 0.5) * intensity * 255;
              pixels[i] += noise; // R
              pixels[i + 1] += noise; // G
              pixels[i + 2] += noise; // B
              // Alpha stays at 255
            }

            ctx.putImageData(imageData, 0, 0);
            break;

          case "pattern":
            // Pattern background (for future expansion)
            ctx.fillStyle = data.baseColor || "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            break;

          default:
            // Default to white
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw the image on top of background
        ctx.drawImage(img, 0, 0, img.width, img.height);

        resolve(tempCanvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = backgroundData.currentImageUrl;
    });
  };

  // Debug: Track canvas ref availability
  useEffect(() => {
    // console.log("🔍 Canvas ref status:", {
    //   hasRef: !!canvasRef.current,
    //   tool: selectedEditTool,
    //   hasOriginalImage: !!originalImage
    // });
  }, [canvasRef.current, selectedEditTool, originalImage]);

  // Expose applyFilter, collage, template, frame, and background methods to window
  useEffect(() => {
    if (!(window as any).imageEditorCanvas) {
      (window as any).imageEditorCanvas = {};
    }
    (window as any).imageEditorCanvas.applyFilter = applyFilter;
    (window as any).imageEditorCanvas.applyCollage = applyCollage;
    (window as any).imageEditorCanvas.getCollageCanvas = getCollageCanvas;
    (window as any).imageEditorCanvas.getTemplateCanvas = getTemplateCanvas;
    (window as any).imageEditorCanvas.getFrameCanvas = getFrameCanvas;
    (window as any).imageEditorCanvas.getBackgroundCanvas = getBackgroundCanvas;
    (window as any).imageEditorCanvas.setCropAspectRatio = handleSetCropAspectRatio;
    (window as any).imageEditorCanvas.applyCrop = applyCrop;
    (window as any).imageEditorCanvas.resetCrop = resetCrop;
  }, [applyFilter, collageSettings]);

  // Load image onto canvas
  useEffect(() => {
    if (!originalImage || !canvasRef.current || !maskCanvasRef.current) {
      return;
    }

    const img = new Image();
    // Use proxy endpoint for remote URLs, but use blob URLs directly for uploaded files
    let imageSrc = originalImage;

    // Only use proxy for HTTP/HTTPS URLs (not for blob: URLs from file uploads)
    if (
      !originalImage.startsWith("blob:") &&
      !originalImage.startsWith("data:")
    ) {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://blitzed.up.railway.app";
      imageSrc = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(
        originalImage
      )}`;
    }

    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Get canvas references
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;

      if (!canvas || !maskCanvas) {
        return;
      }

      const ctx = canvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");

      if (!ctx || !maskCtx) {
        return;
      }

      // Use a default size if container isn't measured yet
      let containerWidth = 800;
      let containerHeight = 600;

      if (containerRef.current) {
        containerWidth = containerRef.current.clientWidth - 32; // Account for padding
        containerHeight = containerRef.current.clientHeight - 100; // Account for header space
      }

      // Calculate scale to fit image in container while maintaining aspect ratio
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      const displayWidth = img.width * scale;
      const displayHeight = img.height * scale;

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

      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageLoaded(false);
    };
  }, [originalImage]);

  // Draw overlays when they change
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Redraw the base image first
    const img = new Image();
    let imageSrc = originalImage || "";

    // Only use proxy for HTTP/HTTPS URLs (not for blob: URLs from file uploads)
    if (
      originalImage &&
      !originalImage.startsWith("blob:") &&
      !originalImage.startsWith("data:")
    ) {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://blitzed.up.railway.app";
      imageSrc = `${apiBaseUrl}/api/images/proxy?url=${encodeURIComponent(
        originalImage
      )}`;
    }

    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw text overlays
      textOverlays.forEach((overlay) => {
        ctx.save();
        ctx.globalAlpha = overlay.opacity;

        // Apply transformations
        ctx.translate(overlay.x, overlay.y);
        ctx.rotate((overlay.rotation * Math.PI) / 180);

        // Set font style
        let fontStyle = "";
        if (overlay.italic) fontStyle += "italic ";
        if (overlay.bold) fontStyle += "bold ";
        fontStyle += `${overlay.fontSize}px ${overlay.fontFamily}`;
        ctx.font = fontStyle;
        ctx.fillStyle = overlay.color;

        // Draw text
        ctx.fillText(overlay.text, 0, 0);

        // Draw selection box if selected
        if (selectedOverlay === overlay.id) {
          const metrics = ctx.measureText(overlay.text);
          const textWidth = metrics.width;
          const textHeight = overlay.fontSize;

          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
          ctx.strokeRect(-5, -textHeight, textWidth + 10, textHeight + 10);
        }

        ctx.restore();
      });

      // Draw image overlays
      imageOverlays.forEach((overlay) => {
        const overlayImg = new Image();
        overlayImg.onload = () => {
          ctx.save();
          ctx.globalAlpha = overlay.opacity;

          // Apply transformations
          ctx.translate(overlay.x, overlay.y);
          ctx.rotate((overlay.rotation * Math.PI) / 180);

          // Draw image
          ctx.drawImage(overlayImg, 0, 0, overlay.width, overlay.height);

          // Draw selection box if selected
          if (selectedOverlay === overlay.id) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(-5, -5, overlay.width + 10, overlay.height + 10);
          }

          ctx.restore();
        };
        overlayImg.src = overlay.imageData;
      });
    };
  }, [
    textOverlays,
    imageOverlays,
    selectedOverlay,
    imageLoaded,
    originalImage,
  ]);

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

  // Overlay functions
  const addTextOverlay = (text: string) => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: text || "Sample Text",
      x: 50,
      y: 100,
      fontSize: 48,
      fontFamily: "Arial",
      color: "#ffffff",
      backgroundColor: "transparent",
      bold: true,
      italic: false,
      rotation: 0,
      opacity: 1,
    };
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedOverlay(newOverlay.id);
  };

  const addImageOverlay = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newOverlay: ImageOverlay = {
        id: `image-${Date.now()}`,
        imageData,
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
      };
      setImageOverlays([...imageOverlays, newOverlay]);
      setSelectedOverlay(newOverlay.id);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedEditTool === "overlay") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Implement hit testing for overlays
      let found = false;

      // Check text overlays (check in reverse order for proper z-index)
      for (let i = textOverlays.length - 1; i >= 0; i--) {
        const overlay = textOverlays[i];
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Set font to measure text
        let fontStyle = "";
        if (overlay.bold) fontStyle += "bold ";
        if (overlay.italic) fontStyle += "italic ";
        ctx.font = `${fontStyle}${overlay.fontSize}px ${overlay.fontFamily}`;

        const metrics = ctx.measureText(overlay.text);
        const textWidth = metrics.width;
        const textHeight = overlay.fontSize;

        // Apply rotation transform to check bounds
        const angle = (overlay.rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Transform click point to overlay's local coordinate system
        const localX = x - overlay.x;
        const localY = y - overlay.y;
        const rotatedX = localX * cos + localY * sin;
        const rotatedY = -localX * sin + localY * cos;

        // Check if click is within the rotated text bounds
        if (
          rotatedX >= -10 &&
          rotatedX <= textWidth + 10 &&
          rotatedY >= -textHeight - 10 &&
          rotatedY <= 10
        ) {
          setSelectedOverlay(overlay.id);
          setIsDraggingOverlay(true);
          found = true;
          break;
        }
      }

      // Check image overlays if no text overlay was found
      if (!found) {
        for (let i = imageOverlays.length - 1; i >= 0; i--) {
          const overlay = imageOverlays[i];

          // Apply rotation transform
          const angle = (overlay.rotation * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          // Transform click point to overlay's local coordinate system
          const localX = x - overlay.x;
          const localY = y - overlay.y;
          const rotatedX = localX * cos + localY * sin;
          const rotatedY = -localX * sin + localY * cos;

          // Check if click is within the rotated image bounds
          if (
            rotatedX >= -overlay.width / 2 - 10 &&
            rotatedX <= overlay.width / 2 + 10 &&
            rotatedY >= -overlay.height / 2 - 10 &&
            rotatedY <= overlay.height / 2 + 10
          ) {
            setSelectedOverlay(overlay.id);
            setIsDraggingOverlay(true);
            found = true;
            break;
          }
        }
      }

      // If no overlay was found, deselect
      if (!found) {
        setSelectedOverlay(null);
      }
    } else if (needsMask) {
      startDrawing(e);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      selectedEditTool === "overlay" &&
      isDraggingOverlay &&
      selectedOverlay
    ) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update text overlay position
      const textOverlay = textOverlays.find((o) => o.id === selectedOverlay);
      if (textOverlay) {
        setTextOverlays(
          textOverlays.map((overlay) =>
            overlay.id === selectedOverlay ? { ...overlay, x, y } : overlay
          )
        );
        return;
      }

      // Update image overlay position (x, y are center points)
      const imageOverlay = imageOverlays.find((o) => o.id === selectedOverlay);
      if (imageOverlay) {
        setImageOverlays(
          imageOverlays.map((overlay) =>
            overlay.id === selectedOverlay ? { ...overlay, x, y } : overlay
          )
        );
      }
    } else if (needsMask) {
      draw(e);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedEditTool === "overlay") {
      setIsDraggingOverlay(false);
    } else if (needsMask) {
      stopDrawing();
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedEditTool !== "overlay") return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if double-clicking on a text overlay
    for (let i = textOverlays.length - 1; i >= 0; i--) {
      const overlay = textOverlays[i];
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      // Set font to measure text
      let fontStyle = "";
      if (overlay.bold) fontStyle += "bold ";
      if (overlay.italic) fontStyle += "italic ";
      ctx.font = `${fontStyle}${overlay.fontSize}px ${overlay.fontFamily}`;

      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width;
      const textHeight = overlay.fontSize;

      // Apply rotation transform to check bounds
      const angle = (overlay.rotation * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Transform click point to overlay's local coordinate system
      const localX = x - overlay.x;
      const localY = y - overlay.y;
      const rotatedX = localX * cos + localY * sin;
      const rotatedY = -localX * sin + localY * cos;

      // Check if double-click is within the rotated text bounds
      if (
        rotatedX >= -10 &&
        rotatedX <= textWidth + 10 &&
        rotatedY >= -textHeight - 10 &&
        rotatedY <= 10
      ) {
        // Start inline editing
        setEditingTextId(overlay.id);
        setEditingTextValue(overlay.text);
        setSelectedOverlay(overlay.id);
        break;
      }
    }
  };

  const handleEditingTextKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      // Save the text
      setTextOverlays(
        textOverlays.map((overlay) =>
          overlay.id === editingTextId
            ? { ...overlay, text: editingTextValue }
            : overlay
        )
      );
      setEditingTextId(null);
      setEditingTextValue("");
    } else if (e.key === "Escape") {
      // Cancel editing
      setEditingTextId(null);
      setEditingTextValue("");
    }
  };

  const handleEditingTextBlur = () => {
    // Save on blur
    if (editingTextId) {
      setTextOverlays(
        textOverlays.map((overlay) =>
          overlay.id === editingTextId
            ? { ...overlay, text: editingTextValue }
            : overlay
        )
      );
    }
    setEditingTextId(null);
    setEditingTextValue("");
  };

  const handleSaveOverlays = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      if (onSaveOverlays) {
        onSaveOverlays(dataUrl);
      }
    }
  };

  // Get canvas with filters applied (baked into pixel data)
  const getCanvasWithFilters = () => {
    if (!canvasRef.current) {
      return null;
    }

    const sourceCanvas = canvasRef.current;
    const sourceCtx = sourceCanvas.getContext("2d");

    if (!sourceCtx) {
      return null;
    }

    // Get source pixels first
    const sourceData = sourceCtx.getImageData(
      0,
      0,
      sourceCanvas.width,
      sourceCanvas.height
    );

    // Build filter values
    const brightness = (filterSettings?.brightness || 0) / 100;
    const contrast = (filterSettings?.contrast || 0) / 100;
    const saturation = (filterSettings?.saturation || 0) / 100;
    const temperature = ((filterSettings?.temperature || 0) * 0.7) / 100;
    const tint =
      (filterSettings?.tint || 0) > 0
        ? ((filterSettings?.tint || 0) * 0.3) / 100
        : 0;

    // Apply pixel-level filters directly to the source data
    for (let i = 0; i < sourceData.data.length; i += 4) {
      let r = sourceData.data[i];
      let g = sourceData.data[i + 1];
      let b = sourceData.data[i + 2];

      // Brightness
      r = Math.max(0, Math.min(255, r + 255 * brightness));
      g = Math.max(0, Math.min(255, g + 255 * brightness));
      b = Math.max(0, Math.min(255, b + 255 * brightness));

      // Contrast
      r = ((r / 255 - 0.5) * (1 + contrast) + 0.5) * 255;
      g = ((g / 255 - 0.5) * (1 + contrast) + 0.5) * 255;
      b = ((b / 255 - 0.5) * (1 + contrast) + 0.5) * 255;

      // Saturation (convert to HSL, adjust S, convert back)
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * (1 + saturation);
      g = gray + (g - gray) * (1 + saturation);
      b = gray + (b - gray) * (1 + saturation);

      // Temperature (red/blue shift)
      r = Math.max(0, Math.min(255, r + 255 * temperature));
      b = Math.max(0, Math.min(255, b - 255 * temperature));

      // Tint (sepia effect)
      if (tint > 0) {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = r + (tr - r) * tint;
        g = g + (tg - g) * tint;
        b = b + (tb - b) * tint;
      }

      sourceData.data[i] = Math.max(0, Math.min(255, r));
      sourceData.data[i + 1] = Math.max(0, Math.min(255, g));
      sourceData.data[i + 2] = Math.max(0, Math.min(255, b));
      // Alpha channel (sourceData.data[i + 3]) remains unchanged
    }

    // Create temp canvas and put modified pixels
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = sourceCanvas.width;
    tempCanvas.height = sourceCanvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      return null;
    }

    tempCtx.putImageData(sourceData, 0, 0);

    const dataUrl = tempCanvas.toDataURL("image/png");
    return dataUrl;
  };

  // Export functions for parent component
  useEffect(() => {
    if (!(window as any).imageEditorCanvas) {
      (window as any).imageEditorCanvas = {};
    }
    (window as any).imageEditorCanvas.addTextOverlay = addTextOverlay;
    (window as any).imageEditorCanvas.addImageOverlay = addImageOverlay;
    (window as any).imageEditorCanvas.handleSaveOverlays = handleSaveOverlays;
    (window as any).imageEditorCanvas.getCanvasWithFilters =
      getCanvasWithFilters;
    (window as any).imageEditorCanvas.textOverlays = textOverlays;
    (window as any).imageEditorCanvas.imageOverlays = imageOverlays;
    (window as any).imageEditorCanvas.selectedOverlay = selectedOverlay;
    (window as any).imageEditorCanvas.setTextOverlays = setTextOverlays;
    (window as any).imageEditorCanvas.setImageOverlays = setImageOverlays;
    (window as any).imageEditorCanvas.setSelectedOverlay = setSelectedOverlay;
  }, [textOverlays, imageOverlays, selectedOverlay, filterSettings]);

  // For collage and template tools, allow rendering without an original image
  if (!originalImage && !["collage", "template"].includes(selectedEditTool)) {
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
      case "overlay":
        return "Add text and image overlays. Use the controls on the left.";
      case "filters":
        return "Apply color filters and presets to your image. Preview updates in real-time.";
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
            {selectedEditTool !== "filters" && (
              <button
                onClick={
                  selectedEditTool === "overlay"
                    ? handleSaveOverlays
                    : handleGenerate
                }
                disabled={isProcessing || !imageLoaded}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isProcessing
                  ? "Processing..."
                  : selectedEditTool === "overlay"
                  ? "Save"
                  : "Generate"}
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">{getToolDescription()}</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-auto">
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onDoubleClick={handleCanvasDoubleClick}
            className={`shadow-lg rounded ${
              selectedEditTool === "overlay"
                ? "cursor-move"
                : "cursor-crosshair"
            }`}
            style={{
              filter: filterSettings
                ? `brightness(${100 + (filterSettings.brightness || 0)}%)
                   contrast(${100 + (filterSettings.contrast || 0)}%)
                   saturate(${100 + (filterSettings.saturation || 0)}%)
                   hue-rotate(${(filterSettings.temperature || 0) * 0.7}deg)
                   sepia(${
                     (filterSettings.tint || 0) > 0
                       ? filterSettings?.tint * 0.3
                       : 0
                   }%)
                   ${
                     filterSettings.vignette
                       ? `drop-shadow(0 0 ${filterSettings.vignette}px rgba(0,0,0,0.5))`
                       : ""
                   }`
                : "none",
            }}
          />

          {/* Inline Text Editor */}
          {editingTextId &&
            selectedEditTool === "overlay" &&
            (() => {
              const overlay = textOverlays.find((o) => o.id === editingTextId);
              if (!overlay) return null;

              const canvas = canvasRef.current;
              if (!canvas) return null;

              const canvasRect = canvas.getBoundingClientRect();
              const containerRect =
                containerRef.current?.getBoundingClientRect();
              if (!containerRect) return null;

              // Calculate position relative to container
              const left = canvasRect.left - containerRect.left + overlay.x - 5;
              const top =
                canvasRect.top -
                containerRect.top +
                overlay.y -
                overlay.fontSize -
                5;

              return (
                <input
                  type="text"
                  value={editingTextValue}
                  onChange={(e) => setEditingTextValue(e.target.value)}
                  onKeyDown={handleEditingTextKeyDown}
                  onBlur={handleEditingTextBlur}
                  autoFocus
                  style={{
                    position: "absolute",
                    left: `${left}px`,
                    top: `${top}px`,
                    fontSize: `${overlay.fontSize}px`,
                    fontFamily: overlay.fontFamily,
                    fontWeight: overlay.bold ? "bold" : "normal",
                    fontStyle: overlay.italic ? "italic" : "normal",
                    color: overlay.color,
                    backgroundColor:
                      overlay.backgroundColor === "transparent"
                        ? "rgba(255,255,255,0.9)"
                        : overlay.backgroundColor,
                    border: "2px solid #3B82F6",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    zIndex: 1000,
                    outline: "none",
                    minWidth: "100px",
                  }}
                />
              );
            })()}

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

          {!imageLoaded &&
            originalImage &&
            !["collage", "template"].includes(selectedEditTool) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading image...</p>
                </div>
              </div>
            )}

          {!imageLoaded &&
            !originalImage &&
            !collageSettings &&
            ["collage", "template"].includes(selectedEditTool) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium">
                    Select a layout to preview collage
                  </p>
                  <p className="text-sm mt-2">
                    Choose images and a layout from the sidebar
                  </p>
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
