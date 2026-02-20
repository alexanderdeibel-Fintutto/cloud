# App-spezifische KI-Chat Integrationen

Diese Dateien müssen in die jeweiligen Lovable-App-Repositories kopiert werden.

## Status Übersicht

| App | Status | Ordner | Dateien |
|-----|--------|--------|---------|
| ft_vermietify | ✅ | `vermietify/` | `Layout.jsx` |
| ft_mieter | ✅ Bereits vorhanden | - | - |
| ft_fromulare_alle | ✅ | `formulare/` | `Layout.jsx`, `GlobalAIChatButton.jsx` |
| fintutto-your-financial-compass | ✅ | `financial-compass/` | `AppLayout.tsx`, `GlobalAIChatButton.tsx` |
| betriebskosten-helfer | ✅ | `betriebskosten-helfer/` | `AppLayout.tsx`, `GlobalAIChatButton.tsx` |
| fintu-hausmeister-app | ✅ | `hausmeister/` | `AppLayout.tsx`, `GlobalAIChatButton.tsx` |
| fintutto-miet-recht | ✅ | `miet-recht/` | `App.tsx`, `GlobalAIChatButton.tsx` |
| fintutto-rent-wizard | ✅ | `rent-wizard/` | `App.tsx`, `GlobalAIChatButton.tsx` |
| vermieter-freude | ✅ | `vermieter-freude/` | `MainLayout.tsx`, `GlobalAIChatButton.tsx` |
| wohn-held | ✅ | `wohn-held/` | `MobileLayout.tsx`, `GlobalAIChatButton.tsx` |

---

## Integration pro App

### 1. Layout-Datei ersetzen/anpassen
Kopiere die Layout-Datei aus dem entsprechenden Ordner nach `src/components/layout/` (oder `src/` für Layout.jsx)

### 2. GlobalAIChatButton erstellen
Kopiere `GlobalAIChatButton.tsx` nach `src/components/ai/`

### 3. Import hinzufügen
In der Layout/App-Datei:
```tsx
import GlobalAIChatButton from '@/components/ai/GlobalAIChatButton';
```

### 4. Komponente rendern
Vor dem schließenden `</div>` oder `</>`:
```tsx
<GlobalAIChatButton />
```

---

## Farbschema pro App

| App | Primärfarbe | Gradient | Icon |
|-----|-------------|----------|------|
| Vermietify | Blue/Orange | `from-blue-600 to-orange-600` | Sparkles |
| MieterApp | Violet | `from-violet-500 to-purple-600` | Sparkles |
| Formulare | Emerald | `from-emerald-500 to-teal-600` | Sparkles |
| Financial Compass | Blue/Indigo | `from-blue-500 to-indigo-600` | Sparkles |
| Betriebskosten | Green | `from-green-500 to-emerald-600` | Sparkles |
| Hausmeister | Orange | `from-orange-500 to-amber-600` | Sparkles |
| Miet-Recht | Slate | `from-slate-700 to-slate-900` | Scale |
| Rent-Wizard | Cyan | `from-cyan-500 to-blue-600` | Calculator |
| Vermieter-Freude | Blue/Indigo | `from-blue-600 to-indigo-700` | Sparkles |
| Wohn-Held | Purple/Pink | `from-purple-500 to-pink-600` | Sparkles |

---

## App-spezifische Prompts

Jede `GlobalAIChatButton.tsx` enthält einen `SYSTEM_PROMPT` der auf die jeweilige App zugeschnitten ist:

- **Betriebskosten-Helfer**: BetrKV, Umlageschlüssel, NK-Abrechnung
- **Hausmeister**: Aufgabenverwaltung, Wartung, Notfälle
- **Miet-Recht**: Paragraphen, Mietminderung, Kündigungsfristen
- **Rent-Wizard**: Rendite-Formeln, Mieterhöhung, Kalkulationen
- **Vermieter-Freude**: Mietrecht, Vertragsgestaltung, Mieterauswahl
- **Wohn-Held**: Mieterrechte, Mängel, Kommunikation

---

## Quick-Copy Commands

```bash
# Beispiel für betriebskosten-helfer:
cp apps/betriebskosten-helfer/GlobalAIChatButton.tsx ../betriebskosten-helfer/src/components/ai/
cp apps/betriebskosten-helfer/AppLayout.tsx ../betriebskosten-helfer/src/components/layout/
```
