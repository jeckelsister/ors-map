import React from 'react';

import type { POIHandlers } from '@/hooks/hiking/usePOIHandlers';
import type { EnrichedPOIs, Refuge, WaterPoint } from '@/types/hiking';

import EnrichedPOIControls from '../EnrichedPOIControls';
import POIDisplayControls from '../POIDisplayControls';

interface POITabProps {
  // Data
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;

  // Visibility state for refuges and water points
  showRefuges: boolean;
  showWaterPoints: boolean;
  onToggleRefuges: (show: boolean) => void;
  onToggleWaterPoints: (show: boolean) => void;

  // Visibility state for enriched POIs
  showPeaks: boolean;
  showPasses: boolean;
  showViewpoints: boolean;
  showHeritage: boolean;
  showLakes: boolean;
  onTogglePeaks: (show: boolean) => void;
  onTogglePasses: (show: boolean) => void;
  onToggleViewpoints: (show: boolean) => void;
  onToggleHeritage: (show: boolean) => void;
  onToggleLakes: (show: boolean) => void;

  // Handlers
  poiHandlers: POIHandlers;
}

/**
 * POI tab content - separated for better readability
 * Manages all Points of Interest display and interaction
 */
export default function POITab({
  refuges,
  waterPoints,
  enrichedPOIs,
  showRefuges,
  showWaterPoints,
  onToggleRefuges,
  onToggleWaterPoints,
  showPeaks,
  showPasses,
  showViewpoints,
  showHeritage,
  showLakes,
  onTogglePeaks,
  onTogglePasses,
  onToggleViewpoints,
  onToggleHeritage,
  onToggleLakes,
  poiHandlers,
}: POITabProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Refuges & Water Points</h3>
        <POIDisplayControls
          refuges={refuges}
          waterPoints={waterPoints}
          showRefuges={showRefuges}
          showWaterPoints={showWaterPoints}
          onToggleRefuges={onToggleRefuges}
          onToggleWaterPoints={onToggleWaterPoints}
          onRefugeSelect={poiHandlers.handleRefugeSelect}
          onWaterPointSelect={poiHandlers.handleWaterPointSelect}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-3">Enriched Points of Interest</h3>
        <EnrichedPOIControls
          enrichedPOIs={enrichedPOIs}
          showPeaks={showPeaks}
          showPasses={showPasses}
          showViewpoints={showViewpoints}
          showHeritage={showHeritage}
          showLakes={showLakes}
          onTogglePeaks={onTogglePeaks}
          onTogglePasses={onTogglePasses}
          onToggleViewpoints={onToggleViewpoints}
          onToggleHeritage={onToggleHeritage}
          onToggleLakes={onToggleLakes}
          onPeakSelect={poiHandlers.handlePeakSelect}
          onPassSelect={poiHandlers.handlePassSelect}
          onViewpointSelect={poiHandlers.handleViewpointSelect}
          onHeritageSelect={poiHandlers.handleHeritageSelect}
          onLakeSelect={poiHandlers.handleLakeSelect}
        />
      </div>
    </div>
  );
}
