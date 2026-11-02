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
  {id:'sand',name:'Песочный и голубой',paper:'#fbf6e9',wash:'#f1e6d1',soft:'#e5edf0',ink:'#4c5847',accent:'#526a74',wine:'#88674f'},
  {id:'mint',name:'Мята и персик',paper:'#fcf7ee',wash:'#e4efe9',soft:'#f4e6df',ink:'#31594e',accent:'#466e60',wine:'#966b5c'},
];
export const fontSets = [
  {id:'golos',name:'Manrope + Golos Text',note:'Современный основной набор'},
  {id:'lora',name:'Lora + Golos Text',note:'Мягкая книжная типографика'},
  {id:'prata',name:'Prata + Manrope',note:'Выразительные заголовки'},
  {id:'tinos',name:'Tinos + Manrope',note:'Спокойная классика'},
];
export const defaults={layout:'112111113',palette:'sky',font:'golos'};
export const presets=[
  {id:'1',name:'Рекомендованный',layout:defaults.layout},
  {id:'2',name:'Центральный',layout:'222222222'},
  {id:'3',name:'Редакционный',layout:'333333333'},
  {id:'4',name:'Бумажные записки',layout:'444444444'},
  {id:'5',name:'Личная история',layout:'555555555'},
];
export function normalizeState(raw={}) {
  raw=raw&&typeof raw==='object'?raw:{};
  const layout=String(raw.layout??defaults.layout);
  return {
    layout:blocks.map((_,i)=>/^[1-5]$/.test(layout[i]??'')?layout[i]:defaults.layout[i]).join(''),
    palette:palettes.some(p=>p.id===raw.palette)?raw.palette:defaults.palette,
    font:fontSets.some(p=>p.id===raw.font)?raw.font:defaults.font,
  };
}
export function readState(search='') {
  const parameters=new URLSearchParams(search),raw=Object.fromEntries(parameters);
  if(!parameters.has('layout')&&/^[1-5]$/.test(parameters.get('route')??''))raw.layout=selectVariant(defaults,'process',parameters.get('route')).layout;
  return normalizeState(raw);
}
export function designUrl(page,state,hash='') {
  const clean=normalizeState(state);
  return `${page}?${new URLSearchParams({...clean,v:'1ef5db9e36'})}${hash?'#'+hash:''}`;
}
export function selectVariant(state,blockId,value) {
  const next=normalizeState(state),index=blocks.findIndex(b=>b.id===blockId);
  if(index>=0&&/^[1-5]$/.test(String(value)))next.layout=next.layout.slice(0,index)+value+next.layout.slice(index+1);
  return next;
}
