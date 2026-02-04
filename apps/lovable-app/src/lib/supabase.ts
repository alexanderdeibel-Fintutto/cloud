import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          legal_form: string;
          tax_id: string | null;
          vat_id: string | null;
          street: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'accountant' | 'member' | 'viewer';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organization_members']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['organization_members']['Insert']>;
      };
      accounts: {
        Row: {
          id: string;
          organization_id: string;
          account_number: string;
          name: string;
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['accounts']['Insert']>;
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          type: 'customer' | 'supplier' | 'both';
          company_name: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          street: string | null;
          postal_code: string | null;
          city: string | null;
          country: string;
          vat_id: string | null;
          customer_number: string | null;
          supplier_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string;
          invoice_number: string;
          invoice_date: string;
          due_date: string;
          net_amount: number;
          tax_amount: number;
          gross_amount: number;
          paid_amount: number;
          status: 'draft' | 'sent' | 'paid' | 'partial_paid' | 'overdue' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      receipts: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          receipt_number: string | null;
          receipt_date: string;
          due_date: string | null;
          net_amount: number;
          tax_amount: number;
          gross_amount: number;
          type: 'incoming_invoice' | 'expense' | 'bank_fee' | 'other';
          status: 'pending' | 'recognized' | 'verified' | 'booked';
          file_url: string | null;
          ocr_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['receipts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['receipts']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          organization_id: string;
          booking_number: string;
          booking_date: string;
          description: string;
          amount: number;
          type: 'standard' | 'opening' | 'closing' | 'reversal';
          status: 'draft' | 'posted' | 'reversed';
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      booking_lines: {
        Row: {
          id: string;
          booking_id: string;
          debit_account_id: string;
          credit_account_id: string;
          amount: number;
          tax_rate: number | null;
          tax_amount: number | null;
          description: string | null;
        };
        Insert: Omit<Database['public']['Tables']['booking_lines']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['booking_lines']['Insert']>;
      };
      bank_accounts: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          iban: string;
          bic: string | null;
          bank_name: string | null;
          balance: number;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bank_accounts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bank_accounts']['Insert']>;
      };
      bank_transactions: {
        Row: {
          id: string;
          bank_account_id: string;
          date: string;
          amount: number;
          counterparty_name: string | null;
          counterparty_iban: string | null;
          reference: string;
          status: 'unprocessed' | 'matched' | 'booked';
          booking_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bank_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bank_transactions']['Insert']>;
      };
    };
  };
}
