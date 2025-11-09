const express = require('express');
const router = express.Router();
const apiKeyService = require('../services/apiKeyService');

// Generate new API key
router.post('/generate', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await apiKeyService.generateApiKey(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Validate API key
router.post('/validate', async (req, res, next) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const result = await apiKeyService.validateApiKey(apiKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get API key info
router.get('/info', async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const result = await apiKeyService.getApiKeyInfo(apiKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Revoke API key
router.delete('/revoke', async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const result = await apiKeyService.revokeApiKey(apiKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
