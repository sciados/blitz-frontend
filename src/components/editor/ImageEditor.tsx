"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface ImageEditorProps {
  campaignId: number;
  seedImageUrl: string;
  onOverlayAdded?: (overlay: Overlay) => void;
}

export function ImageEditor({ campaignId, seedImageUrl, onOverlayAdded }: ImageEditorProps) {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["overlays", campaignId],
    queryFn: async () => (await api.get(`/api/campaigns/${campaignId}/overlays`)).data,
  });

  useEffect(() => {
    if (data) {
      setOverlays(data);
    }
  }, [data]);

  const handleAddOverlay = (imageUrl: string) => {
    api.post(`/api/campaigns/${campaignId}/overlays`, {
      image_url: imageUrl,
      image_source: "uploaded",
      position_x: 0.5,
      position_y: 0.5,
      scale: 1.0,
      rotation: 0,
      opacity: 1.0,
      z_index: overlays.length + 1,
    }).then((response) => {
      const newOverlay = response.data;
      setOverlays([...overlays, newOverlay]);
      setSelectedOverlay(newOverlay.id);
      onOverlayAdded?.(newOverlay);
    }).catch((error) => {
      console.error("Failed to create overlay:", error);
    });
  };

  return (
    <div className="space-y-4">
      <div
        className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        style={{ paddingBottom: "56.25%" }}
      >
        <img
          src={seedImageUrl}
          alt="Seed image"
          className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
        />

        {overlays.map((overlay) => (
          <img
            key={overlay.id}
            src={overlay.image_url}
            className={`absolute select-none cursor-move transition-all ${
              selectedOverlay === overlay.id ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              left: `${overlay.position_x}%`,
              top: `${overlay.position_y}%`,
              transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotation}deg)`,
              opacity: overlay.opacity,
              zIndex: overlay.z_index,
            }}
            onClick={() => setSelectedOverlay(overlay.id)}
          />
        ))}
      </div>

      {selectedOverlay && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Adjust Image</h3>
            <button
              onClick={() => {
                api.delete(`/api/overlays/${selectedOverlay}`).then(() => {
                  setOverlays(overlays.filter((o) => o.id !== selectedOverlay));
                  setSelectedOverlay(null);
                  refetch();
                });
              }}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Position X</label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                defaultValue="50"
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Position Y</label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full"
                defaultValue="50"
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Scale</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                className="w-full"
                defaultValue="1"
              />
            </div>
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="w-full"
                defaultValue="1"
              />
            </div>
          </div>
        </div>
      )}

      {overlays.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No product images added yet.</p>
          <p className="text-sm mt-1">Click "Add Image" in the Image Preview Modal to add product images.</p>
        </div>
      )}
    </div>
  );
}
