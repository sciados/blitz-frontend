"use client";

import { useState } from "react";

interface CropToolControlsProps {
  isProcessing: boolean;
  onApplyCrop: (dataUrl: string) => void;
}

export function CropToolControls({ isProcessing, onApplyCrop }: CropToolControlsProps) {
  const [aspectRatio, setAspectRatio] = useState<string>("free");

  const aspectRatios = [
    { name: "Free", value: "free", ratio: null },
    { name: "1:1", value: "1:1", ratio: 1 },
    { name: "4:3", value: "4:3", ratio: 4 / 3 },
    { name: "16:9", value: "16:9", ratio: 16 / 9 },
    { name: "9:16", value: "9:16", ratio: 9 / 16 },
    { name: "3:2", value: "3:2", ratio: 3 / 2 },
    { name: "2:3", value: "2:3", ratio: 2 / 3 },
  ];

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value);
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.setCropAspectRatio) {
      const selectedRatio = aspectRatios.find(r => r.value === value);
      canvasAPI.setCropAspectRatio(selectedRatio?.ratio || null);
    }
  };

  const handleApplyCrop = () => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.applyCrop) {
      const croppedDataUrl = canvasAPI.applyCrop();
      if (croppedDataUrl) {
        onApplyCrop(croppedDataUrl);
      }
    }
  };

  const handleResetCrop = () => {
    const canvasAPI = (window as any).imageEditorCanvas;
    if (canvasAPI && canvasAPI.resetCrop) {
      canvasAPI.resetCrop();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Crop & Trim
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          Click and drag on the image to select an area to crop. Use the handles to resize the selection.
        </p>
      </div>

      {/* Aspect Ratio Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => handleAspectRatioChange(ratio.value)}
              disabled={isProcessing}
              className={`px-3 py-2 text-xs border-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
                aspectRatio === ratio.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300"
              }`}
            >
              {ratio.name}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleResetCrop}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Reset
        </button>
        <button
          onClick={handleApplyCrop}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Apply Crop
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How to Crop:
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click and drag on the image to select an area</li>
          <li>• Use corner/edge handles to resize the selection</li>
          <li>• Hold Shift while dragging to maintain aspect ratio</li>
          <li>• Click "Apply Crop" to confirm your selection</li>
        </ul>
      </div>
    </div>
  );
}
