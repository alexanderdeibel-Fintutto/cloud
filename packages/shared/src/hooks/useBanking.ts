/**
 * @fintutto/shared — useBanking
 *
 * Universeller Banking-Hook für alle Fintutto-Apps.
 * Unterstützt sowohl den Vermietify-Kontext (organization_id)
 * als auch den Financial-Compass-Kontext (business_id).
 *
 * Anbindung: FinAPI via Supabase Edge Functions
 *   - finapi-connect   → Konto verbinden
 *   - finapi-sync      → Transaktionen synchronisieren
 *   - auto-match-transactions → Automatisches Matching
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// ─── Typen ──────────────────────────────────────────────────────────────────

export interface BankConnection {
  id: string;
  /** Vermietify nutzt organization_id, Financial Compass nutzt business_id */
  organization_id?: string;
  business_id?: string;
  finapi_user_id: string | null;
  bank_id: string;
  bank_name: string;
  bank_logo_url: string | null;
  bank_bic: string | null;
  status: "pending" | "connected" | "error" | "update_required" | "disconnected";
  last_sync_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  connection_id: string;
  finapi_account_id: string | null;
  iban: string;
  account_name: string;
  account_type: "checking" | "savings" | "credit_card" | "loan" | "securities" | "other";
  balance_cents: number;
  balance_date: string | null;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  connection?: BankConnection;
}

export type TransactionMatchType =
  | "rent"         // Vermietify: Mietzahlung
  | "deposit"      // Vermietify: Kaution
  | "utility"      // Vermietify: Nebenkosten
  | "maintenance"  // Vermietify: Instandhaltung
  | "invoice"      // Financial Compass: Ausgangsrechnung bezahlt
  | "expense"      // Financial Compass: Eingangsrechnung / Ausgabe
  | "salary"       // Financial Compass: Gehalt
  | "tax"          // Financial Compass: Steuerzahlung
  | "other";

export interface BankTransaction {
  id: string;
  account_id: string;
  finapi_transaction_id: string | null;
  booking_date: string;
  value_date: string | null;
  amount_cents: number;
  currency: string;
  counterpart_name: string | null;
  counterpart_iban: string | null;
  purpose: string | null;
  booking_text: string | null;
  transaction_type: TransactionMatchType;
  // Vermietify-Matching
  matched_payment_id: string | null;
  matched_tenant_id: string | null;
  matched_lease_id: string | null;
  // Financial Compass-Matching
  matched_invoice_id: string | null;
  matched_expense_id: string | null;
  // Allgemeines Matching
  match_status: "unmatched" | "auto" | "manual" | "ignored";
  match_confidence: number | null;
  matched_at: string | null;
  matched_by: string | null;
  created_at: string;
  account?: BankAccount;
  tenant?: { first_name: string; last_name: string } | null;
  invoice?: { invoice_number: string; client_name: string } | null;
}

export interface TransactionRule {
  id: string;
  organization_id?: string;
  business_id?: string;
  name: string;
  description: string | null;
  conditions: Array<{ field: string; operator: string; value: string }>;
  action_type: "assign_tenant" | "assign_invoice" | "assign_expense" | "book_as" | "ignore";
  action_config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  match_count: number;
  last_match_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Hook-Parameter ─────────────────────────────────────────────────────────

export interface UseBankingOptions {
  supabase: SupabaseClient;
  /** Für Vermietify: organization_id */
  organizationId?: string;
  /** Für Financial Compass: business_id */
  businessId?: string;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useBanking({ supabase, organizationId, businessId }: UseBankingOptions) {
  const queryClient = useQueryClient();
  const contextId = organizationId || businessId;
  const contextField = organizationId ? "organization_id" : "business_id";

  // ── Queries ──

  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ["bank-connections", contextId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("finapi_connections")
        .select("*")
        .eq(contextField, contextId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BankConnection[];
    },
    enabled: !!contextId,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["bank-accounts", contextId],
    queryFn: async () => {
      if (!connections.length) return [];
      const connectionIds = connections.map((c) => c.id);
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*, connection:finapi_connections(*)")
        .in("connection_id", connectionIds)
        .eq("is_active", true)
        .order("account_name");
      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: connections.length > 0,
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["transaction-rules", contextId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_rules")
        .select("*")
        .eq(contextField, contextId)
        .order("priority");
      if (error) throw error;
      return data as TransactionRule[];
    },
    enabled: !!contextId,
  });

  // ── Transaktionen (lazy per Konto) ──

  const useTransactions = (accountId?: string, filters?: {
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) =>
    useQuery({
      queryKey: ["bank-transactions", accountId, filters],
      queryFn: async () => {
        let query = supabase
          .from("bank_transactions")
          .select(`
            *,
            account:bank_accounts(account_name, iban),
            tenant:tenants(first_name, last_name)
          `)
          .order("booking_date", { ascending: false })
          .limit(200);

        if (accountId) query = query.eq("account_id", accountId);
        if (filters?.status) query = query.eq("match_status", filters.status);
        if (filters?.type) query = query.eq("transaction_type", filters.type);
        if (filters?.dateFrom) query = query.gte("booking_date", filters.dateFrom);
        if (filters?.dateTo) query = query.lte("booking_date", filters.dateTo);
        if (filters?.search) {
          query = query.or(
            `counterpart_name.ilike.%${filters.search}%,purpose.ilike.%${filters.search}%`
          );
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as BankTransaction[];
      },
      enabled: !!contextId,
    });

  // ── Mutations ──

  const connectBank = useMutation({
    mutationFn: async (params: { bankId: string; bankName: string; bankBic?: string }) => {
      const { data, error } = await supabase.functions.invoke("finapi-connect", {
        body: { ...params, [contextField]: contextId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-connections", contextId] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts", contextId] });
      toast.success("Bank erfolgreich verbunden");
    },
    onError: (error: Error) => toast.error("Fehler beim Verbinden: " + error.message),
  });

  const syncTransactions = useMutation({
    mutationFn: async (params?: { connectionId?: string; accountId?: string }) => {
      const { data, error } = await supabase.functions.invoke("finapi-sync", {
        body: { ...params, [contextField]: contextId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts", contextId] });
      queryClient.invalidateQueries({ queryKey: ["bank-connections", contextId] });
      toast.success(
        `${data.newTransactions} neue Transaktionen, ${data.matched} automatisch zugeordnet`
      );
    },
    onError: (error: Error) => toast.error("Fehler beim Synchronisieren: " + error.message),
  });

  const matchTransaction = useMutation({
    mutationFn: async (params: {
      transactionId: string;
      // Vermietify
      tenantId?: string;
      leaseId?: string;
      // Financial Compass
      invoiceId?: string;
      expenseId?: string;
      // Allgemein
      transactionType?: TransactionMatchType;
      createRule?: boolean;
      ruleConditions?: Array<{ field: string; operator: string; value: string }>;
    }) => {
      const { data, error } = await supabase.functions.invoke("auto-match-transactions", {
        body: { ...params, [contextField]: contextId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-rules", contextId] });
      toast.success("Transaktion zugeordnet");
    },
    onError: (error: Error) => toast.error("Fehler beim Zuordnen: " + error.message),
  });

  const ignoreTransaction = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from("bank_transactions")
        .update({ match_status: "ignored" })
        .eq("id", transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast.success("Transaktion ignoriert");
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("finapi_connections")
        .delete()
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-connections", contextId] });
      queryClient.invalidateQueries({ queryKey: ["bank-accounts", contextId] });
      toast.success("Verbindung getrennt");
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<TransactionRule, "id" | "match_count" | "last_match_at" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("transaction_rules")
        .insert({ ...rule, [contextField]: contextId } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction-rules", contextId] });
      toast.success("Regel erstellt");
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransactionRule> & { id: string }) => {
      const { error } = await supabase
        .from("transaction_rules")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction-rules", contextId] });
      toast.success("Regel aktualisiert");
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from("transaction_rules")
        .delete()
        .eq("id", ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction-rules", contextId] });
      toast.success("Regel gelöscht");
    },
  });

  // ── Stats ──

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance_cents, 0);
  const unmatchedCount = 0; // wird lazy per useTransactions geladen

  return {
    connections,
    accounts,
    rules,
    totalBalance,
    unmatchedCount,
    isLoading: connectionsLoading || accountsLoading || rulesLoading,
    useTransactions,
    connectBank,
    syncTransactions,
    matchTransaction,
    ignoreTransaction,
    deleteConnection,
    createRule,
    updateRule,
    deleteRule,
  };
}
