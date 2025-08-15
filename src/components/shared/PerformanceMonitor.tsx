import { useState, useEffect, memo } from 'react';
import { usePerformanceMonitor } from '@/hooks/shared/usePerformanceOptimizations';
import { useMemoryOptimization, useMemoryLeakDetector } from '@/hooks/shared/useMemoryOptimization';
import { useBundleOptimization } from '@/hooks/shared/useBundleOptimization';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

interface PerformanceStats {
  renderCount: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
  chunksLoaded: number;
}

/**
 * Composant de monitoring des performances en temps réel
 * Visible uniquement en mode développement
 */
const PerformanceMonitor = memo<PerformanceMonitorProps>(({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  className = '',
}) => {
  const { renderCount } = usePerformanceMonitor('PerformanceMonitor');
  const { measureMemoryUsage } = useMemoryOptimization();
  const { measureBundleSize } = useBundleOptimization();
  
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    memoryUsage: 0,
    bundleSize: 0,
    loadTime: 0,
    chunksLoaded: 0,
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime] = useState(Date.now());

  // Détection de fuites mémoire
  useMemoryLeakDetector('PerformanceMonitor');

  // Mise à jour des statistiques
  useEffect(() => {
    if (!enabled) return;

    const updateStats = () => {
      const memoryInfo = measureMemoryUsage();
      const bundleInfo = measureBundleSize();
      
      setStats({
        renderCount,
        memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
        bundleSize: bundleInfo.totalSize,
        loadTime: Date.now() - startTime,
        chunksLoaded: bundleInfo.chunksInfo.length,
      });
    };

    // Mise à jour initiale
    updateStats();

    // Mise à jour périodique
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [enabled, renderCount, measureMemoryUsage, measureBundleSize, startTime]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${Math.round(ms / 1000)}s`;
  };

  const getMemoryColor = (usage: number): string => {
    if (usage < 50) return 'text-green-600';
    if (usage < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`
        fixed z-50 bg-black bg-opacity-90 text-white text-xs rounded-lg shadow-lg
        transition-all duration-200 font-mono
        ${positionClasses[position]}
        ${isExpanded ? 'p-3' : 'p-2'}
        ${className}
      `}
    >
      {/* Header avec toggle */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-bold">⚡ Perf</span>
        <span className={getMemoryColor(stats.memoryUsage)}>
          {stats.memoryUsage}MB
        </span>
        <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* Détails expandables */}
      {isExpanded && (
        <div className="mt-2 space-y-1 min-w-48">
          <div className="border-b border-gray-600 pb-1 mb-2">
            <span className="text-gray-400">Performance Stats</span>
          </div>
          
          <div className="flex justify-between">
            <span>Renders:</span>
            <span className="text-blue-400">{stats.renderCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className={getMemoryColor(stats.memoryUsage)}>
              {stats.memoryUsage}MB
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Load Time:</span>
            <span className="text-green-400">{formatTime(stats.loadTime)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Chunks:</span>
            <span className="text-purple-400">{stats.chunksLoaded}</span>
          </div>

          {/* Indicateurs visuels */}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs">
              <span>Memory:</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    stats.memoryUsage < 50 ? 'bg-green-500' :
                    stats.memoryUsage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (stats.memoryUsage / 200) * 100)}%` }}
                />
              </div>
              <span className="text-gray-400">200MB</span>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-2 pt-2 border-t border-gray-600 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.gc) {
                  window.gc();
                  console.warn('Manual garbage collection triggered');
                } else {
                  console.warn('Manual GC not available. Use --expose-gc flag.');
                }
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
              title="Force Garbage Collection (if --expose-gc is enabled)"
            >
              GC
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.warn('Performance stats:', stats);
              }}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
              title="Log stats to console"
            >
              Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
