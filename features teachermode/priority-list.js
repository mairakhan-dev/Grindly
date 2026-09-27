(function() {
  // Function to add priority list
  function addPriorityList() {
    console.log('📋 Adding Priority List to Toolkit...');
    
    // Find all content cards
    const contentCards = document.querySelectorAll('.content-card');
    let toolkitCard = null;
    
    // Loop through cards to find Teacher Toolkit
    for (let i = 0; i < contentCards.length; i++) {
      const card = contentCards[i];
      const header = card.querySelector('.content-header h2');
      if (header && header.textContent && header.textContent.includes('Teacher Toolkit')) {
        toolkitCard = card;
        break;
      }
    }
    
    if (!toolkitCard) {
      console.log('❌ Teacher Toolkit not found - will retry');
      return false;
    }
    
    // Check if priority list already exists
    if (document.getElementById('priority-list-feature')) {
      console.log('✅ Priority List already exists');
      return true;
    }
    
    // Get the content body
    const contentBody = toolkitCard.querySelector('.content-body');
    if (!contentBody) return false;
    
    // Find the grid inside content body
    const grid = contentBody.querySelector('div[style*="display: grid"]');
    if (!grid) return false;
    
    // Create priority list container
    const priorityDiv = document.createElement('div');
    priorityDiv.id = 'priority-list-feature';
    priorityDiv.className = 'priority-list-container';
    
    // Add to the end of grid - this will make it same size as other cards
    grid.appendChild(priorityDiv);
    
    // Get class code for storage
    const classCode = window.currentClassCode || 'default';
    const storageKey = `teacher_priorities_${classCode}`;
    
    // Load saved priorities
    let priorities = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        priorities = JSON.parse(saved);
      } else {
        // Sample data for demo
        priorities = [
          { id: '1', text: 'Grade math quizzes', completed: false },
          { id: '2', text: 'Prepare lesson plan', completed: true },
          { id: '3', text: 'Email parents', completed: false }
        ];
        localStorage.setItem(storageKey, JSON.stringify(priorities));
      }
    } catch (e) {
      priorities = [];
    }
    
    // Save function
    function savePriorities() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(priorities));
      } catch (e) {}
    }
    
    // Render function
    function render() {
      const total = priorities.length;
      const completed = priorities.filter(p => p.completed).length;
      const pending = total - completed;
      
      // Generate items HTML
      let itemsHtml = '';
      
      if (total === 0) {
        itemsHtml = `
          <div class="priority-empty">
            <div class="priority-empty-icon">📋</div>
            <div class="priority-empty-text">No priorities yet. Add your first task!</div>
          </div>
        `;
      } else {
        priorities.forEach(p => {
          itemsHtml += `
            <div class="priority-item" id="priority-${p.id}">
              <div class="priority-item-left">
                <input type="checkbox" ${p.completed ? 'checked' : ''} onchange="window.togglePriority('${p.id}')">
                <span class="${p.completed ? 'completed' : ''}" title="${escapeHtml(p.text)}">${escapeHtml(p.text)}</span>
              </div>
              <div class="priority-item-actions">
                <button onclick="window.editPriority('${p.id}')" title="Edit">✏️</button>
                <button class="delete-btn" onclick="window.deletePriority('${p.id}')" title="Delete">🗑️</button>
              </div>
            </div>
          `;
        });
      }
      
      // Set HTML - FIXED STATS DISPLAY
      priorityDiv.innerHTML = `
        <h3>Priority List</h3>
        
        <div class="priority-input-area">
          <input type="text" id="priority-input-field" placeholder="Add a focus item...">
          <button id="priority-add-btn">Add</button>
        </div>
        
        <div class="priority-items">
          ${itemsHtml}
        </div>
        
        <div class="priority-footer">
          <div class="priority-stats">
            <div class="priority-stat">📋 <span>${total}</span></div>
            <div class="priority-stat">✅ <span>${completed}</span></div>
            <div class="priority-stat">⏳ <span>${pending}</span></div>
          </div>
          <button class="priority-clear-btn" ${completed === 0 ? 'disabled' : ''} id="priority-clear-btn">
            Clear Completed
          </button>
        </div>
      `;
      
      // Add event listeners
      const input = document.getElementById('priority-input-field');
      const addBtn = document.getElementById('priority-add-btn');
      const clearBtn = document.getElementById('priority-clear-btn');
      
      if (input) {
        input.removeEventListener('keypress', handleInputKeypress);
        input.addEventListener('keypress', handleInputKeypress);
      }
      
      if (addBtn) {
        addBtn.removeEventListener('click', handleAddClick);
        addBtn.addEventListener('click', handleAddClick);
      }
      
      if (clearBtn) {
        clearBtn.removeEventListener('click', handleClearClick);
        clearBtn.addEventListener('click', handleClearClick);
      }
    }
    
    // Event handlers
    function handleInputKeypress(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const input = document.getElementById('priority-input-field');
        if (input) addPriority(input.value);
      }
    }
    
    function handleAddClick() {
      const input = document.getElementById('priority-input-field');
      if (input) addPriority(input.value);
    }
    
    function handleClearClick() {
      const completedCount = priorities.filter(p => p.completed).length;
      if (completedCount === 0) return;
      
      if (confirm(`Clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
        priorities = priorities.filter(p => !p.completed);
        savePriorities();
        render();
        
        if (window.showNotification) {
          window.showNotification(`✅ Cleared ${completedCount} tasks`, 'success');
        }
      }
    }
    
    // Helper functions
    function addPriority(text) {
      text = text.trim();
      if (!text) return;
      
      priorities.push({
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: text,
        completed: false
      });
      
      savePriorities();
      render();
      
      // Clear input
      const input = document.getElementById('priority-input-field');
      if (input) input.value = '';
      
      if (window.showNotification) {
        window.showNotification('✅ Priority added', 'success');
      }
    }
    
    window.togglePriority = function(id) {
      const item = priorities.find(p => p.id === id);
      if (item) {
        item.completed = !item.completed;
        savePriorities();
        render();
      }
    };
    
    window.editPriority = function(id) {
      const item = priorities.find(p => p.id === id);
      if (!item) return;
      
      const newText = prompt('Edit priority:', item.text);
      if (newText && newText.trim()) {
        item.text = newText.trim();
        savePriorities();
        render();
        
        if (window.showNotification) {
          window.showNotification('✏️ Priority updated', 'success');
        }
      }
    };
    
    window.deletePriority = function(id) {
      if (!confirm('Delete this priority?')) return;
      
      priorities = priorities.filter(p => p.id !== id);
      savePriorities();
      render();
      
      if (window.showNotification) {
        window.showNotification('🗑️ Priority deleted', 'info');
      }
    };
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Initial render
    render();
    console.log('✅ Priority List added successfully');
    return true;
  }
  
  // Try multiple times to add the priority list
  function tryAddPriorityList(attempts = 0) {
    if (attempts > 20) {
      console.log('❌ Failed to add Priority List after 20 attempts');
      return;
    }
    
    const success = addPriorityList();
    
    if (!success) {
      console.log(`⏳ Toolkit not ready, retry ${attempts + 1}/20...`);
      setTimeout(() => tryAddPriorityList(attempts + 1), 1000);
    }
  }
  
  // Start trying to add when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => tryAddPriorityList(), 2000);
    });
  } else {
    setTimeout(() => tryAddPriorityList(), 2000);
  }
  
  // Also try when URL changes or after any dynamic content loads
  window.addEventListener('load', () => {
    setTimeout(() => tryAddPriorityList(), 3000);
  });
})();