(function() {
  console.log('📋 Organizing student sidebar...');
  
  function organizeStudentSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      console.log('Sidebar not found');
      return false;
    }
    
    // Don't reorganize if already done
    if (sidebar.querySelector('.sidebar-section')) {
      console.log('Sidebar already organized');
      return true;
    }
    
    // Get all original sidebar content
    const sidebarHeader = sidebar.querySelector('.sidebar-header');
    const classSwitcher = sidebar.querySelector('.class-switcher');
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    const sidebarStats = sidebar.querySelector('.sidebar-stats');
    const storiesSection = sidebar.querySelector('.stories-section');
    const heatmapSection = sidebar.querySelector('.heatmap-section');
    const themeSelector = sidebar.querySelector('.theme-selector');
    
    // Clear sidebar
    sidebar.innerHTML = '';
    
    // Add header and class switcher at top (not in collapsible sections)
    if (sidebarHeader) sidebar.appendChild(sidebarHeader.cloneNode(true));
    if (classSwitcher) sidebar.appendChild(classSwitcher.cloneNode(true));
    
    // SECTION 1: Navigation
    if (sidebarNav) {
      const navSection = document.createElement('div');
      navSection.className = 'sidebar-section';
      navSection.setAttribute('data-section', 'nav');
      navSection.innerHTML = `
        <div class="sidebar-section-header" onclick="toggleSidebarSection('sidebar-nav-content')">
          <h3><span>📋</span> Navigation</h3>
          <span class="collapse-icon" id="sidebar-nav-icon">▼</span>
        </div>
        <div class="sidebar-section-content" id="sidebar-nav-content"></div>
      `;
      navSection.querySelector('.sidebar-section-content').appendChild(sidebarNav.cloneNode(true));
      sidebar.appendChild(navSection);
    }
    
    // SECTION 2: Today's Stats
    if (sidebarStats) {
      const statsSection = document.createElement('div');
      statsSection.className = 'sidebar-section';
      statsSection.setAttribute('data-section', 'stats');
      statsSection.innerHTML = `
        <div class="sidebar-section-header" onclick="toggleSidebarSection('sidebar-stats-content')">
          <h3><span>📊</span> Today's Stats</h3>
          <span class="collapse-icon" id="sidebar-stats-icon">▼</span>
        </div>
        <div class="sidebar-section-content" id="sidebar-stats-content"></div>
      `;
      statsSection.querySelector('.sidebar-section-content').appendChild(sidebarStats.cloneNode(true));
      sidebar.appendChild(statsSection);
    }
    
    // SECTION 3: Inspiring Stories
    if (storiesSection) {
      const storiesSectionDiv = document.createElement('div');
      storiesSectionDiv.className = 'sidebar-section';
      storiesSectionDiv.setAttribute('data-section', 'stories');
      storiesSectionDiv.innerHTML = `
        <div class="sidebar-section-header" onclick="toggleSidebarSection('sidebar-stories-content')">
          <h3><span>🌟</span> Inspiring Stories</h3>
          <span class="collapse-icon" id="sidebar-stories-icon">▼</span>
        </div>
        <div class="sidebar-section-content" id="sidebar-stories-content"></div>
      `;
      storiesSectionDiv.querySelector('.sidebar-section-content').appendChild(storiesSection.cloneNode(true));
      sidebar.appendChild(storiesSectionDiv);
    }
    
    // SECTION 4: Study Heatmap
    if (heatmapSection) {
      const heatmapSectionDiv = document.createElement('div');
      heatmapSectionDiv.className = 'sidebar-section';
      heatmapSectionDiv.setAttribute('data-section', 'heatmap');
      heatmapSectionDiv.innerHTML = `
        <div class="sidebar-section-header" onclick="toggleSidebarSection('sidebar-heatmap-content')">
          <h3><span>🗓️</span> Study Heatmap</h3>
          <span class="collapse-icon" id="sidebar-heatmap-icon">▼</span>
        </div>
        <div class="sidebar-section-content" id="sidebar-heatmap-content"></div>
      `;
      heatmapSectionDiv.querySelector('.sidebar-section-content').appendChild(heatmapSection.cloneNode(true));
      sidebar.appendChild(heatmapSectionDiv);
    }
    
    // SECTION 5: Theme
    if (themeSelector) {
      const themeSection = document.createElement('div');
      themeSection.className = 'sidebar-section';
      themeSection.setAttribute('data-section', 'theme');
      themeSection.innerHTML = `
        <div class="sidebar-section-header" onclick="toggleSidebarSection('sidebar-theme-content')">
          <h3><span>🎨</span> Theme</h3>
          <span class="collapse-icon" id="sidebar-theme-icon">▼</span>
        </div>
        <div class="sidebar-section-content" id="sidebar-theme-content"></div>
      `;
      const themeWrapper = document.createElement('div');
      themeWrapper.style.padding = '8px 0';
      themeWrapper.appendChild(themeSelector.cloneNode(true));
      themeSection.querySelector('.sidebar-section-content').appendChild(themeWrapper);
      sidebar.appendChild(themeSection);
    }
    
    // Load saved states
    loadSidebarStates();
    
    console.log('✅ Student sidebar organized into 5 sections');
    return true;
  }
  
  // Toggle sidebar section
  window.toggleSidebarSection = function(contentId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(contentId.replace('content', 'icon'));
    const header = icon?.closest('.sidebar-section-header');
    
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
        localStorage.setItem('sidebar-' + contentId, content.classList.contains('collapsed'));
      } catch (e) {}
    }
  };
  
  // Load saved sidebar states
  function loadSidebarStates() {
    const sections = ['nav', 'stats', 'stories', 'heatmap', 'theme'];
    
    sections.forEach(section => {
      try {
        const saved = localStorage.getItem(`sidebar-sidebar-${section}-content`);
        if (saved === 'true') {
          const content = document.getElementById(`sidebar-${section}-content`);
          const icon = document.getElementById(`sidebar-${section}-icon`);
          
          if (content) {
            content.classList.add('collapsed');
            if (icon) icon.style.transform = 'rotate(-90deg)';
          }
        }
      } catch (e) {}
    });
  }
  
  // Try to organize sidebar when ready
  function tryOrganize(attempt = 1) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.children.length > 0) {
      organizeStudentSidebar();
    } else if (attempt < 20) {
      setTimeout(() => tryOrganize(attempt + 1), 500);
    }
  }
  // Start trying
  setTimeout(() => tryOrganize(1), 1500);
  
  // Also try when page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!document.querySelector('.sidebar-section')) {
        organizeStudentSidebar();
      }
    }, 2000);
  });
})();
