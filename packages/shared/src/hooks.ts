import { useEffect, useState, useCallback, useRef } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    return () => { document.title = prev }
  }, [title])
}

export function useMetaTags(tags: Record<string, string>) {
  useEffect(() => {
    const created: HTMLMetaElement[] = []
    for (const [name, content] of Object.entries(tags)) {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
        created.push(el)
      }
      el.content = content
    }
    return () => { created.forEach(el => el.remove()) }
  }, [JSON.stringify(tags)])
}

export function useJsonLd(data: Record<string, unknown>) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
    return () => { script.remove() }
  }, [JSON.stringify(data)])
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStored(prev => {
      const next = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])

  return [stored, setValue]
}

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
}

export function useKeyboardNav(config?: Record<string, () => void>) {
  useEffect(() => {
    if (!config) return
    const handler = (e: KeyboardEvent) => {
      const fn = config[e.key]
      if (fn) fn()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [config])
}

export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

const RECENT_TOOLS_KEY = 'fintutto-recent-tools'

export function useRecentTools() {
  const [tools, setTools] = useLocalStorage<string[]>(RECENT_TOOLS_KEY, [])

  const addTool = useCallback((tool: string) => {
    setTools(prev => {
      const filtered = prev.filter(t => t !== tool)
      return [tool, ...filtered].slice(0, 10)
    })
  }, [setTools])

  return { recentTools: tools, addTool }
}
