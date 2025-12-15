self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(
        "<h1>Offline</h1><p>Please wait for internet connection.</p>",
        { headers: { "Content-Type": "text/html" } }
      );
    })
  );
});