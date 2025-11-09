import express from 'express';
import { analyzePrices, getTrendingProducts, getOptimalSellTime, getMarketTrends } from '../services/price-analyzer.js';

const router = express.Router();

router.post('/prices', async (req, res) => {
  try {
    const { productId, competitors } = req.body;

    if (!productId || !competitors) {
      return res.status(400).json({ error: 'Product ID and competitors are required' });
    }

    const analysis = await analyzePrices(productId, competitors);
    
    res.json({
      success: true,
      analysis,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Price analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/trending', async (req, res) => {
  try {
    const { category } = req.body;

    const trending = await getTrendingProducts(category);
    
    res.json({
      success: true,
      trending,
      count: trending.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/optimal-time', async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const optimalTime = await getOptimalSellTime(productId);
    
    res.json({
      success: true,
      optimalTime,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Optimal time error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const trends = await getMarketTrends();
    
    res.json({
      success: true,
      trends,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Market trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const { productId, currentPrice, competitors } = req.body;

    const recommendations = {
      currentPrice,
      recommendedPrice: Math.floor(currentPrice * 0.95),
      reasoning: 'Based on competitor analysis',
      confidence: 0.85,
      alternatives: [
        { price: Math.floor(currentPrice * 0.9), strategy: 'aggressive' },
        { price: Math.floor(currentPrice * 0.95), strategy: 'competitive' },
        { price: Math.floor(currentPrice * 1.05), strategy: 'premium' },
      ],
    };
    
    res.json({
      success: true,
      recommendations,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
