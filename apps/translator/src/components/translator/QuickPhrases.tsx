import { MessageSquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface QuickPhrasesProps {
  onSelect: (text: string) => void
}

const QUICK_PHRASES = [
  { category: 'Begrüßung', phrases: ['Hallo, wie geht es Ihnen?', 'Guten Tag!', 'Vielen Dank!'] },
  { category: 'Immobilien', phrases: ['Wann kann ich die Wohnung besichtigen?', 'Wie hoch ist die Kaltmiete?', 'Sind Haustiere erlaubt?'] },
  { category: 'Behörden', phrases: ['Ich brauche einen Termin.', 'Wo muss ich unterschreiben?', 'Welche Unterlagen brauche ich?'] },
  { category: 'Alltag', phrases: ['Wo ist der nächste Supermarkt?', 'Können Sie mir helfen?', 'Was kostet das?'] },
]

export default function QuickPhrases({ onSelect }: QuickPhrasesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Häufige Sätze
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {QUICK_PHRASES.map(group => (
            <div key={group.category}>
              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">{group.category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {group.phrases.map(phrase => (
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
