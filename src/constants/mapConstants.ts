/**
 * Map-related constants for improved readability
 * All magic numbers related to map functionality should be defined here
 */

export const MAP_CONSTANTS = {
  // Zoom levels
  DEFAULT_ZOOM: 13,
  POI_DETAIL_ZOOM: 16,
  REGION_OVERVIEW_ZOOM: 10,

  // Search radiuses (in kilometers)
  REFUGE_SEARCH_RADIUS: 2,
  WATER_POINT_SEARCH_RADIUS: 1.5,
  ENRICHED_POI_SEARCH_RADIUS: 5,

  // Map bounds and limits
  MAX_WAYPOINTS: 10,
  MIN_WAYPOINTS_FOR_ROUTE: 2,

  // Performance thresholds
  MAX_POIS_TO_DISPLAY: 100,
  DEBOUNCE_DELAY_MS: 300,
} as const;

/**
 * Route calculation constants
 */
export const ROUTE_CONSTANTS = {
  // Default stage settings
  DEFAULT_STAGE_COUNT: 1,
  MAX_STAGE_COUNT: 7,

  // Estimation factors
  AVERAGE_WALKING_SPEED_KMH: 4,
  ASCENT_TIME_FACTOR: 1.5, // Additional time factor for elevation gain
  DESCENT_TIME_FACTOR: 0.8, // Time factor for elevation loss
} as const;

/**
 * UI constants for better UX
 */
export const UI_CONSTANTS = {
  // Toast display duration
  TOAST_DURATION_MS: 4000,

  // Animation durations
  SIDEBAR_ANIMATION_MS: 200,
  MAP_TRANSITION_MS: 500,

  // Responsive breakpoints (should match Tailwind)
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
} as const;
