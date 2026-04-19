-- Migration: user_activity_log app_id Kommentar aktualisieren
-- Ergänzt die 5 neu integrierten Apps (April 2026) im Kommentar der app_id-Spalte.

COMMENT ON COLUMN public.user_activity_log.app_id IS
  'App-Bezeichner: vermietify | ams | pflanzen-manager | secondbrain | finance-coach | finance-mentor | fintutto-biz | bescheidboxer | arbeitslos-portal | ablesung | translator | fintutto-portal | vermieter-portal';
