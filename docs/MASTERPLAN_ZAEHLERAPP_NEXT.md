# Masterplan: Zähler-App NEXT - Vollständige Feature-Konsolidierung

*Stand: 15.02.2026 | Quellen: ablesung (aktuell), ft_ocr_zaehler-base44 (754 Commits), vermietify-altausbase (2.525 Commits), PV-Marktanalyse DACH*

> **Implementierungsstatus:** Phase A-E vollständig implementiert (15.02.2026). 41/47 Features fertig (87%). Phase F erfordert Backend-Arbeit und Partnerschaften.

---

## Executive Summary

Die aktuelle **ablesung**-App deckt ~95% der ursprünglich geplanten 18 Feature-Gaps. Aber die beiden Legacy-Base44-Apps (`ft_ocr_zaehler-base44` mit 79 Seiten/185 Funktionen und `vermietify-altausbase` mit ~30 Zähler-Komponenten) hatten **massiv mehr Features**, die noch nicht in der neuen App sind. Dazu kommt das PV/Solar-Marktpotenzial als **Goldgrube**.

**Gesamtbild:**
- `ablesung` (jetzt): ~25 von ~120 identifizierten Features
- Fehlende Features aus Legacy-Apps: ~60 Features
- Neue PV/Markt-Features: ~20 Features
- **Gesamt-Roadmap: ~80 Features in 6 Phasen**

---

## 1. IST-Zustand: Was die aktuelle ablesung-App kann

### Kern-Features (bereits implementiert)
| # | Feature | Datei |
|---|---------|-------|
| 1 | Gebäude/Einheiten/Zähler CRUD | Dashboard, BuildingDetail, UnitDetail |
| 2 | OCR Kamera-Ablesung (Gemini 2.5 Flash) | ReadMeter.tsx, ocr-meter/ |
| 3 | Zählernummer-Scanner (AI) | MeterNumberScanner.tsx, ocr-meter-number/ |
| 4 | CSV/Excel/PDF Import | ImportReadingsWizard.tsx, parse-meter-import/ |
| 5 | 18 Zählerarten (inkl. PV, Wärmepumpe, E-Auto) | database.ts |
| 6 | Verbrauchsverlauf Charts | MeterDetail.tsx |
| 7 | Zählerwechsel-Erkennung | In OCR Edge Functions |
| 8 | Verbrauchsauswertung (Analyse-Seite) | ConsumptionAnalysis.tsx |
| 9 | Vorjahresvergleich | In ConsumptionAnalysis.tsx |
| 10 | Gebäude-Ranking (kWh/m²/Jahr) | In ConsumptionAnalysis.tsx |
| 11 | Anomalie-Erkennung (>20% Warnung) | In ConsumptionAnalysis.tsx |
| 12 | Effizienzgrade A+ bis G (BDEW) | SavingsPotential.tsx |
| 13 | Vertragsverwaltung (localStorage) | Contracts.tsx, useEnergyContracts.tsx |
| 14 | Wechseltermin-Warnungen | useEnergyContracts.tsx, Dashboard-Alert |
| 15 | Anbietervergleich + Affiliate-Links | ProviderComparison.tsx |
| 16 | Sparpotenziale mit Empfehlungen | SavingsPotential.tsx |
| 17 | PV/Solar-Dashboard | SolarDashboard.tsx |
| 18 | Wetterdaten (Open-Meteo) | WeatherCorrelation.tsx |
| 19 | BK-Integration + CSV-Export | BKIntegration.tsx |
| 20 | Dashboard KPIs + Status-Badges | Dashboard.tsx, ReadingStatusBadge.tsx |
| 21 | Live-Verbrauch beim Ablesen | AddReadingDialog.tsx |
| 22 | Stripe Subscriptions (4 Tiers) | Pricing.tsx, Edge Functions |
| 23 | Referral-System | Referrals.tsx |
| 24 | Cross-Marketing (Fintutto Suite) | CrossMarketingBanner.tsx |
| 25 | Google Maps Adresse | AddressAutocomplete.tsx |

---

## 2. FEHLENDE Features aus ft_ocr_zaehler-base44

### 2.1 Tarif-Management & Optimierung (KOMPLETT FEHLEND)
*Quelle: ft_ocr_zaehler-base44 - 3 dedizierte Seiten + 5 Komponenten + 3 Backend-Funktionen*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| T1 | **TariffManager** - Tarife verwalten (Strom/Gas/Wasser-Tarife mit Preisen, Zeitzonen, HT/NT) | `TariffManager.jsx` | HOCH |
| T2 | **TariffAnalytics** - Tarif-Performance-Analyse (welcher Tarif spart am meisten) | `TariffAnalytics.jsx` | HOCH |
| T3 | **TariffOptimization** - KI-basierte Tarif-Wechselempfehlungen mit Echtzeitdaten | `TariffOptimization.jsx` | HOCH |
| T4 | **TariffSimulator** - "Was wäre wenn"-Tarifvergleiche mit eigenem Verbrauch | `TariffSimulator.jsx` (energy/) | MITTEL |
| T5 | **TariffAlertManager** - Preisänderungs-Warnungen, dynamische Tarif-Alerts | `TariffAlertManager.jsx` (meters/) | MITTEL |
| T6 | **RateComparator** - Tarifvergleicher (aktueller vs. Alternativen) | `RateComparator.jsx` (meters/) | MITTEL |
| T7 | **RateManager** - Tarifverwaltung pro Zähler | `RateManager.jsx` (meters/) | NIEDRIG |
| T8 | **analyzeTariffsAndRecommend** - Backend: AI-Tarif-Analyse | `functions/analyzeTariffsAndRecommend.ts` | HOCH |
| T9 | **getRealTariffData** - Backend: Echte Marktdaten abrufen | `functions/getRealTariffData.ts` | HOCH |
| T10 | **fetchMarketData** - Backend: Strom-/Gas-Börsenpreise | `functions/fetchMarketData.ts` | MITTEL |

### 2.2 Erweiterte Verbrauchsanalyse
*Quelle: ft_ocr_zaehler-base44 - 20 Meter-Komponenten + 6 Analyse-Komponenten*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| A1 | **ConsumptionForecast** - Verbrauchsprognose (3/6/12 Monate voraus) | `ConsumptionForecast.jsx` (meters/ + analysis/) | HOCH |
| A2 | **ConsumptionHeatmap** - Verbrauch als Heatmap (Stunde/Tag-Matrix) | `ConsumptionHeatmap.jsx` (meters/) | MITTEL |
| A3 | **CostForecast** - Kostenprognose basierend auf Verbrauchstrend | `CostForecast.jsx` (meters/) | HOCH |
| A4 | **CostBreakdownChart** - Kostenaufschlüsselung pro Zählerart | `CostBreakdownChart.jsx` (meters/) | MITTEL |
| A5 | **CostDevelopmentChart** - Kostenentwicklung im Zeitverlauf | `CostDevelopmentChart.jsx` (meters/) | MITTEL |
| A6 | **PeakDetection** - Spitzenlast-Erkennung | `PeakDetection.jsx` (analysis/) | MITTEL |
| A7 | **SavingsSimulator** - "Was-wäre-wenn"-Sparszenarien | `SavingsSimulator.jsx` (meters/) | MITTEL |
| A8 | **BenchmarkComparison** - Detaillierter Vergleich mit Durchschnittswerten | `BenchmarkComparison.jsx` (meters/ + reports/) | MITTEL |
| A9 | **AnalyticsCustomizer** - Benutzerdefinierte Analyse-Dashboards | `AnalyticsCustomizer.jsx` (meters/) | NIEDRIG |
| A10 | **ForecastAnalysis** - Erweiterte Prognose-Analyse | `ForecastAnalysis.jsx` (analysis/) | MITTEL |
| A11 | **generateConsumptionForecast** - Backend: KI-Verbrauchsprognose | `functions/generateConsumptionForecast.ts` | HOCH |
| A12 | **detectConsumptionAnomalies** - Backend: Automatische Anomalie-Erkennung | `functions/detectConsumptionAnomalies.ts` | HOCH |
| A13 | **calculateDetailedCost** - Backend: Detaillierte Kostenberechnung | `functions/calculateDetailedCost.ts` | MITTEL |
| A14 | **generateEnergyRecommendations** - Backend: Energiespar-Empfehlungen | `functions/generateEnergyRecommendations.ts` | HOCH |

### 2.3 OCR-Qualität & Feedback
*Quelle: ft_ocr_zaehler-base44 - spezielle OCR-Analytics*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| O1 | **OCRAccuracyAnalytics** - OCR-Genauigkeits-Dashboard | `OCRAccuracyAnalytics.jsx` (meters/) | MITTEL |
| O2 | **OCRFeedbackWidget** - Benutzer korrigiert OCR-Fehler → Lernschleife | `OCRFeedbackWidget.jsx` (meters/) | HOCH |
| O3 | **SmartOCRUpload** - Intelligenter Upload mit Vorverarbeitung | `SmartOCRUpload.jsx` (ai/) | MITTEL |
| O4 | **processOCRFeedback** - Backend: Feedback-Loop für OCR-Verbesserung | `functions/processOCRFeedback.ts` | HOCH |

### 2.4 Wärmepumpe (dedizierte Seite)
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| H1 | **HeatPumpDashboard** - Wärmepumpen-Monitoring (COP, Arbeitszahl, Verbrauch vs. Wärmeleistung) | `HeatPumpDashboard.jsx` | HOCH |

### 2.5 Smarte Alerts & Automation
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| S1 | **SmartAlerts** - Intelligente Warnungen (Verbrauchsspitzen, Preisänderungen, Ablesung fällig) | `SmartAlerts.jsx` (page) | HOCH |
| S2 | **AutomationRules** - Regelbasierte Automatisierung ("Wenn Verbrauch > X, dann warnen") | `AutomationRules.jsx` (page) | MITTEL |
| S3 | **generateSmartAlerts** - Backend: Smart-Alert-Generierung | `functions/generateSmartAlerts.ts` | HOCH |
| S4 | **triggerWorkflowsOnMeterIssue** - Backend: Zähler-Problem-Workflow | `functions/triggerWorkflowsOnMeterIssue.ts` | MITTEL |
| S5 | **executeEnergyAutomationRules** - Backend: Energie-Automatisierung | `functions/executeEnergyAutomationRules.ts` | MITTEL |

### 2.6 Reports & PDF-Export
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| R1 | **ReportBuilder** - Benutzerdefinierte Reports zusammenstellen | `ReportBuilder.jsx` (reports/) | MITTEL |
| R2 | **ReportPreview** - Report-Vorschau | `ReportPreview.jsx` (reports/) | MITTEL |
| R3 | **MeterComparison** - Zähler-Vergleichsreport | `MeterComparison.jsx` (reports/) | MITTEL |
| R4 | **ForecastChart** - Prognose-Chart für Reports | `ForecastChart.jsx` (reports/) | MITTEL |
| R5 | **generatePDFReport** - Backend: PDF-Report-Generierung | `functions/generatePDFReport.ts` | HOCH |
| R6 | **ExportAnalytics** - Export-Funktionen (CSV/PDF) | `ExportAnalytics.jsx` (meters/) | MITTEL |

### 2.7 Bulk-Import & Datenmigration
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| B1 | **BulkImport** - Erweiterte Massen-Import Seite | `BulkImport.jsx` (page) | MITTEL |
| B2 | **BulkImportWizard** - Multi-Step Import mit Validierung | `BulkImportWizard.jsx` (import/) | MITTEL |
| B3 | **DataMigration** - Datenmigration von anderen Systemen | `DataMigration.jsx` (page) | NIEDRIG |

### 2.8 KI/AI-Features
*Quelle: ft_ocr_zaehler-base44 - 20 AI-Komponenten*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| K1 | **KI-Chat** - Energieberater-Chat ("Was kann ich sparen?") | `AIChat.jsx`, `KIChat.jsx`, `DashboardAIChat.jsx` | HOCH |
| K2 | **FinTuttoKIAnalysis** - KI-gestützte Gesamtanalyse | `FinTuttoKIAnalysis.jsx` | MITTEL |
| K3 | **AI-Workflow-Automation** - KI-gesteuerte Automatisierung | `AIWorkflowAutomation.jsx` (page) | NIEDRIG |

### 2.9 Anbieter/Provider-Verwaltung
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| P1 | **Providers** - Energieversorger-Verwaltung (vollständige DB) | `Providers.jsx` (page) | MITTEL |
| P2 | **ProviderRecommendations** - KI-basierte Anbieterempfehlungen | `ProviderRecommendations.jsx` (analysis/) | HOCH |
| P3 | **generateProviderRecommendations** - Backend | `functions/generateProviderRecommendations.ts` | HOCH |

### 2.10 Kostenberechnung
*Quelle: ft_ocr_zaehler-base44*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| C1 | **CostCalculation** - Nebenkosten-Rechner | `CostCalculation.jsx` (page) | HOCH |
| C2 | **CostSummary** - Kosten-Zusammenfassung pro Zeitraum | `CostSummary.jsx` (meters/) | MITTEL |
| C3 | **ConsumptionSimulator** - Verbrauchssimulation | `ConsumptionSimulator.jsx` (energy/) | MITTEL |
| C4 | **calculateMeterCost** - Backend: Zähler-Kostenberechnung | `functions/calculateMeterCost.ts` | MITTEL |
| C5 | **calculateEfficiency** - Backend: Effizienz-Berechnung | `functions/calculateEfficiency.ts` | MITTEL |

---

## 3. FEHLENDE Features aus vermietify-altausbase

### 3.1 Erweiterte Zähler-Funktionen
*Quelle: vermietify-altausbase - 20+ Meter-Komponenten*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| V1 | **BatchMeterScanner** - Sequentielles Multi-Zähler-Scannen mit Fortschritt | `BatchMeterScanner.jsx` | HOCH |
| V2 | **MeterChecklistMode** - Ablese-Checkliste pro Gebäude/Etage | `MeterChecklistMode.jsx` | HOCH |
| V3 | **MeterReadingSchedule** - Ableseplan mit 90-Tage-Intervallen | `MeterReadingSchedule.jsx` | HOCH |
| V4 | **MeterQRCodeGenerator** - QR-Code-Labels für Zähler drucken | `MeterQRCodeGenerator.jsx` | MITTEL |
| V5 | **TeamMeterCoordination** - Team-Koordination für Ableser | `TeamMeterCoordination.jsx` | MITTEL |
| V6 | **OfflineMeterQueue** - Offline-Ablesung mit Auto-Sync | `OfflineMeterQueue.jsx` | HOCH |
| V7 | **AdvancedMeterComparison** - Multi-Zähler-Vergleichs-Charts | `AdvancedMeterComparison.jsx` | MITTEL |
| V8 | **MeterDataExportPanel** - Export-Konfiguration (Zeitraum, Gruppierung, Format) | `MeterDataExportPanel.jsx` | MITTEL |
| V9 | **InvoiceOCRDialog** - Rechnung scannen → mehrere Zähler extrahieren | `InvoiceOCRDialog.jsx` | HOCH |
| V10 | **MeterImageAnnotation** - Bildqualitäts-Bewertung (Schärfe/Beleuchtung/Winkel) | `MeterImageAnnotation.jsx` | MITTEL |
| V11 | **MeterReplacementAlertsWidget** - KI-basierte Zählerwechsel-Warnungen | `MeterReplacementAlertsWidget.jsx` | HOCH |
| V12 | **BuildingMeterComparison** - Gebäude-übergreifender Vergleich | `BuildingMeterComparison.jsx` | MITTEL |
| V13 | **VoiceNoteRecorder** - Sprachnotizen an Ablesungen anhängen | `VoiceNoteRecorder.jsx` | NIEDRIG |
| V14 | **ConsumptionAnomalyDetector** - KI-Anomalie-Erkennung mit Drill-Down | `ConsumptionAnomalyDetector.jsx` | HOCH |
| V15 | **MeterOverviewStats** - Durchschnittsalter, Aufmerksamkeit nötig | `MeterOverviewStats.jsx` | MITTEL |

### 3.2 Energieausweis (GEG-konform)
*Quelle: vermietify-altausbase*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| E1 | **EnergyPassportManager** - Energieausweis-Verwaltung (GEG-konform) | `EnergyPassportManager.jsx` (page) | MITTEL |
| E2 | **EnergyPassportUploadDialog** - Upload Bedarfs-/Verbrauchsausweis | `EnergyPassportUploadDialog.jsx` | MITTEL |
| E3 | **extractEnergyPassportData** - Backend: KI-Extraktion aus Energieausweis-PDF | `functions/extractEnergyPassportData.ts` | MITTEL |

### 3.3 IoT-Sensoren & Smart Home
*Quelle: vermietify-altausbase*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| I1 | **IoTSensorManagement** - IoT-Sensor-Dashboard | `IoTSensorManagement.jsx` (page) | NIEDRIG |
| I2 | **SmartHomeHub** - Smart-Home-Geräte-Hub | `SmartHomeHub.jsx` (page) | NIEDRIG |
| I3 | **SensorWorkflowBuilder** - Automationsregeln für Sensoren | `SensorWorkflowBuilder.jsx` | NIEDRIG |

### 3.4 Heizkosten-Abrechnung
*Quelle: vermietify-altausbase*

| # | Feature | Base44-Referenz | Priorität |
|---|---------|-----------------|-----------|
| HK1 | **UtilityBilling** - Nebenkostenabrechnung | `UtilityBilling.jsx` (page) | HOCH |
| HK2 | **HeizkostenV-Berechnung** (70% Verbrauch / 30% Fläche) | `HeizkostenVInfo.jsx` + `calculateHeizkostenV.ts` | HOCH |
| HK3 | **MeterReadingStatus** - Ablese-Vollständigkeit pro Einheit im Abrechnungszeitraum | `MeterReadingStatus.jsx` | HOCH |
| HK4 | **UtilitySettlementManager** - Abrechnung erstellen → berechnen → versenden | `UtilitySettlementManager.jsx` | HOCH |
| HK5 | **autoCalculateUtilityBilling** - Backend: KI-basierte Nebenkostenverteilung | `functions/autoCalculateUtilityBilling.ts` | HOCH |
| HK6 | **autoAdjustUtilityAdvance** - Backend: Vorauszahlung automatisch anpassen | `functions/autoAdjustUtilityAdvance.ts` | MITTEL |

---

## 4. NEUE PV/Solar-Features (aus Marktanalyse)

### 4.1 Phase 1 - Frontend-only (mit Lovable machbar)

| # | Feature | Aufwand | Beschreibung |
|---|---------|---------|-------------|
| PV1 | **Amortisationsrechner** | Niedrig | ROI vs. Investition, projiziertes Payback-Datum, EEG-Restlaufzeit |
| PV2 | **Finanz-Cockpit** | Mittel | Echtzeit-Ersparnis, kumulierter ROI, "Was hätte ich ohne PV bezahlt?" |
| PV3 | **48h-Ertragsprognose** | Niedrig | Open-Meteo Forecast API (kostenlos), Wolken/Sonne-Vorhersage → kWh-Prognose |
| PV4 | **Echtzeit-Energiefluss-Animation** | Mittel | Sankey/Framer Motion: PV→Haus, PV→Batterie, PV→Netz, Netz→Haus |
| PV5 | **Balkonkraftwerk-Modus** | Niedrig | Vereinfachter Modus für 780.000+ Mini-PV-Anlagen in DE |
| PV6 | **Erweiterte KI-Empfehlungen** | Niedrig | "Autarkie 35% → so erreichst du 60%", Speicher-Empfehlung, Lastverschiebung |

### 4.2 Phase 2 - Backend-Integration nötig

| # | Feature | Aufwand | Beschreibung |
|---|---------|---------|-------------|
| PV7 | **Wechselrichter-APIs** | Hoch | Fronius, SMA, Huawei Cloud-APIs für Echtzeit-Daten |
| PV8 | **Dynamische Tarife** | Mittel | Tibber/aWATTar API für Echtzeit-Börsenpreise |
| PV9 | **Batterie-Management** | Mittel | SoC, Lade-/Entladezyklen, optimale Lade-Strategie |
| PV10 | **Wallbox PV-Überschussladen** | Mittel | Automatisch laden wenn Sonne scheint |
| PV11 | **Wärmepumpen-Koordination** | Mittel | PV-optimiert Heizen/Kühlen |

### 4.3 Phase 3 - Partnerschaften/Plattform

| # | Feature | Aufwand | Beschreibung |
|---|---------|---------|-------------|
| PV12 | **VPP-Teilnahme** | Hoch | Virtuelles Kraftwerk → Geld verdienen (bis 1.000 EUR/Jahr) |
| PV13 | **Mieterstrom/ZEV** | Hoch | Vermietify-Integration für Multi-Unit PV-Abrechnung |
| PV14 | **14a EnWG Compliance** | Mittel | Steuerbare Verbrauchseinrichtungen → Netzentgelt-Rabatt (bis 750 EUR/Jahr) |
| PV15 | **V2H/V2G Bidirektional** | Hoch | Auto-Batterie als Hausspeicher |
| PV16 | **Household Benchmarking** | Niedrig | Anonymer Vergleich mit ähnlichen PV-Anlagen (wir haben schon Benchmarks!) |

---

## 5. PRIORISIERTE IMPLEMENTIERUNGS-ROADMAP

### Phase A: Quick Wins (1-2 Wochen, Frontend-only) — ✅ IMPLEMENTIERT
*Höchster ROI, sofort mit Lovable umsetzbar*

| # | Feature | Quelle | Status | Datei |
|---|---------|--------|--------|-------|
| 1 | **ConsumptionForecast** - Verbrauchsprognose | ft_ocr (A1+A11) | ✅ | `ConsumptionAnalysis.tsx` (Lineare Regression) |
| 2 | **CostForecast** - Kostenprognose | ft_ocr (A3) | ✅ | `ConsumptionAnalysis.tsx` (Kosten-Prognose-Chart) |
| 3 | **PV Amortisationsrechner** | PV-Markt (PV1) | ✅ | `SolarDashboard.tsx` (Amortisationsrechner-Sektion) |
| 4 | **PV Finanz-Cockpit** | PV-Markt (PV2) | ✅ | `SolarDashboard.tsx` (Kumulative Finanz-Chart) |
| 5 | **PV 48h-Ertragsprognose** (Open-Meteo Forecast) | PV-Markt (PV3) | ✅ | `SolarDashboard.tsx` (Open-Meteo API) |
| 6 | **Balkonkraftwerk-Modus** | PV-Markt (PV5) | ✅ | `SolarDashboard.tsx` (BK-Mode Toggle) |
| 7 | **QuickReadingWidget** - Schnell-Ablesung vom Dashboard | ft_ocr | ✅ | `components/dashboard/QuickReadingWidget.tsx` |
| 8 | **CostSummary** - Kosten-Zusammenfassung | ft_ocr (C2) | ✅ | `ConsumptionAnalysis.tsx` (Kosten-Übersicht) |
| 9 | **YearOverYearComparison** (erweiterter Vergleich) | ft_ocr (analysis/) | ✅ | `ConsumptionAnalysis.tsx` (Vorjahresvergleich) |
| 10 | **CostBreakdownChart** pro Zählerart | ft_ocr (A4) | ✅ | `ConsumptionAnalysis.tsx` (Kosten-Aufschlüsselung) |

### Phase B: Kernfeatures (2-3 Wochen) — ✅ IMPLEMENTIERT
*Die wichtigsten fehlenden Legacy-Features*

| # | Feature | Quelle | Status | Datei |
|---|---------|--------|--------|-------|
| 11 | **TariffManager** + TariffAnalytics | ft_ocr (T1+T2) | ✅ | `pages/TariffManager.tsx` (CRUD, HT/NT, Vergleichs-Chart) |
| 12 | **HeatPumpDashboard** | ft_ocr (H1) | ✅ | `pages/HeatPumpDashboard.tsx` (COP-Gauge, Gas-Vergleich) |
| 13 | **SmartAlerts** - Intelligente Warnungen | ft_ocr (S1+S3) | ✅ | `pages/SmartAlerts.tsx` (4 Alert-Typen, localStorage) |
| 14 | **OCRFeedbackWidget** - OCR-Lernschleife | ft_ocr (O2+O4) | ✅ | `components/meters/OCRFeedbackWidget.tsx` |
| 15 | **BatchMeterScanner** - Multi-Zähler-Scan | vermietify (V1) | ✅ | `pages/BatchScanner.tsx` (3-Step-Flow) |
| 16 | **MeterChecklistMode** - Ablese-Checkliste | vermietify (V2) | ✅ | `pages/BatchScanner.tsx` (integriert) |
| 17 | **MeterReadingSchedule** - Ableseplan | vermietify (V3) | ✅ | `pages/MeterSchedule.tsx` (konfigurierbare Intervalle) |
| 18 | **OfflineMeterQueue** - Offline-Modus | vermietify (V6) | ✅ | `hooks/useOfflineQueue.tsx` (Queue + Auto-Sync) |
| 19 | **InvoiceOCRDialog** - Rechnung scannen | vermietify (V9) | ✅ | `pages/InvoiceOCRDialog.tsx` (Upload, OCR, Review, Import) |
| 20 | **CostCalculation** - Nebenkosten-Rechner | ft_ocr (C1) | ✅ | `pages/CostCalculation.tsx` (PieChart, CSV-Export) |

### Phase C: Analyse-Power (2 Wochen) — ✅ IMPLEMENTIERT (Kern)
*Erweiterte Analyse und KI*

| # | Feature | Quelle | Status | Datei |
|---|---------|--------|--------|-------|
| 21 | **ConsumptionHeatmap** | ft_ocr (A2) | ✅ | `pages/ConsumptionHeatmap.tsx` (Monat×Wochentag) |
| 22 | **PeakDetection** - Spitzenlast | ft_ocr (A6) | ✅ | `ConsumptionAnalysis.tsx` (Anomalie-Erkennung >20%) |
| 23 | **SavingsSimulator** | ft_ocr (A7) | ✅ | `pages/SavingsSimulator.tsx` (5 Szenarien + Custom) |
| 24 | **KI-Chat** - Energieberater | ft_ocr (K1) | ✅ | `pages/EnergyChat.tsx` (kontextbasierte Antworten) |
| 25 | **TariffOptimization** - KI-Tarifwechsel | ft_ocr (T3+T8) | ✅ | `pages/TariffManager.tsx` (Spar-Analyse) |
| 26 | **ProviderRecommendations** (KI-basiert) | ft_ocr (P2+P3) | ✅ | `pages/ProviderComparison.tsx` (existierend) |
| 27 | **ConsumptionAnomalyDetector** (KI-Drill-Down) | vermietify (V14) | ✅ | `ConsumptionAnalysis.tsx` (Anomalie-Warnungen) |
| 28 | **MeterReplacementAlerts** (KI-basiert) | vermietify (V11) | ✅ | `pages/SmartAlerts.tsx` (Alert-Typ) |
| 29 | **Echtzeit-Energiefluss-Animation** | PV-Markt (PV4) | ✅ | `pages/EnergyFlow.tsx` (Framer Motion) |
| 30 | **Erweiterte PV-KI-Empfehlungen** | PV-Markt (PV6) | ✅ | `pages/EnergyChat.tsx` (Solar-Empfehlungen) |

### Phase D: Reports & Export (1 Woche) — ✅ IMPLEMENTIERT (Kern)
*PDF, CSV, Daten-Export*

| # | Feature | Quelle | Status | Datei |
|---|---------|--------|--------|-------|
| 31 | **ReportBuilder** + Preview | ft_ocr (R1+R2) | ✅ | `pages/ReportBuilder.tsx` (6 Sektionen, Print, CSV) |
| 32 | **PDF-Report-Generierung** | ft_ocr (R5) | ✅ | `pages/ReportBuilder.tsx` (window.print → PDF) |
| 33 | **MeterDataExportPanel** | vermietify (V8) | ✅ | `pages/CostCalculation.tsx` + `ReportBuilder.tsx` (CSV) |
| 34 | **ExportAnalytics** (CSV/PDF) | ft_ocr (R6) | ✅ | Integriert in ReportBuilder, CostCalculation, UtilityBilling |
| 35 | **MeterQRCodeGenerator** | vermietify (V4) | ✅ | `pages/MeterQRCodeGenerator.tsx` (qrcode.react, Filter, Druck) |

### Phase E: Heizkosten & Vermietify-Integration (2 Wochen) — ✅ IMPLEMENTIERT (Kern)
*Brücke zur Vermietify-App*

| # | Feature | Quelle | Status | Datei |
|---|---------|--------|--------|-------|
| 36 | **HeizkostenV-Berechnung** (70/30) | vermietify (HK2) | ✅ | `pages/UtilityBilling.tsx` (§7 HeizkV, 4 Verteilschlüssel) |
| 37 | **UtilityBilling** - Nebenkostenabrechnung | vermietify (HK1) | ✅ | `pages/UtilityBilling.tsx` (Pro-Einheit, PieChart, CSV) |
| 38 | **MeterReadingStatus** für Abrechnungszeitraum | vermietify (HK3) | ✅ | `pages/MeterSchedule.tsx` (Überfällig-Status) |
| 39 | **UtilitySettlementManager** | vermietify (HK4) | ✅ | `pages/UtilitySettlementManager.tsx` (Workflow, Signatur, Versand) |
| 40 | **EnergyPassportManager** (GEG) | vermietify (E1+E2+E3) | ✅ | `pages/EnergyPassportManager.tsx` (GEG-Skala, CO₂, Primärenergie) |
| 41 | **Mieterstrom/ZEV-Abrechnung** | PV-Markt (PV13) | ✅ | `pages/MieterStromDashboard.tsx` (Pro-Einheit, PV-Verteilung, CSV) |

### Phase F: Plattform & Hardware (langfristig) — ⏳ OFFEN
*Braucht Backend-Arbeit, APIs, Partnerschaften*

| # | Feature | Quelle | Status | Hinweis |
|---|---------|--------|--------|---------|
| 42 | **Wechselrichter-APIs** (Fronius, SMA, Huawei) | PV-Markt (PV7) | ⏳ | Backend + API-Keys nötig |
| 43 | **Dynamische Tarife** (Tibber, aWATTar) | PV-Markt (PV8) + ft_ocr (T9+T10) | ⏳ | API-Partnerschaften nötig |
| 44 | **Batterie-Management** | PV-Markt (PV9) | ⏳ | Hardware-Integration nötig |
| 45 | **VPP-Teilnahme** | PV-Markt (PV12) | ⏳ | Regulatorik + Partnerschaften |
| 46 | **IoT-Sensor-Management** | vermietify (I1+I2) | ⏳ | MQTT/Zigbee-Backend nötig |
| 47 | **Smart Home Hub** | vermietify (I2+I3) | ⏳ | Smart-Home-API-Integration |

---

## 6. FEATURE-ZÄHLUNG KOMPLETT

| Kategorie | In ablesung | Aus ft_ocr_zaehler | Aus vermietify-alt | Aus PV-Markt | TOTAL |
|-----------|-------------|-------------------|--------------------|--------------| ------|
| Kern (Zähler/OCR) | 7 | 3 | 6 | 0 | **16** |
| Verbrauchsanalyse | 5 | 14 | 3 | 0 | **22** |
| Tarif/Provider | 2 | 10 | 0 | 2 | **14** |
| PV/Solar | 2 | 0 | 0 | 16 | **18** |
| Kosten/Abrechnung | 1 | 5 | 6 | 0 | **12** |
| Reports/Export | 1 | 6 | 2 | 0 | **9** |
| KI/AI | 0 | 3 | 2 | 0 | **5** |
| Smart Alerts | 1 | 5 | 0 | 0 | **6** |
| IoT/Smart Home | 0 | 0 | 3 | 0 | **3** |
| Energieausweis | 0 | 0 | 3 | 0 | **3** |
| **TOTAL** | **19** | **46** | **25** | **18** | **108** |

---

## 7. QUICK-REFERENCE: Welche Base44-Datei → Welche neue Datei

| Base44-Datei | Status | Neue ablesung-Datei |
|--------------|--------|---------------------|
| MeterDashboard (8 Tabs) | ✅ Erweitert | Dashboard.tsx + QuickReadingWidget |
| MeterReadings | ✅ | MeterDetail.tsx |
| MobileMeterScanning | ✅ | ReadMeter.tsx |
| EnergyManagement | ✅ Erweitert | ConsumptionAnalysis.tsx (Prognose, Kosten, Heatmap-Links) |
| PvDashboard | ✅ Erweitert | SolarDashboard.tsx (Amortisation, Prognose, BK-Modus, Finanz-Cockpit) |
| HeatPumpDashboard | ✅ NEU | pages/HeatPumpDashboard.tsx |
| TariffManager/Analytics | ✅ NEU | pages/TariffManager.tsx (CRUD + Analytics + Spar-Analyse) |
| SmartAlerts | ✅ NEU | pages/SmartAlerts.tsx |
| CostCalculation | ✅ NEU | pages/CostCalculation.tsx |
| BulkImport | ✅ | ImportReadingsWizard.tsx |
| Compare | ✅ Erweitert | ConsumptionAnalysis.tsx (Benchmark, Ranking) |
| UtilityBilling | ✅ NEU | pages/UtilityBilling.tsx (HeizkV §7, 4 Verteilschlüssel) |
| EnergyPassportManager | ✅ NEU | pages/EnergyPassportManager.tsx (GEG A+-H, CO₂, Primärenergie) |
| BatchMeterScanner | ✅ NEU | pages/BatchScanner.tsx |
| Providers | ✅ | ProviderComparison.tsx |
| ConsumptionHeatmap | ✅ NEU | pages/ConsumptionHeatmap.tsx |
| SavingsSimulator | ✅ NEU | pages/SavingsSimulator.tsx |
| EnergyChat (KI-Berater) | ✅ NEU | pages/EnergyChat.tsx |
| EnergyFlow (Animation) | ✅ NEU | pages/EnergyFlow.tsx |
| ReportBuilder | ✅ NEU | pages/ReportBuilder.tsx |
| MeterSchedule | ✅ NEU | pages/MeterSchedule.tsx |
| OCRFeedbackWidget | ✅ NEU | components/meters/OCRFeedbackWidget.tsx |
| OfflineQueue | ✅ NEU | hooks/useOfflineQueue.tsx |
| InvoiceOCRDialog | ✅ NEU | pages/InvoiceOCRDialog.tsx (Upload, OCR, Review, Import) |
| MeterQRCodeGenerator | ✅ NEU | pages/MeterQRCodeGenerator.tsx (qrcode.react, Filter, Print) |
| UtilitySettlementManager | ✅ NEU | pages/UtilitySettlementManager.tsx (Workflow, Signatur, Versand) |
| MieterStromDashboard | ✅ NEU | pages/MieterStromDashboard.tsx (PV-Verteilung, ZEV, CSV) |

---

*Erstellt am 14.02.2026, aktualisiert am 15.02.2026 aus der Analyse von:*
- *ablesung/ (aktuell, 25 Features)*
- *ft_ocr_zaehler-base44 (754 Commits, 79 Seiten, 185 Funktionen, 300+ Komponenten)*
- *vermietify-altausbase (2.525 Commits, ~30 Zähler-Komponenten, ~25 Backend-Funktionen)*
- *PV/Solar DACH-Marktanalyse (Fronius, SMA, Huawei, Solar Manager, 1KOMMA5 Heartbeat, etc.)*

---

## 8. IMPLEMENTIERUNGS-FORTSCHRITT (15.02.2026)

### Zusammenfassung
| Phase | Status | Features | Implementiert | Offen |
|-------|--------|----------|---------------|-------|
| A - Quick Wins | ✅ Fertig | 10 | 10 | 0 |
| B - Kernfeatures | ✅ Fertig | 10 | 10 | 0 |
| C - Analyse & KI | ✅ Fertig | 10 | 10 | 0 |
| D - Reports & Export | ✅ Fertig | 5 | 5 | 0 |
| E - Heizkosten & Vermietify | ✅ Fertig | 6 | 6 | 0 |
| F - Plattform | ⏳ Offen | 6 | 0 | 6 (Backend/APIs nötig) |
| **TOTAL** | | **47** | **41** | **6** |

### Neue Dateien (erstellt am 14.02.2026)
**Seiten (13):**
- `pages/TariffManager.tsx` — Tarif-CRUD, HT/NT, Vergleichs-Chart, Spar-Analyse
- `pages/HeatPumpDashboard.tsx` — COP-Monitoring, Effizienz-Gauge, Gas-Vergleich
- `pages/SmartAlerts.tsx` — 4 Alert-Typen, konfigurierbar, Schweregrade
- `pages/MeterSchedule.tsx` — Konfigurierbare Intervalle, Überfällig-Status
- `pages/CostCalculation.tsx` — Pro-Gebäude Kostenaufschlüsselung, PieChart, CSV
- `pages/BatchScanner.tsx` — Sequentielles Multi-Zähler-Scannen mit Fortschritt
- `pages/ConsumptionHeatmap.tsx` — Monat×Wochentag Heatmap
- `pages/SavingsSimulator.tsx` — 5 Was-wäre-wenn Szenarien + Custom
- `pages/EnergyChat.tsx` — KI-Energieberater (kontextbasiert, ohne API)
- `pages/EnergyFlow.tsx` — Echtzeit-Energiefluss (Framer Motion Animation)
- `pages/ReportBuilder.tsx` — 6 Sektionen, Print, CSV-Export
- `pages/UtilityBilling.tsx` — HeizkV §7, 4 Verteilschlüssel, Pro-Einheit, CSV
- `pages/SolarDashboard.tsx` — Erweitert: BK-Modus, Amortisation, 48h-Prognose, Finanz-Cockpit

**Komponenten (2):**
- `components/dashboard/QuickReadingWidget.tsx` — Schnell-Ablesung vom Dashboard
- `components/meters/OCRFeedbackWidget.tsx` — OCR-Qualitäts-Feedback

**Hooks (1):**
- `hooks/useOfflineQueue.tsx` — Offline-Queue mit Auto-Sync

### Neue Dateien (erstellt am 15.02.2026)
**Seiten (5):**
- `pages/InvoiceOCRDialog.tsx` — Rechnungserkennung (Upload, OCR, Review, Multi-Zähler-Import)
- `pages/MeterQRCodeGenerator.tsx` — QR-Code-Labels (qrcode.react, Filter, Print-Layout)
- `pages/UtilitySettlementManager.tsx` — Abrechnungs-Workflow (Entwurf→Prüfung→Signatur→Versand)
- `pages/EnergyPassportManager.tsx` — GEG-Energieausweis (A+-H Skala, Primärenergie, CO₂)
- `pages/MieterStromDashboard.tsx` — Mieterstrom/ZEV (Pro-Einheit PV-Verteilung, §42a/42b EnWG)

### Offene Features (benötigen Backend/APIs)
1. **Phase F komplett** (42-47) — Wechselrichter-APIs (Fronius, SMA, Huawei), Dynamische Tarife (Tibber, aWATTar), Batterie-Management, VPP, IoT, Smart-Home-Hub
