const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const headers = (token) => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${token || SUPABASE_KEY}`,
  'Prefer': 'return=representation'
});

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '') || SUPABASE_KEY;
  const { method, body, query } = req;

  try {
    if (method === 'POST') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/milestones`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(body)
      });
      const data = await r.json();
      return res.status(201).json(data);
    }

    if (method === 'DELETE') {
      const { id } = query;
      await fetch(`${SUPABASE_URL}/rest/v1/milestones?id=eq.${id}`, {
        method: 'DELETE',
        headers: headers(token)
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
