(function() {
    'use strict';
    
    // Store original functions
    const originalToggleFocusMode = window.toggleFocusMode;
    
    // Enhanced toggle function
    window.toggleFocusMode = function() {
        const isEntering = !document.body.classList.contains('focus-mode');
        
        if (originalToggleFocusMode) {
            originalToggleFocusMode();
        } else {
            document.body.classList.toggle('focus-mode');
        }
        
        if (isEntering) {
            // Entering focus mode
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Scroll to top
            window.scrollTo(0, 0);
            document.querySelector('.main-content')?.scrollTo(0, 0);
            
            // Force hide all dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.setProperty('display', 'none', 'important');
                });
            }, 10);
        } else {
            // Exiting focus mode
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // Restore dashboard content
            setTimeout(() => {
                document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
                    if (el) el.style.removeProperty('display');
                });
            }, 10);
        }
    };
    
    // Handle keyboard shortcut
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key.toLowerCase() === 'f') {
            if (document.activeElement?.tagName.match(/^(INPUT|TEXTAREA|SELECT)$/i)) {
                return;
            }
            e.preventDefault();
            window.toggleFocusMode();
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', function() {
        if (document.body.classList.contains('focus-mode')) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    });
    
    // Handle touch events to prevent pull-to-refresh
    document.addEventListener('touchmove', function(e) {
        if (document.body.classList.contains('focus-mode')) {
            const mainContent = document.querySelector('.main-content');
            const focusPanel = document.querySelector('.focus-mode-panel');
            
            if (mainContent && focusPanel) {
                const isScrollingDown = e.targetTouches[0].clientY > e.targetTouches[0].clientY;
                const atTop = mainContent.scrollTop <= 0;
                
                if (atTop && isScrollingDown) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
    
    // Ensure proper state on page load
    if (document.body.classList.contains('focus-mode')) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        document.querySelectorAll('.dashboard-header, .dashboard-grid, .footer, .quick-stats, .content-card, .form-card, .streak-card, .motivation-card, .pro-tip, .controls-bar, .stats-overview-cards, .charts-container, .toast-container, .feedback-btn, .chatbot-fab, .student-view-bar, .mobile-nav-controls').forEach(el => {
            if (el) el.style.setProperty('display', 'none', 'important');
        });
    }
})();