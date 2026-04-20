-- ============================================================
-- Fintutto Datenbank-Domänen Dokumentation
-- Datum: 2026-04-19
-- ============================================================
-- Diese Migration enthält KEINE strukturellen Änderungen.
-- Sie dokumentiert die logische Aufteilung der 467 Tabellen
-- in drei Domänen und fügt Kommentare hinzu.
-- ============================================================

-- DOMÄNE 1: CORE (geteilt von Portal UND Translator)
-- Zugriff: Beide Repos
COMMENT ON TABLE user_profiles IS '[CORE] Zentrale Nutzerprofil-Tabelle für das gesamte Fintutto-Ökosystem';
COMMENT ON TABLE organizations IS '[CORE] Organisationen/Accounts – geteilt von Portal und Translator';
COMMENT ON TABLE products IS '[CORE] Produkte und Preise für das gesamte Ökosystem';
COMMENT ON TABLE invoices IS '[CORE] Rechnungen – geteilt von Portal und Translator';
COMMENT ON TABLE notifications IS '[CORE] Benachrichtigungen – geteilt von Portal und Translator';
COMMENT ON TABLE documents IS '[CORE] Dokumente – geteilt von Portal und Translator';
COMMENT ON TABLE apps_registry IS '[CORE] App-Registry für das gesamte Ökosystem';

-- DOMÄNE 2: PORTAL
-- Zugriff: NUR portal-Repo
COMMENT ON TABLE buildings IS '[PORTAL] Gebäude – nur für Vermietify/Portal';
COMMENT ON TABLE units IS '[PORTAL] Wohneinheiten – nur für Vermietify/Portal';
COMMENT ON TABLE letters IS '[PORTAL] Briefe – nur für Vermietify/Portal';
COMMENT ON TABLE handover_protocols IS '[PORTAL] Übergabeprotokolle – nur für Vermietify/Portal';
COMMENT ON TABLE maintenance_requests IS '[PORTAL] Wartungsanfragen – nur für Vermietify/Portal';
COMMENT ON TABLE insurance_policies IS '[PORTAL] Versicherungen – nur für Vermietify/Portal';
COMMENT ON TABLE utility_bills IS '[PORTAL] Betriebskostenabrechnungen – nur für Vermietify/Portal';
COMMENT ON TABLE financial_transactions IS '[PORTAL] Finanztransaktionen – nur für Vermietify/Portal';
COMMENT ON TABLE tax_declarations IS '[PORTAL] Steuererklärungen – nur für Vermietify/Portal';
COMMENT ON TABLE workflows IS '[PORTAL] Automatisierungen – nur für Portal';
COMMENT ON TABLE workflow_steps IS '[PORTAL] Automatisierungs-Schritte – nur für Portal';
COMMENT ON TABLE e_signatures IS '[PORTAL] E-Signaturen – nur für Vermietify/Portal';
COMMENT ON TABLE email_threads IS '[PORTAL] E-Mail-Threads – nur für Vermietify/Portal';
COMMENT ON TABLE whatsapp_messages IS '[PORTAL] WhatsApp-Nachrichten – nur für Vermietify/Portal';
COMMENT ON TABLE organization_members IS '[PORTAL] Organisations-Mitglieder – nur für Portal';
COMMENT ON TABLE property_listings IS '[PORTAL] Immobilieninserate – nur für Vermietify/Portal';

-- DOMÄNE 3: TRANSLATOR
-- Zugriff: NUR translator-Repo
COMMENT ON TABLE tr_sessions IS '[TRANSLATOR] Live-Übersetzungs-Sessions';
COMMENT ON TABLE tr_translations IS '[TRANSLATOR] Übersetzungen';
COMMENT ON TABLE gt_sessions IS '[TRANSLATOR] GuideTranslator Sessions';
COMMENT ON TABLE gt_organizations IS '[TRANSLATOR] GuideTranslator Organisationen';
COMMENT ON TABLE ag_museums IS '[TRANSLATOR] ArtGuide Museen';
COMMENT ON TABLE ag_tours IS '[TRANSLATOR] ArtGuide Touren';
COMMENT ON TABLE tf_fairs IS '[TRANSLATOR] TradeFair Messen';
COMMENT ON TABLE sc_sessions IS '[TRANSLATOR] ServiceCounter Sessions';
COMMENT ON TABLE cg_cities IS '[TRANSLATOR] CityGuide Städte';
COMMENT ON TABLE team_sessions IS '[TRANSLATOR] Team-Sessions';

-- ============================================================
-- Sicherheits-Kommentar
-- ============================================================
-- Alle 467 Tabellen haben RLS aktiviert (verifiziert 2026-04-19).
-- Alle Tabellen haben mindestens eine RLS-Policy.
-- Core-Tabellen: Nutzer sehen nur ihre eigenen Daten (auth.uid())
-- Portal-Tabellen: Nutzer sehen nur Daten ihrer Organisation (get_user_organization_id())
-- Translator-Tabellen: Nutzer sehen nur Daten ihrer gt_organization / ag_museum etc.
-- ============================================================

SELECT 'Domänen-Dokumentation erfolgreich angewendet' as status;
