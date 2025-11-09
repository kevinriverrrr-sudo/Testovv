// Configuration constants
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  STORAGE_KEYS: {
    API_KEY: 'funpay_api_key',
    USER_SESSION: 'funpay_user_session',
    PRICE_CACHE: 'funpay_price_cache',
    SETTINGS: 'funpay_settings'
  },
  FUNPAY: {
    BASE_URL: 'https://funpay.com',
    SELECTORS: {
      PRODUCT_CARD: '.tc-item',
      PRODUCT_TITLE: '.tc-item-title',
      PRODUCT_PRICE: '.tc-price',
      SELLER_NAME: '.media-user-name',
      PRODUCT_DESCRIPTION: '.tc-desc-text'
    }
  },
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  UPDATE_INTERVAL: 30 * 1000 // 30 seconds
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
