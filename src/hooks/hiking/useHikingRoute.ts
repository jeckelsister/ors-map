import { HIKING_PROFILES } from '@/constants/hiking';
import {
  createHikingRoute,
  divideRouteIntoStages,
  findRefugesNearRoute,
  findWaterPointsNearRoute,
} from '@/services/hikingService';
import type {
  Coordinates,
  HikingProfile,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';
import { useCallback, useState } from 'react';

interface UseHikingRouteProps {
  onError?: (error: string) => void;
  onSuccess?: (route: HikingRoute) => void;
}

export default function useHikingRoute({
  onError,
  onSuccess,
}: UseHikingRouteProps = {}) {
  // Route planning state
  const [hikingProfile, setHikingProfile] = useState<HikingProfile | null>(
    HIKING_PROFILES[0] // Default to first profile
  );
  const [waypoints, setWaypoints] = useState<Coordinates[]>([
    { 
      id: `waypoint-${Date.now()}-init-a`, 
      lat: 0, 
      lng: 0, 
      name: 'Point A' 
    },
    { 
      id: `waypoint-${Date.now()}-init-b`, 
      lat: 0, 
      lng: 0, 
      name: 'Point B' 
    },
  ]);
  const [isLoop, setIsLoop] = useState(false);
  const [stageCount, setStageCount] = useState(1);

  // Route data state
  const [currentRoute, setCurrentRoute] = useState<HikingRoute | null>(null);
  const [refuges, setRefuges] = useState<Refuge[]>([]);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showRefuges, setShowRefuges] = useState(true);
  const [showWaterPoints, setShowWaterPoints] = useState(true);

  // Utility function to ensure waypoints have unique IDs
  const ensureWaypointIds = useCallback((waypoints: Coordinates[]): Coordinates[] => {
    return waypoints.map((waypoint, index) => ({
      ...waypoint,
      id: waypoint.id || `waypoint-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  }, []);

  // Override setWaypoints to ensure IDs
  const setWaypointsWithIds = useCallback((waypoints: Coordinates[] | ((prev: Coordinates[]) => Coordinates[])) => {
    if (typeof waypoints === 'function') {
      setWaypoints(prev => ensureWaypointIds(waypoints(prev)));
    } else {
      setWaypoints(ensureWaypointIds(waypoints));
    }
  }, [ensureWaypointIds]);

  // Find POIs near route
  const findPOIsNearRoute = useCallback(async (route: HikingRoute) => {
    try {
      const [foundRefuges, foundWaterPoints] = await Promise.allSettled([
        findRefugesNearRoute(route.geojson, 2), // 2km radius - refuges proches
        findWaterPointsNearRoute(route.geojson, 1), // 1km radius - very close water points
      ]);

      if (foundRefuges.status === 'fulfilled') {
        setRefuges(foundRefuges.value);
      }

      if (foundWaterPoints.status === 'fulfilled') {
        setWaterPoints(foundWaterPoints.value);
      }
    } catch (error) {
      console.error('Error finding POIs:', error);
    }
  }, []);

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
      const finalRoute = stageCount > 1 
        ? divideRouteIntoStages(route, stageCount)
        : route;

      setCurrentRoute(finalRoute);
      onSuccess?.(finalRoute);

      // Find POIs near the route
      await findPOIsNearRoute(finalRoute);
    } catch (error) {
      console.error('Error creating hiking route:', error);
      onError?.(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'itinéraire"
      );
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
          name: 'Point A' 
        },
        { 
          id: `waypoint-reset-${Date.now()}-b`, 
          lat: 0, 
          lng: 0, 
          name: 'Point B' 
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

    // UI state
    isLoading,
    showRefuges,
    setShowRefuges,
    showWaterPoints,
    setShowWaterPoints,

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
