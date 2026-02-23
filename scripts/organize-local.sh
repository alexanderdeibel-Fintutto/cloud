#!/bin/bash
# =============================================================
# Fintutto Ecosystem - Lokale Ordnerstruktur erstellen
# =============================================================
# Dieses Skript findet deine lokalen Repo-Klone und verschiebt sie
# in eine saubere Ordnerstruktur unter ~/fintutto-ecosystem/.
#
# Nutzung:
#   chmod +x scripts/organize-local.sh
#   ./scripts/organize-local.sh
# =============================================================

set -euo pipefail

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TARGET="$HOME/fintutto-ecosystem"

echo "=========================================="
echo " Fintutto Ecosystem - Lokale Organisation"
echo "=========================================="
echo ""
echo -e "Ziel-Ordner: ${BLUE}$TARGET${NC}"
echo ""

# Die 10 aktiven Kern-Repos
REPOS=(
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

# Suchpfade (typische Orte wo Repos liegen koennten)
SEARCH_PATHS=(
    "$HOME"
    "$HOME/Documents"
    "$HOME/Projects"
    "$HOME/Developer"
    "$HOME/Code"
    "$HOME/repos"
    "$HOME/GitHub"
    "$HOME/Desktop"
)

# ============================================
# Schritt 1: Ziel-Ordner erstellen
# ============================================
echo "=========================================="
echo " Schritt 1: Ziel-Ordner erstellen"
echo "=========================================="

if [ -d "$TARGET" ]; then
    echo -e "${YELLOW}$TARGET existiert bereits.${NC}"
else
    mkdir -p "$TARGET"
    echo -e "${GREEN}$TARGET erstellt.${NC}"
fi

mkdir -p "$TARGET/_archiv"
echo ""

# ============================================
# Schritt 2: Repos finden und verschieben
# ============================================
echo "=========================================="
echo " Schritt 2: Repos finden"
echo "=========================================="
echo ""

FOUND=0
MOVED=0
SKIPPED=0

for repo in "${REPOS[@]}"; do
    # Schon im Ziel?
    if [ -d "$TARGET/$repo/.git" ]; then
        echo -e "  ${GREEN}OK${NC} $repo (bereits in $TARGET/)"
        ((SKIPPED++))
        continue
    fi

    # In Suchpfaden suchen (maxdepth 2)
    REPO_PATH=""
    for search in "${SEARCH_PATHS[@]}"; do
        if [ -d "$search/$repo/.git" ]; then
            REPO_PATH="$search/$repo"
            break
        fi
    done

    if [ -n "$REPO_PATH" ]; then
        ((FOUND++))
        echo -e "  ${BLUE}Gefunden:${NC} $repo -> $REPO_PATH"

        # Pruefen ob nicht das aktuelle Verzeichnis
        CURRENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
        if [ "$REPO_PATH" = "$CURRENT_DIR" ]; then
            echo -e "    ${YELLOW}Das ist das aktuelle Arbeitsverzeichnis - verschiebe nach Skript-Ende manuell.${NC}"
            echo -e "    ${YELLOW}Befehl: mv \"$REPO_PATH\" \"$TARGET/\"${NC}"
            continue
        fi

        read -p "    Verschieben nach $TARGET/$repo? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            mv "$REPO_PATH" "$TARGET/"
            echo -e "    ${GREEN}Verschoben!${NC}"
            ((MOVED++))
        else
            echo "    Uebersprungen."
        fi
    else
        echo -e "  ${YELLOW}?${NC} $repo nicht lokal gefunden"
    fi
done

echo ""

# ============================================
# Schritt 3: Git-Remotes pruefen
# ============================================
echo "=========================================="
echo " Schritt 3: Git-Remotes pruefen"
echo "=========================================="
echo ""

for repo in "${REPOS[@]}"; do
    if [ -d "$TARGET/$repo/.git" ]; then
        REMOTE=$(cd "$TARGET/$repo" && git remote get-url origin 2>/dev/null || echo "kein Remote")
        echo -e "  ${GREEN}$repo${NC}: $REMOTE"
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
echo "  Gefunden & verschoben: $MOVED"
echo "  Bereits vorhanden:     $SKIPPED"
echo "  Nicht gefunden:        $((${#REPOS[@]} - FOUND - SKIPPED))"
echo ""
echo -e "${GREEN}Ordnerstruktur:${NC}"
echo ""
echo "  ~/fintutto-ecosystem/"

for repo in "${REPOS[@]}"; do
    if [ -d "$TARGET/$repo" ]; then
        echo -e "  ├── ${GREEN}$repo/${NC}"
    else
        echo -e "  ├── ${YELLOW}$repo/ (fehlt)${NC}"
    fi
done

echo "  └── _archiv/"
echo ""
echo -e "${GREEN}Fertig!${NC}"
echo ""
echo "Naechste Schritte:"
echo "  1. Fehlende Repos klonen:"
echo "     cd ~/fintutto-ecosystem"
echo "     gh repo clone alexanderdeibel-Fintutto/REPO_NAME"
echo "  2. In jedem Repo: npm install (falls node_modules fehlt)"
echo "  3. Feature-Integration starten (siehe ECOSYSTEM_CLEANUP.md)"
