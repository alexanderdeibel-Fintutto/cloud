import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreditsDisplay } from "@/components/tools/CreditsDisplay";
import { ToolCard } from "@/components/tools/ToolCard";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles } from "lucide-react";
import { FORMULARE } from "@/lib/toolCatalog";
import { useCredits } from "@/hooks/useCredits";
import { Link } from "react-router-dom";

export default function FormulareHub() {
  const { isPro } = useCredits();

  return (
    <MobileLayout>
      <PageHeader title="Formulare" subtitle="Rechtssichere Dokumente für Mieter" />

      <div className="px-4 -mt-2 space-y-4 pb-6">
        <CreditsDisplay />

        {!isPro && (
          <AnimatedCard delay={50} accentColor="primary">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white/90">Mieter Schutz-Paket</p>
                  <p className="text-xs text-white/50">Alle wichtigen Formulare zum Bundle-Preis</p>
                </div>
              </div>
              <Link to="/pricing">
                <Button size="sm" className="w-full">
                  Pakete vergleichen
                </Button>
              </Link>
            </CardContent>
          </AnimatedCard>
        )}

        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {FORMULARE.length} Formulare für Mieter
          </h2>
          <div className="space-y-3">
            {FORMULARE.map((formular, i) => (
              <ToolCard key={formular.id} tool={formular} delay={100 + i * 50} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
