import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sitePage,artworkPage} from '../../src/site/pages.mjs';
import {fontPairs,fontCatalog,quickFontPairs,findFontPair,readFontChoice} from '../../src/site/font-pairs.js';

test('the approved selection is fixed and independent of query parameters or old saved choices',async()=>{
  const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
  assert.deepEqual(Object.fromEntries(selection.blocks.map(({id,choice})=>[id,choice])),{header:'quiet',hero:'fotoalbum',service:'chalk-light',about:'quiet',process:'early-classic-arrows',pricing:'early-classic',reviews:'early-classic',apply:'early-classic',footer:'chalk-letter'});
  const html=sitePage(selection);
  assert.equal((html.match(/data-reference-frame/g)||[]).length,9);
  assert.doesNotMatch(html,/localStorage|data-assembly-choice|studio\/app\.js/);
  for(const {id,file} of selection.blocks){assert.ok(html.includes(`id="${id}"`));assert.ok(html.includes(`src="${file}?v=__VERSION__"`));}
});

test('artwork library exposes every original file with a download and escapes titles',()=>{
  const html=artworkPage([{file:'artwork/example.svg',title:'<Эскиз> & "линия"',group:'Линии',sha256:'example'}]);
  assert.match(html,/&lt;Эскиз&gt; &amp; &quot;линия&quot;/);
  assert.match(html,/href="artwork\/example.svg" download/);
  assert.match(html,/data-background="blue"/);
  assert.match(html,/artwork-library\.zip/);
});

test('all historical fonts can be combined in either role, including the four original presets',()=>{
  assert.deepEqual(fontCatalog.map(font=>font.family),['Manrope','Golos Text','Lora','Prata','Tinos','Caveat','Georgia','Arial','Segoe UI','Times New Roman']);
  assert.equal(fontPairs.length,100);
  assert.equal(new Set(fontPairs.map(pair=>pair.heading+'+'+pair.body)).size,100);
  assert.equal(quickFontPairs.length,20);
  assert.deepEqual(quickFontPairs.slice(0,4).map(pair=>pair.heading+' + '+pair.body),['Manrope + Golos Text','Lora + Golos Text','Prata + Manrope','Tinos + Manrope']);
  for(const heading of fontCatalog)for(const body of fontCatalog){const pair=findFontPair(heading.id,body.id);assert.equal(pair.headingId,heading.id);assert.equal(pair.bodyId,body.id);}
});

test('an explicit shared font choice wins over saved state and unknown IDs use the default',()=>{
  const storage={getItem:()=> '9'};
  assert.equal(readFontChoice('?fonts=2',storage).id,'2');
  assert.equal(readFontChoice('',storage).id,'9');
  assert.equal(readFontChoice('?fonts=unknown',storage).id,'1');
  assert.equal(readFontChoice('?fonts=url(evil)',storage).id,'1');
  assert.equal(readFontChoice('',{getItem(){throw new Error('storage blocked');}}).id,'1');
});
