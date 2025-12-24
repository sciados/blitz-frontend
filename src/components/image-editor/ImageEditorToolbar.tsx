"use client";

interface ImageEditorToolbarProps {
  selectedTool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onReset: () => void;
  onDownload: () => void;
  onBack?: () => void;
  isProcessing: boolean;
}

export function ImageEditorToolbar({
  selectedTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  onReset,
  onDownload,
  onBack,
  isProcessing,
}: ImageEditorToolbarProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default: go back to selection interface by clearing URL params
      window.history.replaceState({}, "", window.location.pathname);
      window.location.reload();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Back to image selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Image Editor</h1>

          {/* Tool Selection */}
          <div className="flex gap-2">
            <button
              onClick={() => onToolChange('brush')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedTool === 'brush'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🖌️ Brush
            </button>
            <button
              onClick={() => onToolChange('eraser')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedTool === 'eraser'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🧹 Eraser
            </button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <label htmlFor="brush-size" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{brushSize}px</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}
