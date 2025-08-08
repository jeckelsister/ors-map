import { HIKING_PROFILES } from '@/constants/hiking';
import {
  createHikingRoute,
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
    { lat: 0, lng: 0, name: 'Point A' },
    { lat: 0, lng: 0, name: 'Point B' },
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

  // Find POIs near route
  const findPOIsNearRoute = useCallback(async (route: HikingRoute) => {
    try {
      const [foundRefuges, foundWaterPoints] = await Promise.allSettled([
        findRefugesNearRoute(route.geojson, 5), // 5km radius
        findWaterPointsNearRoute(route.geojson, 2), // 2km radius
      ]);

      if (foundRefuges.status === 'fulfilled') {
        setRefuges(foundRefuges.value);
      } else {
        console.warn('Could not find refuges:', foundRefuges.reason);
      }

      if (foundWaterPoints.status === 'fulfilled') {
        setWaterPoints(foundWaterPoints.value);
      } else {
        console.warn('Could not find water points:', foundWaterPoints.reason);
      }
    } catch (error) {
      console.error('Error finding POIs:', error);
    }
  }, []);

  // Create hiking route
  const createRoute = useCallback(async () => {
    if (!hikingProfile) {
      onError?.('Veuillez sélectionner un profil de randonnée');
      return;
    }

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
        hikingProfile,
        stageCount
      );

      setCurrentRoute(route);
      onSuccess?.(route);

      // Find POIs near the route
      await findPOIsNearRoute(route);
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
    hikingProfile,
    waypoints,
    isLoop,
    stageCount,
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
    setWaypoints([
      { lat: 0, lng: 0, name: 'Point A' },
      { lat: 0, lng: 0, name: 'Point B' },
    ]);
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
