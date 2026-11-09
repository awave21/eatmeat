'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,Plus,Minus,Truck,X} from 'lucide-react';
import MealCatalog from '../components/meal-catalog';
import FoodPhoto from '../components/food-photo';
import {AddressFields, BasketBeverages, BasketIntro, DishDetails} from '../components/order-components';
import {categories,dishes,CUTLERY_PRICE,DELIVERY_WINDOW,MAX_ORDER_QUANTITY,deliveryDate,drinks,orderPrices} from '../lib/menu';
const sectionIds = [...categories.map((_,index)=>'category-'+index),'drinks'];
const formatDate = (value: string) => new Date(value+'T12:00:00Z').toLocaleDateString('ru-RU',{day:'numeric',month:'long',timeZone:'Europe/Moscow'});

export default function Home(){
 const [tab,setTab]=useState(0),[selected,setSelected]=useState<(number|null)[]>([null,null,null,null]),[quantity,setQuantity]=useState(1),[drawer,setDrawer]=useState(false),[detail,setDetail]=useState<{cat:number,index:number}|null>(null),[date,setDate]=useState(''),[stage,setStage]=useState<'basket'|'address'|'done'>('basket'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[order,setOrder]=useState<{id:string,date:string}|null>(null);
 const [drink,setDrink]=useState<string|null>(null);
 const [cutleryQuantity,setCutleryQuantity]=useState(0);const drinkName=drinks.find(d=>d.id===drink)?.name||'Без напитка';
 const [notice,setNotice]=useState('');
 const formDraft=useRef<Record<string,string>>({});
 const [addressDraft,setAddressDraft]=useState<Record<string,string>>({});
 const [basketLoaded,setBasketLoaded]=useState(false);
 const closing=useRef(false);
 const closeAnimation=useRef<Animation|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);const previousFocus=useRef<HTMLElement|null>(null);
 const lunchWord=quantity%10===1&&quantity%100!==11?'обед':quantity%10>=2&&quantity%10<=4&&(quantity%100<12||quantity%100>14)?'обеда':'обедов';
 const count=selected.filter(x=>x!==null).length;
 const prices=orderPrices(quantity,drink,cutleryQuantity);
 const {total}=prices;
 useEffect(()=>{
  const timer=setTimeout(()=>{
   try{
    const saved=JSON.parse(localStorage.getItem('obed-basket')||'null');
    if(Array.isArray(saved?.selected)&&saved.selected.length===categories.length&&
     saved.selected.every((index:unknown,category:number)=>index===null||
      (Number.isInteger(index)&&Number(index)>=0&&Number(index)<dishes[category].length))){
     setSelected(saved.selected);
    }
    if(Number.isInteger(saved?.quantity)&&saved.quantity>=1&&saved.quantity<=MAX_ORDER_QUANTITY)setQuantity(saved.quantity);
    if(saved?.version===2){
     if(drinks.some(item=>item.id===saved.drink))setDrink(saved.drink);
     if(Number.isInteger(saved.cutleryQuantity)&&saved.cutleryQuantity>=0&&saved.cutleryQuantity<=MAX_ORDER_QUANTITY){
      setCutleryQuantity(saved.cutleryQuantity);
     }
    }
    localStorage.removeItem('obed-brand');
   }catch{}
   setBasketLoaded(true);
  },0);
  return()=>clearTimeout(timer);
 },[]);
 useEffect(()=>{
  if(!basketLoaded)return;
  try{localStorage.setItem('obed-basket',JSON.stringify({version:2,selected,quantity,drink,cutleryQuantity}));}catch{}
 },[basketLoaded,selected,quantity,drink,cutleryQuantity]);
 useEffect(()=>{
  let timer: ReturnType<typeof setTimeout>;
  function refreshDate(){
   clearTimeout(timer);
   setDate(deliveryDate());
   timer=setTimeout(refreshDate,60_000-Date.now()%60_000);
  }
  refreshDate();
  document.addEventListener('visibilitychange',refreshDate);
  return()=>{
   clearTimeout(timer);
   document.removeEventListener('visibilitychange',refreshDate);
  };
 },[]);
 useEffect(()=>{
  const sections=sectionIds.map(id=>document.getElementById(id)!);
  let frame=0;
  let anchorTop=0;
  function update(){
   frame=0;
   const active=sections.findLastIndex(section=>section.getBoundingClientRect().top<=anchorTop);
   setTab(Math.max(0,active));
  }
  function schedule(){
   if(!frame)frame=requestAnimationFrame(update);
  }
  function resize(){
   const headerOffset=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
   const sectionOffset=parseFloat(getComputedStyle(sections[0]).scrollMarginTop)||0;
   anchorTop=headerOffset+sectionOffset+2;
   schedule();
  }
  resize();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',resize);
  return()=>{
   cancelAnimationFrame(frame);
   window.removeEventListener('scroll',schedule);
   window.removeEventListener('resize',resize);
  };
 },[]);
 const modalOpen=drawer||detail!==null;
 useEffect(()=>{
  const panel=dialog.current;
  if(!drawer||!panel)return;
  panel.scrollTop=0;
  const id=requestAnimationFrame(()=>panel.querySelector('h2')?.focus({preventScroll:true}));
  return()=>cancelAnimationFrame(id);
 },[drawer,stage]);
 useEffect(()=>{
  const panel=dialog.current;
  if(!panel)return;
  if(modalOpen){
   const title=panel.querySelector<HTMLElement>('#dish-detail-title');
   if(!title)previousFocus.current=document.activeElement as HTMLElement;
   panel.showModal();
   document.body.style.overflow='hidden';
   if(title){
    title.focus({preventScroll:true});
    // Establish the closed styles before starting the entrance transition.
    panel.getBoundingClientRect();
    panel.dataset.visible='';
   }
  }else{
   panel.close();
   closeAnimation.current?.cancel();
   closeAnimation.current=null;
   delete panel.dataset.visible;
   previousFocus.current?.focus({preventScroll:true});
   previousFocus.current=null;
  }
  return()=>{document.body.style.overflow=''};
 },[modalOpen]);

 async function close(){
  if(closing.current)return;
  closing.current=true;
  const panel=dialog.current;
  if(panel?.open&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   if(panel.hasAttribute('data-visible')){
    delete panel.dataset.visible;
    await Promise.allSettled(panel.getAnimations().map(animation=>animation.finished));
   }else{
    const animation=panel.animate([{opacity:1,transform:'translate(0,0)'},{opacity:0,transform:'translateX(14px)'}],
     {duration:160,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    closeAnimation.current=animation;
    await animation.finished.catch(()=>{});
   }
  }
  setDrawer(false);
  setDetail(null);
  setError('');
  closing.current=false;
 }
 function choose(cat:number,index:number){const removing=selected[cat]===index;setSelected(s=>s.map((v,i)=>i===cat?(removing?null:index):v));setNotice(dishes[cat][index].name+(removing?' — убрано из обеда':' — добавлено в обед'))}
 function openBasket(){setStage('basket');setDrawer(true)}
 function openAddress(){
  setAddressDraft({...formDraft.current});
  setStage('address');
 }
 async function submit(event: React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const currentDate=deliveryDate();
  if(currentDate!==date){
   setDate(currentDate);
   setError('Дата доставки изменилась. Проверьте новую дату и подтвердите заказ.');
   return;
  }
  setBusy(true);
  setError('');
  const fields=Object.fromEntries(new FormData(event.currentTarget));
  try{
   if(process.env.NEXT_PUBLIC_GITHUB_PAGES==='true'){
    const id=crypto.randomUUID();
    sessionStorage.setItem('obed-demo-order',JSON.stringify({id,selected,quantity,drink,cutleryQuantity,date,total}));
    setOrder({id,date});
   }else{
    let key=sessionStorage.getItem('obed-order-key');
    if(!key){
     key=crypto.randomUUID();
     sessionStorage.setItem('obed-order-key',key);
    }
    const response=await fetch('/api/orders',{
     method:'POST',
     headers:{'Content-Type':'application/json'},
     body:JSON.stringify({...fields,selected,quantity,drink,cutleryQuantity,date,key}),
    });
    const data=await response.json() as {id:string,error?:string};
    if(!response.ok)throw new Error(data.error||'Не удалось сохранить заказ. Попробуйте ещё раз.');
    setOrder({id:data.id,date});
    sessionStorage.removeItem('obed-order-key');
   }
   setStage('done');
  }catch(error){
   setError(error instanceof Error?error.message:'Ошибка соединения. Попробуйте снова.');
  }finally{
   setBusy(false);
  }
 }
 function goToCategory(index:number){
  const behavior:ScrollBehavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  document.getElementById(sectionIds[index])?.scrollIntoView({behavior,block:'start'});
 }
 async function continueChoosing(index:number){
  await close();
  requestAnimationFrame(()=>{
   document.getElementById(sectionIds[index])?.querySelector('h2')?.focus({preventScroll:true});
   goToCategory(index);
  });
 }
 const niceDate=date?formatDate(date):'';
 return <><MealCatalog selected={selected} quantity={quantity} total={total} drink={drink} activeCategory={tab} date={niceDate} notice={notice} onChoose={choose} onDrink={setDrink} onQuantity={setQuantity} onDetails={(cat,index,trigger)=>{previousFocus.current=trigger;setDetail({cat,index})}} onBasket={openBasket} onCategory={goToCategory}/>
 <dialog ref={dialog} aria-label={drawer?"Оформление обеда":undefined} aria-labelledby={detail?"dish-detail-title":undefined} className={'drawer '+(detail?'detail-drawer':'')} onCancel={e=>{e.preventDefault();void close()}} onClick={e=>{if(e.target===dialog.current)close()}}><div className="dialog-inner" key={drawer?stage:"detail"}><button className="close" aria-label="Закрыть" onClick={close}><X size={22}/></button>
 {detail&&<DishDetails cat={detail.cat} index={detail.index} selected={selected[detail.cat]===detail.index}
  onAction={async()=>{
   if(selected[detail.cat]!==detail.index)choose(detail.cat,detail.index);
   await close();
  }}/>}
 {drawer&&<ol className="checkout-steps" aria-label="Шаги заказа">{["Состав","Адрес","Готово"].map((step,i)=><li key={step} aria-current={i===({basket:0,address:1,done:2}[stage])?"step":undefined}><span>{i+1}</span>{step}</li>)}</ol>}
 {drawer&&stage==='basket'&&<><BasketIntro selected={selected} onContinue={continueChoosing}/><div className="basket-items">{categories.map((c,i)=><div key={c} className="basket-item">{selected[i]!==null?<FoodPhoto cat={i} variant={selected[i]!}/>:<span className="empty-thumb"><Plus/></span>}<div><small>{c}</small><b>{selected[i]!==null?dishes[i][selected[i]!].name:'Ещё не выбрано'}</b><button onClick={()=>continueChoosing(i)}>{selected[i]===null?'Выбрать':'Изменить'}</button></div>{selected[i]!==null&&<button className="remove" aria-label={'Убрать '+c} onClick={()=>{setSelected(s=>s.map((v,k)=>k===i?null:v));setNotice(categories[i]+" — убрано из обеда")}}><X size={17}/></button>}</div>)}</div><BasketBeverages drink={drink} onDrink={setDrink}/><div className="quantity-row"><div><b>Количество обедов</b><small>Одинаковые комплекты</small></div><div className="quantity"><button aria-label="Уменьшить количество" disabled={quantity<=1} onClick={()=>setQuantity(q=>q-1)}><Minus size={16}/></button><b>{quantity}</b><button aria-label="Увеличить количество" disabled={quantity>=MAX_ORDER_QUANTITY} onClick={()=>setQuantity(q=>q+1)}><Plus size={16}/></button></div></div><div className="quantity-row basket-cutlery">
  <div><b>Приборы</b><small>{CUTLERY_PRICE} ₽ за набор</small></div>
  <div className="quantity" role="group" aria-label="Количество наборов приборов">
   <button type="button" aria-label="Убрать набор приборов" disabled={cutleryQuantity===0} onClick={()=>setCutleryQuantity(q=>q-1)}><Minus size={16}/></button>
   <b aria-live="polite">{cutleryQuantity}</b>
   <button type="button" aria-label="Добавить набор приборов" disabled={cutleryQuantity>=MAX_ORDER_QUANTITY} onClick={()=>setCutleryQuantity(q=>q+1)}><Plus size={16}/></button>
  </div>
 </div><div className="basket-summary"><span>Обеды <b>{prices.meals} ₽</b></span>{drink&&<span>Напитки · {quantity} шт. <b>{prices.beverages} ₽</b></span>}{cutleryQuantity>0&&<span>Приборы · {cutleryQuantity} наб. <b>{prices.cutlery} ₽</b></span>}<span>Доставка <b>Бесплатно</b></span><strong>{count===categories.length?'Итого':'Итого после выбора блюд'} <b>{total} ₽</b></strong></div>{count===categories.length&&<button className="primary" onClick={openAddress}>Указать адрес <ArrowRight size={18}/></button>}<p className="form-note">Тестовый заказ · Без оплаты и реальной доставки</p></>}
 {drawer&&stage==='address'&&<><button className="back" onClick={()=>setStage('basket')}>← К составу обеда</button><h2 tabIndex={-1}>Куда привезти?</h2><div className="delivery-recap"><Truck size={21}/><span>{niceDate} · {DELIVERY_WINDOW}<small>Доставка бесплатно · {quantity} {lunchWord} · {total} ₽</small><small>Напиток: {drinkName}{drink&&` · ${quantity} шт.`}</small>{cutleryQuantity>0&&<small>Приборы: {cutleryQuantity} наб.</small>}</span></div><form onSubmit={submit} onInput={e=>{const field=e.target as HTMLInputElement;if(field.name&&field.name!=='phone')formDraft.current[field.name]=field.value}}><AddressFields draft={addressDraft} onPhoneChange={phone=>{formDraft.current.phone=phone}}/><label className="consent"><input type="checkbox" required/>Понимаю, что это тестовый заказ: использую вымышленные данные и проверяю форму.</label>{error&&<p role="alert" className="error">{error}</p>}<button className="primary" disabled={busy}>{busy?'Сохраняем…':'Подтвердить тестовый заказ'}{!busy&&<ArrowRight size={18}/>}</button><p className="form-note">Используйте вымышленные контактные данные для проверки.</p></form></>}
 {drawer&&stage==='done'&&order&&<div className="success"><span className="success-icon"><Check size={36}/></span><div className="eyebrow">Готово</div><h2 tabIndex={-1}>Заказ сохранён</h2><p>{process.env.NEXT_PUBLIC_GITHUB_PAGES==='true'?'Демонстрационный заказ сохранён только в этом браузере.':'Тестовый заказ сохранён.'}</p><div className="receipt"><small>НОМЕР ЗАКАЗА</small><b>{order.id.slice(0,8).toUpperCase()}</b><p>{formatDate(order.date)} · {DELIVERY_WINDOW}</p><span>{quantity} {lunchWord} · {total} ₽ · доставка 0 ₽</span><p className="receipt-drink">Напиток: {drinkName}{drink&&` · ${quantity} шт.`}</p>{cutleryQuantity>0&&<p className="receipt-drink">Приборы: {cutleryQuantity} наб.</p>}</div><p className="muted">Это проверка сценария оформления.<br/>Кухня и курьер не получают этот заказ.</p><button className="primary" onClick={close}>Вернуться к меню <ArrowRight size={18}/></button></div>}
 </div></dialog></>
}
