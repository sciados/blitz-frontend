// src/lib/backgroundRemovalService.ts
// Client-side background removal using Transformers.js + RMBG-1.4

import { pipeline, RawImage, type PipelineType } from '@huggingface/transformers';

/**
 * Background Removal Service using Transformers.js
 * Runs 100% client-side with RMBG-1.4 model
 */
class BackgroundRemovalService {
  private segmentator: PipelineType | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the RMBG-1.4 model
   * Only needs to be called once - model is cached in browser
   */
  async initialize(): Promise<void> {
    // Return existing initialization if in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Already initialized
    if (this.segmentator) {
      return Promise.resolve();
    }

    // Start initialization
    this.isInitializing = true;
    this.initPromise = this._doInitialize();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async _doInitialize(): Promise<void> {
    console.log('🚀 Loading RMBG-1.4 model...');

    try {
      // Load the image segmentation pipeline with RMBG-1.4
      this.segmentator = await pipeline(
        'image-segmentation',
        'briaai/RMBG-1.4',
        {
          // Use quantized model for smaller size (~45MB)
          quantized: true,
          // Cache model in browser
          cache_dir: './.cache/transformers',
        }
      );

      console.log('✅ RMBG-1.4 model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load RMBG-1.4 model:', error);
      this.segmentator = null;
      throw new Error('Failed to initialize background removal model');
    }
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.segmentator !== null;
  }

  /**
   * Remove background from an image
   * 
   * @param imageSource - URL, File, or Blob
   * @param options - Processing options
   * @returns Blob containing PNG with transparent background
   */
  async removeBackground(
    imageSource: string | File | Blob,
    options: {
      threshold?: number;
      maskThreshold?: number;
      outputFormat?: 'png' | 'webp';
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<Blob> {
    // Initialize if not ready
    if (!this.isReady()) {
      options.onProgress?.(10);
      await this.initialize();
    }

    if (!this.segmentator) {
      throw new Error('Background removal model not initialized');
    }

    options.onProgress?.(20);

    try {
      // Load image
      let image: RawImage;

      if (typeof imageSource === 'string') {
        // URL or data URL
        image = await RawImage.fromURL(imageSource);
      } else {
        // File or Blob
        const url = URL.createObjectURL(imageSource);
        try {
          image = await RawImage.fromURL(url);
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      options.onProgress?.(40);

      // Run segmentation
      const [result] = await this.segmentator(image, {
        threshold: options.threshold ?? 0.5,
        mask_threshold: options.maskThreshold ?? 0.5,
        overlap_mask_area_threshold: 0.8,
      });

      options.onProgress?.(70);

      // Create canvas with transparent background
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw original image
      ctx.drawImage(image.toCanvas(), 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Apply mask to alpha channel
      const maskData = await result.mask.data;

      for (let i = 0; i < maskData.length; i++) {
        // Set alpha channel based on mask
        // maskData values are 0-255
        pixels[4 * i + 3] = maskData[i];
      }

      // Put modified image data back
      ctx.putImageData(imageData, 0, 0);

      options.onProgress?.(90);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          options.outputFormat === 'webp' ? 'image/webp' : 'image/png'
        );
      });

      options.onProgress?.(100);

      return blob;
    } catch (error) {
      console.error('❌ Background removal failed:', error);
      throw error;
    }
  }

  /**
   * Remove background and return data URL
   * Convenient for React state updates
   */
  async removeBackgroundToDataURL(
    imageSource: string | File | Blob,
    options: Parameters<typeof this.removeBackground>[1] = {}
  ): Promise<string> {
    const blob = await this.removeBackground(imageSource, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Batch process multiple images
   * Processes sequentially to avoid memory issues
   */
  async removeBackgroundBatch(
    images: (string | File | Blob)[],
    options: Parameters<typeof this.removeBackground>[1] & {
      onImageComplete?: (index: number, total: number) => void;
    } = {}
  ): Promise<Blob[]> {
    // Initialize once for all images
    if (!this.isReady()) {
      await this.initialize();
    }

    const results: Blob[] = [];

    for (let i = 0; i < images.length; i++) {
      const blob = await this.removeBackground(images[i], {
        ...options,
        onProgress: (progress) => {
          // Scale progress for this image
          const overallProgress = ((i / images.length) * 100) + (progress / images.length);
          options.onProgress?.(overallProgress);
        },
      });

      results.push(blob);
      options.onImageComplete?.(i + 1, images.length);
    }

    return results;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.segmentator = null;
    console.log('🧹 Background removal service disposed');
  }
}

// Create singleton instance
export const backgroundRemovalService = new BackgroundRemovalService();

// Export types
export type { BackgroundRemovalService };
