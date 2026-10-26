import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selection,selectEntries} from '../../src/selection/catalog.mjs';
import {replaceReviewPanel} from '../build-selection.mjs';

test('shortlist has twelve unique destinations and fails on a missing design',()=>{
 assert.equal(selection.length,12);
 assert.equal(new Set(selection.map(item=>item.href)).size,12);
 assert.throws(()=>selectEntries([]),/Missing shortlisted design/);
});
test('review replacement consumes nested controls without touching site content',()=>{
 const html='<body><div class="review-toolbar" data-review-ui><a>old</a><div><div>nested</div></div></div><main><div>keep</div></main></body>';
 assert.equal(replaceReviewPanel(html,'<nav>new</nav>'),'<body><nav>new</nav><main><div>keep</div></main></body>');
 assert.throws(()=>replaceReviewPanel('<main>no panel</main>',''),/Missing generated review panel/);
});
test('the gallery and every shortlisted page use the same twelve-design navigation',async()=>{
 const gallery=await readFile(new URL('../../dist/collection.html',import.meta.url),'utf8');
 assert.equal([...gallery.matchAll(/data-card-id="/g)].length,12);
 const sections=['header','hero','service','about','process','pricing','reviews','request','footer'];
 for(const item of selection){
  assert.ok(gallery.includes(`data-card-id="${item.id}"`));
  const html=await readFile(new URL(`../../dist/${item.href}`,import.meta.url),'utf8');
  assert.deepEqual([...html.matchAll(/data-section="([a-z]+)"/g)].map(match=>match[1]),sections);
  assert.ok(html.includes(`../collection.html#card-${item.id}`));
  assert.ok(html.includes('Просмотр 12 отобранных дизайнов'));
  assert.ok(!html.includes('class="review-toolbar"')&&!html.includes('class="design-bar"'));
 }
});
