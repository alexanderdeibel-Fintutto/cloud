import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Eye,
  Edit2,
  Copy,
  FolderOpen,
  FileSignature,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Key,
  Users,
  Euro,
  Home
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

interface Dokument {
  id: string
  typ: string
  titel: string
  erstelltAm: string
  geaendertAm: string
  status: 'entwurf' | 'fertig' | 'gesendet'
  parteien: string[]
  icon: React.ElementType
  farbe: string
}

const demoDokumente: Dokument[] = [
  {
    id: '1',
    typ: 'mietvertrag',
    titel: 'Mietvertrag - Musterstraße 123',
    erstelltAm: '2024-01-15',
    geaendertAm: '2024-01-15',
    status: 'fertig',
    parteien: ['Max Mustermann', 'Erika Musterfrau'],
    icon: FileSignature,
    farbe: 'blue'
  },
  {
    id: '2',
    typ: 'kuendigung',
    titel: 'Kündigung - Beispielweg 45',
    erstelltAm: '2024-01-20',
    geaendertAm: '2024-01-20',
    status: 'gesendet',
    parteien: ['Hans Müller'],
    icon: FileText,
    farbe: 'red'
  },
  {
    id: '3',
    typ: 'uebergabeprotokoll',
    titel: 'Übergabeprotokoll - Testgasse 7',
    erstelltAm: '2024-01-25',
    geaendertAm: '2024-01-28',
    status: 'entwurf',
    parteien: ['Anna Schmidt', 'Peter Weber'],
    icon: ClipboardList,
    farbe: 'green'
  },
  {
    id: '4',
    typ: 'mieterhoehung',
    titel: 'Mieterhöhung - Hauptstraße 99',
    erstelltAm: '2024-02-01',
    geaendertAm: '2024-02-01',
    status: 'entwurf',
    parteien: ['Familie Schulze'],
    icon: TrendingUp,
    farbe: 'orange'
  },
]

const dokumentTypen = [
  { id: 'alle', label: 'Alle Dokumente' },
  { id: 'mietvertrag', label: 'Mietverträge', icon: FileSignature },
  { id: 'kuendigung', label: 'Kündigungen', icon: FileText },
  { id: 'uebergabeprotokoll', label: 'Übergabeprotokolle', icon: ClipboardList },
  { id: 'betriebskosten', label: 'Betriebskosten', icon: Euro },
  { id: 'mieterhoehung', label: 'Mieterhöhungen', icon: TrendingUp },
  { id: 'maengelanzeige', label: 'Mängelanzeigen', icon: AlertTriangle },
  { id: 'untermietvertrag', label: 'Untermietverträge', icon: Key },
  { id: 'selbstauskunft', label: 'Selbstauskünfte', icon: Users },
]

const neueFormulare = [
  { id: 'mietvertrag', label: 'Mietvertrag', href: '/formulare/mietvertrag', icon: FileSignature },
  { id: 'kuendigung', label: 'Kündigung', href: '/formulare/kuendigung', icon: FileText },
  { id: 'uebergabeprotokoll', label: 'Übergabeprotokoll', href: '/formulare/uebergabeprotokoll', icon: ClipboardList },
  { id: 'betriebskosten', label: 'Betriebskosten', href: '/formulare/betriebskosten', icon: Euro },
  { id: 'mieterhoehung', label: 'Mieterhöhung', href: '/formulare/mieterhoehung', icon: TrendingUp },
  { id: 'maengelanzeige', label: 'Mängelanzeige', href: '/formulare/maengelanzeige', icon: AlertTriangle },
  { id: 'untermietvertrag', label: 'Untermietvertrag', href: '/formulare/untermietvertrag', icon: Key },
  { id: 'selbstauskunft', label: 'Selbstauskunft', href: '/formulare/selbstauskunft', icon: Users },
]

export default function MeineDokumente() {
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterTyp, setFilterTyp] = useState('alle')
  const [filterStatus, setFilterStatus] = useState('alle')
  const [dokumente, setDokumente] = useState<Dokument[]>(demoDokumente)

  const gefilterteDokumente = dokumente.filter(dok => {
    const matchSuche = dok.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
                       dok.parteien.some(p => p.toLowerCase().includes(suchbegriff.toLowerCase()))
    const matchTyp = filterTyp === 'alle' || dok.typ === filterTyp
    const matchStatus = filterStatus === 'alle' || dok.status === filterStatus
    return matchSuche && matchTyp && matchStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'entwurf':
        return <Badge variant="secondary">Entwurf</Badge>
      case 'fertig':
        return <Badge variant="default" className="bg-green-600">Fertig</Badge>
      case 'gesendet':
        return <Badge variant="default" className="bg-blue-600">Gesendet</Badge>
      default:
        return null
    }
  }

  const deleteDokument = (id: string) => {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      setDokumente(prev => prev.filter(d => d.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h1 className="font-semibold">Meine Dokumente</h1>
                  <p className="text-sm text-muted-foreground">
                    {dokumente.length} Dokumente gespeichert
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Neues Dokument</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {neueFormulare.map((formular) => (
                  <Link key={formular.id} to={formular.href}>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-auto py-2">
                      <formular.icon className="h-4 w-4" />
                      <span className="text-sm">{formular.label}</span>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dokumenttyp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {dokumentTypen.map((typ) => (
                  <Button
                    key={typ.id}
                    variant={filterTyp === typ.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2 h-auto py-2"
                    onClick={() => setFilterTyp(typ.id)}
                  >
                    {typ.icon && <typ.icon className="h-4 w-4" />}
                    <span className="text-sm">{typ.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Übersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entwürfe</span>
                  <span className="font-medium">
                    {dokumente.filter(d => d.status === 'entwurf').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fertig</span>
                  <span className="font-medium">
                    {dokumente.filter(d => d.status === 'fertig').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gesendet</span>
                  <span className="font-medium">
                    {dokumente.filter(d => d.status === 'gesendet').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Dokumente durchsuchen..."
                  value={suchbegriff}
                  onChange={(e) => setSuchbegriff(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle Status</SelectItem>
                  <SelectItem value="entwurf">Entwürfe</SelectItem>
                  <SelectItem value="fertig">Fertig</SelectItem>
                  <SelectItem value="gesendet">Gesendet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {gefilterteDokumente.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Keine Dokumente gefunden</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {suchbegriff || filterTyp !== 'alle' || filterStatus !== 'alle'
                      ? 'Versuchen Sie andere Suchkriterien'
                      : 'Erstellen Sie Ihr erstes Dokument'}
                  </p>
                  <Link to="/formulare/mietvertrag">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Neues Dokument
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {gefilterteDokumente.map((dok) => (
                  <Card key={dok.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-${dok.farbe}-100`}>
                          <dok.icon className={`h-6 w-6 text-${dok.farbe}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold truncate">{dok.titel}</h3>
                              <p className="text-sm text-muted-foreground">
                                {dok.parteien.join(', ')}
                              </p>
                            </div>
                            {getStatusBadge(dok.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Erstellt: {formatDate(dok.erstelltAm)}
                            </span>
                            {dok.erstelltAm !== dok.geaendertAm && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Geändert: {formatDate(dok.geaendertAm)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" title="Anzeigen">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Bearbeiten">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Duplizieren">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="PDF herunterladen">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Löschen"
                            onClick={() => deleteDokument(dok.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Home className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Lokale Speicherung</p>
                    <p className="mt-1">
                      Ihre Dokumente werden sicher in Ihrem Browser gespeichert.
                      Exportieren Sie wichtige Dokumente als PDF zur dauerhaften Archivierung.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
