// ============ TEACHER WHITEBOARD (ROBUST) ============
let wbCanvas = null, wbCtx = null;
let wbDrawing = false;
let wbTool = 'pen';
let wbColor = 'black';
let wbSize = 4;
let wbLastX = 0, wbLastY = 0;
let wbSessionCode = null;
let wbSyncTimer = null;
let wbListeners = [];

function wbLog(...args) { console.log('[Whiteboard]', ...args); }
function wbErr(...args) { console.error('[Whiteboard]', ...args); }

function getWbDb() {
    try {
        if (typeof window.database !== 'undefined' && window.database) return window.database;
        if (typeof database !== 'undefined' && database) return database;
        if (typeof firebase !== 'undefined' && firebase && firebase.apps && firebase.apps.length) {
            return firebase.database();
        }
    } catch (e) { wbErr('getWbDb failed:', e); }
    return null;
}

function generateWbCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function wbNotify(msg, type) {
    if (typeof window.showNotification === 'function') {
        window.showNotification(msg, type || 'info');
    } else {
        wbLog(msg);
    }
}

// ============ START SESSION ============
async function startWbSession() {
    try {
        wbSessionCode = generateWbCode();
        wbLog('Starting session', wbSessionCode);

        const payload = {
            active: true,
            startedAt: Date.now(),
            teacher: 'teacher',
            drawing: null,
            participants: {}
        };

        const db = getWbDb();
        let savedToCloud = false;

        if (db) {
            try {
                await db.ref('whiteboard/' + wbSessionCode).set(payload);
                savedToCloud = true;
                wbLog('Saved session to Firebase');
            } catch (e) {
                wbErr('Firebase write failed:', e.message || e);
                wbNotify('Cloud sync failed. Using local session. Check Firebase rules.', 'warning');
            }
        } else {
            wbNotify('Firebase not available. Using local-only session.', 'warning');
        }

        // Always save locally as fallback
        try {
            localStorage.setItem('wb_session_' + wbSessionCode, JSON.stringify(payload));
            localStorage.setItem('wb_active_session', wbSessionCode);
        } catch (e) { wbErr('localStorage save failed:', e); }

        // Show panel
        const codeEl = document.getElementById('wbCodeDisplay');
        const panel = document.getElementById('wbSession');
        if (codeEl) codeEl.textContent = wbSessionCode;
        if (panel) {
            panel.style.display = 'block';
            panel.classList.add('open');
        } else {
            wbErr('wbSession element not found in DOM');
        }

        // Init canvas AFTER panel is visible
        requestAnimationFrame(() => {
            initWbCanvas();
        });

        // Cloud listeners (only if saved to cloud)
        if (savedToCloud && db) {
            attachCloudListeners(db);
        }

        wbNotify('Session started! Code: ' + wbSessionCode, 'success');
    } catch (e) {
        wbErr('startWbSession fatal:', e);
        wbNotify('Failed to start whiteboard: ' + (e.message || 'unknown error'), 'error');
    }
}

function attachCloudListeners(db) {
    try {
        // Participants
        const pRef = db.ref('whiteboard/' + wbSessionCode + '/participants');
        const pCb = pRef.on('value', snap => {
            let count = 0;
            if (snap.exists()) snap.forEach(() => count++);
            const el = document.getElementById('wbParticipantCount');
            if (el) el.textContent = count;
        });
        wbListeners.push({ ref: pRef, cb: pCb });

        // Remote drawing (from students)
        const dRef = db.ref('whiteboard/' + wbSessionCode + '/drawing');
        const dCb = dRef.on('value', snap => {
            if (!snap.exists() || !wbCtx || !wbCanvas) return;
            const data = snap.val();
            if (data && data.data) {
                const img = new Image();
                img.onload = () => {
                    try {
                        wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
                    } catch (e) { wbErr('drawImage failed:', e); }
                };
                img.src = data.data;
            }
        });
        wbListeners.push({ ref: dRef, cb: dCb });
    } catch (e) { wbErr('attachCloudListeners:', e); }
}

// ============ CANVAS INIT ============
function initWbCanvas() {
    try {
        const canvas = document.getElementById('wbCanvas');
        if (!canvas) {
            wbLog('Canvas not ready, retrying...');
            setTimeout(initWbCanvas, 150);
            return;
        }

        wbCanvas = canvas;
        wbCtx = canvas.getContext('2d');

        const parent = canvas.parentElement;
        const availW = parent ? Math.max(400, parent.clientWidth - 20) : 900;
        wbCanvas.width = Math.min(1200, availW);
        wbCanvas.height = 500;
        wbCanvas.style.width = '100%';
        wbCanvas.style.height = 'auto';

        wbCtx.fillStyle = '#ffffff';
        wbCtx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
        wbCtx.lineCap = 'round';
        wbCtx.lineJoin = 'round';
        wbCtx.lineWidth = 4;
        wbCtx.strokeStyle = '#000000';

        setupWbDrawing();
        setWbColor('black');
        setWbSize(4);
        wbLog('Canvas initialized', wbCanvas.width, 'x', wbCanvas.height);
    } catch (e) {
        wbErr('initWbCanvas failed:', e);
    }
}

// ============ DRAWING ============
function setupWbDrawing() {
    const getCoords = (e) => {
        const rect = wbCanvas.getBoundingClientRect();
        const scaleX = wbCanvas.width / rect.width;
        const scaleY = wbCanvas.height / rect.height;
        let clientX, clientY;
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches[0]) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        return {
            x: Math.max(0, Math.min(wbCanvas.width, x)),
            y: Math.max(0, Math.min(wbCanvas.height, y))
        };
    };

    const start = (e) => {
        e.preventDefault();
        if (!wbCtx) return;
        wbDrawing = true;
        const c = getCoords(e);
        wbLastX = c.x;
        wbLastY = c.y;
        wbCtx.beginPath();
        wbCtx.moveTo(wbLastX, wbLastY);
        wbCtx.lineTo(wbLastX + 0.01, wbLastY + 0.01);
        wbCtx.stroke();
    };

    const draw = (e) => {
        if (!wbDrawing || !wbCtx) return;
        e.preventDefault();
        const c = getCoords(e);
        wbCtx.lineTo(c.x, c.y);
        wbCtx.stroke();
        wbCtx.beginPath();
        wbCtx.moveTo(c.x, c.y);
        syncWbDrawing();
    };

    const end = () => {
        if (!wbDrawing) return;
        wbDrawing = false;
        if (wbCtx) wbCtx.beginPath();
        syncWbDrawing();
    };

    // Remove old listeners first (in case of re-init)
    wbCanvas.replaceWith(wbCanvas.cloneNode(true));
    const fresh = document.getElementById('wbCanvas');
    if (fresh) {
        wbCanvas = fresh;
        wbCtx = fresh.getContext('2d');
        wbCtx.fillStyle = '#ffffff';
        wbCtx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
        wbCtx.lineCap = 'round';
        wbCtx.lineJoin = 'round';
        wbCtx.lineWidth = wbSize;
        wbCtx.strokeStyle = wbTool === 'eraser' ? '#ffffff' : wbColor;
        if (wbTool === 'eraser') wbCtx.globalCompositeOperation = 'destination-out';
    }

    wbCanvas.addEventListener('mousedown', start);
    wbCanvas.addEventListener('mousemove', draw);
    wbCanvas.addEventListener('mouseup', end);
    wbCanvas.addEventListener('mouseleave', end);
    wbCanvas.addEventListener('touchstart', start, { passive: false });
    wbCanvas.addEventListener('touchmove', draw, { passive: false });
    wbCanvas.addEventListener('touchend', end);
    wbCanvas.addEventListener('touchcancel', end);
}

// ============ TOOLBAR ============
function setWbTool(tool) {
    try {
        wbTool = tool;
        document.querySelectorAll('.wb-tool').forEach(btn => {
            btn.classList.remove('active');
            const txt = btn.textContent || '';
            if (tool === 'pen' && txt.includes('Pen')) btn.classList.add('active');
            if (tool === 'eraser' && txt.includes('Eraser')) btn.classList.add('active');
        });
        if (!wbCtx) return;
        if (wbTool === 'eraser') {
            wbCtx.globalCompositeOperation = 'destination-out';
            wbCtx.strokeStyle = '#ffffff';
        } else {
            wbCtx.globalCompositeOperation = 'source-over';
            wbCtx.strokeStyle = wbColor;
        }
    } catch (e) { wbErr('setWbTool:', e); }
}

function setWbColor(color) {
    try {
        wbColor = color;
        if (wbCtx && wbTool !== 'eraser') wbCtx.strokeStyle = color;
        document.querySelectorAll('.wb-color').forEach(el => {
            el.classList.remove('active');
            const bg = el.style.backgroundColor || '';
            if (bg === color || rgbMatches(bg, color)) el.classList.add('active');
        });
    } catch (e) { wbErr('setWbColor:', e); }
}

function rgbMatches(rgb, hex) {
    try {
        const d = document.createElement('div');
        d.style.color = hex;
        document.body.appendChild(d);
        const computed = getComputedStyle(d).color;
        document.body.removeChild(d);
        return computed === rgb;
    } catch { return false; }
}

function setWbSize(size) {
    try {
        wbSize = parseInt(size, 10) || 4;
        if (wbCtx) wbCtx.lineWidth = wbSize;
    } catch (e) { wbErr('setWbSize:', e); }
}

function clearWbCanvas() {
    if (!confirm('Clear the whiteboard for everyone?')) return;
    try {
        if (!wbCtx || !wbCanvas) return;
        wbCtx.globalCompositeOperation = 'source-over';
        wbCtx.fillStyle = '#ffffff';
        wbCtx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
        syncWbDrawing();
    } catch (e) { wbErr('clearWbCanvas:', e); }
}

// ============ SYNC ============
function syncWbDrawing() {
    if (!wbSessionCode || !wbCanvas) return;

    if (wbSyncTimer) clearTimeout(wbSyncTimer);
    wbSyncTimer = setTimeout(async () => {
        try {
            const dataUrl = wbCanvas.toDataURL();
            const payload = { data: dataUrl, timestamp: Date.now() };

            // Always store locally
            try {
                localStorage.setItem('wb_drawing_' + wbSessionCode, dataUrl);
            } catch (e) { /* quota may fail, ignore */ }

            const db = getWbDb();
            if (db) {
                try {
                    await db.ref('whiteboard/' + wbSessionCode + '/drawing').set(payload);
                } catch (e) {
                    wbErr('sync write failed (local copy still saved):', e.message || e);
                }
            }
        } catch (e) { wbErr('syncWbDrawing:', e); }
    }, 200);
}

// ============ END SESSION ============
async function endWbSession() {
    try {
        if (!wbSessionCode) {
            wbNotify('No active session', 'warning');
            return;
        }
        const code = wbSessionCode;

        // Detach listeners
        wbListeners.forEach(l => {
            try { l.ref.off('value', l.cb); } catch (e) {}
        });
        wbListeners = [];

        const db = getWbDb();
        if (db) {
            try {
                await db.ref('whiteboard/' + code).remove();
            } catch (e) { wbErr('end cloud remove failed:', e.message || e); }
        }

        try {
            localStorage.removeItem('wb_session_' + code);
            localStorage.removeItem('wb_drawing_' + code);
            localStorage.removeItem('wb_active_session');
        } catch (e) {}

        wbSessionCode = null;

        const panel = document.getElementById('wbSession');
        if (panel) {
            panel.style.display = 'none';
            panel.classList.remove('open');
        }
        wbNotify('Session ended', 'success');
    } catch (e) { wbErr('endWbSession:', e); }
}

// ============ COPY CODE ============
async function copyWbCode() {
    try {
        if (!wbSessionCode) {
            wbNotify('No active session to copy', 'warning');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(wbSessionCode);
            wbNotify('Code copied: ' + wbSessionCode, 'success');
        } else {
            // Fallback for older browsers / non-secure contexts
            const ta = document.createElement('textarea');
            ta.value = wbSessionCode;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); wbNotify('Code copied!', 'success'); }
            catch (e) { wbNotify('Could not copy. Code is: ' + wbSessionCode, 'info'); }
            document.body.removeChild(ta);
        }
    } catch (e) { wbErr('copyWbCode:', e); }
}

// ============ SIDEBAR BUTTON ============
function addWbStartButton() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) { setTimeout(addWbStartButton, 800); return; }

    let btn = document.getElementById('wbStartBtn');
    if (btn) return;

    btn = document.createElement('div');
    btn.className = 'nav-item';
    btn.id = 'wbStartBtn';
    btn.innerHTML = '<span style="font-size:1.1rem;">🎨</span> Start Whiteboard';
    btn.onclick = startWbSession;
    btn.style.cssText = 'background: var(--gradient-flame); color: white; margin-top: 10px; font-weight: 600;';

    // Prefer insertion into the nav list, fallback to sidebar end
    const nav = sidebar.querySelector('.sidebar-nav');
    if (nav && nav.parentNode) {
        nav.appendChild(btn);
    } else {
        const navSectionContent = sidebar.querySelector('.sidebar-section .section-content');
        if (navSectionContent) navSectionContent.appendChild(btn);
        else sidebar.appendChild(btn);
    }
    wbLog('Start button added to sidebar');
}

// Try repeatedly because sidebar reorganizer wipes the sidebar
[800, 1600, 2500, 3500, 5000].forEach(t => setTimeout(addWbStartButton, t));

// Attach toolbar listeners if they exist
document.addEventListener('DOMContentLoaded', () => {
    // Nothing else to do — toolbar buttons use inline onclick
    wbLog('Whiteboard module ready');
});