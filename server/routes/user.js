const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  // In production, this would fetch from database using JWT token
  const mockProfile = {
    id: 'user-' + Date.now(),
    tier: 'free',
    dataLimit: 2 * 1024 * 1024 * 1024, // 2 GB
    dataUsed: 0,
    preferences: {
      theme: 'dark',
      autoConnect: false,
      killSwitch: true,
      splitTunneling: 'all-vpn',
      domains: [],
      smartDNS: true,
      antiCaptcha: true
    }
  };

  res.json({
    success: true,
    data: mockProfile
  });
});

// Update user profile
router.patch('/profile', (req, res) => {
  const updates = req.body;

  // In production, this would update database
  console.log('Profile updated:', updates);

  res.json({
    success: true
  });
});

// Upgrade tier
router.post('/upgrade', (req, res) => {
  const { tier } = req.body;

  if (!['premium', 'lifetime'].includes(tier)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid tier'
    });
  }

  // In production, this would:
  // 1. Verify payment with Stripe
  // 2. Update user tier in database
  // 3. Send confirmation email

  res.json({
    success: true,
    data: {
      tier,
      upgraded: true
    }
  });
});

module.exports = router;
