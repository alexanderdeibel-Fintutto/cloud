import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, Printer, Send, History, FileText,
  Check, AlertCircle, Clock, Download, X, Pen
} from 'lucide-react'
import { useForm, FormTemplate, FormVersion } from '@/contexts/FormContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import SignaturePad from './SignaturePad'
import VersionHistoryPanel from './VersionHistoryPanel'

interface FormEditorProps {
  templateId: string
  prefilledData?: Record<string, unknown>
}

export default function FormEditor({ templateId, prefilledData }: FormEditorProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const {
    currentDocument,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    createNewDocument,
    updateFormData,
    saveDocument,
    saveDraft,
    createVersion,
    getVersionHistory,
    getTemplate,
    addSignature,
  } = useForm()

  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [versions, setVersions] = useState<FormVersion[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const template = getTemplate(templateId)
  const canSave = profile && (profile.tier === 'basic' || profile.tier === 'premium')

  // Initialize form
  useEffect(() => {
    const initForm = async () => {
      await createNewDocument(templateId, prefilledData)
    }
    initForm()
  }, [templateId])

  // Load form data when document is ready
  useEffect(() => {
    if (currentDocument) {
      setFormValues(currentDocument.currentData || {})
      loadVersions()
    }
  }, [currentDocument?.id])

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      await saveDraft()
      setLastSaved(new Date())
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formValues, hasUnsavedChanges])

  const loadVersions = async () => {
    if (currentDocument) {
      const history = await getVersionHistory(currentDocument.id)
      setVersions(history)
    }
  }

  const handleFieldChange = (fieldId: string, value: unknown) => {
    const newValues = { ...formValues, [fieldId]: value }
    setFormValues(newValues)
    updateFormData(newValues)
  }

  const handleSave = async () => {
    if (!canSave) {
      toast.error('Speichern ist nur fuer Basic und Premium Nutzer verfuegbar')
      return
    }

    try {
      await saveDocument()
      setLastSaved(new Date())
      toast.success('Dokument gespeichert')
    } catch (error) {
      toast.error('Fehler beim Speichern')
    }
  }

  const handlePrint = async () => {
    try {
      const version = await createVersion('printed')
      await loadVersions()
      toast.success(`Version ${version.versionNumber} erstellt`)

      // Open print dialog
      window.print()
    } catch (error) {
      toast.error('Fehler beim Drucken')
    }
  }

  const handleSend = async () => {
    // TODO: Open email dialog
    toast.info('E-Mail-Versand wird implementiert...')
  }

  const handleSignature = (signatureData: string) => {
    addSignature(signatureData)
    handleFieldChange('signature', signatureData)
    handleFieldChange('signedAt', new Date().toISOString())
    setShowSignature(false)
    toast.success('Unterschrift hinzugefuegt')
  }

  if (!template) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Formular nicht gefunden</h2>
        <p className="text-gray-600">Das angeforderte Formular existiert nicht.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-fintutto-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Formular wird geladen...</p>
      </div>
    )
  }

  // Group fields by section
  const sections = template.fields.reduce((acc, field) => {
    const section = field.section || 'allgemein'
    if (!acc[section]) acc[section] = []
    acc[section].push(field)
    return acc
  }, {} as Record<string, typeof template.fields>)

  const sectionNames: Record<string, string> = {
    absender: 'Absender (Sie)',
    empfaenger: 'Empfaenger (Vermieter)',
    mietverhaeltnis: 'Mietverhaeltnis',
    forderung: 'Forderung',
    unterschrift: 'Unterschrift',
    allgemein: 'Allgemeine Angaben',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-gray-600">{template.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Nicht gespeichert
                </span>
              )}
              {lastSaved && !hasUnsavedChanges && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Gespeichert {lastSaved.toLocaleTimeString('de-DE')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {canSave ? (
              <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Speichern...' : 'Speichern'}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/preise')}>
                <Save className="w-4 h-4 mr-2" />
                Upgrade zum Speichern
              </Button>
            )}

            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Drucken / PDF
            </Button>

            <Button variant="outline" onClick={handleSend}>
              <Send className="w-4 h-4 mr-2" />
              Per E-Mail senden
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className={showVersionHistory ? 'bg-fintutto-light border-fintutto-primary' : ''}
            >
              <History className="w-4 h-4 mr-2" />
              Versionen ({versions.length})
            </Button>
          </div>
        </div>

        {/* Version History Panel */}
        <AnimatePresence>
          {showVersionHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <VersionHistoryPanel
                versions={versions}
                onClose={() => setShowVersionHistory(false)}
                onLoadVersion={(version) => {
                  setFormValues(version.data as Record<string, unknown>)
                  updateFormData(version.data as Record<string, unknown>)
                  toast.success(`Version ${version.versionNumber} geladen`)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Sections */}
        <div className="space-y-6">
          {Object.entries(sections).map(([sectionId, fields]) => (
            <Card key={sectionId}>
              <CardHeader>
                <CardTitle className="text-lg">{sectionNames[sectionId] || sectionId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.id} className="mb-2 block">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {field.type === 'text' && (
                      <Input
                        id={field.id}
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <Textarea
                        id={field.id}
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                      />
                    )}

                    {field.type === 'date' && (
                      <Input
                        id={field.id}
                        type="date"
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {field.type === 'number' && (
                      <Input
                        id={field.id}
                        type="number"
                        value={(formValues[field.id] as number) || ''}
                        onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    )}

                    {field.type === 'currency' && (
                      <div className="relative">
                        <Input
                          id={field.id}
                          type="number"
                          step="0.01"
                          value={(formValues[field.id] as number) || ''}
                          onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
                          placeholder={field.placeholder}
                          required={field.required}
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">EUR</span>
                      </div>
                    )}

                    {field.type === 'select' && field.options && (
                      <select
                        id={field.id}
                        value={(formValues[field.id] as string) || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-fintutto-primary"
                      >
                        <option value="">Bitte waehlen...</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'signature' && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        {formValues.signature ? (
                          <div className="relative">
                            <img
                              src={formValues.signature as string}
                              alt="Unterschrift"
                              className="max-h-24 mx-auto"
                            />
                            <p className="text-sm text-gray-500 text-center mt-2">
                              Unterschrieben am {new Date(formValues.signedAt as string).toLocaleString('de-DE')}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSignature(true)}
                              className="absolute top-0 right-0"
                            >
                              <Pen className="w-4 h-4 mr-1" />
                              Neu unterschreiben
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setShowSignature(true)}
                            className="w-full"
                          >
                            <Pen className="w-4 h-4 mr-2" />
                            Digital unterschreiben
                          </Button>
                        )}
                      </div>
                    )}

                    {field.helpText && (
                      <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal Text Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vorschau des Dokuments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-8 font-serif text-sm whitespace-pre-wrap">
              {template.legalText}
            </div>
          </CardContent>
        </Card>

        {/* Signature Modal */}
        <AnimatePresence>
          {showSignature && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSignature(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-xl max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">Digital unterschreiben</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSignature(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <SignaturePad
                    onSave={handleSignature}
                    onCancel={() => setShowSignature(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tier Upgrade Banner */}
        {!canSave && (
          <Card className="mt-6 bg-gradient-to-r from-fintutto-primary to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Dokumente dauerhaft speichern</h3>
                  <p className="text-white/80">
                    Mit Basic oder Premium koennen Sie Ihre Dokumente in der Cloud speichern und von ueberall darauf zugreifen.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/preise')}>
                  Jetzt upgraden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
