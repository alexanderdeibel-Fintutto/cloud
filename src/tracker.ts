// Universal Account Record (UAR) Tracker
// This script tracks user events and identifies users across the fintutto.world ecosystem.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aaefocdqgdgexkcrjhks.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let fintuttoId = localStorage.getItem('fintutto_id')

if (!fintuttoId) {
  fintuttoId = 'fw_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  localStorage.setItem('fintutto_id', fintuttoId)
}

export const getFintuttoId = () => fintuttoId

export const trackEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uar-event-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        fintutto_id: fintuttoId,
        event_name: eventName,
        app_source: 'portal',
        url: window.location.href,
        properties
      })
    })
    if (!response.ok) {
      console.warn('UAR tracking failed:', await response.text())
    }
  } catch (e) {
    console.warn('UAR tracking error:', e)
  }
}

export const identifyUser = async (email: string, userId?: string, properties: Record<string, any> = {}) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/uar-event-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        fintutto_id: fintuttoId,
        event_name: 'user_identified',
        app_source: 'portal',
        url: window.location.href,
        properties: {
          ...properties,
          email,
          user_id: userId
        }
      })
    })
    if (!response.ok) {
      console.warn('UAR identify failed:', await response.text())
    }
  } catch (e) {
    console.warn('UAR identify error:', e)
  }
}

// Auto-track page views
let lastUrl = ''
const trackPageView = () => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href
    trackEvent('page_view', { path: window.location.pathname })
  }
}

// Track initial page view
if (typeof window !== 'undefined') {
  setTimeout(trackPageView, 1000)
  
  // Setup history listener for SPA routing
  const originalPushState = history.pushState
  history.pushState = function() {
    originalPushState.apply(this, arguments as any)
    setTimeout(trackPageView, 100)
  }
  
  window.addEventListener('popstate', () => {
    setTimeout(trackPageView, 100)
  })
}
