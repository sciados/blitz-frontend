/**
 * Image Compositor Utility
 *
 * This utility composes a base seed image with multiple overlay images
 * to create a final composite image using HTML5 Canvas.
 */

export interface OverlayData {
  id: number;
  image_url: string;
  position_x: number;
  position_y: number;
  scale: number;
  rotation: number;
  opacity: number;
  z_index: number;
}

export interface CompositorOptions {
  quality?: number;
  format?: "image/png" | "image/jpeg" | "image/webp";
  maxWidth?: number;
  maxHeight?: number;
}

export class ImageCompositor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    this.ctx = context;
  }

  /**
   * Load an image from a URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Calculate canvas dimensions based on seed image and overlays
   */
  private calculateDimensions(
    seedImage: HTMLImageElement,
    overlays: OverlayData[]
  ): { width: number; height: number } {
    const baseWidth = seedImage.width;
    const baseHeight = seedImage.height;

    let maxWidth = baseWidth;
    let maxHeight = baseHeight;

    // Check all overlays for any that might extend beyond base
    overlays.forEach((overlay) => {
      const overlayImg = new Image();
      overlayImg.src = overlay.image_url;

      const overlayWidth = overlayImg.width * overlay.scale;
      const overlayHeight = overlayImg.height * overlay.scale;

      const x = (overlay.position_x / 100) * baseWidth;
      const y = (overlay.position_y / 100) * baseHeight;

      const rightEdge = x + overlayWidth / 2;
      const bottomEdge = y + overlayHeight / 2;

      maxWidth = Math.max(maxWidth, rightEdge * 2);
      maxHeight = Math.max(maxHeight, bottomEdge * 2);
    });

    return { width: Math.round(maxWidth), height: Math.round(maxHeight) };
  }

  /**
   * Draw a single overlay on the canvas
   */
  private drawOverlay(
    ctx: CanvasRenderingContext2D,
    overlay: OverlayData,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadImage(overlay.image_url)
        .then((img) => {
          ctx.save();

          // Calculate position (convert percentage to pixels)
          const x = (overlay.position_x / 100) * canvasWidth;
          const y = (overlay.position_y / 100) * canvasHeight;

          // Calculate scaled dimensions
          const scaledWidth = img.width * overlay.scale;
          const scaledHeight = img.height * overlay.scale;

          // Apply transformations
          ctx.globalAlpha = overlay.opacity;
          ctx.translate(x, y);
          ctx.rotate((overlay.rotation * Math.PI) / 180);

          // Draw the image (centered at origin)
          ctx.drawImage(
            img,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );

          ctx.restore();
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Compose the final image
   */
  async compose(
    seedImageUrl: string,
    overlays: OverlayData[],
    options: CompositorOptions = {}
  ): Promise<Blob> {
    const { quality = 0.92, format = "image/png" } = options;

    try {
      // Load the seed image
      const seedImage = await this.loadImage(seedImageUrl);

      // Calculate canvas dimensions
      const { width, height } = this.calculateDimensions(seedImage, overlays);
      this.canvas.width = width;
      this.canvas.height = height;

      // Clear canvas
      this.ctx.clearRect(0, 0, width, height);

      // Draw seed image as background
      this.ctx.drawImage(seedImage, 0, 0, width, height);

      // Sort overlays by z_index (ascending - lower z_index drawn first)
      const sortedOverlays = [...overlays].sort((a, b) => a.z_index - b.z_index);

      // Draw each overlay
      for (const overlay of sortedOverlays) {
        if (overlay.opacity > 0) {
          await this.drawOverlay(this.ctx, overlay, width, height);
        }
      }

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create image blob"));
            }
          },
          format,
          quality
        );
      });
    } catch (error) {
      throw new Error(`Failed to compose image: ${error}`);
    }
  }

  /**
   * Get the composited image as a data URL
   */
  async composeToDataURL(
    seedImageUrl: string,
    overlays: OverlayData[],
    options: CompositorOptions = {}
  ): Promise<string> {
    const blob = await this.compose(seedImageUrl, overlays, options);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Download the composed image
   */
  async download(
    seedImageUrl: string,
    overlays: OverlayData[],
    filename: string = "composed-image.png",
    options: CompositorOptions = {}
  ): Promise<void> {
    const blob = await this.compose(seedImageUrl, overlays, options);
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Upload the composed image to server
   */
  async uploadToServer(
    seedImageUrl: string,
    overlays: OverlayData[],
    endpoint: string,
    options: CompositorOptions = {}
  ): Promise<{ url: string }> {
    const blob = await this.compose(seedImageUrl, overlays, options);

    const formData = new FormData();
    formData.append("file", blob, "composed-image.png");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return response.json();
  }
}

/**
 * Convenience function to compose an image
 */
export async function composeImage(
  seedImageUrl: string,
  overlays: OverlayData[],
  options?: CompositorOptions
): Promise<Blob> {
  const compositor = new ImageCompositor();
  return compositor.compose(seedImageUrl, overlays, options);
}

/**
 * Convenience function to download a composed image
 */
export async function downloadComposedImage(
  seedImageUrl: string,
  overlays: OverlayData[],
  filename?: string,
  options?: CompositorOptions
): Promise<void> {
  const compositor = new ImageCompositor();
  return compositor.download(seedImageUrl, overlays, filename, options);
}
