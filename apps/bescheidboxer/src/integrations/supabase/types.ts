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
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          referral_code: string | null
          referred_by: string | null
          referral_credits: number
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
          referred_by?: string | null
        }
        Update: {
          name?: string | null
          tier?: 'free' | 'basic' | 'premium' | 'professional'
          checks_used?: number
          checks_limit?: number
          referral_credits?: number
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_email: string
          referred_user_id: string | null
          status: 'pending' | 'registered' | 'converted'
          referral_code: string
          reward_claimed: boolean
          created_at: string
          converted_at: string | null
        }
        Insert: {
          referrer_id: string
          referred_email: string
          referral_code: string
          status?: 'pending' | 'registered' | 'converted'
        }
        Update: {
          status?: 'pending' | 'registered' | 'converted'
          referred_user_id?: string | null
          reward_claimed?: boolean
          converted_at?: string | null
        }
      }
      bescheide: {
        Row: {
          id: string
          user_id: string
          titel: string
          typ: 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'koerperschaftsteuer' | 'grundsteuer' | 'sonstige'
          steuerjahr: number
          eingangsdatum: string
          finanzamt: string
          aktenzeichen: string | null
          status: 'neu' | 'in_pruefung' | 'geprueft' | 'einspruch' | 'erledigt'
          festgesetzte_steuer: number | null
          erwartete_steuer: number | null
          abweichung: number | null
          abweichung_prozent: number | null
          einspruchsfrist: string | null
          dokument_url: string | null
          notizen: string | null
          pruefungsergebnis: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          titel: string
          typ: 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'koerperschaftsteuer' | 'grundsteuer' | 'sonstige'
          steuerjahr: number
          finanzamt: string
          aktenzeichen?: string | null
          status?: 'neu' | 'in_pruefung' | 'geprueft' | 'einspruch' | 'erledigt'
          festgesetzte_steuer?: number | null
          erwartete_steuer?: number | null
          abweichung?: number | null
          abweichung_prozent?: number | null
          einspruchsfrist?: string | null
          dokument_url?: string | null
          notizen?: string | null
          pruefungsergebnis?: Record<string, unknown> | null
        }
        Update: {
          titel?: string
          typ?: 'einkommensteuer' | 'gewerbesteuer' | 'umsatzsteuer' | 'koerperschaftsteuer' | 'grundsteuer' | 'sonstige'
          status?: 'neu' | 'in_pruefung' | 'geprueft' | 'einspruch' | 'erledigt'
          festgesetzte_steuer?: number | null
          erwartete_steuer?: number | null
          abweichung?: number | null
          abweichung_prozent?: number | null
          einspruchsfrist?: string | null
          dokument_url?: string | null
          notizen?: string | null
          pruefungsergebnis?: Record<string, unknown> | null
        }
      }
      fristen: {
        Row: {
          id: string
          user_id: string
          bescheid_id: string
          typ: 'einspruch' | 'zahlung' | 'nachreichung'
          fristdatum: string
          erledigt: boolean
          notiz: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bescheid_id: string
          typ: 'einspruch' | 'zahlung' | 'nachreichung'
          fristdatum: string
          erledigt?: boolean
          notiz?: string | null
        }
        Update: {
          typ?: 'einspruch' | 'zahlung' | 'nachreichung'
          fristdatum?: string
          erledigt?: boolean
          notiz?: string | null
        }
      }
      einsprueche: {
        Row: {
          id: string
          user_id: string
          bescheid_id: string
          status: 'entwurf' | 'eingereicht' | 'in_bearbeitung' | 'entschieden' | 'zurueckgenommen'
          begruendung: string
          forderung: number | null
          eingereicht_am: string | null
          frist: string | null
          antwort_erhalten: string | null
          ergebnis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bescheid_id: string
          begruendung: string
          status?: 'entwurf' | 'eingereicht' | 'in_bearbeitung' | 'entschieden' | 'zurueckgenommen'
          forderung?: number | null
          eingereicht_am?: string | null
          frist?: string | null
        }
        Update: {
          status?: 'entwurf' | 'eingereicht' | 'in_bearbeitung' | 'entschieden' | 'zurueckgenommen'
          begruendung?: string
          forderung?: number | null
          eingereicht_am?: string | null
          antwort_erhalten?: string | null
          ergebnis?: string | null
        }
      }
      dokumente: {
        Row: {
          id: string
          user_id: string
          bescheid_id: string | null
          dateiname: string
          dateityp: string
          dateigroesse: number | null
          storage_path: string
          ocr_text: string | null
          ocr_status: string
          created_at: string
        }
        Insert: {
          user_id: string
          bescheid_id?: string | null
          dateiname: string
          dateityp: string
          dateigroesse?: number | null
          storage_path: string
          ocr_text?: string | null
          ocr_status?: string
        }
        Update: {
          bescheid_id?: string | null
          ocr_text?: string | null
          ocr_status?: string
        }
      }
    }
  }
}
