import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {seoConfig,publicUrl} from '../src/reference/studio/seo.js';

const attributes=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const tags=(html,name)=>[...html.matchAll(new RegExp('<'+name+'\\b[^>]*>','g'))].map(m=>attributes(m[0]));
const metadata=(html,name)=>tags(html,'meta').find(t=>t.name===name||t.property===name)?.content;
for(const file of (await readdir('out')).filter(f=>f.endsWith('.html'))) {
  const html=await readFile('out/'+file,'utf8');
  const canonical=tags(html,'link').filter(t=>t.rel==='canonical');
  assert.equal(canonical.length,1,'One canonical: '+file);
  assert.equal(canonical[0].href,publicUrl(file==='index.html'||file==='next.html'?'':file),'Canonical path: '+file);
  assert.equal(new URL(canonical[0].href).search,'','No design/cache query in canonical');
  const robots=metadata(html,'robots');
  assert.ok(robots,'Robots policy: '+file);
  assert.equal(robots.includes('noindex'),file!=='index.html','Indexing policy: '+file);
}
const main=await readFile('out/index.html','utf8');
assert.equal((main.match(/<h1\b/g)||[]).length,1,'One main H1');
assert.ok(main.includes('Сколько анкет можно получить?'),'FAQ is in source HTML');
assert.equal(metadata(main,'description'),seoConfig.description);
assert.equal(metadata(main,'og:url'),seoConfig.url);
assert.equal(metadata(main,'twitter:card'),'summary_large_image');
const image=new URL(metadata(main,'og:image'));
assert.equal(image.origin,new URL(seoConfig.url).origin);
assert.equal(image.pathname,new URL(publicUrl('assets/social-card.png')).pathname);
assert.ok(metadata(main,'og:image:alt'));
const png=await readFile('out/assets/social-card.png');
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
const graph=JSON.parse(main.match(/<script type="application\/ld\+json" id="service-schema">([\s\S]*?)<\/script>/)[1]);
assert.ok(graph['@graph'].some(node=>node['@type']==='Service'));
const sitemap=await readFile('out/sitemap.xml','utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),[seoConfig.url]);
const robots=await readFile('out/robots.txt','utf8');
assert.ok(robots.includes('Sitemap: '+publicUrl('sitemap.xml')));
assert.doesNotMatch(robots,/^Disallow:/m,'Allow crawling so noindex can be seen');
await stat('out/studio/content.js');await stat('out/studio/seo.js');
console.log('PASS: one indexable service page, canonical URLs, utility noindex, source FAQ, Service JSON-LD, social PNG and sitemap.');
