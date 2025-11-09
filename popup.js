// VK Video Downloader - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Reload button functionality
  const reloadBtn = document.getElementById('reloadBtn');
  
  if (reloadBtn) {
    reloadBtn.addEventListener('click', function() {
      chrome.runtime.reload();
    });
  }

  // Get statistics from storage (optional future feature)
  chrome.storage.local.get(['downloadCount'], function(result) {
    const count = result.downloadCount || 0;
    if (count > 0) {
      console.log('Total downloads:', count);
    }
  });
});
