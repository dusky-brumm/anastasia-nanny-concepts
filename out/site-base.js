// The final site always uses the approved Lora + Manrope pairing.
const siteTypography=Object.freeze({heading:'Lora',body:'Manrope'});
function applyTypography(doc){
  const root=doc.documentElement;
  root.dataset.fontPair='5';
  root.dataset.bodyFont='manrope';
  root.style.setProperty('--pair-heading','"Lora",serif');
  root.style.setProperty('--pair-body','"Manrope",sans-serif');
  root.style.setProperty('--pair-heading-weight','400');
  root.style.setProperty('--pair-scale','1');
  root.style.setProperty('--pair-tracking','-.025em');
  // CSS requests only the faces actually used in this block. Never hold layout
  // or navigation for an unused italic face or a photograph further down.
}

const clamp01=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

// A drawing finishes while it is comfortably in view, before its caption is read.
function entryProgress(top,height,viewportHeight,toolbarHeight=0){
  if(![top,height,viewportHeight,toolbarHeight].every(Number.isFinite)||viewportHeight<=0)return 0;
  const available=Math.max(0,viewportHeight-Math.max(0,toolbarHeight));
  if(!available)return 0;
  const start=Math.max(0,toolbarHeight)+available*.92;
  const travel=Math.min(200,Math.max(80,height))+available*.16;
  return clamp01((start-top)/travel);
}

function segmentProgress(progress,index,count){
  if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count)return 0;
  return clamp01(clamp01(progress)*count-index);
}

function drawingEnabled({reduced=false,choice='on',capture=false}={}){
  return !reduced&&!capture&&choice!=='off';
}


function mountDrawingExperience(frames){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const search=new URLSearchParams(location.search);
  const choice=search.get('motion')==='off'?'off':'on';
  let queued=false;

  function enabled(){return drawingEnabled({reduced:reduced.matches,choice,capture:search.get('capture')==='1'});}
  function render(){
    queued=false;
    if(document.hidden)return;
    const active=enabled(),toolbarHeight=0;
    const settled=document.documentElement.dataset.siteReady==='true';
    const state=active?'on':'off';
    if(document.documentElement.dataset.drawingMotion!==state){
      document.documentElement.dataset.drawingMotion=state;
      document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
    }
    for(const frame of frames){
      const doc=frame.contentDocument;
      if(!doc?.querySelector('[data-reference-block-root]'))continue;
      const bounds=frame.getBoundingClientRect();
      doc.dispatchEvent(new frame.contentWindow.CustomEvent('drawing:viewport',{detail:{
        enabled:active,frameTop:bounds.top,viewportHeight:innerHeight,toolbarHeight,
        near:settled&&bounds.bottom>toolbarHeight-160&&bounds.top<innerHeight+160,
      }}));
    }
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
  const observer=new ResizeObserver(schedule);
  frames.forEach(frame=>{frame.addEventListener('load',schedule);observer.observe(frame);});
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',schedule);
  document.addEventListener('site:layout',schedule);
  reduced.addEventListener('change',schedule);
  schedule();
}

// Keep the editable blocks seamless without waiting for their photographs.
function mountBlockFrames(frames,{onReady,onNavigate}){
  const documents=new WeakMap();
  const fits=new WeakMap();
  function bind(frame){
    const doc=frame.contentDocument;
    const root=doc?.querySelector('[data-reference-block-root]');
    if(!root||documents.get(frame)===doc)return;
    documents.set(frame,doc);
    doc.documentElement.dataset.referenceEmbedded='true';
    let queued=false;
    const fit=()=>{
      queued=false;
      if(!frame.isConnected||!root.getBoundingClientRect().width)return;
      const menus=[...doc.querySelectorAll('details[open] nav')];
      const height=Math.ceil(Math.max(root.getBoundingClientRect().height,root.scrollHeight,...menus.map(menu=>menu.getBoundingClientRect().bottom)));
      if(height>0&&frame.height!==String(height))frame.height=String(height);
      if(height>0)frame.dataset.frameFitted='true';
    };
    const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(fit);}};
    fits.set(frame,fit);
    const observer=new ResizeObserver(schedule);
    observer.observe(root);
    doc.querySelectorAll('.s-menu-links,.mobile-menu>nav,.design-site-menu>nav').forEach(menu=>observer.observe(menu));
    doc.addEventListener('toggle',fit,true);
    doc.addEventListener('load',schedule,true);
    doc.addEventListener('animationend',schedule,true);
    doc.fonts.ready.then(schedule);
    doc.fonts.addEventListener('loadingdone',schedule);
    doc.addEventListener('request:draft',event=>{
      event.preventDefault();fit();
      requestAnimationFrame(()=>{
        fit();
        const draft=doc.querySelector('.s-draft:not([hidden])');
        if(!draft)return;
        const top=frame.getBoundingClientRect().top+draft.getBoundingClientRect().top;
        if(top<24||top+draft.getBoundingClientRect().height>innerHeight-24)window.scrollTo({top:Math.max(0,scrollY+top-24),behavior:'instant'});
        draft.querySelector('textarea')?.focus({preventScroll:true});
      });
    });
    doc.addEventListener('pointerdown',()=>closeMenus(frame),true);
    doc.addEventListener('click',event=>{
      if(event.target.closest('.s-privacy')){
        event.preventDefault();event.stopImmediatePropagation();
        document.getElementById('studio-privacy').showModal();return;
      }
      const link=event.target.closest('[data-reference-target]');
      if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const target=document.getElementById(link.dataset.referenceTarget);
      if(!target)return;
      event.preventDefault();event.stopImmediatePropagation();
      closeMenus();fit();onNavigate(target.id);
    },true);
    fit();onReady(frame);
  }
  function closeMenus(except){
    for(const frame of frames){
      if(frame===except)continue;
      const menus=frame.contentDocument?.querySelectorAll('.s-menu[open],.mobile-menu[open],.design-site-menu[open]');
      menus?.forEach(menu=>{menu.open=false;});
      if(menus?.length)fits.get(frame)?.();
    }
  }
  for(const frame of frames){
    frame.addEventListener('load',()=>bind(frame));
    if(frame.contentDocument?.documentElement.dataset.blockLayoutReady==='true'||frame.contentDocument?.readyState==='complete')bind(frame);
  }
  addEventListener('site:block-ready',event=>{if(frames.includes(event.detail?.frame))bind(event.detail.frame);});
  document.addEventListener('pointerdown',()=>closeMenus(),true);
  return {fit:frame=>fits.get(frame)?.()};
}


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
