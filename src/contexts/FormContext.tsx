import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '@/integrations/supabase'
import { useAuth } from './AuthContext'
import { getFormTemplate } from '@/lib/formTemplates'

// Types
export interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'currency' | 'select' | 'checkbox' | 'signature' | 'address'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  helpText?: string
  section?: string
}

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  fields: FormField[]
  legalText: string
  outputFormat: 'letter' | 'form' | 'protocol'
}

export interface FormDraft {
  id: string
  formTemplateId: string
  userId?: string
  data: Record<string, unknown>
  lastModified: string
  isAutoSave: boolean
}

export interface FormVersion {
  id: string
  formDraftId: string
  versionNumber: number
  data: Record<string, unknown>
  pdfUrl?: string
  createdAt: string
  status: 'draft' | 'printed' | 'sent' | 'signed'
  sentTo?: string
  signedAt?: string
  signatureData?: string
}

export interface FormDocument {
  id: string
  formTemplateId: string
  userId?: string
  title: string
  currentData: Record<string, unknown>
  versions: FormVersion[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'finalized'
}

interface FormContextType {
  // Current form state
  currentDocument: FormDocument | null
  currentDraft: FormDraft | null
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean

  // Actions
  createNewDocument: (templateId: string, prefilledData?: Record<string, unknown>) => Promise<string>
  loadDocument: (documentId: string) => Promise<void>
  updateFormData: (data: Record<string, unknown>) => void
  saveDocument: () => Promise<void>
  saveDraft: () => Promise<void>

  // Versioning
  createVersion: (status: 'printed' | 'sent' | 'signed') => Promise<FormVersion>
  getVersionHistory: (documentId: string) => Promise<FormVersion[]>
  loadVersion: (versionId: string) => Promise<void>
  compareVersions: (v1Id: string, v2Id: string) => Promise<{ field: string; v1: unknown; v2: unknown }[]>

  // PDF & Email
  generatePDF: () => Promise<string>
  sendEmail: (to: string, subject: string, message: string) => Promise<void>

  // Signature
  addSignature: (signatureData: string) => void

  // User documents
  getUserDocuments: () => Promise<FormDocument[]>
  deleteDocument: (documentId: string) => Promise<void>

  // Templates
  getTemplate: (templateId: string) => FormTemplate | null
}

const FormContext = createContext<FormContextType | undefined>(undefined)

// Local storage keys
const DRAFT_STORAGE_KEY = 'fintutto_form_drafts'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

// Helper to get drafts from localStorage
function getLocalDrafts(): Record<string, FormDraft> {
  try {
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveLocalDraft(draft: FormDraft): void {
  const drafts = getLocalDrafts()
  drafts[draft.formTemplateId] = draft
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
}

function deleteLocalDraft(templateId: string): void {
  const drafts = getLocalDrafts()
  delete drafts[templateId]
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
}

export function FormProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [currentDocument, setCurrentDocument] = useState<FormDocument | null>(null)
  const [currentDraft, setCurrentDraft] = useState<FormDraft | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || !currentDraft) return

    const timer = setTimeout(() => {
      saveDraftInternal()
    }, AUTO_SAVE_INTERVAL)

    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, formData])

  // Check if user can save to cloud
  const canSaveToCloud = useCallback(() => {
    return profile && (profile.tier === 'basic' || profile.tier === 'premium')
  }, [profile])

  // Internal save draft function
  const saveDraftInternal = useCallback(async () => {
    if (!currentDraft) return

    const updatedDraft: FormDraft = {
      ...currentDraft,
      data: formData,
      lastModified: new Date().toISOString(),
      isAutoSave: true,
    }

    // Always save to localStorage
    saveLocalDraft(updatedDraft)

    // Save to Supabase if user can save to cloud
    if (canSaveToCloud() && profile) {
      try {
        await supabase.from('form_drafts').upsert({
          id: updatedDraft.id,
          form_template_id: updatedDraft.formTemplateId,
          user_id: profile.id,
          data: updatedDraft.data,
          last_modified: updatedDraft.lastModified,
          is_auto_save: true,
        })
      } catch (error) {
        console.error('Error saving draft to cloud:', error)
      }
    }

    setCurrentDraft(updatedDraft)
    setHasUnsavedChanges(false)
  }, [currentDraft, formData, canSaveToCloud, profile])

  // Create new document
  const createNewDocument = async (templateId: string, prefilledData?: Record<string, unknown>): Promise<string> => {
    setIsLoading(true)

    try {
      const documentId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Check for existing draft
      const localDrafts = getLocalDrafts()
      const existingDraft = localDrafts[templateId]

      let initialData = prefilledData || {}

      // If there's an existing draft, ask user or use it
      if (existingDraft && Object.keys(existingDraft.data).length > 0) {
        initialData = { ...existingDraft.data, ...prefilledData }
      }

      const newDocument: FormDocument = {
        id: documentId,
        formTemplateId: templateId,
        userId: profile?.id,
        title: `Dokument ${new Date().toLocaleDateString('de-DE')}`,
        currentData: initialData,
        versions: [],
        createdAt: now,
        updatedAt: now,
        status: 'draft',
      }

      const newDraft: FormDraft = {
        id: crypto.randomUUID(),
        formTemplateId: templateId,
        userId: profile?.id,
        data: initialData,
        lastModified: now,
        isAutoSave: false,
      }

      setCurrentDocument(newDocument)
      setCurrentDraft(newDraft)
      setFormData(initialData)
      setHasUnsavedChanges(false)

      return documentId
    } finally {
      setIsLoading(false)
    }
  }

  // Load existing document
  const loadDocument = async (documentId: string): Promise<void> => {
    setIsLoading(true)

    try {
      if (canSaveToCloud() && profile) {
        const { data, error } = await supabase
          .from('form_documents')
          .select('*, form_versions(*)')
          .eq('id', documentId)
          .single()

        if (error) throw error

        const document: FormDocument = {
          id: data.id,
          formTemplateId: data.form_template_id,
          userId: data.user_id,
          title: data.title,
          currentData: data.current_data,
          versions: data.form_versions?.map((v: Record<string, unknown>) => ({
            id: v.id,
            formDraftId: v.form_draft_id,
            versionNumber: v.version_number,
            data: v.data,
            pdfUrl: v.pdf_url,
            createdAt: v.created_at,
            status: v.status,
            sentTo: v.sent_to,
            signedAt: v.signed_at,
            signatureData: v.signature_data,
          })) || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          status: data.status,
        }

        setCurrentDocument(document)
        setFormData(document.currentData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Update form data
  const updateFormData = (data: Record<string, unknown>) => {
    setFormData(prev => ({ ...prev, ...data }))
    setHasUnsavedChanges(true)
  }

  // Save document (for premium users)
  const saveDocument = async (): Promise<void> => {
    if (!currentDocument || !canSaveToCloud() || !profile) {
      throw new Error('Cannot save: No document or insufficient tier')
    }

    setIsSaving(true)

    try {
      const updatedDocument = {
        ...currentDocument,
        currentData: formData,
        updatedAt: new Date().toISOString(),
      }

      await supabase.from('form_documents').upsert({
        id: updatedDocument.id,
        form_template_id: updatedDocument.formTemplateId,
        user_id: profile.id,
        title: updatedDocument.title,
        current_data: updatedDocument.currentData,
        status: updatedDocument.status,
        updated_at: updatedDocument.updatedAt,
      })

      setCurrentDocument(updatedDocument)
      setHasUnsavedChanges(false)

      // Clear local draft since we saved to cloud
      deleteLocalDraft(updatedDocument.formTemplateId)
    } finally {
      setIsSaving(false)
    }
  }

  // Save draft (for all users via localStorage, cloud for premium)
  const saveDraft = async (): Promise<void> => {
    await saveDraftInternal()
  }

  // Create a new version (when printing, sending, or signing)
  const createVersion = async (status: 'printed' | 'sent' | 'signed'): Promise<FormVersion> => {
    if (!currentDocument) {
      throw new Error('No document to version')
    }

    const versionNumber = (currentDocument.versions?.length || 0) + 1
    const now = new Date().toISOString()

    const newVersion: FormVersion = {
      id: crypto.randomUUID(),
      formDraftId: currentDraft?.id || '',
      versionNumber,
      data: { ...formData },
      createdAt: now,
      status,
    }

    // Save to Supabase if user can save to cloud
    if (canSaveToCloud() && profile) {
      await supabase.from('form_versions').insert({
        id: newVersion.id,
        form_document_id: currentDocument.id,
        version_number: versionNumber,
        data: newVersion.data,
        status: newVersion.status,
        created_at: now,
      })
    }

    // Update local document
    const updatedDocument = {
      ...currentDocument,
      versions: [...(currentDocument.versions || []), newVersion],
      updatedAt: now,
    }
    setCurrentDocument(updatedDocument)

    // Also save to localStorage for non-premium users
    const localVersions = JSON.parse(localStorage.getItem('fintutto_form_versions') || '{}')
    if (!localVersions[currentDocument.id]) {
      localVersions[currentDocument.id] = []
    }
    localVersions[currentDocument.id].push(newVersion)
    localStorage.setItem('fintutto_form_versions', JSON.stringify(localVersions))

    return newVersion
  }

  // Get version history
  const getVersionHistory = async (documentId: string): Promise<FormVersion[]> => {
    // First check localStorage
    const localVersions = JSON.parse(localStorage.getItem('fintutto_form_versions') || '{}')
    const local = localVersions[documentId] || []

    // If user can access cloud, get from Supabase too
    if (canSaveToCloud() && profile) {
      const { data } = await supabase
        .from('form_versions')
        .select('*')
        .eq('form_document_id', documentId)
        .order('version_number', { ascending: false })

      if (data) {
        return data.map(v => ({
          id: v.id,
          formDraftId: v.form_draft_id,
          versionNumber: v.version_number,
          data: v.data,
          pdfUrl: v.pdf_url,
          createdAt: v.created_at,
          status: v.status,
          sentTo: v.sent_to,
          signedAt: v.signed_at,
          signatureData: v.signature_data,
        }))
      }
    }

    return local
  }

  // Load a specific version
  const loadVersion = async (versionId: string): Promise<void> => {
    const versions = currentDocument ? await getVersionHistory(currentDocument.id) : []
    const version = versions.find(v => v.id === versionId)

    if (version) {
      setFormData(version.data as Record<string, unknown>)
    }
  }

  // Compare two versions
  const compareVersions = async (v1Id: string, v2Id: string): Promise<{ field: string; v1: unknown; v2: unknown }[]> => {
    const versions = currentDocument ? await getVersionHistory(currentDocument.id) : []
    const v1 = versions.find(v => v.id === v1Id)
    const v2 = versions.find(v => v.id === v2Id)

    if (!v1 || !v2) return []

    const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)])
    const differences: { field: string; v1: unknown; v2: unknown }[] = []

    allKeys.forEach(key => {
      const val1 = (v1.data as Record<string, unknown>)[key]
      const val2 = (v2.data as Record<string, unknown>)[key]
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences.push({ field: key, v1: val1, v2: val2 })
      }
    })

    return differences
  }

  // Generate PDF
  const generatePDF = async (): Promise<string> => {
    if (!currentDocument) {
      throw new Error('No document to generate PDF for')
    }

    // Create a version first
    const version = await createVersion('printed')

    // Get template name
    const template = getFormTemplate(currentDocument.formTemplateId)
    const templateName = template?.name || 'Rechtsdokument'

    // Build PDF URL with form data
    const params = new URLSearchParams({
      documentId: currentDocument.id,
      versionId: version.id,
      data: JSON.stringify(formData),
      templateName,
    })

    const pdfUrl = `/api/generate-pdf?${params.toString()}`

    // Trigger download
    window.open(pdfUrl, '_blank')

    return pdfUrl
  }

  // Send email
  const sendEmail = async (to: string, subject: string, message: string): Promise<void> => {
    if (!currentDocument) return

    const version = await createVersion('sent')

    // Update version with recipient
    if (canSaveToCloud() && profile) {
      await supabase
        .from('form_versions')
        .update({ sent_to: to })
        .eq('id', version.id)
    }

    // Call email API
    await fetch('/api/send-form-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        message,
        documentId: currentDocument.id,
        versionId: version.id,
      }),
    })
  }

  // Add signature
  const addSignature = (signatureData: string) => {
    setFormData(prev => ({ ...prev, signature: signatureData, signedAt: new Date().toISOString() }))
    setHasUnsavedChanges(true)
  }

  // Get user's documents
  const getUserDocuments = async (): Promise<FormDocument[]> => {
    if (!canSaveToCloud() || !profile) {
      // Return documents from localStorage for free users
      const localVersions = JSON.parse(localStorage.getItem('fintutto_form_versions') || '{}')
      return Object.keys(localVersions).map(id => ({
        id,
        formTemplateId: '',
        title: 'Lokales Dokument',
        currentData: {},
        versions: localVersions[id],
        createdAt: localVersions[id][0]?.createdAt || '',
        updatedAt: localVersions[id][localVersions[id].length - 1]?.createdAt || '',
        status: 'draft' as const,
      }))
    }

    const { data } = await supabase
      .from('form_documents')
      .select('*, form_versions(count)')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false })

    if (!data) return []

    return data.map(d => ({
      id: d.id,
      formTemplateId: d.form_template_id,
      userId: d.user_id,
      title: d.title,
      currentData: d.current_data,
      versions: [],
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      status: d.status,
    }))
  }

  // Delete document
  const deleteDocument = async (documentId: string): Promise<void> => {
    if (canSaveToCloud() && profile) {
      await supabase.from('form_documents').delete().eq('id', documentId)
    }

    // Also remove from localStorage
    const localVersions = JSON.parse(localStorage.getItem('fintutto_form_versions') || '{}')
    delete localVersions[documentId]
    localStorage.setItem('fintutto_form_versions', JSON.stringify(localVersions))
  }

  // Get template by ID
  const getTemplate = (templateId: string): FormTemplate | null => {
    return getFormTemplate(templateId)
  }

  return (
    <FormContext.Provider
      value={{
        currentDocument,
        currentDraft,
        isLoading,
        isSaving,
        hasUnsavedChanges,
        createNewDocument,
        loadDocument,
        updateFormData,
        saveDocument,
        saveDraft,
        createVersion,
        getVersionHistory,
        loadVersion,
        compareVersions,
        generatePDF,
        sendEmail,
        addSignature,
        getUserDocuments,
        deleteDocument,
        getTemplate,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}
