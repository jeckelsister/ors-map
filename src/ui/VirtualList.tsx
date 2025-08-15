import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import { usePerformanceMonitor } from '@/hooks/shared/usePerformanceOptimizations';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of additional elements to render for smooth scrolling
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Optimized Virtual List component for large lists
 * Only renders visible elements to improve performance
 */
function VirtualListInner<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  getItemKey,
}: VirtualListProps<T>, ref: React.Ref<HTMLDivElement>) {
  const { renderCount } = usePerformanceMonitor('VirtualList');
  const [scrollTop, setScrollTop] = useState(0);

  // Optimized calculations to determine visible elements
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Visible elements with memory optimization
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          key: getItemKey ? getItemKey(items[i], i) : i,
        });
      }
    }
    return result;
  }, [items, visibleRange, getItemKey]);

  // Optimized scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Total height of the list
  const totalHeight = items.length * itemHeight;

  // Offset to position visible elements correctly
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={ref}
      className={`virtual-list overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-render-count={process.env.NODE_ENV === 'development' ? renderCount : undefined}
    >
      {/* Container with total height to maintain scrollbar */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container for visible elements */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden',
              }}
              data-index={index}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component creation with forwardRef and generic handling
type VirtualListComponent = <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

const VirtualList = forwardRef(VirtualListInner) as VirtualListComponent;

export default VirtualList;
