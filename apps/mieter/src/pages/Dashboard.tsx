import { useAuth } from "@/contexts/AuthContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { DashboardSkeleton } from "@/components/ui/ShimmerSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import mieterLogo from "@/assets/mieter-logo.svg";

import { IconBadge } from "@/components/ui/IconBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Euro, 
  AlertTriangle, 
  Gauge, 
  Wrench,
  ChevronRight,
  Calendar,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ToolPromotion } from "@/components/tools/ToolPromotion";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

function getDaysUntilDue(dueDate: Date | null): number {
  if (!dueDate) return 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.name?.split(' ')[0] || "Mieter";
  const { data, isLoading } = useDashboardData();

  return (
    <MobileLayout>
      {/* Hero Header */}
      <div className="px-4 pt-12 pb-10">
        <div className="flex items-center gap-4">
          <img src={mieterLogo} alt="Fintutto Mieter" className="w-14 h-14 rounded-2xl shadow-lg" />
          <div>
            <p className="text-white/70 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-white">
              {userName}!
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="px-4 -mt-6 space-y-4 pb-4">
          {/* Next Rent Card */}
          <RentCard nextRent={data?.nextRent ?? null} />

          {/* Open Issues Card */}
          <IssuesCard count={data?.openIssuesCount ?? 0} />

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">
              Schnellzugriff
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/zaehler-ablesen">
                <AnimatedCard delay={200} accentColor="mint" className="h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl gradient-mint flex items-center justify-center mb-3 shadow-lg shadow-mint/20 animate-float">
                      <Gauge className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">Zähler ablesen</span>
                  </CardContent>
                </AnimatedCard>
              </Link>
              <Link to="/mangel-melden">
                <AnimatedCard delay={250} accentColor="coral" className="h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl gradient-coral flex items-center justify-center mb-3 shadow-lg shadow-coral/20 animate-float" style={{ animationDelay: "0.5s" }}>
                      <Wrench className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white/90">Mangel melden</span>
                  </CardContent>
                </AnimatedCard>
              </Link>
            </div>
          </div>

          {/* Tool Promotion */}
          <ToolPromotion context="dashboard" maxItems={2} title="Ihre Mieterrechte prüfen" />

          {/* Last Messages */}
          <MessagesSection messages={data?.lastMessages ?? []} />
        </div>
      )}
    </MobileLayout>
  );
}

function RentCard({ nextRent }: { nextRent: { amount: number; dueDate: Date | null; paymentDay: number } | null }) {
  if (!nextRent) {
    return (
      <AnimatedCard delay={0} accentColor="primary">
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

  const daysUntilDue = getDaysUntilDue(nextRent.dueDate);
  const progressToPayday = Math.max(0, Math.min(100, ((30 - daysUntilDue) / 30) * 100));

  return (
    <AnimatedCard delay={0} accentColor="primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-white/70 flex items-center gap-2">
          <IconBadge icon={Euro} variant="primary" size="sm" />
          Nächste Mietzahlung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ProgressRing 
              progress={progressToPayday} 
              size={56}
              strokeWidth={5}
              variant={daysUntilDue <= 5 ? "warning" : "primary"}
              showLabel={false}
            />
            <div>
              <p className="text-3xl font-bold text-white">
                {nextRent.amount.toFixed(2)} €
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3.5 w-3.5 text-white/50" />
                <p className="text-sm text-white/60">
                  {daysUntilDue > 0 ? `In ${daysUntilDue} Tagen` : daysUntilDue === 0 ? "Heute fällig" : "Überfällig"}
                </p>
              </div>
            </div>
          </div>
          <Link to="/finanzen">
            <Button variant="ghost" size="sm" className="group text-white/70 hover:text-white hover:bg-white/10">
              Details
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

function IssuesCard({ count }: { count: number }) {
  return (
    <AnimatedCard delay={100} accentColor={count > 0 ? "coral" : "mint"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-white/70 flex items-center gap-2">
          <IconBadge icon={count > 0 ? AlertTriangle : CheckCircle} variant={count > 0 ? "warning" : "success"} size="sm" />
          {count > 0 ? "Offene Meldungen" : "Meldungen"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${count > 0 ? "bg-warning/10" : "bg-success/10"} flex items-center justify-center`}>
              <span className={`text-2xl font-bold ${count > 0 ? "text-warning" : "text-success"}`}>{count}</span>
            </div>
            <div>
              <p className="font-medium text-white/90">{count > 0 ? "Meldungen offen" : "Keine offenen Meldungen"}</p>
              <StatusBadge 
                status={count > 0 ? "warning" : "success"} 
                label={count > 0 ? "In Bearbeitung" : "Alles erledigt"} 
              />
            </div>
          </div>
          <Link to="/meine-meldungen">
            <Button variant="ghost" size="sm" className="group text-white/70 hover:text-white hover:bg-white/10">
              Ansehen
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

function MessagesSection({ messages }: { messages: { id: string; senderName: string; content: string; createdAt: string; isRead: boolean }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide">
        Letzte Nachrichten
      </h2>
      {messages.length === 0 ? (
        <AnimatedCard delay={300}>
          <CardContent className="p-6">
            <EmptyState
              icon={MessageSquare}
              title="Keine Nachrichten"
              description="Sie haben noch keine Nachrichten erhalten."
            />
          </CardContent>
        </AnimatedCard>
      ) : (
        <AnimatedCard delay={300}>
          {messages.map((msg) => (
            <Link key={msg.id} to="/chat">
              <CardContent className="p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors rounded-xl min-h-[64px]">
                <div className="w-12 h-12 rounded-2xl gradient-sky flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {msg.senderName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-white/90">{msg.senderName}</p>
                    {!msg.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
                    )}
                  </div>
                  <p className="text-sm text-white/50 truncate">{msg.content}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false, locale: de })}
                  </span>
                  {!msg.isRead && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white animate-bounce-in">
                      !
                    </span>
                  )}
                </div>
              </CardContent>
            </Link>
          ))}
        </AnimatedCard>
      )}
    </div>
  );
}
