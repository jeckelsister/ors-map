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
    // Initialisation unique de la carte
    const initMap = () => {
      if (!mapRef.current) {
        const center = [46.603354, 1.888334]; // Centre de la France
        const map = initializeMap("map", center);
        if (map) {
          mapRef.current = map;
        }
      }
    };

    // S'assurer que le conteneur de la carte existe
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      initMap();
    } else {
      // Si le conteneur n'existe pas encore, attendre qu'il soit créé
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

    // Vérifier si on a déjà calculé cet itinéraire pour ce profil
    if (routeLayersRef.current[profile]) {
      // Si l'itinéraire existe déjà, juste mettre à jour le résumé affiché
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
        // Mise à jour du centre de la carte existante
        const center = calculateCenter(traceStart, traceEnd);
        mapRef.current?.setView(center, 13);

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

        // Ajouter la nouvelle trace à la carte
        routeLayersRef.current[profile] = addRouteToMap(
          mapRef.current,
          routeData,
          profile
        );

        // Mettre à jour les résumés
        summariesRef.current[profile] = summaryData;
        setSummary(summaryData);
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
      // Nettoyer seulement les traces, pas la carte elle-même
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

  // Nettoyage de la carte uniquement lorsque le composant est démonté
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

        // Si on supprime la trace du profil actuellement sélectionné, vider le résumé
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
