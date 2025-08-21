import { useCallback, useState } from 'react';

import { HIKING_PROFILES } from '@/constants/hiking';
import { MAP_CONSTANTS, ROUTE_CONSTANTS } from '@/constants/mapConstants';
import { usePOIVisibility } from '@/hooks/shared/usePOIVisibility';
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
import type {
  RouteData,
  RouteOperations,
  RoutePlanningActions,
  RoutePlanningState,
  RouteValidation,
} from '@/types/UseHikingRouteTypes';

interface UseHikingRouteProps {
  onError?: (error: string) => void;
  onSuccess?: (route: HikingRoute) => void;
}

/**
 * Enhanced hiking route management hook with improved readability
 * Groups related functionality for better organization and maintainability
 */
export default function useHikingRoute({
  onError,
  onSuccess,
}: UseHikingRouteProps = {}) {
  // Route planning state
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
  const [stageCount, setStageCount] = useState<number>(
    ROUTE_CONSTANTS.DEFAULT_STAGE_COUNT
  );

  // Route data
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

  // POI visibility management
  const poiVisibility = usePOIVisibility();

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
            findRefugesNearRoute(
              route.geojson,
              MAP_CONSTANTS.REFUGE_SEARCH_RADIUS
            ),
            findWaterPointsNearRoute(
              route.geojson,
              MAP_CONSTANTS.WATER_POINT_SEARCH_RADIUS
            ),
            findEnrichedPOIsNearRoute(route.geojson),
          ]);

        let hasErrors = false;

        if (foundRefuges.status === 'fulfilled') {
          setRefuges(foundRefuges.value);
        } else {
          console.warn('Failed to fetch refuges:', foundRefuges.reason);
          setRefuges([]);
          hasErrors = true;
        }

        if (foundWaterPoints.status === 'fulfilled') {
          setWaterPoints(foundWaterPoints.value);
        } else {
          console.warn(
            'Failed to fetch water points:',
            foundWaterPoints.reason
          );
          setWaterPoints([]);
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

        if (hasErrors && onError) {
          onError('Some POIs could not be loaded. Check console for details.');
        }
      } catch (error) {
        console.error('Error finding POIs near route:', error);
        if (onError) {
          onError('Failed to find POIs near route');
        }
      }
    },
    [onError]
  );

  // Create route
  const createRoute = useCallback(async () => {
    const validWaypoints = waypoints.filter(wp => wp.lat !== 0 && wp.lng !== 0);

    if (validWaypoints.length < MAP_CONSTANTS.MIN_WAYPOINTS_FOR_ROUTE) {
      if (onError) {
        onError(
          `Please add at least ${MAP_CONSTANTS.MIN_WAYPOINTS_FOR_ROUTE} valid waypoints`
        );
      }
      return;
    }

    if (!hikingProfile) {
      if (onError) {
        onError('Please select a hiking profile');
      }
      return;
    }

    setIsLoading(true);

    try {
      const route = await createHikingRoute(
        validWaypoints,
        isLoop,
        stageCount,
        hikingProfile
      );
      const routeWithStages = divideRouteIntoStages(route, stageCount);

      setCurrentRoute(routeWithStages);
      await findPOIsNearRoute(routeWithStages);

      if (onSuccess) {
        onSuccess(routeWithStages);
      }
    } catch (error) {
      console.error('Error creating route:', error);
      if (onError) {
        onError(
          error instanceof Error ? error.message : 'Failed to create route'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    waypoints,
    hikingProfile,
    isLoop,
    stageCount,
    onError,
    onSuccess,
    findPOIsNearRoute,
  ]);

  // Other route operations
  const updateWaypointCoordinates = useCallback(
    (index: number, lat: number, lng: number) => {
      setWaypoints(prev =>
        prev.map((wp, i) => (i === index ? { ...wp, lat, lng } : wp))
      );
    },
    []
  );

  const addWaypoint = useCallback(() => {
    if (waypoints.length >= MAP_CONSTANTS.MAX_WAYPOINTS) {
      if (onError) {
        onError(`Maximum ${MAP_CONSTANTS.MAX_WAYPOINTS} waypoints allowed`);
      }
      return;
    }

    const newWaypoint: Coordinates = {
      id: `waypoint-${Date.now()}-${waypoints.length}`,
      lat: 0,
      lng: 0,
      name: `Point ${String.fromCharCode(65 + waypoints.length)}`,
    };
    setWaypoints(prev => [...prev, newWaypoint]);
  }, [waypoints.length, onError]);

  const removeWaypoint = useCallback(
    (index: number) => {
      if (waypoints.length <= MAP_CONSTANTS.MIN_WAYPOINTS_FOR_ROUTE) {
        if (onError) {
          onError(
            `Minimum ${MAP_CONSTANTS.MIN_WAYPOINTS_FOR_ROUTE} waypoints required`
          );
        }
        return;
      }
      setWaypoints(prev => prev.filter((_, i) => i !== index));
    },
    [waypoints.length, onError]
  );

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

  const resetAll = useCallback(() => {
    setTimeout(() => {
      setWaypoints([
        {
          id: `waypoint-${Date.now()}-reset-a`,
          lat: 0,
          lng: 0,
          name: 'Point A',
        },
        {
          id: `waypoint-${Date.now()}-reset-b`,
          lat: 0,
          lng: 0,
          name: 'Point B',
        },
      ]);
    }, 10);

    setIsLoop(false);
    setStageCount(ROUTE_CONSTANTS.DEFAULT_STAGE_COUNT);
    clearRoute();
  }, [clearRoute]);

  // Group return values by functionality
  const planning: RoutePlanningState = {
    hikingProfile,
    waypoints,
    isLoop,
    stageCount,
  };

  const planningActions: RoutePlanningActions = {
    setHikingProfile,
    setWaypoints: setWaypointsWithIds,
    setIsLoop,
    setStageCount: setStageCount,
    updateWaypointCoordinates,
    addWaypoint,
    removeWaypoint,
  };

  const data: RouteData = {
    currentRoute,
    refuges,
    waterPoints,
    enrichedPOIs,
  };

  const operations: RouteOperations = {
    createRoute,
    clearRoute,
    resetAll,
    findPOIsNearRoute,
  };

  const validation: RouteValidation = {
    isRouteValid: currentRoute !== null,
    hasValidWaypoints: waypoints.every(wp => wp.lat !== 0 || wp.lng !== 0),
    totalWaypoints: waypoints.length,
    isLoading,
  };

  return {
    // Grouped structure for new components (improved readability)
    planning,
    planningActions,
    data,
    operations,
    validation,
    poiVisibility: {
      state: poiVisibility.visibility,
      actions: poiVisibility.actions,
    },

    // Legacy flat structure for backward compatibility
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

    // POI visibility (legacy flat structure)
    showRefuges: poiVisibility.visibility.showRefuges,
    setShowRefuges: poiVisibility.actions.setShowRefuges,
    showWaterPoints: poiVisibility.visibility.showWaterPoints,
    setShowWaterPoints: poiVisibility.actions.setShowWaterPoints,
    showPeaks: poiVisibility.visibility.showPeaks,
    setShowPeaks: poiVisibility.actions.setShowPeaks,
    showPasses: poiVisibility.visibility.showPasses,
    setShowPasses: poiVisibility.actions.setShowPasses,
    showViewpoints: poiVisibility.visibility.showViewpoints,
    setShowViewpoints: poiVisibility.actions.setShowViewpoints,
    showHeritage: poiVisibility.visibility.showHeritage,
    setShowHeritage: poiVisibility.actions.setShowHeritage,
    showLakes: poiVisibility.visibility.showLakes,
    setShowLakes: poiVisibility.actions.setShowLakes,

    // Actions (legacy)
    createRoute,
    updateWaypointCoordinates,
    addWaypoint,
    removeWaypoint,
    clearRoute,
    resetAll,
    findPOIsNearRoute,

    // Computed values (legacy)
    isRouteValid: currentRoute !== null,
    hasValidWaypoints: waypoints.every(wp => wp.lat !== 0 || wp.lng !== 0),
    totalWaypoints: waypoints.length,
  };
}
