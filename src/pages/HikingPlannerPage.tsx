import React, { useCallback, useRef } from 'react';

import type { HikingMapRef } from '../components/hiking/HikingMap';
import HikingPlannerHeader from '../components/hiking/HikingPlannerHeader';
import HikingPlannerMapSection from '../components/hiking/HikingPlannerMapSection';
import HikingPlannerSidebar from '../components/hiking/HikingPlannerSidebar';
import Navigation from '../components/shared/Navigation';
import { TOAST_MESSAGES } from '../constants/hikingPlanner';
import { useGPXHandlers } from '../hooks/hiking/useGPXHandlers';
import useHikingRoute from '../hooks/hiking/useHikingRoute';
import { useMapClickHandler } from '../hooks/hiking/useMapClickHandler';
import { usePOIHandlers } from '../hooks/hiking/usePOIHandlers';
import { useTabManagement } from '../hooks/hiking/useTabManagement';
import { useToast } from '../hooks/shared/useToast';
import type { HikingProfile } from '../types/hiking';

export default function HikingPlannerPage(): React.JSX.Element {
  const { showToast } = useToast();
  const hikingMapRef = useRef<HikingMapRef>(null);

  // Custom hooks for functionality
  const { selectedTab, setSelectedTab } = useTabManagement('planning');

  const {
    // Route planning
    hikingProfile,
    setHikingProfile,
    waypoints,
    setWaypoints,
    isLoop,
    setIsLoop,
    stageCount,
    setStageCount,

    // Route data
    currentRoute,
    refuges,
    waterPoints,
    enrichedPOIs,

    isLoading,
    showRefuges,
    setShowRefuges,
    showWaterPoints,
    setShowWaterPoints,
    showPeaks,
    setShowPeaks,
    showPasses,
    setShowPasses,
    showViewpoints,
    setShowViewpoints,
    showHeritage,
    setShowHeritage,
    showLakes,
    setShowLakes,

    // Actions
    createRoute,
    resetAll,
  } = useHikingRoute({
    onError: error => {
      const errorMessage =
        typeof error === 'string' ? error : 'Une erreur est survenue';
      showToast(errorMessage, 'error');
    },
    onSuccess: route => {
      if (route && typeof route.totalDistance === 'number') {
        showToast(TOAST_MESSAGES.ROUTE_CREATED(route.totalDistance), 'success');
      }
    },
  });

  // Custom handlers
  const poiHandlers = usePOIHandlers({ hikingMapRef, showToast });
  const gpxHandlers = useGPXHandlers({ setWaypoints, showToast });
  const { handleMapClick } = useMapClickHandler({ setWaypoints, showToast });

  // Handle reset with map clearing
  const handleReset = useCallback(() => {
    resetAll();
    // Force clear waypoints from map using ref
    setTimeout(() => {
      hikingMapRef.current?.clearWaypoints();
    }, 50);
  }, [resetAll]);

  const handleProfileChange = (profile: HikingProfile) => {
    setHikingProfile(profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <HikingPlannerHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6">
        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Control Panel - Mobile: Collapsible, Desktop: Always visible */}
          <HikingPlannerSidebar
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            waypoints={waypoints}
            onWaypointsChange={setWaypoints}
            isLoop={isLoop}
            onLoopChange={setIsLoop}
            stageCount={stageCount}
            onStageCountChange={setStageCount}
            hikingProfile={hikingProfile}
            onProfileChange={handleProfileChange}
            currentRoute={currentRoute}
            refuges={refuges}
            waterPoints={waterPoints}
            enrichedPOIs={enrichedPOIs}
            isLoading={isLoading}
            showRefuges={showRefuges}
            setShowRefuges={setShowRefuges}
            showWaterPoints={showWaterPoints}
            setShowWaterPoints={setShowWaterPoints}
            showPeaks={showPeaks}
            setShowPeaks={setShowPeaks}
            showPasses={showPasses}
            setShowPasses={setShowPasses}
            showViewpoints={showViewpoints}
            setShowViewpoints={setShowViewpoints}
            showHeritage={showHeritage}
            setShowHeritage={setShowHeritage}
            showLakes={showLakes}
            setShowLakes={setShowLakes}
            onCreateRoute={createRoute}
            onReset={handleReset}
            gpxHandlers={gpxHandlers}
            poiHandlers={poiHandlers}
          />

          {/* Map and Results */}
          <HikingPlannerMapSection
            mapRef={hikingMapRef}
            currentRoute={currentRoute}
            refuges={refuges}
            waterPoints={waterPoints}
            enrichedPOIs={enrichedPOIs}
            waypoints={waypoints}
            showRefuges={showRefuges}
            showWaterPoints={showWaterPoints}
            showPeaks={showPeaks}
            showPasses={showPasses}
            showViewpoints={showViewpoints}
            showHeritage={showHeritage}
            showLakes={showLakes}
            onToggleRefuges={setShowRefuges}
            onToggleWaterPoints={setShowWaterPoints}
            onTogglePeaks={setShowPeaks}
            onTogglePasses={setShowPasses}
            onToggleViewpoints={setShowViewpoints}
            onToggleHeritage={setShowHeritage}
            onToggleLakes={setShowLakes}
            onMapClick={handleMapClick}
          />
        </div>
      </div>
    </div>
  );
}
