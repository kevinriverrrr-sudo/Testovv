const apiKeyService = require('../services/apiKeyService');

// Middleware to require API key
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      message: 'Please provide an API key in the X-API-Key header'
    });
  }

  try {
    const validation = apiKeyService.validateApiKey(apiKey);

    if (!validation.valid) {
      return res.status(401).json({
        error: 'Invalid API key',
        message: validation.message
      });
    }

    // Attach key info to request
    req.apiKeyInfo = validation;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'API key validation failed',
      message: error.message
    });
  }
};

// Middleware to require session token
const requireSession = (req, res, next) => {
  const sessionToken = req.headers['x-session-token'];

  if (!sessionToken) {
    return res.status(401).json({
      error: 'Session token is required',
      message: 'Please provide a session token in the X-Session-Token header'
    });
  }

  // Session validation would be done here
  // For now, just pass through
  next();
};

module.exports = {
  requireApiKey,
  requireSession
};
