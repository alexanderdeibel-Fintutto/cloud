import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BankAccount {
  id: string;
  account_name: string;
  iban: string;
  account_type: string;
  balance_cents: number;
  balance_date: string | null;
  currency: string;
  is_active: boolean;
  connection_id: string;
}

export interface BankTransaction {
  id: string;
  account_id: string;
  amount_cents: number;
  booking_date: string;
  booking_text: string | null;
  counterpart_name: string | null;
  counterpart_iban: string | null;
  purpose: string | null;
  match_status: string;
  matched_expense_id: string | null;
  transaction_type: string | null;
  currency: string;
}

export interface FinapiConnection {
  id: string;
  user_id: string;
  bank_name: string;
  status: string;
  created_at: string;
}

export function useBizBanking(businessId?: string) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [connections, setConnections] = useState<FinapiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      // Verbindungen laden
      const { data: conns } = await supabase
        .from("finapi_connections")
        .select("id, user_id, bank_name, status, created_at")
        .order("created_at", { ascending: false });

      if (conns) setConnections(conns as FinapiConnection[]);

      // Konten laden
      const { data: accs, error: accErr } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("account_name");

      if (accErr) {
        setError(accErr.message);
      } else if (accs) {
        setAccounts(accs as BankAccount[]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const fetchTransactions = useCallback(
    async (params?: {
      accountId?: string;
      matchStatus?: string;
      limit?: number;
      search?: string;
    }) => {
      let query = supabase
        .from("bank_transactions")
        .select("*")
        .order("booking_date", { ascending: false })
        .limit(params?.limit ?? 100);

      if (params?.accountId) {
        query = query.eq("account_id", params.accountId);
      }
      if (params?.matchStatus) {
        query = query.eq("match_status", params.matchStatus);
      }
      if (params?.search) {
        query = query.or(
          `counterpart_name.ilike.%${params.search}%,purpose.ilike.%${params.search}%,booking_text.ilike.%${params.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as BankTransaction[];
    },
    []
  );

  /** CSV-Import: MT940 / CAMT / einfaches CSV */
  const importCsv = useCallback(
    async (file: File, accountId: string): Promise<{ imported: number; skipped: number }> => {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      // Einfaches CSV-Format: Datum;Betrag;Auftraggeber;Verwendungszweck
      // Erste Zeile = Header überspringen
      const rows = lines.slice(1);
      let imported = 0;
      let skipped = 0;

      for (const row of rows) {
        const cols = row.split(";").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 2) { skipped++; continue; }

        // Datum (DD.MM.YYYY oder YYYY-MM-DD)
        let bookingDate = cols[0];
        if (bookingDate.includes(".")) {
          const parts = bookingDate.split(".");
          if (parts.length === 3) {
            bookingDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
          }
        }

        // Betrag: Komma als Dezimaltrennzeichen
        const amountStr = cols[1].replace(/\./g, "").replace(",", ".");
        const amountEuro = parseFloat(amountStr);
        if (isNaN(amountEuro)) { skipped++; continue; }
        const amountCents = Math.round(amountEuro * 100);

        const counterpartName = cols[2] ?? null;
        const purpose = cols[3] ?? null;

        const { error } = await supabase.from("bank_transactions").insert({
          account_id: accountId,
          amount_cents: amountCents,
          booking_date: bookingDate,
          counterpart_name: counterpartName,
          purpose,
          match_status: "unmatched",
          currency: "EUR",
        });

        if (error) { skipped++; } else { imported++; }
      }

      await fetchAccounts();
      return { imported, skipped };
    },
    [fetchAccounts]
  );

  /** Transaktion einer Ausgabe zuordnen */
  const matchToExpense = useCallback(
    async (transactionId: string, expenseId: string) => {
      const { error } = await supabase
        .from("bank_transactions")
        .update({
          match_status: "matched",
          matched_expense_id: expenseId,
          matched_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
      if (error) throw error;
    },
    []
  );

  /** Transaktion ignorieren */
  const ignoreTransaction = useCallback(async (transactionId: string) => {
    const { error } = await supabase
      .from("bank_transactions")
      .update({ match_status: "ignored" })
      .eq("id", transactionId);
    if (error) throw error;
  }, []);

  /** Manuelles Konto anlegen */
  const createManualAccount = useCallback(
    async (params: {
      accountName: string;
      iban: string;
      accountType: string;
      balanceCents: number;
    }) => {
      // Erst eine "manuelle" Verbindung anlegen
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht eingeloggt");

      const { data: conn, error: connErr } = await supabase
        .from("finapi_connections")
        .insert({
          user_id: user.id,
          bank_name: "Manuell",
          status: "connected",
        })
        .select()
        .single();

      if (connErr) throw connErr;

      const { error: accErr } = await supabase.from("bank_accounts").insert({
        connection_id: conn.id,
        account_name: params.accountName,
        iban: params.iban,
        account_type: params.accountType,
        balance_cents: params.balanceCents,
        balance_date: new Date().toISOString().split("T")[0],
        currency: "EUR",
        is_active: true,
      });

      if (accErr) throw accErr;
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance_cents, 0);

  return {
    accounts,
    connections,
    loading,
    error,
    totalBalance,
    fetchAccounts,
    fetchTransactions,
    importCsv,
    matchToExpense,
    ignoreTransaction,
    createManualAccount,
  };
}
