export interface HikingProfile {
  id: string;
  name: string;
  description: string;
  color: string;
  preferences: PathPreferences;
}

export interface PathPreferences {
  preferOfficial: boolean; // GR, HRP, etc.
  allowUnofficial: boolean; // Unofficial trails
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
  openSeason?: string;
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

export interface Peak {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  prominence?: number; // Topographic prominence in meters
  difficulty?: 'facile' | 'modéré' | 'difficile' | 'très difficile';
  climbingGrade?: string; // Climbing grade if applicable
  description?: string;
}

export interface Pass {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  type: 'col' | 'brèche' | 'seuil' | 'pas';
  connects?: string[]; // Connected valleys or regions
  difficulty?: 'facile' | 'modéré' | 'difficile';
  seasonalAccess?: string; // Seasonal accessibility period
  description?: string;
}

export interface Viewpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  direction?: string; // Direction of the view (N, NE, etc.)
  panoramic: boolean; // Panoramic view or not
  visiblePeaks?: string[]; // Visible peaks
  bestTime?: string; // Best time for the view
  description?: string;
}

export interface Heritage {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type:
    | 'château'
    | 'ruines'
    | 'chapelle'
    | 'monument'
    | 'site_archéologique'
    | 'village';
  period?: string; // Historical period
  unesco?: boolean; // UNESCO site or not
  entryFee?: boolean; // Paid entry
  openingHours?: string;
  description?: string;
}

export interface GeologicalSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type:
    | 'glacier'
    | 'cascade'
    | 'grotte'
    | 'formation_rocheuse'
    | 'fossiles'
    | 'minéraux';
  geologicalPeriod?: string;
  accessibility?: 'facile' | 'modéré' | 'difficile';
  safetyNotes?: string; // Safety notes
  description?: string;
}

export interface NotableLake {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  area?: number; // Area in hectares
  maxDepth?: number; // Max depth in meters
  type: 'lac_alpin' | 'lac_glaciaire' | 'lac_artificiel' | 'étang';
  activities?: string[]; // Swimming, fishing, etc.
  accessDifficulty?: 'facile' | 'modéré' | 'difficile';
  description?: string;
}

export interface EnrichedPOIs {
  peaks: Peak[];
  passes: Pass[];
  viewpoints: Viewpoint[];
  heritage: Heritage[];
  geologicalSites: GeologicalSite[];
  lakes: NotableLake[];
}

export interface GPXExportOptions {
  includeWaypoints: boolean;
  includeRefuges: boolean;
  includeWaterPoints: boolean;
  includeEnrichedPOIs: boolean;
  splitByStages: boolean;
  includeElevation: boolean;
}
