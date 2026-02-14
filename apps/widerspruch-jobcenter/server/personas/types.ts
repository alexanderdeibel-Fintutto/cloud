// ══════════════════════════════════════════════════════════════
// Persona-Typsystem – Vollständige Interfaces
// ══════════════════════════════════════════════════════════════

export type Gender = 'w' | 'm' | 'd'

export type Situation =
  | 'alleinerziehend'
  | 'single'
  | 'paar_ohne_kinder'
  | 'paar_mit_kindern'
  | 'senior'
  | 'geflüchtet'
  | 'langzeitbezieher'
  | 'neubezieher'
  | 'aufstocker'
  | 'student'
  | 'behinderung'
  | 'trennung'

export type Ton =
  | 'emotional_aber_sachlich'
  | 'warmherzig'
  | 'unsicher'
  | 'kämpferisch'
  | 'verunsichert'
  | 'präzise_juristisch'
  | 'frustriert_sarkastisch'
  | 'positiv_lösungsorientiert'
  | 'höflich_altmodisch'
  | 'direkt_stark'
  | 'professionell'
  | 'abgeklärt_ironisch'
  | 'pragmatisch'
  | 'dankbar_unsicher'

export type Schreibstil =
  | 'umgangssprache_stark'    // alles klein, abkürzungen, tippfehler
  | 'umgangssprache_mittel'   // locker aber lesbar
  | 'umgangssprache_leicht'   // normal mit gelegentlichen fehlern
  | 'hochdeutsch'             // korrekt, förmlich
  | 'juristisch'              // paragraphen, fachsprache
  | 'gebrochen_deutsch'       // sprachbarriere

export type PostingFrequency =
  | 'taeglich'                // 5-7x/Woche
  | '3_4_pro_woche'           // 3-4x
  | '2_3_pro_woche'           // 2-3x
  | '1_2_pro_woche'           // 1-2x
  | 'gelegentlich'            // 2-4x/Monat
  | 'selten'                  // 1x/Monat oder weniger

export type TimeProfile =
  | 'fruehaufsteher'          // 6-10, 12-14
  | 'berufstaetig'            // 7-8, 12-13, 18-23
  | 'nachtaktiv'              // 14-02
  | 'ganztags'                // 8-23 verteilt

export type EngagementStyle =
  | 'schreiber'               // erstellt viele eigene posts
  | 'kommentierer'            // antwortet vor allem auf andere
  | 'liker'                   // liked viel, schreibt wenig
  | 'lurker_gelegentlich'     // liest viel, schreibt selten
  | 'mixed'                   // gleichmäßig verteilt

export type ForumId =
  | 'hilfe-bescheid'
  | 'widerspruch'
  | 'sanktionen'
  | 'kdu-miete'
  | 'zuverdienst'
  | 'erfolge'
  | 'auskotzen'
  | 'allgemeines'

export type ContentTag =
  | 'bescheid' | 'berechnung' | 'fehler' | 'mehrbedarf'
  | 'regelsatz' | 'widerspruch' | 'klage' | 'sozialgericht'
  | 'sanktion' | 'termin' | 'egv' | 'massnahme'
  | 'kdu' | 'miete' | 'heizkosten' | 'umzug'
  | 'minijob' | 'einkommen' | 'freibetrag' | 'anrechnung'
  | 'bedarfsgemeinschaft' | 'trennung' | 'kinder'
  | 'alleinerziehend' | 'schwerbehinderung'
  | 'erfolg' | 'nachzahlung' | 'gewonnen'
  | 'frust' | 'sachbearbeiter' | 'wartezeit' | 'buergergeld'

export interface PersonaProfile {
  alter: number
  geschlecht: Gender
  situation: Situation
  kinder?: number
  kinder_alter?: number[]
  stadt_typ: string
  bundesland: string
  seit_buergergeld: string              // z.B. "2024-01"
  probleme: string[]
  erfahrung_widerspruch: boolean
  ton: Ton
  schreibstil: Schreibstil
  emoji_nutzung: 'nie' | 'selten' | 'gelegentlich' | 'häufig'
  tippfehler_rate: number               // 0.0 - 0.1
  gross_klein_fehler: boolean
  beispiel_saetze: string[]             // 3-5 typische Formulierungen
}

export interface PersonaActivity {
  posting_frequency: PostingFrequency
  time_profile: TimeProfile
  engagement_style: EngagementStyle
  active_forums: ForumId[]
  themen_schwerpunkte: ContentTag[]
  kommentar_laenge: 'kurz' | 'mittel' | 'lang' | 'mixed'
  bescheidboxer_affinity: number        // 0.0 - 1.0, wie oft sie BB erwähnen
}

export interface Persona {
  id: string                            // "p_001" bis "p_500"
  wp_user_id: number | null             // wird nach WP-Erstellung gesetzt
  username: string
  email: string
  display_name: string
  password: string
  bio: string
  avatar_color: string
  wave?: string                         // Generierungswelle, z.B. "gruender", "welle2"

  profile: PersonaProfile
  activity: PersonaActivity

  stats: {
    created_at: string
    last_action: string | null
    total_posts: number
    total_comments: number
    total_likes: number
    total_forum_topics: number
    total_forum_replies: number
  }
}

// ── Scheduled Action Types ──

export type ActionType =
  | 'blog_post'
  | 'blog_comment'
  | 'blog_comment_reply'
  | 'forum_topic'
  | 'forum_reply'
  | 'like'

export interface ScheduledAction {
  id: string
  persona_id: string
  action_type: ActionType
  scheduled_at: string                  // ISO timestamp
  executed_at: string | null
  status: 'pending' | 'executing' | 'done' | 'failed'
  target: {
    forum_id?: string
    post_id?: number
    topic_id?: number
    comment_id?: number                 // for reply-to-comment
    category_id?: number
  }
  content?: {
    title?: string
    body: string
    tags?: string[]
  }
  result?: {
    wp_id?: number
    error?: string
  }
}

// ── Activity Log ──

export interface ActivityLogEntry {
  timestamp: string
  persona_id: string
  action_type: ActionType
  wp_id?: number
  success: boolean
  details?: string
}

// ── WordPress API Types ──

export interface WPUser {
  id: number
  username: string
  name: string
  email: string
  roles: string[]
}

export interface WPPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  status: string
  author: number
  categories: number[]
  tags: number[]
  link: string
}

export interface WPComment {
  id: number
  post: number
  parent: number
  author: number
  author_name: string
  content: { rendered: string }
  status: string
}

export interface WPForumTopic {
  id: number
  title: string
  link: string
}

export interface WPForumReply {
  id: number
  topic_id: number
  link: string
}

// ── Config ──

export interface BotConfig {
  wp_base_url: string
  wp_rest_url: string
  wp_admin_user: string
  wp_admin_app_password: string
  forum_ids: Record<ForumId, number>
  category_ids: Record<string, number>
  bot_min_delay_minutes: number
  bot_max_delay_minutes: number
  bot_max_posts_per_day: number
  bot_max_comments_per_day: number
  bot_active_hours_start: number
  bot_active_hours_end: number
  bescheidboxer_mention_rate: number
}
