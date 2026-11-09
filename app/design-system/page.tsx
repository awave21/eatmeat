/* eslint-disable @next/next/no-html-link-for-pages -- GitHub Pages uses plain links without the Next router. */
'use client';

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {ArrowLeft, ArrowRight, Check, X} from 'lucide-react';
import {DishCard, DrinkOptions} from '../../components/catalog-options';
import {AddressFields, BasketBeverages, BasketIntro, DishDetails} from '../../components/order-components';
import {categories} from '../../lib/menu';

const colors = [
 ['Синий', '--accent', 'Основное действие и выбранное состояние'],
 ['Синий при наведении', '--accent-dark', 'Реакция кнопки на наведение'],
 ['Графит', '--ink', 'Заголовки и основной текст'],
 ['Вторичный текст', '--muted', 'Пояснения и характеристики'],
 ['Фон страницы', '--canvas', 'Основной фон каталога'],
 ['Поверхность', '--surface', 'Карточки и блоки'],
 ['Светлый синий', '--tint', 'Информация и выбранные состояния'],
 ['Разделитель', '--line', 'Границы и разделение'],
] as const;

const radii = [
 ['Метка', '--radius-tag'],
 ['Компактная кнопка', '--radius-compact'],
 ['Кнопка и поле', '--radius-control'],
 ['Вложенный блок', '--radius-inset'],
 ['Карточка', '--radius-card'],
 ['Секция', '--radius-section'],
 ['Панель', '--radius-panel'],
] as const;

const spaces = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const;

export default function DesignSystem(){
 const [selected, setSelected] = useState<number|null>(1);
 const [detailIndex, setDetailIndex] = useState(0);
 const [drink, setDrink] = useState<string|null>(null);
 const [basket, setBasket] = useState<(number|null)[]>(categories.map(()=>null));
 const [submitted, setSubmitted] = useState(false);
 const [tokens, setTokens] = useState<Record<string,string>>({});
 const panel = useRef<HTMLDialogElement>(null);
 const detailTrigger = useRef<HTMLButtonElement>(null);

 useEffect(()=>{
  const frame=requestAnimationFrame(()=>{
   const css=getComputedStyle(document.documentElement);
   setTokens(Object.fromEntries([...colors,...radii].map(([,token])=>[token,css.getPropertyValue(token).trim().toUpperCase()])));
  });
  return()=>cancelAnimationFrame(frame);
 },[]);

 function openDetails(index: number, trigger: HTMLButtonElement){
  setDetailIndex(index);
  const dialog=panel.current!;
  detailTrigger.current=trigger;
  dialog.showModal();
  dialog.querySelector('h2')?.focus({preventScroll:true});
  dialog.getBoundingClientRect();
  dialog.dataset.visible='';
 }
 async function closeDetails(){
  const dialog=panel.current!;
  if(!dialog.hasAttribute('data-visible'))return;
  delete dialog.dataset.visible;
  await Promise.allSettled(dialog.getAnimations().map(animation=>animation.finished));
  dialog.close();
  detailTrigger.current?.focus({preventScroll:true});
 }

 return <>
  <header className="ds-header">
   <a className="logo" href="/">
    <span className="logo-mark"><span className="brand-symbol" aria-hidden="true"><span/><span/><span/><span/></span></span>
    <span className="company-name">Питание Москва</span>
   </a>
   <a className="ds-back" href="/"><ArrowLeft size={17}/> К меню</a>
  </header>
  <main className="ds-page wrap">
   <div className="ds-intro">
    <p className="eyebrow">Интерфейс сервиса</p>
    <h1>Дизайн-система</h1>
    <p>Цвета, отступы и рабочие компоненты каталога и оформления обеда.</p>
    <a href="/#menu" className="primary">Открыть каталог <ArrowRight size={18}/></a>
   </div>

   <section className="ds-section">
    <div className="ds-section-head"><h2>01 / Цвет и типографика</h2>
     <p>Синий показывает действие и выбор. Golos Text используется во всём интерфейсе.</p>
    </div>
    <div className="ds-colors">
     {colors.map(([name,token,role])=><article key={token}>
      <div className="ds-color" style={{background:`var(${token})`}}/>
      <div><b>{name}</b><code>{tokens[token]}</code><p>{role}</p></div>
     </article>)}
    </div>
    <div className="ds-type welcome-copy">
     <span className="ds-type-label">Заголовок первого экрана</span>
     <p className="welcome-heading">Четыре блюда. <span>Ваш выбор.</span></p>
     <p>Исполняем три желания: первое, второе, третье и десерт.</p>
    </div>
   </section>

   <section className="ds-section">
    <div className="ds-section-head"><h2>02 / Отступы и скругления</h2>
     <p>Шкала отступов связывает элементы внутри блока. Радиус зависит от размера и роли поверхности.</p>
    </div>
    <ul className="ds-spaces">{spaces.map(space=><li key={space}>
     <span style={{'--sample-space':`var(--space-${space})`} as CSSProperties}/>{space} px
    </li>)}</ul>
    <ul className="ds-radii">{radii.map(([name,token])=><li key={token}>
     <span style={{borderRadius:`var(${token})`}}/>{name}<code>{tokens[token]?.toLowerCase()}</code>
    </li>)}</ul>
   </section>

   <section className="ds-section">
    <div className="ds-section-head"><h2>03 / Блюда и напитки</h2>
     <p>Нажатие на блюдо переключает выбор. Состав открывается отдельно. На телефоне панель занимает экран, на компьютере выдвигается справа.</p>
    </div>
    <div className="ds-component-grid">
     <div className="ds-demo">
      <span className="ds-type-label">Обычная и выбранная карточки</span>
      <div className="ds-dish-grid">
       {[0,1].map(index=><DishCard key={index} cat={0} index={index} selected={selected===index}
        onSelect={()=>setSelected(selected===index?null:index)} onDetails={trigger=>openDetails(index,trigger)}/>)}
      </div>
     </div>
     <div className="ds-demo drinks-department">
      <span className="ds-type-label">Напиток за дополнительную плату</span>
      <button className="no-drink" aria-pressed={drink===null} onClick={()=>setDrink(null)}>
       {drink===null&&<Check size={13}/>}Без напитка
      </button>
      <DrinkOptions drink={drink} onDrink={setDrink}/>
     </div>
    </div>
   </section>

   <section className="ds-section">
    <div className="ds-section-head"><h2>04 / Корзина и адрес</h2>
     <p>Состав показывает прогресс и недостающие блюда. Поля адреса используют штатную маску телефона и группируют необязательные данные.</p>
    </div>
    <div className="ds-component-grid">
     <div className="ds-demo dialog-inner">
      <span className="ds-type-label">Пустая, неполная и собранная корзина</span>
      <BasketIntro selected={basket} onContinue={index=>setBasket(items=>items.map((item,i)=>i===index?0:item))}/>
      <button className="back" onClick={()=>setBasket(categories.map(()=>null))}>Сбросить пример</button>
      <BasketBeverages drink={drink} onDrink={setDrink}/>
     </div>
     <div className="ds-demo dialog-inner">
      <span className="ds-type-label">Поля оформления</span>
      <form onSubmit={event=>{event.preventDefault();setSubmitted(true)}} onInput={()=>setSubmitted(false)}>
       <AddressFields draft={{}} onPhoneChange={()=>{}}/>
       <button className="primary">Проверить поля <ArrowRight size={18}/></button>
       {submitted&&<p className="ds-success" role="status"><Check size={20}/> Поля заполнены</p>}
      </form>
     </div>
    </div>
   </section>

   <section className="ds-section">
    <div className="ds-section-head"><h2>05 / Адаптивность и движение</h2>
     <p>Компоненты сохраняют состояние и работают с клавиатурой. Системная настройка уменьшения движения отключает переходы и перелёт миниатюр.</p>
    </div>
    <div className="ds-rules">
     <div><b>Каталог</b><p>Две колонки на телефоне и три на компьютере. Название, характеристики и состав выровнены по одному краю карточки.</p></div>
     <div><b>Закреплённые панели</b><p>Мобильная шапка прилегает к краям. Полоса категорий показывает текущий раздел и выбранные блюда, корзина остаётся доступной внизу.</p></div>
     <div><b>Состав блюда</b><p>Фокус переходит в панель при открытии и возвращается к кнопке состава при закрытии.</p></div>
    </div>
   </section>
  </main>
  <dialog ref={panel} aria-labelledby="dish-detail-title" className="drawer detail-drawer"
   onCancel={event=>{event.preventDefault();void closeDetails()}}
   onClick={event=>{if(event.target===event.currentTarget)void closeDetails()}}>
   <div className="dialog-inner">
    <button className="close" aria-label="Закрыть" onClick={closeDetails}><X size={22}/></button>
    <DishDetails cat={0} index={detailIndex} selected={selected===detailIndex}
     onAction={()=>{setSelected(detailIndex);void closeDetails()}}/>
   </div>
  </dialog>
 </>;
}
