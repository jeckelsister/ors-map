import { useCallback } from 'react';

import type { HikingMapRef } from '@/components/hiking/HikingMap';
import { MAP_CONSTANTS } from '@/constants/mapConstants';
import type {
  Heritage,
  NotableLake,
  Pass,
  Peak,
  Refuge,
  Viewpoint,
  WaterPoint,
} from '@/types/hiking';

interface UsePOIHandlersProps {
  hikingMapRef: React.RefObject<HikingMapRef | null>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface POIHandlers {
  handleRefugeSelect: (refuge: Refuge) => void;
  handleWaterPointSelect: (waterPoint: WaterPoint) => void;
  handlePeakSelect: (peak: Peak) => void;
  handlePassSelect: (pass: Pass) => void;
  handleViewpointSelect: (viewpoint: Viewpoint) => void;
  handleHeritageSelect: (heritage: Heritage) => void;
  handleLakeSelect: (lake: NotableLake) => void;
}

export type { POIHandlers };

/**
 * Custom hook to handle POI selection logic
 * Consolidates all POI selection handlers to reduce code duplication
 */
export function usePOIHandlers({
  hikingMapRef,
  showToast,
}: UsePOIHandlersProps): POIHandlers {
  // Generic POI selection handler
  const handlePOISelect = useCallback(
    (
      poi: { lat: number; lng: number; name?: string },
      icon: string,
      extraInfo?: string
    ) => {
      // Check that coordinates are valid
      if (
        !poi.lat ||
        !poi.lng ||
        isNaN(Number(poi.lat)) ||
        isNaN(Number(poi.lng)) ||
        poi.lat === 0 ||
        poi.lng === 0
      ) {
        showToast(
          `❌ Error: Invalid coordinates for ${poi.name || 'this point'}`,
          'error'
        );
        return;
      }

      // Zoom to the POI on the map
      hikingMapRef.current?.zoomToPOI(
        poi.lat,
        poi.lng,
        MAP_CONSTANTS.POI_DETAIL_ZOOM
      );

      // Show success toast with POI info
      const infoText = extraInfo ? ` (${extraInfo})` : '';
      showToast(`${icon} Zoomed to: ${poi.name || 'point'}${infoText}`, 'info');
    },
    [hikingMapRef, showToast]
  );

  const handleRefugeSelect = useCallback(
    (refuge: Refuge) => {
      handlePOISelect(refuge, '📍', refuge.type || 'refuge');
    },
    [handlePOISelect]
  );

  const handleWaterPointSelect = useCallback(
    (waterPoint: WaterPoint) => {
      handlePOISelect(
        waterPoint,
        '📍',
        waterPoint.quality || 'qualité inconnue'
      );
    },
    [handlePOISelect]
  );

  const handlePeakSelect = useCallback(
    (peak: Peak) => {
      handlePOISelect(peak, '🏔️', `${peak.elevation}m`);
    },
    [handlePOISelect]
  );

  const handlePassSelect = useCallback(
    (pass: Pass) => {
      handlePOISelect(pass, '🛤️', `${pass.elevation}m`);
    },
    [handlePOISelect]
  );

  const handleViewpointSelect = useCallback(
    (viewpoint: Viewpoint) => {
      handlePOISelect(viewpoint, '👁️', undefined);
    },
    [handlePOISelect]
  );

  const handleHeritageSelect = useCallback(
    (heritage: Heritage) => {
      handlePOISelect(heritage, '🏛️', heritage.type);
    },
    [handlePOISelect]
  );

  const handleLakeSelect = useCallback(
    (lake: NotableLake) => {
      handlePOISelect(lake, '🏞️', `${lake.elevation}m`);
    },
    [handlePOISelect]
  );

  return {
    handleRefugeSelect,
    handleWaterPointSelect,
    handlePeakSelect,
    handlePassSelect,
    handleViewpointSelect,
    handleHeritageSelect,
    handleLakeSelect,
  };
}
