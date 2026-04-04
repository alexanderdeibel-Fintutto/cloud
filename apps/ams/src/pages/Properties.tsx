import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, Building2, SquareStack, Ruler, Zap } from 'lucide-react';
import { useBuildingsSummary, useEnergyProviders, useMietpreisbremseGebiete, usePropertyStats } from '@/hooks/useProperties';

export default function Properties() {
  const { data: buildings, isLoading } = useBuildingsSummary();
  const { data: providers } = useEnergyProviders();
  const { data: gebiete } = useMietpreisbremseGebiete();
  const stats = usePropertyStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Immobilien-Ubersicht</h1>
          <p className="text-muted-foreground">Gebaude, Einheiten, Energieversorger und Mietpreisbremse</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gebaude</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuildings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Einheiten</CardTitle>
              <SquareStack className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUnits}</div>
              <p className="text-xs text-muted-foreground">{stats.occupiedUnits} belegt</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gesamtflache</CardTitle>
              <Ruler className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArea.toLocaleString('de-DE')} m²</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Leerstand</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgVacancy}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Versorger</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="buildings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="buildings">Gebaude ({buildings?.length || 0})</TabsTrigger>
            <TabsTrigger value="providers">Energieversorger ({providers?.length || 0})</TabsTrigger>
            <TabsTrigger value="mietpreisbremse">Mietpreisbremse ({gebiete?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="buildings" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Gebaude</th>
                    <th className="p-3 text-left text-sm font-medium">Adresse</th>
                    <th className="p-3 text-right text-sm font-medium">Einheiten</th>
                    <th className="p-3 text-right text-sm font-medium">Belegt</th>
                    <th className="p-3 text-right text-sm font-medium">Leerstand</th>
                    <th className="p-3 text-right text-sm font-medium">Flache</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : buildings?.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{b.name || '–'}</td>
                      <td className="p-3 text-sm">{b.street} {b.house_number}, {b.zip} {b.city}</td>
                      <td className="p-3 text-right">{b.total_units || 0}</td>
                      <td className="p-3 text-right">{b.occupied_units || 0}</td>
                      <td className="p-3 text-right">
                        <Badge className={
                          (b.vacancy_rate || 0) > 10 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          (b.vacancy_rate || 0) > 5 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }>
                          {(b.vacancy_rate || 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-3 text-right">{b.total_area ? `${b.total_area.toLocaleString('de-DE')} m²` : '–'}</td>
                    </tr>
                  ))}
                  {(!buildings || buildings.length === 0) && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Gebaude vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Versorger</th>
                    <th className="p-3 text-left text-sm font-medium">Daten</th>
                  </tr>
                </thead>
                <tbody>
                  {providers?.map((p: Record<string, unknown>) => (
                    <tr key={p.id as string} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{(p.name as string) || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{(p.city as string) || ''} {(p.website as string) || ''}</td>
                    </tr>
                  ))}
                  {(!providers || providers.length === 0) && (
                    <tr><td colSpan={2} className="p-8 text-center text-muted-foreground">Keine Versorger vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="mietpreisbremse" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Gebiet</th>
                    <th className="p-3 text-left text-sm font-medium">Daten</th>
                  </tr>
                </thead>
                <tbody>
                  {gebiete?.map((g: Record<string, unknown>) => (
                    <tr key={g.id as string} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{(g.city as string) || (g.name as string) || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {(g.state as string) || ''} – Gueltig: {(g.valid_from as string) || '–'} bis {(g.valid_until as string) || '–'}
                      </td>
                    </tr>
                  ))}
                  {(!gebiete || gebiete.length === 0) && (
                    <tr><td colSpan={2} className="p-8 text-center text-muted-foreground">Keine Mietpreisbremse-Gebiete vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
