import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export interface WorkflowStep {
  step: number
  action: 'review' | 'categorize' | 'forward' | 'respond' | 'archive'
  label: string
  target_app?: string
}

export interface WorkflowTemplate {
  id: string
  user_id: string | null
  name: string
  description: string | null
  document_type: string | null
  steps: WorkflowStep[]
  is_active: boolean
  created_at: string
}

export interface DocumentLink {
  id: string
  user_id: string
  document_id: string
  target_app: string
  target_category: string | null
  link_type: string
  metadata: Record<string, unknown>
  linked_at: string
}

// Document types with German labels
export const DOCUMENT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  rechnung: { label: 'Rechnung', icon: 'receipt', color: '#ef4444' },
  brief: { label: 'Brief', icon: 'mail', color: '#3b82f6' },
  beleg: { label: 'Beleg', icon: 'ticket', color: '#10b981' },
  vertrag: { label: 'Vertrag', icon: 'file-signature', color: '#8b5cf6' },
  bescheid: { label: 'Bescheid', icon: 'stamp', color: '#f59e0b' },
  mahnung: { label: 'Mahnung', icon: 'alert-triangle', color: '#dc2626' },
  quittung: { label: 'Quittung', icon: 'check-circle', color: '#22c55e' },
  angebot: { label: 'Angebot', icon: 'tag', color: '#06b6d4' },
  kuendigung: { label: 'Kündigung', icon: 'x-circle', color: '#e11d48' },
  kontoauszug: { label: 'Kontoauszug', icon: 'landmark', color: '#6366f1' },
  steuerbescheid: { label: 'Steuerbescheid', icon: 'calculator', color: '#d97706' },
  versicherung: { label: 'Versicherung', icon: 'shield', color: '#0ea5e9' },
  lohnabrechnung: { label: 'Lohnabrechnung', icon: 'banknote', color: '#84cc16' },
  mietvertrag: { label: 'Mietvertrag', icon: 'home', color: '#a855f7' },
  other: { label: 'Sonstiges', icon: 'file', color: '#6b7280' },
}

// Document status labels
export const DOCUMENT_STATUS: Record<string, { label: string; color: string }> = {
  inbox: { label: 'Eingang', color: '#3b82f6' },
  processing: { label: 'In Bearbeitung', color: '#f59e0b' },
  reviewed: { label: 'Geprüft', color: '#10b981' },
  action_required: { label: 'Aktion erforderlich', color: '#ef4444' },
  done: { label: 'Erledigt', color: '#22c55e' },
  archived: { label: 'Archiviert', color: '#6b7280' },
}

// Target apps for routing (with real URLs for cross-app navigation)
export const TARGET_APPS: Record<string, { label: string; description: string; color: string; url: string; icon: string }> = {
  'fintutto-portal': { label: 'FinTutto Portal', description: 'Rechner, Checker & Formulare', color: '#6366f1', url: 'https://portal.fintutto.de', icon: '🧮' },
  'financial-compass': { label: 'Financial Compass', description: 'Finanzubersicht & Buchhaltung', color: '#3b82f6', url: 'https://compass.fintutto.de', icon: '🧭' },
  'bescheidboxer': { label: 'BescheidBoxer', description: 'Bescheide & Widerspruche', color: '#f59e0b', url: 'https://bescheidboxer.fintutto.de', icon: '📋' },
  'fintutto-biz': { label: 'Fintutto Biz', description: 'Freelancer Finance OS', color: '#10b981', url: 'https://biz.fintutto.de', icon: '💼' },
  'vermietify': { label: 'Vermietify', description: 'Immobilienverwaltung', color: '#8b5cf6', url: 'https://vermietify.fintutto.de', icon: '🏠' },
  'vermieter-portal': { label: 'Vermieter Portal', description: 'Vermieter-Rechner & Tools', color: '#a855f7', url: 'https://vermieter.fintutto.de', icon: '🏢' },
}

export function useWorkflowTemplates(documentType?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['workflow-templates', documentType],
    queryFn: async () => {
      let query = supabase
        .from('sb_workflow_templates')
        .select('*')
        .eq('is_active', true)
        .or(`user_id.eq.${user!.id},user_id.is.null`)

      if (documentType) {
        query = query.or(`document_type.eq.${documentType},document_type.is.null`)
      }

      const { data, error } = await query.order('name')
      if (error) throw error
      return data as WorkflowTemplate[]
    },
    enabled: !!user,
  })
}

export function useDocumentLinks(documentId?: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['document-links', documentId],
    queryFn: async () => {
      let query = supabase
        .from('sb_document_links')
        .select('*')
        .eq('user_id', user!.id)
        .order('linked_at', { ascending: false })

      if (documentId) {
        query = query.eq('document_id', documentId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as DocumentLink[]
    },
    enabled: !!user,
  })
}

export function useCreateDocumentLink() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (link: {
      document_id: string
      target_app: string
      target_category?: string
      link_type?: string
      metadata?: Record<string, unknown>
    }) => {
      const { data, error } = await supabase
        .from('sb_document_links')
        .insert({ ...link, user_id: user!.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-links', variables.document_id] })
      const app = TARGET_APPS[variables.target_app]
      toast.success(`An ${app?.label || variables.target_app} weitergeleitet`)
    },
    onError: () => toast.error('Fehler beim Weiterleiten'),
  })
}

export function useDeleteDocumentLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sb_document_links')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-links'] })
    },
  })
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      documentId,
      status,
      workflowStatus,
    }: {
      documentId: string
      status?: string
      workflowStatus?: string
    }) => {
      const updates: Record<string, string> = {}
      if (status) updates.status = status
      if (workflowStatus) updates.workflow_status = workflowStatus

      const { error } = await supabase
        .from('sb_documents')
        .update(updates)
        .eq('id', documentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useUpdateDocumentMeta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      documentId,
      ...updates
    }: {
      documentId: string
      document_type?: string
      priority?: string
      sender?: string
      receiver?: string
      document_date?: string
      amount?: number
      currency?: string
      reference_number?: string
      notes?: string
      company_id?: string | null
    }) => {
      const { error } = await supabase
        .from('sb_documents')
        .update(updates)
        .eq('id', documentId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
