const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

// Reveal content as it enters the viewport.
const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.07}):null;
$$('.reveal').forEach(el=>io?io.observe(el):el.classList.add('visible'));

// Mobile menu.
const menu=$('#menu'), nav=$('#navlinks');
if(menu&&nav){
  menu.addEventListener('click',()=>nav.classList.toggle('open'));
  $$('#navlinks a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
}

// Homepage loader: first visit only during the browser session.
const homeLoader=$('#homeLoader');
if(homeLoader){
  const seen=sessionStorage.getItem('tct_loader_seen');
  if(seen){
    homeLoader.remove();
    document.documentElement.classList.remove('home-loading');
  }else{
    sessionStorage.setItem('tct_loader_seen','1');
    const start=performance.now();
    const finish=()=>{
      const wait=Math.max(0,5500-(performance.now()-start));
      setTimeout(()=>{
        document.documentElement.classList.remove('home-loading');
        homeLoader.classList.add('hide');
        setTimeout(()=>homeLoader.remove(),950);
      },wait);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finish,{once:true});else finish();
    setTimeout(()=>{if($('#homeLoader')){document.documentElement.classList.remove('home-loading');$('#homeLoader').classList.add('hide')}},8000);
  }
}

// Always create one identical pothole transition on every page.
function transitionMarkup(){return `
<div class="page-transition" id="pageTransition" aria-hidden="true">
  <div class="transition-curtain start-curtain"></div>
  <div class="transition-copy"><b>Heading across Topeka…</b><span>Hopefully this road is smoother.</span></div>
  <div class="transition-scene">
    <div class="transition-skyline" aria-hidden="true"></div>
    <div class="transition-road">
      <div class="road-edge"></div><div class="road-dashes"></div>
      <div class="pothole" aria-hidden="true"><span></span></div>
      <div class="impact-spark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><b></b></div>
      <div class="family-car" aria-hidden="true">
        <img class="car-frame car-happy" src="happy.png" alt="">
        <img class="car-frame car-shocked" src="shocked.png" alt="">
        <img class="car-frame car-sad" src="sadsad.png" alt="">
      </div>
    </div>
  </div>
  <div class="door door-left" aria-hidden="true"><span></span></div>
  <div class="door door-right" aria-hidden="true"><span></span></div>
</div>`}

let trans=$('#pageTransition');
if(trans){
  // Upgrade older markup in-place so every page gets the exact V5.2 transition.
  trans.outerHTML=transitionMarkup();
  trans=$('#pageTransition');
}else{
  document.body.insertAdjacentHTML('afterbegin',transitionMarkup());
  trans=$('#pageTransition');
}

// Door-opening arrival animation after a page transition.
if(sessionStorage.getItem('tct_transition_arrival')==='1'){
  sessionStorage.removeItem('tct_transition_arrival');
  const arrival=document.createElement('div');
  arrival.className='arrival-doors';
  arrival.innerHTML='<div class="arrival-left"><i></i></div><div class="arrival-right"><i></i></div>';
  document.body.appendChild(arrival);
  requestAnimationFrame(()=>requestAnimationFrame(()=>arrival.classList.add('open')));
  setTimeout(()=>arrival.remove(),1150);
}

let transitionBusy=false;
function localPageLink(a){
  try{
    const u=new URL(a.href,location.href);
    return u.origin===location.origin && /(?:index|weather|roads|closures|fixit|news|events|report|about)\.html$/.test(u.pathname);
  }catch(e){return false}
}
function resetTransition(){
  if(!trans)return;
  trans.classList.remove('show','scene-visible','pothole-ready','impact','stopped','sad','doors-close');
  trans.setAttribute('aria-hidden','true');
  transitionBusy=false;
}

// Delegated click handler guarantees navigation from every page and card uses the transition.
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||!localPageLink(a)||transitionBusy)return;
  const u=new URL(a.href,location.href);
  if(u.href===location.href)return;
  e.preventDefault();
  transitionBusy=true;
  resetTransition(); transitionBusy=true;
  trans.classList.add('show');trans.setAttribute('aria-hidden','false');

  // Fade from black into the complete road scene.
  setTimeout(()=>trans.classList.add('scene-visible'),180);
  // The pothole grows into view at the exact center-line impact point.
  setTimeout(()=>trans.classList.add('pothole-ready'),820);
  // The car reaches the pothole at 1.85s. Both the car and road stop at the same instant.
  setTimeout(()=>trans.classList.add('impact'),1850);
  // Hold the shocked frame clearly while the car AND the road are already frozen.
  // Only after that hold do we switch to the final sad frame.
  setTimeout(()=>trans.classList.add('stopped','sad'),2800);
  // Swinging doors close over the frozen scene.
  setTimeout(()=>trans.classList.add('doors-close'),3650);
  // Destination opens its doors instead of replaying the homepage loader.
  setTimeout(()=>{
    sessionStorage.setItem('tct_transition_arrival','1');
    location.href=u.href;
  },4500);
});
window.addEventListener('pageshow',resetTransition);

// Road filters.
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const f=btn.dataset.filter;
  $$('.project').forEach(p=>p.classList.toggle('hidden',f!=='all'&&p.dataset.status!==f));
}));

// WIBW tabs.
$$('[data-wibw]').forEach(btn=>btn.addEventListener('click',()=>{
  $$('[data-wibw]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const f=$('#wibwFrame');if(f)f.src=btn.dataset.wibw;
}));

// Mouse-reactive homepage panels. Touch/mobile devices keep a stable flat layout.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  $$('.home-hero .hero-card,.dashboard-links .dash-link,.about-short').forEach(card=>{
    card.classList.add('mouse-reactive');
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',`${x*100}%`); card.style.setProperty('--my',`${y*100}%`);
      card.style.setProperty('--ry',`${(x-.5)*7}deg`); card.style.setProperty('--rx',`${(.5-y)*6}deg`);
    });
    card.addEventListener('pointerleave',()=>{
      card.style.setProperty('--ry','0deg');card.style.setProperty('--rx','0deg');
    });
  });
}

// Scroll-to-top control on every page.
const topBtn=document.createElement('button');
topBtn.className='scroll-top';topBtn.type='button';topBtn.setAttribute('aria-label','Scroll to top');topBtn.innerHTML='<span>↑</span><small>TOP</small>';
document.body.appendChild(topBtn);
const updateTop=()=>topBtn.classList.toggle('visible',scrollY>420);
addEventListener('scroll',updateTop,{passive:true});updateTop();
topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));

// Weather.
function iconEmoji(t=''){t=t.toLowerCase();if(t.includes('thunder'))return'⛈️';if(t.includes('snow')||t.includes('sleet'))return'🌨️';if(t.includes('rain')||t.includes('shower'))return'🌧️';if(t.includes('fog'))return'🌫️';if(t.includes('partly')||t.includes('mostly cloudy'))return'⛅';if(t.includes('cloud'))return'☁️';if(t.includes('sun')||t.includes('clear'))return'☀️';return'🌤️'}
function groupForecast(periods){const days=[];for(const p of periods){let key=new Date(p.startTime).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});let d=days.find(x=>x.key===key);if(!d){d={key,date:new Date(p.startTime),day:null,night:null};days.push(d)}if(p.isDaytime)d.day=p;else d.night=p}return days.slice(0,7)}
async function loadWeather(){try{const point=await fetch('https://api.weather.gov/points/39.0473,-95.6752',{headers:{Accept:'application/geo+json'}}).then(r=>{if(!r.ok)throw Error('points');return r.json()});const [forecast,stations]=await Promise.all([fetch(point.properties.forecast).then(r=>r.json()),fetch(point.properties.observationStations).then(r=>r.json())]);const station=stations.features?.[0]?.id;let obs=null;if(station){try{obs=await fetch(station+'/observations/latest').then(r=>r.json())}catch(e){}}const periods=forecast.properties.periods||[],cp=periods[0]||{};let temp=cp.temperature,cond=cp.shortForecast||'Forecast available',wind=cp.windSpeed?`${cp.windSpeed} ${cp.windDirection||''}`:'National Weather Service';if(obs?.properties?.temperature?.value!=null){temp=Math.round(obs.properties.temperature.value*9/5+32);cond=obs.properties.textDescription||cond;const mph=obs.properties.windSpeed?.value!=null?Math.round(obs.properties.windSpeed.value*0.621371):null;if(mph!=null)wind=`Wind ${mph} mph`}$$('[data-temp]').forEach(x=>x.textContent=`${temp}°F`);$$('[data-cond]').forEach(x=>x.textContent=cond);$$('[data-icon]').forEach(x=>x.textContent=iconEmoji(cond));const ht=$('#heroTemp');if(ht)ht.textContent=`${temp}°`;const hc=$('#heroCondition');if(hc)hc.textContent=cond;const hw=$('#heroWind');if(hw)hw.textContent=wind;const wg=$('#weekGrid');if(wg){const days=groupForecast(periods);wg.innerHTML=days.map((d,i)=>{const hi=d.day?.temperature??'--',lo=d.night?.temperature??'--',label=d.day?.shortForecast||d.night?.shortForecast||'',nm=i===0?'Today':d.date.toLocaleDateString('en-US',{weekday:'short'});return `<article class="day-card"><div class="day">${nm}</div><div class="wxemoji">${iconEmoji(label)}</div><div class="temps">${hi}° <span>${lo}°</span></div><div class="forecast-label">${label}</div></article>`}).join('')}const ws=$('#weatherStatus');if(ws&&!ws.dataset.alertLoaded){ws.dataset.alertLoaded='1';try{const alerts=await fetch('https://api.weather.gov/alerts/active?zone=KSZ039').then(r=>r.json());const c=alerts.features?.length||0;if(c){const names=alerts.features.slice(0,2).map(a=>a.properties.event).join(' • ');ws.insertAdjacentHTML('beforeend',`<span class="status-chip alert">${c} active alert${c===1?'':'s'}: ${names}</span>`)}else ws.insertAdjacentHTML('beforeend','<span class="status-chip">No active Shawnee County weather alerts found</span>')}catch(e){}}}catch(e){$$('[data-temp]').forEach(x=>x.textContent='NWS');$$('[data-cond]').forEach(x=>x.textContent='Weather unavailable');const wg=$('#weekGrid');if(wg)wg.innerHTML='<article class="day-card">Weather service temporarily unavailable.</article>'}}
loadWeather();setInterval(loadWeather,15*60*1000);
