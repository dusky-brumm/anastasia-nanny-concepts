import {drawingEnabled,entryProgress,segmentProgress} from './drawing-model.js?v=dd23ce6867';

const svgNS='http://www.w3.org/2000/svg';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let search=location.search;
try{if(parent!==window)search=parent.location.search;}catch{/* A standalone drawing uses its own preference. */}
const params=new URLSearchParams(search);
const initialChoice=params.get('motion');
let viewport={enabled:drawingEnabled({choice:initialChoice,capture:params.get('capture')==='1'}),frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
let active,serial=0;
const easing='cubic-bezier(.22,1,.36,1)';
function svgElement(name,attributes){const node=document.createElementNS(svgNS,name);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node;}

const lines=[...document.querySelectorAll('svg[data-ink-line]')].map(svg=>({
  svg,progress:0,started:false,animations:[],
  paths:[...svg.querySelectorAll(':scope>path,[data-ink-stroke],g>path')].map(path=>{
    const marker=path.getAttribute('marker-end'),nonScaling=getComputedStyle(path).vectorEffect==='non-scaling-stroke';
    const strokeWidth=parseFloat(getComputedStyle(path).strokeWidth)||2.2;
    path.setAttribute('pathLength','1');path.style.strokeDasharray='1';
    return {path,marker,nonScaling,strokeWidth};
  }),
}));

// A single broad chalk gesture reveals each illustration; original pixels stay intact.
const pictures=[...document.querySelectorAll('svg[data-chalk-picture]')].map((svg,index)=>{
  const image=svg.querySelector('image'),box=svg.viewBox.baseVal;
  if(!image||!box.width||!box.height)return null;
  const id=`chalk-gesture-${++serial}`,step=box.height/6;
  const left=box.x-box.width*.08,right=box.x+box.width*1.08;
  let d=`M${left} ${box.y+step/2}`;
  for(let row=0;row<6;row++){
    d+=`H${row%2?left:right}`;
    if(row<5)d+=`V${box.y+step*(row+1.5)}`;
  }
  const path=svgElement('path',{d,fill:'none',stroke:'white','stroke-width':step*1.12,'stroke-linecap':'square','stroke-linejoin':'round',pathLength:1});
  const mask=svgElement('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height});
  mask.append(path);
  let defs=svg.querySelector('defs');if(!defs){defs=svgElement('defs',{});svg.prepend(defs);}defs.append(mask);
  return {svg,image,path,id,index,started:false,animation:null};
}).filter(Boolean);

function finishLine(line,remember=true){
  line.animations.forEach(animation=>animation.cancel());line.animations=[];
  for(const {path,marker} of line.paths){path.style.strokeDasharray='none';path.style.strokeDashoffset='0';path.style.vectorEffect='';path.style.strokeWidth='';if(marker)path.setAttribute('marker-end',marker);}
  if(remember){line.progress=1;line.started=true;}
}
function finishPicture(picture,remember=true){
  picture.animation?.cancel();picture.animation=null;
  picture.path.style.strokeDashoffset='0';picture.image.removeAttribute('mask');
  if(remember)picture.started=true;
}
function setActive(next){
  if(active===next)return;
  active=next;
  document.documentElement.dataset.drawingMotion=active?'on':'off';
  for(const line of lines){
    if(!active){finishLine(line,false);continue;}
    const pending=line.svg.dataset.inkLine==='scroll'?line.progress<1:!line.started;
    if(pending)for(const {path,marker} of line.paths){path.style.strokeDasharray='1';path.style.strokeDashoffset='1';if(marker)path.removeAttribute('marker-end');}
  }
  for(const picture of pictures){
    if(!active){finishPicture(picture,false);continue;}
    if(!picture.started){picture.path.style.strokeDasharray='1';picture.path.style.strokeDashoffset='1';picture.image.setAttribute('mask',`url(#${picture.id})`);}
  }
  document.dispatchEvent(new CustomEvent('drawing:motion',{detail:{enabled:active}}));
}
function revealLine(line){
  line.started=true;line.progress=1;
  const word=line.svg.closest('.hero-calm');
  if(word?.animate){
    line.animations.push(word.animate([{color:'#28353c'},{color:'#526c73'}],{duration:1100,easing,fill:'backwards'}));
  }
  line.paths.forEach(({path},index)=>{
    path.style.strokeDashoffset='0';
    if(!path.animate)return;
    const animation=path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:1000,delay:index*80,easing,fill:'backwards'});
    animation.onfinish=()=>{path.style.strokeDasharray='none';};
    line.animations.push(animation);
  });
}
function render(){
  setActive(viewport.enabled&&!reduced.matches);
  if(!active||!viewport.near||document.hidden)return;
  const progressFor=element=>{
    const bounds=element.getBoundingClientRect();
    return bounds.width&&bounds.height?entryProgress(viewport.frameTop+bounds.top,bounds.height,viewport.viewportHeight,viewport.toolbarHeight):0;
  };
  for(const line of lines){
    const progress=progressFor(line.svg);
    if(line.svg.dataset.inkLine!=='scroll'){
      if(progress>0&&!line.started)revealLine(line);
      continue;
    }
    line.progress=Math.max(line.progress,progress);
    line.paths.forEach(({path,marker,nonScaling,strokeWidth},index)=>{
      const part=segmentProgress(line.progress,index,line.paths.length);
      if(part>=1){
        path.style.strokeDasharray='none';path.style.strokeDashoffset='0';
        path.style.vectorEffect='';path.style.strokeWidth='';
        if(marker)path.setAttribute('marker-end',marker);
        return;
      }
      // Normalized dashes and non-scaling strokes use different coordinate spaces.
      // Compensate the width while tracing, then return to the original solid stroke.
      if(nonScaling){
        const matrix=path.getScreenCTM();
        const scale=matrix?Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c)):1;
        if(scale>0){path.style.vectorEffect='none';path.style.strokeWidth=String(strokeWidth/scale);}
      }
      path.style.strokeDasharray='1';
      path.style.strokeDashoffset=String(1-part);
      if(marker)path.removeAttribute('marker-end');
    });
  }
  for(const picture of pictures){
    if(picture.started||progressFor(picture.svg)<=.05)continue;
    const bounds=picture.svg.getBoundingClientRect();
    if(viewport.frameTop+bounds.bottom<viewport.toolbarHeight||!picture.path.animate){finishPicture(picture);continue;}
    picture.started=true;picture.path.style.strokeDashoffset='0';
    picture.animation=picture.path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:1200,delay:picture.index*60,easing,fill:'backwards'});
    picture.animation.onfinish=()=>{picture.image.removeAttribute('mask');picture.animation=null;};
  }
}
document.addEventListener('drawing:viewport',event=>{viewport=event.detail;render();});
reduced.addEventListener('change',render);
document.addEventListener('visibilitychange',render);
if(parent===window){
  const standalone=()=>{viewport={...viewport,viewportHeight:innerHeight};render();};
  addEventListener('scroll',standalone,{passive:true});addEventListener('resize',standalone);
}
setActive(viewport.enabled&&!reduced.matches);
if(parent===window)render();
