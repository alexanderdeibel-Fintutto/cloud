import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { formatEuro } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  openInvoices: number;
  overdueInvoices: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { business, loading: bizLoading } = useBusiness();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business) return;
    fetchStats();
  }, [business]);

  const fetchStats = async () => {
    if (!business) return;

    const [
      { data: paidInvoices },
      { data: openInv },
      { data: overdueInv },
      { data: expenses },
    ] = await Promise.all([
      supabase.from("biz_invoices").select("total").eq("business_id", business.id).eq("status", "paid"),
      supabase.from("biz_invoices").select("id").eq("business_id", business.id).eq("status", "sent"),
      supabase.from("biz_invoices").select("id").eq("business_id", business.id).eq("status", "overdue"),
      supabase.from("biz_expenses").select("amount").eq("business_id", business.id),
    ]);

    const totalRevenue = (paidInvoices || []).reduce((sum, i) => sum + Number(i.total), 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);

    setStats({
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      openInvoices: openInv?.length || 0,
      overdueInvoices: overdueInv?.length || 0,
    });

    // Build monthly data for chart (last 6 months placeholder)
    const months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"];
    setMonthlyData(
      months.map((m) => ({
        month: m,
        revenue: Math.round(totalRevenue / 6 + (Math.random() - 0.5) * totalRevenue * 0.3),
        expenses: Math.round(totalExpenses / 6 + (Math.random() - 0.5) * totalExpenses * 0.3),
      }))
    );

    setLoading(false);
  };

  if (bizLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!business) {
    navigate("/onboarding");
    return null;
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Umsatz"
            value={formatEuro(stats?.totalRevenue || 0)}
            icon={<TrendingUp className="h-5 w-5 text-green-400" />}
            accent="green"
          />
          <StatCard
            title="Ausgaben"
            value={formatEuro(stats?.totalExpenses || 0)}
            icon={<TrendingDown className="h-5 w-5 text-red-400" />}
            accent="red"
          />
          <StatCard
            title="Gewinn"
            value={formatEuro(stats?.profit || 0)}
            icon={<Wallet className="h-5 w-5 text-blue-400" />}
            accent="blue"
          />
          <StatCard
            title="Offene Rechnungen"
            value={String(stats?.openInvoices || 0)}
            subtitle={stats?.overdueInvoices ? `${stats.overdueInvoices} ueberfaellig` : undefined}
            icon={<FileText className="h-5 w-5 text-yellow-400" />}
            accent="yellow"
          />
        </div>

        {/* Revenue vs Expenses Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Umsatz vs. Ausgaben</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="revenue" name="Umsatz" fill="#4ade80" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Ausgaben" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            title="Rechnung erstellen"
            description="Neue Rechnung an einen Kunden"
            onClick={() => navigate("/rechnungen?neu=1")}
          />
          <QuickAction
            title="Ausgabe erfassen"
            description="Geschaeftliche Ausgabe eintragen"
            onClick={() => navigate("/ausgaben?neu=1")}
          />
          <QuickAction
            title="Steuer-Uebersicht"
            description="EUeR und USt anzeigen"
            onClick={() => navigate("/steuern")}
          />
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value, subtitle, icon, accent }: {
  title: string; value: string; subtitle?: string; icon: React.ReactNode; accent: string;
}) {
  const accentBorder: Record<string, string> = {
    green: "border-green-500/20",
    red: "border-red-500/20",
    blue: "border-blue-500/20",
    yellow: "border-yellow-500/20",
  };

  return (
    <div className={`rounded-xl border ${accentBorder[accent] || "border-white/10"} bg-white/5 p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-red-400">{subtitle}</p>}
    </div>
  );
}

function QuickAction({ title, description, onClick }: {
  title: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-colors hover:bg-white/10"
    >
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
