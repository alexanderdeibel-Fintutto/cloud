import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreditsDisplay } from "@/components/tools/CreditsDisplay";
import { ToolCard } from "@/components/tools/ToolCard";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";
import { CHECKERS, BUNDLES, CHECKER_ABOS } from "@/lib/toolCatalog";
import { useCredits } from "@/hooks/useCredits";
import { Link } from "react-router-dom";

export default function CheckerHub() {
  const { isPro } = useCredits();

  return (
    <MobileLayout>
      <PageHeader title="Mietrecht-Checker" subtitle="Prüfen Sie Ihre Rechte als Mieter" />

      <div className="px-4 -mt-2 space-y-4 pb-6">
        {/* Credits Status */}
        <CreditsDisplay />

        {/* Pro Upsell Banner */}
        {!isPro && (
          <AnimatedCard delay={50} accentColor="primary">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white/90">Mieter-Checker Abo</p>
                  <p className="text-xs text-white/50">ab €0,99/Monat – 3 Checks inklusive</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-3">
                Oder upgraden Sie auf Pro für unbegrenzten Zugang zu allen Checkern und Formularen.
              </p>
              <Link to="/pricing">
                <Button size="sm" className="w-full">
                  Pläne vergleichen
                </Button>
              </Link>
            </CardContent>
          </AnimatedCard>
        )}

        {/* All Checkers */}
        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            10 Checker verfügbar
          </h2>
          <div className="space-y-3">
            {CHECKERS.map((checker, i) => (
              <ToolCard key={checker.id} tool={checker} delay={100 + i * 50} />
            ))}
          </div>
        </div>

        {/* Bundle Hint */}
        {!isPro && (
          <AnimatedCard delay={700} accentColor="mint">
            <CardContent className="p-5 text-center">
              <p className="font-bold text-white/90 mb-1">
                💡 Mieter-Schutzpaket
              </p>
              <p className="text-sm text-white/60 mb-3">
                Alle 10 Checker zum Vorteilspreis – sparen Sie über 50%!
              </p>
              <a href="https://portal.fintutto.cloud/pricing" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-white/70 hover:text-white">
                  Pakete ansehen
                </Button>
              </a>
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </MobileLayout>
  );
}
