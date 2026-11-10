import {drawingEnabled,entryProgress,segmentProgress} from './drawing-model.js?v=__VERSION__';
import {pencilDuration,nextServiceDelay} from './hatching-model.js?v=__VERSION__';
import {pencilArtwork} from './pencil-artwork-data.js?v=__VERSION__';
import {createPencilDrawing} from './pencil-renderer.js?v=__VERSION__';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let search=location.search;
try{if(parent!==window)search=parent.location.search;}catch{/* Standalone previews use their own preference. */}
const params=new URLSearchParams(search);
let viewport={enabled:drawingEnabled({choice:params.get('motion'),capture:params.get('capture')==='1'}),frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
let active,queued=false,viewportReceived=parent===window;
const easing='cubic-bezier(.22,1,.36,1)';
const serviceStarts=new Map();

const lines=[...document.querySelectorAll('svg[data-ink-line]')].map(svg=>({
  svg,progress:0,started:false,animations:[],
  paths:[...svg.querySelectorAll(':scope>path,[data-ink-stroke],g>path')].map(path=>{
    const marker=path.getAttribute('marker-end'),nonScaling=getComputedStyle(path).vectorEffect==='non-scaling-stroke';
    const strokeWidth=parseFloat(getComputedStyle(path).strokeWidth)||2.2;
    path.setAttribute('pathLength','1');path.style.strokeDasharray='1';
    return {path,marker,nonScaling,strokeWidth};
  }),
}));

const pictures=[...document.querySelectorAll('svg[data-pencil-art]')].map(svg=>{
  const image=svg.querySelector('image');
  const url=image?.getAttribute('href')??image?.getAttribute('data-pencil-src')??svg.dataset.pencilFile??'';
  const key=url.split(/[?#]/)[0].split('/').pop();
  const drawing=createPencilDrawing(svg,pencilArtwork[key],{paper:/book|profile|recommendation|application|letter|calendar|tea|chairs/.test(key)});
  if(!drawing)return null;
  const service=svg.hasAttribute('data-service-drawing');
  return {...drawing,key,service,kind:svg.dataset.serviceDrawing,group:svg.closest('[data-block]')??svg.parentElement,
    caption:service?svg.closest('.study')?.querySelector('.study-caption'):null,
    ready:!image?.hasAttribute('data-pencil-src'),mediaRequested:false,started:false,captionAnimation:null,fadeAnimation:null,
  };
}).filter(Boolean);

function finishLine(line,remember=true){
  line.animations.forEach(animation=>animation.cancel());line.animations=[];
  for(const {path,marker} of line.paths){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);}
  line.svg.dataset.inkState='complete';
  if(remember){line.progress=1;line.started=true;}
}
function finishPicture(picture,remember=true){
  picture.finish();picture.captionAnimation?.cancel();picture.captionAnimation=null;
  picture.fadeAnimation?.cancel();picture.fadeAnimation=null;
  if(picture.caption){picture.caption.style.opacity='';picture.caption.style.transform='';}
  picture.svg.dataset.pencilState='complete';
  if(remember)picture.started=true;
}
function preparePicture(picture){
  if(picture.started)return;
  picture.prepare();
  if(picture.caption)picture.caption.style.opacity='0';
  picture.svg.dataset.pencilState='waiting';
}
function requestMedia(picture){
  if(picture.ready||picture.mediaRequested||!picture.originalImage)return;
  picture.mediaRequested=true;
  picture.originalImage.addEventListener('load',()=>{picture.ready=true;schedule();},{once:true});
  picture.originalImage.addEventListener('error',()=>{picture.ready=true;finishPicture(picture);},{once:true});
  for(const image of picture.svg.querySelectorAll('image[data-pencil-src]'))image.setAttribute('href',image.getAttribute('data-pencil-src'));
}
function setActive(next){
  if(active===next)return;
  active=next;document.documentElement.dataset.drawingMotion=active?'on':'off';
  serviceStarts.clear();
  for(const line of lines){
    if(!active){finishLine(line,false);continue;}
    if(parent===window&&!line.started){
      const bounds=line.svg.getBoundingClientRect(),openingDrawing=(line.svg.classList.contains('hero-underline')&&scrollY<80)||line.svg.classList.contains('classic-arrow-lines');
      if(bounds.top<innerHeight&&bounds.bottom>0&&!openingDrawing){finishLine(line);continue;}
    }
    const pending=line.svg.dataset.inkLine==='scroll'?line.progress<1:!line.started;
    if(pending)line.svg.dataset.inkState='waiting';
    if(pending)for(const {path,marker} of line.paths){path.style.strokeDasharray='1';path.style.strokeDashoffset='1';if(marker)path.removeAttribute('marker-end');}
  }
  for(const picture of pictures){if(active)preparePicture(picture);else finishPicture(picture,false);}
  document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
}
function scaleLineStroke({path,nonScaling,strokeWidth}){
  if(!nonScaling)return;
  const matrix=path.getScreenCTM(),scale=matrix?Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c)):1;
  if(scale>0){path.style.vectorEffect='none';path.style.strokeWidth=String(strokeWidth/scale);}
}
function revealLine(line){
  line.started=true;line.progress=1;line.svg.dataset.inkState='drawing';
  const circle=line.svg.classList.contains('early-price-ring'),route=line.svg.classList.contains('classic-arrow-lines');
  const circleIndex=circle?[...line.svg.parentElement.parentElement.children].indexOf(line.svg.parentElement):0;
  line.paths.forEach((stroke,index)=>{
    const {path,marker}=stroke;
    if(!path.animate){finishLine(line);return;}
    scaleLineStroke(stroke);path.style.strokeDashoffset='0';
    const animation=path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:route?520:(circle?1500:1100)/3,delay:route?index*180:(circleIndex*130+index*100)/3,easing,fill:'backwards'});
    animation.onfinish=()=>{
      path.style.strokeDasharray='none';path.style.vectorEffect='';path.style.strokeWidth='';
      if(marker)path.setAttribute('marker-end',marker);
      line.animations=line.animations.filter(item=>item!==animation);
      if(!line.animations.length)line.svg.dataset.inkState='complete';
    };
    line.animations.push(animation);
  });
}
function startPicture(picture,delay){
  picture.started=true;picture.svg.dataset.pencilState='drawing';
  const duration=pencilDuration(picture.kind),startedAt=performance.now();
  const softService=picture.service;
  picture.svg.dataset.pencilDelay=String(delay);picture.svg.dataset.pencilDuration=String(duration);
  if(softService){
    const opacity=Number(getComputedStyle(picture.svg).opacity);
    picture.fadeAnimation=picture.svg.animate([{opacity:opacity*.35},{opacity}],{delay,duration:duration*.65,easing:'ease-out',fill:'backwards'});
  }
  if(picture.caption)picture.captionAnimation=picture.caption.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{delay:delay+(softService?duration*.35:500),duration:650/3,easing,fill:'both'});
  picture.start({delay,duration,onFinish:()=>{picture.svg.dataset.pencilElapsed=String(Math.round(performance.now()-startedAt));finishPicture(picture);}});
}
function isDisplayed(picture,bounds){
  return bounds.width>0&&bounds.height>0&&bounds.right>0&&bounds.left<innerWidth&&!picture.svg.closest('[hidden],li[aria-hidden="true"]')&&getComputedStyle(picture.svg).visibility!=='hidden';
}
function render(){
  setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
  if(!viewport.near||document.hidden)return;
  const progressFor=element=>{
    const bounds=element.getBoundingClientRect();
    return bounds.width&&bounds.height?entryProgress(viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,viewport.toolbarHeight):0;
  };
  if(active)for(const line of lines){
    if(line.started&&line.progress>=1)continue;
    const progress=progressFor(line.svg);
    if(line.svg.dataset.inkLine!=='scroll'){if(progress>0&&!line.started)revealLine(line);continue;}
    line.progress=Math.max(line.progress,progress);
    line.paths.forEach(({path,marker,nonScaling,strokeWidth},index)=>{
      const part=segmentProgress(line.progress,index,line.paths.length);
      if(part>=1){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);return;}
      scaleLineStroke({path,nonScaling,strokeWidth});
      path.style.strokeDasharray='1';path.style.strokeDashoffset=String(1-part);if(marker)path.removeAttribute('marker-end');
    });
    line.svg.dataset.inkState=line.progress>=1?'complete':line.progress>0?'drawing':'waiting';
  }
  const groups=new Map();
  for(const picture of pictures){
    if(picture.started&&picture.ready)continue;
    const bounds=picture.svg.getBoundingClientRect();if(!isDisplayed(picture,bounds))continue;
    const top=viewport.frameTop+bounds.top,bottom=viewport.frameTop+bounds.bottom;
    if(top<viewport.viewportHeight+240&&bottom>viewport.toolbarHeight)requestMedia(picture);
    if(!active||picture.started||!picture.ready)continue;
    if(bottom<=viewport.toolbarHeight){finishPicture(picture);continue;}
    if(top>=viewport.viewportHeight*.88)continue;
    if(!groups.has(picture.group))groups.set(picture.group,[]);groups.get(picture.group).push(picture);
  }
  const now=performance.now();
  for(const visible of groups.values())visible.forEach((picture,index)=>{
    const delay=picture.service?nextServiceDelay(now,serviceStarts.get(picture.group)):160+index*100;
    if(picture.service)serviceStarts.set(picture.group,now+delay);
    startPicture(picture,delay);
  });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}}

document.addEventListener('drawing:viewport',event=>{viewportReceived=true;viewport=event.detail;schedule();});
document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
document.addEventListener('scroll',schedule,{passive:true,capture:true});
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','hidden','aria-hidden','data-fonts-ready']});
document.fonts?.ready.then(schedule);
if(parent===window){
  const standalone=()=>{viewport={...viewport,viewportHeight:innerHeight};schedule();};
  addEventListener('scroll',standalone,{passive:true});addEventListener('resize',standalone);addEventListener('pageshow',standalone);
}
setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
if(parent===window)render();
else try{parent.document.dispatchEvent(new Event('site:layout'));}catch{/* Cross-origin previews do not notify a parent. */}
