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
    if (!showTrace) return;

    const fetchAndDisplayRoute = async () => {
      setError(null);
      setSummary(null);
      setIsLoading(true);

      try {
        // Nettoyage de la carte existante
        cleanupMap(mapRef.current, "map");

        // Initialisation de la nouvelle carte
        const center = calculateCenter(traceStart, traceEnd);
        mapRef.current = initializeMap("map", center);

        // Récupération de l'itinéraire
        const routeData = await fetchRoute(
          traceStart,
          traceEnd,
          profile,
          import.meta.env.VITE_ORS_API_KEY
        );

        if (!routeData?.features?.length) {
          throw new Error("Aucun itinéraire trouvé entre ces deux points.");
        }

        // Traitement des données et affichage
        const feature = routeData.features[0];
        const summaryData = await processSummaryData(feature);
        setSummary(summaryData);
        addRouteToMap(mapRef.current, routeData);
      } catch (err) {
        setError(
          err.message || "Erreur lors de la récupération de l'itinéraire."
        );
        console.error("Erreur de traitement de l'itinéraire :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDisplayRoute();

    return () => {
      cleanupMap(mapRef.current, "map");
    };
  }, [
    traceStart,
    traceEnd,
    showTrace,
    profile,
    calculateCenter,
    processSummaryData,
  ]);

  return { mapRef, error, summary, isLoading };
}
