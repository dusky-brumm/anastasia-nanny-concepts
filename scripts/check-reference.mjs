import {readFile,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root='out';const html=await readFile(path.join(root,'index.html'),'utf8');
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
for(const file of ['styles.css','fonts.css','journeys.css','routes-gallery.css','studio/site.css','studio/ui.css','studio/fonts.css']){const css=await readFile(path.join(root,file),'utf8');if((css.match(/\{/g)||[]).length!==(css.match(/\}/g)||[]).length)throw Error('Unbalanced CSS '+file);for(const match of css.matchAll(/url\(([^)]+)\)/g)){const url=match[1].replaceAll(/["']/g,'');if(!url.startsWith('data:'))await stat(path.join(root,path.dirname(file),url));}}
for(const file of ['app.js','journeys.js','studio/model.js','studio/render.js','studio/pages.js','studio/app.js']){
  const js=await readFile(path.join(root,file),'utf8');
  if(/__\w+__/.test(js))throw Error('Unrendered module placeholder: '+file);
  execFileSync(process.execPath,['--check',path.join(root,file)]);
  for(const match of js.matchAll(/from\s+['"]([^'"]+)['"]/g))await stat(path.join(root,path.dirname(file),match[1].split('?')[0]));
}
for(const id of ['header','hero','service','about','process','pricing','reviews','apply','footer']){
  const page=await readFile(path.join(root,'blocks-'+id+'.html'),'utf8');
  if([...page.matchAll(/class="library-option"/g)].length!==5)throw Error('Expected five variations of '+id);
}
const files=await readdir(root);if(files.includes('collection.html')||files.includes('atelier'))throw Error('Old gallery in publication');
console.log('PASS: reference page, 45 block designs, studio/share previews, local assets and fonts, unique IDs, anchors, CSS/JS syntax and imports.');
