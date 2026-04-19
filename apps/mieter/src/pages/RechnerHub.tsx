import { MobileLayout } from "@/components/layout/MobileLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreditsDisplay } from "@/components/tools/CreditsDisplay";
import { ToolCard } from "@/components/tools/ToolCard";
import { Calculator } from "lucide-react";
import { RECHNER } from "@/lib/toolCatalog";

export default function RechnerHub() {
  return (
    <MobileLayout>
      <PageHeader title="Rechner" subtitle="Berechnungen rund um Ihre Wohnung" />

      <div className="px-4 -mt-2 space-y-4 pb-6">
        <CreditsDisplay />

        <div>
          <h2 className="text-sm font-semibold text-white/80 mb-3 px-1 uppercase tracking-wide flex items-center gap-2">
            <Calculator className="h-3.5 w-3.5" />
            {RECHNER.length} Rechner verfügbar
          </h2>
          <div className="space-y-3">
            {RECHNER.map((rechner, i) => (
              <ToolCard key={rechner.id} tool={rechner} delay={100 + i * 50} />
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
