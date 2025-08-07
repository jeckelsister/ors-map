import axios from "axios";
import L from "leaflet";
import { TRANSPORT_MODES } from "../constants/transportModes";

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
  // Si une instance de carte existe, on la supprime proprement
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Nettoyage complet du conteneur
  const mapContainer = document.getElementById(elementId);
  if (mapContainer) {
    // Remove all Leaflet references
    mapContainer._leaflet_id = undefined;
    mapContainer._leaflet = undefined;

    // Clear the container of any residual content
    while (mapContainer.firstChild) {
      mapContainer.removeChild(mapContainer.firstChild);
    }
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
  // Limit to 100 points for the API
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

export const addRouteToMap = (map, geojson, profile) => {
  if (!map || !map.addLayer) {
    console.error("La carte n'est pas correctement initialisée");
    return null;
  }

  // Trouver la couleur correspondant au profil
  const transportMode = TRANSPORT_MODES.find((mode) => mode.id === profile);
  const color = transportMode?.color || "#2563eb"; // Default blue if profile not found

  try {
    const layer = L.geoJSON(geojson, {
      style: {
        color: color,
        weight: 4,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      },
    });
    return layer.addTo(map);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la trace à la carte:", error);
    return null;
  }
};
