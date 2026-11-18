/* Питание Москва 2.0
   Single-file UI for the concept landing. No framework, no build step. */

const PRICE = 390;
const DRINK_PRICE = 30;
const CUTLERY_PRICE = 10;
const MAX_QTY = 20;
const CUTOFF_HOUR = 20;
const DELIVERY_DAYS = 7;
const WINDOW_TEXT = '12:00–13:00';
const STORE_KEY = 'pm-obed-v3';
const basketFlights = new Map();

const COURSES = [
  {
    name: 'Суп',
    hint: 'С чего начнём',
    dishes: [
      { id: 's1', name: 'Борщ со сметаной', desc: 'Свёкла, говядина, капуста, сметана и свежий укроп', weight: 300, kcal: 186, allergens: 'Молоко', tag: 'Классика' },
      { id: 's2', name: 'Тыквенный крем-суп', desc: 'Запечённая тыква, сливки и тыквенные семечки', weight: 300, kcal: 210, allergens: 'Молоко', tag: 'Без мяса' },
      { id: 's3', photoId: 57350, name: 'Куриный суп с лапшой', desc: 'Куриный бульон, домашняя лапша, морковь и зелень', weight: 300, kcal: 162, allergens: 'Пшеница, яйцо', tag: 'Лёгкий' },
    ],
  },
  {
    name: 'Горячее',
    hint: 'Самое сытное',
    dishes: [
      { id: 'm1', photoId: 13389, name: 'Курица с пюре', desc: 'Куриное филе на гриле, картофельное пюре и зелень', weight: 320, kcal: 412, allergens: 'Молоко', tag: 'Выбор шефа' },
      { id: 'm2', photoId: 13612, name: 'Тефтели с гречкой', desc: 'Тефтели из говядины, гречка и томатный соус', weight: 320, kcal: 438, allergens: 'Пшеница, яйцо', tag: 'Сытный' },
      { id: 'm3', photoId: 51971, name: 'Рыба с рисом', desc: 'Запечённая белая рыба, рис и брокколи', weight: 300, kcal: 356, allergens: 'Рыба', tag: 'Нежный' },
    ],
  },
  {
    name: 'Салат',
    hint: 'Немного свежести',
    dishes: [
      { id: 'v1', photoId: 55737, name: 'Греческий салат', desc: 'Огурцы, томаты, фета, оливки и оливковое масло', weight: 160, kcal: 184, allergens: 'Молоко', tag: 'Свежий' },
      { id: 'v2', photoId: 55794, name: 'Цезарь с курицей', desc: 'Куриное филе, романо, пармезан, сухарики и соус', weight: 160, kcal: 242, allergens: 'Молоко, яйцо, рыба, пшеница', tag: 'Любимый' },
      { id: 'v3', photoId: 55759, name: 'Домашний винегрет', desc: 'Свёкла, картофель, морковь, огурцы и зелёный горошек', weight: 160, kcal: 126, allergens: 'Возможны следы горчицы', tag: 'Без мяса' },
    ],
  },
];

function dishPhoto(dish) {
  if (dish.photoId) {
    return `https://crm.justfood.pro/api/files/${dish.photoId}-360x500-transparent-cropped.webp?v=1`;
  }
  return `assets/food/${dish.id}.webp`;
}

const DRINKS = [
  { id: 'tea', name: 'Чай', sub: 'Чёрный' },
  { id: 'compote', name: 'Компот', sub: 'Из сухофруктов' },
  { id: 'mors', name: 'Морс', sub: 'Клюквенный' },
];

/* ---------- state ---------- */
const state = {
  picked: [null, null, null],
  drink: null,
  qty: 1,
  cutlery: 0,
  deliveryDate: null,
  order: null,
  stage: 'cart',
};

let lastTrigger = null;
let toastTimer = 0;
let noticeTimer = 0;
let toastUndo = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const icon = (name, cls = 'icon') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc = (str) => String(str).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- smooth scroll ---------- */
const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function scrollOffsetFor(el) {
  let offset = 14;
  const header = $('.header');
  const rail = $('.rail');
  if (header && getComputedStyle(header).position === 'sticky') offset += header.offsetHeight;
  if (rail && el.closest('.menu') && getComputedStyle(rail).position === 'sticky') offset += rail.offsetHeight;
  return offset;
}

let scrollFrame = 0;
let scrollCancel = null;

function animateScrollTo(targetY, duration = 880) {
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) return;
  if (prefersReduced()) { window.scrollTo(0, targetY); return; }

  cancelAnimationFrame(scrollFrame);
  scrollCancel?.();
  let cancelled = false;
  const stop = () => { cancelled = true; };
  scrollCancel = () => { cancelled = true; };
  addEventListener('wheel', stop, { passive: true, once: true });
  addEventListener('touchstart', stop, { passive: true, once: true });

  const start = performance.now();
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const step = (now) => {
    if (cancelled) return;
    const p = Math.min(1, (now - start) / duration);
    window.scrollTo(0, startY + delta * easeInOutCubic(p));
    if (p < 1) scrollFrame = requestAnimationFrame(step);
    else { scrollCancel = null; removeEventListener('wheel', stop); removeEventListener('touchstart', stop); }
  };
  scrollFrame = requestAnimationFrame(step);
}

function smoothScrollTo(el, duration) {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const top = el.getBoundingClientRect().top + window.scrollY - scrollOffsetFor(el);
  animateScrollTo(Math.min(max, Math.max(0, top)), duration);
}

/* ---------- dates ---------- */
function deliveryDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  const d = new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (Number(get('hour')) >= CUTOFF_HOUR ? 2 : 1));
  return d.toISOString().slice(0, 10);
}

function dateLabel(iso) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' })
    .format(new Date(iso + 'T12:00:00Z'));
}

function deliveryChoices() {
  const first = new Date(deliveryDate() + 'T12:00:00Z');
  return Array.from({ length: DELIVERY_DAYS }, (_, offset) => {
    const day = new Date(first);
    day.setUTCDate(day.getUTCDate() + offset);
    return day.toISOString().slice(0, 10);
  });
}

function deliveryOptions(dates) {
  const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'Europe/Moscow' });
  const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Europe/Moscow' });
  return dates.map((date) => {
    const day = new Date(date + 'T12:00:00Z');
    return `
    <label class="delivery-day">
      <input type="radio" name="delivery-date" value="${date}" aria-label="${weekday.format(day)}, ${dateLabel(date)}" ${date === state.deliveryDate ? 'checked' : ''}>
      <span class="delivery-day-card"><span>${weekday.format(day)}</span><b>${shortDate.format(day).replace('.', '')}</b></span>
    </label>`;
  }).join('');
}

const deliveryWindowLabel = () => `${dateLabel(state.deliveryDate)} · ${WINDOW_TEXT} · Бесплатно`;

function syncDeliveryCalendar(dates = deliveryChoices()) {
  if (!dates.includes(state.deliveryDate)) state.deliveryDate = dates[0];
  const row = $('#delivery-dates');
  if ($('input', row)?.value !== dates[0]) row.innerHTML = deliveryOptions(dates);
  $(`input[value="${state.deliveryDate}"]`, row).checked = true;
  const label = deliveryWindowLabel();
  const summary = $('#delivery-window');
  if (summary.textContent !== label) summary.textContent = label;
}

function cutoffLeft(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const minutes = get('hour') * 60 + get('minute');
  const left = CUTOFF_HOUR * 60 - minutes;
  if (left <= 0) return 'приём закрыт';
  const h = Math.floor(left / 60);
  const m = left % 60;
  return h > 0 ? `ещё ${h} ч ${String(m).padStart(2, '0')} мин` : `ещё ${m} мин`;
}

/* ---------- pricing ---------- */
function totals() {
  const meals = state.qty * PRICE;
  const beverages = state.drink ? state.qty * DRINK_PRICE : 0;
  const cutlery = state.cutlery * CUTLERY_PRICE;
  return { meals, beverages, cutlery, total: meals + beverages + cutlery };
}
const pickedCount = () => state.picked.filter((v) => v !== null).length;
const isComplete = () => pickedCount() === COURSES.length;
const missing = () => COURSES.map((c, i) => (state.picked[i] === null ? c.name : null)).filter(Boolean);
const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

/* ---------- persistence ---------- */
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      version: 1, picked: state.picked, drink: state.drink, qty: state.qty, cutlery: state.cutlery,
    }));
  } catch { /* storage disabled */ }
}

function restore() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!raw) return;
    if (Array.isArray(raw.picked) && raw.picked.length === COURSES.length &&
      raw.picked.every((v, i) => v === null || (Number.isInteger(v) && v >= 0 && v < COURSES[i].dishes.length))) {
      state.picked = raw.picked;
    }
    if (DRINKS.some((d) => d.id === raw.drink) || raw.drink === null) state.drink = raw.drink;
    if (Number.isInteger(raw.qty) && raw.qty >= 1 && raw.qty <= MAX_QTY) state.qty = raw.qty;
    if (Number.isInteger(raw.cutlery) && raw.cutlery >= 0 && raw.cutlery <= MAX_QTY) state.cutlery = raw.cutlery;
  } catch { /* ignore */ }
}

/* ---------- menu render ---------- */
function renderMenu() {
  const rail = $('#rail');
  rail.innerHTML = COURSES.map((course, i) => {
    const v = state.picked[i];
    const dish = v === null ? null : course.dishes[v];
    return `<button class="rail-btn" type="button" data-jump="${i}">
      <span class="rail-thumb">${v === null ? String(i + 1).padStart(2, '0')
        : `<img src="${dishPhoto(course.dishes[v])}" alt="" width="36" height="36" loading="lazy" decoding="async">`}</span>
      <span class="rail-copy"><b>${course.name}</b><small>${dish ? esc(dish.name) : 'Не выбрано'}</small></span>
      ${icon('check', 'rail-check')}
    </button>`;
  }).join('') + `<button class="rail-btn rail-drink" type="button" data-jump="${COURSES.length}">
      <span class="rail-thumb">${state.drink
        ? `<img src="assets/drinks/${state.drink}.webp" alt="" width="36" height="36" loading="lazy" decoding="async">`
        : icon('plus')}</span>
      <span class="rail-copy"><b>Напиток</b><small>${state.drink ? DRINKS.find((d) => d.id === state.drink).name : 'По желанию'}</small></span>
      ${icon('check', 'rail-check')}
    </button>`;

  const drinksCard = `<section class="course drinks-block" id="course-drinks" aria-labelledby="drinks-title">
    <div class="course-head">
      <span class="course-num mono">${String(COURSES.length + 1).padStart(2, '0')}</span>
      <h3 id="drinks-title">Напиток</h3>
      <span class="course-hint">По желанию</span>
      <span class="course-state" data-state="drinks"></span>
    </div>
    <div class="drink-grid" id="drink-grid">
      <button class="drink${state.drink === null ? ' is-picked' : ''}" type="button" data-drink="none" aria-pressed="${state.drink === null}">
        <span class="drink-art">${icon('prohibit')}</span>
        <span class="drink-name">Без напитка</span>
        <span class="drink-sub">Только блюда</span>
        <span class="drink-price mono">0 ₽</span>
        <span class="drink-pick">${icon('check')}</span>
      </button>
      ${DRINKS.map((d) => `<button class="drink${state.drink === d.id ? ' is-picked' : ''}" type="button" data-drink="${d.id}" aria-pressed="${state.drink === d.id}">
        <span class="drink-art"><img src="assets/drinks/${d.id}.webp" alt="" width="180" height="180" loading="lazy" decoding="async"></span>
        <span class="drink-name">${d.name}</span>
        <span class="drink-sub">${d.sub}</span>
        <span class="drink-price mono">${DRINK_PRICE} ₽</span>
        <span class="drink-pick">${icon('check')}</span>
      </button>`).join('')}
    </div>
  </section>`;

  $('#courses').innerHTML = COURSES.map((course, i) => `<section class="course" id="course-${i}" aria-labelledby="course-title-${i}">
    <div class="course-head">
      <span class="course-num mono">0${i + 1}</span>
      <h3 id="course-title-${i}">${course.name}</h3>
      <span class="course-hint">${course.hint}</span>
      <span class="course-state" data-state="${i}"></span>
    </div>
    <div class="dishes">
      ${course.dishes.map((dish, vi) => `<article class="dish" data-cat="${i}" data-variant="${vi}">
        <button class="dish-plate" type="button" data-pick="${i}:${vi}" aria-pressed="false" aria-label="${esc(dish.name)}">
          <img src="${dishPhoto(dish)}" alt="" width="362" height="362" loading="lazy" decoding="async">
          <span class="dish-tag">${dish.tag}</span>
          <span class="dish-pick">${icon('check')}</span>
        </button>
        <span class="dish-body">
          <span class="dish-name">${dish.name}</span>
          <span class="dish-meta mono">${dish.weight} г · ${dish.kcal} ккал</span>
          <span class="dish-foot">
            <button class="dish-more" type="button" data-more="${i}:${vi}" aria-label="Состав и аллергены: ${esc(dish.name)}">Состав${icon('up-right')}</button>
          </span>
        </span>
      </article>`).join('')}
    </div>
  </section>`).join('') + drinksCard;

  syncMenu();
}

function syncMenu() {
  COURSES.forEach((course, i) => {
    const picked = state.picked[i];
    const section = document.getElementById('course-' + i);
    section.classList.toggle('is-done', picked !== null);
    const stateEl = $(`[data-state="${i}"]`, section);
    stateEl.innerHTML = picked === null ? 'Не выбрано' : `${icon('check')}В обеде`;
    stateEl.hidden = false;

    $$('.dish', section).forEach((card) => {
      const vi = Number(card.dataset.variant);
      const on = picked === vi;
      card.classList.toggle('is-picked', on);
      const plate = $('.dish-plate', card);
      plate.setAttribute('aria-pressed', String(on));
      plate.setAttribute('aria-label', on ? `${course.dishes[vi].name}. В обеде. Убрать` : `${course.dishes[vi].name}. Добавить в обед`);
      $('.dish-tag', card).textContent = on ? 'В обеде' : course.dishes[vi].tag;
    });

    const railBtn = $(`.rail-btn[data-jump="${i}"]`);
    if (railBtn) {
      railBtn.classList.toggle('done', picked !== null);
      const thumb = $('.rail-thumb', railBtn);
      const src = picked === null ? '' : dishPhoto(course.dishes[picked]);
      const existing = $('img', thumb);
      if (picked === null) {
        if (existing) thumb.innerHTML = String(i + 1).padStart(2, '0');
      } else if (!existing || existing.getAttribute('src') !== src) {
        thumb.innerHTML = `<img src="${src}" alt="" width="36" height="36" loading="lazy" decoding="async">`;
      }
      $('.rail-copy small', railBtn).textContent = picked === null ? 'Не выбрано' : course.dishes[picked].name;
    }
  });

  $$('#drink-grid .drink').forEach((btn) => {
    const id = btn.dataset.drink;
    const on = id === 'none' ? state.drink === null : state.drink === id;
    btn.classList.toggle('is-picked', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  const drinkRail = $('.rail-drink');
  if (drinkRail) {
    drinkRail.classList.toggle('done', Boolean(state.drink));
    const thumb = $('.rail-thumb', drinkRail);
    if (state.drink) {
      const src = `assets/drinks/${state.drink}.webp`;
      const img = $('img', thumb);
      if (!img) thumb.innerHTML = `<img src="${src}" alt="" width="36" height="36" loading="lazy" decoding="async">`;
      else if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    } else {
      thumb.innerHTML = icon('plus');
    }
    $('.rail-copy small', drinkRail).textContent = state.drink ? DRINKS.find((d) => d.id === state.drink).name : 'По желанию';
  }

  const drinksState = $('[data-state="drinks"]');
  if (drinksState) {
    drinksState.innerHTML = state.drink ? `${icon('check')}В обеде` : 'Не выбран';
    drinksState.closest('.course').classList.toggle('is-done', Boolean(state.drink));
  }

  const count = pickedCount();
  const dollars = totals();

  $('#progress-text').textContent = `${count} / ${COURSES.length}`;
  $('#progress-bar').setAttribute('aria-valuenow', String(count));
  $$('#progress-bar i').forEach((seg, i) => seg.classList.toggle('on', i < count));

  $('#header-count').textContent = `${count}/${COURSES.length}`;
  $('#header-cart').classList.toggle('has-items', count > 0);

  $('#bar-count').textContent = count === COURSES.length ? 'Обед собран' : `${count} из ${COURSES.length} блюд`;
  $('#bar-hint').textContent = count === COURSES.length ? 'Готов к оформлению' : `Осталось ${COURSES.length - count} ${plural(COURSES.length - count, 'блюдо', 'блюда', 'блюд')}`;
  $('#bar-total').textContent = `${count === COURSES.length ? dollars.total : PRICE} ₽`;
  $('#bar-label').textContent = count === COURSES.length ? 'итого' : 'за обед';
  $('#bar-cta').firstChild.textContent = count === COURSES.length ? 'Мой обед' : 'Собрать обед';

  const dishSlots = COURSES.map((course, i) => {
    const v = state.picked[i];
    const flight = basketFlights.get(i);
    if (flight && flight.variant !== v) flight.animation.cancel();
    const dish = v === null ? null : course.dishes[v];
    const content = dish ? basketThumb(dishPhoto(dish)) : String(i + 1);
    return orderbarSlot(i, v, content, dish?.name);
  });
  const drink = DRINKS.find((item) => item.id === state.drink);
  $('#bar-thumbs').innerHTML = dishSlots.join('') +
    orderbarSlot('drink', state.drink, drinkSlotContent(), drink?.name);

  if ($('#cart').open) renderCart();
}

function basketSlotClass(key, selection) {
  if (selection === null) return 'basket-slot';
  const incoming = basketFlights.get(key)?.variant === selection;
  return incoming ? 'basket-slot filled incoming' : 'basket-slot filled';
}

function orderbarSlot(key, selection, content, name) {
  const attrs = `data-dish-slot="${key}" class="${basketSlotClass(key, selection)}"`;
  if (selection === null) return `<span ${attrs} aria-hidden="true">${content}</span>`;
  return `<button type="button" ${attrs} data-remove-slot="${key}" aria-label="Убрать из обеда: ${esc(name)}">
    ${content}<span class="basket-remove" aria-hidden="true">${icon('x')}</span>
  </button>`;
}

function basketThumb(src) {
  return `<img src="${src}" alt="" width="38" height="38" decoding="async">`;
}

function drinkSlotContent() {
  return state.drink ? basketThumb(`assets/drinks/${state.drink}.webp`) : icon('plus');
}

/* ---------- pick ---------- */
function showCourierCatch(courier) {
  if (prefersReduced()) return;
  for (const animation of courier.getAnimations()) animation.cancel();
  courier.classList.add('is-catching');
  const catchMotion = courier.animate([
    { transform: 'translateY(-3px) rotate(-3deg)' },
    { transform: 'translateY(2px) rotate(2deg)', offset: .45 },
    { transform: 'none' },
  ], { duration: 650, easing: 'ease-in-out' });
  catchMotion.onfinish = () => courier.classList.remove('is-catching');
}

function flyToBasket(key, selection, photo) {
  if (!photo?.naturalWidth || prefersReduced() || !photo.animate) return;

  const isDrink = key === 'drink';
  const cart = photo.closest('#cart[open]');
  const slotSelector = cart ? '#cart-drink-slot' : `[data-dish-slot="${key}"]`;
  const slot = $(slotSelector);
  if (!slot?.offsetWidth) return;
  const courier = cart ? $('#cart-courier') : $('#bar-courier');
  const sourceRect = photo.getBoundingClientRect();
  const targetRect = slot.getBoundingClientRect();
  if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) return;

  const flying = document.createElement('div');
  flying.className = 'dish-flight';
  flying.setAttribute('aria-hidden', 'true');
  Object.assign(flying.style, {
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
  });
  const image = document.createElement('img');
  image.src = photo.currentSrc || photo.src;
  image.alt = '';
  flying.append(image);
  (cart || document.body).append(flying);

  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;
  const dx = targetX - sourceRect.left - sourceRect.width / 2;
  const dy = targetY - sourceRect.top - sourceRect.height / 2;
  const size = Math.min(targetRect.width, targetRect.height) - 4;
  const endScale = size / Math.max(sourceRect.width, sourceRect.height);
  const animation = flying.animate([
    { transform: 'translate(0, 0) scale(.96)', offset: 0 },
    { transform: `translate(${dx * .22}px, ${dy * .12 - 35}px) scale(.76)`, offset: .28 },
    { transform: `translate(${dx * .76}px, ${dy * .67 - 20}px) scale(.33)`, offset: .73 },
    { transform: `translate(${dx}px, ${dy}px) scale(${endScale})`, offset: 1 },
  ], { duration: 950, easing: 'cubic-bezier(.35,0,.35,1)', fill: 'forwards' });

  basketFlights.set(key, { variant: selection, animation });
  slot.classList.add('incoming');
  const finish = (event) => {
    flying.remove();
    if (basketFlights.get(key)?.animation !== animation) return;
    basketFlights.delete(key);
    $(slotSelector)?.classList.remove('incoming');
    if (isDrink) {
      $('[data-dish-slot="drink"]')?.classList.remove('incoming');
      $('#cart-drink-slot')?.classList.remove('incoming');
    }
    const current = isDrink ? state.drink : state.picked[key];
    if (event.type === 'finish' && courier?.offsetWidth && (!cart || cart.open) && current === selection) {
      showCourierCatch(courier);
    }
  };
  animation.onfinish = finish;
  animation.oncancel = finish;
}

function removeDish(cat) {
  const variant = state.picked[cat];
  if (variant === null) return;
  state.picked[cat] = null;
  syncMenu();
  save();
  showToast(`${COURSES[cat].dishes[variant].name} убрано из обеда`, () => {
    if (state.picked[cat] !== null) return;
    state.picked[cat] = variant;
    syncMenu();
    save();
  });
}

function pick(cat, variant, trigger) {
  if (state.picked[cat] === variant) {
    removeDish(cat);
    return;
  }
  state.picked[cat] = variant;
  syncMenu();
  save();
  flyToBasket(cat, variant, $('img', trigger));
  showToast(`${COURSES[cat].dishes[variant].name} в обеде`);
}

function setDrink(id, trigger) {
  const drink = id === 'none' ? null : id;
  const previous = state.drink;
  if (previous === drink) return;
  basketFlights.get('drink')?.animation.cancel();
  state.drink = drink;

  const cart = trigger?.closest('#cart[open]');
  const cartBody = cart ? $('#cart-body') : null;
  const scrollTop = cartBody?.scrollTop;
  if (drink && trigger) flyToBasket('drink', drink, $('img', trigger));
  syncMenu();
  if (cartBody) {
    cartBody.scrollTop = scrollTop;
    $(`[data-drink="${id}"]`, cartBody)?.focus({ preventScroll: true });
  }
  save();
  if (drink === null) {
    showToast('Напиток убран из обеда', () => {
      if (state.drink === null) setDrink(previous);
    });
  }
}

/* ---------- toast ---------- */
function showToast(text, undo) {
  const el = $('#toast');
  $('#toast-text').textContent = text;
  toastUndo = undo || null;
  $('#toast-undo').hidden = !undo;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, undo ? 5200 : 2600);
}

function hideToast() {
  const el = $('#toast');
  el.classList.remove('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 240);
}

/* ---------- sheets ---------- */
function openSheet(id, trigger) {
  const dlg = document.getElementById(id);
  if (dlg.open) return;
  lastTrigger = trigger || document.activeElement;
  if (id === 'cart') { state.stage = 'cart'; renderCart(); }
  dlg.showModal();
  document.body.classList.add('is-locked');
  $('#orderbar').classList.add('hidden');
  const target = id === 'cart' ? $('#cart-title') : $('#detail-title');
  requestAnimationFrame(() => target?.focus({ preventScroll: true }));
}

function closeSheet(id) {
  const dlg = document.getElementById(id);
  if (!dlg.open) return;
  dlg.close();
  if (!$('#cart').open && !$('#detail').open) {
    document.body.classList.remove('is-locked');
    $('#orderbar').classList.remove('hidden');
  }
  if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  lastTrigger = null;
}

/* ---------- cart render ---------- */
function renderCart() {
  syncDeliveryCalendar();
  const body = $('#cart-body');
  const foot = $('#cart-foot');
  const steps = $('#cart-steps');
  $('#cart-courier').hidden = state.stage !== 'cart';
  const drinkSlot = $('#cart-drink-slot');
  drinkSlot.hidden = state.stage !== 'cart';
  drinkSlot.className = basketSlotClass('drink', state.drink);
  drinkSlot.innerHTML = drinkSlotContent();
  $$('li', steps).forEach((li) => {
    const order = ['cart', 'address', 'done'];
    const current = order.indexOf(state.stage);
    const idx = order.indexOf(li.dataset.step);
    li.classList.toggle('current', idx === current);
    li.classList.toggle('done', idx < current);
    if (idx === current) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });

  if (state.stage === 'cart') {
    body.innerHTML = cartStage();
    foot.hidden = false;
    foot.innerHTML = cartFoot();
  } else if (state.stage === 'address') {
    body.innerHTML = addressStage();
    foot.hidden = false;
    foot.innerHTML = addressFoot();
    bindPhone();
    bindFormChecks();
  } else {
    body.innerHTML = doneStage();
    foot.hidden = true;
    foot.innerHTML = '';
  }
  body.scrollTop = 0;
}

function cartStage() {
  const count = pickedCount();
  const sum = totals();
  const miss = missing();
  return `<h2 class="sheet-title" id="cart-title" tabindex="-1">${count === COURSES.length ? 'Ваш обед собран' : 'Соберите обед'}</h2>
    <p class="sheet-sub">${count === COURSES.length ? 'Три блюда, доставка бесплатная.' : `Выбрано ${count} из ${COURSES.length}. ${miss.length ? 'Осталось: ' + miss.join(', ').toLowerCase() + '.' : ''}`}</p>
    <p class="delivery-window"><b>Доставка</b> · ${deliveryWindowLabel()}</p>
    ${miss.length ? `<div class="hint">${icon('clock')}<span>Можно добрать позже: обед сохраняется в этом браузере.</span></div>` : ''}
    <div class="cart-list">
      ${COURSES.map((course, i) => {
        const v = state.picked[i];
        return `<div class="cart-row${v === null ? ' cart-row-missing' : ''}">
          <span class="cart-thumb">${v === null ? icon('plus') : `<img src="${dishPhoto(course.dishes[v])}" alt="" width="58" height="58" loading="lazy" decoding="async">`}</span>
          <span class="cart-row-copy">
            <small>${course.name}</small>
            <b>${v === null ? 'Ещё не выбрано' : esc(course.dishes[v].name)}</b>
            <button type="button" data-goto="${i}">${v === null ? 'Выбрать' : 'Изменить'}</button>
          </span>
          ${v === null ? '' : `<button class="icon-btn" type="button" data-remove="${i}" aria-label="Убрать ${course.name}">${icon('x')}</button>`}
        </div>`;
      }).join('')}
    </div>

    <div style="margin-top:22px">
      <p class="field-title">Напиток к обеду</p>
      <p class="field-hint">По одному на каждый обед, ${DRINK_PRICE} ₽</p>
      <div class="drink-choices">
        <button class="drink-choice${state.drink === null ? ' is-picked' : ''}" type="button" data-drink="none">
          <span class="choice-none">${icon('prohibit')}</span>
          <span><b>Без напитка</b><small>Только блюда</small></span>
          <span class="check">${icon('check')}</span>
        </button>
        ${DRINKS.map((d) => `<button class="drink-choice${state.drink === d.id ? ' is-picked' : ''}" type="button" data-drink="${d.id}">
          <img src="assets/drinks/${d.id}.webp" alt="" width="40" height="40" loading="lazy" decoding="async">
          <span><b>${d.name}</b><small>${d.sub} · ${DRINK_PRICE} ₽</small></span>
          <span class="check">${icon('check')}</span>
        </button>`).join('')}
      </div>
    </div>

    <div class="opt-row">
      <div><b>Количество обедов</b><small>Одинаковые комплекты</small></div>
      <div class="stepper">
        <button type="button" data-qty="-1" aria-label="Уменьшить количество" ${state.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
        <b aria-live="polite">${state.qty}</b>
        <button type="button" data-qty="1" aria-label="Увеличить количество" ${state.qty >= MAX_QTY ? 'disabled' : ''}>${icon('plus')}</button>
      </div>
    </div>
    <div class="opt-row">
      <div><b>Приборы</b><small>${CUTLERY_PRICE} ₽ за набор</small></div>
      <div class="stepper">
        <button type="button" data-cutlery="-1" aria-label="Убрать набор приборов" ${state.cutlery <= 0 ? 'disabled' : ''}>${icon('minus')}</button>
        <b aria-live="polite">${state.cutlery}</b>
        <button type="button" data-cutlery="1" aria-label="Добавить набор приборов" ${state.cutlery >= MAX_QTY ? 'disabled' : ''}>${icon('plus')}</button>
      </div>
    </div>

    <div class="summary">
      <span>Обеды · ${state.qty} ${plural(state.qty, 'комплект', 'комплекта', 'комплектов')} <b>${sum.meals} ₽</b></span>
      ${state.drink ? `<span>Напитки · ${state.qty} шт. <b>${sum.beverages} ₽</b></span>` : ''}
      ${state.cutlery > 0 ? `<span>Приборы · ${state.cutlery} наб. <b>${sum.cutlery} ₽</b></span>` : ''}
      <span class="free">Доставка <b>0 ₽</b></span>
      <span class="total">Итого <b>${sum.total} ₽</b></span>
      <span class="total-note">Цена фиксированная. Оплата не нужна, это демо.</span>
    </div>`;
}

function cartFoot() {
  const sum = totals();
  const complete = isComplete();
  return `<div class="foot-line">
      <div class="foot-sum"><span>Итого</span><b>${sum.total} ₽</b></div>
      <span class="mono" style="font-size:11px;color:var(--muted)">доставка 0 ₽</span>
    </div>
    <button class="btn btn-primary" type="button" id="cart-next" ${complete ? '' : 'data-incomplete="1"'}>
      ${complete ? 'Указать адрес' : `Добрать ${missing()[0].toLowerCase()}`}${icon('arrow')}
    </button>`;
}

function addressStage() {
  const sum = totals();
  const drink = state.drink ? DRINKS.find((d) => d.id === state.drink).name : 'Без напитка';
  return `<button class="link-arrow" type="button" data-back="cart" style="margin-bottom:12px">К составу обеда</button>
    <h2 class="sheet-title" id="cart-title" tabindex="-1">Куда привезти?</h2>
    <p class="sheet-sub">Адрес и телефон нужны курьеру. Это демо, данные никуда не отправляются.</p>
    <div class="recap">
      ${icon('truck')}
      <span class="recap-main">${state.qty} ${plural(state.qty, 'обед', 'обеда', 'обедов')} · ${sum.total} ₽
        <small id="checkout-delivery">${deliveryWindowLabel()}</small>
        <small>Напиток: ${drink}${state.drink ? ` · ${state.qty} шт.` : ''}${state.cutlery ? ` · приборы: ${state.cutlery} наб.` : ''}</small>
      </span>
    </div>
    <form class="form" id="address-form" novalidate>
      <p class="field-error" id="e-delivery" role="alert"></p>
      <div class="field">
        <span class="field-label">Город</span>
        <span class="city-line">${icon('pin')}Москва, доставка по городу</span>
      </div>
      <div class="field">
        <label for="f-address">Улица и дом <span class="opt">(обязательно)</span></label>
        <input class="input" id="f-address" name="address" autocomplete="street-address" placeholder="Лесная, 12" minlength="5" maxlength="200" aria-describedby="e-address">
        <span class="field-error" id="e-address"></span>
      </div>
      <div class="field">
        <label for="f-name">Ваше имя <span class="opt">(обязательно)</span></label>
        <input class="input" id="f-name" name="name" autocomplete="given-name" placeholder="Как к вам обращаться" minlength="2" maxlength="80" aria-describedby="e-name">
        <span class="field-error" id="e-name"></span>
      </div>
      <div class="field">
        <label for="f-phone">Телефон <span class="opt">(обязательно)</span></label>
        <input class="input" id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (916) 123-45-67" aria-describedby="e-phone">
        <span class="field-error" id="e-phone"></span>
      </div>
      <details class="extras">
        <summary>Детали для курьера <span>необязательно</span>${icon('caret')}</summary>
        <div class="extras-body">
          <div class="form-split">
            <div class="field"><label for="f-flat">Квартира / офис</label><input class="input" id="f-flat" name="flat" maxlength="30" placeholder="42"></div>
            <div class="field"><label for="f-entry">Подъезд, этаж</label><input class="input" id="f-entry" name="entry" maxlength="40" placeholder="2, 5"></div>
          </div>
          <div class="field"><label for="f-comment">Комментарий курьеру</label><textarea class="input" id="f-comment" name="comment" maxlength="400" placeholder="Домофон, ориентир или пожелания"></textarea></div>
        </div>
      </details>
      <label class="check-line"><input type="checkbox" id="f-consent">Понимаю, что это демо: использую вымышленные данные, оплата и доставка не подключены.</label>
      <span class="field-error" id="e-consent"></span>
    </form>`;
}

function addressFoot() {
  return `<div class="foot-line">
      <div class="foot-sum"><span>Итого</span><b>${totals().total} ₽</b></div>
      <span class="mono" style="font-size:11px;color:var(--muted)">демо</span>
    </div>
    <button class="btn btn-primary" type="submit" form="address-form" id="submit-order">Подтвердить заказ${icon('arrow')}</button>`;
}

function doneStage() {
  const sum = totals();
  const drink = state.drink ? DRINKS.find((d) => d.id === state.drink).name : 'Без напитка';
  const { code, date } = state.order;
  return `<div class="success">
    <span class="success-mark">${icon('check')}</span>
    <h2 id="cart-title" tabindex="-1">Заказ сохранён</h2>
    <p>Демонстрационный заказ. Кухня и курьер его не получат.</p>
    <div class="receipt">
      <p class="receipt-label">Номер заказа</p>
      <p class="receipt-code">${code}</p>
      <div class="receipt-row"><span>Доставка</span><b>${dateLabel(date)} · ${WINDOW_TEXT}</b></div>
      <div class="receipt-row"><span>Состав</span><b>${state.qty} ${plural(state.qty, 'обед', 'обеда', 'обедов')}</b></div>
      <div class="receipt-row"><span>Напиток</span><b>${drink}</b></div>
      ${state.cutlery ? `<div class="receipt-row"><span>Приборы</span><b>${state.cutlery} наб.</b></div>` : ''}
      <div class="receipt-row receipt-total"><span>Итого</span><b>${sum.total} ₽</b></div>
    </div>
    <p class="form-note">Данные никуда не отправлены и хранятся только в этом браузере.</p>
    <button class="btn btn-primary" type="button" data-close-cart style="margin-top:16px">Вернуться к меню${icon('arrow')}</button>
  </div>`;
}

/* ---------- validation ---------- */
function fieldError(input, message) {
  const err = document.getElementById('e-' + input.id.replace('f-', ''));
  if (err) err.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateAddress() {
  const form = $('#address-form');
  if (!form) return false;
  const address = $('#f-address');
  const name = $('#f-name');
  const phone = $('#f-phone');
  const consent = $('#f-consent');
  let first = null;

  const checks = [
    [address, address.value.trim().length >= 5, 'Укажите улицу и дом, минимум 5 символов'],
    [name, name.value.trim().length >= 2, 'Напишите, как к вам обращаться'],
    [phone, phone.value.replace(/\D/g, '').length === 11, 'Введите телефон полностью: +7 и 10 цифр'],
  ];
  checks.forEach(([input, ok, msg]) => {
    fieldError(input, ok ? '' : msg);
    if (!ok && !first) first = input;
  });
  const consentErr = $('#e-consent');
  consentErr.textContent = consent.checked ? '' : 'Отметьте, что понимаете: это демо';
  if (!consent.checked && !first) first = consent;

  if (first) {
    first.focus();
    return false;
  }
  return true;
}

function bindFormChecks() {
  const form = $('#address-form');
  if (!form) return;
  const rules = {
    'f-address': (v) => v.trim().length >= 5,
    'f-name': (v) => v.trim().length >= 2,
    'f-phone': (v) => v.replace(/\D/g, '').length === 11,
  };
  form.addEventListener('input', (event) => {
    const input = event.target;
    const rule = rules[input.id];
    if (!rule) return;
    if (input.getAttribute('aria-invalid') === 'true' && rule(input.value)) fieldError(input, '');
  });
  $('#f-consent').addEventListener('change', (event) => {
    if (event.target.checked) $('#e-consent').textContent = '';
  });
}

function bindPhone() {
  const input = $('#f-phone');
  if (!input || input.dataset.bound) return;
  input.dataset.bound = '1';
  input.addEventListener('input', () => {
    let digits = input.value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits.startsWith('7')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (!digits && !input.value.trim()) { input.value = ''; return; }
    let out = '+7';
    if (digits.length) out += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 4) out += `) ${digits.slice(3, 6)}`;
    if (digits.length >= 7) out += `-${digits.slice(6, 8)}`;
    if (digits.length >= 9) out += `-${digits.slice(8, 10)}`;
    input.value = out;
    if (input.getAttribute('aria-invalid') === 'true' && digits.length === 10) fieldError(input, '');
  });
}

function submitOrder() {
  const dates = deliveryChoices();
  if (!dates.includes(state.deliveryDate)) {
    syncDeliveryCalendar(dates);
    $('#checkout-delivery').textContent = deliveryWindowLabel();
    $('#e-delivery').textContent = `Прежняя дата уже недоступна. Ближайшая доставка — ${dateLabel(state.deliveryDate)}. Проверьте дату перед подтверждением.`;
    return;
  }
  if (!validateAddress()) return;
  const payload = {
    code: (crypto.randomUUID?.() || String(Date.now())).slice(0, 8).toUpperCase(),
    date: state.deliveryDate,
    picked: state.picked,
    qty: state.qty,
    drink: state.drink,
    cutlery: state.cutlery,
    total: totals().total,
  };
  state.order = payload;
  try { sessionStorage.setItem('pm-last-order', JSON.stringify(payload)); } catch { /* ignore */ }
  state.stage = 'done';
  renderCart();
  $('#cart-title').focus();
}

/* ---------- detail ---------- */
function openDetail(cat, variant, trigger) {
  const dish = COURSES[cat].dishes[variant];
  const on = state.picked[cat] === variant;
  $('#detail-body').innerHTML = `<div class="detail">
    <div class="detail-hero"><img src="${dishPhoto(dish)}" alt="" width="440" height="380" decoding="async"></div>
    <p class="mono" style="margin-top:16px;color:var(--muted)">${COURSES[cat].name} · ${dish.weight} г</p>
    <h2 id="detail-title" tabindex="-1">${dish.name}</h2>
    <p class="detail-desc">${dish.desc}</p>
    <div class="detail-grid">
      <div class="detail-cell"><small>Калорийность</small><b>${dish.kcal} ккал</b></div>
      <div class="detail-cell"><small>Вес</small><b>${dish.weight} г</b></div>
      <div class="detail-cell" style="grid-column:1 / -1"><small>Аллергены</small><b>${dish.allergens}</b></div>
    </div>
    <p class="detail-note">Пример блюда. Состав, вес и пищевая ценность уточняются на кухне.</p>
  </div>`;
  $('#detail-foot').innerHTML = `<button class="btn btn-primary" type="button" id="detail-action">${on ? 'Убрать из обеда' : 'Добавить в обед'}${icon(on ? 'x' : 'plus')}</button>`;
  $('#detail-action').addEventListener('click', () => {
    state.picked[cat] = on ? null : variant;
    syncMenu();
    save();
    showToast(on ? `${dish.name} убрано из обеда` : `${dish.name} в обеде`, on ? () => { state.picked[cat] = variant; syncMenu(); save(); } : undefined);
    closeSheet('detail');
  });
  openSheet('detail', trigger);
}

/* ---------- scroll ---------- */
function goToCourse(index, duration) {
  const el = document.getElementById(index === COURSES.length ? 'course-drinks' : 'course-' + index);
  if (el) smoothScrollTo(el, duration);
}

function scrollSpy() {
  const sections = [...COURSES.map((_, i) => document.getElementById('course-' + i)), document.getElementById('course-drinks')];
  const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 120;
  let raf = 0;
  const update = () => {
    raf = 0;
    let active = 0;
    sections.forEach((sec, i) => { if (sec && sec.getBoundingClientRect().top <= offset) active = i; });
    $$('.rail-btn').forEach((btn, i) => {
      const on = i === active;
      btn.classList.toggle('current', on);
      if (on) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
    });
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
}

function reveals() {
  const targets = $$('.hero-copy, .hero-meal-art, .band, .course, .how-intro, .steps li, .quotes > *, .faq-intro, .faq-list article, .closing-inner');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(i % 3, 2) * 70}ms`);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach((el) => io.observe(el));
}

function clock() {
  const tick = () => {
    $('[data-countdown]').textContent = cutoffLeft();
    $$('[data-delivery-date]').forEach((el) => { el.textContent = dateLabel(deliveryDate()); });
  };
  tick();
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', tick);
}

/* ---------- events ---------- */
function bind() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      const target = href.length > 1 ? document.querySelector(href) : null;
      if (target) {
        event.preventDefault();
        smoothScrollTo(target);
        try { history.replaceState(null, '', href); } catch { /* ignore */ }
        return;
      }
    }
    const pickBtn = event.target.closest('[data-pick]');
    if (pickBtn) {
      const [cat, variant] = pickBtn.dataset.pick.split(':').map(Number);
      pick(cat, variant, pickBtn);
      return;
    }
    const more = event.target.closest('[data-more]');
    if (more) {
      const [cat, variant] = more.dataset.more.split(':').map(Number);
      openDetail(cat, variant, more);
      return;
    }
    const drink = event.target.closest('[data-drink]');
    if (drink) {
      setDrink(drink.dataset.drink, drink);
      return;
    }
    const removeSlot = event.target.closest('[data-remove-slot]');
    if (removeSlot) {
      const restoreFocus = document.activeElement === removeSlot;
      const key = removeSlot.dataset.removeSlot;
      if (key === 'drink') setDrink('none');
      else removeDish(Number(key));
      if (restoreFocus) {
        const nextButton = $('#bar-thumbs [data-remove-slot]') || $('#bar-cta');
        nextButton.focus({ preventScroll: true });
      }
      return;
    }
    const jump = event.target.closest('[data-jump]');
    if (jump) { goToCourse(Number(jump.dataset.jump)); return; }
    const goto = event.target.closest('[data-goto]');
    if (goto) {
      const i = Number(goto.dataset.goto);
      closeSheet('cart');
      setTimeout(() => goToCourse(i, 760), 220);
      return;
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      removeDish(Number(remove.dataset.remove));
      return;
    }
    const qty = event.target.closest('[data-qty]');
    if (qty) {
      state.qty = Math.min(MAX_QTY, Math.max(1, state.qty + Number(qty.dataset.qty)));
      save(); syncMenu(); renderCart();
      return;
    }
    const cutlery = event.target.closest('[data-cutlery]');
    if (cutlery) {
      state.cutlery = Math.min(MAX_QTY, Math.max(0, state.cutlery + Number(cutlery.dataset.cutlery)));
      save(); syncMenu(); renderCart();
      return;
    }
    if (event.target.closest('#cart-next')) {
      if (isComplete()) { state.stage = 'address'; renderCart(); }
      else { const first = state.picked.indexOf(null); closeSheet('cart'); setTimeout(() => goToCourse(first, 760), 220); }
      return;
    }
    if (event.target.closest('[data-back="cart"]')) { state.stage = 'cart'; renderCart(); return; }
    if (event.target.closest('[data-close-cart]')) { closeSheet('cart'); return; }

    const close = event.target.closest('[data-close]');
    if (close) { closeSheet(close.dataset.close); return; }

    if (event.target.closest('#header-cart') || event.target.closest('#bar-cta')) {
      openSheet('cart', event.target.closest('button'));
      return;
    }
    if (event.target.closest('#toast-undo')) {
      if (toastUndo) toastUndo();
      toastUndo = null;
      hideToast();
    }
  });

  $('#delivery-dates').addEventListener('change', (event) => {
    const dates = deliveryChoices();
    const date = event.target.value;
    state.deliveryDate = date;
    syncDeliveryCalendar(dates);
    $('#menu-delivery-error').textContent = dates.includes(date)
      ? ''
      : 'Прежняя дата уже недоступна. Проверьте новую дату доставки.';
    if (!event.target.isConnected) $('#delivery-dates input:checked').focus();
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'address-form') {
      event.preventDefault();
      submitOrder();
    }
  });

  $('#cart').addEventListener('click', (event) => {
    if (event.target === $('#cart')) closeSheet('cart');
  });
  $('#detail').addEventListener('click', (event) => {
    if (event.target === $('#detail')) closeSheet('detail');
  });
  ['cart', 'detail'].forEach((id) => {
    document.getElementById(id).addEventListener('cancel', (event) => {
      event.preventDefault();
      closeSheet(id);
    });
  });

  addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if ($('#cart').open) closeSheet('cart');
      else if ($('#detail').open) closeSheet('detail');
    }
  });
}

/* ---------- boot ---------- */
restore();
syncDeliveryCalendar();
renderMenu();
bind();
clock();
scrollSpy();
reveals();
$('#cart').addEventListener('close', () => { $('#orderbar').classList.remove('hidden'); });
