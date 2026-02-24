export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GOOGLE_CLOUD_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { input, voice, audioConfig } = req.body

    if (!input || !voice) {
      return res.status(400).json({ error: 'Missing required fields: input, voice' })
    }

    // Determine endpoint: use beta for Chirp3 HD voices
    const isChirp = voice.name && voice.name.includes('Chirp3')
    const apiUrl = isChirp
      ? 'https://texttospeech.googleapis.com/v1beta1/text:synthesize'
      : 'https://texttospeech.googleapis.com/v1/text:synthesize'

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, voice, audioConfig }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'TTS proxy failed' })
  }
}
