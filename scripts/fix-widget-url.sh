#!/bin/bash
# Fintutto AI Widget - URL Fix Script
# Fixes raw.githubusercontent.com URLs to use jsDelivr CDN
# Run this in your home directory: bash ~/fintutto-ecosystem/scripts/fix-widget-url.sh

set -e

OLD_URL="https://raw.githubusercontent.com/alexanderdeibel-Fintutto/fintutto-ecosystem/main/packages/ai-widget/dist/fintutto-ai-widget.js"
NEW_URL="https://cdn.jsdelivr.net/gh/alexanderdeibel-Fintutto/fintutto-ecosystem@main/packages/ai-widget/dist/fintutto-ai-widget.js"

cd ~

echo "=== Fixing AI Widget URLs ==="
echo ""

for repo in betriebskosten-helfer fintutto-rent-wizard; do
  echo "--- $repo ---"

  if [ ! -d "$repo" ]; then
    echo "  Skipping: not found"
    continue
  fi

  cd "$repo"

  if grep -q "raw.githubusercontent.com" index.html 2>/dev/null; then
    # Fix URL (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|$OLD_URL|$NEW_URL|g" index.html
    else
      sed -i "s|$OLD_URL|$NEW_URL|g" index.html
    fi

    # Commit and push
    git add index.html
    git commit -m "fix: Use jsDelivr CDN for AI widget" 2>/dev/null || { echo "  Nothing to commit"; cd ~; continue; }
    git push 2>/dev/null && echo "  Pushed!" || echo "  Push failed (try manually)"
  else
    echo "  URL already correct or no widget found"
  fi

  cd ~
done

echo ""
echo "=== Done! ==="
