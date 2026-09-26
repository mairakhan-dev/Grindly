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
