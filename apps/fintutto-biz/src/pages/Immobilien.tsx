import { MainLayout } from "@/components/layout/MainLayout";
import { useBuildings } from "@/hooks/useBuildings";
import { formatEuro } from "@/lib/utils";
import {
  Building2,
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ExternalLink,
  Home,
} from "lucide-react";

export default function Immobilien() {
  const { buildings, buildingFinancials, isLoading } = useBuildings();

  // Finanzübersicht einem Gebäude zuordnen
  const getBuildingFinancials = (buildingId: string) =>
    buildingFinancials.find((f) => f.building_id === buildingId);

  if (isLoading) {
    return (
      <MainLayout title="Immobilien">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Gebäude...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Immobilien">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Immobilien</h2>
            <p className="text-muted-foreground mt-1">
              Gebäude aus Vermietify — Finanzdaten aus Financial Kompass
            </p>
          </div>
          <a
            href="/vermietify"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            In Vermietify verwalten
          </a>
        </div>

        {/* Gesamtübersicht */}
        {buildingFinancials.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Home className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gebäude gesamt</p>
                  <p className="text-2xl font-bold text-white">{buildings.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Einnahmen gesamt</p>
                  <p className="text-2xl font-bold text-white">
                    {formatEuro(buildingFinancials.reduce((s, f) => s + Number(f.total_revenue), 0))}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ausgaben gesamt</p>
                  <p className="text-2xl font-bold text-white">
                    {formatEuro(buildingFinancials.reduce((s, f) => s + Number(f.total_expenses), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gebäudeliste */}
        {buildings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Noch keine Gebäude angelegt
            </h3>
            <p className="text-muted-foreground mb-6">
              Lege dein erstes Gebäude in Vermietify an — es erscheint dann automatisch hier.
            </p>
            <a
              href="/vermietify"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Zu Vermietify
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {buildings.map((building) => {
              const fin = getBuildingFinancials(building.id);
              const profit = fin ? Number(fin.total_revenue) - Number(fin.total_expenses) : 0;
              const isProfitable = profit >= 0;

              return (
                <div
                  key={building.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition-colors"
                >
                  {/* Gebäude-Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{building.name}</h3>
                      {(building.address || building.city) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {[building.address, building.postal_code, building.city]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Finanzkennzahlen */}
                  {fin ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Einnahmen</span>
                        <span className="text-green-400 font-medium">
                          {formatEuro(Number(fin.total_revenue))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ausgaben</span>
                        <span className="text-red-400 font-medium">
                          {formatEuro(Number(fin.total_expenses))}
                        </span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold">
                        <span className="text-muted-foreground">Ergebnis</span>
                        <span className={isProfitable ? "text-green-400" : "text-red-400"}>
                          {isProfitable ? "+" : ""}{formatEuro(profit)}
                        </span>
                      </div>
                      {(fin.expense_count > 0 || fin.invoice_count > 0) && (
                        <div className="flex gap-3 pt-1">
                          {fin.invoice_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {fin.invoice_count} Rechnung{fin.invoice_count !== 1 ? "en" : ""}
                            </span>
                          )}
                          {fin.expense_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {fin.expense_count} Ausgabe{fin.expense_count !== 1 ? "n" : ""}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Noch keine Finanzdaten zugeordnet</span>
                    </div>
                  )}

                  {/* Gebäudetyp Badge */}
                  {building.building_type && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">
                        {building.building_type}
                      </span>
                      {building.total_area && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {building.total_area} m²
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Hinweis: Ausgaben/Rechnungen einem Gebäude zuordnen */}
        {buildings.length > 0 && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Tipp: Ausgaben & Rechnungen zuordnen</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Beim Erfassen von Ausgaben oder Rechnungen kannst du ein Gebäude auswählen.
                  So siehst du hier automatisch die Finanzkennzahlen pro Immobilie.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
