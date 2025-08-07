import Button from "../ui/Button";

export default function StartEndInputs({
  startQuery,
  setStartQuery,
  startSuggestions,
  handleStartSuggestion,
  endQuery,
  setEndQuery,
  endSuggestions,
  handleEndSuggestion,
  onGeolocate,
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <AutocompleteInput
          label="Départ :"
          value={startQuery}
          onChange={setStartQuery}
          suggestions={startSuggestions}
          onSuggestionClick={handleStartSuggestion}
        />
        <Button
          type="button"
          className="ml-2 flex items-center gap-1 border border-blue-400 bg-white text-blue-600 shadow-sm hover:bg-blue-50 hover:shadow-md"
          title="Utiliser ma position"
          onClick={onGeolocate}
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
        onChange={setEndQuery}
        suggestions={endSuggestions}
        onSuggestionClick={handleEndSuggestion}
      />
    </>
  );
}
