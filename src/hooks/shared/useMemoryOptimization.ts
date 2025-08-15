import { useCallback, useRef, useEffect } from 'react';

interface MemoryOptimizationHook {
  createWeakCache: <K extends object, V>() => WeakMap<K, V>;
  cleanupOnUnmount: (cleanup: () => void) => void;
  measureMemoryUsage: () => MemoryInfo | null;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Hook pour optimiser l'utilisation mémoire et réduire les fuites
 */
export function useMemoryOptimization(): MemoryOptimizationHook {
  const cleanupFunctions = useRef<Set<() => void>>(new Set());

  // WeakMap cache to avoid memory leaks
  const createWeakCache = useCallback(<K extends object, V>(): WeakMap<K, V> => {
    return new WeakMap<K, V>();
  }, []);

  // Register cleanup functions
  const cleanupOnUnmount = useCallback((cleanup: () => void): void => {
    cleanupFunctions.current.add(cleanup);
  }, []);

  // Memory usage measurement (if available)
  const measureMemoryUsage = useCallback((): MemoryInfo | null => {
    const perf = performance as PerformanceWithMemory;
    if ('memory' in perf && perf.memory) {
      return perf.memory;
    }
    return null;
  }, []);

  // Automatic cleanup on unmount
  useEffect(() => {
    const cleanupSet = cleanupFunctions.current;
    return () => {
      cleanupSet.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
      });
      cleanupSet.clear();
    };
  }, []);

  return {
    createWeakCache,
    cleanupOnUnmount,
    measureMemoryUsage,
  };
}

// Hook to observe memory leaks
export function useMemoryLeakDetector(componentName: string) {
  const { measureMemoryUsage, cleanupOnUnmount } = useMemoryOptimization();
  const initialMemory = useRef<MemoryInfo | null>(null);
  const maxMemoryIncrease = useRef<number>(0);

  useEffect(() => {
    initialMemory.current = measureMemoryUsage();
    
    const interval = setInterval(() => {
      const currentMemory = measureMemoryUsage();
      if (initialMemory.current && currentMemory) {
        const increase = currentMemory.usedJSHeapSize - initialMemory.current.usedJSHeapSize;
        maxMemoryIncrease.current = Math.max(maxMemoryIncrease.current, increase);
        
        // Warning if excessive memory increase
        if (increase > 50 * 1024 * 1024) { // 50MB
          console.warn(
            `Potential memory leak in ${componentName}: ${Math.round(increase / 1024 / 1024)}MB increase`
          );
        }
      }
    }, 5000);

    cleanupOnUnmount(() => {
      clearInterval(interval);
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `${componentName} max memory increase: ${Math.round(maxMemoryIncrease.current / 1024 / 1024)}MB`
        );
      }
    });

    return () => clearInterval(interval);
  }, [componentName, measureMemoryUsage, cleanupOnUnmount]);
}

// Hook to optimize data lists
export function useOptimizedList<T extends object>(
  items: T[],
  getItemId: (item: T) => string | number,
  maxItems?: number
) {
  const { createWeakCache } = useMemoryOptimization();
  const itemCache = useRef(createWeakCache<T, string | number>());
  const prevItems = useRef<T[]>(items);
  const optimizedItems = useRef<T[]>(items);

  // Item optimization with cache and limitation
  const shouldUpdate = items.length !== prevItems.current.length ||
    items.some((item, index) => {
      const prevItem = prevItems.current[index];
      return !prevItem || getItemId(item) !== getItemId(prevItem);
    });

  if (shouldUpdate) {
    optimizedItems.current = maxItems ? items.slice(0, maxItems) : items;
    prevItems.current = items;
  }

  // Cache IDs to avoid recalculations
  const getOptimizedItemId = useCallback((item: T): string | number => {
    if (itemCache.current.has(item)) {
      return itemCache.current.get(item)!;
    }
    
    const id = getItemId(item);
    itemCache.current.set(item, id);
    return id;
  }, [getItemId]);

  return {
    items: optimizedItems.current,
    getItemId: getOptimizedItemId,
    totalItems: items.length,
    isLimited: maxItems ? items.length > maxItems : false,
  };
}
