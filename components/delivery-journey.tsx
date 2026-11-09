import {ArrowDown} from 'lucide-react';
import {PRICE} from '../lib/menu';

export default function DeliveryJourney({date}:{date:string}){
 return <section className="delivery-hero" aria-labelledby="welcome-heading">
  <div className="welcome-copy">
   <h1 id="welcome-heading">Обед из четырёх блюд</h1>
   <p>Выберите суп, горячее, салат и десерт.</p>
   <a className="primary welcome-cta" href="#menu">Собрать обед за {PRICE} ₽ <ArrowDown size={18}/></a>
  </div>
  <div className="lunch-hero">
   <div className="lunch-delivery">
    <div>
     <strong>Бесплатная доставка</strong>
     <p>{date} · 12:00–13:00</p>
    </div>
    <span className="lunch-delivery-courier" aria-hidden="true"/>
   </div>
   <img
    className="lunch-hero-photo"
    src="/food/lunch-set-angled-768.webp"
    srcSet={'/food/lunch-set-angled-768.webp 768w, ' + '/food/lunch-set-angled-1024.webp 1024w, ' + '/food/lunch-set-angled-1280.webp 1280w'}
    sizes="(max-width: 560px) calc(100vw - 60px), (max-width: 760px) calc(100vw - 74px), (max-width: 1356px) 43vw, 600px"
    width={1536}
    height={1024}
    alt="Пример обеда из борща, курицы с пюре, греческого салата и ягодного чизкейка в чёрных контейнерах"
    fetchPriority="high"
   />
  </div>
 </section>;
}
