/**
 * AxisChronicle: player, library and reader
 * An original imprint by SQUARGRAPH™
 *
 * - 8-second panel player with ambient room tone (Web Audio)
 * - Screenplay and character archive
 * - Library of films, stories and articles from assets/data/library.json
 * - Reader drawer (stories, articles) with shareable #read=<id> links
 * - Watch dialog for films that carry an "embed" URL
 */
(function () {
  'use strict';

  var PANEL_SECONDS = 8;
  var RING_LENGTH = 2 * Math.PI * 13;

  var state = {
    panels: [],
    library: [],
    characters: [],
    index: 0,
    elapsed: 0,
    playing: false,
    lastTs: null,
    ambient: false,
    audioCtx: null,
    audioGain: null,
    filter: 'all',
    drawerOpener: null
  };

  function $(id) { return document.getElementById(id); }

  var dom = {
    canvas: $('cinemaCanvas'),
    stage: $('playerStage'),
    start: $('playerStart'),
    counter: $('playerPanelCounter'),
    teleScene: $('teleScene'),
    teleDirection: $('teleDirection'),
    ring: $('timerRingCircle'),
    ringText: $('timerCountdownText'),
    play: $('btnPlay'),
    playIcon: $('playIcon'),
    pauseIcon: $('pauseIcon'),
    prev: $('btnPrev'),
    next: $('btnNext'),
    scrub: $('deckScrubber'),
    scrubBar: $('deckProgress'),
    ticks: $('deckTicks'),
    now: $('deckCurrentTime'),
    total: $('deckTotalTime'),
    fullscreen: $('btnFullscreen'),
    ambientBtn: $('btnAmbientAudio'),
    soundText: $('soundStatusText'),
    scriptList: $('scriptListView'),
    characters: $('charactersView'),
    tabScript: $('tabBtnScript'),
    tabCharacters: $('tabBtnCharacters'),
    libraryGrid: $('libraryGrid'),
    libraryEmpty: $('libraryEmpty'),
    filters: $('libraryFilters'),
    drawer: $('editorialDrawer'),
    backdrop: $('drawerBackdrop'),
    drawerClose: $('drawerCloseBtn'),
    drawerCategory: $('drawerCategory'),
    drawerTitle: $('drawerTitle'),
    drawerSubtitle: $('drawerSubtitle'),
    drawerMeta: $('drawerMeta'),
    drawerContent: $('drawerContent'),
    watch: $('watchDialog'),
    watchTitle: $('watchTitle'),
    watchFrame: $('watchFrame'),
    watchClose: $('watchCloseBtn'),
    form: $('inquiryForm'),
    formStatus: $('inqStatus')
  };

  var ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  /* ---------- helpers ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(n, len) { return String(n).padStart(len || 2, '0'); }
  function formatTime(sec) { return pad(Math.floor(sec / 60)) + ':' + pad(Math.floor(sec % 60)); }
  function totalSeconds() { return (state.panels.length || 75) * PANEL_SECONDS; }

  function fetchJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url + ' ' + res.status);
      return res.json();
    });
  }

  /* ---------- canvas ---------- */
  function setupCanvas() {
    if (!dom.canvas || !ctx) return;
    var rect = dom.canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    dom.canvas.width = Math.max(1, Math.round((rect.width || 1280) * dpr));
    dom.canvas.height = Math.max(1, Math.round((rect.height || 720) * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var PHASES = [
    { to: 16, stops: ['rgba(196,128,72,.28)', 'rgba(45,52,42,.45)', '#080a08'], at: [.65, .38] },
    { to: 23, stops: ['rgba(85,95,82,.22)', 'rgba(20,24,20,.65)', '#050705'], at: [.48, .45] },
    { to: 39, stops: ['rgba(52,65,68,.32)', 'rgba(22,26,26,.7)', '#070909'], at: [.5, .5] },
    { to: 56, stops: ['rgba(172,60,68,.35)', 'rgba(68,40,42,.4)', '#090808'], at: [.58, .46] },
    { to: 63, stops: ['rgba(186,142,85,.28)', 'rgba(38,34,28,.55)', '#080807'], at: [.52, .48] },
    { to: 70, stops: ['rgba(35,55,65,.3)', 'rgba(15,20,24,.7)', '#040608'], at: [.45, .55] },
    { to: 999, stops: ['rgba(240,238,225,.45)', 'rgba(75,80,72,.35)', '#080a08'], at: [.5, .35] }
  ];

  function renderCanvas(panel) {
    if (!ctx || !dom.canvas || !panel) return;
    var dpr = window.devicePixelRatio || 1;
    var w = dom.canvas.width / dpr;
    var h = dom.canvas.height / dpr;
    var n = panel.panel || 1;

    ctx.fillStyle = '#050605';
    ctx.fillRect(0, 0, w, h);

    var phase = PHASES.find(function (p) { return n <= p.to; }) || PHASES[PHASES.length - 1];
    var cx = w * phase.at[0];
    var cy = h * phase.at[1];
    var grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.72);
    grad.addColorStop(0, phase.stops[0]);
    grad.addColorStop(0.5, phase.stops[1]);
    grad.addColorStop(1, phase.stops[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // framing lines
    ctx.strokeStyle = 'rgba(250,250,249,.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5); ctx.lineTo(w * 0.85, h * 0.5);
    ctx.moveTo(w * 0.5, h * 0.18); ctx.lineTo(w * 0.5, h * 0.82);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(216,233,161,.16)';
    ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

    // vignette
    var vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.3, w * 0.5, h * 0.5, w * 0.72);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.82)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // grain
    ctx.fillStyle = 'rgba(250,250,249,.05)';
    for (var i = 0; i < 180; i++) {
      var s = Math.random() * 1.5 + 0.5;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }

    // frame stamp (skipped on small stages, where the HUD chips already carry it)
    if (w >= 600) {
      ctx.fillStyle = 'rgba(250,250,249,.88)';
      ctx.font = '700 13px Satoshi, sans-serif';
      ctx.fillText('AXISCHRONICLE / BARIBARI', w * 0.12, h * 0.16);
      ctx.fillStyle = '#d8e9a1';
      ctx.font = '500 11px Satoshi, sans-serif';
      ctx.fillText(panel.id + ' / ' + panel.startTime + ' to ' + panel.endTime, w * 0.12, h * 0.19);
    }
    ctx.strokeStyle = 'rgba(216,233,161,.4)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  /* ---------- player ---------- */
  function updateProgress() {
    var total = totalSeconds();
    var current = state.index * PANEL_SECONDS + state.elapsed;
    var pct = Math.min(100, Math.max(0, (current / total) * 100));
    if (dom.scrubBar) dom.scrubBar.style.width = pct + '%';
    if (dom.scrub) dom.scrub.setAttribute('aria-valuenow', String(Math.round(pct)));
    if (dom.now) dom.now.textContent = formatTime(current);
    if (dom.ring) {
      dom.ring.style.strokeDasharray = String(RING_LENGTH);
      dom.ring.style.strokeDashoffset = String(RING_LENGTH * (state.elapsed / PANEL_SECONDS));
    }
    if (dom.ringText) dom.ringText.textContent = Math.ceil(PANEL_SECONDS - state.elapsed) + 's';
  }

  function highlightScript(index) {
    if (!dom.scriptList) return;
    var cards = dom.scriptList.children;
    for (var i = 0; i < cards.length; i++) cards[i].classList.toggle('is-active', i === index);
  }

  function renderPanel(index) {
    if (!state.panels.length) return;
    state.index = Math.max(0, Math.min(index, state.panels.length - 1));
    var p = state.panels[state.index];
    if (dom.counter) dom.counter.textContent = 'PANEL ' + pad(p.panel, 3) + ' / ' + pad(state.panels.length, 3);
    if (dom.teleScene) dom.teleScene.textContent = p.scene + ' [' + p.startTime + ' to ' + p.endTime + ']';
    if (dom.teleDirection) dom.teleDirection.textContent = p.direction;
    updateProgress();
    renderCanvas(p);
    highlightScript(state.index);
  }

  function setPlayingUI(on) {
    if (dom.playIcon) dom.playIcon.style.display = on ? 'none' : 'block';
    if (dom.pauseIcon) dom.pauseIcon.style.display = on ? 'block' : 'none';
    if (dom.stage) dom.stage.classList.toggle('is-playing', on);
  }

  function tick(ts) {
    if (!state.playing) return;
    if (!state.lastTs) state.lastTs = ts;
    state.elapsed += (ts - state.lastTs) / 1000;
    state.lastTs = ts;
    if (state.elapsed >= PANEL_SECONDS) {
      state.elapsed = 0;
      if (state.index < state.panels.length - 1) {
        renderPanel(state.index + 1);
      } else {
        pause();
        renderPanel(0);
        return;
      }
    } else {
      updateProgress();
    }
    requestAnimationFrame(tick);
  }

  function play() {
    if (!state.panels.length || state.playing) return;
    state.playing = true;
    state.lastTs = performance.now();
    setPlayingUI(true);
    if (state.ambient && state.audioCtx && state.audioCtx.state === 'suspended') state.audioCtx.resume();
    requestAnimationFrame(tick);
  }

  function pause() {
    state.playing = false;
    setPlayingUI(false);
  }

  function togglePlay() { if (state.playing) pause(); else play(); }
  function step(delta) { state.elapsed = 0; renderPanel(state.index + delta); }

  function seek(clientX) {
    var rect = dom.scrub.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    state.elapsed = 0;
    renderPanel(Math.floor(pct * state.panels.length));
  }

  function toggleFullscreen() {
    if (!dom.stage) return;
    if (!document.fullscreenElement) {
      if (dom.stage.requestFullscreen) dom.stage.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  /* ---------- ambient audio ---------- */
  function initAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      state.audioCtx = new AC();
      state.audioGain = state.audioCtx.createGain();
      state.audioGain.gain.setValueAtTime(0, state.audioCtx.currentTime);
      var o1 = state.audioCtx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(55, state.audioCtx.currentTime);
      var o2 = state.audioCtx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(110, state.audioCtx.currentTime);
      var lp = state.audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(260, state.audioCtx.currentTime);
      o1.connect(lp); o2.connect(lp);
      lp.connect(state.audioGain);
      state.audioGain.connect(state.audioCtx.destination);
      o1.start(); o2.start();
      return true;
    } catch (e) {
      return false;
    }
  }

  function toggleAmbient() {
    if (!state.audioCtx && !initAudio()) return;
    if (state.ambient) {
      state.audioGain.gain.setTargetAtTime(0, state.audioCtx.currentTime, 0.3);
      state.ambient = false;
    } else {
      if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
      state.audioGain.gain.setTargetAtTime(0.24, state.audioCtx.currentTime, 0.5);
      state.ambient = true;
    }
    if (dom.ambientBtn) {
      dom.ambientBtn.classList.toggle('is-active', state.ambient);
      dom.ambientBtn.setAttribute('aria-pressed', String(state.ambient));
    }
    if (dom.soundText) dom.soundText.textContent = state.ambient ? 'Room tone: on' : 'Room tone: off';
  }

  /* ---------- archive ---------- */
  function renderScript() {
    if (!dom.scriptList) return;
    dom.scriptList.textContent = '';
    state.panels.forEach(function (p, i) {
      var card = el('button', 'script-panel-card' + (i === state.index ? ' is-active' : ''));
      card.type = 'button';
      var top = el('div', 'script-panel-top');
      top.appendChild(el('span', 'script-panel-scene', p.id + ' · ' + p.scene));
      top.appendChild(el('span', 'script-panel-time', p.startTime + ' to ' + p.endTime));
      card.appendChild(top);
      card.appendChild(el('p', 'script-panel-direction', p.direction));
      card.addEventListener('click', function () {
        state.elapsed = 0;
        renderPanel(i);
        if (dom.stage) dom.stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      dom.scriptList.appendChild(card);
    });
  }

  function renderCharacters() {
    if (!dom.characters) return;
    dom.characters.textContent = '';
    state.characters.forEach(function (c) {
      var card = el('div', 'character-card');
      var a = el('div');
      a.appendChild(el('h4', null, c.name));
      a.appendChild(el('span', 'character-role-badge', c.role));
      a.appendChild(el('p', 'character-spec-text', c.castSpecification));
      var b = el('div');
      var block = el('div', 'character-wardrobe-block');
      block.appendChild(el('strong', null, 'Wardrobe and continuity'));
      var wardrobe = el('p');
      (c.wardrobe || []).forEach(function (w, i) {
        if (i) wardrobe.appendChild(document.createElement('br'));
        wardrobe.appendChild(document.createTextNode(w.phase + ': ' + w.attire));
      });
      block.appendChild(wardrobe);
      b.appendChild(block);
      b.appendChild(el('p', 'character-note', c.continuityRules));
      card.appendChild(a);
      card.appendChild(b);
      dom.characters.appendChild(card);
    });
  }

  function selectTab(which) {
    var script = which === 'script';
    dom.tabScript.classList.toggle('active', script);
    dom.tabCharacters.classList.toggle('active', !script);
    dom.tabScript.setAttribute('aria-selected', String(script));
    dom.tabCharacters.setAttribute('aria-selected', String(!script));
    dom.scriptList.hidden = !script;
    dom.characters.hidden = script;
  }

  /* ---------- library ---------- */
  var TYPE_LABEL = { film: 'Film', story: 'Story', article: 'Article' };
  var FILTER_EMPTY = {
    film: 'More films will be published here.',
    story: 'Stories will be published here. Check back soon.',
    article: 'Articles will be published here.',
    all: 'Nothing has been published yet.'
  };

  function safeUrl(value) {
    try {
      var u = new URL(value, window.location.href);
      return u.protocol === 'https:' ? u.href : '';
    } catch (e) { return ''; }
  }

  function buildCard(item) {
    var isFilm = item.type === 'film';
    var card = el('a', 'lib-card' + (isFilm ? ' lib-card--film' : ''));
    card.href = '#read=' + encodeURIComponent(item.id);
    card.dataset.id = item.id;

    var coverUrl = item.cover ? safeUrl(item.cover) || item.cover : '';
    if (coverUrl) {
      var media = el('div', 'lib-media');
      var img = document.createElement('img');
      img.src = coverUrl;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      media.appendChild(img);
      card.appendChild(media);
    }

    var meta = el('p', 'lib-meta');
    meta.appendChild(el('span', null, TYPE_LABEL[item.type] || 'Story'));
    if (item.category) meta.appendChild(el('span', null, item.category));
    var tail = item.type === 'film' ? item.duration : item.readTime;
    if (tail) meta.appendChild(el('span', null, tail));
    if (item.date) meta.appendChild(el('span', null, item.date));
    card.appendChild(meta);

    if (isFilm) {
      var lead = el('div');
      lead.appendChild(el('h3', null, item.title));
      if (item.subtitle) lead.appendChild(el('p', 'lib-sub', item.subtitle));
      var side = el('div', 'lib-side');
      if (item.excerpt) side.appendChild(el('p', 'lib-excerpt', item.excerpt));
      side.appendChild(el('span', 'text-link lib-cta', item.action || 'Watch'));
      card.appendChild(lead);
      card.appendChild(side);
    } else {
      card.appendChild(el('h3', null, item.title));
      if (item.subtitle) card.appendChild(el('p', 'lib-sub', item.subtitle));
      if (item.excerpt) card.appendChild(el('p', 'lib-excerpt', item.excerpt));
      card.appendChild(el('span', 'text-link lib-cta', item.type === 'story' ? 'Read the story' : 'Read the article'));
    }
    return card;
  }

  function renderLibrary() {
    if (!dom.libraryGrid) return;
    var counts = { all: state.library.length, film: 0, story: 0, article: 0 };
    state.library.forEach(function (i) { if (counts[i.type] != null) counts[i.type]++; });
    document.querySelectorAll('[data-count]').forEach(function (n) {
      var c = counts[n.dataset.count];
      n.textContent = c ? String(c) : '';
    });

    var items = state.library.filter(function (i) { return state.filter === 'all' || i.type === state.filter; });
    items.sort(function (a, b) {
      if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
      return 0;
    });
    dom.libraryGrid.textContent = '';
    items.forEach(function (i) { dom.libraryGrid.appendChild(buildCard(i)); });
    dom.libraryGrid.hidden = items.length === 0;
    dom.libraryEmpty.hidden = items.length !== 0;
    dom.libraryEmpty.textContent = items.length ? '' : (FILTER_EMPTY[state.filter] || FILTER_EMPTY.all);
  }

  function setFilter(value) {
    state.filter = value;
    dom.filters.querySelectorAll('.filter-btn').forEach(function (b) {
      var on = b.dataset.filter === value;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderLibrary();
  }

  /* ---------- reader drawer ---------- */
  function openReader(item, opener) {
    if (!item || !dom.drawer) return;
    state.drawerOpener = opener || document.activeElement;
    dom.drawerCategory.textContent = (TYPE_LABEL[item.type] || 'Story') + (item.number ? ' ' + item.number : '') + (item.category ? ' / ' + item.category : '');
    dom.drawerTitle.textContent = item.title;
    dom.drawerSubtitle.textContent = item.subtitle || '';
    dom.drawerMeta.textContent = [item.author, item.role, item.readTime, item.date].filter(Boolean).join(' · ');
    dom.drawerContent.textContent = '';
    (item.content || [item.excerpt || '']).forEach(function (para) {
      dom.drawerContent.appendChild(el('p', null, para));
    });
    dom.drawer.removeAttribute('inert');
    dom.drawer.setAttribute('aria-hidden', 'false');
    dom.drawer.classList.add('is-open');
    dom.backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    dom.drawerClose.focus();
    var body = dom.drawer.querySelector('.drawer-body');
    if (body) body.scrollTop = 0;
  }

  function closeReader() {
    if (!dom.drawer || !dom.drawer.classList.contains('is-open')) return;
    dom.drawer.classList.remove('is-open');
    dom.backdrop.classList.remove('is-open');
    dom.drawer.setAttribute('aria-hidden', 'true');
    dom.drawer.setAttribute('inert', '');
    document.body.style.overflow = '';
    if (/^#read=/.test(window.location.hash)) history.replaceState(null, '', window.location.pathname + window.location.search);
    if (state.drawerOpener && state.drawerOpener.focus) state.drawerOpener.focus();
  }

  function openWatch(item) {
    var url = safeUrl(item.embed);
    if (!url || !dom.watch || typeof dom.watch.showModal !== 'function') return false;
    dom.watchTitle.textContent = item.title + (item.subtitle ? ': ' + item.subtitle : '');
    dom.watchFrame.textContent = '';
    var frame = document.createElement('iframe');
    frame.src = url;
    frame.title = item.title;
    frame.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    frame.setAttribute('allowfullscreen', '');
    frame.referrerPolicy = 'origin';
    dom.watchFrame.appendChild(frame);
    dom.watch.showModal();
    return true;
  }

  function openItem(item, opener) {
    if (!item) return;
    if (item.type === 'film') {
      if (item.embed && openWatch(item)) return;
      var target = $(item.target || 'screening');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    openReader(item, opener);
  }

  function findItem(id) {
    return state.library.filter(function (i) { return i.id === id; })[0];
  }

  function openFromHash() {
    var m = /^#read=(.+)$/.exec(window.location.hash);
    if (!m) return;
    var item = findItem(decodeURIComponent(m[1]));
    if (item) openItem(item);
  }

  /* ---------- screener form ---------- */
  function setupForm() {
    if (!dom.form) return;
    dom.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      dom.form.querySelectorAll('[required]').forEach(function (input) {
        var valid = input.value.trim() !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        var field = input.closest('.form-field');
        if (field) field.classList.toggle('has-error', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        dom.formStatus.textContent = 'Please complete the highlighted fields.';
        return;
      }
      var data = new FormData(dom.form);
      var body = [
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'Organisation: ' + data.get('organisation'),
        'Role: ' + data.get('role'),
        '',
        String(data.get('message') || '')
      ].join('\n');
      var href = 'mailto:squargraph@gmail.com?subject=' + encodeURIComponent('AxisChronicle screener request: ' + data.get('organisation')) + '&body=' + encodeURIComponent(body);
      dom.formStatus.textContent = 'Opening your email app with the request filled in. If nothing opens, write to squargraph@gmail.com.';
      window.location.href = href;
    });
  }

  /* ---------- events ---------- */
  function isTypingTarget(node) {
    if (!node || !node.tagName) return false;
    var tag = node.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
  }

  function bind() {
    if (dom.play) dom.play.addEventListener('click', togglePlay);
    if (dom.start) dom.start.addEventListener('click', play);
    if (dom.canvas) dom.canvas.addEventListener('click', togglePlay);
    if (dom.next) dom.next.addEventListener('click', function () { step(1); });
    if (dom.prev) dom.prev.addEventListener('click', function () { step(-1); });
    if (dom.scrub) {
      dom.scrub.addEventListener('click', function (e) { seek(e.clientX); });
      dom.scrub.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); step(-1); }
      });
    }
    if (dom.fullscreen) dom.fullscreen.addEventListener('click', toggleFullscreen);
    if (dom.ambientBtn) dom.ambientBtn.addEventListener('click', toggleAmbient);
    if (dom.tabScript) dom.tabScript.addEventListener('click', function () { selectTab('script'); });
    if (dom.tabCharacters) dom.tabCharacters.addEventListener('click', function () { selectTab('characters'); });

    if (dom.filters) {
      dom.filters.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (btn) setFilter(btn.dataset.filter);
      });
    }

    if (dom.libraryGrid) {
      dom.libraryGrid.addEventListener('click', function (e) {
        var card = e.target.closest('.lib-card');
        if (!card) return;
        e.preventDefault();
        var item = findItem(card.dataset.id);
        if (item && item.type !== 'film') history.replaceState(null, '', '#read=' + encodeURIComponent(item.id));
        openItem(item, card);
      });
    }

    if (dom.drawerClose) dom.drawerClose.addEventListener('click', closeReader);
    if (dom.backdrop) dom.backdrop.addEventListener('click', closeReader);
    if (dom.watchClose) dom.watchClose.addEventListener('click', function () { dom.watch.close(); });
    if (dom.watch) {
      dom.watch.addEventListener('close', function () { dom.watchFrame.textContent = ''; });
      dom.watch.addEventListener('click', function (e) { if (e.target === dom.watch) dom.watch.close(); });
    }

    window.addEventListener('hashchange', openFromHash);
    window.addEventListener('resize', function () {
      setupCanvas();
      if (state.panels.length) renderCanvas(state.panels[state.index]);
    });
    document.addEventListener('fullscreenchange', function () {
      setupCanvas();
      if (state.panels.length) renderCanvas(state.panels[state.index]);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeReader(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      if (dom.drawer && dom.drawer.classList.contains('is-open')) return;
      if (dom.watch && dom.watch.open) return;
      var focused = document.activeElement;
      var onControl = focused && focused.closest && focused.closest('button, a, summary, [role="slider"], [role="tab"]');
      if (e.code === 'Space') {
        if (onControl) return; // let the focused control handle its own activation
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        if (onControl && focused.getAttribute('role') === 'tab') return;
        step(1);
      } else if (e.code === 'ArrowLeft') {
        if (onControl && focused.getAttribute('role') === 'tab') return;
        step(-1);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleAmbient();
      }
    });
  }

  /* ---------- init ---------- */
  function renderTicks() {
    if (!dom.ticks) return;
    dom.ticks.textContent = '';
    for (var i = 0; i < (state.panels.length || 75); i += 5) dom.ticks.appendChild(el('div', 'player-scrub-tick'));
  }

  function init() {
    setupCanvas();
    bind();
    setupForm();
    Promise.all([
      fetchJson('/assets/data/baribari-panels.json').catch(function () { return []; }),
      fetchJson('/assets/data/library.json').catch(function () { return []; }),
      fetchJson('/assets/data/characters.json').catch(function () { return []; })
    ]).then(function (res) {
      state.panels = res[0];
      state.library = res[1];
      state.characters = res[2];
      if (dom.total) dom.total.textContent = formatTime(totalSeconds());
      renderTicks();
      renderPanel(0);
      renderScript();
      renderCharacters();
      renderLibrary();
      openFromHash();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
