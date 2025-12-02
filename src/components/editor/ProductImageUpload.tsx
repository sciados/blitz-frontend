// src/components/editor/ProductImageUpload.tsx
// copied from Vercel - 8vHptHjZJ

"use client";
import { useState, useRef } from "react";
import { api } from "src/lib/appClient";
import { toast } from "sonner";

interface ProductImageUploadProps {
  campaignId: number;
  onUploaded: (imageUrl: string) => void;
}

export function ProductImageUpload({
  campaignId,
  onUploaded,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/)) {
      toast.error("Please upload a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        `/api/images/upload-product-image?campaign_id=${campaignId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      onUploaded(response.data.image_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: { files: dt.files } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-gray-500 dark:text-gray-400">
        <svg
          className="mx-auto h-12 w-12"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm font-medium">
          {uploading ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP up to 10MB</p>
      </div>
    </div>
  );
}
