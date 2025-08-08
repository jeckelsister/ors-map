import type { Location, LocationSuggestion } from "@/types/profile";
import Button from "@/ui/Button";
import React, { memo, useCallback } from "react";
import AutocompleteInput from "./AutocompleteInput";

interface LocationFormProps {
  startQuery: string;
  setStartQuery: (query: string) => void;
  startSuggestions: LocationSuggestion[];
  setStartSuggestions: (suggestions: LocationSuggestion[]) => void;
  handleStartSuggestion: (suggestion: LocationSuggestion) => void;
  endQuery: string;
  setEndQuery: (query: string) => void;
  endSuggestions: LocationSuggestion[];
  setEndSuggestions: (suggestions: LocationSuggestion[]) => void;
  handleEndSuggestion: (suggestion: LocationSuggestion) => void;
  setTraceStart: (location: Location | null) => void;
  onCreateTrace: () => void;
  enableMapClickForStart: (
    onLocationSelect: (lat: number, lng: number) => void
  ) => void;
  disableMapClickForStart: () => void;
  clearStartMarker: () => void;
}

const LocationForm = ({
  startQuery,
  setStartQuery,
  startSuggestions,
  setStartSuggestions,
  handleStartSuggestion,
  endQuery,
  setEndQuery,
  endSuggestions,
  setEndSuggestions,
  handleEndSuggestion,
  setTraceStart,
  onCreateTrace,
  enableMapClickForStart,
  disableMapClickForStart,
  clearStartMarker,
}: LocationFormProps): React.JSX.Element => {
  const [isMapClickMode, setIsMapClickMode] = React.useState(false);

  // Optimized cleanup on unmount with useEffect cleanup
  React.useEffect(() => {
    return () => {
      if (isMapClickMode) {
        disableMapClickForStart();
      }
    };
  }, [isMapClickMode, disableMapClickForStart]);

  // Memoized geolocation handler
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setStartQuery(coordString);
        setTraceStart({
          lat: latitude,
          lng: longitude,
          name: "Ma position",
        });
        clearStartMarker();
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Impossible d'obtenir la position : " + err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [setStartQuery, setTraceStart, clearStartMarker]);

  // Optimized map click mode handler with better state management
  const handleMapClickMode = useCallback(() => {
    if (isMapClickMode) {
      disableMapClickForStart();
      setIsMapClickMode(false);
    } else {
      enableMapClickForStart((lat: number, lng: number) => {
        const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setStartQuery(coordString);
        setTraceStart({
          lat,
          lng,
          name: "Point sélectionné sur la carte",
        });
      });
      setIsMapClickMode(true);
    }
  }, [
    isMapClickMode,
    enableMapClickForStart,
    disableMapClickForStart,
    setStartQuery,
    setTraceStart,
  ]);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setStartQuery(newValue);
      // Only clear the marker if the field is completely emptied
      if (newValue.trim() === "") {
        clearStartMarker();
      }
    },
    [setStartQuery, clearStartMarker]
  );

  // Memoized suggestion click handler
  const handleSuggestionClick = useCallback(
    (suggestion: LocationSuggestion) => {
      handleStartSuggestion(suggestion);
      clearStartMarker();
    },
    [handleStartSuggestion, clearStartMarker]
  );

  // Optimized icons as constants to avoid re-creation
  const GeolocationIcon = React.useMemo(
    () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
    []
  );

  const MapPinIcon = React.useMemo(
    () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-all duration-200 ${
          isMapClickMode ? "animate-pulse" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    [isMapClickMode]
  );

  const ActiveIndicator = React.useMemo(
    () => (
      <span className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
        Actif
      </span>
    ),
    []
  );

  return (
    <>
      <div className="flex items-center gap-2">
        <AutocompleteInput
          label="Départ :"
          value={startQuery}
          onChange={handleInputChange}
          suggestions={startSuggestions}
          onSuggestionClick={handleSuggestionClick}
          setSuggestions={setStartSuggestions}
        />
        <Button
          type="button"
          className="ml-2 flex items-center gap-1 border border-blue-400 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-150"
          title="Utiliser ma position GPS"
          onClick={handleGeolocation}
        >
          {GeolocationIcon}
          <span className="hidden sm:inline">Ma position</span>
        </Button>
        <Button
          type="button"
          className={`ml-1 flex items-center gap-1 border shadow-sm transition-all duration-200 ${
            isMapClickMode
              ? "border-green-500 bg-green-100 text-green-800 hover:bg-green-200 ring-2 ring-green-200"
              : "border-gray-400 bg-white text-gray-600 hover:bg-gray-50"
          } hover:shadow-md`}
          title={
            isMapClickMode
              ? "Mode actif - Cliquez sur la carte pour sélectionner le départ, ou cliquez ici pour désactiver"
              : "Activer le mode de sélection par clic sur la carte"
          }
          onClick={handleMapClickMode}
        >
          {MapPinIcon}
          <span className="hidden sm:inline">
            {isMapClickMode ? ActiveIndicator : "Clic carte"}
          </span>
        </Button>
      </div>
      <AutocompleteInput
        label="Arrivée :"
        value={endQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEndQuery(e.target.value)
        }
        suggestions={endSuggestions}
        onSuggestionClick={handleEndSuggestion}
        setSuggestions={setEndSuggestions}
      />
      <Button
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        onClick={onCreateTrace}
      >
        Créer la trace
      </Button>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LocationForm);
