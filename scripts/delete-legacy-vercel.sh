#!/usr/bin/env bash
# ============================================================
# Schritt 2: 5+ Legacy-Vercel-Projekte loeschen
# ============================================================
# Loescht veraltete/duplizierte Vercel-Projekte.
#
# Voraussetzungen:
#   - Vercel CLI installiert & eingeloggt
#
# Ausfuehrung: bash scripts/delete-legacy-vercel.sh
# ============================================================

set -euo pipefail

echo "=================================================="
echo " Fintutto - Legacy Vercel-Projekte loeschen"
echo "=================================================="
echo ""

if ! command -v vercel &> /dev/null; then
  echo "FEHLER: Vercel CLI nicht installiert. npm i -g vercel"
  exit 1
fi

PROJECTS_TO_DELETE=(
  "ft-nebenkostenabrechnung"         # Legacy JavaScript
  "ft-nebenkostenabrechnung-vrju"     # Duplikat
  "ft-formulare-alle"                 # Legacy JavaScript
  "x_mieter"                          # Duplikat von "mieter"
  "betriebskosten"                    # In Portal integriert
  "portal-vermieter"                  # Durch fintutto-portal ersetzt
  "portal-mieter"                     # Durch fintutto-portal ersetzt
)

echo "Folgende Projekte werden geloescht:"
echo ""
for project in "${PROJECTS_TO_DELETE[@]}"; do
  echo "  - $project"
done
echo ""

read -rp "Fortfahren? (j/N) " confirm
if [[ "$confirm" != "j" && "$confirm" != "J" ]]; then
  echo "Abgebrochen."
  exit 0
fi

echo ""
deleted=0
failed=0

for project in "${PROJECTS_TO_DELETE[@]}"; do
  echo -n "Loesche $project... "
  if vercel remove "$project" --yes 2>/dev/null; then
    echo "OK"
    ((deleted++))
  else
    echo "FEHLER (evtl. existiert nicht)"
    ((failed++))
  fi
done

echo ""
echo "=================================================="
echo " Ergebnis: $deleted geloescht, $failed fehlgeschlagen"
echo "=================================================="
