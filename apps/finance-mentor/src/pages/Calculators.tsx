import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { TrendingUp, PiggyBank, Percent, CreditCard } from "lucide-react";

function fmt(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Zinseszins-Rechner ──────────────────────────────────────────────

function CompoundInterest() {
  const [principal, setPrincipal] = useState(10000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const r = rate / 100 / 12;
  const n = years * 12;
  const futureValue =
    principal * Math.pow(1 + r, n) +
    monthly * ((Math.pow(1 + r, n) - 1) / r);
  const totalDeposits = principal + monthly * n;
  const totalInterest = futureValue - totalDeposits;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Zinseszins-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Startkapital (Euro)</Label>
            <Input type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} />
          </div>
          <div>
            <Label>Monatliche Sparrate (Euro)</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} />
          </div>
          <div>
            <Label>Jaehrliche Rendite (%)</Label>
            <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} />
          </div>
          <div>
            <Label>Anlagedauer (Jahre)</Label>
            <Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-muted text-center">
            <p className="text-xs text-muted-foreground">Eingezahlt</p>
            <p className="font-bold text-sm">{fmt(totalDeposits)} Euro</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Zinsen</p>
            <p className="font-bold text-sm text-primary">{fmt(totalInterest)} Euro</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/20 text-center">
            <p className="text-xs text-muted-foreground">Endwert</p>
            <p className="font-bold text-sm">{fmt(futureValue)} Euro</p>
          </div>
        </div>

        {/* Simple bar visualization */}
        <div className="flex h-6 rounded-full overflow-hidden">
          <div
            className="bg-muted-foreground/30 transition-all"
            style={{ width: `${(totalDeposits / futureValue) * 100}%` }}
          />
          <div
            className="bg-primary transition-all"
            style={{ width: `${(totalInterest / futureValue) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Einzahlungen ({Math.round((totalDeposits / futureValue) * 100)}%)</span>
          <span>Zinseszins ({Math.round((totalInterest / futureValue) * 100)}%)</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Sparquoten-Rechner ──────────────────────────────────────────────

function SavingsRate() {
  const [income, setIncome] = useState(3000);
  const [expenses, setExpenses] = useState(2200);

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const yearsToFI = savingsRate > 0
    ? Math.log(1 + (25 * income * (savingsRate / 100)) / (income * (savingsRate / 100))) / Math.log(1.07)
    : Infinity;

  let ratingColor = "text-red-400";
  let rating = "Kritisch";
  if (savingsRate >= 50) { ratingColor = "text-green-400"; rating = "Exzellent"; }
  else if (savingsRate >= 30) { ratingColor = "text-emerald-400"; rating = "Sehr gut"; }
  else if (savingsRate >= 20) { ratingColor = "text-primary"; rating = "Gut"; }
  else if (savingsRate >= 10) { ratingColor = "text-amber-400"; rating = "Ausbaufaehig"; }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          Sparquoten-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Netto-Einkommen (Euro/Monat)</Label>
            <Input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} />
          </div>
          <div>
            <Label>Ausgaben (Euro/Monat)</Label>
            <Input type="number" value={expenses} onChange={(e) => setExpenses(+e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-muted text-center">
            <p className="text-xs text-muted-foreground">Sparrate/Monat</p>
            <p className="font-bold text-sm">{fmt(savings)} Euro</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground">Sparquote</p>
            <p className={`font-bold text-sm ${ratingColor}`}>{fmt(savingsRate)}%</p>
          </div>
          <div className="p-3 rounded-xl bg-muted text-center">
            <p className="text-xs text-muted-foreground">Bewertung</p>
            <p className={`font-bold text-sm ${ratingColor}`}>{savings < 0 ? "Defizit" : rating}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          50-30-20-Empfehlung: {fmt(income * 0.5)} Euro Beduerfnisse / {fmt(income * 0.3)} Euro Wuensche / {fmt(income * 0.2)} Euro Sparen
        </p>
      </CardContent>
    </Card>
  );
}

// ── Inflations-Rechner ──────────────────────────────────────────────

function InflationCalc() {
  const [amount, setAmount] = useState(50000);
  const [inflation, setInflation] = useState(3);
  const [years, setYears] = useState(10);

  const realValue = amount / Math.pow(1 + inflation / 100, years);
  const loss = amount - realValue;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          Inflations-Rechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Betrag (Euro)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
          </div>
          <div>
            <Label>Inflation (%/Jahr)</Label>
            <Input type="number" step="0.1" value={inflation} onChange={(e) => setInflation(+e.target.value)} />
          </div>
          <div>
            <Label>Zeitraum (Jahre)</Label>
            <Input type="number" value={years} onChange={(e) => setYears(+e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-muted text-center">
            <p className="text-xs text-muted-foreground">Reale Kaufkraft</p>
            <p className="font-bold text-sm">{fmt(realValue)} Euro</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-center">
            <p className="text-xs text-muted-foreground">Kaufkraftverlust</p>
            <p className="font-bold text-sm text-red-400">-{fmt(loss)} Euro</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {fmt(amount)} Euro haben in {years} Jahren bei {inflation}% Inflation nur noch die Kaufkraft von {fmt(realValue)} Euro heute.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Kredit-Rechner ──────────────────────────────────────────────────

function LoanCalc() {
  const [loan, setLoan] = useState(10000);
  const [rate, setRate] = useState(5);
  const [monthlyPay, setMonthlyPay] = useState(300);

  const r = rate / 100 / 12;
  const months = r > 0 && monthlyPay > loan * r
    ? Math.ceil(-Math.log(1 - (loan * r) / monthlyPay) / Math.log(1 + r))
    : Infinity;
  const totalPaid = months < Infinity ? monthlyPay * months : Infinity;
  const totalInterest = months < Infinity ? totalPaid - loan : Infinity;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Kredit-Tilgungsrechner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Kreditsumme (Euro)</Label>
            <Input type="number" value={loan} onChange={(e) => setLoan(+e.target.value)} />
          </div>
          <div>
            <Label>Zinssatz (%/Jahr)</Label>
            <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} />
          </div>
          <div>
            <Label>Monatsrate (Euro)</Label>
            <Input type="number" value={monthlyPay} onChange={(e) => setMonthlyPay(+e.target.value)} />
          </div>
        </div>

        {months === Infinity ? (
          <p className="text-sm text-red-400 p-3 rounded-xl bg-red-500/10">
            Die Monatsrate reicht nicht aus, um den Kredit zu tilgen. Erhoehe die Rate auf mindestens {fmt(loan * r + 1)} Euro.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-muted text-center">
              <p className="text-xs text-muted-foreground">Laufzeit</p>
              <p className="font-bold text-sm">{Math.floor(months / 12)} J. {months % 12} M.</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-center">
              <p className="text-xs text-muted-foreground">Gesamtzinsen</p>
              <p className="font-bold text-sm text-red-400">{fmt(totalInterest)} Euro</p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-center">
              <p className="text-xs text-muted-foreground">Gesamtzahlung</p>
              <p className="font-bold text-sm">{fmt(totalPaid)} Euro</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Rechner-Seite ───────────────────────────────────────────────────

export default function Calculators() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">Finanz-Rechner</h1>
          <p className="text-muted-foreground mt-1">
            Interaktive Tools fuer deine Finanzplanung
          </p>
        </div>

        <CompoundInterest />
        <SavingsRate />
        <InflationCalc />
        <LoanCalc />
      </div>
    </AppLayout>
  );
}
