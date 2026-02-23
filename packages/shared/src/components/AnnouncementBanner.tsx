import { useState } from 'react'

interface AnnouncementBannerProps {
  id: string
  message: string
  linkText?: string
  linkHref?: string
  variant?: 'info' | 'success' | 'warning'
}

const DISMISSED_KEY = 'fintutto_dismissed_announcements'

function isDismissed(id: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    return list.includes(id)
  } catch {
    return false
  }
}

function dismiss(id: string) {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(id)) {
      list.push(id)
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(list))
    }
  } catch {
    // localStorage full or unavailable
  }
}

const variantStyles = {
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
    icon: '\u2139\uFE0F',
  },
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    text: '#166534',
    icon: '\u2705',
  },
  warning: {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    icon: '\u26A0\uFE0F',
  },
}

/**
 * Dismissible announcement banner for cross-app announcements.
 * Uses localStorage to remember dismissed banners.
 *
 * Usage:
 *   <AnnouncementBanner
 *     id="launch-2025"
 *     message="Neues Vermieter-Portal verfügbar!"
 *     linkText="Jetzt entdecken"
 *     linkHref="https://portal.fintutto.cloud"
 *   />
 */
export function AnnouncementBanner({
  id,
  message,
  linkText,
  linkHref,
  variant = 'info',
}: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(() => !isDismissed(id))

  if (!visible) return null

  const styles = variantStyles[variant]

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        borderBottom: `1px solid ${styles.border}`,
        color: styles.text,
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
      }}
    >
      <span>{styles.icon}</span>
      <span>{message}</span>
      {linkText && linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          {linkText}
        </a>
      )}
      <button
        onClick={() => {
          dismiss(id)
          setVisible(false)
        }}
        style={{
          marginLeft: '0.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          color: styles.text,
          opacity: 0.6,
          padding: '0 0.25rem',
        }}
        aria-label="Schliessen"
      >
        \u2715
      </button>
    </div>
  )
}
