// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // UI Elements
  const currentUrlDiv = document.getElementById('currentUrl');
  const blockCurrentButton = document.getElementById('blockCurrent');
  const categorySelect = document.getElementById('categorySelect');
  const categoriesDiv = document.getElementById('categories');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const categoryModal = document.getElementById('categoryModal');
  const categoryNameInput = document.getElementById('categoryName');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let currentTab = null;

  // Show toast notification
  function showToast(message, type = 'success', duration = 3000) {
    toastMessage.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.className = 'toast';
    }, duration);
  }

  // Load current tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      const url = new URL(currentTab.url);
      currentUrlDiv.textContent = url.hostname;
      
      // Check if site is blocked
      chrome.storage.sync.get(['blockedSites'], function(result) {
        const sites = result.blockedSites || {};
        let isBlocked = false;
        let blockedCategory = '';
        
        for (const category in sites) {
          if (sites[category].sites && sites[category].sites.includes(url.hostname)) {
            isBlocked = true;
            blockedCategory = category;
            break;
          }
        }
        
        updateBlockButton(isBlocked, blockedCategory);
      });
    }
  });

  function loadData() {
    chrome.storage.sync.get(['categories', 'blockedSites'], function(result) {
      const categories = result.categories || [];
      const sites = result.blockedSites || {};

      // Update category select
      categorySelect.innerHTML = '<option value="">Select category...</option>';
      categories.forEach(category => {
        if (!sites[category] || sites[category].enabled !== false) {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categorySelect.appendChild(option);
        }
      });

      // Update categories list
      categoriesDiv.innerHTML = '';
      if (categories.length === 0) {
        categoriesDiv.innerHTML = `
          <div class="empty-state">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>No categories yet</span>
          </div>`;
        return;
      }

      categories.forEach(category => {
        const categoryData = sites[category] || { sites: [], enabled: true };
        const sitesList = categoryData.sites || [];
        const isEnabled = categoryData.enabled !== false;

        const categoryEl = document.createElement('div');
        categoryEl.className = `category ${isEnabled ? 'enabled' : 'disabled'}`;
        
        categoryEl.innerHTML = `
          <div class="category-header">
            <div class="category-name">
              <div class="category-title">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                ${category}
                <span class="site-count">${sitesList.length}</span>
              </div>
              <div class="category-controls">
                <label class="toggle" data-tooltip="${isEnabled ? 'Disable category' : 'Enable category'}">
                  <input type="checkbox" ${isEnabled ? 'checked' : ''} data-category="${category}">
                  <span class="toggle-slider"></span>
                </label>
                <button class="danger icon" data-category="${category}" data-tooltip="Delete category">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          ${sitesList.length === 0 ? 
            `<div class="empty-state">No blocked sites</div>` :
            `<ul class="site-list">
              ${sitesList.map(site => `
                <li class="site-item">
                  <div class="site-domain">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    ${site}
                  </div>
                  <button class="danger icon" data-site="${site}" data-category="${category}" data-tooltip="Unblock site">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18"></path>
                      <path d="M6 6l12 12"></path>
                    </svg>
                  </button>
                </li>
              `).join('')}
            </ul>`
          }
        `;

        // Add event listeners
        const toggleInput = categoryEl.querySelector('.toggle input');
        toggleInput.addEventListener('change', () => {
          toggleCategory(category, toggleInput.checked);
        });

        const deleteBtn = categoryEl.querySelector('.category-header .danger');
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Delete category "${category}" and unblock all its sites?`)) {
            deleteCategory(category);
          }
        });

        const unblockBtns = categoryEl.querySelectorAll('.site-list button');
        unblockBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            removeSite(btn.dataset.site, btn.dataset.category);
          });
        });

        categoriesDiv.appendChild(categoryEl);
      });
    });
  }

  function toggleCategory(category, enabled) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const sites = result.blockedSites || {};
      if (!sites[category]) {
        sites[category] = { sites: [], enabled: enabled };
      } else {
        sites[category].enabled = enabled;
      }
      
      chrome.storage.sync.set({ blockedSites: sites }, function() {
        loadData();
        showToast(`${category} ${enabled ? 'enabled' : 'disabled'}`);
      });
    });
  }

  function addSite(site, category) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const sites = result.blockedSites || {};
      if (!sites[category]) {
        sites[category] = { sites: [], enabled: true };
      }
      if (!sites[category].sites.includes(site)) {
        sites[category].sites.push(site);
        chrome.storage.sync.set({ blockedSites: sites }, function() {
          loadData();
          updateBlockButton(true, category);
          showToast(`Blocked ${site}`);
        });
      }
    });
  }

  function removeSite(site, category) {
    chrome.storage.sync.get(['blockedSites'], function(result) {
      const sites = result.blockedSites || {};
      if (sites[category] && sites[category].sites) {
        sites[category].sites = sites[category].sites.filter(s => s !== site);
        chrome.storage.sync.set({ blockedSites: sites }, function() {
          loadData();
          if (currentTab && new URL(currentTab.url).hostname === site) {
            updateBlockButton(false);
          }
          showToast(`Unblocked ${site}`);
        });
      }
    });
  }

  function addCategory(categoryName) {
    chrome.storage.sync.get(['categories', 'blockedSites'], function(result) {
      const categories = result.categories || [];
      const sites = result.blockedSites || {};
      
      if (categories.includes(categoryName)) {
        showToast('Category already exists', 'error');
        return;
      }
      
      categories.push(categoryName);
      sites[categoryName] = { sites: [], enabled: true };
      
      chrome.storage.sync.set({ 
        categories: categories,
        blockedSites: sites 
      }, function() {
        loadData();
        showToast('Category added');
      });
    });
  }

  function deleteCategory(category) {
    chrome.storage.sync.get(['categories', 'blockedSites'], function(result) {
      const categories = result.categories || [];
      const sites = result.blockedSites || {};
      
      delete sites[category];
      const newCategories = categories.filter(c => c !== category);
      
      chrome.storage.sync.set({
        categories: newCategories,
        blockedSites: sites
      }, function() {
        loadData();
        showToast(`Deleted category "${category}"`);
      });
    });
  }

  function updateBlockButton(isBlocked, category = '') {
    const icon = blockCurrentButton.querySelector('.icon');
    if (isBlocked) {
      blockCurrentButton.textContent = 'Unblock';
      blockCurrentButton.className = 'danger';
      blockCurrentButton.setAttribute('data-tooltip', `Blocked in "${category}"`);
      icon.innerHTML = '<path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>';
    } else {
      blockCurrentButton.textContent = 'Block';
      blockCurrentButton.className = '';
      blockCurrentButton.removeAttribute('data-tooltip');
      icon.innerHTML = '<path d="M18 6L6 18"></path><path d="M6 6l12 12"></path>';
    }
    blockCurrentButton.prepend(icon);
  }

  // Event Listeners
  blockCurrentButton.addEventListener('click', function() {
    if (!currentTab) return;
    
    const hostname = new URL(currentTab.url).hostname;
    const selectedCategory = categorySelect.value;
    
    if (blockCurrentButton.textContent === 'Block') {
      if (!selectedCategory) {
        showToast('Please select a category', 'error');
        categorySelect.focus();
        return;
      }
      addSite(hostname, selectedCategory);
    } else {
      chrome.storage.sync.get(['blockedSites'], function(result) {
        const sites = result.blockedSites || {};
        for (const category in sites) {
          if (sites[category].sites && sites[category].sites.includes(hostname)) {
            removeSite(hostname, category);
            break;
          }
        }
      });
    }
  });

  // Category Modal
  addCategoryBtn.addEventListener('click', () => {
    categoryModal.classList.add('active');
    categoryNameInput.focus();
  });

  document.getElementById('cancelCategory').addEventListener('click', () => {
    categoryModal.classList.remove('active');
    categoryNameInput.value = '';
  });

  document.getElementById('saveCategory').addEventListener('click', () => {
    const categoryName = categoryNameInput.value.trim();
    if (categoryName) {
      addCategory(categoryName);
      categoryModal.classList.remove('active');
      categoryNameInput.value = '';
    } else {
      showToast('Please enter a category name', 'error');
      categoryNameInput.focus();
    }
  });

  // Close modal when clicking outside
  categoryModal.addEventListener('click', (e) => {
    if (e.target === categoryModal) {
      categoryModal.classList.remove('active');
      categoryNameInput.value = '';
    }
  });

  // Enter key in modal input
  categoryNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('saveCategory').click();
    }
  });

  // Initial load
  loadData();
});