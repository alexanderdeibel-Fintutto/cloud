import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, Brain, Zap, Shield, FileText, FolderOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import DocumentUpload from '@/components/documents/DocumentUpload'
import { useUploadDocument } from '@/hooks/useDocuments'
import { useCollections, useAddDocumentToCollection, useCreateCollection } from '@/hooks/useCollections'
import { supabase } from '@/integrations/supabase'
import { toast } from 'sonner'

interface UploadedDoc {
  id: string
  title: string
  file_type: string
}

const features = [
  { icon: Brain, title: 'KI-Analyse', desc: 'Automatische Zusammenfassung & Kategorisierung' },
  { icon: Zap, title: 'OCR-Erkennung', desc: 'Text wird aus Bildern & PDFs extrahiert' },
  { icon: FileText, title: 'Volltextsuche', desc: 'Jedes Dokument wird durchsuchbar' },
  { icon: Shield, title: 'Sicher', desc: 'Ende-zu-Ende verschlüsselt gespeichert' },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const uploadDocument = useUploadDocument()
  const { data: collections = [] } = useCollections()
  const addToCollection = useAddDocumentToCollection()
  const createCollection = useCreateCollection()
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [showOrganizeDialog, setShowOrganizeDialog] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [newCollectionName, setNewCollectionName] = useState('')

  // Pick up files dropped on the GlobalDropZone
  useEffect(() => {
    if (searchParams.get('dropped') === 'true') {
      const pendingFiles = (window as unknown as { __pendingFiles?: File[] }).__pendingFiles
      if (pendingFiles && pendingFiles.length > 0) {
        handleUpload(pendingFiles)
        delete (window as unknown as { __pendingFiles?: File[] }).__pendingFiles
        sessionStorage.removeItem('pendingUploadFiles')
      }
    }
  }, [searchParams])

  const handleUpload = async (files: File[]) => {
    try {
      const results = await uploadDocument.mutateAsync(files)
      const docs = results.map((r: any) => ({
        id: r.id,
        title: r.title,
        file_type: r.file_type,
      }))
      setUploadedDocs(docs)
      toast.success(`${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} hochgeladen`)
      // Show organize dialog
      setShowOrganizeDialog(true)
    } catch {
      toast.error('Fehler beim Hochladen')
    }
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (!tag || tags.includes(tag)) return
    setTags([...tags, tag])
    setNewTag('')
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    try {
      const col = await createCollection.mutateAsync({ name: newCollectionName.trim() })
      setSelectedCollectionId(col.id)
      setNewCollectionName('')
      toast.success('Sammlung erstellt')
    } catch {
      toast.error('Fehler beim Erstellen')
    }
  }

  const handleOrganize = async () => {
    // Apply tags to all uploaded documents
    if (tags.length > 0) {
      for (const doc of uploadedDocs) {
        await supabase
          .from('sb_documents')
          .update({ tags })
          .eq('id', doc.id)
      }
    }

    // Assign to collection
    if (selectedCollectionId) {
      for (const doc of uploadedDocs) {
        addToCollection.mutate({ documentId: doc.id, collectionId: selectedCollectionId })
      }
    }

    setShowOrganizeDialog(false)
    toast.success('Dokumente organisiert')
  }

  const handleSkip = () => {
    setShowOrganizeDialog(false)
    setUploadedDocs([])
    setTags([])
    setSelectedCollectionId(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" />
          Dokumente hochladen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lade Dokumente hoch — sie werden automatisch per KI analysiert und durchsuchbar gemacht.
        </p>
      </div>

      {/* Pre-select collection */}
      {collections.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            Direkt einer Sammlung zuordnen (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCollectionId(null)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${!selectedCollectionId ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/30'}`}
            >
              Keine
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${selectedCollectionId === col.id ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:border-primary/30'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                {col.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <DocumentUpload onUpload={handleUpload} />

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{feature.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Supported Formats */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Unterstützte Formate</h3>
          <div className="flex flex-wrap gap-2">
            {['PDF', 'JPG', 'PNG', 'WebP', 'GIF', 'TXT', 'MD', 'DOC', 'DOCX', 'CSV'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground"
              >
                .{fmt.toLowerCase()}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Maximale Dateigröße: 50 MB pro Datei. Bis zu 10 Dateien gleichzeitig.
          </p>
        </CardContent>
      </Card>

      {/* Post-Upload Organize Dialog */}
      <Dialog open={showOrganizeDialog} onOpenChange={(open) => !open && handleSkip()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {uploadedDocs.length} {uploadedDocs.length === 1 ? 'Dokument' : 'Dokumente'} hochgeladen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Uploaded files list */}
            <div className="space-y-1.5">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{doc.title}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto shrink-0">{doc.file_type}</Badge>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-medium mb-2">Tags hinzufügen</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="z.B. Mietvertrag, Steuer, Rechnung..."
                  className="h-9 text-sm"
                />
                <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={handleAddTag} disabled={!newTag.trim()}>
                  Hinzufügen
                </Button>
              </div>
            </div>

            {/* Collection */}
            <div>
              <p className="text-sm font-medium mb-2">Sammlung zuordnen</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => setSelectedCollectionId(null)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${!selectedCollectionId ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}
                >
                  Keine
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${selectedCollectionId === col.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    {col.name}
                  </button>
                ))}
              </div>
              {/* Quick create collection */}
              <div className="flex gap-2">
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                  placeholder="Neue Sammlung erstellen..."
                  className="h-9 text-sm"
                />
                <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                  Erstellen
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={handleSkip}>
                Überspringen
              </Button>
              <Button className="flex-1" onClick={handleOrganize}>
                Organisieren
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
