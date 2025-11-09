// VK Video Downloader - Content Script
// Detects videos on VK pages and adds download buttons

(function() {
  'use strict';

  // Set to track videos that already have download buttons
  const processedVideos = new WeakSet();
  
  // Configuration
  const CONFIG = {
    buttonText: '⬇️ Скачать',
    buttonColor: '#4a69bd',
    checkInterval: 1000,
    selectors: {
      // Various video containers on VK
      videoElements: [
        'video',
        '.VideoMessage',
        '.video_item',
        '.VideoCard',
        '.AttachmentRedesign__video',
        '.wall_video_item',
        '.videoplayer',
        '[data-video]',
        '.im-mess-video',
        '.feed_video',
        '.VideoGridItem'
      ]
    }
  };

  /**
   * Extract video URL from various VK video data structures
   */
  function extractVideoUrl(element) {
    try {
      // Method 1: Check for video tag with src
      const videoTag = element.tagName === 'VIDEO' ? element : element.querySelector('video');
      if (videoTag && videoTag.src && !videoTag.src.includes('blob:')) {
        return videoTag.src;
      }

      // Method 2: Check data-video attribute
      const dataVideo = element.getAttribute('data-video');
      if (dataVideo) {
        try {
          const videoData = JSON.parse(dataVideo);
          if (videoData.url_720 || videoData.url_480 || videoData.url_360 || videoData.url_240) {
            return videoData.url_720 || videoData.url_480 || videoData.url_360 || videoData.url_240;
          }
        } catch (e) {
          // Try to extract URL from string
          const urlMatch = dataVideo.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
          if (urlMatch) {
            return urlMatch[1];
          }
        }
      }

      // Method 3: Check for data attributes with video info
      for (const attr of element.attributes) {
        if (attr.name.includes('data') && attr.value) {
          try {
            const parsed = JSON.parse(attr.value);
            if (parsed.url_720 || parsed.url_480 || parsed.url_360 || parsed.url_240) {
              return parsed.url_720 || parsed.url_480 || parsed.url_360 || parsed.url_240;
            }
          } catch (e) {
            // Try to find URL in the attribute value
            const urlMatch = attr.value.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
            if (urlMatch) {
              return urlMatch[1];
            }
          }
        }
      }

      // Method 4: Search in nearby script tags or data
      const parent = element.closest('.video_item, .VideoCard, .wall_video_item, .AttachmentRedesign__video, .VideoGridItem');
      if (parent) {
        const scripts = parent.querySelectorAll('script');
        for (const script of scripts) {
          const urlMatch = script.textContent.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
          if (urlMatch) {
            return urlMatch[1];
          }
        }
      }

      // Method 5: Check for onclick handlers or data-options
      const onclick = element.getAttribute('onclick') || element.getAttribute('data-options');
      if (onclick) {
        const urlMatch = onclick.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
        if (urlMatch) {
          return urlMatch[1];
        }
      }

      // Method 6: Look for video player data in global VK object
      const videoId = element.getAttribute('data-video-id') || 
                      element.getAttribute('data-id') ||
                      element.getAttribute('id');
      
      if (videoId && typeof window.cur !== 'undefined') {
        // Try to find in window object
        const videoInfo = findVideoInWindow(videoId);
        if (videoInfo) {
          return videoInfo;
        }
      }

      // Method 7: Check parent elements for video data
      let currentElement = element;
      for (let i = 0; i < 5; i++) {
        currentElement = currentElement.parentElement;
        if (!currentElement) break;

        for (const attr of currentElement.attributes || []) {
          if (attr.value && attr.value.includes('.mp4')) {
            const urlMatch = attr.value.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
            if (urlMatch) {
              return urlMatch[1];
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting video URL:', error);
      return null;
    }
  }

  /**
   * Search for video URL in window object
   */
  function findVideoInWindow(videoId) {
    try {
      // This is a best-effort approach as VK's internal structure may vary
      if (typeof window.vkVideo !== 'undefined' && window.vkVideo[videoId]) {
        const video = window.vkVideo[videoId];
        return video.url_720 || video.url_480 || video.url_360 || video.url_240;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get video title for filename
   */
  function getVideoTitle(element) {
    try {
      // Try to find title in various places
      const parent = element.closest('.video_item, .VideoCard, .wall_video_item, .AttachmentRedesign__video, .VideoGridItem');
      if (parent) {
        const titleElement = parent.querySelector('.video_item__title, .VideoCard__title, .wall_video_title');
        if (titleElement) {
          return titleElement.textContent.trim();
        }
      }

      // Check data attributes
      const dataVideo = element.getAttribute('data-video');
      if (dataVideo) {
        try {
          const videoData = JSON.parse(dataVideo);
          if (videoData.title) {
            return videoData.title;
          }
        } catch (e) {}
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create and inject download button
   */
  function createDownloadButton(videoUrl, title) {
    const button = document.createElement('button');
    button.className = 'vk-video-download-btn';
    button.textContent = CONFIG.buttonText;
    button.setAttribute('data-vk-downloader', 'true');
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Send message to background script to initiate download
      chrome.runtime.sendMessage({
        action: 'downloadVideo',
        url: videoUrl,
        title: title
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          button.textContent = '❌ Ошибка';
          setTimeout(() => {
            button.textContent = CONFIG.buttonText;
          }, 2000);
        } else if (response && response.success) {
          button.textContent = '✅ Загружается';
          setTimeout(() => {
            button.textContent = CONFIG.buttonText;
          }, 2000);
        } else {
          button.textContent = '❌ Ошибка';
          setTimeout(() => {
            button.textContent = CONFIG.buttonText;
          }, 2000);
        }
      });
    });

    return button;
  }

  /**
   * Find appropriate place to insert download button
   */
  function insertDownloadButton(element, button) {
    try {
      // Find the best container for the button
      const container = element.closest('.video_item, .VideoCard, .wall_video_item, .AttachmentRedesign__video, .VideoGridItem, .im-mess-video, .VideoMessage');
      
      if (container) {
        // Check if button already exists
        if (container.querySelector('[data-vk-downloader="true"]')) {
          return false;
        }

        // Try to find action bar or controls
        let actionBar = container.querySelector('.video_item__actions, .VideoCard__actions, .wall_video_actions');
        
        if (actionBar) {
          actionBar.appendChild(button);
          return true;
        }

        // Create action bar if not exists
        const newActionBar = document.createElement('div');
        newActionBar.className = 'vk-video-download-actions';
        newActionBar.appendChild(button);
        
        // Try to insert after video element
        const videoElement = container.querySelector('video, .video_item_player, .VideoPlayer');
        if (videoElement && videoElement.parentNode) {
          videoElement.parentNode.insertBefore(newActionBar, videoElement.nextSibling);
          return true;
        }

        // Fallback: append to container
        container.appendChild(newActionBar);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error inserting download button:', error);
      return false;
    }
  }

  /**
   * Process a single video element
   */
  function processVideoElement(element) {
    // Skip if already processed
    if (processedVideos.has(element)) {
      return;
    }

    // Check if this element or its container already has a download button
    const container = element.closest('.video_item, .VideoCard, .wall_video_item, .AttachmentRedesign__video, .VideoGridItem, .im-mess-video, .VideoMessage');
    if (container && container.querySelector('[data-vk-downloader="true"]')) {
      processedVideos.add(element);
      return;
    }

    const videoUrl = extractVideoUrl(element);
    
    if (videoUrl) {
      // Check if it's an HLS stream
      if (videoUrl.includes('.m3u8')) {
        console.log('HLS stream detected, skipping:', videoUrl);
        processedVideos.add(element);
        return;
      }

      const title = getVideoTitle(element);
      const button = createDownloadButton(videoUrl, title);
      
      if (insertDownloadButton(element, button)) {
        processedVideos.add(element);
      }
    } else {
      // Mark as processed even if no URL found to avoid repeated attempts
      processedVideos.add(element);
    }
  }

  /**
   * Scan page for video elements
   */
  function scanForVideos() {
    const selectors = CONFIG.selectors.videoElements.join(', ');
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach(element => {
      try {
        processVideoElement(element);
      } catch (error) {
        console.error('Error processing video element:', error);
      }
    });
  }

  /**
   * Initialize MutationObserver for dynamic content
   */
  function initMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldScan = true;
          break;
        }
      }

      if (shouldScan) {
        // Debounce scanning
        clearTimeout(window.vkVideoScanTimeout);
        window.vkVideoScanTimeout = setTimeout(scanForVideos, 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  /**
   * Initialize the extension
   */
  function init() {
    console.log('VK Video Downloader initialized');
    
    // Initial scan
    scanForVideos();
    
    // Set up mutation observer for dynamic content
    initMutationObserver();
    
    // Periodic scan as fallback
    setInterval(scanForVideos, CONFIG.checkInterval * 3);
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
