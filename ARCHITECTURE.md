# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Extension                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Popup UI   │  │  Options UI  │  │   Content    │      │
│  │   (Popup)    │  │   (Options)  │  │   Scripts    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │  Service Worker │                        │
│                   │   (Background)  │                        │
│                   └────────┬────────┘                        │
│                            │                                  │
│  ┌─────────────────────────┼──────────────────────────────┐ │
│  │                         │                               │ │
│  │  ┌─────────────┐  ┌────▼──────┐  ┌──────────────┐    │ │
│  │  │ WireGuard   │  │  Storage  │  │  Kill Switch │    │ │
│  │  │  Manager    │  │  Manager  │  │   Manager    │    │ │
│  │  └─────────────┘  └───────────┘  └──────────────┘    │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌────────────┐  ┌──────────────┐   │ │
│  │  │   Split     │  │ Smart DNS  │  │ Anti-Captcha │   │ │
│  │  │  Tunneling  │  │   Manager  │  │   Manager    │   │ │
│  │  └─────────────┘  └────────────┘  └──────────────┘   │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────── ┘ │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ HTTPS/WebSocket
                            │
                   ┌────────▼────────┐
                   │   Backend API   │
                   │   (Node.js)     │
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
   │ WireGuard│      │  Database  │     │   Stripe   │
   │ Servers  │      │ (Postgres) │     │  Payment   │
   └──────────┘      └────────────┘     └────────────┘
```

## Extension Components

### 1. Service Worker (Background)

**File**: `src/background/index.ts`

- Main orchestrator for all background tasks
- Manages VPN connections
- Handles message passing
- Monitors network requests
- Implements alarms for health checks

**Managers**:
- `ConnectionManager`: VPN connection lifecycle
- `ProfileManager`: User profile and settings
- `MessageHandler`: Inter-component communication
- `ContextMenuManager`: Right-click menu operations

### 2. Popup UI

**File**: `src/popup/index.ts`

- Quick access to VPN controls
- Connection status display
- Server selection
- Real-time statistics
- Quick action toggles

**Features**:
- WebGL animated background (country-specific themes)
- One-click connect/disconnect
- Data usage monitoring
- Server list with ping times

### 3. Options Page

**File**: `src/options/index.ts`

- Comprehensive settings management
- Split-tunneling configuration
- VPN profile creation
- Secret bookmarks management
- Billing and subscription

**Tabs**:
- General: Auto-connect, kill-switch, theme
- Split Tunnel: Domain rules
- Features: Advanced settings
- Profiles: Custom VPN profiles
- Bookmarks: Secret bookmarks
- Billing: Subscription management
- About: Version, licenses, audits

### 4. Content Scripts

**File**: `src/content/index.ts`

- Injected into web pages
- Blocks WebRTC leaks
- Overrides geolocation API
- Detects captchas
- Spoofs timezone/language

### 5. Core Libraries

**WireGuard Manager** (`src/lib/wireguard.ts`):
- Connection establishment
- Traffic monitoring
- Ping tests
- Proxy configuration

**Storage Manager** (`src/lib/storage.ts`):
- Session storage (sensitive keys)
- Sync storage (preferences)
- Local storage (connection data)

**Split Tunneling** (`src/lib/splittunnel.ts`):
- Domain-based routing rules
- Dynamic rule updates
- Banking domain presets

**Kill Switch** (`src/lib/killswitch.ts`):
- Emergency traffic blocking
- Connection loss detection
- Auto-recovery

**Smart DNS** (`src/lib/smartdns.ts`):
- Streaming site detection
- DNS routing optimization

**Anti-Captcha** (`src/lib/anticaptcha.ts`):
- Captcha detection
- IP rotation
- Clean IP pool management

## Data Flow

### Connection Flow

```
1. User clicks "Connect"
   ↓
2. Popup sends message to background
   ↓
3. ConnectionManager.connect()
   ↓
4. API.getOptimalServer()
   ↓
5. API.generateWireGuardConfig()
   ↓
6. WireGuardManager.connect()
   ↓
7. Setup Chrome proxy
   ↓
8. Apply split-tunneling rules
   ↓
9. Update storage + UI
   ↓
10. Start health monitoring
```

### Message Passing

```
┌──────────┐                  ┌────────────────┐                  ┌─────────────┐
│  Popup   │──sendMessage───→ │ Service Worker │──sendMessage───→ │   Content   │
│    UI    │←─────response────│  (Background)  │←────response─────│   Script    │
└──────────┘                  └────────────────┘                  └─────────────┘
```

Message types:
- `CONNECT` / `DISCONNECT`
- `GET_CONNECTION` / `GET_STATS`
- `UPDATE_PROFILE`
- `ADD_SPLIT_TUNNEL_DOMAIN`
- `HANDLE_CAPTCHA`

### Storage Strategy

**Session Storage** (Cleared on browser close):
- WireGuard private keys
- Authentication tokens
- Temporary session data

**Sync Storage** (Synced across devices):
- User preferences
- VPN profiles
- Domain rules

**Local Storage** (Persistent, local only):
- Connection statistics
- Secret bookmarks
- Onboarding state

## Backend API

### Endpoints

```
POST   /auth/login          # Authenticate user
POST   /auth/verify         # Verify JWT token

GET    /servers             # List VPN servers
GET    /servers/:id         # Get server details
GET    /servers/:id/clean-ip # Get clean IP (anti-captcha)

POST   /wireguard/config    # Generate WireGuard config

GET    /user/profile        # Get user profile
PATCH  /user/profile        # Update profile
POST   /user/upgrade        # Upgrade subscription

POST   /stats               # Report usage stats
```

### Authentication

- JWT-based authentication
- Tokens stored in session storage
- 30-day expiration
- Refresh token support (planned)

## Security Measures

1. **Key Management**
   - Private keys never leave client
   - Keys stored in session storage
   - Cleared on browser close

2. **Network Security**
   - All API calls over HTTPS
   - Certificate pinning (planned)
   - WebRTC leak protection
   - DNS leak protection

3. **Privacy**
   - No IP logging on servers
   - Minimal telemetry (bytes in/out)
   - 24-hour data retention
   - No personal data collection

4. **Extension Permissions**
   - Minimal required permissions
   - Justified in onboarding
   - No data sent to third parties

## Performance Optimizations

1. **Connection Speed**
   - WireGuard protocol (fast)
   - Optimal server selection (<30ms ping)
   - Connection pooling

2. **UI Performance**
   - Debounced updates
   - Virtual scrolling for server lists
   - RequestAnimationFrame for animations
   - Lazy loading of tabs

3. **Resource Usage**
   - Service worker lifecycle management
   - Efficient message passing
   - Minimal background processing
   - Smart polling intervals

## Future Enhancements

1. **Phase 2**
   - Native messaging host for system-level kill-switch
   - Full WireGuard WASM implementation
   - WebRTC DataChannel tunneling
   - Multi-hop configuration UI

2. **Phase 3**
   - Mobile companion app
   - Browser sync via cloud
   - Advanced analytics dashboard
   - Threat detection

3. **Phase 4**
   - Blockchain-based NFT passes
   - Decentralized server network
   - P2P routing option
   - AI-powered server selection
