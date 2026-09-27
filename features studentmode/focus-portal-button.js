(function() {
    console.log('🌀 Adding Focus Portal button to mobile nav...');
    
    function addFocusPortalToMobileNav() {
        const mobileNavControls = document.getElementById('mobileNavControls');
        if (!mobileNavControls) {
            console.log('Mobile nav controls not found');
            return false;
        }
        
        // Check if button already exists
        if (document.getElementById('focusPortalNavBtn')) {
            console.log('Focus Portal button already exists');
            return true;
        }
        
        // Create Focus Portal button
        const focusBtn = document.createElement('button');
        focusBtn.className = 'btn focus-portal-nav-btn';
        focusBtn.id = 'focusPortalNavBtn';
        focusBtn.onclick = function(e) {
            e.preventDefault();
            if (window.playSound) window.playSound('select');
            openFocusPortalFromNav();
        };
        
        // Add icon and text
        focusBtn.innerHTML = '<span>🌀 FOCUS</span>';
        
        // Insert after refresh button or at the end
        const refreshBtn = mobileNavControls.querySelector('.btn-secondary');
        if (refreshBtn) {
            refreshBtn.insertAdjacentElement('afterend', focusBtn);
        } else {
            mobileNavControls.appendChild(focusBtn);
        }
        
        console.log('✅ Focus Portal button added to mobile nav');
        return true;
    }
    
    // Function to open focus portal from nav
    window.openFocusPortalFromNav = function() {
        // Check if focus mode is already on
        if (document.body.classList.contains('focus-mode')) {
            // If in focus mode, maybe show a message or just focus on it
            const focusPanel = document.querySelector('.focus-mode-panel');
            if (focusPanel) {
                focusPanel.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }
        
        // Toggle focus mode
        if (window.toggleFocusMode) {
            window.toggleFocusMode();
        } else {
            // Fallback if function not available
            console.log('Focus mode toggle not available');
            createFocusPortalModal();
        }
    };
    
    // Fallback focus portal modal
    function createFocusPortalModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('focusPortalModal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'focusPortalModal';
        modal.className = 'character-modal';
        modal.innerHTML = `
            <div class="character-select-card" style="max-width: 500px; background: linear-gradient(135deg, #1e1a3a, #2a1a4a);">
                <div class="character-select-title">🌀 FOCUS PORTAL</div>
                <div style="color: #fbbf24; margin: 20px 0; font-size: 18px;">
                    ⚡ ENHANCED FOCUS MODE ⚡
                </div>
                <div style="color: #94a3b8; margin-bottom: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0;">
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⏰</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Timer</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔊</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Sounds</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Brain Dump</div>
                        </div>
                        <div style="background: rgba(0,0,0,0.6); border: 2px solid #8b5cf6; border-radius: 15px; padding: 15px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔒</div>
                            <div style="color: #8b5cf6; font-weight: 700;">Lock In</div>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="action-btn" style="padding: 15px 30px; background: linear-gradient(135deg, #333, #222);" onclick="closeFocusPortalModal()">CLOSE</button>
                    <button class="ultimate-btn" style="padding: 15px 30px;" onclick="toggleFocusModeFromModal()">ENTER FOCUS</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeFocusPortalModal();
        });
    }
    
    // Close modal function
    window.closeFocusPortalModal = function() {
        const modal = document.getElementById('focusPortalModal');
        if (modal) modal.remove();
        if (window.playSound) window.playSound('select');
    };
    
    // Toggle focus from modal
    window.toggleFocusModeFromModal = function() {
        closeFocusPortalModal();
        if (window.toggleFocusMode) {
            window.toggleFocusMode();
        } else {
            // Manual toggle
            document.body.classList.toggle('focus-mode');
            const focusPanel = document.querySelector('.focus-mode-panel');
            if (focusPanel) {
                focusPanel.style.display = 'block';
                focusPanel.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    
    // Try to add button when DOM is ready
    function tryAddButton(attempt = 1) {
        const mobileNav = document.getElementById('mobileNavControls');
        if (mobileNav && mobileNav.children.length > 0) {
            addFocusPortalToMobileNav();
        } else if (attempt < 20) {
            setTimeout(() => tryAddButton(attempt + 1), 500);
        }
    }
    
    // Start trying
    setTimeout(() => tryAddButton(1), 1000);
    
    // Also try when switching sections
    const originalShowSection = window.showSection;
    if (originalShowSection) {
        window.showSection = function(sectionId) {
            originalShowSection(sectionId);
            setTimeout(() => {
                if (!document.getElementById('focusPortalNavBtn')) {
                    addFocusPortalToMobileNav();
                }
            }, 500);
        };
    }
    
    // Handle resize events to ensure button fits
    window.addEventListener('resize', function() {
        const btn = document.getElementById('focusPortalNavBtn');
        if (!btn) return;
        
        if (window.innerWidth <= 359) {
            btn.innerHTML = '<span>🌀</span>';
        } else {
            btn.innerHTML = '<span>🌀 FOCUS</span>';
        }
    });
    
    console.log('🌀 Focus Portal button script loaded');
})();