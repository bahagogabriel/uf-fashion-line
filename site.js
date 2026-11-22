(() => {
  'use strict';
  let products = window.UF_PRODUCTS || [];
  // Pages CMS saves the public catalogue as JSON; catalog.js stays as a fallback.
  function localImagePath(value) {
    const path = String(value || '').trim().replace(/^\/+/, '');
    return /^assets\/products\/[a-zA-Z0-9._/-]+\.(?:png|jpe?g|webp)$/i.test(path) && !path.includes('..') ? path : '';
  }
  function cleanProduct(item, index) {
    if (!item || typeof item !== 'object' || item.published === false) return null;
    const name = String(item.name || '').trim();
    const category = String(item.category || '').trim();
    const price = Number(item.price);
    const mainImage = localImagePath(item.image);
    if (!name || !['Jerseys','Shorts','Slides','Clogs'].includes(category) || !Number.isFinite(price) || price < 0 || !mainImage) return null;
    const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45);
    const preferredId = item.id || item.uid || '';
    const id = /^[a-zA-Z0-9_-]{1,80}$/.test(preferredId) ? preferredId : `new-${slug || 'product'}-${index + 1}`;
    const gallery = Array.isArray(item.gallery) ? item.gallery.map(localImagePath).filter(Boolean).slice(0,8) : [];
    const modelImage = localImagePath(item.modelImage);
    return { id, name, category, price, description: String(item.description || ''),
      sizes: Array.isArray(item.sizes) ? item.sizes.map(v => String(v).trim()).filter(Boolean) : [],
      listingColor: String(item.listingColor || ''), tag: String(item.tag || category),
      available: item.available !== false, concept: false, modelConcept: true,
      images: { product: mainImage, ...(gallery.length ? { gallery } : {}), ...(modelImage ? { model: modelImage } : {}) } };
  }
  async function loadCatalogue() {
    try {
      const response = await fetch('data/products.json', {cache:'no-store'});
      if (!response.ok) throw Error(`Catalogue HTTP ${response.status}`);
      const items = await response.json();
      if (!Array.isArray(items)) throw Error('Product file is not a list');
      const mapped = items.map(cleanProduct).filter(Boolean);
      if (items.length > 0 && !mapped.length && items.some(p => p && p.published !== false)) throw Error('Invalid product data');
      products = mapped;
    } catch (err) { console.warn('Using original UF catalogue until the product data is available:', err); }
    bag = bag.filter(item => {const product = findProduct(item.id);return product && product.available !== false;});
    try { localStorage.setItem('uf-fashion-enquiry-bag', JSON.stringify(bag)); } catch (_) {}
  }
  const config = {...(window.UF_CONFIG || {})};
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatPrice = (p) => typeof p === 'number' && p >= 0 ? '₦' + new Intl.NumberFormat('en-NG').format(p) : 'Ask for price';
  const findProduct = (id) => products.find((p) => p.id === id);
  let safePhone = String(config.whatsappNumber || '').replace(/\D/g, '');
  let hasWhatsApp = /^\d{10,15}$/.test(safePhone);
  let selected = 'All';
  let query = '';
  let bag = [];
  try {
    const saved = JSON.parse(localStorage.getItem('uf-fashion-enquiry-bag') || '[]');
    if (Array.isArray(saved)) bag = saved.filter(x => x && typeof x.id === 'string' && Number.isInteger(x.quantity) && x.quantity > 0 && x.quantity <= 99);
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
    const p = findProduct(id); if (!p || p.available === false) return;
    const entry = bag.find(x => x.id === id);
    if (entry) entry.quantity = Math.min(entry.quantity + 1, 99);
    else bag.push({id,quantity:1});
    saveBag(); toast(`${p.name} added to your cart`);
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
    }).join('') : `<p class="empty-bag">Your cart is empty.<br/>Browse products and add items to your cart.</p>`;
    $('send-enquiry').disabled = count === 0;
    $('send-enquiry').innerHTML = hasWhatsApp ? 'Send Cart on WhatsApp <span>↗</span>' : 'Copy Cart Items <span>↗</span>';
  }
  function cards() {
    const matching = products.filter(p => (selected === 'All' || p.category === selected) && (`${p.name} ${p.category} ${p.description}`).toLowerCase().includes(query));
    $('results-count').textContent = `${matching.length} ${matching.length === 1 ? 'item' : 'items'}`;
    $('product-grid').innerHTML = matching.length ? matching.map(p => `<article class="product-card"><button class="product-card-image" type="button" data-open="${escapeHTML(p.id)}" aria-label="View ${escapeHTML(p.name)} details"><img src="${escapeHTML(p.images.product)}" alt="${p.concept ? 'Illustrative item' : 'Product photo'}: ${escapeHTML(p.name)}" loading="lazy"/><span class="pill ${p.available === false ? 'sold-out' : (p.concept ? 'concept' : '')}">${p.available === false ? 'SOLD OUT' : (p.concept ? 'CONCEPT LOOK' : 'PRODUCT')}</span><span class="photo-counter">${(p.images.gallery || []).length ? `${1 + p.images.gallery.length} PHOTOS` : 'PHOTO'}${p.images.model ? ' + STYLED' : ''}</span></button><div class="product-card-info"><p class="product-card-tag">${escapeHTML(p.tag || p.category)}</p><div class="product-card-title"><h3>${escapeHTML(p.name)}</h3><span class="price">${formatPrice(p.price)}</span></div><div class="product-card-cta"><span>${escapeHTML(p.category)}</span><button type="button" data-open="${escapeHTML(p.id)}">View details ↗</button></div></div></article>`).join('') : `<p style="grid-column:1/-1;padding:60px 0;text-align:center;color:#716b65">No products match that search. Try another category or search term.</p>`;
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
    $('dialog-main').alt = `${view === 'model' ? 'On-model view' : (product.concept ? 'Illustrative item view' : 'Product photo')}: ${product.name}`;
    document.querySelectorAll('[data-view]').forEach(b => { const selected = b.dataset.view === view; b.classList.toggle('is-active', selected); b.setAttribute('aria-pressed',String(selected)); });
  }
  function openProduct(id) {
    const product = findProduct(id); if (!product) return;
    lastFocused = document.activeElement;
    activeProduct = id;
    const extraTabs = (product.images.gallery || []).map((src, index) => `<button type="button" data-view="extra-${index}" aria-pressed="false"><img src="${escapeHTML(src)}" alt=""/> Photo ${index + 2}</button>`).join('');
    const styledTab = product.images.model ? `<button type="button" data-view="model" aria-pressed="false"><img src="${escapeHTML(product.images.model)}" alt=""/> On Model</button>` : '';
    const conceptMessage = product.concept ? `<p class="dialog-concept"><strong>Product note:</strong> Check the item photo and details with the seller before buying.</p>` : '';
    const sizes = product.sizes && product.sizes.length ? escapeHTML(product.sizes.join(', ')) + ' (as listed)' : 'Confirm options with UF Fashion Line';
    $('product-dialog-body').innerHTML = `<div class="dialog-gallery"><img id="dialog-main" class="dialog-main-image" src="${escapeHTML(product.images.product)}" alt="${product.concept ? 'Illustrative item' : 'Product photo'}: ${escapeHTML(product.name)}"/><div class="dialog-tabs" role="group" aria-label="Switch product images"><button type="button" class="is-active" data-view="product" aria-pressed="true"><img src="${escapeHTML(product.images.product)}" alt=""/> Item photo</button>${extraTabs}${styledTab}</div></div><div class="dialog-content"><p class="eyebrow"><span class="line"></span> ${escapeHTML(product.category)} / ${escapeHTML(product.tag || 'PRODUCTS')}</p><h2>${escapeHTML(product.name)}</h2><p class="dialog-price">${formatPrice(product.price)}</p><p class="dialog-description">${escapeHTML(product.description || '')}</p><p class="dialog-size">Sizes & availability <small>${sizes}. Please confirm stock and final price before purchase.</small></p>${conceptMessage}${product.available === false ? '<p class="stock-status" role="status">Currently sold out</p>' : ''}<button id="dialog-add" class="btn btn-orange" type="button" ${product.available === false ? 'disabled aria-disabled="true"' : ''}>${product.available === false ? 'Sold Out' : 'Add to Cart'} <span>↗</span></button></div>`;
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
    return `Hello UF Fashion Line, these are the items in my cart:\n\n${lines.join('\n')}\n\nPlease confirm current prices, sizes, availability and delivery options. Thank you!`;
  }
  async function copy(text) {
    try { if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error('no clipboard'); await navigator.clipboard.writeText(text); return true; }
    catch (_) {try{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok;}catch(_){return false;}}
  }
  async function sendEnquiry() {
    if (!bag.length) return;
    const text = enquiryText(bag);
    if (hasWhatsApp) { window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer'); return; }
    if (await copy(text)) toast('Cart items copied. Paste them into WhatsApp.');
    else window.prompt('Copy your cart details:',text);
  }
  // Load business settings edited in Pages CMS. If unavailable, keep original trusted details.
  async function loadBusinessSettings() {
    try {
      const result = await fetch('data/contact.json', {cache:'no-store'});
      if (!result.ok) throw Error('Contact settings unavailable');
      const details = await result.json();
      const candidate = String(details.whatsappNumber || '').replace(/\D/g,'');
      if (/^234\d{10}$/.test(candidate)) {
        config.whatsappNumber = candidate;
        config.whatsappDisplay = String(details.whatsappDisplay || '+' + candidate).trim();
      }
      const instagram = String(details.instagramUrl || '').trim();
      if (!instagram) config.instagramUrl = '';
      else {
        const url = new URL(instagram);
        if (url.protocol === 'https:' && /(^|\.)instagram\.com$/i.test(url.hostname)) config.instagramUrl = url.href;
      }
    } catch (err) { console.warn('Keeping verified UF contact details:', err); }
    safePhone = String(config.whatsappNumber || '').replace(/\D/g,'');
    hasWhatsApp = /^\d{10,15}$/.test(safePhone);
  }

  function initContact() {
    $('contact-hint').textContent = hasWhatsApp ? `WhatsApp: ${config.whatsappDisplay || '+'+safePhone}. Ask about stock, prices and sizes.` : 'WhatsApp contact will be activated once the verified business number is added.';
    if (hasWhatsApp) $('contact-action').innerHTML = 'Message on WhatsApp <span>↗</span>';
    $('contact-action').addEventListener('click',async()=>{
      if (hasWhatsApp) {window.open(`https://wa.me/${safePhone}?text=${encodeURIComponent('Hello UF Fashion Line, I would like to ask about your products.')}`,'_blank','noopener,noreferrer');return;}
      const text='Hello UF Fashion Line, I would like to ask about your products.';
      if(await copy(text)) toast('Message copied. The verified WhatsApp number is not configured yet.');
      else window.prompt('Copy this message:',text);
    });
    if (/^https:\/\//.test(config.instagramUrl || '')) { $('instagram-link').href = config.instagramUrl; $('instagram-link').textContent = 'Instagram ↗'; $('instagram-link').target='_blank'; $('instagram-link').rel='noopener noreferrer'; }
  }
  async function init() {
    await Promise.all([loadCatalogue(), loadBusinessSettings()]);
    $('year').textContent = new Date().getFullYear();
    const verified = products.filter(p => !p.concept);
    const notice = $('concept-notice');
    if (verified.length && verified.length === products.length) {
      if (notice) notice.hidden = false;
    } else if (verified.length) {
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
    // Keep category pictures in sync when the owner removes or hides products.
    document.querySelectorAll('[data-category-link]').forEach(link => {
      const category = link.dataset.categoryLink;
      const product = products.find(p => p.category === category && p.available !== false) || products.find(p => p.category === category);
      if (!product) { link.hidden = true; link.style.display = 'none'; return; }
      const image = link.querySelector('img');
      if (image) { image.src = product.images.product; image.alt = `${product.name} — ${category}`; }
    });
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
