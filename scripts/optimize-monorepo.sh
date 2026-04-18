#!/usr/bin/env bash
# ============================================================
# optimize-monorepo.sh
# Automatisiert alle CI- und Vercel-Optimierungen im
# Fintutto-Portal-Monorepo.
#
# VERWENDUNG:
#   bash scripts/optimize-monorepo.sh [--dry-run] [--push]
#
# OPTIONEN:
#   --dry-run   Zeigt alle Änderungen an, ohne sie anzuwenden
#   --push      Pusht alle Änderungen nach GitHub (benötigt PAT mit workflows-Scope)
#   --pat TOKEN GitHub Personal Access Token für Workflow-Push
# ============================================================

set -euo pipefail

# ─── Farben ───────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Konfiguration ────────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN=false
DO_PUSH=false
PAT_TOKEN=""
ERRORS=()
CHANGES=()

# ─── Argumente parsen ─────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --push) DO_PUSH=true; shift ;;
    --pat) PAT_TOKEN="$2"; shift 2 ;;
    *) echo -e "${RED}Unbekannte Option: $1${NC}"; exit 1 ;;
  esac
done

# ─── Hilfsfunktionen ──────────────────────────────────────
log_info()    { echo -e "${BLUE}ℹ ${NC}$1"; }
log_ok()      { echo -e "${GREEN}✓ ${NC}$1"; }
log_warn()    { echo -e "${YELLOW}⚠ ${NC}$1"; }
log_error()   { echo -e "${RED}✗ ${NC}$1"; ERRORS+=("$1"); }
log_change()  { echo -e "${CYAN}→ ${NC}$1"; CHANGES+=("$1"); }
log_section() { echo -e "\n${BOLD}${BLUE}═══ $1 ═══${NC}"; }

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    log_error "Befehl nicht gefunden: $1"
    return 1
  fi
}

write_file() {
  local path="$1"
  local content="$2"
  if [ "$DRY_RUN" = true ]; then
    log_change "[DRY-RUN] Würde schreiben: $path"
  else
    mkdir -p "$(dirname "$path")"
    echo "$content" > "$path"
    log_ok "Geschrieben: $path"
    log_change "$path"
  fi
}

# ─── Voraussetzungen prüfen ───────────────────────────────
log_section "Voraussetzungen"

check_cmd git
check_cmd pnpm
check_cmd node

cd "$REPO_ROOT"

if [ ! -f "pnpm-workspace.yaml" ]; then
  log_error "Kein pnpm-Monorepo gefunden (pnpm-workspace.yaml fehlt)"
  exit 1
fi

log_ok "Repository: $REPO_ROOT"
log_ok "Node: $(node --version)"
log_ok "pnpm: $(pnpm --version)"

# ─── 1. Vercel-Configs reparieren ─────────────────────────
log_section "1. Vercel-Konfigurationen"

STANDARD_VERCEL_TEMPLATE='{
  "framework": "vite",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
  "ignoreCommand": "git diff HEAD^ HEAD --quiet -- . ../../packages/shared/src/ ../../src/ || exit 1"
}'

for app_dir in apps/*/; do
  app_name=$(basename "$app_dir")
  vercel_file="$app_dir/vercel.json"

  # Leere/nicht vorhandene Vercel-Configs
  if [ ! -f "$vercel_file" ] && [ -f "$app_dir/package.json" ]; then
    log_warn "Keine vercel.json: $app_name — erstelle Standard-Config"
    write_file "$vercel_file" "$STANDARD_VERCEL_TEMPLATE"
    continue
  fi

  if [ -f "$vercel_file" ]; then
    # npm durch pnpm ersetzen
    if grep -q '"npm run build"' "$vercel_file" 2>/dev/null; then
      if [ "$DRY_RUN" = false ]; then
        sed -i 's/"npm run build"/"pnpm run build"/g' "$vercel_file"
        log_ok "npm → pnpm in $app_name/vercel.json"
        log_change "$vercel_file"
      else
        log_change "[DRY-RUN] npm → pnpm in $app_name/vercel.json"
      fi
    fi

    # installCommand hinzufügen wenn fehlend
    if ! grep -q '"installCommand"' "$vercel_file" 2>/dev/null; then
      if [ "$DRY_RUN" = false ]; then
        python3 -c "
import json, sys
with open('$vercel_file') as f:
    d = json.load(f)
if 'installCommand' not in d:
    d['installCommand'] = 'pnpm install'
    with open('$vercel_file', 'w') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
    print('OK')
"
        log_ok "installCommand hinzugefügt: $app_name/vercel.json"
        log_change "$vercel_file"
      else
        log_change "[DRY-RUN] installCommand hinzufügen: $app_name/vercel.json"
      fi
    fi
  fi
done

# ─── 2. package.json: turbo in devDependencies ────────────
log_section "2. Turbo in devDependencies"

if ! python3 -c "
import json
with open('package.json') as f:
    d = json.load(f)
assert 'turbo' in d.get('devDependencies', {})
" 2>/dev/null; then
  if [ "$DRY_RUN" = false ]; then
    python3 -c "
import json
with open('package.json') as f:
    d = json.load(f)
d.setdefault('devDependencies', {})['turbo'] = '^2.3.3'
# build:turbo Skript hinzufügen
if 'build:turbo' not in d.get('scripts', {}):
    d['scripts']['build:turbo'] = 'turbo run build'
with open('package.json', 'w') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write('\n')
print('OK')
"
    log_ok "turbo ^2.3.3 zu devDependencies hinzugefügt"
    log_change "package.json"
  else
    log_change "[DRY-RUN] turbo zu devDependencies hinzufügen"
  fi
else
  log_ok "turbo bereits in devDependencies"
fi

# ─── 3. pnpm-lock.yaml aktualisieren ──────────────────────
log_section "3. pnpm-lock.yaml synchronisieren"

if [ "$DRY_RUN" = false ]; then
  log_info "Führe pnpm install aus..."
  pnpm install --no-frozen-lockfile 2>&1 | tail -5
  log_ok "pnpm-lock.yaml aktualisiert"
  log_change "pnpm-lock.yaml"
else
  log_change "[DRY-RUN] pnpm install --no-frozen-lockfile"
fi

# ─── 4. Regressionstests ausführen ────────────────────────
log_section "4. Regressionstests"

if [ "$DRY_RUN" = false ]; then
  log_info "Führe Regressionstests aus..."
  if pnpm exec vitest run src/__tests__/regression/ --reporter=verbose 2>&1; then
    log_ok "Alle Regressionstests bestanden"
  else
    log_error "Regressionstests fehlgeschlagen!"
  fi
else
  log_change "[DRY-RUN] vitest run src/__tests__/regression/"
fi

# ─── 5. Git-Commit ────────────────────────────────────────
log_section "5. Git-Commit"

if [ "$DRY_RUN" = false ]; then
  cd "$REPO_ROOT"
  git add -A

  if git diff --cached --quiet; then
    log_info "Keine Änderungen zum Committen"
  else
    COMMIT_MSG="chore(monorepo): Vercel-Configs, Turbo, Dependabot und SecondBrain Gmail-Sync optimiert

- Alle vercel.json auf pnpm installCommand/buildCommand aktualisiert
- turbo ^2.3.3 zu devDependencies hinzugefügt
- turbo.json mit Input-Hashes für optimales Caching konfiguriert
- .github/dependabot.yml für pnpm + GitHub Actions erstellt
- supabase/functions/gmail-sync Edge Function implementiert
- .github/workflows/gmail-sync.yml für täglichen Cron-Job erstellt
- CI-Build-Matrix um secondbrain und ams erweitert
- pnpm-Store-Cache und Vite-Build-Cache in CI hinzugefügt"

    git commit -m "$COMMIT_MSG"
    log_ok "Commit erstellt: $(git log --oneline -1)"
    log_change "git commit"
  fi
fi

# ─── 6. Push zu GitHub ────────────────────────────────────
if [ "$DO_PUSH" = true ]; then
  log_section "6. Push zu GitHub"

  if [ -n "$PAT_TOKEN" ]; then
    # Workflow-Datei über API pushen (benötigt workflows-Scope)
    log_info "Pushe Workflow-Dateien über GitHub API..."
    REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')

    for workflow_file in .github/workflows/*.yml; do
      FILENAME=$(basename "$workflow_file")
      SHA=$(curl -s -H "Authorization: token $PAT_TOKEN" \
        "https://api.github.com/repos/$REPO/contents/.github/workflows/$FILENAME" \
        | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('sha',''))" 2>/dev/null || echo "")

      CONTENT=$(base64 -w 0 "$workflow_file")

      if [ -n "$SHA" ]; then
        RESULT=$(curl -s -X PUT \
          -H "Authorization: token $PAT_TOKEN" \
          -H "Content-Type: application/json" \
          "https://api.github.com/repos/$REPO/contents/.github/workflows/$FILENAME" \
          -d "{\"message\": \"ci: $FILENAME aktualisiert\", \"content\": \"$CONTENT\", \"sha\": \"$SHA\"}")
      else
        RESULT=$(curl -s -X PUT \
          -H "Authorization: token $PAT_TOKEN" \
          -H "Content-Type: application/json" \
          "https://api.github.com/repos/$REPO/contents/.github/workflows/$FILENAME" \
          -d "{\"message\": \"ci: $FILENAME erstellt\", \"content\": \"$CONTENT\"}")
      fi

      if echo "$RESULT" | python3 -c "import json,sys; d=json.load(sys.stdin); exit(0 if 'content' in d else 1)" 2>/dev/null; then
        log_ok "Workflow gepusht: $FILENAME"
      else
        log_error "Fehler beim Pushen von $FILENAME: $(echo $RESULT | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("message",""))' 2>/dev/null)"
      fi
    done

    # Rest normal pushen
    git push origin main
    log_ok "Push erfolgreich"
  else
    # Normaler Push (ohne Workflow-Dateien)
    git push origin main
    log_ok "Push erfolgreich (Workflow-Dateien ggf. manuell aktualisieren)"
  fi
fi

# ─── Zusammenfassung ──────────────────────────────────────
log_section "Zusammenfassung"

echo ""
if [ ${#CHANGES[@]} -gt 0 ]; then
  echo -e "${GREEN}${BOLD}Änderungen (${#CHANGES[@]}):${NC}"
  for change in "${CHANGES[@]}"; do
    echo -e "  ${CYAN}→${NC} $change"
  done
fi

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}${BOLD}Fehler (${#ERRORS[@]}):${NC}"
  for error in "${ERRORS[@]}"; do
    echo -e "  ${RED}✗${NC} $error"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}${BOLD}✓ Alle Optimierungen erfolgreich abgeschlossen!${NC}"
fi
