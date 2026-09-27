// ========== GRINDLY LEARN ULTIMATE TOUR ==========
// Self-contained feature module. Requires features/tour.css to be loaded.
// Public API: window.grindlyTour.{start,next,prev,goTo,skip,reset}
// Backward compat: window.{nextTourStep,goToStep,skipTour,startTour}
(function () {
    'use strict';

    // ---------- Config ----------
    const CONFIG = {
        storageKey: 'grindly_tour_completed_v5',
        startDelay: 700,           // ms after readiness before step 1 shows
        maxWaitForReadyMs: 8000,   // hard cap on readiness poll
        readyPollMs: 250,
        readyNavThreshold: 6,      // nav items needed to consider sidebar ready
        tooltipGap: 14,
        arrowLifetimeMs: 2500,
        celebrationAutoCloseMs: 6000,
    };

    // ---------- Bail if already completed ----------
    try {
        if (localStorage.getItem(CONFIG.storageKey) === 'true') {
            console.log('🎓 Tour already completed — skipping.');
            return;
        }
    } catch (_) { /* storage blocked; proceed anyway */ }

    console.log('🎓 Starting ULTIMATE tour…');

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================================
    //  SOUND ENGINE  — lazy AudioContext, reusable, no leaks
    // ==========================================================
    let audioCtx = null;
    function getAudioCtx() {
        if (audioCtx) return audioCtx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        try { audioCtx = new Ctx(); } catch (_) { audioCtx = null; }
        return audioCtx;
    }

    const SOUNDS = {
        click:     { freq: 523.25, dur: 0.11 },
        feature:   { freq: 440.00, dur: 0.14 },
        highlight: { freq: 880.00, dur: 0.10 },
        group:     { freq: 523.25, dur: 0.14, harmonics: [523.25, 659.25] },
        magic:     { freq: 783.99, dur: 0.18, harmonics: [523.25, 659.25, 783.99] },
        success:   { freq: 523.25, dur: 0.14, harmonics: [523.25, 659.25] },
        complete:  { freq: 659.25, dur: 0.26, harmonics: [523.25, 659.25, 783.99, 1046.5] },
    };

    function playSound(name) {
        if (prefersReducedMotion) return;
        const spec = SOUNDS[name] || SOUNDS.click;
        const ctx = getAudioCtx();
        if (!ctx) return;
        try {
            const now = ctx.currentTime;
            const master = ctx.createGain();
            master.gain.setValueAtTime(0.14, now);
            master.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur + 0.08);
            master.connect(ctx.destination);

            const freqs = spec.harmonics || [spec.freq];
            freqs.forEach(function (f, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0.22 / (i + 1), now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.dur);
                osc.connect(gain);
                gain.connect(master);
                osc.start(now);
                osc.stop(now + spec.dur);
            });
        } catch (_) { /* silent fail */ }
    }

    // ==========================================================
    //  SPARKLE FX
    // ==========================================================
    function spawnSparkles(x, y, count) {
        if (prefersReducedMotion) return;
        count = count || 8;
        for (let i = 0; i < count; i++) {
            const s = document.createElement('div');
            s.className = 'tour-sparkle';
            s.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
            s.style.top  = (y + (Math.random() - 0.5) * 40) + 'px';
            s.style.animationDelay = (Math.random() * 0.4) + 's';
            document.body.appendChild(s);
            setTimeout(function () { s.remove(); }, 1000);
        }
    }

    function clearAllSparkles() {
        document.querySelectorAll('.tour-sparkle').forEach(function (el) { el.remove(); });
    }

    // ==========================================================
    //  STEP DEFINITIONS  (content preserved from v5)
    // ==========================================================
    const TOUR_STEPS = [
        {
            title: "🎨 LIVE WHITEBOARD",
            description: "Join your teacher's live whiteboard session with a 6-digit code. Draw together in REAL-TIME! Everyone sees what you draw instantly.",
            icon: "🎨",
            impact: "🔥 REVOLUTIONARY",
            features: [
                { icon: "✏️", text: "Draw Together" },
                { icon: "⚡", text: "Real-time Sync" },
                { icon: "🔑", text: "6-Digit Code" }
            ],
            navText: "Join Whiteboard",
            highlightElement: "Join Whiteboard",
            tooltip: "👆 Click here to join live sessions! Enter your teacher's 6-digit code and start drawing with your whole class.",
            sound: "feature"
        },
        {
            title: "👥 STUDY GROUPS",
            description: "Form study groups with classmates! Collaborate, share resources, and learn together. Group study boosts retention by 50%!",
            icon: "👥",
            impact: "🤝 COLLABORATIVE",
            features: [
                { icon: "👥", text: "Create Groups" },
                { icon: "📚", text: "Study Together" },
                { icon: "💬", text: "Group Chat" }
            ],
            navText: "Study Group",
            highlightElement: "Study Group",
            tooltip: "👆 Click here to join or create study groups! Learning with friends is more effective and fun!",
            sound: "group"
        },
        {
            title: "🔥 STUDY STREAK",
            description: "Your daily consistency builds unstoppable momentum. Study every day to grow your streak. Don't break the chain!",
            icon: "🔥",
            impact: "💪 POWERFUL",
            features: [
                { icon: "3️⃣", text: "Day 3: Starter" },
                { icon: "7️⃣", text: "Day 7: Builder" },
                { icon: "3️⃣0️⃣", text: "Day 30: Champion" }
            ],
            highlightSelector: ".streak-card, .streak-number",
            tooltip: "👆 Click the button below EVERY DAY to mark your study session! Your streak grows with consistency!",
            sound: "highlight"
        },
        {
            title: "📝 MEMORY WALL",
            description: "A digital bulletin board for your class! Share achievements, encouraging words, and memories. Like what others share!",
            icon: "📝",
            impact: "❤️ COLLABORATIVE",
            features: [
                { icon: "📌", text: "Sticky Notes" },
                { icon: "❤️", text: "Like Posts" },
                { icon: "👥", text: "Class Community" }
            ],
            navText: "Memory Wall",
            highlightElement: "Memory Wall",
            tooltip: "👆 Click here to see what your classmates are sharing! Add your own memories, achievements, or encouraging words.",
            sound: "feature"
        },
        {
            title: "⏰ STUDY HOURS & POINTS",
            description: "Every study session adds to your total hours. More hours = more points = higher rank on the leaderboard!",
            icon: "⏰",
            impact: "📈 MOTIVATING",
            features: [
                { icon: "⏰", text: "Study Hours" },
                { icon: "⭐", text: "Points" },
                { icon: "📊", text: "Focus Score" }
            ],
            highlightSelector: ".quick-stats .stat-card:first-child, .stat-number",
            tooltip: "👆 Your total study hours update in real-time. Every minute you study counts toward your progress!",
            sound: "highlight"
        },
        {
            title: "✅ TASKS",
            description: "Manage your daily tasks. Add, complete, and organize by priority. Never forget what needs to be done!",
            icon: "✅",
            impact: "📋 ORGANIZED",
            features: [
                { icon: "➕", text: "Add Tasks" },
                { icon: "✅", text: "Mark Complete" },
                { icon: "🔴", text: "Priority Levels" }
            ],
            navText: "Tasks",
            highlightElement: "Tasks",
            tooltip: "👆 Click here to manage your tasks. Add urgent items first, then work through your list!",
            sound: "feature"
        },
        {
            title: "📚 ASSIGNMENTS",
            description: "Track all your assignments in one place. See due dates and never miss a deadline again!",
            icon: "📚",
            impact: "📅 ORGANIZED",
            features: [
                { icon: "📅", text: "Due Dates" },
                { icon: "✅", text: "Track Progress" },
                { icon: "⚠️", text: "Overdue Alerts" }
            ],
            navText: "Assignments",
            highlightElement: "Assignments",
            tooltip: "👆 Click here to see all your assignments. Mark them complete as you finish each one!",
            sound: "feature"
        },
        {
            title: "🏫 CLASSROOM",
            description: "See everything your teacher posts: announcements, resources, and polls. Stay connected with your class!",
            icon: "🏫",
            impact: "📢 CONNECTED",
            features: [
                { icon: "📢", text: "Announcements" },
                { icon: "📁", text: "Resources" },
                { icon: "🗳️", text: "Polls" }
            ],
            navText: "Classroom",
            highlightElement: "Classroom",
            tooltip: "👆 Click here to see teacher announcements, learning resources, and class polls!",
            sound: "feature"
        },
        {
            title: "🎓 MY CLASSES",
            description: "Join and manage all your classes. Each class has its own announcements, assignments, and leaderboard!",
            icon: "🎓",
            impact: "🏫 CONNECTED",
            features: [
                { icon: "➕", text: "Join Class" },
                { icon: "🔄", text: "Switch Classes" },
                { icon: "🚪", text: "Leave Class" }
            ],
            navText: "My Classes",
            highlightElement: "My Classes",
            tooltip: "👆 Click here to see all your classes. Use the class code from your teacher to join new ones!",
            sound: "feature"
        },
        {
            title: "🎴 FOCUS PERSONA",
            description: "AI analyzes your study patterns and reveals your unique learning identity! Night Owl? Deep Diver? Sprinter? Find out!",
            icon: "🎴",
            impact: "🤖 AI-POWERED",
            features: [
                { icon: "🦉", text: "Night Owl" },
                { icon: "🏊", text: "Deep Diver" },
                { icon: "⚡", text: "Sprinter" }
            ],
            navText: "FOCUS PERSONA",
            highlightElement: "FOCUS PERSONA",
            tooltip: "👆 Click here to discover your study persona! Share your card with friends and see who you are as a learner.",
            sound: "magic"
        },
        {
            title: "🛠️ STUDY TOOLS",
            description: "Access powerful tools: Pomodoro timer, flashcards, habit tracker, countdown timer, and more!",
            icon: "🛠️",
            impact: "🔧 USEFUL",
            features: [
                { icon: "🍅", text: "Pomodoro" },
                { icon: "📇", text: "Flashcards" },
                { icon: "📊", text: "Habit Tracker" }
            ],
            navText: "Study Tools",
            highlightElement: "Study Tools",
            tooltip: "👆 Click here to access all study tools! Boost your productivity.",
            sound: "feature"
        },
        {
            title: "🤖 AI HELP",
            description: "Get help from AI learning resources. ChatGPT, Gemini, Perplexity, and more at your fingertips!",
            icon: "🤖",
            impact: "🧠 SMART",
            features: [
                { icon: "💬", text: "ChatGPT" },
                { icon: "🔮", text: "Gemini" },
                { icon: "🔍", text: "Perplexity" }
            ],
            navText: "AI Help",
            highlightElement: "AI Help",
            tooltip: "👆 Click here to access AI learning resources! Get help with any subject.",
            sound: "magic"
        },
        {
            title: "📊 STATISTICS",
            description: "See your progress with beautiful charts. Track hours, focus scores, weekly patterns, and streak history!",
            icon: "📊",
            impact: "📈 INSIGHTFUL",
            features: [
                { icon: "📈", text: "Progress Charts" },
                { icon: "🔥", text: "Streak History" },
                { icon: "📅", text: "Weekly Pattern" }
            ],
            navText: "Statistics",
            highlightElement: "Statistics",
            tooltip: "👆 Click here to see your detailed stats and charts! Watch your progress over time.",
            sound: "feature"
        },
        {
            title: "📝 QUICK NOTES",
            description: "Jot down ideas, reminders, or anything important. Your notes save automatically and sync across devices!",
            icon: "📝",
            impact: "✍️ HANDY",
            features: [
                { icon: "✍️", text: "Quick Notes" },
                { icon: "💾", text: "Auto-save" },
                { icon: "📋", text: "Copy Notes" }
            ],
            highlightSelector: ".quick-notes-card, #quickNotesInput",
            tooltip: "👆 Type your thoughts here. Notes auto-save so you never lose your ideas!",
            sound: "highlight"
        },
        {
            title: "💫 DAILY INSPIRATION",
            description: "Start each day with a motivational quote from history's greatest minds. Get inspired to achieve your goals!",
            icon: "💫",
            impact: "🌟 INSPIRING",
            features: [
                { icon: "💬", text: "Daily Quote" },
                { icon: "🔄", text: "New Quote" },
                { icon: "📖", text: "Famous Authors" }
            ],
            highlightSelector: ".motivation-card, .quote-text",
            tooltip: "👆 Read today's inspiration. Click 'New Inspiration' for another quote!",
            sound: "magic"
        },
        {
            title: "👤 PROFILE",
            description: "Customize your profile, set preferences, and manage your account. Make Grindly yours!",
            icon: "👤",
            impact: "⚙️ PERSONAL",
            features: [
                { icon: "✏️", text: "Edit Profile" },
                { icon: "🎨", text: "Themes" },
                { icon: "⚙️", text: "Settings" }
            ],
            navText: "Profile",
            highlightElement: "Profile",
            tooltip: "👆 Click here to customize your profile, change themes, and manage settings!",
            sound: "feature"
        }
    ];

    // ==========================================================
    //  STATE
    // ==========================================================
    const state = {
        stepIndex: 0,
        started: false,
        finished: false,
        listenersAttached: false,
        elements: {
            overlay: null,
            tooltip: null,
            arrow: null,
            miniCard: null,
            highlight: null
        }
    };

    // ==========================================================
    //  UTILITIES
    // ==========================================================
    function escapeHTML(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function findNavItem(text) {
        if (!text) return null;
        const items = document.querySelectorAll('.nav-item');
        for (let i = 0; i < items.length; i++) {
            const el = items[i];
            if (el.textContent && el.textContent.includes(text)) return el;
        }
        return null;
    }

    function findElement(step) {
        if (step.highlightSelector) {
            try {
                const el = document.querySelector(step.highlightSelector);
                if (el) return el;
            } catch (_) { /* invalid selector – fall through */ }
        }
        if (step.navText) {
            const el = findNavItem(step.navText);
            if (el) return el;
        }
        if (step.highlightElement) {
            const el = findNavItem(step.highlightElement);
            if (el) return el;
        }
        return null;
    }

    function removeEl(key) {
        const el = state.elements[key];
        if (el && el.parentNode) el.parentNode.removeChild(el);
        state.elements[key] = null;
    }

    function clearHighlight() {
        const el = state.elements.highlight;
        if (el) el.classList.remove('tour-highlight');
        state.elements.highlight = null;
    }

    function cleanupStep() {
        removeEl('tooltip');
        removeEl('arrow');
        removeEl('miniCard');
        removeEl('overlay');
        clearHighlight();
    }

    function cleanupAll() {
        cleanupStep();
        clearAllSparkles();
    }

    // ==========================================================
    //  SCROLLING
    // ==========================================================
    function scrollElementIntoView(el) {
        if (!el) return;
        const behavior = prefersReducedMotion ? 'auto' : 'smooth';

        if (el.closest('.sidebar')) {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;
            const elRect = el.getBoundingClientRect();
            const sRect = sidebar.getBoundingClientRect();
            const target = sidebar.scrollTop + (elRect.top - sRect.top) - 100;
            sidebar.scrollTo({ top: Math.max(0, target), behavior: behavior });
        } else {
            const rect = el.getBoundingClientRect();
            const target = window.pageYOffset + rect.top - 100;
            window.scrollTo({ top: Math.max(0, target), behavior: behavior });
        }
    }

    // ==========================================================
    //  TOOLTIP POSITIONING
    // ==========================================================
    function positionTooltip(tooltip, anchorEl) {
        if (!tooltip || !anchorEl || !anchorEl.isConnected) return;

        const anchor = anchorEl.getBoundingClientRect();
        const tip = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const gap = CONFIG.tooltipGap;

        let placement = 'bottom';
        let top = anchor.bottom + gap;
        if (top + tip.height > vh - 20) {
            placement = 'top';
            top = anchor.top - tip.height - gap;
        }

        let left = anchor.left + anchor.width / 2 - tip.width / 2;
        if (left < 12) left = 12;
        if (left + tip.width > vw - 12) left = vw - tip.width - 12;

        tooltip.className = 'tour-tooltip ' + placement;
        tooltip.style.left = left + 'px';
        tooltip.style.top  = top + 'px';

        // Arrow
        removeEl('arrow');
        const arrow = document.createElement('div');
        arrow.className = 'tour-arrow';
        arrow.style.left = (anchor.left + anchor.width / 2 - 15) + 'px';
        if (placement === 'bottom') {
            arrow.style.top = (anchor.bottom - 5) + 'px';
        } else {
            arrow.style.top = (anchor.top - 15) + 'px';
            arrow.style.transform = 'rotate(180deg)';
        }
        document.body.appendChild(arrow);
        state.elements.arrow = arrow;

        setTimeout(function () {
            if (state.elements.arrow === arrow) {
                removeEl('arrow');
            }
        }, CONFIG.arrowLifetimeMs);
    }

    // ==========================================================
    //  CARD BUILDERS
    // ==========================================================
    function buildProgressDots() {
        return TOUR_STEPS.map(function (_, i) {
            const active = i === state.stepIndex ? ' active' : '';
            return '<div class="tour-dot' + active + '" data-tour-dot="' + i + '" ' +
                   'title="Step ' + (i + 1) + '"></div>';
        }).join('');
    }

    function buildFeaturesHTML(step) {
        return step.features.map(function (f) {
            return '<div class="tour-feature">' +
                   '<div class="tour-feature-icon">' + f.icon + '</div>' +
                   '<div class="tour-feature-text">' + escapeHTML(f.text) + '</div>' +
                   '</div>';
        }).join('');
    }

    function buildButtonsHTML(isLast) {
        const backBtn = state.stepIndex > 0
            ? '<button class="tour-btn tour-btn-secondary" data-tour-action="prev" style="padding:8px 14px;">← Back</button>'
            : '<button class="tour-btn tour-btn-secondary" data-tour-action="skip" style="padding:8px 14px;">Skip</button>';
        const nextLabel = isLast ? 'Finish ✓' : 'Next →';
        const nextBtn = '<button class="tour-btn tour-btn-primary" data-tour-action="next" style="padding:8px 16px;">' +
                        nextLabel + '</button>';
        return backBtn + nextBtn;
    }

    function buildMiniCard(step) {
        const isLast = state.stepIndex === TOUR_STEPS.length - 1;
        const card = document.createElement('div');
        card.className = 'tour-card';
        card.style.cssText = 'position: fixed; bottom: 20px; right: 20px; ' +
            'max-width: 340px; padding: 20px; margin: 0; z-index: 10001;';
        card.innerHTML =
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
                '<div style="font-size:40px;line-height:1;">' + step.icon + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                    '<div style="font-weight:800;font-size:17px;line-height:1.2;">' + escapeHTML(step.title) + '</div>' +
                    '<div class="tour-impact" style="font-size:11px;margin-top:2px;">' + escapeHTML(step.impact) + '</div>' +
                '</div>' +
                '<div style="font-size:11px;color:var(--text-muted);font-weight:600;white-space:nowrap;">' +
                    (state.stepIndex + 1) + '/' + TOUR_STEPS.length +
                '</div>' +
            '</div>' +
            '<div style="font-size:13px;color:var(--text-muted);margin-bottom:14px;line-height:1.5;">' +
                escapeHTML(step.description) +
            '</div>' +
            '<div class="tour-features" style="padding:10px;margin-bottom:14px;">' +
                buildFeaturesHTML(step) +
            '</div>' +
            '<div class="tour-progress" style="margin-bottom:12px;">' + buildProgressDots() + '</div>' +
            '<div class="tour-buttons">' + buildButtonsHTML(isLast) + '</div>';
        return card;
    }

    function buildOverlayCard(step) {
        const isLast = state.stepIndex === TOUR_STEPS.length - 1;
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.innerHTML =
            '<div class="tour-card">' +
                '<div class="tour-icon">' + step.icon + '</div>' +
                '<div class="tour-title">' + escapeHTML(step.title) + '</div>' +
                '<div class="tour-impact">' + escapeHTML(step.impact) + '</div>' +
                '<div class="tour-description">' + escapeHTML(step.description) + '</div>' +
                '<div class="tour-features">' + buildFeaturesHTML(step) + '</div>' +
                '<div class="tour-progress">' + buildProgressDots() + '</div>' +
                '<div class="tour-buttons">' + buildButtonsHTML(isLast) + '</div>' +
            '</div>';
        return overlay;
    }

    // ==========================================================
    //  STEP DISPLAY
    // ==========================================================
    function showStep(index) {
        if (state.finished) return;
        if (index < 0 || index >= TOUR_STEPS.length) return;

        state.stepIndex = index;
        cleanupStep();

        const step = TOUR_STEPS[index];
        playSound(step.sound || 'click');

        const anchorEl = findElement(step);

        if (anchorEl) {
            anchorEl.classList.add('tour-highlight');
            state.elements.highlight = anchorEl;

            scrollElementIntoView(anchorEl);

            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tour-tooltip bottom';
            const title = (step.tooltip || '').split('.')[0];
            tooltip.innerHTML =
                '<div class="tour-tooltip-title">✨ ' + escapeHTML(title) + '</div>' +
                '<div class="tour-tooltip-text">' + escapeHTML(step.tooltip || '') + '</div>';
            document.body.appendChild(tooltip);
            state.elements.tooltip = tooltip;

            // Position after layout (two rAFs for safety on Safari)
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    if (state.elements.tooltip === tooltip && anchorEl.isConnected) {
                        positionTooltip(tooltip, anchorEl);
                    }
                });
            });

            // Sparkles
            setTimeout(function () {
                if (anchorEl.isConnected) {
                    const r = anchorEl.getBoundingClientRect();
                    spawnSparkles(r.left + r.width / 2, r.top + r.height / 2, 8);
                }
            }, 400);

            // Mini card
            const mini = buildMiniCard(step);
            document.body.appendChild(mini);
            state.elements.miniCard = mini;

        } else {
            // Fallback — full-screen overlay
            const overlay = buildOverlayCard(step);
            document.body.appendChild(overlay);
            state.elements.overlay = overlay;
        }
    }

    // ==========================================================
    //  NAVIGATION
    // ==========================================================
    function next() {
        if (state.finished) return;
        if (state.stepIndex < TOUR_STEPS.length - 1) {
            showStep(state.stepIndex + 1);
        } else {
            complete();
        }
    }

    function prev() {
        if (state.finished) return;
        if (state.stepIndex > 0) {
            showStep(state.stepIndex - 1);
        }
    }

    function goTo(i) {
        if (state.finished) return;
        const idx = parseInt(i, 10);
        if (!isNaN(idx) && idx >= 0 && idx < TOUR_STEPS.length) {
            showStep(idx);
        }
    }

    function skip() {
        if (state.finished) return;
        const ok = window.confirm('Skip the tour? You can always explore the features on your own.');
        if (ok) complete();
    }

    // ==========================================================
    //  COMPLETION
    // ==========================================================
    function complete() {
        state.finished = true;
        cleanupAll();
        detachGlobalListeners();

        try { localStorage.setItem(CONFIG.storageKey, 'true'); } catch (_) {}

        playSound('complete');

        const celebration = document.createElement('div');
        celebration.className = 'tour-overlay';
        celebration.style.background = 'rgba(0,0,0,0.95)';
        celebration.innerHTML =
            '<div class="tour-card">' +
                '<div class="tour-icon" style="font-size:80px;">🏆</div>' +
                '<div class="tour-title" style="font-size:32px;">You\'re Ready to Grind!</div>' +
                '<div class="tour-description" style="font-size:16px;margin-bottom:20px;">' +
                    'You\'ve mastered all ' + TOUR_STEPS.length + ' features. Now go start your journey!' +
                '</div>' +
                '<div style="margin:20px 0;">' +
                    '<div class="tour-features" style="background:var(--accent-light);">' +
                        '<div class="tour-feature"><div class="tour-feature-icon">🔥</div><div class="tour-feature-text">Start Your Streak</div></div>' +
                        '<div class="tour-feature"><div class="tour-feature-icon">🎨</div><div class="tour-feature-text">Join Whiteboard</div></div>' +
                        '<div class="tour-feature"><div class="tour-feature-icon">👥</div><div class="tour-feature-text">Study Groups</div></div>' +
                    '</div>' +
                '</div>' +
                '<button class="tour-btn tour-btn-primary" data-tour-close ' +
                        'style="padding:14px 32px;font-size:18px;">🚀 Let\'s Go!</button>' +
            '</div>';
        document.body.appendChild(celebration);

        const closeBtn = celebration.querySelector('[data-tour-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () { celebration.remove(); });
        }

        // Sparkle cascade
        for (let i = 0; i < 40; i++) {
            (function (i) {
                setTimeout(function () {
                    spawnSparkles(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        1
                    );
                }, i * 40);
            })(i);
        }

        // Auto-dismiss celebration
        setTimeout(function () {
            if (document.body.contains(celebration)) celebration.remove();
        }, CONFIG.celebrationAutoCloseMs);
    }

    // ==========================================================
    //  GLOBAL LISTENERS (delegated — no inline handlers)
    // ==========================================================
    function onDocumentClick(e) {
        const actionEl = e.target.closest('[data-tour-action]');
        if (actionEl) {
            e.preventDefault();
            const action = actionEl.getAttribute('data-tour-action');
            if (action === 'next') { next(); return; }
            if (action === 'prev') { prev(); return; }
            if (action === 'skip') { skip(); return; }
        }
        const dotEl = e.target.closest('[data-tour-dot]');
        if (dotEl) {
            e.preventDefault();
            goTo(dotEl.getAttribute('data-tour-dot'));
        }
    }

    function onKeyDown(e) {
        if (state.finished) return;
        if (e.key === 'Escape')      { skip(); }
        else if (e.key === 'ArrowRight') { next(); }
        else if (e.key === 'ArrowLeft')  { prev(); }
    }

    let resizeRaf = null;
    function onResize() {
        if (resizeRaf) return;
        resizeRaf = requestAnimationFrame(function () {
            resizeRaf = null;
            const anchor = state.elements.highlight;
            const tip = state.elements.tooltip;
            if (anchor && tip && anchor.isConnected && tip.isConnected) {
                positionTooltip(tip, anchor);
            }
        });
    }

    function attachGlobalListeners() {
        if (state.listenersAttached) return;
        state.listenersAttached = true;
        document.addEventListener('click', onDocumentClick, true);
        document.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onResize);
    }

    function detachGlobalListeners() {
        if (!state.listenersAttached) return;
        state.listenersAttached = false;
        document.removeEventListener('click', onDocumentClick, true);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
    }

    // ==========================================================
    //  BOOT  — wait for the sidebar to be ready, then start
    // ==========================================================
    function isReady() {
        if (document.querySelector('.sidebar-section')) return true;
        if (document.querySelectorAll('.nav-item').length >= CONFIG.readyNavThreshold) return true;
        return false;
    }

    function boot() {
        if (state.started || state.finished) return;
        state.started = true;
        attachGlobalListeners();

        const startedAt = Date.now();
        (function poll() {
            if (state.finished) return;
            const elapsed = Date.now() - startedAt;

            if (isReady() || elapsed >= CONFIG.maxWaitForReadyMs) {
                setTimeout(function () {
                    if (!state.finished) showStep(0);
                }, CONFIG.startDelay);
                return;
            }
            setTimeout(poll, CONFIG.readyPollMs);
        })();
    }

    // ==========================================================
    //  PUBLIC API
    // ==========================================================
    window.grindlyTour = {
        start: function () {
            state.finished = false;
            try { localStorage.removeItem(CONFIG.storageKey); } catch (_) {}
            if (!state.started) boot();
            else { attachGlobalListeners(); showStep(0); }
        },
        next: next,
        prev: prev,
        goTo: goTo,
        skip: skip,
        reset: function () {
            try { localStorage.removeItem(CONFIG.storageKey); } catch (_) {}
            console.log('🎓 Tour reset. Reload to auto-start, or call grindlyTour.start().');
        }
    };

    // Backward-compat aliases so existing HTML onclick handlers still work
    window.nextTourStep = next;
    window.goToStep     = goTo;
    window.skipTour     = skip;
    window.startTour    = window.grindlyTour.start;

    // ==========================================================
    //  KICK OFF
    // ==========================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    console.log('🎓 ULTIMATE tour ready! ' + TOUR_STEPS.length + ' features.');
})();