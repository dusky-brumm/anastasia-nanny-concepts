export const aboutVariants=[
  {id:'1',name:'Фотоальбом',description:'Бумажные подложки и меловые этюды'},
  {id:'2',name:'Личное письмо',description:'Светлая карточка, арка и веточка мелком'},
  {id:'3',name:'Линия истории',description:'История меняется по мере прокрутки'},
];

export function readAboutVariant(search){
  const id=new URLSearchParams(search).get('about');
  return aboutVariants.find(variant=>variant.id===id)??aboutVariants[0];
}

export function storyIndex(progress,count){
  if(!Number.isFinite(progress)||count<1)return 0;
  return Math.max(0,Math.min(count-1,Math.floor(progress*count)));
}
