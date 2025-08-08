import useAutocomplete from "@/hooks/useAutocomplete";
import useMapRoute from "@/hooks/useMapRoute";
import type { LocationSuggestion } from "@/types/profile";
import "leaflet/dist/leaflet.css";
import React, { useCallback, useEffect, useState } from "react";
import LocationForm from "./LocationForm";
import LocationSearchBox from "./LocationSearchBox";
import SummaryDisplay from "./SummaryDisplay";
import TransportModeSelector from "./TransportModeSelector";

const Map = (): React.JSX.Element => {
  const [profile, setProfile] = useState<string>("foot-hiking");
  const [focusQuery, setFocusQuery] = useState<string>("");
  const [focusSuggestions, setFocusSuggestions] = useState<any[]>([]);
  const [showTrace, setShowTrace] = useState<boolean>(false);

  const autocompleteProps = useAutocomplete();
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
  } = useMapRoute({
    traceStart: autocompleteProps.traceStart,
    traceEnd: autocompleteProps.traceEnd,
    showTrace,
    profile,
  });

  const [activeRoutes, setActiveRoutes] = useState<string[]>([]);

  // Update active routes
  useEffect(() => {
    setActiveRoutes(getActiveRoutes());
  }, [summary, getActiveRoutes]); // Triggers when a new trace is added or removed

  const handleFocusSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setFocusSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );
    const data = await res.json();
    setFocusSuggestions(data);
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

  const handleProfileChange = useCallback(
    (clickedProfile: string) => {
      const isCurrentlyActive = activeRoutes.includes(clickedProfile);

      if (isCurrentlyActive) {
        // Si la trace existe, la supprimer
        removeRoute(clickedProfile);
      } else {
        // Si la trace n'existe pas, changer de profil pour la calculer
        setProfile(clickedProfile);
      }

      // Update active routes immediately
      setTimeout(() => setActiveRoutes(getActiveRoutes()), 0);
    },
    [activeRoutes, removeRoute, getActiveRoutes]
  );

  const handleCreateTrace = useCallback(() => {
    setShowTrace(false);
    setTimeout(() => setShowTrace(true), 0);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black">
      <div className="absolute top-6 left-6 z-10 bg-white p-6 rounded-xl min-w-[350px] w-fit flex flex-col gap-4">
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

        <LocationForm
          {...autocompleteProps}
          onCreateTrace={handleCreateTrace}
          enableMapClickForStart={enableMapClickForStart}
          disableMapClickForStart={disableMapClickForStart}
          clearStartMarker={clearStartMarker}
        />

        <SummaryDisplay summary={summary} error={error} />

        {isLoading && (
          <div className="mt-2 text-blue-600 font-medium">
            Calcul de l'itinéraire en cours...
          </div>
        )}
      </div>
      <div id="map" className="h-screen w-screen z-0" />
    </div>
  );
};

export default Map;
