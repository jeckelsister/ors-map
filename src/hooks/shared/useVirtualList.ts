import { useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour utiliser VirtualList facilement
 */
export const useVirtualList = <T,>(items: T[]) => {
  const scrollElementRef = useRef<HTMLDivElement & { scrollToIndex?: (index: number) => void }>(null);

  const scrollToIndex = useCallback((index: number) => {
    const element = scrollElementRef.current;
    if (element && element.scrollToIndex) {
      element.scrollToIndex(index);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);

  return {
    scrollElementRef,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    totalItems: items.length,
  };
};
