import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// Mock de l'API de géolocalisation
Object.defineProperty(globalThis.navigator, "geolocation", {
  value: {
    getCurrentPosition: vi.fn(),
  },
  writable: true,
});

// Mock de fetch pour les tests
globalThis.fetch = vi.fn();

// Mock de Leaflet pour éviter les erreurs dans les tests
vi.mock("leaflet", () => ({
  map: vi.fn(() => ({
    setView: vi.fn(),
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
  tileLayer: vi.fn(() => ({
    addTo: vi.fn(),
  })),
  control: {
    zoom: vi.fn(() => ({
      addTo: vi.fn(),
    })),
  },
  geoJSON: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
}));

// Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks();
});
