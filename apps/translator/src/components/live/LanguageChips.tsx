import { LANGUAGES } from '@/lib/languages'

interface LanguageChipsProps {
  selected: string
  onSelect: (code: string) => void
  exclude?: string
}

export default function LanguageChips({ selected, onSelect, exclude }: LanguageChipsProps) {
  const langs = exclude ? LANGUAGES.filter(l => l.code !== exclude) : LANGUAGES

  return (
    <div className="flex flex-wrap gap-2">
      {langs.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {lang.flag} {lang.nativeName}
        </button>
      ))}
    </div>
  )
}
