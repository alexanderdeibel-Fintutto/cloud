import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

// ─── Typen ────────────────────────────────────────────────────────────────────
export interface WeeklyDataPoint {
  week: string;       // "KW16/2026"
  date: string;       // ISO-Datum des Montags
  users: number;
  orgs: number;
  subs: number;
  tenants: number;
  newUsers: number;
  newOrgs: number;
  newSubs: number;
  newTenants: number;
}

export interface MonthlyChurnPoint {
  month: string;        // "Apr 2026"
  date: string;         // "2026-04-01"
  newUsers: number;     // Neuregistrierungen
  churnedUsers: number; // Inaktiv gewordene Nutzer (status = 'inactive' / last_login > 30d)
  churnRate: number;    // Abwanderungsrate in %
  netGrowth: number;    // Nettowachstum (new - churned)
  activeUsers: number;  // Aktive Nutzer am Monatsende
}

// Monatliche Aktivitätsdaten aus app_activity_monthly View
export interface AppMonthlyActivity {
  app_id: string;
  month: string;          // ISO-Datum: "2026-04-01T00:00:00+00:00"
  active_users: number;
  total_actions: number;
  logins: number;
  creates: number;
  views: number;
}

export interface AppActivityPoint {
  app: string;          // App-Name (z.B. "vermietify")
  label: string;        // Anzeigename (z.B. "Vermietify")
  category: string;     // Kategorie (z.B. "Immobilien")
  integrated: boolean;  // Ist die App an Supabase angebunden?
  vercelDeployed: boolean; // Hat die App ein Vercel-Deployment?
  totalSubs: number;    // Gesamte Abonnements für diese App
  activeSubs: number;   // Aktive Abonnements
  monthlyData: { month: string; subs: number; newSubs: number }[]; // Monatliche Daten
  color: string;        // Chart-Farbe
}

export interface GrowthSummary {
  totalUsers: number;
  totalOrgs: number;
  totalSubs: number;
  totalTenants: number;
  newUsers7d: number;
  newOrgs7d: number;
  newSubs7d: number;
  newTenants7d: number;
  newUsers30d: number;
  weeklyData: WeeklyDataPoint[];
  monthlyChurn: MonthlyChurnPoint[];
  usersByRole: { role: string; count: number }[];
  subsByTier: { tier: string; count: number }[];
  subsByInterval: { interval: string; count: number }[];
  userRegistrationsByDay: { date: string; count: number }[];
  appActivity: AppActivityPoint[];
  // Churn-Kennzahlen
  avgMonthlyChurnRate: number;
  currentMonthChurnRate: number;
  churnTrend: 'up' | 'down' | 'stable'; // Vergleich letzter 2 Monate
}

// ─── App-Katalog ──────────────────────────────────────────────────────────────
// Alle bekannten Apps mit Metadaten
const APP_CATALOG: Omit<AppActivityPoint, 'totalSubs' | 'activeSubs' | 'monthlyData'>[] = [
  { app: 'vermietify',          label: 'Vermietify',           category: 'Immobilien',      integrated: true,  vercelDeployed: true,  color: '#f97316' },
  { app: 'ams',                 label: 'AMS',                  category: 'Verwaltung',      integrated: true,  vercelDeployed: true,  color: '#3b82f6' },
  { app: 'bescheidboxer',       label: 'BescheidBoxer',        category: 'Behörden',        integrated: true,  vercelDeployed: true,  color: '#8b5cf6' },
  { app: 'arbeitslos-portal',   label: 'Arbeitslos-Portal',    category: 'Behörden',        integrated: true,  vercelDeployed: true,  color: '#ec4899' },
  { app: 'pflanzen-manager',    label: 'Pflanzen-Manager',     category: 'Lifestyle',       integrated: true,  vercelDeployed: true,  color: '#10b981' },
  { app: 'secondbrain',         label: 'SecondBrain',          category: 'Produktivität',   integrated: true,  vercelDeployed: true,  color: '#14b8a6' },
  { app: 'finance-coach',       label: 'Finance Coach',        category: 'Finanzen',        integrated: true,  vercelDeployed: true,  color: '#f59e0b' },
  { app: 'finance-mentor',      label: 'Finance Mentor',       category: 'Finanzen',        integrated: true,  vercelDeployed: true,  color: '#06b6d4' },
  { app: 'fintutto-biz',        label: 'Fintutto Biz',         category: 'Business',        integrated: true,  vercelDeployed: true,  color: '#6366f1' },
  { app: 'leserally',           label: 'LeseRally',            category: 'Bildung',         integrated: false, vercelDeployed: true,  color: '#84cc16' },
  { app: 'miet-check-pro',      label: 'MietCheck Pro',        category: 'Immobilien',      integrated: false, vercelDeployed: true,  color: '#f43f5e' },
  { app: 'miet-recht',          label: 'Miet-Recht',           category: 'Recht',           integrated: false, vercelDeployed: true,  color: '#a78bfa' },
  { app: 'betriebskosten-helfer', label: 'Betriebskosten-Helfer', category: 'Immobilien',  integrated: false, vercelDeployed: false, color: '#fb923c' },
  { app: 'financial-compass',   label: 'Financial Compass',    category: 'Finanzen',        integrated: false, vercelDeployed: false, color: '#34d399' },
  { app: 'hausmeister',         label: 'Hausmeister',          category: 'Immobilien',      integrated: false, vercelDeployed: false, color: '#60a5fa' },
  { app: 'vermieter-freude',    label: 'Vermieter-Freude',     category: 'Immobilien',      integrated: false, vercelDeployed: false, color: '#f472b6' },
];

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const kw = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `KW${kw}/${d.getFullYear()}`;
}

function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
}

function getMonthStart(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Lädt monatliche Aktivitätsdaten aus der app_activity_monthly View.
 * Gibt echte Nutzungsmetriken pro App und Monat zurück.
 */
export function useAppActivityMonthly() {
  return useQuery({
    queryKey: ['app-activity-monthly'],
    queryFn: async (): Promise<AppMonthlyActivity[]> => {
      const { data, error } = await supabase
        .from('app_activity_monthly')
        .select('app_id, month, active_users, total_actions, logins, creates, views')
        .order('month', { ascending: true });
      if (error) {
        console.warn('[useAppActivityMonthly] Fehler beim Laden:', error.message);
        return [];
      }
      return (data || []).map(row => ({
        app_id: row.app_id as string,
        month: row.month as string,
        active_users: Number(row.active_users) || 0,
        total_actions: Number(row.total_actions) || 0,
        logins: Number(row.logins) || 0,
        creates: Number(row.creates) || 0,
        views: Number(row.views) || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useGrowthProfiles() {
  return useQuery({
    queryKey: ['growth-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at, role, status, last_login_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGrowthOrganizations() {
  return useQuery({
    queryKey: ['growth-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, created_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGrowthSubscriptions() {
  return useQuery({
    queryKey: ['growth-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, created_at, status, tier, billing_interval, app_id, canceled_at, cancelled_at')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGrowthTenants() {
  return useQuery({
    queryKey: ['growth-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, created_at, status')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Aggregierter Hook ────────────────────────────────────────────────────────
export function useGrowthSummary(): { data: GrowthSummary | null; isLoading: boolean } {
  const { data: profiles, isLoading: p } = useGrowthProfiles();
  const { data: orgs, isLoading: o } = useGrowthOrganizations();
  const { data: subs, isLoading: s } = useGrowthSubscriptions();
  const { data: tenants, isLoading: t } = useGrowthTenants();

  const isLoading = p || o || s || t;

  const data = useMemo((): GrowthSummary | null => {
    if (!profiles || !orgs || !subs || !tenants) return null;

    const now = new Date();
    const ago7 = new Date(now.getTime() - 7 * 86400000);
    const ago30 = new Date(now.getTime() - 30 * 86400000);

    // Neue Einträge in Zeitfenstern
    const newUsers7d = profiles.filter(p => new Date(p.created_at) >= ago7).length;
    const newOrgs7d = orgs.filter(o => new Date(o.created_at) >= ago7).length;
    const newSubs7d = subs.filter(s => new Date(s.created_at) >= ago7).length;
    const newTenants7d = tenants.filter(t => new Date(t.created_at) >= ago7).length;
    const newUsers30d = profiles.filter(p => new Date(p.created_at) >= ago30).length;

    // Nutzer nach Rolle
    const roleMap = new Map<string, number>();
    profiles.forEach(p => {
      const role = p.role || 'unknown';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    const usersByRole = Array.from(roleMap.entries()).map(([role, count]) => ({ role, count }));

    // Abos nach Tier
    const tierMap = new Map<string, number>();
    subs.forEach(s => {
      const tier = s.tier || 'free';
      tierMap.set(tier, (tierMap.get(tier) || 0) + 1);
    });
    const subsByTier = Array.from(tierMap.entries()).map(([tier, count]) => ({ tier, count }));

    // Abos nach Interval
    const intervalMap = new Map<string, number>();
    subs.forEach(s => {
      const interval = s.billing_interval || 'month';
      intervalMap.set(interval, (intervalMap.get(interval) || 0) + 1);
    });
    const subsByInterval = Array.from(intervalMap.entries()).map(([interval, count]) => ({ interval, count }));

    // Tägliche Nutzer-Registrierungen (letzte 60 Tage)
    const ago60 = new Date(now.getTime() - 60 * 86400000);
    const dayMap = new Map<string, number>();
    profiles
      .filter(p => new Date(p.created_at) >= ago60)
      .forEach(p => {
        const day = p.created_at.split('T')[0];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });
    // Alle 60 Tage auffüllen (auch Tage ohne Registrierungen)
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      if (!dayMap.has(key)) dayMap.set(key, 0);
    }
    const userRegistrationsByDay = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // ─── App-Aktivität ────────────────────────────────────────────────────────
    // Basierend auf subscriptions.app_id + App-Katalog
    const appActivity: AppActivityPoint[] = APP_CATALOG.map(appMeta => {
      // Abonnements für diese App (app_id matching)
      const appSubs = subs.filter(s => {
        const aid = (s.app_id || '').toLowerCase();
        return aid === appMeta.app || aid.includes(appMeta.app) || appMeta.app.includes(aid);
      });

      const activeSubs = appSubs.filter(s =>
        s.status === 'active' || s.status === 'trialing'
      ).length;

      // Monatliche Daten (letzte 12 Monate)
      const monthlyData: { month: string; subs: number; newSubs: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const monthStart = new Date(monthDate);

        const newInMonth = appSubs.filter(s => {
          const d = new Date(s.created_at);
          return d >= monthStart && d <= monthEnd;
        }).length;

        const cumUntilEnd = appSubs.filter(s => new Date(s.created_at) <= monthEnd).length;

        monthlyData.push({
          month: getMonthLabel(monthDate),
          subs: cumUntilEnd,
          newSubs: newInMonth,
        });
      }

      return {
        ...appMeta,
        totalSubs: appSubs.length,
        activeSubs,
        monthlyData,
      };
    });

    // ─── Monatliche Churn-Berechnung (letzte 12 Monate) ───────────────────────
    const monthlyChurn: MonthlyChurnPoint[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthStart = new Date(monthDate);
      
      const newInMonth = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= monthStart && d <= monthEnd;
      });
      
      const allUntilMonthEnd = profiles.filter(p => new Date(p.created_at) <= monthEnd);
      const activeUsers = allUntilMonthEnd.length;
      
      const thirtyDaysBeforeEnd = new Date(monthEnd.getTime() - 30 * 86400000);
      const churnedInMonth = allUntilMonthEnd.filter(p => {
        if (p.status === 'inactive') return true;
        if (p.last_login_at) {
          const lastLogin = new Date(p.last_login_at);
          return lastLogin < thirtyDaysBeforeEnd;
        }
        const regDate = new Date(p.created_at);
        return regDate < new Date(monthEnd.getTime() - 60 * 86400000);
      }).length;
      
      const churnRate = activeUsers > 0
        ? Math.round((churnedInMonth / activeUsers) * 100 * 10) / 10
        : 0;
      
      const netGrowth = newInMonth.length - churnedInMonth;
      
      monthlyChurn.push({
        month: getMonthLabel(monthDate),
        date: getMonthStart(monthDate.getFullYear(), monthDate.getMonth()),
        newUsers: newInMonth.length,
        churnedUsers: churnedInMonth,
        churnRate,
        netGrowth,
        activeUsers,
      });
    }
    
    // Churn-Kennzahlen
    const validChurnMonths = monthlyChurn.filter(m => m.activeUsers > 0);
    const avgMonthlyChurnRate = validChurnMonths.length > 0
      ? Math.round(validChurnMonths.reduce((sum, m) => sum + m.churnRate, 0) / validChurnMonths.length * 10) / 10
      : 0;
    const currentMonthChurnRate = monthlyChurn[monthlyChurn.length - 1]?.churnRate ?? 0;
    const prevMonthChurnRate = monthlyChurn[monthlyChurn.length - 2]?.churnRate ?? 0;
    const churnTrend: 'up' | 'down' | 'stable' =
      currentMonthChurnRate > prevMonthChurnRate + 1 ? 'up' :
      currentMonthChurnRate < prevMonthChurnRate - 1 ? 'down' : 'stable';

    // ─── Wöchentliche Zeitreihe (kumulativ) ──────────────────────────────────
    const allDates = [
      ...profiles.map(p => ({ type: 'user', date: p.created_at })),
      ...orgs.map(o => ({ type: 'org', date: o.created_at })),
      ...subs.map(s => ({ type: 'sub', date: s.created_at })),
      ...tenants.map(t => ({ type: 'tenant', date: t.created_at })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    const weekBuckets = new Map<string, { week: string; date: string; newUsers: number; newOrgs: number; newSubs: number; newTenants: number }>();
    
    for (let i = 15; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 86400000);
      const weekLabel = getISOWeek(d);
      const monday = getMondayOfWeek(d);
      if (!weekBuckets.has(weekLabel)) {
        weekBuckets.set(weekLabel, { week: weekLabel, date: monday, newUsers: 0, newOrgs: 0, newSubs: 0, newTenants: 0 });
      }
    }

    allDates.forEach(({ type, date }) => {
      const d = new Date(date);
      const weekLabel = getISOWeek(d);
      if (weekBuckets.has(weekLabel)) {
        const bucket = weekBuckets.get(weekLabel)!;
        if (type === 'user') bucket.newUsers++;
        else if (type === 'org') bucket.newOrgs++;
        else if (type === 'sub') bucket.newSubs++;
        else if (type === 'tenant') bucket.newTenants++;
      }
    });

    let cumUsers = 0, cumOrgs = 0, cumSubs = 0, cumTenants = 0;
    const firstWeekDate = new Date(now.getTime() - 15 * 7 * 86400000);
    profiles.filter(p => new Date(p.created_at) < firstWeekDate).forEach(() => cumUsers++);
    orgs.filter(o => new Date(o.created_at) < firstWeekDate).forEach(() => cumOrgs++);
    subs.filter(s => new Date(s.created_at) < firstWeekDate).forEach(() => cumSubs++);
    tenants.filter(t => new Date(t.created_at) < firstWeekDate).forEach(() => cumTenants++);

    const weeklyData: WeeklyDataPoint[] = Array.from(weekBuckets.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(bucket => {
        cumUsers += bucket.newUsers;
        cumOrgs += bucket.newOrgs;
        cumSubs += bucket.newSubs;
        cumTenants += bucket.newTenants;
        return {
          week: bucket.week,
          date: bucket.date,
          users: cumUsers,
          orgs: cumOrgs,
          subs: cumSubs,
          tenants: cumTenants,
          newUsers: bucket.newUsers,
          newOrgs: bucket.newOrgs,
          newSubs: bucket.newSubs,
          newTenants: bucket.newTenants,
        };
      });

    return {
      totalUsers: profiles.length,
      totalOrgs: orgs.length,
      totalSubs: subs.length,
      totalTenants: tenants.length,
      newUsers7d,
      newOrgs7d,
      newSubs7d,
      newTenants7d,
      newUsers30d,
      weeklyData,
      monthlyChurn,
      usersByRole,
      subsByTier,
      subsByInterval,
      userRegistrationsByDay,
      appActivity,
      avgMonthlyChurnRate,
      currentMonthChurnRate,
      churnTrend,
    };
  }, [profiles, orgs, subs, tenants]);

  return { data, isLoading };
}
