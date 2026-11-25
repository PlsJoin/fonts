const CACHE = "logo-maker-v1";
const RUNTIME = "logo-maker-runtime";
const FILES = ["./", "./index.html", "./fabric.min.js", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // Google Fonts はオンライン時に拾ってキャッシュし、次回からオフラインでも使う
  if (url.startsWith("https://fonts.googleapis.com") || url.startsWith("https://fonts.gstatic.com")) {
    e.respondWith(
      caches.open(RUNTIME).then((cache) =>
        cache.match(e.request).then((hit) =>
          hit || fetch(e.request).then((res) => { cache.put(e.request, res.clone()); return res; })
        )
      )
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
