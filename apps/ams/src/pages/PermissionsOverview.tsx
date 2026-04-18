import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Lock,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Database,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Key,
  Zap,
} from 'lucide-react';

const SUPERADMIN_EMAILS = ['admin@fintutto.de', 'alexander@fintutto.world', 'alexander@fintutto.de'];

// ─── Typen ────────────────────────────────────────────────────────────────────
interface PolicyEntry {
  name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  role: 'authenticated' | 'anon' | 'service_role' | 'all';
  condition: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface TablePermission {
  table: string;
  schema: string;
  rlsEnabled: boolean;
  description: string;
  policies: PolicyEntry[];
  recommendations: string[];
  status: 'secure' | 'warning' | 'critical';
}

// ─── Berechtigungsdaten (aus Migrations-Dateien extrahiert) ───────────────────
const TABLE_PERMISSIONS: TablePermission[] = [
  {
    table: 'profiles',
    schema: 'public',
    rlsEnabled: true,
    description: 'Nutzerprofile — zentrale Tabelle für alle Portal-Apps',
    status: 'secure',
    policies: [
      { name: 'profiles_superadmin_select', operation: 'SELECT', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'profiles_superadmin_update', operation: 'UPDATE', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
    ],
    recommendations: [
      'Eigenes Profil lesen: Policy "users_own_select" (user_id = auth.uid()) sollte vorhanden sein',
      'Eigenes Profil aktualisieren: Policy "users_own_update" sicherstellen',
      'app_source-Spalte: Sicherstellen dass Apps beim Registrieren ihren app_source setzen',
    ],
  },
  {
    table: 'organizations',
    schema: 'public',
    rlsEnabled: true,
    description: 'Organisationen / Mandanten — für Vermietify und Business-Apps',
    status: 'warning',
    policies: [
      { name: 'organizations_superadmin_select', operation: 'SELECT', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
    ],
    recommendations: [
      'Mitglieder-Policy fehlt: Nutzer sollten ihre eigenen Organisationen lesen können (member_id = auth.uid())',
      'Insert-Policy prüfen: Wer darf neue Organisationen anlegen?',
      'app_source-Isolation: Organisationen einer App sollten nicht in anderen Apps sichtbar sein',
    ],
  },
  {
    table: 'subscriptions',
    schema: 'public',
    rlsEnabled: true,
    description: 'Abonnements — Billing-Daten für alle Apps',
    status: 'warning',
    policies: [
      { name: 'subscriptions_superadmin_select', operation: 'SELECT', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
    ],
    recommendations: [
      'Eigene Abos lesen: Policy "subs_own_select" (user_id = auth.uid()) prüfen',
      'app_id-Isolation: Nutzer sollten nur Abos ihrer eigenen App sehen',
      'Service-Role für Billing: Stripe-Webhooks sollten über Service-Role schreiben',
    ],
  },
  {
    table: 'user_activity_log',
    schema: 'public',
    rlsEnabled: true,
    description: 'Aktivitäts-Log — zentrale Nutzungsmetriken für alle Apps',
    status: 'secure',
    policies: [
      { name: 'ual_own_select', operation: 'SELECT', role: 'authenticated', condition: 'user_id = auth.uid() OR is_superadmin()', riskLevel: 'low' },
      { name: 'ual_own_insert', operation: 'INSERT', role: 'authenticated', condition: 'user_id = auth.uid() OR is_superadmin()', riskLevel: 'low' },
      { name: 'ual_superadmin_all', operation: 'ALL', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'ual_deny_anon', operation: 'ALL', role: 'anon', condition: 'false', riskLevel: 'low' },
    ],
    recommendations: [
      'log_activity() RPC-Funktion: SECURITY DEFINER — sicher, kein direkter Tabellenzugriff nötig',
      'Retention-Policy: Alte Logs (> 12 Monate) regelmäßig löschen (Cron-Job empfohlen)',
    ],
  },
  {
    table: 'api_status_log',
    schema: 'public',
    rlsEnabled: true,
    description: 'API-Status-Logs — Monitoring für alle externen API-Endpunkte',
    status: 'secure',
    policies: [
      { name: 'api_status_log_authenticated_select', operation: 'SELECT', role: 'authenticated', condition: 'true', riskLevel: 'low' },
      { name: 'api_status_log_superadmin_insert', operation: 'INSERT', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'api_status_log_superadmin_update', operation: 'UPDATE', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'api_status_log_superadmin_delete', operation: 'DELETE', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'api_status_log_deny_anon', operation: 'ALL', role: 'anon', condition: 'false', riskLevel: 'low' },
    ],
    recommendations: [
      'Status: Gut konfiguriert — alle Nutzer können lesen, nur Superadmin schreibt',
    ],
  },
  {
    table: 'admin_logs',
    schema: 'public',
    rlsEnabled: true,
    description: 'Admin-Aktionslogs — Audit-Trail für administrative Aktionen',
    status: 'secure',
    policies: [
      { name: 'admin_logs_own_select', operation: 'SELECT', role: 'authenticated', condition: 'user_id = auth.uid() OR is_superadmin()', riskLevel: 'low' },
      { name: 'admin_logs_authenticated_insert', operation: 'INSERT', role: 'authenticated', condition: 'user_id = auth.uid() OR is_superadmin()', riskLevel: 'low' },
      { name: 'admin_logs_deny_anon', operation: 'ALL', role: 'anon', condition: 'false', riskLevel: 'low' },
    ],
    recommendations: [
      'Audit-Trail: Logs sollten unveränderlich sein — UPDATE/DELETE-Policies blockieren',
    ],
  },
  {
    table: 'apps_registry',
    schema: 'public',
    rlsEnabled: true,
    description: 'App-Registry — Metadaten aller Portal-Apps',
    status: 'secure',
    policies: [
      { name: 'apps_registry_superadmin_all', operation: 'ALL', role: 'authenticated', condition: 'is_superadmin()', riskLevel: 'low' },
      { name: 'apps_registry_authenticated_select', operation: 'SELECT', role: 'authenticated', condition: 'true', riskLevel: 'low' },
      { name: 'apps_registry_anon_select_public', operation: 'SELECT', role: 'anon', condition: 'is_public = true', riskLevel: 'low' },
    ],
    recommendations: [
      'Status: Gut konfiguriert — öffentliche Apps für Anon sichtbar, alle für Auth',
    ],
  },
];

// ─── Verbesserungsvorschläge (priorisiert) ────────────────────────────────────
const IMPROVEMENTS = [
  {
    priority: 'hoch',
    title: 'app_source-basierte Datenisolation',
    description: 'Nutzer einer App sollten standardmäßig nur Daten ihrer eigenen App sehen. Aktuell fehlen app_source-basierte RLS-Policies für profiles, organizations und subscriptions.',
    sql: `-- Beispiel: Nutzer sehen nur Profile ihrer App
CREATE POLICY "profiles_app_source_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    app_source = current_setting('app.current_app_id', true)
    OR is_superadmin()
  );`,
    status: 'offen',
  },
  {
    priority: 'hoch',
    title: 'Service-Role-Key für AMS-Backend',
    description: 'Das AMS sollte für administrative Operationen den Service-Role-Key verwenden, nicht den Anon-Key. Damit können RLS-Policies umgangen werden wenn nötig.',
    sql: `-- In Vercel-Umgebungsvariablen:
SUPABASE_SERVICE_ROLE_KEY=eyJ... (bereits gesetzt)
-- Im AMS-Backend-Code:
const adminClient = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});`,
    status: 'teilweise',
  },
  {
    priority: 'mittel',
    title: 'Eigene Profil-Policies für alle Nutzer',
    description: 'Jeder Nutzer sollte sein eigenes Profil lesen und aktualisieren können. Prüfen ob "users_own_select" und "users_own_update" Policies existieren.',
    sql: `CREATE POLICY "profiles_own_select"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_superadmin());

CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_superadmin());`,
    status: 'offen',
  },
  {
    priority: 'mittel',
    title: 'Audit-Log unveränderlich machen',
    description: 'admin_logs sollte keine UPDATE/DELETE-Policies haben — Audit-Trails müssen unveränderlich sein.',
    sql: `-- UPDATE und DELETE für admin_logs blockieren:
DROP POLICY IF EXISTS "admin_logs_update" ON public.admin_logs;
DROP POLICY IF EXISTS "admin_logs_delete" ON public.admin_logs;
-- Keine neuen UPDATE/DELETE-Policies anlegen`,
    status: 'offen',
  },
  {
    priority: 'niedrig',
    title: 'Retention-Policy für user_activity_log',
    description: 'Alte Aktivitätslogs (> 12 Monate) sollten regelmäßig gelöscht werden um die Datenbankgröße zu kontrollieren.',
    sql: `-- Cron-Job (pg_cron) für monatliche Bereinigung:
SELECT cron.schedule(
  'cleanup-activity-log',
  '0 2 1 * *',  -- 1. jeden Monats um 02:00
  $$DELETE FROM public.user_activity_log
    WHERE created_at < now() - interval '12 months'$$
);`,
    status: 'offen',
  },
  {
    priority: 'niedrig',
    title: 'Row-Level Security für tenants-Tabelle',
    description: 'Prüfen ob die tenants-Tabelle RLS aktiviert hat und ob Nutzer nur ihre eigenen Tenants sehen können.',
    sql: `ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_own_select"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid() OR is_superadmin());`,
    status: 'offen',
  },
];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'secure' | 'warning' | 'critical' }) {
  if (status === 'secure') return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">Sicher</Badge>;
  if (status === 'warning') return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">Warnung</Badge>;
  return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">Kritisch</Badge>;
}

function OperationIcon({ op }: { op: PolicyEntry['operation'] }) {
  const cls = 'h-3.5 w-3.5';
  if (op === 'SELECT') return <Eye className={`${cls} text-blue-500`} />;
  if (op === 'INSERT') return <Plus className={`${cls} text-emerald-500`} />;
  if (op === 'UPDATE') return <Edit className={`${cls} text-amber-500`} />;
  if (op === 'DELETE') return <Trash2 className={`${cls} text-red-500`} />;
  return <Zap className={`${cls} text-violet-500`} />;
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === 'hoch') return <Badge variant="destructive" className="text-xs">Hoch</Badge>;
  if (priority === 'mittel') return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs">Mittel</Badge>;
  return <Badge variant="secondary" className="text-xs">Niedrig</Badge>;
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
export default function PermissionsOverview() {
  const { user } = useAuth();
  const isSuperAdmin = user?.email ? SUPERADMIN_EMAILS.includes(user.email) : false;

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="rounded-full bg-muted p-6">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Zugriff verweigert</h2>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            Diese Seite ist ausschließlich für Superadmins zugänglich.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const secureCount = TABLE_PERMISSIONS.filter(t => t.status === 'secure').length;
  const warningCount = TABLE_PERMISSIONS.filter(t => t.status === 'warning').length;
  const criticalCount = TABLE_PERMISSIONS.filter(t => t.status === 'critical').length;
  const totalPolicies = TABLE_PERMISSIONS.reduce((sum, t) => sum + t.policies.length, 0);
  const highPrioImprovements = IMPROVEMENTS.filter(i => i.priority === 'hoch').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Shield className="h-8 w-8 text-violet-500" />
              Supabase-Berechtigungsübersicht
            </h1>
            <p className="text-muted-foreground mt-1">
              RLS-Policies, Tabellensicherheit und Verbesserungsvorschläge für alle Portal-Tabellen
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            Superadmin-Only
          </Badge>
        </div>

        {/* Übersicht-Karten */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Tabellen gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{TABLE_PERMISSIONS.length}</div>
              <p className="text-xs text-muted-foreground mt-1">mit RLS-Konfiguration</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sicher konfiguriert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{secureCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Tabellen ohne Risiko</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Verbesserungsbedarf
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{warningCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Tabellen mit Hinweisen</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-blue-500" />
                Policies gesamt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalPolicies}</div>
              <p className="text-xs text-muted-foreground mt-1">aktive RLS-Regeln</p>
            </CardContent>
          </Card>
        </div>

        {/* is_superadmin() Funktion */}
        <Card className="border-violet-200 dark:border-violet-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-violet-500" />
              Zentrale Sicherheitsfunktion: <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">is_superadmin()</code>
            </CardTitle>
            <CardDescription>
              Alle RLS-Policies verwenden diese Funktion für Superadmin-Zugriff — einheitlich und wartbar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <pre>{`CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        role = 'superadmin'
        OR email IN (
          'alexander@fintutto.world',
          'alexander@fintutto.de',
          'admin@fintutto.de'
        )
      )
  );
$$;`}</pre>
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <span>
                <strong>SECURITY DEFINER</strong>: Die Funktion läuft mit den Rechten des Erstellers, nicht des Aufrufers.
                <strong> STABLE</strong>: Ergebnis wird innerhalb einer Transaktion gecacht — performant für viele Policy-Checks.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tabellen-Berechtigungen */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tabellen-Berechtigungen im Detail
          </h2>
          {TABLE_PERMISSIONS.map(table => (
            <Card key={table.table} className={
              table.status === 'warning' ? 'border-amber-200 dark:border-amber-800' :
              table.status === 'critical' ? 'border-red-200 dark:border-red-800' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{table.schema}.{table.table}</code>
                      <StatusBadge status={table.status} />
                      {table.rlsEnabled
                        ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">RLS aktiv</Badge>
                        : <Badge variant="destructive" className="text-xs">RLS inaktiv!</Badge>}
                    </CardTitle>
                    <CardDescription className="mt-1">{table.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {table.policies.length} {table.policies.length === 1 ? 'Policy' : 'Policies'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Policies */}
                {table.policies.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 font-medium text-muted-foreground">Policy-Name</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Operation</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Rolle</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Bedingung</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Risiko</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.policies.map(policy => (
                          <tr key={policy.name} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono">{policy.name}</td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <OperationIcon op={policy.operation} />
                                <span className="font-medium">{policy.operation}</span>
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <Badge variant="outline" className="text-xs font-mono">
                                {policy.role}
                              </Badge>
                            </td>
                            <td className="p-2 font-mono text-muted-foreground">{policy.condition}</td>
                            <td className="p-2 text-center">
                              {policy.riskLevel === 'low' && <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />}
                              {policy.riskLevel === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />}
                              {policy.riskLevel === 'high' && <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empfehlungen */}
                {table.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    {table.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-blue-400" />
                        <span className="text-muted-foreground">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verbesserungsvorschläge */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Verbesserungsvorschläge
            <Badge variant="destructive" className="text-xs ml-1">{highPrioImprovements} hoch priorisiert</Badge>
          </h2>
          {IMPROVEMENTS.map((improvement, i) => (
            <Card key={i} className={
              improvement.priority === 'hoch' ? 'border-red-200 dark:border-red-800' :
              improvement.priority === 'mittel' ? 'border-amber-200 dark:border-amber-800' : ''
            }>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <PriorityBadge priority={improvement.priority} />
                    {improvement.title}
                  </CardTitle>
                  <Badge
                    variant={improvement.status === 'offen' ? 'outline' : 'secondary'}
                    className="text-xs flex-shrink-0"
                  >
                    {improvement.status === 'offen' ? 'Offen' : improvement.status === 'teilweise' ? 'Teilweise' : 'Erledigt'}
                  </Badge>
                </div>
                <CardDescription>{improvement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{improvement.sql}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sicherheits-Checkliste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-violet-500" />
              Sicherheits-Checkliste
            </CardTitle>
            <CardDescription>Empfohlene Sicherheitsmaßnahmen für das Portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { done: true, text: 'RLS für alle Kern-Tabellen aktiviert (profiles, organizations, subscriptions, user_activity_log)' },
                { done: true, text: 'is_superadmin() Funktion als zentrale Sicherheitsfunktion implementiert' },
                { done: true, text: 'Anon-Zugriff auf sensible Tabellen explizit blockiert' },
                { done: true, text: 'SUPABASE_SERVICE_ROLE_KEY in Vercel für AMS gesetzt' },
                { done: true, text: 'log_activity() als SECURITY DEFINER RPC-Funktion implementiert' },
                { done: false, text: 'app_source-basierte Datenisolation zwischen Apps implementieren' },
                { done: false, text: 'Eigene Profil-Policies für alle Nutzer sicherstellen' },
                { done: false, text: 'Retention-Policy für user_activity_log einrichten (pg_cron)' },
                { done: false, text: 'Audit-Log (admin_logs) unveränderlich machen (keine UPDATE/DELETE)' },
                { done: false, text: 'RLS für tenants-Tabelle prüfen und ggf. aktivieren' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  {item.done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                  <span className={`text-sm ${item.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Superadmin-Emails */}
        <Card className="border-violet-200 dark:border-violet-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Superadmin-E-Mail-Adressen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {SUPERADMIN_EMAILS.map(email => (
                <Badge key={email} variant="outline" className="font-mono text-xs">
                  {email}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Diese E-Mail-Adressen haben automatisch Superadmin-Zugriff über die <code className="bg-muted px-1 rounded">is_superadmin()</code> Funktion.
              Zusätzlich können Nutzer mit <code className="bg-muted px-1 rounded">role = 'superadmin'</code> in der profiles-Tabelle Superadmin-Rechte erhalten.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
