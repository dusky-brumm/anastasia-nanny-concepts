import {surfaceVersion} from './surface-study-model.js';

// Preserve the selected review paper grain without rendering comparison controls.
const surfaceRoot=document.documentElement;
let surfaceMasks;
function chooseSurface(value){
 const version=surfaceVersion(value??'blue');
 if(!version){delete surfaceRoot.dataset.textureStudy;surfaceMasks?.remove();surfaceMasks=null;return;}
 surfaceRoot.dataset.textureStudy=version.id;
 if(!surfaceMasks){
  surfaceMasks=document.createElementNS('http://www.w3.org/2000/svg','svg');
  surfaceMasks.classList.add('surface-study-masks');
  surfaceMasks.setAttribute('aria-hidden','true');
  surfaceMasks.setAttribute('focusable','false');
  surfaceMasks.innerHTML='<defs><filter id="surface-study-grain-contrast" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncG data-study-contrast type="linear" slope="3" intercept="-2"/><feFuncB data-study-contrast type="linear" slope="3" intercept="-2"/></feComponentTransfer><feComponentTransfer><feFuncR data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncG data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncB data-study-softness type="linear" slope=".28" intercept=".72"/><feFuncA data-study-soft-alpha type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><mask id="surface-study-paper-grain" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1" style="mask-type:luminance"><image data-study-grain x="-.05" y="-.2" width="1.1" height="1.4" preserveAspectRatio="none" filter="url(#surface-study-grain-contrast)"/></mask></defs>';
  document.body.append(surfaceMasks);
 }
 // Reuse the generated strokes as white pigment, with visible paper gaps.
 const grain=surfaceMasks.querySelector('[data-study-grain]');
 if(version.id==='original')grain.removeAttribute('href');
 else grain.setAttribute('href',`media/surface-studies-20261110/form-${version.id}.webp`);
 const contrast=version.id==='green'?2:3;
 for(const channel of surfaceMasks.querySelectorAll('[data-study-contrast]')){
  channel.setAttribute('slope',String(contrast));channel.setAttribute('intercept',String(1-contrast));
 }
 // Keep at least72% white pigment in the softer version; only28% is hatch contrast.
 const softness=version.id==='blue'?.28:1;
 for(const channel of surfaceMasks.querySelectorAll('[data-study-softness]')){
  channel.setAttribute('slope',String(softness));channel.setAttribute('intercept',String(1-softness));
 }
 const alpha=surfaceMasks.querySelector('[data-study-soft-alpha]');
 alpha.setAttribute('slope',version.id==='blue'?'0':'1');
 alpha.setAttribute('intercept',version.id==='blue'?'1':'0');
}
const restoreSurface=()=>chooseSurface(new URLSearchParams(location.search).get('texture'));
addEventListener('popstate',restoreSurface);
restoreSurface();
