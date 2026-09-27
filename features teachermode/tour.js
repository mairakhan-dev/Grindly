
// ========== GRINDLY LEARN TEACHER MODE TOUR (FIXED) ==========
(function() {
    'use strict';
    
    const TOUR_COMPLETED_KEY = 'grindly_teacher_tour_completed_v2';
    
    // Check if tour has been seen before
    if (localStorage.getItem(TOUR_COMPLETED_KEY) === 'true') {
        console.log('🎓 Teacher tour already completed');
        return;
    }
    
    console.log('🎓 Starting teacher mode tour...');
    
    // ========== SOUND EFFECTS SYSTEM ==========
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
    
    // ========== TEACHER MODE FEATURES ==========
    const tourSteps = [
        // 1. Dashboard Welcome
        {
            title: "👩‍🏫 Welcome, Teacher!",
            description: "Grindly Learn gives you complete control over your classroom. Let's explore the tools that make teaching effortless.",
            icon: "🚀",
            impact: "REVOLUTIONARY",
            features: [
                { icon: "📊", text: "Live Analytics" },
                { icon: "🎨", text: "Whiteboard" },
                { icon: "👥", text: "Student Tracking" }
            ],
            type: "welcome"
        },
        
        // 2. Class Code
        {
            title: "🔑 Class Code",
            description: "This is your classroom's unique key. Share this 6-digit code with students to let them join.",
            icon: "🔑",
            impact: "ESSENTIAL",
            features: [
                { icon: "📋", text: "Copy Code" },
                { icon: "👥", text: "Students Join" },
                { icon: "🚪", text: "Manage Classes" }
            ],
            highlightSelector: ".code, .class-code-display .code",
            tooltip: "👆 Share this code with your students. They use it to join your class!",
            type: "highlight"
        },
        
        // 3. Quick Stats
        {
            title: "📊 Quick Stats",
            description: "At-a-glance view of your classroom health. See total students, announcements, assignments, and average streak.",
            icon: "📊",
            impact: "INSTANT INSIGHT",
            features: [
                { icon: "👥", text: "Total Students" },
                { icon: "📢", text: "Announcements" },
                { icon: "🔥", text: "Avg Streak" }
            ],
            highlightSelector: ".quick-stats, .stat-card",
            tooltip: "👆 Monitor your class health at a glance. Watch for engagement drops!",
            type: "highlight"
        },
        
        // 4. Teacher Toolkit
        {
            title: "🛠️ Teacher Toolkit",
            description: "Powerful tools to manage your classroom: Random Student Picker, Group Generator, Attendance, and more!",
            icon: "🛠️",
            impact: "ESSENTIAL",
            features: [
                { icon: "🎯", text: "Random Picker" },
                { icon: "🤝", text: "Group Generator" },
                { icon: "✅", text: "Attendance" }
            ],
            highlightSelector: ".content-card:has(h2)",
            tooltip: "👆 Click here to access all your teaching tools! Pick random students, create groups, and more.",
            type: "highlight"
        },
        
        // 5. Announcements
        {
            title: "📢 Announcements",
            description: "Post important updates, reminders, and class news. Students see them instantly on their dashboards.",
            icon: "📢",
            impact: "COMMUNICATION",
            features: [
                { icon: "✏️", text: "Create Posts" },
                { icon: "⚡", text: "Real-time" },
                { icon: "📌", text: "Pin Important" }
            ],
            navText: "Announcements",
            tooltip: "👆 Click here to post announcements. Students get them instantly!",
            type: "nav"
        },
        
        // 6. Assignments
        {
            title: "📚 Assignments",
            description: "Create, manage, and track assignments. Set due dates and descriptions. Students can mark completion.",
            icon: "📚",
            impact: "ORGANIZED",
            features: [
                { icon: "➕", text: "Create" },
                { icon: "📅", text: "Due Dates" },
                { icon: "✅", text: "Track Progress" }
            ],
            navText: "Assignments",
            tooltip: "👆 Click here to create and manage assignments. Never miss a deadline!",
            type: "nav"
        },
        
        // 7. Memory Wall
        {
            title: "📝 Memory Wall",
            description: "A collaborative digital bulletin board. Students share achievements, encouragement, and memories.",
            icon: "📝",
            impact: "COMMUNITY",
            features: [
                { icon: "📌", text: "Sticky Notes" },
                { icon: "❤️", text: "Likes" },
                { icon: "👥", text: "Class Community" }
            ],
            navText: "Memory Wall",
            tooltip: "👆 Click here to see what students are sharing. Add your own encouraging notes!",
            type: "nav"
        },
        
        // 8. Live Whiteboard
        {
            title: "🎨 Live Whiteboard",
            description: "Start a live whiteboard session. Students join with a 6-digit code and draw together in real-time!",
            icon: "🎨",
            impact: "COLLABORATIVE",
            features: [
                { icon: "✏️", text: "Draw Together" },
                { icon: "🔑", text: "6-Digit Code" },
                { icon: "⚡", text: "Real-time Sync" }
            ],
            navText: "Start Whiteboard",
            tooltip: "👆 Click here to start a live whiteboard session. Share the code and everyone draws together!",
            type: "nav"
        },
        
        // 9. Students
        {
            title: "👥 Student Management",
            description: "View all students, their streaks, study hours, and points. See who needs encouragement!",
            icon: "👥",
            impact: "TRACKING",
            features: [
                { icon: "🔥", text: "Streaks" },
                { icon: "⏰", text: "Study Hours" },
                { icon: "⭐", text: "Points" }
            ],
            navText: "Students",
            tooltip: "👆 Click here to see all your students and their progress. Identify who needs support!",
            type: "nav"
        },
        
        // 10. Analytics
        {
            title: "📈 Class Analytics",
            description: "Deep insights into classroom engagement. Track daily active students, study hours, and top performers.",
            icon: "📈",
            impact: "DATA-DRIVEN",
            features: [
                { icon: "📊", text: "Charts" },
                { icon: "🔥", text: "Heatmap" },
                { icon: "🏆", text: "Top Performers" }
            ],
            navText: "Analytics",
            tooltip: "👆 Click here to see detailed analytics. Export data for reports!",
            type: "nav"
        },
        
        // 11. Quick Check-ins
        {
            title: "😊 Quick Check-ins",
            description: "Start live emotional check-ins. Students anonymously share how they're feeling in real-time.",
            icon: "😊",
            impact: "WELLNESS",
            features: [
                { icon: "😊", text: "Confident" },
                { icon: "😐", text: "Okay" },
                { icon: "😕", text: "Struggling" }
            ],
            navText: "Quick Check-ins",
            tooltip: "👆 Click here to start a live check-in. Understand how your students are feeling!",
            type: "nav"
        },
        
        // 12. Class Challenges
        {
            title: "⚔️ Class Challenges",
            description: "Challenge other teachers' classes! Compete on study hours or streaks. Friendly competition boosts engagement!",
            icon: "⚔️",
            impact: "MOTIVATING",
            features: [
                { icon: "⏱️", text: "Study Hours" },
                { icon: "🔥", text: "Streaks" },
                { icon: "🏆", text: "Win!" }
            ],
            navText: "Class Challenges",
            tooltip: "👆 Click here to create or accept challenges. Watch your class compete and win!",
            type: "nav"
        },
        
        // 13. Streak Chain
        {
            title: "🔥 Class Streak Chain",
            description: "Every student's streak adds a link to the chain. Watch your class build unstoppable momentum!",
            icon: "🔥",
            impact: "MOMENTUM",
            features: [
                { icon: "🔗", text: "Chain Links" },
                { icon: "🎯", text: "Milestones" },
                { icon: "🎉", text: "Celebrations" }
            ],
            highlightSelector: ".streak-chain-container",
            tooltip: "👆 Each link represents student streaks. More links = more momentum! Celebrate milestones together.",
            type: "highlight"
        },
        
        // 14. Sidebar Tools
        {
            title: "⚡ Quick Classroom Tools",
            description: "Focus Bell, Lightning Plan, Exit Tickets - tools to manage your classroom in seconds.",
            icon: "⚡",
            impact: "FAST",
            features: [
                { icon: "🔔", text: "Focus Bell" },
                { icon: "⚡", text: "Lightning Plan" },
                { icon: "🎫", text: "Exit Tickets" }
            ],
            highlightSelector: ".sidebar-stats",
            tooltip: "👆 Use these tools for instant classroom management. Ring the focus bell, create lightning plans!",
            type: "highlight"
        },
        
        // 15. Themes
        {
            title: "🎨 Themes",
            description: "Customize your dashboard! Unlock special themes by hitting class milestones.",
            icon: "🎨",
            impact: "PERSONAL",
            features: [
                { icon: "🌙", text: "Dark" },
                { icon: "🌊", text: "Ocean" },
                { icon: "✨", text: "Aurora" }
            ],
            highlightSelector: ".theme-selector",
            tooltip: "👆 Change your dashboard theme here. Unlock special themes by winning challenges and building streaks!",
            type: "highlight"
        },
        
        // 16. Completion
        {
            title: "🏆 You're Ready to Teach!",
            description: "You've mastered all the features. Start your first class and watch your students grow!",
            icon: "🏆",
            impact: "READY",
            features: [
                { icon: "🎨", text: "Start Whiteboard" },
                { icon: "📢", text: "Post Announcements" },
                { icon: "🔥", text: "Build Streaks" }
            ],
            type: "complete"
        }
    ];
    
    let currentStep = 0;
    let currentOverlay = null;
    let currentTooltip = null;
    let currentMiniCard = null;
    let currentArrow = null;
    
    function findElement(step) {
        // Try by highlight selector
        if (step.highlightSelector) {
            try {
                const el = document.querySelector(step.highlightSelector);
                if (el) return el;
            } catch(e) {}
        }
        
        // Try by nav text
        if (step.navText) {
            const navItems = document.querySelectorAll('.nav-item');
            for (let item of navItems) {
                if (item.textContent && item.textContent.includes(step.navText)) {
                    return item;
                }
            }
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
        
        // Play click sound
        playSound(523.25, 0.2);
        
        const element = findElement(step);
        
        if (element && (step.type === 'highlight' || step.type === 'nav')) {
            element.classList.add('tour-highlight');
            scrollToElement(element);
            
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
                        <div class="tour-feature">
                            <div class="tour-feature-icon">${f.icon}</div>
                            <div class="tour-feature-text">${f.text}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="tour-progress" style="margin-bottom: 12px;">
                    ${tourSteps.map((_, idx) => `<div class="tour-dot ${idx === currentStep ? 'active' : ''}" onclick="window.goToTeacherTourStep(${idx})"></div>`).join('')}
                </div>
                <div class="tour-buttons">
                    <button class="tour-btn tour-btn-secondary" onclick="window.skipTeacherTour()" style="padding: 8px 16px;">Skip</button>
                    <button class="tour-btn tour-btn-primary" onclick="window.nextTeacherTourStep()" style="padding: 8px 16px;">Next →</button>
                </div>
            `;
            document.body.appendChild(currentMiniCard);
        } else {
            // Full screen card for welcome and complete
            const featuresHtml = `
                <div class="tour-features">
                    ${step.features.map(f => `
                        <div class="tour-feature">
                            <div class="tour-feature-icon">${f.icon}</div>
                            <div class="tour-feature-text">${f.text}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            const progressHtml = `
                <div class="tour-progress">
                    ${tourSteps.map((_, idx) => `<div class="tour-dot ${idx === currentStep ? 'active' : ''}" onclick="window.goToTeacherTourStep(${idx})"></div>`).join('')}
                </div>
            `;
            
            const buttonsHtml = step.type === 'complete' ? `
                <div class="tour-buttons">
                    <button class="tour-btn tour-btn-primary" onclick="window.completeTeacherTour()">🎉 Start Teaching!</button>
                </div>
            ` : `
                <div class="tour-buttons">
                    <button class="tour-btn tour-btn-secondary" onclick="window.skipTeacherTour()">Skip Tour</button>
                    <button class="tour-btn tour-btn-primary" onclick="window.nextTeacherTourStep()">Next →</button>
                </div>
            `;
            
            currentOverlay = document.createElement('div');
            currentOverlay.className = 'tour-overlay';
            currentOverlay.innerHTML = `
                <div class="tour-card">
                    <div class="tour-icon">${step.icon}</div>
                    <div class="tour-title">${step.title}</div>
                    <div class="tour-impact">${step.impact}</div>
                    <div class="tour-description">${step.description}</div>
                    ${featuresHtml}
                    ${progressHtml}
                    ${buttonsHtml}
                </div>
            `;
            document.body.appendChild(currentOverlay);
        }
    }
    
    // Global functions - MUST be attached to window
    window.nextTeacherTourStep = function() {
        console.log("Next clicked, current step:", currentStep);
        if (currentStep < tourSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            completeTeacherTour();
        }
    };
    
    window.goToTeacherTourStep = function(step) {
        console.log("Go to step:", step);
        currentStep = step;
        showStep(currentStep);
    };
    
    window.skipTeacherTour = function() {
        if (confirm("Skip the tour? You can always explore later!")) {
            completeTeacherTour();
        }
    };
    
    window.completeTeacherTour = function() {
        cleanupTour();
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        
        // Play celebration sound
        playSound(659.25, 0.3, [523.25, 659.25, 783.99, 1046.5]);
        
        const celebration = document.createElement('div');
        celebration.className = 'tour-overlay';
        celebration.style.background = 'rgba(0,0,0,0.95)';
        celebration.innerHTML = `
            <div class="tour-card">
                <div class="tour-icon" style="font-size: 80px; animation: tourIconBounce 0.5s ease;">🏆</div>
                <div class="tour-title" style="font-size: 32px;">You're Ready to Teach!</div>
                <div class="tour-description" style="font-size: 18px; margin-bottom: 20px;">You've mastered all ${tourSteps.length} features. Now go build your classroom!</div>
                <div style="margin: 20px 0;">
                    <div class="tour-features" style="background: var(--accent-light);">
                        <div class="tour-feature">
                            <div class="tour-feature-icon">🎨</div>
                            <div class="tour-feature-text">Start Whiteboard</div>
                        </div>
                        <div class="tour-feature">
                            <div class="tour-feature-icon">📢</div>
                            <div class="tour-feature-text">Post Announcements</div>
                        </div>
                        <div class="tour-feature">
                            <div class="tour-feature-icon">👥</div>
                            <div class="tour-feature-text">Add Students</div>
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
    };
    
    // Start tour after page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => showStep(0), 2000);
        });
    } else {
        setTimeout(() => showStep(0), 2000);
    }
    
    console.log(`🎓 Teacher tour ready! ${tourSteps.length} features to explore.`);
})();
