import {termsMarkup,frame,section,heading,headline,intro,biography,approach,stages,services,reviews,cafe,photo,actions,button,tg,form,requestCopy} from './common.mjs';

export function render(version) {
  const body = [
    section('hero',`
      <div class="air-title"><span class="eyebrow">Индивидуальный подбор няни</span><h1>${headline}</h1></div>
      <div class="air-introduction">
        <div class="air-lead"><p>${intro}</p>${actions()}<p class="air-author">Анастасия Доронина<span>Подбираю нянь с 2022 года</span></p></div>
        <figure class="air-portrait">${cafe(true)}<figcaption><blockquote>«Я собеседую няню не в общих чертах, а под конкретную вакансию»</blockquote></figcaption></figure>
      </div>`, 'air-hero'),
    section('service',`${heading('О подборе','Подбор под конкретную семью')}<div class="air-service-columns">${approach.map((item,index)=>`<article class="${index===1?'air-personal-interview':''}"><h3>${index===1?'Интервью под ваш запрос':item.title}</h3><p>${item.text}</p></article>`).join('')}</div>`, 'air-service'),
    section('about',`<div class="air-about-grid"><div>${heading('Обо мне','Анастасия Доронина')}<div class="air-biography">${biography}</div>${tg('Обсудить ваш запрос')}</div><figure>${photo('nastya-family','Анастасия с детьми на природе')}<figcaption>До подбора нянь пять лет работала с детьми</figcaption></figure></div>`, 'air-about'),
    section('process',`${heading('Порядок работы','Как проходит подбор','От обсуждения запроса до первых недель работы няни.')}<ol class="air-route">${stages.map((stage,index)=>`<li><span class="air-step">${index+1}</span><h3>${stage.title}</h3><p class="air-action">${stage.action}</p><p class="air-result"><strong>Для семьи:</strong> ${stage.result}</p></li>`).join('')}</ol>`, 'air-process'),
    section('pricing',`${heading('Стоимость и условия','Два формата работы')}<div class="air-plans">${services.map((service,index)=>`<article id="plan-${service.key}" data-service-plan="${service.key}" class="air-plan ${index===0?'air-plan-main':''}"><h3>${service.title}</h3><p class="air-price">${service.price}</p><p class="air-plan-purpose">${index===0?'Поиск и сопровождение семьи.':'Для самостоятельного поиска няни.'}</p><ul>${(index===0?['Интервью, подробные профили и мои комментарии',...service.features.slice(2)]:service.features).map(feature=>`<li>${feature}</li>`).join('')}</ul><p class="air-terms">${termsMarkup(service.terms)}</p>${button(service.action,service.title,index===0?'':'button-secondary')}</article>`).join('')}</div>`, 'air-pricing'),
    section('reviews',`${heading('Отзывы','Что говорят семьи')}<div class="air-reviews">${reviews.map(review=>`<figure><blockquote><p>«${review.text}»</p></blockquote><figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption></figure>`).join('')}</div>`, 'air-reviews-section'),
    section('request',`<div class="air-request-grid"><div>${heading('Обсудить запрос','Готовы обсудить подбор?')}${requestCopy}${tg()}</div><div class="air-form">${form('air')}</div></div>`, 'air-request'),
  ].join('');
  return frame({id:'01-air',body,version});
}
