import { useEffect, useState } from "react";

const fetchSuggestions = async (query) => {
  if (!query) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`
  );
  return await res.json();
};

export default function useAutocomplete() {
  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [traceStart, setTraceStart] = useState(null);
  const [traceEnd, setTraceEnd] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(startQuery).then(setStartSuggestions);
    }, 300);
    return () => clearTimeout(timer);
  }, [startQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(endQuery).then(setEndSuggestions);
    }, 300);
    return () => clearTimeout(timer);
  }, [endQuery]);

  const handleStartSuggestion = (s) => {
    setTraceStart([Number(s.lat), Number(s.lon)]);
    setStartQuery(s.display_name);
    setStartSuggestions([]);
  };
  const handleEndSuggestion = (s) => {
    setTraceEnd([Number(s.lat), Number(s.lon)]);
    setEndQuery(s.display_name);
    setEndSuggestions([]);
  };

  return {
    startQuery,
    setStartQuery,
    startSuggestions,
    handleStartSuggestion,
    endQuery,
    setEndQuery,
    endSuggestions,
    handleEndSuggestion,
    traceStart,
    traceEnd,
    setTraceStart,
    setTraceEnd,
  };
}
