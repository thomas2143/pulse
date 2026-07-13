const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password } = req.body;

  try {
    let endpoint;
    if (action === 'signup') {
      endpoint = `${SUPABASE_URL}/auth/v1/signup`;
    } else if (action === 'login') {
      endpoint = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    } else if (action === 'logout') {
      endpoint = `${SUPABASE_URL}/auth/v1/logout`;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
