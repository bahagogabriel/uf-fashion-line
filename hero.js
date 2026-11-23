/* UF Fashion Line: native responsive hero images render immediately from HTML.
   Pages CMS remains authoritative if the owner changes the photographs later. */
(() => {
  'use strict';
  const hero = document.getElementById('home');
  const photo = document.getElementById('hero-photo');
  const mobileSource = document.getElementById('hero-mobile-source');
  if (!hero || !photo || !mobileSource) return;

  function localImage(value) {
    const path = String(value || '').trim().replace(/^\/+/, '');
    return /^assets\/images\/[a-zA-Z0-9._/-]+\.(?:jpe?g|png|webp)$/i.test(path) &&
      !path.includes('..') ? path : '';
  }

  function imageReady(path) {
    return new Promise(resolve => {
      const test = new Image();
      test.onload = () => resolve(true);
      test.onerror = () => resolve(false);
      test.src = path;
    });
  }

  async function syncCMSHero() {
    try {
      const response = await fetch('data/homepage.json', {cache:'no-store'});
      if (!response.ok) return;
      const settings = await response.json();
      const desktop = localImage(settings.heroDesktopImage);
      const mobile = localImage(settings.heroMobileImage);
      if (!desktop || !mobile) return;
      const existingDesktop = localImage(photo.getAttribute('src'));
      const existingMobile = localImage(mobileSource.getAttribute('srcset'));
      // Avoid assigning image URLs again: that caused the visible load-time switch.
      if (desktop === existingDesktop && mobile === existingMobile) return;
      const [validDesktop, validMobile] = await Promise.all([
        desktop === existingDesktop ? Promise.resolve(true) : imageReady(desktop),
        mobile === existingMobile ? Promise.resolve(true) : imageReady(mobile)
      ]);
      if (!validDesktop || !validMobile) return;
      if (desktop !== existingDesktop) photo.setAttribute('src',desktop);
      if (mobile !== existingMobile) mobileSource.setAttribute('srcset',mobile);
    } catch (error) {
      console.warn('UF Fashion Line: showing the built-in homepage photography',error);
    }
  }
  syncCMSHero();
})();