import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const home=await readFile('out/index.html','utf8');
const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
assert.deepEqual(selection.blocks.map(({id})=>id),['header','hero','service','about','process','pricing','reviews','apply','footer']);
assert.equal((home.match(/data-selected-block=/g)||[]).length,9);
assert.equal((home.match(/<iframe\b/g)||[]).length,9);
assert.doesNotMatch(home,/data-design-navigation|data-assembly-choice|data-assembly-gallery|data-site-root/);
assert.deepEqual([...home.matchAll(/data-font-choice="([^"]+)"/g)].map(match=>match[1]),Array.from({length:20},(_,index)=>String(index+1)));
assert.match(home,/data-heading-choice/);assert.match(home,/data-body-choice/);
assert.match(home,/id="service-schema"/);
assert.match(home,/<link rel="canonical" href="https:\/\/dusky-brumm.github.io\/anastasia-nanny-concepts\/">/);
const rootPages=(await readdir('out')).filter(name=>name.endsWith('.html')).sort();
assert.deepEqual(rootPages,['artwork.html','compare-assembly.html','index.html']);
assert.match(await readFile('out/compare-assembly.html','utf8'),/location.replace\('\.\/'\+location.hash\)/);
const ids=new Set(selection.blocks.map(item=>item.id));
let links=0;
async function checkLinks(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){await checkLinks(file);continue;}
    if(!/\.(?:html|css)$/.test(file))continue;
    const text=await readFile(file,'utf8');
    assert.ok(!text.includes('__VERSION__'),file);
    const urls=file.endsWith('.html')?[...text.matchAll(/\b(?:src|href)="([^"\s]+)"/g)].map(m=>m[1]):[];
    if(file.endsWith('.css'))urls.push(...[...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]));
    for(const url of urls){
      if(/^(?:[a-z]+:|\/\/|#|%23)/i.test(url))continue;
      const local=url.split(/[?#]/)[0];
      if(!local)continue;
      const target=path.resolve(path.dirname(file),local);
      assert.ok(target.startsWith(path.resolve('out')+path.sep)||target===path.resolve('out'),'URL escapes output: '+url);
      await stat(target);links++;
    }
  }
}
await checkLinks('out');
for(const {id,file} of selection.blocks){
  const html=await readFile('out/'+file,'utf8');
  assert.match(html,new RegExp(`data-block="${id}"`));
  assert.equal((html.match(/data-reference-block-root/g)||[]).length,1);
  assert.match(html,/site-typography\.css/);assert.match(html,/site-refinements\.css/);
  assert.doesNotMatch(html,/href="\.\.\/(?:compare-|comparison-|pencil-)[^"]*\.html/);
  for(const [,target] of html.matchAll(/data-reference-target="([^"]+)"/g))assert.ok(ids.has(target),target);
}
const hero=await readFile('out/blocks/hero.html','utf8');
assert.equal((hero.match(/<h1\b/g)||[]).length,1);
assert.match(hero,/fotoalbum-polish\.css/);
assert.match(await readFile('out/blocks/process.html','utf8'),/Как проходит подбор/);
const form=await readFile('out/blocks/apply.html','utf8');
assert.match(form,/s-form-pencil/);assert.doesNotMatch(form,/data-live-request/);
assert.match(form,/13-step-application\.webp/);
const catalog=JSON.parse(await readFile('out/artwork-catalog.json','utf8'));
assert.ok(catalog.length>=108);
assert.equal(new Set(catalog.map(item=>item.file)).size,catalog.length);
for(const item of catalog){
  const bytes=await readFile('out/'+item.file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256,item.file);
}
assert.ok((await stat('out/artwork-library.zip')).size>100000);
console.log(`PASS: 9 fixed blocks, no alternative pages, ${links} local links/assets, ${catalog.length} artwork hashes, downloadable archive.`);
