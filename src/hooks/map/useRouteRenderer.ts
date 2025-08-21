import { useEffect, useRef } from 'react';

import L from 'leaflet';

import type { HikingRoute } from '@/types/hiking';
import {
  createFinishMarkerHtml,
  createStageMarkerHtml,
} from '@/utils/map/mapIcons';

/**
 * Hook for managing route display on the map
 */
export const useRouteRenderer = (
  map: L.Map | null,
  route: HikingRoute | null
) => {
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const routeMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Remove existing route layer
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Remove existing route markers
    routeMarkersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    routeMarkersRef.current = [];

    // If no route, stop here (route has been cleared)
    if (!route) return;

    // Add new route
    try {
      const routeLayer = L.geoJSON(route.geojson, {
        style: {
          color: '#e11d48',
          weight: 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        },
      });

      routeLayer.addTo(map);
      routeLayerRef.current = routeLayer;

      // Fit map to route bounds
      map.fitBounds(routeLayer.getBounds(), {
        padding: [20, 20],
      });

      // Add stage markers
      route.stages.forEach((stage, index) => {
        const startIcon = L.divIcon({
          className: 'stage-marker',
          html: createStageMarkerHtml(index + 1),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const stageMarker = L.marker(
          [stage.startPoint.lat, stage.startPoint.lng],
          { icon: startIcon }
        ).addTo(map).bindPopup(`
            <div class="text-center">
              <strong>${stage.name}</strong><br>
              <small>Distance: ${stage.distance}km</small><br>
              <small>Dénivelé: +${stage.ascent}m/-${stage.descent}m</small>
            </div>
          `);

        routeMarkersRef.current.push(stageMarker);
      });

      // Add finish marker for last stage
      const lastStage = route.stages[route.stages.length - 1];
      const finishIcon = L.divIcon({
        className: 'finish-marker',
        html: createFinishMarkerHtml(),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const finishMarker = L.marker(
        [lastStage.endPoint.lat, lastStage.endPoint.lng],
        { icon: finishIcon }
      ).addTo(map).bindPopup(`
          <div class="text-center">
            <strong>Arrivée</strong><br>
            <small>Distance totale: ${route.totalDistance}km</small><br>
            <small>Dénivelé total: +${route.totalAscent}m/-${route.totalDescent}m</small>
          </div>
        `);

      routeMarkersRef.current.push(finishMarker);
    } catch (error) {
      console.error('Error displaying route on map:', error);
    }
  }, [map, route]);

  const clearRoute = () => {
    if (map) {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      routeMarkersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      routeMarkersRef.current = [];
    }
  };

  return { clearRoute };
};
