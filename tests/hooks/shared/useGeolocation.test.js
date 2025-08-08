import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useGeolocation from '../../../src/hooks/shared/useGeolocation';

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });
  });

  it('returns isSupported as true when geolocation is available', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isSupported).toBe(true);
  });

  it('returns isSupported as false when geolocation is not available', () => {
    // Remove geolocation from navigator
    const originalGeolocation = global.navigator.geolocation;
    delete global.navigator.geolocation;

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isSupported).toBe(false);

    // Restore geolocation
    global.navigator.geolocation = originalGeolocation;
  });

  it('calls onSuccess with location when geolocation succeeds', () => {
    const mockPosition = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation(success => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess);
    });

    expect(onSuccess).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
      name: 'Ma position',
    });
  });

  it('calls onError when geolocation is not supported', () => {
    const originalGeolocation = global.navigator.geolocation;
    delete global.navigator.geolocation;

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess, onError);
    });

    expect(onError).toHaveBeenCalledWith(
      "La géolocalisation n'est pas supportée par ce navigateur."
    );
    expect(onSuccess).not.toHaveBeenCalled();

    // Restore geolocation
    global.navigator.geolocation = originalGeolocation;
  });

  it('calls onError with permission denied message', () => {
    const mockError = { code: 1, message: 'Permission denied' };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess, onError);
    });

    expect(onError).toHaveBeenCalledWith(
      "Impossible d'obtenir la position : Permission refusée"
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError with position unavailable message', () => {
    const mockError = { code: 2, message: 'Position unavailable' };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess, onError);
    });

    expect(onError).toHaveBeenCalledWith(
      "Impossible d'obtenir la position : Position indisponible"
    );
  });

  it('calls onError with timeout message', () => {
    const mockError = { code: 3, message: 'Timeout' };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess, onError);
    });

    expect(onError).toHaveBeenCalledWith(
      "Impossible d'obtenir la position : Délai d'attente dépassé"
    );
  });

  it('calls onError with generic message for unknown error codes', () => {
    const mockError = { code: 999, message: 'Unknown error' };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();
    const onError = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess, onError);
    });

    expect(onError).toHaveBeenCalledWith(
      "Impossible d'obtenir la position : Unknown error"
    );
  });

  it('uses custom options', () => {
    const customOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30000,
    };

    const { result } = renderHook(() => useGeolocation(customOptions));
    const onSuccess = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess);
    });

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      customOptions
    );
  });

  it('uses default options when none provided', () => {
    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();

    act(() => {
      result.current.getCurrentPosition(onSuccess);
    });

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });

  it('works without onError callback', () => {
    const mockPosition = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation(success => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());
    const onSuccess = vi.fn();

    expect(() => {
      act(() => {
        result.current.getCurrentPosition(onSuccess);
      });
    }).not.toThrow();

    expect(onSuccess).toHaveBeenCalledWith({
      lat: 48.8566,
      lng: 2.3522,
      name: 'Ma position',
    });
  });
});
