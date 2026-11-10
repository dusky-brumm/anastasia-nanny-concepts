export const surfaceVersions=[
 {id:'original',name:'Белая подложка',detail:'Прежние белые карточки отзывов'},
 {id:'blue',name:'Мягкая белая штриховка',detail:'Более плотный белый фон с лёгкими карандашными штрихами'},
 {id:'green',name:'Меловая фактура',detail:'Прежняя плотная меловая подложка отзывов'},
 {id:'duo',name:'Карандашная фактура',detail:'Прежняя подложка с более заметными карандашными штрихами'},
];
export const surfaceVersion=value=>surfaceVersions.find(version=>version.id===value)??null;
