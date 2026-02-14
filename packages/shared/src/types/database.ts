// Auto-generated types matching Supabase migrations 004-008
// Shared across ALL Fintutto apps

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
      // === Migration 004: Core Tables ===
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          phone: string | null
          street: string | null
          postal_code: string | null
          city: string | null
          country: string
          role: 'vermieter' | 'mieter' | 'hausmeister' | 'admin'
          subscription_tier: string
          subscription_status: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          phone?: string | null
          street?: string | null
          postal_code?: string | null
          city?: string | null
          country?: string
          role?: 'vermieter' | 'mieter' | 'hausmeister' | 'admin'
          subscription_tier?: string
          subscription_status?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          street: string
          house_number: string
          postal_code: string
          city: string
          country: string
          property_type: 'apartment_building' | 'single_family' | 'commercial' | 'mixed'
          year_built: number | null
          living_space: number | null
          land_area: number | null
          number_of_units: number
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
          image_urls: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          street: string
          house_number: string
          postal_code: string
          city: string
          country?: string
          property_type?: 'apartment_building' | 'single_family' | 'commercial' | 'mixed'
          year_built?: number | null
          living_space?: number | null
          land_area?: number | null
          number_of_units?: number
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          image_urls?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      units: {
        Row: {
          id: string
          property_id: string
          name: string
          floor: number | null
          rooms: number | null
          living_space: number
          unit_type: 'apartment' | 'commercial' | 'parking' | 'storage' | 'other'
          is_rented: boolean
          current_rent: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          name: string
          floor?: number | null
          rooms?: number | null
          living_space: number
          unit_type?: 'apartment' | 'commercial' | 'parking' | 'storage' | 'other'
          is_rented?: boolean
          current_rent?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['units']['Insert']>
      }
      tenants: {
        Row: {
          id: string
          user_id: string | null
          unit_id: string | null
          landlord_id: string
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          unit_id?: string | null
          landlord_id: string
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
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      rental_contracts: {
        Row: {
          id: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date: string | null
          base_rent: number
          utility_advance: number
          total_rent: number
          payment_day: number
          contract_type: 'unlimited' | 'limited' | 'sublease'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          tenant_id: string
          start_date: string
          end_date?: string | null
          base_rent: number
          utility_advance?: number
          total_rent: number
          payment_day?: number
          contract_type?: 'unlimited' | 'limited' | 'sublease'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['rental_contracts']['Insert']>
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          tenant_id: string
          amount: number
          due_date: string
          paid_date: string | null
          payment_type: 'rent' | 'deposit' | 'utility' | 'other'
          status: 'pending' | 'paid' | 'overdue' | 'partial'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          tenant_id: string
          amount: number
          due_date: string
          paid_date?: string | null
          payment_type?: 'rent' | 'deposit' | 'utility' | 'other'
          status?: 'pending' | 'paid' | 'overdue' | 'partial'
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      documents: {
        Row: {
          id: string
          user_id: string
          property_id: string | null
          unit_id: string | null
          tenant_id: string | null
          name: string
          file_path: string
          file_type: string
          file_size: number
          category: 'contract' | 'invoice' | 'protocol' | 'notice' | 'certificate' | 'tax' | 'insurance' | 'other'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id?: string | null
          unit_id?: string | null
          tenant_id?: string | null
          name: string
          file_path: string
          file_type: string
          file_size?: number
          category?: 'contract' | 'invoice' | 'protocol' | 'notice' | 'certificate' | 'tax' | 'insurance' | 'other'
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }

      // === Migration 005: Meters & Maintenance ===
      meters: {
        Row: {
          id: string
          unit_id: string
          meter_number: string
          meter_type: 'electricity' | 'gas' | 'water_cold' | 'water_hot' | 'heating' | 'other'
          location: string | null
          installation_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          meter_number: string
          meter_type: 'electricity' | 'gas' | 'water_cold' | 'water_hot' | 'heating' | 'other'
          location?: string | null
          installation_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['meters']['Insert']>
      }
      meter_readings: {
        Row: {
          id: string
          meter_id: string
          reading_value: number
          reading_date: string
          read_by: string | null
          image_url: string | null
          source: 'manual' | 'ocr' | 'import' | 'smart_meter'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          meter_id: string
          reading_value: number
          reading_date: string
          read_by?: string | null
          image_url?: string | null
          source?: 'manual' | 'ocr' | 'import' | 'smart_meter'
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['meter_readings']['Insert']>
      }
      maintenance_requests: {
        Row: {
          id: string
          property_id: string
          unit_id: string | null
          reported_by: string
          assigned_to: string | null
          title: string
          description: string | null
          category: 'plumbing' | 'electrical' | 'heating' | 'structural' | 'appliance' | 'pest' | 'cleaning' | 'other'
          priority: 'low' | 'normal' | 'high' | 'emergency'
          status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
          image_urls: string[] | null
          resolved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_id?: string | null
          reported_by: string
          assigned_to?: string | null
          title: string
          description?: string | null
          category?: 'plumbing' | 'electrical' | 'heating' | 'structural' | 'appliance' | 'pest' | 'cleaning' | 'other'
          priority?: 'low' | 'normal' | 'high' | 'emergency'
          status?: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
          image_urls?: string[] | null
          resolved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['maintenance_requests']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          property_id: string
          maintenance_request_id: string | null
          created_by: string
          assigned_to: string | null
          title: string
          description: string | null
          due_date: string | null
          priority: 'low' | 'normal' | 'high' | 'urgent'
          status: 'todo' | 'in_progress' | 'done' | 'cancelled'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          maintenance_request_id?: string | null
          created_by: string
          assigned_to?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          status?: 'todo' | 'in_progress' | 'done' | 'cancelled'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }

      // === Migration 006: BescheidBoxer ===
      tax_notices: {
        Row: {
          id: string
          user_id: string
          property_id: string | null
          notice_type: 'grundsteuer' | 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'erbschaftsteuer' | 'schenkungsteuer' | 'grunderwerbsteuer' | 'other'
          tax_year: number
          received_date: string
          deadline_date: string | null
          amount_assessed: number | null
          amount_expected: number | null
          deviation_amount: number | null
          status: 'received' | 'checking' | 'accepted' | 'objection_filed' | 'resolved'
          objection_deadline: string | null
          ai_analysis: Json | null
          document_ids: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id?: string | null
          notice_type: 'grundsteuer' | 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'erbschaftsteuer' | 'schenkungsteuer' | 'grunderwerbsteuer' | 'other'
          tax_year: number
          received_date: string
          deadline_date?: string | null
          amount_assessed?: number | null
          amount_expected?: number | null
          deviation_amount?: number | null
          status?: 'received' | 'checking' | 'accepted' | 'objection_filed' | 'resolved'
          objection_deadline?: string | null
          ai_analysis?: Json | null
          document_ids?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['tax_notices']['Insert']>
      }
      tax_notice_checks: {
        Row: {
          id: string
          tax_notice_id: string
          check_type: string
          input_data: Json
          result_data: Json
          recommendation: string | null
          has_issues: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tax_notice_id: string
          check_type: string
          input_data: Json
          result_data: Json
          recommendation?: string | null
          has_issues?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['tax_notice_checks']['Insert']>
      }

      // === Existing tables (schema.sql + migrations 002-003) ===
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          tier: 'free' | 'basic' | 'premium' | 'professional'
          checks_used: number
          checks_limit: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          tier?: 'free' | 'basic' | 'premium' | 'professional'
          checks_used?: number
          checks_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      checker_sessions: {
        Row: {
          id: string
          user_id: string | null
          checker_type: string
          session_data: Json
          result: Json | null
          status: 'in_progress' | 'completed' | 'expired'
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          checker_type: string
          session_data?: Json
          result?: Json | null
          status?: 'in_progress' | 'completed' | 'expired'
          created_at?: string
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['checker_sessions']['Insert']>
      }
      checker_results: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          checker_type: string
          input_data: Json
          result_data: Json
          recommendation: string
          form_redirect_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          checker_type: string
          input_data: Json
          result_data: Json
          recommendation: string
          form_redirect_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['checker_results']['Insert']>
      }
      ai_advice_cache: {
        Row: {
          id: string
          field_key: string
          checker_type: string
          context_hash: string
          advice: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          field_key: string
          checker_type: string
          context_hash: string
          advice: string
          created_at?: string
          expires_at: string
        }
        Update: Partial<Database['public']['Tables']['ai_advice_cache']['Insert']>
      }
      referral_codes: {
        Row: {
          id: string
          user_id: string
          code: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['referral_codes']['Insert']>
      }
      referrals: {
        Row: {
          id: string
          referrer_user_id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          app_id: string
          status: 'pending' | 'signed_up' | 'subscribed'
          created_at: string
          signed_up_at: string | null
          subscribed_at: string | null
        }
        Insert: {
          id?: string
          referrer_user_id: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          app_id: string
          status?: 'pending' | 'signed_up' | 'subscribed'
          created_at?: string
          signed_up_at?: string | null
          subscribed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['referrals']['Insert']>
      }
      referral_rewards: {
        Row: {
          id: string
          user_id: string
          referral_id: string
          reward_type: 'credits' | 'discount' | 'free_month'
          reward_value: number
          description: string
          is_claimed: boolean
          created_at: string
          claimed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          referral_id: string
          reward_type: 'credits' | 'discount' | 'free_month'
          reward_value: number
          description: string
          is_claimed?: boolean
          created_at?: string
          claimed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['referral_rewards']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      link_tenant_account: {
        Args: { p_tenant_email: string }
        Returns: void
      }
      process_referral_signup: {
        Args: { p_referral_code: string; p_referred_user_id: string; p_app_id: string }
        Returns: string | null
      }
    }
    Enums: {
      user_tier: 'free' | 'basic' | 'premium' | 'professional'
      checker_status: 'in_progress' | 'completed' | 'expired'
    }
  }
}

// Convenience type aliases
export type Tables = Database['public']['Tables']
export type Property = Tables['properties']['Row']
export type PropertyInsert = Tables['properties']['Insert']
export type Unit = Tables['units']['Row']
export type UnitInsert = Tables['units']['Insert']
export type Tenant = Tables['tenants']['Row']
export type TenantInsert = Tables['tenants']['Insert']
export type RentalContract = Tables['rental_contracts']['Row']
export type Payment = Tables['payments']['Row']
export type Document = Tables['documents']['Row']
export type Meter = Tables['meters']['Row']
export type MeterReading = Tables['meter_readings']['Row']
export type MaintenanceRequest = Tables['maintenance_requests']['Row']
export type Task = Tables['tasks']['Row']
export type TaxNotice = Tables['tax_notices']['Row']
export type TaxNoticeCheck = Tables['tax_notice_checks']['Row']
export type Profile = Tables['profiles']['Row']
export type UserRow = Tables['users']['Row']

// Nested query result types (for Supabase joins)
export type PropertyWithUnits = Property & {
  units: (Unit & {
    tenants: Tenant[]
    meters: Meter[]
  })[]
}

export type UnitWithDetails = Unit & {
  property: Property
  tenants: Tenant[]
  meters: Meter[]
  rental_contracts: RentalContract[]
}

export type TenantWithUnit = Tenant & {
  unit: Unit & {
    property: Property
  }
  rental_contracts: RentalContract[]
}
