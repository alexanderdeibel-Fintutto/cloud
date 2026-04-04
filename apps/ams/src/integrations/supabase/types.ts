export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          action_category: string | null
          app_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_category?: string | null
          app_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_category?: string | null
          app_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_tracking: {
        Row: {
          browser: string | null
          city: string | null
          click_id: string
          cookie_expires_at: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          first_payment_amount: number | null
          first_payment_at: string | null
          first_payment_plan: string | null
          id: string
          ip_address: unknown
          is_active_customer: boolean | null
          landing_page: string | null
          os: string | null
          partner_id: string
          referral_code: string
          referrer_url: string | null
          registered_at: string | null
          registered_org_id: string | null
          registered_user_id: string | null
          session_id: string | null
          status: string | null
          total_commissions: number | null
          total_payments: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visited_at: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          click_id: string
          cookie_expires_at?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_payment_amount?: number | null
          first_payment_at?: string | null
          first_payment_plan?: string | null
          id?: string
          ip_address?: unknown
          is_active_customer?: boolean | null
          landing_page?: string | null
          os?: string | null
          partner_id: string
          referral_code: string
          referrer_url?: string | null
          registered_at?: string | null
          registered_org_id?: string | null
          registered_user_id?: string | null
          session_id?: string | null
          status?: string | null
          total_commissions?: number | null
          total_payments?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visited_at?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          click_id?: string
          cookie_expires_at?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_payment_amount?: number | null
          first_payment_at?: string | null
          first_payment_plan?: string | null
          id?: string
          ip_address?: unknown
          is_active_customer?: boolean | null
          landing_page?: string | null
          os?: string | null
          partner_id?: string
          referral_code?: string
          referrer_url?: string | null
          registered_at?: string | null
          registered_org_id?: string | null
          registered_user_id?: string | null
          session_id?: string | null
          status?: string | null
          total_commissions?: number | null
          total_payments?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_tracking_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_tracking_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "affiliate_tracking_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_tracking_registered_org_id_fkey"
            columns: ["registered_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_app_knowledge: {
        Row: {
          answer: string
          app_id: string
          applicable_tiers: string[] | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          knowledge_type: string
          priority: number | null
          question: string | null
          related_path: string | null
          related_paths: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          app_id: string
          applicable_tiers?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          knowledge_type: string
          priority?: number | null
          question?: string | null
          related_path?: string | null
          related_paths?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          app_id?: string
          applicable_tiers?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          knowledge_type?: string
          priority?: number | null
          question?: string | null
          related_path?: string | null
          related_paths?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_app_knowledge_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_app_knowledge_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          app_id: string | null
          context_data: Json | null
          conversation_type: string
          created_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          messages: Json | null
          org_id: string | null
          prompt_key: string | null
          status: string | null
          title: string | null
          total_tokens_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          context_data?: Json | null
          conversation_type: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          messages?: Json | null
          org_id?: string | null
          prompt_key?: string | null
          status?: string | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          context_data?: Json | null
          conversation_type?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          messages?: Json | null
          org_id?: string | null
          prompt_key?: string | null
          status?: string | null
          title?: string | null
          total_tokens_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_prompt_key_fkey"
            columns: ["prompt_key"]
            isOneToOne: false
            referencedRelation: "ai_system_prompts"
            referencedColumns: ["prompt_key"]
          },
          {
            foreignKeyName: "ai_conversations_prompt_key_fkey"
            columns: ["prompt_key"]
            isOneToOne: false
            referencedRelation: "v_ai_system_prompts"
            referencedColumns: ["prompt_key"]
          },
        ]
      }
      ai_cross_sell_triggers: {
        Row: {
          created_at: string | null
          from_app_id: string
          id: string
          is_active: boolean | null
          message_template: string
          priority: number | null
          to_app_id: string
          trigger_keywords: string[]
        }
        Insert: {
          created_at?: string | null
          from_app_id: string
          id?: string
          is_active?: boolean | null
          message_template: string
          priority?: number | null
          to_app_id: string
          trigger_keywords: string[]
        }
        Update: {
          created_at?: string | null
          from_app_id?: string
          id?: string
          is_active?: boolean | null
          message_template?: string
          priority?: number | null
          to_app_id?: string
          trigger_keywords?: string[]
        }
        Relationships: []
      }
      ai_feature_gates: {
        Row: {
          app_id: string | null
          available_free: boolean | null
          available_pro: boolean | null
          created_at: string | null
          feature_key: string
          feature_name: string | null
          free_limit: number | null
          free_limit_period: string | null
          id: string
          is_active: boolean | null
          upgrade_message: string | null
        }
        Insert: {
          app_id?: string | null
          available_free?: boolean | null
          available_pro?: boolean | null
          created_at?: string | null
          feature_key: string
          feature_name?: string | null
          free_limit?: number | null
          free_limit_period?: string | null
          id?: string
          is_active?: boolean | null
          upgrade_message?: string | null
        }
        Update: {
          app_id?: string | null
          available_free?: boolean | null
          available_pro?: boolean | null
          created_at?: string | null
          feature_key?: string
          feature_name?: string | null
          free_limit?: number | null
          free_limit_period?: string | null
          id?: string
          is_active?: boolean | null
          upgrade_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_feature_gates_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_feature_gates_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      ai_models_config: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          max_context_tokens: number | null
          max_output_tokens: number | null
          model_name: string
          price_cached_per_million: number | null
          price_input_per_million: number
          price_output_per_million: number
          provider: string
          quality_rating: number | null
          speed_rating: number | null
          supports_tools: boolean | null
          supports_vision: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_context_tokens?: number | null
          max_output_tokens?: number | null
          model_name: string
          price_cached_per_million?: number | null
          price_input_per_million: number
          price_output_per_million: number
          provider?: string
          quality_rating?: number | null
          speed_rating?: number | null
          supports_tools?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_context_tokens?: number | null
          max_output_tokens?: number | null
          model_name?: string
          price_cached_per_million?: number | null
          price_input_per_million?: number
          price_output_per_million?: number
          provider?: string
          quality_rating?: number | null
          speed_rating?: number | null
          supports_tools?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_personas: {
        Row: {
          created_at: string | null
          description: string | null
          formality: string | null
          id: string
          is_active: boolean | null
          name: string
          pain_points: Json | null
          persona_key: string
          primary_goals: Json | null
          relevant_apps: string[] | null
          subscription_tier: string | null
          tone: string | null
          updated_at: string | null
          upgrade_sensitivity: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          formality?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          pain_points?: Json | null
          persona_key: string
          primary_goals?: Json | null
          relevant_apps?: string[] | null
          subscription_tier?: string | null
          tone?: string | null
          updated_at?: string | null
          upgrade_sensitivity?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          formality?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          pain_points?: Json | null
          persona_key?: string
          primary_goals?: Json | null
          relevant_apps?: string[] | null
          subscription_tier?: string | null
          tone?: string | null
          updated_at?: string | null
          upgrade_sensitivity?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      ai_rate_limits: {
        Row: {
          app_id: string | null
          created_at: string | null
          daily_reset_at: string | null
          feature: string
          id: string
          last_request_at: string | null
          monthly_reset_at: string | null
          org_id: string | null
          requests_this_month: number | null
          requests_today: number | null
          tokens_this_month: number | null
          tokens_today: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string | null
          daily_reset_at?: string | null
          feature: string
          id?: string
          last_request_at?: string | null
          monthly_reset_at?: string | null
          org_id?: string | null
          requests_this_month?: number | null
          requests_today?: number | null
          tokens_this_month?: number | null
          tokens_today?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string | null
          created_at?: string | null
          daily_reset_at?: string | null
          feature?: string
          id?: string
          last_request_at?: string | null
          monthly_reset_at?: string | null
          org_id?: string | null
          requests_this_month?: number | null
          requests_today?: number | null
          tokens_this_month?: number | null
          tokens_today?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_rate_limits_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_rate_limits_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_rate_limits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_system_prompts: {
        Row: {
          applicable_apps: string[] | null
          category: string | null
          created_at: string | null
          default_model_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          name: string
          prompt_key: string
          system_prompt: string
          temperature: number | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          applicable_apps?: string[] | null
          category?: string | null
          created_at?: string | null
          default_model_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name: string
          prompt_key: string
          system_prompt: string
          temperature?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          applicable_apps?: string[] | null
          category?: string | null
          created_at?: string | null
          default_model_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          name?: string
          prompt_key?: string
          system_prompt?: string
          temperature?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_system_prompts_default_model_id_fkey"
            columns: ["default_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tier_model_mapping: {
        Row: {
          app_id: string | null
          created_at: string | null
          daily_limit: number | null
          feature: string
          id: string
          is_active: boolean | null
          model_id: string
          monthly_limit: number | null
          priority: number | null
          subscription_tier: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string | null
          daily_limit?: number | null
          feature: string
          id?: string
          is_active?: boolean | null
          model_id: string
          monthly_limit?: number | null
          priority?: number | null
          subscription_tier: string
        }
        Update: {
          app_id?: string | null
          created_at?: string | null
          daily_limit?: number | null
          feature?: string
          id?: string
          is_active?: boolean | null
          model_id?: string
          monthly_limit?: number | null
          priority?: number | null
          subscription_tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tier_model_mapping_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_tier_model_mapping_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_tier_model_mapping_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          app_id: string | null
          cached_tokens: number | null
          conversation_id: string | null
          cost_usd: number | null
          created_at: string | null
          error_message: string | null
          feature: string
          id: string
          input_tokens: number | null
          model_id: string | null
          model_name: string
          org_id: string | null
          output_tokens: number | null
          prompt_key: string | null
          request_metadata: Json | null
          response_time_ms: number | null
          success: boolean | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          cached_tokens?: number | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          feature: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          model_name: string
          org_id?: string | null
          output_tokens?: number | null
          prompt_key?: string | null
          request_metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          cached_tokens?: number | null
          conversation_id?: string | null
          cost_usd?: number | null
          created_at?: string | null
          error_message?: string | null
          feature?: string
          id?: string
          input_tokens?: number | null
          model_id?: string | null
          model_name?: string
          org_id?: string | null
          output_tokens?: number | null
          prompt_key?: string | null
          request_metadata?: Json | null
          response_time_ms?: number | null
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_usage_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_apps: string[] | null
          allowed_ips: string[] | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          permissions: string[] | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          allowed_apps?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          permissions?: string[] | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          allowed_apps?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          permissions?: string[] | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_access: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          app_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          org_id: string
          trial_ends_at: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          app_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          trial_ends_at?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          app_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_access_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_access_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "app_access_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      apps_registry: {
        Row: {
          app_url: string | null
          available_permissions: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_beta: boolean | null
          is_public: boolean | null
          logo_url: string | null
          min_subscription_tier: string | null
          name: string
          requires_subscription: boolean | null
          settings: Json | null
          slug: string
          tagline: string | null
          target_audience: string[] | null
          updated_at: string | null
        }
        Insert: {
          app_url?: string | null
          available_permissions?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id: string
          is_active?: boolean | null
          is_beta?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          min_subscription_tier?: string | null
          name: string
          requires_subscription?: boolean | null
          settings?: Json | null
          slug: string
          tagline?: string | null
          target_audience?: string[] | null
          updated_at?: string | null
        }
        Update: {
          app_url?: string | null
          available_permissions?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          is_public?: boolean | null
          logo_url?: string | null
          min_subscription_tier?: string | null
          name?: string
          requires_subscription?: boolean | null
          settings?: Json | null
          slug?: string
          tagline?: string | null
          target_audience?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          app_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          app_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          app_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          app_id: string | null
          created_at: string | null
          description: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string | null
          account_type: string | null
          auto_sync_enabled: boolean | null
          balance: number | null
          balance_currency: string | null
          balance_updated_at: string | null
          bank_bic: string | null
          bank_name: string | null
          created_at: string | null
          finapi_account_id: string | null
          finapi_connection_id: string | null
          iban: string | null
          iban_masked: string | null
          id: string
          is_primary: boolean | null
          last_successful_sync: string | null
          sync_error_message: string | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name?: string | null
          account_type?: string | null
          auto_sync_enabled?: boolean | null
          balance?: number | null
          balance_currency?: string | null
          balance_updated_at?: string | null
          bank_bic?: string | null
          bank_name?: string | null
          created_at?: string | null
          finapi_account_id?: string | null
          finapi_connection_id?: string | null
          iban?: string | null
          iban_masked?: string | null
          id?: string
          is_primary?: boolean | null
          last_successful_sync?: string | null
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string | null
          account_type?: string | null
          auto_sync_enabled?: boolean | null
          balance?: number | null
          balance_currency?: string | null
          balance_updated_at?: string | null
          bank_bic?: string | null
          bank_name?: string | null
          created_at?: string | null
          finapi_account_id?: string | null
          finapi_connection_id?: string | null
          iban?: string | null
          iban_masked?: string | null
          id?: string
          is_primary?: boolean | null
          last_successful_sync?: string | null
          sync_error_message?: string | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_account_id: string
          booking_date: string
          category: string | null
          counterpart_bic: string | null
          counterpart_iban: string | null
          counterpart_name: string | null
          created_at: string | null
          currency: string | null
          finapi_transaction_id: string | null
          id: string
          is_matched: boolean | null
          match_confidence: number | null
          match_reason: string | null
          matched_at: string | null
          matched_by: string | null
          matched_lease_id: string | null
          matched_tenant_id: string | null
          payment_id: string | null
          purpose: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          value_date: string | null
        }
        Insert: {
          amount: number
          bank_account_id: string
          booking_date: string
          category?: string | null
          counterpart_bic?: string | null
          counterpart_iban?: string | null
          counterpart_name?: string | null
          created_at?: string | null
          currency?: string | null
          finapi_transaction_id?: string | null
          id?: string
          is_matched?: boolean | null
          match_confidence?: number | null
          match_reason?: string | null
          matched_at?: string | null
          matched_by?: string | null
          matched_lease_id?: string | null
          matched_tenant_id?: string | null
          payment_id?: string | null
          purpose?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          value_date?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string
          booking_date?: string
          category?: string | null
          counterpart_bic?: string | null
          counterpart_iban?: string | null
          counterpart_name?: string | null
          created_at?: string | null
          currency?: string | null
          finapi_transaction_id?: string | null
          id?: string
          is_matched?: boolean | null
          match_confidence?: number | null
          match_reason?: string | null
          matched_at?: string | null
          matched_by?: string | null
          matched_lease_id?: string | null
          matched_tenant_id?: string | null
          payment_id?: string | null
          purpose?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          address_addition: string | null
          building_type: string | null
          caretaker_owner_id: string | null
          city: string
          construction_year: number | null
          country: string | null
          created_at: string | null
          created_by: string | null
          district: string | null
          external_landlord_email: string | null
          external_landlord_name: string | null
          external_landlord_phone: string | null
          house_number: string | null
          id: string
          internal_reference: string | null
          land_area_sqm: number | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          notes: string | null
          occupied_unit_count: number | null
          org_id: string | null
          owner_type: string
          ownership_share: number | null
          ownership_type: string | null
          renovation_year: number | null
          state: string | null
          status: string | null
          street: string
          total_living_area_sqm: number | null
          total_usable_area_sqm: number | null
          unit_count: number | null
          updated_at: string | null
          zip: string
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          address_addition?: string | null
          building_type?: string | null
          caretaker_owner_id?: string | null
          city: string
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          external_landlord_email?: string | null
          external_landlord_name?: string | null
          external_landlord_phone?: string | null
          house_number?: string | null
          id?: string
          internal_reference?: string | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          notes?: string | null
          occupied_unit_count?: number | null
          org_id?: string | null
          owner_type?: string
          ownership_share?: number | null
          ownership_type?: string | null
          renovation_year?: number | null
          state?: string | null
          status?: string | null
          street: string
          total_living_area_sqm?: number | null
          total_usable_area_sqm?: number | null
          unit_count?: number | null
          updated_at?: string | null
          zip: string
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          address_addition?: string | null
          building_type?: string | null
          caretaker_owner_id?: string | null
          city?: string
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          external_landlord_email?: string | null
          external_landlord_name?: string | null
          external_landlord_phone?: string | null
          house_number?: string | null
          id?: string
          internal_reference?: string | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          occupied_unit_count?: number | null
          org_id?: string | null
          owner_type?: string
          ownership_share?: number | null
          ownership_type?: string | null
          renovation_year?: number | null
          state?: string | null
          status?: string | null
          street?: string
          total_living_area_sqm?: number | null
          total_usable_area_sqm?: number | null
          unit_count?: number | null
          updated_at?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calculations: {
        Row: {
          browser: string | null
          building_id: string | null
          created_at: string | null
          device_type: string | null
          document_generated: boolean | null
          document_type: string | null
          document_url: string | null
          id: string
          input_data: Json
          is_premium: boolean | null
          lead_id: string | null
          org_id: string | null
          premium_purchased_at: string | null
          result_data: Json | null
          result_summary: string | null
          session_id: string | null
          source_app: string | null
          source_page: string | null
          source_url: string | null
          tool_type: string
          tool_version: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          building_id?: string | null
          created_at?: string | null
          device_type?: string | null
          document_generated?: boolean | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          input_data: Json
          is_premium?: boolean | null
          lead_id?: string | null
          org_id?: string | null
          premium_purchased_at?: string | null
          result_data?: Json | null
          result_summary?: string | null
          session_id?: string | null
          source_app?: string | null
          source_page?: string | null
          source_url?: string | null
          tool_type: string
          tool_version?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          building_id?: string | null
          created_at?: string | null
          device_type?: string | null
          document_generated?: boolean | null
          document_type?: string | null
          document_url?: string | null
          id?: string
          input_data?: Json
          is_premium?: boolean | null
          lead_id?: string | null
          org_id?: string | null
          premium_purchased_at?: string | null
          result_data?: Json | null
          result_summary?: string | null
          session_id?: string | null
          source_app?: string | null
          source_page?: string | null
          source_url?: string | null
          tool_type?: string
          tool_version?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calculations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "calculations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calculations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "calculations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      caretaker_absences: {
        Row: {
          absence_type: string | null
          created_at: string | null
          end_date: string
          id: string
          notified_at: string | null
          notify_orgs: boolean | null
          reason: string | null
          start_date: string
          status: string | null
          substitute_name: string | null
          substitute_phone: string | null
          substitute_user_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          absence_type?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          notified_at?: string | null
          notify_orgs?: boolean | null
          reason?: string | null
          start_date: string
          status?: string | null
          substitute_name?: string | null
          substitute_phone?: string | null
          substitute_user_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          absence_type?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          notified_at?: string | null
          notify_orgs?: boolean | null
          reason?: string | null
          start_date?: string
          status?: string | null
          substitute_name?: string | null
          substitute_phone?: string | null
          substitute_user_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      caretaker_availability: {
        Row: {
          availability_mode: string
          created_at: string | null
          current_status: string | null
          emergency_enabled: boolean | null
          emergency_phone: string | null
          friday_end: string | null
          friday_start: string | null
          id: string
          monday_end: string | null
          monday_start: string | null
          saturday_end: string | null
          saturday_start: string | null
          status_note: string | null
          status_until: string | null
          sunday_end: string | null
          sunday_start: string | null
          thursday_end: string | null
          thursday_start: string | null
          tuesday_end: string | null
          tuesday_start: string | null
          updated_at: string | null
          user_id: string
          wednesday_end: string | null
          wednesday_start: string | null
        }
        Insert: {
          availability_mode?: string
          created_at?: string | null
          current_status?: string | null
          emergency_enabled?: boolean | null
          emergency_phone?: string | null
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          monday_end?: string | null
          monday_start?: string | null
          saturday_end?: string | null
          saturday_start?: string | null
          status_note?: string | null
          status_until?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          updated_at?: string | null
          user_id: string
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Update: {
          availability_mode?: string
          created_at?: string | null
          current_status?: string | null
          emergency_enabled?: boolean | null
          emergency_phone?: string | null
          friday_end?: string | null
          friday_start?: string | null
          id?: string
          monday_end?: string | null
          monday_start?: string | null
          saturday_end?: string | null
          saturday_start?: string | null
          status_note?: string | null
          status_until?: string | null
          sunday_end?: string | null
          sunday_start?: string | null
          thursday_end?: string | null
          thursday_start?: string | null
          tuesday_end?: string | null
          tuesday_start?: string | null
          updated_at?: string | null
          user_id?: string
          wednesday_end?: string | null
          wednesday_start?: string | null
        }
        Relationships: []
      }
      co2_calculations: {
        Row: {
          co2_kg: number | null
          co2_kg_pro_qm: number | null
          co2_kosten_gesamt: number | null
          co2_preis_pro_tonne: number | null
          consumption_kwh: number
          consumption_raw: number | null
          consumption_unit: string | null
          created_at: string | null
          dokument_erstellt: boolean | null
          dokument_id: string | null
          emissionsfaktor: number | null
          fuel_type: string
          id: string
          mieter_anteil_euro: number | null
          mieter_anteil_prozent: number | null
          mieter_aufteilung: Json | null
          property_id: string
          stufe: number | null
          stufe_beschreibung: string | null
          updated_at: string | null
          user_id: string
          vermieter_anteil_euro: number | null
          vermieter_anteil_prozent: number | null
          wohnflaeche_qm: number
          year: number
        }
        Insert: {
          co2_kg?: number | null
          co2_kg_pro_qm?: number | null
          co2_kosten_gesamt?: number | null
          co2_preis_pro_tonne?: number | null
          consumption_kwh: number
          consumption_raw?: number | null
          consumption_unit?: string | null
          created_at?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          emissionsfaktor?: number | null
          fuel_type: string
          id?: string
          mieter_anteil_euro?: number | null
          mieter_anteil_prozent?: number | null
          mieter_aufteilung?: Json | null
          property_id: string
          stufe?: number | null
          stufe_beschreibung?: string | null
          updated_at?: string | null
          user_id: string
          vermieter_anteil_euro?: number | null
          vermieter_anteil_prozent?: number | null
          wohnflaeche_qm: number
          year: number
        }
        Update: {
          co2_kg?: number | null
          co2_kg_pro_qm?: number | null
          co2_kosten_gesamt?: number | null
          co2_preis_pro_tonne?: number | null
          consumption_kwh?: number
          consumption_raw?: number | null
          consumption_unit?: string | null
          created_at?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          emissionsfaktor?: number | null
          fuel_type?: string
          id?: string
          mieter_anteil_euro?: number | null
          mieter_anteil_prozent?: number | null
          mieter_aufteilung?: Json | null
          property_id?: string
          stufe?: number | null
          stufe_beschreibung?: string | null
          updated_at?: string | null
          user_id?: string
          vermieter_anteil_euro?: number | null
          vermieter_anteil_prozent?: number | null
          wohnflaeche_qm?: number
          year?: number
        }
        Relationships: []
      }
      co2_prices: {
        Row: {
          created_at: string | null
          id: string
          price_per_tonne: number
          source: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_tonne: number
          source?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_tonne?: number
          source?: string | null
          year?: number
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_comment_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "community_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          building_id: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          event_date: string | null
          event_location: string | null
          expires_at: string | null
          id: string
          images: Json | null
          is_pinned: boolean | null
          like_count: number | null
          mieter_building_id: string | null
          pinned_at: string | null
          pinned_by: string | null
          poll_options: Json | null
          poll_votes: Json | null
          post_type: string
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          building_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          event_date?: string | null
          event_location?: string | null
          expires_at?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean | null
          like_count?: number | null
          mieter_building_id?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          building_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          event_date?: string | null
          event_location?: string | null
          expires_at?: string | null
          id?: string
          images?: Json | null
          is_pinned?: boolean | null
          like_count?: number | null
          mieter_building_id?: string | null
          pinned_at?: string | null
          pinned_by?: string | null
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_mieter_building_id_fkey"
            columns: ["mieter_building_id"]
            isOneToOne: false
            referencedRelation: "mieter_buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      consumption_benchmarks: {
        Row: {
          benchmark_type: string
          category: string
          country: string | null
          created_at: string | null
          id: string
          meter_type: string
          reference_type: string
          reference_value: number | null
          region: string | null
          source: string | null
          source_year: number | null
          unit: string
          valid_from: string | null
          valid_until: string | null
          value_per_year: number
        }
        Insert: {
          benchmark_type: string
          category: string
          country?: string | null
          created_at?: string | null
          id?: string
          meter_type: string
          reference_type: string
          reference_value?: number | null
          region?: string | null
          source?: string | null
          source_year?: number | null
          unit: string
          valid_from?: string | null
          valid_until?: string | null
          value_per_year: number
        }
        Update: {
          benchmark_type?: string
          category?: string
          country?: string | null
          created_at?: string | null
          id?: string
          meter_type?: string
          reference_type?: string
          reference_value?: number | null
          region?: string | null
          source?: string | null
          source_year?: number | null
          unit?: string
          valid_from?: string | null
          valid_until?: string | null
          value_per_year?: number
        }
        Relationships: []
      }
      contract_tariff_components: {
        Row: {
          component_name: string
          component_type: string
          contract_id: string
          created_at: string | null
          dynamic_source: string | null
          id: string
          is_dynamic: boolean | null
          notes: string | null
          source: string | null
          time_end: string | null
          time_restriction: string | null
          time_start: string | null
          unit: string
          valid_from: string
          valid_until: string | null
          value: number
          weekday_restriction: string | null
        }
        Insert: {
          component_name: string
          component_type: string
          contract_id: string
          created_at?: string | null
          dynamic_source?: string | null
          id?: string
          is_dynamic?: boolean | null
          notes?: string | null
          source?: string | null
          time_end?: string | null
          time_restriction?: string | null
          time_start?: string | null
          unit: string
          valid_from: string
          valid_until?: string | null
          value: number
          weekday_restriction?: string | null
        }
        Update: {
          component_name?: string
          component_type?: string
          contract_id?: string
          created_at?: string | null
          dynamic_source?: string | null
          id?: string
          is_dynamic?: boolean | null
          notes?: string | null
          source?: string | null
          time_end?: string | null
          time_restriction?: string | null
          time_start?: string | null
          unit?: string
          valid_from?: string
          valid_until?: string | null
          value?: number
          weekday_restriction?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tariff_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "user_energy_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tariff_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_current_tariffs"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          can_add_members: boolean | null
          can_delete_messages: boolean | null
          can_write: boolean | null
          conversation_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          left_at: string | null
          notification_preference: string | null
          notifications_enabled: boolean | null
          role: string | null
          status: string | null
          unread_count: number | null
          user_app: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          can_add_members?: boolean | null
          can_delete_messages?: boolean | null
          can_write?: boolean | null
          conversation_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          notification_preference?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          status?: string | null
          unread_count?: number | null
          user_app?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          can_add_members?: boolean | null
          can_delete_messages?: boolean | null
          can_write?: boolean | null
          conversation_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          left_at?: string | null
          notification_preference?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          status?: string | null
          unread_count?: number | null
          user_app?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_my_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["chat_conversation_id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          building_id: string | null
          conversation_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          document_id: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          org_id: string | null
          source_app: string | null
          status: string | null
          task_id: string | null
          title: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          conversation_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          org_id?: string | null
          source_app?: string | null
          status?: string | null
          task_id?: string | null
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          conversation_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          org_id?: string | null
          source_app?: string | null
          status?: string | null
          task_id?: string | null
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_types: {
        Row: {
          betrkv_number: string | null
          category: string
          created_at: string | null
          default_allocation_key: string | null
          description: string | null
          id: string
          is_allocatable: boolean | null
          is_system: boolean | null
          max_cost_per_sqm: number | null
          min_cost_per_sqm: number | null
          name: string
          org_id: string | null
          sort_order: number | null
          sub_category: string | null
          typical_cost_per_sqm: number | null
          updated_at: string | null
          warning_message: string | null
        }
        Insert: {
          betrkv_number?: string | null
          category: string
          created_at?: string | null
          default_allocation_key?: string | null
          description?: string | null
          id: string
          is_allocatable?: boolean | null
          is_system?: boolean | null
          max_cost_per_sqm?: number | null
          min_cost_per_sqm?: number | null
          name: string
          org_id?: string | null
          sort_order?: number | null
          sub_category?: string | null
          typical_cost_per_sqm?: number | null
          updated_at?: string | null
          warning_message?: string | null
        }
        Update: {
          betrkv_number?: string | null
          category?: string
          created_at?: string | null
          default_allocation_key?: string | null
          description?: string | null
          id?: string
          is_allocatable?: boolean | null
          is_system?: boolean | null
          max_cost_per_sqm?: number | null
          min_cost_per_sqm?: number | null
          name?: string
          org_id?: string | null
          sort_order?: number | null
          sub_category?: string | null
          typical_cost_per_sqm?: number | null
          updated_at?: string | null
          warning_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cross_sell_rules: {
        Row: {
          cooldown_hours: number | null
          created_at: string | null
          cta_text: string | null
          description: string | null
          headline: string
          id: string
          is_active: boolean | null
          priority: number | null
          recommend_id: string
          recommend_type: string
          target_personas: string[] | null
          trigger_condition: Json
          trigger_type: string
        }
        Insert: {
          cooldown_hours?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          headline: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recommend_id: string
          recommend_type: string
          target_personas?: string[] | null
          trigger_condition: Json
          trigger_type: string
        }
        Update: {
          cooldown_hours?: number | null
          created_at?: string | null
          cta_text?: string | null
          description?: string | null
          headline?: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          recommend_id?: string
          recommend_type?: string
          target_personas?: string[] | null
          trigger_condition?: Json
          trigger_type?: string
        }
        Relationships: []
      }
      digital_handovers: {
        Row: {
          bemerkungen: string | null
          completed_at: string | null
          created_at: string | null
          dokument_erstellt: boolean | null
          dokument_id: string | null
          dokument_storage_path: string | null
          esignature_order_id: string | null
          gesamtzustand: string | null
          handover_date: string
          handover_type: string
          id: string
          lease_id: string | null
          mieter_anwesend: boolean | null
          mieter_name: string | null
          property_id: string
          raeume: Json | null
          schluessel: Json | null
          schluessel_vollstaendig: boolean | null
          status: string | null
          tenant_id: string | null
          unterschrift_mieter: string | null
          unterschrift_mieter_datum: string | null
          unterschrift_vermieter: string | null
          unterschrift_vermieter_datum: string | null
          unterschriften_vollstaendig: boolean | null
          updated_at: string | null
          user_id: string
          vermieter_anwesend: boolean | null
          vermieter_name: string | null
          zaehlerstaende: Json | null
          zeuge_anwesend: boolean | null
          zeuge_name: string | null
        }
        Insert: {
          bemerkungen?: string | null
          completed_at?: string | null
          created_at?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          dokument_storage_path?: string | null
          esignature_order_id?: string | null
          gesamtzustand?: string | null
          handover_date: string
          handover_type: string
          id?: string
          lease_id?: string | null
          mieter_anwesend?: boolean | null
          mieter_name?: string | null
          property_id: string
          raeume?: Json | null
          schluessel?: Json | null
          schluessel_vollstaendig?: boolean | null
          status?: string | null
          tenant_id?: string | null
          unterschrift_mieter?: string | null
          unterschrift_mieter_datum?: string | null
          unterschrift_vermieter?: string | null
          unterschrift_vermieter_datum?: string | null
          unterschriften_vollstaendig?: boolean | null
          updated_at?: string | null
          user_id: string
          vermieter_anwesend?: boolean | null
          vermieter_name?: string | null
          zaehlerstaende?: Json | null
          zeuge_anwesend?: boolean | null
          zeuge_name?: string | null
        }
        Update: {
          bemerkungen?: string | null
          completed_at?: string | null
          created_at?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          dokument_storage_path?: string | null
          esignature_order_id?: string | null
          gesamtzustand?: string | null
          handover_date?: string
          handover_type?: string
          id?: string
          lease_id?: string | null
          mieter_anwesend?: boolean | null
          mieter_name?: string | null
          property_id?: string
          raeume?: Json | null
          schluessel?: Json | null
          schluessel_vollstaendig?: boolean | null
          status?: string | null
          tenant_id?: string | null
          unterschrift_mieter?: string | null
          unterschrift_mieter_datum?: string | null
          unterschrift_vermieter?: string | null
          unterschrift_vermieter_datum?: string | null
          unterschriften_vollstaendig?: boolean | null
          updated_at?: string | null
          user_id?: string
          vermieter_anwesend?: boolean | null
          vermieter_name?: string | null
          zaehlerstaende?: Json | null
          zeuge_anwesend?: boolean | null
          zeuge_name?: string | null
        }
        Relationships: []
      }
      document_downloads: {
        Row: {
          access_id: string | null
          document_id: string
          download_type: string
          downloaded_at: string | null
          file_format: string | null
          id: string
          ip_address: unknown
          payment_amount_cents: number | null
          user_agent: string | null
          user_id: string
          was_paid: boolean | null
        }
        Insert: {
          access_id?: string | null
          document_id: string
          download_type: string
          downloaded_at?: string | null
          file_format?: string | null
          id?: string
          ip_address?: unknown
          payment_amount_cents?: number | null
          user_agent?: string | null
          user_id: string
          was_paid?: boolean | null
        }
        Update: {
          access_id?: string | null
          document_id?: string
          download_type?: string
          downloaded_at?: string | null
          file_format?: string | null
          id?: string
          ip_address?: unknown
          payment_amount_cents?: number | null
          user_agent?: string | null
          user_id?: string
          was_paid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "document_downloads_access_id_fkey"
            columns: ["access_id"]
            isOneToOne: false
            referencedRelation: "user_document_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_downloads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "generated_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_shares: {
        Row: {
          access_level: string | null
          created_at: string | null
          document_id: string
          expires_at: string | null
          id: string
          shared_by: string | null
          shared_with_email: string | null
          shared_with_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          document_id: string
          expires_at?: string | null
          id?: string
          shared_by?: string | null
          shared_with_email?: string | null
          shared_with_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          document_id?: string
          expires_at?: string | null
          id?: string
          shared_by?: string | null
          shared_with_email?: string | null
          shared_with_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_shares_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          available_in_apps: string[] | null
          category: string
          color: string | null
          context_prefill: Json | null
          created_at: string | null
          description: string | null
          form_schema: Json
          icon: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          long_description: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          output_format: string | null
          pricing_type: string | null
          slug: string
          sort_order: number | null
          subcategory: string | null
          tags: string[] | null
          target_audience: string[] | null
          template_file_url: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          available_in_apps?: string[] | null
          category?: string
          color?: string | null
          context_prefill?: Json | null
          created_at?: string | null
          description?: string | null
          form_schema: Json
          icon?: string | null
          id: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          output_format?: string | null
          pricing_type?: string | null
          slug: string
          sort_order?: number | null
          subcategory?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          template_file_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          available_in_apps?: string[] | null
          category?: string
          color?: string | null
          context_prefill?: Json | null
          created_at?: string | null
          description?: string | null
          form_schema?: Json
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          long_description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          output_format?: string | null
          pricing_type?: string | null
          slug?: string
          sort_order?: number | null
          subcategory?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          template_file_url?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          building_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          document_date: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          is_template: boolean | null
          lease_id: string | null
          mime_type: string | null
          org_id: string
          status: string | null
          sync_metadata: Json | null
          synced_to_apps: string[] | null
          tags: string[] | null
          tenant_id: string | null
          title: string | null
          unit_id: string | null
          updated_at: string | null
          uploaded_by: string | null
          valid_from: string | null
          valid_until: string | null
          visibility: string | null
          visibility_scope: string | null
        }
        Insert: {
          building_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          is_template?: boolean | null
          lease_id?: string | null
          mime_type?: string | null
          org_id: string
          status?: string | null
          sync_metadata?: Json | null
          synced_to_apps?: string[] | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          visibility?: string | null
          visibility_scope?: string | null
        }
        Update: {
          building_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          is_template?: boolean | null
          lease_id?: string | null
          mime_type?: string | null
          org_id?: string
          status?: string | null
          sync_metadata?: Json | null
          synced_to_apps?: string[] | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          unit_id?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          visibility?: string | null
          visibility_scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_active_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["lease_id"]
          },
          {
            foreignKeyName: "documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_lease_id_calc"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      efficiency_calculations: {
        Row: {
          anomaly_detected: boolean | null
          anomaly_notes: string | null
          avg_flow_temp: number | null
          avg_outside_temp: number | null
          benchmark_percentile: number | null
          building_id: string | null
          calculated_at: string | null
          cop: number
          created_at: string | null
          efficiency_rating: string | null
          heater_active: boolean | null
          heater_consumption_kwh: number | null
          heating_degree_days: number | null
          id: string
          max_outside_temp: number | null
          min_outside_temp: number | null
          optimization_tips: string[] | null
          org_id: string | null
          period_end: string
          period_start: string
          period_type: string
          scop: number | null
          strom_consumption_kwh: number
          strom_meter_id: string
          user_id: string
          waerme_meter_id: string
          waerme_production_kwh: number
        }
        Insert: {
          anomaly_detected?: boolean | null
          anomaly_notes?: string | null
          avg_flow_temp?: number | null
          avg_outside_temp?: number | null
          benchmark_percentile?: number | null
          building_id?: string | null
          calculated_at?: string | null
          cop: number
          created_at?: string | null
          efficiency_rating?: string | null
          heater_active?: boolean | null
          heater_consumption_kwh?: number | null
          heating_degree_days?: number | null
          id?: string
          max_outside_temp?: number | null
          min_outside_temp?: number | null
          optimization_tips?: string[] | null
          org_id?: string | null
          period_end: string
          period_start: string
          period_type: string
          scop?: number | null
          strom_consumption_kwh: number
          strom_meter_id: string
          user_id: string
          waerme_meter_id: string
          waerme_production_kwh: number
        }
        Update: {
          anomaly_detected?: boolean | null
          anomaly_notes?: string | null
          avg_flow_temp?: number | null
          avg_outside_temp?: number | null
          benchmark_percentile?: number | null
          building_id?: string | null
          calculated_at?: string | null
          cop?: number
          created_at?: string | null
          efficiency_rating?: string | null
          heater_active?: boolean | null
          heater_consumption_kwh?: number | null
          heating_degree_days?: number | null
          id?: string
          max_outside_temp?: number | null
          min_outside_temp?: number | null
          optimization_tips?: string[] | null
          org_id?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          scop?: number | null
          strom_consumption_kwh?: number
          strom_meter_id?: string
          user_id?: string
          waerme_meter_id?: string
          waerme_production_kwh?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_efficiency_strom_meter"
            columns: ["strom_meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_strom_meter"
            columns: ["strom_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_last_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_strom_meter"
            columns: ["strom_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_strom_meter"
            columns: ["strom_meter_id"]
            isOneToOne: false
            referencedRelation: "v_monthly_consumption"
            referencedColumns: ["meter_id"]
          },
          {
            foreignKeyName: "fk_efficiency_waerme_meter"
            columns: ["waerme_meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_waerme_meter"
            columns: ["waerme_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_last_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_waerme_meter"
            columns: ["waerme_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_efficiency_waerme_meter"
            columns: ["waerme_meter_id"]
            isOneToOne: false
            referencedRelation: "v_monthly_consumption"
            referencedColumns: ["meter_id"]
          },
        ]
      }
      email_events: {
        Row: {
          brevo_campaign_id: string | null
          brevo_message_id: string | null
          created_at: string | null
          email: string
          email_subject: string | null
          event_timestamp: string | null
          event_type: string
          id: string
          lead_id: string | null
          link_clicked: string | null
          user_id: string | null
        }
        Insert: {
          brevo_campaign_id?: string | null
          brevo_message_id?: string | null
          created_at?: string | null
          email: string
          email_subject?: string | null
          event_timestamp?: string | null
          event_type: string
          id?: string
          lead_id?: string | null
          link_clicked?: string | null
          user_id?: string | null
        }
        Update: {
          brevo_campaign_id?: string | null
          brevo_message_id?: string | null
          created_at?: string | null
          email?: string
          email_subject?: string | null
          event_timestamp?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
          link_clicked?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_hotline_config: {
        Row: {
          caretaker_user_id: string
          contact_methods: string[] | null
          created_at: string | null
          id: string
          invitation_status: string | null
          invited_at: string | null
          is_enabled: boolean | null
          org_id: string
          responded_at: string | null
          updated_at: string | null
        }
        Insert: {
          caretaker_user_id: string
          contact_methods?: string[] | null
          created_at?: string | null
          id?: string
          invitation_status?: string | null
          invited_at?: string | null
          is_enabled?: boolean | null
          org_id: string
          responded_at?: string | null
          updated_at?: string | null
        }
        Update: {
          caretaker_user_id?: string
          contact_methods?: string[] | null
          created_at?: string | null
          id?: string
          invitation_status?: string | null
          invited_at?: string | null
          is_enabled?: boolean | null
          org_id?: string
          responded_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_hotline_config_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_providers: {
        Row: {
          affiliate_link_template: string | null
          affiliate_partner: string | null
          bdew_code: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_major_provider: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          market_identifier: string | null
          name: string
          phone: string | null
          portal_url: string | null
          primary_color: string | null
          provider_code: string | null
          provider_type: string
          short_name: string | null
          street: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          affiliate_link_template?: string | null
          affiliate_partner?: string | null
          bdew_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_major_provider?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          market_identifier?: string | null
          name: string
          phone?: string | null
          portal_url?: string | null
          primary_color?: string | null
          provider_code?: string | null
          provider_type: string
          short_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          affiliate_link_template?: string | null
          affiliate_partner?: string | null
          bdew_code?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_major_provider?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          market_identifier?: string | null
          name?: string
          phone?: string | null
          portal_url?: string | null
          primary_color?: string | null
          provider_code?: string | null
          provider_type?: string
          short_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          app_id: string | null
          endpoint: string | null
          environment: string | null
          error_code: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          occurred_at: string | null
          request_data: Json | null
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          user_id: string | null
        }
        Insert: {
          app_id?: string | null
          endpoint?: string | null
          environment?: string | null
          error_code?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          occurred_at?: string | null
          request_data?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Update: {
          app_id?: string | null
          endpoint?: string | null
          environment?: string | null
          error_code?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          occurred_at?: string | null
          request_data?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      esignature_orders: {
        Row: {
          anzahl_signaturen: number
          app_source: string | null
          bezahlt: boolean | null
          completed_at: string | null
          created_at: string | null
          document_id: string | null
          document_name: string
          document_storage_path: string | null
          erinnerung_gesendet_am: string | null
          frist_datum: string | null
          id: string
          kosten: number | null
          lease_id: string | null
          property_id: string | null
          provider: string
          provider_envelope_id: string | null
          provider_status: string | null
          sent_at: string | null
          signatories: Json
          signatur_level: string
          signaturen_abgeschlossen: number | null
          signed_document_storage_path: string | null
          signed_document_url: string | null
          status: string
          stripe_payment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anzahl_signaturen?: number
          app_source?: string | null
          bezahlt?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_name: string
          document_storage_path?: string | null
          erinnerung_gesendet_am?: string | null
          frist_datum?: string | null
          id?: string
          kosten?: number | null
          lease_id?: string | null
          property_id?: string | null
          provider?: string
          provider_envelope_id?: string | null
          provider_status?: string | null
          sent_at?: string | null
          signatories?: Json
          signatur_level?: string
          signaturen_abgeschlossen?: number | null
          signed_document_storage_path?: string | null
          signed_document_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anzahl_signaturen?: number
          app_source?: string | null
          bezahlt?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          document_id?: string | null
          document_name?: string
          document_storage_path?: string | null
          erinnerung_gesendet_am?: string | null
          frist_datum?: string | null
          id?: string
          kosten?: number | null
          lease_id?: string | null
          property_id?: string | null
          provider?: string
          provider_envelope_id?: string | null
          provider_status?: string | null
          sent_at?: string | null
          signatories?: Json
          signatur_level?: string
          signaturen_abgeschlossen?: number | null
          signed_document_storage_path?: string | null
          signed_document_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finapi_users: {
        Row: {
          access_token: string | null
          created_at: string | null
          finapi_user_id: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          finapi_user_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          finapi_user_id?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fintutto_apps: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          cross_sell_for: string[] | null
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          tagline: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          cross_sell_for?: string[] | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          sort_order?: number | null
          tagline?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          cross_sell_for?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          tagline?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      gas_conversion_values: {
        Row: {
          abrechnungsbrennwert: number | null
          brennwert: number
          brennwert_unit: string | null
          contract_id: string
          created_at: string | null
          id: string
          notes: string | null
          source: string | null
          source_document: string | null
          valid_from: string
          valid_until: string | null
          zustandszahl: number
        }
        Insert: {
          abrechnungsbrennwert?: number | null
          brennwert: number
          brennwert_unit?: string | null
          contract_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          source_document?: string | null
          valid_from: string
          valid_until?: string | null
          zustandszahl: number
        }
        Update: {
          abrechnungsbrennwert?: number | null
          brennwert?: number
          brennwert_unit?: string | null
          contract_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          source?: string | null
          source_document?: string | null
          valid_from?: string
          valid_until?: string | null
          zustandszahl?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_gas_conversion_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "user_energy_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gas_conversion_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_current_tariffs"
            referencedColumns: ["contract_id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          building_id: string | null
          calculation_id: string | null
          context_data: Json | null
          created_at: string | null
          delivery_status: string | null
          document_name: string
          document_size_bytes: number | null
          document_type: string
          document_url: string
          download_count: number | null
          expires_at: string | null
          folder: string | null
          has_watermark: boolean | null
          id: string
          input_data: Json
          is_favorite: boolean | null
          is_premium: boolean | null
          last_downloaded_at: string | null
          lead_id: string | null
          org_id: string | null
          premium_purchased_at: string | null
          sent_at: string | null
          sent_to: string | null
          sent_via: string | null
          shared_with_apps: string[] | null
          source_app: string | null
          source_url: string | null
          status: string | null
          template_id: string | null
          template_version: string | null
          tenant_id: string | null
          tool_type: string
          tool_version: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          watermark_removed_at: string | null
        }
        Insert: {
          building_id?: string | null
          calculation_id?: string | null
          context_data?: Json | null
          created_at?: string | null
          delivery_status?: string | null
          document_name: string
          document_size_bytes?: number | null
          document_type: string
          document_url: string
          download_count?: number | null
          expires_at?: string | null
          folder?: string | null
          has_watermark?: boolean | null
          id?: string
          input_data: Json
          is_favorite?: boolean | null
          is_premium?: boolean | null
          last_downloaded_at?: string | null
          lead_id?: string | null
          org_id?: string | null
          premium_purchased_at?: string | null
          sent_at?: string | null
          sent_to?: string | null
          sent_via?: string | null
          shared_with_apps?: string[] | null
          source_app?: string | null
          source_url?: string | null
          status?: string | null
          template_id?: string | null
          template_version?: string | null
          tenant_id?: string | null
          tool_type: string
          tool_version?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          watermark_removed_at?: string | null
        }
        Update: {
          building_id?: string | null
          calculation_id?: string | null
          context_data?: Json | null
          created_at?: string | null
          delivery_status?: string | null
          document_name?: string
          document_size_bytes?: number | null
          document_type?: string
          document_url?: string
          download_count?: number | null
          expires_at?: string | null
          folder?: string | null
          has_watermark?: boolean | null
          id?: string
          input_data?: Json
          is_favorite?: boolean | null
          is_premium?: boolean | null
          last_downloaded_at?: string | null
          lead_id?: string | null
          org_id?: string | null
          premium_purchased_at?: string | null
          sent_at?: string | null
          sent_to?: string | null
          sent_via?: string | null
          shared_with_apps?: string[] | null
          source_app?: string | null
          source_url?: string | null
          status?: string | null
          template_id?: string | null
          template_version?: string | null
          tenant_id?: string | null
          tool_type?: string
          tool_version?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          watermark_removed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "generated_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "generated_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "generated_documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "generated_documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      github_events: {
        Row: {
          commit_message: string | null
          commit_sha: string | null
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          ref: string | null
          repository: string | null
          sender: string | null
        }
        Insert: {
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          ref?: string | null
          repository?: string | null
          sender?: string | null
        }
        Update: {
          commit_message?: string | null
          commit_sha?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          ref?: string | null
          repository?: string | null
          sender?: string | null
        }
        Relationships: []
      }
      handover_photos: {
        Row: {
          bereich: string | null
          beschreibung: string | null
          created_at: string | null
          file_size: number | null
          handover_id: string
          id: string
          mime_type: string | null
          ocr_confidence: number | null
          ocr_result: string | null
          raum: string | null
          storage_path: string
          thumbnail_path: string | null
        }
        Insert: {
          bereich?: string | null
          beschreibung?: string | null
          created_at?: string | null
          file_size?: number | null
          handover_id: string
          id?: string
          mime_type?: string | null
          ocr_confidence?: number | null
          ocr_result?: string | null
          raum?: string | null
          storage_path: string
          thumbnail_path?: string | null
        }
        Update: {
          bereich?: string | null
          beschreibung?: string | null
          created_at?: string | null
          file_size?: number | null
          handover_id?: string
          id?: string
          mime_type?: string | null
          ocr_confidence?: number | null
          ocr_result?: string | null
          raum?: string | null
          storage_path?: string
          thumbnail_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handover_photos_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "digital_handovers"
            referencedColumns: ["id"]
          },
        ]
      }
      immoscout_oauth: {
        Row: {
          connected_at: string | null
          created_at: string | null
          id: string
          is_connected: boolean | null
          last_used_at: string | null
          oauth_token: string | null
          oauth_token_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          id?: string
          is_connected?: boolean | null
          last_used_at?: string | null
          oauth_token?: string | null
          oauth_token_secret?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      indexmiete_anpassungen: {
        Row: {
          aktueller_index: number
          aktuelles_datum: string
          alte_miete: number
          basis_datum: string
          basis_index: number
          basis_miete: number
          created_at: string | null
          dokument_id: string | null
          erhoehung_betrag: number | null
          id: string
          lease_id: string
          letter_order_id: string | null
          neue_miete: number
          property_id: string | null
          schreiben_datum: string | null
          status: string | null
          steigerung_absolut: number | null
          steigerung_prozent: number | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
          wirksam_ab: string
        }
        Insert: {
          aktueller_index: number
          aktuelles_datum: string
          alte_miete: number
          basis_datum: string
          basis_index: number
          basis_miete: number
          created_at?: string | null
          dokument_id?: string | null
          erhoehung_betrag?: number | null
          id?: string
          lease_id: string
          letter_order_id?: string | null
          neue_miete: number
          property_id?: string | null
          schreiben_datum?: string | null
          status?: string | null
          steigerung_absolut?: number | null
          steigerung_prozent?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
          wirksam_ab: string
        }
        Update: {
          aktueller_index?: number
          aktuelles_datum?: string
          alte_miete?: number
          basis_datum?: string
          basis_index?: number
          basis_miete?: number
          created_at?: string | null
          dokument_id?: string | null
          erhoehung_betrag?: number | null
          id?: string
          lease_id?: string
          letter_order_id?: string | null
          neue_miete?: number
          property_id?: string | null
          schreiben_datum?: string | null
          status?: string | null
          steigerung_absolut?: number | null
          steigerung_prozent?: number | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
          wirksam_ab?: string
        }
        Relationships: []
      }
      inspection_protocols: {
        Row: {
          actions_deadline: string | null
          actions_required: string | null
          building_id: string
          caretaker_owner_id: string | null
          checklist_items: Json | null
          created_at: string | null
          findings: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          inspection_date: string
          inspection_time: string | null
          inspection_type: string
          next_due_date: string | null
          org_id: string | null
          photos: string[] | null
          recorded_by: string | null
          signature_url: string | null
          signed_at: string | null
          signed_by_name: string | null
          specific_data: Json | null
          status: string
          task_id: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          actions_deadline?: string | null
          actions_required?: string | null
          building_id: string
          caretaker_owner_id?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          findings?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          inspection_date?: string
          inspection_time?: string | null
          inspection_type: string
          next_due_date?: string | null
          org_id?: string | null
          photos?: string[] | null
          recorded_by?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          specific_data?: Json | null
          status?: string
          task_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actions_deadline?: string | null
          actions_required?: string | null
          building_id?: string
          caretaker_owner_id?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          findings?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          inspection_date?: string
          inspection_time?: string | null
          inspection_type?: string
          next_due_date?: string | null
          org_id?: string | null
          photos?: string[] | null
          recorded_by?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_by_name?: string | null
          specific_data?: Json | null
          status?: string
          task_id?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_protocols_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "inspection_protocols_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_protocols_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "inspection_protocols_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          code: string | null
          created_at: string | null
          current_uses: number | null
          email: string | null
          email_opened_at: string | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          invited_by: string
          max_uses: number | null
          org_id: string
          personal_message: string | null
          resource_grants: Json | null
          role_id: string | null
          status: string | null
          target_app: string | null
          token: string
          type: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          code?: string | null
          created_at?: string | null
          current_uses?: number | null
          email?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          invited_by: string
          max_uses?: number | null
          org_id: string
          personal_message?: string | null
          resource_grants?: Json | null
          role_id?: string | null
          status?: string | null
          target_app?: string | null
          token?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          code?: string | null
          created_at?: string | null
          current_uses?: number | null
          email?: string | null
          email_opened_at?: string | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string
          max_uses?: number | null
          org_id?: string
          personal_message?: string | null
          resource_grants?: Json | null
          role_id?: string | null
          status?: string | null
          target_app?: string | null
          token?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_target_app_fkey"
            columns: ["target_app"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_target_app_fkey"
            columns: ["target_app"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          brevo_contact_id: string | null
          company: string | null
          conversion_goal: string | null
          converted_at: string | null
          converted_to_org_id: string | null
          converted_to_user_id: string | null
          created_at: string | null
          email: string
          first_action: Json | null
          first_calculation_id: string | null
          first_name: string | null
          id: string
          interested_in: string[] | null
          landing_page: string | null
          last_activity_at: string | null
          last_contact_at: string | null
          last_name: string | null
          lead_score: number | null
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          property_count: string | null
          referrer: string | null
          source: string | null
          source_app: string | null
          source_domain: string | null
          source_tool: string | null
          source_url: string | null
          status: string | null
          tags: string[] | null
          total_calculations: number | null
          total_documents: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          assigned_to?: string | null
          brevo_contact_id?: string | null
          company?: string | null
          conversion_goal?: string | null
          converted_at?: string | null
          converted_to_org_id?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email: string
          first_action?: Json | null
          first_calculation_id?: string | null
          first_name?: string | null
          id?: string
          interested_in?: string[] | null
          landing_page?: string | null
          last_activity_at?: string | null
          last_contact_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          property_count?: string | null
          referrer?: string | null
          source?: string | null
          source_app?: string | null
          source_domain?: string | null
          source_tool?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          total_calculations?: number | null
          total_documents?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          assigned_to?: string | null
          brevo_contact_id?: string | null
          company?: string | null
          conversion_goal?: string | null
          converted_at?: string | null
          converted_to_org_id?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          email?: string
          first_action?: Json | null
          first_calculation_id?: string | null
          first_name?: string | null
          id?: string
          interested_in?: string[] | null
          landing_page?: string | null
          last_activity_at?: string | null
          last_contact_at?: string | null
          last_name?: string | null
          lead_score?: number | null
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          property_count?: string | null
          referrer?: string | null
          source?: string | null
          source_app?: string | null
          source_domain?: string | null
          source_tool?: string | null
          source_url?: string | null
          status?: string | null
          tags?: string[] | null
          total_calculations?: number | null
          total_documents?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_converted_to_org_id_fkey"
            columns: ["converted_to_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_contracts: {
        Row: {
          base_rent: number
          building_id: string
          contract_date: string | null
          contract_document_id: string | null
          contract_number: string | null
          created_at: string | null
          deposit_account_number: string | null
          deposit_amount: number | null
          deposit_paid: number | null
          deposit_returned: boolean | null
          deposit_returned_amount: number | null
          deposit_returned_date: string | null
          deposit_type: string | null
          earliest_termination_date: string | null
          end_date: string | null
          heating_prepayment: number | null
          id: string
          is_indefinite: boolean | null
          last_rent_adjustment_date: string | null
          move_out_date: string | null
          notice_period_landlord_months: number | null
          notice_period_months: number | null
          number_of_persons: number | null
          org_id: string
          other_costs: number | null
          payment_due_day: number | null
          payment_method: string | null
          pets_allowed: boolean | null
          rent_adjustment_details: Json | null
          rent_adjustment_index: string | null
          rent_adjustment_type: string | null
          smoking_allowed: boolean | null
          special_agreements: string | null
          start_date: string
          status: string | null
          subletting_allowed: boolean | null
          tenant_id: string
          termination_by: string | null
          termination_date: string | null
          termination_document_id: string | null
          termination_reason: string | null
          termination_received_date: string | null
          total_rent: number | null
          unit_id: string
          updated_at: string | null
          utility_prepayment: number | null
        }
        Insert: {
          base_rent: number
          building_id: string
          contract_date?: string | null
          contract_document_id?: string | null
          contract_number?: string | null
          created_at?: string | null
          deposit_account_number?: string | null
          deposit_amount?: number | null
          deposit_paid?: number | null
          deposit_returned?: boolean | null
          deposit_returned_amount?: number | null
          deposit_returned_date?: string | null
          deposit_type?: string | null
          earliest_termination_date?: string | null
          end_date?: string | null
          heating_prepayment?: number | null
          id?: string
          is_indefinite?: boolean | null
          last_rent_adjustment_date?: string | null
          move_out_date?: string | null
          notice_period_landlord_months?: number | null
          notice_period_months?: number | null
          number_of_persons?: number | null
          org_id: string
          other_costs?: number | null
          payment_due_day?: number | null
          payment_method?: string | null
          pets_allowed?: boolean | null
          rent_adjustment_details?: Json | null
          rent_adjustment_index?: string | null
          rent_adjustment_type?: string | null
          smoking_allowed?: boolean | null
          special_agreements?: string | null
          start_date: string
          status?: string | null
          subletting_allowed?: boolean | null
          tenant_id: string
          termination_by?: string | null
          termination_date?: string | null
          termination_document_id?: string | null
          termination_reason?: string | null
          termination_received_date?: string | null
          total_rent?: number | null
          unit_id: string
          updated_at?: string | null
          utility_prepayment?: number | null
        }
        Update: {
          base_rent?: number
          building_id?: string
          contract_date?: string | null
          contract_document_id?: string | null
          contract_number?: string | null
          created_at?: string | null
          deposit_account_number?: string | null
          deposit_amount?: number | null
          deposit_paid?: number | null
          deposit_returned?: boolean | null
          deposit_returned_amount?: number | null
          deposit_returned_date?: string | null
          deposit_type?: string | null
          earliest_termination_date?: string | null
          end_date?: string | null
          heating_prepayment?: number | null
          id?: string
          is_indefinite?: boolean | null
          last_rent_adjustment_date?: string | null
          move_out_date?: string | null
          notice_period_landlord_months?: number | null
          notice_period_months?: number | null
          number_of_persons?: number | null
          org_id?: string
          other_costs?: number | null
          payment_due_day?: number | null
          payment_method?: string | null
          pets_allowed?: boolean | null
          rent_adjustment_details?: Json | null
          rent_adjustment_index?: string | null
          rent_adjustment_type?: string | null
          smoking_allowed?: boolean | null
          special_agreements?: string | null
          start_date?: string
          status?: string | null
          subletting_allowed?: boolean | null
          tenant_id?: string
          termination_by?: string | null
          termination_date?: string | null
          termination_document_id?: string | null
          termination_reason?: string | null
          termination_received_date?: string | null
          total_rent?: number | null
          unit_id?: string
          updated_at?: string | null
          utility_prepayment?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "lease_contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      letter_orders: {
        Row: {
          content_pdf_url: string | null
          content_text: string | null
          content_type: string
          created_at: string | null
          currency: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          is_color: boolean | null
          is_duplex: boolean | null
          letterxpress_order_id: string | null
          letterxpress_status: string | null
          page_count: number | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          price_cents: number
          recipient_city: string
          recipient_company: string | null
          recipient_country: string | null
          recipient_name: string
          recipient_street: string
          recipient_zip: string
          sender_city: string | null
          sender_country: string | null
          sender_name: string | null
          sender_street: string | null
          sender_zip: string | null
          sent_at: string | null
          shipping_type: string
          status: string | null
          template_data: Json | null
          template_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_pdf_url?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          is_color?: boolean | null
          is_duplex?: boolean | null
          letterxpress_order_id?: string | null
          letterxpress_status?: string | null
          page_count?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          price_cents: number
          recipient_city: string
          recipient_company?: string | null
          recipient_country?: string | null
          recipient_name: string
          recipient_street: string
          recipient_zip: string
          sender_city?: string | null
          sender_country?: string | null
          sender_name?: string | null
          sender_street?: string | null
          sender_zip?: string | null
          sent_at?: string | null
          shipping_type: string
          status?: string | null
          template_data?: Json | null
          template_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_pdf_url?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string | null
          currency?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          is_color?: boolean | null
          is_duplex?: boolean | null
          letterxpress_order_id?: string | null
          letterxpress_status?: string | null
          page_count?: number | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          price_cents?: number
          recipient_city?: string
          recipient_company?: string | null
          recipient_country?: string | null
          recipient_name?: string
          recipient_street?: string
          recipient_zip?: string
          sender_city?: string | null
          sender_country?: string | null
          sender_name?: string | null
          sender_street?: string | null
          sender_zip?: string | null
          sent_at?: string | null
          shipping_type?: string
          status?: string | null
          template_data?: Json | null
          template_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          building_id: string | null
          caretaker_owner_id: string | null
          completed_at: string | null
          completion_notes: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          is_recurring: boolean | null
          material_cost: number | null
          notes: string | null
          org_id: string | null
          parent_task_id: string | null
          priority: string
          recurrence_rule: Json | null
          scheduled_date: string | null
          source_id: string | null
          source_type: string | null
          started_at: string | null
          status: string
          target_type: string | null
          target_user_id: string | null
          task_type: string | null
          tenant_id: string | null
          time_spent_minutes: number | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          building_id?: string | null
          caretaker_owner_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_recurring?: boolean | null
          material_cost?: number | null
          notes?: string | null
          org_id?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_rule?: Json | null
          scheduled_date?: string | null
          source_id?: string | null
          source_type?: string | null
          started_at?: string | null
          status?: string
          target_type?: string | null
          target_user_id?: string | null
          task_type?: string | null
          tenant_id?: string | null
          time_spent_minutes?: number | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          building_id?: string | null
          caretaker_owner_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_recurring?: boolean | null
          material_cost?: number | null
          notes?: string | null
          org_id?: string | null
          parent_task_id?: string | null
          priority?: string
          recurrence_rule?: Json | null
          scheduled_date?: string | null
          source_id?: string | null
          source_type?: string | null
          started_at?: string | null
          status?: string
          target_type?: string | null
          target_user_id?: string | null
          task_type?: string | null
          tenant_id?: string | null
          time_spent_minutes?: number | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      material_entries: {
        Row: {
          building_id: string | null
          created_at: string | null
          id: string
          material_category: string | null
          material_name: string
          org_id: string | null
          purchase_date: string | null
          quantity: number
          receipt_number: string | null
          receipt_photo_url: string | null
          recorded_by: string | null
          supplier: string | null
          task_id: string | null
          total_price: number | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          material_category?: string | null
          material_name: string
          org_id?: string | null
          purchase_date?: string | null
          quantity?: number
          receipt_number?: string | null
          receipt_photo_url?: string | null
          recorded_by?: string | null
          supplier?: string | null
          task_id?: string | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          material_category?: string | null
          material_name?: string
          org_id?: string | null
          purchase_date?: string | null
          quantity?: number
          receipt_number?: string | null
          receipt_photo_url?: string | null
          recorded_by?: string | null
          supplier?: string | null
          task_id?: string | null
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "material_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          attachment_type: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          message_id: string
          mime_type: string | null
          thumbnail_url: string | null
          width: number | null
        }
        Insert: {
          attachment_type?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          message_id: string
          mime_type?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Update: {
          attachment_type?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          message_id?: string
          mime_type?: string | null
          thumbnail_url?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          content_type: string | null
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          edited_at: string | null
          id: string
          mentions: Json | null
          metadata: Json | null
          original_content: string | null
          reply_preview: string | null
          reply_to_id: string | null
          sender_app: string | null
          sender_id: string
          sender_name: string | null
          sender_type: string | null
          status_change: Json | null
        }
        Insert: {
          content: string
          content_type?: string | null
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          mentions?: Json | null
          metadata?: Json | null
          original_content?: string | null
          reply_preview?: string | null
          reply_to_id?: string | null
          sender_app?: string | null
          sender_id: string
          sender_name?: string | null
          sender_type?: string | null
          status_change?: Json | null
        }
        Update: {
          content?: string
          content_type?: string | null
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          id?: string
          mentions?: Json | null
          metadata?: Json | null
          original_content?: string | null
          reply_preview?: string | null
          reply_to_id?: string | null
          sender_app?: string | null
          sender_id?: string
          sender_name?: string | null
          sender_type?: string | null
          status_change?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_my_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["chat_conversation_id"]
          },
          {
            foreignKeyName: "messages_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_readings: {
        Row: {
          ai_display_type_detected: string | null
          ai_image_quality: string | null
          ai_meter_type_detected: string | null
          app_variant: string | null
          building_id: string | null
          calculated_cost: number | null
          calculated_cost_breakdown: Json | null
          calculated_kwh: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          consumption: number | null
          consumption_period_days: number | null
          conversion_factors: Json | null
          created_at: string | null
          due_date: string | null
          efficiency_value: number | null
          energy_contract_id: string | null
          id: string
          meter_location: string | null
          meter_number: string | null
          meter_type: string
          notes: string | null
          offline_created_at: string | null
          org_id: string
          photo_url: string | null
          previous_reading_id: string | null
          reading_date: string
          reading_unit: string | null
          reading_value: number
          reading_value_2: number | null
          reading_value_2_label: string | null
          requested_at: string | null
          status: string | null
          submitted_by_user_id: string | null
          sync_status: string | null
          unit_id: string | null
          updated_at: string | null
          weather_data: Json | null
        }
        Insert: {
          ai_display_type_detected?: string | null
          ai_image_quality?: string | null
          ai_meter_type_detected?: string | null
          app_variant?: string | null
          building_id?: string | null
          calculated_cost?: number | null
          calculated_cost_breakdown?: Json | null
          calculated_kwh?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          consumption?: number | null
          consumption_period_days?: number | null
          conversion_factors?: Json | null
          created_at?: string | null
          due_date?: string | null
          efficiency_value?: number | null
          energy_contract_id?: string | null
          id?: string
          meter_location?: string | null
          meter_number?: string | null
          meter_type: string
          notes?: string | null
          offline_created_at?: string | null
          org_id: string
          photo_url?: string | null
          previous_reading_id?: string | null
          reading_date: string
          reading_unit?: string | null
          reading_value: number
          reading_value_2?: number | null
          reading_value_2_label?: string | null
          requested_at?: string | null
          status?: string | null
          submitted_by_user_id?: string | null
          sync_status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          weather_data?: Json | null
        }
        Update: {
          ai_display_type_detected?: string | null
          ai_image_quality?: string | null
          ai_meter_type_detected?: string | null
          app_variant?: string | null
          building_id?: string | null
          calculated_cost?: number | null
          calculated_cost_breakdown?: Json | null
          calculated_kwh?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          consumption?: number | null
          consumption_period_days?: number | null
          conversion_factors?: Json | null
          created_at?: string | null
          due_date?: string | null
          efficiency_value?: number | null
          energy_contract_id?: string | null
          id?: string
          meter_location?: string | null
          meter_number?: string | null
          meter_type?: string
          notes?: string | null
          offline_created_at?: string | null
          org_id?: string
          photo_url?: string | null
          previous_reading_id?: string | null
          reading_date?: string
          reading_unit?: string | null
          reading_value?: number
          reading_value_2?: number | null
          reading_value_2_label?: string | null
          requested_at?: string | null
          status?: string | null
          submitted_by_user_id?: string | null
          sync_status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_readings_energy_contract"
            columns: ["energy_contract_id"]
            isOneToOne: false
            referencedRelation: "user_energy_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_readings_energy_contract"
            columns: ["energy_contract_id"]
            isOneToOne: false
            referencedRelation: "v_current_tariffs"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "meter_readings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_types_registry: {
        Row: {
          available_in_apps: string[] | null
          category: string
          conversion_info: string | null
          created_at: string | null
          decimal_places: number | null
          default_tariff_components: Json | null
          description: string | null
          direction: string | null
          icon: string | null
          id: string
          input_unit: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          name_short: string | null
          ocr_supported: boolean | null
          output_unit: string | null
          related_meter_type_id: string | null
          required_for_efficiency: boolean | null
          requires_conversion: boolean | null
          requires_second_reading: boolean | null
          second_reading_label: string | null
          sort_order: number | null
          typical_display_types: string[] | null
          typical_monthly_max: number | null
          typical_monthly_min: number | null
          typical_unit: string | null
          updated_at: string | null
        }
        Insert: {
          available_in_apps?: string[] | null
          category: string
          conversion_info?: string | null
          created_at?: string | null
          decimal_places?: number | null
          default_tariff_components?: Json | null
          description?: string | null
          direction?: string | null
          icon?: string | null
          id: string
          input_unit: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          name_short?: string | null
          ocr_supported?: boolean | null
          output_unit?: string | null
          related_meter_type_id?: string | null
          required_for_efficiency?: boolean | null
          requires_conversion?: boolean | null
          requires_second_reading?: boolean | null
          second_reading_label?: string | null
          sort_order?: number | null
          typical_display_types?: string[] | null
          typical_monthly_max?: number | null
          typical_monthly_min?: number | null
          typical_unit?: string | null
          updated_at?: string | null
        }
        Update: {
          available_in_apps?: string[] | null
          category?: string
          conversion_info?: string | null
          created_at?: string | null
          decimal_places?: number | null
          default_tariff_components?: Json | null
          description?: string | null
          direction?: string | null
          icon?: string | null
          id?: string
          input_unit?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          name_short?: string | null
          ocr_supported?: boolean | null
          output_unit?: string | null
          related_meter_type_id?: string | null
          required_for_efficiency?: boolean | null
          requires_conversion?: boolean | null
          requires_second_reading?: boolean | null
          second_reading_label?: string | null
          sort_order?: number | null
          typical_display_types?: string[] | null
          typical_monthly_max?: number | null
          typical_monthly_min?: number | null
          typical_unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meters: {
        Row: {
          app_variant: string | null
          building_id: string
          calibration_date: string | null
          caretaker_owner_id: string | null
          created_at: string | null
          created_by: string | null
          direction: string | null
          display_color: string | null
          display_icon: string | null
          display_name: string | null
          energy_contract_id: string | null
          id: string
          installation_date: string | null
          is_active: boolean | null
          last_reading_date: string | null
          last_reading_value: number | null
          manufacturer: string | null
          metadata: Json | null
          meter_location: string | null
          meter_number: string
          meter_subtype: string | null
          meter_type: string
          meter_type_registry_id: string | null
          meter_unit: string | null
          model: string | null
          next_calibration_date: string | null
          next_reminder_date: string | null
          notes: string | null
          org_id: string | null
          related_meter_id: string | null
          reminder_enabled: boolean | null
          reminder_interval_days: number | null
          serial_number: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          app_variant?: string | null
          building_id: string
          calibration_date?: string | null
          caretaker_owner_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          display_color?: string | null
          display_icon?: string | null
          display_name?: string | null
          energy_contract_id?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_reading_date?: string | null
          last_reading_value?: number | null
          manufacturer?: string | null
          metadata?: Json | null
          meter_location?: string | null
          meter_number: string
          meter_subtype?: string | null
          meter_type: string
          meter_type_registry_id?: string | null
          meter_unit?: string | null
          model?: string | null
          next_calibration_date?: string | null
          next_reminder_date?: string | null
          notes?: string | null
          org_id?: string | null
          related_meter_id?: string | null
          reminder_enabled?: boolean | null
          reminder_interval_days?: number | null
          serial_number?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          app_variant?: string | null
          building_id?: string
          calibration_date?: string | null
          caretaker_owner_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string | null
          display_color?: string | null
          display_icon?: string | null
          display_name?: string | null
          energy_contract_id?: string | null
          id?: string
          installation_date?: string | null
          is_active?: boolean | null
          last_reading_date?: string | null
          last_reading_value?: number | null
          manufacturer?: string | null
          metadata?: Json | null
          meter_location?: string | null
          meter_number?: string
          meter_subtype?: string | null
          meter_type?: string
          meter_type_registry_id?: string | null
          meter_unit?: string | null
          model?: string | null
          next_calibration_date?: string | null
          next_reminder_date?: string | null
          notes?: string | null
          org_id?: string | null
          related_meter_id?: string | null
          reminder_enabled?: boolean | null
          reminder_interval_days?: number | null
          serial_number?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_meters_energy_contract"
            columns: ["energy_contract_id"]
            isOneToOne: false
            referencedRelation: "user_energy_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_meters_energy_contract"
            columns: ["energy_contract_id"]
            isOneToOne: false
            referencedRelation: "v_current_tariffs"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "meters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_related_meter_fk"
            columns: ["related_meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_related_meter_fk"
            columns: ["related_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_last_reading"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_related_meter_fk"
            columns: ["related_meter_id"]
            isOneToOne: false
            referencedRelation: "v_meters_with_readings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_related_meter_fk"
            columns: ["related_meter_id"]
            isOneToOne: false
            referencedRelation: "v_monthly_consumption"
            referencedColumns: ["meter_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      mieter_building_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          left_at: string | null
          mieter_building_id: string
          role: string | null
          status: string | null
          unit_description: string | null
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          left_at?: string | null
          mieter_building_id: string
          role?: string | null
          status?: string | null
          unit_description?: string | null
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          left_at?: string | null
          mieter_building_id?: string
          role?: string | null
          status?: string | null
          unit_description?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mieter_building_members_mieter_building_id_fkey"
            columns: ["mieter_building_id"]
            isOneToOne: false
            referencedRelation: "mieter_buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      mieter_buildings: {
        Row: {
          building_type: string | null
          city: string
          community_enabled: boolean | null
          country: string | null
          created_at: string | null
          created_by_user_id: string
          estimated_units: number | null
          house_number: string
          id: string
          member_count: number | null
          photo_url: string | null
          post_count: number | null
          requires_approval: boolean | null
          street: string
          updated_at: string | null
          zip: string
        }
        Insert: {
          building_type?: string | null
          city: string
          community_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          created_by_user_id: string
          estimated_units?: number | null
          house_number: string
          id?: string
          member_count?: number | null
          photo_url?: string | null
          post_count?: number | null
          requires_approval?: boolean | null
          street: string
          updated_at?: string | null
          zip: string
        }
        Update: {
          building_type?: string | null
          city?: string
          community_enabled?: boolean | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string
          estimated_units?: number | null
          house_number?: string
          id?: string
          member_count?: number | null
          photo_url?: string | null
          post_count?: number | null
          requires_approval?: boolean | null
          street?: string
          updated_at?: string | null
          zip?: string
        }
        Relationships: []
      }
      mietpreisbremse_docs: {
        Row: {
          ausnahme_begruendung: string | null
          ausnahme_grund: string | null
          dokument_erstellt: boolean | null
          dokument_id: string | null
          geplante_miete: number | null
          geprueft_am: string | null
          gilt_mietpreisbremse: boolean
          gueltig_bis: string | null
          id: string
          max_miete_gesamt: number | null
          max_miete_pro_qm: number | null
          miete_zulaessig: boolean | null
          mietspiegel_wert: number | null
          plz: string
          property_id: string
          updated_at: string | null
          user_id: string
          verordnung: string | null
        }
        Insert: {
          ausnahme_begruendung?: string | null
          ausnahme_grund?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          geplante_miete?: number | null
          geprueft_am?: string | null
          gilt_mietpreisbremse: boolean
          gueltig_bis?: string | null
          id?: string
          max_miete_gesamt?: number | null
          max_miete_pro_qm?: number | null
          miete_zulaessig?: boolean | null
          mietspiegel_wert?: number | null
          plz: string
          property_id: string
          updated_at?: string | null
          user_id: string
          verordnung?: string | null
        }
        Update: {
          ausnahme_begruendung?: string | null
          ausnahme_grund?: string | null
          dokument_erstellt?: boolean | null
          dokument_id?: string | null
          geplante_miete?: number | null
          geprueft_am?: string | null
          gilt_mietpreisbremse?: boolean
          gueltig_bis?: string | null
          id?: string
          max_miete_gesamt?: number | null
          max_miete_pro_qm?: number | null
          miete_zulaessig?: boolean | null
          mietspiegel_wert?: number | null
          plz?: string
          property_id?: string
          updated_at?: string | null
          user_id?: string
          verordnung?: string | null
        }
        Relationships: []
      }
      mietpreisbremse_gebiete: {
        Row: {
          bundesland: string
          created_at: string | null
          gilt: boolean
          gueltig_bis: string | null
          id: string
          plz_bis: string | null
          plz_prefix: string
          plz_von: string | null
          quelle: string | null
          stadt_gemeinde: string | null
          updated_at: string | null
          verordnung_datum: string | null
          verordnung_name: string | null
        }
        Insert: {
          bundesland: string
          created_at?: string | null
          gilt?: boolean
          gueltig_bis?: string | null
          id?: string
          plz_bis?: string | null
          plz_prefix: string
          plz_von?: string | null
          quelle?: string | null
          stadt_gemeinde?: string | null
          updated_at?: string | null
          verordnung_datum?: string | null
          verordnung_name?: string | null
        }
        Update: {
          bundesland?: string
          created_at?: string | null
          gilt?: boolean
          gueltig_bis?: string | null
          id?: string
          plz_bis?: string | null
          plz_prefix?: string
          plz_von?: string | null
          quelle?: string | null
          stadt_gemeinde?: string | null
          updated_at?: string | null
          verordnung_datum?: string | null
          verordnung_name?: string | null
        }
        Relationships: []
      }
      mietrecht_chats: {
        Row: {
          created_at: string | null
          id: string
          lawyer_referral_requested: boolean | null
          lawyer_referral_sent_at: string | null
          linked_tool_id: string | null
          linked_tool_type: string | null
          messages: Json
          premium_analysis_price_cents: number | null
          premium_analysis_purchased: boolean | null
          status: string | null
          title: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lawyer_referral_requested?: boolean | null
          lawyer_referral_sent_at?: string | null
          linked_tool_id?: string | null
          linked_tool_type?: string | null
          messages?: Json
          premium_analysis_price_cents?: number | null
          premium_analysis_purchased?: boolean | null
          status?: string | null
          title?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lawyer_referral_requested?: boolean | null
          lawyer_referral_sent_at?: string | null
          linked_tool_id?: string | null
          linked_tool_type?: string | null
          messages?: Json
          premium_analysis_price_cents?: number | null
          premium_analysis_purchased?: boolean | null
          status?: string | null
          title?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          app_id: string | null
          category: string | null
          channels: string[] | null
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          org_id: string | null
          priority: string | null
          push_sent: boolean | null
          push_sent_at: string | null
          read_at: string | null
          source_id: string | null
          source_type: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          app_id?: string | null
          category?: string | null
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type?: string
          org_id?: string | null
          priority?: string | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          app_id?: string | null
          category?: string | null
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          org_id?: string | null
          priority?: string | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_cost_items: {
        Row: {
          allocation_key: string
          base_cost_amount: number | null
          betrkv_number: string | null
          category: string | null
          consumption_cost_amount: number | null
          consumption_unit: string | null
          cost_type_id: string
          cost_type_name: string
          created_at: string | null
          has_warning: boolean | null
          id: string
          invoice_ids: string[] | null
          invoice_references: string[] | null
          is_heating_cost: boolean | null
          notes: string | null
          sort_order: number | null
          statement_id: string
          total_amount: number
          total_consumption: number | null
          updated_at: string | null
          warning_acknowledged: boolean | null
          warning_acknowledged_at: string | null
        }
        Insert: {
          allocation_key?: string
          base_cost_amount?: number | null
          betrkv_number?: string | null
          category?: string | null
          consumption_cost_amount?: number | null
          consumption_unit?: string | null
          cost_type_id: string
          cost_type_name: string
          created_at?: string | null
          has_warning?: boolean | null
          id?: string
          invoice_ids?: string[] | null
          invoice_references?: string[] | null
          is_heating_cost?: boolean | null
          notes?: string | null
          sort_order?: number | null
          statement_id: string
          total_amount: number
          total_consumption?: number | null
          updated_at?: string | null
          warning_acknowledged?: boolean | null
          warning_acknowledged_at?: string | null
        }
        Update: {
          allocation_key?: string
          base_cost_amount?: number | null
          betrkv_number?: string | null
          category?: string | null
          consumption_cost_amount?: number | null
          consumption_unit?: string | null
          cost_type_id?: string
          cost_type_name?: string
          created_at?: string | null
          has_warning?: boolean | null
          id?: string
          invoice_ids?: string[] | null
          invoice_references?: string[] | null
          is_heating_cost?: boolean | null
          notes?: string | null
          sort_order?: number | null
          statement_id?: string
          total_amount?: number
          total_consumption?: number | null
          updated_at?: string | null
          warning_acknowledged?: boolean | null
          warning_acknowledged_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_items_cost_type_id_fkey"
            columns: ["cost_type_id"]
            isOneToOne: false
            referencedRelation: "cost_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_items_cost_type_id_fkey"
            columns: ["cost_type_id"]
            isOneToOne: false
            referencedRelation: "v_cost_type_usage"
            referencedColumns: ["cost_type_id"]
          },
          {
            foreignKeyName: "operating_cost_items_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "operating_cost_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_items_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_building_summary"
            referencedColumns: ["statement_id"]
          },
          {
            foreignKeyName: "operating_cost_items_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_items_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_cost_statements: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          building_id: string
          calculated_at: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          draft_data: Json | null
          heating_base_percentage: number | null
          heating_consumption_percentage: number | null
          id: string
          internal_notes: string | null
          last_step_completed: number | null
          notes: string | null
          org_id: string
          period_end: string
          period_start: string
          previous_statement_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selected_unit_ids: string[]
          sent_at: string | null
          source_app: string | null
          status: string | null
          total_costs: number | null
          total_persons: number | null
          total_prepayments: number | null
          total_result: number | null
          total_sqm: number | null
          total_units: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          building_id: string
          calculated_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          draft_data?: Json | null
          heating_base_percentage?: number | null
          heating_consumption_percentage?: number | null
          id?: string
          internal_notes?: string | null
          last_step_completed?: number | null
          notes?: string | null
          org_id: string
          period_end: string
          period_start: string
          previous_statement_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_unit_ids: string[]
          sent_at?: string | null
          source_app?: string | null
          status?: string | null
          total_costs?: number | null
          total_persons?: number | null
          total_prepayments?: number | null
          total_result?: number | null
          total_sqm?: number | null
          total_units?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          building_id?: string
          calculated_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          draft_data?: Json | null
          heating_base_percentage?: number | null
          heating_consumption_percentage?: number | null
          id?: string
          internal_notes?: string | null
          last_step_completed?: number | null
          notes?: string | null
          org_id?: string
          period_end?: string
          period_start?: string
          previous_statement_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_unit_ids?: string[]
          sent_at?: string | null
          source_app?: string | null
          status?: string | null
          total_costs?: number | null
          total_persons?: number | null
          total_prepayments?: number | null
          total_result?: number | null
          total_sqm?: number | null
          total_units?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "operating_cost_statements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "operating_cost_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_building_summary"
            referencedColumns: ["statement_id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_cost_tenant_results: {
        Row: {
          amount_paid: number | null
          cost_details: Json
          cost_difference: number | null
          cost_difference_percent: number | null
          created_at: string | null
          day_factor: number
          days_in_period: number
          effective_end: string
          effective_start: string
          email_recipient: string | null
          email_sent_at: string | null
          id: string
          is_vacancy: boolean | null
          lease_contract_id: string | null
          letter_cost: number | null
          letter_sent_at: string | null
          letter_tracking_id: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          payment_status: string | null
          pdf_generated_at: string | null
          pdf_url: string | null
          persons_count: number | null
          previous_result: number | null
          previous_total_costs: number | null
          result: number
          sent_via: string | null
          statement_id: string
          suggested_new_prepayment: number | null
          tenant_id: string | null
          tenant_notes: string | null
          tenant_response: string | null
          tenant_response_at: string | null
          total_costs: number
          total_prepayments: number
          unit_id: string
          unit_sqm: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          cost_details?: Json
          cost_difference?: number | null
          cost_difference_percent?: number | null
          created_at?: string | null
          day_factor: number
          days_in_period: number
          effective_end: string
          effective_start: string
          email_recipient?: string | null
          email_sent_at?: string | null
          id?: string
          is_vacancy?: boolean | null
          lease_contract_id?: string | null
          letter_cost?: number | null
          letter_sent_at?: string | null
          letter_tracking_id?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          payment_status?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          persons_count?: number | null
          previous_result?: number | null
          previous_total_costs?: number | null
          result: number
          sent_via?: string | null
          statement_id: string
          suggested_new_prepayment?: number | null
          tenant_id?: string | null
          tenant_notes?: string | null
          tenant_response?: string | null
          tenant_response_at?: string | null
          total_costs: number
          total_prepayments?: number
          unit_id: string
          unit_sqm?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          cost_details?: Json
          cost_difference?: number | null
          cost_difference_percent?: number | null
          created_at?: string | null
          day_factor?: number
          days_in_period?: number
          effective_end?: string
          effective_start?: string
          email_recipient?: string | null
          email_sent_at?: string | null
          id?: string
          is_vacancy?: boolean | null
          lease_contract_id?: string | null
          letter_cost?: number | null
          letter_sent_at?: string | null
          letter_tracking_id?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          payment_status?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          persons_count?: number | null
          previous_result?: number | null
          previous_total_costs?: number | null
          result?: number
          sent_via?: string | null
          statement_id?: string
          suggested_new_prepayment?: number | null
          tenant_id?: string | null
          tenant_notes?: string | null
          tenant_response?: string | null
          tenant_response_at?: string | null
          total_costs?: number
          total_prepayments?: number
          unit_id?: string
          unit_sqm?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_tenant_results_lease_contract_id_fkey"
            columns: ["lease_contract_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_lease_contract_id_fkey"
            columns: ["lease_contract_id"]
            isOneToOne: false
            referencedRelation: "v_active_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_lease_contract_id_fkey"
            columns: ["lease_contract_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["lease_id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_lease_contract_id_fkey"
            columns: ["lease_contract_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_lease_id_calc"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "operating_cost_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_building_summary"
            referencedColumns: ["statement_id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "operating_cost_tenant_results_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      org_memberships: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          job_title: string | null
          org_id: string
          role: string
          status: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          job_title?: string | null
          org_id: string
          role?: string
          status?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          job_title?: string | null
          org_id?: string
          role?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          house_number: string | null
          id: string
          logo_url: string | null
          name: string
          partner_id: string | null
          phone: string | null
          primary_color: string | null
          referral_code_used: string | null
          settings: Json | null
          slug: string
          status: string | null
          street: string | null
          stripe_customer_id: string | null
          tax_id: string | null
          type: string
          updated_at: string | null
          vat_id: string | null
          website: string | null
          white_label_source: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          house_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          partner_id?: string | null
          phone?: string | null
          primary_color?: string | null
          referral_code_used?: string | null
          settings?: Json | null
          slug: string
          status?: string | null
          street?: string | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          vat_id?: string | null
          website?: string | null
          white_label_source?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          house_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          partner_id?: string | null
          phone?: string | null
          primary_color?: string | null
          referral_code_used?: string | null
          settings?: Json | null
          slug?: string
          status?: string | null
          street?: string | null
          stripe_customer_id?: string | null
          tax_id?: string | null
          type?: string
          updated_at?: string | null
          vat_id?: string | null
          website?: string | null
          white_label_source?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      package_notifications: {
        Row: {
          accepted_by_user_id: string
          building_id: string | null
          carrier: string | null
          created_at: string | null
          description: string | null
          id: string
          mieter_building_id: string | null
          notified_at: string | null
          photo_url: string | null
          picked_up_at: string | null
          picked_up_confirmed_by: string | null
          recipient_unit: string
          recipient_user_id: string | null
          reminder_sent_at: string | null
          status: string | null
        }
        Insert: {
          accepted_by_user_id: string
          building_id?: string | null
          carrier?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          mieter_building_id?: string | null
          notified_at?: string | null
          photo_url?: string | null
          picked_up_at?: string | null
          picked_up_confirmed_by?: string | null
          recipient_unit: string
          recipient_user_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_by_user_id?: string
          building_id?: string | null
          carrier?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          mieter_building_id?: string | null
          notified_at?: string | null
          photo_url?: string | null
          picked_up_at?: string | null
          picked_up_confirmed_by?: string | null
          recipient_unit?: string
          recipient_user_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_notifications_mieter_building_id_fkey"
            columns: ["mieter_building_id"]
            isOneToOne: false
            referencedRelation: "mieter_buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_api_keys: {
        Row: {
          allowed_ips: string[] | null
          allowed_origins: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_test_key: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          last_used_ip: unknown
          name: string
          partner_id: string
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          scopes: string[] | null
          usage_count: number | null
        }
        Insert: {
          allowed_ips?: string[] | null
          allowed_origins?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_test_key?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          last_used_ip?: unknown
          name: string
          partner_id: string
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          scopes?: string[] | null
          usage_count?: number | null
        }
        Update: {
          allowed_ips?: string[] | null
          allowed_origins?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_test_key?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          last_used_ip?: unknown
          name?: string
          partner_id?: string
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          scopes?: string[] | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_billing: {
        Row: {
          base_amount: number | null
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          id: string
          internal_notes: string | null
          invoice_date: string | null
          invoice_due_date: string | null
          invoice_number: string | null
          invoice_pdf_url: string | null
          line_items: Json | null
          metrics_snapshot: Json
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          partner_id: string
          payment_method: string | null
          period_end: string
          period_start: string
          period_type: string | null
          sent_at: string | null
          status: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          updated_at: string | null
          usage_amount: number | null
        }
        Insert: {
          base_amount?: number | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_due_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          line_items?: Json | null
          metrics_snapshot?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          partner_id: string
          payment_method?: string | null
          period_end: string
          period_start: string
          period_type?: string | null
          sent_at?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
          updated_at?: string | null
          usage_amount?: number | null
        }
        Update: {
          base_amount?: number | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string | null
          invoice_due_date?: string | null
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          line_items?: Json | null
          metrics_snapshot?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          partner_id?: string
          payment_method?: string | null
          period_end?: string
          period_start?: string
          period_type?: string | null
          sent_at?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          updated_at?: string | null
          usage_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_billing_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_billing_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_billing_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commissions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          currency: string | null
          gross_amount: number
          id: string
          organization_id: string | null
          paid_at: string | null
          partner_id: string
          payout_id: string | null
          period_end: string | null
          period_start: string | null
          source_id: string | null
          source_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          currency?: string | null
          gross_amount: number
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          partner_id: string
          payout_id?: string | null
          period_end?: string | null
          period_start?: string | null
          source_id?: string | null
          source_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          currency?: string | null
          gross_amount?: number
          id?: string
          organization_id?: string | null
          paid_at?: string | null
          partner_id?: string
          payout_id?: string | null
          period_end?: string | null
          period_start?: string | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          commission_end_date: string | null
          commission_paid_through: string | null
          commission_rate: number | null
          commission_start_date: string | null
          created_at: string | null
          ended_at: string | null
          id: string
          notes: string | null
          organization_id: string
          partner_id: string
          referral_code_used: string | null
          relationship_type: string
          source: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          commission_end_date?: string | null
          commission_paid_through?: string | null
          commission_rate?: number | null
          commission_start_date?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          partner_id: string
          referral_code_used?: string | null
          relationship_type?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          commission_end_date?: string | null
          commission_paid_through?: string | null
          commission_rate?: number | null
          commission_start_date?: string | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          partner_id?: string
          referral_code_used?: string | null
          relationship_type?: string
          source?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_organizations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_reference: string | null
          commission_count: number | null
          commission_ids: string[] | null
          created_at: string | null
          currency: string | null
          failed_at: string | null
          failure_reason: string | null
          fees_amount: number | null
          gross_amount: number
          id: string
          net_amount: number
          paid_at: string | null
          partner_id: string
          payment_method: string | null
          period_end: string
          period_start: string
          status: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_reference?: string | null
          commission_count?: number | null
          commission_ids?: string[] | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          fees_amount?: number | null
          gross_amount: number
          id?: string
          net_amount: number
          paid_at?: string | null
          partner_id: string
          payment_method?: string | null
          period_end: string
          period_start: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_reference?: string | null
          commission_count?: number | null
          commission_ids?: string[] | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          fees_amount?: number | null
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          partner_id?: string
          payment_method?: string | null
          period_end?: string
          period_start?: string
          status?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_users: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          partner_id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          partner_id: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          partner_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_users_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_users_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_users_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_failure_reason: string | null
          last_response_code: number | null
          last_sent_at: string | null
          last_success_at: string | null
          name: string
          partner_id: string
          retry_count: number | null
          secret_hash: string
          timeout_seconds: number | null
          total_failed: number | null
          total_sent: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_response_code?: number | null
          last_sent_at?: string | null
          last_success_at?: string | null
          name: string
          partner_id: string
          retry_count?: number | null
          secret_hash: string
          timeout_seconds?: number | null
          total_failed?: number | null
          total_sent?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_failure_reason?: string | null
          last_response_code?: number | null
          last_sent_at?: string | null
          last_success_at?: string | null
          name?: string
          partner_id?: string
          retry_count?: number | null
          secret_hash?: string
          timeout_seconds?: number | null
          total_failed?: number | null
          total_sent?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_webhooks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_webhooks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_affiliate_performance"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_webhooks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "v_partner_overview"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          account_manager_id: string | null
          activated_at: string | null
          billing_address_different: boolean | null
          billing_city: string | null
          billing_country: string | null
          billing_details: Json | null
          billing_email: string | null
          billing_model: string
          billing_street: string | null
          billing_zip: string | null
          branding: Json | null
          churn_reason: string | null
          churned_at: string | null
          city: string | null
          company_legal_form: string | null
          company_name: string
          contact_email: string
          contact_first_name: string | null
          contact_last_name: string | null
          contact_phone: string | null
          contact_position: string | null
          contract_document_url: string | null
          contract_end: string | null
          contract_notice_period: number | null
          contract_signed_at: string | null
          contract_signed_by: string | null
          contract_start: string | null
          contract_type: string
          country: string | null
          created_at: string | null
          domains: Json | null
          enabled_apps: string[] | null
          enabled_features: Json | null
          feature_limits: Json | null
          house_number: string | null
          id: string
          internal_notes: string | null
          linkedin_url: string | null
          metrics: Json | null
          name: string
          onboarding_completed: boolean | null
          onboarding_data: Json | null
          onboarding_step: number | null
          partner_type: string
          referral_code: string | null
          referral_commission_duration_months: number | null
          referral_commission_percent: number | null
          referral_cookie_days: number | null
          settings: Json | null
          slug: string
          state: string | null
          status: string | null
          street: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_payout_enabled: boolean | null
          suspended_at: string | null
          suspended_reason: string | null
          tags: string[] | null
          tax_id: string | null
          trade_register: string | null
          updated_at: string | null
          vat_id: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          account_manager_id?: string | null
          activated_at?: string | null
          billing_address_different?: boolean | null
          billing_city?: string | null
          billing_country?: string | null
          billing_details?: Json | null
          billing_email?: string | null
          billing_model?: string
          billing_street?: string | null
          billing_zip?: string | null
          branding?: Json | null
          churn_reason?: string | null
          churned_at?: string | null
          city?: string | null
          company_legal_form?: string | null
          company_name: string
          contact_email: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          contract_document_url?: string | null
          contract_end?: string | null
          contract_notice_period?: number | null
          contract_signed_at?: string | null
          contract_signed_by?: string | null
          contract_start?: string | null
          contract_type?: string
          country?: string | null
          created_at?: string | null
          domains?: Json | null
          enabled_apps?: string[] | null
          enabled_features?: Json | null
          feature_limits?: Json | null
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          linkedin_url?: string | null
          metrics?: Json | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          onboarding_step?: number | null
          partner_type: string
          referral_code?: string | null
          referral_commission_duration_months?: number | null
          referral_commission_percent?: number | null
          referral_cookie_days?: number | null
          settings?: Json | null
          slug: string
          state?: string | null
          status?: string | null
          street?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_payout_enabled?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tags?: string[] | null
          tax_id?: string | null
          trade_register?: string | null
          updated_at?: string | null
          vat_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          account_manager_id?: string | null
          activated_at?: string | null
          billing_address_different?: boolean | null
          billing_city?: string | null
          billing_country?: string | null
          billing_details?: Json | null
          billing_email?: string | null
          billing_model?: string
          billing_street?: string | null
          billing_zip?: string | null
          branding?: Json | null
          churn_reason?: string | null
          churned_at?: string | null
          city?: string | null
          company_legal_form?: string | null
          company_name?: string
          contact_email?: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          contract_document_url?: string | null
          contract_end?: string | null
          contract_notice_period?: number | null
          contract_signed_at?: string | null
          contract_signed_by?: string | null
          contract_start?: string | null
          contract_type?: string
          country?: string | null
          created_at?: string | null
          domains?: Json | null
          enabled_apps?: string[] | null
          enabled_features?: Json | null
          feature_limits?: Json | null
          house_number?: string | null
          id?: string
          internal_notes?: string | null
          linkedin_url?: string | null
          metrics?: Json | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_data?: Json | null
          onboarding_step?: number | null
          partner_type?: string
          referral_code?: string | null
          referral_commission_duration_months?: number | null
          referral_commission_percent?: number | null
          referral_cookie_days?: number | null
          settings?: Json | null
          slug?: string
          state?: string | null
          status?: string | null
          street?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_payout_enabled?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tags?: string[] | null
          tax_id?: string | null
          trade_register?: string | null
          updated_at?: string | null
          vat_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          bank_reference: string | null
          building_id: string | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          last_reminder_date: string | null
          lease_id: string | null
          notes: string | null
          org_id: string
          payment_date: string | null
          payment_method: string | null
          payment_type: string
          period_from: string | null
          period_to: string | null
          reminder_count: number | null
          status: string | null
          tenant_id: string | null
          transaction_reference: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_reference?: string | null
          building_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          last_reminder_date?: string | null
          lease_id?: string | null
          notes?: string | null
          org_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_type: string
          period_from?: string | null
          period_to?: string | null
          reminder_count?: number | null
          status?: string | null
          tenant_id?: string | null
          transaction_reference?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_reference?: string | null
          building_id?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          last_reminder_date?: string | null
          lease_id?: string | null
          notes?: string | null
          org_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_type?: string
          period_from?: string | null
          period_to?: string | null
          reminder_count?: number | null
          status?: string | null
          tenant_id?: string | null
          transaction_reference?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_active_leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["lease_id"]
          },
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_lease_id_calc"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "payments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          granted_permissions: string[]
          id: string
          inherit_to_children: boolean | null
          org_id: string
          reason: string | null
          resource_id: string
          resource_type: string
          role_id: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          granted_permissions: string[]
          id?: string
          inherit_to_children?: boolean | null
          org_id: string
          reason?: string | null
          resource_id: string
          resource_type: string
          role_id?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          granted_permissions?: string[]
          id?: string
          inherit_to_children?: boolean | null
          org_id?: string
          reason?: string | null
          resource_id?: string
          resource_type?: string
          role_id?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: string
          color: string | null
          created_at: string | null
          cross_sell_targets: string[] | null
          description: string | null
          entry_point: string | null
          exit_point: string | null
          full_title: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          price_sensitivity: string | null
          segment: string | null
          sort_order: number | null
          story: string | null
          title: string
          typical_journey: Json | null
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          color?: string | null
          created_at?: string | null
          cross_sell_targets?: string[] | null
          description?: string | null
          entry_point?: string | null
          exit_point?: string | null
          full_title: string
          icon?: string | null
          id: string
          is_active?: boolean | null
          name: string
          price_sensitivity?: string | null
          segment?: string | null
          sort_order?: number | null
          story?: string | null
          title: string
          typical_journey?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          color?: string | null
          created_at?: string | null
          cross_sell_targets?: string[] | null
          description?: string | null
          entry_point?: string | null
          exit_point?: string | null
          full_title?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_sensitivity?: string | null
          segment?: string | null
          sort_order?: number | null
          story?: string | null
          title?: string
          typical_journey?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_listings: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          inquiries_count: number | null
          listing_data: Json | null
          portal: string
          portal_listing_id: string | null
          portal_url: string | null
          property_id: string
          published_at: string | null
          status: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          inquiries_count?: number | null
          listing_data?: Json | null
          portal: string
          portal_listing_id?: string | null
          portal_url?: string | null
          property_id: string
          published_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          inquiries_count?: number | null
          listing_data?: Json | null
          portal?: string
          portal_listing_id?: string | null
          portal_url?: string | null
          property_id?: string
          published_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      product_bundles: {
        Row: {
          bundle_price_cents: number
          bundle_type: string
          created_at: string | null
          description: string | null
          id: string
          included_products: Json
          individual_value_cents: number | null
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          savings_percent: number | null
          slug: string
          sort_order: number | null
          stripe_price_monthly: string | null
          stripe_price_onetime: string | null
          stripe_price_yearly: string | null
          stripe_product_id: string | null
          tagline: string | null
          target_persona_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          bundle_price_cents: number
          bundle_type?: string
          created_at?: string | null
          description?: string | null
          id: string
          included_products?: Json
          individual_value_cents?: number | null
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          savings_percent?: number | null
          slug: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_onetime?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          target_persona_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bundle_price_cents?: number
          bundle_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          included_products?: Json
          individual_value_cents?: number | null
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          savings_percent?: number | null
          slug?: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_onetime?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          target_persona_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          badge: string | null
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          included_features: string[] | null
          included_subscription: string | null
          includes: Json | null
          is_active: boolean | null
          is_popular: boolean | null
          is_recommended: boolean | null
          is_visible: boolean | null
          limits: Json | null
          name: string
          original_price_cents: number | null
          price_cents: number | null
          price_monthly_cents: number | null
          price_yearly_cents: number | null
          primary_persona: string | null
          product_type: string
          savings_percent: number | null
          short_description: string | null
          slug: string
          sort_order: number | null
          stripe_price_monthly: string | null
          stripe_price_onetime: string | null
          stripe_price_yearly: string | null
          stripe_product_id: string | null
          target_personas: string[] | null
          tool_type: string | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id: string
          included_features?: string[] | null
          included_subscription?: string | null
          includes?: Json | null
          is_active?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          is_visible?: boolean | null
          limits?: Json | null
          name: string
          original_price_cents?: number | null
          price_cents?: number | null
          price_monthly_cents?: number | null
          price_yearly_cents?: number | null
          primary_persona?: string | null
          product_type: string
          savings_percent?: number | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_onetime?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          target_personas?: string[] | null
          tool_type?: string | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          included_features?: string[] | null
          included_subscription?: string | null
          includes?: Json | null
          is_active?: boolean | null
          is_popular?: boolean | null
          is_recommended?: boolean | null
          is_visible?: boolean | null
          limits?: Json | null
          name?: string
          original_price_cents?: number | null
          price_cents?: number | null
          price_monthly_cents?: number | null
          price_yearly_cents?: number | null
          primary_persona?: string | null
          product_type?: string
          savings_percent?: number | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          stripe_price_monthly?: string | null
          stripe_price_onetime?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          target_personas?: string[] | null
          tool_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          role: string
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_comparisons: {
        Row: {
          affiliate_link_used: string | null
          affiliate_partner: string | null
          cheapest_offer_yearly_cost: number | null
          clicked_at: string | null
          clicked_offer_provider: string | null
          clicked_offer_tariff: string | null
          comparison_date: string | null
          comparison_results: Json | null
          comparison_type: string
          consumption_kwh: number
          contract_id: string | null
          created_at: string | null
          current_provider_name: string | null
          current_tariff_name: string | null
          current_yearly_cost: number | null
          id: string
          max_savings: number | null
          offers_count: number | null
          results_valid_until: string | null
          switch_confirmed: boolean | null
          switched: boolean | null
          switched_at: string | null
          user_id: string
          zip_code: string
        }
        Insert: {
          affiliate_link_used?: string | null
          affiliate_partner?: string | null
          cheapest_offer_yearly_cost?: number | null
          clicked_at?: string | null
          clicked_offer_provider?: string | null
          clicked_offer_tariff?: string | null
          comparison_date?: string | null
          comparison_results?: Json | null
          comparison_type: string
          consumption_kwh: number
          contract_id?: string | null
          created_at?: string | null
          current_provider_name?: string | null
          current_tariff_name?: string | null
          current_yearly_cost?: number | null
          id?: string
          max_savings?: number | null
          offers_count?: number | null
          results_valid_until?: string | null
          switch_confirmed?: boolean | null
          switched?: boolean | null
          switched_at?: string | null
          user_id: string
          zip_code: string
        }
        Update: {
          affiliate_link_used?: string | null
          affiliate_partner?: string | null
          cheapest_offer_yearly_cost?: number | null
          clicked_at?: string | null
          clicked_offer_provider?: string | null
          clicked_offer_tariff?: string | null
          comparison_date?: string | null
          comparison_results?: Json | null
          comparison_type?: string
          consumption_kwh?: number
          contract_id?: string | null
          created_at?: string | null
          current_provider_name?: string | null
          current_tariff_name?: string | null
          current_yearly_cost?: number | null
          id?: string
          max_savings?: number | null
          offers_count?: number | null
          results_valid_until?: string | null
          switch_confirmed?: boolean | null
          switched?: boolean | null
          switched_at?: string | null
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      reading_reminders: {
        Row: {
          building_id: string
          created_at: string | null
          id: string
          interval_days: number | null
          is_active: boolean | null
          last_sent_at: string | null
          meter_number: string
          next_reminder_date: string
          notify_email: boolean | null
          notify_push: boolean | null
          preferred_time: string | null
          snooze_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          building_id: string
          created_at?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean | null
          last_sent_at?: string | null
          meter_number: string
          next_reminder_date: string
          notify_email?: boolean | null
          notify_push?: boolean | null
          preferred_time?: string | null
          snooze_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          building_id?: string
          created_at?: string | null
          id?: string
          interval_days?: number | null
          is_active?: boolean | null
          last_sent_at?: string | null
          meter_number?: string
          next_reminder_date?: string
          notify_email?: boolean | null
          notify_push?: boolean | null
          preferred_time?: string | null
          snooze_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reminders_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reminders_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reminders_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string | null
          default_permissions: string[] | null
          description: string | null
          icon: string | null
          id: string
          is_editable: boolean | null
          is_system_role: boolean | null
          name: string
          org_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          default_permissions?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_editable?: boolean | null
          is_system_role?: boolean | null
          name: string
          org_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          default_permissions?: string[] | null
          description?: string | null
          icon?: string | null
          id?: string
          is_editable?: boolean | null
          is_system_role?: boolean | null
          name?: string
          org_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schufa_orders: {
        Row: {
          created_at: string | null
          currency: string | null
          document_generated_at: string | null
          document_url: string | null
          document_valid_until: string | null
          error_message: string | null
          external_order_id: string | null
          external_status: string | null
          id: string
          is_subscription: boolean | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_status: string | null
          price_cents: number
          product_type: string
          share_code: string | null
          share_expires_at: string | null
          share_url: string | null
          share_view_count: number | null
          status: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          document_generated_at?: string | null
          document_url?: string | null
          document_valid_until?: string | null
          error_message?: string | null
          external_order_id?: string | null
          external_status?: string | null
          id?: string
          is_subscription?: boolean | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          price_cents: number
          product_type: string
          share_code?: string | null
          share_expires_at?: string | null
          share_url?: string | null
          share_view_count?: number | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          document_generated_at?: string | null
          document_url?: string | null
          document_valid_until?: string | null
          error_message?: string | null
          external_order_id?: string | null
          external_status?: string | null
          id?: string
          is_subscription?: boolean | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          price_cents?: number
          product_type?: string
          share_code?: string | null
          share_expires_at?: string | null
          share_url?: string | null
          share_view_count?: number | null
          status?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seat_allocations: {
        Row: {
          activated_at: string | null
          allocated_at: string | null
          created_at: string | null
          email: string | null
          id: string
          invitation_id: string | null
          seat_type: string
          status: string | null
          subscription_id: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          allocated_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_id?: string | null
          seat_type: string
          status?: string | null
          subscription_id: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          allocated_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_id?: string | null
          seat_type?: string
          status?: string | null
          subscription_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_allocations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seat_allocations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_api_keys: {
        Row: {
          api_key_hint: string | null
          created_at: string | null
          created_by: string | null
          environment: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          service_key: string
          vault_secret_id: string | null
        }
        Insert: {
          api_key_hint?: string | null
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          service_key: string
          vault_secret_id?: string | null
        }
        Update: {
          api_key_hint?: string | null
          created_at?: string | null
          created_by?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          service_key?: string
          vault_secret_id?: string | null
        }
        Relationships: []
      }
      service_rate_limits: {
        Row: {
          daily_cost: number | null
          daily_requests: number | null
          daily_reset_at: string | null
          id: string
          monthly_cost: number | null
          monthly_requests: number | null
          monthly_reset_at: string | null
          service_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          daily_cost?: number | null
          daily_requests?: number | null
          daily_reset_at?: string | null
          id?: string
          monthly_cost?: number | null
          monthly_requests?: number | null
          monthly_reset_at?: string | null
          service_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          daily_cost?: number | null
          daily_requests?: number | null
          daily_reset_at?: string | null
          id?: string
          monthly_cost?: number | null
          monthly_requests?: number | null
          monthly_reset_at?: string | null
          service_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          assigned_to: string | null
          available_times: string | null
          building_id: string
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          internal_notes: string | null
          location_description: string | null
          org_id: string
          photos: string[] | null
          preferred_contact: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          response_to_tenant: string | null
          status: string | null
          task_id: string | null
          tenant_id: string
          title: string
          unit_id: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          available_times?: string | null
          building_id: string
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          internal_notes?: string | null
          location_description?: string | null
          org_id: string
          photos?: string[] | null
          preferred_contact?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          response_to_tenant?: string | null
          status?: string | null
          task_id?: string | null
          tenant_id: string
          title: string
          unit_id?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          available_times?: string | null
          building_id?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          internal_notes?: string | null
          location_description?: string | null
          org_id?: string
          photos?: string[] | null
          preferred_contact?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          response_to_tenant?: string | null
          status?: string | null
          task_id?: string | null
          tenant_id?: string
          title?: string
          unit_id?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "service_requests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "service_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "service_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "service_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      service_usage_log: {
        Row: {
          app_id: string
          billing_status: string | null
          charged_amount: number | null
          created_at: string | null
          currency: string | null
          error_message: string | null
          id: string
          is_billable: boolean | null
          metadata: Json | null
          operation: string
          org_id: string | null
          our_cost: number | null
          related_entity_id: string | null
          related_entity_type: string | null
          request_data: Json | null
          response_code: number | null
          response_status: string | null
          response_time_ms: number | null
          service_key: string
          stripe_payment_id: string | null
          user_id: string | null
        }
        Insert: {
          app_id: string
          billing_status?: string | null
          charged_amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          is_billable?: boolean | null
          metadata?: Json | null
          operation: string
          org_id?: string | null
          our_cost?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          request_data?: Json | null
          response_code?: number | null
          response_status?: string | null
          response_time_ms?: number | null
          service_key: string
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Update: {
          app_id?: string
          billing_status?: string | null
          charged_amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          id?: string
          is_billable?: boolean | null
          metadata?: Json | null
          operation?: string
          org_id?: string | null
          our_cost?: number | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          request_data?: Json | null
          response_code?: number | null
          response_status?: string | null
          response_time_ms?: number | null
          service_key?: string
          stripe_payment_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      services_registry: {
        Row: {
          api_base_url: string | null
          api_docs_url: string | null
          api_key_secret_name: string | null
          apps_enabled: string[] | null
          base44_integration_name: string | null
          category: string
          config: Json | null
          cost_config: Json | null
          created_at: string | null
          description: string | null
          display_name: string
          edge_function_name: string | null
          edge_function_url: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          is_live: boolean | null
          openapi_spec_url: string | null
          pricing: Json | null
          rate_limits: Json | null
          requires_api_key: boolean | null
          service_key: string
          tiers_enabled: string[] | null
          updated_at: string | null
        }
        Insert: {
          api_base_url?: string | null
          api_docs_url?: string | null
          api_key_secret_name?: string | null
          apps_enabled?: string[] | null
          base44_integration_name?: string | null
          category: string
          config?: Json | null
          cost_config?: Json | null
          created_at?: string | null
          description?: string | null
          display_name: string
          edge_function_name?: string | null
          edge_function_url?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          is_live?: boolean | null
          openapi_spec_url?: string | null
          pricing?: Json | null
          rate_limits?: Json | null
          requires_api_key?: boolean | null
          service_key: string
          tiers_enabled?: string[] | null
          updated_at?: string | null
        }
        Update: {
          api_base_url?: string | null
          api_docs_url?: string | null
          api_key_secret_name?: string | null
          apps_enabled?: string[] | null
          base44_integration_name?: string | null
          category?: string
          config?: Json | null
          cost_config?: Json | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          edge_function_name?: string | null
          edge_function_url?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          is_live?: boolean | null
          openapi_spec_url?: string | null
          pricing?: Json | null
          rate_limits?: Json | null
          requires_api_key?: boolean | null
          service_key?: string
          tiers_enabled?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          status: string | null
          stripe_customer_id: string
          stripe_invoice_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          stripe_customer_id: string
          stripe_invoice_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          stripe_customer_id?: string
          stripe_invoice_id?: string | null
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          billing_scheme: string | null
          created_at: string | null
          currency: string | null
          id: string
          last_synced_at: string | null
          livemode: boolean | null
          lookup_key: string | null
          metadata: Json | null
          nickname: string | null
          price_type: string | null
          product_id: string
          recurring_interval: string | null
          recurring_interval_count: number | null
          stripe_created_at: string | null
          tax_behavior: string | null
          trial_period_days: number | null
          type: string
          unit_amount: number
          unit_amount_decimal: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          id: string
          last_synced_at?: string | null
          livemode?: boolean | null
          lookup_key?: string | null
          metadata?: Json | null
          nickname?: string | null
          price_type?: string | null
          product_id: string
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_created_at?: string | null
          tax_behavior?: string | null
          trial_period_days?: number | null
          type: string
          unit_amount: number
          unit_amount_decimal?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          billing_scheme?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          last_synced_at?: string | null
          livemode?: boolean | null
          lookup_key?: string | null
          metadata?: Json | null
          nickname?: string | null
          price_type?: string | null
          product_id?: string
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_created_at?: string | null
          tax_behavior?: string | null
          trial_period_days?: number | null
          type?: string
          unit_amount?: number
          unit_amount_decimal?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_app_pricing"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_stripe_products_with_prices"
            referencedColumns: ["product_id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          app_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          images: string[] | null
          is_highlighted: boolean | null
          is_popular: boolean | null
          last_synced_at: string | null
          limits: Json | null
          livemode: boolean | null
          marketing_features: Json | null
          metadata: Json | null
          name: string
          product_type: string | null
          sort_order: number | null
          stripe_created_at: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id: string
          images?: string[] | null
          is_highlighted?: boolean | null
          is_popular?: boolean | null
          last_synced_at?: string | null
          limits?: Json | null
          livemode?: boolean | null
          marketing_features?: Json | null
          metadata?: Json | null
          name: string
          product_type?: string | null
          sort_order?: number | null
          stripe_created_at?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          images?: string[] | null
          is_highlighted?: boolean | null
          is_popular?: boolean | null
          last_synced_at?: string | null
          limits?: Json | null
          livemode?: boolean | null
          marketing_features?: Json | null
          metadata?: Json | null
          name?: string
          product_type?: string | null
          sort_order?: number | null
          stripe_created_at?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          created_at: string | null
          data: Json
          error: string | null
          id: string
          livemode: boolean | null
          processed: boolean | null
          processed_at: string | null
          stripe_created_at: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          data: Json
          error?: string | null
          id: string
          livemode?: boolean | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_created_at?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          error?: string | null
          id?: string
          livemode?: boolean | null
          processed?: boolean | null
          processed_at?: string | null
          stripe_created_at?: string | null
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          app_id: string | null
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          custom_limits: Json | null
          customer_email: string | null
          id: string
          ki_access: boolean | null
          max_objects: number | null
          metadata: Json | null
          org_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          tier: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          app_id?: string | null
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          custom_limits?: Json | null
          customer_email?: string | null
          id?: string
          ki_access?: boolean | null
          max_objects?: number | null
          metadata?: Json | null
          org_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string | null
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          custom_limits?: Json | null
          customer_email?: string | null
          id?: string
          ki_access?: boolean | null
          max_objects?: number | null
          metadata?: Json | null
          org_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          app_id: string | null
          id: string
          metadata: Json | null
          metric_category: string | null
          metric_name: string
          metric_value: number | null
          metric_value_text: string | null
          period_end: string | null
          period_start: string | null
          recorded_at: string | null
          time_period: string | null
        }
        Insert: {
          app_id?: string | null
          id?: string
          metadata?: Json | null
          metric_category?: string | null
          metric_name: string
          metric_value?: number | null
          metric_value_text?: string | null
          period_end?: string | null
          period_start?: string | null
          recorded_at?: string | null
          time_period?: string | null
        }
        Update: {
          app_id?: string | null
          id?: string
          metadata?: Json | null
          metric_category?: string | null
          metric_name?: string
          metric_value?: number | null
          metric_value_text?: string | null
          period_end?: string | null
          period_start?: string | null
          recorded_at?: string | null
          time_period?: string | null
        }
        Relationships: []
      }
      task_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          mime_type: string | null
          photo_type: string | null
          taken_at: string | null
          taken_by: string | null
          task_id: string
          thumbnail_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          mime_type?: string | null
          photo_type?: string | null
          taken_at?: string | null
          taken_by?: string | null
          task_id: string
          thumbnail_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          mime_type?: string | null
          photo_type?: string | null
          taken_at?: string | null
          taken_by?: string | null
          task_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_watchers: {
        Row: {
          created_at: string | null
          id: string
          notify_on_comment: boolean | null
          notify_on_photo: boolean | null
          notify_on_status: boolean | null
          task_id: string
          user_app: string | null
          user_id: string
          user_type: string | null
          watch_reason: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_on_comment?: boolean | null
          notify_on_photo?: boolean | null
          notify_on_status?: boolean | null
          task_id: string
          user_app?: string | null
          user_id: string
          user_type?: string | null
          watch_reason?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_on_comment?: boolean | null
          notify_on_photo?: boolean | null
          notify_on_status?: boolean | null
          task_id?: string
          user_app?: string | null
          user_id?: string
          user_type?: string | null
          watch_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_watchers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_watchers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_watchers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_cost: number | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_role_id: string | null
          assigned_to: string | null
          building_id: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_cost: number | null
          estimated_duration_minutes: number | null
          id: string
          is_recurring: boolean | null
          next_occurrence_date: string | null
          org_id: string
          parent_task_id: string | null
          priority: string | null
          recurrence_rule: Json | null
          related_task_ids: string[] | null
          reminder_before_minutes: number | null
          reminder_enabled: boolean | null
          reminder_sent_at: string | null
          reported_by: string | null
          reported_by_type: string | null
          source_app: string | null
          started_at: string | null
          status: string | null
          task_type: string | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_role_id?: string | null
          assigned_to?: string | null
          building_id?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_cost?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence_date?: string | null
          org_id: string
          parent_task_id?: string | null
          priority?: string | null
          recurrence_rule?: Json | null
          related_task_ids?: string[] | null
          reminder_before_minutes?: number | null
          reminder_enabled?: boolean | null
          reminder_sent_at?: string | null
          reported_by?: string | null
          reported_by_type?: string | null
          source_app?: string | null
          started_at?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_role_id?: string | null
          assigned_to?: string | null
          building_id?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_cost?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          next_occurrence_date?: string | null
          org_id?: string
          parent_task_id?: string | null
          priority?: string | null
          recurrence_rule?: Json | null
          related_task_ids?: string[] | null
          reminder_before_minutes?: number | null
          reminder_enabled?: boolean | null
          reminder_sent_at?: string | null
          reported_by?: string | null
          reported_by_type?: string | null
          source_app?: string | null
          started_at?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_role_id_fkey"
            columns: ["assigned_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_my_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["chat_conversation_id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      template_pricing: {
        Row: {
          ab_test_variant: string | null
          created_at: string | null
          free_for_subscription_tiers: string[] | null
          id: string
          included_in_packs: string[] | null
          is_active: boolean | null
          price_premium_download_cents: number | null
          price_without_watermark_cents: number | null
          pricing_model: string
          promo_end: string | null
          promo_price_cents: number | null
          promo_start: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          ab_test_variant?: string | null
          created_at?: string | null
          free_for_subscription_tiers?: string[] | null
          id?: string
          included_in_packs?: string[] | null
          is_active?: boolean | null
          price_premium_download_cents?: number | null
          price_without_watermark_cents?: number | null
          pricing_model?: string
          promo_end?: string | null
          promo_price_cents?: number | null
          promo_start?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          ab_test_variant?: string | null
          created_at?: string | null
          free_for_subscription_tiers?: string[] | null
          id?: string
          included_in_packs?: string[] | null
          is_active?: boolean | null
          price_premium_download_cents?: number | null
          price_without_watermark_cents?: number | null
          pricing_model?: string
          promo_end?: string | null
          promo_price_cents?: number | null
          promo_start?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_pricing_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: true
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_screening_reports: {
        Row: {
          aktualisiert_am: string | null
          application_id: string
          empfehlung: string | null
          erstellt_am: string | null
          gesamt_punkte: number | null
          gesamt_status: string | null
          id: string
          kategorien: Json
          max_punkte: number | null
          schufa_order_id: string | null
          user_id: string
          vorvermieter_id: string | null
        }
        Insert: {
          aktualisiert_am?: string | null
          application_id: string
          empfehlung?: string | null
          erstellt_am?: string | null
          gesamt_punkte?: number | null
          gesamt_status?: string | null
          id?: string
          kategorien?: Json
          max_punkte?: number | null
          schufa_order_id?: string | null
          user_id: string
          vorvermieter_id?: string | null
        }
        Update: {
          aktualisiert_am?: string | null
          application_id?: string
          empfehlung?: string | null
          erstellt_am?: string | null
          gesamt_punkte?: number | null
          gesamt_status?: string | null
          id?: string
          kategorien?: Json
          max_punkte?: number | null
          schufa_order_id?: string | null
          user_id?: string
          vorvermieter_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          account_holder: string | null
          bank_name: string | null
          bic: string | null
          caretaker_owner_id: string | null
          company_contact_person: string | null
          company_legal_form: string | null
          company_name: string | null
          company_registration: string | null
          correspondence_city: string | null
          correspondence_country: string | null
          correspondence_street: string | null
          correspondence_zip: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          iban: string | null
          id: string
          language: string | null
          last_name: string | null
          metadata: Json | null
          mobile: string | null
          notes: string | null
          org_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          salutation: string | null
          sepa_mandate_date: string | null
          sepa_mandate_reference: string | null
          sepa_mandate_status: string | null
          status: string | null
          tenant_type: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          caretaker_owner_id?: string | null
          company_contact_person?: string | null
          company_legal_form?: string | null
          company_name?: string | null
          company_registration?: string | null
          correspondence_city?: string | null
          correspondence_country?: string | null
          correspondence_street?: string | null
          correspondence_zip?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          iban?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          salutation?: string | null
          sepa_mandate_date?: string | null
          sepa_mandate_reference?: string | null
          sepa_mandate_status?: string | null
          status?: string | null
          tenant_type?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_holder?: string | null
          bank_name?: string | null
          bic?: string | null
          caretaker_owner_id?: string | null
          company_contact_person?: string | null
          company_legal_form?: string | null
          company_name?: string | null
          company_registration?: string | null
          correspondence_city?: string | null
          correspondence_country?: string | null
          correspondence_street?: string | null
          correspondence_zip?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          iban?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notes?: string | null
          org_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          salutation?: string | null
          sepa_mandate_date?: string | null
          sepa_mandate_reference?: string | null
          sepa_mandate_status?: string | null
          status?: string | null
          tenant_type?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billed_at: string | null
          building_id: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number
          end_time: string | null
          entry_date: string
          entry_type: string
          gps_end_lat: number | null
          gps_end_lng: number | null
          gps_start_lat: number | null
          gps_start_lng: number | null
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          is_billed: boolean | null
          is_running: boolean | null
          org_id: string | null
          start_time: string | null
          started_at: string | null
          status: string | null
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billed_at?: string | null
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          entry_date?: string
          entry_type?: string
          gps_end_lat?: number | null
          gps_end_lng?: number | null
          gps_start_lat?: number | null
          gps_start_lng?: number | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          is_billed?: boolean | null
          is_running?: boolean | null
          org_id?: string | null
          start_time?: string | null
          started_at?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billed_at?: string | null
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          end_time?: string | null
          entry_date?: string
          entry_type?: string
          gps_end_lat?: number | null
          gps_end_lng?: number | null
          gps_start_lat?: number | null
          gps_start_lng?: number | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          is_billed?: boolean | null
          is_running?: boolean | null
          org_id?: string | null
          start_time?: string | null
          started_at?: string | null
          status?: string | null
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "time_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "maintenance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_open_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_usage_limits: {
        Row: {
          created_at: string | null
          has_premium: boolean | null
          id: string
          ip_address: string | null
          lead_id: string | null
          period_end: string | null
          period_start: string | null
          premium_purchased_at: string | null
          tool_type: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_premium?: boolean | null
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          period_end?: string | null
          period_start?: string | null
          premium_purchased_at?: string | null
          tool_type: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_premium?: boolean | null
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          period_end?: string | null
          period_start?: string | null
          premium_purchased_at?: string | null
          tool_type?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      tools_registry: {
        Row: {
          base44_app_id: string | null
          category: string
          color: string | null
          conversion_rate: number | null
          created_at: string | null
          description: string | null
          free_limit: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          is_visible: boolean | null
          long_description: string | null
          name: string
          premium_features: string[] | null
          premium_price_cents: number | null
          seo_description: string | null
          seo_domain: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          stripe_price_lifetime: string | null
          stripe_price_monthly: string | null
          stripe_price_single: string | null
          stripe_price_yearly: string | null
          stripe_product_id: string | null
          target_apps: string[] | null
          target_audience: string | null
          tier: string | null
          tool_type: string
          total_calculations: number | null
          total_leads: number | null
          updated_at: string | null
        }
        Insert: {
          base44_app_id?: string | null
          category: string
          color?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          free_limit?: number | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_visible?: boolean | null
          long_description?: string | null
          name: string
          premium_features?: string[] | null
          premium_price_cents?: number | null
          seo_description?: string | null
          seo_domain?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          stripe_price_lifetime?: string | null
          stripe_price_monthly?: string | null
          stripe_price_single?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          target_apps?: string[] | null
          target_audience?: string | null
          tier?: string | null
          tool_type: string
          total_calculations?: number | null
          total_leads?: number | null
          updated_at?: string | null
        }
        Update: {
          base44_app_id?: string | null
          category?: string
          color?: string | null
          conversion_rate?: number | null
          created_at?: string | null
          description?: string | null
          free_limit?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_visible?: boolean | null
          long_description?: string | null
          name?: string
          premium_features?: string[] | null
          premium_price_cents?: number | null
          seo_description?: string | null
          seo_domain?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          stripe_price_lifetime?: string | null
          stripe_price_monthly?: string | null
          stripe_price_single?: string | null
          stripe_price_yearly?: string | null
          stripe_product_id?: string | null
          target_apps?: string[] | null
          target_audience?: string | null
          tier?: string | null
          tool_type?: string
          total_calculations?: number | null
          total_leads?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          balcony_area_sqm: number | null
          bathroom_count: number | null
          bedroom_count: number | null
          building_id: string
          created_at: string | null
          current_lease_id: string | null
          current_tenant_id: string | null
          equipment: Json | null
          floor: number | null
          garden_area_sqm: number | null
          has_balcony: boolean | null
          has_basement: boolean | null
          has_elevator_access: boolean | null
          has_garden: boolean | null
          has_terrace: boolean | null
          id: string
          living_area_sqm: number | null
          name: string
          occupancy_status: string | null
          org_id: string | null
          position: string | null
          room_count: number | null
          staircase: string | null
          status: string | null
          target_rent: number | null
          target_utilities: number | null
          unit_number: string | null
          unit_type: string
          updated_at: string | null
          usable_area_sqm: number | null
        }
        Insert: {
          balcony_area_sqm?: number | null
          bathroom_count?: number | null
          bedroom_count?: number | null
          building_id: string
          created_at?: string | null
          current_lease_id?: string | null
          current_tenant_id?: string | null
          equipment?: Json | null
          floor?: number | null
          garden_area_sqm?: number | null
          has_balcony?: boolean | null
          has_basement?: boolean | null
          has_elevator_access?: boolean | null
          has_garden?: boolean | null
          has_terrace?: boolean | null
          id?: string
          living_area_sqm?: number | null
          name: string
          occupancy_status?: string | null
          org_id?: string | null
          position?: string | null
          room_count?: number | null
          staircase?: string | null
          status?: string | null
          target_rent?: number | null
          target_utilities?: number | null
          unit_number?: string | null
          unit_type?: string
          updated_at?: string | null
          usable_area_sqm?: number | null
        }
        Update: {
          balcony_area_sqm?: number | null
          bathroom_count?: number | null
          bedroom_count?: number | null
          building_id?: string
          created_at?: string | null
          current_lease_id?: string | null
          current_tenant_id?: string | null
          equipment?: Json | null
          floor?: number | null
          garden_area_sqm?: number | null
          has_balcony?: boolean | null
          has_basement?: boolean | null
          has_elevator_access?: boolean | null
          has_garden?: boolean | null
          has_terrace?: boolean | null
          id?: string
          living_area_sqm?: number | null
          name?: string
          occupancy_status?: string | null
          org_id?: string | null
          position?: string | null
          room_count?: number | null
          staircase?: string | null
          status?: string | null
          target_rent?: number | null
          target_utilities?: number | null
          unit_number?: string | null
          unit_type?: string
          updated_at?: string | null
          usable_area_sqm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string | null
          esignature_credits: number | null
          esignature_credits_purchased: number | null
          esignature_credits_used: number | null
          id: string
          letter_credits: number | null
          letter_credits_purchased: number | null
          letter_credits_used: number | null
          schufa_credits: number | null
          schufa_credits_purchased: number | null
          schufa_credits_used: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          esignature_credits?: number | null
          esignature_credits_purchased?: number | null
          esignature_credits_used?: number | null
          id?: string
          letter_credits?: number | null
          letter_credits_purchased?: number | null
          letter_credits_used?: number | null
          schufa_credits?: number | null
          schufa_credits_purchased?: number | null
          schufa_credits_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          esignature_credits?: number | null
          esignature_credits_purchased?: number | null
          esignature_credits_used?: number | null
          id?: string
          letter_credits?: number | null
          letter_credits_purchased?: number | null
          letter_credits_used?: number | null
          schufa_credits?: number | null
          schufa_credits_purchased?: number | null
          schufa_credits_used?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_document_access: {
        Row: {
          access_type: string
          can_download_without_watermark: boolean | null
          created_at: string | null
          downloads_remaining: number | null
          id: string
          is_active: boolean | null
          pack_id: string | null
          source: string
          stripe_payment_id: string | null
          stripe_subscription_id: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          access_type: string
          can_download_without_watermark?: boolean | null
          created_at?: string | null
          downloads_remaining?: number | null
          id?: string
          is_active?: boolean | null
          pack_id?: string | null
          source: string
          stripe_payment_id?: string | null
          stripe_subscription_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          access_type?: string
          can_download_without_watermark?: boolean | null
          created_at?: string | null
          downloads_remaining?: number | null
          id?: string
          is_active?: boolean | null
          pack_id?: string | null
          source?: string
          stripe_payment_id?: string | null
          stripe_subscription_id?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_document_access_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_energy_contracts: {
        Row: {
          auto_renewal_months: number | null
          building_id: string | null
          cancellation_date: string | null
          cancellation_reason: string | null
          contract_end: string | null
          contract_number: string | null
          contract_start: string | null
          contract_type: string
          created_at: string | null
          created_by: string | null
          customer_number: string | null
          document_urls: string[] | null
          iban: string | null
          id: string
          loyalty_bonus_after_months: number | null
          loyalty_bonus_amount: number | null
          meter_point_id: string | null
          monthly_advance_payment: number | null
          next_cancellation_date: string | null
          notes: string | null
          notice_period_months: number | null
          notice_period_type: string | null
          org_id: string | null
          payment_method: string | null
          price_guarantee_type: string | null
          price_guarantee_until: string | null
          provider_id: string | null
          provider_name_manual: string | null
          signup_bonus_amount: number | null
          signup_bonus_paid: boolean | null
          status: string | null
          tariff_name: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renewal_months?: number | null
          building_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type: string
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          document_urls?: string[] | null
          iban?: string | null
          id?: string
          loyalty_bonus_after_months?: number | null
          loyalty_bonus_amount?: number | null
          meter_point_id?: string | null
          monthly_advance_payment?: number | null
          next_cancellation_date?: string | null
          notes?: string | null
          notice_period_months?: number | null
          notice_period_type?: string | null
          org_id?: string | null
          payment_method?: string | null
          price_guarantee_type?: string | null
          price_guarantee_until?: string | null
          provider_id?: string | null
          provider_name_manual?: string | null
          signup_bonus_amount?: number | null
          signup_bonus_paid?: boolean | null
          status?: string | null
          tariff_name?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renewal_months?: number | null
          building_id?: string | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          contract_end?: string | null
          contract_number?: string | null
          contract_start?: string | null
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          customer_number?: string | null
          document_urls?: string[] | null
          iban?: string | null
          id?: string
          loyalty_bonus_after_months?: number | null
          loyalty_bonus_amount?: number | null
          meter_point_id?: string | null
          monthly_advance_payment?: number | null
          next_cancellation_date?: string | null
          notes?: string | null
          notice_period_months?: number | null
          notice_period_type?: string | null
          org_id?: string | null
          payment_method?: string | null
          price_guarantee_type?: string | null
          price_guarantee_until?: string | null
          provider_id?: string | null
          provider_name_manual?: string | null
          signup_bonus_amount?: number | null
          signup_bonus_paid?: boolean | null
          status?: string | null
          tariff_name?: string | null
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "fk_contracts_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "energy_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "fk_contracts_unit"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      user_personas: {
        Row: {
          age_range: string | null
          created_at: string | null
          downgrade_offer_accepted: boolean | null
          downgrade_offer_shown_at: string | null
          experience_level: string | null
          first_purchase_amount_cents: number | null
          first_purchase_at: string | null
          first_purchase_product: string | null
          first_recommended_action: string | null
          id: string
          last_upsell_product: string | null
          last_upsell_shown_at: string | null
          lifecycle_stage: string | null
          lifecycle_updated_at: string | null
          main_goal: string | null
          onboarding_completed_at: string | null
          onboarding_source: string | null
          persona_description: string | null
          persona_id: string
          persona_name: string
          portfolio_size: string | null
          recommended_bundles: Json | null
          recommended_products: Json | null
          recommended_tier: string | null
          role: string
          tech_comfort: string | null
          total_purchases: number | null
          total_revenue_cents: number | null
          ui_preference: string | null
          updated_at: string | null
          upsell_accepted_count: number | null
          upsell_declined_count: number | null
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          created_at?: string | null
          downgrade_offer_accepted?: boolean | null
          downgrade_offer_shown_at?: string | null
          experience_level?: string | null
          first_purchase_amount_cents?: number | null
          first_purchase_at?: string | null
          first_purchase_product?: string | null
          first_recommended_action?: string | null
          id?: string
          last_upsell_product?: string | null
          last_upsell_shown_at?: string | null
          lifecycle_stage?: string | null
          lifecycle_updated_at?: string | null
          main_goal?: string | null
          onboarding_completed_at?: string | null
          onboarding_source?: string | null
          persona_description?: string | null
          persona_id?: string
          persona_name?: string
          portfolio_size?: string | null
          recommended_bundles?: Json | null
          recommended_products?: Json | null
          recommended_tier?: string | null
          role?: string
          tech_comfort?: string | null
          total_purchases?: number | null
          total_revenue_cents?: number | null
          ui_preference?: string | null
          updated_at?: string | null
          upsell_accepted_count?: number | null
          upsell_declined_count?: number | null
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          created_at?: string | null
          downgrade_offer_accepted?: boolean | null
          downgrade_offer_shown_at?: string | null
          experience_level?: string | null
          first_purchase_amount_cents?: number | null
          first_purchase_at?: string | null
          first_purchase_product?: string | null
          first_recommended_action?: string | null
          id?: string
          last_upsell_product?: string | null
          last_upsell_shown_at?: string | null
          lifecycle_stage?: string | null
          lifecycle_updated_at?: string | null
          main_goal?: string | null
          onboarding_completed_at?: string | null
          onboarding_source?: string | null
          persona_description?: string | null
          persona_id?: string
          persona_name?: string
          portfolio_size?: string | null
          recommended_bundles?: Json | null
          recommended_products?: Json | null
          recommended_tier?: string | null
          role?: string
          tech_comfort?: string | null
          total_purchases?: number | null
          total_revenue_cents?: number | null
          ui_preference?: string | null
          updated_at?: string | null
          upsell_accepted_count?: number | null
          upsell_declined_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          brevo_synced_at: string | null
          created_at: string | null
          date_format: string | null
          display_name: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          language: string | null
          last_login_at: string | null
          last_name: string | null
          metadata: Json | null
          mobile: string | null
          notification_settings: Json | null
          objects_count: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          persona: string | null
          phone: string | null
          primary_org_id: string | null
          product: string | null
          referral_code: string | null
          referred_by: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tenants_count: number | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          brevo_synced_at?: string | null
          created_at?: string | null
          date_format?: string | null
          display_name?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id: string
          language?: string | null
          last_login_at?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notification_settings?: Json | null
          objects_count?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          persona?: string | null
          phone?: string | null
          primary_org_id?: string | null
          product?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tenants_count?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          brevo_synced_at?: string | null
          created_at?: string | null
          date_format?: string | null
          display_name?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          last_name?: string | null
          metadata?: Json | null
          mobile?: string | null
          notification_settings?: Json | null
          objects_count?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          persona?: string | null
          phone?: string | null
          primary_org_id?: string | null
          product?: string | null
          referral_code?: string | null
          referred_by?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tenants_count?: number | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_primary_org_id_fkey"
            columns: ["primary_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_purchases: {
        Row: {
          anonymous_id: string | null
          created_at: string | null
          feature_tier: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          purchased_at: string | null
          status: string | null
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          tool_type: string | null
          updated_at: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          anonymous_id?: string | null
          created_at?: string | null
          feature_tier?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tool_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          anonymous_id?: string | null
          created_at?: string | null
          feature_tier?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tool_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          id: string
          org_id: string
          role_id: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          org_id: string
          role_id: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          org_id?: string
          role_id?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vorvermieterbescheinigungen: {
        Row: {
          application_id: string | null
          created_at: string | null
          dokument_hochgeladen: boolean | null
          dokument_storage_path: string | null
          empfehlung: string | null
          empfehlung_kommentar: string | null
          hausordnung_eingehalten: boolean | null
          id: string
          mietrueckstaende: boolean | null
          mietrueckstaende_betrag: number | null
          mietverhaeltnis_bis: string | null
          mietverhaeltnis_von: string | null
          nachbarschaftsverhalten: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
          verifiziert: boolean | null
          verifiziert_am: string | null
          verifiziert_durch: string | null
          vorvermieter_adresse: string | null
          vorvermieter_email: string | null
          vorvermieter_name: string | null
          vorvermieter_telefon: string | null
          wohnung_adresse: string | null
          wohnungszustand: string | null
          zahlungsverhalten: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          dokument_hochgeladen?: boolean | null
          dokument_storage_path?: string | null
          empfehlung?: string | null
          empfehlung_kommentar?: string | null
          hausordnung_eingehalten?: boolean | null
          id?: string
          mietrueckstaende?: boolean | null
          mietrueckstaende_betrag?: number | null
          mietverhaeltnis_bis?: string | null
          mietverhaeltnis_von?: string | null
          nachbarschaftsverhalten?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
          verifiziert?: boolean | null
          verifiziert_am?: string | null
          verifiziert_durch?: string | null
          vorvermieter_adresse?: string | null
          vorvermieter_email?: string | null
          vorvermieter_name?: string | null
          vorvermieter_telefon?: string | null
          wohnung_adresse?: string | null
          wohnungszustand?: string | null
          zahlungsverhalten?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          dokument_hochgeladen?: boolean | null
          dokument_storage_path?: string | null
          empfehlung?: string | null
          empfehlung_kommentar?: string | null
          hausordnung_eingehalten?: boolean | null
          id?: string
          mietrueckstaende?: boolean | null
          mietrueckstaende_betrag?: number | null
          mietverhaeltnis_bis?: string | null
          mietverhaeltnis_von?: string | null
          nachbarschaftsverhalten?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
          verifiziert?: boolean | null
          verifiziert_am?: string | null
          verifiziert_durch?: string | null
          vorvermieter_adresse?: string | null
          vorvermieter_email?: string | null
          vorvermieter_name?: string | null
          vorvermieter_telefon?: string | null
          wohnung_adresse?: string | null
          wohnungszustand?: string | null
          zahlungsverhalten?: string | null
        }
        Relationships: []
      }
      vpi_cache: {
        Row: {
          abgerufen_am: string | null
          basis_jahr: number | null
          id: string
          index_wert: number
          jahr: number
          monat: string
          quelle: string | null
        }
        Insert: {
          abgerufen_am?: string | null
          basis_jahr?: number | null
          id?: string
          index_wert: number
          jahr: number
          monat: string
          quelle?: string | null
        }
        Update: {
          abgerufen_am?: string | null
          basis_jahr?: number | null
          id?: string
          index_wert?: number
          jahr?: number
          monat?: string
          quelle?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          endpoint: string | null
          error_message: string | null
          event_id: string | null
          event_type: string | null
          headers: Json | null
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          received_at: string | null
          response: Json | null
          retry_count: number | null
          source: string
          status_code: number | null
        }
        Insert: {
          endpoint?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
          response?: Json | null
          retry_count?: number | null
          source: string
          status_code?: number | null
        }
        Update: {
          endpoint?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string | null
          headers?: Json | null
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          received_at?: string | null
          response?: Json | null
          retry_count?: number | null
          source?: string
          status_code?: number | null
        }
        Relationships: []
      }
      winter_service_logs: {
        Row: {
          actions_taken: string[] | null
          area_description: string | null
          area_size_sqm: number | null
          building_id: string
          caretaker_owner_id: string | null
          created_at: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          notes: string | null
          org_id: string | null
          photo_url: string | null
          recorded_by: string | null
          service_date: string
          service_time: string
          spreading_amount_kg: number | null
          spreading_material: string | null
          temperature_celsius: number | null
          weather_condition: string
        }
        Insert: {
          actions_taken?: string[] | null
          area_description?: string | null
          area_size_sqm?: number | null
          building_id: string
          caretaker_owner_id?: string | null
          created_at?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          notes?: string | null
          org_id?: string | null
          photo_url?: string | null
          recorded_by?: string | null
          service_date?: string
          service_time?: string
          spreading_amount_kg?: number | null
          spreading_material?: string | null
          temperature_celsius?: number | null
          weather_condition: string
        }
        Update: {
          actions_taken?: string[] | null
          area_description?: string | null
          area_size_sqm?: number | null
          building_id?: string
          caretaker_owner_id?: string | null
          created_at?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          notes?: string | null
          org_id?: string | null
          photo_url?: string | null
          recorded_by?: string | null
          service_date?: string
          service_time?: string
          spreading_amount_kg?: number | null
          spreading_material?: string | null
          temperature_celsius?: number | null
          weather_condition?: string
        }
        Relationships: [
          {
            foreignKeyName: "winter_service_logs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winter_service_logs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "winter_service_logs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "winter_service_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          features_enabled: string[] | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          max_members: number | null
          max_projects: number | null
          name: string
          org_id: string
          settings: Json | null
          slug: string
          updated_at: string | null
          workspace_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_members?: number | null
          max_projects?: number | null
          name: string
          org_id: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
          workspace_type?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          max_members?: number | null
          max_projects?: number | null
          name?: string
          org_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
          workspace_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      zaehler_app_licenses: {
        Row: {
          buildings_count: number | null
          created_at: string | null
          features_enabled: string[] | null
          id: string
          is_active: boolean | null
          last_reading_at: string | null
          license_type: string
          max_buildings: number | null
          max_meters_per_building: number | null
          max_readings_per_day: number | null
          max_users: number | null
          meters_count: number | null
          org_id: string | null
          readings_this_month: number | null
          source_app: string
          source_subscription_id: string | null
          updated_at: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          buildings_count?: number | null
          created_at?: string | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          last_reading_at?: string | null
          license_type: string
          max_buildings?: number | null
          max_meters_per_building?: number | null
          max_readings_per_day?: number | null
          max_users?: number | null
          meters_count?: number | null
          org_id?: string | null
          readings_this_month?: number | null
          source_app?: string
          source_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          buildings_count?: number | null
          created_at?: string | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          last_reading_at?: string | null
          license_type?: string
          max_buildings?: number | null
          max_meters_per_building?: number | null
          max_readings_per_day?: number | null
          max_users?: number | null
          meters_count?: number | null
          org_id?: string | null
          readings_this_month?: number | null
          source_app?: string
          source_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_licenses_subscription"
            columns: ["source_subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      ai_costs_by_org: {
        Row: {
          month: string | null
          org_id: string | null
          total_cost_usd: number | null
          total_requests: number | null
          total_tokens: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_top_users: {
        Row: {
          last_usage: string | null
          org_id: string | null
          total_cost_usd: number | null
          total_requests: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_daily: {
        Row: {
          app_id: string | null
          avg_response_time_ms: number | null
          date: string | null
          error_count: number | null
          feature: string | null
          model_id: string | null
          requests: number | null
          total_cached_tokens: number | null
          total_cost_usd: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          unique_orgs: number | null
          unique_users: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_usage_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_monthly: {
        Row: {
          app_id: string | null
          feature: string | null
          model_id: string | null
          month: string | null
          requests: number | null
          total_cost_usd: number | null
          total_tokens: number | null
          unique_orgs: number | null
          unique_users: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_usage_logs_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      service_costs_by_org: {
        Row: {
          margin: number | null
          month: string | null
          org_id: string | null
          service_key: string | null
          service_name: string | null
          total_calls: number | null
          total_charged: number | null
          total_cost: number | null
        }
        Relationships: []
      }
      service_usage_daily: {
        Row: {
          app_id: string | null
          avg_response_time: number | null
          failed_requests: number | null
          gross_margin: number | null
          service_key: string | null
          successful_requests: number | null
          total_cost: number | null
          total_requests: number | null
          total_revenue: number | null
          unique_users: number | null
          usage_date: string | null
        }
        Relationships: []
      }
      services_overview: {
        Row: {
          apps_enabled: string[] | null
          calls_last_30_days: number | null
          category: string | null
          display_name: string | null
          integration_type: string | null
          is_active: boolean | null
          is_live: boolean | null
          pricing: Json | null
          revenue_last_30_days: number | null
          service_key: string | null
          users_last_30_days: number | null
        }
        Relationships: []
      }
      v_active_leases: {
        Row: {
          base_rent: number | null
          building_address: string | null
          building_city: string | null
          building_id: string | null
          building_name: string | null
          contract_number: string | null
          deposit_amount: number | null
          deposit_paid: number | null
          end_date: string | null
          heating_prepayment: number | null
          id: string | null
          is_indefinite: boolean | null
          number_of_persons: number | null
          org_id: string | null
          other_costs: number | null
          start_date: string | null
          status: string | null
          tenant_company: string | null
          tenant_email: string | null
          tenant_first_name: string | null
          tenant_id: string | null
          tenant_last_name: string | null
          tenant_mobile: string | null
          tenant_phone: string | null
          tenant_salutation: string | null
          total_rent: number | null
          unit_area: number | null
          unit_floor: number | null
          unit_id: string | null
          unit_name: string | null
          unit_number: string | null
          unit_rooms: number | null
          unit_type: string | null
          utility_prepayment: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "lease_contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lease_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "lease_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_admin_dashboard: {
        Row: {
          active_apps: number | null
          active_subscriptions: number | null
          errors_today: number | null
          new_users_30d: number | null
          new_users_7d: number | null
          new_users_today: number | null
          paid_subscriptions: number | null
          total_organizations: number | null
          total_users: number | null
          unresolved_errors: number | null
          webhooks_today: number | null
        }
        Relationships: []
      }
      v_affiliate_performance: {
        Row: {
          conversion_rate: number | null
          partner_id: string | null
          partner_name: string | null
          referral_code: string | null
          signup_rate: number | null
          total_clicks: number | null
          total_commissions: number | null
          total_conversions: number | null
          total_revenue: number | null
          total_signups: number | null
        }
        Relationships: []
      }
      v_ai_app_context: {
        Row: {
          app_id: string | null
          app_name: string | null
          app_slug: string | null
          features: Json | null
        }
        Relationships: []
      }
      v_ai_costs_summary: {
        Row: {
          cost_usd: number | null
          date: string | null
          requests: number | null
          tokens: number | null
        }
        Relationships: []
      }
      v_ai_errors: {
        Row: {
          app_id: string | null
          error_count: number | null
          error_message: string | null
          last_occurrence: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      v_ai_persona_context: {
        Row: {
          created_at: string | null
          description: string | null
          formality: string | null
          id: string | null
          is_active: boolean | null
          model_daily_limit: number | null
          model_id: string | null
          model_monthly_limit: number | null
          name: string | null
          pain_points: Json | null
          persona_key: string | null
          primary_goals: Json | null
          relevant_apps: string[] | null
          subscription_tier: string | null
          tone: string | null
          updated_at: string | null
          upgrade_sensitivity: string | null
          user_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tier_model_mapping_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ai_system_prompts: {
        Row: {
          category: string | null
          default_model_id: string | null
          description: string | null
          max_tokens: number | null
          name: string | null
          prompt_key: string | null
          system_prompt: string | null
        }
        Insert: {
          category?: string | null
          default_model_id?: string | null
          description?: string | null
          max_tokens?: number | null
          name?: string | null
          prompt_key?: string | null
          system_prompt?: string | null
        }
        Update: {
          category?: string | null
          default_model_id?: string | null
          description?: string | null
          max_tokens?: number | null
          name?: string | null
          prompt_key?: string | null
          system_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_system_prompts_default_model_id_fkey"
            columns: ["default_model_id"]
            isOneToOne: false
            referencedRelation: "ai_models_config"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ai_top_features: {
        Row: {
          app_id: string | null
          avg_response_time_ms: number | null
          feature: string | null
          prompt_key: string | null
          total_tokens: number | null
          usage_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      v_ai_usage_by_model: {
        Row: {
          avg_response_time_ms: number | null
          model_name: string | null
          total_cost_usd: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_requests: number | null
        }
        Relationships: []
      }
      v_ai_usage_daily_by_app: {
        Row: {
          app_id: string | null
          avg_response_time_ms: number | null
          date: string | null
          failed_requests: number | null
          successful_requests: number | null
          total_cost_usd: number | null
          total_input_tokens: number | null
          total_output_tokens: number | null
          total_requests: number | null
          total_tokens: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      v_ai_usage_daily_by_user: {
        Row: {
          app_id: string | null
          cost_usd: number | null
          date: string | null
          requests: number | null
          tokens: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      v_ai_user_limits_today: {
        Row: {
          app_id: string | null
          requests_today: number | null
          tokens_today: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_ai_app_context"
            referencedColumns: ["app_id"]
          },
        ]
      }
      v_app_pricing: {
        Row: {
          active: boolean | null
          app_id: string | null
          description: string | null
          features: Json | null
          images: string[] | null
          is_popular: boolean | null
          last_synced_at: string | null
          limits: Json | null
          livemode: boolean | null
          monthly_price: number | null
          monthly_price_id: string | null
          one_time_price: number | null
          one_time_price_id: string | null
          product_id: string | null
          product_name: string | null
          product_type: string | null
          sort_order: number | null
          tier: string | null
          yearly_price: number | null
          yearly_price_id: string | null
          yearly_savings_percent: number | null
        }
        Insert: {
          active?: boolean | null
          app_id?: string | null
          description?: string | null
          features?: Json | null
          images?: string[] | null
          is_popular?: boolean | null
          last_synced_at?: string | null
          limits?: Json | null
          livemode?: boolean | null
          monthly_price?: never
          monthly_price_id?: never
          one_time_price?: never
          one_time_price_id?: never
          product_id?: string | null
          product_name?: string | null
          product_type?: string | null
          sort_order?: number | null
          tier?: string | null
          yearly_price?: never
          yearly_price_id?: never
          yearly_savings_percent?: never
        }
        Update: {
          active?: boolean | null
          app_id?: string | null
          description?: string | null
          features?: Json | null
          images?: string[] | null
          is_popular?: boolean | null
          last_synced_at?: string | null
          limits?: Json | null
          livemode?: boolean | null
          monthly_price?: never
          monthly_price_id?: never
          one_time_price?: never
          one_time_price_id?: never
          product_id?: string | null
          product_name?: string | null
          product_type?: string | null
          sort_order?: number | null
          tier?: string | null
          yearly_price?: never
          yearly_price_id?: never
          yearly_savings_percent?: never
        }
        Relationships: []
      }
      v_buildings_summary: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          active_meter_count: number | null
          address_addition: string | null
          building_type: string | null
          calc_occupied_count: number | null
          calc_unit_count: number | null
          calc_vacant_count: number | null
          caretaker_owner_id: string | null
          city: string | null
          construction_year: number | null
          country: string | null
          created_at: string | null
          created_by: string | null
          district: string | null
          external_landlord_email: string | null
          external_landlord_name: string | null
          external_landlord_phone: string | null
          house_number: string | null
          id: string | null
          internal_reference: string | null
          land_area_sqm: number | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          monthly_income: number | null
          name: string | null
          notes: string | null
          occupied_unit_count: number | null
          open_task_count: number | null
          org_id: string | null
          owner_type: string | null
          ownership_share: number | null
          ownership_type: string | null
          renovation_year: number | null
          state: string | null
          status: string | null
          street: string | null
          total_living_area_sqm: number | null
          total_usable_area_sqm: number | null
          unit_count: number | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          active_meter_count?: never
          address_addition?: string | null
          building_type?: string | null
          calc_occupied_count?: never
          calc_unit_count?: never
          calc_vacant_count?: never
          caretaker_owner_id?: string | null
          city?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          external_landlord_email?: string | null
          external_landlord_name?: string | null
          external_landlord_phone?: string | null
          house_number?: string | null
          id?: string | null
          internal_reference?: string | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          monthly_income?: never
          name?: string | null
          notes?: string | null
          occupied_unit_count?: number | null
          open_task_count?: never
          org_id?: string | null
          owner_type?: string | null
          ownership_share?: number | null
          ownership_type?: string | null
          renovation_year?: number | null
          state?: string | null
          status?: string | null
          street?: string | null
          total_living_area_sqm?: number | null
          total_usable_area_sqm?: number | null
          unit_count?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          active_meter_count?: never
          address_addition?: string | null
          building_type?: string | null
          calc_occupied_count?: never
          calc_unit_count?: never
          calc_vacant_count?: never
          caretaker_owner_id?: string | null
          city?: string | null
          construction_year?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          district?: string | null
          external_landlord_email?: string | null
          external_landlord_name?: string | null
          external_landlord_phone?: string | null
          house_number?: string | null
          id?: string | null
          internal_reference?: string | null
          land_area_sqm?: number | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          monthly_income?: never
          name?: string | null
          notes?: string | null
          occupied_unit_count?: number | null
          open_task_count?: never
          org_id?: string | null
          owner_type?: string | null
          ownership_share?: number | null
          ownership_type?: string | null
          renovation_year?: number | null
          state?: string | null
          status?: string | null
          street?: string | null
          total_living_area_sqm?: number | null
          total_usable_area_sqm?: number | null
          unit_count?: number | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_cost_type_usage: {
        Row: {
          avg_amount_per_statement: number | null
          betrkv_number: string | null
          category: string | null
          cost_type_id: string | null
          cost_type_name: string | null
          is_system: boolean | null
          total_amount_all_time: number | null
          usage_count: number | null
        }
        Relationships: []
      }
      v_cross_sell_recommendations: {
        Row: {
          category: string | null
          current_app_id: string | null
          has_free_tier: boolean | null
          icon: string | null
          recommendation_text: string | null
          recommended_app_id: string | null
          recommended_app_name: string | null
          starting_price: number | null
          url: string | null
        }
        Relationships: []
      }
      v_current_tariffs: {
        Row: {
          building_id: string | null
          contract_id: string | null
          contract_type: string | null
          org_id: string | null
          provider_name: string | null
          status: string | null
          tariff_components: Json | null
          tariff_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contracts_building"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "fk_contracts_org"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_fintutto_ecosystem: {
        Row: {
          app_id: string | null
          app_name: string | null
          category: string | null
          cross_sell_for: string[] | null
          description: string | null
          has_free_tier: boolean | null
          icon: string | null
          sort_order: number | null
          starting_price: number | null
          tagline: string | null
          tier_count: number | null
          url: string | null
        }
        Insert: {
          app_id?: string | null
          app_name?: string | null
          category?: string | null
          cross_sell_for?: string[] | null
          description?: string | null
          has_free_tier?: never
          icon?: string | null
          sort_order?: number | null
          starting_price?: never
          tagline?: string | null
          tier_count?: never
          url?: string | null
        }
        Update: {
          app_id?: string | null
          app_name?: string | null
          category?: string | null
          cross_sell_for?: string[] | null
          description?: string | null
          has_free_tier?: never
          icon?: string | null
          sort_order?: number | null
          starting_price?: never
          tagline?: string | null
          tier_count?: never
          url?: string | null
        }
        Relationships: []
      }
      v_heatpump_efficiency: {
        Row: {
          avg_outside_temp: number | null
          building_id: string | null
          building_name: string | null
          cop: number | null
          efficiency_rating: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          period_type: string | null
          strom_consumption_kwh: number | null
          strom_meter_number: string | null
          user_id: string | null
          waerme_meter_number: string | null
          waerme_production_kwh: number | null
        }
        Relationships: []
      }
      v_meters_with_last_reading: {
        Row: {
          building_id: string | null
          direction: string | null
          display_name: string | null
          id: string | null
          is_active: boolean | null
          last_reading_date: string | null
          last_reading_value: number | null
          meter_location: string | null
          meter_number: string | null
          meter_type: string | null
          meter_type_category: string | null
          meter_type_icon: string | null
          meter_type_name: string | null
          meter_type_registry_id: string | null
          meter_unit: string | null
          next_reminder_date: string | null
          org_id: string | null
          reading_status: string | null
          requires_conversion: boolean | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "meters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_meters_with_readings: {
        Row: {
          building_address: string | null
          building_id: string | null
          building_name: string | null
          created_at: string | null
          display_color: string | null
          display_icon: string | null
          display_name: string | null
          id: string | null
          is_active: boolean | null
          last_reading_date: string | null
          last_reading_value: number | null
          lr_consumption: number | null
          lr_photo_url: string | null
          lr_reading_date: string | null
          lr_reading_value: number | null
          manufacturer: string | null
          meter_location: string | null
          meter_number: string | null
          meter_subtype: string | null
          meter_type: string | null
          meter_unit: string | null
          next_reminder_date: string | null
          org_id: string | null
          reminder_enabled: boolean | null
          serial_number: string | null
          unit_id: string | null
          unit_name: string | null
          unit_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "meters_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_monthly_consumption: {
        Row: {
          building_id: string | null
          consumption: number | null
          consumption_kwh: number | null
          cost: number | null
          meter_id: string | null
          meter_type: string | null
          month: string | null
          readings_count: number | null
          unit: string | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_my_conversations: {
        Row: {
          building_address: string | null
          building_id: string | null
          building_name: string | null
          conversation_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_id: string | null
          id: string | null
          last_message_at: string | null
          last_message_preview: string | null
          last_read_at: string | null
          my_role: string | null
          notifications_enabled: boolean | null
          org_id: string | null
          other_members: Json | null
          source_app: string | null
          status: string | null
          task_id: string | null
          task_priority: string | null
          task_status: string | null
          task_title: string | null
          title: string | null
          unit_id: string | null
          unread_count: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "conversations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_my_unread_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          app_id: string | null
          category: string | null
          channels: string[] | null
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          expires_at: string | null
          id: string | null
          is_read: boolean | null
          message: string | null
          notification_type: string | null
          org_id: string | null
          priority: string | null
          push_sent: boolean | null
          push_sent_at: string | null
          read_at: string | null
          source_id: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          app_id?: string | null
          category?: string | null
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          org_id?: string | null
          priority?: string | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          app_id?: string | null
          category?: string | null
          channels?: string[] | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string | null
          is_read?: boolean | null
          message?: string | null
          notification_type?: string | null
          org_id?: string | null
          priority?: string | null
          push_sent?: boolean | null
          push_sent_at?: string | null
          read_at?: string | null
          source_id?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_open_tasks: {
        Row: {
          assigned_to: string | null
          building_address: string | null
          building_id: string | null
          building_name: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string | null
          org_id: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          task_type: string | null
          tenant_first_name: string | null
          tenant_id: string | null
          tenant_last_name: string | null
          tenant_phone: string | null
          title: string | null
          unit_id: string | null
          unit_name: string | null
          unit_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["current_tenant_id_calc"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "maintenance_tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_operating_cost_building_summary: {
        Row: {
          active_tenant_count: number | null
          building_id: string | null
          building_name: string | null
          org_id: string | null
          paid_count: number | null
          period_end: string | null
          period_start: string | null
          sent_count: number | null
          statement_id: string | null
          status: string | null
          tenant_count: number | null
          total_costs: number | null
          total_guthaben: number | null
          total_nachzahlung: number | null
          total_prepayments: number | null
          total_result: number | null
          vacancy_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "operating_cost_statements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_operating_cost_deadlines: {
        Row: {
          building_address: string | null
          building_name: string | null
          created_at: string | null
          days_until_deadline: number | null
          deadline: string | null
          deadline_status: string | null
          id: string | null
          org_id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          total_costs: number | null
          total_result: number | null
          total_units: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_statements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_operating_cost_summary: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          building_address: string | null
          building_city: string | null
          building_id: string | null
          building_name: string | null
          calculated_at: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          draft_data: Json | null
          heating_base_percentage: number | null
          heating_consumption_percentage: number | null
          id: string | null
          internal_notes: string | null
          item_count: number | null
          last_step_completed: number | null
          notes: string | null
          org_id: string | null
          period_end: string | null
          period_start: string | null
          previous_statement_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selected_unit_ids: string[] | null
          sent_at: string | null
          source_app: string | null
          status: string | null
          tenant_result_count: number | null
          total_costs: number | null
          total_persons: number | null
          total_prepayments: number | null
          total_result: number | null
          total_sqm: number | null
          total_units: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "operating_cost_statements_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "operating_cost_statements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_building_summary"
            referencedColumns: ["statement_id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_deadlines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operating_cost_statements_previous_statement_id_fkey"
            columns: ["previous_statement_id"]
            isOneToOne: false
            referencedRelation: "v_operating_cost_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      v_partner_overview: {
        Row: {
          billing_model: string | null
          company_name: string | null
          contact_email: string | null
          contract_type: string | null
          created_at: string | null
          id: string | null
          mrr: number | null
          name: string | null
          partner_type: string | null
          referral_code: string | null
          slug: string | null
          status: string | null
          total_organizations: number | null
          total_units: number | null
          total_users: number | null
          white_label_enabled: string | null
        }
        Insert: {
          billing_model?: string | null
          company_name?: string | null
          contact_email?: string | null
          contract_type?: string | null
          created_at?: string | null
          id?: string | null
          mrr?: never
          name?: string | null
          partner_type?: string | null
          referral_code?: string | null
          slug?: string | null
          status?: string | null
          total_organizations?: never
          total_units?: never
          total_users?: never
          white_label_enabled?: never
        }
        Update: {
          billing_model?: string | null
          company_name?: string | null
          contact_email?: string | null
          contract_type?: string | null
          created_at?: string | null
          id?: string | null
          mrr?: never
          name?: string | null
          partner_type?: string | null
          referral_code?: string | null
          slug?: string | null
          status?: string | null
          total_organizations?: never
          total_units?: never
          total_users?: never
          white_label_enabled?: never
        }
        Relationships: []
      }
      v_persona_analytics: {
        Row: {
          conversion_rate: number | null
          converted_count: number | null
          persona_id: string | null
          persona_name: string | null
          total_revenue_eur: number | null
          user_count: number | null
        }
        Relationships: []
      }
      v_recent_activity: {
        Row: {
          activity_time: string | null
          activity_type: string | null
          description: string | null
          details: string | null
          entity_id: string | null
        }
        Relationships: []
      }
      v_stripe_products_with_prices: {
        Row: {
          app_id: string | null
          description: string | null
          features: Json | null
          is_popular: boolean | null
          limits: Json | null
          livemode: boolean | null
          prices: Json | null
          product_active: boolean | null
          product_id: string | null
          product_name: string | null
          product_type: string | null
          sort_order: number | null
          tier: string | null
        }
        Relationships: []
      }
      v_tasks_with_chat: {
        Row: {
          actual_cost: number | null
          assigned_at: string | null
          assigned_by: string | null
          assigned_role_id: string | null
          assigned_to: string | null
          building_id: string | null
          category: string | null
          chat_conversation_id: string | null
          chat_last_message_at: string | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_cost: number | null
          estimated_duration_minutes: number | null
          id: string | null
          is_recurring: boolean | null
          last_message: Json | null
          message_count: number | null
          next_occurrence_date: string | null
          org_id: string | null
          parent_task_id: string | null
          priority: string | null
          recurrence_rule: Json | null
          related_task_ids: string[] | null
          reminder_before_minutes: number | null
          reminder_enabled: boolean | null
          reminder_sent_at: string | null
          reported_by: string | null
          reported_by_type: string | null
          source_app: string | null
          started_at: string | null
          status: string | null
          task_type: string | null
          title: string | null
          unit_id: string | null
          unread_messages: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_role_id_fkey"
            columns: ["assigned_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_my_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["chat_conversation_id"]
          },
          {
            foreignKeyName: "tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "v_tasks_with_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "v_units_with_lease"
            referencedColumns: ["id"]
          },
        ]
      }
      v_tenant_dashboard: {
        Row: {
          base_rent: number | null
          building_address: string | null
          building_city: string | null
          building_id: string | null
          building_name: string | null
          contract_number: string | null
          deposit_amount: number | null
          deposit_paid: number | null
          email: string | null
          first_name: string | null
          heating_prepayment: number | null
          is_indefinite: boolean | null
          last_name: string | null
          lease_end: string | null
          lease_id: string | null
          lease_start: string | null
          mobile: string | null
          payment_due_day: number | null
          phone: string | null
          tenant_id: string | null
          total_rent: number | null
          unit_area: number | null
          unit_floor: number | null
          unit_id: string | null
          unit_name: string | null
          unit_number: string | null
          unit_rooms: number | null
          user_id: string | null
          utility_prepayment: number | null
        }
        Relationships: []
      }
      v_units_with_lease: {
        Row: {
          balcony_area_sqm: number | null
          bathroom_count: number | null
          bedroom_count: number | null
          building_address: string | null
          building_city: string | null
          building_id: string | null
          building_name: string | null
          created_at: string | null
          current_base_rent: number | null
          current_lease_id: string | null
          current_lease_id_calc: string | null
          current_tenant_id: string | null
          current_tenant_id_calc: string | null
          current_total_rent: number | null
          equipment: Json | null
          floor: number | null
          garden_area_sqm: number | null
          has_balcony: boolean | null
          has_basement: boolean | null
          has_elevator_access: boolean | null
          has_garden: boolean | null
          has_terrace: boolean | null
          id: string | null
          lease_end: string | null
          lease_start: string | null
          living_area_sqm: number | null
          name: string | null
          occupancy_status: string | null
          org_id: string | null
          position: string | null
          room_count: number | null
          staircase: string | null
          status: string | null
          target_rent: number | null
          target_utilities: number | null
          tenant_company: string | null
          tenant_email: string | null
          tenant_first_name: string | null
          tenant_last_name: string | null
          unit_number: string | null
          unit_type: string | null
          updated_at: string | null
          usable_area_sqm: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_buildings_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "v_tenant_dashboard"
            referencedColumns: ["building_id"]
          },
          {
            foreignKeyName: "units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      v_unmatched_transactions: {
        Row: {
          amount: number | null
          bank_account_id: string | null
          bank_name: string | null
          booking_date: string | null
          category: string | null
          counterpart_bic: string | null
          counterpart_iban: string | null
          counterpart_name: string | null
          created_at: string | null
          currency: string | null
          finapi_transaction_id: string | null
          iban_masked: string | null
          id: string | null
          is_matched: boolean | null
          match_confidence: number | null
          match_reason: string | null
          matched_at: string | null
          matched_by: string | null
          matched_lease_id: string | null
          matched_tenant_id: string | null
          payment_id: string | null
          purpose: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          value_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      activate_seat: {
        Args: { p_invitation_id: string; p_user_id: string }
        Returns: Json
      }
      calculate_cop: {
        Args: { strom_kwh: number; waerme_kwh: number }
        Returns: number
      }
      calculate_day_factor: {
        Args: { p_days_in_period: number; p_total_days: number }
        Returns: number
      }
      calculate_gas_kwh: {
        Args: { brennwert: number; volume_m3: number; zustandszahl: number }
        Returns: number
      }
      calculate_indexmiete: {
        Args: {
          p_aktuelle_miete: number
          p_aktueller_index: number
          p_basis_index: number
        }
        Returns: {
          erhoehung_betrag: number
          neue_miete: number
          steigerung_prozent: number
        }[]
      }
      calculate_persona: {
        Args: {
          p_age_range?: string
          p_experience_level: string
          p_main_goal?: string
          p_portfolio_size: string
          p_role: string
        }
        Returns: Json
      }
      can_use_app: {
        Args: { p_app_id: string; p_org_id: string }
        Returns: boolean
      }
      check_feature_access: {
        Args: { p_feature: string; p_tool_type: string; p_user_id: string }
        Returns: boolean
      }
      check_limit: {
        Args: {
          p_app_id: string
          p_current_count: number
          p_limit_key: string
          p_user_id: string
        }
        Returns: Json
      }
      check_mietpreisbremse: {
        Args: { p_plz: string }
        Returns: {
          bundesland: string
          gilt: boolean
          gueltig_bis: string
          verordnung: string
        }[]
      }
      check_org_limit: {
        Args: { p_limit_key: string; p_org_id: string }
        Returns: number
      }
      check_service_access: {
        Args: { p_app_id: string; p_service_key: string; p_user_id: string }
        Returns: {
          allowed: boolean
          daily_remaining: number
          monthly_remaining: number
          reason: string
        }[]
      }
      check_template_access: {
        Args: { p_template_id: string; p_user_id: string }
        Returns: Json
      }
      check_tool_usage_limit: {
        Args: {
          p_ip_address?: string
          p_lead_id?: string
          p_tool_type?: string
          p_user_id?: string
        }
        Returns: Json
      }
      convert_lead_to_user: {
        Args: { p_lead_id: string; p_product?: string; p_user_id: string }
        Returns: boolean
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_app_id: string
          p_description?: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_org_id: string
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_lead: {
        Args: {
          p_calculation_data?: Json
          p_email: string
          p_marketing_consent?: boolean
          p_source_app: string
          p_source_tool: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_label?: string
          p_action_url?: string
          p_app_id?: string
          p_category?: string
          p_channels?: string[]
          p_message: string
          p_notification_type?: string
          p_org_id?: string
          p_priority?: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      decrement_credits: {
        Args: { p_amount?: number; p_credit_type: string; p_user_id: string }
        Returns: boolean
      }
      format_price: {
        Args: { p_amount: number; p_currency?: string }
        Returns: string
      }
      generate_api_key_prefix: { Args: never; Returns: string }
      generate_referral_code: { Args: { p_base: string }; Returns: string }
      get_ai_model_for_user: {
        Args: { p_app_id: string; p_feature: string; p_user_id: string }
        Returns: {
          daily_limit: number
          model_id: string
          model_name: string
          monthly_limit: number
          tier: string
        }[]
      }
      get_app_products: {
        Args: { p_app_id: string; p_livemode?: boolean }
        Returns: Json
      }
      get_bundles_for_persona: {
        Args: { p_persona_id: string }
        Returns: {
          bundle_id: string
          description: string
          name: string
          price_cents: number
          savings_percent: number
        }[]
      }
      get_co2_stufe: {
        Args: { p_co2_kg_pro_qm: number }
        Returns: {
          beschreibung: string
          mieter_prozent: number
          stufe: number
          vermieter_prozent: number
        }[]
      }
      get_contracts_for_period: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_unit_ids: string[]
        }
        Returns: {
          contract_id: string
          days_in_period: number
          effective_end: string
          effective_start: string
          end_date: string
          heating_prepayment: number
          number_of_persons: number
          start_date: string
          tenant_id: string
          tenant_name: string
          unit_id: string
          utility_prepayment: number
        }[]
      }
      get_documents_for_app: {
        Args: {
          p_app_id: string
          p_building_id?: string
          p_org_id?: string
          p_tenant_id?: string
          p_user_id: string
        }
        Returns: {
          context_type: string
          created_at: string
          file_name: string
          file_url: string
          has_watermark: boolean
          id: string
          template_id: string
          template_name: string
          title: string
        }[]
      }
      get_period_days: {
        Args: { p_period_end: string; p_period_start: string }
        Returns: number
      }
      get_price_id: {
        Args: {
          p_app_id: string
          p_interval?: string
          p_livemode?: boolean
          p_tier: string
        }
        Returns: string
      }
      get_product_with_prices: { Args: { p_product_id: string }; Returns: Json }
      get_service_config: { Args: { p_service_key: string }; Returns: Json }
      get_subscription_tier: {
        Args: { p_app_prefix: string; p_user_id: string }
        Returns: string
      }
      get_tool_config: { Args: { p_tool_id: string }; Returns: Json }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_app_access: {
        Args: { p_app_id: string; p_user_id: string }
        Returns: Json
      }
      get_vacancies_for_period: {
        Args: {
          p_period_end: string
          p_period_start: string
          p_unit_ids: string[]
        }
        Returns: {
          days_in_period: number
          unit_id: string
          vacancy_end: string
          vacancy_start: string
        }[]
      }
      has_active_subscription: {
        Args: { p_product: string; p_user_id: string }
        Returns: boolean
      }
      has_role_by_name: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      increment_ai_rate_limit: {
        Args: {
          p_app_id: string
          p_feature: string
          p_tokens?: number
          p_user_id: string
        }
        Returns: {
          allowed: boolean
          requests_remaining: number
          reset_at: string
        }[]
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type?: string
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: string
      }
      log_ai_cross_sell: {
        Args: {
          p_app_source?: string
          p_org_id: string
          p_recommendation: Json
          p_trigger_event: string
          p_trigger_page?: string
          p_user_id: string
        }
        Returns: string
      }
      log_ai_usage: {
        Args: {
          p_app_id: string
          p_cached_tokens?: number
          p_conversation_id?: string
          p_error_message?: string
          p_feature: string
          p_input_tokens: number
          p_metadata?: Json
          p_model_id: string
          p_org_id: string
          p_output_tokens: number
          p_response_time_ms?: number
          p_success?: boolean
          p_user_id: string
        }
        Returns: string
      }
      log_service_usage: {
        Args: {
          p_app_id: string
          p_charged_amount?: number
          p_metadata?: Json
          p_operation: string
          p_org_id: string
          p_our_cost?: number
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_response_status: string
          p_response_time_ms?: number
          p_service_key: string
          p_user_id: string
        }
        Returns: string
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_messages_read: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      rate_cop: { Args: { cop: number }; Returns: string }
      record_document_download: {
        Args: {
          p_document_id: string
          p_download_type: string
          p_payment_cents?: number
          p_user_id: string
          p_was_paid?: boolean
        }
        Returns: undefined
      }
      record_metric: {
        Args: {
          p_app_id?: string
          p_category?: string
          p_name: string
          p_value: number
        }
        Returns: string
      }
      save_calculation: {
        Args: {
          p_building_id?: string
          p_input_data: Json
          p_lead_id?: string
          p_org_id?: string
          p_result_data: Json
          p_source_app?: string
          p_tool_type: string
          p_unit_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      suggest_new_prepayment: {
        Args: {
          p_buffer_percent?: number
          p_days_in_period: number
          p_total_costs: number
          p_total_days: number
        }
        Returns: number
      }
      update_task_status: {
        Args: { p_comment?: string; p_new_status: string; p_task_id: string }
        Returns: undefined
      }
    }
    Enums: {
      esignature_status:
        | "draft"
        | "pending"
        | "sent"
        | "viewed"
        | "signed"
        | "completed"
        | "declined"
        | "expired"
        | "voided"
      fuel_type:
        | "gas"
        | "oil"
        | "fernwaerme"
        | "pellets"
        | "waermepumpe"
        | "kohle"
        | "strom"
      letter_status:
        | "pending"
        | "submitted"
        | "printed"
        | "shipped"
        | "in_delivery"
        | "delivered"
        | "returned"
        | "failed"
      listing_status: "draft" | "active" | "paused" | "expired" | "deleted"
      match_action: "auto_assign" | "review" | "manual" | "ignored"
      schufa_empfehlung: "EMPFOHLEN" | "BEDINGT_EMPFOHLEN" | "NICHT_EMPFOHLEN"
      schufa_risiko: "SEHR_GERING" | "GERING" | "NORMAL" | "ERHOEHT" | "HOCH"
      screening_status:
        | "EMPFOHLEN"
        | "BEDINGT_EMPFOHLEN"
        | "MIT_VORBEHALT"
        | "NICHT_EMPFOHLEN"
      signatur_level: "EES" | "FES" | "QES"
      versandart:
        | "STANDARD"
        | "EINSCHREIBEN"
        | "EINSCHREIBEN_RUECKSCHEIN"
        | "EINWURF"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      esignature_status: [
        "draft",
        "pending",
        "sent",
        "viewed",
        "signed",
        "completed",
        "declined",
        "expired",
        "voided",
      ],
      fuel_type: [
        "gas",
        "oil",
        "fernwaerme",
        "pellets",
        "waermepumpe",
        "kohle",
        "strom",
      ],
      letter_status: [
        "pending",
        "submitted",
        "printed",
        "shipped",
        "in_delivery",
        "delivered",
        "returned",
        "failed",
      ],
      listing_status: ["draft", "active", "paused", "expired", "deleted"],
      match_action: ["auto_assign", "review", "manual", "ignored"],
      schufa_empfehlung: ["EMPFOHLEN", "BEDINGT_EMPFOHLEN", "NICHT_EMPFOHLEN"],
      schufa_risiko: ["SEHR_GERING", "GERING", "NORMAL", "ERHOEHT", "HOCH"],
      screening_status: [
        "EMPFOHLEN",
        "BEDINGT_EMPFOHLEN",
        "MIT_VORBEHALT",
        "NICHT_EMPFOHLEN",
      ],
      signatur_level: ["EES", "FES", "QES"],
      versandart: [
        "STANDARD",
        "EINSCHREIBEN",
        "EINSCHREIBEN_RUECKSCHEIN",
        "EINWURF",
      ],
    },
  },
} as const
