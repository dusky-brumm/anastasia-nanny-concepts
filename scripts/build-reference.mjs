import {cp,mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {renderJourney,renderJourneyOptions} from '../src/reference/journeys.js';
import {studioPage} from '../src/reference/studio/pages.js';
import {blocks} from '../src/reference/studio/model.js';
import {utilityIndexingTags,sitemapXml,robotsTxt,seoConfig} from '../src/reference/studio/seo.js';
const source='src/reference',output='out';
const hash=createHash('sha256');
async function fingerprint(directory){for(const name of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(directory,name.name);if(name.isDirectory())await fingerprint(file);else hash.update(file).update(await readFile(file));}}
await fingerprint(source);const version=hash.digest('hex').slice(0,10);
await mkdir(output,{recursive:true});await cp(source,output,{recursive:true});
for(const file of ['index.html','routes.html']){
  const html=(await readFile(path.join(source,file),'utf8')).replace('__JOURNEY__',renderJourney('1')).replace('__JOURNEY_OPTIONS__',renderJourneyOptions()).replaceAll('__VERSION__',version);
  const target=file==='index.html'?'reference.html':'reference-routes.html';
  await writeFile(path.join(output,target),html.replace('</head>',utilityIndexingTags(target)+'</head>'));
}
for(const file of ['app.js','journeys.js'])await writeFile(path.join(output,file),(await readFile(path.join(source,file),'utf8')).replaceAll('__VERSION__',version));
for(const file of ['model.js','render.js','pages.js','app.js','content.js','seo.js'])await writeFile(path.join(output,'studio',file),(await readFile(path.join(source,'studio',file),'utf8')).replaceAll('__VERSION__',version));
for(const [file,mode,id] of [['index.html','preview','hero'],['studio.html','studio','hero'],['preview.html','preview','hero'],['routes.html','library','process'],['blocks.html','library','hero'],...blocks.map(b=>['blocks-'+b.id+'.html','library',b.id])])await writeFile(path.join(output,file),studioPage(mode,id,file).replaceAll('__VERSION__',version));
await writeFile(path.join(output,'next.html'),`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./"><title>Настя — подбор нянь</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${seoConfig.url}"></head><body><a href="./">Открыть сайт</a></body></html>`);
await writeFile(path.join(output,'sitemap.xml'),sitemapXml());
await writeFile(path.join(output,'robots.txt'),robotsTxt());
console.log(JSON.stringify({output,version}));
