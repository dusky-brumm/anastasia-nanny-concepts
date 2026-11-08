export const clamp01=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

// A drawing finishes while it is comfortably in view, before its caption is read.
export function entryProgress(top,height,viewportHeight,toolbarHeight=0){
  if(![top,height,viewportHeight,toolbarHeight].every(Number.isFinite)||viewportHeight<=0)return 0;
  const available=Math.max(0,viewportHeight-Math.max(0,toolbarHeight));
  if(!available)return 0;
  const start=Math.max(0,toolbarHeight)+available*.92;
  const travel=Math.min(200,Math.max(80,height))+available*.16;
  return clamp01((start-top)/travel);
}

export function segmentProgress(progress,index,count){
  if(!Number.isInteger(count)||count<1||!Number.isInteger(index)||index<0||index>=count)return 0;
  return clamp01(clamp01(progress)*count-index);
}

export function drawingEnabled({reduced=false,choice='on',capture=false}={}){
  return !reduced&&!capture&&choice!=='off';
}

// Overscan keeps every pencil pass beyond the artwork's transparent edges.
export function pencilGesture({x,y,width,height},passes=10){
  if(![x,y,width,height].every(Number.isFinite)||width<=0||height<=0||!Number.isInteger(passes)||passes<2||passes>16)throw new RangeError('Invalid pencil gesture bounds');
  const step=height/passes,left=x-width*.12,right=x+width*1.12;
  let d='';
  for(let row=0;row<=passes;row++){
    const start=row%2?right:left,end=row%2?left:right,centre=y+step*row;
    d+=`${row?'L':'M'}${start} ${centre-step*.18}L${end} ${centre+step*.18}`;
  }
  return {d,strokeWidth:step*1.5};
}
