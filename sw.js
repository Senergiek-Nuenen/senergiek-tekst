const CACHE_NAME = 'senergiek-activiteiten-v1';
const APP_SHELL = ['./','./index.html','./activiteiten.html','./belangenbehartiging.html','./offline.html','./assets/activiteiten-hoofdknop.png','./assets/belangenbehartiging.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/apple-touch-icon.png',
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
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('senergiek-activiteiten-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => { try { const response = await fetch(request); if (response.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, response.clone()); } return response; } catch { return (await caches.match(request)) || (await caches.match('./offline.html')) || Response.error(); } })());
    return;
  }
  event.respondWith((async () => { const cached = await caches.match(request); if (cached) return cached; try { const response = await fetch(request); if (response.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, response.clone()); } return response; } catch { return Response.error(); } })());
});