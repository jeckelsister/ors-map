import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useThrottle, useMemoizedCallback } from '@/hooks/shared/usePerformance';

describe('usePerformance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should debounce function calls', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebounce(mockFn, 100));

      // Call the debounced function multiple times
      act(() => {
        result.current('test1');
        result.current('test2');
        result.current('test3');
      });

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Function should be called only once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test3');
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebounce(mockFn, 100));

      // First call
      act(() => {
        result.current('test1');
      });

      // Wait 50ms
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Second call (should reset timer)
      act(() => {
        result.current('test2');
      });

      // Wait another 50ms (total 100ms, but timer was reset)
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Wait remaining 50ms
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Function should be called with the second argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test2');
    });
  });

  describe('useThrottle', () => {
    it('should throttle function calls', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useThrottle(mockFn, 100));

      // Call the throttled function multiple times immediately
      act(() => {
        result.current('test1');
        result.current('test2');
        result.current('test3');
      });

      // Function should be called immediately for the first call
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');

      // Wait for throttle period to end
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Call again after throttle period
      act(() => {
        result.current('test4');
      });

      // Function should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('test4');
    });

    it('should not call function again during throttle period', () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useThrottle(mockFn, 100));

      // First call
      act(() => {
        result.current('test1');
      });

      expect(mockFn).toHaveBeenCalledTimes(1);

      // Call again immediately (should be throttled)
      act(() => {
        result.current('test2');
      });

      // Should still be called only once
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait half the throttle period
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Call again (should still be throttled)
      act(() => {
        result.current('test3');
      });

      // Should still be called only once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMemoizedCallback', () => {
    it('should memoize callback based on dependencies', () => {
      let dep = 'initial';
      const mockFn = vi.fn(() => `result-${dep}`);
      
      const { result, rerender } = renderHook(
        ({ dependency }) => useMemoizedCallback(mockFn, [dependency]),
        { initialProps: { dependency: dep } }
      );

      const callback1 = result.current;

      // Call the callback
      const result1 = callback1();
      expect(result1).toBe('result-initial');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Rerender with same dependency
      rerender({ dependency: dep });
      const callback2 = result.current;

      // Should return the same callback reference
      expect(callback2).toBe(callback1);

      // Update dependency
      dep = 'updated';
      rerender({ dependency: dep });
      const callback3 = result.current;

      // Should return a new callback reference
      expect(callback3).not.toBe(callback1);

      // Call the new callback
      const result3 = callback3();
      expect(result3).toBe('result-updated');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple dependencies', () => {
      const mockFn = vi.fn((a, b) => a + b);
      
      const { result, rerender } = renderHook(
        ({ dep1, dep2 }) => useMemoizedCallback(mockFn, [dep1, dep2]),
        { initialProps: { dep1: 1, dep2: 2 } }
      );

      const callback1 = result.current;

      // Change only one dependency
      rerender({ dep1: 1, dep2: 3 });
      const callback2 = result.current;

      // Should return a new callback reference
      expect(callback2).not.toBe(callback1);

      // Keep dependencies the same
      rerender({ dep1: 1, dep2: 3 });
      const callback3 = result.current;

      // Should return the same callback reference
      expect(callback3).toBe(callback2);
    });

    it('should handle empty dependencies array', () => {
      const mockFn = vi.fn();
      
      const { result, rerender } = renderHook(
        () => useMemoizedCallback(mockFn, [])
      );

      const callback1 = result.current;

      // Rerender multiple times
      rerender();
      rerender();
      rerender();

      const callback2 = result.current;

      // Should always return the same callback reference with empty deps
      expect(callback2).toBe(callback1);
    });
  });
});
