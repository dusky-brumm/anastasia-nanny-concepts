import telegram, {telegramConfigured} from './telegram-worker.js';

// createSiteWorker receives only the final page's public assets from the build.
export function createSiteWorker(assets) {
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url);
      if (url.pathname === '/api/request' || url.pathname === '/request') return telegram.fetch(request, env);
      if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status: 405, headers: {Allow: 'GET, HEAD'}});
      const file = Object.hasOwn(assets, url.pathname === '/' ? '/index.html' : url.pathname)
        ? assets[url.pathname === '/' ? '/index.html' : url.pathname] : null;
      if (!file) return new Response('Страница не найдена', {status: 404, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
      let body;
      const headers = {'Content-Type': file.type, 'X-Content-Type-Options': 'nosniff'};
      if (file.type.startsWith('text/html')) {
        body = atob(file.data);
        // Decode UTF-8 once. The generated HTML contains no secret values.
        body = new TextDecoder().decode(Uint8Array.from(body, char => char.charCodeAt(0)));
        if (telegramConfigured(env)) body = body.replace('<body>', '<body data-request-endpoint="/api/request">');
        headers['Cache-Control'] = 'no-store';
      } else {
        headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
        headers.ETag = '"' + file.hash + '"';
        if (request.headers.get('If-None-Match') === headers.ETag) return new Response(null, {status: 304, headers});
        if (request.method !== 'HEAD') body = Uint8Array.from(atob(file.data), char => char.charCodeAt(0));
      }
      return new Response(request.method === 'HEAD' ? null : body, {headers});
    },
  };
}
