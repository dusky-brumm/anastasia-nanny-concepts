import {serviceDrawingPlans,serviceDrawingDelay,serviceHatching} from './service-drawing-model.js?v=__VERSION__';

// One drawing per visit. The ordinary artwork and text are the no-JS fallback.
const namespace='http://www.w3.org/2000/svg';
const preference=matchMedia('(prefers-reduced-motion: reduce)');
const node=(name,attributes)=>{const element=document.createElementNS(namespace,name);for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));return element;};
let sequence=0,enabled=false,queued=false;
let frame={frameTop:0,viewportHeight:innerHeight,toolbarHeight:0,near:true};
const drawings=[...document.querySelectorAll('#service [data-service-drawing]')].map(svg=>{
  const plan=serviceDrawingPlans[svg.dataset.serviceDrawing],image=svg.querySelector('image');
  const card=svg.closest('.study'),caption=card?.querySelector('.study-caption'),box=svg.viewBox.baseVal;
  if(!plan||!image||!caption||!image.animate)return null;
  const id=`service-pencil-${++sequence}`,defs=node('defs',{});
  const mask=node('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
  const group=node('g',{transform:`translate(${box.x} ${box.y}) scale(${box.width/1000} ${box.height/1000})`});
  const strokes=[],paper=[];
  for(const [index,part] of plan.entries()){
    const clipId=`${id}-part-${index}`,clip=node('clipPath',{id:clipId,clipPathUnits:'userSpaceOnUse'});
    clip.append(node('path',{d:part.region,'clip-rule':'evenodd'}));defs.append(clip);
    const layer=node('g',{'clip-path':`url(#${clipId})`});
    for(const [hatch,d,width,at,duration] of [
      [false,part.outline,part.width,part.at,part.duration*.62],
      [true,serviceHatching(),32,part.at+part.duration*.36,part.duration*.64],
    ]){
      const path=node('path',{d,fill:'none',stroke:'white','stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1});
      layer.append(path);strokes.push({path,at,duration,hatch});
    }
    group.append(layer);
    if(part.blank){
      const sheet=node('path',{d:part.blank,fill:'#faf8f2',opacity:0,transform:group.getAttribute('transform')});
      svg.insertBefore(sheet,image);paper.push({sheet,at:part.at+200});
    }
  }
  // A final fine pass catches edge grain between the hand-traced parts.
  const last=Math.max(...plan.map(part=>part.at+part.duration));
  const grain=node('path',{d:serviceHatching(18),fill:'none',stroke:'white','stroke-width':26,'stroke-linecap':'round',pathLength:1});
  group.append(grain);strokes.push({path:grain,at:last-100,duration:350,hatch:true});
  mask.append(group);defs.append(mask);svg.prepend(defs);
  return {svg,image,card,caption,id,strokes,paper,animations:[],started:false};
}).filter(Boolean);

function finish(drawing){
  drawing.started=true;
  drawing.image.removeAttribute('mask');
  drawing.caption.style.opacity='';drawing.caption.style.transform='';
  drawing.card.dataset.serviceDrawingState='complete';
  for(const animation of drawing.animations){animation.onfinish=null;animation.cancel();}
  drawing.animations=[];
}
function prepare(drawing){
  if(drawing.started)return;
  for(const {path} of drawing.strokes){path.style.strokeDasharray='1';path.style.strokeDashoffset='1';}
  drawing.image.setAttribute('mask',`url(#${drawing.id})`);
  drawing.caption.style.opacity='0';
  drawing.card.dataset.serviceDrawingState='waiting';
}
function start(drawing,delay){
  drawing.started=true;drawing.card.dataset.serviceDrawingState='drawing';
  for(const {path,at,duration,hatch} of drawing.strokes){
    drawing.animations.push(path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{
      delay:delay+at,duration,easing:hatch?'linear':'cubic-bezier(.4,0,.3,1)',fill:'forwards',
    }));
  }
  const finalStroke=drawing.animations.at(-1);
  for(const {sheet,at} of drawing.paper)drawing.animations.push(sheet.animate([{opacity:0},{opacity:1}],{delay:delay+at,duration:320,fill:'forwards'}));
  drawing.animations.push(drawing.caption.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{
    delay:delay+500,duration:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'both',
  }));
  // The final stroke owns cleanup; scrolling never restarts a completed picture.
  finalStroke.onfinish=()=>finish(drawing);
}
function render(){
  queued=false;if(!enabled||document.hidden||!frame.near)return;
  const visible=[];
  for(const drawing of drawings){
    if(drawing.started)continue;
    const bounds=drawing.svg.getBoundingClientRect(),top=frame.frameTop+bounds.top,bottom=frame.frameTop+bounds.bottom;
    if(!bounds.width||!bounds.height)continue;
    if(bottom<=frame.toolbarHeight){finish(drawing);continue;}
    if(top<frame.viewportHeight*.88&&bottom>frame.toolbarHeight)visible.push(drawing);
  }
  // Desktop cards share one stagger; narrow layouts wait for each actual entry.
  visible.forEach((drawing,index)=>start(drawing,serviceDrawingDelay(index)));
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
function setEnabled(next){
  enabled=next&&!preference.matches;
  for(const drawing of drawings){if(enabled)prepare(drawing);else finish(drawing);}
  schedule();
}
document.addEventListener('drawing:motion',event=>setEnabled(event.detail.enabled));
document.addEventListener('drawing:viewport',event=>{frame=event.detail;schedule();});
document.addEventListener('visibilitychange',schedule);
preference.addEventListener('change',()=>setEnabled(document.documentElement.dataset.drawingMotion==='on'));
if(parent===window){
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{frame.viewportHeight=innerHeight;schedule();});
  addEventListener('pageshow',schedule);
}
setEnabled(document.documentElement.dataset.drawingMotion==='on');
