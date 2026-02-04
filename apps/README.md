# App-spezifische KI-Chat Integrationen

Diese Dateien müssen in die jeweiligen Lovable-App-Repositories kopiert werden.

## Status Übersicht

| App | Status | Dateien |
|-----|--------|---------|
| ft_vermietify | ✅ Integriert | `Layout.jsx` |
| ft_mieter | ✅ Bereits vorhanden | - |
| ft_fromulare_alle | ✅ Integriert | `Layout.jsx`, `GlobalAIChatButton.jsx` |
| fintutto-your-financial-compass | ✅ Integriert | `AppLayout.tsx`, `GlobalAIChatButton.tsx` |

---

## Integration Instructions

### Vermietify (`ft_vermietify`)

**Datei:** `vermietify/Layout.jsx`
**Ziel:** `src/Layout.jsx`

Änderungen:
- Import von `AIChatButton` und `AIChatPanel`
- State `isChatOpen` für Chat-Steuerung
- Globaler Chat-Button unten rechts

### Formulare (`ft_fromulare_alle`)

**Dateien:**
1. `formulare/Layout.jsx` → `src/Layout.jsx`
2. `formulare/GlobalAIChatButton.jsx` → `src/components/ai/GlobalAIChatButton.jsx`

Änderungen:
- Neue `GlobalAIChatButton` Komponente mit Formulare-spezifischem Prompt
- Integration im Layout

### Financial Compass (`fintutto-your-financial-compass`)

**Dateien:**
1. `financial-compass/AppLayout.tsx` → `src/components/layout/AppLayout.tsx`
2. `financial-compass/GlobalAIChatButton.tsx` → `src/components/ai/GlobalAIChatButton.tsx`

Änderungen:
- Neue `GlobalAIChatButton` Komponente mit Buchhaltungs-spezifischem Prompt
- Integration im AppLayout
- TypeScript-Version

### MieterApp (`ft_mieter`)

✅ Bereits integriert! Die MieterApp hat bereits einen globalen AI-Chat (`AIChatButton` + `MieterAIChat`).

---

## Manuelle Integration (falls Kopieren nicht möglich)

### 1. Vermietify Layout.jsx

```jsx
// Füge diese Imports hinzu:
import { useState } from 'react';
import AIChatButton from './components/ai/AIChatButton';
import AIChatPanel from './components/ai/AIChatPanel';

// In der LayoutInner Funktion:
const [isChatOpen, setIsChatOpen] = useState(false);

// Vor dem schließenden </div>:
<AIChatButton onToggleChat={() => setIsChatOpen(true)} />
<AIChatPanel
  isOpen={isChatOpen}
  onClose={() => setIsChatOpen(false)}
  currentPage={currentPageName}
/>
```

### 2. Formulare - Neue Komponente erstellen

Erstelle `src/components/ai/GlobalAIChatButton.jsx` mit dem Inhalt aus `formulare/GlobalAIChatButton.jsx`.

Dann in `Layout.jsx`:
```jsx
import GlobalAIChatButton from './components/ai/GlobalAIChatButton';

// Im return, vor </div>:
<GlobalAIChatButton user={currentUser} />
```

### 3. Financial Compass - TypeScript

Erstelle `src/components/ai/GlobalAIChatButton.tsx` mit dem Inhalt aus `financial-compass/GlobalAIChatButton.tsx`.

Dann in `AppLayout.tsx`:
```tsx
import GlobalAIChatButton from '@/components/ai/GlobalAIChatButton';

// Im return, vor </div>:
<GlobalAIChatButton />
```

---

## Farbschema pro App

| App | Primärfarbe | Gradient |
|-----|-------------|----------|
| Vermietify | Blue | `from-blue-600 to-orange-600` |
| MieterApp | Violet | `from-violet-500 to-purple-600` |
| Formulare | Emerald | `from-emerald-500 to-teal-600` |
| Financial Compass | Blue/Indigo | `from-blue-500 to-indigo-600` |
