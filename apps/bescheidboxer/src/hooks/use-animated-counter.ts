import { useState, useEffect, useRef } from 'react'

export function useAnimatedCounter(end: number, duration = 800) {
  const [count, setCount] = useState(0)
  const prevEnd = useRef(end)

  useEffect(() => {
    if (end === prevEnd.current && count === end) return
    prevEnd.current = end

    const start = count
    const startTime = performance.now()

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + (end - start) * eased)

      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [end, duration])

  return count
}
