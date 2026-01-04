"use client";
import React from "react";
import { UnifiedImage, getImageSourceInfo, isEditedImage } from "src/lib/types";

interface ImageCardProps {
  image: UnifiedImage;
  onClick?: () => void;
  onEdit?: () => void;
  selected?: boolean;
  showDetails?: boolean;
}

export function ImageCard({
  image,
  onClick,
  onEdit,
  selected = false,
  showDetails = true,
}: ImageCardProps) {
  const sourceInfo = getImageSourceInfo(image);

  return (
    <div
      className={`image-card ${selected ? "image-card--selected" : ""}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="image-card__image-wrapper">
        <img
          src={image.image_url}
          alt={
            isEditedImage(image) ? image.operation_type : (image as any).prompt
          }
          className="image-card__image"
        />

        {/* Source Badge */}
        <div
          className={`image-card__badge image-card__badge--${sourceInfo.color}`}
        >
          <span className="image-card__badge-icon">{sourceInfo.icon}</span>
          <span className="image-card__badge-text">{sourceInfo.badgeText}</span>
        </div>

        {/* Transparency Indicator */}
        {image.has_transparency && (
          <div className="image-card__transparency-badge">PNG</div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="image-card__details">
          {isEditedImage(image) ? (
            // Edited Image Details
            <>
              <p className="image-card__operation">{sourceInfo.badgeText}</p>
              {image.parent_image_id && (
                <p className="image-card__parent">
                  From: Image #{image.parent_image_id}
                </p>
              )}
              {image.processing_time_ms && (
                <p className="image-card__time">
                  {(image.processing_time_ms / 1000).toFixed(1)}s
                </p>
              )}
            </>
          ) : (
            // Generated Image Details
            <>
              <p className="image-card__model">
                {image.provider} · {image.model}
              </p>
              <p className="image-card__prompt" title={image.prompt}>
                {truncate(image.prompt, 60)}
              </p>
            </>
          )}

          <time className="image-card__date">
            {formatDate(image.created_at)}
          </time>
        </div>
      )}

      {/* Edit Button */}
      {onEdit && (
        <button
          className="image-card__edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          Edit
        </button>
      )}
    </div>
  );
}

// Helper functions
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
