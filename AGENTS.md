# AGENTS.md — Portal Workspace

> **Für jeden Agenten, der an diesem Repository arbeitet: Diese Datei zuerst lesen.**
> Sie enthält kritische Regeln für das Deployment und die Kostenoptimierung.

---

## 1. Vercel Kostenoptimierung & Deployment-Regeln

Dieses Repository ist ein Monorepo mit vielen einzelnen Apps (z.B. `vermietify`, `fintutto-portal`, `bescheidboxer`). Um explodierende Build-Kosten auf Vercel zu vermeiden, ist in jeder `vercel.json` ein `ignoreCommand` konfiguriert. Dieser prüft, ob sich Dateien in der spezifischen App oder im geteilten `packages/shared/src/`-Ordner geändert haben.

**Kritische Regeln für alle Agenten:**

1.  **Niemals direkt auf `main` pushen, um Änderungen an einer einzelnen App auszuprobieren.** Nutze Feature-Branches (`feature/app-name-fix`) für Tests.
2.  **Änderungen propagieren:** Wenn du eine Änderung an einer App vornimmst, die auch für andere Apps relevant ist (z.B. Bugfix in einer Komponente), teste sie zuerst in einer App. Wenn es funktioniert, übertrage die Änderung auf die anderen Apps (oder den `packages/shared/src/`-Ordner) und committe dies.
3.  **`ignoreCommand` beibehalten:** Der `ignoreCommand` in der `vercel.json` darf **niemals** entfernt werden. Er ist zwingend erforderlich, um zu verhindern, dass bei jedem Push alle Apps neu gebaut werden.

---

## 2. Checkliste vor jedem Commit

- [ ] Wurde die Änderung lokal oder in einem Feature-Branch getestet?
- [ ] Ist der `ignoreCommand` in der `vercel.json` der betroffenen App noch vorhanden?
- [ ] Wenn die Änderung für andere Apps relevant ist: Wurde sie in den Shared-Code verschoben oder auf die anderen Apps übertragen?
