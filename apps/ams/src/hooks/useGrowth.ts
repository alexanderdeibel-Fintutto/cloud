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
  usersByRole: { role: string; count: number }[];
  subsByTier: { tier: string; count: number }[];
  subsByInterval: { interval: string; count: number }[];
  userRegistrationsByDay: { date: string; count: number }[];
}

// ─── Hilfsfunktion: Datum → Kalenderwoche ────────────────────────────────────
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

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useGrowthProfiles() {
  return useQuery({
    queryKey: ['growth-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at, role, status')
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
        .select('id, created_at, status, tier, billing_interval, app_id')
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
    const userRegistrationsByDay = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Wöchentliche Zeitreihe (kumulativ)
    // Alle Daten zusammenführen und nach Woche gruppieren
    const allDates = [
      ...profiles.map(p => ({ type: 'user', date: p.created_at })),
      ...orgs.map(o => ({ type: 'org', date: o.created_at })),
      ...subs.map(s => ({ type: 'sub', date: s.created_at })),
      ...tenants.map(t => ({ type: 'tenant', date: t.created_at })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    // Wöchentliche Buckets erstellen (letzte 16 Wochen)
    const weekBuckets = new Map<string, { week: string; date: string; newUsers: number; newOrgs: number; newSubs: number; newTenants: number }>();
    
    // Letzte 16 Wochen generieren
    for (let i = 15; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 86400000);
      const weekLabel = getISOWeek(d);
      const monday = getMondayOfWeek(d);
      if (!weekBuckets.has(weekLabel)) {
        weekBuckets.set(weekLabel, { week: weekLabel, date: monday, newUsers: 0, newOrgs: 0, newSubs: 0, newTenants: 0 });
      }
    }

    // Einträge in Wochen einordnen
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

    // Kumulierte Werte berechnen
    let cumUsers = 0, cumOrgs = 0, cumSubs = 0, cumTenants = 0;
    
    // Einträge vor dem Beobachtungszeitraum zählen
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
      usersByRole,
      subsByTier,
      subsByInterval,
      userRegistrationsByDay,
    };
  }, [profiles, orgs, subs, tenants]);

  return { data, isLoading };
}
