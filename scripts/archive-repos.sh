#!/bin/bash
# =============================================================
# Fintutto Ecosystem Cleanup - Repo Archivierungsskript
# =============================================================
# Dieses Skript archiviert alle nicht mehr benötigten GitHub-Repos.
# Archivierte Repos sind read-only, Code bleibt lesbar und klonbar.
#
# Voraussetzung: GitHub CLI (gh) muss installiert und authentifiziert sein.
#   brew install gh
#   gh auth login
#
# Nutzung:
#   chmod +x scripts/archive-repos.sh
#   ./scripts/archive-repos.sh
# =============================================================

set -euo pipefail

ORG="alexanderdeibel-Fintutto"

# Farben für die Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo " Fintutto Ecosystem - Repo Archivierung"
echo "=========================================="
echo ""

# Prüfe ob gh installiert ist
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Fehler: GitHub CLI (gh) nicht gefunden.${NC}"
    echo "Installiere mit: brew install gh"
    echo "Dann: gh auth login"
    exit 1
fi

# Prüfe ob authentifiziert
if ! gh auth status &> /dev/null 2>&1; then
    echo -e "${RED}Fehler: Nicht bei GitHub angemeldet.${NC}"
    echo "Führe aus: gh auth login"
    exit 1
fi

echo -e "${GREEN}GitHub CLI authentifiziert.${NC}"
echo ""

# ============================================
# Schritt 1: ft_admin-hub umbenennen
# ============================================
echo "=========================================="
echo " Schritt 1: ft_admin-hub umbenennen"
echo "=========================================="

read -p "Soll ft_admin-hub zu fintutto-admin-hub umbenannt werden? (j/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    echo "Benenne ft_admin-hub um..."
    gh repo rename fintutto-admin-hub --repo "$ORG/ft_admin-hub" --yes 2>/dev/null && \
        echo -e "${GREEN}Erfolgreich umbenannt!${NC}" || \
        echo -e "${YELLOW}Hinweis: Bereits umbenannt oder Repo nicht gefunden.${NC}"
else
    echo "Übersprungen."
fi

echo ""

# ============================================
# Schritt 2: Leere/Skelett-Repos archivieren
# ============================================
echo "=========================================="
echo " Schritt 2: Leere/Skelett-Repos archivieren (12)"
echo "=========================================="

EMPTY_REPOS=(
    "ft_hausmeister"
    "ft_ocr_zaehler"
    "vermietify"
    "FT_CALC_RENDITE"
    "ft_hausmeisterPro"
    "ft_mieter"
    "ft_vermietify"
    "ft_fromulare_alle"
    "ft_nebenkostenabrechnung"
    "ft_calc_rendite-9bb37c94"
    "Google-API-f-r-Fintutto"
)

for repo in "${EMPTY_REPOS[@]}"; do
    echo -n "Archiviere $repo... "
    gh repo archive "$ORG/$repo" --yes 2>/dev/null && \
        echo -e "${GREEN}OK${NC}" || \
        echo -e "${YELLOW}Übersprungen (bereits archiviert oder nicht gefunden)${NC}"
done

echo ""

# ============================================
# Schritt 3: Prototypen archivieren
# ============================================
echo "=========================================="
echo " Schritt 3: Prototypen archivieren (17)"
echo "=========================================="

PROTOTYPE_REPOS=(
    "miet-check-pro-87"
    "my-deposit-calculator"
    "mietkaution-klar"
    "property-calc-hub"
    "schoenheit-fintutto"
    "k-ndigungs-check-pro"
    "check-mieterhoehung2-fintutto"
    "grundsteuer-easy"
    "apps-fintutto-portal"
    "miet-check-pro"
    "deposit-check-pro"
    "property-equity-partner"
    "rent-check-buddy"
    "admin"
    "your-property-costs"
    "miet-check-pro-458b8dcf"
    "kaution-klar"
)

for repo in "${PROTOTYPE_REPOS[@]}"; do
    echo -n "Archiviere $repo... "
    gh repo archive "$ORG/$repo" --yes 2>/dev/null && \
        echo -e "${GREEN}OK${NC}" || \
        echo -e "${YELLOW}Übersprungen (bereits archiviert oder nicht gefunden)${NC}"
done

echo ""

# ============================================
# Schritt 4: Größere Repos archivieren (nach Audit)
# ============================================
echo "=========================================="
echo " Schritt 4: Größere Repos archivieren (6)"
echo "=========================================="
echo -e "${YELLOW}ACHTUNG: Diese Repos haben substanziellen Code.${NC}"
echo "Der Code bleibt nach Archivierung lesbar auf GitHub!"
echo ""

LARGE_REPOS=(
    "mietenplus-rechner"
    "fintutto-miet-recht"
    "betriebskosten"
    "fintutto-rent-wizard"
    "ft_ocr_zaehler-base44"
    "vermietify-altausbase"
)

for repo in "${LARGE_REPOS[@]}"; do
    read -p "Archiviere $repo? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        echo -n "  Archiviere... "
        gh repo archive "$ORG/$repo" --yes 2>/dev/null && \
            echo -e "${GREEN}OK${NC}" || \
            echo -e "${RED}Fehler${NC}"
    else
        echo "  Übersprungen."
    fi
done

echo ""

# ============================================
# Zusammenfassung
# ============================================
echo "=========================================="
echo " Zusammenfassung"
echo "=========================================="
echo ""
echo "Aktive Repos:"
ACTIVE_REPOS=(
    "portal"
    "ablesung"
    "vermietify_final"
    "bescheidboxer"
    "hausmeisterPro"
    "mieter"
    "fintutto-command-center"
    "fintutto-your-financial-compass"
    "fintutto-admin-hub"
    "a-docs"
)

for repo in "${ACTIVE_REPOS[@]}"; do
    archived=$(gh repo view "$ORG/$repo" --json isArchived -q '.isArchived' 2>/dev/null || echo "nicht gefunden")
    if [ "$archived" = "false" ]; then
        echo -e "  ${GREEN}✓${NC} $repo (aktiv)"
    elif [ "$archived" = "true" ]; then
        echo -e "  ${RED}✗${NC} $repo (ACHTUNG: archiviert!)"
    else
        echo -e "  ${YELLOW}?${NC} $repo ($archived)"
    fi
done

echo ""
echo -e "${GREEN}Fertig! Ecosystem aufgeräumt.${NC}"
echo ""
echo "Nächste Schritte:"
echo "  1. Lokale Ordner in ~/fintutto-ecosystem/ verschieben"
echo "  2. Feature-Integration starten (siehe ECOSYSTEM_CLEANUP.md)"
echo "  3. In jedem verschobenen Repo: git remote -v prüfen"
