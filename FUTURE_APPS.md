# Geplante Apps — Fintutto Ecosystem

Dieses Dokument enthält alle App-Ideen und Konzepte, die noch nicht implementiert wurden. Die zugehörigen Stub-Verzeichnisse wurden aus dem aktiven Code-Baum entfernt, um das Repository sauber zu halten.

---

## ai-guide
**Beschreibung:** Native iOS/Android-App für Tour-Guides. Ermöglicht kontinuierliche Sprachaufnahme mit Echtzeit-Übersetzung für Zuhörer auf ihren eigenen Geräten. Löst das "Ping-Pong-Problem" von Apple Translate für Monologe (Führungen, Vorträge).

**Kernfunktionen:**
- Kontinuierliche Aufnahme (Sprachkanal bleibt offen)
- Inkrementelle Übersetzung (Häppchen für Häppchen)
- Manueller Deploy-Button (Guide bestimmt Übersetzungs-Chunks)
- Mono-direktional: ein Sprecher, viele Zuhörer

**Technologie:** React Native / Expo (Mobile App)
**Architektur-Dokumentation:** Vollständige Spezifikation vorhanden (war in `apps/ai-guide/ARCHITECTURE.md`)

---

## leserally
**Beschreibung:** Zählerablese-App mit Kamera-Funktion. Ermöglicht das Ablesen von Zählerständen via Kamera und die Verwaltung von Einheiten.

**Kernfunktionen:**
- Dashboard-Übersicht
- Zählerstand ablesen via Kamera (`/read`)
- Einheitenverwaltung (`/units`)
- AI-Chat-Integration
- Auth mit Supabase

**Hinweis:** Teilweise implementiert (AppLayout.tsx, GlobalAIChatButton.tsx vorhanden). Könnte in die bestehende `ablesung`-App integriert werden.

---

## financial-compass
**Beschreibung:** Finanz-Kompass für persönliche Finanzverwaltung.

**Hinweis:** Nur Layout-Komponenten vorhanden (AppLayout.tsx, GlobalAIChatButton.jsx). Konzept ähnlich wie `finance-coach` / `finance-mentor`.

---

## formulare (aus _archive)
**Beschreibung:** Standalone-App für Formular-Verwaltung.

**Hinweis:** Nur Layout-Komponenten vorhanden. Formular-Funktionalität ist bereits in `vermietify` integriert.

---

## mieterportal (aus _archive)
**Beschreibung:** Standalone Mieter-Portal.

**Hinweis:** Nur Layout-Komponenten vorhanden. Mieter-Portal ist bereits als `/mieter-portal` in `vermietify` integriert.

---

## mietenplus-rechner (aus _archive)
**Beschreibung:** Rechner für Mietpreise.

**Hinweis:** Nur Layout-Komponenten vorhanden. Mietrechner-Funktionalität ist in `vermieter-portal` integriert.

---

## mieterhoehungs-checker (aus _archive)
**Beschreibung:** Tool zur Prüfung von Mieterhöhungen.

**Hinweis:** Nur Layout-Komponenten vorhanden. Mieterhöhungs-Funktionalität ist in `vermietify` und `vermieter-portal` integriert.

---

## rent-wizard (aus _archive)
**Beschreibung:** Wizard für Mietangelegenheiten.

**Hinweis:** Nur Layout-Komponenten vorhanden.

---

## wohn-held (aus _archive)
**Beschreibung:** App für Wohnungssuche / Mieter-Unterstützung.

**Hinweis:** Nur Layout-Komponenten vorhanden.

---

*Zuletzt aktualisiert: 19.04.2026*
*Stub-Verzeichnisse entfernt in Commit: (wird nach Commit ergänzt)*
