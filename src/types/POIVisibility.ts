/**
 * Centralized type definitions for POI visibility state management
 * Improves readability by grouping related boolean flags
 */

export interface POIVisibilityState {
  showRefuges: boolean;
  showWaterPoints: boolean;
  showPeaks: boolean;
  showPasses: boolean;
  showViewpoints: boolean;
  showHeritage: boolean;
  showLakes: boolean;
}

export interface POIVisibilityActions {
  setShowRefuges: (show: boolean) => void;
  setShowWaterPoints: (show: boolean) => void;
  setShowPeaks: (show: boolean) => void;
  setShowPasses: (show: boolean) => void;
  setShowViewpoints: (show: boolean) => void;
  setShowHeritage: (show: boolean) => void;
  setShowLakes: (show: boolean) => void;
}

export interface POIVisibilityProps {
  visibility: POIVisibilityState;
  actions: POIVisibilityActions;
}

// Factory function to create default visibility state
export const createDefaultPOIVisibility = (): POIVisibilityState => ({
  showRefuges: true,
  showWaterPoints: true,
  showPeaks: true,
  showPasses: true,
  showViewpoints: true,
  showHeritage: true,
  showLakes: true,
});
