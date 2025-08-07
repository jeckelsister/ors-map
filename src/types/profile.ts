// Transport mode profiles for routing
export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Route response from API
export interface RouteResponse {
  features: RouteFeature[];
  metadata?: {
    attribution?: string;
    service?: string;
    timestamp?: number;
  };
}

export interface RouteFeature {
  type: "Feature";
  properties: RouteProperties;
  geometry: RouteGeometry;
}

export interface RouteProperties {
  segments: RouteSegment[];
  summary: RouteSummary;
  way_points?: number[];
}

export interface RouteSegment {
  distance: number;
  duration: number;
  steps?: RouteStep[];
}

export interface RouteStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name?: string;
  way_points: number[];
}

export interface RouteSummary {
  distance: number;
  duration: number;
}

export interface RouteGeometry {
  coordinates: [number, number][];
  type: "LineString";
}

// Location interfaces
export interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
}

// Map and route management
export interface RouteSummaryData {
  distance: string;
  duration: string;
  ascent?: number | null;
  descent?: number | null;
  elevation?: {
    ascent: number;
    descent: number;
  };
}

export interface ActiveRoutes {
  [profileId: string]: boolean;
}

export interface ElevationPoint {
  elevation: number;
  distance: number;
  lat: number;
  lng: number;
}

export interface ElevationResponse {
  geometry: {
    coordinates: [number, number, number][];
  };
}

// Hook return types
export interface UseMapRouteReturn {
  mapRef: React.RefObject<any>; // Leaflet Map reference
  summary: RouteSummaryData | null;
  isLoading: boolean;
  error: string | null;
  removeRoute: (profile: string) => void;
  getActiveRoutes: () => string[];
}

export interface UseAutocompleteReturn {
  suggestions: LocationSuggestion[];
  isLoading: boolean;
  error: string | null;
  fetchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}
