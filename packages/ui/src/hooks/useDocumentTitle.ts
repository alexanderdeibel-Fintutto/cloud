import { useEffect } from 'react'

/**
 * Sets the document title with a consistent suffix.
 * Usage: useDocumentTitle('Kautions-Rechner', 'Fintutto Portal')
 * Result: "Kautions-Rechner | Fintutto Portal"
 */
export function useDocumentTitle(title: string, appName = 'Fintutto') {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} | ${appName}` : appName
    return () => {
      document.title = prev
    }
  }, [title, appName])
}
