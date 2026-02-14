#!/bin/bash
# Fintutto AI Widget - Complete Integration Script v2
# Adds AI widget to the 9 active Fintutto apps

set -e

SUPABASE_URL="https://aaefocdqgdgexkcrjhks.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNTU2NzYsImV4cCI6MjA1MzgzMTY3Nn0.KzAlgorLEJf_yfPY4RFEs1MERPyt5sYjIEvVPmPsWH4"
WIDGET_URL="https://cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main/packages/ai-widget/dist/fintutto-ai-widget.js"

# Apps: repo:appId format
APPS="
bescheidboxer:bescheidboxer
fintutto-admin-hub:admin
fintutto-your-financial-compass:rechner
fintutto-command-center:admin
portal:portal
vermietify_final:vermietify
ablesung:mieterapp
hausmeisterPro:hausmeister
mieter:mieterapp
"

cd ~

echo "=== Fintutto AI Widget Integration v2 ==="
echo ""

for entry in $APPS; do
  repo=$(echo "$entry" | cut -d: -f1)
  appId=$(echo "$entry" | cut -d: -f2)

  [ -z "$repo" ] && continue

  echo "--- $repo (appId: $appId) ---"

  # Clone if not exists
  if [ ! -d "$repo" ]; then
    echo "  Cloning..."
    git clone "https://github.com/alexanderdeibel-Fintutto/$repo.git" 2>/dev/null || { echo "  X Clone failed"; continue; }
  fi

  cd "$repo"
  git pull --rebase 2>/dev/null || git pull 2>/dev/null || true

  # Check if widget already present with correct URL
  if grep -q "cdn.jsdelivr.net.*fintutto-ai-widget" index.html 2>/dev/null; then
    echo "  OK Widget already present (correct URL)"
    cd ~
    continue
  fi

  # Check if widget present with wrong URL - fix it
  if grep -q "raw.githubusercontent.com.*fintutto-ai-widget" index.html 2>/dev/null; then
    echo "  Fixing URL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's|raw.githubusercontent.com/alexanderdeibel-Fintutto/fintutto-ecosystem/main|cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main|g' index.html
    else
      sed -i 's|raw.githubusercontent.com/alexanderdeibel-Fintutto/fintutto-ecosystem/main|cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main|g' index.html
    fi
    git add index.html
    git commit -m "fix: Use jsDelivr CDN for AI widget" 2>/dev/null || { echo "  Nothing to commit"; cd ~; continue; }
    git push 2>/dev/null && echo "  OK Fixed and pushed!" || echo "  X Push failed"
    cd ~
    continue
  fi

  # Add widget if not present
  if [ -f "index.html" ]; then
    if ! grep -q "fintutto-ai-widget" index.html 2>/dev/null; then
      echo "  Adding widget..."
      WIDGET_TAG="    <!-- Fintutto AI Assistent -->\n    <script src=\"$WIDGET_URL\" data-app-id=\"$appId\" data-supabase-url=\"$SUPABASE_URL\" data-supabase-key=\"$SUPABASE_KEY\"><\/script>\n  <\/body>"

      if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|</body>|$WIDGET_TAG|" index.html
      else
        sed -i "s|</body>|$WIDGET_TAG|" index.html
      fi

      git add index.html
      git commit -m "feat: Add Fintutto AI Assistant widget" 2>/dev/null || { echo "  Nothing to commit"; cd ~; continue; }
      git push 2>/dev/null && echo "  OK Pushed!" || echo "  X Push failed"
    fi
  else
    echo "  X No index.html found"
  fi

  cd ~
done

echo ""
echo "=== Done! ==="
echo "Open your apps in the browser - the chat button appears bottom-right."
