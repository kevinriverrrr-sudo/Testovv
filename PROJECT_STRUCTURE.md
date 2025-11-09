# Project Structure

```
funpay-price-analyzer/
├── README.md                  # Main documentation
├── QUICKSTART.md             # Quick start guide
├── INSTALLATION.md           # Detailed installation instructions
├── API.md                    # API documentation
├── LICENSE                   # MIT License
├── .gitignore               # Git ignore rules
│
├── extension/               # Browser extension
│   ├── manifest.json       # Extension configuration (Manifest V3)
│   │
│   ├── popup/              # Extension popup interface
│   │   ├── popup.html     # Popup HTML structure
│   │   ├── popup.css      # Popup styles
│   │   └── popup.js       # Popup logic and UI interactions
│   │
│   ├── options/            # Extension options/settings page
│   │   ├── options.html   # Options page HTML
│   │   ├── options.css    # Options page styles
│   │   └── options.js     # Settings management logic
│   │
│   ├── content/            # Content scripts (injected into Funpay pages)
│   │   ├── content.js     # Main content script for page interaction
│   │   └── content.css    # Styles injected into Funpay pages
│   │
│   ├── background/         # Background service worker
│   │   └── background.js  # Background tasks, price tracking, notifications
│   │
│   ├── shared/             # Shared utilities and resources
│   │   ├── config.js      # Configuration constants
│   │   ├── api.js         # API communication layer
│   │   ├── utils.js       # Utility functions
│   │   └── styles.css     # Shared CSS styles
│   │
│   └── assets/             # Static assets
│       └── icons/          # Extension icons
│           ├── icon16.png
│           ├── icon32.png
│           ├── icon48.png
│           ├── icon128.png
│           └── icon.svg   # Source SVG icon
│
└── backend/                # Backend API server
    ├── package.json        # Node.js dependencies and scripts
    ├── .env                # Environment variables
    ├── .env.example        # Example environment configuration
    │
    └── src/                # Source code
        ├── server.js       # Express server entry point
        │
        ├── routes/         # API route handlers
        │   ├── auth.js    # Authentication routes
        │   ├── apiKeys.js # API key management routes
        │   └── analysis.js # Price analysis routes
        │
        ├── services/       # Business logic layer
        │   ├── authService.js      # Authentication service
        │   ├── apiKeyService.js    # API key management
        │   └── analysisService.js  # Price analysis algorithms
        │
        ├── middleware/     # Express middleware
        │   └── auth.js    # Authentication middleware
        │
        ├── models/         # Data models (for future database integration)
        │
        └── utils/          # Utility functions
```

## Component Descriptions

### Extension Components

#### **Popup** (`extension/popup/`)
The main user interface that appears when clicking the extension icon.

**Features:**
- Price analysis dashboard
- Competitor statistics display
- Product tracking management
- Settings access
- Strategy selection

**Files:**
- `popup.html`: Structure with tabs for analysis, tracking, and settings
- `popup.css`: Styling for the popup interface
- `popup.js`: Logic for data fetching, display, and user interactions

#### **Options** (`extension/options/`)
Full-page settings and configuration interface.

**Features:**
- API key management
- Analysis settings configuration
- Notification preferences
- Statistics display
- Data import/export
- Extension reset

**Files:**
- `options.html`: Comprehensive settings interface
- `options.css`: Responsive styling for settings page
- `options.js`: Settings persistence and management

#### **Content Script** (`extension/content/`)
Injected into Funpay.com pages to add functionality.

**Features:**
- Adds "Анализ цен" button to product pages
- Scrapes competitor data from pages
- Displays analysis modal on-page
- Integrates seamlessly with Funpay UI

**Files:**
- `content.js`: Page scraping and UI injection
- `content.css`: Styles for injected elements

#### **Background** (`extension/background/`)
Service worker running in the background.

**Features:**
- Periodic price tracking updates
- Notification management
- Badge updates
- Cross-tab communication
- Context menu integration

**File:**
- `background.js`: Background task orchestration

#### **Shared** (`extension/shared/`)
Common utilities used across all extension components.

**Components:**
- `config.js`: Configuration constants and selectors
- `api.js`: API client for backend communication
- `utils.js`: Helper functions (formatting, storage, calculations)
- `styles.css`: Shared CSS variables and common styles

### Backend Components

#### **Server** (`backend/src/server.js`)
Express.js server entry point.

**Features:**
- CORS configuration for extensions
- Rate limiting
- Error handling
- Health check endpoint

#### **Routes** (`backend/src/routes/`)
API endpoint definitions.

**Modules:**
- `auth.js`: Cookie-based authentication
- `apiKeys.js`: API key lifecycle management
- `analysis.js`: Price analysis endpoints

#### **Services** (`backend/src/services/`)
Business logic implementation.

**Modules:**
- `authService.js`: Session management, cookie validation
- `apiKeyService.js`: API key generation, validation, revocation
- `analysisService.js`: Price scraping, statistics, recommendations

#### **Middleware** (`backend/src/middleware/`)
Express middleware functions.

**Module:**
- `auth.js`: API key and session validation middleware

## Data Flow

### Price Analysis Flow

1. **User opens Funpay product page**
2. **Content script** scrapes competitor prices from page
3. **User clicks** "Анализ цен" button or extension icon
4. **Content script** sends prices to popup
5. **Popup** calculates statistics using `utils.js`
6. **Popup** requests recommendation from **Backend API**
7. **Backend** applies pricing algorithm and returns result
8. **Popup** displays analysis and recommendation to user

### Authentication Flow

1. **User** generates API key in options page
2. **Options** sends request to **Backend**
3. **Backend** generates and returns API key
4. **Extension** stores API key in `chrome.storage`
5. **User** logs into Funpay.com
6. **Extension** clicks "Войти через Cookies"
7. **Background** retrieves Funpay cookies
8. **Background** sends cookies to **Backend**
9. **Backend** validates and creates session
10. **Extension** stores session token

### Price Tracking Flow

1. **User** adds product to tracking list
2. **Background** starts periodic polling
3. Every interval, **Background** fetches prices via **Backend**
4. **Backend** scrapes current prices and compares to history
5. **Backend** detects price changes
6. **Background** displays notification if price changed significantly
7. **Popup** shows updated prices in tracking tab

## Key Technologies

### Frontend (Extension)
- **Manifest V3**: Modern extension API
- **Vanilla JavaScript**: No frameworks for lightweight performance
- **Chrome Storage API**: Data persistence
- **Chrome Notifications API**: Price alerts
- **CSS3**: Modern styling with variables

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Axios**: HTTP client for scraping
- **Cheerio**: HTML parsing
- **Helmet**: Security headers
- **express-rate-limit**: API rate limiting
- **CORS**: Cross-origin support for extensions

## Storage

### Extension Storage (`chrome.storage.local`)

```javascript
{
  funpay_api_key: "fp_...",                    // API key
  funpay_user_session: {...},                   // Session data
  funpay_price_cache: {...},                    // Cached analysis
  funpay_price_cache_tracked: [...],            // Tracked products
  funpay_settings: {...},                       // User settings
  funpay_statistics: {...},                     // Usage stats
  price_history_12345: [...]                    // Price history per product
}
```

### Backend Storage (In-Memory)

```javascript
// Sessions Map
sessions: Map<sessionToken, {
  token: string,
  cookies: Cookie[],
  createdAt: number,
  expiresAt: number,
  userId: string
}>

// API Keys Map
apiKeys: Map<apiKey, {
  key: string,
  email: string,
  createdAt: number,
  lastUsed: number,
  requestCount: number,
  isActive: boolean
}>

// Price History Map
priceHistory: Map<productId, [{
  timestamp: number,
  prices: number[],
  statistics: {...}
}]>
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/cookies` - Login with cookies
- `GET /api/auth/validate` - Validate session
- `POST /api/auth/logout` - Logout

### API Keys
- `POST /api/apikeys/generate` - Generate key
- `POST /api/apikeys/validate` - Validate key
- `GET /api/apikeys/info` - Get key info
- `DELETE /api/apikeys/revoke` - Revoke key

### Analysis
- `POST /api/analysis/prices` - Analyze prices
- `POST /api/analysis/recommend` - Get recommendation
- `GET /api/analysis/track/:id` - Track product
- `GET /api/analysis/history/:id` - Price history
- `GET /api/analysis/realtime/:id` - Real-time prices
- `POST /api/analysis/compare` - Compare products

## Configuration Files

### Extension
- `manifest.json`: Extension metadata, permissions, content scripts
- `shared/config.js`: API URLs, storage keys, selectors

### Backend
- `.env`: Environment variables (PORT, secrets, rate limits)
- `package.json`: Dependencies and scripts

## Development Workflow

1. **Start backend**: `cd backend && npm run dev`
2. **Load extension** in browser developer mode
3. **Make changes** to extension or backend code
4. **Reload extension** in browser to test changes
5. **Backend auto-reloads** with nodemon in dev mode

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User accounts and authentication
- Historical data storage
- Machine learning price predictions
- Advanced analytics dashboard
- Mobile app companion
- Multi-marketplace support
