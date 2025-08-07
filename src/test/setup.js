import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";

// Mock for the geolocation API
Object.defineProperty(globalThis.navigator, "geolocation", {
  value: {
    getCurrentPosition: vi.fn(),
  },
  writable: true,
});

// Mock de fetch pour les tests
globalThis.fetch = vi.fn();

// Mock for Leaflet to avoid errors in tests
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

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
