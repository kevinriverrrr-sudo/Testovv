document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadTrackedItems();
  await loadStats();
  setupEventListeners();
});

async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'darkTheme',
    'showQuickStats',
    'showSellerScore',
    'autoResponderEnabled',
    'priceTrackerEnabled',
    'isPremium'
  ]);

  document.getElementById('toggle-dark-theme').checked = settings.darkTheme ?? true;
  document.getElementById('toggle-quick-stats').checked = settings.showQuickStats ?? true;
  document.getElementById('toggle-seller-score').checked = settings.showSellerScore ?? true;
  document.getElementById('toggle-auto-responder').checked = settings.autoResponderEnabled ?? true;
  document.getElementById('toggle-price-tracker').checked = settings.priceTrackerEnabled ?? true;

  if (settings.isPremium) {
    document.getElementById('subscription-status').textContent = 'Premium';
    document.getElementById('subscription-status').style.color = '#4caf50';
    document.getElementById('btn-upgrade').textContent = 'Premium активен ✓';
    document.getElementById('btn-upgrade').style.background = '#4caf50';
  }
}

async function loadTrackedItems() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getTrackedItems' });
    
    if (response.success && response.items && response.items.length > 0) {
      const container = document.getElementById('tracked-items-list');
      container.innerHTML = '';

      response.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'tracked-item';
        itemElement.innerHTML = `
          <div class="tracked-item-info">
            <div class="tracked-item-category">Категория: ${item.categoryId}</div>
            <div class="tracked-item-threshold">Порог: ${item.threshold} ₽</div>
          </div>
          <button class="tracked-item-remove" data-id="${item.id}">Удалить</button>
        `;
        container.appendChild(itemElement);
      });

      container.querySelectorAll('.tracked-item-remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const itemId = parseInt(btn.getAttribute('data-id'));
          await chrome.runtime.sendMessage({
            action: 'removeTrackedItem',
            itemId
          });
          await loadTrackedItems();
          await loadStats();
        });
      });
    }
  } catch (error) {
    console.error('Failed to load tracked items:', error);
  }
}

async function loadStats() {
  try {
    const storage = await chrome.storage.sync.get(['blacklist', 'templates']);
    
    const blacklist = storage.blacklist || [];
    const templates = storage.templates || [];

    document.getElementById('stat-blacklist').textContent = blacklist.length;
    document.getElementById('stat-templates').textContent = templates.length;

    const trackedResponse = await chrome.runtime.sendMessage({ action: 'getTrackedItems' });
    if (trackedResponse.success) {
      document.getElementById('stat-saved-lots').textContent = trackedResponse.items?.length || 0;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function setupEventListeners() {
  document.getElementById('toggle-dark-theme').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ darkTheme: e.target.checked });
  });

  document.getElementById('toggle-quick-stats').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ showQuickStats: e.target.checked });
  });

  document.getElementById('toggle-seller-score').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ showSellerScore: e.target.checked });
  });

  document.getElementById('toggle-auto-responder').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ autoResponderEnabled: e.target.checked });
  });

  document.getElementById('toggle-price-tracker').addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ priceTrackerEnabled: e.target.checked });
  });

  document.getElementById('btn-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('btn-upgrade').addEventListener('click', async () => {
    const isPremium = await chrome.storage.sync.get('isPremium');
    if (isPremium.isPremium) {
      alert('У вас уже активна Premium подписка!');
    } else {
      chrome.tabs.create({ url: 'https://funpayhelper.com/premium' });
    }
  });

  document.getElementById('link-support').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/funpay-helper/issues' });
  });

  document.getElementById('link-donate').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://funpayhelper.com/donate' });
  });
}
