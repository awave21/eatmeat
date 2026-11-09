'use client';
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import DishFlight,{type Flight} from './dish-flight';
import {ArrowUpRight,ArrowRight,Check,Plus,Minus,ShoppingBag,Clock,Truck,GlassWater} from 'lucide-react';
import DeliveryJourney from './delivery-journey';
import FoodPhoto from './food-photo';
import {categories,dishes,drinks,PRICE,DRINK_PRICE,MAX_ORDER_QUANTITY} from '../lib/menu';
type Props={selected:(number|null)[];quantity:number;total:number;drink:string|null;activeCategory:number;date:string;notice:string;onChoose:(c:number,i:number)=>void;onDrink:(d:string|null)=>void;onQuantity:(n:number)=>void;onDetails:(c:number,i:number,trigger:HTMLButtonElement)=>void;onBasket:()=>void;onCategory:(i:number)=>void};
function CourierCatcher({active, inRail = false}: {active: boolean; inRail?: boolean}) {
 return <div className={'dock-catcher'+(inRail?' rail-catcher':'')+(active?' catcher-active':'')} aria-hidden="true">
  <div className="dock-courier-figure"/>
 </div>;
}

export default function MealCatalog(p:Props){
 const count=p.selected.filter(x=>x!==null).length;const drinkName=drinks.find(d=>d.id===p.drink)?.name||'Без напитка';
 const [flights,setFlights]=useState<Flight[]>([]),[incoming,setIncoming]=useState<Record<number,number>>({}),[caught,setCaught]=useState(false);const sequence=useRef(0),catchTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(catchTimer.current)clearTimeout(catchTimer.current)},[]);
 function landed(f:Flight){setFlights(items=>items.filter(item=>item.id!==f.id));setIncoming(items=>{if(items[f.cat]!==f.id)return items;const next={...items};delete next[f.cat];return next});setCaught(false);if(catchTimer.current)clearTimeout(catchTimer.current);catchTimer.current=setTimeout(()=>{setCaught(true);catchTimer.current=setTimeout(()=>setCaught(false),650)},100)}
 function selectDish(cat:number,index:number,event:MouseEvent<HTMLButtonElement>){
  const removing=p.selected[cat]===index;
  p.onChoose(cat,index);
  if(removing){
   setFlights(items=>items.filter(item=>item.cat!==cat));
   setIncoming(items=>{const next={...items};delete next[cat];return next});
   return;
  }
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const source=event.currentTarget.querySelector('.product-image')?.getBoundingClientRect();
  const target=Array.from(document.querySelectorAll(`[data-rail-slot="${cat}"], [data-dock-slot="${cat}"] > :first-child`))
   .map(slot=>slot.getBoundingClientRect())
   .find(rect=>rect.width>0&&rect.height>0);
  if(!source||!target)return;

  const f:Flight={id:++sequence.current,cat,variant:index,x:source.x,y:source.y,size:source.width,
   targetX:target.x+target.width/2,targetY:target.y+target.height/2,targetSize:target.width};
  setIncoming(items=>({...items,[cat]:f.id}));
  setFlights(items=>[...items.filter(item=>item.cat!==cat),f]);
 }
 return <>
 <a className="skip-link" href="#menu">Перейти к меню</a>
 <header className="shop-header"><a href="/" className="logo" aria-label="Питание Москва — на главную"><span className="logo-mark"><span className="brand-symbol" aria-hidden="true"><span/><span/><span/><span/></span></span><span className="company-name">Питание Москва</span><span className="logo-caption">готовая еда на каждый день</span></a><nav aria-label="Основная навигация"><a href="#menu">Меню</a><a href="#delivery">Доставка и оплата</a></nav><button className="shop-basket" onClick={p.onBasket}><ShoppingBag size={19}/><span>Мой обед</span><b>{count}/4</b></button></header>
 <div className="delivery-line"><span><Truck size={16}/> Привезём {p.date} с 12:00 до 13:00</span><span>Доставка бесплатно <i>·</i> Заказ до 20:00</span></div>
 <main className="shop-main"><DeliveryJourney date={p.date}/><div id="menu" className="catalog-anchor"/>
 <section className="catalog-intro"><div><span className="catalog-kicker">Завтра обедаем дома. Или в офисе.</span><h2>А что вы любите на обед?</h2><p>Выберите суп, гарнир, салат и десерт. Мы займёмся остальным.</p></div><div className="set-price"><b>{PRICE} <span>₽</span></b><span>четыре блюда<br/>напиток и приборы отдельно</span></div></section>
 <div className="catalog-layout">
 <aside className="category-rail" aria-label="Разделы меню">
  <span className="rail-title">Соберите свой обед</span>
  <CourierCatcher active={caught} inRail/>
  <nav>
   {categories.map((category, index)=>{
    const variant=p.selected[index];
    const dish=variant===null?null:dishes[index][variant];
    return <button key={category} onClick={()=>p.onCategory(index)}
     className={p.activeCategory===index?'current':''} aria-current={p.activeCategory===index?'location':undefined}
     aria-label={category+(dish?', выбрано '+dish.name:', блюдо не выбрано')}>
     <span className={'rail-count '+(dish?'complete':'')} aria-hidden="true">{dish?<Check size={13}/>:index+1}</span>
     <span className="rail-slot" data-rail-slot={index} aria-hidden="true">
      {variant!==null&&!incoming[index]?<FoodPhoto cat={index} variant={variant}/>:index+1}
     </span>
     <span><b>{category}</b><small>{dish?.name??'Выберите 1 из 3'}</small></span>
    </button>;
   })}
   <button onClick={()=>p.onCategory(4)} className={p.activeCategory===4?'current':''}
    aria-current={p.activeCategory===4?'location':undefined} aria-label={'Напиток, '+drinkName}>
    <span className={'rail-count '+(p.drink?'complete':'')} aria-hidden="true"><GlassWater size={15}/></span>
    <span className="rail-slot" aria-hidden="true">
     {p.drink?<img src={'/drinks/'+p.drink+'.webp'} alt=""/>:<GlassWater size={16}/>}
    </span>
    <span><b>Напиток</b><small>{drinkName}</small></span>
   </button>
  </nav>
  <p>Меняйте блюда сколько хотите. Четыре блюда за {PRICE} ₽.</p>
 </aside>
 <div className="catalog-departments">
 {categories.map((category,cat)=><section className="menu-department" id={'category-'+cat} key={category} aria-labelledby={'heading-'+cat}><div className="department-heading"><div><span className="department-index">0{cat+1}</span><h2 id={'heading-'+cat}>{category}</h2><span className="department-hint">{['С чего начнём?','Самое сытное — здесь','Немного свежести','Оставьте место для сладкого'][cat]}</span></div><span className={'department-status '+(p.selected[cat]!==null?'done':'')}>{p.selected[cat]!==null?<><Check size={14}/> Выбрано</>:'Выберите одно блюдо'}</span></div><div className="catalog-grid">{dishes[cat].map((d,i)=><article className={'catalog-card '+(p.selected[cat]===i?'is-selected':'')} key={d.id}><button className="product-select" aria-pressed={p.selected[cat]===i} aria-label={d.name+(p.selected[cat]===i?'. Выбрано. Нажмите, чтобы снять выбор':'. Выбрать блюдо')} onClick={event=>selectDish(cat,i,event)}><div className="product-image"><FoodPhoto cat={cat} variant={i} lazy/><span className="product-toggle" aria-hidden="true">{p.selected[cat]===i&&<Check size={15}/>}</span><span className="product-tag">{d.tag}</span></div><span className="product-title">{d.name}</span><span className="product-meta">{d.weight} г <span>·</span> {d.kcal} ккал</span></button><button className="product-details" aria-label={'Состав и аллергены: '+d.name} onClick={event=>p.onDetails(cat,i,event.currentTarget)}>Состав и аллергены <ArrowUpRight size={13}/></button></article>)}</div></section>)}
 <section className="menu-department drinks-department" id="drinks" aria-labelledby="drinks-title"><div className="department-heading"><div><span className="department-index">05</span><h2 id="drinks-title">Чем запить?</h2><span className="department-hint">По желанию</span></div><button className="no-drink" aria-pressed={!p.drink} onClick={()=>p.onDrink(null)}>{!p.drink&&<Check size={13}/>}Без напитка</button></div><div className="drink-options" role="group" aria-label="Напиток к обеду">{drinks.map(d=><button key={d.id||'none'} className={'drink-option '+(p.drink===d.id?'chosen-drink':'')} aria-pressed={p.drink===d.id} onClick={()=>p.onDrink(p.drink===d.id?null:d.id)}><span className={"drink-art "+(d.id?"drink-photo":"")}>{d.id?<img src={"/drinks/"+d.id+".webp"} alt={d.name} loading="lazy" decoding="async"/>:<Minus size={28}/>}</span><span className="drink-name">{d.name}<small>{d.description}</small><b className="drink-price">{DRINK_PRICE} ₽</b></span><span className="drink-indicator" aria-hidden="true">{p.drink===d.id&&<Check size={13}/>}</span></button>)}</div></section>
 </div></div>
 <section className="shop-help" id="delivery"><div className="help-delivery"><span className="catalog-kicker">Всё просто</span><h2>Сегодня выбираете.<br/>Завтра обедаете.</h2><dl><div><dt><Clock size={17}/> Заказы до 20:00</dt><dd>На следующий день. Позже — на послезавтра.</dd></div><div><dt><Truck size={17}/> Доставка 0 ₽</dt><dd>{p.date}, с 12:00 до 13:00.</dd></div></dl></div><div className="help-questions">{[['Как собрать обед?','Выберите одно блюдо в каждом из четырёх разделов. Напиток добавляйте по желанию. Нажмите на карточку ещё раз, чтобы снять выделение.'],['Можно ли менять состав?','Да, до оформления выбирайте другие блюда, меняйте напиток или убирайте позиции в корзине. Четыре блюда стоят 390 ₽, напиток и приборы можно добавить отдельно.'],['Где прочитать состав?','Под каждой карточкой есть отдельная ссылка «Состав и аллергены». Она открывает подробности и сохраняет ваш выбор.'],['Это уже настоящий заказ?',process.env.NEXT_PUBLIC_GITHUB_PAGES==='true'?'Это демонстрация: заказ сохраняется только в браузере и никуда не отправляется. Используйте вымышленные контакты.':'Сейчас работает тестовый сценарий: заказ сохраняется, но кухня, оплата и курьерская служба пока не подключены. Используйте вымышленные контакты.']].map(([q,a])=><details key={q}><summary>{q}<Plus size={17}/></summary><p>{a}</p></details>)}</div></section>
 </main>
 <footer className="shop-footer"><div><a href="/" className="footer-wordmark">Питание Москва</a><p>Хорошая еда.<br/>Простой выбор.</p></div><div className="shop-footer-bottom"><span>© 2026 · Концепция сервиса готовых обедов</span><a href="/design-system">Дизайн-система <ArrowUpRight size={14}/></a><span>Изображения сгенерированы · Заказы тестовые</span></div></footer>
 <div className={"meal-dock "+(caught?"dock-caught":"")} aria-label="Ваш собранный обед"><div className="dock-inner"><CourierCatcher active={caught}/><button className="dock-label" onClick={p.onBasket}><span>Ваш обед</span><b>{count} из 4 блюд</b></button><div className="dock-thumbs">{categories.map((c,i)=><button key={c} data-dock-slot={i} aria-label={'Изменить: '+c} onClick={()=>p.onCategory(i)} className={p.selected[i]!==null&&!incoming[i]?'has-item':''}>{p.selected[i]!==null&&!incoming[i]?<FoodPhoto cat={i} variant={p.selected[i]!}/>:<span>{i+1}</span>}<small>{c}</small></button>)}<button className="dock-drink" aria-label={'Изменить напиток: '+drinkName} onClick={()=>p.onCategory(4)}>{p.drink?<img src={'/drinks/'+p.drink+'.webp'} alt={drinkName}/>:<span><GlassWater size={18}/></span>}<small>{p.drink?drinkName:'Напиток'}</small></button></div><div className="quantity dock-quantity"><button aria-label="Уменьшить количество" disabled={p.quantity<=1} onClick={()=>p.onQuantity(p.quantity-1)}><Minus size={15}/></button><b>{p.quantity}</b><button aria-label="Увеличить количество" disabled={p.quantity>=MAX_ORDER_QUANTITY} onClick={()=>p.onQuantity(p.quantity+1)}><Plus size={15}/></button></div><div className="dock-price"><b>{p.total} ₽</b><small className="dock-delivery">доставка 0 ₽</small><small className="dock-progress">{count} из 4 блюд</small></div><button className="primary dock-checkout" onClick={p.onBasket}>{count===4?'Оформить заказ':'Мой обед'}<ArrowRight size={18}/></button></div></div><div className="sr-only" role="status" aria-live="polite">{p.notice}</div>{flights.map(f=><DishFlight key={f.id} flight={f} onLand={landed}/>)}
 </>;
}
