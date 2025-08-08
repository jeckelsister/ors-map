import {
  addClickHandler,
  addClickHandlerForEnd,
  addEndMarker,
  addRouteToMap,
  addStartMarker,
  calculateElevation,
  cleanupMap,
  fetchRoute,
  initializeMap,
  removeEndMarker,
  removeStartMarker,
} from '@/services/mapService';
import type {
  Location,
  RouteSummaryData,
  UseMapRouteReturn,
} from '@/types/profile';
import {
  calculateCenter,
  formatDistance,
  formatDuration,
} from '@/utils/routeUtils';
import type { GeoJSON, Map as LeafletMap } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseMapRouteProps {
  traceStart: Location | null;
  traceEnd: Location | null;
  showTrace: boolean;
  profile?: string;
}

export default function useMapRoute({
  traceStart,
  traceEnd,
  showTrace,
  profile = 'foot-hiking',
}: UseMapRouteProps): UseMapRouteReturn {
  // Refs for performance - avoid re-renders
  const mapRef = useRef<LeafletMap | null>(null);
  const routeLayersRef = useRef<Record<string, GeoJSON>>({});
  const summariesRef = useRef<Record<string, RouteSummaryData>>({});
  const clickHandlerCleanupRef = useRef<(() => void) | null>(null);
  const endClickHandlerCleanupRef = useRef<(() => void) | null>(null);
  const isStartClickModeRef = useRef<boolean>(false);
  const isEndClickModeRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // State
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<RouteSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Memoized route validation
  const canCalculateRoute = useMemo(() => {
    return traceStart?.lat && traceStart?.lng && traceEnd?.lat && traceEnd?.lng;
  }, [traceStart?.lat, traceStart?.lng, traceEnd?.lat, traceEnd?.lng]);

  const processSummaryData = useCallback(
    async (feature: {
      properties: {
        summary: { distance: number; duration: number };
        ascent?: number;
        descent?: number;
      };
      geometry: { coordinates: [number, number][] };
    }): Promise<RouteSummaryData> => {
      const { summary: routeSummary, ascent, descent } = feature.properties;

      // Use utility functions for formatting
      const distanceText = formatDistance(routeSummary.distance);
      const durationText = formatDuration(routeSummary.duration);

      if (typeof ascent === 'number' && typeof descent === 'number') {
        return {
          duration: durationText,
          distance: distanceText,
          ascent,
          descent,
        };
      }

      try {
        const elevationData = await calculateElevation(
          feature.geometry.coordinates
        );
        return {
          duration: durationText,
          distance: distanceText,
          ...elevationData,
        };
      } catch (error) {
        console.warn("Erreur lors du calcul de l'élévation :", error);
        return {
          duration: durationText,
          distance: distanceText,
          ascent: null,
          descent: null,
        };
      }
    },
    []
  );

  useEffect(() => {
    // Initialize map only once
    const initMap = () => {
      if (!mapRef.current) {
        const center: [number, number] = [46.603354, 1.888334]; // Center of France
        const map = initializeMap('map', center);
        if (map) {
          mapRef.current = map;
        }
      }
    };

    // Ensure map container exists
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      initMap();
    } else {
      // If container doesn't exist yet, wait for it to be created
      const observer = new MutationObserver((_, obs) => {
        const container = document.getElementById('map');
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

  // Optimized route calculation effect with abort controller
  useEffect(() => {
    if (!showTrace || !canCalculateRoute || !mapRef.current) return;

    // Check if we already calculated this route for this profile
    if (routeLayersRef.current[profile]) {
      const existingSummary = summariesRef.current[profile];
      if (existingSummary) {
        setSummary(existingSummary);
        setIsLoading(false);
        return;
      }
    }

    const fetchAndDisplayRoute = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setError(null);
      setIsLoading(true);

      try {
        // Update the center of the existing map
        if (traceStart && traceEnd) {
          const center = calculateCenter(traceStart, traceEnd);
          mapRef.current?.setView(center, 13);
        }

        // Route retrieval with abort signal
        const routeData = await fetchRoute(
          [traceStart!.lat, traceStart!.lng],
          [traceEnd!.lat, traceEnd!.lng],
          profile,
          import.meta.env.VITE_ORS_API_KEY
        );

        if (!routeData?.features?.length) {
          throw new Error('No route found between these two points.');
        }

        // Data processing and display
        const feature = routeData.features[0];
        const summaryData = await processSummaryData(feature);

        // Add the new trace to the map
        if (mapRef.current) {
          const routeLayer = addRouteToMap(mapRef.current, routeData, profile);
          if (routeLayer) {
            routeLayersRef.current[profile] = routeLayer;
          }
        }

        // Update summaries
        summariesRef.current[profile] = summaryData;
        setSummary(summaryData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error while retrieving the route.'
        );
        console.error('Route processing error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndDisplayRoute();

    return () => {
      // Ne pas nettoyer la carte ici, on veut la garder
    };
  }, [
    showTrace,
    canCalculateRoute,
    profile,
    processSummaryData,
    traceStart,
    traceEnd,
  ]);

  // Optimized trace cleanup effect
  useEffect(() => {
    if (!showTrace) {
      // Clean only the traces, not the map itself
      Object.values(routeLayersRef.current).forEach(layer => {
        if (layer && layer.remove) {
          layer.remove();
        }
      });
      routeLayersRef.current = {};
      summariesRef.current = {};
      setSummary(null);
    }
  }, [showTrace]);

  // Enhanced cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clean up click handlers
      if (clickHandlerCleanupRef.current) {
        clickHandlerCleanupRef.current();
      }
      if (endClickHandlerCleanupRef.current) {
        endClickHandlerCleanupRef.current();
      }

      if (mapRef.current) {
        cleanupMap(mapRef.current, 'map');
        mapRef.current = null;
        routeLayersRef.current = {};
      }
    };
  }, []);

  const removeRoute = useCallback(
    (profileToRemove: string) => {
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

  const enableMapClickForStart = useCallback(
    (onLocationSelect: (lat: number, lng: number) => void) => {
      if (!mapRef.current) return;

      // Clean up any existing start click handler
      if (clickHandlerCleanupRef.current) {
        clickHandlerCleanupRef.current();
      }

      // Set click mode to start
      clickHandlerCleanupRef.current = addClickHandler(
        mapRef.current,
        onLocationSelect,
        'start'
      );

      isStartClickModeRef.current = true;

      // Update cursor
      const container = mapRef.current.getContainer();
      if (container) {
        container.style.cursor = 'crosshair';
        container.style.transition = 'cursor 0.2s ease';
      }
    },
    []
  );

  const disableMapClickForStart = useCallback(() => {
    if (!mapRef.current) return;

    // Clean up click handler
    if (clickHandlerCleanupRef.current) {
      clickHandlerCleanupRef.current();
      clickHandlerCleanupRef.current = null;
    }

    isStartClickModeRef.current = false;

    // Reset cursor only if end mode is not active
    if (!isEndClickModeRef.current) {
      const container = mapRef.current.getContainer();
      if (container) {
        container.style.cursor = '';
        container.style.transition = 'cursor 0.2s ease';
      }
    }
  }, []);

  const clearStartMarker = useCallback(() => {
    if (!mapRef.current) return;
    removeStartMarker(mapRef.current);
  }, []);

  const enableMapClickForEnd = useCallback(
    (onLocationSelect: (lat: number, lng: number) => void) => {
      if (!mapRef.current) return;

      // Clean up any existing end click handler
      if (endClickHandlerCleanupRef.current) {
        endClickHandlerCleanupRef.current();
      }

      // Set click mode to end
      endClickHandlerCleanupRef.current = addClickHandlerForEnd(
        mapRef.current,
        onLocationSelect
      );

      isEndClickModeRef.current = true;

      // Update cursor
      const container = mapRef.current.getContainer();
      if (container) {
        container.style.cursor = 'crosshair';
        container.style.transition = 'cursor 0.2s ease';
      }
    },
    []
  );

  const disableMapClickForEnd = useCallback(() => {
    if (!mapRef.current) return;

    // Clean up click handler
    if (endClickHandlerCleanupRef.current) {
      endClickHandlerCleanupRef.current();
      endClickHandlerCleanupRef.current = null;
    }

    isEndClickModeRef.current = false;

    // Reset cursor only if start mode is not active
    if (!isStartClickModeRef.current) {
      const container = mapRef.current.getContainer();
      if (container) {
        container.style.cursor = '';
        container.style.transition = 'cursor 0.2s ease';
      }
    }
  }, []);

  const clearEndMarker = useCallback(() => {
    if (!mapRef.current) return;
    removeEndMarker(mapRef.current);
  }, []);

  const createStartMarkerFromLocation = useCallback((location: Location) => {
    if (!mapRef.current) return;
    addStartMarker(mapRef.current, location.lat, location.lng);
  }, []);

  const createEndMarkerFromLocation = useCallback((location: Location) => {
    if (!mapRef.current) return;
    addEndMarker(mapRef.current, location.lat, location.lng);
  }, []);

  return {
    mapRef,
    error,
    summary,
    isLoading,
    removeRoute,
    getActiveRoutes,
    enableMapClickForStart,
    disableMapClickForStart,
    clearStartMarker,
    enableMapClickForEnd,
    disableMapClickForEnd,
    clearEndMarker,
    createStartMarkerFromLocation,
    createEndMarkerFromLocation,
  };
}
