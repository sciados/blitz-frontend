"use client";
import React, { useState, useEffect } from "react";
import { UnifiedImage, ImageSource, EditedImage } from "src/lib/types";
import { ImageCard } from "./ImageCard";

interface ImageLibraryProps {
  campaignId: number;
  onImageSelect?: (image: UnifiedImage) => void;
  onImageEdit?: (image: UnifiedImage) => void;
}

export function ImageLibrary({
  campaignId,
  onImageSelect,
  onImageEdit,
}: ImageLibraryProps) {
  const [images, setImages] = useState<UnifiedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ImageSource>("all");
  const [transparencyFilter, setTransparencyFilter] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    loadImages();
  }, [campaignId]);

  async function loadImages() {
    setLoading(true);
    try {
      // Fetch both generated and edited images
      const [generatedRes, editedRes] = await Promise.all([
        fetch(`/api/images/campaign/${campaignId}`),
        fetch(`/api/image-editor/history/${campaignId}`),
      ]);

      const generatedData = await generatedRes.json();
      const editedData = await editedRes.json();

      // Mark generated images
      const generatedImages: UnifiedImage[] = (generatedData.images || []).map(
        (img: any) => ({
          ...img,
          source: img.source || ("generated" as ImageSource),
        })
      );

      // Mark edited images
      const editedImages: UnifiedImage[] = (editedData.edits || []).map(
        (edit: any) => ({
          ...edit,
          source: edit.source || ("edited" as ImageSource),
          image_url: edit.edited_image_path,
        })
      );

      // Combine and sort by date
      const allImages = [...generatedImages, ...editedImages].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setImages(allImages);
    } catch (error) {
      console.error("Failed to load images:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter images
  const filteredImages = images.filter((img) => {
    // Source filter
    if (filter !== "all" && img.source !== filter) return false;

    // Transparency filter
    if (
      transparencyFilter !== null &&
      img.has_transparency !== transparencyFilter
    )
      return false;

    return true;
  });

  // Count by source
  const counts = {
    all: images.length,
    generated: images.filter((i) => i.source === "generated" || !i.source)
      .length,
    edited: images.filter((i) => i.source === "edited").length,
  };

  return (
    <div className="image-library">
      {/* Filter Tabs */}
      <div className="image-library__filters">
        <div className="image-library__tabs">
          <button
            className={`tab ${filter === "all" ? "tab--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({counts.all})
          </button>
          <button
            className={`tab ${filter === "generated" ? "tab--active" : ""}`}
            onClick={() => setFilter("generated")}
          >
            🎨 Generated ({counts.generated})
          </button>
          <button
            className={`tab ${filter === "edited" ? "tab--active" : ""}`}
            onClick={() => setFilter("edited")}
          >
            ✏️ Edited ({counts.edited})
          </button>
        </div>

        {/* Transparency Filter */}
        <div className="image-library__toggle">
          <label className="toggle">
            <input
              type="checkbox"
              checked={transparencyFilter === true}
              onChange={(e) =>
                setTransparencyFilter(e.target.checked ? true : null)
              }
            />
            <span>PNG only</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="image-library__loading">Loading images...</div>
      )}

      {/* Empty State */}
      {!loading && filteredImages.length === 0 && (
        <div className="image-library__empty">
          <p>No images found</p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")}>Show all images</button>
          )}
        </div>
      )}

      {/* Image Grid */}
      {!loading && filteredImages.length > 0 && (
        <div className="image-library__grid">
          {filteredImages.map((image) => (
            <ImageCard
              key={`${image.source}-${image.id}`}
              image={image}
              onClick={() => onImageSelect?.(image)}
              onEdit={() => onImageEdit?.(image)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
