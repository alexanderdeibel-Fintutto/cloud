import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Key, ScrollText, UserPlus } from 'lucide-react';
import { useRoles, useAuditLog, useInvitations } from '@/hooks/useRolesSecurity';

export default function RolesSecurity() {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: auditLog, isLoading: auditLoading } = useAuditLog();
  const { data: invitations } = useInvitations();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rollen & Sicherheit</h1>
          <p className="text-muted-foreground">Rollen, Berechtigungen, Audit-Log und Einladungen</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rollen</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {rolesLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{roles?.length || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audit Eintr.</CardTitle>
              <ScrollText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditLog?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Einladungen</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invitations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{invitations?.filter(i => i.status === 'pending').length || 0} ausstehend</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Berechtigungen</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles?.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) || 0}</div>
              <p className="text-xs text-muted-foreground">uber alle Rollen</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">Rollen ({roles?.length || 0})</TabsTrigger>
            <TabsTrigger value="audit">Audit Log ({auditLog?.length || 0})</TabsTrigger>
            <TabsTrigger value="invitations">Einladungen ({invitations?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rolesLoading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
              ) : roles?.map((role) => (
                <Card key={role.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      {role.is_system && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">System</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{role.description || 'Keine Beschreibung'}</p>
                    <div className="flex gap-1 flex-wrap">
                      {role.permissions?.map(perm => (
                        <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                      ))}
                      {(!role.permissions || role.permissions.length === 0) && (
                        <span className="text-xs text-muted-foreground">Keine Berechtigungen</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Aktion</th>
                    <th className="p-3 text-left text-sm font-medium">Ressource</th>
                    <th className="p-3 text-left text-sm font-medium">User ID</th>
                    <th className="p-3 text-left text-sm font-medium">IP</th>
                    <th className="p-3 text-left text-sm font-medium">Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b"><td colSpan={5} className="p-3"><Skeleton className="h-6 w-full" /></td></tr>
                    ))
                  ) : auditLog?.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/50">
                      <td className="p-3"><Badge variant="outline">{entry.action}</Badge></td>
                      <td className="p-3 text-sm">{entry.resource_type}{entry.resource_id ? ` #${entry.resource_id.slice(0, 8)}` : ''}</td>
                      <td className="p-3"><code className="text-xs">{entry.user_id?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3 text-sm">{String(entry.ip_address || '–')}</td>
                      <td className="p-3 text-sm text-muted-foreground">{entry.created_at ? new Date(entry.created_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!auditLog || auditLog.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Audit-Einträge vorhanden</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">E-Mail</th>
                    <th className="p-3 text-left text-sm font-medium">Rolle</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Eingeladen von</th>
                    <th className="p-3 text-left text-sm font-medium">Lauft ab</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations?.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{inv.email || '–'}</td>
                      <td className="p-3"><Badge variant="outline">{inv.role || '–'}</Badge></td>
                      <td className="p-3">
                        <Badge className={
                          inv.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {inv.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="p-3"><code className="text-xs">{inv.invited_by?.slice(0, 8) || '–'}...</code></td>
                      <td className="p-3 text-sm text-muted-foreground">{inv.expires_at ? new Date(inv.expires_at).toLocaleString('de-DE') : '–'}</td>
                    </tr>
                  ))}
                  {(!invitations || invitations.length === 0) && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Keine Einladungen vorhanden</td></tr>
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
