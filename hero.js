/* UF Fashion Line: progressive homepage photo switch.
   The original hero stays visible until BOTH approved shop photos are in GitHub.
   Product data, cart, checkout and Pages CMS are deliberately untouched. */
(() => {
  const hero = document.getElementById('home');
  const photo = document.getElementById('hero-photo');
  const mobile = document.getElementById('hero-mobile-source');
  if (!hero || !photo || !mobile) return;

  const desktopPath = 'assets/images/shop-owner-desktop.webp';
  const mobilePath = 'assets/images/shop-owner-mobile.webp';
  function check(path) {
    return new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = path;
    });
  }

  Promise.all([check(desktopPath), check(mobilePath)]).then(([desktopReady, mobileReady]) => {
    if (!desktopReady || !mobileReady) return;
    mobile.setAttribute('srcset', mobilePath);
    photo.src = desktopPath;
    photo.alt = 'UF Fashion Line shop owner standing inside the real shop, with football jerseys and footwear on display';
    hero.classList.add('shop-owner-hero');
  }).catch(() => {});
})();
