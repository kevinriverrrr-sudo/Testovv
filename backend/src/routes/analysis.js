const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');
const { requireApiKey } = require('../middleware/auth');

// All analysis routes require API key
router.use(requireApiKey);

// Analyze prices for a product/category
router.post('/prices', async (req, res, next) => {
  try {
    const { productUrl, category } = req.body;
    
    if (!productUrl && !category) {
      return res.status(400).json({ error: 'Product URL or category is required' });
    }

    const result = await analysisService.analyzePrices(productUrl, category);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get recommended price
router.post('/recommend', async (req, res, next) => {
  try {
    const productData = req.body;
    
    if (!productData.prices || !Array.isArray(productData.prices)) {
      return res.status(400).json({ error: 'Prices array is required' });
    }

    const result = await analysisService.getRecommendedPrice(productData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Track competitor prices
router.get('/track/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const result = await analysisService.trackCompetitors(productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get price history
router.get('/history/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const result = await analysisService.getPriceHistory(productId, days);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Real-time price updates
router.get('/realtime/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const result = await analysisService.getRealtimePrice(productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Competitor comparison
router.post('/compare', async (req, res, next) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }

    const result = await analysisService.compareCompetitors(productIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
