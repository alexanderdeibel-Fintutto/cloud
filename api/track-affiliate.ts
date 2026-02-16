import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TrackRequest {
  partnerId: string
  partnerCategory: string
  sourceChecker: string
  sourcePage: string
  userId?: string
  sessionId?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { partnerId, partnerCategory, sourceChecker, sourcePage, userId, sessionId } = req.body as TrackRequest

    if (!partnerId || !sourceChecker) {
      return res.status(400).json({ error: 'partnerId and sourceChecker required' })
    }

    // Log affiliate click
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        partner_id: partnerId,
        partner_category: partnerCategory || 'unknown',
        source_checker: sourceChecker,
        source_page: sourcePage || 'result',
        user_id: userId || null,
        session_id: sessionId || null,
      })

    if (clickError) {
      console.error('Affiliate click tracking error:', clickError)
    }

    // Log monetization event
    await supabase
      .from('monetization_events')
      .insert({
        event_type: 'affiliate_click',
        user_id: userId || null,
        source: 'checker',
        source_detail: sourceChecker,
        metadata: { partnerId, partnerCategory, sourcePage },
      })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Track affiliate error:', error)
    return res.status(500).json({ error: 'Tracking failed' })
  }
}
