import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import postcss from 'postcss';

const home=await readFile('out/index.html','utf8');
const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
assert.deepEqual(selection.blocks.map(({id})=>id),['header','hero','service','about','process','pricing','reviews','apply','footer']);
assert.equal((home.match(/data-selected-block=/g)||[]).length,9);
assert.equal((home.match(/data-block-document=/g)||[]).length,9);
assert.doesNotMatch(home,/<iframe\b|data-design-navigation|data-assembly-choice|data-font-choice|data-heading-choice|data-body-choice|data-about-choice|font-switcher|artwork-library/);
assert.equal((home.match(/<main\b/g)||[]).length,1);
assert.equal((home.match(/<h1\b/g)||[]).length,1);
assert.match(home,/data-font-pair="5" data-body-font="manrope"/);
assert.match(home,/id="service-schema"/);
assert.match(home,/<link rel="canonical" href="https:\/\/dusky-brumm.github.io\/anastasia-nanny-concepts\/">/);
assert.deepEqual((await readdir('out')).filter(name=>name.endsWith('.html')),['index.html']);
for(const {id} of selection.blocks){
 assert.equal((home.match(new RegExp(`data-block="${id}"`,'g'))||[]).length,1);
 assert.match(home,new RegExp(`id="document-${id}"`));
}
const ids=[...home.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'Merged drawings and fields must keep unique IDs');
assert.match(home,/Как проходит подбор/);assert.match(home,/data-about-design="1"/);
assert.match(home,/s-form-pencil/);assert.match(home,/consultation-picture/);
assert.match(home,/data-request-flow="telegram"/);assert.doesNotMatch(home,/class="s-draft"/);
assert.equal((home.match(/<(?:input|textarea)\b/g)||[]).length,3);
assert.match(home,/srcset="[^\"]*portrait-480\.webp 480w/);
const runtime=await readFile('out/site-runtime.js','utf8');
assert.doesNotMatch(runtime,/^import\s/m);
assert.doesNotMatch(runtime,/mountBlockFrames|frame\.height|contentDocument|data-frame-fitted|localStorage|readFontChoice/);
const css=await readFile('out/site-sections.css','utf8');
postcss.parse(css).walkRules(rule=>assert.ok(rule.selector.trim(),'Every compiled CSS rule needs a selector'));
assert.match(css,/font-family:'Caveat'/);assert.match(css,/data:font\/woff2;base64,/);
for(const file of ['site-base.js','frame-layout.js','block-typography.js','drawing-parent.js','studio/app.js','artwork-catalog.json','artwork-library.zip'])await assert.rejects(stat('out/'+file),{code:'ENOENT'});
let links=0,bytes=0,files=0;
async function check(directory){
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);if(entry.isDirectory()){await check(file);continue;}
  files++;bytes+=(await stat(file)).size;assert.ok(!file.endsWith('.ttf'));
  if(!/\.(?:html|css)$/.test(file))continue;
  const text=await readFile(file,'utf8');assert.ok(!text.includes('__VERSION__'),file);
  const urls=file.endsWith('.html')?[...text.matchAll(/\b(?:src|href)="([^"\s]+)"/g)].map(m=>m[1]):[...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]);
  if(file.endsWith('.html'))for(const [,value] of text.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)){
   if(!value.startsWith('data:'))urls.push(...value.split(',').map(item=>item.trim().split(/\s+/)[0]).filter(Boolean));
  }
  for(const url of urls){
   if(/^(?:[a-z]+:|\/\/|#|%23)/i.test(url))continue;
   const local=url.split(/[?#]/)[0];if(!local)continue;
   const target=path.resolve(path.dirname(file),local);assert.ok(target.startsWith(path.resolve('out')+path.sep));await stat(target);links++;
  }
 }
}
await check('out');
const catalog=JSON.parse(await readFile('src/site/artwork-catalog.json','utf8'));
for(const item of catalog)assert.equal(createHash('sha256').update(await readFile('src/site/'+item.file)).digest('hex'),item.sha256,item.file);
const retired=JSON.parse(await readFile('release-manifest.json','utf8')).design_decisions.retired_artwork_20261107.items;
assert.equal(retired.length,9);
for(const {file} of retired){assert.ok(!catalog.some(item=>item.file===file));await assert.rejects(stat('src/site/'+file),{code:'ENOENT'});await assert.rejects(stat('out/'+file),{code:'ENOENT'});}
// Optional About backdrops and figure layers belong to the selected drawing
// mode/current story and keep their own cap within the full site budget.
const optionalAboutFiles=['about-scene-panorama','about-photo-scene-family-registered-20261109','about-photo-scene-rainbow-registered-20261109','about-photo-scene-cafe-registered-20261109','about-photo-scene-park-registered-20261109','about-figure-family-20261110','about-figure-cafe-20261110','about-figure-park-20261110'];
let optionalAboutBytes=0;
for(const name of optionalAboutFiles){
 try{optionalAboutBytes+=(await stat('out/media/'+name+'.webp')).size;}
 catch(error){if(error.code!=='ENOENT')throw error;}
}
assert.ok(bytes-optionalAboutBytes<2_800_000,`Base payload budget exceeded: ${bytes-optionalAboutBytes}`);
assert.ok(optionalAboutBytes<1_000_000,`Optional drawing budget exceeded: ${optionalAboutBytes}`);
assert.ok(bytes<3_800_000,`Full comparison payload budget exceeded: ${bytes}`);
console.log(`PASS: one document, nine complete blocks, no frame resizing; ${files} files, ${bytes} bytes (${optionalAboutBytes} optional About drawings), ${links} local assets; ${catalog.length} artwork hashes.`);
