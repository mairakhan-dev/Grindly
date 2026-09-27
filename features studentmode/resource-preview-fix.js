(function() {
    'use strict';

    console.log('📁 Student Resource Preview fix loading...');

    function getResources() {
        if (typeof resources !== 'undefined' && resources.length) return resources;
        try {
            const classCode = localStorage.getItem('studentCurrentClass') || '';
            const data = localStorage.getItem(`class_${classCode}_resources`);
            if (data) return JSON.parse(data);
        } catch (e) {}
        return [];
    }

    function createModal() {
        if (document.getElementById('studentResourceModal')) return;

        const modal = document.createElement('div');
        modal.id = 'studentResourceModal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 9999;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(4px);
        `;
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px; max-height:90vh; overflow-y:auto; background: var(--card); border-radius: var(--radius-lg); padding: var(--spacing-xl); position: relative; border: 1px solid var(--border);">
                <button class="modal-close" onclick="document.getElementById('studentResourceModal').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                <h3 id="studentResourceModalTitle" style="margin-bottom:12px;font-weight:700;">Resource</h3>
                <div id="studentResourceModalBody"></div>
                <div id="studentResourceModalActions" style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });

        console.log('✅ Resource modal created.');
    }

    // Use the existing openResourcePopup (no comments) – but we can keep this for fallback
    // We'll keep the global function intact, but ensure it doesn't show comments.

    function attachDirectListeners() {
        document.addEventListener('click', function(e) {
            const previewBtn = e.target.closest('.student-preview-btn, [onclick*="openResourcePopup"]');
            if (previewBtn) {
                const card = previewBtn.closest('.classroom-item');
                if (card) {
                    const resourceId = card.dataset.resourceId || card.dataset.id;
                    if (resourceId) {
                        e.preventDefault();
                        window.openResourcePopup(resourceId);
                    }
                }
            }
        });
        console.log('✅ Direct click listeners attached.');
    }

    function init() {
        createModal();
        setTimeout(attachDirectListeners, 500);
        console.log('✅ Student resource preview fix ready (no comments).');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
