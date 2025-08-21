import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// Import new components and utilities
import { MapLayerSelector } from '@/components/map/MapLayerSelector';
import { MapLegend } from '@/components/map/MapLegend';
import {
  useEnrichedPOIMarkers,
  useRefugeMarkers,
  useWaterPointMarkers,
  useWaypointMarkers,
} from '@/hooks/map/useMapMarkers';
import { useRouteRenderer } from '@/hooks/map/useRouteRenderer';
import { createHighlightMarkerHtml } from '@/utils/map/mapIcons';
import {
  changeMapLayer,
  initializeMap,
  type MapLayerKey,
} from '@/utils/map/mapLayers';

import type {
  EnrichedPOIs,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';

interface HikingMapProps {
  route?: HikingRoute | null;
  refuges?: Refuge[];
  waterPoints?: WaterPoint[];
  enrichedPOIs?: EnrichedPOIs;
  showRefuges?: boolean;
  showWaterPoints?: boolean;
  showPeaks?: boolean;
  showPasses?: boolean;
  showViewpoints?: boolean;
  showHeritage?: boolean;
  showLakes?: boolean;
  onToggleRefuges?: (show: boolean) => void;
  onToggleWaterPoints?: (show: boolean) => void;
  onTogglePeaks?: (show: boolean) => void;
  onTogglePasses?: (show: boolean) => void;
  onToggleViewpoints?: (show: boolean) => void;
  onToggleHeritage?: (show: boolean) => void;
  onToggleLakes?: (show: boolean) => void;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  waypoints?: Array<{ lat: number; lng: number; name?: string }>;
}

export interface HikingMapRef {
  clearWaypoints: () => void;
  zoomToPOI: (lat: number, lng: number, zoomLevel?: number) => void;
}

/**
 * Main hiking map component that coordinates all map functionality
 * Refactored to use smaller, more maintainable components and hooks
 */
const HikingMap = forwardRef<HikingMapRef, HikingMapProps>((props, ref) => {
  const {
    route,
    refuges = [],
    waterPoints = [],
    enrichedPOIs = {
      peaks: [],
      passes: [],
      viewpoints: [],
      heritage: [],
      geologicalSites: [],
      lakes: [],
    },
    showRefuges = false,
    showWaterPoints = false,
    showPeaks = false,
    showPasses = false,
    showViewpoints = false,
    showHeritage = false,
    showLakes = false,
    onToggleRefuges,
    onToggleWaterPoints,
    onTogglePeaks,
    onTogglePasses,
    onToggleViewpoints,
    onToggleHeritage,
    onToggleLakes,
    className = '',
    onMapClick,
    waypoints = [],
  } = props;

  const mapRef = useRef<L.Map | null>(null);
  const [currentMapLayer, setCurrentMapLayer] =
    useState<MapLayerKey>('osmFrance');

  // Use new hooks for marker management
  const { clearMarkers: clearWaypointMarkers } = useWaypointMarkers(
    mapRef.current,
    waypoints
  );
  const { clearRoute } = useRouteRenderer(mapRef.current, route || null);

  useRefugeMarkers(mapRef.current, refuges, showRefuges);
  useWaterPointMarkers(mapRef.current, waterPoints, showWaterPoints);
  useEnrichedPOIMarkers(mapRef.current, enrichedPOIs, {
    showPeaks,
    showPasses,
    showViewpoints,
    showHeritage,
    showLakes,
  });

  // Initialize map
  useEffect(() => {
    const mapContainer = document.getElementById('hiking-map');
    if (mapContainer && !mapRef.current) {
      // Default to France center for hiking
      const center: [number, number] = [45.0, 2.0];
      const map = initializeMap(mapContainer, center[0], center[1], 6);

      // Disable double-click zoom to prevent conflicts
      map.doubleClickZoom.disable();

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle map click events
  useEffect(() => {
    if (mapRef.current && onMapClick) {
      const map = mapRef.current;

      const handleDoubleClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      };

      map.on('dblclick', handleDoubleClick);

      return () => {
        map.off('dblclick', handleDoubleClick);
      };
    }
  }, [onMapClick]);

  // Handle map layer changes
  const handleMapLayerChange = (layer: MapLayerKey) => {
    if (mapRef.current) {
      changeMapLayer(mapRef.current, layer);
      setCurrentMapLayer(layer);
    }
  };

  // Expose public methods via ref
  useImperativeHandle(
    ref,
    () => ({
      clearWaypoints: () => {
        clearWaypointMarkers();
        clearRoute();
      },
      zoomToPOI: (lat: number, lng: number, zoomLevel: number = 15) => {
        if (!mapRef.current) {
          return;
        }

        try {
          // Zoom to the POI location with smooth animation
          mapRef.current.setView([lat, lng], zoomLevel, {
            animate: true,
            duration: 1.0, // 1 second animation
          });

          // Add a temporary highlight marker
          const highlightIcon = L.divIcon({
            className: 'poi-highlight-marker',
            html: createHighlightMarkerHtml(),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const tempMarker = L.marker([lat, lng], {
            icon: highlightIcon,
          }).addTo(mapRef.current);

          // Remove the temporary marker after 3 seconds
          setTimeout(() => {
            if (mapRef.current && tempMarker) {
              mapRef.current.removeLayer(tempMarker);
            }
          }, 3000);
        } catch (error) {
          console.error('❌ Erreur lors du zoom:', error);
        }
      },
    }),
    [clearWaypointMarkers, clearRoute]
  );

  return (
    <div className={`relative bg-white rounded-lg shadow-sm ${className}`}>
      {/* Map Layer Selector */}
      <MapLayerSelector
        currentLayer={currentMapLayer}
        onLayerChange={handleMapLayerChange}
      />

      {/* Map Legend */}
      <MapLegend
        waypoints={waypoints}
        hasRoute={!!route}
        refuges={refuges}
        waterPoints={waterPoints}
        enrichedPOIs={enrichedPOIs}
        showRefuges={showRefuges}
        showWaterPoints={showWaterPoints}
        showPeaks={showPeaks}
        showPasses={showPasses}
        showViewpoints={showViewpoints}
        showHeritage={showHeritage}
        showLakes={showLakes}
        onToggleRefuges={onToggleRefuges}
        onToggleWaterPoints={onToggleWaterPoints}
        onTogglePeaks={onTogglePeaks}
        onTogglePasses={onTogglePasses}
        onToggleViewpoints={onToggleViewpoints}
        onToggleHeritage={onToggleHeritage}
        onToggleLakes={onToggleLakes}
      />

      {/* Map container */}
      <div id="hiking-map" className="h-[calc(100vh-16rem)] w-full z-0" />
    </div>
  );
});

HikingMap.displayName = 'HikingMap';

export default HikingMap;
