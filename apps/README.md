# App-spezifische Änderungen

Diese Dateien müssen in die jeweiligen Lovable-App-Repositories kopiert werden.

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

### MieterApp (`ft_mieter`)

✅ Bereits integriert! Die MieterApp hat bereits einen globalen AI-Chat.

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
