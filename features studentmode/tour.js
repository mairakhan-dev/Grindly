// ========== GRINDLY LEARN ULTIMATE TOUR (FULL SIDEBAR + ALL FEATURES) ==========
(function() {
    'use strict';
    
    const TOUR_COMPLETED_KEY = 'grindly_tour_completed_v5';
    
    if (localStorage.getItem(TOUR_COMPLETED_KEY) === 'true') {
        console.log('🎓 Tour already completed');
        return;
    }
    
    console.log('🎓 Starting ULTIMATE tour with ALL features and sidebar scrolling...');
    
    // ========== SOUND EFFECTS SYSTEM ==========
    const tourSounds = {
        click: () => playSound(523.25, 0.2),
        complete: () => playSound(659.25, 0.3, [523.25, 659.25, 783.99, 1046.5]),
        feature: () => playSound(440, 0.25),
        highlight: () => playSound(880, 0.15),
        success: () => playSound(523.25, 0.2, [523.25, 659.25]),
        magic: () => playSound(783.99, 0.3, [523.25, 659.25, 783.99]),
        group: () => playSound(523.25, 0.25, [523.25, 659.25])
    };
    
    function playSound(freq, duration = 0.2, harmonics = null) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const master = ctx.createGain();
            master.gain.setValueAtTime(0.15, now);
            master.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.1);
            master.connect(ctx.destination);
            
            if (harmonics) {
                harmonics.forEach((f, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = f;
                    gain.gain.setValueAtTime(0.2 / (i + 1), now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                    osc.connect(gain);
                    gain.connect(master);
                    osc.start(now);
                    osc.stop(now + duration);
                });
            } else {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                osc.connect(gain);
                gain.connect(master);
                osc.start(now);
                osc.stop(now + duration);
            }
            
            setTimeout(() => ctx.close(), duration * 1000 + 100);
        } catch(e) { console.log('Sound error:', e); }
    }
    
    function createSparkle(x, y) {
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'tour-sparkle';
            sparkle.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
            sparkle.style.top = (y + (Math.random() - 0.5) * 30) + 'px';
            sparkle.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }
    }
    
    // ========== ALL FEATURES (FULL LIST) ==========
    const tourSteps = [
        // 1. LIVE WHITEBOARD
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
            tooltip: "👆 Click here to join live sessions! Enter your teacher's 6-digit code and start drawing with your whole class.",
            type: "nav",
            highlightElement: "Join Whiteboard",
            sound: "feature"
        },
        
        // 2. STUDY GROUPS
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
            tooltip: "👆 Click here to join or create study groups! Learning with friends is more effective and fun!",
            type: "nav",
            highlightElement: "Study Group",
            sound: "group"
        },
        
        // 3. STUDY STREAK
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
            type: "highlight",
            sound: "highlight"
        },
        
        // 4. MEMORY WALL
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
            tooltip: "👆 Click here to see what your classmates are sharing! Add your own memories, achievements, or encouraging words.",
            type: "nav",
            highlightElement: "Memory Wall",
            sound: "feature"
        },
        
        // 5. STUDY HOURS & POINTS
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
            type: "highlight",
            sound: "highlight"
        },
        
        // 6. TASKS
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
            tooltip: "👆 Click here to manage your tasks. Add urgent items first, then work through your list!",
            type: "nav",
            highlightElement: "Tasks",
            sound: "feature"
        },
        
        // 7. ASSIGNMENTS
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
            tooltip: "👆 Click here to see all your assignments. Mark them complete as you finish each one!",
            type: "nav",
            highlightElement: "Assignments",
            sound: "feature"
        },
        
        // 8. CLASSROOM (Announcements, Resources, Polls)
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
            tooltip: "👆 Click here to see teacher announcements, learning resources, and class polls!",
            type: "nav",
            highlightElement: "Classroom",
            sound: "feature"
        },
        
        // 9. MY CLASSES
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
            tooltip: "👆 Click here to see all your classes. Use the class code from your teacher to join new ones!",
            type: "nav",
            highlightElement: "My Classes",
            sound: "feature"
        },
        
        // 10. FOCUS PERSONA
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
            tooltip: "👆 Click here to discover your study persona! Share your card with friends and see who you are as a learner.",
            type: "nav",
            highlightElement: "FOCUS PERSONA",
            sound: "magic"
        },
        
        // 11. STUDY TOOLS
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
            tooltip: "👆 Click here to access all study tools! Boost your productivity.",
            type: "nav",
            highlightElement: "Study Tools",
            sound: "feature"
        },
        
        // 12. AI HELP
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
            tooltip: "👆 Click here to access AI learning resources! Get help with any subject.",
            type: "nav",
            highlightElement: "AI Help",
            sound: "magic"
        },
        
        // 13. STATISTICS
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
            tooltip: "👆 Click here to see your detailed stats and charts! Watch your progress over time.",
            type: "nav",
            highlightElement: "Statistics",
            sound: "feature"
        },
        
        // 14. QUICK NOTES
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
            type: "highlight",
            sound: "highlight"
        },
        
        // 15. DAILY INSPIRATION
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
            type: "highlight",
            sound: "magic"
        },
        
        // 16. PROFILE
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
            tooltip: "👆 Click here to customize your profile, change themes, and manage settings!",
            type: "nav",
            highlightElement: "Profile",
            sound: "feature"
        }
    ];
    
    let currentStep = 0;
    let currentOverlay = null;
    let currentTooltip = null;
    let currentMiniCard = null;
    let currentArrow = null;
    
    function findNavItem(text) {
        const navItems = document.querySelectorAll('.nav-item');
        for (let item of navItems) {
            if (item.textContent.includes(text)) {
                return item;
            }
        }
        return null;
    }
    
    function findElement(step) {
        if (step.highlightSelector) {
            const el = document.querySelector(step.highlightSelector);
            if (el) return el;
        }
        if (step.navText) {
            const navItem = findNavItem(step.navText);
            if (navItem) return navItem;
        }
        if (step.highlightElement) {
            const navItem = findNavItem(step.highlightElement);
            if (navItem) return navItem;
        }
        return null;
    }
    
    function cleanupTour() {
        if (currentOverlay && currentOverlay.remove) currentOverlay.remove();
        if (currentTooltip && currentTooltip.remove) currentTooltip.remove();
        if (currentMiniCard && currentMiniCard.remove) currentMiniCard.remove();
        if (currentArrow && currentArrow.remove) currentArrow.remove();
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        currentOverlay = null;
        currentTooltip = null;
        currentMiniCard = null;
        currentArrow = null;
    }
    
    function scrollSidebarToElement(element) {
        if (!element) return;
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const elementRect = element.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        const scrollTop = sidebar.scrollTop + (elementRect.top - sidebarRect.top) - 100;
        
        sidebar.classList.add('tour-sidebar-scroll');
        sidebar.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
        setTimeout(() => sidebar.classList.remove('tour-sidebar-scroll'), 500);
    }
    
    function showTooltip(element, text) {
        if (currentTooltip) currentTooltip.remove();
        if (currentArrow) currentArrow.remove();
        
        const rect = element.getBoundingClientRect();
        currentTooltip = document.createElement('div');
        currentTooltip.className = 'tour-tooltip bottom';
        currentTooltip.innerHTML = `
            <div class="tour-tooltip-title">✨ ${text.split('.')[0]}</div>
            <div class="tour-tooltip-text">${text}</div>
        `;
        document.body.appendChild(currentTooltip);
        
        const tooltipRect = currentTooltip.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 15;
        
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 20) {
            top = rect.top - tooltipRect.height - 15;
            currentTooltip.classList.remove('bottom');
            currentTooltip.classList.add('top');
        }
        
        currentTooltip.style.left = `${left}px`;
        currentTooltip.style.top = `${top}px`;
        
        currentArrow = document.createElement('div');
        currentArrow.className = 'tour-arrow';
        currentArrow.style.left = `${rect.left + rect.width/2 - 15}px`;
        currentArrow.style.top = `${rect.bottom - 5}px`;
        document.body.appendChild(currentArrow);
        
        createSparkle(rect.left + rect.width/2, rect.top + rect.height/2);
        
        setTimeout(() => {
            if (currentArrow) currentArrow.remove();
        }, 2500);
    }
    
    function scrollToElement(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - 100;
        window.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
    }
    
    function showStep(stepIndex) {
        cleanupTour();
        
        const step = tourSteps[stepIndex];
        const element = findElement(step);
        
        if (step.sound && tourSounds[step.sound]) {
            tourSounds[step.sound]();
        } else {
            tourSounds.click();
        }
        
        if (element) {
            element.classList.add('tour-highlight');
            
            // Scroll sidebar if element is in sidebar
            if (element.closest('.sidebar')) {
                scrollSidebarToElement(element);
            } else {
                scrollToElement(element);
            }
            
            setTimeout(() => {
                showTooltip(element, step.tooltip);
            }, 500);
            
            currentMiniCard = document.createElement('div');
            currentMiniCard.className = 'tour-card';
            currentMiniCard.style.position = 'fixed';
            currentMiniCard.style.bottom = '20px';
            currentMiniCard.style.right = '20px';
            currentMiniCard.style.maxWidth = '320px';
            currentMiniCard.style.padding = '20px';
            currentMiniCard.style.margin = '0';
            currentMiniCard.style.zIndex = '10001';
            currentMiniCard.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 40px; animation: tourIconBounce 0.3s ease;">${step.icon}</div>
                    <div>
                        <div style="font-weight: 800; font-size: 18px;">${step.title}</div>
                        <div class="tour-impact">${step.impact}</div>
                    </div>
                </div>
                <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.5;">${step.description}</div>
                <div class="tour-features" style="padding: 12px; margin-bottom: 16px;">
                    ${step.features.map(f => `
                        <div class="tour-feature" onmouseenter="this.querySelector('.tour-feature-icon').style.animation='tourFeatureBounce 0.3s ease'">
                            <div class="tour-feature-icon">${f.icon}</div>
                            <div class="tour-feature-text">${f.text}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="tour-progress" style="margin-bottom: 12px;">
                    ${tourSteps.map((_, idx) => `<div class="tour-dot ${idx === currentStep ? 'active' : ''}" onclick="window.goToStep(${idx})"></div>`).join('')}
                </div>
                <div class="tour-buttons">
                    <button class="tour-btn tour-btn-secondary" onclick="window.skipTour()" style="padding: 8px 16px;">Skip</button>
                    <button class="tour-btn tour-btn-primary" onclick="window.nextTourStep()" style="padding: 8px 16px;">Next →</button>
                </div>
            `;
            document.body.appendChild(currentMiniCard);
        } else {
            currentOverlay = document.createElement('div');
            currentOverlay.className = 'tour-overlay';
            currentOverlay.innerHTML = `
                <div class="tour-card">
                    <div class="tour-icon">${step.icon}</div>
                    <div class="tour-title">${step.title}</div>
                    <div class="tour-impact">${step.impact}</div>
                    <div class="tour-description">${step.description}</div>
                    <div class="tour-features">
                        ${step.features.map(f => `
                            <div class="tour-feature">
                                <div class="tour-feature-icon">${f.icon}</div>
                                <div class="tour-feature-text">${f.text}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="tour-progress">
                        ${tourSteps.map((_, idx) => `<div class="tour-dot ${idx === currentStep ? 'active' : ''}" onclick="window.goToStep(${idx})"></div>`).join('')}
                    </div>
                    <div class="tour-buttons">
                        <button class="tour-btn tour-btn-secondary" onclick="window.skipTour()">Skip</button>
                        <button class="tour-btn tour-btn-primary" onclick="window.nextTourStep()">Next →</button>
                    </div>
                </div>
            `;
            document.body.appendChild(currentOverlay);
        }
    }
    
    window.nextTourStep = function() {
        if (currentStep < tourSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            completeTour();
        }
    };
    
    window.goToStep = function(step) {
        currentStep = step;
        showStep(currentStep);
    };
    
    window.skipTour = function() {
        if (confirm("Skip the tour? You can always come back to explore later!")) {
            completeTour();
        }
    };
    
    function completeTour() {
        cleanupTour();
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        tourSounds.complete();
        
        const celebration = document.createElement('div');
        celebration.className = 'tour-overlay';
        celebration.style.background = 'rgba(0,0,0,0.95)';
        celebration.innerHTML = `
            <div class="tour-card">
                <div class="tour-icon" style="font-size: 80px; animation: tourIconBounce 0.5s ease;">🏆</div>
                <div class="tour-title" style="font-size: 32px;">You're Ready to Grind!</div>
                <div class="tour-description" style="font-size: 18px; margin-bottom: 20px;">You've mastered all ${tourSteps.length} features. Now go start your journey!</div>
                <div style="margin: 20px 0;">
                    <div class="tour-features" style="background: var(--accent-light);">
                        <div class="tour-feature">
                            <div class="tour-feature-icon">🔥</div>
                            <div class="tour-feature-text">Start Your Streak</div>
                        </div>
                        <div class="tour-feature">
                            <div class="tour-feature-icon">🎨</div>
                            <div class="tour-feature-text">Join Whiteboard</div>
                        </div>
                        <div class="tour-feature">
                            <div class="tour-feature-icon">👥</div>
                            <div class="tour-feature-text">Study Groups</div>
                        </div>
                    </div>
                </div>
                <button class="tour-btn tour-btn-primary" onclick="this.closest('.tour-overlay').remove()" style="padding: 14px 32px; font-size: 18px;">🚀 Let's Go!</button>
            </div>
        `;
        document.body.appendChild(celebration);
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                createSparkle(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            }, i * 50);
        }
        
        setTimeout(() => {
            if (document.body.contains(celebration)) {
                const btn = celebration.querySelector('button');
                if (btn) btn.click();
            }
        }, 5000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => showStep(0), 1500);
        });
    } else {
        setTimeout(() => showStep(0), 1500);
    }
    
    console.log(`🎓 ULTIMATE tour ready! ${tourSteps.length} features with sidebar scrolling!`);
})();
