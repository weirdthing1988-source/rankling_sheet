const CACHE='rankling-cohort-v9';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/icon.svg','./assets/cohort-lineup.png','./assets/art-march.png','./assets/art-shield-wall.png','./assets/art-spearhead.png','./assets/art-assault-rank.png','./assets/art-escort-formation.png','./assets/art-march-male.png','./assets/art-shield-wall-male.png','./assets/art-spearhead-male.png','./assets/art-assault-rank-male.png','./assets/art-escort-formation-male.png','./assets/art-mega-unison-female.png','./assets/art-mega-unison-male.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match('./index.html'))));
});
