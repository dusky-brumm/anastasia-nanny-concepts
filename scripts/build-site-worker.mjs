import {readFile, writeFile, mkdir, readdir, rm, lstat, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root = await realpath('.');
const output = path.join(root, 'dist');
// Replace only this checkout's generated output; never follow a redirected path.
try {
  if ((await lstat(output)).isSymbolicLink() || await realpath(output) !== output) throw new Error('Unsafe Worker output path');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
if (path.dirname(output) !== root) throw new Error('Worker output escapes checkout');
await rm(output, {recursive: true, force: true});
await mkdir(path.join(output, 'server'), {recursive: true});
await mkdir(path.join(output, '.openai'), {recursive: true});
const types = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8'};
const assets = {};
async function collect(directory) {
  for (const entry of (await readdir(directory, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await collect(file); continue; }
    if (!entry.isFile()) throw new Error('Non-regular public asset: ' + file);
    const bytes = await readFile(file);
    assets['/' + path.relative(path.join(root, 'out'), file).split(path.sep).join('/')] = {
      type: types[path.extname(file)] ?? 'application/octet-stream',
      hash: createHash('sha256').update(bytes).digest('hex'),
      data: bytes.toString('base64'),
    };
  }
}
await collect(path.join(root, 'out'));
let source = '';
for (const file of ['src/reference/request.js', 'server/telegram-worker.js', 'server/site-worker.js']) {
  let text = await readFile(file, 'utf8');
  text = text.replace(/^import[^\n]+\n/gm, '').replace(/^export (?=(?:async )?function)/gm, '');
  if (file.endsWith('telegram-worker.js')) text = text.replace('export default {', 'const telegram = {');
  source += text + '\n';
}
source += 'export default createSiteWorker(' + JSON.stringify(assets) + ');\n';
await writeFile(path.join(output, 'server/index.js'), source);
await writeFile(path.join(output, '.openai/hosting.json'), await readFile('.openai/hosting.json'));
console.log(JSON.stringify({worker: 'dist/server/index.js', assets: Object.keys(assets).length, bytes: Buffer.byteLength(source)}));
