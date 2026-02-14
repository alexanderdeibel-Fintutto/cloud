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
  }
}
