import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp01,entryProgress,segmentProgress,drawingEnabled,pencilGesture,pricingPatchState} from '../../src/site/drawing-model.js';

test('price patches grow with scroll, reverse and hold still without any time input',()=>{
  const far=pricingPatchState(1000,320,1000),near=pricingPatchState(750,320,1000),full=pricingPatchState(300,320,1000);
  assert.ok(far.scale<near.scale&&near.scale<full.scale);
  assert.equal(full.scale,1);assert.ok(full.radius>71);
  assert.deepEqual(pricingPatchState(750,320,1000),near);
  assert.deepEqual(pricingPatchState(1000,320,1000),far);
  for(const height of [230,320])for(const viewport of [360,568,852,1000])for(const top of [-500,0,200,600,1200]){
    const state=pricingPatchState(top,height,viewport,2);
    assert.ok(Object.values(state).every(Number.isFinite));
    assert.ok(Math.abs(state.x)<=2&&Math.abs(state.y)<=1.4&&Math.abs(state.angle)<=1.1);
  }
  assert.equal(pricingPatchState(NaN,230,852),null);
  assert.equal(pricingPatchState(300,0,852),null);
  assert.equal(pricingPatchState(300,230,0),null);
});

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

test('pencil masks cover transparent artwork edges, including offset viewBoxes',()=>{
  for(const box of [{x:424,y:193,width:666,height:620},{x:-12,y:-6,width:1,height:1}]){
    const gesture=pencilGesture(box),coordinates=gesture.d.match(/-?(?:\d*\.)?\d+(?:e[+-]?\d+)?/g).map(Number);
    const xs=coordinates.filter((_,i)=>i%2===0),ys=coordinates.filter((_,i)=>i%2===1);
    assert.ok(coordinates.every(Number.isFinite));
    assert.ok(Math.min(...xs)<box.x&&Math.max(...xs)>box.x+box.width);
    assert.ok(Math.min(...ys)-gesture.strokeWidth/2<box.y);
    assert.ok(Math.max(...ys)+gesture.strokeWidth/2>box.y+box.height);
    assert.ok(gesture.strokeWidth>box.height/10,'Adjacent passes overlap');
  }
  assert.throws(()=>pencilGesture({x:0,y:0,width:0,height:12}),RangeError);
  assert.throws(()=>pencilGesture({x:NaN,y:0,width:12,height:12}),RangeError);
});
