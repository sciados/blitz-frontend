// src/hooks/useBackgroundRemoval.ts
// React hook for client-side background removal

import { useState, useCallback, useEffect } from 'react';
import { backgroundRemovalService } from 'src/lib/backgroundRemovalService';

interface UseBackgroundRemovalOptions {
  autoInitialize?: boolean;
}

interface UseBackgroundRemovalReturn {
  removeBackground: (
    imageSource: string | File | Blob,
    options?: {
      onProgress?: (progress: number) => void;
    }
  ) => Promise<Blob>;
  removeBackgroundToDataURL: (
    imageSource: string | File | Blob
  ) => Promise<string>;
  isInitialized: boolean;
  isProcessing: boolean;
  progress: number;
  error: Error | null;
  initialize: () => Promise<void>;
}

/**
 * React hook for background removal using Transformers.js
 * 
 * @example
 * ```tsx
 * const { removeBackground, isProcessing, progress } = useBackgroundRemoval();
 * 
 * const handleRemove = async () => {
 *   const blob = await removeBackground(imageFile);
 *   // Use blob...
 * };
 * ```
 */
export function useBackgroundRemoval(
  options: UseBackgroundRemovalOptions = {}
): UseBackgroundRemovalReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Initialize model on mount if autoInitialize is true
  useEffect(() => {
    if (options.autoInitialize && !isInitialized) {
      initialize();
    }
  }, [options.autoInitialize]);

  const initialize = useCallback(async () => {
    if (isInitialized || backgroundRemovalService.isReady()) {
      setIsInitialized(true);
      return;
    }

    try {
      setError(null);
      await backgroundRemovalService.initialize();
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [isInitialized]);

  const removeBackground = useCallback(
    async (
      imageSource: string | File | Blob,
      opts?: { onProgress?: (progress: number) => void }
    ): Promise<Blob> => {
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const blob = await backgroundRemovalService.removeBackground(
          imageSource,
          {
            onProgress: (p) => {
              setProgress(p);
              opts?.onProgress?.(p);
            },
          }
        );

        setProgress(100);
        return blob;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const removeBackgroundToDataURL = useCallback(
    async (imageSource: string | File | Blob): Promise<string> => {
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      try {
        const dataUrl = await backgroundRemovalService.removeBackgroundToDataURL(
          imageSource,
          {
            onProgress: (p) => setProgress(p),
          }
        );

        setProgress(100);
        return dataUrl;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    removeBackground,
    removeBackgroundToDataURL,
    isInitialized,
    isProcessing,
    progress,
    error,
    initialize,
  };
}
