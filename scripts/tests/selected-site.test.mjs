import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sitePage} from '../../src/site/pages.mjs';

test('the approved selection is fixed and independent of query parameters or old saved choices',async()=>{
  const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
  assert.deepEqual(Object.fromEntries(selection.blocks.map(({id,choice})=>[id,choice])),{header:'quiet',hero:'fotoalbum',service:'chalk-light',about:'quiet',process:'early-classic-arrows',pricing:'early-classic',reviews:'early-classic',apply:'early-classic',footer:'chalk-letter'});
  const html=sitePage(selection);
  assert.equal((html.match(/data-reference-frame/g)||[]).length,9);
  assert.doesNotMatch(html,/localStorage|data-assembly-choice|studio\/app\.js|data-font-choice|data-heading-choice|data-body-choice|data-about-choice|artwork/);
  assert.match(html,/data-font-pair="5" data-body-font="manrope"/);
  for(const {id,file} of selection.blocks){assert.ok(html.includes(`id="${id}"`));assert.ok(html.includes(`src="${file}?v=__VERSION__"`));}
});
