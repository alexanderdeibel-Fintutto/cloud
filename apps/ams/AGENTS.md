# AGENTS.md — Fintutto Admin

> **Für jeden Agenten, der an diesem Repository arbeitet: Diese Datei ZUERST lesen.**
> Sie ist die einzige Quelle der Wahrheit für Architektur, Deployment und kritische Regeln.

---

## 0. VERCEL-SCHUTZ & REGRESSIONSTESTS — PFLICHT

> Diese Regeln haben Priorität über alle anderen Abschnitte.

Die `vercel.json` enthält einen `ignoreCommand` — dieser darf **niemals** entfernt werden.

```bash
npm test
# oder: ./node_modules/.bin/vitest run src/test/regression/
```

**Wenn ein Test rot wird: KEIN Commit, KEIN Push.**

---

## 1. Kritische Stellen

### 1a. `src/lib/feature-flags.ts`

Die **einzige Quelle der Wahrheit** für alle Feature-Flags.

**Was niemals geändert werden darf:**

| Flag | Default | Warum |
|---|---|---|
| `CSV_EXPORT` | `true` | Admins brauchen immer Export-Möglichkeit |
| `AI_CENTER` | `true` | KI-Funktionen sind Kern-Feature |
| `REALTIME_SUBSCRIPTIONS` | `true` | Live-Updates sind Pflicht |
| `COMMAND_PALETTE` | `true` | Produktivitäts-Feature |
| `COMMUNITY_MODULE` | `true` | Community-Zugang |
| `DEVOPS_MODULE` | `true` | DevOps-Monitoring |

**Invarianten:**
- Es gibt genau **6 Feature-Flags** — keine dürfen entfernt werden
- Alle Flags sind standardmäßig `true` — niemals auf `false` setzen ohne explizite Anforderung
- Env-Variable-Override: `VITE_FF_<FLAG_NAME>=true/false/1`

### 1b. `src/lib/url-registry.ts`

URL-Registry für alle Admin-Links. Alle URLs müssen mit `https://` beginnen.

---

## 2. CI-Workflow

Der CI-Workflow in `.github/workflows/ci.yml` führt automatisch Tests aus. Er darf nicht deaktiviert werden.

---

## 3. Neue Bugs dokumentieren

1. Test in `src/test/regression/core-logic.test.ts` schreiben
2. Bug in Abschnitt 1 dokumentieren
3. Commit-Message mit `[REG-XXX]` kennzeichnen
