import express from 'express';

const router = express.Router();

router.post('/update', async (req, res) => {
  try {
    const { productId, newPrice } = req.body;

    if (!productId || !newPrice) {
      return res.status(400).json({ error: 'Product ID and new price are required' });
    }

    res.json({
      success: true,
      productId,
      newPrice,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bulk-update', async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const results = updates.map(update => ({
      productId: update.productId,
      success: true,
      newPrice: update.newPrice,
    }));

    res.json({
      success: true,
      results,
      count: results.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const history = [
      { price: 1000, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
      { price: 950, timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      { price: 920, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
      { price: 900, timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    ];

    res.json({
      success: true,
      productId,
      history,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
