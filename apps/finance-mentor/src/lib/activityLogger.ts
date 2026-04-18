import { supabase } from '@/integrations/supabase/client';

/**
 * Loggt eine Nutzeraktivität via Supabase RPC log_activity().
 * Fire-and-forget: Fehler werden still ignoriert um UX nicht zu beeinträchtigen.
 */
export async function logActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.rpc('log_activity', {
      p_app_id: 'finance-mentor',
      p_action: action,
      p_entity_type: entityType ?? null,
      p_entity_id: entityId ?? null,
      p_metadata: metadata ?? null,
    });
  } catch {
    // Stille Fehlerbehandlung
  }
}
