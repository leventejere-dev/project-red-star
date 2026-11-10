/* ==========================================================================
   PROJECT RED STAR — FILE 001
   script.js · vanilla JS, no dependencies, no tracking, no audio
   ========================================================================== */
window.RS_READY = true;

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. PERSONALISE HERE
     Everything visible on the page is generated from these values.
     ------------------------------------------------------------------ */
  const CONFIG = {
    recipientName: 'Szakács-Paál Erzsébet',
    museumName: 'Vörös Csillag Múzeum',
    missionName: 'Vörös Csillag',          // KÜLDETÉS: …
    city: 'Sepsiszentgyörgy',
    guests: 2,
    missionId: 'VÖRÖS-CSILLAG-001',
    ticketSerial: 'VCS-001',
    fileNumber: '001',
    coordinates: '45°52′ É · 25°47′ K',

    // Időpont-egyeztetés — csak a szám jelenik meg, név nélkül
    contactPhone: '+40 726 709 755',

    // The personal note. First line is the salutation; each item is a paragraph.
    message: [
      'Kedves Erzsébet!',
      'Egy különleges utazás vár rád. Nem a jövőbe, hanem egy olyan múltba, amely még ma is rengeteg titkot őriz.',
      'Két belépő. Egy különleges helyszín. És egy történet, amelyet most te fedezhetsz fel.',
      'A küldetésed hivatalosan is kezdetét vette.'
    ]
  };

  /* ------------------------------------------------------------------
     2. Helpers
     ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const body = document.body;
  const up = (s) => String(s).toLocaleUpperCase('hu-HU');
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;

  // ?motion=full forces the full cinematic version (handy for testing on a device with reduced motion on)
  const forceMotion = /[?&]motion=full\b/.test(window.location.search);
  if (forceMotion) document.documentElement.classList.add('force-motion');
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mq.matches && !forceMotion;
  const onMq = (e) => { reduced = e.matches && !forceMotion; };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  let tempo = 1; // < 1 while the visitor taps to fast-forward the intro
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const wait = (ms) => sleep(reduced ? Math.min(ms, 30) : ms * tempo); // animation timing
  const hold = (ms) => sleep(ms * tempo);                               // reading pauses (kept under reduced motion)
  const later = (fn, ms) => setTimeout(fn, reduced ? 0 : ms * tempo);

  function anim(el, frames, opts = {}) {
    if (!el || typeof el.animate !== 'function') return Promise.resolve(null);
    const o = Object.assign({ fill: 'both', easing: 'ease' }, opts);
    if (reduced) { o.duration = 1; o.delay = 0; }
    const a = el.animate(frames, o);
    return a.finished.then(() => a, () => a);
  }

  const state = { busy: false, alive: true };
  class Abort extends Error {}
  const guard = () => { if (!state.alive) throw new Abort(); };

  const store = {
    get() { try { return window.localStorage.getItem('rs001.complete') === '1'; } catch (e) { return false; } },
    set() { try { window.localStorage.setItem('rs001.complete', '1'); } catch (e) { /* private mode */ } }
  };

  function announce(msg) {
    const a = $('#announcer');
    if (!a) return;
    const p = document.createElement('p');
    p.textContent = msg;
    a.appendChild(p);
  }

  /* ------------------------------------------------------------------
     3. Personalisation → DOM
     ------------------------------------------------------------------ */
  const DIGRAPHS = ['dzs', 'cs', 'dz', 'gy', 'ly', 'ny', 'sz', 'ty', 'zs'];
  function initialOf(word) {
    const w = word.toLocaleLowerCase('hu-HU');
    const d = DIGRAPHS.find((g) => w.startsWith(g));
    return up(d ? word.slice(0, d.length) : word.charAt(0)) + '.';
  }
  const initials = (name) => name.trim().split(/\s+/).map((part) => part.split('-').map(initialOf).join('-')).join(' ');

  const museumWords = up(CONFIG.museumName).split(/\s+/);
  const museumLine2 = museumWords.length > 1 ? museumWords.pop() : '';
  const now = new Date();

  const V = {
    recipientName: CONFIG.recipientName,
    recipientUpper: up(CONFIG.recipientName),
    recipientInitials: initials(CONFIG.recipientName),
    museumUpper: up(CONFIG.museumName),
    museumLine1: museumWords.join(' '),
    museumLine2: museumLine2,
    missionUpper: up(CONFIG.missionName),
    cityUpper: up(CONFIG.city),
    guests: String(CONFIG.guests),
    guestsLabel: `${CONFIG.guests} FŐ`,
    missionId: CONFIG.missionId,
    ticketSerial: CONFIG.ticketSerial,
    fileNumber: CONFIG.fileNumber,
    coordinates: CONFIG.coordinates,
    contactPhone: CONFIG.contactPhone
  };

  const LINES = [
    'TITKOSÍTOTT ADÁS ÉSZLELVE',
    `CÍMZETT: ${V.recipientUpper}`,
    'SZEMÉLYAZONOSSÁG MEGERŐSÍTVE'
  ];

  function bind() {
    $$('[data-bind]').forEach((el) => {
      const v = V[el.dataset.bind];
      if (v != null) el.textContent = v;
    });
    $$('[data-tel]').forEach((a) => { a.href = 'tel:' + CONFIG.contactPhone.replace(/[^+\d]/g, ''); });
    $$('[data-today]').forEach((el) => { el.textContent = ymd(now); });
    $$('[data-now]').forEach((el) => { el.textContent = `${ymd(now)}. ${pad(now.getHours())}:${pad(now.getMinutes())}`; });

    const title = $('#mission-title');
    if (title) {
      title.textContent = '';
      V.missionUpper.split(/\s+/).forEach((w, i) => {
        if (i) title.appendChild(document.createTextNode(' '));
        const s = document.createElement('span');
        s.textContent = w;
        title.appendChild(s);
      });
    }

    const note = $('#note-text');
    if (note && CONFIG.message.length) {
      note.textContent = '';
      CONFIG.message.forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para;
        note.appendChild(p);
      });
    }
  }

  function splitWords(root) {
    let i = 0;
    $$('p', root).forEach((p) => {
      const parts = p.textContent.split(/(\s+)/);
      p.textContent = '';
      parts.forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { p.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.style.setProperty('--i', i++);
        s.textContent = w;
        p.appendChild(s);
      });
    });
  }

  function barcode(svg, seedStr) {
    if (!svg) return;
    let seed = 0;
    for (const c of seedStr) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    let x = 0;
    let out = '';
    while (x < 236) {
      const w = 1 + Math.floor(rnd() * 3);
      out += `<rect x="${x}" y="0" width="${w}" height="40"/>`;
      x += w + 1 + Math.floor(rnd() * 3);
    }
    svg.innerHTML = out;
    svg.setAttribute('viewBox', `0 0 ${x} 40`);
  }

  /* ------------------------------------------------------------------
     5. Oscilloscope + clock (scene 01 ambience)
     ------------------------------------------------------------------ */
  const Scope = (() => {
    const line = $('.scope polyline');
    const N = 72;
    let raf = 0;
    let last = 0;
    let energy = 0.2;
    let target = 0.2;
    let phase = 0;
    function draw() {
      energy += (target - energy) * 0.12;
      phase += 0.32;
      let pts = '';
      for (let i = 0; i < N; i++) {
        const k = i / (N - 1);
        const env = Math.sin(Math.PI * k);
        const y = 20 + (Math.sin(i * 0.42 + phase) * 6 * energy + Math.sin(i * 1.7 - phase * 1.3) * 2.5 * energy + (Math.random() - 0.5) * 18 * energy * energy) * env;
        pts += `${(k * 300).toFixed(1)},${y.toFixed(1)} `;
      }
      line.setAttribute('points', pts);
    }
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ts - last < 40) return; // ~25fps feels analog
      last = ts;
      draw();
    }
    return {
      start() { if (!line || raf) return; if (reduced) { energy = 0.15; draw(); return; } raf = requestAnimationFrame(frame); },
      stop() { cancelAnimationFrame(raf); raf = 0; },
      set(v) { target = v; }
    };
  })();

  let clockTimer = 0;
  function clock() {
    const d = new Date();
    const s = `${ymd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    $$('[data-clock]').forEach((el) => { el.textContent = s; });
  }

  /* ------------------------------------------------------------------
     6. Elements
     ------------------------------------------------------------------ */
  const el = {
    hud: $('.hud'),
    status: $('#hud-status'),
    statusText: $('#hud-status-text'),
    scenes: $$('.scene'),
    intercept: $('[data-scene="intercept"]'),
    arrival: $('[data-scene="arrival"]'),
    file: $('[data-scene="file"]'),
    tLines: $$('.t-line'),
    skip: $('.skip-link'),
    folder: $('#folder'),
    pocket: $('#pocket'),
    stack: $('#stack'),
    dossier: $('#dossier'),
    briefing: $('#briefing'),
    btnOpen: $('#btn-open'),
    btnDeclassify: $('#btn-declassify'),
    btnTicket: $('#btn-ticket'),
    btnReplay: $('#btn-replay'),
    fileActions: $('#file-actions'),
    clearance: $('#clearance'),
    clearanceBar: $('#clearance-bar'),
    clearancePct: $('#clearance-pct'),
    layer: $('#ticket-layer'),
    ticket: $('#ticket'),
    replay: $('#replay')
  };

  function show(name) {
    el.scenes.forEach((s) => s.classList.toggle('is-active', s.dataset.scene === name));
    body.dataset.scene = name;
  }

  /* ------------------------------------------------------------------
     7. SCENE 01 — intercepted transmission
     ------------------------------------------------------------------ */
  async function typeLine(line, text) {
    const out = $('.t-text', line);
    line.classList.add('is-visible', 'is-typing');
    if (reduced) { out.textContent = text; line.classList.remove('is-typing'); return; }
    for (let i = 1; i <= text.length; i++) {
      guard();
      out.textContent = text.slice(0, i);
      const ch = text[i - 1];
      let d = 30 + Math.random() * 40;
      if (ch === ':') d += 220;
      await sleep(d * tempo);
    }
    line.classList.remove('is-typing');
  }

  async function glitch(ms) {
    ms = ms || 700;
    if (reduced) return;
    body.classList.add('is-glitching');
    await sleep(ms);
    body.classList.remove('is-glitching');
  }

  async function intro() {
    show('intercept');
    Scope.start();
    clock();
    clockTimer = setInterval(clock, 1000);

    if (store.get()) {
      el.skip.hidden = false;
      later(() => el.skip.classList.add('is-on'), 1500);
    }

    await hold(500); guard();
    $('.signal').classList.add('is-on');
    el.hud.classList.add('is-on');
    await wait(1400); guard();
    $('.scope').classList.add('is-on');

    for (let i = 0; i < LINES.length; i++) {
      Scope.set(0.95);
      await typeLine(el.tLines[i], LINES[i]); guard();
      Scope.set(0.22);
      announce(LINES[i]);
      if (i < LINES.length - 1) { await wait(i === 0 ? 750 : 600); guard(); }
    }
    el.tLines[2].classList.add('is-confirmed');
    Scope.set(0.65);
    await wait(1000); guard();
    await glitch(); guard();
    await toArrival();
  }

  /* ------------------------------------------------------------------
     8. SCENE 01b — the red file emerges
     ------------------------------------------------------------------ */
  function layoutPocket() {
    const d = el.dossier;
    if (!d.classList.contains('in-pocket')) return;
    el.file.classList.add('is-measuring');
    const sheetW = el.stack.clientWidth;
    el.file.classList.remove('is-measuring');
    d.style.width = `${sheetW}px`;
    const h = d.offsetHeight;
    const pw = el.pocket.clientWidth;
    const ph = el.pocket.clientHeight;
    const s = Math.min((pw * 0.94) / sheetW, (ph * 0.95) / h);
    const ox = (pw - sheetW * s) / 2;
    const oy = (ph - h * s) / 2;
    d.style.transform = `translate(${ox}px, ${oy}px) scale(${s})`;
  }

  function decode(node, text, dur) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/*';
    if (reduced) { node.textContent = text; return Promise.resolve(); }
    const t0 = performance.now();
    return new Promise((res) => {
      (function f(nowTs) {
        const p = Math.min(1, (nowTs - t0) / dur);
        const lock = Math.floor(p * text.length);
        let s = '';
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          s += (i < lock || c === ' ' || c === '/' || c === '.') ? c : glyphs[(Math.random() * glyphs.length) | 0];
        }
        node.textContent = s;
        if (p < 1) requestAnimationFrame(f); else { node.textContent = text; res(); }
      })(t0);
    });
  }

  async function toArrival() {
    await anim($('.intercept'), [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(4px)' }], { duration: 650, easing: 'ease-in' });
    guard();
    Scope.stop();
    clearInterval(clockTimer);
    tempo = 1;
    el.skip.classList.remove('is-on');
    show('arrival');
    layoutPocket();

    const folderAnim = anim(el.folder, [
      { opacity: 0, transform: 'translateY(34px) scale(.93)', filter: 'brightness(0) blur(10px)' },
      { opacity: 1, transform: 'none', filter: 'brightness(1) blur(0px)' }
    ], { duration: 2100, easing: 'cubic-bezier(.2,.65,.2,1)' });

    const [title, meta, cta] = $$('.arrival [data-reveal]');
    await wait(1200); guard();
    title.classList.add('is-on');
    announce(title.textContent);
    await wait(500); guard();
    meta.classList.add('is-on');
    decode(meta, meta.textContent, 900);
    await wait(600); guard();
    cta.classList.add('is-on');
    el.btnOpen.disabled = false;

    const a = await folderAnim;
    el.folder.style.opacity = '1';
    if (a) a.cancel(); // drop the filter so the 3D cover renders correctly
  }

  /* ------------------------------------------------------------------
     9. SCENE 02 — the dossier opens
     ------------------------------------------------------------------ */
  function shake(node) {
    if (!node || reduced || typeof node.animate !== 'function') return;
    node.animate([
      { transform: 'translate(0, 0)' },
      { transform: 'translate(1px, 3px)' },
      { transform: 'translate(-1px, -1px)' },
      { transform: 'translate(0, 0)' }
    ], { duration: 190, easing: 'ease-out' });
  }

  function slam(stamp, rot) {
    const base = `translate(-50%, -50%) rotate(${rot}deg)`;
    later(() => shake(stamp.closest('.sheet')), 230);
    return anim(stamp, [
      { opacity: 0, transform: `${base} scale(2.1)` },
      { opacity: 0.92, transform: `${base} scale(.965)`, offset: 0.7 },
      { opacity: 0.88, transform: `${base} scale(1)` }
    ], { duration: 330, easing: 'cubic-bezier(.5,0,.75,.3)' });
  }

  async function openDossier() {
    if (state.busy || el.btnOpen.disabled) return;
    state.busy = true;
    el.btnOpen.disabled = true;
    const d = el.dossier;

    anim($('.arrival__text'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(14px)' }], { duration: 450, easing: 'ease-in' });
    el.folder.classList.add('is-unwinding');
    await wait(480);
    el.folder.classList.add('is-open');
    await wait(1100);

    // FLIP: lift the sheet out of the folder into the reading position
    const first = d.getBoundingClientRect();
    el.arrival.classList.add('is-leaving');
    show('file');
    el.stack.insertBefore(d, el.stack.firstChild);
    d.classList.remove('in-pocket');
    d.style.width = '';
    d.style.transform = '';
    window.scrollTo(0, 0);
    const last = d.getBoundingClientRect();
    const s = first.width / last.width;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    d.style.transformOrigin = '0 0';

    anim(el.folder, [{ transform: 'none' }, { transform: 'translateY(70px) scale(.9)' }], { duration: 1000, easing: 'ease-in' });
    anim(el.arrival, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 250, easing: 'ease-in' })
      .then(() => { el.arrival.classList.remove('is-leaving'); });

    await anim(d, [
      { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.3 - 26}px) scale(${s + (1 - s) * 0.55}) rotate(-1.4deg)`, offset: 0.5 },
      { transform: 'none' }
    ], { duration: 1350, easing: 'cubic-bezier(.33,.7,.2,1)' });
    d.style.transformOrigin = '';
    d.classList.add('is-flat');

    await wait(180);
    await slam($('.stamp--classified', d), -13);
    await wait(420);
    $('.hand--name', d).classList.add('is-written');
    await wait(800);
    el.fileActions.classList.add('is-on');
    el.btnDeclassify.disabled = false;
    // on short screens the button sits below the fold — bring it into view
    const br = el.btnDeclassify.getBoundingClientRect();
    if (br.bottom > window.innerHeight - 12) {
      window.scrollTo({ top: window.scrollY + br.bottom - window.innerHeight + 28, behavior: reduced ? 'auto' : 'smooth' });
    }
    announce('Az akta megnyílt. Szigorúan titkos. A megbízó és a küldetés titkosítva.');
    state.busy = false;
  }

  /* ------------------------------------------------------------------
     10. SCENE 03 — declassification
     ------------------------------------------------------------------ */
  function revealSecret(node) {
    node.classList.add('is-revealed');
  }

  function setProgress(p) {
    el.clearanceBar.style.transform = `scaleX(${p})`;
    el.clearancePct.textContent = `${Math.round(p * 100)}%`;
  }
  function runProgress(dur) {
    return new Promise((res) => {
      if (reduced) { setProgress(1); res(); return; }
      const t0 = performance.now();
      (function f(ts) {
        const p = Math.min(1, (ts - t0) / dur);
        setProgress(1 - Math.pow(1 - p, 1.8));
        if (p < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }

  function scrollTopIfNeeded() {
    if (window.scrollY < 4) return Promise.resolve();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    return sleep(reduced ? 0 : 520);
  }

  async function declassify() {
    if (state.busy || el.btnDeclassify.disabled) return;
    state.busy = true;
    el.btnDeclassify.disabled = true;
    const d = el.dossier;
    el.fileActions.classList.remove('is-on');
    await scrollTopIfNeeded();
    await wait(200);

    // 1 — flicker
    anim($('.fx__flash'), [
      { opacity: 0 }, { opacity: 0.24 }, { opacity: 0 }, { opacity: 0.06 }, { opacity: 0.38 }, { opacity: 0 }
    ], { duration: 340, easing: 'steps(1, end)', fill: 'none' });
    anim(d, [
      { filter: 'brightness(1)' }, { filter: 'brightness(1.5) contrast(1.2)' }, { filter: 'brightness(.75)' }, { filter: 'brightness(1)' }
    ], { duration: 340, easing: 'steps(1, end)', fill: 'none' });
    await wait(400);

    // 2 — clearance HUD + scanning beam
    const rows = $$('.clearance__row', el.clearance);
    const doneRow = (i) => {
      rows[i].classList.add('is-done');
      $('b', rows[i]).textContent = 'KÉSZ';
    };
    setProgress(0);
    el.clearance.classList.add('is-on');
    runProgress(3000);
    later(() => doneRow(0), 500);
    later(() => doneRow(1), 1500);

    const H = d.offsetHeight;
    const D = 2000;
    const top0 = d.getBoundingClientRect().top;
    const yOf = (node) => { const r = node.getBoundingClientRect(); return r.top - top0 + r.height / 2; };
    const at = (node, fn, extra) => later(fn, (yOf(node) / H) * D + (extra || 0));

    d.classList.add('is-scanning');
    const beam = anim($('.scanbeam', d), [
      { transform: 'translateY(0px)', opacity: 0 },
      { opacity: 1, offset: 0.04 },
      { opacity: 1, offset: 0.95 },
      { transform: `translateY(${H}px)`, opacity: 0 }
    ], { duration: D, easing: 'linear' });

    $$('[data-secret]', d).forEach((node) => at(node, () => revealSecret(node)));

    const classified = $('.stamp--classified', d);
    at(classified, () => {
      anim(classified, [
        { opacity: 0.88, transform: 'translate(-50%, -50%) rotate(-13deg) scale(1)' },
        { opacity: 0, transform: 'translate(-50%, -50%) rotate(-21deg) scale(1.07)' }
      ], { duration: 700, easing: 'cubic-bezier(.4,0,.2,1)' });
    }, -250);

    const access = $('#access-value');
    at(access, () => {
      access.classList.add('is-struck');
      later(() => $('#access-note').classList.add('is-written'), 380);
    }, 120);

    await beam;
    d.classList.remove('is-scanning');
    await wait(140);

    // 3 — the new stamp
    await slam($('.stamp--declassified', d), -7);
    await wait(260);
    $('#secret-note').classList.add('is-written');
    await wait(420);
    doneRow(2);
    setProgress(1);
    setStatusOpen();
    announce('Titkosítás feloldva. Küldetés: ' + V.missionUpper + '. Kapcsolatfelvétel: ' + V.contactPhone + '. A megbízó kiléte titok marad.');

    // let the visitor take in the declassified page
    await hold(2600);
    el.clearance.classList.remove('is-on');
    await revealBriefing(false);
    state.busy = false;
  }

  /* ------------------------------------------------------------------
     11. SCENE 04 — the mission briefing
     ------------------------------------------------------------------ */
  let noteObserver = null;
  function watchBriefing() {
    const targets = [$('#note'), $('#briefing-close')];
    if (!('IntersectionObserver' in window) || reduced) {
      targets.forEach((t) => t && t.classList.add('is-in'));
      return;
    }
    noteObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          noteObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.28 });
    targets.forEach((t) => t && noteObserver.observe(t));
  }

  async function revealBriefing(instant) {
    const d = el.dossier;
    const b = el.briefing;
    if (!instant) await scrollTopIfNeeded();
    b.classList.add('is-shown');
    el.fileActions.classList.add('is-done');

    if (!instant && !d.classList.contains('is-gone')) {
      d.style.transformOrigin = '50% 0';
      await anim(d, [
        { transform: 'perspective(1800px) rotateX(0deg)', opacity: 1 },
        { transform: 'perspective(1800px) rotateX(14deg) translateY(-8px)', opacity: 1, offset: 0.28 },
        { transform: 'perspective(1800px) rotateX(96deg) translateY(-70px)', opacity: 0 }
      ], { duration: 1050, easing: 'cubic-bezier(.55,0,.7,.2)' });
    }
    d.classList.add('is-gone');
    d.setAttribute('aria-hidden', 'true');

    // next frame so the stagger transitions run
    requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('is-live')));
    watchBriefing();
    el.replay.classList.add('is-on');
    store.set();

    const h = $('#briefing-title');
    h.setAttribute('tabindex', '-1');
    try { h.focus({ preventScroll: true }); } catch (e) { /* older Safari */ }
    announce('Küldetési eligazítás. ' + $('#note-text').textContent);
  }

  function setStatusOpen() {
    el.status.classList.add('is-open');
    el.statusText.textContent = 'FELOLDVA';
  }

  function jumpToBriefing() {
    setStatusOpen();
    state.alive = false;
    Scope.stop();
    clearInterval(clockTimer);
    tempo = 1;
    el.hud.classList.add('is-on');
    show('file');
    window.scrollTo(0, 0);
    revealBriefing(true);
  }

  /* ------------------------------------------------------------------
     12. The ticket
     ------------------------------------------------------------------ */
  let lastFocus = null;
  function sheen() {
    el.ticket.classList.remove('is-sheen');
    void el.ticket.offsetWidth;
    el.ticket.classList.add('is-sheen');
  }
  function onTicketKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeTicket(); }
    if (e.key === 'Tab') { e.preventDefault(); $('.ticket-close', el.layer).focus(); }
  }
  function openTicket() {
    lastFocus = document.activeElement;
    el.layer.hidden = false;
    document.documentElement.classList.add('is-locked');
    el.layer.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => el.layer.classList.add('is-open')));
    later(sheen, 650);
    $('.ticket-close', el.layer).focus({ preventScroll: true });
    document.addEventListener('keydown', onTicketKey);
    announce('Belépő: ' + V.museumUpper + ', ' + V.cityUpper + ', ' + V.guestsLabel + ', ' + V.recipientName + '. Sorozatszám ' + V.ticketSerial + '.');
  }
  function closeTicket() {
    el.layer.classList.remove('is-open');
    document.removeEventListener('keydown', onTicketKey);
    setTimeout(() => {
      el.layer.hidden = true;
      document.documentElement.classList.remove('is-locked');
    }, reduced ? 0 : 450);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function tiltSetup() {
    const wrap = $('.ticket-wrap');
    const t = el.ticket;
    wrap.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || reduced || !el.layer.classList.contains('is-open')) return;
      const r = t.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      t.classList.add('is-tilting');
      t.style.setProperty('--ry', `${(px * 12).toFixed(2)}deg`);
      t.style.setProperty('--rx', `${(-py * 9).toFixed(2)}deg`);
    });
    wrap.addEventListener('pointerleave', () => {
      t.classList.remove('is-tilting');
      t.style.setProperty('--rx', '0deg');
      t.style.setProperty('--ry', '0deg');
    });
  }

  /* ------------------------------------------------------------------
     13. Boot
     ------------------------------------------------------------------ */
  function wire() {
    el.intercept.addEventListener('pointerdown', () => { tempo = 0.12; });
    el.skip.addEventListener('click', jumpToBriefing);

    el.btnOpen.addEventListener('click', openDossier);
    el.folder.addEventListener('click', openDossier);
    el.btnDeclassify.addEventListener('click', declassify);
    el.btnTicket.addEventListener('click', openTicket);
    $$('[data-close]', el.layer).forEach((n) => n.addEventListener('click', closeTicket));
    $('#ticket-star').addEventListener('click', sheen);
    el.btnReplay.addEventListener('click', () => {
      window.scrollTo(0, 0);
      window.location.reload();
    });
    tiltSetup();

    let rz = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(rz);
      rz = requestAnimationFrame(() => {
        if (body.dataset.scene === 'arrival' && !state.busy) layoutPocket();
      });
    });
  }

  async function boot() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    bind();
    splitWords($('#note-text'));
    barcode($('#ticket-code'), V.ticketSerial);
    el.tLines.forEach((l) => { $('.t-text', l).textContent = ''; });
    el.pocket.appendChild(el.dossier);
    el.dossier.classList.add('in-pocket');
    wire();

    if (document.fonts && document.fonts.load) {
      const faces = ['400 13px "IBM Plex Mono"', '500 12px "IBM Plex Mono"', '700 24px "Space Grotesk"', '400 15px "Courier Prime"', '700 17px "Courier Prime"', '600 22px "Caveat"'];
      await Promise.race([Promise.all(faces.map((f) => document.fonts.load(f).catch(() => null))), sleep(1600)]);
    }

    intro().catch((err) => { if (!(err instanceof Abort)) console.error(err); });
  }

  boot();
})();
