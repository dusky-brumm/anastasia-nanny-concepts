import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {designs} from '../../src/restart/gallery.mjs';

test('three rebuilt layouts retain all nine client sections and grounded content',async()=>{
 const required=['header','hero','service','about','process','pricing','reviews','request','footer'];
 assert.equal(designs.length,3);
 for(const {id} of designs){
  const html=await readFile(new URL(`../../dist/restart/${id}.html`,import.meta.url),'utf8');
  assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(match=>match[1]),required);
  const text=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  for(const fact of ['2022','25 000','5 500','6 месяцев','Готовы обсудить подбор?'])assert.ok(text.includes(fact),`${id}: ${fact}`);
  assert.ok(html.includes('data-request-form')&&html.includes('name="contact"'));
  assert.ok(!/final\.css|fresh\.css|polish\.css|trio\/base\.css/.test(html));
  assert.equal([...html.matchAll(/<h1>/g)].length,1);
  const title=html.match(/<h1>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(title,'Найду няню, с которой спокойно вам и хорошо ребёнку',`${id}: words must remain separated if a mobile break is hidden`);
 }
});
test('new gallery links to exactly the three rebuilt pages',async()=>{
 const gallery=await readFile(new URL('../../dist/restart.html',import.meta.url),'utf8');
 for(const {id} of designs)assert.ok(gallery.includes(`href="restart/${id}.html"`));
 assert.equal([...gallery.matchAll(/class="open-design"/g)].length,3);
 assert.ok(!gallery.includes('selection/gallery.css'));
});
