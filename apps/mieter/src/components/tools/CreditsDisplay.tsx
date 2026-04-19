import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, ArrowRight } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Link } from "react-router-dom";

interface CreditsDisplayProps {
  compact?: boolean;
}

export function CreditsDisplay({ compact = false }: CreditsDisplayProps) {
  const { credits, isPro, isLoading } = useCredits();

  if (isLoading) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.06]">
        {isPro ? (
          <>
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Pro</span>
          </>
        ) : (
          <>
            <Coins className="h-4 w-4 text-warning" />
            <span className="text-xs font-bold text-white/90">{credits.balance}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <AnimatedCard delay={0} accentColor={isPro ? "primary" : "amber"}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              isPro ? "gradient-primary" : "bg-warning/20"
            }`}>
              {isPro ? (
                <Sparkles className="h-6 w-6 text-white" />
              ) : (
                <Coins className="h-6 w-6 text-warning" />
              )}
            </div>
            <div>
              {isPro ? (
                <>
                  <p className="font-bold text-white/90">Pro-Abo aktiv</p>
                  <p className="text-xs text-white/50">Unbegrenzte Tool-Nutzung</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white/90">{credits.balance}</p>
                  <p className="text-xs text-white/50">Credits verfügbar</p>
                </>
              )}
            </div>
          </div>

          {!isPro && (
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="group text-white/70 hover:text-white">
                Aufladen
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
