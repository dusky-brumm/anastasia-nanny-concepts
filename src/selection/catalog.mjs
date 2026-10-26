// A deliberate shortlist: one composition per idea, rather than colour variants.
export const selection = [
  {id:'52-day',folder:'mood',name:'Ясный день',group:'blue',character:'Светлый и личный',difference:'Прямоугольный портрет, голубой фон и живая записка. Самый близкий к выбранным вами макетам.',tags:'Портрет · записка · чистая сетка'},
  {id:'48-support',folder:'trio',name:'Опора',group:'green',character:'Смелый и уверенный',difference:'Глубокий зелёный, выразительный шрифт без засечек и фотография слева. Минимум украшений, много характера.',tags:'Тёмный зелёный · крупный шрифт'},
  {id:'43-chord',folder:'fresh',name:'Созвучие',group:'paper',character:'Типографический',difference:'Небольшая фотография встроена прямо в заголовок. Асимметричная композиция и маршрут по ступеням.',tags:'Фото внутри фразы · асимметрия'},
  {id:'51-leaf',folder:'mood',name:'Лист',group:'green',character:'Свежий и уютный',difference:'Садовый фон за матовым стеклом, личный портрет и цитата на записке. Более атмосферное знакомство.',tags:'Зелёный · матовое стекло · цитата'},
  {id:'33-gazette',folder:'final',name:'Газета',group:'paper',character:'Редакционный',difference:'Страница как небольшой семейный журнал: три колонки, тонкие линии и отдельное поле для цитаты.',tags:'Три колонки · антиква · линии'},
  {id:'46-match',folder:'fresh',name:'Совпадение',group:'blue',character:'С иллюстрацией',difference:'Первый экран строится вокруг рисунка о совпадении семьи и няни. Знакомство с Настей раскрывается ниже.',tags:'Авторский рисунок · голубой и шалфей'},
  {id:'42-walk',folder:'fresh',name:'Прогулка',group:'blue',character:'С акцентом на фото',difference:'Большая живая фотография и белая текстовая плашка поверх её края. Открытая композиция без мелкого декора.',tags:'Широкое фото · белая плашка'},
  {id:'37-profile',folder:'final',name:'Профиль',group:'green',character:'Про результат подбора',difference:'Вместо большого портрета — карточка подробного профиля. Сразу показывает, за что семья платит и что получает.',tags:'Профиль кандидата · мягкий шалфей'},
  {id:'53-veranda',folder:'mood',name:'Веранда',group:'paper',character:'Атмосферный',difference:'Сад на весь первый экран, книжные заголовки и небольшое личное приглашение. Ощущение спокойного домашнего разговора.',tags:'Тёплый свет · книжная типографика'},
  {id:'47-personal',folder:'fresh',name:'Лично',group:'paper',character:'Авторский',difference:'Крупное имя задаёт ритм страницы. Подходит для сайта, в котором важнее всего личное участие Анастасии.',tags:'Крупное имя · личный бренд'},
  {id:'29-letter',folder:'final',name:'Письмо',group:'paper',character:'Тихий и камерный',difference:'Центральный заголовок, два фото и короткая мысль между ними. Светлая страница с интонацией личного письма.',tags:'Фотодиптих · молочный фон'},
  {id:'49-clear',folder:'trio',name:'Ясно',group:'blue',character:'Современный и ясный',difference:'Крупная голубая типографическая обложка без большого портрета. Внутри — интерактивный маршрут подбора.',tags:'Голубой · модульная сетка · интерактив'}
].map((item,index)=>({...item,position:index+1,href:`${item.folder}/${item.id}.html`}));

export function selectEntries(entries){
  const byId=new Map(entries.map(entry=>[entry.id,entry]));
  return selection.map(choice=>{
    const entry=byId.get(choice.id);
    if(!entry)throw new Error(`Missing shortlisted design: ${choice.id}`);
    return {...entry,...choice};
  });
}
