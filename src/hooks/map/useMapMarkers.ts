import type { EnrichedPOIs, Refuge, WaterPoint } from '@/types/hiking';
import {
  createPOIIconHtml,
  createWaypointIconHtml,
} from '@/utils/map/mapIcons';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

/**
 * Hook for managing waypoint markers on the map
 */
export const useWaypointMarkers = (
  map: L.Map | null,
  waypoints: Array<{ lat: number; lng: number; name?: string }>
) => {
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new waypoint markers
    waypoints.forEach((waypoint, index) => {
      // Skip invalid coordinates
      if (waypoint.lat === 0 && waypoint.lng === 0) {
        return;
      }

      const { html, className, size, anchor } = createWaypointIconHtml(
        index,
        waypoints.length
      );

      const icon = L.divIcon({
        className: `waypoint-marker ${className}`,
        html,
        iconSize: size,
        iconAnchor: anchor,
      });

      const isStart = index === 0;
      const isEnd = index === waypoints.length - 1 && waypoints.length > 1;
      const pointType = isStart
        ? 'Départ'
        : isEnd
          ? 'Arrivée'
          : `Étape ${index}`;

      const marker = L.marker([waypoint.lat, waypoint.lng], { icon }).addTo(map)
        .bindPopup(`
          <div class="text-center">
            <strong>${pointType}</strong><br>
            <small>${waypoint.name || `Point ${index + 1}`}</small><br>
            <small>Lat: ${waypoint.lat.toFixed(6)}</small><br>
            <small>Lng: ${waypoint.lng.toFixed(6)}</small>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [map, waypoints]);

  const clearMarkers = () => {
    if (map) {
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];
    }
  };

  return { clearMarkers };
};

/**
 * Hook for managing refuge markers on the map
 */
export const useRefugeMarkers = (
  map: L.Map | null,
  refuges: Refuge[],
  showRefuges: boolean
) => {
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    if (showRefuges && refuges.length > 0) {
      refuges.forEach(refuge => {
        const icon = L.divIcon({
          className: 'refuge-marker',
          html: createPOIIconHtml('home', 'blue', refuge.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([refuge.lat, refuge.lng], { icon }).addTo(map)
          .bindPopup(`
            <div>
              <strong>${refuge.name}</strong><br>
              <small>Type: ${refuge.type}</small><br>
              ${refuge.elevation ? `<small>Altitude: ${refuge.elevation}m</small><br>` : ''}
              ${refuge.capacity ? `<small>Capacité: ${refuge.capacity} places</small><br>` : ''}
              ${refuge.contact ? `<small>Contact: ${refuge.contact}</small>` : ''}
            </div>
          `);

        markersRef.current.push(marker);
      });
    }
  }, [map, refuges, showRefuges]);
};

/**
 * Hook for managing water point markers on the map
 */
export const useWaterPointMarkers = (
  map: L.Map | null,
  waterPoints: WaterPoint[],
  showWaterPoints: boolean
) => {
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    if (showWaterPoints && waterPoints.length > 0) {
      waterPoints.forEach(waterPoint => {
        const icon = L.divIcon({
          className: 'water-marker',
          html: createPOIIconHtml('droplets', 'indigo', waterPoint.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([waterPoint.lat, waterPoint.lng], {
          icon,
        }).addTo(map).bindPopup(`
            <div>
              <strong>${waterPoint.name}</strong><br>
              <small>Type: ${waterPoint.type}</small><br>
              <small>Qualité: ${waterPoint.quality}</small><br>
              <small>Fiabilité: ${waterPoint.reliability}</small><br>
              ${waterPoint.elevation ? `<small>Altitude: ${waterPoint.elevation}m</small>` : ''}
              ${waterPoint.notes ? `<br><small>${waterPoint.notes}</small>` : ''}
            </div>
          `);

        markersRef.current.push(marker);
      });
    }
  }, [map, waterPoints, showWaterPoints]);
};

/**
 * Hook for managing enriched POI markers (peaks, passes, etc.)
 */
export const useEnrichedPOIMarkers = (
  map: L.Map | null,
  enrichedPOIs: EnrichedPOIs,
  visibility: {
    showPeaks: boolean;
    showPasses: boolean;
    showViewpoints: boolean;
    showHeritage: boolean;
    showLakes: boolean;
  }
) => {
  const peakMarkersRef = useRef<L.Marker[]>([]);
  const passMarkersRef = useRef<L.Marker[]>([]);
  const viewpointMarkersRef = useRef<L.Marker[]>([]);
  const heritageMarkersRef = useRef<L.Marker[]>([]);
  const lakeMarkersRef = useRef<L.Marker[]>([]);

  // Peaks
  useEffect(() => {
    if (!map) return;

    peakMarkersRef.current.forEach(marker => map.removeLayer(marker));
    peakMarkersRef.current = [];

    if (visibility.showPeaks && enrichedPOIs.peaks.length > 0) {
      enrichedPOIs.peaks.forEach(peak => {
        const icon = L.divIcon({
          className: 'peak-marker',
          html: createPOIIconHtml('mountain', 'gray', peak.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([peak.lat, peak.lng], { icon }).addTo(map)
          .bindPopup(`
            <div>
              <strong>${peak.name}</strong><br>
              <small>Altitude: ${peak.elevation}m</small><br>
              ${peak.prominence ? `<small>Proéminence: ${peak.prominence}m</small><br>` : ''}
              ${peak.difficulty ? `<small>Difficulté: ${peak.difficulty}</small><br>` : ''}
              ${peak.climbingGrade ? `<small>Cotation: ${peak.climbingGrade}</small><br>` : ''}
              ${peak.description ? `<small>${peak.description}</small>` : ''}
            </div>
          `);

        peakMarkersRef.current.push(marker);
      });
    }
  }, [map, enrichedPOIs.peaks, visibility.showPeaks]);

  // Passes
  useEffect(() => {
    if (!map) return;

    passMarkersRef.current.forEach(marker => map.removeLayer(marker));
    passMarkersRef.current = [];

    if (visibility.showPasses && enrichedPOIs.passes.length > 0) {
      enrichedPOIs.passes.forEach(pass => {
        const icon = L.divIcon({
          className: 'pass-marker',
          html: createPOIIconHtml('castle', 'amber', pass.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([pass.lat, pass.lng], { icon }).addTo(map)
          .bindPopup(`
            <div>
              <strong>${pass.name}</strong><br>
              <small>Altitude: ${pass.elevation}m</small><br>
              <small>Type: ${pass.type}</small><br>
              ${pass.connects ? `<small>Relie: ${pass.connects.join(', ')}</small><br>` : ''}
              ${pass.difficulty ? `<small>Difficulté: ${pass.difficulty}</small><br>` : ''}
              ${pass.seasonalAccess ? `<small>Accès: ${pass.seasonalAccess}</small><br>` : ''}
              ${pass.description ? `<small>${pass.description}</small>` : ''}
            </div>
          `);

        passMarkersRef.current.push(marker);
      });
    }
  }, [map, enrichedPOIs.passes, visibility.showPasses]);

  // Viewpoints
  useEffect(() => {
    if (!map) return;

    viewpointMarkersRef.current.forEach(marker => map.removeLayer(marker));
    viewpointMarkersRef.current = [];

    if (visibility.showViewpoints && enrichedPOIs.viewpoints.length > 0) {
      enrichedPOIs.viewpoints.forEach(viewpoint => {
        const icon = L.divIcon({
          className: 'viewpoint-marker',
          html: createPOIIconHtml('eye', 'purple', viewpoint.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([viewpoint.lat, viewpoint.lng], { icon }).addTo(
          map
        ).bindPopup(`
            <div>
              <strong>${viewpoint.name}</strong><br>
              <small>Altitude: ${viewpoint.elevation}m</small><br>
              ${viewpoint.direction ? `<small>Direction: ${viewpoint.direction}</small><br>` : ''}
              <small>Vue panoramique: ${viewpoint.panoramic ? 'Oui' : 'Non'}</small><br>
              ${viewpoint.visiblePeaks ? `<small>Sommets visibles: ${viewpoint.visiblePeaks.join(', ')}</small><br>` : ''}
              ${viewpoint.bestTime ? `<small>Meilleur moment: ${viewpoint.bestTime}</small><br>` : ''}
              ${viewpoint.description ? `<small>${viewpoint.description}</small>` : ''}
            </div>
          `);

        viewpointMarkersRef.current.push(marker);
      });
    }
  }, [map, enrichedPOIs.viewpoints, visibility.showViewpoints]);

  // Heritage sites
  useEffect(() => {
    if (!map) return;

    heritageMarkersRef.current.forEach(marker => map.removeLayer(marker));
    heritageMarkersRef.current = [];

    if (visibility.showHeritage && enrichedPOIs.heritage.length > 0) {
      enrichedPOIs.heritage.forEach(heritage => {
        const icon = L.divIcon({
          className: 'heritage-marker',
          html: createPOIIconHtml('landmark', 'orange', heritage.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([heritage.lat, heritage.lng], { icon }).addTo(
          map
        ).bindPopup(`
            <div>
              <strong>${heritage.name}</strong><br>
              <small>Type: ${heritage.type}</small><br>
              ${heritage.period ? `<small>Période: ${heritage.period}</small><br>` : ''}
              ${heritage.unesco ? `<small>Site UNESCO: Oui</small><br>` : ''}
              ${heritage.entryFee ? `<small>Entrée payante</small><br>` : ''}
              ${heritage.openingHours ? `<small>Horaires: ${heritage.openingHours}</small><br>` : ''}
              ${heritage.description ? `<small>${heritage.description}</small>` : ''}
            </div>
          `);

        heritageMarkersRef.current.push(marker);
      });
    }
  }, [map, enrichedPOIs.heritage, visibility.showHeritage]);

  // Lakes
  useEffect(() => {
    if (!map) return;

    lakeMarkersRef.current.forEach(marker => map.removeLayer(marker));
    lakeMarkersRef.current = [];

    if (visibility.showLakes && enrichedPOIs.lakes.length > 0) {
      enrichedPOIs.lakes.forEach(lake => {
        const icon = L.divIcon({
          className: 'lake-marker',
          html: createPOIIconHtml('waves', 'blue', lake.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([lake.lat, lake.lng], { icon }).addTo(map)
          .bindPopup(`
            <div>
              <strong>${lake.name}</strong><br>
              <small>Altitude: ${lake.elevation}m</small><br>
              <small>Type: ${lake.type}</small><br>
              ${lake.area ? `<small>Superficie: ${lake.area} ha</small><br>` : ''}
              ${lake.maxDepth ? `<small>Profondeur max: ${lake.maxDepth}m</small><br>` : ''}
              ${lake.activities ? `<small>Activités: ${lake.activities.join(', ')}</small><br>` : ''}
              ${lake.accessDifficulty ? `<small>Accès: ${lake.accessDifficulty}</small><br>` : ''}
              ${lake.description ? `<small>${lake.description}</small>` : ''}
            </div>
          `);

        lakeMarkersRef.current.push(marker);
      });
    }
  }, [map, enrichedPOIs.lakes, visibility.showLakes]);
};
