export async function analyzePrices(productId, competitors) {
  try {
    const prices = competitors.map(c => c.price).filter(p => p > 0);
    
    if (prices.length === 0) {
      return {
        productId,
        recommendation: null,
        reason: 'No competitor data available',
      };
    }

    const sortedPrices = prices.sort((a, b) => a - b);
    const min = sortedPrices[0];
    const max = sortedPrices[sortedPrices.length - 1];
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const median = calculateMedian(sortedPrices);
    const percentile25 = calculatePercentile(sortedPrices, 25);
    const percentile75 = calculatePercentile(sortedPrices, 75);

    return {
      productId,
      priceStats: {
        min,
        max,
        avg: Math.floor(avg),
        median: Math.floor(median),
        percentile25: Math.floor(percentile25),
        percentile75: Math.floor(percentile75),
      },
      recommendations: {
        aggressive: Math.floor(min * 0.95),
        competitive: Math.floor(percentile25),
        balanced: Math.floor(median),
        premium: Math.floor(percentile75),
      },
      competitorCount: competitors.length,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Price analysis error:', error);
    throw error;
  }
}

export async function getTrendingProducts(category) {
  try {
    const trending = [];
    
    for (let i = 1; i <= 10; i++) {
      trending.push({
        id: `trending-${i}`,
        title: `Trending Product ${i}`,
        category: category || 'General',
        popularity: Math.floor(Math.random() * 100) + 50,
        priceRange: {
          min: Math.floor(Math.random() * 500) + 300,
          max: Math.floor(Math.random() * 1000) + 800,
        },
        trend: (Math.random() * 50 - 10).toFixed(1),
        timestamp: Date.now(),
      });
    }

    return trending.sort((a, b) => b.popularity - a.popularity);
  } catch (error) {
    console.error('Get trending products error:', error);
    throw error;
  }
}

export async function getOptimalSellTime(productId) {
  try {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      salesCount: Math.floor(Math.random() * 20),
      avgPrice: Math.floor(Math.random() * 500) + 800,
    }));

    const optimalHour = hourlyData.reduce((best, current) => 
      current.salesCount > best.salesCount ? current : best
    );

    return {
      productId,
      optimalHour: optimalHour.hour,
      confidence: 0.75 + Math.random() * 0.2,
      hourlyData,
      recommendation: `Лучшее время для продажи: ${optimalHour.hour}:00`,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Get optimal sell time error:', error);
    throw error;
  }
}

export async function getMarketTrends() {
  try {
    const categories = ['Gaming', 'Software', 'Accounts', 'Services', 'Items'];
    
    const trends = {
      hotCategories: categories.slice(0, 3),
      priceDrops: [
        { category: 'Gaming', change: -12.5 },
        { category: 'Accounts', change: -8.3 },
      ],
      priceIncreases: [
        { category: 'Services', change: 15.2 },
      ],
      marketVolume: {
        total: Math.floor(Math.random() * 100000) + 50000,
        change: (Math.random() * 20 - 5).toFixed(1),
      },
      categoryTrends: categories.map(cat => ({
        category: cat,
        trend: (Math.random() * 30 - 10).toFixed(1),
        volume: Math.floor(Math.random() * 10000) + 5000,
      })),
      timestamp: Date.now(),
    };

    return trends;
  } catch (error) {
    console.error('Get market trends error:', error);
    throw error;
  }
}

function calculateMedian(sortedArray) {
  const mid = Math.floor(sortedArray.length / 2);
  
  if (sortedArray.length % 2 === 0) {
    return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
  }
  
  return sortedArray[mid];
}

function calculatePercentile(sortedArray, percentile) {
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

export default {
  analyzePrices,
  getTrendingProducts,
  getOptimalSellTime,
  getMarketTrends,
};
