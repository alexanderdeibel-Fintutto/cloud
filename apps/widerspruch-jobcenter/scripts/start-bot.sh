#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Board-Bot Server – Autostart-Script für macOS
# Startet den Express-Server (Bot + API) im Hintergrund
# ══════════════════════════════════════════════════════════════

# Pfade anpassen falls nötig
export PATH="$HOME/.local/share/pnpm:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

PROJECT_DIR="$HOME/fintutto-ecosystem/apps/widerspruch-jobcenter"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

cd "$PROJECT_DIR" || exit 1

echo "[$(date)] Board-Bot Server startet..." >> "$LOG_DIR/bot.log"

# Server starten (nur Backend, kein Vite-Frontend nötig für Bot-Betrieb)
exec pnpm dev:server >> "$LOG_DIR/bot.log" 2>&1
