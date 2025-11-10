const FPHStorage = {
  async get(key, defaultValue = null) {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  async set(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  async getAll() {
    try {
      return await chrome.storage.sync.get(null);
    } catch (error) {
      console.error('Storage getAll error:', error);
      return {};
    }
  },

  async remove(key) {
    try {
      await chrome.storage.sync.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  async clear() {
    try {
      await chrome.storage.sync.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

class PriceHistoryDB {
  constructor() {
    this.dbName = 'FunPayHelperDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('priceHistory')) {
          const store = db.createObjectStore('priceHistory', { keyPath: 'id', autoIncrement: true });
          store.createIndex('categoryId', 'categoryId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('trackedItems')) {
          const trackedStore = db.createObjectStore('trackedItems', { keyPath: 'id', autoIncrement: true });
          trackedStore.createIndex('categoryId', 'categoryId', { unique: false });
        }
      };
    });
  }

  async addPriceRecord(categoryId, price, lotData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['priceHistory'], 'readwrite');
      const store = transaction.objectStore('priceHistory');
      
      const record = {
        categoryId,
        price,
        lotData,
        timestamp: Date.now()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPriceHistory(categoryId, days = 30) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['priceHistory'], 'readonly');
      const store = transaction.objectStore('priceHistory');
      const index = store.index('categoryId');
      
      const request = index.getAll(categoryId);
      
      request.onsuccess = () => {
        const allRecords = request.result;
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        const filtered = allRecords.filter(record => record.timestamp >= cutoffTime);
        resolve(filtered);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async addTrackedItem(categoryId, threshold, filters = {}) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readwrite');
      const store = transaction.objectStore('trackedItems');
      
      const item = {
        categoryId,
        threshold,
        filters,
        createdAt: Date.now(),
        active: true
      };

      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTrackedItems() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readonly');
      const store = transaction.objectStore('trackedItems');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeTrackedItem(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readwrite');
      const store = transaction.objectStore('trackedItems');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

const priceHistoryDB = new PriceHistoryDB();
