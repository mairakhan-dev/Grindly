/* ============================================================
   MEMORY WALL UPGRADE — Spaces + Zoom (v2)
   - Controls injected into .content-header (guaranteed visible)
   - Debug logs prefixed with [MW]
   ============================================================ */
(function () {
  'use strict';
  if (window.__memoryWallUpgrade) return;
  window.__memoryWallUpgrade = true;

  const LOG = (...a) => console.log('[MW]', ...a);
  const WARN = (...a) => console.warn('[MW]', ...a);
  const ERR = (...a) => console.error('[MW]', ...a);

  LOG('script loaded');

  // ---------- CONFIG ----------
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 3.0;
  const ZOOM_STEP = 0.2;
  const LS_SPACE_KEY = 'mw_current_space_';
  const LS_SPACES_KEY = 'mw_spaces_';

  // ---------- MODE DETECT ----------
  const isTeacher = !!document.querySelector('.teacher-emoji')
    || window.location.href.includes('teachermode');
  LOG('mode =', isTeacher ? 'TEACHER' : 'STUDENT');

  const WB_ID    = isTeacher ? 'memoryWhiteboard' : 'studentMemoryWhiteboard';
  const NOTES_ID = isTeacher ? 'stickyNotesContainer' : 'studentStickyNotesContainer';
  const SECTION_ID = isTeacher ? 'memoryWall' : 'studentMemoryWall';
  LOG('WB_ID =', WB_ID, '| NOTES_ID =', NOTES_ID, '| SECTION_ID =', SECTION_ID);

  // ---------- STATE ----------
  let currentSpaceId = 'main';
  let currentZoom = 1;
  let currentPanX = 0;
  let currentPanY = 0;
  let spacesList = [{ id: 'main', name: 'Main Board', createdAt: 0 }];
  let controlsBuilt = false;
  let notesRef = null;

  // ---------- HELPERS ----------
  const getClassCode = () => (typeof currentClassCode !== 'undefined' && currentClassCode) || null;
  const getDatabase  = () => (typeof database !== 'undefined' && database) || null;
  const getIsDemo    = () => (typeof isDemoMode !== 'undefined') ? isDemoMode : false;

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const spaceKey    = () => LS_SPACE_KEY + (getClassCode() || 'global');
  const spacesLsKey = () => LS_SPACES_KEY + (getClassCode() || 'global');
  const notesLsKey  = (spaceId) => {
    const cc = getClassCode();
    return spaceId === 'main'
      ? `memoryWall_notes_${cc}`
      : `memoryWall_notes_${cc}_${spaceId}`;
  };

  function getNotesPath(spaceId) {
    const cc = getClassCode();
    if (!cc) return null;
    return spaceId === 'main'
      ? `memoryWall/${cc}/notes`
      : `memoryWall/${cc}/spaces/${spaceId}/notes`;
  }

  function getSpaceMetaPath() {
    const cc = getClassCode();
    return cc ? `memoryWall/${cc}/spaceMeta` : null;
  }

  function getNotesArray() {
    try {
      if (isTeacher) return (typeof memoryWallNotes !== 'undefined') ? memoryWallNotes : [];
      return (typeof studentMemoryWallNotes !== 'undefined') ? studentMemoryWallNotes : [];
    } catch (e) { return []; }
  }

  function setNotesArray(arr) {
    try {
      if (isTeacher) memoryWallNotes = arr;
      else studentMemoryWallNotes = arr;
    } catch (e) {}
  }

  // ---------- ZOOM ----------
  function applyTransform(smooth) {
    const canvas = document.querySelector(`#${WB_ID} .wb-canvas`);
    if (!canvas) return;
    canvas.style.transition = smooth ? 'transform 0.12s ease-out' : 'none';
    canvas.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoom})`;
  }

  function setZoom(z) {
    currentZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    applyTransform(true);
    updateZoomLabels();
  }

  function resetView() {
    currentZoom = 1; currentPanX = 0; currentPanY = 0;
    applyTransform(true);
    updateZoomLabels();
  }

  function updateZoomLabels() {
    document.querySelectorAll('.mw-zoom-pct').forEach(el => {
      el.textContent = Math.round(currentZoom * 100) + '%';
    });
  }

  // ---------- CANVAS WRAPPER ----------
  function ensureCanvasWrapper(wb) {
    if (wb.querySelector('.wb-canvas')) return wb.querySelector('.wb-canvas');
    const canvas = document.createElement('div');
    canvas.className = 'wb-canvas';
    Array.from(wb.children).forEach(child => {
      if (child.classList.contains('mw-zoom-float') ||
          child.classList.contains('whiteboard-controls')) return;
      canvas.appendChild(child);
    });
    wb.insertBefore(canvas, wb.firstChild);
    LOG('canvas wrapper built');
    return canvas;
  }

  // ---------- BUILD CONTROLS ----------
  function buildControls() {
    if (controlsBuilt) return;

    const wb = document.getElementById(WB_ID);
    if (!wb) { WARN('no whiteboard element'); return; }

    const card = wb.closest('.content-card');
    const header = card ? card.querySelector('.content-header') : null;
    if (!header) { WARN('no content-header found'); return; }

    // Avoid double-inject
    if (header.querySelector('.mw-header-controls')) { controlsBuilt = true; return; }

    const wrap = document.createElement('div');
    wrap.className = 'mw-header-controls';

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'mw-header-tabs';
    wrap.appendChild(tabs);

    // + New button
    const addBtn = document.createElement('button');
    addBtn.className = 'mw-add-btn';
    addBtn.textContent = '+ New Space';
    addBtn.onclick = addNewSpace;
    wrap.appendChild(addBtn);

    // Zoom (inline)
    const zoom = document.createElement('div');
    zoom.className = 'mw-zoom-inline';
    zoom.innerHTML = `
      <button data-act="out" title="Zoom out">−</button>
      <span class="mw-zoom-pct">100%</span>
      <button data-act="in" title="Zoom in">+</button>
      <button data-act="reset" title="Reset view">⌂</button>
    `;
    zoom.querySelector('[data-act="out"]').onclick   = () => setZoom(currentZoom - ZOOM_STEP);
    zoom.querySelector('[data-act="in"]').onclick    = () => setZoom(currentZoom + ZOOM_STEP);
    zoom.querySelector('[data-act="reset"]').onclick = resetView;
    wrap.appendChild(zoom);

    // Insert between H2 and the + Add New Memory button
    const addMemoryBtn = header.querySelector('button');
    if (addMemoryBtn) header.insertBefore(wrap, addMemoryBtn);
    else header.appendChild(wrap);

    LOG('header controls injected');

    // Floating zoom for mobile
    const float = document.createElement('div');
    float.className = 'mw-zoom-float';
    float.innerHTML = `
      <button data-act="out">−</button>
      <button data-act="in">+</button>
      <button data-act="reset">⌂</button>
    `;
    float.querySelector('[data-act="out"]').onclick   = () => setZoom(currentZoom - ZOOM_STEP);
    float.querySelector('[data-act="in"]').onclick    = () => setZoom(currentZoom + ZOOM_STEP);
    float.querySelector('[data-act="reset"]').onclick = resetView;
    wb.appendChild(float);

    // Ensure canvas wrapper exists
    ensureCanvasWrapper(wb);

    // Setup wheel + pinch + pan
    attachWheel(wb);
    attachPinch(wb);
    attachPan(wb);

    // Load spaces
    loadSpacesFromLocal();
    ensureSpacesLoaded();
    renderTabs();
    updateZoomLabels();

    controlsBuilt = true;
    LOG('controls built successfully');
  }

  // ---------- SPACE TABS ----------
  function renderTabs() {
    const tabs = document.querySelector(`#${WB_ID}`)
      ?.closest('.content-card')
      ?.querySelector('.mw-header-tabs');
    if (!tabs) return;

    tabs.innerHTML = spacesList.map(s => `
      <button class="mw-tab${s.id === currentSpaceId ? ' active' : ''}" data-space="${escapeHtml(s.id)}">
        <span>${escapeHtml(s.name)}</span>
        ${s.id !== 'main' ? `<span class="mw-tab-del" data-del="${escapeHtml(s.id)}" title="Delete">×</span>` : ''}
      </button>
    `).join('');

    tabs.querySelectorAll('.mw-tab').forEach(tab => {
      tab.onclick = (e) => {
        const delId = e.target.getAttribute('data-del');
        if (delId) { e.stopPropagation(); deleteSpace(delId); return; }
        const sid = tab.getAttribute('data-space');
        if (sid && sid !== currentSpaceId) switchSpace(sid);
      };
    });
  }

  // ---------- SPACE LOGIC ----------
  function loadSpacesFromLocal() {
    try {
      const saved = localStorage.getItem(spacesLsKey());
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          spacesList = parsed;
          if (!spacesList.find(s => s.id === 'main')) {
            spacesList.unshift({ id: 'main', name: 'Main Board', createdAt: 0 });
          }
        }
      }
      const cur = localStorage.getItem(spaceKey());
      if (cur) currentSpaceId = cur;
      LOG('spaces loaded:', spacesList.map(s => s.name));
    } catch (e) { WARN('loadSpacesFromLocal failed:', e); }
  }

  function saveSpacesToLocal() {
    try { localStorage.setItem(spacesLsKey(), JSON.stringify(spacesList)); } catch (e) {}
  }

  function ensureSpacesLoaded() {
    const db = getDatabase();
    const cc = getClassCode();
    if (!db || !cc || getIsDemo()) return;
    const path = getSpaceMetaPath();
    if (!path) return;
    db.ref(path).on('value', snap => {
      if (snap.exists() && snap.val().spaces) {
        const remote = snap.val().spaces;
        if (Array.isArray(remote) && remote.length) {
          spacesList = remote;
          if (!spacesList.find(s => s.id === 'main')) {
            spacesList.unshift({ id: 'main', name: 'Main Board', createdAt: 0 });
          }
          saveSpacesToLocal();
          renderTabs();
        }
      }
    });
  }

  function switchSpace(spaceId) {
    LOG('switchSpace →', spaceId);
    currentSpaceId = spaceId;
    try { localStorage.setItem(spaceKey(), spaceId); } catch (e) {}
    renderTabs();
    resetView();
    loadNotesForSpace();
  }

  async function addNewSpace() {
    LOG('addNewSpace called');
    const name = prompt('Name for the new space:', `Board ${spacesList.length + 1}`);
    if (!name || !name.trim()) return;

    const newSpace = {
      id: 'sp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: name.trim().slice(0, 40),
      createdAt: Date.now()
    };
    spacesList.push(newSpace);
    saveSpacesToLocal();

    const db = getDatabase();
    const cc = getClassCode();
    const path = getSpaceMetaPath();
    if (db && cc && path && !getIsDemo()) {
      try { await db.ref(path).update({ spaces: spacesList }); } catch (e) { WARN(e); }
    }

    renderTabs();
    switchSpace(newSpace.id);
    LOG('new space created:', newSpace.name);
  }

  async function deleteSpace(spaceId) {
    if (spaceId === 'main') return;
    if (!confirm('Delete this space and all its notes?')) return;

    spacesList = spacesList.filter(s => s.id !== spaceId);
    saveSpacesToLocal();

    const db = getDatabase();
    const cc = getClassCode();
    const metaPath = getSpaceMetaPath();
    if (db && cc && metaPath && !getIsDemo()) {
      try {
        await db.ref(metaPath).update({ spaces: spacesList });
        await db.ref(`memoryWall/${cc}/spaces/${spaceId}`).remove();
      } catch (e) { WARN(e); }
    } else {
      try { localStorage.removeItem(notesLsKey(spaceId)); } catch (e) {}
    }

    if (currentSpaceId === spaceId) switchSpace('main');
    else renderTabs();
  }

  // ---------- NOTES LOADING ----------
  function loadNotesForSpace() {
    const cc = getClassCode();
    if (!cc) { WARN('no class code'); return; }

    if (notesRef) { try { notesRef.off(); } catch (e) {} notesRef = null; }

    const db = getDatabase();

    // Demo/offline → localStorage
    if (!db || getIsDemo()) {
      try {
        const raw = localStorage.getItem(notesLsKey(currentSpaceId));
        setNotesArray(raw ? JSON.parse(raw) : []);
      } catch (e) { setNotesArray([]); }
      renderCurrentNotes();
      return;
    }

    // Firebase
    const path = getNotesPath(currentSpaceId);
    if (!path) return;
    notesRef = db.ref(path);
    notesRef.on('value', snap => {
      const arr = [];
      if (snap.exists()) snap.forEach(child => arr.push({ id: child.key, ...child.val() }));
      setNotesArray(arr);
      renderCurrentNotes();
    });
  }

  function renderCurrentNotes() {
    const container = document.getElementById(NOTES_ID);
    if (!container) return;
    container.innerHTML = '';

    const notes = getNotesArray();
    const wb = document.getElementById(WB_ID);
    const welcome = wb ? wb.querySelector('.welcome-note') : null;

    if (!notes || notes.length === 0) {
      if (welcome) welcome.style.display = '';
      return;
    }
    if (welcome) welcome.style.display = 'none';

    const createFn = isTeacher ? window.createStickyNoteElement : window.createStudentStickyNoteElement;
    if (typeof createFn !== 'function') { WARN('missing createFn:', isTeacher ? 'createStickyNoteElement' : 'createStudentStickyNoteElement'); return; }

    notes.forEach(note => {
      const el = createFn(note);
      if (el) container.appendChild(el);
    });
  }

  // ---------- WHEEL / PINCH / PAN ----------
  function attachWheel(wb) {
    wb.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(currentZoom + (e.deltaY > 0 ? -1 : 1) * 0.08);
    }, { passive: false });
  }

  function attachPinch(wb) {
    let dist0 = 0, zoom0 = 1;
    wb.addEventListener('touchstart', e => {
      if (e.touches.length !== 2) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dist0 = Math.hypot(dx, dy); zoom0 = currentZoom;
    }, { passive: true });
    wb.addEventListener('touchmove', e => {
      if (e.touches.length !== 2 || !dist0) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setZoom(zoom0 * (Math.hypot(dx, dy) / dist0));
    }, { passive: false });
    wb.addEventListener('touchend', () => { dist0 = 0; });
  }

  function attachPan(wb) {
    let panning = false, sx = 0, sy = 0, px = 0, py = 0;
    wb.addEventListener('mousedown', e => {
      if (currentZoom <= 1) return;
      if (e.target.closest('.sticky-note, .student-sticky-note, button, .welcome-note, .mw-zoom-float')) return;
      e.preventDefault();
      panning = true; sx = e.clientX; sy = e.clientY;
      px = currentPanX; py = currentPanY;
      wb.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
      if (!panning) return;
      currentPanX = px + (e.clientX - sx);
      currentPanY = py + (e.clientY - sy);
      applyTransform(false);
    });
    document.addEventListener('mouseup', () => {
      if (panning) { panning = false; wb.style.cursor = ''; }
    });
  }

  // ---------- PUBLIC OVERRIDES (Firebase path per space) ----------
  window.saveMemoryWallToLocalStorage = function () {
    const cc = getClassCode(); if (!cc) return;
    try { localStorage.setItem(notesLsKey(currentSpaceId), JSON.stringify(getNotesArray())); } catch (e) {}
  };

  window.saveNoteToFirebase = function (note) {
    const db = getDatabase(), cc = getClassCode();
    if (!db || !cc) return;
    const path = getNotesPath(currentSpaceId);
    if (!path) return;
    const ref = db.ref(path).push();
    note.id = ref.key;
    ref.set(note).catch(e => WARN('save failed:', e));
  };

  window.deleteNote = function (noteId, event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this memory note?')) return;
    const db = getDatabase(), cc = getClassCode();
    if (!db || getIsDemo()) {
      setNotesArray(getNotesArray().filter(n => n.id !== noteId));
      window.saveMemoryWallToLocalStorage();
      renderCurrentNotes();
    } else {
      db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).remove();
    }
  };

  window.likeNote = function (noteId, event) {
    if (event) event.stopPropagation();
    const note = getNotesArray().find(n => n.id === noteId);
    if (!note) return;
    note.likes = (note.likes || 0) + 1;
    const el = document.getElementById(`note-${noteId}`);
    const span = el?.querySelector('.note-likes span:last-child');
    if (span) span.textContent = note.likes;
    const db = getDatabase();
    if (!db || getIsDemo()) window.saveMemoryWallToLocalStorage();
    else db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).update({ likes: note.likes });
  };

  window.studentLikeNote = function (noteId, event) {
    if (event) event.stopPropagation();
    const note = getNotesArray().find(n => n.id === noteId);
    if (!note) return;
    const uid = localStorage.getItem('studentUserId');
    if (!uid) return;
    if ((note.likedBy || []).includes(uid)) return;
    note.likes = (note.likes || 0) + 1;
    note.likedBy = [...(note.likedBy || []), uid];
    const el = document.getElementById(`student-note-${noteId}`);
    const span = el?.querySelector('.student-note-likes span:last-child');
    if (span) span.textContent = note.likes;
    const db = getDatabase();
    if (db) db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).update({ likes: note.likes, likedBy: note.likedBy });
  };

  // ---------- WATCH FOR MEMORY WALL VISIBILITY ----------
  function watchVisibility() {
    const section = document.getElementById(SECTION_ID);
    if (!section) {
      LOG('section not found yet, retrying…');
      setTimeout(watchVisibility, 500);
      return;
    }
    LOG('section found:', SECTION_ID);

    const check = () => {
      if (section.offsetParent === null) return;
      if (!controlsBuilt) buildControls();
    };

    new MutationObserver(check).observe(section, { attributes: true, attributeFilter: ['style', 'class'] });
    check();
  }

  // ---------- BOOT ----------
  function boot() {
    LOG('booting…');
    watchVisibility();

    // Also retry periodically in case DOM changes
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (controlsBuilt || tries > 60) { clearInterval(iv); return; }
      const wb = document.getElementById(WB_ID);
      const section = document.getElementById(SECTION_ID);
      if (wb && section && section.offsetParent !== null) buildControls();
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Debug helper for console
  window.__mwDebug = () => {
    console.log('--- MEMORY WALL DEBUG ---');
    console.log('mode:', isTeacher ? 'TEACHER' : 'STUDENT');
    console.log('whiteboard exists:', !!document.getElementById(WB_ID));
    console.log('notes container exists:', !!document.getElementById(NOTES_ID));
    console.log('section exists:', !!document.getElementById(SECTION_ID));
    console.log('section visible:', document.getElementById(SECTION_ID)?.offsetParent !== null);
    console.log('controls built:', controlsBuilt);
    console.log('header controls in DOM:', !!document.querySelector('.mw-header-controls'));
    console.log('class code:', getClassCode());
    console.log('current space:', currentSpaceId);
    console.log('spaces:', spacesList);
    console.log('notes count:', getNotesArray().length);
  };
  LOG('type __mwDebug() in console to diagnose');
})();