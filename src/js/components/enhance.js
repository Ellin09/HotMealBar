// enhance.js - Post-render UX polish: scroll-reveal, animated counters,
// navbar scroll state, scroll-progress bar, and the intro loader.
// All effects are gated so incidental re-renders (e.g. cart updates) never replay them,
// and everything respects prefers-reduced-motion.

const prefersReduced = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasIO = 'IntersectionObserver' in window;

let revealObserver = null;
let countObserver = null;
let lastView = null;

/**
 * Run after each view render.
 * @param {string} viewName current active view; animation only plays when it changes.
 */
export function enhanceView(viewName, forceAnimate = false) {
  const firstForView = forceAnimate || viewName !== lastView;
  lastView = viewName;
  requestAnimationFrame(() => {
    setupReveal(firstForView);
    setupCounters(firstForView);
  });
}

function setupReveal(animate) {
  const container = document.getElementById('view-container');
  if (!container) return;
  const targets = Array.from(container.querySelectorAll(':scope > section'));
  if (!targets.length) return;

  if (!animate || prefersReduced() || !hasIO) {
    targets.forEach(el => el.classList.add('reveal-in', 'reveal-noanim'));
    return;
  }

  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el, i) => {
    // Clean any state from a previous pass so the entrance replays cleanly
    el.classList.remove('reveal-in', 'reveal-noanim');
    el.classList.add('reveal-init');
    el.style.setProperty('--reveal-delay', (Math.min(i, 5) * 60) + 'ms');
    revealObserver.observe(el);
  });

  // Safety net: never leave content hidden if observers misbehave.
  setTimeout(() => targets.forEach(el => el.classList.add('reveal-in')), 1500);
}

function fmt(num, decimals) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function animateCount(el) {
  const raw = String(el.dataset.count);
  const target = parseFloat(raw);
  if (isNaN(target)) return;
  const decimals = (raw.split('.')[1] || '').length;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const dur = 1100;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);

  function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = prefix + fmt(target * ease(p), decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = prefix + fmt(target, decimals) + suffix;
  }
  requestAnimationFrame(frame);
}

function setFinal(el) {
  const raw = String(el.dataset.count);
  const target = parseFloat(raw);
  if (isNaN(target)) return;
  const decimals = (raw.split('.')[1] || '').length;
  el.textContent = (el.dataset.prefix || '') + fmt(target, decimals) + (el.dataset.suffix || '');
}

function setupCounters(animate) {
  const els = Array.from(document.querySelectorAll('[data-count]'));
  if (!els.length) return;

  if (!animate || prefersReduced() || !hasIO) {
    els.forEach(setFinal);
    return;
  }

  if (countObserver) countObserver.disconnect();
  countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  els.forEach(el => countObserver.observe(el));
}

// ---- One-time page chrome: navbar scroll state + top scroll-progress bar ----
let chromeInit = false;
export function initChrome() {
  if (chromeInit) return;
  chromeInit = true;

  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);

  const header = document.getElementById('nav-header');
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    if (header) header.classList.toggle('nav-scrolled', y > 12);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(y / h, 1) : 0})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

// ---- Intro loader ----
export function hideLoader() {
  const loader = document.getElementById('app-loader');
  if (!loader) return;
  loader.classList.add('loader-hide');
  setTimeout(() => loader.remove(), 650);
}
