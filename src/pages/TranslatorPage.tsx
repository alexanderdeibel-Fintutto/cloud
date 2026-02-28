import { Globe, Mic, Languages, Zap, ArrowRight, ExternalLink } from 'lucide-react'
import { useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDocumentTitle, useMetaTags, EcosystemStatsBar, CrossAppRecommendations } from '@fintutto/shared'
import { Button } from '@/components/ui/button'
import TranslationPanel from '@/components/translator/TranslationPanel'
import TranslationHistory from '@/components/translator/TranslationHistory'
import QuickPhrases from '@/components/translator/QuickPhrases'
import { useTranslationHistory } from '@/hooks/useTranslationHistory'
import { LANGUAGES } from '@/lib/translator/languages'

export default function TranslatorPage() {
  const { pathname } = useLocation()
  const [quickText, setQuickText] = useState('')
  const [sourceLang, setSourceLang] = useState('')
  const [targetLang, setTargetLang] = useState('')
  const { history, addEntry, clearHistory, removeEntry } = useTranslationHistory()

  useDocumentTitle('Uebersetzer', 'Fintutto')
  useMetaTags({
    title: 'Fintutto Uebersetzer – Kostenlos uebersetzen mit Spracheingabe & TTS',
    description: 'Kostenloser Online-Uebersetzer mit 22 Sprachen, Spracheingabe, Text-to-Speech und Uebersetzungsverlauf. Die wichtigste App im Fintutto-Oekosystem.',
    path: '/uebersetzer',
    siteName: 'Fintutto Uebersetzer',
  })

  const handleConsumed = useCallback(() => {
    setQuickText('')
    setSourceLang('')
    setTargetLang('')
  }, [])

  const handleHistorySelect = useCallback((text: string, src: string, tgt: string) => {
    setQuickText(text)
    setSourceLang(src)
    setTargetLang(tgt)
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <Globe className="h-4 w-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">
                Die meistgenutzte App im Fintutto-Oekosystem
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Fintutto Uebersetzer
            </h1>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Texte kostenlos uebersetzen, vorlesen lassen und per Spracheingabe diktieren.
              {LANGUAGES.length} Sprachen mit Google Cloud Text-to-Speech.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { icon: Globe, label: `${LANGUAGES.length} Sprachen` },
                { icon: Mic, label: 'Spracheingabe' },
                { icon: Languages, label: 'Sofort-Uebersetzung' },
                { icon: Zap, label: '100% Kostenlos' },
              ].map(f => (
                <div
                  key={f.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-medium"
                >
                  <f.icon className="h-3 w-3" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8 space-y-6">
        {/* Translation Panel */}
        <TranslationPanel
          initialText={quickText}
          initialSourceLang={sourceLang}
          initialTargetLang={targetLang}
          onInitialTextConsumed={handleConsumed}
          addEntry={addEntry}
        />

        {/* Quick Phrases & History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickPhrases onSelect={setQuickText} />
          <TranslationHistory
            history={history}
            clearHistory={clearHistory}
            removeEntry={removeEntry}
            onSelect={handleHistorySelect}
          />
        </div>

        {/* Full App Link */}
        <div className="text-center py-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Noch mehr Features? Die vollstaendige Translator-App mit Live-Sessions, Offline-Modus und mobiler App:
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="https://translator-fintutto.vercel.app" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Translator-App oeffnen
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>

        <CrossAppRecommendations currentPath={pathname} currentAppSlug="mieter-checker" />

        <EcosystemStatsBar
          linkTo="/apps"
          renderLink={({ to, children, className }) => (
            <Link to={to} className={className}>{children}</Link>
          )}
        />
      </div>
    </div>
  )
}
