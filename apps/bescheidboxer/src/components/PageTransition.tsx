import { useLocation } from 'react-router-dom'
import { useRef, useEffect, type ReactNode } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Remove and re-add the animation class on each navigation
    el.classList.remove('page-enter')
    // Force reflow to restart animation
    void el.offsetWidth
    el.classList.add('page-enter')
  }, [location.pathname])

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  )
}
