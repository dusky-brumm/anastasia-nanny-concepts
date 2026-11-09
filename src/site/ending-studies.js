// Change only the wash behind the existing form; keep every entered value.
const consultation=document.querySelector('#apply[data-form-color]');
if(consultation){
 const choices=[...consultation.querySelectorAll('[data-form-color-choice]')];
 function chooseColor(value){
  const selected=choices.find(button=>button.dataset.formColorChoice===value)??choices[0];
  consultation.dataset.formColor=selected.dataset.formColorChoice;
  for(const button of choices)button.setAttribute('aria-pressed',String(button===selected));
 }
 consultation.addEventListener('click',event=>{
  const button=event.target.closest('[data-form-color-choice]');
  if(!button||!consultation.contains(button))return;
  chooseColor(button.dataset.formColorChoice);
  const url=new URL(location.href);
  url.searchParams.set('form',button.dataset.formColorChoice);
  history.replaceState(null,'',url);
 });
 const restore=()=>chooseColor(new URLSearchParams(location.search).get('form'));
 addEventListener('popstate',restore);restore();
}
