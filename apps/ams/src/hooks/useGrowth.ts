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
  // Churn-Kennzahlen
  avgMonthlyChurnRate: number;
  currentMonthChurnRate: number;
  churnTrend: 'up' | 'down' | 'stable'; // Vergleich letzter 2 Monate
}

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

    // ─── Monatliche Churn-Berechnung (letzte 12 Monate) ───────────────────────
    // Churn-Definition:
    //   - Nutzer gilt als "abgewandert" in Monat M, wenn:
    //     (a) status === 'inactive' und updated_at in Monat M, ODER
    //     (b) last_login_at ist > 30 Tage vor Monatsende (Inaktivitäts-Churn)
    //   - Da wir keine updated_at haben, nutzen wir:
    //     Nutzer die im Monat M registriert wurden UND deren last_login_at
    //     mehr als 30 Tage zurückliegt (relative Churn-Schätzung)
    
    const monthlyChurn: MonthlyChurnPoint[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthStart = new Date(monthDate);
      
      // Nutzer die in diesem Monat registriert wurden
      const newInMonth = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= monthStart && d <= monthEnd;
      });
      
      // Aktive Nutzer am Monatsende: alle bis Monatsende registrierten Nutzer
      const allUntilMonthEnd = profiles.filter(p => new Date(p.created_at) <= monthEnd);
      const activeUsers = allUntilMonthEnd.length;
      
      // Churn-Schätzung: Nutzer mit status='inactive' ODER last_login_at > 30d vor Monatsende
      const thirtyDaysBeforeEnd = new Date(monthEnd.getTime() - 30 * 86400000);
      const churnedInMonth = allUntilMonthEnd.filter(p => {
        // Explizit inaktiv gesetzt
        if (p.status === 'inactive') return true;
        // Kein Login in den letzten 30 Tagen vor Monatsende (nur für vergangene Monate sinnvoll)
        if (p.last_login_at) {
          const lastLogin = new Date(p.last_login_at);
          return lastLogin < thirtyDaysBeforeEnd;
        }
        // Kein Login-Datum → als potenziell abgewandert zählen wenn Registrierung > 60 Tage
        const regDate = new Date(p.created_at);
        return regDate < new Date(monthEnd.getTime() - 60 * 86400000);
      }).length;
      
      // Churn-Rate = Abgewanderte / Aktive * 100
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
      avgMonthlyChurnRate,
      currentMonthChurnRate,
      churnTrend,
    };
  }, [profiles, orgs, subs, tenants]);

  return { data, isLoading };
}
