import { useEffect, useState } from "react";
import type { LocationSuggestion, Location } from "@/types/profile";

const fetchSuggestions = async (query: string): Promise<LocationSuggestion[]> => {
  if (!query) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`
  );
  return await res.json();
};

interface UseAutocompleteReturn {
  startQuery: string;
  setStartQuery: (query: string) => void;
  endQuery: string;
  setEndQuery: (query: string) => void;
  startSuggestions: LocationSuggestion[];
  setStartSuggestions: (suggestions: LocationSuggestion[]) => void;
  endSuggestions: LocationSuggestion[];
  setEndSuggestions: (suggestions: LocationSuggestion[]) => void;
  traceStart: Location | null;
  setTraceStart: (location: Location | null) => void;
  traceEnd: Location | null;
  setTraceEnd: (location: Location | null) => void;
  handleStartSuggestion: (suggestion: LocationSuggestion) => void;
  handleEndSuggestion: (suggestion: LocationSuggestion) => void;
}

export default function useAutocomplete(): UseAutocompleteReturn {
  const [startQuery, setStartQuery] = useState<string>("");
  const [endQuery, setEndQuery] = useState<string>("");
  const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<LocationSuggestion[]>([]);
  const [traceStart, setTraceStart] = useState<Location | null>(null);
  const [traceEnd, setTraceEnd] = useState<Location | null>(null);

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

  const handleStartSuggestion = (s: LocationSuggestion) => {
    setTraceStart({
      lat: Number(s.lat),
      lng: Number(s.lon),
      name: s.display_name
    });
    setStartQuery(s.display_name);
  };

  const handleEndSuggestion = (s: LocationSuggestion) => {
    setTraceEnd({
      lat: Number(s.lat),
      lng: Number(s.lon),
      name: s.display_name
    });
    setEndQuery(s.display_name);
  };

  return {
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
    setTraceEnd,
  };
}
