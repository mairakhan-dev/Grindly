(function() {
    'use strict';

    console.log('🚀 FINAL CHALLENGE SYSTEM (streak‑only) loading...');

    // ----- Helper: get DB -----
    function getDB() {
        if (typeof database !== 'undefined' && database) return database;
        if (typeof firebase !== 'undefined' && firebase.database) return firebase.database();
        return null;
    }

    function getClassCode() {
        if (typeof currentClassCode !== 'undefined' && currentClassCode) return currentClassCode;
        return localStorage.getItem('teacher_current_class_code') || null;
    }

    function getTeacherId() {
        if (typeof teacherId !== 'undefined' && teacherId) return teacherId;
        return localStorage.getItem('teacher_userId') || null;
    }

    // ----- Fresh fetch of students for a class -----
    async function fetchStudentsFresh(classCode) {
        const db = getDB();
        if (!db) return [];
        try {
            let snap = await db.ref(`classes/${classCode}/students`).once('value');
            if (!snap.exists()) {
                snap = await db.ref(`classStudents/${classCode}`).once('value');
            }
            if (snap.exists()) {
                const students = [];
                snap.forEach(child => students.push(child.val()));
                return students;
            }
        } catch (e) { console.warn('Fetch error:', e); }
        return [];
    }

    // ----- Student streak extraction -----
    function getStudentStreak(student) {
        const fields = ['streak', 'currentStreak', 'dayStreak', 'streakCount'];
        for (let f of fields) {
            if (student[f] !== undefined && student[f] !== null) {
                const val = parseFloat(student[f]);
                if (!isNaN(val)) return val;
            }
        }
        return 0;
    }

    // ----- Calculate average streak for a class -----
    async function getClassAvgStreak(classCode) {
        const students = await fetchStudentsFresh(classCode);
        if (students.length === 0) return 0;
        let total = 0;
        students.forEach(s => total += getStudentStreak(s));
        return parseFloat((total / students.length).toFixed(1));
    }

    // ----- Enrich a challenge with streak scores (only) -----
    async function enrichChallengeFresh(challenge, log = false) {
        const classCode = getClassCode();
        if (!classCode) return challenge;

        // If type is missing or not 'streak_count', set scores to 0
        if (!challenge.type || challenge.type !== 'streak_count') {
            if (log) console.warn(`⚠️ Challenge "${challenge.name}" is not streak_count – scores set to 0.`);
            challenge.challengerScore = 0;
            challenge.opponentScore = 0;
            challenge.myScore = 0;
            challenge.opponentScore = 0;
            challenge.myWinning = false;
            challenge.progress = challenge.status === 'completed' ? 100 : 0;
            return challenge;
        }

        const isChallenger = challenge.challengerClass === classCode;
        const oppClass = isChallenger ? challenge.opponentClass : challenge.challengerClass;

        let ourScore, oppScore;
        ourScore = await getClassAvgStreak(classCode);
        oppScore = await getClassAvgStreak(oppClass);

        if (isChallenger) {
            challenge.challengerScore = ourScore;
            challenge.opponentScore = oppScore;
        } else {
            challenge.opponentScore = ourScore;
            challenge.challengerScore = oppScore;
        }
        challenge.myScore = isChallenger ? challenge.challengerScore : challenge.opponentScore;
        challenge.opponentScore = isChallenger ? challenge.opponentScore : challenge.challengerScore;
        challenge.myWinning = challenge.myScore > challenge.opponentScore;

        // Progress
        if (challenge.status === 'active' && challenge.endsAt) {
            const start = new Date(challenge.createdAt).getTime();
            const end = new Date(challenge.endsAt).getTime();
            const now = Date.now();
            challenge.progress = (end > start) ? Math.min(100, Math.round(((now - start) / (end - start)) * 100)) : 100;
        } else {
            challenge.progress = challenge.status === 'completed' ? 100 : 0;
        }

        // Auto‑complete if ended
        if (challenge.status === 'active' && challenge.endsAt && new Date(challenge.endsAt) <= new Date()) {
            challenge.status = 'completed';
            challenge.result = {
                winner: challenge.myWinning ? classCode : (isChallenger ? challenge.opponentClass : challenge.challengerClass),
                challengerScore: challenge.challengerScore,
                opponentScore: challenge.opponentScore,
                completedAt: new Date().toISOString()
            };
        }

        return challenge;
    }

    // ----- Main sync -----
    async function syncAndRender() {
        const db = getDB();
        if (!db) { console.warn('No DB'); return; }
        const classCode = getClassCode();
        if (!classCode) { console.warn('No class code'); return; }

        console.log('🔄 SYNC: fetching challenges...');
        const snapshot = await db.ref('challenges').once('value');
        const all = [];
        if (snapshot.exists()) {
            snapshot.forEach(child => {
                const chal = child.val();
                if (chal.challengerClass === classCode || chal.opponentClass === classCode) {
                    all.push({ id: child.key, ...chal });
                }
            });
        }

        console.log(`📋 Found ${all.length} challenges for this class.`);

        // Enrich with fresh scores (log first 5)
        const enriched = [];
        let count = 0;
        for (const c of all) {
            const log = count < 5;
            const e = await enrichChallengeFresh(c, log);
            enriched.push(e);
            console.log(`  Challenge ${e.name}: type=${e.type || 'unknown'}, myScore=${e.myScore || 0}, oppScore=${e.opponentScore || 0}`);
            count++;
        }

        // Update globals
        window.allChallenges = enriched;
        window.activeChallenges = enriched.filter(c => c.status === 'active');
        window.pendingChallenges = enriched.filter(c => c.status === 'pending' && c.opponentClass === classCode);
        window.completedChallenges = enriched.filter(c => c.status === 'completed' || c.status === 'rejected');

        try {
            localStorage.setItem(`class_${classCode}_challenges_all`, JSON.stringify(enriched));
        } catch (e) {}

        renderChallenges(enriched, classCode);
        console.log('✅ Sync complete.');
    }

    // ----- RENDER function (overwrites the DOM) -----
    function renderChallenges(challenges, classCode) {
        const container = document.getElementById('allChallengesList');
        if (!container) {
            console.warn('⚠️ allChallengesList not found.');
            return;
        }

        if (!challenges || challenges.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚔️</div><div class="empty-state-title">No challenges</div></div>`;
            return;
        }

        const html = challenges.map(c => {
            const statusColor = c.status === 'active' ? 'var(--success)' : c.status === 'pending' ? 'var(--warning)' : 'var(--info)';
            const resultText = (c.status === 'completed' && c.result) ?
                `🏆 ${c.result.winner === classCode ? 'You Won!' : `${c.result.winner} Won`}` : '';

            return `
                <div class="challenge-card" style="border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;background:var(--card);">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                        <div>
                            <div style="font-weight:700;font-size:1.1rem;">${c.name || 'Challenge'}</div>
                            <div style="font-size:0.85rem;color:var(--text-muted);">vs ${c.opponentClass} • ${c.duration || 1} days</div>
                        </div>
                        <span style="background:${statusColor};color:white;padding:4px 12px;border-radius:1rem;font-size:0.75rem;font-weight:600;">${c.status}</span>
                    </div>
                    ${resultText ? `<div style="text-align:center;padding:8px;background:${c.result.winner === classCode ? 'var(--gradient-success)' : 'rgba(239,68,68,0.1)'};border-radius:8px;margin:8px 0;font-weight:700;">${resultText}</div>` : ''}
                    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;margin:12px 0;">
                        <div style="text-align:center;">
                            <div style="font-size:0.8rem;color:var(--text-muted);">You</div>
                            <div style="font-size:1.5rem;font-weight:800;color:${c.myWinning && c.status === 'active' ? 'var(--success)' : 'var(--text)'};">${c.myScore || 0}</div>
                        </div>
                        <div style="font-size:1.2rem;font-weight:900;color:var(--accent);">VS</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.8rem;color:var(--text-muted);">Opponent</div>
                            <div style="font-size:1.5rem;font-weight:800;">${c.opponentScore || 0}</div>
                        </div>
                    </div>
                    ${c.status === 'active' ? `
                        <div style="margin:8px 0;">
                            <div style="height:6px;background:var(--bg);border-radius:3px;overflow:hidden;">
                                <div style="height:100%;width:${c.progress || 0}%;background:var(--gradient-primary);"></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
                                <span>${c.progress || 0}%</span>
                                <span>${c.timeRemaining || ''}</span>
                            </div>
                        </div>
                    ` : ''}
                    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
                        <button class="btn btn-secondary" onclick="window.showChallengeDetail('${c.id}')" style="flex:1;">Details</button>
                        ${c.status === 'pending' && c.opponentClass === classCode ? `
                            <button class="btn btn-success" onclick="window.acceptChallengeNow('${c.id}')" style="flex:1;">Accept</button>
                        ` : ''}
                        ${c.status === 'pending' && c.challengerClass === classCode ? `
                            <button class="btn btn-danger" onclick="window.cancelChallengeNow('${c.id}')" style="flex:1;">Cancel</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('🎨 UI rendered.');
    }

    // ----- Debug Students (helper) -----
    async function debugStudents() {
        const classCode = getClassCode();
        if (!classCode) { alert('No class code'); return; }
        const students = await fetchStudentsFresh(classCode);
        console.log('📊 Raw student data for class', classCode);
        console.table(students);
        students.forEach((s, i) => {
            console.log(`Student ${i+1}:`, s);
            console.log('   Keys:', Object.keys(s));
        });
        alert(`Found ${students.length} students. Check console.`);
    }

    // ----- Accept & Cancel -----
    window.acceptChallengeNow = async function(id) {
        const db = getDB();
        if (!db) return;
        const chal = (window.allChallenges || []).find(c => c.id === id);
        if (!chal) return;
        if (confirm(`Accept "${chal.name}"?`)) {
            await db.ref(`challenges/${id}`).update({
                status: 'active',
                isAccepted: true,
                endsAt: new Date(Date.now() + chal.duration * 24 * 60 * 60 * 1000).toISOString()
            });
            await syncAndRender();
        }
    };

    window.cancelChallengeNow = async function(id) {
        const db = getDB();
        if (!db) return;
        const chal = (window.allChallenges || []).find(c => c.id === id);
        if (!chal) return;
        if (confirm(`Cancel "${chal.name}"?`)) {
            await db.ref(`challenges/${id}`).update({ status: 'rejected' });
            await syncAndRender();
        }
    };

    window.showChallengeDetail = function(id) {
        const chal = (window.allChallenges || []).find(c => c.id === id);
        if (!chal) return alert('Not found');
        alert(`📋 ${chal.name}\nStatus: ${chal.status}\nYour Score: ${chal.myScore || 0}\nOpponent: ${chal.opponentScore || 0}\n${chal.result ? 'Winner: ' + chal.result.winner : ''}`);
    };

    // ----- Add UI buttons (Force Sync & Debug Students) -----
    function addDebugUI() {
        const header = document.querySelector('#challenges .content-header');
        if (!header) { setTimeout(addDebugUI, 2000); return; }

        if (!document.getElementById('ultimateSyncBtn')) {
            const btn = document.createElement('button');
            btn.id = 'ultimateSyncBtn';
            btn.className = 'btn btn-primary';
            btn.textContent = '🔄 Force Sync & Render';
            btn.onclick = function() { syncAndRender(); alert('Sync started. Check console.'); };
            btn.style.marginLeft = '10px';
            header.appendChild(btn);
        }

        if (!document.getElementById('debugStudentsBtn')) {
            const dbg = document.createElement('button');
            dbg.id = 'debugStudentsBtn';
            dbg.className = 'btn btn-warning';
            dbg.textContent = '👥 Debug Students';
            dbg.onclick = function() { debugStudents(); };
            dbg.style.marginLeft = '10px';
            header.appendChild(dbg);
        }

        console.log('✅ Debug UI added.');
    }

    // ----- Hide "Total Study Hours" from UI -----
    function hideStudyHoursOption() {
        const el = document.getElementById('typeStudyHours');
        if (el) {
            el.style.display = 'none';
            console.log('✅ Hidden "Total Study Hours" option.');
        } else {
            // If not found, try again later
            setTimeout(hideStudyHoursOption, 1000);
        }
    }

    // ----- Override createChallengeHelper to only allow streak_count -----
    window.createChallengeHelper = async function(challengeType, duration, opponentClassCode, challengeName, message) {
        // Force type to streak_count
        const forcedType = 'streak_count';
        console.log(`⚔️ Creating challenge (forced type: ${forcedType})...`);
        const classCode = getClassCode();
        const teacherId = getTeacherId();
        if (!classCode || !teacherId) {
            console.error('❌ Missing class code or teacher ID.');
            return false;
        }

        const endsAt = new Date();
        endsAt.setDate(endsAt.getDate() + duration);

        const challenge = {
            name: challengeName || 'Streak Challenge',
            type: forcedType,
            challengerClass: classCode,
            challengerTeacherId: teacherId,
            challengerTeacherName: (typeof teacherName !== 'undefined' ? teacherName : 'Teacher'),
            opponentClass: opponentClassCode,
            status: 'pending',
            duration: duration,
            createdAt: new Date().toISOString(),
            endsAt: endsAt.toISOString(),
            message: message || null,
            challengerScore: 0,
            opponentScore: 0,
            isAccepted: false
        };

        const db = getDB();
        if (!db) { console.error('❌ No database.'); return false; }

        try {
            const challengeRef = db.ref('challenges').push();
            const challengeId = challengeRef.key;
            await challengeRef.set(challenge);
            console.log(`✅ Challenge saved: ${challengeId}`);

            // Send notification
            await sendChallengeNotification(challengeId, challenge);

            // Sync immediately
            await syncAndRender();

            if (typeof showNotification === 'function') {
                showNotification('✅ Challenge sent!', 'success');
            }
            return true;
        } catch (error) {
            console.error('❌ Error:', error);
            return false;
        }
    };

    // ----- Send notification to opponent -----
    async function sendChallengeNotification(challengeId, challengeData) {
        const db = getDB();
        if (!db) return false;
        try {
            const opponentClassCode = challengeData.opponentClass;
            const classSnap = await db.ref(`classCodes/${opponentClassCode}`).once('value');
            if (!classSnap.exists()) return false;
            const opponentTeacherId = classSnap.val().teacherId;
            if (!opponentTeacherId) return false;

            const notification = {
                type: 'challenge_invitation',
                challengeId: challengeId,
                challengerClass: challengeData.challengerClass,
                challengerTeacherName: challengeData.challengerTeacherName || 'Teacher',
                opponentClass: opponentClassCode,
                challengeName: challengeData.name,
                challengeType: challengeData.type,
                duration: challengeData.duration,
                message: challengeData.message || '',
                createdAt: new Date().toISOString(),
                status: 'unread',
                isAccepted: false
            };

            await db.ref(`notifications/${opponentTeacherId}/${challengeId}`).set(notification);
            console.log(`✅ Notification sent to ${opponentTeacherId}`);
            return true;
        } catch (e) {
            console.error('❌ Notification error:', e);
            return false;
        }
    }

    // ----- Real‑time listeners -----
    let challengeListener = null;
    function attachListeners() {
        const db = getDB();
        if (!db) { setTimeout(attachListeners, 2000); return; }
        const classCode = getClassCode();
        if (!classCode) { setTimeout(attachListeners, 2000); return; }

        if (challengeListener) {
            try { challengeListener.off(); } catch (e) {}
        }
        challengeListener = db.ref('challenges');
        challengeListener.on('value', function() {
            console.log('📥 Challenge change – syncing...');
            syncAndRender();
        });

        const paths = [`classes/${classCode}/students`, `classStudents/${classCode}`];
        paths.forEach(path => {
            const ref = db.ref(path);
            ref.on('value', function() {
                console.log('📥 Student data changed – syncing...');
                syncAndRender();
            });
        });

        console.log('📡 Real‑time listeners attached.');
    }

    // ----- Override original functions to point to ours -----
    window.updateChallengesUI = function() { syncAndRender(); };
    window.filterChallenges = function() { syncAndRender(); };
    window.manualSyncChallenges = syncAndRender;

    // ----- Initialise -----
    function init() {
        console.log('🚀 FINAL CHALLENGE SYSTEM (streak‑only) initializing...');
        // Hide the study hours option
        setTimeout(hideStudyHoursOption, 1000);
        // Attach listeners & sync
        setTimeout(attachListeners, 1500);
        setTimeout(syncAndRender, 2000);
        setTimeout(addDebugUI, 3000);
        setInterval(syncAndRender, 30000);
        console.log('✅ FINAL CHALLENGE SYSTEM ready.');
        console.log('ℹ️ Only "Streak Count" challenges are supported.');
        console.log('ℹ️ Use syncChallengesNow() to force refresh.');
        console.log('ℹ️ Use debugStudents() to see raw student data.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();