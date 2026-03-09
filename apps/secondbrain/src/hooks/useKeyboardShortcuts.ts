import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ShortcutHandlers {
  onMarkDone?: () => void
  onArchive?: () => void
  onNext?: () => void
  onPrev?: () => void
  onClose?: () => void
}

export function useKeyboardShortcuts(handlers?: ShortcutHandlers) {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Navigation shortcuts (single key, no modifiers)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case '/':
            e.preventDefault()
            navigate('/suche')
            return
          case 'n':
          case 'N':
            e.preventDefault()
            navigate('/upload')
            return
          case 'i':
          case 'I':
            e.preventDefault()
            navigate('/eingang')
            return
          case 'd':
          case 'D':
            e.preventDefault()
            navigate('/dokumente')
            return
          case 'c':
          case 'C':
            e.preventDefault()
            navigate('/chat')
            return
        }
      }

      // Ctrl+K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/suche')
        return
      }

      // Context-specific shortcuts
      if (handlers && !e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'Escape':
            handlers.onClose?.()
            return
          case 'j':
            handlers.onNext?.()
            return
          case 'k':
            handlers.onPrev?.()
            return
          case 'e':
            handlers.onMarkDone?.()
            return
          case 'a':
            handlers.onArchive?.()
            return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate, handlers])
}
