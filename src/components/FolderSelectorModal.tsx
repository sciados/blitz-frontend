"use client";

import { useState } from "react";

interface FolderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (path: string) => void;
  selectedCount: number;
}

const PRESET_FOLDERS = [
  {
    path: "campaignforge-storage/stock/",
    name: "Stock Images",
    description: "Global shared folder for reusable images",
    icon: "📦",
  },
  {
    path: "campaignforge-storage/backgrounds/",
    name: "Backgrounds",
    description: "Background images for editors",
    icon: "🎨",
  },
  {
    path: "campaignforge-storage/overlays/",
    name: "Overlays",
    description: "Overlay images and graphics",
    icon: "🖼️",
  },
  {
    path: "campaignforge-storage/frames/",
    name: "Frames",
    description: "Frame templates and borders",
    icon: "🖼️",
  },
  {
    path: "campaignforge-storage/icons/",
    name: "Icons",
    description: "Icon library",
    icon: "⭐",
  },
  {
    path: "campaignforge-storage/templates/",
    name: "Templates",
    description: "Template assets",
    icon: "📋",
  },
];

export function FolderSelectorModal({
  isOpen,
  onClose,
  onSelectFolder,
  selectedCount,
}: FolderSelectorModalProps) {
  const [customPath, setCustomPath] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const path = useCustom ? customPath : "";
    if (useCustom && !path.trim()) {
      alert("Please enter a folder path");
      return;
    }
    onSelectFolder(path);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Move Images
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
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

          {/* Selection Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-semibold">{selectedCount}</span> image(s)
              selected for moving
            </p>
          </div>

          {/* Preset Folders */}
          {!useCustom && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Select Destination Folder
              </h3>
              <div className="space-y-2">
                {PRESET_FOLDERS.map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => onSelectFolder(folder.path)}
                    className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{folder.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {folder.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {folder.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {folder.path}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Path Input */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Custom Folder Path
              </h3>
              <button
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                {useCustom ? "Use Preset Folders" : "Enter Custom Path"}
              </button>
            </div>

            {useCustom && (
              <div>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="campaignforge-storage/my-custom-folder/"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the full R2 path including the bucket name
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            {useCustom && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                Move Images
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
