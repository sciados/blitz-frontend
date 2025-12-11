"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "src/lib/appClient";

interface VideoTextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  font_size: number;
  font_family: string;
  color: string;
  stroke_color?: string;
  stroke_width: number;
  opacity: number;
  // Time-based properties for video
  start_time: number;    // When text appears (seconds)
  duration: number;      // How long it stays (seconds)
  animation_in: string;  // "fade", "slide_up", "zoom", "none"
  animation_out: string; // "fade", "slide_down", "zoom", "none"
  // Preview visibility
  visible: boolean;      // Whether to show this layer in preview
}

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoScript?: string;  // Optional: auto-generate text layers from script
  campaignId: number;
  onSave: (video: { video_url: string }) => void;
}

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
  "#FFC0CB", "#A52A2A", "#808080", "#000080", "#008000",
];

const ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade In/Out" },
  { value: "slide_up", label: "Slide Up" },
  { value: "slide_down", label: "Slide Down" },
  { value: "zoom", label: "Zoom In" },
];

export function VideoEditorModal({
  isOpen,
  onClose,
  videoUrl,
  videoScript,
  campaignId,
  onSave,
}: VideoEditorModalProps) {
  const [textLayers, setTextLayers] = useState<VideoTextLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>("");
  const [expandedLayerId, setExpandedLayerId] = useState<string>(""); // Which layer card is expanded
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16/9); // Default to 16:9
  const timelineVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const activeLayer = textLayers.find((layer) => layer.id === activeLayerId);

  // Auto-show the active layer when it changes
  useEffect(() => {
    if (activeLayerId) {
      setTextLayers((prevLayers) =>
        prevLayers.map((layer) =>
          layer.id === activeLayerId ? { ...layer, visible: true } : layer
        )
      );
      // Auto-expand the selected layer
      setExpandedLayerId(activeLayerId);
    }
  }, [activeLayerId]);

  // Auto-generate text layers from video script (wait for video duration to be known)
  useEffect(() => {
    if (isOpen && videoScript && videoDuration > 0) {
      autoGenerateTextLayers(videoScript);
    }
  }, [isOpen, videoScript, videoDuration]);

  // Fetch fonts
  useEffect(() => {
    if (isOpen) {
      api.get("/api/images/fonts")
        .then(({ data }) => setFonts(data))
        .catch(() => {
          setFonts([
            { value: "Arial", label: "Arial" },
            { value: "Helvetica", label: "Helvetica" },
            { value: "Times New Roman", label: "Times New Roman" },
          ]);
        });
    }
  }, [isOpen]);

  const autoGenerateTextLayers = (script: string) => {
    // Remove VOICEOVER: prefix if present
    const cleanScript = script.replace(/^VOICEOVER:\s*/, "");

    // Split by sentences first
    const sentences = cleanScript.split(/[\.\!\?]\s+/).filter(s => s.trim());

    // Further split long sentences into smaller chunks
    const segments: string[] = [];
    const MAX_SEGMENT_LENGTH = 80; // Maximum characters per segment

    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return;

      // If sentence is short enough, add it as-is
      if (trimmedSentence.length <= MAX_SEGMENT_LENGTH) {
        segments.push(trimmedSentence);
      } else {
        // Split long sentences by commas or "and" if available
        const parts = trimmedSentence.split(/,\s+|\s+and\s+/i).filter(p => p.trim());

        if (parts.length > 1) {
          // Recombine parts into manageable segments
          let currentSegment = "";
          parts.forEach((part, i) => {
            if ((currentSegment + (currentSegment ? ", " : "") + part).length <= MAX_SEGMENT_LENGTH) {
              currentSegment += (currentSegment ? ", " : "") + part;
            } else {
              if (currentSegment) {
                segments.push(currentSegment);
              }
              currentSegment = part;
            }
          });
          if (currentSegment) {
            segments.push(currentSegment);
          }
        } else {
          // If we can't split nicely, just take chunks of MAX_SEGMENT_LENGTH
          for (let i = 0; i < trimmedSentence.length; i += MAX_SEGMENT_LENGTH) {
            segments.push(trimmedSentence.slice(i, i + MAX_SEGMENT_LENGTH));
          }
        }
      }
    });

    const layers: VideoTextLayer[] = segments.map((segment, index) => {
      const startTime = (index * videoDuration) / segments.length;
      // Add period to all segments except the last one if it doesn't already end with punctuation
      const displayText = segment.trim() + (index < segments.length - 1 && !/[.,!?]$/.test(segment.trim()) ? "." : "");

      return {
        id: (index + 1).toString(),
        text: displayText,
        x: 50, // Center
        y: 85, // Bottom
        font_size: 28, // Reduced from 48 to prevent overflow
        font_family: fonts[0]?.value || "Arial",
        color: "#FFFFFF",
        stroke_color: "#000000",
        stroke_width: 2,
        opacity: 1.0,
        start_time: startTime,
        duration: videoDuration / segments.length,
        animation_in: "fade",
        animation_out: "fade",
        visible: index === 0, // Only first layer visible by default
      };
    });

    setTextLayers(layers);
    if (layers.length > 0) {
      setActiveLayerId(layers[0].id);
    }
  };

  const handleAddTextLayer = () => {
    const newId = (textLayers.length + 1).toString();
    const defaultFont = fonts[0]?.value || "Arial";
    const newLayer: VideoTextLayer = {
      id: newId,
      text: "New Text",
      x: 50,
      y: 85,
      font_size: 28, // Reduced from 48 to match auto-generated layers
      font_family: defaultFont,
      color: "#FFFFFF",
      stroke_width: 0,
      opacity: 1.0,
      start_time: currentTime,
      duration: 3,
      animation_in: "fade",
      animation_out: "fade",
      visible: true, // New layers are visible by default
    };
    setTextLayers([...textLayers, newLayer]);
    setActiveLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    if (textLayers.length === 1) return;
    const updatedLayers = textLayers.filter((layer) => layer.id !== id);
    setTextLayers(updatedLayers);
    if (activeLayerId === id && updatedLayers.length > 0) {
      setActiveLayerId(updatedLayers[0].id);
    }
  };

  const handleToggleVisibility = (id: string) => {
    setTextLayers(
      textLayers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleShowAll = () => {
    setTextLayers(textLayers.map((layer) => ({ ...layer, visible: true })));
  };

  const handleHideAll = () => {
    setTextLayers(textLayers.map((layer) => ({ ...layer, visible: false })));
  };

  const handleLayerChange = (id: string, updates: Partial<VideoTextLayer>) => {
    setTextLayers(
      textLayers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer))
    );
  };

  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!previewContainerRef.current) return;

    const layer = textLayers.find((l) => l.id === layerId);
    if (!layer) return;

    const containerRect = previewContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Convert percentage to pixels for calculations
    const layerXpx = (layer.x / 100) * containerWidth;
    const layerYpx = (layer.y / 100) * containerHeight;

    // Calculate mouse position relative to the container (in pixels)
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    // Store the initial mouse position and layer position (in pixels)
    const initialMouseX = mouseX;
    const initialMouseY = mouseY;
    const initialLayerX = layerXpx;
    const initialLayerY = layerYpx;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Calculate current mouse position relative to the container (in pixels)
      const currentMouseX = e.clientX - containerRect.left;
      const currentMouseY = e.clientY - containerRect.top;

      // Calculate movement delta (in pixels)
      const deltaX = currentMouseX - initialMouseX;
      const deltaY = currentMouseY - initialMouseY;

      // Apply delta to initial layer position (in pixels)
      const newXpx = initialLayerX + deltaX;
      const newYpx = initialLayerY + deltaY;

      // Convert back to percentage for storage
      const newXPercent = Math.max(0, Math.min(100, (newXpx / containerWidth) * 100));
      const newYPercent = Math.max(0, Math.min(100, (newYpx / containerHeight) * 100));

      // Update both x and y in percentage
      handleLayerChange(layerId, {
        x: newXPercent,
        y: newYPercent,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleSave = async () => {
    if (!activeLayer) return;

    setIsProcessing(true);

    try {
      const payload = {
        video_url: videoUrl,
        text_layers: textLayers,
        campaign_id: campaignId,
      };

      const { data } = await api.post("/api/videos/text-overlay", payload);

      toast.success("Text overlay added to video successfully!");
      onSave(data);
      onClose();
    } catch (err: any) {
      console.error("Error adding text overlay:", err);
      toast.error(err.response?.data?.detail || "Failed to add text overlay");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-h-[90vh] overflow-hidden flex flex-col w-[1200px]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎬 Video Text Editor
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Controls */}
          <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4">
            {/* Video Timeline */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-900 rounded border">
              <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                ⏱️ Video Timeline
              </div>
              <video
                ref={timelineVideoRef}
                src={videoUrl}
                className="w-full rounded"
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  setVideoDuration(video.duration);
                }}
                onTimeUpdate={(e) => {
                  setCurrentTime(e.currentTarget.currentTime);
                }}
              />
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Duration: {videoDuration.toFixed(1)}s | Current: {currentTime.toFixed(1)}s
                <br />
                Aspect Ratio: {videoAspectRatio.toFixed(2)} ({videoAspectRatio > 1.5 ? "Landscape" : videoAspectRatio < 0.75 ? "Portrait" : "Square"})
              </div>
            </div>

            {/* Text Layers */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-normal text-gray-900 dark:text-white">
                    Text Layers ({textLayers.length})
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={handleShowAll}
                      className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      title="Show all layers"
                    >
                      👁️ All
                    </button>
                    <button
                      onClick={handleHideAll}
                      className="text-xs px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
                      title="Hide all layers"
                    >
                      🚫 All
                    </button>
                  </div>
                </div>

                {/* Horizontal Layer Button Bar */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {textLayers.map((layer) => {
                    const isActive = activeLayerId === layer.id;
                    const isExpanded = expandedLayerId === layer.id;
                    return (
                      <button
                        key={layer.id}
                        onClick={() => {
                          setActiveLayerId(layer.id);
                          setExpandedLayerId(isExpanded ? "" : layer.id);
                        }}
                        className={`flex-1 min-w-0 px-2 py-2 rounded border transition text-xs font-medium ${
                          isActive
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        title={`Layer ${layer.id} - ${layer.visible ? "Visible" : "Hidden"}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>{layer.visible ? "👁️" : "🚫"}</span>
                          <span className="text-gray-900 dark:text-white">L{layer.id}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Expanded Layer Details - Only shows one at a time */}
                {expandedLayerId && (() => {
                  const layer = textLayers.find(l => l.id === expandedLayerId);
                  if (!layer) return null;

                  return (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleVisibility(layer.id)}
                            className={`text-xs px-2 py-1 rounded transition ${
                              layer.visible
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                            }`}
                            title={layer.visible ? "Hide layer" : "Show layer"}
                          >
                            {layer.visible ? "👁️" : "🚫"}
                          </button>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Layer {layer.id} Details
                          </span>
                        </div>
                        {textLayers.length > 1 && (
                          <button
                            onClick={() => handleDeleteLayer(layer.id)}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {layer.text}
                      </p>
                      <div className="text-xs text-gray-500">
                        {layer.start_time.toFixed(1)}s - {(layer.start_time + layer.duration).toFixed(1)}s
                      </div>
                    </div>
                  );
                })()}

                <button
                  onClick={handleAddTextLayer}
                  className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm"
                >
                  + Add Text Layer
                </button>
              </div>

              {/* Layer Properties */}
              {activeLayer && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Text {!activeLayer.visible && <span className="text-xs text-gray-500">(hidden in preview)</span>}
                    </label>
                    <textarea
                      value={activeLayer.text}
                      onChange={(e) => handleLayerChange(activeLayer.id, { text: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      rows={2}
                      placeholder={activeLayer.visible ? "" : "Click 👁️ to show text in preview"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Start Time: {activeLayer.start_time.toFixed(1)}s
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.1"
                      value={activeLayer.start_time}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, { start_time: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Duration: {activeLayer.duration.toFixed(1)}s
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.1"
                      value={activeLayer.duration}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, { duration: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Font Family
                    </label>
                    <select
                      value={activeLayer.font_family}
                      onChange={(e) => handleLayerChange(activeLayer.id, { font_family: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      {fonts.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Font Size: {activeLayer.font_size}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={activeLayer.font_size}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, { font_size: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Text Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleLayerChange(activeLayer.id, { color })}
                          className={`w-full aspect-square rounded border-2 ${
                            activeLayer.color === color ? "border-gray-800 dark:border-white" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Border Size: {activeLayer.stroke_width}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={activeLayer.stroke_width}
                      onChange={(e) =>
                        handleLayerChange(activeLayer.id, { stroke_width: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Border Color
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleLayerChange(activeLayer.id, { stroke_color: color })}
                          className={`w-full aspect-square rounded border-2 ${
                            (activeLayer.stroke_color || "#000000") === color ? "border-gray-800 dark:border-white" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Animation In
                    </label>
                    <select
                      value={activeLayer.animation_in}
                      onChange={(e) => handleLayerChange(activeLayer.id, { animation_in: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      {ANIMATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Animation Out
                    </label>
                    <select
                      value={activeLayer.animation_out}
                      onChange={(e) => handleLayerChange(activeLayer.id, { animation_out: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      {ANIMATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Video Preview */}
          <div className="flex-1 overflow-auto p-4">
            <div
              ref={previewContainerRef}
              className="relative bg-black rounded-lg overflow-hidden"
              style={{ paddingBottom: `${(1 / videoAspectRatio) * 100}%` }}
            >
              <video
                ref={previewVideoRef}
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full object-contain"
                controls
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  setVideoDuration(video.duration);
                  // Detect and set video aspect ratio
                  if (video.videoWidth && video.videoHeight) {
                    const aspectRatio = video.videoWidth / video.videoHeight;
                    setVideoAspectRatio(aspectRatio);
                  }
                }}
              />

              {/* Text Overlay Preview */}
              {textLayers
                .filter((layer) => layer.visible) // Only render visible layers
                .map((layer) => (
                <div
                  key={layer.id}
                  className={`absolute cursor-move transition-opacity ${
                    activeLayerId === layer.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontSize: layer.font_size,
                    fontFamily: layer.font_family,
                    color: layer.color,
                    opacity: layer.opacity,
                    WebkitTextStroke: layer.stroke_width > 0 ? `${layer.stroke_width}px ${layer.stroke_color || "#000"}` : "none",
                    textShadow: layer.stroke_width > 0 ? `0 0 ${layer.stroke_width}px ${layer.stroke_color || "#000"}` : "none",
                    maxWidth: "80%", // Limit width to prevent overflow
                    textAlign: "center", // Center align text
                    lineHeight: "1.2", // Better line spacing
                    wordWrap: "break-word", // Enable word wrapping
                  }}
                  onMouseDown={(e) => handleMouseDown(e, layer.id)}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div className="pointer-events-none">{layer.text}</div>
                  {/* Debug indicator - shows position */}
                  {activeLayerId === layer.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        left: 0,
                        fontSize: 12,
                        color: "white",
                        background: "rgba(0,0,0,0.7)",
                        padding: "2px 4px",
                        borderRadius: 2,
                        pointerEvents: "none",
                        fontWeight: "normal",
                      }}
                    >
                      x: {Math.round(layer.x)}, y: {Math.round(layer.y)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs mt-2 text-center text-gray-600 dark:text-gray-400">
              💡 Click layer buttons (L1, L2, etc.) to expand details • Use 👁️ to show/hide in preview
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-white"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition font-medium flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save with Text Overlays</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FontOption {
  value: string;
  label: string;
}
