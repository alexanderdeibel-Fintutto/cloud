import { useState } from 'react'
import { Save, X, Trash2, ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react'

// ── All option constants (matching server/personas/types.ts) ──

const GENDERS = [
  { value: 'w', label: 'Weiblich' },
  { value: 'm', label: 'Männlich' },
  { value: 'd', label: 'Divers' },
] as const

const SITUATIONS = [
  { value: 'alleinerziehend', label: 'Alleinerziehend' },
  { value: 'single', label: 'Single' },
  { value: 'paar_ohne_kinder', label: 'Paar ohne Kinder' },
  { value: 'paar_mit_kindern', label: 'Paar mit Kindern' },
  { value: 'senior', label: 'Senior' },
  { value: 'geflüchtet', label: 'Geflüchtet' },
  { value: 'langzeitbezieher', label: 'Langzeitbezieher' },
  { value: 'neubezieher', label: 'Neubezieher' },
  { value: 'aufstocker', label: 'Aufstocker' },
  { value: 'student', label: 'Student' },
  { value: 'behinderung', label: 'Behinderung' },
  { value: 'trennung', label: 'Trennung' },
] as const

const TONES = [
  { value: 'emotional_aber_sachlich', label: 'Emotional aber sachlich' },
  { value: 'warmherzig', label: 'Warmherzig' },
  { value: 'unsicher', label: 'Unsicher' },
  { value: 'kämpferisch', label: 'Kämpferisch' },
  { value: 'verunsichert', label: 'Verunsichert' },
  { value: 'präzise_juristisch', label: 'Präzise juristisch' },
  { value: 'frustriert_sarkastisch', label: 'Frustriert sarkastisch' },
  { value: 'positiv_lösungsorientiert', label: 'Positiv lösungsorientiert' },
  { value: 'höflich_altmodisch', label: 'Höflich altmodisch' },
  { value: 'direkt_stark', label: 'Direkt & stark' },
  { value: 'professionell', label: 'Professionell' },
  { value: 'abgeklärt_ironisch', label: 'Abgeklärt ironisch' },
  { value: 'pragmatisch', label: 'Pragmatisch' },
  { value: 'dankbar_unsicher', label: 'Dankbar unsicher' },
] as const

const SCHREIBSTILE = [
  { value: 'umgangssprache_stark', label: 'Umgangssprache (stark)', desc: 'alles klein, Abkürzungen, Tippfehler' },
  { value: 'umgangssprache_mittel', label: 'Umgangssprache (mittel)', desc: 'locker aber lesbar' },
  { value: 'umgangssprache_leicht', label: 'Umgangssprache (leicht)', desc: 'normal mit gelegentlichen Fehlern' },
  { value: 'hochdeutsch', label: 'Hochdeutsch', desc: 'korrekt, förmlich' },
  { value: 'juristisch', label: 'Juristisch', desc: 'Paragraphen, Fachsprache' },
  { value: 'gebrochen_deutsch', label: 'Gebrochen Deutsch', desc: 'Sprachbarriere' },
] as const

const EMOJI_NUTZUNG = [
  { value: 'nie', label: 'Nie' },
  { value: 'selten', label: 'Selten' },
  { value: 'gelegentlich', label: 'Gelegentlich' },
  { value: 'häufig', label: 'Häufig' },
] as const

const POSTING_FREQUENCIES = [
  { value: 'taeglich', label: 'Täglich', desc: '5-7x/Woche' },
  { value: '3_4_pro_woche', label: '3-4x/Woche' },
  { value: '2_3_pro_woche', label: '2-3x/Woche' },
  { value: '1_2_pro_woche', label: '1-2x/Woche' },
  { value: 'gelegentlich', label: 'Gelegentlich', desc: '2-4x/Monat' },
  { value: 'selten', label: 'Selten', desc: '1x/Monat oder weniger' },
] as const

const TIME_PROFILES = [
  { value: 'fruehaufsteher', label: 'Frühaufsteher', desc: '6-10, 12-14 Uhr' },
  { value: 'berufstaetig', label: 'Berufstätig', desc: '7-8, 12-13, 18-23 Uhr' },
  { value: 'nachtaktiv', label: 'Nachtaktiv', desc: '14-02 Uhr' },
  { value: 'ganztags', label: 'Ganztags', desc: '8-23 Uhr verteilt' },
] as const

const ENGAGEMENT_STYLES = [
  { value: 'schreiber', label: 'Schreiber', desc: 'erstellt viele eigene Posts' },
  { value: 'kommentierer', label: 'Kommentierer', desc: 'antwortet vor allem auf andere' },
  { value: 'liker', label: 'Liker', desc: 'liked viel, schreibt wenig' },
  { value: 'lurker_gelegentlich', label: 'Lurker', desc: 'liest viel, schreibt selten' },
  { value: 'mixed', label: 'Mixed', desc: 'gleichmäßig verteilt' },
] as const

const FORUMS = [
  { value: 'hilfe-bescheid', label: 'Hilfe Bescheid' },
  { value: 'widerspruch', label: 'Widerspruch' },
  { value: 'sanktionen', label: 'Sanktionen' },
  { value: 'kdu-miete', label: 'KdU / Miete' },
  { value: 'zuverdienst', label: 'Zuverdienst' },
  { value: 'erfolge', label: 'Erfolge' },
  { value: 'auskotzen', label: 'Auskotzen' },
  { value: 'allgemeines', label: 'Allgemeines' },
] as const

const CONTENT_TAGS = [
  'bescheid', 'berechnung', 'fehler', 'mehrbedarf', 'regelsatz',
  'widerspruch', 'klage', 'sozialgericht', 'sanktion', 'termin',
  'egv', 'massnahme', 'kdu', 'miete', 'heizkosten', 'umzug',
  'minijob', 'einkommen', 'freibetrag', 'anrechnung',
  'bedarfsgemeinschaft', 'trennung', 'kinder', 'alleinerziehend',
  'schwerbehinderung', 'erfolg', 'nachzahlung', 'gewonnen',
  'frust', 'sachbearbeiter', 'wartezeit', 'buergergeld',
] as const

const KOMMENTAR_LAENGEN = [
  { value: 'kurz', label: 'Kurz' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'lang', label: 'Lang' },
  { value: 'mixed', label: 'Mixed' },
] as const

const BUNDESLAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'NRW', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
  'Schleswig-Holstein', 'Thüringen',
] as const

const STADT_TYPEN = [
  { value: 'grossstadt', label: 'Großstadt' },
  { value: 'mittelstadt', label: 'Mittelstadt' },
  { value: 'kleinstadt', label: 'Kleinstadt' },
] as const

const AVATAR_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c',
  '#e67e22', '#34495e', '#16a085', '#c0392b', '#2980b9', '#8e44ad',
  '#d35400', '#27ae60', '#7f8c8d',
]

const PROBLEME_OPTIONS = [
  'bescheid', 'berechnung', 'fehler', 'mehrbedarf', 'regelsatz',
  'widerspruch', 'klage', 'sozialgericht', 'sanktion', 'termin',
  'egv', 'massnahme', 'kdu', 'miete', 'heizkosten', 'umzug',
]

// ── Form State Type ──

interface PersonaFormData {
  username: string
  email: string
  display_name: string
  password: string
  bio: string
  avatar_color: string
  wave: string
  profile: {
    alter: number
    geschlecht: string
    situation: string
    kinder?: number
    kinder_alter?: number[]
    stadt_typ: string
    bundesland: string
    seit_buergergeld: string
    probleme: string[]
    erfahrung_widerspruch: boolean
    ton: string
    schreibstil: string
    emoji_nutzung: string
    tippfehler_rate: number
    gross_klein_fehler: boolean
    beispiel_saetze: string[]
  }
  activity: {
    posting_frequency: string
    time_profile: string
    engagement_style: string
    active_forums: string[]
    themen_schwerpunkte: string[]
    kommentar_laenge: string
    bescheidboxer_affinity: number
  }
}

function getDefaultFormData(): PersonaFormData {
  return {
    username: '',
    email: '',
    display_name: '',
    password: '',
    bio: '',
    avatar_color: '#3498db',
    wave: 'manuell',
    profile: {
      alter: 30,
      geschlecht: 'w',
      situation: 'single',
      kinder: undefined,
      kinder_alter: undefined,
      stadt_typ: 'grossstadt',
      bundesland: 'NRW',
      seit_buergergeld: new Date().toISOString().slice(0, 7),
      probleme: [],
      erfahrung_widerspruch: false,
      ton: 'pragmatisch',
      schreibstil: 'umgangssprache_leicht',
      emoji_nutzung: 'selten',
      tippfehler_rate: 0,
      gross_klein_fehler: false,
      beispiel_saetze: [],
    },
    activity: {
      posting_frequency: 'gelegentlich',
      time_profile: 'ganztags',
      engagement_style: 'mixed',
      active_forums: ['hilfe-bescheid'],
      themen_schwerpunkte: [],
      kommentar_laenge: 'mittel',
      bescheidboxer_affinity: 0,
    },
  }
}

function personaToFormData(persona: any): PersonaFormData {
  return {
    username: persona.username || '',
    email: persona.email || '',
    display_name: persona.display_name || '',
    password: persona.password || '',
    bio: persona.bio || '',
    avatar_color: persona.avatar_color || '#3498db',
    wave: persona.wave || '',
    profile: {
      alter: persona.profile?.alter ?? 30,
      geschlecht: persona.profile?.geschlecht ?? 'w',
      situation: persona.profile?.situation ?? 'single',
      kinder: persona.profile?.kinder,
      kinder_alter: persona.profile?.kinder_alter,
      stadt_typ: persona.profile?.stadt_typ?.split('_')[0] ?? 'grossstadt',
      bundesland: persona.profile?.bundesland ?? 'NRW',
      seit_buergergeld: persona.profile?.seit_buergergeld ?? '',
      probleme: persona.profile?.probleme ?? [],
      erfahrung_widerspruch: persona.profile?.erfahrung_widerspruch ?? false,
      ton: persona.profile?.ton ?? 'pragmatisch',
      schreibstil: persona.profile?.schreibstil ?? 'umgangssprache_leicht',
      emoji_nutzung: persona.profile?.emoji_nutzung ?? 'selten',
      tippfehler_rate: persona.profile?.tippfehler_rate ?? 0,
      gross_klein_fehler: persona.profile?.gross_klein_fehler ?? false,
      beispiel_saetze: persona.profile?.beispiel_saetze ?? [],
    },
    activity: {
      posting_frequency: persona.activity?.posting_frequency ?? 'gelegentlich',
      time_profile: persona.activity?.time_profile ?? 'ganztags',
      engagement_style: persona.activity?.engagement_style ?? 'mixed',
      active_forums: persona.activity?.active_forums ?? ['hilfe-bescheid'],
      themen_schwerpunkte: persona.activity?.themen_schwerpunkte ?? [],
      kommentar_laenge: persona.activity?.kommentar_laenge ?? 'mittel',
      bescheidboxer_affinity: persona.activity?.bescheidboxer_affinity ?? 0,
    },
  }
}

// ── Collapsible Section ──

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 text-sm font-semibold hover:bg-muted transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

// ── Reusable Field Components ──

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
    />
  )
}

function NumberInput({ value, onChange, min, max, step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
    />
  )
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: readonly { value: string; label: string; desc?: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}{o.desc ? ` – ${o.desc}` : ''}
        </option>
      ))}
    </select>
  )
}

function CheckboxInput({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="rounded border-input"
      />
      {label}
    </label>
  )
}

function MultiSelect({ values, onChange, options }: {
  values: string[]; onChange: (v: string[]) => void; options: readonly { value: string; label: string }[]
}) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
            values.includes(o.value)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-input hover:border-primary/50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function TagSelect({ values, onChange, options }: {
  values: string[]; onChange: (v: string[]) => void; options: readonly string[]
}) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter(v => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {options.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggle(tag)}
          className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
            values.includes(tag)
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-background text-muted-foreground border-input hover:border-primary/30'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}

function StringListEditor({ values, onChange, placeholder }: {
  values: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const addItem = () => onChange([...values, ''])
  const removeItem = (idx: number) => onChange(values.filter((_, i) => i !== idx))
  const updateItem = (idx: number, val: string) => {
    const next = [...values]
    next[idx] = val
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {values.map((val, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <input
            value={val}
            onChange={e => updateItem(idx, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80"
      >
        <Plus className="w-3 h-3" /> Hinzufügen
      </button>
    </div>
  )
}

function NumberListEditor({ values, onChange, min, max }: {
  values: number[]; onChange: (v: number[]) => void; min?: number; max?: number
}) {
  const addItem = () => onChange([...values, 1])
  const removeItem = (idx: number) => onChange(values.filter((_, i) => i !== idx))
  const updateItem = (idx: number, val: number) => {
    const next = [...values]
    next[idx] = val
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {values.map((val, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground w-12">Kind {idx + 1}:</span>
          <input
            type="number"
            value={val}
            onChange={e => updateItem(idx, Number(e.target.value))}
            min={min}
            max={max}
            className="w-16 px-2 py-1 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-[10px] text-muted-foreground">Jahre</span>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1 text-muted-foreground hover:text-destructive"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80"
      >
        <Plus className="w-3 h-3" /> Kind hinzufügen
      </button>
    </div>
  )
}

// ── Main Form Component ──

interface PersonaFormProps {
  persona?: any // existing persona for edit mode, undefined for create
  onSave: (data: PersonaFormData) => Promise<void>
  onDelete?: () => Promise<void>
  onCancel: () => void
  saving?: boolean
}

export default function PersonaForm({ persona, onSave, onDelete, onCancel, saving }: PersonaFormProps) {
  const isEdit = !!persona
  const [form, setForm] = useState<PersonaFormData>(
    isEdit ? personaToFormData(persona) : getDefaultFormData()
  )

  const updateProfile = (key: string, value: any) => {
    setForm(f => ({ ...f, profile: { ...f.profile, [key]: value } }))
  }

  const updateActivity = (key: string, value: any) => {
    setForm(f => ({ ...f, activity: { ...f.activity, [key]: value } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Build stadt_typ from selection + bundesland
    const submitData = {
      ...form,
      profile: {
        ...form.profile,
        stadt_typ: `${form.profile.stadt_typ}_${form.profile.bundesland.toLowerCase().replace(/[^a-z]/g, '_')}`,
      },
    }
    await onSave(submitData)
  }

  const showKinder = ['alleinerziehend', 'paar_mit_kindern'].includes(form.profile.situation)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {isEdit ? `Persona bearbeiten: ${persona.display_name}` : 'Neue Persona erstellen'}
        </h2>
        <button type="button" onClick={onCancel} className="p-1.5 hover:bg-muted rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Basis-Daten ── */}
      <Section title="Basis-Daten">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Username">
            <TextInput value={form.username} onChange={v => setForm(f => ({ ...f, username: v }))} placeholder="z.B. lisa_m_2025" />
          </Field>
          <Field label="Anzeigename">
            <TextInput value={form.display_name} onChange={v => setForm(f => ({ ...f, display_name: v }))} placeholder="z.B. Lisa M." />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-Mail">
            <TextInput value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="auto-generiert wenn leer" type="email" />
          </Field>
          <Field label="Passwort">
            <TextInput value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="auto-generiert wenn leer" />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            rows={2}
            placeholder="Kurze Beschreibung der Persona..."
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-y"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Avatar-Farbe">
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, avatar_color: c }))}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      form.avatar_color === c ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </Field>
          <Field label="Welle / Gruppe" hint="z.B. 'gruender', 'welle2', 'manuell'">
            <TextInput value={form.wave} onChange={v => setForm(f => ({ ...f, wave: v }))} placeholder="manuell" />
          </Field>
        </div>
      </Section>

      {/* ── Persönliches Profil ── */}
      <Section title="Persönliches Profil">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Alter">
            <NumberInput value={form.profile.alter} onChange={v => updateProfile('alter', v)} min={16} max={85} />
          </Field>
          <Field label="Geschlecht">
            <SelectInput value={form.profile.geschlecht} onChange={v => updateProfile('geschlecht', v)} options={GENDERS} />
          </Field>
          <Field label="Situation">
            <SelectInput value={form.profile.situation} onChange={v => updateProfile('situation', v)} options={SITUATIONS} />
          </Field>
        </div>

        {showKinder && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Anzahl Kinder">
              <NumberInput
                value={form.profile.kinder ?? 0}
                onChange={v => {
                  updateProfile('kinder', v > 0 ? v : undefined)
                  if (v > 0) {
                    const current = form.profile.kinder_alter || []
                    const adjusted = Array.from({ length: v }, (_, i) => current[i] ?? 5)
                    updateProfile('kinder_alter', adjusted)
                  } else {
                    updateProfile('kinder_alter', undefined)
                  }
                }}
                min={0}
                max={8}
              />
            </Field>
            {(form.profile.kinder ?? 0) > 0 && (
              <Field label="Alter der Kinder">
                <NumberListEditor
                  values={form.profile.kinder_alter || []}
                  onChange={v => updateProfile('kinder_alter', v)}
                  min={0}
                  max={18}
                />
              </Field>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Field label="Stadt-Typ">
            <SelectInput value={form.profile.stadt_typ} onChange={v => updateProfile('stadt_typ', v)} options={STADT_TYPEN} />
          </Field>
          <Field label="Bundesland">
            <select
              value={form.profile.bundesland}
              onChange={e => updateProfile('bundesland', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {BUNDESLAENDER.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Seit Bürgergeld" hint="YYYY-MM">
            <TextInput value={form.profile.seit_buergergeld} onChange={v => updateProfile('seit_buergergeld', v)} placeholder="2024-06" />
          </Field>
        </div>

        <Field label="Probleme / Themen">
          <TagSelect
            values={form.profile.probleme}
            onChange={v => updateProfile('probleme', v)}
            options={PROBLEME_OPTIONS}
          />
        </Field>

        <CheckboxInput
          checked={form.profile.erfahrung_widerspruch}
          onChange={v => updateProfile('erfahrung_widerspruch', v)}
          label="Hat Erfahrung mit Widerspruch"
        />
      </Section>

      {/* ── Schreibstil ── */}
      <Section title="Schreibstil & Ton">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ton">
            <SelectInput value={form.profile.ton} onChange={v => updateProfile('ton', v)} options={TONES} />
          </Field>
          <Field label="Schreibstil">
            <SelectInput value={form.profile.schreibstil} onChange={v => updateProfile('schreibstil', v)} options={SCHREIBSTILE} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Emoji-Nutzung">
            <SelectInput value={form.profile.emoji_nutzung} onChange={v => updateProfile('emoji_nutzung', v)} options={EMOJI_NUTZUNG} />
          </Field>
          <Field label="Tippfehler-Rate" hint="0.0 bis 0.1">
            <NumberInput value={form.profile.tippfehler_rate} onChange={v => updateProfile('tippfehler_rate', v)} min={0} max={0.1} step={0.01} />
          </Field>
          <Field label="Groß/Klein-Fehler" hint=" ">
            <div className="pt-1">
              <CheckboxInput
                checked={form.profile.gross_klein_fehler}
                onChange={v => updateProfile('gross_klein_fehler', v)}
                label="Macht Groß/Klein-Fehler"
              />
            </div>
          </Field>
        </div>
        <Field label="Beispiel-Sätze" hint="Typische Formulierungen dieser Persona">
          <StringListEditor
            values={form.profile.beispiel_saetze}
            onChange={v => updateProfile('beispiel_saetze', v)}
            placeholder="z.B. 'hab gerade meinen bescheid geprüft...'"
          />
        </Field>
      </Section>

      {/* ── Aktivitäts-Profil ── */}
      <Section title="Aktivitäts-Profil">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Posting-Frequenz">
            <SelectInput value={form.activity.posting_frequency} onChange={v => updateActivity('posting_frequency', v)} options={POSTING_FREQUENCIES} />
          </Field>
          <Field label="Zeitprofil">
            <SelectInput value={form.activity.time_profile} onChange={v => updateActivity('time_profile', v)} options={TIME_PROFILES} />
          </Field>
          <Field label="Engagement-Stil">
            <SelectInput value={form.activity.engagement_style} onChange={v => updateActivity('engagement_style', v)} options={ENGAGEMENT_STYLES} />
          </Field>
        </div>

        <Field label="Aktive Foren">
          <MultiSelect
            values={form.activity.active_forums}
            onChange={v => updateActivity('active_forums', v)}
            options={FORUMS}
          />
        </Field>

        <Field label="Themen-Schwerpunkte">
          <TagSelect
            values={form.activity.themen_schwerpunkte}
            onChange={v => updateActivity('themen_schwerpunkte', v)}
            options={CONTENT_TAGS}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kommentar-Länge">
            <SelectInput value={form.activity.kommentar_laenge} onChange={v => updateActivity('kommentar_laenge', v)} options={KOMMENTAR_LAENGEN} />
          </Field>
          <Field label="BescheidBoxer-Affinität" hint="0.0 (nie) bis 1.0 (sehr oft)">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={form.activity.bescheidboxer_affinity}
                onChange={e => updateActivity('bescheidboxer_affinity', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs font-mono w-10 text-right">
                {(form.activity.bescheidboxer_affinity * 100).toFixed(0)}%
              </span>
            </div>
          </Field>
        </div>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-forum text-xs text-destructive hover:bg-destructive/10 border border-destructive/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Persona löschen
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="btn-forum-ghost text-xs">
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-forum-primary text-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Speichern...' : isEdit ? 'Speichern' : 'Persona erstellen'}
          </button>
        </div>
      </div>
    </form>
  )
}
