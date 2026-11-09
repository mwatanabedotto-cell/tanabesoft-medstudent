// Permite abrir el sitio instalado como aplicación, incluso sin internet.
// Regla de oro: las páginas se piden siempre a la red primero (así nunca ves una versión vieja);
// solo si no hay señal se usa la copia guardada. Las notas (/api/) nunca se guardan.
const VERSION = 'tanabe-v1';
const BASICOS = [
  '/',
  '/estudio',
  '/estilo.css',
  '/comun.js',
  '/manifest.json',
  '/iconos/icono-192.png',
  '/iconos/icono-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.allSettled(BASICOS.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;     // fuentes y otras páginas: que las maneje el navegador
  if (url.pathname.startsWith('/api/')) return;        // los apuntes siempre van a la red

  // Páginas: red primero, copia guardada como respaldo.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put(req, copia));
          return r;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Archivos (css, js, imágenes): se muestra la copia y se actualiza por detrás.
  e.respondWith(
    caches.match(req).then((guardada) => {
      const red = fetch(req)
        .then((r) => {
          if (r && r.ok) {
            const copia = r.clone();
            caches.open(VERSION).then((c) => c.put(req, copia));
          }
          return r;
        })
        .catch(() => guardada);
      return guardada || red;
    })
  );
});
