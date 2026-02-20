#!/bin/bash
# ============================================================
# Apply all pricing patches to satellite repos
# Usage: ./apply-all-patches.sh
#
# Compatible with macOS bash 3.x and zsh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PATCHES_DIR="$SCRIPT_DIR/patches"
BASE_DIR="$HOME"
ORG="alexanderdeibel-Fintutto"

# Simple arrays instead of associative arrays (macOS bash 3.x compat)
REPO_NAMES="bescheidboxer fintutto-your-financial-compass mieter hausmeisterPro vermieter-freude"
PATCH_FILES="bescheidboxer.patch fintutto-your-financial-compass.patch mieter.patch hausmeisterPro.patch vermieter-freude.patch"

SUCCESS_COUNT=0
FAIL_COUNT=0

# Convert to arrays
set -- $REPO_NAMES
REPOS=("$@")
set -- $PATCH_FILES
PATCHES=("$@")

i=0
for repo in "${REPOS[@]}"; do
  patch_file="${PATCHES[$i]}"
  repo_dir="$BASE_DIR/$repo"
  i=$((i + 1))

  echo ""
  echo "========================================="
  echo "  Processing: $repo"
  echo "========================================="

  # Clone if missing
  if [ ! -d "$repo_dir" ]; then
    echo "  Cloning $repo..."
    if ! git clone "https://github.com/$ORG/$repo.git" "$repo_dir"; then
      echo "  ERROR: Failed to clone $repo"
      FAIL_COUNT=$((FAIL_COUNT + 1))
      continue
    fi
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
  git pull origin main --rebase 2>/dev/null || git pull origin main --ff-only 2>/dev/null || true

  # Apply patch
  echo "  Applying patch: $patch_file"
  if git am < "$PATCHES_DIR/$patch_file"; then
    echo "  Patch applied successfully!"

    # Push
    echo "  Pushing to origin/main..."
    if git push origin main; then
      echo "  SUCCESS: $repo updated and pushed!"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
      echo "  WARNING: Patch applied but push failed. Try: cd ~/$repo && git push origin main"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    echo "  ERROR: Patch failed for $repo"
    git am --abort 2>/dev/null || true
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

echo ""
echo "========================================="
echo "  SUMMARY: $SUCCESS_COUNT succeeded, $FAIL_COUNT failed"
echo "========================================="
echo ""
echo "Done!"
