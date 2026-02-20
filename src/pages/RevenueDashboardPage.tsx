import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Users,
  MousePointerClick,
  Mail,
  CreditCard,
  FileText,
  Eye,
  ArrowUpRight,
  Loader2,
  BarChart3,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  affiliateClicks: number
  affiliateClicksToday: number
  leadRequests: number
  leadsPending: number
  leadsConverted: number
  newsletterSubscribers: number
  newsletterConfirmed: number
  oneTimePurchases: number
  oneTimeRevenue: number
  blogViews: number
  landingPageViews: number
  monetizationEvents: number
  segmentBreakdown: { segment: string; count: number }[]
  leadTypeBreakdown: { lead_type: string; count: number }[]
  topAffiliatePartners: { partner_id: string; clicks: number }[]
  recentEvents: { event_type: string; source_detail: string; created_at: string }[]
}

export default function RevenueDashboardPage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) loadStats()
  }, [user])

  async function loadStats() {
    setLoadingStats(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Parallele Abfragen
      const [
        affiliateRes,
        affiliateTodayRes,
        leadsRes,
        newsletterRes,
        purchasesRes,
        blogViewsRes,
        landingViewsRes,
        eventsRes,
        segmentRes,
        leadTypeRes,
        topPartnersRes,
        recentEventsRes,
      ] = await Promise.all([
        supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
        supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', today),
        supabase.from('lead_requests').select('id, status', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('id, confirmed', { count: 'exact' }),
        supabase.from('one_time_purchases').select('id, amount'),
        supabase.from('blog_posts').select('views'),
        supabase.from('landing_pages').select('views'),
        supabase.from('monetization_events').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('segment').eq('active', true),
        supabase.from('lead_requests').select('lead_type'),
        supabase.from('affiliate_clicks').select('partner_id'),
        supabase.from('monetization_events').select('event_type, source_detail, created_at').order('created_at', { ascending: false }).limit(10),
      ])

      // Segment Breakdown
      const segmentMap = new Map<string, number>()
      ;(segmentRes.data || []).forEach((s: { segment: string }) => {
        segmentMap.set(s.segment || 'general', (segmentMap.get(s.segment || 'general') || 0) + 1)
      })

      // Lead Type Breakdown
      const leadTypeMap = new Map<string, number>()
      ;(leadTypeRes.data || []).forEach((l: { lead_type: string }) => {
        leadTypeMap.set(l.lead_type, (leadTypeMap.get(l.lead_type) || 0) + 1)
      })

      // Top Partners
      const partnerMap = new Map<string, number>()
      ;(topPartnersRes.data || []).forEach((c: { partner_id: string }) => {
        partnerMap.set(c.partner_id, (partnerMap.get(c.partner_id) || 0) + 1)
      })

      const leadsData = leadsRes.data || []
      const newsletterData = newsletterRes.data || []
      const purchasesData = purchasesRes.data || []

      setStats({
        affiliateClicks: affiliateRes.count || 0,
        affiliateClicksToday: affiliateTodayRes.count || 0,
        leadRequests: leadsData.length,
        leadsPending: leadsData.filter((l: { status: string }) => l.status === 'pending').length,
        leadsConverted: leadsData.filter((l: { status: string }) => l.status === 'converted').length,
        newsletterSubscribers: newsletterData.length,
        newsletterConfirmed: newsletterData.filter((n: { confirmed: boolean }) => n.confirmed).length,
        oneTimePurchases: purchasesData.length,
        oneTimeRevenue: purchasesData.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0),
        blogViews: (blogViewsRes.data || []).reduce((sum: number, b: { views: number }) => sum + (b.views || 0), 0),
        landingPageViews: (landingViewsRes.data || []).reduce((sum: number, l: { views: number }) => sum + (l.views || 0), 0),
        monetizationEvents: eventsRes.count || 0,
        segmentBreakdown: Array.from(segmentMap.entries()).map(([segment, count]) => ({ segment, count })),
        leadTypeBreakdown: Array.from(leadTypeMap.entries()).map(([lead_type, count]) => ({ lead_type, count })),
        topAffiliatePartners: Array.from(partnerMap.entries())
          .map(([partner_id, clicks]) => ({ partner_id, clicks }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5),
        recentEvents: (recentEventsRes.data || []) as { event_type: string; source_detail: string; created_at: string }[],
      })
    } catch (err) {
      console.error('Error loading revenue stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) return null

  const LEAD_LABELS: Record<string, string> = {
    anwalt: 'Anwalt',
    makler: 'Makler',
    handwerker: 'Handwerker',
    finanzberater: 'Finanzberater',
  }

  const EVENT_LABELS: Record<string, string> = {
    lead_created: 'Lead erstellt',
    affiliate_click: 'Affiliate-Klick',
    one_time_purchase: 'Einmalkauf',
    subscription_created: 'Neues Abo',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-7 w-7 text-fintutto-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Übersicht aller Monetarisierungskanäle.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<MousePointerClick className="w-5 h-5 text-amber-600" />}
            label="Affiliate-Klicks"
            value={stats.affiliateClicks}
            sublabel={`${stats.affiliateClicksToday} heute`}
            bgColor="bg-amber-50"
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-blue-600" />}
            label="Leads"
            value={stats.leadRequests}
            sublabel={`${stats.leadsPending} offen · ${stats.leadsConverted} konvertiert`}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Mail className="w-5 h-5 text-purple-600" />}
            label="Newsletter"
            value={stats.newsletterSubscribers}
            sublabel={`${stats.newsletterConfirmed} bestätigt`}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<CreditCard className="w-5 h-5 text-green-600" />}
            label="Einmalkauf-Umsatz"
            value={formatCurrency(stats.oneTimeRevenue)}
            sublabel={`${stats.oneTimePurchases} Käufe`}
            bgColor="bg-green-50"
            isMonetary
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Eye className="w-5 h-5 text-indigo-600" />}
            label="Blog-Aufrufe"
            value={stats.blogViews}
            bgColor="bg-indigo-50"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-teal-600" />}
            label="Landing-Page-Aufrufe"
            value={stats.landingPageViews}
            bgColor="bg-teal-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-rose-600" />}
            label="Monetarisierungs-Events"
            value={stats.monetizationEvents}
            bgColor="bg-rose-50"
          />
        </div>

        {/* Detail Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Newsletter Segments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Newsletter-Segmente</CardTitle>
              <CardDescription>Verteilung der Abonnenten</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.segmentBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Daten</p>
              ) : (
                <div className="space-y-3">
                  {stats.segmentBreakdown.map((s) => (
                    <div key={s.segment} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{s.segment}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, (s.count / stats.newsletterSubscribers) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{s.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead Types */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lead-Typen</CardTitle>
              <CardDescription>Verteilung der Anfragen</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.leadTypeBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Leads</p>
              ) : (
                <div className="space-y-3">
                  {stats.leadTypeBreakdown.map((l) => (
                    <div key={l.lead_type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{LEAD_LABELS[l.lead_type] || l.lead_type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (l.count / stats.leadRequests) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">{l.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Affiliate Partners */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Affiliate-Partner</CardTitle>
              <CardDescription>Nach Klicks</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topAffiliatePartners.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Klicks</p>
              ) : (
                <div className="space-y-3">
                  {stats.topAffiliatePartners.map((p, i) => (
                    <div key={p.partner_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                        <span className="text-sm font-medium">{p.partner_id}</span>
                      </div>
                      <span className="text-sm font-medium text-amber-600">{p.clicks} Klicks</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letzte Monetarisierungs-Events</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Events</p>
            ) : (
              <div className="space-y-2">
                {stats.recentEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">
                          {EVENT_LABELS[event.event_type] || event.event_type}
                        </span>
                        {event.source_detail && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({event.source_detail})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  bgColor,
  isMonetary = false,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sublabel?: string
  bgColor: string
  isMonetary?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className={`text-xl font-bold ${isMonetary ? 'text-green-600' : 'text-gray-900'}`}>
              {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
            </p>
            {sublabel && (
              <p className="text-[11px] text-muted-foreground truncate">{sublabel}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
