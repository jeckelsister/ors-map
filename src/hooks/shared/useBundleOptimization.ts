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
  // Préchargement des composants avec dynamic import
  const preloadComponent = useCallback(async (componentPath: string): Promise<void> => {
    try {
      // Précharger le composant via dynamic import
      await import(/* webpackPreload: true */ componentPath);
    } catch (error) {
      console.warn(`Failed to preload component: ${componentPath}`, error);
    }
  }, []);

  // Prefetch des routes pour améliorer la navigation
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

  // Optimisation des images avec paramètres d'URL
  const optimizeImages = useCallback((
    imageSrc: string, 
    options: ImageOptimizationOptions = {}
  ): string => {
    const { width, height, quality = 85, format } = options;
    
    // Si l'image est locale, retourner directement
    if (imageSrc.startsWith('/') || imageSrc.startsWith('./')) {
      return imageSrc;
    }

    // Pour les URLs externes, ajouter des paramètres d'optimisation
    const url = new URL(imageSrc);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality) url.searchParams.set('q', quality.toString());
    if (format) url.searchParams.set('f', format);
    
    return url.toString();
  }, []);

  // Mesure de la taille du bundle (en développement)
  const measureBundleSize = useCallback((): BundleSizeInfo => {
    if (process.env.NODE_ENV !== 'development') {
      return {
        totalSize: 0,
        compressedSize: 0,
        chunksInfo: [],
      };
    }

    // Estimation basée sur les scripts chargés
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const chunks: ChunkInfo[] = scripts.map((script) => {
      const src = script.getAttribute('src') || '';
      const isAsync = script.hasAttribute('async') || script.hasAttribute('defer');
      
      return {
        name: src.split('/').pop() || 'unknown',
        size: 0, // Taille réelle non disponible côté client
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

// Hook pour lazy loading d'images
export function useLazyImage(src: string, options: ImageOptimizationOptions = {}) {
  const { optimizeImages } = useBundleOptimization();
  
  const optimizedSrc = optimizeImages(src, options);
  
  return {
    src: optimizedSrc,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

// Hook pour préchargement conditionnel
export function useConditionalPreload(condition: boolean, componentPath: string) {
  const { preloadComponent } = useBundleOptimization();
  
  const preload = useCallback(() => {
    if (condition) {
      preloadComponent(componentPath);
    }
  }, [condition, componentPath, preloadComponent]);

  return preload;
}
