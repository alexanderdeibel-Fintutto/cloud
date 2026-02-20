#!/bin/bash
# ============================================================
# Apply Ablesung DB migration patch
#
# The Ablesung app uses Supabase DB for pricing (not code files).
# This applies the SQL migration to fix prices.
#
# Usage: ./scripts/apply-ablesung-patch.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCHES_DIR="$(cd "$SCRIPT_DIR/../patches" && pwd)"
BASE_DIR="$HOME"
ORG="alexanderdeibel-Fintutto"
REPO="ablesung"
REPO_DIR="$BASE_DIR/$REPO"

echo "========================================="
echo "  Applying Ablesung DB Migration Patch"
echo "========================================="

# Clone if missing
if [ ! -d "$REPO_DIR" ]; then
  echo "  Cloning $REPO..."
  git clone "https://github.com/$ORG/$REPO.git" "$REPO_DIR"
fi

cd "$REPO_DIR"

# Ensure we're on main
git checkout main 2>/dev/null || true
git am --abort 2>/dev/null || true
git pull origin main --rebase 2>/dev/null || git pull origin main --ff-only 2>/dev/null || true

# Apply patch
echo "  Applying patch: ablesung.patch"
if git am < "$PATCHES_DIR/ablesung.patch"; then
  echo "  Patch applied successfully!"
  echo "  Pushing to origin/main..."
  git push origin main
  echo "  SUCCESS!"
  echo ""
  echo "  IMPORTANT: Run the Supabase migration to apply price changes:"
  echo "    cd $REPO_DIR"
  echo "    supabase db push"
  echo ""
  echo "  Or apply manually in Supabase SQL Editor:"
  echo "    $REPO_DIR/supabase/migrations/20260212120000_fix_product_prices.sql"
else
  echo "  ERROR: Patch failed. It may already be applied."
  echo "  Check: git log --oneline -5"
  git am --abort 2>/dev/null || true
fi
