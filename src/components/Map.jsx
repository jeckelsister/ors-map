import "leaflet/dist/leaflet.css";

import { useCallback, useState } from "react";
import useAutocomplete from "../hooks/useAutocomplete";
import useMapRoute from "../hooks/useMapRoute";
import LocationForm from "./LocationForm";
import LocationSearchBox from "./LocationSearchBox";
import SummaryDisplay from "./SummaryDisplay";
import TransportModeSelector from "./TransportModeSelector";

const Map = () => {
  const [profile, setProfile] = useState("foot-hiking");
  const [focusQuery, setFocusQuery] = useState("");
  const [focusSuggestions, setFocusSuggestions] = useState([]);
  const [showTrace, setShowTrace] = useState(false);

  const autocompleteProps = useAutocomplete();
  const { mapRef, error, summary, isLoading } = useMapRoute(
    autocompleteProps.traceStart,
    autocompleteProps.traceEnd,
    showTrace,
    profile
  );

  const handleFocusSearch = useCallback(async (query) => {
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
    (suggestion) => {
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
          selectedProfile={profile}
          onProfileChange={setProfile}
        />

        <LocationForm
          {...autocompleteProps}
          onCreateTrace={handleCreateTrace}
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
