import type {
  Coordinates,
  ElevationPoint,
  GPXExportOptions,
  HikingProfile,
  HikingRoute,
  PathPreferences,
  Refuge,
  RouteStage,
  WaterPoint,
} from '@/types/hiking';
import axios from 'axios';

// Types for external APIs
interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface ElevationResponse {
  results: Array<{
    latitude: number;
    longitude: number;
    elevation: number;
  }>;
}

const IGN_API_KEY = import.meta.env.VITE_IGN_API_KEY;
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// IGN Tile Layer URLs - Updated to current IGN API endpoints with fallback
export const IGN_TILE_LAYERS = {
  PLAN: {
    url: IGN_API_KEY
      ? `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&apikey=${IGN_API_KEY}`
      : `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`,
    attribution: '© IGN-France',
    name: 'Plan IGN',
  },
  SATELLITE: {
    url: IGN_API_KEY
      ? `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&apikey=${IGN_API_KEY}`
      : `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`,
    attribution: '© IGN-France',
    name: 'Satellite IGN',
  },
  TOPO: {
    url: IGN_API_KEY
      ? `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&apikey=${IGN_API_KEY}`
      : `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`,
    attribution: '© IGN-France',
    name: 'Cartes IGN',
  },
};

/**
 * Calculate elevation profile for a route
 */
export const calculateElevationProfile = async (
  coordinates: [number, number][]
): Promise<ElevationPoint[]> => {
  // Optimize number of points for elevation API
  let coords = coordinates;
  if (coords.length > 200) {
    const step = Math.ceil(coords.length / 200);
    coords = coords.filter((_, i) => i % step === 0);
    // Always include the last point
    if (coords[coords.length - 1] !== coordinates[coordinates.length - 1]) {
      coords.push(coordinates[coordinates.length - 1]);
    }
  }

  try {
    const response = await axios.post(
      'https://api.open-elevation.com/api/v1/lookup',
      {
        locations: coords.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })),
      }
    );

    const elevationData = response.data.results;
    const profile: ElevationPoint[] = [];
    let totalDistance = 0;

    for (let i = 0; i < elevationData.length; i++) {
      const point = elevationData[i];

      if (i > 0) {
        const prevCoord = coords[i - 1];
        const currCoord = coords[i];
        const distance = calculateDistance(
          [prevCoord[1], prevCoord[0]],
          [currCoord[1], currCoord[0]]
        );
        totalDistance += distance;
      }

      profile.push({
        distance: totalDistance,
        elevation: Math.round(point.elevation),
        lat: point.latitude,
        lng: point.longitude,
      });
    }

    return profile;
  } catch (error) {
    console.error('Error calculating elevation profile:', error);
    throw new Error('Impossible de calculer le profil altimétrique');
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const toRad = (value: number): number => (value * Math.PI) / 180;

/**
 * Create multi-stage hiking route
 */
export const createHikingRoute = async (
  waypoints: Coordinates[],
  isLoop: boolean,
  profile: HikingProfile,
  stageCount: number = 1
): Promise<HikingRoute> => {
  try {
    // If it's a loop, add the first point as the last point
    const routePoints = isLoop ? [...waypoints, waypoints[0]] : waypoints;

    // Calculate stages
    const stages: RouteStage[] = [];
    let totalDistance = 0;
    let totalAscent = 0;
    let totalDescent = 0;
    let minElevation = Infinity;
    let maxElevation = -Infinity;

    // Distribute waypoints across stages
    const pointsPerStage = Math.max(
      2,
      Math.ceil(routePoints.length / stageCount)
    );

    for (let i = 0; i < stageCount; i++) {
      const startIdx = i * (pointsPerStage - 1);
      const endIdx = Math.min(startIdx + pointsPerStage, routePoints.length);

      if (startIdx >= routePoints.length - 1) break;

      const stagePoints = routePoints.slice(startIdx, endIdx);
      const stage = await createRouteStage(
        `Étape ${i + 1}`,
        stagePoints,
        profile
      );

      stages.push(stage);
      totalDistance += stage.distance;
      totalAscent += stage.ascent;
      totalDescent += stage.descent;
      minElevation = Math.min(
        minElevation,
        ...stage.elevationProfile.map(p => p.elevation)
      );
      maxElevation = Math.max(
        maxElevation,
        ...stage.elevationProfile.map(p => p.elevation)
      );
    }

    // Combine all stage geometries
    const combinedFeatures: GeoJSON.Feature[] = [];
    stages.forEach(stage => {
      if (stage.geojson.features) {
        combinedFeatures.push(...stage.geojson.features);
      }
    });

    return {
      id: `route_${Date.now()}`,
      name: isLoop ? 'Itinéraire en boucle' : 'Itinéraire linéaire',
      type: isLoop ? 'loop' : 'point-to-point',
      stages,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalAscent: Math.round(totalAscent),
      totalDescent: Math.round(totalDescent),
      minElevation: Math.round(minElevation),
      maxElevation: Math.round(maxElevation),
      geojson: {
        type: 'FeatureCollection',
        features: combinedFeatures,
      },
    };
  } catch (error) {
    console.error('Error creating hiking route:', error);
    throw new Error("Impossible de créer l'itinéraire de randonnée");
  }
};

/**
 * Create a single route stage
 */
const createRouteStage = async (
  name: string,
  waypoints: Coordinates[],
  profile: HikingProfile
): Promise<RouteStage> => {
  if (waypoints.length < 2) {
    throw new Error('Au moins 2 points sont nécessaires pour créer une étape');
  }

  const startPoint = waypoints[0];
  const endPoint = waypoints[waypoints.length - 1];

  // Get route from ORS
  const coordinates = waypoints.map(point => [point.lng, point.lat]);

  const routeResponse = await axios.post(
    `https://api.openrouteservice.org/v2/directions/foot-hiking/geojson`,
    {
      coordinates,
      radiuses: Array(coordinates.length).fill(1000),
      preference: getOrsPreference(profile.preferences),
      options: {
        avoid_features: getAvoidFeatures(profile.preferences),
      },
    },
    {
      headers: {
        Authorization: ORS_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

  const routeGeometry = routeResponse.data.features[0].geometry;
  const routeProperties = routeResponse.data.features[0].properties.summary;

  // Calculate elevation profile
  const elevationProfile = await calculateElevationProfile(
    routeGeometry.coordinates
  );

  // Calculate ascent and descent
  let ascent = 0;
  let descent = 0;
  for (let i = 1; i < elevationProfile.length; i++) {
    const diff =
      elevationProfile[i].elevation - elevationProfile[i - 1].elevation;
    if (diff > 0) ascent += diff;
    else descent -= diff;
  }

  return {
    id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    startPoint,
    endPoint,
    distance: Math.round((routeProperties.distance / 1000) * 100) / 100, // km
    ascent: Math.round(ascent),
    descent: Math.round(descent),
    estimatedTime: Math.round(routeProperties.duration / 60), // minutes
    elevationProfile,
    geojson: routeResponse.data,
  };
};

/**
 * Convert hiking preferences to ORS parameters
 */
const getOrsPreference = (preferences: PathPreferences): string => {
  if (preferences.preferOfficial) {
    return 'recommended';
  }
  if (preferences.noPreference) {
    return 'fastest';
  }
  return 'shortest';
};

const getAvoidFeatures = (preferences: PathPreferences): string[] => {
  const avoid: string[] = [];

  if (preferences.preferOfficial && !preferences.allowUnofficial) {
    // Try to avoid unofficial paths (limited support in ORS)
    avoid.push('steps');
  }

  return avoid;
};

/**
 * Find refuges near the route
 */
export const findRefugesNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 5
): Promise<Refuge[]> => {
  try {
    // Get bounding box of the route
    const feature = route.features[0];
    if (!feature || feature.geometry.type !== 'LineString') {
      throw new Error('Route invalide');
    }

    const coordinates = (feature.geometry as GeoJSON.LineString)
      .coordinates as [number, number][];
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);

    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);

    // Expand bounding box by radius
    const buffer = radiusKm / 111; // Rough conversion to degrees

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["tourism"="alpine_hut"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        node["tourism"="wilderness_hut"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        node["amenity"="shelter"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
      );
      out geom;
    `;

    const response = await axios.post(OVERPASS_API_URL, overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
    });

    const refuges: Refuge[] = response.data.elements.map(
      (element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Refuge sans nom',
        type: determineRefugeType(element.tags),
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        capacity: element.tags.capacity
          ? parseInt(element.tags.capacity)
          : undefined,
        open_season: element.tags.opening_hours,
        contact: element.tags.phone || element.tags.website,
        services: extractRefugeServices(element.tags),
      })
    );

    return refuges;
  } catch (error) {
    console.error('Error finding refuges:', error);
    return [];
  }
};

const determineRefugeType = (
  tags: Record<string, string>
): 'gardé' | 'libre' | 'bivouac' => {
  if (tags.tourism === 'alpine_hut' && tags.operator) return 'gardé';
  if (tags.amenity === 'shelter') return 'bivouac';
  return 'libre';
};

const extractRefugeServices = (
  tags: Record<string, string>
): { type: string; available: boolean }[] => {
  const services = [];
  if (tags.restaurant === 'yes')
    services.push({ type: 'meals', available: true });
  if (tags.shower === 'yes') services.push({ type: 'shower', available: true });
  if (tags.internet_access === 'yes')
    services.push({ type: 'wifi', available: true });
  return services;
};

/**
 * Find water points near the route
 */
export const findWaterPointsNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 2
): Promise<WaterPoint[]> => {
  try {
    const feature = route.features[0];
    if (!feature || feature.geometry.type !== 'LineString') {
      throw new Error('Route invalide');
    }

    const coordinates = (feature.geometry as GeoJSON.LineString)
      .coordinates as [number, number][];
    const lats = coordinates.map(coord => coord[1]);
    const lngs = coordinates.map(coord => coord[0]);

    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);

    const buffer = radiusKm / 111;

    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["natural"="spring"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        node["amenity"="drinking_water"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        node["man_made"="water_well"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        node["natural"="water"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
      );
      out geom;
    `;

    const response = await axios.post(OVERPASS_API_URL, overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
    });

    const waterPoints: WaterPoint[] = response.data.elements.map(
      (element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || determineWaterPointName(element.tags),
        type: determineWaterPointType(element.tags),
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        reliability: determineReliability(element.tags),
        quality: determineWaterQuality(element.tags),
        notes: element.tags.description,
      })
    );

    return waterPoints;
  } catch (error) {
    console.error('Error finding water points:', error);
    return [];
  }
};

const determineWaterPointName = (tags: Record<string, string>): string => {
  if (tags.natural === 'spring') return 'Source';
  if (tags.amenity === 'drinking_water') return 'Fontaine';
  if (tags.man_made === 'water_well') return 'Puits';
  return "Point d'eau";
};

const determineWaterPointType = (
  tags: Record<string, string>
): 'source' | 'fontaine' | 'rivière' | 'lac' => {
  if (tags.natural === 'spring') return 'source';
  if (tags.amenity === 'drinking_water') return 'fontaine';
  if (tags.waterway) return 'rivière';
  return 'lac';
};

const determineReliability = (
  tags: Record<string, string>
): 'permanent' | 'seasonal' | 'uncertain' => {
  if (tags.amenity === 'drinking_water') return 'permanent';
  if (tags.natural === 'spring') return 'permanent';
  return 'seasonal';
};

const determineWaterQuality = (
  tags: Record<string, string>
): 'potable' | 'treatable' | 'non-potable' => {
  if (tags.amenity === 'drinking_water') return 'potable';
  if (tags.drinking_water === 'yes') return 'potable';
  if (tags.natural === 'spring') return 'treatable';
  return 'treatable';
};

/**
 * Export route to GPX format
 */
export const exportToGPX = (
  route: HikingRoute,
  options: GPXExportOptions,
  refuges: Refuge[] = [],
  waterPoints: WaterPoint[] = []
): string => {
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="WayMaker" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.name}</name>
    <desc>Itinéraire généré par WayMaker</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>

  ${generateGPXTracks(route, options)}
  ${options.includeWaypoints ? generateGPXWaypoints(route) : ''}
  ${options.includeRefuges ? generateGPXRefuges(refuges) : ''}
  ${options.includeWaterPoints ? generateGPXWaterPoints(waterPoints) : ''}
</gpx>`;

  return gpx;
};

const generateGPXTracks = (
  route: HikingRoute,
  options: GPXExportOptions
): string => {
  if (options.splitByStages) {
    return route.stages
      .map(
        stage => `
  <trk>
    <name>${stage.name}</name>
    <desc>Distance: ${stage.distance}km, Dénivelé: +${stage.ascent}m/-${stage.descent}m</desc>
    <trkseg>
      ${generateTrackPoints(stage.geojson, options.includeElevation)}
    </trkseg>
  </trk>`
      )
      .join('');
  } else {
    return `
  <trk>
    <name>${route.name}</name>
    <desc>Distance totale: ${route.totalDistance}km, Dénivelé: +${route.totalAscent}m/-${route.totalDescent}m</desc>
    <trkseg>
      ${generateTrackPoints(route.geojson, options.includeElevation)}
    </trkseg>
  </trk>`;
  }
};

const generateTrackPoints = (
  geojson: GeoJSON.FeatureCollection,
  includeElevation: boolean
): string => {
  const feature = geojson.features[0];
  if (!feature || feature.geometry.type !== 'LineString') {
    return '';
  }

  const coordinates = (feature.geometry as GeoJSON.LineString).coordinates as [
    number,
    number,
  ][];
  if (!coordinates) return '';

  return coordinates
    .map(
      ([lng, lat]) =>
        `      <trkpt lat="${lat}" lon="${lng}">
        ${includeElevation ? '<ele>0</ele>' : ''}
      </trkpt>`
    )
    .join('\n');
};

const generateGPXWaypoints = (route: HikingRoute): string => {
  const waypoints = [];

  // Add start point
  const start = route.stages[0].startPoint;
  waypoints.push(`  <wpt lat="${start.lat}" lon="${start.lng}">
    <name>Départ</name>
    <sym>Flag, Green</sym>
  </wpt>`);

  // Add stage endpoints
  route.stages.forEach((stage, index) => {
    if (index < route.stages.length - 1) {
      waypoints.push(`  <wpt lat="${stage.endPoint.lat}" lon="${stage.endPoint.lng}">
        <name>Fin étape ${index + 1}</name>
        <sym>Waypoint</sym>
      </wpt>`);
    }
  });

  // Add end point
  const end = route.stages[route.stages.length - 1].endPoint;
  waypoints.push(`  <wpt lat="${end.lat}" lon="${end.lng}">
    <name>Arrivée</name>
    <sym>Flag, Red</sym>
  </wpt>`);

  return waypoints.join('\n');
};

const generateGPXRefuges = (refuges: Refuge[]): string => {
  return refuges
    .map(
      refuge => `  <wpt lat="${refuge.lat}" lon="${refuge.lng}">
    <name>${refuge.name}</name>
    <desc>Type: ${refuge.type}${refuge.elevation ? `, Altitude: ${refuge.elevation}m` : ''}</desc>
    <sym>Lodge</sym>
  </wpt>`
    )
    .join('\n');
};

const generateGPXWaterPoints = (waterPoints: WaterPoint[]): string => {
  return waterPoints
    .map(
      point => `  <wpt lat="${point.lat}" lon="${point.lng}">
    <name>${point.name}</name>
    <desc>Type: ${point.type}, Qualité: ${point.quality}</desc>
    <sym>Water Source</sym>
  </wpt>`
    )
    .join('\n');
};
