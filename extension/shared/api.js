// API communication layer
class FunpayAPI {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.apiKey = null;
  }

  async initialize() {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.API_KEY]);
    this.apiKey = result[CONFIG.STORAGE_KEYS.API_KEY];
  }

  async setApiKey(apiKey) {
    this.apiKey = apiKey;
    await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.API_KEY]: apiKey });
  }

  async request(endpoint, method = 'GET', body = null) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const options = {
      method,
      headers
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async authenticateWithCookies(cookies) {
    return await this.request('/auth/cookies', 'POST', { cookies });
  }

  async validateSession() {
    return await this.request('/auth/validate', 'GET');
  }

  // API Key Management
  async generateApiKey(email) {
    return await this.request('/apikeys/generate', 'POST', { email });
  }

  async validateApiKey(apiKey) {
    return await this.request('/apikeys/validate', 'POST', { apiKey });
  }

  // Price Analysis
  async analyzePrices(productUrl, category) {
    return await this.request('/analysis/prices', 'POST', { productUrl, category });
  }

  async getRecommendedPrice(productData) {
    return await this.request('/analysis/recommend', 'POST', productData);
  }

  async trackCompetitors(productId) {
    return await this.request(`/analysis/track/${productId}`, 'GET');
  }

  async getPriceHistory(productId, days = 7) {
    return await this.request(`/analysis/history/${productId}?days=${days}`, 'GET');
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.FunpayAPI = FunpayAPI;
}
