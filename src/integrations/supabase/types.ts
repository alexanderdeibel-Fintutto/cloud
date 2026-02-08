export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          app_id: string
          app_url: string | null
          name: string
          description: string | null
          price_cents: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          features: Json | null
          icon_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_id: string
          app_url?: string | null
          name: string
          description?: string | null
          price_cents: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          features?: Json | null
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          app_url?: string | null
          name?: string
          description?: string | null
          price_cents?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          features?: Json | null
          icon_url?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      bundles: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          stripe_price_id: string | null
          product_ids: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_cents: number
          stripe_price_id?: string | null
          product_ids: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price_cents?: number
          stripe_price_id?: string | null
          product_ids?: string[]
          is_active?: boolean
        }
      }
      user_purchases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          stripe_payment_id: string | null
          purchased_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          stripe_payment_id?: string | null
          purchased_at?: string
          expires_at?: string | null
        }
        Update: {
          user_id?: string
          product_id?: string
          stripe_payment_id?: string | null
          expires_at?: string | null
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          stripe_subscription_id?: string
          stripe_customer_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          updated_at?: string
        }
      }
      ai_system_prompts: {
        Row: {
          id: string
          app_id: string
          action: string
          system_prompt: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          action: string
          system_prompt: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          app_id?: string
          action?: string
          system_prompt?: string
          is_active?: boolean
        }
      }
      ai_usage_log: {
        Row: {
          id: string
          user_id: string | null
          app_id: string
          action: string
          tokens_used: number
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          app_id: string
          action: string
          tokens_used: number
          model: string
          created_at?: string
        }
        Update: {
          user_id?: string | null
          app_id?: string
          action?: string
          tokens_used?: number
          model?: string
        }
      }
      ai_knowledge: {
        Row: {
          id: string
          app_id: string
          category: string
          title: string
          content: string
          metadata: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          app_id: string
          category: string
          title: string
          content: string
          metadata?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          app_id?: string
          category?: string
          title?: string
          content?: string
          metadata?: Json | null
          is_active?: boolean
        }
      }
    }
    Functions: {
      check_user_access: {
        Args: { p_user_id: string; p_product_id: string }
        Returns: boolean
      }
    }
  }
}
