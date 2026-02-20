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
          background_gradient: string | null
          created_at: string | null
          cta_text: string
          cta_url: string | null
          description: string | null
          headline: string
          icon_name: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          source_app_id: string
          target_app_id: string
          updated_at: string | null
        }
        Insert: {
          background_gradient?: string | null
          created_at?: string | null
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          headline: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          source_app_id: string
          target_app_id: string
          updated_at?: string | null
        }
        Update: {
          background_gradient?: string | null
          created_at?: string | null
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          headline?: string
          icon_name?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          source_app_id?: string
          target_app_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
          postal_code: string | null
          total_area: number | null
          total_units: number | null
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          postal_code?: string | null
          total_area?: number | null
          total_units?: number | null
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          postal_code?: string | null
          total_area?: number | null
          total_units?: number | null
          updated_at?: string | null
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
        ]
      }
      documents: {
        Row: {
          building_id: string | null
          content_json: Json | null
          created_at: string | null
          document_type: string | null
          file_size: number | null
          file_url: string | null
          id: string
          organization_id: string | null
          title: string
          unit_id: string | null
          user_id: string | null
        }
        Insert: {
          building_id?: string | null
          content_json?: Json | null
          created_at?: string | null
          document_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          title: string
          unit_id?: string | null
          user_id?: string | null
        }
        Update: {
          building_id?: string | null
          content_json?: Json | null
          created_at?: string | null
          document_type?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          title?: string
          unit_id?: string | null
          user_id?: string | null
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
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          status: Database["public"]["Enums"]["lease_status"] | null
          tenant_id: string | null
          unit_id: string
          updated_at: string | null
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
          status?: Database["public"]["Enums"]["lease_status"] | null
          tenant_id?: string | null
          unit_id: string
          updated_at?: string | null
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
          status?: Database["public"]["Enums"]["lease_status"] | null
          tenant_id?: string | null
          unit_id?: string
          updated_at?: string | null
          utilities_advance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_readings: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          image_url: string | null
          is_verified: boolean | null
          meter_id: string
          reading_date: string
          reading_value: number
          source: Database["public"]["Enums"]["reading_source"] | null
          submitted_by: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          meter_id: string
          reading_date?: string
          reading_value: number
          source?: Database["public"]["Enums"]["reading_source"] | null
          submitted_by?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean | null
          meter_id?: string
          reading_date?: string
          reading_value?: number
          source?: Database["public"]["Enums"]["reading_source"] | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meter_readings_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meters: {
        Row: {
          building_id: string | null
          created_at: string | null
          id: string
          installation_date: string | null
          meter_number: string
          meter_type: Database["public"]["Enums"]["meter_type"]
          replaced_by: string | null
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          meter_number: string
          meter_type: Database["public"]["Enums"]["meter_type"]
          replaced_by?: string | null
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          id?: string
          installation_date?: string | null
          meter_number?: string
          meter_type?: Database["public"]["Enums"]["meter_type"]
          replaced_by?: string | null
          unit_id?: string | null
          updated_at?: string | null
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
            foreignKeyName: "meters_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "meters"
            referencedColumns: ["id"]
          },
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
          allocation_key: Database["public"]["Enums"]["allocation_key"] | null
          amount: number
          cost_type: string
          created_at: string | null
          id: string
          operating_cost_id: string
        }
        Insert: {
          allocation_key?: Database["public"]["Enums"]["allocation_key"] | null
          amount: number
          cost_type: string
          created_at?: string | null
          id?: string
          operating_cost_id: string
        }
        Update: {
          allocation_key?: Database["public"]["Enums"]["allocation_key"] | null
          amount?: number
          cost_type?: string
          created_at?: string | null
          id?: string
          operating_cost_id?: string
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
          building_id: string
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["cost_status"] | null
          updated_at: string | null
        }
        Insert: {
          building_id: string
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["cost_status"] | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["cost_status"] | null
          updated_at?: string | null
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
          type: Database["public"]["Enums"]["org_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          type?: Database["public"]["Enums"]["org_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          type?: Database["public"]["Enums"]["org_type"] | null
        }
        Relationships: []
      }
      products: {
        Row: {
          app_id: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          sort_order: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          app_id: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          sort_order?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          is_redeemed: boolean
          redeemed_at: string | null
          referral_id: string
          reward_type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          referral_id: string
          reward_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          referral_id?: string
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_id: string
          status: string
          target_app_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id: string
          status?: string
          target_app_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_id?: string
          status?: string
          target_app_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          building_id: string | null
          category: Database["public"]["Enums"]["task_category"] | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          unit_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          building_id?: string | null
          category?: Database["public"]["Enums"]["task_category"] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          building_id?: string | null
          category?: Database["public"]["Enums"]["task_category"] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      units: {
        Row: {
          area: number | null
          building_id: string
          created_at: string | null
          floor: number | null
          id: string
          rooms: number | null
          status: Database["public"]["Enums"]["unit_status"] | null
          type: Database["public"]["Enums"]["unit_type"] | null
          unit_number: string
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          building_id: string
          created_at?: string | null
          floor?: number | null
          id?: string
          rooms?: number | null
          status?: Database["public"]["Enums"]["unit_status"] | null
          type?: Database["public"]["Enums"]["unit_type"] | null
          unit_number: string
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          building_id?: string
          created_at?: string | null
          floor?: number | null
          id?: string
          rooms?: number | null
          status?: Database["public"]["Enums"]["unit_status"] | null
          type?: Database["public"]["Enums"]["unit_type"] | null
          unit_number?: string
          updated_at?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: { p_app_id: string; p_user_id: string }
        Returns: string
      }
      get_user_org_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_can_access_building: {
        Args: { _building_id: string }
        Returns: boolean
      }
      user_can_access_meter: { Args: { _meter_id: string }; Returns: boolean }
      user_can_access_unit: { Args: { _unit_id: string }; Returns: boolean }
    }
    Enums: {
      allocation_key: "area" | "units" | "persons" | "consumption"
      app_role: "admin" | "vermieter" | "mieter" | "hausmeister"
      cost_status: "draft" | "calculated" | "sent"
      lease_status: "active" | "terminated" | "pending"
      meter_type: "electricity" | "gas" | "water_cold" | "water_hot" | "heating"
      org_type: "vermieter" | "hausverwaltung" | "makler"
      reading_source: "manual" | "ocr" | "api"
      task_category: "repair" | "maintenance" | "inspection"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "open" | "in_progress" | "completed"
      unit_status: "rented" | "available" | "maintenance"
      unit_type: "apartment" | "commercial" | "parking"
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
      allocation_key: ["area", "units", "persons", "consumption"],
      app_role: ["admin", "vermieter", "mieter", "hausmeister"],
      cost_status: ["draft", "calculated", "sent"],
      lease_status: ["active", "terminated", "pending"],
      meter_type: ["electricity", "gas", "water_cold", "water_hot", "heating"],
      org_type: ["vermieter", "hausverwaltung", "makler"],
      reading_source: ["manual", "ocr", "api"],
      task_category: ["repair", "maintenance", "inspection"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["open", "in_progress", "completed"],
      unit_status: ["rented", "available", "maintenance"],
      unit_type: ["apartment", "commercial", "parking"],
    },
  },
} as const
