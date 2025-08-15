import { useCallback } from 'react';

interface BundleOptimizationHook {
  preloadComponent: (componentPath: string) => Promise<void>;
  prefetchRoute: (route: string) => void;
  optimizeImages: (imageSrc: string, options?: ImageOptimizationOptions) => string;
  measureBundleSize: () => BundleSizeInfo;
}

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

interface BundleSizeInfo {
  totalSize: number;
  compressedSize: number;
  chunksInfo: ChunkInfo[];
}

interface ChunkInfo {
  name: string;
  size: number;
  isAsync: boolean;
}

/**
 * Hook pour optimiser le bundle et les performances de chargement
 */
export function useBundleOptimization(): BundleOptimizationHook {
  // Component preloading with dynamic import
  const preloadComponent = useCallback(async (componentPath: string): Promise<void> => {
    try {
      // Preload component via dynamic import
      await import(/* webpackPreload: true */ componentPath);
    } catch (error) {
      console.warn(`Failed to preload component: ${componentPath}`, error);
    }
  }, []);

  // Route prefetching to improve navigation
  const prefetchRoute = useCallback((route: string): void => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }, []);

  // Image optimization with URL parameters
  const optimizeImages = useCallback((
    imageSrc: string, 
    options: ImageOptimizationOptions = {}
  ): string => {
    const { width, height, quality = 85, format } = options;
    
    // If the image is local, return directly
    if (imageSrc.startsWith('/') || imageSrc.startsWith('./')) {
      return imageSrc;
    }

    // For external URLs, add optimization parameters
    const url = new URL(imageSrc);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (format) url.searchParams.set('f', format);
    
    return url.toString();
  }, []);

  // Bundle size measurement (in development)
  const measureBundleSize = useCallback((): BundleSizeInfo => {
    if (process.env.NODE_ENV !== 'development') {
      return {
        totalSize: 0,
        compressedSize: 0,
        chunksInfo: [],
      };
    }

    // Estimation based on loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const chunks: ChunkInfo[] = scripts.map((script) => {
      const src = script.getAttribute('src') || '';
      const isAsync = script.hasAttribute('async') || script.hasAttribute('defer');
      
      return {
        name: src.split('/').pop() || 'unknown',
        size: 0, // Actual size not available client-side
        isAsync,
      };
    });

    return {
      totalSize: 0,
      compressedSize: 0,
      chunksInfo: chunks,
    };
  }, []);

  return {
    preloadComponent,
    prefetchRoute,
    optimizeImages,
    measureBundleSize,
  };
}


export function useLazyImage(src: string, options: ImageOptimizationOptions = {}) {
  const { optimizeImages } = useBundleOptimization();
  
  const optimizedSrc = optimizeImages(src, options);
  
  return {
    src: optimizedSrc,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}


export function useConditionalPreload(condition: boolean, componentPath: string) {
  const { preloadComponent } = useBundleOptimization();
  
  const preload = useCallback(() => {
    if (condition) {
      preloadComponent(componentPath);
    }
  }, [condition, componentPath, preloadComponent]);

  return preload;
}
