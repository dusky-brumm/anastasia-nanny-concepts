import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeState,readState,selectVariant,designUrl,palettes} from '../../src/reference/studio/model.js';

test('a shared mixed design round-trips without losing any of the nine choices',()=>{
  const state={layout:'123455432',palette:'mint',font:'lora'};
  const url=new URL(designUrl('preview.html',state,'apply'),'https://example.test/');
  assert.deepEqual(readState(url.search),state);assert.equal(url.hash,'#apply');
});
test('corrupt saved state and untrusted query values safely use known choices',()=>{
  assert.deepEqual(normalizeState({layout:'9x3',palette:'<script>',font:'missing'}),{layout:'113111113',palette:'reference',font:'golos'});
  assert.deepEqual(normalizeState(null),{layout:'112111113',palette:'reference',font:'golos'});
  assert.deepEqual(readState('?layout=555555555&name=private&contact=private'),{layout:'555555555',palette:'reference',font:'golos'});
});
test('old route links change only the process block, while explicit designs take precedence',()=>{
  assert.deepEqual(readState('?route=4'),{layout:'112141113',palette:'reference',font:'golos'});
  assert.deepEqual(readState('?route=4&layout=222222222&font=lora'),{layout:'222222222',palette:'reference',font:'lora'});
  assert.deepEqual(readState('?route=999'),normalizeState(null));
});
test('changing one block preserves every other design decision',()=>{
  const original={layout:'123455432',palette:'rose',font:'prata'};
  assert.deepEqual(selectVariant(original,'pricing',2),{...original,layout:'123452432'});
  assert.equal(original.layout,'123455432');assert.deepEqual(selectVariant(original,'unknown',2),original);
});
test('the three additional process variants survive shared links and stay specific to the process block',()=>{
  for(const route of [6,7,8]){
    const state=readState('?route='+route);
    assert.equal(state.layout[4],String(route));
    assert.deepEqual(readState(new URL(designUrl('preview.html',state),'https://example.test/').search),state);
    assert.deepEqual(selectVariant(state,'hero',route),state);
  }
});
test('share links contain only design choices, never request fields',()=>{
  const url=new URL(designUrl('preview.html',{name:'Anna',contact:'private',layout:'111111111'}),'https://example.test/');
  assert.deepEqual([...url.searchParams.keys()],['layout','palette','font','v']);
});
function luminance(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
test('old comparison links keep their version and an explicit version can use any palette',()=>{
  assert.equal(readState('?palette=sky-previous').version,'previous');
  for(const version of ['current','previous'])for(const palette of ['sky-previous','reference','soft-sage','blue-mist']){
    const state=normalizeState({version,palette});
    const url=new URL(designUrl('preview.html',state),'https://example.test/');
    assert.deepEqual(readState(url.search),state);
  }
});
test('palettes keep body and accent text readable on all three page backgrounds',()=>{
  for(const p of palettes)for(const foreground of [p.ink,p.accent])for(const background of [p.paper,p.wash,p.soft]){
    const ratio=(Math.max(luminance(foreground),luminance(background))+.05)/(Math.min(luminance(foreground),luminance(background))+.05);
    assert.ok(ratio>=4.5,`${p.id}: contrast ${ratio.toFixed(2)}`);
  }
  for(const p of palettes)assert.ok(1.05/(luminance(p.button??p.ink)+.05)>=4.5,p.id);
});
