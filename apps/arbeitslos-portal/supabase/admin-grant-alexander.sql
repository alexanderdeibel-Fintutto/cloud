-- =============================================================================
-- ADMIN GRANT für alexander@fintutto.de
-- =============================================================================
-- Dieses SQL gibt deinem Account Vollschutz (höchstes Tier) mit unbegrenzten
-- Credits und reset aller Verbrauchszähler. Im Supabase Dashboard ausführen:
-- https://supabase.com/dashboard/project/aaefocqdgdgexkcrjhks/sql/new
-- =============================================================================

-- Schritt 1: Account auf Vollschutz upgraden, alle Limits resetten, 999.999 Credits geben
UPDATE amt_users
SET
  plan = 'vollschutz',
  credits_current = 999999,
  chat_messages_used_today = 0,
  letters_generated_this_month = 0,
  scans_this_month = 0,
  period_start = NOW(),
  period_end = NOW() + INTERVAL '10 years',
  updated_at = NOW()
WHERE email = 'alexander@fintutto.de';

-- Schritt 2: Transaktion fürs Audit-Log eintragen
INSERT INTO amt_credit_transactions (user_id, amount, type, description, balance_after)
SELECT id, 999999, 'bonus', 'Admin-Account: unlimited credits', 999999
FROM amt_users
WHERE email = 'alexander@fintutto.de';

-- Schritt 3: Verifizieren - sollte plan='vollschutz' und credits_current=999999 zeigen
SELECT
  email,
  plan,
  credits_current,
  chat_messages_used_today,
  letters_generated_this_month,
  scans_this_month,
  period_end
FROM amt_users
WHERE email = 'alexander@fintutto.de';

-- =============================================================================
-- FALLS DER ACCOUNT NOCH NICHT EXISTIERT:
-- =============================================================================
-- Erstelle ihn zuerst über das Supabase Dashboard:
--   Authentication → Users → "Add user" → "Create new user"
--   Email: alexander@fintutto.de
--   Password: Ask4menow
--   "Auto Confirm User" anhaken
--
-- Dann diese Insert-Query laufen lassen, um den Profile-Eintrag zu erstellen:
--
-- INSERT INTO amt_users (auth_id, email, name, plan, credits_current,
--                        period_start, period_end)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'alexander@fintutto.de'),
--   'alexander@fintutto.de',
--   'Alexander Deibel',
--   'vollschutz',
--   999999,
--   NOW(),
--   NOW() + INTERVAL '10 years'
-- );
-- =============================================================================
