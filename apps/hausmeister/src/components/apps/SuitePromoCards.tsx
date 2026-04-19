import { useState } from "react";
import { ExternalLink, Share2, Copy, Check, Building2, Users, Gauge, Receipt, FileText, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useAppsRegistry";
import { useAppsRegistry } from "@/hooks/useAppsRegistry";
import { useGetOrCreateReferralCode, buildReferralLink } from "@/hooks/useReferral";
import { toast } from "sonner";

const APP_ICONS: Record<string, React.ElementType> = {
  vermietify: Building2,
  mieterapp: Users,
  zaehler: Gauge,
  nebenkosten: Receipt,
  formulare: ClipboardList,
};

const APP_TAGLINES: Record<string, string> = {
  vermietify: "Mietverwaltung & Buchhaltung",
  mieterapp: "Kommunikation mit Mietern",
  zaehler: "Zählerstand-Erfassung",
  nebenkosten: "Nebenkostenabrechnung",
  formulare: "Digitale Formulare & Protokolle",
};

// Show all 6 suite apps (excluding current app hausmeisterpro)
const SUITE_APP_IDS = ["vermietify", "mieterapp", "zaehler", "nebenkosten", "formulare"];

interface SuitePromoCardsProps {
  compact?: boolean;
}

export function SuitePromoCards({ compact = false }: SuitePromoCardsProps) {
  const { data: apps = [] } = useAppsRegistry();
  const { data: products = [] } = useProducts();
  const createCode = useGetOrCreateReferralCode();
  const [copiedApp, setCopiedApp] = useState<string | null>(null);
  const [referralCodes, setReferralCodes] = useState<Record<string, string>>({});

  const suiteApps = apps.filter((a) => SUITE_APP_IDS.includes(a.app_id));

  const getLowestPrice = (appId: string) => {
    const appProducts = products.filter((p) => p.app_id === appId && p.price_monthly);
    if (appProducts.length === 0) return null;
    return Math.min(...appProducts.map((p) => p.price_monthly!));
  };

  const handleShare = async (app: typeof suiteApps[0]) => {
    try {
      // Get or create referral code first
      let code = referralCodes[app.app_id];
      if (!code) {
        const result = await createCode.mutateAsync(app.app_id);
        code = result.code;
        setReferralCodes((prev) => ({ ...prev, [app.app_id]: code }));
      }

      const link = buildReferralLink(code, app.url || undefined);
      const text = `Teste ${app.name} – erster Monat gratis mit meinem Einladungslink!`;

      if (navigator.share) {
        try {
          await navigator.share({ title: app.name, text, url: link });
        } catch { /* cancelled */ }
      } else {
        await navigator.clipboard.writeText(`${text}\n${link}`);
        setCopiedApp(app.app_id);
        toast.success("Einladungslink kopiert!");
        setTimeout(() => setCopiedApp(null), 2000);
      }
    } catch {
      toast.error("Fehler beim Erstellen des Einladungslinks");
    }
  };

  if (suiteApps.length === 0) return null;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Fintutto Suite
          </h3>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      <div className={compact ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
        {suiteApps.map((app) => {
          const Icon = APP_ICONS[app.app_id] || Building2;
          const lowestPrice = getLowestPrice(app.app_id);
          const tagline = APP_TAGLINES[app.app_id] || app.description;
          const isCopied = copiedApp === app.app_id;

          if (compact) {
            return (
              <Card
                key={app.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  borderColor: `${app.color}30`,
                }}
                onClick={() => app.url && window.open(app.url, "_blank")}
              >
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${app.color}, transparent 70%)`,
                  }}
                />
                <CardContent className="p-3 relative">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: app.color }} />
                  </div>
                  <h4 className="font-semibold text-xs">{app.name}</h4>
                  {lowestPrice && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ab €{lowestPrice.toFixed(2)}/Mo
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={app.id}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: `${app.color}25`,
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
                style={{
                  background: `linear-gradient(135deg, ${app.color} 0%, transparent 60%)`,
                }}
              />
              <CardContent className="p-4 relative">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${app.color}, ${app.color}CC)`,
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{app.name}</h4>
                      {lowestPrice && (
                        <span
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${app.color}15`,
                            color: app.color,
                          }}
                        >
                          ab €{lowestPrice.toFixed(2)}/Mo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tagline}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 flex-1"
                        style={{
                          backgroundColor: app.color,
                          color: "white",
                        }}
                        onClick={() => app.url && window.open(app.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Jetzt entdecken
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(app);
                        }}
                      >
                        {isCopied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Share2 className="h-3 w-3" />
                        )}
                        {isCopied ? "Kopiert" : "Einladen"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
