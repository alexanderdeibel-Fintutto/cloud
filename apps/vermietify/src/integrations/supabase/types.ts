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
      properties: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          street: string
          house_number: string
          postal_code: string
          city: string
          country: string
          property_type: string
          year_built: number | null
          living_space: number | null
          land_area: number | null
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          street: string
          house_number: string
          postal_code: string
          city: string
          country?: string
          property_type: string
          year_built?: number | null
          living_space?: number | null
          land_area?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          street?: string
          house_number?: string
          postal_code?: string
          city?: string
          country?: string
          property_type?: string
          year_built?: number | null
          living_space?: number | null
          land_area?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
        }
      }
      units: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          property_id: string
          name: string
          floor: number | null
          rooms: number | null
          living_space: number
          unit_type: string
          is_rented: boolean
          current_rent: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id: string
          name: string
          floor?: number | null
          rooms?: number | null
          living_space: number
          unit_type: string
          is_rented?: boolean
          current_rent?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          property_id?: string
          name?: string
          floor?: number | null
          rooms?: number | null
          living_space?: number
          unit_type?: string
          is_rented?: boolean
          current_rent?: number | null
          notes?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          unit_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          move_in_date: string
          move_out_date: string | null
          deposit_amount: number | null
          deposit_paid: boolean
          is_active: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          unit_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          move_in_date: string
          move_out_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          unit_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          move_in_date?: string
          move_out_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean
          is_active?: boolean
          notes?: string | null
        }
      }
      rental_contracts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string | null
          base_rent: number
          utility_advance: number
          total_rent: number
          payment_day: number
          contract_type: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date?: string | null
          base_rent: number
          utility_advance: number
          total_rent: number
          payment_day?: number
          contract_type: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          unit_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string | null
          base_rent?: number
          utility_advance?: number
          total_rent?: number
          payment_day?: number
          contract_type?: string
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          contract_id: string
          tenant_id: string
          amount: number
          due_date: string
          paid_date: string | null
          payment_type: string
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          contract_id: string
          tenant_id: string
          amount: number
          due_date: string
          paid_date?: string | null
          payment_type: string
          status?: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contract_id?: string
          tenant_id?: string
          amount?: number
          due_date?: string
          paid_date?: string | null
          payment_type?: string
          status?: string
          notes?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          user_id: string
          property_id: string | null
          unit_id: string | null
          tenant_id: string | null
          name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          property_id?: string | null
          unit_id?: string | null
          tenant_id?: string | null
          name: string
          file_path: string
          file_type: string
          file_size: number
          category: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          property_id?: string | null
          unit_id?: string | null
          tenant_id?: string | null
          name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          category?: string
          notes?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          phone: string | null
          street: string | null
          postal_code: string | null
          city: string | null
          country: string
          subscription_tier: string
          subscription_status: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          phone?: string | null
          street?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string
          subscription_tier?: string
          subscription_status?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          phone?: string | null
          street?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string
          subscription_tier?: string
          subscription_status?: string
        }
      }
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
