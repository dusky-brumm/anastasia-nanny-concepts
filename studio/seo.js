import {contacts} from './content.js?v=f566d749e6';

// The public service page is canonical. Design tools and the private Sites copy
// must not create competing search results. Change this URL when the domain changes.
export const seoConfig = Object.freeze({
  url:'https://dusky-brumm.github.io/anastasia-nanny-concepts/',
  title:'Подбор няни для семьи — Анастасия Доронина',
  name:'Анастасия Доронина — подбор няни',
  description:'Личный подбор няни: интервью под задачи семьи, подробные профили кандидатов и сопровождение. Неограниченное число анкет, гарантия замены — 6 месяцев.',
  areaServed:null,
});

export const publicUrl=(file='',base=seoConfig.url)=>new URL(file,base).href;
const escapeHtml=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export function metadataFor(file='index.html',overrides={}) {
  const main=file==='index.html';
  return {
    main,
    title:main?seoConfig.title:(overrides.title??'Макет сайта — подбор няни'),
    description:main?seoConfig.description:(overrides.description??'Варианты оформления сайта Анастасии Дорониной.'),
    canonical:publicUrl(main?'':file),
    robots:main?'index, follow, max-image-preview:large':'noindex, follow',
    image:publicUrl('assets/social-card.png?v=f566d749e6'),
  };
}

export function serviceGraph() {
  const person=publicUrl('#anastasia'),service=publicUrl('#nanny-selection'),website=publicUrl('#website');
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Person','@id':person,name:contacts.name,jobTitle:'Специалист по подбору нянь',url:publicUrl('#about'),image:publicUrl('studio/media/cafe.webp'),sameAs:[contacts.telegram,contacts.channel]},
    {'@type':'Service','@id':service,name:'Индивидуальный подбор няни для семьи',serviceType:'Подбор няни',description:seoConfig.description,url:seoConfig.url,provider:{'@id':person},audience:{'@type':'Audience',audienceType:'Семьи с детьми'},...(seoConfig.areaServed?{areaServed:seoConfig.areaServed}:{})},
    {'@type':'WebSite','@id':website,name:seoConfig.name,url:seoConfig.url,inLanguage:'ru',publisher:{'@id':person}},
    {'@type':'WebPage','@id':publicUrl('#webpage'),url:seoConfig.url,name:seoConfig.title,description:seoConfig.description,inLanguage:'ru',isPartOf:{'@id':website},mainEntity:{'@id':service},primaryImageOfPage:{'@type':'ImageObject',url:publicUrl('assets/social-card.png'),width:1200,height:630}},
  ]};
}

export function seoHead(file,overrides={}) {
  const m=metadataFor(file,overrides);
  const graph=m.main?`<script type="application/ld+json" id="service-schema">${JSON.stringify(serviceGraph()).replaceAll('<','\\u003c')}</script>`:'';
  return `<title>${escapeHtml(m.title)}</title>
<meta name="description" content="${escapeHtml(m.description)}">
<meta name="robots" content="${m.robots}">
<link rel="canonical" href="${escapeHtml(m.canonical)}">
<meta property="og:type" content="website"><meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="${escapeHtml(seoConfig.name)}">
<meta property="og:title" content="${escapeHtml(m.title)}"><meta property="og:description" content="${escapeHtml(m.description)}">
<meta property="og:url" content="${escapeHtml(m.canonical)}">
<meta property="og:image" content="${escapeHtml(m.image)}"><meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(seoConfig.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(m.title)}">
<meta name="twitter:description" content="${escapeHtml(m.description)}"><meta name="twitter:image" content="${escapeHtml(m.image)}">
<meta name="twitter:image:alt" content="${escapeHtml(seoConfig.title)}">
${graph}`;
}

export function utilityIndexingTags(file) {
  return `<meta name="robots" content="noindex, follow"><link rel="canonical" href="${escapeHtml(publicUrl(file))}">`;
}

export function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(seoConfig.url)}</loc></url></urlset>\n`;
}

export function robotsTxt() {
  return `# Robots rules are read only at the origin root, not in a project subfolder.\n# Keep design pages crawlable so their HTML noindex rule can be read.\nUser-agent: *\nAllow: /\nSitemap: ${publicUrl('sitemap.xml')}\n`;
}
