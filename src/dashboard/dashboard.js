let currentTab = 'overview';
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  initializeDashboard();
  attachEventListeners();
});

function initializeDashboard() {
  loadTab('overview');
}

function attachEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });

  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    loadTab(currentTab);
  });

  document.getElementById('export-btn')?.addEventListener('click', exportData);
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-tab="${tab}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  currentTab = tab;
  
  const titles = {
    overview: 'Обзор',
    products: 'Мои товары',
    competitors: 'Конкуренты',
    analytics: 'Аналитика',
    automation: 'Автоматизация',
    settings: 'Настройки',
  };
  
  document.getElementById('page-title').textContent = titles[tab] || 'Dashboard';
  
  loadTab(tab);
}

async function loadTab(tab) {
  const content = document.getElementById('tab-content');
  content.innerHTML = '<div class="loading">Загрузка...</div>';

  try {
    switch (tab) {
      case 'overview':
        await loadOverviewTab(content);
        break;
      case 'products':
        await loadProductsTab(content);
        break;
      case 'competitors':
        await loadCompetitorsTab(content);
        break;
      case 'analytics':
        await loadAnalyticsTab(content);
        break;
      case 'automation':
        await loadAutomationTab(content);
        break;
      case 'settings':
        await loadSettingsTab(content);
        break;
    }
  } catch (error) {
    content.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }
}

async function loadOverviewTab(content) {
  const stats = await getStatistics();
  
  content.innerHTML = `
    <div class="overview-grid">
      <div class="stat-card large">
        <h3>Общая статистика</h3>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">${stats.totalProducts || 0}</div>
            <div class="stat-label">Товаров</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${formatPrice(stats.averagePrice || 0)}</div>
            <div class="stat-label">Средняя цена</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.totalSales || 0}</div>
            <div class="stat-label">Продаж</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${formatPrice(stats.totalRevenue || 0)}</div>
            <div class="stat-label">Выручка</div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <h3>Конкуренты</h3>
        <div class="stat-value">${stats.competitorsTracked || 0}</div>
        <p class="stat-description">Отслеживается конкурентов</p>
        <button class="btn btn-sm" onclick="switchTab('competitors')">Посмотреть</button>
      </div>

      <div class="stat-card">
        <h3>Рекомендации</h3>
        <div class="stat-value">${stats.recommendations || 0}</div>
        <p class="stat-description">Активных рекомендаций</p>
        <button class="btn btn-sm" onclick="switchTab('products')">Применить</button>
      </div>

      <div class="chart-card">
        <h3>Динамика цен</h3>
        <canvas id="price-trend-chart"></canvas>
      </div>

      <div class="chart-card">
        <h3>Продажи по дням</h3>
        <canvas id="sales-chart"></canvas>
      </div>

      <div class="recent-activity">
        <h3>Последняя активность</h3>
        <div id="activity-list"></div>
      </div>
    </div>
  `;

  await renderPriceTrendChart();
  await renderSalesChart();
  await loadRecentActivity();
}

async function loadProductsTab(content) {
  const products = await getProducts();
  
  content.innerHTML = `
    <div class="products-header">
      <div class="search-box">
        <input type="text" id="product-search" placeholder="Поиск товаров...">
      </div>
      <div class="actions">
        <button id="bulk-update-btn" class="btn btn-primary">Массовое обновление цен</button>
        <button id="add-product-btn" class="btn btn-secondary">Добавить товар</button>
      </div>
    </div>
    
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all"></th>
            <th>Название</th>
            <th>Текущая цена</th>
            <th>Рекомендуемая цена</th>
            <th>Конкуренты</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody id="products-tbody">
          ${products.map(product => `
            <tr data-id="${product.id}">
              <td><input type="checkbox" class="product-checkbox" value="${product.id}"></td>
              <td>${product.title}</td>
              <td class="price">${formatPrice(product.price)}</td>
              <td class="price recommended">${formatPrice(product.recommendedPrice || product.price)}</td>
              <td>${product.competitors || 0}</td>
              <td><span class="badge badge-${product.status || 'active'}">${product.status || 'Активен'}</span></td>
              <td>
                <button class="btn-icon" onclick="editProduct('${product.id}')" title="Редактировать">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button class="btn-icon" onclick="analyzeProduct('${product.id}')" title="Анализ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  attachProductsEventListeners();
}

async function loadCompetitorsTab(content) {
  const competitors = await getCompetitors();
  
  content.innerHTML = `
    <div class="competitors-header">
      <div class="search-box">
        <input type="text" id="competitor-search" placeholder="Поиск конкурентов...">
      </div>
      <button id="track-competitor-btn" class="btn btn-primary">Добавить конкурента</button>
    </div>

    <div class="competitors-grid">
      ${competitors.map(comp => `
        <div class="competitor-card" data-id="${comp.id}">
          <div class="competitor-header">
            <h4>${comp.seller}</h4>
            <button class="btn-icon" onclick="removeCompetitor('${comp.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="competitor-info">
            <div class="info-row">
              <span class="label">Рейтинг:</span>
              <span class="value">${comp.rating || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label">Отзывов:</span>
              <span class="value">${comp.reviews || 0}</span>
            </div>
            <div class="info-row">
              <span class="label">Товаров:</span>
              <span class="value">${comp.productsCount || 0}</span>
            </div>
            <div class="info-row">
              <span class="label">Средняя цена:</span>
              <span class="value price">${formatPrice(comp.avgPrice || 0)}</span>
            </div>
          </div>
          <div class="competitor-actions">
            <button class="btn btn-sm" onclick="viewCompetitor('${comp.id}')">Подробнее</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function loadAnalyticsTab(content) {
  content.innerHTML = `
    <div class="analytics-container">
      <div class="analytics-filters">
        <select id="analytics-period">
          <option value="7">Последние 7 дней</option>
          <option value="30" selected>Последние 30 дней</option>
          <option value="90">Последние 90 дней</option>
          <option value="365">Последний год</option>
        </select>
        <button id="apply-filter-btn" class="btn btn-secondary">Применить</button>
      </div>

      <div class="charts-grid">
        <div class="chart-card large">
          <h3>Тренд продаж</h3>
          <canvas id="sales-trend-chart"></canvas>
        </div>

        <div class="chart-card">
          <h3>Распределение цен</h3>
          <canvas id="price-distribution-chart"></canvas>
        </div>

        <div class="chart-card">
          <h3>Популярные категории</h3>
          <canvas id="categories-chart"></canvas>
        </div>

        <div class="chart-card">
          <h3>Лучшее время для продажи</h3>
          <canvas id="optimal-time-chart"></canvas>
        </div>
      </div>

      <div class="insights-section">
        <h3>Инсайты и рекомендации</h3>
        <div id="insights-list"></div>
      </div>
    </div>
  `;

  await renderAnalyticsCharts();
}

async function loadAutomationTab(content) {
  const settings = await chrome.storage.local.get([
    'autoUpdate',
    'autoAdjustPrices',
    'priceStrategy',
    'notifications',
  ]);

  content.innerHTML = `
    <div class="automation-container">
      <div class="settings-card">
        <h3>Автоматическое обновление цен</h3>
        <div class="setting-item">
          <label class="toggle">
            <input type="checkbox" id="auto-update" ${settings.autoUpdate ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <div class="setting-description">
            <strong>Автообновление</strong>
            <p>Автоматически обновлять данные конкурентов</p>
          </div>
        </div>

        <div class="setting-item">
          <label class="toggle">
            <input type="checkbox" id="auto-adjust-prices" ${settings.autoAdjustPrices ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <div class="setting-description">
            <strong>Автокорректировка цен</strong>
            <p>Автоматически корректировать цены на основе рекомендаций</p>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <h3>Стратегия ценообразования</h3>
        <select id="price-strategy" class="form-control">
          <option value="aggressive" ${settings.priceStrategy === 'aggressive' ? 'selected' : ''}>
            Агрессивная (самые низкие цены)
          </option>
          <option value="competitive" ${settings.priceStrategy === 'competitive' ? 'selected' : ''}>
            Конкурентная (оптимальный баланс)
          </option>
          <option value="premium" ${settings.priceStrategy === 'premium' ? 'selected' : ''}>
            Премиум (высокая маржа)
          </option>
          <option value="average" ${settings.priceStrategy === 'average' ? 'selected' : ''}>
            Средняя (следовать за рынком)
          </option>
        </select>
        <p class="help-text">Выберите стратегию для автоматических рекомендаций цен</p>
      </div>

      <div class="settings-card">
        <h3>Уведомления</h3>
        <div class="setting-item">
          <label class="toggle">
            <input type="checkbox" id="notifications" ${settings.notifications ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
          <div class="setting-description">
            <strong>Уведомления</strong>
            <p>Получать уведомления об изменениях цен и рекомендациях</p>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <h3>История автоматизации</h3>
        <div id="automation-history"></div>
      </div>

      <button id="save-automation" class="btn btn-primary">Сохранить настройки</button>
    </div>
  `;

  attachAutomationEventListeners();
}

async function loadSettingsTab(content) {
  content.innerHTML = `
    <div class="settings-container">
      <div class="settings-card">
        <h3>Общие настройки</h3>
        <div class="form-group">
          <label>Интервал обновления (минуты)</label>
          <input type="number" id="update-interval" class="form-control" value="15" min="5" max="120">
        </div>
        <div class="form-group">
          <label>Backend URL</label>
          <input type="text" id="backend-url" class="form-control" value="http://localhost:3000/api">
        </div>
      </div>

      <div class="settings-card">
        <h3>Данные</h3>
        <div class="data-actions">
          <button id="export-all-data" class="btn btn-secondary">Экспортировать все данные</button>
          <button id="import-data" class="btn btn-secondary">Импортировать данные</button>
          <button id="clear-data" class="btn btn-danger">Очистить все данные</button>
        </div>
      </div>

      <div class="settings-card">
        <h3>О расширении</h3>
        <p>FunPay Pro v1.0.0</p>
        <p>Полнофункциональное расширение для анализа и автоматизации торговли на FunPay.com</p>
      </div>

      <button id="save-settings" class="btn btn-primary">Сохранить</button>
    </div>
  `;

  attachSettingsEventListeners();
}

function attachProductsEventListeners() {
  document.getElementById('select-all')?.addEventListener('change', (e) => {
    document.querySelectorAll('.product-checkbox').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });

  document.getElementById('bulk-update-btn')?.addEventListener('click', bulkUpdatePrices);
}

function attachAutomationEventListeners() {
  document.getElementById('save-automation')?.addEventListener('click', async () => {
    const settings = {
      autoUpdate: document.getElementById('auto-update').checked,
      autoAdjustPrices: document.getElementById('auto-adjust-prices').checked,
      priceStrategy: document.getElementById('price-strategy').value,
      notifications: document.getElementById('notifications').checked,
    };

    await chrome.storage.local.set(settings);
    showNotification('Настройки сохранены', 'success');
  });
}

function attachSettingsEventListeners() {
  document.getElementById('save-settings')?.addEventListener('click', async () => {
    const settings = {
      updateInterval: parseInt(document.getElementById('update-interval').value),
      backendUrl: document.getElementById('backend-url').value,
    };

    await chrome.storage.local.set(settings);
    showNotification('Настройки сохранены', 'success');
  });

  document.getElementById('export-all-data')?.addEventListener('click', exportData);
  document.getElementById('clear-data')?.addEventListener('click', clearAllData);
}

async function getStatistics() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatistics' });
    return response.statistics || {};
  } catch (error) {
    console.error('Failed to get statistics:', error);
    return {};
  }
}

async function getProducts() {
  return [
    { id: '1', title: 'Продукт 1', price: 1000, recommendedPrice: 950, competitors: 5, status: 'active' },
    { id: '2', title: 'Продукт 2', price: 2000, recommendedPrice: 1800, competitors: 3, status: 'active' },
  ];
}

async function getCompetitors() {
  return [
    { id: '1', seller: 'Competitor 1', rating: 4.5, reviews: 120, productsCount: 25, avgPrice: 1500 },
    { id: '2', seller: 'Competitor 2', rating: 4.8, reviews: 200, productsCount: 40, avgPrice: 1800 },
  ];
}

async function renderPriceTrendChart() {
  const ctx = document.getElementById('price-trend-chart');
  if (!ctx) return;

  charts.priceTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      datasets: [{
        label: 'Средняя цена',
        data: [1200, 1150, 1180, 1100, 1050, 1080, 1020],
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

async function renderSalesChart() {
  const ctx = document.getElementById('sales-chart');
  if (!ctx) return;

  charts.sales = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      datasets: [{
        label: 'Продажи',
        data: [3, 5, 2, 8, 6, 9, 7],
        backgroundColor: '#667eea',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

async function renderAnalyticsCharts() {
  setTimeout(() => {
    renderPriceTrendChart();
    renderSalesChart();
  }, 100);
}

async function loadRecentActivity() {
  const activityList = document.getElementById('activity-list');
  if (!activityList) return;

  activityList.innerHTML = `
    <div class="activity-item">
      <div class="activity-icon">📊</div>
      <div class="activity-content">
        <strong>Цена обновлена</strong>
        <p>Товар "Пример" - 1000₽ → 950₽</p>
        <span class="time">2 часа назад</span>
      </div>
    </div>
  `;
}

async function exportData() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'exportData' });
    
    if (response.data) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `funpay-pro-export-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      showNotification('Данные экспортированы', 'success');
    }
  } catch (error) {
    showNotification('Ошибка экспорта', 'error');
  }
}

async function clearAllData() {
  if (confirm('Вы уверены? Все данные будут удалены безвозвратно.')) {
    await chrome.storage.local.clear();
    showNotification('Данные очищены', 'success');
    location.reload();
  }
}

async function bulkUpdatePrices() {
  const selected = Array.from(document.querySelectorAll('.product-checkbox:checked'))
    .map(cb => cb.value);
  
  if (selected.length === 0) {
    showNotification('Выберите товары для обновления', 'warning');
    return;
  }

  showNotification(`Обновление ${selected.length} товаров...`, 'info');
}

function formatPrice(price) {
  return `${Math.floor(price)}₽`;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

window.switchTab = switchTab;
window.editProduct = (id) => console.log('Edit product:', id);
window.analyzeProduct = (id) => console.log('Analyze product:', id);
window.removeCompetitor = (id) => console.log('Remove competitor:', id);
window.viewCompetitor = (id) => console.log('View competitor:', id);
