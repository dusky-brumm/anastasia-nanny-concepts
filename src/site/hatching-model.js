// Shared timing and pencil passes use normalized 1000 × 1000 coordinates.
export const drawingTreatments=[
  {id:'1',name:'Длинные штрихи'},
  {id:'2',name:'Короткие штрихи'},
  {id:'3',name:'Перекрёстная штриховка'},
];
export const drawingTiming={contour:.25,background:.43,details:.32};
export function pencilDuration(kind){return ({profile:3040,book:3180,interview:3320}[kind]??3180)/3;}
export const servicePictureDelay=index=>500+Math.max(0,index)*500;
export const nextServiceDelay=(now,lastStart=-Infinity)=>Math.max(500,lastStart+500-now);
const point=(x,y)=>`${Math.round(x)} ${Math.round(y)}`;

function rows(spacing,short=false){
  let d='';
  for(let row=0,y=-250;y<=1250;row++,y+=spacing){
    const reverse=row%2!==0;
    if(short){
      for(let column=0;column<7;column++){
        const x=reverse?1250-column*225:-250+column*225,end=x+(reverse?-252:252);
        const lift=column%2?7:-7;
        d+=`M${point(x,y+lift)}L${point(end,y-lift)}`;
      }
    }else{
      const x=reverse?1250:-250,end=reverse?-250:1250;
      d+=`${row?'L':'M'}${point(x,y-7)}L${point(end,y+7)}`;
    }
  }
  return d;
}

export function pencilPasses(treatment='1',details=false){
  if(treatment==='2')return [
    {d:rows(details?42:62,true),width:details?29:38,angle:18,start:0,end:.76},
    {d:rows(details?42:62,true),width:details?61:88,angle:18,start:.56,end:1},
  ];
  if(treatment==='3')return [
    {d:rows(92),width:68,angle:-27,start:0,end:.58},
    {d:rows(70),width:97,angle:27,start:.46,end:1},
  ];
  return [
    {d:rows(details?45:70),width:details?29:46,angle:-25,start:0,end:.76},
    {d:rows(details?45:70),width:details?64:97,angle:-25,start:.56,end:1},
  ];
}
