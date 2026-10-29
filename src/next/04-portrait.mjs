import {frame,section,heading,headline,intro,biography,approach,stages,services,reviews,cafe,photo,actions,button,tg,form,requestCopy} from './common.mjs';

const questions = ['Что вы учитываете при подборе?','Как проходит собеседование?','Что я узнаю о кандидате?'];

export function render(version) {
  const body = [
    section('hero',`<div class="pt-stage"><figure class="pt-main-photo">${cafe(true)}<figcaption>Анастасия Доронина · веду подбор лично</figcaption></figure><div class="pt-cover-copy"><span class="eyebrow">Индивидуальный подбор няни</span><h1>${headline.replace('спокойно','<em>спокойно</em>')}</h1><p>${intro}</p>${actions()}</div></div>`, 'pt-hero'),
    section('service',`<div class="pt-service-layout">${heading('О подборе','Что входит в подбор')}<div class="pt-questions">${approach.map((item,index)=>`<article><h3>${questions[index]}</h3><p>${item.text}</p></article>`).join('')}</div></div>`, 'pt-service'),
    section('about',`<div class="pt-about-grid"><div>${heading('Обо мне','Анастасия Доронина')}<div class="pt-biography">${biography}</div></div><div class="pt-about-images"><figure>${photo('nastya-family','Анастасия с детьми на природе')}</figure><figure>${photo('nastya-child','Анастасия с малышом на прогулке')}</figure></div></div>`, 'pt-about'),
    section('process',`${heading('Порядок работы','От запроса до начала работы няни')}<div class="pt-route-head"><span>Этап</span><span>Моё участие</span><span>Что получает семья</span></div><ol class="pt-route">${stages.map((stage,index)=>`<li><div class="pt-stage-title"><span>0${index+1}</span><h3>${stage.title}</h3></div><p class="pt-stage-action">${stage.action}</p><p class="pt-stage-result"><strong>Для семьи:</strong> ${stage.result}</p></li>`).join('')}</ol>`, 'pt-process'),
    section('pricing',`${heading('Стоимость и условия','Подбор или консультация')}<div class="pt-formats">${services.map((service,index)=>`<article class="pt-format ${index===0?'pt-format-main':''}"><div class="pt-format-intro"><h3>${service.title}</h3><p class="pt-price">${service.price}</p><p>${service.intro}</p></div><div class="pt-format-details"><ul>${service.features.map(feature=>`<li>${feature}</li>`).join('')}</ul><p class="pt-terms">${service.terms}</p>${button(service.action,service.title,index===0?'':'button-secondary')}</div></article>`).join('')}</div>`, 'pt-pricing'),
    section('reviews',`${heading('Отзывы','Опыт семей')}<div class="pt-testimonials">${reviews.map((review,index)=>`<figure class="${index===0?'pt-lead-review':''}"><blockquote><p>«${review.text}»</p></blockquote><figcaption><strong>${review.name}</strong><span>${review.detail}</span></figcaption></figure>`).join('')}</div>`, 'pt-reviews'),
    section('request',`<div class="pt-request-layout"><div>${heading('Обсудить подбор','Готовы обсудить подбор?')}${requestCopy}${tg()}</div><div class="pt-form">${form('portrait-new')}</div></div>`, 'pt-request'),
  ].join('');
  return frame({id:'04-portrait',body,version});
}
