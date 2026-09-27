(function() {
    'use strict';
    console.log('🎴 Initializing Focus Persona Card feature...');
    
    // Set today's date immediately
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const dateEl = document.getElementById('personaDate');
    if (dateEl) dateEl.textContent = dateStr;
    
    // Set username immediately
    const userName = localStorage.getItem('studentName') || 'Grindly Student';
    const userEl = document.getElementById('personaUser');
    if (userEl) userEl.textContent = userName;
    
    // Add persona button to sidebar
    function addPersonaButtonToSidebar() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return false;
        
        if (document.getElementById('personaNavBtn')) return true;
        
        const personaBtn = document.createElement('div');
        personaBtn.className = 'nav-item persona-nav-btn';
        personaBtn.id = 'personaNavBtn';
        personaBtn.onclick = function() {
            showPersonaSection();
            if (typeof closeMobileMenu === 'function') closeMobileMenu();
        };
        personaBtn.innerHTML = '🎴 FOCUS PERSONA';
        
        const questsBtn = Array.from(sidebarNav.children).find(el => 
            el.textContent && el.textContent.includes('RPG QUESTS')
        );
        
        if (questsBtn) {
            questsBtn.insertAdjacentElement('beforebegin', personaBtn);
        } else {
            sidebarNav.appendChild(personaBtn);
        }
        
        return true;
    }
    
    // Show persona section
    window.showPersonaSection = function() {
        document.querySelectorAll('.dashboard-content').forEach(section => {
            section.style.display = 'none';
        });
        
        const container = document.getElementById('personaContainer');
        if (container) {
            container.style.display = 'block';
            
            const cardContainer = document.getElementById('personaCardContainer');
            const card = document.getElementById('focusPersonaCard');
            
            if (cardContainer && card && !cardContainer.contains(card)) {
                cardContainer.appendChild(card);
            }
        }
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const personaBtn = document.getElementById('personaNavBtn');
        if (personaBtn) personaBtn.classList.add('active');
        
        const header = document.getElementById('dashboardHeader');
        if (header) {
            const h1 = header.querySelector('h1');
            const subtitle = header.querySelector('.dashboard-subtitle');
            if (h1) h1.textContent = 'Focus Persona';
            if (subtitle) subtitle.textContent = 'Discover your study identity';
        }
        
        setTimeout(() => {
            generatePersonaCard();
        }, 100);
    };
    
    // ========== PERSONA ANALYSIS ==========
    window.getStudySessions = function() {
        if (window.studyData && window.studyData.studySessions) {
            return window.studyData.studySessions;
        }
        try {
            const saved = localStorage.getItem('studentPersistentData');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.studyData && data.studyData.studySessions) {
                    return data.studyData.studySessions;
                }
            }
        } catch (e) {}
        return [];
    };
    
    window.getTotalStudyHours = function() {
        if (window.studyData && window.studyData.totalStudyHours) {
            return parseFloat(window.studyData.totalStudyHours);
        }
        if (window.studyData && window.studyData.totalMinutes) {
            return window.studyData.totalMinutes / 60;
        }
        return 0;
    };
    
    window.analyzeFocusPersona = function() {
        const sessions = getStudySessions();
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentSessions = sessions.filter(s => {
            if (!s || !s.date) return false;
            try {
                return new Date(s.date) >= sevenDaysAgo;
            } catch (e) {
                return false;
            }
        });
        
        if (recentSessions.length === 0) {
            return {
                title: "The Unawakened",
                description: "Start your journey to discover your focus persona!",
                icon: "🌙",
                quote: "Every master was once a beginner.",
                stats: {
                    avgStartTime: "--:--",
                    avgDuration: "0 min",
                    sessionsPerDay: "0"
                }
            };
        }
        
        const sessionsByDay = {};
        let totalStartHour = 0;
        let totalDuration = 0;
        let sessionCount = 0;
        
        recentSessions.forEach(session => {
            try {
                const date = new Date(session.date);
                if (isNaN(date.getTime())) return;
                
                const dayKey = date.toDateString();
                sessionsByDay[dayKey] = (sessionsByDay[dayKey] || 0) + 1;
                totalStartHour += date.getHours();
                totalDuration += session.hours || 0;
                sessionCount++;
            } catch (e) {}
        });
        
        if (sessionCount === 0) {
            return {
                title: "The Unawakened",
                description: "Start your journey to discover your focus persona!",
                icon: "🌙",
                quote: "Every master was once a beginner.",
                stats: {
                    avgStartTime: "--:--",
                    avgDuration: "0 min",
                    sessionsPerDay: "0"
                }
            };
        }
        
        const avgStartTime = totalStartHour / sessionCount;
        const avgDuration = totalDuration / sessionCount;
        const avgSessionsPerDay = Object.keys(sessionsByDay).length > 0 ? 
            sessionCount / Object.keys(sessionsByDay).length : 0;
        
        const formatDuration = (hours) => {
            if (hours < 1) return `${Math.round(hours * 60)} min`;
            return `${hours.toFixed(1)} hrs`;
        };
        
        const formatHour = (hour) => {
            const h = Math.floor(hour);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayHour = h % 12 || 12;
            return `${displayHour}:00 ${ampm}`;
        };
        
        if (avgStartTime >= 22 || avgStartTime < 5) {
            return {
                title: "The Night Owl",
                description: "You thrive when the world sleeps. Your mind awakens under moonlight.",
                icon: "🦉",
                quote: "Darkness is my canvas, focus is my brush.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        if (avgDuration > 1) {
            return {
                title: "The Deep Diver",
                description: "You lose yourself in the flow. Hours feel like minutes when you focus.",
                icon: "🏊‍♂️",
                quote: "Depth over breadth, quality over quantity.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        if (avgSessionsPerDay > 5) {
            return {
                title: "The Sprinter",
                description: "You tackle challenges in bursts of intense focus. Small wins add up fast.",
                icon: "⚡",
                quote: "Speed is my ally, momentum my weapon.",
                stats: {
                    avgStartTime: formatHour(avgStartTime),
                    avgDuration: formatDuration(avgDuration),
                    sessionsPerDay: avgSessionsPerDay.toFixed(1)
                }
            };
        }
        
        return {
            title: "The Steady Scholar",
            description: "Consistency is your superpower. Day by day, you build lasting knowledge.",
            icon: "📚",
            quote: "Slow and steady wins the race of mastery.",
            stats: {
                avgStartTime: formatHour(avgStartTime),
                avgDuration: formatDuration(avgDuration),
                sessionsPerDay: avgSessionsPerDay.toFixed(1)
            }
        };
    };
    
    window.getLast7DaysFocusData = function() {
        const sessions = getStudySessions();
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const daySessions = sessions.filter(s => {
                if (!s || !s.date) return false;
                try {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= date && sessionDate < nextDay;
                } catch (e) {
                    return false;
                }
            });
            
            const totalHours = daySessions.reduce((sum, s) => sum + (s.hours || 0), 0);
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                hours: totalHours,
                sessions: daySessions.length
            });
        }
        
        return last7Days;
    };
    
    window.calculateUserLevel = function() {
        const totalHours = getTotalStudyHours();
        if (totalHours < 5) return 1;
        if (totalHours < 15) return 2;
        if (totalHours < 30) return 3;
        if (totalHours < 50) return 4;
        if (totalHours < 100) return 5;
        return 6;
    };
    
    window.renderPersonaCard = function(data) {
        const card = document.getElementById('focusPersonaCard');
        if (!card) return;
        
        card.style.display = 'block';
        
        document.getElementById('personaIcon').textContent = data.persona.icon;
        document.getElementById('personaTitle').textContent = data.persona.title;
        
        const levelBadge = document.querySelector('#personaLevel .level-badge');
        if (levelBadge) levelBadge.textContent = `LVL ${data.level}`;
        
        document.getElementById('personaDescription').textContent = data.persona.description;
        document.getElementById('personaQuote').textContent = `"${data.persona.quote}"`;
        
        if (data.persona.stats) {
            document.getElementById('statStart').textContent = data.persona.stats.avgStartTime;
            document.getElementById('statDuration').textContent = data.persona.stats.avgDuration;
            document.getElementById('statSessions').textContent = data.persona.stats.sessionsPerDay;
        }
        
        renderBarChart(data.last7Days);
    };
    
    window.renderBarChart = function(daysData) {
        const chartContainer = document.getElementById('focusBarChart');
        if (!chartContainer) return;
        
        const maxHours = Math.max(...daysData.map(d => d.hours), 1);
        
        chartContainer.innerHTML = daysData.map(day => {
            const heightPercent = (day.hours / maxHours) * 100;
            const barHeight = heightPercent > 0 ? Math.max(heightPercent, 8) : 4;
            
            return `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${barHeight}px; background: linear-gradient(180deg, #ffd700, #c0a0e0);"></div>
                    <div class="chart-label">${day.date}</div>
                    <div class="chart-value">${day.hours.toFixed(1)}h</div>
                </div>
            `;
        }).join('');
    };
    
    window.generatePersonaCard = function() {
        const persona = analyzeFocusPersona();
        const last7Days = getLast7DaysFocusData();
        
        const data = {
            persona,
            last7Days,
            userName: localStorage.getItem('studentName') || 'Grindly Student',
            level: calculateUserLevel(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
        
        renderPersonaCard(data);
        
        document.getElementById('focusPersonaCard').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        if (window.showNotification) {
            window.showNotification(`✨ Your persona: ${persona.title}`, 'success');
        }
    };
    
    // ========== NEW - CANVAS BASED DOWNLOAD (100% WORKS) ==========
    window.downloadPersonaCard = function() {
        const persona = analyzeFocusPersona();
        const last7Days = getLast7DaysFocusData();
        const level = calculateUserLevel();
        const userName = localStorage.getItem('studentName') || 'Grindly Student';
        const today = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        if (window.showNotification) {
            window.showNotification('Generating image...', 'info');
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 650;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        ctx.fillStyle = '#1a1e2f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // Draw top gradient line
        const gradient = ctx.createLinearGradient(0, 15, canvas.width, 15);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.3, '#c0a0e0');
        gradient.addColorStop(0.7, '#4f9eff');
        gradient.addColorStop(1, '#ffd700');
        ctx.fillStyle = gradient;
        ctx.fillRect(20, 20, canvas.width - 40, 4);
        
        // Draw icon
        ctx.font = '50px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(persona.icon, 50, 110);
        
        // Draw icon glow
        ctx.shadowColor = '#4f46e5';
        ctx.shadowBlur = 20;
        ctx.fillText(persona.icon, 50, 110);
        ctx.shadowBlur = 0;
        
        // Draw title
        ctx.font = 'bold 28px "Inter", "Poppins", sans-serif';
        ctx.fillStyle = '#ffffff';
        const titleGradient = ctx.createLinearGradient(130, 70, 350, 70);
        titleGradient.addColorStop(0, '#ffd700');
        titleGradient.addColorStop(0.5, '#c0a0e0');
        titleGradient.addColorStop(1, '#4f9eff');
        ctx.fillStyle = titleGradient;
        ctx.fillText(persona.title, 130, 90);
        
        ctx.font = '14px "Inter", "Poppins", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Focus Persona', 130, 115);
        
        // Draw level badge
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(420, 70, 35, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`LVL ${level}`, 400, 75);
        
        // Draw stats background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(40, 130, canvas.width - 80, 70);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 130, canvas.width - 80, 70);
        
        // Draw stats
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillStyle = '#ffffff';
        
        // Stat 1
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('AVG START', 70, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.avgStartTime, 70, 185);
        
        // Stat 2
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('AVG DURATION', 200, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.avgDuration, 200, 185);
        
        // Stat 3
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText('SESSIONS/DAY', 350, 155);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Inter", sans-serif';
        ctx.fillText(persona.stats.sessionsPerDay, 350, 185);
        
        // Draw chart background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(40, 220, canvas.width - 80, 150);
        ctx.strokeStyle = 'rgba(79, 158, 255, 0.3)';
        ctx.strokeRect(40, 220, canvas.width - 80, 150);
        
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('⚔️ FOCUS HOURS (LAST 7 DAYS)', 100, 250);
        
        // Draw bars
        const barWidth = 40;
        const maxBarHeight = 80;
        const maxHours = Math.max(...last7Days.map(d => d.hours), 1);
        
        last7Days.forEach((day, index) => {
            const x = 60 + (index * 55);
            const barHeight = (day.hours / maxHours) * maxBarHeight || 4;
            
            // Draw bar
            const barGradient = ctx.createLinearGradient(x, 350 - barHeight, x, 350);
            barGradient.addColorStop(0, '#ffd700');
            barGradient.addColorStop(1, '#c0a0e0');
            ctx.fillStyle = barGradient;
            ctx.fillRect(x, 350 - barHeight, barWidth - 5, barHeight);
            
            // Draw day label
            ctx.fillStyle = '#94a3b8';
            ctx.font = '12px "Inter", sans-serif';
            ctx.fillText(day.date, x, 370);
            
            // Draw hour value
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.fillText(day.hours.toFixed(1), x + 5, 335 - barHeight);
        });
        
        // Draw description
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'italic 14px "Inter", sans-serif';
        ctx.fillText(persona.description, 40, 420);
        
        // Draw quote
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 12px "Inter", sans-serif';
        ctx.fillText(`"${persona.quote}"`, 40, 470);
        
        // Draw footer
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 500);
        ctx.lineTo(canvas.width - 40, 500);
        ctx.stroke();
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillText(userName, 40, 530);
        ctx.fillText(today, canvas.width - 150, 530);
        
        // Draw badge
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(430, 580, 30, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.fillText('PERSONA', 405, 580);
        ctx.fillText('UNLOCKED', 400, 600);
        
        // Download
        const link = document.createElement('a');
        link.download = `focus-persona-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        if (window.showNotification) {
            window.showNotification('✅ Persona card downloaded!', 'success');
        }
    };
    
    // ========== SHARE ==========
    window.sharePersonaCard = function() {
        downloadPersonaCard();
        if (window.showNotification) {
            window.showNotification('ℹ️ Image downloaded - you can now share it!', 'info');
        }
    };
    
    // ========== INITIALIZE ==========
    function tryInit(attempt = 1) {
        if (document.querySelector('.sidebar-nav')) {
            addPersonaButtonToSidebar();
            console.log('✅ Focus Persona Card feature ready!');
        } else if (attempt < 20) {
            setTimeout(() => tryInit(attempt + 1), 500);
        }
    }
    
    setTimeout(tryInit, 1500);
})();


