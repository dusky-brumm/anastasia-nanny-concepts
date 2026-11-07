// Keep the actual section and its styling ancestors instead of recreating a design.
export function extractDesignBlock(html,id) {
  const body=html.match(/<body\b[^>]*>([\s\S]*)<\/body>/)?.[1]??html;
  const tokens=/<\/?([a-z][\w:-]*)\b(?:"[^"]*"|'[^']*'|[^'">])*>/gi;
  const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const stack=[];
  let target,ancestors;
  for(let token;(token=tokens.exec(body));){
    const tag=token[1].toLowerCase(),closing=token[0].startsWith('</');
    if(closing){
      const index=stack.findLastIndex(node=>node.tag===tag);
      if(index<0)continue;
      if(target&&stack[index]===target){
        return {markup:body.slice(target.start,tokens.lastIndex),ancestors};
      }
      stack.length=index;
    }else if(!voidTags.has(tag)&&!token[0].endsWith('/>')){
      const node={tag,open:token[0],start:token.index};
      if(new RegExp(`\\bid="${id}"`).test(token[0])&&['section','header','footer'].includes(tag)){
        target=node;
        ancestors=stack.map(item=>({tag:item.tag,open:item.open}));
      }
      stack.push(node);
    }
  }
  throw new Error(`Missing complete design block: ${id}`);
}

export const designBlockFile=(design,id)=>`compare-design-${design.mode}-${id}.html`;

export function designBlockPage(design,id,html) {
  const {markup,ancestors}=extractDesignBlock(html,id);
  const ids=new Set([...markup.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]));
  const file=design.single?design.file:design.file.replace('.html','-refined.html');
  const block=markup.replace(/href="#([^"]+)"/g,(attribute,target)=>ids.has(target)?attribute:
    `href="${file}?v=9d9045e945#${target}" target="_top" data-reference-target="${target}"`);
  const open=ancestors.map(node=>node.open.replace(/ data-site-root\b/,'')).join('');
  const close=ancestors.toReversed().map(node=>`</${node.tag}>`).join('');
  const dialog=html.match(/<dialog\b[\s\S]*?<\/dialog>/)?.[0]??'';
  return html.replace(/<body([^>]*)>[\s\S]*<\/body>/,
    `<body$1 data-isolated-block="${id}"><div data-reference-block-root>${open}${block}${close}</div>${dialog}</body>`)
    .replace(/<script defer src="studio\/(?:unified-designs|comparison-palettes)\.js[^\"]*"><\/script>/g,'')
    .replace(/<link rel="canonical"[^>]+>/,`<link rel="canonical" href="https://dusky-brumm.github.io/anastasia-nanny-concepts/${designBlockFile(design,id)}">`);
}

// IDs and cross-section destinations differ between a gallery and a full page.
// They do not make a second visual option. Explicit shared sections have one key.
export function blockIdentity(id,markup,style='quiet',family='native') {
  if(id==='header'&&family!=='illustrated')return 'shared-header';
  if(id==='pricing'&&!['reference','illustrated'].includes(family))return 'approved-three-conditions';
  if(id==='footer'&&!['reference','illustrated'].includes(family))return /contour-drawing/.test(markup)?'footer-plane':'footer-sketch';
  // The shared components have the same composition in several full designs.
  // Font inheritance alone is not another block; keep real layout and drawing changes.
  if(id!=='hero'&&family!=='reference'){
    if(['native','imported-shared','contour'].includes(family))family='shared';
    style=id==='reviews'&&['letter','album'].includes(style)?style:id==='apply'&&['air','route'].includes(style)?'stack':'';
  }
  const normalized=(id==='apply'?markup.replace(/s-apply--\d/g,'s-apply').replace(/ data-variant="\d+"/g,''):markup)
    .replace(/\s(?:id|aria-labelledby|aria-describedby|aria-controls|data-preview-id)="[^"]*"/g,'')
    .replace(/href="(?!https?:|mailto:|tel:)[^"]*"/g,'href="#section"')
    .replace(/url\(#[^)]+\)/g,'url(#drawing)')
    .replace(/\s+/g,' ').trim();
  return `${family}:${style}:${normalized}`;
}
