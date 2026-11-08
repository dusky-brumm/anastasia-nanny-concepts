import {applyTypography} from './typography.js?v=__VERSION__';
applyTypography(document);
try{
  if(parent!==window&&frameElement?.matches('iframe[data-reference-frame]')){
    document.documentElement.dataset.referenceEmbedded='true';
    parent.dispatchEvent(new CustomEvent('site:block-ready',{detail:{frame:frameElement}}));
  }
}catch{/* The standalone block needs no parent integration. */}
