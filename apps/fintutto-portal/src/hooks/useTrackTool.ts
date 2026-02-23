import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecentTools } from '@fintutto/shared'

/**
 * Tracks the current page as a recently used tool.
 * Call once per page component: useTrackTool('Kautions-Rechner')
 */
export function useTrackTool(title: string) {
  const location = useLocation()
  const { trackTool } = useRecentTools('portal')

  useEffect(() => {
    trackTool(location.pathname, title)
  }, [location.pathname, title, trackTool])
}
