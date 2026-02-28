#!/usr/bin/env bash
# ============================================================
# Schritt 1: Vercel Team-Variablen setzen
# ============================================================
# Dieses Script setzt VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY
# als Team-Level Environment Variables in Vercel.
#
# Voraussetzungen:
#   - Vercel CLI installiert: npm i -g vercel
#   - Eingeloggt: vercel login
#   - Team-Scope gesetzt: vercel switch fintutto
#
# Ausfuehrung: bash scripts/setup-vercel-env.sh
# ============================================================

set -euo pipefail

SUPABASE_URL="https://aaefocdqgdgexkcrjhks.supabase.co"

echo "=================================================="
echo " Fintutto - Vercel Team Environment Variables Setup"
echo "=================================================="
echo ""

# Pruefe ob vercel CLI installiert ist
if ! command -v vercel &> /dev/null; then
  echo "FEHLER: Vercel CLI nicht installiert."
  echo "  npm install -g vercel"
  exit 1
fi

# Pruefe ob eingeloggt
if ! vercel whoami &> /dev/null; then
  echo "FEHLER: Nicht bei Vercel eingeloggt."
  echo "  vercel login"
  exit 1
fi

echo "Eingeloggt als: $(vercel whoami)"
echo ""

# VITE_SUPABASE_URL (Client-Side)
echo "1/4 - Setze VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production <<< "$SUPABASE_URL" 2>/dev/null || true
vercel env add VITE_SUPABASE_URL preview <<< "$SUPABASE_URL" 2>/dev/null || true
echo "     OK"

# VITE_SUPABASE_ANON_KEY (Client-Side)
echo ""
echo "2/4 - VITE_SUPABASE_ANON_KEY"
echo "     Bitte den Anon Key aus Supabase Dashboard eingeben:"
echo "     (Supabase → Settings → API → anon public)"
read -rsp "     Key: " ANON_KEY
echo ""
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$ANON_KEY" 2>/dev/null || true
vercel env add VITE_SUPABASE_ANON_KEY preview <<< "$ANON_KEY" 2>/dev/null || true
echo "     OK"

# VITE_SUPABASE_PUBLISHABLE_KEY (Alias fuer Vermietify)
echo ""
echo "3/4 - Setze VITE_SUPABASE_PUBLISHABLE_KEY (Alias fuer Vermietify)..."
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production <<< "$ANON_KEY" 2>/dev/null || true
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY preview <<< "$ANON_KEY" 2>/dev/null || true
echo "     OK"

# SUPABASE_URL Server-Side (fuer API Routes)
echo ""
echo "4/4 - Setze SUPABASE_URL (Server-Side)..."
vercel env add SUPABASE_URL production <<< "$SUPABASE_URL" 2>/dev/null || true
vercel env add SUPABASE_URL preview <<< "$SUPABASE_URL" 2>/dev/null || true
echo "     OK"

echo ""
echo "=================================================="
echo " FERTIG! Team-Variablen gesetzt."
echo ""
echo " Weitere Server-Side Keys manuell setzen unter:"
echo " https://vercel.com/fintutto/~/settings/environment-variables"
echo ""
echo " - SUPABASE_SERVICE_ROLE_KEY"
echo " - STRIPE_SECRET_KEY"
echo " - STRIPE_WEBHOOK_SECRET"
echo " - ANTHROPIC_API_KEY"
echo " - BREVO_API_KEY"
echo "=================================================="
