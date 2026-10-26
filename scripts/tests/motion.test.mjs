import test from 'node:test';
import assert from 'node:assert/strict';
import {initPresentationEffects} from '../../dist/final/motion.js';

function environment({reduced=false,search=''}={}){
  const calls={animations:0,cancelled:0};
  const observers=[];
  const listeners=new Map();
  let preferenceListener;
  const preference={matches:reduced,addEventListener(_name,callback){preferenceListener=callback;},removeEventListener(){preferenceListener=undefined;}};
  const headline={hidden:false,style:{},matches:selector=>selector==='h1',animate(){calls.animations++;return {finished:new Promise(()=>{}),cancel(){calls.cancelled++;}};}};
  const root={dataset:{},scrollHeight:4000,animate(){}};
  const doc={documentElement:root,querySelector:()=>null,getElementById:()=>null,querySelectorAll:selector=>selector.startsWith('.hero h1')?[headline]:[]};
  const win={
    location:{search},innerHeight:844,scrollY:0,
    matchMedia:()=>preference,requestAnimationFrame:()=>1,cancelAnimationFrame(){},clearTimeout(){},
    addEventListener(name,callback){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(callback);},
    removeEventListener(name,callback){listeners.get(name)?.delete(callback);},
    IntersectionObserver:class{constructor(){observers.push(this);}observe(){}unobserve(){}disconnect(){this.disconnected=true;}}
  };
  return {doc,win,root,headline,calls,observers,listeners,setReduced(value){preference.matches=value;preferenceListener?.();},hasPreferenceListener:()=>Boolean(preferenceListener)};
}

test('system reduced motion leaves the headline visible and starts no animation',()=>{
  const env=environment({reduced:true});
  const dispose=initPresentationEffects(env);
  assert.equal(env.root.dataset.motion,'reduced');
  assert.equal(env.calls.animations,0);
  assert.equal(env.headline.hidden,false);
  assert.deepEqual(env.headline.style,{});
  dispose();
});

test('changing the system preference cancels active movement immediately',()=>{
  const env=environment();
  const dispose=initPresentationEffects(env);
  assert.ok(env.calls.animations>0);
  env.setReduced(true);
  assert.equal(env.root.dataset.motion,'reduced');
  assert.equal(env.calls.cancelled,env.calls.animations);
  assert.equal(env.headline.hidden,false);
  dispose();
  assert.ok(env.observers.every(observer=>observer.disconnected));
  assert.ok([...env.listeners.values()].every(callbacks=>callbacks.size===0));
  assert.equal(env.hasPreferenceListener(),false);
});

test('a shared motion-off URL keeps a static readable page even when motion is allowed',()=>{
  const env=environment({search:'?motion=off'});
  const dispose=initPresentationEffects(env);
  assert.equal(env.root.dataset.motion,'off');
  assert.equal(env.calls.animations,0);
  assert.equal(env.headline.hidden,false);
  dispose();
});
