import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Search,
  Plus,
  Calendar,
  Clock,
  Edit2,
  FolderOpen,
  FileSignature,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Key,
  Users,
  Euro,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getDocuments, deleteDocument, DOCUMENT_TYPES, type SavedDocument } from '@/services/documentStorage'
import { useToast } from '@/hooks/use-toast'

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

function getIconForType(type: string) {
  if (type.includes('mietvertrag') || type.includes('vertrag')) return FileSignature
  if (type.includes('kuendigung') || type.includes('raeumung')) return FileText
  if (type.includes('protokoll') || type.includes('uebergabe')) return ClipboardList
  if (type.includes('kosten') || type.includes('zahlung') || type.includes('kaution') || type.includes('mahnung')) return Euro
  if (type.includes('erhoehung') || type.includes('anpassung')) return TrendingUp
  if (type.includes('maengel') || type.includes('minderung') || type.includes('reparatur')) return AlertTriangle
  if (type.includes('unter')) return Key
  if (type.includes('auskunft') || type.includes('bescheinigung')) return Users
  return FileText
}

export default function MeineDokumente() {
  const { user, isAuthenticated, showLoginModal } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [suchbegriff, setSuchbegriff] = useState('')
  const [filterTyp, setFilterTyp] = useState('alle')
  const [dokumente, setDokumente] = useState<SavedDocument[]>([])

  useEffect(() => {
    if (isAuthenticated && user) {
      setDokumente(getDocuments(user.id))
    }
  }, [isAuthenticated, user])

  const gefilterteDokumente = dokumente.filter(dok => {
    const matchSuche = dok.title.toLowerCase().includes(suchbegriff.toLowerCase()) ||
                       (DOCUMENT_TYPES[dok.type] || '').toLowerCase().includes(suchbegriff.toLowerCase())
    const matchTyp = filterTyp === 'alle' || dok.type === filterTyp || dok.type.includes(filterTyp)
    return matchSuche && matchTyp
  })

  const handleDelete = (id: string) => {
    if (!user) return
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      deleteDocument(id, user.id)
      setDokumente(prev => prev.filter(d => d.id !== id))
      toast({ title: 'Gelöscht', description: 'Dokument wurde gelöscht.' })
    }
  }

  const handleEdit = (doc: SavedDocument) => {
    // Navigate to the form with the document ID
    navigate(`/formulare/${doc.type}?id=${doc.id}`)
  }

  const handleDownloadPDF = async (doc: SavedDocument) => {
    try {
      // Dynamic import of the PDF generator
      const pdfModule = await import(`@/lib/pdf/${doc.type.replace(/-/g, '')}-pdf`)
      if (pdfModule.generatePDF || Object.values(pdfModule)[0]) {
        const generateFn = pdfModule.generatePDF || Object.values(pdfModule)[0] as Function
        await generateFn(doc.data)
        toast({ title: 'PDF erstellt', description: 'Das Dokument wurde als PDF heruntergeladen.' })
      }
    } catch (error) {
      // Try with different naming conventions
      try {
        const altType = doc.type.replace(/-/g, '').toLowerCase()
        const pdfModule = await import(`@/lib/pdf/${altType}-pdf.ts`)
        const generateFn = Object.values(pdfModule)[0] as Function
        await generateFn(doc.data)
        toast({ title: 'PDF erstellt', description: 'Das Dokument wurde als PDF heruntergeladen.' })
      } catch {
        toast({
          title: 'Fehler',
          description: 'PDF konnte nicht erstellt werden. Bitte öffnen Sie das Dokument zum Bearbeiten.',
          variant: 'destructive'
        })
      }
    }
  }

  // Not logged in view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
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
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                <LogIn className="h-8 w-8 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Anmeldung erforderlich</h2>
              <p className="text-muted-foreground mb-6">
                Melden Sie sich an, um Ihre gespeicherten Dokumente zu sehen und weiterzubearbeiten.
              </p>
              <Button onClick={showLoginModal} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Anmelden
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Noch kein Konto? Klicken Sie auf Anmelden und wählen Sie "Registrieren".
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
            <div className="text-sm text-muted-foreground">
              Angemeldet als {user?.name}
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
                <Link to="/#alle-formulare">
                  <Button variant="outline" className="w-full mt-2">
                    Alle Formulare
                  </Button>
                </Link>
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
            </div>

            {gefilterteDokumente.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Keine Dokumente gefunden</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {suchbegriff || filterTyp !== 'alle'
                      ? 'Versuchen Sie andere Suchkriterien'
                      : 'Erstellen Sie Ihr erstes Dokument und speichern Sie es hier.'}
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
                {gefilterteDokumente.map((dok) => {
                  const IconComponent = getIconForType(dok.type)
                  return (
                    <Card key={dok.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-blue-100">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold truncate">{dok.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {DOCUMENT_TYPES[dok.type] || dok.type}
                                </p>
                              </div>
                              <Badge variant="secondary">Gespeichert</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Erstellt: {formatDate(dok.createdAt)}
                              </span>
                              {dok.createdAt !== dok.updatedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Geändert: {formatDate(dok.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Bearbeiten"
                              onClick={() => handleEdit(dok)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="PDF herunterladen"
                              onClick={() => handleDownloadPDF(dok)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Löschen"
                              onClick={() => handleDelete(dok.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
