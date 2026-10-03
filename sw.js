// --- サービスワーカー停止・キャッシュ削除スクリプト ---
// 古いSWが残っていても、このファイルに差し替えると自分自身を解除し、キャッシュも全削除する。

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // 全キャッシュを削除
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));

    // 制御中のページを取得してから自分自身を登録解除
    const clients = await self.clients.matchAll({ type: 'window' });
    await self.registration.unregister();

    // ページを再読み込みして、最新のファイルをネットワークから取得させる
    clients.forEach((c) => c.navigate(c.url).catch(() => {}));
  })());
});
