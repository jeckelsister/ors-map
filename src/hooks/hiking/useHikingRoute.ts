import { useCallback, useState } from 'react';

import { HIKING_PROFILES } from '@/constants/hiking';
import {
  createHikingRoute,
  divideRouteIntoStages,
  findEnrichedPOIsNearRoute,
  findRefugesNearRoute,
  findWaterPointsNearRoute,
} from '@/services/hikingService';
import type {
  Coordinates,
  EnrichedPOIs,
  HikingProfile,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';

interface UseHikingRouteProps {
  onError?: (error: string) => void;
  onSuccess?: (route: HikingRoute) => void;
}

export default function useHikingRoute({
  onError,
  onSuccess,
}: UseHikingRouteProps = {}) {
  const [hikingProfile, setHikingProfile] = useState<HikingProfile | null>(
    HIKING_PROFILES[0]
  );
  const [waypoints, setWaypoints] = useState<Coordinates[]>([
    {
      id: `waypoint-${Date.now()}-init-a`,
      lat: 0,
      lng: 0,
      name: 'Point A',
    },
    {
      id: `waypoint-${Date.now()}-init-b`,
      lat: 0,
      lng: 0,
      name: 'Point B',
    },
  ]);
  const [isLoop, setIsLoop] = useState(false);
  const [stageCount, setStageCount] = useState(1);

  const [currentRoute, setCurrentRoute] = useState<HikingRoute | null>(null);
  const [refuges, setRefuges] = useState<Refuge[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [enrichedPOIs, setEnrichedPOIs] = useState<EnrichedPOIs>({
    peaks: [],
    passes: [],
    viewpoints: [],
    heritage: [],
    geologicalSites: [],
    lakes: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showRefuges, setShowRefuges] = useState(true);
  const [showWaterPoints, setShowWaterPoints] = useState(true);
  const [showPeaks, setShowPeaks] = useState(true);
  const [showPasses, setShowPasses] = useState(true);
  const [showViewpoints, setShowViewpoints] = useState(true);
  const [showHeritage, setShowHeritage] = useState(true);
  const [showLakes, setShowLakes] = useState(true);

  // Utility function to ensure waypoints have unique IDs
  const ensureWaypointIds = useCallback(
    (waypoints: Coordinates[]): Coordinates[] => {
      return waypoints.map((waypoint, index) => ({
        ...waypoint,
        id:
          waypoint.id ||
          `waypoint-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      }));
    },
    []
  );

  // Override setWaypoints to ensure IDs
  const setWaypointsWithIds = useCallback(
    (waypoints: Coordinates[] | ((prev: Coordinates[]) => Coordinates[])) => {
      if (typeof waypoints === 'function') {
        setWaypoints(prev => ensureWaypointIds(waypoints(prev)));
      } else {
        setWaypoints(ensureWaypointIds(waypoints));
      }
    },
    [ensureWaypointIds]
  );

  // Find POIs near route
  const findPOIsNearRoute = useCallback(
    async (route: HikingRoute) => {
      try {
        const [foundRefuges, foundWaterPoints, foundEnrichedPOIs] =
          await Promise.allSettled([
            findRefugesNearRoute(route.geojson, 2), // 2km radius - refuges proches
            findWaterPointsNearRoute(route.geojson, 1), // 1km radius - very close water points
            findEnrichedPOIsNearRoute(route.geojson), // Enriched POI with optimized distances
          ]);

        let hasErrors = false;

        if (foundRefuges.status === 'fulfilled') {
          setRefuges(foundRefuges.value);
        } else {
          console.warn('Failed to fetch refuges:', foundRefuges.reason);
          setRefuges([]); // Set empty array on failure
          hasErrors = true;
        }

        if (foundWaterPoints.status === 'fulfilled') {
          setWaterPoints(foundWaterPoints.value);
        } else {
          console.warn(
            'Failed to fetch water points:',
            foundWaterPoints.reason
          );
          setWaterPoints([]); // Set empty array on failure
          hasErrors = true;
        }

        if (foundEnrichedPOIs.status === 'fulfilled') {
          setEnrichedPOIs(foundEnrichedPOIs.value);
        } else {
          console.warn(
            'Failed to fetch enriched POIs:',
            foundEnrichedPOIs.reason
          );
          setEnrichedPOIs({
            peaks: [],
            passes: [],
            viewpoints: [],
            heritage: [],
            geologicalSites: [],
            lakes: [],
          });
          hasErrors = true;
        }

        // Notify user if there were errors loading POIs
        if (hasErrors) {
          onError?.(
            "⚠️ Certains points d'intérêt n'ont pas pu être chargés (timeout API)"
          );
        }
      } catch (error) {
        console.error('Error finding POIs:', error);
        // Set empty arrays if there's an overall error
        setRefuges([]);
        setWaterPoints([]);
        setEnrichedPOIs({
          peaks: [],
          passes: [],
          viewpoints: [],
          heritage: [],
          geologicalSites: [],
          lakes: [],
        });
        onError?.("⚠️ Impossible de charger les points d'intérêt");
      }
    },
    [onError]
  );

  // Create hiking route
  const createRoute = useCallback(async () => {
    if (waypoints.length < 2) {
      onError?.('Au moins 2 points sont nécessaires pour créer un itinéraire');
      return;
    }

    // Check if all waypoints have valid coordinates
    const invalidWaypoints = waypoints.filter(
      wp => wp.lat === 0 && wp.lng === 0
    );
    if (invalidWaypoints.length > 0) {
      onError?.('Veuillez positionner tous les points sur la carte');
      return;
    }

    setIsLoading(true);
    try {
      const route = await createHikingRoute(
        waypoints,
        isLoop,
        1, // First create a simple route
        hikingProfile // Pass the hiking profile
      );

      // If stageCount > 1, automatically divide the route
      const finalRoute =
        stageCount > 1 ? divideRouteIntoStages(route, stageCount) : route;

      setCurrentRoute(finalRoute);
      onSuccess?.(finalRoute);

      // Find POIs near the route
      await findPOIsNearRoute(finalRoute);
    } catch (error) {
      console.error('Error creating hiking route:', error);

      // Safe error message extraction
      let errorMessage = "Erreur lors de la création de l'itinéraire";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }

      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    waypoints,
    isLoop,
    stageCount,
    hikingProfile,
    onError,
    onSuccess,
    findPOIsNearRoute,
  ]);

  // Update waypoint coordinates
  const updateWaypointCoordinates = useCallback(
    (index: number, lat: number, lng: number) => {
      setWaypoints(prev => {
        const newWaypoints = [...prev];
        if (newWaypoints[index]) {
          newWaypoints[index] = { ...newWaypoints[index], lat, lng };
        }
        return newWaypoints;
      });
    },
    []
  );

  // Add new waypoint
  const addWaypoint = useCallback(
    (lat: number, lng: number, name?: string) => {
      const newWaypoint: Coordinates = {
        lat,
        lng,
        name: name || `Point ${waypoints.length + 1}`,
      };
      setWaypoints(prev => [...prev, newWaypoint]);
    },
    [waypoints.length]
  );

  // Remove waypoint
  const removeWaypoint = useCallback(
    (index: number) => {
      if (waypoints.length <= 2) return; // Keep at least 2 points

      setWaypoints(prev => prev.filter((_, i) => i !== index));
    },
    [waypoints.length]
  );

  // Clear route
  const clearRoute = useCallback(() => {
    setCurrentRoute(null);
    setRefuges([]);
    setWaterPoints([]);
    setEnrichedPOIs({
      peaks: [],
      passes: [],
      viewpoints: [],
      heritage: [],
      geologicalSites: [],
      lakes: [],
    });
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    // First clear waypoints completely to trigger cleanup
    setWaypoints([]);

    // Then set them back to initial state after a short delay
    setTimeout(() => {
      setWaypoints([
        {
          id: `waypoint-reset-${Date.now()}-a`,
          lat: 0,
          lng: 0,
          name: 'Point A',
        },
        {
          id: `waypoint-reset-${Date.now()}-b`,
          lat: 0,
          lng: 0,
          name: 'Point B',
        },
      ]);
    }, 10);

    setIsLoop(false);
    setStageCount(1);
    clearRoute();
  }, [clearRoute]);

  // Auto-create route when parameters change (debounced) - disabled for now
  // useEffect(() => {
  //   if (!currentRoute) return;

  //   const timer = setTimeout(() => {
  //     createRoute();
  //   }, 1000); // 1 second debounce

  //   return () => clearTimeout(timer);
  // }, [waypoints, isLoop, stageCount, hikingProfile, createRoute, currentRoute]);

  return {
    // Route planning
    hikingProfile,
    setHikingProfile,
    waypoints,
    setWaypoints: setWaypointsWithIds,
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
    updateWaypointCoordinates,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    resetAll,
    findPOIsNearRoute,

    // Computed values
    isRouteValid: currentRoute !== null,
    hasValidWaypoints: waypoints.every(wp => wp.lat !== 0 || wp.lng !== 0),
    totalWaypoints: waypoints.length,
  };
}
