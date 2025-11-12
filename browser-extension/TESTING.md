# Testing Guide for Auto-fill Registration Extension

This guide provides detailed instructions for testing the browser extension.

## Prerequisites

- A modern web browser (Chrome 88+, Firefox 109+, or Edge 88+)
- Access to https://panel.rogen.wtf/auth/register
- Developer mode enabled in your browser

## Installation Testing

### Chrome / Edge

1. **Open Extensions Page**
   - Chrome: Navigate to `chrome://extensions/`
   - Edge: Navigate to `edge://extensions/`

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner
   - Verify it's enabled (switch should be blue/on)

3. **Load Extension**
   - Click "Load unpacked" button
   - Navigate to the `browser-extension` folder
   - Click "Select Folder"

4. **Verify Installation**
   - ✅ Extension should appear in the list
   - ✅ Extension icon should be visible in toolbar
   - ✅ No errors in the extension card
   - ✅ Status should be "Enabled"

### Firefox

1. **Open Debugging Page**
   - Navigate to `about:debugging#/runtime/this-firefox`

2. **Load Extension**
   - Click "Load Temporary Add-on" button
   - Navigate to `browser-extension` folder
   - Select `manifest.json` file
   - Click "Open"

3. **Verify Installation**
   - ✅ Extension should appear in "Temporary Extensions" list
   - ✅ Extension icon visible in toolbar
   - ✅ No errors displayed
   - ✅ Status shows extension details

## Functional Testing

### Test 1: Basic Auto-fill

**Steps:**
1. Navigate to https://panel.rogen.wtf/auth/register
2. Click the extension icon in toolbar
3. Click "Auto-fill" button in popup

**Expected Results:**
- ✅ Popup shows "Auto-fill" button
- ✅ Button changes to "Processing..." during execution
- ✅ Success notification appears: "Form filled successfully!"
- ✅ Name field is filled with a name (5-15 characters)
- ✅ Email field is filled with valid email format
- ✅ Password field is filled with password (minimum 8 characters)
- ✅ "Last Generated Values" section updates with new values
- ✅ No errors in browser console

### Test 2: Multiple Auto-fills

**Steps:**
1. On the registration page with extension popup open
2. Click "Auto-fill" button
3. Note the generated values
4. Click "Auto-fill" button again
5. Compare new values with previous ones

**Expected Results:**
- ✅ Second click generates different values
- ✅ Each field has new random data
- ✅ "Last Generated Values" updates to show new data
- ✅ Previous form values are replaced
- ✅ Success notification appears each time

### Test 3: Value Persistence

**Steps:**
1. Click "Auto-fill" button
2. Close the popup
3. Close the browser completely
4. Reopen browser
5. Navigate to the registration page
6. Open extension popup

**Expected Results:**
- ✅ "Last Generated Values" section shows previously generated values
- ✅ Values persist across browser sessions
- ✅ All three fields (Name, Email, Password) are displayed

### Test 4: Error Handling - Wrong Page

**Steps:**
1. Navigate to a different website (e.g., https://google.com)
2. Click extension icon
3. Click "Auto-fill" button

**Expected Results:**
- ✅ Error notification appears
- ✅ Message indicates navigation to correct page needed
- ✅ No console errors
- ✅ Extension remains functional

### Test 5: Form Field Detection

**Steps:**
1. On registration page, open browser console (F12)
2. Open extension popup
3. Click "Auto-fill" button
4. Check console for any messages

**Expected Results:**
- ✅ No JavaScript errors
- ✅ Console may show success messages
- ✅ All form fields detected successfully
- ✅ Form validation passes (if any)

## Data Validation Testing

### Test 6: Name Generation

**Steps:**
1. Click "Auto-fill" 10 times
2. Observe generated names each time

**Expected Results:**
- ✅ All names are in English
- ✅ Length between 5-15 characters
- ✅ Names appear realistic
- ✅ Mix of different first and last names
- ✅ No special characters or numbers

### Test 7: Email Generation

**Steps:**
1. Click "Auto-fill" 10 times
2. Observe generated emails each time

**Expected Results:**
- ✅ Valid email format: `username@domain.com`
- ✅ Various domains used (gmail, yahoo, outlook, etc.)
- ✅ Username contains only lowercase letters and numbers
- ✅ No consecutive special characters
- ✅ All emails would be syntactically valid

### Test 8: Password Generation

**Steps:**
1. Click "Auto-fill" 10 times
2. Copy each password and analyze

**Expected Results:**
- ✅ Minimum 8 characters (typically 12-20)
- ✅ Contains at least one uppercase letter
- ✅ Contains at least one lowercase letter
- ✅ Contains at least one number
- ✅ Contains at least one special character
- ✅ Different password each time

## UI/UX Testing

### Test 9: Popup Interface

**Steps:**
1. Open extension popup
2. Review all UI elements

**Expected Results:**
- ✅ Clean, professional appearance
- ✅ Purple gradient background
- ✅ Clear "Auto-fill" button with icon
- ✅ "Last Generated Values" section visible
- ✅ All text is readable
- ✅ Proper spacing and alignment
- ✅ Responsive to popup size

### Test 10: Notifications

**Steps:**
1. Test success notification (normal auto-fill)
2. Test error notification (wrong page)

**Expected Results:**
- ✅ Success: Green background with success message
- ✅ Error: Red background with error message
- ✅ Notifications auto-dismiss after 3 seconds
- ✅ Smooth fade-in animation
- ✅ Text is clearly readable

### Test 11: Button States

**Steps:**
1. Click "Auto-fill" button
2. Observe button during processing
3. Wait for completion

**Expected Results:**
- ✅ Button shows icon and text initially
- ✅ Changes to "Processing..." when clicked
- ✅ Button is disabled during processing
- ✅ Returns to normal state after completion
- ✅ Hover effect works on normal state

## Cross-Browser Testing

### Test 12: Chrome Compatibility

**Browser:** Google Chrome (latest version)
**Steps:** Run Tests 1-11

**Expected Results:**
- ✅ All tests pass
- ✅ No browser-specific issues
- ✅ Performance is smooth

### Test 13: Edge Compatibility

**Browser:** Microsoft Edge (latest version)
**Steps:** Run Tests 1-11

**Expected Results:**
- ✅ All tests pass
- ✅ Same functionality as Chrome
- ✅ No Edge-specific issues

### Test 14: Firefox Compatibility

**Browser:** Mozilla Firefox (latest version)
**Steps:** Run Tests 1-11

**Expected Results:**
- ✅ All tests pass
- ✅ Popup renders correctly
- ✅ Content script works properly
- ⚠️ Note: Temporary extension in Firefox

## Performance Testing

### Test 15: Speed Test

**Steps:**
1. Open browser performance monitor
2. Click "Auto-fill" 20 times rapidly
3. Monitor CPU and memory usage

**Expected Results:**
- ✅ Each auto-fill completes in < 1 second
- ✅ No memory leaks
- ✅ CPU usage remains reasonable
- ✅ Browser remains responsive

### Test 16: Storage Test

**Steps:**
1. Check browser storage before extension use
2. Click "Auto-fill" 50 times
3. Check storage size

**Expected Results:**
- ✅ Storage usage is minimal (< 1KB)
- ✅ Only last values are stored
- ✅ No accumulation of old data
- ✅ Storage can be cleared without issues

## Security Testing

### Test 17: Data Privacy

**Steps:**
1. Install extension
2. Use auto-fill feature
3. Check browser network tab (F12 → Network)

**Expected Results:**
- ✅ No external network requests
- ✅ All processing is local
- ✅ No data sent to external servers
- ✅ No tracking or analytics

### Test 18: Permissions

**Steps:**
1. Review extension permissions after installation
2. Check manifest.json permissions

**Expected Results:**
- ✅ Only necessary permissions requested:
  - `activeTab` - for current tab access
  - `storage` - for local storage
  - `scripting` - for form filling
  - `host_permissions` - only for target site
- ✅ No unnecessary permissions
- ✅ Permissions clearly justified

## Regression Testing

### Test 19: After Code Changes

**When:** After any modification to extension code
**Steps:** Run all tests (1-18)

**Expected Results:**
- ✅ All previous tests still pass
- ✅ No new bugs introduced
- ✅ Performance unchanged or improved

## Test Results Template

```
Test Date: [DATE]
Browser: [Chrome/Firefox/Edge] [VERSION]
OS: [Operating System]
Extension Version: 1.0.0

| Test # | Test Name              | Status | Notes |
|--------|------------------------|--------|-------|
| 1      | Basic Auto-fill        | ✅     |       |
| 2      | Multiple Auto-fills    | ✅     |       |
| 3      | Value Persistence      | ✅     |       |
| 4      | Error Handling         | ✅     |       |
| 5      | Form Field Detection   | ✅     |       |
| 6      | Name Generation        | ✅     |       |
| 7      | Email Generation       | ✅     |       |
| 8      | Password Generation    | ✅     |       |
| 9      | Popup Interface        | ✅     |       |
| 10     | Notifications          | ✅     |       |
| 11     | Button States          | ✅     |       |
| 12     | Chrome Compatibility   | ✅     |       |
| 13     | Edge Compatibility     | ✅     |       |
| 14     | Firefox Compatibility  | ✅     |       |
| 15     | Speed Test             | ✅     |       |
| 16     | Storage Test           | ✅     |       |
| 17     | Data Privacy           | ✅     |       |
| 18     | Permissions            | ✅     |       |

Overall Status: [PASS/FAIL]
Comments: [Any additional notes]
```

## Known Issues

None at this time.

## Reporting Bugs

If you encounter any issues during testing:

1. Note the test number and name
2. Document steps to reproduce
3. Include browser version and OS
4. Capture console errors (F12 → Console)
5. Take screenshots if relevant

## Test Automation

For automated testing, consider:
- Selenium WebDriver for UI testing
- Jest for unit testing JavaScript functions
- Puppeteer for headless browser testing

## Conclusion

All tests should pass for the extension to be considered production-ready. Any failing tests must be investigated and fixed before release.
