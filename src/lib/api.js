import authManager from './auth.js';

class FunPayAPI {
  constructor() {
    this.baseUrl = 'https://funpay.com';
    this.backendUrl = 'http://localhost:3000/api';
  }

  async scrapeProductPage(productUrl) {
    try {
      const response = await authManager.makeAuthenticatedRequest(productUrl);
      const html = await response.text();
      return this.parseProductPage(html);
    } catch (error) {
      console.error('Failed to scrape product page:', error);
      throw error;
    }
  }

  parseProductPage(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const product = {
      title: doc.querySelector('.offer-description h1')?.textContent?.trim() || '',
      price: this.extractPrice(doc.querySelector('.tc-price')?.textContent),
      seller: doc.querySelector('.media-user-name')?.textContent?.trim() || '',
      rating: this.extractRating(doc),
      reviews: this.extractReviews(doc),
      description: doc.querySelector('.offer-description')?.textContent?.trim() || '',
      timestamp: Date.now(),
    };

    return product;
  }

  async scrapeCompetitors(category, limit = 50) {
    try {
      const response = await fetch(`${this.backendUrl}/competitors/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape competitors');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to scrape competitors:', error);
      return [];
    }
  }

  async analyzePrices(productId, competitors) {
    try {
      const response = await fetch(`${this.backendUrl}/analysis/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, competitors }),
      });

      return await response.json();
    } catch (error) {
      console.error('Price analysis failed:', error);
      return null;
    }
  }

  async getProductsFromProfile() {
    try {
      const response = await authManager.makeAuthenticatedRequest(`${this.baseUrl}/profile`);
      const html = await response.text();
      return this.parseProfileProducts(html);
    } catch (error) {
      console.error('Failed to get products from profile:', error);
      return [];
    }
  }

  parseProfileProducts(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const products = [];

    const productElements = doc.querySelectorAll('.tc-item');
    productElements.forEach(el => {
      const product = {
        id: el.getAttribute('data-id') || '',
        title: el.querySelector('.tc-item-title')?.textContent?.trim() || '',
        price: this.extractPrice(el.querySelector('.tc-price')?.textContent),
        category: el.querySelector('.tc-category')?.textContent?.trim() || '',
        url: el.querySelector('a')?.href || '',
      };
      products.push(product);
    });

    return products;
  }

  async updateProductPrice(productId, newPrice) {
    try {
      const response = await authManager.makeAuthenticatedRequest(
        `${this.baseUrl}/lots/${productId}/edit`,
        {
          method: 'POST',
          body: JSON.stringify({ price: newPrice }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to update product price:', error);
      return false;
    }
  }

  async bulkUpdatePrices(updates) {
    const results = [];
    for (const update of updates) {
      const success = await this.updateProductPrice(update.productId, update.newPrice);
      results.push({ productId: update.productId, success });
      await this.delay(1000);
    }
    return results;
  }

  extractPrice(priceText) {
    if (!priceText) return 0;
    const match = priceText.match(/[\d\s]+/);
    return match ? parseFloat(match[0].replace(/\s/g, '')) : 0;
  }

  extractRating(doc) {
    const ratingEl = doc.querySelector('.rating');
    if (!ratingEl) return 0;
    const ratingText = ratingEl.textContent.trim();
    return parseFloat(ratingText) || 0;
  }

  extractReviews(doc) {
    const reviewsEl = doc.querySelector('.reviews-count');
    if (!reviewsEl) return 0;
    const reviewsText = reviewsEl.textContent.trim();
    const match = reviewsText.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getTrendingProducts(category) {
    try {
      const response = await fetch(`${this.backendUrl}/analysis/trending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to get trending products:', error);
      return [];
    }
  }

  async getOptimalSellTime(productId) {
    try {
      const response = await fetch(`${this.backendUrl}/analysis/optimal-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to get optimal sell time:', error);
      return null;
    }
  }
}

const api = new FunPayAPI();
export default api;
