import {ArrowDown,Truck} from 'lucide-react';
import {CUTLERY_PRICE,PRICE} from '../lib/menu';

export default function DeliveryJourney({date}:{date:string}){
 return <section className="delivery-hero" aria-labelledby="welcome-heading">
  <div className="welcome-copy">
   <span className="welcome-label"><span/> Каждый день. Без подписки.</span>
   <h1 id="welcome-heading">Обед на ваш вкус</h1>
   <p>Соберите четыре любимых блюда.{' '}<br/>Наш курьер привезёт их бесплатно —<br className="welcome-break"/> домой или в офис.</p>
   <a className="primary welcome-cta" href="#menu">Собрать обед за {PRICE} ₽ <ArrowDown size={18}/></a>
   <div className="welcome-delivery"><Truck size={18}/><span>{date} · 12:00–13:00<small>Доставка 0 ₽</small></span></div>
  </div>
  <figure className="lunch-hero">
   <p className="lunch-hero-label">Пример обеда</p>
   <img
    src="/food/lunch-set-768.webp"
    srcSet={'/food/lunch-set-768.webp 768w, ' + '/food/lunch-set-1280.webp 1280w'}
    sizes="(max-width: 560px) calc(100vw - 60px), (max-width: 760px) calc(100vw - 74px), (max-width: 1356px) 43vw, 600px"
    width={1536}
    height={1024}
    alt="Борщ со сметаной, курица с пюре, греческий салат и ягодный чизкейк в чёрных контейнерах рядом с чёрными приборами"
    fetchPriority="high"
   />
   <figcaption>
    <span>Суп · горячее · салат · десерт</span>
    <span>Приборы отдельно · {CUTLERY_PRICE} ₽</span>
   </figcaption>
  </figure>
 </section>;
}
