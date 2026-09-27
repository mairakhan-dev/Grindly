(function() {
  console.log('📊 Classifying student dashboard...');
  
  function classifyDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    
    // Don't run if already done
    if (document.getElementById('student-view-bar')) return;
    
    // Add view buttons with actual dashboard content names
    const viewBar = document.createElement('div');
    viewBar.id = 'student-view-bar';
    viewBar.className = 'student-view-bar';
    viewBar.innerHTML = `
      <h2>My Dashboard</h2>
      <div class="student-view-options">
        <button class="student-view-btn active" onclick="switchDashboardView('all', this)">
          <span>📊</span> All
        </button>
        <button class="student-view-btn" onclick="switchDashboardView('study', this)">
          <span>🔥</span> Study Progress
        </button>
        <button class="student-view-btn" onclick="switchDashboardView('tasks', this)">
          <span>✅</span> Tasks & Assignments
        </button>
        <button class="student-view-btn" onclick="switchDashboardView('tools', this)">
          <span>🛠️</span> Study Tools
        </button>
      </div>
    `;
    dashboard.insertBefore(viewBar, dashboard.firstChild);
    
    // Add section classes after a short delay
    setTimeout(addSectionClasses, 500);
  }
  
  function addSectionClasses() {
    console.log('Adding section classes...');
    
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    
    // Remove any existing classes
    document.querySelectorAll('.study-progress-section, .tasks-section, .classroom-section, .tools-section').forEach(el => {
      el.classList.remove('study-progress-section', 'tasks-section', 'classroom-section', 'tools-section');
    });
    
    // STUDY PROGRESS SECTION (streak, stats, goals, study hours)
    const quickStats = dashboard.querySelector('.quick-stats');
    if (quickStats) quickStats.classList.add('study-progress-section');
    
    const streakCard = dashboard.querySelector('.streak-card');
    if (streakCard) streakCard.classList.add('study-progress-section');
    
    const goalCard = dashboard.querySelector('.goal-card');
    if (goalCard) goalCard.classList.add('study-progress-section');
    
    // TASKS SECTION
    const allCards = dashboard.querySelectorAll('.content-card');
    allCards.forEach(card => {
      const header = card.querySelector('.content-header h2');
      if (header) {
        const text = header.textContent || '';
        if (text.includes('My Tasks')) {
          card.classList.add('tasks-section');
        }
        if (text.includes('My Assignments')) {
          card.classList.add('tasks-section');
        }
        if (text.includes('Add Study Hours')) {
          card.classList.add('study-progress-section');
        }
        if (text.includes('Study Stats Compare')) {
          card.classList.add('tools-section');
        }
        if (text.includes('Learn By Teaching')) {
          card.classList.add('tools-section');
        }
      }
    });
    
    // TOOLS SECTION (quick notes, badges, motivation, profile, stats compare, teach mode)
    const quickNotes = dashboard.querySelector('.quick-notes-card');
    if (quickNotes) quickNotes.classList.add('tools-section');
    
    const badgesCard = dashboard.querySelector('.badges-card');
    if (badgesCard) badgesCard.classList.add('tools-section');
    
    const motivationCard = dashboard.querySelector('.motivation-card');
    if (motivationCard) motivationCard.classList.add('tools-section');
    
    const profileForm = Array.from(dashboard.querySelectorAll('.form-card')).find(card => {
      const h2 = card.querySelector('h2');
      return h2 && h2.textContent.includes('My Profile');
    });
    if (profileForm) profileForm.classList.add('tools-section');
    
    const statsCompare = Array.from(dashboard.querySelectorAll('.content-card')).find(card => {
      const h2 = card.querySelector('h2');
      return h2 && h2.textContent.includes('Study Stats Compare');
    });
    if (statsCompare) statsCompare.classList.add('tools-section');
    
    const teachMode = Array.from(dashboard.querySelectorAll('.content-card')).find(card => {
      const h2 = card.querySelector('h2');
      return h2 && h2.textContent.includes('Learn By Teaching');
    });
    if (teachMode) teachMode.classList.add('tools-section');
    
    // Pro tips and footer are always visible (added to all sections)
    const proTips = dashboard.querySelectorAll('.pro-tip');
    proTips.forEach(tip => {
      tip.classList.add('study-progress-section', 'tasks-section', 'tools-section');
    });
    
    const footer = dashboard.querySelector('.footer');
    if (footer) {
      footer.classList.add('study-progress-section', 'tasks-section', 'tools-section');
    }
    
    console.log('✅ Classes added - each section now has its own unique content');
  }
  
  // Switch view function
  window.switchDashboardView = function(view, btnEl) {
    console.log('Switching to:', view);
    
    // Update button states
    document.querySelectorAll('.student-view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    if (btnEl) {
      btnEl.classList.add('active');
    } else if (window.event && window.event.target) {
      window.event.target.classList.add('active');
    }
    
    // Remove all hide classes
    document.body.classList.remove('hide-study', 'hide-tasks', 'hide-tools');
    
    // Add appropriate hide classes
    if (view === 'study') {
      document.body.classList.add('hide-tasks', 'hide-tools');
    } else if (view === 'tasks') {
      document.body.classList.add('hide-study', 'hide-tools');
    } else if (view === 'tools') {
      document.body.classList.add('hide-study', 'hide-tasks');
    }
    // 'all' view - no hide classes
  };
  
  // Run when dashboard is ready
  function tryClassify(attempt = 1) {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.children.length > 0) {
      classifyDashboard();
    } else if (attempt < 20) {
      setTimeout(() => tryClassify(attempt + 1), 500);
    }
  }
  
  // Start trying
  setTimeout(() => tryClassify(1), 2000);
  
  // Also run when switching to dashboard
  const originalShowSection = window.showSection;
  if (originalShowSection) {
    window.showSection = function(sectionId) {
      originalShowSection(sectionId);
      if (sectionId === 'dashboard') {
        setTimeout(() => {
          if (!document.getElementById('student-view-bar')) {
            classifyDashboard();
          }
        }, 500);
      }
    };
  }
})();