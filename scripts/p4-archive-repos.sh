#!/bin/bash
# ============================================================================
# P4: Archive duplicate & legacy repos + cleanup Vercel projects
#
# Archives 19 repos (10 duplicates + 9 legacy ft_*) on GitHub
# Also lists Vercel projects to delete manually
#
# Prerequisites:
#   - GitHub CLI: brew install gh
#   - Authenticated: gh auth login
#
# Usage: ./scripts/p4-archive-repos.sh
#
# SAFE: Archiving only sets repos to read-only. Nothing is deleted.
# To undo: gh api -X PATCH repos/ORG/REPO -f archived=false
# ============================================================================

set -euo pipefail

ORG="alexanderdeibel-Fintutto"

# --- 10 Duplicate repos to archive ---
DUPLICATES=(
  "miet-check-pro"
  "miet-check-pro-87"
  "rent-check-buddy"
  "mietkaution-klar"
  "my-deposit-calculator"
  "deposit-check-pro"
  "FT_CALC_RENDITE"
  "vermietify"
  "property-calc-hub"
  "a-docs"
)

# --- 9 Legacy ft_* repos to archive ---
LEGACY=(
  "ft_vermietify"
  "ft_fromulare_alle"
  "ft_mieter"
  "ft_hausmeisterPro"
  "ft_hausmeister"
  "ft_admin-hub"
  "ft_nebenkostenabrechnung"
  "ft_ocr_zaehler"
  "ft_calc_rendite-9bb37c94"
)

echo "=============================================="
echo "  P4: Archive Repos & Cleanup"
echo "=============================================="
echo ""

# Check gh CLI
if ! command -v gh &>/dev/null; then
  echo "ERROR: GitHub CLI not installed."
  echo "Install: brew install gh"
  echo "Login:   gh auth login"
  exit 1
fi

# Verify auth
if ! gh auth status &>/dev/null 2>&1; then
  echo "ERROR: Not authenticated with GitHub CLI."
  echo "Run: gh auth login"
  exit 1
fi

echo "This will archive ${#DUPLICATES[@]} duplicate + ${#LEGACY[@]} legacy repos."
echo "Archiving is REVERSIBLE (read-only, not deleted)."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

SUCCESS=0
FAILED=0
SKIPPED=0

echo ""
echo "=== Archiving Duplicate Repos ==="
for repo in "${DUPLICATES[@]}"; do
  echo -n "  $repo... "
  # Check if repo exists first
  if gh repo view "$ORG/$repo" &>/dev/null 2>&1; then
    if gh api -X PATCH "repos/$ORG/$repo" -f archived=true &>/dev/null 2>&1; then
      echo "ARCHIVED"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "FAILED"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "NOT FOUND (skip)"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo "=== Archiving Legacy ft_* Repos ==="
for repo in "${LEGACY[@]}"; do
  echo -n "  $repo... "
  if gh repo view "$ORG/$repo" &>/dev/null 2>&1; then
    if gh api -X PATCH "repos/$ORG/$repo" -f archived=true &>/dev/null 2>&1; then
      echo "ARCHIVED"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "FAILED"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "NOT FOUND (skip)"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo "=============================================="
echo "  Results: $SUCCESS archived, $FAILED failed, $SKIPPED skipped"
echo "=============================================="
echo ""
echo "=== Vercel Projects to Delete Manually ==="
echo ""
echo "Go to: vercel.com/fintutto (each project > Settings > Advanced > Delete)"
echo ""
echo "  1. ft-nebenkostenabrechnung     (legacy JavaScript)"
echo "  2. ft-nebenkostenabrechnung-vrju (duplicate)"
echo "  3. ft-formulare-alle            (legacy JavaScript)"
echo "  4. x_mieter                     (duplicate of 'mieter')"
echo "  5. command-center               (consolidated into admin-hub)"
echo ""
echo "  WAIT until portal.fintutto.cloud is live, then also delete:"
echo "  6. portal-vermieter             (replaced by fintutto-portal)"
echo "  7. portal-mieter                (replaced by fintutto-portal)"
echo ""
echo "=============================================="
