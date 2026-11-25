const CACHE_NAME = 'senergiek-activiteiten-v3';
const CACHE_PREFIX = 'senergiek-activiteiten-';
const NETWORK_TIMEOUT_MS = 4000;

const APP_SHELL = [
  './',
  './index.html',
  './activiteiten.html',
  './belangenbehartiging.html',
  './offline.html',
  './manifest.json',
  './pwa.js',
  './assets/nieuw logo-opn-opgl.png',
  './assets/activiteiten-hoofdknop.png',
  './assets/belangenbehartiging.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/illustraties/biljartclub-de-treffers.svg',
  './assets/illustraties/bridgeclub.svg',
  './assets/illustraties/conversatie-duits.svg',
  './assets/illustraties/conversatie-engels.svg',
  './assets/illustraties/country-line-dance.svg',
  './assets/illustraties/creabea.svg',
  './assets/illustraties/dames-biljartclub-pomeranses.svg',
  './assets/illustraties/dartclub-senergiek.svg',
  './assets/illustraties/dynamic-tennis.svg',
  './assets/illustraties/fotoclub-infocus.svg',
  './assets/illustraties/gesprekskringen.svg',
  './assets/illustraties/grote-fietstochten.svg',
  './assets/illustraties/gymnastiek-nuenen-gerwen.svg',
  './assets/illustraties/jasclub-de-oude-vrienden.svg',
  './assets/illustraties/jeu-de-bouleclub.svg',
  './assets/illustraties/jokerclub-voor-dames.svg',
  './assets/illustraties/kaartclub-de-koppelaar.svg',
  './assets/illustraties/kienclub-gerwen.svg',
  './assets/illustraties/kleine-fietstochten.svg',
  './assets/illustraties/koor-de-vrolijke-samenzang.svg',
  './assets/illustraties/leesclub.svg',
  './assets/illustraties/lezingengroep.svg',
  './assets/illustraties/mondharmonica-orkest-de-luchthappers.svg',
  './assets/illustraties/museumgroep-1.svg',
  './assets/illustraties/museumgroep-2.svg',
  './assets/illustraties/quilten.svg',
  './assets/illustraties/reizen.svg',
  './assets/illustraties/restaurantgroep-samen-dineren.svg',
  './assets/illustraties/rikclub-gerwen.svg',
  './assets/illustraties/rikclub-trefpunt.svg',
  './assets/illustraties/schrijfatelier.svg',
  './assets/illustraties/sjoelclub-de-treffers.svg',
  './assets/illustraties/tafeltennis.svg',
  './assets/illustraties/tai-chi.svg',
  './assets/illustraties/volksdansgroep-trefpunt.svg',
  './assets/illustraties/wandelclub-maandag.svg',
  './assets/illustraties/wandelen-woensdagochtend.svg',
  './assets/illustraties/yoga.svg',
  './assets/illustraties/zumba.svg'
];

async function fetchWithTimeout(request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    return await fetch(request, { cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok && response.type !== 'opaque') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return null;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const cachePromise = caches.open(CACHE_NAME).catch(() => null);
  const cachedPromise = cachePromise.then((cache) => (
    cache ? cache.match(request, { ignoreSearch: isNavigation }) : null
  )).catch(() => null);
  const refreshPromise = cachePromise.then(async (cache) => {
    if (!cache) return null;
    const cached = await cachedPromise;
    if (cached && !isNavigation) return null;
    return fetchAndCache(request, cache);
  }).catch(() => null);

  event.waitUntil(refreshPromise.then(() => undefined));
  event.respondWith((async () => {
    const cached = await cachedPromise;
    if (cached) return cached;

    const response = await refreshPromise;
    if (response) return response;

    if (isNavigation) {
      const cache = await cachePromise;
      const offlinePage = cache
        ? await cache.match(new URL('./offline.html', self.registration.scope).href)
        : null;
      if (offlinePage) return offlinePage;
    }

    return Response.error();
  })());
});
