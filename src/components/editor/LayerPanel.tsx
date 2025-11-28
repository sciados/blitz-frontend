"use client";
import { useState } from "react";
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

interface LayerPanelProps {
  campaignId: number;
  overlays: Overlay[];
  selectedOverlay: number | null;
  onSelectOverlay: (id: number | null) => void;
  onOverlaysChange: (overlays: Overlay[]) => void;
}

export function LayerPanel({
  campaignId,
  overlays,
  selectedOverlay,
  onSelectOverlay,
  onOverlaysChange,
}: LayerPanelProps) {
  const queryClient = useQueryClient();

  const updateOverlayMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Overlay> & { id: number }) => {
      return await api.patch(`/api/overlays/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overlays", campaignId] });
    },
  });

  const deleteOverlayMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/overlays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overlays", campaignId] });
      onOverlaysChange(overlays.filter((o) => o.id !== selectedOverlay));
      onSelectOverlay(null);
    },
  });

  const moveLayerUp = (index: number) => {
    if (index === 0) return;

    const newOverlays = [...overlays];
    [newOverlays[index], newOverlays[index - 1]] = [
      newOverlays[index - 1],
      newOverlays[index],
    ];

    newOverlays.forEach((overlay, i) => {
      updateOverlayMutation.mutate({ id: overlay.id, z_index: i + 1 });
    });

    onOverlaysChange(newOverlays);
  };

  const moveLayerDown = (index: number) => {
    if (index === overlays.length - 1) return;

    const newOverlays = [...overlays];
    [newOverlays[index], newOverlays[index + 1]] = [
      newOverlays[index + 1],
      newOverlays[index],
    ];

    newOverlays.forEach((overlay, i) => {
      updateOverlayMutation.mutate({ id: overlay.id, z_index: i + 1 });
    });

    onOverlaysChange(newOverlays);
  };

  const toggleVisibility = (overlay: Overlay) => {
    const newOpacity = overlay.opacity > 0 ? 0 : 1;
    updateOverlayMutation.mutate({ id: overlay.id, opacity: newOpacity });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        Layers ({overlays.length})
      </h3>

      {overlays.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          No layers yet. Add images to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {[...overlays]
            .sort((a, b) => b.z_index - a.z_index)
            .map((overlay, index) => {
              const originalIndex = overlays.findIndex((o) => o.id === overlay.id);
              return (
                <div
                  key={overlay.id}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${
                    selectedOverlay === overlay.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
                  }`}
                  onClick={() => onSelectOverlay(overlay.id)}
                >
                  <div className="w-12 h-12 flex-shrink-0 mr-3 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={overlay.image_url}
                      alt="Layer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        Layer {overlay.z_index}
                      </p>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(overlay);
                          }}
                          className={`p-1 rounded ${
                            overlay.opacity > 0
                              ? "text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                          title={overlay.opacity > 0 ? "Hide layer" : "Show layer"}
                        >
                          {overlay.opacity > 0 ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerUp(originalIndex);
                          }}
                          disabled={originalIndex === 0}
                          className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move layer up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayerDown(originalIndex);
                          }}
                          disabled={originalIndex === overlays.length - 1}
                          className="p-1 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move layer down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this layer?")) {
                              deleteOverlayMutation.mutate(overlay.id);
                            }
                          }}
                          className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                          title="Delete layer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Scale: {overlay.scale.toFixed(1)}x</span>
                      <span className="mx-2">•</span>
                      <span>Opacity: {(overlay.opacity * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
