import L from 'leaflet';

// Map tile layer configurations - 3 essential maps for hiking
export const MAP_LAYERS = {
  osmFrance: {
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution:
      '&copy; OpenStreetMap France | &copy; OpenStreetMap contributors',
    name: 'OSM France (Rando)',
  },
  openTopoMap: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; OpenStreetMap contributors | &copy; OpenTopoMap (CC-BY-SA)',
    name: 'OpenTopoMap',
  },
  cyclOSM: {
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution:
      '&copy; OpenStreetMap France | &copy; OpenStreetMap contributors',
    name: 'CyclOSM France',
  },
};

// Current active layer tracking
let currentLayerGroup: L.TileLayer | null = null;

/**
 * Initialize Leaflet map with default settings
 */
export const initializeMap = (
  container: HTMLElement,
  initialLat: number = 45.764043,
  initialLng: number = 4.835659,
  initialZoom: number = 13
): L.Map => {
  const map = L.map(container, {
    center: [initialLat, initialLng],
    zoom: initialZoom,
    zoomControl: true,
  });

  // Add default tile layer
  const defaultLayer = L.tileLayer(MAP_LAYERS.osmFrance.url, {
    attribution: MAP_LAYERS.osmFrance.attribution,
    maxZoom: 19,
  });

  defaultLayer.addTo(map);
  currentLayerGroup = defaultLayer;

  return map;
};

/**
 * Change the tile layer of the map
 */
export const changeMapLayer = (
  map: L.Map,
  layerKey: keyof typeof MAP_LAYERS
): void => {
  if (!map) return;

  // Remove current layer
  if (currentLayerGroup) {
    map.removeLayer(currentLayerGroup);
  }

  // Add new layer
  const layerConfig = MAP_LAYERS[layerKey];
  const newLayer = L.tileLayer(layerConfig.url, {
    attribution: layerConfig.attribution,
    maxZoom: 19,
  });

  newLayer.addTo(map);
  currentLayerGroup = newLayer;
};

/**
 * Get available map layers for UI
 */
export const getAvailableMapLayers = (): Array<{
  key: keyof typeof MAP_LAYERS;
  name: string;
}> => {
  return Object.entries(MAP_LAYERS).map(([key, layer]) => ({
    key: key as keyof typeof MAP_LAYERS,
    name: layer.name,
  }));
};
