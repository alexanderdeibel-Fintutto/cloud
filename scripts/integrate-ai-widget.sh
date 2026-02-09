#!/bin/bash
# Fintutto AI Widget - Automatische Integration für alle Apps
# Führe dieses Script in deinem Home-Verzeichnis aus: bash ~/integrate-ai-widget.sh

set -e

SUPABASE_URL="https://aaefocdqgdgexkcrjhks.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNTU2NzYsImV4cCI6MjA1MzgzMTY3Nn0.KzAlgorLEJf_yfPY4RFEs1MERPyt5sYjIEvVPmPsWH4"
WIDGET_URL="https://raw.githubusercontent.com/alexanderdeibel-Fintutto/fintutto-ecosystem/main/packages/ai-widget/dist/fintutto-ai-widget.js"

# Apps und ihre IDs
declare -A APPS=(
  ["betriebskosten-helfer"]="betriebskosten"
  ["fintutto-rent-wizard"]="rechner"
  ["fintu-hausmeister-app"]="hausmeister"
  ["fintutto-miet-recht"]="mietrecht"
  ["check-mieterhoehung2-fintutto"]="checker"
  ["miet-check-pro"]="checker"
  ["mietenplus-rechner"]="rechner"
  ["vermieter-freude"]="rechner"
  ["wohn-held"]="mieterapp"
  ["leserally-all"]="mieterapp"
  ["fintutto-admin-hub"]="admin"
  ["fintutto-your-financial-compass"]="rechner"
  ["ft_vermietify"]="vermietify"
  ["ft_mieter"]="mieterapp"
  ["ft_fromulare_alle"]="formulare"
)

cd ~

echo "=== Fintutto AI Widget Integration ==="
echo ""

for repo in "${!APPS[@]}"; do
  appId="${APPS[$repo]}"

  echo "--- $repo (appId: $appId) ---"

  # Clone wenn nicht vorhanden
  if [ ! -d "$repo" ]; then
    echo "  Cloning..."
    git clone "https://github.com/alexanderdeibel-Fintutto/$repo.git" 2>/dev/null || { echo "  ✗ Clone failed"; continue; }
  fi

  cd "$repo"

  # Pull neueste Änderungen
  git pull --rebase 2>/dev/null || git pull 2>/dev/null || true

  # Prüfe ob Widget schon vorhanden
  if grep -q "fintutto-ai-widget" index.html 2>/dev/null; then
    echo "  ✓ Widget already present"
    cd ~
    continue
  fi

  # Widget einfügen
  if [ -f "index.html" ]; then
    # Erstelle Widget-Zeile
    WIDGET_LINE="    <!-- Fintutto AI Assistent -->\n    <script src=\"$WIDGET_URL\" data-app-id=\"$appId\" data-supabase-url=\"$SUPABASE_URL\" data-supabase-key=\"$SUPABASE_KEY\"></script>"

    # Füge vor </body> ein (macOS kompatibel)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|</body>|$WIDGET_LINE\n  </body>|" index.html
    else
      sed -i "s|</body>|$WIDGET_LINE\n  </body>|" index.html
    fi

    # Commit und Push
    git add index.html
    git commit -m "feat: Add Fintutto AI Assistant widget" 2>/dev/null || { echo "  ✗ Nothing to commit"; cd ~; continue; }
    git push 2>/dev/null && echo "  ✓ Pushed!" || echo "  ✗ Push failed (try manually)"
  else
    echo "  ✗ No index.html found"
  fi

  cd ~
done

echo ""
echo "=== Fertig! ==="
echo "Öffne deine Apps im Browser - der Chat-Button erscheint unten rechts."
