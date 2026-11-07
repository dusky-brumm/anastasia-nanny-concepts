// Audited against src/reference and the original four font sets in studio/model.js.
// Golos is an old local alias of Golos Text, not a second font family.
export const fontCatalog=[
  {id:'manrope',family:'Manrope',fallback:'sans-serif',weight:500,scale:.96,tracking:'-.03em'},
  {id:'golos',family:'Golos Text',fallback:'sans-serif',weight:500,scale:.97,tracking:'-.03em'},
  {id:'lora',family:'Lora',fallback:'serif',weight:400,scale:1,tracking:'-.025em'},
  {id:'prata',family:'Prata',fallback:'serif',weight:400,scale:.96,tracking:'-.02em'},
  {id:'tinos',family:'Tinos',fallback:'serif',weight:400,scale:1.04,tracking:'-.025em'},
  {id:'caveat',family:'Caveat',fallback:'cursive',weight:500,scale:1.15,tracking:'-.015em'},
  {id:'georgia',family:'Georgia',fallback:'serif',weight:400,scale:.98,tracking:'-.025em',system:true},
  {id:'arial',family:'Arial',fallback:'sans-serif',weight:400,scale:.98,tracking:'-.03em',system:true},
  {id:'segoe',family:'Segoe UI',fallback:'sans-serif',weight:400,scale:.98,tracking:'-.03em',system:true},
  {id:'times',family:'Times New Roman',fallback:'serif',weight:400,scale:1.04,tracking:'-.025em',system:true},
];
export const fontStorageKey='nastya-historical-font-pair-v1';
const quickChoices=[
  ['manrope','golos'],['lora','golos'],['prata','manrope'],['tinos','manrope'],
  ['lora','manrope'],['prata','golos'],['tinos','golos'],['golos','manrope'],
  ['manrope','lora'],['manrope','tinos'],['lora','tinos'],['tinos','lora'],
  ['caveat','golos'],['caveat','manrope'],['georgia','golos'],['georgia','manrope'],
  ['segoe','golos'],['arial','lora'],['times','manrope'],['manrope','caveat'],
];
const choices=[...quickChoices];
for(const heading of fontCatalog)for(const body of fontCatalog){
  if(!choices.some(([a,b])=>a===heading.id&&b===body.id))choices.push([heading.id,body.id]);
}
export const fontPairs=choices.map(([headingId,bodyId],index)=>{
  const heading=fontCatalog.find(font=>font.id===headingId),body=fontCatalog.find(font=>font.id===bodyId);
  return {id:String(index+1),headingId,bodyId,heading:heading.family,body:body.family,headingFallback:heading.fallback,bodyFallback:body.fallback,weight:heading.weight,scale:heading.scale,tracking:heading.tracking};
});
export const quickFontPairs=fontPairs.slice(0,quickChoices.length);
export const findFontPair=(headingId,bodyId)=>fontPairs.find(pair=>pair.headingId===headingId&&pair.bodyId===bodyId)??fontPairs[0];
export const resolveFontPair=id=>fontPairs.find(pair=>pair.id===id)??fontPairs[0];
export function readFontChoice(search,storage){
  const query=new URLSearchParams(search).get('fonts');
  if(query!==null)return resolveFontPair(query);
  try{return resolveFontPair(storage?.getItem(fontStorageKey));}catch{return fontPairs[0];}
}
export async function applyFontPair(doc,pair){
  const root=doc.documentElement;
  root.dataset.fontPair=pair.id;
  root.dataset.bodyFont=pair.bodyId;
  root.style.setProperty('--pair-heading',`"${pair.heading}",${pair.headingFallback}`);
  root.style.setProperty('--pair-body',`"${pair.body}",${pair.bodyFallback}`);
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
