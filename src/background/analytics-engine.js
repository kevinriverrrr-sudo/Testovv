function calculatePriceRecommendation(product, strategy = 'competitive') {
  if (!product.competitors || product.competitors.length === 0) {
    return null;
  }

  const competitorPrices = product.competitors.map(c => c.price).filter(p => p > 0);
  
  if (competitorPrices.length === 0) {
    return null;
  }

  const sortedPrices = [...competitorPrices].sort((a, b) => a - b);
  let recommendedPrice;

  switch (strategy) {
    case 'aggressive':
      recommendedPrice = Math.floor(sortedPrices[0] * 0.95);
      break;
    
    case 'competitive':
      const percentile25 = calculatePercentile(sortedPrices, 25);
      recommendedPrice = Math.floor(percentile25);
      break;
    
    case 'premium':
      const median = calculateMedian(sortedPrices);
      recommendedPrice = Math.ceil(median);
      break;
    
    case 'average':
      const avg = sortedPrices.reduce((sum, p) => sum + p, 0) / sortedPrices.length;
      recommendedPrice = Math.floor(avg);
      break;
    
    default:
      recommendedPrice = Math.floor(calculateMedian(sortedPrices));
  }

  const priceDiff = Math.abs(product.price - recommendedPrice);
  const percentDiff = (priceDiff / product.price) * 100;

  const shouldUpdate = percentDiff > 5 && recommendedPrice > 0;
  const notify = percentDiff > 10;

  return {
    currentPrice: product.price,
    price: recommendedPrice,
    shouldUpdate,
    notify,
    analysis: {
      min: sortedPrices[0],
      max: sortedPrices[sortedPrices.length - 1],
      average: sortedPrices.reduce((sum, p) => sum + p, 0) / sortedPrices.length,
      median: calculateMedian(sortedPrices),
      competitorCount: competitorPrices.length,
      strategy,
      percentDiff,
    },
  };
}

function calculateMedian(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

function calculatePercentile(numbers, p) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function analyzePriceData(productId) {
  return new Promise(async (resolve) => {
    try {
      const data = await chrome.storage.local.get([`product_${productId}`, `history_${productId}`]);
      const product = data[`product_${productId}`];
      const history = data[`history_${productId}`] || [];

      if (!product) {
        resolve(null);
        return;
      }

      const priceHistory = history.map(h => h.price);
      const trend = calculateTrend(priceHistory);
      const volatility = calculateVolatility(priceHistory);
      const optimalTime = predictOptimalSellTime(history);

      resolve({
        productId,
        currentPrice: product.price,
        trend,
        volatility,
        optimalTime,
        recommendations: generateRecommendations(product, trend, volatility),
      });
    } catch (error) {
      console.error('Price analysis error:', error);
      resolve(null);
    }
  });
}

function calculateTrend(prices) {
  if (prices.length < 2) return 0;

  let sum = 0;
  for (let i = 1; i < prices.length; i++) {
    sum += prices[i] - prices[i - 1];
  }

  return sum / (prices.length - 1);
}

function calculateVolatility(prices) {
  if (prices.length < 2) return 0;

  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance);
}

function predictOptimalSellTime(history) {
  if (history.length < 7) {
    return { hour: 18, confidence: 0.3 };
  }

  const salesByHour = new Array(24).fill(0);
  
  history.forEach(entry => {
    if (entry.sold) {
      const hour = new Date(entry.timestamp).getHours();
      salesByHour[hour]++;
    }
  });

  const maxSales = Math.max(...salesByHour);
  const optimalHour = salesByHour.indexOf(maxSales);
  const confidence = maxSales / history.filter(h => h.sold).length;

  return {
    hour: optimalHour,
    confidence: Math.min(confidence, 1),
    distribution: salesByHour,
  };
}

function generateRecommendations(product, trend, volatility) {
  const recommendations = [];

  if (trend < -5) {
    recommendations.push({
      type: 'price_increase',
      message: 'Цены в категории падают. Рассмотрите возможность снижения цены.',
      priority: 'high',
    });
  }

  if (trend > 5) {
    recommendations.push({
      type: 'price_opportunity',
      message: 'Цены в категории растут. Можно немного поднять цену.',
      priority: 'medium',
    });
  }

  if (volatility > 50) {
    recommendations.push({
      type: 'market_unstable',
      message: 'Высокая волатильность цен. Следите за конкурентами.',
      priority: 'medium',
    });
  }

  if (!product.description || product.description.length < 100) {
    recommendations.push({
      type: 'improve_listing',
      message: 'Добавьте более подробное описание товара.',
      priority: 'low',
    });
  }

  return recommendations;
}

function analyzeCompetitorStrength(competitor) {
  let score = 0;

  if (competitor.rating > 4.5) score += 30;
  else if (competitor.rating > 4.0) score += 20;
  else if (competitor.rating > 3.5) score += 10;

  if (competitor.reviews > 100) score += 30;
  else if (competitor.reviews > 50) score += 20;
  else if (competitor.reviews > 10) score += 10;

  if (competitor.deliverySpeed === 'instant') score += 20;
  else if (competitor.deliverySpeed === 'fast') score += 10;

  if (competitor.price) {
    const priceScore = 100 - (competitor.price / 1000);
    score += Math.max(0, Math.min(20, priceScore));
  }

  return Math.min(100, score);
}

function predictSalesProbability(product, competitors) {
  const competitorPrices = competitors.map(c => c.price).sort((a, b) => a - b);
  const percentile = calculatePercentileRank(product.price, competitorPrices);

  let probability = 0;

  if (percentile <= 25) {
    probability = 0.8;
  } else if (percentile <= 50) {
    probability = 0.6;
  } else if (percentile <= 75) {
    probability = 0.4;
  } else {
    probability = 0.2;
  }

  if (product.rating > 4.5) probability += 0.1;
  if (product.reviews > 50) probability += 0.1;

  return Math.min(1, probability);
}

function calculatePercentileRank(value, sortedArray) {
  let count = 0;
  for (const item of sortedArray) {
    if (item < value) count++;
  }
  return (count / sortedArray.length) * 100;
}

function findOptimalPricePoint(competitors, targetMargin = 0.2) {
  if (competitors.length === 0) return null;

  const prices = competitors.map(c => c.price).filter(p => p > 0).sort((a, b) => a - b);
  
  const sweetSpot = calculatePercentile(prices, 30);
  const minViable = prices[0] * (1 - targetMargin);
  const recommended = Math.max(sweetSpot, minViable);

  return {
    recommended: Math.floor(recommended),
    min: Math.floor(prices[0]),
    max: Math.ceil(prices[prices.length - 1]),
    sweetSpot: Math.floor(sweetSpot),
    competitors: prices.length,
  };
}

console.log('Analytics Engine loaded');
