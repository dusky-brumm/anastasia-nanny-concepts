import {applyFontPair,readFontChoice} from './font-pairs.js?v=80d1dd8e34';
// Standalone block previews use the same pair as the parent site.
let search=location.search;
try{if(parent!==window)search=parent.location.search;}catch{/* An external embed uses its own query. */}
let storage;
try{storage=localStorage;}catch{/* A blocked storage context uses the default. */}
applyFontPair(document,readFontChoice(search,storage));
