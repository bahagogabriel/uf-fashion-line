/* UF homepage images can be updated from Pages CMS. Keep existing image if a replacement fails. */
(() => {
  const hero = document.getElementById('home');
  const photo = document.getElementById('hero-photo');
  const mobile = document.getElementById('hero-mobile-source');
  if (!hero || !photo || !mobile) return;
  function safeImage(value, fallback) {
    const path = String(value || '').trim().replace(/^\/+/, '');
    return /^assets\/images\/[a-zA-Z0-9._/-]+\.(?:jpe?g|png|webp)$/i.test(path) && !path.includes('..') ? path : fallback;
  }
  function exists(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }
  async function init() {
    let desktop = 'assets/images/shop-owner-desktop.webp';
    let phone = 'assets/images/shop-owner-mobile.webp';
    try {
      const response = await fetch('data/homepage.json', {cache:'no-store'});
      if (response.ok) {
        const content = await response.json();
        desktop = safeImage(content.heroDesktopImage,desktop);
        phone = safeImage(content.heroMobileImage,phone);
      }
    } catch (_) {}
    const [desktopOK,phoneOK] = await Promise.all([exists(desktop),exists(phone)]);
    if (!desktopOK || !phoneOK) return;
    mobile.srcset = phone;
    photo.src = desktop;
    photo.alt = 'UF Fashion Line real shop interior with footwear, football jerseys and owner';
    hero.classList.add('shop-owner-hero');
  }
  init().catch(() => {});
})();