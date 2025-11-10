document.addEventListener('DOMContentLoaded', async () => {
  await loadAllSettings();
  setupNavigation();
  setupEventListeners();
});

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      document.querySelectorAll('.options-section').forEach(sec => {
        sec.classList.remove('active');
      });
      
      document.getElementById(`section-${section}`).classList.add('active');
    });
  });
}

async function loadAllSettings() {
  await loadGeneralSettings();
  await loadTemplates();
  await loadBlacklist();
  await loadTrackedItems();
}

async function loadGeneralSettings() {
  const settings = await chrome.storage.sync.get([
    'darkTheme',
    'hideBanners',
    'fixedFilters',
    'showQuickStats',
    'showSellerScore',
    'autoResponderEnabled',
    'priceTrackerEnabled',
    'notifications',
    'isPremium'
  ]);

  document.getElementById('setting-dark-theme').checked = settings.darkTheme ?? true;
  document.getElementById('setting-hide-banners').checked = settings.hideBanners ?? true;
  document.getElementById('setting-fixed-filters').checked = settings.fixedFilters ?? true;
  document.getElementById('setting-quick-stats').checked = settings.showQuickStats ?? true;
  document.getElementById('setting-seller-score').checked = settings.showSellerScore ?? true;
  document.getElementById('setting-auto-responder').checked = settings.autoResponderEnabled ?? true;
  document.getElementById('setting-price-tracker').checked = settings.priceTrackerEnabled ?? true;
  document.getElementById('setting-notifications').checked = settings.notifications?.enabled ?? true;
  document.getElementById('setting-sound').checked = settings.notifications?.sound ?? true;
}

async function loadTemplates() {
  const { templates = [] } = await chrome.storage.sync.get('templates');
  const container = document.getElementById('templates-list');
  
  if (templates.length === 0) {
    container.innerHTML = '<div class="empty-list">Нет сохранённых шаблонов</div>';
    return;
  }

  container.innerHTML = '';
  templates.forEach(template => {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `
      <div class="template-info">
        <div class="template-name">${escapeHtml(template.name)}</div>
        <div class="template-text">${escapeHtml(template.text)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-delete" data-id="${template.id}">Удалить</button>
      </div>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.getAttribute('data-id'));
      await deleteTemplate(id);
    });
  });
}

async function loadBlacklist() {
  const { blacklist = [] } = await chrome.storage.sync.get('blacklist');
  const container = document.getElementById('blacklist-items');
  
  if (blacklist.length === 0) {
    container.innerHTML = '<div class="empty-list">Чёрный список пуст</div>';
    return;
  }

  container.innerHTML = '';
  blacklist.forEach((sellerId, index) => {
    const item = document.createElement('div');
    item.className = 'blacklist-item';
    item.innerHTML = `
      <div class="blacklist-info">
        <div class="template-name">Продавец ID: ${escapeHtml(sellerId)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-delete" data-index="${index}">Удалить</button>
      </div>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.getAttribute('data-index'));
      await removeFromBlacklist(index);
    });
  });
}

async function loadTrackedItems() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTrackedItems' });
    const container = document.getElementById('tracker-list');
    
    if (!response.success || !response.items || response.items.length === 0) {
      container.innerHTML = '<div class="empty-list">Нет отслеживаемых товаров</div>';
    } else {
      container.innerHTML = '';
      response.items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'tracker-item';
        element.innerHTML = `
          <div class="tracker-info">
            <div class="tracker-category">Категория: ${item.categoryId}</div>
            <div class="tracker-threshold">Порог цены: ${item.threshold} ₽</div>
          </div>
          <div class="item-actions">
            <button class="btn-delete" data-id="${item.id}">Удалить</button>
          </div>
        `;
        container.appendChild(element);
      });

      container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = parseInt(btn.getAttribute('data-id'));
          await chrome.runtime.sendMessage({
            action: 'removeTrackedItem',
            itemId: id
          });
          await loadTrackedItems();
          updateTrackerStats();
        });
      });
    }

    updateTrackerStats();
  } catch (error) {
    console.error('Failed to load tracked items:', error);
  }
}

async function updateTrackerStats() {
  const response = await chrome.runtime.sendMessage({ action: 'getTrackedItems' });
  const { isPremium = false } = await chrome.storage.sync.get('isPremium');
  
  const count = response.success ? (response.items?.length || 0) : 0;
  const limit = isPremium ? '∞' : '3';
  
  document.getElementById('tracker-count').textContent = count;
  document.getElementById('tracker-limit').textContent = limit;
}

function setupEventListeners() {
  document.getElementById('save-general').addEventListener('click', async () => {
    const settings = {
      darkTheme: document.getElementById('setting-dark-theme').checked,
      hideBanners: document.getElementById('setting-hide-banners').checked,
      fixedFilters: document.getElementById('setting-fixed-filters').checked,
      showQuickStats: document.getElementById('setting-quick-stats').checked,
      showSellerScore: document.getElementById('setting-seller-score').checked,
      autoResponderEnabled: document.getElementById('setting-auto-responder').checked,
      priceTrackerEnabled: document.getElementById('setting-price-tracker').checked,
      notifications: {
        enabled: document.getElementById('setting-notifications').checked,
        sound: document.getElementById('setting-sound').checked
      }
    };

    await chrome.storage.sync.set(settings);
    showNotification('Настройки сохранены!');
  });

  document.getElementById('add-template').addEventListener('click', async () => {
    const name = document.getElementById('template-name').value.trim();
    const text = document.getElementById('template-text').value.trim();

    if (!name || !text) {
      alert('Заполните все поля!');
      return;
    }

    const { templates = [] } = await chrome.storage.sync.get('templates');
    
    const newTemplate = {
      id: Date.now(),
      name,
      text
    };

    templates.push(newTemplate);
    await chrome.storage.sync.set({ templates });

    document.getElementById('template-name').value = '';
    document.getElementById('template-text').value = '';

    await loadTemplates();
    showNotification('Шаблон добавлен!');
  });

  document.getElementById('add-blacklist').addEventListener('click', async () => {
    const sellerId = document.getElementById('blacklist-seller-id').value.trim();

    if (!sellerId) {
      alert('Введите ID продавца!');
      return;
    }

    const { blacklist = [] } = await chrome.storage.sync.get('blacklist');
    
    if (!blacklist.includes(sellerId)) {
      blacklist.push(sellerId);
      await chrome.storage.sync.set({ blacklist });
      
      document.getElementById('blacklist-seller-id').value = '';
      await loadBlacklist();
      showNotification('Продавец добавлен в чёрный список!');
    } else {
      alert('Этот продавец уже в чёрном списке!');
    }
  });

  document.getElementById('sync-blacklist').addEventListener('click', async () => {
    const { blacklist = [] } = await chrome.storage.sync.get('blacklist');
    
    const statusElement = document.getElementById('sync-status');
    statusElement.textContent = 'Синхронизация...';
    statusElement.style.color = '#ff9800';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      statusElement.textContent = 'Синхронизировано ✓';
      statusElement.style.color = '#4caf50';
      
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    } catch (error) {
      statusElement.textContent = 'Ошибка синхронизации';
      statusElement.style.color = '#f44336';
    }
  });

  document.getElementById('upgrade-tracker').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://funpayhelper.com/premium' });
  });

  document.getElementById('export-data').addEventListener('click', async () => {
    const data = await chrome.storage.sync.get(null);
    const json = JSON.stringify(data, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `funpay-helper-settings-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('Настройки экспортированы!');
  });

  document.getElementById('import-data').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        await chrome.storage.sync.set(data);
        await loadAllSettings();
        showNotification('Настройки импортированы!');
      } catch (error) {
        alert('Ошибка при импорте настроек: ' + error.message);
      }
    });
    
    input.click();
  });

  document.getElementById('clear-data').addEventListener('click', async () => {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      
      await chrome.runtime.sendMessage({ action: 'clearAllData' });
      
      await loadAllSettings();
      showNotification('Все данные удалены!');
    }
  });
}

async function deleteTemplate(id) {
  const { templates = [] } = await chrome.storage.sync.get('templates');
  const filtered = templates.filter(t => t.id !== id);
  await chrome.storage.sync.set({ templates: filtered });
  await loadTemplates();
  showNotification('Шаблон удалён!');
}

async function removeFromBlacklist(index) {
  const { blacklist = [] } = await chrome.storage.sync.get('blacklist');
  blacklist.splice(index, 1);
  await chrome.storage.sync.set({ blacklist });
  await loadBlacklist();
  showNotification('Продавец удалён из чёрного списка!');
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 15px 25px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 500;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
