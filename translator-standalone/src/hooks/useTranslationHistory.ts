import { useState, useCallback } from 'react'

export interface HistoryEntry {
  id: string
  sourceText: string
  translatedText: string
  sourceLang: string
  targetLang: string
  timestamp: number
}

const STORAGE_KEY = 'fintutto-translator-history'
const MAX_ENTRIES = 50

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // localStorage quota exceeded
  }
}

export function useTranslationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    setHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, MAX_ENTRIES)
      saveHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveHistory(updated)
      return updated
    })
  }, [])

  return { history, addEntry, clearHistory, removeEntry }
}
