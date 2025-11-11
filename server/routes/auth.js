const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Login/Register
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // For MVP, accept any credentials and generate token
  const userId = email ? Buffer.from(email).toString('base64') : `user-${Date.now()}`;
  
  const token = jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    data: {
      token,
      userId
    }
  });
});

// Verify token
router.post('/verify', (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      data: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;
