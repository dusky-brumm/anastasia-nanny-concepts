import { initCommonUI } from '../shared-ui.js';
import { initFavorites } from '../preferences.js';

initCommonUI({ menuButton: '.menu-toggle', menu: '#mobile-nav' });
initFavorites();
document.querySelector('[data-direction-select]')?.addEventListener('change',event=>{
  location.href = event.target.value;
});

function appendContext(message, details) {
  if(message.value.includes(details))return;
  const combined=[message.value.trim(),details].filter(Boolean).join('\n');
  if(message.maxLength>0&&combined.length>message.maxLength){
    const status=message.form?.querySelector('.form-result');
    if(status){status.hidden=false;status.textContent='В описании уже много деталей. Подсказку можно добавить вручную после сокращения текста.';}
    return;
  }
  message.value=combined;
  message.dispatchEvent(new Event('input',{bubbles:true}));
}

document.querySelectorAll('.family-question-picker').forEach(picker=>{
  const question=picker.querySelector('[data-family-question]');
  const topics=[...picker.querySelectorAll('[data-family-topic]')];
  topics.forEach(button=>button.addEventListener('click',()=>{
    topics.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    question.textContent=button.dataset.question;
  }));
  picker.querySelector('[data-use-family-question]')?.addEventListener('click',()=>{
    const message=document.querySelector('form [name="message"]');
    if(!message)return;
    const line=`Хочу обсудить: ${question.textContent.trim()}`;
    appendContext(message,line);
  });
});

document.querySelectorAll('[data-meeting-preparation]').forEach(preparation=>{
  preparation.querySelector('[data-use-meeting-notes]')?.addEventListener('click',()=>{
    const message=document.querySelector('form [name="message"]');
    if(!message)return;
    const details=[
      ['Ребёнок',preparation.querySelector('[data-meeting-age]').value],
      ['Помощь нужна',preparation.querySelector('[data-meeting-time]').value],
      ['Хочу обсудить',preparation.querySelector('[data-meeting-focus]').value]
    ].filter(([,value])=>value).map(([label,value])=>`${label}: ${value}.`).join('\n');
    appendContext(message,details);
  });
});
