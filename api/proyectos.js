// API de la biblioteca: GET público (leer), PUT con contraseña (guardar).
// Datos en Upstash Redis (Vercel → Storage → Upstash for Redis).
// Variables de entorno: KV_REST_API_URL, KV_REST_API_TOKEN (las crea Vercel al conectar la base)
// y ADMIN_PASSWORD (la defines tú).
const crypto = require('crypto');

const K_LISTA = 'med:proyectos';
const K_SITIO = 'med:sitio';
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

function passwordOk(given) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real || typeof given !== 'string') return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

const TXT = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
function limpiarLista(lista) {
  if (!Array.isArray(lista) || lista.length > 300) return null;
  return lista.map((p, i) => ({
    id: TXT(p.id, 80) || 'p' + i,
    nombre: TXT(p.nombre, 90),
    desc: TXT(p.desc, 320),
    cat: TXT(p.cat, 40),
    formato: TXT(p.formato, 40),
    url: /^https?:\/\//i.test(p.url || '') ? TXT(p.url, 500) : '',
    estado: p.estado === 'dev' ? 'dev' : 'live',
    logo: TXT(p.logo, 30),
    color: TXT(p.color, 30),
    portada: TXT(p.portada, 30),
    orden: i,
  }));
}
function limpiarSitio(s) {
  if (!s || typeof s !== 'object') return null;
  return { nombre: TXT(s.nombre, 60), lema: TXT(s.lema, 200) };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'Falta conectar la base de datos (Storage → Upstash for Redis).' });

  try {
    if (req.method === 'GET') {
      if (req.query && req.query.check !== undefined) {
        return passwordOk(req.headers['x-admin-password']) ? res.status(200).json({ ok: true }) : res.status(401).json({ error: 'Contraseña incorrecta.' });
      }
      const [lista, sitio] = await Promise.all([redis(['GET', K_LISTA]), redis(['GET', K_SITIO])]);
      return res.status(200).json({ proyectos: lista ? JSON.parse(lista) : null, sitio: sitio ? JSON.parse(sitio) : null });
    }
    if (req.method === 'PUT') {
      if (!passwordOk(req.headers['x-admin-password'])) return res.status(401).json({ error: 'Contraseña incorrecta.' });
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const lista = limpiarLista(body && body.proyectos);
      if (!lista) return res.status(400).json({ error: 'Datos no válidos.' });
      await redis(['SET', K_LISTA, JSON.stringify(lista)]);
      const sitio = limpiarSitio(body.sitio);
      if (sitio) await redis(['SET', K_SITIO, JSON.stringify(sitio)]);
      return res.status(200).json({ ok: true, total: lista.length });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo acceder a la base de datos.' });
  }
};
