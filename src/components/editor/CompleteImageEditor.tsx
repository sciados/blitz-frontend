// src/components/editor/CompleteImageEditor.tsx
// copied from Vercel - 8vHptHjZJ

"use client";
import { useState } from "react";
import { ImageEditor } from "./ImageEditor";
import { LayerPanel } from "./LayerPanel";
import { TransformControls } from "./TransformControls";
import { ProductImageUpload } from "./ProductImageUpload";
import {
  downloadComposedImage,
  OverlayData,
} from "src/lib/editor/imageCompositor";
import { toast } from "sonner";

interface CompleteImageEditorProps {
  campaignId: number;
  seedImageUrl: string;
}

export function CompleteImageEditor({
  campaignId,
  seedImageUrl,
}: CompleteImageEditorProps) {
  const [overlays, setOverlays] = useState<OverlayData[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);
  const [showTransformControls, setShowTransformControls] = useState(false);
  const [composing, setComposing] = useState(false);

  const selectedOverlayData =
    overlays.find((o) => o.id === selectedOverlay) || null;

  const handleOverlayAdded = (overlay: OverlayData) => {
    setOverlays([...overlays, overlay]);
    setSelectedOverlay(overlay.id);
    setShowTransformControls(true);
    toast.success("Image added successfully!");
  };

  const handleOverlayUpdate = (updatedOverlay: OverlayData) => {
    setOverlays(
      overlays.map((o) => (o.id === updatedOverlay.id ? updatedOverlay : o))
    );
  };

  const handleOverlaysChange = (newOverlays: OverlayData[]) => {
    setOverlays(newOverlays);
  };

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/overlays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          image_source: "uploaded",
          position_x: 50,
          position_y: 50,
          scale: 1,
          rotation: 0,
          opacity: 1,
          z_index: overlays.length + 1,
        }),
      });

      if (response.ok) {
        const newOverlay = await response.json();
        handleOverlayAdded(newOverlay);
      }
    } catch (error) {
      console.error("Failed to add image:", error);
      toast.error("Failed to add image");
    }
  };

  const handleExport = async () => {
    if (overlays.length === 0) {
      toast.error("No images to export");
      return;
    }

    setComposing(true);
    try {
      await downloadComposedImage(
        seedImageUrl,
        overlays,
        `campaign-${campaignId}-composed.png`,
        { quality: 0.92, format: "image/png" }
      );
      toast.success("Image exported successfully!");
    } catch (error) {
      console.error("Failed to export image:", error);
      toast.error("Failed to export image");
    } finally {
      setComposing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Canvas Area */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Image Editor
            </h2>
            <div className="flex items-center space-x-2">
              {overlays.length > 0 && (
                <button
                  onClick={handleExport}
                  disabled={composing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium flex items-center space-x-2"
                >
                  {composing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>Export Image</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <ImageEditor
            campaignId={campaignId}
            seedImageUrl={seedImageUrl}
            onOverlayAdded={handleOverlayAdded}
          />

          {overlays.length === 0 && (
            <div className="mt-6">
              <ProductImageUpload
                campaignId={campaignId}
                onUploaded={handleImageUpload}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Layer Panel */}
        <LayerPanel
          campaignId={campaignId}
          overlays={overlays}
          selectedOverlay={selectedOverlay}
          onSelectOverlay={setSelectedOverlay}
          onOverlaysChange={handleOverlaysChange}
        />

        {/* Transform Controls */}
        {selectedOverlayData && (
          <TransformControls
            campaignId={campaignId}
            overlay={selectedOverlayData}
            onUpdate={handleOverlayUpdate}
            onClose={() => {
              setShowTransformControls(false);
              setSelectedOverlay(null);
            }}
          />
        )}

        {/* Quick Add Images */}
        {overlays.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Add Product Images
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload transparent PNG images of your products to add them to the
              campaign image.
            </p>
            <ProductImageUpload
              campaignId={campaignId}
              onUploaded={handleImageUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
