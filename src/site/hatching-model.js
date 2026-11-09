// Shared timing and pencil passes use normalized 1000 × 1000 coordinates.
export const drawingTiming={contour:.25,background:.43,details:.32};
export function pencilDuration(kind){
  const serviceDuration={profile:3040,book:3180,interview:3320}[kind];
  const duration=(serviceDuration??3180)/3;
  return serviceDuration?duration*.65:duration;
}
export const servicePictureDelay=index=>Math.max(0,index)*20;
export const nextServiceDelay=(now,lastStart=-Infinity)=>Math.max(0,lastStart+20-now);
const point=(x,y)=>`${Math.round(x)} ${Math.round(y)}`;

function rows(spacing){
  let d='';
  for(let row=0,y=-250;y<=1250;row++,y+=spacing){
    const reverse=row%2!==0;
    const x=reverse?1250:-250,end=reverse?-250:1250;
    d+=`${row?'L':'M'}${point(x,y-7)}L${point(end,y+7)}`;
  }
  return d;
}

export function pencilPasses(details=false){
  return [
    {d:rows(details?45:70),width:details?29:46,angle:-25,start:0,end:.76},
    {d:rows(details?45:70),width:details?64:97,angle:-25,start:.56,end:1},
  ];
}
