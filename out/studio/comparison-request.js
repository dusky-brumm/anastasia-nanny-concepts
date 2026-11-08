(function bindRequestUi(formatRequest) {
  function fitDraft(output) {
    output.style.height='auto';
    const limit=Math.max(220,Math.min(520,window.innerHeight*.65));
    output.style.height=Math.min(limit,Math.max(220,output.scrollHeight+2))+'px';
  }
  window.addEventListener('resize',()=>{
    document.querySelectorAll('.s-draft:not([hidden]) textarea').forEach(fitDraft);
  });
  document.querySelectorAll('.s-consult-form [type=submit]').forEach(button => { button.disabled = false; });
  document.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if(button?.matches('.s-privacy'))document.querySelector('#studio-privacy').showModal();
    if(button?.matches('[data-close]'))button.closest('dialog').close();
    if(button?.matches('.s-copy')){const form=button.closest('form'),output=form.elements.namedItem('draft'),status=form.querySelector('[role=status]');try{await navigator.clipboard.writeText(output.value);status.textContent='Текст скопирован.';}catch{output.focus();output.select();status.textContent='Скопируйте выделенный текст вручную.';}}
    if(event.target.matches('#studio-privacy')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;if(!form.matches('.s-consult-form'))return;event.preventDefault();
    const name=form.elements.namedItem('name'),contact=form.elements.namedItem('contact'),message=form.elements.namedItem('message');
    name.setCustomValidity(name.value.trim()?'':'Укажите ваше имя.');contact.setCustomValidity(contact.value.trim().length>=3?'':'Укажите телефон или Telegram для связи.');
    if(!form.reportValidity())return;
    const text=formatRequest({name:name.value,contact:contact.value,message:message.value});
    if(form.dataset.requestFlow==='telegram'){
      const destination=new URL('https://t.me/inyfid');
      destination.searchParams.set('text',text);
      window.open(destination.href,'_blank','noopener,noreferrer');
      return;
    }
    form.elements.namedItem('draft').value=text;
    const draft=form.querySelector('.s-draft');draft.hidden=false;fitDraft(form.elements.namedItem('draft'));form.querySelector('[role=status]').textContent='Заявка подготовлена. Отправьте её Анастасии самостоятельно.';
    const prepared=new CustomEvent('request:draft',{bubbles:true,cancelable:true});
    if(form.dispatchEvent(prepared))draft.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  document.addEventListener('input',event=>{const form=event.target.closest('.s-consult-form');if(!form||event.target.name==='draft')return;const draft=form.querySelector('.s-draft');if(draft)draft.hidden=true;form.querySelector('[role=status]').textContent='';form.elements.namedItem('name').setCustomValidity('');form.elements.namedItem('contact').setCustomValidity('');});
})(function formatRequest({name,contact,message}) {
  const lines=['Здравствуйте, Анастасия!','',`Меня зовут ${name.trim()}.`,`Связаться со мной: ${contact.trim()}.`];
  if(message.trim())lines.push('','О нашей семье:',message.trim());
  return lines.join('\n');
});
