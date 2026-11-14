/* ============================================================
   MEMORY WALL UPGRADE — Spaces + Zoom
   Works in both teacher and student mode.
   ============================================================ */
(function () {
  'use strict';
  if (window.__memoryWallUpgrade) return;
  window.__memoryWallUpgrade = true;

  // ---------- CONFIG ----------
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 3.0;
  const ZOOM_STEP = 0.2;
  const LS_SPACE_KEY = 'mw_current_space_';
  const LS_SPACES_KEY = 'mw_spaces_';

  // ---------- MODE DETECT ----------
  const isTeacher = !!document.querySelector('.teacher-emoji')
    || window.location.href.includes('teachermode');
  const WB_ID = isTeacher ? 'memoryWhiteboard' : 'studentMemoryWhiteboard';
  const NOTES_ID = isTeacher ? 'stickyNotesContainer' : 'studentStickyNotesContainer';

  // ---------- STATE ----------
  let currentSpaceId = 'main';
  let currentZoom = 1;
  let currentPanX = 0;
  let currentPanY = 0;
  let spacesList = [{ id: 'main', name: 'Main Board', createdAt: 0 }];
  let spacesLoaded = false;
  let notesRef = null;

  // ---------- SAFE GLOBAL ACCESS ----------
  const getClassCode = () => (typeof currentClassCode !== 'undefined') ? currentClassCode : null;
  const getDatabase  = () => (typeof database !== 'undefined') ? database : null;
  const getIsDemo    = () => (typeof isDemoMode !== 'undefined') ? isDemoMode : false;

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const spaceKey       = () => LS_SPACE_KEY + (getClassCode() || 'global');
  const spacesLsKey    = () => LS_SPACES_KEY + (getClassCode() || 'global');
  const notesLsKey     = (spaceId) => {
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

  const getSpaceMetaPath = () => {
    const cc = getClassCode();
    return cc ? `memoryWall/${cc}/spaceMeta` : null;
  };

  // ---------- ZOOM ----------
  function applyTransform(smooth) {
    const canvas = document.querySelector(`#${WB_ID} .wb-canvas`);
    if (!canvas) return;
    canvas.style.transition = smooth ? 'transform 0.12s ease-out' : 'none';
    canvas.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoom})`;
    const wb = document.getElementById(WB_ID);
    if (wb) wb.dataset.zoomActive = currentZoom > 1 ? 'true' : 'false';
  }

  function setZoom(z, smooth) {
    currentZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    applyTransform(smooth !== false);
    updateZoomLabel();
  }

  function resetView() {
    currentZoom = 1;
    currentPanX = 0;
    currentPanY = 0;
    applyTransform(true);
    updateZoomLabel();
  }

  function updateZoomLabel() {
    const el = document.querySelector(`#${WB_ID} .mw-zoom-label`);
    if (el) el.textContent = Math.round(currentZoom * 100) + '%';
  }

  // ---------- CANVAS WRAPPER ----------
  function ensureCanvasWrapper(wb) {
    if (wb.querySelector('.wb-canvas')) return wb.querySelector('.wb-canvas');
    const canvas = document.createElement('div');
    canvas.className = 'wb-canvas';

    Array.from(wb.children).forEach(child => {
      if (child.classList.contains('mw-space-bar')
          || child.classList.contains('mw-zoom-controls')
          || child.classList.contains('whiteboard-controls')) return;
      canvas.appendChild(child);
    });

    wb.insertBefore(canvas, wb.firstChild);
    return canvas;
  }

  // ---------- SPACE UI ----------
  function buildSpaceBar(wb) {
    if (wb.querySelector('.mw-space-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'mw-space-bar';
    wb.appendChild(bar);
    renderSpaceBar();
  }

  function renderSpaceBar() {
    const bar = document.querySelector(`#${WB_ID} .mw-space-bar`);
    if (!bar) return;

    const tabs = spacesList.map(s => `
      <button class="mw-space-tab${s.id === currentSpaceId ? ' active' : ''}" data-space="${escapeHtml(s.id)}">
        <span class="mw-space-name">${escapeHtml(s.name)}</span>
        ${s.id !== 'main' ? `<span class="mw-space-del" data-del="${escapeHtml(s.id)}" title="Delete space">×</span>` : ''}
      </button>
    `).join('');

    bar.innerHTML = `
      <div class="mw-space-tabs">${tabs}</div>
      <button class="mw-space-add" title="Create new space">+ New</button>
    `;

    bar.querySelectorAll('.mw-space-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const delId = e.target.getAttribute('data-del');
        if (delId) { e.stopPropagation(); deleteSpace(delId); return; }
        const sid = tab.getAttribute('data-space');
        if (sid && sid !== currentSpaceId) switchSpace(sid);
      });
    });

    bar.querySelector('.mw-space-add').addEventListener('click', addNewSpace);
  }

  // ---------- ZOOM UI ----------
  function buildZoomControls(wb) {
    if (wb.querySelector('.mw-zoom-controls')) return;
    const c = document.createElement('div');
    c.className = 'mw-zoom-controls';
    c.innerHTML = `
      <button class="mw-zoom-btn" data-act="out" title="Zoom out (Ctrl+scroll)">−</button>
      <span class="mw-zoom-label">100%</span>
      <button class="mw-zoom-btn" data-act="in" title="Zoom in (Ctrl+scroll)">+</button>
      <button class="mw-zoom-btn" data-act="reset" title="Reset view">⌂</button>
    `;
    wb.appendChild(c);

    c.querySelector('[data-act="out"]').onclick = () => setZoom(currentZoom - ZOOM_STEP);
    c.querySelector('[data-act="in"]').onclick  = () => setZoom(currentZoom + ZOOM_STEP);
    c.querySelector('[data-act="reset"]').onclick = resetView;
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
    } catch (e) {}
  }

  function saveSpacesToLocal() {
    try { localStorage.setItem(spacesLsKey(), JSON.stringify(spacesList)); } catch (e) {}
  }

  function ensureSpacesLoaded() {
    if (spacesLoaded) return;
    spacesLoaded = true;
    loadSpacesFromLocal();

    const db = getDatabase();
    const cc = getClassCode();
    if (!db || !cc || getIsDemo()) { renderSpaceBar(); return; }

    db.ref(getSpaceMetaPath()).on('value', snap => {
      if (snap.exists() && snap.val().spaces) {
        const remote = snap.val().spaces;
        if (Array.isArray(remote) && remote.length) {
          spacesList = remote;
          if (!spacesList.find(s => s.id === 'main')) {
            spacesList.unshift({ id: 'main', name: 'Main Board', createdAt: 0 });
          }
          saveSpacesToLocal();
          renderSpaceBar();
        }
      }
    });
  }

  function switchSpace(spaceId) {
    currentSpaceId = spaceId;
    try { localStorage.setItem(spaceKey(), spaceId); } catch (e) {}
    renderSpaceBar();
    resetView();
    loadNotes();
  }

  async function addNewSpace() {
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
    if (db && cc && !getIsDemo()) {
      try { await db.ref(getSpaceMetaPath()).update({ spaces: spacesList }); }
      catch (e) { console.warn('Space save failed:', e); }
    }

    renderSpaceBar();
    switchSpace(newSpace.id);
  }

  async function deleteSpace(spaceId) {
    if (spaceId === 'main') return;
    if (!confirm('Delete this space and all its notes?')) return;

    spacesList = spacesList.filter(s => s.id !== spaceId);
    saveSpacesToLocal();

    const db = getDatabase();
    const cc = getClassCode();
    if (db && cc && !getIsDemo()) {
      try {
        await db.ref(getSpaceMetaPath()).update({ spaces: spacesList });
        await db.ref(`memoryWall/${cc}/spaces/${spaceId}`).remove();
      } catch (e) { console.warn('Delete failed:', e); }
    } else {
      try { localStorage.removeItem(notesLsKey(spaceId)); } catch (e) {}
    }

    if (currentSpaceId === spaceId) switchSpace('main');
    else renderSpaceBar();
  }

  // ---------- NOTES LOADING ----------
  function loadNotes() {
    const cc = getClassCode();
    if (!cc) return;

    const db = getDatabase();

    if (notesRef && typeof notesRef.off === 'function') {
      try { notesRef.off(); } catch (e) {}
      notesRef = null;
    }

    // Demo / offline → localStorage
    if (!db || getIsDemo()) {
      try {
        const saved = localStorage.getItem(notesLsKey(currentSpaceId));
        setNotesArray(saved ? JSON.parse(saved) : []);
      } catch (e) { setNotesArray([]); }
      renderNotes();
      return;
    }

    // Firebase
    const path = getNotesPath(currentSpaceId);
    if (!path) return;
    notesRef = db.ref(path);
    notesRef.on('value', snap => {
      const notes = [];
      if (snap.exists()) {
        snap.forEach(child => notes.push({ id: child.key, ...child.val() }));
      }
      setNotesArray(notes);
      renderNotes();
    });
  }

  function setNotesArray(arr) {
    try {
      if (isTeacher) memoryWallNotes = arr;
      else studentMemoryWallNotes = arr;
    } catch (e) {}
  }

  function getNotesArray() {
    try {
      if (isTeacher) return (typeof memoryWallNotes !== 'undefined') ? memoryWallNotes : [];
      return (typeof studentMemoryWallNotes !== 'undefined') ? studentMemoryWallNotes : [];
    } catch (e) { return []; }
  }

  function renderNotes() {
    const container = document.getElementById(NOTES_ID);
    if (!container) return;
    container.innerHTML = '';

    const notes = getNotesArray();
    const wb = document.getElementById(WB_ID);
    const welcome = wb ? wb.querySelector('.welcome-note') : null;

    if (!notes || notes.length === 0) {
      if (welcome) welcome.style.display = '';
      updateStats();
      return;
    }
    if (welcome) welcome.style.display = 'none';

    const createFn = isTeacher ? window.createStickyNoteElement : window.createStudentStickyNoteElement;
    if (typeof createFn !== 'function') return;

    notes.forEach(note => {
      const el = createFn(note);
      if (el) container.appendChild(el);
    });

    updateStats();
  }

  function updateStats() {
    try {
      if (isTeacher && typeof window.updateMemoryWallStats === 'function') window.updateMemoryWallStats();
      if (!isTeacher && typeof window.updateStudentMemoryWallStats === 'function') window.updateStudentMemoryWallStats();
    } catch (e) {}
  }

  // ---------- ZOOM-AWARE DRAGGING ----------
  function setupZoomAwareDragging(noteElement, note) {
    let dragging = false, offsetX = 0, offsetY = 0;

    const getWbRect = () => document.getElementById(WB_ID).getBoundingClientRect();

    function start(e) {
      if (e.target.closest('button, .btn-note, .btn-student-note')) return;
      e.preventDefault();
      e.stopPropagation();
      dragging = true;

      const p = e.touches ? e.touches[0] : e;
      const r = getWbRect();
      const mouseCanvasX = (p.clientX - r.left - currentPanX) / currentZoom;
      const mouseCanvasY = (p.clientY - r.top - currentPanY) / currentZoom;
      const noteCanvasX = (Number(note.x) || 20) / 100 * r.width;
      const noteCanvasY = (Number(note.y) || 20) / 100 * r.height;

      offsetX = mouseCanvasX - noteCanvasX;
      offsetY = mouseCanvasY - noteCanvasY;

      noteElement.classList.add('dragging');
      noteElement.style.zIndex = '1000';

      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', end);
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('touchend', end);
    }

    function drag(e) {
      if (!dragging) return;
      e.preventDefault();
      const p = e.touches ? e.touches[0] : e;
      const r = getWbRect();
      const mouseCanvasX = (p.clientX - r.left - currentPanX) / currentZoom;
      const mouseCanvasY = (p.clientY - r.top - currentPanY) / currentZoom;
      const noteCanvasX = mouseCanvasX - offsetX;
      const noteCanvasY = mouseCanvasY - offsetY;

      const xPct = Math.max(0, Math.min(95, (noteCanvasX / r.width) * 100));
      const yPct = Math.max(0, Math.min(95, (noteCanvasY / r.height) * 100));

      note.x = xPct;
      note.y = yPct;
      noteElement.style.left = xPct + '%';
      noteElement.style.top = yPct + '%';
    }

    function end() {
      if (!dragging) return;
      dragging = false;
      noteElement.classList.remove('dragging');
      noteElement.style.zIndex = '2';
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('touchend', end);
      if (isTeacher && typeof window.saveNotePosition === 'function') {
        try { window.saveNotePosition(note.id, note.x, note.y); } catch (e) {}
      }
    }

    noteElement.addEventListener('mousedown', start);
    noteElement.addEventListener('touchstart', start, { passive: false });
  }

  // ---------- WHEEL + PINCH ----------
  function attachWheel(wb) {
    wb.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(currentZoom + (e.deltaY > 0 ? -1 : 1) * 0.08, false);
    }, { passive: false });
  }

  function attachPinch(wb) {
    let pinchDist = 0, pinchZoom = 1;
    wb.addEventListener('touchstart', e => {
      if (e.touches.length !== 2) return;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist = Math.sqrt(dx * dx + dy * dy);
      pinchZoom = currentZoom;
    }, { passive: true });
    wb.addEventListener('touchmove', e => {
      if (e.touches.length !== 2 || !pinchDist) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setZoom(pinchZoom * (Math.sqrt(dx * dx + dy * dy) / pinchDist), false);
    }, { passive: false });
    wb.addEventListener('touchend', () => { pinchDist = 0; });
  }

  // ---------- PAN ----------
  function attachPan(wb) {
    let panning = false, sx = 0, sy = 0, px = 0, py = 0;
    wb.addEventListener('mousedown', e => {
      if (currentZoom <= 1) return;
      if (e.target.closest('.sticky-note, .student-sticky-note, button, .mw-space-bar, .mw-zoom-controls, .welcome-note')) return;
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

  // ---------- OVERRIDE DATA LAYER (per-space paths) ----------
  window.saveMemoryWallToLocalStorage = function () {
    const cc = getClassCode();
    if (!cc) return;
    try {
      localStorage.setItem(notesLsKey(currentSpaceId), JSON.stringify(getNotesArray()));
    } catch (e) {}
  };

  window.saveNoteToFirebase = function (note) {
    const db = getDatabase();
    const cc = getClassCode();
    if (!db || !cc) return;
    const path = getNotesPath(currentSpaceId);
    if (!path) return;
    const ref = db.ref(path).push();
    note.id = ref.key;
    ref.set(note).catch(e => console.warn('Save failed:', e));
  };

  window.deleteNote = function (noteId, event) {
    if (event) event.stopPropagation();
    if (!confirm('Delete this memory note?')) return;
    const cc = getClassCode();
    if (!cc) return;
    const db = getDatabase();
    if (!db || getIsDemo()) {
      const arr = getNotesArray().filter(n => n.id !== noteId);
      setNotesArray(arr);
      window.saveMemoryWallToLocalStorage();
      renderNotes();
    } else {
      db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).remove();
    }
  };

  window.likeNote = function (noteId, event) {
    if (event) event.stopPropagation();
    const arr = getNotesArray();
    const note = arr.find(n => n.id === noteId);
    if (!note) return;
    note.likes = (note.likes || 0) + 1;
    const el = document.getElementById(`note-${noteId}`);
    if (el) {
      const span = el.querySelector('.note-likes span:last-child');
      if (span) span.textContent = note.likes;
    }
    const db = getDatabase();
    if (!db || getIsDemo()) {
      window.saveMemoryWallToLocalStorage();
    } else {
      db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).update({ likes: note.likes });
    }
  };

  window.studentLikeNote = function (noteId, event) {
    if (event) event.stopPropagation();
    const arr = getNotesArray();
    const note = arr.find(n => n.id === noteId);
    if (!note) return;
    const uid = localStorage.getItem('studentUserId');
    if (!uid) return;
    if (note.likedBy && note.likedBy.includes(uid)) return;
    note.likes = (note.likes || 0) + 1;
    note.likedBy = [...(note.likedBy || []), uid];
    const el = document.getElementById(`student-note-${noteId}`);
    if (el) {
      const span = el.querySelector('.student-note-likes span:last-child');
      if (span) span.textContent = note.likes;
    }
    const db = getDatabase();
    if (db) {
      db.ref(`${getNotesPath(currentSpaceId)}/${noteId}`).update({
        likes: note.likes, likedBy: note.likedBy
      });
    }
  };

  // ---------- INIT ----------
  function init() {
    const wb = document.getElementById(WB_ID);
    if (!wb) { setTimeout(init, 500); return; }

    ensureCanvasWrapper(wb);
    buildSpaceBar(wb);
    buildZoomControls(wb);
    attachWheel(wb);
    attachPinch(wb);
    attachPan(wb);
    ensureSpacesLoaded();

    setTimeout(() => { if (getClassCode()) loadNotes(); }, 300);
  }

  // Hook into the showXxx entry point to reload spaces for new class
  const hookEntry = (name) => {
    const orig = window[name];
    if (typeof orig === 'function') {
      window[name] = function () {
        ensureSpacesLoaded();
        return orig.apply(this, arguments);
      };
    }
  };
  hookEntry(isTeacher ? 'showMemoryWall' : 'showStudentMemoryWall');

  // Replace load/render with ours
  window.loadMemoryWallNotes = loadNotes;
  window.loadStudentMemoryWall = loadNotes;
  window.renderStickyNotes = renderNotes;
  window.renderStudentStickyNotes = renderNotes;

  // Replace dragging with zoom-aware version
  window.setupNoteDragging = setupZoomAwareDragging;
  window.setupStudentNoteDragging = setupZoomAwareDragging;

  // Reset everything on class switch
  const origSwitchClass = window.switchClass;
  if (typeof origSwitchClass === 'function') {
    window.switchClass = async function () {
      const r = await origSwitchClass.apply(this, arguments);
      spacesLoaded = false;
      spacesList = [{ id: 'main', name: 'Main Board', createdAt: 0 }];
      currentSpaceId = 'main';
      currentZoom = 1; currentPanX = 0; currentPanY = 0;
      if (notesRef) { try { notesRef.off(); } catch (e) {} notesRef = null; }
      ensureSpacesLoaded();
      applyTransform(false);
      loadNotes();
      return r;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();