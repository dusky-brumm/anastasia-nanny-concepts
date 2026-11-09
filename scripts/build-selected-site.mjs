import {cp,mkdir,readFile,writeFile,readdir,rm,realpath,lstat,rmdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {formatRequest} from '../src/reference/request.js';
import {bindRequestUi} from '../src/reference/studio/request-ui.js';
import {sitemapXml,robotsTxt} from '../src/reference/studio/seo.js';
import {assembleSelectedPage} from './assemble-selected-page.mjs';

const repo=path.resolve('.'),output=path.resolve('out');
// Only this checkout's generated output may be removed. Refuse symlink targets.
if(output!==path.join(repo,'out')||path.dirname(output)!==repo)throw new Error('Unsafe output path');
try{
  if((await lstat(output)).isSymbolicLink()||await realpath(output)!==output)throw new Error('Refusing redirected output path');
}catch(error){if(error.code!=='ENOENT')throw error;}
const hash=createHash('sha256');
async function fingerprint(directory){
  for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())await fingerprint(file);else hash.update(file).update(await readFile(file));
  }
}
await fingerprint('src/reference');await fingerprint('src/site');
hash.update(await readFile(new URL(import.meta.url)));
hash.update(await readFile(new URL('./assemble-selected-page.mjs',import.meta.url)));
hash.update(await readFile('package-lock.json'));
const version=hash.digest('hex').slice(0,10);
const selection=JSON.parse(await readFile('src/site/selection.json','utf8'));
const catalog=JSON.parse(await readFile('src/site/artwork-catalog.json','utf8'));
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
// Shared styles/scripts/fonts/photos only. Retired HTML pages are source archives.
await cp('src/reference',output,{recursive:true,filter:file=>!file.endsWith('.html')});
const newerTypefaces=path.resolve('src/site/typefaces');
await cp('src/site',output,{recursive:true,filter:file=>!file.endsWith('.mjs')&&!path.resolve(file).startsWith(newerTypefaces)});
// One final type/material layer applies to all independently editable blocks.
for(const {file} of selection.blocks){
  const target=path.join(output,file);
  let html=await readFile(target,'utf8');
  // Inline only explicitly marked local decorative SVGs so their strokes can draw.
  let inlineDrawing=0;
  for(const [tag] of html.matchAll(/<img\b[^>]*\bdata-ink-source\b[^>]*>/g)){
    const src=tag.match(/\bsrc="([^"]+)"/)?.[1],classes=tag.match(/\bclass="([^"]+)"/)?.[1]??'';
    const svgFile=path.resolve(path.dirname(target),src??'');
    if(!src||!svgFile.startsWith(output+path.sep)||!svgFile.endsWith('.svg'))throw new Error('Invalid drawing source');
    const mode=tag.includes('data-ink-mode="focus"')?'data-ink-focus':'data-ink-line="enter"';
    const prefix=`inline-${++inlineDrawing}-`;
    const svg=(await readFile(svgFile,'utf8'))
      .replace(/\bid="([^"]+)"/g,(_,id)=>`id="${prefix}${id}"`)
      .replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}${id})`)
      .replace('<svg ',`<svg class="${classes}" ${mode} aria-hidden="true" focusable="false" `);
    html=html.replace(tag,svg);
  }
  html=html.replace('<html lang="ru"','<html lang="ru" data-font-pair="5" data-body-font="manrope"');
  const styles=['fonts.css','site-typography.css','site-refinements.css','site-polish.css','site-responsive.css','site-layout.css']
    .filter(file=>!html.includes(`href="../${file}`))
    .map(file=>`<link rel="stylesheet" href="../${file}?v=__VERSION__">`).join('');
  html=html.replace('</head>',styles+'<script type="module" src="../block-typography.js?v=__VERSION__"></script><script type="module" src="../drawing-motion.js?v=__VERSION__"></script></head>');
  // A classic script after styles and markup can signal layout before images
  // or the decorative module graph finish. Standalone previews stay unchanged.
  html=html.replace('</body>','<script>document.documentElement.dataset.blockLayoutReady="true";try{if(parent!==window)parent.dispatchEvent(new CustomEvent("site:block-ready",{detail:{frame:frameElement}}));}catch{}</script></body>');
  await writeFile(target,html);
}
async function replaceTokens(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())await replaceTokens(file);
    else if(/\.(?:html|js|css)$/.test(file)){
      let text=(await readFile(file,'utf8')).replaceAll('__VERSION__',version);
      if(file.endsWith('.css')){
        const relative=asset=>path.relative(path.dirname(file),path.join(output,asset)).split(path.sep).join('/');
        text=text.replace(/url\(['"]?[^)'"\s]*\/dot\.webp['"]?\)/g,`url('${relative('media/chalk-dot.webp')}')`)
          .replace(/url\(['"]?[^)'"\s]*\/arrow-right\.webp['"]?\)/g,`url('${relative('artwork/vectors/navigation-arrow-chalk.svg')}')`)
          .replace(/background\s*:[^;{}]*quote-highlight\.webp[^;{}]*(;|(?=}))/g,'background:none;');
      }
      await writeFile(file,text);
    }
  }
}
await writeFile(path.join(output,'studio','comparison-request.js'),`(${bindRequestUi.toString()})(${formatRequest.toString()});\n`);
await writeFile(path.join(output,'sitemap.xml'),sitemapXml());
await writeFile(path.join(output,'robots.txt'),robotsTxt());
// Keep the approved pair; type specimens are no longer part of this site.
for(const fontCss of ['fonts.css','studio/fonts.css']){
  const file=path.join(output,fontCss),text=await readFile(file,'utf8');
  const faces=[...text.matchAll(/@font-face\s*\{[^}]+\}/g)].map(match=>match[0]);
  await writeFile(file,faces.filter(face=>/font-family:\s*['"]?(?:Lora|Manrope)\b/.test(face)).join('\n')+'\n');
}
await replaceTokens(output);
await assembleSelectedPage(output,selection,version);
const runtimeFiles=['block-ui.js','about-story.js','review-carousel.js','drawing-motion.js','single-page.js','pricing-studies.js'];
const runtime=[];
for(const file of runtimeFiles){
  const source=(await readFile('src/site/'+file,'utf8')).replace(/^import\s+[^\n]+;\r?\n/gm,'').replace(/^export\s+(?=(?:const|function|async\s+function)\b)/gm,'');
  runtime.push(`(()=>{${file==='drawing-motion.js'?(await readFile('src/site/drawing-model.js','utf8')).replace(/^export\s+/gm,''):'\n'}\n${source}\n})();`);
}
runtime.push(`(${bindRequestUi.toString()})(${formatRequest.toString()},false);`);
await writeFile(path.join(output,'site-runtime.js'),runtime.join('\n'));
// Publish only dependencies of the nine selected blocks, never archived galleries.
const retained=new Set();
async function retain(file){
  file=path.resolve(file);
  if(!file.startsWith(output+path.sep))throw new Error('Asset escapes output: '+file);
  if(retained.has(file))return;
  const info=await lstat(file);
  if(!info.isFile()||info.isSymbolicLink())throw new Error('Invalid published asset: '+file);
  retained.add(file);
  if(!/\.(?:html|css|js)$/.test(file))return;
  const text=await readFile(file,'utf8'),urls=[];
  if(file.endsWith('.html')){
    urls.push(...[...text.matchAll(/\b(?:src|href)="([^"\s]+)"/g)].map(match=>match[1]));
    for(const [,value] of text.matchAll(/\b(?:srcset|imagesrcset)="([^"]+)"/g)){
      if(value.startsWith('data:'))continue;
      urls.push(...value.split(',').map(item=>item.trim().split(/\s+/)[0]).filter(Boolean));
    }
  }
  if(file.endsWith('.css')){
    urls.push(...[...text.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)].map(match=>match[1]));
    urls.push(...[...text.matchAll(/@import\s+['"]([^'"]+)['"]/g)].map(match=>match[1]));
  }
  if(file.endsWith('.js'))urls.push(...[...text.matchAll(/\b(?:import|export)\s+(?:[^'";]+?\s+from\s*)?['"]([^'"]+)['"]/g)].map(match=>match[1]));
  for(const url of urls){
    if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#|%23)/i.test(url))continue;
    const local=url.split(/[?#]/)[0];
    if(!local||local.endsWith('/'))continue;
    await retain(path.resolve(path.dirname(file),local));
  }
}
for(const seed of ['index.html','sitemap.xml','robots.txt','assets/social-card.png','studio/fonts/Lora-OFL.txt','fonts/manrope-OFL.txt','fonts/caveat-OFL.txt'])await retain(path.join(output,seed));
let removed=0;
async function prune(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(!file.startsWith(output+path.sep))throw new Error('Unsafe prune path');
    if(entry.isDirectory()){
      await prune(file);
      if(!(await readdir(file)).length)await rmdir(file);
    }else if(!retained.has(file)){await rm(file);removed++;}
  }
}
await prune(output);
console.log(JSON.stringify({output:'out',version,blocks:selection.blocks.length,assets:retained.size,removed,artworks:catalog.filter(item=>retained.has(path.join(output,item.file))).length}));
