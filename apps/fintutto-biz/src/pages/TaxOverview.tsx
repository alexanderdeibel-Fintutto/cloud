import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatEuro } from "@/lib/utils";
import { Calculator, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface QuarterData {
  quarter: string;
  revenue: number;
  expenses: number;
  profit: number;
  vat_collected: number;
  vat_paid: number;
  vat_due: number;
}

export default function TaxOverview() {
  const { business } = useBusiness();
  const [quarters, setQuarters] = useState<QuarterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!business) return;
    fetchTaxData();
  }, [business, year]);

  const fetchTaxData = async () => {
    if (!business) return;
    setLoading(true);

    // Fetch invoices and expenses for the year
    const [{ data: invoices }, { data: expenses }] = await Promise.all([
      supabase
        .from("biz_invoices")
        .select("total, tax_amount, subtotal, issue_date")
        .eq("business_id", business.id)
        .eq("status", "paid")
        .gte("issue_date", `${year}-01-01`)
        .lte("issue_date", `${year}-12-31`),
      supabase
        .from("biz_expenses")
        .select("amount, vat_amount, occurred_at")
        .eq("business_id", business.id)
        .gte("occurred_at", `${year}-01-01`)
        .lte("occurred_at", `${year}-12-31`),
    ]);

    const quarterNames = ["Q1 (Jan-Mrz)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Okt-Dez)"];
    const result: QuarterData[] = quarterNames.map((name, qi) => {
      const startMonth = qi * 3;
      const endMonth = startMonth + 2;

      const qInvoices = (invoices || []).filter((inv) => {
        const month = new Date(inv.issue_date).getMonth();
        return month >= startMonth && month <= endMonth;
      });

      const qExpenses = (expenses || []).filter((exp) => {
        const month = new Date(exp.occurred_at).getMonth();
        return month >= startMonth && month <= endMonth;
      });

      const revenue = qInvoices.reduce((sum, i) => sum + Number(i.subtotal || 0), 0);
      const vatCollected = qInvoices.reduce((sum, i) => sum + Number(i.tax_amount || 0), 0);
      const totalExpenses = qExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      // Use actual vat_amount from expenses if available, otherwise estimate
      const vatPaid = qExpenses.reduce((sum, e) => sum + Number(e.vat_amount || 0), 0) ||
        Math.round(totalExpenses * 0.19 / 1.19 * 100) / 100;

      return {
        quarter: name,
        revenue,
        expenses: totalExpenses,
        profit: revenue - totalExpenses,
        vat_collected: vatCollected,
        vat_paid: vatPaid,
        vat_due: vatCollected - vatPaid,
      };
    });

    setQuarters(result);
    setLoading(false);
  };

  const totals = quarters.reduce(
    (acc, q) => ({
      revenue: acc.revenue + q.revenue,
      expenses: acc.expenses + q.expenses,
      profit: acc.profit + q.profit,
      vat_collected: acc.vat_collected + q.vat_collected,
      vat_paid: acc.vat_paid + q.vat_paid,
      vat_due: acc.vat_due + q.vat_due,
    }),
    { revenue: 0, expenses: 0, profit: 0, vat_collected: 0, vat_paid: 0, vat_due: 0 }
  );

  return (
    <MainLayout title="Steuer-Uebersicht">
      <div className="space-y-6">
        {/* Year selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">EUeR-Uebersicht {year}</h2>
          <div className="flex gap-2">
            {[year - 1, year, year + 1].map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  y === year
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Einnahmen (netto)"
                value={formatEuro(totals.revenue)}
                icon={<TrendingUp className="h-5 w-5 text-green-400" />}
                accent="green"
              />
              <SummaryCard
                title="Ausgaben"
                value={formatEuro(totals.expenses)}
                icon={<TrendingDown className="h-5 w-5 text-red-400" />}
                accent="red"
              />
              <SummaryCard
                title="Gewinn (EUeR)"
                value={formatEuro(totals.profit)}
                icon={<Wallet className="h-5 w-5 text-blue-400" />}
                accent="blue"
              />
              <SummaryCard
                title="USt-Zahllast"
                value={formatEuro(totals.vat_due)}
                icon={<Calculator className="h-5 w-5 text-yellow-400" />}
                accent="yellow"
              />
            </div>

            {/* Quarterly Breakdown */}
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Quartal</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Einnahmen</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ausgaben</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Gewinn</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">USt erhoben</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Vorsteuer</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Zahllast</th>
                  </tr>
                </thead>
                <tbody>
                  {quarters.map((q) => (
                    <tr key={q.quarter} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-white">{q.quarter}</td>
                      <td className="px-4 py-3 text-sm text-green-400 text-right">{formatEuro(q.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-red-400 text-right">{formatEuro(q.expenses)}</td>
                      <td className="px-4 py-3 text-sm text-white text-right font-medium">{formatEuro(q.profit)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-right">{formatEuro(q.vat_collected)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-right">{formatEuro(q.vat_paid)}</td>
                      <td className="px-4 py-3 text-sm text-yellow-400 text-right font-medium">{formatEuro(q.vat_due)}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-white/5 font-semibold">
                    <td className="px-4 py-3 text-sm text-white">Gesamt {year}</td>
                    <td className="px-4 py-3 text-sm text-green-400 text-right">{formatEuro(totals.revenue)}</td>
                    <td className="px-4 py-3 text-sm text-red-400 text-right">{formatEuro(totals.expenses)}</td>
                    <td className="px-4 py-3 text-sm text-white text-right">{formatEuro(totals.profit)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">{formatEuro(totals.vat_collected)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground text-right">{formatEuro(totals.vat_paid)}</td>
                    <td className="px-4 py-3 text-sm text-yellow-400 text-right">{formatEuro(totals.vat_due)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-white">Hinweis:</strong> Diese Uebersicht dient als Orientierung und ersetzt keine steuerliche Beratung.
                Die Vorsteuer wird als Schaetzung aus den erfassten Bruttoausgaben berechnet (19% USt-Anteil).
                Fuer eine exakte EUeR-Berechnung konsultieren Sie bitte Ihren Steuerberater.
              </p>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({ title, value, icon, accent }: {
  title: string; value: string; icon: React.ReactNode; accent: string;
}) {
  const borders: Record<string, string> = {
    green: "border-green-500/20",
    red: "border-red-500/20",
    blue: "border-blue-500/20",
    yellow: "border-yellow-500/20",
  };

  return (
    <div className={`rounded-xl border ${borders[accent] || "border-white/10"} bg-white/5 p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
