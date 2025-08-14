import React, { useCallback, useRef, useState } from 'react';
import ElevationProfile from '../components/hiking/ElevationProfile';
import GPXExportControls from '../components/hiking/GPXExportControls';
import HikingMap, { type HikingMapRef } from '../components/hiking/HikingMap';
import HikingProfileSelector from '../components/hiking/HikingProfileSelector';
import POIDisplayControls from '../components/hiking/POIDisplayControls';
import RouteStagesPlanner from '../components/hiking/RouteStagesPlanner';
import Navigation from '../components/shared/Navigation';
import useHikingRoute from '../hooks/hiking/useHikingRoute';
import { useToast } from '../hooks/shared/useToast';
import type { HikingProfile, Refuge, WaterPoint } from '../types/hiking';

export default function HikingPlannerPage(): React.JSX.Element {
  const { showToast } = useToast();
  const hasShownInitialToast = useRef(false);
  const pendingToastMessage = useRef<string | null>(null);
  const hikingMapRef = useRef<HikingMapRef>(null);

  // Show map integration notification on mount (only once)
  React.useEffect(() => {
    if (hasShownInitialToast.current) return;

    hasShownInitialToast.current = true;
    showToast(
      '🎯 3 cartes parfaites pour la randonnée : OSM France, OpenTopoMap & CyclOSM !',
      'success'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // showToast est stable grâce à useCallback dans useToast

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
    onError: error => showToast(error, 'error'),
    onSuccess: route =>
      showToast(
        `Itinéraire créé: ${route.totalDistance.toFixed(1)}km`,
        'success'
      ),
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
    showToast(`Refuge: ${refuge.name} (${refuge.type})`, 'info');
  };

  const handleWaterPointSelect = (waterPoint: WaterPoint) => {
    showToast(
      `Point d'eau: ${waterPoint.name} (${waterPoint.quality})`,
      'info'
    );
  };

  const handleGPXExport = (gpxContent: string, filename: string) => {
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
  };

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      try {
        // Utiliser directement les coordonnées cliquées
        const finalLat = lat;
        const finalLng = lng;

        // Logic: Premier clic = Point A, dernier clic = Point B, clics intermédiaires = étapes
        setWaypoints(prev => {
          const newWaypoints = [...prev];

          // Si c'est le premier clic et que Point A n'est pas défini
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

          // Si Point A existe mais Point B n'est pas défini
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

          // Si les deux points existent, ajouter une étape avant le point B
          if (newWaypoints.length >= 2) {
            const pointB = newWaypoints[newWaypoints.length - 1]; // Sauvegarder Point B
            const etapeNumber = newWaypoints.length - 1;

            // Insérer la nouvelle étape avant Point B
            newWaypoints[newWaypoints.length - 1] = {
              id: `waypoint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              lat: finalLat,
              lng: finalLng,
              name: `Étape ${etapeNumber}`,
            };

            // Remettre Point B à la fin
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
    <div className="min-h-screen bg-gray-100 relative">
      <Navigation />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Planificateur de randonnée
          </h1>
          <p className="text-gray-600">
            Créez des itinéraires multi-étapes avec profil altimétrique et
            export GPX
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'planning', label: 'Planning', icon: '🗺️' },
                  { id: 'profile', label: 'Profil', icon: '⛰️' },
                  { id: 'poi', label: 'POI', icon: '📍' },
                  { id: 'export', label: 'Export', icon: '📁' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      selectedTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
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
            <div className="bg-white rounded-lg p-4 shadow-sm">
              {selectedTab === 'planning' && (
                <div className="space-y-4">
                  <HikingProfileSelector
                    selectedProfile={hikingProfile?.id || null}
                    onProfileChange={handleProfileChange}
                  />

                  <RouteStagesPlanner
                    waypoints={waypoints}
                    onWaypointsChange={setWaypoints}
                    isLoop={isLoop}
                    onLoopChange={setIsLoop}
                    stageCount={stageCount}
                    onStageCountChange={setStageCount}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={createRoute}
                      disabled={isLoading || waypoints.length < 2}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Création...' : "Créer l'itinéraire"}
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
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
            {/* Sélecteur de cartes - Position optimale */}
            <div className="absolute top-4 left-4 z-50">
              <button
                onClick={() => {
                  // Déclencher l'ouverture du sélecteur via le composant HikingMap
                  const mapLayerButton = document.querySelector(
                    '[title*="Sélectionner les cartes"]'
                  ) as HTMLButtonElement;
                  if (mapLayerButton) {
                    mapLayerButton.click();
                  }
                }}
                className="bg-white hover:bg-blue-50 border-2 border-green-500 rounded-xl p-3 shadow-lg
                          transition-all duration-200 group hover:border-green-600"
                title="🗺️ Choisir les cartes de randonnée"
              >
                {/* Badge indicateur */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

                {/* Tooltip informatif */}
                <div
                  className="absolute -bottom-12 left-1/2 transform -translate-x-1/2
                               bg-gray-900 text-white text-xs px-3 py-2 rounded-lg
                               opacity-0 group-hover:opacity-100 transition-opacity duration-200
                               whitespace-nowrap pointer-events-none"
                >
                  🗺️ OSM France • OpenTopoMap • CyclOSM
                </div>

                <svg
                  className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </button>
            </div>

            {/* Hiking Map with 3 essential layers */}
            <HikingMap
              ref={hikingMapRef}
              route={currentRoute}
              refuges={refuges}
              waterPoints={waterPoints}
              showRefuges={showRefuges}
              showWaterPoints={showWaterPoints}
              waypoints={waypoints}
              onMapClick={handleMapClick}
            />

            {/* Route Summary */}
            {currentRoute && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Résumé de l'itinéraire
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentRoute.totalDistance.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">km</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{currentRoute.totalAscent}
                    </div>
                    <div className="text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      -{currentRoute.totalDescent}
                    </div>
                    <div className="text-sm text-gray-600">m</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentRoute.stages.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      étape{currentRoute.stages.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Stages Details */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">
                    Détail des étapes:
                  </h3>
                  {currentRoute.stages.map(stage => (
                    <div
                      key={stage.id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="font-medium text-sm">{stage.name}</span>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>{stage.distance.toFixed(1)}km</span>
                        <span>+{stage.ascent}m</span>
                        <span>-{stage.descent}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
