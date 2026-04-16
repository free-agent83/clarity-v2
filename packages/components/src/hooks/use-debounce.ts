import { useState, useEffect } from "react"

/**
 * Debounces a value by the specified delay.
 *
 * Returns the debounced value, which updates only after `delay` milliseconds
 * of inactivity. Used by DataTableToolbar for search input debouncing (Phase 2).
 *
 * @param value - The value to debounce.
 * @param delay - Debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export { useDebounce }
