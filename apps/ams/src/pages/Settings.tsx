import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import { Building2, Palette, Save, Webhook, Key, Users } from 'lucide-react';
import { useApiKeys, useWebhookLogs, useTeamMembers, useUpdateApiKey } from '@/hooks/useSettings';

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
  const { data: webhookLogs, isLoading: webhooksLoading } = useWebhookLogs();
  const { data: team, isLoading: teamLoading } = useTeamMembers();
  const updateKey = useUpdateApiKey();

  const handleSave = () => {
    toast({ title: 'Einstellungen gespeichert', description: 'Ihre Anderungen wurden ubernommen.' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
          <p className="text-muted-foreground">Plattform-Einstellungen, API-Keys, Webhooks und Team</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="api">API-Keys ({apiKeys?.length || 0})</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks ({webhookLogs?.length || 0})</TabsTrigger>
            <TabsTrigger value="team">Team ({team?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><CardTitle>Unternehmensdaten</CardTitle></div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Firmenname</Label><Input placeholder="Ihr Firmenname" /></div>
                <div className="space-y-2"><Label>E-Mail</Label><Input defaultValue={user?.email || ''} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /><CardTitle>Erscheinungsbild</CardTitle></div></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div><Label>Dark Mode</Label><p className="text-sm text-muted-foreground">Dunklen Modus aktivieren</p></div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end"><Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Speichern</Button></div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Prefix</th>
                    <th className="p-3 text-left text-sm font-medium">Berechtigungen</th>
                    <th className="p-3 text-right text-sm font-medium">Nutzung</th>
                    <th className="p-3 text-left text-sm font-medium">Zuletzt genutzt</th>
                    <th className="p-3 text-center text-sm font-medium">Aktiv</th>
                  </tr>
                </thead>
                <tbody>
                  {keysLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : apiKeys && apiKeys.length > 0 ? apiKeys.map((key) => (
                    <tr key={key.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{key.name}</div>
                        <div className="text-xs text-muted-foreground">{key.description || '-'}</div>
                      </td>
                      <td className="p-3"><code className="text-xs">{key.key_prefix}...</code></td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {key.permissions?.slice(0, 3).map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
                          {(key.permissions?.length || 0) > 3 && <Badge variant="outline" className="text-xs">+{(key.permissions?.length || 0) - 3}</Badge>}
                        </div>
                      </td>
                      <td className="p-3 text-right">{key.usage_count || 0}</td>
                      <td className="p-3 text-sm text-muted-foreground">{key.last_used_at ? new Date(key.last_used_at).toLocaleString('de-DE') : 'Nie'}</td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={key.is_active ?? false}
                          onCheckedChange={() => updateKey.mutate({ id: key.id, is_active: !key.is_active })}
                        />
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine API-Keys vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Source</th>
                    <th className="p-3 text-left text-sm font-medium">Event</th>
                    <th className="p-3 text-left text-sm font-medium">Endpoint</th>
                    <th className="p-3 text-right text-sm font-medium">Status</th>
                    <th className="p-3 text-center text-sm font-medium">Processed</th>
                    <th className="p-3 text-left text-sm font-medium">Empfangen</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooksLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={6} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : webhookLogs && webhookLogs.length > 0 ? webhookLogs.map((wh) => (
                    <tr key={wh.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{wh.source}</td>
                      <td className="p-3"><Badge variant="outline">{wh.event_type || '-'}</Badge></td>
                      <td className="p-3 text-sm truncate max-w-[200px]">{wh.endpoint || '-'}</td>
                      <td className="p-3 text-right">
                        <Badge className={
                          (wh.status_code || 0) >= 200 && (wh.status_code || 0) < 300
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : (wh.status_code || 0) >= 400
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-700'
                        }>
                          {wh.status_code || '-'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={wh.processed ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}>
                          {wh.processed ? 'Ja' : 'Nein'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{wh.received_at ? new Date(wh.received_at).toLocaleString('de-DE') : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Keine Webhook-Logs vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">E-Mail</th>
                    <th className="p-3 text-left text-sm font-medium">Rolle</th>
                    <th className="p-3 text-left text-sm font-medium">Beigetreten</th>
                  </tr>
                </thead>
                <tbody>
                  {teamLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={4} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : team && team.length > 0 ? team.map((m: any) => (
                    <tr key={m.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{m.full_name || m.display_name || '-'}</td>
                      <td className="p-3 text-sm">{m.email || '-'}</td>
                      <td className="p-3"><Badge variant="outline">{m.role || 'user'}</Badge></td>
                      <td className="p-3 text-sm text-muted-foreground">{m.created_at ? new Date(m.created_at).toLocaleDateString('de-DE') : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Keine Team-Mitglieder vorhanden</td></tr>
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
