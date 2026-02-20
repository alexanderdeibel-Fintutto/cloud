import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Key, Copy, CheckCircle2, Plus, Trash2, Eye, EyeOff, Shield, Info } from 'lucide-react'

interface SteuerIdEintrag {
  id: string
  typ: 'steuer_id' | 'steuernummer' | 'ust_id'
  bezeichnung: string
  nummer: string
  inhaber: string
  finanzamt?: string
  gueltigBis?: string
}

const TYP_CONFIG: Record<string, { label: string; color: string; format: string }> = {
  steuer_id: { label: 'Steuer-ID', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', format: 'XX XXX XXX XXX' },
  steuernummer: { label: 'Steuernummer', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', format: 'XXX/XXX/XXXXX' },
  ust_id: { label: 'USt-IdNr.', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', format: 'DE XXXXXXXXX' },
}

const DEMO_EINTRAEGE: SteuerIdEintrag[] = [
  { id: 'si-1', typ: 'steuer_id', bezeichnung: 'Persönliche Steuer-ID', nummer: '12 345 678 901', inhaber: 'Max Mustermann' },
  { id: 'si-2', typ: 'steuer_id', bezeichnung: 'Steuer-ID Ehepartnerin', nummer: '98 765 432 109', inhaber: 'Lisa Mustermann' },
  { id: 'si-3', typ: 'steuernummer', bezeichnung: 'Einkommensteuer', nummer: '123/456/78901', inhaber: 'Max Mustermann', finanzamt: 'FA Köln-Mitte' },
  { id: 'si-4', typ: 'steuernummer', bezeichnung: 'Gewerbesteuer', nummer: '123/456/78902', inhaber: 'Mustermann GbR', finanzamt: 'FA Köln-Mitte' },
  { id: 'si-5', typ: 'ust_id', bezeichnung: 'Umsatzsteuer-ID', nummer: 'DE 123456789', inhaber: 'Mustermann GbR', gueltigBis: '2027-12-31' },
]

export default function SteuerIdentPage() {
  const [eintraege, setEintraege] = useState(DEMO_EINTRAEGE)
  const [showNummern, setShowNummern] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterTyp, setFilterTyp] = useState<string>('alle')

  const toggleShow = (id: string) => {
    setShowNummern(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyNummer = (eintrag: SteuerIdEintrag) => {
    navigator.clipboard.writeText(eintrag.nummer.replace(/\s/g, '')).then(() => {
      setCopiedId(eintrag.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const deleteEintrag = (id: string) => {
    setEintraege(prev => prev.filter(e => e.id !== id))
  }

  const maskNummer = (nummer: string) => nummer.replace(/[0-9]/g, '•')

  const filtered = filterTyp === 'alle' ? eintraege : eintraege.filter(e => e.typ === filterTyp)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Steuer-Identifikation</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Steuer-IDs, Steuernummern und USt-IDs zentral
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Neue ID
        </button>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Verschlüsselt gespeichert</p>
            <p className="text-muted-foreground">
              Ihre Steuernummern werden lokal verschlüsselt gespeichert und nur bei Bedarf angezeigt.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuer-IDs</p>
            <p className="text-2xl font-bold mt-1">{eintraege.filter(e => e.typ === 'steuer_id').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Steuernummern</p>
            <p className="text-2xl font-bold mt-1">{eintraege.filter(e => e.typ === 'steuernummer').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">USt-IdNr.</p>
            <p className="text-2xl font-bold mt-1">{eintraege.filter(e => e.typ === 'ust_id').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { key: 'alle', label: 'Alle' },
          { key: 'steuer_id', label: 'Steuer-IDs' },
          { key: 'steuernummer', label: 'Steuernummern' },
          { key: 'ust_id', label: 'USt-IdNr.' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterTyp(f.key)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${filterTyp === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-primary/50'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map(eintrag => {
          const typConf = TYP_CONFIG[eintrag.typ]
          const isVisible = showNummern[eintrag.id]
          const isCopied = copiedId === eintrag.id

          return (
            <Card key={eintrag.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm">{eintrag.bezeichnung}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typConf.color}`}>{typConf.label}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-lg font-mono font-medium tracking-wider">
                        {isVisible ? eintrag.nummer : maskNummer(eintrag.nummer)}
                      </code>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{eintrag.inhaber}</span>
                      {eintrag.finanzamt && <span>• {eintrag.finanzamt}</span>}
                      {eintrag.gueltigBis && <span>• Gültig bis {new Date(eintrag.gueltigBis).toLocaleDateString('de-DE')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleShow(eintrag.id)} className="p-2 rounded-md hover:bg-muted transition-colors" title={isVisible ? 'Verbergen' : 'Anzeigen'}>
                      {isVisible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => copyNummer(eintrag)} className="p-2 rounded-md hover:bg-muted transition-colors" title="Kopieren">
                      {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => deleteEintrag(eintrag.id)} className="p-2 rounded-md hover:bg-muted transition-colors" title="Löschen">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Steuer-ID (IdNr.):</strong> 11-stellig, lebenslang gültig, für alle natürlichen Personen.</p>
            <p><strong>Steuernummer:</strong> Vom Finanzamt vergeben, kann sich bei Umzug ändern.</p>
            <p><strong>USt-IdNr.:</strong> Für innergemeinschaftliche Geschäfte, beim BZSt beantragbar.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
