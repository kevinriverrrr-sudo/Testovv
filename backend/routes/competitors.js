import express from 'express';
import { scrapeCompetitors, trackCompetitor } from '../services/scraper.js';

const router = express.Router();

router.post('/scrape', async (req, res) => {
  try {
    const { category, limit = 50 } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const competitors = await scrapeCompetitors(category, limit);
    
    res.json({
      success: true,
      competitors,
      count: competitors.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Scrape competitors error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/track', async (req, res) => {
  try {
    const { url, seller } = req.body;

    if (!url || !seller) {
      return res.status(400).json({ error: 'URL and seller are required' });
    }

    const competitor = await trackCompetitor(url, seller);
    
    res.json({
      success: true,
      competitor,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Track competitor error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      competitor: {
        id,
        seller: 'Example Seller',
        rating: 4.5,
        reviews: 100,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
