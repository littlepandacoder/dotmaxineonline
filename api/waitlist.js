import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, phone, niche } = req.body || {}

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required.' })
  }

  const { error } = await supabase.from('waitlist').insert({ email, phone, niche })

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'You\'re already on the waitlist.' })
    }
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }

  return res.status(200).json({ ok: true })
}
