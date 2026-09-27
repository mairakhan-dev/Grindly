// Force all referral links to use grindlylearn.com
(function() {
    console.log('🔗 Force updating all referral links to grindlylearn.com...');
    
    // Override the copyReferralLink function completely
    window.copyReferralLink = function() {
        const userId = localStorage.getItem('studentUserId') || currentUserId || '';
        const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
        
        navigator.clipboard.writeText(link).then(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`✅ Referral link copied: ${link}`, "success");
            } else {
                alert(`Referral link copied: ${link}`);
            }
        }).catch(() => {
            if (typeof window.showNotification === 'function') {
                window.showNotification(`📋 Copy manually: ${link}`, "info");
            } else {
                alert(`Copy manually: ${link}`);
            }
        });
        
        console.log("📤 Referral link copied:", link);
        return link;
    };
    
    // Override the markReferral function to ensure it uses the correct domain
    const originalMarkReferral = window.markReferral;
    window.markReferral = async function() {
        const userId = localStorage.getItem('studentUserId') || currentUserId || '';
        const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
        
        // Copy the correct link
        await navigator.clipboard.writeText(link);
        
        if (typeof window.showNotification === 'function') {
            window.showNotification(`✅ Referral link copied! Share: ${link}`, "success");
        }
        
        if (!userId) {
            if (typeof window.showNotification === 'function') {
                window.showNotification("Referral not available yet. Try again in a moment.", "warning");
            }
            return;
        }
        
        try {
            if (window.database && userId) {
                const serverCountRaw = await window.firebaseGet(`users/${userId}/referralCount`);
                const serverCount = Math.min(parseInt(serverCountRaw || 0, 10) || 0, 3);
                const localCount = parseInt(localStorage.getItem('studentPremiumReferrals') || '0', 10);
                
                if (serverCount > localCount) {
                    localStorage.setItem('studentPremiumReferrals', serverCount.toString());
                    if (typeof window.updateReferralUI === 'function') window.updateReferralUI();
                    if (typeof window.showNotification === 'function') {
                        window.showNotification("Referral counted!", "success");
                    }
                } else {
                    if (typeof window.showNotification === 'function') {
                        window.showNotification("Referral not verified yet. Your friend must open your link and log a study session.", "warning");
                    }
                }
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification("Referral link copied! Share with friends.", "success");
                }
            }
        } catch (e) {
            console.warn("Failed to verify referral:", e);
            if (typeof window.showNotification === 'function') {
                window.showNotification("Referral link copied! Share with friends.", "success");
            }
        }
    };
    
    // Update any existing buttons that call copyReferralLink
    setTimeout(() => {
        // Find all buttons that might call copyReferralLink
        const allButtons = document.querySelectorAll('[onclick*="copyReferralLink"], [onclick*="markReferral"]');
        allButtons.forEach(btn => {
            const originalOnclick = btn.getAttribute('onclick');
            if (originalOnclick && originalOnclick.includes('copyReferralLink')) {
                btn.setAttribute('onclick', 'copyReferralLink()');
            }
            if (originalOnclick && originalOnclick.includes('markReferral')) {
                btn.setAttribute('onclick', 'markReferral()');
            }
        });
        
        // Update modal content
        const modal = document.getElementById('referralModal');
        if (modal) {
            const modalText = modal.querySelector('.referral-modal-text');
            if (modalText) {
                const userId = localStorage.getItem('studentUserId') || currentUserId || '';
                const link = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
                modalText.innerHTML = `Refer Grindly Learn to 3 friends. The theme unlocks when they log their first study session.<br><br>
                <strong>Your referral link:</strong><br>
                <code style="background: var(--bg); padding: 8px; border-radius: 8px; display: inline-block; word-break: break-all; font-size: 0.75rem;">${link}</code>`;
            }
        }
        
        console.log('✅ All referral links now use grindlylearn.com');
    }, 1000);
    
    // Also update the referral link in the profile section
    const updateProfileReferral = setInterval(() => {
        const profileSection = document.getElementById('profile');
        if (profileSection && profileSection.style.display !== 'none') {
            const referralLinkElement = document.querySelector('.referral-link-display, #referralLinkDisplay, .copy-referral-link');
            if (referralLinkElement) {
                const userId = localStorage.getItem('studentUserId') || currentUserId || '';
                referralLinkElement.textContent = `https://grindlylearn.com/studentmode.html?ref=${encodeURIComponent(userId)}`;
            }
        }
    }, 2000);
    
    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(updateProfileReferral), 10000);
})();
