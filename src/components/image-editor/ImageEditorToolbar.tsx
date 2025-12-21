"use client";

interface ImageEditorToolbarProps {
  selectedTool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onReset: () => void;
  onDownload: () => void;
  isProcessing: boolean;
}

export function ImageEditorToolbar({
  selectedTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  onReset,
  onDownload,
  isProcessing,
}: ImageEditorToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-900">Image Editor</h1>

          {/* Tool Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => onToolChange('brush')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedTool === 'brush'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🖌️ Brush
            </button>
            <button
              onClick={() => onToolChange('eraser')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedTool === 'eraser'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <label htmlFor="brush-size" className="text-sm font-medium text-gray-700">
              Brush Size:
            </label>
            <input
              id="brush-size"
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600 w-12">{brushSize}px</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            🔄 Reset
          </button>
          <button
            onClick={onDownload}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            💾 Download
          </button>
          <button
            onClick={() => window.history.back()}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}
