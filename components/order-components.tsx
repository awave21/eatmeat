import {useId, useState} from 'react';
import {ArrowRight, Check, Minus, Plus} from 'lucide-react';
import {categories, DELIVERY_CITY, dishes, drinks, DRINK_PRICE, PRICE} from '../lib/menu';
import FoodPhoto from './food-photo';
import PhoneInput from './phone-input';
import SitePhoto from './site-photo';

export function BasketIntro({selected, onContinue}: {
 selected: (number|null)[];
 onContinue: (category: number) => void;
}) {
 const missing = categories.filter((_, index)=>selected[index]===null);
 const firstMissing = selected.indexOf(null);

 return <div className="basket-intro">
  <div className="eyebrow">Ваш выбор</div>
  <h2 tabIndex={-1}>{firstMissing===-1?'Ваш обед собран':'Соберите обед'}</h2>
  {firstMissing===-1
   ? <p className="muted">Полный обед из четырёх блюд</p>
   : <>
    <p className="muted">Выбрано {categories.length-missing.length} из {categories.length} · {PRICE} ₽ за набор</p>
    <p className="basket-missing">Осталось выбрать: {missing.join(', ').toLowerCase()}.</p>
    <button className="primary" onClick={()=>onContinue(firstMissing)}>Продолжить выбор <ArrowRight size={18}/></button>
   </>}
 </div>;
}

export function DishDetails({cat, index, selected, onAction}: {
 cat: number;
 index: number;
 selected: boolean;
 onAction: () => void;
}) {
 const dish = dishes[cat][index];
 return <div className="detail">
  <div className="eyebrow">{categories[cat]} · {dish.weight} Г</div>
  <h2 id="dish-detail-title" tabIndex={-1}>{dish.name}</h2>
  <FoodPhoto cat={cat} variant={index}/>
  <p>{dish.desc}</p>
  <div className="detail-info"><b>{dish.kcal} ккал</b><span>Аллергены: {dish.allergens}</span></div>
  <small>Пример блюда. Состав, вес и пищевая ценность требуют подтверждения кухни.</small>
  <button className="primary" onClick={onAction}>{selected?'Вернуться к меню':'Добавить в обед'} {selected?<ArrowRight size={18}/>:<Plus size={18}/>}</button>
 </div>;
}

export function AddressFields({draft, onPhoneChange}: {
 draft: Record<string,string>;
 onPhoneChange: (phone: string) => void;
}) {
 const [showExtras,setShowExtras]=useState(Boolean(draft.apartment||draft.entrance||draft.comment));
 return <>
  <fieldset className="address-fields">
   <legend>Адрес доставки</legend>
   <input type="hidden" name="city" value={DELIVERY_CITY}/>
   <p className="address-city">{DELIVERY_CITY}</p>
   <p className="form-note">Районы реальной доставки пока уточняются. Для проверки введите вымышленный адрес в Москве.</p>
   <label><span>Улица и дом <span className="field-required">(обязательно)</span></span>
    <input name="address" defaultValue={draft.address||''} required minLength={5} maxLength={200}
     autoComplete="street-address" placeholder="Например, Лесная, 12"/>
   </label>
  </fieldset>
  <label><span>Ваше имя <span className="field-required">(обязательно)</span></span>
   <input name="name" defaultValue={draft.name||''} required minLength={2} maxLength={80}
    autoComplete="given-name" placeholder="Как к вам обращаться"/>
  </label>
  <label><span>Телефон <span className="field-required">(обязательно)</span></span>
   <PhoneInput initialValue={draft.phone||''} onValueChange={onPhoneChange}/>
  </label>
  <details className="address-extras" open={showExtras} onToggle={event=>setShowExtras(event.currentTarget.open)}>
   <summary>Детали для курьера <span>необязательно</span></summary>
   <div className="form-split">
    <label>Квартира / офис<input name="apartment" defaultValue={draft.apartment||''} maxLength={30} placeholder="42"/></label>
    <label>Подъезд, этаж<input name="entrance" defaultValue={draft.entrance||''} maxLength={40} placeholder="2, 5"/></label>
   </div>
   <label>Комментарий курьеру<textarea name="comment" defaultValue={draft.comment||''} maxLength={400}
    placeholder="Домофон, ориентир или пожелания"/></label>
  </details>
 </>;
}

const basketDrinks = [{id:'',name:'Без напитка',description:'Только блюда'},...drinks];

export function BasketBeverages({drink, onDrink}: {
 drink: string|null;
 onDrink: (value: string|null) => void;
}) {
 const group = useId();
 return <fieldset className="basket-beverages">
  <legend>Напиток к обеду</legend>
  <p>По одному на обед · {DRINK_PRICE} ₽ за напиток</p>
  <div className="basket-beverage-options">
   {basketDrinks.map(item=>{
    const checked = (drink||'')===item.id;
    return <label key={item.id} className={'basket-beverage'+(checked?' is-checked':'')}>
     <input type="radio" name={group} value={item.id} checked={checked} onChange={()=>onDrink(item.id||null)}/>
     {item.id?<SitePhoto src={'/drinks/'+item.id+'.webp'} alt=""/>:<span className="beverage-none"><Minus size={20}/></span>}
     <span className="beverage-copy"><b>{item.name}</b><small>{item.description}</small></span>
     <span className="beverage-check" aria-hidden="true">{checked&&<Check size={12}/>}</span>
    </label>;
   })}
  </div>
 </fieldset>;
}
