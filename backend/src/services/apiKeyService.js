const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// In-memory storage (in production, use a database)
const apiKeys = new Map();

class ApiKeyService {
  generateApiKey(email) {
    // Generate a secure API key
    const apiKey = 'fp_' + crypto.randomBytes(32).toString('hex');
    
    const keyData = {
      key: apiKey,
      email,
      createdAt: Date.now(),
      lastUsed: null,
      requestCount: 0,
      isActive: true
    };

    apiKeys.set(apiKey, keyData);

    console.log(`API key generated for ${email}: ${apiKey}`);

    return {
      apiKey,
      email,
      createdAt: keyData.createdAt,
      message: 'API key generated successfully'
    };
  }

  validateApiKey(apiKey) {
    const keyData = apiKeys.get(apiKey);

    if (!keyData) {
      return {
        valid: false,
        message: 'Invalid API key'
      };
    }

    if (!keyData.isActive) {
      return {
        valid: false,
        message: 'API key has been revoked'
      };
    }

    // Update usage statistics
    keyData.lastUsed = Date.now();
    keyData.requestCount++;

    return {
      valid: true,
      email: keyData.email,
      requestCount: keyData.requestCount
    };
  }

  getApiKeyInfo(apiKey) {
    const keyData = apiKeys.get(apiKey);

    if (!keyData) {
      throw new Error('API key not found');
    }

    return {
      email: keyData.email,
      createdAt: keyData.createdAt,
      lastUsed: keyData.lastUsed,
      requestCount: keyData.requestCount,
      isActive: keyData.isActive
    };
  }

  revokeApiKey(apiKey) {
    const keyData = apiKeys.get(apiKey);

    if (!keyData) {
      throw new Error('API key not found');
    }

    keyData.isActive = false;

    return {
      success: true,
      message: 'API key revoked successfully'
    };
  }

  // Get all API keys for an email (admin function)
  getApiKeysByEmail(email) {
    const keys = [];
    
    for (const [key, data] of apiKeys.entries()) {
      if (data.email === email) {
        keys.push({
          key,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          requestCount: data.requestCount,
          isActive: data.isActive
        });
      }
    }

    return keys;
  }
}

module.exports = new ApiKeyService();
