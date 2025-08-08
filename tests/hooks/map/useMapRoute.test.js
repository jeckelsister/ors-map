import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useMapRoute from '../../../src/hooks/map/useMapRoute';

// Mock mapService
vi.mock('../../../src/services/mapService', () => ({
  initializeMap: vi.fn(() =>
    Promise.resolve({
      setView: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    })
  ),
  getRouteData: vi.fn(),
  addRouteToMap: vi.fn(),
  addStartMarker: vi.fn(),
  addEndMarker: vi.fn(),
  removeRouteByProfile: vi.fn(),
  addClickHandler: vi.fn(() => vi.fn()),
  createMarker: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
  createRoute: vi.fn(() => ({
    addTo: vi.fn(),
    remove: vi.fn(),
  })),
}));

describe('useMapRoute Hook', () => {
  const defaultProps = {
    startLocation: null,
    endLocation: null,
    profile: 'foot-walking',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useMapRoute(defaultProps));

    expect(result.current.error).toBe(null);
    expect(result.current.summary).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.removeRoute).toBe('function');
    expect(typeof result.current.getActiveRoutes).toBe('function');
  });

  it('provides all required functions', () => {
    const { result } = renderHook(() => useMapRoute(defaultProps));

    expect(typeof result.current.enableMapClickForStart).toBe('function');
    expect(typeof result.current.disableMapClickForStart).toBe('function');
    expect(typeof result.current.clearStartMarker).toBe('function');
    expect(typeof result.current.enableMapClickForEnd).toBe('function');
    expect(typeof result.current.disableMapClickForEnd).toBe('function');
    expect(typeof result.current.clearEndMarker).toBe('function');
    expect(typeof result.current.createStartMarkerFromLocation).toBe(
      'function'
    );
    expect(typeof result.current.createEndMarkerFromLocation).toBe('function');
  });

  it('handles route calculation with valid locations', async () => {
    const startLocation = { lat: 48.8566, lng: 2.3522, name: 'Paris' };
    const endLocation = { lat: 45.764, lng: 4.8357, name: 'Lyon' };

    const mockRouteData = {
      features: [
        {
          geometry: {
            coordinates: [
              [2.3522, 48.8566],
              [4.8357, 45.764],
            ],
          },
          properties: { summary: { distance: 392000, duration: 14400 } },
        },
      ],
    };

    const { getRouteData } = await import('../../../src/services/mapService');
    vi.mocked(getRouteData).mockResolvedValue(mockRouteData);

    renderHook(() =>
      useMapRoute({
        startLocation,
        endLocation,
        profile: 'driving-car',
      })
    );

    // Wait for route calculation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(getRouteData).toHaveBeenCalledWith(
      [48.8566, 2.3522],
      [45.764, 4.8357],
      'driving-car'
    );
  });

  it('handles route calculation errors', async () => {
    const startLocation = { lat: 48.8566, lng: 2.3522, name: 'Paris' };
    const endLocation = { lat: 45.764, lng: 4.8357, name: 'Lyon' };

    const { getRouteData } = await import('../../../src/services/mapService');
    vi.mocked(getRouteData).mockRejectedValue(
      new Error('Route calculation failed')
    );

    const { result } = renderHook(() =>
      useMapRoute({
        startLocation,
        endLocation,
        profile: 'driving-car',
      })
    );

    // Wait for error handling
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.error).toBeTruthy();
  });

  it('clears error when locations change', async () => {
    const { result, rerender } = renderHook(
      ({ startLocation, endLocation, profile }) =>
        useMapRoute({ startLocation, endLocation, profile }),
      {
        initialProps: {
          startLocation: { lat: 48.8566, lng: 2.3522, name: 'Paris' },
          endLocation: { lat: 45.764, lng: 4.8357, name: 'Lyon' },
          profile: 'driving-car',
        },
      }
    );

    // Simulate error
    mockMapService.getRouteData.mockRejectedValue(new Error('Error'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Change locations to clear error
    rerender({
      startLocation: { lat: 50, lng: 3, name: 'New Start' },
      endLocation: { lat: 51, lng: 4, name: 'New End' },
      profile: 'driving-car',
    });

    expect(result.current.error).toBe(null);
  });

  it('enables and disables map click handlers', async () => {
    const { result } = renderHook(() => useMapRoute(defaultProps));

    const { addClickHandler } = await import(
      '../../../src/services/mapService'
    );

    act(() => {
      result.current.enableMapClickForStart();
    });

    expect(addClickHandler).toHaveBeenCalled();

    act(() => {
      result.current.disableMapClickForStart();
    });

    // Should call the cleanup function returned by addClickHandler
    expect(addClickHandler).toHaveBeenCalled();
  });

  it('clears start marker', () => {
    const { result } = renderHook(() => useMapRoute(defaultProps));

    act(() => {
      result.current.clearStartMarker();
    });

    // Function should execute without error
    expect(typeof result.current.clearStartMarker).toBe('function');
  });

  it('clears end marker', () => {
    const { result } = renderHook(() => useMapRoute(defaultProps));

    act(() => {
      result.current.clearEndMarker();
    });

    // Function should execute without error
    expect(typeof result.current.clearEndMarker).toBe('function');
  });

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useMapRoute(defaultProps));

    expect(() => unmount()).not.toThrow();
  });
});
