import type { GPXHandlers } from '@/hooks/hiking/useGPXHandlers';
import type { POIHandlers } from '@/hooks/hiking/usePOIHandlers';
import type { TabType } from '@/hooks/hiking/useTabManagement';
import type {
  Coordinates,
  EnrichedPOIs,
  HikingProfile,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';
import type { POIVisibilityProps } from '@/types/POIVisibility';

/**
 * Tab management configuration
 */
export interface TabManagementProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * Route planning configuration
 */
export interface RoutePlanningProps {
  waypoints: Coordinates[];
  onWaypointsChange: (waypoints: Coordinates[]) => void;
  isLoop: boolean;
  onLoopChange: (isLoop: boolean) => void;
  stageCount: number;
  onStageCountChange: (count: number) => void;
  hikingProfile?: HikingProfile | null;
  onProfileChange?: (profile: HikingProfile) => void;
}

/**
 * Route and POI data
 */
export interface RouteDataProps {
  currentRoute: HikingRoute | null;
  refuges: Refuge[];
  waterPoints: WaterPoint[];
  enrichedPOIs: EnrichedPOIs;
}

/**
 * UI state management
 */
export interface UIStateProps {
  isLoading: boolean;
}

/**
 * Action handlers
 */
export interface ActionProps {
  onCreateRoute: () => void;
  onReset: () => void;
  gpxHandlers: GPXHandlers;
  poiHandlers: POIHandlers;
}

/**
 * Consolidated props for HikingPlannerSidebar
 * Groups related props for better readability and maintainability
 */
export interface HikingPlannerSidebarProps
  extends TabManagementProps,
    RoutePlanningProps,
    RouteDataProps,
    UIStateProps,
    ActionProps,
    POIVisibilityProps {
  // All props are now grouped by functionality
}
