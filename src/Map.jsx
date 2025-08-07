import "leaflet/dist/leaflet.css";
import { useState } from "react";
import {
  FaBicycle,
  FaBolt,
  FaHiking,
  FaMountain,
  FaSearchLocation,
} from "react-icons/fa";
import AutocompleteInput from "./components/AutocompleteInput";
import useAutocomplete from "./hooks/useAutocomplete";
import useMapRoute from "./hooks/useMapRoute";
import Button from "./ui/Button";

const Map = () => {
  const [profile, setProfile] = useState("foot-hiking");
  const [focusQuery, setFocusQuery] = useState("");
  const [focusSuggestions, setFocusSuggestions] = useState([]);
  const handleFocusChange = async (e) => {
    const value = e.target.value;
    setFocusQuery(value);
    if (value.length < 3) {
      setFocusSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        value
      )}`
    );
    const data = await res.json();
    setFocusSuggestions(data);
  };
  const {
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
    traceStart,
    traceEnd,
    setTraceStart,
  } = useAutocomplete();
  const [showTrace, setShowTrace] = useState(false);
  const { mapRef, error, summary } = useMapRoute(
    traceStart,
    traceEnd,
    showTrace,
    profile
  );
  const handleFocusSuggestion = (suggestion) => {
    setFocusQuery(suggestion.display_name);
    setFocusSuggestions([]);
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    if (mapRef && mapRef.current) {
      mapRef.current.setView([lat, lon], 13);
    }
  };

  const handleCreateTrace = () => {
    setShowTrace(false);
    setTimeout(() => setShowTrace(true), 0);
  };

  return (
    <div className="relative h-screen w-screen bg-black">
      <div className="absolute top-6 left-6 z-10 bg-white p-6 rounded-xl min-w-[350px] w-fit flex flex-col gap-4">
        <div className="mb-2 relative">
          <div className="flex items-center gap-2">
            <FaSearchLocation className="h-5 w-5 text-blue-600" />
            <input
              type="text"
              className="w-full px-3 py-2 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-150 text-black"
              placeholder="Rechercher un lieu..."
              value={focusQuery}
              onChange={handleFocusChange}
            />
            <Button
              type="button"
              className="px-3 py-2 border border-blue-400 bg-white text-blue-600 font-semibold hover:bg-blue-50"
              title="Valider la recherche"
              onClick={async () => {
                if (focusQuery.length < 3) return;
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    focusQuery
                  )}`
                );
                const data = await res.json();
                if (data.length > 0) {
                  const s = data[0];
                  setFocusQuery(s.display_name);
                  setFocusSuggestions([]);
                  if (window && window.L && window.L.map) {
                    const lat = parseFloat(s.lat);
                    const lon = parseFloat(s.lon);
                    const mapEl = window.L.map("map");
                    mapEl.setView([lat, lon], 13);
                  } else {
                    const mapEl = document.getElementById("map");
                    if (mapEl && mapEl._leaflet_map) {
                      mapEl._leaflet_map.setView(
                        [parseFloat(s.lat), parseFloat(s.lon)],
                        13
                      );
                    }
                  }
                }
              }}
            >
              <FaSearchLocation className="h-5 w-5" />
            </Button>
          </div>
          {focusSuggestions.length > 0 && (
            <ul className="absolute left-0 top-full w-full bg-white border rounded shadow-lg z-20 max-h-40 overflow-auto">
              {focusSuggestions.map((s) => (
                <li
                  key={s.place_id}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleFocusSuggestion(s)}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            className={`flex items-center gap-2 ${
              profile === "cycling-regular"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
            onClick={() => setProfile("cycling-regular")}
            title="Vélo classique"
          >
            <FaBicycle className="h-5 w-5" />
            <span className="hidden sm:inline">Vélo classique</span>
          </Button>
          <Button
            className={`flex items-center gap-2 ${
              profile === "cycling-mountain"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
            onClick={() => setProfile("cycling-mountain")}
            title="VTT"
          >
            <FaMountain className="h-5 w-5" />
            <span className="hidden sm:inline">VTT</span>
          </Button>
          <Button
            className={`flex items-center gap-2 ${
              profile === "cycling-electric"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
            onClick={() => setProfile("cycling-electric")}
            title="Vélo électrique"
          >
            <FaBolt className="h-5 w-5" />
            <span className="hidden sm:inline">Vélo électrique</span>
          </Button>
          <Button
            className={`flex items-center gap-2 ${
              profile === "foot-hiking"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
            onClick={() => setProfile("foot-hiking")}
            title="Randonnée pédestre"
          >
            <FaHiking className="h-5 w-5" />
            <span className="hidden sm:inline">Randonnée</span>
          </Button>
        </div>
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
            onClick={() => {
              if (navigator.geolocation) {
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
              } else {
                alert(
                  "La géolocalisation n'est pas supportée par ce navigateur."
                );
              }
            }}
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
          onClick={handleCreateTrace}
        >
          Créer la trace
        </Button>
        {summary && !error && (
          <div className="mt-2 text-gray-800 font-medium">
            <div>Distance : {(summary.distance / 1000).toFixed(2)} km</div>
            <div>
              Durée estimée :{" "}
              {(() => {
                const h = Math.floor(summary.duration / 3600);
                const m = Math.round((summary.duration % 3600) / 60);
                return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m}min`;
              })()}
            </div>
            <div>Dénivelé + : {summary.ascent ?? "N/A"} m</div>
            <div>Dénivelé - : {summary.descent ?? "N/A"} m</div>
          </div>
        )}
        {error && (
          <div className="mt-2 text-red-600 font-semibold">{error}</div>
        )}
      </div>
      <div id="map" className="h-screen w-screen z-0" />
    </div>
  );
};

export default Map;
