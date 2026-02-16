#!/bin/bash
# ============================================================
# Fintutto Portal — Monetarisierung: Supabase Migration
# ============================================================
#
# Dieses Script führt die Monetarisierungs-Tabellen in eure
# Supabase-Datenbank ein. Es gibt 3 Wege:
#
# === Weg 1: Supabase Dashboard (empfohlen, kein CLI nötig) ===
#
#   1. Öffne https://supabase.com/dashboard
#   2. Wähle Projekt "aaefocdqgdgexkcrjhks"
#   3. Gehe zu "SQL Editor" (linke Sidebar)
#   4. Klicke "New Query"
#   5. Kopiere den Inhalt von:
#      supabase/migrations/004_add_monetization_tables.sql
#   6. Klicke "Run"
#   7. Fertig!
#
# === Weg 2: Supabase CLI ===
#
#   npx supabase db push --db-url "postgresql://postgres:PASSWORD@db.aaefocdqgdgexkcrjhks.supabase.co:5432/postgres"
#
# === Weg 3: Dieses Script (braucht psql + DB-Passwort) ===
#
#   SUPABASE_DB_PASSWORD="dein_passwort" ./scripts/run-migration.sh
#
# ============================================================

set -e

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "❌ Bitte SUPABASE_DB_PASSWORD setzen:"
  echo "   SUPABASE_DB_PASSWORD='dein_passwort' ./scripts/run-migration.sh"
  echo ""
  echo "💡 Tipp: Das DB-Passwort findest du unter:"
  echo "   Supabase Dashboard → Project Settings → Database → Connection string"
  echo ""
  echo "📋 Oder kopiere den SQL direkt in den Supabase SQL Editor:"
  echo "   supabase/migrations/004_add_monetization_tables.sql"
  exit 1
fi

DB_HOST="db.aaefocdqgdgexkcrjhks.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

MIGRATION_FILE="supabase/migrations/004_add_monetization_tables.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration-Datei nicht gefunden: $MIGRATION_FILE"
  echo "   Bitte aus dem Portal-Verzeichnis ausführen."
  exit 1
fi

echo "🚀 Führe Monetarisierungs-Migration aus..."
echo "   Host: $DB_HOST"
echo "   Datei: $MIGRATION_FILE"
echo ""

PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$MIGRATION_FILE"

echo ""
echo "✅ Migration erfolgreich!"
echo ""
echo "Neue Tabellen:"
echo "  • newsletter_subscribers"
echo "  • affiliate_clicks"
echo "  • one_time_purchases"
echo "  • lead_requests"
echo "  • monetization_events"
