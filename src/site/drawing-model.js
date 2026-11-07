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
