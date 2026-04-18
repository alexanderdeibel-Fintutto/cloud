/**
 * Fintutto Activity Logger
 * Zentraler Hook für App-Aktivitätstracking via Supabase log_activity() Funktion.
 * Wird in alle Portal-Apps integriert.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction =
  | 'login'
  | 'logout'
  | 'signup'
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'search'
  | 'export'
  | 'import'
  | 'share'
  | 'error';

export type AppId =
  | 'ams'
  | 'vermietify'
  | 'pflanzen-manager'
  | 'bescheidboxer'
  | 'finance-coach'
  | 'finance-mentor'
  | 'fintutto-biz'
  | 'arbeitslos-portal'
  | 'secondbrain';

/**
 * Loggt eine Nutzeraktivität via Supabase RPC.
 * Fire-and-forget: Fehler werden still ignoriert um UX nicht zu beeinträchtigen.
 */
export async function logActivity(
  supabase: SupabaseClient,
  appId: AppId,
  action: ActivityAction,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.rpc('log_activity', {
      p_app_id: appId,
      p_action: action,
      p_entity_type: entityType ?? null,
      p_entity_id: entityId ?? null,
      p_metadata: metadata ?? null,
    });
  } catch {
    // Stille Fehlerbehandlung — Logging darf nie die App blockieren
  }
}

/**
 * React Hook für Activity Logging.
 * Gibt eine typsichere logActivity-Funktion zurück.
 */
export function createActivityLogger(supabase: SupabaseClient, appId: AppId) {
  return (
    action: ActivityAction,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
  ) => logActivity(supabase, appId, action, entityType, entityId, metadata);
}
