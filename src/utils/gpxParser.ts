import type { Coordinates } from '../types/hiking';

export interface GPXTrack {
  name?: string;
  description?: string;
  waypoints: Coordinates[];
  totalDistance?: number;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface GPXParseResult {
  tracks: GPXTrack[];
  waypoints: Coordinates[];
  routes: GPXTrack[];
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    time?: Date;
  };
}

/**
 * Parse un fichier GPX et extrait les données de géolocalisation
 */
export async function parseGPXFile(file: File): Promise<GPXParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const gpxText = event.target?.result as string;
        const result = parseGPXString(gpxText);
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Erreur lors du parsing du fichier GPX: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse une chaîne XML GPX
 */
export function parseGPXString(gpxString: string): GPXParseResult {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxString, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Format GPX invalide');
  }

  const gpxElement = xmlDoc.documentElement;

  if (gpxElement.tagName !== 'gpx') {
    throw new Error("Ce fichier n'est pas un fichier GPX valide");
  }

  const result: GPXParseResult = {
    tracks: [],
    waypoints: [],
    routes: [],
    metadata: extractMetadata(gpxElement),
  };

  // Extraction des waypoints
  const wptElements = gpxElement.querySelectorAll('wpt');
  result.waypoints = Array.from(wptElements).map((wpt, index) =>
    parseWaypoint(wpt as Element, `waypoint-${index}`)
  );

  // Extraction des tracks
  const trkElements = gpxElement.querySelectorAll('trk');
  result.tracks = Array.from(trkElements).map((trk, index) =>
    parseTrack(trk as Element, `track-${index}`)
  );

  // Extraction des routes
  const rteElements = gpxElement.querySelectorAll('rte');
  result.routes = Array.from(rteElements).map((rte, index) =>
    parseRoute(rte as Element, `route-${index}`)
  );

  return result;
}

/**
 * Convertit les données GPX en waypoints pour l'application
 */
export function convertGPXToWaypoints(
  gpxResult: GPXParseResult
): Coordinates[] {
  const waypoints: Coordinates[] = [];

  // Priority: routes > tracks > individual waypoints
  if (gpxResult.routes.length > 0) {
    // Use the first route
    return gpxResult.routes[0].waypoints;
  } else if (gpxResult.tracks.length > 0) {
    // Utiliser le premier track, simplifier les points si trop nombreux
    const track = gpxResult.tracks[0];
    return simplifyTrackPoints(track.waypoints);
  } else if (gpxResult.waypoints.length > 0) {
    // Utiliser les waypoints individuels
    return gpxResult.waypoints;
  }

  return waypoints;
}

// Fonctions utilitaires internes

function extractMetadata(gpxElement: Element) {
  const metadata = gpxElement.querySelector('metadata');
  if (!metadata) return undefined;

  return {
    name: metadata.querySelector('name')?.textContent || undefined,
    description: metadata.querySelector('desc')?.textContent || undefined,
    author: metadata.querySelector('author name')?.textContent || undefined,
    time: metadata.querySelector('time')?.textContent
      ? new Date(metadata.querySelector('time')!.textContent!)
      : undefined,
  };
}

function parseWaypoint(wptElement: Element, defaultId: string): Coordinates {
  const lat = parseFloat(wptElement.getAttribute('lat') || '0');
  const lng = parseFloat(wptElement.getAttribute('lon') || '0');
  const name =
    wptElement.querySelector('name')?.textContent || `Point ${defaultId}`;

  return {
    id: `gpx-${defaultId}-${Date.now()}`,
    lat,
    lng,
    name,
  };
}

function parseTrack(trkElement: Element, defaultId: string): GPXTrack {
  const name =
    trkElement.querySelector('name')?.textContent || `Track ${defaultId}`;
  const description = trkElement.querySelector('desc')?.textContent;

  const waypoints: Coordinates[] = [];
  const trkSegments = trkElement.querySelectorAll('trkseg');

  Array.from(trkSegments).forEach((seg, segIndex) => {
    const trkPts = seg.querySelectorAll('trkpt');
    Array.from(trkPts).forEach((pt, ptIndex) => {
      waypoints.push(
        parseWaypoint(pt as Element, `${defaultId}-seg${segIndex}-pt${ptIndex}`)
      );
    });
  });

  return {
    name,
    description,
    waypoints,
    bounds: calculateBounds(waypoints),
  };
}

function parseRoute(rteElement: Element, defaultId: string): GPXTrack {
  const name =
    rteElement.querySelector('name')?.textContent || `Route ${defaultId}`;
  const description = rteElement.querySelector('desc')?.textContent;

  const rtePts = rteElement.querySelectorAll('rtept');
  const waypoints = Array.from(rtePts).map((pt, index) =>
    parseWaypoint(pt as Element, `${defaultId}-pt${index}`)
  );

  return {
    name,
    description,
    waypoints,
    bounds: calculateBounds(waypoints),
  };
}

function calculateBounds(waypoints: Coordinates[]) {
  if (waypoints.length === 0) return undefined;

  let minLat = waypoints[0].lat;
  let maxLat = waypoints[0].lat;
  let minLng = waypoints[0].lng;
  let maxLng = waypoints[0].lng;

  waypoints.forEach(wp => {
    minLat = Math.min(minLat, wp.lat);
    maxLat = Math.max(maxLat, wp.lat);
    minLng = Math.min(minLng, wp.lng);
    maxLng = Math.max(maxLng, wp.lng);
  });

  return { minLat, maxLat, minLng, maxLng };
}

function simplifyTrackPoints(
  waypoints: Coordinates[],
  maxPoints: number = 20
): Coordinates[] {
  if (waypoints.length <= maxPoints) {
    return waypoints;
  }

  const simplified: Coordinates[] = [];
  const step = Math.floor(waypoints.length / maxPoints);

  // Toujours inclure le premier point
  simplified.push(waypoints[0]);

  // Sample intermediate points
  for (let i = step; i < waypoints.length - step; i += step) {
    simplified.push({
      ...waypoints[i],
      id: `simplified-${simplified.length}-${Date.now()}`,
    });
  }

  // Toujours inclure le dernier point
  if (waypoints.length > 1) {
    simplified.push(waypoints[waypoints.length - 1]);
  }

  return simplified;
}

/**
 * Calcule la distance approximative entre deux points GPS
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcule la distance totale d'un track
 */
export function calculateTotalDistance(waypoints: Coordinates[]): number {
  if (waypoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < waypoints.length; i++) {
    totalDistance += calculateDistance(
      waypoints[i - 1].lat,
      waypoints[i - 1].lng,
      waypoints[i].lat,
      waypoints[i].lng
    );
  }

  return totalDistance;
}
