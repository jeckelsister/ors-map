import useAutocomplete from '@/hooks/map/useAutocomplete';
import useMapRoute from '@/hooks/map/useMapRoute';
import { MAP_LAYERS } from '@/services/mapService';
import type { LocationSuggestion } from '@/types/profile';
import 'leaflet/dist/leaflet.css';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import LocationForm from './LocationForm';
import LocationSearchBox from './LocationSearchBox';
import MapLayerSelector from './MapLayerSelector';
import SummaryDisplay from './SummaryDisplay';
import TransportModeSelector from './TransportModeSelector';

// Loading component extracted for better reusability
const LoadingIndicator = memo(() => (
  <div className="mt-2 text-blue-600 font-medium animate-pulse">
    Calcul de l'itinéraire en cours...
  </div>
));
LoadingIndicator.displayName = 'LoadingIndicator';

const Map = (): React.JSX.Element => {
  const [profile, setProfile] = useState<string>('foot-hiking');
  const [focusQuery, setFocusQuery] = useState<string>('');
  const [focusSuggestions, setFocusSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showTrace, setShowTrace] = useState<boolean>(false);
  const [currentMapLayer, setCurrentMapLayer] =
    useState<keyof typeof MAP_LAYERS>('osmFrance');
  const [showLayerSelector, setShowLayerSelector] = useState<boolean>(false);

  const autocompleteProps = useAutocomplete();

  // Memoized hook props to prevent unnecessary re-renders
  const mapRouteProps = useMemo(
    () => ({
      traceStart: autocompleteProps.traceStart,
      traceEnd: autocompleteProps.traceEnd,
      showTrace,
      profile,
      initialMapLayer: currentMapLayer,
    }),
    [
      autocompleteProps.traceStart,
      autocompleteProps.traceEnd,
      showTrace,
      profile,
      currentMapLayer,
    ]
  );

  const {
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
  } = useMapRoute(mapRouteProps);

  const [activeRoutes, setActiveRoutes] = useState<string[]>([]);

  // Optimized active routes update with debouncing
  useEffect(() => {
    const updateActiveRoutes = () => {
      const routes = getActiveRoutes();
      setActiveRoutes(prev => {
        // Only update if routes actually changed
        if (
          prev.length !== routes.length ||
          !prev.every(route => routes.includes(route))
        ) {
          return routes;
        }
        return prev;
      });
    };

    updateActiveRoutes();
  }, [summary, getActiveRoutes]);

  // Memoized search handler with debouncing
  const handleFocusSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setFocusSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5` // Limit results for better performance
      );

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setFocusSuggestions(data);
    } catch (error) {
      console.error('Search error:', error);
      setFocusSuggestions([]);
    }
  }, []);

  const handleFocusSelect = useCallback(
    (suggestion: LocationSuggestion) => {
      setFocusQuery(suggestion.display_name);
      setFocusSuggestions([]);
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);
      if (mapRef?.current) {
        mapRef.current.setView([lat, lon], 13);
      }
    },
    [mapRef]
  );

  // Optimized profile change handler
  const handleProfileChange = useCallback(
    (clickedProfile: string) => {
      const isCurrentlyActive = activeRoutes.includes(clickedProfile);

      if (isCurrentlyActive) {
        removeRoute(clickedProfile);
      } else {
        setProfile(clickedProfile);
      }

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setActiveRoutes(getActiveRoutes());
      });
    },
    [activeRoutes, removeRoute, getActiveRoutes]
  );

  // Optimized trace creation handler
  const handleCreateTrace = useCallback(() => {
    setShowTrace(false);
    // Use requestAnimationFrame for smoother UI updates
    requestAnimationFrame(() => {
      setShowTrace(true);
    });
  }, []);

  // Handler for map layer changes
  const handleMapLayerChange = useCallback((layer: keyof typeof MAP_LAYERS) => {
    setCurrentMapLayer(layer);
  }, []);

  // Memoized form props to prevent unnecessary re-renders
  const locationFormProps = useMemo(
    () => ({
      ...autocompleteProps,
      onCreateTrace: handleCreateTrace,
      enableMapClickForStart,
      disableMapClickForStart,
      clearStartMarker,
      enableMapClickForEnd,
      disableMapClickForEnd,
      clearEndMarker,
      createStartMarkerFromLocation,
      createEndMarkerFromLocation,
    }),
    [
      autocompleteProps,
      handleCreateTrace,
      enableMapClickForStart,
      disableMapClickForStart,
      clearStartMarker,
      enableMapClickForEnd,
      disableMapClickForEnd,
      clearEndMarker,
      createStartMarkerFromLocation,
      createEndMarkerFromLocation,
    ]
  );

  return (
    <div className="relative h-screen w-screen bg-black">
      {/* Control Panel */}
      <div className="absolute top-6 left-6 z-10 bg-white p-6 rounded-xl min-w-[350px] w-fit flex flex-col gap-4 shadow-lg">
        <LocationSearchBox
          query={focusQuery}
          onQueryChange={setFocusQuery}
          suggestions={focusSuggestions}
          onSuggestionSelect={handleFocusSelect}
          onSearchClick={() => handleFocusSearch(focusQuery)}
        />

        <TransportModeSelector
          activeRoutes={activeRoutes}
          onProfileChange={handleProfileChange}
        />

        <LocationForm {...locationFormProps} />

        <SummaryDisplay summary={summary} error={error} />

        {isLoading && <LoadingIndicator />}
      </div>

      {/* Map Layer Selector Toggle */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => setShowLayerSelector(!showLayerSelector)}
          className={`
            relative bg-white hover:bg-blue-50 border-2 rounded-xl p-3 shadow-xl
            transition-all duration-200 group
            ${showLayerSelector ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          `}
          title="🗺️ Changer le fond de carte"
        >
          {/* Badge with indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>

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
          <div className="absolute top-12 left-0 min-w-[280px] z-50">
            <MapLayerSelector
              map={mapRef?.current || null}
              currentLayer={currentMapLayer}
              onLayerChange={handleMapLayerChange}
            />
          </div>
        )}
      </div>

      {/* Map Container */}
      <div id="map" className="h-screen w-screen z-0" />
    </div>
  );
};

export default memo(Map);
