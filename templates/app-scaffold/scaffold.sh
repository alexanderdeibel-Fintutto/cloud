#!/bin/bash
# =====================================================
# Fintutto App Scaffold Generator
# Erstellt eine neue App aus dem Container-Template.
#
# Nutzung:
#   ./scaffold.sh --name mieter --display-name "Mieter-Portal" \
#     --primary-color "#10b981" --role tenant \
#     --features "dashboard,meters,documents,payments,calculators,checkers,aiChat,settings"
# =====================================================

set -e

# Defaults
APP_NAME=""
DISPLAY_NAME=""
PRIMARY_COLOR="#2563eb"
DEFAULT_ROLE="owner"
FEATURES="dashboard,properties,tenants,meters,documents,payments,calculators,checkers,bescheide,tasks,aiChat,settings"
PORT=3100

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name) APP_NAME="$2"; shift 2 ;;
    --display-name) DISPLAY_NAME="$2"; shift 2 ;;
    --primary-color) PRIMARY_COLOR="$2"; shift 2 ;;
    --role) DEFAULT_ROLE="$2"; shift 2 ;;
    --features) FEATURES="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    *) echo "Unbekanntes Argument: $1"; exit 1 ;;
  esac
done

if [ -z "$APP_NAME" ]; then
  echo "Fehler: --name ist erforderlich"
  echo "Nutzung: ./scaffold.sh --name <app-name> [--display-name <name>] [--primary-color <hex>] [--role <role>] [--features <csv>]"
  exit 1
fi

DISPLAY_NAME="${DISPLAY_NAME:-$APP_NAME}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$ROOT_DIR/apps/$APP_NAME"

if [ -d "$APP_DIR" ]; then
  echo "Fehler: App '$APP_NAME' existiert bereits unter $APP_DIR"
  exit 1
fi

echo "Erstelle App: $DISPLAY_NAME ($APP_NAME)"
echo "  Farbe:    $PRIMARY_COLOR"
echo "  Rolle:    $DEFAULT_ROLE"
echo "  Port:     $PORT"
echo "  Features: $FEATURES"
echo ""

# Kopiere fintutto als Basis
cp -r "$ROOT_DIR/apps/fintutto" "$APP_DIR"

# Ersetze App-spezifische Werte
if command -v sed &> /dev/null; then
  # package.json
  sed -i "s/@fintutto\/app-fintutto/@fintutto\/app-$APP_NAME/g" "$APP_DIR/package.json"

  # vite.config.ts — Port
  sed -i "s/port: 3100/port: $PORT/g" "$APP_DIR/vite.config.ts"

  # index.html
  sed -i "s/<title>Fintutto<\/title>/<title>$DISPLAY_NAME<\/title>/g" "$APP_DIR/index.html"
  sed -i "s/content=\"#2563eb\"/content=\"$PRIMARY_COLOR\"/g" "$APP_DIR/index.html"

  # manifest.json
  sed -i "s/\"name\": \"Fintutto\"/\"name\": \"$DISPLAY_NAME\"/g" "$APP_DIR/public/manifest.json"
  sed -i "s/\"short_name\": \"Fintutto\"/\"short_name\": \"$DISPLAY_NAME\"/g" "$APP_DIR/public/manifest.json"
  sed -i "s/\"theme_color\": \"#2563eb\"/\"theme_color\": \"$PRIMARY_COLOR\"/g" "$APP_DIR/public/manifest.json"
fi

echo ""
echo "App '$DISPLAY_NAME' erfolgreich erstellt unter: $APP_DIR"
echo ""
echo "Nächste Schritte:"
echo "  1. app-config.ts anpassen (Features, Stripe-Preise, Navigation)"
echo "  2. pnpm install"
echo "  3. cd apps/$APP_NAME && pnpm dev"
