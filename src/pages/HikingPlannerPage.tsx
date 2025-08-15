import {
  Download,
  Map,
  MapPin,
  Mountain,
  Rocket,
  RotateCcw,
  Upload,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import ElevationProfile from '../components/hiking/ElevationProfile';
import GPXExportControls from '../components/hiking/GPXExportControls';
import GPXUpload from '../components/hiking/GPXUpload';
import HikingMap, { type HikingMapRef } from '../components/hiking/HikingMap';
import POIDisplayControls from '../components/hiking/POIDisplayControls';
import RouteStagesPlanner from '../components/hiking/RouteStagesPlanner';
import Navigation from '../components/shared/Navigation';
import useHikingRoute from '../hooks/hiking/useHikingRoute';
import { useToast } from '../hooks/shared/useToast';
import type {
  Coordinates,
  HikingProfile,
  Refuge,
  WaterPoint,
} from '../types/hiking';

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
    'planning' | 'profile' | 'export' | 'poi' | 'gpx'
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
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Planificateur de randonnée
          </h1>
          <p className="text-sm md:text-base text-emerald-100">
            Créez des itinéraires multi-étapes avec profil altimétrique et
            export GPX
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6">
        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Control Panel - Mobile: Collapsible, Desktop: Always visible */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
            {/* Tab Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-xl border border-white/20">
              <div className="flex flex-wrap lg:flex-nowrap gap-1 bg-gray-100 rounded-2xl p-1">
                {[
                  {
                    id: 'planning',
                    label: 'Plan',
                    icon: <Map className="w-4 h-4" />,
                  },
                  {
                    id: 'profile',
                    label: 'Profil',
                    icon: <Mountain className="w-4 h-4" />,
                  },
                  {
                    id: 'poi',
                    label: 'POI',
                    icon: <MapPin className="w-4 h-4" />,
                  },
                  {
                    id: 'gpx',
                    label: 'Import',
                    icon: <Upload className="w-4 h-4" />,
                  },
                  {
                    id: 'export',
                    label: 'Export',
                    icon: <Download className="w-4 h-4" />,
                  },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                    className={`flex-1 lg:flex-auto flex flex-col lg:flex-row items-center justify-center gap-1 px-2 lg:px-4 py-2 rounded-xl text-xs font-medium transition-all min-w-0 ${
                      selectedTab === tab.id
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-emerald-600 flex-shrink-0">
                      {tab.icon}
                    </span>
                    <span className="hidden lg:inline text-xs xl:text-sm font-medium whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-xl border border-white/20">
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

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={createRoute}
                      disabled={isLoading || waypoints.length < 2}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-medium text-sm md:text-base flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        'Création...'
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          Créer l'itinéraire
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg sm:w-auto w-full flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
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

              {selectedTab === 'gpx' && (
                <GPXUpload
                  onGPXImported={(waypoints: Coordinates[], metadata) => {
                    setWaypoints(waypoints);
                    showToast(
                      metadata?.name
                        ? `✅ ${metadata.name} importé avec ${waypoints.length} points`
                        : `✅ GPX importé avec ${waypoints.length} points`,
                      'success'
                    );
                  }}
                  onError={(error: string) => {
                    showToast(`❌ Erreur GPX: ${error}`, 'error');
                  }}
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

          {/* Map and Results - Mobile: Priority position, Desktop: Right side */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 relative order-1 lg:order-2">
            {/* Hiking Map with responsive sizing */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="h-64 sm:h-80 md:h-[60vh] lg:h-[calc(100vh-160px)] xl:h-[calc(100vh-255px)] relative">
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
            </div>

            {/* Route Summary - Responsive grid */}
            {currentRoute && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border border-white/20">
                <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  📊 Résumé de l'itinéraire
                </h2>

                {/* Stats Grid - Responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div className="text-center bg-emerald-50 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold text-emerald-600">
                      {currentRoute.totalDistance
                        ? currentRoute.totalDistance.toFixed(1)
                        : '0'}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">km</div>
                  </div>

                  <div className="text-center bg-green-50 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      +{currentRoute.totalAscent || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center bg-orange-50 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold text-orange-600">
                      -{currentRoute.totalDescent || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center bg-blue-50 rounded-xl p-3 md:p-4">
                    <div className="text-xl md:text-2xl font-bold text-blue-600">
                      {currentRoute.stages ? currentRoute.stages.length : 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      étape
                      {currentRoute.stages && currentRoute.stages.length > 1
                        ? 's'
                        : ''}
                    </div>
                  </div>
                </div>

                {/* Stages Details - Responsive */}
                {currentRoute.stages && currentRoute.stages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700 flex items-center gap-2 text-sm md:text-base">
                      🗺️ Détail des étapes:
                    </h3>
                    <div className="max-h-40 md:max-h-none overflow-y-auto space-y-2">
                      {currentRoute.stages.map(stage => (
                        <div
                          key={stage.id}
                          className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-xl gap-2"
                        >
                          <span className="font-medium text-sm md:text-base">
                            {stage.name || 'Étape'}
                          </span>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">
                              {stage.distance ? stage.distance.toFixed(1) : '0'}
                              km
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Fab Button for quick route creation */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <button
          onClick={createRoute}
          disabled={isLoading || waypoints.length < 2}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Rocket className="text-xl" />
          )}
        </button>
      </div>
    </div>
  );
}
