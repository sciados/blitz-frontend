"use client";

import { useState } from "react";
import { getSubscriptionTierFromToken, getRoleFromToken } from "src/lib/auth";

interface FolderSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (path: string) => void;
  selectedCount: number;
}

function hasStockAccess(): boolean {
  const tier = getSubscriptionTierFromToken();
  const role = getRoleFromToken();
  const userType = localStorage.getItem('user_type');

  // Admin has full access
  if (role === 'admin') {
    return true;
  }

  // Pro/Business users have access
  if (tier === 'pro' || tier === 'business') {
    return true;
  }

  // Business user type has access
  if (userType === 'business' || userType === 'admin') {
    return true;
  }

  return false;
}

function isAdmin(): boolean {
  const role = getRoleFromToken();
  return role === 'admin';
}

const PRESET_FOLDERS = [
  {
    path: "campaignforge-storage/stock/images/",
    name: "Stock Images",
    description: "Images shared with all users",
    icon: "📦",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/stock/",
    name: "Stock (General)",
    description: "Global shared folder - visible to all users",
    icon: "📦",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/backgrounds/",
    name: "Backgrounds",
    description: "Background images for editors",
    icon: "🎨",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/overlays/",
    name: "Overlays",
    description: "Overlay images and graphics",
    icon: "🖼️",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/frames/",
    name: "Frames",
    description: "Frame templates and borders",
    icon: "🖼️",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/icons/",
    name: "Icons",
    description: "Icon library",
    icon: "⭐",
    access: "All users can read",
  },
  {
    path: "campaignforge-storage/templates/",
    name: "Templates",
    description: "Template assets",
    icon: "📋",
    access: "All users can read",
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
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFolderSelect = (path: string) => {
    setSelectedFolder(path);
  };

  const handleSubmit = () => {
    const path = useCustom ? customPath : selectedFolder;
    if (useCustom && !path?.trim()) {
      alert("Please enter a folder path");
      return;
    }
    if (!useCustom && !path) {
      alert("Please select a folder");
      return;
    }
    if (path) {
      onSelectFolder(path);
    }
  };

  const handlePresetClick = (path: string) => {
    setSelectedFolder(path);
    // Auto-submit after a short delay for better UX
    setTimeout(() => {
      onSelectFolder(path);
    }, 100);
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

          {/* Access Notice */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {hasStockAccess() ? "Your Access Level" : "Upgrade Required"}
                </p>
                {hasStockAccess() ? (
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    ✓ You can add images to these shared folders (Pro/Business access)
                    <br />
                    ✗ You cannot delete from shared folders (Admin only)
                    <br />
                    All users can view and use images from these folders in editors.
                  </p>
                ) : (
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    Stock folders are only accessible to Pro and Business subscribers.
                    <br />
                    <strong>Upgrade your account</strong> to add images to shared folders.
                  </p>
                )}
              </div>
            </div>
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
                    onClick={() => handlePresetClick(folder.path)}
                    className={`w-full text-left p-4 border rounded-lg transition ${
                      selectedFolder === folder.path
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{folder.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {folder.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {folder.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {folder.path}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-green-600 dark:text-green-400">
                            ✓ Read & Add Access
                          </span>
                          {!isAdmin() && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • Admin can delete
                            </span>
                          )}
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
                  Enter the full R2 path. Only folders under <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">campaignforge-storage/users/</code> or the preset folders are allowed.
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
            {(selectedFolder || useCustom) && (
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
