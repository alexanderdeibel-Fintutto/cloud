import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WidgetEvent {
  partnerId: string
  tool: string
  toolType: 'checker' | 'rechner'
  eventType: 'load' | 'interaction' | 'completion'
  metadata?: Record<string, unknown>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers für Widget-Einbettung
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body as WidgetEvent

    if (!body.partnerId || !body.tool || !body.eventType) {
      return res.status(400).json({ error: 'partnerId, tool, and eventType are required' })
    }

    await supabase.from('monetization_events').insert({
      event_type: `widget_${body.eventType}`,
      source: 'widget',
      source_detail: `${body.toolType}/${body.tool}`,
      metadata: {
        partner_id: body.partnerId,
        tool: body.tool,
        tool_type: body.toolType,
        ...body.metadata,
      },
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Widget track error:', error)
    return res.status(500).json({ error: 'Internal error' })
  }
}
