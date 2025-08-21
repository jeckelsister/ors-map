import type { Map as LeafletMap } from 'leaflet';

// Transport mode profiles for routing
export interface TransportMode {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Route response from API
export interface RouteResponse {
  type: 'FeatureCollection';
  features: RouteFeature[];
  metadata?: {
    attribution?: string;
    service?: string;
    timestamp?: number;
  };
}

export interface RouteFeature {
  type: 'Feature';
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
  type: 'LineString';
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

// Hook return types
export interface UseMapRouteReturn {
  mapRef: React.RefObject<LeafletMap | null>; // Properly typed Leaflet Map reference
  summary: RouteSummaryData | null;
  isLoading: boolean;
  error: string | null;
  removeRoute: (profile: string) => void;
  getActiveRoutes: () => string[];
  enableMapClickForStart: (
    onLocationSelect: (lat: number, lng: number) => void
  ) => void;
  disableMapClickForStart: () => void;
  clearStartMarker: () => void;
  enableMapClickForEnd: (
    onLocationSelect: (lat: number, lng: number) => void
  ) => void;
  disableMapClickForEnd: () => void;
  clearEndMarker: () => void;
  createStartMarkerFromLocation: (location: Location) => void;
  createEndMarkerFromLocation: (location: Location) => void;
}
