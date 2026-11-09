import {ArrowUpRight, Check} from 'lucide-react';
import type {MouseEvent} from 'react';
import {dishes, drinks, DRINK_PRICE} from '../lib/menu';
import FoodPhoto from './food-photo';

export function DishCard({cat, index, selected, onSelect, onDetails}: {
 cat: number;
 index: number;
 selected: boolean;
 onSelect: (event: MouseEvent<HTMLButtonElement>) => void;
 onDetails: (trigger: HTMLButtonElement) => void;
}) {
 const dish = dishes[cat][index];
 return <article className={'catalog-card'+(selected?' is-selected':'')}>
  <button className="product-select" aria-pressed={selected}
   aria-label={dish.name+(selected?'. Выбрано. Нажмите, чтобы снять выбор':'. Выбрать блюдо')}
   onClick={onSelect}>
   <div className="product-image">
    <FoodPhoto cat={cat} variant={index} lazy/>
    <span className="product-toggle" aria-hidden="true">{selected&&<Check size={15}/>}</span>
    <span className="product-tag">{dish.tag}</span>
   </div>
   <span className="product-title">{dish.name}</span>
   <span className="product-meta">{dish.weight} г <span>·</span> {dish.kcal} ккал</span>
  </button>
  <button className="product-details" aria-label={'Состав и аллергены: '+dish.name}
   onClick={event=>onDetails(event.currentTarget)}>Состав и аллергены <ArrowUpRight size={13}/></button>
 </article>;
}

export function DrinkOptions({drink, onDrink}: {
 drink: string|null;
 onDrink: (value: string|null) => void;
}) {
 return <div className="drink-options" role="group" aria-label="Напиток к обеду">
  {drinks.map(item=><button key={item.id} className={'drink-option'+(drink===item.id?' chosen-drink':'')}
   aria-pressed={drink===item.id} onClick={()=>onDrink(drink===item.id?null:item.id)}>
   <span className="drink-art drink-photo"><img src={'/drinks/'+item.id+'.webp'} alt="" loading="lazy" decoding="async"/></span>
   <span className="drink-name">{item.name}<small>{item.description}</small><b className="drink-price">{DRINK_PRICE} ₽</b></span>
   <span className="drink-indicator" aria-hidden="true">{drink===item.id&&<Check size={13}/>}</span>
  </button>)}
 </div>;
}
