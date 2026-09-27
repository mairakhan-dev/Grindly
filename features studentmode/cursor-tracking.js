// ========== REAL-TIME CURSOR TRACKING - WORKING VERSION ==========
(function() {
    let cursorTrackingActive = false;
    let cursorRef = null;
    let myCursorId = null;
    let sessionId = null;
    
    // Get database
    function getDb() {
        return window.database || (window.firebase ? firebase.database() : null);
    }
    
    // Get current user info
    function getUserInfo() {
        const isTeacher = window.location.href.includes('teachermode') || document.querySelector('.teacher-emoji');
        return {
            id: isTeacher ? 'teacher_' + (localStorage.getItem('teacherUserId') || Date.now()) : localStorage.getItem('studentUserId') || 'student_' + Date.now(),
            name: isTeacher ? (localStorage.getItem('teacherName') || 'Teacher') : (localStorage.getItem('studentName') || 'Student'),
            isTeacher: isTeacher
        };
    }
    
    // Get current session code from whiteboard
    function getSessionCode() {
        // Try all possible session code elements
        const codeEl = document.getElementById('wbCodeDisplay') || 
                       document.getElementById('activeWbCode') ||
                       document.getElementById('activeSimpleCode') ||
                       document.querySelector('.wb-session-code');
        
        if (codeEl && codeEl.textContent && codeEl.textContent !== '------') {
            return codeEl.textContent.trim();
        }
        
        // Also check if there's a session code variable in window
        if (window.wbSessionCode) return window.wbSessionCode;
        if (window.stuWbSessionCode) return window.stuWbSessionCode;
        
        return null;
    }
    
    // Track mouse movement
    function trackMouseMovement(canvas, sessionCode, userInfo) {
        if (!canvas || !sessionCode) return;
        
        const db = getDb();
        if (!db) return;
        
        myCursorId = userInfo.id;
        cursorRef = db.ref(`whiteboard/${sessionCode}/cursors/${myCursorId}`);
        
        // Send initial presence
        cursorRef.set({
            name: userInfo.name,
            isTeacher: userInfo.isTeacher,
            active: true,
            lastUpdate: Date.now()
        });
        
        // Track mouse movement
        let lastSend = 0;
        
        const sendPosition = (x, y) => {
            if (!cursorRef) return;
            cursorRef.update({
                x: x,
                y: y,
                lastUpdate: Date.now()
            }).catch(() => {});
        };
        
        const onMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            // Only track if mouse is inside canvas
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                
                const x = e.clientX;
                const y = e.clientY;
                
                const now = Date.now();
                if (now - lastSend > 30) { // Send every 30ms for smooth tracking
                    lastSend = now;
                    sendPosition(x, y);
                }
            }
        };
        
        const onMouseLeave = () => {
            cursorRef.update({ x: null, y: null }).catch(() => {});
        };
        
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        
        // Store cleanup function
        canvas._cursorCleanup = () => {
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            cursorRef.remove().catch(() => {});
        };
        
        console.log('✅ Cursor tracking active for:', userInfo.name);
    }
    
    // Display other users' cursors
    function displayOtherCursors(sessionCode) {
        const db = getDb();
        if (!db || !sessionCode) return;
        
        const cursorContainer = document.createElement('div');
        cursorContainer.id = 'cursor-container';
        cursorContainer.style.position = 'fixed';
        cursorContainer.style.top = '0';
        cursorContainer.style.left = '0';
        cursorContainer.style.width = '100%';
        cursorContainer.style.height = '100%';
        cursorContainer.style.pointerEvents = 'none';
        cursorContainer.style.zIndex = '9998';
        document.body.appendChild(cursorContainer);
        
        db.ref(`whiteboard/${sessionCode}/cursors`).on('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            const cursors = snapshot.val();
            
            // Remove cursors that are no longer active
            document.querySelectorAll('.cursor-tracker').forEach(el => {
                const id = el.dataset.userId;
                if (!cursors[id] || !cursors[id].x) {
                    el.remove();
                }
            });
            
            // Add/update cursors
            Object.keys(cursors).forEach(userId => {
                if (userId === myCursorId) return; // Skip own cursor
                
                const data = cursors[userId];
                if (!data.x || !data.y) return; // No position
                
                let cursorEl = document.getElementById(`cursor-${userId}`);
                
                if (!cursorEl) {
                    cursorEl = document.createElement('div');
                    cursorEl.className = 'cursor-tracker';
                    cursorEl.id = `cursor-${userId}`;
                    cursorEl.dataset.userId = userId;
                    cursorEl.innerHTML = `
                        <div class="cursor-dot" style="background: ${data.isTeacher ? 'rgba(255, 107, 107, 0.4)' : 'rgba(108, 99, 255, 0.4)'}; border-color: ${data.isTeacher ? '#ff6b6b' : '#6c63ff'};"></div>
                        <div class="cursor-label">${escapeHtml(data.name)} ${data.isTeacher ? '👩‍🏫' : '👨‍🎓'}</div>
                    `;
                    cursorContainer.appendChild(cursorEl);
                }
                
                cursorEl.style.left = (data.x - 10) + 'px';
                cursorEl.style.top = (data.y - 10) + 'px';
            });
        });
    }
    
    // Clean up inactive cursors
    function cleanupInactiveCursors(sessionCode) {
        const db = getDb();
        if (!db || !sessionCode) return;
        
        const now = Date.now();
        db.ref(`whiteboard/${sessionCode}/cursors`).once('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            const cursors = snapshot.val();
            Object.keys(cursors).forEach(userId => {
                const data = cursors[userId];
                if (now - (data.lastUpdate || 0) > 10000) { // Inactive for 10 seconds
                    db.ref(`whiteboard/${sessionCode}/cursors/${userId}`).remove();
                }
            });
        });
    }
    
    // Main initialization function
    function initCursorTracking() {
        if (cursorTrackingActive) return;
        
        // Find the canvas
        const canvas = document.getElementById('wbCanvas') || document.getElementById('studentWbCanvas');
        if (!canvas) {
            setTimeout(initCursorTracking, 1000);
            return;
        }
        
        // Get session code
        const checkSession = setInterval(() => {
            const code = getSessionCode();
            if (code && code !== '------') {
                clearInterval(checkSession);
                
                sessionId = code;
                const userInfo = getUserInfo();
                myCursorId = userInfo.id;
                
                // Start tracking
                trackMouseMovement(canvas, sessionId, userInfo);
                displayOtherCursors(sessionId);
                cursorTrackingActive = true;
                
                // Clean up inactive cursors every 10 seconds
                setInterval(() => cleanupInactiveCursors(sessionId), 10000);
                
                console.log('🎯 Cursor tracking started for session:', sessionId);
            }
        }, 500);
        
        // Stop tracking on page unload
        window.addEventListener('beforeunload', () => {
            if (cursorRef) cursorRef.remove().catch(() => {});
            if (sessionId && getDb()) {
                getDb().ref(`whiteboard/${sessionId}/cursors/${myCursorId}`).remove().catch(() => {});
            }
        });
    }
    
    // Helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Start tracking when whiteboard is opened
    const checkWhiteboardInterval = setInterval(() => {
        const whiteboard = document.getElementById('wbSession') || document.getElementById('studentWhiteboardFinal') || document.getElementById('studentWhiteboardContainer');
        if (whiteboard && whiteboard.style.display === 'block') {
            if (!cursorTrackingActive) {
                setTimeout(initCursorTracking, 500);
            }
        }
    }, 2000);
    
    // Also try to start when page loads if whiteboard is already open
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const whiteboard = document.getElementById('wbSession') || document.getElementById('studentWhiteboardFinal');
            if (whiteboard && whiteboard.style.display === 'block') {
                initCursorTracking();
            }
        }, 2000);
    });
    
    // Expose function to manually start
    window.startCursorTracking = initCursorTracking;
    
    console.log('🎯 Cursor tracking system ready');
})();
