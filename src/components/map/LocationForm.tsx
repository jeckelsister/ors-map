import useGeolocation from '@/hooks/shared/useGeolocation';
import type { Location, LocationSuggestion } from '@/types/profile';
import Button from '@/ui/Button';
import { formatCoordinates } from '@/utils/routeUtils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import IconButton from '@/ui/IconButton';
import { GeolocationIcon, MapPinIcon } from '@/ui/Icons';
import StatusIndicator from '@/ui/StatusIndicator';
import LocationInput from '@/ui/LocationInput';

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

  const { getCurrentPosition } = useGeolocation();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isMapClickMode) disableMapClickForStart();
      if (isEndMapClickMode) disableMapClickForEnd();
    };
  }, [isMapClickMode, isEndMapClickMode, disableMapClickForStart, disableMapClickForEnd]);

  // Helper to create a location from coordinates
  const createLocationFromCoords = useCallback((lat: number, lng: number, name: string): Location => ({
    lat,
    lng,
    name
  }), []);

  // Helper to create a location from a suggestion
  const createLocationFromSuggestion = useCallback((suggestion: LocationSuggestion): Location => ({
    lat: Number(suggestion.lat),
    lng: Number(suggestion.lon),
    name: suggestion.display_name
  }), []);

  // Geolocation handler
  const handleGeolocation = useCallback(() => {
    getCurrentPosition(
      location => {
        const coordString = formatCoordinates(location.lat, location.lng);
        setStartQuery(coordString);
        setTraceStart(location);
        createStartMarkerFromLocation(location);
      },
      error => alert(error)
    );
  }, [getCurrentPosition, setStartQuery, setTraceStart, createStartMarkerFromLocation]);

  // Map click mode handlers
  const handleMapClickMode = useCallback(() => {
    if (isMapClickMode) {
      disableMapClickForStart();
      setIsMapClickMode(false);
    } else {
      if (isEndMapClickMode) {
        disableMapClickForEnd();
        setIsEndMapClickMode(false);
      }

      enableMapClickForStart((lat: number, lng: number) => {
        const coordString = formatCoordinates(lat, lng);
        const location = createLocationFromCoords(lat, lng, 'Point sélectionné sur la carte');
        setStartQuery(coordString);
        setTraceStart(location);
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
    createLocationFromCoords
  ]);

  const handleEndMapClickMode = useCallback(() => {
    if (isEndMapClickMode) {
      disableMapClickForEnd();
      setIsEndMapClickMode(false);
    } else {
      if (isMapClickMode) {
        disableMapClickForStart();
        setIsMapClickMode(false);
      }

      enableMapClickForEnd((lat: number, lng: number) => {
        const coordString = formatCoordinates(lat, lng);
        const location = createLocationFromCoords(lat, lng, "Point d'arrivée sélectionné sur la carte");
        setEndQuery(coordString);
        setTraceEnd(location);
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
    createLocationFromCoords
  ]);

  // Input change handlers
  const handleStartInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setStartQuery(newValue);
    if (newValue.trim() === '') clearStartMarker();
  }, [setStartQuery, clearStartMarker]);

  const handleEndInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEndQuery(newValue);
    if (newValue.trim() === '') clearEndMarker();
  }, [setEndQuery, clearEndMarker]);

  // Suggestion handlers
  const handleStartSuggestionClick = useCallback((suggestion: LocationSuggestion) => {
    handleStartSuggestion(suggestion);
    const location = createLocationFromSuggestion(suggestion);
    createStartMarkerFromLocation(location);
  }, [handleStartSuggestion, createLocationFromSuggestion, createStartMarkerFromLocation]);

  const handleEndSuggestionClick = useCallback((suggestion: LocationSuggestion) => {
    handleEndSuggestion(suggestion);
    const location = createLocationFromSuggestion(suggestion);
    createEndMarkerFromLocation(location);
  }, [handleEndSuggestion, createLocationFromSuggestion, createEndMarkerFromLocation]);

  // Memoized validation
  const canCreateTrace = useMemo(() => {
    return startQuery.trim() !== '' && endQuery.trim() !== '';
  }, [startQuery, endQuery]);

  // Memoized button styles
  const getMapClickButtonStyle = useCallback((isActive: boolean, color: 'green' | 'red') => {
    const baseClasses = 'flex items-center gap-1 border shadow-sm transition-all duration-200 hover:shadow-md';
    const activeClasses = color === 'green' 
      ? 'border-green-500 bg-green-100 text-green-800 hover:bg-green-200 ring-2 ring-green-200'
      : 'border-red-500 bg-red-100 text-red-800 hover:bg-red-200 ring-2 ring-red-200';
    const inactiveClasses = 'border-gray-400 bg-white text-gray-600 hover:bg-gray-50';
    
    return `ml-1 ${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  }, []);

  const traceButtonStyle = useMemo(() => {
    const baseClasses = 'w-full font-semibold py-3 rounded-lg transition-all duration-200';
    return canCreateTrace
      ? `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg`
      : `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
  }, [canCreateTrace]);

  // Action buttons for inputs
  const startActions = useMemo(() => [
    <IconButton
      key="geolocation"
      icon={<GeolocationIcon />}
      onClick={handleGeolocation}
      title="Utiliser ma position GPS"
      label="Ma position"
      className="flex items-center gap-1 border border-blue-400 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-150"
      aria-label="Utiliser ma position GPS"
    />,
    <IconButton
      key="map-click"
      icon={<MapPinIcon isAnimated={isMapClickMode} />}
      onClick={handleMapClickMode}
      isActive={isMapClickMode}
      title={isMapClickMode
        ? 'Mode actif - Cliquez sur la carte pour sélectionner le départ, ou cliquez ici pour désactiver'
        : 'Activer le mode de sélection par clic sur la carte'
      }
      label={<StatusIndicator isActive={isMapClickMode} inactiveLabel="Clic carte" />}
      className={getMapClickButtonStyle(isMapClickMode, 'green')}
      aria-label={isMapClickMode ? 'Désactiver le mode clic carte' : 'Activer le mode clic carte'}
    />
  ], [handleGeolocation, handleMapClickMode, isMapClickMode, getMapClickButtonStyle]);

  const endActions = useMemo(() => [
    <IconButton
      key="map-click"
      icon={<MapPinIcon isAnimated={isEndMapClickMode} />}
      onClick={handleEndMapClickMode}
      isActive={isEndMapClickMode}
      title={isEndMapClickMode
        ? "Mode actif - Cliquez sur la carte pour sélectionner l'arrivée, ou cliquez ici pour désactiver"
        : "Activer le mode de sélection par clic sur la carte pour l'arrivée"
      }
      label={<StatusIndicator isActive={isEndMapClickMode} inactiveLabel="Clic carte" />}
      className={getMapClickButtonStyle(isEndMapClickMode, 'red')}
      aria-label={isEndMapClickMode 
        ? 'Désactiver le mode clic carte pour arrivée' 
        : 'Activer le mode clic carte pour arrivée'
      }
    />
  ], [handleEndMapClickMode, isEndMapClickMode, getMapClickButtonStyle]);

  return (
    <>
      <LocationInput
        label="Départ :"
        value={startQuery}
        onChange={handleStartInputChange}
        suggestions={startSuggestions}
        onSuggestionClick={handleStartSuggestionClick}
        setSuggestions={setStartSuggestions}
        placeholder="Rechercher un lieu de départ..."
        actions={startActions}
      />

      <LocationInput
        label="Arrivée :"
        value={endQuery}
        onChange={handleEndInputChange}
        suggestions={endSuggestions}
        onSuggestionClick={handleEndSuggestionClick}
        setSuggestions={setEndSuggestions}
        placeholder="Rechercher un lieu d'arrivée..."
        actions={endActions}
      />

      <Button
        className={traceButtonStyle}
        onClick={onCreateTrace}
        disabled={!canCreateTrace}
        aria-label="Créer la trace avec les points sélectionnés"
      >
        Créer la trace
      </Button>
    </>
  );
};

export default memo(LocationForm);
