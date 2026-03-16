import { useEffect, useCallback, useRef } from 'react'

/**
 * Warns the user before leaving the page when there are unsaved changes.
 * Uses the browser's native beforeunload dialog.
 *
 * Usage:
 *   const { setDirty, reset } = useUnsavedChanges()
 *   // call setDirty() when form data changes
 *   // call reset() after saving
 */
export function useUnsavedChanges() {
  const isDirty = useRef(false)

  const setDirty = useCallback(() => {
    isDirty.current = true
  }, [])

  const reset = useCallback(() => {
    isDirty.current = false
  }, [])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty.current) return
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  return { isDirty: isDirty.current, setDirty, reset }
}
