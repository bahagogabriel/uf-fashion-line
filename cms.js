/* Live copy managed by UF Fashion Line Pages CMS.
   Text is applied with textContent to avoid interpreting HTML from the editor. */
(() => {
  'use strict';
  const imagePattern = /^assets\/images\/[a-zA-Z0-9._/-]+\.(?:jpe?g|png|webp)$/i;
  function safeImage(value) {
    const path = String(value || '').trim().replace(/^\/+/, '');
    return imagePattern.test(path) && !path.includes('..') ? path : '';
  }
  const imageMap = {campaignImage: 'campaign-image', storyImage: 'story-image'};
  async function load(name) {
    try {
      const res = await fetch('data/' + name + '.json', {cache:'no-store'});
      if (!res.ok) throw Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data || Array.isArray(data) || typeof data !== 'object') return;
      document.querySelectorAll('[data-cms]').forEach(element => {
        const key = element.dataset.cms;
        if (typeof data[key] === 'string' && data[key].trim()) element.textContent = data[key].trim();
      });
      for (const [key, id] of Object.entries(imageMap)) {
        const path = safeImage(data[key]);
        const element = document.getElementById(id);
        if (path && element) element.src = path;
      }
    } catch (err) { console.warn('Keeping default UF ' + name + ' content:',err); }
  }
  function init() { ['homepage','about','shopping','contact'].forEach(load); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();