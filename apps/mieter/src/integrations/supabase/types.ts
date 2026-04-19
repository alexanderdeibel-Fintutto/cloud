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
      buildings: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          postal_code: string | null
          total_area: number | null
          total_units: number | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          postal_code?: string | null
          total_area?: number | null
          total_units?: number | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          postal_code?: string | null
          total_area?: number | null
          total_units?: number | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buildings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buildings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          stripe_payment_id: string | null
          tool_id: string | null
          tool_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          tool_id?: string | null
          tool_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          stripe_payment_id?: string | null
          tool_id?: string | null
          tool_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_json: Json | null
          created_at: string | null
          document_type: string | null
          file_size: number | null
          file_url: string | null
          id: string
          organization_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          content_json?: Json | null
          created_at?: string | null
          document_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          content_json?: Json | null
          created_at?: string | null
          document_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          priority: string
          status: string
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string | null
          deposit_amount: number | null
          end_date: string | null
          id: string
          payment_day: number | null
          rent_amount: number
          start_date: string
          status: string | null
          tenant_id: string | null
          unit_id: string | null
          utilities_advance: number | null
        }
        Insert: {
          created_at?: string | null
          deposit_amount?: number | null
          end_date?: string | null
          id?: string
          payment_day?: number | null
          rent_amount: number
          start_date: string
          status?: string | null
          tenant_id?: string | null
          unit_id?: string | null
          utilities_advance?: number | null
        }
        Update: {
          created_at?: string | null
          deposit_amount?: number | null
          end_date?: string | null
          id?: string
          payment_day?: number | null
          rent_amount?: number
          start_date?: string
          status?: string | null
          tenant_id?: string | null
          unit_id?: string | null
          utilities_advance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      meter_readings: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          image_url: string | null
          is_verified: boolean | null
          meter_id: string | null
          meter_type: string
          previous_value: number | null
          reading_date: string
          source: string | null
          user_id: string
          value: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          meter_id?: string | null
          meter_type: string
          previous_value?: number | null
          reading_date?: string
          source?: string | null
          user_id: string
          value: number
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          meter_id?: string | null
          meter_type?: string
          previous_value?: number | null
          reading_date?: string
          source?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
        ]
      }
      meters: {
        Row: {
          created_at: string | null
          id: string
          installation_date: string | null
          meter_number: string
          meter_type: string
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          installation_date?: string | null
          meter_number: string
          meter_type: string
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          installation_date?: string | null
          meter_number?: string
          meter_type?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_cost_items: {
        Row: {
          allocation_key: string | null
          amount: number
          cost_type: string
          created_at: string | null
          id: string
          operating_cost_id: string | null
        }
        Insert: {
          allocation_key?: string | null
          amount: number
          cost_type: string
          created_at?: string | null
          id?: string
          operating_cost_id?: string | null
        }
        Update: {
          allocation_key?: string | null
          amount?: number
          cost_type?: string
          created_at?: string | null
          id?: string
          operating_cost_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_cost_items_operating_cost_id_fkey"
            columns: ["operating_cost_id"]
            isOneToOne: false
            referencedRelation: "operating_costs"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_costs: {
        Row: {
          building_id: string | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          status: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operating_costs_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          stripe_customer_id: string | null
          subscription_plan: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          type?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_date: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_date: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_date?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          organization_id: string | null
          phone: string | null
          referred_by: string | null
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          phone?: string | null
          referred_by?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          phone?: string | null
          referred_by?: string | null
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_clicks: {
        Row: {
          app_id: string
          clicked_at: string
          id: string
          ip_hash: string | null
          referral_code: string
          user_agent: string | null
        }
        Insert: {
          app_id: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          referral_code: string
          user_agent?: string | null
        }
        Update: {
          app_id?: string
          clicked_at?: string
          id?: string
          ip_hash?: string | null
          referral_code?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_clicks_referral_code_fkey"
            columns: ["referral_code"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          granted_at: string | null
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          reward_amount: number
          reward_type: string
          status: string
        }
        Insert: {
          created_at?: string
          granted_at?: string | null
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          reward_amount?: number
          reward_type?: string
          status?: string
        }
        Update: {
          created_at?: string
          granted_at?: string | null
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          reward_amount?: number
          reward_type?: string
          status?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          unit_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          unit_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_usage_log: {
        Row: {
          access_method: string
          created_at: string
          credits_cost: number
          id: string
          tool_id: string
          tool_type: string
          user_id: string
        }
        Insert: {
          access_method?: string
          created_at?: string
          credits_cost?: number
          id?: string
          tool_id: string
          tool_type: string
          user_id: string
        }
        Update: {
          access_method?: string
          created_at?: string
          credits_cost?: number
          id?: string
          tool_id?: string
          tool_type?: string
          user_id?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          address: string
          area: number | null
          building_id: string | null
          created_at: string
          floor: number | null
          id: string
          rent_cold: number
          rent_utilities: number
          rooms: number | null
          status: string | null
          type: string | null
          unit_number: string | null
          updated_at: string
        }
        Insert: {
          address: string
          area?: number | null
          building_id?: string | null
          created_at?: string
          floor?: number | null
          id?: string
          rent_cold?: number
          rent_utilities?: number
          rooms?: number | null
          status?: string | null
          type?: string | null
          unit_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          area?: number | null
          building_id?: string | null
          created_at?: string
          floor?: number | null
          id?: string
          rent_cold?: number
          rent_utilities?: number
          rooms?: number | null
          status?: string | null
          type?: string | null
          unit_number?: string | null
          updated_at?: string
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
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      organizations_safe: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          stripe_customer_id?: never
          subscription_plan?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          stripe_customer_id?: never
          subscription_plan?: string | null
          type?: string | null
        }
        Relationships: []
      }
      profiles_safe: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          phone: string | null
          unit_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          phone?: never
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          organization_id?: string | null
          phone?: never
          unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_manage_building: {
        Args: { _building_id: string; _user_id: string }
        Returns: boolean
      }
      generate_referral_code: { Args: never; Returns: string }
      get_organization_details: {
        Args: { org_id: string }
        Returns: {
          created_at: string
          id: string
          name: string
          stripe_customer_id: string
          subscription_plan: string
          type: string
        }[]
      }
      get_user_building_id: { Args: { _user_id: string }; Returns: string }
      get_user_unit_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      same_organization: {
        Args: { _user_id1: string; _user_id2: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vermieter" | "mieter" | "hausmeister" | "user"
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
      app_role: ["admin", "vermieter", "mieter", "hausmeister", "user"],
    },
  },
} as const
