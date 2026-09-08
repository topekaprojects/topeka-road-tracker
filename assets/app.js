(() => {
  const html = document.documentElement;
  const loader = document.getElementById('loader');
  const shell = document.getElementById('siteShell');
  const loaderCopy = document.getElementById('loaderCopy');

  // Deliberately longer loader, but never block on third-party iframes.
  const loaderStart = performance.now();
  const MIN_LOADER_MS = 4200;
  const messages = [
    'Loading local information…',
    'Checking roads and city services…',
    'Preparing your Topeka dashboard…'
  ];
  let msg = 0;
  const msgTimer = setInterval(() => {
    msg = (msg + 1) % messages.length;
    if (loaderCopy) loaderCopy.textContent = messages[msg];
  }, 1250);

  function revealSite() {
    const elapsed = performance.now() - loaderStart;
    const wait = Math.max(0, MIN_LOADER_MS - elapsed);
    setTimeout(() => {
      clearInterval(msgTimer);
      // Make the page visible first, then fade the loader away on top of it.
      html.classList.add('ready');
      html.classList.remove('loading');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => loader?.classList.add('exit'));
      });
      setTimeout(() => loader?.remove(), 1150);
    }, wait);
  }

  if (document.readyState === 'complete') revealSite();
  else window.addEventListener('load', revealSite, { once: true });
  // Failsafe if load is delayed by a browser extension or unusual resource issue.
  setTimeout(revealSite, 7200);

  // Mobile navigation
  const menuBtn = document.getElementById('menuBtn');
  const navlinks = document.getElementById('navlinks');
  menuBtn?.addEventListener('click', () => {
    const open = navlinks?.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(!!open));
  });
  navlinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navlinks.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }));

  // Reveal animations
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .11, rootMargin: '0px 0px -35px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Local clock
  function updateClock() {
    const el = document.getElementById('localClock');
    if (!el) return;
    const now = new Date();
    el.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: '2-digit'
    }).format(now);
  }
  updateClock(); setInterval(updateClock, 30000);

  // NWS live weather for central Topeka. Uses official public API and gracefully falls back.
  const LAT = 39.0473, LON = -95.6780;
  const weatherEls = {
    temp: ['weatherTemp','heroTemp','moduleTemp'],
    condition: ['weatherText','heroCondition','moduleCondition'],
    icon: ['weatherIcon','heroWeatherIcon','moduleWeatherIcon']
  };
  const setMany = (ids, value) => ids.forEach(id => { const e = document.getElementById(id); if (e) e.textContent = value; });
  const glyph = text => {
    const t = (text || '').toLowerCase();
    if (t.includes('thunder')) return 'ϟ';
    if (t.includes('rain') || t.includes('shower')) return '☂';
    if (t.includes('snow') || t.includes('sleet')) return '❄';
    if (t.includes('cloud') || t.includes('overcast')) return '☁';
    if (t.includes('fog') || t.includes('haze')) return '≋';
    return '☀';
  };

  async function loadWeather() {
    try {
      const pointRes = await fetch(`https://api.weather.gov/points/${LAT},${LON}`, {headers:{'Accept':'application/geo+json'}});
      if (!pointRes.ok) throw new Error('NWS point lookup failed');
      const point = await pointRes.json();
      const [forecastRes, stationsRes] = await Promise.all([
        fetch(point.properties.forecast, {headers:{'Accept':'application/geo+json'}}),
        fetch(point.properties.observationStations, {headers:{'Accept':'application/geo+json'}})
      ]);
      const forecast = forecastRes.ok ? await forecastRes.json() : null;
      const stations = stationsRes.ok ? await stationsRes.json() : null;
      const stationUrl = stations?.features?.[0]?.id;
      let tempF = null, condition = forecast?.properties?.periods?.[0]?.shortForecast || 'Topeka forecast';
      if (stationUrl) {
        const obsRes = await fetch(`${stationUrl}/observations/latest`, {headers:{'Accept':'application/geo+json'}});
        if (obsRes.ok) {
          const obs = await obsRes.json();
          const c = obs?.properties?.temperature?.value;
          if (typeof c === 'number') tempF = Math.round(c * 9/5 + 32);
          condition = obs?.properties?.textDescription || condition;
        }
      }
      if (tempF == null) tempF = forecast?.properties?.periods?.[0]?.temperature ?? '--';
      setMany(weatherEls.temp, `${tempF}°`);
      setMany(weatherEls.condition, condition);
      setMany(weatherEls.icon, glyph(condition));
      const detail = document.getElementById('moduleDetails');
      if (detail) detail.textContent = 'Live NWS • Topeka, Kansas';
      const heroForecast = document.getElementById('heroForecast');
      if (heroForecast && forecast?.properties?.periods?.[0]) {
        const p = forecast.properties.periods[0];
        heroForecast.textContent = `${p.name}: ${p.shortForecast}`;
      }
      const row = document.getElementById('forecastRow');
      if (row && forecast?.properties?.periods) {
        row.innerHTML = forecast.properties.periods.slice(0,3).map(p => `<div class="forecast-day"><b>${p.name}</b><span>${glyph(p.shortForecast)}</span><small>${p.temperature}° • ${p.shortForecast}</small></div>`).join('');
      }
    } catch (err) {
      setMany(weatherEls.condition, 'Open NWS forecast');
      setMany(weatherEls.icon, '☁');
      const detail = document.getElementById('moduleDetails');
      if (detail) detail.textContent = 'Live weather unavailable • Tap NWS link';
    }
  }

  async function loadAlerts() {
    const box = document.getElementById('weatherAlertBox');
    const title = document.getElementById('weatherAlertTitle');
    const desc = document.getElementById('weatherAlertDesc');
    const preview = document.getElementById('alertHeadline');
    try {
      const res = await fetch(`https://api.weather.gov/alerts/active?point=${LAT},${LON}`, {headers:{'Accept':'application/geo+json'}});
      if (!res.ok) throw new Error('alerts failed');
      const data = await res.json();
      const active = data.features || [];
      if (active.length) {
        const a = active[0].properties;
        box?.classList.add('warning');
        if (title) title.textContent = a.event || 'Weather alert';
        if (desc) desc.textContent = a.headline || 'Active National Weather Service alert.';
        if (preview) preview.textContent = `${active.length} active alert${active.length === 1 ? '' : 's'} • ${a.event}`;
      } else {
        if (title) title.textContent = 'No active weather alerts';
        if (desc) desc.textContent = 'No active NWS alerts for central Topeka right now.';
        if (preview) preview.textContent = 'No active alerts for central Topeka';
      }
    } catch (err) {
      if (title) title.textContent = 'Check NWS for current alerts';
      if (desc) desc.textContent = 'The live alert feed could not be loaded.';
      if (preview) preview.textContent = 'Open NWS for current alerts';
    }
  }
  loadWeather(); loadAlerts();

  // Frame controls
  document.querySelectorAll('.refresh-frame').forEach(btn => btn.addEventListener('click', () => {
    const frame = document.getElementById(btn.dataset.frame);
    if (frame) frame.src = frame.src;
  }));
  document.querySelectorAll('.frame-tab').forEach(tab => tab.addEventListener('click', () => {
    const frame = document.getElementById(tab.dataset.frame);
    if (!frame) return;
    tab.parentElement?.querySelectorAll('.frame-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    frame.src = tab.dataset.src;
  }));

  // Road project filters
  document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    btn.parentElement?.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.project').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.status !== filter);
    });
  }));
})();
