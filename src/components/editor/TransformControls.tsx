"use client";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "src/lib/appClient";

interface Overlay {
  id: number;
  image_url: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  opacity: number;
  z_index: number;
}

interface TransformControlsProps {
  campaignId: number;
  overlay: Overlay;
  onUpdate: (overlay: Overlay) => void;
  onClose: () => void;
}

export function TransformControls({ campaignId, overlay, onUpdate, onClose }: TransformControlsProps) {
  const [positionX, setPositionX] = useState(overlay.position_x);
  const [positionY, setPositionY] = useState(overlay.position_y);
  const [scale, setScale] = useState(overlay.scale);
  const [rotation, setRotation] = useState(overlay.rotation);
  const [opacity, setOpacity] = useState(overlay.opacity);

  const queryClient = useQueryClient();

  const updateOverlayMutation = useMutation({
    mutationFn: async (updates: Partial<Overlay>) => {
      return await api.patch(`/api/overlays/${overlay.id}`, updates);
    },
    onSuccess: (response) => {
      const updatedOverlay = { ...overlay, ...response.data };
      onUpdate(updatedOverlay);
      queryClient.invalidateQueries({ queryKey: ["overlays", campaignId] });
    },
  });

  const handlePositionXChange = (value: number) => {
    setPositionX(value);
    updateOverlayMutation.mutate({ position_x: value });
  };

  const handlePositionYChange = (value: number) => {
    setPositionY(value);
    updateOverlayMutation.mutate({ position_y: value });
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
    updateOverlayMutation.mutate({ scale: value });
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    updateOverlayMutation.mutate({ rotation: value });
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    updateOverlayMutation.mutate({ opacity: value });
  };

  const handleReset = () => {
    setPositionX(50);
    setPositionY(50);
    setScale(1);
    setRotation(0);
    setOpacity(1);
    updateOverlayMutation.mutate({
      position_x: 50,
      position_y: 50,
      scale: 1,
      rotation: 0,
      opacity: 1,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this image?")) {
      api.delete(`/api/overlays/${overlay.id}`).then(() => {
        onClose();
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Transform Image</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Position Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Position</h4>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Horizontal (X)</label>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {positionX.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={positionX}
              onChange={(e) => handlePositionXChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Left (0%)</span>
              <span>Center (50%)</span>
              <span>Right (100%)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Vertical (Y)</label>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {positionY.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={positionY}
              onChange={(e) => handlePositionYChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Top (0%)</span>
              <span>Middle (50%)</span>
              <span>Bottom (100%)</span>
            </div>
          </div>
        </div>

        {/* Scale Control */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Scale</h4>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Size</label>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {scale.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Small (0.1x)</span>
              <span>Normal (1x)</span>
              <span>Large (3x)</span>
            </div>
          </div>
        </div>

        {/* Rotation Control */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Rotation</h4>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Angle</label>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {rotation.toFixed(0)}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotation}
              onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Left (-180°)</span>
              <span>Normal (0°)</span>
              <span>Right (180°)</span>
            </div>
          </div>
        </div>

        {/* Opacity Control */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Opacity</h4>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Transparency</label>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {(opacity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Transparent (0%)</span>
              <span>Normal (100%)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
          >
            Reset
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Delete Image
          </button>
        </div>
      </div>
    </div>
  );
}
