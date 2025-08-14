import type {
  Coordinates,
  ElevationPoint,
  GPXExportOptions,
  HikingRoute,
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

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Use OpenRouteService API directly
const ORS_BASE_URL = 'https://api.openrouteservice.org';

/**
 * Test the ORS API with a simple request
 */
const testOrsApi = async () => {
  try {
    await axios.post(
      `${ORS_BASE_URL}/v2/directions/foot-hiking/geojson`,
      {
        coordinates: [
          [2.3522, 48.8566],
          [2.2945, 48.8584],
        ], // Paris test coordinates
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error('❌ ORS API test failed:', error);
  }
};

// Validate API configuration and test ORS
if (!ORS_API_KEY || ORS_API_KEY === 'your_api_key_here') {
  console.error(
    '⚠️ OpenRouteService API key not configured. Route creation will fail.'
  );
} else {
  // Test API immediately on load
  testOrsApi();
}



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
 * Divise un itinéraire en étapes équidistantes le long du tracé
 */
export const divideRouteIntoStages = (route: HikingRoute, stageCount: number): HikingRoute => {
  if (stageCount <= 1 || !route.stages || route.stages.length === 0) {
    return route;
  }

  // Récupérer toutes les coordonnées de l'itinéraire principal
  const firstStage = route.stages[0];
  if (!firstStage.geojson?.features?.[0]?.geometry) {
    return route;
  }

  const geometry = firstStage.geojson.features[0].geometry;
  if (geometry.type !== 'LineString') {
    return route;
  }

  const allCoordinates: [number, number][] = geometry.coordinates as [number, number][];
  
  if (allCoordinates.length < 2) {
    return route;
  }

  // Calculer les distances cumulatives le long de l'itinéraire
  const distances: number[] = [0];
  let totalDistance = 0;
  
  for (let i = 1; i < allCoordinates.length; i++) {
    const segmentDistance = calculateDistance(
      [allCoordinates[i-1][1], allCoordinates[i-1][0]],
      [allCoordinates[i][1], allCoordinates[i][0]]
    );
    totalDistance += segmentDistance;
    distances.push(totalDistance);
  }

  // Calculer les points de division équidistants
  const stageDistance = totalDistance / stageCount;
  const newStages: RouteStage[] = [];

  for (let stageIndex = 0; stageIndex < stageCount; stageIndex++) {
    const startDistance = stageIndex * stageDistance;
    const endDistance = (stageIndex + 1) * stageDistance;
    
    // Trouver les indices de début et fin dans les coordonnées
    const startIndex = findDistanceIndex(distances, startDistance);
    const endIndex = stageIndex === stageCount - 1 
      ? allCoordinates.length - 1 
      : findDistanceIndex(distances, endDistance);
    
    // Extraire les coordonnées pour cette étape
    const stageCoordinates = allCoordinates.slice(startIndex, endIndex + 1);
    
    if (stageCoordinates.length < 2) continue;

    // Calculer les statistiques de l'étape
    const stageStats = calculateStageStats(stageCoordinates);
    
    // Créer l'étape avec GeoJSON
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
              distance: stageStats.distance * 1000, // en mètres
              duration: stageStats.distance * 900, // 15 min/km en secondes
            },
          },
        },
      ],
    };

    // Créer le profil d'élévation simplifié
    const elevationProfile: ElevationPoint[] = stageCoordinates.map((coord, index) => ({
      distance: (stageStats.distance / stageCoordinates.length) * index,
      elevation: 1200 + Math.sin(index * 0.1) * 200, // Simulation
      lat: coord[1],
      lng: coord[0],
    }));

    newStages.push({
      id: `stage_auto_${Date.now()}_${stageIndex + 1}`,
      name: `Étape ${stageIndex + 1}`,
      startPoint: { 
        lat: stageCoordinates[0][1], 
        lng: stageCoordinates[0][0],
        id: `start_${stageIndex + 1}`,
        name: `Début étape ${stageIndex + 1}`
      },
      endPoint: { 
        lat: stageCoordinates[stageCoordinates.length-1][1], 
        lng: stageCoordinates[stageCoordinates.length-1][0],
        id: `end_${stageIndex + 1}`,
        name: `Fin étape ${stageIndex + 1}`
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
const findDistanceIndex = (distances: number[], targetDistance: number): number => {
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
const calculateStageStats = (coordinates: [number, number][]): {
  distance: number;
  ascent: number;
  descent: number;
} => {
  let distance = 0;
  let ascent = 0;
  let descent = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const segmentDistance = calculateDistance(
      [coordinates[i-1][1], coordinates[i-1][0]],
      [coordinates[i][1], coordinates[i][0]]
    );
    distance += segmentDistance;

    // Simulation basique du dénivelé
    const altitudeDiff = (coordinates[i][1] - coordinates[i-1][1]) * 111000 * 0.01;
    if (altitudeDiff > 0) {
      ascent += Math.abs(altitudeDiff);
    } else {
      descent += Math.abs(altitudeDiff);
    }
  }

  return {
    distance,
    ascent: Math.round(ascent),
    descent: Math.round(descent)
  };
};

/**
 * Create multi-stage hiking route
 */
export const createHikingRoute = async (
  waypoints: Coordinates[],
  isLoop: boolean,
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
        stagePoints
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
  waypoints: Coordinates[]
): Promise<RouteStage> => {
  if (waypoints.length < 2) {
    throw new Error('Au moins 2 points sont nécessaires pour créer une étape');
  }

  const startPoint = waypoints[0];
  const endPoint = waypoints[waypoints.length - 1];

  // Get route from ORS
  const coordinates = waypoints.map(point => [point.lng, point.lat]);

  try {
    const routeResponse = await axios.post(
      `${ORS_BASE_URL}/v2/directions/foot-hiking/geojson`,
      {
        coordinates: coordinates,
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 secondes de timeout
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
