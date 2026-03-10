import { useState, useCallback } from 'react'

const SAVED_SEARCHES_KEY = 'sb-saved-searches'

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    docType?: string | null
    company?: string | null
    status?: string | null
    tag?: string | null
    dateFrom?: string
    dateTo?: string
    amountMin?: string
    amountMax?: string
  }
  createdAt: string
}

function load(): SavedSearch[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_SEARCHES_KEY) || '[]')
  } catch {
    return []
  }
}

function persist(searches: SavedSearch[]) {
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches))
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>(load)

  const save = useCallback((name: string, query: string, filters: SavedSearch['filters']) => {
    const entry: SavedSearch = {
      id: crypto.randomUUID(),
      name,
      query,
      filters,
      createdAt: new Date().toISOString(),
    }
    const updated = [entry, ...searches].slice(0, 20)
    setSearches(updated)
    persist(updated)
    return entry
  }, [searches])

  const remove = useCallback((id: string) => {
    const updated = searches.filter(s => s.id !== id)
    setSearches(updated)
    persist(updated)
  }, [searches])

  const clear = useCallback(() => {
    setSearches([])
    persist([])
  }, [])

  return { searches, save, remove, clear }
}
