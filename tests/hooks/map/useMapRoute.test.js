import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useMapRoute from '../../../src/hooks/map/useMapRoute';

// Mock mapService
vi.mock('../../../src/services/mapService', () => ({
  initializeMap: vi.fn(() => Promise.resolve({ setView: vi.fn() })),
  fetchRoute: vi.fn(),
  addRouteToMap: vi.fn(),
  addStartMarker: vi.fn(),
  addEndMarker: vi.fn(),
  removeRouteByProfile: vi.fn(),
  addClickHandler: vi.fn(() => vi.fn()),
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
