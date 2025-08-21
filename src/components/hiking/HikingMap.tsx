import MapLayerSelector from '@/components/map/MapLayerSelector';
import {
  changeMapLayer,
  initializeMap,
  MAP_LAYERS,
} from '@/services/mapService';
import type {
  EnrichedPOIs,
  HikingRoute,
  Refuge,
  WaterPoint,
} from '@/types/hiking';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

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
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const routeMarkersRef = useRef<L.Marker[]>([]);
  const refugeLayersRef = useRef<L.Marker[]>([]);
  const waterPointLayersRef = useRef<L.Marker[]>([]);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  // Enriched POI layer references
  const peakLayersRef = useRef<L.Marker[]>([]);
  const passLayersRef = useRef<L.Marker[]>([]);
  const viewpointLayersRef = useRef<L.Marker[]>([]);
  const heritageLayersRef = useRef<L.Marker[]>([]);
  const lakeLayersRef = useRef<L.Marker[]>([]);
  const [currentMapLayer, setCurrentMapLayer] =
    useState<keyof typeof MAP_LAYERS>('osmFrance');
  const [showLayerSelector, setShowLayerSelector] = useState<boolean>(false);

  // Helper function to create icon HTML with Lucide icons
  const createIconHtml = (iconName: string, color: string, label: string) => {
    const iconMap = {
      home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>',
      droplets:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.6 4.14 5.78s3.86 2.19 3.86 3.27a4.43 4.43 0 0 1-.86 2.71"></path><path d="M17.8 11.9A3 3 0 0 0 15 9h-1.26a4.24 4.24 0 0 1-.63-1.67"></path></svg>',
      mountain:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>',
      castle:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M4 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M18 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M10 8V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"></path><circle cx="8" cy="6" r="2"></circle><circle cx="16" cy="6" r="2"></circle></svg>',
      eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      landmark:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>',
      waves:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>',
    };

    // Use fixed color classes to ensure they're included in Tailwind build
    const colorClasses = {
      gray: 'bg-gray-600 text-white',
      amber: 'bg-amber-600 text-white',
      purple: 'bg-purple-600 text-white',
      orange: 'bg-orange-600 text-white',
      blue: 'bg-blue-600 text-white',
      red: 'bg-red-600 text-white',
      green: 'bg-green-600 text-white',
      indigo: 'bg-indigo-600 text-white',
      pink: 'bg-pink-600 text-white',
      yellow: 'bg-yellow-600 text-white',
    };

    const colorClass =
      colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;

    return `
      <div class="${colorClass} rounded-lg px-2 py-1 text-xs font-medium shadow-lg flex items-center gap-1">
        ${iconMap[iconName as keyof typeof iconMap] || iconMap.mountain}
        <span>${label}</span>
      </div>
    `;
  };

  // Helper function to create legend icon
  const createLegendIcon = (iconName: string) => {
    const iconMap = {
      home: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline></svg>',
      droplets:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2.04 4.6 4.14 5.78s3.86 2.19 3.86 3.27a4.43 4.43 0 0 1-.86 2.71"></path><path d="M17.8 11.9A3 3 0 0 0 15 9h-1.26a4.24 4.24 0 0 1-.63-1.67"></path></svg>',
      mountain:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>',
      castle:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"></path><path d="M4 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M18 20V10a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v10"></path><path d="M10 8V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v4"></path><circle cx="8" cy="6" r="2"></circle><circle cx="16" cy="6" r="2"></circle></svg>',
      eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      landmark:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"></line><line x1="6" x2="6" y1="18" y2="11"></line><line x1="10" x2="10" y1="18" y2="11"></line><line x1="14" x2="14" y1="18" y2="11"></line><line x1="18" x2="18" y1="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>',
      waves:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>',
    };

    return iconMap[iconName as keyof typeof iconMap] || iconMap.mountain;
  };

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

        const stageMarker = L.marker(
          [stage.startPoint.lat, stage.startPoint.lng],
          {
            icon: startIcon,
          }
        ).addTo(mapRef.current!).bindPopup(`
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

      const finishMarker = L.marker(
        [lastStage.endPoint.lat, lastStage.endPoint.lng],
        {
          icon: finishIcon,
        }
      ).addTo(mapRef.current!).bindPopup(`
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
          html: createIconHtml('home', 'blue', refuge.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
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
          html: createIconHtml('droplets', 'indigo', waterPoint.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
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
        // Point A (start) - Green
        markerHtml = `
          <div class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
            A
          </div>
        `;
        markerClass = 'start-marker';
      } else if (isEnd) {
        // Point B (arrival) - Red
        markerHtml = `
          <div class="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
            B
          </div>
        `;
        markerClass = 'end-marker';
      } else {
        // Intermediate stages - Blue with number
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

  // Display peaks
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing peak markers
    peakLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    peakLayersRef.current = [];

    if (showPeaks && enrichedPOIs.peaks.length > 0) {
      enrichedPOIs.peaks.forEach(peak => {
        const icon = L.divIcon({
          className: 'peak-marker',
          html: createIconHtml('mountain', 'gray', peak.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([peak.lat, peak.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${peak.name}</strong><br>
              <small>Altitude: ${peak.elevation}m</small><br>
              ${peak.prominence ? `<small>Proéminence: ${peak.prominence}m</small><br>` : ''}
              ${peak.difficulty ? `<small>Difficulté: ${peak.difficulty}</small><br>` : ''}
              ${peak.climbing_grade ? `<small>Cotation: ${peak.climbing_grade}</small><br>` : ''}
              ${peak.description ? `<small>${peak.description}</small>` : ''}
            </div>
          `);

        peakLayersRef.current.push(marker);
      });
    }
  }, [showPeaks, enrichedPOIs.peaks]);

  // Display passes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing pass markers
    passLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    passLayersRef.current = [];

    if (showPasses && enrichedPOIs.passes.length > 0) {
      enrichedPOIs.passes.forEach(pass => {
        const icon = L.divIcon({
          className: 'pass-marker',
          html: createIconHtml('castle', 'amber', pass.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([pass.lat, pass.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${pass.name}</strong><br>
              <small>Altitude: ${pass.elevation}m</small><br>
              <small>Type: ${pass.type}</small><br>
              ${pass.connects ? `<small>Relie: ${pass.connects.join(', ')}</small><br>` : ''}
              ${pass.difficulty ? `<small>Difficulté: ${pass.difficulty}</small><br>` : ''}
              ${pass.seasonal_access ? `<small>Accès: ${pass.seasonal_access}</small><br>` : ''}
              ${pass.description ? `<small>${pass.description}</small>` : ''}
            </div>
          `);

        passLayersRef.current.push(marker);
      });
    }
  }, [showPasses, enrichedPOIs.passes]);

  // Display viewpoints
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing viewpoint markers
    viewpointLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    viewpointLayersRef.current = [];

    if (showViewpoints && enrichedPOIs.viewpoints.length > 0) {
      enrichedPOIs.viewpoints.forEach(viewpoint => {
        const icon = L.divIcon({
          className: 'viewpoint-marker',
          html: createIconHtml('eye', 'purple', viewpoint.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([viewpoint.lat, viewpoint.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${viewpoint.name}</strong><br>
              <small>Altitude: ${viewpoint.elevation}m</small><br>
              ${viewpoint.direction ? `<small>Direction: ${viewpoint.direction}</small><br>` : ''}
              <small>Vue panoramique: ${viewpoint.panoramic ? 'Oui' : 'Non'}</small><br>
              ${viewpoint.visible_peaks ? `<small>Sommets visibles: ${viewpoint.visible_peaks.join(', ')}</small><br>` : ''}
              ${viewpoint.best_time ? `<small>Meilleur moment: ${viewpoint.best_time}</small><br>` : ''}
              ${viewpoint.description ? `<small>${viewpoint.description}</small>` : ''}
            </div>
          `);

        viewpointLayersRef.current.push(marker);
      });
    }
  }, [showViewpoints, enrichedPOIs.viewpoints]);

  // Display heritage sites
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing heritage markers
    heritageLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    heritageLayersRef.current = [];

    if (showHeritage && enrichedPOIs.heritage.length > 0) {
      enrichedPOIs.heritage.forEach(heritage => {
        const icon = L.divIcon({
          className: 'heritage-marker',
          html: createIconHtml('landmark', 'orange', heritage.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([heritage.lat, heritage.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${heritage.name}</strong><br>
              <small>Type: ${heritage.type}</small><br>
              ${heritage.period ? `<small>Période: ${heritage.period}</small><br>` : ''}
              ${heritage.unesco ? `<small>Site UNESCO: Oui</small><br>` : ''}
              ${heritage.entry_fee ? `<small>Entrée payante</small><br>` : ''}
              ${heritage.opening_hours ? `<small>Horaires: ${heritage.opening_hours}</small><br>` : ''}
              ${heritage.description ? `<small>${heritage.description}</small>` : ''}
            </div>
          `);

        heritageLayersRef.current.push(marker);
      });
    }
  }, [showHeritage, enrichedPOIs.heritage]);

  // Display lakes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing lake markers
    lakeLayersRef.current.forEach(marker => {
      mapRef.current!.removeLayer(marker);
    });
    lakeLayersRef.current = [];

    if (showLakes && enrichedPOIs.lakes.length > 0) {
      enrichedPOIs.lakes.forEach(lake => {
        const icon = L.divIcon({
          className: 'lake-marker',
          html: createIconHtml('waves', 'blue', lake.name),
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const marker = L.marker([lake.lat, lake.lng], { icon }).addTo(
          mapRef.current!
        ).bindPopup(`
            <div>
              <strong>${lake.name}</strong><br>
              <small>Altitude: ${lake.elevation}m</small><br>
              <small>Type: ${lake.type}</small><br>
              ${lake.area ? `<small>Superficie: ${lake.area} ha</small><br>` : ''}
              ${lake.max_depth ? `<small>Profondeur max: ${lake.max_depth}m</small><br>` : ''}
              ${lake.activities ? `<small>Activités: ${lake.activities.join(', ')}</small><br>` : ''}
              ${lake.access_difficulty ? `<small>Accès: ${lake.access_difficulty}</small><br>` : ''}
              ${lake.description ? `<small>${lake.description}</small>` : ''}
            </div>
          `);

        lakeLayersRef.current.push(marker);
      });
    }
  }, [showLakes, enrichedPOIs.lakes]);

  // Expose clearWaypoints function via ref
  useImperativeHandle(
    ref,
    () => ({
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
            duration: 1.0, // 1 second animation
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
    []
  );

  const handleMapLayerChange = (layer: keyof typeof MAP_LAYERS) => {
    if (mapRef.current) {
      changeMapLayer(mapRef.current, layer);
      setCurrentMapLayer(layer);
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-sm ${className}`}>
      {/* Map Layer Selector */}
      <div className="absolute top-4 left-4 z-40" style={{ zIndex: 9999 }}>
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
          {/* Discreet but visible badge */}
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
            className="absolute top-16 left-0 min-w-[280px] z-40"
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
        className="absolute bottom-4 left-4 z-40 bg-white bg-opacity-95 rounded-lg p-3 text-sm shadow-lg border border-gray-200"
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
              title={
                showRefuges ? 'Masquer les refuges' : 'Afficher les refuges'
              }
            >
              <span
                dangerouslySetInnerHTML={{ __html: createLegendIcon('home') }}
              />
              <span
                className={showRefuges ? 'text-green-800' : 'text-gray-600'}
              >
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
              title={
                showWaterPoints
                  ? "Masquer les points d'eau"
                  : "Afficher les points d'eau"
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: createLegendIcon('droplets'),
                }}
              />
              <span
                className={showWaterPoints ? 'text-blue-800' : 'text-gray-600'}
              >
                Points d'eau
              </span>
            </button>
          )}
          {enrichedPOIs.peaks.length > 0 && (
            <button
              onClick={() => onTogglePeaks?.(!showPeaks)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showPeaks
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={showPeaks ? 'Masquer les sommets' : 'Afficher les sommets'}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: createLegendIcon('mountain'),
                }}
              />
              <span className={showPeaks ? 'text-white' : 'text-gray-600'}>
                Sommets
              </span>
            </button>
          )}
          {enrichedPOIs.passes.length > 0 && (
            <button
              onClick={() => onTogglePasses?.(!showPasses)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showPasses
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={showPasses ? 'Masquer les cols' : 'Afficher les cols'}
            >
              <span
                dangerouslySetInnerHTML={{ __html: createLegendIcon('castle') }}
              />
              <span className={showPasses ? 'text-white' : 'text-gray-600'}>
                Cols
              </span>
            </button>
          )}
          {enrichedPOIs.viewpoints.length > 0 && (
            <button
              onClick={() => onToggleViewpoints?.(!showViewpoints)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showViewpoints
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={
                showViewpoints
                  ? 'Masquer les points de vue'
                  : 'Afficher les points de vue'
              }
            >
              <span
                dangerouslySetInnerHTML={{ __html: createLegendIcon('eye') }}
              />
              <span className={showViewpoints ? 'text-white' : 'text-gray-600'}>
                Points de vue
              </span>
            </button>
          )}
          {enrichedPOIs.heritage.length > 0 && (
            <button
              onClick={() => onToggleHeritage?.(!showHeritage)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showHeritage
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={
                showHeritage
                  ? 'Masquer le patrimoine'
                  : 'Afficher le patrimoine'
              }
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: createLegendIcon('landmark'),
                }}
              />
              <span className={showHeritage ? 'text-white' : 'text-gray-600'}>
                Patrimoine
              </span>
            </button>
          )}
          {enrichedPOIs.lakes.length > 0 && (
            <button
              onClick={() => onToggleLakes?.(!showLakes)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                showLakes
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 opacity-60'
              }`}
              title={showLakes ? 'Masquer les lacs' : 'Afficher les lacs'}
            >
              <span
                dangerouslySetInnerHTML={{ __html: createLegendIcon('waves') }}
              />
              <span className={showLakes ? 'text-white' : 'text-gray-600'}>
                Lacs
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
