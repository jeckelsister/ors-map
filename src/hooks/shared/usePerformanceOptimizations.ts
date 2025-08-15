import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook pour lazy loading et code splitting
 */
export const useLazyLoading = () => {
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  
  const createLazyLoader = useCallback((
    callback: () => void,
    options: IntersectionObserverInit = {}
  ) => {
    return (element: HTMLElement | null) => {
      if (!element) return;
      
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              callback();
              intersectionObserverRef.current?.disconnect();
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options,
        }
      );
      
      intersectionObserverRef.current.observe(element);
    };
  }, []);

  useEffect(() => {
    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, []);

  return { createLazyLoader };
};

/**
 * Hook pour précharger les ressources critiques
 */
export const useResourcePreloader = () => {
  const preloadedResources = useRef(new Set<string>());
  
  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;
    
    const img = new Image();
    img.src = src;
    preloadedResources.current.add(src);
  }, []);
  
  const preloadScript = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
    preloadedResources.current.add(src);
  }, []);
  
  const preloadStyle = useCallback((href: string) => {
    if (preloadedResources.current.has(href)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
    preloadedResources.current.add(href);
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStyle,
  };
};

/**
 * Hook pour surveiller les performances en développement
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCountRef.current += 1;
      
      // Only log every 10 renders to avoid spam
      if (renderCountRef.current % 10 === 0) {
        const timeSinceMount = Date.now() - mountTimeRef.current;
        console.warn(`${componentName} rendered ${renderCountRef.current} times in ${timeSinceMount}ms`);
      }
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
};
