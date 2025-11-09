let extensionButton = null;
let floatingPanel = null;
let isAnalyzing = false;

function init() {
  console.log('FunPay Pro content script loaded');
  
  if (window.location.hostname.includes('funpay.com')) {
    injectExtensionButton();
    monitorPageChanges();
    extractPageData();
  }
}

function injectExtensionButton() {
  if (document.getElementById('funpay-pro-button')) return;

  extensionButton = document.createElement('div');
  extensionButton.id = 'funpay-pro-button';
  extensionButton.className = 'funpay-pro-floating-button';
  extensionButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  `;
  
  extensionButton.addEventListener('click', toggleAnalysisPanel);
  document.body.appendChild(extensionButton);
}

async function toggleAnalysisPanel() {
  if (floatingPanel) {
    floatingPanel.remove();
    floatingPanel = null;
    return;
  }

  await createAnalysisPanel();
}

async function createAnalysisPanel() {
  floatingPanel = document.createElement('div');
  floatingPanel.id = 'funpay-pro-panel';
  floatingPanel.className = 'funpay-pro-panel';
  
  floatingPanel.innerHTML = `
    <div class="funpay-pro-panel-header">
      <h3>FunPay Pro - Анализ</h3>
      <button class="close-btn" id="close-panel">×</button>
    </div>
    <div class="funpay-pro-panel-content">
      <div class="loading">Загрузка анализа...</div>
    </div>
  `;
  
  document.body.appendChild(floatingPanel);
  
  document.getElementById('close-panel').addEventListener('click', () => {
    floatingPanel.remove();
    floatingPanel = null;
  });

  await loadAnalysis();
}

async function loadAnalysis() {
  const content = floatingPanel.querySelector('.funpay-pro-panel-content');
  
  try {
    const pageData = await extractPageData();
    const competitors = await getCompetitorData(pageData);
    const analysis = await analyzeCurrentPage(pageData, competitors);
    
    content.innerHTML = renderAnalysis(analysis);
    attachAnalysisEventListeners();
  } catch (error) {
    content.innerHTML = `<div class="error">Ошибка: ${error.message}</div>`;
  }
}

async function extractPageData() {
  const data = {
    url: window.location.href,
    type: detectPageType(),
    timestamp: Date.now(),
  };

  if (data.type === 'product') {
    data.product = extractProductData();
  } else if (data.type === 'catalog') {
    data.products = extractCatalogData();
  } else if (data.type === 'profile') {
    data.profile = extractProfileData();
  }

  await chrome.runtime.sendMessage({
    action: 'pageDataExtracted',
    data,
  });

  return data;
}

function detectPageType() {
  const path = window.location.pathname;
  
  if (path.includes('/lots/') || path.includes('/offers/')) {
    return 'product';
  } else if (path.includes('/chips/') || path.includes('/trade/')) {
    return 'catalog';
  } else if (path.includes('/users/')) {
    return 'profile';
  }
  
  return 'other';
}

function extractProductData() {
  const product = {
    id: extractProductId(),
    title: document.querySelector('.offer-description h1, .tc-item h3')?.textContent?.trim() || '',
    price: extractPrice(document.querySelector('.tc-price, .offer-price')),
    seller: document.querySelector('.media-user-name, .username')?.textContent?.trim() || '',
    rating: extractRating(),
    reviews: extractReviews(),
    description: document.querySelector('.offer-description, .tc-desc')?.textContent?.trim() || '',
    category: document.querySelector('.breadcrumb a:last-child')?.textContent?.trim() || '',
  };

  return product;
}

function extractCatalogData() {
  const products = [];
  const items = document.querySelectorAll('.tc-item, .offer-list-item');
  
  items.forEach((item, index) => {
    if (index >= 20) return;
    
    const product = {
      id: item.getAttribute('data-id') || `item-${index}`,
      title: item.querySelector('.tc-item-title, h3')?.textContent?.trim() || '',
      price: extractPrice(item.querySelector('.tc-price')),
      seller: item.querySelector('.media-user-name')?.textContent?.trim() || '',
      url: item.querySelector('a')?.href || '',
    };
    
    products.push(product);
  });

  return products;
}

function extractProfileData() {
  return {
    username: document.querySelector('.username, .user-link')?.textContent?.trim() || '',
    rating: extractRating(),
    reviews: extractReviews(),
    products: extractCatalogData(),
  };
}

function extractProductId() {
  const match = window.location.pathname.match(/\/lots\/(\d+)/);
  return match ? match[1] : null;
}

function extractPrice(element) {
  if (!element) return 0;
  const text = element.textContent.trim();
  const match = text.match(/[\d\s]+/);
  return match ? parseFloat(match[0].replace(/\s/g, '')) : 0;
}

function extractRating() {
  const ratingEl = document.querySelector('.rating, .star-rating');
  if (!ratingEl) return 0;
  
  const text = ratingEl.textContent.trim();
  const match = text.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function extractReviews() {
  const reviewsEl = document.querySelector('.reviews-count, .review-count');
  if (!reviewsEl) return 0;
  
  const text = reviewsEl.textContent.trim();
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

async function getCompetitorData(pageData) {
  if (!pageData.product || !pageData.product.category) {
    return [];
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getCompetitors',
      category: pageData.product.category,
    });

    return response.competitors || [];
  } catch (error) {
    console.error('Failed to get competitors:', error);
    return [];
  }
}

async function analyzeCurrentPage(pageData, competitors) {
  const analysis = {
    page: pageData,
    competitors: competitors.slice(0, 10),
    recommendations: [],
    insights: {},
  };

  if (pageData.product && competitors.length > 0) {
    const prices = competitors.map(c => c.price).filter(p => p > 0);
    
    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      
      const min = prices[0];
      const max = prices[prices.length - 1];
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const median = prices[Math.floor(prices.length / 2)];
      
      analysis.insights.priceRange = { min, max, avg, median };
      
      const currentPrice = pageData.product.price;
      if (currentPrice > 0) {
        const position = prices.filter(p => p < currentPrice).length / prices.length * 100;
        analysis.insights.pricePosition = position.toFixed(1);
        
        if (position > 75) {
          analysis.recommendations.push({
            type: 'price_high',
            message: `Ваша цена выше ${position.toFixed(0)}% конкурентов. Рекомендуем снизить до ${Math.floor(median)}₽`,
            priority: 'high',
          });
        } else if (position < 25) {
          analysis.recommendations.push({
            type: 'price_low',
            message: 'Ваша цена очень конкурентная. Товар должен продаться быстро.',
            priority: 'info',
          });
        }
      }
    }
  }

  return analysis;
}

function renderAnalysis(analysis) {
  let html = '<div class="analysis-results">';

  if (analysis.page.product) {
    html += `
      <div class="product-info">
        <h4>${analysis.page.product.title}</h4>
        <p class="price">Текущая цена: <strong>${analysis.page.product.price}₽</strong></p>
      </div>
    `;
  }

  if (analysis.insights.priceRange) {
    const { min, max, avg, median } = analysis.insights.priceRange;
    html += `
      <div class="price-analysis">
        <h4>Анализ цен конкурентов</h4>
        <div class="stats-grid">
          <div class="stat">
            <span class="label">Минимум:</span>
            <span class="value">${min}₽</span>
          </div>
          <div class="stat">
            <span class="label">Максимум:</span>
            <span class="value">${max}₽</span>
          </div>
          <div class="stat">
            <span class="label">Средняя:</span>
            <span class="value">${Math.floor(avg)}₽</span>
          </div>
          <div class="stat">
            <span class="label">Медиана:</span>
            <span class="value">${Math.floor(median)}₽</span>
          </div>
        </div>
        ${analysis.insights.pricePosition ? 
          `<p class="position">Ваша позиция: выше ${analysis.insights.pricePosition}% конкурентов</p>` 
          : ''}
      </div>
    `;
  }

  if (analysis.recommendations.length > 0) {
    html += '<div class="recommendations"><h4>Рекомендации</h4><ul>';
    analysis.recommendations.forEach(rec => {
      html += `<li class="rec-${rec.priority}">${rec.message}</li>`;
    });
    html += '</ul></div>';
  }

  if (analysis.competitors.length > 0) {
    html += `
      <div class="competitors">
        <h4>Топ конкуренты (${analysis.competitors.length})</h4>
        <div class="competitor-list">
          ${analysis.competitors.slice(0, 5).map(comp => `
            <div class="competitor-item">
              <span class="comp-name">${comp.seller || 'N/A'}</span>
              <span class="comp-price">${comp.price}₽</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += `
    <div class="actions">
      <button class="btn btn-primary" id="open-dashboard">Открыть Dashboard</button>
      <button class="btn btn-secondary" id="refresh-analysis">Обновить</button>
    </div>
  `;

  html += '</div>';
  return html;
}

function attachAnalysisEventListeners() {
  const dashboardBtn = document.getElementById('open-dashboard');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openDashboard' });
    });
  }

  const refreshBtn = document.getElementById('refresh-analysis');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadAnalysis();
    });
  }
}

function monitorPageChanges() {
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log('Page changed, re-extracting data');
      extractPageData();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractPageData') {
    extractPageData().then(sendResponse);
    return true;
  }
  
  if (message.action === 'highlightProducts') {
    highlightProductsOnPage(message.productIds);
  }
});

function highlightProductsOnPage(productIds) {
  const items = document.querySelectorAll('.tc-item, .offer-list-item');
  
  items.forEach(item => {
    const id = item.getAttribute('data-id');
    if (productIds.includes(id)) {
      item.classList.add('funpay-pro-highlighted');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
