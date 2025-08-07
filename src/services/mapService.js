import axios from "axios";
import L from "leaflet";

const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ORS_API_URL = "https://api.openrouteservice.org/v2/directions";
const ELEVATION_API_URL = "https://api.open-elevation.com/api/v1/lookup";

export const initializeMap = (elementId, center, zoom = 13) => {
  const map = L.map(elementId, { zoomControl: false }).setView(center, zoom);
  L.tileLayer(MAP_TILE_URL, {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  L.control.zoom({ position: "topright" }).addTo(map);
  return map;
};

export const cleanupMap = (mapInstance, elementId) => {
  if (mapInstance) {
    mapInstance.remove();
  }
  const mapContainer = document.getElementById(elementId);
  if (mapContainer && mapContainer._leaflet_id) {
    mapContainer._leaflet_id = null;
  }
};

export const fetchRoute = async (start, end, profile, apiKey) => {
  const response = await axios.post(
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
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const calculateElevation = async (coordinates) => {
  // Limite à 100 points pour l'API
  let coords = coordinates;
  if (coords.length > 100) {
    const step = Math.ceil(coords.length / 100);
    coords = coords.filter((_, i) => i % step === 0);
    if (coords[coords.length - 1] !== coordinates[coordinates.length - 1]) {
      coords.push(coordinates[coordinates.length - 1]);
    }
  }

  const response = await fetch(ELEVATION_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locations: coords.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      })),
    }),
  });

  const data = await response.json();
  const elevations = data.results.map((pt) => pt.elevation);

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

export const addRouteToMap = (map, geojson) => {
  return L.geoJSON(geojson, {
    style: { color: "blue", weight: 4 },
  }).addTo(map);
};
