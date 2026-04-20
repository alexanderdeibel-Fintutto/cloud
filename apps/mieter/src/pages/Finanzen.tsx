import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FinanceSkeleton } from "@/components/ui/ShimmerSkeleton";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Euro, Calendar, CreditCard } from "lucide-react";
import { useFinanceData } from "@/hooks/useFinanceData";

export default function Finanzen() {
  const { data, isLoading } = useFinanceData();

  return (
    <MobileLayout>
      <PageHeader title="Finanzen" subtitle="Ihre Zahlungsübersicht" />

      {isLoading ? (
        <FinanceSkeleton />
      ) : (
        <div className="px-4 -mt-2 space-y-4 pb-4">
          <BalanceCard balance={data?.balance ?? 0} />
          <RentBreakdownCard rent={data?.rent ?? null} />
          <PaymentHistory payments={data?.payments ?? []} />
        </div>
      )}
    </MobileLayout>
  );
}

function BalanceCard({ balance }: { balance: number }) {
  const isPositive = balance >= 0;

  return (
    <AnimatedCard delay={0} accentColor={isPositive ? "mint" : "coral"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-white/70">Kontostand</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {isPositive ? (
            <div className="w-14 h-14 rounded-2xl gradient-mint flex items-center justify-center shadow-lg shadow-mint/20 animate-float">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl gradient-coral flex items-center justify-center shadow-lg shadow-coral/20">
              <TrendingDown className="h-7 w-7 text-white" />
            </div>
          )}
          <div>
            <p className={`text-3xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{balance.toFixed(2)} €
            </p>
            <StatusBadge 
              status={isPositive ? "success" : "error"} 
              label={isPositive ? 'Ausgeglichen' : 'Nachzahlung'} 
            />
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

function RentBreakdownCard({ rent }: { rent: { cold: number; utilities: number; total: number } | null }) {
  if (!rent) {
    return (
      <AnimatedCard delay={100} accentColor="primary">
        <CardContent className="p-6">
          <EmptyState
            icon={Euro}
            title="Kein aktiver Mietvertrag"
            description="Es wurde noch kein Mietvertrag hinterlegt."
          />
        </CardContent>
      </AnimatedCard>
    );
  }

  const coldPercentage = (rent.cold / rent.total) * 100;

  return (
    <AnimatedCard delay={100} accentColor="primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-white/70 flex items-center gap-2">
          <IconBadge icon={Euro} variant="primary" size="sm" />
          Monatliche Miete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex h-4 rounded-full overflow-hidden bg-white/[0.08]">
            <div className="bg-primary transition-all duration-500" style={{ width: `${coldPercentage}%` }} />
            <div className="bg-secondary transition-all duration-500" style={{ width: `${100 - coldPercentage}%` }} />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-white/60">Kaltmiete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-white/60">Nebenkosten</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-white/60">Kaltmiete</span>
            </div>
            <span className="font-medium text-white/90">{rent.cold.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-white/60">Nebenkosten</span>
            </div>
            <span className="font-medium text-white/90">{rent.utilities.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-white/90">Gesamtbetrag</span>
            <span className="text-2xl font-bold text-primary">{rent.total.toFixed(2)} €</span>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

function PaymentHistory({ payments }: { payments: { id: string; date: string; amount: number; type: string; status: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 flex items-center gap-2 uppercase tracking-wide">
        <Calendar className="h-4 w-4" />
        Zahlungshistorie
      </h2>
      {payments.length === 0 ? (
        <AnimatedCard delay={200}>
          <CardContent className="p-6">
            <EmptyState
              icon={CreditCard}
              title="Keine Zahlungen"
              description="Es liegen noch keine Zahlungen vor."
            />
          </CardContent>
        </AnimatedCard>
      ) : (
        <AnimatedCard delay={200}>
          <div className="divide-y divide-white/[0.08]">
            {payments.map((payment, index) => {
              const isCredit = payment.status === "Gutgeschrieben";
              return (
                <CardContent key={payment.id} className="p-4 relative">
                  {index < payments.length - 1 && (
                    <div className="absolute left-8 top-14 bottom-0 w-0.5 bg-white/[0.08]" />
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full z-10 ${isCredit ? 'bg-success' : 'bg-primary'}`} />
                      <div>
                        <p className="font-medium text-white/90">{payment.type}</p>
                        <p className="text-sm text-white/50">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${isCredit ? 'text-success' : 'text-white/90'}`}>
                        {isCredit ? '+' : '-'}{payment.amount.toFixed(2)} €
                      </p>
                      <StatusBadge 
                        status={payment.status === 'Bezahlt' ? 'success' : payment.status === 'Offen' ? 'warning' : 'info'} 
                        label={payment.status}
                        showDot={false}
                      />
                    </div>
                  </div>
                </CardContent>
              );
            })}
          </div>
        </AnimatedCard>
      )}
    </div>
  );
}