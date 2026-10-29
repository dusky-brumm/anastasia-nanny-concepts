import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {designs} from '../../src/next/catalog.mjs';
import {headline,reviews} from '../../src/next/common.mjs';

test('five new full pages preserve the approved content and nine-section order',async()=>{
  assert.equal(designs.length,5);
  const order=['header','hero','service','about','process','pricing','reviews','request','footer'];
  for(const design of designs) {
    const html=await readFile(new URL(`../../dist/${design.href}`,import.meta.url),'utf8');
    assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(match=>match[1]),order,design.id);
    const title=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
    assert.equal(title,headline,design.id);
    for(const fact of ['2022','двух агентствах','пять лет','Готовы обсудить подбор?','data-request-form','name="contact"']) assert.ok(html.includes(fact),`${design.id}: ${fact}`);
    for(const review of reviews) assert.ok(html.includes(review.text)&&html.includes(review.name),`${design.id}: genuine review retained`);
    const styles=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(match=>match[1]);
    assert.deepEqual(styles.map(url=>url.split('?')[0]),['fonts.css','base.css',`${design.id}.css`],`${design.id}: no earlier presentation styles`);
    assert.doesNotMatch(html,/500\+|40\+|няня мечты|бережно проведу|своего человека/i);
  }
});

test('each pricing section keeps replacement and unlimited candidates in selection only',async()=>{
  for(const design of designs) {
    const html=await readFile(new URL(`../../dist/${design.href}`,import.meta.url),'utf8');
    const section=html.match(/id="pricing"[\s\S]*?<\/section>/)[0];
    const plans=design.id==='03-practice'
      ? ['selection','consultation'].map(key=>[
        section.match(new RegExp(`<th id="practice-${key}"[\\s\\S]*?<\\/th>`))[0],
        ...[...section.matchAll(new RegExp(`<td headers="practice-${key} [^"]+"[\\s\\S]*?<\\/td>`,'g'))].map(match=>match[0]),
        [...section.matchAll(/<article\b[\s\S]*?<\/article>/g)][key==='selection'?0:1][0],
      ].join(' ').replace(/<[^>]+>/g,' '))
      : [...section.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(match=>match[0].replace(/<[^>]+>/g,' '));
    assert.equal(plans.length,2,design.id);
    assert.match(plans[0],/25 000/); assert.match(plans[0],/Неограниченное количество кандидатов|Количество кандидатов не ограничено/); assert.match(plans[0],/Бесплатная замена в течение 6 месяцев/);
    assert.match(plans[1],/5 500/); assert.match(plans[1],/1,5–2 часа/); assert.doesNotMatch(plans[1],/Неограниченное|Бесплатная замена|6 месяцев/);
  }
});

test('interactive examples and service formats remain present before JavaScript enhancement',async()=>{
  for(const id of ['03-practice','05-album']) {
    const html=await readFile(new URL(`../../dist/next/${id}.html`,import.meta.url),'utf8');
    const panels=[...html.matchAll(/<(?:div|article)\b[^>]*role="tabpanel"[^>]*>/g)].map(match=>match[0]);
    assert.equal(panels.length,2,id);
    for(const panel of panels) assert.doesNotMatch(panel,/\bhidden\b/,`${id}: content readable without JS`);
    assert.ok(html.includes('aria-controls=')&&html.includes('aria-selected="true"'));
  }
});

test('new gallery exposes five real sites and both complete screenshot sizes',async()=>{
  const html=await readFile(new URL('../../dist/next.html',import.meta.url),'utf8');
  assert.equal([...html.matchAll(/class="open-design"/g)].length,5);
  for(const design of designs) {
    assert.ok(html.includes(`href="${design.href}"`));
    for(const size of ['desktop','mobile']) {
      const file=`next/screens/${design.id}-${size}.webp`;
      assert.ok(html.includes(file));
      const bytes=await readFile(new URL(`../../dist/${file}`,import.meta.url));
      assert.ok(bytes.length>1000,`${design.id}: complete ${size} screenshot`);
    }
  }
});
