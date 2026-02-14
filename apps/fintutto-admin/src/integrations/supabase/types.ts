export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      domains: {
        Row: {
          id: string
          url: string
          label: string
          description: string | null
          category: string
          repo_name: string | null
          deploy_url: string | null
          health: Database['public']['Enums']['domain_health']
          last_check_at: string | null
          http_code: number | null
          response_time_ms: number | null
          has_ssl: boolean
          ssl_expires_at: string | null
          page_title: string | null
          meta_description: string | null
          has_ga: boolean
          has_gtm: boolean
          has_impressum: boolean
          has_datenschutz: boolean
          total_pages: number
          pages_online: number
          pages_offline: number
          pages_checked: number
          pages_fertig: number
          setup_complete: boolean
          notes: string | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          label: string
          description?: string | null
          category?: string
          repo_name?: string | null
          deploy_url?: string | null
          health?: Database['public']['Enums']['domain_health']
          last_check_at?: string | null
          http_code?: number | null
          response_time_ms?: number | null
          has_ssl?: boolean
          ssl_expires_at?: string | null
          page_title?: string | null
          meta_description?: string | null
          has_ga?: boolean
          has_gtm?: boolean
          has_impressum?: boolean
          has_datenschutz?: boolean
          total_pages?: number
          pages_online?: number
          pages_offline?: number
          pages_checked?: number
          pages_fertig?: number
          setup_complete?: boolean
          notes?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          label?: string
          description?: string | null
          category?: string
          repo_name?: string | null
          deploy_url?: string | null
          health?: Database['public']['Enums']['domain_health']
          last_check_at?: string | null
          http_code?: number | null
          response_time_ms?: number | null
          has_ssl?: boolean
          ssl_expires_at?: string | null
          page_title?: string | null
          meta_description?: string | null
          has_ga?: boolean
          has_gtm?: boolean
          has_impressum?: boolean
          has_datenschutz?: boolean
          total_pages?: number
          pages_online?: number
          pages_offline?: number
          pages_checked?: number
          pages_fertig?: number
          setup_complete?: boolean
          notes?: string | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          domain_id: string
          url: string
          path: string
          status: Database['public']['Enums']['check_status']
          http_code: number | null
          redirect_url: string | null
          response_time_ms: number | null
          last_check_at: string | null
          page_title: string | null
          meta_description: string | null
          h1: string | null
          has_canonical: boolean
          has_og_tags: boolean
          word_count: number
          workflow: Database['public']['Enums']['page_workflow']
          checked_links: boolean
          checked_seo: boolean
          checked_content: boolean
          checked_design: boolean
          checked_mobile: boolean
          checked_legal: boolean
          internal_links_count: number
          external_links_count: number
          broken_links_count: number
          notes: string | null
          depth: number
          discovered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          domain_id: string
          url: string
          path: string
          status?: Database['public']['Enums']['check_status']
          http_code?: number | null
          redirect_url?: string | null
          response_time_ms?: number | null
          last_check_at?: string | null
          page_title?: string | null
          meta_description?: string | null
          h1?: string | null
          has_canonical?: boolean
          has_og_tags?: boolean
          word_count?: number
          workflow?: Database['public']['Enums']['page_workflow']
          checked_links?: boolean
          checked_seo?: boolean
          checked_content?: boolean
          checked_design?: boolean
          checked_mobile?: boolean
          checked_legal?: boolean
          internal_links_count?: number
          external_links_count?: number
          broken_links_count?: number
          notes?: string | null
          depth?: number
          discovered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          domain_id?: string
          url?: string
          path?: string
          status?: Database['public']['Enums']['check_status']
          http_code?: number | null
          redirect_url?: string | null
          response_time_ms?: number | null
          last_check_at?: string | null
          page_title?: string | null
          meta_description?: string | null
          h1?: string | null
          has_canonical?: boolean
          has_og_tags?: boolean
          word_count?: number
          workflow?: Database['public']['Enums']['page_workflow']
          checked_links?: boolean
          checked_seo?: boolean
          checked_content?: boolean
          checked_design?: boolean
          checked_mobile?: boolean
          checked_legal?: boolean
          internal_links_count?: number
          external_links_count?: number
          broken_links_count?: number
          notes?: string | null
          depth?: number
          discovered_at?: string
          updated_at?: string
        }
      }
      page_links: {
        Row: {
          id: string
          page_id: string
          domain_id: string
          url: string
          anchor_text: string | null
          link_type: string
          status: Database['public']['Enums']['check_status']
          http_code: number | null
          redirect_url: string | null
          last_check_at: string | null
          is_checked: boolean
          is_approved: boolean
          needs_fix: boolean
          fix_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          domain_id: string
          url: string
          anchor_text?: string | null
          link_type?: string
          status?: Database['public']['Enums']['check_status']
          http_code?: number | null
          redirect_url?: string | null
          last_check_at?: string | null
          is_checked?: boolean
          is_approved?: boolean
          needs_fix?: boolean
          fix_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          domain_id?: string
          url?: string
          anchor_text?: string | null
          link_type?: string
          status?: Database['public']['Enums']['check_status']
          http_code?: number | null
          redirect_url?: string | null
          last_check_at?: string | null
          is_checked?: boolean
          is_approved?: boolean
          needs_fix?: boolean
          fix_note?: string | null
          created_at?: string
        }
      }
      check_history: {
        Row: {
          id: string
          domain_id: string | null
          page_id: string | null
          link_id: string | null
          check_type: string
          status: Database['public']['Enums']['check_status']
          http_code: number | null
          response_time_ms: number | null
          error_message: string | null
          checked_at: string
        }
        Insert: {
          id?: string
          domain_id?: string | null
          page_id?: string | null
          link_id?: string | null
          check_type: string
          status: Database['public']['Enums']['check_status']
          http_code?: number | null
          response_time_ms?: number | null
          error_message?: string | null
          checked_at?: string
        }
        Update: {
          id?: string
          domain_id?: string | null
          page_id?: string | null
          link_id?: string | null
          check_type?: string
          status?: Database['public']['Enums']['check_status']
          http_code?: number | null
          response_time_ms?: number | null
          error_message?: string | null
          checked_at?: string
        }
      }
      crawl_jobs: {
        Row: {
          id: string
          domain_id: string
          status: string
          max_depth: number
          pages_found: number
          links_found: number
          pages_checked: number
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          domain_id: string
          status?: string
          max_depth?: number
          pages_found?: number
          links_found?: number
          pages_checked?: number
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          domain_id?: string
          status?: string
          max_depth?: number
          pages_found?: number
          links_found?: number
          pages_checked?: number
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      domain_health: 'healthy' | 'warning' | 'critical' | 'unknown'
      check_status: 'online' | 'offline' | 'redirect' | 'error' | 'pending'
      page_workflow: 'nicht_begonnen' | 'in_bearbeitung' | 'geprueft' | 'fertig'
    }
  }
}
