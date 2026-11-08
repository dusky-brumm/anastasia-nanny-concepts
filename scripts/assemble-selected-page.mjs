import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import {sitePage} from '../src/site/pages.mjs';

const shared=['fonts.css','site-typography.css','site-refinements.css','site-polish.css','site-responsive.css','site-layout.css'];
const external=url=>/^(?:[a-z][a-z\d+.-]*:|\/\/|#|%23)/i.test(url);
export function scopeSelector(source,hosts){
  const scope=`:where(${hosts.map(id=>'.'+id).join(',')})`;
  return selectorParser(root=>{
    root.each(selector=>{
      const first=selector.first;
      const startsAtRoot=first?.type==='tag'&&first.value==='html'||first?.type==='pseudo'&&first.value===':root';
      selector.walkTags(tag=>{
        if(!['html','body','main'].includes(tag.value))return;
        const attribute=tag.value==='html'?'data-block-document':tag.value==='body'?'data-block-body':'data-block-main';
        tag.value='div';
        const guard=selectorParser.pseudo({value:':where'});
        guard.append(selectorParser.selector({nodes:[selectorParser.attribute({attribute})]}));
        tag.parent.insertAfter(tag,guard);
      });
      selector.walkPseudos(pseudo=>{if(pseudo.value===':root')pseudo.replaceWith(selectorParser.attribute({attribute:'data-block-document'}));});
      const guard=selectorParser().astSync(scope).first.first.clone();
      if(startsAtRoot)selector.insertAfter(selector.first,guard);
      else{selector.prepend(selectorParser.combinator({value:' '}));selector.prepend(guard);}
    });
  }).processSync(source,{lossless:false});
}
function serialize(node){
  if(node.type==='comment')return '';
  if(node.type==='decl')return `${node.prop}:${node.value}${node.important?'!important':''};`;
  if(node.type==='rule')return `${node.selector}{${node.nodes.map(serialize).join('')}}`;
  if(node.type==='atrule')return `@${node.name}${node.params?' '+node.params:''}${node.nodes?'{'+node.nodes.map(serialize).join('')+'}':';'}`;
  return node.nodes.map(serialize).join('');
}
export async function assembleSelectedPage(output,selection,version){
  const styles=new Map(),blocks=[];
  const hostClasses=new Map(selection.blocks.map(({id},index)=>[id,`sd${index}`]));
  function localUrl(base,url){
    if(external(url))return url;
    if(/^\.\.\/#/.test(url))return url.slice(3);
    const [file,suffix='']=url.split(/(?=[?#])/s);
    const resolved=path.resolve(path.dirname(base),file);
    if(resolved!==output&&!resolved.startsWith(output+path.sep))throw new Error('Asset escapes output: '+url);
    return path.relative(output,resolved).split(path.sep).join('/')+suffix;
  }
  for(const {id,file} of selection.blocks){
    const source=path.join(output,file),html=await readFile(source,'utf8');
    for(const [,url] of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)){
      const css=path.resolve(path.dirname(source),url.split('?')[0]);
      if(!styles.has(css))styles.set(css,new Set());styles.get(css).add(id);
    }
    const body=html.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/);
    if(!body)throw new Error('Missing block body: '+id);
    let content=body[2].replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<dialog\b[\s\S]*?<\/dialog>/g,'')
      .replace(/<main\b/g,'<div data-block-main').replace(/<\/main>/g,'</div>');
    content=content.replace(/\b(src|href)="([^"]+)"/g,(_,attribute,url)=>`${attribute}="${localUrl(source,url)}"`)
      .replace(/\bsrcset="([^"]+)"/g,(_,value)=>`srcset="${value.split(',').map(item=>{const [url,...descriptor]=item.trim().split(/\s+/);return [localUrl(source,url),...descriptor].join(' ');}).join(', ')}"`);
    content=content.replace(/<svg\b[\s\S]*?<\/svg>/g,svg=>{
      const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
      for(const name of ids)svg=svg.replaceAll(`id="${name}"`,`id="${id}-${name}"`).replaceAll(`url(#${name})`,`url(#${id}-${name})`).replaceAll(`href="#${name}"`,`href="#${id}-${name}"`);
      return svg;
    });
    blocks.push(`<div id="document-${id}" class="${hostClasses.get(id)}" data-block-document="${id}" data-selected-block="${id}" data-font-pair="5" data-body-font="manrope"><div data-block-body${body[1]}>${content}</div></div>`);
  }
  const ordered=[...styles.keys()].filter(file=>!shared.includes(path.relative(output,file).split(path.sep).join('/')));
  ordered.push(...shared.map(file=>path.join(output,file)).filter(file=>styles.has(file)));
  const fonts=new Set(),keyframes=new Set(),rules=[];
  for(const file of ordered){
    const tree=postcss.parse(await readFile(file,'utf8'),{from:file});
    tree.walkComments(comment=>comment.remove());
    const fontData=new Map();
    for(const font of tree.nodes.filter(node=>node.type==='atrule'&&node.name==='font-face')){
      for(const decl of font.nodes.filter(node=>node.type==='decl'&&node.prop==='src')){
        const url=decl.value.match(/url\(['"]?([^)'"\s]+)['"]?\)/)?.[1];
        if(url&&!external(url)){
          const fontFile=path.resolve(path.dirname(file),url.split('?')[0]);
          if(!fontFile.startsWith(output+path.sep)||!fontFile.endsWith('.woff2'))throw new Error('Invalid font source');
          fontData.set(url,`data:font/woff2;base64,${(await readFile(fontFile)).toString('base64')}`);
        }
      }
      const display=font.nodes.find(node=>node.type==='decl'&&node.prop==='font-display');
      if(display)display.value='block';
    }
    tree.walkDecls(decl=>{
      // The former documents measured the component width, excluding page scrollbars.
      if(!decl.value.includes('url('))decl.value=decl.value.replace(/(-?(?:\d*\.)?\d+)vw\b/g,'$1cqw');
      for(const [url,data] of fontData)if(decl.prop==='src')decl.value=decl.value.replace(url,data);
      decl.value=decl.value.replace(/url\((['"]?)([^)'"\s]+)\1\)/g,(_,quote,url)=>`url('${localUrl(file,url)}')`);
    });
    tree.walkAtRules(rule=>{
      if(rule.name==='font-face'){fonts.add(serialize(rule));rule.remove();}
      else if(/keyframes$/.test(rule.name)){keyframes.add(serialize(rule));rule.remove();}
      else if(rule.name==='charset')rule.remove();
      else if(rule.name==='import')throw new Error('Unexpected stylesheet import: '+file);
      else if(rule.name==='media'&&/\(\s*(?:min|max)-width\s*:/.test(rule.params)){
        const rest=rule.params.replace(/\(\s*(?:min|max)-width\s*:[^)]+\)/g,'').replace(/\b(?:and|or|not|only|screen)\b/g,'').replace(/[\s,()]/g,'');
        if(!rest){rule.name='container';rule.params=rule.params.replace(/\b(?:only\s+)?screen\s+and\s*/g,'');}
      }
    });
    tree.walkRules(rule=>{rule.selector=scopeSelector(rule.selector,[...styles.get(file)].map(id=>hostClasses.get(id)));});
    rules.push(serialize(tree));
  }
  await writeFile(path.join(output,'site-sections.css'),[...fonts,...keyframes,...rules].join('\n'));
  await writeFile(path.join(output,'index.html'),sitePage(selection,blocks).replaceAll('__VERSION__',version));
}
