import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useAutocomplete from "./useAutocomplete";

// Mock de fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("useAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useAutocomplete());

    expect(result.current.startQuery).toBe("");
    expect(result.current.endQuery).toBe("");
    expect(result.current.startSuggestions).toEqual([]);
    expect(result.current.endSuggestions).toEqual([]);
    expect(result.current.traceStart).toBeNull();
    expect(result.current.traceEnd).toBeNull();
  });

  it("updates startQuery", () => {
    const { result } = renderHook(() => useAutocomplete());

    act(() => {
      result.current.setStartQuery("Paris");
    });

    expect(result.current.startQuery).toBe("Paris");
  });

  it("fetches suggestions with debounce", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { lat: "48.8566", lon: "2.3522", display_name: "Paris, France" },
        ]),
    });

    const { result } = renderHook(() => useAutocomplete());

    act(() => {
      result.current.setStartQuery("Paris");
    });

    // Advance timers to trigger debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("search?format=json&q=Paris")
      );
    });
  });

  it("handles start suggestion selection", () => {
    const { result } = renderHook(() => useAutocomplete());

    const suggestion = {
      lat: "48.8566",
      lon: "2.3522",
      display_name: "Paris, France",
    };

    act(() => {
      result.current.handleStartSuggestion(suggestion);
    });

    expect(result.current.traceStart).toEqual([48.8566, 2.3522]);
    expect(result.current.startQuery).toBe("Paris, France");
    expect(result.current.startSuggestions).toEqual([]);
  });

  it("handles end suggestion selection", () => {
    const { result } = renderHook(() => useAutocomplete());

    const suggestion = {
      lat: "45.7640",
      lon: "4.8357",
      display_name: "Lyon, France",
    };

    act(() => {
      result.current.handleEndSuggestion(suggestion);
    });

    expect(result.current.traceEnd).toEqual([45.764, 4.8357]);
    expect(result.current.endQuery).toBe("Lyon, France");
    expect(result.current.endSuggestions).toEqual([]);
  });
});
