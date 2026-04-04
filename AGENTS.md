# AGENTS.md — Portal Workspace

> **Für jeden Agenten, der an diesem Repository arbeitet: Diese Datei ZUERST lesen.**
> Sie ist die einzige Quelle der Wahrheit für Architektur, Deployment und kritische Regeln.

---

## 1. Vercel Kostenoptimierung & Deployment-Regeln

Dieses Repository ist ein Monorepo mit über 20 einzelnen Apps. Um explodierende Build-Kosten auf Vercel zu vermeiden, ist in jeder `vercel.json` ein `ignoreCommand` konfiguriert. Dieser prüft, ob sich Dateien in der spezifischen App oder im geteilten `packages/shared/src/`-Ordner geändert haben.

**Kritische Regeln für alle Agenten:**

1. **Niemals direkt auf `main` pushen, um Änderungen an einer einzelnen App auszuprobieren.** Nutze Feature-Branches (`feature/app-name-fix`) für Tests.
2. **Shared-Code-Änderungen (`packages/shared/src/`) immer erst in einer App testen**, bevor sie auf `main` gemergt werden. Shared-Code-Änderungen triggern Builds in ALLEN Apps.
3. **`ignoreCommand` beibehalten:** Der `ignoreCommand` in der `vercel.json` darf **niemals** entfernt werden.

---

## 2. Regressionstests — Pflicht vor Änderungen am Shared-Package

Vor jeder Änderung an `packages/shared/src/` MÜSSEN die Regressionstests lokal grün sein:

```bash
./node_modules/.bin/vitest run src/__tests__/regression/ --reporter=verbose
```

**Wenn ein Test rot wird: KEIN Commit, KEIN Push.** Den Bug zuerst fixen.

Der CI-Workflow (`regression-guard`) blockiert automatisch alle Builds wenn Tests fehlschlagen.

---

## 3. Kritische Stellen — Diese Dateien niemals ohne Tests ändern

### 3a. `packages/shared/src/credits/index.ts`

Die **einzige Quelle der Wahrheit** für alle Credit-Kosten und Plan-Definitionen.

**Was niemals geändert werden darf ohne Test-Bestätigung:**

| Konstante | Wert | Warum |
|---|---|---|
| `CREDIT_COSTS.checker` | `1` | Basis-Aktion für alle Checker |
| `CREDIT_COSTS.simple_calculator` | `0` | Kalkulatoren sind immer kostenlos |
| `CREDIT_COSTS.pdf_export` | `1` | Addiert sich zu Aktionskosten |
| `ALL_PLANS.free.monthlyCredits` | `3` | Free-Plan-Limit |
| `ALL_PLANS.free.aiMessages` | `0` | Free-User haben keine KI |
| `ALL_PLANS.unlimited.monthlyCredits` | `-1` | -1 = unbegrenzt |

**Invariante:** `canPerformAction()` muss für Unlimited-User immer `{ allowed: true, cost: 0 }` zurückgeben, unabhängig von `creditsRemaining`.

### 3b. `packages/shared/src/entitlements.ts`

Das **Entitlement-System** steuert welche Features welcher Stripe-Plan freischaltet.

**Was niemals geändert werden darf:**
- `STRIPE_PRODUCT_ENTITLEMENTS['fintutto_universe_bundle']` muss alle Kern-Features enthalten.
- `hasEntitlement()` muss abgelaufene Entitlements (`expires_at < now`) ablehnen.

### 3c. `packages/shared/src/stripe.ts`

Stripe-Checkout-Logik. Änderungen hier können dazu führen, dass Zahlungen nicht mehr verarbeitet werden.

---

## 4. Architektur des Shared-Package

```
packages/shared/src/
├── credits/index.ts     ← Plan-Registry, Credit-Kosten, canPerformAction()
├── entitlements.ts      ← Stripe-Entitlement-Mapping, hasEntitlement()
├── stripe.ts            ← Checkout-Utilities
├── supabase.ts          ← Supabase-Client-Factory
├── hooks/               ← Geteilte React-Hooks
└── components/          ← Geteilte UI-Komponenten
```

Alle Apps importieren aus `@fintutto/shared`. Änderungen am Shared-Package betreffen alle Apps gleichzeitig.

---

## 5. Checkliste vor jedem Commit

- [ ] Wurde die Änderung lokal oder in einem Feature-Branch getestet?
- [ ] Ist der `ignoreCommand` in der `vercel.json` der betroffenen App noch vorhanden?
- [ ] Bei Shared-Package-Änderungen: Regressionstests lokal grün?
- [ ] Wenn die Änderung für andere Apps relevant ist: Wurde sie in `packages/shared/src/` verschoben?

---

## 6. Neue Bugs dokumentieren

Wenn du einen Bug in einer kritischen Datei findest und fixst:

1. Schreibe einen Test in `src/__tests__/regression/core-logic.test.ts`
2. Dokumentiere den Bug in Abschnitt 3 dieser Datei
3. Commit-Message mit `[REG-XXX]` kennzeichnen

**Beispiel:**
```
fix(credits): canPerformAction gibt für Unlimited-User cost>0 zurück [REG-005]
```
