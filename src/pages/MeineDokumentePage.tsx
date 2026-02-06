import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Plus, Trash2, Edit, Download,
  Clock, History, Crown, FolderOpen
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { FormProvider, useForm, FormDocument } from '@/contexts/FormContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

function DokumenteContent() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { getUserDocuments, deleteDocument } = useForm()
  const [documents, setDocuments] = useState<FormDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const canSave = profile && (profile.tier === 'basic' || profile.tier === 'premium')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const docs = await getUserDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Dokument wirklich loeschen?')) return

    try {
      await deleteDocument(documentId)
      setDocuments(documents.filter(d => d.id !== documentId))
      toast.success('Dokument geloescht')
    } catch (error) {
      toast.error('Fehler beim Loeschen')
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meine Dokumente</h1>
            <p className="text-gray-600 mt-1">
              Alle Ihre gespeicherten Formulare und Schreiben
            </p>
          </div>
          <Button asChild>
            <Link to="/formulare">
              <Plus className="w-4 h-4 mr-2" />
              Neues Dokument
            </Link>
          </Button>
        </div>

        {/* Upgrade Banner for Free Users */}
        {!canSave && (
          <Card className="mb-8 bg-gradient-to-r from-fintutto-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Crown className="w-10 h-10" />
                  <div>
                    <h3 className="font-bold text-lg">Cloud-Speicherung freischalten</h3>
                    <p className="text-white/80">
                      Speichern Sie Ihre Dokumente sicher in der Cloud und greifen Sie von ueberall darauf zu.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => navigate('/preise')}>
                  Jetzt upgraden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-fintutto-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Dokumente werden geladen...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && documents.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Noch keine Dokumente
              </h2>
              <p className="text-gray-600 mb-6">
                Erstellen Sie Ihr erstes Dokument aus unserer Formular-Bibliothek.
              </p>
              <Button asChild>
                <Link to="/formulare">
                  <Plus className="w-4 h-4 mr-2" />
                  Formular auswaehlen
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documents Grid */}
        {!isLoading && documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-fintutto-light rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-fintutto-primary" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/formulare/${doc.formTemplateId}?documentId=${doc.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {doc.formTemplateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(doc.updatedAt).toLocaleDateString('de-DE')}
                      </div>
                      {doc.versions && doc.versions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <History className="w-4 h-4" />
                          {doc.versions.length} Version{doc.versions.length !== 1 ? 'en' : ''}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        doc.status === 'finalized'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.status === 'finalized' ? 'Abgeschlossen' : 'Entwurf'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Local Drafts Info */}
        {!canSave && (
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Lokale Speicherung</h4>
                <p className="text-sm text-amber-700">
                  Ihre Dokumente werden nur lokal im Browser gespeichert.
                  Beim Loeschen der Browserdaten gehen sie verloren.
                  Upgraden Sie fuer sichere Cloud-Speicherung.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MeineDokumentePage() {
  return (
    <FormProvider>
      <DokumenteContent />
    </FormProvider>
  )
}
