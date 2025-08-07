import { useCallback } from "react";
import Button from "../ui/Button";
import AutocompleteInput from "./AutocompleteInput";

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
}) => {
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStartQuery(`${latitude}, ${longitude}`);
        setTraceStart([latitude, longitude]);
      },
      (err) => {
        alert("Impossible d'obtenir la position : " + err.message);
      }
    );
  }, [setStartQuery, setTraceStart]);

  return (
    <>
      <div className="flex items-center gap-2">
        <AutocompleteInput
          label="Départ :"
          value={startQuery}
          onChange={(e) => setStartQuery(e.target.value)}
          suggestions={startSuggestions}
          onSuggestionClick={handleStartSuggestion}
          setSuggestions={setStartSuggestions}
        />
        <Button
          type="button"
          className="ml-2 flex items-center gap-1 border border-blue-400 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:shadow-md"
          title="Utiliser ma position"
          onClick={handleGeolocation}
        >
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
          <span className="hidden sm:inline">Ma position</span>
        </Button>
      </div>
      <AutocompleteInput
        label="Arrivée :"
        value={endQuery}
        onChange={(e) => setEndQuery(e.target.value)}
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

export default LocationForm;
