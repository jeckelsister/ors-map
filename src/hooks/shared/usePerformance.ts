import { useCallback, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Custom hook for debouncing function calls
 * Optimizes performance by limiting the rate of function execution
 */
export function useDebounce<T extends AnyFunction>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    },
    [fn, delay]
  );
}

/**
 * Custom hook for throttling function calls
 * Ensures function is called at most once per specified interval
 */
export function useThrottle<T extends AnyFunction>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        fn(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [fn, limit]
  );
}

/**
 * Custom hook for memoizing expensive calculations
 */
export function useMemoizedCallback<T extends AnyFunction>(
  fn: T,
  deps: React.DependencyList
): T {
  const fnRef = useRef(fn);
  const depsRef = useRef(deps);

  // Update refs if dependencies changed
  if (deps.some((dep, i) => dep !== depsRef.current[i])) {
    fnRef.current = fn;
    depsRef.current = deps;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    (...args: Parameters<T>) => fnRef.current(...args),
    deps
  ) as T;
}
