import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateElevation, fetchRoute } from "../../src/services/mapService";

// Mock d'axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Mock de fetch pour l'API d'élévation
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("mapService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchRoute", () => {
    it("should fetch route data successfully", async () => {
      const mockRouteData = {
        features: [
          {
            geometry: {
              coordinates: [
                [2.3522, 48.8566],
                [4.8357, 45.764],
              ],
            },
            properties: {
              summary: {
                distance: 100000,
                duration: 3600,
              },
            },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: mockRouteData });

      const result = await fetchRoute(
        [48.8566, 2.3522], // Paris
        [45.764, 4.8357], // Lyon
        "foot-hiking",
        "test-api-key"
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://api.openrouteservice.org/v2/directions/foot-hiking/geojson",
        {
          coordinates: [
            [2.3522, 48.8566],
            [4.8357, 45.764],
          ],
          radiuses: [500000, 500000],
        },
        {
          headers: {
            Authorization: "test-api-key",
            "Content-Type": "application/json",
          },
        }
      );

      expect(result).toEqual(mockRouteData);
    });

    it("should handle API errors", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("API Error"));

      await expect(
        fetchRoute(
          [48.8566, 2.3522],
          [45.764, 4.8357],
          "foot-hiking",
          "test-api-key"
        )
      ).rejects.toThrow("API Error");
    });
  });

  describe("calculateElevation", () => {
    it("should calculate elevation data", async () => {
      const mockElevationData = {
        results: [
          { elevation: 100 },
          { elevation: 150 },
          { elevation: 120 },
          { elevation: 80 },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockElevationData),
      });

      const coordinates = [
        [2.3522, 48.8566],
        [2.3532, 48.8576],
        [2.3542, 48.8586],
        [2.3552, 48.8596],
      ];

      const result = await calculateElevation(coordinates);

      expect(result).toEqual({
        ascent: 50, // 150-100 = 50
        descent: 70, // (150-120) + (120-80) = 30 + 40 = 70
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.open-elevation.com/api/v1/lookup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            locations: coordinates.map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng,
            })),
          }),
        }
      );
    });

    it("should limit coordinates to 100 points", async () => {
      // Créer plus de 100 coordonnées
      const coordinates = Array.from({ length: 150 }, (_, i) => [
        2.3522 + i * 0.001,
        48.8566 + i * 0.001,
      ]);

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            results: Array.from({ length: 100 }, () => ({ elevation: 100 })),
          }),
      });

      await calculateElevation(coordinates);

      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      const body = JSON.parse(lastCall[1].body);

      // Doit être limité à 100 points maximum
      expect(body.locations.length).toBeLessThanOrEqual(100);
    });
  });
});
