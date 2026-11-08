import {applyTypography} from './typography.js?v=__VERSION__';
import {mountDrawingExperience} from './drawing-parent.js?v=__VERSION__';

const frames=[...document.querySelectorAll('iframe[data-reference-frame]')];
function fitFrame(frame){
  const root=frame.contentDocument?.querySelector('[data-reference-block-root]');
  if(!root)return;
  const height=Math.ceil(Math.max(root.getBoundingClientRect().height,root.scrollHeight));
  if(height>0)frame.height=String(height);
}
async function styleFrame(frame){
  const doc=frame.contentDocument;
  if(!doc?.body)return;
  await applyTypography(doc);
  fitFrame(frame);
}
for(const frame of frames)frame.addEventListener('load',()=>styleFrame(frame));
applyTypography(document);
mountDrawingExperience(frames);

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
  await Promise.allSettled(frames.map(styleFrame));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  frames.forEach(fitFrame);
  const target=document.getElementById(location.hash.slice(1));
  if(target)target.scrollIntoView({block:'start',behavior:'instant'});
  document.documentElement.dataset.siteReady='true';
  document.dispatchEvent(new CustomEvent('site:layout'));
});
