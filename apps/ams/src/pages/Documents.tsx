import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Star, Droplets, Layout } from 'lucide-react';
import { useGeneratedDocuments, useDocumentTemplates, useDocumentStats } from '@/hooks/useDocuments';

export default function Documents() {
  const { data: docs, isLoading } = useGeneratedDocuments();
  const { data: templates } = useDocumentTemplates();
  const stats = useDocumentStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumente & Templates</h1>
          <p className="text-muted-foreground">Generierte Dokumente, Vorlagen und Download-Statistiken</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Dokumente</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString('de-DE')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Premium</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.premiumDocs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Wasserzeichen</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.watermarked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">{stats.activeTemplates} aktiv</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="docs">Dokumente ({docs?.length || 0})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({templates?.length || 0})</TabsTrigger>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Dokument</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-left text-sm font-medium">Tool</th>
                    <th className="p-3 text-left text-sm font-medium">App</th>
                    <th className="p-3 text-center text-sm font-medium">Premium</th>
                    <th className="p-3 text-right text-sm font-medium">Downloads</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={7} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : docs?.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium truncate max-w-[200px]">{doc.document_name}</td>
                      <td className="p-3"><Badge variant="outline">{doc.document_type}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{doc.tool_type}</Badge></td>
                      <td className="p-3 text-sm">{doc.source_app || '–'}</td>
                      <td className="p-3 text-center">
                        {doc.is_premium ? <Star className="h-4 w-4 text-yellow-500 mx-auto" /> : '–'}
                      </td>
                      <td className="p-3 text-right">{doc.download_count || 0}</td>
                      <td className="p-3 text-sm text-muted-foreground">{doc.created_at ? new Date(doc.created_at).toLocaleDateString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!docs || docs.length === 0) && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Keine Dokumente vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Template</th>
                    <th className="p-3 text-left text-sm font-medium">Kategorie</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                    <th className="p-3 text-center text-sm font-medium">Premium</th>
                    <th className="p-3 text-left text-sm font-medium">Sync Apps</th>
                  </tr>
                </thead>
                <tbody>
                  {templates?.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{t.name || '–'}</td>
                      <td className="p-3"><Badge variant="outline">{t.category || '–'}</Badge></td>
                      <td className="p-3"><Badge variant="outline">{t.template_type || '–'}</Badge></td>
                      <td className="p-3 text-center">
                        <Badge className={t.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700'}>
                          {t.is_active ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{t.is_premium ? <Star className="h-4 w-4 text-yellow-500 mx-auto" /> : '–'}</td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {t.synced_to_apps?.map(app => <Badge key={app} variant="outline" className="text-xs">{app}</Badge>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!templates || templates.length === 0) && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Templates vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Nach Dokumenttyp</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((count / stats.totalDocs) * 200, 150)}px` }} />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Nach Tool</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byTool).sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
                      <div key={tool} className="flex items-center justify-between">
                        <span className="text-sm">{tool}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-chart-2" style={{ width: `${Math.min((count / stats.totalDocs) * 200, 150)}px` }} />
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
