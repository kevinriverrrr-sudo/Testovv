const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// Authenticate with cookies
router.post('/cookies', async (req, res, next) => {
  try {
    const { cookies } = req.body;
    
    if (!cookies || !Array.isArray(cookies)) {
      return res.status(400).json({ error: 'Invalid cookies format' });
    }

    const result = await authService.authenticateWithCookies(cookies);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Validate session
router.get('/validate', async (req, res, next) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (!sessionToken) {
      return res.status(401).json({ valid: false, message: 'No session token provided' });
    }

    const result = await authService.validateSession(sessionToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', async (req, res, next) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (sessionToken) {
      await authService.logout(sessionToken);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
