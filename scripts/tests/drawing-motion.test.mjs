import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp01,entryProgress,segmentProgress,drawingEnabled} from '../../src/site/drawing-model.js';

test('drawings stay untouched below view and finish before their captions are read',()=>{
  assert.equal(entryProgress(1100,120,1000,56),0);
  assert.equal(entryProgress(400,120,1000,56),1);
  const approaching=entryProgress(850,120,1000,56),closer=entryProgress(750,120,1000,56);
  assert.ok(approaching>0&&approaching<closer&&closer<1);
});
test('invalid or hidden viewports never produce an invalid drawing offset',()=>{
  for(const value of [NaN,Infinity,-Infinity])assert.equal(entryProgress(value,120,1000),0);
  assert.equal(entryProgress(300,120,0),0);
  assert.equal(entryProgress(300,120,500,500),0);
  assert.equal(clamp01(NaN),0);assert.equal(clamp01(-1),0);assert.equal(clamp01(2),1);
});
test('route segments connect in order, including exact joins and the last arrow',()=>{
  assert.deepEqual([0,1,2,3].map(i=>segmentProgress(.25,i,4)),[1,0,0,0]);
  assert.deepEqual([0,1,2,3].map(i=>segmentProgress(.625,i,4)),[1,1,.5,0]);
  assert.deepEqual([0,1,2,3].map(i=>segmentProgress(1,i,4)),[1,1,1,1]);
  assert.equal(segmentProgress(.5,-1,4),0);assert.equal(segmentProgress(.5,0,0),0);
});
test('system reduced motion and an explicit off choice always override drawing',()=>{
  assert.equal(drawingEnabled(),true);
  assert.equal(drawingEnabled({reduced:true,choice:'on'}),false);
  assert.equal(drawingEnabled({choice:'off'}),false);
  assert.equal(drawingEnabled({capture:true}),false);
});
