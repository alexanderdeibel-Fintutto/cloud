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
    }
  }
}
