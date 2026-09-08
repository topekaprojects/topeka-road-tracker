(() => {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => setTimeout(() => loader?.classList.add('hide'), 650));

  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('navlinks');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, {threshold: .12, rootMargin: '0px 0px -40px'});
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  let counted = false;
  const summary = document.querySelector('.summary');
  const countObs = new IntersectionObserver(entries => {
    if (!counted && entries.some(e => e.isIntersecting)) {
      counted = true;
      document.querySelectorAll('.count').forEach(el => {
        const target = Number(el.dataset.count || 0);
        const start = performance.now();
        const run = now => {
          const p = Math.min(1, (now - start) / 850);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      });
      countObs.disconnect();
    }
  }, {threshold:.25});
  if (summary) countObs.observe(summary);
})();
