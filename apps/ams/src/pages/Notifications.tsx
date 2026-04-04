import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Mail, Eye, EyeOff } from 'lucide-react';
import { useNotifications, useEmailEvents, useNotificationStats } from '@/hooks/useNotifications';

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: emails } = useEmailEvents();
  const stats = useNotificationStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benachrichtigungen & E-Mails</h1>
          <p className="text-muted-foreground">Push-Notifications und E-Mail-Events uberwachen</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ungelesen</CardTitle>
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">E-Mails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmails}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Nach Typ</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byType).length}</div>
              <p className="text-xs text-muted-foreground">verschiedene Typen</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications">Notifications ({notifications?.length || 0})</TabsTrigger>
            <TabsTrigger value="emails">E-Mail Events ({emails?.length || 0})</TabsTrigger>
            <TabsTrigger value="stats">Statistiken</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Titel</th>
                    <th className="p-3 text-left text-sm font-medium">Nachricht</th>
                    <th className="p-3 text-left text-sm font-medium">Typ</th>
                    <th className="p-3 text-center text-sm font-medium">Gelesen</th>
                    <th className="p-3 text-left text-sm font-medium">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={5} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : notifications?.map((n) => (
                    <tr key={n.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{n.title || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground truncate max-w-[300px]">{n.message || '–'}</td>
                      <td className="p-3"><Badge variant="outline">{n.type || '–'}</Badge></td>
                      <td className="p-3 text-center">
                        {n.is_read ? <Eye className="h-4 w-4 text-green-500 mx-auto" /> : <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{n.created_at ? new Date(n.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!notifications || notifications.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Notifications vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Event</th>
                    <th className="p-3 text-left text-sm font-medium">E-Mail</th>
                    <th className="p-3 text-left text-sm font-medium">Betreff</th>
                    <th className="p-3 text-left text-sm font-medium">Template</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {emails?.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <Badge className={
                          e.event_type === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          e.event_type === 'opened' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          e.event_type === 'clicked' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                          e.event_type === 'bounced' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {e.event_type || '–'}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{e.email || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground truncate max-w-[200px]">{e.subject || '–'}</td>
                      <td className="p-3 text-sm">{e.template_id || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground">{e.created_at ? new Date(e.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!emails || emails.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine E-Mail Events vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">Notifications nach Typ</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm">{type}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">E-Mails nach Event</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.emailByEvent).sort((a, b) => b[1] - a[1]).map(([event, count]) => (
                      <div key={event} className="flex items-center justify-between">
                        <span className="text-sm">{event}</span>
                        <span className="text-sm font-medium">{count}</span>
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
