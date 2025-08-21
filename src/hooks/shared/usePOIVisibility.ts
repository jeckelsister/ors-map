import { useCallback, useState } from 'react';

import type {
  POIVisibilityActions,
  POIVisibilityState,
} from '@/types/POIVisibility';

/**
 * Custom hook to manage POI visibility state in a more readable way
 * Groups all show/setShow boolean flags into structured objects
 */
export function usePOIVisibility() {
  const [visibility, setVisibilityState] = useState<POIVisibilityState>({
    showRefuges: true,
    showWaterPoints: true,
    showPeaks: true,
    showPasses: true,
    showViewpoints: true,
    showHeritage: true,
    showLakes: true,
  });

  // Create setter functions that update the grouped state
  const actions: POIVisibilityActions = {
    setShowRefuges: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showRefuges: show })),
      []
    ),
    setShowWaterPoints: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showWaterPoints: show })),
      []
    ),
    setShowPeaks: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showPeaks: show })),
      []
    ),
    setShowPasses: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showPasses: show })),
      []
    ),
    setShowViewpoints: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showViewpoints: show })),
      []
    ),
    setShowHeritage: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showHeritage: show })),
      []
    ),
    setShowLakes: useCallback(
      (show: boolean) =>
        setVisibilityState(prev => ({ ...prev, showLakes: show })),
      []
    ),
  };

  // Utility function to toggle all POIs at once
  const toggleAll = useCallback((show: boolean) => {
    setVisibilityState({
      showRefuges: show,
      showWaterPoints: show,
      showPeaks: show,
      showPasses: show,
      showViewpoints: show,
      showHeritage: show,
      showLakes: show,
    });
  }, []);

  return {
    visibility,
    actions,
    toggleAll,
  };
}
