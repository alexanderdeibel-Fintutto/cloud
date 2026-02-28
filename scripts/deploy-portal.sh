#!/usr/bin/env bash
# ============================================================
# Schritt 3: fintutto-portal auf Vercel deployen
# ============================================================
# Deployed das Portal als portal.fintutto.cloud
#
# Voraussetzungen:
#   - Vercel CLI installiert & eingeloggt
#   - Team-Variablen gesetzt (setup-vercel-env.sh)
#   - DNS fuer fintutto.cloud konfiguriert:
#       A Record:  76.76.21.21
#       CNAME:     cname.vercel-dns.com
#
# Ausfuehrung: bash scripts/deploy-portal.sh
# ============================================================

set -euo pipefail

PORTAL_DIR="$(cd "$(dirname "$0")/../apps/fintutto-portal" && pwd)"

echo "=================================================="
echo " Fintutto Portal - Vercel Deployment"
echo "=================================================="
echo ""
echo "Portal-Verzeichnis: $PORTAL_DIR"
echo ""

if ! command -v vercel &> /dev/null; then
  echo "FEHLER: Vercel CLI nicht installiert. npm i -g vercel"
  exit 1
fi

# 1. Vercel-Projekt verknuepfen (falls noch nicht geschehen)
echo "1/4 - Projekt verknuepfen..."
cd "$PORTAL_DIR"
if [ ! -d ".vercel" ]; then
  echo "     Erstelle Vercel-Projekt-Link..."
  vercel link --yes
else
  echo "     Bereits verknuepft."
fi
echo ""

# 2. Build lokal testen
echo "2/4 - Build testen..."
npm run build
echo "     Build erfolgreich."
echo ""

# 3. Deploy (Production)
echo "3/4 - Deploy auf Vercel (Production)..."
vercel --prod
echo ""

# 4. Custom Domain hinzufuegen
echo "4/4 - Custom Domain konfigurieren..."
echo ""
echo "     Bitte manuell in Vercel Dashboard:"
echo "     1. Gehe zu: vercel.com/fintutto/fintutto-portal/settings/domains"
echo "     2. Fuege hinzu: portal.fintutto.cloud"
echo "     3. DNS pruefen:"
echo "        CNAME portal → cname.vercel-dns.com"
echo "        ODER A Record → 76.76.21.21"
echo ""

echo "=================================================="
echo " FERTIG! Portal deployed."
echo "=================================================="
echo ""
echo " URL:    https://portal.fintutto.cloud"
echo " Vercel: https://vercel.com/fintutto/fintutto-portal"
echo "=================================================="
