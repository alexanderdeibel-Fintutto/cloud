import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FinanceAccount {
  id: string;
  account_name: string;
  account_type: string;
  bank_name: string | null;
  balance: number;
  currency: string;
}

export interface FinanceTransaction {
  id: string;
  amount: number;
  direction: "inflow" | "outflow";
  category: string | null;
  merchant: string | null;
  description: string | null;
  occurred_at: string;
}

export interface FinanceBudget {
  id: string;
  category: string;
  monthly_limit: number;
  alert_threshold: number;
}

export interface FinanceGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  status: string;
}

export interface FinanceStats {
  balance: number;
  income: number;
  expenses: number;
  savings: number;
  savingsGoalPercent: number;
}

// ─── Mock fallbacks ────────────────────────────────────────────────────────

const MOCK_STATS: FinanceStats = {
  balance: 4823.5,
  income: 3200,
  expenses: 2147.3,
  savings: 1052.7,
  savingsGoalPercent: 68,
};

const MOCK_TRANSACTIONS: FinanceTransaction[] = [
  { id: "m1", amount: 3200, direction: "inflow", category: "Gehalt", merchant: "Arbeitgeber", description: "Gehalt", occurred_at: "2026-03-01" },
  { id: "m2", amount: 850, direction: "outflow", category: "Wohnen", merchant: "Vermieter", description: "Miete", occurred_at: "2026-03-01" },
  { id: "m3", amount: 67.4, direction: "outflow", category: "Lebensmittel", merchant: "REWE", description: "REWE Einkauf", occurred_at: "2026-03-02" },
  { id: "m4", amount: 9.99, direction: "outflow", category: "Abos", merchant: "Spotify", description: "Spotify", occurred_at: "2026-03-03" },
  { id: "m5", amount: 58.2, direction: "outflow", category: "Mobilitaet", merchant: "Shell", description: "Tankstelle", occurred_at: "2026-03-04" },
];

const MOCK_BUDGETS: FinanceBudget[] = [
  { id: "b1", category: "Wohnen", monthly_limit: 900, alert_threshold: 0.8 },
  { id: "b2", category: "Lebensmittel", monthly_limit: 400, alert_threshold: 0.8 },
  { id: "b3", category: "Mobilitaet", monthly_limit: 200, alert_threshold: 0.8 },
];

const MOCK_GOALS: FinanceGoal[] = [
  { id: "g1", title: "Notfallfonds", target_amount: 5000, current_amount: 3400, deadline: "2026-09-01", status: "active" },
  { id: "g2", title: "Urlaub 2026", target_amount: 1500, current_amount: 1020, deadline: "2026-07-01", status: "active" },
];

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useFinanceData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinanceBudget[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [stats, setStats] = useState<FinanceStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      setTransactions(MOCK_TRANSACTIONS);
      setBudgets(MOCK_BUDGETS);
      setGoals(MOCK_GOALS);
      setStats(MOCK_STATS);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

      const [txRes, budgetRes, goalRes] = await Promise.all([
        supabase
          .from("finance_transactions")
          .select("id, amount, direction, category, merchant, description, occurred_at")
          .eq("user_id", user.id)
          .gte("occurred_at", startOfMonth)
          .order("occurred_at", { ascending: false })
          .limit(50),
        supabase
          .from("finance_budgets")
          .select("id, category, monthly_limit, alert_threshold")
          .eq("user_id", user.id),
        supabase
          .from("finance_goals")
          .select("id, title, target_amount, current_amount, deadline, status")
          .eq("user_id", user.id)
          .eq("status", "active"),
      ]);

      const hasTx = txRes.data && txRes.data.length > 0;

      if (!hasTx) {
        // No real data yet → use mock
        setTransactions(MOCK_TRANSACTIONS);
        setBudgets(MOCK_BUDGETS);
        setGoals(MOCK_GOALS);
        setStats(MOCK_STATS);
        setUsingMock(true);
      } else {
        const txData = txRes.data as FinanceTransaction[];
        setTransactions(txData);
        setBudgets((budgetRes.data as FinanceBudget[]) || MOCK_BUDGETS);
        setGoals((goalRes.data as FinanceGoal[]) || MOCK_GOALS);
        setUsingMock(false);

        // Compute stats from transactions
        const income = txData
          .filter((t) => t.direction === "inflow")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenses = txData
          .filter((t) => t.direction === "outflow")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        const savings = income - expenses;

        // Get account balance
        const { data: accounts } = await supabase
          .from("finance_accounts")
          .select("balance")
          .eq("user_id", user.id);

        const balance = accounts
          ? accounts.reduce((sum, a) => sum + Number(a.balance), 0)
          : income - expenses;

        const activeGoals = (goalRes.data as FinanceGoal[]) || [];
        const goalProgress = activeGoals.length > 0
          ? Math.round(
              (activeGoals.reduce((s, g) => s + Number(g.current_amount), 0) /
                activeGoals.reduce((s, g) => s + Number(g.target_amount), 0)) *
                100
            )
          : 0;

        setStats({ balance, income, expenses, savings, savingsGoalPercent: goalProgress });
      }
    } catch (err) {
      console.error("Error fetching finance data:", err);
      setTransactions(MOCK_TRANSACTIONS);
      setBudgets(MOCK_BUDGETS);
      setGoals(MOCK_GOALS);
      setStats(MOCK_STATS);
      setUsingMock(true);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    transactions,
    budgets,
    goals,
    stats,
    loading,
    usingMock,
    refresh: fetchData,
  };
}

// ─── Budget Spent Helper ───────────────────────────────────────────────────

export function computeBudgetSpent(
  budgets: FinanceBudget[],
  transactions: FinanceTransaction[]
): Array<{ label: string; spent: number; budget: number; color: string }> {
  const COLORS: Record<string, string> = {
    Wohnen: "bg-blue-500",
    Lebensmittel: "bg-green-500",
    Mobilitaet: "bg-amber-500",
    Abos: "bg-purple-500",
    Freizeit: "bg-pink-500",
  };

  return budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.direction === "outflow" && t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      label: b.category,
      spent,
      budget: Number(b.monthly_limit),
      color: COLORS[b.category] || "bg-gray-500",
    };
  });
}
