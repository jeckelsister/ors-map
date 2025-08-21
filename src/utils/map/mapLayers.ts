import L from 'leaflet';

/**
 * Map layer configurations for different hiking map types
 */
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
} as const;

export type MapLayerKey = keyof typeof MAP_LAYERS;

let currentLayerGroup: L.TileLayer | null = null;

/**
 * Initializes a Leaflet map with default hiking settings
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

  const defaultLayer = L.tileLayer(MAP_LAYERS.osmFrance.url, {
    attribution: MAP_LAYERS.osmFrance.attribution,
    maxZoom: 19,
  });

  defaultLayer.addTo(map);
  currentLayerGroup = defaultLayer;

  return map;
};

/**
 * Changes the active map layer
 */
export const changeMapLayer = (map: L.Map, layerKey: MapLayerKey): void => {
  if (!map) return;

  if (currentLayerGroup) {
    map.removeLayer(currentLayerGroup);
  }

  const layerConfig = MAP_LAYERS[layerKey];
  const newLayer = L.tileLayer(layerConfig.url, {
    attribution: layerConfig.attribution,
    maxZoom: 19,
  });

  newLayer.addTo(map);
  currentLayerGroup = newLayer;
};
