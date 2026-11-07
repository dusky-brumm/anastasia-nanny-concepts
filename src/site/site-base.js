import {applyFontPair,readFontChoice,resolveFontPair,findFontPair,fontStorageKey} from './font-pairs.js?v=__VERSION__';
import {mountAboutSection} from './about-section.js?v=__VERSION__';

const frames=[...document.querySelectorAll('iframe[data-reference-frame]')];
const switcher=document.querySelector('.font-switcher');
const buttons=[...document.querySelectorAll('[data-font-choice]')];
const headingChoice=document.querySelector('[data-heading-choice]');
const bodyChoice=document.querySelector('[data-body-choice]');
let storage;
try{storage=localStorage;}catch{/* The URL works when storage is blocked. */}
let activePair=readFontChoice(location.search,storage);
let revision=0;

function fitFrame(frame){
  const root=frame.contentDocument?.querySelector('[data-reference-block-root]');
  if(!root)return;
  const height=Math.ceil(Math.max(root.getBoundingClientRect().height,root.scrollHeight));
  if(height>0)frame.height=String(height);
}
async function styleFrame(frame,pair){
  const doc=frame.contentDocument;
  if(!doc?.body)return;
  await applyFontPair(doc,pair);
  fitFrame(frame);
}
async function chooseFont(pair,{updateUrl=false,preservePosition=true}={}){
  const currentRevision=++revision;
  const visibleEdge=switcher.getBoundingClientRect().height+8;
  const anchor=preservePosition?[...document.querySelectorAll('[data-selected-block]')].find(block=>block.getBoundingClientRect().bottom>visibleEdge):null;
  const offset=anchor?.getBoundingClientRect().top;
  document.documentElement.classList.add('font-changing');
  activePair=pair;
  headingChoice.value=pair.headingId;
  bodyChoice.value=pair.bodyId;
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.fontChoice===pair.id));
  document.querySelector('[data-font-status] strong').textContent=`${pair.heading} + ${pair.body}`;
  try{storage?.setItem(fontStorageKey,pair.id);}catch{/* Saving the choice is optional. */}
  if(updateUrl){const url=new URL(location.href);url.searchParams.set('fonts',pair.id);history.replaceState(null,'',url);}
  await Promise.allSettled([applyFontPair(document,pair),...frames.map(frame=>styleFrame(frame,pair))]);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(currentRevision!==revision)return;
  frames.forEach(fitFrame);
  if(anchor)window.scrollBy({top:anchor.getBoundingClientRect().top-offset,behavior:'instant'});
  document.documentElement.classList.remove('font-changing');
}
for(const button of buttons)button.addEventListener('click',()=>chooseFont(resolveFontPair(button.dataset.fontChoice),{updateUrl:true}));
for(const select of [headingChoice,bodyChoice])select.addEventListener('change',()=>chooseFont(findFontPair(headingChoice.value,bodyChoice.value),{updateUrl:true}));
for(const frame of frames)frame.addEventListener('load',()=>styleFrame(frame,activePair));
new ResizeObserver(()=>document.documentElement.style.setProperty('--font-switcher-height',switcher.getBoundingClientRect().height+'px')).observe(switcher);
chooseFont(activePair,{preservePosition:false});
mountAboutSection();
window.addEventListener('popstate',()=>{
  const pair=readFontChoice(location.search,storage);
  if(pair.id!==activePair.id)chooseFont(pair);
});

document.addEventListener('click',event=>{
  const dialog=document.getElementById('studio-privacy');
  if(event.target.closest('[data-close]'))dialog.close();
  if(event.target===dialog){
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  }
});
// Frame heights settle after fonts and images load; restore direct section links.
window.addEventListener('load',async()=>{
  await Promise.allSettled(frames.map(frame=>styleFrame(frame,activePair)));
  const target=document.getElementById(location.hash.slice(1));
  if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
});
