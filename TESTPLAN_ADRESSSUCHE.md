# Testplan: Zentrale Google Places Adresssuche

Dieses Dokument beschreibt die strukturierten Testszenarien zur Verifizierung der neuen zentralen Adresssuche (`AddressAutocomplete`) im gesamten Fintutto-Ökosystem. Die neue Architektur nutzt die Google Places API (New) über zwei zentrale Supabase Edge Functions (`validate-address` und `get-place-details`) und wird als Shared-Komponente (`@fintutto/shared`) in allen Apps verwendet.

## 1. Architektur-Übersicht

Die Adresssuche wurde von isolierten, app-spezifischen Implementierungen auf eine zentrale Architektur umgestellt. Dies löst das Problem der veralteten Legacy-API und stellt sicher, dass alle Apps dieselbe, gewartete Codebasis nutzen.

| Komponente | Ort | Funktion |
|---|---|---|
| **Edge Function 1** | `supabase/functions/validate-address` | Liefert Autocomplete-Vorschläge via Places API (New) |
| **Edge Function 2** | `supabase/functions/get-place-details` | Lädt strukturierte Adressdetails (PLZ, Stadt, Koordinaten) |
| **Shared UI** | `@fintutto/shared/components/address` | Zentrale React-Komponente mit Debouncing und Error-Handling |
| **App-Wrapper** | `apps/*/src/components/...` | Injizieren den app-spezifischen Supabase-Client |

## 2. Allgemeine Testszenarien (App-übergreifend)

Diese Tests gelten für alle Eingabefelder, die die neue `AddressAutocomplete`-Komponente nutzen, unabhängig von der spezifischen App.

### 2.1. Grundlegende Funktionalität
1. **Eingabe starten:** Tippen Sie "Hauptstraße" in das Adressfeld ein.
   - *Erwartet:* Nach 3 Zeichen erscheint ein Lade-Indikator. Kurz darauf öffnet sich ein Dropdown mit bis zu 5 Vorschlägen.
2. **Auswahl per Maus:** Klicken Sie auf einen der Vorschläge im Dropdown.
   - *Erwartet:* Das Dropdown schließt sich. Das Eingabefeld wird mit der formatierten Adresse gefüllt. Ein grüner Haken bestätigt die erfolgreiche Validierung.
3. **Auswahl per Tastatur:** Nutzen Sie die Pfeiltasten (Hoch/Runter), um durch die Vorschläge zu navigieren, und drücken Sie `Enter`.
   - *Erwartet:* Das Verhalten entspricht der Auswahl per Maus.

### 2.2. Edge Cases und Fehlerbehandlung
1. **Ungültige Eingabe:** Geben Sie eine nicht existierende Zeichenfolge ein (z.B. "Xyzqwert123").
   - *Erwartet:* Das Dropdown zeigt keine Ergebnisse oder schließt sich. Es kommt zu keinem Absturz.
2. **Manuelle Eingabe ohne Auswahl:** Tippen Sie eine Adresse ein, ohne einen Vorschlag aus dem Dropdown zu wählen, und verlassen Sie das Feld (Blur).
   - *Erwartet:* Die Adresse wird als unbestätigt markiert (kein grüner Haken). In Formularen mit Validierungszwang sollte ein entsprechender Hinweis erscheinen.
3. **Netzwerkunterbrechung:** Trennen Sie die Internetverbindung während der Eingabe.
   - *Erwartet:* Eine gracefully behandelte Fehlermeldung ("Adresssuche nicht verfügbar") erscheint unter dem Feld.

## 3. App-spezifische Testszenarien

Die folgenden Tests verifizieren die korrekte Integration der Shared-Komponente in die jeweiligen Geschäftslogiken der einzelnen Apps.

### 3.1. Vermietify (Immobilienverwaltung)

In Vermietify wird die Adresssuche primär beim Anlegen neuer Gebäude und in den Organisationseinstellungen verwendet.

1. **Neues Gebäude anlegen:**
   - Navigieren Sie zu "Immobilien" -> "Gebäude hinzufügen".
   - Suchen und wählen Sie eine reale Adresse (z.B. "Maximilianstraße 1, München").
   - *Erwartet:* Die Adresse wird korrekt in das Formular übernommen. Nach dem Speichern erscheint das Gebäude mit der korrekten Adresse in der Übersicht.
2. **Organisationseinstellungen:**
   - Navigieren Sie zu "Einstellungen" -> "Organisation".
   - Ändern Sie die Organisationsadresse über das Autocomplete-Feld.
   - *Erwartet:* Die Felder für Stadt und PLZ werden im Hintergrund korrekt aktualisiert und beim Speichern in der Datenbank (`profiles` / `organizations`) hinterlegt.

### 3.2. Ablesung (Zähler-App)

Die Ablesung-App nutzte zuvor die alte Google Maps JavaScript API direkt im Browser. Diese wurde vollständig durch die Edge Functions ersetzt.

1. **Zähler-Standort erfassen:**
   - Navigieren Sie zur Erfassung eines neuen Zählers oder Gebäudes.
   - Nutzen Sie das Adressfeld.
   - *Erwartet:* Das Feld verhält sich identisch zu Vermietify. Die Aufteilung in Straße und Hausnummer (die für die Ablesung-App spezifisch ist) funktioniert fehlerfrei.
2. **Rückwärtskompatibilität:**
   - Prüfen Sie, ob nach der Auswahl einer Adresse die Koordinaten (Lat/Lng) korrekt im Hintergrund gespeichert werden, da diese für die Kartenansicht der Zähler benötigt werden.

### 3.3. Financial Kompass (fintutto-biz)

Im Financial Kompass wurde die Adresssuche neu eingeführt, um Ausgaben und Einnahmen direkt mit Gebäuden verknüpfen zu können.

1. **Neue Ausgabe erfassen:**
   - Navigieren Sie zu "Ausgaben" -> "Neue Ausgabe".
   - Prüfen Sie das optionale Feld zur Gebäudezuordnung.
   - *Erwartet:* Wenn ein neues Gebäude angelegt wird, funktioniert die Adresssuche. Wenn ein bestehendes Gebäude ausgewählt wird, wird dessen Adresse korrekt angezeigt.
2. **Immobilien-Dashboard:**
   - Navigieren Sie zur neuen Seite "Immobilien".
   - *Erwartet:* Alle Gebäude, die in Vermietify oder der Ablesung-App mit einer gültigen Adresse angelegt wurden, erscheinen hier mit ihren korrekten Adressdaten und den aggregierten Finanzkennzahlen.

## 4. Datenbank-Verifizierung

Nach Abschluss der UI-Tests sollte die korrekte Speicherung in der Supabase-Datenbank stichprobenartig geprüft werden.

1. Öffnen Sie den Supabase Table Editor für das Projekt `aaefocdqgdgexkcrjhks`.
2. Prüfen Sie die Tabelle `buildings`:
   - Die Spalten `address`, `city`, `postal_code` und `country` müssen die strukturierten Daten aus der Google Places API enthalten.
3. Prüfen Sie die Tabelle `biz_expenses`:
   - Die Spalte `building_id` muss korrekt auf einen Eintrag in der `buildings`-Tabelle verweisen, wenn bei der Ausgabenerfassung ein Gebäude ausgewählt wurde.

---
*Erstellt am 16. April 2026. Dieser Testplan deckt die Änderungen aus Commit `61935f4` ab.*
