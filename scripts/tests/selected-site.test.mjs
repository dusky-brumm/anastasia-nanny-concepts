import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sitePage} from '../../src/site/pages.mjs';

test('the approved selection is fixed and independent of query parameters or old saved choices',async()=>{
  const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
  assert.deepEqual(Object.fromEntries(selection.blocks.map(({id,choice})=>[id,choice])),{header:'quiet',hero:'fotoalbum',service:'chalk-light',about:'quiet',process:'early-classic-arrows',pricing:'early-classic',reviews:'early-classic',apply:'early-classic',footer:'chalk-letter'});
  const blocks=selection.blocks.map(({id})=>`<section id="${id}" data-block="${id}"></section>`);
  const html=sitePage(selection,blocks);
  assert.doesNotMatch(html,/<iframe\b|data-reference-frame/);
  assert.doesNotMatch(html,/localStorage|data-assembly-choice|studio\/app\.js|data-font-choice|data-heading-choice|data-body-choice|data-about-choice|artwork/);
  assert.match(html,/data-font-pair="5" data-body-font="manrope"/);
  for(const {id} of selection.blocks)assert.ok(html.includes(`id="${id}"`));
  assert.match(html,/site-runtime\.js/);
  assert.throws(()=>sitePage(selection),/complete selected page/);
});
