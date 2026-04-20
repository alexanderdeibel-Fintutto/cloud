#!/bin/bash
# =============================================================================
# Fintutto Portal — Edge Functions Deploy Script
# Deployt alle Supabase Edge Functions auf das Projekt aaefocdqgdgexkcrjhks
# =============================================================================

set -e

PROJ_REF="aaefocdqgdgexkcrjhks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo " Fintutto Edge Functions Deploy"
echo " Projekt: $PROJ_REF"
echo "========================================"
echo ""

cd "$ROOT_DIR"

# Alle Edge Functions (neue + bestehende)
FUNCTIONS=(
  # Neu implementiert (April 2026)
  "secondbrain-chat"
  "send-email"
  "ocr-meter"
  "ocr-meter-number"
  "ocr-invoice"
  "amt-scan"
  "analyze-receipt"
  "get-maps-key"
  "google-maps"
  "get-ecosystem-prices"
  "referral"
  # Bestehende
  "ai-chat"
  "analyze-document"
  "secondbrain-ocr"
  "generate-operating-cost-pdf"
  "send-operating-cost-emails"
)

DEPLOYED=0
FAILED=0
FAILED_LIST=()

for fn in "${FUNCTIONS[@]}"; do
  if [ -d "supabase/functions/$fn" ]; then
    echo "→ Deploying: $fn ..."
    if supabase functions deploy "$fn" --project-ref "$PROJ_REF" --no-verify-jwt 2>&1; then
      echo "  ✓ $fn deployed"
      DEPLOYED=$((DEPLOYED + 1))
    else
      echo "  ✗ $fn FAILED"
      FAILED=$((FAILED + 1))
      FAILED_LIST+=("$fn")
    fi
  else
    echo "  ⚠ $fn — Verzeichnis nicht gefunden, übersprungen"
  fi
  echo ""
done

echo "========================================"
echo " Deploy abgeschlossen"
echo " ✓ Erfolgreich: $DEPLOYED"
echo " ✗ Fehlgeschlagen: $FAILED"
if [ ${#FAILED_LIST[@]} -gt 0 ]; then
  echo " Fehlgeschlagene Functions:"
  for f in "${FAILED_LIST[@]}"; do
    echo "   - $f"
  done
fi
echo "========================================"
