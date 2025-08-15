import React, { useCallback, useRef, useState } from 'react';
import ElevationProfile from '../components/hiking/ElevationProfile';
import GPXExportControls from '../components/hiking/GPXExportControls';
import HikingMap, { type HikingMapRef } from '../components/hiking/HikingMap';
import POIDisplayControls from '../components/hiking/POIDisplayControls';
import RouteStagesPlanner from '../components/hiking/RouteStagesPlanner';
import Navigation from '../components/shared/Navigation';
import useHikingRoute from '../hooks/hiking/useHikingRoute';
import { useToast } from '../hooks/shared/useToast';
import type { HikingProfile, Refuge, WaterPoint } from '../types/hiking';

export default function HikingPlannerPage(): React.JSX.Element {
  const { showToast } = useToast();
  const pendingToastMessage = useRef<string | null>(null);
  const hikingMapRef = useRef<HikingMapRef>(null);

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

    // UI state
    isLoading,
    showRefuges,
    setShowRefuges,
    showWaterPoints,
    setShowWaterPoints,

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
        showToast(
          `Itinéraire créé: ${route.totalDistance.toFixed(1)}km`,
          'success'
        );
      }
    },
  });

  // Custom reset function that also clears map waypoints
  const handleReset = useCallback(() => {
    resetAll();
    // Force clear waypoints from map using ref
    setTimeout(() => {
      hikingMapRef.current?.clearWaypoints();
    }, 50);
  }, [resetAll]);

  const [selectedTab, setSelectedTab] = useState<
    'planning' | 'profile' | 'export' | 'poi'
  >('planning');

  const handleProfileChange = (profile: HikingProfile) => {
    setHikingProfile(profile);
  };

  const handleRefugeSelect = (refuge: Refuge) => {
    // Check that coordinates are valid
    if (
      !refuge.lat ||
      !refuge.lng ||
      isNaN(Number(refuge.lat)) ||
      isNaN(Number(refuge.lng))
    ) {
      showToast(
        `❌ Erreur: Coordonnées invalides pour ${refuge.name || 'ce refuge'}`,
        'error'
      );
      return;
    }

    // Zoom to the refuge on the map
    hikingMapRef.current?.zoomToPOI(refuge.lat, refuge.lng, 16);
    showToast(
      `📍 Zoom sur: ${refuge.name || 'refuge'} (${refuge.type || 'refuge'})`,
      'info'
    );
  };

  const handleWaterPointSelect = (waterPoint: WaterPoint) => {
    // Check that coordinates are valid
    if (
      !waterPoint.lat ||
      !waterPoint.lng ||
      waterPoint.lat === 0 ||
      waterPoint.lng === 0
    ) {
      showToast(
        `❌ Erreur: Coordonnées invalides pour ${waterPoint.name || "ce point d'eau"}`,
        'error'
      );
      return;
    }

    // Zoom to the water point on the map
    hikingMapRef.current?.zoomToPOI(waterPoint.lat, waterPoint.lng, 16);
    showToast(
      `📍 Zoom sur: ${waterPoint.name || "point d'eau"} (${waterPoint.quality || 'qualité inconnue'})`,
      'info'
    );
  };

  const handleGPXExport = (gpxContent: string, filename: string) => {
    try {
      // Custom export handler
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Fichier GPX téléchargé avec succès!', 'success');
    } catch (error) {
      console.error("Erreur lors de l'export GPX:", error);
      showToast('Erreur lors du téléchargement du fichier GPX', 'error');
    }
  };

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Use clicked coordinates directly
        const finalLat = lat;
        const finalLng = lng;

        // Logic: First click = Point A, last click = Point B, intermediate clicks = stages
        setWaypoints(prev => {
          const newWaypoints = [...prev];

          // If it's the first click and Point A is not defined
          if (
            newWaypoints.length === 2 &&
            newWaypoints[0].lat === 0 &&
            newWaypoints[0].lng === 0
          ) {
            // Remplacer Point A
            newWaypoints[0] = {
              ...newWaypoints[0],
              lat: finalLat,
              lng: finalLng,
              name: 'Point A',
            };
            pendingToastMessage.current = 'Point A (départ) défini';
            return newWaypoints;
          }

          // If Point A exists but Point B is not defined
          if (
            newWaypoints.length === 2 &&
            newWaypoints[1].lat === 0 &&
            newWaypoints[1].lng === 0
          ) {
            // Remplacer Point B
            newWaypoints[1] = {
              ...newWaypoints[1],
              lat: finalLat,
              lng: finalLng,
              name: 'Point B',
            };
            pendingToastMessage.current = 'Point B (arrivée) défini';
            return newWaypoints;
          }

          // If both points exist, add a stage before point B
          if (newWaypoints.length >= 2) {
            const pointB = newWaypoints[newWaypoints.length - 1]; // Save Point B
            const etapeNumber = newWaypoints.length - 1;

            // Insert the new stage before Point B
            newWaypoints[newWaypoints.length - 1] = {
              id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              lat: finalLat,
              lng: finalLng,
              name: `Étape ${etapeNumber}`,
            };

            // Put Point B back at the end
            newWaypoints.push({
              ...pointB,
              name: 'Point B',
            });

            pendingToastMessage.current = `Étape ${etapeNumber} ajoutée`;
            return newWaypoints;
          }

          return newWaypoints;
        });
      } catch (error) {
        console.error('Error in handleMapClick:', error);
        showToast('Erreur lors du placement du point', 'error');
      }
    },
    [setWaypoints, showToast]
  );

  // Effect to show pending toast messages
  React.useEffect(() => {
    if (pendingToastMessage.current) {
      showToast(pendingToastMessage.current, 'success');
      pendingToastMessage.current = null;
    }
  }, [waypoints, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 relative">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">
            Planificateur de randonnée
          </h1>
          <p className="text-emerald-100">
            Créez des itinéraires multi-étapes avec profil altimétrique et
            export GPX
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1">
                {[
                  { id: 'planning', label: 'Planning', icon: '🗺️' },
                  { id: 'profile', label: 'Profil', icon: '⛰️' },
                  { id: 'poi', label: 'POI', icon: '📍' },
                  { id: 'export', label: 'Export', icon: '📁' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedTab === tab.id
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
              {selectedTab === 'planning' && (
                <div className="space-y-4">
                  <RouteStagesPlanner
                    waypoints={waypoints}
                    onWaypointsChange={setWaypoints}
                    isLoop={isLoop}
                    onLoopChange={setIsLoop}
                    stageCount={stageCount}
                    onStageCountChange={setStageCount}
                    hikingProfile={hikingProfile}
                    onProfileChange={handleProfileChange}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={createRoute}
                      disabled={isLoading || waypoints.length < 2}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium"
                    >
                      {isLoading ? 'Création...' : "🚀 Créer l'itinéraire"}
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              )}

              {selectedTab === 'profile' && (
                <ElevationProfile route={currentRoute} showStages={true} />
              )}

              {selectedTab === 'poi' && (
                <POIDisplayControls
                  refuges={refuges}
                  waterPoints={waterPoints}
                  showRefuges={showRefuges}
                  showWaterPoints={showWaterPoints}
                  onToggleRefuges={setShowRefuges}
                  onToggleWaterPoints={setShowWaterPoints}
                  onRefugeSelect={handleRefugeSelect}
                  onWaterPointSelect={handleWaterPointSelect}
                />
              )}

              {selectedTab === 'export' && (
                <GPXExportControls
                  route={currentRoute}
                  refuges={refuges}
                  waterPoints={waterPoints}
                  onExport={handleGPXExport}
                />
              )}
            </div>
          </div>

          {/* Map and Results */}
          <div className="lg:col-span-2 space-y-6 relative">
            {/* Hiking Map with modern styling */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <HikingMap
                ref={hikingMapRef}
                route={currentRoute}
                refuges={refuges}
                waterPoints={waterPoints}
                showRefuges={showRefuges}
                showWaterPoints={showWaterPoints}
                onToggleRefuges={setShowRefuges}
                onToggleWaterPoints={setShowWaterPoints}
                waypoints={waypoints}
                onMapClick={handleMapClick}
              />
            </div>

            {/* Route Summary */}
            {currentRoute && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  📊 Résumé de l'itinéraire
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center bg-emerald-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-emerald-600">
                      {currentRoute.totalDistance
                        ? currentRoute.totalDistance.toFixed(1)
                        : '0'}
                    </div>
                    <div className="text-sm text-gray-600">km</div>
                  </div>

                  <div className="text-center bg-green-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600">
                      +{currentRoute.totalAscent || 0}
                    </div>
                    <div className="text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center bg-orange-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      -{currentRoute.totalDescent || 0}
                    </div>
                    <div className="text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center bg-blue-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentRoute.stages ? currentRoute.stages.length : 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      étape
                      {currentRoute.stages && currentRoute.stages.length > 1
                        ? 's'
                        : ''}
                    </div>
                  </div>
                </div>

                {/* Stages Details */}
                {currentRoute.stages && currentRoute.stages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700 flex items-center gap-2">
                      🗺️ Détail des étapes:
                    </h3>
                    {currentRoute.stages.map(stage => (
                      <div
                        key={stage.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="font-medium text-sm">
                          {stage.name || 'Étape'}
                        </span>
                        <div className="flex gap-3 text-xs">
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                            {stage.distance ? stage.distance.toFixed(1) : '0'}km
                          </span>
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                            +{stage.ascent || 0}m
                          </span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-medium">
                            -{stage.descent || 0}m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
