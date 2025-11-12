# Quick Start Guide

Get up and running with the Auto-fill Registration Extension in 5 minutes!

## 🚀 Installation (2 minutes)

### For Chrome / Edge Users

1. Open your browser and type in the address bar:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Enable Developer Mode**: Toggle the switch in the top-right corner

3. **Load the Extension**: 
   - Click "Load unpacked"
   - Browse to the `browser-extension` folder
   - Click "Select Folder"

4. **Pin the Extension** (Optional but recommended):
   - Click the puzzle icon (🧩) in your toolbar
   - Find "Auto-fill Registration Form"
   - Click the pin icon 📌

### For Firefox Users

1. Type in the address bar: `about:debugging#/runtime/this-firefox`

2. Click **"Load Temporary Add-on"**

3. Navigate to `browser-extension` folder and select `manifest.json`

4. Done! ✅

> **Note:** Firefox temporary extensions are removed when the browser closes. For permanent use, consider installing via Firefox Add-ons (AMO).

## 🎯 Usage (1 minute)

### Step-by-Step:

1. **Navigate** to the registration page:
   ```
   https://panel.rogen.wtf/auth/register
   ```

2. **Click** the extension icon in your browser toolbar
   - Look for the purple icon with a checkmark

3. **Click** the "Auto-fill" button in the popup

4. **Done!** All form fields are now filled with random data:
   - ✅ Name field
   - ✅ Email field  
   - ✅ Password field

5. **Review** the generated values in the popup

6. **Click again** if you want different values

7. **Submit** the form when you're satisfied

## 📊 What You'll See

### Extension Popup
```
┌─────────────────────────────┐
│  Auto-fill Registration     │
│  Fill form with random data │
│                             │
│  ┌─────────────────────┐   │
│  │   ✓ Auto-fill       │   │
│  └─────────────────────┘   │
│                             │
│  Last Generated Values:     │
│  Name: John Smith           │
│  Email: abc123@gmail.com    │
│  Password: P@ssw0rd123!     │
└─────────────────────────────┘
```

### Success Notification
```
✅ Form filled successfully!
```

## 💡 Tips

- **Generate New Values**: Just click "Auto-fill" again!
- **Last Values**: The popup always shows your most recent generated data
- **Persistence**: Values are saved even if you close the browser
- **Multiple Uses**: Click as many times as you need until you get values you like

## ⚠️ Troubleshooting

### Extension Icon Not Showing?
- Make sure Developer mode is enabled
- Try refreshing the extensions page
- Check if the extension is listed and enabled

### Auto-fill Button Not Working?
- Confirm you're on: `https://panel.rogen.wtf/auth/register`
- Reload the page and try again
- Check browser console (F12) for errors

### Fields Not Filling?
- Make sure the page has fully loaded
- Try clicking "Auto-fill" again
- The form structure might have changed (check content.js)

### Wrong Page Error?
```
Please navigate to panel.rogen.wtf/auth/register
```
- You need to be on the exact registration page
- Copy-paste the URL to be sure

## 🎨 Example Generated Data

### Name Examples
- John Smith
- Emma Johnson
- Michael Williams
- Sarah Brown

### Email Examples
- john123@gmail.com
- user456@yahoo.com
- random789@outlook.com
- test321@proton.me

### Password Examples
- P@ssw0rd123!
- Secure#2024$Pass
- Random!Key789%
- Strong&Pass456#

## 🔒 Privacy & Security

- ✅ All data generated locally in your browser
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Passwords are cryptographically random
- ✅ Open source - you can review the code

## 📦 Packaging for Distribution

Want to share with others or publish?

```bash
cd browser-extension
./package.sh
```

This creates a `.zip` file ready for:
- Chrome Web Store
- Firefox Add-ons (AMO)
- Edge Add-ons

## 🆘 Need More Help?

- **Detailed Documentation**: See [README.md](README.md)
- **Testing Guide**: See [TESTING.md](TESTING.md)
- **Project Overview**: See [BROWSER_EXTENSION.md](../BROWSER_EXTENSION.md)

## 🎉 That's It!

You're now ready to auto-fill registration forms with random data. Enjoy!

---

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Manifest:** V3 (Modern Extension Platform)
