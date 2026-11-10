import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import worker from '../dist/server/index.js';

const origin = 'https://example.test';
let checked = 0;
async function check(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await check(file); continue; }
    const url = origin + '/' + path.relative('out', file).split(path.sep).join('/');
    const response = await worker.fetch(new Request(url));
    assert.equal(response.status, 200, file);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(file), file);
    checked++;
  }
}
await check('out');
const configured = await worker.fetch(new Request(origin + '/'), {TELEGRAM_BOT_TOKEN:'123:fake_test_token', TELEGRAM_CHAT_ID:'456'});
const html = await configured.text();
assert.match(html, /<body data-request-endpoint="\/api\/request">/);
assert.doesNotMatch(html, /fake_test_token|TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID/);
assert.equal(configured.headers.get('Cache-Control'), 'no-store');
const manifest = JSON.parse(await readFile('.openai/hosting.json', 'utf8'));
assert.equal(manifest.static, undefined);
assert.deepEqual(JSON.parse(await readFile('dist/.openai/hosting.json', 'utf8')), manifest);
console.log(`PASS: Worker serves ${checked} exact public assets; bot configuration stays server-side.`);
