/**
 * Fintutto Supabase Domain Separation
 * =====================================
 * Alle 467 Tabellen in der gemeinsamen Supabase-Datenbank sind logisch
 * in drei Domänen aufgeteilt. Dieser Wrapper macht diese Trennung im Code
 * explizit und verhindert, dass Portal-Code versehentlich Translator-Tabellen
 * schreibt und umgekehrt.
 *
 * WICHTIG: Alle drei Domänen nutzen dieselbe Supabase-Instanz.
 * Die Trennung ist logisch (durch Tabellenpräfixe und RLS), nicht physisch.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// DOMÄNE 1: CORE (geteilt von Portal UND Translator)
// ============================================================
// Tabellen: user_profiles, organizations, subscriptions, invoices,
//           ai_*, analytics_*, apps_registry, blog_posts, documents,
//           notifications, products, roles, audit_log, ...
// Zugriff: Beide Repos dürfen diese Tabellen lesen/schreiben
// ============================================================

// ============================================================
// DOMÄNE 2: PORTAL
// ============================================================
// Tabellenpräfixe: buildings, units, leases, letters, biz_,
//                  sb_, pm_, learn_, finance_, operating_cost_,
//                  tenant_, mieter_, mietrecht_, bescheid*, ...
// Zugriff: NUR das Portal-Repo
// ============================================================

// ============================================================
// DOMÄNE 3: TRANSLATOR
// ============================================================
// Tabellenpräfixe: tr_, tf_, sc_, ag_, ar_, cg_, gt_, mg_,
//                  listener_, team_session*, seat_*
// Zugriff: NUR das Translator-Repo
// ============================================================

/**
 * Erstellt einen Supabase-Client für Portal-Apps.
 * Dieser Client hat Zugriff auf Core- und Portal-Tabellen.
 * Er sollte NICHT für Translator-Tabellen verwendet werden.
 */
export function createPortalClient(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      '[Fintutto Portal] Fehlende Supabase-Umgebungsvariablen. ' +
      'Stelle sicher, dass VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY gesetzt sind.'
    )
  }
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
      headers: { 'x-fintutto-domain': 'portal' },
    },
  })
}

/**
 * Erstellt einen Supabase-Client für Translator-Apps.
 * Dieser Client hat Zugriff auf Core- und Translator-Tabellen.
 * Er sollte NICHT für Portal-Tabellen verwendet werden.
 */
export function createTranslatorClient(url: string, anonKey: string): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      '[Fintutto Translator] Fehlende Supabase-Umgebungsvariablen. ' +
      'Stelle sicher, dass VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY gesetzt sind.'
    )
  }
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: {
      headers: { 'x-fintutto-domain': 'translator' },
    },
  })
}

// ============================================================
// TABELLEN-INVENTAR (als Dokumentation und für Type-Safety)
// ============================================================

/** Alle Portal-spezifischen Tabellen (nur diese sollte Portal-Code nutzen) */
export const PORTAL_TABLES = [
  // Vermietify / Immobilien
  'buildings', 'units', 'leases', 'lease_contracts', 'lease_rent_settings',
  'letters', 'letter_orders', 'handover_protocols', 'digital_handovers',
  'inspection_protocols', 'inventory', 'inventar',
  'maintenance_requests', 'material_entries', 'task_photos',
  'insurance_policies', 'utility_bills', 'operating_costs',
  'operating_cost_billings', 'operating_cost_items', 'operating_cost_results',
  'operating_cost_statements', 'operating_cost_tenant_results', 'operating_cost_versions',
  'financial_transactions', 'bank_accounts', 'bank_transactions',
  'property_listings', 'immoscout_oauth', 'schufa_orders',
  'tenant_screening_reports', 'tenant_unit_access', 'tenant_billing_results',
  'mieter_buildings', 'mieter_building_members',
  'mietpreisbremse_gebiete', 'mietpreisbremse_docs', 'mietrecht_chats',
  'indexmiete_anpassungen', 'rent_adjustments', 'vorvermieterbescheinigungen',
  'vpi_cache', 'vpi_index', 'kassenbuch', 'lohnabrechnung',
  'meters', 'meter_readings', 'meter_types_registry', 'zaehler_app_licenses',
  'energy_providers', 'caretaker_absences', 'caretaker_availability',
  'winter_service_logs', 'white_label_tenants', 'white_label_units', 'white_label_unit_tenants',
  'e_signatures', 'esignature_orders', 'email_threads', 'whatsapp_messages',
  'workflows', 'workflow_steps', 'organization_members',
  'tax_declarations', 'tax_documents', 'tax_advisor_accesses', 'tax_advisor_shared_documents',
  'finapi_connections', 'finapi_users',
  'fristen', 'einsprueche', 'bescheide', 'bescheid_dokumente',
  'vertraege', 'generated_documents', 'document_templates',
  // Biz / Financial Compass
  'biz_businesses', 'biz_user_businesses', 'biz_clients', 'biz_expenses',
  'biz_invoices', 'biz_tax_reports', 'biz_time_entries', 'biz_cashflow_forecasts',
  'finance_accounts', 'finance_transactions', 'finance_budgets', 'finance_goals',
  'finance_ai_insights', 'direct_costs', 'projekte',
  // SecondBrain
  'sb_documents', 'sb_collections', 'sb_chat_sessions', 'sb_chat_messages',
  'sb_activity_log', 'sb_document_collections', 'sb_document_entity_links',
  'sb_document_suggestions', 'sb_email_scan_log',
  // Pflanzen-Manager
  'pm_user_plants', 'pm_plant_species', 'pm_care_events', 'pm_rooms',
  'pm_apartments', 'pm_shopping_items', 'pm_vacation_plans', 'pm_vacation_tasks', 'pm_vacation_helpers',
  // LernApp
  'learn_courses', 'learn_lessons', 'learn_progress', 'learn_certificates',
  // AMS / Bescheidboxer
  'ams_tenders',
] as const

/** Alle Translator-spezifischen Tabellen (nur diese sollte Translator-Code nutzen) */
export const TRANSLATOR_TABLES = [
  // Core Translator
  'tr_sessions', 'tr_translations',
  // Trade Fair Translator
  'tf_fairs', 'tf_exhibitors', 'tf_leads', 'tf_staff_assignments',
  'tf_booth_sessions', 'tf_exhibitor_checkouts', 'tf_exhibitor_upgrades',
  'tf_stripe_events', 'tf_upsell_products',
  // Service Counter
  'sc_sessions', 'sc_phrase_sets', 'sc_phrases', 'sc_counters',
  'sc_staff_assignments', 'sc_guest_feedback', 'sc_usage_stats',
  // Team Sessions
  'team_sessions', 'team_session_members', 'team_phrases',
  'seat_allocations', 'listener_portal_config', 'listener_portal_sessions',
  // ArtGuide
  'ag_museums', 'ag_museum_users', 'ag_museum_owners', 'ag_museum_roles',
  'ag_museum_invites', 'ag_artworks', 'ag_artwork_media', 'ag_artwork_history',
  'ag_tours', 'ag_tour_stops', 'ag_tour_transcripts', 'ag_transcript_segments',
  'ag_rooms', 'ag_floors', 'ag_venues', 'ag_categories',
  'ag_visitors', 'ag_visits', 'ag_visitor_events', 'ag_visitor_progress',
  'ag_badges', 'ag_quests', 'ag_quest_completions', 'ag_scavenger_hunts', 'ag_hunt_items',
  'ag_beacons', 'ag_gps_zones', 'ag_wifi_fingerprints', 'ag_positioning_config',
  'ag_favorites', 'ag_ai_chats', 'ag_ai_queue', 'ag_ai_tour_suggestions',
  'ag_analytics_events', 'ag_analytics_daily', 'ag_guide_usage_logs',
  'ag_access_codes', 'ag_content_hub', 'ag_content_versions', 'ag_media_library',
  'ag_import_jobs', 'ag_import_items', 'ag_import_templates',
  'ag_audit_log', 'ag_workflow_transitions', 'ag_artguide_invites',
  'ag_personalized_tours', 'museum_floor_plans',
  // CityGuide
  'cg_cities', 'cg_regions', 'cg_region_cities', 'cg_partners', 'cg_partner_users',
  'cg_partner_leads', 'cg_partner_lead_notes', 'cg_pois', 'cg_poi_categories',
  'cg_tours', 'cg_tour_stops', 'cg_offers', 'cg_bookings', 'cg_reviews',
  'cg_staff', 'cg_invite_campaigns',
  // GuideTranslator
  'gt_organizations', 'gt_org_invites', 'gt_users', 'gt_user_metadata',
  'gt_sessions', 'gt_session_managers', 'gt_session_participants',
  'gt_event_sessions', 'gt_leads', 'gt_lead_notes', 'gt_contact_requests',
  'gt_usage', 'gt_usage_logs', 'gt_calculations', 'gt_pre_translations',
  'gt_tiers', 'gt_stripe_events',
  // AR
  'ar_analytics',
] as const

/** Core-Tabellen (geteilt von Portal und Translator) */
export const CORE_TABLES = [
  'user_profiles', 'profiles', 'organizations', 'org_memberships',
  'subscriptions', 'user_subscriptions', 'invoices', 'products', 'product_bundles',
  'user_credits', 'user_purchases', 'one_time_purchases',
  'notifications', 'documents', 'tasks', 'contacts', 'messages',
  'ai_conversations', 'ai_usage_logs', 'ai_system_prompts', 'ai_personas',
  'ai_app_knowledge', 'ai_models_config', 'ai_tier_model_mapping',
  'ai_feature_gates', 'ai_cross_sell_triggers', 'ai_rate_limits', 'ai_advice_cache',
  'analytics_events', 'analytics_pageviews', 'analytics_daily', 'analytics_daily_stats',
  'analytics_errors', 'analytics_web_vitals', 'analytics_api_keys',
  'apps_registry', 'fintutto_apps', 'ecosystem_apps', 'services_registry', 'tools_registry',
  'blog_posts', 'landing_pages', 'newsletter_subscribers',
  'audit_log', 'audit_logs', 'admin_logs', 'error_logs',
  'api_keys', 'api_status_log', 'webhook_logs',
  'roles', 'permissions', 'app_access', 'app_invitations', 'invitations',
  'referrals', 'feedback', 'support_tickets',
  'calculator_apps', 'personas',
] as const

export type PortalTable = typeof PORTAL_TABLES[number]
export type TranslatorTable = typeof TRANSLATOR_TABLES[number]
export type CoreTable = typeof CORE_TABLES[number]
