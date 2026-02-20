# Fintutto KI-Assistenten Integration

> Universelles KI-System für alle Fintutto Apps (Lovable Edition)

## Schnellstart

### 1. Backend einrichten (Supabase Edge Function)

```bash
# In deinem Lovable Projekt:
cp ai-assistant/implementation/aiCoreService.ts supabase/functions/aiCoreService/index.ts
```

Füge deinen Anthropic API Key in die Supabase Secrets:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Frontend Komponenten kopieren

```bash
cp ai-assistant/implementation/FintuttoAIChat.tsx src/components/ai/
cp ai-assistant/implementation/AIChatButton.tsx src/components/ai/
```

### 3. In App integrieren

```tsx
// In deiner App.tsx oder Layout.tsx:
import { useState } from 'react';
import FintuttoAIChat from '@/components/ai/FintuttoAIChat';
import AIChatButton from '@/components/ai/AIChatButton';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const userTier = 'free'; // Aus deinem Auth-System

  return (
    <>
      {/* Deine App */}

      {/* KI-Chat */}
      <AIChatButton onClick={() => setChatOpen(true)} isOpen={chatOpen} />
      <FintuttoAIChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        userTier={userTier}
        onUpgradeClick={() => {/* Zeige Upgrade-Modal */}}
      />
    </>
  );
}
```

### 4. App-spezifische Konfiguration

In `FintuttoAIChat.tsx` anpassen:

```typescript
const APP_CONFIG = {
  appId: 'mieterapp',  // <- Deine App
  appName: 'MieterApp',
  primaryColor: 'from-violet-500 to-purple-600',
  welcomeMessage: 'Hallo! 👋 Ich bin dein digitaler Wohnassistent...',
  quickTopics: [
    { label: 'Reparatur melden', prompt: '...' },
    // ...
  ],
};
```

## Dateistruktur

```
ai-assistant/
├── MASTER_PROMPT.md          # Vollständige Dokumentation
├── README.md                 # Diese Datei
├── prompts/
│   ├── BASE_SYSTEM_PROMPT.txt    # Basis für alle Apps
│   ├── VERMIETIFY_PROMPT.txt     # Vermieter-App
│   ├── MIETERAPP_PROMPT.txt      # Mieter-App
│   ├── FORMULARE_PROMPT.txt      # Formulare-App
│   └── RECHNER_PROMPT.txt        # Rechner-App
└── implementation/
    ├── aiCoreService.ts      # Backend (Supabase Function)
    ├── FintuttoAIChat.tsx    # Haupt-Chat-Komponente
    └── AIChatButton.tsx      # Floating Button
```

## Features

- **Multi-App Support**: Ein System für alle Fintutto Apps
- **Tier-basiert**: Free/Basic/Pro/Business mit unterschiedlichen Limits
- **Rate Limiting**: Schutz vor Überlastung
- **Cross-Selling**: Dezente Hinweise auf Premium & andere Apps
- **Mietrecht-Wissen**: Eingebettetes Wissen über deutsches Mietrecht
- **Deep Links**: KI kann direkt auf App-Seiten verlinken

## Kosten

| Tier | Modell | Max Tokens | Rate Limit |
|------|--------|------------|------------|
| Free | Haiku 3.5 | 500 | 5/h, 20/d |
| Basic | Sonnet 4 | 1000 | 20/h, 100/d |
| Pro | Sonnet 4 | 2000 | 100/h, 500/d |
| Business | Sonnet 4 | 4000 | 500/h, 2000/d |

Geschätzte Kosten pro 1000 Anfragen:
- Free: ~0.50€
- Basic/Pro/Business: ~3-5€

## Anpassung

### Eigene Quick Topics

```typescript
quickTopics: [
  {
    label: 'Mein Thema',
    prompt: 'Detaillierte Frage die der User stellen würde...'
  },
],
```

### Custom System Prompt

Erstelle eigene Prompts in `prompts/` und referenziere sie im `aiCoreService.ts`.

### Styling

Passe `primaryColor` und die Tailwind-Klassen in `FintuttoAIChat.tsx` an.

---

**Fragen?** Siehe [MASTER_PROMPT.md](./MASTER_PROMPT.md) für die vollständige Dokumentation.
