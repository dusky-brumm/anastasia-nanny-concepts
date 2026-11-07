export const aboutVariants=[
  {id:'1',name:'Открытый разворот',description:'Молочный фон, живое фото и заметный текст'},
  {id:'2',name:'Голубой этюд',description:'Текст слева и фактурная голубая область за фото'},
  {id:'3',name:'Личный альбом',description:'Четыре главы, карандашная рамка и история при прокрутке'},
];

export function readAboutVariant(search){
  const id=new URLSearchParams(search).get('about');
  return aboutVariants.find(variant=>variant.id===id)??aboutVariants[0];
}

export function storyIndex(progress,count){
  if(!Number.isFinite(progress)||count<1)return 0;
  return Math.max(0,Math.min(count-1,Math.floor(progress*count)));
}
