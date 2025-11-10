console.log('FunPay Helper: Content script loaded');

let settings = {};
let currentPageType = null;

async function init() {
  settings = await chrome.storage.sync.get(null);
  detectPageType();
  
  if (settings.darkTheme) {
    document.documentElement.classList.add('fph-dark-theme');
  }

  if (settings.showQuickStats) {
    injectQuickStatsBar();
  }

  if (settings.showSellerScore) {
    addSellerScores();
  }

  if (settings.autoResponderEnabled) {
    setupAutoResponder();
  }

  if (settings.priceTrackerEnabled) {
    addPriceTrackerButtons();
  }

  if (settings.hideBanners) {
    hideBanners();
  }

  if (settings.fixedFilters) {
    makeFiltersFixed();
  }

  addBulkHideControls();
  addPriceCharts();
  setupExportButton();
  
  observeDOMChanges();
}

function detectPageType() {
  const path = window.location.pathname;
  
  if (path.includes('/chips/')) {
    currentPageType = 'category';
  } else if (path.includes('/users/')) {
    currentPageType = 'profile';
  } else if (path.includes('/chat/') || path.includes('/orders/')) {
    currentPageType = 'chat';
  } else {
    currentPageType = 'other';
  }
  
  console.log('Page type detected:', currentPageType);
}

function injectQuickStatsBar() {
  if (currentPageType !== 'category') return;

  const existingBar = document.querySelector('.fph-quick-stats');
  if (existingBar) return;

  const statsBar = document.createElement('div');
  statsBar.className = 'fph-quick-stats';
  statsBar.innerHTML = `
    <div class="fph-stats-container">
      <div class="fph-stat-item">
        <span class="fph-stat-label">Медианная цена:</span>
        <span class="fph-stat-value" id="fph-median-price">Загрузка...</span>
      </div>
      <div class="fph-stat-item">
        <span class="fph-stat-label">Онлайн продавцов:</span>
        <span class="fph-stat-value" id="fph-online-sellers">Загрузка...</span>
      </div>
      <div class="fph-stat-item">
        <span class="fph-stat-label">Новых лотов за 24ч:</span>
        <span class="fph-stat-value" id="fph-new-lots">Загрузка...</span>
      </div>
    </div>
  `;

  const header = document.querySelector('header, .header, nav');
  if (header) {
    header.parentNode.insertBefore(statsBar, header.nextSibling);
  } else {
    document.body.insertBefore(statsBar, document.body.firstChild);
  }

  updateQuickStats();
}

async function updateQuickStats() {
  const lots = collectLotsFromPage();
  const stats = FunPayParser.calculateStats(lots);

  const medianElement = document.getElementById('fph-median-price');
  const onlineElement = document.getElementById('fph-online-sellers');
  const newLotsElement = document.getElementById('fph-new-lots');

  if (medianElement) {
    medianElement.textContent = `${stats.median} ₽`;
  }

  if (onlineElement) {
    const onlineCount = document.querySelectorAll('.online, [class*="online"]').length;
    onlineElement.textContent = onlineCount;
  }

  if (newLotsElement) {
    const previousLots = await FPHStorage.get('previousLots_' + getCategoryId(), []);
    const newPercentage = FunPayParser.calculateNewLotsPercentage(lots, previousLots);
    newLotsElement.textContent = `${newPercentage}%`;
    
    await FPHStorage.set('previousLots_' + getCategoryId(), lots);
  }
}

function collectLotsFromPage() {
  const lots = [];
  const lotElements = document.querySelectorAll('.tc-item, .offer-list-item, [class*="lot-"]');

  lotElements.forEach((element, index) => {
    const priceElement = element.querySelector('.tc-price, .offer-price, [class*="price"]');
    const titleElement = element.querySelector('.tc-title, .offer-title, [class*="title"]');
    
    if (priceElement) {
      const priceText = priceElement.textContent;
      const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      lots.push({
        id: element.getAttribute('data-lot-id') || element.getAttribute('data-id') || `lot_${index}`,
        title: titleElement?.textContent?.trim() || 'Unknown',
        price: price || 0
      });
    }
  });

  return lots;
}

function getCategoryId() {
  const match = window.location.pathname.match(/\/chips\/(\d+)/);
  return match ? match[1] : 'unknown';
}

async function addSellerScores() {
  const sellerElements = document.querySelectorAll('.tc-seller, .seller-name, [class*="seller"]');

  for (const element of sellerElements) {
    if (element.querySelector('.fph-seller-score')) continue;

    const sellerId = element.getAttribute('data-seller-id') || 
                     element.closest('[data-seller-id]')?.getAttribute('data-seller-id');

    if (!sellerId) continue;

    const sellerData = await getSellerData(sellerId);
    const scoreResult = await chrome.runtime.sendMessage({
      action: 'calculateSellerScore',
      sellerData
    });

    if (scoreResult.success) {
      const badge = document.createElement('span');
      badge.className = `fph-seller-score fph-score-${scoreResult.color}`;
      badge.textContent = `${scoreResult.score}%`;
      badge.title = `${scoreResult.level}\n${scoreResult.reasons.join('\n')}`;
      
      element.appendChild(badge);
    }
  }
}

async function getSellerData(sellerId) {
  const cached = await FPHStorage.get(`seller_${sellerId}`);
  if (cached && (Date.now() - cached.timestamp) < 3600000) {
    return cached.data;
  }

  const html = await FunPayAPI.getSellerProfile(sellerId);
  if (!html) {
    return {
      accountAge: 0,
      reviewStats: { percentage: 0, total: 0 },
      totalDeals: 0,
      hasContacts: { telegram: false, discord: false }
    };
  }

  const sellerData = FunPayParser.parseSellerProfile(html);
  
  await FPHStorage.set(`seller_${sellerId}`, {
    data: sellerData,
    timestamp: Date.now()
  });

  return sellerData;
}

function setupAutoResponder() {
  if (currentPageType !== 'chat') return;

  const chatInput = document.querySelector('textarea[name="message"], .chat-input textarea, #message');
  if (!chatInput) return;

  if (document.querySelector('.fph-template-button')) return;

  const button = document.createElement('button');
  button.className = 'fph-template-button';
  button.textContent = '📋 Шаблоны';
  button.title = 'Вставить шаблон (Ctrl+Shift+R)';
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    showTemplateMenu(chatInput);
  });

  chatInput.parentElement.appendChild(button);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      showTemplateMenu(chatInput);
    }
  });
}

async function showTemplateMenu(inputElement) {
  const templates = await FPHStorage.get('templates', []);

  const existingMenu = document.querySelector('.fph-template-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const menu = document.createElement('div');
  menu.className = 'fph-template-menu';
  
  templates.forEach(template => {
    const item = document.createElement('div');
    item.className = 'fph-template-item';
    item.textContent = template.name;
    item.addEventListener('click', () => {
      inputElement.value = template.text;
      inputElement.focus();
      menu.remove();
    });
    menu.appendChild(item);
  });

  const manageItem = document.createElement('div');
  manageItem.className = 'fph-template-item fph-template-manage';
  manageItem.textContent = '⚙️ Управление шаблонами';
  manageItem.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    menu.remove();
  });
  menu.appendChild(manageItem);

  document.body.appendChild(menu);

  const rect = inputElement.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.bottom = `${window.innerHeight - rect.top}px`;
  menu.style.left = `${rect.left}px`;

  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

function addPriceTrackerButtons() {
  if (currentPageType !== 'category') return;

  const existingButton = document.querySelector('.fph-track-button');
  if (existingButton) return;

  const button = document.createElement('button');
  button.className = 'fph-track-button';
  button.textContent = '👁️ Следить за ценами';
  
  button.addEventListener('click', () => {
    showPriceTrackerDialog();
  });

  const filterContainer = document.querySelector('.filter-container, .filters, [class*="filter"]');
  if (filterContainer) {
    filterContainer.appendChild(button);
  } else {
    const container = document.createElement('div');
    container.className = 'fph-tracker-container';
    container.appendChild(button);
    document.body.insertBefore(container, document.body.firstChild);
  }
}

async function showPriceTrackerDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'fph-dialog';
  dialog.innerHTML = `
    <div class="fph-dialog-content">
      <h3>Отслеживание цен</h3>
      <p>Получайте уведомления, когда цена упадёт ниже указанного порога</p>
      <div class="fph-dialog-field">
        <label for="fph-threshold">Порог цены (₽):</label>
        <input type="number" id="fph-threshold" placeholder="Например: 500">
      </div>
      <div class="fph-dialog-actions">
        <button class="fph-btn-primary" id="fph-save-tracker">Сохранить</button>
        <button class="fph-btn-secondary" id="fph-cancel-tracker">Отмена</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById('fph-save-tracker').addEventListener('click', async () => {
    const threshold = parseFloat(document.getElementById('fph-threshold').value);
    
    if (!threshold || threshold <= 0) {
      alert('Пожалуйста, укажите корректный порог цены');
      return;
    }

    const result = await chrome.runtime.sendMessage({
      action: 'addTrackedItem',
      data: {
        categoryId: getCategoryId(),
        threshold,
        filters: {}
      }
    });

    if (result.success) {
      alert('Отслеживание добавлено! Вы получите уведомление, когда появится подходящий лот.');
      dialog.remove();
    } else {
      alert('Ошибка при добавлении отслеживания: ' + result.error);
    }
  });

  document.getElementById('fph-cancel-tracker').addEventListener('click', () => {
    dialog.remove();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.remove();
    }
  });
}

function addBulkHideControls() {
  const lotElements = document.querySelectorAll('.tc-item, .offer-list-item');

  lotElements.forEach(element => {
    if (element.querySelector('.fph-hide-button')) return;

    const hideButton = document.createElement('button');
    hideButton.className = 'fph-hide-button';
    hideButton.textContent = '✕';
    hideButton.title = 'Скрыть этот лот';
    
    hideButton.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const sellerId = element.getAttribute('data-seller-id') || 
                       element.querySelector('[data-seller-id]')?.getAttribute('data-seller-id');
      
      const result = await showHideMenu(sellerId);
      
      if (result === 'hide-lot') {
        element.style.display = 'none';
      } else if (result === 'hide-seller') {
        await addToBlacklist(sellerId);
        hideAllLotsFromSeller(sellerId);
      }
    });

    element.style.position = 'relative';
    element.appendChild(hideButton);
  });
}

async function showHideMenu(sellerId) {
  return new Promise((resolve) => {
    const menu = document.createElement('div');
    menu.className = 'fph-hide-menu';
    menu.innerHTML = `
      <div class="fph-hide-menu-item" data-action="hide-lot">Скрыть этот лот</div>
      <div class="fph-hide-menu-item" data-action="hide-seller">Скрыть все лоты продавца</div>
      <div class="fph-hide-menu-item" data-action="blacklist">Добавить в чёрный список</div>
    `;

    document.body.appendChild(menu);

    menu.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      menu.remove();
      
      if (action === 'blacklist') {
        addToBlacklist(sellerId);
        hideAllLotsFromSeller(sellerId);
        resolve('hide-seller');
      } else {
        resolve(action);
      }
    });

    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
          resolve(null);
        }
      });
    }, 100);
  });
}

async function addToBlacklist(sellerId) {
  const blacklist = await FPHStorage.get('blacklist', []);
  
  if (!blacklist.includes(sellerId)) {
    blacklist.push(sellerId);
    await FPHStorage.set('blacklist', blacklist);
    
    BackendAPI.syncBlacklist(blacklist);
  }
}

function hideAllLotsFromSeller(sellerId) {
  const lotElements = document.querySelectorAll(`[data-seller-id="${sellerId}"]`);
  lotElements.forEach(element => {
    element.closest('.tc-item, .offer-list-item')?.style.setProperty('display', 'none', 'important');
  });
}

function addPriceCharts() {
  if (currentPageType !== 'category') return;

  const existingChart = document.querySelector('.fph-price-chart');
  if (existingChart) return;

  const chartButton = document.createElement('button');
  chartButton.className = 'fph-chart-button';
  chartButton.textContent = '📊 График цен';
  
  chartButton.addEventListener('click', () => {
    showPriceChart();
  });

  const statsBar = document.querySelector('.fph-quick-stats');
  if (statsBar) {
    statsBar.appendChild(chartButton);
  }
}

async function showPriceChart() {
  const categoryId = getCategoryId();
  const priceHistory = await priceHistoryDB.getPriceHistory(categoryId, 30);

  const chartOverlay = document.createElement('div');
  chartOverlay.className = 'fph-chart-overlay';
  
  const chartContainer = document.createElement('div');
  chartContainer.className = 'fph-chart-container';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'fph-price-canvas';
  canvas.width = 800;
  canvas.height = 400;
  
  chartContainer.innerHTML = `
    <div class="fph-chart-header">
      <h3>График средней цены</h3>
      <button class="fph-chart-close">✕</button>
    </div>
    <div class="fph-chart-tabs">
      <button class="fph-chart-tab active" data-days="7">7 дней</button>
      <button class="fph-chart-tab" data-days="30">30 дней</button>
      <button class="fph-chart-tab fph-premium" data-days="90">90 дней (Premium)</button>
    </div>
  `;
  
  chartContainer.appendChild(canvas);
  chartOverlay.appendChild(chartContainer);
  document.body.appendChild(chartOverlay);

  drawPriceChart(canvas, priceHistory);

  chartContainer.querySelector('.fph-chart-close').addEventListener('click', () => {
    chartOverlay.remove();
  });

  chartOverlay.addEventListener('click', (e) => {
    if (e.target === chartOverlay) {
      chartOverlay.remove();
    }
  });

  const tabs = chartContainer.querySelectorAll('.fph-chart-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const days = parseInt(tab.getAttribute('data-days'));
      
      if (days === 90 && !settings.isPremium) {
        alert('График за 90 дней доступен только в Premium версии');
        return;
      }

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const history = await priceHistoryDB.getPriceHistory(categoryId, days);
      drawPriceChart(canvas, history);
    });
  });
}

function drawPriceChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!data || data.length === 0) {
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Недостаточно данных для построения графика', canvas.width / 2, canvas.height / 2);
    return;
  }

  const padding = 50;
  const graphWidth = canvas.width - padding * 2;
  const graphHeight = canvas.height - padding * 2;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 3;
  ctx.beginPath();

  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    const y = canvas.height - padding - ((point.price - minPrice) / priceRange) * graphHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  ctx.fillStyle = '#4CAF50';
  data.forEach((point, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    const y = canvas.height - padding - ((point.price - minPrice) / priceRange) * graphHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${minPrice.toFixed(2)} ₽`, padding, canvas.height - padding + 20);
  ctx.fillText(`${maxPrice.toFixed(2)} ₽`, padding, padding - 10);
}

function setupExportButton() {
  if (currentPageType !== 'chat') return;

  const existingButton = document.querySelector('.fph-export-button');
  if (existingButton) return;

  const exportButton = document.createElement('button');
  exportButton.className = 'fph-export-button';
  exportButton.textContent = '📄 Экспорт переписки';
  exportButton.title = 'Экспорт переписки для спора';
  
  exportButton.addEventListener('click', () => {
    exportChatToArchive();
  });

  const chatHeader = document.querySelector('.chat-header, [class*="chat-head"]');
  if (chatHeader) {
    chatHeader.appendChild(exportButton);
  }
}

async function exportChatToArchive() {
  const messages = [];
  const messageElements = document.querySelectorAll('.message, .chat-message, [class*="message"]');

  messageElements.forEach(element => {
    const author = element.querySelector('.message-author, .author, [class*="author"]')?.textContent?.trim();
    const text = element.querySelector('.message-text, .text, [class*="text"]')?.textContent?.trim();
    const time = element.querySelector('.message-time, .time, [class*="time"]')?.textContent?.trim();

    if (text) {
      messages.push({ author, text, time });
    }
  });

  const chatData = {
    seller: document.querySelector('.chat-seller, [class*="seller-name"]')?.textContent?.trim(),
    lotUrl: window.location.href,
    messages,
    exportDate: new Date().toISOString(),
    screenshots: []
  };

  const result = await chrome.runtime.sendMessage({
    action: 'exportChat',
    chatData
  });

  if (result.success) {
    downloadExport(result.pdf, `funpay-chat-${Date.now()}.txt`);
    alert('Переписка экспортирована! Файл сохранён в папку загрузок.');
  } else {
    alert('Ошибка при экспорте: ' + result.error);
  }
}

function downloadExport(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

function hideBanners() {
  const banners = document.querySelectorAll('.banner, .ad, .advertisement, [class*="promo"]');
  banners.forEach(banner => {
    banner.style.display = 'none';
  });
}

function makeFiltersFixed() {
  const filters = document.querySelector('.filters, .filter-container, [class*="filter"]');
  if (filters) {
    filters.classList.add('fph-fixed-filters');
  }
}

function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (settings.showSellerScore && node.classList?.contains('tc-item')) {
              addSellerScores();
            }
            if (node.classList?.contains('offer-list-item')) {
              addBulkHideControls();
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      settings[key] = newValue;
      
      if (key === 'darkTheme') {
        document.documentElement.classList.toggle('fph-dark-theme', newValue);
      }
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
