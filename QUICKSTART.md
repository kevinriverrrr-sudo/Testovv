# Quick Start Guide

Get HomeNet VPN running in 5 minutes! ⚡

## Prerequisites

- Node.js 18+ and npm
- Chrome, Firefox, or Edge browser
- Git (for cloning)

## Installation

```bash
# 1. Clone or navigate to the project
cd vpn-extension-mvp

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build
```

## Load Extension

### Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Done! You should see the HomeNet VPN extension

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `dist` folder
4. Select `manifest.json`
5. Done! Extension is now loaded

## First Use

1. Click the extension icon in browser toolbar
2. You'll see the onboarding (3 screens)
3. Click through to complete setup
4. Click the big "Connect" button
5. Extension will auto-select optimal server
6. You're connected! 🎉

## Features to Try

### 1. Quick Connect
- Click extension icon → Click "Connect"
- Automatically selects best server (<30ms ping)

### 2. Server Selection
- Scroll down in popup to see server list
- Click any server to connect to that location

### 3. Split Tunneling
1. Right-click extension icon → Options
2. Go to "Split Tunneling" tab
3. Add domains (e.g., "netflix.com")
4. Choose VPN or Direct for each domain

### 4. Secret Bookmarks
1. Browse to any website
2. Right-click page → "Add to Secret Bookmarks"
3. Disconnect VPN → bookmarks hidden
4. Connect VPN → bookmarks appear!

### 5. Quick Actions
In popup, toggle:
- **Smart DNS**: Optimizes streaming sites
- **Kill Switch**: Blocks traffic if VPN drops
- **Anti-Captcha**: Auto-rotates IP on captcha

### 6. VPN Profiles
1. Options → VPN Profiles tab
2. Create custom profiles for quick access
3. Right-click links → "Open with VPN Profile"

## Development Mode

### Watch Mode (Auto-rebuild)
```bash
npm run watch
```
Changes to TypeScript files auto-rebuild. Reload extension in browser to see changes.

### Backend API (Optional)
```bash
# Terminal 1: Watch mode
npm run watch

# Terminal 2: API server
npm run server
```
API runs on `http://localhost:3000`

## Troubleshooting

### Extension won't load
- Check that you selected the `dist` folder, not root
- Make sure build completed: `npm run build`
- Check browser console for errors

### Can't connect to VPN
- This is an MVP with simulated VPN (Chrome proxy)
- Real WireGuard WASM implementation planned
- For now, it demonstrates UI/UX flow

### Missing icons
- Icons are minimal PNGs (placeholders)
- For production, create proper icons
- See `public/icons/README.md`

### Build errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays UI
- [ ] Can connect/disconnect
- [ ] Server list displays
- [ ] Options page opens and saves settings
- [ ] Context menus appear (right-click)
- [ ] Secret bookmarks feature works
- [ ] No console errors

## Next Steps

1. **Customize**: Edit colors in CSS, add your branding
2. **Icons**: Create proper icon set (see `public/icons/`)
3. **Backend**: Set up real API server with database
4. **WireGuard**: Implement actual WireGuard WASM
5. **Publish**: Submit to Chrome Web Store / Firefox Add-ons

## Useful Commands

```bash
# Development
npm run watch          # Auto-rebuild on changes
npm run server         # Start API server
npm run dev           # Watch mode (alias)

# Production
npm run build         # Build for production
npm run lint          # Lint TypeScript
npm run format        # Format code with Prettier

# Testing
npm test              # Run tests (when implemented)
```

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Firefox Add-on Docs](https://extensionworkshop.com/)
- [WireGuard Protocol](https://www.wireguard.com/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)

## Support

- Issues: Open GitHub issue
- Email: dev@homenetvpn.com
- Docs: See `README.md` and `ARCHITECTURE.md`

Happy coding! 🚀
