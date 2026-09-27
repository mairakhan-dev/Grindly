// ========== STUDENT CLASSROOM ENHANCEMENTS (NO COMMENTS) ==========

let currentResourceData = null;

// ========== RESOURCE POPUP ==========
function openResourcePopup(resourceId, resourceTitle, resourceDesc, resourceUrl, resourceFileData, resourceFileName, resourceFileSize) {
    const overlay = document.createElement('div');
    overlay.className = 'student-popup-overlay';
    overlay.id = 'resourcePopup';
    
    let previewHtml = '';
    
    if (resourceFileData && resourceFileName) {
        const fileExt = resourceFileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
        const isPdf = fileExt === 'pdf';
        
        currentResourceData = { fileData: resourceFileData, fileName: resourceFileName };
        
        if (isImage) {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>🖼️ Image Preview:</strong>
                    <div style="margin-top: 12px;">
                        <img src="${resourceFileData}" alt="${resourceFileName}">
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                        📎 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download Image
                    </button>
                </div>
            `;
        } else if (isPdf) {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>📄 PDF Preview:</strong>
                    <div style="margin-top: 12px;">
                        <iframe src="${resourceFileData}"></iframe>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                        📎 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download PDF
                    </button>
                </div>
            `;
        } else {
            previewHtml = `
                <div class="file-preview-container">
                    <strong>📎 Attached File:</strong>
                    <div style="margin-top: 12px;">
                        📄 ${resourceFileName} (${Math.round(resourceFileSize / 1024)} KB)
                    </div>
                    <button class="download-btn" onclick="downloadCurrentResource()">
                        📥 Download File
                    </button>
                </div>
            `;
        }
    } else if (resourceUrl) {
        previewHtml = `
            <div style="background: var(--bg); padding: 16px; border-radius: 16px; margin: 16px 0;">
                <strong>🔗 Resource Link:</strong>
                <div style="margin-top: 8px; word-break: break-all;">
                    <a href="${resourceUrl}" target="_blank" style="color: var(--accent);">${resourceUrl}</a>
                </div>
                <button class="link-btn" onclick="window.open('${resourceUrl}', '_blank')">
                    🔗 Open Link
                </button>
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div class="student-popup">
            <div class="student-popup-header">
                <button class="student-popup-close" onclick="closeResourcePopup()">×</button>
                <h3>📄 ${escapeHtml(resourceTitle)}</h3>
            </div>
            <div class="student-popup-body">
                <div style="background: var(--bg); padding: 16px; border-radius: 16px;">
                    <strong>📝 Description:</strong>
                    <p style="margin-top: 8px; line-height: 1.6;">${escapeHtml(resourceDesc || 'No description provided')}</p>
                </div>
                ${previewHtml}
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function closeResourcePopup() {
    const overlay = document.getElementById('resourcePopup');
    if (overlay) overlay.remove();
    currentResourceData = null;
}

function downloadCurrentResource() {
    if (currentResourceData && currentResourceData.fileData) {
        const link = document.createElement('a');
        link.href = currentResourceData.fileData;
        link.download = currentResourceData.fileName;
        link.click();
        showNotification("Download started!", "success");
    }
}

// Helper: escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ENHANCE EXISTING LOAD TEACHER CONTENT ==========

// Store original function
const originalLoadTeacherContent = window.loadTeacherContent;

// Override to add preview buttons (no comments)
window.loadTeacherContent = async function() {
    // Call original first
    if (originalLoadTeacherContent) {
        await originalLoadTeacherContent();
    }
    
    // Now enhance the existing DOM elements
    setTimeout(() => {
        enhanceResourcesSection();
        enhanceAnnouncementsSection();
    }, 100);
};

function enhanceResourcesSection() {
    const resourcesDiv = document.getElementById('teacherResources');
    if (!resourcesDiv) return;
    
    const resourceItems = resourcesDiv.querySelectorAll('.classroom-item');
    
    resourceItems.forEach((item, index) => {
        if (item.hasAttribute('data-enhanced')) return;
        item.setAttribute('data-enhanced', 'true');
        
        const titleEl = item.querySelector('.classroom-item-title');
        const contentEl = item.querySelector('.classroom-item-content');
        const linkEl = item.querySelector('.classroom-item-link');
        
        const resourceTitle = titleEl?.textContent || 'Resource';
        const resourceDesc = contentEl?.querySelector('p')?.textContent || '';
        const resourceUrl = linkEl?.href || '';
        
        let resourceId = `resource_${Date.now()}_${index}`;
        const existingId = item.getAttribute('data-resource-id');
        if (existingId) resourceId = existingId;
        item.setAttribute('data-resource-id', resourceId);
        
        let resourceData = null;
        if (window.resources) {
            resourceData = resources.find(r => r.title === resourceTitle);
            if (resourceData) resourceId = resourceData.id;
        }
        
        let actionsContainer = item.querySelector('.resource-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'student-classroom-actions';
            actionsContainer.style.marginTop = '12px';
            item.appendChild(actionsContainer);
        }
        
        // Add preview button only
        const previewBtn = document.createElement('button');
        previewBtn.className = 'student-preview-btn';
        previewBtn.innerHTML = '👁️ Preview';
        previewBtn.onclick = (e) => {
            e.stopPropagation();
            if (resourceData) {
                openResourcePopup(
                    resourceData.id,
                    resourceData.title,
                    resourceData.description,
                    resourceData.url,
                    resourceData.fileData,
                    resourceData.fileName,
                    resourceData.fileSize
                );
            } else {
                openResourcePopup(
                    resourceId,
                    resourceTitle,
                    resourceDesc,
                    resourceUrl,
                    null, null, null
                );
            }
        };
        
        actionsContainer.innerHTML = '';
        actionsContainer.appendChild(previewBtn);
        
        // Apply modern styling
        item.classList.add('student-classroom-card');
        const oldHeader = item.querySelector('.classroom-item-header');
        if (oldHeader) oldHeader.classList.add('student-classroom-header');
        if (titleEl) titleEl.classList.add('student-classroom-title');
        const dateEl = item.querySelector('.classroom-item-date');
        if (dateEl) dateEl.classList.add('student-classroom-date');
        if (contentEl) contentEl.classList.add('student-classroom-content');
    });
}

function enhanceAnnouncementsSection() {
    const announcementsDiv = document.getElementById('teacherAnnouncements');
    if (!announcementsDiv) return;
    
    const announcementItems = announcementsDiv.querySelectorAll('.classroom-item');
    
    announcementItems.forEach((item, index) => {
        if (item.hasAttribute('data-announcement-enhanced')) return;
        item.setAttribute('data-announcement-enhanced', 'true');
        
        const titleEl = item.querySelector('.classroom-item-title');
        const contentEl = item.querySelector('.classroom-item-content');
        
        const announcementTitle = titleEl?.textContent || 'Announcement';
        const announcementContent = contentEl?.textContent || '';
        const announcementId = `announcement_${Date.now()}_${index}`;
        
        // Apply modern styling (no comments)
        item.classList.add('student-classroom-card');
        const oldHeader = item.querySelector('.classroom-item-header');
        if (oldHeader) oldHeader.classList.add('student-classroom-header');
        if (titleEl) titleEl.classList.add('student-classroom-title');
        const dateEl = item.querySelector('.classroom-item-date');
        if (dateEl) dateEl.classList.add('student-classroom-date');
        if (contentEl) contentEl.classList.add('student-classroom-content');
    });
}

// Run enhancement after page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('teacherResources')) {
            enhanceResourcesSection();
            enhanceAnnouncementsSection();
        }
    }, 2000);
});

console.log("✅ Student classroom enhancement loaded - resources now have Preview buttons (no comments)");

