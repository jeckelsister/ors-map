import { TRANSPORT_MODES } from '@/constants/transportModes';
import type { RouteResponse } from '@/types/profile';
import axios, { AxiosRequestConfig } from 'axios';
import L from 'leaflet';

const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions';
const ELEVATION_API_URL = 'https://api.open-elevation.com/api/v1/lookup';

// Extended axios config for retry logic
interface RetryConfig extends AxiosRequestConfig {
  retries?: number;
  retryDelay?: number;
}

// Error handling and retry logic
const apiClient = axios.create({
  timeout: 10000, // 10 seconds timeout
});

// Add interceptor for error handling and retries
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config as RetryConfig;

    if (!config || config.retries === undefined) {
      config.retries = 3;
    }

    if (config.retries <= 0) {
      return Promise.reject(error);
    }

    config.retries -= 1;

    const delayRetryRequest = new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, config.retryDelay || 1000);
    });

    await delayRetryRequest;
    return apiClient(config);
  }
);

export const initializeMap = (
  elementId: string,
  center: [number, number],
  zoom: number = 13
): L.Map => {
  const map = L.map(elementId, { zoomControl: false }).setView(center, zoom);
  L.tileLayer(MAP_TILE_URL, {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  L.control.zoom({ position: 'topright' }).addTo(map);
  return map;
};

// Markers for the selected start and end points - use WeakMaps for better memory management
const startMarkers = new WeakMap<L.Map, L.Marker>();
const endMarkers = new WeakMap<L.Map, L.Marker>();

// Optimized icon creation with cached styles
const createMarkerIcon = (isEndPoint: boolean = false): L.DivIcon => {
  const color = isEndPoint ? '#ef4444' : '#10b981'; // Red for end, green for start

  return L.divIcon({
    className: isEndPoint ? 'custom-end-marker' : 'custom-start-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse" style="background-color: ${color}33;"></div>
        <div class="marker-pin" style="background-color: ${color};"></div>
        <div class="marker-pointer" style="border-top-color: ${color};"></div>
      </div>
      <style>
        .marker-container {
          position: relative;
          width: 30px;
          height: 30px;
        }
        .marker-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          animation: pulse 2s infinite;
          top: 0;
          left: 0;
        }
        .marker-pin {
          position: absolute;
          width: 16px;
          height: 16px;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .marker-pointer {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 12px solid;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

// Create a persistent start marker (not removed automatically)
export const createStartMarker = (
  map: L.Map,
  lat: number,
  lng: number
): L.Marker => {
  // Remove existing marker for this map if any
  const existingMarker = startMarkers.get(map);
  if (existingMarker) {
    map.removeLayer(existingMarker);
  }

  // Create marker with optimized icon
  const marker = L.marker([lat, lng], {
    icon: createMarkerIcon(false),
    riseOnHover: true,
    riseOffset: 250,
  }).addTo(map);

  // Store the marker for this map
  startMarkers.set(map, marker);

  // Add optimized popup
  marker.bindPopup(
    `<div style="text-align: center; font-family: system-ui, -apple-system, sans-serif; font-size: 14px;">
      <strong style="color: #10b981;">📍 Point de départ</strong><br>
      <small style="color: #6b7280;">
        <strong>Lat:</strong> ${lat.toFixed(6)}<br>
        <strong>Lng:</strong> ${lng.toFixed(6)}
      </small>
    </div>`,
    {
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
      maxWidth: 200,
      className: 'custom-popup',
    }
  );

  return marker;
};

// Create a persistent end marker (not removed automatically)
export const createEndMarker = (
  map: L.Map,
  lat: number,
  lng: number
): L.Marker => {
  // Remove existing marker for this map if any
  const existingMarker = endMarkers.get(map);
  if (existingMarker) {
    map.removeLayer(existingMarker);
  }

  // Create marker with optimized icon
  const marker = L.marker([lat, lng], {
    icon: createMarkerIcon(true),
    riseOnHover: true,
    riseOffset: 250,
  }).addTo(map);

  // Store the marker for this map
  endMarkers.set(map, marker);

  // Add optimized popup
  marker.bindPopup(
    `<div style="text-align: center; font-family: system-ui, -apple-system, sans-serif; font-size: 14px;">
      <strong style="color: #ef4444;">🏁 Point d'arrivée</strong><br>
      <small style="color: #6b7280;">
        <strong>Lat:</strong> ${lat.toFixed(6)}<br>
        <strong>Lng:</strong> ${lng.toFixed(6)}
      </small>
    </div>`,
    {
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
      maxWidth: 200,
      className: 'custom-popup',
    }
  );

  return marker;
};

// Click mode management for handling different marker types
interface ClickMode {
  type: 'start' | 'end' | null;
  onLocationSelect: ((lat: number, lng: number) => void) | null;
}

const clickModes = new WeakMap<L.Map, ClickMode>();

export const setMapClickMode = (
  map: L.Map,
  type: 'start' | 'end' | null,
  onLocationSelect?: (lat: number, lng: number) => void
): (() => void) => {
  // Get or create click mode for this map
  let clickMode = clickModes.get(map);
  if (!clickMode) {
    clickMode = { type: null, onLocationSelect: null };
    clickModes.set(map, clickMode);

    // Add the unified click handler only once
    const handleClick = (e: L.LeafletMouseEvent) => {
      const currentMode = clickModes.get(map);
      if (!currentMode || !currentMode.type || !currentMode.onLocationSelect)
        return;

      const { lat, lng } = e.latlng;

      // Create persistent marker based on current mode
      const marker =
        currentMode.type === 'start'
          ? createStartMarker(map, lat, lng)
          : createEndMarker(map, lat, lng);

      // Open popup with slight delay for better UX
      requestAnimationFrame(() => {
        marker.openPopup();
      });

      currentMode.onLocationSelect(lat, lng);
    };

    map.on('click', handleClick);
  }

  // Update the mode
  clickMode.type = type;
  clickMode.onLocationSelect = onLocationSelect || null;

  // Return cleanup function
  return () => {
    const currentMode = clickModes.get(map);
    if (currentMode) {
      currentMode.type = null;
      currentMode.onLocationSelect = null;
    }
  };
};

export const addClickHandler = (
  map: L.Map,
  onLocationSelect: (lat: number, lng: number) => void,
  type: 'start' | 'end' = 'start'
): (() => void) => {
  return setMapClickMode(map, type, onLocationSelect);
};

export const addClickHandlerForEnd = (
  map: L.Map,
  onLocationSelect: (lat: number, lng: number) => void
): (() => void) => {
  return setMapClickMode(map, 'end', onLocationSelect);
};

export const removeStartMarker = (map: L.Map): void => {
  const marker = startMarkers.get(map);
  if (marker) {
    map.removeLayer(marker);
    startMarkers.delete(map);
  }
};

export const removeEndMarker = (map: L.Map): void => {
  const marker = endMarkers.get(map);
  if (marker) {
    map.removeLayer(marker);
    endMarkers.delete(map);
  }
};

// Helper functions to add markers directly when locations are selected
export const addStartMarker = (
  map: L.Map,
  lat: number,
  lng: number
): L.Marker => {
  return createStartMarker(map, lat, lng);
};

export const addEndMarker = (
  map: L.Map,
  lat: number,
  lng: number
): L.Marker => {
  return createEndMarker(map, lat, lng);
};

// Optimized map cleanup with better error handling
export const cleanupMap = (
  mapInstance: L.Map | null,
  elementId: string
): void => {
  try {
    // If a map instance exists, remove it properly
    if (mapInstance) {
      // Clear all Leaflet references safely
      const container = mapInstance.getContainer();
      container.style.removeProperty('cursor');
      mapInstance.remove();
    }

    // Complete container cleanup
    const mapContainer = document.getElementById(elementId);
    if (mapContainer) {
      // Remove all Leaflet references
      (mapContainer as HTMLElement & { _leaflet_id?: string })._leaflet_id =
        undefined;
      (mapContainer as HTMLElement & { _leaflet?: unknown })._leaflet =
        undefined;

      // Clear the container of any residual content
      while (mapContainer.firstChild) {
        mapContainer.removeChild(mapContainer.firstChild);
      }
    }
  } catch (error) {
    console.error('Error during map cleanup:', error);
  }
};

export const fetchRoute = async (
  start: [number, number],
  end: [number, number],
  profile: string,
  apiKey: string
): Promise<RouteResponse> => {
  try {
    const response = await apiClient.post(
      `${ORS_API_URL}/${profile}/geojson`,
      {
        coordinates: [
          [start[1], start[0]],
          [end[1], end[0]],
        ],
        radiuses: [500000, 500000],
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    // Enhanced error handling
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        throw new Error(
          'Invalid API key. Please check your OpenRouteService API key.'
        );
      } else if (status === 403) {
        throw new Error('API access denied. Check your API key permissions.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (status === 404) {
        throw new Error('Route not found. Try different locations.');
      } else if (status && status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Route calculation failed: ${message}`);
      }
    }

    throw new Error('Network error. Please check your internet connection.');
  }
};

export const calculateElevation = async (
  coordinates: [number, number][]
): Promise<{ ascent: number; descent: number }> => {
  // Limit to 100 points for the API
  let coords = coordinates;
  if (coords.length > 100) {
    const step = Math.ceil(coords.length / 100);
    coords = coords.filter((_, i: number) => i % step === 0);
    if (coords[coords.length - 1] !== coordinates[coordinates.length - 1]) {
      coords.push(coordinates[coordinates.length - 1]);
    }
  }

  const response = await fetch(ELEVATION_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locations: coords.map(([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      })),
    }),
  });

  const data = await response.json();
  const elevations = data.results.map(
    (pt: { elevation: number }) => pt.elevation
  );

  let ascent = 0,
    descent = 0;
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) ascent += diff;
    else descent -= diff;
  }

  return {
    ascent: Math.round(ascent),
    descent: Math.round(descent),
  };
};

export const addRouteToMap = (
  map: L.Map,
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature,
  profile: string
): L.GeoJSON | null => {
  if (!map || !map.addLayer) {
    console.error("La carte n'est pas correctement initialisée");
    return null;
  }

  // Trouver la couleur correspondant au profil
  const transportMode = TRANSPORT_MODES.find(mode => mode.id === profile);
  const color = transportMode?.color || '#2563eb'; // Default blue if profile not found

  try {
    const layer = L.geoJSON(geojson, {
      style: {
        color: color,
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      },
    });
    return layer.addTo(map);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la trace à la carte:", error);
    return null;
  }
};
