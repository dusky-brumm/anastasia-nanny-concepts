// One pair applies to all nine blocks; IDs are stable, shareable choices.
export const fontPairs=[
  {id:'1',heading:'Cormorant Garamond',body:'Golos Text',weight:500,scale:1.12,tracking:'-.02em'},
  {id:'2',heading:'Prata',body:'Manrope',weight:400,scale:.96,tracking:'-.025em'},
  {id:'3',heading:'Lora',body:'Onest',weight:400,scale:1,tracking:'-.025em'},
  {id:'4',heading:'Literata',body:'Golos Text',weight:400,scale:.98,tracking:'-.03em'},
  {id:'5',heading:'Playfair Display',body:'Manrope',weight:400,scale:1.02,tracking:'-.025em'},
  {id:'6',heading:'Cormorant Infant',body:'Onest',weight:500,scale:1.1,tracking:'-.015em'},
  {id:'7',heading:'Forum',body:'Golos Text',weight:400,scale:1.07,tracking:'-.015em'},
  {id:'8',heading:'PT Serif',body:'Manrope',weight:400,scale:.99,tracking:'-.025em'},
  {id:'9',heading:'Spectral',body:'Onest',weight:400,scale:1,tracking:'-.03em'},
  {id:'10',heading:'Manrope',body:'Golos Text',weight:500,scale:.96,tracking:'-.04em'},
];
export const resolveFontPair=id=>fontPairs.find(pair=>pair.id===id)??fontPairs[0];
export function readFontChoice(search,storage){
  const query=new URLSearchParams(search).get('fonts');
  if(query!==null)return resolveFontPair(query);
  try{return resolveFontPair(storage?.getItem('nastya-font-pair-v1'));}catch{return fontPairs[0];}
}
export async function applyFontPair(doc,pair){
  const root=doc.documentElement;
  root.dataset.fontPair=pair.id;
  root.style.setProperty('--pair-heading',`"${pair.heading}",${pair.id==='10'?'sans-serif':'serif'}`);
  root.style.setProperty('--pair-body',`"${pair.body}",sans-serif`);
  root.style.setProperty('--pair-heading-weight',String(pair.weight));
  root.style.setProperty('--pair-scale',String(pair.scale));
  root.style.setProperty('--pair-tracking',pair.tracking);
  await Promise.all([
    doc.fonts.load(`${pair.weight} 40px "${pair.heading}"`,'Няня — семья'),
    doc.fonts.load(`italic 400 40px "${pair.heading}"`,'Спокойно'),
    doc.fonts.load(`400 16px "${pair.body}"`,'Няня — семья'),
  ]);
  await doc.fonts.ready;
}
