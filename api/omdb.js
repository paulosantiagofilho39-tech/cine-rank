// Proxy do OMDb: a chave fica só aqui (variável de ambiente OMDB_API_KEY).
export default async function handler(req, res) {
  const key = (process.env.OMDB_API_KEY || '').trim();
  if (!key) return res.status(500).json({ Response: 'False', Error: 'OMDB_API_KEY não configurado' });

  const i = Array.isArray(req.query.i) ? req.query.i[0] : req.query.i;
  if (!/^tt\d{5,10}$/.test(i || '')) return res.status(400).json({ Response: 'False', Error: 'id inválido' });

  try {
    const r = await fetch(`https://www.omdbapi.com/?i=${i}&apikey=${encodeURIComponent(key)}`);
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(r.status).send(await r.text());
  } catch {
    return res.status(502).json({ Response: 'False', Error: 'OMDb indisponível' });
  }
}
