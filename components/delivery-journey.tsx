import {ArrowDown, CalendarOff, Utensils} from 'lucide-react';
import {DELIVERY_WINDOW, ORDER_CUTOFF_HOUR, PRICE} from '../lib/menu';
import LunchCity from './lunch-city';
import SitePhoto from './site-photo';

export default function DeliveryJourney({date}:{date:string}){
 return <section className="delivery-hero" aria-labelledby="welcome-heading">
  <div className="welcome-copy">
   <h1 id="welcome-heading" className="welcome-heading">Четыре блюда. <span>Ваш выбор.</span></h1>
   <p>В наборе суп, горячее, салат и десерт.</p>
   <a className="primary welcome-cta" href="#menu">Собрать обед за {PRICE} ₽ <ArrowDown size={18}/></a>
   <p className="welcome-demo">Демо · оформление без оплаты и доставки</p>
   <LunchCity/>
  </div>
  <div className="lunch-hero">
   <div className="lunch-delivery">
    <span className="lunch-delivery-courier" aria-hidden="true"/>
    <strong>Бесплатная доставка</strong>
    <p>{date?<>{date} · </>:null}{DELIVERY_WINDOW}</p>
    <a className="lunch-cutoff" href="#delivery">Приём заказов до {ORDER_CUTOFF_HOUR}:00 МСК</a>
   </div>
   <div className="lunch-visual">
    <SitePhoto
     className="lunch-hero-photo"
     src="/food/lunch-set-angled-768.webp"
     srcSet={'/food/lunch-set-angled-768.webp 768w, ' + '/food/lunch-set-angled-1024.webp 1024w, ' + '/food/lunch-set-angled-1280.webp 1280w'}
     sizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1100px) calc(50vw - 36px), (max-width: 1214px) calc(50vw - 55px), 552px"
     width={1536}
     height={1024}
     alt="Пример обеда из борща, курицы с пюре, греческого салата и ягодного чизкейка в чёрных контейнерах"
     fetchPriority="high"
    />
   </div>
   <p className="lunch-extras">Приборы можно добавить отдельно</p>
   <div className="lunch-benefits" aria-label="Преимущества сервиса" role="group">
    <div className="lunch-benefit"><Utensils size={17} aria-hidden="true"/>От одного обеда</div>
    <div className="lunch-benefit"><CalendarOff size={17} aria-hidden="true"/>Без подписки</div>
   </div>
  </div>
 </section>;
}
