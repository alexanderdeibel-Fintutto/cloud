import { useState } from 'react'
import { MessageSquare, Ship, Globe, Mountain } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getPhrasePacks, type PhrasePack } from '@/lib/offline/phrase-packs'

interface QuickPhrasesProps {
  onSelect: (text: string) => void
}

const PACK_ICONS: Record<string, typeof Globe> = {
  common: Globe,
  mediterranean: Ship,
  nordic: Mountain,
}

export default function QuickPhrases({ onSelect }: QuickPhrasesProps) {
  const packs = getPhrasePacks()
  const [activePackId, setActivePackId] = useState(packs[0]?.id || 'common')

  const activePack = packs.find(p => p.id === activePackId) || packs[0]

  // Group phrases by category
  const grouped = activePack?.phrases.reduce((acc, phrase) => {
    if (!acc[phrase.category]) acc[phrase.category] = []
    acc[phrase.category].push(phrase.text)
    return acc
  }, {} as Record<string, string[]>) ?? {}

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Häufige Sätze
        </CardTitle>
        {/* Pack selector tabs */}
        <div className="flex gap-1 mt-2">
          {packs.map(pack => {
            const Icon = PACK_ICONS[pack.id] || Globe
            return (
              <button
                key={pack.id}
                onClick={() => setActivePackId(pack.id)}
                className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
                  activePackId === pack.id
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
                title={pack.description}
              >
                <Icon className="h-3 w-3" />
                {pack.name}
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(grouped).map(([category, phrases]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">{category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {phrases.map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => onSelect(phrase)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
