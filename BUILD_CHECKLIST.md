# Build & Deployment Checklist

## 📋 Pre-Build Checklist

### Development Environment
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git configured
- [ ] Text editor/IDE set up

### Project Setup
- [ ] Repository cloned/downloaded
- [ ] All files present (run `./scripts/verify-project.sh`)
- [ ] `.env` file created (copy from `.env.example`)
- [ ] Dependencies reviewed in `package.json`

## 🔨 Build Process

### Step 1: Install Dependencies
```bash
npm install
```

**Check for:**
- [ ] No error messages
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` created

### Step 2: Build Extension
```bash
npm run build
```

**Verify:**
- [ ] No TypeScript errors
- [ ] No webpack errors
- [ ] `dist/` directory created
- [ ] `dist/manifest.json` exists
- [ ] `dist/background.js` exists
- [ ] `dist/popup.js` exists
- [ ] `dist/options.js` exists
- [ ] `dist/content.js` exists
- [ ] `dist/popup.html` exists
- [ ] `dist/options.html` exists
- [ ] `dist/icons/` directory copied
- [ ] `dist/rules/` directory copied

### Step 3: Verify Build Output
```bash
ls -la dist/
```

**Expected files:**
- manifest.json
- background.js
- popup.js
- popup.html
- options.js
- options.html
- content.js
- icons/ (with PNG files)
- rules/ (with JSON files)

## 🌐 Browser Testing

### Chrome/Edge Testing

1. **Load Extension**
   - [ ] Open `chrome://extensions` (or `edge://extensions`)
   - [ ] Enable "Developer mode"
   - [ ] Click "Load unpacked"
   - [ ] Select `dist/` folder
   - [ ] Extension appears in list

2. **Visual Check**
   - [ ] Extension icon visible in toolbar
   - [ ] No error messages
   - [ ] Click icon → popup opens
   - [ ] Popup displays correctly
   - [ ] No console errors (F12)

3. **Functional Tests**
   - [ ] Click "Connect" button
   - [ ] Status changes to "Connected"
   - [ ] Server list displays
   - [ ] Can select different server
   - [ ] Quick action toggles work
   - [ ] Right-click extension icon → Options opens
   - [ ] All options tabs accessible
   - [ ] Can add split-tunnel domains
   - [ ] Right-click on page → context menus appear

### Firefox Testing

1. **Load Extension**
   - [ ] Open `about:debugging#/runtime/this-firefox`
   - [ ] Click "Load Temporary Add-on"
   - [ ] Select `dist/manifest.json`
   - [ ] Extension appears in list

2. **Visual Check**
   - [ ] Extension icon visible
   - [ ] Popup opens correctly
   - [ ] No console errors

3. **Functional Tests**
   - [ ] Same as Chrome tests above
   - [ ] Note any Firefox-specific issues

## 🧪 Feature Testing

### Core Features
- [ ] **0-Click Connect**: Auto-selects server
- [ ] **Server Selection**: Can choose specific server
- [ ] **Disconnect**: Can disconnect successfully
- [ ] **Connection Status**: Status displays accurately
- [ ] **Stats Display**: Shows data usage, ping, etc.

### Advanced Features
- [ ] **Split Tunneling**: Can add/remove domains
- [ ] **Smart DNS**: Toggle works
- [ ] **Kill Switch**: Toggle works
- [ ] **Anti-Captcha**: Toggle works
- [ ] **Secret Bookmarks**: Can add via context menu
- [ ] **VPN Profiles**: Can create profiles
- [ ] **Passport**: Settings accessible (QR scan placeholder)

### UI/UX
- [ ] **Theme**: Dark theme applied
- [ ] **Animations**: Background animation runs smoothly
- [ ] **Responsive**: UI adapts to window size
- [ ] **Icons**: All icons display correctly
- [ ] **Fonts**: Text readable and styled correctly

### Settings/Options
- [ ] **General Tab**: All settings accessible
- [ ] **Split Tunnel Tab**: Domain list works
- [ ] **Features Tab**: Toggles function
- [ ] **Profiles Tab**: Can create/delete
- [ ] **Bookmarks Tab**: Bookmarks display
- [ ] **Billing Tab**: Pricing cards show
- [ ] **About Tab**: Version info displays

### Error Handling
- [ ] No errors in browser console (F12)
- [ ] No errors in service worker console
- [ ] Extension doesn't crash on rapid clicks
- [ ] Handles network failures gracefully

## 🚀 Backend Testing (Optional)

If testing with backend API:

### Start Server
```bash
npm run server
```

**Verify:**
- [ ] Server starts on port 3000
- [ ] No startup errors
- [ ] Health check works: `curl http://localhost:3000/health`

### API Endpoints
- [ ] `GET /servers` returns server list
- [ ] `POST /auth/login` returns token
- [ ] `POST /wireguard/config` returns config
- [ ] `GET /user/profile` returns profile
- [ ] `POST /stats` accepts data

## 📦 Package for Distribution

### Create ZIP
```bash
cd dist/
zip -r ../vpn-extension-v1.0.0.zip .
cd ..
```

**Verify:**
- [ ] ZIP file created
- [ ] Size reasonable (<10 MB)
- [ ] Contains all necessary files
- [ ] No source code (.ts files)
- [ ] No development files

### Chrome Web Store Prep
- [ ] Professional icons (replace placeholders)
- [ ] Screenshots prepared (1280x800)
- [ ] Promotional images (440x280)
- [ ] Privacy policy written
- [ ] Terms of service written
- [ ] Store description written (English)
- [ ] Store description localized (optional)
- [ ] Developer account created
- [ ] $5 registration fee paid

### Firefox Add-ons Prep
- [ ] Same as Chrome, plus:
- [ ] AMO account created
- [ ] Source code uploaded (if required)
- [ ] Build instructions provided

## 🔒 Security Checks

- [ ] No API keys in code
- [ ] `.env` not in git
- [ ] No console.log of sensitive data
- [ ] HTTPS used for all API calls
- [ ] CSP headers configured (if applicable)
- [ ] Permissions justified in manifest
- [ ] WebRTC leaks blocked
- [ ] DNS leaks prevented

## 📊 Performance Checks

- [ ] Extension loads in <2 seconds
- [ ] Popup opens instantly
- [ ] No memory leaks (check DevTools)
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Bundle size acceptable

## 📝 Documentation Review

- [ ] README.md accurate and complete
- [ ] QUICKSTART.md tested and working
- [ ] ARCHITECTURE.md up to date
- [ ] All code comments accurate
- [ ] API documentation complete (if applicable)

## ✅ Final Checklist Before Release

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] Linter passes (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No TODO comments in critical paths
- [ ] All console.logs removed or conditional

### Testing
- [ ] Manual testing in Chrome ✅
- [ ] Manual testing in Firefox ✅
- [ ] Manual testing in Edge ✅
- [ ] All features tested ✅
- [ ] No critical bugs found
- [ ] Performance acceptable

### Documentation
- [ ] All documentation reviewed
- [ ] Screenshots up to date
- [ ] Version numbers consistent
- [ ] License included
- [ ] Contributing guide clear

### Legal & Business
- [ ] Privacy policy finalized
- [ ] Terms of service finalized
- [ ] Pricing confirmed
- [ ] Support channels set up
- [ ] Analytics configured (optional)

### Distribution
- [ ] Package created and tested
- [ ] Store listings prepared
- [ ] Payment integration tested
- [ ] Backend deployed (if needed)
- [ ] Domain configured (if needed)
- [ ] SSL certificates installed (if needed)

## 🎉 Release Checklist

- [ ] Version tagged in Git
- [ ] Release notes written
- [ ] Submitted to Chrome Web Store
- [ ] Submitted to Firefox Add-ons
- [ ] Submitted to Edge Add-ons (optional)
- [ ] Landing page updated
- [ ] Social media announcement prepared
- [ ] Support channels monitored
- [ ] Analytics tracking verified

## 📞 Support Preparation

- [ ] Support email set up
- [ ] FAQ prepared
- [ ] Troubleshooting guide written
- [ ] Community forum/Discord (optional)
- [ ] Response templates prepared
- [ ] Escalation process defined

---

## 🐛 Common Issues & Solutions

### Build Fails
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Extension Won't Load
- Check you selected `dist/` folder, not root
- Verify manifest.json in dist/
- Check browser console for errors
- Try reloading extension

### Missing Icons
- Run `node scripts/create-png-icons.js`
- Verify icons exist in `public/icons/`
- Rebuild: `npm run build`

### TypeScript Errors
- Check `tsconfig.json` configuration
- Verify all imports are correct
- Run `npm run lint` for details

### Webpack Errors
- Check `webpack.config.js`
- Verify all entry points exist
- Check file paths are correct

---

**Last Updated**: 2024-11-11
**Version**: 1.0.0
**Maintained By**: Development Team
