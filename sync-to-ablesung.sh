#!/bin/bash
# Sync-Script: Kopiert Phase A-E Features von fintutto-ecosystem/ablesung/ ins separate ablesung Repo
#
# Verwendung:
#   1. Stelle sicher, dass beide Repos nebeneinander liegen:
#      /path/to/fintutto-ecosystem/
#      /path/to/ablesung/
#   2. Führe dieses Script aus dem fintutto-ecosystem Ordner aus:
#      bash sync-to-ablesung.sh
#   3. Dann im ablesung Ordner: git push -u origin feature/phase-a-to-e-features
#   4. PR erstellen auf GitHub

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ECOSYSTEM_ABLESUNG="$SCRIPT_DIR/ablesung"
TARGET_ABLESUNG="$SCRIPT_DIR/../ablesung"

# Prüfe ob das Ziel-Repo existiert
if [ ! -d "$TARGET_ABLESUNG/.git" ]; then
    echo "❌ Ablesung Repo nicht gefunden unter: $TARGET_ABLESUNG"
    echo "   Bitte klone es: git clone git@github.com:alexanderdeibel-Fintutto/ablesung.git"
    echo "   Das Repo muss neben dem fintutto-ecosystem Ordner liegen."
    exit 1
fi

echo "✅ Ablesung Repo gefunden: $TARGET_ABLESUNG"

# Checkout auf fintutto-ecosystem den richtigen Branch
cd "$ECOSYSTEM_ABLESUNG/.."
echo "📌 Aktueller Branch: $(git branch --show-current)"

# Im Ziel-Repo neuen Branch erstellen
cd "$TARGET_ABLESUNG"
git checkout main
git pull origin main
git checkout -b feature/phase-a-to-e-features 2>/dev/null || git checkout feature/phase-a-to-e-features

echo ""
echo "📁 Kopiere geänderte Dateien..."

# Liste aller geänderten/neuen Dateien
FILES=(
    "src/App.tsx"
    "src/components/dashboard/QuickReadingWidget.tsx"
    "src/components/meters/OCRFeedbackWidget.tsx"
    "src/hooks/useOfflineQueue.tsx"
    "src/pages/BatchScanner.tsx"
    "src/pages/ConsumptionAnalysis.tsx"
    "src/pages/ConsumptionHeatmap.tsx"
    "src/pages/CostCalculation.tsx"
    "src/pages/Dashboard.tsx"
    "src/pages/EnergyChat.tsx"
    "src/pages/EnergyFlow.tsx"
    "src/pages/HeatPumpDashboard.tsx"
    "src/pages/MeterSchedule.tsx"
    "src/pages/ReportBuilder.tsx"
    "src/pages/SavingsSimulator.tsx"
    "src/pages/SmartAlerts.tsx"
    "src/pages/SolarDashboard.tsx"
    "src/pages/TariffManager.tsx"
    "src/pages/UtilityBilling.tsx"
)

for FILE in "${FILES[@]}"; do
    # Erstelle Verzeichnis falls nötig
    mkdir -p "$(dirname "$FILE")"

    # Kopiere Datei
    cp "$ECOSYSTEM_ABLESUNG/$FILE" "$FILE"
    echo "  ✅ $FILE"
done

echo ""
echo "📝 Erstelle Commit..."

git add -A
git commit -m "feat: implement Phase A-E features (36 new features)

Phase A: Quick Wins (10 features)
- ConsumptionForecast, CostForecast, PV Amortisation, Finanz-Cockpit
- 48h Ertragsprognose, BK-Modus, QuickReadingWidget, CostSummary
- YearOverYearComparison, CostBreakdownChart

Phase B: Kernfeatures (9 features)
- TariffManager, HeatPumpDashboard, SmartAlerts, OCRFeedbackWidget
- BatchScanner, MeterSchedule, OfflineQueue, CostCalculation

Phase C: Analyse & KI (10 features)
- ConsumptionHeatmap, SavingsSimulator, EnergyChat (KI-Berater)
- EnergyFlow (Framer Motion), PeakDetection, TariffOptimization

Phase D: Reports & Export (4 features)
- ReportBuilder (6 Sektionen, Print, CSV)

Phase E: Heizkosten (3 features)
- UtilityBilling (HeizkV §7, 4 Verteilschlüssel, PieChart, CSV)"

echo ""
echo "✅ Commit erstellt!"
echo ""
echo "👉 Nächste Schritte:"
echo "   cd $TARGET_ABLESUNG"
echo "   git push -u origin feature/phase-a-to-e-features"
echo "   # Dann PR auf GitHub erstellen"
echo ""
