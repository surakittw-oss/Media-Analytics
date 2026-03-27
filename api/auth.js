// api/auth.js — Vercel Serverless Function
// handles: /api/auth?action=exchange | /api/auth?action=refresh

export default async function handler(req, res) {
  // CORS — allow your dashboard origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // ── CLIENT ID: ส่ง client_id ให้ frontend ──
  if (action === 'client_id') {
    return res.status(200).json({ client_id: process.env.GOOGLE_CLIENT_ID });
  }

  // ── EXCHANGE: authorization code → tokens ──
  if (action === 'exchange') {
    const { code, redirect_uri } = req.body || req.query;
    if (!code) return res.status(400).json({ error: 'missing code' });

    try {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri:  redirect_uri || process.env.REDIRECT_URI,
          grant_type:    'authorization_code',
        }),
      });
      const data = await r.json();
      if (data.error) return res.status(400).json(data);

      // ส่ง access_token + refresh_token กลับ
      return res.status(200).json({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        expires_in:    data.expires_in,  // seconds (3600)
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── REFRESH: refresh_token → new access_token ──
  if (action === 'refresh') {
    const { refresh_token } = req.body || req.query;
    if (!refresh_token) return res.status(400).json({ error: 'missing refresh_token' });

    try {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token,
          client_id:     process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type:    'refresh_token',
        }),
      });
      const data = await r.json();
      if (data.error) return res.status(400).json(data);

      return res.status(200).json({
        access_token: data.access_token,
        expires_in:   data.expires_in,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: 'invalid action' });
}
