let isAuthenticated = false;
let analysisButton = null;
let floatingPanel = null;

function init() {
  checkAuth();
  injectAnalysisButton();
  observePageChanges();
  console.log('Funpay Competitor Analyzer: Content script loaded');
}

function checkAuth() {
  chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Auth check error:', chrome.runtime.lastError);
      return;
    }
    isAuthenticated = response && response.isAuthenticated;
    updateButtonState();
  });
}

function injectAnalysisButton() {
  if (analysisButton) return;
  
  const isOfferPage = window.location.href.includes('/lots/offer');
  const isLotsPage = window.location.href.includes('/lots/');
  const isChipPage = window.location.href.includes('/chips/');
  
  if (!isOfferPage && !isLotsPage && !isChipPage) return;
  
  analysisButton = document.createElement('button');
  analysisButton.className = 'funpay-analyzer-btn';
  analysisButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>Анализ цен</span>
  `;
  
  analysisButton.addEventListener('click', handleAnalysisClick);
  
  const targetContainer = document.querySelector('.content-offer, .offer-header, .tc-header, .page-content');
  
  if (targetContainer) {
    targetContainer.style.position = 'relative';
    targetContainer.insertBefore(analysisButton, targetContainer.firstChild);
  } else {
    document.body.appendChild(analysisButton);
  }
  
  updateButtonState();
}

function updateButtonState() {
  if (!analysisButton) return;
  
  if (isAuthenticated) {
    analysisButton.disabled = false;
    analysisButton.title = 'Анализировать конкурентов';
  } else {
    analysisButton.disabled = true;
    analysisButton.title = 'Необходима авторизация';
  }
}

async function handleAnalysisClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if (!isAuthenticated) {
    showNotification('Пожалуйста, авторизуйтесь через расширение', 'error');
    return;
  }
  
  analysisButton.disabled = true;
  analysisButton.innerHTML = '<span class="loader"></span><span>Анализ...</span>';
  
  try {
    const currentUrl = window.location.href;
    const competitors = await getCompetitorData(currentUrl);
    
    if (!competitors || competitors.length === 0) {
      showNotification('Не найдены данные конкурентов на этой странице', 'warning');
      return;
    }
    
    const currentPriceElement = document.querySelector('[class*="price"], .tc-price, [data-price]');
    const currentPrice = currentPriceElement ? parseFloat(currentPriceElement.textContent.replace(/[^\d.]/g, '')) : null;
    
    const analysis = await analyzePrices({
      competitors,
      currentPrice,
      category: extractCategory()
    });
    
    if (analysis.success) {
      showAnalysisPanel(analysis.recommendation, competitors);
    } else {
      showNotification('Ошибка анализа: ' + analysis.error, 'error');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    showNotification('Произошла ошибка при анализе', 'error');
  } finally {
    analysisButton.disabled = false;
    analysisButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Анализ цен</span>
    `;
  }
}

function getCompetitorData(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'getCompetitorData', url },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        if (response && response.success) {
          resolve(response.data);
        } else {
          resolve(parseLocalCompetitorData());
        }
      }
    );
  });
}

function parseLocalCompetitorData() {
  const competitors = [];
  const offerElements = document.querySelectorAll('.tc-item, .offer-list-item, [class*="offer-"]');
  
  offerElements.forEach((element, index) => {
    try {
      const priceElement = element.querySelector('[class*="price"], .tc-price, [data-price]');
      const sellerElement = element.querySelector('[class*="seller"], .media-user-name, [data-seller]');
      const titleElement = element.querySelector('[class*="title"], .tc-title, h3, h4');
      
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/[\d\s.,]+/);
        const price = priceMatch ? parseFloat(priceMatch[0].replace(/[\s,]/g, '').replace('.', '.')) : 0;
        
        if (price > 0) {
          competitors.push({
            id: `competitor-${index}`,
            seller: sellerElement ? sellerElement.textContent.trim() : 'Unknown',
            price: price,
            title: titleElement ? titleElement.textContent.trim() : '',
            timestamp: Date.now()
          });
        }
      }
    } catch (e) {
      console.warn('Error parsing competitor element:', e);
    }
  });
  
  return competitors;
}

function analyzePrices(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'analyzePrice', data },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(response || { success: false, error: 'No response' });
      }
    );
  });
}

function showAnalysisPanel(recommendation, competitors) {
  if (floatingPanel) {
    floatingPanel.remove();
  }
  
  floatingPanel = document.createElement('div');
  floatingPanel.className = 'funpay-analysis-panel';
  floatingPanel.innerHTML = `
    <div class="panel-header">
      <h3>📊 Анализ конкурентов</h3>
      <button class="panel-close">&times;</button>
    </div>
    <div class="panel-content">
      <div class="recommendation-section">
        <div class="strategy-badge ${recommendation.strategy.type}">
          <span class="strategy-icon">${recommendation.strategy.icon}</span>
          <span class="strategy-text">${recommendation.strategy.description}</span>
        </div>
        <div class="recommended-price">
          <label>Рекомендуемая цена:</label>
          <div class="price-value">${recommendation.recommendedPrice.toFixed(2)} ₽</div>
          <div class="confidence">Уверенность: ${(recommendation.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <label>Минимальная</label>
          <span>${recommendation.minPrice.toFixed(2)} ₽</span>
        </div>
        <div class="stat-item">
          <label>Средняя</label>
          <span>${recommendation.avgPrice.toFixed(2)} ₽</span>
        </div>
        <div class="stat-item">
          <label>Медиана</label>
          <span>${recommendation.medianPrice.toFixed(2)} ₽</span>
        </div>
        <div class="stat-item">
          <label>Максимальная</label>
          <span>${recommendation.maxPrice.toFixed(2)} ₽</span>
        </div>
      </div>
      
      <div class="competitors-section">
        <h4>Конкуренты (${recommendation.competitorCount})</h4>
        <div class="competitors-list">
          ${competitors.slice(0, 10).map(comp => `
            <div class="competitor-item">
              <span class="competitor-seller">${escapeHtml(comp.seller)}</span>
              <span class="competitor-price">${comp.price.toFixed(2)} ₽</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="actions">
        <button class="btn-primary" onclick="navigator.clipboard.writeText('${recommendation.recommendedPrice.toFixed(2)}')">
          Копировать цену
        </button>
        <button class="btn-secondary refresh-btn">
          🔄 Обновить
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(floatingPanel);
  
  floatingPanel.querySelector('.panel-close').addEventListener('click', () => {
    floatingPanel.remove();
    floatingPanel = null;
  });
  
  floatingPanel.querySelector('.refresh-btn').addEventListener('click', () => {
    floatingPanel.remove();
    floatingPanel = null;
    handleAnalysisClick(new Event('click'));
  });
  
  setTimeout(() => {
    floatingPanel.classList.add('show');
  }, 10);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `funpay-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function extractCategory() {
  const breadcrumbs = document.querySelector('.breadcrumb, [class*="breadcrumb"]');
  if (breadcrumbs) {
    return breadcrumbs.textContent.trim();
  }
  
  const titleElement = document.querySelector('h1, .page-title, [class*="title"]');
  if (titleElement) {
    return titleElement.textContent.trim();
  }
  
  return 'Unknown';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function observePageChanges() {
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    if (lastUrl !== window.location.href) {
      lastUrl = window.location.href;
      
      if (analysisButton) {
        analysisButton.remove();
        analysisButton = null;
      }
      
      if (floatingPanel) {
        floatingPanel.remove();
        floatingPanel = null;
      }
      
      setTimeout(() => {
        injectAnalysisButton();
      }, 1000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
