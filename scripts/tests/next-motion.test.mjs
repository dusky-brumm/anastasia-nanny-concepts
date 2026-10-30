import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initNextMotion} from '../../dist/next/motion.js';

class Events {
  listeners=new Map();
  addEventListener(name,listener){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(listener);}
  removeEventListener(name,listener){this.listeners.get(name)?.delete(listener);}
  fire(name,event={}){for(const listener of this.listeners.get(name)||[])listener(event);}
}
function fixture({reduced=false,search='',storageBlocked=false}={}) {
  const button=Object.assign(new Events(),{hidden:true,disabled:false,attributes:{},setAttribute(name,value){this.attributes[name]=value;}});
  const preference=Object.assign(new Events(),{matches:reduced});
  const wide=Object.assign(new Events(),{matches:false});
  const animations=[];
  const panel={hidden:false,animate(){
    let reject;
    const animation={cancelled:false,finished:new Promise((_resolve,fail)=>{reject=fail;}),cancel(){this.cancelled=true;reject(new Error('cancelled'));}};
    animations.push(animation);return animation;
  }};
  const links=[{href:'https://example.test/next/02-column.html'},{href:'https://example.test/next.html#01-air'}];
  const doc=Object.assign(new Events(),{
    documentElement:{dataset:{}},
    querySelector(selector){return selector==='[data-motion-toggle]'?button:null;},
    querySelectorAll(){return links;},
    getElementById(id){return id==='case-school'?panel:null;},
  });
  let saved='on';
  const view={
    location:{href:`https://example.test/next/01-air.html${search}`,search},
    matchMedia(query){return query.includes('prefers-reduced-motion')?preference:wide;},
    localStorage:{getItem(){if(storageBlocked)throw new Error('blocked');return saved;},setItem(_key,value){if(storageBlocked)throw new Error('blocked');saved=value;}},
    history:{state:{review:true},replaceState(state,_title,href){this.state=state;view.location.href=href;view.location.search=new URL(href).search;}},
    clearTimeout(){},
  };
  return {doc,view,button,preference,panel,links,animations};
}

test('new pages remain static for system reduced motion and capture mode',()=>{
  for(const options of [{reduced:true},{search:'?capture=1'},{search:'?embed=1'}]) {
    const state=fixture(options);
    const controller=initNextMotion(state);
    state.doc.fire('next:tabchange',{detail:{panelId:'case-school'}});
    assert.equal(controller.enabled,false);
    assert.equal(state.animations.length,0);
    assert.equal(state.doc.documentElement.dataset.nextMotion,'off');
    assert.equal(state.button.hidden,!options.reduced);
    if(options.reduced)assert.equal(state.button.disabled,true);
    controller.destroy();
  }
});

test('a system preference change cancels an in-flight transition immediately',async()=>{
  const state=fixture();const controller=initNextMotion(state);
  state.doc.fire('next:tabchange',{detail:{panelId:'case-school'}});
  assert.equal(state.animations.length,1);
  state.preference.matches=true;state.preference.fire('change');
  assert.equal(state.animations[0].cancelled,true);
  assert.equal(controller.enabled,false);
  assert.equal(state.button.disabled,true);
  state.doc.fire('next:tabchange',{detail:{panelId:'case-school'}});
  assert.equal(state.animations.length,1);
  await Promise.resolve();controller.destroy();
});

test('the off URL and manual toggle work even when preference storage is blocked',async()=>{
  const state=fixture({search:'?motion=off&release=review',storageBlocked:true});
  const controller=initNextMotion(state);
  assert.equal(controller.enabled,false);
  assert.ok(state.links.every(link=>new URL(link.href).searchParams.get('motion')==='off'));
  assert.equal(new URL(state.links[1].href).hash,'#01-air');
  state.button.fire('click');
  assert.equal(controller.enabled,true);
  assert.equal(new URL(state.view.location.href).searchParams.get('motion'),null);
  assert.equal(new URL(state.view.location.href).searchParams.get('release'),'review');
  state.doc.fire('next:tabchange',{detail:{panelId:'case-school'}});
  state.button.fire('click');
  assert.equal(controller.enabled,false);
  assert.equal(state.animations[0].cancelled,true);
  assert.equal(new URL(state.view.location.href).searchParams.get('motion'),'off');
  assert.deepEqual(state.view.history.state,{review:true});
  await Promise.resolve();controller.destroy();
});
