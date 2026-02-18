#!/bin/bash
# Fintutto AI Integration Script
# Führe dieses Skript im Ordner aus, der alle geklonten Repos enthält

set -e

ECOSYSTEM_APPS="./fintutto-ecosystem/apps"

echo "🚀 Fintutto AI Integration startet..."

# Funktion zum Kopieren und Committen
integrate_app() {
    local repo=$1
    local app_folder=$2
    local layout_file=$3
    local layout_target=$4

    echo "📦 Integriere $repo..."

    if [ -d "$repo" ]; then
        cd "$repo"

        # AI-Ordner erstellen
        mkdir -p src/components/ai

        # GlobalAIChatButton kopieren
        if [ -f "$ECOSYSTEM_APPS/$app_folder/GlobalAIChatButton.tsx" ]; then
            cp "$ECOSYSTEM_APPS/$app_folder/GlobalAIChatButton.tsx" src/components/ai/
        elif [ -f "$ECOSYSTEM_APPS/$app_folder/GlobalAIChatButton.jsx" ]; then
            cp "$ECOSYSTEM_APPS/$app_folder/GlobalAIChatButton.jsx" src/components/ai/
        fi

        # Layout kopieren
        if [ -n "$layout_file" ] && [ -f "$ECOSYSTEM_APPS/$app_folder/$layout_file" ]; then
            cp "$ECOSYSTEM_APPS/$app_folder/$layout_file" "$layout_target"
        fi

        # Git commit und push
        git add -A
        if git diff --staged --quiet; then
            echo "  ✓ Keine Änderungen"
        else
            git commit -m "feat: Add global AI chat assistant

- Integrate GlobalAIChatButton component
- AI assistant available on every page

Powered by Fintutto AI"
            git push origin main || git push origin master
            echo "  ✓ Gepusht!"
        fi

        cd ..
    else
        echo "  ⚠ Repo nicht gefunden: $repo"
    fi
}

# Alle Apps integrieren
integrate_app "ft_vermietify" "vermietify" "Layout.jsx" "src/Layout.jsx"
integrate_app "ft_mieter" "mieterapp" "" ""  # Hat bereits AI
integrate_app "ft_fromulare_alle" "formulare" "Layout.jsx" "src/Layout.jsx"
integrate_app "fintutto-your-financial-compass" "financial-compass" "AppLayout.tsx" "src/components/layout/AppLayout.tsx"
integrate_app "betriebskosten-helfer" "betriebskosten-helfer" "AppLayout.tsx" "src/components/layout/AppLayout.tsx"
integrate_app "fintu-hausmeister-app" "hausmeister" "AppLayout.tsx" "src/components/layout/AppLayout.tsx"
integrate_app "fintutto-miet-recht" "miet-recht" "App.tsx" "src/App.tsx"
integrate_app "fintutto-rent-wizard" "rent-wizard" "App.tsx" "src/App.tsx"
integrate_app "vermieter-freude" "vermieter-freude" "MainLayout.tsx" "src/components/layout/MainLayout.tsx"
integrate_app "wohn-held" "wohn-held" "MobileLayout.tsx" "src/components/layout/MobileLayout.tsx"
integrate_app "leserally-all" "leserally" "AppLayout.tsx" "src/components/layout/AppLayout.tsx"
integrate_app "check-mieterhoehung2-fintutto" "mieterhoehungs-checker" "App.tsx" "src/App.tsx"
integrate_app "mietenplus-rechner" "mietenplus-rechner" "App.tsx" "src/App.tsx"
integrate_app "miet-check-pro" "miet-check-pro" "App.tsx" "src/App.tsx"
integrate_app "fintutto-admin-hub" "admin-hub" "App.tsx" "src/App.tsx"

echo ""
echo "✅ Fertig! Alle Apps haben jetzt KI-Assistenten."
echo ""
echo "Nächster Schritt: ANTHROPIC_API_KEY in Supabase Secrets setzen"
