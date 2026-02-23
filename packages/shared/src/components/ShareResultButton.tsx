import { useState, useCallback } from 'react'

interface ShareResultButtonProps {
  title: string
  text: string
  url: string
  className?: string
}

/**
 * A compact share/copy button for calculator results.
 * Uses Web Share API when available, clipboard copy as fallback.
 * Shows a brief "Kopiert!" confirmation after copying.
 */
export function ShareResultButton({ title, text, url, className = '' }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const fullUrl = `${window.location.origin}${url}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: fullUrl })
        return
      } catch {
        // user cancelled – fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(fullUrl)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = fullUrl
      ta.style.cssText = 'position:fixed;opacity:0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [title, text, url])

  return (
    <button
      onClick={handleShare}
      className={className}
      aria-label={copied ? 'Link kopiert' : 'Ergebnis teilen'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.375rem 0.75rem',
        fontSize: '0.8125rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--border, #e2e8f0)',
        background: copied ? 'var(--success, #22c55e)' : 'transparent',
        color: copied ? '#fff' : 'var(--muted-foreground, #64748b)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
      {copied ? 'Kopiert!' : 'Teilen'}
    </button>
  )
}
