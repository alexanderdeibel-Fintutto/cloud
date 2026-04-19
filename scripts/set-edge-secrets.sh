#!/bin/bash
# =============================================================================
# Fintutto Portal — Edge Function Secrets konfigurieren
# Setzt alle benötigten Secrets für die Edge Functions
# =============================================================================
# USAGE:
#   OPENAI_API_KEY=sk-... RESEND_API_KEY=re_... GOOGLE_MAPS_API_KEY=AIza... \
#   bash scripts/set-edge-secrets.sh
# =============================================================================

set -e

PROJ_REF="aaefocdqgdgexkcrjhks"

echo "========================================"
echo " Fintutto Edge Function Secrets"
echo " Projekt: $PROJ_REF"
echo "========================================"
echo ""

# Pflicht-Secrets prüfen
MISSING=0

if [ -z "$OPENAI_API_KEY" ]; then
  echo "⚠ OPENAI_API_KEY fehlt (benötigt für: ocr-meter, ocr-invoice, amt-scan, analyze-receipt, secondbrain-chat, ocr-meter-number)"
  MISSING=$((MISSING + 1))
fi

if [ -z "$RESEND_API_KEY" ]; then
  echo "⚠ RESEND_API_KEY fehlt (benötigt für: send-email)"
  MISSING=$((MISSING + 1))
fi

if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
  echo "⚠ GOOGLE_MAPS_API_KEY fehlt (benötigt für: get-maps-key, google-maps)"
  MISSING=$((MISSING + 1))
fi

if [ $MISSING -gt 0 ]; then
  echo ""
  echo "Bitte fehlende Secrets als Umgebungsvariablen setzen und erneut ausführen."
  echo "Beispiel:"
  echo "  export OPENAI_API_KEY=sk-..."
  echo "  export RESEND_API_KEY=re_..."
  echo "  export GOOGLE_MAPS_API_KEY=AIza..."
  echo "  bash scripts/set-edge-secrets.sh"
  exit 1
fi

echo "Alle Secrets vorhanden. Setze Secrets auf Supabase..."
echo ""

# OpenAI
echo "→ Setze OPENAI_API_KEY..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref "$PROJ_REF"
echo "  ✓ OPENAI_API_KEY gesetzt"

# Resend
echo "→ Setze RESEND_API_KEY..."
supabase secrets set RESEND_API_KEY="$RESEND_API_KEY" --project-ref "$PROJ_REF"
echo "  ✓ RESEND_API_KEY gesetzt"

# Google Maps
echo "→ Setze GOOGLE_MAPS_API_KEY..."
supabase secrets set GOOGLE_MAPS_API_KEY="$GOOGLE_MAPS_API_KEY" --project-ref "$PROJ_REF"
echo "  ✓ GOOGLE_MAPS_API_KEY gesetzt"

# Optionale Secrets
if [ -n "$STRIPE_SECRET_KEY" ]; then
  echo "→ Setze STRIPE_SECRET_KEY..."
  supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref "$PROJ_REF"
  echo "  ✓ STRIPE_SECRET_KEY gesetzt"
fi

echo ""
echo "========================================"
echo " Secrets erfolgreich konfiguriert!"
echo " Jetzt Edge Functions deployen:"
echo "   bash scripts/deploy-edge-functions.sh"
echo "========================================"
