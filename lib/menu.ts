export const categories=['Суп','Горячее','Салат','Десерт'];
export const dishes=[
[{id:'s1',name:'Борщ со сметаной',desc:'Свёкла, говядина, капуста, сметана и свежий укроп',weight:300,kcal:186,allergens:'Молоко',tag:'Любимая классика'},
{id:'s2',name:'Тыквенный крем-суп',desc:'Запечённая тыква, сливки и тыквенные семечки',weight:300,kcal:210,allergens:'Молоко',tag:'Без мяса'},
{id:'s3',name:'Куриный суп с лапшой',desc:'Куриный бульон, домашняя лапша, морковь и зелень',weight:300,kcal:162,allergens:'Пшеница, яйцо',tag:'Лёгкий'}],
[{id:'m1',name:'Курица с пюре',desc:'Куриное филе на гриле, нежное картофельное пюре и зелень',weight:320,kcal:412,allergens:'Молоко',tag:'Выбор шефа'},
{id:'m2',name:'Тефтели с гречкой',desc:'Тефтели из говядины, рассыпчатая гречка и томатный соус',weight:320,kcal:438,allergens:'Пшеница, яйцо',tag:'Сытный'},
{id:'m3',name:'Рыба с рисом',desc:'Запечённая белая рыба, рис и брокколи',weight:300,kcal:356,allergens:'Рыба',tag:'Нежный'}],
[{id:'v1',name:'Греческий салат',desc:'Огурцы, томаты, фета, оливки и оливковое масло',weight:160,kcal:184,allergens:'Молоко',tag:'Свежий'},
{id:'v2',name:'Цезарь с курицей',desc:'Куриное филе, романо, пармезан, сухарики и соус',weight:160,kcal:242,allergens:'Молоко, яйцо, рыба, пшеница',tag:'Любимый'},
{id:'v3',name:'Домашний винегрет',desc:'Свёкла, картофель, морковь, огурцы и зелёный горошек',weight:160,kcal:126,allergens:'Возможны следы горчицы',tag:'Без мяса'}],
[{id:'d1',name:'Ягодный чизкейк',desc:'Сливочный чизкейк с ягодным соусом на песочной основе',weight:110,kcal:298,allergens:'Молоко, яйцо, пшеница',tag:'Сладкий финал'},
{id:'d2',name:'Сырники со сметаной',desc:'Нежные творожные сырники с ложкой сметаны',weight:130,kcal:272,allergens:'Молоко, яйцо, пшеница',tag:'Как дома'},
{id:'d3',name:'Шоколадный брауни',desc:'Насыщенный шоколадный брауни с влажной серединкой',weight:90,kcal:334,allergens:'Молоко, яйцо, пшеница',tag:'Для настроения'}]
];
export const PRICE=390;
export const DELIVERY_CITY='Москва';
export const DELIVERY_WINDOW='12:00–13:00';
export const ORDER_CUTOFF_HOUR=20;
export const DRINK_PRICE=30;
export const CUTLERY_PRICE=10;
export const MAX_ORDER_QUANTITY=20;

export function orderPrices(quantity:number, drink:string|null, cutleryQuantity:number){
 const meals=quantity*PRICE;
 const beverages=drink?quantity*DRINK_PRICE:0;
 const cutlery=cutleryQuantity*CUTLERY_PRICE;
 return {meals,beverages,cutlery,total:meals+beverages+cutlery};
}
export function deliveryDate(now=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);const g=(t:string)=>p.find(x=>x.type===t)!.value;const d=new Date(`${g('year')}-${g('month')}-${g('day')}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+(Number(g('hour'))>=ORDER_CUTOFF_HOUR?2:1));return d.toISOString().slice(0,10)}

export const drinks=[{id:"tea",name:"Чай",description:"Чёрный чай"},{id:"compote",name:"Компот",description:"Из сухофруктов"},{id:"mors",name:"Морс",description:"Клюквенный"}];
