// Service Worker for 起飞航空 PWA
// 缓存策略:
//   - 页面导航: 网络优先,离线时回退缓存(保证发版后能拿到新页面)
//   - 静态资源/音频: stale-while-revalidate(先用缓存,后台更新)
//   - API 请求: 不缓存,始终走网络
//
// 部署到子路径（如 /aire/）时，scope 与基础 URL 必须匹配，否则 SW 不会激活。
const CACHE_NAME = 'takeoff-aviation-v2';

// 从 sw.js 的位置推断基础路径，使 SW 在任意 base path 下都能找到根 index.html
const SW_SCOPE = self.location.pathname.replace(/\/sw\.js$/, '');
const ROOT_PATH = SW_SCOPE === '' || SW_SCOPE === '/' ? '/' : SW_SCOPE + '/';

const STATIC_ASSETS = [
  ROOT_PATH,
  ROOT_PATH + 'index.html',
  ROOT_PATH + 'manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker,清理旧版本缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/** 是否为不应缓存的接口请求(后端 API) */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.includes('/aire-api/');
}

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只处理同源 GET 请求;跨域请求(如直连后端)与 API 一律直连网络
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApiRequest(url)) return;

  // 页面导航: 网络优先,失败时回退缓存(离线可用)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(ROOT_PATH))
        )
    );
    return;
  }

  // 静态资源(含 /audio): 先返回缓存,同时后台更新
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
