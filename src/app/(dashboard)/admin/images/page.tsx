// app/admin/images/page.tsx

"use client";

import { AuthGate } from "src/components/AuthGate";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "src/lib/appClient";
import { toast } from "sonner";
import { ImageType } from "src/lib/types";

const IMAGE_TYPES = [
  { value: "hero", label: "Hero Image" },
  { value: "product", label: "Product Image" },
  { value: "social", label: "Social Media" },
  { value: "ad", label: "Ad Creative" },
  { value: "email", label: "Email Header" },
  { value: "blog", label: "Blog Feature" },
  { value: "infographic", label: "Infographic" },
  { value: "comparison", label: "Comparison" },
];

export default function AdminImagesPage() {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [newImageType, setNewImageType] = useState<string>("product");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-enhanced-images"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/enhanced-images-wrong-type");
      return data;
    },
  });

  const updateImageTypeMutation = useMutation({
    mutationFn: async ({ imageId, imageType }: { imageId: number; imageType: string }) => {
      const { data } = await api.put(`/api/admin/image-type/${imageId}`, {
        image_type: imageType,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Image type updated successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update image type");
    },
  });

  const batchUpdateMutation = useMutation({
    mutationFn: async ({ imageIds, imageType }: { imageIds: number[]; imageType: string }) => {
      const { data } = await api.put(`/api/admin/batch-update-image-type`, {
        image_ids: imageIds,
        image_type: imageType,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Batch updated successfully");
      setSelectedImages([]);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to batch update");
    },
  });

  const handleSelectImage = (imageId: number) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === data.images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(data.images.map((img: any) => img.id));
    }
  };

  const handleUpdateSingle = (imageId: number) => {
    updateImageTypeMutation.mutate({
      imageId,
      imageType: newImageType,
    });
  };

  const handleBatchUpdate = () => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }
    batchUpdateMutation.mutate({
      imageIds: selectedImages,
      imageType: newImageType,
    });
  };

  return (
    <AuthGate requiredRole="admin">
      <div className="p-6 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              🖼️ Admin: Image Type Management
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Fix enhanced images that have incorrect image_type. These are premium
              seed images that were all saved as type "hero" instead of their actual
              type.
            </p>
          </div>

          {/* Controls */}
          <div className="card rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Batch Update Controls
                </h2>
                <p style={{ color: "var(--text-secondary)" }}>
                  Select images below and choose a new image_type to apply to all
                  selected images.
                </p>
              </div>
            </div>

            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <label
                  htmlFor="imageType"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  New Image Type
                </label>
                <select
                  id="imageType"
                  value={newImageType}
                  onChange={(e) => setNewImageType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--card-bg)",
                    color: "var(--text-primary)",
                  }}
                >
                  {IMAGE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSelectAll}
                className="px-6 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                {selectedImages.length === data?.images.length
                  ? "Deselect All"
                  : "Select All"}
              </button>

              <button
                onClick={handleBatchUpdate}
                disabled={
                  batchUpdateMutation.isPending || selectedImages.length === 0
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
              >
                {batchUpdateMutation.isPending
                  ? "Updating..."
                  : `Update ${selectedImages.length} Selected`}
              </button>
            </div>
          </div>

          {/* Images Grid */}
          {isLoading ? (
            <div className="card rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p style={{ color: "var(--text-secondary)" }}>
                Loading enhanced images...
              </p>
            </div>
          ) : data?.images?.length === 0 ? (
            <div className="card rounded-lg p-12 text-center">
              <p style={{ color: "var(--text-secondary)" }}>
                No enhanced images found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <p style={{ color: "var(--text-secondary)" }}>
                  Found {data.total} enhanced images that may need type correction.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.images.map((image: any) => (
                  <div
                    key={image.id}
                    className={`card rounded-lg overflow-hidden transition ${
                      selectedImages.includes(image.id)
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="relative bg-gray-100 dark:bg-gray-800 aspect-square">
                      <img
                        src={image.thumbnail_url || image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ENHANCED
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => handleSelectImage(image.id)}
                        className="absolute top-3 left-3 w-5 h-5"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
                        >
                          {image.image_type}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {image.aspect_ratio}
                        </span>
                      </div>

                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {image.prompt}
                      </p>

                      <div className="flex items-center justify-between text-xs mb-3">
                        <span
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {image.provider}
                        </span>
                        <span
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {new Date(image.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleUpdateSingle(image.id)}
                        disabled={updateImageTypeMutation.isPending}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
                      >
                        {updateImageTypeMutation.isPending
                          ? "Updating..."
                          : `Set as ${newImageType}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
