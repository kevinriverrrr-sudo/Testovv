let authState = {
  isAuthenticated: false,
  cookies: null,
  userId: null
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Funpay Competitor Analyzer installed');
  checkAuthentication();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    checkAuthentication().then(sendResponse);
    return true;
  }
  
  if (request.action === 'getCompetitorData') {
    getCompetitorData(request.url).then(sendResponse);
    return true;
  }
  
  if (request.action === 'analyzePrice') {
    analyzePriceRecommendation(request.data).then(sendResponse);
    return true;
  }
  
  if (request.action === 'saveAuthCookies') {
    saveAuthenticationCookies(request.cookies).then(sendResponse);
    return true;
  }
  
  if (request.action === 'logout') {
    logout().then(sendResponse);
    return true;
  }
});

async function checkAuthentication() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: 'funpay.com' });
    
    const goldencookie = cookies.find(c => c.name === 'golden_key');
    const phpSessId = cookies.find(c => c.name === 'PHPSESSID');
    
    if (goldencookie && phpSessId) {
      authState.isAuthenticated = true;
      authState.cookies = cookies;
      
      await chrome.storage.local.set({ 
        isAuthenticated: true,
        lastAuthCheck: Date.now()
      });
      
      return { 
        isAuthenticated: true, 
        message: 'Authenticated via cookies' 
      };
    } else {
      authState.isAuthenticated = false;
      await chrome.storage.local.set({ isAuthenticated: false });
      return { 
        isAuthenticated: false, 
        message: 'Not authenticated' 
      };
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, error: error.message };
  }
}

async function saveAuthenticationCookies(cookieData) {
  try {
    await chrome.storage.local.set({ 
      savedCookies: cookieData,
      lastAuthCheck: Date.now()
    });
    
    authState.isAuthenticated = true;
    return { success: true };
  } catch (error) {
    console.error('Save cookies error:', error);
    return { success: false, error: error.message };
  }
}

async function logout() {
  try {
    authState.isAuthenticated = false;
    authState.cookies = null;
    authState.userId = null;
    
    await chrome.storage.local.clear();
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

async function getCompetitorData(url) {
  try {
    const auth = await checkAuthentication();
    
    if (!auth.isAuthenticated) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      };
    }
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const competitors = parseCompetitorData(html);
    
    return { 
      success: true, 
      data: competitors,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Get competitor data error:', error);
    return { success: false, error: error.message };
  }
}

function parseCompetitorData(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const competitors = [];
  const offerElements = doc.querySelectorAll('.tc-item, .offer-list-item, [class*="offer"]');
  
  offerElements.forEach((element, index) => {
    try {
      const priceElement = element.querySelector('[class*="price"], .tc-price, [data-price]');
      const sellerElement = element.querySelector('[class*="seller"], .media-user-name, [data-seller]');
      const titleElement = element.querySelector('[class*="title"], .tc-title, h3, h4');
      
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/[\d\s.,]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(/[\s,]/g, '').replace('.', '.')) : 0;
        
        competitors.push({
          id: `competitor-${index}`,
          seller: sellerElement ? sellerElement.textContent.trim() : 'Unknown',
          price: price,
          title: titleElement ? titleElement.textContent.trim() : '',
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.warn('Error parsing competitor element:', e);
    }
  });
  
  return competitors;
}

async function analyzePriceRecommendation(data) {
  try {
    const { competitors, currentPrice, category } = data;
    
    if (!competitors || competitors.length === 0) {
      return {
        success: false,
        error: 'No competitor data available'
      };
    }
    
    const prices = competitors.map(c => c.price).filter(p => p > 0);
    
    if (prices.length === 0) {
      return {
        success: false,
        error: 'No valid prices found'
      };
    }
    
    prices.sort((a, b) => a - b);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const medianPrice = prices[Math.floor(prices.length / 2)];
    
    const lowerQuartile = prices[Math.floor(prices.length * 0.25)];
    const upperQuartile = prices[Math.floor(prices.length * 0.75)];
    
    const recommendedPrice = calculateOptimalPrice({
      minPrice,
      maxPrice,
      avgPrice,
      medianPrice,
      lowerQuartile,
      upperQuartile,
      currentPrice,
      competitorCount: competitors.length
    });
    
    const priceDistribution = calculatePriceDistribution(prices);
    
    return {
      success: true,
      recommendation: {
        recommendedPrice,
        minPrice,
        maxPrice,
        avgPrice,
        medianPrice,
        lowerQuartile,
        upperQuartile,
        competitorCount: competitors.length,
        priceDistribution,
        confidence: calculateConfidence(prices),
        strategy: determineStrategy(recommendedPrice, avgPrice, minPrice),
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Analyze price error:', error);
    return { success: false, error: error.message };
  }
}

function calculateOptimalPrice(stats) {
  const {
    minPrice,
    avgPrice,
    medianPrice,
    lowerQuartile,
    competitorCount
  } = stats;
  
  if (competitorCount < 3) {
    return Math.round(minPrice * 0.95 * 100) / 100;
  }
  
  if (competitorCount >= 3 && competitorCount < 10) {
    return Math.round(lowerQuartile * 0.98 * 100) / 100;
  }
  
  const weightedPrice = (
    minPrice * 0.3 + 
    lowerQuartile * 0.3 + 
    medianPrice * 0.2 + 
    avgPrice * 0.2
  );
  
  const competitivePrice = weightedPrice * 0.97;
  
  return Math.round(competitivePrice * 100) / 100;
}

function calculatePriceDistribution(prices) {
  const buckets = {};
  const bucketSize = (Math.max(...prices) - Math.min(...prices)) / 5 || 1;
  
  prices.forEach(price => {
    const bucket = Math.floor(price / bucketSize) * bucketSize;
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });
  
  return buckets;
}

function calculateConfidence(prices) {
  if (prices.length < 3) return 0.4;
  if (prices.length < 5) return 0.6;
  if (prices.length < 10) return 0.75;
  
  const variance = calculateVariance(prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const cv = Math.sqrt(variance) / avgPrice;
  
  if (cv < 0.1) return 0.95;
  if (cv < 0.2) return 0.85;
  if (cv < 0.3) return 0.75;
  return 0.65;
}

function calculateVariance(prices) {
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
}

function determineStrategy(recommendedPrice, avgPrice, minPrice) {
  const avgDiff = ((avgPrice - recommendedPrice) / avgPrice) * 100;
  const minDiff = ((minPrice - recommendedPrice) / minPrice) * 100;
  
  if (minDiff > 5) {
    return {
      type: 'aggressive',
      description: 'Агрессивная стратегия - цена ниже минимальной конкурентной',
      icon: '⚡'
    };
  }
  
  if (avgDiff > 10) {
    return {
      type: 'competitive',
      description: 'Конкурентная стратегия - цена значительно ниже средней',
      icon: '🎯'
    };
  }
  
  if (avgDiff > 0) {
    return {
      type: 'balanced',
      description: 'Сбалансированная стратегия - цена немного ниже средней',
      icon: '⚖️'
    };
  }
  
  return {
    type: 'premium',
    description: 'Премиум стратегия - цена выше средней',
    icon: '💎'
  };
}

setInterval(() => {
  checkAuthentication();
}, 5 * 60 * 1000);
