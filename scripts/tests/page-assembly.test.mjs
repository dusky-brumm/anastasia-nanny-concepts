import test from 'node:test';
import assert from 'node:assert/strict';
import selectorParser from 'postcss-selector-parser';
import {scopeSelector} from '../assemble-selected-page.mjs';

test('document scoping keeps root attributes and body/main semantics inside each selected component',()=>{
 const css=scopeSelector('html[data-font-pair] body, :root, .story > main',['sd0','sd1']);
 const root=selectorParser().astSync(css);
 assert.equal(root.nodes.length,3);
 assert.match(css,/data-block-document/);assert.match(css,/data-block-body/);assert.match(css,/data-block-main/);
 assert.equal((css.match(/:where\(\.sd0,\.sd1\)/g)||[]).length,3);
 root.walkTags(tag=>assert.ok(!['html','body','main'].includes(tag.value)));
});
test('scoping preserves quoted attributes, nested pseudo selectors and pseudo-elements',()=>{
 const css=scopeSelector('body[data-fixed-theme="almost-white"] .photo:is(.large,.small)::before, .card:has(input:focus-visible)',['sd3']);
 assert.doesNotThrow(()=>selectorParser().astSync(css));
 assert.match(css,/:is\(\.large,\.small\)::before/);
 assert.match(css,/:has\(input:focus-visible\)/);
 assert.match(css,/data-fixed-theme="almost-white"/);
});
