import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top on every route change.
 * Place once in your app layout or router wrapper.
 *
 * Usage:
 *   function Layout() {
 *     useScrollToTop()
 *     return <Outlet />
 *   }
 */
export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
}
