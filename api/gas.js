// Vercel Serverless Function — proxy ke Google Apps Script Web App.
// URL Apps Script disimpan di Environment Variable Vercel: APPS_SCRIPT_URL
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const target = process.env.APPS_SCRIPT_URL;
  if (!target) {
    return res.status(500).json({ ok: false, error: 'APPS_SCRIPT_URL belum diatur di Vercel' });
  }

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (body.length > 1000000) {
      return res.status(413).json({ ok: false, error: 'Payload terlalu besar' });
    }

    const upstream = await fetch(target, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body,
      redirect: 'follow'
    });

    const text = await upstream.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Gagal menghubungi Apps Script: ' + (err && err.message ? err.message : err) });
  }
};
