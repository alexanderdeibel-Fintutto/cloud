#!/bin/bash
# Fintutto AI Widget - Push Updates to all repos
# Run this from your home directory: bash ~/fintutto-ecosystem/scripts/push-ai-widget-updates.sh

cd ~

REPOS="bescheidboxer portal fintutto-admin-hub fintutto-your-financial-compass"

echo "=== Pushing AI Widget Updates ==="
echo ""

for repo in $REPOS; do
  echo "--- $repo ---"

  if [ ! -d "$repo" ]; then
    echo "  Skipping: not found"
    continue
  fi

  cd "$repo"

  # Check for changes
  if git diff --quiet index.html 2>/dev/null; then
    echo "  No changes"
    cd ~
    continue
  fi

  # Commit and push
  git add index.html
  git commit -m "feat: Add/fix Fintutto AI Assistant widget" 2>/dev/null || { echo "  Nothing to commit"; cd ~; continue; }
  git push 2>/dev/null && echo "  OK Pushed!" || echo "  X Push failed"

  cd ~
done

echo ""
echo "=== Done! ==="
