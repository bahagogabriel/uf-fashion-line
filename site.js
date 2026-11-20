(() => {
  'use strict';
  const products = window.UF_PRODUCTS || [];
  const config = window.UF_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatPrice = (p) => typeof p === 'number' && p >= 0 ? '₦' + new Intl.NumberFormat('en-NG').format(p) : 'Ask for price';
  const findProduct = (id) => products.find((p) => p.id === id);
  const safePhone = String(config.whatsappNumber || '').replace(/\D/g, '');
  const hasWhatsApp = /^\d{10,15}$/.test(safePhone);
  let selected = 'All';
  let query = '';
  let bag = [];
  try {
    const saved = JSON.parse(localStorage.getItem('uf-fashion-enquiry-bag') || '[]');
    if (Array.isArray(saved)) bag = saved.filter(x => findProduct(x.id) && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 99);
  } catch (_) { bag = []; }
  let toastTimer;
  let activeProduct = null;
  let lastFocused = null;
  const counts = () => bag.reduce((sum, item) => sum + item.quantity, 0);

  function toast(msg) {
    const el = $('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  }
  function saveBag() {
    try { localStorage.setItem('uf-fashion-enquiry-bag', JSON.stringify(bag)); } catch (_) {}
    renderBag();
  }
  function addToBag(id) {
    const p = findProduct(id); if (!p) return;
    const entry = bag.find(x => x.id === id);
    if (entry) entry.quantity = Math.min(entry.quantity + 1, 99);
    else bag.push({id,quantity:1});
    saveBag(); toast(`${p.name} added to your enquiry bag`);
  }
  function changeQuantity(id, delta) {
    const item = bag.find(x => x.id === id); if (!item) return;
    item.quantity = Math.min(item.quantity + delta,99);
    bag = bag.filter(x => x.quantity > 0); saveBag();
  }
  function renderBag() {
    const count = counts(); $('bag-count').textContent = String(count); $('drawer-counter').textContent = `(${count})`;
    $('drawer-items').innerHTML = bag.length ? bag.map(({id,quantity}) => {
      const p = findProduct(id); if (!p) return '';
      return `<div class="bag-line"><img src="${p.images.product}" alt="${escapeHTML(p.name)}"/><div class="bag-line-main"><h3>${escapeHTML(p.name)}</h3><small>${escapeHTML(p.category)} · ${formatPrice(p.price)}</small><div class="qty"><button type="button" data-quantity="-1" data-id="${escapeHTML(id)}" aria-label="Remove one ${escapeHTML(p.name)}">−</button><strong>${quantity}</strong><button type="button" data-quantity="1" data-id="${escapeHTML(id)}" aria-label="Add one ${escapeHTML(p.name)}">+</button></div></div></div>`;
    }).join('') : `<p class="empty-bag">Your enquiry bag is empty.<br/>Explore the collection and add pieces you like.</p>`;
    $('send-enquiry').disabled = count === 0;
    $('send-enquiry').innerHTML = hasWhatsApp ? 'Enquire on WhatsApp <span>↗</span>' : 'Copy enquiry <span>↗</span>';
  }
  function cards() {
    const matching = products.filter(p => (selected === 'All' || p.category === selected) && (`${p.name} ${p.category} ${p.description}`).toLowerCase().includes(query));
    $('results-count').textContent = `${matching.length} ${matching.length === 1 ? 'item' : 'items'}`;
    $('product-grid').innerHTML = matching.length ? matching.map(p => `<article class="product-card"><button class="product-card-image" type="button" data-open="${escapeHTML(p.id)}" aria-label="View ${escapeHTML(p.name)} details"><img src="${escapeHTML(p.images.product)}" alt="${p.concept ? 'Illustrative item' : 'Product photo'}: ${escapeHTML(p.name)}" loading="lazy"/><span class="pill ${p.concept ? 'concept' : ''}">${p.concept ? 'CONCEPT LOOK' : 'PRODUCT'}</span><span class="photo-counter">${(p.images.gallery || []).length ? `${1 + p.images.gallery.length} PHOTOS` : 'ITEM VIEW'}${p.images.model ? ' + STYLED' : ''}</span></button><div class="product-card-info"><p class="product-card-tag">${escapeHTML(p.tag || p.category)}</p><div class="product-card-title"><h3>${escapeHTML(p.name)}</h3><span class="price">${formatPrice(p.price)}</span></div><div class="product-card-cta"><span>${escapeHTML(p.category)}</span><button type="button" data-open="${escapeHTML(p.id)}">View details ↗</button></div></div></article>`).join('') : `<p style="grid-column:1/-1;padding:60px 0;text-align:center;color:#716b65">No products match that search. Try another category or search term.</p>`;
  }
  function filterTo(category) {
    selected = category;
    document.querySelectorAll('[data-filter]').forEach(b => {const active=b.dataset.filter===category;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
    cards();
  }
  function showTab(view) {
    if (!activeProduct) return;
    const product = findProduct(activeProduct); if (!product) return;
    const index = view.startsWith('extra-') ? Number(view.slice(6)) : -1;
    const extra = Number.isInteger(index) && index >= 0 ? (product.images.gallery || [])[index] : '';
    $('dialog-main').src = extra || product.images[view] || product.images.product;
    $('dialog-main').alt = `${view === 'model' ? 'Styled on a Nigerian model (concept)' : (product.concept ? 'Illustrative item view' : 'Product photo')}: ${product.name}`;
    document.querySelectorAll('[data-view]').forEach(b => { const selected = b.dataset.view === view; b.classList.toggle('is-active', selected); b.setAttribute('aria-pressed',String(selected)); });
  }
  function openProduct(id) {
    const product = findProduct(id); if (!product) return;
    lastFocused = document.activeElement;
    activeProduct = id;
    const extraTabs = (product.images.gallery || []).map((src, index) => `<button type="button" data-view="extra-${index}" aria-pressed="false"><img src="${escapeHTML(src)}" alt=""/> Photo ${index + 2}</button>`).join('');
    const styledTab = product.images.model ? `<button type="button" data-view="model" aria-pressed="false"><img src="${escapeHTML(product.images.model)}" alt=""/> Styled view${product.modelConcept !== false ? ' (concept)' : ''}</button>` : '';
    const conceptMessage = product.concept ? `<p class="dialog-concept"><strong>Concept imagery:</strong> This is an illustration, not an authenticated photo of an item in UF Fashion Line's stock.</p>` : (product.images.model && product.modelConcept !== false ? `<p class="dialog-concept"><strong>Styling illustration:</strong> The product view is a merchandise photograph; the model view is an AI styling concept and may differ from the real item.</p>` : '');
    const sizes = product.sizes && product.sizes.length ? escapeHTML(product.sizes.join(', ')) + ' (as listed)' : 'Confirm options with UF Fashion Line';
    $('product-dialog-body').innerHTML = `<div class="dialog-gallery"><img id="dialog-main" class="dialog-main-image" src="${escapeHTML(product.images.product)}" alt="${product.concept ? 'Illustrative item' : 'Product photo'}: ${escapeHTML(product.name)}"/><div class="dialog-tabs" role="group" aria-label="Switch product images"><button type="button" class="is-active" data-view="product" aria-pressed="true"><img src="${escapeHTML(product.images.product)}" alt=""/> Item photo</button>${extraTabs}${styledTab}</div></div><div class="dialog-content"><p class="eyebrow"><span class="line"></span> ${escapeHTML(product.category)} / ${escapeHTML(product.tag || 'THE COLLECTION')}</p><h2>${escapeHTML(product.name)}</h2><p class="dialog-price">${formatPrice(product.price)}</p><p class="dialog-description">${escapeHTML(product.description || '')}</p><p class="dialog-size">Sizes & availability <small>${sizes}. Please confirm stock and final price before purchase.</small></p>${conceptMessage}<button id="dialog-add" class="btn btn-orange" type="button">Add to enquiry bag <span>↗</span></button></div>`;
    $('dialog-add').addEventListener('click',() => {addToBag(id);$('product-dialog').close();openDrawer();});
    $('product-dialog').showModal();
    document.body.classList.add('no-scroll');
  }
  function closeProduct() { if ($('product-dialog').open) $('product-dialog').close(); }
  function openDrawer() {
    closeProduct();
    $('bag-drawer').classList.add('is-open'); $('bag-drawer').setAttribute('aria-hidden','false'); $('drawer-scrim').hidden = false;
    document.body.classList.add('no-scroll'); $('bag-close').focus();
  }
  function closeDrawer() {
    $('bag-drawer').classList.remove('is-open'); $('bag-drawer').setAttribute('aria-hidden','true'); $('drawer-scrim').hidden = true;
    document.body.classList.remove('no-scroll'); $('bag-toggle').focus();
  }
  function enquiryText(items) {
    const lines = items.map((i,index) => {const p=findProduct(i.id);return `${index+1}. ${p.name} (${p.category}) × ${i.quantity} — ${formatPrice(p.price)}`;});
    return `Hello UF Fashion Line, I would like to enquire about the following item${items.length===1?'':'s'}:\n\n${lines.join('\n')}\n\nPlease confirm current prices, sizes, availability and delivery options. Thank you!`;
  }
  async function copy(text) {
    try { if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error('no clipboard'); await navigator.clipboard.writeText(text); return true; }
    catch (_) {try{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok;}catch(_){return false;}}
  }
  async function sendEnquiry() {
    if (!bag.length) return;
    const text = enquiryText(bag);
    if (hasWhatsApp) { window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer'); return; }
    if (await copy(text)) toast('Enquiry copied. Paste it into your preferred messaging app.');
    else window.prompt('Copy this enquiry message:',text);
  }
  function initContact() {
    $('contact-hint').textContent = hasWhatsApp ? 'Ask about stock, prices and sizes directly on WhatsApp.' : 'WhatsApp contact will be activated once the verified business number is added.';
    if (hasWhatsApp) $('contact-action').innerHTML = 'Message on WhatsApp <span>↗</span>';
    $('contact-action').addEventListener('click',async()=>{
      if (hasWhatsApp) {window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent('Hello UF Fashion Line, I would like to enquire about your current collection.')}`,'_blank','noopener,noreferrer');return;}
      const text='Hello UF Fashion Line, I would like to enquire about your current collection.';
      if(await copy(text)) toast('Message copied. The verified WhatsApp number is not configured yet.');
      else window.prompt('Copy this message:',text);
    });
    if (/^https:\/\//.test(config.instagramUrl || '')) { $('instagram-link').href = config.instagramUrl; $('instagram-link').textContent = 'Instagram ↗'; $('instagram-link').target='_blank'; $('instagram-link').rel='noopener noreferrer'; }
  }
  function init() {
    $('year').textContent = new Date().getFullYear();
    const verified = products.filter(p => !p.concept);
    const intro = $('shop-intro');
    const notice = $('concept-notice');
    if (verified.length && verified.length === products.length) {
      if (intro) intro.textContent = 'Browse 22 photographed listings, compare posted naira prices and enquire about sizes and availability.';
      if (notice) notice.hidden = false;
    } else if (verified.length) {
      if (intro) intro.textContent = 'Shop real products alongside clearly labelled styling concepts.';
      if (notice) notice.querySelector('p').innerHTML = '<strong>Styling concepts:</strong> Some images are illustrative, and are labelled as such. Confirm sizes, stock and final prices before ordering.';
    }
    const filters = $('filter-list');
    const present = new Set(Array.from(filters.querySelectorAll('[data-filter]'), el => el.dataset.filter));
    [...new Set(products.map(p => p.category))].filter(c => !present.has(c)).forEach(category => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'filter'; button.dataset.filter = category;
      button.setAttribute('aria-pressed', 'false'); button.textContent = category;
      filters.appendChild(button);
    });
    cards();renderBag();initContact();
    document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filterTo(b.dataset.filter)));
    document.querySelectorAll('[data-category-link]').forEach(a=>a.addEventListener('click',()=>filterTo(a.dataset.categoryLink)));
    $('search-open').addEventListener('click',()=>{const p=$('search-panel');p.hidden=!p.hidden;if(!p.hidden){$('search-input').focus();document.querySelector('#shop').scrollIntoView({behavior:'smooth'});}else{$('search-input').value='';query='';cards();}});
    $('search-input').addEventListener('input',(event)=>{query=event.target.value.trim().toLowerCase();cards();});
    $('clear-search').addEventListener('click',()=>{query='';$('search-input').value='';$('search-input').focus();cards();});
    $('product-grid').addEventListener('click',(event)=>{const btn=event.target.closest('[data-open]');if(btn)openProduct(btn.dataset.open);});
    $('product-dialog').addEventListener('click',(event)=>{const tab=event.target.closest('[data-view]');if(tab)showTab(tab.dataset.view);if(event.target===$('product-dialog'))closeProduct();});
    $('product-dialog').addEventListener('close',()=>{if(!$('bag-drawer').classList.contains('is-open'))document.body.classList.remove('no-scroll');if(lastFocused&&lastFocused.focus)lastFocused.focus();activeProduct=null;});
    $('product-close').addEventListener('click',closeProduct);
    $('bag-toggle').addEventListener('click',openDrawer);
    $('bag-close').addEventListener('click',closeDrawer);
    $('drawer-scrim').addEventListener('click',closeDrawer);
    $('drawer-items').addEventListener('click',(event)=>{const btn=event.target.closest('[data-quantity]');if(btn)changeQuantity(btn.dataset.id,Number(btn.dataset.quantity));});
    $('send-enquiry').addEventListener('click',sendEnquiry);
    document.addEventListener('keydown',(event)=>{if(event.key==='Escape' && $('bag-drawer').classList.contains('is-open'))closeDrawer();});
    $('menu-toggle').addEventListener('click',()=>{const open=$('primary-nav').classList.toggle('is-open');$('menu-toggle').setAttribute('aria-expanded',String(open));});
    document.querySelectorAll('.primary-nav a').forEach(a=>a.addEventListener('click',()=>{$('primary-nav').classList.remove('is-open');$('menu-toggle').setAttribute('aria-expanded','false');}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
