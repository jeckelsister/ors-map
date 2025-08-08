import MapLayerSelector from '@/components/map/MapLayerSelector';
import {
  changeMapLayer,
  initializeMap,
  MAP_LAYERS,
} from '@/services/mapService';
import type { HikingRoute, Refuge, WaterPoint } from '@/types/hiking';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';

interface HikingMapProps {
  route?: HikingRoute | null;
  refuges?: Refuge[];
  waterPoints?: WaterPoint[];
  showRefuges?: boolean;
  showWaterPoints?: boolean;
  className?: string;
}

const HikingMap: React.FC<HikingMapProps> = ({
  route,
  refuges = [],
  waterPoints = [],
  showRefuges = false,
  showWaterPoints = false,
  className = '',
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const refugeLayersRef = useRef<L.Marker[]>([]);
  const waterPointLayersRef = useRef<L.Marker[]>([]);
  const [currentMapLayer, setCurrentMapLayer] =
    useState<keyof typeof MAP_LAYERS>('osmFrance');
  const [showLayerSelector, setShowLayerSelector] = useState<boolean>(false);

  // Initialize map
  useEffect(() => {
    const mapContainer = document.getElementById('hiking-map');
    if (mapContainer && !mapRef.current) {
      // Default to France center for hiking
      const center: [number, number] = [45.0, 2.0];
      const map = initializeMap('hiking-map', center, 6, 'osmFrance');
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Display route
  useEffect(() => {
    if (!mapRef.current || !route) return;

    // Remove existing route
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

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

      routeLayer.addTo(mapRef.current);
      routeLayerRef.current = routeLayer;

      // Fit map to route bounds
      mapRef.current.fitBounds(routeLayer.getBounds(), {
        padding: [20, 20],
      });

      // Add stage markers
      route.stages.forEach((stage, index) => {
        const startIcon = L.divIcon({
          className: 'stage-marker',
          html: `
            <div class="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
              ${index + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([stage.startPoint.lat, stage.startPoint.lng], {
          icon: startIcon,
        }).addTo(mapRef.current!).bindPopup(`
            <div class="text-center">
              <strong>${stage.name}</strong><br>
              <small>Distance: ${stage.distance}km</small><br>
              <small>Dénivelé: +${stage.ascent}m/-${stage.descent}m</small>
            </div>
          `);
      });

      // Add finish marker for last stage
      const lastStage = route.stages[route.stages.length - 1];
      const finishIcon = L.divIcon({
        className: 'finish-marker',
        html: `
          <div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
            🏁
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([lastStage.endPoint.lat, lastStage.endPoint.lng], {
        icon: finishIcon,
      }).addTo(mapRef.current!).bindPopup(`
          <div class="text-center">
            <strong>Arrivée</strong><br>
            <small>Distance totale: ${route.totalDistance}km</small><br>
            <small>Dénivelé total: +${route.totalAscent}m/-${route.totalDescent}m</small>
          </div>
        `);
    } catch (error) {
      console.error('Error displaying route on map:', error);
    }
  }, [route]);

  // Display refuges
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing refuge markers
    refugeLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    refugeLayersRef.current = [];

    if (showRefuges && refuges.length > 0) {
      refuges.forEach(refuge => {
        const icon = L.divIcon({
          className: 'refuge-marker',
          html: `
            <div class="bg-blue-600 text-white rounded-lg px-2 py-1 text-xs font-medium shadow-lg">
              🏠 ${refuge.name}
            </div>
          `,
          iconSize: [100, 24],
          iconAnchor: [50, 12],
        });

        const marker = L.marker([refuge.lat, refuge.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${refuge.name}</strong><br>
              <small>Type: ${refuge.type}</small><br>
              ${refuge.elevation ? `<small>Altitude: ${refuge.elevation}m</small><br>` : ''}
              ${refuge.capacity ? `<small>Capacité: ${refuge.capacity} places</small><br>` : ''}
              ${refuge.contact ? `<small>Contact: ${refuge.contact}</small>` : ''}
            </div>
          `);

        refugeLayersRef.current.push(marker);
      });
    }
  }, [showRefuges, refuges]);

  // Display water points
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing water point markers
    waterPointLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    waterPointLayersRef.current = [];

    if (showWaterPoints && waterPoints.length > 0) {
      waterPoints.forEach(waterPoint => {
        const icon = L.divIcon({
          className: 'water-marker',
          html: `
            <div class="bg-cyan-500 text-white rounded-lg px-2 py-1 text-xs font-medium shadow-lg">
              💧 ${waterPoint.name}
            </div>
          `,
          iconSize: [100, 24],
          iconAnchor: [50, 12],
        });

        const marker = L.marker([waterPoint.lat, waterPoint.lng], {
          icon,
        }).addTo(mapRef.current!).bindPopup(`
            <div>
              <strong>${waterPoint.name}</strong><br>
              <small>Type: ${waterPoint.type}</small><br>
              <small>Qualité: ${waterPoint.quality}</small><br>
              <small>Fiabilité: ${waterPoint.reliability}</small><br>
              ${waterPoint.elevation ? `<small>Altitude: ${waterPoint.elevation}m</small>` : ''}
              ${waterPoint.notes ? `<br><small>${waterPoint.notes}</small>` : ''}
            </div>
          `);

        waterPointLayersRef.current.push(marker);
      });
    }
  }, [showWaterPoints, waterPoints]);

  const handleMapLayerChange = (layer: keyof typeof MAP_LAYERS) => {
    if (mapRef.current) {
      changeMapLayer(mapRef.current, layer);
      setCurrentMapLayer(layer);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      {/* Map Layer Selector */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-lg transition-colors"
          title="Changer le fond de carte"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>

        {showLayerSelector && (
          <div className="absolute top-12 right-0 min-w-[280px]">
            <MapLayerSelector
              map={mapRef.current}
              currentLayer={currentMapLayer}
              onLayerChange={handleMapLayerChange}
            />
          </div>
        )}
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 rounded-lg p-3 text-sm">
        <div className="flex items-center space-x-4">
          {route && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-1 bg-pink-600 rounded"></div>
              <span>Itinéraire</span>
            </div>
          )}
          {showRefuges && refuges.length > 0 && (
            <div className="flex items-center space-x-1">
              <span>🏠</span>
              <span>Refuges</span>
            </div>
          )}
          {showWaterPoints && waterPoints.length > 0 && (
            <div className="flex items-center space-x-1">
              <span>💧</span>
              <span>Points d'eau</span>
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div id="hiking-map" className="h-96 w-full" />
    </div>
  );
};

export default HikingMap;
