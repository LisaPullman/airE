// Service Worker 注册
// 注意：SW 文件必须在 Vite base path 下注册，否则部署到子路径（如 /aire/）会 404
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    // 使用 Vite 的 base 路径拼接 SW URL；移除尾斜杠后追加文件名
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    const swUrl = `${base || ''}/sw.js`

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('✅ Service Worker 注册成功:', registration.scope)
        }
      })
      .catch((error) => {
        // SW 注册失败是降级体验，不影响核心功能；开发环境才显示错误
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('❌ Service Worker 注册失败:', error)
        }
      })
  })
}

// 注销 Service Worker
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
