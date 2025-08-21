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
import Navigation from '../components/shared/ModernNavigation';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              Planificateur de Randonnée
            </h1>
            <p className="text-muted-foreground">
              Créez des itinéraires multi-étapes avec profil altimétrique et
              export GPX
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6">
        {/* Mobile: Stack layout, Desktop: Grid layout */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Control Panel - Mobile: Collapsible, Desktop: Always visible */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
            {/* Tab Navigation */}

            <Tabs
              value={selectedTab}
              onValueChange={value =>
                setSelectedTab(value as typeof selectedTab)
              }
            >
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="planning" className="p-2">
                  <Map className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="profile" className="p-2">
                  <Mountain className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="poi" className="p-2">
                  <MapPin className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="gpx" className="p-2">
                  <Upload className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="export" className="p-2">
                  <Download className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Tab Content */}
            <Card>
              <CardContent className="p-4">
                <Tabs value={selectedTab}>
                  <TabsContent value="planning" className="space-y-4 mt-0">
                    <div>
                      <h3 className="font-semibold mb-3">
                        Configuration de l'itinéraire
                      </h3>
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
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={createRoute}
                        disabled={isLoading || waypoints.length < 2}
                        className="flex-1"
                      >
                        {isLoading ? (
                          'Création...'
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Créer l'itinéraire
                          </>
                        )}
                      </Button>

                      <Button onClick={handleReset} variant="outline">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="profile" className="mt-0">
                    <div>
                      <h3 className="font-semibold mb-3">
                        Profil altimétrique
                      </h3>
                      <ElevationProfile
                        route={currentRoute}
                        showStages={true}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="poi" className="mt-0">
                    <div>
                      <h3 className="font-semibold mb-3">Points d'intérêt</h3>
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
                    </div>
                  </TabsContent>

                  <TabsContent value="gpx" className="mt-0">
                    <div>
                      <h3 className="font-semibold mb-3">Import GPX</h3>
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
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="mt-0">
                    <div>
                      <h3 className="font-semibold mb-3">Export GPX</h3>
                      <GPXExportControls
                        route={currentRoute}
                        refuges={refuges}
                        waterPoints={waterPoints}
                        onExport={handleGPXExport}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Map and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hiking Map */}
            <Card>
              <CardContent className="p-0">
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
              </CardContent>
            </Card>

            {/* Route Summary */}
            {currentRoute && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="w-5 h-5" />
                    Résumé de l'itinéraire
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center bg-emerald-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-600">
                        {currentRoute.totalDistance
                          ? currentRoute.totalDistance.toFixed(1)
                          : '0'}
                      </div>
                      <div className="text-sm text-gray-600">km</div>
                    </div>

                    <div className="text-center bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        +{currentRoute.totalAscent || 0}
                      </div>
                      <div className="text-sm text-gray-600">m</div>
                    </div>

                    <div className="text-center bg-orange-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-orange-600">
                        -{currentRoute.totalDescent || 0}
                      </div>
                      <div className="text-sm text-gray-600">m</div>
                    </div>

                    <div className="text-center bg-blue-50 rounded-lg p-4">
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
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">
                        Détail des étapes:
                      </h4>
                      <div className="space-y-2">
                        {currentRoute.stages.map(stage => (
                          <div
                            key={stage.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium">
                              {stage.name || 'Étape'}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant="secondary">
                                {stage.distance
                                  ? stage.distance.toFixed(1)
                                  : '0'}
                                km
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-green-600"
                              >
                                +{stage.ascent || 0}m
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-orange-600"
                              >
                                -{stage.descent || 0}m
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Fab Button for quick route creation */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <Button
          onClick={createRoute}
          disabled={isLoading || waypoints.length < 2}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          ) : (
            <Rocket className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
