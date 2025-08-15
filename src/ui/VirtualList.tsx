import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import { usePerformanceMonitor } from '@/hooks/shared/usePerformanceOptimizations';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Nombre d'éléments supplémentaires à rendre pour un scrolling fluide
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Composant Virtual List optimisé pour les grandes listes
 * Rend seulement les éléments visibles pour améliorer les performances
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

  // Calculs optimisés pour déterminer les éléments visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Éléments visibles avec optimisation mémoire
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

  // Gestionnaire de scroll optimisé
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Hauteur totale de la liste
  const totalHeight = items.length * itemHeight;

  // Offset pour positionner correctement les éléments visibles
  const offsetY = visibleRange.startIndex * itemHeight;

  return (
    <div
      ref={ref}
      className={`virtual-list overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      data-render-count={process.env.NODE_ENV === 'development' ? renderCount : undefined}
    >
      {/* Container avec la hauteur totale pour maintenir la scrollbar */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container des éléments visibles */}
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

// Création du composant avec forwardRef et gestion des génériques
type VirtualListComponent = <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

const VirtualList = forwardRef(VirtualListInner) as VirtualListComponent;

export default VirtualList;
