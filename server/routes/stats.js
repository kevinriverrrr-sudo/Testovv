const express = require('express');
const router = express.Router();

// Report usage stats (for data limit tracking)
router.post('/', (req, res) => {
  const { bytesIn, bytesOut } = req.body;

  // In production, this would save to database
  console.log(`Stats reported: ${bytesIn} bytes in, ${bytesOut} bytes out`);

  res.json({
    success: true
  });
});

module.exports = router;
