// Allow up to 30s for long generations (steering briefs, weekly reports).
// Vercel Hobby caps at 10s by default; Pro allows up to 300s.
export const config = {
  maxDuration: 30
};

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const MAX_PROMPT_CHARS = 24000; // guard against runaway prompts / cost
const FETCH_TIMEOUT_MS = 25000; // fail cleanly before Vercel kills the function

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  const { prompt, model, max_tokens } = req.body || {};

  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: `Prompt too long (max ${MAX_PROMPT_CHARS} characters)` });
  }

  const selectedModel = model || DEFAULT_MODEL;
  const tokens = Math.min(Math.max(parseInt(max_tokens) || 2000, 100), 4000);

  // Timeout controller — clean failure instead of a hard Vercel cut
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    clearTimeout(timeout);

    const data = await response.json();

    // Rate limit — pass Retry-After through so the client can back off
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      if (retryAfter) res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Rate limited — please retry shortly',
        retryAfter: retryAfter || null
      });
    }

    // Any other Groq error — surface the real status and message
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Groq API error',
        details: data
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'AI request timed out — try a shorter input' });
    }
    return res.status(500).json({ error: 'AI generation failed', message: error.message });
  }
}
