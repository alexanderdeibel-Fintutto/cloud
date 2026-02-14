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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          tier: 'free' | 'basic' | 'premium' | 'professional'
          checks_used: number
          checks_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          tier?: 'free' | 'basic' | 'premium' | 'professional'
          checks_used?: number
          checks_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          tier?: 'free' | 'basic' | 'premium' | 'professional'
          checks_used?: number
          checks_limit?: number
          created_at?: string
          updated_at?: string
        }
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
        Update: {
          id?: string
          user_id?: string | null
          checker_type?: string
          session_data?: Json
          result?: Json | null
          status?: 'in_progress' | 'completed' | 'expired'
          created_at?: string
          completed_at?: string | null
        }
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
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          checker_type?: string
          input_data?: Json
          result_data?: Json
          recommendation?: string
          form_redirect_url?: string | null
          created_at?: string
        }
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
          expires_at?: string
        }
        Update: {
          id?: string
          field_key?: string
          checker_type?: string
          context_hash?: string
          advice?: string
          created_at?: string
          expires_at?: string
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
      user_tier: 'free' | 'basic' | 'premium' | 'professional'
      checker_status: 'in_progress' | 'completed' | 'expired'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
