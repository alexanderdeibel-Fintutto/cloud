import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
}

interface ChecklistCategory {
  title: string;
  emoji: string;
  items: ChecklistItem[];
}

const CHECKLIST: ChecklistCategory[] = [
  {
    title: "Grundlagen sichern",
    emoji: "\u{1F3E0}",
    items: [
      { id: "budget", label: "Budget erstellen", description: "Uebersicht ueber Einnahmen und Ausgaben erstellen (z.B. mit der 50-30-20-Regel)" },
      { id: "abo-check", label: "Abos & Vertraege pruefen", description: "Alle laufenden Abos und Vertraege auflisten, unnoetige kuendigen" },
      { id: "notgroschen-start", label: "Notgroschen starten", description: "Separates Tagesgeldkonto eroeffnen und ersten Betrag einzahlen" },
      { id: "notgroschen-voll", label: "Notgroschen aufgebaut (3-6 Monate)", description: "3-6 Monatsausgaben als Reserve auf dem Tagesgeldkonto" },
      { id: "dispo-frei", label: "Dispositionskredit auf 0", description: "Dispo komplett zurueckzahlen – 10-15% Zinsen sparen" },
      { id: "schulden-plan", label: "Schulden-Tilgungsplan erstellen", description: "Alle Schulden auflisten, nach Zinssatz sortieren, Tilgungsplan machen" },
    ],
  },
  {
    title: "Absicherung",
    emoji: "\u{1F6E1}\u{FE0F}",
    items: [
      { id: "haftpflicht", label: "Haftpflichtversicherung abschliessen", description: "Privathaftpflicht mit mind. 10 Mio. Euro Deckungssumme (ca. 50-80 Euro/Jahr)" },
      { id: "bu", label: "BU-Versicherung pruefen", description: "Berufsunfaehigkeitsversicherung abschliessen oder pruefen, ob bestehende ausreicht" },
      { id: "kv-check", label: "Krankenversicherung optimieren", description: "Tarif pruefen, ggf. Zusatzversicherungen oder Kassenwechsel" },
      { id: "notfall-ordner", label: "Notfallordner anlegen", description: "Alle wichtigen Dokumente, Zugaenge und Vollmachten an einem Ort sammeln" },
    ],
  },
  {
    title: "Steuern optimieren",
    emoji: "\u{1F4CB}",
    items: [
      { id: "freistellung", label: "Freistellungsauftrag einrichten", description: "1.000 Euro (Einzelperson) / 2.000 Euro (Paare) Freibetrag bei der Bank hinterlegen" },
      { id: "steuererklaerung", label: "Steuererklaerung machen", description: "Werbungskosten, Versicherungen und Sonderausgaben absetzen" },
      { id: "steuer-app", label: "Steuer-Tool einrichten", description: "WISO Steuer, Taxfix oder SteuerBot fuer einfache Erklaerung nutzen" },
    ],
  },
  {
    title: "Investieren starten",
    emoji: "\u{1F4C8}",
    items: [
      { id: "depot", label: "Depot eroeffnen", description: "Guenstigen Online-Broker waehlen (z.B. Trade Republic, Scalable, ING)" },
      { id: "etf-waehlen", label: "ETF auswaehlen", description: "Einen breit gestreuten ETF waehlen (z.B. MSCI World oder FTSE All-World)" },
      { id: "sparplan", label: "ETF-Sparplan einrichten", description: "Automatischen monatlichen Sparplan am Gehaltstag einrichten" },
      { id: "aa-festlegen", label: "Asset Allocation festlegen", description: "Ziel-Aufteilung definieren (z.B. 80% Aktien-ETF, 20% Tagesgeld)" },
      { id: "rebalancing", label: "Rebalancing-Termin setzen", description: "Einmal pro Jahr pruefen, ob die Aufteilung noch stimmt" },
    ],
  },
  {
    title: "Altersvorsorge",
    emoji: "\u{1F9D3}",
    items: [
      { id: "renten-info", label: "Renteninformation anfordern", description: "Bei deutsche-rentenversicherung.de die voraussichtliche Rente pruefen" },
      { id: "renten-luecke", label: "Rentenluecke berechnen", description: "Differenz zwischen gewuenschtem und erwartetem Einkommen im Alter berechnen" },
      { id: "bav-check", label: "Betriebliche Altersvorsorge pruefen", description: "Arbeitgeberzuschuss mitnehmen – mindestens 15% muss er zahlen" },
      { id: "vorsorge-plan", label: "Vorsorge-Plan erstellen", description: "Kombination aus ETF-Sparplan, bAV und ggf. Riester/Ruerup festlegen" },
    ],
  },
  {
    title: "Einkommen steigern",
    emoji: "\u{1F4AA}",
    items: [
      { id: "marktwert", label: "Eigenen Marktwert recherchieren", description: "Gehalt auf Glassdoor, Kununu, Stepstone vergleichen" },
      { id: "gehalts-gespreach", label: "Gehaltsverhandlung vorbereiten", description: "Erfolge dokumentieren und Gehaltsgespraech planen" },
      { id: "skills", label: "Gefragte Faehigkeit lernen", description: "Eine Skill-Luecke identifizieren und gezielt schliessen" },
      { id: "nebeneinkommen", label: "Nebeneinkommen pruefen", description: "Freelancing, Nachhilfe oder andere Einkommensquellen evaluieren" },
    ],
  },
  {
    title: "Langfristige Ziele",
    emoji: "\u{1F3AF}",
    items: [
      { id: "fire-number", label: "FIRE-Number berechnen", description: "Jaehrliche Ausgaben x 25 = Ziel-Vermoegen fuer finanzielle Unabhaengigkeit" },
      { id: "ziele-definieren", label: "3 Finanzziele mit Datum setzen", description: "Konkrete Ziele mit Betrag und Zeitrahmen (z.B. '50.000 Euro Notgroschen bis 2028')" },
      { id: "partner-talk", label: "Finanzgespraech mit Partner fuehren", description: "Gemeinsame Ziele und Kontomodell besprechen" },
      { id: "testament", label: "Testament / Vorsorgevollmacht erstellen", description: "Regelung fuer den Ernstfall treffen – schuetzt dich und deine Familie" },
    ],
  },
];

const STORAGE_KEY = "fintutto_checklist";

export default function Checklist() {
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checked]));
  }, [checked, storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCollapse = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const totalItems = CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = checked.size;
  const overallPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Finanz-Checkliste</h1>
          <p className="text-muted-foreground mt-1">
            Dein persoenlicher Aktionsplan fuer finanzielle Sicherheit
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Gesamtfortschritt</span>
              </div>
              <span className="text-sm text-muted-foreground">{checkedCount}/{totalItems} erledigt</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              <div className="bg-primary transition-all duration-500" style={{ width: `${overallPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {overallPercent === 100
                ? "Glueckwunsch! Du hast alle Schritte erledigt."
                : overallPercent >= 70
                  ? "Fast geschafft – du bist auf einem tollen Weg!"
                  : overallPercent >= 30
                    ? "Guter Fortschritt! Bleib dran."
                    : "Jede Reise beginnt mit dem ersten Schritt."}
            </p>
          </CardContent>
        </Card>

        {/* Categories */}
        {CHECKLIST.map((cat) => {
          const catChecked = cat.items.filter((i) => checked.has(i.id)).length;
          const catDone = catChecked === cat.items.length;
          const isCollapsed = collapsed.has(cat.title);

          return (
            <Card key={cat.title} className={catDone ? "border-green-500/30 bg-green-500/5" : ""}>
              <CardHeader className="pb-2">
                <button
                  onClick={() => toggleCollapse(cat.title)}
                  className="w-full flex items-center justify-between"
                >
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{cat.emoji}</span>
                    {cat.title}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({catChecked}/{cat.items.length})
                    </span>
                  </CardTitle>
                  {isCollapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
                </button>
              </CardHeader>
              {!isCollapsed && (
                <CardContent className="space-y-2 pt-0">
                  {cat.items.map((item) => {
                    const isDone = checked.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                          isDone
                            ? "bg-green-500/10 opacity-70"
                            : "hover:bg-accent"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
