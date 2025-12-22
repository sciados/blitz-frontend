"use client";

import { useRef, useEffect, useState } from 'react';

interface OverlayEditorProps {
  originalImage: string | null;
  onSave: (editedImageDataUrl: string) => void;
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

export function OverlayEditor({
  originalImage,
  onSave,
  isProcessing,
}: OverlayEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [imageOverlays, setImageOverlays] = useState<ImageOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTextControls, setShowTextControls] = useState(false);
  const [showImageControls, setShowImageControls] = useState(false);

  // Load image onto canvas
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      redrawCanvas();
      setImageLoaded(true);
    };

    img.src = originalImage;
  }, [originalImage]);

  // Redraw canvas whenever overlays change
  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [textOverlays, imageOverlays, imageLoaded]);

  const redrawCanvas = () => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Draw image overlays
      imageOverlays.forEach(overlay => {
        ctx.save();
        ctx.globalAlpha = overlay.opacity;
        ctx.translate(overlay.x + overlay.width / 2, overlay.y + overlay.height / 2);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        
        const overlayImg = new Image();
        overlayImg.src = overlay.imageData;
        ctx.drawImage(
          overlayImg,
          -overlay.width / 2,
          -overlay.height / 2,
          overlay.width,
          overlay.height
        );
        
        ctx.restore();
      });
      
      // Draw text overlays
      textOverlays.forEach(overlay => {
        ctx.save();
        ctx.globalAlpha = overlay.opacity;
        ctx.translate(overlay.x, overlay.y);
        ctx.rotate((overlay.rotation * Math.PI) / 180);
        
        // Set font
        let fontStyle = '';
        if (overlay.bold) fontStyle += 'bold ';
        if (overlay.italic) fontStyle += 'italic ';
        ctx.font = `${fontStyle}${overlay.fontSize}px ${overlay.fontFamily}`;
        
        // Background
        if (overlay.backgroundColor !== 'transparent') {
          const metrics = ctx.measureText(overlay.text);
          const padding = 10;
          ctx.fillStyle = overlay.backgroundColor;
          ctx.fillRect(
            -padding,
            -overlay.fontSize - padding,
            metrics.width + padding * 2,
            overlay.fontSize + padding * 2
          );
        }
        
        // Text
        ctx.fillStyle = overlay.color;
        ctx.fillText(overlay.text, 0, 0);
        
        // Selection indicator
        if (selectedOverlay === overlay.id) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          const metrics = ctx.measureText(overlay.text);
          ctx.strokeRect(-5, -overlay.fontSize - 5, metrics.width + 10, overlay.fontSize + 10);
        }
        
        ctx.restore();
      });
    };

    img.src = originalImage;
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: `text-${Date.now()}`,
      text: 'Double-click to edit',
      x: 100,
      y: 100,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: 'transparent',
      bold: false,
      italic: false,
      rotation: 0,
      opacity: 1,
    };
    
    setTextOverlays([...textOverlays, newOverlay]);
    setSelectedOverlay(newOverlay.id);
    setShowTextControls(true);
  };

  const addImageOverlay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      
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
      setShowImageControls(true);
    };
    
    reader.readAsDataURL(file);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(textOverlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const updateImageOverlay = (id: string, updates: Partial<ImageOverlay>) => {
    setImageOverlays(imageOverlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const deleteOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(o => o.id !== id));
    setImageOverlays(imageOverlays.filter(o => o.id !== id));
    setSelectedOverlay(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on an overlay
    let found = false;
    
    // Check text overlays
    for (const overlay of [...textOverlays].reverse()) {
      if (
        x >= overlay.x - 10 &&
        x <= overlay.x + 200 && // Approximate text width
        y >= overlay.y - overlay.fontSize - 10 &&
        y <= overlay.y + 10
      ) {
        setSelectedOverlay(overlay.id);
        setIsDragging(true);
        setShowTextControls(true);
        setShowImageControls(false);
        found = true;
        break;
      }
    }
    
    // Check image overlays
    if (!found) {
      for (const overlay of [...imageOverlays].reverse()) {
        if (
          x >= overlay.x &&
          x <= overlay.x + overlay.width &&
          y >= overlay.y &&
          y <= overlay.y + overlay.height
        ) {
          setSelectedOverlay(overlay.id);
          setIsDragging(true);
          setShowImageControls(true);
          setShowTextControls(false);
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      setSelectedOverlay(null);
      setShowTextControls(false);
      setShowImageControls(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedOverlay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Update text overlay position
    const textOverlay = textOverlays.find(o => o.id === selectedOverlay);
    if (textOverlay) {
      updateTextOverlay(selectedOverlay, { x, y });
    }

    // Update image overlay position
    const imageOverlay = imageOverlays.find(o => o.id === selectedOverlay);
    if (imageOverlay) {
      updateImageOverlay(selectedOverlay, { 
        x: x - imageOverlay.width / 2, 
        y: y - imageOverlay.height / 2 
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  const getSelectedTextOverlay = () => {
    return textOverlays.find(o => o.id === selectedOverlay);
  };

  const getSelectedImageOverlay = () => {
    return imageOverlays.find(o => o.id === selectedOverlay);
  };

  if (!originalImage) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-500">No image loaded</p>
      </div>
    );
  }

  const selectedText = getSelectedTextOverlay();
  const selectedImage = getSelectedImageOverlay();

  return (
    <div className="flex gap-4">
      {/* Canvas Area */}
      <div className="flex-1 bg-white rounded-lg shadow-lg p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Overlay Editor</h3>
          <div className="flex gap-2">
            <button
              onClick={addTextOverlay}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ➕ Add Text
            </button>
            <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer disabled:opacity-50">
              🖼️ Add Image
              <input
                type="file"
                accept="image/*"
                onChange={addImageOverlay}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              💾 Save
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-auto" style={{ minHeight: '400px', maxHeight: '700px' }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="shadow-lg rounded cursor-move"
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Click and drag overlays to move them</li>
            <li>• Use controls on the right to customize</li>
            <li>• Click "Save" when done to download</li>
          </ul>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-80 bg-white rounded-lg shadow-lg p-4 overflow-auto max-h-[600px]">
        <h4 className="font-semibold text-gray-900 mb-4">Overlay Controls</h4>

        {!selectedOverlay && (
          <p className="text-sm text-gray-600">
            Click "Add Text" or "Add Image" to start, or select an existing overlay to edit it.
          </p>
        )}

        {/* Text Overlay Controls */}
        {showTextControls && selectedText && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-sm">Text Settings</h5>
              <button
                onClick={() => deleteOverlay(selectedText.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text</label>
              <textarea
                value={selectedText.text}
                onChange={(e) => updateTextOverlay(selectedText.id, { text: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size: {selectedText.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="200"
                value={selectedText.fontSize}
                onChange={(e) => updateTextOverlay(selectedText.id, { fontSize: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={selectedText.fontFamily}
                onChange={(e) => updateTextOverlay(selectedText.id, { fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Impact">Impact</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedText.color}
                  onChange={(e) => updateTextOverlay(selectedText.id, { color: e.target.value })}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Background</label>
                <input
                  type="color"
                  value={selectedText.backgroundColor === 'transparent' ? '#000000' : selectedText.backgroundColor}
                  onChange={(e) => updateTextOverlay(selectedText.id, { backgroundColor: e.target.value })}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateTextOverlay(selectedText.id, { backgroundColor: 'transparent' })}
                className="flex-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              >
                No Background
              </button>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedText.bold}
                  onChange={(e) => updateTextOverlay(selectedText.id, { bold: e.target.checked })}
                  className="mr-2"
                />
                Bold
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={selectedText.italic}
                  onChange={(e) => updateTextOverlay(selectedText.id, { italic: e.target.checked })}
                  className="mr-2"
                />
                Italic
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rotation: {selectedText.rotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedText.rotation}
                onChange={(e) => updateTextOverlay(selectedText.id, { rotation: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opacity: {Math.round(selectedText.opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedText.opacity}
                onChange={(e) => updateTextOverlay(selectedText.id, { opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Image Overlay Controls */}
        {showImageControls && selectedImage && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-sm">Image Settings</h5>
              <button
                onClick={() => deleteOverlay(selectedImage.id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Width: {selectedImage.width}px</label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.width}
                onChange={(e) => updateImageOverlay(selectedImage.id, { width: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Height: {selectedImage.height}px</label>
              <input
                type="range"
                min="50"
                max="1000"
                value={selectedImage.height}
                onChange={(e) => updateImageOverlay(selectedImage.id, { height: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rotation: {selectedImage.rotation}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedImage.rotation}
                onChange={(e) => updateImageOverlay(selectedImage.id, { rotation: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Opacity: {Math.round(selectedImage.opacity * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedImage.opacity}
                onChange={(e) => updateImageOverlay(selectedImage.id, { opacity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Overlay List */}
        {(textOverlays.length > 0 || imageOverlays.length > 0) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-sm mb-2">All Overlays</h5>
            <div className="space-y-2">
              {textOverlays.map(overlay => (
                <button
                  key={overlay.id}
                  onClick={() => {
                    setSelectedOverlay(overlay.id);
                    setShowTextControls(true);
                    setShowImageControls(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedOverlay === overlay.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  📝 {overlay.text.substring(0, 20)}...
                </button>
              ))}
              {imageOverlays.map(overlay => (
                <button
                  key={overlay.id}
                  onClick={() => {
                    setSelectedOverlay(overlay.id);
                    setShowImageControls(true);
                    setShowTextControls(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    selectedOverlay === overlay.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  🖼️ Image Overlay
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
