# HomeNet VPN - Browser Extension MVP

**"One click - and you're home"** 🏠

A feature-rich VPN browser extension that brings you back to your home internet experience.

## Mission

Return users to their "home" internet with one click: favorite services, language, currency, subscriptions, and even local ads.

## Core Features (Must-Have)

### 1. 0-Click Connect ⚡
- Automatically selects optimal server (ping ≤30ms)
- No registration or captcha required
- "Shadow mode" (Shadowsocks + dynamic fake SNI) for restricted countries

### 2. Split-Tunneling on Domains 🔀
- Global rules: "All through VPN except banks" or vice versa
- JSON blocklist stored locally
- Cloud sync with encrypted keys

### 3. Smart DNS + HTTPS Proxy Toggle 🎬
- Smart DNS for streaming sites (no speed loss)
- WireGuard for other traffic

### 4. Kill-Switch at Extension Level 🛡️
- Blocks all WebRequests if VPN drops
- Works even if browser freezes (via native-messaging host)

## Unique Features

### A. "Passport" 🎫
- Scan QR from phone → pulls real geolocation, timezone, language, subscriptions
- Auto-spoofs Accept-Language, timezone, GEO-API to match home location

### B. "Double Hop" in 1 Click 🌍→🌏
- "Enter from Germany, exit in Japan" - two WireGuard tunnels, one button

### C. "Anti-Captcha" 🤖
- Pool of clean IPs from reputable data centers
- Auto-switches IP and reloads page when captcha detected

### D. "Secret Bookmarks" 🔐
- Hidden folder only accessible when VPN is on
- Icon changes color when bookmarks are available

### E. "VPN Profiles for Links" 🔗
- Right-click URL → "Open through VPN-USA"
- Opens in isolated container/tab with specified exit

## Tech Stack

- **Extension**: Manifest V3, TypeScript, Service Worker
- **VPN Protocol**: WireGuard (WebAssembly userspace implementation)
- **UI**: Custom WebGL animated backgrounds, Inter font
- **Server**: Node.js + Express, Alpine Linux, WireGuard kernel
- **Storage**: chrome.storage.session (keys) + chrome.storage.sync (settings)
- **Payment**: Stripe integration

## Installation

### For Development

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Watch mode
npm run watch

# Start API server
npm run server
```

### Load in Browser

1. Open Chrome/Edge: `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

For Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/manifest.json`

## Project Structure

```
├── src/
│   ├── background/       # Service worker
│   ├── popup/           # Popup UI
│   ├── options/         # Settings page
│   ├── content/         # Content scripts
│   ├── lib/             # Shared libraries
│   └── wasm/            # WireGuard WebAssembly
├── public/
│   ├── icons/           # Extension icons
│   ├── images/          # Assets
│   └── rules/           # DeclarativeNetRequest rules
├── server/              # Backend API
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── middleware/      # Auth, validation
└── dist/                # Build output
```

## API Endpoints

- `GET /servers` - List available VPN servers
- `POST /wireguard/config` - Generate WireGuard config
- `POST /auth/login` - Authenticate user
- `GET /user/profile` - Get user profile
- `POST /stats` - Report usage statistics

## Pricing

- **Free**: 2 GB/month, auto server selection
- **Premium**: €3/month, unlimited data, all features
- **Lifetime**: €60 one-time, NFT passport included

## Security & Privacy

- ✅ WireGuard keys generated on client (server never sees them)
- ✅ Logs: only "bytes in/out" metrics, no IP, stored 24h
- ✅ Open source code (reproducible builds)
- ✅ Quarterly Cure53 audits
- ✅ WebRTC leak protection
- ✅ DNS leak protection

## Roadmap

- **Week 1-2**: Basic WireGuard, popup, 0-click connect
- **Week 3**: Split-tunneling, server list, icon indicator
- **Week 4**: Smart DNS, Netflix tests, kill-switch
- **Week 5**: Design, animations, Stripe payment
- **Week 6**: Audit, Chrome Web Store + Mozilla Add-ons publication

## Acceptance Criteria

1. ✅ Installs without errors in Chrome, Firefox, Edge
2. ✅ 0-click connect works ≤2s
3. ✅ Kill-switch blocks traffic on VPN drop
4. ✅ Split-tunneling routes domains correctly
5. ✅ Smart DNS switches for streaming sites
6. ✅ UI responsive, follows design system
7. ✅ Unique features work as described
8. ✅ Stripe payment integration
9. ✅ Logs stored 24h without IP
10. ✅ Passed basic security audit

## Contributing

This is an MVP implementation. Contributions welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

- Website: https://homenetvpn.com
- Email: support@homenetvpn.com
- GitHub Issues: https://github.com/homenetvpn/extension/issues

---

Built with ❤️ for privacy-conscious users who want to feel at home online, anywhere.
