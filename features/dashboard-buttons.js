(function() {
  // Wait for dashboard to be ready
  function initDashboardButtons() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    
    // Don't add if already added
    if (document.getElementById('dashboard-button-bar')) return;
    
    console.log('Adding dashboard section buttons...');
    
    // Create button bar
    const buttonBar = document.createElement('div');
    buttonBar.id = 'dashboard-button-bar';
    buttonBar.className = 'dashboard-button-bar';
    buttonBar.innerHTML = `
      <button class="dashboard-section-btn active" data-section="all" onclick="showDashboardSection('all')">
        <span>📊</span> All
      </button>
      <button class="dashboard-section-btn" data-section="stats" onclick="showDashboardSection('stats')">
        <span>📋</span> Stats
      </button>
      <button class="dashboard-section-btn" data-section="tools" onclick="showDashboardSection('tools')">
        <span>🛠️</span> Tools
      </button>
      <button class="dashboard-section-btn" data-section="content" onclick="showDashboardSection('content')">
        <span>📚</span> Content
      </button>
    `;
    
    // Insert at the very top of dashboard
    dashboard.insertBefore(buttonBar, dashboard.firstChild);
    
    // Group existing content - WITHOUT MOVING ANYTHING
    setTimeout(() => {
      groupDashboardContent();
    }, 500);
  }
  
  function groupDashboardContent() {
    const dashboard = document.getElementById('dashboard');
    
    // Create wrapper if not exists
    let wrapper = document.getElementById('dashboard-content-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'dashboard-content-wrapper';
      wrapper.className = 'dashboard-content-wrapper';
      
      // Move all children except button bar into wrapper
      const children = Array.from(dashboard.children);
      children.forEach(child => {
        if (child.id !== 'dashboard-button-bar') {
          wrapper.appendChild(child);
        }
      });
      
      dashboard.appendChild(wrapper);
    }
    
    // Group sections - but don't move anything, just add classes
    const quickStats = wrapper.querySelector('.quick-stats');
    if (quickStats) quickStats.classList.add('dashboard-section-group', 'stats-group');
    
    const formsSection = wrapper.querySelector('.forms-section');
    if (formsSection) formsSection.classList.add('dashboard-section-group', 'tools-group');
    
    const contentSection = wrapper.querySelector('.content-section');
    if (contentSection) contentSection.classList.add('dashboard-section-group', 'content-group');
    
    const toolkitCards = wrapper.querySelectorAll('.content-card');
    toolkitCards.forEach(card => {
      const header = card.querySelector('.content-header h2');
      if (header && header.textContent.includes('Teacher Toolkit')) {
        card.classList.add('dashboard-section-group', 'tools-group');
      }
    });
    
    const streakChain = wrapper.querySelector('.streak-chain-container');
    if (streakChain) streakChain.classList.add('dashboard-section-group', 'stats-group');
    
    const proTips = wrapper.querySelectorAll('.pro-tip');
    proTips.forEach(tip => tip.classList.add('dashboard-section-group', 'stats-group'));
    
    const footer = wrapper.querySelector('.footer');
    if (footer) footer.classList.add('dashboard-section-group', 'allways-show');
  }
  
  // Show/hide sections
  window.showDashboardSection = function(section) {
    // Update button states
    document.querySelectorAll('.dashboard-section-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.dashboard-section-btn[data-section="${section}"]`).classList.add('active');
    
    if (section === 'all') {
      // Show everything
      document.querySelectorAll('.dashboard-section-group').forEach(el => {
        el.classList.remove('hidden');
      });
    } else {
      // Hide everything first
      document.querySelectorAll('.dashboard-section-group').forEach(el => {
        if (!el.classList.contains('allways-show')) {
          el.classList.add('hidden');
        }
      });
      
      // Show selected section
      document.querySelectorAll(`.${section}-group`).forEach(el => {
        el.classList.remove('hidden');
      });
    }
  };
  
  // Initialize when dashboard is visible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initDashboardButtons, 2000);
    });
  } else {
    setTimeout(initDashboardButtons, 2000);
  }
  
  // Check periodically
  const checkInterval = setInterval(() => {
    if (document.getElementById('dashboard') && 
        window.getComputedStyle(document.getElementById('dashboard')).display !== 'none' &&
        !document.getElementById('dashboard-button-bar')) {
      initDashboardButtons();
    }
  }, 1000);
})();