const CACHE_NAME = 'calendar-v1';

// Файлы для кэширования
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/calendar.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/favicon.ico',
  '/images/vk-music.png',
  '/images/megafon.png',
  '/images/vpn.png',
  '/images/wifi.png'
];

// Установка SW — кэшируем файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэш открыт');
        return cache.addAll(FILES_TO_CACHE);
      })
      .catch((err) => {
        console.error('Ошибка кэширования:', err);
      })
  );
  self.skipWaiting();
});

// Активация — удаляем старые кэши
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов — сначала сеть, потом кэш
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Если запрос успешен — кэшируем и возвращаем
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сеть недоступна — берём из кэша
        return caches.match(event.request);
      })
  );
});
