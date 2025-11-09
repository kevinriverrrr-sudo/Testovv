# Quick Start Guide - Funpay Price Analyzer

Get up and running in 5 minutes!

## 1. Start the Backend (2 minutes)

```bash
cd backend
npm install
npm start
```

You should see:
```
Funpay Price Analyzer API running on port 3000
Environment: development
```

## 2. Install the Extension (1 minute)

### Chrome/Edge:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

### Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `extension/manifest.json`

## 3. Setup API Key (1 minute)

1. Click the extension icon in your browser
2. Click "Сгенерировать API ключ"
3. Enter your email (e.g., `test@example.com`)
4. Click "Сохранить ключ"

## 4. Login to Funpay (30 seconds)

1. Open [funpay.com](https://funpay.com) and login
2. Return to the extension
3. Click "Войти через Cookies"

## 5. Try It Out (30 seconds)

1. Go to any Funpay product page
2. Look for the "Анализ цен" button on the page
3. Click it to see competitor analysis
4. Or click the extension icon for detailed analysis

## You're Ready! 🎉

Now you can:
- ✅ Analyze competitor prices on any product
- ✅ Get recommended pricing strategies
- ✅ Track price changes over time
- ✅ Receive notifications about price drops

## Next Steps

- Read the [full documentation](README.md)
- Check out the [API documentation](API.md)
- Customize settings in the Options page

## Having Issues?

See [INSTALLATION.md](INSTALLATION.md) for troubleshooting.

## Quick Commands Reference

```bash
# Start backend
cd backend && npm start

# Start backend in dev mode (auto-reload)
cd backend && npm run dev

# Check API health
curl http://localhost:3000/api/health

# Generate API key via curl
curl -X POST http://localhost:3000/api/apikeys/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Demo Data

The extension includes mock data for demonstration purposes. When you analyze prices on Funpay pages, it will generate realistic sample data if actual scraping is not available.

This allows you to:
- Test all features without real data
- Understand how the analysis works
- See the UI in action

For production use, implement actual web scraping in `backend/src/services/analysisService.js`.
