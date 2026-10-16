/**
 * AXISCHRONICLE — CINEMATIC ENGINE & INTERACTIVE PLATFORM
 * An Original IP by SQUARGRAPH™
 * Architecture: 8-second discrete panel engine, Web Audio drone, editorial drawer
 */

(function () {
  'use strict';

  // State Management
  const state = {
    panels: [],
    editorials: [],
    characters: [],
    currentPanelIndex: 0,
    isPlaying: false,
    panelDuration: 8.0, // seconds
    panelElapsed: 0,
    timerId: null,
    lastTimestamp: null,
    isAmbientActive: false,
    audioContext: null,
    audioGain: null,
    teleprompterVisible: true
  };

  // DOM Elements Cache
  const dom = {
    canvas: document.getElementById('cinemaCanvas'),
    panelCounter: document.getElementById('playerPanelCounter'),
    teleprompterScene: document.getElementById('teleScene'),
    teleprompterDirection: document.getElementById('teleDirection'),
    timerRingCircle: document.getElementById('timerRingCircle'),
    timerText: document.getElementById('timerCountdownText'),
    playBtn: document.getElementById('btnPlay'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('btnPrev'),
    nextBtn: document.getElementById('btnNext'),
    scrubberBar: document.getElementById('deckScrubber'),
    scrubberProgress: document.getElementById('deckProgress'),
    scrubberTicks: document.getElementById('deckTicks'),
    currentTimeDisplay: document.getElementById('deckCurrentTime'),
    totalTimeDisplay: document.getElementById('deckTotalTime'),
    fullscreenBtn: document.getElementById('btnFullscreen'),
    playerStageWrap: document.getElementById('playerStage'),
    ambientToggleTop: document.getElementById('toplineSoundBtn'),
    ambientToggleDeck: document.getElementById('btnAmbientAudio'),
    soundStatusText: document.getElementById('soundStatusText'),
    scriptList: document.getElementById('scriptListView'),
    charactersGrid: document.getElementById('charactersView'),
    tabScript: document.getElementById('tabBtnScript'),
    tabCharacters: document.getElementById('tabBtnCharacters'),
    editorialDrawer: document.getElementById('editorialDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    drawerCloseBtn: document.getElementById('drawerCloseBtn'),
    drawerCategory: document.getElementById('drawerCategory'),
    drawerTitle: document.getElementById('drawerTitle'),
    drawerSubtitle: document.getElementById('drawerSubtitle'),
    drawerMeta: document.getElementById('drawerMeta'),
    drawerContent: document.getElementById('drawerContent'),
    inquiryDialog: document.getElementById('inquiryDialog'),
    inquiryOpenBtns: document.querySelectorAll('[data-open-inquiry]'),
    inquiryCloseBtn: document.getElementById('inquiryCloseBtn'),
    inquiryForm: document.getElementById('inquiryForm'),
    mobileNavToggle: document.getElementById('mobileNavToggle'),
    navLinks: document.getElementById('navLinks')
  };

  let ctx = dom.canvas ? dom.canvas.getContext('2d') : null;

  // Initialize
  async function init() {
    setupCanvas();
    setupEventListeners();
    await loadData();
    renderScrubberTicks();
    renderPanel(0);
    renderScriptList();
    renderCharacters();
  }

  // Load Data
  async function loadData() {
    try {
      const [panelsRes, editorialRes, charRes] = await Promise.all([
        fetch('./assets/data/baribari-panels.json'),
        fetch('./assets/data/editorial.json'),
        fetch('./assets/data/characters.json')
      ]);

      state.panels = await panelsRes.json();
      state.editorials = await editorialRes.json();
      state.characters = await charRes.json();
    } catch (err) {
      console.warn('Local fetch error or offline protocol fallback; using embedded baseline.', err);
      // Fallback baseline for panels if fetch is restricted
      if (!state.panels || state.panels.length === 0) {
        state.panels = generateFallbackPanels();
      }
    }
  }

  function generateFallbackPanels() {
    const list = [];
    const scenes = [
      { start: 1, end: 16, title: "EXT. QUIET RESIDENTIAL LANE — DUSK", dir: "Saurabh cycles down a dusty residential street at amber dusk, slowing as three women appear at an upper stone window." },
      { start: 17, end: 23, title: "INT. SAURABH'S HOME — DUSK", dir: "He returns home and systematically changes into all-black trousers, jacket, and boots." },
      { start: 24, end: 39, title: "EXT. LANE AND INT. SHORTCUT HOUSE — EVENING", dir: "He takes a shortcut through an open door, only to find himself trapped in a recurring concrete maze." },
      { start: 40, end: 56, title: "INT. SHOP PARTITION — EVENING", dir: "A shutter opens, revealing Baribari in deep burgundy traditional clothes. They talk, connect, and leave together." },
      { start: 57, end: 63, title: "INT. PARTY HOUSE — NIGHT", dir: "They attend a warm house gathering. Friends assume they are together; they do not deny it." },
      { start: 64, end: 70, title: "EXT. NIGHT STREET — NIGHT", dir: "Walking home, Baribari suddenly becomes unconscious. Saurabh catches her and carries her through a narrow gate." },
      { start: 71, end: 75, title: "INT. BEDROOM — MORNING", dir: "A blinding morning flare transitions to Saurabh waking abruptly. He remembers the name Baribari, but her surname has vanished." }
    ];

    let p = 1;
    scenes.forEach(s => {
      for (let i = s.start; i <= s.end; i++) {
        const startSec = (i - 1) * 8;
        const endSec = i * 8;
        const fmt = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
        list.push({
          panel: i,
          id: `P${String(i).padStart(3, '0')}`,
          startTime: fmt(startSec),
          endTime: fmt(endSec),
          scene: s.title,
          direction: `Panel ${i}: ${s.dir}`
        });
      }
    });
    return list;
  }

  // Canvas Setup
  function setupCanvas() {
    if (!dom.canvas) return;
    const rect = dom.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dom.canvas.width = (rect.width || 1280) * dpr;
    dom.canvas.height = (rect.height || 720) * dpr;
    if (ctx) ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    setupCanvas();
    if (state.panels.length > 0) renderSceneCanvas(state.panels[state.currentPanelIndex]);
  });

  // Render Scene Canvas (High-Atmosphere Procedural Arthouse Artwork)
  function renderSceneCanvas(panel) {
    if (!ctx || !dom.canvas) return;
    const w = dom.canvas.width / (window.devicePixelRatio || 1);
    const h = dom.canvas.height / (window.devicePixelRatio || 1);
    const pNum = panel.panel || 1;

    // Background base
    ctx.fillStyle = '#070907';
    ctx.fillRect(0, 0, w, h);

    // Scene color palette definition based on story phase
    let grad;
    if (pNum <= 16) {
      // Phase 1: Quiet lane, amber dusk, old stone house
      grad = ctx.createRadialGradient(w * 0.65, h * 0.38, 40, w * 0.65, h * 0.38, w * 0.7);
      grad.addColorStop(0, 'rgba(196, 128, 72, 0.28)'); // warm amber dusk
      grad.addColorStop(0.4, 'rgba(45, 52, 42, 0.45)');
      grad.addColorStop(1, '#080a08');
    } else if (pNum <= 23) {
      // Phase 2: Saurabh's home, wardrobe change into black
      grad = ctx.createRadialGradient(w * 0.48, h * 0.45, 20, w * 0.48, h * 0.45, w * 0.6);
      grad.addColorStop(0, 'rgba(85, 95, 82, 0.22)');
      grad.addColorStop(0.5, 'rgba(20, 24, 20, 0.65)');
      grad.addColorStop(1, '#050705');
    } else if (pNum <= 39) {
      // Phase 3: The shortcut concrete maze, cold loops, repeating corridors
      grad = ctx.createRadialGradient(w * 0.5, h * 0.5, 30, w * 0.5, h * 0.5, w * 0.8);
      grad.addColorStop(0, 'rgba(52, 65, 68, 0.32)'); // cold concrete tone
      grad.addColorStop(0.5, 'rgba(22, 26, 26, 0.7)');
      grad.addColorStop(1, '#070909');
    } else if (pNum <= 56) {
      // Phase 4: Meeting Baribari, warm shutter light, deep burgundy presence
      grad = ctx.createRadialGradient(w * 0.58, h * 0.46, 30, w * 0.58, h * 0.46, w * 0.65);
      grad.addColorStop(0, 'rgba(172, 60, 68, 0.35)'); // rich burgundy glow
      grad.addColorStop(0.45, 'rgba(68, 40, 42, 0.4)');
      grad.addColorStop(1, '#090808');
    } else if (pNum <= 63) {
      // Phase 5: Warm house party, intimate gathering
      grad = ctx.createRadialGradient(w * 0.52, h * 0.48, 40, w * 0.52, h * 0.48, w * 0.65);
      grad.addColorStop(0, 'rgba(186, 142, 85, 0.28)'); // warm gathering
      grad.addColorStop(0.5, 'rgba(38, 34, 28, 0.55)');
      grad.addColorStop(1, '#080807');
    } else if (pNum <= 70) {
      // Phase 6: Night walk, collapse on street, carrying her through gate
      grad = ctx.createRadialGradient(w * 0.45, h * 0.55, 30, w * 0.45, h * 0.55, w * 0.7);
      grad.addColorStop(0, 'rgba(35, 55, 65, 0.3)'); // nocturnal indigo-cyan
      grad.addColorStop(0.5, 'rgba(15, 20, 24, 0.7)');
      grad.addColorStop(1, '#040608');
    } else {
      // Phase 7: Morning flare, waking up, disappearance of surname
      grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 50, w * 0.5, h * 0.35, w * 0.85);
      grad.addColorStop(0, 'rgba(240, 238, 225, 0.45)'); // pale morning flare
      grad.addColorStop(0.4, 'rgba(75, 80, 72, 0.35)');
      grad.addColorStop(1, '#080a08');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Architectural framing lines (SQUARGRAPH mathematical geometric grid)
    ctx.strokeStyle = 'rgba(250, 250, 249, 0.08)';
    ctx.lineWidth = 1;

    // Cross-hair center alignment cues
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.5);
    ctx.lineTo(w * 0.85, h * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.5, h * 0.82);
    ctx.stroke();

    // 16:9 inner cinematic safety boundary
    ctx.strokeStyle = 'rgba(216, 233, 161, 0.16)';
    ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

    // Vignette shadowing
    const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.3, w * 0.5, h * 0.5, w * 0.72);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.82)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Subtle 35mm film grain overlay simulation
    drawFilmNoise(ctx, w, h);

    // Cinematic Frame Stamp
    ctx.fillStyle = 'rgba(250, 250, 249, 0.88)';
    ctx.font = '700 13px Satoshi, sans-serif';
    ctx.fillText(`AXIS ORIGINAL 001 // BARIBARI`, w * 0.12, h * 0.16);

    ctx.fillStyle = '#d8e9a1';
    ctx.font = '500 11px Satoshi, sans-serif';
    ctx.fillText(`${panel.id} // ${panel.startTime} — ${panel.endTime}`, w * 0.12, h * 0.19);

    // Center scene atmosphere focal icon
    ctx.strokeStyle = 'rgba(216, 233, 161, 0.4)';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawFilmNoise(context, width, height) {
    const numSpecks = 180;
    context.fillStyle = 'rgba(250, 250, 249, 0.05)';
    for (let i = 0; i < numSpecks; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      context.fillRect(rx, ry, size, size);
    }
  }

  // Render Current Panel Data
  function renderPanel(index) {
    if (!state.panels || state.panels.length === 0) return;
    state.currentPanelIndex = Math.max(0, Math.min(index, state.panels.length - 1));
    const panel = state.panels[state.currentPanelIndex];

    // Counter & text
    if (dom.panelCounter) {
      dom.panelCounter.textContent = `PANEL ${String(panel.panel).padStart(3, '0')} / ${String(state.panels.length).padStart(3, '0')}`;
    }

    if (dom.teleprompterScene) {
      dom.teleprompterScene.textContent = `${panel.scene} [${panel.startTime} — ${panel.endTime}]`;
    }

    if (dom.teleprompterDirection) {
      dom.teleprompterDirection.textContent = panel.direction;
    }

    if (dom.currentTimeDisplay) {
      const currentSec = state.currentPanelIndex * 8 + Math.floor(state.panelElapsed);
      dom.currentTimeDisplay.textContent = formatTime(currentSec);
    }

    updateScrubberProgress();
    renderSceneCanvas(panel);
    highlightScriptItem(state.currentPanelIndex);
  }

  function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // Scrubber Ticks
  function renderScrubberTicks() {
    if (!dom.scrubberTicks) return;
    dom.scrubberTicks.innerHTML = '';
    const totalPanels = state.panels.length || 75;
    for (let i = 0; i < totalPanels; i += 5) {
      const tick = document.createElement('div');
      tick.className = 'scrubber-tick';
      dom.scrubberTicks.appendChild(tick);
    }
  }

  function updateScrubberProgress() {
    if (!dom.scrubberProgress) return;
    const totalSec = (state.panels.length || 75) * state.panelDuration;
    const currentSec = state.currentPanelIndex * state.panelDuration + state.panelElapsed;
    const pct = Math.min(100, Math.max(0, (currentSec / totalSec) * 100));
    dom.scrubberProgress.style.width = `${pct}%`;

    // Update countdown timer ring (8s interval)
    if (dom.timerRingCircle) {
      const circumference = 2 * Math.PI * 13; // r = 13
      const remainingSec = state.panelDuration - state.panelElapsed;
      const offset = circumference * (1 - state.panelElapsed / state.panelDuration);
      dom.timerRingCircle.style.strokeDashoffset = offset;
      if (dom.timerText) {
        dom.timerText.textContent = `${Math.ceil(remainingSec)}s`;
      }
    }
  }

  // Playback Loop
  function togglePlay() {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function play() {
    state.isPlaying = true;
    state.lastTimestamp = performance.now();
    if (dom.playIcon) dom.playIcon.style.display = 'none';
    if (dom.pauseIcon) dom.pauseIcon.style.display = 'block';

    if (state.isAmbientActive && state.audioContext && state.audioContext.state === 'suspended') {
      state.audioContext.resume();
    }

    requestAnimationFrame(playbackTick);
  }

  function pause() {
    state.isPlaying = false;
    if (dom.playIcon) dom.playIcon.style.display = 'block';
    if (dom.pauseIcon) dom.pauseIcon.style.display = 'none';
  }

  function playbackTick(timestamp) {
    if (!state.isPlaying) return;

    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const delta = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;

    state.panelElapsed += delta;

    if (state.panelElapsed >= state.panelDuration) {
      state.panelElapsed = 0;
      if (state.currentPanelIndex < state.panels.length - 1) {
        state.currentPanelIndex++;
        renderPanel(state.currentPanelIndex);
      } else {
        // Reached end of film
        pause();
        state.currentPanelIndex = 0;
        renderPanel(0);
        return;
      }
    } else {
      updateScrubberProgress();
    }

    requestAnimationFrame(playbackTick);
  }

  function stepNext() {
    state.panelElapsed = 0;
    if (state.currentPanelIndex < state.panels.length - 1) {
      renderPanel(state.currentPanelIndex + 1);
    }
  }

  function stepPrev() {
    state.panelElapsed = 0;
    if (state.currentPanelIndex > 0) {
      renderPanel(state.currentPanelIndex - 1);
    }
  }

  // Web Audio Ambient Engine (Slow-Burn Arthouse Drone)
  function toggleAmbientAudio() {
    if (!state.audioContext) {
      initAudio();
    }

    if (state.isAmbientActive) {
      state.audioGain.gain.setTargetAtTime(0, state.audioContext.currentTime, 0.3);
      state.isAmbientActive = false;
      updateSoundUI(false);
    } else {
      if (state.audioContext.state === 'suspended') {
        state.audioContext.resume();
      }
      state.audioGain.gain.setTargetAtTime(0.24, state.audioContext.currentTime, 0.5);
      state.isAmbientActive = true;
      updateSoundUI(true);
    }
  }

  function initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioCtx();

      state.audioGain = state.audioContext.createGain();
      state.audioGain.gain.setValueAtTime(0, state.audioContext.currentTime);

      // Low-frequency drone oscillator (Sub-harmonic 55 Hz / A1)
      const osc1 = state.audioContext.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, state.audioContext.currentTime);

      // Warm atmospheric harmonic (110 Hz / A2)
      const osc2 = state.audioContext.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, state.audioContext.currentTime);

      // Lowpass filter for warm analog darkness
      const filter = state.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, state.audioContext.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(state.audioGain);
      state.audioGain.connect(state.audioContext.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  function updateSoundUI(isActive) {
    if (dom.ambientToggleTop) {
      dom.ambientToggleTop.classList.toggle('is-active', isActive);
    }
    if (dom.ambientToggleDeck) {
      dom.ambientToggleDeck.classList.toggle('is-active', isActive);
    }
    if (dom.soundStatusText) {
      dom.soundStatusText.textContent = isActive ? 'Atmosphere: Active' : 'Sound: Muted';
    }
  }

  // Render Full Screenplay List
  function renderScriptList() {
    if (!dom.scriptList || !state.panels) return;
    dom.scriptList.innerHTML = '';

    state.panels.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = `script-panel-card ${idx === state.currentPanelIndex ? 'is-active' : ''}`;
      card.dataset.index = idx;
      card.innerHTML = `
        <div class="script-panel-top">
          <span class="script-panel-scene">${p.id} · ${p.scene}</span>
          <span class="script-panel-time">${p.startTime}–${p.endTime}</span>
        </div>
        <p class="script-panel-direction">${p.direction}</p>
      `;

      card.addEventListener('click', () => {
        state.panelElapsed = 0;
        renderPanel(idx);
        if (dom.playerStageWrap) {
          dom.playerStageWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });

      dom.scriptList.appendChild(card);
    });
  }

  function highlightScriptItem(index) {
    if (!dom.scriptList) return;
    const cards = dom.scriptList.querySelectorAll('.script-panel-card');
    cards.forEach((c, idx) => {
      if (idx === index) {
        c.style.borderColor = 'var(--accent)';
        c.style.background = '#161c16';
      } else {
        c.style.borderColor = 'var(--line)';
        c.style.background = '#0e120e';
      }
    });
  }

  // Render Characters Tab
  function renderCharacters() {
    if (!dom.charactersGrid || !state.characters) return;
    dom.charactersGrid.innerHTML = '';

    state.characters.forEach(char => {
      const cBox = document.createElement('div');
      cBox.className = 'character-card';
      cBox.innerHTML = `
        <div>
          <h4>${char.name}</h4>
          <span class="character-role-badge">${char.role}</span>
          <p class="character-spec-text">${char.castSpecification}</p>
        </div>
        <div>
          <div class="character-wardrobe-block">
            <strong>Wardrobe & Continuity</strong>
            <p>${char.wardrobe.map(w => `${w.phase}: ${w.attire}`).join('<br>')}</p>
          </div>
          <p style="margin-top: 10px; font-size: 11px; color: var(--muted);">${char.continuityRules}</p>
        </div>
      `;
      dom.charactersGrid.appendChild(cBox);
    });
  }

  // Editorial Drawer
  function openEditorialDrawer(essayId) {
    const essay = state.editorials.find(e => e.id === essayId) || state.editorials[0];
    if (!essay) return;

    if (dom.drawerCategory) dom.drawerCategory.textContent = `FIELD NOTE ${essay.number} // ${essay.category}`;
    if (dom.drawerTitle) dom.drawerTitle.textContent = essay.title;
    if (dom.drawerSubtitle) dom.drawerSubtitle.textContent = essay.subtitle;
    if (dom.drawerMeta) {
      dom.drawerMeta.textContent = `${essay.author} · ${essay.role} · ${essay.readTime}`;
    }

    if (dom.drawerContent) {
      dom.drawerContent.innerHTML = essay.content.map(p => `<p>${p}</p>`).join('');
    }

    if (dom.editorialDrawer) dom.editorialDrawer.classList.add('is-open');
    if (dom.drawerBackdrop) dom.drawerBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeEditorialDrawer() {
    if (dom.editorialDrawer) dom.editorialDrawer.classList.remove('is-open');
    if (dom.drawerBackdrop) dom.drawerBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Event Listeners
  function setupEventListeners() {
    // Play/Pause
    if (dom.playBtn) dom.playBtn.addEventListener('click', togglePlay);
    if (dom.nextBtn) dom.nextBtn.addEventListener('click', stepNext);
    if (dom.prevBtn) dom.prevBtn.addEventListener('click', stepPrev);

    // Scrubber click
    if (dom.scrubberBar) {
      dom.scrubberBar.addEventListener('click', e => {
        const rect = dom.scrubberBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const totalPanels = state.panels.length || 75;
        const targetIndex = Math.floor(pct * totalPanels);
        state.panelElapsed = 0;
        renderPanel(targetIndex);
      });
    }

    // Fullscreen
    if (dom.fullscreenBtn && dom.playerStageWrap) {
      dom.fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          dom.playerStageWrap.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen();
        }
      });
    }

    // Sound Toggles
    if (dom.ambientToggleTop) dom.ambientToggleTop.addEventListener('click', toggleAmbientAudio);
    if (dom.ambientToggleDeck) dom.ambientToggleDeck.addEventListener('click', toggleAmbientAudio);

    // Tabs
    if (dom.tabScript) {
      dom.tabScript.addEventListener('click', () => {
        dom.tabScript.classList.add('is-active');
        dom.tabCharacters.classList.remove('is-active');
        dom.scriptList.style.display = 'grid';
        dom.charactersGrid.style.display = 'none';
      });
    }

    if (dom.tabCharacters) {
      dom.tabCharacters.addEventListener('click', () => {
        dom.tabCharacters.classList.add('is-active');
        dom.tabScript.classList.remove('is-active');
        dom.scriptList.style.display = 'none';
        dom.charactersGrid.style.display = 'grid';
      });
    }

    // Editorial Cards Click
    document.querySelectorAll('[data-essay-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.essayId;
        openEditorialDrawer(id);
      });
    });

    if (dom.drawerCloseBtn) dom.drawerCloseBtn.addEventListener('click', closeEditorialDrawer);
    if (dom.drawerBackdrop) dom.drawerBackdrop.addEventListener('click', closeEditorialDrawer);

    // Inquiry Dialog
    dom.inquiryOpenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (dom.inquiryDialog) dom.inquiryDialog.showModal();
      });
    });

    if (dom.inquiryCloseBtn) {
      dom.inquiryCloseBtn.addEventListener('click', () => {
        if (dom.inquiryDialog) dom.inquiryDialog.close();
      });
    }

    if (dom.inquiryForm) {
      dom.inquiryForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Thank you. Your curatorial request has been received by SQUARGRAPH. Our studio will review and contact you with private access credentials.');
        if (dom.inquiryDialog) dom.inquiryDialog.close();
        dom.inquiryForm.reset();
      });
    }

    // Mobile Nav
    if (dom.mobileNavToggle && dom.navLinks) {
      dom.mobileNavToggle.addEventListener('click', () => {
        const open = dom.navLinks.classList.toggle('is-open');
        dom.mobileNavToggle.setAttribute('aria-expanded', String(open));
        dom.mobileNavToggle.textContent = open ? 'Close ×' : 'Menu';
      });

      dom.navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          dom.navLinks.classList.remove('is-open');
          dom.mobileNavToggle.setAttribute('aria-expanded', 'false');
          dom.mobileNavToggle.textContent = 'Menu';
        });
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        if (dom.fullscreenBtn) dom.fullscreenBtn.click();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleAmbientAudio();
      } else if (e.code === 'Escape') {
        closeEditorialDrawer();
        if (dom.inquiryDialog && dom.inquiryDialog.open) dom.inquiryDialog.close();
      }
    });
  }

  // Bootstrap when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
