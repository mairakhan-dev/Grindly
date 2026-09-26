(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reorganizeLayout);
  } else {
    reorganizeLayout();
  }
  
  function reorganizeLayout() {
    console.log('🔄 Reorganizing layout...');
    
    // Wait a moment for original content to load
    setTimeout(() => {
      reorganizeSidebar();
      reorganizeDashboard();
      loadSavedStates();
    }, 500);
  }
  
  function reorganizeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Get all original sidebar content
    const sidebarHeader = sidebar.querySelector('.sidebar-header');
    const classSwitcher = sidebar.querySelector('.class-switcher');
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    const allSidebarStats = sidebar.querySelectorAll('.sidebar-stats');
    const allProTips = sidebar.querySelectorAll('.pro-tip');
    const challengesSection = sidebar.querySelector('.challenges-section');
    const themeSelector = sidebar.querySelector('select.theme-selector');
    const logoutBtn = sidebar.querySelector('.logout-btn');
    
    // Separate specific sections
    let classStats = null;
    let heatmapSection = null;
    let toolsSection = null;
    let engagementSection = null;
    
    allSidebarStats.forEach(stat => {
      if (stat.querySelector('h3')?.textContent.includes('Class Stats')) {
        classStats = stat.cloneNode(true);
      } else if (stat.querySelector('h3')?.textContent.includes('Engagement Heatmap')) {
        heatmapSection = stat.cloneNode(true);
      } else if (stat.querySelector('h3')?.textContent.includes('Sidebar Tools')) {
        toolsSection = stat.cloneNode(true);
      } else {
        engagementSection = stat.cloneNode(true);
      }
    });
    
    // Separate pro tips
    const proTips = [];
    const celebrationTip = sidebar.querySelector('#celebrationProTip');
    const regularTips = [];
    
    allProTips.forEach(tip => {
      if (tip.id === 'celebrationProTip') {
        celebrationTip?.remove(); // Will be handled separately
      } else {
        regularTips.push(tip.cloneNode(true));
      }
    });
    
    // Clear sidebar
    sidebar.innerHTML = '';
    
    // Add header and class switcher
    if (sidebarHeader) sidebar.appendChild(sidebarHeader.cloneNode(true));
    if (classSwitcher) sidebar.appendChild(classSwitcher.cloneNode(true));
    
    // SECTION 1: Navigation
    const navSection = document.createElement('div');
    navSection.className = 'sidebar-section';
    navSection.setAttribute('data-section', 'nav');
    navSection.innerHTML = `
      <div class="section-header" onclick="toggleSection('sidebar-nav-section')">
        <h3><span>📋</span> Main Navigation</h3>
        <span class="collapse-icon" id="sidebar-nav-section-icon">▼</span>
      </div>
      <div class="section-content" id="sidebar-nav-section"></div>
    `;
    if (sidebarNav) navSection.querySelector('.section-content').appendChild(sidebarNav.cloneNode(true));
    sidebar.appendChild(navSection);
    
    // SECTION 2: Classroom Tools & Challenges
    const toolsNav = document.createElement('div');
    toolsNav.className = 'sidebar-section';
    toolsNav.setAttribute('data-section', 'tools');
    toolsNav.innerHTML = `
      <div class="section-header" onclick="toggleSection('sidebar-tools-section')">
        <h3><span>🛠️</span> Classroom Tools</h3>
        <span class="collapse-icon" id="sidebar-tools-section-icon">▼</span>
      </div>
      <div class="section-content" id="sidebar-tools-section"></div>
    `;
    const toolsContent = toolsNav.querySelector('.section-content');
    if (toolsSection) toolsContent.appendChild(toolsSection);
    if (challengesSection) toolsContent.appendChild(challengesSection.cloneNode(true));
    if (engagementSection) toolsContent.appendChild(engagementSection);
    sidebar.appendChild(toolsNav);
    
    // SECTION 3: Stats & Analytics
    const statsSection = document.createElement('div');
    statsSection.className = 'sidebar-section';
    statsSection.setAttribute('data-section', 'stats');
    statsSection.innerHTML = `
      <div class="section-header" onclick="toggleSection('sidebar-stats-section')">
        <h3><span>📊</span> Stats & Analytics</h3>
        <span class="collapse-icon" id="sidebar-stats-section-icon">▼</span>
      </div>
      <div class="section-content" id="sidebar-stats-section"></div>
    `;
    const statsContent = statsSection.querySelector('.section-content');
    
    // Add Class Stats (neatly formatted)
    if (classStats) {
      const statsClone = classStats.cloneNode(true);
      statsContent.appendChild(statsClone);
    }
    
    // Add Heatmap (only once)
    if (heatmapSection) {
      statsContent.appendChild(heatmapSection);
    }
    
    // Add theme selector
    if (themeSelector) {
      const themeWrapper = document.createElement('div');
      themeWrapper.style.marginTop = '16px';
      themeWrapper.appendChild(themeSelector.cloneNode(true));
      statsContent.appendChild(themeWrapper);
    }
    
    sidebar.appendChild(statsSection);
    
    // SECTION 4: Pro Tips
    if (regularTips.length > 0 || celebrationTip) {
      const tipsSection = document.createElement('div');
      tipsSection.className = 'sidebar-section';
      tipsSection.setAttribute('data-section', 'tips');
      tipsSection.innerHTML = `
        <div class="section-header" onclick="toggleSection('sidebar-tips-section')">
          <h3><span>💡</span> Pro Tips</h3>
          <span class="collapse-icon" id="sidebar-tips-section-icon">▼</span>
        </div>
        <div class="section-content" id="sidebar-tips-section"></div>
      `;
      const tipsContent = tipsSection.querySelector('.section-content');
      
      regularTips.forEach(tip => tipsContent.appendChild(tip));
      if (celebrationTip) {
        const celebrationClone = celebrationTip.cloneNode(true);
        celebrationClone.style.display = 'block';
        tipsContent.appendChild(celebrationClone);
      }
      
      sidebar.appendChild(tipsSection);
    }
    
    // SECTION 5: Account
    const accountSection = document.createElement('div');
    accountSection.className = 'sidebar-section';
    accountSection.setAttribute('data-section', 'account');
    accountSection.innerHTML = `
      <div class="section-header" onclick="toggleSection('sidebar-account-section')">
        <h3><span>👤</span> Account</h3>
        <span class="collapse-icon" id="sidebar-account-section-icon">▼</span>
      </div>
      <div class="section-content" id="sidebar-account-section"></div>
    `;
    const accountContent = accountSection.querySelector('.section-content');
    
    if (logoutBtn) {
      const logoutWrapper = document.createElement('div');
      logoutWrapper.style.padding = '8px 0';
      logoutWrapper.appendChild(logoutBtn.cloneNode(true));
      accountContent.appendChild(logoutWrapper);
    }
    
    sidebar.appendChild(accountSection);
  }
  
  function reorganizeDashboard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    
    const quickStats = dashboard.querySelector('.quick-stats');
    const proTips = dashboard.querySelectorAll('.pro-tip');
    
const teacherToolkit = Array.from(dashboard.querySelectorAll('.content-card')).find(card => {
    const h2 = card.querySelector('h2');
    return h2 && h2.textContent.includes('Teacher Toolkit');
});
    const formsSection = dashboard.querySelector('.forms-section');
    const contentSection = dashboard.querySelector('.content-section');
    const streakChain = dashboard.querySelector('.streak-chain-container');
    
    // Clear dashboard but keep quick stats
    dashboard.innerHTML = '';
    if (quickStats) dashboard.appendChild(quickStats.cloneNode(true));
    
    // Section 1: Overview
    const overviewSection = createDashboardSection('overview', '📊', 'Class Overview');
    dashboard.appendChild(overviewSection);
    
    // Section 2: Teacher Tools
    const toolsSection = createDashboardSection('tools', '🛠️', 'Teacher Toolkit');
    if (teacherToolkit) toolsSection.querySelector('.section-content').appendChild(teacherToolkit.cloneNode(true));
    dashboard.appendChild(toolsSection);
    
    // Section 3: Content Management
    const contentManagement = createDashboardSection('content', '📚', 'Content Management');
    const contentDiv = contentManagement.querySelector('.section-content');
    if (formsSection) contentDiv.appendChild(formsSection.cloneNode(true));
    if (contentSection) contentDiv.appendChild(contentSection.cloneNode(true));
    dashboard.appendChild(contentManagement);
    
    // Section 4: Analytics
    const analyticsSection = createDashboardSection('analytics', '📈', 'Analytics');
    if (streakChain) analyticsSection.querySelector('.section-content').appendChild(streakChain.cloneNode(true));
    dashboard.appendChild(analyticsSection);
    
    // Add footer
    const footer = dashboard.querySelector('.footer');
    if (footer) dashboard.appendChild(footer.cloneNode(true));
  }
  
  function createDashboardSection(id, icon, title) {
    const section = document.createElement('div');
    section.className = 'dashboard-section';
    section.innerHTML = `
      <div class="section-header" data-section="${id}" onclick="toggleSection('dashboard-${id}-section')">
        <h2><span>${icon}</span> ${title}</h2>
        <span class="collapse-icon" id="dashboard-${id}-section-icon">▼</span>
      </div>
      <div class="section-content" id="dashboard-${id}-section"></div>
    `;
    return section;
  }
  
  // Toggle function for sections
  window.toggleSection = function(sectionId) {
    const content = document.getElementById(sectionId);
    const icon = document.getElementById(sectionId + '-icon');
    const header = icon?.closest('.section-header');
    
    if (content) {
      content.classList.toggle('collapsed');
      if (icon) {
        icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0)';
      }
      if (header) {
        header.classList.toggle('collapsed', content.classList.contains('collapsed'));
      }
      
      // Save state
      try {
        localStorage.setItem('sidebar-section-' + sectionId, content.classList.contains('collapsed'));
      } catch (e) {}
    }
  };
  
  function loadSavedStates() {
    // Load all saved collapsed states
    const sections = [
      'sidebar-nav-section',
      'sidebar-tools-section', 
      'sidebar-stats-section',
      'sidebar-tips-section',
      'sidebar-account-section',
      'dashboard-overview-section',
      'dashboard-tools-section',
      'dashboard-content-section',
      'dashboard-analytics-section'
    ];
    
    sections.forEach(sectionId => {
      try {
        const saved = localStorage.getItem('sidebar-section-' + sectionId);
        if (saved === 'true') {
          const content = document.getElementById(sectionId);
          const icon = document.getElementById(sectionId + '-icon');
          if (content) {
            content.classList.add('collapsed');
            if (icon) icon.style.transform = 'rotate(-90deg)';
          }
        }
      } catch (e) {}
    });
  }
})();