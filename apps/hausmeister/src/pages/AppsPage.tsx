import { PageHeader } from "@/components/layout/PageHeader";
import { AppGrid, CrossSellBanner, SuitePromoCards } from "@/components/apps";
import { useAppsRegistry } from "@/hooks/useAppsRegistry";
import { useCrossSellTriggers } from "@/hooks/useCrossSellTriggers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, Sparkles } from "lucide-react";

const CURRENT_APP_ID = "hausmeisterpro";

export default function AppsPage() {
  const { data: apps = [], isLoading: appsLoading } = useAppsRegistry();
  const { data: triggers = [] } = useCrossSellTriggers(CURRENT_APP_ID);

  // Get target apps for cross-sell recommendations
  const getAppById = (appId: string) => apps.find(app => app.app_id === appId);

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Fintutto Apps" 
        showBackButton 
      />

      <div className="px-4 py-4 space-y-4">
        {/* Cross-Sell Recommendations */}
        {triggers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Empfehlungen für dich
            </div>
            {triggers.slice(0, 2).map((trigger) => (
              <CrossSellBanner
                key={trigger.id}
                trigger={trigger}
                targetApp={getAppById(trigger.target_app_id)}
              />
            ))}
          </div>
        )}

        {/* Apps Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 gap-2">
              <Grid3X3 className="h-4 w-4" />
              Alle Apps
            </TabsTrigger>
            <TabsTrigger value="immobilien" className="flex-1">
              Immobilien
            </TabsTrigger>
            <TabsTrigger value="andere" className="flex-1">
              Weitere
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <AppGrid 
              apps={apps} 
              currentAppId={CURRENT_APP_ID}
              isLoading={appsLoading}
            />
          </TabsContent>

          <TabsContent value="immobilien" className="mt-4">
            <AppGrid 
              apps={apps.filter(app => app.category === "immobilien")} 
              currentAppId={CURRENT_APP_ID}
              isLoading={appsLoading}
            />
          </TabsContent>

          <TabsContent value="andere" className="mt-4">
            <AppGrid 
              apps={apps.filter(app => app.category !== "immobilien")} 
              currentAppId={CURRENT_APP_ID}
              isLoading={appsLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Suite Promo Cards */}
        <SuitePromoCards />
      </div>
    </div>
  );
}
