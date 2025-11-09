# API Documentation - Funpay Price Analyzer

Base URL: `http://localhost:3000/api`

## Authentication

All analysis endpoints require an API key to be passed in the `X-API-Key` header.

```bash
curl -H "X-API-Key: fp_your_api_key_here" http://localhost:3000/api/analysis/prices
```

## Endpoints

### Health Check

Check if the API is running.

**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Authentication Endpoints

### Authenticate with Cookies

Authenticate a user session using Funpay cookies.

**POST** `/api/auth/cookies`

**Request Body:**
```json
{
  "cookies": [
    {
      "name": "golden_key",
      "value": "...",
      "domain": "funpay.com"
    },
    {
      "name": "PHPSESSID",
      "value": "...",
      "domain": "funpay.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "token": "uuid-session-token",
    "expiresAt": 1704110400000
  },
  "message": "Authentication successful"
}
```

### Validate Session

Check if a session token is still valid.

**GET** `/api/auth/validate`

**Headers:**
```
X-Session-Token: your-session-token
```

**Response:**
```json
{
  "valid": true,
  "session": {
    "userId": "user_123",
    "expiresAt": 1704110400000
  }
}
```

### Logout

Invalidate a session token.

**POST** `/api/auth/logout`

**Headers:**
```
X-Session-Token: your-session-token
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## API Key Endpoints

### Generate API Key

Generate a new API key.

**POST** `/api/apikeys/generate`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "apiKey": "fp_a1b2c3d4e5f6...",
  "email": "user@example.com",
  "createdAt": 1704024000000,
  "message": "API key generated successfully"
}
```

### Validate API Key

Check if an API key is valid.

**POST** `/api/apikeys/validate`

**Request Body:**
```json
{
  "apiKey": "fp_your_api_key_here"
}
```

**Response:**
```json
{
  "valid": true,
  "email": "user@example.com",
  "requestCount": 42
}
```

### Get API Key Info

Get information about the current API key.

**GET** `/api/apikeys/info`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Response:**
```json
{
  "email": "user@example.com",
  "createdAt": 1704024000000,
  "lastUsed": 1704110400000,
  "requestCount": 150,
  "isActive": true
}
```

### Revoke API Key

Revoke an API key.

**DELETE** `/api/apikeys/revoke`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Analysis Endpoints

All endpoints require `X-API-Key` header.

### Analyze Prices

Analyze competitor prices for a product or category.

**POST** `/api/analysis/prices`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Request Body:**
```json
{
  "productUrl": "https://funpay.com/lots/offer/12345",
  "category": "game-currency"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prices": [100, 120, 95, 110, 105],
    "statistics": {
      "min": 95,
      "max": 120,
      "avg": 106.0,
      "median": 105.0,
      "q1": 100.0,
      "q3": 110.0,
      "count": 5,
      "standardDeviation": 9.27
    },
    "recommendation": {
      "price": 99.75,
      "strategy": "competitive",
      "confidence": "high",
      "expectedSaleSpeed": "fast"
    },
    "timestamp": 1704110400000
  }
}
```

### Get Recommended Price

Calculate recommended price based on competitor prices.

**POST** `/api/analysis/recommend`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Request Body:**
```json
{
  "prices": [100, 120, 95, 110, 105],
  "strategy": "competitive"
}
```

**Strategies:**
- `aggressive` - 10% below minimum
- `competitive` - 5% below median (default)
- `safe` - at median
- `premium` - 2% below average

**Response:**
```json
{
  "success": true,
  "recommendation": {
    "price": 99.75,
    "strategy": "competitive",
    "confidence": "high",
    "expectedSaleSpeed": "fast"
  },
  "statistics": {
    "min": 95,
    "max": 120,
    "avg": 106.0,
    "median": 105.0
  },
  "timestamp": 1704110400000
}
```

### Track Competitor

Track competitor prices for a specific product.

**GET** `/api/analysis/track/:productId`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Example:**
```bash
curl -H "X-API-Key: fp_your_key" http://localhost:3000/api/analysis/track/12345
```

**Response:**
```json
{
  "success": true,
  "productId": "12345",
  "currentPrice": 105.0,
  "competitors": 15,
  "priceRange": {
    "min": 95.0,
    "max": 120.0
  },
  "trend": "decreasing",
  "lastUpdate": 1704110400000
}
```

### Get Price History

Get historical price data for a product.

**GET** `/api/analysis/history/:productId?days=7`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Query Parameters:**
- `days` - Number of days of history to retrieve (default: 7)

**Response:**
```json
{
  "success": true,
  "productId": "12345",
  "days": 7,
  "data": [
    {
      "timestamp": 1704024000000,
      "medianPrice": 110.0,
      "minPrice": 100.0,
      "maxPrice": 125.0,
      "competitors": 12
    },
    {
      "timestamp": 1704110400000,
      "medianPrice": 105.0,
      "minPrice": 95.0,
      "maxPrice": 120.0,
      "competitors": 15
    }
  ],
  "trend": "decreasing"
}
```

### Get Real-time Price

Get current real-time competitor prices.

**GET** `/api/analysis/realtime/:productId`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Response:**
```json
{
  "success": true,
  "productId": "12345",
  "realtime": true,
  "currentPrice": 105.0,
  "statistics": {
    "min": 95.0,
    "max": 120.0,
    "avg": 106.0,
    "median": 105.0,
    "count": 15
  },
  "recommendation": {
    "price": 99.75,
    "strategy": "competitive"
  },
  "timestamp": 1704110400000
}
```

### Compare Competitors

Compare prices across multiple products.

**POST** `/api/analysis/compare`

**Headers:**
```
X-API-Key: fp_your_api_key_here
```

**Request Body:**
```json
{
  "productIds": ["12345", "67890", "11111"]
}
```

**Response:**
```json
{
  "success": true,
  "comparisons": [
    {
      "productId": "12345",
      "currentPrice": 105.0,
      "competitors": 15,
      "trend": "decreasing"
    },
    {
      "productId": "67890",
      "currentPrice": 200.0,
      "competitors": 8,
      "trend": "stable"
    }
  ],
  "timestamp": 1704110400000
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

### Common Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not Found (endpoint or resource not found)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Rate Limiting

The API implements rate limiting to prevent abuse:
- Window: 15 minutes (900,000ms)
- Max requests per window: 100 requests

When rate limit is exceeded:
```json
{
  "error": {
    "message": "Too many requests from this IP, please try again later.",
    "status": 429
  }
}
```

---

## Usage Examples

### JavaScript (Extension)

```javascript
const api = new FunpayAPI();
await api.initialize();

// Analyze prices
const result = await api.analyzePrices('https://funpay.com/lots/offer/12345');
console.log('Recommended price:', result.data.recommendation.price);

// Get price history
const history = await api.getPriceHistory('12345', 7);
console.log('Price trend:', history.trend);
```

### cURL

```bash
# Generate API key
curl -X POST http://localhost:3000/api/apikeys/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Analyze prices
curl -X POST http://localhost:3000/api/analysis/prices \
  -H "Content-Type: application/json" \
  -H "X-API-Key: fp_your_api_key_here" \
  -d '{"productUrl":"https://funpay.com/lots/offer/12345"}'

# Track competitor
curl -H "X-API-Key: fp_your_api_key_here" \
  http://localhost:3000/api/analysis/track/12345
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000/api'
API_KEY = 'fp_your_api_key_here'

headers = {'X-API-Key': API_KEY}

# Analyze prices
response = requests.post(
    f'{API_BASE}/analysis/prices',
    headers=headers,
    json={'productUrl': 'https://funpay.com/lots/offer/12345'}
)
data = response.json()
print(f"Recommended price: {data['data']['recommendation']['price']}")

# Get history
response = requests.get(
    f'{API_BASE}/analysis/history/12345?days=7',
    headers=headers
)
history = response.json()
print(f"Price trend: {history['trend']}")
```

---

## Best Practices

1. **Store API keys securely** - Never commit API keys to version control
2. **Handle rate limits** - Implement exponential backoff for retries
3. **Cache responses** - Cache analysis results for a few minutes to reduce API calls
4. **Error handling** - Always check for error responses and handle them appropriately
5. **Use appropriate strategies** - Choose pricing strategy based on your sales goals

---

## Support

For API support:
- Email: api@funpayanalyzer.com
- GitHub Issues: https://github.com/funpay-analyzer/issues
- Documentation: https://funpayanalyzer.com/docs
