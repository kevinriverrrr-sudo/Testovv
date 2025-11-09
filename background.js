// VK Video Downloader - Background Service Worker
// Handles download requests from content script

console.log('VK Video Downloader background service worker started');

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename) {
  if (!filename) {
    return `vk_video_${Date.now()}`;
  }
  
  // Remove invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 200); // Limit length
}

/**
 * Generate filename for video
 */
function generateFilename(title) {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const dateStr = date.toISOString().split('T')[0];
  
  if (title) {
    const sanitized = sanitizeFilename(title);
    return `${sanitized}_${dateStr}.mp4`;
  }
  
  return `vk_video_${dateStr}_${timestamp}.mp4`;
}

/**
 * Download video file
 */
async function downloadVideo(url, title) {
  try {
    const filename = generateFilename(title);
    
    console.log('Initiating download:', {
      url,
      filename
    });

    // Use chrome.downloads API to download the file
    const downloadId = await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false,
      conflictAction: 'uniquify'
    });

    console.log('Download started with ID:', downloadId);

    return {
      success: true,
      downloadId: downloadId,
      filename: filename
    };

  } catch (error) {
    console.error('Download error:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);

  if (request.action === 'downloadVideo') {
    const { url, title } = request;

    if (!url) {
      sendResponse({
        success: false,
        error: 'No URL provided'
      });
      return true;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      sendResponse({
        success: false,
        error: 'Invalid URL'
      });
      return true;
    }

    // Initiate download
    downloadVideo(url, title)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('Error in downloadVideo:', error);
        sendResponse({
          success: false,
          error: error.message || 'Download failed'
        });
      });

    // Return true to indicate async response
    return true;
  }

  return false;
});

/**
 * Monitor download progress
 */
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state) {
    if (delta.state.current === 'complete') {
      console.log('Download completed:', delta.id);
    } else if (delta.state.current === 'interrupted') {
      console.error('Download interrupted:', delta.id);
    }
  }

  if (delta.error) {
    console.error('Download error for', delta.id, ':', delta.error);
  }
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('VK Video Downloader installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Extension installed for the first time');
  } else if (details.reason === 'update') {
    console.log('Extension updated from version:', details.previousVersion);
  }
});

/**
 * Keep service worker alive
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, service worker active');
});
