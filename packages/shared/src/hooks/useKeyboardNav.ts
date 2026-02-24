import { useEffect } from 'react'

/**
 * Adds keyboard navigation shortcuts for tool pages:
 * - Escape: navigate back to the overview page
 *
 * Usage:
 *   useKeyboardNav({ onEscape: () => navigate('/rechner') })
 */
export function useKeyboardNav({ onEscape }: { onEscape?: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onEscape])
}
