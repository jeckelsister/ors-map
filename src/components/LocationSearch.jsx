import { FaSearchLocation } from "react-icons/fa";
import Button from "../ui/Button";

export default function LocationSearch({
  focusQuery,
  onChange,
  onValidate,
  suggestions,
  onSuggestionClick,
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <FaSearchLocation className="h-5 w-5 text-blue-600" />
        <input
          type="text"
          className="w-full px-3 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150 text-black"
          placeholder="Rechercher un lieu..."
          value={focusQuery}
          onChange={onChange}
        />
        <Button
          type="button"
          className="px-3 py-2 border border-blue-400 bg-white text-blue-600 font-semibold hover:bg-blue-50"
          title="Valider la recherche"
          onClick={onValidate}
        >
          <FaSearchLocation className="h-5 w-5" />
        </Button>
      </div>
      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <ul className="bg-white border rounded shadow mt-1 max-h-40 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={s.place_id ? `${s.place_id}-${i}` : `${s.display_name}-${i}`}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() => onSuggestionClick(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
