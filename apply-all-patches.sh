#!/bin/bash
# ============================================================
# Apply all pricing patches to satellite repos
# Usage: ./apply-all-patches.sh
#
# This script will:
# 1. Clone any missing repos into ~/
# 2. Apply the pricing patches
# 3. Push changes to origin/main
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/patches"
BASE_DIR="$HOME"
ORG="alexanderdeibel-Fintutto"

# Repos and their patch files
declare -A REPOS=(
  ["bescheidboxer"]="bescheidboxer.patch"
  ["fintutto-your-financial-compass"]="fintutto-your-financial-compass.patch"
  ["mieter"]="mieter.patch"
  ["hausmeisterPro"]="hausmeisterPro.patch"
  ["vermieter-freude"]="vermieter-freude.patch"
)

SUCCESS=()
FAILED=()

for repo in "${!REPOS[@]}"; do
  patch_file="${REPOS[$repo]}"
  repo_dir="$BASE_DIR/$repo"

  echo ""
  echo "========================================="
  echo "  Processing: $repo"
  echo "========================================="

  # Clone if missing
  if [ ! -d "$repo_dir" ]; then
    echo "  Cloning $repo..."
    git clone "https://github.com/$ORG/$repo.git" "$repo_dir" || {
      echo "  ERROR: Failed to clone $repo"
      FAILED+=("$repo (clone failed)")
      continue
    }
  fi

  cd "$repo_dir"

  # Ensure we're on main and up to date
  echo "  Switching to main branch..."
  git checkout main 2>/dev/null || git checkout -b main origin/main 2>/dev/null || true

  # Abort any stuck rebase/am
  git am --abort 2>/dev/null || true
  git rebase --abort 2>/dev/null || true

  # Pull latest
  echo "  Pulling latest..."
  git pull origin main --rebase 2>/dev/null || git pull origin main 2>/dev/null || true

  # Apply patch
  echo "  Applying patch: $patch_file"
  if git am < "$PATCHES_DIR/$patch_file"; then
    echo "  Patch applied successfully!"

    # Push
    echo "  Pushing to origin/main..."
    if git push origin main; then
      echo "  SUCCESS: $repo updated and pushed!"
      SUCCESS+=("$repo")
    else
      echo "  WARNING: Patch applied but push failed. Try: cd ~/$repo && git push origin main"
      FAILED+=("$repo (push failed)")
    fi
  else
    echo "  ERROR: Patch failed for $repo"
    git am --abort 2>/dev/null || true
    FAILED+=("$repo (patch failed)")
  fi
done

echo ""
echo "========================================="
echo "  SUMMARY"
echo "========================================="
echo ""

if [ ${#SUCCESS[@]} -gt 0 ]; then
  echo "  Successful (${#SUCCESS[@]}):"
  for s in "${SUCCESS[@]}"; do
    echo "    - $s"
  done
fi

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "  Failed (${#FAILED[@]}):"
  for f in "${FAILED[@]}"; do
    echo "    - $f"
  done
fi

echo ""
echo "Done!"
