const fonts={
  lora:{display:"'Lora',Georgia,serif",query:'family=Lora:ital,wght@0,400;0,500;1,400'},
  tenor:{display:"'Tenor Sans',Arial,sans-serif",query:'family=Tenor+Sans'},
  cormorant:{display:"'Cormorant Garamond',Georgia,serif",query:'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500'},
  playfair:{display:"'Playfair Display',Georgia,serif",query:'family=Playfair+Display:ital,wght@0,400;0,500;1,400'}
};
export const freshConcepts=[
  {id:'42-walk',number:1,name:'Прогулка',layout:'walk',category:'photo',type:'lora',paper:'#fcfcf8',soft:'#e8f1f4',panel:'#f1f3e9',ink:'#243e3a',accent:'#335c4d',detail:'#b2785a',summary:'Большая живая фотография и белый подиум. Широкие спокойные полосы, как прогулка без спешки.'},
  {id:'43-chord',number:2,name:'Созвучие',layout:'chord',category:'editorial',type:'cormorant',paper:'#fffefb',soft:'#e1edf1',panel:'#f3f0e7',ink:'#254144',accent:'#375c50',detail:'#ac7059',summary:'Фотография становится частью крупной фразы. Открытая типографика и ступенчатый маршрут подбора.'},
  {id:'44-light',number:3,name:'Просвет',layout:'light',category:'process',type:'tenor',paper:'#ffffff',soft:'#dfedf3',panel:'#f2f5ef',ink:'#28434c',accent:'#3e6354',detail:'#a66f5c',summary:'Голубая вертикальная ось связывает весь сайт. Горизонтальные фотографии и ясные пересечения смыслов.'},
  {id:'45-pause',number:4,name:'Пауза',layout:'pause',category:'personal',type:'playfair',paper:'#fdfdf9',soft:'#ebf2f4',panel:'#edf0e6',ink:'#30453c',accent:'#49634d',detail:'#af765e',summary:'Портрет и текст разнесены по диагонали. Много воздуха, небольшая записка и камерный личный тон.'},
  {id:'46-match',number:5,name:'Совпадение',layout:'match',category:'process',type:'tenor',paper:'#fcfdfb',soft:'#dcecf2',panel:'#ecf1e7',ink:'#28423c',accent:'#365d49',detail:'#ac745c',summary:'Авторская иллюстрация о совпадении людей. Первое знакомство с Настей происходит в блоке о ней.'},
  {id:'47-personal',number:6,name:'Лично',layout:'personal',category:'personal',type:'lora',paper:'#f9faf6',soft:'#e2edf0',panel:'#edf0e6',ink:'#27443d',accent:'#315647',detail:'#ac735e',summary:'Крупное имя вместо привычной обложки. Личный сервис, фактическая биография и открытые поля стоимости.'}
].map(c=>({...c,fonts:fonts[c.type],deep:c.accent,paletteName:'Голубой · белый · зелёный'}));
