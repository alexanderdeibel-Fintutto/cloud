import { useState, useEffect, useCallback } from 'react'

/**
 * Persists state in localStorage with automatic JSON serialization.
 * Syncs across tabs via the storage event.
 *
 * Usage:
 *   const [value, setValue] = useLocalStorage('my-key', { name: '' })
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // quota exceeded – silently fail
        }
        return nextValue
      })
    },
    [key],
  )

  const removeValue = useCallback(() => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue)
        } catch {
          // ignore parse errors
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
