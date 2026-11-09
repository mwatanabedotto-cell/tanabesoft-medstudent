// API de las notas de estudio: privada. Pide contraseña tanto para leer como para guardar.
// Usa la misma base Upstash Redis que el cuaderno, con sus propias claves,
// así que no toca 'med:proyectos' ni 'med:sitio'.
//
//   GET  /api/notas                  -> { notas }     fichas de estudio (una por apunte del cuaderno)
//   GET  /api/notas?sitio=cardio     -> { marcas }    notas escritas dentro de una página de estudio
//   PUT  /api/notas  {id, nota}      -> guarda una ficha de estudio
//   PUT  /api/notas  {id, borrar}    -> borra una ficha de estudio
//   PUT  /api/notas  {sitio, marcas} -> reemplaza las notas de esa página
//
// Variables de entorno: KV_REST_API_URL, KV_REST_API_TOKEN y ADMIN_PASSWORD.
const crypto = require('crypto');

const K_NOTAS = 'med:notas';
const K_MARCAS = 'med:marcas:';           // + nombre de la página
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Páginas de estudio autorizadas a guardar sus notas aquí.
// (Las de localhost sirven para probar en la computadora; se pueden borrar.)
const ORIGENES = [
  'https://farmacologia-sigma.vercel.app',
  'https://farmacologia-nerviosa.vercel.app',
  'https://farmacologia-cardiovascular.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

const ESTADOS = ['pendiente', 'estudiando', 'repasar', 'dominado'];
const MAX_TEXTO = 20000;   // caracteres por apunte
const MAX_FICHAS = 500;    // apuntes distintos con notas
const MAX_MARCAS = 500;    // notas dentro de una misma página

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

function permisos(req, res) {
  const o = req.headers.origin;
  res.setHeader('Vary', 'Origin');
  if (o && ORIGENES.indexOf(o) >= 0) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
}

const TXT = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
const NUM = (v) => (typeof v === 'number' && isFinite(v) ? Math.floor(v) : 0);
const sitioOk = (s) => (/^[a-z0-9-]{1,30}$/.test(s || '') ? s : '');

function limpiarMarcas(lista) {
  if (!Array.isArray(lista) || lista.length > MAX_MARCAS) return null;
  return lista.map((m, i) => ({
    id: TXT(m && m.id, 40) || 'n' + i,
    k: TXT(m && m.k, 120),
    s: NUM(m && m.s),
    q: TXT(m && m.q, 300),
    t: TXT(m && m.t, 4000),
    act: NUM(m && m.act),
  })).filter((m) => m.k && m.q);
}

async function leerNotas() {
  const crudo = await redis(['GET', K_NOTAS]);
  if (!crudo) return {};
  try { return JSON.parse(crudo) || {}; } catch (e) { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  permisos(req, res);
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'Falta conectar la base de datos (Storage → Upstash for Redis).' });
  // Las notas son privadas: nunca se devuelven sin contraseña.
  if (!passwordOk(req.headers['x-admin-password'])) return res.status(401).json({ error: 'Contraseña incorrecta.' });

  try {
    if (req.method === 'GET') {
      const sitio = sitioOk(TXT(req.query && req.query.sitio, 30));
      if (sitio) {
        const crudo = await redis(['GET', K_MARCAS + sitio]);
        let marcas = [];
        if (crudo) { try { marcas = JSON.parse(crudo) || []; } catch (e) { marcas = []; } }
        return res.status(200).json({ marcas });
      }
      return res.status(200).json({ notas: await leerNotas() });
    }

    if (req.method === 'PUT') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      body = body || {};

      // --- notas escritas dentro de una página de estudio ---
      if (body.sitio !== undefined) {
        const sitio = sitioOk(TXT(body.sitio, 30));
        if (!sitio) return res.status(400).json({ error: 'Nombre de página no válido.' });
        const marcas = limpiarMarcas(body.marcas);
        if (!marcas) return res.status(400).json({ error: 'Notas no válidas.' });
        await redis(['SET', K_MARCAS + sitio, JSON.stringify(marcas)]);
        return res.status(200).json({ ok: true, total: marcas.length });
      }

      // --- ficha de estudio de un apunte del cuaderno ---
      const id = TXT(body.id, 80);
      if (!id) return res.status(400).json({ error: 'Falta indicar el apunte.' });
      const notas = await leerNotas();

      if (body.borrar) {
        delete notas[id];
      } else {
        const n = body.nota || {};
        const texto = TXT(n.notas, MAX_TEXTO);
        const estado = ESTADOS.indexOf(n.estado) >= 0 ? n.estado : 'pendiente';
        // Sin texto y sin avance no hay nada que guardar: se quita la ficha.
        if (!texto.trim() && estado === 'pendiente') delete notas[id];
        else notas[id] = { estado, notas: texto, act: Date.now() };
      }

      if (Object.keys(notas).length > MAX_FICHAS) return res.status(400).json({ error: 'Demasiados apuntes con notas.' });
      await redis(['SET', K_NOTAS, JSON.stringify(notas)]);
      return res.status(200).json({ ok: true, nota: notas[id] || null });
    }

    res.setHeader('Allow', 'GET, PUT, OPTIONS');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo acceder a la base de datos.' });
  }
};
