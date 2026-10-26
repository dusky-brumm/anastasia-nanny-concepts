import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {directions} from '../../src/atelier/catalog.mjs';
import {headline} from '../../src/atelier/common.mjs';

test('replacement and unlimited candidates belong to full selection, not consultation',async()=>{
 for(const d of directions){
  const html=await readFile(new URL(`../../dist/${d.href}`,import.meta.url),'utf8');
  const pricing=html.match(/id="pricing"[\s\S]*?<\/section>/)[0];
  const plans=[...pricing.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(m=>m[0].replace(/<[^>]*>/g,' '));
  assert.equal(plans.length,2,`${d.id}: two clearly scoped services`);
  assert.match(plans[0],/25 000/);assert.match(plans[0],/Неограниченное количество кандидатов/);
  assert.match(plans[0],/Бесплатная замена в течение 6 месяцев/);
  assert.match(plans[1],/5 500/);assert.doesNotMatch(plans[1],/Неограниченное|Бесплатная замена|6 месяцев/);
 }
});
test('all six rendered pages retain the client structure and professional factual content',async()=>{
 const order=['header','hero','service','about','process','pricing','reviews','request','footer'];
 for(const d of directions){
  const html=await readFile(new URL(`../../dist/${d.href}`,import.meta.url),'utf8');
  assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(m=>m[1]),order,d.id);
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
  assert.equal(h1,headline,`${d.id}: visual breaks must preserve spaces`);
  const text=html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
  for(const fact of ['2022','25 000','5 500','6 месяцев','Готовы обсудить подбор?'])assert.ok(text.includes(fact),`${d.id}: ${fact}`);
  assert.ok(html.includes('data-request-form')&&html.includes('name="contact"'));
  assert.ok(!/restart\/base|final\.css|fresh\.css|Caveat|garden-mood/.test(html),`${d.id}: no earlier presentation styles`);
  assert.ok(!/500\+|40\+|одной командой|Привет, я|своего человека/.test(html),`${d.id}: professional copy`);
 }
});
test('gallery exposes all six live pages, desktop and phone screenshots',async()=>{
 const html=await readFile(new URL('../../dist/atelier.html',import.meta.url),'utf8');
 assert.equal([...html.matchAll(/class="open-design"/g)].length,6);
 for(const d of directions){assert.ok(html.includes(`href="${d.href}"`));for(const size of ['desktop','mobile'])assert.ok(html.includes(`atelier/screens/${d.id}-${size}.webp`));}
});
