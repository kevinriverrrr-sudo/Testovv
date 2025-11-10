const FunPayAPI = {
  baseUrl: 'https://funpay.com',

  async fetchWithAuth(url, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async getCategoryData(categoryId) {
    try {
      const response = await fetch(`${this.baseUrl}/chips/${categoryId}/`);
      const html = await response.text();
      return html;
    } catch (error) {
      console.error('Failed to fetch category data:', error);
      return null;
    }
  },

  async getSellerProfile(sellerId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${sellerId}/`);
      const html = await response.text();
      return html;
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
      return null;
    }
  },

  async searchLots(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        query,
        ...filters
      });
      
      const response = await fetch(`${this.baseUrl}/chips/search?${params}`);
      const html = await response.text();
      return html;
    } catch (error) {
      console.error('Failed to search lots:', error);
      return null;
    }
  }
};

const BackendAPI = {
  apiUrl: 'https://api.funpayhelper.com',

  async authenticate() {
    const token = await FPHStorage.get('authToken');
    return token;
  },

  async syncBlacklist(blacklist) {
    try {
      const token = await this.authenticate();
      if (!token) {
        console.log('No auth token, skipping sync');
        return false;
      }

      const response = await fetch(`${this.apiUrl}/sync/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blacklist })
      });

      return response.ok;
    } catch (error) {
      console.error('Blacklist sync failed:', error);
      return false;
    }
  },

  async getBlacklist() {
    try {
      const token = await this.authenticate();
      if (!token) {
        return await FPHStorage.get('blacklist', []);
      }

      const response = await fetch(`${this.apiUrl}/sync/blacklist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.blacklist || [];
      }

      return await FPHStorage.get('blacklist', []);
    } catch (error) {
      console.error('Failed to get blacklist from server:', error);
      return await FPHStorage.get('blacklist', []);
    }
  },

  async reportStats(stats) {
    try {
      const token = await this.authenticate();
      if (!token) return false;

      const response = await fetch(`${this.apiUrl}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(stats)
      });

      return response.ok;
    } catch (error) {
      console.error('Stats reporting failed:', error);
      return false;
    }
  }
};
