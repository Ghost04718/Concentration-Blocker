// blocked.js
chrome.storage.sync.get(['blockedSites'], function(result) {
  const sites = result.blockedSites || {};
  const url = window.location.hostname;
  let foundCategory = null;
  
  for (const category in sites) {
    if (sites[category].sites && sites[category].sites.includes(url)) {
      foundCategory = category;
      break;
    }
  }
  
  if (foundCategory) {
    document.getElementById('category').textContent = `Category: ${foundCategory}`;
  } else {
    document.getElementById('category').style.display = 'none';
  }
});