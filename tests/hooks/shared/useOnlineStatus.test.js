import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOnlineStatus } from '../../../src/hooks/shared/useOnlineStatus';

describe('useOnlineStatus Hook', () => {
  let mockNavigator;
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    // Mock navigator.onLine
    mockNavigator = vi.spyOn(navigator, 'onLine', 'get');
    mockNavigator.mockReturnValue(true);

    // Spy on event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial online status from navigator', () => {
    mockNavigator.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('returns false when initially offline', () => {
    mockNavigator.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('adds event listeners on mount', () => {
    renderHook(() => useOnlineStatus());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });

  it('removes event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });

  it('updates status when online event is fired', () => {
    mockNavigator.mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(false);

    // Simulate going online
    act(() => {
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);
    });

    expect(result.current).toBe(true);
  });

  it('updates status when offline event is fired', () => {
    mockNavigator.mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    // Simulate going offline
    act(() => {
      const offlineEvent = new Event('offline');
      window.dispatchEvent(offlineEvent);
    });

    expect(result.current).toBe(false);
  });

  it('handles multiple online/offline transitions', () => {
    const { result } = renderHook(() => useOnlineStatus());

    // Start online
    expect(result.current).toBe(true);

    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);

    // Go offline again
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  it('uses the same event handler references for cleanup', () => {
    const { unmount } = renderHook(() => useOnlineStatus());

    // Get the handlers that were added
    const addCalls = addEventListenerSpy.mock.calls;
    const onlineHandler = addCalls.find(call => call[0] === 'online')[1];
    const offlineHandler = addCalls.find(call => call[0] === 'offline')[1];

    unmount();

    // Check that the same handlers were removed
    const removeCalls = removeEventListenerSpy.mock.calls;
    expect(removeCalls).toContainEqual(['online', onlineHandler]);
    expect(removeCalls).toContainEqual(['offline', offlineHandler]);
  });

  it('does not cause memory leaks with multiple instances', () => {
    const { unmount: unmount1 } = renderHook(() => useOnlineStatus());
    const { unmount: unmount2 } = renderHook(() => useOnlineStatus());
    const { unmount: unmount3 } = renderHook(() => useOnlineStatus());

    // Each instance should add its own listeners
    expect(addEventListenerSpy).toHaveBeenCalledTimes(6); // 3 instances × 2 events

    unmount1();
    unmount2();
    unmount3();

    // Each instance should remove its own listeners
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(6); // 3 instances × 2 events
  });

  it('maintains state consistency across re-renders', () => {
    const { result, rerender } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    // Go offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    // Re-render shouldn't change the state
    rerender();
    expect(result.current).toBe(false);

    // Go online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);

    // Re-render again
    rerender();
    expect(result.current).toBe(true);
  });
});
