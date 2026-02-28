import { MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface QuickPhrasesProps {
  onSelect: (text: string) => void
}

const QUICK_PHRASES = [
  { category: 'Begruessung', phrases: ['Hallo, wie geht es Ihnen?', 'Guten Tag!', 'Vielen Dank!'] },
  { category: 'Immobilien', phrases: ['Wann kann ich die Wohnung besichtigen?', 'Wie hoch ist die Kaltmiete?', 'Sind Haustiere erlaubt?'] },
  { category: 'Behoerden', phrases: ['Ich brauche einen Termin.', 'Wo muss ich unterschreiben?', 'Welche Unterlagen brauche ich?'] },
  { category: 'Alltag', phrases: ['Wo ist der naechste Supermarkt?', 'Koennen Sie mir helfen?', 'Was kostet das?'] },
]

export default function QuickPhrases({ onSelect }: QuickPhrasesProps) {
  return (
    <Card>
      <div className="p-4 pb-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Haeufige Saetze
        </h3>
      </div>
      <CardContent className="pt-0">
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
