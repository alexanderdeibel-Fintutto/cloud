import { useCallback } from 'react'

/**
 * Provides share and copy-link functionality for calculator results.
 * Uses the Web Share API when available, falls back to clipboard copy.
 *
 * Usage:
 *   const { share, copyLink } = useShareResult()
 *   share({ title: 'Kautions-Rechner', text: 'Max. Kaution: 2.400 €', url: '/rechner/kaution?rent=800' })
 *   copyLink('/rechner/kaution?rent=800')
 */
export function useShareResult() {
  const getFullUrl = (path: string) => {
    return `${window.location.origin}${path}`
  }

  const share = useCallback(
    async ({ title, text, url }: { title: string; text: string; url: string }) => {
      const fullUrl = getFullUrl(url)
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url: fullUrl })
          return true
        } catch {
          // user cancelled or not supported
        }
      }
      // Fallback: copy to clipboard
      return copyToClipboard(fullUrl)
    },
    [],
  )

  const copyLink = useCallback(async (path: string) => {
    return copyToClipboard(getFullUrl(path))
  }, [])

  return { share, copyLink }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  }
}
