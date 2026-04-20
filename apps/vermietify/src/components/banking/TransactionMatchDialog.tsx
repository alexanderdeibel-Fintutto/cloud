import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  User,
  Save,
  Receipt,
} from "lucide-react";
import { BankTransaction, useBanking } from "@/hooks/useBanking";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Props {
  transaction: BankTransaction;
  tenants: Array<{ id: string; first_name: string; last_name: string }>;
  onClose: () => void;
}

type TransactionType = 'rent' | 'deposit' | 'utility' | 'maintenance' | 'other';

// Anlage V Kategorien mit Zeilennummern
const ANLAGE_V_CATEGORIES = [
  // Einnahmen
  { value: "rent_income",       label: "Mieteinnahmen (Kaltmiete)",           zeile: "Z. 7",  type: "income" },
  { value: "utility_income",    label: "Nebenkosten-Vorauszahlungen",          zeile: "Z. 13", type: "income" },
  { value: "other_income",      label: "Sonstige Einnahmen",                   zeile: "Z. 21", type: "income" },
  // Werbungskosten / Ausgaben
  { value: "afa",               label: "Absetzung für Abnutzung (AfA)",        zeile: "Z. 33", type: "expense" },
  { value: "interest",          label: "Schuldzinsen / Finanzierungskosten",   zeile: "Z. 35", type: "expense" },
  { value: "maintenance",       label: "Erhaltungsaufwand (Reparaturen)",      zeile: "Z. 47", type: "expense" },
  { value: "management_fee",    label: "Hausverwaltungskosten",                zeile: "Z. 48", type: "expense" },
  { value: "insurance",         label: "Versicherungsbeiträge",                zeile: "Z. 49", type: "expense" },
  { value: "operating_costs",   label: "Betriebskosten (nicht umlagefähig)",   zeile: "Z. 50", type: "expense" },
  { value: "property_tax",      label: "Grundsteuer",                          zeile: "Z. 51", type: "expense" },
  { value: "legal_consulting",  label: "Rechts- und Beratungskosten",          zeile: "Z. 52", type: "expense" },
  { value: "travel",            label: "Fahrtkosten (Objekt-Fahrten)",         zeile: "Z. 53", type: "expense" },
  { value: "other_expense",     label: "Sonstige Werbungskosten",              zeile: "Z. 54", type: "expense" },
  { value: "not_deductible",    label: "Nicht steuerrelevant",                 zeile: "–",     type: "neutral" },
] as const;

type AnlageVCategory = typeof ANLAGE_V_CATEGORIES[number]["value"];

// Automatische Kategorie-Vorschläge basierend auf Transaktionstyp
const TYPE_TO_ANLAGE_V: Record<TransactionType, AnlageVCategory> = {
  rent:        "rent_income",
  deposit:     "not_deductible",
  utility:     "operating_costs",
  maintenance: "maintenance",
  other:       "other_expense",
};

export function TransactionMatchDialog({ transaction, tenants, onClose }: Props) {
  const { matchTransaction } = useBanking();

  const isIncome = transaction.amount_cents > 0;

  const [formData, setFormData] = useState({
    tenantId: transaction.matched_tenant_id || '',
    leaseId: transaction.matched_lease_id || '',
    transactionType: (transaction.transaction_type || (isIncome ? 'rent' : 'maintenance')) as TransactionType,
    anlageVCategory: (transaction as any).tax_category as AnlageVCategory || (isIncome ? 'rent_income' : 'maintenance'),
    isDeductible: isIncome ? false : true,
    createRule: false,
  });

  // Wenn Transaktionstyp geändert wird, Anlage-V-Kategorie automatisch vorschlagen
  useEffect(() => {
    const suggested = TYPE_TO_ANLAGE_V[formData.transactionType];
    setFormData(prev => ({ ...prev, anlageVCategory: suggested }));
  }, [formData.transactionType]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  };

  // Vorschläge basierend auf Mieter-Name im Verwendungszweck
  const suggestions = tenants.filter(t => {
    const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
    const counterpart = (transaction.counterpart_name || '').toLowerCase();
    const purpose = (transaction.purpose || '').toLowerCase();
    return counterpart.includes(t.last_name.toLowerCase()) ||
           purpose.includes(t.last_name.toLowerCase()) ||
           counterpart.includes(fullName) ||
           purpose.includes(fullName);
  });

  const selectedCategory = ANLAGE_V_CATEGORIES.find(c => c.value === formData.anlageVCategory);
  const incomeCategories = ANLAGE_V_CATEGORIES.filter(c => c.type === "income");
  const expenseCategories = ANLAGE_V_CATEGORIES.filter(c => c.type === "expense");
  const neutralCategories = ANLAGE_V_CATEGORIES.filter(c => c.type === "neutral");

  const handleSubmit = async () => {
    await matchTransaction.mutateAsync({
      transactionId: transaction.id,
      tenantId: formData.tenantId === 'none' ? undefined : formData.tenantId || undefined,
      leaseId: formData.leaseId === 'none' ? undefined : formData.leaseId || undefined,
      transactionType: formData.transactionType,
      createRule: formData.createRule,
      ruleConditions: formData.createRule ? [
        { field: 'counterpart_name', operator: 'contains', value: transaction.counterpart_name || '' }
      ] : undefined,
      // Steuer-Felder
      tax_category: formData.anlageVCategory,
      anlage_v_zeile: selectedCategory?.zeile,
      is_tax_deductible: formData.isDeductible,
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaktion zuordnen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaktions-Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{transaction.counterpart_name || 'Unbekannt'}</p>
                  <p className="text-sm text-muted-foreground">{transaction.purpose || transaction.booking_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(transaction.booking_date), "dd.MM.yyyy", { locale: de })}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-lg font-bold ${isIncome ? 'text-primary' : 'text-destructive'}`}>
                  {isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  {formatCurrency(Math.abs(transaction.amount_cents))}
                </div>
              </div>
              {transaction.counterpart_iban && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  IBAN: {transaction.counterpart_iban}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Mieter-Vorschläge */}
          {suggestions.length > 0 && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-accent-foreground" />
                Vorschläge
              </Label>
              <div className="space-y-2">
                {suggestions.map(tenant => (
                  <Card
                    key={tenant.id}
                    className={`cursor-pointer transition-colors ${formData.tenantId === tenant.id ? 'border-primary' : 'hover:border-primary/50'}`}
                    onClick={() => setFormData(prev => ({ ...prev, tenantId: tenant.id }))}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{tenant.first_name} {tenant.last_name}</span>
                      <Badge variant="outline" className="ml-auto">Wahrscheinlich</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Transaktionstyp */}
          <div>
            <Label>Typ</Label>
            <Select
              value={formData.transactionType}
              onValueChange={(v) => setFormData(prev => ({ ...prev, transactionType: v as TransactionType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Mietzahlung</SelectItem>
                <SelectItem value="deposit">Kaution</SelectItem>
                <SelectItem value="utility">Nebenkosten</SelectItem>
                <SelectItem value="maintenance">Instandhaltung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mieter-Zuordnung */}
          <div>
            <Label>Mieter zuordnen</Label>
            <Select
              value={formData.tenantId}
              onValueChange={(v) => setFormData(prev => ({ ...prev, tenantId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mieter auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Zuordnung</SelectItem>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.first_name} {t.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Anlage V Steuer-Kategorie */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Steuer-Kategorie (Anlage V)
            </Label>
            <Select
              value={formData.anlageVCategory}
              onValueChange={(v) => setFormData(prev => ({ ...prev, anlageVCategory: v as AnlageVCategory }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Einnahmen
                </div>
                {incomeCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{cat.zeile}</span>
                    {cat.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">
                  Werbungskosten
                </div>
                {expenseCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{cat.zeile}</span>
                    {cat.label}
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">
                  Sonstiges
                </div>
                {neutralCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="font-mono text-xs text-muted-foreground mr-2">{cat.zeile}</span>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && selectedCategory.zeile !== "–" && (
              <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Anlage V {selectedCategory.zeile}</span>
                {" – "}{selectedCategory.label}
                {selectedCategory.type === "expense" && (
                  <span className="ml-2 text-primary">steuerlich absetzbar</span>
                )}
              </div>
            )}
          </div>

          {/* Steuerlich absetzbar */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDeductible"
              checked={formData.isDeductible}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDeductible: checked as boolean }))}
            />
            <Label htmlFor="isDeductible" className="text-sm cursor-pointer">
              Steuerlich absetzbar (Werbungskosten)
            </Label>
          </div>

          {/* Regel erstellen */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Checkbox
              id="createRule"
              checked={formData.createRule}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createRule: checked as boolean }))}
            />
            <Label htmlFor="createRule" className="text-sm cursor-pointer">
              Regel erstellen für zukünftige Transaktionen mit diesem Muster
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={matchTransaction.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Zuordnen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
