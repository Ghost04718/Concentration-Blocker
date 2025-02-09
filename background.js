// background.js
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  chrome.storage.sync.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || {};
    const url = new URL(details.url);
    
    for (const category in sites) {
      // Check if category is enabled and has sites array
      if (sites[category].enabled && 
          sites[category].sites && 
          sites[category].sites.includes(url.hostname)) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL('blocked.html')
        });
        break;
      }
    }
  });
});