(function () {
  'use strict';

  const IMG = 'images/hamburger/';
  const ASSETS = {
    boy: `${IMG}boy-character-large-1x.webp`,
    girl: `${IMG}girl-character-large-1x.webp`,
    tray: `${IMG}tray.webp`,
    takeoutBag: `${IMG}takeout-bag.webp`
  };
  const SOUND_ROOT = window.location.protocol === 'file:' ? '../../sound/' : '/sound/';
  const SOUNDS = {
    queueRing: `${SOUND_ROOT}etc/freesound_community-conveniencestorering-96090.mp3`,
    queueBoardIntro: `${SOUND_ROOT}playlab-hamburger-order/queue-board-intro.mp3`,
    uiClick: `${SOUND_ROOT}etc/soundshelfstudio-ui-click.mp3`,
    introGreeting: `${SOUND_ROOT}playlab-hamburger-order/intro-greeting.mp3`,
    boyMapPrompt: `${SOUND_ROOT}playlab-hamburger-order/boy-map-prompt.mp3`,
    girlMapPrompt: `${SOUND_ROOT}playlab-hamburger-order/girl-map-prompt.mp3`,
    boyWrongPlace: `${SOUND_ROOT}playlab-hamburger-order/boy-wrong-place.mp3`,
    girlWrongPlace: `${SOUND_ROOT}playlab-hamburger-order/girl-wrong-place.mp3`,
    boyArrival: `${SOUND_ROOT}playlab-hamburger-order/boy-arrival.mp3`,
    girlArrival: `${SOUND_ROOT}playlab-hamburger-order/girl-arrival.mp3`,
    success: `${SOUND_ROOT}playlab-hamburger-order/success.mp3`
  };
  const CHARACTER_NAMES = {
    boy: '이준',
    girl: '서아'
  };

  const CATEGORIES = ['추천', '런치타임', '버거세트', '버거', '디저트', '음료'];
  const DEFAULT_DRINK = '콜라';
  const DEFAULT_SEASONING = '어니언';
  const DRINK_OPTIONS = [
    { name: '콜라', image: `${IMG}cola-1x.webp` },
    { name: '사이다', image: `${IMG}cider-1x.webp` },
    { name: '콜라 제로', image: `${IMG}zero-cola-1x.webp` },
    { name: '사이다 제로', image: `${IMG}zero-cider-1x.webp` }
  ];
  const SEASONING_OPTIONS = ['어니언', '치즈', '칠리'];
  const MENU = [
    ['버거세트', '데리버거 세트', 'deri-burger-set-1x.webp', 6100, true],
    ['버거세트', '더블데리버거 세트', 'double-deri-burger-set-1x.webp', 7300, true],
    ['버거세트', '치킨버거 세트', 'chicken-burger-set-1x.webp', 6700, true],
    ['버거세트', '더블 치킨버거 세트', 'double-chicken-burger-set-1x.webp', 7600, true],
    ['버거세트', '하하 불고기 세트', 'haha-bulgogi-set-1x.webp', 7300, true],
    ['버거세트', '하하 불고기 베이컨 세트', 'haha-bulgogi-bacon-set-1x.webp', 8300, true],
    ['버거세트', '하하 새우 세트', 'haha-shrimp-set-1x.webp', 7300, true],
    ['버거세트', '하하 새우 베이컨 세트', 'haha-shrimp-bacon-set-1x.webp', 8300, true],
    ['버거세트', '하하 사각새우더블 세트', 'haha-square-shrimp-double-set-1x.webp', 8300, true],
    ['버거세트', '핫크리스피치킨버거 세트', 'hot-crispy-chicken-burger-set-1x.webp', 8300, true],
    ['버거세트', '클래식 치즈버거 세트', 'classic-cheese-burger-set-1x.webp', 7700, true],
    ['버거세트', '더블 클래식치즈버거 세트', 'double-classic-cheese-burger-set-1x.webp', 9400, true],
    ['버거세트', '모짜렐라 인 더 버거 베이컨 세트', 'mozzarella-bacon-burger-set-1x.webp', 10000, true],
    ['버거세트', '한우불고기버거 세트', 'hanwoo-bulgogi-burger-set-1x.webp', 10900, true],
    ['버거', '데리버거', 'deri-burger-1x.webp', 3700],
    ['버거', '더블데리버거', 'double-deri-burger-1x.webp', 5000],
    ['버거', '치킨버거', 'chicken-burger-1x.webp', 4300],
    ['버거', '더블 치킨버거', 'double-chicken-burger-1x.webp', 5800],
    ['버거', '하하불고기', 'haha-bulgogi-burger-1x.webp', 5000],
    ['버거', '하하불고기 더블', 'haha-bulgogi-double-burger-1x.webp', 7600],
    ['버거', '하하 불고기 베이컨', 'haha-bulgogi-bacon-burger-1x.webp', 6100],
    ['버거', '하하새우', 'haha-shrimp-burger-1x.webp', 5000],
    ['버거', '하하 새우 베이컨', 'haha-shrimp-bacon-burger-1x.webp', 6100],
    ['버거', '하하 사각새우더블', 'haha-square-shrimp-double-burger-1x.webp', 6100],
    ['버거', '핫크리스피치킨버거', 'hot-crispy-chicken-burger-1x.webp', 6200],
    ['버거', '클래식 치즈버거', 'classic-cheese-burger-1x.webp', 5500],
    ['버거', '더블X2', 'double-x2-burger-1x.webp', 7200],
    ['버거', '번트비프버거', 'burnt-beef-burger-1x.webp', 6900],
    ['버거', '한우불고기버거', 'hanwoo-bulgogi-burger-1x.webp', 9000],
    ['버거', '더블 한우불고기버거', 'double-hanwoo-bulgogi-burger-1x.webp', 13000],
    ['디저트', '포테이토', 'potato-1x.webp', 2000],
    ['디저트', '양념감자', 'seasoned-potato-1x.webp', 2600],
    ['디저트', '치즈스틱', 'cheese-stick-1x.webp', 2800],
    ['디저트', '롱치즈스틱', 'long-cheese-stick-1x.webp', 2400],
    ['디저트', '치킨너겟', 'chicken-nugget-1x.webp', 3100],
    ['디저트', '오징어링', 'squid-ring-1x.webp', 2800],
    ['디저트', '화이어윙', 'fire-wing-1x.webp', 3200],
    ['디저트', '선데이아이스크림', 'sundae-icecream-1x.webp', 2300],
    ['디저트', '소프트아이스크림', 'soft-icecream-1x.webp', 1300],
    ['음료', '콜라', 'cola-1x.webp', 2000],
    ['음료', '콜라 제로', 'zero-cola-1x.webp', 2000],
    ['음료', '사이다', 'cider-1x.webp', 2000],
    ['음료', '사이다 제로', 'zero-cider-1x.webp', 2000],
    ['음료', '바닐라쉐이크', 'vanilla-shake-1x.webp', 2100]
  ].map(([category, name, file, price, isSet]) => ({
    id: slug(name),
    category,
    name,
    fileName: file,
    image: IMG + file,
    price,
    isSet: Boolean(isSet)
  }));

  const els = {};
  const audioCache = {};
  let narrationAudio = null;
  let completionAudio = null;
  const state = {
    screen: 'introView',
    gender: 'boy',
    category: '추천',
    recommendationIds: [],
    cart: new Map(),
    orderMode: '',
    setOptions: [],
    seasonedPotatoOptions: [],
    nextOptionId: 1,
    ticket: '',
    readyNumbers: [],
    preparingNumbers: [],
    queueTimer: 0,
    readyRemoveTimers: [],
    nextQueueNumber: 0,
    paymentTimer: 0,
    savedRecordId: '',
    startedAtMs: Date.now(),
    wrongPlaceCount: 0,
    wrongPickupCount: 0,
    lunchIds: [],
    soldOutId: '',
    clientName: ''
  };

  function slug(value) {
    return String(value).normalize('NFC').replace(/\s+/g, '-').replace(/[^\w가-힣-]/g, '').toLowerCase();
  }

  function won(value) {
    return `${Number(value || 0).toLocaleString('ko-KR')}원`;
  }

  function dateKey(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function hourKey(date) {
    return `${dateKey(date)}-${String(date.getHours()).padStart(2, '0')}`;
  }

  function hashString(value) {
    let hash = 2166136261;
    String(value).split('').forEach((char) => {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    });
    return hash >>> 0;
  }

  function seededShuffle(items, seedText) {
    const next = items.slice();
    let seed = hashString(seedText) || 1;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

  function isLunchTime(date) {
    const minutes = date.getHours() * 60 + date.getMinutes();
    return minutes >= (10 * 60 + 30) && minutes < (14 * 60);
  }

  function refreshTimedOffers(now) {
    const date = now || new Date();
    state.lunchIds = seededShuffle(
      MENU.filter((item) => item.isSet),
      `lunch-${dateKey(date)}`
    ).slice(0, 8).map((item) => item.id);
    const soldOutCandidates = MENU.filter((item) => (
      item.category === '버거세트' ||
      item.category === '버거' ||
      (item.category === '디저트' && /치즈스틱|아이스크림/.test(item.name))
    ));
    state.soldOutId = seededShuffle(soldOutCandidates, `soldout-${hourKey(date)}`)[0]?.id || '';
  }

  function isLunchItem(item) {
    return Boolean(item && state.lunchIds.includes(item.id));
  }

  function lunchPrice(item) {
    return Math.max(0, Number(item.price || 0) - 1500);
  }

  function itemPrice(item) {
    return isLunchTime(new Date()) && isLunchItem(item) ? lunchPrice(item) : item.price;
  }

  function isSoldOut(item) {
    return Boolean(item && item.id === state.soldOutId);
  }

  function readStoredJson(storage, key) {
    if (!storage || !key) return null;
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function getQueryValue(name) {
    try {
      return String(new URLSearchParams(window.location.search || '').get(name) || '').trim();
    } catch (_error) {
      return '';
    }
  }

  function resolveLaunchClientName() {
    const launchKey = getQueryValue('labLaunchKey');
    const launchPayload = readStoredJson(window.sessionStorage, launchKey)
      || readStoredJson(window.localStorage, launchKey)
      || {};
    return String(
      getQueryValue('clientName') ||
      getQueryValue('client_name') ||
      launchPayload.clientName ||
      launchPayload.client_name ||
      ''
    ).replace(/\s+/g, ' ').trim();
  }

  function getGenderDisplayName(gender) {
    return state.clientName || CHARACTER_NAMES[gender] || '';
  }

  function renderGenderNames() {
    document.querySelectorAll('[data-gender-name]').forEach((element) => {
      const gender = element.getAttribute('data-gender-name') || '';
      element.textContent = getGenderDisplayName(gender);
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function initEls() {
    [
      'statusChip', 'restartButton', 'helpButton', 'helpModal', 'helpCloseButton', 'introStartButton', 'mapFeedback',
      'mapCharacter', 'arrivalCharacter', 'goKioskButton', 'categoryNav', 'categoryLabel', 'categoryTitle',
      'productGrid', 'scrollUpButton', 'scrollDownButton', 'cartItems', 'cartTotal',
      'checkoutButton', 'optionScrollArea', 'optionScrollUpButton', 'optionScrollDownButton', 'setOptionList', 'seasonedPotatoOptionList',
      'optionReceiptItems', 'optionSummaryText', 'optionTotal', 'optionBackButton', 'optionConfirmButton',
      'receiptItems', 'optionSummary', 'payTotal', 'backToMenuButton', 'cardPayButton',
      'paymentAnimation', 'readyNumbers', 'preparingNumbers', 'myTicketNumber', 'pickupButton',
      'completeSceneImage',
      'trayItems', 'completeSummary'
    ].forEach((id) => {
      els[id] = $(id);
    });
    els.screens = Array.from(document.querySelectorAll('.hamburger-screen'));
  }

  function showScreen(id, options) {
    if (!(options && options.keepNarration === true)) stopNarrationAudio();
    state.screen = id;
    els.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === id));
    document.querySelector('.hamburger-shell')?.classList.toggle('is-intro', id === 'introView');
    const labels = {
      introView: '시작',
      genderView: '성별 선택',
      mapView: '목적지 찾기',
      arrivalView: '가게 도착',
      kioskIntroView: '키오스크 선택',
      menuView: '메뉴 고르기',
      optionView: '옵션 선택',
      payView: '결제 확인',
      queueView: '번호표 확인',
      completeView: '학습 완료'
    };
    if (els.statusChip) els.statusChip.textContent = labels[id] || '진행중';
  }

  function pickRecommendations() {
    refreshTimedOffers();
    const sets = MENU.filter((item) => item.category === '버거세트');
    state.recommendationIds = shuffle(sets).slice(0, 6).map((item) => item.id);
  }

  function shuffle(items) {
    const next = items.slice();
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  }

  function getVisibleProducts() {
    if (state.category === '추천') {
      return state.recommendationIds.map((id) => MENU.find((item) => item.id === id)).filter(Boolean);
    }
    if (state.category === '런치타임') {
      return state.lunchIds.map((id) => MENU.find((item) => item.id === id)).filter(Boolean);
    }
    return MENU.filter((item) => item.category === state.category);
  }

  function productCardHtml(item, options) {
    const mode = options?.mode || 'regular';
    const lunch = mode === 'lunch';
    const lunchOpen = isLunchTime(new Date());
    const soldOut = isSoldOut(item);
    const unavailable = soldOut || (lunch && !lunchOpen);
    const classes = [
      'product-card',
      lunch ? 'is-lunch' : '',
      soldOut ? 'is-sold-out' : '',
      lunch && !lunchOpen ? 'is-unavailable' : ''
    ].filter(Boolean).join(' ');
    const badge = soldOut ? '품절' : (lunch && !lunchOpen ? '구매불가' : (lunch ? '런치할인' : ''));
    const priceHtml = lunch
      ? `<div class="product-price product-price-sale"><span>${won(item.price)}</span><strong>${won(lunchPrice(item))}</strong></div>`
      : `<div class="product-price">${won(itemPrice(item))}</div>`;
    return [
      `<button type="button" class="${classes}" data-product-id="${escapeHtml(item.id)}" ${unavailable ? 'disabled aria-disabled="true"' : ''}>`,
      `  <span class="product-badge">${escapeHtml(badge)}</span>`,
      `  <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`,
      `  <div class="product-name">${escapeHtml(item.name)}</div>`,
      priceHtml,
      '</button>'
    ].join('');
  }

  function productSectionHtml(title, subtitle, items, options) {
    return [
      '<section class="product-section">',
      `  <div class="product-section-head"><h3>${escapeHtml(title)}</h3>${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ''}</div>`,
      '  <div class="product-section-grid">',
      items.map((item) => productCardHtml(item, options)).join(''),
      '  </div>',
      '</section>'
    ].join('');
  }

  function renderCategories() {
    els.categoryNav.innerHTML = CATEGORIES.map((category) => (
      `<button type="button" class="category-button${category === state.category ? ' is-active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    )).join('');
    els.categoryNav.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.getAttribute('data-category') || '추천';
        if (category === '추천') pickRecommendations();
        state.category = category;
        resetProductScroll();
        renderMenu();
        resetProductScroll();
      });
    });
  }

  function resetProductScroll() {
    if (!els.productGrid) return;
    els.productGrid.scrollTop = 0;
    window.requestAnimationFrame(() => {
      if (els.productGrid) els.productGrid.scrollTop = 0;
    });
  }

  function renderMenu() {
    refreshTimedOffers();
    renderCategories();
    if (els.categoryLabel) els.categoryLabel.textContent = state.category;
    if (els.categoryTitle) {
      if (state.category === '추천') els.categoryTitle.textContent = '오늘의 추천 세트';
      else if (state.category === '런치타임') els.categoryTitle.textContent = '런치타임 할인 세트';
      else els.categoryTitle.textContent = `${state.category} 메뉴`;
    }
    const products = getVisibleProducts();
    const cardMode = state.category === '런치타임' ? 'lunch' : 'regular';
    els.productGrid.innerHTML = products.map((item) => productCardHtml(item, { mode: cardMode })).join('');
    els.productGrid.querySelectorAll('[data-product-id]').forEach((button) => {
      button.addEventListener('click', () => addToCart(button.getAttribute('data-product-id') || ''));
    });
  }

  function addToCart(id) {
    const item = MENU.find((product) => product.id === id);
    if (!item || isSoldOut(item)) return;
    const count = Number(state.cart.get(id) || 0) + 1;
    state.cart.set(id, count);
    if (item.isSet) {
      state.setOptions.push({ id: createOptionId('set'), productId: id, largePotato: false, drink: DEFAULT_DRINK });
    }
    if (isSeasonedPotato(item)) {
      state.seasonedPotatoOptions.push({ id: createOptionId('seasoned'), productId: id, flavor: DEFAULT_SEASONING });
    }
    renderCart();
  }

  function removeFromCart(id) {
    const count = Number(state.cart.get(id) || 0);
    const item = MENU.find((product) => product.id === id);
    if (count <= 1) state.cart.delete(id);
    else state.cart.set(id, count - 1);
    if (item && item.isSet) removeLastOption(state.setOptions, id);
    if (item && isSeasonedPotato(item)) removeLastOption(state.seasonedPotatoOptions, id);
    renderCart();
  }

  function createOptionId(prefix) {
    const id = `${prefix}-${state.nextOptionId}`;
    state.nextOptionId += 1;
    return id;
  }

  function isSeasonedPotato(item) {
    return Boolean(item && item.category === '디저트' && item.name === '양념감자');
  }

  function removeLastOption(list, productId) {
    const index = list.map((option) => option.productId).lastIndexOf(productId);
    if (index >= 0) list.splice(index, 1);
  }

  function cartEntries() {
    return Array.from(state.cart.entries()).map(([id, qty]) => {
      const item = MENU.find((product) => product.id === id);
      return item ? { item, qty } : null;
    }).filter(Boolean);
  }

  function hasSet() {
    return cartEntries().some(({ item }) => item.isSet);
  }

  function hasConfigurableOptions() {
    return state.setOptions.length > 0 || state.seasonedPotatoOptions.length > 0;
  }

  function subtotal() {
    return cartEntries().reduce((sum, { item, qty }) => sum + (itemPrice(item) * qty), 0);
  }

  function optionPrice() {
    return state.setOptions.reduce((sum, option) => sum + (option.largePotato ? 500 : 0), 0);
  }

  function totalPrice() {
    return subtotal() + optionPrice();
  }

  function renderCart() {
    const entries = cartEntries();
    if (!entries.length) {
      els.cartItems.textContent = '담은 메뉴가 없습니다.';
    } else {
      els.cartItems.innerHTML = entries.map(({ item, qty }) => [
        `<button type="button" class="cart-item" data-cart-id="${escapeHtml(item.id)}">`,
        `  <span>${escapeHtml(item.name)} × ${qty}</span>`,
        `  <strong>${won(itemPrice(item) * qty)}</strong>`,
        '</button>'
      ].join('')).join('');
      els.cartItems.querySelectorAll('[data-cart-id]').forEach((button) => {
        button.addEventListener('click', () => removeFromCart(button.getAttribute('data-cart-id') || ''));
      });
    }
    if (els.cartTotal) els.cartTotal.textContent = won(subtotal());
  }

  function renderReceipt() {
    const entries = cartEntries();
    els.receiptItems.innerHTML = receiptRowsHtml(entries);
    els.optionSummary.innerHTML = '';
    els.payTotal.textContent = won(totalPrice());
  }

  function renderOptionPanel() {
    const entries = cartEntries();
    if (els.optionReceiptItems) {
      els.optionReceiptItems.innerHTML = receiptRowsHtml(entries);
    }
    renderSetOptionList();
    renderSeasonedPotatoOptionList();
    if (els.optionSummaryText) els.optionSummaryText.innerHTML = '';
    if (els.optionTotal) els.optionTotal.textContent = won(totalPrice());
  }

  function receiptRowsHtml(entries) {
    return entries.map(({ item, qty }) => {
      const rows = [
        `<div class="receipt-line receipt-line-main"><span>${escapeHtml(item.name)} × ${qty}</span><strong>${won(itemPrice(item) * qty)}</strong></div>`
      ];
      if (item.isSet) {
        const options = state.setOptions.filter((option) => option.productId === item.id).slice(0, qty);
        options.forEach((option, optionIndex) => {
          const label = qty > 1 ? `세트 ${optionIndex + 1}` : '세트 옵션';
          rows.push(`<div class="receipt-option-line"><span>${label} · 음료 ${escapeHtml(option.drink)}</span><strong>0원</strong></div>`);
          rows.push(`<div class="receipt-option-line"><span>${label} · ${option.largePotato ? '포테이토 라지' : '포테이토 기본'}</span><strong>${option.largePotato ? '+500원' : '0원'}</strong></div>`);
        });
      }
      if (isSeasonedPotato(item)) {
        const options = state.seasonedPotatoOptions.filter((option) => option.productId === item.id).slice(0, qty);
        options.forEach((option, optionIndex) => {
          const label = qty > 1 ? `양념감자 ${optionIndex + 1}` : '양념감자';
          rows.push(`<div class="receipt-option-line"><span>${label} · ${escapeHtml(option.flavor)} 시즈닝</span><strong>0원</strong></div>`);
        });
      }
      return `<div class="receipt-group">${rows.join('')}</div>`;
    }).join('');
  }

  function optionSummaryText() {
    const parts = [];
    state.setOptions.forEach((option, index) => {
      parts.push(`세트 ${index + 1}: ${option.largePotato ? '포테이토 라지 +500원' : '포테이토 기본'} · 음료 ${option.drink}`);
    });
    state.seasonedPotatoOptions.forEach((option, index) => {
      parts.push(`양념감자 ${index + 1}: ${option.flavor}`);
    });
    return parts.join(' / ');
  }

  function renderSetOptionList() {
    if (!els.setOptionList) return;
    if (!state.setOptions.length) {
      els.setOptionList.innerHTML = '';
      return;
    }
    els.setOptionList.innerHTML = [
      '<section class="option-section">',
      '  <h3>세트 메뉴 옵션</h3>',
      state.setOptions.map((option, index) => {
        const item = MENU.find((product) => product.id === option.productId);
        return [
          '<article class="per-item-option-card">',
          `  <div class="option-card-head"><span>세트 ${index + 1}</span><strong>${escapeHtml(item ? item.name : '세트 메뉴')}</strong></div>`,
          `  <label class="kiosk-option-button is-compact"><input type="checkbox" data-set-option-id="${escapeHtml(option.id)}" ${option.largePotato ? 'checked' : ''}><span>포테이토 라지</span><strong>+500원</strong></label>`,
          `  <div class="drink-options is-compact" role="group" aria-label="세트 ${index + 1} 음료 선택">`,
          DRINK_OPTIONS.map((drink) => [
            `    <button type="button" class="drink-choice is-compact${drink.name === option.drink ? ' is-selected' : ''}" data-set-option-id="${escapeHtml(option.id)}" data-drink="${escapeHtml(drink.name)}">`,
            `      <img src="${escapeHtml(drink.image)}" alt="">`,
            `      <span>${escapeHtml(drink.name)}</span>`,
            '    </button>'
          ].join('')).join(''),
          '  </div>',
          '</article>'
        ].join('');
      }).join(''),
      '</section>'
    ].join('');
    els.setOptionList.querySelectorAll('[data-set-option-id][type="checkbox"]').forEach((input) => {
      input.addEventListener('change', () => {
        const option = state.setOptions.find((entry) => entry.id === input.getAttribute('data-set-option-id'));
        if (!option) return;
        option.largePotato = Boolean(input.checked);
        renderOptionPanel();
      });
    });
    els.setOptionList.querySelectorAll('[data-drink][data-set-option-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const option = state.setOptions.find((entry) => entry.id === button.getAttribute('data-set-option-id'));
        if (!option) return;
        option.drink = button.getAttribute('data-drink') || DEFAULT_DRINK;
        renderOptionPanel();
      });
    });
  }

  function renderSeasonedPotatoOptionList() {
    if (!els.seasonedPotatoOptionList) return;
    if (!state.seasonedPotatoOptions.length) {
      els.seasonedPotatoOptionList.innerHTML = '';
      return;
    }
    els.seasonedPotatoOptionList.innerHTML = [
      '<section class="option-section">',
      '  <h3>양념감자 맛 선택</h3>',
      state.seasonedPotatoOptions.map((option, index) => [
        '<article class="per-item-option-card seasoning-card">',
        `  <div class="option-card-head"><span>양념감자 ${index + 1}</span><strong>맛을 선택하세요</strong></div>`,
        '  <div class="seasoning-options" role="group" aria-label="양념감자 맛 선택">',
        SEASONING_OPTIONS.map((flavor) => (
          `    <button type="button" class="seasoning-choice${flavor === option.flavor ? ' is-selected' : ''}" data-seasoned-option-id="${escapeHtml(option.id)}" data-flavor="${escapeHtml(flavor)}">${escapeHtml(flavor)}</button>`
        )).join(''),
        '  </div>',
        '</article>'
      ].join('')).join(''),
      '</section>'
    ].join('');
    els.seasonedPotatoOptionList.querySelectorAll('[data-flavor][data-seasoned-option-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const option = state.seasonedPotatoOptions.find((entry) => entry.id === button.getAttribute('data-seasoned-option-id'));
        if (!option) return;
        option.flavor = button.getAttribute('data-flavor') || DEFAULT_SEASONING;
        renderOptionPanel();
      });
    });
  }

  function renderTray() {
    const isTakeout = state.orderMode === '포장주문';
    if (els.completeSceneImage) {
      els.completeSceneImage.src = isTakeout ? ASSETS.takeoutBag : ASSETS.tray;
      els.completeSceneImage.alt = isTakeout ? '포장 봉투' : '쟁반';
    }
    if (isTakeout) {
      els.trayItems.innerHTML = '';
      els.trayItems.style.removeProperty('--tray-item-size');
      els.trayItems.style.removeProperty('--tray-cols');
      els.trayItems.style.removeProperty('--tray-rows');
      return;
    }
    const trayItems = cartEntries().flatMap(({ item, qty }) => Array.from({ length: qty }, () => item));
    const count = Math.max(1, trayItems.length);
    const cols = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(count))));
    const rows = Math.max(1, Math.ceil(count / cols));
    const itemSize = Math.max(82, Math.min(228, Math.round((430 / Math.ceil(Math.sqrt(count))) * 1.2)));
    els.trayItems.style.setProperty('--tray-item-size', `${itemSize}px`);
    els.trayItems.style.setProperty('--tray-cols', String(cols));
    els.trayItems.style.setProperty('--tray-rows', String(rows));
    els.trayItems.innerHTML = trayItems.map((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const rotate = ((index % 5) - 2) * 5;
      return `<img class="tray-item" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" style="--tray-col:${col};--tray-row:${row};--tray-rotate:${rotate}deg;">`;
    }).join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setDialogueText(element, value) {
    if (!element) return;
    element.textContent = value;
  }

  function setDialogueLines(element, lines) {
    if (!element) return;
    element.innerHTML = lines.map((line) => escapeHtml(line)).join('<br>');
  }

  function wrongPlace() {
    state.wrongPlaceCount += 1;
    setDialogueLines(els.mapFeedback, ['햄버거집이 아니야.', '햄버거집으로 가자!']);
    playGenderNarration('wrongPlace');
    vibrate([80, 35, 80]);
  }

  function setCharacterImages() {
    const src = state.gender === 'girl' ? ASSETS.girl : ASSETS.boy;
    const label = `${getGenderDisplayName(state.gender) || '캐릭터'} 캐릭터`;
    if (els.mapCharacter) {
      els.mapCharacter.src = src;
      els.mapCharacter.alt = label;
    }
    if (els.arrivalCharacter) {
      els.arrivalCharacter.src = src;
      els.arrivalCharacter.alt = label;
    }
  }

  function arriveStore() {
    setCharacterImages();
    showScreen('arrivalView');
    playGenderNarration('arrival');
  }

  function startPayment() {
    if (!cartEntries().length) {
      if (els.cartItems) els.cartItems.textContent = '메뉴를 먼저 담아 주세요.';
      vibrate([80, 35, 80]);
      return;
    }
    if (hasConfigurableOptions()) {
      renderOptionPanel();
      showScreen('optionView');
      return;
    }
    showPaymentReview();
  }

  function showPaymentReview() {
    window.clearTimeout(state.paymentTimer);
    $('payView')?.classList.remove('is-card-paying');
    renderReceipt();
    els.paymentAnimation?.classList.remove('is-active');
    showScreen('payView');
  }

  function beginCardPayment() {
    window.clearTimeout(state.paymentTimer);
    renderReceipt();
    $('payView')?.classList.add('is-card-paying');
    els.paymentAnimation?.classList.remove('is-active');
    showScreen('payView');
    window.requestAnimationFrame(() => {
      ensurePaymentAnimation();
      els.paymentAnimation?.classList.add('is-active');
      state.paymentTimer = window.setTimeout(startQueue, 1800);
    });
  }

  function generateTicket() {
    return String(100 + Math.floor(Math.random() * 800));
  }

  function startQueue() {
    $('payView')?.classList.remove('is-card-paying');
    state.ticket = generateTicket();
    const base = Number(state.ticket);
    const aheadCount = 1 + Math.floor(Math.random() * 5);
    const ahead = Array.from({ length: aheadCount }, (_, index) => String(Math.max(101, base - aheadCount + index)));
    const behind = Array.from({ length: 5 }, (_, index) => String(base + index + 1));
    state.readyNumbers = [];
    state.preparingNumbers = ahead.concat([state.ticket], behind);
    state.nextQueueNumber = base + behind.length + 1;
    renderQueue();
    window.clearTimeout(state.queueTimer);
    scheduleQueueTick();
    showScreen('queueView');
    playAudio('queueBoardIntro');
  }

  function randomQueueDelay() {
    return 5000 + Math.floor(Math.random() * 3001);
  }

  function scheduleQueueTick() {
    window.clearTimeout(state.queueTimer);
    state.queueTimer = window.setTimeout(tickQueue, randomQueueDelay());
  }

  function tickQueue() {
    if (!state.preparingNumbers.length) return;
    const next = state.preparingNumbers.shift();
    state.readyNumbers.push(next);
    state.preparingNumbers.push(String(state.nextQueueNumber));
    state.nextQueueNumber += 1;
    playQueueRingSound();
    renderQueue();
    if (next !== state.ticket) {
      const timer = window.setTimeout(() => {
        state.readyNumbers = state.readyNumbers.filter((number) => number !== next);
        renderQueue();
      }, 3000);
      state.readyRemoveTimers.push(timer);
    }
    scheduleQueueTick();
  }

  function renderQueue() {
    els.myTicketNumber.textContent = state.ticket || '000';
    els.readyNumbers.innerHTML = state.readyNumbers.map((number) => `<span class="order-number">${escapeHtml(number)}</span>`).join('');
    els.preparingNumbers.innerHTML = state.preparingNumbers.map((number) => `<span class="order-number">${escapeHtml(number)}</span>`).join('');
  }

  function pickup() {
    if (!state.readyNumbers.includes(state.ticket)) {
      state.wrongPickupCount += 1;
      document.querySelector('.queue-panel')?.classList.add('is-wrong');
      setTimeout(() => document.querySelector('.queue-panel')?.classList.remove('is-wrong'), 740);
      vibrate([120, 45, 120]);
      return;
    }
    window.clearTimeout(state.queueTimer);
    state.readyRemoveTimers.forEach((timer) => window.clearTimeout(timer));
    state.readyRemoveTimers = [];
    renderTray();
    saveCompletion();
    state.readyNumbers = state.readyNumbers.filter((number) => number !== state.ticket);
    state.ticket = '';
    renderQueue();
    showScreen('completeView');
    showSuccessAndGoHome();
  }

  function saveCompletion() {
    if (state.savedRecordId) return;
    const entries = cartEntries();
    const completedAt = Date.now();
    const payload = {
      labKind: 'playlab',
      reportScope: 'playlab',
      saveToClientReport: true,
      labTitle: '햄버거를 주문해요',
      title: '햄버거를 주문해요',
      stageTitle: '키오스크 주문과 번호표 확인',
      stageKey: 'hamburger-order',
      reportType: 'playlab-hamburger-order',
      totalQuestions: 5,
      correctCount: Math.max(0, 5 - state.wrongPlaceCount - state.wrongPickupCount),
      wrongCount: state.wrongPlaceCount + state.wrongPickupCount,
      score: Math.max(0, Math.round(((5 - state.wrongPlaceCount - state.wrongPickupCount) / 5) * 100)),
      startedAtMs: state.startedAtMs,
      durationSeconds: Math.max(1, Math.round((completedAt - state.startedAtMs) / 1000)),
      focusKey: 'daily-ordering',
      focusLabel: '생활 주문 순서와 번호표 확인',
      summary: '지도에서 햄버거 가게를 찾고, 키오스크로 메뉴를 담아 결제한 뒤 번호표를 확인했습니다.',
      guardianSummary: '햄버거 주문 상황에서 목적지 찾기, 메뉴 선택, 장바구니 조절, 결제, 번호표 확인 순서를 연습했습니다.',
      teacherReviewNote: '오답 장소 선택과 번호표 확인 오류를 함께 보면 생활 상황 이해와 대기 규칙 이해 수준을 참고할 수 있습니다.',
      actionPlanSummary: '다음 활동에서는 실제 매장 사진이나 역할놀이와 연결해 주문 문장을 더 자연스럽게 확장할 수 있습니다.',
      details: {
        ordered_items: entries.map(({ item, qty }) => ({ name: item.name, qty, price: itemPrice(item), regular_price: item.price, is_set: item.isSet })),
        order_mode: state.orderMode,
        set_options: state.setOptions.map((option, index) => {
          const item = MENU.find((product) => product.id === option.productId);
          return {
            index: index + 1,
            item_name: item ? item.name : '',
            large_potato: option.largePotato,
            drink: option.drink
          };
        }),
        seasoned_potato_options: state.seasonedPotatoOptions.map((option, index) => ({
          index: index + 1,
          item_name: '양념감자',
          flavor: option.flavor
        })),
        total_price: totalPrice(),
        ticket: state.ticket,
        wrong_place_count: state.wrongPlaceCount,
        wrong_pickup_count: state.wrongPickupCount
      }
    };
    let record = null;
    if (window.HahaLabLearningHarness && typeof window.HahaLabLearningHarness.recordSession === 'function') {
      record = window.HahaLabLearningHarness.recordSession(payload);
    }
    state.savedRecordId = record && record.id ? record.id : `hamburger-${Date.now()}`;
    document.dispatchEvent(new CustomEvent('hahalab:playlab-event', {
      detail: {
        type: 'study-complete',
        labKind: 'playlab',
        contentId: 'playlab-hamburger-order',
        title: '키오스크로 햄버거를 주문해요',
        payload
      }
    }));
    window.dispatchEvent(new CustomEvent('study-complete', { detail: payload }));
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_error) {}
  }

  function getAudio(key) {
    if (!audioCache[key]) {
      const audio = new Audio(SOUNDS[key]);
      audio.preload = 'auto';
      audioCache[key] = audio;
    }
    return audioCache[key];
  }

  function playAudio(key, fallback) {
    try {
      const audio = getAudio(key);
      audio.pause();
      audio.currentTime = 0;
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {
          if (typeof fallback === 'function') fallback();
        });
      }
    } catch (_error) {
      if (typeof fallback === 'function') fallback();
    }
  }

  function stopAudio(audio) {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_error) {}
  }

  function stopNarrationAudio() {
    stopAudio(narrationAudio);
    narrationAudio = null;
  }

  function playNarration(key) {
    stopNarrationAudio();
    try {
      const audio = getAudio(key);
      narrationAudio = audio;
      audio.pause();
      audio.currentTime = 0;
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') playResult.catch(() => {});
    } catch (_error) {}
  }

  function playGenderNarration(kind) {
    const prefix = state.gender === 'girl' ? 'girl' : 'boy';
    const key = `${prefix}${kind.charAt(0).toUpperCase()}${kind.slice(1)}`;
    playNarration(key);
  }

  function showSuccessAndGoHome() {
    const overlay = window.HahaFeedbackOverlay || window.PlaylabFeedbackOverlay;
    if (overlay && typeof overlay.showQuestionComplete === 'function') {
      overlay.showQuestionComplete('correct', { sound: false, durationMs: 1800 });
    } else if (overlay && typeof overlay.correct === 'function') {
      overlay.correct({ sound: false, durationMs: 1800 });
    }
    playCompletionAudioAndGoHome();
  }

  function playCompletionAudioAndGoHome() {
    try {
      completionAudio = getAudio('success');
      completionAudio.pause();
      completionAudio.currentTime = 0;
      completionAudio.onended = goHome;
      const playResult = completionAudio.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => window.setTimeout(goHome, 1600));
      }
    } catch (_error) {
      window.setTimeout(goHome, 1600);
    }
  }

  function goHome() {
    window.location.href = '../class-new.html';
  }

  function ensurePaymentAnimation() {
    if (!els.paymentAnimation || els.paymentAnimation.querySelector('dotlottie-wc')) return;
    const src = els.paymentAnimation.getAttribute('data-lottie-src');
    if (!src) return;
    const player = document.createElement('dotlottie-wc');
    player.setAttribute('src', src);
    player.setAttribute('autoplay', '');
    player.setAttribute('loop', '');
    els.paymentAnimation.appendChild(player);
  }

  function playUiClickSound() {
    playAudio('uiClick');
  }

  function playQueueRingSound() {
    playAudio('queueRing', beep);
  }

  function beep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.24);
      setTimeout(() => ctx.close().catch(() => {}), 400);
    } catch (_error) {}
  }

  function restart() {
    window.clearTimeout(state.queueTimer);
    state.readyRemoveTimers.forEach((timer) => window.clearTimeout(timer));
    state.readyRemoveTimers = [];
    window.clearTimeout(state.paymentTimer);
    stopNarrationAudio();
    $('payView')?.classList.remove('is-card-paying');
    state.gender = 'boy';
    state.category = '추천';
    state.cart.clear();
    state.orderMode = '';
    state.setOptions = [];
    state.seasonedPotatoOptions = [];
    state.nextOptionId = 1;
    state.ticket = '';
    state.readyNumbers = [];
    state.preparingNumbers = [];
    state.nextQueueNumber = 0;
    state.savedRecordId = '';
    state.startedAtMs = Date.now();
    state.wrongPlaceCount = 0;
    state.wrongPickupCount = 0;
    state.clientName = resolveLaunchClientName();
    renderGenderNames();
    setDialogueText(els.mapFeedback, '햄버거집이 어디있을까요?');
    setCharacterImages();
    pickRecommendations();
    renderMenu();
    renderCart();
    showIntro();
  }

  function showIntro() {
    showScreen('introView');
    playNarration('introGreeting');
  }

  function bindEvents() {
    document.addEventListener('click', stopNarrationOnButtonClick, true);
    document.addEventListener('click', handleKioskClickSound, true);
    els.introStartButton?.addEventListener('click', () => showScreen('genderView'));
    document.querySelectorAll('[data-gender]').forEach((button) => {
      button.addEventListener('click', () => {
        state.gender = button.getAttribute('data-gender') || 'boy';
        setCharacterImages();
        setDialogueText(els.mapFeedback, '햄버거집이 어디있을까요?');
        showScreen('mapView');
        playGenderNarration('mapPrompt');
      });
    });
    document.querySelectorAll('[data-place]').forEach((button) => {
      button.addEventListener('click', () => {
        const place = button.getAttribute('data-place');
        if (place === 'burger') arriveStore();
        else wrongPlace();
      });
    });
    document.querySelectorAll('[data-order-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        state.orderMode = button.getAttribute('data-order-mode') || '';
        pickRecommendations();
        renderMenu();
        renderCart();
        showScreen('menuView');
      });
    });
    els.goKioskButton?.addEventListener('click', () => showScreen('kioskIntroView'));
    els.checkoutButton?.addEventListener('click', startPayment);
    els.optionBackButton?.addEventListener('click', () => showScreen('menuView'));
    els.optionConfirmButton?.addEventListener('click', () => {
      beginCardPayment();
    });
    els.backToMenuButton?.addEventListener('click', () => {
      window.clearTimeout(state.paymentTimer);
      $('payView')?.classList.remove('is-card-paying');
      els.paymentAnimation?.classList.remove('is-active');
      showScreen('menuView');
    });
    els.cardPayButton?.addEventListener('click', () => {
      beginCardPayment();
    });
    els.pickupButton?.addEventListener('click', pickup);
    els.scrollUpButton?.addEventListener('click', () => els.productGrid?.scrollBy({ top: -260, behavior: 'smooth' }));
    els.scrollDownButton?.addEventListener('click', () => els.productGrid?.scrollBy({ top: 260, behavior: 'smooth' }));
    els.optionScrollUpButton?.addEventListener('click', () => els.optionScrollArea?.scrollBy({ top: -360, behavior: 'smooth' }));
    els.optionScrollDownButton?.addEventListener('click', () => els.optionScrollArea?.scrollBy({ top: 360, behavior: 'smooth' }));
    els.restartButton?.addEventListener('click', restart);
    els.helpButton?.addEventListener('click', () => {
      els.helpModal?.setAttribute('aria-hidden', 'false');
      els.helpModal?.classList.add('is-open');
    });
    els.helpCloseButton?.addEventListener('click', closeHelp);
    document.querySelector('[data-close-modal]')?.addEventListener('click', closeHelp);
  }

  function handleKioskClickSound(event) {
    const button = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!button || button.disabled) return;
    const activeKioskScreen = document.querySelector('#kioskIntroView.is-active, #menuView.is-active, #optionView.is-active, #payView.is-active');
    if (!activeKioskScreen || !activeKioskScreen.contains(button)) return;
    playUiClickSound();
  }

  function stopNarrationOnButtonClick(event) {
    const button = event.target && event.target.closest ? event.target.closest('button, [role="button"]') : null;
    if (!button || button.disabled) return;
    stopNarrationAudio();
  }

  function closeHelp() {
    els.helpModal?.setAttribute('aria-hidden', 'true');
    els.helpModal?.classList.remove('is-open');
  }

  function boot() {
    initEls();
    state.clientName = resolveLaunchClientName();
    renderGenderNames();
    pickRecommendations();
    renderMenu();
    renderCart();
    bindEvents();
    setDialogueText(els.mapFeedback, '햄버거집이 어디있을까요?');
    showIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
