class AuthManager {
  constructor() {
    this.isAuthenticated = false;
    this.userInfo = null;
  }

  async checkAuth() {
    try {
      const cookies = await this.getFunPayCookies();
      
      if (!cookies || cookies.length === 0) {
        this.isAuthenticated = false;
        return false;
      }

      const goldenKeyCookie = cookies.find(c => c.name === 'golden_key');
      const csrfTokenCookie = cookies.find(c => c.name === 'csrf_token');
      
      if (goldenKeyCookie || csrfTokenCookie) {
        this.isAuthenticated = true;
        await this.loadUserInfo();
        return true;
      }

      this.isAuthenticated = false;
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async getFunPayCookies() {
    try {
      if (typeof chrome !== 'undefined' && chrome.cookies) {
        return new Promise((resolve) => {
          chrome.cookies.getAll({ domain: 'funpay.com' }, (cookies) => {
            resolve(cookies || []);
          });
        });
      }
      return [];
    } catch (error) {
      console.error('Failed to get cookies:', error);
      return [];
    }
  }

  async getCookieValue(name) {
    const cookies = await this.getFunPayCookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  async loadUserInfo() {
    try {
      const userDataStr = await this.getCookieValue('user_data');
      if (userDataStr) {
        this.userInfo = JSON.parse(decodeURIComponent(userDataStr));
      } else {
        const result = await chrome.storage.local.get(['userInfo']);
        this.userInfo = result.userInfo || null;
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      this.userInfo = null;
    }
  }

  async saveUserInfo(userInfo) {
    this.userInfo = userInfo;
    await chrome.storage.local.set({ userInfo });
  }

  async getAuthHeaders() {
    const csrfToken = await this.getCookieValue('csrf_token');
    const goldenKey = await this.getCookieValue('golden_key');
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    if (goldenKey) {
      headers['X-Golden-Key'] = goldenKey;
    }

    return headers;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
      this.isAuthenticated = false;
      throw new Error('Authentication required');
    }

    return response;
  }

  async logout() {
    this.isAuthenticated = false;
    this.userInfo = null;
    await chrome.storage.local.remove(['userInfo']);
  }

  getUser() {
    return this.userInfo;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}

const authManager = new AuthManager();
export default authManager;
