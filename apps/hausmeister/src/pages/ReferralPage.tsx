import { useState } from "react";
import { Copy, Check, Share2, Gift, TrendingUp, Users, Euro } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferralStats, useGetOrCreateReferralCode, buildReferralLink } from "@/hooks/useReferral";
import { useAppsRegistry } from "@/hooks/useAppsRegistry";
import { toast } from "sonner";

export default function ReferralPage() {
  const { data: stats, isLoading } = useReferralStats();
  const { data: apps = [] } = useAppsRegistry();
  const createCode = useGetOrCreateReferralCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyLink = async (code: string, appUrl?: string) => {
    const link = buildReferralLink(code, appUrl);
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success("Einladungslink kopiert!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShare = async (code: string, appName: string, appUrl?: string) => {
    const link = buildReferralLink(code, appUrl);
    const text = `Teste ${appName} und spare 20% mit meinem Einladungslink!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${appName} – Einladung`, text, url: link });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${text}\n${link}`);
      toast.success("Einladungslink kopiert!");
    }
  };

  const handleGenerateCode = (appId: string) => {
    createCode.mutate(appId, {
      onError: () => toast.error("Fehler beim Erstellen des Codes"),
    });
  };

  const getAppInfo = (appId: string) => apps.find((a) => a.app_id === appId);

  return (
    <div className="min-h-screen">
      <PageHeader title="Empfehlungen" showBackButton />

      <div className="px-4 py-4 space-y-4">
        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              {isLoading ? (
                <Skeleton className="h-6 w-10 mx-auto" />
              ) : (
                <p className="text-xl font-bold">{stats?.stats.total_clicks ?? 0}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Klicks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
              {isLoading ? (
                <Skeleton className="h-6 w-10 mx-auto" />
              ) : (
                <p className="text-xl font-bold">{stats?.stats.total_converted ?? 0}</p>
              )}
              <p className="text-[10px] text-muted-foreground">Conversions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Euro className="h-5 w-5 mx-auto mb-1 text-primary" />
              {isLoading ? (
                <Skeleton className="h-6 w-10 mx-auto" />
              ) : (
                <p className="text-xl font-bold">
                  €{(stats?.stats.total_saved ?? 0).toFixed(0)}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">Gespart</p>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
              <h3 className="font-semibold text-sm">1 Monat gratis für deine Kontakte</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Teile deinen persönlichen Einladungslink. Deine Kontakte erhalten
                  den ersten Monat jeder Fintutto App komplett kostenlos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Codes per App */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Deine Einladungscodes
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {(stats?.codes ?? []).map((rc) => {
                const app = getAppInfo(rc.app_id);
                const isCopied = copiedCode === rc.code;
                return (
                  <Card key={rc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sm">{app?.name ?? rc.app_id}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{rc.code}</p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {rc.uses_count} Nutzungen
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs gap-1"
                          onClick={() => handleCopyLink(rc.code, app?.url ?? undefined)}
                        >
                          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {isCopied ? "Kopiert" : "Link kopieren"}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs gap-1"
                          onClick={() => handleShare(rc.code, app?.name ?? rc.app_id, app?.url ?? undefined)}
                        >
                          <Share2 className="h-3 w-3" />
                          Teilen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Generate for apps without codes */}
              {apps
                .filter((a) => !(stats?.codes ?? []).some((c) => c.app_id === a.app_id))
                .map((app) => (
                  <Card key={app.app_id} className="border-dashed">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{app.name}</h4>
                        <p className="text-xs text-muted-foreground">Noch kein Code erstellt</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleGenerateCode(app.app_id)}
                        disabled={createCode.isPending}
                      >
                        Code erstellen
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
