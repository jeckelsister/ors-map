import { useCallback, useEffect, useRef, useState } from "react";
import {
  addRouteToMap,
  calculateElevation,
  cleanupMap,
  fetchRoute,
  initializeMap,
} from "../services/mapService";

export default function useMapRoute(
  traceStart,
  traceEnd,
  showTrace,
  profile = "foot-hiking"
) {
  const mapRef = useRef(null);
  const routeLayersRef = useRef({});
  const summariesRef = useRef({});
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateCenter = useCallback((start, end) => {
    return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  }, []);

  const processSummaryData = useCallback(async (feature) => {
    const { summary: routeSummary, ascent, descent } = feature.properties;

    if (typeof ascent === "number" && typeof descent === "number") {
      return {
        duration: routeSummary.duration,
        distance: routeSummary.distance,
        ascent,
        descent,
      };
    }

    try {
      const elevationData = await calculateElevation(
        feature.geometry.coordinates
      );
      return {
        duration: routeSummary.duration,
        distance: routeSummary.distance,
        ...elevationData,
      };
    } catch (error) {
      console.warn("Erreur lors du calcul de l'élévation :", error);
      return {
        duration: routeSummary.duration,
        distance: routeSummary.distance,
        ascent: null,
        descent: null,
      };
    }
  }, []);

  useEffect(() => {
    // Initialize map only once
    const initMap = () => {
      if (!mapRef.current) {
        const center = [46.603354, 1.888334]; // Center of France
        const map = initializeMap("map", center);
        if (map) {
          mapRef.current = map;
        }
      }
    };

    // Ensure map container exists
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      initMap();
    } else {
      // If container doesn't exist yet, wait for it to be created
      const observer = new MutationObserver((mutations, obs) => {
        const container = document.getElementById("map");
        if (container) {
          initMap();
          obs.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (!showTrace || !traceStart?.[0] || !traceEnd?.[0] || !mapRef.current)
      return;

    // Check if we already calculated this route for this profile
    if (routeLayersRef.current[profile]) {
      // If the route already exists, just update the displayed summary
      const existingSummary = summariesRef.current[profile];
      if (existingSummary) {
        setSummary(existingSummary);
        setIsLoading(false);
        return;
      }
    }

    const fetchAndDisplayRoute = async () => {
      setError(null);
      setIsLoading(true);

      try {
        // Update the center of the existing map
        const center = calculateCenter(traceStart, traceEnd);
        mapRef.current?.setView(center, 13);

        // Route retrieval
        const routeData = await fetchRoute(
          traceStart,
          traceEnd,
          profile,
          import.meta.env.VITE_ORS_API_KEY
        );

        if (!routeData?.features?.length) {
          throw new Error("No route found between these two points.");
        }

        // Data processing and display
        const feature = routeData.features[0];
        const summaryData = await processSummaryData(feature);

        // Add the new trace to the map
        routeLayersRef.current[profile] = addRouteToMap(
          mapRef.current,
          routeData,
          profile
        );

        // Update summaries
        summariesRef.current[profile] = summaryData;
        setSummary(summaryData);
      } catch (err) {
        setError(err.message || "Error while retrieving the route.");
        console.error("Route processing error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDisplayRoute();

    return () => {
      // Ne pas nettoyer la carte ici, on veut la garder
    };
  }, [
    traceStart,
    traceEnd,
    showTrace,
    profile,
    calculateCenter,
    processSummaryData,
  ]);

  // Nettoyage des traces quand showTrace devient false
  useEffect(() => {
    if (!showTrace) {
      // Clean only the traces, not the map itself
      Object.values(routeLayersRef.current).forEach((layer) => {
        if (layer && layer.remove) {
          layer.remove();
        }
      });
      routeLayersRef.current = {};
      summariesRef.current = {};
      setSummary(null);
    }
  }, [showTrace]);

  // Map cleanup only when the component is unmounted
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        cleanupMap(mapRef.current, "map");
        mapRef.current = null;
        routeLayersRef.current = {};
      }
    };
  }, []);

  const removeRoute = useCallback(
    (profileToRemove) => {
      const layer = routeLayersRef.current[profileToRemove];
      if (layer && layer.remove) {
        layer.remove();
        delete routeLayersRef.current[profileToRemove];
        delete summariesRef.current[profileToRemove];

        // If we remove the trace for the currently selected profile, clear the summary
        if (profileToRemove === profile) {
          setSummary(null);
        }
      }
    },
    [profile]
  );

  const getActiveRoutes = useCallback(() => {
    return Object.keys(routeLayersRef.current);
  }, []);

  return { mapRef, error, summary, isLoading, removeRoute, getActiveRoutes };
}
