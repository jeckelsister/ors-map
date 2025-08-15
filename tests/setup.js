import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Mock geolocation API
Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
  },
  writable: true,
});

// Mock fetch for tests
globalThis.fetch = vi.fn();

// Mock Leaflet to avoid errors in tests
vi.mock('leaflet', () => {
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    fitBounds: vi.fn().mockReturnThis(),
    setZoom: vi.fn().mockReturnThis(),
    panTo: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn().mockReturnThis(),
    doubleClickZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    scrollWheelZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    dragging: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    touchZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    boxZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    keyboard: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
  };

  const mockLayer = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setOpacity: vi.fn().mockReturnThis(),
  };

  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    setLatLng: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
  };

  const L = {
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => mockLayer),
    marker: vi.fn(() => mockMarker),
    control: {
      zoom: vi.fn(() => ({
        addTo: vi.fn(),
      })),
    },
    geoJSON: vi.fn(() => mockLayer),
    polyline: vi.fn(() => mockLayer),
    DivIcon: vi.fn(),
    divIcon: vi.fn(() => ({})),
    Icon: {
      Default: {
        mergeOptions: vi.fn(),
      },
    },
  };

  return {
    default: L,
    ...L,
  };
});

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock modules that use import.meta
vi.mock('../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock hiking service
vi.mock('../src/services/hikingService', () => ({
  createHikingRoute: vi.fn(),
  findRefugesNearRoute: vi.fn(),
  findWaterPointsNearRoute: vi.fn(),
  exportToGPX: vi.fn(),
}));

// Mock map service
vi.mock('../src/services/mapService', () => ({
  initializeMap: vi.fn(() => ({
    setView: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    fitBounds: vi.fn().mockReturnThis(),
    setZoom: vi.fn().mockReturnThis(),
    panTo: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn().mockReturnThis(),
    doubleClickZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    scrollWheelZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    dragging: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    touchZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    boxZoom: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
    keyboard: {
      disable: vi.fn(),
      enable: vi.fn(),
    },
  })),
  changeMapLayer: vi.fn(),
  getRoute: vi.fn(),
  getAddressSuggestions: vi.fn(),
  getCoordinatesFromAddress: vi.fn(),
  MAP_LAYERS: {
    osmFrance: {
      url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap France | &copy; OpenStreetMap contributors',
      name: 'OSM France (Rando)',
    },
    openTopoMap: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors | &copy; OpenTopoMap (CC-BY-SA)',
      name: 'OpenTopoMap',
    },
    cyclOSM: {
      url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap France | &copy; OpenStreetMap contributors',
      name: 'CyclOSM France',
    },
  },
  getAvailableMapLayers: vi.fn(() => [
    {
      key: 'osmFrance',
      name: 'OSM France (Rando)',
      available: true,
    },
    {
      key: 'openTopoMap',
      name: 'OpenTopoMap',
      available: true,
    },
    {
      key: 'cyclOSM',
      name: 'CyclOSM France',
      available: true,
    },
  ]),
}));
