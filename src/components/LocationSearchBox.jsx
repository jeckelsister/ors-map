import { memo, useCallback } from "react";
import { FaSearchLocation } from "react-icons/fa";
import Button from "../ui/Button";

const LocationSearchBox = memo(
  ({
    query,
    onQueryChange,
    suggestions,
    onSuggestionSelect,
    onSearchClick,
    placeholder = "Rechercher un lieu...",
  }) => {
    const handleSearchClick = useCallback(async () => {
      if (query.length < 3) return;
      await onSearchClick();
    }, [query, onSearchClick]);

    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <FaSearchLocation className="h-5 w-5 text-blue-600" />
          <input
            type="text"
            className="w-full px-3 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150 text-black"
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Recherche de lieu"
          />
          <Button
            type="button"
            className="px-3 py-2 border border-blue-400 bg-white text-blue-600 font-semibold hover:bg-blue-50"
            title="Valider la recherche"
            onClick={handleSearchClick}
            aria-label="Lancer la recherche"
          >
            <FaSearchLocation className="h-5 w-5" />
          </Button>
        </div>
        {suggestions?.length > 0 && (
          <ul
            className="absolute left-0 top-full w-full bg-white border rounded shadow-lg z-20 max-h-40 overflow-auto"
            role="listbox"
            aria-label="Suggestions de lieux"
          >
            {suggestions.map((s) => (
              <li
                key={`${s.place_id}-${s.display_name}`}
                className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                onClick={() => onSuggestionSelect(s)}
                role="option"
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

LocationSearchBox.displayName = "LocationSearchBox";

export default LocationSearchBox;
