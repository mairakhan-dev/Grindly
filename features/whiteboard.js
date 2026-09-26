
    let wbCanvas = null, wbCtx = null;
let wbDrawing = false;
let wbTool = 'pen';
let wbColor = 'black';
let wbSize = 4;
let wbLastX = 0, wbLastY = 0;
let wbSessionCode = null;
let wbSyncTimer = null;

function getWbDb() {
    return window.database || (firebase ? firebase.database() : null);
}

function generateWbCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function startWbSession() {
    wbSessionCode = generateWbCode();
    
    const db = getWbDb();
    if (!db) {
        alert("Database not connected. Please refresh.");
        return;
    }
    
    db.ref(`whiteboard/${wbSessionCode}`).set({
        active: true,
        startedAt: Date.now(),
        teacher: 'teacher',
        drawing: null,
        participants: {}
    });
    
    document.getElementById('wbCodeDisplay').textContent = wbSessionCode;
    document.getElementById('wbSession').style.display = 'block';
    
    // Listen for participants
    db.ref(`whiteboard/${wbSessionCode}/participants`).on('value', (snapshot) => {
        let count = 0;
        if (snapshot.exists()) {
            snapshot.forEach(() => count++);
        }
        document.getElementById('wbParticipantCount').textContent = count;
    });
    
    // Listen for drawing updates from students
    db.ref(`whiteboard/${wbSessionCode}/drawing`).on('value', (snapshot) => {
        if (snapshot.exists() && wbCtx) {
            const data = snapshot.val();
            if (data && data.data) {
                const img = new Image();
                img.onload = () => {
                    wbCtx.drawImage(img, 0, 0, wbCanvas.width, wbCanvas.height);
                };
                img.src = data.data;
            }
        }
    });
    
    initWbCanvas();
    alert(`✅ Session started!\n\nCode: ${wbSessionCode}\nShare this code with students to join.`);
}

function initWbCanvas() {
    const canvas = document.getElementById('wbCanvas');
    if (!canvas) { setTimeout(initWbCanvas, 100); return; }
    
    wbCanvas = canvas;
    wbCtx = canvas.getContext('2d');
    
    const container = canvas.parentElement;
    wbCanvas.width = Math.min(1000, container.clientWidth - 20);
    wbCanvas.height = 500;
    wbCanvas.style.width = '100%';
    wbCanvas.style.height = 'auto';
    
    wbCtx.fillStyle = 'white';
    wbCtx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
    
    setupWbDrawing();
    setWbColor('black');
    setWbSize(4);
}

function setupWbDrawing() {
    const getCoords = (e) => {
        const rect = wbCanvas.getBoundingClientRect();
        const scaleX = wbCanvas.width / rect.width;
        const scaleY = wbCanvas.height / rect.height;
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        x = Math.max(0, Math.min(wbCanvas.width, x));
        y = Math.max(0, Math.min(wbCanvas.height, y));
        return { x, y };
    };
    
    const start = (e) => {
        e.preventDefault();
        wbDrawing = true;
        const coords = getCoords(e);
        wbLastX = coords.x;
        wbLastY = coords.y;
        wbCtx.beginPath();
        wbCtx.moveTo(wbLastX, wbLastY);
    };
    
    const draw = (e) => {
        if (!wbDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);
        const x = coords.x, y = coords.y;
        
        wbCtx.lineTo(x, y);
        wbCtx.stroke();
        wbCtx.beginPath();
        wbCtx.moveTo(x, y);
        
        syncWbDrawing();
    };
    
    const end = () => {
        if (!wbDrawing) return;
        wbDrawing = false;
        wbCtx.beginPath();
        syncWbDrawing();
    };
    
    wbCanvas.addEventListener('mousedown', start);
    wbCanvas.addEventListener('mousemove', draw);
    wbCanvas.addEventListener('mouseup', end);
    wbCanvas.addEventListener('mouseleave', end);
    wbCanvas.addEventListener('touchstart', start);
    wbCanvas.addEventListener('touchmove', draw);
    wbCanvas.addEventListener('touchend', end);
}

function setWbTool(tool) {
    wbTool = tool;
    document.querySelectorAll('.wb-tool').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(tool === 'pen' ? 'Pen' : 'Eraser')) {
            btn.classList.add('active');
        }
    });
    
    if (wbTool === 'eraser') {
        wbCtx.globalCompositeOperation = 'destination-out';
        wbCtx.strokeStyle = 'white';
    } else {
        wbCtx.globalCompositeOperation = 'source-over';
        wbCtx.strokeStyle = wbColor;
    }
    wbCtx.lineCap = 'round';
    wbCtx.lineJoin = 'round';
}

function setWbColor(color) {
    wbColor = color;
    if (wbTool !== 'eraser') {
        wbCtx.strokeStyle = color;
    }
    document.querySelectorAll('.wb-color').forEach(el => {
        el.classList.remove('active');
        if (el.style.backgroundColor === color) el.classList.add('active');
    });
}

function setWbSize(size) {
    wbSize = parseInt(size);
    wbCtx.lineWidth = wbSize;
}

function clearWbCanvas() {
    if (confirm("Clear the whiteboard for everyone?")) {
        wbCtx.fillStyle = 'white';
        wbCtx.fillRect(0, 0, wbCanvas.width, wbCanvas.height);
        syncWbDrawing();
    }
}

function syncWbDrawing() {
    const db = getWbDb();
    if (!db || !wbSessionCode) return;
    if (wbSyncTimer) clearTimeout(wbSyncTimer);
    
    wbSyncTimer = setTimeout(() => {
        try {
            const drawingData = wbCanvas.toDataURL();
            db.ref(`whiteboard/${wbSessionCode}/drawing`).set({
                data: drawingData,
                timestamp: Date.now()
            });
        } catch(e) {}
    }, 100);
}

function endWbSession() {
    if (!wbSessionCode) return;
    const db = getWbDb();
    if (db) {
        db.ref(`whiteboard/${wbSessionCode}`).remove();
    }
    wbSessionCode = null;
    document.getElementById('wbSession').style.display = 'none';
    alert("Session ended.");
}

function copyWbCode() {
    if (wbSessionCode) {
        navigator.clipboard.writeText(wbSessionCode);
        alert("Code copied!");
    }
}

function addWbStartButton() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) { setTimeout(addWbStartButton, 1000); return; }
    if (document.getElementById('wbStartBtn')) return;
    
    const btn = document.createElement('div');
    btn.className = 'nav-item';
    btn.id = 'wbStartBtn';
    btn.innerHTML = '🎨 Start Whiteboard';
    btn.onclick = startWbSession;
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.style.marginTop = '10px';
    sidebar.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addWbStartButton, 2000);
});

