// The final site always uses the approved Lora + Manrope pairing.
export const siteTypography=Object.freeze({heading:'Lora',body:'Manrope'});
export function applyTypography(doc){
  const root=doc.documentElement;
  root.dataset.fontPair='5';
  root.dataset.bodyFont='manrope';
  root.style.setProperty('--pair-heading','"Lora",serif');
  root.style.setProperty('--pair-body','"Manrope",sans-serif');
  root.style.setProperty('--pair-heading-weight','400');
  root.style.setProperty('--pair-scale','1');
  root.style.setProperty('--pair-tracking','-.025em');
  // CSS requests only the faces actually used in this block. Never hold layout
  // or navigation for an unused italic face or a photograph further down.
}
