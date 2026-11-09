// Proxy do TMDB: a chave fica só aqui (variável de ambiente TMDB_READ_TOKEN), nunca no navegador.
const ALLOWED = /^\/(configuration|movie|tv|trending|discover|search|person)(\/[\w-]+)*$/;

export default async function handler(req, res) {
  const token = (process.env.TMDB_READ_TOKEN || '').trim();
  if (!token) return res.status(500).json({ error: 'TMDB_READ_TOKEN não configurado' });

  const { path = '', ...rest } = req.query;
  if (typeof path !== 'string' || !ALLOWED.test(path)) return res.status(400).json({ error: 'caminho não permitido' });

  const url = new URL('https://api.themoviedb.org/3' + path);
  for (const [k, v] of Object.entries(rest)) {
    if (k === 'api_key') continue;
    url.searchParams.set(k, Array.isArray(v) ? v[0] : v);
  }
  const headers = { accept: 'application/json' };
  if (token.length > 40) headers.Authorization = 'Bearer ' + token; else url.searchParams.set('api_key', token);

  try {
    const r = await fetch(url, { headers });
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(r.status).send(await r.text());
  } catch {
    return res.status(502).json({ error: 'TMDB indisponível' });
  }
}
