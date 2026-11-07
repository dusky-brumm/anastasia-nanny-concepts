import {cp,mkdir,readFile,writeFile,readdir,rm,realpath,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {sitePage,artworkPage,assemblyRedirect} from '../src/site/pages.mjs';
import {defaultFontPair} from '../src/site/font-pairs.js';
import {formatRequest} from '../src/reference/request.js';
import {bindRequestUi} from '../src/reference/studio/request-ui.js';
import {sitemapXml,robotsTxt} from '../src/reference/studio/seo.js';

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
  html=html.replace('<html lang="ru"',`<html lang="ru" data-font-pair="${defaultFontPair.id}"`);
  const styles=['fonts.css','studio/fonts.css','site-typography.css','site-refinements.css','site-polish.css']
    .filter(file=>!html.includes(`href="../${file}`))
    .map(file=>`<link rel="stylesheet" href="../${file}?v=__VERSION__">`).join('');
  html=html.replace('</head>',styles+'<script type="module" src="../block-typography.js?v=__VERSION__"></script><script type="module" src="../drawing-motion.js?v=__VERSION__"></script></head>');
  await writeFile(target,html);
}
async function replaceTokens(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())await replaceTokens(file);
    else if(/\.(?:html|js|css)$/.test(file))await writeFile(file,(await readFile(file,'utf8')).replaceAll('__VERSION__',version));
  }
}
await writeFile(path.join(output,'index.html'),sitePage(selection));
await writeFile(path.join(output,'artwork.html'),artworkPage(catalog));
await writeFile(path.join(output,'compare-assembly.html'),assemblyRedirect);
await writeFile(path.join(output,'studio','comparison-request.js'),`(${bindRequestUi.toString()})(${formatRequest.toString()});\n`);
await writeFile(path.join(output,'sitemap.xml'),sitemapXml());
await writeFile(path.join(output,'robots.txt'),robotsTxt());
await replaceTokens(output);
// The ZIP contains original artwork bytes plus a manifest; no recompression/editing.
execFileSync('python',['-c',`import json,pathlib,zipfile
root=pathlib.Path('out')
items=json.loads((root/'artwork-catalog.json').read_text(encoding='utf-8'))
with zipfile.ZipFile(root/'artwork-library.zip','w',zipfile.ZIP_DEFLATED) as archive:
 for item in items: archive.write(root/item['file'],item['file'])
 archive.write(root/'artwork-catalog.json','artwork-catalog.json')
`],{stdio:'inherit'});
console.log(JSON.stringify({output:'out',version,blocks:selection.blocks.length,artworks:catalog.length}));
