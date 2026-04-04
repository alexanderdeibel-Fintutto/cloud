/**
 * OnboardingWizard — fintutto AMS
 *
 * Universeller 5-Schritte-Onboarding-Wizard für alle 15+ Zielpersonen.
 * Erscheint automatisch beim ersten Login als Full-Screen-Overlay.
 * Design: Landing-Page-Stil (dunkles Mesh-Gradient, Glassmorphism, Cyan/Violet-Akzente)
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import {
  ChevronRight, ChevronLeft, Check, Sparkles,
  Building2, Globe, Users, Zap, ArrowRight
} from 'lucide-react'

// ─── Typen ────────────────────────────────────────────────────────────────────

type Segment =
  | 'museum' | 'guide' | 'authority' | 'hospitality' | 'medical'
  | 'education' | 'conference' | 'cruise' | 'gastro' | 'park'
  | 'sacred' | 'transport' | 'ngo' | 'agency' | 'personal'

interface WizardConfig {
  segment: Segment
  label: string
  emoji: string
  gradient: string
  headline: string
  subline: string
  appUrl: string
  steps: WizardStep[]
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  fields: WizardField[]
}

interface WizardField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'url'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

// ─── Segment-Konfigurationen ──────────────────────────────────────────────────

const WIZARD_CONFIGS: Record<Segment, WizardConfig> = {
  museum: {
    segment: 'museum', label: 'Museum & Galerie', emoji: '🏛️',
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    headline: 'Willkommen im Museum-Cockpit',
    subline: 'Deine Besucher hören deine Geschichte — in ihrer Sprache.',
    appUrl: 'https://cms.fintutto.world',
    steps: [
      {
        id: 'institution', title: 'Deine Institution', description: 'Erzähl uns von deinem Museum.',
        icon: Building2,
        fields: [
          { key: 'institution_name', label: 'Name des Museums', type: 'text', placeholder: 'z.B. Städtisches Kunstmuseum', required: true },
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://…' },
        ],
      },
      {
        id: 'visitors', title: 'Deine Besucher', description: 'Wie viele Besucher empfängst du?',
        icon: Users,
        fields: [
          { key: 'visitors_per_year', label: 'Besucher pro Jahr', type: 'number', placeholder: '50000' },
          { key: 'top_languages', label: 'Häufigste Besuchersprachen', type: 'text', placeholder: 'z.B. Englisch, Chinesisch, Arabisch' },
          { key: 'current_solution', label: 'Aktuelle Lösung', type: 'select', options: [
            { value: 'none', label: 'Keine' },
            { value: 'audioguide', label: 'Audioguide-Geräte' },
            { value: 'app', label: 'Eigene App' },
            { value: 'paper', label: 'Papier-Broschüren' },
            { value: 'other', label: 'Sonstiges' },
          ]},
        ],
      },
      {
        id: 'content', title: 'Deine Inhalte', description: 'Was möchtest du übersetzen?',
        icon: Globe,
        fields: [
          { key: 'content_count', label: 'Anzahl Exponate / Räume', type: 'number', placeholder: '120' },
          { key: 'content_type', label: 'Art der Inhalte', type: 'select', options: [
            { value: 'artworks', label: 'Kunstwerke' },
            { value: 'history', label: 'Historische Objekte' },
            { value: 'science', label: 'Wissenschaft & Natur' },
            { value: 'mixed', label: 'Gemischt' },
          ]},
          { key: 'tour_count', label: 'Geplante Touren', type: 'number', placeholder: '5' },
        ],
      },
      {
        id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?',
        icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'accessibility', label: 'Barrierefreiheit verbessern' },
            { value: 'international', label: 'Internationale Besucher gewinnen' },
            { value: 'cost', label: 'Audioguide-Kosten senken' },
            { value: 'experience', label: 'Besuchererlebnis modernisieren' },
          ]},
          { key: 'timeline', label: 'Wann möchtest du starten?', type: 'select', options: [
            { value: 'now', label: 'Sofort' },
            { value: '1month', label: 'In 1 Monat' },
            { value: '3months', label: 'In 3 Monaten' },
            { value: 'exploring', label: 'Ich schaue mich erst um' },
          ]},
        ],
      },
      {
        id: 'ready', title: 'Alles bereit!', description: 'Dein Museum-Cockpit ist eingerichtet.',
        icon: Sparkles,
        fields: [],
      },
    ],
  },

  guide: {
    segment: 'guide', label: 'Stadtführer & Guide', emoji: '🎤',
    gradient: 'from-sky-600 via-cyan-700 to-teal-800',
    headline: 'Dein Guide-Cockpit ist bereit',
    subline: 'Führe Gruppen in jeder Sprache — ohne Technik-Stress.',
    appUrl: 'https://guide.fintutto.world',
    steps: [
      {
        id: 'profile', title: 'Dein Profil', description: 'Wer bist du als Guide?',
        icon: Building2,
        fields: [
          { key: 'guide_name', label: 'Dein Name', type: 'text', placeholder: 'Vollständiger Name', required: true },
          { key: 'city', label: 'Deine Stadt / Region', type: 'text', placeholder: 'z.B. Berlin', required: true },
          { key: 'languages_spoken', label: 'Sprachen die du sprichst', type: 'text', placeholder: 'z.B. Deutsch, Englisch, Spanisch' },
        ],
      },
      {
        id: 'tours', title: 'Deine Touren', description: 'Was bietest du an?',
        icon: Globe,
        fields: [
          { key: 'tour_types', label: 'Art der Touren', type: 'select', options: [
            { value: 'city', label: 'Stadtführungen' },
            { value: 'museum', label: 'Museumsführungen' },
            { value: 'nature', label: 'Natur & Wandern' },
            { value: 'food', label: 'Kulinarische Touren' },
            { value: 'mixed', label: 'Gemischt' },
          ]},
          { key: 'group_size', label: 'Typische Gruppengröße', type: 'number', placeholder: '15' },
          { key: 'tours_per_week', label: 'Touren pro Woche', type: 'number', placeholder: '5' },
        ],
      },
      {
        id: 'visitors', title: 'Deine Gäste', description: 'Woher kommen deine Gäste?',
        icon: Users,
        fields: [
          { key: 'top_nationalities', label: 'Häufigste Nationalitäten', type: 'text', placeholder: 'z.B. USA, Japan, Frankreich' },
          { key: 'booking_platform', label: 'Buchungsplattform', type: 'select', options: [
            { value: 'direct', label: 'Direkt / eigene Website' },
            { value: 'viator', label: 'Viator' },
            { value: 'getyourguide', label: 'GetYourGuide' },
            { value: 'airbnb', label: 'Airbnb Experiences' },
            { value: 'other', label: 'Sonstiges' },
          ]},
        ],
      },
      {
        id: 'goals', title: 'Deine Ziele', description: 'Was möchtest du erreichen?',
        icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'more_languages', label: 'Mehr Sprachen anbieten' },
            { value: 'better_reviews', label: 'Bessere Bewertungen' },
            { value: 'more_bookings', label: 'Mehr Buchungen' },
            { value: 'premium', label: 'Premium-Angebot positionieren' },
          ]},
        ],
      },
      { id: 'ready', title: 'Los geht\'s!', description: 'Dein Guide-Profil ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  authority: {
    segment: 'authority', label: 'Behörde & Amt', emoji: '🏛️',
    gradient: 'from-blue-600 via-indigo-700 to-slate-800',
    headline: 'Willkommen im Behörden-Cockpit',
    subline: 'Verständigung — wenn sie wirklich zählt.',
    appUrl: 'https://amt.fintutto.world',
    steps: [
      { id: 'institution', title: 'Ihre Behörde', description: 'Informationen zu Ihrer Institution.', icon: Building2,
        fields: [
          { key: 'institution_name', label: 'Name der Behörde', type: 'text', placeholder: 'z.B. Ausländerbehörde München', required: true },
          { key: 'city', label: 'Stadt / Gemeinde', type: 'text', placeholder: 'z.B. München', required: true },
          { key: 'department', label: 'Abteilung', type: 'text', placeholder: 'z.B. Einbürgerung' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereich', description: 'Wo wird übersetzt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'counter', label: 'Schalter / Empfang' },
            { value: 'consultation', label: 'Beratungsgespräche' },
            { value: 'documents', label: 'Dokumente übersetzen' },
            { value: 'all', label: 'Alle Bereiche' },
          ]},
          { key: 'daily_cases', label: 'Fälle pro Tag mit Sprachbedarf', type: 'number', placeholder: '20' },
          { key: 'top_languages', label: 'Häufigste Sprachen', type: 'text', placeholder: 'z.B. Arabisch, Türkisch, Russisch' },
        ],
      },
      { id: 'staff', title: 'Ihr Team', description: 'Wer nutzt das System?', icon: Users,
        fields: [
          { key: 'staff_count', label: 'Anzahl Mitarbeitende', type: 'number', placeholder: '15' },
          { key: 'it_contact', label: 'IT-Ansprechpartner', type: 'text', placeholder: 'Name oder E-Mail' },
        ],
      },
      { id: 'goals', title: 'Ihre Ziele', description: 'Was ist Ihnen wichtig?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'efficiency', label: 'Effizienz steigern' },
            { value: 'compliance', label: 'DSGVO-Konformität sicherstellen' },
            { value: 'cost', label: 'Dolmetscher-Kosten senken' },
            { value: 'quality', label: 'Kommunikationsqualität verbessern' },
          ]},
        ],
      },
      { id: 'ready', title: 'Eingerichtet!', description: 'Ihr Behörden-Cockpit ist bereit.', icon: Sparkles, fields: [] },
    ],
  },

  hospitality: {
    segment: 'hospitality', label: 'Hotel & Hospitality', emoji: '🏨',
    gradient: 'from-amber-600 via-orange-700 to-red-800',
    headline: 'Willkommen im Hotel-Cockpit',
    subline: 'Jeder Gast fühlt sich verstanden. Immer.',
    appUrl: 'https://hotel.fintutto.world',
    steps: [
      { id: 'property', title: 'Dein Hotel', description: 'Erzähl uns von deiner Unterkunft.', icon: Building2,
        fields: [
          { key: 'hotel_name', label: 'Name des Hotels', type: 'text', placeholder: 'z.B. Grand Hotel München', required: true },
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
          { key: 'room_count', label: 'Anzahl Zimmer', type: 'number', placeholder: '80' },
          { key: 'stars', label: 'Sterne-Kategorie', type: 'select', options: [
            { value: '3', label: '3 Sterne' }, { value: '4', label: '4 Sterne' },
            { value: '5', label: '5 Sterne' }, { value: 'boutique', label: 'Boutique-Hotel' },
          ]},
        ],
      },
      { id: 'guests', title: 'Deine Gäste', description: 'Wer übernachtet bei dir?', icon: Users,
        fields: [
          { key: 'top_nationalities', label: 'Häufigste Gast-Nationalitäten', type: 'text', placeholder: 'z.B. USA, China, UK' },
          { key: 'occupancy', label: 'Durchschnittliche Auslastung', type: 'select', options: [
            { value: 'low', label: 'Unter 50%' }, { value: 'medium', label: '50–80%' },
            { value: 'high', label: 'Über 80%' },
          ]},
        ],
      },
      { id: 'touchpoints', title: 'Kontaktpunkte', description: 'Wo kommunizierst du mit Gästen?', icon: Globe,
        fields: [
          { key: 'touchpoints', label: 'Wichtigste Touchpoints', type: 'select', options: [
            { value: 'checkin', label: 'Check-in / Rezeption' },
            { value: 'restaurant', label: 'Restaurant & Bar' },
            { value: 'concierge', label: 'Concierge & Ausflüge' },
            { value: 'all', label: 'Alle Bereiche' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was möchtest du verbessern?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'satisfaction', label: 'Gästezufriedenheit steigern' },
            { value: 'reviews', label: 'Bewertungen verbessern' },
            { value: 'upsell', label: 'Upselling-Potenzial nutzen' },
            { value: 'staff', label: 'Mitarbeiter entlasten' },
          ]},
        ],
      },
      { id: 'ready', title: 'Alles bereit!', description: 'Dein Hotel-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  conference: {
    segment: 'conference', label: 'Konferenz & Event', emoji: '🎤',
    gradient: 'from-pink-600 via-fuchsia-700 to-violet-800',
    headline: 'Dein Event-Cockpit ist bereit',
    subline: '1.000 Zuhörer. 50 Sprachen. Sofort.',
    appUrl: 'https://conference.fintutto.world',
    steps: [
      { id: 'event', title: 'Dein Event', description: 'Erzähl uns von deiner Veranstaltung.', icon: Building2,
        fields: [
          { key: 'event_name', label: 'Name der Veranstaltung', type: 'text', placeholder: 'z.B. Tech Summit 2025', required: true },
          { key: 'event_type', label: 'Art der Veranstaltung', type: 'select', options: [
            { value: 'conference', label: 'Konferenz' }, { value: 'congress', label: 'Kongress' },
            { value: 'summit', label: 'Summit' }, { value: 'workshop', label: 'Workshop' },
            { value: 'gala', label: 'Gala / Award' }, { value: 'trade_fair', label: 'Messe' },
          ]},
          { key: 'attendees', label: 'Erwartete Teilnehmer', type: 'number', placeholder: '500' },
        ],
      },
      { id: 'languages', title: 'Sprachen', description: 'Welche Sprachen werden benötigt?', icon: Globe,
        fields: [
          { key: 'language_count', label: 'Anzahl benötigter Sprachen', type: 'number', placeholder: '5' },
          { key: 'top_languages', label: 'Wichtigste Sprachen', type: 'text', placeholder: 'z.B. Englisch, Deutsch, Chinesisch' },
          { key: 'current_solution', label: 'Bisherige Lösung', type: 'select', options: [
            { value: 'none', label: 'Keine' }, { value: 'interpreters', label: 'Dolmetscher-Kabinen' },
            { value: 'app', label: 'Andere App' }, { value: 'other', label: 'Sonstiges' },
          ]},
        ],
      },
      { id: 'logistics', title: 'Logistik', description: 'Wie ist dein Event organisiert?', icon: Users,
        fields: [
          { key: 'parallel_tracks', label: 'Parallele Tracks / Räume', type: 'number', placeholder: '3' },
          { key: 'event_date', label: 'Nächstes Event (ungefähr)', type: 'text', placeholder: 'z.B. Juni 2025' },
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'cost', label: 'Dolmetscher-Kosten eliminieren' },
            { value: 'scale', label: 'Mehr Sprachen skalieren' },
            { value: 'experience', label: 'Teilnehmer-Erlebnis verbessern' },
            { value: 'international', label: 'International expandieren' },
          ]},
        ],
      },
      { id: 'ready', title: 'Event-Cockpit bereit!', description: 'Deine Konferenz-Infrastruktur ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  cruise: {
    segment: 'cruise', label: 'Kreuzfahrt', emoji: '🚢',
    gradient: 'from-cyan-600 via-teal-700 to-blue-800',
    headline: 'Dein Schiff. 130 Sprachen.',
    subline: 'Bis zu 560.000 EUR/Monat für Dolmetscher — weg.',
    appUrl: 'https://cruise.fintutto.world',
    steps: [
      { id: 'fleet', title: 'Deine Flotte', description: 'Informationen zu deinen Schiffen.', icon: Building2,
        fields: [
          { key: 'company_name', label: 'Reederei / Unternehmen', type: 'text', placeholder: 'z.B. MSC Cruises', required: true },
          { key: 'ship_count', label: 'Anzahl Schiffe', type: 'number', placeholder: '5' },
          { key: 'passengers_per_ship', label: 'Passagiere pro Schiff', type: 'number', placeholder: '3000' },
        ],
      },
      { id: 'languages', title: 'Sprachen & Routen', description: 'Welche Routen fahrt ihr?', icon: Globe,
        fields: [
          { key: 'routes', label: 'Hauptrouten', type: 'select', options: [
            { value: 'mediterranean', label: 'Mittelmeer' }, { value: 'caribbean', label: 'Karibik' },
            { value: 'northern', label: 'Nordeuropa / Fjorde' }, { value: 'asia', label: 'Asien' },
            { value: 'world', label: 'Weltreise' }, { value: 'mixed', label: 'Gemischt' },
          ]},
          { key: 'top_languages', label: 'Häufigste Passagier-Sprachen', type: 'text', placeholder: 'z.B. Englisch, Deutsch, Mandarin' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Users,
        fields: [
          { key: 'use_cases', label: 'Hauptanwendungsfälle', type: 'select', options: [
            { value: 'entertainment', label: 'Entertainment & Shows' },
            { value: 'excursions', label: 'Ausflüge & Guides' },
            { value: 'safety', label: 'Sicherheitsanweisungen' },
            { value: 'all', label: 'Alle Bereiche' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist das Hauptziel?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'cost', label: 'Dolmetscher-Kosten eliminieren' },
            { value: 'experience', label: 'Gästeerlebnis verbessern' },
            { value: 'languages', label: 'Mehr Sprachen abdecken' },
            { value: 'safety', label: 'Sicherheitskommunikation verbessern' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit zum Ablegen!', description: 'Dein Kreuzfahrt-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  medical: {
    segment: 'medical', label: 'Medizin & Gesundheit', emoji: '🩺',
    gradient: 'from-red-600 via-rose-700 to-pink-800',
    headline: 'Diagnose verstehen. Leben retten.',
    subline: 'Wenn Sprache über Leben und Tod entscheidet.',
    appUrl: 'https://medical.fintutto.world',
    steps: [
      { id: 'institution', title: 'Ihre Einrichtung', description: 'Informationen zu Ihrer Einrichtung.', icon: Building2,
        fields: [
          { key: 'institution_name', label: 'Name der Einrichtung', type: 'text', placeholder: 'z.B. Klinikum München', required: true },
          { key: 'type', label: 'Art der Einrichtung', type: 'select', options: [
            { value: 'hospital', label: 'Krankenhaus' }, { value: 'clinic', label: 'Klinik / MVZ' },
            { value: 'practice', label: 'Arztpraxis' }, { value: 'emergency', label: 'Notaufnahme' },
          ]},
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
        ],
      },
      { id: 'patients', title: 'Ihre Patienten', description: 'Wer kommt zu Ihnen?', icon: Users,
        fields: [
          { key: 'patients_per_day', label: 'Patienten pro Tag', type: 'number', placeholder: '100' },
          { key: 'top_languages', label: 'Häufigste Patientensprachen', type: 'text', placeholder: 'z.B. Arabisch, Türkisch, Russisch' },
          { key: 'language_barrier_rate', label: 'Anteil mit Sprachbarriere', type: 'select', options: [
            { value: 'low', label: 'Unter 10%' }, { value: 'medium', label: '10–30%' },
            { value: 'high', label: 'Über 30%' },
          ]},
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'consultation', label: 'Arzt-Patienten-Gespräch' },
            { value: 'documents', label: 'Dokumente & Aufklärung' },
            { value: 'emergency', label: 'Notaufnahme' },
            { value: 'all', label: 'Alle Bereiche' },
          ]},
        ],
      },
      { id: 'goals', title: 'Ihre Ziele', description: 'Was ist Ihnen am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'safety', label: 'Patientensicherheit verbessern' },
            { value: 'compliance', label: 'DSGVO & Datenschutz sicherstellen' },
            { value: 'efficiency', label: 'Effizienz steigern' },
            { value: 'cost', label: 'Dolmetscher-Kosten senken' },
          ]},
        ],
      },
      { id: 'ready', title: 'Eingerichtet!', description: 'Ihr Medizin-Cockpit ist bereit.', icon: Sparkles, fields: [] },
    ],
  },

  education: {
    segment: 'education', label: 'Schule & Hochschule', emoji: '🏫',
    gradient: 'from-emerald-600 via-green-700 to-teal-800',
    headline: 'Bildung ohne Sprachbarrieren',
    subline: 'Elterngespräche, Klassenfahrten, internationale Studierende.',
    appUrl: 'https://school.fintutto.world',
    steps: [
      { id: 'institution', title: 'Deine Schule', description: 'Erzähl uns von deiner Einrichtung.', icon: Building2,
        fields: [
          { key: 'institution_name', label: 'Name der Schule / Hochschule', type: 'text', placeholder: 'z.B. Gymnasium München-Nord', required: true },
          { key: 'type', label: 'Art der Einrichtung', type: 'select', options: [
            { value: 'primary', label: 'Grundschule' }, { value: 'secondary', label: 'Weiterführende Schule' },
            { value: 'vocational', label: 'Berufsschule' }, { value: 'university', label: 'Hochschule / Universität' },
          ]},
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
        ],
      },
      { id: 'students', title: 'Deine Schüler', description: 'Wie international ist deine Schule?', icon: Users,
        fields: [
          { key: 'student_count', label: 'Anzahl Schüler / Studierende', type: 'number', placeholder: '500' },
          { key: 'international_rate', label: 'Anteil mit Migrationshintergrund', type: 'select', options: [
            { value: 'low', label: 'Unter 20%' }, { value: 'medium', label: '20–50%' },
            { value: 'high', label: 'Über 50%' },
          ]},
          { key: 'top_languages', label: 'Häufigste Sprachen', type: 'text', placeholder: 'z.B. Arabisch, Türkisch, Russisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'parents', label: 'Elterngespräche' },
            { value: 'trips', label: 'Klassenfahrten & Ausflüge' },
            { value: 'international', label: 'Internationale Studierende' },
            { value: 'all', label: 'Alle Bereiche' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'inclusion', label: 'Inklusion fördern' },
            { value: 'parents', label: 'Elternkommunikation verbessern' },
            { value: 'international', label: 'Internationalisierung' },
            { value: 'efficiency', label: 'Verwaltungseffizienz steigern' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit!', description: 'Dein Schul-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  gastro: {
    segment: 'gastro', label: 'Restaurant & Gastro', emoji: '🍽️',
    gradient: 'from-orange-600 via-red-700 to-rose-800',
    headline: 'Dein Restaurant. Jede Sprache.',
    subline: 'Speisekarte, Bestellung, Service — barrierefrei.',
    appUrl: 'https://gastro.fintutto.world',
    steps: [
      { id: 'restaurant', title: 'Dein Restaurant', description: 'Erzähl uns von deinem Betrieb.', icon: Building2,
        fields: [
          { key: 'restaurant_name', label: 'Name des Restaurants', type: 'text', placeholder: 'z.B. Trattoria Roma', required: true },
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
          { key: 'covers', label: 'Sitzplätze', type: 'number', placeholder: '60' },
          { key: 'cuisine', label: 'Küche', type: 'select', options: [
            { value: 'italian', label: 'Italienisch' }, { value: 'german', label: 'Deutsch' },
            { value: 'asian', label: 'Asiatisch' }, { value: 'international', label: 'International' },
            { value: 'other', label: 'Sonstiges' },
          ]},
        ],
      },
      { id: 'guests', title: 'Deine Gäste', description: 'Wer kommt zu dir?', icon: Users,
        fields: [
          { key: 'tourist_rate', label: 'Anteil internationale Gäste', type: 'select', options: [
            { value: 'low', label: 'Unter 20%' }, { value: 'medium', label: '20–50%' },
            { value: 'high', label: 'Über 50%' },
          ]},
          { key: 'top_languages', label: 'Häufigste Gast-Sprachen', type: 'text', placeholder: 'z.B. Englisch, Chinesisch, Arabisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Was möchtest du übersetzen?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'menu', label: 'Speisekarte' },
            { value: 'ordering', label: 'Bestellung & Service' },
            { value: 'allergens', label: 'Allergene & Inhaltsstoffe' },
            { value: 'all', label: 'Alles' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'experience', label: 'Gästeerlebnis verbessern' },
            { value: 'reviews', label: 'Bewertungen steigern' },
            { value: 'upsell', label: 'Umsatz steigern' },
            { value: 'staff', label: 'Personal entlasten' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bon Appétit!', description: 'Dein Gastro-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  park: {
    segment: 'park', label: 'Freizeitpark & Zoo', emoji: '🎡',
    gradient: 'from-lime-600 via-green-700 to-emerald-800',
    headline: 'Dein Park. Jede Sprache.',
    subline: 'Natur und Spaß erleben — ohne Sprachbarrieren.',
    appUrl: 'https://park.fintutto.world',
    steps: [
      { id: 'park', title: 'Dein Park', description: 'Erzähl uns von deinem Park.', icon: Building2,
        fields: [
          { key: 'park_name', label: 'Name des Parks', type: 'text', placeholder: 'z.B. Tierpark Berlin', required: true },
          { key: 'type', label: 'Art des Parks', type: 'select', options: [
            { value: 'zoo', label: 'Zoo / Tierpark' }, { value: 'theme_park', label: 'Freizeitpark' },
            { value: 'nature', label: 'Naturpark / Botanischer Garten' }, { value: 'aquarium', label: 'Aquarium' },
          ]},
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. Berlin', required: true },
        ],
      },
      { id: 'visitors', title: 'Deine Besucher', description: 'Wie viele Besucher kommen?', icon: Users,
        fields: [
          { key: 'visitors_per_year', label: 'Besucher pro Jahr', type: 'number', placeholder: '500000' },
          { key: 'top_languages', label: 'Häufigste Besuchersprachen', type: 'text', placeholder: 'z.B. Englisch, Chinesisch, Arabisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Was möchtest du übersetzen?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'tours', label: 'Führungen & Touren' },
            { value: 'signs', label: 'Beschilderung & Info-Tafeln' },
            { value: 'events', label: 'Shows & Events' },
            { value: 'all', label: 'Alles' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'experience', label: 'Besuchererlebnis verbessern' },
            { value: 'international', label: 'Internationale Besucher gewinnen' },
            { value: 'accessibility', label: 'Barrierefreiheit verbessern' },
            { value: 'cost', label: 'Kosten senken' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit!', description: 'Dein Park-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  sacred: {
    segment: 'sacred', label: 'Kirche & Kloster', emoji: '⛪',
    gradient: 'from-stone-600 via-slate-700 to-zinc-800',
    headline: 'Willkommen im Gemeinde-Cockpit',
    subline: 'Gottesdienste, Führungen und Gemeinschaft — in jeder Sprache.',
    appUrl: 'https://fintutto.world',
    steps: [
      { id: 'institution', title: 'Deine Gemeinde', description: 'Erzähl uns von deiner Gemeinde.', icon: Building2,
        fields: [
          { key: 'institution_name', label: 'Name der Gemeinde / Kirche', type: 'text', placeholder: 'z.B. St. Michael München', required: true },
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
          { key: 'denomination', label: 'Konfession', type: 'select', options: [
            { value: 'catholic', label: 'Katholisch' }, { value: 'protestant', label: 'Evangelisch' },
            { value: 'orthodox', label: 'Orthodox' }, { value: 'other', label: 'Sonstiges' },
          ]},
        ],
      },
      { id: 'visitors', title: 'Deine Besucher', description: 'Wer kommt zu dir?', icon: Users,
        fields: [
          { key: 'visitors_per_week', label: 'Besucher pro Woche', type: 'number', placeholder: '200' },
          { key: 'top_languages', label: 'Häufigste Sprachen', type: 'text', placeholder: 'z.B. Englisch, Polnisch, Kroatisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'service', label: 'Gottesdienste' },
            { value: 'tours', label: 'Kirchenführungen' },
            { value: 'pastoral', label: 'Seelsorge & Gespräche' },
            { value: 'all', label: 'Alles' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'community', label: 'Gemeinschaft stärken' },
            { value: 'tourism', label: 'Touristen besser empfangen' },
            { value: 'accessibility', label: 'Barrierefreiheit verbessern' },
            { value: 'international', label: 'Internationale Gemeinde einbinden' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit!', description: 'Dein Gemeinde-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  transport: {
    segment: 'transport', label: 'Transport & ÖPNV', emoji: '🚌',
    gradient: 'from-blue-600 via-sky-700 to-cyan-800',
    headline: 'Dein Transport-Cockpit',
    subline: 'Jeder Fahrgast versteht jeden Hinweis. Sofort.',
    appUrl: 'https://fintutto.world',
    steps: [
      { id: 'operator', title: 'Dein Unternehmen', description: 'Erzähl uns von deinem Betrieb.', icon: Building2,
        fields: [
          { key: 'company_name', label: 'Name des Unternehmens', type: 'text', placeholder: 'z.B. MVG München', required: true },
          { key: 'type', label: 'Art des Transports', type: 'select', options: [
            { value: 'bus', label: 'Bus' }, { value: 'train', label: 'Bahn / U-Bahn' },
            { value: 'tram', label: 'Straßenbahn' }, { value: 'airport', label: 'Flughafen' },
            { value: 'mixed', label: 'Gemischt' },
          ]},
          { key: 'city', label: 'Stadt / Region', type: 'text', placeholder: 'z.B. München', required: true },
        ],
      },
      { id: 'passengers', title: 'Deine Fahrgäste', description: 'Wie international sind deine Fahrgäste?', icon: Users,
        fields: [
          { key: 'passengers_per_day', label: 'Fahrgäste pro Tag', type: 'number', placeholder: '50000' },
          { key: 'top_languages', label: 'Häufigste Sprachen', type: 'text', placeholder: 'z.B. Englisch, Arabisch, Türkisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'announcements', label: 'Durchsagen & Ansagen' },
            { value: 'signage', label: 'Beschilderung & Displays' },
            { value: 'staff', label: 'Mitarbeiter-Kommunikation' },
            { value: 'all', label: 'Alles' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'safety', label: 'Sicherheitskommunikation verbessern' },
            { value: 'experience', label: 'Fahrgasterlebnis verbessern' },
            { value: 'tourism', label: 'Touristen besser bedienen' },
            { value: 'compliance', label: 'Barrierefreiheits-Anforderungen erfüllen' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit!', description: 'Dein Transport-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  ngo: {
    segment: 'ngo', label: 'NGO & Soziales', emoji: '🌍',
    gradient: 'from-teal-600 via-emerald-700 to-green-800',
    headline: 'Deine NGO. Jede Sprache.',
    subline: 'Wenn Kommunikation Leben verändern kann.',
    appUrl: 'https://fintutto.world',
    steps: [
      { id: 'org', title: 'Deine Organisation', description: 'Erzähl uns von deiner NGO.', icon: Building2,
        fields: [
          { key: 'org_name', label: 'Name der Organisation', type: 'text', placeholder: 'z.B. Caritas München', required: true },
          { key: 'focus', label: 'Schwerpunkt', type: 'select', options: [
            { value: 'refugees', label: 'Flüchtlingshilfe' }, { value: 'social', label: 'Soziale Arbeit' },
            { value: 'health', label: 'Gesundheit' }, { value: 'education', label: 'Bildung' },
            { value: 'other', label: 'Sonstiges' },
          ]},
          { key: 'city', label: 'Stadt', type: 'text', placeholder: 'z.B. München', required: true },
        ],
      },
      { id: 'clients', title: 'Deine Klienten', description: 'Wen unterstützt du?', icon: Users,
        fields: [
          { key: 'clients_per_month', label: 'Klienten pro Monat', type: 'number', placeholder: '100' },
          { key: 'top_languages', label: 'Häufigste Sprachen', type: 'text', placeholder: 'z.B. Arabisch, Dari, Ukrainisch' },
        ],
      },
      { id: 'usage', title: 'Einsatzbereiche', description: 'Wo wird Übersetzung benötigt?', icon: Globe,
        fields: [
          { key: 'use_case', label: 'Hauptanwendungsfall', type: 'select', options: [
            { value: 'counseling', label: 'Beratungsgespräche' },
            { value: 'documents', label: 'Dokumente & Formulare' },
            { value: 'events', label: 'Veranstaltungen & Workshops' },
            { value: 'all', label: 'Alles' },
          ]},
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'inclusion', label: 'Inklusion fördern' },
            { value: 'efficiency', label: 'Effizienz steigern' },
            { value: 'cost', label: 'Dolmetscher-Kosten senken' },
            { value: 'quality', label: 'Kommunikationsqualität verbessern' },
          ]},
        ],
      },
      { id: 'ready', title: 'Bereit!', description: 'Dein NGO-Cockpit ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  agency: {
    segment: 'agency', label: 'Agentur & Developer', emoji: '💻',
    gradient: 'from-violet-600 via-indigo-700 to-blue-800',
    headline: 'Build on fintutto',
    subline: 'Full API, SDKs, White-Label. Baue die Zukunft der Kommunikation.',
    appUrl: 'https://developer.fintutto.world',
    steps: [
      { id: 'company', title: 'Dein Unternehmen', description: 'Erzähl uns von deiner Agentur.', icon: Building2,
        fields: [
          { key: 'company_name', label: 'Name der Agentur / des Unternehmens', type: 'text', placeholder: 'z.B. Digital Agency GmbH', required: true },
          { key: 'type', label: 'Art des Unternehmens', type: 'select', options: [
            { value: 'agency', label: 'Digitalagentur' }, { value: 'dev', label: 'Software-Entwicklung' },
            { value: 'consulting', label: 'Beratung' }, { value: 'startup', label: 'Startup' },
            { value: 'freelancer', label: 'Freelancer' },
          ]},
          { key: 'website', label: 'Website', type: 'url', placeholder: 'https://…' },
        ],
      },
      { id: 'clients', title: 'Deine Kunden', description: 'Für wen baust du?', icon: Users,
        fields: [
          { key: 'client_industries', label: 'Branchen deiner Kunden', type: 'text', placeholder: 'z.B. Museen, Hotels, Behörden' },
          { key: 'client_count', label: 'Anzahl aktiver Kunden', type: 'number', placeholder: '10' },
        ],
      },
      { id: 'tech', title: 'Technologie', description: 'Wie möchtest du integrieren?', icon: Globe,
        fields: [
          { key: 'integration_type', label: 'Integrations-Typ', type: 'select', options: [
            { value: 'api', label: 'REST API' }, { value: 'sdk', label: 'JavaScript SDK' },
            { value: 'white_label', label: 'White-Label' }, { value: 'reseller', label: 'Reseller' },
          ]},
          { key: 'tech_stack', label: 'Tech-Stack', type: 'text', placeholder: 'z.B. React, Vue, WordPress' },
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was möchtest du erreichen?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'new_product', label: 'Neues Produkt entwickeln' },
            { value: 'client_solution', label: 'Kundenlösung bauen' },
            { value: 'white_label', label: 'White-Label-Produkt' },
            { value: 'resell', label: 'fintutto weiterverkaufen' },
          ]},
        ],
      },
      { id: 'ready', title: 'Let\'s build!', description: 'Dein Developer-Zugang ist eingerichtet.', icon: Sparkles, fields: [] },
    ],
  },

  personal: {
    segment: 'personal', label: 'Privat & Freelancer', emoji: '👤',
    gradient: 'from-slate-600 via-gray-700 to-zinc-800',
    headline: 'Willkommen bei fintutto',
    subline: 'Dein persönlicher Übersetzer. Immer dabei.',
    appUrl: 'https://fintutto.world',
    steps: [
      { id: 'profile', title: 'Dein Profil', description: 'Erzähl uns ein bisschen über dich.', icon: Building2,
        fields: [
          { key: 'name', label: 'Dein Name', type: 'text', placeholder: 'Vollständiger Name', required: true },
          { key: 'use_case', label: 'Wie möchtest du fintutto nutzen?', type: 'select', options: [
            { value: 'travel', label: 'Reisen' }, { value: 'work', label: 'Beruf & Meetings' },
            { value: 'guide', label: 'Als Stadtführer / Guide' }, { value: 'personal', label: 'Privat' },
          ]},
        ],
      },
      { id: 'languages', title: 'Deine Sprachen', description: 'Welche Sprachen brauchst du?', icon: Globe,
        fields: [
          { key: 'native_language', label: 'Deine Muttersprache', type: 'text', placeholder: 'z.B. Deutsch' },
          { key: 'target_languages', label: 'Sprachen die du brauchst', type: 'text', placeholder: 'z.B. Englisch, Spanisch, Japanisch' },
        ],
      },
      { id: 'goals', title: 'Deine Ziele', description: 'Was ist dir am wichtigsten?', icon: Zap,
        fields: [
          { key: 'primary_goal', label: 'Hauptziel', type: 'select', options: [
            { value: 'travel', label: 'Reisen ohne Sprachbarrieren' },
            { value: 'work', label: 'Professionelle Kommunikation' },
            { value: 'learn', label: 'Sprachen lernen' },
            { value: 'connect', label: 'Menschen verbinden' },
          ]},
        ],
      },
      { id: 'ready', title: 'Willkommen!', description: 'Dein persönliches Cockpit ist bereit.', icon: Sparkles, fields: [] },
    ],
  },
}

// Fallback für fehlende Segmente
const DEFAULT_CONFIG = WIZARD_CONFIGS.personal

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  segment: Segment
  userId: string
  onComplete: () => void
}

export default function OnboardingWizard({ segment, userId, onComplete }: OnboardingWizardProps) {
  const config = WIZARD_CONFIGS[segment] || DEFAULT_CONFIG
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [animating, setAnimating] = useState(false)

  const currentStep = config.steps[step]
  const isLastStep = step === config.steps.length - 1
  const isReadyStep = currentStep?.id === 'ready'
  const progress = ((step) / (config.steps.length - 1)) * 100

  function updateField(key: string, value: string) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  async function handleNext() {
    if (isReadyStep) {
      await completeOnboarding()
      return
    }
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s + 1)
      setAnimating(false)
    }, 200)
  }

  function handleBack() {
    if (step === 0) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s - 1)
      setAnimating(false)
    }, 200)
  }

  async function completeOnboarding() {
    setSaving(true)
    try {
      // UAR-Identity aktualisieren
      await supabase
        .from('fw_uar_identities')
        .update({
          onboarding_completed: true,
          segment,
          meta: formData,
          ...(formData.institution_name || formData.company_name || formData.hotel_name || formData.restaurant_name || formData.org_name || formData.park_name
            ? { company: formData.institution_name || formData.company_name || formData.hotel_name || formData.restaurant_name || formData.org_name || formData.park_name }
            : {}),
          ...(formData.name ? { name: formData.name } : {}),
        })
        .eq('user_id', userId)

      // Onboarding-Event loggen
      await supabase.from('fw_uar_events').insert({
        identity_id: userId,
        event_type: 'onboarding_completed',
        event_data: { segment, ...formData },
        source_app: 'ams',
      })

      onComplete()
    } finally {
      setSaving(false)
    }
  }

  if (!currentStep) return null

  const StepIcon = currentStep.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Mesh-Gradient-Hintergrund */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050510]" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, #6B21A8 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 10%, #1E40AF 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 50% 80%, #0E7490 0%, transparent 60%),
              radial-gradient(ellipse 50% 70% at 90% 70%, #7C3AED 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Wizard-Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-white/60 text-sm">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            fintutto.world
          </div>
        </div>

        {/* Karte */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">

          {/* Fortschrittsbalken */}
          <div className="h-1 bg-white/10">
            <div
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Schritt-Indikatoren */}
          <div className="flex items-center justify-center gap-2 pt-6 px-6">
            {config.steps.map((s, i) => (
              <div
                key={s.id}
                className={`transition-all duration-300 rounded-full ${
                  i < step ? `w-6 h-2 bg-gradient-to-r ${config.gradient}` :
                  i === step ? 'w-8 h-2 bg-white' :
                  'w-2 h-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Inhalt */}
          <div
            className={`p-8 transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          >
            {/* Schritt-Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} mb-4 text-2xl`}>
                {isReadyStep ? config.emoji : <StepIcon className="w-7 h-7 text-white" />}
              </div>

              {step === 0 && (
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium mb-3">
                    {config.emoji} {config.label}
                  </span>
                  <h1 className="text-2xl font-bold text-white mb-1">{config.headline}</h1>
                  <p className="text-white/50 text-sm">{config.subline}</p>
                </div>
              )}

              {step > 0 && (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">{currentStep.title}</h2>
                  <p className="text-white/50 text-sm">{currentStep.description}</p>
                </>
              )}
            </div>

            {/* Felder */}
            {!isReadyStep && currentStep.fields.length > 0 && (
              <div className="space-y-4">
                {currentStep.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-sky-400 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.key] || ''}
                        onChange={e => updateField(field.key, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Bitte wählen…</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={e => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-colors"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ready-Schritt */}
            {isReadyStep && (
              <div className="text-center space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Check, label: 'Profil eingerichtet' },
                    { icon: Zap, label: 'Workflows aktiv' },
                    { icon: Globe, label: 'Tracking live' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-xs text-white/60">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-white/50">
                  Dein Cockpit ist eingerichtet. Du kannst jetzt loslegen.
                </p>
                {config.appUrl && (
                  <a
                    href={config.appUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Zur App wechseln <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 pb-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-0 disabled:cursor-not-allowed text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </button>

            <div className="text-xs text-white/30">
              {step + 1} / {config.steps.length}
            </div>

            <button
              onClick={handleNext}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg`}
            >
              {saving ? (
                'Speichern…'
              ) : isReadyStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Jetzt loslegen
                </>
              ) : (
                <>
                  Weiter
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip-Link */}
        {!isReadyStep && (
          <div className="text-center mt-4">
            <button
              onClick={completeOnboarding}
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Überspringen und direkt starten →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
