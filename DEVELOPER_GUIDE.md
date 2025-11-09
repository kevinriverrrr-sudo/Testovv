# Developer Guide - VK Video Downloader

## 🎯 For Developers

This guide is for developers who want to understand, modify, or contribute to the VK Video Downloader extension.

## 📚 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Code Walkthrough](#code-walkthrough)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Building & Packaging](#building--packaging)
7. [Debugging](#debugging)
8. [Contributing](#contributing)

## Architecture Overview

### Extension Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CHROME BROWSER                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           VK.COM PAGE (Content Context)            │ │
│  │                                                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │       content.js (Content Script)            │ │ │
│  │  │  • Scans DOM for video elements              │ │ │
│  │  │  • Extracts video URLs (7 methods)           │ │ │
│  │  │  • Injects download buttons                  │ │ │
│  │  │  • Handles user interactions                 │ │ │
│  │  │  • Uses MutationObserver                     │ │ │
│  │  │  • Prevents duplicates (WeakSet)             │ │ │
│  │  └──────────────────┬───────────────────────────┘ │ │
│  │                     │                              │ │
│  │                     │ chrome.runtime.sendMessage   │ │
│  │                     ↓                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │       background.js (Service Worker)               │ │
│  │  • Listens for download requests                   │ │
│  │  • Validates URLs                                  │ │
│  │  • Generates filenames                             │ │
│  │  • Uses chrome.downloads API                       │ │
│  │  • Monitors download progress                      │ │
│  │  • Handles errors                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           popup.html/js (Extension UI)             │ │
│  │  • User interface                                  │ │
│  │  • Extension info                                  │ │
│  │  • Quick actions                                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Visits VK.com
        ↓
Content Script Loads
        ↓
Scan for Videos (MutationObserver)
        ↓
Extract Video URLs (Multiple Methods)
        ↓
Inject Download Buttons
        ↓
User Clicks Button
        ↓
Send Message to Background
        ↓
Background Initiates Download
        ↓
Video Saved to Disk
        ↓
Update Button Status
```

## File Structure

```
vk-video-downloader/
│
├── manifest.json              # Extension configuration
│   ├── Manifest V3 settings
│   ├── Permissions
│   ├── Content scripts
│   └── Background worker
│
├── content.js                 # Content script (main logic)
│   ├── Video detection
│   ├── URL extraction
│   ├── Button injection
│   └── MutationObserver
│
├── background.js              # Service worker
│   ├── Message handler
│   ├── Download manager
│   └── Error handler
│
├── styles.css                 # UI styling
│   ├── Button styles
│   ├── Hover effects
│   └── Responsive design
│
├── popup.html                 # Extension popup
│   └── User interface
│
├── popup.js                   # Popup logic
│   └── UI interactions
│
├── icons/                     # Extension icons
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
│
├── README.md                  # User documentation
├── DEVELOPER_GUIDE.md         # This file
├── TESTING_GUIDE.md           # Testing procedures
└── validate.sh                # Validation script
```

## Code Walkthrough

### manifest.json

```json
{
  "manifest_version": 3,           // MV3 (latest standard)
  "permissions": [
    "downloads",                    // Required for downloading
    "storage"                       // For user preferences
  ],
  "host_permissions": [
    "*://*.vk.com/*",               // VK main domain
    "*://*.vk.ru/*",                // VK alternate domain
    "*://*.userapi.com/*"           // VK CDN for videos
  ],
  "content_scripts": [{
    "matches": ["*://*.vk.com/*"],  // Inject on VK pages
    "js": ["content.js"],
    "run_at": "document_end"        // After DOM loads
  }],
  "background": {
    "service_worker": "background.js" // MV3 service worker
  }
}
```

### content.js - Key Components

#### 1. Video Detection Selectors

```javascript
const selectors = [
  'video',                      // Standard video tags
  '.VideoMessage',              // Video messages
  '.video_item',                // Video items
  '.VideoCard',                 // Video cards
  '.AttachmentRedesign__video', // Attachment videos
  '.wall_video_item',           // Wall videos
  '[data-video]'                // Data attribute videos
];
```

#### 2. URL Extraction Methods

```javascript
function extractVideoUrl(element) {
  // Method 1: <video> src attribute
  // Method 2: data-video JSON
  // Method 3: data attributes
  // Method 4: Script tags
  // Method 5: onclick handlers
  // Method 6: Global VK object
  // Method 7: Parent elements
}
```

#### 3. MutationObserver Setup

```javascript
const observer = new MutationObserver((mutations) => {
  // Debounced scanning for new videos
  clearTimeout(scanTimeout);
  scanTimeout = setTimeout(scanForVideos, 500);
});

observer.observe(document.body, {
  childList: true,  // Watch for added/removed nodes
  subtree: true     // Watch entire tree
});
```

#### 4. Duplicate Prevention

```javascript
// WeakSet allows garbage collection
const processedVideos = new WeakSet();

function processVideoElement(element) {
  if (processedVideos.has(element)) return;
  // ... process video
  processedVideos.add(element);
}
```

### background.js - Key Components

#### 1. Message Handler

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVideo') {
    downloadVideo(request.url, request.title)
      .then(result => sendResponse(result));
    return true; // Async response
  }
});
```

#### 2. Download Manager

```javascript
async function downloadVideo(url, title) {
  const filename = generateFilename(title);
  
  const downloadId = await chrome.downloads.download({
    url: url,
    filename: filename,
    conflictAction: 'uniquify'
  });
  
  return { success: true, downloadId };
}
```

## Development Workflow

### Setup Development Environment

```bash
# Clone repository
git clone <repository-url>
cd vk-video-downloader

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select project directory
```

### Making Changes

```bash
# 1. Edit files
vim content.js

# 2. Validate changes
./validate.sh

# 3. Reload extension
# Go to chrome://extensions/ and click reload icon

# 4. Test on VK.com
# Open vk.com and test functionality
```

### Code Style Guidelines

#### JavaScript
```javascript
// Use IIFE for content scripts
(function() {
  'use strict';
  // Your code
})();

// Use const/let, not var
const CONFIG = { ... };
let state = { ... };

// Use arrow functions
const processVideo = (element) => { ... };

// Use template literals
const filename = `video_${timestamp}.mp4`;

// Handle errors gracefully
try {
  // Risky code
} catch (error) {
  console.error('Error:', error);
  return null;
}
```

#### CSS
```css
/* Use specific class names */
.vk-video-download-btn { }

/* Use modern CSS */
.button {
  transition: all 0.3s ease;
  transform: translateY(-2px);
}

/* Mobile-first responsive */
@media (max-width: 768px) { }
```

## Testing

### Manual Testing Checklist

```bash
# 1. Run validation
./validate.sh

# 2. Test video detection
# - Open vk.com
# - Check console for "VK Video Downloader initialized"
# - Verify buttons appear under videos

# 3. Test downloads
# - Click download button
# - Verify download starts
# - Check filename in downloads

# 4. Test edge cases
# - HLS videos (should skip)
# - Protected videos
# - Dynamic content (scroll)
# - Multiple videos
```

### Automated Validation

```bash
# Run validation script
./validate.sh

# Expected output:
# ✅ All checks passed! Extension is ready.
```

### Debugging Techniques

#### Content Script Debugging
```javascript
// Add console logs
console.log('Video detected:', element);
console.log('Extracted URL:', videoUrl);

// Check Chrome DevTools
// F12 → Console tab
// Filter by "VK Video Downloader"
```

#### Service Worker Debugging
```javascript
// Background script logs
console.log('Download request:', request);

// View service worker console
// chrome://extensions/ → "Service Worker" link
```

## Building & Packaging

### Create Distribution Package

```bash
# Run package script
./package.sh

# Output: vk-video-downloader-v1.0.0.zip
```

### Manual Packaging

```bash
# Create ZIP with essential files
zip -r extension.zip \
  manifest.json \
  content.js \
  background.js \
  styles.css \
  popup.html \
  popup.js \
  icons/ \
  LICENSE \
  README.md
```

## Debugging

### Common Issues

#### Issue: Button doesn't appear

**Debug steps:**
```javascript
// 1. Check if content script loads
console.log('Content script loaded');

// 2. Check video detection
console.log('Videos found:', document.querySelectorAll('video').length);

// 3. Check URL extraction
const url = extractVideoUrl(element);
console.log('Extracted URL:', url);
```

#### Issue: Download fails

**Debug steps:**
```javascript
// 1. Check message sending
chrome.runtime.sendMessage({...}, (response) => {
  console.log('Response:', response);
  if (chrome.runtime.lastError) {
    console.error('Error:', chrome.runtime.lastError);
  }
});

// 2. Check background script
// View service worker console
console.log('Download initiated:', url);
```

### Performance Profiling

```javascript
// Measure video detection time
console.time('scanForVideos');
scanForVideos();
console.timeEnd('scanForVideos');

// Monitor memory usage
console.log('Processed videos:', processedVideos);
```

## Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Make changes**
4. **Test thoroughly**
   ```bash
   ./validate.sh
   # Manual testing on VK.com
   ```
5. **Commit with clear messages**
   ```bash
   git commit -m "Add: New video detection method"
   ```
6. **Submit pull request**

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] No console errors
- [ ] Validation script passes
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] No performance regressions
- [ ] Edge cases handled

## API Reference

### Chrome Extension APIs Used

#### chrome.downloads
```javascript
// Download file
chrome.downloads.download({
  url: string,
  filename: string,
  conflictAction: 'uniquify'|'overwrite'|'prompt'
});

// Monitor progress
chrome.downloads.onChanged.addListener(callback);
```

#### chrome.runtime
```javascript
// Send message
chrome.runtime.sendMessage(message, callback);

// Listen for messages
chrome.runtime.onMessage.addListener(callback);

// Reload extension
chrome.runtime.reload();
```

#### chrome.storage
```javascript
// Save data
chrome.storage.local.set({key: value});

// Retrieve data
chrome.storage.local.get(['key'], callback);
```

## Resources

### Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Downloads API](https://developer.chrome.com/docs/extensions/reference/downloads/)

### Tools
- [Chrome Extensions Debugger](chrome://extensions/)
- [Service Worker Inspector](chrome://serviceworker-internals/)
- [Extension Manifest Validator](https://chrome.google.com/webstore/devconsole)

## Version Control

### Commit Message Format

```
Type: Brief description

Detailed explanation (if needed)

Affects: affected-file.js
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Modify existing feature
- `Remove:` Delete feature
- `Docs:` Documentation only
- `Style:` Code formatting
- `Refactor:` Code restructuring
- `Test:` Testing changes

## License

MIT License - See LICENSE file

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Maintainer:** VK Video Downloader Team
