const CACHE_NAME = 'mobile-ledger-v5.7';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './xlsx.full.min.js',
  './index.json',
  './icon-192.png',
  './icon-512.png'
];

// 설치 단계: 필수 파일 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 활성화 단계: 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 요청 가로채기: 네트워크 연결 안 될 경우 캐시된 파일 제공
self.addEventListener('fetch', (event) => {
  // 구글 앱스 스크립트(GAS) API 요청은 통과
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 캐시된 파일 반환 후, 백그라운드에서 최신본 업데이트
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});