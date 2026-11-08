import {applyTypography} from './typography.js?v=facfffb01e';
import {mountDrawingExperience} from './drawing-parent.js?v=facfffb01e';
import {mountBlockFrames} from './frame-layout.js?v=facfffb01e';

const frames=[...document.querySelectorAll('iframe[data-reference-frame]')];
const ready=new WeakSet(),waiting=new Map();
for(const frame of frames){let resolve;const promise=new Promise(done=>{resolve=done;});waiting.set(frame,{promise,resolve});}
const critical=frames.filter(frame=>['header','hero'].includes(frame.parentElement.id));
const layout=mountBlockFrames(frames,{onReady:frame=>{
  ready.add(frame);waiting.get(frame).resolve();
  if(critical.every(item=>ready.has(item))&&document.documentElement.dataset.siteReady!=='true'){
    document.documentElement.dataset.siteReady='true';
    document.dispatchEvent(new CustomEvent('site:layout'));
  }
},onNavigate:id=>navigate(id,true)});
applyTypography(document);
mountDrawingExperience(frames);

let navigation=0;
async function navigate(id,push=false){
  const target=document.getElementById(id);
  const position=frames.findIndex(frame=>frame.parentElement===target);
  if(position<0)return;
  const request=++navigation;
  if(push&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
  const preceding=frames.slice(0,position+1);
  // A requested destination and the blocks above it need their final heights.
  for(const frame of preceding)frame.loading='eager';
  let timeout;
  const settled=Promise.all(preceding.map(async frame=>{
    await waiting.get(frame).promise;
    // Reading a requested section needs stable text heights, but never waits
    // for its images. The first screen itself still renders immediately.
    await frame.contentDocument?.fonts.ready;
  }));
  await Promise.race([settled,new Promise(resolve=>{timeout=setTimeout(resolve,6000);})]);
  clearTimeout(timeout);
  if(request!==navigation)return;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  preceding.forEach(frame=>layout.fit(frame));
  const animate=push&&document.documentElement.dataset.drawingMotion!=='off'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({block:'start',behavior:animate?'smooth':'instant'});
}
addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
if(location.hash)navigate(location.hash.slice(1));

document.addEventListener('click',event=>{
  const dialog=document.getElementById('studio-privacy');
  if(event.target.closest('[data-close]'))dialog.close();
  if(event.target===dialog){
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
});
