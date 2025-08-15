export interface HikingProfile {
  id: string;
  name: string;
  description: string;
  color: string;
  preferences: PathPreferences;
}

export interface PathPreferences {
  preferOfficial: boolean; // GR, HRP, etc.
  allowUnofficial: boolean; // Sentiers non-officiels
  noPreference: boolean; // No preference
}

export interface HikingRoute {
  id: string;
  name: string;
  type: 'point-to-point' | 'loop';
  stages: RouteStage[];
  totalDistance: number; // km
  totalAscent: number; // m
  totalDescent: number; // m
  minElevation: number; // m
  maxElevation: number; // m
  geojson: GeoJSON.FeatureCollection;
}

export interface RouteStage {
  id: string;
  name: string;
  startPoint: Coordinates;
  endPoint: Coordinates;
  distance: number; // km
  ascent: number; // m
  descent: number; // m
  estimatedTime: number; // minutes
  elevationProfile: ElevationPoint[];
  geojson: GeoJSON.FeatureCollection;
}

export interface Coordinates {
  id?: string;
  lat: number;
  lng: number;
  name?: string;
}

export interface ElevationPoint {
  distance: number; // km from start
  elevation: number; // m
  lat: number;
  lng: number;
}

export interface Refuge {
  id: string;
  name: string;
  type: 'gardé' | 'libre' | 'bivouac';
  lat: number;
  lng: number;
  elevation: number;
  capacity?: number;
  open_season?: string;
  contact?: string;
  services: RefugeService[];
}

export interface RefugeService {
  type: 'meals' | 'shower' | 'wifi' | 'shop' | 'first_aid';
  available: boolean;
  description?: string;
}

export interface WaterPoint {
  id: string;
  name: string;
  type: 'source' | 'fontaine' | 'rivière' | 'lac';
  lat: number;
  lng: number;
  elevation: number;
  reliability: 'permanent' | 'seasonal' | 'uncertain';
  quality: 'potable' | 'treatable' | 'non-potable';
  notes?: string;
}

export interface PathType {
  id: string;
  name: string;
  official: boolean;
  category: 'GR' | 'GRP' | 'PR' | 'HRP' | 'TMB' | 'unofficial' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

export interface GPXExportOptions {
  includeWaypoints: boolean;
  includeRefuges: boolean;
  includeWaterPoints: boolean;
  splitByStages: boolean;
  includeElevation: boolean;
}

export interface RouteAlternative {
  id: string;
  name: string;
  description: string;
  deviation_km: number;
  additional_time: number; // minutes
  difficulty_delta: number; // -2 to +2
  geojson: GeoJSON.FeatureCollection;
  highlights: string[];
}
