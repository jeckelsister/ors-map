import useAutocomplete from '@/hooks/useAutocomplete';
import useMapRoute from '@/hooks/useMapRoute';
import type { LocationSuggestion } from '@/types/profile';
import 'leaflet/dist/leaflet.css';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import LocationForm from './LocationForm';
import LocationSearchBox from './LocationSearchBox';
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

  const autocompleteProps = useAutocomplete();

  // Memoized hook props to prevent unnecessary re-renders
  const mapRouteProps = useMemo(
    () => ({
      traceStart: autocompleteProps.traceStart,
      traceEnd: autocompleteProps.traceEnd,
      showTrace,
      profile,
    }),
    [
      autocompleteProps.traceStart,
      autocompleteProps.traceEnd,
      showTrace,
      profile,
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

      {/* Map Container */}
      <div id="map" className="h-screen w-screen z-0" />
    </div>
  );
};

export default memo(Map);
