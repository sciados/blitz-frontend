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

  // Collage state
  const [collageSettings, setCollageSettings] = useState<any>(null);

  // Apply collage to canvas (simplified version - just preview)
  const applyCollage = (settings: any) => {
    setCollageSettings(settings);
    // The actual collage rendering will be done client-side
    // This is just to track the settings
  };

  // Get collage canvas - creates the final collage
  const getCollageCanvas = () => {
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

    // Draw images in grid
    images.forEach((imgSrc: string, index: number) => {
      if (index >= cols * rows) return;

      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = spacing + col * (cellWidth + spacing);
      const y = spacing + row * (cellHeight + spacing);

      const img = new Image();
      img.src = imgSrc;

      // Draw image to fit cell
      ctx.drawImage(img, x, y, cellWidth, cellHeight);
    });

    return tempCanvas.toDataURL("image/png");
  };

  // Get template canvas - renders template design
  const getTemplateCanvas = (templateData: any) => {
    if (!templateData) return null;

    const { width, height, elements } = templateData;

    // Create temp canvas for template
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext("2d");

    if (!ctx) return null;

    // Render each element
    elements.forEach((element: any) => {
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
          // For now, we'll just show a placeholder
          // In production, you'd load the actual image
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
              ctx.fillRect(element.x, element.y, element.width, element.height);
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
          break;
      }

      ctx.restore();
    });

    return tempCanvas.toDataURL("image/png");
  };

  // Expose applyFilter, collage, and template methods to window
  useEffect(() => {
    if (!(window as any).imageEditorCanvas) {
      (window as any).imageEditorCanvas = {};
    }
    (window as any).imageEditorCanvas.applyFilter = applyFilter;
    (window as any).imageEditorCanvas.applyCollage = applyCollage;
    (window as any).imageEditorCanvas.getCollageCanvas = getCollageCanvas;
    (window as any).imageEditorCanvas.getTemplateCanvas = getTemplateCanvas;
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
