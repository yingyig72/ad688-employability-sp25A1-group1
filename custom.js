// ============================================
// AD688 Team 1 — custom.js
// Features: animated stat counters, smooth page transitions
// ============================================

(function () {
  'use strict';

  // --------------------------------------------
  // 1) ANIMATED STAT COUNTERS
  //
  //    Targets the <strong> inside each .stat-card,
  //    which is what Quarto renders for **72k+**.
  //    Preserves suffix (k, m, +, %).
  // --------------------------------------------

  function parseStatValue(raw) {
    const match = raw.trim().match(/^([\d,.]+)\s*([a-zA-Z+%]*)/);
    if (!match) return null;

    const numStr = match[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return null;

    return {
      target: num,
      suffix: match[2] || '',
      decimals: (numStr.split('.')[1] || '').length,
    };
  }

  function formatNumber(value, decimals) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function animateCounter(card) {
    // Find the <strong> element — that's where the number lives
    const numEl = card.querySelector('strong');
    if (!numEl) return;

    const originalText = numEl.textContent;
    const parsed = parseStatValue(originalText);
    if (!parsed) return;

    // Lock the width so the element doesn't jitter as digits change.
    // Measure after setting to the widest state (the target).
    numEl.style.display = 'inline-block';
    numEl.style.minWidth = numEl.getBoundingClientRect().width + 'px';
    numEl.style.textAlign = 'center';

    const duration = 1400;
    const startTime = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = ease(progress);
      const current = parsed.target * eased;

      // While animating, round to integers for a clean counter feel;
      // at the end, restore the original decimal precision.
      const displayValue = progress < 1
        ? Math.round(current).toLocaleString('en-US')
        : formatNumber(parsed.target, parsed.decimals);

      numEl.textContent = displayValue + parsed.suffix;

      if (progress < 1) requestAnimationFrame(tick);
    }

    // Start from 0 immediately so there's no flash of the final value
    numEl.textContent = '0' + parsed.suffix;
    requestAnimationFrame(tick);
  }

  function initStatCounters() {
    const stats = document.querySelectorAll('.stat-card');
    if (!stats.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    stats.forEach((el) => observer.observe(el));
  }

  // --------------------------------------------
  // 2) SMOOTH PAGE TRANSITIONS
  // --------------------------------------------

  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('page-transition-ready');
    requestAnimationFrame(() => {
      document.body.classList.add('page-loaded');
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      if (
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.hash) return;
      } catch {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      e.preventDefault();
      document.body.classList.remove('page-loaded');
      document.body.classList.add('page-leaving');

      setTimeout(() => {
        window.location.href = link.href;
      }, 220);
    });

    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.body.classList.remove('page-leaving');
        document.body.classList.add('page-loaded');
      }
    });
  }

  // --------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initStatCounters();
      initPageTransitions();
    });
  } else {
    initStatCounters();
    initPageTransitions();
  }
})();
