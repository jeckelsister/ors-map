import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import type {
  Coordinates,
  EnrichedPOIs,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';

import HikingMap from './HikingMap';
import type { HikingMapRef } from './HikingMap';
import RouteStatsCard from './RouteStatsCard';

interface HikingPlannerMapSectionProps {
  // Map ref
  mapRef: React.RefObject<HikingMapRef | null>;

  // Data
  currentRoute: HikingRoute | null;
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;
  waypoints: Coordinates[];

  // Visibility state
  showRefuges: boolean;
  showWaterPoints: boolean;
  showPeaks: boolean;
  showPasses: boolean;
  showViewpoints: boolean;
  showHeritage: boolean;
  showLakes: boolean;

  // Toggle functions
  onToggleRefuges: (show: boolean) => void;
  onToggleWaterPoints: (show: boolean) => void;
  onTogglePeaks: (show: boolean) => void;
  onTogglePasses: (show: boolean) => void;
  onToggleViewpoints: (show: boolean) => void;
  onToggleHeritage: (show: boolean) => void;
  onToggleLakes: (show: boolean) => void;

  // Event handlers
  onMapClick: (lat: number, lng: number) => void;
}

/**
 * Map section component containing the hiking map and route summary
 */
export default function HikingPlannerMapSection({
  mapRef,
  currentRoute,
  refuges,
  waterPoints,
  enrichedPOIs,
  waypoints,
  showRefuges,
  showWaterPoints,
  showPeaks,
  showPasses,
  showViewpoints,
  showHeritage,
  showLakes,
  onToggleRefuges,
  onToggleWaterPoints,
  onTogglePeaks,
  onTogglePasses,
  onToggleViewpoints,
  onToggleHeritage,
  onToggleLakes,
  onMapClick,
}: HikingPlannerMapSectionProps): React.JSX.Element {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Hiking Map */}
      <Card className="!p-0">
        <CardContent className="!p-0">
          <HikingMap
            ref={mapRef}
            route={currentRoute}
            refuges={refuges}
            waterPoints={waterPoints}
            enrichedPOIs={enrichedPOIs}
            showRefuges={showRefuges}
            showWaterPoints={showWaterPoints}
            showPeaks={showPeaks}
            showPasses={showPasses}
            showViewpoints={showViewpoints}
            showHeritage={showHeritage}
            showLakes={showLakes}
            onToggleRefuges={onToggleRefuges}
            onToggleWaterPoints={onToggleWaterPoints}
            onTogglePeaks={onTogglePeaks}
            onTogglePasses={onTogglePasses}
            onToggleViewpoints={onToggleViewpoints}
            onToggleHeritage={onToggleHeritage}
            onToggleLakes={onToggleLakes}
            waypoints={waypoints}
            onMapClick={onMapClick}
          />
        </CardContent>
      </Card>

      {/* Route Summary */}
      {currentRoute && <RouteStatsCard route={currentRoute} />}
    </div>
  );
}
