import {ArrowDown} from 'lucide-react';
import {PRICE} from '../lib/menu';

const cityRoute='M16 358 V116 Q16 98 34 98 H40 V42 Q40 18 64 18 H226';

function LunchCity(){
 return <svg className="lunch-city" viewBox="0 0 620 426" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <g fill="#d9e5f6" opacity=".58">
   <rect x="50" y="32" width="32" height="43" rx="6"/>
   <rect x="102" y="37" width="58" height="42" rx="8"/>
   <rect x="175" y="37" width="42" height="64" rx="7"/>
   <rect x="34" y="121" width="31" height="62" rx="6"/>
   <rect x="33" y="209" width="51" height="43" rx="7"/>
   <rect x="36" y="275" width="35" height="66" rx="7"/>
   <rect x="86" y="284" width="64" height="34" rx="6"/>
   <rect x="91" y="358" width="45" height="42" rx="8"/>
   <rect x="471" y="35" width="72" height="40" rx="8"/>
   <rect x="558" y="27" width="37" height="64" rx="7"/>
   <rect x="562" y="120" width="43" height="54" rx="7"/>
   <rect x="556" y="324" width="44" height="66" rx="7"/>
   <rect x="474" y="373" width="58" height="33" rx="7"/>
  </g>
  <path d="M8 83H71M8 194H92M8 262H152M8 352H154M86 106V422M546 13V416M452 83H615M541 104H615M539 310H615M454 363H614" fill="none" stroke="#a9bddc" strokeWidth="1.2" opacity=".44"/>
  <path d={cityRoute} fill="none" stroke="#7a98cc" strokeWidth="1.5" strokeDasharray="3 6" strokeLinecap="round" opacity=".52"/>
  <g className="lunch-city-dot" style={{offsetPath:`path("${cityRoute}")`}}>
   <circle r="9" fill="#2448c5" opacity=".13"/>
   <circle r="4" fill="#2448c5" opacity=".72"/>
  </g>
 </svg>;
}

export default function DeliveryJourney({date}:{date:string}){
 return <section className="delivery-hero" aria-labelledby="welcome-heading">
  <div className="welcome-copy">
   <h1 id="welcome-heading">Четыре блюда. <span>Ваш выбор.</span></h1>
   <p>В наборе суп, горячее, салат и десерт.</p>
   <a className="primary welcome-cta" href="#menu">Собрать обед за {PRICE} ₽ <ArrowDown size={18}/></a>
  </div>
  <div className="lunch-hero">
   <div className="lunch-delivery">
    <span className="lunch-delivery-courier" aria-hidden="true"/>
    <strong>Бесплатная доставка</strong>
    <p>{date} · 12:00–13:00</p>
   </div>
   <div className="lunch-visual">
    <LunchCity/>
    <img
     className="lunch-hero-photo"
     src="/food/lunch-set-angled-768.webp"
     srcSet={'/food/lunch-set-angled-768.webp 768w, ' + '/food/lunch-set-angled-1024.webp 1024w, ' + '/food/lunch-set-angled-1280.webp 1280w'}
     sizes="(max-width: 760px) calc(100vw - 58px), (max-width: 1100px) calc(50vw - 70px), (max-width: 1278px) calc(50vw - 89px), 550px"
     width={1536}
     height={1024}
     alt="Пример обеда из борща, курицы с пюре, греческого салата и ягодного чизкейка в чёрных контейнерах"
     fetchPriority="high"
    />
   </div>
  </div>
 </section>;
}
