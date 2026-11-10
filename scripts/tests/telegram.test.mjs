import test from 'node:test';
import assert from 'node:assert/strict';
import telegram from '../../server/telegram-worker.js';
import {createSiteWorker} from '../../server/site-worker.js';

const origin = 'https://example.test';
const application = {name:' Анна ', contact:' @family ', message:'Ребёнку 3 года\nНужна няня', website:''};
const env = {TELEGRAM_BOT_TOKEN:'123456:fake_test_token', TELEGRAM_CHAT_ID:'98765', REQUEST_LIMIT:{limit:async () => ({success:true})}};
function request(data = application, headers = {}) {
  return new Request(origin + '/api/request', {method:'POST', headers:{Origin:origin, 'Content-Type':'application/json', ...headers}, body:JSON.stringify(data)});
}

test('the server sends plain text to the configured recipient and waits for Telegram confirmation', async t => {
  let sent;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.match(url, /\/sendMessage$/);
    sent = JSON.parse(options.body);
    return Response.json({ok:true});
  });
  const response = await telegram.fetch(request({...application, chat_id:'attacker'}), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {ok:true});
  assert.equal(sent.chat_id, env.TELEGRAM_CHAT_ID);
  assert.match(sent.text, /Новая заявка с сайта\n\nЗдравствуйте, Анастасия!/);
  assert.match(sent.text, /Меня зовут Анна\./);
  assert.match(sent.text, /Связаться со мной: @family\./);
  assert.match(sent.text, /Ребёнку 3 года\nНужна няня/);
  assert.equal(sent.parse_mode, undefined);
});

test('invalid requests, foreign origins, missing setup and rate limits never reach Telegram', async t => {
  const outgoing = t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not send'); });
  assert.equal((await telegram.fetch(request(), {})).status, 503);
  assert.equal((await telegram.fetch(request(application, {Origin:'https://other.test'}), env)).status, 403);
  assert.equal((await telegram.fetch(request(application, {'Content-Type':'text/plain'}), env)).status, 415);
  for (const data of [{...application, name:' '}, {...application, contact:'a'}, {...application, message:'x'.repeat(2001)}, {...application, website:'spam'}, {...application, name:42}, {oversized:'x'.repeat(17000)}]) {
    assert.equal((await telegram.fetch(request(data), env)).status, 400);
  }
  assert.equal((await telegram.fetch(request(), {...env, REQUEST_LIMIT:{limit:async () => ({success:false})}})).status, 429);
  assert.equal(outgoing.mock.callCount(), 0);
});

test('unconfirmed delivery fails without echoing secrets or applicant data', async t => {
  for (const outcome of [Response.json({ok:false}), new Response('upstream failed', {status:500}), new Error(env.TELEGRAM_BOT_TOKEN)]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => { if (outcome instanceof Error) throw outcome; return outcome; });
    const response = await telegram.fetch(request(), env);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), {ok:false});
    mock.mock.restore();
  }
});

test('Sites throttles repeat requests without the standalone rate-limit binding', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ok:true}));
  const unbound = {...env, REQUEST_LIMIT:undefined};
  for (let i = 0; i < 6; i++) {
    const response = await telegram.fetch(request(application, {'CF-Connecting-IP':'192.0.2.40'}), unbound);
    assert.equal(response.status, i < 5 ? 200 : 429);
  }
});

test('the Site serves UTF-8 and binary assets and activates delivery only when configured', async () => {
  const assets = {'/index.html':{type:'text/html; charset=utf-8', data:Buffer.from('<body>Заявка</body>').toString('base64')}, '/test.webp':{type:'image/webp', data:'AAH/', hash:'test-hash'}};
  const worker = createSiteWorker(assets);
  assert.equal(await (await worker.fetch(new Request(origin + '/'))).text(), '<body>Заявка</body>');
  const configured = await worker.fetch(new Request(origin + '/'), env);
  assert.equal(await configured.text(), '<body data-request-endpoint="/api/request">Заявка</body>');
  assert.equal(configured.headers.get('Cache-Control'), 'no-store');
  const image = await worker.fetch(new Request(origin + '/test.webp'));
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), Buffer.from([0,1,255]));
  assert.equal((await worker.fetch(new Request(origin + '/test.webp', {headers:{'If-None-Match':'"test-hash"'}}))).status, 304);
  assert.equal((await worker.fetch(new Request(origin + '/test.webp', {method:'HEAD'}))).body, null);
  assert.equal((await worker.fetch(new Request(origin + '/missing'))).status, 404);
  assert.equal((await worker.fetch(new Request(origin + '/constructor'))).status, 404);
});
