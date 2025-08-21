import axios from 'axios';

import type {
  Coordinates,
  ElevationPoint,
  EnrichedPOIs,
  GPXExportOptions,
  Heritage,
  HikingProfile,
  HikingRoute,
  NotableLake,
  Pass,
  Peak,
  Refuge,
  RouteStage,
  Viewpoint,
  WaterPoint,
} from '@/types/hiking';

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

interface ORSOptions {
  avoid_features?: string[];
  avoid_borders?: string;
  [key: string]: unknown;
}

interface ORSRequestBody {
  coordinates: number[][];
  options?: ORSOptions;
}

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

const ORS_BASE_URL = 'https://api.openrouteservice.org';

/**
 * Convert hiking profile preferences to ORS API parameters
 */
const getOrsParametersFromProfile = (hikingProfile?: HikingProfile | null) => {
  if (!hikingProfile) {
    return {
      profile: 'foot-hiking',
      options: {},
    };
  }

  const { preferences } = hikingProfile;

  const profile = 'foot-hiking';
  let options: ORSOptions = {};

  if (preferences.preferOfficial && !preferences.allowUnofficial) {
    options = {
      avoid_features: ['steps', 'ferries'],
    };
  } else if (preferences.preferOfficial && preferences.allowUnofficial) {
    options = {
      avoid_features: ['ferries'],
    };
  } else if (preferences.noPreference) {
    options = {
      avoid_features: [],
    };
  } else {
    options = {
      avoid_features: ['ferries'],
    };
  }

  return { profile, options };
};

if (!ORS_API_KEY || ORS_API_KEY === 'your_api_key_here') {
  console.error(
    '⚠️ OpenRouteService API key not configured. Route creation will fail.'
  );
} else {
  // ✅ OpenRouteService API key configured
  // Note: API test is done only when creating routes to avoid network errors on module load
}

/**
 * Calculate elevation profile for a route
 */
export const calculateElevationProfile = async (
  coordinates: [number, number][]
): Promise<ElevationPoint[]> => {
  let coords = coordinates;
  if (coords.length > 200) {
    const step = Math.ceil(coords.length / 200);
    coords = coords.filter((_, i) => i % step === 0);
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
 * Divise un itinéraire en étapes équidistantes le long du tracé
 */
export const divideRouteIntoStages = (
  route: HikingRoute,
  stageCount: number
): HikingRoute => {
  if (stageCount <= 1 || !route.stages || route.stages.length === 0) {
    return route;
  }

  const firstStage = route.stages[0];
  if (!firstStage.geojson?.features?.[0]?.geometry) {
    return route;
  }

  const geometry = firstStage.geojson.features[0].geometry;
  if (geometry.type !== 'LineString') {
    return route;
  }

  const allCoordinates: [number, number][] = geometry.coordinates as [
    number,
    number,
  ][];

  if (allCoordinates.length < 2) {
    return route;
  }

  const distances: number[] = [0];
  let totalDistance = 0;

  for (let i = 1; i < allCoordinates.length; i++) {
    const segmentDistance = calculateDistance(
      [allCoordinates[i - 1][1], allCoordinates[i - 1][0]],
      [allCoordinates[i][1], allCoordinates[i][0]]
    );
    totalDistance += segmentDistance;
    distances.push(totalDistance);
  }

  const stageDistance = totalDistance / stageCount;
  const newStages: RouteStage[] = [];

  for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
    const startDistance = stageIndex * stageDistance;
    const endDistance = (stageIndex + 1) * stageDistance;

    const startIndex = findDistanceIndex(distances, startDistance);
    const endIndex =
      stageIndex === stageCount - 1
        ? allCoordinates.length - 1
        : findDistanceIndex(distances, endDistance);

    const stageCoordinates = allCoordinates.slice(startIndex, endIndex + 1);

    if (stageCoordinates.length < 2) continue;

    const stageStats = calculateStageStats(stageCoordinates);

    const stageGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: stageCoordinates,
          },
          properties: {
            summary: {
              distance: stageDistance * 1000, // in meters
              duration: stageStats.distance * 900, // 15 min/km in seconds
            },
          },
        },
      ],
    };

    const elevationProfile: ElevationPoint[] = stageCoordinates.map(
      (coord, index) => ({
        distance: (stageStats.distance / stageCoordinates.length) * index,
        elevation: 1200 + Math.sin(index * 0.1) * 200, // Simulation
        lat: coord[1],
        lng: coord[0],
      })
    );

    newStages.push({
      id: `stage_auto_${Date.now()}_${stageIndex + 1}`,
      name: `Étape ${stageIndex + 1}`,
      startPoint: {
        lat: stageCoordinates[0][1],
        lng: stageCoordinates[0][0],
        id: `start_${stageIndex + 1}`,
        name: `Début étape ${stageIndex + 1}`,
      },
      endPoint: {
        lat: stageCoordinates[stageCoordinates.length - 1][1],
        lng: stageCoordinates[stageCoordinates.length - 1][0],
        id: `end_${stageIndex + 1}`,
        name: `Fin étape ${stageIndex + 1}`,
      },
      distance: stageStats.distance,
      ascent: stageStats.ascent,
      descent: stageStats.descent,
      estimatedTime: Math.round(stageStats.distance * 15), // 15 min/km
      elevationProfile,
      geojson: stageGeoJSON,
    });
  }

  return {
    ...route,
    stages: newStages,
    totalDistance,
    totalAscent: newStages.reduce((sum, stage) => sum + stage.ascent, 0),
    totalDescent: newStages.reduce((sum, stage) => sum + stage.descent, 0),
  };
};

/**
 * Trouve l'index de coordonnée le plus proche d'une distance donnée
 */
const findDistanceIndex = (
  distances: number[],
  targetDistance: number
): number => {
  for (let i = 0; i < distances.length - 1; i++) {
    if (distances[i] <= targetDistance && distances[i + 1] >= targetDistance) {
      const diffCurrent = Math.abs(distances[i] - targetDistance);
      const diffNext = Math.abs(distances[i + 1] - targetDistance);
      return diffCurrent <= diffNext ? i : i + 1;
    }
  }
  return distances.length - 1;
};

/**
 * Calcule les statistiques d'une étape
 */
const calculateStageStats = (
  coordinates: [number, number][]
): {
  distance: number;
  ascent: number;
  descent: number;
} => {
  let distance = 0;
  let ascent = 0;
  let descent = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const segmentDistance = calculateDistance(
      [coordinates[i - 1][1], coordinates[i - 1][0]],
      [coordinates[i][1], coordinates[i][0]]
    );
    distance += segmentDistance;

    const altitudeDiff =
      (coordinates[i][1] - coordinates[i - 1][1]) * 111000 * 0.01;
    if (altitudeDiff > 0) {
      ascent += Math.abs(altitudeDiff);
    } else {
      descent += Math.abs(altitudeDiff);
    }
  }

  return {
    distance,
    ascent: Math.round(ascent),
    descent: Math.round(descent),
  };
};

/**
 * Create multi-stage hiking route
 */
export const createHikingRoute = async (
  waypoints: Coordinates[],
  isLoop: boolean,
  stageCount: number = 1,
  hikingProfile?: HikingProfile | null
): Promise<HikingRoute> => {
  try {
    const routePoints = isLoop ? [...waypoints, waypoints[0]] : waypoints;

    const stages: RouteStage[] = [];
    let totalDistance = 0;
    let totalAscent = 0;
    let totalDescent = 0;
    let minElevation = Infinity;
    let maxElevation = -Infinity;

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
        hikingProfile
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
  hikingProfile?: HikingProfile | null
): Promise<RouteStage> => {
  if (waypoints.length < 2) {
    throw new Error('Au moins 2 points sont nécessaires pour créer une étape');
  }

  const startPoint = waypoints[0];
  const endPoint = waypoints[waypoints.length - 1];

  const coordinates = waypoints.map(point => [point.lng, point.lat]);

  const { profile, options } = getOrsParametersFromProfile(hikingProfile);

  try {
    const requestBody: ORSRequestBody = {
      coordinates: coordinates,
    };

    if (Object.keys(options).length > 0) {
      requestBody.options = options;
    }

    const routeResponse = await axios.post(
      `${ORS_BASE_URL}/v2/directions/${profile}/geojson`,
      requestBody,
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    const routeGeometry = routeResponse.data.features[0].geometry;
    const routeProperties = routeResponse.data.features[0].properties.summary;

    const elevationProfile = await calculateElevationProfile(
      routeGeometry.coordinates
    );

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
  } catch (error: unknown) {
    console.error('❌ ORS API Error:', error);

    if (axios.isAxiosError(error)) {
      console.error('❌ Axios Error Details:', {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new Error(
          '❌ Clé API OpenRouteService invalide. Vérifiez votre configuration.'
        );
      }

      if (error.response?.status === 403) {
        throw new Error('❌ Quota API dépassé ou accès refusé.');
      }

      if (error.response?.status === 400) {
        throw new Error(
          '❌ Paramètres de requête invalides. Vérifiez les coordonnées.'
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          '❌ Impossible de calculer un itinéraire entre ces points.'
        );
      }

      if (error.code === 'ERR_NETWORK') {
        throw new Error(
          '❌ Problème de connexion réseau. Vérifiez votre connexion internet.'
        );
      }
    }

    throw new Error(
      `❌ Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    );
  }
};

/**
 * Calculate minimum distance from a point to a line (route)
 */
const calculateDistanceToRoute = (
  pointLat: number,
  pointLng: number,
  routeCoordinates: [number, number][]
): number => {
  let minDistance = Infinity;

  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segmentStart = [routeCoordinates[i][1], routeCoordinates[i][0]] as [
      number,
      number,
    ];
    const segmentEnd = [
      routeCoordinates[i + 1][1],
      routeCoordinates[i + 1][0],
    ] as [number, number];

    const distance = distanceToLineSegment(
      [pointLat, pointLng] as [number, number],
      segmentStart,
      segmentEnd
    );

    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
};

/**
 * Calculate distance from a point to a line segment
 */
const distanceToLineSegment = (
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number => {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return calculateDistance(point, lineStart);
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy))
  );
  const projectionX = x1 + t * dx;
  const projectionY = y1 + t * dy;

  return calculateDistance(point, [projectionX, projectionY]);
};

/**
 * Utility function to retry a request with exponential backoff
 */
const retryRequest = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const isTimeoutError =
        error instanceof Error &&
        (error.message.includes('504') || error.message.includes('timeout'));

      if (isLastAttempt || !isTimeoutError) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
};

/**
 * Find refuges near the route
 */
export const findRefugesNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 5
): Promise<Refuge[]> => {
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

    const buffer = radiusKm / 111; // Rough conversion to degrees

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:8];
        (
          node["tourism"="alpine_hut"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["tourism"="wilderness_hut"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 10000, // 10 seconds timeout for the request
        });
      },
      2,
      1000
    ); // 2 retries with 1 second initial delay

    const refuges: Refuge[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Refuge sans nom',
        type: determineRefugeType(element.tags),
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        capacity: element.tags.capacity
          ? parseInt(element.tags.capacity)
          : undefined,
        openSeason: element.tags.opening_hours,
        contact: element.tags.phone || element.tags.website,
        services: extractRefugeServices(element.tags),
      }))
      .filter((refuge: Refuge) => {
        const distanceToRoute = calculateDistanceToRoute(
          refuge.lat,
          refuge.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      });

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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:8];
        (
          node["natural"="spring"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["amenity"="drinking_water"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 10000, // 10 seconds timeout
        });
      },
      2,
      1000
    ); // 2 retries with 1 second initial delay

    const waterPoints: WaterPoint[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || determineWaterPointName(element.tags),
        type: determineWaterPointType(element.tags),
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        reliability: determineReliability(element.tags),
        quality: determineWaterQuality(element.tags),
        notes: element.tags.description,
      }))
      .filter((waterPoint: WaterPoint) => {
        const distanceToRoute = calculateDistanceToRoute(
          waterPoint.lat,
          waterPoint.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      });

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

  const start = route.stages[0].startPoint;
  waypoints.push(`  <wpt lat="${start.lat}" lon="${start.lng}">
    <name>Départ</name>
    <sym>Flag, Green</sym>
  </wpt>`);

  route.stages.forEach((stage, index) => {
    if (index < route.stages.length - 1) {
      waypoints.push(`  <wpt lat="${stage.endPoint.lat}" lon="${stage.endPoint.lng}">
        <name>Fin étape ${index + 1}</name>
        <sym>Waypoint</sym>
      </wpt>`);
    }
  });

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

/**
 * Find peaks near the route
 */
export const findPeaksNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 10
): Promise<Peak[]> => {
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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:10];
        (
          node["natural"="peak"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["natural"="volcano"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 12000,
        });
      },
      2,
      1000
    );

    const peaks: Peak[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Sommet sans nom',
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        prominence: element.tags.prominence
          ? parseInt(element.tags.prominence)
          : undefined,
        difficulty: determinePeakDifficulty(element.tags),
        climbingGrade:
          element.tags.climbing || element.tags['climbing:grade:french'],
        description: element.tags.description,
      }))
      .filter((peak: Peak) => {
        const distanceToRoute = calculateDistanceToRoute(
          peak.lat,
          peak.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      })
      .filter((peak: Peak) => peak.elevation > 0); // Filter peaks without elevation

    return peaks.sort((a, b) => b.elevation - a.elevation); // Sort by descending elevation
  } catch (error) {
    console.error('Error finding peaks:', error);
    return [];
  }
};

/**
 * Find passes near the route
 */
export const findPassesNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 8
): Promise<Pass[]> => {
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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:10];
        (
          node["natural"="saddle"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["mountain_pass"="yes"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["natural"="pass"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 12000,
        });
      },
      2,
      1000
    );

    const passes: Pass[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Col sans nom',
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        type: determinePassType(element.tags),
        connects: extractConnections(element.tags),
        difficulty: determinePassDifficulty(element.tags),
        seasonalAccess: element.tags.seasonal || element.tags.opening_hours,
        description: element.tags.description,
      }))
      .filter((pass: Pass) => {
        const distanceToRoute = calculateDistanceToRoute(
          pass.lat,
          pass.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      })
      .filter((pass: Pass) => pass.elevation > 0);

    return passes.sort((a, b) => b.elevation - a.elevation);
  } catch (error) {
    console.error('Error finding passes:', error);
    return [];
  }
};

/**
 * Find viewpoints near the route
 */
export const findViewpointsNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 5
): Promise<Viewpoint[]> => {
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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:10];
        (
          node["tourism"="viewpoint"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["natural"="viewpoint"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 12000,
        });
      },
      2,
      1000
    );

    const viewpoints: Viewpoint[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Point de vue',
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        direction: element.tags.direction,
        panoramic:
          element.tags.panoramic === 'yes' ||
          element.tags.name?.includes('panoram'),
        visiblePeaks: extractVisiblePeaks(element.tags),
        bestTime: element.tags.best_time || determineBestViewTime(element.tags),
        description: element.tags.description,
      }))
      .filter((viewpoint: Viewpoint) => {
        const distanceToRoute = calculateDistanceToRoute(
          viewpoint.lat,
          viewpoint.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      });

    return viewpoints;
  } catch (error) {
    console.error('Error finding viewpoints:', error);
    return [];
  }
};

/**
 * Find heritage sites near the route
 */
export const findHeritageNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 6
): Promise<Heritage[]> => {
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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:10];
        (
          node["historic"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          node["tourism"="attraction"]["historic"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          way["historic"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 12000,
        });
      },
      2,
      1000
    );

    const heritage: Heritage[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || determineHeritageName(element.tags),
        lat: element.lat,
        lng: element.lon,
        type: determineHeritageType(element.tags),
        period: element.tags.start_date || element.tags['historic:period'],
        unesco:
          element.tags.unesco === 'yes' ||
          element.tags.heritage === 'world_heritage',
        entryFee: element.tags.fee === 'yes',
        openingHours: element.tags.opening_hours,
        description: element.tags.description || element.tags.wikipedia,
      }))
      .filter((site: Heritage) => {
        const distanceToRoute = calculateDistanceToRoute(
          site.lat,
          site.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      })
      .filter((site: Heritage) => site.name && site.name !== 'Site historique');

    return heritage;
  } catch (error) {
    console.error('Error finding heritage sites:', error);
    return [];
  }
};

/**
 * Find notable lakes near the route
 */
export const findLakesNearRoute = async (
  route: GeoJSON.FeatureCollection,
  radiusKm: number = 8
): Promise<NotableLake[]> => {
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

    const response = await retryRequest(
      async () => {
        const overpassQuery = `
        [out:json][timeout:10];
        (
          way["natural"="water"]["name"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
          relation["natural"="water"]["name"](${south - buffer},${west - buffer},${north + buffer},${east + buffer});
        );
        out geom;
      `;

        return await axios.post(OVERPASS_API_URL, overpassQuery, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 12000,
        });
      },
      2,
      1000
    );

    const lakes: NotableLake[] = response.data.elements
      .map((element: OverpassElement) => ({
        id: element.id.toString(),
        name: element.tags.name || 'Lac',
        lat: element.lat,
        lng: element.lon,
        elevation: element.tags.ele ? parseInt(element.tags.ele) : 0,
        area: element.tags.area ? parseFloat(element.tags.area) : undefined,
        maxDepth: element.tags.maxdepth
          ? parseFloat(element.tags.maxdepth)
          : undefined,
        type: determineLakeType(element.tags),
        activities: extractLakeActivities(element.tags),
        accessDifficulty: determineLakeAccessDifficulty(element.tags),
        description: element.tags.description,
      }))
      .filter((lake: NotableLake) => {
        const distanceToRoute = calculateDistanceToRoute(
          lake.lat,
          lake.lng,
          coordinates
        );
        return distanceToRoute <= radiusKm;
      });

    return lakes;
  } catch (error) {
    console.error('Error finding lakes:', error);
    return [];
  }
};

/**
 * Find all enriched POIs near the route
 */
export const findEnrichedPOIsNearRoute = async (
  route: GeoJSON.FeatureCollection
): Promise<EnrichedPOIs> => {
  try {
    const [peaks, passes, viewpoints, heritage, lakes] =
      await Promise.allSettled([
        findPeaksNearRoute(route, 3), // Reduced from 10km to 3km for closer peaks
        findPassesNearRoute(route, 3), // Reduced from 8km to 3km
        findViewpointsNearRoute(route, 3), // Reduced from 5km to 3km
        findHeritageNearRoute(route, 3), // Reduced from 6km to 3km
        findLakesNearRoute(route, 3), // Reduced from 8km to 3km
      ]);

    return {
      peaks: peaks.status === 'fulfilled' ? peaks.value : [],
      passes: passes.status === 'fulfilled' ? passes.value : [],
      viewpoints: viewpoints.status === 'fulfilled' ? viewpoints.value : [],
      heritage: heritage.status === 'fulfilled' ? heritage.value : [],
      geologicalSites: [], // To be implemented later
      lakes: lakes.status === 'fulfilled' ? lakes.value : [],
    };
  } catch (error) {
    console.error('Error finding enriched POIs:', error);
    return {
      peaks: [],
      passes: [],
      viewpoints: [],
      heritage: [],
      geologicalSites: [],
      lakes: [],
    };
  }
};

// Helper functions for determining POI characteristics
const determinePeakDifficulty = (
  tags: Record<string, string>
): 'facile' | 'modéré' | 'difficile' | 'très difficile' | undefined => {
  if (tags.climbing) return 'très difficile';
  if (tags.difficulty === 'difficult') return 'difficile';
  if (tags.difficulty === 'moderate') return 'modéré';
  if (tags.difficulty === 'easy') return 'facile';
  return undefined;
};

const determinePassType = (
  tags: Record<string, string>
): 'col' | 'brèche' | 'seuil' | 'pas' => {
  if (tags.name?.toLowerCase().includes('brèche')) return 'brèche';
  if (tags.name?.toLowerCase().includes('pas')) return 'pas';
  if (tags.name?.toLowerCase().includes('seuil')) return 'seuil';
  return 'col';
};

const determinePassDifficulty = (
  tags: Record<string, string>
): 'facile' | 'modéré' | 'difficile' | undefined => {
  if (tags.difficulty === 'difficult') return 'difficile';
  if (tags.difficulty === 'moderate') return 'modéré';
  if (tags.difficulty === 'easy') return 'facile';
  return undefined;
};

const extractConnections = (tags: Record<string, string>): string[] => {
  const connections = [];
  if (tags.connects) connections.push(tags.connects);
  if (tags.from && tags.to) connections.push(`${tags.from} - ${tags.to}`);
  return connections;
};

const extractVisiblePeaks = (tags: Record<string, string>): string[] => {
  if (tags.visible_peaks) return tags.visible_peaks.split(';');
  return [];
};

const determineBestViewTime = (
  tags: Record<string, string>
): string | undefined => {
  if (tags.direction?.includes('est')) return 'matin';
  if (tags.direction?.includes('ouest')) return 'soir';
  return 'journée';
};

const determineHeritageName = (tags: Record<string, string>): string => {
  if (tags.historic === 'castle') return 'Château';
  if (tags.historic === 'ruins') return 'Ruines';
  if (tags.historic === 'chapel') return 'Chapelle';
  if (tags.historic === 'monument') return 'Monument';
  return 'Site historique';
};

const determineHeritageType = (
  tags: Record<string, string>
):
  | 'château'
  | 'ruines'
  | 'chapelle'
  | 'monument'
  | 'site_archéologique'
  | 'village' => {
  if (tags.historic === 'castle') return 'château';
  if (tags.historic === 'ruins') return 'ruines';
  if (tags.historic === 'chapel') return 'chapelle';
  if (tags.historic === 'monument') return 'monument';
  if (tags.historic === 'archaeological_site') return 'site_archéologique';
  if (tags.place === 'village') return 'village';
  return 'monument';
};

const determineLakeType = (
  tags: Record<string, string>
): 'lac_alpin' | 'lac_glaciaire' | 'lac_artificiel' | 'étang' => {
  if (tags.water === 'reservoir') return 'lac_artificiel';
  if (tags.name?.toLowerCase().includes('étang')) return 'étang';
  if (tags.natural === 'water' && tags.ele && parseInt(tags.ele) > 1500)
    return 'lac_alpin';
  return 'lac_glaciaire';
};

const extractLakeActivities = (tags: Record<string, string>): string[] => {
  const activities = [];
  if (tags.swimming === 'yes') activities.push('baignade');
  if (tags.fishing === 'yes') activities.push('pêche');
  if (tags.boat === 'yes') activities.push('navigation');
  return activities;
};

const determineLakeAccessDifficulty = (
  tags: Record<string, string>
): 'facile' | 'modéré' | 'difficile' => {
  if (tags.access && tags.access.includes('difficult')) return 'difficile';
  if (tags.access && tags.access.includes('moderate')) return 'modéré';
  return 'facile';
};
