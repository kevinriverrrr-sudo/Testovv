const axios = require('axios');
const cheerio = require('cheerio');

// In-memory storage for price tracking
const priceHistory = new Map();
const competitorCache = new Map();

class AnalysisService {
  constructor() {
    this.funpayBaseUrl = process.env.FUNPAY_BASE_URL || 'https://funpay.com';
    this.requestDelay = parseInt(process.env.FUNPAY_REQUEST_DELAY) || 1000;
  }

  async analyzePrices(productUrl, category) {
    try {
      let prices = [];
      
      if (productUrl) {
        prices = await this.scrapeProductPage(productUrl);
      } else if (category) {
        prices = await this.scrapeCategoryPage(category);
      }

      const stats = this.calculateStatistics(prices);
      const recommendation = this.calculateRecommendedPrice(prices);

      return {
        success: true,
        data: {
          prices,
          statistics: stats,
          recommendation,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Price analysis error:', error);
      throw error;
    }
  }

  async scrapeProductPage(productUrl) {
    try {
      // In production, implement actual scraping with proper headers and delays
      // For demo, return mock data
      console.log(`Scraping product page: ${productUrl}`);
      
      // Simulate network delay
      await this.delay(this.requestDelay);

      // Generate realistic price data
      const basePrice = 100 + Math.random() * 400;
      const prices = [];
      
      for (let i = 0; i < 15; i++) {
        const variance = (Math.random() - 0.5) * 0.5; // ±25% variance
        prices.push(parseFloat((basePrice * (1 + variance)).toFixed(2)));
      }

      return prices;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }

  async scrapeCategoryPage(category) {
    try {
      console.log(`Scraping category: ${category}`);
      
      await this.delay(this.requestDelay);

      // Generate realistic price data for category
      const basePrice = 50 + Math.random() * 300;
      const prices = [];
      
      for (let i = 0; i < 25; i++) {
        const variance = (Math.random() - 0.5) * 0.6; // ±30% variance
        prices.push(parseFloat((basePrice * (1 + variance)).toFixed(2)));
      }

      return prices;
    } catch (error) {
      console.error('Scraping error:', error);
      return [];
    }
  }

  calculateStatistics(prices) {
    if (!prices || prices.length === 0) {
      return null;
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    // Calculate quartiles
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: parseFloat(avg.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      q1: parseFloat(q1.toFixed(2)),
      q3: parseFloat(q3.toFixed(2)),
      count: sorted.length,
      standardDeviation: this.calculateStdDev(sorted, avg)
    };
  }

  calculateStdDev(values, mean) {
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return parseFloat(Math.sqrt(avgSquareDiff).toFixed(2));
  }

  calculateRecommendedPrice(prices, strategy = 'competitive') {
    const stats = this.calculateStatistics(prices);
    if (!stats) return null;

    let recommendedPrice;

    switch (strategy) {
      case 'aggressive':
        // 5-10% below minimum
        recommendedPrice = stats.min * 0.90;
        break;
      
      case 'competitive':
        // Slightly below median (optimal for quick sales)
        recommendedPrice = stats.median * 0.95;
        break;
      
      case 'premium':
        // Near average but competitive
        recommendedPrice = stats.avg * 0.97;
        break;
      
      case 'safe':
        // At median
        recommendedPrice = stats.median;
        break;
      
      default:
        recommendedPrice = stats.median * 0.95;
    }

    return {
      price: parseFloat(recommendedPrice.toFixed(2)),
      strategy,
      confidence: this.calculateConfidence(stats),
      expectedSaleSpeed: this.estimateSaleSpeed(recommendedPrice, stats)
    };
  }

  calculateConfidence(stats) {
    // Higher confidence if prices are clustered (low std dev)
    const cv = stats.standardDeviation / stats.avg; // Coefficient of variation
    
    if (cv < 0.1) return 'high';
    if (cv < 0.3) return 'medium';
    return 'low';
  }

  estimateSaleSpeed(price, stats) {
    const percentile = (price - stats.min) / (stats.max - stats.min);
    
    if (percentile < 0.25) return 'very fast';
    if (percentile < 0.50) return 'fast';
    if (percentile < 0.75) return 'moderate';
    return 'slow';
  }

  async getRecommendedPrice(productData) {
    const { prices, strategy = 'competitive' } = productData;
    
    const recommendation = this.calculateRecommendedPrice(prices, strategy);
    const stats = this.calculateStatistics(prices);

    return {
      success: true,
      recommendation,
      statistics: stats,
      timestamp: Date.now()
    };
  }

  async trackCompetitors(productId) {
    try {
      // Get or initialize price history for this product
      if (!priceHistory.has(productId)) {
        priceHistory.set(productId, []);
      }

      // Fetch current competitor prices
      const prices = await this.scrapeProductPage(`${this.funpayBaseUrl}/lots/offer/${productId}`);
      const stats = this.calculateStatistics(prices);

      // Store in history
      const history = priceHistory.get(productId);
      history.push({
        timestamp: Date.now(),
        prices,
        statistics: stats
      });

      // Keep only last 100 entries
      if (history.length > 100) {
        history.shift();
      }

      return {
        success: true,
        productId,
        currentPrice: stats.median,
        competitors: stats.count,
        priceRange: {
          min: stats.min,
          max: stats.max
        },
        trend: this.calculateTrend(history),
        lastUpdate: Date.now()
      };
    } catch (error) {
      console.error('Tracking error:', error);
      throw error;
    }
  }

  calculateTrend(history) {
    if (history.length < 2) {
      return 'stable';
    }

    const recent = history.slice(-5);
    const prices = recent.map(h => h.statistics.median);
    
    let increasing = 0;
    let decreasing = 0;

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) increasing++;
      if (prices[i] < prices[i - 1]) decreasing++;
    }

    if (increasing > decreasing) return 'increasing';
    if (decreasing > increasing) return 'decreasing';
    return 'stable';
  }

  async getPriceHistory(productId, days = 7) {
    const history = priceHistory.get(productId) || [];
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const filteredHistory = history.filter(entry => entry.timestamp > cutoffTime);

    return {
      success: true,
      productId,
      days,
      data: filteredHistory.map(entry => ({
        timestamp: entry.timestamp,
        medianPrice: entry.statistics.median,
        minPrice: entry.statistics.min,
        maxPrice: entry.statistics.max,
        competitors: entry.statistics.count
      })),
      trend: this.calculateTrend(filteredHistory)
    };
  }

  async getRealtimePrice(productId) {
    // Fetch latest price data
    const prices = await this.scrapeProductPage(`${this.funpayBaseUrl}/lots/offer/${productId}`);
    const stats = this.calculateStatistics(prices);
    const recommendation = this.calculateRecommendedPrice(prices);

    return {
      success: true,
      productId,
      realtime: true,
      currentPrice: stats.median,
      statistics: stats,
      recommendation,
      timestamp: Date.now()
    };
  }

  async compareCompetitors(productIds) {
    const comparisons = [];

    for (const productId of productIds) {
      try {
        const data = await this.trackCompetitors(productId);
        comparisons.push(data);
        
        // Delay between requests
        await this.delay(this.requestDelay);
      } catch (error) {
        console.error(`Error comparing product ${productId}:`, error);
      }
    }

    return {
      success: true,
      comparisons,
      timestamp: Date.now()
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AnalysisService();
