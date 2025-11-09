export function analyzeTrend(priceHistory) {
  if (priceHistory.length < 2) {
    return { direction: 'stable', strength: 0 };
  }

  let upCount = 0;
  let downCount = 0;

  for (let i = 1; i < priceHistory.length; i++) {
    const diff = priceHistory[i].price - priceHistory[i - 1].price;
    if (diff > 0) upCount++;
    else if (diff < 0) downCount++;
  }

  const total = upCount + downCount;
  if (total === 0) {
    return { direction: 'stable', strength: 0 };
  }

  const upRatio = upCount / total;
  
  if (upRatio > 0.6) {
    return { direction: 'up', strength: upRatio };
  } else if (upRatio < 0.4) {
    return { direction: 'down', strength: 1 - upRatio };
  }
  
  return { direction: 'stable', strength: 0.5 };
}

export function predictFutureTrend(priceHistory, daysAhead = 7) {
  if (priceHistory.length < 3) {
    return { prediction: null, confidence: 0 };
  }

  const recentPrices = priceHistory.slice(-10);
  const prices = recentPrices.map(h => h.price);
  
  const avgChange = calculateAverageChange(prices);
  const volatility = calculateVolatility(prices);
  
  const predictedPrice = prices[prices.length - 1] + avgChange * daysAhead;
  const confidence = Math.max(0, 1 - volatility / 100);

  return {
    prediction: Math.max(0, Math.floor(predictedPrice)),
    confidence: confidence.toFixed(2),
    avgChange: avgChange.toFixed(2),
    volatility: volatility.toFixed(2),
  };
}

export function identifySeasonality(salesHistory) {
  const dayOfWeekSales = Array(7).fill(0);
  const dayOfWeekCount = Array(7).fill(0);

  salesHistory.forEach(sale => {
    const date = new Date(sale.timestamp);
    const dayOfWeek = date.getDay();
    dayOfWeekSales[dayOfWeek] += sale.amount;
    dayOfWeekCount[dayOfWeek]++;
  });

  const avgSalesByDay = dayOfWeekSales.map((total, index) => ({
    day: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][index],
    avgSales: dayOfWeekCount[index] > 0 ? total / dayOfWeekCount[index] : 0,
  }));

  const bestDay = avgSalesByDay.reduce((best, current) => 
    current.avgSales > best.avgSales ? current : best
  );

  return {
    avgSalesByDay,
    bestDay: bestDay.day,
    bestDayAvg: bestDay.avgSales,
  };
}

export function calculateDemandScore(product, market) {
  let score = 0;

  if (product.views) {
    score += Math.min(product.views / 100, 30);
  }

  if (product.favorites) {
    score += Math.min(product.favorites / 10, 20);
  }

  if (product.salesCount) {
    score += Math.min(product.salesCount * 2, 30);
  }

  if (market && market.averagePrice && product.price) {
    const priceRatio = product.price / market.averagePrice;
    if (priceRatio < 0.9) {
      score += 15;
    } else if (priceRatio > 1.1) {
      score -= 10;
    }
  }

  if (product.rating) {
    score += Math.min(product.rating * 2, 10);
  }

  return Math.max(0, Math.min(100, score));
}

function calculateAverageChange(prices) {
  let totalChange = 0;
  for (let i = 1; i < prices.length; i++) {
    totalChange += prices[i] - prices[i - 1];
  }
  return totalChange / (prices.length - 1);
}

function calculateVolatility(prices) {
  const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
  return Math.sqrt(variance);
}

export default {
  analyzeTrend,
  predictFutureTrend,
  identifySeasonality,
  calculateDemandScore,
};
