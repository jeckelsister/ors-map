import type {
  Coordinates,
  EnrichedPOIs,
  HikingProfile,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';
import type {
  POIVisibilityActions,
  POIVisibilityState,
} from '@/types/POIVisibility';

/**
 * Route planning state and configuration
 */
export interface RoutePlanningState {
  hikingProfile: HikingProfile | null;
  waypoints: Coordinates[];
  isLoop: boolean;
  stageCount: number;
}

/**
 * Route planning actions
 */
export interface RoutePlanningActions {
  setHikingProfile: (profile: HikingProfile | null) => void;
  setWaypoints: (
    waypoints: Coordinates[] | ((prev: Coordinates[]) => Coordinates[])
  ) => void;
  setIsLoop: (isLoop: boolean) => void;
  setStageCount: (count: number) => void;
  updateWaypointCoordinates: (index: number, lat: number, lng: number) => void;
  addWaypoint: () => void;
  removeWaypoint: (index: number) => void;
}

/**
 * Current route data and POIs
 */
export interface RouteData {
  currentRoute: HikingRoute | null;
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;
}

/**
 * Route operations
 */
export interface RouteOperations {
  createRoute: () => Promise<void>;
  clearRoute: () => void;
  resetAll: () => void;
  findPOIsNearRoute: (route: HikingRoute) => Promise<void>;
}

/**
 * Computed values and validation
 */
export interface RouteValidation {
  isRouteValid: boolean;
  hasValidWaypoints: boolean;
  totalWaypoints: number;
  isLoading: boolean;
}

/**
 * Complete return type for useHikingRoute hook
 * Groups related functionality for better organization
 */
export interface UseHikingRouteReturn {
  // State management
  planning: RoutePlanningState;
  planningActions: RoutePlanningActions;

  // Data
  data: RouteData;

  // Operations
  operations: RouteOperations;

  // Validation and computed values
  validation: RouteValidation;

  // POI visibility (if included in this hook)
  poiVisibility?: {
    state: POIVisibilityState;
    actions: POIVisibilityActions;
  };
}
