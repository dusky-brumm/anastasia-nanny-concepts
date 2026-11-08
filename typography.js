// The final site always uses the approved Lora + Manrope pairing.
export const siteTypography=Object.freeze({heading:'Lora',body:'Manrope'});
export async function applyTypography(doc){
  const root=doc.documentElement;
  root.dataset.fontPair='5';
  root.dataset.bodyFont='manrope';
  root.style.setProperty('--pair-heading','"Lora",serif');
  root.style.setProperty('--pair-body','"Manrope",sans-serif');
  root.style.setProperty('--pair-heading-weight','400');
  root.style.setProperty('--pair-scale','1');
  root.style.setProperty('--pair-tracking','-.025em');
  await Promise.all([
    doc.fonts.load('400 40px "Lora"','Няня — семья'),
    doc.fonts.load('italic 400 40px "Lora"','Спокойно'),
    doc.fonts.load('400 16px "Manrope"','Няня — семья'),
  ]);
  await doc.fonts.ready;
}
