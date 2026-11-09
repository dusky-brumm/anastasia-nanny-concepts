import {pencilPasses,drawingTiming} from './hatching-model.js?v=__VERSION__';

const pencilNamespace='http://www.w3.org/2000/svg';
const pencilElement=(name,attributes={})=>{
  const element=document.createElementNS(pencilNamespace,name);
  for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));
  return element;
};
let pencilSerial=0;

function pencilClone(source,outline=false){
  const copy=source.cloneNode(true);
  const original=[source,...source.querySelectorAll('*')],cloned=[copy,...copy.querySelectorAll('*')];
  for(let index=0;index<cloned.length;index++){
    const node=cloned[index];node.removeAttribute('id');
    if(outline){
      node.removeAttribute('filter');node.style.opacity='1';node.style.filter='none';
      if(node.matches('path,circle,ellipse,rect,line,polyline,polygon')){
        node.style.setProperty('fill','none','important');node.style.setProperty('stroke','white','important');
        node.style.setProperty('stroke-opacity','1','important');node.style.setProperty('vector-effect','none','important');
      }
    }else if(node.matches('path,circle,ellipse,rect,line,polyline,polygon')){
      const style=getComputedStyle(original[index]);
      for(const property of ['fill','stroke','stroke-width','fill-opacity','stroke-opacity'])node.style.setProperty(property,style.getPropertyValue(property));
      node.style.setProperty('vector-effect','none','important');
    }
  }
  return copy;
}

function pencilImageBox(image,box,natural){
  const value=(name,fallback)=>{const text=image.getAttribute(name),number=parseFloat(text);return Number.isFinite(number)?text.endsWith('%')?number/100*fallback:number:fallback;};
  const x=value('x',0)||0,y=value('y',0)||0,width=value('width',box.width)||box.width,height=value('height',box.height)||box.height;
  const aspect=image.getAttribute('preserveAspectRatio')??'xMidYMid meet';
  if(!natural||aspect.includes('none'))return {x,y,width,height};
  const scale=(aspect.includes('slice')?Math.max:Math.min)(width/natural[0],height/natural[1]);
  const w=natural[0]*scale,h=natural[1]*scale;
  return {x:x+(width-w)*(aspect.includes('xMin')?0:aspect.includes('xMax')?1:.5),y:y+(height-h)*(aspect.includes('YMin')?0:aspect.includes('YMax')?1:.5),width:w,height:h};
}

// SVG masks reveal the original colors in contour, background and detail passes.
export function createPencilDrawing(svg,artwork,{paper=false}={}){
  const box=svg.viewBox.baseVal;
  if(!box.width||!box.height||!svg.animate)return null;
  const originalImage=svg.querySelector('image');
  const source=pencilElement('g',{'data-pencil-source':''});
  for(const child of [...svg.children])if(!['defs','title','desc'].includes(child.localName))source.append(child);
  svg.append(source);
  const id=`pencil-art-${++pencilSerial}`,defs=pencilElement('defs');
  const mask=pencilElement('mask',{id,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
  let outlines,footprint;
  if(originalImage){
    const paint=pencilImageBox(originalImage,box,artwork?.size);
    const contour=pencilElement('g',{transform:`${originalImage.getAttribute('transform')??''} translate(${paint.x} ${paint.y}) scale(${paint.width/1000} ${paint.height/1000})`});
    for(const d of artwork?.contours??[])contour.append(pencilElement('path',{d,fill:'none',stroke:'white','stroke-width':26,'stroke-linecap':'round','stroke-linejoin':'round'}));
    mask.append(contour);outlines=[...contour.children];footprint=contour.cloneNode(true);
    while(footprint.children.length>1)footprint.lastElementChild.remove();
  }else{
    const contour=pencilClone(source,true);
    const selector='path,circle,ellipse,rect,line,polyline,polygon';
    const originals=[...source.querySelectorAll(selector)];
    const geometry=originals.map((shape,index)=>{const bounds=shape.getBBox(),style=getComputedStyle(shape);return {index,area:bounds.width*bounds.height,filled:style.fill!=='none'&&style.fill!=='transparent'&&Number(style.fillOpacity)!==0};});
    const filled=geometry.filter(shape=>shape.filled),candidates=filled.length?filled:geometry;
    const largest=Math.max(0,...candidates.map(shape=>shape.area));
    const selected=new Set(candidates.filter(shape=>shape.area>=largest*.35).sort((a,b)=>b.area-a.area).slice(0,4).map(shape=>shape.index));
    outlines=[...contour.querySelectorAll(selector)].filter((shape,index)=>{if(selected.has(index))return true;shape.remove();return false;});
    for(const shape of outlines)shape.style.setProperty('stroke-width',String(Math.max(box.width,box.height)/115),'important');
    mask.append(contour);footprint=contour.cloneNode(true);
  }
  const normalized=pencilElement('g',{transform:`translate(${box.x} ${box.y}) scale(${box.width/1000} ${box.height/1000})`});
  const layers=[];
  for(const [kind,values] of [['background','0 0 0 1 1'],['details','1 1 1 0 0']]){
    const filterId=`${id}-${kind}-filter`,maskId=`${id}-${kind}`;
    const filter=pencilElement('filter',{id:filterId,'color-interpolation-filters':'sRGB',x:'0%',y:'0%',width:'100%',height:'100%'});
    filter.append(pencilElement('feColorMatrix',{type:'saturate',values:0}));
    const transfer=pencilElement('feComponentTransfer');
    for(const channel of ['R','G','B'])transfer.append(pencilElement(`feFunc${channel}`,{type:'discrete',tableValues:values}));
    transfer.append(pencilElement('feFuncA',{type:'linear',slope:100}));filter.append(transfer);defs.append(filter);
    const shade=pencilElement('mask',{id:maskId,maskUnits:'userSpaceOnUse',x:0,y:0,width:1000,height:1000,style:'mask-type:luminance'});
    const imageSpace=pencilElement('g',{transform:`scale(${1000/box.width} ${1000/box.height}) translate(${-box.x} ${-box.y})`});
    imageSpace.append(pencilClone(source));
    const filtered=pencilElement('g',{filter:`url(#${filterId})`});filtered.append(imageSpace);shade.append(filtered);defs.append(shade);
    const layer=pencilElement('g',{mask:`url(#${maskId})`});normalized.append(layer);layers.push({kind,layer});
  }
  const grain=pencilElement('g');normalized.append(grain);mask.append(normalized);defs.append(mask);svg.prepend(defs);
  let paperView,paperHatches;
  if(paper&&footprint.children.length){
    for(const shape of footprint.querySelectorAll('path,circle,ellipse,rect,line,polyline,polygon')){
      shape.style.setProperty('fill','#faf8f2','important');shape.style.setProperty('stroke','none','important');
    }
    const progressId=`${id}-paper-progress`,progress=pencilElement('mask',{id:progressId,maskUnits:'userSpaceOnUse',x:box.x,y:box.y,width:box.width,height:box.height,style:'mask-type:alpha'});
    paperHatches=pencilElement('g',{transform:normalized.getAttribute('transform')});progress.append(paperHatches);defs.append(progress);
    paperView=pencilElement('g',{mask:`url(#${progressId})`});paperView.style.display='none';
    const paperSpace=pencilElement('g',{transform:normalized.getAttribute('transform')});
    const inkHoles=pencilElement('g',{mask:`url(#${id}-details)`});
    const originalSpace=pencilElement('g',{transform:`scale(${1000/box.width} ${1000/box.height}) translate(${-box.x} ${-box.y})`});
    originalSpace.append(footprint);inkHoles.append(originalSpace);paperSpace.append(inkHoles);paperView.append(paperSpace);svg.insertBefore(paperView,source);
  }
  let animations=[],strokes=[];

  function finish(){
    source.removeAttribute('mask');
    if(paperView)paperView.style.display='none';
    for(const animation of animations){animation.onfinish=null;animation.cancel();}
    animations=[];
  }
  function prepare(){
    finish();strokes=[];
    paperHatches?.replaceChildren();
    for(const {kind,layer} of layers){
      layer.replaceChildren();
      for(const pass of pencilPasses(kind==='details')){
        const path=pencilElement('path',{d:pass.d,fill:'none',stroke:'white','stroke-width':pass.width,'stroke-linecap':'round','stroke-linejoin':'round',transform:`rotate(${pass.angle} 500 500)`});
        layer.append(path);strokes.push({path,kind,start:pass.start,end:pass.end});
        if(kind==='background'&&paperHatches){
          const paperPath=path.cloneNode(true);paperHatches.append(paperPath);strokes.push({path:paperPath,kind,start:pass.start,end:pass.end});
        }
      }
    }
    grain.replaceChildren();
    const finalPass=pencilPasses().at(-1);
    const finalStroke=pencilElement('path',{d:finalPass.d,fill:'none',stroke:'white','stroke-width':finalPass.width,'stroke-linecap':'round',transform:`rotate(${finalPass.angle} 500 500)`});
    grain.append(finalStroke);strokes.push({path:finalStroke,kind:'grain',start:0,end:1});
    for(const path of [...outlines,...strokes.map(stroke=>stroke.path)]){
      path.setAttribute('pathLength','1');path.style.strokeDasharray='1';path.style.strokeDashoffset='1';
    }
    source.setAttribute('mask',`url(#${id})`);
    if(paperView)paperView.style.display='';
  }
  function start({delay=0,duration=1060,onFinish=()=>{}}={}){
    const lengths=outlines.map(path=>Math.max(1,path.getTotalLength?.()??1));
    const sum=lengths.reduce((a,b)=>a+b,0)||1;
    let at=0;
    outlines.forEach((path,index)=>{
      const time=duration*drawingTiming.contour*lengths[index]/sum;
      animations.push(path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{delay:delay+at,duration:time,easing:'linear',fill:'forwards'}));at+=time;
    });
    for(const stroke of strokes){
      const start=stroke.kind==='background' ? drawingTiming.contour : stroke.kind==='details' ? drawingTiming.contour+drawingTiming.background : .92;
      const span=stroke.kind==='background' ? drawingTiming.background : stroke.kind==='details' ? drawingTiming.details : .08;
      const animation=stroke.path.animate([{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{
        delay:delay+duration*(start+span*stroke.start),duration:duration*span*(stroke.end-stroke.start),easing:'linear',fill:'forwards',
      });
      animations.push(animation);
    }
    animations.at(-1).onfinish=()=>{finish();onFinish();};
  }
  return {svg,source,originalImage,prepare,start,finish};
}
