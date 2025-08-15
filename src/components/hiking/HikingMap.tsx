import MapLayerSelector from '@/components/map/MapLayerSelector';
import {
  changeMapLayer,
  initializeMap,
  MAP_LAYERS,
} from '@/services/mapService';
import type { HikingRoute, Refuge, WaterPoint } from '@/types/hiking';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

interface HikingMapProps {
  route?: HikingRoute | null;
  refuges?: Refuge[];
  waterPoints?: WaterPoint[];
  showRefuges?: boolean;
  showWaterPoints?: boolean;
  onToggleRefuges?: (show: boolean) => void;
  onToggleWaterPoints?: (show: boolean) => void;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  waypoints?: Array<{ lat: number; lng: number; name?: string }>;
}

export interface HikingMapRef {
  clearWaypoints: () => void;
  zoomToPOI: (lat: number, lng: number, zoomLevel?: number) => void;
}

const HikingMap = forwardRef<HikingMapRef, HikingMapProps>((props, ref) => {
  const {
    route,
    refuges = [],
    waterPoints = [],
    showRefuges = false,
    showWaterPoints = false,
    onToggleRefuges,
    onToggleWaterPoints,
    className = '',
    onMapClick,
    waypoints = [],
  } = props;
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const routeMarkersRef = useRef<L.Marker[]>([]);
  const refugeLayersRef = useRef<L.Marker[]>([]);
  const waterPointLayersRef = useRef<L.Marker[]>([]);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
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
  }, []); // Removed onMapClick dependency

  // Handle map click events separately
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

  // Display route
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing route layer
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    // Remove existing route markers
    routeMarkersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
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

        const stageMarker = L.marker([stage.startPoint.lat, stage.startPoint.lng], {
          icon: startIcon,
        }).addTo(mapRef.current!).bindPopup(`
            <div class="text-center">
              <strong>${stage.name}</strong><br>
              <small>Distance: ${stage.distance}km</small><br>
              <small>Dénivelé: +${stage.ascent}m/-${stage.descent}m</small>
            </div>
          `);
        
        // Store the marker for cleanup
        routeMarkersRef.current.push(stageMarker);
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

      const finishMarker = L.marker([lastStage.endPoint.lat, lastStage.endPoint.lng], {
        icon: finishIcon,
      }).addTo(mapRef.current!).bindPopup(`
          <div class="text-center">
            <strong>Arrivée</strong><br>
            <small>Distance totale: ${route.totalDistance}km</small><br>
            <small>Dénivelé total: +${route.totalAscent}m/-${route.totalDescent}m</small>
          </div>
        `);
      
      // Store the marker for cleanup
      routeMarkersRef.current.push(finishMarker);
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

  // Display waypoints
  useEffect(() => {
    if (!mapRef.current) return;

    // Always clear existing waypoint markers first
    waypointMarkersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    waypointMarkersRef.current = [];

    // If no waypoints, stop here (during reset cleanup)
    if (!waypoints || waypoints.length === 0) {
      return;
    }

    // Add waypoint markers only for valid coordinates
    waypoints.forEach((waypoint, index) => {
      if (waypoint.lat === 0 && waypoint.lng === 0) {
        return; // Skip invalid coordinates
      }

      const isStart = index === 0;
      const isEnd = index === waypoints.length - 1 && waypoints.length > 1;

      let markerHtml = '';
      let markerClass = '';

      if (isStart) {
        // Point A (départ) - Vert
        markerHtml = `
          <div class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
            A
          </div>
        `;
        markerClass = 'start-marker';
      } else if (isEnd) {
        // Point B (arrivée) - Rouge
        markerHtml = `
          <div class="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
            B
          </div>
        `;
        markerClass = 'end-marker';
      } else {
        // Étapes intermédiaires - Bleu avec numéro
        const stepNumber = index;
        markerHtml = `
          <div class="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
            ${stepNumber}
          </div>
        `;
        markerClass = 'intermediate-marker';
      }

      const icon = L.divIcon({
        className: `waypoint-marker ${markerClass}`,
        html: markerHtml,
        iconSize: isStart || isEnd ? [40, 40] : [32, 32],
        iconAnchor: isStart || isEnd ? [20, 20] : [16, 16],
      });

      const pointType = isStart
        ? 'Départ'
        : isEnd
          ? 'Arrivée'
          : `Étape ${index}`;
      const marker = L.marker([waypoint.lat, waypoint.lng], { icon }).addTo(
        mapRef.current!
      ).bindPopup(`
          <div class="text-center">
            <strong>${pointType}</strong><br>
            <small>${waypoint.name || `Point ${index + 1}`}</small><br>
            <small>Lat: ${waypoint.lat.toFixed(6)}</small><br>
            <small>Lng: ${waypoint.lng.toFixed(6)}</small>
          </div>
        `);

      waypointMarkersRef.current.push(marker);
    });
  }, [waypoints]);

  // Expose clearWaypoints function via ref
  useImperativeHandle(ref, () => ({
    clearWaypoints: () => {
      if (mapRef.current) {
        // Clear waypoint markers
        waypointMarkersRef.current.forEach(marker => {
          mapRef.current!.removeLayer(marker);
        });
        waypointMarkersRef.current = [];
        
        // Clear route markers
        routeMarkersRef.current.forEach(marker => {
          mapRef.current!.removeLayer(marker);
        });
        routeMarkersRef.current = [];
      }
    },
    zoomToPOI: (lat: number, lng: number, zoomLevel: number = 15) => {
      if (!mapRef.current) {
        return;
      }

      try {
        // Zoom to the POI location with smooth animation
        mapRef.current.setView([lat, lng], zoomLevel, {
          animate: true,
          duration: 1.0 // 1 second animation
        });

        // Add a temporary highlight marker
        const highlightIcon = L.divIcon({
          className: 'poi-highlight-marker',
          html: `
            <div style="
              width: 24px; 
              height: 24px; 
              background-color: #ef4444; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 0 0 2px #ef4444;
              animation: pulse 1s infinite;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const tempMarker = L.marker([lat, lng], { icon: highlightIcon }).addTo(mapRef.current);
        
        // Remove the temporary marker after 3 seconds
        setTimeout(() => {
          if (mapRef.current && tempMarker) {
            mapRef.current.removeLayer(tempMarker);
          }
        }, 3000);
      } catch (error) {
        console.error('❌ Erreur lors du zoom:', error);
      }
    }
  }), []);

  const handleMapLayerChange = (layer: keyof typeof MAP_LAYERS) => {
    if (mapRef.current) {
      changeMapLayer(mapRef.current, layer);
      setCurrentMapLayer(layer);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm ${className}`}>
      {/* Map Layer Selector */}
      <div className="absolute top-4 left-4 z-[9999]" style={{ zIndex: 9999 }}>
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className={`
            relative bg-white hover:bg-blue-50 border-2 rounded-xl p-3 shadow-xl
            transition-all duration-200 group
            ${showLayerSelector ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          `}
          title="🗺️ Sélectionner les cartes de randonnée"
          style={{ zIndex: 9999, position: 'relative' }}
        >
          {/* Badge discret mais visible */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

          {/* Label au survol */}
          <div
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2
                         bg-gray-900 text-white text-xs px-3 py-2 rounded-lg
                         opacity-0 group-hover:opacity-100 transition-opacity duration-200
                         whitespace-nowrap z-50 pointer-events-none"
          >
            🗺️ OSM France • OpenTopoMap • CyclOSM
          </div>

          <svg
            className={`w-6 h-6 transition-colors ${
              showLayerSelector
                ? 'text-blue-600'
                : 'text-gray-600 group-hover:text-blue-600'
            }`}
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
          <div
            className="absolute top-16 left-0 min-w-[280px] z-[9999]"
            style={{ zIndex: 9999 }}
          >
            <MapLayerSelector
              map={mapRef.current}
              currentLayer={currentMapLayer}
              onLayerChange={handleMapLayerChange}
            />
          </div>
        )}
      </div>

      {/* Map legend */}
      <div
        className="absolute bottom-4 left-4 z-[9998] bg-white bg-opacity-95 rounded-lg p-3 text-sm shadow-lg border border-gray-200"
        style={{ zIndex: 9998 }}
      >
        <div className="flex items-center space-x-4 flex-wrap">
          {waypoints.length > 0 && (
            <>
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-green-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  A
                </div>
                <span>Départ</span>
              </div>
              {waypoints.length > 2 && (
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    •
                  </div>
                  <span>Étapes</span>
                </div>
              )}
              {waypoints.length > 1 && (
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    B
                  </div>
                  <span>Arrivée</span>
                </div>
              )}
            </>
          )}
          {route && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-1 bg-pink-600 rounded"></div>
              <span>Itinéraire</span>
            </div>
          )}
          {refuges.length > 0 && (
            <button
              onClick={() => onToggleRefuges?.(!showRefuges)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showRefuges 
                  ? 'bg-green-100 hover:bg-green-200' 
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={showRefuges ? 'Masquer les refuges' : 'Afficher les refuges'}
            >
              <span>🏠</span>
              <span className={showRefuges ? 'text-green-800' : 'text-gray-600'}>
                Refuges
              </span>
            </button>
          )}
          {waterPoints.length > 0 && (
            <button
              onClick={() => onToggleWaterPoints?.(!showWaterPoints)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showWaterPoints 
                  ? 'bg-blue-100 hover:bg-blue-200' 
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={showWaterPoints ? 'Masquer les points d\'eau' : 'Afficher les points d\'eau'}
            >
              <span>💧</span>
              <span className={showWaterPoints ? 'text-blue-800' : 'text-gray-600'}>
                Points d'eau
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Map container */}
      <div id="hiking-map" className="h-[calc(100vh-16rem)] w-full" />
    </div>
  );
});

HikingMap.displayName = 'HikingMap';

export default HikingMap;
