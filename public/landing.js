// ══════════════════════════════════════════════════════════
// FORJA Landing Page — JavaScript
// Extracted from inline <script> tags for clean separation
// ══════════════════════════════════════════════════════════

// ── Block 1 ──
// CURSOR
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

// NAV
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('solid', scrollY > 60);
});

// REVEAL
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      if (e.target.dataset.target) countUp(e.target);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .stat-box').forEach(el => obs.observe(el));

// COUNT UP
function countUp(el) {
  const target = parseFloat(el.dataset.target);
  const suf = el.dataset.suf || '';
  const dec = parseInt(el.dataset.dec || '0');
  const numEl = el.querySelector('.stat-n');
  const dur = 1600, start = performance.now();
  function upd(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = target * e;
    numEl.textContent = (dec > 0 ? v.toFixed(dec) : Math.floor(v).toLocaleString('ro')) + suf;
    if (p < 1) requestAnimationFrame(upd);
  }
  requestAnimationFrame(upd);
}

// FAQ
function tFaq(btn) {
  const item = btn.parentElement;
  const open = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!open) item.classList.add('open');
}

// MARKETPLACE FILTER
let mkActive = 'all';
function setMK(btn, cat) {
  document.querySelectorAll('.mktab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  mkActive = cat;
  filterMK();
}
function filterMK() {
  const q = document.getElementById('mkSearch').value.toLowerCase();
  document.querySelectorAll('#mkGrid .t-card').forEach(c => {
    const cats = c.dataset.c || '';
    const txt = c.textContent.toLowerCase();
    const mc = mkActive === 'all' || cats.includes(mkActive);
    const ms = !q || txt.includes(q);
    c.style.display = mc && ms ? '' : 'none';
  });
}

// SLEEP STAGES ANIMATION — target phone inside feat-block
const stagesObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stage-bar').forEach((b, i) => {
        setTimeout(() => b.classList.add('animated'), i * 120);
      });
      stagesObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
const sleepPhone = document.getElementById('sleepPhone');
if (sleepPhone) stagesObs.observe(sleepPhone);

// SNORE MINI BARS inside phone
const snoreEl = document.getElementById('snoreBars');
if (snoreEl) {
  const data = [1,2,4,6,8,5,3,7,9,8,4,2,1,3,2];
  data.forEach(v => {
    const d = document.createElement('div');
    d.style.cssText = `width:4px;border-radius:1px 1px 0 0;height:${(v/9*14)+2}px;background:${v>7?'var(--coral)':v>4?'#fbbf24':'var(--lime)'}`;
    snoreEl.appendChild(d);
  });
}

// SOUND MIXER TOGGLE
function toggleSound(id) {
  const el = document.getElementById(id);
  el.classList.toggle('active');
  el.querySelector('.ms-toggle').textContent = el.classList.contains('active') ? '▶' : '■';
  if (mixerPlaying) { ensureMixerAudio(); if (audioCtx?.state === 'suspended') audioCtx.resume(); }
  setMixerVolume(id);
}

// QUICK DEMO LOGIN din landing
const DEMO_SESSION_USERS = {
  'user@forja.ro': { id: 'u1', name: 'Alex Popescu', email: 'user@forja.ro', role: 'USER', avatar: 'A', avatarUrl: null, plan: 'PRO', level: 7, xp: 1340, streak: 12, weight: 78, teamName: 'Iron Wolves', isDemo: true },
  'coach@forja.ro': { id: 'c1', name: 'Mihai Ionescu', email: 'coach@forja.ro', role: 'COACH', avatar: 'M', avatarUrl: null, plan: 'COACH', level: 5, xp: 980, streak: 8, weight: 85, teamName: 'Iron Wolves', isDemo: true },
  'nutritionist@forja.ro': { id: 'n1', name: 'Elena Dumitrescu', email: 'nutritionist@forja.ro', role: 'NUTRITIONIST', avatar: 'E', avatarUrl: null, plan: 'NUT', level: 4, xp: 720, streak: 6, weight: 62, teamName: '', isDemo: true },
  'admin@forja.ro': { id: 'a1', name: 'Admin FORJA', email: 'admin@forja.ro', role: 'ADMIN', avatar: 'A', avatarUrl: null, plan: 'PRO', level: 10, xp: 5000, streak: 30, weight: 80, teamName: '', isDemo: true },
};

async function quickDemoLogin(email) {
  const demoUser = DEMO_SESSION_USERS[email];
  if (!demoUser) {
    window.location.href = '/login?tab=demo';
    return;
  }

  const cards = document.querySelectorAll('[onclick*="quickDemoLogin"]');
  cards.forEach(c => c.style.opacity = '0.5');
  const card = [...cards].find(c => c.getAttribute('onclick').includes(email));
  if (card && !card.querySelector('[data-demo-loading]')) {
    card.style.opacity = '1';
    card.innerHTML += '<div data-demo-loading style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);border-radius:20px;font-family:var(--font-mono);font-size:12px;color:#fff;letter-spacing:1px;">Se încarcă...</div>';
  }

  try {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('forja_demo_mode');
    localStorage.setItem('token', 'mock-jwt-' + String(demoUser.role || 'user').toLowerCase());
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('forja_demo_mode', 'true');
    localStorage.removeItem('forja_registered');

    const redirect = demoUser.role === 'ADMIN'
      ? '/admin'
      : demoUser.role === 'COACH'
        ? '/coach'
        : demoUser.role === 'NUTRITIONIST'
          ? '/nutritionist'
          : '/app';

    window.location.href = redirect;
  } catch (e) {
    window.location.href = '/login?tab=demo';
  }
}

const INFO_CONTENT = {
  about: {
    title: 'Despre FORJA',
    sub: 'Antrenament, nutriție și echipă într-un singur loc.',
    body: [
      'FORJA e o platformă fitness cu trei roluri: athlete, coach și nutriționist. Fiecare are dashboard propriu, funcționalități dedicate și comunicare prin chat integrat.',
      'Poți testa totul instant din conturile demo fără înregistrare.'
    ],
    aside: [
      { title: 'Ce există acum', text: 'Workout tracking, nutriție, echipe, chat, dashboard-uri pe rol și panel admin.' }
    ]
  },
  blog: {
    title: 'Blog',
    sub: 'În curând.',
    body: [
      'Blogul FORJA nu este încă activ. Când va fi gata, vom publica ghiduri practice pentru sportivi, coachi și nutriționiști.',
      'Dacă vrei să fii notificat la lansare, lasă-ne emailul în waitlist.'
    ],
    aside: [
      { title: 'Status', text: 'În dezvoltare.' }
    ]
  },
  terms: {
    title: 'Termeni de utilizare',
    sub: 'Pe scurt.',
    body: [
      'Contul, istoricul și progresul tău sunt ale tale. Poți șterge contul oricând.',
      'Nu garantăm funcționalități care nu sunt încă implementate. Ce vezi în demo este ce există acum.'
    ],
    aside: [
      { title: 'Principiu', text: 'Transparență în ce e live și ce e în lucru.' }
    ]
  },
  privacy: {
    title: 'Confidențialitate',
    sub: 'Datele tale, controlul tău.',
    body: [
      'Datele despre antrenamente, nutriție și greutate sunt vizibile doar pentru tine și pentru specialistul pe care îl autorizezi.',
      'Nu vindem date. Nu afișăm reclame.'
    ],
    aside: [
      { title: 'Control', text: 'Tu decizi cine vede ce.' }
    ]
  }
};

function closeSiteModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
}
function openSiteModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
}
function openInfoModal(type) {
  const cfg = INFO_CONTENT[type] || INFO_CONTENT.about;
  document.getElementById('infoModalTitle').textContent = cfg.title;
  document.getElementById('infoModalSub').textContent = cfg.sub;
  document.getElementById('infoModalBody').innerHTML = cfg.body.map(p => `<p>${p}</p>`).join('');
  document.getElementById('infoModalAside').innerHTML = cfg.aside.map(item => `<div class="site-mini-card"><h4>${item.title}</h4><p>${item.text}</p></div>`).join('');
  openSiteModal('infoModal');
}
function openContactModal(topic = 'general') {
  document.getElementById('contactTopic').value = topic === 'business' ? 'business' : topic === 'coach' ? 'coach' : topic === 'demo' ? 'demo' : 'general';
  const defaults = {
    business: 'Bună! Vreau o discuție despre planul Business Team și o ofertă potrivită pentru organizația mea.',
    faq: 'Bună! Am câteva întrebări după ce am parcurs FAQ-ul și aș vrea să discut cu cineva din echipă.',
    footer: 'Bună! Aș vrea mai multe detalii despre FORJA și următorii pași.',
    demo: 'Bună! Aș vrea o demonstrație a produsului și a modului în care se folosește în practică.',
    coach: 'Bună! Vreau să intru ca specialist în FORJA și am nevoie de pașii de onboarding.',
  };
  document.getElementById('contactMessage').value = defaults[topic] || defaults.footer;
  const feedback = document.getElementById('contactFeedback');
  feedback.style.display = 'none';
  feedback.classList.remove('err');
  feedback.textContent = '✓ Mesajul a fost înregistrat.';
  openSiteModal('contactModal');
}
async function submitContact(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const topic = document.getElementById('contactTopic').value;
  const message = document.getElementById('contactMessage').value.trim();
  const feedback = document.getElementById('contactFeedback');
  feedback.style.display = 'none';
  feedback.classList.remove('err');

  if (!name || !email || !message) {
    feedback.textContent = '✕ Completează toate câmpurile.';
    feedback.classList.add('err');
    feedback.style.display = 'block';
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    feedback.textContent = '✕ Adresa de email nu este validă.';
    feedback.classList.add('err');
    feedback.style.display = 'block';
    return false;
  }

  const showSuccess = () => {
    feedback.textContent = '✓ Mesajul a fost trimis. Revenim cât mai clar și concret.';
    feedback.style.display = 'block';
    document.getElementById('contactMessage').value = '';
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, topic, message })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error || (res.status === 403 ? '🔒 Formularul este închis momentan.' : '✕ Eroare de server. Încearcă mai târziu.');
      feedback.textContent = errMsg;
      feedback.classList.add('err');
      feedback.style.display = 'block';
      return false;
    }
    showSuccess();
  } catch {
    feedback.textContent = '✕ Nu am putut trimite mesajul. Verifică conexiunea.';
    feedback.classList.add('err');
    feedback.style.display = 'block';
  }
  return false;
}

// Web Audio demo mixer
let audioCtx = null;
let masterGain = null;
const mixerNodes = {};
function ensureMixerAudio() {
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.24;
  masterGain.connect(audioCtx.destination);
  ['ms1','ms2','ms3','ms4','ms5'].forEach((id) => {
    mixerNodes[id] = createMixerNode(id);
    mixerNodes[id].output.connect(masterGain);
  });
  document.querySelectorAll('#mixerSoundsPhone .ms-slider').forEach((slider) => {
    slider.addEventListener('input', () => setMixerVolume(slider.closest('.mixer-sound').id));
  });
}
function createNoiseBuffer(seconds = 2) {
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}
function createNoiseChain(type, freq, q = 0.8) {
  const source = audioCtx.createBufferSource();
  source.buffer = createNoiseBuffer();
  source.loop = true;
  const filter = audioCtx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  source.connect(filter);
  filter.connect(gain);
  source.start();
  return { output: gain, gain, source, filter };
}
function createDeltaNode() {
  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  const left = audioCtx.createOscillator();
  const right = audioCtx.createOscillator();
  const leftPan = audioCtx.createStereoPanner();
  const rightPan = audioCtx.createStereoPanner();
  left.type = 'sine';
  right.type = 'sine';
  left.frequency.value = 110;
  right.frequency.value = 112;
  leftPan.pan.value = -0.6;
  rightPan.pan.value = 0.6;
  left.connect(leftPan).connect(gain);
  right.connect(rightPan).connect(gain);
  left.start();
  right.start();
  return { output: gain, gain, oscillators: [left, right] };
}
function createMixerNode(id) {
  if (id === 'ms1') return createNoiseChain('bandpass', 900, 0.6);
  if (id === 'ms2') return createNoiseChain('lowpass', 420, 0.5);
  if (id === 'ms3') return createNoiseChain('highpass', 1800, 0.7);
  if (id === 'ms4') return createDeltaNode();
  return createNoiseChain('lowpass', 240, 0.9);
}
function setMixerVolume(id) {
  if (!audioCtx || !mixerNodes[id]) return;
  const el = document.getElementById(id);
  if (!el) return;
  const slider = el.querySelector('.ms-slider');
  const isActive = el.classList.contains('active') && mixerPlaying;
  const target = isActive ? (Number(slider.value || 0) / 100) * (id === 'ms4' ? 0.18 : 0.32) : 0;
  mixerNodes[id].gain.gain.cancelScheduledValues(audioCtx.currentTime);
  mixerNodes[id].gain.gain.linearRampToValueAtTime(target, audioCtx.currentTime + 0.12);
}
function refreshMixerVolumes() {
  ['ms1','ms2','ms3','ms4','ms5'].forEach(setMixerVolume);
}

window.__FORJA_PUBLIC_SETTINGS = { allowWaitlist: true, allowContact: true, maintenanceMode: false };

function applyPublicSettings(settings = {}) {
  const next = { ...window.__FORJA_PUBLIC_SETTINGS, ...settings };
  window.__FORJA_PUBLIC_SETTINGS = next;

  // === WAITLIST disabled ===
  if (!next.allowWaitlist) {
    const emailInput = document.getElementById('notifyEmail');
    const btn = document.getElementById('notifyBtn');
    const success = document.getElementById('notifySuccess');
    if (emailInput) {
      emailInput.disabled = true;
      emailInput.placeholder = 'Waitlist închis momentan';
      emailInput.style.opacity = '0.65';
    }
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.55';
      btn.style.cursor = 'not-allowed';
      btn.textContent = 'WAITLIST ÎNCHIS';
    }
    if (success) {
      success.textContent = '🔒 Waitlist-ul este închis momentan. Revenim curând!';
      success.style.display = 'block';
      success.style.color = '#ff6b47';
    }
  }

  // === CONTACT disabled ===
  if (!next.allowContact) {
    // Disable contact buttons / footer trigger
    document.querySelectorAll('[onclick*="openContact"], [onclick*="contactModal"]').forEach((element) => {
      if (element.dataset.contactDisabled === 'true') return; // already done
      element.disabled = true;
      element.style.opacity = '0.55';
      element.style.cursor = 'not-allowed';
      element.title = 'Formularul de contact este închis momentan';
      element.dataset.contactDisabled = 'true';
      // Prevent the click from doing anything
      element.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
    });
    // If modal already open, lock it
    const modal = document.getElementById('contactModal');
    if (modal) {
      const submit = modal.querySelector('button[type="submit"], button[onclick*="submitContact"]');
      if (submit) {
        submit.disabled = true;
        submit.style.opacity = '0.55';
        submit.textContent = '🔒 CONTACT ÎNCHIS';
      }
      const feedback = document.getElementById('contactFeedback');
      if (feedback) {
        feedback.textContent = '🔒 Formularul de contact este închis momentan.';
        feedback.style.color = '#ff6b47';
        feedback.style.display = 'block';
      }
    }
  }

  // === MAINTENANCE mode → full-page overlay ===
  if (next.maintenanceMode) {
    if (!document.getElementById('forjaMaintenanceOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'forjaMaintenanceOverlay';
      overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(8, 10, 12, 0.92);
        backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center;
        padding: 24px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      `;
      overlay.innerHTML = `
        <div style="max-width: 520px; width: 100%; text-align: center; color: #fff;">
          <div style="font-size: 64px; margin-bottom: 16px;">🔧</div>
          <div style="font-family: 'Barlow Condensed', sans-serif; font-size: 44px; font-weight: 900; letter-spacing: 1px; margin-bottom: 12px; line-height: 1;">
            FORJA E ÎN MENTENANȚĂ
          </div>
          <div style="font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.78); margin-bottom: 24px;">
            Lucrăm la îmbunătățiri. Platforma va fi disponibilă în scurt timp. Mulțumim pentru răbdare.
          </div>
          <div style="display: inline-block; padding: 10px 20px; background: rgba(184,237,0,0.15); border: 1px solid #B8ED00; border-radius: 999px; color: #B8ED00; font-family: 'Plus Jakarta Sans', monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
            Revenim curând
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      // Block scroll
      document.body.style.overflow = 'hidden';
    }
  } else {
    // Maintenance turned OFF — remove overlay if exists
    const existing = document.getElementById('forjaMaintenanceOverlay');
    if (existing) existing.remove();
    document.body.style.overflow = '';
  }
}

async function loadPublicSettings() {
  try {
    const res = await fetch('/api/settings/public');
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.settings) applyPublicSettings(data.settings);
  } catch {
    // Modul static: folosim default-urile din __FORJA_PUBLIC_SETTINGS
  }
}

function notifyMe() {
  const email = document.getElementById('notifyEmail').value.trim();
  const success = document.getElementById('notifySuccess');
  const btn = document.getElementById('notifyBtn');
  if (!window.__FORJA_PUBLIC_SETTINGS.allowWaitlist) return;
  if (!email) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    success.textContent = '✕ Email invalid.';
    success.style.display = 'block';
    success.style.color = '#ff6b47';
    return;
  }
  success.style.display = 'none';
  btn.disabled = true;

  const showSuccess = () => {
    success.textContent = '✓ TE ANUNȚĂM LA LANSARE!';
    success.style.display = 'block';
    success.style.color = '';
    document.getElementById('notifyEmail').style.display = 'none';
    btn.style.display = 'none';
  };

  fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type: 'android' })
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error || (res.status === 403 ? '🔒 Waitlist-ul este închis momentan.' : '✕ Eroare server. Încearcă din nou.');
      success.textContent = errMsg;
      success.style.display = 'block';
      success.style.color = '#ff6b47';
      return;
    }
    showSuccess();
  }).catch(() => {
    success.textContent = '✕ Nu am putut trimite. Verifică conexiunea.';
    success.style.display = 'block';
    success.style.color = '#ff6b47';
  }).finally(() => {
    btn.disabled = false;
  });
}

loadPublicSettings();

// MIXER PLAY/PAUSE
let mixerPlaying = false, mixerInterval = null, mixerSecs = 30*60;
function toggleMixer() {
  mixerPlaying = !mixerPlaying;
  document.getElementById('mixerPlayBtn').textContent = mixerPlaying ? '⏸' : '▶';
  if (mixerPlaying) {
    ensureMixerAudio();
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    refreshMixerVolumes();
    mixerInterval = setInterval(() => {
      if (mixerSecs > 0) {
        mixerSecs--;
        const m = Math.floor(mixerSecs/60), s = mixerSecs%60;
        document.getElementById('mixerTimer').textContent = m+':'+(s<10?'0':'')+s;
      } else {
        clearInterval(mixerInterval); mixerPlaying = false;
        document.getElementById('mixerPlayBtn').textContent = '▶';
        refreshMixerVolumes();
      }
    }, 1000);
  } else {
    clearInterval(mixerInterval);
    refreshMixerVolumes();
  }
}
function setTimer(minutes) {
  mixerSecs = minutes*60;
  const m = minutes, s = 0;
  document.getElementById('mixerTimer').textContent = m+':00';
  document.querySelectorAll('#mixerPlayBtn + div + div button').forEach(btn => {
    btn.style.background = 'rgba(255,255,255,0.08)';
    btn.style.borderColor = 'rgba(255,255,255,0.1)';
    btn.style.color = 'rgba(255,255,255,0.5)';
    btn.style.fontWeight = '600';
  });
  const activeBtn = [...document.querySelectorAll('#mixerPlayBtn + div + div button')].find(btn => btn.textContent.trim() === `${minutes}m`);
  if (activeBtn) {
    activeBtn.style.background = 'rgba(197,241,53,0.2)';
    activeBtn.style.borderColor = 'rgba(197,241,53,0.4)';
    activeBtn.style.color = 'var(--lime)';
    activeBtn.style.fontWeight = '700';
  }
}
function scrollTo(sel) {
  document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' });
}

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// VIDEO SHOWCASE REVEAL
const vsWrap = document.querySelector('.vs-video-wrap');
if (vsWrap) {
  const vsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  vsObs.observe(vsWrap);
}

// HERO VIDEO FALLBACK — if video can't load, show poster
document.querySelectorAll('video').forEach(v => {
  v.addEventListener('error', () => { v.style.display = 'none'; });
});

// ── Block 2 ──
// ── GALLERY AUTO-SCROLL (3 seconds, infinite loop) ──
(function(){
  var track = document.getElementById('galleryTrack');
  var dotsWrap = document.getElementById('galleryDots');
  var progressBar = document.getElementById('galProgress');
  var idxEl = document.getElementById('galIdx');
  var totalEl = document.getElementById('galTotal');
  if(!track||!dotsWrap) return;
  var slides = track.querySelectorAll('.gslide');
  var total = slides.length;
  var idx = 0;
  var autoTimer = null;
  var progTimer = null;
  var progVal = 0;
  var INTERVAL = 3000;

  totalEl.textContent = total;

  // Create dots
  for(var i=0;i<total;i++){
    var d = document.createElement('button');
    d.className = 'gallery-dot' + (i===0?' active':'');
    (function(j){ d.onclick = function(){ idx=j; go(); resetAuto(); }; })(i);
    dotsWrap.appendChild(d);
  }
  var dots = dotsWrap.querySelectorAll('.gallery-dot');

  function go(){
    // Circular wrap
    idx = ((idx % total) + total) % total;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    dots.forEach(function(d,i){ d.className = 'gallery-dot' + (i===idx ? ' active' : ''); });
    slides.forEach(function(s,i){ s.className = 'gslide' + (i===idx ? ' active' : ''); });
    idxEl.textContent = idx + 1;
    progVal = 0;
    if(progressBar) progressBar.style.width = '0%';
  }

  function startProg(){
    progVal = 0;
    clearInterval(progTimer);
    progTimer = setInterval(function(){
      progVal += 100 / (INTERVAL / 50);
      if(progressBar) progressBar.style.width = Math.min(progVal,100) + '%';
    }, 50);
  }

  function resetAuto(){
    clearInterval(autoTimer);
    clearInterval(progTimer);
    startProg();
    autoTimer = setInterval(function(){ idx++; go(); startProg(); }, INTERVAL);
  }

  window.galNext = function(){ idx++; go(); resetAuto(); };
  window.galPrev = function(){ idx--; go(); resetAuto(); };

  // Init
  slides[0].classList.add('active');
  startProg();
  autoTimer = setInterval(function(){ idx++; go(); startProg(); }, INTERVAL);

  // Pause on hover
  var carousel = document.getElementById('galleryCarousel');
  if(carousel){
    carousel.onmouseenter = function(){ clearInterval(autoTimer); clearInterval(progTimer); };
    carousel.onmouseleave = function(){ resetAuto(); };
  }
})();

// ── PARTICLE NETWORK ──
(function(){
  const canvas = document.getElementById('particleCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const PARTICLE_COUNT = 60;
  const MAX_DIST = 120;

  function resize(){
    const hero = document.getElementById('hero');
    if(!hero) return;
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }

  function init(){
    resize();
    particles = [];
    for(let i=0;i<PARTICLE_COUNT;i++){
      particles.push({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
        r: Math.random()*2+1,
        color: ['rgba(197,241,53,','rgba(26,86,255,','rgba(255,77,28,'][Math.floor(Math.random()*3)]
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color+'0.6)';
      ctx.fill();
      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x-q.x, dy = p.y-q.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist<MAX_DIST){
          ctx.beginPath();
          ctx.moveTo(p.x,p.y);
          ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = p.color+(0.15*(1-dist/MAX_DIST))+')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  init(); draw();
  window.addEventListener('resize', ()=>{ resize(); });
})();

// ── SCROLL PROGRESS BAR ──
window.addEventListener('scroll', ()=>{
  const bar = document.getElementById('scrollProgress');
  if(!bar) return;
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});

// ── ENHANCED REVEAL OBSERVER ──
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('vis');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal-3d, .reveal-scale, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
})();

// ── VIDEO TOGGLE ──
function toggleShowcaseVideo(){
  const v = document.getElementById('showcaseVideo');
  const btn = document.getElementById('videoPlayBtn');
  if(!v) return;
  if(v.paused){ v.play(); btn.style.opacity='0'; btn.style.pointerEvents='none'; }
  else { v.pause(); btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
}
document.getElementById('showcaseVideo')?.addEventListener('click', toggleShowcaseVideo);

// ── MOUSE PARALLAX ON HERO ──
(function(){
  const hero = document.getElementById('hero');
  if(!hero) return;
  const pills = hero.querySelectorAll('.float-pill');
  const orbs = hero.querySelectorAll('.orb');
  hero.addEventListener('mousemove', (e)=>{
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    pills.forEach((p,i) => {
      const speed = (i+1) * 8;
      p.style.transform = `translate(${x*speed}px, ${y*speed}px)`;
    });
    orbs.forEach((o,i) => {
      const speed = (i+1) * 15;
      o.style.transform = `translate(${x*speed}px, ${y*speed}px)`;
    });
  });
})();

