/**
 * @fintutto/shared — useWorkspace
 *
 * Universeller Workspace-Hook für alle Fintutto-Apps.
 *
 * Löst das Multi-Tenancy-Problem transparent:
 * - Financial Compass: Workspace = "company" (Firma/GmbH/Freelance)
 * - Vermietify: Workspace = "organization" (Vermieter-Account)
 *
 * Beide Apps nutzen den gleichen Hook, aber mit unterschiedlichem contextType.
 */
import { useState, useEffect, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

export type WorkspaceContextType = 'company' | 'organization'

export interface Workspace {
  id: string
  name: string
  type: WorkspaceContextType
  /** Steuerliche Identifikation (für Financial Compass) */
  tax_id?: string | null
  /** Rechtsform (GmbH, GbR, Einzelunternehmen, etc.) */
  legal_form?: string | null
  /** Logo-URL */
  logo_url?: string | null
  /** Primäre Farbe für Branding */
  primary_color?: string | null
  /** Erstellt am */
  created_at: string
}

export interface UseWorkspaceOptions {
  supabase: SupabaseClient
  contextType: WorkspaceContextType
  /** Tabellen-Name in Supabase (default: contextType + 's') */
  tableName?: string
  /** Storage-Key für den aktiven Workspace (localStorage) */
  storageKey?: string
}

export function useWorkspace({
  supabase,
  contextType,
  tableName,
  storageKey,
}: UseWorkspaceOptions) {
  const table = tableName ?? (contextType === 'company' ? 'companies' : 'organizations')
  const lsKey = storageKey ?? `fintutto_active_${contextType}`

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from(table)
      .select('id, name, tax_id, legal_form, logo_url, primary_color, created_at')
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const mapped: Workspace[] = (data ?? []).map((row: any) => ({
      ...row,
      type: contextType,
    }))

    setWorkspaces(mapped)

    // Aktiven Workspace aus localStorage wiederherstellen
    const savedId = localStorage.getItem(lsKey)
    const saved = mapped.find(w => w.id === savedId)

    if (saved) {
      setActiveWorkspaceState(saved)
    } else if (mapped.length > 0) {
      setActiveWorkspaceState(mapped[0])
      localStorage.setItem(lsKey, mapped[0].id)
    }

    setLoading(false)
  }, [supabase, table, contextType, lsKey])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceState(workspace)
    localStorage.setItem(lsKey, workspace.id)
  }, [lsKey])

  const createWorkspace = useCallback(async (data: { name: string; legal_form?: string; tax_id?: string }) => {
    const { data: created, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) throw error

    const newWorkspace: Workspace = { ...created, type: contextType }
    setWorkspaces(prev => [...prev, newWorkspace])
    setActiveWorkspace(newWorkspace)
    return newWorkspace
  }, [supabase, table, contextType, setActiveWorkspace])

  const updateWorkspace = useCallback(async (id: string, updates: Partial<Workspace>) => {
    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', id)

    if (error) throw error

    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
    if (activeWorkspace?.id === id) {
      setActiveWorkspaceState(prev => prev ? { ...prev, ...updates } : prev)
    }
  }, [supabase, table, activeWorkspace])

  return {
    workspaces,
    activeWorkspace,
    loading,
    error,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    refetch: fetchWorkspaces,
  }
}
