# Testing Guide - Auto Register Form Filler Extension

This document outlines the testing procedures to ensure the extension works correctly across different browsers and scenarios.

## Pre-Installation Testing

### File Validation
- [x] `manifest.json` is valid JSON
- [x] All JavaScript files have valid syntax
- [x] HTML files are well-formed
- [x] CSS files have no syntax errors
- [x] All required icon files exist (16, 32, 48, 128 px)

## Installation Testing

### Chrome/Edge
1. Navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. **Expected**: Extension loads without errors
6. **Expected**: Extension icon appears in toolbar
7. **Expected**: Extension shows in list with name "Auto Register Form Filler"

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select `manifest.json` from extension folder
4. **Expected**: Extension loads without errors
5. **Expected**: Extension icon appears in toolbar
6. **Expected**: Extension shows in list as temporary add-on

## Functional Testing

### Test 1: Local Test Page

#### Setup
1. Open `test-page.html` in browser (may need to enable file:// access in extension settings)
2. Open browser DevTools Console

#### Test Cases
- [ ] Button appears on page within 1 second of loading
- [ ] Button has text "✨ Auto Register"
- [ ] Button has gradient purple styling
- [ ] Button is positioned at the top of the form
- [ ] Clicking button fills all three fields
- [ ] Name field: 5-15 characters, capitalized
- [ ] Email field: valid email format with recognized domain
- [ ] Password field: 8+ characters with mixed content
- [ ] Toast notification appears on successful fill
- [ ] Notification auto-dismisses after 3 seconds
- [ ] Clicking button again generates new values
- [ ] Values are different each time
- [ ] No errors in console
- [ ] Form validation passes (submit button enabled)

### Test 2: Target Website

#### Setup
1. Navigate to `https://panel.rogen.wtf/auth/register`
2. Open browser DevTools Console

#### Test Cases
- [ ] Button appears on page
- [ ] Button integrates well with site design
- [ ] All form fields are detected correctly
- [ ] Clicking button fills all required fields
- [ ] Generated data is valid and realistic
- [ ] Form validation passes
- [ ] Toast notification appears
- [ ] Can regenerate multiple times
- [ ] No JavaScript errors in console
- [ ] No CSS conflicts with site styles

### Test 3: Popup Interface

#### Setup
1. Navigate to `https://panel.rogen.wtf/auth/register`
2. Click extension icon in toolbar

#### Test Cases
- [ ] Popup opens immediately
- [ ] Popup has correct dimensions (360px wide)
- [ ] Header shows "✨ Auto Register"
- [ ] "Auto-fill Form" button is visible
- [ ] Info box explains usage
- [ ] Clicking "Auto-fill Form" button fills page fields
- [ ] Success message appears in popup
- [ ] Last filled data section becomes visible
- [ ] Name, Email, and Timestamp are displayed
- [ ] Password shows as dots initially
- [ ] Clicking eye icon reveals password
- [ ] Clicking eye icon again hides password
- [ ] Version number shown in footer

### Test 4: Error Handling

#### Test 4a: Wrong Page
1. Navigate to any page other than target URL
2. Click extension icon
3. Click "Auto-fill Form" button
4. **Expected**: Error message "Please navigate to panel.rogen.wtf/auth/register first"

#### Test 4b: No Form Fields
1. Create test page with no form fields
2. Load extension on that page
3. **Expected**: Button still appears or gracefully fails
4. **Expected**: Error notification if clicked

### Test 5: Storage Persistence

#### Test Cases
- [ ] Fill form with extension
- [ ] Close browser completely
- [ ] Reopen browser
- [ ] Navigate to target page
- [ ] Click extension icon
- [ ] **Expected**: Last filled data is still displayed in popup

### Test 6: Multiple Fills

#### Test Cases
- [ ] Click fill button 10 times rapidly
- [ ] **Expected**: Each fill generates unique data
- [ ] **Expected**: No duplicate values
- [ ] **Expected**: No performance degradation
- [ ] **Expected**: No memory leaks (check DevTools Performance)

### Test 7: Responsive Design

#### Desktop
- [ ] Test on 1920x1080 resolution
- [ ] Button is properly sized and positioned
- [ ] Popup displays correctly

#### Mobile/Small Screen
- [ ] Test on mobile device or DevTools device emulation
- [ ] Button is responsive (full width if needed)
- [ ] Popup adjusts to smaller viewport
- [ ] Notifications are properly positioned

### Test 8: Browser Compatibility

| Browser | Version | Installation | Button Injection | Form Fill | Popup | Storage | Pass/Fail |
|---------|---------|--------------|------------------|-----------|-------|---------|-----------|
| Chrome  | Latest  | [ ]          | [ ]              | [ ]       | [ ]   | [ ]     | [ ]       |
| Edge    | Latest  | [ ]          | [ ]              | [ ]       | [ ]   | [ ]     | [ ]       |
| Firefox | Latest  | [ ]          | [ ]              | [ ]       | [ ]   | [ ]     | [ ]       |
| Opera   | Latest  | [ ]          | [ ]              | [ ]       | [ ]   | [ ]     | [ ]       |
| Brave   | Latest  | [ ]          | [ ]              | [ ]       | [ ]   | [ ]     | [ ]       |

## Performance Testing

### Metrics to Check
- [ ] Extension load time: < 100ms
- [ ] Button injection time: < 500ms
- [ ] Form fill time: < 100ms
- [ ] Popup open time: < 50ms
- [ ] Memory usage: < 10MB
- [ ] No memory leaks after 100 fills

### DevTools Performance Profile
1. Open Performance tab in DevTools
2. Start recording
3. Perform 10 fills
4. Stop recording
5. **Expected**: No long tasks (> 50ms)
6. **Expected**: Smooth animations (60fps)

## Security Testing

### Test Cases
- [ ] Extension only runs on whitelisted URLs
- [ ] No unauthorized network requests
- [ ] No data sent to external servers
- [ ] Storage only accessible by extension
- [ ] No eval() or unsafe JavaScript
- [ ] No inline scripts in HTML
- [ ] Content Security Policy compliance

### DevTools Network Tab
1. Open Network tab
2. Use extension to fill form
3. **Expected**: No network requests from extension

## Accessibility Testing

### Test Cases
- [ ] Button is keyboard accessible (Tab to focus)
- [ ] Button can be activated with Enter/Space
- [ ] Popup is keyboard navigable
- [ ] Proper ARIA labels (if applicable)
- [ ] Screen reader compatibility (basic test)
- [ ] Sufficient color contrast (WCAG AA)

## Regression Testing

After any code changes, re-run:
- [ ] File validation tests
- [ ] Installation tests
- [ ] Core functional tests (Test 1, 2, 3)
- [ ] Error handling tests
- [ ] One browser compatibility test

## Bug Reporting Template

If you find a bug during testing, report it with:

```
**Browser**: [Chrome/Firefox/Edge/etc] [version]
**OS**: [Windows/Mac/Linux] [version]
**Extension Version**: 1.0.0
**Test Case**: [which test]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**: 
**Actual Behavior**: 
**Screenshots/Logs**: 
**Console Errors**: 
```

## Automated Testing (Future)

Future versions may include:
- Unit tests with Jest
- E2E tests with Playwright/Puppeteer
- Visual regression tests
- Automated browser compatibility tests
- CI/CD integration

## Sign-Off Checklist

Before releasing a new version:
- [ ] All critical tests pass
- [ ] Tested on at least 2 different browsers
- [ ] No console errors
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version number incremented
- [ ] Code reviewed
- [ ] Performance acceptable
- [ ] No security issues

---

**Last Updated**: 2024-11-12  
**Version**: 1.0.0  
**Status**: Ready for Testing
