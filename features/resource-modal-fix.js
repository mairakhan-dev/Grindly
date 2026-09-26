  // ================================================================
// ========== FIX: Resource Modal & Functions ==========
// ================================================================
(function() {
    'use strict';

    // ----- Ensure Resource Modal HTML exists -----
    function ensureResourceModal() {
        // Check if modal already exists
        if (document.getElementById('resourceViewModal')) return;

        // Create the modal HTML if missing
        const modalHTML = `
            <div id="resourceViewModal" class="modal" style="display:none;">
                <div class="modal-content" style="max-width:600px; max-height:90vh; overflow-y:auto; background:var(--card); border-radius:var(--radius-lg); padding:var(--spacing-xl); position:relative; border:1px solid var(--border);">
                    <button class="modal-close" onclick="document.getElementById('resourceViewModal').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                    <h3 id="resourceModalTitle" style="margin-bottom:12px;">Resource</h3>
                    <div id="resourceModalBody"></div>
                    <div id="resourceModalActions" style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Also ensure the "Create Resource" modal exists
        if (!document.getElementById('createResourceModalNew')) {
            const createModal = `
                <div id="createResourceModalNew" class="modal" style="display:none;">
                    <div class="modal-content" style="max-width:500px;">
                        <button class="modal-close" onclick="document.getElementById('createResourceModalNew').style.display='none'" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--text-muted);">&times;</button>
                        <div class="modal-header"><h3>📁 Add New Resource</h3></div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="modalResourceTitleNew">Title *</label>
                                <input type="text" id="modalResourceTitleNew" placeholder="Resource title...">
                            </div>
                            <div class="form-group">
                                <label for="modalResourceDescNew">Description (Optional)</label>
                                <textarea id="modalResourceDescNew" placeholder="Describe this resource..." rows="3"></textarea>
                            </div>
                            <div style="margin:var(--spacing-md) 0;text-align:center;color:var(--text-muted);">— OR —</div>
                            <div class="form-group">
                                <label for="modalResourceUrlNew">Resource URL</label>
                                <input type="url" id="modalResourceUrlNew" placeholder="https://example.com">
                            </div>
                            <div style="text-align:center;margin:var(--spacing-sm) 0;color:var(--text-muted);">or</div>
                            <div class="form-group">
                                <label for="modalResourceFileNew">Upload File</label>
                                <input type="file" id="modalResourceFileNew" accept="image/*,.pdf,.doc,.docx,.txt">
                                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Max 5MB.</div>
                            </div>
                            <div id="filePreviewNew" style="display:none;margin-top:var(--spacing-sm);padding:var(--spacing-sm);background:var(--accent-light);border-radius:var(--radius);">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <span>📎</span>
                                    <span id="fileNamePreviewNew"></span>
                                    <span id="fileSizePreviewNew" style="font-size:0.75rem;"></span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-xl);">
                            <button class="btn btn-secondary" onclick="document.getElementById('createResourceModalNew').style.display='none'">Cancel</button>
                            <button class="btn btn-primary" onclick="window.addResourceEnhanced()">➕ Add Resource</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', createModal);
        }

        console.log('✅ Resource modals ensured.');
    }

    // ----- Safe versions of functions -----
    window.showCreateResourceModal = function() {
        ensureResourceModal();
        const modal = document.getElementById('createResourceModalNew');
        if (!modal) { alert('Modal not found.'); return; }
        // Reset fields
        const fields = ['modalResourceTitleNew', 'modalResourceDescNew', 'modalResourceUrlNew', 'modalResourceFileNew'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'file') el.value = '';
                else el.value = '';
            }
        });
        document.getElementById('filePreviewNew').style.display = 'none';
        modal.style.display = 'flex';
    };

    window.openResourceModal = function(resourceId) {
        ensureResourceModal();
        const modal = document.getElementById('resourceViewModal');
        if (!modal) { alert('Modal not found.'); return; }
        // Find resource
        let resource = null;
        if (typeof resources !== 'undefined') {
            resource = resources.find(r => r.id === resourceId);
        }
        if (!resource) {
            // Try to find from DOM or fallback
            const title = document.getElementById('resourceModalTitle');
            if (title) title.textContent = 'Resource not found';
            document.getElementById('resourceModalBody').innerHTML = '<p>Resource details not available.</p>';
            document.getElementById('resourceModalActions').innerHTML = '';
            modal.style.display = 'flex';
            return;
        }

        document.getElementById('resourceModalTitle').textContent = resource.title || 'Resource';
        let bodyHtml = `
            <div style="background:var(--bg);padding:var(--spacing-md);border-radius:var(--radius);margin-bottom:16px;">
                <strong>📄 Description:</strong>
                <p style="margin-top:8px;line-height:1.6;">${resource.description || 'No description provided.'}</p>
            </div>
        `;
        let actionsHtml = '';

        if (resource.fileData && resource.fileName) {
            const ext = resource.fileName.split('.').pop().toLowerCase();
            const isImage = ['jpg','jpeg','png','gif','webp','svg'].includes(ext);
            const isPdf = ext === 'pdf';
            if (isImage) {
                bodyHtml += `
                    <div style="background:var(--bg);padding:var(--spacing-md);border-radius:var(--radius);margin-bottom:16px;text-align:center;">
                        <strong>🖼️ Preview:</strong>
                        <div style="margin-top:8px;"><img src="${resource.fileData}" alt="${resource.fileName}" style="max-width:100%;max-height:300px;border-radius:var(--radius);"></div>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">📎 ${resource.fileName} (${Math.round(resource.fileSize/1024)} KB)</div>
                    </div>
                `;
                actionsHtml += `<button class="btn btn-primary" onclick="window.open('${resource.fileData}','_blank')">📥 Open Image</button>`;
            } else if (isPdf) {
                bodyHtml += `
                    <div style="background:var(--bg);padding:var(--spacing-md);border-radius:var(--radius);margin-bottom:16px;">
                        <strong>📄 PDF Preview:</strong>
                        <iframe src="${resource.fileData}" style="width:100%;height:400px;border:none;border-radius:var(--radius);margin-top:8px;"></iframe>
                        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px;">📎 ${resource.fileName} (${Math.round(resource.fileSize/1024)} KB)</div>
                    </div>
                `;
                actionsHtml += `<button class="btn btn-primary" onclick="window.open('${resource.fileData}','_blank')">📥 Open PDF</button>`;
            } else {
                bodyHtml += `
                    <div style="background:var(--bg);padding:var(--spacing-md);border-radius:var(--radius);margin-bottom:16px;">
                        <strong>📎 Attached File:</strong>
                        <div style="margin-top:8px;">${resource.fileName} (${Math.round(resource.fileSize/1024)} KB)</div>
                    </div>
                `;
                actionsHtml += `<button class="btn btn-primary" onclick="window.open('${resource.fileData}','_blank')">📥 Download</button>`;
            }
        } else if (resource.url) {
            bodyHtml += `
                <div style="background:var(--bg);padding:var(--spacing-md);border-radius:var(--radius);margin-bottom:16px;">
                    <strong>🔗 Resource Link:</strong>
                    <div style="margin-top:8px;word-break:break-all;"><a href="${resource.url}" target="_blank" style="color:var(--accent);">${resource.url}</a></div>
                </div>
            `;
            actionsHtml += `<button class="btn btn-primary" onclick="window.open('${resource.url}','_blank')">🔗 Open Link</button>`;
        }

        document.getElementById('resourceModalBody').innerHTML = bodyHtml;
        document.getElementById('resourceModalActions').innerHTML = actionsHtml;
        modal.style.display = 'flex';
    };

    // Also fix addResourceEnhanced to use the correct modal
    if (typeof addResourceEnhanced === 'function') {
        const originalAdd = addResourceEnhanced;
        window.addResourceEnhanced = function() {
            // Ensure modal exists
            ensureResourceModal();
            // Call original
            originalAdd();
        };
    }

    // ----- Run on load -----
    document.addEventListener('DOMContentLoaded', function() {
        ensureResourceModal();
        // Override any broken showResourceModal if exists
        if (typeof showCreateResourceModal !== 'function') {
            window.showCreateResourceModal = window.showCreateResourceModal || function() {
                ensureResourceModal();
                document.getElementById('createResourceModalNew').style.display = 'flex';
            };
        }
        console.log('✅ Resource modal fix applied.');
    });

    // If already loaded, run now
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        ensureResourceModal();
    }

})();