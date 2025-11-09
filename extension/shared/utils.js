// Utility functions
const Utils = {
  // Format price
  formatPrice(price, currency = '₽') {
    return `${parseFloat(price).toFixed(2)} ${currency}`;
  },

  // Parse price from string
  parsePrice(priceString) {
    const match = priceString.match(/[\d.,]+/);
    if (match) {
      return parseFloat(match[0].replace(',', '.'));
    }
    return null;
  },

  // Extract product ID from URL
  getProductIdFromUrl(url) {
    const match = url.match(/\/offer\/(\d+)/);
    return match ? match[1] : null;
  },

  // Get current page type
  getPageType() {
    const path = window.location.pathname;
    if (path.includes('/lots/')) return 'catalog';
    if (path.includes('/offer/')) return 'product';
    if (path.includes('/users/')) return 'seller';
    if (path.includes('/account/')) return 'account';
    return 'other';
  },

  // Cookie management
  async getCookies(domain) {
    return new Promise((resolve) => {
      chrome.cookies.getAll({ domain }, (cookies) => {
        resolve(cookies);
      });
    });
  },

  async setCookie(cookie) {
    return new Promise((resolve) => {
      chrome.cookies.set(cookie, resolve);
    });
  },

  // Storage helpers
  async saveToStorage(key, value) {
    return chrome.storage.local.set({ [key]: value });
  },

  async getFromStorage(key, defaultValue = null) {
    const result = await chrome.storage.local.get([key]);
    return result[key] !== undefined ? result[key] : defaultValue;
  },

  async removeFromStorage(key) {
    return chrome.storage.local.remove(key);
  },

  // Cache management
  async getCachedData(key, maxAge = CONFIG.CACHE_DURATION) {
    const cached = await this.getFromStorage(key);
    if (cached && cached.timestamp && (Date.now() - cached.timestamp < maxAge)) {
      return cached.data;
    }
    return null;
  },

  async setCachedData(key, data) {
    return this.saveToStorage(key, {
      data,
      timestamp: Date.now()
    });
  },

  // Calculate statistics
  calculateStats(prices) {
    if (!prices || prices.length === 0) {
      return null;
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      count: sorted.length
    };
  },

  // Price recommendation algorithm
  calculateRecommendedPrice(competitorPrices, strategy = 'competitive') {
    const stats = this.calculateStats(competitorPrices);
    if (!stats) return null;

    switch (strategy) {
      case 'aggressive':
        // 5-10% below minimum
        return stats.min * 0.90;
      
      case 'competitive':
        // Slightly below median
        return stats.median * 0.95;
      
      case 'premium':
        // Slightly below average
        return stats.avg * 0.98;
      
      case 'safe':
        // At median
        return stats.median;
      
      default:
        return stats.median * 0.95;
    }
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Show notification
  showNotification(title, message, type = 'info') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '../assets/icons/icon128.png',
      title,
      message
    });
  },

  // Format date
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
  }
};

if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
