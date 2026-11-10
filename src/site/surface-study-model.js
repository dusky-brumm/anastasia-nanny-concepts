export const surfaceVersions=[
 {id:'original',name:'Исходный вариант',detail:'Зелёная заливка · прежние подложки отзывов'},
 {id:'blue',name:'Голубая штриховка',detail:'Голубой карандаш · белая карандашная подложка'},
 {id:'green',name:'Зелёная штриховка',detail:'Зелёный карандаш · плотная меловая подложка'},
 {id:'duo',name:'Голубой и зелёный',detail:'Два цвета карандаша · белая карандашная подложка'},
];
export const surfaceVersion=value=>surfaceVersions.find(version=>version.id===value)??null;
