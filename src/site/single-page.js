// The selected final site is one document: native anchors, one font/layout pass.
for(const root of document.querySelectorAll('[data-block-document]'))root.dataset.drawingMotion=document.documentElement.dataset.drawingMotion;
document.addEventListener('drawing:motion',event=>{
  for(const root of document.querySelectorAll('[data-block-document]'))root.dataset.drawingMotion=event.detail.enabled?'on':'off';
});
document.documentElement.dataset.siteReady='true';
for(const image of document.querySelectorAll('.photo-window img,.s-photo-mask img')){
  const reveal=()=>{delete image.dataset.imagePending;image.dataset.imageReady='true';};
  if(image.complete)reveal();
  else{
    image.dataset.imagePending='true';
    image.addEventListener('load',()=>{if(image.decode)image.decode().catch(()=>{}).then(reveal);else reveal();},{once:true});
    image.addEventListener('error',reveal,{once:true});
  }
}
