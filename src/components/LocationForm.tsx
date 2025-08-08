import useGeolocation from '@/hooks/useGeolocation';
import type { Location, LocationSuggestion } from '@/types/profile';
import Button from '@/ui/Button';
import { formatCoordinates } from '@/utils/routeUtils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import AutocompleteInput from './AutocompleteInput';
import IconButton from './ui/IconButton';
import { GeolocationIcon, MapPinIcon } from './ui/Icons';
import StatusIndicator from './ui/StatusIndicator';

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
  setTraceEnd: (location: Location | null) => void;
  onCreateTrace: () => void;
  enableMapClickForStart: (
    onLocationSelect: (lat: number, lng: number) => void
  ) => void;
  disableMapClickForStart: () => void;
  clearStartMarker: () => void;
  enableMapClickForEnd: (
    onLocationSelect: (lat: number, lng: number) => void
  ) => void;
  disableMapClickForEnd: () => void;
  clearEndMarker: () => void;
  createStartMarkerFromLocation: (location: Location) => void;
  createEndMarkerFromLocation: (location: Location) => void;
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
  setTraceEnd,
  onCreateTrace,
  enableMapClickForStart,
  disableMapClickForStart,
  clearStartMarker,
  enableMapClickForEnd,
  disableMapClickForEnd,
  clearEndMarker,
  createStartMarkerFromLocation,
  createEndMarkerFromLocation,
}: LocationFormProps): React.JSX.Element => {
  const [isMapClickMode, setIsMapClickMode] = useState(false);
  const [isEndMapClickMode, setIsEndMapClickMode] = useState(false);

  // Use geolocation hook
  const { getCurrentPosition } = useGeolocation();

  // Optimized cleanup on unmount with useEffect cleanup
  useEffect(() => {
    return () => {
      if (isMapClickMode) {
        disableMapClickForStart();
      }
      if (isEndMapClickMode) {
        disableMapClickForEnd();
      }
    };
  }, [
    isMapClickMode,
    isEndMapClickMode,
    disableMapClickForStart,
    disableMapClickForEnd,
  ]);

  // Simplified geolocation handler using the hook
  const handleGeolocation = useCallback(() => {
    getCurrentPosition(
      location => {
        const coordString = formatCoordinates(location.lat, location.lng);
        setStartQuery(coordString);
        setTraceStart(location);
        createStartMarkerFromLocation(location);
      },
      error => {
        alert(error);
      }
    );
  }, [
    getCurrentPosition,
    setStartQuery,
    setTraceStart,
    createStartMarkerFromLocation,
  ]);

  // Optimized map click mode handler with better state management
  const handleMapClickMode = useCallback(() => {
    if (isMapClickMode) {
      disableMapClickForStart();
      setIsMapClickMode(false);
    } else {
      // Disable end mode if active
      if (isEndMapClickMode) {
        disableMapClickForEnd();
        setIsEndMapClickMode(false);
      }

      enableMapClickForStart((lat: number, lng: number) => {
        const coordString = formatCoordinates(lat, lng);
        setStartQuery(coordString);
        setTraceStart({
          lat,
          lng,
          name: 'Point sélectionné sur la carte',
        });
        // Auto-disable after selection
        setIsMapClickMode(false);
        disableMapClickForStart();
      });
      setIsMapClickMode(true);
    }
  }, [
    isMapClickMode,
    isEndMapClickMode,
    enableMapClickForStart,
    disableMapClickForStart,
    disableMapClickForEnd,
    setStartQuery,
    setTraceStart,
  ]);

  // Memoized input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setStartQuery(newValue);
      // Only clear the marker if the field is completely emptied
      if (newValue.trim() === '') {
        clearStartMarker();
      }
    },
    [setStartQuery, clearStartMarker]
  );

  // Memoized suggestion click handler
  const handleSuggestionClick = useCallback(
    (suggestion: LocationSuggestion) => {
      handleStartSuggestion(suggestion);
      // Create marker for the selected start location
      const location: Location = {
        lat: Number(suggestion.lat),
        lng: Number(suggestion.lon),
        name: suggestion.display_name,
      };
      createStartMarkerFromLocation(location);
    },
    [handleStartSuggestion, createStartMarkerFromLocation]
  );

  // Optimized map click mode handler for end point
  const handleEndMapClickMode = useCallback(() => {
    if (isEndMapClickMode) {
      disableMapClickForEnd();
      setIsEndMapClickMode(false);
    } else {
      // Disable start mode if active
      if (isMapClickMode) {
        disableMapClickForStart();
        setIsMapClickMode(false);
      }

      enableMapClickForEnd((lat: number, lng: number) => {
        const coordString = formatCoordinates(lat, lng);
        setEndQuery(coordString);
        setTraceEnd({
          lat,
          lng,
          name: "Point d'arrivée sélectionné sur la carte",
        });
        // Auto-disable after selection
        setIsEndMapClickMode(false);
        disableMapClickForEnd();
      });
      setIsEndMapClickMode(true);
    }
  }, [
    isEndMapClickMode,
    isMapClickMode,
    enableMapClickForEnd,
    disableMapClickForEnd,
    disableMapClickForStart,
    setEndQuery,
    setTraceEnd,
  ]);

  // Memoized end input change handler
  const handleEndInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setEndQuery(newValue);
      // Only clear the marker if the field is completely emptied
      if (newValue.trim() === '') {
        clearEndMarker();
      }
    },
    [setEndQuery, clearEndMarker]
  );

  // Memoized end suggestion click handler
  const handleEndSuggestionClick = useCallback(
    (suggestion: LocationSuggestion) => {
      handleEndSuggestion(suggestion);
      // Create marker for the selected end location
      const location: Location = {
        lat: Number(suggestion.lat),
        lng: Number(suggestion.lon),
        name: suggestion.display_name,
      };
      createEndMarkerFromLocation(location);
    },
    [handleEndSuggestion, createEndMarkerFromLocation]
  );

  // Memoized icons using centralized icon components
  const startMapIcon = useMemo(
    () => <MapPinIcon isAnimated={isMapClickMode} />,
    [isMapClickMode]
  );

  const endMapIcon = useMemo(
    () => <MapPinIcon isAnimated={isEndMapClickMode} />,
    [isEndMapClickMode]
  );

  const geolocationIcon = useMemo(() => <GeolocationIcon />, []);

  // Memoized validation for form submission
  const canCreateTrace = useMemo(() => {
    return startQuery.trim() !== '' && endQuery.trim() !== '';
  }, [startQuery, endQuery]);

  // Memoized CSS classes to prevent recalculation
  const startButtonClasses = useMemo(
    () =>
      `ml-1 flex items-center gap-1 border shadow-sm transition-all duration-200 hover:shadow-md ${
        isMapClickMode
          ? 'border-green-500 bg-green-100 text-green-800 hover:bg-green-200 ring-2 ring-green-200'
          : 'border-gray-400 bg-white text-gray-600 hover:bg-gray-50'
      }`,
    [isMapClickMode]
  );

  const endButtonClasses = useMemo(
    () =>
      `ml-1 flex items-center gap-1 border shadow-sm transition-all duration-200 hover:shadow-md ${
        isEndMapClickMode
          ? 'border-red-500 bg-red-100 text-red-800 hover:bg-red-200 ring-2 ring-red-200'
          : 'border-gray-400 bg-white text-gray-600 hover:bg-gray-50'
      }`,
    [isEndMapClickMode]
  );

  const traceButtonClasses = useMemo(
    () =>
      `w-full font-semibold py-3 rounded-lg transition-all duration-200 ${
        canCreateTrace
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`,
    [canCreateTrace]
  );

  return (
    <>
      {/* Start Location Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AutocompleteInput
            label="Départ :"
            value={startQuery}
            onChange={handleInputChange}
            suggestions={startSuggestions}
            onSuggestionClick={handleSuggestionClick}
            setSuggestions={setStartSuggestions}
            placeholder="Rechercher un lieu de départ..."
          />
          <IconButton
            icon={geolocationIcon}
            onClick={handleGeolocation}
            title="Utiliser ma position GPS"
            label="Ma position"
            className="flex items-center gap-1 border border-blue-400 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-150"
            aria-label="Utiliser ma position GPS"
          />
          <IconButton
            icon={startMapIcon}
            onClick={handleMapClickMode}
            isActive={isMapClickMode}
            title={
              isMapClickMode
                ? 'Mode actif - Cliquez sur la carte pour sélectionner le départ, ou cliquez ici pour désactiver'
                : 'Activer le mode de sélection par clic sur la carte'
            }
            label={
              <StatusIndicator
                isActive={isMapClickMode}
                inactiveLabel="Clic carte"
              />
            }
            className={startButtonClasses}
            aria-label={
              isMapClickMode
                ? 'Désactiver le mode clic carte'
                : 'Activer le mode clic carte'
            }
          />
        </div>
      </div>

      {/* End Location Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AutocompleteInput
            label="Arrivée :"
            value={endQuery}
            onChange={handleEndInputChange}
            suggestions={endSuggestions}
            onSuggestionClick={handleEndSuggestionClick}
            setSuggestions={setEndSuggestions}
            placeholder="Rechercher un lieu d'arrivée..."
          />
          <IconButton
            icon={endMapIcon}
            onClick={handleEndMapClickMode}
            isActive={isEndMapClickMode}
            title={
              isEndMapClickMode
                ? "Mode actif - Cliquez sur la carte pour sélectionner l'arrivée, ou cliquez ici pour désactiver"
                : "Activer le mode de sélection par clic sur la carte pour l'arrivée"
            }
            label={
              <StatusIndicator
                isActive={isEndMapClickMode}
                inactiveLabel="Clic carte"
              />
            }
            className={endButtonClasses}
            aria-label={
              isEndMapClickMode
                ? 'Désactiver le mode clic carte pour arrivée'
                : 'Activer le mode clic carte pour arrivée'
            }
          />
        </div>
      </div>

      {/* Create Trace Button */}
      <Button
        className={traceButtonClasses}
        onClick={onCreateTrace}
        disabled={!canCreateTrace}
        aria-label="Créer la trace avec les points sélectionnés"
      >
        Créer la trace
      </Button>
    </>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(LocationForm);
