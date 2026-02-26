/* ============================================================
   WORN OUT — SITE JS
   ============================================================ */

/* ── Inline SVG loader ──────────────────────────────────────
   Fetches SVG files and inlines them so CSS colour control works.
   Usage in HTML: <span class="icon" data-icon="tshirt"></span>
   ─────────────────────────────────────────────────────────── */
const svgCache = {};

async function loadSVG(name) {
  if (svgCache[name]) return svgCache[name];
  try {
    const res  = await fetch(`icons/${name}.svg`);
    const text = await res.text();
    const clean = text
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/<!--.*?-->/gs, '')
      .trim();
    svgCache[name] = clean;
    return clean;
  } catch(e) {
    console.warn(`Icon not found: icons/${name}.svg`);
    return '';
  }
}

async function inlineSVGsIn(selector) {
  const elements = document.querySelectorAll(selector || '[data-icon]');
  await Promise.all([...elements].map(async (el) => {
    if (el.dataset.loaded) return; // skip already-loaded
    const name = el.dataset.icon;
    const clean = await loadSVG(name);
    el.innerHTML = clean;
    const svg = el.querySelector('svg');
    if (svg) { svg.setAttribute('width','100%'); svg.setAttribute('height','100%'); }
    el.dataset.loaded = '1';
  }));
}

// Expose targeted version for dynamic re-renders (e.g. cart)
window.inlineSVGsTargeted = (selector) => inlineSVGsIn(selector);

document.addEventListener('DOMContentLoaded', () => {
  inlineSVGsIn();

  /* ── Nav scroll state ── */
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ── Mobile menu ── */
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
    });
  });

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Waste bar animations ── */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar  = e.target;
        const fill = bar.querySelector('.wbar__fill');
        const w = parseFloat(bar.dataset.width) / 100;
        fill.style.transform = `scaleX(${w})`;
        bar.classList.add('anim');
        barObs.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.wbar').forEach(b => barObs.observe(b));

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });

  /* ── Counter animation on hero stats ── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-count]').forEach(el => {
          animateCounter(el);
        });
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  const heroStats = document.querySelector('.hero__stats');
  if (heroStats) counterObs.observe(heroStats);

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration = 1200;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

});
