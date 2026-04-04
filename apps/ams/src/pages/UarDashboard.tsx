/**
 * UAR Dashboard — Universal Account Record
 * ams.fintutto.world/uar
 *
 * Das Herzstück der fintutto Customer Data Platform (CDP).
 * Jeder Lead, jeder Kontakt, jede Registrierung — lückenlos erfasst.
 * Design: Landing-Page-Stil (dunkles Mesh-Gradient, Glassmorphism, Cyan/Violet-Akzente)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import {
  Users, Activity, Mail, Zap, Search, Filter, ChevronRight,
  Globe, TrendingUp, Target, Clock, CheckCircle2, AlertCircle,
  Send, Eye, BarChart3, Workflow, Star, Building2, Phone,
  MapPin, Calendar, ArrowUpRight, RefreshCw, X, Play, Pause
} from 'lucide-react'

// ─── Typen ────────────────────────────────────────────────────────────────────

interface UarIdentity {
  id: string
  fintutto_id: string
  email: string | null
  name: string | null
  company: string | null
  segment: string | null
  status: string
  score: number
  source: string | null
  onboarding_completed: boolean
  created_at: string
  last_seen_at: string | null
  meta: Record<string, unknown>
}

interface UarEvent {
  id: string
  event_type: string
  event_data: Record<string, unknown>
  source_app: string | null
  created_at: string
}

interface WorkflowEnrollment {
  id: string
  status: string
  current_step: number
  enrolled_at: string
  fw_marketing_workflows?: { name: string; segment: string }
}

// ─── Segment-Konfiguration ────────────────────────────────────────────────────

const SEGMENT_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  museum:      { label: 'Museum & Galerie',      emoji: '🏛️', color: 'from-violet-500 to-purple-600' },
  guide:       { label: 'Stadtführer & Guide',   emoji: '🎤', color: 'from-sky-500 to-cyan-600' },
  authority:   { label: 'Behörde & Amt',         emoji: '🏛️', color: 'from-blue-500 to-indigo-600' },
  hospitality: { label: 'Hotel & Hospitality',   emoji: '🏨', color: 'from-amber-500 to-orange-600' },
  medical:     { label: 'Medizin & Gesundheit',  emoji: '🩺', color: 'from-red-500 to-rose-600' },
  education:   { label: 'Schule & Hochschule',   emoji: '🏫', color: 'from-emerald-500 to-green-600' },
  conference:  { label: 'Konferenz & Event',     emoji: '🎤', color: 'from-pink-500 to-fuchsia-600' },
  cruise:      { label: 'Kreuzfahrt',            emoji: '🚢', color: 'from-cyan-500 to-teal-600' },
  gastro:      { label: 'Restaurant & Gastro',   emoji: '🍽️', color: 'from-orange-500 to-red-600' },
  park:        { label: 'Freizeitpark & Zoo',    emoji: '🎡', color: 'from-lime-500 to-green-600' },
  sacred:      { label: 'Kirche & Kloster',      emoji: '⛪', color: 'from-stone-500 to-slate-600' },
  transport:   { label: 'Transport & ÖPNV',      emoji: '🚌', color: 'from-blue-500 to-sky-600' },
  ngo:         { label: 'NGO & Soziales',        emoji: '🌍', color: 'from-teal-500 to-emerald-600' },
  agency:      { label: 'Agentur & Developer',   emoji: '💻', color: 'from-violet-500 to-indigo-600' },
  personal:    { label: 'Privat & Freelancer',   emoji: '👤', color: 'from-slate-500 to-gray-600' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  anonymous:  { label: 'Anonym',       color: 'text-slate-400',   dot: 'bg-slate-400' },
  identified: { label: 'Identifiziert', color: 'text-sky-400',    dot: 'bg-sky-400' },
  lead:       { label: 'Lead',          color: 'text-amber-400',  dot: 'bg-amber-400' },
  qualified:  { label: 'Qualifiziert', color: 'text-violet-400',  dot: 'bg-violet-400' },
  customer:   { label: 'Kunde',         color: 'text-emerald-400', dot: 'bg-emerald-400' },
  churned:    { label: 'Abgewandert',  color: 'text-red-400',     dot: 'bg-red-400' },
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'gerade eben'
  if (mins < 60) return `vor ${mins} Min.`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `vor ${hrs} Std.`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `vor ${days} Tagen`
  return new Date(dateStr).toLocaleDateString('de-DE')
}

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    page_view: 'Seite aufgerufen',
    calculator_used: 'Kalkulator genutzt',
    calculation_saved: 'Kalkulation gespeichert',
    lead_form_submitted: 'Kontaktformular ausgefüllt',
    user_registered: 'Registriert',
    user_login: 'Eingeloggt',
    demo_requested: 'Demo angefragt',
    email_opened: 'E-Mail geöffnet',
    email_clicked: 'E-Mail-Link geklickt',
    onboarding_completed: 'Onboarding abgeschlossen',
  }
  return map[type] || type
}

// ─── Mesh-Gradient-Hintergrund ────────────────────────────────────────────────

function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a1a]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 20%, #6B21A8 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 10%, #1E40AF 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 50% 80%, #0E7490 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 90% 70%, #7C3AED 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 10% 70%, #BE185D 0%, transparent 50%)
          `,
          animation: 'meshMove 20s ease-in-out infinite alternate',
        }}
      />
      <style>{`
        @keyframes meshMove {
          0%   { transform: scale(1) translate(0, 0); }
          33%  { transform: scale(1.05) translate(-1%, 1%); }
          66%  { transform: scale(0.98) translate(1%, -1%); }
          100% { transform: scale(1.02) translate(-0.5%, 0.5%); }
        }
      `}</style>
    </div>
  )
}

// ─── KPI-Karte ────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon, label, value, sub, gradient, trend
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  gradient: string
  trend?: number
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/8 transition-all duration-300 group">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity blur-xl`} />
      <div className="relative">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-white/60">{label}</div>
        {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp className="w-3 h-3" />
            {trend >= 0 ? '+' : ''}{trend}% diese Woche
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Kontakt-Zeile ────────────────────────────────────────────────────────────

function ContactRow({
  identity,
  onClick,
  selected,
}: {
  identity: UarIdentity
  onClick: () => void
  selected: boolean
}) {
  const seg = SEGMENT_CONFIG[identity.segment || 'personal'] || SEGMENT_CONFIG.personal
  const status = STATUS_CONFIG[identity.status] || STATUS_CONFIG.anonymous

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
        ${selected
          ? 'bg-white/15 border border-white/20'
          : 'hover:bg-white/8 border border-transparent'
        }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${seg.color} flex items-center justify-center shrink-0 text-white font-bold text-sm`}>
        {(identity.name || identity.email || '?').charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">
            {identity.name || identity.email || identity.fintutto_id.slice(0, 12) + '…'}
          </span>
          <span className="text-xs">{seg.emoji}</span>
        </div>
        <div className="text-xs text-white/50 truncate">
          {identity.company || identity.email || 'Anonym'}
        </div>
      </div>

      {/* Score */}
      <div className="text-center shrink-0">
        <div className={`text-sm font-bold ${identity.score >= 70 ? 'text-emerald-400' : identity.score >= 40 ? 'text-amber-400' : 'text-slate-400'}`}>
          {identity.score}
        </div>
        <div className="text-xs text-white/30">Score</div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
        <span className={`text-xs ${status.color} hidden sm:block`}>{status.label}</span>
      </div>

      {/* Zeit */}
      <div className="text-xs text-white/30 shrink-0 hidden md:block">
        {identity.last_seen_at ? timeAgo(identity.last_seen_at) : timeAgo(identity.created_at)}
      </div>

      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors shrink-0" />
    </div>
  )
}

// ─── Kontakt-Detail-Panel ─────────────────────────────────────────────────────

function ContactDetail({
  identity,
  onClose,
}: {
  identity: UarIdentity
  onClose: () => void
}) {
  const [events, setEvents] = useState<UarEvent[]>([])
  const [enrollments, setEnrollments] = useState<WorkflowEnrollment[]>([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'timeline' | 'workflows' | 'email'>('timeline')

  const seg = SEGMENT_CONFIG[identity.segment || 'personal'] || SEGMENT_CONFIG.personal
  const status = STATUS_CONFIG[identity.status] || STATUS_CONFIG.anonymous

  useEffect(() => {
    async function load() {
      const [evRes, enRes] = await Promise.all([
        supabase
          .from('fw_uar_events')
          .select('*')
          .eq('identity_id', identity.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('fw_workflow_enrollments')
          .select('*, fw_marketing_workflows(name, segment)')
          .eq('identity_id', identity.id)
          .order('enrolled_at', { ascending: false }),
      ])
      if (evRes.data) setEvents(evRes.data as UarEvent[])
      if (enRes.data) setEnrollments(enRes.data as WorkflowEnrollment[])
    }
    load()
  }, [identity.id])

  async function sendEmail() {
    if (!identity.email || !emailSubject || !emailBody) return
    setSending(true)
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: identity.email,
          subject: emailSubject,
          html: `<div style="font-family:sans-serif;max-width:600px">${emailBody.replace(/\n/g, '<br>')}</div>`,
        },
      })
      setEmailSubject('')
      setEmailBody('')
      setActiveTab('timeline')
    } finally {
      setSending(false)
    }
  }

  const EVENT_ICONS: Record<string, React.ElementType> = {
    page_view: Eye,
    calculator_used: BarChart3,
    calculation_saved: Star,
    lead_form_submitted: Target,
    user_registered: CheckCircle2,
    user_login: Zap,
    demo_requested: Calendar,
    email_opened: Mail,
    email_clicked: ArrowUpRight,
    onboarding_completed: CheckCircle2,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${seg.color} flex items-center justify-center text-white font-bold text-xl`}>
            {(identity.name || identity.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {identity.name || identity.email || 'Anonym'}
              </h2>
              <span className="text-sm">{seg.emoji}</span>
            </div>
            <div className="text-sm text-white/50">{identity.company || seg.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-xs ${status.color}`}>{status.label}</span>
              <span className="text-xs text-white/30">·</span>
              <span className="text-xs text-white/30">Score: {identity.score}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Kontakt-Info */}
      <div className="grid grid-cols-2 gap-3 p-6 border-b border-white/10">
        {identity.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-white/70 truncate">{identity.email}</span>
          </div>
        )}
        {identity.source && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="text-white/70">{identity.source}</span>
          </div>
        )}
        {(identity.meta as Record<string, unknown>)?.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-white/70">{String((identity.meta as Record<string, unknown>).phone)}</span>
          </div>
        )}
        {(identity.meta as Record<string, unknown>)?.city && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-white/70">{String((identity.meta as Record<string, unknown>).city)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-white/30 shrink-0" />
          <span className="text-white/40">Erstellt: {new Date(identity.created_at).toLocaleDateString('de-DE')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-white/30 shrink-0" />
          <span className="text-white/40">
            Zuletzt: {identity.last_seen_at ? timeAgo(identity.last_seen_at) : '—'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-4 border-b border-white/10">
        {(['timeline', 'workflows', 'email'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white/15 text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {tab === 'timeline' ? 'Timeline' : tab === 'workflows' ? `Workflows (${enrollments.length})` : 'E-Mail senden'}
          </button>
        ))}
      </div>

      {/* Tab-Inhalt */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {events.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">Noch keine Events erfasst</div>
            )}
            {events.map(ev => {
              const Icon = EVENT_ICONS[ev.event_type] || Activity
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium">{formatEventType(ev.event_type)}</div>
                    {ev.source_app && (
                      <div className="text-xs text-white/40">{ev.source_app}</div>
                    )}
                    {ev.event_data && Object.keys(ev.event_data).length > 0 && (
                      <div className="text-xs text-white/30 mt-1 font-mono truncate">
                        {JSON.stringify(ev.event_data).slice(0, 80)}…
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white/30 shrink-0">{timeAgo(ev.created_at)}</div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="space-y-3">
            {enrollments.length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">Nicht in aktiven Workflows</div>
            )}
            {enrollments.map(en => (
              <div key={en.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">
                      {en.fw_marketing_workflows?.name || 'Workflow'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    en.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    en.status === 'completed' ? 'bg-sky-500/20 text-sky-400' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {en.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                    {en.status}
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  Schritt {en.current_step} · Eingeschrieben {timeAgo(en.enrolled_at)}
                </div>
                {/* Progress Bar */}
                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-sky-500 rounded-full transition-all"
                    style={{ width: `${Math.min((en.current_step / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            {!identity.email ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="text-sm text-white/50">Keine E-Mail-Adresse bekannt</div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">An</label>
                  <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70">
                    {identity.email}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Betreff</label>
                  <input
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    placeholder="Betreff eingeben…"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Nachricht</label>
                  <textarea
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    placeholder="Nachricht eingeben…"
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={sendEmail}
                  disabled={sending || !emailSubject || !emailBody}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Wird gesendet…' : 'E-Mail senden'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function UarDashboard() {
  const [identities, setIdentities] = useState<UarIdentity[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<UarIdentity | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0, identified: 0, leads: 0, customers: 0,
    newThisWeek: 0, avgScore: 0,
  })
  const [activeWorkflows, setActiveWorkflows] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [idRes, wfRes] = await Promise.all([
        supabase
          .from('fw_uar_identities')
          .select('*')
          .order('last_seen_at', { ascending: false, nullsFirst: false })
          .limit(200),
        supabase
          .from('fw_workflow_enrollments')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
      ])

      if (idRes.data) {
        const data = idRes.data as UarIdentity[]
        setIdentities(data)
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        setStats({
          total: data.length,
          identified: data.filter(d => d.status !== 'anonymous').length,
          leads: data.filter(d => ['lead', 'qualified'].includes(d.status)).length,
          customers: data.filter(d => d.status === 'customer').length,
          newThisWeek: data.filter(d => new Date(d.created_at).getTime() > oneWeekAgo).length,
          avgScore: data.length ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length) : 0,
        })
      }
      if (wfRes.count !== null) setActiveWorkflows(wfRes.count)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = identities.filter(id => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (id.email || '').toLowerCase().includes(q) ||
      (id.name || '').toLowerCase().includes(q) ||
      (id.company || '').toLowerCase().includes(q) ||
      id.fintutto_id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || id.status === statusFilter
    const matchSegment = segmentFilter === 'all' || id.segment === segmentFilter
    return matchSearch && matchStatus && matchSegment
  })

  return (
    <div className="relative min-h-screen text-white">
      <MeshBackground />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Universal Account Record</h1>
                <p className="text-sm text-white/50">Customer Data Platform · Kein Lead geht verloren</p>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </button>
        </div>

        {/* KPI-Karten */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <KpiCard
            icon={Users}
            label="Kontakte gesamt"
            value={stats.total}
            gradient="from-sky-500 to-cyan-600"
            trend={stats.newThisWeek}
          />
          <KpiCard
            icon={Target}
            label="Identifiziert"
            value={stats.identified}
            sub={`${stats.total ? Math.round((stats.identified / stats.total) * 100) : 0}% aller Kontakte`}
            gradient="from-violet-500 to-purple-600"
          />
          <KpiCard
            icon={Zap}
            label="Aktive Leads"
            value={stats.leads}
            gradient="from-amber-500 to-orange-600"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Kunden"
            value={stats.customers}
            gradient="from-emerald-500 to-green-600"
          />
          <KpiCard
            icon={Activity}
            label="Ø Lead-Score"
            value={stats.avgScore}
            sub="von 100 Punkten"
            gradient="from-pink-500 to-rose-600"
          />
          <KpiCard
            icon={Workflow}
            label="Aktive Workflows"
            value={activeWorkflows}
            sub="Drip-Sequenzen laufen"
            gradient="from-teal-500 to-cyan-600"
          />
        </div>

        {/* Haupt-Bereich: Liste + Detail */}
        <div className={`grid gap-6 ${selected ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>

          {/* Kontakt-Liste */}
          <div className={`${selected ? 'lg:col-span-2' : 'col-span-1'} rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden`}>

            {/* Filter-Leiste */}
            <div className="p-4 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Suche nach Name, E-Mail, Firma…"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Alle Status</option>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <select
                    value={segmentFilter}
                    onChange={e => setSegmentFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Alle Branchen</option>
                    {Object.entries(SEGMENT_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.emoji} {v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-xs text-white/30">
                {filtered.length} von {identities.length} Kontakten
              </div>
            </div>

            {/* Liste */}
            <div className="overflow-y-auto max-h-[600px] p-2">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">
                  Keine Kontakte gefunden
                </div>
              ) : (
                filtered.map(id => (
                  <ContactRow
                    key={id.id}
                    identity={id}
                    onClick={() => setSelected(selected?.id === id.id ? null : id)}
                    selected={selected?.id === id.id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Detail-Panel */}
          {selected && (
            <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              <ContactDetail
                identity={selected}
                onClose={() => setSelected(null)}
              />
            </div>
          )}
        </div>

        {/* Segment-Übersicht */}
        {!selected && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              Kontakte nach Branche
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(SEGMENT_CONFIG).map(([key, cfg]) => {
                const count = identities.filter(id => id.segment === key).length
                if (count === 0) return null
                return (
                  <button
                    key={key}
                    onClick={() => setSegmentFilter(key)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center text-sm shrink-0`}>
                      {cfg.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{count}</div>
                      <div className="text-xs text-white/40 leading-tight">{cfg.label}</div>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-white/20 group-hover:text-white/60 ml-auto transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
