import test from 'node:test';
import assert from 'node:assert/strict';
import {readAboutVariant,storyIndex} from '../../src/site/about-model.js';

test('about design URLs retain only known choices and default safely',()=>{
  assert.equal(readAboutVariant('?about=3&fonts=4').id,'3');
  for(const search of ['', '?about=old', '?about=<script>', '?about=999'])assert.equal(readAboutVariant(search).id,'1');
});

test('scroll chapters include the last chapter and clamp when entering or leaving in either direction',()=>{
  assert.deepEqual([-.3,0,.249,.25,.499,.5,.749,.75,1,1.5].map(progress=>storyIndex(progress,4)),[0,0,0,1,1,2,2,3,3,3]);
  assert.deepEqual([.9,.6,.3,.1].map(progress=>storyIndex(progress,4)),[3,2,1,0]);
  assert.equal(storyIndex(NaN,4),0);
  assert.equal(storyIndex(.8,0),0);
});
