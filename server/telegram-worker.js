import {formatRequest} from '../src/reference/request.js';

const maxBodyBytes = 16 * 1024;
const recentRequests = new Map();

export function telegramConfigured(env) {
  return /^\d+:[\w-]+$/.test(env.TELEGRAM_BOT_TOKEN ?? '')
    && /^[1-9]\d*$/.test(env.TELEGRAM_CHAT_ID ?? '');
}

async function allowRequest(request, env) {
  const key = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (env.REQUEST_LIMIT) return (await env.REQUEST_LIMIT.limit({key})).success;
  // Sites has no custom rate-limit binding. Bound this per-isolate fallback;
  // the standalone Cloudflare deployment uses its native REQUEST_LIMIT binding.
  const now = Date.now();
  for (const [ip, value] of recentRequests) if (value.until <= now) recentRequests.delete(ip);
  const previous = recentRequests.get(key);
  if (previous) return ++previous.count <= 5;
  if (recentRequests.size >= 10000) return false;
  recentRequests.set(key, {count: 1, until: now + 60000});
  return true;
}

async function readApplication(request) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', {fatal: true});
  let size = 0;
  let json = '';
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        return null;
      }
      json += decoder.decode(value, {stream: true});
    }
    const data = JSON.parse(json + decoder.decode());
    if (!data || typeof data.name !== 'string' || typeof data.contact !== 'string'
      || typeof data.message !== 'string' || data.website !== '') return null;
    const name = data.name.trim();
    const contact = data.contact.trim();
    const message = data.message.trim();
    if (!name || name.length > 80 || contact.length < 3 || contact.length > 100
      || message.length > 2000) return null;
    return {name, contact, message};
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = [url.origin, ...(env.SITE_ORIGINS ?? '').split(',').map(value => value.trim())];
    if (!['/request', '/api/request'].includes(url.pathname)) return new Response(null, {status: 404});
    if (!origin || !allowed.includes(origin)) return new Response(null, {status: 403});

    const headers = {
      'Access-Control-Allow-Origin': origin,
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
    };
    const result = status => Response.json({ok: status === 200}, {status, headers});
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {...headers, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type'},
      });
    }
    if (request.method !== 'POST') return result(405);
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return result(415);
    if (!telegramConfigured(env)) return result(503);

    try {
      if (!await allowRequest(request, env)) return result(429);
      const application = await readApplication(request);
      if (!application) return result(400);
      const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: 'Новая заявка с сайта\n\n' + formatRequest(application),
          link_preview_options: {is_disabled: true},
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok && (await response.json()).ok === true) return result(200);
    } catch {
      // Keep the bot token and the applicant's data out of error responses and logs.
    }
    return result(502);
  },
};
