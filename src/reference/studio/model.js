export const blocks = [
  {id:'header',name:'Хедер с меню',variants:['Открытая строка','Логотип по центру','Меню в капсуле','Два уровня','Компактное меню']},
  {id:'hero',name:'Первый экран',variants:['Фото и записка','Центральная композиция','Портрет в рамке','Светлая панель','Редакционная обложка']},
  {id:'service',name:'Подробнее об услуге',variants:['Три карточки','Открытые строки','Схема подбора','Бумажные записки','Запрос и результат']},
  {id:'about',name:'Об Анастасии',variants:['Текст и фотоколлаж','Портрет слева','Личное письмо','Фотоальбом','Краткое представление']},
  {id:'process',name:'Как проходит подбор',variants:['Как в образце','Одна линия','Две строки','Записки','Результат каждого этапа']},
  {id:'pricing',name:'Стоимость и условия',variants:['Цена и условия','Центральная карточка','Лист с условиями','Две панели','Контрастный акцент']},
  {id:'reviews',name:'Отзывы',variants:['Прикреплённые записки','Открытые цитаты','Главный отзыв','Речевые облака','Письма семей']},
  {id:'apply',name:'Финальная заявка',variants:['Текст и форма','Центральная форма','Записная книжка','Форма и Telegram','Карточка с портретом']},
  {id:'footer',name:'Футер с контактами',variants:['Одна строка','По центру','Колонки','Контактная карточка','Крупная подпись']},
];
export const palettes = [
  {id:'sky',name:'Голубой и молочный',paper:'#faf6ec',wash:'#e4edf1',soft:'#f0e8df',ink:'#294c3e',accent:'#426a80',wine:'#815c53'},
  {id:'sage',name:'Шалфей и сливочный',paper:'#fcf8ed',wash:'#e8eee1',soft:'#f0e8d9',ink:'#3b5545',accent:'#526c4c',wine:'#865f52'},
  {id:'rose',name:'Пудровый и небо',paper:'#fcf8f5',wash:'#eee3e1',soft:'#e6eef1',ink:'#4e5153',accent:'#4c6a7a',wine:'#8e6269'},
  {id:'lilac',name:'Лаванда и молочный',paper:'#fbf9f2',wash:'#edeaf3',soft:'#e5ece9',ink:'#43564e',accent:'#586382',wine:'#7e657f'},
  {id:'sand',name:'Песочный и голубой',paper:'#fbf6e9',wash:'#e5edf0',soft:'#f0e3d0',ink:'#4c5847',accent:'#526a74',wine:'#88674f'},
  {id:'mint',name:'Мята и персик',paper:'#fcf7ee',wash:'#e4efe9',soft:'#f4e6df',ink:'#31594e',accent:'#466e60',wine:'#966b5c'},
];
export const fontSets = [
  {id:'tinos',name:'Tinos + Manrope',note:'Спокойная классика'},
  {id:'lora',name:'Lora + Golos Text',note:'Мягкая книжная типографика'},
  {id:'prata',name:'Prata + Manrope',note:'Выразительные заголовки'},
  {id:'golos',name:'Golos Text',note:'Чистый современный набор'},
];
export const defaults={layout:'111111111',palette:'sky',font:'tinos'};
export function normalizeState(raw={}) {
  raw=raw&&typeof raw==='object'?raw:{};
  const layout=String(raw.layout??defaults.layout);
  return {
    layout:blocks.map((_,i)=>/^[1-5]$/.test(layout[i]??'')?layout[i]:'1').join(''),
    palette:palettes.some(p=>p.id===raw.palette)?raw.palette:defaults.palette,
    font:fontSets.some(p=>p.id===raw.font)?raw.font:defaults.font,
  };
}
export function readState(search='') {return normalizeState(Object.fromEntries(new URLSearchParams(search)));}
export function designUrl(page,state,hash='') {
  const clean=normalizeState(state);
  return `${page}?${new URLSearchParams({...clean,v:'__VERSION__'})}${hash?'#'+hash:''}`;
}
export function selectVariant(state,blockId,value) {
  const next=normalizeState(state),index=blocks.findIndex(b=>b.id===blockId);
  if(index>=0&&/^[1-5]$/.test(String(value)))next.layout=next.layout.slice(0,index)+value+next.layout.slice(index+1);
  return next;
}
