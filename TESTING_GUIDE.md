# Testing Guide - VK Video Downloader

This guide will help you test all features of the VK Video Downloader extension.

## Pre-Testing Checklist

- [ ] Extension installed and enabled in Chrome
- [ ] Logged into VK.com account
- [ ] Browser console open for debugging (F12)

## Test Cases

### Test 1: Installation and Basic Setup

**Objective:** Verify extension loads correctly

**Steps:**
1. Open `chrome://extensions/`
2. Verify "VK Video Downloader" is listed
3. Check status is "Enabled"
4. Verify icon is displayed correctly

**Expected Result:**
- ✅ Extension appears in the list
- ✅ No error messages
- ✅ Icon loads properly

---

### Test 2: Content Script Loading

**Objective:** Verify content script initializes on VK pages

**Steps:**
1. Open [vk.com](https://vk.com)
2. Open browser console (F12)
3. Look for initialization message

**Expected Result:**
- ✅ Console shows: "VK Video Downloader initialized"
- ✅ No JavaScript errors

---

### Test 3: Video Detection in News Feed

**Objective:** Test video detection in main feed

**Steps:**
1. Go to [vk.com](https://vk.com) (main page)
2. Scroll through the news feed
3. Find a post with video
4. Look for download button under video

**Expected Result:**
- ✅ Download button "⬇️ Скачать" appears under video
- ✅ Button is styled correctly (blue color #4a69bd)
- ✅ Button appears within 2-3 seconds

---

### Test 4: Video Detection in Profile

**Objective:** Test video detection on user/group profile

**Steps:**
1. Navigate to any user profile with videos
2. Go to "Видео" (Videos) section
3. Check each video for download button

**Expected Result:**
- ✅ All videos have download buttons
- ✅ Buttons positioned correctly

---

### Test 5: Video Detection in Messages

**Objective:** Test video detection in chat messages

**Steps:**
1. Open VK Messages (vk.com/im)
2. Find a conversation with video message
3. Check for download button

**Expected Result:**
- ✅ Download button appears for video messages
- ✅ Button size appropriate for message context

---

### Test 6: Dynamic Content Loading

**Objective:** Test MutationObserver for lazy-loaded videos

**Steps:**
1. Go to news feed
2. Scroll down to load more content
3. Check new videos for download buttons

**Expected Result:**
- ✅ New videos get download buttons automatically
- ✅ No duplicate buttons on existing videos

---

### Test 7: Download Functionality

**Objective:** Test actual video download

**Steps:**
1. Find any video with download button
2. Click "⬇️ Скачать" button
3. Watch button state change
4. Check Chrome downloads (chrome://downloads/)

**Expected Result:**
- ✅ Button changes to "✅ Загружается"
- ✅ Download starts in browser
- ✅ File appears in downloads with correct name
- ✅ Button returns to "⬇️ Скачать" after 2 seconds

---

### Test 8: Multiple Videos Download

**Objective:** Test downloading multiple videos

**Steps:**
1. Find page with multiple videos (3-5 videos)
2. Click download buttons on all videos
3. Monitor downloads

**Expected Result:**
- ✅ All downloads start successfully
- ✅ Each file has unique name
- ✅ No conflicts or errors

---

### Test 9: Filename Generation

**Objective:** Verify proper filename generation

**Steps:**
1. Download a video
2. Check the filename in downloads folder

**Expected Result:**
- ✅ Filename format: `[title]_YYYY-MM-DD.mp4` or `vk_video_YYYY-MM-DD_[timestamp].mp4`
- ✅ No invalid characters in filename
- ✅ File extension is `.mp4`

---

### Test 10: Error Handling - No Video URL

**Objective:** Test graceful degradation when video URL not found

**Steps:**
1. Scroll through multiple videos
2. Note if some videos don't have download buttons
3. Check console for errors

**Expected Result:**
- ✅ No JavaScript errors in console
- ✅ Videos without extractable URLs are skipped silently
- ✅ Other videos still get buttons

---

### Test 11: Error Handling - HLS Streams

**Objective:** Verify HLS streams are handled correctly

**Steps:**
1. Find a video that uses HLS (m3u8) streaming
2. Check if button appears
3. Check console messages

**Expected Result:**
- ✅ Console shows: "HLS stream detected, skipping"
- ✅ No download button for HLS videos
- ✅ No errors thrown

---

### Test 12: Button Duplication Prevention

**Objective:** Ensure no duplicate buttons appear

**Steps:**
1. Load a page with videos
2. Wait for buttons to appear
3. Refresh the page (F5)
4. Wait for buttons to re-appear
5. Count buttons per video

**Expected Result:**
- ✅ Each video has exactly ONE download button
- ✅ No duplicate buttons after refresh

---

### Test 13: Performance - Many Videos

**Objective:** Test performance with many videos

**Steps:**
1. Go to a page with many videos (10+)
2. Scroll through entire page
3. Monitor browser performance
4. Check CPU usage

**Expected Result:**
- ✅ Page remains responsive
- ✅ No significant CPU spike
- ✅ No memory leaks
- ✅ All videos get buttons

---

### Test 14: Different Video Contexts

**Objective:** Test in various VK contexts

**Steps:**
Test download buttons in:
- [ ] News feed
- [ ] User profile videos
- [ ] Group videos
- [ ] Messages with video
- [ ] Video attachments in posts
- [ ] Shared videos
- [ ] Stories (if applicable)

**Expected Result:**
- ✅ Works in all supported contexts
- ✅ Consistent behavior across contexts

---

### Test 15: Background Service Worker

**Objective:** Verify service worker processes downloads correctly

**Steps:**
1. Open `chrome://extensions/`
2. Find VK Video Downloader
3. Click "Service Worker" link
4. Initiate a download
5. Watch console logs

**Expected Result:**
- ✅ Service worker logs: "Received message: {action: 'downloadVideo'...}"
- ✅ Service worker logs: "Initiating download"
- ✅ Service worker logs: "Download started with ID: ..."
- ✅ No errors in service worker console

---

### Test 16: Permission Handling

**Objective:** Verify extension has correct permissions

**Steps:**
1. Go to `chrome://extensions/`
2. Click "Details" on VK Video Downloader
3. Check "Permissions" section

**Expected Result:**
- ✅ Has permission: "Download files to your computer"
- ✅ Has permission: "Read and change your data on vk.com"
- ✅ No unnecessary permissions

---

### Test 17: Styling and UI Integration

**Objective:** Verify visual integration with VK

**Steps:**
1. Find videos in different contexts
2. Check button styling
3. Test hover effects
4. Test click feedback

**Expected Result:**
- ✅ Button color matches VK theme (#4a69bd)
- ✅ Hover effect works (darker blue)
- ✅ Button positioned naturally
- ✅ Responsive on mobile viewport

---

### Test 18: Cross-Browser Compatibility

**Objective:** Test on different Chromium browsers

**Test on:**
- [ ] Google Chrome
- [ ] Microsoft Edge
- [ ] Brave
- [ ] Opera

**Expected Result:**
- ✅ Works consistently across browsers

---

### Test 19: Different Video Qualities

**Objective:** Verify highest quality is downloaded

**Steps:**
1. Find a video with multiple quality options
2. Download the video
3. Check downloaded video quality

**Expected Result:**
- ✅ Downloads highest available quality (720p > 480p > 360p > 240p)

---

### Test 20: Edge Case - Protected Videos

**Objective:** Test with restricted access videos

**Steps:**
1. Find a video from a closed group (where you have access)
2. Try to download
3. Find a video from a closed group (no access)
4. Check behavior

**Expected Result:**
- ✅ Downloads videos where you have access
- ✅ Gracefully fails for inaccessible videos

---

## Performance Benchmarks

### Load Time
- Extension initialization: < 500ms
- Video detection: < 2 seconds
- Button injection: < 100ms per video

### Memory Usage
- Idle: < 5 MB
- Active (10 videos): < 15 MB
- No memory leaks over time

### CPU Usage
- Idle: < 1%
- Scanning: < 5% (brief spike)
- Downloading: < 1%

---

## Common Issues and Solutions

### Issue: Button doesn't appear

**Troubleshooting:**
1. Refresh the page (F5)
2. Check console for errors
3. Verify extension is enabled
4. Clear browser cache
5. Reload extension

### Issue: Download fails

**Troubleshooting:**
1. Check internet connection
2. Verify download permissions
3. Check available disk space
4. Try different video
5. Check service worker logs

### Issue: Duplicate buttons

**Troubleshooting:**
1. Reload extension
2. Clear site data
3. Restart browser

---

## Reporting Issues

When reporting bugs, include:
- Browser version
- Extension version
- Console errors (screenshot)
- Steps to reproduce
- Expected vs actual behavior
- Video URL (if public)

---

## Test Results Template

```
Test Date: _______________
Browser: _________________
Extension Version: 1.0.0

Test Results:
[ ] Test 1: Installation - PASS/FAIL
[ ] Test 2: Content Script - PASS/FAIL
[ ] Test 3: News Feed - PASS/FAIL
[ ] Test 4: Profile - PASS/FAIL
[ ] Test 5: Messages - PASS/FAIL
[ ] Test 6: Dynamic Loading - PASS/FAIL
[ ] Test 7: Download - PASS/FAIL
[ ] Test 8: Multiple Downloads - PASS/FAIL
[ ] Test 9: Filenames - PASS/FAIL
[ ] Test 10: Error Handling - PASS/FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Last Updated:** 2024
**Version:** 1.0
