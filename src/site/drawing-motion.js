import {drawingEnabled,entryProgress,segmentProgress,pricingPatchState,drawingReplayState,drawingInView} from './drawing-model.js?v=__VERSION__';
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
const pricePatches=[...document.querySelectorAll('#pricing .pn-3 .pn-term')];
const patchProperties=['--pn-growth','--pn-radius','--pn-x','--pn-y','--pn-wobble'];
const siteHeader=parent===window?document.querySelector('[data-block-document=header]'):null;
const drawingGroup=element=>element.closest('[data-block]')??element.closest('[data-block-document]')??element.parentElement;

const lines=[...document.querySelectorAll('svg[data-ink-line]')].map(svg=>({
  svg,group:drawingGroup(svg),progress:0,started:false,runs:0,animations:[],
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
  const drawing=createPencilDrawing(svg,pencilArtwork[key],{paper:!svg.classList.contains('illustration-hatching')&&/book|album|profile|recommendation|application|letter|calendar|tea|cups|chairs/.test(key)});
  if(!drawing)return null;
  const service=svg.hasAttribute('data-service-drawing');
  const caption=service?svg.closest('.study')?.querySelector('.study-caption'):null;
  return {...drawing,key,service,kind:svg.dataset.serviceDrawing,group:drawingGroup(svg),
    caption,captionTargets:caption?[...caption.children]:[],
    ready:!image?.hasAttribute('data-pencil-src'),mediaRequested:false,failed:false,started:false,runs:0,captionStarted:false,captionAnimations:[],fadeAnimation:null,
  };
}).filter(Boolean);

const drawingGroups=new Map();
function groupFor(element){
  if(!drawingGroups.has(element))drawingGroups.set(element,{element,visible:false,lines:[],pictures:[]});
  return drawingGroups.get(element);
}
lines.forEach(line=>groupFor(line.group).lines.push(line));
pictures.forEach(picture=>groupFor(picture.group).pictures.push(picture));

function finishLine(line,remember=true){
  line.animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});line.animations=[];
  for(const {path,marker} of line.paths){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);}
  line.svg.dataset.inkState='complete';
  if(remember){line.progress=1;line.started=true;}
}
function resetLine(line){
  line.animations.forEach(animation=>{animation.onfinish=null;animation.cancel();});line.animations=[];
  line.progress=0;line.started=false;line.svg.dataset.inkState='waiting';
  for(const {path,marker} of line.paths){
    path.style.strokeDasharray='1';path.style.strokeDashoffset='1';path.style.vectorEffect='';path.style.strokeWidth='';
    if(marker)path.removeAttribute('marker-end');
  }
}
function clearCaption(picture){
  picture.captionAnimations.forEach(animation=>animation.cancel());picture.captionAnimations=[];
  for(const target of picture.captionTargets){target.style.opacity='';target.style.transform='';}
}
function finishPicture(picture,remember=true){
  picture.finish();clearCaption(picture);
  picture.fadeAnimation?.cancel();picture.fadeAnimation=null;
  if(picture.caption)picture.captionStarted=true;
  picture.svg.dataset.pencilState='complete';
  if(remember)picture.started=true;
}
function preparePicture(picture){
  if(picture.started)return;
  picture.prepare();
  if(!picture.captionStarted)for(const target of picture.captionTargets)target.style.opacity='0';
  picture.svg.dataset.pencilState='waiting';
}
function resetPicture(picture){
  clearCaption(picture);
  picture.fadeAnimation?.cancel();picture.fadeAnimation=null;
  picture.started=false;picture.captionStarted=false;
  delete picture.svg.dataset.pencilElapsed;
  preparePicture(picture);
}
function replayGroups(visibleTop){
  for(const group of drawingGroups.values()){
    const bounds=group.element.getBoundingClientRect();
    if(!bounds.width||!bounds.height)continue;
    const state=drawingReplayState(group.visible,viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,visibleTop);
    group.visible=state.visible;
    if(!state.reset)continue;
    serviceStarts.delete(group.element);
    for(const line of group.lines)if(line.started&&line.svg.dataset.inkLine!=='scroll')resetLine(line);
    for(const picture of group.pictures)if(!picture.failed&&(picture.started||picture.captionStarted))resetPicture(picture);
  }
}
function requestMedia(picture){
  if(picture.ready||picture.mediaRequested||!picture.originalImage)return;
  picture.mediaRequested=true;
  picture.originalImage.addEventListener('load',()=>{picture.ready=true;schedule();},{once:true});
  picture.originalImage.addEventListener('error',()=>{picture.ready=true;picture.failed=true;finishPicture(picture);},{once:true});
  for(const image of picture.svg.querySelectorAll('image[data-pencil-src]'))image.setAttribute('href',image.getAttribute('data-pencil-src'));
}
function setActive(next){
  if(active===next)return;
  active=next;document.documentElement.dataset.drawingMotion=active?'on':'off';
  if(!active)for(const patch of pricePatches)for(const property of patchProperties)patch.style.removeProperty(property);
  serviceStarts.clear();
  for(const line of lines){
    if(!active){finishLine(line,false);continue;}
    if(parent===window&&!line.started){
      const bounds=line.svg.getBoundingClientRect(),openingDrawing=(line.svg.classList.contains('hero-underline')&&scrollY<80)||line.svg.classList.contains('classic-arrow-lines');
      if(bounds.top<innerHeight&&bounds.bottom>0&&!openingDrawing){finishLine(line);continue;}
    }
    if(line.svg.dataset.inkLine==='scroll'||!line.started)resetLine(line);
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
  line.svg.dataset.inkRun=String(++line.runs);
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
function startCaption(picture,delay=0){
  if(!picture.caption||picture.captionStarted)return;
  picture.captionStarted=true;
  picture.captionAnimations=picture.captionTargets.map(target=>target.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{delay,duration:650/3,easing,fill:'both'}));
}
function startPicture(picture,delay){
  picture.started=true;picture.svg.dataset.pencilState='drawing';
  picture.svg.dataset.pencilRun=String(++picture.runs);
  const duration=pencilDuration(picture.kind),startedAt=performance.now();
  const softService=picture.service;
  picture.svg.dataset.pencilDelay=String(delay);picture.svg.dataset.pencilDuration=String(duration);
  if(softService){
    const opacity=Number(getComputedStyle(picture.svg).opacity);
    picture.fadeAnimation=picture.svg.animate([{opacity:opacity*.35},{opacity}],{delay,duration:duration*.65,easing:'ease-out',fill:'backwards'});
  }
  startCaption(picture,delay+(softService?duration*.35:500));
  picture.start({delay,duration,onFinish:()=>{picture.svg.dataset.pencilElapsed=String(Math.round(performance.now()-startedAt));finishPicture(picture);}});
}
function isDisplayed(picture,bounds){
  return bounds.width>0&&bounds.height>0&&bounds.right>0&&bounds.left<innerWidth&&!picture.svg.closest('[hidden],li[aria-hidden="true"]')&&getComputedStyle(picture.svg).visibility!=='hidden';
}
function render(){
  setActive(viewportReceived&&viewport.enabled&&!reduced.matches);
  if(document.hidden)return;
  const comparisonBar=parent===window?document.querySelector('.surface-study-bar'):null;
  const visibleTop=Math.max(viewport.toolbarHeight,siteHeader?.getBoundingClientRect().bottom??0,comparisonBar?.getBoundingClientRect().bottom??0);
  if(active)replayGroups(visibleTop);
  if(!viewport.near)return;
  if(active)pricePatches.forEach((patch,index)=>{
    const bounds=patch.getBoundingClientRect();
    const state=pricingPatchState(viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,index,viewport.toolbarHeight);
    if(!state)return;
    const values=[state.scale.toFixed(4),state.radius.toFixed(3)+'%',state.x.toFixed(3)+'px',state.y.toFixed(3)+'px',state.angle.toFixed(3)+'deg'];
    patchProperties.forEach((property,i)=>{if(patch.style.getPropertyValue(property)!==values[i])patch.style.setProperty(property,values[i]);});
  });
  if(active)for(const line of lines){
    const bounds=line.svg.getBoundingClientRect(),top=viewport.frameTop+bounds.top;
    if(line.svg.dataset.inkLine!=='scroll'){
      if(!line.started&&bounds.width&&drawingInView(top,bounds.height,viewport.viewportHeight,visibleTop))revealLine(line);
      continue;
    }
    line.progress=bounds.width&&bounds.height?entryProgress(top,bounds.height,viewport.viewportHeight,viewport.toolbarHeight):0;
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
    const inView=drawingInView(top,bounds.height,viewport.viewportHeight,visibleTop);
    if(active&&picture.caption&&!picture.captionStarted&&!inView){
      const captionInView=picture.captionTargets.some(target=>{
        const captionBounds=target.getBoundingClientRect();
        return drawingInView(viewport.frameTop+captionBounds.top,captionBounds.height,viewport.viewportHeight,visibleTop);
      });
      if(captionInView)startCaption(picture);
    }
    if(!active||picture.started||!picture.ready)continue;
    if(!inView)continue;
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
