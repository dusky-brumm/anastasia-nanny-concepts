// One-time migration. Future edits belong in src/site/blocks, not in this script.
import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {comparisonChoiceDetails} from '../src/reference/studio/pages.js';
import {illustratedAssets} from '../src/reference/studio/illustrated-assets.js';

const root=path.resolve('src/site');
const selection={header:'quiet',hero:'fotoalbum',service:'chalk-light',about:'quiet',process:'early-classic-arrows',pricing:'early-classic',reviews:'early-classic',apply:'early-classic',footer:'chalk-letter'};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await mkdir(path.join(root,'blocks'),{recursive:true});
const provenance={date:'2026-11-07',sourceCommit:'f73c83dccf0235d499635b3433c32774e477f623',url:'https://nastya-nanny-concepts-oct23.dusky-brumm.chatgpt.site/compare-assembly?v=08b62ba700&'+new URLSearchParams(selection),blocks:[]};
for(const [id,choice] of Object.entries(selection)){
  const file=comparisonChoiceDetails[id][choice].file;
  const original=await readFile(path.join('out',file),'utf8');
  let html=original.replaceAll('08b62ba700','__VERSION__');
  // Relative assets must resolve from blocks/. Fragment references stay local to SVGs.
  html=html.replace(/\b(href|src)="([^"\s]+)"/g,(attribute,key,url)=>{
    if(/^(?:[a-z]+:|\/\/|#)/i.test(url))return attribute;
    const target=url.match(/\.html(?:\?[^#]*)?#([\w-]+)$/)?.[1];
    return `${key}="${target?'../#'+target:'../'+url}"`;
  });
  html=html.replace(/url\((['"]?)(?![a-z]+:|#|\/)([^)'"\s]+)\1\)/gi,'url($1../$2$1)');
  html=html.replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="https://dusky-brumm.github.io/anastasia-nanny-concepts/">');
  await writeFile(path.join(root,'blocks',id+'.html'),html);
  provenance.blocks.push({id,choice,sourceFile:file,sourceSha256:hash(original),file:'blocks/'+id+'.html'});
}
await writeFile(path.join(root,'selection.json'),JSON.stringify(provenance,null,2)+'\n');

// Keep the original bytes of every raster illustration, texture and SVG asset.
const artRoot=path.join(root,'artwork');
await mkdir(path.join(artRoot,'vectors'),{recursive:true});
const catalog=[];
async function add(source,destination,title,group,extra={}){
  await mkdir(path.dirname(path.join(artRoot,destination)),{recursive:true});
  const bytes=await readFile(source);
  await copyFile(source,path.join(artRoot,destination));
  catalog.push({id:destination.replace(/\W+/g,'-'),file:'artwork/'+destination,title,group,sha256:hash(bytes),...extra});
}
for(const asset of illustratedAssets)await add(`src/reference/studio/media/chalk-kit/${asset.id}.webp`,`illustrations/${asset.id}.webp`,asset.title,'Иллюстрации',{block:asset.block,box:asset.box,width:asset.width,height:asset.height});
const labels={
  '02hero':'Главный блок','03service':'Об услуге','04about':'Знакомство с Анастасией','05process':'Этапы подбора','06pricing':'Стоимость и гарантия','07reviews':'Отзывы','08apply':'Заявка','09footer':'Контакты',
  'arrow-right':'Стрелка переключения','dot':'Точка слайдера','quote-highlight':'Белый штрих под цитатой',
  'paper':'Фактура бумаги','soft':'Мягкий фон','wash':'Меловая заливка',
  'pencil-button':'Контур кнопки','pencil-frame':'Рисованная рамка','pencil-frame-neat':'Аккуратная рисованная рамка','pencil-rule':'Линия мелком',
};
for(const [directory,group] of [['line-drawings','Рисунки для блоков'],['classic-chalk-ui','Элементы интерфейса'],['chalk-almost-white','Фоны и фактуры']]){
  for(const name of (await readdir(`src/reference/studio/media/${directory}`)).sort()){
    const key=name.replace(/\.[^.]+$/,'');
    await add(`src/reference/studio/media/${directory}/${name}`,`${directory}/${name}`,labels[key]??key,group);
  }
}
for(const name of ['pencil-button','pencil-frame','pencil-frame-neat','pencil-rule'])await add(`src/reference/studio/${name}.svg`,`lines/${name}.svg`,labels[name],'Линии и рамки');
await add('src/reference/assets/route-heart.webp','illustrations/route-heart.webp','Сердце на линии маршрута','Рисунки для блоков');

// Extract the actual native SVG drawings too, including arrows and photo contours.
// Old complete designs remain source-only; no alternative website pages are published.
const seen=new Set();
let vectorIndex=0;
for(const name of (await readdir('out')).filter(name=>name.endsWith('.html')).sort()){
  const html=await readFile(path.join('out',name),'utf8');
  const defs=[...html.matchAll(/<defs\b[^>]*>[\s\S]*?<\/defs>/gi)].map(match=>match[0]);
  const tokens=/<\/?svg\b[^>]*>/gi;
  let depth=0,start=0;
  for(let match;(match=tokens.exec(html));){
    if(match[0].startsWith('</')){
      if(--depth!==0)continue;
      let svg=html.slice(start,tokens.lastIndex).replace(/<image\b[^>]*\/?>(?:<\/image>)?/gi,'');
      if(!/<(?:path|line|polyline|polygon|circle|ellipse|rect|use)\b/i.test(svg))continue;
      if(!/viewBox=/i.test(svg))continue;
      // Ignore style classes and generated IDs when finding duplicate shapes.
      const identity=svg.replace(/\s(?:class|id|aria-[\w-]+|focusable|data-[\w-]+)="[^"]*"/g,'').replace(/url\(#[^)]+\)/g,'url(#drawing)').replace(/href="#[^"]+"/g,'href="#drawing"').replace(/\s+/g,' ').trim();
      if(seen.has(identity))continue;
      seen.add(identity);
      const refs=[...svg.matchAll(/(?:url\(#|href="#)([\w-]+)/g)].map(match=>match[1]);
      const extraDefs=defs.filter(def=>refs.some(id=>!svg.includes(`id="${id}"`)&&def.includes(`id="${id}"`))).join('');
      svg=svg.replace(/<svg\b([^>]*)>/,(_,attributes)=>`<svg xmlns="http://www.w3.org/2000/svg"${attributes.replace(/ xmlns="[^"]*"/g,'')} style="color:#718591;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${extraDefs}`);
      vectorIndex++;
      const file=`vectors/drawing-${String(vectorIndex).padStart(3,'0')}.svg`;
      await writeFile(path.join(artRoot,file),svg+'\n');
      catalog.push({id:`vector-${vectorIndex}`,file:'artwork/'+file,title:`Рисованный элемент ${String(vectorIndex).padStart(3,'0')}`,group:'Линии, стрелки и значки',source:name,sha256:hash(svg+'\n')});
    }else{
      if(depth++===0)start=match.index;
      if(match[0].endsWith('/>'))depth--;
    }
  }
}
await writeFile(path.join(root,'artwork-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({blocks:provenance.blocks.length,artworks:catalog.length,vectors:vectorIndex}));
