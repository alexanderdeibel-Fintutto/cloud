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
      ai_cross_sell_triggers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message_template: string
          priority: number | null
          source_app_id: string | null
          target_app_id: string | null
          trigger_condition: Json | null
          trigger_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template: string
          priority?: number | null
          source_app_id?: string | null
          target_app_id?: string | null
          trigger_condition?: Json | null
          trigger_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: string
          priority?: number | null
          source_app_id?: string | null
          target_app_id?: string | null
          trigger_condition?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_cross_sell_triggers_source_app_id_fkey"
            columns: ["source_app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "ai_cross_sell_triggers_target_app_id_fkey"
            columns: ["target_app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["app_id"]
          },
        ]
      }
      apps_registry: {
        Row: {
          app_id: string
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          url: string | null
        }
        Insert: {
          app_id: string
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          url?: string | null
        }
        Update: {
          app_id?: string
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          url?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          address: string
          company_id: string
          created_at: string
          id: string
          name: string
          total_area: number | null
          units_count: number
          year_built: number | null
        }
        Insert: {
          address: string
          company_id: string
          created_at?: string
          id?: string
          name: string
          total_area?: number | null
          units_count?: number
          year_built?: number | null
        }
        Update: {
          address?: string
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          total_area?: number | null
          units_count?: number
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      document_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          company_id: string
          created_at: string
          document_id: string
          id: string
          question: string
          question_type: string
          status: string
          suggested_answer: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          company_id: string
          created_at?: string
          document_id: string
          id?: string
          question: string
          question_type?: string
          status?: string
          suggested_answer?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          company_id?: string
          created_at?: string
          document_id?: string
          id?: string
          question?: string
          question_type?: string
          status?: string
          suggested_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_questions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_questions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          amount: number | null
          building_id: string | null
          company_id: string
          created_at: string
          document_type: string | null
          extracted_data: Json | null
          file_name: string
          file_size_bytes: number | null
          file_url: string
          id: string
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          processed_at: string | null
          sender_email: string
          status: string
          subject: string | null
          task_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount?: number | null
          building_id?: string | null
          company_id: string
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          file_name: string
          file_size_bytes?: number | null
          file_url: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          processed_at?: string | null
          sender_email: string
          status?: string
          subject?: string | null
          task_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number | null
          building_id?: string | null
          company_id?: string
          created_at?: string
          document_type?: string | null
          extracted_data?: Json | null
          file_name?: string
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          processed_at?: string | null
          sender_email?: string
          status?: string
          subject?: string | null
          task_id?: string | null
          updated_at?: string
          vendor_name?: string | null
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
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      email_inboxes: {
        Row: {
          company_id: string
          created_at: string
          email_address: string
          email_prefix: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email_address: string
          email_prefix: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email_address?: string
          email_prefix?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_inboxes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          app_id: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number | null
          stripe_price_id: string | null
        }
        Insert: {
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          app_id?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number | null
          stripe_price_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "apps_registry"
            referencedColumns: ["app_id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          app_id: string
          code: string
          created_at: string | null
          discount_percent: number | null
          id: string
          is_active: boolean | null
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          updated_at: string | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          app_id: string
          code: string
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          app_id?: string
          code?: string
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          amount_saved: number | null
          app_id: string
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code_id: string
          referred_email: string | null
          referred_user_id: string | null
          status: string
          stripe_subscription_id: string | null
        }
        Insert: {
          amount_saved?: number | null
          app_id: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code_id: string
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
        }
        Update: {
          amount_saved?: number | null
          app_id?: string
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code_id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      task_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_photos: {
        Row: {
          id: string
          task_id: string
          type: string
          uploaded_at: string
          uploaded_by: string
          url: string
        }
        Insert: {
          id?: string
          task_id: string
          type?: string
          uploaded_at?: string
          uploaded_by: string
          url: string
        }
        Update: {
          id?: string
          task_id?: string
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          building_id: string | null
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          reported_by_name: string | null
          status: string
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          building_id?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          reported_by_name?: string | null
          status?: string
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          building_id?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          reported_by_name?: string | null
          status?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          area: number | null
          building_id: string
          floor: number | null
          id: string
          status: string
          tenant_email: string | null
          tenant_name: string | null
          tenant_phone: string | null
          unit_number: string
        }
        Insert: {
          area?: number | null
          building_id: string
          floor?: number | null
          id?: string
          status?: string
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          unit_number: string
        }
        Update: {
          area?: number | null
          building_id?: string
          floor?: number | null
          id?: string
          status?: string
          tenant_email?: string | null
          tenant_name?: string | null
          tenant_phone?: string | null
          unit_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_assignments: {
        Row: {
          assigned_at: string
          company_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          company_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          company_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          app_id: string
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verified_senders: {
        Row: {
          added_by: string
          company_id: string
          created_at: string
          email: string
          id: string
          is_verified: boolean
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          added_by: string
          company_id: string
          created_at?: string
          email: string
          id?: string
          is_verified?: boolean
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          added_by?: string
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          is_verified?: boolean
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verified_senders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
