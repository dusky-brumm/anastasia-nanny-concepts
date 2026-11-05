import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {blocks} from '../src/reference/studio/model.js';
const root='out';const html=await readFile(path.join(root,'reference.html'),'utf8');
for(const filename of (await readdir(root)).filter(name=>name.endsWith('.html'))){
  const content=await readFile(path.join(root,filename),'utf8');
  const matches=[...content.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const ids=new Set(matches);
  if(ids.size!==matches.length)throw Error('Duplicate IDs in '+filename);
  if(/__\w+__/.test(content))throw Error('Unrendered placeholder in '+filename);
  for(const match of content.matchAll(/(?:href|src)="([^"]+)"/g)){
    const url=match[1];if(/^(?:https?:|data:)/.test(url))continue;
    if(url.startsWith('#')){if(!ids.has(url.slice(1)))throw Error('Missing anchor '+url);continue;}
    await stat(path.join(root,url.split('?')[0]));
  }
}
if(!html.includes('Подберу няню')||!html.includes('Маршрут <span>подбора'))throw Error('Missing reference copy');
const index=await readFile(path.join(root,'index.html'),'utf8');
for(const id of ['header','hero','service','about','process','pricing','reviews','apply','footer'])if(!index.includes('data-block="'+id+'"'))throw Error('Missing home-page block '+id);
for(const file of ['styles.css','fonts.css','journeys.css','routes-gallery.css','studio/site.css','studio/ui.css','studio/pencil-preview.css','studio/comparison-design.css','studio/comparison-sections.css','studio/clear-sections.css','studio/unified-designs.css','studio/design-chrome.css','studio/reference-integration.css','studio/contour-design.css','studio/fonts.css']){const css=await readFile(path.join(root,file),'utf8');if((css.match(/\{/g)||[]).length!==(css.match(/\}/g)||[]).length)throw Error('Unbalanced CSS '+file);for(const match of css.matchAll(/url\(([^)]+)\)/g)){const url=match[1].replaceAll(/["']/g,'');if(!url.startsWith('data:')&&!url.startsWith('#'))await stat(path.join(root,path.dirname(file),url));}}
for(const file of ['app.js','request.js','journeys.js','studio/model.js','studio/render.js','studio/pages.js','studio/app.js','studio/request-endpoint.js','studio/comparison-palettes.js','studio/review-carousel.js','studio/contour-motion.js','studio/comparison-assembly.js','studio/request-ui.js','studio/comparison-request.js','studio/content.js','studio/seo.js']){
  const js=await readFile(path.join(root,file),'utf8');
  if(/__\w+__/.test(js))throw Error('Unrendered module placeholder: '+file);
  execFileSync(process.execPath,['--check',path.join(root,file)]);
  for(const match of js.matchAll(/from\s+['"]([^'"]+)['"]/g))await stat(path.join(root,path.dirname(file),match[1].split('?')[0]));
}
for(const {id,variants} of blocks){
  const page=await readFile(path.join(root,'blocks-'+id+'.html'),'utf8');
  if([...page.matchAll(/class="library-option"/g)].length!==variants.length)throw Error('Wrong variation count for '+id);
}
// Include imported local styles and scripts in the same syntax/asset checks.
async function checkImported(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()){await checkImported(file);continue;}
    if(!file.endsWith('.css'))continue;
    const css=await readFile(file,'utf8');
    if((css.match(/\{/g)||[]).length!==(css.match(/\}/g)||[]).length)throw Error('Unbalanced CSS '+file);
    for(const match of css.matchAll(/url\(([^)]+)\)/g)){
      const url=match[1].replaceAll(/["']/g,'');
      if(!url.startsWith('data:')&&!url.startsWith('#'))await stat(path.join(path.dirname(file),url));
    }
  }
}
await checkImported(path.join(root,'studio','variants'));
for(const file of ['additional-designs.js','additional-templates.js','unified-designs.js','design-chrome.js','reference-designs.js','reference-templates.js','reference-interactions.js','reference-frames.js'])execFileSync(process.execPath,['--check',path.join(root,'studio',file)]);
const files=await readdir(root);if(files.includes('collection.html')||files.includes('atelier'))throw Error('Old gallery in publication');
console.log('PASS: reference page, block designs, studio/share previews, local assets and fonts, unique IDs, anchors, CSS/JS syntax and imports.');
