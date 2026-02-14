# Fintutto AI Assistant - Deployment Guide

## Übersicht

Die AI-Integration ist jetzt vollständig implementiert mit:
- **Prompt Caching**: Spart bis zu 90% der Kosten!
- **Usage Tracking**: Alle Anfragen werden geloggt
- **Rate Limiting**: Pro Tier unterschiedliche Limits
- **5 Tier-Stufen**: Free, Basic, Pro, Business, Premium

---

## Was ist Prompt Caching?

Anthropic's Prompt Caching speichert den System-Prompt (ca. 2000+ Tokens) im Cache.
Bei wiederholten Anfragen wird der gecachte Prompt verwendet.

### Kostenersparnis:

| Modell | Normal | Cache Read | Ersparnis |
|--------|--------|------------|-----------|
| Haiku 3.5 | $0.80/MTok | $0.08/MTok | **90%** |
| Sonnet 4 | $3.00/MTok | $0.30/MTok | **90%** |
| Opus 4.5 | $15.00/MTok | $1.50/MTok | **90%** |

### Beispiel:
- System-Prompt: 2000 Tokens
- Ohne Cache: 2000 × $3.00/MTok = $0.006
- Mit Cache: 2000 × $0.30/MTok = $0.0006
- **Ersparnis: $0.0054 pro Anfrage**

Bei 10.000 Anfragen/Monat: **~$54 gespart!**

---

## Deployment Schritte

### 1. Edge Function aktualisieren

Ersetze den Code in deiner `aiCoreService` Edge Function mit:
```
ai-assistant/implementation/aiCoreService-v2-optimized.ts
```

### 2. Datenbank-Tabelle erstellen

Führe das SQL am Ende der Datei in der Supabase SQL Console aus:

```sql
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_creation_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  cost_eur DECIMAL(10, 6) NOT NULL,
  prompt_preview TEXT
);

-- Index für schnelle Rate-Limit Abfragen
CREATE INDEX idx_ai_usage_user_created ON ai_usage_logs(user_id, created_at DESC);

-- Index für App-Statistiken
CREATE INDEX idx_ai_usage_app ON ai_usage_logs(app_id, created_at DESC);
```

### 3. Secrets setzen

In Supabase Dashboard → Settings → Secrets:
- `ANTHROPIC_API_KEY`: Dein Claude API Key

Die folgenden sind bereits automatisch verfügbar:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Apps integrieren

Führe das Integrations-Skript aus oder kopiere manuell:
```bash
cd ~/fintutto-ecosystem
./scripts/integrate-ai.sh
```

---

## API Response mit Caching

Die API gibt jetzt zusätzliche Cache-Informationen zurück:

```json
{
  "success": true,
  "content": "...",
  "usage": {
    "inputTokens": 2500,
    "outputTokens": 150,
    "costEur": 0.0012,
    "cacheCreationTokens": 0,
    "cacheReadTokens": 2000,
    "cacheHit": true,
    "savingsPercent": 85
  },
  "model": "claude-sonnet-4-20250514",
  "tier": "pro"
}
```

---

## Rate Limits pro Tier

| Tier | Pro Stunde | Pro Tag | Modell |
|------|------------|---------|--------|
| Free | 5 | 20 | Haiku 3.5 |
| Basic | 20 | 100 | Sonnet 4 |
| Pro | 100 | 500 | Sonnet 4 |
| Business | 500 | 2000 | Sonnet 4 |
| Premium | 1000 | 5000 | **Opus 4.5** |

---

## Monitoring

### Tägliche Statistiken abfragen:
```sql
SELECT * FROM ai_daily_stats ORDER BY date DESC LIMIT 30;
```

### User-Statistiken:
```sql
SELECT * FROM ai_user_stats ORDER BY total_cost_eur DESC LIMIT 100;
```

### Kosten der letzten 30 Tage:
```sql
SELECT
  SUM(cost_eur) as total_cost,
  COUNT(*) as total_requests,
  SUM(cache_read_tokens) as cache_hits
FROM ai_usage_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## Checkliste

- [ ] aiCoreService Edge Function mit v2-Code aktualisiert
- [ ] ai_usage_logs Tabelle erstellt
- [ ] Indexes erstellt
- [ ] Views erstellt (optional, für Statistiken)
- [ ] ANTHROPIC_API_KEY in Secrets
- [ ] GlobalAIChatButton in allen Apps integriert
- [ ] Test-Anfrage durchgeführt
- [ ] Cache-Hit in Response verifiziert

---

## Troubleshooting

### "Rate limit erreicht"
- User hat Limit überschritten
- Prüfe: `SELECT * FROM ai_user_stats WHERE user_id = '...'`

### "ANTHROPIC_API_KEY nicht konfiguriert"
- Secret in Supabase Dashboard setzen

### Keine Cache-Hits
- Cache braucht min. 1024 Tokens im System-Prompt
- Cache verfällt nach 5 Minuten ohne Nutzung
- Prüfe: `anthropic-beta` Header ist gesetzt

### Logging funktioniert nicht
- Prüfe ob Tabelle existiert
- Prüfe ob SERVICE_ROLE_KEY korrekt ist
