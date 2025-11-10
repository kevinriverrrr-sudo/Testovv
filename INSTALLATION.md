# Installation Guide for XGPT Browser Extension

This guide will walk you through installing the XGPT browser extension in different browsers.

## 📦 Prerequisites

Before installing, make sure you have:
- A modern web browser (Chrome, Edge, Chromium, or Firefox)
- Internet connection for API calls
- Developer mode enabled (for unpacked extensions)

## 🌐 Chrome / Chromium / Microsoft Edge

### Step 1: Download the Extension

Download or clone this repository to your local machine:

```bash
git clone <repository-url>
# OR download and extract the ZIP file
```

### Step 2: Open Extensions Page

1. Open your browser
2. Navigate to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Chromium**: `chromium://extensions/`

### Step 3: Enable Developer Mode

1. Look for "Developer mode" toggle in the top right corner
2. Click to enable it
3. New buttons will appear: "Load unpacked", "Pack extension", "Update"

### Step 4: Load the Extension

1. Click the "Load unpacked" button
2. Navigate to the directory containing the extension files
3. Select the folder (the one containing `manifest.json`)
4. Click "Select Folder" or "Open"

### Step 5: Verify Installation

1. The XGPT extension should now appear in your extensions list
2. You should see the XGPT icon (blue square with "X") in your browser toolbar
3. If the icon is not visible, click the puzzle piece icon and pin XGPT

### Step 6: Test the Extension

1. Click the XGPT icon
2. The popup window should open
3. Try sending a test message like "Hello!"
4. Wait for the AI response

## 🦊 Mozilla Firefox

### Step 1: Download the Extension

Download or clone this repository to your local machine.

### Step 2: Open Debugging Page

1. Open Firefox
2. Type `about:debugging` in the address bar
3. Press Enter
4. Click on "This Firefox" in the left sidebar

### Step 3: Load Temporary Add-on

1. Click the "Load Temporary Add-on..." button
2. Navigate to the extension directory
3. Select the `manifest.json` file
4. Click "Open"

### Step 4: Verify Installation

1. The extension should now be loaded
2. Look for the XGPT icon in the toolbar
3. If not visible, click the puzzle piece icon to access extensions

### Note for Firefox

Temporary add-ons in Firefox are removed when you close the browser. For permanent installation, you would need to:
- Sign the extension through Firefox Developer Hub
- Or load it temporarily each time

## ⚙️ Post-Installation Setup

### Configure API Key (Optional)

The extension comes with a default API key, but you can use your own:

1. Click the XGPT icon to open the popup
2. Click the settings icon (⚙️) in the top right
3. Enter your Google Generative AI API key
4. Choose your preferred model
5. Adjust temperature setting if desired
6. Click "Save"

### Get Your Own API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it into the extension settings

## 🔧 Troubleshooting Installation

### Extension Won't Load

**Problem**: Error when loading the extension

**Solutions**:
1. Verify all files are present:
   - manifest.json
   - popup.html
   - popup.css
   - popup.js
   - background.js
   - icons/ (with icon16.png, icon48.png, icon128.png)

2. Check manifest.json is valid JSON:
   ```bash
   cat manifest.json | python3 -m json.tool
   ```

3. Ensure no syntax errors in JavaScript files

### Icon Not Showing

**Problem**: Extension loads but icon is not visible

**Solutions**:
1. Check that icon files exist in the `icons/` directory
2. Verify icon paths in manifest.json are correct
3. Try refreshing the extension:
   - Go to extensions page
   - Click refresh icon on XGPT card
4. Restart your browser

### Permission Errors

**Problem**: Extension can't access storage or make network requests

**Solutions**:
1. Check that all permissions are listed in manifest.json
2. Reload the extension
3. Clear browser cache
4. Try removing and reinstalling the extension

### API Calls Failing

**Problem**: Messages send but no response received

**Solutions**:
1. Check your internet connection
2. Verify API key in settings is correct
3. Check browser console for errors:
   - Right-click extension popup
   - Select "Inspect"
   - Check Console tab
4. Try the default API key
5. Verify API quota hasn't been exceeded

## 🔄 Updating the Extension

### Chrome/Edge/Chromium

1. Make changes to the extension files
2. Go to extensions page
3. Click the refresh icon on XGPT card
4. Test the changes

### Firefox

1. Make changes to the extension files
2. Go to `about:debugging`
3. Click "Reload" next to XGPT
4. Test the changes

## 🗑️ Uninstalling

### Chrome/Edge/Chromium

1. Go to extensions page
2. Find XGPT extension
3. Click "Remove"
4. Confirm removal

### Firefox

1. Go to `about:addons`
2. Find XGPT extension
3. Click the three dots menu
4. Select "Remove"
5. Confirm removal

## 📊 Verifying Permissions

The extension requires these permissions:

- **storage**: To save chat history and settings locally
- **host_permissions** for `generativelanguage.googleapis.com`: To make API calls to Google AI

These are listed in manifest.json and you can verify them in the extension details page.

## 🎯 First Time Setup Checklist

- [ ] Extension loaded successfully
- [ ] XGPT icon visible in toolbar
- [ ] Popup opens when clicking icon
- [ ] Settings modal opens and closes
- [ ] Test message sends successfully
- [ ] AI response received
- [ ] Chat history persists after closing popup
- [ ] Clear history button works

## 📞 Getting Help

If you encounter issues not covered here:

1. Check the browser console for error messages
2. Verify all installation steps were followed
3. Try in a different browser
4. Check the README.md for additional documentation
5. Open an issue on the repository with:
   - Browser name and version
   - Error messages (if any)
   - Steps to reproduce the issue

## 🚀 Production Deployment

For deploying to Chrome Web Store or Firefox Add-ons:

### Chrome Web Store

1. Create a ZIP file of the extension:
   ```bash
   zip -r xgpt-extension.zip . -x "*.git*" "*.DS_Store"
   ```

2. Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Pay one-time $5 developer fee (if first time)
4. Click "New Item"
5. Upload the ZIP file
6. Fill in store listing details
7. Submit for review

### Firefox Add-ons

1. Create a ZIP file (same as above)
2. Visit [Firefox Developer Hub](https://addons.mozilla.org/developers/)
3. Create an account if needed
4. Submit new add-on
5. Upload ZIP file
6. Fill in listing information
7. Submit for review

---

**Need more help?** Check README.md or open an issue on the repository.
