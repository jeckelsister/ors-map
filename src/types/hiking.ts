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

export interface Peak {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  prominence?: number; // Proéminence topographique en mètres
  difficulty?: 'facile' | 'modéré' | 'difficile' | 'très difficile';
  climbing_grade?: string; // Cotation d'escalade si applicable
  description?: string;
}

export interface Pass {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  type: 'col' | 'brèche' | 'seuil' | 'pas';
  connects?: string[]; // Vallées ou régions connectées
  difficulty?: 'facile' | 'modéré' | 'difficile';
  seasonal_access?: string; // Période d'accessibilité
  description?: string;
}

export interface Viewpoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  direction?: string; // Direction de la vue (N, NE, etc.)
  panoramic: boolean; // Vue panoramique ou non
  visible_peaks?: string[]; // Sommets visibles
  best_time?: string; // Meilleur moment pour la vue
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
  period?: string; // Période historique
  unesco?: boolean; // Site UNESCO ou non
  entry_fee?: boolean; // Entrée payante
  opening_hours?: string;
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
  geological_period?: string;
  accessibility?: 'facile' | 'modéré' | 'difficile';
  safety_notes?: string; // Notes de sécurité
  description?: string;
}

export interface NotableLake {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  area?: number; // Superficie en hectares
  max_depth?: number; // Profondeur max en mètres
  type: 'lac_alpin' | 'lac_glaciaire' | 'lac_artificiel' | 'étang';
  activities?: string[]; // Baignade, pêche, etc.
  access_difficulty?: 'facile' | 'modéré' | 'difficile';
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
