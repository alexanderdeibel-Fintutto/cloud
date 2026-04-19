import { useState, useRef, useEffect } from 'react'
import { useLanguage } from './useLanguage'

const LANG_LABELS: Record<string, string> = {
  de: 'DE', en: 'EN', fr: 'FR', es: 'ES', it: 'IT',
  ja: 'JA', zh: 'ZH', ar: 'AR', pt: 'PT', nl: 'NL',
}

export function LanguageSwitcher() {
  const { lang, setLang, supportedLangs } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2 py-1 rounded"
        aria-label="Sprache wählen"
      >
        {LANG_LABELS[lang]}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 min-w-[80px]">
          {supportedLangs.map(l => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 transition-colors ${l === lang ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
