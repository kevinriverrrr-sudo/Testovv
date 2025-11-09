// Popup script
let api;
let currentTab = 'analysis';

document.addEventListener('DOMContentLoaded', async () => {
  api = new FunpayAPI();
  await api.initialize();
  
  await checkAuthStatus();
  setupEventListeners();
  loadSettings();
});

async function checkAuthStatus() {
  const apiKey = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.API_KEY);
  const session = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.USER_SESSION);

  if (!apiKey) {
    showSection('api-key-section');
    hideSection('loading-section');
    return;
  }

  if (!session) {
    showSection('auth-section');
    hideSection('loading-section');
    return;
  }

  try {
    const validation = await api.validateSession();
    if (validation.valid) {
      showSection('main-content');
      updateStatusBadge('online');
      await loadCurrentPageData();
    } else {
      showSection('auth-section');
    }
  } catch (error) {
    console.error('Session validation error:', error);
    showSection('auth-section');
  }
  
  hideSection('loading-section');
}

function setupEventListeners() {
  // API Key
  document.getElementById('save-api-key').addEventListener('click', saveApiKey);
  document.getElementById('generate-api-key').addEventListener('click', generateApiKey);

  // Auth
  document.getElementById('auth-button').addEventListener('click', authenticateWithCookies);

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Analysis
  document.getElementById('analyze-button')?.addEventListener('click', runAnalysis);
  document.getElementById('pricing-strategy')?.addEventListener('change', updateRecommendedPrice);

  // Tracking
  document.getElementById('add-current-product')?.addEventListener('click', addCurrentProductToTracking);

  // Settings
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('logout-button').addEventListener('click', logout);
}

async function saveApiKey() {
  const apiKeyInput = document.getElementById('api-key-input');
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    alert('Введите API ключ');
    return;
  }

  try {
    const validation = await api.validateApiKey(apiKey);
    if (validation.valid) {
      await api.setApiKey(apiKey);
      alert('API ключ успешно сохранен');
      hideSection('api-key-section');
      showSection('auth-section');
    } else {
      alert('Неверный API ключ');
    }
  } catch (error) {
    alert('Ошибка проверки API ключа: ' + error.message);
  }
}

async function generateApiKey() {
  const email = prompt('Введите ваш email для генерации API ключа:');
  if (!email) return;

  try {
    const result = await api.generateApiKey(email);
    document.getElementById('api-key-input').value = result.apiKey;
    alert('API ключ сгенерирован и отправлен на ' + email);
  } catch (error) {
    alert('Ошибка генерации API ключа: ' + error.message);
  }
}

async function authenticateWithCookies() {
  try {
    const cookies = await Utils.getCookies('funpay.com');
    const result = await api.authenticateWithCookies(cookies);
    
    if (result.success) {
      await Utils.saveToStorage(CONFIG.STORAGE_KEYS.USER_SESSION, result.session);
      hideSection('auth-section');
      showSection('main-content');
      updateStatusBadge('online');
      await loadCurrentPageData();
    } else {
      alert('Ошибка аутентификации. Убедитесь, что вы вошли на Funpay.com');
    }
  } catch (error) {
    alert('Ошибка аутентификации: ' + error.message);
  }
}

function switchTab(tabName) {
  currentTab = tabName;
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');

  if (tabName === 'tracking') {
    loadTrackedProducts();
  }
}

async function loadCurrentPageData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.includes('funpay.com')) {
    showElement('no-data');
    hideElement('price-analysis-results');
    return;
  }

  // Send message to content script to get page data
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageData' });
    
    if (response && response.pageType === 'product') {
      document.getElementById('current-page-info').innerHTML = 
        `<strong>Страница товара:</strong> ${response.productTitle || 'Загрузка...'}`;
      hideElement('no-data');
      showElement('price-analysis-results');
      await runAnalysis();
    } else if (response && response.pageType === 'catalog') {
      document.getElementById('current-page-info').innerHTML = 
        `<strong>Каталог:</strong> ${response.category || 'Товары'}`;
      hideElement('no-data');
      showElement('price-analysis-results');
      await runAnalysis();
    } else {
      showElement('no-data');
      hideElement('price-analysis-results');
    }
  } catch (error) {
    console.error('Error loading page data:', error);
    showElement('no-data');
    hideElement('price-analysis-results');
  }
}

async function runAnalysis() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    // Get competitor data from content script
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'analyzeCompetitors' });
    
    if (response && response.prices && response.prices.length > 0) {
      displayAnalysisResults(response.prices);
    } else {
      alert('Не удалось получить данные конкурентов');
    }
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Ошибка анализа: ' + error.message);
  }
}

function displayAnalysisResults(prices) {
  const stats = Utils.calculateStats(prices);
  
  document.getElementById('min-price').textContent = Utils.formatPrice(stats.min);
  document.getElementById('max-price').textContent = Utils.formatPrice(stats.max);
  document.getElementById('avg-price').textContent = Utils.formatPrice(stats.avg);
  document.getElementById('competitor-count').textContent = stats.count;

  updateRecommendedPrice(stats);
}

function updateRecommendedPrice(stats = null) {
  if (!stats) {
    const minPrice = Utils.parsePrice(document.getElementById('min-price').textContent);
    const maxPrice = Utils.parsePrice(document.getElementById('max-price').textContent);
    const avgPrice = Utils.parsePrice(document.getElementById('avg-price').textContent);
    
    if (!minPrice || !maxPrice || !avgPrice) return;
    
    const count = parseInt(document.getElementById('competitor-count').textContent);
    const prices = Array(count).fill((minPrice + maxPrice) / 2);
    stats = Utils.calculateStats(prices);
  }

  const strategy = document.getElementById('pricing-strategy').value;
  const competitorPrices = [stats.min, stats.max, stats.avg];
  const recommended = Utils.calculateRecommendedPrice(competitorPrices, strategy);
  
  document.getElementById('recommended-price').textContent = Utils.formatPrice(recommended);
}

async function addCurrentProductToTracking() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageData' });
    
    if (response && response.productId) {
      let tracked = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.PRICE_CACHE + '_tracked', []);
      
      if (!tracked.find(p => p.id === response.productId)) {
        tracked.push({
          id: response.productId,
          title: response.productTitle,
          url: tab.url,
          addedAt: Date.now()
        });
        
        await Utils.saveToStorage(CONFIG.STORAGE_KEYS.PRICE_CACHE + '_tracked', tracked);
        alert('Товар добавлен в отслеживание');
        await loadTrackedProducts();
      } else {
        alert('Товар уже отслеживается');
      }
    }
  } catch (error) {
    console.error('Error adding to tracking:', error);
    alert('Ошибка добавления в отслеживание');
  }
}

async function loadTrackedProducts() {
  const tracked = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.PRICE_CACHE + '_tracked', []);
  const container = document.getElementById('tracked-products');
  
  if (tracked.length === 0) {
    container.innerHTML = '<p class="info-text">Нет отслеживаемых товаров</p>';
    return;
  }

  container.innerHTML = tracked.map(product => `
    <div class="tracked-item">
      <div class="tracked-item-title">${product.title}</div>
      <div>
        <span class="tracked-item-price">Загрузка...</span>
      </div>
      <div style="margin-top: 8px; font-size: 11px; color: var(--text-secondary);">
        Добавлено: ${Utils.formatDate(product.addedAt)}
      </div>
    </div>
  `).join('');

  // Load current prices for tracked products
  for (const product of tracked) {
    try {
      const history = await api.getPriceHistory(product.id);
      // Update UI with real price data
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  }
}

async function loadSettings() {
  const settings = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, {
    updateInterval: 30,
    autoAnalysis: true,
    notifications: true
  });

  document.getElementById('update-interval').value = settings.updateInterval;
  document.getElementById('auto-analysis').checked = settings.autoAnalysis;
  document.getElementById('notifications').checked = settings.notifications;
}

async function saveSettings() {
  const settings = {
    updateInterval: parseInt(document.getElementById('update-interval').value),
    autoAnalysis: document.getElementById('auto-analysis').checked,
    notifications: document.getElementById('notifications').checked
  };

  await Utils.saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  alert('Настройки сохранены');
}

async function logout() {
  if (confirm('Вы уверены, что хотите выйти?')) {
    await Utils.removeFromStorage(CONFIG.STORAGE_KEYS.USER_SESSION);
    await Utils.removeFromStorage(CONFIG.STORAGE_KEYS.API_KEY);
    window.location.reload();
  }
}

function updateStatusBadge(status) {
  const badge = document.getElementById('status-badge');
  if (status === 'online') {
    badge.innerHTML = '<span class="badge success">Онлайн</span>';
  } else {
    badge.innerHTML = '<span class="badge danger">Оффлайн</span>';
  }
}

function showSection(id) {
  document.getElementById(id).style.display = 'block';
}

function hideSection(id) {
  document.getElementById(id).style.display = 'none';
}

function showElement(id) {
  document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}
